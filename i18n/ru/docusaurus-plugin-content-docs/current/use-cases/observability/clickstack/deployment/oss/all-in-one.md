---
slug: /use-cases/observability/clickstack/deployment/all-in-one
title: 'Все в одном'
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: 'Развертывание ClickStack Open Source в конфигурации All In One — стек обсервабилити ClickHouse'
doc_type: 'guide'
keywords: ['ClickStack Open Source ', 'обсервабилити', 'все-в-одном', 'развертывание']
---

import JSONSupport from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';
import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';

Этот универсальный Docker-образ включает все компоненты ClickStack с открытым исходным кодом:

* **ClickHouse**
* **HyperDX**
* **коллектор OpenTelemetry (OTel)** (открывает OTLP на портах `4317` и `4318`)
* **MongoDB** (для постоянного хранения состояния приложения)

В этом варианте включена аутентификация, что позволяет сохранять панели мониторинга, оповещения и сохранённые поисковые запросы между сеансами и пользователями.


### Подходит для \{#suitable-for\}

* Демонстраций
* Локального тестирования полного стека

## Шаги развертывания \{#deployment-steps\}

<br/>

<VerticalStepper headerLevel="h3">

### Развертывание с помощью Docker \{#deploy-with-docker\}

Следующая команда запустит коллектор OpenTelemetry (на портах 4317 и 4318) и интерфейс HyperDX (на порту 8080).

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```

:::note Обновление имени образа
Образы ClickStack теперь публикуются как `clickhouse/clickstack-*` (ранее `docker.hyperdx.io/hyperdx/*`).
:::

### Переход к интерфейсу HyperDX \{#navigate-to-hyperdx-ui\}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы открыть интерфейс HyperDX.

Создайте пользователя, указав имя пользователя и пароль, который соответствует требованиям. 

После нажатия кнопки `Create` для встроенного экземпляра ClickHouse будут созданы источники данных.

<Image img={hyperdx_login} alt="Интерфейс HyperDX" size="lg"/>

Пример использования альтернативного экземпляра ClickHouse см. в разделе ["Создание подключения ClickHouse Cloud"](/use-cases/observability/clickstack/getting-started/oss#create-a-cloud-connection).

### Приём данных \{#ingest-data\}

Инструкции по приёму данных см. в разделе ["Ingesting data"](/use-cases/observability/clickstack/ingesting-data).

</VerticalStepper>

## Сохранение данных и настроек \{#persisting-data-and-settings\}

Чтобы сохранять данные и настройки между перезапусками контейнера, вы можете изменить приведённую выше команду Docker, чтобы смонтировать каталоги по путям `/data/db`, `/var/lib/clickhouse` и `/var/log/clickhouse-server`. Например:

```shell
# ensure directories exist
mkdir -p .volumes/db .volumes/ch_data .volumes/ch_logs
# modify command to mount paths
docker run \
  -p 8080:8080 \
  -p 4317:4317 \
  -p 4318:4318 \
  -v "$(pwd)/.volumes/db:/data/db" \
  -v "$(pwd)/.volumes/ch_data:/var/lib/clickhouse" \
  -v "$(pwd)/.volumes/ch_logs:/var/log/clickhouse-server" \
  clickhouse/clickstack-all-in-one:latest
```


## Развертывание в продуктивной среде \{#deploying-to-production\}

Этот вариант не следует использовать в продуктивной среде по следующим причинам:

- **Непостоянное (неперсистентное) хранилище:** Все данные сохраняются с использованием нативной overlay‑файловой системы Docker. Такая конфигурация не обеспечивает необходимую производительность при масштабировании, а данные будут потеряны при удалении или перезапуске контейнера, если только пользователи не [смонтируют необходимые файловые пути](#persisting-data-and-settings).
- **Отсутствие изоляции компонентов:** Все компоненты запускаются внутри одного контейнера Docker. Это не позволяет независимо масштабировать и мониторить их, а также приводит к тому, что любые ограничения `cgroup` применяются глобально ко всем процессам. В результате компоненты могут конкурировать за ресурсы CPU и оперативную память.

## Настройка портов \{#customizing-ports-deploy\}

Если вам нужно изменить порты приложения (8080) или API (8000), которые использует HyperDX Local, необходимо изменить команду `docker run`, чтобы пробросить соответствующие порты и задать несколько переменных окружения.

Порты OpenTelemetry можно настроить, просто изменив флаги проброса портов. Например, заменив `-p 4318:4318` на `-p 4999:4318`, вы измените HTTP-порт OpenTelemetry на 4999.

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4999:4318 clickhouse/clickstack-all-in-one:latest
```


## Использование ClickHouse Cloud \{#using-clickhouse-cloud\}

Этот дистрибутив можно использовать с ClickHouse Cloud. Хотя локальный экземпляр ClickHouse по‑прежнему будет развёрнут (но не будет использоваться), OTel collector можно настроить на использование экземпляра ClickHouse Cloud, задав переменные среды `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USER` и `CLICKHOUSE_PASSWORD`.

Например:

```shell
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```

`CLICKHOUSE_ENDPOINT` должен указывать на HTTPS-эндпоинт ClickHouse Cloud, включая порт `8443`, например: `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

После входа в интерфейс HyperDX перейдите в [`Team Settings`](http://localhost:8080/team) и создайте подключение к вашему сервису ClickHouse Cloud, а затем настройте необходимые источники. Пример последовательности действий см. [здесь](/use-cases/observability/clickstack/getting-started/oss#create-a-cloud-connection).


## Настройка OTel collector \{#configuring-collector\}

Конфигурацию OTel collector при необходимости можно изменить — см. раздел [&quot;Изменение конфигурации&quot;](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration).

<JSONSupport />

Например:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```
