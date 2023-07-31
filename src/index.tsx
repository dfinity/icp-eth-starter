import { MetaMaskProvider } from 'metamask-react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import App from './components/App';

import 'react-toastify/dist/ReactToastify.css';
import 'tippy.js/dist/tippy.css';
import 'twin.macro';
import './setupApp';
import './styles/index.scss';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

root.render(
  <MetaMaskProvider>
    <ToastContainer position="bottom-right" />
    <App />
  </MetaMaskProvider>,
);
