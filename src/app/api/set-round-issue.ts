async function setRoundIssue(roundId: string, issueId: number) {
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
  const NO_CONTENT = 204
  if (response.status !== NO_CONTENT) {
    throw new Error('Failed to set issue')
  }
}

export default setRoundIssue
