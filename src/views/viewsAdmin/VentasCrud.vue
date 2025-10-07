<script setup>
import { ref, onMounted } from "vue";
import useApi from "../../componsables/useApi";

// Chart.js
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "vue-chartjs";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const { get, post } = useApi();

// Estados
const ventas = ref([]);
const productos = ref([]);
const compradores = ref([]);
const showForm = ref(false);
const loading = ref(false);

const nuevaVenta = ref({
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
    compradores.value = await get("/usuarios");
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
    await post("/ventas", {
      id_producto: nuevaVenta.value.id_producto,
      id_comprador: nuevaVenta.value.id_comprador,
      cantidad: nuevaVenta.value.cantidad,
      monto_total: nuevaVenta.value.monto_total
    });
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

onMounted(() => {
  cargarVentas();
  cargarProductos();
  cargarCompradores();
});
</script>

<template>
  <div>
    <h2>Panel de Ventas</h2>

    <!-- 📊 Gráfica -->
    <div v-if="chartData.labels.length" class="grafica-container">
      <h3>📈 Últimas Ventas Registradas</h3>
      <div class="chart-wrapper">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Botón -->
    <button class="btn-crear" @click="showForm = !showForm">
      {{ showForm ? "Cancelar" : "Registrar Nueva Venta" }}
    </button>

    <!-- Formulario -->
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

    <!-- Tabla -->
    <table v-if="ventas.length" class="tabla-ventas">
      <thead>
        <tr>
          <th>ID</th>
          <th>Producto</th>
          <th>Comprador</th>
          <th>Cantidad</th>
          <th>Monto Total</th>
          <th>Fecha</th>
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
.btn-crear {
  background: #64b129;
  border: none;
  color: white;
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
</style>
