// src/pages/LoginPage.jsx
import LoginForm from '../components/Auth/LoginForm.jsx';

/**
 * PASTE YOUR CLOUDINARY URL BELOW
 */
const CLOUDINARY_URL = 'https://res.cloudinary.com/ds1zdgdks/image/upload/v1776789967/Background_image_2_fpvwct.jpg';

const LoginPage = () => {
  return (
    <div
      className="auth-page-container"
      style={{
        backgroundImage: `url(${CLOUDINARY_URL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
      }}
    >
      <LoginForm />
    </div>
  );
};

export default LoginPage;

