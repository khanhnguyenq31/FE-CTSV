import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from './pages/home'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Login />
    </QueryClientProvider>
  )
}

export default App