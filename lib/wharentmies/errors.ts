export class ProviderError extends Error {
  constructor(
    public readonly provider: string,
    message: string,
    public readonly statusCode?: number
  ) {
    super(`[${provider}] ${message}`)
    this.name = 'ProviderError'
  }
}

export class ProviderAuthError extends ProviderError {
  constructor(provider: string) {
    super(provider, 'Authentication failed — check API token', 401)
    this.name = 'ProviderAuthError'
  }
}

export class ProviderQuotaError extends ProviderError {
  constructor(provider: string) {
    super(provider, 'Plan quota exceeded', 402)
    this.name = 'ProviderQuotaError'
  }
}

export class ProviderValidationError extends ProviderError {
  constructor(provider: string, public readonly fields: unknown) {
    super(provider, `Validation error: ${JSON.stringify(fields)}`, 422)
    this.name = 'ProviderValidationError'
  }
}

export class ProviderRateLimitError extends ProviderError {
  constructor(provider: string, public readonly retryAfterMs: number) {
    super(provider, `Rate limited — retry after ${retryAfterMs}ms`, 429)
    this.name = 'ProviderRateLimitError'
  }
}

export class ProviderServerError extends ProviderError {
  constructor(provider: string, statusCode: number, body: string) {
    super(provider, `Server error ${statusCode}: ${body.slice(0, 120)}`, statusCode)
    this.name = 'ProviderServerError'
  }
}
