# Paso 1: Elegir una imagen base
FROM node:latest

# Paso 2: Establecer el directorio de trabajo en el contenedor
WORKDIR /usr/node/app

# Paso 3: Copiar los archivos package.json y package-lock.json (o yarn.lock)
COPY package*.json ./


# Paso 4: Instalar dependencias (incluyendo las de desarrollo para ejecutar tests)
RUN npm install

# Paso 5: Copiar el resto de los archivos de tu proyecto
COPY . .

# Paso 6: Exponer el puerto que tu aplicación utilizará
EXPOSE 3000

# Paso 7: Definir el comando para ejecutar la aplicación en modo desarrollo
CMD [ "npm", "run", "dev" ]
