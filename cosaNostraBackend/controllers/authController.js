import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../models/db.js';
import { authenticateBarber, authenticateClient } from '../services/authService.js';
import { getClient, updateClient } from '../services/clientsService.js';
import { getBarber } from '../services/barbersService.js';

const SECRET_KEY = process.env.SECRET_KEY || '0d9f9a8d9a8df8a9df8a9d8f8adf9a8d9f8a9d8f8adf9a8df98a9d8f';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret';  // Ensure this is set properly

// Helper function to create tokens
export function createToken(user) {
  const payload = {
    id: user.id,
    userType: user.userType,  // 'client' or 'barber'
    isVIP: user.isVIP,        // Only for client
  };
  
  const accessToken = jwt.sign(payload, SECRET_KEY, {
    expiresIn: '4h', // Access token expiration time
  });

  const refreshToken = jwt.sign({ id: user.id, userType: user.userType }, REFRESH_SECRET, {
    expiresIn: '7d', // Refresh token expiration time
  });

  return { accessToken, refreshToken };
}


export async function checkPassword(req, res) {
  const { clientUsername, clientPassword, clientNewPassword } = req.body;

  // Authenticate the user
  const user = await authenticateClient(clientUsername, clientPassword);
  if (!user) {
    return res.status(401).json({ password: "Incorrect" });
  }

  try {
    const hashedPassword = await bcrypt.hash(clientNewPassword, 8);

    // Update the client's password
    await updateClient(user.clientId, { clientPassword: hashedPassword });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


// Client login handler
export async function loginHandler(req, res) {
  const { clientUsername, clientPassword } = req.body;

  const user = await authenticateClient(clientUsername, clientPassword);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  // Create both access and refresh tokens
  const { accessToken, refreshToken } = createToken({ 
    id: user.clientId, 
    userType: 'client', 
    isVIP: user.isVIP 
  });

  // Store the refresh token in an HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true, // Ensure you're using HTTPS in production
    sameSite: 'None', // Necessary for cross-origin requests
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  // Return the access token to the client
  res.json({ auth: true, accessToken });
}

export async function logoutHandler(req, res) {

  // Clear the 'token' cookie by setting its expiration to a past date
  res.clearCookie("token", {
    path: "/",               // Ensure the path matches where the cookie was set
    secure: true,             // Set this to true if you're using HTTPS in production
    sameSite: "None",         // This is necessary for cross-origin cookies
    domain: "kosa-nostra.com", // Set this to your frontend's domain
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true, // Ensure you're using HTTPS in production
    sameSite: 'None',  // This is needed for cross-origin requests
    path: '/',
  });



  // Respond with a success message
  return res.status(200).json({ message: 'Logged out successfully.' });
}


// Barber login handler
export async function barberloginHandler(req, res) {
  const { barberUsername, barberPassword } = req.body;

  // Authenticate the barber
  const user = await authenticateBarber(barberUsername, barberPassword);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  // Create both access and refresh tokens
  const { accessToken, refreshToken } = createToken({ 
    id: user.barberId, 
    userType: 'barber', 
    isVIP: user.isVIP || false,  // Barber does not need isVIP, set it to false
  });

  // Store the refresh token in an HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true, // Ensure you're using HTTPS in production
    sameSite: 'None', // Necessary for cross-origin requests
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  // Return the access token to the client
  res.json({ auth: true, accessToken });
}

// Client registration handler (no changes needed here)
export async function registerHandler(req, res, next) {
  try {
    const { clientUsername, clientPassword, clientName, clientSurname, clientPhone, clientEmail, isVIP } = req.body;

    const [existingUser] = await pool.query(`
      SELECT clientUsername FROM client WHERE clientUsername = ?
    `, [clientUsername]);

    if (existingUser.length > 0) {
      return res.status(400).send({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(clientPassword, 8);
    const [result] = await pool.query(`
      INSERT INTO client (clientUsername, clientPassword, clientName, clientSurname, clientPhone, clientEmail, isVIP)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `, [clientUsername, hashedPassword, clientName, clientSurname, clientPhone, clientEmail, isVIP]);

    const id = result.insertId;
    res.status(201).send({ id, clientUsername, clientName, clientSurname, clientPhone, isVIP });
  } catch (error) {
    next(error);
  }
}

// Barber registration handler (no changes needed here)
export async function barberregisterHandler(req, res, next) {
  try {
    const { barberUsername, barberPassword, barberName, barberSurname, barberPhone, available } = req.body;

    const [existingBarber] = await pool.query(`
      SELECT barberUsername FROM barber WHERE barberUsername = ?
    `, [barberUsername]);

    if (existingBarber.length > 0) {
      return res.status(400).send({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(barberPassword, 8);
    const [result] = await pool.query(`
      INSERT INTO barber (barberUsername, barberPassword, barberName, barberSurname, barberPhone, available)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [barberUsername, hashedPassword, barberName, barberSurname, barberPhone, available]);

    const id = result.insertId;
    res.status(201).send({ id, barberUsername, barberName, barberSurname, barberPhone, available });
  } catch (error) {
    next(error);
  }
}




// Refresh token handler
export async function refreshHandler(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken;


    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is missing' });
    }


    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    let user;
    if (decoded.userType === 'client') {
      user = await getClient(decoded.id);
    } else if (decoded.userType === 'barber') {
      user = await getBarber(decoded.id);
    } else {
      return res.status(403).json({ message: 'Invalid user type' });
    }

    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    const newAccessToken = jwt.sign(
      {
        id: decoded.id,
        userType: decoded.userType,
        ...(decoded.userType === 'client' && { isVIP: user.isVIP })
      },
      process.env.SECRET_KEY,
      { expiresIn: '15m' }
    );

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
}
