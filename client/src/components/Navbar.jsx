import { useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Container, Button } from 'react-bootstrap';
import { auth, signOut } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { showSuccess, showError } from '../utils/toast';

function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);

      setUser(null);

      showSuccess('You have been logged out');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      showError('Logout failed, redirecting anyway');
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <BSNavbar bg="primary" variant="dark" expand="lg">
      <Container>
        <BSNavbar.Brand
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          BariatricPath
        </BSNavbar.Brand>

        <div className="d-flex align-items-center">
          {user && (
            <>
              <span className="text-white me-3">
                {user.name || user.email}
              </span>
              <Button variant="outline-light" size="sm" onClick={handleLogout}>
                Sign Out
              </Button>
            </>
          )}
        </div>
      </Container>
    </BSNavbar>
  );
}

export default Navbar;