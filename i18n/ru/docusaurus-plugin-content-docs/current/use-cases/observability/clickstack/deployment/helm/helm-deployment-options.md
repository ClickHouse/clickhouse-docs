---
slug: /use-cases/observability/clickstack/deployment/helm-deployment-options
title: 'Варианты развертывания с помощью Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'Расширенные варианты конфигурации развертывания ClickStack с помощью Helm'
doc_type: 'guide'
keywords: ['варианты развертывания ClickStack', 'внешний ClickHouse', 'внешний OTel', 'минимальное развертывание', 'конфигурация Helm']
---

В этом руководстве рассматриваются расширенные варианты развертывания ClickStack с помощью Helm. Инструкции по базовой установке приведены в [основном руководстве по развертыванию с помощью Helm](/docs/use-cases/observability/clickstack/deployment/helm).

## Обзор {#overview}

Helm-чарт ClickStack поддерживает несколько вариантов развертывания:

- **Полный стек** (по умолчанию) — включены все компоненты
- **Внешний ClickHouse** — использовать существующий кластер ClickHouse
- **Внешний OTel collector** — использовать существующую инфраструктуру OTel
- **Минимальное развертывание** — только HyperDX, внешние зависимости

## Внешний ClickHouse {#external-clickhouse}

Если у вас уже есть кластер ClickHouse (включая ClickHouse Cloud), вы можете отключить встроенный ClickHouse и подключиться к вашему внешнему экземпляру.

### Вариант 1: Встроенная конфигурация (разработка/тестирование) {#external-clickhouse-inline}

Используйте этот подход для быстрого тестирования или в непродуктивных средах:

```yaml
# values-external-clickhouse.yaml {#values-external-clickhouseyaml}
clickhouse:
  enabled: false  # Отключить встроенный ClickHouse

otel:
  clickhouseEndpoint: "tcp://your-clickhouse-server:9000"
  clickhousePrometheusEndpoint: "http://your-clickhouse-server:9363"  # Опционально

hyperdx:
  defaultConnections: |
    [
      {
        "name": "Внешний ClickHouse",
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


### Вариант 2: Внешний секрет (рекомендуется для production) {#external-clickhouse-secret}

Для production-развертываний, где вы хотите хранить учетные данные отдельно от конфигурации Helm:

<VerticalStepper headerlevel='h4'>

#### Создайте файлы конфигурации {#create-configuration}
```bash
# Создайте connections.json {#create-connectionsjson}
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

# Создайте sources.json {#create-sourcesjson}
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

#### Создайте секрет Kubernetes {#create-kubernetes-secret}
```bash
kubectl create secret generic hyperdx-external-config \
  --from-file=connections.json=connections.json \
  --from-file=sources.json=sources.json

# Удалите локальные файлы {#clean-up-local-files}
rm connections.json sources.json
```

#### Настройте Helm для использования секрета {#configure-helm-secret}
```yaml
# values-external-clickhouse-secret.yaml {#values-external-clickhouse-secretyaml}
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

### Использование ClickHouse Cloud {#using-clickhouse-cloud}

Для ClickHouse Cloud:

```yaml
# values-clickhouse-cloud.yaml {#values-clickhouse-cloudyaml}
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

Подробный пример подключения к ClickHouse Cloud см. в разделе [«Создание подключения к ClickHouse Cloud»](/docs/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).


## Внешний OTel collector {#external-otel-collector}

Если у вас уже есть инфраструктура OTel collector:

```yaml
# values-external-otel.yaml {#values-external-otelyaml}
otel:
  enabled: false  # Отключить встроенный OTel collector

hyperdx:
  otelExporterEndpoint: "http://your-otel-collector:4318"
```

```shell
helm install my-clickstack clickstack/clickstack -f values-external-otel.yaml
```

См. раздел [Настройка входного шлюза](/docs/use-cases/observability/clickstack/deployment/helm-configuration#otel-collector-ingress) для инструкций по публикации конечных точек OTel collector через входной шлюз.


## Минимальное развертывание {#minimal-deployment}

Для организаций с уже существующей инфраструктурой достаточно развернуть только HyperDX:

```yaml
# values-minimal.yaml {#values-minimalyaml}
clickhouse:
  enabled: false

otel:
  enabled: false

hyperdx:
  otelExporterEndpoint: "http://your-otel-collector:4318"
  
  # Вариант 1: Встроенная конфигурация (для тестирования)
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
  
  # Вариант 2: Внешний секрет (для production)
  # useExistingConfigSecret: true
  # existingConfigSecret: "my-external-config"
  # existingConfigConnectionsKey: "connections.json"
  # existingConfigSourcesKey: "sources.json"
```

```shell
helm install my-clickstack clickstack/clickstack -f values-minimal.yaml
```


## Следующие шаги {#next-steps}

- [Руководство по настройке](/docs/use-cases/observability/clickstack/deployment/helm-configuration) — ключи API, секреты и настройка входного шлюза
- [Облачные развертывания](/docs/use-cases/observability/clickstack/deployment/helm-cloud) — конфигурации для GKE, EKS и AKS
- [Основное руководство по Helm](/docs/use-cases/observability/clickstack/deployment/helm) — базовая установка