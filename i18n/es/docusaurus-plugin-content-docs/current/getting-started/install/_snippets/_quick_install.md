# Instalar ClickHouse mediante script usando curl

Si no necesitas instalar ClickHouse para producción, la manera más rápida de configurarlo es ejecutar un script de instalación usando `curl`. El script determinará un binario adecuado para tu sistema operativo.

<VerticalStepper>

## Instalar ClickHouse usando curl {#install-clickhouse-using-curl}

Ejecuta el siguiente comando para descargar un único binario compatible con tu sistema operativo.

```bash
curl https://clickhouse.com/ | sh
```

:::note
Para usuarios de Mac: Si recibes errores indicando que no se puede verificar al desarrollador del binario, consulta [aquí](/knowledgebase/fix-developer-verification-error-in-macos).
:::

## Iniciar clickhouse-local {#start-clickhouse-local}

`clickhouse-local` permite procesar archivos locales y remotos utilizando la poderosa sintaxis SQL de ClickHouse sin necesidad de configuración. Los datos de las tablas se almacenan en una ubicación temporal, lo que significa que después de reiniciar `clickhouse-local`, las tablas previamente creadas ya no estarán disponibles.

Ejecute el siguiente comando para iniciar [clickhouse-local](/operations/utilities/clickhouse-local):

```bash
./clickhouse
```

## Iniciar clickhouse-server {#start-clickhouse-server}

Si deseas conservar los datos, deberás ejecutar `clickhouse-server`. Puedes iniciar el servidor de ClickHouse usando el siguiente comando:

```bash
./clickhouse server
```

## Iniciar clickhouse-client {#start-clickhouse-client}

Con el servidor en funcionamiento, abre una nueva ventana de terminal y ejecuta el siguiente comando para iniciar `clickhouse-client`:

```bash
./clickhouse client
```

Verás algo como lo siguiente:

```response
./clickhouse client
ClickHouse client version 24.5.1.117 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 24.5.1.

local-host :)
```

Los datos de las tablas se almacenan en el directorio actual y siguen estando disponibles después de reiniciar el servidor de ClickHouse. Si es necesario, puedes pasar `-C config.xml` como argumento adicional en la línea de comandos a `./clickhouse server` y proporcionar configuraciones adicionales en un archivo de configuración. Todas las configuraciones disponibles están documentadas [aquí](/operations/server-configuration-parameters/settings) y en el [archivo de configuración de ejemplo](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml).

¡Ahora estás listo para empezar a enviar comandos SQL a ClickHouse!

:::tip
El [inicio rápido](/get-started/quick-start) guía los pasos para crear tablas e insertar datos.
:::

</VerticalStepper>
