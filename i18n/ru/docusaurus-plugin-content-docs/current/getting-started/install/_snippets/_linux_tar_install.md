# Установка ClickHouse с помощью tgz-архивов {#install-clickhouse-using-tgz-archives}

> Рекомендуется использовать официальные предкомпилированные `tgz`-архивы для всех дистрибутивов Linux, где установка пакетов `deb` или `rpm` невозможна.

<VerticalStepper>

## Загрузка и установка последней стабильной версии {#install-latest-stable}

Необходимую версию можно скачать с помощью `curl` или `wget` из репозитория по адресу https://packages.clickhouse.com/tgz/.
После этого загруженные архивы нужно распаковать и установить с помощью установочных скриптов.

Ниже приведён пример установки последней стабильной версии.

:::note
Для продуктивных (production) сред рекомендуется использовать последнюю стабильную версию (`stable`).
Номер релиза можно найти на этой [странице GitHub](https://github.com/ClickHouse/ClickHouse/tags)
с постфиксом `-stable`.
:::

## Получите последнюю версию ClickHouse {#get-latest-version}

Получите последнюю версию ClickHouse с GitHub и сохраните её в переменной `LATEST_VERSION`.

```bash
LATEST_VERSION=$(curl -s https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION
```

## Определите архитектуру системы {#detect-system-architecture}

Определите архитектуру системы и задайте переменную ARCH соответствующим образом:

```bash
case $(uname -m) in
  x86_64) ARCH=amd64 ;;         # Для 64-битных процессоров Intel/AMD
  aarch64) ARCH=arm64 ;;        # Для 64-битных процессоров ARM
  *) echo "Неизвестная архитектура $(uname -m)"; exit 1 ;; # Выход при неподдерживаемой архитектуре
esac
```

## Загрузка tar-архивов для каждого компонента ClickHouse {#download-tarballs}

Скачайте tar-архивы для каждого компонента ClickHouse. Цикл сначала пытается использовать пакеты, специфичные для архитектуры, затем при необходимости переходит к универсальным.

```bash
for PKG in clickhouse-common-static clickhouse-common-static-dbg clickhouse-server clickhouse-client clickhouse-keeper
do
  curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION-${ARCH}.tgz" \
    || curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION.tgz"
done
```

## Извлечение и установка пакетов {#extract-and-install}

Выполните следующие команды для распаковки и установки этих пакетов:
- `clickhouse-common-static`

```bash
# Извлечение и установка пакета clickhouse-common-static {#extract-and-install-clickhouse-common-static-package}
tar -xzvf "clickhouse-common-static-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-$LATEST_VERSION/install/doinst.sh"
```

* `clickhouse-common-static-dbg`

```bash
# Извлеките и установите пакет отладочных символов {#extract-and-install-debug-symbols-package}
tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-dbg-$LATEST_VERSION/install/doinst.sh"
```

* `clickhouse-server`

```bash
# Извлечение и установка серверного пакета с конфигурацией {#extract-and-install-server-package-with-configuration}
tar -xzvf "clickhouse-server-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-server-$LATEST_VERSION.tgz"
sudo "clickhouse-server-$LATEST_VERSION/install/doinst.sh" configure
sudo /etc/init.d/clickhouse-server start  # Запуск сервера
```

* `clickhouse-client`

```bash
# Извлечь и установить клиентский пакет {#extract-and-install-client-package}
tar -xzvf "clickhouse-client-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-client-$LATEST_VERSION.tgz"
sudo "clickhouse-client-$LATEST_VERSION/install/doinst.sh"
```

</VerticalStepper>
