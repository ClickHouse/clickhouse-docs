---
slug: /use-cases/observability/clickstack/deployment/helm-deployment-options
title: 'Helm デプロイメントオプション'
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'Helm を使用した ClickStack の高度なデプロイメント構成'
doc_type: 'guide'
keywords: ['ClickStack deployment options', 'external ClickHouse', 'external OTEL', 'minimal deployment', 'Helm configuration']
---

このガイドでは、Helm を使用した ClickStack の高度なデプロイメントオプションについて説明します。基本的なインストール方法については、[Helm デプロイメントのメインガイド](/docs/use-cases/observability/clickstack/deployment/helm)を参照してください。

## 概要 \{#overview\}

ClickStack の Helm チャートは複数のデプロイメント構成をサポートしています:

- **フルスタック** (デフォルト) - すべてのコンポーネントを含む構成
- **外部 ClickHouse** - 既存の ClickHouse クラスターを使用する構成
- **外部 OTel collector** - 既存の OTel インフラストラクチャを使用する構成
- **最小限のデプロイメント** - HyperDX のみを含み、その他は外部依存関係として利用する構成

## 外部 ClickHouse \{#external-clickhouse\}

既存の ClickHouse クラスター（ClickHouse Cloud を含む）がある場合は、組み込みの ClickHouse を無効にして、外部インスタンスに接続できます。

### オプション 1: インライン設定（開発/テスト） \{#external-clickhouse-inline\}

この方法は、手早くテストしたい場合や本番以外の環境向けです。

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

次の構成でインストールします。

```shell
helm install my-clickstack clickstack/clickstack -f values-external-clickhouse.yaml
```


### オプション 2: 外部 Secret（本番環境で推奨） \{#external-clickhouse-secret\}

本番環境へのデプロイで、認証情報を Helm の設定とは分離して管理したい場合に使用します。

<VerticalStepper headerlevel='h4'>

#### 設定ファイルを作成する \{#create-configuration\}
```bash
# connections.json を作成
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

# sources.json を作成
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

#### Kubernetes Secret を作成する \{#create-kubernetes-secret\}
```bash
kubectl create secret generic hyperdx-external-config \
  --from-file=connections.json=connections.json \
  --from-file=sources.json=sources.json

# ローカルファイルを削除
rm connections.json sources.json
```

#### Secret を使用するように Helm を設定する \{#configure-helm-secret\}
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

### ClickHouse Cloud を使用する \{#using-clickhouse-cloud\}

特に ClickHouse Cloud を使用する場合は、次のとおりです。

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


## 外部の OTel collector \{#external-otel-collector\}

既存の OTel collector インフラストラクチャをすでに運用している場合:

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

イングレスを介して OTel collector のエンドポイントを公開する方法については、[Ingress Configuration](/docs/use-cases/observability/clickstack/deployment/helm-configuration#otel-collector-ingress) を参照してください。


## 最小構成でのデプロイメント \{#minimal-deployment\}

既存のインフラストラクチャがある組織の場合は、HyperDX のみをデプロイします：

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


## 次のステップ \{#next-steps\}

- [構成ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API キーとシークレット、およびイングレスのセットアップ
- [Cloud デプロイメント](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS、AKS 向けの専用構成
- [メイン Helm ガイド](/docs/use-cases/observability/clickstack/deployment/helm) - 基本的なインストール手順