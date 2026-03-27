---
slug: /use-cases/observability/clickstack/deployment/helm-deployment-options-v1
title: 'Варианты развертывания Helm (v1.x)'
pagination_prev: null
pagination_next: null
sidebar_position: 12
description: 'Расширенные варианты развертывания для Helm-чарта ClickStack v1.x'
doc_type: 'guide'
keywords: ['варианты развертывания ClickStack', 'внешний ClickHouse', 'внешний OTel', 'минимальное развертывание', 'конфигурация Helm']
---

:::warning Устарело — чарт v1.x
На этой странице описаны варианты развертывания для Helm-чарта **v1.x** с inline-template, который находится в режиме поддержки. Сведения о чарте v2.x см. в разделе [Варианты развертывания Helm](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options). Инструкции по миграции см. в [руководстве по обновлению](/docs/use-cases/observability/clickstack/deployment/helm-upgrade).
:::

В этом руководстве рассматриваются расширенные варианты развертывания ClickStack с помощью Helm. Инструкции по базовой установке см. в [основном руководстве по развертыванию Helm](/docs/use-cases/observability/clickstack/deployment/helm-v1).

## Обзор \{#overview\}

Helm-чарт ClickStack поддерживает несколько вариантов развертывания:

* **Полный стек** (по умолчанию) — включены все компоненты
* **Внешний ClickHouse** — использовать существующий кластер ClickHouse
* **Внешний OTel collector** — использовать существующую инфраструктуру OTel
* **Минимальное развертывание** — только HyperDX, внешние зависимости

## Внешний ClickHouse \{#external-clickhouse\}

Если у вас уже есть кластер ClickHouse (включая ClickHouse Cloud), вы можете отключить встроенный ClickHouse и подключиться к внешнему экземпляру.

### Вариант 1: Встроенная конфигурация (разработка/тестирование) \{#external-clickhouse-inline\}

Используйте этот подход для быстрого тестирования или в непроизводственных средах:

```yaml
# values-external-clickhouse.yaml
clickhouse:
  enabled: false  # Disable the built-in ClickHouse

otel:
  clickhouseEndpoint: "tcp://your-clickhouse-server:9000"
  clickhousePrometheusEndpoint: "http://your-clickhouse-server:9363"  # Optional

hyperdx:
  defaultConnections: |
    [
      {
        "name": "External ClickHouse",
        "host": "http://your-clickhouse-server:8123",
        "port": 8123,
        "username": "your-username",
        "password": "your-password"
      }
    ]
```

Установите, используя следующую конфигурацию:

```shell
helm install my-clickstack clickstack/clickstack -f values-external-clickhouse.yaml
```

### Вариант 2: Внешний секрет (рекомендуется для продакшена) \{#external-clickhouse-secret\}

Для развертываний в продакшене, где учетные данные нужно хранить отдельно от конфигурации Helm:

<VerticalStepper headerlevel="h4">
  #### Создайте файлы конфигурации \{#create-configuration\}

  ```bash
  # Создайте connections.json
  cat <<EOF > connections.json
  [
    {
      "name": "Production ClickHouse",
      "host": "https://your-production-clickhouse.com",
      "port": 8123,
      "username": "hyperdx_user",
      "password": "your-secure-password"
    }
  ]
  EOF

  # Создайте sources.json
  cat <<EOF > sources.json
  [
    {
      "from": {
        "databaseName": "default",
        "tableName": "otel_logs"
      },
      "kind": "log",
      "name": "Logs",
      "connection": "Production ClickHouse",
      "timestampValueExpression": "TimestampTime",
      "displayedTimestampValueExpression": "Timestamp",
      "implicitColumnExpression": "Body",
      "serviceNameExpression": "ServiceName",
      "bodyExpression": "Body",
      "eventAttributesExpression": "LogAttributes",
      "resourceAttributesExpression": "ResourceAttributes",
      "severityTextExpression": "SeverityText",
      "traceIdExpression": "TraceId",
      "spanIdExpression": "SpanId"
    },
    {
      "from": {
        "databaseName": "default",
        "tableName": "otel_traces"
      },
      "kind": "trace",
      "name": "Traces",
      "connection": "Production ClickHouse",
      "timestampValueExpression": "Timestamp",
      "displayedTimestampValueExpression": "Timestamp",
      "implicitColumnExpression": "SpanName",
      "serviceNameExpression": "ServiceName",
      "traceIdExpression": "TraceId",
      "spanIdExpression": "SpanId",
      "durationExpression": "Duration"
    }
  ]
  EOF
  ```

  #### Создайте секрет Kubernetes \{#create-kubernetes-secret\}

  ```bash
  kubectl create secret generic hyperdx-external-config \
    --from-file=connections.json=connections.json \
    --from-file=sources.json=sources.json

  # Удалите локальные файлы
  rm connections.json sources.json
  ```

  #### Настройте Helm для использования секрета \{#configure-helm-secret\}

  ```yaml
  # values-external-clickhouse-secret.yaml
  clickhouse:
    enabled: false

  otel:
    clickhouseEndpoint: "tcp://your-clickhouse-server:9000"
    clickhousePrometheusEndpoint: "http://your-clickhouse-server:9363"

  hyperdx:
    useExistingConfigSecret: true
    existingConfigSecret: "hyperdx-external-config"
    existingConfigConnectionsKey: "connections.json"
    existingConfigSourcesKey: "sources.json"
  ```

  ```shell
  helm install my-clickstack clickstack/clickstack -f values-external-clickhouse-secret.yaml
  ```
</VerticalStepper>

### Использование ClickHouse Cloud \{#using-clickhouse-cloud\}

Если вы используете ClickHouse Cloud:

```yaml
# values-clickhouse-cloud.yaml
clickhouse:
  enabled: false
  persistence:
    enabled: false

otel:
  clickhouseEndpoint: "tcp://your-cloud-instance.clickhouse.cloud:9440?secure=true"

hyperdx:
  useExistingConfigSecret: true
  existingConfigSecret: "clickhouse-cloud-config"
  existingConfigConnectionsKey: "connections.json"
  existingConfigSourcesKey: "sources.json"
```

## Внешний OTel collector \{#external-otel-collector\}

Если у вас уже развернута инфраструктура OTel collector:

```yaml
# values-external-otel.yaml
otel:
  enabled: false  # Disable the built-in OTEL collector

hyperdx:
  otelExporterEndpoint: "http://your-otel-collector:4318"
```

```shell
helm install my-clickstack clickstack/clickstack -f values-external-otel.yaml
```

Инструкции по публикации эндпоинтов OTel collector через Входной шлюз см. в разделе [Конфигурация Входного шлюза](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1#otel-collector-ingress).

## Минимальное развертывание \{#minimal-deployment\}

Если у организации уже есть своя инфраструктура, разверните только HyperDX:

```yaml
# values-minimal.yaml
clickhouse:
  enabled: false

otel:
  enabled: false

hyperdx:
  otelExporterEndpoint: "http://your-otel-collector:4318"

  # Option 1: Inline (for testing)
  defaultConnections: |
    [
      {
        "name": "External ClickHouse",
        "host": "http://your-clickhouse-server:8123",
        "port": 8123,
        "username": "your-username",
        "password": "your-password"
      }
    ]

  # Option 2: External secret (production)
  # useExistingConfigSecret: true
  # existingConfigSecret: "my-external-config"
  # existingConfigConnectionsKey: "connections.json"
  # existingConfigSourcesKey: "sources.json"
```

```shell
helm install my-clickstack clickstack/clickstack -f values-minimal.yaml
```

## Следующие шаги \{#next-steps\}

* [Руководство по настройке (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - настройка API-ключей, секретов и входного шлюза
* [Развертывания в Cloud (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - конфигурации для GKE, EKS и AKS
* [Основное руководство по Helm (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-v1) - базовая установка
* [Варианты развертывания (v2.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - варианты развертывания для v2.x
* [Руководство по обновлению](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - переход с v1.x на v2.x