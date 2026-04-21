// src/pages/RegisterPage.jsx
import RegisterForm from '../components/Auth/RegisterForm.jsx';

/**
 * PASTE YOUR CLOUDINARY URL BELOW
 */
const CLOUDINARY_URL = 'https://res.cloudinary.com/ds1zdgdks/image/upload/v1776789963/Background_Image_b4d55d.jpg';

const RegisterPage = () => {
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
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;

