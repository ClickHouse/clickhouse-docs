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

本指南介绍使用 Helm 部署 ClickStack 时的高级部署选项。有关基本安装，请参阅[主 Helm 部署指南](/docs/use-cases/observability/clickstack/deployment/helm)。



## 概览 {#overview}

ClickStack 的 Helm 图表支持多种部署配置：
- **完整栈**（默认）- 包含所有组件
- **外部 ClickHouse** - 使用现有的 ClickHouse 集群
- **外部 OTel Collector** - 使用现有的 OTel 基础设施
- **最小部署** - 仅包含 HyperDX，其余依赖由外部提供



## 外部 ClickHouse {#external-clickhouse}

如果已经有现有的 ClickHouse 集群（包括 ClickHouse Cloud），可以禁用内置的 ClickHouse，并连接到外部实例。

### 选项 1：内联配置（开发/测试） {#external-clickhouse-inline}



使用此方法进行快速测试或非生产环境：

```yaml
# values-external-clickhouse.yaml
clickhouse:
  enabled: false # 禁用内置 ClickHouse

otel:
  clickhouseEndpoint: "tcp://your-clickhouse-server:9000"
  clickhousePrometheusEndpoint: "http://your-clickhouse-server:9363" # 可选

hyperdx:
  defaultConnections: |
    [
      {
        "name": "外部 ClickHouse",
        "host": "http://your-clickhouse-server:8123",
        "port": 8123,
        "username": "your-username",
        "password": "your-password"
      }
    ]
```

使用此配置进行安装：

```shell
helm install my-clickstack clickstack/clickstack -f values-external-clickhouse.yaml
```

### 选项 2：外部密钥（推荐用于生产环境）{#external-clickhouse-secret}

对于需要将凭据与 Helm 配置分离的生产部署：

<VerticalStepper headerlevel='h4'>


#### 创建配置文件

```bash
# 创建 connections.json
cat <<EOF > connections.json
[
  {
    "name": "生产 ClickHouse",
    "host": "https://your-production-clickhouse.com",
    "port": 8123,
    "username": "hyperdx_user",
    "password": "your-secure-password"
  }
]
EOF
```


# 创建 sources.json

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

#### 创建 Kubernetes Secret {#create-kubernetes-secret}
```bash
kubectl create secret generic hyperdx-external-config \
  --from-file=connections.json=connections.json \
  --from-file=sources.json=sources.json

````


# 删除本地文件

rm connections.json sources.json

```
```


#### 配置 Helm 以使用 Secret {#configure-helm-secret}

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

### 使用 ClickHouse Cloud {#using-clickhouse-cloud}


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

有关连接 ClickHouse Cloud 的完整示例，请参阅[“创建 ClickHouse Cloud 连接”](/docs/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。


## 外部 OTel Collector {#external-otel-collector}



如果你已经有 OTel collector 基础设施：

```yaml
# values-external-otel.yaml
otel:
  enabled: false  # 禁用内置 OTel collector

hyperdx:
  otelExporterEndpoint: "http://your-otel-collector:4318"
```

```shell
helm install my-clickstack clickstack/clickstack -f values-external-otel.yaml
```

如需了解如何通过入口暴露 OTel collector 端点，请参见 [Ingress Configuration](/docs/use-cases/observability/clickstack/deployment/helm-configuration#otel-collector-ingress)。


## 最小部署 {#minimal-deployment}



对于已有基础设施的组织，仅部署 HyperDX：

```yaml
# values-minimal.yaml
clickhouse:
  enabled: false

otel:
  enabled: false

hyperdx:
  otelExporterEndpoint: "http://your-otel-collector:4318"
  
  # 选项 1：内联配置（用于测试）
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
  
  # 选项 2：外部 Secret（用于生产环境）
  # useExistingConfigSecret: true
  # existingConfigSecret: "my-external-config"
  # existingConfigConnectionsKey: "connections.json"
  # existingConfigSourcesKey: "sources.json"
```

```shell
helm install my-clickstack clickstack/clickstack -f values-minimal.yaml
```


## 后续步骤 {#next-steps}

- [配置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API keys、机密和入口配置
- [云部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS 和 AKS 专用配置
- [Helm 使用指南](/docs/use-cases/observability/clickstack/deployment/helm) - 基本安装
