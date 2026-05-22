import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { notyf } from '../utils/notyf';
import LoadingOverlay from './LoadingOverlay';

export default function AboutAdminTab() {
  const { t } = useTranslation();
  const { userInfo } = useSelector((state) => state.userSignin);

  const [open, setOpen] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get('/api/about').then((res) => {
      setTitle(res.data.title || '');
      setBody(res.data.body || '');
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(
        '/api/about',
        { title, body },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      notyf.success(t('admin.aboutSaved'));
    } catch {
      notyf.error(t('admin.aboutSaveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginBottom: '50px' }}>
      <LoadingOverlay loading={saving}>
        <Paper className="paper" style={{ backgroundColor: '#F4F4F4' }}>
          <Toolbar>
            <Typography style={{ flexGrow: 1 }} className="title" variant="h6" component="div">
              <b>{t('admin.about')}</b>
            </Typography>
            <Tooltip title={open ? t('admin.collapse') : t('admin.expand')}>
              <IconButton onClick={() => setOpen((v) => !v)}>
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Tooltip>
          </Toolbar>
          <Collapse in={open}>
            <div
              style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <TextField
                label={t('admin.aboutTitle')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label={t('admin.aboutBody')}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                fullWidth
                multiline
                minRows={8}
                size="small"
                helperText={t('admin.aboutBodyHint')}
              />
              <div>
                <button className="primary" onClick={handleSave}>
                  {t('admin.save')}
                </button>
              </div>
            </div>
          </Collapse>
        </Paper>
      </LoadingOverlay>
    </div>
  );
}
