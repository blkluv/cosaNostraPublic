import pool from '../models/db.js';



export async function getServices() {
  const [rows] = await pool.query("SELECT * FROM service");
  return rows;
}

export async function getService(id) {
  const [rows] = await pool.query("SELECT * FROM service WHERE serviceId = ?", [id]);
  return rows[0];
}

export async function createService(service) {
  const { serviceName, serviceType, serviceDuration, servicePrice} = service
const [result] = await pool.query(`
INSERT INTO service (serviceName, serviceType, serviceDuration, servicePrice)
VALUES (?, ?, ?, ?)
`, [serviceName, serviceType, serviceDuration, servicePrice])
const id = result.insertId;
return getService(id);
}


export async function deleteService(id) {
  const [result] = await pool.query(`
    DELETE FROM service 
    WHERE serviceId = ?
  `, [id]);

  if (result.affectedRows === 0) {
    throw new Error('No service found with this id');
  }

  return result;
}


export async function updateService(id, service) {
  const { serviceName, serviceType, serviceDuration, servicePrice } = service;

  await pool.query(`
    UPDATE service 
    SET serviceName = ?, serviceType = ?, serviceDuration = ?, servicePrice = ?
    WHERE serviceId = ?
  `, [serviceName, serviceType, serviceDuration, servicePrice, id]);

  return getService(id);
}

export async function getServicePrice(id) {
  try {
    const [rows] = await pool.query("SELECT servicePrice FROM service WHERE serviceId = ?", [id]);
    if (rows.length === 0) {
      throw new Error('Service not found');
    }
    return rows[0].servicePrice;
  } catch (error) {
    throw new Error('Failed to get service price');
  }
}


