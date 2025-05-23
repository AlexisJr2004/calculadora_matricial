// =============================================
// OPERACIONES CON POLINOMIOS
// =============================================

/**
 * Limpia un campo de polinomio
 */
function clearPolynomial(fieldId) {
    document.getElementById(fieldId).value = "";
    updatePolynomialPreview(fieldId);
}



/**
 * Realiza una operación con polinomios
 * {string} operation - Tipo de operación ('add', 'subtract', 'multiply', etc.)
 */
async function polynomialOperation(operation) {
    try {
        // Determinar qué polinomio usar para operaciones individuales
        let selectedPoly = document.querySelector('input[name="selectedPolynomial"]:checked').value;

        // Sanitizar entradas antes de enviar al backend
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

// SECCCIÓN DE LA CALCULADORA

let currentMathInput = "";
let cursorPosition = 0;

/**
 * Actualiza el indicador de polinomio seleccionado
 */
function updateSelectedPolyIndicator() {
    const selectedPoly = document.querySelector('input[name="selectedPolynomial"]:checked').value;
    const indicator = document.getElementById("current-target");

    if (selectedPoly === "1") {
        indicator.textContent = "Polinomio 1";
        indicator.className = "text-sm px-2 py-1 rounded bg-blue-100 text-blue-800";
    } else {
        indicator.textContent = "Polinomio 2";
        indicator.className = "text-sm px-2 py-1 rounded bg-green-100 text-green-800";
    }
}

// Escuchar cambios en la selección de polinomio
document.querySelectorAll('input[name="selectedPolynomial"]').forEach(radio => {
    radio.addEventListener('change', updateSelectedPolyIndicator);
});

// Inicializar el indicador
updateSelectedPolyIndicator();

/**
 * Inserta un símbolo matemático en el input
 */
function insertMathSymbol(symbol, backSteps = 0) {
    const input = document.getElementById("math-input");
    const start = input.selectionStart;
    const end = input.selectionEnd;
    let insertText = symbol;

    // Si es función tipo sqrt(), coloca el cursor dentro de los paréntesis
    if (symbol.endsWith('()')) {
        insertText = symbol.slice(0, -1) + ')';
    }

    // Inserta el texto en la posición actual del cursor
    input.value = input.value.slice(0, start) + insertText + input.value.slice(end);

    // Calcula la nueva posición del cursor
    let newPos = start + insertText.length;
    if (backSteps > 0) {
        newPos -= backSteps;
    }

    // Actualiza el cursor
    input.setSelectionRange(newPos, newPos);
    input.focus();

    updateMathPreview();
}

/**
 * Actualiza la vista previa matemática
 */
function updateMathPreview() {
    const input = document.getElementById("math-input");
    const preview = document.getElementById("math-preview");
    const currentMathInput = input.value;

    if (!currentMathInput) {
        preview.innerHTML = "Ingresa una expresión matemática";
        return;
    }

    // Reemplazos para visualización más bonita
    let displayText = currentMathInput
        .replace(/\*\*/g, '^')
        .replace(/sqrt/g, '\\sqrt')
        .replace(/exp/g, 'e^{')
        .replace(/pi/g, '\\pi');

    // Ajuste para cerrar llaves de exp si es necesario
    if (/e\^{[^}]*$/.test(displayText)) {
        displayText += '}';
    }

    // Mostrar en LaTeX
    preview.innerHTML = `$$${displayText}$$`;

    // Renderizar LaTeX con MathJax
    if (typeof MathJax !== 'undefined') {
        MathJax.typesetPromise([preview]);
    }
}

/**
 * Inserta la expresión actual en el polinomio seleccionado
 */
function insertIntoSelectedPoly() {
    const input = document.getElementById("math-input");
    const currentMathInput = input.value;
    if (!currentMathInput) return;

    const selectedPoly = document.querySelector('input[name="selectedPolynomial"]:checked').value;
    const polyInput = document.getElementById(selectedPoly === "1" ? "poly1" : "poly2");
    const pos = polyInput.selectionStart || polyInput.value.length;

    polyInput.value = polyInput.value.slice(0, pos) + currentMathInput + polyInput.value.slice(pos);
    polyInput.focus();

    // Disparar evento de cambio para posibles listeners
    polyInput.dispatchEvent(new Event('input'));
}

/**
 * Limpia el input matemático
 */
function clearMathInput() {
    const input = document.getElementById("math-input");
    if (input) input.value = "";
    currentMathInput = "";
    cursorPosition = 0;
    updateMathPreview();
}

// Función para convertir formato simple a LaTeX
function convertToLatex(polyStr) {
    if (!polyStr) return '';

    // Reemplazos para formato matemático
    return polyStr
        .replace(/\s+/g, ' ') // Elimina espacios múltiples
        .replace(/(\d+)x/g, '$1x') // Coeficientes antes de x
        .replace(/x(\d+)/g, 'x^{$1}') // Exponentes
        .replace(/\^/g, '^') // Exponentes
        .replace(/([+-])/g, ' $1 ') // Espacios alrededor de operadores
        .replace(/x/g, 'x') // Variables en cursiva
        .replace(/\*/g, ' \\cdot ') // Multiplicación como punto
        .replace(/sqrt/g, ' √ ') // Raiz
        .replace(/exp\(([^)]+)\)/g, 'e^{ $1 }');
}

// Actualiza la vista previa del polinomio
function updatePolynomialPreview(inputId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(`${inputId}-preview`);
    const rendered = document.getElementById(`${inputId}-rendered`);

    const rawText = input.value.trim();
    const latexStr = convertToLatex(rawText);

    // Vista previa simple
    preview.textContent = rawText ? '✓' : '';

    // Renderizado LaTeX
    if (rawText) {
        rendered.innerHTML = `\\[ ${latexStr} \\]`;
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([rendered]);
        }
    } else {
        rendered.innerHTML = '';
    }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    updatePolynomialPreview('poly1');
    updatePolynomialPreview('poly2');
});