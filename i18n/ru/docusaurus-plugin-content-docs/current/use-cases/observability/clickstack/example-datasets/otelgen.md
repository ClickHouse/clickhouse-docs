---
slug: /use-cases/observability/clickstack/getting-started/otelgen
title: 'Генерация синтетических данных OpenTelemetry с помощью otelgen'
sidebar_label: 'Синтетические данные с otelgen'
sidebar_position: 5
pagination_prev: null
pagination_next: null
description: 'Используйте otelgen для отправки синтетических логов, трейсов и метрик в коллектор ClickStack OpenTelemetry'
doc_type: 'guide'
toc_max_heading_level: 2
keywords: ['clickstack', 'otelgen', 'синтетические данные', 'OpenTelemetry', 'тест', 'логи', 'трейсы', 'метрики', 'обсервабилити']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[`otelgen`](https://github.com/krzko/otelgen) — это небольшая CLI-утилита на Go, которая генерирует синтетические OTLP-логи, трейсы и метрики. Используйте её, чтобы убедиться, что существующий коллектор ClickStack OpenTelemetry принимает данные и что события появляются в интерфейсе ClickStack.

В этом руководстве предполагается, что коллектор уже запущен и использует конечные точки OTLP на `4317` (gRPC) и `4318` (HTTP).

<Tabs groupId="sample-logs">
  <TabItem value="managed-clickstack" label="Управляемый ClickStack" default>
    <VerticalStepper headerLevel="h3">
      ### Предварительные требования \{#prerequisites-managed\}

      В этом руководстве предполагается, что вы уже выполнили [руководство Getting Started для Управляемого ClickStack](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud) и что у вас запущен OpenTelemetry Collector с конечными точками OTLP gRPC (`4317`) и HTTP (`4318`), доступными с машины, на которой вы запускаете `otelgen`. Если вы [защитили коллектор](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector) с помощью `OTLP_AUTH_TOKEN`, держите это значение под рукой.

      ### Установка otelgen \{#install-otelgen-managed\}

      Установите через Homebrew:

      ```shell
      brew install krzko/tap/otelgen
      ```

      Или установите через Go:

      ```shell
      go install github.com/krzko/otelgen@latest
      ```

      ### Задайте переменные окружения \{#set-env-vars-managed\}

      Экспортируйте конечную точку коллектора и, если коллектор защищён, токен аутентификации:

      ```shell
      export OTEL_ENDPOINT=<host>:4317
      export OTLP_AUTH_TOKEN=<your_otlp_auth_token>
      ```

      Используйте хост и порт вашего коллектора. Для коллектора, запущенного на той же машине, это будет `localhost:4317`.

      :::note[Незащищённый коллектор]
      Коллектор ClickStack OpenTelemetry по умолчанию не требует аутентификации. Если вы не выполнили шаги из раздела [Защита коллектора](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector), чтобы задать `OTLP_AUTH_TOKEN`, пропустите здесь `OTLP_AUTH_TOKEN` и уберите флаг `--header` из команд ниже.
      :::

      ### Генерация трейсов \{#generate-traces-managed\}

      Отправьте короткую серию многоспановых трейсов:

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${OTLP_AUTH_TOKEN}" \
        --protocol grpc --insecure \
        --rate 2 --duration 10 \
        traces multi
      ```

      `--rate` — это количество трейсов в секунду, а `--duration` — длительность выполнения в секундах. `--insecure` отключает TLS для gRPC-соединения, что необходимо, если `otelgen` указывает на незашифрованный OTLP-порт коллектора.

      ### Генерация журналов \{#generate-logs-managed\}

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${OTLP_AUTH_TOKEN}" \
        --protocol grpc --insecure \
        --rate 2 --duration 10 \
        logs multi
      ```

      ### Генерация метрик \{#generate-metrics-managed\}

      Подкоманды метрик не учитывают `--duration`. Запустите команду и через несколько секунд нажмите `Ctrl+C`, чтобы остановить её.

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${OTLP_AUTH_TOKEN}" \
        --protocol grpc --insecure \
        --rate 2 \
        metrics sum
      ```

      `otelgen` также поддерживает подкоманды `gauge`, `histogram`, `up-down-counter` и `exponential-histogram` в разделе `metrics`.

      ### Проверка в ClickStack \{#verify-managed\}

      Откройте интерфейс ClickStack из консоли ClickHouse Cloud. В представлении `Search` переключайте источник между `Logs` и `Traces`, чтобы убедиться, что появились новые события. Установите временной диапазон `Last 15 minutes`. Откройте `Chart Explorer`, выберите `Metrics` и постройте график по одному из имён метрик, созданных `otelgen` (например, `otelgen.metrics.sum`), чтобы проверить ингестию метрик.
    </VerticalStepper>
  </TabItem>

  <TabItem value="oss-clickstack" label="ClickStack с открытым исходным кодом">
    <VerticalStepper headerLevel="h3">
      ### Предварительные требования \{#prerequisites-oss\}

      В этом руководстве предполагается, что вы уже запустили Open Source ClickStack по [инструкции для all-in-one image](/use-cases/observability/clickstack/getting-started/oss) и что конечные точки OTLP (`4317` для gRPC и `4318` для HTTP) доступны. Также вам понадобится ключ API для приёма данных из интерфейса HyperDX: `Team Settings > API Keys`.

      ### Установка otelgen \{#install-otelgen-oss\}

      Установите с помощью Homebrew:

      ```shell
      brew install krzko/tap/otelgen
      ```

      Или установите с помощью Go:

      ```shell
      go install github.com/krzko/otelgen@latest
      ```

      ### Задайте переменные окружения \{#set-env-vars-oss\}

      Экспортируйте конечную точку коллектора и ключ API для приёма данных:

      ```shell
      export OTEL_ENDPOINT=localhost:4317
      export CLICKSTACK_API_KEY=<your_ingestion_api_key>
      ```

      ### Сгенерируйте traces \{#generate-traces-oss\}

      Отправьте короткую серию traces с несколькими span:

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${CLICKSTACK_API_KEY}" \
        --protocol grpc --insecure \
        --rate 2 --duration 10 \
        traces multi
      ```

      `--rate` — это число traces в секунду, а `--duration` — длительность выполнения в секундах. `--insecure` включает plaintext gRPC для локального коллектора.

      ### Сгенерируйте журналы \{#generate-logs-oss\}

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${CLICKSTACK_API_KEY}" \
        --protocol grpc --insecure \
        --rate 2 --duration 10 \
        logs multi
      ```

      ### Сгенерируйте метрики \{#generate-metrics-oss\}

      Подкоманды для метрик не учитывают `--duration`. Запустите команду и через несколько секунд нажмите `Ctrl+C`, чтобы остановить её.

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${CLICKSTACK_API_KEY}" \
        --protocol grpc --insecure \
        --rate 2 \
        metrics sum
      ```

      `otelgen` также поддерживает подкоманды `gauge`, `histogram`, `up-down-counter` и `exponential-histogram` в разделе `metrics`.

      ### Проверьте в ClickStack \{#verify-oss\}

      Откройте [http://localhost:8080](http://localhost:8080), чтобы перейти в интерфейс ClickStack. В представлении `Search` переключайте источник между `Logs` и `Traces`, чтобы убедиться, что новые события появились. Установите временной диапазон `Last 15 minutes`. Затем откройте `Chart Explorer`, выберите `Metrics` и постройте график по одному из имён метрик, созданных `otelgen` (например, `otelgen.metrics.sum`), чтобы проверить ингестию метрик.
    </VerticalStepper>
  </TabItem>
</Tabs>