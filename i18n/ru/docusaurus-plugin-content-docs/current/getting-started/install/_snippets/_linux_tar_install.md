# Установка ClickHouse с использованием архивов tgz

> Рекомендуется использовать официальные предварительно скомпилированные архивы `tgz` для всех дистрибутивов Linux, где установка пакетов `deb` или `rpm` невозможна.

<VerticalStepper>

## Загрузка и установка последней стабильной версии {#install-latest-stable}

Необходимую версию можно загрузить с помощью `curl` или `wget` из репозитория https://packages.clickhouse.com/tgz/.
После этого загруженные архивы должны быть распакованы и установлены с помощью установочных скриптов.

Ниже приведён пример того, как установить последнюю стабильную версию.

:::note
Для производственных сред рекомендуется использовать последнюю `stable`-версию.
Вы можете найти номер релиза на этой [странице GitHub](https://github.com/ClickHouse/ClickHouse/tags)
с постфиксом `-stable`.
:::

## Получите последнюю версию ClickHouse {#get-latest-version}

Получите последнюю версию ClickHouse из GitHub и сохраните её в переменной `LATEST_VERSION`.

```bash
LATEST_VERSION=$(curl -s https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION
```

## Определите архитектуру вашей системы {#detect-system-architecture}

Определите архитектуру системы и установите переменную ARCH соответствующим образом:

```bash
case $(uname -m) in
  x86_64) ARCH=amd64 ;;         # For Intel/AMD 64-bit processors
  aarch64) ARCH=arm64 ;;        # For ARM 64-bit processors
  *) echo "Unknown architecture $(uname -m)"; exit 1 ;; # Exit if architecture isn't supported
esac
```

## Загрузка tar-файлов для каждого компонента ClickHouse {#download-tarballs}

Загрузите tar-файлы для каждого компонента ClickHouse. Цикл сначала пытается загрузить пакеты, специфичные для архитектуры, а затем переходит к универсальным.

```bash
for PKG in clickhouse-common-static clickhouse-common-static-dbg clickhouse-server clickhouse-client clickhouse-keeper
do
  curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION-${ARCH}.tgz" \
    || curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION.tgz"
done
```

## Извлечение и установка пакетов {#extract-and-install}

Запустите команды ниже для извлечения и установки следующих пакетов:
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