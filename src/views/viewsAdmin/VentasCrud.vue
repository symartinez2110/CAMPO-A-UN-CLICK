<script setup>
import { ref, onMounted } from "vue";
import useApi from "../../componsables/useApi";

// Chart.js
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "vue-chartjs";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 👈 MODIFICADO: Incluir put y del
const { get, post, put, del } = useApi();

// Estados
const ventas = ref([]);
const productos = ref([]);
const compradores = ref([]);
const showForm = ref(false); // Formulario de creación
const showEditForm = ref(false); // 👈 NUEVO: Formulario de edición
const loading = ref(false);

const nuevaVenta = ref({
  id_producto: "",
  id_comprador: "",
  cantidad: "",
  monto_total: ""
});

// 👈 NUEVO: Estado para la edición de venta
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
    ventas.value = data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
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
    // Filtramos para incluir solo compradores o el rol que necesites para las ventas
    compradores.value = todosUsuarios.filter(u => u.rol === 'comprador' || u.rol === 'admin'); 
  } catch (err) {
    console.error(err);
  }
}

function actualizarGrafica() {
  if (!ventas.value.length) return;
  const ultimas = ventas.value.slice(0, 7);
  chartData.value = {
    labels: ultimas.map(v => v.producto?.nombre ?? "Desconocido"),
    datasets: [
      {
        label: "Monto total ($)",
        data: ultimas.map(v => Number(v.monto_total) || 0),
        backgroundColor: "rgba(100,177,41,0.8)",
        borderRadius: 6
      }
    ]
  };
}

async function guardarVenta() {
  if (!nuevaVenta.value.id_producto || !nuevaVenta.value.id_comprador) {
    alert("Selecciona producto y comprador");
    return;
  }
  try {
    loading.value = true;
    await post("/ventas", nuevaVenta.value);
    await cargarVentas();
    nuevaVenta.value = { id_producto: "", id_comprador: "", cantidad: "", monto_total: "" };
    showForm.value = false;
  } catch (err) {
    console.error("Error guardando venta:", err);
    alert("Error al guardar la venta");
  } finally {
    loading.value = false;
  }
}

// Lógica para abrir el formulario de edición
function abrirEdicion(venta) {
  showEditForm.value = true;
  showForm.value = false; 

  ventaAEditar.value = {
    id_venta: venta.id_venta,
    id_producto: venta.id_producto,
    id_comprador: venta.id_comprador,
    cantidad: venta.cantidad,
    monto_total: venta.monto_total
  };
}

// Actualizar venta (Petición PUT)
async function actualizarVenta() {
  if (!ventaAEditar.value.id_producto || !ventaAEditar.value.id_comprador) {
    alert("Selecciona producto y comprador");
    return;
  }
  
  try {
    loading.value = true;
    const id = ventaAEditar.value.id_venta;

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


// Eliminar venta (Petición DELETE)
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

// 👈 NUEVO: Función para descargar CSV (Excel)
function descargarExcel() {
    if (!ventas.value.length) {
        alert("No hay ventas para exportar.");
        return;
    }

    // 1. Definir encabezados y mapear los datos
    const headers = ["ID", "Producto", "Comprador", "Cantidad", "Monto_Total", "Fecha"];
    
    const csvContent = ventas.value.map(v => {
        const productoNombre = v.producto?.nombre ? `"${v.producto.nombre.replace(/"/g, '""')}"` : "";
        const compradorNombre = v.comprador?.Nombre ? `"${v.comprador.Nombre.replace(/"/g, '""')}"` : "";
        const fechaFormato = new Date(v.fecha).toLocaleString();

        return [
            v.id_venta,
            productoNombre,
            compradorNombre,
            v.cantidad,
            v.monto_total,
            `"${fechaFormato}"`
        ].join(",");
    }).join("\n");

    // 2. Combinar y crear Blob
    const csvFinal = headers.join(",") + "\n" + csvContent;
    const blob = new Blob([
      // Añadir la marca BOM para el soporte de UTF-8 en Excel
      "\ufeff", 
      csvFinal
    ], { type: 'text/csv;charset=utf-8;' });

    // 3. Crear enlace de descarga y forzar el clic
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
  <div>
    <h2>Panel de Ventas</h2>

    <div v-if="chartData.labels.length" class="grafica-container">
      <h3>📈 Últimas Ventas Registradas</h3>
      <div class="chart-wrapper">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <hr>
    
    <button class="btn-excel" @click="descargarExcel">
        Descargar Excel
    </button>
    
    <button class="btn-crear" @click="showForm = !showForm; showEditForm = false">
      {{ showForm ? "Cancelar Creación" : "Registrar Nueva Venta" }}
    </button>
    
    <button v-if="showEditForm" class="btn-cancelar" @click="showEditForm = false">
      Cancelar Edición
    </button>
    
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

    <table v-if="ventas.length" class="tabla-ventas">
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
          <td>{{ v.producto?.nombre }}</td>
          <td>{{ v.comprador?.Nombre }}</td>
          <td>{{ v.cantidad }}</td>
          <td>${{ v.monto_total }}</td>
          <td>{{ new Date(v.fecha).toLocaleString() }}</td>
          <td>
            <button class="btn-editar" @click="abrirEdicion(v)">Editar</button>
            <button class="btn-eliminar" @click="eliminarVenta(v.id_venta)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>No hay ventas registradas aún.</p>
  </div>
</template>

<style scoped>
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
/* 👈 NUEVO: Estilo para botón de Excel */
.btn-excel {
  background: #27ae60; /* Verde de Excel */
  border: none;
  color: white;
  padding: 8px 12px;
  margin-bottom: 14px;
  cursor: pointer;
  border-radius: 8px;
  margin-right: 10px; 
}
.btn-excel:hover {
  background: #229954;
}

/* MODIFICADO: Estilo para botón Crear */
.btn-crear {
  background: #64b129;
  border: none;
  color: white;
  padding: 8px 12px;
  margin-bottom: 14px;
  cursor: pointer;
  border-radius: 8px;
  margin-right: 10px; 
}
.btn-crear:hover {
  background: #4a8d20;
}

/* NUEVO: Estilo para botón de cancelar */
.btn-cancelar {
  background: #7f8c8d;
  color: white;
  border: none;
  padding: 8px 12px;
  margin-bottom: 14px;
  cursor: pointer;
  border-radius: 8px;
}

.form-container {
  background: #f2ffe6;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 14px;
}
.form-container label {
  display: block;
  margin-top: 8px;
  font-weight: 600;
}
.form-container input,
.form-container select {
  width: 100%;
  padding: 8px;
  margin-top: 6px;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}
.btn-guardar {
  margin-top: 12px;
  padding: 8px 12px;
  background: #64b129;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-guardar:hover {
  background: #4a8d20;
}

/* NUEVO: Estilo para botón de actualizar */
.btn-actualizar {
  margin-top: 12px;
  padding: 8px 12px;
  background: #2980b9;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-actualizar:hover {
  background: #1f6f9c;
}

.tabla-ventas {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.tabla-ventas th,
.tabla-ventas td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.tabla-ventas th {
  background: #cceeb3;  
}

/* Estilos para botones de acción en la tabla */
.btn-editar, .btn-eliminar {
  margin: 0 5px;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  font-size: 0.9em;
}
.btn-editar {
  background: #f1c40f;
  color: black;
}
.btn-eliminar {
  background: #e74c3c;
  color: white;
}
</style>