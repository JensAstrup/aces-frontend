async function setRoundIssue(roundId: string, issueId: string) {
  const accessToken = localStorage.getItem('accessToken')
  if (!accessToken) {
    throw new Error('No access token found')
  }
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rounds/${roundId}/issue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': accessToken
    },
    body: JSON.stringify({ issue: issueId })
  })
  if (!response.ok) {
    throw new Error('Failed to set issue')
  }
}

export default setRoundIssue
