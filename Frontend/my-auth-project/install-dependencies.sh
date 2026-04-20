#!/bin/bash

# Navigate to the project directory
cd Frontend/my-auth-project

# Install required dependencies
npm install lucide-react react-router-dom @auth0/auth0-react axios bootstrap tailwindcss tailwindcss-animate postcss autoprefixer

# Create a postcss.config.js file if it doesn't exist
if [ ! -f postcss.config.js ]; then
  echo "module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}" > postcss.config.js
fi

# Create or update vite.config.js
echo "import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});" > vite.config.js

echo "Dependencies installed and configuration files created successfully!"
