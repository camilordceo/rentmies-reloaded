const ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT!
const API_KEY = process.env.AZURE_OPENAI_API_KEY!
const DEPLOYMENT = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-3-small'
const API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2024-02-01'

export async function generateEmbedding(text: string): Promise<number[]> {
  const url = `${ENDPOINT}/openai/deployments/${DEPLOYMENT}/embeddings?api-version=${API_VERSION}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': API_KEY },
    body: JSON.stringify({ input: text.slice(0, 8000) }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Embeddings API ${res.status}: ${err}`)
  }
  const json = await res.json()
  return json.data[0].embedding as number[]
}
