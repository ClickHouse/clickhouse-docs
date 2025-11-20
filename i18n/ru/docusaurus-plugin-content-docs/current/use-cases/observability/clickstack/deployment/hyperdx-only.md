---
slug: /use-cases/observability/clickstack/deployment/hyperdx-only
title: "Только HyperDX"
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: "Развертывание только HyperDX"
doc_type: "руководство"
keywords:
  [
    "автономное развертывание HyperDX",
    "интеграция HyperDX с ClickHouse",
    "развертывание только HyperDX",
    "установка HyperDX через Docker",
    "инструмент визуализации ClickHouse"
  ]
---

import Image from "@theme/IdealImage"
import hyperdx_login from "@site/static/images/use-cases/observability/hyperdx-login.png"
import hyperdx_logs from "@site/static/images/use-cases/observability/hyperdx-logs.png"
import hyperdx_2 from "@site/static/images/use-cases/observability/hyperdx-2.png"
import JSONSupport from "@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md"

Этот вариант предназначен для пользователей, у которых уже есть работающий экземпляр ClickHouse, заполненный данными наблюдаемости или событиями.

HyperDX может использоваться независимо от остальной части стека и совместим с любой схемой данных — не только с OpenTelemetry (OTel). Это делает его подходящим для пользовательских конвейеров наблюдаемости, уже построенных на ClickHouse.

Для обеспечения полной функциональности необходимо предоставить экземпляр MongoDB для хранения состояния приложения, включая дашборды, сохраненные поиски, настройки пользователей и оповещения.

В этом режиме прием данных полностью остается на усмотрение пользователя. Вы можете загружать данные в ClickHouse с помощью собственного размещенного коллектора OpenTelemetry, прямой загрузки из клиентских библиотек, нативных движков таблиц ClickHouse (таких как Kafka или S3), ETL-конвейеров или управляемых сервисов приема данных, таких как ClickPipes. Этот подход обеспечивает максимальную гибкость и подходит для команд, которые уже работают с ClickHouse и хотят добавить HyperDX для визуализации, поиска и оповещений.

### Подходит для {#suitable-for}

- Существующих пользователей ClickHouse
- Пользовательских конвейеров событий


## Шаги развертывания {#deployment-steps}

<br />

<VerticalStepper headerLevel="h3">

### Развертывание с помощью Docker {#deploy-hyperdx-with-docker}

Выполните следующую команду, изменив `YOUR_MONGODB_URI` при необходимости.

```shell
docker run -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```

### Переход к интерфейсу HyperDX {#navigate-to-hyperdx-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080) для доступа к интерфейсу HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующие требованиям.

После нажатия `Create` вам будет предложено ввести данные для подключения.

<Image img={hyperdx_login} alt='Интерфейс HyperDX' size='lg' />

### Заполнение данных для подключения {#complete-connection-details}

Подключитесь к собственному внешнему кластеру ClickHouse, например ClickHouse Cloud.

<Image img={hyperdx_2} alt='Вход в HyperDX' size='md' />

Если будет предложено создать источник, сохраните все значения по умолчанию и заполните поле `Table` значением `otel_logs`. Все остальные настройки должны определиться автоматически, после чего можно нажать `Save New Source`.

:::note Создание источника
Для создания источника необходимо наличие таблиц в ClickHouse. Если у вас нет данных, рекомендуем развернуть коллектор ClickStack OpenTelemetry для создания таблиц.
:::

</VerticalStepper>


## Использование Docker Compose {#using-docker-compose}

Пользователи могут изменить [конфигурацию Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose), чтобы добиться того же результата, что и в данном руководстве, удалив OTel collector и экземпляр ClickHouse из манифеста.


## Коллектор OpenTelemetry ClickStack {#otel-collector}

Даже если вы управляете собственным коллектором OpenTelemetry независимо от других компонентов стека, мы всё равно рекомендуем использовать дистрибутив коллектора ClickStack. Это обеспечивает использование схемы по умолчанию и применение лучших практик приёма данных.

Подробности о развёртывании и настройке автономного коллектора см. в разделе ["Приём данных с помощью OpenTelemetry"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration).

<JSONSupport />

Для образа, предназначенного только для HyperDX, пользователям необходимо установить параметр `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`, например:

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```
