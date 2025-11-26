---
slug: /use-cases/observability/clickstack/deployment/local-mode-only
title: 'Только локальный режим'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'Развертывание ClickStack только в локальном режиме — стек наблюдаемости ClickHouse'
doc_type: 'guide'
keywords: ['clickstack', 'развертывание', 'настройка', 'конфигурация', 'наблюдаемость']
---

import Image from '@theme/IdealImage';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

Аналогично [all-in-one image](/use-cases/observability/clickstack/deployment/docker-compose), этот комплексный Docker-образ включает все компоненты ClickStack:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector** (открывает OTLP на портах `4317` и `4318`)
* **MongoDB** (для хранения состояния приложения)

**Однако в этом варианте HyperDX аутентификация пользователей отключена**

### Подходит для

* Демонстраций
* Отладки
* Разработки с использованием HyperDX


## Этапы развертывания

<br />

<VerticalStepper headerLevel="h3">
  ### Развертывание с помощью Docker

  В локальном режиме интерфейс HyperDX запускается на порту 8080.

  ```shell
  docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
  ```

  ### Перейдите в интерфейс HyperDX

  Откройте [http://localhost:8080](http://localhost:8080), чтобы получить доступ к интерфейсу HyperDX.

  **Вам не будет предложено создать пользователя, так как в этом режиме развертывания аутентификация отключена.**

  Подключитесь к собственному внешнему кластеру ClickHouse, например, ClickHouse Cloud.

  <Image img={hyperdx_2} alt="Создание логина" size="md" />

  Создайте источник данных, оставьте все значения по умолчанию и заполните поле `Table` значением `otel_logs`. Все остальные параметры должны определиться автоматически, после чего вы сможете нажать `Save New Source`.

  <Image img={hyperdx_logs} alt="Создание источника логов" size="md" />
</VerticalStepper>

<JSONSupport />

Для образа, предназначенного только для локального режима, пользователям нужно задать лишь параметр `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`, например:

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```
