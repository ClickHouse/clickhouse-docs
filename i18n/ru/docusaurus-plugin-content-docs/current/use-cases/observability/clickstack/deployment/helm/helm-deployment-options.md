---
slug: /use-cases/observability/clickstack/deployment/helm-deployment-options
title: 'Варианты развертывания с помощью Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'Расширенные варианты конфигурации развертывания ClickStack с помощью Helm'
doc_type: 'guide'
keywords: ['варианты развертывания ClickStack', 'внешний ClickHouse', 'внешний OTEL', 'минимальное развертывание', 'конфигурация Helm']
---

В этом руководстве описаны расширенные варианты развертывания ClickStack с помощью Helm. О базовой установке см. [основное руководство по развертыванию с помощью Helm](/docs/use-cases/observability/clickstack/deployment/helm).



## Обзор {#overview}

Helm-чарт ClickStack поддерживает несколько конфигураций развертывания:

- **Полный стек** (по умолчанию) — все компоненты включены
- **Внешний ClickHouse** — использование существующего кластера ClickHouse
- **Внешний OTEL Collector** — использование существующей инфраструктуры OTEL
- **Минимальное развертывание** — только HyperDX с внешними зависимостями


## Внешний ClickHouse {#external-clickhouse}

Если у вас уже есть кластер ClickHouse (включая ClickHouse Cloud), вы можете отключить встроенный ClickHouse и подключиться к внешнему экземпляру.

### Вариант 1: Встроенная конфигурация (разработка/тестирование) {#external-clickhouse-inline}


Используйте этот подход для быстрого тестирования или непродуктивных окружений:

```yaml
# values-external-clickhouse.yaml
clickhouse:
  enabled: false # Отключить встроенный ClickHouse

otel:
  clickhouseEndpoint: "tcp://your-clickhouse-server:9000"
  clickhousePrometheusEndpoint: "http://your-clickhouse-server:9363" # Опционально

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

Установите с этой конфигурацией:

```shell
helm install my-clickstack clickstack/clickstack -f values-external-clickhouse.yaml
```

### Вариант 2: Внешний секрет (рекомендуется для продуктивных окружений) {#external-clickhouse-secret}

Для продуктивных развертываний, где требуется хранить учетные данные отдельно от конфигурации Helm:

<VerticalStepper headerlevel='h4'>


#### Создайте файлы конфигурации {#create-configuration}

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

```


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

````

#### Создайте секрет Kubernetes {#create-kubernetes-secret}
```bash
kubectl create secret generic hyperdx-external-config \
  --from-file=connections.json=connections.json \
  --from-file=sources.json=sources.json

````


# Очистите локальные файлы

rm connections.json sources.json

```
```


#### Настройка Helm для использования секрета {#configure-helm-secret}

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

### Использование ClickHouse Cloud {#using-clickhouse-cloud}


В частности, для ClickHouse Cloud:

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

Полный пример подключения к ClickHouse Cloud см. в разделе [«Создание подключения к ClickHouse Cloud»](/docs/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).


## Внешний коллектор OTEL {#external-otel-collector}


Если у вас уже развернута инфраструктура сборщика OTEL:

```yaml
# values-external-otel.yaml
otel:
  enabled: false  # Отключить встроенный коллектор OTEL

hyperdx:
  otelExporterEndpoint: "http://your-otel-collector:4318"
```

```shell
helm install my-clickstack clickstack/clickstack -f values-external-otel.yaml
```

Инструкции по публикации конечных точек коллектора OTEL через Ingress см. в разделе [Ingress Configuration](/docs/use-cases/observability/clickstack/deployment/helm-configuration#otel-collector-ingress).


## Минимальное развертывание {#minimal-deployment}


Для организаций с уже существующей инфраструктурой разверните только HyperDX:

```yaml
# values-minimal.yaml
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
        "name": "Внешний ClickHouse",
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

- [Руководство по конфигурации](/docs/use-cases/observability/clickstack/deployment/helm-configuration) — настройка API-ключей, секретов и ingress
- [Облачные развертывания](/docs/use-cases/observability/clickstack/deployment/helm-cloud) — конфигурации для GKE, EKS и AKS
- [Основное руководство по Helm](/docs/use-cases/observability/clickstack/deployment/helm) — базовая установка
