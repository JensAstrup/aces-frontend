async function createRound(): Promise<string | null> {
  const accessToken = localStorage.getItem('accessToken')
  if (!accessToken) {
    throw new Error('No access token found')
  }
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rounds/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken
      },
    })
    const data = await response.json()
    localStorage.setItem('round', data.id)
    return data.id
  }
  catch (error) {
    throw new Error('Failed to create round')
  }
}

export default createRound
