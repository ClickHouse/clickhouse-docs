---
slug: /use-cases/observability/clickstack/deployment/docker-compose
title: 'Docker Compose'
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'Развертывание ClickStack с использованием Docker Compose — стек наблюдаемости ClickHouse'
doc_type: 'guide'
keywords: ['ClickStack с Docker Compose', 'Docker Compose для ClickHouse', 'Развертывание HyperDX в Docker', 'Руководство по развертыванию ClickStack', 'OpenTelemetry Docker Compose']
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

Все компоненты ClickStack распространяются отдельно в виде отдельных Docker-образов:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB**

Эти образы можно комбинировать и развёртывать локально с помощью Docker Compose.

Docker Compose открывает дополнительные порты для наблюдаемости и ингестии на основе стандартной конфигурации `otel-collector`:

* `13133`: endpoint проверки работоспособности для расширения `health_check`
* `24225`: Fluentd‑приёмник для приёма логов
* `4317`: OTLP gRPC‑приёмник (стандарт для трейсов, логов и метрик)
* `4318`: OTLP HTTP‑приёмник (альтернатива gRPC)
* `8888`: endpoint метрик Prometheus для мониторинга самого коллектора

Эти порты обеспечивают интеграцию с различными источниками телеметрии и делают OpenTelemetry collector готовым к промышленной эксплуатации для разнообразных сценариев ингестии.

### Подходит для

* Локального тестирования
* Proof-of-concept‑экспериментов
* Промышленных развертываний, где отказоустойчивость не требуется и одного сервера достаточно для размещения всех данных ClickHouse
* Сценариев, когда ClickStack развёртывается, а ClickHouse размещается отдельно, например с использованием ClickHouse Cloud.


## Шаги развертывания {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Клонирование репозитория {#clone-the-repo}

Чтобы выполнить развертывание с помощью Docker Compose, клонируйте репозиторий HyperDX, перейдите в созданный каталог и выполните команду `docker-compose up`:

```shell
git clone git@github.com:hyperdxio/hyperdx.git
docker compose up
```

### Перейдите в интерфейс HyperDX {#navigate-to-hyperdx-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы открыть интерфейс HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующие требованиям. 

После нажатия кнопки `Create` будут созданы источники данных для экземпляра ClickHouse, развернутого с помощью Helm-чарта.

:::note Переопределение подключения по умолчанию
Вы можете переопределить подключение по умолчанию к встроенному экземпляру ClickHouse. Подробности см. в разделе ["Использование ClickHouse Cloud"](#using-clickhouse-cloud).
:::

<Image img={hyperdx_login} alt="Интерфейс HyperDX" size="lg"/>

Пример использования альтернативного экземпляра ClickHouse приведён в разделе ["Создание подключения ClickHouse Cloud"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).

### Заполните сведения о подключении {#complete-connection-details}

Чтобы подключиться к развернутому экземпляру ClickHouse, просто нажмите **Create** и примите настройки по умолчанию.  

Если вы предпочитаете подключиться к собственному **внешнему кластеру ClickHouse**, например ClickHouse Cloud, вы можете вручную ввести учетные данные подключения.

Если вам будет предложено создать источник, сохраните все значения по умолчанию и заполните поле `Table` значением `otel_logs`. Все остальные настройки должны быть определены автоматически, после чего вы сможете нажать `Save New Source`.

<Image img={hyperdx_logs} alt="Создание источника логов" size="md"/>

</VerticalStepper>



## Изменение настроек Compose {#modifying-settings}

Вы можете изменять настройки стека, например используемую версию, с помощью файла с переменными окружения:



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
```


# Настройка доменных URL-адресов
HYPERDX_API_PORT=8000 # необязательно (порт не должен использоваться другими сервисами)
HYPERDX_APP_PORT=8080
HYPERDX_APP_URL=http://localhost
HYPERDX_LOG_LEVEL=debug
HYPERDX_OPAMP_PORT=4320



# Конфигурация OTel/ClickHouse

HYPERDX&#95;OTEL&#95;EXPORTER&#95;CLICKHOUSE&#95;DATABASE=default

```

### Настройка OpenTelemetry collector {#configuring-collector}

При необходимости конфигурацию OTel collector можно изменить — см. ["Изменение конфигурации"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration).
```


## Использование ClickHouse Cloud

Этот дистрибутив может использоваться с ClickHouse Cloud. Пользователям следует:

* Удалить сервис ClickHouse из файла `docker-compose.yaml`. Это необязательно при тестировании, так как развернутый экземпляр ClickHouse просто будет игнорироваться, хотя и будет потреблять локальные ресурсы. При удалении сервиса убедитесь, что все ссылки на этот сервис, такие как `depends_on`, также удалены.

* Настроить OTel collector на использование экземпляра ClickHouse Cloud, задав переменные окружения `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USER` и `CLICKHOUSE_PASSWORD` в compose-файле. В частности, добавьте переменные окружения в сервис OTel collector:

  ```shell
  otel-collector:
      image: ${OTEL_COLLECTOR_IMAGE_NAME}:${IMAGE_VERSION}
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

  Значение `CLICKHOUSE_ENDPOINT` должно быть HTTPS-эндпоинтом ClickHouse Cloud, включая порт `8443`, например: `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

* При подключении к интерфейсу HyperDX и создании подключения к ClickHouse используйте свои учетные данные ClickHouse Cloud.

<JSONSupport />

Чтобы задать эти значения, измените соответствующие сервисы в `docker-compose.yaml`:

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
