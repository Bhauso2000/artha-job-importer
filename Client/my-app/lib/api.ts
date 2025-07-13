// lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

 