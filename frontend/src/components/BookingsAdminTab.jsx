import BlockIcon from '@mui/icons-material/Block';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
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
import Skeleton from '@mui/material/Skeleton';
import { DateCalendar, LocalizationProvider, PickerDay } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import isURL from 'validator/lib/isURL';
import {
  cancelBooking,
  createAvailability,
  createAvailabilityBulk,
  deleteAvailability,
  deleteBooking,
  listAvailability,
  listBookings,
  updateAvailability,
} from '../actions/bookingActions';
import {
  AVAILABILITY_BULK_CREATE_RESET,
  AVAILABILITY_CREATE_RESET,
  AVAILABILITY_DELETE_RESET,
  AVAILABILITY_UPDATE_RESET,
  BOOKING_CANCEL_RESET,
  BOOKING_DELETE_RESET,
} from '../constants/bookingConstants';
import useScrollLock from '../hooks/useScrollLock';
import { formatDateDay } from '../utils.js';
import { downloadCSV, getComparator, isNewRow } from '../utils/adminTableUtils';
import Swal from '../utils/swal';
import LoadingOverlay from './LoadingOverlay';
import MessageBox from './MessageBox';
import StatusChip from './StatusChip';

function AvailableDay(props) {
  const { availableDates, day, outsideCurrentMonth, ...other } = props;
  const dateStr = dayjs(day).format('YYYY-MM-DD');
  const isAvailable = availableDates.includes(dateStr);
  return (
    <PickerDay
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

function ExtraPickerDay({
  day,
  outsideCurrentMonth,
  extraDates,
  disabledDates,
  ...pickerDayProps
}) {
  const dateStr = dayjs(day).format('YYYY-MM-DD');
  const isSelected = extraDates.has(dateStr);
  const isDisabled =
    disabledDates.has(dateStr) || outsideCurrentMonth || dayjs(day).isBefore(dayjs(), 'day');
  return (
    <PickerDay
      {...pickerDayProps}
      day={day}
      outsideCurrentMonth={outsideCurrentMonth}
      disabled={isDisabled}
      selected={isSelected}
      sx={
        isSelected
          ? {
              backgroundColor: 'primary.main',
              color: '#fff',
              '&:hover': { backgroundColor: 'primary.dark' },
            }
          : {}
      }
    />
  );
}

export default function BookingsAdminTab() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const bookingList = useSelector((s) => s.bookingList);
  const {
    loading: loadingBookings,
    bookings = [],
    error: errorBookings,
    total: bookingsTotal = 0,
  } = bookingList;

  const bookingCancel = useSelector((s) => s.bookingCancel);
  const { success: successCancel } = bookingCancel;

  const bookingDelete = useSelector((s) => s.bookingDelete);
  const { success: successDelete } = bookingDelete;

  const availabilityList = useSelector((s) => s.availabilityList);
  const { loading: loadingAvail, availability = [], error: errorAvail } = availabilityList;

  const availabilityCreate = useSelector((s) => s.availabilityCreate);
  const { success: successCreate, error: errorCreate } = availabilityCreate;

  const availabilityBulkCreate = useSelector((s) => s.availabilityBulkCreate);
  const {
    success: successBulkCreate,
    result: bulkResult,
    error: errorBulkCreate,
  } = availabilityBulkCreate;

  const availabilityUpdate = useSelector((s) => s.availabilityUpdate);
  const { success: successUpdate, error: errorUpdate } = availabilityUpdate;

  const availabilityDelete = useSelector((s) => s.availabilityDelete);
  const { success: successAvailDelete } = availabilityDelete;

  const [sectionOpen, setSectionOpen] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [photosDialog, setPhotosDialog] = useState({ open: false, images: [], name: '' });
  const [notesDialog, setNotesDialog] = useState({ open: false, notes: '', name: '' });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAvail, setEditingAvail] = useState(null);
  const [dialogDate, setDialogDate] = useState(null);
  const [calendarViewDate, setCalendarViewDate] = useState(null);
  const [slotsInput, setSlotsInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [priceEditing, setPriceEditing] = useState(false);
  const [dialogError, setDialogError] = useState('');
  const [extraDates, setExtraDates] = useState(new Set());
  const [showExtraPicker, setShowExtraPicker] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortDir, setSortDir] = useState('desc');
  const [orderBy, setOrderBy] = useState('date');
  const [selected, setSelected] = useState(new Set());
  const [expanded, setExpanded] = useState(new Set());
  useScrollLock(photosDialog.open || notesDialog.open || dialogOpen);

  useEffect(() => {
    dispatch(listAvailability());
  }, [dispatch]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(0);
    setSelected(new Set());
    setExpanded(new Set());
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    if (successCancel || successDelete) {
      dispatch({ type: BOOKING_CANCEL_RESET });
      dispatch({ type: BOOKING_DELETE_RESET });
    }
    dispatch(
      listBookings({
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch,
        status: statusFilter,
      })
    );
  }, [dispatch, successCancel, successDelete, page, rowsPerPage, debouncedSearch, statusFilter]);

  useEffect(() => {
    if (successCreate || successUpdate || successAvailDelete || successBulkCreate) {
      dispatch({ type: AVAILABILITY_CREATE_RESET });
      dispatch({ type: AVAILABILITY_UPDATE_RESET });
      dispatch({ type: AVAILABILITY_DELETE_RESET });
      dispatch({ type: AVAILABILITY_BULK_CREATE_RESET });
      dispatch(listAvailability());
      setDialogOpen(false);
      setExtraDates(new Set());
      setShowExtraPicker(false);
      if (successBulkCreate && bulkResult) {
        const created = bulkResult.created ?? [];
        const skipped = bulkResult.skipped ?? [];
        const msg =
          skipped.length > 0
            ? t('admin.bulkCreateResult', { created: created.length, skipped: skipped.length })
            : t('admin.bulkCreateResultSimple', { created: created.length });
        Swal.fire({
          icon: 'success',
          title: t('admin.done'),
          text: msg,
          timer: 3000,
          showConfirmButton: false,
        });
      }
    }
  }, [dispatch, successCreate, successUpdate, successAvailDelete, successBulkCreate]);

  const availMap = {};
  availability.forEach((a) => {
    availMap[dayjs(a.date).utc().format('YYYY-MM-DD')] = a;
  });
  const availableDates = Object.keys(availMap);

  const extraPickerDisabledDates = useMemo(
    () =>
      new Set([...availableDates, ...(dialogDate ? [dayjs(dialogDate).format('YYYY-MM-DD')] : [])]),
    [availableDates, dialogDate]
  );

  const handleSort = (col) => {
    if (orderBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setOrderBy(col);
      setSortDir('asc');
    }
    setPage(0);
  };

  const filteredBookings = useMemo(
    () => [...(bookings ?? [])].sort(getComparator(sortDir, orderBy)),
    [bookings, sortDir, orderBy]
  );

  const visibleBookingIds = filteredBookings.map((r) => r._id);
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
      title: t('admin.deleteBookingsTitle', { count: selected.size }),
      showCancelButton: true,
      confirmButtonText: t('admin.deleteBookingsBtn'),
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        selected.forEach((id) => dispatch(deleteBooking(id)));
        setSelected(new Set());
      }
    });
  };

  const handleExportBookingsCSV = () => {
    const headers = [
      t('admin.colDate'),
      t('admin.colTime'),
      t('admin.colGuest'),
      t('admin.colEmail'),
      t('admin.colStatus'),
      t('admin.colNotes'),
      t('admin.colUpdated'),
    ];
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
    '': t('admin.all'),
    CONFIRMED: t('status.CONFIRMED'),
    PENDING_PAYMENT: t('status.PENDING_PAYMENT'),
    CANCELED: t('status.CANCELED'),
  };

  const handleDayClick = (date) => {
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const existing = availMap[dateStr];
    setEditingAvail(existing || null);
    setDialogDate(date);
    setCalendarViewDate(date);
    setSlotsInput(existing ? existing.slots.map((s) => s.time).join(', ') : '');
    setPriceInput(existing ? String(existing.price) : '50');
    setPriceEditing(false);
    setDialogError('');
    setExtraDates(new Set());
    setShowExtraPicker(false);
    setDialogOpen(true);
  };

  const handleDialogSave = () => {
    const times = slotsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (times.length === 0) {
      setDialogError(t('admin.errorNoSlots'));
      return;
    }
    const price = parseFloat(priceInput);
    if (isNaN(price) || price < 0.5) {
      setDialogError(t('admin.errorMinPrice'));
      return;
    }
    const slots = times.map((time) => ({ time, isAvailable: true }));
    const dateStr = dayjs(dialogDate).format('YYYY-MM-DD');
    if (editingAvail) {
      dispatch(updateAvailability(editingAvail._id, { slots, price }));
    } else if (extraDates.size > 0) {
      const allDates = [dateStr, ...extraDates];
      dispatch(createAvailabilityBulk({ dates: allDates, slots, price }));
    } else {
      dispatch(createAvailability({ date: dateStr, slots, price }));
    }
  };

  const handleAvailDelete = () => {
    if (!editingAvail) return;
    setDialogOpen(false);
    Swal.fire({
      title: t('admin.removeAvailabilityTitle'),
      showCancelButton: true,
      confirmButtonText: t('common.yes'),
    }).then((result) => {
      if (result.isConfirmed) dispatch(deleteAvailability(editingAvail._id));
    });
  };

  const handleCancelBooking = (id) => {
    Swal.fire({
      title: t('admin.cancelBookingTitle'),
      showCancelButton: true,
      confirmButtonText: t('common.yes'),
    }).then((result) => {
      if (result.isConfirmed) dispatch(cancelBooking(id));
    });
  };

  const handleDeleteBooking = (id) => {
    Swal.fire({
      title: t('admin.deleteBookingTitle'),
      showCancelButton: true,
      confirmButtonText: t('common.yes'),
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
              <b>{t('admin.bookings')}</b>
            </Typography>
            <IconButton tabIndex={-1}>
              {sectionOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </Box>
          {sectionOpen && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder={t('admin.searchBookings')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.5, color: '#888' }} />,
                  },
                }}
                sx={{ flexGrow: 1 }}
              />
              <Tooltip title={t('admin.exportCsv')}>
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
              <b>{t('admin.availability')}</b>
            </Typography>
            <Typography variant="body2" style={{ color: '#666', marginBottom: 12 }}>
              {t('admin.availabilityHint')}
            </Typography>
            {errorAvail ? (
              <MessageBox variant="error">{errorAvail}</MessageBox>
            ) : (
              <LoadingOverlay loading={loadingAvail} minHeight="300px">
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
                      referenceDate={calendarViewDate ? dayjs(calendarViewDate) : undefined}
                      slots={{ day: AvailableDay }}
                      slotProps={{ day: { availableDates } }}
                    />
                  </LocalizationProvider>
                </Paper>
              </LoadingOverlay>
            )}
          </div>

          <Divider />

          <Toolbar sx={{ gap: 1, py: 1 }}>
            <Typography variant="subtitle2" style={{ color: '#555' }} sx={{ flexGrow: 1 }}>
              <b>{t('admin.bookingsTitle', { count: bookingsTotal })}</b>
            </Typography>
            {selected.size > 0 && (
              <button className="dangerous-outline" onClick={handleBulkDeleteBookings}>
                {t('admin.deleteSelected', { count: selected.size })}
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

          {errorBookings && <MessageBox variant="error">{errorBookings}</MessageBox>}
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
                      { id: 'date', label: t('admin.colDate') },
                      { id: 'slot', label: t('admin.colTime') },
                      { id: 'guestInfo.name', label: t('admin.colGuest') },
                      { id: 'guestInfo.email', label: t('admin.colEmail') },
                      { id: 'status', label: t('admin.colStatus') },
                      { id: 'updatedAt', label: t('admin.colUpdated') },
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
                      <b>{t('admin.colNotes')}</b>
                    </TableCell>
                    <TableCell>
                      <b>{t('admin.colPhotos')}</b>
                    </TableCell>
                    <TableCell align="right">
                      <b>{t('admin.actions')}</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingBookings ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} sx={{ height: 56 }}>
                        {Array.from({ length: 11 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton animation="wave" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} align="center" sx={{ py: 4, color: '#888' }}>
                        {t('admin.noBookingsFound')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((b) => (
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
                              <Tooltip title={t('admin.viewNotes')}>
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
                              <Tooltip title={t('admin.photosCount', { count: b.images.length })}>
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
                              <Tooltip title={t('admin.cancelBooking')}>
                                <IconButton size="small" onClick={() => handleCancelBooking(b._id)}>
                                  <BlockIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title={t('admin.deleteBooking')}>
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
                                    {t('admin.contact')}
                                  </Typography>
                                  <Typography variant="body2">
                                    {t('admin.phone')}: {b.guestInfo?.phone || '—'}
                                  </Typography>
                                  <Typography variant="body2">
                                    {t('admin.email')}: {b.guestInfo?.email}
                                  </Typography>
                                </div>
                                <div>
                                  <Typography
                                    variant="caption"
                                    sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                                  >
                                    {t('admin.payment')}
                                  </Typography>
                                  <Typography variant="body2">
                                    {t('admin.paid')}:{' '}
                                    {b.isPaid ? formatDateDay(b.paidAt) : t('common.no')}
                                  </Typography>
                                  <Typography variant="body2">
                                    {t('admin.price')}: {b.price?.toFixed(2)}€
                                  </Typography>
                                  {b.stripeInvoiceId && (
                                    <Typography variant="body2">
                                      {t('admin.invoice')}: {b.stripeInvoiceId}
                                    </Typography>
                                  )}
                                </div>
                                {b.guestInfo?.notes && (
                                  <div>
                                    <Typography
                                      variant="caption"
                                      sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                                    >
                                      {t('admin.colNotes')}
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
              rowsPerPageOptions={[10, 20, 50, 100]}
              component="div"
              count={bookingsTotal}
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
        </Collapse>
      </Paper>

      <Dialog
        open={photosDialog.open}
        onClose={() => setPhotosDialog({ open: false, images: [], name: '' })}
        maxWidth="md"
        fullWidth
        disableScrollLock
      >
        <DialogTitle>{t('admin.photos', { name: photosDialog.name })}</DialogTitle>
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
            {t('admin.close')}
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
        <DialogTitle>{t('admin.notes', { name: notesDialog.name })}</DialogTitle>
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
            {t('admin.close')}
          </button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setPriceEditing(false);
          setExtraDates(new Set());
          setShowExtraPicker(false);
        }}
        maxWidth="xs"
        fullWidth
        disableScrollLock
      >
        <DialogTitle>
          {editingAvail ? t('admin.editAvailability') : t('admin.setAvailability')} —{' '}
          {dialogDate ? dayjs(dialogDate).format('DD/MM/YYYY') : ''}
        </DialogTitle>
        <DialogContent>
          {(errorCreate || errorUpdate || errorBulkCreate || dialogError) && (
            <MessageBox variant="error">
              {dialogError || errorCreate || errorUpdate || errorBulkCreate}
            </MessageBox>
          )}
          <TextField
            label={t('admin.timeSlotsLabel')}
            placeholder={t('admin.timeSlotsPlaceholder')}
            fullWidth
            margin="normal"
            value={slotsInput}
            onChange={(e) => setSlotsInput(e.target.value)}
          />
          <TextField
            label={t('admin.pricePerSlot')}
            type="number"
            fullWidth
            margin="normal"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            inputProps={{ min: 0.5, step: 0.01 }}
            slotProps={{
              input: {
                readOnly: !priceEditing,
                endAdornment: !priceEditing && (
                  <Tooltip title={t('admin.editPrice')}>
                    <IconButton size="small" onClick={() => setPriceEditing(true)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ),
              },
            }}
            sx={!priceEditing ? { '& .MuiInputBase-input': { color: '#555' } } : {}}
          />
          {!editingAvail && (
            <Box sx={{ mt: 1 }}>
              {!showExtraPicker ? (
                <button
                  type="button"
                  className="secondary"
                  style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                  onClick={() => setShowExtraPicker(true)}
                >
                  {t('admin.applyMoreDates')}
                </button>
              ) : (
                <button
                  type="button"
                  className="secondary"
                  style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                  onClick={() => {
                    setShowExtraPicker(false);
                    setExtraDates(new Set());
                  }}
                >
                  {t('admin.cancelExtraDates')}
                </button>
              )}
            </Box>
          )}
          {!editingAvail && showExtraPicker && (
            <Box sx={{ mt: 1 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  disablePast
                  referenceDate={dialogDate ? dayjs(dialogDate) : undefined}
                  onChange={(date) => {
                    const dateStr = dayjs(date).format('YYYY-MM-DD');
                    setExtraDates((prev) => {
                      const next = new Set(prev);
                      if (next.has(dateStr)) {
                        next.delete(dateStr);
                      } else {
                        next.add(dateStr);
                      }
                      return next;
                    });
                  }}
                  slots={{ day: ExtraPickerDay }}
                  slotProps={{
                    day: {
                      extraDates,
                      disabledDates: extraPickerDisabledDates,
                    },
                  }}
                />
              </LocalizationProvider>
              {extraDates.size > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {[...extraDates].sort().map((d) => (
                    <Chip
                      key={d}
                      label={dayjs(d).format('DD/MM/YYYY')}
                      size="small"
                      onDelete={() =>
                        setExtraDates((prev) => {
                          const next = new Set(prev);
                          next.delete(d);
                          return next;
                        })
                      }
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {editingAvail && (
            <button className="dangerous" onClick={handleAvailDelete}>
              {t('admin.removeDate')}
            </button>
          )}
          <button
            className="secondary"
            onClick={() => {
              setDialogOpen(false);
              setPriceEditing(false);
            }}
          >
            {t('admin.cancel')}
          </button>
          <button className="primary" onClick={handleDialogSave}>
            {t('admin.save')}
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
