import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { deleteOrder, listOrders } from '../actions/orderActions';
import { ORDER_DELETE_RESET } from '../constants/orderConstants';
import { downloadCSV, getComparator, isNewRow, normalize } from '../utils/adminTableUtils';
import { formatDateDay, formatName } from '../utils';
import LoadingBox from './LoadingBox';
import MessageBox from './MessageBox';
import StatusChip from './StatusChip';

export default function OrdersTable() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orderAdminList = useSelector((state) => state.orderAdminList);
  const { loading, orders, error } = orderAdminList;
  const orderDelete = useSelector((state) => state.orderDelete);
  const {
    loading: loadingDelete,
    success: successDelete,
    error: errorDelete,
  } = orderDelete;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortDir, setSortDir] = useState('desc');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    dispatch(listOrders());
    if (successDelete) {
      dispatch({ type: ORDER_DELETE_RESET });
    }
  }, [dispatch, successDelete]);

  const deleteHandler = (order) => {
    Swal.fire({
      title: `Delete ${formatName(order.shippingAddress.fullName)}'s Order?`,
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteOrder(order._id));
        const counter =
          Math.min(
            rowsPerPage,
            (orders && orders.length) - page * rowsPerPage
          ) - 1;
        if (counter === 0 && page !== 0) {
          setPage(page - 1);
        }
        Swal.fire("Deleted!", "", "success");
      }
    });
  };

  const handleSort = (col) => {
    if (orderBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setOrderBy(col); setSortDir('asc'); }
    setPage(0);
  };

  const filtered = useMemo(() => {
    let arr = orders ?? [];
    if (statusFilter) arr = arr.filter((o) => o.status === statusFilter);
    if (search) {
      const q = normalize(search);
      arr = arr.filter(
        (o) =>
          normalize(formatName(o.shippingAddress?.fullName ?? '')).includes(q) ||
          normalize(o.status ?? '').includes(q)
      );
    }
    return [...arr].sort(getComparator(sortDir, orderBy));
  }, [orders, search, statusFilter, sortDir, orderBy]);

  useEffect(() => { setPage(0); setSelected(new Set()); }, [search, statusFilter]);

  const visibleRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const visibleIds = visibleRows.map((r) => r._id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected((prev) => { const n = new Set(prev); visibleIds.forEach((id) => n.delete(id)); return n; });
    } else {
      setSelected((prev) => new Set([...prev, ...visibleIds]));
    }
  };
  const toggleSelect = (id) => {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const handleBulkDelete = () => {
    Swal.fire({
      title: `Delete ${selected.size} orders?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, delete all',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        selected.forEach((id) => dispatch(deleteOrder(id)));
        setSelected(new Set());
      }
    });
  };

  const handleExportCSV = () => {
    const headers = ['Customer', 'Date', 'Total (€)', 'Paid', 'Delivered', 'Status', 'Updated'];
    const rows = filtered.map((o) => [
      formatName(o.shippingAddress?.fullName),
      formatDateDay(o.createdAt),
      o.totalPrice?.toFixed(2),
      o.isPaid ? formatDateDay(o.paidAt) : 'No',
      o.isDelivered ? formatDateDay(o.deliveredAt) : 'No',
      o.status,
      formatDateDay(o.updatedAt),
    ]);
    downloadCSV(headers, rows, 'orders-export.csv');
  };

  const STATUS_FILTERS = ['', 'PENDING', 'PAID', 'SENT', 'DELIVERED', 'CANCELED'];
  const STATUS_LABELS  = { '': 'All', PENDING: 'Pending', PAID: 'Paid', SENT: 'Sent', DELIVERED: 'Delivered', CANCELED: 'Canceled' };

  return (
    <div className="orders-table" style={{ marginBottom: '50px' }}>
      <Paper className="paper" style={{ backgroundColor: '#F4F4F4' }}>
        {loadingDelete && <LoadingBox />}
        {errorDelete && <MessageBox variant="error">{errorDelete}</MessageBox>}
        {loading ? (
          <LoadingBox lineHeight="60vh" />
        ) : error ? (
          <MessageBox variant="error">{error}</MessageBox>
        ) : (
          <>
            {/* Toolbar */}
            <Toolbar sx={{ gap: 1, flexWrap: 'wrap', py: 1 }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                <b>Orders ({filtered.length})</b>
              </Typography>
              {selected.size > 0 && (
                <button className="dangerous-outline" onClick={handleBulkDelete}>
                  Delete {selected.size} selected
                </button>
              )}
              <TextField
                size="small"
                placeholder="Search customer, status…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.5, color: '#888' }} /> }}
                style={{ width: 220 }}
              />
              <Tooltip title="Export CSV">
                <IconButton onClick={handleExportCSV}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Toolbar>

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

            {/* Table */}
            <TableContainer sx={{ maxHeight: 520 }}>
              <Table className="table" stickyHeader aria-label="orders table">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox checked={allSelected} indeterminate={selected.size > 0 && !allSelected} onChange={toggleSelectAll} />
                    </TableCell>
                    {[
                      { id: 'shippingAddress.fullName', label: 'Customer' },
                      { id: 'createdAt', label: 'Date' },
                      { id: 'totalPrice', label: 'Total' },
                      { id: 'isPaid', label: 'Paid' },
                      { id: 'isDelivered', label: 'Delivered' },
                      { id: 'status', label: 'Status' },
                      { id: 'updatedAt', label: 'Updated' },
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
                    <TableCell align="right"><b>Actions</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4, color: '#888' }}>
                        No orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleRows.map((order) => (
                      <TableRow key={order._id} sx={isNewRow(order) ? { backgroundColor: 'rgba(34,139,34,0.08)' } : {}}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selected.has(order._id)} onChange={() => toggleSelect(order._id)} />
                        </TableCell>
                        <TableCell align="center">{formatName(order.shippingAddress.fullName)}</TableCell>
                        <TableCell align="center">{formatDateDay(order.createdAt)}</TableCell>
                        <TableCell align="center">{order.totalPrice?.toFixed(2)}€</TableCell>
                        <TableCell align="center">{order.isPaid ? formatDateDay(order.paidAt) : 'No'}</TableCell>
                        <TableCell align="center">{order.isDelivered ? formatDateDay(order.deliveredAt) : 'No'}</TableCell>
                        <TableCell align="center"><StatusChip status={order.status} /></TableCell>
                        <TableCell align="center">{formatDateDay(order.updatedAt)}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="View details">
                            <IconButton size="small" onClick={() => navigate(`/cart/order/${order._id}`)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
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
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filtered.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, p) => { setPage(p); setSelected(new Set()); }}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />
          </>
        )}
      </Paper>
    </div>
  );
}
