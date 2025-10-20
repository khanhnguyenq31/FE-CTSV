import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import HomePage from './pages/home'
import { message as antdMessage } from 'antd'

const queryClient = new QueryClient()

function App() {
  const [messageApi, contextHolder] = antdMessage.useMessage();

  return (
    <QueryClientProvider client={queryClient}>
      {contextHolder}
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login messageApi={messageApi} />} />
          <Route path="/home" element={<HomePage messageApi={messageApi} />} />
          <Route path="*" element={<Login messageApi={messageApi} />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App