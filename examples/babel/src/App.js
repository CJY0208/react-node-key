import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import KeepAlive, { AliveScope } from 'react-activation'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      count: {count}
      <button onClick={() => setCount((count) => count + 1)}>add</button>
    </div>
  )
}

function App() {
  const [show, setShow] = useState(true)

  return (
    <AliveScope>
      <button onClick={() => setShow((show) => !show)}>Toggle</button>
      <div>without {`<KeepAlive>`}</div>
      {show && <Counter />}
      <div>with {`<KeepAlive>`}</div>
      {show && (
        <KeepAlive>
          <Counter />
        </KeepAlive>
      )}
    </AliveScope>
  )
}

export default App; 
