import { Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import ChurchDetail from './components/ChurchDetail'
import Layout from './components/Layout'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/church/:id" element={<ChurchDetail />} />
      </Route>
    </Routes>
  )
}
