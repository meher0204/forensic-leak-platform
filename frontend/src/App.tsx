import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import LoginPage from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import UploadPage from "./pages/Upload"
import RecipientsPage from "./pages/Recipients"
import GenerateWatermarksPage from "./pages/GenerateWatermarks"
import DetectLeakPage from "./pages/DetectLeak"
import InvestigationReport from "./pages/InvestigationReport"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/recipients" element={<RecipientsPage />} />
              <Route path="/images/:imageId/watermark" element={<GenerateWatermarksPage />} />
              <Route path="/detect" element={<DetectLeakPage />} />
              <Route path="/investigations/:id" element={<InvestigationReport />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
