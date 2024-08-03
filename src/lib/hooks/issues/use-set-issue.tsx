import { useState } from 'react'

import { Issue } from '@aces/interfaces/issue'


interface useSetIssueProps {
  issue: Issue | null
}

function useSetIssue({ issue }: useSetIssueProps): void {
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null)
  setCurrentIssue(issue)
}

export default useSetIssue
