import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import AppLayout from './components/AppLayout'
// @ts-ignore
import Dashboard from './pages/Dashboard'
// @ts-ignore
import Billing from './pages/Billing.tsx'
// @ts-ignore
import History from './pages/History'
// @ts-ignore
import Orders from './pages/Orders'
// @ts-ignore
import Products from './pages/Products'
// @ts-ignore
import Profile from './pages/Profile'
// @ts-ignore
import Login from './pages/Login'

function App() {
  return (
    <ThemeProvider>
      <div className="font-body antialiased">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="billing" element={<Billing />} />
            <Route path="history" element={<History />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default App 