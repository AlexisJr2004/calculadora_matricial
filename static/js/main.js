// Función para mostrar/ocultar secciones
function showSection(sectionId) {
  // Ocultar todas las secciones
  document.querySelectorAll("#content > div").forEach((div) => {
    div.classList.add("hidden");
  });

  // Mostrar la sección seleccionada
  document.getElementById(`${sectionId}-section`).classList.remove("hidden");

  // Update active tab
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.remove("active");
  });
  document.getElementById(`${sectionId}Tab`).classList.add("active");

  // Trigger fade-in animation
  document.getElementById(`${sectionId}-section`).classList.add("fade-in");

  // Si es la sección de matrices, actualizar el tamaño
  if (sectionId === "matrices") {
    updateMatrixSize();
  }
}

// Manejar cambios en el tipo de gráfica
document.getElementById("graph-type").addEventListener("change", function () {
  const type = this.value;
  document
    .getElementById("graph-range-2d")
    .classList.toggle("hidden", type !== "2d");
  document
    .getElementById("graph-range-3d")
    .classList.toggle("hidden", type === "2d");
});

// *******************************************************************
// *         INICIO DEL CÓDIGO DE LAS OPERACIONES CON MATRICES       *
// *******************************************************************

// Variables globales para el tamaño de las matrices
let matrixRows = 3;
let matrixCols = 3;

// Funciones de validación
function validateMatrixDimensions(a, b) {
    if (!a || !b) throw new Error("Ambas matrices son requeridas");
    if (a.length !== b.length || a[0].length !== b[0].length) {
        throw new Error("Las matrices deben tener las mismas dimensiones");
    }
}

function validateSquareMatrix(matrix) {
    if (matrix.length !== matrix[0].length) {
        throw new Error("La matriz debe ser cuadrada (mismo número de filas y columnas)");
    }
}

function validateMatrixMultiplication(a, b) {
    if (!a || !b) throw new Error("Ambas matrices son requeridas");
    if (a[0].length !== b.length) {
        throw new Error("El número de columnas de la primera matriz debe coincidir con el número de filas de la segunda");
    }
}

// Funciones de utilidad para matrices
function randomizeMatrix(matrix) {
    const inputs = document.querySelectorAll(`#matrix${matrix} input`);
    inputs.forEach((input) => {
      input.value = Math.floor(Math.random() * 10) - 5;
    });
}

function clearMatrix(matrix) {
    const inputs = document.querySelectorAll(`#matrix${matrix} input`);
    inputs.forEach((input) => {
      input.value = "";
    });
}

function updateMatrixSize() {
    matrixRows = parseInt(document.getElementById("matrix-rows").value);
    matrixCols = parseInt(document.getElementById("matrix-cols").value);

    const createInputs = (containerId) => {
        const container = document.getElementById(containerId);
        container.innerHTML = "";
        container.style.gridTemplateColumns = `repeat(${matrixCols}, 1fr)`;

        for (let i = 0; i < matrixRows * matrixCols; i++) {
            const input = document.createElement("input");
            input.type = "number";
            input.className = "matrix-input";
            input.placeholder = "0";
            input.value = "0";
            container.appendChild(input);
        }
    };
    createInputs("matrixA");
    createInputs("matrixB");
}

// Función corregida para obtener valores de la matriz
function getMatrixValues(matrixId, rows, cols) {
    const container = document.getElementById(matrixId);
    if (!container) {
        throw new Error(`No se encontró el contenedor de la matriz con ID: ${matrixId}`);
    }

    const inputs = container.getElementsByTagName("input");
    if (inputs.length !== rows * cols) {
        throw new Error(`Número incorrecto de inputs. Esperados: ${rows * cols}, Encontrados: ${inputs.length}`);
    }

    const matrix = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            const index = i * cols + j;
            const input = inputs[index];
            const value = input.value ? parseFloat(input.value) : 0;
            if (isNaN(value)) {
                throw new Error(`Valor inválido en fila ${i + 1}, columna ${j + 1}`);
            }
            row.push(value);
        }
        matrix.push(row);
    }
    return matrix;
}

// Inicializar las matrices al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    updateMatrixSize();
});

/******************************************************************************************
 *                                                                                        
 *  📦 MÓDULO: Operaciones con Matrices                                                    
 *                                                                                        
 *  📄 DESCRIPCIÓN:                                                                       
 *  Este módulo contiene funciones relacionadas con la creación, manipulación y análisis  
 *  de estructuras matriciales. Incluye operaciones como suma, resta, transposición,      
 *  multiplicación, entre otras utilidades matemáticas útiles en procesamiento de datos,  
 *  gráficos y álgebra lineal.                                                            
 *                                                                                        
 *  🧑‍💻 AUTOR: [Tu Nombre o Equipo]                                                       
 *  🗓️  FECHA: [Fecha de creación]                                                        
 *                                                                                        
 ******************************************************************************************/
function matrixOperation(operation) {
    try {
        const rows = parseInt(document.getElementById("matrix-rows").value);
        const cols = parseInt(document.getElementById("matrix-cols").value);
        
        // Siempre necesitamos la matriz A
        const matrixA = getMatrixValues("matrixA", rows, cols);
        let matrixB, result;

        switch (operation) {
            case "add":
                matrixB = getMatrixValues("matrixB", rows, cols);
                validateMatrixDimensions(matrixA, matrixB);
                result = addMatrices(matrixA, matrixB);
                displayMatrixResult(result, "matrix");
                break;
                
            case "subtract":
                matrixB = getMatrixValues("matrixB", rows, cols);
                validateMatrixDimensions(matrixA, matrixB);
                result = subtractMatrices(matrixA, matrixB);
                displayMatrixResult(result, "matrix");
                break;
                
            case "multiply":
                matrixB = getMatrixValues("matrixB", rows, cols);
                validateMatrixMultiplication(matrixA, matrixB);
                result = multiplyMatrices(matrixA, matrixB);
                displayMatrixResult(result, "matrix");
                break;
                
            case "determinant":
                validateSquareMatrix(matrixA);
                result = calculateDeterminant(matrixA);
                displayMatrixResult(result, "number");
                break;
                
            case "inverse":
                validateSquareMatrix(matrixA);
                result = calculateInverse(matrixA);
                displayMatrixResult(result, "matrix");
                break;
                
            case "transpose":
                result = transposeMatrix(matrixA);
                displayMatrixResult(result, "matrix");
                break;
                
            case "rank":
                result = calculateRank(matrixA);
                displayMatrixResult(result, "number");
                break;
                
            case "trace":
                validateSquareMatrix(matrixA);
                result = calculateTrace(matrixA);
                displayMatrixResult(result, "number");
                break;
                
            default:
                throw new Error("Operación no reconocida");
        }
    } catch (error) {
        displayMatrixResult(`Error: ${error.message}`, "error");
    }
}

// Operaciones matriciales básicas
function addMatrices(a, b) {
    return a.map((row, i) => row.map((val, j) => val + b[i][j]));
}

function subtractMatrices(a, b) {
    return a.map((row, i) => row.map((val, j) => val - b[i][j]));
}

function multiplyMatrices(a, b) {
    const result = new Array(a.length);
    for (let i = 0; i < a.length; i++) {
        result[i] = new Array(b[0].length).fill(0);
        for (let j = 0; j < b[0].length; j++) {
            for (let k = 0; k < a[0].length; k++) {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    return result;
}

// Operaciones matriciales avanzadas
function calculateDeterminant(matrix) {
    if (matrix.length === 1) return matrix[0][0];
    if (matrix.length === 2) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }

    let det = 0;
    for (let col = 0; col < matrix.length; col++) {
        const minor = matrix.slice(1).map(row => 
            row.filter((_, j) => j !== col)
        );
        det += matrix[0][col] * Math.pow(-1, col) * calculateDeterminant(minor);
    }
    return det;
}

function transposeMatrix(matrix) {
    return matrix[0].map((_, col) => matrix.map(row => row[col]));
}

function calculateTrace(matrix) {
    return matrix.reduce((sum, row, i) => sum + row[i], 0);
}

function calculateRank(matrix) {
    const eps = 1e-10;
    return matrix.filter(row => 
        row.some(val => Math.abs(val) > eps)
    ).length;
}

function calculateInverse(matrix) {
    const det = calculateDeterminant(matrix);
    if (Math.abs(det) < 1e-10) {
        throw new Error("La matriz no es invertible (determinante cero)");
    }

    if (matrix.length === 1) return [[1 / matrix[0][0]]];
    if (matrix.length === 2) {
        return [
            [matrix[1][1]/det, -matrix[0][1]/det],
            [-matrix[1][0]/det, matrix[0][0]/det]
        ];
    }

    // Matriz de cofactores
    const cofactors = matrix.map((row, i) => 
        row.map((_, j) => {
            const minor = matrix.filter((_, ii) => ii !== i)
                            .map(r => r.filter((_, jj) => jj !== j));
            return Math.pow(-1, i + j) * calculateDeterminant(minor);
        })
    );

    // Matriz adjunta (transpuesta de la matriz de cofactores)
    const adjugate = transposeMatrix(cofactors);
    
    // Matriz inversa (adjunta dividida por el determinante)
    return adjugate.map(row => row.map(val => val / det));
}

// Mostrar resultados
function displayMatrixResult(result, type) {
    const resultDiv = document.getElementById("matrix-result");
    
    if (type === "number") {
        resultDiv.innerHTML = `
            <div class="text-center p-4">
                <p class="text-lg font-bold">Resultado:</p>
                <p class="text-2xl mt-2">${result.toFixed(4)}</p>
            </div>
        `;
    } else if (type === "matrix") {
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
    } else {
        resultDiv.innerHTML = `
            <div class="text-center p-4">
                <p class="text-lg">${result}</p>
            </div>
        `;
    }
}

/******************************************************************************************
 *                                                                                        
 *  📦 MÓDULO: Operaciones con Polinomios                                                  
 *                                                                                        
 *  📄 DESCRIPCIÓN:                                                                       
 *  Este módulo implementa funciones para la manipulación y evaluación de polinomios.    
 *  Incluye operaciones como suma, resta, multiplicación, derivación y evaluación en      
 *  puntos específicos. Diseñado para aplicaciones matemáticas, educativas y científicas. 
 *                                                                                        
 *  🧑‍💻 AUTOR: [Tu Nombre o Equipo]                                                       
 *  🗓️  FECHA: [Fecha de creación]                                                        
 *                                                                                        
 ******************************************************************************************/
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

    // Prepare the request data
    const requestData = {
        operation: operation,
        poly1: poly1
    };

    if (poly2) {
        requestData.poly2 = poly2;
    }

    // Make the API call
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
            // Render the result using MathJax
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
            // Tell MathJax to render the new LaTeX
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

/******************************************************************************************
 *                                                                                        
 *  📦 MÓDULO: Operaciones con Vectores                                                   
 *                                                                                        
 *  📄 DESCRIPCIÓN:                                                                       
 *  Este módulo proporciona funciones para la manipulación y análisis de vectores.        
 *  Incluye operaciones como suma, resta, producto punto, producto cruzado, normalización,
 *  y cálculo de magnitudes. Ideal para álgebra lineal, gráficos computacionales y física.
 *                                                                                        
 *  🧑‍💻 AUTOR: [Tu Nombre o Equipo]                                                       
 *  🗓️  FECHA: [Fecha de creación]                                                        
 *                                                                                        
 ******************************************************************************************/
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

/******************************************************************************************
 *                                                                                        
 *  📦 MÓDULO: Graficar Funciones                                                         
 *                                                                                        
 *  📄 DESCRIPCIÓN:                                                                       
 *  Este módulo permite la representación gráfica de funciones matemáticas.              
 *  Soporta funciones lineales, cuadráticas, polinomiales, trigonométricas,              
 *  y más. Utiliza bibliotecas de renderizado para mostrar visualmente el comportamiento 
 *  de las funciones sobre un sistema de coordenadas. Ideal para entornos educativos,     
 *  científicos o de análisis de datos.                                                   
 *                                                                                        
 *  🧑‍💻 AUTOR: [Tu Nombre o Equipo]                                                       
 *  🗓️  FECHA: [Fecha de creación]                                                        
 *                                                                                        
 ******************************************************************************************/
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
     const x_min = data.x_min;
     const x_max = data.x_max;
     const points = 200;
     const step = (x_max - x_min) / points;
     
     // Generar los puntos x
     const xValues = [];
     for (let i = 0; i <= points; i++) {
         xValues.push(x_min + i * step);
     }
     
     // Evaluar la función
     const yValues = [];
     const expression = data.function.replace(/sin/g, 'Math.sin')
                                   .replace(/cos/g, 'Math.cos')
                                   .replace(/tan/g, 'Math.tan')
                                   .replace(/\^/g, '**')
                                   .replace(/pi/g, 'Math.PI')
                                   .replace(/exp/g, 'Math.exp')
                                   .replace(/sqrt/g, 'Math.sqrt')
                                   .replace(/abs/g, 'Math.abs')
                                   .replace(/log/g, 'Math.log');
     
     // Filtrar valores infinitos o NaN
     for (let x of xValues) {
         try {
             const result = eval(expression.replace(/x/g, x));
             if (isFinite(result)) {
                 yValues.push(result);
             } else {
                 yValues.push(null);
             }
         } catch (e) {
             yValues.push(null);
         }
     }
     
     // Configurar y mostrar el gráfico usando Chart.js
     const ctx = document.getElementById('chartCanvas').getContext('2d');
     
     // Destruir gráfico existente si hay uno
     if (currentChart) {
         currentChart.destroy();
     }
     
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
                 pointRadius: 0  // No mostrar puntos individuales para un renderizado más suave
             }]
         },
         options: {
             responsive: true,
             maintainAspectRatio: false,
             scales: {
                 x: {
                     title: {
                         display: true,
                         text: 'x'
                     }
                 },
                 y: {
                     title: {
                         display: true,
                         text: 'f(x)'
                     }
                 }
             },
             plugins: {
                 title: {
                     display: true,
                     text: `Gráfica de f(x) = ${data.function}`
                 }
             }
         }
     });
 }
 
 function render3DGraph(data) {
     const x_min = data.x_min;
     const x_max = data.x_max;
     const y_min = data.y_min;
     const y_max = data.y_max;
     const points = 50; // Menos puntos para mejor rendimiento en 3D
     
     // Generar puntos para la malla
     const xStep = (x_max - x_min) / points;
     const yStep = (y_max - y_min) / points;
     
     // Crear arrays para X, Y, Z
     let X = [];
     let Y = [];
     let Z = [];
     
     // Crear la malla
     for (let i = 0; i <= points; i++) {
         let xRow = [];
         let yRow = [];
         let zRow = [];
         let y = y_min + i * yStep;
         
         for (let j = 0; j <= points; j++) {
             let x = x_min + j * xStep;
             xRow.push(x);
             yRow.push(y);
             
             // Evaluar función en el punto (x,y)
             let expression = data.function
                 .replace(/sin/g, 'Math.sin')
                 .replace(/cos/g, 'Math.cos')
                 .replace(/tan/g, 'Math.tan')
                 .replace(/\^/g, '**')
                 .replace(/pi/g, 'Math.PI')
                 .replace(/exp/g, 'Math.exp')
                 .replace(/sqrt/g, 'Math.sqrt')
                 .replace(/abs/g, 'Math.abs')
                 .replace(/log/g, 'Math.log');
             
             try {
                 let z = eval(expression.replace(/x/g, x).replace(/y/g, y));
                 if (isFinite(z)) {
                     zRow.push(z);
                 } else {
                     zRow.push(null);
                 }
             } catch (e) {
                 zRow.push(null);
             }
         }
         
         X.push(xRow);
         Y.push(yRow);
         Z.push(zRow);
     }
     
     // Crear la gráfica 3D con Plotly
     const trace = {
         x: X,
         y: Y,
         z: Z,
         type: 'surface',
         colorscale: 'Viridis',
         contours: {
             z: {
                 show: true,
                 usecolormap: true,
                 highlightcolor: "#42f5ef"
             }
         }
     };
     
     const layout = {
         title: `Gráfica 3D de f(x,y) = ${data.function}`,
         autosize: true,
         margin: {
             l: 65,
             r: 50,
             b: 65,
             t: 90,
         },
         scene: {
             xaxis: { title: 'X' },
             yaxis: { title: 'Y' },
             zaxis: { title: 'f(x,y)' },
             aspectratio: { x: 1, y: 1, z: 0.7 }
         }
     };
     
     Plotly.newPlot('plotly-container', [trace], layout, {responsive: true});
 }
 
 // Manejar cambio entre 2D y 3D
 document.getElementById('graph-type').addEventListener('change', function() {
     const type = this.value;
     document.getElementById('graph-range-2d').classList.toggle('hidden', type !== '2d');
     document.getElementById('graph-range-3d').classList.toggle('hidden', type === '2d');
 });

/******************************************************************************************
 *                                                                                        
 *  📦 MÓDULO: Operaciones de Cálculo (Derivadas / Integrales)                            
 *                                                                                        
 *  📄 DESCRIPCIÓN:                                                                       
 *  Este módulo implementa funciones para el cálculo simbólico y numérico de derivadas   
 *  e integrales. Incluye reglas de derivación, integración definida e indefinida,       
 *  simplificación de expresiones y evaluación en puntos. Diseñado para aplicaciones      
 *  educativas, científicas y de análisis matemático avanzado.                            
 *                                                                                        
 *  🧑‍💻 AUTOR: [Tu Nombre o Equipo]                                                       
 *  🗓️  FECHA: [Fecha de creación]                                                        
 *                                                                                        
 ******************************************************************************************/
function showCalculusOptions(operation) {
    document.getElementById("limit-point-container").classList.add("hidden");
    document.getElementById("taylor-options-container").classList.add("hidden");
    
    if (operation === "limit") {
        document.getElementById("limit-point-container").classList.remove("hidden");
    } else if (operation === "taylor") {
        document.getElementById("taylor-options-container").classList.remove("hidden");
    }
}

// Función para enviar la operación al backend
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
    // Dentro de la función calculusOperation, en el then del fetch:
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

// Actualizar los event listeners para los botones
document.querySelectorAll('.operation-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const operation = this.getAttribute('onclick').match(/'([^']+)'/)[1];
        showCalculusOptions(operation);
    });
});

// Initialize with home section
showSection("home");

