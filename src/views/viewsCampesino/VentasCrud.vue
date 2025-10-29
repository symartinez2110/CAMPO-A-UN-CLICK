<script setup>
import { ref, onMounted } from "vue";
// Asegúrate de que la ruta a useApi sea correcta en tu proyecto
import useApi from "../../componsables/useApi"; 

// Chart.js
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "vue-chartjs";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Incluir 'del' para la eliminación de ventas y detalles.
const { get, post, put, del } = useApi(); 

// 🎯 ESTADOS GLOBALES
const ventas = ref([]);
const productos = ref([]);
const compradores = ref([]);
const loading = ref(false);

// 🎯 ESTADOS DEL CRUD PRINCIPAL (Ventas)
const showForm = ref(false); 
const showEditForm = ref(false); 
const nuevaVenta = ref({
    id_producto: "", 
    id_comprador: "",
    cantidad: "",
    monto_total: ""
});
const ventaAEditar = ref({
    id_venta: null,
    id_producto: "",
    id_comprador: "",
    cantidad: "",
    monto_total: ""
});

// 🎯 ESTADOS DEL CRUD ANIDADO (Detalles de Venta)
const showDetallesModal = ref(false);
const ventaSeleccionada = ref(null);
const detallesVenta = ref([]);

// Datos del gráfico (con inicialización segura)
const chartData = ref({
    labels: [],
    datasets: [
        {
            label: "Monto total ($)",
            data: [],
            backgroundColor: "rgba(100,177,41,0.8)",
        },
    ],
});
const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: true
        }
    }
});

// ----------------------------------------------------
// 📌 FUNCIONES DE CARGA Y CÁLCULO
// ----------------------------------------------------

async function cargarDatosIniciales() {
    loading.value = true;
    try {
        const [ventasData, productosData, usuariosData] = await Promise.all([
            get("/ventas"),
            get("/productos"), 
            get("/usuarios")
        ]);
        
        ventas.value = ventasData;
        productos.value = productosData;
        compradores.value = usuariosData.filter(u => u.rol === 'comprador' || u.rol === 'campesino');
        
        procesarDatosGrafico(ventasData);

    } catch (error) {
        console.error("Error cargando datos iniciales:", error);
        alert("Hubo un error al cargar las ventas o datos relacionados.");
    } finally {
        loading.value = false;
    }
}

function procesarDatosGrafico(data) {
    // Agrupamos ventas por fecha para el gráfico
    const ventasPorFecha = data.reduce((acc, venta) => {
        // ✅ CORRECCIÓN CLAVE: Usamos 'venta.fecha' del modelo
        const fecha = new Date(venta.fecha).toLocaleDateString('es-CO'); 
        acc[fecha] = (acc[fecha] || 0) + venta.monto_total;
        return acc;
    }, {});

    const labels = Object.keys(ventasPorFecha).sort((a, b) => new Date(a) - new Date(b));
    const dataValues = labels.map(label => ventasPorFecha[label]);

    chartData.value = {
        labels: labels,
        datasets: [
            {
                label: "Monto total ($)",
                data: dataValues,
                backgroundColor: "rgba(100,177,41,0.8)",
            },
        ],
    };
}


// ----------------------------------------------------
// 📌 FUNCIONES DEL CRUD DE VENTAS
// ----------------------------------------------------

async function guardarVenta() {
    if (!nuevaVenta.value.id_comprador || !nuevaVenta.value.monto_total) {
        alert("El comprador y el monto total son obligatorios.");
        return;
    }

    try {
        await post("/ventas", nuevaVenta.value); 
        alert('Venta creada correctamente.');
        
        showForm.value = false;
        nuevaVenta.value = { id_producto: "", id_comprador: "", cantidad: "", monto_total: "" };
        await cargarDatosIniciales(); 
    } catch (error) {
        console.error("Error al guardar venta:", error);
        alert(`Error al crear venta: ${error.message}`);
    }
}

function cargarVentaParaEditar(venta) {
    ventaAEditar.value = { ...venta }; 
    showEditForm.value = true;
}

async function actualizarVenta() {
    try {
        await put(`/ventas/${ventaAEditar.value.id_venta}`, ventaAEditar.value);
        alert('Venta actualizada correctamente.');
        
        showEditForm.value = false;
        await cargarDatosIniciales();
    } catch (error) {
        console.error("Error al actualizar venta:", error);
        alert(`Error al actualizar venta: ${error.message}`);
    }
}

async function eliminarVenta(id_venta) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta Venta? ¡Se eliminarán todos sus detalles!')) {
        return;
    }
    
    try {
        await del(`/ventas/${id_venta}`); 
        alert('Venta eliminada correctamente.');
        await cargarDatosIniciales();
    } catch (error) {
        console.error("Error al eliminar venta:", error);
        alert(`Error al eliminar venta: ${error.message}. Asegúrate de que el backend pueda eliminar los detalles asociados primero.`);
    }
}

// ----------------------------------------------------
// 📌 FUNCIONES DEL CRUD DE DETALLES 
// ----------------------------------------------------

async function cargarDetallesVenta(venta) {
    ventaSeleccionada.value = venta;
    showDetallesModal.value = true;
    loading.value = true;
    detallesVenta.value = [];

    try {
        // La ruta es '/detalles-venta/venta/:id_venta' sin el prefijo /api
        const data = await get(`/detalles-venta/venta/${venta.id_venta}`);
        detallesVenta.value = data;
    } catch (error) {
        console.error("Error cargando detalles de venta:", error);
        detallesVenta.value = [];
        alert("Error al cargar los detalles de la venta. Revisa la consola.");
    } finally {
        loading.value = false;
    }
}

async function eliminarDetalle(id_detalle) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto de la venta?')) return;
    
    try {
        await del(`/detalles-venta/${id_detalle}`);
        alert('Detalle eliminado correctamente.');
        
        if (ventaSeleccionada.value) {
            await cargarDetallesVenta(ventaSeleccionada.value);
        }
        await cargarDatosIniciales();
    } catch (error) {
        console.error("Error al eliminar detalle:", error);
        alert(`Error al eliminar detalle: ${error.message}`);
    }
}

onMounted(cargarDatosIniciales);
</script>

<template>
    <div class="gestion-container">
        <h2>Reporte y Gestión de Ventas</h2>

        <button @click="showForm = true" class="btn-crear">
            Registrar Nueva Venta
        </button>

        <div class="chart-container">
            <h3>Ventas por Día</h3>
            <div class="chart-wrapper">
                <Bar v-if="chartData.labels.length" :data="chartData" :options="chartOptions" />
                <p v-else>Cargando datos del gráfico...</p>
            </div>
        </div>
        
        <div v-if="showForm" class="form-overlay">
            <div class="form-container">
                <h3>Registrar Nueva Venta</h3>
                <form @submit.prevent="guardarVenta">
                    <label for="id_comprador_new">Comprador:</label>
                    <select id="id_comprador_new" v-model="nuevaVenta.id_comprador" required>
                        <option value="" disabled>Seleccione un comprador</option>
                        <option v-for="comprador in compradores" :key="comprador.id_usuario" :value="comprador.id_usuario">
                            {{ comprador.Nombre }} ({{ comprador.email }})
                        </option>
                    </select>
                    
                    <label for="monto_total_new">Monto Total (Simulado):</label>
                    <input type="number" id="monto_total_new" v-model.number="nuevaVenta.monto_total" step="0.01" required>

                    <label for="id_producto_new">Producto (Opcional):</label>
                    <select id="id_producto_new" v-model="nuevaVenta.id_producto">
                        <option value="" disabled>Seleccione un producto</option>
                        <option v-for="producto in productos" :key="producto.id_producto" :value="producto.id_producto">
                            {{ producto.nombre }}
                        </option>
                    </select>

                    <label for="cantidad_new">Cantidad (Opcional):</label>
                    <input type="number" id="cantidad_new" v-model.number="nuevaVenta.cantidad">

                    <button type="submit" class="btn-guardar">Guardar Venta</button>
                    <button type="button" @click="showForm = false" class="btn-cancelar">Cancelar</button>
                </form>
            </div>
        </div>

        <div v-if="showEditForm" class="form-overlay">
            <div class="form-container">
                <h3>Editar Venta #{{ ventaAEditar.id_venta }}</h3>
                <form @submit.prevent="actualizarVenta">
                    <label for="id_comprador_edit">Comprador:</label>
                    <select id="id_comprador_edit" v-model="ventaAEditar.id_comprador" required>
                        <option v-for="comprador in compradores" :key="comprador.id_usuario" :value="comprador.id_usuario">
                            {{ comprador.Nombre }} ({{ comprador.email }})
                        </option>
                    </select>

                    <label for="monto_total_edit">Monto Total:</label>
                    <input type="number" id="monto_total_edit" v-model.number="ventaAEditar.monto_total" step="0.01" required>

                    <button type="submit" class="btn-actualizar">Actualizar Venta</button>
                    <button type="button" @click="showEditForm = false" class="btn-cancelar">Cancelar</button>
                </form>
            </div>
        </div>


        <div class="data-table-section">
            <h3 style="margin-bottom: 10px;">Ventas Registradas</h3>
            
            <div v-if="loading" class="loading-message">Cargando ventas...</div>

            <div v-else-if="ventas.length" class="tabla-scroll-container">
                <table class="tabla-ventas">
                    <thead>
                        <tr>
                            <th>ID Venta</th>
                            <th>Fecha</th>
                            <th>Comprador</th>
                            <th>Monto Total</th>
                            <th style="width: 200px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="venta in ventas" :key="venta.id_venta">
                            <td>{{ venta.id_venta }}</td>
                            <td>{{ new Date(venta.fecha).toLocaleDateString() }}</td> 
                            <td>{{ venta.comprador ? venta.comprador.Nombre : 'N/A' }}</td>
                            <td class="monto-total-col">${{ venta.monto_total ? venta.monto_total.toFixed(2) : '0.00' }}</td>
                            <td>
                                <button @click="cargarDetallesVenta(venta)" class="btn-ver-detalles">
                                    Detalles
                                </button>
                                <button @click="cargarVentaParaEditar(venta)" class="btn-editar">
                                    Editar
                                </button>
                                <button @click="eliminarVenta(venta.id_venta)" class="btn-eliminar">
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p v-else>No hay ventas registradas.</p>
        </div>
        
        <div v-if="showDetallesModal" class="detalles-modal-overlay">
            <div class="detalles-modal-content">
                <div class="modal-header">
                    <h3>Detalles de Venta #{{ ventaSeleccionada.id_venta }}</h3>
                    <button @click="showDetallesModal = false" class="btn-cerrar-x">×</button>
                </div>
                
                <div class="modal-body">
                    <p class="venta-info" v-if="ventaSeleccionada.comprador">
                        **Comprador:** {{ ventaSeleccionada.comprador.Nombre }} | 
                        **Fecha:** {{ new Date(ventaSeleccionada.fecha).toLocaleDateString() }} |
                        **Total:** ${{ ventaSeleccionada.monto_total ? ventaSeleccionada.monto_total.toFixed(2) : '0.00' }}
                    </p>

                    <div v-if="loading && detallesVenta.length === 0" class="loading-message">Cargando detalles...</div>

                    <div v-else-if="detallesVenta.length" class="tabla-scroll-detalles">
                        <table class="tabla-detalles">
                            <thead>
                                <tr>
                                    <th>ID Detalle</th>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio Unitario</th>
                                    <th>Subtotal</th>
                                    <th style="width: 120px;">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="detalle in detallesVenta" :key="detalle.id_detalle">
                                    <td>{{ detalle.id_detalle }}</td>
                                    <td>{{ detalle.producto ? detalle.producto.nombre : 'N/A' }}</td>
                                    <td>{{ detalle.cantidad }}</td>
                                    <td>${{ detalle.precio_unitario.toFixed(2) }}</td>
                                    <td>${{ (detalle.cantidad * detalle.precio_unitario).toFixed(2) }}</td>
                                    <td>
                                        <button @click="eliminarDetalle(detalle.id_detalle)" class="btn-eliminar-detalle">
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p v-else-if="!loading">Esta venta no tiene detalles registrados.</p>
                </div>
                
                <div class="modal-footer">
                    <button @click="showDetallesModal = false" class="btn-cancelar">
                        Cerrar Detalles
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
/* ---------------------------------------------------- */
/* 🎨 ESTILOS GENERALES (MANTENIDOS) */
/* ---------------------------------------------------- */
.gestion-container {
    padding: 20px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
h2 {
    color: #4a8d20;
    border-bottom: 2px solid #cceeb3;
    padding-bottom: 10px;
    margin-bottom: 20px;
}
.btn-crear {
    background: #4a8d20;
    color: white;
    border: none;
    padding: 10px 15px;
    cursor: pointer;
    border-radius: 5px;
    margin-bottom: 20px;
    font-size: 1em;
}
.btn-crear:hover {
    background: #3c721c;
}
.loading-message {
    text-align: center;
    padding: 20px;
    font-style: italic;
    color: #777;
}

/* ---------------------------------------------------- */
/* 📊 ESTILOS DE GRÁFICO */
/* ---------------------------------------------------- */
.chart-container {
    margin-bottom: 30px;
    padding: 15px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: #f9f9f9;
}
.chart-wrapper {
    height: 300px;
    width: 100%;
}

/* ---------------------------------------------------- */
/* 📋 ESTILOS DE TABLA PRINCIPAL (Ajustados para coherencia y compacidad) */
/* ---------------------------------------------------- */
.tabla-scroll-container {
    overflow-x: auto;
}

.tabla-ventas {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    font-size: 0.9em; 
}

.tabla-ventas th,
.tabla-ventas td {
    padding: 10px 8px; /* Compacto */
    text-align: center;
    border-right: 1px solid #e0e0e0; 
}

.tabla-ventas th {
    background: #cceeb3;
    color: #333;
    font-weight: bold;
}

.tabla-ventas tbody tr:nth-child(odd) {
    background-color: #f9f9f9; 
}
.tabla-ventas tbody tr:nth-child(even) {
    background-color: #ffffff;
}

.monto-total-col {
    font-weight: bold; 
    color: #27ae60;
}

/* ---------------------------------------------------- */
/* 💥 ESTILOS DE BOTONES DE ACCIÓN */
/* ---------------------------------------------------- */
.btn-ver-detalles, .btn-editar, .btn-eliminar {
    border: none;
    padding: 6px 8px;
    cursor: pointer;
    border-radius: 4px;
    margin-right: 5px;
    font-size: 0.85em;
    white-space: nowrap; 
}

.btn-ver-detalles {
    background: #2980b9; 
    color: white;
}
.btn-ver-detalles:hover {
    background: #1f6f9f;
}

.btn-editar {
    background: #ffc107; 
    color: #333;
}
.btn-editar:hover {
    background: #ffb300;
}

.btn-eliminar {
    background: #e74c3c;
    color: white;
}
.btn-eliminar:hover {
    background: #c0392b;
}

/* ---------------------------------------------------- */
/* 📝 ESTILOS DE FORMULARIO (Creación y Edición) */
/* ---------------------------------------------------- */
.form-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.form-container {
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 500px;
}
.form-container label {
    display: block;
    margin-top: 10px;
    font-weight: bold;
}
.form-container input,
.form-container select { 
    width: 100%;
    padding: 8px;
    margin-top: 5px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box; 
}
.btn-guardar, .btn-actualizar, .btn-cancelar {
    padding: 10px 15px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 15px;
    margin-right: 10px;
}

.btn-guardar {
    background: #64b129;
    color: white;
}
.btn-guardar:hover {
    background: #4a8d20;
}
.btn-actualizar {
    background: #2980b9; 
    color: white;
}
.btn-actualizar:hover {
    background: #1f6f9f;
}
.btn-cancelar {
    background: #7f8c8d;
    color: white;
}
.btn-cancelar:hover {
    background: #6c7a7b;
}


/* ---------------------------------------------------- */
/* 🧱 ESTILOS DEL MODAL DE DETALLES */
/* ---------------------------------------------------- */
.detalles-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.detalles-modal-content {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 15px;
}

.btn-cerrar-x {
    background: none;
    border: none;
    font-size: 1.5em;
    cursor: pointer;
    color: #999;
}

.venta-info {
    margin-bottom: 15px;
    padding: 10px;
    background: #f0fff0;
    border-left: 4px solid #4a8d20;
    font-weight: 500;
}

.tabla-scroll-detalles {
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 15px;
}

/* Estilos de la tabla de detalles */
.tabla-detalles {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85em;
}

.tabla-detalles th,
.tabla-detalles td {
    padding: 8px 6px;
    text-align: center;
    border-right: 1px solid #eee; 
}
.tabla-detalles th {
    background: #cceeb3;
    color: #333;
}

.btn-eliminar-detalle {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 5px 8px;
    cursor: pointer;
    border-radius: 3px;
    font-size: 0.8em;
}
.btn-eliminar-detalle:hover {
    background: #c0392b;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
}
</style>