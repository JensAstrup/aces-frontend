import React from 'react'

import { Comment } from './comment'
import { CommentForm } from './form'


const Comments: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mt-5">Comments</h2>
      <div className="mt-3 space-y-4">
        <Comment
          avatarSrc="/placeholder-user.jpg"
          comment="Sounds like a great feature! I think it would be really helpful for users to be able to track their water intake and set daily goals."
          fallback="JD"
          name="John Doe"
          time="2 days ago"
        />
        <Comment
          avatarSrc="/placeholder-user.jpg"
          comment="I agree, this would be a really useful feature. I'm especially excited about the historical data tracking aspect."
          fallback="JA"
          name="Jane Appleseed"
          time="3 days ago"
        />
        <CommentForm />
      </div>
    </div>
  )
}

export { Comments }
