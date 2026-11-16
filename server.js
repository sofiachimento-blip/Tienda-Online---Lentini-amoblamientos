const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
const DB_PATH = path.join(__dirname, 'data', 'productos.json');
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo exitosamente en el puerto ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`El puerto ${PORT} ya está en uso. Cierra la otra instancia antes de iniciar.`);
  } else {
    throw err;
  }
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Funciones auxiliares para leer y escribir el archivo JSON
function leerProductos() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function guardarProductos(productos) {
  fs.writeFileSync(DB_PATH, JSON.stringify(productos, null, 2), 'utf-8');
}

// ==================== RUTAS DE LA API REST ====================

// GET: Obtener todos los productos
app.get('/api/productos', (req, res) => {
  const productos = leerProductos();
  res.json(productos);
});

// POST: Agregar un nuevo producto al catálogo
app.post('/api/productos', (req, res) => {
  const productos = leerProductos();
  const nuevoProducto = {
    id: Date.now().toString(),
    nombre: req.body.nombre,
    categoria: req.body.categoria || "Muebles",
    precio: Number(req.body.precio),
    stock: Number(req.body.stock),
    descripcion: req.body.descripcion || "",
    imagen: req.body.imagen,
    visible: true,
    fechaCreacion: new Date()
  };

  productos.push(nuevoProducto);
  guardarProductos(productos);
  res.status(201).json({ mensaje: "Producto agregado correctamente", producto: nuevoProducto });
});

// PUT: Actualizar un producto existente (Stock / Visibilidad / Datos)
app.put('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  let productos = leerProductos();
  const index = productos.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }

  productos[indserverex] = { ...productos[index], ...req.body };
  guardarProductos(productos);

  res.json({ mensaje: "Producto actualizado", producto: productos[index] });
});

// DELETE: Eliminar un producto por ID
app.delete('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  let productos = leerProductos();
  const productosFiltrados = productos.filter(p => p.id !== id);

  if (productos.length === productosFiltrados.length) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }

  guardarProductos(productosFiltrados);
  res.json({ mensaje: "Producto eliminado correctamente" });
});

// Servir la aplicación cliente en la ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Lentini - clientes.html'));
});
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Lentini - administrador.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Servidor de Lentini Amoblamientos corriendo en:`);
  console.log(` http://localhost:${PORT}`);
  console.log(`====================================================`);
});
function guardarProductos(productos) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(productos, null, 2), 'utf-8');
} 