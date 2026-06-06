import Popover from '@mui/material/Popover';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function ShippingInfoTooltip({ namespace }) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <>
      <button
        className="shipping-info-btn"
        onClick={(e) => {
          e.preventDefault();
          setAnchorEl(e.currentTarget);
        }}
        aria-label="Shipping info"
        type="button"
      >
        ⓘ
      </button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        disableScrollLock
      >
        <p className="shipping-info-popover">
          {t(`${namespace}.shippingTooltipText`)}{' '}
          <Link to="/terms-and-conditions" onClick={() => setAnchorEl(null)}>
            {t(`${namespace}.shippingTooltipLink`)}
          </Link>
        </p>
      </Popover>
    </>
  );
}
