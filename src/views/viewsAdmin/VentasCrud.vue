<script setup>
import { ref, onMounted } from "vue";
// Asegúrate de que la ruta a useApi sea correcta en tu proyecto
import useApi from "../../componsables/useApi"; 

// Chart.js
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "vue-chartjs";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const { get, post, put, del } = useApi();

// Estados
const ventas = ref([]);
const productos = ref([]);
const compradores = ref([]);
const showForm = ref(false); 
const showEditForm = ref(false); 
const loading = ref(false);

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

// Datos del gráfico (con inicialización segura)
const chartData = ref({
    labels: [],
    datasets: [
        {
            label: "Monto total ($)",
            data: [],
            backgroundColor: "rgba(100,177,41,0.8)",
            borderRadius: 6
        }
    ]
});

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        title: { display: true, text: "Últimas ventas registradas" }
    },
    scales: {
        y: { beginAtZero: true }
    }
};

// ==================== FUNCIONES ====================

async function cargarVentas() {
    try {
        const data = await get("/ventas");
        
        ventas.value = data
            .map(v => ({
                ...v,
                // Lógica para mostrar producto y cantidad, asumiendo detalles[0]
                producto_display: v.detalles && v.detalles.length > 0 ? v.detalles[0].producto?.nombre : 'Múltiples/Desconocido',
                cantidad_display: v.detalles && v.detalles.length > 0 ? v.detalles[0].cantidad : 'N/A',
                monto_total_display: Number(v.monto_total) || 0
            }))
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        actualizarGrafica();
    } catch (err) {
        console.error("Error cargando ventas:", err);
    }
}

async function cargarProductos() {
    try {
        productos.value = await get("/productos");
    } catch (err) {
        console.error(err);
    }
}

async function cargarCompradores() {
    try {
        const todosUsuarios = await get("/usuarios");
        compradores.value = todosUsuarios.filter(u => u.rol === 'comprador' || u.rol === 'admin'); 
    } catch (err) {
        console.error(err);
    }
}

function actualizarGrafica() {
    if (!ventas.value.length) return;
    const ultimas = ventas.value.slice(0, 7);
    chartData.value = {
        labels: ultimas.map(v => v.producto_display ?? "Desconocido"), 
        datasets: [
            {
                label: "Monto total ($)",
                data: ultimas.map(v => v.monto_total_display || 0),
                backgroundColor: "rgba(100,177,41,0.8)",
                borderRadius: 6
            }
        ]
    };
}

async function guardarVenta() {
    const ventaData = nuevaVenta.value;
    if (!ventaData.id_producto || !ventaData.id_comprador || !ventaData.cantidad || !ventaData.monto_total) {
        alert("Todos los campos de la venta son requeridos.");
        return;
    }
    
    const dataParaBackend = {
        id_comprador: parseInt(ventaData.id_comprador),
        monto_total: parseFloat(ventaData.monto_total),
        items: [
            {
                id_producto: parseInt(ventaData.id_producto),
                cantidad: parseInt(ventaData.cantidad)
            }
        ]
    };

    try {
        loading.value = true;
        const response = await post("/ventas", dataParaBackend);
        
        if (response && response.error) {
            alert(`Error al guardar la venta: ${response.error}`);
            return;
        }

        await cargarVentas();
        nuevaVenta.value = { id_producto: "", id_comprador: "", cantidad: "", monto_total: "" };
        showForm.value = false;
        alert("Venta registrada con éxito y stock descontado.");
        
    } catch (err) {
        console.error("Error guardando venta:", err);
        const errorMessage = err.message || "Error al guardar la venta. Verifique la consola para detalles (posiblemente stock insuficiente).";
        alert(errorMessage);
    } finally {
        loading.value = false;
    }
}


function abrirEdicion(venta) {
    showEditForm.value = true;
    showForm.value = false; 

    // Asume que la venta tiene detalles y toma el primer producto para edición
    ventaAEditar.value = {
        id_venta: venta.id_venta,
        id_producto: venta.detalles && venta.detalles.length > 0 ? venta.detalles[0].id_producto : venta.id_producto, 
        id_comprador: venta.id_comprador,
        cantidad: venta.detalles && venta.detalles.length > 0 ? venta.detalles[0].cantidad : venta.cantidad,
        monto_total: venta.monto_total
    };
}

async function actualizarVenta() {
    if (!ventaAEditar.value.id_producto || !ventaAEditar.value.id_comprador) {
        alert("Selecciona producto y comprador");
        return;
    }
    
    try {
        loading.value = true;
        const id = ventaAEditar.value.id_venta;

        // Nota: Esta estructura PUT puede depender de cómo tu backend maneja la edición de ventas con detalles.
        await put(`/ventas/${id}`, {
            id_producto: ventaAEditar.value.id_producto,
            id_comprador: ventaAEditar.value.id_comprador,
            cantidad: ventaAEditar.value.cantidad,
            monto_total: ventaAEditar.value.monto_total
        });

        await cargarVentas();
        showEditForm.value = false;
        alert(`Venta ${id} actualizada con éxito.`);
    } catch (error) {
        console.error("Error al actualizar venta:", error);
        alert("Hubo un error al actualizar la venta.");
    } finally {
        loading.value = false;
    }
}


async function eliminarVenta(id_venta) {
    if (confirm(`¿Está seguro de que desea eliminar la venta ID: ${id_venta}?`)) {
        try {
            loading.value = true;
            await del(`/ventas/${id_venta}`);
            await cargarVentas(); 
            alert(`Venta ${id_venta} eliminada con éxito.`);
        } catch (error) {
            console.error("Error al eliminar venta:", error);
            alert("Hubo un error al eliminar la venta.");
        } finally {
            loading.value = false;
        }
    }
}

// Función para descargar CSV (Excel)
function descargarExcel() {
    if (!ventas.value.length) {
        alert("No hay ventas para exportar.");
        return;
    }

    const headers = ["ID", "Producto", "Comprador", "Cantidad", "Monto_Total", "Fecha"];
    
    const csvContent = ventas.value.map(v => {
        const productoNombre = v.producto_display ? `"${v.producto_display.replace(/"/g, '""')}"` : "";
        const compradorNombre = v.comprador?.Nombre ? `"${v.comprador.Nombre.replace(/"/g, '""')}"` : "";
        const fechaFormato = new Date(v.fecha).toLocaleString();

        return [
            v.id_venta,
            productoNombre,
            compradorNombre,
            v.cantidad_display,
            v.monto_total,
            `"${fechaFormato}"`
        ].join(",");
    }).join("\n");

    const csvFinal = headers.join(",") + "\n" + csvContent;
    const blob = new Blob([
        "\ufeff", // Marca BOM para el soporte de UTF-8 en Excel
        csvFinal
    ], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'registro_ventas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}


onMounted(() => {
    cargarVentas();
    cargarProductos();
    cargarCompradores();
});
</script>

<template>
  <div class="ventas-panel-container">
    <h2>Panel de Ventas</h2>

    <div v-if="chartData.labels.length" class="grafica-container">
      <h3>📈 Últimas Ventas Registradas</h3>
      <div class="chart-wrapper">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <hr>
    
    <div class="acciones-container">
      <button class="btn-excel" @click="descargarExcel">
          Descargar Excel
      </button>
      
      <button class="btn-crear" @click="showForm = !showForm; showEditForm = false">
        {{ showForm ? "Cancelar Creación" : "Registrar Nueva Venta" }}
      </button>
      
      <button v-if="showEditForm" class="btn-cancelar" @click="showEditForm = false">
        Cancelar Edición
      </button>
    </div>
    
    <hr v-if="showForm || showEditForm">

    <div v-if="showForm" class="form-container">
      <h3>Registrar Venta</h3>
      <form @submit.prevent="guardarVenta">
        <label>Producto:</label>
        <select v-model="nuevaVenta.id_producto" required>
          <option disabled value="">Selecciona un producto</option>
          <option v-for="p in productos" :key="p.id_producto" :value="p.id_producto">
            {{ p.nombre }}
          </option>
        </select>

        <label>Comprador:</label>
        <select v-model="nuevaVenta.id_comprador" required>
          <option disabled value="">Selecciona un comprador</option>
          <option v-for="c in compradores" :key="c.id_usuario" :value="c.id_usuario">
            {{ c.Nombre }}
          </option>
        </select>

        <label>Cantidad:</label>
        <input v-model="nuevaVenta.cantidad" type="number" min="1" required />

        <label>Monto total ($):</label>
        <input v-model="nuevaVenta.monto_total" type="number" min="1" required />

        <button type="submit" class="btn-guardar" :disabled="loading">
          {{ loading ? "Guardando..." : "Guardar Venta" }}
        </button>
      </form>
    </div>

    <div v-if="showEditForm" class="form-container">
      <h3>Editar Venta ID: {{ ventaAEditar.id_venta }}</h3>
      <form @submit.prevent="actualizarVenta">
        <label>Producto:</label>
        <select v-model="ventaAEditar.id_producto" required>
          <option disabled value="">Selecciona un producto</option>
          <option v-for="p in productos" :key="p.id_producto" :value="p.id_producto">
            {{ p.nombre }}
          </option>
        </select>

        <label>Comprador:</label>
        <select v-model="ventaAEditar.id_comprador" required>
          <option disabled value="">Selecciona un comprador</option>
          <option v-for="c in compradores" :key="c.id_usuario" :value="c.id_usuario">
            {{ c.Nombre }}
          </option>
        </select>

        <label>Cantidad:</label>
        <input v-model="ventaAEditar.cantidad" type="number" min="1" required />

        <label>Monto total ($):</label>
        <input v-model="ventaAEditar.monto_total" type="number" min="1" required />

        <button type="submit" class="btn-actualizar" :disabled="loading">
          {{ loading ? "Actualizando..." : "Actualizar Venta" }}
        </button>
      </form>
    </div>

        <div v-if="ventas.length" class="tabla-scroll-container">
      <table class="tabla-ventas">
        <thead>
          <tr>
            <th>ID</th>
            <th>Producto</th>
            <th>Comprador</th>
            <th>Cantidad</th>
            <th>Monto Total</th>
            <th>Fecha</th>
            <th>Acciones</th> 
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in ventas" :key="v.id_venta">
            <td>{{ v.id_venta }}</td>
            <td>{{ v.producto_display }}</td>
            <td>{{ v.comprador?.Nombre }}</td>
            <td>{{ v.cantidad_display }}</td>
            <td>${{ v.monto_total_display.toFixed(2) }}</td>
            <td>{{ new Date(v.fecha).toLocaleString() }}</td>
            <td>
              <button class="btn-editar" @click="abrirEdicion(v)">Editar</button>
              <button class="btn-eliminar" @click="eliminarVenta(v.id_venta)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else>No hay ventas registradas aún.</p>
  </div>
</template>

<style scoped>
/* -------------------- AJUSTE PRINCIPAL DEL CONTENEDOR (SOLUCIÓN AL DESPLAZAMIENTO) -------------------- */
.ventas-panel-container {
    /* Ocupa todo el ancho que le da el contenedor padre (como .dashboard-content) */
    width: 100%; 
    /* Añade padding a los lados para que el contenido no se pegue al borde */
    padding: 20px 30px; 
    /* Asegura que el contenido se comporte bien si la pantalla es muy grande */
    max-width: 1400px; 
    box-sizing: border-box; 
    margin: 0; /* Asegura que no haya margen automático, alineando a la izquierda */
}


h2 {
    color: #4CAF50; 
    border-bottom: 2px solid #cceeb3;
    padding-bottom: 10px;
    margin-bottom: 25px;
}
hr {
    border: none;
    border-top: 1px solid #ddd;
    margin: 20px 0;
}

/* -------------------- GRÁFICO -------------------- */
.grafica-container {
    background: #f9fff4;
    padding: 16px;
    border-radius: 10px;
    margin-bottom: 18px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}
.chart-wrapper {
    width: 100%;
    height: 320px;
}

/* -------------------- BOTONES PRINCIPALES -------------------- */
.acciones-container {
    display: flex; 
    gap: 10px; 
    margin-bottom: 15px;
}

.btn-excel {
    background: #27ae60; 
    border: none;
    color: white;
    padding: 10px 15px; 
    cursor: pointer;
    border-radius: 6px;
    transition: background 0.3s;
}
.btn-excel:hover {
    background: #229954;
}

.btn-crear {
    background: #64b129;
    border: none;
    color: white;
    padding: 10px 15px; 
    cursor: pointer;
    border-radius: 6px;
    transition: background 0.3s;
}
.btn-crear:hover {
    background: #4a8d20;
}

.btn-cancelar {
    background: #7f8c8d;
    color: white;
    border: none;
    padding: 10px 15px; 
    cursor: pointer;
    border-radius: 6px;
    transition: background 0.3s;
}
.btn-cancelar:hover {
    background: #6c757d;
}

/* -------------------- FORMULARIOS (CREAR/EDITAR) -------------------- */
.form-container {
    background: #f2ffe6;
    padding: 20px; 
    border-radius: 10px; 
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.form-container h3 {
    margin-top: 0;
    color: #333;
    padding-bottom: 10px;
    border-bottom: 1px solid #e0e0e0;
    margin-bottom: 15px;
}
.form-container label {
    display: block;
    margin-top: 10px;
    font-weight: 700;
    color: #333;
}
.form-container input,
.form-container select {
    width: 100%;
    padding: 10px;
    margin-top: 5px;
    border-radius: 6px;
    border: 1px solid #ddd;
    box-sizing: border-box;
    font-size: 1em;
}
.btn-guardar, .btn-actualizar {
    margin-top: 15px;
    padding: 10px 15px;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
    font-weight: 600;
}

.btn-guardar {
    background: #64b129;
}
.btn-guardar:hover {
    background: #4a8d20;
}

.btn-actualizar {
    background: #2980b9;
}
.btn-actualizar:hover {
    background: #1f6f9c;
}

/* -------------------- TABLA DE VENTAS (MODERNA Y CORREGIDA) -------------------- */
/* -------------------- TABLA DE VENTAS (MODERNA Y CORREGIDA) -------------------- */

/* Contenedor para manejar el scroll horizontal si es necesario */
.tabla-scroll-container {
    overflow-x: auto; 
    margin-bottom: 20px;
}

.tabla-ventas {
    width: 100%;
    /* Asegura que la tabla no sea demasiado estrecha */
    min-width: 800px; 
    /* CLAVE 1: Usa separate para permitir border-radius, pero con espaciado cero */
    border-collapse: separate; 
    border-spacing: 0; 
    
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    overflow: hidden; 
    border-radius: 8px; /* Bordes redondeados en la tabla */
}

/* Encabezado */
.tabla-ventas thead tr {
    background: #cceeb3; 
    color: #333;
}
.tabla-ventas th,
.tabla-ventas td {
    padding: 12px 10px;
    text-align: center;
    border-right: 1px solid #e0e0e0; 
}
.tabla-ventas th:last-child,
.tabla-ventas td:last-child {
    border-right: none;
}

/* Filas del Cuerpo */
.tabla-ventas tbody tr {
    /* Borde inferior para separar las filas (cebrado) */
    border-bottom: 1px solid #e0e0e0; 
}

/* CLAVE 2: Elimina la línea divisoria debajo de la última fila de datos */
.tabla-ventas tbody tr:last-child {
    border-bottom: none;
}

.tabla-ventas tbody tr:nth-child(odd) {
    background-color: #f9f9f9; 
}
.tabla-ventas tbody tr:nth-child(even) {
    background-color: #ffffff;
}

/* Destacar Monto Total */
.tabla-ventas td:nth-child(5) {
    font-weight: bold; 
    color: #27ae60;
}

/* Botones de acción (mantener los estilos de botones que ya definiste en VentasCrud) */

/* -------------------- BOTONES DE ACCIÓN DE LA TABLA -------------------- */
.btn-editar, .btn-eliminar {
    margin: 0 5px;
    padding: 6px 10px; 
    border: none;
    cursor: pointer;
    border-radius: 4px;
    font-size: 0.9em;
    transition: opacity 0.3s;
}
.btn-editar {
    background: #f1c40f; 
    color: #333;
}
.btn-editar:hover {
    opacity: 0.8;
}
.btn-eliminar {
    background: #e74c3c; 
    color: white;
}
.btn-eliminar:hover {
    opacity: 0.8;
}



</style>