from flask import Blueprint, request, jsonify
import sympy as sp
import numpy as np

differential_bp = Blueprint('differential_bp', __name__)


# ********************************************
# *     ECUACIONES DIFERENCIALES             *
# ********************************************
@differential_bp.route('/differential_operation', methods=['POST'])
def differential_operation():
    data = request.get_json()
    
    # Validación básica de datos recibidos
    if not data:
        return jsonify({
            'success': False,
            'error': 'No se recibieron datos',
            'method': 'unknown',
            'show_graph': False,
            'graph_data': None
        }), 400

    try:
        # Obtener datos de la solicitud con valores por defecto
        method = data.get('method', 'analytical')
        equation_str = data.get('equation', '').strip()
        initial_x = float(data.get('initial_x', 0))
        initial_y = float(data.get('initial_y', 1))
        step_size = float(data.get('step_size', 0.1))
        num_points = int(data.get('num_points', 10))
        show_graph = bool(data.get('show_graph', True))
        
        # Validación de parámetros
        if not equation_str:
            raise ValueError("La ecuación no puede estar vacía")
        if num_points < 2 or num_points > 100:
            raise ValueError("El número de puntos debe estar entre 2 y 100")
        if step_size <= 0:
            raise ValueError("El paso (h) debe ser mayor que cero")

        # Preprocesamiento de la ecuación
        equation_str = equation_str.replace('^', '**').replace("'", "'")
        
        # Convertir derivadas a formato SymPy
        if "y''" in equation_str:
            equation_str = equation_str.replace("y''", "sp.Derivative(y, x, x)")
        elif "y'" in equation_str:
            equation_str = equation_str.replace("y'", "sp.Derivative(y, x)")
        elif "dy/dx" in equation_str:
            equation_str = equation_str.replace("dy/dx", "sp.Derivative(y, x)")
        elif "dydx" in equation_str:
            equation_str = equation_str.replace("dydx", "sp.Derivative(y, x)")
        
        # Verificar si contiene derivadas
        if "Derivative" not in equation_str:
            raise ValueError("La ecuación debe contener derivadas (use y', y'', dy/dx o Derivative(y, x))")

        # Preparar entorno seguro para eval
        x = sp.symbols('x')
        y = sp.Function('y')(x)
        safe_dict = {
            'sp': sp,
            'y': y,
            'x': x,
            'exp': sp.exp,
            'log': sp.log,
            'sin': sp.sin,
            'cos': sp.cos,
            'tan': sp.tan,
            'sqrt': sp.sqrt,
            '__builtins__': None
        }

        # Parsear la ecuación
        try:
            if '=' in equation_str:
                lhs, rhs = equation_str.split('=', 1)
                eq = sp.Eq(eval(lhs.strip(), safe_dict), eval(rhs.strip(), safe_dict))
            else:
                eq = sp.Eq(eval(equation_str, safe_dict), 0)
        except Exception as e:
            raise ValueError(f"Error al parsear la ecuación: {str(e)}")

        # Verificar que sea una ecuación diferencial
        derivatives = [arg for arg in eq.atoms(sp.Derivative)]
        if not derivatives:
            raise ValueError("No se detectaron derivadas en la ecuación")

        # RESOLVER LA ECUACIÓN
        if method == 'analytical':
            try:
                # Para ecuaciones de primer orden
                if any(d.derivative_count == 1 for d in derivatives):
                    sol = sp.dsolve(eq, y, ics={y.subs(x, initial_x): initial_y})
                # Para ecuaciones de segundo orden
                else:
                    ics = {
                        y.subs(x, initial_x): initial_y,
                        sp.Derivative(y, x).subs(x, initial_x): 0
                    }
                    sol = sp.dsolve(eq, y, ics=ics)
                
                return jsonify({
                    'success': True,
                    'solution': sp.latex(sol.rhs),
                    'equation_latex': sp.latex(eq),
                    'method': method,
                    'initial_x': initial_x,
                    'initial_y': initial_y,
                    'show_graph': False,
                    'graph_data': None
                })
                
            except Exception as e:
                raise ValueError(f"No se pudo resolver analíticamente: {str(e)}")
                
        else:  # MÉTODOS NUMÉRICOS
            # Resolver para y'
            solved = sp.solve(eq, sp.Derivative(y, x))
            if not solved:
                raise ValueError("No se puede resolver la ecuación para y'")
            
            f_sym = solved[0]
            f = sp.lambdify((x, y), f_sym, 'numpy')
            
            # Inicializar arrays
            x_vals = np.linspace(initial_x, initial_x + (num_points-1)*step_size, num_points)
            y_vals = np.zeros(num_points)
            y_vals[0] = initial_y
            
            # Preparar detalles del método
            method_details = []
            method_steps = []
            
            if method == 'euler':
                method_details.append("Fórmula de Euler:")
                method_details.append("yₙ₊₁ = yₙ + h·f(xₙ, yₙ)")
                
                for i in range(1, num_points):
                    f_val = f(x_vals[i-1], y_vals[i-1])
                    y_vals[i] = y_vals[i-1] + step_size * f_val
                    method_details.append(f"Paso {i}: y({x_vals[i]:.4f}) = {y_vals[i-1]:.6f} + {step_size:.6f}·{f_val:.6f} = {y_vals[i]:.6f}")
                    method_steps.append({'f': float(f_val)})
                    
            elif method == 'improved_euler':
                method_details.append("Fórmula de Euler Mejorado (Heun):")
                method_details.append("yₙ₊₁ = yₙ + (h/2)·[f(xₙ, yₙ) + f(xₙ₊₁, yₙ + h·f(xₙ, yₙ))]")
                
                for i in range(1, num_points):
                    k1 = f(x_vals[i-1], y_vals[i-1])
                    y_pred = y_vals[i-1] + step_size * k1
                    k2 = f(x_vals[i], y_pred)
                    y_vals[i] = y_vals[i-1] + (step_size/2) * (k1 + k2)
                    method_details.append(f"Paso {i}:")
                    method_details.append(f"  k1 = f({x_vals[i-1]:.4f}, {y_vals[i-1]:.6f}) = {k1:.6f}")
                    method_details.append(f"  y* = {y_vals[i-1]:.6f} + {step_size:.6f}·{k1:.6f} = {y_pred:.6f}")
                    method_details.append(f"  k2 = f({x_vals[i]:.4f}, {y_pred:.6f}) = {k2:.6f}")
                    method_details.append(f"  y({x_vals[i]:.4f}) = {y_vals[i-1]:.6f} + {step_size/2:.6f}·({k1:.6f} + {k2:.6f}) = {y_vals[i]:.6f}")
                    method_steps.append({'k1': float(k1), 'k2': float(k2)})
                    
            elif method == 'runge_kutta':
                method_details.append("Fórmula de Runge-Kutta (4to orden):")
                method_details.append("k1 = f(xₙ, yₙ)")
                method_details.append("k2 = f(xₙ + h/2, yₙ + (h/2)·k1)")
                method_details.append("k3 = f(xₙ + h/2, yₙ + (h/2)·k2)")
                method_details.append("k4 = f(xₙ + h, yₙ + h·k3)")
                method_details.append("yₙ₊₁ = yₙ + (h/6)·(k1 + 2k2 + 2k3 + k4)")
                
                for i in range(1, num_points):
                    h = step_size
                    k1 = f(x_vals[i-1], y_vals[i-1])
                    k2 = f(x_vals[i-1] + h/2, y_vals[i-1] + (h/2)*k1)
                    k3 = f(x_vals[i-1] + h/2, y_vals[i-1] + (h/2)*k2)
                    k4 = f(x_vals[i-1] + h, y_vals[i-1] + h*k3)
                    y_vals[i] = y_vals[i-1] + (h/6)*(k1 + 2*k2 + 2*k3 + k4)
                    method_details.append(f"Paso {i}:")
                    method_details.append(f"  k1 = f({x_vals[i-1]:.4f}, {y_vals[i-1]:.6f}) = {k1:.6f}")
                    method_details.append(f"  k2 = f({x_vals[i-1]+h/2:.4f}, {y_vals[i-1] + (h/2)*k1:.6f}) = {k2:.6f}")
                    method_details.append(f"  k3 = f({x_vals[i-1]+h/2:.4f}, {y_vals[i-1] + (h/2)*k2:.6f}) = {k3:.6f}")
                    method_details.append(f"  k4 = f({x_vals[i-1]+h:.4f}, {y_vals[i-1] + h*k3:.6f}) = {k4:.6f}")
                    method_details.append(f"  y({x_vals[i]:.4f}) = {y_vals[i-1]:.6f} + {h/6:.6f}·({k1:.6f} + 2·{k2:.6f} + 2·{k3:.6f} + {k4:.6f}) = {y_vals[i]:.6f}")
                    method_steps.append({'k1': float(k1), 'k2': float(k2), 'k3': float(k3), 'k4': float(k4)})
            
            elif method == 'taylor':
                # Configuración inicial
                sp.init_printing(strict=False)
                method_details.append("Método de Taylor (2do orden):")
                method_details.append("yₙ₊₁ = yₙ + h·f(xₙ, yₙ) + (h²/2)·f'(xₙ, yₙ)")
                method_details.append("Donde f' = ∂f/∂x + ∂f/∂y·f(x,y)")
                
                try:
                    # 1. Intentar cálculo simbólico exacto de las derivadas
                    try:
                        df_dx = sp.diff(f_sym, x)
                        df_dy = sp.diff(f_sym, y)
                        
                        # Verificar si hay derivadas de orden superior
                        if df_dx.has(sp.Derivative) or df_dy.has(sp.Derivative):
                            method_details.append("Advertencia: La ecuación contiene derivadas de orden superior")
                            method_details.append("Usando aproximación numérica para las derivadas")
                            raise ValueError("Derivadas de orden superior detectadas")
                            
                        df_total = df_dx + df_dy * f_sym
                        f_prime = sp.lambdify((x, y), df_total, 'numpy')
                        
                    except:
                        # 2. Si falla el método simbólico, usar aproximación numérica
                        method_details.append("Usando aproximación numérica para f'")
                        h_small = 1e-5  # Pequeño paso para derivadas numéricas
                        
                        def f_prime(x_val, y_val):
                            # ∂f/∂x ≈ [f(x+h,y) - f(x-h,y)] / 2h
                            df_dx = (f(x_val + h_small, y_val) - f(x_val - h_small, y_val)) / (2 * h_small)
                            
                            # ∂f/∂y ≈ [f(x,y+h) - f(x,y-h)] / 2h
                            df_dy = (f(x_val, y_val + h_small) - f(x_val, y_val - h_small)) / (2 * h_small)
                            
                            # f' = ∂f/∂x + ∂f/∂y * f(x,y)
                            return df_dx + df_dy * f(x_val, y_val)
                    
                    # Aplicar el método
                    for i in range(1, num_points):
                        h = step_size
                        x_prev = x_vals[i-1]
                        y_prev = y_vals[i-1]
                        
                        try:
                            f_val = f(x_prev, y_prev)
                            f_prime_val = f_prime(x_prev, y_prev)
                            
                            if not np.isfinite(f_val) or not np.isfinite(f_prime_val):
                                raise ValueError("Valores no finitos en el cálculo")
                            
                            y_vals[i] = y_prev + h * f_val + (h**2)/2 * f_prime_val
                            
                            method_details.append(f"Paso {i}:")
                            method_details.append(f"  f({x_prev:.4f}, {y_prev:.6f}) = {f_val:.6f}")
                            method_details.append(f"  f'({x_prev:.4f}, {y_prev:.6f}) = {f_prime_val:.6f}")
                            method_details.append(f"  y({x_vals[i]:.4f}) = {y_prev:.6f} + {h:.6f}·{f_val:.6f} + {h**2/2:.6f}·{f_prime_val:.6f} = {y_vals[i]:.6f}")
                            
                            method_steps.append({
                                'f': float(f_val),
                                'f_prime': float(f_prime_val)
                            })
                            
                        except Exception as e:
                            raise ValueError(f"Error en paso {i}: {str(e)}")
                            
                except Exception as e:
                    # Si todo falla, sugerir otro método
                    raise ValueError(f"""
                        El método Taylor no pudo procesar esta ecuación: {str(e)}
                        Sugerencia: Prueba con Runge-Kutta 4to orden que es más robusto
                        para ecuaciones complejas o con derivadas de orden superior.
                    """)
            
            else:
                raise ValueError(f"Método desconocido: {method}")

            # Preparar datos de respuesta
            response_data = {
                'success': True,
                'solution': [{'x': float(x), 'y': float(y)} for x, y in zip(x_vals, y_vals)],
                'equation_latex': sp.latex(eq),
                'method': method,
                'method_details': method_details,
                'method_steps': method_steps,
                'initial_x': initial_x,
                'initial_y': initial_y,
                'step_size': step_size,
                'num_points': num_points,
                'show_graph': show_graph
            }

            if show_graph:
                response_data['graph_data'] = {
                    'x_values': [float(x) for x in x_vals],
                    'y_values': [float(y) for y in y_vals]
                }

            return jsonify(response_data)
            
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'method': data.get('method', 'unknown'),
            'show_graph': data.get('show_graph', False),
            'graph_data': None
        }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"Error inesperado: {str(e)}",
            'method': data.get('method', 'unknown'),
            'show_graph': data.get('show_graph', False),
            'graph_data': None
        }), 500