// =============================================
// GRAFICACIÓN DE FUNCIONES
// =============================================

// ===============================
// Variables globales
// ===============================
let currentChart = null;

// ===============================
// Funciones principales de graficación
// ===============================

/**
 * Procesa la función y decide el tipo de gráfica a renderizar
 */
function plotFunction() {
    const type = document.getElementById("graph-type").value;
    let func = document.getElementById("graph-function").value.trim();

    if (!func) {
        alert("Por favor ingrese una función");
        return;
    }

    // Reemplazar notación alternativa para ln y log
    func = func.replace(/ln/g, 'log');

    // Configurar rangos según el tipo de gráfico
    let plotData = {
        type: type,
        function: func
    };

    if (type === "2d") {
        plotData.x_min = parseFloat(document.getElementById("x-min").value);
        plotData.x_max = parseFloat(document.getElementById("x-max").value);

        // Ajuste automático para funciones logarítmicas
        if (func.includes('log(x)')) {
            plotData.x_min = Math.max(0.0001, plotData.x_min);
        }
    } else {
        plotData.x_min = parseFloat(document.getElementById("x-min-3d").value);
        plotData.x_max = parseFloat(document.getElementById("x-max-3d").value);
        plotData.y_min = parseFloat(document.getElementById("y-min-3d").value);
        plotData.y_max = parseFloat(document.getElementById("y-max-3d").value);

        // Ajuste automático para funciones logarítmicas 3D
        if (func.includes('log(x)')) {
            plotData.x_min = Math.max(0.0001, plotData.x_min);
        }
        if (func.includes('log(y)')) {
            plotData.y_min = Math.max(0.0001, plotData.y_min);
        }
    }

    // Mostrar mensaje de carga
    const graphContainer = document.getElementById("graph-container");
    graphContainer.innerHTML = '<div class="flex items-center justify-center h-full"><p class="text-gray-500">Generando gráfica...</p></div>';

    // Decidir qué tipo de gráfico renderizar
    if (type === "2d") {
        graphContainer.innerHTML = '<canvas id="chartCanvas" style="width: 100%; height: 100%;"></canvas>';
        render2DGraph(plotData);
    } else {
        graphContainer.innerHTML = '<div id="plotly-container" style="width: 100%; height: 100%;"></div>';
        render3DGraph(plotData);
    }
}

/**
 * Renderiza una gráfica 2D usando Chart.js
 */
function render2DGraph(data) {
    fetch('/plot_function', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
        if (!response.success) {
            alert("Error al generar gráfica: " + response.error);
            return;
        }

        const xValues = response.x;
        const yValues = response.y;

        const ctx = document.getElementById('chartCanvas').getContext('2d');
        if (currentChart) currentChart.destroy();

        currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: xValues,
                datasets: [{
                    label: `f(x) = ${data.function}`,
                    data: yValues,
                    borderColor: '#6366f1',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { 
                        title: { display: true, text: 'x' },
                        min: data.x_min,
                        max: data.x_max
                    },
                    y: { title: { display: true, text: 'f(x)' } }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Gráfica de f(x) = ${data.function}`
                    }
                }
            }
        });
    })
    .catch(err => {
        alert("Error de red: " + err);
    });
}

/**
 * Renderiza una gráfica 3D usando Plotly.js
 */
function render3DGraph(data) {
    fetch('/plot_function', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
        if (!response.success) {
            alert("Error al generar gráfica 3D: " + response.error);
            return;
        }

        const trace = {
            x: response.x,
            y: response.y,
            z: response.z,
            type: 'surface',
            colorscale: 'Viridis',
            contours: {
                z: { show: true, usecolormap: true, highlightcolor: "#42f5ef" }
            }
        };

        const layout = {
            title: `Gráfica 3D de f(x,y) = ${data.function}`,
            autosize: true,
            margin: { l: 65, r: 50, b: 65, t: 90 },
            scene: {
                xaxis: { title: 'X', range: [data.x_min, data.x_max] },
                yaxis: { title: 'Y', range: [data.y_min, data.y_max] },
                zaxis: { title: 'f(x,y)' },
                aspectratio: { x: 1, y: 1, z: 0.7 }
            }
        };

        Plotly.newPlot('plotly-container', [trace], layout, { responsive: true });
    })
    .catch(err => {
        alert("Error de red: " + err);
    });
}

// ===============================
// Funciones de UI y eventos
// ===============================

/**
 * Actualiza la vista previa de la función ingresada
 */
function updateFunctionPreview() {
    const funcInput = document.getElementById("graph-function").value.trim();
    const preview = document.getElementById("function-preview");

    if (!funcInput) {
        preview.innerHTML = `
            <div class="text-center text-gray-500">
                <i class="fas fa-chart-line text-2xl mb-2"></i>
                <p>La función aparecerá aquí</p>
            </div>
        `;
        return;
    }

    // Formatear para mejor visualización
    let displayText = funcInput
        .replace(/\*\*/g, '^')
        .replace(/sqrt/g, '√')
        .replace(/exp/g, 'e')
        .replace(/pi/g, 'π')
        .replace(/sin/g, 'sin')
        .replace(/cos/g, 'cos')
        .replace(/tan/g, 'tan')
        .replace(/log/g, 'log')
        .replace(/ln/g, 'ln');

    const graphType = document.getElementById("graph-type").value;
    const title = graphType === "2d" ? `f(x) = ${displayText}` : `f(x,y) = ${displayText}`;

    preview.innerHTML = `\\[ ${title} \\]`;

    // Renderizar LaTeX
    if (typeof MathJax !== 'undefined') {
        MathJax.typesetPromise([preview]);
    }
}

/**
 * Maneja el cambio entre los rangos de 2D y 3D
 */
document.getElementById('graph-type').addEventListener('change', function() {
    const type = this.value;
    document.getElementById('graph-range-2d').classList.toggle('hidden', type !== '2d');
    document.getElementById('graph-range-3d').classList.toggle('hidden', type === '2d');
});

// ===============================
// Inicialización de eventos
// ===============================

document.addEventListener('DOMContentLoaded', function() {
    // Actualizar vista previa cuando cambia la función
    document.getElementById("graph-function").addEventListener('input', updateFunctionPreview);

    // Actualizar vista previa cuando cambia el tipo de gráfico
    document.getElementById("graph-type").addEventListener('change', updateFunctionPreview);

    // Inicializar vista previa
    updateFunctionPreview();
});