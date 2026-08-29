const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/staff/6a2d095011bba2e3968a4d06',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    // We need a valid cookie for SUPER_ADMIN to test this.
    // I might not have the cookie.
  }
};
// Instead of HTTP request, let's just grep the Next.js logs.
