import React from 'react'
import Markdown from 'react-markdown'


interface IssueDescriptionProps {
  description?: string
}

const IssueDescription: React.FC<IssueDescriptionProps> = ({ description }) => {
  const descriptionText = description || 'No description provided.'

  return (
    <div className="mt-2 prose text-muted-foreground">
      <div className="border rounded-md p-4 bg-muted/50 hover:bg-muted cursor-pointer">
        <div className="prose prose-sm max-w-none dark-mode-invert">
          <Markdown>{descriptionText}</Markdown>
        </div>
      </div>
    </div>
  )
}

export default IssueDescription
