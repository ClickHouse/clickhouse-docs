---
slug: /use-cases/observability/clickstack/deployment/all-in-one
title: 'Все в одном'
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: 'Развертывание ClickStack по схеме «все в одном» — стек наблюдаемости ClickHouse'
doc_type: 'guide'
keywords: ['ClickStack', 'наблюдаемость', 'все-в-одном', 'развертывание']
---

import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';
import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';

Этот универсальный Docker-образ включает все компоненты ClickStack:

* **ClickHouse**
* **HyperDX**
* **Сборщик OpenTelemetry (OTel)** (экспортирует OTLP на портах `4317` и `4318`)
* **MongoDB** (для сохранения состояния приложения)

Этот вариант поддерживает аутентификацию, позволяя сохранять панели мониторинга, оповещения и сохранённые поисковые запросы между сеансами и пользователями.

### Подходит для

* Демонстраций
* Локального тестирования полного стека


## Этапы развертывания {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Развертывание с помощью Docker {#deploy-with-docker}

Следующая команда запустит коллектор OpenTelemetry (на портах 4317 и 4318) и интерфейс HyperDX (на порту 8080).

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### Откройте интерфейс HyperDX {#navigate-to-hyperdx-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы открыть интерфейс HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующий требованиям. 

После нажатия кнопки `Create` будут созданы источники данных для встроенного экземпляра ClickHouse.

<Image img={hyperdx_login} alt="Интерфейс HyperDX" size="lg"/>

Пример использования альтернативного экземпляра ClickHouse см. в разделе ["Создание подключения ClickHouse Cloud"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).

### Приём данных {#ingest-data}

Инструкции по приёму данных см. в разделе ["Приём данных"](/use-cases/observability/clickstack/ingesting-data).

</VerticalStepper>



## Постоянное хранение данных и настроек {#persisting-data-and-settings}

Чтобы сохранять данные и настройки при перезапусках контейнера, пользователи могут изменить приведённую выше docker-команду, смонтировав каталоги `/data/db`, `/var/lib/clickhouse` и `/var/log/clickhouse-server`. Например:



```shell
# убедитесь, что каталоги существуют
mkdir -p .volumes/db .volumes/ch_data .volumes/ch_logs
# измените команду для монтирования путей
docker run \
  -p 8080:8080 \
  -p 4317:4317 \
  -p 4318:4318 \
  -v "$(pwd)/.volumes/db:/data/db" \
  -v "$(pwd)/.volumes/ch_data:/var/lib/clickhouse" \
  -v "$(pwd)/.volumes/ch_logs:/var/log/clickhouse-server" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```


## Развертывание в продуктивной среде {#deploying-to-production}

Этот вариант не следует использовать в продуктивной среде по следующим причинам:

- **Непостоянное хранилище данных:** Все данные сохраняются с использованием нативной overlay‑файловой системы Docker. Такая конфигурация не обеспечивает производительности при масштабировании, а данные будут потеряны при удалении или перезапуске контейнера, если только не будут [смонтированы необходимые файловые пути](#persisting-data-and-settings).
- **Отсутствие изоляции компонентов:** Все компоненты работают в одном Docker-контейнере. Это не позволяет независимо масштабировать и мониторить их, а также означает, что любые ограничения `cgroup` применяются глобально ко всем процессам. В результате компоненты могут конкурировать за ресурсы CPU и памятью.



## Настройка портов

Если вам нужно изменить порты приложения (8080) или API (8000), на которых запускается HyperDX Local, вам потребуется изменить команду `docker run`, чтобы пробросить соответствующие порты и задать несколько переменных окружения.

Порты OpenTelemetry можно изменить, просто скорректировав параметры проброса портов. Например, заменить `-p 4318:4318` на `-p 4999:4318`, чтобы изменить HTTP-порт OpenTelemetry на 4999.

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4999:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```


## Использование ClickHouse Cloud

Этот дистрибутив можно использовать с ClickHouse Cloud. При этом локальный экземпляр ClickHouse по-прежнему будет развернут, но не использоваться, а OTel collector можно настроить на работу с экземпляром ClickHouse Cloud, задав переменные окружения `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USER` и `CLICKHOUSE_PASSWORD`.

Например:

```shell
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

`CLICKHOUSE_ENDPOINT` должен быть HTTPS-эндпоинтом ClickHouse Cloud с указанием порта `8443`, например `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

После подключения к интерфейсу HyperDX перейдите в [`Team Settings`](http://localhost:8080/team) и создайте подключение к вашему сервису ClickHouse Cloud, а затем добавьте необходимые источники. Пример последовательности действий см. [здесь](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).


## Настройка коллектора OTel

Конфигурацию коллектора OTel при необходимости можно изменить — см. раздел [&quot;Изменение конфигурации&quot;](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration).

<JSONSupport />

Например:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```
