import Axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import MessageBox from '../components/MessageBox';
import { USER_SIGNIN_SUCCESS } from '../constants/userConstants';
import { authClient } from '../lib/authClient';

export default function SigninScreen(props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { userInfo } = useSelector((state) => state.userSignin);

  const redirect = location.search ? location.search.split('=')[1] : '/admin';

  const handlePasskeySignin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await authClient.signIn.passkey();
      if (result?.error) {
        await Axios.delete('/api/users/passkey-signin-challenge').catch(() => {});
        setError(result.error.message || t('signin.failedPasskey'));
        return;
      }
      const session = await authClient.getSession();
      if (!session?.data?.user) throw new Error(t('signin.failed'));
      const { user } = session.data;
      const userInfo = {
        _id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.role === 'admin',
      };
      dispatch({ type: USER_SIGNIN_SUCCESS, payload: userInfo });
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    } catch (err) {
      await Axios.delete('/api/users/passkey-signin-challenge').catch(() => {});
      setError(err.message || t('signin.failedPasskey'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignin = () => {
    authClient.signIn.social({
      provider: 'google',
      callbackURL: `${window.location.origin}/admin`,
    });
  };

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [userInfo, navigate, redirect]);

  return (
    <section className="signin">
      <button className="back-button" onClick={() => navigate(-1)}>
        &#8592;
      </button>
      <div className="row center signin-container">
        <div className="signin-inner">
          <h1>{t('signin.title')}</h1>
          {error && <MessageBox variant="error">{error}</MessageBox>}
          <button
            className="primary"
            style={{ width: '100%', marginBottom: '1rem' }}
            onClick={handleGoogleSignin}
          >
            {t('signin.signInGoogle')}
          </button>
          <button
            className="secondary"
            style={{ width: '100%', marginBottom: '1.5rem' }}
            onClick={handlePasskeySignin}
            disabled={loading}
          >
            {loading ? t('signin.loading') : t('signin.signIn')}
          </button>
        </div>
      </div>
    </section>
  );
}
