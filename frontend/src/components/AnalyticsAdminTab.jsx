import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function AnalyticsAdminTab() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get(`/api/analytics/visitors?period=${period}`)
      .then((res) => {
        setCount(res.data.count);
      })
      .catch(() => {
        setError(t('admin.analyticsError'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [period, t]);

  const periods = [
    { value: '1h', label: t('admin.analyticsLastHour') },
    { value: '24h', label: t('admin.analyticsLast24Hours') },
    { value: '7d', label: t('admin.analyticsLast7Days') },
    { value: '14d', label: t('admin.analyticsLast14Days') },
    { value: '30d', label: t('admin.analyticsLast30Days') },
  ];

  return (
    <div style={{ marginTop: '25px', marginBottom: '50px' }}>
      <Paper className="paper" style={{ backgroundColor: '#F4F4F4' }}>
        <Toolbar>
          <Typography style={{ flexGrow: 1 }} className="title" variant="h6" component="div">
            <b>{t('admin.analytics')}</b>
          </Typography>
          <Tooltip title={open ? t('admin.collapse') : t('admin.expand')}>
            <IconButton onClick={() => setOpen((v) => !v)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
        <Collapse in={open}>
          <div
            style={{
              padding: '0 16px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
            }}
          >
            <FormControl size="small" style={{ minWidth: 180, alignSelf: 'flex-start' }}>
              <InputLabel>{t('admin.analyticsPeriod')}</InputLabel>
              <Select
                value={period}
                label={t('admin.analyticsPeriod')}
                onChange={(e) => setPeriod(e.target.value)}
                MenuProps={{ disableScrollLock: true }}
              >
                {periods.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {loading ? (
              <Skeleton variant="text" width={120} height={80} />
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <Typography variant="h2" component="p">
                  {count ?? '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('admin.analyticsVisitors')}
                </Typography>
              </div>
            )}
          </div>
        </Collapse>
      </Paper>
    </div>
  );
}
