import { useState } from 'react'
import ThreeDee from './ThreeDee'

function App() {
  const data = [
    [1,6],
    [2,5],
    [3,7],
    [4,10]
  ]
  return (
    <ThreeDee>
      <ThreeDee.Plot 
        z={(m, b) => {
          let sumOfSquareErrors = 0;
          for (const [x, y] of data) {
            const predictedY = m * x + b;
            const error = y - predictedY;
            sumOfSquareErrors += error * error;
          }
          return sumOfSquareErrors;
        }}
      />
    </ThreeDee>
  )
}

export default App
