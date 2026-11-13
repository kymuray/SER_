import Home from './pages/Home/Home'
import StudentAuth from './pages/StudentAuth/StudentAuth'

function App() {
  return window.location.pathname === '/entrar' ? <StudentAuth /> : <Home />
}

export default App
