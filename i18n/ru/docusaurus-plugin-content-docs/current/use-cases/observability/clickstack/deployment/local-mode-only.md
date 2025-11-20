---
slug: /use-cases/observability/clickstack/deployment/local-mode-only
title: "Только локальный режим"
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: "Развертывание ClickStack только в локальном режиме - стек наблюдаемости ClickHouse"
doc_type: "guide"
keywords:
  ["clickstack", "deployment", "setup", "configuration", "observability"]
---

import Image from "@theme/IdealImage"
import hyperdx_logs from "@site/static/images/use-cases/observability/hyperdx-logs.png"
import hyperdx_2 from "@site/static/images/use-cases/observability/hyperdx-2.png"
import JSONSupport from "@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md"

Аналогично [универсальному образу](/use-cases/observability/clickstack/deployment/docker-compose), этот комплексный Docker-образ включает все компоненты ClickStack:

- **ClickHouse**
- **HyperDX**
- **Коллектор OpenTelemetry (OTel)** (предоставляет OTLP на портах `4317` и `4318`)
- **MongoDB** (для сохранения состояния приложения)

**Однако в этом дистрибутиве HyperDX аутентификация пользователей отключена**

### Подходит для {#suitable-for}

- Демонстраций
- Отладки
- Разработки с использованием HyperDX


## Шаги развёртывания {#deployment-steps}

<br />

<VerticalStepper headerLevel="h3">

### Развёртывание с помощью Docker {#deploy-with-docker}

В локальном режиме пользовательский интерфейс HyperDX развёртывается на порту 8080.

```shell
docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

### Переход к интерфейсу HyperDX {#navigate-to-hyperdx-ui}

Откройте [http://localhost:8080](http://localhost:8080) для доступа к интерфейсу HyperDX.

**Вам не будет предложено создать пользователя, так как аутентификация в этом режиме развёртывания отключена.**

Подключитесь к своему внешнему кластеру ClickHouse, например, ClickHouse Cloud.

<Image img={hyperdx_2} alt='Создание учётной записи' size='md' />

Создайте источник, оставьте все значения по умолчанию и заполните поле `Table` значением `otel_logs`. Все остальные настройки должны определиться автоматически, после чего вы сможете нажать `Save New Source`.

<Image img={hyperdx_logs} alt='Создание источника логов' size='md' />

</VerticalStepper>

<JSONSupport />

Для образа, работающего только в локальном режиме, пользователям необходимо установить только параметр `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`, например:

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```
