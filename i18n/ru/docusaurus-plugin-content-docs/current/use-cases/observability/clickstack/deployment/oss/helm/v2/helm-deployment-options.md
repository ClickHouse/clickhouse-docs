---
slug: /use-cases/observability/clickstack/deployment/helm-deployment-options
title: 'Варианты развертывания с Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'Расширенные параметры развертывания ClickStack с Helm'
doc_type: 'guide'
keywords: ['варианты развертывания ClickStack', 'внешний ClickHouse', 'внешний OTEL', 'минимальное развертывание', 'конфигурация Helm']
---

:::warning Версия чарта 2.x
На этой странице описывается Helm-чарт **v2.x** на основе субчартов. Если вы всё ещё используете чарт v1.x со встроенными шаблонами, см. [варианты развертывания с Helm (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1). Инструкции по миграции см. в [руководстве по обновлению](/docs/use-cases/observability/clickstack/deployment/helm-upgrade).
:::

В этом руководстве рассматриваются расширенные варианты развертывания ClickStack с помощью Helm. Инструкции по базовой установке см. в [основном руководстве по развертыванию с Helm](/docs/use-cases/observability/clickstack/deployment/helm).

## Обзор \{#overview\}

Helm-чарт ClickStack поддерживает несколько вариантов развертывания:

* **Полный стек** (по умолчанию) — включены все компоненты, управление осуществляется операторами
* **Внешний ClickHouse** — используется существующий кластер ClickHouse
* **Внешний OTel collector** — используется существующая инфраструктура OTel
* **Минимальное развертывание** — только HyperDX и внешние зависимости

## Внешний ClickHouse \{#external-clickhouse\}

Если у вас уже есть кластер ClickHouse (включая ClickHouse Cloud), вы можете отключить встроенный ClickHouse и подключиться к внешнему экземпляру ClickHouse.

### Вариант 1: Встроенная конфигурация (разработка/тестирование) \{#external-clickhouse-inline\}

Используйте этот подход для быстрого тестирования или в непроизводственных средах. Укажите параметры подключения через `hyperdx.config` и `hyperdx.secrets`:

```yaml
# values-external-clickhouse.yaml
clickhouse:
  enabled: false  # Disable the operator-managed ClickHouse

hyperdx:
  secrets:
    CLICKHOUSE_PASSWORD: "your-password"
    CLICKHOUSE_APP_PASSWORD: "your-password"

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

Для продакшен-развертываний, где учетные данные должны храниться отдельно от конфигурации Helm:

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

Для ClickHouse Cloud:

```yaml
# values-clickhouse-cloud.yaml
clickhouse:
  enabled: false

hyperdx:
  secrets:
    CLICKHOUSE_PASSWORD: "your-cloud-password"
    CLICKHOUSE_APP_PASSWORD: "your-cloud-password"

  useExistingConfigSecret: true
  existingConfigSecret: "clickhouse-cloud-config"
  existingConfigConnectionsKey: "connections.json"
  existingConfigSourcesKey: "sources.json"
```

## Внешний OTEL collector \{#external-otel-collector\}

Если у вас уже есть инфраструктура OTEL collector, отключите субчарт:

```yaml
# values-external-otel.yaml
otel-collector:
  enabled: false  # Disable the subchart OTEL collector

hyperdx:
  otelExporterEndpoint: "http://your-otel-collector:4318"
```

```shell
helm install my-clickstack clickstack/clickstack -f values-external-otel.yaml
```

Инструкции по публикации конечных точек OTel collector через входной шлюз см. в разделе [Конфигурация входного шлюза](/docs/use-cases/observability/clickstack/deployment/helm-configuration#otel-collector-ingress).

## Минимальное развертывание \{#minimal-deployment\}

Если у организации уже есть необходимая инфраструктура, разверните только HyperDX:

```yaml
# values-minimal.yaml
clickhouse:
  enabled: false

otel-collector:
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

* [Руководство по настройке](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API-ключи, секреты и настройка входного шлюза
* [Развертывания в Cloud](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - конфигурации для GKE, EKS и AKS
* [Руководство по обновлению](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - миграция с v1.x на v2.x
* [Дополнительные манифесты](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) - пользовательские объекты Kubernetes
* [Основное руководство по Helm](/docs/use-cases/observability/clickstack/deployment/helm) - базовая установка
* [Варианты развертывания (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1) - варианты развертывания v1.x