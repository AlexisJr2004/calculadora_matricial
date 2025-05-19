// =============================================
// SIMULACIÓN DE MONTECARLO MEJORADA
// =============================================

let monteCarloPlot = null;

/**
 * Añade una nueva fila para función
 */
function addFunctionRow() {
    const table = document.getElementById("functions-table");
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <td class="py-2">
            <input type="text" class="input-field w-full" placeholder="Ej: Función" />
        </td>
        <td class="py-2">
            <input type="text" class="input-field w-full" placeholder="Ej: sin(x)" />
        </td>
        <td class="py-2">
            <button onclick="removeFunctionRow(this)" class="rounded-full clear-btn bg-red-100 hover:bg-red-200">
                <i class="m-2 fas fa-trash text-red-500 text-sm"></i>
            </button>
        </td>
    `;

    table.appendChild(newRow);
}

function formatMathExpression(expr) {
    // Reemplazos para mejor visualización
    return expr
        .replace(/\*\*/g, '^')  // x**2 → x^2
        .replace(/Math\./g, '') // Math.sqrt → sqrt
        .replace(/sqrt/g, '√')  // sqrt → √
        .replace(/\*/g, '·')    // * → ·
        .replace(/sin/g, 'sen') // sin → sen
        .replace(/([a-z]+)\(/g, '$1(') // funciones en texto normal
        .replace(/(\d)([a-z])/g, '$1·$2') // 2x → 2·x
        .replace(/([a-z])(\d)/g, '$1·$2'); // x2 → x·2
}

/**
 * Elimina una fila de función
 */
function removeFunctionRow(button) {
    const row = button.closest("tr");
    if (document.getElementById("functions-table").rows.length > 2) {
        row.remove();
    } else {
        showAlert("Debe haber al menos dos funciones definidas", "error");
    }
}

/**
 * Muestra una alerta estilizada
 */
function showAlert(message, type = "info") {
    const colors = {
        info: { bg: "bg-blue-100", text: "text-blue-800", icon: "fa-info-circle" },
        error: { bg: "bg-red-100", text: "text-red-800", icon: "fa-exclamation-circle" },
        success: { bg: "bg-green-100", text: "text-green-800", icon: "fa-check-circle" }
    };

    const alertDiv = document.createElement("div");
    alertDiv.className = `p-3 mb-4 rounded-md ${colors[type].bg} ${colors[type].text} flex items-center`;
    alertDiv.innerHTML = `
        <i class="fas ${colors[type].icon} mr-2"></i>
        <span>${message}</span>
    `;

    // Insertar antes del botón de ejecución
    const runButton = document.querySelector("#montecarlo-section button[onclick='runMonteCarloSimulation()']");
    runButton.parentNode.insertBefore(alertDiv, runButton);

    // Auto-eliminar después de 5 segundos
    setTimeout(() => alertDiv.remove(), 5000);
}

/**
 * Ejecuta la simulación de Montecarlo
 */
async function runMonteCarloSimulation() {
    try {
        const startTime = performance.now();
        const simulations = parseInt(document.getElementById("simulations-count").value);
        const a = parseFloat(document.getElementById("interval-a").value);
        const b = parseFloat(document.getElementById("interval-b").value);

        // Obtener funciones de la tabla
        const rows = document.getElementById("functions-table").rows;
        if (rows.length < 2) {
            throw new Error("Debes ingresar al menos dos funciones");
        }

        const f1 = rows[0].cells[1].querySelector("input").value;
        const f2 = rows[1].cells[1].querySelector("input").value;
        const f1Name = rows[0].cells[0].querySelector("input").value || "Función 1";
        const f2Name = rows[1].cells[0].querySelector("input").value || "Función 2";

        // Validaciones
        if (isNaN(simulations)) {
            throw new Error("Número de simulaciones no válido");
        }
        if (simulations < 100) {
            throw new Error("El número de simulaciones debe ser al menos 100");
        }
        if (simulations > 1000000) {
            throw new Error("El número máximo de simulaciones es 1,000,000");
        }
        if (isNaN(a) || isNaN(b)) {
            throw new Error("Los valores de a y b deben ser números válidos");
        }
        if (a >= b) {
            throw new Error("El valor de a debe ser menor que b");
        }
        if (!f1.trim() || !f2.trim()) {
            throw new Error("Ambas funciones deben estar definidas");
        }

        // Mostrar estado de carga
        document.getElementById("montecarlo-results").innerHTML = `
            <div class="text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-3"></div>
                <p class="text-gray-600">Ejecutando ${simulations.toLocaleString()} simulaciones...</p>
            </div>
        `;

        // Llamar al backend
        const response = await fetch('/montecarlo_area', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                simulations: simulations,
                a: a,
                b: b,
                f1: f1,
                f2: f2
            })
        });

        const data = await response.json();
        const endTime = performance.now();
        const executionTime = (endTime - startTime).toFixed(2);

        if (data.success) {
            renderMonteCarloResults(data, simulations, executionTime);
            renderMonteCarloPlot(data);
            updateStatistics(data);
        } else {
            throw new Error(data.error || "Error desconocido en el servidor");
        }
    } catch (error) {
        document.getElementById("montecarlo-results").innerHTML = `
            <div class="text-center p-4 text-red-500">
                <p class="font-bold">Error en la simulación</p>
                <p>${error.message}</p>
            </div>
        `;
        showAlert(error.message, "error");
    }
}

/**
 * Renderiza los resultados en la tabla
 */
function renderMonteCarloResults(data, simulations, executionTime) {
    const resultsDiv = document.getElementById("montecarlo-results");

    // Formatear las funciones para mostrar
    const f1Formatted = formatMathExpression(data.f1);
    const f2Formatted = formatMathExpression(data.f2);

    // Mostrar tabla con las primeras 20 simulaciones
    let html = `
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="bg-gray-100 text-left">
                        <th class="p-2 border">#</th>
                        <th class="p-2 border">x</th>
                        <th class="p-2 border">y_aleatorio</th>
                        <th class="p-2 border">f₁(x) = ${f1Formatted}</th>
                        <th class="p-2 border">f₂(x) = ${f2Formatted}</th>
                        <th class="p-2 border">Dentro</th>
                    </tr>
                </thead>
                <tbody>
    `;

    const sampleSize = Math.min(20, data.table.length);
    for (let i = 0; i < sampleSize; i++) {
        const row = data.table[i];
        html += `
            <tr class="${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                <td class="p-2 border">${i+1}</td>
                <td class="p-2 border">${row.x.toFixed(5)}</td>
                <td class="p-2 border">${row.y_rnd.toFixed(5)}</td>
                <td class="p-2 border">${row.y1.toFixed(5)}</td>
                <td class="p-2 border">${row.y2.toFixed(5)}</td>
                <td class="p-2 border text-center ${row.inside ? 'text-green-600' : 'text-red-600'}">
                    ${row.inside ? '✓' : '✗'}
                </td>
            </tr>
        `;
    }

    // Resumen estadístico
    const areaRect = (data.b - data.a) * (data.y_max - data.y_min);
    const percentage = (data.inside_count / data.total * 100).toFixed(2);

    html += `
                </tbody>
            </table>
        </div>

        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <h4 class="font-semibold text-blue-800 text-sm mb-1">CÁLCULO DEL ÁREA</h4>
                <p class="text-xs text-blue-600">
                    Área estimada = (Puntos dentro / Total) × Área rectángulo<br>
                    = (${data.inside_count}/${data.total}) × ${areaRect.toFixed(2)}<br>
                    = <span class="font-bold">${data.area_est.toFixed(6)}</span>
                </p>
            </div>

            <div class="bg-green-50 p-3 rounded-lg border border-green-100">
                <h4 class="font-semibold text-green-800 text-sm mb-1">EFICIENCIA</h4>
                <p class="text-xs text-green-600">
                    Puntos dentro: <span class="font-bold">${percentage}%</span><br>
                    Total simulaciones: ${data.total.toLocaleString()}<br>
                    Tiempo ejecución: ${executionTime}ms
                </p>
            </div>
        </div>

        <div class="mt-3 text-sm text-gray-500 text-center">
            Mostrando ${sampleSize} de ${simulations.toLocaleString()} simulaciones
        </div>
    `;

    resultsDiv.innerHTML = html;
    document.getElementById("simulation-time").textContent = `Tiempo: ${executionTime}ms`;
}

/**
 * Renderiza el gráfico interactivo con Plotly
 * (Ahora con evaluación segura de expresiones)
 */
function renderMonteCarloPlot(data) {
    const xs = data.table.map(r => r.x);
    const ys = data.table.map(r => r.y_rnd);
    const inside = data.table.map(r => r.inside);

    // Preparar datos para las curvas de las funciones
    const xCurve = [];
    const y1Curve = [];
    const y2Curve = [];
    const steps = 100;

    // Evaluación segura de expresiones matemáticas
    function safeEval(expr, x) {
        // Permitir solo funciones y operadores matemáticos básicos
        let safeExpr = expr
            .replace(/Math\./g, '')
            .replace(/(\W|^)sin\(/g, '$1Math.sin(')
            .replace(/(\W|^)cos\(/g, '$1Math.cos(')
            .replace(/(\W|^)tan\(/g, '$1Math.tan(')
            .replace(/(\W|^)sqrt\(/g, '$1Math.sqrt(')
            .replace(/(\W|^)log\(/g, '$1Math.log(')
            .replace(/(\W|^)exp\(/g, '$1Math.exp(')
            .replace(/(\W|^)abs\(/g, '$1Math.abs(')
            .replace(/(\W|^)pow\(/g, '$1Math.pow(')
            .replace(/(\W|^)PI/g, '$1Math.PI')
            .replace(/(\W|^)E/g, '$1Math.E');

        // Solo permite caracteres seguros
        if (!/^[0-9x\+\-\*\/\.\(\)\s\^MathsincoqrtapwblgexpabsPIE]+$/i.test(safeExpr)) {
            throw new Error("Expresión no permitida");
        }

        // Reemplaza ^ por **
        safeExpr = safeExpr.replace(/\^/g, '**');

        // Evalúa en un contexto seguro
        return Function('"use strict";let x=' + x + ';return ' + safeExpr + ';')();
    }

    for (let i = 0; i <= steps; i++) {
        const x = data.a + (data.b - data.a) * i / steps;
        xCurve.push(x);

        try {
            y1Curve.push(safeEval(data.f1, x));
            y2Curve.push(safeEval(data.f2, x));
        } catch (e) {
            console.error("Expresión insegura o error evaluando funciones:", e);
            y1Curve.push(0);
            y2Curve.push(0);
        }
    }

    // Crear trazas para Plotly
    const traceInside = {
        x: xs.filter((_, i) => inside[i]),
        y: ys.filter((_, i) => inside[i]),
        mode: 'markers',
        marker: {
            color: 'rgba(0, 128, 0, 0.5)',
            size: 4,
            line: { width: 0 }
        },
        name: 'Puntos dentro',
        hoverinfo: 'x+y'
    };

    const traceOutside = {
        x: xs.filter((_, i) => !inside[i]),
        y: ys.filter((_, i) => !inside[i]),
        mode: 'markers',
        marker: {
            color: 'rgba(255, 0, 0, 0.2)',
            size: 4,
            line: { width: 0 }
        },
        name: 'Puntos fuera',
        hoverinfo: 'x+y'
    };

    const traceF1 = {
        x: xCurve,
        y: y1Curve,
        mode: 'lines',
        line: { color: 'blue', width: 2 },
        name: 'Función 1',
        hoverinfo: 'x+y'
    };

    const traceF2 = {
        x: xCurve,
        y: y2Curve,
        mode: 'lines',
        line: { color: 'orange', width: 2 },
        name: 'Función 2',
        hoverinfo: 'x+y'
    };

    const layout = {
        height: 420,
        margin: { t: 30, l: 50, r: 30, b: 50 },
        xaxis: {
            title: 'x',
            range: [data.a - 0.1 * (data.b - data.a), data.b + 0.1 * (data.b - data.a)]
        },
        yaxis: {
            title: 'y',
            range: [data.y_min - 0.1 * (data.y_max - data.y_min), data.y_max + 0.1 * (data.y_max - data.y_min)]
        },
        legend: {
            orientation: 'h',
            y: 1.1
        },
        hovermode: 'closest'
    };

    // Renderizar o actualizar el gráfico
    const plotDiv = document.getElementById('montecarlo-chart');
    if (monteCarloPlot) {
        Plotly.react(plotDiv, [traceOutside, traceInside, traceF1, traceF2], layout);
    } else {
        monteCarloPlot = Plotly.newPlot(plotDiv, [traceOutside, traceInside, traceF1, traceF2], layout);
    }

    // Configurar botones de zoom
    document.getElementById('zoom-in-btn').onclick = () => {
        Plotly.relayout(plotDiv, {
            'xaxis.range[0]': layout.xaxis.range[0] * 0.9,
            'xaxis.range[1]': layout.xaxis.range[1] * 0.9,
            'yaxis.range[0]': layout.yaxis.range[0] * 0.9,
            'yaxis.range[1]': layout.yaxis.range[1] * 0.9
        });
    };

    document.getElementById('zoom-out-btn').onclick = () => {
        Plotly.relayout(plotDiv, {
            'xaxis.range[0]': layout.xaxis.range[0] * 1.1,
            'xaxis.range[1]': layout.xaxis.range[1] * 1.1,
            'yaxis.range[0]': layout.yaxis.range[0] * 1.1,
            'yaxis.range[1]': layout.yaxis.range[1] * 1.1
        });
    };
}

/**
 * Actualiza las estadísticas en el panel derecho
 */
function updateStatistics(data) {
    // Formatear las funciones para mostrar
    const f1Formatted = formatMathExpression(data.f1);
    const f2Formatted = formatMathExpression(data.f2);

    // Actualizar métricas principales
    document.getElementById('estimated-area').textContent = data.area_est.toFixed(6);
    document.getElementById('inside-points').textContent = `${data.inside_count}/${data.total}`;

    // Calcular porcentaje
    const percentage = (data.inside_count / data.total * 100).toFixed(2);
    document.getElementById('percentage-inside').textContent = `${percentage}% de puntos dentro`;

    // Mostrar cálculo del área
    const areaRect = (data.b - data.a) * (data.y_max - data.y_min);
    document.getElementById('area-calculation').textContent =
        `Área rectángulo: ${areaRect.toFixed(2)} × (${data.inside_count}/${data.total})`;

    // Mostrar funciones formateadas
    document.getElementById('function-1-display').innerHTML =
        `<span class="font-mono">${f1Formatted}</span>`;
    document.getElementById('function-2-display').innerHTML =
        `<span class="font-mono">${f2Formatted}</span>`;

    // Actualizar contador de puntos
    document.getElementById('points-count').textContent = `${data.total.toLocaleString()} puntos`;
}