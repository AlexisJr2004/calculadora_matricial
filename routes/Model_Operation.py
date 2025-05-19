from flask import Blueprint, request, jsonify
import numpy as np
from scipy.integrate import odeint

epidemic_bp = Blueprint('epidemic_bp', __name__)


# ******************************************************
# *     MODELO DE SIR - PROPAGACIÓN DE EPIDEMIAS       *
# ******************************************************
@epidemic_bp.route('/epidemic_model', methods=['POST'])
def epidemic_model():
    data = request.json
    
    try:
        # Parámetros del modelo
        N = float(data['population'])  # Población total
        I0 = float(data['initialInfected'])  # Infectados iniciales
        beta = float(data['beta'])  # Tasa de contacto efectivo
        gamma = float(data['gamma'])  # Tasa de recuperación
        days = int(data['days'])
        
        # Condiciones iniciales
        S0 = N - I0
        R0 = 0.0
        
        # Tiempo (en días)
        t = np.linspace(0, days, days)
        
        # Ecuaciones diferenciales del modelo SIR
        def deriv(y, t, N, beta, gamma):
            S, I, R = y
            dSdt = -beta * S * I / N
            dIdt = beta * S * I / N - gamma * I
            dRdt = gamma * I
            return dSdt, dIdt, dRdt
        
        # Vector de condiciones iniciales
        y0 = S0, I0, R0
        
        # Integrar las ecuaciones SIR en el tiempo
        ret = odeint(deriv, y0, t, args=(N, beta, gamma))
        S, I, R = ret.T
        
        # Encontrar el pico de la epidemia
        peak_day = np.argmax(I)
        peak_infected = I[peak_day]
        peak_rate = (beta * S[peak_day] / N - gamma)
        
        return jsonify({
            'success': True,
            'days': t.tolist(),
            'susceptible': S.tolist(),
            'infected': I.tolist(),
            'recovered': R.tolist(),
            'population': N,
            'peak': {
                'day': int(peak_day),
                'infected': float(peak_infected),
                'rate': float(peak_rate)
            },
            'final': {
                'susceptible': float(S[-1]),
                'infected': float(I[-1]),
                'recovered': float(R[-1])
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })