import { Button } from '@aces/components/ui/button'


function Estimate() {
  const handleEstimate = (point: number) => {
    console.log('point', point)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Estimate</h2>
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2, 3, 5, 8].map(point => (
          <Button
            data-point={point}
            key={point}
            onClick={() => {
              handleEstimate(point)
            }}
            size="lg"
          >
            {point}
          </Button>
        ))}
      </div>
    </div>
  )
}

export { Estimate }
