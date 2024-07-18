import React from 'react'


interface IssueDescriptionProps {
  description: string | null
}

const IssueDescription: React.FC<IssueDescriptionProps> = ({ description }) => {
  const descriptionText = description || 'No description provided.'
  const descriptionLines = descriptionText.split('\n')

  return (
    <div className="mt-2 prose text-muted-foreground">
      <p className="border rounded-md p-4 bg-muted/50 hover:bg-muted cursor-pointer">
        { descriptionLines.map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
      </p>
    </div>
  )
}

export default IssueDescription
