import pool from '../models/db.js';

export async function getBarberAppointments(id) {
  const [rows] = await pool.query("SELECT * FROM barberAppointment");
  return rows;
}

export async function getBarberAppointment(id) {
  const [rows] = await pool.query("SELECT * FROM barberAppointment WHERE barberAppointmentId = ?", [id]);
  return rows[0];
}

export async function createBarberAppointment(barberAppointment) {
  const { appointmentId, barberId } = barberAppointment;
  const [result] = await pool.query(`
    INSERT INTO barberAppointment (appointmentId, barberId)
    VALUES (?, ?)
  `, [appointmentId, barberId]);
  const id = result.insertId;
  return getServiceAppointment(id);
}

export async function updateBarberAppointment(id, barberAppointment) {
  const { appointmentId, barberId} = barberAppointment;
  await pool.query(`
    UPDATE barberAppointment 
    SET appointmentId = ?, barberId = ?
    WHERE barberAppointmentId = ?
  `, [appointmentId, barberId]);
  return getServiceAppointment(id);
}

export async function deleteBarberAppointment(id) {
  const [result] = await pool.query(`DELETE FROM barberAppointment WHERE barberAppointmentId = ?`, [id]);
  if (result.affectedRows === 0) {
    throw new Error('No barberAppointment found with this id');
  }
  return result;
}