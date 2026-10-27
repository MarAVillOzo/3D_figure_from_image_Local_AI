# FLUID 3D Studio V3 — Instalador visible, local, para Windows

## Instrucción única

1. Extrae **todo** el ZIP en una carpeta local, por ejemplo `C:\FLUID3D\FLUID_3D_STUDIO_V3` (no dentro del ZIP).
2. Haz doble clic en `INSTALAR_Y_ABRIR.bat`. Se mostrará una ventana negra con cada fase y sus errores. No requiere escribir comandos ni permisos de administrador.
3. Si la instalación logra cargar el motor real, abre `http://127.0.0.1:8789/` en tu navegador (normalmente se abre automáticamente). Usa `Cargar tenis de referencia` y `Generar modelo con IA`.
4. Los resultados se guardan en `outputs\job_...\` y se descargan desde la interfaz en **GLB, STL y OBJ**.

**Necesita Internet solamente para la instalación inicial.** El programa funciona localmente una vez que están instalados Python, CUDA (vía PyTorch) y los pesos. El ZIP no lleva modelos de gigabytes. El instalador usa solo componentes conocidos de Node, uv, PyTorch, Tencent y Hugging Face.

## Tu computadora

El motor de la versión 3 es **Hunyuan3D-2mini (geometría FP16, sin generador de texturas)**, seleccionado para una RTX 3060 de 12 GB de VRAM y 16 GB de RAM. TRELLIS-image-large no se instala automáticamente: su versión oficial exige 16 GB de VRAM; la versión de NVIDIA optimizada para 12 GB requiere 32 GB RAM y WSL2, que aún no están disponibles en este equipo.

**Espacio libre antes de instalar:** 16 GB si faltan pesos; 7 GB si los pesos del modelo de forma ya están presentes. La descarga selectiva oficial contiene 3.82 GB del modelo de forma (con su decodificador incluido), además de dependencias de PyTorch. Puede requerir más espacio si Windows conserva cachés.

El programa intenta reutilizar tu Node.js, tu repositorio `C:\Users\DELL OPTIPLEX 7060\engines\Hunyuan3D-2` y los pesos ya descargados en esta versión. **No reutiliza ni borra automáticamente** la carpeta `.venv` de la versión 2, para no contaminar el nuevo entorno.

## Si aparece un error

- Deja la ventana abierta y copia el mensaje `ERROR: En ...`.
- El registro completo se guarda en `instalador\instalacion.log`. Puedes reenviarlo para corregir el fallo exacto.
- `DIAGNOSTICO.bat` comprueba GPU, Node y disco **sin instalar ni descargar nada**.
- `ABRIR_FLUID.bat` abre el estudio aunque la IA no esté instalada, para comprobar visor y exportación de prueba.
- Si la descarga se interrumpe, ejecuta el instalador nuevamente. Conserva los archivos existentes y reintenta los faltantes.

## Lo que está validado y lo que no

**Probado fuera de Windows y sin modelos:** integración del servidor local, exportación y reimportación de GLB/STL/OBJ, dimensión en mm y metros, rechazo de una IA no instalada, descarga HTTP y un adaptador de inferencia falso que hace pasar un modelo 3D por la cadena REAL de archivos.

**No verificado en este entorno:** ejecución de PowerShell en Windows 11, descarga real de 3.82 GB, instalación PyTorch CUDA en RTX 3060, carga de Hunyuan con pesos reales, inferencia real y pruebas con calzado físico. El instalador **no anunciará la IA como lista hasta que consiga cargar los pesos**; la calidad de una generación solo se comprueba después de utilizar la GPU real.

La exportación de un modelo no significa que pueda calzarse o imprimirse estructuralmente: el STL puede carecer de interior anatómico, tener paredes no estancas o fallar en resistencia. No se certifica para uso diario.

## Licencias

Software experimental creado sobre el motor de Tencent. La licencia del motor y de sus pesos se consulta en el repositorio oficial; no presupongas autorización comercial para vender tenis u ofrecer un servicio de generación sin verificar la licencia del modelo. El código de la interfaz FLUID incluido en este paquete es editable.
