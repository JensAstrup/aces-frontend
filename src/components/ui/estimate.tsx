import { Button } from '@aces/components/ui/button'


const Estimate: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold">Estimate</h2>
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2, 3, 5, 8].map(point => (
          <Button key={point} size="lg">{point}</Button>
        ))}
      </div>
    </div>
  )
}

export { Estimate }
