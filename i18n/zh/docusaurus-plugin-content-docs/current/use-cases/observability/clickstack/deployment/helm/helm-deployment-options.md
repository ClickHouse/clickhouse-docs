---
slug: /use-cases/observability/clickstack/deployment/helm-deployment-options
title: 'Helm 部署选项'
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: '使用 Helm 对 ClickStack 进行高级部署配置'
doc_type: 'guide'
keywords: ['ClickStack 部署选项', '外部 ClickHouse', '外部 OTel', '最小化部署', 'Helm 配置']
---

本指南介绍使用 Helm 对 ClickStack 进行高级部署选项。有关基础安装，请参阅 [Helm 部署基础指南](/docs/use-cases/observability/clickstack/deployment/helm)。

## 概览 \\{#overview\\}

ClickStack 的 Helm 图表支持多种部署配置：

- **全栈**（默认） - 包含所有组件
- **外部 ClickHouse** - 使用现有的 ClickHouse 集群
- **外部 OTel collector** - 使用现有的 OTel 基础设施
- **最小部署** - 仅包含 HyperDX，依赖外部组件

## 外部 ClickHouse \\{#external-clickhouse\\}

如果你已经有一个现有的 ClickHouse 集群（包括 ClickHouse Cloud），可以禁用内置的 ClickHouse，并连接到你的外部实例。

### 选项 1：内联配置（开发/测试） \\{#external-clickhouse-inline\\}

此方法适用于快速测试或非生产环境：

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

使用如下配置进行安装：

```shell
helm install my-clickstack clickstack/clickstack -f values-external-clickhouse.yaml
```

### 选项 2：外部 Secret（推荐用于生产环境） \\{#external-clickhouse-secret\\}

对于生产环境部署，如果希望将凭证与 Helm 配置分离：

<VerticalStepper headerlevel='h4'>

#### 创建配置文件 \\{#create-configuration\\}
```bash
# Create connections.json
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

# Create sources.json
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

#### 创建 Kubernetes Secret \\{#create-kubernetes-secret\\}
```bash
kubectl create secret generic hyperdx-external-config \
  --from-file=connections.json=connections.json \
  --from-file=sources.json=sources.json

# Clean up local files
rm connections.json sources.json
```

#### 配置 Helm 使用该 Secret \\{#configure-helm-secret\\}
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

### 使用 ClickHouse Cloud \\{#using-clickhouse-cloud\\}

专门针对 ClickHouse Cloud：

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

有关连接 ClickHouse Cloud 的完整示例，请参阅[《创建 ClickHouse Cloud 连接》](/docs/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。

## 外部 OTel collector \\{#external-otel-collector\\}

如果你已经有现成的 OTel collector 基础设施：

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

有关如何通过入口暴露 OTel collector 端点的说明，请参阅 [入口配置](/docs/use-cases/observability/clickstack/deployment/helm-configuration#otel-collector-ingress)。

## 最小部署 \\{#minimal-deployment\\}

对于已有基础设施的组织，只需部署 HyperDX 即可：

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

## 后续步骤 \\{#next-steps\\}

- [配置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API 密钥、机密信息和入口配置
- [云端部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS 和 AKS 专用配置
- [Helm 主指南](/docs/use-cases/observability/clickstack/deployment/helm) - 基础安装