---
slug: /use-cases/observability/clickstack/deployment/helm-deployment-options
title: 'Helm デプロイオプション'
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'Helm を使用した ClickStack の高度なデプロイ構成'
doc_type: 'guide'
keywords: ['ClickStack のデプロイオプション', '外部 ClickHouse', '外部 OTel', '最小限のデプロイ', 'Helm 構成']
---

このガイドでは、Helm を使用した ClickStack の高度なデプロイオプションについて説明します。基本的なデプロイ手順については、[Helm デプロイガイド](/docs/use-cases/observability/clickstack/deployment/helm) を参照してください。



## 概要 {#overview}

ClickStack の Helm チャートでは、複数のデプロイ構成をサポートしています：
- **フルスタック**（デフォルト） - すべてのコンポーネントを含む
- **外部 ClickHouse** - 既存の ClickHouse クラスターを使用
- **外部 OTel collector** - 既存の OTel インフラストラクチャを使用
- **最小構成** - HyperDX のみをデプロイし、外部依存コンポーネントを利用



## 外部 ClickHouse {#external-clickhouse}

既存の ClickHouse クラスター（ClickHouse Cloud を含む）がある場合は、組み込みの ClickHouse を無効にして、外部インスタンスに接続できます。

### オプション 1: インライン設定（開発／テスト用途） {#external-clickhouse-inline}



このアプローチは、クイックテストまたは非本番環境で使用します:

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

### オプション2: 外部シークレット（本番環境推奨） {#external-clickhouse-secret}

認証情報をHelm設定から分離する本番環境デプロイメントの場合:

<VerticalStepper headerlevel='h4'>


#### 設定ファイルを作成する

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

#### Kubernetes シークレットを作成 {#create-kubernetes-secret}
```bash
kubectl create secret generic hyperdx-external-config \
  --from-file=connections.json=connections.json \
  --from-file=sources.json=sources.json

````


# ローカルファイルを削除する

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


特に ClickHouse Cloud を利用する場合:

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

ClickHouse Cloud への接続方法の包括的な例については、[「ClickHouse Cloud 接続の作成」](/docs/use-cases/observability/clickstack/getting-started#create-a-cloud-connection) を参照してください。


## 外部の OTel collector {#external-otel-collector}



既存の OTel collector のインフラストラクチャがある場合：

```yaml
# values-external-otel.yaml
otel:
  enabled: false  # 組み込みのOTel collectorを無効化

hyperdx:
  otelExporterEndpoint: "http://your-otel-collector:4318"
```

```shell
helm install my-clickstack clickstack/clickstack -f values-external-otel.yaml
```

イングレス経由で OTel collector のエンドポイントを公開する方法については、[Ingress の設定](/docs/use-cases/observability/clickstack/deployment/helm-configuration#otel-collector-ingress)を参照してください。


## 最小構成デプロイメント {#minimal-deployment}



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

- [Configuration Guide](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API キー、シークレット、イングレスの設定
- [Cloud Deployments](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS、AKS 向けの個別設定
- [Main Helm Guide](/docs/use-cases/observability/clickstack/deployment/helm) - 基本的なインストール手順
