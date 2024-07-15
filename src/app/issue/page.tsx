import { Comments } from '@aces/components/ui/comments/comments'
import { IssueDescription } from '@aces/components/ui/issue-description'
import { Stats } from '@aces/components/ui/stats'
import { Estimate } from '@aces/components/ui/estimate'
import { Votes } from '@aces/components/ui/votes'


const IssuePage: React.FC = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6 lg:gap-12 items-start max-w-6xl px-4 mx-auto py-6">
      <div className="space-y-6">
        <IssueDescription />
        <Comments />
      </div>
      <div className="space-y-8">
        <Estimate />
        <Votes />
        <Stats />
      </div>
    </div>
  )
}

export default IssuePage
