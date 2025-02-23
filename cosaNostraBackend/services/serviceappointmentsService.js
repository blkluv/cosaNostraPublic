import pool from '../models/db.js';

export async function getServiceAppointments() {
  const [rows] = await pool.query("SELECT * FROM serviceAppointment");
  return rows;
}

export async function getServiceAppointment(id) {
  const [rows] = await pool.query("SELECT * FROM serviceAppointment WHERE appointmentId = ?", [id]);
  return rows[0];
}

export async function createServiceAppointment(serviceAppointment) {
  const { appointmentId, serviceId } = serviceAppointment;
  const [result] = await pool.query(`
    INSERT INTO serviceAppointment (appointmentId, serviceId)
    VALUES (?, ?)
  `, [appointmentId, serviceId]);
  const id = result.insertId;
  return getServiceAppointment(id);
}

export async function updateServiceAppointment(id, serviceAppointment) {
  const { appointmentId, serviceId} = serviceAppointment;
  await pool.query(`
    UPDATE serviceAppointment 
    SET appointmentId = ?, serviceId = ?
    WHERE serviceAppointmentId = ?
  `, [appointmentId, serviceId]);
  return getServiceAppointment(id);
}

export async function deleteServiceAppointment(id) {
  const [result] = await pool.query(`DELETE FROM serviceAppointment WHERE serviceAppointmentId = ?`, [id]);
  if (result.affectedRows === 0) {
    throw new Error('No serviceAppointment found with this id');
  }
  return result;
}
