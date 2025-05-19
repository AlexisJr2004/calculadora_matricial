// =============================================
// Modelos Matemáticos
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