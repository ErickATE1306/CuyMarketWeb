# 🚀 Guía de Despliegue - CuyMarket

Esta guía te ayudará a desplegar tu aplicación completa (Backend Spring Boot + Frontend Angular + Base de Datos MySQL) usando **Railway + Render** de forma **GRATUITA**.

---

## 📋 Requisitos Previos

1. Cuenta en [Railway](https://railway.app) (gratuita - $5 de crédito inicial)
2. Cuenta en [Render](https://render.com) (gratuita)
3. Cuenta en [GitHub](https://github.com) 
4. Tu proyecto subido a un repositorio de GitHub

---

## 🗄️ PASO 1: Crear Base de Datos MySQL en Railway

Railway ofrece MySQL gratuito con $5 de crédito inicial y 500 horas/mes.

### 1.1 Registrarse en Railway

1. Abre tu navegador y ve a [https://railway.app](https://railway.app)
2. Haz clic en el botón **"Login"** (arriba a la derecha)
3. Selecciona **"Login with GitHub"** (es la forma más rápida)
4. Autoriza Railway para acceder a tu cuenta de GitHub
5. Te redirigirá al dashboard de Railway

### 1.2 Crear un Nuevo Proyecto

1. En el dashboard de Railway, busca el botón morado que dice **"New Project"**
2. Haz clic en **"New Project"**
3. Se abrirá un menú con varias opciones

### 1.3 Crear la Base de Datos MySQL

1. En el menú que se abrió, busca y haz clic en **"Provision MySQL"**
2. Verás un círculo morado con el logo de MySQL que aparece
3. Espera 1-2 minutos mientras Railway crea tu base de datos
4. Cuando termine, verás un cuadro con el logo de MySQL

### 1.4 Habilitar Acceso Público a la Base de Datos

🔴 **IMPORTANTE**: Por defecto, Railway crea bases de datos privadas. Necesitas habilitar el acceso público.

1. En tu base de datos MySQL, busca la pestaña **"Settings"**
2. Haz scroll hacia abajo hasta encontrar **"Networking"** o **"Public Networking"**
3. Haz clic en el botón para **"Enable Public Networking"** o **"Generate Domain"**
4. Espera 30 segundos a que se active

### 1.5 Obtener las Credenciales de Conexión Públicas

1. Ahora ve a la pestaña **"Connect"** (o "Variables")
2. Busca y copia estos valores **PÚBLICOS**:

   ```
   MYSQLHOST = [Busca "Public URL" o un dominio como: roundhouse.proxy.rlwycdn.com]
   MYSQLPORT = [Puede ser 3306 o un puerto como 6543]
   MYSQLDATABASE = railway
   MYSQLUSER = root
   MYSQLPASSWORD = [tu contraseña generada]
   ```

3. **🔴 MUY IMPORTANTE**: 
   - **NO uses** `mysql.railway.internal` (es solo interno)
   - **Busca** el dominio público que Railway generó
   - Si ves `MYSQL_URL`, cópiala completa (tiene todo junto)
   - Ejemplo de URL pública: `mysql://root:pass@roundhouse.proxy.rlwycdn.com:1234/railway`

4. **Extrae los valores de MYSQL_URL si la ves:**
   - Formato: `mysql://usuario:password@host:puerto/database`
   - Host: la parte después de `@` y antes del `:puerto`
   - Puerto: el número después de `:`
   - Database: la parte después de la última `/`

5. Guarda estos valores en un archivo de texto temporal (Notepad, Word, etc.)

### 1.6 Verificar que la BD está activa y accesible

1. En la parte superior verás un indicador de estado
2. Debe decir **"Active"** con un punto verde
3. Verifica que "Public Networking" esté habilitado
4. Si ves esto, ¡tu base de datos ya está lista! ✅

**💡 Tip**: Deja esta pestaña del navegador abierta, necesitarás copiar estos valores en el siguiente paso.

---

## 🔧 Ejemplo Real de Variables de Railway:

**Lo que probablemente viste primero (NO usar para Render):**
```
MYSQLHOST = mysql.railway.internal  ❌ (solo funciona dentro de Railway)
```

**Lo que DEBES usar (después de habilitar Public Networking):**
```
MYSQL_URL = mysql://root:vnPzKZuzzEEZQieJGQVrAwuESlZXMtSK@roundhouse.proxy.rlwycdn.com:12345/railway

De aquí extraes:
MYSQLHOST = roundhouse.proxy.rlwycdn.com  ✅
MYSQLPORT = 12345  ✅
MYSQLDATABASE = railway  ✅
MYSQLUSER = root  ✅
MYSQLPASSWORD = vnPzKZuzzEEZQieJGQVrAwuESlZXMtSK  ✅
```

---

## ⚙️ PASO 2: Subir tu Código a GitHub

Antes de usar Render, necesitas tener tu código en GitHub.

### 2.1 Crear Repositorio en GitHub (si aún no lo tienes)

1. Ve a [https://github.com](https://github.com) e inicia sesión
2. Haz clic en el botón **"+"** (arriba a la derecha) → **"New repository"**
3. Configura:
   - **Repository name**: `Proyecto-CuyMarket` (o el nombre que prefieras)
   - **Visibility**: Public (o Private si prefieres)
   - **NO marques** "Initialize this repository with a README"
4. Haz clic en **"Create repository"**
5. Copia la URL que aparece (algo como: `https://github.com/tu-usuario/Proyecto-CuyMarket.git`)

### 2.2 Subir tu Código Local a GitHub

Abre una terminal/PowerShell en la carpeta raíz de tu proyecto (`Proyecto_CuyMarket`) y ejecuta:

```bash
# Inicializar git (si no lo has hecho)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Preparar para despliegue en Render y Railway"

# Conectar con GitHub (reemplaza con TU URL)
git remote add origin https://github.com/tu-usuario/Proyecto-CuyMarket.git

# Subir el código
git branch -M main
git push -u origin main
```

**Si te pide usuario y contraseña**: Usa tu usuario de GitHub y un [Personal Access Token](https://github.com/settings/tokens) como contraseña.

### 2.3 Verificar que se subió correctamente

1. Recarga la página de tu repositorio en GitHub
2. Debes ver las carpetas `backend/` y `Front/`
3. Si las ves, ¡perfecto! ✅

---

## 🚀 PASO 3: Desplegar Backend en Render

### 3.1 Registrarse en Render

1. Ve a [https://render.com](https://render.com)
2. Haz clic en **"Get Started"** o **"Sign Up"**
3. Selecciona **"Sign up with GitHub"** (conecta con la misma cuenta que usaste para subir el código)
4. Autoriza Render para acceder a tu GitHub
5. Te llevará al Dashboard de Render

### 3.2 Conectar tu Repositorio de GitHub con Render

1. En el Dashboard de Render, busca el botón azul **"New +"** (arriba a la derecha)
2. Haz clic en **"New +"** → **"Web Service"**
3. Verás una lista de tus repositorios de GitHub
4. Busca tu repositorio **"Proyecto-CuyMarket"** 
5. Haz clic en el botón **"Connect"** al lado del repositorio

**Si no ves tu repositorio:**
- Haz clic en **"Configure account"** 
- Asegúrate de dar permiso a Render para acceder al repositorio
- Regresa y recarga la página

### 3.3 Configurar el Backend

Ahora verás un formulario largo. Llena los campos así:

**📝 Sección: Basic**

1. **Name**: `cuymarket-backend` (o el nombre que prefieras)
2. **Region**: Selecciona **Oregon (US West)** (es el más común)
3. **Branch**: `main` (o la rama donde está tu código)
4. **Root Directory**: Escribe `backend` (esto le dice a Render que tu backend está en esa carpeta)
5. **Runtime**: Selecciona **Java** del menú desplegable

**📝 Sección: Build & Deploy**

6. **Build Command**: Copia y pega esto:
   ```bash
   ./mvnw clean package -DskipTests
   ```

7. **Start Command**: Copia y pega esto:
   ```bash
   java -Dspring.profiles.active=prod -Dserver.port=$PORT -jar target/backend-0.0.1-SNAPSHOT.jar
   ```

**📝 Sección: Environment Variables**

8. Haz scroll hacia abajo y busca la sección **"Environment Variables"**
9. Haz clic en **"Add Environment Variable"**
10. Agrega CADA UNA de estas variables (una por una):

   | Key (Nombre) | Value (Valor) |
   |--------------|---------------|
   | `MYSQLHOST` | [Host PÚBLICO de Railway - NO `mysql.railway.internal`] |
   | `MYSQLPORT` | [Puerto de Railway - puede ser 3306 o un número aleatorio] |
   | `MYSQLDATABASE` | `railway` |
   | `MYSQLUSER` | `root` |
   | `MYSQLPASSWORD` | [Tu contraseña de Railway] |
   | `JWT_SECRET` | `cuymarket-super-secret-key-cambiar-en-produccion-12345` |
   | `FRONTEND_URL` | `https://cuymarket-frontend.onrender.com` |

   **🔴 CRÍTICO - MYSQLHOST:**
   - ✅ USA: `roundhouse.proxy.rlwycdn.com` (o similar)
   - ❌ NO USES: `mysql.railway.internal` (no funcionará desde Render)

   **Para agregar cada variable:**
   - Escribe el nombre en "Key"
   - Escribe el valor en "Value"
   - Haz clic en "Add" o presiona Enter
   - Repite para cada variable

**📝 Sección: Instance Type**

11. **Plan**: Selecciona **Free** (no te cobrarán nada)

### 3.4 Crear el Servicio

1. Revisa que todo esté correcto
2. Haz scroll hasta el final
3. Haz clic en el botón azul grande **"Create Web Service"**

### 3.5 Esperar el Despliegue

1. Render comenzará a construir tu backend
2. Verás logs en tiempo real (texto blanco sobre fondo negro)
3. El proceso toma **5-10 minutos**
4. Busca estos mensajes en los logs:
   - ✅ `Build successful`
   - ✅ `Starting service...`
   - ✅ `Started BackendApplication`

5. En la parte superior, el estado cambiará a **"Live"** con un círculo verde ✅

### 3.6 Obtener la URL del Backend

1. Cuando el estado sea **"Live"**, en la parte superior izquierda verás una URL
2. Algo como: `https://cuymarket-backend-abc123.onrender.com`
3. **COPIA ESTA URL** y guárdala (la necesitarás para el frontend)
4. Puedes probarla abriendo en tu navegador: `tu-url/api/health` (si tienes un endpoint de health)

---

## 🎨 PASO 4: Actualizar URL del Backend en el Código

Antes de desplegar el frontend, necesitas actualizar la URL del backend.

### 4.1 Actualizar el Archivo de Configuración

1. En VS Code, abre el archivo: `Front/src/environments/environment.prod.ts`
2. Verás algo como esto:
   ```typescript
   export const environment = {
       production: true,
       apiUrl: 'https://tu-backend-cuymarket.onrender.com/api'
   };
   ```
3. **Reemplaza** `https://tu-backend-cuymarket.onrender.com` con la URL real que copiaste en el Paso 3.6
4. Ejemplo final:
   ```typescript
   export const environment = {
       production: true,
       apiUrl: 'https://cuymarket-backend-abc123.onrender.com/api'
   };
   ```
5. **Guarda el archivo** (Ctrl + S)

### 4.2 Subir el Cambio a GitHub

Abre una terminal en la carpeta de tu proyecto y ejecuta:

```bash
git add .
git commit -m "Actualizar URL del backend en producción"
git push origin main
```

---

## 🌐 PASO 5: Desplegar Frontend en Render

### 5.1 Crear Nuevo Web Service para el Frontend

1. Regresa al Dashboard de Render ([https://dashboard.render.com](https://dashboard.render.com))
2. Haz clic en **"New +"** → **"Web Service"**
3. Busca tu repositorio **"Proyecto-CuyMarket"** y haz clic en **"Connect"**

### 5.2 Configurar el Frontend

Llena el formulario:

**📝 Sección: Basic**

1. **Name**: `cuymarket-frontend`
2. **Region**: **Oregon (US West)**
3. **Branch**: `main`
4. **Root Directory**: Escribe `Front` (con F mayúscula, como está en tu proyecto)
5. **Runtime**: Selecciona **Node**

**📝 Sección: Build & Deploy**

6. **Build Command**: Copia y pega:
   ```bash
   npm install && npm run build:prod
   ```

7. **Start Command**: Copia y pega:
   ```bash
   npm start
   ```

**📝 Sección: Instance Type**

8. **Plan**: Selecciona **Free**

### 5.3 Crear el Servicio

1. Revisa que todo esté correcto
2. Haz clic en **"Create Web Service"**

### 5.4 Esperar el Despliegue

1. Verás logs en tiempo real
2. El proceso toma **5-10 minutos**
3. Busca estos mensajes:
   - ✅ `Build successful`
   - ✅ `Servidor frontend corriendo en puerto...`
   - ✅ Estado cambia a **"Live"** (verde)

### 5.5 Obtener la URL del Frontend

1. En la parte superior verás la URL de tu frontend
2. Algo como: `https://cuymarket-frontend-xyz789.onrender.com`
3. **COPIA ESTA URL**
4. Haz clic en ella para abrir tu aplicación ✨

---

## 🔄 PASO 6: Actualizar Variable FRONTEND_URL en el Backend

Ahora que tienes la URL real del frontend, debes actualizarla en el backend.

### 6.1 Editar Variables de Entorno del Backend

1. En el Dashboard de Render, haz clic en tu servicio **"cuymarket-backend"**
2. En el menú lateral izquierdo, busca y haz clic en **"Environment"**
3. Verás la lista de variables que agregaste antes
4. Busca la variable **"FRONTEND_URL"**
5. Haz clic en el ícono de **lápiz/editar** al lado de esa variable
6. Reemplaza el valor con la URL real de tu frontend (la que copiaste en el Paso 5.5)
   - Ejemplo: `https://cuymarket-frontend-xyz789.onrender.com`
7. Haz clic en **"Save Changes"**

### 6.2 Esperar el Reinicio

1. Render reiniciará automáticamente el backend (toma 2-3 minutos)
2. Espera a que el estado vuelva a **"Live"**
3. ¡Listo! Ahora backend y frontend están correctamente conectados ✅

---

## ✅ PASO 7: Probar tu Aplicación Desplegada

### 7.1 Abrir el Frontend

1. Abre tu navegador (Chrome, Firefox, Edge, etc.)
2. Pega la URL de tu frontend: `https://cuymarket-frontend-xyz789.onrender.com`
3. Presiona Enter

### 7.2 Primera Carga (Importante)

⏰ **La primera vez tomará 30-60 segundos** porque los servicios gratuitos "despiertan" después de estar inactivos.

Verás una pantalla blanca o loading... **Esto es normal, ten paciencia.**

### 7.3 Verificar que Todo Funciona

Prueba estas cosas:

✅ **La aplicación carga correctamente**
- Debes ver la página de inicio de CuyMarket

✅ **Navegación funciona**
- Haz clic en diferentes páginas/secciones

✅ **Registro de usuario**
- Intenta crear una cuenta nueva
- Si se crea, significa que el backend y la base de datos están conectados ✨

✅ **Login funciona**
- Intenta iniciar sesión con la cuenta que creaste

✅ **CRUD básico**
- Si tu aplicación permite crear/editar/eliminar cosas, pruébalo
- Los datos deben guardarse en la base de datos de Railway

### 7.4 Si Algo No Funciona

Revisa la sección de "Solución de Problemas" más abajo.

---

## ⚠️ Limitaciones de los Planes Gratuitos

### Railway (Base de Datos):
- **$5 de crédito inicial** (suficiente para ~1 mes)
- **500 horas/mes** después de gastar el crédito
- La base de datos puede suspenderse si se agota el crédito
- Necesitarás agregar una tarjeta (no se cobra si no superas el límite gratuito)

### Render (Backend + Frontend):
- Los servicios se **duermen después de 15 minutos de inactividad**
- La primera petición después de dormir tarda **30-60 segundos** en responder
- **750 horas/mes** de uso compartidas entre todos tus servicios
- **Solo HTTP/HTTPS** (no WebSockets persistentes)

---

## 🔧 Solución de Problemas Comunes

### ❌ "Application failed to respond" o "Service Unavailable"

**Posibles causas y soluciones:**

1. **El servicio aún se está desplegando**
   - Solución: Espera 5-10 minutos más
   - Ve a Render Dashboard → tu servicio → "Logs" 
   - Busca el mensaje "Started BackendApplication"

2. **Error en el build**
   - Ve a "Logs" y busca errores en rojo
   - Revisa que los comandos de build sean correctos
   - Verifica que el archivo `pom.xml` no tenga errores

3. **Puerto incorrecto**
   - Asegúrate de usar `$PORT` en el comando de inicio
   - El comando debe tener: `-Dserver.port=$PORT`

### ❌ Error de Conexión a la Base de Datos

**Síntomas:** Error 500, "Cannot connect to database", etc.

**Soluciones paso a paso:**

1. **Verificar variables en Render:**
   - Ve a Render Dashboard → Backend → "Environment"
   - Revisa que TODAS estas variables existan:
     - `MYSQLHOST`
     - `MYSQLPORT`
     - `MYSQLDATABASE`
     - `MYSQLUSER`
     - `MYSQLPASSWORD`

2. **Verificar que los valores sean correctos:**
   - Compara con los valores en Railway
   - Ve a Railway → tu base de datos → "Variables"
   - Los valores deben ser EXACTAMENTE iguales

3. **Verificar que Railway esté activo:**
   - Ve a Railway Dashboard
   - Tu base de datos debe tener un punto verde "Active"
   - Si dice "Sleeping", haz clic para activarla

4. **Revisar los logs del backend:**
   - Ve a Render → Backend → "Logs"
   - Busca errores relacionados con "SQL", "Connection", "Database"
   - El error te dirá qué variable está mal

### ❌ CORS Errors (Frontend no puede conectar con Backend)

**Síntomas:** En la consola del navegador (F12) ves errores de CORS

**Soluciones:**

1. **Verificar FRONTEND_URL en el backend:**
   - Ve a Render → Backend → "Environment"
   - La variable `FRONTEND_URL` debe tener la URL EXACTA de tu frontend
   - Ejemplo: `https://cuymarket-frontend-xyz789.onrender.com`
   - NO incluyas `/` al final

2. **Verificar apiUrl en el frontend:**
   - Revisa `Front/src/environments/environment.prod.ts`
   - Debe tener la URL correcta del backend
   - Ejemplo: `https://cuymarket-backend-abc123.onrender.com/api`

3. **Si cambias algo, debes hacer push a GitHub:**
   ```bash
   git add .
   git commit -m "Fix: Actualizar URLs"
   git push origin main
   ```
   - Render detectará el cambio y volverá a desplegar automáticamente

### ❌ La Página Carga Muy Lento (30-60 segundos)

**Esto es NORMAL en el plan gratuito.**

**¿Por qué?**
- Render duerme los servicios gratuitos después de 15 minutos sin uso
- La primera petición "despierta" el servicio
- Las siguientes peticiones serán rápidas (por ~15 minutos)

**Soluciones:**
- ✅ Ten paciencia en la primera carga
- ✅ Mantén la pestaña abierta si estás trabajando
- ✅ Considera el plan pago ($7/mes) para eliminar esto

### ❌ Error 404 en Rutas del Frontend Angular

**Síntoma:** Al refrescar la página en una ruta como `/admin` da error 404

**Solución:** Ya está configurado en `server.js`, pero verifica que:
1. El archivo `Front/server.js` existe
2. Tiene la línea: `app.get('/*', (req, res) => {...})`

### ❌ "npm install failed" o "Build failed" en el Frontend

**Soluciones:**

1. **Verifica que package.json esté correcto:**
   - Debe incluir `"express": "^4.18.2"` en dependencies

2. **Prueba localmente primero:**
   ```bash
   cd Front
   npm install
   npm run build:prod
   ```
   - Si falla localmente, arréglalo antes de desplegar

3. **Revisa los logs en Render:**
   - Te dirán exactamente qué paquete falla

### ❌ Railway: "Out of credits" o "Service suspended"

**Causas:**
- Gastaste los $5 de crédito inicial
- Superaste las 500 horas/mes

**Soluciones:**

1. **Agregar tarjeta de crédito:**
   - Ve a Railway → Settings → Billing
   - Agrega una tarjeta (no te cobrará si no superas el límite gratuito)

2. **Monitorear uso:**
   - Railway Dashboard → Settings → Usage
   - Revisa cuánto crédito te queda

3. **Alternativa:** Migrar a otra BD gratuita (PlanetScale, FreeSQLDatabase)

### 🆘 Cómo Ver los Logs para Diagnosticar

**En Render:**
1. Dashboard → Selecciona tu servicio
2. Haz clic en "Logs" en el menú lateral
3. Los logs muestran errores en tiempo real
4. Busca texto en ROJO (son errores)

**En Railway:**
1. Dashboard → Selecciona tu base de datos
2. Haz clic en "Observability" 
3. Verás uso de CPU, memoria y conexiones

### 💡 Tip: Cómo Probar que el Backend Funciona Solo

Abre en tu navegador (reemplaza con TU URL):
```
https://tu-backend.onrender.com/api/health
```

- Si ves una respuesta JSON → Backend funciona ✅
- Si ves error 500/404 → Problema en el backend ❌

---

## 📱 URLs de tu Aplicación

Después de completar todos los pasos:

- **Frontend**: `https://cuymarket-frontend.onrender.com`
- **Backend API**: `https://cuymarket-backend.onrender.com/api`
- **Base de Datos**: MySQL en Railway (conectada mediante variables de entorno)

---

## 🎉 ¡Listo!

Tu aplicación CuyMarket ya está desplegada usando Railway + Render de forma gratuita. 

**Siguientes pasos recomendados:**
- Monitorear el crédito de Railway ($5 inicial)
- Configurar un dominio personalizado (opcional)
- Configurar CI/CD para despliegues automáticos desde GitHub
- Monitorear el uso de horas mensuales en ambas plataformas
- Considerar upgrade a plan pago cuando sea necesario

---

## 💰 Administrar Costos y Créditos

### Railway:
- Ve a tu Dashboard → Settings → Usage
- Monitorea tu crédito restante
- Puedes agregar una tarjeta para extender el plan gratuito (no se cobra hasta que superes el límite)

### Render:
- Dashboard → Account → Usage
- Revisa las horas consumidas del mes
- Los servicios se reinician el 1 de cada mes

---

## 📞 Soporte

Si tienes problemas:
- Revisa los logs en Render Dashboard
- Verifica las variables de entorno
- Consulta la documentación de Render: [render.com/docs](https://render.com/docs)
