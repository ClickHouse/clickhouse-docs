---
slug: /use-cases/observability/clickstack/deployment/docker-compose
title: 'Docker Compose'
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'Развертывание ClickStack с помощью Docker Compose — стек наблюдаемости ClickHouse'
doc_type: 'guide'
keywords: ['ClickStack Docker Compose', 'Docker Compose ClickHouse', 'Развертывание HyperDX в Docker', 'Руководство по развертыванию ClickStack', 'OpenTelemetry Docker Compose']
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

Все компоненты ClickStack распространяются отдельно в виде отдельных Docker-образов:

* **ClickHouse**
* **HyperDX**
* **коллектор OpenTelemetry (OTel)**
* **MongoDB**

Эти образы можно комбинировать и разворачивать локально с помощью Docker Compose.

Docker Compose открывает дополнительные порты для наблюдаемости и ингестии на основе стандартной конфигурации `otel-collector`:

* `13133`: конечная точка проверки работоспособности для расширения `health_check`
* `24225`: приёмник Fluentd для приёма логов
* `4317`: приёмник OTLP gRPC (стандарт для трейсов, логов и метрик)
* `4318`: приёмник OTLP HTTP (альтернатива gRPC)
* `8888`: конечная точка метрик Prometheus для мониторинга самого коллектора

Эти порты обеспечивают интеграцию с широким набором источников телеметрии и делают коллектор OpenTelemetry готовым к промышленной эксплуатации для различных сценариев ингестии.


### Подходит для {#suitable-for}

* Локального тестирования
* Создания прототипов и пилотных решений (proof of concept)
* Боевых развертываний, где отказоустойчивость не требуется и одного сервера достаточно для размещения всех данных ClickHouse
* При развертывании ClickStack, но отдельном размещении ClickHouse, например, с использованием ClickHouse Cloud.

## Шаги развертывания {#deployment-steps}

<br/>

<VerticalStepper headerLevel="h3">

### Клонирование репозитория {#clone-the-repo}

Чтобы развернуть с помощью Docker Compose, клонируйте репозиторий HyperDX, перейдите в каталог и выполните `docker-compose up`:

```shell
git clone git@github.com:hyperdxio/hyperdx.git
docker compose up
```

### Переход к интерфейсу HyperDX {#navigate-to-hyperdx-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы открыть интерфейс HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующие требованиям. 

При нажатии `Create` будут созданы источники данных для экземпляра ClickHouse, развернутого с помощью Helm-чарта.

:::note Переопределение подключения по умолчанию
Вы можете переопределить подключение по умолчанию к интегрированному экземпляру ClickHouse. Подробности см. в разделе ["Использование ClickHouse Cloud"](#using-clickhouse-cloud).
:::

<Image img={hyperdx_login} alt="Интерфейс HyperDX" size="lg"/>

Пример использования альтернативного экземпляра ClickHouse см. в разделе ["Создание подключения к ClickHouse Cloud"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).

### Заполнение сведений о подключении {#complete-connection-details}

Чтобы подключиться к развернутому экземпляру ClickHouse, просто нажмите **Create** и примите значения по умолчанию.  

Если вы предпочитаете подключиться к своему **внешнему кластеру ClickHouse**, например ClickHouse Cloud, вы можете вручную ввести учетные данные подключения.

Если будет предложено создать источник, сохраните все значения по умолчанию и заполните поле `Table` значением `otel_logs`. Все остальные параметры должны быть автоматически определены, после чего вы сможете нажать `Save New Source`.

<Image img={hyperdx_logs} alt="Создание источника логов" size="md"/>

</VerticalStepper>

## Изменение настроек Compose

Пользователи могут изменять настройки стека, например используемую версию, через файл с переменными окружения:

```shell
user@example-host hyperdx % cat .env
# Используется в docker-compose.yml
# Используется в docker-compose.yml
HDX_IMAGE_REPO=docker.hyperdx.io
IMAGE_NAME=ghcr.io/hyperdxio/hyperdx
IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx
LOCAL_IMAGE_NAME=ghcr.io/hyperdxio/hyperdx-local
LOCAL_IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx-local
ALL_IN_ONE_IMAGE_NAME=ghcr.io/hyperdxio/hyperdx-all-in-one
ALL_IN_ONE_IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx-all-in-one
OTEL_COLLECTOR_IMAGE_NAME=ghcr.io/hyperdxio/hyperdx-otel-collector
OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx-otel-collector
CODE_VERSION=2.0.0-beta.16
IMAGE_VERSION_SUB_TAG=.16
IMAGE_VERSION=2-beta
IMAGE_NIGHTLY_TAG=2-nightly

# Настройка URL доменов
HYPERDX_API_PORT=8000 #необязательно (не должен быть занят другими сервисами)
HYPERDX_APP_PORT=8080
HYPERDX_APP_URL=http://localhost
HYPERDX_LOG_LEVEL=debug
HYPERDX_OPAMP_PORT=4320

# Конфигурация OTel/ClickHouse
HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE=default
```


### Настройка коллектора OTel {#configuring-collector}

Конфигурацию коллектора OTel можно изменить при необходимости — см. раздел ["Изменение конфигурации"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration).

## Использование ClickHouse Cloud

Этот дистрибутив можно использовать с ClickHouse Cloud. Пользователям следует:

* Удалить сервис ClickHouse из файла `docker-compose.yaml`. Это необязательно при тестировании, так как развернутый экземпляр ClickHouse просто будет игнорироваться, хотя и будет расходовать локальные ресурсы. При удалении сервиса убедитесь, что удалены все ссылки на него, такие как `depends_on`.

* Изменить OTel collector для использования экземпляра ClickHouse Cloud, задав переменные окружения `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USER` и `CLICKHOUSE_PASSWORD` в файле `docker-compose.yaml`. В частности, добавьте переменные окружения в сервис OTel collector:

  ```shell
  otel-collector:
      image: ${OTEL_COLLECTOR_IMAGE_NAME}:${IMAGE_VERSION}
      environment:
        CLICKHOUSE_ENDPOINT: '<CLICKHOUSE_ENDPOINT>' # HTTPS endpoint here
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

  Переменная `CLICKHOUSE_ENDPOINT` должна указывать на HTTPS-эндпоинт ClickHouse Cloud, включая порт `8443`, например `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

* При подключении к интерфейсу HyperDX и создании подключения к ClickHouse используйте свои учетные данные ClickHouse Cloud.

<JSONSupport />

Чтобы их задать, измените соответствующие сервисы в файле `docker-compose.yaml`:

```yaml
  app:
    image: ${HDX_IMAGE_REPO}/${IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
    ports:
      - ${HYPERDX_API_PORT}:${HYPERDX_API_PORT}
      - ${HYPERDX_APP_PORT}:${HYPERDX_APP_PORT}
    environment:
      BETA_CH_OTEL_JSON_SCHEMA_ENABLED: true # включение JSON
      FRONTEND_URL: ${HYPERDX_APP_URL}:${HYPERDX_APP_PORT}
      HYPERDX_API_KEY: ${HYPERDX_API_KEY}
      HYPERDX_API_PORT: ${HYPERDX_API_PORT}
    # сокращено для краткости

  otel-collector:
    image: ${HDX_IMAGE_REPO}/${OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
    environment:
      OTEL_AGENT_FEATURE_GATE_ARG: '--feature-gates=clickhouse.json' # включение JSON
      CLICKHOUSE_ENDPOINT: 'tcp://ch-server:9000?dial_timeout=10s' 
      # сокращено для краткости
```
