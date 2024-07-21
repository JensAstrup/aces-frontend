import { Issue } from '@aces/app/interfaces/issue'


interface IssuesApiResult {
    issues: Issue[]
    nextPage: string | null
}

export type { IssuesApiResult }
