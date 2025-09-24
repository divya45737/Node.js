const express = require('express');
const app = express();
app.use(express.json());

const PORT = 3000;
const seats = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  status: 'available',  // available | locked | booked
  lockedBy: null,
  lockExpiresAt: null
}));
// Get available seats
function getAvailableSeats() {
  return seats.filter(seat => seat.status === 'available');
}

// Lock a seat
function lockSeat(seatId, userId) {
  const seat = seats.find(s => s.id === seatId);
  if (!seat) return { error: 'Seat not found' };

  // Unlock if lock expired
  if (seat.status === 'locked' && seat.lockExpiresAt < Date.now()) {
    seat.status = 'available';
    seat.lockedBy = null;
    seat.lockExpiresAt = null;
  }

  if (seat.status === 'booked') return { error: 'Seat already booked' };
  if (seat.status === 'locked') return { error: 'Seat currently locked by another user' };

  seat.status = 'locked';
  seat.lockedBy = userId;
  seat.lockExpiresAt = Date.now() + 60 * 1000; // 1 minute lock

  return { success: `Seat ${seatId} locked for 1 minute by ${userId}` };
}

// Confirm a seat
function confirmSeat(seatId, userId) {
  const seat = seats.find(s => s.id === seatId);
  if (!seat) return { error: 'Seat not found' };
  if (seat.status !== 'locked' || seat.lockedBy !== userId) {
    return { error: 'Seat is not locked by you or lock expired' };
  }

  seat.status = 'booked';
  seat.lockedBy = null;
  seat.lockExpiresAt = null;

  return { success: `Seat ${seatId} successfully booked by ${userId}` };
}

// Auto-release expired locks
setInterval(() => {
  seats.forEach(seat => {
    if (seat.status === 'locked' && seat.lockExpiresAt < Date.now()) {
      seat.status = 'available';
      seat.lockedBy = null;
      seat.lockExpiresAt = null;
      console.log(`Seat ${seat.id} lock expired and is now available`);
    }
  });
}, 5000);
// View all seats
app.get('/seats', (req, res) => {
  res.json(seats);
});

// Lock a seat
app.post('/seats/:id/lock', (req, res) => {
  const userId = req.body.userId;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const seatId = parseInt(req.params.id);
  const result = lockSeat(seatId, userId);
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

// Confirm a seat
app.post('/seats/:id/confirm', (req, res) => {
  const userId = req.body.userId;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const seatId = parseInt(req.params.id);
  const result = confirmSeat(seatId, userId);
  if (result.error) return res.status(400).json(result);
  res.json(result);
});
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
