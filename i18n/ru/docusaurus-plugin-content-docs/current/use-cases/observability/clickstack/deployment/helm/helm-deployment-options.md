---
slug: /use-cases/observability/clickstack/deployment/helm-deployment-options
title: 'Варианты развертывания с помощью Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'Расширенные конфигурации развертывания ClickStack с помощью Helm'
doc_type: 'guide'
keywords: ['варианты развертывания ClickStack', 'внешний ClickHouse', 'внешний OTel', 'минимальное развертывание', 'конфигурация Helm']
---

В этом руководстве рассматриваются расширенные варианты развертывания ClickStack с помощью Helm. Для базовой установки см. [основное руководство по развертыванию с помощью Helm](/docs/use-cases/observability/clickstack/deployment/helm).



## Обзор {#overview}

Helm-чарт ClickStack поддерживает несколько вариантов развертывания:
- **Полный стек** (по умолчанию) — включает все компоненты
- **Внешний ClickHouse** — использование существующего кластера ClickHouse
- **Внешний OTel collector** — использование существующей инфраструктуры OTel
- **Минимальное развертывание** — только HyperDX, внешние зависимости



## Внешний ClickHouse {#external-clickhouse}

Если у вас уже есть кластер ClickHouse (включая ClickHouse Cloud), вы можете отключить встроенный ClickHouse и подключиться к внешнему экземпляру.

### Вариант 1: Встроенная конфигурация (разработка/тестирование) {#external-clickhouse-inline}



Используйте этот подход для быстрого тестирования или непромышленных окружений:

```yaml
# values-external-clickhouse.yaml
clickhouse:
  enabled: false # Отключить встроенный ClickHouse

otel:
  clickhouseEndpoint: "tcp://your-clickhouse-server:9000"
  clickhousePrometheusEndpoint: "http://your-clickhouse-server:9363" # Необязательно

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

Установите с данной конфигурацией:

```shell
helm install my-clickstack clickstack/clickstack -f values-external-clickhouse.yaml
```

### Вариант 2: Внешний секрет (рекомендуется для промышленного использования) {#external-clickhouse-secret}

Для промышленных развертываний, где требуется хранить учетные данные отдельно от конфигурации Helm:

<VerticalStepper headerlevel='h4'>


#### Создайте файлы конфигурации

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


# Очистить локальные файлы

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


Для ClickHouse Cloud:

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

Полный пример подключения к ClickHouse Cloud см. в разделе [&quot;Создание подключения к ClickHouse Cloud&quot;](/docs/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).


## Внешний OTel collector {#external-otel-collector}



Если у вас уже есть инфраструктура OTel collector&#39;а:

```yaml
# values-external-otel.yaml
otel:
  enabled: false  # Отключить встроенный OTel collector

hyperdx:
  otelExporterEndpoint: "http://your-otel-collector:4318"
```

```shell
helm install my-clickstack clickstack/clickstack -f values-external-otel.yaml
```

Инструкции по предоставлению доступа к конечным точкам OTel collector через входной шлюз см. в разделе [Ingress Configuration](/docs/use-cases/observability/clickstack/deployment/helm-configuration#otel-collector-ingress).


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


## Дальнейшие действия {#next-steps}

- [Руководство по настройке](/docs/use-cases/observability/clickstack/deployment/helm-configuration) — настройка API-ключей, секретов и входного шлюза
- [Облачные развертывания](/docs/use-cases/observability/clickstack/deployment/helm-cloud) — конфигурации для GKE, EKS и AKS
- [Основное руководство по Helm](/docs/use-cases/observability/clickstack/deployment/helm) — базовая установка
