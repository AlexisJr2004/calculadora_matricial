/**
 * =============================================
 * 🚀      CALCULADORA MATEMÁTICA AVANZADA
 * =============================================
 * 
 * 📄 DESCRIPCIÓN:
 * Aplicación completa para operaciones matemáticas que incluye:
 * - Operaciones con matrices
 * - Manipulación de polinomios
 * - Cálculo vectorial
 * - Graficación de funciones 2D/3D
 * - Cálculo diferencial e integral
 * 
 * 🏗️ ESTRUCTURA:
 * 1. Gestión de Interfaz
 * 2. Operaciones con Matrices
 * 3. Operaciones con Polinomios
 * 4. Operaciones con Vectores
 * 5. Graficación de Funciones
 * 6. Operaciones de Cálculo
 */

// =============================================
// 1. 🖥️ GESTIÓN DE INTERFAZ
// =============================================

// Botón para mostrar ayuda del uso de la calculadora
function mostrarAyuda() {
    Swal.fire({
        title: '¿Cómo usar esta calculadora?',
        icon: 'question',
        html: `
            <ol class="space-y-4 text-left" style="padding-left: 20px;">
                <li class="flex items-center">
                    <div class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 text-indigo-600 text-sm font-medium">
                        1
                    </div>
                    <span class="text-gray-700">Selecciona una categoría del menú superior</span>
                </li>
                <li class="flex items-center">
                    <div class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 text-indigo-600 text-sm font-medium">
                        2
                    </div>
                    <span class="text-gray-700">Ingresa los datos requeridos en los campos correspondientes</span>
                </li>
                <li class="flex items-center">
                    <div class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 text-indigo-600 text-sm font-medium">
                        3
                    </div>
                    <span class="text-gray-700">Haz clic en la operación que deseas realizar</span>
                </li>
                <li class="flex items-center">
                    <div class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 text-indigo-600 text-sm font-medium">
                        4
                    </div>
                    <span class="text-gray-700">Visualiza los resultados en la sección inferior</span>
                </li>
            </ol>
        `,
        confirmButtonText: 'Entendido',
        customClass: {
            popup: 'rounded-xl',
            confirmButton: 'bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg'
        }
    });
}

function showSection(sectionId) { // - ID de la sección a mostrar
    // 1. Oculta todas las secciones
    document.querySelectorAll("#content > div").forEach((div) => {
        div.classList.add("hidden");
    });

    // 2. Muestra solo la sección seleccionada
    document.getElementById(`${sectionId}-section`).classList.remove("hidden");

    // 3. Actualiza el botón activo
    document.querySelectorAll(".tab-button").forEach((button) => {
        button.classList.remove("active");
    });
    document.getElementById(`${sectionId}Tab`).classList.add("active");

    // 4. Caso especial: Actualiza tamaño de matrices al mostrar esa sección
    if (sectionId === "matrices") {
        updateMatrixSize();
    }
}

// Configuración inicial al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    showSection("home");
});

// =============================================
// 2. 🔢 OPERACIONES CON MATRICES
// =============================================

let matrixRows = 3;
let matrixCols = 3;

/**
 * Actualiza el tamaño de las matrices en la interfaz
 */
function updateMatrixSize() {
    matrixRows = parseInt(document.getElementById("matrix-rows").value);
    matrixCols = parseInt(document.getElementById("matrix-cols").value);

    // Crea los inputs para Matrix A y B
    createMatrixInputs("matrixA");
    createMatrixInputs("matrixB");
}

function createMatrixInputs(containerId) { // - ID del contenedor (matrixA o matrixB)
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    container.style.gridTemplateColumns = `repeat(${matrixCols}, 1fr)`;

    for (let i = 0; i < matrixRows * matrixCols; i++) {
        const input = document.createElement("input");
        input.type = "number";
        input.className = "matrix-input";
        input.placeholder = "0";
        container.appendChild(input);
    }
}

/**
 * Llena una matriz con valores aleatorios
 */
function randomizeMatrix(matrix) {
    const inputs = document.querySelectorAll(`#matrix${matrix} input`);
    inputs.forEach(input => {
        input.value = Math.floor(Math.random() * 10) - 5; // Valores entre -5 y 5
    });
}

/**
 * Limpia una matriz
 */
function clearMatrix(matrix) {
    const inputs = document.querySelectorAll(`#matrix${matrix} input`);
    inputs.forEach(input => input.value = "");
}

/**
 * Obtiene los valores de una matriz desde los inputs
 * matrixId - 'matrixA' o 'matrixB'
 * returns {Array} Matriz numérica
 */
function getMatrixValues(matrixId) {
    const inputs = document.querySelectorAll(`#${matrixId} input`);
    const matrix = [];
    
    for (let i = 0; i < matrixRows; i++) {
        const row = [];
        for (let j = 0; j < matrixCols; j++) {
            const index = i * matrixCols + j;
            const value = parseFloat(inputs[index].value) || 0;
            row.push(value);
        }
        matrix.push(row);
    }
    
    return matrix;
}

/**
 * Llamado para la resolución de las operaciones
 * 'add', 'subtract', 'multiply', etc.
 */
async function matrixOperation(operation) {
    try {
        const matrixA = getMatrixValues("matrixA");
        let requestData = { operation, matrixA };
        
        // Determinar qué matriz usar para operaciones individuales
        let selectedMatrix = 'A';
        if (['inverse', 'transpose', 'trace', 'determinant', 'rank'].includes(operation)) {
            selectedMatrix = document.querySelector('input[name="selectedMatrix"]:checked').value;
        }
        
        // Operaciones que requieren matrixB
        if (['add', 'subtract', 'multiply'].includes(operation)) {
            requestData.matrixB = getMatrixValues("matrixB");
        } else {
            // Para operaciones individuales, enviar la matriz seleccionada
            if (selectedMatrix === 'B') {
                requestData.matrixB = getMatrixValues("matrixB");
            }
        }
        
        requestData.selectedMatrix = selectedMatrix;

        // Mostrar carga
        displayMatrixResult("Calculando...", "loading");

        // Enviar al backend
        const response = await fetch('/matrix_operation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (data.success) {
            displayMatrixResult(data.result, Array.isArray(data.result) ? "matrix" : "number");
        } else {
            displayMatrixResult(`Error: ${data.error}`, "error");
        }

    } catch (error) {
        displayMatrixResult(`Error: ${error.message}`, "error");
    }
}

/**
 * Muestra el resultado de una operación
 * {Array|number|string} result - Resultado a mostrar
 * {string} type - 'matrix', 'number', 'error', 'loading'
 */
function displayMatrixResult(result, type) {
    const resultDiv = document.getElementById("matrix-result");
    
    if (type === "loading") {
        resultDiv.innerHTML = `<div class="text-center p-4">⏳ ${result}</div>`;
        return;
    }

    if (type === "error") {
        resultDiv.innerHTML = `
            <div class="text-center p-4 text-red-500">
                <p class="font-bold">Error</p>
                <p>${result}</p>
            </div>
        `;
        return;
    }

    if (type === "number") {
        resultDiv.innerHTML = `
            <div class="text-center p-4">
                <p class="text-lg font-bold">Resultado:</p>
                <p class="text-2xl mt-2">${Number(result).toFixed(4)}</p>
            </div>
        `;
        return;
    }

    if (type === "matrix") {
        let html = `
            <div class="text-center">
                <p class="font-bold mb-2">Matriz Resultante (${result.length}×${result[0].length}):</p>
                <div class="matrix-grid inline-grid" style="grid-template-columns: repeat(${result[0].length}, 1fr)">
        `;
        
        result.forEach(row => {
            row.forEach(val => {
                const formattedValue = typeof val === "number" ? val.toFixed(4) : val;
                html += `
                    <div class="bg-white p-2 border border-gray-200 text-center">
                        ${formattedValue}
                    </div>
                `;
            });
        });
        
        html += "</div></div>";
        resultDiv.innerHTML = html;
    }
}

// =============================================
// 3. 📈 OPERACIONES CON POLINOMIOS
// =============================================

/**
 * Limpia un campo de polinomio
 */
function clearPolynomial(fieldId) {
    document.getElementById(fieldId).value = "";
}

/**
 * Realiza una operación con polinomios
 * {string} operation - Tipo de operación ('add', 'subtract', 'multiply', etc.)
 */
async function polynomialOperation(operation) {
    try {
        // Determinar qué polinomio usar para operaciones individuales
        let selectedPoly = document.querySelector('input[name="selectedPolynomial"]:checked').value;
        
        const poly1 = document.getElementById("poly1").value;
        const poly2 = document.getElementById("poly2").value;
        
        let requestData = {
            operation: operation,
            poly1: selectedPoly === "1" ? poly1 : poly2
        };

        // Operaciones que requieren ambos polinomios
        if (['add', 'subtract', 'multiply'].includes(operation)) {
            if (!poly1 || !poly2) {
                displayPolynomialResult("Error: Se necesitan ambos polinomios para esta operación", "error");
                return;
            }
            requestData.poly1 = poly1;
            requestData.poly2 = poly2;
        } else {
            // Para operaciones individuales, verificar que el polinomio seleccionado exista
            if ((selectedPoly === "1" && !poly1) || (selectedPoly === "2" && !poly2)) {
                displayPolynomialResult(`Error: El polinomio ${selectedPoly} está vacío`, "error");
                return;
            }
        }

        // Mostrar carga
        displayPolynomialResult("Calculando...", "loading");

        // Enviar al backend
        const response = await fetch('/polynomial_operation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (data.success) {
            displayPolynomialResult(data, "success");
        } else {
            displayPolynomialResult(`Error: ${data.error}`, "error");
        }

    } catch (error) {
        displayPolynomialResult(`Error: ${error.message}`, "error");
    }
}

/**
 * Muestra el resultado de una operación polinómica
 */
function displayPolynomialResult(data, type) {
    const resultDiv = document.getElementById("polynomial-result");
    
    if (type === "loading") {
        resultDiv.innerHTML = `<div class="text-center p-4">⏳ ${data}</div>`;
        return;
    }

    if (type === "error") {
        resultDiv.innerHTML = `
            <div class="text-center p-4 text-red-500">
                <p class="font-bold">Error</p>
                <p>${data}</p>
            </div>
        `;
        return;
    }

    if (type === "success") {
        resultDiv.innerHTML = `
            <div class="p-4">
                <div class="font-bold mb-2 text-lg text-center text-indigo-600">
                    ${getOperationName(data.operation)}
                </div>
                ${data.details ? `
                <div class="text-center text-gray-600 mb-4 border-b pb-3">
                    Operación: $$${data.details}$$
                </div>` : ''}
                <div class="text-center text-2xl my-4 p-4 bg-white rounded-lg shadow-inner">
                    Resultado: $$${data.result}$$
                </div>
            </div>
        `;
        
        // Renderizar LaTeX con MathJax
        if (typeof MathJax !== 'undefined') {
            MathJax.typeset();
        }
    }
}

/**
 * Obtiene el nombre legible de una operación
 */
function getOperationName(operation) {
    const names = {
        'add': 'Suma de Polinomios',
        'subtract': 'Resta de Polinomios',
        'multiply': 'Multiplicación de Polinomios',
        'derivative': 'Derivada del Polinomio',
        'integral': 'Integral del Polinomio',
        'roots': 'Raíces del Polinomio'
    };
    return names[operation] || operation;
}

// =============================================
// 4. ➡️ OPERACIONES CON VECTORES
// =============================================

/**
 * Limpia un campo de vector
 */
function clearVector(fieldId) {
    document.getElementById(fieldId).value = "";
}

/**
 * Realiza una operación vectorial
 */
async function vectorOperation(operation) {
    try {
        // Determinar qué vector usar para operaciones individuales
        let selectedVector = document.querySelector('input[name="selectedVector"]:checked').value;
        
        const vector1 = document.getElementById("vector1").value;
        const vector2 = document.getElementById("vector2").value;
        
        let requestData = {
            operation: operation,
            vector1: selectedVector === "1" ? vector1 : vector2
        };

        // Operaciones que requieren dos vectores
        if (['add', 'subtract', 'dot', 'cross', 'angle', 'projection'].includes(operation)) {
            if (!vector1 || !vector2) {
                displayVectorResult("Error: Se necesitan ambos vectores para esta operación", "error");
                return;
            }
            requestData.vector1 = vector1;
            requestData.vector2 = vector2;
        } else {
            // Para operaciones individuales, verificar que el vector seleccionado exista
            if ((selectedVector === "1" && !vector1) || (selectedVector === "2" && !vector2)) {
                displayVectorResult(`Error: El vector ${selectedVector} está vacío`, "error");
                return;
            }
        }

        // Mostrar carga
        displayVectorResult("Calculando...", "loading");

        // Enviar al backend
        const response = await fetch('/vector_operation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (data.success) {
            displayVectorResult(data, "success");
        } else {
            displayVectorResult(`Error: ${data.error}`, "error");
        }

    } catch (error) {
        displayVectorResult(`Error: ${error.message}`, "error");
    }
}

/**
 * Muestra el resultado de una operación vectorial
 */
function displayVectorResult(data, type) {
    const resultDiv = document.getElementById("vector-result");
    
    if (type === "loading") {
        resultDiv.innerHTML = `<div class="text-center p-4">⏳ ${data}</div>`;
        return;
    }

    if (type === "error") {
        resultDiv.innerHTML = `
            <div class="text-center p-4 text-red-500">
                <p class="font-bold">Error</p>
                <p>${data}</p>
            </div>
        `;
        return;
    }

    if (type === "success") {
        let resultContent = `
            <div class="p-4">
                <div class="font-bold mb-2 text-lg text-center text-indigo-600">
                    ${getVectorOperationName(data.operation)}
                </div>
        `;

        if (Array.isArray(data.result)) {
            resultContent += `
                <div class="text-center my-4">
                    <div class="math-result text-xl mb-2">$$${data.latex_result}$$</div>
                    <div class="mt-3 p-3 bg-white rounded-lg shadow-inner border border-gray-200">
                        <p class="text-sm font-medium text-gray-600 mb-1">Forma vectorial:</p>
                        <p class="font-mono text-lg">[${data.result.join(', ')}]</p>
                    </div>
                </div>
            `;
        } else {
            resultContent += `
                <div class="text-center my-4">
                    <div class="math-result text-xl mb-3">$$${data.latex_result}$$</div>
                    <div class="mt-3 p-3 bg-white rounded-lg shadow-inner border border-gray-200">
                        <p class="text-sm font-medium text-gray-600 mb-1">Resultado:</p>
                        <p class="text-2xl font-bold">${data.result}</p>
                    </div>
                </div>
            `;
        }

        resultContent += `</div>`;
        resultDiv.innerHTML = resultContent;
        
        // Renderizar LaTeX con MathJax
        if (typeof MathJax !== 'undefined') {
            MathJax.typeset();
        }
    }
}

/**
 * Obtiene el nombre legible de una operación vectorial
 */
function getVectorOperationName(operation) {
    const names = {
        'add': 'Suma de Vectores',
        'subtract': 'Resta de Vectores',
        'dot': 'Producto Punto',
        'cross': 'Producto Cruz',
        'magnitude': 'Magnitud del Vector',
        'angle': 'Ángulo entre Vectores',
        'normalize': 'Vector Normalizado',
        'projection': 'Proyección Vectorial'
    };
    return names[operation] || operation;
}

// =============================================
// 5. 📊 GRAFICACIÓN DE FUNCIONES
// =============================================

let currentChart = null;

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

// Manejar cambio entre 2D y 3D
document.getElementById('graph-type').addEventListener('change', function() {
    const type = this.value;
    document.getElementById('graph-range-2d').classList.toggle('hidden', type !== '2d');
    document.getElementById('graph-range-3d').classList.toggle('hidden', type === '2d');
});

// =============================================
// 6. ∫🔍 OPERACIONES DE CÁLCULO
// =============================================

/**
 * Limpia el campo de función
 */
function clearCalculusFunction() {
    document.getElementById("calculus-function").value = "";
    document.getElementById("limit-point").value = "";
    document.getElementById("taylor-point").value = "";
    document.getElementById("taylor-degree").value = "";
}

/**
 * Muestra las opciones específicas para cada operación de cálculo
 */
function showCalculusOptions(operation) {
    document.getElementById("limit-point-container").classList.add("hidden");
    document.getElementById("taylor-options-container").classList.add("hidden");
    
    if (operation === "limit") {
        document.getElementById("limit-point-container").classList.remove("hidden");
    } else if (operation === "taylor") {
        document.getElementById("taylor-options-container").classList.remove("hidden");
    }
}

/**
 * Realiza una operación de cálculo
 */
async function calculusOperation(operation) {
    const func = document.getElementById("calculus-function").value;
    const resultDiv = document.getElementById("calculus-result");
    
    if (!func) {
        displayCalculusResult("Error: Por favor ingresa una función", "error");
        return;
    }

    displayCalculusResult("Calculando...", "loading");
    
    const data = {
        operation: operation,
        function: func
    };
    
    // Agregar parámetros adicionales según la operación
    if (operation === "limit") {
        const point = document.getElementById("limit-point").value;
        if (!point) {
            displayCalculusResult("Error: Ingresa un punto para el límite", "error");
            return;
        }
        data.point = point;
    } else if (operation === "taylor") {
        const point = document.getElementById("taylor-point").value;
        const degree = document.getElementById("taylor-degree").value;
        if (!point || !degree) {
            displayCalculusResult("Error: Completa todos los campos para Taylor", "error");
            return;
        }
        data.point = point;
        data.degree = degree;
    }
    
    try {
        const response = await fetch('/calculus_operation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const resultData = await response.json();

        if (resultData.success) {
            displayCalculusResult(resultData, "success");
        } else {
            displayCalculusResult(`Error: ${resultData.error}`, "error");
        }
    } catch (error) {
        displayCalculusResult(`Error de conexión: ${error.message}`, "error");
    }
}

/**
 * Muestra el resultado de una operación de cálculo
 */
function displayCalculusResult(data, type) {
    const resultDiv = document.getElementById("calculus-result");
    
    if (type === "loading") {
        resultDiv.innerHTML = `<div class="text-center p-4">⏳ ${data}</div>`;
        return;
    }

    if (type === "error") {
        resultDiv.innerHTML = `
            <div class="text-center p-4 text-red-500">
                <p class="font-bold">Error</p>
                <p>${data}</p>
            </div>
        `;
        return;
    }

    if (type === "success") {
        let resultContent = `
            <div class="p-4">
                <div class="font-bold mb-2 text-lg text-center text-indigo-600">
                    ${getCalculusOperationName(data.operation)}
                </div>
                <div class="text-center text-gray-600 mb-4 border-b pb-3">
                    Función: $$${data.function_latex || data.function}$$
                </div>
                <div class="text-center text-2xl my-4 p-4 bg-white rounded-lg shadow-inner">
                    Resultado: $$${data.result}$$
                </div>
        `;

        if (data.details) {
            resultContent += `
                <div class="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p class="text-sm font-medium text-gray-600 mb-2">Proceso:</p>
                    <div class="math-details">$$${data.details}$$</div>
                </div>
            `;
        }

        resultContent += `</div>`;
        resultDiv.innerHTML = resultContent;
        
        // Renderizar LaTeX con MathJax
        if (typeof MathJax !== 'undefined') {
            MathJax.typeset();
        }
    }
}

/**
 * Obtiene el nombre legible de una operación de cálculo
 */
function getCalculusOperationName(operation) {
    const names = {
        'derivative': 'Derivada',
        'integral': 'Integral',
        'limit': 'Límite',
        'taylor': 'Serie de Taylor'
    };
    return names[operation] || operation;
}

// =============================================
// 7. ∞ OPERACIONES CON ECUACIONES DIFERENCIALES
// =============================================

/**
 * Limpia todos los inputs de ecuaciones diferenciales
 */
function clearDifferentialInputs() {
    document.getElementById("diff-eq").value = "";
    document.getElementById("initial-x").value = "";
    document.getElementById("initial-y").value = "";
    document.getElementById("step-size").value = "";
    document.getElementById("num-points").value = "";
    document.getElementById("differential-result").innerHTML = `
        <div class="text-center py-8 text-gray-500">
            <i class="fas fa-infinity text-3xl mb-2"></i>
            <p>Los resultados aparecerán aquí</p>
        </div>
    `;
    document.getElementById("graph-container").classList.add("hidden");
}

/**
 * Muestra/oculta opciones según el tipo de solución seleccionado
 */
function showDifferentialOptions() {
    const solutionType = document.querySelector('input[name="solutionType"]:checked').value;
    document.getElementById("numerical-options-container").classList.add("hidden");
    document.getElementById("method-selector-container").classList.add("hidden");
    document.getElementById("analytical-solve-container").classList.add("hidden");
    
    if (solutionType === "numerical") {
        document.getElementById("numerical-options-container").classList.remove("hidden");
        document.getElementById("method-selector-container").classList.remove("hidden");
    } else {
        document.getElementById("analytical-solve-container").classList.remove("hidden");
    }
}

/**
 * Resuelve una ecuación diferencial
 */
async function solveDifferentialEquation(method) {
    const equation = document.getElementById("diff-eq").value;
    const initialX = document.getElementById("initial-x").value;
    const initialY = document.getElementById("initial-y").value;
    const resultDiv = document.getElementById("differential-result");
    
    // Validaciones básicas
    if (!equation || !initialX || !initialY) {
        displayDifferentialResult("Error: Todos los campos son requeridos", "error");
        return;
    }

    // Mostrar estado de carga
    displayDifferentialResult("Resolviendo ecuación diferencial...", "loading");
    
    // Preparar datos
    const data = {
        method: method,
        equation: equation,
        initial_x: initialX,
        initial_y: initialY
    };
    
    // Agregar parámetros numéricos si es necesario
    if (method !== 'analytical') {
        data.step_size = document.getElementById("step-size").value || "0.1";
        data.num_points = document.getElementById("num-points").value || "10";
    }
    
    try {
        const response = await fetch('/differential_operation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || "Error en el servidor");
        }

        if (result.success) {
            displayDifferentialResult(result, "success");
            
            // Mostrar gráfica si existe
            if (result.graph_data) {
                renderDifferentialGraph(result.graph_data);
            }
        } else {
            displayDifferentialResult(`Error: ${result.error}`, "error");
        }
    } catch (error) {
        displayDifferentialResult(`Error: ${error.message}`, "error");
    }
}

function displayDifferentialResult(data, type) {
    const resultDiv = document.getElementById("differential-result");
    
    if (type === "loading") {
        resultDiv.innerHTML = `<div class="text-center p-4">⏳ ${data}</div>`;
        return;
    }

    if (type === "error") {
        resultDiv.innerHTML = `
            <div class="text-center p-4 text-red-500">
                <p class="font-bold">Error</p>
                <p>${data}</p>
            </div>
        `;
        return;
    }

    if (type === "success") {
        let resultHTML = `
            <div class="p-4">
                <h4 class="text-lg font-bold text-indigo-600 mb-2">
                    ${data.method === 'analytical' ? 'Solución Analítica' : 'Solución Numérica'}
                </h4>
                <div class="mb-4 p-3 bg-gray-100 rounded">
                    <p class="text-sm text-gray-600 mb-1">Ecuación:</p>
                    <div class="math-tex">$$${data.equation_latex}$$</div>
                </div>
        `;

        if (data.method === 'analytical') {
            resultHTML += `
                <div class="mb-4 p-3 bg-white rounded border">
                    <p class="text-sm text-gray-600 mb-1">Solución:</p>
                    <div class="math-tex text-xl">$$${data.solution}$$</div>
                </div>
            `;
        } else {
            // Mostrar tabla para métodos numéricos
            resultHTML += `
                <div class="mb-4">
                    <p class="text-sm text-gray-600 mb-2">Resultados numéricos:</p>
                    <div class="overflow-x-auto max-h-60">
                        <table class="min-w-full border">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-2 border">Paso</th>
                                    <th class="px-4 py-2 border">x</th>
                                    <th class="px-4 py-2 border">y(x)</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
            
            data.solution.forEach((point, index) => {
                resultHTML += `
                    <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                        <td class="px-4 py-2 border text-center">${index}</td>
                        <td class="px-4 py-2 border text-center">${point.x.toFixed(4)}</td>
                        <td class="px-4 py-2 border text-center">${point.y.toFixed(4)}</td>
                    </tr>
                `;
            });
            
            resultHTML += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        resultHTML += `</div>`;
        resultDiv.innerHTML = resultHTML;
        
        // Renderizar LaTeX
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise();
        }
    }
}

function renderDifferentialGraph(graphData) {
    const graphContainer = document.getElementById("graph-container");
    const graphElement = document.getElementById("diff-eq-graph");
    
    graphContainer.classList.remove("hidden");
    graphElement.innerHTML = "";
    
    // Usar Plotly o tu librería de gráficos preferida
    Plotly.newPlot(graphElement, [{
        x: graphData.x_values,
        y: graphData.y_values,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Solución'
    }], {
        title: 'Solución Numérica',
        xaxis: { title: 'x' },
        yaxis: { title: 'y(x)' }
    });
}

/**
 * Obtiene el nombre legible del método de solución
 */
function getDifferentialMethodName(method) {
    const names = {
        'analytical': 'Solución Analítica',
        'euler': 'Método de Euler',
        'improved_euler': 'Método de Euler Mejorado',
        'runge_kutta': 'Método de Runge-Kutta'
    };
    return names[method] || method;
}

// Event listeners para el selector de tipo de solución
document.querySelectorAll('input[name="solutionType"]').forEach(radio => {
    radio.addEventListener('change', showDifferentialOptions);
});

// Configurar event listeners para los botones de cálculo
document.querySelectorAll('.operation-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const operation = this.getAttribute('onclick').match(/'([^']+)'/)[1];
        showCalculusOptions(operation);
    });
});