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
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BlockIcon from "@mui/icons-material/Block";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
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
    <div className="bookings-admin">
      <h2>Availability</h2>
      <p style={{ color: "#666", fontSize: 14 }}>
        Click any date to set availability and price for that day.
      </p>
      {loadingAvail ? (
        <LoadingBox />
      ) : errorAvail ? (
        <MessageBox variant="error">{errorAvail}</MessageBox>
      ) : (
        <Paper sx={{ background: "#F4F4F4", display: "inline-block" }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              onChange={handleDayClick}
              slots={{ day: AvailableDay }}
              slotProps={{ day: { availableDates } }}
            />
          </LocalizationProvider>
        </Paper>
      )}

      <h2 style={{ marginTop: "2rem" }}>Bookings</h2>
      {loadingBookings ? (
        <LoadingBox />
      ) : errorBookings ? (
        <MessageBox variant="error">{errorBookings}</MessageBox>
      ) : (
        <Paper sx={{ background: "#F4F4F4" }}>
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
        </Paper>
      )}

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
