---
slug: /use-cases/observability/clickstack/deployment/helm-deployment-options-v1
title: 'Helm デプロイメントオプション (v1.x)'
pagination_prev: null
pagination_next: null
sidebar_position: 12
description: 'v1.x ClickStack Helm チャートの進階デプロイメント構成'
doc_type: 'guide'
keywords: ['ClickStack デプロイメントオプション', '外部 ClickHouse', '外部 OTel', '最小構成のデプロイメント', 'Helm 構成']
---

:::warning 非推奨 — v1.x チャート
このページでは、メンテナンスモードにある **v1.x** インラインテンプレート Helm チャートのデプロイメントオプションについて説明します。v2.x チャートについては、[Helm デプロイメントオプション](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options)を参照してください。移行方法については、[アップグレードガイド](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)を参照してください。
:::

このガイドでは、Helm を使用した ClickStack の進階デプロイメントオプションについて説明します。基本的なインストールについては、[メインの Helm デプロイメントガイド](/docs/use-cases/observability/clickstack/deployment/helm-v1)を参照してください。

## 概要 \{#overview\}

ClickStack の Helm チャートは、複数のデプロイメント構成をサポートしています。

* **フルスタック** (デフォルト) - すべてのコンポーネントを含む構成
* **外部 ClickHouse** - 既存の ClickHouse クラスターを使用
* **外部 OTel collector** - 既存の OTel インフラストラクチャを使用
* **最小構成でのデプロイメント** - HyperDX のみを使用し、依存関係は外部を利用

## 外部 ClickHouse \{#external-clickhouse\}

既存の ClickHouse クラスター (ClickHouse Cloud を含む) がある場合は、組み込みの ClickHouse を無効にして、外部のインスタンスに接続できます。

### オプション 1: インライン設定 (開発/テスト用) \{#external-clickhouse-inline\}

簡単なテストや本番以外の環境では、この方法を使用してください。

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

この構成でインストールします。

```shell
helm install my-clickstack clickstack/clickstack -f values-external-clickhouse.yaml
```

### オプション 2: 外部シークレット (本番環境で推奨) \{#external-clickhouse-secret\}

認証情報を Helm の設定から分離して管理したい本番環境のデプロイメントでは、次の方法を使用します。

<VerticalStepper headerlevel="h4">
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

  #### Kubernetes シークレットを作成する \{#create-kubernetes-secret\}

  ```bash
  kubectl create secret generic hyperdx-external-config \
    --from-file=connections.json=connections.json \
    --from-file=sources.json=sources.json

  # ローカルファイルを削除
  rm connections.json sources.json
  ```

  #### シークレットを使用するように Helm を設定する \{#configure-helm-secret\}

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

### ClickHouse Cloudの使用 \{#using-clickhouse-cloud\}

ClickHouse Cloudを使用する場合:

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

既存の OTel collector 基盤がある場合:

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

イングレス経由で OTel collector のエンドポイントを公開する手順については、[イングレス設定](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1#otel-collector-ingress)を参照してください。

## 最小構成のデプロイメント \{#minimal-deployment\}

既存のインフラストラクチャがある組織では、HyperDX のみをデプロイします。

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

* [構成ガイド (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - API キー、シークレット、イングレスの設定
* [Cloud デプロイメント (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - GKE、EKS、AKS 固有の構成
* [メイン helm ガイド (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-v1) - 基本インストール
* [デプロイメントオプション (v2.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - v2.x のデプロイメントオプション
* [アップグレードガイド](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - v1.x から v2.x への移行