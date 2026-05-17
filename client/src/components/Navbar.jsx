import { useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Container, Button } from 'react-bootstrap';
import { auth, signOut } from '../config/firebase';

function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);

      navigate('/login');

    } catch (error) {
      console.error('Logout error:', error);
      // force login
      navigate('/login');
    }
  };
  return (
    <BSNavbar bg="primary" variant="dark" expand="lg">
      <Container>
        <BSNavbar.Brand href="/">BariatricPath</BSNavbar.Brand>

        <div className="d-flex align-items-center">
          {user && (
            <>
              <span className="text-white me-3">
                {user.name || user.email}
              </span>
              <Button
                variant="outline-light"
                size="sm"
                onClick={handleLogout}
              >
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