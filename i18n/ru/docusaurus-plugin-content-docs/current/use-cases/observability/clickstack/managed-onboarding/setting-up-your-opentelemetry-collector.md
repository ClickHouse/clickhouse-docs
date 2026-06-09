---
slug: /use-cases/observability/clickstack/setting-up-your-opentelemetry-collector
title: 'Настройка OpenTelemetry Collector'
description: 'Настройка OpenTelemetry Collector для Управляемого ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'opentelemetry', 'collector', 'managed', 'observability', 'gateway', 'otelgen']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import GatherCredentials from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/managed-onboarding/_snippets/_gather_credentials.md';
import CreateIngestionUser from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/managed-onboarding/_snippets/_create_ingestion_user.md';
import ConfirmInUI from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/managed-onboarding/_snippets/_confirm_in_ui.md';

Это руководство поможет вам развернуть OpenTelemetry Collector для существующего сервиса Управляемого ClickStack или адаптировать уже существующий коллектор, а затем проверить, что данные проходят через него.

Коллектор работает как **шлюз**: это единая конечная точка OTLP, в которую отправляют данные ваши приложения, SDK и коллекторы-агенты. Шлюз объединяет события в батчи, применяет настроенную вами обработку и записывает их в ClickHouse через [экспортер ClickHouse](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter). Такой подход позволяет вынести логику сбора из прикладного кода и масштабировать ингестию независимо от рабочих нагрузок, создающих данные. Подробнее о ролях шлюза и агента см. в разделе [Роли коллектора](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles).

:::note Существующий коллектор
Если вы используете существующий OpenTelemetry Collector, мы предполагаем, что он уже настроен в роли **шлюза**. Мы не рекомендуем использовать этот процесс для перенастройки коллекторов в роли **агента**.
:::

Выберите вкладку, соответствующую вашей ситуации:

<Tabs groupId="otel-collector-setup">
  <TabItem value="new-collector" label="У меня нет коллектора" default>
    <VerticalStepper headerLevel="h2">
      ## Получите учётные данные \{#gather-credentials\}

      <GatherCredentials />

      ## Создание пользователя для ингестии \{#create-ingestion-user\}

      <CreateIngestionUser />

      ## Развёртывание коллектора \{#deploy-the-collector\}

      Разверните **дистрибутив OpenTelemetry Collector от ClickStack**, который предварительно настроен для Управляемого ClickStack. В примере ниже мы запускаем коллектор локально и для простоты генерируем искусственные данные телеметрии на той же машине.

      :::note
      В производственной среде коллектор, как правило, развёртывается в кластере Kubernetes или на виртуальной машине, доступной для ваших OpenTelemetry SDK, агентов и других коллекторов. Это позволяет централизованно собирать телеметрию со всей среды и пересылать её в ClickStack.
      :::

      Выберите общий секрет для аутентификации клиентов, отправляющих данные в коллектор, затем экспортируйте его вместе со сведениями о подключении и паролем для пользователя `hyperdx_ingest`:

      ```shell
      export CLICKHOUSE_ENDPOINT=<HTTPS_ENDPOINT>
      export CLICKHOUSE_USER=hyperdx_ingest
      export CLICKHOUSE_PASSWORD=ClickH0u3eRocks123!
      export OTLP_AUTH_TOKEN="a-strong-shared-secret"
      ```

      Запустите ClickStack OTel collector:

      ```shell
      docker run -d \
        -e OTLP_AUTH_TOKEN=${OTLP_AUTH_TOKEN} \
        -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
        -e CLICKHOUSE_USER=${CLICKHOUSE_USER} \
        -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
        -e HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE=otel \
        -p 4317:4317 \
        -p 4318:4318 \
        clickhouse/clickstack-otel-collector:latest
      ```

      Теперь коллектор принимает OTLP gRPC на порту `4317` и OTLP HTTP на порту `4318`. Приложения, SDK и агентские коллекторы должны отправлять данные на эти порты, передавая заголовок `authorization: $OTLP_AUTH_TOKEN` в запросе.

      :::note[Производственные развертывания]
      Для производственных сред рекомендуется включить TLS на конечной точке OTLP. См. раздел [Защита коллектора](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector).
      :::

      ## Проверка конечной точки \{#verify-the-endpoint\}

      Сгенерируйте синтетический трафик на коллектор, чтобы убедиться в корректной работе всего конвейера. Для этого используется [`otelgen`](https://github.com/krzko/otelgen) — небольшой CLI-инструмент, который отправляет журналы, трассировки и метрики по протоколу OTLP.

      Установите `otelgen` с помощью Homebrew:

      ```shell
      brew install krzko/tap/otelgen
      ```

      Или с Go:

      ```shell
      go install github.com/krzko/otelgen@latest
      ```

      Отправьте небольшую серию записей журнала в collector:

      ```shell
       otelgen \
        --otel-exporter-otlp-endpoint localhost:4317 \
        --insecure \
        --protocol grpc \
        --header "authorization=${OTLP_AUTH_TOKEN}" \
        --rate 5 \
        --duration 60 \
        logs multi
      ```

      Аналогичные команды для трассировок и метрик, а также обзор остальных подкоманд `otelgen` см. в разделе [Синтетические данные с otelgen](/use-cases/observability/clickstack/getting-started/otelgen).

      ## Подтверждение в интерфейсе ClickStack \{#confirm-in-ui\}

      <ConfirmInUI />
    </VerticalStepper>
  </TabItem>

  <TabItem value="existing-collector" label="У меня есть коллектор">
    <VerticalStepper headerLevel="h2">
      ## Получите учётные данные \{#gather-credentials-existing\}

      <GatherCredentials />

      ## Создание пользователя для ингестии \{#create-ingestion-user-existing\}

      <CreateIngestionUser />

      ## Адаптация конфигурации коллектора \{#adapt-collector\}

      Расширьте существующую конфигурацию коллектора для записи данных в Управляемый ClickStack через [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter).

      :::note Требуется экспортёр ClickHouse
      Если вы используете собственный дистрибутив, убедитесь, что он включает экспортёр ClickHouse. В upstream-образе [contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib) он уже присутствует.
      :::

      Ниже приведён пример конфигурации, в которой используется экспортёр ClickHouse с приёмниками, процессорами и конвейерами, ожидаемыми интерфейсом ClickStack. Она воспроизводит поведение дистрибутива ClickStack, включая маршрут воспроизведения сеанса (`rrweb`). Замените `<clickhouse_cloud_endpoint>` и `<your_password_here>` на учётные данные пользователя `hyperdx_ingest`, созданного выше:

      ```yaml
      receivers:
        otlp/hyperdx:
          protocols:
            grpc:
              include_metadata: true
              endpoint: "0.0.0.0:4317"
            http:
              cors:
                allowed_origins: ["*"]
                allowed_headers: ["*"]
              include_metadata: true
              endpoint: "0.0.0.0:4318"

      processors:
        batch:
        memory_limiter:
          # 80% of maximum memory up to 2G, adjust for low memory environments
          limit_mib: 1500
          # 25% of limit up to 2G, adjust for low memory environments
          spike_limit_mib: 512
          check_interval: 5s

      connectors:
        routing/logs:
          default_pipelines: [logs/out-default]
          error_mode: ignore
          table:
            - context: log
              statement: route() where IsMatch(attributes["rr-web.event"], ".*")
              pipelines: [logs/out-rrweb]

      exporters:
        clickhouse:
          database: otel
          endpoint: <clickhouse_cloud_endpoint>
          username: hyperdx_ingest
          password: <your_password_here>
          ttl: 720h
          timeout: 5s
          retry_on_failure:
            enabled: true
            initial_interval: 5s
            max_interval: 30s
            max_elapsed_time: 300s
        clickhouse/rrweb:
          database: otel
          endpoint: <clickhouse_cloud_endpoint>
          username: hyperdx_ingest
          password: <your_password_here>
          ttl: 720h
          logs_table_name: hyperdx_sessions
          timeout: 5s
          retry_on_failure:
            enabled: true
            initial_interval: 5s
            max_interval: 30s
            max_elapsed_time: 300s

      service:
        pipelines:
          traces:
            receivers: [otlp/hyperdx]
            processors: [memory_limiter, batch]
            exporters: [clickhouse]
          metrics:
            receivers: [otlp/hyperdx]
            processors: [memory_limiter, batch]
            exporters: [clickhouse]
          logs/in:
            receivers: [otlp/hyperdx]
            exporters: [routing/logs]
          logs/out-default:
            receivers: [routing/logs]
            processors: [memory_limiter, batch]
            exporters: [clickhouse]
          logs/out-rrweb:
            receivers: [routing/logs]
            processors: [memory_limiter, batch]
            exporters: [clickhouse/rrweb]
      ```

      Несколько важных замечаний:

      * Приёмник `otlp/hyperdx` принимает соединения по gRPC (`4317`) и HTTP (`4318`); приложения и агенты должны обращаться к этим портам на хосте, где работает ваш коллектор.
      * Экспортёр `clickhouse` записывает журналы, трассировки и метрики в базу данных `otel` в соответствии со схемой, которую ожидает интерфейс ClickStack. Экспортёр `clickhouse/rrweb` обрабатывает события воспроизведения сеанса, которые коннектор `routing/logs` направляет в `otel.hyperdx_sessions`.
      * Аутентификация на OTLP-приёмниках зависит от вашей текущей конфигурации. Настройте её через [расширения](https://opentelemetry.io/docs/collector/configuration/#extensions) коллектора (например, `bearertokenauth`) или через обратный прокси с TLS, если нужно сделать токен ингестии обязательным.

      Перезагрузите коллектор с новой конфигурацией. После этого приложения, SDK и агентские коллекторы должны отправлять данные на конечные точки OTLP, открытые вашим коллектором, передавая заголовок аутентификации, требуемый вашей конфигурацией.

      Дополнительные сведения о настройке коллекторов OpenTelemetry для работы с Управляемым ClickStack см. в разделе [Приём данных с помощью OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry).

      ## Проверка конечной точки \{#verify-the-endpoint-existing\}

      Сгенерируйте синтетический трафик на ваш коллектор, чтобы убедиться в корректной работе всего конвейера. Для этого используется [`otelgen`](https://github.com/krzko/otelgen) — небольшой CLI-инструмент, который отправляет журналы, трассировки и метрики по протоколу OTLP.

      Установите `otelgen` с помощью Homebrew:

      ```shell
      brew install krzko/tap/otelgen
      ```

      Или с Go:

      ```shell
      go install github.com/krzko/otelgen@latest
      ```

      Отправьте небольшую серию записей журнала в коллектор. Замените `<your-collector-host>` на хост, на котором слушает ваш коллектор, и задайте заголовок `authorization` (или альтернативный метод аутентификации) в соответствии с тем, что ожидает ваш коллектор:

      ```shell
       otelgen \
        --otel-exporter-otlp-endpoint <your-collector-host>:4317 \
        --insecure \
        --protocol grpc \
        --header "authorization=<your-auth-token>" \
        --rate 5 \
        --duration 60 \
        logs multi
      ```

      Аналогичные команды для трассировок и метрик, а также обзор остальных подкоманд `otelgen` см. в разделе [Синтетические данные с otelgen](/use-cases/observability/clickstack/getting-started/otelgen).

      ## Подтверждение в интерфейсе ClickStack \{#confirm-in-ui-existing\}

      <ConfirmInUI />
    </VerticalStepper>
  </TabItem>
</Tabs>

## Дополнительные материалы \{#further-reading\}

В этом руководстве рассматривается один экземпляр коллектора в самой простой конфигурации. В [справочнике по OpenTelemetry Collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) описано, что делать дальше:

* [Защита коллектора](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector) с использованием TLS на конечной точке OTLP и пользователей для ингестии с минимально необходимыми привилегиями.
* [Обработка, фильтрация и обогащение](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching) событий на шлюзе.
* [Расширение конфигурации коллектора](/use-cases/observability/clickstack/ingesting-data/otel-collector#extending-collector-config) с помощью пользовательских приёмников, процессоров и конвейеров.
* [Оценка ресурсов](/use-cases/observability/clickstack/ingesting-data/otel-collector#estimating-resources) для развертываний шлюза и агента с учётом ожидаемой пропускной способности.
* [Переход в промышленную эксплуатацию](/use-cases/observability/clickstack/production)