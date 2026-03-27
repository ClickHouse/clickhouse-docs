---
slug: /use-cases/observability/clickstack/deployment/helm
title: 'Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 2
description: 'Helm による ClickStack のデプロイ - ClickHouse オブザーバビリティスタック'
doc_type: 'guide'
keywords: ['ClickStack Helm チャート', 'Helm による ClickHouse のデプロイ', 'HyperDX の Helm インストール', 'Kubernetes オブザーバビリティスタック', 'ClickStack の Kubernetes デプロイ']
---

import Image from '@theme/IdealImage';
import hyperdx_24 from '@site/static/images/use-cases/observability/hyperdx-24.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import JSONSupport from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

:::warning チャートバージョン 2.x
このページでは、**v2.x** のサブチャートベースの Helm チャートについて説明します。引き続き v1.x のインラインテンプレート チャートを使用している場合は、[v1.x Helm ガイド](/docs/use-cases/observability/clickstack/deployment/helm-v1)を参照してください。移行手順については、[アップグレード ガイド](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)を参照してください。
:::

ClickStack の Helm チャートは [こちら](https://github.com/ClickHouse/ClickStack-helm-charts) にあり、本番環境へのデプロイには**推奨**の方法です。

v2.x チャートは、**2 段階のインストール**を採用しています。まず `clickstack-operators` チャートで Operator と CRD をインストールし、続いてメインの `clickstack` チャートで ClickHouse、MongoDB、OpenTelemetry collector 用の Operator が管理するカスタムリソースを作成します。

デフォルトでは、Helm チャートは以下を含むすべての主要コンポーネントをプロビジョニングします。

* **ClickHouse** — `ClickHouseCluster` および `KeeperCluster` カスタムリソースを通じて [ClickHouse Operator](https://clickhouse.com/docs/clickhouse-operator/overview) により管理されます
* **HyperDX** — オブザーバビリティ向けの UI と API
* **OpenTelemetry (OTel) collector** — サブチャートとして [公式 OpenTelemetry Collector Helm チャート](https://github.com/open-telemetry/opentelemetry-helm-charts) を介してデプロイされます
* **MongoDB** — `MongoDBCommunity` カスタムリソースを通じて [MongoDB Kubernetes Operator (MCK)](https://github.com/mongodb/mongodb-kubernetes) により管理されます

ただし、既存の ClickHouse デプロイと統合できるよう、簡単にカスタマイズすることもできます。たとえば、**ClickHouse Cloud** でホストされているものです。

このチャートは、以下を含む Kubernetes の標準的なベストプラクティスをサポートしています。

* `values.yaml` による環境ごとの設定
* リソース制限とポッドレベルのスケーリング
* TLS およびイングレスの設定
* シークレット管理と認証の設定
* チャートとあわせて任意の Kubernetes オブジェクト (NetworkPolicy、HPA、ALB Ingress など) をデプロイするための[追加マニフェスト](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests)

### 適した用途 \{#suitable-for\}

* 概念実証 (PoC)
* 本番環境

## デプロイ手順 \{#deployment-steps\}

<br />

<VerticalStepper headerLevel="h3">
  ### 前提条件 \{#prerequisites\}

  * [Helm](https://helm.sh/) v3+
  * Kubernetes クラスター (v1.20+ 推奨)
  * クラスターに接続できるよう設定済みの `kubectl`

  ### ClickStack Helm リポジトリを追加 \{#add-the-clickstack-helm-repository\}

  ClickStack Helm リポジトリを追加します。

  ```shell
  helm repo add clickstack https://clickhouse.github.io/ClickStack-helm-charts
  helm repo update
  ```

  ### オペレーターをインストールする \{#install-the-operators\}

  最初にオペレーターチャートをインストールします。これにより、メインチャートに必要な CRD が登録されます。

  ```shell
  helm install clickstack-operators clickstack/clickstack-operators
  ```

  先に進む前に、operator のポッドが準備完了になるまで待機します。

  ```shell
  kubectl get pods -l app.kubernetes.io/instance=clickstack-operators
  ```

  ### ClickStack をインストールする \{#installing-clickstack\}

  オペレーターが稼働したら、メインチャートをインストールします。

  ```shell
  helm install my-clickstack clickstack/clickstack
  ```

  ### インストールを確認する \{#verify-the-installation\}

  インストールを確認します。

  ```shell
  kubectl get pods -l "app.kubernetes.io/name=clickstack"
  ```

  すべてのポッドの準備ができたら、次に進みます。

  ### ポートフォワーディング \{#forward-ports\}

  ポートフォワーディングを使用すると、HyperDX にアクセスしてセットアップできます。本番環境にデプロイする場合は、代わりにサービスをイングレスまたはロードバランサー経由で公開し、適切なネットワークアクセス、TLS 終端、スケーラビリティを確保してください。ポートフォワーディングは、ローカル開発や一時的な管理タスクに最適であり、長期運用や高可用性が求められる環境には適していません。

  ```shell
  kubectl port-forward \
    pod/$(kubectl get pod -l app.kubernetes.io/name=clickstack -o jsonpath='{.items[0].metadata.name}') \
    8080:3000
  ```

  :::tip 本番環境のイングレス設定
  本番環境にデプロイする場合は、ポートフォワーディングではなく TLS を使用してイングレスを設定してください。詳しい設定手順については、[イングレス設定ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup)を参照してください。
  :::

  ### UI にアクセスする \{#navigate-to-the-ui\}

  HyperDX UI にアクセスするには、[http://localhost:8080](http://localhost:8080) を開きます。

  要件を満たすユーザー名とパスワードを指定して、ユーザーを作成します。

  <Image img={hyperdx_login} alt="HyperDX UI" size="lg" />

  `Create` をクリックすると、Helm チャートでデプロイした ClickHouse インスタンス用のデータソースが作成されます。

  :::note デフォルト接続の上書き
  統合された ClickHouse インスタンスへのデフォルト接続は上書きできます。詳しくは、[&quot;ClickHouse Cloud の使用&quot;](#using-clickhouse-cloud)を参照してください。
  :::

  ### 値のカスタマイズ (任意) \{#customizing-values\}

  `--set` フラグを使用して設定をカスタマイズできます。例:

  ```shell
  helm install my-clickstack clickstack/clickstack --set key=value
  ```

  または、`values.yaml` を編集します。デフォルト値を取得するには:

  ```shell
  helm show values clickstack/clickstack > values.yaml
  ```

  設定例:

  ```yaml
  hyperdx:
    frontendUrl: "https://hyperdx.example.com"

    deployment:
      replicas: 2
      resources:
        limits:
          cpu: "2"
          memory: 4Gi
        requests:
          cpu: 500m
          memory: 1Gi

    ingress:
      enabled: true
      host: hyperdx.example.com
      tls:
        enabled: true
        tlsSecretName: "hyperdx-tls"
  ```

  ```shell
  helm install my-clickstack clickstack/clickstack -f values.yaml
  ```

  ### シークレットの使用 (任意) \{#using-secrets\}

  v2.x チャートでは、values の `hyperdx.secrets` から生成される統合シークレット (`clickstack-secret`) を使用します。ClickHouse のパスワード、MongoDB のパスワード、HyperDX API キーなど、すべての機密環境変数はこの単一のシークレットを通して管理されます。

  シークレットの値を上書きするには:

  ```yaml
  hyperdx:
    secrets:
      HYPERDX_API_KEY: "your-api-key"
      CLICKHOUSE_PASSWORD: "your-clickhouse-password"
      CLICKHOUSE_APP_PASSWORD: "your-app-password"
      MONGODB_PASSWORD: "your-mongodb-password"
  ```

  外部シークレット管理 (シークレットオペレーターを使用する場合など) では、既存のKubernetesシークレットを参照できます:

  ```yaml
  hyperdx:
    useExistingConfigSecret: true
    existingConfigSecret: "my-external-secret"
    existingConfigConnectionsKey: "connections.json"
    existingConfigSourcesKey: "sources.json"
  ```

  :::tip API キー管理
  複数の設定方法やポッドの再起動手順を含む、API キー設定の詳細については、[API キー設定ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration#api-key-setup)を参照してください。
  :::
</VerticalStepper>

## ClickHouse Cloudの使用 \{#using-clickhouse-cloud\}

ClickHouse Cloudを使用する場合は、組み込みのClickHouseインスタンスを無効にし、ClickHouse Cloudの認証情報を指定します。

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

接続用シークレットを別途作成します。

```bash
cat <<EOF > connections.json
[
  {
    "name": "ClickHouse Cloud",
    "host": "https://your-cloud-instance.clickhouse.cloud",
    "port": 8443,
    "username": "default",
    "password": "your-cloud-password"
  }
]
EOF

kubectl create secret generic clickhouse-cloud-config \
  --from-file=connections.json=connections.json

rm connections.json
```

```shell
helm install my-clickstack clickstack/clickstack -f values-clickhouse-cloud.yaml
```

:::tip 進階の外部構成
シークレットベースの構成、外部 OTel collector、または最小限の構成で本番環境にデプロイする場合は、[デプロイメントオプション ガイド](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options)を参照してください。
:::

## 本番環境での注意点 \{#production-notes\}

デフォルトでは、このチャートによって ClickHouse、MongoDB、OTel collector がインストールされます。本番環境では、ClickHouse と OTel collector は個別に管理することを推奨します。

ClickHouse と OTel collector を無効にするには:

```yaml
clickhouse:
  enabled: false

otel-collector:
  enabled: false
```

:::tip 本番環境のベストプラクティス
高可用性構成、リソース管理、イングレス/TLS の設定、Cloud 固有の構成 (GKE、EKS、AKS) を含む本番環境へのデプロイについては、以下を参照してください。

* [構成ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - イングレス、TLS、シークレットの管理
* [Cloud デプロイ](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - Cloud 固有の設定と本番環境向けチェックリスト
  :::

## タスク設定 \{#task-configuration\}

デフォルトでは、チャート設定では 1 つのタスクが CronJob として定義されており、アラートを発報すべきかどうかを確認します。v2.x では、タスク設定は `hyperdx.tasks` 配下に移動しました。

| Parameter                             | Description                                                                                                           | Default           |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `hyperdx.tasks.enabled`               | クラスター内の cron タスクを有効または無効にします。デフォルトでは、HyperDX イメージがプロセス内で cron タスクを実行します。クラスター内で個別の cron タスクを使用する場合は、`true` に変更してください。 | `false`           |
| `hyperdx.tasks.checkAlerts.schedule`  | check-alerts タスクの cron スケジュール                                                                                         | `*/1 * * * *`     |
| `hyperdx.tasks.checkAlerts.resources` | check-alerts タスクのリソースリクエストと上限                                                                                         | `values.yaml` を参照 |

## チャートのアップグレード \{#upgrading-the-chart\}

新しいバージョンへアップグレードするには:

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

利用可能なチャートのバージョンを確認するには：

```shell
helm search repo clickstack
```

:::note v1.x からアップグレードする場合
v1.x の インラインテンプレート チャート からアップグレードする場合は、移行手順について [アップグレードガイド](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) を参照してください。これは破壊的変更であるため、その場での `helm upgrade` はサポートされていません。
:::

## ClickStack のアンインストール \{#uninstalling-clickstack\}

インストールした順と逆の順序でアンインストールします:

```shell
helm uninstall my-clickstack            # Remove app + CRs first
helm uninstall clickstack-operators     # Remove operators + CRDs
```

**注意:** MongoDB および ClickHouse のオペレーターが作成した PersistentVolumeClaim は、`helm uninstall` では**削除されません**。これは、意図しないデータ損失を防ぐための仕様です。PVC をクリーンアップするには、以下を参照してください。

* [MongoDB Kubernetes Operator docs](https://github.com/mongodb/mongodb-kubernetes/tree/master/docs/mongodbcommunity)
* [ClickHouse Operator cleanup docs](https://clickhouse.com/docs/clickhouse-operator/managing-clusters/cleanup)

## トラブルシューティング \{#troubleshooting\}

### ログの確認 \{#checking-logs\}

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

:::tip 追加のトラブルシューティング情報
イングレス固有の問題、TLS の問題、または Cloud デプロイに関するトラブルシューティングについては、以下を参照してください。

* [イングレスのトラブルシューティング](/docs/use-cases/observability/clickstack/deployment/helm-configuration#troubleshooting-ingress) - アセットの配信、パスの書き換え、ブラウザー関連の問題
* [Cloud デプロイ](/docs/use-cases/observability/clickstack/deployment/helm-cloud#loadbalancer-dns-resolution-issue) - GKE OpAMP の問題と Cloud 固有の問題
  :::

<JSONSupport />

これらの環境変数は、`values.yaml` の `hyperdx.config` で設定できます。

```yaml
hyperdx:
  config:
    BETA_CH_OTEL_JSON_SCHEMA_ENABLED: "true"
    OTEL_AGENT_FEATURE_GATE_ARG: "--feature-gates=clickhouse.json"
```

または `--set` で:

```shell
helm install my-clickstack clickstack/clickstack \
  --set "hyperdx.config.BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true" \
  --set "hyperdx.config.OTEL_AGENT_FEATURE_GATE_ARG=--feature-gates=clickhouse.json"
```

## 関連ドキュメント \{#related-documentation\}

### デプロイガイド \{#deployment-guides\}

* [デプロイオプション](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部 ClickHouse、OTel collector、最小構成でのデプロイ
* [構成ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API キー、シークレット、イングレスの設定
* [Cloud デプロイ](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS、AKS の構成と本番環境のベストプラクティス
* [アップグレードガイド](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - v1.x から v2.x への移行
* [追加マニフェスト](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) - チャートと併せたカスタム Kubernetes オブジェクトのデプロイ

### v1.x ドキュメント \{#v1x-documentation\}

* [Helm (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-v1) - v1.x デプロイガイド
* [構成 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - v1.x 構成
* [デプロイオプション (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1) - v1.x デプロイオプション
* [Cloud デプロイ (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - v1.x の Cloud 向け構成

### 追加リソース \{#additional-resources\}

* [ClickStack 利用開始ガイド](/use-cases/observability/clickstack/getting-started) - ClickStack の概要
* [ClickStack Helm チャート リポジトリ](https://github.com/ClickHouse/ClickStack-helm-charts) - チャートのソースコードと values のリファレンス
* [Kubernetes ドキュメント](https://kubernetes.io/docs/) - Kubernetes リファレンス
* [Helm ドキュメント](https://helm.sh/docs/) - Helm リファレンス