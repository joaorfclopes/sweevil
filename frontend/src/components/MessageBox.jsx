import CloseIcon from '@mui/icons-material/Close';
import $ from 'jquery';
import { useEffect, useState } from 'react';

export default function MessageBox(props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    if (!props.autoDismiss) return;
    const timer = setTimeout(() => setVisible(false), props.autoDismiss);
    return () => clearTimeout(timer);
  }, [props.children, props.autoDismiss]);

  if (!visible) return null;

  const hide = () => {
    $('.alert').hide();
  };

  return (
    <div className={`alert ${props.variant || 'info'}`}>
      {props.children}{' '}
      {props.dismissible && (
        <div style={{ float: 'right', cursor: 'pointer' }} onClick={hide}>
          <CloseIcon />
        </div>
      )}
    </div>
  );
}
