---
slug: /use-cases/observability/clickstack/deployment/helm-v1
title: 'Helm（v1.x）'
pagination_prev: null
pagination_next: null
sidebar_position: 10
description: 'v1.x のインラインテンプレート Helm チャートを使用した ClickStack のデプロイ'
doc_type: 'guide'
keywords: ['ClickStack Helm チャート', 'Helm による ClickHouse のデプロイ', 'HyperDX の Helm インストール', 'Kubernetes オブザーバビリティスタック', 'ClickStack の Kubernetes デプロイ']
---

import Image from '@theme/IdealImage';
import hyperdx_24 from '@site/static/images/use-cases/observability/hyperdx-24.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import JSONSupport from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

:::warning 非推奨 — v1.x チャート
このページでは、メンテナンスモードにあり、今後新機能が追加されない **v1.x** の inline-template Helm チャートについて説明します。新規デプロイには、[v2.x チャート](/docs/use-cases/observability/clickstack/deployment/helm) を使用してください。既存の v1.x デプロイメントを移行する場合は、[アップグレードガイド](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) を参照してください。
:::

ClickStack の Helm チャートは[こちら](https://github.com/ClickHouse/ClickStack-helm-charts)で公開されており、本番環境へのデプロイ方法として**推奨**されています。

デフォルトでは、Helm チャートは以下の主要コンポーネントをすべてプロビジョニングします。

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB** (永続的なアプリケーション状態を保持するため)

ただし、既存の ClickHouse デプロイメントと連携するように簡単にカスタマイズできます。たとえば、**ClickHouse Cloud** でホストされているものです。

このチャートは、以下を含む Kubernetes の標準的なベストプラクティスをサポートしています。

* `values.yaml` による環境ごとの設定
* リソース制限とポッドレベルのスケーリング
* TLS とイングレスの設定
* シークレット管理と認証の設定

### 適している用途 \{#suitable-for\}

* PoC
* 本番環境

## デプロイ手順 \{#deployment-steps\}

<br />

<VerticalStepper headerLevel="h3">
  ### 前提条件 \{#prerequisites\}

  * [Helm](https://helm.sh/) v3+
  * Kubernetes クラスター (v1.20 以降を推奨)
  * クラスターとやり取りできるよう設定された `kubectl`

  ### ClickStack の Helm リポジトリを追加する \{#add-the-clickstack-helm-repository\}

  ClickStack の Helm リポジトリを追加します。

  ```shell
  helm repo add clickstack https://clickhouse.github.io/ClickStack-helm-charts
  helm repo update
  ```

  ### ClickStack のインストール \{#installing-clickstack\}

  デフォルト値で ClickStack チャートをインストールするには、次を実行します。

  ```shell
  helm install my-clickstack clickstack/clickstack
  ```

  ### インストールを確認する \{#verify-the-installation\}

  インストールを確認します。

  ```shell
  kubectl get pods -l "app.kubernetes.io/name=clickstack"
  ```

  すべてのポッドの準備が完了したら、次に進みます。

  ### ポート転送 \{#forward-ports\}

  ポートフォワーディングを使用すると、HyperDX にアクセスしてセットアップできます。本番環境にデプロイする場合は、適切なネットワークアクセス、TLS 終端、スケーラビリティを確保するため、代わりにイングレスまたはロードバランサー経由でサービスを公開してください。ポートフォワーディングは、ローカル開発や一時的な管理作業には適していますが、長期運用や高可用性が求められる環境には適していません。

  ```shell
  kubectl port-forward \
    pod/$(kubectl get pod -l app.kubernetes.io/name=clickstack -o jsonpath='{.items[0].metadata.name}') \
    8080:3000
  ```

  :::tip 本番環境のイングレス設定
  本番環境にデプロイする場合は、ポートフォワーディングではなく、TLS を使用してイングレスを設定してください。詳しい設定手順については、[イングレス設定ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1#ingress-setup)を参照してください。
  :::

  ### UI に移動 \{#navigate-to-the-ui\}

  HyperDX UI にアクセスするには、[http://localhost:8080](http://localhost:8080) を開きます。

  要件を満たすユーザー名とパスワードを指定して、ユーザーを作成します。

  <Image img={hyperdx_login} alt="HyperDX UI" size="lg" />

  `Create` をクリックすると、Helm チャートでデプロイした ClickHouse インスタンス用のデータソースが作成されます。

  :::note デフォルト接続の上書き
  統合された ClickHouse インスタンスへのデフォルト接続は上書きできます。詳しくは、[&quot;ClickHouse Cloud の使用&quot;](#using-clickhouse-cloud)を参照してください。
  :::

  ### 値のカスタマイズ (任意) \{#customizing-values\}

  `--set` フラグを使用して設定をカスタマイズできます。たとえば:

  ```shell
  helm install my-clickstack clickstack/clickstack --set key=value
  ```

  または、`values.yaml` を編集します。デフォルト値を取得するには、次のようにします:

  ```shell
  helm show values clickstack/clickstack > values.yaml
  ```

  設定例:

  ```yaml
  replicaCount: 2
  resources:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 250m
      memory: 256Mi
  ingress:
    enabled: true
    annotations:
      kubernetes.io/ingress.class: nginx
    hosts:
      - host: hyperdx.example.com
        paths:
          - path: /
            pathType: ImplementationSpecific
  ```

  ```shell
  helm install my-clickstack clickstack/clickstack -f values.yaml
  ```

  ### シークレットの使用 (任意) \{#using-secrets\}

  API キーやデータベース認証情報などの機密データを扱う場合は、Kubernetes シークレットを使用します。HyperDX の Helm チャートには、必要に応じて変更してクラスターに適用できるデフォルトのシークレットファイルが用意されています。

  #### 事前設定済みシークレットの使用 \{#using-pre-configured-secrets\}

  Helm チャートには、[`charts/clickstack/templates/secrets.yaml`](https://github.com/ClickHouse/ClickStack-helm-charts/blob/main/charts/clickstack/templates/secrets.yaml) に配置されたデフォルトのシークレットテンプレートが含まれています。このファイルは、シークレット管理の基本構造を提供します。

  シークレットを手動で適用する必要がある場合は、付属の `secrets.yaml` テンプレートを編集して適用します。

  ```yaml
  apiVersion: v1
  kind: Secret
  metadata:
    name: hyperdx-secret
    annotations:
      "helm.sh/resource-policy": keep
  type: Opaque
  data:
    API_KEY: <base64-encoded-api-key>
  ```

  シークレットをクラスターに適用します。

  ```shell
  kubectl apply -f secrets.yaml
  ```

  #### カスタムシークレットを作成する \{#creating-a-custom-secret\}

  必要であれば、カスタム Kubernetes シークレットを手動で作成することもできます:

  ```shell
  kubectl create secret generic hyperdx-secret \
    --from-literal=API_KEY=my-secret-api-key
  ```

  #### シークレットを参照する \{#referencing-a-secret\}

  `values.yaml` でシークレットを参照するには:

  ```yaml
  hyperdx:
    apiKey:
      valueFrom:
        secretKeyRef:
          name: hyperdx-secret
          key: API_KEY
  ```

  :::tip API キーの管理
  複数の設定方法やポッドの再起動手順を含む、API キー設定の詳細については、[API キー設定ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1#api-key-setup)を参照してください。
  :::
</VerticalStepper>

## ClickHouse Cloudの使用 \{#using-clickhouse-cloud\}

ClickHouse Cloudを使用する場合は、Helm チャートでデプロイしたClickHouseインスタンスを無効にし、Cloudの認証情報を指定します。

```shell
# specify ClickHouse Cloud credentials
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # full https url
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

# how to overwrite default connection
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} \
  --set clickhouse.config.users.otelUser=${CLICKHOUSE_USER} \
  --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD}
```

あるいは、`values.yaml` ファイルを使用します:

```yaml
clickhouse:
  enabled: false
  persistence:
    enabled: false
  config:
    users:
      otelUser: ${CLICKHOUSE_USER}
      otelUserPassword: ${CLICKHOUSE_PASSWORD}

otel:
  clickhouseEndpoint: ${CLICKHOUSE_URL}

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

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
# or if installed...
# helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

:::tip 進階の外部構成
シークレットベースの構成、外部 OTel collector、または最小構成で本番環境にデプロイする場合は、[デプロイオプション ガイド](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1)を参照してください。
:::

## 本番環境での注意事項 \{#production-notes\}

デフォルトでは、このチャートによって ClickHouse と OTel collector もインストールされます。ただし、本番環境では、ClickHouse と OTel collector は個別に管理することを推奨します。

ClickHouse と OTel collector を無効にするには、以下の値を設定します。

```shell
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.enabled=false
```

:::tip 本番環境のベストプラクティス
高可用性構成、リソース管理、イングレス/TLS のセットアップ、Cloud 固有の設定 (GKE、EKS、AKS) を含む本番環境へのデプロイについては、以下を参照してください。

* [構成ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - イングレス、TLS、シークレットの管理
* [Cloud デプロイ](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - Cloud 固有の設定と本番環境向けチェックリスト
  :::

## タスク設定 \{#task-configuration\}

デフォルトでは、チャートの設定には CronJob として 1 つのタスクがあり、アラートを発報すべきかどうかを確認します。設定項目は次のとおりです。

| Parameter                     | Description                                                                                                         | Default           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `tasks.enabled`               | クラスター内の cron タスクを有効または無効にします。デフォルトでは、HyperDX イメージがプロセス内で cron タスクを実行します。クラスター内で個別の cron タスクを使用する場合は、true に変更してください。 | `false`           |
| `tasks.checkAlerts.schedule`  | check-alerts タスクの cron スケジュール                                                                                       | `*/1 * * * *`     |
| `tasks.checkAlerts.resources` | check-alerts タスクのリソース要求と上限                                                                                          | `values.yaml` を参照 |

## チャートのアップグレード \{#upgrading-the-chart\}

新しいバージョンにアップグレードするには、

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

利用可能なチャートのバージョンを確認するには:

```shell
helm search repo clickstack
```

:::note v2.x へのアップグレード
v2.x のサブチャートベースのチャートへ移行する場合は、移行手順について[アップグレードガイド](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)を参照してください。これは互換性のない変更です。そのため、インプレースでの `helm upgrade` はサポートされていません。
:::

## ClickStack のアンインストール \{#uninstalling-clickstack\}

デプロイメントを削除するには:

```shell
helm uninstall my-clickstack
```

これにより、このリリースに関連するすべてのリソースが削除されますが、永続データ (存在する場合) は残ることがあります。

## トラブルシューティング \{#troubleshooting\}

### ログを確認する \{#checking-logs\}

```shell
kubectl logs -l app.kubernetes.io/name=clickstack
```

### インストール失敗時のデバッグ \{#debugging-a-failed-install\}

```shell
helm install my-clickstack clickstack/clickstack --debug --dry-run
```

### デプロイの確認 \{#verifying-deployment\}

```shell
kubectl get pods -l app.kubernetes.io/name=clickstack
```

:::tip 追加のトラブルシューティングリソース
イングレス固有の問題、TLS の問題、または Cloud デプロイ時のトラブルシューティングについては、以下を参照してください。

* [イングレスのトラブルシューティング](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1#troubleshooting-ingress) - アセット配信、パスの書き換え、ブラウザーの問題
* [Cloud デプロイ](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1#loadbalancer-dns-resolution-issue) - GKE OpAMP の問題や Cloud 固有の問題
  :::

<JSONSupport />

これらの環境変数は、パラメータまたは `values.yaml` で設定できます。例:

*values.yaml*

```yaml
hyperdx:
  ...
  env:
    - name: BETA_CH_OTEL_JSON_SCHEMA_ENABLED
      value: "true"

otel:
  ...
  env:
    - name: OTEL_AGENT_FEATURE_GATE_ARG
      value: "--feature-gates=clickhouse.json"
```

または `--set` で:

```shell
helm install my-clickstack clickstack/clickstack \
  --set "hyperdx.env[0].name=BETA_CH_OTEL_JSON_SCHEMA_ENABLED" \
  --set "hyperdx.env[0].value=true" \
  --set "otel.env[0].name=OTEL_AGENT_FEATURE_GATE_ARG" \
  --set "otel.env[0].value=--feature-gates=clickhouse.json"
```

## 関連ドキュメント \{#related-documentation\}

### v1.x デプロイ ガイド \{#deployment-guides\}

* [デプロイ オプション (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1) - 外部 ClickHouse、OTel collector、および最小構成でのデプロイ
* [構成ガイド (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - API キー、シークレット、イングレスの設定
* [Cloud デプロイ (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - GKE、EKS、AKS の構成と本番環境でのベストプラクティス

### v2.x ドキュメント \{#v2x-documentation\}

* [Helm (v2.x)](/docs/use-cases/observability/clickstack/deployment/helm) - v2.x のデプロイガイド
* [アップグレードガイド](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - v1.x から v2.x への移行ガイド

### 追加リソース \{#additional-resources\}

* [ClickStack 利用開始ガイド](/use-cases/observability/clickstack/getting-started) - ClickStack の概要
* [ClickStack Helm チャートリポジトリ](https://github.com/ClickHouse/ClickStack-helm-charts) - チャートのソースコードと values のリファレンス
* [Kubernetes ドキュメント](https://kubernetes.io/docs/) - Kubernetes リファレンス
* [Helm ドキュメント](https://helm.sh/docs/) - Helm リファレンス