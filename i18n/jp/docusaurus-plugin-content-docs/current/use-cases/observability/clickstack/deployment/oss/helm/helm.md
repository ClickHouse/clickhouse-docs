---
slug: /use-cases/observability/clickstack/deployment/helm
title: 'Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 2
description: 'Helm を使用して ClickStack をデプロイ - ClickHouse のオブザーバビリティスタック'
doc_type: 'guide'
keywords: ['ClickStack Helm チャート', 'Helm による ClickHouse デプロイメント', 'HyperDX の Helm によるインストール', 'Kubernetes オブザーバビリティスタック', 'ClickStack の Kubernetes デプロイメント']
---

import Image from '@theme/IdealImage';
import hyperdx_24 from '@site/static/images/use-cases/observability/hyperdx-24.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import JSONSupport from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

:::warning チャートの移行
現在 `hdx-oss-v2` チャートを使用している場合は、`clickstack` チャートへ移行してください。`hdx-oss-v2` チャートはメンテナンスモードとなっており、新機能は追加されません。新規開発はすべて `clickstack` チャートに集中しており、同等の機能を提供しつつ、名前付けと構成が改善されています。
:::

ClickStack 用の Helm チャートは[こちら](https://github.com/ClickHouse/ClickStack-helm-charts)にあり、本番環境へのデプロイにおいて**推奨**される方法です。

デフォルトでは、この Helm チャートは以下を含むすべてのコアコンポーネントをプロビジョニングします。

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB**（永続的なアプリケーション状態の保持用）

また、既存の ClickHouse デプロイメント（例: **ClickHouse Cloud** 上でホストされているもの）と統合するように、容易にカスタマイズすることもできます。

このチャートは、次のような標準的な Kubernetes のベストプラクティスをサポートします。

* `values.yaml` を用いた環境別設定
* リソース制限およびポッド単位のスケーリング
* TLS とイングレスの設定
* シークレット管理および認証設定


### 適した用途 \{#suitable-for\}

* PoC（概念実証）
* 本番環境

## デプロイメント手順 \{#deployment-steps\}

<br/>

<VerticalStepper headerLevel="h3">
  ### 前提条件

  * [Helm](https://helm.sh/) v3 以降
  * Kubernetes クラスター（v1.20 以上を推奨）
  * `kubectl` がクラスターを操作できるように設定されていること

  ### ClickStack Helmリポジトリを追加する

  ClickStack Helmリポジトリを追加します:

  ```shell
  helm repo add clickstack https://clickhouse.github.io/ClickStack-helm-charts
  helm repo update
  ```

  ### ClickStackのインストール

  ClickStack チャートをデフォルト値でインストールする場合:

  ```shell
  helm install my-clickstack clickstack/clickstack
  ```

  ### インストールの検証

  インストールを確認してください:

  ```shell
  kubectl get pods -l "app.kubernetes.io/name=clickstack"
  ```

  すべてのポッドの準備が完了したら、次に進んでください。

  ### ポートのフォワード

  ポートフォワーディングを使用することで、HyperDXへのアクセスとセットアップが可能になります。本番環境へデプロイする場合は、適切なネットワークアクセス、TLS終端、およびスケーラビリティを確保するため、イングレスまたはロードバランサー経由でサービスを公開してください。ポートフォワーディングは、ローカル開発環境または単発の管理タスクに適しており、長期運用や高可用性環境には適していません。

  ```shell
  kubectl port-forward \
    pod/$(kubectl get pod -l app.kubernetes.io/name=clickstack -o jsonpath='{.items[0].metadata.name}') \
    8080:3000
  ```

  :::tip 本番環境のイングレス設定
  本番環境へのデプロイメントでは、ポートフォワーディングではなく、TLSを使用したイングレスを設定してください。詳細な設定手順については、[イングレス設定ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup)を参照してください。
  :::

  ### UIにアクセスする

  [http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を開きます。

  要件を満たすユーザー名とパスワードを指定して、ユーザーを作成します。

  <Image img={hyperdx_login} alt="HyperDX UI" size="lg" />

  `Create` をクリックすると、Helm チャートでデプロイした ClickHouse インスタンスのデータソースが作成されます。

  :::note デフォルト接続の上書き
  統合されたClickHouseインスタンスへのデフォルト接続を上書きすることができます。詳細は、[&quot;ClickHouse Cloudの使用&quot;](#using-clickhouse-cloud)を参照してください。
  :::

  ### 値のカスタマイズ（任意）

  `--set`フラグを使用して設定をカスタマイズできます。例:

  ```shell
  helm install my-clickstack clickstack/clickstack --set key=value
  ```

  または、`values.yaml` を編集してください。デフォルト値を取得するには、次を実行します:

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

  ### シークレットの使用（任意）

  API キーやデータベース認証情報などの機密データを扱う場合は、Kubernetes シークレットを使用してください。HyperDX Helm チャートには、クラスタに変更を加えて適用できるデフォルトのシークレットファイルが用意されています。

  #### 事前設定済みシークレットの使用

  Helm チャートには、[`charts/clickstack/templates/secrets.yaml`](https://github.com/ClickHouse/ClickStack-helm-charts/blob/main/charts/clickstack/templates/secrets.yaml) に配置されたデフォルトのシークレットテンプレートが含まれています。このファイルは、シークレット管理のための基本構造を提供します。

  シークレットを手動で適用する必要がある場合は、提供されている `secrets.yaml` テンプレートを修正して適用してください:

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

  シークレットをクラスタに適用します:

  ```shell
  kubectl apply -f secrets.yaml
  ```

  #### カスタムシークレットの作成

  必要に応じて、カスタム Kubernetes シークレットを手動で作成できます。

  ```shell
  kubectl create secret generic hyperdx-secret \
    --from-literal=API_KEY=my-secret-api-key
  ```

  #### シークレットの参照

  `values.yaml` でシークレットを参照する場合:

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

## ClickHouse Cloud の利用

ClickHouse Cloud を利用する場合は、Helm チャートでデプロイされる ClickHouse インスタンスを無効化し、ClickHouse Cloud の認証情報を指定します。

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

別の方法としては、`values.yaml` ファイルを使用します:

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

:::tip 高度な外部設定
シークレットを利用した設定、外部 OTel collector、またはミニマル構成での本番環境向けデプロイについては、[Deployment Options ガイド](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options)を参照してください。
:::


## 本番環境向けの注意事項

デフォルトでは、このチャートは ClickHouse と OTel collector もインストールします。ただし、本番環境では、ClickHouse と OTel collector を個別に管理することを推奨します。

ClickHouse と OTel collector を無効化するには、以下の値を設定します。

```shell
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.enabled=false
```

:::tip 本番環境のベストプラクティス
高可用性構成、リソース管理、イングレス/TLS のセットアップ、Cloud 固有の構成（GKE、EKS、AKS を含む）を伴う本番環境へのデプロイメントについては、次を参照してください：

* [設定ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - イングレス、TLS、およびシークレットの管理
* [Cloud デプロイメント](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - Cloud 固有の設定と本番チェックリスト
  :::


## タスク設定 {#task-configuration}

デフォルトでは、アラートを発報すべきかどうかを確認するタスクが 1 つ、CronJob としてチャートに設定されています。以下はその設定オプションです：

| Parameter | Description | Default |
|-----------|-------------|---------|
| `tasks.enabled` | クラスター内の cron タスクを有効化/無効化します。デフォルトでは、HyperDX イメージがプロセス内で cron タスクを実行します。クラスター内で別の cron タスクを使用したい場合は true に変更します。 | `false` |
| `tasks.checkAlerts.schedule` | check-alerts タスクの cron スケジュール | `*/1 * * * *` |
| `tasks.checkAlerts.resources` | check-alerts タスクのリソース要求および制限 | `values.yaml` を参照 |

## チャートのアップグレード

新しいバージョンにアップグレードするには、次の手順を実行します。

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

利用可能なチャートのバージョンを確認するには：

```shell
helm search repo clickstack
```


## ClickStack のアンインストール

デプロイメントを削除するには：

```shell
helm uninstall my-clickstack
```

これにより、そのリリースに関連付けられたすべてのリソースは削除されますが、永続データ（存在する場合）は残る可能性があります。


## トラブルシューティング {#troubleshooting}

### ログを確認する \{#customizing-values\}

```shell
kubectl logs -l app.kubernetes.io/name=clickstack
```


### インストール失敗時のデバッグ \{#using-secrets\}

```shell
helm install my-clickstack clickstack/clickstack --debug --dry-run
```


### デプロイメントの確認

```shell
kubectl get pods -l app.kubernetes.io/name=clickstack
```

:::tip 追加のトラブルシューティング用リソース
イングレス固有の問題、TLS の問題、Cloud デプロイメントのトラブルシューティングについては、次を参照してください。

* [イングレスのトラブルシューティング](/docs/use-cases/observability/clickstack/deployment/helm-configuration#troubleshooting-ingress) - アセット配信、パス書き換え、ブラウザ関連の問題
* [Cloud デプロイメント](/docs/use-cases/observability/clickstack/deployment/helm-cloud#loadbalancer-dns-resolution-issue) - GKE OpAMP の問題および Cloud 固有の問題
  :::

<JSONSupport />

これらの環境変数は、パラメータ経由、または `values.yaml` で設定できます。例:

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

または `--set` で指定します：

```shell
helm install my-clickstack clickstack/clickstack \
  --set "hyperdx.env[0].name=BETA_CH_OTEL_JSON_SCHEMA_ENABLED" \
  --set "hyperdx.env[0].value=true" \
  --set "otel.env[0].name=OTEL_AGENT_FEATURE_GATE_ARG" \
  --set "otel.env[0].value=--feature-gates=clickhouse.json"
```


## 関連ドキュメント {#related-documentation}

### デプロイメントガイド {#deployment-guides}

- [デプロイメントオプション](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部 ClickHouse、OTel collector、および最小構成デプロイメント
- [構成ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API キー、シークレット、およびイングレスのセットアップ
- [Cloud デプロイメント](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS、AKS の構成と本番運用のベストプラクティス

### 追加リソース {#additional-resources}

- [ClickStack 入門ガイド](/docs/use-cases/observability/clickstack/getting-started/index) - ClickStack の概要
- [ClickStack Helm チャートリポジトリ](https://github.com/ClickHouse/ClickStack-helm-charts) - チャートのソースコードと values のリファレンス
- [Kubernetes ドキュメント](https://kubernetes.io/docs/) - Kubernetes リファレンス
- [Helm ドキュメント](https://helm.sh/docs/) - Helm リファレンス