# FLUID 3D Studio V3 — Informe de pruebas (25/oct/2026)

**Pasaron sin GPU ni descargas:**

- `node --check server.js` y `node --check public/app.js` (sintaxis).
- `python -m compileall engine instalador tests` (código Python).
- `python tests/test_local.py`: servidor, recursos HTTP, preflight, exportación de GLB/STL/OBJ (cubo etiquetado NO IA), descarga desde localhost, rutas seguras, bloqueo de IA sin pesos.
- `python tests/test_v3.py`: integración REAL del worker y de los archivos producidos usando un pipeline Hunyuan **falso** como sustituto controlado; reimportación de GLB, STL, OBJ con trimesh, escala y malla cerrada del objeto de prueba.
- Simulación de Hugging Face sin red: selección exclusiva de safetensors y configs, sin ckpt y validación de longitudes.

**No pasaron / No se pudieron realizar:**

- El test visual `tests/test_browser.py` no pudo abrir localhost desde Chromium aquí: `net::ERR_BLOCKED_BY_ADMINISTRATOR`, aunque el mismo servidor sí respondió vía HTTP y superó las pruebas de los endpoints. Esto es un bloqueo del entorno de pruebas, **no una comprobación de funcionamiento en tu Windows**.
- No existe PowerShell ni GPU NVIDIA RTX 3060 en este contenedor. Por eso **no se probó la instalación en Windows, CUDA, ni la inferencia auténtica** con pesos.
- No se certifica la apariencia final del tenis ni aptitud física para impresión de TPU; la IA produce una malla aproximada de geometría.

El instalador se detiene ante fallos, no registra estado listo hasta que logra la carga de los pesos en la GPU, conserva la descarga y escribe `instalador/instalacion.log`. El entorno no contiene modelos reales descargados y el ZIP no lleva pesos.
