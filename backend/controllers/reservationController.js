const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

// @desc    Create reservation
// @route   POST /api/reservations
// @access  Private (Staff/Admin)
const createReservation = async (req, res, next) => {
  try {
    const { customerName, phone, tableId, reservationDate, reservationTime } = req.body;

    // 1. Check if table exists
    const table = await Table.findById(tableId);
    if (!table) {
      return sendError(res, 'Table not found', 404);
    }

    // 2. Format and parse date to set time boundaries
    const parsedDate = new Date(reservationDate);
    // Reset hours to check just the calendar day
    const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));

    // 3. Check if table is already reserved for this specific date and time slot
    const existingReservation = await Reservation.findOne({
      tableId,
      reservationDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      reservationTime
    });

    if (existingReservation) {
      return sendError(res, 'This table is already reserved for the selected date and time', 400);
    }

    // 4. Check table's real-time status (if reserved or occupied right now)
    // In a real-world system, real-time status tracks "current status". Let's update table status to 'Reserved'
    // if the reservation date is today.
    const isToday = new Date().toDateString() === new Date(reservationDate).toDateString();
    
    // Create reservation
    const reservation = await Reservation.create({
      customerName,
      phone,
      tableId,
      reservationDate: startOfDay, // save as standardized date
      reservationTime
    });

    if (isToday) {
      table.status = 'Reserved';
      await table.save();
    }

    // Populate table details in response
    const populatedReservation = await reservation.populate('tableId', 'tableNumber capacity status');

    return sendSuccess(res, 'Reservation created successfully', populatedReservation, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private (Staff/Admin)
const getReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find()
      .populate('tableId', 'tableNumber capacity status')
      .sort({ reservationDate: 1, reservationTime: 1 });

    return sendSuccess(res, 'Reservations retrieved successfully', reservations);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single reservation by ID
// @route   GET /api/reservations/:id
// @access  Private (Staff/Admin)
const getReservationById = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('tableId', 'tableNumber capacity status');

    if (!reservation) {
      return sendError(res, 'Reservation not found', 404);
    }

    return sendSuccess(res, 'Reservation retrieved successfully', reservation);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel/Delete reservation
// @route   DELETE /api/reservations/:id
// @access  Private (Staff/Admin)
const deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return sendError(res, 'Reservation not found', 404);
    }

    // Reset table status to Available if the reservation was for today
    const isToday = new Date().toDateString() === new Date(reservation.reservationDate).toDateString();
    if (isToday) {
      const table = await Table.findById(reservation.tableId);
      if (table && table.status === 'Reserved') {
        table.status = 'Available';
        await table.save();
      }
    }

    await Reservation.findByIdAndDelete(req.params.id);

    return sendSuccess(res, 'Reservation cancelled and deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReservation,
  getReservations,
  getReservationById,
  deleteReservation
};
