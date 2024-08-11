import { Issue } from '@aces/interfaces/issue'


type SocketMessageType = 'vote' | 'issue' | 'round' | 'user'
type SocketMessageEvent = 'voteUpdated' | 'roundIssueUpdated' | 'response' | 'error'

interface SocketMessage {
    event: SocketMessageEvent
    type?: SocketMessageType
    payload: SockMessagePayload
}

interface SockMessagePayload {

}

interface VoteUpdatedPayload extends SockMessagePayload {
    issueId: string
    votes: number[]
    expectedVotes: number
}

interface VoteUpdatedMessage extends SocketMessage {
    event: 'voteUpdated'
    payload: VoteUpdatedPayload
}

interface RoundIssueMessage extends SocketMessage {
    event: 'roundIssueUpdated'
    payload: { issue: Issue, votes: number[], expectedVotes: number }
}

export default SocketMessage
export type { RoundIssueMessage, SockMessagePayload, SocketMessage, SocketMessageEvent, SocketMessageType, VoteUpdatedMessage, VoteUpdatedPayload }
