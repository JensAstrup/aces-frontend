import dayjs from 'dayjs'
import RelativeTime from 'dayjs/plugin/relativeTime'
import React from 'react'

import { Issue } from '@aces/app/voting/use-get-issues'

import { Comment } from './comment'
import { CommentForm } from './form'


dayjs.extend(RelativeTime)
interface CommentProps {
  issue?: Issue
}

interface IComment {
    id: number
    body: string
    createdAt: string
    user?: {
        id: number
        name: string
        avatarUrl: string
    }
    botActor?: {
        id: number
    }
}

const Comments: React.FC<CommentProps> = ({ issue }) => {
  if (!issue) {
    return
  }
  const comments: IComment[] = issue.comments.nodes as IComment[]
  const humanComments = comments.filter(comment => !comment.botActor)
  const commentComponents = humanComments.map((comment) => {
    const humanTime = dayjs(comment.createdAt).fromNow()
    return (
      <Comment
        avatarSrc={comment.user?.avatarUrl || ''}
        comment={comment.body}
        fallback=""
        key={comment.id}
        name={comment.user?.name || 'Unknown'}
        time={humanTime}
      />
    )
  })
  const noComments = <p className="text-sm">No comments yet</p>
  return (
    <div>
      <h2 className="text-2xl font-bold mt-5">Comments</h2>
      <div className="mt-3 space-y-4">
        {commentComponents.length > 0 ? commentComponents : noComments}
        <CommentForm />
      </div>
    </div>
  )
}

export { Comments }
