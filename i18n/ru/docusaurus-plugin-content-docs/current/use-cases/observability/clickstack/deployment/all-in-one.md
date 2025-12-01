---
slug: /use-cases/observability/clickstack/deployment/all-in-one
title: 'Все в одном'
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: 'Развертывание ClickStack в конфигурации «все в одном» — ClickHouse Observability Stack'
doc_type: 'guide'
keywords: ['ClickStack', 'observability', 'all-in-one', 'deployment']
---

import JSONSupport from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';
import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';

Этот комплексный Docker-образ включает все компоненты ClickStack:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector** (предоставляющий OTLP по портам `4317` и `4318`)
* **MongoDB** (для хранения состояния приложения)

Этот вариант поддерживает аутентификацию, что позволяет сохранять дашборды, оповещения и сохранённые поисковые запросы между сеансами и пользователями.


### Подходит для {#suitable-for}

* демонстраций
* локального тестирования всего стека

## Шаги развертывания {#deployment-steps}

<br/>

<VerticalStepper headerLevel="h3">

### Развертывание с помощью Docker {#deploy-with-docker}

Следующая команда запустит коллектор OpenTelemetry (на портах 4317 и 4318) и интерфейс HyperDX (на порту 8080).

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### Перейдите к интерфейсу HyperDX {#navigate-to-hyperdx-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы получить доступ к интерфейсу HyperDX.

Создайте пользователя, указав имя пользователя и пароль, который соответствует требованиям. 

После нажатия `Create` будут созданы источники данных для интегрированного экземпляра ClickHouse.

<Image img={hyperdx_login} alt="Интерфейс HyperDX" size="lg"/>

Пример использования альтернативного экземпляра ClickHouse смотрите в разделе «[Создание подключения ClickHouse Cloud](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)».

### Приём данных {#ingest-data}

Инструкции по приёму данных смотрите в разделе «[Приём данных](/use-cases/observability/clickstack/ingesting-data)».

</VerticalStepper>

## Сохранение данных и настроек {#persisting-data-and-settings}

Чтобы сохранять данные и настройки при перезапусках контейнера, пользователи могут изменить приведённую выше команду docker, чтобы смонтировать каталоги `/data/db`, `/var/lib/clickhouse` и `/var/log/clickhouse-server`. Например:

```shell
# убедитесь, что каталоги существуют {#ensure-directories-exist}
mkdir -p .volumes/db .volumes/ch_data .volumes/ch_logs
# измените команду для монтирования путей {#modify-command-to-mount-paths}
docker run \
  -p 8080:8080 \
  -p 4317:4317 \
  -p 4318:4318 \
  -v "$(pwd)/.volumes/db:/data/db" \
  -v "$(pwd)/.volumes/ch_data:/var/lib/clickhouse" \
  -v "$(pwd)/.volumes/ch_logs:/var/log/clickhouse-server" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```


## Развертывание в production‑среде {#deploying-to-production}

Этот вариант не следует использовать в production‑среде по следующим причинам:

- **Неперсистентное хранилище:** Все данные сохраняются с использованием нативной overlay‑файловой системы Docker. Такая конфигурация не обеспечивает масштабируемую производительность, а данные будут потеряны при удалении или перезапуске контейнера, если только вы не [смонтируете необходимые пути в файловой системе](#persisting-data-and-settings).
- **Отсутствие изоляции компонентов:** Все компоненты запускаются внутри одного Docker‑контейнера. Это не позволяет независимо масштабировать и мониторить их и приводит к тому, что любые ограничения `cgroup` применяются глобально ко всем процессам. В результате компоненты могут конкурировать за CPU и память.

## Настройка портов {#customizing-ports-deploy}

Если вам нужно изменить порты приложения (8080) или API (8000), на которых работает HyperDX Local, вам потребуется изменить команду `docker run`, чтобы пробросить нужные порты и задать несколько переменных окружения.

Порты OpenTelemetry настраиваются простым изменением флагов проброса портов. Например, можно заменить `-p 4318:4318` на `-p 4999:4318`, чтобы изменить HTTP-порт OpenTelemetry на 4999.

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4999:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```


## Использование ClickHouse Cloud {#using-clickhouse-cloud}

Этот дистрибутив можно использовать с ClickHouse Cloud. При этом локальный экземпляр ClickHouse всё равно будет развёрнут, но использоваться не будет, а OTel collector можно настроить на работу с экземпляром ClickHouse Cloud с помощью переменных окружения `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USER` и `CLICKHOUSE_PASSWORD`.

Например:

```shell
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

`CLICKHOUSE_ENDPOINT` должен указывать на HTTPS-эндпоинт ClickHouse Cloud, включая порт `8443`, например: `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

После подключения к интерфейсу HyperDX перейдите в [`Team Settings`](http://localhost:8080/team) и создайте подключение к вашему сервису ClickHouse Cloud, а затем настройте необходимые источники. Пример последовательности действий см. [здесь](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).


## Настройка OTel collector {#configuring-collector}

Конфигурацию OTel collector при необходимости можно изменить — см. раздел [&quot;Изменение конфигурации OTel collector&quot;](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration).

<JSONSupport />

Например:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```
