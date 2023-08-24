import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './Navbar';
import HomePage from './pages/HomePage';
import VerifyPage from './pages/VerifyPage';
import { MetaMaskProvider } from 'metamask-react';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import 'tippy.js/dist/tippy.css';
import 'twin.macro';
import './setupApp';
import './styles/index.scss';

export default function App() {
  return (
    <MetaMaskProvider>
      <ToastContainer position="bottom-right" />
      <Router>
        <div tw="w-screen min-h-screen overflow-x-hidden">
          <Navbar />
          <div tw="max-w-[800px] h-full mx-auto p-2 sm:p-4 mt-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/verify" element={<VerifyPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </MetaMaskProvider>
  );
}
