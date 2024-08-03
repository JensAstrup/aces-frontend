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
}

interface VoteUpdatedMessage extends SocketMessage {
    event: 'voteUpdated'
    payload: VoteUpdatedPayload
}

interface RoundIssueChangedMessage extends SocketMessage {
    event: 'roundIssueUpdated'
    payload: Issue
}

export default SocketMessage
export type { RoundIssueChangedMessage, SockMessagePayload, SocketMessage, SocketMessageEvent, SocketMessageType, VoteUpdatedMessage, VoteUpdatedPayload }
