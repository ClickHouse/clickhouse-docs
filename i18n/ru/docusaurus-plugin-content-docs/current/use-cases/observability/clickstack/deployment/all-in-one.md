---
'slug': '/use-cases/observability/clickstack/deployment/all-in-one'
'title': 'Все в одном'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 0
'description': 'Развертывание ClickStack с Все в одном - Стек мониторинга ClickHouse'
'doc_type': 'guide'
---

import JSONSupport from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';
import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';

Этот всеобъемлющий образ Docker включает в себя все компоненты ClickStack:

* **ClickHouse**
* **HyperDX**
* **Сборщик OpenTelemetry (OTel)** (экспонирует OTLP на портах `4317` и `4318`)
* **MongoDB** (для постоянного состояния приложения)

Эта опция включает аутентификацию, что позволяет сохранять дашборды, тревоги и сохраненные поиски между сессиями и пользователями.

### Подходит для {#suitable-for}

* Демо
* Локальное тестирование полного стека

## Шаги развертывания {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Развертывание с помощью Docker {#deploy-with-docker}

Следующее запустит сборщик OpenTelemetry (на портах 4317 и 4318) и интерфейс HyperDX (на порту 8080).

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### Перейдите к интерфейсу HyperDX {#navigate-to-hyperdx-ui}

Посетите [http://localhost:8080](http://localhost:8080) для доступа к интерфейсу HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующий требованиям.

При нажатии `Создать` для интегрированного экземпляра ClickHouse будут созданы источники данных.

<Image img={hyperdx_login} alt="Интерфейс HyperDX" size="lg"/>

Для примера использования альтернативного экземпляра ClickHouse смотрите ["Создание подключения к ClickHouse Cloud"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).

### Прием данных {#ingest-data}

Для приема данных смотрите ["Прием данных"](/use-cases/observability/clickstack/ingesting-data).

</VerticalStepper>

## Сохранение данных и настроек {#persisting-data-and-settings}

Для сохранения данных и настроек между перезапусками контейнера пользователи могут изменить вышеуказанную команду docker, чтобы смонтировать пути `/data/db`, `/var/lib/clickhouse` и `/var/log/clickhouse-server`. Например:

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
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

## Развертывание в производственной среде {#deploying-to-production}

Эту опцию не следует разворачивать в производственной среде по следующим причинам:

- **Непостоянное хранилище:** Все данные хранятся с использованием нативной файловой системы Docker overlay. Эта конфигурация не поддерживает производительность на масштабах, и данные будут потеряны, если контейнер будет удален или перезапущен - если только пользователи не [смонтируют необходимые файловые пути](#persisting-data-and-settings).
- **Отсутствие изоляции компонентов:** Все компоненты работают в одном контейнере Docker. Это мешает независимому масштабированию и мониторингу, и любые ограничения `cgroup` применяются глобально ко всем процессам. В результате компоненты могут конкурировать за CPU и память.

## Настройка портов {#customizing-ports-deploy}

Если вам нужно настроить порты приложения (8080) или API (8000), на которых работает HyperDX Local, вам нужно изменить команду `docker run`, чтобы переадресовать соответствующие порты и задать несколько переменных окружения.

Настройка портов OpenTelemetry может быть изменена простым изменением флагов переадресации портов. Например, заменив `-p 4318:4318` на `-p 4999:4318`, чтобы изменить HTTP порт OpenTelemetry на 4999.

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4999:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

## Использование ClickHouse Cloud {#using-clickhouse-cloud}

Эта дистрибуция может использоваться с ClickHouse Cloud. Хотя локальный экземпляр ClickHouse будет по-прежнему развернут (и проигнорирован), сборщик OTel может быть настроен на использование ClickHouse Cloud путем установки переменных окружения `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USER` и `CLICKHOUSE_PASSWORD`.

Например:

```shell
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

`CLICKHOUSE_ENDPOINT` должен быть HTTPS-эндпоинтом ClickHouse Cloud, включая порт `8443`, например `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

Подсоединившись к интерфейсу HyperDX, перейдите в [`Настройки команды`](http://localhost:8080/team) и создайте соединение с вашим сервисом ClickHouse Cloud, а затем необходимыми источниками. Для примера потока смотрите [здесь](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).

## Конфигурирование сборщика OpenTelemetry {#configuring-collector}

Конфигурацию сборщика OTel можно изменить при необходимости - смотрите ["Изменение конфигурации"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration).

<JSONSupport/>

Например:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```
