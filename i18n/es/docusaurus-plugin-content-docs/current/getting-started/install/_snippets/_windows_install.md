# Instalar ClickHouse en Windows con WSL

## Requisitos {#requirements}

:::note
Para instalar ClickHouse en Windows necesitarás WSL (Windows Subsystem for Linux).
:::

<VerticalStepper>

## Instalar WSL {#install-wsl}

Abre Windows PowerShell como administrador y ejecuta el siguiente comando:

```bash
wsl --install
```

Se te pedirá que ingreses un nuevo nombre de usuario y contraseña de UNIX. 
Después de ingresar el nombre de usuario y la contraseña deseados, deberías ver un mensaje similar a:

```bash
Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 5.15.133.1-microsoft-WSL2 x86_64)
```

## Install ClickHouse via script using curl {#install-clickhouse-via-script-using-curl}

Ejecuta el siguiente comando para instalar ClickHouse mediante un script usando `curl`:

```bash
curl https://clickhouse.com/ | sh
```

Si el script se ejecutó correctamente, verás el siguiente mensaje:

```bash
Successfully downloaded the ClickHouse binary, you can run it as:
  ./clickhouse
```

## Start clickhouse-local {#start-clickhouse-local}

`clickhouse-local` te permite procesar archivos locales y remotos usando la potente sintaxis SQL de ClickHouse, sin necesidad de configuración. Los datos de las tablas se almacenan en una ubicación temporal, lo que significa que después de reiniciar `clickhouse-local`, las tablas creadas previamente ya no estarán disponibles.

Ejecuta el siguiente comando para iniciar [clickhouse-local](/operations/utilities/clickhouse-local):

```bash
./clickhouse
```

## Iniciar clickhouse-server {#start-clickhouse-server}

Si deseas persistir los datos, debes ejecutar `clickhouse-server`. 
Puedes iniciar el servidor de ClickHouse usando el siguiente comando:

```bash
./clickhouse server
```

## Iniciar clickhouse-client {#start-clickhouse-client}

Con el servidor en funcionamiento, abre una nueva ventana de terminal y ejecuta el siguiente comando
para iniciar `clickhouse-client`:

```bash
./clickhouse client
```

Verás algo similar a lo siguiente:

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

Los datos de las tablas se almacenan en el directorio actual y siguen disponibles después de reiniciar el servidor ClickHouse. Si es necesario, puedes pasar `-C config.xml` como argumento adicional al ejecutar `./clickhouse server` y proporcionar más configuración en un archivo de configuración. Todas las configuraciones disponibles están documentadas [aquí](/operations/server-configuration-parameters/settings) y en el [archivo de configuración de ejemplo](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml).

¡Ahora estás listo para comenzar a enviar comandos SQL a ClickHouse!

</VerticalStepper>
