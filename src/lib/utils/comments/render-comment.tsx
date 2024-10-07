import dayjs from 'dayjs'

import { Comment } from '@aces/components/comments/comment'
import { Comment as CommentInterface } from '@aces/interfaces/comment'


const renderComment = (comment: CommentInterface) => {
  const humanTime = dayjs(comment.createdAt).fromNow()
  const separatedName = comment.user?.name.split(' ') || ['Unknown']
  // If the user has a first and last name, use the first letter of each to create the fallback avatar
  const avatarFallback = separatedName.length > 1 ? separatedName[0][0] + separatedName[1][0] : separatedName[0][0]

  return (
    <Comment
      avatarSrc={comment.user?.avatarUrl || ''}
      comment={comment.body}
      fallback={avatarFallback}
      key={comment.id}
      name={comment.user?.name || 'Unknown'}
      time={humanTime}
    />
  )
}

export default renderComment
