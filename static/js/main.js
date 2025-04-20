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

// Botón para mostrar ayuda del uso d ela calculadora
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
 * Llamado para la resolución de las operancions
 * 'add', 'subtract', 'multiply', etc.
 */
async function matrixOperation(operation) {
    try {
        const matrixA = getMatrixValues("matrixA");
        let requestData = { operation, matrixA };

        // Operaciones que requieren matrixB
        if (['add', 'subtract', 'multiply'].includes(operation)) {
            requestData.matrixB = getMatrixValues("matrixB");
        }

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
 * Realiza una operación con polinomios
 * {string} operation - Tipo de operación ('add', 'subtract', 'multiply', etc.)
 */
function polynomialOperation(operation) {
    const poly1 = document.getElementById("poly1").value;
    let poly2 = null;

    if (operation !== "derivative" && operation !== "integral" && operation !== "roots") {
        poly2 = document.getElementById("poly2").value;
        if (!poly2) {
            document.getElementById("polynomial-result").innerHTML = 
                '<p class="text-center text-red-500 py-4">Error: Se necesita el segundo polinomio para esta operación</p>';
            return;
        }
    }

    if (!poly1) {
        document.getElementById("polynomial-result").innerHTML = 
            '<p class="text-center text-red-500 py-4">Error: Se necesita al menos un polinomio</p>';
        return;
    }

    const resultDiv = document.getElementById("polynomial-result");
    resultDiv.innerHTML = '<p class="text-center py-4">Calculando...</p>';

    // Preparar datos para la solicitud
    const requestData = {
        operation: operation,
        poly1: poly1
    };

    if (poly2) {
        requestData.poly2 = poly2;
    }

    // Hacer la llamada API
    fetch('/polynomial_operation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Renderizar el resultado con MathJax
            resultDiv.innerHTML = `
                <div class="p-4">
                    <div class="font-bold mb-2 text-lg text-center">${getOperationName(operation)}</div>
                    <div class="text-center text-gray-600 mb-4">
                        ${data.details ? `$$${data.details}$$` : ''}
                    </div>
                    <div class="text-center text-2xl my-4">
                        Resultado: $$${data.result}$$
                    </div>
                </div>
            `;
            // Decirle a MathJax que renderice el nuevo LaTeX
            if (typeof MathJax !== 'undefined') {
                MathJax.typeset();
            }
        } else {
            resultDiv.innerHTML = `
                <p class="text-center text-red-500 py-4">
                    Error en ${getOperationName(operation)}: ${data.error}
                </p>
            `;
        }
    })
    .catch(error => {
        resultDiv.innerHTML = `
            <p class="text-center text-red-500 py-4">
                Error de conexión: ${error.message}
            </p>
        `;
    });
}

/**
 * Obtiene el nombre legible de una operación
 * {string} operation - Identificador de la operación
 * returns {string} Nombre legible
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
 * Realiza una operación vectorial
 * {string} operation - Tipo de operación ('add', 'subtract', 'dot', 'cross', etc.)
 */
async function vectorOperation(operation) {
    const vector1Input = document.getElementById("vector1").value;
    let vector2Input = "";
    
    if (operation !== "magnitude" && operation !== "normalize") {
        vector2Input = document.getElementById("vector2").value;
        if (!vector2Input) {
            document.getElementById("vector-result").innerHTML = 
                '<p class="text-center text-red-500 py-4">Error: Necesitas ingresar el segundo vector</p>';
            return;
        }
    }

    if (!vector1Input) {
        document.getElementById("vector-result").innerHTML = 
            '<p class="text-center text-red-500 py-4">Error: Necesitas ingresar al menos el primer vector</p>';
        return;
    }

    const resultDiv = document.getElementById("vector-result");
    resultDiv.innerHTML = '<p class="text-center py-4">Calculando...</p>';

    try {
        const data = {
            operation: operation,
            vector1: vector1Input
        };

        if (operation !== "magnitude" && operation !== "normalize") {
            data.vector2 = vector2Input;
        }

        const response = await fetch('/vector_operation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const resultData = await response.json();

        if (resultData.success) {
            let resultContent;
            if (Array.isArray(resultData.result)) {
                resultContent = `
                    <div class="text-left">
                        <p class="font-bold mb-2 text-blue-600">Operación: ${operation}</p>
                        <div class="my-3 p-3 bg-gray-100 rounded-lg">
                            <p class="text-lg font-semibold text-gray-800 mb-1">Resultado:</p>
                            <div class="math-result">\\(${resultData.latex_result}\\)</div>
                        </div>
                        <p class="text-sm text-gray-600 mt-1">Forma vectorial: [${resultData.result.join(', ')}]</p>
                    </div>
                `;
            } else {
                resultContent = `
                    <div class="text-left">
                        <p class="font-bold mb-2 text-blue-600">Operación: ${operation}</p>
                        <div class="my-3 p-3 bg-gray-100 rounded-lg">
                            <p class="text-lg font-semibold text-gray-800 mb-1">Resultado:</p>
                            <div class="math-result">\\(${resultData.latex_result}\\)</div>
                        </div>
                        <p class="text-sm text-gray-600 mt-1">Valor: ${resultData.result}</p>
                    </div>
                `;
            }
            resultDiv.innerHTML = resultContent;
            
            // Renderizar LaTeX
            if (typeof MathJax !== 'undefined') {
                MathJax.typesetPromise().catch(err => console.log('MathJax error:', err));
            }
        } else {
            resultDiv.innerHTML = `<p class="text-center text-red-500 py-4">Error: ${resultData.error}</p>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<p class="text-center text-red-500 py-4">Error de conexión: ${error.message}</p>`;
    }
}

// =============================================
// 5. 📊 GRAFICACIÓN DE FUNCIONES
// =============================================

let currentChart = null;

 function plotFunction() {
     const type = document.getElementById("graph-type").value;
     const func = document.getElementById("graph-function").value.trim();
     
     if (!func) {
         alert("Por favor ingrese una función");
         return;
     }
 
     // Configurar rangos según el tipo de gráfico
     let plotData = {
         type: type,
         function: func
     };
 
     if (type === "2d") {
         plotData.x_min = parseFloat(document.getElementById("x-min").value);
         plotData.x_max = parseFloat(document.getElementById("x-max").value);
     } else {
         plotData.x_min = parseFloat(document.getElementById("x-min-3d").value);
         plotData.x_max = parseFloat(document.getElementById("x-max-3d").value);
         plotData.y_min = parseFloat(document.getElementById("y-min-3d").value);
         plotData.y_max = parseFloat(document.getElementById("y-max-3d").value);
     }
 
     // Mostrar mensaje de carga
     const graphContainer = document.getElementById("graph-container");
     graphContainer.innerHTML = '<div class="flex items-center justify-center h-full"><p class="text-gray-500">Generando gráfica...</p></div>';
     
     // Decidir qué tipo de gráfico renderizar
     if (type === "2d") {
         // Para 2D, recrear el canvas
         graphContainer.innerHTML = '<canvas id="chartCanvas" style="width: 100%; height: 100%;"></canvas>';
         render2DGraph(plotData);
     } else {
         // Para 3D, crear un div para Plotly
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

        // Extraer los datos
        const xValues = response.x;
        const yValues = response.y;

        const ctx = document.getElementById('chartCanvas').getContext('2d');
        if (currentChart) currentChart.destroy();

        currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: xValues,
                datasets: [{
                    label: `f(x) = ${response.function}`,
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
                    x: { title: { display: true, text: 'x' } },
                    y: { title: { display: true, text: 'f(x)' } }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Gráfica de f(x) = ${response.function}`
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
            title: `Gráfica 3D de f(x,y) = ${response.function}`,
            autosize: true,
            margin: { l: 65, r: 50, b: 65, t: 90 },
            scene: {
                xaxis: { title: 'X' },
                yaxis: { title: 'Y' },
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
 * Muestra las opciones específicas para cada operación de cálculo
 * {string} operation - Tipo de operación ('derivative', 'integral', 'limit', etc.)
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
 * Realiza una operación de cálculo (derivada, integral, límite, etc.)
 * {string} operation - Tipo de operación
 */
function calculusOperation(operation) {
    const func = document.getElementById("calculus-function").value;
    const resultDiv = document.getElementById("calculus-result");
    
    if (!func) {
        resultDiv.innerHTML = '<p class="text-center text-red-500 py-4">Error: Por favor ingresa una función</p>';
        return;
    }

    resultDiv.innerHTML = '<p class="text-center py-4">Calculando...</p>';
    
    const data = {
        operation: operation,
        function: func
    };
    
    // Agregar parámetros adicionales según la operación
    if (operation === "limit") {
        data.point = document.getElementById("limit-point").value;
    } else if (operation === "taylor") {
        data.point = document.getElementById("taylor-point").value;
        data.degree = document.getElementById("taylor-degree").value;
    }
    
    // Enviar la solicitud al backend
    fetch('/calculus_operation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            resultDiv.innerHTML = `
                <div class="text-left">
                    <p class="font-bold mb-2 text-blue-600">Operación: ${operation}</p>
                    <p class="mb-1 text-gray-800">Función: ${func}</p>
                    <div class="my-3 p-3 bg-gray-100 rounded-lg">
                        <p class="text-lg font-semibold text-gray-800 mb-1">Resultado:</p>
                        <div class="math-result">\\(${data.result}\\)</div>
                    </div>
                    ${data.details ? `
                    <div class="mt-2 p-2 bg-gray-50 rounded">
                        <p class="text-sm font-medium text-gray-600 mb-1">Proceso:</p>
                        <div class="math-details">\\(${data.details}\\)</div>
                    </div>
                    ` : ''}
                </div>
            `;
            
            if (typeof MathJax !== 'undefined') {
                MathJax.typesetPromise(['.math-result', '.math-details'])
                    .catch(err => console.log('MathJax error:', err));
            }
        }
    })
    .catch(error => {
        resultDiv.innerHTML = `<p class="text-center text-red-500 py-4">Error de conexión: ${error.message}</p>`;
    });
}

// Configurar event listeners para los botones de cálculo
document.querySelectorAll('.operation-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const operation = this.getAttribute('onclick').match(/'([^']+)'/)[1];
        showCalculusOptions(operation);
    });
});