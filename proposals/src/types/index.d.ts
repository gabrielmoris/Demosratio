// types/express/index.d.ts
import express from "express";

interface UserPayload {
  id: string;
  email: string;
}

// This is a way to extend the Request object from express
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
      session?: { jwt: string };
    }
  }
}
