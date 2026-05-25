import { useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Container, Button } from 'react-bootstrap';
import { auth, signOut } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { showSuccess, showError } from '../utils/toast';
import logo from '../assets/logo.png';

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
    <BSNavbar bg="white" variant="light" expand="lg" className="shadow-sm">
      <Container>
        <BSNavbar.Brand
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <img
            src={logo}
            alt="Bariatric Pathway"
            height="45"
            style={{ objectFit: 'contain' }}
          />
        </BSNavbar.Brand>

        <div className="d-flex align-items-center">
          {user && (
            <>
              <span className="text-muted me-3">
                {user.name || user.email}
              </span>
              <Button variant="outline-primary" size="sm" onClick={handleLogout}>
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