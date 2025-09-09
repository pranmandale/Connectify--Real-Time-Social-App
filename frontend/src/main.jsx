import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import store from './store/store.jsx'
import {Provider} from "react-redux"
import {Toaster} from "react-hot-toast"
import {BrowserRouter} from "react-router-dom"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Provider store={store}>
      <Toaster position="top-center" reverseOrder={false} />
    <App />
    </Provider>
    </BrowserRouter>
  </StrictMode>,
)
