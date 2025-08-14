# Instalar ClickHouse en distribuciones basadas en RPM

> Se recomienda usar los paquetes `rpm` oficiales precompilados para **CentOS**, **RedHat** y todas las demás distribuciones Linux basadas en RPM.

<VerticalStepper>

## Configurar el repositorio RPM

Agrega el repositorio oficial ejecutando el siguiente comando:

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
```

Para sistemas con el gestor de paquetes `zypper` (openSUSE, SLES), ejecuta:

```bash
sudo zypper addrepo -r https://packages.clickhouse.com/rpm/clickhouse.repo -g
sudo zypper --gpg-auto-import-keys refresh clickhouse-stable
```

En los pasos siguientes, `yum install` puede reemplazarse por `zypper install`, dependiendo del gestor de paquetes que utilices.

## Instalar el servidor y cliente de ClickHouse

Para instalar ClickHouse, ejecuta los siguientes comandos:

```bash
sudo yum install -y clickhouse-server clickhouse-client
```

- Puedes reemplazar `stable` por `lts` para usar diferentes tipos de release según tus necesidades.
- También puedes descargar e instalar los paquetes manualmente desde [packages.clickhouse.com/rpm](https://packages.clickhouse.com/rpm/stable).
- Para instalar una versión específica, agrega `-$version` al final del nombre del paquete. Por ejemplo:

```bash
sudo yum install clickhouse-server-22.8.7.34
```

## Iniciar el servidor ClickHouse

Para iniciar el servidor ClickHouse, ejecuta:

```bash
sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server
sudo systemctl status clickhouse-server
```

Para iniciar el cliente ClickHouse, ejecuta:

```bash
clickhouse-client
```

Si configuraste una contraseña para tu servidor, deberás ejecutar:

```bash
clickhouse-client --password
```

## Instalar ClickHouse Keeper independiente

:::tip
En entornos de producción, recomendamos fuertemente ejecutar ClickHouse Keeper en nodos dedicados. En entornos de prueba, si decides ejecutar ClickHouse Server y ClickHouse Keeper en el mismo servidor, no es necesario instalar ClickHouse Keeper, ya que está incluido con el servidor ClickHouse.
:::

Para instalar `clickhouse-keeper` en servidores independientes, ejecuta:

```bash
sudo yum install -y clickhouse-keeper
```

## Habilitar e iniciar ClickHouse Keeper

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>
