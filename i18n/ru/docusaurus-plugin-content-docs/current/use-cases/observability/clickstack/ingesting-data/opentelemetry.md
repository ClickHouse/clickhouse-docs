---
slug: /use-cases/observability/clickstack/ingesting-data/opentelemetry
pagination_prev: null
pagination_next: null
description: 'Ингестия данных с помощью OpenTelemetry в ClickStack — стек наблюдаемости ClickHouse'
title: 'Приём данных с помощью OpenTelemetry'
doc_type: 'guide'
keywords: ['clickstack', 'opentelemetry', 'traces', 'observability', 'telemetry']
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Все данные поступают в ClickStack через экземпляр **коллектора OpenTelemetry (OTel)**, который является основной точкой входа для логов, метрик, трейсов и данных сессий. Мы рекомендуем использовать для этого экземпляра официальный [дистрибутив коллектора ClickStack](#installing-otel-collector).

Пользователи отправляют данные в этот коллектор из [языковых SDK](/use-cases/observability/clickstack/sdks) или через агенты сбора данных, собирающие инфраструктурные метрики и логи (например, экземпляры OTel collector в [роли агента](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) или другие технологии, такие как [Fluentd](https://www.fluentd.org/) или [Vector](https://vector.dev/)).


## Отправка данных OpenTelemetry \{#sending-otel-data\}

<Tabs groupId="os-type">
  <TabItem value="managed-clickstack" label="Управляемый сервис ClickStack" default>
    ### Установка ClickStack OpenTelemetry collector

    Чтобы отправлять данные в Managed ClickStack, OTel collector должен быть развернут в роли [gateway](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles). Совместимое с OTel инструментирование будет отправлять события в этот коллектор по OTLP через HTTP или gRPC.

    :::note Мы рекомендуем использовать ClickStack OpenTelemetry collector
    Это позволяет использовать стандартизированную ингестию, жёстко заданные схемы и готовую совместимость с интерфейсом ClickStack (HyperDX). Применение стандартной схемы обеспечивает автоматическое определение источников и преднастроенные сопоставления столбцов.
    :::

    Для получения более подробной информации см. раздел «[Развертывание коллектора](/use-cases/observability/clickstack/ingesting-data/otel-collector)».

    ### Отправка данных в коллектор

    Чтобы отправлять данные в Managed ClickStack, направьте ваше инструментирование OpenTelemetry на следующие конечные точки, предоставляемые OpenTelemetry collector:

    * **HTTP (OTLP):** `http://localhost:4318`
    * **gRPC (OTLP):** `localhost:4317`

    Для [языковых SDK](/use-cases/observability/clickstack/sdks) и библиотек телеметрии, поддерживающих OpenTelemetry, вы можете просто задать переменную окружения `OTEL_EXPORTER_OTLP_ENDPOINT` в вашем приложении:

    ```shell
    export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
    ```

    Если вы развертываете [contrib-дистрибутив OTel collector](https://github.com/open-telemetry/opentelemetry-collector-contrib) в роли агента, вы можете использовать экспортёр OTLP для отправки данных в коллектор ClickStack. Ниже приведён пример конфигурации агента, который потребляет этот [структурированный файл логов](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz).

    ```yaml
    # clickhouse-agent-config.yaml
    receivers:
      filelog:
        include:
          - /opt/data/logs/access-structured.log
        start_at: beginning
        operators:
          - type: json_parser
            timestamp:
              parse_from: attributes.time_local
              layout: '%Y-%m-%d %H:%M:%S'
    exporters:
      # HTTP setup
      otlphttp/hdx:
        endpoint: 'http://localhost:4318'
        compression: gzip
     
      # gRPC setup (alternative)
      otlp/hdx:
        endpoint: 'localhost:4317'
        compression: gzip
    processors:
      batch:
        timeout: 5s
        send_batch_size: 1000
    service:
      telemetry:
        metrics:
          address: 0.0.0.0:9888 # Modified as 2 collectors running on same host
      pipelines:
        logs:
          receivers: [filelog]
          processors: [batch]
          exporters: [otlphttp/hdx]
    ```
  </TabItem>

  <TabItem value="oss-clickstack" label="ClickStack с открытым исходным кодом" default>
    ClickStack OpenTelemetry collector входит в состав большинства дистрибутивов ClickStack, включая:

    * [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)
    * [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)
    * [Helm](/use-cases/observability/clickstack/deployment/helm)

    ### Установка коллектора ClickStack OpenTelemetry

    OTel collector из ClickStack также может быть развернут автономно, независимо от других компонентов стека.

    Если вы используете дистрибутив [HyperDX-only](/use-cases/observability/clickstack/deployment/hyperdx-only), вы самостоятельно отвечаете за доставку данных в ClickHouse. Это можно сделать следующими способами:

    * Запустить собственный коллектор OpenTelemetry и направить его в ClickHouse — см. ниже.
    * Отправлять данные напрямую в ClickHouse с помощью альтернативных инструментов, таких как [Vector](https://vector.dev/), [Fluentd](https://www.fluentd.org/) и т. д., либо даже использовать стандартный дистрибутив [OTel contrib collector](https://github.com/open-telemetry/opentelemetry-collector-contrib).

    :::note Мы рекомендуем использовать OTel collector из ClickStack
    Это позволяет использовать стандартизированную ингестию, жёстко заданные схемы и готовую совместимость с интерфейсом HyperDX. Применение стандартной схемы обеспечивает автоматическое определение источников и преднастроенные сопоставления столбцов.
    :::

    Для получения более подробной информации см. раздел «[Развертывание коллектора](/use-cases/observability/clickstack/ingesting-data/otel-collector)».

    ### Отправка данных в коллектор

    Чтобы отправлять данные в ClickStack, направьте вашу OpenTelemetry-инструментацию на следующие эндпоинты, предоставляемые OpenTelemetry collector:

    * **HTTP (OTLP):** `http://localhost:4318`
    * **gRPC (OTLP):** `localhost:4317`

    Для [языковых SDKs](/use-cases/observability/clickstack/sdks) и библиотек телеметрии, поддерживающих OpenTelemetry, достаточно задать переменную окружения `OTEL_EXPORTER_OTLP_ENDPOINT` в вашем приложении:

    ```shell
    export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
    ```

    Кроме того, требуется заголовок авторизации, содержащий ключ API для ингестии. Вы можете найти этот ключ в приложении HyperDX в разделе `Team Settings → API Keys`.

    <Image img={ingestion_key} alt="Ключи ингестии" size="lg" />

    Для языковых SDKS это можно задать либо с помощью функции `init`, либо через переменную окружения `OTEL_EXPORTER_OTLP_HEADERS`, например:

    ```shell
    OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
    ```

    Агенты также должны включать этот заголовок авторизации во всё OTLP‑взаимодействие. Например, при развертывании [contrib-дистрибутива OTel collector](https://github.com/open-telemetry/opentelemetry-collector-contrib) в роли агента они могут использовать OTLP exporter. Пример конфигурации агента, читающего этот [структурированный файл логов](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz), приведён ниже. Обратите внимание на необходимость указать ключ авторизации API для ингестии — см. `<YOUR_API_INGESTION_KEY>`.

    ```yaml
    # clickhouse-agent-config.yaml
    receivers:
      filelog:
        include:
          - /opt/data/logs/access-structured.log
        start_at: beginning
        operators:
          - type: json_parser
            timestamp:
              parse_from: attributes.time_local
              layout: '%Y-%m-%d %H:%M:%S'
    exporters:
      # HTTP setup
      otlphttp/hdx:
        endpoint: 'http://localhost:4318'
        headers:
          authorization: <YOUR_API_INGESTION_KEY>
        compression: gzip
     
      # gRPC setup (alternative)
      otlp/hdx:
        endpoint: 'localhost:4317'
        headers:
          authorization: <YOUR_API_INGESTION_KEY>
        compression: gzip
    processors:
      batch:
        timeout: 5s
        send_batch_size: 1000
    service:
      telemetry:
        metrics:
          address: 0.0.0.0:9888 # Modified as 2 collectors running on same host
      pipelines:
        logs:
          receivers: [filelog]
          processors: [batch]
          exporters: [otlphttp/hdx]
    ```
  </TabItem>
</Tabs>