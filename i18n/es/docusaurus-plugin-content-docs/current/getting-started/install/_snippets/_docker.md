# Instalar ClickHouse usando Docker

La guía en [Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/) se presenta a continuación para mayor comodidad. Las imágenes de Docker disponibles se basan en los paquetes `deb` oficiales de ClickHouse.


Comando para descargar la imagen de Docker:

```bash
docker pull clickhouse/clickhouse-server
```

## Versiones {#versions}

- La etiqueta `latest` apunta a la última versión de la rama estable más reciente.
- Las etiquetas de rama como `22.2` apuntan a la última versión de la rama correspondiente.
- Las etiquetas de versión completa como `22.2.3` y `22.2.3.5` apuntan a la versión correspondiente.
- La etiqueta `head` se construye a partir del último commit de la rama por defecto.
- Cada etiqueta puede tener un sufijo opcional `-alpine` para indicar que está basada en Alpine.

### Compatibilidad {#compatibility}

- La imagen amd64 requiere soporte para instrucciones [SSE3](https://en.wikipedia.org/wiki/SSE3). Prácticamente todos los CPUs x86 posteriores a 2005 soportan SSE3.
- La imagen arm64 requiere soporte para la [arquitectura ARMv8.2-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.2-A) y adicionalmente el registro Load-Acquire RCpc. Este registro es opcional en ARMv8.2-A y obligatorio en [ARMv8.3-A](https://en.wikipedia.org/wiki/AArch64#ARMv8.3-A). Soportado en Graviton >=2, instancias de Azure y GCP. Ejemplos de dispositivos no soportados: Raspberry Pi 4 (ARMv8.0-A) y Jetson AGX Xavier/Orin (ARMv8.2-A).
- Desde ClickHouse 24.11 las imágenes de Ubuntu usan `ubuntu:22.04` como base. Requiere Docker versión >= `20.10.10` que incluya [este parche](https://github.com/moby/moby/commit/977283509f75303bc6612665a04abf76ff1d2468). Como solución temporal, se puede usar `docker run --security-opt seccomp=unconfined`, pero esto tiene implicaciones de seguridad.

## Cómo usar esta imagen {#how-to-use-image}

### Iniciar una instancia del servidor {#start-server-instance}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

Por defecto, ClickHouse será accesible únicamente a través de la red de Docker. Consulta la sección de redes más abajo.

Al iniciar la instancia del servidor anterior, esta se ejecutará como el usuario `default` sin contraseña.

### Conectarse desde un cliente nativo {#connect-to-it-from-native-client}

```bash
docker run -it --rm --network=container:some-clickhouse-server --entrypoint clickhouse-client clickhouse/clickhouse-server
# OR
docker exec -it some-clickhouse-server clickhouse-client
```

Consulta [Cliente de ClickHouse](/interfaces/cli) para obtener más información sobre el cliente de ClickHouse.

### Conexión mediante curl {#connect-to-it-using-curl}

```bash
echo "SELECT 'Hello, ClickHouse!'" | docker run -i --rm --network=container:some-clickhouse-server buildpack-deps:curl curl 'http://localhost:8123/?query=' -s --data-binary @-
```

Consulta [Interfaz HTTP de ClickHouse](/interfaces/http) para obtener más información sobre la interfaz HTTP.

### Detener / eliminar el contenedor {#stopping-removing-container}

```bash
docker stop some-clickhouse-server
docker rm some-clickhouse-server
```

### Redes {#networking}

:::note
El usuario predefinido `default` no tiene acceso a la red a menos que se haya configurado una contraseña.  
Consulta las secciones "Cómo crear la base de datos y el usuario por defecto al iniciar" y "Administración del usuario `default`" más abajo.
:::

Puedes exponer tu instancia de ClickHouse que se ejecuta en Docker [mapeando un puerto específico](https://docs.docker.com/config/containers/container-networking/) desde dentro del contenedor hacia los puertos del host:


```bash
docker run -d -p 18123:8123 -p19000:9000 -e CLICKHOUSE_PASSWORD=changeme --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:18123/?password=changeme' --data-binary @-
```

O permitiendo que el contenedor use [directamente los puertos del host](https://docs.docker.com/network/host/) mediante `--network=host`  
(esto también permite obtener un mejor rendimiento de red):

```bash
docker run -d --network=host --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
echo 'SELECT version()' | curl 'http://localhost:8123/' --data-binary @-
```

:::note
El usuario `default` en el ejemplo anterior está disponible únicamente para solicitudes desde `localhost`.
:::

### Volúmenes {#volumes}

Normalmente, querrás montar las siguientes carpetas dentro de tu contenedor para garantizar la persistencia:

- `/var/lib/clickhouse/` - main folder where ClickHouse stores the data
- `/var/log/clickhouse-server/` - logs

```bash
docker run -d \
    -v "$PWD/ch_data:/var/lib/clickhouse/" \
    -v "$PWD/ch_logs:/var/log/clickhouse-server/" \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

También podrías querer montar:

- `/etc/clickhouse-server/config.d/*.xml` - files with server configuration adjustments
- `/etc/clickhouse-server/users.d/*.xml` - files with user settings adjustments
- `/docker-entrypoint-initdb.d/` - folder with database initialization scripts (see below).

## Capacidades de Linux {#linear-capabilities}

ClickHouse cuenta con algunas funcionalidades avanzadas que requieren habilitar varias [capacidades de Linux](https://man7.org/linux/man-pages/man7/capabilities.7.html).

Son opcionales y se pueden habilitar usando los siguientes [argumentos de línea de comandos de Docker](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities):

```bash
docker run -d \
    --cap-add=SYS_NICE --cap-add=NET_ADMIN --cap-add=IPC_LOCK \
    --name some-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server
```

Para más información, consulta ["Configuración de las capacidades CAP_IPC_LOCK y CAP_SYS_NICE en Docker"](/knowledgebase/configure_cap_ipc_lock_and_cap_sys_nice_in_docker).

## Configuración {#configuration}

El contenedor expone el puerto 8123 para la [interfaz HTTP](https://clickhouse.com/docs/interfaces/http_interface/) y el puerto 9000 para el [cliente nativo](https://clickhouse.com/docs/interfaces/tcp/).

La configuración de ClickHouse se representa mediante un archivo `config.xml` ([documentación](https://clickhouse.com/docs/operations/configuration_files/)).

### Iniciar una instancia del servidor con configuración personalizada {#start-server-instance-with-custom-config}

```bash
docker run -d --name some-clickhouse-server --ulimit nofile=262144:262144 -v /path/to/your/config.xml:/etc/clickhouse-server/config.xml clickhouse/clickhouse-server
```

### Iniciar el servidor como un usuario personalizado {#start-server-custom-user}

```bash
# $PWD/data/clickhouse should exist and be owned by current user
docker run --rm --user "${UID}:${GID}" --name some-clickhouse-server --ulimit nofile=262144:262144 -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

Cuando uses la imagen con directorios locales montados, probablemente querrás especificar el usuario para mantener la propiedad correcta de los archivos. Utiliza el argumento `--user` y monta `/var/lib/clickhouse` y `/var/log/clickhouse-server` dentro del contenedor. De lo contrario, la imagen mostrará un error y no se iniciará.

### Iniciar el servidor como root {#start-server-from-root}

Iniciar el servidor como root es útil en casos donde el espacio de nombres de usuario está habilitado.  
Para hacerlo, ejecuta:

```bash
docker run --rm -e CLICKHOUSE_RUN_AS_ROOT=1 --name clickhouse-server-userns -v "$PWD/logs/clickhouse:/var/log/clickhouse-server" -v "$PWD/data/clickhouse:/var/lib/clickhouse" clickhouse/clickhouse-server
```

### Cómo crear la base de datos y el usuario por defecto al iniciar {#how-to-create-default-db-and-user}

En algunas ocasiones, es posible que desees crear un usuario (el usuario llamado `default` se utiliza por defecto) y una base de datos al iniciar un contenedor.  
Esto se puede hacer utilizando las variables de entorno `CLICKHOUSE_DB`, `CLICKHOUSE_USER`, `CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT` y `CLICKHOUSE_PASSWORD`:

```bash
docker run --rm -e CLICKHOUSE_DB=my_database -e CLICKHOUSE_USER=username -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 -e CLICKHOUSE_PASSWORD=password -p 9000:9000/tcp clickhouse/clickhouse-server
```

#### Administración del usuario `default` {#managing-default-user}

El usuario `default` tiene deshabilitado el acceso a la red por defecto en caso de que no se hayan configurado `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD` o `CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT`.

Es posible hacer que el usuario `default` esté disponible de manera insegura estableciendo la variable de entorno `CLICKHOUSE_SKIP_USER_SETUP` en 1:

```bash
docker run --rm -e CLICKHOUSE_SKIP_USER_SETUP=1 -p 9000:9000/tcp clickhouse/clickhouse-server
```

## Cómo extender esta imagen {#how-to-extend-image}

Para realizar inicializaciones adicionales en una imagen derivada de esta, agrega uno o más scripts `*.sql`, `*.sql.gz` o `*.sh` en `/docker-entrypoint-initdb.d`.  
Después de que el entrypoint llame a `initdb`, se ejecutarán todos los archivos `*.sql`, se correrán los scripts ejecutables `*.sh` y se procesarán los scripts no ejecutables `*.sh` encontrados en ese directorio para realizar inicializaciones adicionales antes de iniciar el servicio.  

Además, puedes proporcionar las variables de entorno `CLICKHOUSE_USER` y `CLICKHOUSE_PASSWORD`, que se usarán con `clickhouse-client` durante la inicialización.

Por ejemplo, para agregar otro usuario y base de datos, añade lo siguiente a `/docker-entrypoint-initdb.d/init-db.sh`:

```bash
#!/bin/bash
set -e

clickhouse client -n <<-EOSQL
    CREATE DATABASE docker;
    CREATE TABLE docker.docker (x Int32) ENGINE = Log;
EOSQL
```