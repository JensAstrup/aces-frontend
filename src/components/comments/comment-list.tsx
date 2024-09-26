import dayjs from 'dayjs'
import RelativeTime from 'dayjs/plugin/relativeTime'
import React from 'react'

import { Issue } from '@aces/interfaces/issue'
import getHumanComments from '@aces/lib/utils/comments/get-human-comments'
import renderComment from '@aces/lib/utils/comments/render-comment'
import sortComments from '@aces/lib/utils/comments/sort-comments'


dayjs.extend(RelativeTime)

interface CommentProps {
  issue?: Issue
}

const CommentList: React.FC<CommentProps> = ({ issue }) => {
  if (!issue) {
    return
  }
  const comments = issue.comments.nodes
  const humanComments = getHumanComments(comments)
  const sortedComments = sortComments(humanComments)
  const commentComponents = sortedComments.map(renderComment) // Simplified

  return (
    <div>
      <h2 className="text-2xl font-bold mt-5">Comments</h2>
      <div className="mt-3 space-y-4">
        {commentComponents.length > 0 ? commentComponents : <p className="text-sm">No comments yet</p>}
      </div>
    </div>
  )
}

export { CommentList }
