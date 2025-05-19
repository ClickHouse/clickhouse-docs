# Установка ClickHouse с использованием архивов tgz

> Рекомендуется использовать официальные предварительно скомпилированные `tgz` архивы для всех дистрибутивов Linux, где установка пакетов `deb` или `rpm` невозможна.

<VerticalStepper>

## Скачивание и установка последней стабильной версии {#install-latest-stable}

Необходимую версию можно скачать с помощью `curl` или `wget` из репозитория https://packages.clickhouse.com/tgz/.
После этого загруженные архивы должны быть разархивированы и установлены с помощью установочных скриптов.

Ниже приведен пример установки последней стабильной версии.

:::note
Для производственных сред рекомендуется использовать последнюю `stable`-версию.
Вы можете найти номер релиза на этой [странице GitHub](https://github.com/ClickHouse/ClickHouse/tags)
с постфиксом `-stable`.
:::

## Получение последней версии ClickHouse {#get-latest-version}

Получите последнюю версию ClickHouse из GitHub и сохраните ее в переменной `LATEST_VERSION`.

```bash
LATEST_VERSION=$(curl -s https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION
```

## Определение архитектуры вашей системы {#detect-system-architecture}

Определите архитектуру системы и установите переменную ARCH соответствующим образом:

```bash
case $(uname -m) in
  x86_64) ARCH=amd64 ;;         # Для процессоров Intel/AMD 64-бит
  aarch64) ARCH=arm64 ;;        # Для ARM 64-бит
  *) echo "Неизвестная архитектура $(uname -m)"; exit 1 ;; # Выйти, если архитектура не поддерживается
esac
```

## Скачивание tarball'ов для каждого компонента ClickHouse {#download-tarballs}

Скачайте tarball'ы для каждого компонента ClickHouse. Цикл сначала пытается получить пакеты, специфичные для архитектуры, а затем переходит на общие.

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

# Извлечение и установка пакета clickhouse-common-static
tar -xzvf "clickhouse-common-static-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-$LATEST_VERSION/install/doinst.sh"
```


- `clickhouse-common-static-dbg`

```bash

# Извлечение и установка пакета отладочных символов
tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-dbg-$LATEST_VERSION/install/doinst.sh"
```

- `clickhouse-server`

```bash

# Извлечение и установка серверного пакета с конфигурацией
tar -xzvf "clickhouse-server-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-server-$LATEST_VERSION.tgz"
sudo "clickhouse-server-$LATEST_VERSION/install/doinst.sh" configure
sudo /etc/init.d/clickhouse-server start  # Запуск сервера
```

- `clickhouse-client`

```bash

# Извлечение и установка клиентского пакета
tar -xzvf "clickhouse-client-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-client-$LATEST_VERSION.tgz"
sudo "clickhouse-client-$LATEST_VERSION/install/doinst.sh"
```

</VerticalStepper>
