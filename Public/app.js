const API_URL = '/api/productos';

let productos = [];
let carrito = [];

// Obtener productos desde la API REST de Node.js
async function cargarProductosDesdeServidor() {
  try {
    const respuesta = await fetch(API_URL);
    productos = await respuesta.json();
    renderizarTienda();
    renderizarAdmin();
  } catch (error) {
    console.error("Error al conectar con la API de Node.js:", error);
  }
}

// RENDERIZAR TIENDA
function renderizarTienda() {
  const contenedor = document.getElementById('grilla-productos');
  if (!contenedor) return;
  contenedor.innerHTML = '';
  
  const disponibles = productos.filter(p => p.visible && p.stock > 0);

  if (disponibles.length === 0) {
    contenedor.innerHTML = `<p class="col-span-full text-center text-gray-500 py-12">No hay productos disponibles en stock.</p>`;
    return;
  }

  disponibles.forEach(prod => {
    const card = document.createElement('div');
    card.className = "bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between";
    card.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}" class="h-48 w-full object-cover">
      <div class="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">${prod.categoria}</span>
          <h3 class="font-bold text-slate-800 text-lg my-1">${prod.nombre}</h3>
          <p class="text-gray-500 text-xs mb-3">${prod.descripcion || ''}</p>
          <p class="text-amber-600 font-extrabold text-xl mb-4">$${Number(prod.precio).toLocaleString('es-AR')}</p>
        </div>
        <button class="btn-agregar w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg transition" data-id="${prod.id}">
          Agregar al Carrito
        </button>
      </div>
    `;
    contenedor.appendChild(card);
  });

  document.querySelectorAll('.btn-agregar').forEach(btn => {
    btn.addEventListener('click', (e) => agregarAlCarrito(e.target.dataset.id));
  });
}

// RENDERIZAR TABLA DE ADMINISTRACIÓN
function renderizarAdmin() {
  const tabla = document.getElementById('tabla-admin');
  if (!tabla) return;
  tabla.innerHTML = '';

  productos.forEach(prod => {
    const fila = document.createElement('tr');
    fila.className = "border-b text-sm";
    fila.innerHTML = `
      <td class="p-3 font-medium flex items-center gap-3">
        <img src="${prod.imagen}" class="w-10 h-10 rounded object-cover"> ${prod.nombre}
      </td>
      <td class="p-3">$${Number(prod.precio).toLocaleString('es-AR')}</td>
      <td class="p-3">
        <input type="number" value="${prod.stock}" data-id="${prod.id}" class="input-stock w-16 p-1 border rounded text-center">
      </td>
      <td class="p-3">
        <button data-id="${prod.id}" data-estado="${!prod.visible}" class="btn-visibilidad px-3 py-1 rounded text-xs font-semibold ${prod.visible ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
          ${prod.visible ? 'Visible' : 'Oculto'}
        </button>
      </td>
      <td class="p-3 text-right">
        <button data-id="${prod.id}" class="btn-eliminar text-rose-600 hover:text-rose-800"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tabla.appendChild(fila);
  });

  // Eventos de cambios (Se comunican con el servidor Node.js vía PUT y DELETE)
  document.querySelectorAll('.input-stock').forEach(input => {
    input.addEventListener('change', async (e) => {
      const id = e.target.dataset.id;
      const nuevoStock = Number(e.target.value);
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: nuevoStock })
      });
      cargarProductosDesdeServidor();
    });
  });

  document.querySelectorAll('.btn-visibilidad').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      const estado = e.target.dataset.estado === 'true';
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: estado })
      });
      cargarProductosDesdeServidor();
    });
  });

  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (confirm("¿Deseas eliminar este producto del servidor?")) {
        const id = e.target.closest('button').dataset.id;
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        cargarProductosDesdeServidor();
      }
    });
  });
}

// AGREGAR NUEVO PRODUCTO DESDE EL FORMULARIO ADMIN (POST)
const formProducto = document.getElementById('form-producto');
if (formProducto) {
  formProducto.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nuevoProducto = {
      nombre: document.getElementById('p-nombre').value,
      categoria: document.getElementById('p-categoria').value,
      precio: Number(document.getElementById('p-precio').value),
      stock: Number(document.getElementById('p-stock').value),
      descripcion: document.getElementById('p-descripcion').value,
      imagen: document.getElementById('p-imagen-url').value || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500'
    };

    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoProducto)
    });

    e.target.reset();
    alert("¡Producto guardado en el servidor Node.js!");
    cargarProductosDesdeServidor();
  });
}

// Inicializar la aplicación cargando datos del servidor
cargarProductosDesdeServidor();