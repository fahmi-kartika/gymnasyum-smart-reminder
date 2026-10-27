const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gymnasyum Smart Reminder API',
      version: '1.0.0',
      description: 'Dokumentasi RESTful API untuk Sistem Manajemen Jadwal dan Follow-up Pelanggan Gymnasyum',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
  },
  apis: ['./routes/*.js'], // Menghubungkan dokumentasi dari komentar anotasi di folder routes
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;