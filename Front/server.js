const express = require('express');
const path = require('path');
const app = express();

// Servir archivos estáticos del build de Angular
app.use(express.static(path.join(__dirname, 'dist/front/browser')));

// Redirigir todas las rutas al index.html (para Angular routing)
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/front/browser', 'index.html'));
});

// Puerto dinámico de Render
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Servidor frontend corriendo en puerto ${port}`);
});
