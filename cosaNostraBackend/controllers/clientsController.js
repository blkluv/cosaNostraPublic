import { getClients, getClient, createClient, updateClient, updateClientByUsername, deleteClient } from '../services/clientsService.js';

export async function getClientsHandler(req, res, next) {
  try {
    const clients = await getClients();
    res.send(clients);
  } catch (error) {
    next(error);
  }
}

export async function getClientHandler(req, res, next) {
  try {
    const id = req.params.id;
    const client = await getClient(id);
    res.send(client);
  } catch (error) {
    next(error);
  }
}

export async function createClientHandler(req, res, next) {
  try {
    const client = await createClient(req.body);
    res.status(201).send(client);
  } catch (error) {
    next(error);
  }
}

export async function updateClientHandler(req, res, next) {
  try {
    const id = req.params.id;
    const client = await updateClient(id, req.body);
    res.status(200).send(client);
  } catch (error) {
    next(error);
  }
}

export async function updateClientByUsernameHandler(req, res, next) {
  try {
    const username = req.params.username;
    const client = await updateClientByUsername(username, req.body);
    res.status(200).send(client);
  } catch (error) {
    next(error);
  }
}

export async function deleteClientHandler(req, res, next) {
  try {
    const id = req.params.id;
    await deleteClient(id);
    res.status(200).send({ message: `Deleted client with id: ${id}` });
  } catch (error) {
    next(error);
  }
}
