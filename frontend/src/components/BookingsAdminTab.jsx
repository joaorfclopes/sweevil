import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Toolbar,
  Tooltip,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Divider,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BlockIcon from "@mui/icons-material/Block";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import Swal from "sweetalert2";
import { LocalizationProvider, DateCalendar, PickersDay } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  cancelBooking,
  createAvailability,
  deleteAvailability,
  deleteBooking,
  listAvailability,
  listBookings,
  updateAvailability,
} from "../actions/bookingActions";
import {
  AVAILABILITY_CREATE_RESET,
  AVAILABILITY_DELETE_RESET,
  AVAILABILITY_UPDATE_RESET,
  BOOKING_CANCEL_RESET,
  BOOKING_DELETE_RESET,
} from "../constants/bookingConstants";
import LoadingBox from "./LoadingBox";
import MessageBox from "./MessageBox";
import { formatDateDay } from "../utils.js";

function AvailableDay(props) {
  const { availableDates, day, outsideCurrentMonth, ...other } = props;
  const dateStr = dayjs(day).format("YYYY-MM-DD");
  const isAvailable = availableDates.includes(dateStr);
  return (
    <PickersDay
      {...other}
      outsideCurrentMonth={outsideCurrentMonth}
      day={day}
      sx={
        isAvailable && !outsideCurrentMonth
          ? {
              backgroundColor: "rgba(34,139,34,0.15)",
              "&:hover": { backgroundColor: "rgba(34,139,34,0.25)" },
              "&.Mui-selected": { backgroundColor: "#228B22" },
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

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [photosDialog, setPhotosDialog] = useState({ open: false, images: [], name: "" });
  const [notesDialog, setNotesDialog] = useState({ open: false, notes: "", name: "" });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAvail, setEditingAvail] = useState(null);
  const [dialogDate, setDialogDate] = useState(null);
  const [slotsInput, setSlotsInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [dialogError, setDialogError] = useState("");

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
    availMap[dayjs(a.date).format("YYYY-MM-DD")] = a;
  });
  const availableDates = Object.keys(availMap);

  const handleDayClick = (date) => {
    const dateStr = dayjs(date).format("YYYY-MM-DD");
    const existing = availMap[dateStr];
    setEditingAvail(existing || null);
    setDialogDate(date);
    setSlotsInput(existing ? existing.slots.map((s) => s.time).join(", ") : "");
    setPriceInput(existing ? String(existing.price) : "");
    setDialogError("");
    setDialogOpen(true);
  };

  const handleDialogSave = () => {
    const times = slotsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (times.length === 0) {
      setDialogError("Enter at least one time slot.");
      return;
    }
    const price = parseFloat(priceInput);
    if (isNaN(price) || price <= 0) {
      setDialogError("Enter a valid price.");
      return;
    }
    const slots = times.map((time) => ({ time, isAvailable: true }));
    const dateStr = dayjs(dialogDate).format("YYYY-MM-DD");
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
      title: "Remove availability?",
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) dispatch(deleteAvailability(editingAvail._id));
    });
  };

  const handleCancelBooking = (id) => {
    Swal.fire({
      title: "Cancel this booking?",
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) dispatch(cancelBooking(id));
    });
  };

  const handleDeleteBooking = (id) => {
    Swal.fire({
      title: "Delete this booking?",
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) dispatch(deleteBooking(id));
    });
  };

  const statusColor = (status) => {
    if (status === "CONFIRMED") return "success";
    if (status === "CANCELED") return "error";
    return "warning";
  };

  return (
    <div className="bookings-admin" style={{ marginBottom: "50px" }}>
      <Paper className="paper" style={{ backgroundColor: "#F4F4F4" }}>
        <Toolbar>
          <Typography style={{ width: "100%" }} className="title" variant="h6" component="div">
            <b>Bookings</b>
          </Typography>
        </Toolbar>

        <div style={{ padding: "0 16px 16px" }}>
          <Typography variant="subtitle2" style={{ color: "#555", marginBottom: 8 }}>
            <b>Availability</b>
          </Typography>
          <Typography variant="body2" style={{ color: "#666", marginBottom: 12 }}>
            Click any date to set availability and price for that day.
          </Typography>
          {loadingAvail ? (
            <LoadingBox />
          ) : errorAvail ? (
            <MessageBox variant="error">{errorAvail}</MessageBox>
          ) : (
            <Paper sx={{ background: "#fff", display: "inline-block" }}>
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

        <Typography
          variant="subtitle2"
          style={{ color: "#555", padding: "16px 16px 8px" }}
        >
          <b>Bookings</b>
        </Typography>
        {loadingBookings ? (
          <LoadingBox />
        ) : errorBookings ? (
          <MessageBox variant="error">{errorBookings}</MessageBox>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Guest</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Photos</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((b) => (
                      <TableRow key={b._id}>
                        <TableCell>{formatDateDay(b.date)}</TableCell>
                        <TableCell>{b.slot}</TableCell>
                        <TableCell>{b.guestInfo?.name}</TableCell>
                        <TableCell>{b.guestInfo?.email}</TableCell>
                        <TableCell>{b.guestInfo?.phone}</TableCell>
                        <TableCell>{b.price?.toFixed(2)}€</TableCell>
                        <TableCell>
                          <Chip
                            label={b.status}
                            color={statusColor(b.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {b.guestInfo?.notes && (
                            <Tooltip title="View notes">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setNotesDialog({ open: true, notes: b.guestInfo.notes, name: b.guestInfo?.name })
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
                                  setPhotosDialog({ open: true, images: b.images, name: b.guestInfo?.name })
                                }
                              >
                                <PhotoLibraryIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {b.status === "CONFIRMED" && (
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
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteBooking(b._id)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={bookings.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </Paper>

      <Dialog
        open={photosDialog.open}
        onClose={() => setPhotosDialog({ open: false, images: [], name: "" })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Photos — {photosDialog.name}</DialogTitle>
        <DialogContent>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {photosDialog.images.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer">
                <img
                  src={url}
                  alt=""
                  style={{ width: 160, height: 160, objectFit: "cover", borderRadius: 4, border: "1px solid #e0e0e0", display: "block" }}
                />
              </a>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <button className="secondary" onClick={() => setPhotosDialog({ open: false, images: [], name: "" })}>
            Close
          </button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={notesDialog.open}
        onClose={() => setNotesDialog({ open: false, notes: "", name: "" })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Notes — {notesDialog.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" style={{ whiteSpace: "pre-wrap" }}>
            {notesDialog.notes}
          </Typography>
        </DialogContent>
        <DialogActions>
          <button className="secondary" onClick={() => setNotesDialog({ open: false, notes: "", name: "" })}>
            Close
          </button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {editingAvail ? "Edit" : "Set"} Availability —{" "}
          {dialogDate ? dayjs(dialogDate).format("DD/MM/YYYY") : ""}
        </DialogTitle>
        <DialogContent>
          {(errorCreate || errorUpdate || dialogError) && (
            <MessageBox variant="error">
              {dialogError || errorCreate || errorUpdate}
            </MessageBox>
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
            inputProps={{ min: 0, step: 0.01 }}
          />
        </DialogContent>
        <DialogActions>
          {editingAvail && (
            <button className="dangerous" onClick={handleAvailDelete}>
              Remove date
            </button>
          )}
          <button className="secondary" onClick={() => setDialogOpen(false)}>
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
