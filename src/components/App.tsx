import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import 'twin.macro';
import Navbar from './Navbar';
import HomePage from './pages/HomePage';
import SubmitPage from './pages/SubmitPage';

export default function App() {
  return (
    <Router>
      <div tw="w-screen min-h-screen overflow-x-hidden">
        <Navbar />
        <div tw="max-w-[800px] h-full mx-auto p-2 sm:p-4 mt-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/submit" element={<SubmitPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
