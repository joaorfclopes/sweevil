import Axios from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authClient } from '../lib/authClient';
import MessageBox from './MessageBox';

export default function PasskeyRegister() {
  const { t } = useTranslation();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const { data: session } = authClient.useSession();
  const { data: passkeys, isPending } = authClient.useListPasskeys();

  const handleRegister = async () => {
    setStatus('loading');
    setError('');
    try {
      const name = session?.user?.email || navigator.userAgent;
      const result = await authClient.passkey.addPasskey({ name });
      if (result?.error) {
        await Axios.delete('/api/users/passkey-challenge').catch(() => {});
        setStatus('error');
        setError(result.error.message || t('signin.failedPasskey'));
      }
    } catch (err) {
      await Axios.delete('/api/users/passkey-challenge').catch(() => {});
      setStatus('error');
      setError(err.message || t('signin.failedPasskey'));
    } finally {
      if (status !== 'error') setStatus('idle');
    }
  };

  if (isPending) return null;

  const hasPasskey = passkeys && passkeys.length > 0;

  return (
    <div>
      {status === 'error' && <MessageBox variant="error">{error}</MessageBox>}
      {hasPasskey ? (
        <div className="passkey-active-indicator">{t('admin.passkeyActive')}</div>
      ) : (
        <button className="secondary" onClick={handleRegister} disabled={status === 'loading'}>
          {status === 'loading' ? t('admin.registering') : t('admin.registerPasskey')}
        </button>
      )}
    </div>
  );
}
