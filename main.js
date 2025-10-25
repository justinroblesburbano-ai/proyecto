// main.js - Código JavaScript para funcionalidades interactivas

// --- CÓDIGO DE CARRITO Y CONTADOR ---
// Carga el carrito desde localStorage
let cart = JSON.parse(localStorage.getItem('urbanFitCart')) || [];
const cartCounterElement = document.getElementById('cart-counter');
const navBar = document.querySelector('.navbar'); 

// Mapeo de productos a precios (para calcular el total)
const productPrices = {
    'Camiseta Tech-Code': 89900,
    'Jean Goleador': 179900,
    'Chaqueta Active Play': 269900,
    'Sudadera Sport-Life': 139900,
    'Hoodie Code Warm': 159900,
    'Blusa Flow Code': 119900,
    'Jean Retro Goal': 189900,
    'Vestido Casual Tech': 159900,
    'Leggings Active Core': 129900,
    'Cardigan Cozy Code': 149900
};

// Formateador de moneda colombiana
const COPFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
});

// 1. Actualiza el contador visible del carrito
function updateCartCounter() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCounterElement) {
        cartCounterElement.textContent = totalItems;
    }
    // Si el carrito modal está abierto, lo refresca para reflejar el cambio
    if (document.getElementById('cartModal').style.display === 'block') {
        openCartModal(); 
    }
}

// 2. Función que se ejecuta al hacer clic en el botón "Comprar"
function mostrarAlertaCompra(nombreProducto, colorSelectId, tallaSelectId) {
    
    const colorElement = document.getElementById(colorSelectId);
    const tallaElement = document.getElementById(tallaSelectId);
    
    const colorSeleccionado = colorElement ? colorElement.value : '';
    const tallaSeleccionada = tallaElement ? tallaElement.value : '';

    if (!colorSeleccionado || !tallaSeleccionada) {
        // Alerta Dinámica: Warning (Faltan selecciones)
        showDynamicAlert('warning', `🛑 Por favor, selecciona un color y una talla para la "${nombreProducto}" antes de añadirla al carrito.`);
        return; 
    }
    
    // Obtener el precio del producto base
    const price = productPrices[nombreProducto] || 0;

    const nombreCompleto = `${nombreProducto} (Color: ${colorSeleccionado}, Talla: ${tallaSeleccionada})`;
    
    const existingItem = cart.find(item => item.name === nombreCompleto);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ 
            id: Date.now() + Math.floor(Math.random() * 1000), 
            name: nombreCompleto, 
            quantity: 1, 
            price: price, 
            baseName: nombreProducto
        }); 
    }
    
    localStorage.setItem('urbanFitCart', JSON.stringify(cart));
    
    updateCartCounter(); 
    
    // Alerta Dinámica: Success (Producto añadido)
    showDynamicAlert('success', `✅ ¡"${nombreProducto}" añadido al carrito!
    \nAhora tienes ${cart.reduce((sum, item) => sum + item.quantity, 0)} artículos.`);
}

// 3. FUNCIÓN PARA ELIMINAR ÍTEM DEL CARRITO (Botón de la caneca)
function removeItem(itemId) {
    const id = parseInt(itemId); 
    const initialLength = cart.length;
    
    cart = cart.filter(item => item.id !== id);

    if (cart.length < initialLength) {
        localStorage.setItem('urbanFitCart', JSON.stringify(cart));
        updateCartCounter(); // Actualiza contador y modal
    }
}


// --- FUNCIONES DEL MODAL DE CARRITO ---

function closeCartModal() {
    document.getElementById('cartModal').style.display = 'none';
}

function openCartModal() {
    closeCheckoutModal(); 
    closeConfirmationModal(); 
    closeDynamicAlertModal(); 
    
    const container = document.getElementById('cart-items-container');
    let total = 0;
    
    container.innerHTML = ''; 

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 30px;">Tu carrito está vacío. ¡Es hora de codificar tu outfit!</p>';
        document.getElementById('cart-total-price').textContent = COPFormatter.format(0);
        document.getElementById('cartModal').style.display = 'block';
        return;
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        
        itemDiv.innerHTML = `
            <div class="cart-item-info">
                <span class="cart-item-name">${item.quantity} x ${item.name}</span>
                <span class="cart-item-price">${COPFormatter.format(itemTotal)}</span>
            </div>
            <button class="btn-remove" onclick="removeItem(${item.id})">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        container.appendChild(itemDiv);
    });

    document.getElementById('cart-total-price').textContent = COPFormatter.format(total);
    document.getElementById('cartModal').style.display = 'block';
}


// --- FUNCIONES DEL MODAL DE CHECKOUT/PAGO ---

function closeCheckoutModal() {
    document.getElementById('checkoutModal').style.display = 'none';
}

function openCheckoutModal() {
    if (cart.length === 0) {
        // Alerta Dinámica: Info (Carrito vacío)
        showDynamicAlert('info', 'Tu carrito está vacío. ¡Añade productos para iniciar el pago!');
        return;
    }

    closeCartModal(); 
    closeConfirmationModal(); 
    closeDynamicAlertModal();
    
    const finalTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    document.getElementById('checkout-total-price-value').textContent = COPFormatter.format(finalTotal);

    document.getElementById('checkoutModal').style.display = 'block';
}

// Lógica de simulación de pago (al enviar el formulario)
document.getElementById('payment-form').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const selectedMethod = document.getElementById('payment-method').value;
    const finalTotal = document.getElementById('checkout-total-price-value').textContent;
    
    // 1. Ejecutar el modal de confirmación
    openConfirmationModal(finalTotal, selectedMethod);

    // 2. Limpiar carrito (El pago es exitoso)
    cart = [];
    localStorage.setItem('urbanFitCart', JSON.stringify(cart));
    updateCartCounter();
    closeCheckoutModal();
});


// --- FUNCIONES DEL MODAL DE CONFIRMACIÓN (Descarga de Factura) ---

function closeConfirmationModal() {
    document.getElementById('confirmationModal').style.display = 'none';
}

function openConfirmationModal(total, method) {
    // 1. Actualizar datos en el modal
    document.getElementById('conf-total-price').textContent = total;
    
    let methodName = '';
    switch (method) {
        case 'card':
            methodName = 'Tarjeta de Crédito/Débito';
            break;
        case 'pse':
            methodName = 'PSE (Transferencia Bancaria)';
            break;
        case 'nequi':
            methodName = 'Nequi / Daviplata';
            break;
        default:
            methodName = 'Método No Especificado';
    }
    document.getElementById('conf-payment-method').textContent = methodName;
    
    // Generar un ID de pedido simulado
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(Math.random() * 9000) + 1000;
    document.getElementById('conf-order-id').textContent = `UF-${datePart}-${randomPart}`;
    
    // 2. Mostrar el modal
    document.getElementById('confirmationModal').style.display = 'block';
}

function downloadInvoice() {
    const orderID = document.getElementById('conf-order-id').textContent;
    const total = document.getElementById('conf-total-price').textContent;
    const method = document.getElementById('conf-payment-method').textContent;
    
    const invoiceContent = `
        Urban Fit - Factura Electrónica
        ------------------------------------------
        No. Pedido: ${orderID}
        Fecha: ${new Date().toLocaleDateString('es-CO')}
        ------------------------------------------
        DETALLES DEL PAGO:
        Total Pagado: ${total}
        Método: ${method}
        ------------------------------------------
        
        NOTA DE REEMBOLSO:
        ESTE COMPROBANTE ES OBLIGATORIO PARA CUALQUIER PROCESO DE DEVOLUCIÓN O REEMBOLSO.
        Guárdelo en un lugar seguro.

        Gracias por su compra.
    `;
    
    // Crear un blob (archivo) con el contenido y forzar la descarga
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Factura_UrbanFit_${orderID}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Alerta Dinámica: Success (Descarga de factura)
    showDynamicAlert('success', `📄 ¡Factura descargada con éxito! \nGuarda el archivo "Factura_UrbanFit_${orderID}.txt" para futuros reembolsos.`);
}


// --- FUNCIONES DEL MODAL DE ALERTA DINÁMICA (Centralizado) ---

const dynamicModal = document.getElementById('dynamicAlertModal');
const dynamicContent = document.querySelector('.dynamic-content');
const dynamicIcon = document.getElementById('dynamic-alert-icon');
const dynamicTitle = document.getElementById('dynamic-alert-title');
const dynamicMessage = document.getElementById('dynamic-alert-message');

function closeDynamicAlertModal() {
    dynamicModal.style.display = 'none';
}

/**
 * Muestra una alerta modal personalizada.
 * @param {string} type - Tipo de alerta: 'success', 'warning', 'error', 'info'.
 * @param {string} message - Mensaje a mostrar.
 */
function showDynamicAlert(type, message) {
    // 1. Limpiar clases de estado previas
    dynamicContent.className = 'modal-content dynamic-content';
    
    let title = '';
    let iconClass = '';
    
    switch (type) {
        case 'success':
            title = '¡Operación Exitosa!';
            iconClass = 'fas fa-check-circle';
            dynamicContent.classList.add('success');
            break;
        case 'warning':
            title = 'Advertencia Necesaria';
            iconClass = 'fas fa-exclamation-triangle';
            dynamicContent.classList.add('warning');
            break;
        case 'error':
            title = 'Error de Proceso';
            iconClass = 'fas fa-times-circle';
            dynamicContent.classList.add('error');
            break;
        case 'info':
        default:
            title = 'Información Importante';
            iconClass = 'fas fa-info-circle';
            dynamicContent.classList.add('info');
            break;
    }
    
    // 2. Insertar contenido
    dynamicTitle.textContent = title;
    dynamicIcon.className = iconClass;
    dynamicMessage.textContent = message;
    
    // 3. Mostrar el modal
    dynamicModal.style.display = 'block';
}


// --- FUNCIONES DEL MODAL DE BIENVENIDA ---

function closeWelcomeModal() {
    document.getElementById('welcomeModal').style.display = 'none';
    sessionStorage.setItem('urbanFitVisited', 'true');
}

function showWelcomeModal() {
    if (!sessionStorage.getItem('urbanFitVisited')) {
        document.getElementById('welcomeModal').style.display = 'block';
    }
}


// Lógica para cerrar CUALQUIER modal haciendo clic fuera de la ventana
window.onclick = function(event) {
    const modals = [
        document.getElementById('cartModal'),
        document.getElementById('welcomeModal'),
        document.getElementById('checkoutModal'),
        document.getElementById('confirmationModal'),
        document.getElementById('dynamicAlertModal') 
    ];
    
    modals.forEach(modal => {
        if (event.target == modal) {
            modal.style.display = 'none';
            // Si es la bienvenida, marca como visitado
            if (modal.id === 'welcomeModal') {
                sessionStorage.setItem('urbanFitVisited', 'true');
            }
        }
    });
}

// 4. Función de scroll (Interactividad)
function checkScroll() {
    if (window.scrollY > 50) {
        navBar.classList.add('scrolled');
    } else {
        navBar.classList.remove('scrolled');
    }
}


// 5. Inicialización
document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter(); 
    window.addEventListener('scroll', checkScroll); 
    
    setTimeout(showWelcomeModal, 1500); 
    
    const cartLink = document.querySelector('.cart-link a');
    if (cartLink) {
        cartLink.onclick = openCartModal; 
    }
});


// 6. Función: Verificar Talla / Inventario
function verificarTalla(nombreProducto, tallasDisponibles) {
    const tallas = tallasDisponibles.split(', ').join(', '); 
    
    if (nombreProducto.includes('Chaqueta Bomber "Active Play"')) {
        // Alerta Dinámica: Warning (Inventario bajo)
        showDynamicAlert('warning', `¡Alerta! Solo quedan disponibles las tallas: L y XL para la "${nombreProducto}". ¡Compra antes de que se agoten!`);
    } else {
        // Alerta Dinámica: Info (Tallas disponibles)
        showDynamicAlert('info', `¡Excelente! Tallas disponibles: ${tallas} para la "${nombreProducto}". Para un ajuste perfecto, consulta la guía de tallas en la sección de Contacto.`);
    }

    console.log(`Verificación de talla para: ${nombreProducto}. Tallas ofrecidas: ${tallas}`);
}