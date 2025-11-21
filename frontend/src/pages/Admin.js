import { useEffect } from 'react';

const Admin = () => {
  useEffect(() => {
    // Redirect to Django admin interface
    window.location.href = 'http://127.0.0.1:8000/api/';
  }, []);

  return (
    <div>
      Redirecting to admin interface...
    </div>
  );
};

export default Admin;
