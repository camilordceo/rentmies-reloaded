-- Migration 008: Atomic processing lock for conversation anti-spam
-- Replaces setTimeout-based accumulation with a database-level advisory lock.
-- Only one serverless invocation processes a conversation at a time;
-- subsequent arrivals within the window just save their message and return.

CREATE OR REPLACE FUNCTION acquire_processing_lock(
  p_conversacion_id UUID,
  p_window_ms INT DEFAULT 5000
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pending_since TIMESTAMPTZ;
  v_age_ms        FLOAT;
BEGIN
  -- Row-level lock: blocks concurrent calls on the same conversation row.
  -- NOWAIT raises an exception if another transaction holds the lock,
  -- which the caller catches and treats as "not acquired".
  SELECT (metadata->>'pending_since')::TIMESTAMPTZ
  INTO   v_pending_since
  FROM   conversacion
  WHERE  id = p_conversacion_id
  FOR UPDATE NOWAIT;

  IF v_pending_since IS NOT NULL THEN
    v_age_ms := EXTRACT(EPOCH FROM (NOW() - v_pending_since)) * 1000;
    IF v_age_ms < p_window_ms THEN
      -- Another invocation already holds the lock and is still within the window.
      RETURN jsonb_build_object('acquired', false, 'pending_since', v_pending_since);
    END IF;
  END IF;

  -- Acquire: stamp pending_since to NOW.
  UPDATE conversacion
  SET    metadata = metadata || jsonb_build_object('pending_since', NOW()::TEXT)
  WHERE  id = p_conversacion_id;

  RETURN jsonb_build_object('acquired', true, 'pending_since', NOW());
END;
$$;

CREATE OR REPLACE FUNCTION release_processing_lock(p_conversacion_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE conversacion
  SET    metadata = metadata - 'pending_since'
  WHERE  id = p_conversacion_id;
END;
$$;

GRANT EXECUTE ON FUNCTION acquire_processing_lock(UUID, INT) TO service_role;
GRANT EXECUTE ON FUNCTION release_processing_lock(UUID)       TO service_role;
