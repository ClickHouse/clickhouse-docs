---
slug: /use-cases/observability/clickstack/deployment/helm-deployment-options
title: 'Helm デプロイオプション'
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'Helm を使用した ClickStack の高度なデプロイ構成'
doc_type: 'guide'
keywords: ['ClickStack のデプロイオプション', '外部 ClickHouse', '外部 OTel', '最小デプロイ', 'Helm 設定']
---

このガイドでは、Helm を使用して ClickStack をデプロイする際の高度なオプションについて説明します。基本的なインストール手順については、[Helm デプロイの基本ガイド](/docs/use-cases/observability/clickstack/deployment/helm)を参照してください。

## 概要 {#overview}

ClickStack の Helm チャートは、複数のデプロイ構成をサポートします：

- **フルスタック**（デフォルト）- すべてのコンポーネントを含む
- **外部 ClickHouse** - 既存の ClickHouse クラスターを使用
- **外部 OTel collector** - 既存の OTel インフラストラクチャを使用
- **最小デプロイメント** - HyperDX のみをデプロイし、その他のコンポーネントは外部のものを使用

## 外部 ClickHouse {#external-clickhouse}

既存の ClickHouse クラスター（ClickHouse Cloud を含む）がある場合は、組み込みの ClickHouse を無効にして、外部インスタンスに接続できます。

### オプション 1: インライン設定（開発／テスト向け） {#external-clickhouse-inline}

手軽なテストや本番以外の環境では、この方法を使用してください。

```yaml
# values-external-clickhouse.yaml {#values-external-clickhouseyaml}
clickhouse:
  enabled: false  # 組み込みClickHouseを無効化

otel:
  clickhouseEndpoint: "tcp://your-clickhouse-server:9000"
  clickhousePrometheusEndpoint: "http://your-clickhouse-server:9363"  # 任意

hyperdx:
  defaultConnections: |
    [
      {
        "name": "外部ClickHouse",
        "host": "http://your-clickhouse-server:8123",
        "port": 8123,
        "username": "your-username",
        "password": "your-password"
      }
    ]
```

以下の構成でインストールします：

```shell
helm install my-clickstack clickstack/clickstack -f values-external-clickhouse.yaml
```


### オプション 2: 外部シークレット（本番環境で推奨） {#external-clickhouse-secret}

認証情報を Helm の設定から分離しておきたい本番環境でのデプロイでは、次のようにします。

<VerticalStepper headerlevel='h4'>

#### 設定ファイルを作成する {#create-configuration}
```bash
# connections.json を作成 {#create-connectionsjson}
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

# sources.json を作成 {#create-sourcesjson}
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

#### Kubernetes シークレットを作成する {#create-kubernetes-secret}
```bash
kubectl create secret generic hyperdx-external-config \
  --from-file=connections.json=connections.json \
  --from-file=sources.json=sources.json

# ローカルファイルを削除 {#clean-up-local-files}
rm connections.json sources.json
```

#### Helm をシークレットを使うように設定する {#configure-helm-secret}
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

### ClickHouse Cloud を使用する {#using-clickhouse-cloud}

ClickHouse Cloud を利用する場合:

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

ClickHouse Cloud への接続手順の全体像については、[「ClickHouse Cloud 接続の作成」](/docs/use-cases/observability/clickstack/getting-started#create-a-cloud-connection) を参照してください。


## 外部 OTel collector {#external-otel-collector}

既存の OTel collector インフラストラクチャがある場合は:

```yaml
# values-external-otel.yaml {#values-external-otelyaml}
otel:
  enabled: false  # 組み込みのOTel collectorを無効化

hyperdx:
  otelExporterEndpoint: "http://your-otel-collector:4318"
```

```shell
helm install my-clickstack clickstack/clickstack -f values-external-otel.yaml
```

イングレスを介して OTel collector のエンドポイントを公開する手順については、[Ingress 設定](/docs/use-cases/observability/clickstack/deployment/helm-configuration#otel-collector-ingress)を参照してください。


## 最小限のデプロイメント {#minimal-deployment}

既存のインフラストラクチャがある組織の場合は、HyperDX のみをデプロイします。

```yaml
# values-minimal.yaml {#values-minimalyaml}
clickhouse:
  enabled: false

otel:
  enabled: false

hyperdx:
  otelExporterEndpoint: "http://your-otel-collector:4318"
  
  # オプション1: インライン（テスト用）
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
  
  # オプション2: 外部シークレット（本番環境用）
  # useExistingConfigSecret: true
  # existingConfigSecret: "my-external-config"
  # existingConfigConnectionsKey: "connections.json"
  # existingConfigSourcesKey: "sources.json"
```

```shell
helm install my-clickstack clickstack/clickstack -f values-minimal.yaml
```


## 次のステップ {#next-steps}

- [Configuration Guide](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API キー、シークレット、イングレスのセットアップ
- [Cloud Deployments](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS、AKS 向けの特有の設定
- [Main Helm Guide](/docs/use-cases/observability/clickstack/deployment/helm) - 基本インストール