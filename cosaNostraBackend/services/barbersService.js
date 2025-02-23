import pool from '../models/db.js';

export async function getBarbers() {
  const [rows] = await pool.query("SELECT * FROM barber");
  return rows;
}

export async function getBarber(id) {
  const [rows] = await pool.query("SELECT * FROM barber WHERE barberId = ?", [id]);
  return rows[0];
}

export async function createBarber(barber) {
  const { barberUsername, barberPassword, barberPhone, barberName, barberSurname, available } = barber;
  const [result] = await pool.query(`
    INSERT INTO barber (barberUsername, barberPassword, barberPhone, barberName, barberSurname, available)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [barberUsername, barberPassword, barberPhone, barberName, barberSurname, available]);
  const id = result.insertId;
  return getBarber(id);
}

export async function updateBarber(id, barber) {
  const updates = [];
  const values = [];

  for (const [key, value] of Object.entries(barber)) {
    updates.push(`${key} = ?`);
    values.push(value);
  }

  const query = `
    UPDATE barber
    SET ${updates.join(', ')}
    WHERE barberId = ?
  `;
  values.push(id);

  await pool.query(query, values);
  return getBarber(id);
}

export async function deleteBarber(id) {
  const [result] = await pool.query(`DELETE FROM barber WHERE barberId = ?`, [id]);
  if (result.affectedRows === 0) {
    throw new Error('No barber found with this id');
  }
  return result;
}
