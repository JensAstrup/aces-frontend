import React from 'react'

import { Avatar, AvatarFallback } from '@aces/components/ui/avatar'
import { Button } from '@aces/components/ui/button'
import { Textarea } from '@aces/components/ui/textarea'


const CommentForm: React.FC = () => {
  return (
    <div className="flex items-start gap-4">
      <Avatar className="w-10 h-10">
        <AvatarFallback>YS</AvatarFallback>
      </Avatar>
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">Just now</div>
        </div>
        <div className="prose text-muted-foreground">
          <Textarea className="min-h-[100px] w-full" placeholder="Add a new comment..." />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost">Cancel</Button>
          <Button>Submit</Button>
        </div>
      </div>
    </div>
  )
}

export { CommentForm }
