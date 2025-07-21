import { memo, useState } from "react"

const ChildCounter = memo(({ label, count }: { label: string; count: number }) => {
  console.log(`🔄 ${label} Rendered`)
  return <p>{label}: {count}</p>
})

const ChildComponent = memo(
  () => {
  console.log('🔄ChildComponent Rendered')
  const [message, setMessage] = useState('beforeClick')
  return( 
    <div>
      <button onClick={() => setMessage('aferClick')}>Click Chage Message</button>
      Message : {message}
    </div>
  )
}
)

function App() {
  const [count1, setCount1] = useState(0)
  const [count2, setCount2] = useState(0)

  console.log("🔄 App Rendered")

  return (
    <div>
      <h1>Multi Counter</h1>
      <button onClick={() => setCount1(count1 + 1)}>Increase Counter 1</button>
      <button onClick={() => setCount2(count2 + 1)}>Increase Counter 2</button>

      <ChildCounter label="Counter 1" count={count1} />
      <ChildCounter label="Counter 2" count={count2} />

      <ChildComponent />
    </div>
  )
}

export default App
