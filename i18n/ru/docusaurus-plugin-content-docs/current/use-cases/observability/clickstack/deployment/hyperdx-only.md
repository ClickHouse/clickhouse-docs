---
slug: /use-cases/observability/clickstack/deployment/hyperdx-only
title: 'Только HyperDX'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'Развертывание HyperDX отдельно'
doc_type: 'guide'
keywords: ['автономное развертывание HyperDX', 'интеграция HyperDX с ClickHouse', 'развернуть только HyperDX', 'установка HyperDX в Docker', 'инструмент визуализации ClickHouse']
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

Этот вариант предназначен для пользователей, у которых уже есть запущенный экземпляр ClickHouse с данными наблюдаемости или событийными данными.

HyperDX может использоваться независимо от остальной части стека и совместим с любой схемой данных, а не только с OpenTelemetry (OTel). Это делает его подходящим для пользовательских конвейеров наблюдаемости, уже построенных на ClickHouse.

Для включения полной функциональности необходимо предоставить экземпляр MongoDB для хранения состояния приложения, включая дашборды, сохранённые поисковые запросы, пользовательские настройки и оповещения.

В этом режиме ингестия данных полностью остаётся на стороне пользователя. Вы можете осуществлять приём данных в ClickHouse с помощью собственного развернутого коллектора OpenTelemetry, прямой ингестии из клиентских библиотек, нативных для ClickHouse движков таблиц (таких как Kafka или S3), ETL-конвейеров или управляемых сервисов ингестии, таких как ClickPipes. Такой подход обеспечивает максимальную гибкость и подходит командам, которые уже эксплуатируют ClickHouse и хотят добавить поверх него HyperDX для визуализации, поиска и оповещений.

### Подходит для

* Существующих пользователей ClickHouse
* Пользовательских конвейеров событий


## Этапы развертывания {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Развертывание с помощью Docker {#deploy-hyperdx-with-docker}

Выполните следующую команду, изменив `YOUR_MONGODB_URI` по необходимости. 

```shell
docker run -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```

### Перейдите в интерфейс HyperDX {#navigate-to-hyperdx-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы открыть интерфейс HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующий требованиям. 

После нажатия `Create` вам будет предложено ввести параметры подключения.

<Image img={hyperdx_login} alt="Интерфейс HyperDX" size="lg"/>

### Заполните параметры подключения {#complete-connection-details}

Подключитесь к собственному внешнему кластеру ClickHouse, например, ClickHouse Cloud.

<Image img={hyperdx_2} alt="Вход в HyperDX" size="md"/>

Если появится запрос на создание источника, сохраните все значения по умолчанию и заполните поле `Table` значением `otel_logs`. Все остальные настройки должны быть определены автоматически, после чего вы сможете нажать `Save New Source`.

:::note Создание источника
Для создания источника требуется, чтобы в ClickHouse уже существовали таблицы. Если у вас нет данных, мы рекомендуем развернуть коллектор OpenTelemetry из стека ClickStack, чтобы создать таблицы.
:::

</VerticalStepper>



## Использование Docker Compose {#using-docker-compose}

Вы можете изменить [конфигурацию Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose), чтобы достичь того же эффекта, который описан в этом руководстве, удалив OTel collector и экземпляр ClickHouse из манифеста.



## Коллектор ClickStack OpenTelemetry

Даже если вы управляете собственным коллектором OpenTelemetry, независимо от других компонентов стека, мы всё равно рекомендуем использовать дистрибутив коллектора ClickStack. Это гарантирует использование схемы по умолчанию и применение передовых практик при ингестии данных.

Подробности о развертывании и настройке автономного коллектора см. в разделе [&quot;Ингестия с помощью OpenTelemetry&quot;](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration).

<JSONSupport />

Для образа, предназначенного только для HyperDX, пользователям достаточно установить параметр `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`, например:

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```
