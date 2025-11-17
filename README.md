# 🎮 Policías y Ladrón - Proyecto de Análisis de Algoritmos

**Proyecto Análisis de Algoritmos 2025-2**  
**Fecha de Entrega y Sustentación: Jueves 13 de Noviembre**

## Descripción General

Este proyecto implementa una versión automatizada del juego "Policías y Ladrón" en un tablero de ajedrez configurable (8×8 o 16×16). El objetivo es diseñar un programa inteligente que controle el movimiento de los policías y logre capturar al ladrón utilizando algoritmos de búsqueda (BFS), heurísticas y estrategias algorítmicas.

## Descripción del Juego

### Configuración del Tablero
- **Tablero**: Cuadrícula de 8×8 o 16×16 similar a ajedrez
- **Policías**: Se colocan en el borde inferior (fila N-1) en casillas blancas
- **Ladrón**: Se coloca en el borde superior (fila 0) en una casilla blanca
- **Posiciones**: Siempre aleatorias al iniciar

### Reglas de Movimiento
- **Policías**: Se mueven una casilla diagonal hacia adelante (r-1, c±1)
- **Ladrón**: Se mueve una casilla diagonal en cualquier dirección (r±1, c±1)
- **Turnos**: Alternan entre ladrón y policías

### Condiciones de Victoria
- **Policías ganan**: Si algún policía ocupa la misma casilla que el ladrón
- **Ladrón gana**: Si llega al borde inferior del tablero (fila N-1)
- **Policías ganan**: Si el ladrón no tiene movimientos válidos disponibles

## Características Implementadas

### Funcionalidades Principales
- ✅ Tablero configurable (8×8 o 16×16)
- ✅ Número configurable de policías (opciones predefinidas según tamaño)
- ✅ Número configurable de ladrones (opciones predefinidas según tamaño)
- ✅ Modo manual: El usuario controla al ladrón
- ✅ Modo aleatorio: El ladrón se mueve automáticamente
- ✅ Algoritmos de búsqueda BFS para caminos más cortos
- ✅ Heurísticas de evaluación y cercamiento
- ✅ Estrategia greedy para coordinación de policías
- ✅ Interfaz gráfica moderna y responsiva
- ✅ Bitácora de movimientos en tiempo real
- ✅ Modal de victoria con mensajes diferenciados
- ✅ Detección automática de bloqueo del ladrón

### Opciones de Configuración
- **Tamaño del Tablero**: 8×8 o 16×16
- **Número de Policías**: 
  - 8×8: 1, 2, 3, 4
  - 16×16: 2, 3, 4, 5, 6
- **Número de Ladrones**:
  - 8×8: 1, 2
  - 16×16: 1, 2, 3
- **Modo del Ladrón**: Manual o Aleatorio
- **Opciones Visuales**: Tamaño de casillas, esquema de colores, animaciones

## Tecnologías Utilizadas

- **TypeScript**: Tipado estático para mayor robustez
- **React**: Framework para la interfaz de usuario
- **Tailwind CSS**: Estilos modernos y responsivos
- **Vite**: Herramienta de construcción rápida

## Instalación

### Requisitos Previos
- Node.js (versión 18 o superior)
- npm o yarn

### Pasos de Instalación

1. **Instalar dependencias**:
```bash
npm install
```

2. **Ejecutar en modo desarrollo**:
```bash
npm run dev
```

3. **Abrir en el navegador**:
   - La aplicación se abrirá automáticamente en `http://localhost:5173`
   - Si no se abre automáticamente, navega manualmente a esa URL

4. **Construir para producción**:
```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`.

5. **Previsualizar versión de producción**:
```bash
npm run preview
```

## Uso de la Aplicación

### Configuración Inicial

Antes de iniciar el juego, puedes configurar:

1. **Tamaño del Tablero**: 
   - Selecciona entre 8×8 (por defecto) o 16×16
   - Las opciones se muestran en un menú desplegable

2. **Número de Policías**: 
   - **8×8**: Opciones disponibles: 1, 2, 3, 4
   - **16×16**: Opciones disponibles: 2, 3, 4, 5, 6
   - Selecciona de un menú desplegable (no puedes escribir valores arbitrarios)

3. **Número de Ladrones**:
   - **8×8**: Opciones disponibles: 1, 2
   - **16×16**: Opciones disponibles: 1, 2, 3
   - Selecciona de un menú desplegable

4. **Modo del Ladrón**: 
   - **Manual**: Tú controlas el ladrón haciendo clic
   - **Aleatorio**: El ladrón se mueve automáticamente

5. **Opciones Visuales**:
   - **Tamaño de Casillas**: Pequeño, Mediano, Grande
   - **Esquema de Colores**: Por Defecto, Oscuro, Colorido
   - **Mostrar Animaciones**: Activar/desactivar

### Cómo Jugar

#### Modo Manual

1. Haz clic en el botón **"Iniciar"** para comenzar el juego
2. Haz clic en el ladrón (🏃) para seleccionarlo
3. Las casillas verdes muestran los movimientos válidos disponibles
4. Haz clic en una casilla verde para mover al ladrón
5. Los policías se moverán automáticamente después de tu turno (velocidad estándar)
6. El juego continúa hasta que:
   - Un policía capture al ladrón → **Los policías ganan**
   - El ladrón llegue al borde inferior → **El ladrón gana**
   - El ladrón no tenga movimientos válidos → **Los policías ganan**

**Nota**: En modo manual, los policías se mueven automáticamente después de que muevas al ladrón. No necesitas presionar ningún botón adicional.

#### Modo Aleatorio

1. Selecciona **"Aleatorio"** en el modo del ladrón
2. Configura el tablero y número de piezas según prefieras
3. Haz clic en **"Iniciar"** para comenzar
4. El juego se ejecutará automáticamente con velocidad estándar (800ms entre turnos)
5. Observa cómo los policías usan algoritmos inteligentes (BFS y heurísticas) para capturar al ladrón
6. El juego se detendrá automáticamente cuando haya un ganador

### Controles del Juego

- **Iniciar**: Comienza el juego (solo visible cuando el juego no ha iniciado)
- **Reiniciar**: Comienza un nuevo juego con la configuración actual
- **Pausar**: Pausa el juego (útil en modo aleatorio para observar el estado)
- **Continuar**: Reanuda el juego pausado

### Bitácora de Movimientos

La columna derecha muestra un registro detallado de todos los movimientos:

- **Formato por Turno**: Cada turno muestra:
  - 👮 **Policías**: Lista de movimientos de policías
  - 🏃 **Ladrones**: Lista de movimientos de ladrones
- **Información mostrada**:
  - Número de turno
  - Pieza que se movió (Policía X o Ladrón X)
  - Coordenadas de destino (fila, columna)

## Algoritmos Implementados

### 1. BFS (Breadth-First Search)
**Ubicación**: `src/algorithms/bfs.ts`

- **Propósito**: Encontrar el camino más corto entre dos posiciones
- **Complejidad Temporal**: O(V + E) donde V = vértices (casillas) y E = aristas (movimientos)
- **Complejidad Espacial**: O(V) para la cola y conjunto de visitados
- **Uso**: Calcular distancias mínimas de policías al ladrón

### 2. Heurísticas de Evaluación
**Ubicación**: `src/algorithms/heuristics.ts`

- Distancia mínima de policías al ladrón: O(P)
- Distancia total de policías al ladrón: O(P)
- Distancia del ladrón al borde inferior: O(1)
- Movimientos de escape disponibles: O(1)
- Heurísticas combinadas para evaluación de posiciones

### 3. Estrategia de Policías
**Ubicación**: `src/algorithms/policeStrategy.ts`

- **Asignación Codiciosa (Greedy)**: O(P² × M)
- **Prioridad**: Captura inmediata > Acercamiento estratégico
- **Coordinación**: Todos los policías persiguen al ladrón más cercano

### 4. Estrategia del Ladrón
**Ubicación**: `src/algorithms/thiefStrategy.ts`

- **Modo Aleatorio**: O(1) - selección aleatoria de movimientos válidos
- **Modo Manual**: Controlado por el usuario

## Estructura del Proyecto

```
Proyecto-Analisis/
├── src/
│   ├── algorithms/          # Algoritmos de búsqueda y estrategias
│   │   ├── bfs.ts          # BFS para caminos más cortos
│   │   ├── heuristics.ts   # Funciones heurísticas
│   │   ├── policeStrategy.ts # Estrategia de policías
│   │   └── thiefStrategy.ts  # Estrategia del ladrón
│   ├── components/          # Componentes React
│   │   ├── Board.tsx       # Tablero de juego
│   │   ├── GameControls.tsx # Controles del juego
│   │   ├── MoveLog.tsx     # Bitácora de movimientos
│   │   └── VictoryModal.tsx # Modal de victoria
│   ├── game/               # Lógica del juego
│   │   └── GameEngine.ts   # Motor principal
│   ├── utils/              # Utilidades
│   │   └── boardUtils.ts   # Funciones auxiliares del tablero
│   ├── types.ts            # Definiciones de tipos
│   ├── App.tsx             # Componente principal
│   └── main.tsx           # Punto de entrada
├── package.json
├── tsconfig.json
└── README.md
```

## Análisis de Complejidad

### Complejidad Temporal por Turno
- **Inicialización**: O(P + T) donde P = policías, T = ladrones
- **Movimiento del Ladrón (Manual)**: O(1)
- **Movimiento del Ladrón (Aleatorio)**: O(M) donde M ≤ 4 movimientos válidos
- **Movimiento de Policías**: O(P² × M) donde:
  - P = número de policías
  - M = movimientos posibles por policía (máx. 2)

**Complejidad total por turno**: O(P²) en el peor caso

### Complejidad Espacial
- **Tablero**: O(N²) donde N = tamaño del tablero
- **BFS**: O(V) donde V = casillas alcanzables
- **Almacenamiento de movimientos**: O(T) donde T = número de turnos

**Complejidad espacial total**: O(N² + T)

### Rendimiento
- **Tablero 8×8**: < 10ms por turno
- **Tablero 16×16**: < 50ms por turno
- **Uso de memoria**: < 5MB incluso en tableros grandes

## Consejos para Jugar

1. **Empieza simple**: Prueba con 1 policía y 1 ladrón en tablero 8×8
2. **Observa la estrategia**: En modo aleatorio, observa cómo los policías coordinan sus movimientos
3. **Usa las casillas verdes**: En modo manual, las casillas verdes te muestran exactamente dónde puedes mover
4. **Revisa la bitácora**: La bitácora te ayuda a entender la secuencia de movimientos
5. **Experimenta**: Prueba diferentes configuraciones para ver cómo afectan el juego
