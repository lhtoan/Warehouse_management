import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/Login/Login';
import Layout from './components/Layout';
import Home from './pages/Home/Home';
import Product from './pages/Product/Product';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Các route bên trong Layout có Sidebar */}
        <Route path="/" element={<Layout />}>
          <Route path="home" element={<Home />} />
          <Route path="products" element={<Product />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
