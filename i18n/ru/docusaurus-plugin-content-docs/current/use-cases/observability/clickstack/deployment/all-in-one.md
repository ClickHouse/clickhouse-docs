---
slug: /use-cases/observability/clickstack/deployment/all-in-one
title: "Всё в одном"
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: "Развертывание ClickStack в конфигурации «Всё в одном» — стек наблюдаемости ClickHouse"
doc_type: "guide"
keywords: ["ClickStack", "observability", "all-in-one", "deployment"]
---

import JSONSupport from "@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md"
import Image from "@theme/IdealImage"
import hyperdx_login from "@site/static/images/use-cases/observability/hyperdx-login.png"
import hyperdx_logs from "@site/static/images/use-cases/observability/hyperdx-logs.png"

Этот комплексный Docker-образ включает все компоненты ClickStack:

- **ClickHouse**
- **HyperDX**
- **Коллектор OpenTelemetry (OTel)** (предоставляет OTLP на портах `4317` и `4318`)
- **MongoDB** (для сохранения состояния приложения)

Эта конфигурация включает аутентификацию, обеспечивая сохранение дашбордов, оповещений и сохраненных поисковых запросов между сеансами и для разных пользователей.

### Подходит для {#suitable-for}

- Демонстраций
- Локального тестирования полного стека


## Шаги развертывания {#deployment-steps}

<br />

<VerticalStepper headerLevel="h3">

### Развертывание с помощью Docker {#deploy-with-docker}

Следующая команда запустит сборщик OpenTelemetry (на портах 4317 и 4318) и пользовательский интерфейс HyperDX (на порту 8080).

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### Переход к пользовательскому интерфейсу HyperDX {#navigate-to-hyperdx-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080) для доступа к пользовательскому интерфейсу HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующие требованиям.

При нажатии на кнопку `Create` будут созданы источники данных для интегрированного экземпляра ClickHouse.

<Image img={hyperdx_login} alt='Пользовательский интерфейс HyperDX' size='lg' />

Пример использования альтернативного экземпляра ClickHouse см. в разделе [«Создание подключения к ClickHouse Cloud»](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).

### Загрузка данных {#ingest-data}

Информацию о загрузке данных см. в разделе [«Загрузка данных»](/use-cases/observability/clickstack/ingesting-data).

</VerticalStepper>


## Сохранение данных и настроек {#persisting-data-and-settings}

Для сохранения данных и настроек между перезапусками контейнера необходимо изменить приведенную выше команду docker, добавив монтирование путей `/data/db`, `/var/lib/clickhouse` и `/var/log/clickhouse-server`. Например:


```shell
# создание необходимых директорий
mkdir -p .volumes/db .volumes/ch_data .volumes/ch_logs
# модификация команды для монтирования путей
docker run \
  -p 8080:8080 \
  -p 4317:4317 \
  -p 4318:4318 \
  -v "$(pwd)/.volumes/db:/data/db" \
  -v "$(pwd)/.volumes/ch_data:/var/lib/clickhouse" \
  -v "$(pwd)/.volumes/ch_logs:/var/log/clickhouse-server" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```


## Развертывание в production {#deploying-to-production}

Этот вариант не следует использовать в production по следующим причинам:

- **Непостоянное хранилище:** Все данные хранятся с использованием встроенной файловой системы overlay Docker. Такая конфигурация не обеспечивает производительность при масштабировании, и данные будут потеряны при удалении или перезапуске контейнера — если только пользователи не [смонтируют необходимые пути к файлам](#persisting-data-and-settings).
- **Отсутствие изоляции компонентов:** Все компоненты работают в одном контейнере Docker. Это препятствует независимому масштабированию и мониторингу, а также применяет любые ограничения `cgroup` глобально ко всем процессам. В результате компоненты могут конкурировать за ресурсы CPU и память.


## Настройка портов {#customizing-ports-deploy}

Если необходимо изменить порты приложения (8080) или API (8000), на которых работает HyperDX Local, нужно модифицировать команду `docker run` для перенаправления соответствующих портов и установки нескольких переменных окружения.

Порты OpenTelemetry можно настроить простым изменением флагов перенаправления портов. Например, замена `-p 4318:4318` на `-p 4999:4318` изменит HTTP-порт OpenTelemetry на 4999.

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4999:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```


## Использование ClickHouse Cloud {#using-clickhouse-cloud}

Данный дистрибутив можно использовать с ClickHouse Cloud. Несмотря на то, что локальный экземпляр ClickHouse всё равно будет развёрнут (но не будет использоваться), коллектор OTel можно настроить для работы с экземпляром ClickHouse Cloud, задав переменные окружения `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USER` и `CLICKHOUSE_PASSWORD`.

Например:

```shell
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

Значение `CLICKHOUSE_ENDPOINT` должно содержать HTTPS-адрес конечной точки ClickHouse Cloud, включая порт `8443`, например: `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

После подключения к интерфейсу HyperDX перейдите в раздел [`Team Settings`](http://localhost:8080/team) и создайте подключение к вашему сервису ClickHouse Cloud, а затем настройте необходимые источники данных. Пример процесса настройки см. [здесь](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).


## Настройка сборщика OpenTelemetry {#configuring-collector}

При необходимости конфигурацию сборщика OTel можно изменить — см. раздел ["Изменение конфигурации"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration).

<JSONSupport />

Например:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```
