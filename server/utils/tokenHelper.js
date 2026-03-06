import jwt from 'jsonwebtoken';

// Fungsi buat bikin token login (JWT)
export const generateToken = (userId, expiresIn = '7d') => {
  // Masukin userId ke dalam token dan kunci pake JWT_SECRET dari .env
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
};
