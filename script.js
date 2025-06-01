const totalKey = 'total-pago';
  const carritoKey = 'carrito';
  let total = parseFloat(localStorage.getItem(totalKey)) || 0;
  let carrito = JSON.parse(localStorage.getItem(carritoKey)) || [];
  let productoSeleccionado = null;

  function formatCurrency(amount) {
    return "$" + amount.toFixed(2);
  }

  function actualizarTotal() {
    document.getElementById('total-amount').textContent = formatCurrency(total);
    localStorage.setItem(totalKey, total.toFixed(2));
    localStorage.setItem(carritoKey, JSON.stringify(carrito));
  }

  function abrirModal(producto) {
    productoSeleccionado = producto;
    document.getElementById('cantidad-input').value = '';
    document.getElementById('modal-cantidad').classList.remove('hidden');
  }

  function cerrarModal() {
    productoSeleccionado = null;
    document.getElementById('modal-cantidad').classList.add('hidden');
  }

  function abrirCalculadora() {
    const lista = document.getElementById('lista-productos');
    lista.innerHTML = '';

   carrito.forEach((p, index) => {
  const item = document.createElement('li');
  item.className = 'flex justify-between items-center border-b py-1';
  item.innerHTML = `
    <span>${p.cantidad} × ${p.nombre}</span>
    <span class="flex items-center gap-2">
      ${formatCurrency(p.subtotal || p.precio * p.cantidad)}
      <button onclick="eliminarProducto(${index})" aria-label="Eliminar producto" class="text-red-600 hover:text-red-800 font-bold">×</button>
    </span>
  `;
  lista.appendChild(item);
});



    document.getElementById('total-calculadora').textContent = formatCurrency(total);
    document.getElementById('calculadora').classList.remove('hidden');
  }

  function cerrarCalculadora() {
    document.getElementById('calculadora').classList.add('hidden');
  }

  document.addEventListener('DOMContentLoaded', () => {
    actualizarTotal();

    document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', () => {
        abrirModal({
          nombre: button.getAttribute('data-name'),
          precio: parseFloat(button.getAttribute('data-price')),
          ofertaCantidad: parseInt(button.getAttribute('data-oferta-cantidad')) || 0,
          ofertaPrecio: parseFloat(button.getAttribute('data-oferta-precio')) || 0
        });
      });
    });

    document.getElementById('confirmar-modal').addEventListener('click', () => {
      const cantidad = parseInt(document.getElementById('cantidad-input').value);
      if (!isNaN(cantidad) && cantidad > 0 && productoSeleccionado) {
        const { precio, ofertaCantidad, ofertaPrecio } = productoSeleccionado;

        let subtotal = 0;
        if (ofertaCantidad && ofertaPrecio) {
          const combos = Math.floor(cantidad / ofertaCantidad);
          const restantes = cantidad % ofertaCantidad;
          subtotal = combos * ofertaPrecio + restantes * precio;
        } else {
          subtotal = cantidad * precio;
        }

        total += subtotal;
        carrito.push({ 
          nombre: productoSeleccionado.nombre, 
          precio: precio, 
          cantidad: cantidad, 
          subtotal: subtotal 
        });

        actualizarTotal();
        cerrarModal();
      } else {
        alert("Ingresa una cantidad válida.");
      }
    });

    document.getElementById('cancelar-modal').addEventListener('click', cerrarModal);

    document.getElementById('limpiar-carrito').addEventListener('click', () => {
      if (confirm('¿Ya te pagaron? Esto reiniciará el total.')) {
        total = 0;
        carrito = [];
        localStorage.removeItem(totalKey);
        localStorage.removeItem(carritoKey);
        actualizarTotal();
        cerrarCalculadora();
      }
    });

    // Buscador
    const buscadorInput = document.querySelector('input[type="search"]');
    buscadorInput.addEventListener('keyup', () => {
      const filtro = buscadorInput.value.toLowerCase();
      const productos = document.querySelectorAll('.producto');

      productos.forEach(producto => {
        const nombre = producto.querySelector('.nombre-producto').textContent.toLowerCase();
        producto.style.display = nombre.includes(filtro) ? 'block' : 'none';
      });
    });

    // Filtro por categoría
    document.querySelectorAll('.btn-categoria').forEach(boton => {
      boton.addEventListener('click', () => {
        const categoria = boton.getAttribute('data-categoria');
        const productos = document.querySelectorAll('.producto');

        productos.forEach(producto => {
          const categoriaProducto = producto.getAttribute('data-categoria');
          producto.style.display = (categoria === 'todos' || categoriaProducto === categoria) ? 'block' : 'none';
        });

        document.querySelectorAll('.btn-categoria').forEach(btn => {
          btn.classList.remove('categoria-activa');
        });
        boton.classList.add('categoria-activa');
      });
    });

    // Menú lateral
    const botonMenu = document.querySelector('header button[aria-label="Menu"]');
    const menuLateral = document.getElementById('menu-lateral');
    const menuFondo = document.getElementById('menu-fondo');

    function abrirMenu() {
      menuLateral.classList.remove('-translate-x-full');
      menuFondo.classList.remove('hidden');
    }

    function cerrarMenu() {
      menuLateral.classList.add('-translate-x-full');
      menuFondo.classList.add('hidden');
    }

    botonMenu.addEventListener('click', () => {
      if (menuLateral.classList.contains('-translate-x-full')) {
        abrirMenu();
      } else {
        cerrarMenu();
      }
    });

    menuFondo.addEventListener('click', cerrarMenu);

    // Calculadora
    document.getElementById('icono-calculadora').addEventListener('click', abrirCalculadora);
    document.getElementById('cerrar-calculadora').addEventListener('click', cerrarCalculadora);
  });
  
 function eliminarProducto(index) {
  if (index < 0 || index >= carrito.length) return;

  const producto = carrito[index];

  if (producto.cantidad > 1) {
    let unidades = prompt(`Este producto tiene ${producto.cantidad} unidades.\n¿Cuántas unidades deseas eliminar?`);
    unidades = parseInt(unidades);

    if (isNaN(unidades) || unidades <= 0) {
      alert("Cantidad inválida.");
      return;
    }
    if (unidades > producto.cantidad) {
      alert("No puedes eliminar más unidades de las que tienes.");
      return;
    }

    // Calcular el subtotal a restar basado en la cantidad que se elimina
    const precioUnitario = producto.subtotal / producto.cantidad;
    const subtotalARestar = precioUnitario * unidades;

    producto.cantidad -= unidades;
    producto.subtotal -= subtotalARestar;

    total -= subtotalARestar;
    if (total < 0) total = 0;

    if (producto.cantidad === 0) {
      carrito.splice(index, 1);
    }
  } else {
    // Solo 1 unidad, eliminar producto completo
    total -= producto.subtotal;
    if (total < 0) total = 0;
    carrito.splice(index, 1);
  }

  actualizarTotal();
  abrirCalculadora();
}

