# Установка ClickHouse с использованием архивов tgz \{#install-clickhouse-using-tgz-archives\}

> Рекомендуется использовать официальные предварительно скомпилированные архивы `tgz` для всех дистрибутивов Linux, где установка пакетов `deb` или `rpm` невозможна.

<VerticalStepper>

## Загрузка и установка последней стабильной версии \{#install-latest-stable\}

Необходимую версию можно загрузить с помощью `curl` или `wget` из репозитория https://packages.clickhouse.com/tgz/.
После этого загруженные архивы нужно распаковать и установить с помощью установочных скриптов.

Ниже приведён пример установки последней стабильной версии.

:::note
Для продакшн-сред рекомендуется использовать последнюю версию `stable`.
Найти номер релиза можно на этой [странице GitHub](https://github.com/ClickHouse/ClickHouse/tags)
с постфиксом `-stable`.
:::

## Получение последней версии ClickHouse \{#get-latest-version\}

Получите последнюю версию ClickHouse с GitHub и сохраните её в переменную `LATEST_VERSION`.

```bash
LATEST_VERSION=$(curl -s https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION
```

## Определение архитектуры системы \{#detect-system-architecture\}

Определите архитектуру системы и соответствующим образом задайте переменную ARCH:

```bash
case $(uname -m) in
  x86_64) ARCH=amd64 ;;         # Для 64-битных процессоров Intel/AMD
  aarch64) ARCH=arm64 ;;        # Для 64-битных процессоров ARM
  *) echo "Unknown architecture $(uname -m)"; exit 1 ;; # Завершить работу, если архитектура не поддерживается
esac
```

## Загрузка tar-архивов для каждого компонента ClickHouse \{#download-tarballs\}

Загрузите tar-архивы для каждого компонента ClickHouse. Цикл сначала пытается скачать архитектурно-специфичные
пакеты, затем при необходимости переходит к универсальным.

```bash
for PKG in clickhouse-common-static clickhouse-common-static-dbg clickhouse-server clickhouse-client clickhouse-keeper
do
  curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION-${ARCH}.tgz" \
    || curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION.tgz"
done
```

## Распаковка и установка пакетов \{#extract-and-install\}

Выполните приведённые ниже команды для распаковки и установки следующих пакетов:
- `clickhouse-common-static`

```bash
# Распаковать и установить пакет clickhouse-common-static
tar -xzvf "clickhouse-common-static-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-$LATEST_VERSION/install/doinst.sh"
```

- `clickhouse-common-static-dbg`

```bash
# Распаковать и установить пакет с отладочными символами
tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-dbg-$LATEST_VERSION/install/doinst.sh"
```

- `clickhouse-server`

```bash
# Распаковать и установить серверный пакет с конфигурацией
tar -xzvf "clickhouse-server-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-server-$LATEST_VERSION.tgz"
sudo "clickhouse-server-$LATEST_VERSION/install/doinst.sh" configure
sudo /etc/init.d/clickhouse-server start  # Запустить сервер
```

- `clickhouse-client`

```bash
# Распаковать и установить клиентский пакет
tar -xzvf "clickhouse-client-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-client-$LATEST_VERSION.tgz"
sudo "clickhouse-client-$LATEST_VERSION/install/doinst.sh"
```

</VerticalStepper>