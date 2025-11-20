---
slug: /use-cases/observability/clickstack/deployment/all-in-one
title: "Всё в одном"
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: "Развертывание ClickStack в режиме «Всё в одном» — стек наблюдаемости ClickHouse"
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

Этот вариант включает аутентификацию, обеспечивая сохранение дашбордов, алертов и сохраненных поисковых запросов между сеансами и пользователями.

### Подходит для {#suitable-for}

- Демонстраций
- Локального тестирования полного стека


## Шаги развертывания {#deployment-steps}

<br />

<VerticalStepper headerLevel="h3">

### Развертывание с помощью Docker {#deploy-with-docker}

Следующая команда запустит коллектор OpenTelemetry (на портах 4317 и 4318) и веб-интерфейс HyperDX (на порту 8080).

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### Переход к веб-интерфейсу HyperDX {#navigate-to-hyperdx-ui}

Откройте [http://localhost:8080](http://localhost:8080) для доступа к веб-интерфейсу HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующие требованиям.

При нажатии `Create` будут созданы источники данных для интегрированного экземпляра ClickHouse.

<Image img={hyperdx_login} alt='Веб-интерфейс HyperDX' size='lg' />

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

Этот вариант не следует развертывать в production по следующим причинам:

- **Непостоянное хранилище:** Все данные хранятся с использованием встроенной overlay-файловой системы Docker. Такая конфигурация не обеспечивает производительность при масштабировании, и данные будут потеряны при удалении или перезапуске контейнера — если только пользователи не [смонтируют необходимые пути к файлам](#persisting-data-and-settings).
- **Отсутствие изоляции компонентов:** Все компоненты работают внутри одного Docker-контейнера. Это препятствует независимому масштабированию и мониторингу, а также применяет любые ограничения `cgroup` глобально ко всем процессам. В результате компоненты могут конкурировать за ресурсы CPU и памяти.


## Настройка портов {#customizing-ports-deploy}

Если необходимо изменить порты приложения (8080) или API (8000), на которых работает HyperDX Local, нужно модифицировать команду `docker run` для проброса соответствующих портов и установки нескольких переменных окружения.

Порты OpenTelemetry настраиваются простым изменением флагов проброса портов. Например, замена `-p 4318:4318` на `-p 4999:4318` изменит HTTP-порт OpenTelemetry на 4999.

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4999:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```


## Использование ClickHouse Cloud {#using-clickhouse-cloud}

Этот дистрибутив можно использовать с ClickHouse Cloud. Хотя локальный экземпляр ClickHouse всё равно будет развёрнут (и не будет использоваться), коллектор OTel можно настроить для работы с экземпляром ClickHouse Cloud, задав переменные окружения `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USER` и `CLICKHOUSE_PASSWORD`.

Например:

```shell
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

Значение `CLICKHOUSE_ENDPOINT` должно содержать HTTPS-эндпоинт ClickHouse Cloud, включая порт `8443`, например: `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

После подключения к интерфейсу HyperDX перейдите в раздел [`Team Settings`](http://localhost:8080/team) и создайте подключение к вашему сервису ClickHouse Cloud, а затем настройте необходимые источники данных. Пример процесса см. [здесь](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).


## Настройка коллектора OpenTelemetry {#configuring-collector}

При необходимости конфигурацию коллектора OTel можно изменить — см. раздел ["Изменение конфигурации"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration).

<JSONSupport />

Например:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```
