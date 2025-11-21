
// import './App.css';

// function App() {
//   return (
//     <div>
//       <h1>Welcome to the Social Network App</h1>
//     </div>
//   );
// }

// export default App;
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Navbar from './pages/Navbar';
import  Allpost  from './pages/AllPost';
import PrivateRoute from './component/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/allposts" element={
            <PrivateRoute>
              <Allpost />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          } />
          <Route path="/home" element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
