# WebAuthn Passwordless Demo

A demonstration of a passwordless authentication system using WebAuthn (FIDO2/Passkeys).

## Project Overview

This project implements a secure, modern authentication flow without passwords. Users register their biometric data (Fingerprint, FaceID) via the browser's WebAuthn API.

## Core Technologies

- **Frontend**: React, Vite, TailwindCSS, Lucide Icons
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **Authentication**: @simplewebauthn/server & @simplewebauthn/browser
- **Security**: JWT, Helmet, CORS, Encryption (AES-256-CBC)

## Database Clarification

**Note on `user.db`**: You might see references to "database" or "user data". This project uses **MongoDB Atlas** (Cloud Database) as its backend storage, not a local file named `user.db`.

All user credentials and application data are stored securely in two main collections:

1. `Users`: Stores account details, roles, and WebAuthn Public Keys.
2. `Pengajuan`: Stores encrypted service requests.

## Project Structure

- `/client`: Frontend React application.
- `/server`: Backend Express API.
- `/server/models`: Mongoose schemas for data structure.
- `/server/controllers`: Logic for WebAuthn, Users, and Services.

## Getting Started

1. Set up `.env` files in both `client` and `server` directories.
2. Install dependencies: `npm install`.
3. Run development servers: `npm run dev`.
