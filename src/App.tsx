import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPasswordPage from './pages/ForgotPassword' 
import HomePage from './pages/home'
import ManagePage from './pages/manage'
import ProfilePage from './pages/profile'
import DecisionPage from './pages/decision'
import PraisePage from './pages/praise'
import CertificatePage from './pages/certificate'
import ScorePage from './pages/score'
import EventPage from './pages/event'
import ScholarshipPage from './pages/scholarship'
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
          <Route path="/register" element={<Register messageApi={messageApi} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage messageApi={messageApi} />} />
          <Route path="/home" element={<HomePage messageApi={messageApi} />} />
          
          
          <Route path="/manage" element={<ManagePage messageApi={messageApi} />} />
          <Route path="/profile" element={<ProfilePage messageApi={messageApi} />} />
          <Route path="/decision" element={<DecisionPage messageApi={messageApi} />} />
          <Route path="/praise" element={<PraisePage messageApi={messageApi} />} />
          <Route path="/certificate" element={<CertificatePage messageApi={messageApi} />} />
          <Route path="/score" element={<ScorePage messageApi={messageApi} />} />
          <Route path="/event" element={<EventPage messageApi={messageApi} />} />
          <Route path="/scholarship" element={<ScholarshipPage messageApi={messageApi} />} />
          
         
          <Route path="/" element={<Login messageApi={messageApi} />} />
          <Route path="*" element={<Login messageApi={messageApi} />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App