# Install ClickHouse using tgz archives

> Se recomienda usar los archivos `tgz` precompilados oficiales para todas las distribuciones Linux, cuando la instalación mediante paquetes `deb` o `rpm` no sea posible.

<VerticalStepper>

## Descargar e instalar la última versión estable {#install-latest-stable}

La versión requerida se puede descargar usando `curl` o `wget` desde el repositorio https://packages.clickhouse.com/tgz/.  
Luego, los archivos descargados deben descomprimirse e instalarse usando los scripts de instalación.

A continuación se muestra un ejemplo de cómo instalar la última versión estable.

:::note
Para entornos de producción, se recomienda usar la versión más reciente marcada como `stable`.  
Puedes encontrar el número de la versión en esta [página de GitHub](https://github.com/ClickHouse/ClickHouse/tags) con el sufijo `-stable`.
:::

## Obtener la última versión de ClickHouse {#get-latest-version}

Obtén la última versión de ClickHouse desde GitHub y almacénala en la variable `LATEST_VERSION`.

```bash
LATEST_VERSION=$(curl -s https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION
```

## Detectar la arquitectura del sistema {#detect-system-architecture}

Detecta la arquitectura del sistema y asigna el valor correspondiente a la variable `ARCH`:

```bash
case $(uname -m) in
  x86_64) ARCH=amd64 ;;         # For Intel/AMD 64-bit processors
  aarch64) ARCH=arm64 ;;        # For ARM 64-bit processors
  *) echo "Unknown architecture $(uname -m)"; exit 1 ;; # Exit if architecture isn't supported
esac
```

## Descargar los archivos tar de cada componente de ClickHouse {#download-tarballs}

Descarga los archivos tar de cada componente de ClickHouse. El bucle intenta primero con los paquetes específicos para tu arquitectura y, si no están disponibles, utiliza los genéricos.

```bash
for PKG in clickhouse-common-static clickhouse-common-static-dbg clickhouse-server clickhouse-client clickhouse-keeper
do
  curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION-${ARCH}.tgz" \
    || curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION.tgz"
done
```

## Extraer e instalar paquetes {#extract-and-install}

Ejecuta los siguientes comandos para extraer e instalar los paquetes indicados:

- `clickhouse-common-static`

```bash
# Extract and install clickhouse-common-static package
tar -xzvf "clickhouse-common-static-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-$LATEST_VERSION/install/doinst.sh"
```

- `clickhouse-common-static-dbg`

```bash
# Extract and install debug symbols package
tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-dbg-$LATEST_VERSION/install/doinst.sh"
```

- `clickhouse-server`

```bash
# Extract and install server package with configuration
tar -xzvf "clickhouse-server-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-server-$LATEST_VERSION.tgz"
sudo "clickhouse-server-$LATEST_VERSION/install/doinst.sh" configure
sudo /etc/init.d/clickhouse-server start  # Start the server
```

- `clickhouse-client`

```bash
# Extract and install client package
tar -xzvf "clickhouse-client-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-client-$LATEST_VERSION.tgz"
sudo "clickhouse-client-$LATEST_VERSION/install/doinst.sh"
```

</VerticalStepper>
