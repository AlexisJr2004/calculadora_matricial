// =============================================
// OPERACIONES CON ECUACIONES DIFERENCIALES
// =============================================

// ===============================
// Funciones de UI y manejo de inputs
// ===============================

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

// ===============================
// Resolución de ecuaciones diferenciales
// ===============================

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

    // Preparar datos para enviar
    const data = {
        method: method,
        equation: equation,
        initial_x: parseFloat(initialX),
        initial_y: parseFloat(initialY),
        step_size: parseFloat(stepSize),
        num_points: parseInt(numPoints),
        show_graph: showGraph
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

            // Mostrar gráfica si corresponde
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

        resultHTML += `</div>`;
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

// ===============================
// Funciones auxiliares de presentación
// ===============================

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

// ===============================
// Event Listeners
// ===============================

// Selector de tipo de solución
document.querySelectorAll('input[name="solutionType"]').forEach(radio => {
    radio.addEventListener('change', showDifferentialOptions);
});

// Botones de operación de cálculo (para mostrar opciones)
document.querySelectorAll('.operation-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const operation = this.getAttribute('onclick').match(/'([^']+)'/)[1];
        showCalculusOptions(operation);
    });
});