import BlockIcon from '@mui/icons-material/Block';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Checkbox,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { DateCalendar, LocalizationProvider, PickersDay } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import isURL from 'validator/lib/isURL';
import {
  cancelBooking,
  createAvailability,
  deleteAvailability,
  deleteBooking,
  listAvailability,
  listBookings,
  updateAvailability,
} from '../actions/bookingActions';
import {
  AVAILABILITY_CREATE_RESET,
  AVAILABILITY_DELETE_RESET,
  AVAILABILITY_UPDATE_RESET,
  BOOKING_CANCEL_RESET,
  BOOKING_DELETE_RESET,
} from '../constants/bookingConstants';
import { formatDateDay } from '../utils.js';
import { downloadCSV, getComparator, isNewRow, normalize } from '../utils/adminTableUtils';
import LoadingBox from './LoadingBox';
import MessageBox from './MessageBox';
import StatusChip from './StatusChip';

function AvailableDay(props) {
  const { availableDates, day, outsideCurrentMonth, ...other } = props;
  const dateStr = dayjs(day).format('YYYY-MM-DD');
  const isAvailable = availableDates.includes(dateStr);
  return (
    <PickersDay
      {...other}
      outsideCurrentMonth={outsideCurrentMonth}
      day={day}
      sx={
        isAvailable && !outsideCurrentMonth
          ? {
              backgroundColor: 'rgba(34,139,34,0.15)',
              '&:hover': { backgroundColor: 'rgba(34,139,34,0.25)' },
              '&.Mui-selected': { backgroundColor: '#228B22' },
            }
          : {}
      }
    />
  );
}

export default function BookingsAdminTab() {
  const dispatch = useDispatch();

  const bookingList = useSelector((s) => s.bookingList);
  const { loading: loadingBookings, bookings = [], error: errorBookings } = bookingList;

  const bookingCancel = useSelector((s) => s.bookingCancel);
  const { success: successCancel } = bookingCancel;

  const bookingDelete = useSelector((s) => s.bookingDelete);
  const { success: successDelete } = bookingDelete;

  const availabilityList = useSelector((s) => s.availabilityList);
  const { loading: loadingAvail, availability = [], error: errorAvail } = availabilityList;

  const availabilityCreate = useSelector((s) => s.availabilityCreate);
  const { success: successCreate, error: errorCreate } = availabilityCreate;

  const availabilityUpdate = useSelector((s) => s.availabilityUpdate);
  const { success: successUpdate, error: errorUpdate } = availabilityUpdate;

  const availabilityDelete = useSelector((s) => s.availabilityDelete);
  const { success: successAvailDelete } = availabilityDelete;

  const [sectionOpen, setSectionOpen] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [photosDialog, setPhotosDialog] = useState({ open: false, images: [], name: '' });
  const [notesDialog, setNotesDialog] = useState({ open: false, notes: '', name: '' });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAvail, setEditingAvail] = useState(null);
  const [dialogDate, setDialogDate] = useState(null);
  const [slotsInput, setSlotsInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [priceEditing, setPriceEditing] = useState(false);
  const [dialogError, setDialogError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortDir, setSortDir] = useState('desc');
  const [orderBy, setOrderBy] = useState('date');
  const [selected, setSelected] = useState(new Set());
  const [expanded, setExpanded] = useState(new Set());

  useEffect(() => {
    dispatch(listBookings());
    dispatch(listAvailability());
  }, [dispatch]);

  useEffect(() => {
    if (successCancel || successDelete) {
      dispatch({ type: BOOKING_CANCEL_RESET });
      dispatch({ type: BOOKING_DELETE_RESET });
      dispatch(listBookings());
    }
  }, [dispatch, successCancel, successDelete]);

  useEffect(() => {
    if (successCreate || successUpdate || successAvailDelete) {
      dispatch({ type: AVAILABILITY_CREATE_RESET });
      dispatch({ type: AVAILABILITY_UPDATE_RESET });
      dispatch({ type: AVAILABILITY_DELETE_RESET });
      dispatch(listAvailability());
      setDialogOpen(false);
    }
  }, [dispatch, successCreate, successUpdate, successAvailDelete]);

  const availMap = {};
  availability.forEach((a) => {
    availMap[dayjs(a.date).format('YYYY-MM-DD')] = a;
  });
  const availableDates = Object.keys(availMap);

  const handleSort = (col) => {
    if (orderBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setOrderBy(col);
      setSortDir('asc');
    }
    setPage(0);
  };

  const filteredBookings = useMemo(() => {
    let arr = bookings ?? [];
    if (statusFilter) arr = arr.filter((b) => b.status === statusFilter);
    if (search) {
      const q = normalize(search);
      arr = arr.filter(
        (b) =>
          normalize(b.guestInfo?.name ?? '').includes(q) ||
          normalize(b.guestInfo?.email ?? '').includes(q) ||
          normalize(formatDateDay(b.date)).includes(q) ||
          normalize(b.status ?? '').includes(q)
      );
    }
    return [...arr].sort(getComparator(sortDir, orderBy));
  }, [bookings, search, statusFilter, sortDir, orderBy]);

  useEffect(() => {
    setPage(0);
    setSelected(new Set());
    setExpanded(new Set());
  }, [search, statusFilter]);

  const visibleBookingRows = filteredBookings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const visibleBookingIds = visibleBookingRows.map((r) => r._id);
  const allBookingsSelected =
    visibleBookingIds.length > 0 && visibleBookingIds.every((id) => selected.has(id));

  const toggleSelectAll = () => {
    if (allBookingsSelected) {
      setSelected((prev) => {
        const n = new Set(prev);
        visibleBookingIds.forEach((id) => n.delete(id));
        return n;
      });
    } else {
      setSelected((prev) => new Set([...prev, ...visibleBookingIds]));
    }
  };
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleBulkDeleteBookings = () => {
    Swal.fire({
      title: `Delete ${selected.size} bookings?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, delete all',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        selected.forEach((id) => dispatch(deleteBooking(id)));
        setSelected(new Set());
      }
    });
  };

  const handleExportBookingsCSV = () => {
    const headers = ['Date', 'Time', 'Guest', 'Email', 'Status', 'Notes', 'Updated'];
    const rows = filteredBookings.map((b) => [
      formatDateDay(b.date),
      b.slot,
      b.guestInfo?.name,
      b.guestInfo?.email,
      b.status,
      b.guestInfo?.notes,
      formatDateDay(b.updatedAt),
    ]);
    downloadCSV(headers, rows, 'bookings-export.csv');
  };

  const BOOKING_STATUS_FILTERS = ['', 'CONFIRMED', 'PENDING_PAYMENT', 'CANCELED'];
  const BOOKING_STATUS_LABELS = {
    '': 'All',
    CONFIRMED: 'Confirmed',
    PENDING_PAYMENT: 'Pending Payment',
    CANCELED: 'Canceled',
  };

  const handleDayClick = (date) => {
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const existing = availMap[dateStr];
    setEditingAvail(existing || null);
    setDialogDate(date);
    setSlotsInput(existing ? existing.slots.map((s) => s.time).join(', ') : '');
    setPriceInput(existing ? String(existing.price) : '50');
    setPriceEditing(false);
    setDialogError('');
    setDialogOpen(true);
  };

  const handleDialogSave = () => {
    const times = slotsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (times.length === 0) {
      setDialogError('Enter at least one time slot.');
      return;
    }
    const price = parseFloat(priceInput);
    if (isNaN(price) || price < 0.5) {
      setDialogError('Price must be at least €0.50.');
      return;
    }
    const slots = times.map((time) => ({ time, isAvailable: true }));
    const dateStr = dayjs(dialogDate).format('YYYY-MM-DD');
    if (editingAvail) {
      dispatch(updateAvailability(editingAvail._id, { slots, price }));
    } else {
      dispatch(createAvailability({ date: dateStr, slots, price }));
    }
  };

  const handleAvailDelete = () => {
    if (!editingAvail) return;
    setDialogOpen(false);
    Swal.fire({
      title: 'Remove availability?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) dispatch(deleteAvailability(editingAvail._id));
    });
  };

  const handleCancelBooking = (id) => {
    Swal.fire({
      title: 'Cancel this booking?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) dispatch(cancelBooking(id));
    });
  };

  const handleDeleteBooking = (id) => {
    Swal.fire({
      title: 'Delete this booking?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) dispatch(deleteBooking(id));
    });
  };

  const statusColor = (status) => {
    if (status === 'CONFIRMED') return 'success';
    if (status === 'CANCELED') return 'error';
    return 'warning';
  };

  return (
    <div className="bookings-admin" style={{ marginBottom: '50px' }}>
      <Paper className="paper" style={{ backgroundColor: '#F4F4F4' }}>
        <Toolbar sx={{ flexDirection: 'column', alignItems: 'stretch', py: 1, gap: 1 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setSectionOpen((v) => !v)}
          >
            <Typography style={{ flexGrow: 1 }} className="title" variant="h6" component="div">
              <b>Bookings</b>
            </Typography>
            <IconButton tabIndex={-1}>
              {sectionOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </Box>
          {sectionOpen && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search guest, email, status…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.5, color: '#888' }} />,
                }}
                sx={{ flexGrow: 1 }}
              />
              <Tooltip title="Export CSV">
                <IconButton onClick={handleExportBookingsCSV}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Toolbar>

        <Collapse in={sectionOpen}>
          <div style={{ padding: '0 16px 16px' }}>
            <Typography variant="subtitle2" style={{ color: '#555', marginBottom: 8 }}>
              <b>Availability</b>
            </Typography>
            <Typography variant="body2" style={{ color: '#666', marginBottom: 12 }}>
              Click any date to set availability and price for that day.
            </Typography>
            {loadingAvail ? (
              <LoadingBox />
            ) : errorAvail ? (
              <MessageBox variant="error">{errorAvail}</MessageBox>
            ) : (
              <Paper
                sx={{
                  background: '#fff',
                  display: 'block',
                  margin: '0 auto',
                  width: 'fit-content',
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar
                    onChange={handleDayClick}
                    disablePast
                    slots={{ day: AvailableDay }}
                    slotProps={{ day: { availableDates } }}
                  />
                </LocalizationProvider>
              </Paper>
            )}
          </div>

          <Divider />

          <Toolbar sx={{ gap: 1, py: 1 }}>
            <Typography variant="subtitle2" style={{ color: '#555' }} sx={{ flexGrow: 1 }}>
              <b>Bookings ({filteredBookings.length})</b>
            </Typography>
            {selected.size > 0 && (
              <button className="dangerous-outline" onClick={handleBulkDeleteBookings}>
                Delete {selected.size} selected
              </button>
            )}
          </Toolbar>

          {/* Status filter chips */}
          <div style={{ display: 'flex', gap: 6, padding: '0 16px 12px', flexWrap: 'wrap' }}>
            {BOOKING_STATUS_FILTERS.map((s) => (
              <Chip
                key={s || 'all'}
                label={BOOKING_STATUS_LABELS[s]}
                size="small"
                onClick={() => setStatusFilter(s)}
                variant={statusFilter === s ? 'filled' : 'outlined'}
                sx={statusFilter === s ? { backgroundColor: '#1a1a1a', color: '#fff' } : {}}
              />
            ))}
          </div>

          {loadingBookings ? (
            <LoadingBox />
          ) : errorBookings ? (
            <MessageBox variant="error">{errorBookings}</MessageBox>
          ) : (
            <>
              <TableContainer sx={{ maxHeight: 520 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={allBookingsSelected}
                          indeterminate={selected.size > 0 && !allBookingsSelected}
                          onChange={toggleSelectAll}
                        />
                      </TableCell>
                      <TableCell padding="checkbox" />
                      {[
                        { id: 'date', label: 'Date' },
                        { id: 'slot', label: 'Time' },
                        { id: 'guestInfo.name', label: 'Guest' },
                        { id: 'guestInfo.email', label: 'Email' },
                        { id: 'status', label: 'Status' },
                        { id: 'updatedAt', label: 'Updated' },
                      ].map(({ id, label }) => (
                        <TableCell key={id}>
                          <TableSortLabel
                            active={orderBy === id}
                            direction={orderBy === id ? sortDir : 'asc'}
                            onClick={() => handleSort(id)}
                          >
                            <b>{label}</b>
                          </TableSortLabel>
                        </TableCell>
                      ))}
                      <TableCell>
                        <b>Notes</b>
                      </TableCell>
                      <TableCell>
                        <b>Photos</b>
                      </TableCell>
                      <TableCell align="right">
                        <b>Actions</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} align="center" sx={{ py: 4, color: '#888' }}>
                          No bookings found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      visibleBookingRows.map((b) => (
                        <React.Fragment key={b._id}>
                          <TableRow
                            sx={isNewRow(b) ? { backgroundColor: 'rgba(34,139,34,0.08)' } : {}}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selected.has(b._id)}
                                onChange={() => toggleSelect(b._id)}
                              />
                            </TableCell>
                            <TableCell padding="checkbox">
                              <IconButton size="small" onClick={() => toggleExpand(b._id)}>
                                {expanded.has(b._id) ? (
                                  <KeyboardArrowUpIcon fontSize="small" />
                                ) : (
                                  <KeyboardArrowDownIcon fontSize="small" />
                                )}
                              </IconButton>
                            </TableCell>
                            <TableCell>{formatDateDay(b.date)}</TableCell>
                            <TableCell>{b.slot}</TableCell>
                            <TableCell>{b.guestInfo?.name}</TableCell>
                            <TableCell>{b.guestInfo?.email}</TableCell>
                            <TableCell>
                              <StatusChip status={b.status} />
                            </TableCell>
                            <TableCell>{formatDateDay(b.updatedAt)}</TableCell>
                            <TableCell>
                              {b.guestInfo?.notes && (
                                <Tooltip title="View notes">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      setNotesDialog({
                                        open: true,
                                        notes: b.guestInfo.notes,
                                        name: b.guestInfo?.name,
                                      })
                                    }
                                  >
                                    <NoteAltIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </TableCell>
                            <TableCell>
                              {b.images?.length > 0 && (
                                <Tooltip title={`${b.images.length} photo(s)`}>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      setPhotosDialog({
                                        open: true,
                                        images: b.images,
                                        name: b.guestInfo?.name,
                                      })
                                    }
                                  >
                                    <PhotoLibraryIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </TableCell>
                            <TableCell align="right">
                              {b.status === 'CONFIRMED' && (
                                <Tooltip title="Cancel">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCancelBooking(b._id)}
                                  >
                                    <BlockIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Delete">
                                <IconButton size="small" onClick={() => handleDeleteBooking(b._id)}>
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>

                          {/* Expandable row */}
                          <TableRow>
                            <TableCell
                              colSpan={11}
                              sx={{ py: 0, borderBottom: expanded.has(b._id) ? undefined : 'none' }}
                            >
                              <Collapse in={expanded.has(b._id)} timeout="auto" unmountOnExit>
                                <Box sx={{ p: 2, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                  <div>
                                    <Typography
                                      variant="caption"
                                      sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                                    >
                                      Contact
                                    </Typography>
                                    <Typography variant="body2">
                                      Phone: {b.guestInfo?.phone || '—'}
                                    </Typography>
                                    <Typography variant="body2">
                                      Email: {b.guestInfo?.email}
                                    </Typography>
                                  </div>
                                  <div>
                                    <Typography
                                      variant="caption"
                                      sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                                    >
                                      Payment
                                    </Typography>
                                    <Typography variant="body2">
                                      Paid: {b.isPaid ? formatDateDay(b.paidAt) : 'No'}
                                    </Typography>
                                    <Typography variant="body2">
                                      Price: {b.price?.toFixed(2)}€
                                    </Typography>
                                    {b.stripeInvoiceId && (
                                      <Typography variant="body2">
                                        Invoice: {b.stripeInvoiceId}
                                      </Typography>
                                    )}
                                  </div>
                                  {b.guestInfo?.notes && (
                                    <div>
                                      <Typography
                                        variant="caption"
                                        sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                                      >
                                        Notes
                                      </Typography>
                                      <Typography variant="body2">{b.guestInfo.notes}</Typography>
                                    </div>
                                  )}
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredBookings.length}
                page={page}
                onPageChange={(_, p) => {
                  setPage(p);
                  setSelected(new Set());
                  setExpanded(new Set());
                }}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                  setSelected(new Set());
                  setExpanded(new Set());
                }}
              />
            </>
          )}
        </Collapse>
      </Paper>

      <Dialog
        open={photosDialog.open}
        onClose={() => setPhotosDialog({ open: false, images: [], name: '' })}
        maxWidth="md"
        fullWidth
        disableScrollLock
      >
        <DialogTitle>Photos — {photosDialog.name}</DialogTitle>
        <DialogContent>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {photosDialog.images.map((url, i) => {
              const safeUrl = isURL(url, { protocols: ['https'], require_protocol: true })
                ? url
                : '#';
              return (
                <a key={i} href={safeUrl} target="_blank" rel="noreferrer">
                  <img
                    src={safeUrl === '#' ? '' : safeUrl}
                    alt=""
                    loading="lazy"
                    style={{
                      width: 160,
                      height: 160,
                      objectFit: 'cover',
                      borderRadius: 4,
                      border: '1px solid #e0e0e0',
                      display: 'block',
                    }}
                  />
                </a>
              );
            })}
          </div>
        </DialogContent>
        <DialogActions>
          <button
            className="secondary"
            onClick={() => setPhotosDialog({ open: false, images: [], name: '' })}
          >
            Close
          </button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={notesDialog.open}
        onClose={() => setNotesDialog({ open: false, notes: '', name: '' })}
        maxWidth="sm"
        fullWidth
        disableScrollLock
      >
        <DialogTitle>Notes — {notesDialog.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
            {notesDialog.notes}
          </Typography>
        </DialogContent>
        <DialogActions>
          <button
            className="secondary"
            onClick={() => setNotesDialog({ open: false, notes: '', name: '' })}
          >
            Close
          </button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setPriceEditing(false);
        }}
        maxWidth="xs"
        fullWidth
        disableScrollLock
      >
        <DialogTitle>
          {editingAvail ? 'Edit' : 'Set'} Availability —{' '}
          {dialogDate ? dayjs(dialogDate).format('DD/MM/YYYY') : ''}
        </DialogTitle>
        <DialogContent>
          {(errorCreate || errorUpdate || dialogError) && (
            <MessageBox variant="error">{dialogError || errorCreate || errorUpdate}</MessageBox>
          )}
          <TextField
            label="Time slots (comma-separated)"
            placeholder="e.g. 10:00, 14:00, 16:30"
            fullWidth
            margin="normal"
            value={slotsInput}
            onChange={(e) => setSlotsInput(e.target.value)}
          />
          <TextField
            label="Price per slot (€)"
            type="number"
            fullWidth
            margin="normal"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            inputProps={{ min: 0.5, step: 0.01 }}
            InputProps={{
              readOnly: !priceEditing,
              endAdornment: !priceEditing && (
                <Tooltip title="Edit price">
                  <IconButton size="small" onClick={() => setPriceEditing(true)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ),
            }}
            sx={!priceEditing ? { '& .MuiInputBase-input': { color: '#555' } } : {}}
          />
        </DialogContent>
        <DialogActions>
          {editingAvail && (
            <button className="dangerous" onClick={handleAvailDelete}>
              Remove date
            </button>
          )}
          <button
            className="secondary"
            onClick={() => {
              setDialogOpen(false);
              setPriceEditing(false);
            }}
          >
            Cancel
          </button>
          <button className="primary" onClick={handleDialogSave}>
            Save
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
