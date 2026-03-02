---
slug: /use-cases/observability/clickstack/deployment/docker-compose
title: 'Docker Compose'
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'Развертывание ClickStack с открытым исходным кодом с помощью Docker Compose — стек обсервабилити ClickHouse'
doc_type: 'guide'
keywords: ['ClickStack Docker Compose', 'Docker Compose ClickHouse', 'HyperDX Docker deployment', 'ClickStack deployment guide', 'OpenTelemetry Docker Compose']
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import JSONSupport from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

Все компоненты ClickStack Open Source распространяются отдельно в виде отдельных Docker-образов:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB**

Эти образы можно комбинировать и развёртывать локально с помощью Docker Compose.

Docker Compose открывает дополнительные порты для обсервабилити и ингестии на основе стандартной конфигурации `otel-collector`:

* `13133`: endpoint проверки работоспособности для расширения `health_check`
* `24225`: Fluentd-приёмник для ингестии логов
* `4317`: OTLP gRPC-приёмник (стандарт для трейсов, логов и метрик)
* `4318`: OTLP HTTP-приёмник (альтернатива gRPC)
* `8888`: endpoint метрик Prometheus для мониторинга самого коллектора

Эти порты обеспечивают интеграцию с различными источниками телеметрии и делают OpenTelemetry collector готовым к эксплуатации в продакшене для разнообразных сценариев ингестии.


### Подходит для \{#suitable-for\}

* Локального тестирования
* Proof-of-concept проектов / создания прототипов
* Продакшн-развертываний, где отказоустойчивость не требуется, и одного сервера достаточно для размещения всех данных ClickHouse
* При развертывании ClickStack, но размещении ClickHouse отдельно, например с использованием ClickHouse Cloud.

## Шаги развертывания \{#deployment-steps\}

<br/>

<VerticalStepper headerLevel="h3">

### Клонирование репозитория \{#clone-the-repo\}

Чтобы развернуть с помощью Docker Compose, клонируйте репозиторий ClickStack, перейдите в каталог и выполните `docker compose up`:

```shell
git clone https://github.com/ClickHouse/ClickStack.git
docker compose up
```

### Перейдите в интерфейс HyperDX \{#navigate-to-hyperdx-ui\}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы открыть интерфейс HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующий требованиям. 

После нажатия `Create` будут созданы источники данных для экземпляра ClickHouse, развернутого с помощью Docker Compose.

:::note Переопределение подключения по умолчанию
Вы можете переопределить подключение по умолчанию к встроенному экземпляру ClickHouse. Подробнее см. раздел ["Использование ClickHouse Cloud"](#using-clickhouse-cloud).
:::

<Image img={hyperdx_login} alt="Интерфейс HyperDX" size="lg"/>

Пример использования альтернативного экземпляра ClickHouse приведен в разделе ["Использование ClickHouse Cloud"](#using-clickhouse-cloud).

### Заполните данные подключения \{#complete-connection-details\}

Чтобы подключиться к развернутому экземпляру ClickHouse, просто нажмите **Create** и примите настройки по умолчанию.  

Если вы предпочитаете подключиться к собственному **внешнему кластеру ClickHouse**, например ClickHouse Cloud, вы можете вручную ввести свои учетные данные для подключения.

Если будет предложено создать источник, сохраните все значения по умолчанию и заполните поле `Table` значением `otel_logs`. Все остальные настройки должны быть определены автоматически, после чего вы сможете нажать `Save New Source`.

<Image img={hyperdx_logs} alt="Создание источника логов" size="md"/>

</VerticalStepper>

## Изменение настроек Compose \{#modifying-settings\}

Вы можете изменять настройки стека, например используемую версию, через файл с переменными окружения:

```shell
user@example-host clickstack % cat .env

# Used by docker-compose.yml
IMAGE_NAME_DOCKERHUB=clickhouse/clickstack-all-in-one
LOCAL_IMAGE_NAME_DOCKERHUB=clickhouse/clickstack-local
ALL_IN_ONE_IMAGE_NAME_DOCKERHUB=clickhouse/clickstack-all-in-one
OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB=clickhouse/clickstack-otel-collector
CODE_VERSION=2.8.0
IMAGE_VERSION_SUB_TAG=.8.0
IMAGE_VERSION=2
IMAGE_NIGHTLY_TAG=2-nightly
IMAGE_LATEST_TAG=latest

# Set up domain URLs
HYPERDX_API_PORT=8000 #optional (should not be taken by other services)
HYPERDX_APP_PORT=8080
HYPERDX_APP_URL=http://localhost
HYPERDX_LOG_LEVEL=debug
HYPERDX_OPAMP_PORT=4320

# Otel/Clickhouse config
HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE=default
```


### Настройка OTel collector \{#configuring-collector\}

Конфигурацию OTel collector можно при необходимости изменить — см. [«Изменение конфигурации»](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration).

## Использование ClickHouse Cloud \{#using-clickhouse-cloud\}

Этот дистрибутив можно использовать с ClickHouse Cloud, но он отличается от [Managed ClickStack](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud). В этой конфигурации вы самостоятельно управляете UI ClickStack, используя ClickHouse Cloud только для вычислений и хранения. Если у вас нет особой причины управлять UI отдельно, рекомендуется использовать Managed ClickStack, который включает встроенную аутентификацию и дополнительные корпоративные функции и устраняет необходимость самостоятельно управлять UI ClickStack.

Вам необходимо:

* Удалить сервис ClickHouse из файла `docker-compose.yml`. При тестировании это необязательно, так как развернутый экземпляр ClickHouse просто будет игнорироваться, хотя и будет расходовать локальные ресурсы. Если вы удаляете сервис, убедитесь, что любые ссылки на него, такие как `depends_on`, также удалены.

* Настроить OTel collector на использование экземпляра ClickHouse Cloud, задав переменные окружения `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USER` и `CLICKHOUSE_PASSWORD` в compose-файле. В частности, добавьте переменные окружения в сервис OTel collector:

  ```shell
  otel-collector:
      image: ${OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
      environment:
        CLICKHOUSE_ENDPOINT: '<CLICKHOUSE_ENDPOINT>' # https endpoint here
        CLICKHOUSE_USER: '<CLICKHOUSE_USER>'
        CLICKHOUSE_PASSWORD: '<CLICKHOUSE_PASSWORD>'
        HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE: ${HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE}
        HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
        OPAMP_SERVER_URL: 'http://app:${HYPERDX_OPAMP_PORT}'
      ports:
        - '13133:13133' # health_check extension
        - '24225:24225' # fluentd receiver
        - '4317:4317' # OTLP gRPC receiver
        - '4318:4318' # OTLP http receiver
        - '8888:8888' # metrics extension
      restart: always
      networks:
        - internal
  ```

  Значение `CLICKHOUSE_ENDPOINT` должно быть HTTPS-эндпоинтом ClickHouse Cloud, включая порт `8443`, например: `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`.

* Подключившись к UI HyperDX и создавая подключение к ClickHouse, используйте свои учетные данные ClickHouse Cloud.

<JSONSupport />

Чтобы задать эти параметры, измените соответствующие сервисы в `docker-compose.yml`:

```yaml
  app:
    image: ${IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
    ports:
      - ${HYPERDX_API_PORT}:${HYPERDX_API_PORT}
      - ${HYPERDX_APP_PORT}:${HYPERDX_APP_PORT}
    environment:
      BETA_CH_OTEL_JSON_SCHEMA_ENABLED: true # enable JSON
      FRONTEND_URL: ${HYPERDX_APP_URL}:${HYPERDX_APP_PORT}
      HYPERDX_API_KEY: ${HYPERDX_API_KEY}
      HYPERDX_API_PORT: ${HYPERDX_API_PORT}
    # truncated for brevity

  otel-collector:
    image: ${OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
    environment:
      OTEL_AGENT_FEATURE_GATE_ARG: '--feature-gates=clickhouse.json' # enable JSON
      CLICKHOUSE_ENDPOINT: 'tcp://ch-server:9000?dial_timeout=10s' 
      # truncated for brevity
```
