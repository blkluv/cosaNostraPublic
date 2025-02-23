import pool from '../models/db.js';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import util from 'util'; // Import the util module
import { getClient } from './clientsService.js'; // Adjust the path as needed
import { getService } from './servicesService.js'; // Adjust the path as needed
import { DateTime } from 'luxon';
const SCOPES = process.env.SCOPES;
const PRIV_KEY = process.env.GOOGLE_PRIVATE_KEY;
const CLIENT_MAIL = process.env.GOOGLE_CLIENT_MAIL;
const PROJ_NUM = process.env.GOOGLE_PROJECT_NUMBER;
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

export async function getAppointments() {
  const [rows] = await pool.query("SELECT * FROM appointment");
  return rows;
}

export async function getAppointment(id) {
  const [rows] = await pool.query("SELECT * FROM appointment WHERE appointmentId = ?", [id]);
  return rows[0];
}

export async function createAppointment(appointment) {
  const { appointmentDate, appointmentTime, note, appointmentDuration, barberId, clientId, serviceId } = appointment;

  try {
    // Fetch client details
    const client = await getClient(clientId);
    const clientName = client.clientName;
    const clientSurname = client.clientSurname;
    const clientPhone = client.clientPhone;

    // Fetch service details
    const service = await getService(serviceId);
    const serviceName = service.serviceName;
    const serviceDuration = service.serviceDuration;

    // Calculate end time
    const startDateTime = DateTime.fromISO(`${appointmentDate}T${appointmentTime}`, { zone: 'Europe/Belgrade' });
    const endDateTime = startDateTime.plus({ minutes: serviceDuration });

    // Format the date and time in ISO 8601 format
    const startTimeISO = startDateTime.toISO();
    const endTimeISO = endDateTime.toISO();

    // Create the event object
    const event = {
      summary: `${clientName} ${clientSurname}`,
      description: `${clientName} ${clientSurname} - ${serviceName} Broj Telefona: ${clientPhone}`,
      start: {
        dateTime: startTimeISO,
        timeZone: 'Europe/Belgrade', // Set timezone to Belgrade
      },
      end: {
        dateTime: endTimeISO,
        timeZone: 'Europe/Belgrade', // Set timezone to Belgrade
      },
      attendees: [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const jwtClient = new google.auth.JWT(
      CLIENT_MAIL,
      null,
      PRIV_KEY,
      SCOPES
    );
    
    const calendar = google.calendar({
      version: 'v3',
      project: PROJ_NUM,
      auth: jwtClient
    });

    const auth = new google.auth.GoogleAuth({
        keyFile: './models/logical-iridium-449815-d4-a3d624db919d.json',
        scopes: 'https://www.googleapis.com/auth/calendar',
      });
      auth.getClient().then(a=>{
        calendar.events.insert({
          auth:a,
          calendarId: CALENDAR_ID,
          resource: event,
        }, function(err, event) {
          if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
          }
        });
      })


    // Insert the appointment into the database
    const [result] = await pool.query(
      `INSERT INTO appointment (appointmentDate, appointmentTime, note, appointmentDuration, barberId, clientId, serviceId)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [appointmentDate, appointmentTime, note, serviceDuration, barberId, clientId, serviceId]
    );

    const id = result.insertId;
    return getAppointment(id);
  } catch (error) {
    console.error('Error creating appointment:', error.message);
    console.error('Error details:', error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

export async function createGuestAppointment(appointment) {
  const { appointmentDate, appointmentTime, note, appointmentDuration, barberId, clientId, serviceId } = appointment;

  try {

    // Calculate end time
    const startDateTime = DateTime.fromISO(`${appointmentDate}T${appointmentTime}`, { zone: 'Europe/Belgrade' });
    const endDateTime = startDateTime.plus({ minutes: appointmentDuration });

    // Format the date and time in ISO 8601 format
    const startTimeISO = startDateTime.toISO();
    const endTimeISO = endDateTime.toISO();

    // Insert the appointment into the database first
    const [result] = await pool.query(
      `INSERT INTO appointment (appointmentDate, appointmentTime, note, appointmentDuration, barberId, clientId, serviceId)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [appointmentDate, appointmentTime, note, appointmentDuration, barberId, clientId, serviceId]
    );

    const appointmentId = result.insertId; // Get the appointmentId from the result

    // Now create the event object with the appointmentId as eventId
    const event = {
      summary: `${note}`,
      description: `${note}`,
      start: {
        dateTime: startTimeISO,
        timeZone: 'Europe/Belgrade', // Set timezone to Belgrade
      },
      end: {
        dateTime: endTimeISO,
        timeZone: 'Europe/Belgrade', // Set timezone to Belgrade
      },
      attendees: [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const jwtClient = new google.auth.JWT(
      CLIENT_MAIL,
      null,
      PRIV_KEY,
      SCOPES
    );
    
    const calendar = google.calendar({
      version: 'v3',
      project: PROJ_NUM,
      auth: jwtClient
    });

    const auth = new google.auth.GoogleAuth({
      keyFile: './models/logical-iridium-449815-d4-a3d624db919d.json',
      scopes: 'https://www.googleapis.com/auth/calendar',
    });

    auth.getClient().then(a => {
      calendar.events.insert({
        auth: a,
        calendarId: CALENDAR_ID,
        resource: event,
      }, function(err, event) {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err);
          return;
        }
      });
    });

    // Return the appointment with its ID
    return getAppointment(appointmentId);

  } catch (error) {
    console.error('Error creating appointment:', error.message);
    console.error('Error details:', error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}


export async function updateAppointment(id, appointment) {
  const { appointmentDate, appointmentTime, note, appointmentDuration, barberId, clientId } = appointment;
  await pool.query(`
    UPDATE appointment 
    SET appointmentDate = ?, appointmentTime = ?, note = ?, appointmentDuration = ?, barberId = ?, clientId = ?
    WHERE appointmentId = ?
  `, [appointmentDate, appointmentTime, note, appointmentDuration, barberId, clientId, id]);
  return getAppointment(id);
}

export async function getAppointmentsByBarberAndDate(barberId, date) {
  const [result] = await pool.query(`SELECT * FROM appointment WHERE barberId = ? AND appointmentDate = ?`,
    [barberId, date]);
  return result;
}

export async function getAppointmentDetails(barberId) {
  const [result] = await pool.query(`
    SELECT
      A.appointmentId, 
      A.appointmentDate,
      A.appointmentTime,
      A.appointmentDuration,
      A.note,
      C.clientName,
      C.clientSurname,
      C.clientPhone,
      S.serviceName,
      S.servicePrice
    FROM 
      appointment A
    LEFT JOIN 
      client C ON A.clientId = C.clientId
    LEFT JOIN 
      service S ON A.serviceId = S.serviceId
    WHERE 
      A.barberId = ?;
  `, [barberId]);
  return result;
}

export async function getAppointmentDetailsForClient(clientId) {
  const [result] = await pool.query(`
    SELECT 
      A.appointmentDate,
      A.appointmentTime,
      B.barberName,
      B.barberSurname,
      B.barberPhone,
      S.serviceName,
      S.servicePrice
    FROM 
      appointment A
    JOIN 
      barber B ON A.barberId = B.barberId
    JOIN 
      service S ON A.serviceId = S.serviceId
    WHERE 
      A.clientId = ?;
  `, [clientId]);
  return result;
}

export async function deleteAppointment(appointmentId) {
  try {
    // Step 1: Get the appointment details from the database
    const appointment = await getAppointment(appointmentId); // Using the getAppointment function you provided
    if (!appointment) {
      throw new Error('No appointment found with this ID');
    }

    const { appointmentDate, appointmentTime, note, appointmentDuration } = appointment;

    const parsedDate = DateTime.fromJSDate(appointmentDate, { zone: "utc" }).setZone("Europe/Belgrade")
  
    // Ensure appointmentTime is in HH:mm:ss format
    const formattedTime = appointmentTime.length === 5 ? `${appointmentTime}:00` : appointmentTime;
    
    // Combine parsed date and time correctly
    const startDateTime = DateTime.fromFormat(
      `${parsedDate.toFormat("yyyy-MM-dd")} ${formattedTime}`,
      "yyyy-MM-dd HH:mm:ss",
      { zone: "Europe/Belgrade" }
    );
    
    if (!startDateTime.isValid) {
      throw new Error(`❌ Invalid start date format: ${parsedDate.toFormat("yyyy-MM-dd")} ${formattedTime}`);
    }
    
    const endDateTime = startDateTime.plus({ minutes: appointmentDuration });
    
    const startTimeISO = startDateTime.toISO();
    const endTimeISO = endDateTime.toISO();
    

    // Step 2: Find the event in Google Calendar
    const jwtClient = new google.auth.JWT(
      CLIENT_MAIL,
      null,
      PRIV_KEY,
      SCOPES
    );

    const calendar = google.calendar({
      version: 'v3',
      project: PROJ_NUM,
      auth: jwtClient,
    });

    const auth = new google.auth.GoogleAuth({
      keyFile: './models/logical-iridium-449815-d4-a3d624db919d.json',
      scopes: 'https://www.googleapis.com/auth/calendar',
    });

    const authClient = await auth.getClient();



    // Query Google Calendar using the event details to find the event
    const calendarEvents = await calendar.events.list({
      auth: authClient,
      calendarId: CALENDAR_ID,
      timeMin: startTimeISO, // Start date and time
      timeMax: endTimeISO, // End date and time
      singleEvents: true,
      q: note, // Optionally use note to find the specific event, or other identifying fields
    });

    // Step 3: Delete the event if it's found
    if (calendarEvents.data.items.length > 0) {
      const eventId = calendarEvents.data.items[0].id; // Get the eventId from the search result

      // Delete the event in Google Calendar
      await calendar.events.delete({
        auth: authClient,
        calendarId: CALENDAR_ID,
        eventId: eventId,
      });


      // Step 4: Delete the appointment from the database
      const [result] = await pool.query(
        `DELETE FROM appointment WHERE appointmentId = ?`,
        [appointmentId]
      );

      if (result.affectedRows === 0) {
        throw new Error('No appointment found with this ID');
      }

      return { success: true, message: 'Appointment deleted successfully' };
    } else {
      throw new Error('Event not found in Google Calendar for the given time');
    }

  } catch (error) {
    console.error('❌ Error deleting appointment:', error.message);
    return { success: false, message: error.message };
  }
}




export async function deleteLastAppointment() {
  const [result] = await pool.query(`DELETE FROM appointment ORDER BY appointmentId DESC LIMIT 1;`);
  if (result.affectedRows === 0) {
    throw new Error('No appointments');
  }
  return result;
}