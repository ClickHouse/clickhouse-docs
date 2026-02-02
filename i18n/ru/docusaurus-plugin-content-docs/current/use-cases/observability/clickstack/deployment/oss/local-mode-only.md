---
slug: /use-cases/observability/clickstack/deployment/local-mode-only
title: 'Только локальный режим'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'Развертывание ClickStack в режиме только локального запуска — ClickHouse Observability Stack'
doc_type: 'guide'
keywords: ['clickstack', 'deployment', 'setup', 'configuration', 'observability']
---

import Image from '@theme/IdealImage';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

Аналогично [образу «всё-в-одном»](/use-cases/observability/clickstack/deployment/docker-compose), этот единый Docker-образ включает все компоненты ClickStack:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector** (экспортирует OTLP на портах `4317` и `4318`)
* **MongoDB** (для хранения состояния приложения)

**Однако в этом дистрибутиве HyperDX аутентификация пользователей отключена**


### Подходит для \{#suitable-for\}

* Демонстраций
* Отладки
* Разработки с использованием HyperDX

## Шаги развертывания \{#deployment-steps\}

<br />

<VerticalStepper headerLevel="h3">
  ### Развертывание с помощью Docker

  В локальном режиме интерфейс HyperDX запускается на порту 8080.

  ```shell
  docker run -p 8080:8080 clickhouse/clickstack-local:latest
  ```

  ### Перейдите в интерфейс HyperDX

  Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы открыть интерфейс HyperDX.

  **Вам не потребуется создавать пользователя, так как аутентификация в этом режиме развертывания не включена.**

  Подключитесь к собственному внешнему кластеру ClickHouse, например ClickHouse Cloud.

  <Image img={hyperdx_2} alt="Создание логина" size="md" />

  Создайте источник, сохраните все значения по умолчанию и заполните поле `Table` значением `otel_logs`. Все остальные настройки должны определиться автоматически, после чего вы сможете нажать `Save New Source`.

  <Image img={hyperdx_logs} alt="Создание источника логов" size="md" />
</VerticalStepper>

<JSONSupport />

Для образа, предназначенного только для локального режима, пользователям нужно задать параметр `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`, например:

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 clickhouse/clickstack-local:latest
```
