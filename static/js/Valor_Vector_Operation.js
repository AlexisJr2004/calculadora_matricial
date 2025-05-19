// =============================================
// VALORES Y VECTORES PROPIOS
// =============================================

let eqCount = 2; // Número de ecuaciones en el sistema

/**
 * Actualiza los inputs para las ecuaciones diferenciales
 */
function updateDiffEqInputs() {
  eqCount = parseInt(document.getElementById("eq-count").value);
  const inputsContainer = document.getElementById("diffeq-inputs");
  const conditionsContainer = document.getElementById("initial-conditions");
  
  inputsContainer.innerHTML = '';
  conditionsContainer.innerHTML = '';
  
  // Crear inputs para cada ecuación
  for (let i = 0; i < eqCount; i++) {
    const eqDiv = document.createElement("div");
    eqDiv.className = "bg-gray-50 p-3 rounded-md border border-gray-200";
    
    const label = document.createElement("label");
    label.className = "block text-sm font-medium text-gray-700 mb-1";
    label.textContent = `Ecuación ${i+1}: dX${i+1}/dt =`;
    
    const input = document.createElement("input");
    input.type = "text";
    input.className = "w-full input-field";
    input.placeholder = "Ej: 0.3*X1 + 0.1*X2";
    input.id = `eq${i}`;
    
    // Set default values for first two equations
    if (i === 0 && eqCount >= 2) input.value = "0.3*X1 + 0.1*X2";
    if (i === 1 && eqCount >= 2) input.value = "0.02*X1 - 0.05*X2";
    
    eqDiv.appendChild(label);
    eqDiv.appendChild(input);
    inputsContainer.appendChild(eqDiv);
    
    // Crear inputs para condiciones iniciales
    const condDiv = document.createElement("div");
    condDiv.className = "bg-gray-50 p-3 rounded-md border border-gray-200";
    
    const condLabel = document.createElement("label");
    condLabel.className = "block text-sm font-medium text-gray-700 mb-1";
    condLabel.textContent = `Condición inicial X${i+1}(0) =`;
    
    const condInput = document.createElement("input");
    condInput.type = "number";
    condInput.className = "w-full input-field";
    condInput.placeholder = "0";
    condInput.id = `ic${i}`;
    
    // Set default initial conditions
    if (i === 0) condInput.value = "50000";
    if (i === 1) condInput.value = "10";
    
    condDiv.appendChild(condLabel);
    condDiv.appendChild(condInput);
    conditionsContainer.appendChild(condDiv);
  }
}

/**
 * Resuelve el sistema de ecuaciones diferenciales
 */
// =============================================
// VALORES Y VECTORES PROPIOS - FUNCIONES MEJORADAS
// =============================================

/**
 * Resuelve el sistema de ecuaciones diferenciales con análisis de valores propios
 */
async function solveDiffEqSystem() {
  try {
    // Obtener parámetros
    const method = document.getElementById("method").value || "euler";
    const h = parseFloat(document.getElementById("step-size").value) || 1;
    const tStart = parseFloat(document.getElementById("t-start").value) || 0;
    const tEnd = parseFloat(document.getElementById("t-end").value) || 5;
    
    // Validar rango de tiempo
    if (tEnd <= tStart) {
      throw new Error("El tiempo final debe ser mayor que el inicial");
    }
    
    // Recolectar ecuaciones y extraer matriz A
    const equations = [];
    const matrixA = [];
    for (let i = 0; i < eqCount; i++) {
      const eq = document.getElementById(`eq${i}`).value;
      if (!eq) throw new Error(`La ecuación ${i+1} está vacía`);
      equations.push(eq);

      // Extraer coeficientes para la matriz A (robusto: soporta signos, sin *, coef. negativos, etc)
      const row = [];
      for (let j = 0; j < eqCount; j++) {
        const regex = new RegExp(`([+-]?\\s*\\d*\\.?\\d*)\\s*\\*?\\s*X${j+1}\\b`, 'g');
        let coeff = 0;
        let match;
        while ((match = regex.exec(eq)) !== null) {
          let c = match[1].replace(/\s+/g, '');
          if (c === '' || c === '+') c = 1;
          else if (c === '-') c = -1;
          else c = parseFloat(c);
          coeff += c;
        }
        row.push(coeff);
      }
      matrixA.push(row);
    }
    
    // Recolectar condiciones iniciales
    const initialConditions = [];
    for (let i = 0; i < eqCount; i++) {
      const ic = parseFloat(document.getElementById(`ic${i}`).value) || 0;
      initialConditions.push(ic);
    }
    
    // Mostrar estado de carga
    displayDiffEqResult("Resolviendo sistema...", "loading");
    document.getElementById("diffeq-steps").innerHTML = "";

    // Enviar al backend
    const response = await fetch('/solve_diffeq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method,
        equations,
        initialConditions,
        h,
        tStart,
        tEnd,
        matrixA  // Enviamos la matriz A al backend
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      displayDiffEqResult(data.solution, "table");
      window.diffEqData = data.solution;
      
      // Mostrar análisis de valores/vectores propios y pasos detallados
      displayEigenAnalysis(data.eigenAnalysis);
      displaySolutionSteps(data.solution, data.steps, method, matrixA, initialConditions);
      
    } else {
      displayDiffEqResult(`Error: ${data.error}`, "error");
      document.getElementById("diffeq-steps").innerHTML = "";
    }
    
  } catch (error) {
    displayDiffEqResult(`Error: ${error.message}`, "error");
    document.getElementById("diffeq-steps").innerHTML = "";
    console.error("Error en solveDiffEqSystem:", error);
  }
}

/**
 * Muestra el análisis de valores y vectores propios
 */
function displayEigenAnalysis(eigenData) {
  const stepsDiv = document.getElementById("diffeq-steps");
  // Asume matriz 2x2
  const A = eigenData.matrix;
  const a = A[0][0], b = A[0][1], c = A[1][0], d = A[1][1];

  let html = `
    <div class="bg-white p-4 rounded-lg shadow-md border border-purple-200 mb-6">
      <h3 class="font-bold text-lg text-purple-800 mb-3">
        <i class="fas fa-calculator text-purple-500 mr-2"></i> Análisis de Valores y Vectores Propios (Paso a Paso)
      </h3>
      <div class="mb-4">
        <h4 class="font-semibold text-purple-700 mb-2">1. Matriz del Sistema (A)</h4>
        <div class="bg-gray-50 p-3 rounded overflow-x-auto">
          <p class="math-result">$$ A = ${formatMatrix(A)} $$</p>
        </div>
      </div>
      <div class="mb-4">
        <h4 class="font-semibold text-purple-700 mb-2">2. Ecuación Característica</h4>
        <div class="bg-gray-50 p-3 rounded">
          <p class="mb-2">Se calcula la ecuación característica:</p>
          <p class="math-result">$$ \\det(A - \\lambda I) = 0 $$</p>
          <p class="mb-2">Para una matriz 2x2:</p>
          <p class="math-result">$$
            \\det\\left(
              \\begin{bmatrix}
                a & b \\\\
                c & d
              \\end{bmatrix}
              - \\lambda
              \\begin{bmatrix}
                1 & 0 \\\\
                0 & 1
              \\end{bmatrix}
            \\right)
            = (a-\\lambda)(d-\\lambda) - bc = 0
          $$</p>
          <p class="mb-2">Sustituyendo valores:</p>
          <p class="math-result">$$
            ( ${a.toFixed(4)} - \\lambda ) ( ${d.toFixed(4)} - \\lambda ) - ( ${b.toFixed(4)} ) ( ${c.toFixed(4)} ) = 0
          $$</p>
          <p class="math-result">$$
            ${eigenData.characteristicEquation}
          $$</p>
        </div>
      </div>
      <div class="mb-4">
        <h4 class="font-semibold text-purple-700 mb-2">3. Resolución de la cuadrática</h4>
        <div class="bg-gray-50 p-3 rounded">
          <p class="mb-2">La ecuación cuadrática es:</p>
          <p class="math-result">$$
            a_2 \\lambda^2 + a_1 \\lambda + a_0 = 0
          $$</p>
          <p class="mb-2">Se resuelve con la fórmula general:</p>
          <p class="math-result">$$
            \\lambda = \\frac{ -a_1 \\pm \\sqrt{ a_1^2 - 4 a_2 a_0 } }{ 2 a_2 }
          $$</p>
          <p class="mb-2">Sustituyendo los coeficientes:</p>
          <p class="math-result">$$
            \\lambda = \\frac{ -(${-(a+d).toFixed(4)}) \\pm \\sqrt{ (${(a+d).toFixed(4)})^2 - 4 \\cdot 1 \\cdot (${(a*d-b*c).toFixed(4)}) } }{ 2 }
          $$</p>
          <p class="mb-2">Valores propios:</p>
          <p class="math-result">$$
            \\lambda_1 = ${eigenData.eigenvalues[0].toFixed(4)}, \\quad
            \\lambda_2 = ${eigenData.eigenvalues[1].toFixed(4)}
          $$</p>
        </div>
      </div>
      <div class="mb-4">
        <h4 class="font-semibold text-purple-700 mb-2">4. Cálculo de Vectores Propios</h4>
        <div class="bg-gray-50 p-3 rounded">
          <p class="mb-2">Para cada valor propio, resuelve:</p>
          <p class="math-result">$$ (A - \\lambda I) \\vec{v} = 0 $$</p>
          <p class="mb-2">Por ejemplo, para \\( \\lambda_1 \\):</p>
          <p class="math-result">$$
            \\begin{bmatrix}
              ${a.toFixed(4)} - ${eigenData.eigenvalues[0].toFixed(4)} & ${b.toFixed(4)} \\\\
              ${c.toFixed(4)} & ${d.toFixed(4)} - ${eigenData.eigenvalues[0].toFixed(4)}
            \\end{bmatrix}
            \\begin{bmatrix}
              v_1 \\\\ v_2
            \\end{bmatrix}
            = 0
          $$</p>
          <p class="mb-2">Solución (proporcional):</p>
          <p class="math-result">$$ v_1 = ${eigenData.eigenvectors[0][0].toFixed(4)} \\cdot v_2 $$</p>
          <p class="math-result">$$ v_1 = ${formatVector(eigenData.eigenvectors[0])} $$</p>
          <p class="mb-2">Para \\( \\lambda_2 \\):</p>
          <p class="math-result">$$ v_2 = ${formatVector(eigenData.eigenvectors[1])} $$</p>
        </div>
      </div>
      <div class="mb-4">
        <h4 class="font-semibold text-purple-700 mb-2">5. Solución General</h4>
        <div class="bg-gray-50 p-3 rounded">
          <p class="math-result">$$
            \\mathbf{X}(t) = C_1 ${formatVector(eigenData.eigenvectors[0])} e^{${eigenData.eigenvalues[0].toFixed(4)} t}
            + C_2 ${formatVector(eigenData.eigenvectors[1])} e^{${eigenData.eigenvalues[1].toFixed(4)} t}
          $$</p>
        </div>
      </div>
    </div>
  `;

  stepsDiv.innerHTML = html;

  // Renderizar LaTeX
  if (typeof MathJax !== "undefined") {
    MathJax.typeset();
  }
}

/**
 * Muestra los pasos detallados de la solución numérica
 */
function displaySolutionSteps(solution, steps, method, matrixA, initialConditions) {
  const stepsDiv = document.getElementById("diffeq-steps");
  let html = stepsDiv.innerHTML; // Mantener el análisis previo
  
  // Mostrar configuración inicial
  html += `
    <div class="bg-white p-4 rounded-lg shadow-md border border-purple-200 mb-6">
      <h3 class="font-bold text-lg text-purple-800 mb-3">
        <i class="fas fa-list-ol text-purple-500 mr-2"></i> Solución Numérica (${method.toUpperCase()})
      </h3>
      
      <div class="mb-4">
        <h4 class="font-semibold text-purple-700 mb-2">Configuración Inicial</h4>
        <div class="bg-gray-50 p-3 rounded">
          <p class="math-result">$$ \\mathbf{X}_0 = ${formatVector(initialConditions)} $$</p>
          <p class="math-result">$$ A = ${formatMatrix(matrixA)} $$</p>
        </div>
      </div>
  `;
  
  // Mostrar fórmula del método
  if (method === 'euler') {
    html += `
      <div class="mb-4">
        <h4 class="font-semibold text-purple-700 mb-2">Fórmula de Euler</h4>
        <div class="bg-gray-50 p-3 rounded">
          <p class="math-result">$$ \\mathbf{X}_{n+1} = \\mathbf{X}_n + h \\cdot A \\mathbf{X}_n $$</p>
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="mb-4">
        <h4 class="font-semibold text-purple-700 mb-2">Fórmula de Runge-Kutta 4</h4>
        <div class="bg-gray-50 p-3 rounded">
          <p class="math-result">
            $$\\begin{aligned}
            &k_1 = A \\mathbf{X}_n \\\\
            &k_2 = A (\\mathbf{X}_n + \\frac{h}{2}k_1) \\\\
            &k_3 = A (\\mathbf{X}_n + \\frac{h}{2}k_2) \\\\
            &k_4 = A (\\mathbf{X}_n + h k_3) \\\\
            &\\mathbf{X}_{n+1} = \\mathbf{X}_n + \\frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)
            \\end{aligned}$$
          </p>
        </div>
      </div>
    `;
  }
  
  // Mostrar primeros pasos detallados
  if (steps && steps.length > 0) {
    html += `
      <div class="mb-4">
        <h4 class="font-semibold text-purple-700 mb-2">Pasos Detallados</h4>
    `;
    
    // Limitar a los primeros 3 pasos para no saturar
    const stepsToShow = steps.slice(0, 3);
    
    stepsToShow.forEach((step, idx) => {
      html += `
        <div class="bg-purple-50 p-3 rounded-md mb-3">
          <h5 class="font-bold text-purple-600 mb-2">Paso ${idx + 1} (t = ${step.t.toFixed(2)})</h5>
      `;
      
      if (method === 'euler') {
        html += `
          <p class="math-result text-sm">$$ \\mathbf{X}_{${idx}} = ${formatVector(step.y_anterior)} $$</p>
          <p class="math-result text-sm">$$ A \\mathbf{X}_{${idx}} = ${formatVector(step.f)} $$</p>
          <p class="math-result text-sm">$$ \\mathbf{X}_{${idx+1}} = ${formatVector(step.y_anterior)} + ${step.t.toFixed(2)} \\cdot ${formatVector(step.f)} = ${formatVector(step.y_nuevo)} $$</p>
        `;
      } else {
        html += `
          <p class="math-result text-sm">$$ k_1 = A \\mathbf{X}_{${idx}} = ${formatVector(step.k1)} $$</p>
          <p class="math-result text-sm">$$ k_2 = A (\\mathbf{X}_{${idx}} + \\frac{h}{2}k_1) = ${formatVector(step.k2)} $$</p>
          <p class="math-result text-sm">$$ k_3 = A (\\mathbf{X}_{${idx}} + \\frac{h}{2}k_2) = ${formatVector(step.k3)} $$</p>
          <p class="math-result text-sm">$$ k_4 = A (\\mathbf{X}_{${idx}} + h k_3) = ${formatVector(step.k4)} $$</p>
          <p class="math-result text-sm">$$ \\mathbf{X}_{${idx+1}} = ${formatVector(step.y_anterior)} + \\frac{${step.t.toFixed(2)}}{6}(${formatVector(step.k1)} + 2 \\cdot ${formatVector(step.k2)} + 2 \\cdot ${formatVector(step.k3)} + ${formatVector(step.k4)}) = ${formatVector(step.y_nuevo)} $$</p>
        `;
      }
      
      html += `</div>`;
    });
    
    html += `</div>`; // Cierre de pasos detallados
  }
  
  // Mostrar resumen de resultados
  html += `
    <div class="mb-4">
      <h4 class="font-semibold text-purple-700 mb-2">Resumen de Resultados</h4>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-purple-700 uppercase">t</th>
  `;
  
  // Encabezados para cada variable
  for (let i = 0; i < eqCount; i++) {
    html += `<th class="px-4 py-2 text-left text-xs font-medium text-purple-700 uppercase">X${i+1}</th>`;
  }
  
  html += `</tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
  
  // Filas de datos (mostrar solo algunos puntos clave)
  const step = Math.max(1, Math.floor(solution.length / 5));
  for (let i = 0; i < solution.length; i += step) {
    if (i >= solution.length - 1) i = solution.length - 1; // Asegurar el último punto
    
    html += `<tr class="${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">`;
    html += `<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${solution[i].t.toFixed(2)}</td>`;
    
    for (let j = 0; j < eqCount; j++) {
      html += `<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${solution[i][`x${j}`].toFixed(4)}</td>`;
    }
    
    html += `</tr>`;
    
    if (i >= solution.length - 1) break;
  }
  
  html += `</tbody></table></div></div></div>`;
  
  stepsDiv.innerHTML = html;
  
  // Renderizar LaTeX
  if (typeof MathJax !== "undefined") {
    MathJax.typeset();
  }
}

// Funciones auxiliares para formatear matrices y vectores
function formatMatrix(matrix) {
  return `\\begin{bmatrix} ${matrix.map(row => row.join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;
}

function formatVector(vector) {
  return `\\begin{bmatrix} ${vector.join(' \\\\ ')} \\end{bmatrix}`;
}

/**
 * Muestra los resultados de la solución
 */
function displayDiffEqResult(result, type) {
  const resultDiv = document.getElementById("diffeq-result");
  
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

  if (type === "table") {
    let html = `
      <div class="overflow-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">t</th>
    `;
    
    // Encabezados para cada variable
    for (let i = 0; i < eqCount; i++) {
      html += `<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">X${i+1}</th>`;
    }
    html += `</tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
    
    // Filas de datos
    result.forEach((row, idx) => {
      if (idx % Math.ceil(result.length / 20) === 0 || idx === result.length - 1) {
        html += `<tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">`;
        html += `<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">${row.t.toFixed(2)}</td>`;
        
        for (let i = 0; i < eqCount; i++) {
          html += `<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">${row[`x${i}`].toFixed(3)}</td>`;
        }
        
        html += `</tr>`;
      }
    });
    
    html += `</tbody></table></div>`;
    resultDiv.innerHTML = html;
  }
}

/**
 * Grafica los resultados
 */
function plotDiffEqResults() {
  if (!window.diffEqData || window.diffEqData.length === 0) {
    alert("No hay datos para graficar. Resuelve el sistema primero.");
    return;
  }

  const ctx = document.getElementById("diffeq-chart").getContext("2d");
  if (window.diffeqChart) {
    window.diffeqChart.destroy();
  }

  const labels = window.diffEqData.map(row => row.t.toFixed(2));
  const datasets = [];
  for (let i = 0; i < eqCount; i++) {
    datasets.push({
      label: `X${i+1}(t)`,
      data: window.diffEqData.map(row => row[`x${i}`]),
      borderColor: [
        "#7c3aed", "#06b6d4", "#f59e42"
      ][i % 3],
      backgroundColor: "rgba(124,58,237,0.08)",
      borderWidth: 2,
      pointRadius: 2,
      tension: 0.25,
      fill: false,
    });
  }

  window.diffeqChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          labels: { color: "#6b21a8", font: { weight: "bold" } }
        },
        title: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Tiempo (t)', color: "#7c3aed" },
          grid: { color: "#ede9fe" },
          ticks: { color: "#7c3aed" }
        },
        y: {
          title: { display: true, text: 'Valor', color: "#7c3aed" },
          grid: { color: "#ede9fe" },
          ticks: { color: "#7c3aed" }
        }
      }
    }
  });
}

// Inicializar inputs al cargar
document.addEventListener('DOMContentLoaded', updateDiffEqInputs);a