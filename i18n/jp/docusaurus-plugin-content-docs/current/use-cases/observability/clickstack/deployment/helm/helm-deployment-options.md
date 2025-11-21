---
slug: /use-cases/observability/clickstack/deployment/helm-deployment-options
title: 'Helm デプロイオプション'
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'Helm を使用した ClickStack の高度なデプロイ構成'
doc_type: 'guide'
keywords: ['ClickStack deployment options', 'external ClickHouse', 'external OTEL', 'minimal deployment', 'Helm configuration']
---

このガイドでは、Helm を使用して ClickStack をデプロイする際の高度なオプションについて説明します。基本的なインストール手順については、[Helm デプロイの基本ガイド](/docs/use-cases/observability/clickstack/deployment/helm)を参照してください。



## 概要 {#overview}

ClickStackのHelmチャートは、複数のデプロイメント構成をサポートしています:

- **フルスタック**（デフォルト） - すべてのコンポーネントが含まれます
- **外部ClickHouse** - 既存のClickHouseクラスターを使用します
- **外部OTELコレクター** - 既存のOTELインフラストラクチャを使用します
- **最小限のデプロイメント** - HyperDXのみ、外部依存関係を使用します


## 外部ClickHouse {#external-clickhouse}

既存のClickHouseクラスタ(ClickHouse Cloudを含む)がある場合、組み込みのClickHouseを無効化して外部インスタンスに接続できます。

### オプション1: インライン設定(開発/テスト) {#external-clickhouse-inline}


このアプローチは、クイックテストまたは非本番環境に使用します:

```yaml
# values-external-clickhouse.yaml
clickhouse:
  enabled: false # 組み込みのClickHouseを無効化

otel:
  clickhouseEndpoint: "tcp://your-clickhouse-server:9000"
  clickhousePrometheusEndpoint: "http://your-clickhouse-server:9363" # オプション

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

この設定でインストールします:

```shell
helm install my-clickstack clickstack/clickstack -f values-external-clickhouse.yaml
```

### オプション2: 外部シークレット(本番環境推奨) {#external-clickhouse-secret}

認証情報をHelm設定から分離して管理する本番環境デプロイメントの場合:

<VerticalStepper headerlevel='h4'>


#### 設定ファイルを作成する {#create-configuration}

```bash
# connections.jsonを作成
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


# sources.json を作成

cat <<EOF > sources.json
[
{
"from": {
"databaseName": "default",
"tableName": "otel_logs"
},
"kind": "log",
"name": "ログ",
"connection": "本番 ClickHouse",
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
"name": "トレース",
"connection": "本番 ClickHouse",
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

#### Kubernetes シークレットを作成 {#create-kubernetes-secret}
```bash
kubectl create secret generic hyperdx-external-config \
  --from-file=connections.json=connections.json \
  --from-file=sources.json=sources.json

````


# ローカルファイルをクリーンアップする

rm connections.json sources.json

```
```


#### シークレットを使用するようにHelmを設定する {#configure-helm-secret}

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

### ClickHouse Cloudの使用 {#using-clickhouse-cloud}


ClickHouse Cloud 固有の内容としては、次のとおりです。

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

ClickHouse Cloud への接続方法の完全な例については、[「ClickHouse Cloud 接続の作成」](/docs/use-cases/observability/clickstack/getting-started#create-a-cloud-connection) を参照してください。


## 外部OTELコレクター {#external-otel-collector}


既存の OTEL コレクター環境がある場合：

```yaml
# values-external-otel.yaml
otel:
  enabled: false  # 組み込みOTELコレクターを無効化

hyperdx:
  otelExporterEndpoint: "http://your-otel-collector:4318"
```

```shell
helm install my-clickstack clickstack/clickstack -f values-external-otel.yaml
```

ingress 経由で OTEL コレクターのエンドポイントを公開する方法については、[Ingress Configuration](/docs/use-cases/observability/clickstack/deployment/helm-configuration#otel-collector-ingress) を参照してください。


## 最小構成のデプロイ {#minimal-deployment}


既存のインフラストラクチャがある組織では、HyperDX のみをデプロイします：

```yaml
# values-minimal.yaml
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
        "name": "外部ClickHouse",
        "host": "http://your-clickhouse-server:8123",
        "port": 8123,
        "username": "your-username",
        "password": "your-password"
      }
    ]
  
  # オプション2: 外部シークレット（本番用）
  # useExistingConfigSecret: true
  # existingConfigSecret: "my-external-config"
  # existingConfigConnectionsKey: "connections.json"
  # existingConfigSourcesKey: "sources.json"
```

```shell
helm install my-clickstack clickstack/clickstack -f values-minimal.yaml
```


## 次のステップ {#next-steps}

- [設定ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - APIキー、シークレット、Ingressのセットアップ
- [クラウドデプロイメント](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS、AKS固有の設定
- [Helmガイド](/docs/use-cases/observability/clickstack/deployment/helm) - 基本的なインストール
