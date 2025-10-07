---
'slug': '/use-cases/observability/clickstack/deployment/docker-compose'
'title': 'Docker Compose'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 3
'description': 'Развертывание ClickStack с помощью Docker Compose - Стек наблюдаемости
  ClickHouse'
'doc_type': 'guide'
---
import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import JSONSupport from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

Все компоненты ClickStack распределены отдельно в виде индивидуальных Docker-образов:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB**

Эти образы можно комбинировать и развертывать локально с использованием Docker Compose.

Docker Compose открывает дополнительные порты для мониторинга и приема данных на основании настроек по умолчанию `otel-collector`:

- `13133`: Точка проверки состояния для расширения `health_check`
- `24225`: Получатель Fluentd для приема логов
- `4317`: Получатель OTLP gRPC (стандарт для трасс, логов и метрик)
- `4318`: Получатель OTLP HTTP (альтернатива gRPC)
- `8888`: Точка доступа метрик Prometheus для мониторинга самого collector

Эти порты позволяют интегрироваться с различными источниками телеметрии и делают OpenTelemetry collector готовым к использованию в производственной среде для разнообразных потребностей в приеме данных.

### Подходящее для {#suitable-for}

* Локальное тестирование
* Доказательства концепции
* Производственные развертывания, где отказоустойчивость не требуется и одного сервера достаточно для размещения всех данных ClickHouse
* При развертывании ClickStack, но с отдельным размещением ClickHouse, например, используя ClickHouse Cloud.

## Шаги развертывания {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Клонирование репозитория {#clone-the-repo}

Чтобы развернуть с помощью Docker Compose, клонируйте репозиторий HyperDX, перейдите в каталог и выполните команду `docker-compose up`:

```shell
git clone git@github.com:hyperdxio/hyperdx.git
cd hyperdx

# switch to the v2 branch
git checkout v2
docker compose up
```

### Переход к интерфейсу HyperDX {#navigate-to-hyperdx-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы получить доступ к интерфейсу HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующий требованиям. 

При нажатии на кнопку `Создать` будут созданы источники данных для экземпляра ClickHouse, развернутого с помощью Helm chart.

:::note Переопределение подключения по умолчанию
Вы можете переопределить подключение к интегрированному экземпляру ClickHouse. Для получения дополнительной информации смотрите ["Использование ClickHouse Cloud"](#using-clickhouse-cloud).
:::

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

Для примера использования альтернативного экземпляра ClickHouse смотрите ["Создать подключение к ClickHouse Cloud"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).

### Завершение деталей подключения {#complete-connection-details}

Чтобы подключиться к развернутому экземпляру ClickHouse, просто нажмите **Создать** и примите настройки по умолчанию.  

Если вы предпочитаете подключиться к вашему собственному **внешнему кластеру ClickHouse**, например, ClickHouse Cloud, вы можете вручную ввести ваши учетные данные подключения.

Если вас попросят создать источник, сохраните все значения по умолчанию и заполните поле `Table` значением `otel_logs`. Все остальные настройки должны быть автоматически определены, что позволит вам нажать `Сохранить новый источник`.

<Image img={hyperdx_logs} alt="Создать источник логов" size="md"/>

</VerticalStepper>

## Изменение настроек компоновки {#modifying-settings}

Пользователи могут изменять настройки для стека, такие как используемая версия, через файл переменных окружения:

```shell
user@example-host hyperdx % cat .env

# Used by docker-compose.yml

# Used by docker-compose.yml
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


# Set up domain URLs
HYPERDX_API_PORT=8000 #optional (should not be taken by other services)
HYPERDX_APP_PORT=8080
HYPERDX_APP_URL=http://localhost
HYPERDX_LOG_LEVEL=debug
HYPERDX_OPAMP_PORT=4320


# Otel/Clickhouse config
HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE=default
```

### Конфигурирование OpenTelemetry collector {#configuring-collector}

Конфигурацию OTel collector можно изменить при необходимости - смотрите ["Изменение конфигурации"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration).

## Использование ClickHouse Cloud {#using-clickhouse-cloud}

Это распределение можно использовать с ClickHouse Cloud. Пользователи должны:

- Удалить службу ClickHouse из файла `docker-compose.yaml`. Это необязательно, если вы тестируете, так как развернутый экземпляр ClickHouse просто будет проигнорирован - хотя и будет расходовать локальные ресурсы. Если удаляете службу, убедитесь, что все ссылки на службу, такие как `depends_on`, удалены.
- Изменить OTel collector для использования экземпляра ClickHouse Cloud, установив переменные окружения `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USER` и `CLICKHOUSE_PASSWORD` в файле компоновки. В частности, добавьте переменные окружения в службу OTel collector:

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

    `CLICKHOUSE_ENDPOINT` должен быть HTTPS-эндпоинтом ClickHouse Cloud, включая порт `8443`, например, `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

- При подключении к интерфейсу HyperDX и создании подключения к ClickHouse используйте свои облачные учетные данные.

<JSONSupport/>

Чтобы установить их, измените соответствующие службы в `docker-compose.yaml`:

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
    OTEL_AGENT_FEATURE_GATE_ARG: '--feature-gates=clickhouse.json' # enable JSON
    CLICKHOUSE_ENDPOINT: 'tcp://ch-server:9000?dial_timeout=10s' 
    # truncated for brevity
```