import Chip from '@mui/material/Chip';
import { statusChipProps } from '../utils/adminTableUtils';

export default function StatusChip({ status }) {
  const { label, sx } = statusChipProps(status);
  return <Chip label={label} size="small" sx={sx} />;
}
