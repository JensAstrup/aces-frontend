import { Comment } from '@aces/interfaces/comment'


function getHumanComments(comments: Comment[]) {
  return comments.filter(comment => !comment.botActor)
}

export default getHumanComments
