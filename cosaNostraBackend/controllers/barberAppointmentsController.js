import { getBarberAppointments, getBarberAppointment, createBarberAppointment, updateBarberAppointment, deleteBarberAppointment } from '../services/barberAppointmentsService.js';
 

export async function getBarberAppointmentsHandler(req, res, next) {
  try {
    const barberAppointments = await getBarberAppointments();
    res.send(barberAppointments);
  } catch (error) {
    next(error);
  }
}

export async function getBarberAppointmentHandler(req, res, next) {
  try {
    const id = req.params.id;
    const barberAppointment = await getBarberAppointment(id);
    res.send(barberAppointment);
  } catch (error) {
    next(error);
  }
}

export async function createBarberAppointmentsHandler(req, res, next) {
  try {
    const barberAppointment = await createBarberAppointment(req.body);
    res.status(201).send(barberAppointment);
  } catch (error) {
    next(error);
  }
}

export async function updateBarberAppointmentsHandler(req, res, next) {
  try {
    const id = req.params.id;
    const barberAppointment = await updateBarberAppointment(id, req.body);
    res.status(200).send(barberAppointment);
  } catch (error) {
    next(error);
  }
}

export async function deleteBarberAppointmentsHandler(req, res, next) {
  try {
    const id = req.params.id;
    await deleteBarberAppointment(id);
    res.status(200).send({ message: `Deleted barberAppointment with id: ${id}` });
  } catch (error) {
    next(error);
  }
}