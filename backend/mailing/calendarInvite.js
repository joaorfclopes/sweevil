const pad = (n) => String(n).padStart(2, "0");

// Sanitize a string for safe use inside an ICS property value.
// Strips CR and LF to prevent line-injection attacks, and escapes
// commas, semicolons, and backslashes per RFC 5545 §3.3.11.
const icsEscape = (str) =>
  String(str ?? "")
    .replace(/\r/g, "")
    .replace(/\n/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");

const formatLocal = (date, hour, minute) => {
  const y = date.getUTCFullYear();
  const m = pad(date.getUTCMonth() + 1);
  const d = pad(date.getUTCDate());
  return `${y}${m}${d}T${pad(hour)}${pad(minute)}00`;
};

const utcStamp = () => {
  const n = new Date();
  return `${n.getUTCFullYear()}${pad(n.getUTCMonth() + 1)}${pad(n.getUTCDate())}T${pad(n.getUTCHours())}${pad(n.getUTCMinutes())}${pad(n.getUTCSeconds())}Z`;
};

export const generateICS = ({ booking, adminEmail }) => {
  const date = new Date(booking.date);
  const [slotHour, slotMinute] = booking.slot.split(":").map(Number);

  const startDt = formatLocal(date, slotHour, slotMinute);
  const endDt = formatLocal(date, slotHour + 1, slotMinute);

  const brand = process.env.BRAND_NAME || "Sweevil";
  const uid = `booking-${booking._id}@${brand.toLowerCase().replace(/\s+/g, "-")}`;
  const summary = `${brand} — ${icsEscape(booking.guestInfo.name)}`;
  const description = [
    `Guest: ${icsEscape(booking.guestInfo.name)}`,
    `Phone: ${icsEscape(booking.guestInfo.phone)}`,
    `Email: ${icsEscape(booking.guestInfo.email)}`,
    booking.guestInfo.notes ? `Notes: ${icsEscape(booking.guestInfo.notes)}` : "",
  ]
    .filter(Boolean)
    .join("\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${brand}//${brand}//EN`,
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${utcStamp()}`,
    `DTSTART;TZID=Europe/Lisbon:${startDt}`,
    `DTEND;TZID=Europe/Lisbon:${endDt}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `ORGANIZER;CN=${brand}:mailto:${adminEmail}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${booking.guestInfo.name}:mailto:${booking.guestInfo.email}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:Reminder — ${summary}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
};
