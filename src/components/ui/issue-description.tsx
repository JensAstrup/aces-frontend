import React from 'react'

import ViewDropdown from '@aces/components/view-dropdown'


const IssueDescription: React.FC = () => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Issue Description</h2>
        <ViewDropdown />
      </div>
      <div className="mt-2 prose text-muted-foreground">
        <p className="border rounded-md p-4 bg-muted/50 hover:bg-muted cursor-pointer">
          Implement a new feature that allows users to track their daily water intake. The feature should include
          the ability to log water consumption, set daily goals, and view historical data.
        </p>
      </div>
      <div className="flex items-center gap-2 mt-4" />
    </div>
  )
}

export { IssueDescription }
