---
slug: /use-cases/observability/clickstack/deployment/docker-compose
title: "Docker Compose"
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: "Развертывание ClickStack с помощью Docker Compose — стек наблюдаемости ClickHouse"
doc_type: "guide"
keywords:
  [
    "ClickStack Docker Compose",
    "Docker Compose ClickHouse",
    "HyperDX Docker deployment",
    "ClickStack deployment guide",
    "OpenTelemetry Docker Compose"
  ]
---

import Image from "@theme/IdealImage"
import hyperdx_login from "@site/static/images/use-cases/observability/hyperdx-login.png"
import hyperdx_logs from "@site/static/images/use-cases/observability/hyperdx-logs.png"
import JSONSupport from "@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md"

Все компоненты ClickStack распространяются отдельно в виде индивидуальных образов Docker:

- **ClickHouse**
- **HyperDX**
- **Коллектор OpenTelemetry (OTel)**
- **MongoDB**

Эти образы можно объединить и развернуть локально с помощью Docker Compose.

Docker Compose открывает дополнительные порты для наблюдаемости и приема данных на основе стандартной конфигурации `otel-collector`:

- `13133`: конечная точка проверки работоспособности для расширения `health_check`
- `24225`: приемник Fluentd для приема логов
- `4317`: приемник OTLP gRPC (стандарт для трассировок, логов и метрик)
- `4318`: приемник OTLP HTTP (альтернатива gRPC)
- `8888`: конечная точка метрик Prometheus для мониторинга самого коллектора

Эти порты обеспечивают интеграцию с различными источниками телеметрии и делают коллектор OpenTelemetry готовым к промышленной эксплуатации для различных сценариев приема данных.

### Подходит для {#suitable-for}

- Локального тестирования
- Подтверждения концепций
- Промышленных развертываний, где отказоустойчивость не требуется и одного сервера достаточно для размещения всех данных ClickHouse
- Развертывания ClickStack с отдельным размещением ClickHouse, например, с использованием ClickHouse Cloud


## Шаги развертывания {#deployment-steps}

<br />

<VerticalStepper headerLevel="h3">

### Клонирование репозитория {#clone-the-repo}

Для развертывания с помощью Docker Compose клонируйте репозиторий HyperDX, перейдите в каталог и выполните команду `docker-compose up`:

```shell
git clone git@github.com:hyperdxio/hyperdx.git
docker compose up
```

### Переход к интерфейсу HyperDX {#navigate-to-hyperdx-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080) для доступа к интерфейсу HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующие требованиям.

При нажатии кнопки `Create` будут созданы источники данных для экземпляра ClickHouse, развернутого с помощью Helm-чарта.

:::note Переопределение подключения по умолчанию
Вы можете переопределить подключение по умолчанию к интегрированному экземпляру ClickHouse. Подробности см. в разделе [«Использование ClickHouse Cloud»](#using-clickhouse-cloud).
:::

<Image img={hyperdx_login} alt='Интерфейс HyperDX' size='lg' />

Пример использования альтернативного экземпляра ClickHouse см. в разделе [«Создание подключения к ClickHouse Cloud»](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).

### Заполнение параметров подключения {#complete-connection-details}

Для подключения к развернутому экземпляру ClickHouse просто нажмите **Create** и примите настройки по умолчанию.

Если вы предпочитаете подключиться к собственному **внешнему кластеру ClickHouse**, например ClickHouse Cloud, вы можете вручную ввести учетные данные для подключения.

Если появится запрос на создание источника, сохраните все значения по умолчанию и заполните поле `Table` значением `otel_logs`. Все остальные параметры должны быть определены автоматически, после чего вы сможете нажать `Save New Source`.

<Image img={hyperdx_logs} alt='Создание источника логов' size='md' />

</VerticalStepper>


## Изменение настроек compose {#modifying-settings}

Настройки стека, такие как используемая версия, можно изменить через файл переменных окружения:


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
HYPERDX_API_PORT=8000 #необязательно (порт не должен использоваться другими сервисами)
HYPERDX_APP_PORT=8080
HYPERDX_APP_URL=http://localhost
HYPERDX_LOG_LEVEL=debug
HYPERDX_OPAMP_PORT=4320



# Конфигурация Otel/ClickHouse

HYPERDX&#95;OTEL&#95;EXPORTER&#95;CLICKHOUSE&#95;DATABASE=default

```

### Настройка сборщика OpenTelemetry {#configuring-collector}

При необходимости конфигурацию сборщика OTel можно изменить — см. ["Изменение конфигурации"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration).
```


## Использование ClickHouse Cloud {#using-clickhouse-cloud}

Этот дистрибутив можно использовать с ClickHouse Cloud. Для этого необходимо:

- Удалить сервис ClickHouse из файла `docker-compose.yaml`. Это необязательно при тестировании, так как развернутый экземпляр ClickHouse будет просто проигнорирован, хотя и будет расходовать локальные ресурсы. При удалении сервиса убедитесь, что все ссылки на него, такие как `depends_on`, также удалены.
- Изменить конфигурацию OTel collector для использования экземпляра ClickHouse Cloud, установив переменные окружения `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USER` и `CLICKHOUSE_PASSWORD` в compose-файле. В частности, добавьте переменные окружения в сервис OTel collector:

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

  `CLICKHOUSE_ENDPOINT` должен быть HTTPS-эндпоинтом ClickHouse Cloud, включая порт `8443`, например: `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

- При подключении к интерфейсу HyperDX и создании соединения с ClickHouse используйте учетные данные Cloud.

<JSONSupport />

Чтобы задать эти параметры, измените соответствующие сервисы в `docker-compose.yaml`:

```yaml
app:
  image: ${HDX_IMAGE_REPO}/${IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
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
  image: ${HDX_IMAGE_REPO}/${OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
  environment:
    OTEL_AGENT_FEATURE_GATE_ARG: "--feature-gates=clickhouse.json" # enable JSON
    CLICKHOUSE_ENDPOINT: "tcp://ch-server:9000?dial_timeout=10s"
    # truncated for brevity
```
