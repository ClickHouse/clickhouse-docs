import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Instalar ClickHouse en Debian/Ubuntu {#install-from-deb-packages}

> Se recomienda usar los paquetes `deb` precompilados oficiales para **Debian** o **Ubuntu**.

<VerticalStepper>

## Configurar el repositorio de Debian {#setup-the-debian-repository}

Para instalar ClickHouse, ejecuta los siguientes comandos:

```bash
# Install prerequisite packages
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg

# Download the ClickHouse GPG key and store it in the keyring
curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' | sudo gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg

# Get the system architecture
ARCH=$(dpkg --print-architecture)

# Add the ClickHouse repository to apt sources
echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg arch=${ARCH}] https://packages.clickhouse.com/deb stable main" | sudo tee /etc/apt/sources.list.d/clickhouse.list

# Update apt package lists
sudo apt-get update
```

- Puedes reemplazar `stable` por `lts` para usar diferentes [tipos de versión](/knowledgebase/production) según tus necesidades.
- También puedes descargar e instalar los paquetes manualmente desde [packages.clickhouse.com](https://packages.clickhouse.com/deb/pool/main/c/).

<details>
<summary>Método antiguo para instalar los paquetes deb</summary>


```bash
# Install prerequisite packages
sudo apt-get install apt-transport-https ca-certificates dirmngr

# Add the ClickHouse GPG key to authenticate packages
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754

# Add the ClickHouse repository to apt sources
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list
    
# Update apt package lists
sudo apt-get update

# Install ClickHouse server and client packages
sudo apt-get install -y clickhouse-server clickhouse-client

# Start the ClickHouse server service
sudo service clickhouse-server start

# Launch the ClickHouse command line client
clickhouse-client # or "clickhouse-client --password" if you set up a password.
```

</details>

## Instalar ClickHouse server y client {#install-clickhouse-server-and-client}

```bash
sudo apt-get install -y clickhouse-server clickhouse-client
```

## Iniciar ClickHouse {#start-clickhouse-server}

Para iniciar el servidor de ClickHouse, ejecuta:

```bash
sudo service clickhouse-server start
```

Para iniciar el cliente de ClickHouse, ejecuta:

```bash
clickhouse-client
```

Si configuraste una contraseña para tu servidor, entonces necesitarás ejecutar:

```bash
clickhouse-client --password
```

## Instalar ClickHouse Keeper independiente {#install-standalone-clickhouse-keeper}

:::tip
En entornos de producción, recomendamos encarecidamente ejecutar ClickHouse Keeper en nodos dedicados.
En entornos de prueba, si decides ejecutar ClickHouse Server y ClickHouse Keeper en el mismo servidor,
no necesitas instalar ClickHouse Keeper, ya que está incluido con el servidor ClickHouse.
:::

Para instalar `clickhouse-keeper` en servidores independientes de ClickHouse Keeper, ejecuta:

```bash
sudo apt-get install -y clickhouse-keeper
```

## Habilitar y arrancar ClickHouse Keeper {#enable-and-start-clickhouse-keeper}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>

## Paquetes {#packages}

Los distintos paquetes `deb` disponibles se detallan a continuación:

| Paquete                        | Descripción                                                                                                                                                                                                                                                                            |
|--------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `clickhouse-common-static`     | Instala los archivos binarios compilados de ClickHouse.                                                                                                                                                                                                                                 |
| `clickhouse-server`            | Crea un enlace simbólico para `clickhouse-server` e instala la configuración predeterminada del servidor.                                                                                                                                                                              |
| `clickhouse-client`            | Crea un enlace simbólico para `clickhouse-client` y otras herramientas relacionadas con el cliente, e instala los archivos de configuración del cliente.                                                                                                                              |
| `clickhouse-common-static-dbg` | Instala los archivos binarios compilados de ClickHouse con información de depuración.                                                                                                                                                                                                  |
| `clickhouse-keeper`            | Se utiliza para instalar ClickHouse Keeper en nodos dedicados. Si estás ejecutando ClickHouse Keeper en el mismo servidor que ClickHouse Server, no necesitas instalar este paquete. Instala ClickHouse Keeper y los archivos de configuración predeterminados.                        |

<br/>
:::info
Si necesitas instalar una versión específica de ClickHouse, debes instalar todos los paquetes con la misma versión:
`sudo apt-get install clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7 clickhouse-common-static=21.8.5.7`
:::
