import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import OrgPage from './pages/OrgPage';
import ResourcePage from './pages/ResourcePage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="org/:orgCode" element={<OrgPage />} />
        <Route path="resource/:id" element={<ResourcePage />} />
      </Route>
    </Routes>
  );
}

export default App;
