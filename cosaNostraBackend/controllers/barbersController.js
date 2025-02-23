import { getBarbers, getBarber, createBarber, updateBarber, deleteBarber } from '../services/barbersService.js';

export async function getBarbersHandler(req, res, next) {
  try {
    const barbers = await getBarbers();
    res.send(barbers);
  } catch (error) {
    next(error);
  }
}

export async function getBarberHandler(req, res, next) {
  try {
    const id = req.params.id;
    const barber = await getBarber(id);
    res.send(barber);
  } catch (error) {
    next(error);
  }
}

export async function createBarberHandler(req, res, next) {
  try {
    if (req.userType === 'client') {
      return res.status(403).send({ message: 'Access denied' });
    }

    const barber = await createBarber(req.body);
    res.status(201).send(barber);
  } catch (error) {
    next(error);
  }
}

export async function updateBarberHandler(req, res, next) {
  try {
    if (req.userType === 'client') {
      return res.status(403).send({ message: 'Access denied' });
    }

    const id = req.params.id;
    const barber = await updateBarber(id, req.body);
    res.status(200).send(barber);
  } catch (error) {
    next(error);
  }
}

export async function deleteBarberHandler(req, res, next) {
  try {
    if (req.userType === 'client') {
      return res.status(403).send({ message: 'Access denied' });
    }

    const id = req.params.id;
    await deleteBarber(id);
    res.status(200).send({ message: `Deleted barber with id: ${id}` });
  } catch (error) {
    next(error);
  }
}
