import { getServiceAppointments, getServiceAppointment, createServiceAppointment, updateServiceAppointment, deleteServiceAppointment } from '../services/serviceappointmentsService.js';

export async function getServiceAppointmentsHandler(req, res, next) {
  try {
    const serviceAppointments = await getServiceAppointments();
    res.send(serviceAppointments);
  } catch (error) {
    next(error);
  }
}

export async function getServiceAppointmentHandler(req, res, next) {
  try {
    const id = req.params.id;
    const serviceAppointment = await getServiceAppointment(id);
    res.send(serviceAppointment);
  } catch (error) {
    next(error);
  }
}

export async function createServiceAppointmentsHandler(req, res, next) {
  try {
    const serviceAppointment = await createServiceAppointment(req.body);
    res.status(201).send(serviceAppointment);
  } catch (error) {
    next(error);
  }
}

export async function updateServiceAppointmentsHandler(req, res, next) {
  try {
    const id = req.params.id;
    const serviceAppointment = await updateServiceAppointment(id, req.body);
    res.status(200).send(serviceAppointment);
  } catch (error) {
    next(error);
  }
}

export async function deleteServiceAppointmentsHandler(req, res, next) {
  try {
    const id = req.params.id;
    await deleteServiceAppointment(id);
    res.status(200).send({ message: `Deleted serviceAppointment with id: ${id}` });
  } catch (error) {
    next(error);
  }
}
