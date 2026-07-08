---
slug: /use-cases/observability/clickstack/deployment/helm-deployment-options
title: 'Helm のデプロイオプション'
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'Helm を使用した ClickStack の高度なデプロイ構成'
doc_type: 'guide'
keywords: ['ClickStack のデプロイオプション', '外部 ClickHouse', '外部 OTel', '最小構成のデプロイ', 'Helm 構成']
---

:::warning チャートのバージョン 2.x
このページでは、**v2.x** のサブチャートベースの Helm チャートについて説明します。まだ v1.x のインラインテンプレートチャートを使用している場合は、[Helm のデプロイオプション (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1) を参照してください。移行手順については、[アップグレードガイド](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) を参照してください。
:::

このガイドでは、Helm を使用した ClickStack の高度なデプロイオプションについて説明します。基本的なインストールについては、[Helm デプロイのメインガイド](/docs/use-cases/observability/clickstack/deployment/helm) を参照してください。

## 概要 \{#overview\}

ClickStack の Helm チャートは、複数のデプロイ構成に対応しています：

* **フルスタック** (デフォルト) — すべてのコンポーネントを含み、オペレーターが管理
* **外部 ClickHouse** — 既存の ClickHouse クラスターを使用
* **外部 OTel collector** — 既存の OTel インフラストラクチャを使用
* **最小構成のデプロイ** — HyperDX のみを含み、依存先は外部

## 外部 ClickHouse \{#external-clickhouse\}

既存の ClickHouse クラスター (ClickHouse Cloud を含む) をお使いの場合は、組み込みの ClickHouse を無効にして、外部のインスタンスに接続できます。

### オプション 1: インライン設定 (開発/テスト用) \{#external-clickhouse-inline\}

この方法は、簡易テストや非本番環境で使用してください。接続情報は `hyperdx.config` と `hyperdx.secrets` で指定します：

```yaml
# values-external-clickhouse.yaml
clickhouse:
  enabled: false  # Disable the operator-managed ClickHouse

hyperdx:
  secrets:
    CLICKHOUSE_PASSWORD: "your-password"
    CLICKHOUSE_APP_PASSWORD: "your-password"

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

以下の設定でインストールします:

```shell
helm install my-clickstack clickstack/clickstack -f values-external-clickhouse.yaml
```

### オプション 2: 外部シークレット (本番環境で推奨) \{#external-clickhouse-secret\}

認証情報を Helm の設定と分離して管理したい本番環境のデプロイでは、以下の方法を使用します。

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

ClickHouse Cloudの場合:

```yaml
# values-clickhouse-cloud.yaml
clickhouse:
  enabled: false

hyperdx:
  secrets:
    CLICKHOUSE_PASSWORD: "your-cloud-password"
    CLICKHOUSE_APP_PASSWORD: "your-cloud-password"

  useExistingConfigSecret: true
  existingConfigSecret: "clickhouse-cloud-config"
  existingConfigConnectionsKey: "connections.json"
  existingConfigSourcesKey: "sources.json"
```

## 外部 OTel collector \{#external-otel-collector\}

既存の OTel collector 環境がある場合は、サブチャートを無効にします。

```yaml
# values-external-otel.yaml
otel-collector:
  enabled: false  # Disable the subchart OTEL collector

hyperdx:
  otelExporterEndpoint: "http://your-otel-collector:4318"
```

```shell
helm install my-clickstack clickstack/clickstack -f values-external-otel.yaml
```

イングレス経由でOTel collectorのエンドポイントを公開する手順については、[イングレス設定](/docs/use-cases/observability/clickstack/deployment/helm-configuration#otel-collector-ingress)を参照してください。

## 最小構成のデプロイ \{#minimal-deployment\}

既存のインフラがある場合は、HyperDX のみをデプロイします：

```yaml
# values-minimal.yaml
clickhouse:
  enabled: false

otel-collector:
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

* [構成ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API キー、シークレット、イングレスの設定
* [Cloud へのデプロイ](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS、AKS 固有の構成
* [アップグレードガイド](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - v1.x から v2.x への移行
* [追加マニフェスト](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) - カスタム Kubernetes オブジェクト
* [Helm ガイド](/docs/use-cases/observability/clickstack/deployment/helm) - 基本的なインストール
* [デプロイオプション (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1) - v1.x のデプロイオプション