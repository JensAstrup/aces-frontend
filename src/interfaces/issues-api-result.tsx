import { Issue } from '@aces/interfaces/issue'


interface IssuesApiResult {
    issues: Issue[]
    nextPage: string | null
}

export type { IssuesApiResult }
