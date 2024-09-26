import dayjs from 'dayjs'

import { Comment } from '@aces/interfaces/comment'


function sortComments(comments: Comment[]): Comment[] {
  // Sort comments by createdAt, descending (newest at the top)
  return comments.sort((comment1, comment2) => {
    return dayjs(comment1.createdAt).unix() - dayjs(comment2.createdAt).unix()
  })
}

export default sortComments
