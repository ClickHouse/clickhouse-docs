---
slug: /use-cases/observability/clickstack/deployment/helm-deployment-options-v1
title: 'Helm 部署选项 (v1.x)'
pagination_prev: null
pagination_next: null
sidebar_position: 12
description: 'v1.x ClickStack Helm 图表的进阶部署配置'
doc_type: 'guide'
keywords: ['ClickStack 部署选项', '外部 ClickHouse', '外部 OTel', '最小化部署', 'Helm 配置']
---

:::warning 已弃用 — v1.x 图表
本页面介绍 **v1.x** 内联-template Helm 图表的部署选项；该图表目前处于维护模式。有关 v2.x 图表，请参阅 [Helm 部署选项](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options)。如需迁移，请参阅 [升级指南](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)。
:::

本指南介绍使用 Helm 部署 ClickStack 时的进阶部署选项。有关基础安装，请参阅 [Helm 部署主指南](/docs/use-cases/observability/clickstack/deployment/helm-v1)。

## 概述 \{#overview\}

ClickStack 的 Helm 图表支持多种部署配置：

* **完整堆栈** (默认) - 包含全部组件
* **外部 ClickHouse** - 使用现有的 ClickHouse 集群
* **外部 OTel collector** - 使用现有的 OTel 基础设施
* **最小部署** - 仅部署 HyperDX，依赖外部组件

## 外部 ClickHouse \{#external-clickhouse\}

如果您已有现成的 ClickHouse 集群 (包括 ClickHouse Cloud) ，可以禁用内置 ClickHouse，并连接到外部实例。

### 方案 1：内联配置 (开发/测试) \{#external-clickhouse-inline\}

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

按以下配置安装：

```shell
helm install my-clickstack clickstack/clickstack -f values-external-clickhouse.yaml
```

### 选项 2：外部 Secret (推荐用于生产环境) \{#external-clickhouse-secret\}

对于希望将凭据与 Helm 配置分开管理的生产部署：

<VerticalStepper headerlevel="h4">
  #### 创建配置文件 \{#create-configuration\}

  ```bash
  # 创建 connections.json
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
  ```

  #### 创建 Kubernetes Secret \{#create-kubernetes-secret\}

  ```bash
  kubectl create secret generic hyperdx-external-config \
    --from-file=connections.json=connections.json \
    --from-file=sources.json=sources.json

  # 清理本地文件
  rm connections.json sources.json
  ```

  #### 配置 Helm 以使用该 Secret \{#configure-helm-secret\}

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

### 使用 ClickHouse Cloud \{#using-clickhouse-cloud\}

如果使用 ClickHouse Cloud：

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

## 外部 OTel collector \{#external-otel-collector\}

如果您已有现成的 OTel collector 基础设施：

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

有关通过入口暴露 OTel collector 端点的说明，请参见 [入口配置](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1#otel-collector-ingress)。

## 最小部署 \{#minimal-deployment\}

对于已有基础设施的组织，仅部署 HyperDX：

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

## 后续步骤 \{#next-steps\}

* [配置指南 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - API 密钥、Secret 和入口配置
* [Cloud 部署 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - GKE、EKS 和 AKS 的特定配置
* [Helm 主指南 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-v1) - 基本安装
* [部署选项 (v2.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - v2.x 部署选项
* [升级指南](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - 从 v1.x 迁移到 v2.x