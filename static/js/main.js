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
// 7. 📝OPERACIONES CON ECUACIONES DIFERENCIALES
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
 * Resuelve una ecuación diferencial con el método seleccionado
 */
async function solveDifferentialEquation(method) {
    // Obtener valores del formulario
    const equation = document.getElementById("diff-eq").value.trim();
    const initialX = document.getElementById("initial-x").value;
    const initialY = document.getElementById("initial-y").value;
    const stepSize = document.getElementById("step-size").value || "0.1";
    const numPoints = document.getElementById("num-points").value || "10";
    const showGraph = document.getElementById("show-graph").value === "true";

    // Validación básica
    if (!equation || !initialX || !initialY) {
        displayDifferentialResult("Error: Todos los campos requeridos deben estar completos", "error");
        return;
    }

    // Mostrar estado de carga
    displayDifferentialResult("Resolviendo ecuación diferencial...", "loading");

    // Preparar datos para enviar - AQUÍ ESTÁ EL CAMBIO IMPORTANTE
    const data = {
        method: method,
        equation: equation,
        initial_x: parseFloat(initialX),
        initial_y: parseFloat(initialY),
        step_size: parseFloat(stepSize),
        num_points: parseInt(numPoints),
        show_graph: showGraph // Enviamos el booleano directamente
    };

    try {
        const response = await fetch('/differential_operation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Error en el servidor");
        }

        if (result.success) {
            displayDifferentialResult(result, "success");
            
            // CAMBIO CRÍTICO AQUÍ - Manejo de la gráfica
            const graphContainer = document.getElementById("graph-container");
            if (result.show_graph && result.graph_data) {
                graphContainer.classList.remove("hidden");
                renderDifferentialGraph(result.graph_data);
            } else {
                graphContainer.classList.add("hidden");
            }
        } else {
            displayDifferentialResult(`Error: ${result.error}`, "error");
        }
    } catch (error) {
        displayDifferentialResult(`Error: ${error.message}`, "error");
    }
}

/**
 * Muestra los resultados de la solución de ecuaciones diferenciales
 */
function displayDifferentialResult(data, type) {
    const resultDiv = document.getElementById("differential-result");
    const graphContainer = document.getElementById("graph-container");
    
    // Limpiar contenedores
    resultDiv.innerHTML = '';
    graphContainer.classList.add("hidden");

    if (type === "loading") {
        resultDiv.innerHTML = `
            <div class="text-center p-4">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-2"></div>
                <p class="text-gray-600">Resolviendo ecuación diferencial...</p>
            </div>
        `;
        return;
    }

    if (type === "error") {
        let errorMessage = data;
        // Detectar si es un error específico de Taylor
        if (data.includes("método Taylor") || data.includes("Derivadas de orden superior")) {
            errorMessage = `
                <div class="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                    <div class="font-bold mb-2">Error en método Taylor:</div>
                    <div class="mb-3">${data}</div>
                    <div class="bg-yellow-50 p-3 rounded border border-yellow-200 text-yellow-800">
                        <i class="fas fa-lightbulb mr-2"></i>
                        <strong>Sugerencia:</strong> Prueba con el método Runge-Kutta 4to orden
                        que puede manejar ecuaciones más complejas.
                    </div>
                </div>
            `;
        }
        
        resultDiv.innerHTML = `
            <div class="text-center p-4">
                <i class="fas fa-exclamation-triangle text-2xl mb-2 text-red-500"></i>
                ${errorMessage}
            </div>
        `;
        return;
    }

    if (type === "success") {
        // Obtener valores iniciales del resultado o de los datos enviados
        const initialX = data.initial_x || parseFloat(document.getElementById("initial-x").value);
        const initialY = data.initial_y || parseFloat(document.getElementById("initial-y").value);
    
        let resultHTML = `
            <div class="p-4 space-y-6">
                <div class="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                    <h4 class="text-lg font-bold text-indigo-700 mb-3 flex items-center">
                        <i class="fas ${getMethodIcon(data.method)} text-indigo-500 mr-2"></i>
                        ${getDifferentialMethodName(data.method)}
                    </h4>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-white rounded-lg p-3 border border-gray-200">
                            <p class="text-sm font-medium text-gray-600 mb-2">Ecuación diferencial:</p>
                            <div class="math-tex p-2 bg-gray-50 rounded">$$${data.equation_latex}$$</div>
                        </div>
                        <div class="bg-white rounded-lg p-3 border border-gray-200">
                            <p class="text-sm font-medium text-gray-600 mb-2">Condición inicial:</p>
                            <div class="math-tex p-2 bg-gray-50 rounded">$$y(${initialX}) = ${initialY}$$</div>
                        </div>
                    </div>
                </div>
        `;

        if (data.method === 'analytical') {
            resultHTML += `
                <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h5 class="text-md font-semibold text-blue-700 mb-3 flex items-center">
                        <i class="fas fa-list-ol text-blue-500 mr-2"></i>
                        Procedimiento Analítico
                    </h5>
                    
                    <div class="space-y-4">
                        <div class="bg-white rounded p-3 border border-blue-100">
                            <p class="text-sm font-medium text-blue-600 mb-1">1. Identificación del tipo de ecuación:</p>
                            <div class="math-tex bg-gray-50 p-2 rounded text-center">$$${data.equation_latex}$$</div>
                        </div>
                        
                        <div class="bg-white rounded p-3 border border-blue-100">
                            <p class="text-sm font-medium text-blue-600 mb-1">2. Método de solución aplicado:</p>
                            <div class="math-tex bg-gray-50 p-2 rounded text-center">$$${getSolutionMethod(data.equation_latex)}$$</div>
                        </div>
                        
                        <div class="bg-white rounded p-3 border border-blue-100">
                            <p class="text-sm font-medium text-blue-600 mb-1">3. Integración:</p>
                            <div class="math-tex bg-gray-50 p-2 rounded text-center">$$\\int \\frac{dy}{dx} dx = \\int f(x) dx$$</div>
                        </div>
                        
                        <div class="bg-white rounded p-3 border border-blue-100">
                            <p class="text-sm font-medium text-blue-600 mb-1">4. Solución general:</p>
                            <div class="math-tex bg-gray-50 p-2 rounded text-center">$$y(x) = C \\cdot e^{\\int f(x) dx}$$</div>
                        </div>
                        
                        <div class="bg-white rounded p-3 border border-blue-100">
                            <p class="text-sm font-medium text-blue-600 mb-1">5. Aplicación de condición inicial:</p>
                            <div class="math-tex bg-gray-50 p-2 rounded text-center">$$C = ${data.initial_y} \\cdot e^{-\\int_{x_0} f(x) dx}$$</div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h5 class="text-md font-semibold text-green-700 mb-3 flex items-center">
                        <i class="fas fa-check-circle text-green-500 mr-2"></i>
                        Solución Final
                    </h5>
                    <div class="math-tex text-lg bg-white p-4 rounded-lg border border-green-200 text-center">
                        $$y(x) = ${data.solution}$$
                    </div>
                </div>
            `;
        } else {
            // Sección de Método Numérico
            resultHTML += `
                <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h5 class="text-md font-semibold text-purple-700 mb-3 flex items-center">
                        <i class="fas fa-calculator text-purple-500 mr-2"></i>
                        Detalles del Método ${getDifferentialMethodName(data.method)}
                    </h5>
                    
                    <div class="bg-white rounded-lg p-3 mb-4">
                        <div class="math-tex bg-gray-50 p-3 rounded-lg text-center">
                            ${getMethodFormula(data.method)}
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg p-3 border border-gray-200 overflow-auto max-h-80">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="px-3 py-2 text-xs font-medium text-gray-700 uppercase">Paso</th>
                                    <th class="px-3 py-2 text-xs font-medium text-gray-700 uppercase">Detalle del Cálculo</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 font-mono text-sm">
            `;
            
            // Mostrar cada paso del método numérico
            if (data.method_details && data.method_details.length > 0) {
                let currentStep = 0;
                data.method_details.forEach((line, index) => {
                    if (line.startsWith("Paso")) {
                        currentStep = parseInt(line.split(" ")[1]);
                        resultHTML += `
                            <tr class="bg-gray-50">
                                <td class="px-3 py-2 text-center font-medium">${currentStep}</td>
                                <td class="px-3 py-2">${line.replace(/Paso \d+:/, '')}</td>
                            </tr>
                        `;
                    } else if (line.includes("k1") || line.includes("k2") || line.includes("k3") || line.includes("k4")) {
                        resultHTML += `
                            <tr>
                                <td class="px-3 py-2"></td>
                                <td class="px-3 py-2 text-purple-600">${line}</td>
                            </tr>
                        `;
                    } else if (line.includes("f(") || line.includes("y(") || line.includes("y*")) {
                        resultHTML += `
                            <tr>
                                <td class="px-3 py-2"></td>
                                <td class="px-3 py-2">${line}</td>
                            </tr>
                        `;
                    } else if (line.trim() !== "") {
                        resultHTML += `
                            <tr class="bg-gray-100">
                                <td class="px-3 py-2"></td>
                                <td class="px-3 py-2 font-semibold">${line}</td>
                            </tr>
                        `;
                    }
                });
            }
            
            resultHTML += `
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <h5 class="text-md font-semibold text-gray-700 p-3 bg-gray-100 border-b flex items-center">
                        <i class="fas fa-table text-gray-500 mr-2"></i>
                        Resultados Numéricos
                    </h5>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Paso</th>
                                    <th class="px-4 py-2 text-xs font-medium text-gray-500 uppercase">x</th>
                                    <th class="px-4 py-2 text-xs font-medium text-gray-500 uppercase">y(x)</th> 
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
            `;

            // Mostrar tabla de resultados con valores intermedios si están disponibles
            data.solution.forEach((point, index) => {
                const stepData = data.method_steps ? data.method_steps[index] : null;
                
                resultHTML += `
                    <tr class="hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                        <td class="px-4 py-2 text-center text-sm">${index}</td>
                        <td class="px-4 py-2 text-center text-sm">${point.x.toFixed(4)}</td>
                        <td class="px-4 py-2 text-center text-sm font-medium text-blue-600">${point.y.toFixed(4)}</td>
                `;
                resultHTML += `</tr>`;
            });

            resultHTML += `
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm text-gray-600">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div class="flex items-center">
                            <i class="fas fa-project-diagram text-indigo-500 mr-2"></i>
                            <span>Método: <span class="font-medium">${getDifferentialMethodName(data.method)}</span></span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-ruler text-orange-500 mr-2"></i>
                            <span>Paso (h): <span class="font-medium">${data.step_size || 0.1}</span></span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-hashtag text-green-500 mr-2"></i>
                            <span>Puntos: <span class="font-medium">${data.solution.length}</span></span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-flag text-red-500 mr-2"></i>
                            <span>Condición inicial: <span class="font-medium">y(${data.initial_x}) = ${data.initial_y}</span></span>
                        </div>
                    </div>
                </div>
            `;
        }

        resultHTML += `</div>`; // Cierre del contenedor principal
        resultDiv.innerHTML = resultHTML;

        // Mostrar gráfica si está habilitado y hay datos
        if (data.show_graph && data.graph_data) {
            setTimeout(() => {
                document.getElementById("graph-container").classList.remove("hidden");
                renderDifferentialGraph(data.graph_data);
            }, 100);
        }

        // Renderizar LaTeX
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise().catch(err => console.error("Error rendering MathJax:", err));
        }
    }
}

// Funciones auxiliares para mejorar la presentación
function getMethodIcon(method) {
    const icons = {
        'analytical': 'fa-square-root-alt',
        'euler': 'fa-arrow-down-short-wide',
        'improved_euler': 'fa-arrow-up-right-dots',
        'runge_kutta': 'fa-arrows-rotate',
        'taylor': 'fa-superscript'
    };
    return icons[method] || 'fa-calculator';
}

function getMethodFormula(method) {
    const formulas = {
        'euler': 'y_{n+1} = y_n + h \\cdot f(x_n, y_n)',
        'improved_euler': '\\begin{aligned} y_{n+1} &= y_n + \\frac{h}{2} \\cdot [f(x_n, y_n) + f(x_{n+1}, y_n + h \\cdot f(x_n, y_n))] \\\\ &= y_n + \\frac{h}{2} \\cdot (k_1 + k_2) \\end{aligned}',
        'runge_kutta': '\\begin{aligned} k_1 &= f(x_n, y_n) \\\\ k_2 &= f(x_n + \\frac{h}{2}, y_n + \\frac{h}{2} \\cdot k_1) \\\\ k_3 &= f(x_n + \\frac{h}{2}, y_n + \\frac{h}{2} \\cdot k_2) \\\\ k_4 &= f(x_n + h, y_n + h \\cdot k_3) \\\\ y_{n+1} &= y_n + \\frac{h}{6} \\cdot (k_1 + 2k_2 + 2k_3 + k_4) \\end{aligned}',
        'taylor': '\\begin{aligned} y_{n+1} &= y_n + h \\cdot f(x_n, y_n) + \\frac{h^2}{2} \\cdot f\'(x_n, y_n) \\\\ f\' &= \\frac{\\partial f}{\\partial x} + \\frac{\\partial f}{\\partial y} \\cdot f(x,y) \\end{aligned}'
    };
    return formulas[method] ? `$$${formulas[method]}$$` : '';
}

function getSolutionMethod(equation) {
    if (equation.includes("\\frac{dy}{dx}")) {
        return "\\text{Ecuación diferencial de primer orden}";
    } else if (equation.includes("\\frac{d^2y}{dx^2}")) {
        return "\\text{Ecuación diferencial de segundo orden}";
    }
    return "\\text{Método de solución no especificado}";
}

function getDifferentialMethodName(method) {
    const names = {
        'analytical': 'Solución Analítica',
        'euler': 'Método de Euler',
        'improved_euler': 'Método de Euler Mejorado',
        'runge_kutta': 'Método de Runge-Kutta (4to orden)',
        'taylor': 'Método de Taylor (2do orden)'
    };
    return names[method] || method;
}

/**
 * Renderiza la gráfica de la solución
 */
function renderDifferentialGraph(graphData) {
    const graphElement = document.getElementById("diff-eq-graph");
    
    // Datos mínimos para la gráfica
    const trace = {
        x: graphData.x_values,
        y: graphData.y_values,
        type: 'scatter',
        mode: 'lines'
    };

    const layout = {
        title: 'Solución de la Ecuación Diferencial',
        xaxis: { title: 'x' },
        yaxis: { title: 'y(x)' }
    };

    // Renderizar directamente SIN verificar nada más
    Plotly.newPlot(graphElement, [trace], layout)
        .then(() => {
            console.log("Gráfica renderizada con éxito!");
        })
        .catch(err => {
            graphElement.innerHTML = `
                <div class="text-red-500 p-4">
                    Error al dibujar gráfica: ${err.message}
                </div>
            `;
            console.error("Error Plotly:", err);
        });
}

// =============================================
// 7. 📊Modelos Matemáticos
// =============================================

// Mostrar/ocultar modelos
function showModel(modelId) {
    // Actualizar pestañas activas
    document.querySelectorAll('.model-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.remove('bg-indigo-600', 'text-white');
        tab.classList.add('bg-indigo-100', 'text-indigo-800');
    });
    
    // Activar la pestaña seleccionada
    const activeTab = document.querySelector(`.model-tab[onclick="showModel('${modelId}')"]`);
    activeTab.classList.add('active');
    activeTab.classList.remove('bg-indigo-100', 'text-indigo-800');
    activeTab.classList.add('bg-indigo-600', 'text-white');
    
    // Mostrar/ocultar contenido
    document.querySelectorAll('.model-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`${modelId}-model`).classList.remove('hidden');
}

// Modelo SIR de Propagación de Epidemias
async function runEpidemicModel() {
    try {
        // Obtener parámetros del usuario (puedes crear inputs en tu HTML)
        const population = parseFloat(document.getElementById('epidemic-population').value) || 1000;
        const initialInfected = parseFloat(document.getElementById('epidemic-initial-infected').value) || 1;
        const beta = parseFloat(document.getElementById('epidemic-beta').value) || 0.5;  // Tasa de contacto
        const gamma = parseFloat(document.getElementById('epidemic-gamma').value) || 0.1; // Tasa de recuperación
        const days = parseFloat(document.getElementById('epidemic-days').value) || 100;
        
        // Enviar al backend
        const response = await fetch('/epidemic_model', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                population,
                initialInfected,
                beta,
                gamma,
                days
            })
        });

        const data = await response.json();
        
        if (data.success) {
            displayEpidemicResults(data);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        Swal.fire('Error', `Error al ejecutar el modelo: ${error.message}`, 'error');
    }
}

function displayEpidemicResults(data) {
    const resultDiv = document.getElementById('epidemic-result');
    
    // Tabla de resultados
    let html = `
        <div class="bg-white rounded-lg shadow-md p-4 mb-4">
            <h3 class="text-lg font-bold mb-2">Resultados del Modelo SIR</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div class="bg-blue-50 p-3 rounded border border-blue-200">
                    <p class="text-sm text-blue-600">Pico de infección</p>
                    <p class="text-xl font-bold">Día ${data.peak.day}</p>
                    <p class="text-sm">${data.peak.infected.toFixed(0)} infectados</p>
                </div>
                <div class="bg-green-50 p-3 rounded border border-green-200">
                    <p class="text-sm text-green-600">Total recuperados</p>
                    <p class="text-xl font-bold">${data.final.recovered.toFixed(0)}</p>
                    <p class="text-sm">${((data.final.recovered/data.population)*100).toFixed(1)}% población</p>
                </div>
                <div class="bg-red-50 p-3 rounded border border-red-200">
                    <p class="text-sm text-red-600">Máxima tasa de infección</p>
                    <p class="text-xl font-bold">${(data.peak.rate*100).toFixed(1)}% por día</p>
                </div>
            </div>
            
            <div id="epidemic-chart" style="height: 400px;"></div>
        </div>
    `;
    
    resultDiv.innerHTML = html;
    
    // Gráfica
    const trace1 = {
        x: data.days,
        y: data.susceptible,
        name: 'Susceptibles',
        line: {color: '#3b82f6'}
    };
    
    const trace2 = {
        x: data.days,
        y: data.infected,
        name: 'Infectados',
        line: {color: '#ef4444'}
    };
    
    const trace3 = {
        x: data.days,
        y: data.recovered,
        name: 'Recuperados',
        line: {color: '#10b981'}
    };
    
    Plotly.newPlot('epidemic-chart', [trace1, trace2, trace3], {
        title: 'Modelo SIR - Evolución de la Epidemia',
        xaxis: {title: 'Días'},
        yaxis: {title: 'Población'},
        hovermode: 'x unified'
    });
}

// Modelo de Dinámica de Fluidos: Ecuación de Bernoulli
async function calculateBernoulli() {
    try {
        const pressure1 = parseFloat(document.getElementById('bernoulli-p1').value) || 101325; // Pa
        const velocity1 = parseFloat(document.getElementById('bernoulli-v1').value) || 0;      // m/s
        const height1 = parseFloat(document.getElementById('bernoulli-h1').value) || 0;        // m
        const pressure2 = parseFloat(document.getElementById('bernoulli-p2').value) || null;
        const velocity2 = parseFloat(document.getElementById('bernoulli-v2').value) || null;
        const height2 = parseFloat(document.getElementById('bernoulli-h2').value) || 0;       // m
        const density = parseFloat(document.getElementById('bernoulli-density').value) || 1000; // kg/m³ (agua)
        
        // Validar que solo falte una variable
        const missing = [pressure2, velocity2].filter(x => x === null).length;
        if (missing !== 1) {
            throw new Error("Debes dejar exactamente un campo en blanco (presión 2 o velocidad 2) para calcular");
        }
        
        const response = await fetch('/bernoulli', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                p1: pressure1,
                v1: velocity1,
                h1: height1,
                p2: pressure2,
                v2: velocity2,
                h2: height2,
                density
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayBernoulliResults(data);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}

function displayBernoulliResults(data) {
    const resultDiv = document.getElementById('bernoulli-result');
    
    let html = `
        <div class="bg-white rounded-lg shadow-md p-4">
            <h3 class="text-lg font-bold mb-3">Resultados de la Ecuación de Bernoulli</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="bg-blue-50 p-3 rounded border border-blue-200">
                    <p class="text-sm text-blue-600">Punto 1</p>
                    <div class="grid grid-cols-3 gap-2">
                        <div>
                            <p class="text-xs">Presión</p>
                            <p class="font-bold">${data.p1.toFixed(1)} Pa</p>
                        </div>
                        <div>
                            <p class="text-xs">Velocidad</p>
                            <p class="font-bold">${data.v1.toFixed(2)} m/s</p>
                        </div>
                        <div>
                            <p class="text-xs">Altura</p>
                            <p class="font-bold">${data.h1.toFixed(2)} m</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-green-50 p-3 rounded border border-green-200">
                    <p class="text-sm text-green-600">Punto 2</p>
                    <div class="grid grid-cols-3 gap-2">
                        <div>
                            <p class="text-xs">Presión</p>
                            <p class="font-bold">${data.p2.toFixed(1)} Pa</p>
                        </div>
                        <div>
                            <p class="text-xs">Velocidad</p>
                            <p class="font-bold">${data.v2.toFixed(2)} m/s</p>
                        </div>
                        <div>
                            <p class="text-xs">Altura</p>
                            <p class="font-bold">${data.h2.toFixed(2)} m</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="bg-gray-50 p-3 rounded border border-gray-200">
                <p class="text-sm text-gray-600 mb-1">Ecuación aplicada:</p>
                <div class="text-center">
                    <p class="text-lg">$$P_1 + \\frac{1}{2}\\rho v_1^2 + \\rho g h_1 = P_2 + \\frac{1}{2}\\rho v_2^2 + \\rho g h_2$$</p>
                </div>
            </div>
            
            <div class="mt-4">
                <canvas id="bernoulli-chart" height="300"></canvas>
            </div>
        </div>
    `;
    
    resultDiv.innerHTML = html;
    
    // Renderizar LaTeX
    if (typeof MathJax !== 'undefined') {
        MathJax.typeset();
    }
    
    // Gráfica de presión vs velocidad
    const ctx = document.getElementById('bernoulli-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Punto 1', 'Punto 2'],
            datasets: [
                {
                    label: 'Presión (kPa)',
                    data: [data.p1/1000, data.p2/1000],
                    borderColor: '#3b82f6',
                    backgroundColor: '#3b82f6',
                    yAxisID: 'y'
                },
                {
                    label: 'Velocidad (m/s)',
                    data: [data.v1, data.v2],
                    borderColor: '#ef4444',
                    backgroundColor: '#ef4444',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Presión (kPa)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Velocidad (m/s)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

// Modelo de Interceptación de Trayectorias (Misiles)
async function calculateInterception() {
    try {
        // Parámetros del objetivo
        const targetX = parseFloat(document.getElementById('target-x').value) || 1000;  // m
        const targetY = parseFloat(document.getElementById('target-y').value) || 1000;  // m
        const targetVx = parseFloat(document.getElementById('target-vx').value) || 50;  // m/s
        const targetVy = parseFloat(document.getElementById('target-vy').value) || 0;   // m/s
        
        // Parámetros del interceptor
        const missileX = parseFloat(document.getElementById('missile-x').value) || 0;   // m
        const missileY = parseFloat(document.getElementById('missile-y').value) || 0;   // m
        const missileSpeed = parseFloat(document.getElementById('missile-speed').value) || 200;  // m/s
        const navigationConstant = parseFloat(document.getElementById('missile-n').value) || 3;  // Constante de navegación
        
        const response = await fetch('/interception', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                target: { x: targetX, y: targetY, vx: targetVx, vy: targetVy },
                missile: { x: missileX, y: missileY, speed: missileSpeed, N: navigationConstant }
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayInterceptionResults(data);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}

function displayInterceptionResults(data) {
    const resultDiv = document.getElementById('interception-result');
    
    let html = `
        <div class="bg-white rounded-lg shadow-md p-4">
            <h3 class="text-lg font-bold mb-3">Resultados de Interceptación</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="bg-blue-50 p-3 rounded border border-blue-200">
                    <h4 class="font-semibold text-blue-700 mb-2">Objetivo</h4>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <p class="text-xs">Posición inicial</p>
                            <p class="font-bold">(${data.target.x.toFixed(1)}, ${data.target.y.toFixed(1)}) m</p>
                        </div>
                        <div>
                            <p class="text-xs">Velocidad</p>
                            <p class="font-bold">(${data.target.vx.toFixed(1)}, ${data.target.vy.toFixed(1)}) m/s</p>
                        </div>
                        <div>
                            <p class="text-xs">Tiempo de interceptación</p>
                            <p class="font-bold">${data.time.toFixed(2)} s</p>
                        </div>
                        <div>
                            <p class="text-xs">Posición final</p>
                            <p class="font-bold">(${data.interception.x.toFixed(1)}, ${data.interception.y.toFixed(1)}) m</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-green-50 p-3 rounded border border-green-200">
                    <h4 class="font-semibold text-green-700 mb-2">Interceptor</h4>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <p class="text-xs">Posición inicial</p>
                            <p class="font-bold">(${data.missile.x.toFixed(1)}, ${data.missile.y.toFixed(1)}) m</p>
                        </div>
                        <div>
                            <p class="text-xs">Velocidad</p>
                            <p class="font-bold">${data.missile.speed.toFixed(1)} m/s</p>
                        </div>
                        <div>
                            <p class="text-xs">Ángulo inicial</p>
                            <p class="font-bold">${(data.initial_angle * 180/Math.PI).toFixed(1)}°</p>
                        </div>
                        <div>
                            <p class="text-xs">Distancia recorrida</p>
                            <p class="font-bold">${data.distance.toFixed(1)} m</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="interception-chart" style="height: 500px;"></div>
            
            <div class="mt-4 bg-gray-50 p-3 rounded border border-gray-200">
                <h4 class="font-semibold text-gray-700 mb-2">Ecuaciones Clave</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div class="text-center p-2 bg-white rounded border border-gray-200">
                        <p class="text-sm text-gray-600 mb-1">Línea de visión (LOS)</p>
                        <p class="text-lg">$$\\lambda = \\arctan\\left(\\frac{y_{t} - y_{m}}{x_{t} - x_{m}}\\right)$$</p>
                    </div>
                    <div class="text-center p-2 bg-white rounded border border-gray-200">
                        <p class="text-sm text-gray-600 mb-1">Tasa de giro</p>
                        <p class="text-lg">$$a = N \\cdot V_{m} \\cdot \\dot{\\lambda}$$</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    resultDiv.innerHTML = html;
    
    // Renderizar LaTeX
    if (typeof MathJax !== 'undefined') {
        MathJax.typeset();
    }
    
    // Gráfica de trayectorias
    const targetTrace = {
        x: data.target_path.x,
        y: data.target_path.y,
        name: 'Objetivo',
        mode: 'lines',
        line: {color: '#ef4444'}
    };
    
    const missileTrace = {
        x: data.missile_path.x,
        y: data.missile_path.y,
        name: 'Interceptor',
        mode: 'lines',
        line: {color: '#3b82f6'}
    };
    
    const interceptionPoint = {
        x: [data.interception.x],
        y: [data.interception.y],
        name: 'Punto de Interceptación',
        mode: 'markers',
        marker: {
            color: '#10b981',
            size: 10
        }
    };
    
    Plotly.newPlot('interception-chart', [targetTrace, missileTrace, interceptionPoint], {
        title: 'Trayectorias de Interceptación',
        xaxis: {title: 'Posición X (m)'},
        yaxis: {title: 'Posición Y (m)'},
        showlegend: true
    });
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
