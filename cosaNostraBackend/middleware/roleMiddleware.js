// Middleware to check if user is a barber
export function isBarber(req, res, next) {
  if (req.userType !== 'barber') {
    return res.status(403).json({ message: 'Access denied. Barbers only.' });
  }
  next();
}

// Middleware to check if user is a client
export function isClient(req, res, next) {
  if (req.userType !== 'client') {
    return res.status(403).json({ message: 'Access denied. Clients only.' });
  }
  next();
}
