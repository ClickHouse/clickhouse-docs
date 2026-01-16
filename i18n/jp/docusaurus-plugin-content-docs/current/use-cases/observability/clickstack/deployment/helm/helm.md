---
slug: /use-cases/observability/clickstack/deployment/helm
title: 'Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 2
description: 'Helm を使用した ClickStack のデプロイ - ClickHouse オブザーバビリティスタック'
doc_type: 'guide'
keywords: ['ClickStack Helm チャート', 'Helm による ClickHouse デプロイメント', 'HyperDX の Helm インストール', 'Kubernetes 用オブザーバビリティスタック', 'ClickStack Kubernetes デプロイメント']
---

import Image from '@theme/IdealImage';
import hyperdx_24 from '@site/static/images/use-cases/observability/hyperdx-24.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import JSONSupport from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

:::warning Chart Migration
現在 `hdx-oss-v2` チャートを使用している場合は、`clickstack` チャートへ移行してください。`hdx-oss-v2` チャートはメンテナンスモードとなっており、新機能は今後追加されません。新規開発はすべて `clickstack` チャートに集約されており、同等の機能を提供しつつ、名称と構成が改善されています。
:::

ClickStack 用の Helm チャートは [こちら](https://github.com/ClickHouse/ClickStack-helm-charts) で公開されており、本番環境へのデプロイにはこの方法を**推奨**します。

デフォルトでは、この Helm チャートは次のコアコンポーネントをすべてプロビジョニングします:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB**（永続的なアプリケーション状態用）

ただし、既存の ClickHouse デプロイメント（たとえば **ClickHouse Cloud** 上でホストされているもの）と統合するように、容易にカスタマイズすることもできます。

このチャートは、以下を含む一般的な Kubernetes のベストプラクティスをサポートします:

* `values.yaml` を用いた環境別設定
* リソース制限およびポッド単位のスケーリング
* TLS およびイングレスの設定
* シークレット管理および認証設定


### 適した用途 \\{#suitable-for\\}

* 検証・PoC
* 本番運用

## デプロイ手順 \\{#deployment-steps\\}

<br/>

<VerticalStepper headerLevel="h3">
  ### 前提条件

  * [Helm](https://helm.sh/) v3 以降
  * Kubernetes クラスター（v1.20 以降を推奨）
  * クラスターとやり取りできるように設定済みの `kubectl`

  ### ClickStack Helmリポジトリを追加する

  ClickStack Helmリポジトリを追加します：

  ```shell
  helm repo add clickstack https://clickhouse.github.io/ClickStack-helm-charts
  helm repo update
  ```

  ### ClickStackのインストール

  ClickStackチャートをデフォルト値でインストールするには：

  ```shell
  helm install my-clickstack clickstack/clickstack
  ```

  ### インストールの確認

  インストールを確認します:

  ```shell
  kubectl get pods -l "app.kubernetes.io/name=clickstack"
  ```

  すべてのポッドの準備が完了したら、次に進んでください。

  ### ポートのフォワード

  ポートフォワーディングを使用することで、HyperDXへのアクセスとセットアップが可能になります。本番環境にデプロイする場合は、適切なネットワークアクセス、TLS終端、およびスケーラビリティを確保するため、イングレスまたはロードバランサー経由でサービスを公開してください。ポートフォワーディングは、ローカル開発環境または単発の管理タスクに適しており、長期運用や高可用性環境には適していません。

  ```shell
  kubectl port-forward \
    pod/$(kubectl get pod -l app.kubernetes.io/name=clickstack -o jsonpath='{.items[0].metadata.name}') \
    8080:3000
  ```

  :::tip 本番環境のイングレス設定
  本番環境では、ポートフォワーディングではなく、TLSを使用したイングレスを構成してください。詳細な設定手順については、[イングレス設定ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup)を参照してください。
  :::

  ### UIへ移動する

  [http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を開きます。

  要件を満たすユーザー名とパスワードを指定して、ユーザーを作成します。

  <Image img={hyperdx_login} alt="HyperDX UI" size="lg" />

  `Create`をクリックすると、HelmチャートでデプロイされたClickHouseインスタンスのデータソースが作成されます。

  :::note デフォルト接続の上書き
  統合されたClickHouseインスタンスへのデフォルト接続を上書きできます。詳細については、[&quot;ClickHouse Cloudの使用&quot;](#using-clickhouse-cloud)を参照してください。
  :::

  代替のClickHouseインスタンスを使用する例については、[&quot;ClickHouse Cloud接続を作成する&quot;](/docs/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)を参照してください。

  ### 値のカスタマイズ（任意）

  `--set`フラグを使用して設定をカスタマイズできます。例:

  ```shell
  helm install my-clickstack clickstack/clickstack --set key=value
  ```

  または、`values.yaml`を編集してください。デフォルト値を取得するには：

  ```shell
  helm show values clickstack/clickstack > values.yaml
  ```

  設定例：

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

  ### シークレットの使用（オプション）

  API キーやデータベース認証情報などの機密データを扱う際は、Kubernetes シークレットを使用してください。HyperDX Helm チャートには、変更してクラスタに適用可能なデフォルトのシークレットファイルが提供されています。

  #### 事前設定されたシークレットの使用

  Helm チャートには、[`charts/clickstack/templates/secrets.yaml`](https://github.com/ClickHouse/ClickStack-helm-charts/blob/main/charts/clickstack/templates/secrets.yaml) に配置されたデフォルトのシークレットテンプレートが含まれています。このファイルは、シークレットを管理するための基本構造を提供します。

  シークレットを手動で適用する必要がある場合は、提供されている `secrets.yaml` テンプレートを修正して適用します:

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

  シークレットをクラスターに適用します：

  ```shell
  kubectl apply -f secrets.yaml
  ```

  #### カスタムシークレットの作成

  必要に応じて、カスタムKubernetesシークレットを手動で作成することができます：

  ```shell
  kubectl create secret generic hyperdx-secret \
    --from-literal=API_KEY=my-secret-api-key
  ```

  #### シークレットの参照

  `values.yaml`でシークレットを参照する方法:

  ```yaml
  hyperdx:
    apiKey:
      valueFrom:
        secretKeyRef:
          name: hyperdx-secret
          key: API_KEY
  ```

  :::tip APIキー管理
  複数の設定方法とポッド再起動手順を含む詳細なAPIキーのセットアップ手順については、[APIキーセットアップガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration#api-key-setup)を参照してください。
  :::
</VerticalStepper>

## ClickHouse Cloud の使用

ClickHouse Cloud を使用する場合は、Helm チャートでデプロイされる ClickHouse インスタンスを無効化し、ClickHouse Cloud の認証情報を指定します。

```shell
# ClickHouse Cloud の認証情報を指定する
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # 完全な https URL
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

# デフォルト接続を上書きする方法
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} \
  --set clickhouse.config.users.otelUser=${CLICKHOUSE_USER} \
  --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD}
```

または `values.yaml` ファイルを使用します:

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
        "name": "外部ClickHouse",
        "host": "http://your-clickhouse-server:8123",
        "port": 8123,
        "username": "your-username",
        "password": "your-password"
      }
    ]
```

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
# または既にインストール済みの場合...
# helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

:::tip 高度な外部設定
シークレットベースの設定、外部 OTel collector、または最小構成で本番環境にデプロイする場合は、[Deployment Options](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) ガイドを参照してください。
:::

## 本番環境向けの注意事項

デフォルトでは、このチャートは ClickHouse と OTel collector もインストールするようになっています。ただし、本番環境では ClickHouse と OTel collector は別々に管理することが推奨されます。

ClickHouse と OTel collector を無効化するには、次の値を設定します。

```shell
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.enabled=false
```

:::tip 本番環境向けベストプラクティス
高可用性構成、リソース管理、イングレス/TLS 設定、クラウド固有の設定（GKE、EKS、AKS）を含む本番環境向けデプロイについては、以下を参照してください：

* [Configuration Guide](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - イングレス、TLS、およびシークレット管理
* [Cloud Deployments](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - クラウド固有の設定と本番環境チェックリスト
  :::

## タスク設定 {#task-configuration}

デフォルトでは、アラートを発火させる必要があるかどうかをチェックする 1 つのタスクが、CronJob としてチャート内に設定されています。以下はその設定オプションです。

| Parameter | Description | Default |
|-----------|-------------|---------|
| `tasks.enabled` | クラスター内の cron タスクを有効／無効にします。デフォルトでは HyperDX イメージがプロセス内で cron タスクを実行します。クラスター内で別個の cron タスクを使用したい場合は true に変更します。 | `false` |
| `tasks.checkAlerts.schedule` | `check-alerts` タスクの cron スケジュール | `*/1 * * * *` |
| `tasks.checkAlerts.resources` | `check-alerts` タスクのリソース要求と制限 | `values.yaml` を参照 |

## チャートのアップグレード

より新しいバージョンにアップグレードするには:

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

利用可能なチャートのバージョンを確認するには、次を実行します:

```shell
helm search repo clickstack
```

## ClickStack のアンインストール

デプロイメントを削除するには：

```shell
helm uninstall my-clickstack
```

これにより、そのリリースに関連するすべてのリソースは削除されますが、永続データ（存在する場合）は残る可能性があります。

## トラブルシューティング {#troubleshooting}

### ログの確認 \{#customizing-values\}

```shell
kubectl logs -l app.kubernetes.io/name=clickstack
```

### インストール失敗時のデバッグ \{#using-secrets\}

```shell
helm install my-clickstack clickstack/clickstack --debug --dry-run
```

### デプロイメントの検証

```shell
kubectl get pods -l app.kubernetes.io/name=clickstack
```

:::tip 追加のトラブルシューティング用リソース
イングレス固有の問題、TLS 関連の問題、またはクラウドデプロイに関するトラブルシューティングについては、次を参照してください。

* [Ingress のトラブルシューティング](/docs/use-cases/observability/clickstack/deployment/helm-configuration#troubleshooting-ingress) - アセット配信、パス書き換え、ブラウザ関連の問題
* [Cloud Deployments](/docs/use-cases/observability/clickstack/deployment/helm-cloud#loadbalancer-dns-resolution-issue) - GKE の OpAMP に関する問題およびクラウド特有の問題
  :::

<JSONSupport />

これらの環境変数は、パラメータまたは `values.yaml` を使用して設定できます。例:

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

または `--set` を使用して:

```shell
helm install my-clickstack clickstack/clickstack \
  --set "hyperdx.env[0].name=BETA_CH_OTEL_JSON_SCHEMA_ENABLED" \
  --set "hyperdx.env[0].value=true" \
  --set "otel.env[0].name=OTEL_AGENT_FEATURE_GATE_ARG" \
  --set "otel.env[0].value=--feature-gates=clickhouse.json"
```


## 関連ドキュメント {#related-documentation}

### デプロイメントガイド {#deployment-guides}

- [デプロイメントオプション](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部 ClickHouse、OTel collector、最小構成デプロイメント
- [設定ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API キー、シークレット、イングレスのセットアップ
- [クラウドデプロイメント](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS、AKS の設定および本番環境向けベストプラクティス

### 追加リソース {#additional-resources}

- [ClickStack 入門ガイド](/docs/use-cases/observability/clickstack/getting-started) - ClickStack の概要
- [ClickStack Helm charts リポジトリ](https://github.com/ClickHouse/ClickStack-helm-charts) - Helm チャートのソースコードおよび values のリファレンス
- [Kubernetes ドキュメント](https://kubernetes.io/docs/) - Kubernetes リファレンス
- [Helm ドキュメント](https://helm.sh/docs/) - Helm リファレンス