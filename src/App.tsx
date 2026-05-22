import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Projects from './components/Projects';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/panel" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
