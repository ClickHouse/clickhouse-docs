# Установка ClickHouse с помощью tgz-архивов \\{#install-clickhouse-using-tgz-archives\\}

> Рекомендуется использовать официальные предкомпилированные `tgz`-архивы для всех дистрибутивов Linux, где установка пакетов `deb` или `rpm` невозможна.

<VerticalStepper>

## Загрузка и установка последней стабильной версии \\{#install-latest-stable\\}

Необходимую версию можно скачать с помощью `curl` или `wget` из репозитория по адресу https://packages.clickhouse.com/tgz/.
После этого загруженные архивы нужно распаковать и установить с помощью установочных скриптов.

Ниже приведён пример установки последней стабильной версии.

:::note
Для продуктивных (production) сред рекомендуется использовать последнюю стабильную версию (`stable`).
Номер релиза можно найти на этой [странице GitHub](https://github.com/ClickHouse/ClickHouse/tags)
с постфиксом `-stable`.
:::

## Получите последнюю версию ClickHouse \\{#get-latest-version\\}

Получите последнюю версию ClickHouse с GitHub и сохраните её в переменной `LATEST_VERSION`.

```bash
LATEST_VERSION=$(curl -s https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION
```

## Определите архитектуру системы \\{#detect-system-architecture\\}

Определите архитектуру системы и задайте переменную ARCH соответствующим образом:

```bash
case $(uname -m) in
  x86_64) ARCH=amd64 ;;         # For Intel/AMD 64-bit processors
  aarch64) ARCH=arm64 ;;        # For ARM 64-bit processors
  *) echo "Unknown architecture $(uname -m)"; exit 1 ;; # Exit if architecture isn't supported
esac
```

## Загрузка tar-архивов для каждого компонента ClickHouse \\{#download-tarballs\\}

Скачайте tar-архивы для каждого компонента ClickHouse. Цикл сначала пытается использовать пакеты, специфичные для архитектуры, затем при необходимости переходит к универсальным.

```bash
for PKG in clickhouse-common-static clickhouse-common-static-dbg clickhouse-server clickhouse-client clickhouse-keeper
do
  curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION-${ARCH}.tgz" \
    || curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION.tgz"
done
```

## Извлечение и установка пакетов \\{#extract-and-install\\}

Выполните следующие команды для распаковки и установки этих пакетов:
- `clickhouse-common-static`

```bash
# Extract and install clickhouse-common-static package
tar -xzvf "clickhouse-common-static-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-$LATEST_VERSION/install/doinst.sh"
```

* `clickhouse-common-static-dbg`

```bash
# Extract and install debug symbols package
tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-dbg-$LATEST_VERSION/install/doinst.sh"
```

* `clickhouse-server`

```bash
# Extract and install server package with configuration
tar -xzvf "clickhouse-server-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-server-$LATEST_VERSION.tgz"
sudo "clickhouse-server-$LATEST_VERSION/install/doinst.sh" configure
sudo /etc/init.d/clickhouse-server start  # Start the server
```

* `clickhouse-client`

```bash
# Extract and install client package
tar -xzvf "clickhouse-client-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-client-$LATEST_VERSION.tgz"
sudo "clickhouse-client-$LATEST_VERSION/install/doinst.sh"
```

</VerticalStepper>
