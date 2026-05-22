import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteOrder, listOrders, refundOrder } from '../actions/orderActions';
import { ORDER_DELETE_RESET, ORDER_REFUND_RESET } from '../constants/orderConstants';
import { formatDateDay, formatName } from '../utils';
import { downloadCSV, getComparator, isNewRow } from '../utils/adminTableUtils';
import Swal from '../utils/swal';
import LoadingOverlay from './LoadingOverlay';
import MessageBox from './MessageBox';
import StatusChip from './StatusChip';

export default function OrdersTable() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orderAdminList = useSelector((state) => state.orderAdminList);
  const { loading, orders, error, total = 0 } = orderAdminList;
  const orderDelete = useSelector((state) => state.orderDelete);
  const { loading: loadingDelete, success: successDelete, error: errorDelete } = orderDelete;
  const orderRefund = useSelector((state) => state.orderRefund);
  const { loading: loadingRefund, success: successRefund, error: errorRefund } = orderRefund;

  const [open, setOpen] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortDir, setSortDir] = useState('desc');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(0);
    setSelected(new Set());
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    if (successDelete) dispatch({ type: ORDER_DELETE_RESET });
    if (successRefund) dispatch({ type: ORDER_REFUND_RESET });
    dispatch(
      listOrders({
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch,
        status: statusFilter,
      })
    );
  }, [dispatch, successDelete, successRefund, page, rowsPerPage, debouncedSearch, statusFilter]);

  const deleteHandler = (order) => {
    Swal.fire({
      title: t('order.deleteTitle'),
      showCancelButton: true,
      confirmButtonText: t('common.yes'),
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteOrder(order._id));
        Swal.fire(t('admin.deletedSuccess'), '', 'success');
      }
    });
  };

  const refundHandler = (order) => {
    Swal.fire({
      title: `Refund €${order.totalPrice?.toFixed(2)} to ${formatName(order.shippingAddress.fullName)}?`,
      text: t('admin.refundText'),
      showCancelButton: true,
      confirmButtonText: t('admin.refundBtn'),
      confirmButtonColor: '#1976d2',
    }).then((result) => {
      if (result.isConfirmed) dispatch(refundOrder(order._id));
    });
  };

  const handleSort = (col) => {
    if (orderBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setOrderBy(col);
      setSortDir('asc');
    }
    setPage(0);
  };

  const filtered = useMemo(
    () => [...(orders ?? [])].sort(getComparator(sortDir, orderBy)),
    [orders, sortDir, orderBy]
  );

  const visibleIds = filtered.map((r) => r._id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const n = new Set(prev);
        visibleIds.forEach((id) => n.delete(id));
        return n;
      });
    } else {
      setSelected((prev) => new Set([...prev, ...visibleIds]));
    }
  };
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const handleBulkDelete = () => {
    Swal.fire({
      title: t('admin.deleteOrdersTitle', { count: selected.size }),
      showCancelButton: true,
      confirmButtonText: t('admin.deleteOrdersBtn'),
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        selected.forEach((id) => dispatch(deleteOrder(id)));
        setSelected(new Set());
      }
    });
  };

  const handleExportCSV = () => {
    const headers = [
      t('admin.colName'),
      t('admin.colDate'),
      `${t('admin.colTotal')} (€)`,
      t('status.PAID'),
      t('status.DELIVERED'),
      t('admin.colStatus'),
      t('admin.colUpdated'),
    ];
    const rows = filtered.map((o) => [
      formatName(o.shippingAddress?.fullName),
      formatDateDay(o.createdAt),
      o.totalPrice?.toFixed(2),
      o.isPaid ? formatDateDay(o.paidAt) : t('common.no'),
      o.isDelivered ? formatDateDay(o.deliveredAt) : t('common.no'),
      o.status,
      formatDateDay(o.updatedAt),
    ]);
    downloadCSV(headers, rows, 'orders-export.csv');
  };

  const STATUS_FILTERS = [
    '',
    'PENDING',
    'PAID',
    'SENT',
    'DELIVERED',
    'CANCELED',
    'CANCELED_REFUNDED',
    'CANCELED_NO_REFUND',
    'CANCELED_PENDING_REFUND',
  ];
  const STATUS_LABELS = {
    '': t('admin.all'),
    PENDING: t('status.PENDING'),
    PAID: t('status.PAID'),
    SENT: t('status.SENT'),
    DELIVERED: t('status.DELIVERED'),
    CANCELED: t('status.CANCELED'),
    CANCELED_REFUNDED: t('status.CANCELED_REFUNDED'),
    CANCELED_NO_REFUND: t('status.CANCELED_NO_REFUND'),
    CANCELED_PENDING_REFUND: t('status.CANCELED_PENDING_REFUND'),
  };

  return (
    <div className="orders-table" style={{ marginBottom: '50px' }}>
      <LoadingOverlay loading={loadingDelete}>
        <Paper className="paper" style={{ backgroundColor: '#F4F4F4' }}>
          {errorDelete && <MessageBox variant="error">{errorDelete}</MessageBox>}
          {errorRefund && <MessageBox variant="error">{errorRefund}</MessageBox>}
          <>
            {/* Toolbar */}
            <Toolbar sx={{ flexDirection: 'column', alignItems: 'stretch', py: 1, gap: 1 }}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setOpen((v) => !v)}
              >
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  <b>{t('admin.ordersTitle', { count: total })}</b>
                </Typography>
                <IconButton tabIndex={-1}>
                  {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              </Box>
              {open && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {selected.size > 0 && (
                    <button className="dangerous-outline" onClick={handleBulkDelete}>
                      {t('admin.deleteSelected', { count: selected.size })}
                    </button>
                  )}
                  <TextField
                    size="small"
                    placeholder={t('admin.searchOrders')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <SearchIcon fontSize="small" sx={{ mr: 0.5, color: '#888' }} />
                        ),
                      },
                    }}
                    sx={{ flexGrow: 1 }}
                  />
                  <Tooltip title={t('admin.exportCsv')}>
                    <IconButton onClick={handleExportCSV}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Toolbar>

            <Collapse in={open}>
              {/* Status filter chips */}
              <div style={{ display: 'flex', gap: 6, padding: '0 16px 12px', flexWrap: 'wrap' }}>
                {STATUS_FILTERS.map((s) => (
                  <Chip
                    key={s || 'all'}
                    label={STATUS_LABELS[s]}
                    size="small"
                    onClick={() => setStatusFilter(s)}
                    variant={statusFilter === s ? 'filled' : 'outlined'}
                    sx={statusFilter === s ? { backgroundColor: '#1a1a1a', color: '#fff' } : {}}
                  />
                ))}
              </div>

              {error ? (
                <MessageBox variant="error">{error}</MessageBox>
              ) : (
                <>
                  {/* Table */}
                  <TableContainer sx={{ maxHeight: 520 }}>
                    <Table className="table" stickyHeader aria-label="orders table">
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={allSelected}
                              indeterminate={selected.size > 0 && !allSelected}
                              onChange={toggleSelectAll}
                            />
                          </TableCell>
                          {[
                            { id: 'shippingAddress.fullName', label: t('admin.colName') },
                            { id: 'createdAt', label: t('admin.colDate') },
                            { id: 'totalPrice', label: t('admin.colTotal') },
                            { id: 'isPaid', label: t('status.PAID') },
                            { id: 'isDelivered', label: t('status.DELIVERED') },
                            { id: 'status', label: t('admin.colStatus') },
                            { id: 'updatedAt', label: t('admin.colUpdated') },
                          ].map(({ id, label }) => (
                            <TableCell key={id} align="center">
                              <TableSortLabel
                                active={orderBy === id}
                                direction={orderBy === id ? sortDir : 'asc'}
                                onClick={() => handleSort(id)}
                              >
                                <b>{label}</b>
                              </TableSortLabel>
                            </TableCell>
                          ))}
                          <TableCell align="right">
                            <b>{t('admin.actions')}</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i} sx={{ height: 56 }}>
                              {Array.from({ length: 9 }).map((_, j) => (
                                <TableCell key={j}>
                                  <Skeleton animation="wave" />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : filtered.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} align="center" sx={{ py: 4, color: '#888' }}>
                              {t('admin.noOrdersFound')}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filtered.map((order) => (
                            <TableRow
                              key={order._id}
                              sx={
                                isNewRow(order) ? { backgroundColor: 'rgba(34,139,34,0.08)' } : {}
                              }
                            >
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={selected.has(order._id)}
                                  onChange={() => toggleSelect(order._id)}
                                />
                              </TableCell>
                              <TableCell align="center">
                                {formatName(order.shippingAddress.fullName)}
                              </TableCell>
                              <TableCell align="center">{formatDateDay(order.createdAt)}</TableCell>
                              <TableCell align="center">{order.totalPrice?.toFixed(2)}€</TableCell>
                              <TableCell align="center">
                                {order.isPaid ? formatDateDay(order.paidAt) : t('common.no')}
                              </TableCell>
                              <TableCell align="center">
                                {order.isDelivered
                                  ? formatDateDay(order.deliveredAt)
                                  : t('common.no')}
                              </TableCell>
                              <TableCell align="center">
                                <StatusChip status={order.status} />
                              </TableCell>
                              <TableCell align="center">{formatDateDay(order.updatedAt)}</TableCell>
                              <TableCell align="right">
                                <Tooltip title={t('admin.viewDetails')}>
                                  <IconButton
                                    size="small"
                                    onClick={() => navigate(`/cart/order/${order.confirmToken}`)}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                {order.status === 'CANCELED_PENDING_REFUND' && (
                                  <Tooltip title={t('order.issueRefundBtn')}>
                                    <IconButton
                                      size="small"
                                      onClick={() => refundHandler(order)}
                                      disabled={loadingRefund}
                                    >
                                      <CurrencyExchangeIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title={t('admin.deleteProduct')}>
                                  <IconButton size="small" onClick={() => deleteHandler(order)}>
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[10, 20, 50, 100]}
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, p) => {
                      setPage(p);
                      setSelected(new Set());
                    }}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                  />
                </>
              )}
            </Collapse>
          </>
        </Paper>
      </LoadingOverlay>
    </div>
  );
}
