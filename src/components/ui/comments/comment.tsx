import React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@aces/components/ui/avatar'


interface CommentItemProps {
  avatarSrc: string
  fallback: string
  name: string
  time: string
  comment: string
}

const Comment: React.FC<CommentItemProps> = ({ avatarSrc, fallback, name, time, comment }) => {
  return (
    <div className="flex items-start gap-4">
      <Avatar className="w-10 h-10">
        <AvatarImage src={avatarSrc} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between">
          <div className="font-medium flex-1">{name}</div>
          <div className="text-xs text-muted-foreground text-right">{time}</div>
        </div>
        <div className="prose text-muted-foreground">
          <p>{comment}</p>
        </div>
      </div>
    </div>
  )
}

export { Comment }
