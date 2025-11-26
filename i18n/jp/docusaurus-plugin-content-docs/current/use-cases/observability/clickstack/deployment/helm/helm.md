---
slug: /use-cases/observability/clickstack/deployment/helm
title: 'Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 2
description: 'Helm を使用した ClickStack のデプロイ - ClickHouse オブザーバビリティ スタック'
doc_type: 'guide'
keywords: ['ClickStack Helm チャート', 'Helm による ClickHouse デプロイメント', 'HyperDX の Helm インストール', 'Kubernetes オブザーバビリティ スタック', 'ClickStack Kubernetes デプロイメント']
---

import Image from '@theme/IdealImage';
import hyperdx_24 from '@site/static/images/use-cases/observability/hyperdx-24.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

:::warning チャートの移行
現在 `hdx-oss-v2` チャートを使用している場合は、`clickstack` チャートへ移行してください。`hdx-oss-v2` チャートはメンテナンスモードとなっており、新機能の追加は行われません。新規開発はすべて `clickstack` チャートに集約されており、同等の機能を提供しつつ、名称と構成が改善されています。
:::

HyperDX 用の Helm チャートは[こちら](https://github.com/hyperdxio/helm-charts)で公開されており、本番環境へのデプロイ方法として**推奨されます**。

デフォルトでは、この Helm チャートにより、次のコアコンポーネントがすべてプロビジョニングされます：

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB**（永続的なアプリケーション状態用）

また、このチャートは、既存の ClickHouse デプロイメント（例: **ClickHouse Cloud** 上でホストされているもの）と統合できるよう、容易にカスタマイズできます。

このチャートは、次の内容を含む標準的な Kubernetes のベストプラクティスをサポートしています：

* `values.yaml` による環境ごとの設定
* リソース制限とポッドレベルでのスケーリング
* TLS およびイングレスの設定
* Secret の管理および認証設定

### 適用シナリオ

* 検証目的（PoC）
* 本番環境


## デプロイ手順 {#deployment-steps}

<br />

<VerticalStepper headerLevel="h3">

### 前提条件 {#prerequisites}

- [Helm](https://helm.sh/) v3以上
- Kubernetesクラスタ（v1.20以上を推奨）
- クラスタと対話するように設定された`kubectl`

### ClickStack Helmリポジトリの追加 {#add-the-clickstack-helm-repository}

ClickStack Helmリポジトリを追加します：

```shell
helm repo add clickstack https://hyperdxio.github.io/helm-charts
helm repo update
```

### ClickStackのインストール {#installing-clickstack}

デフォルト値でClickStack チャートをインストールするには：

```shell
helm install my-clickstack clickstack/clickstack
```

### インストールの確認 {#verify-the-installation}

インストールを確認します：

```shell
kubectl get pods -l "app.kubernetes.io/name=clickstack"
```

すべてのポッドが準備完了になったら、次に進みます。

### ポートフォワード {#forward-ports}

ポートフォワードにより、HyperDXへのアクセスとセットアップが可能になります。本番環境にデプロイする場合は、適切なネットワークアクセス、TLS終端、およびスケーラビリティを確保するために、イングレスまたはロードバランサーを介してサービスを公開してください。ポートフォワードは、ローカル開発や単発の管理タスクに適しており、長期的または高可用性環境には適していません。

```shell
kubectl port-forward \
  pod/$(kubectl get pod -l app.kubernetes.io/name=clickstack -o jsonpath='{.items[0].metadata.name}') \
  8080:3000
```

:::tip 本番環境のイングレス設定
本番環境のデプロイメントでは、ポートフォワードの代わりにTLSを使用したイングレスを設定してください。詳細なセットアップ手順については、[イングレス設定ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup)を参照してください。
:::

### UIへのアクセス {#navigate-to-the-ui}

[http://localhost:8080](http://localhost:8080)にアクセスして、HyperDX UIを開きます。

要件を満たすユーザー名とパスワードを指定して、ユーザーを作成します。

<Image img={hyperdx_login} alt='HyperDX UI' size='lg' />

`Create`をクリックすると、Helm チャートでデプロイされたClickHouseインスタンスのデータソースが作成されます。

:::note デフォルト接続の上書き
統合されたClickHouseインスタンスへのデフォルト接続を上書きできます。詳細については、[「ClickHouse Cloudの使用」](#using-clickhouse-cloud)を参照してください。
:::

代替のClickHouseインスタンスを使用する例については、[「ClickHouse Cloud接続の作成」](/docs/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)を参照してください。

### 値のカスタマイズ（オプション） {#customizing-values}

`--set`フラグを使用して設定をカスタマイズできます。例：

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

または、`values.yaml`を編集します。デフォルト値を取得するには：

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

### シークレットの使用（オプション） {#using-secrets}

APIキーやデータベース認証情報などの機密データを扱うには、Kubernetesシークレットを使用します。HyperDX Helm チャートは、変更してクラスタに適用できるデフォルトのシークレットファイルを提供しています。

#### 事前設定されたシークレットの使用 {#using-pre-configured-secrets}

Helm チャートには、[`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml)にあるデフォルトのシークレットテンプレートが含まれています。このファイルは、シークレットを管理するための基本構造を提供します。

シークレットを手動で適用する必要がある場合は、提供されている`secrets.yaml`テンプレートを変更して適用します：

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

シークレットをクラスタに適用します：

```shell
kubectl apply -f secrets.yaml
```

#### カスタムシークレットの作成 {#creating-a-custom-secret}


必要に応じて、カスタムKubernetesシークレットを手動で作成することもできます：

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```

#### シークレットの参照 {#referencing-a-secret}

`values.yaml`でシークレットを参照する場合：

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```

:::tip APIキー管理
複数の設定方法やポッドの再起動手順を含む詳細なAPIキー設定手順については、[APIキー設定ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration#api-key-setup)を参照してください。
:::

</VerticalStepper>


## ClickHouse Cloud を使用する {#using-clickhouse-cloud}



ClickHouse Cloud を使用する場合は、Helm チャートでデプロイされる ClickHouse インスタンスを無効にし、ClickHouse Cloud の認証情報を指定します。

```shell
# ClickHouse Cloud認証情報を指定
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # 完全なhttps URL
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
```


# デフォルトの接続を上書きする方法

helm install my-clickstack clickstack/clickstack \
--set clickhouse.enabled=false \
--set clickhouse.persistence.enabled=false \
--set otel.clickhouseEndpoint=${CLICKHOUSE_URL} \
--set clickhouse.config.users.otelUser=${CLICKHOUSE_USER} \
--set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD}

````

または、`values.yaml`ファイルを使用してください:
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
````


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

````
```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
# or if installed...
# helm upgrade my-clickstack clickstack/clickstack -f values.yaml
````

:::tip 高度な外部構成
シークレットベースの構成、外部 OTel collector、または最小限のセットアップによる本番環境へのデプロイメントについては、[デプロイメントオプションガイド](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options)を参照してください。
:::


## 本番環境向けの注意事項

デフォルトでは、このチャートによって ClickHouse と OTel collector もインストールされます。ただし、本番環境で運用する場合は、ClickHouse と OTel collector を別途管理することを推奨します。

ClickHouse と OTel collector を無効化するには、次の値を設定します。

```shell
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.enabled=false
```

:::tip 本番環境におけるベストプラクティス
高可用性構成、リソース管理、イングレス/TLS 設定、クラウド固有の構成（GKE、EKS、AKS）を含む本番環境へのデプロイについては、次を参照してください:

* [Configuration Guide](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - イングレス、TLS、およびシークレット管理
* [Cloud Deployments](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - クラウド固有の設定と本番環境チェックリスト
  :::


## タスク設定 {#task-configuration}

デフォルトでは、アラートを発報すべきかどうかをチェックする 1 つのタスクが、CronJob としてチャート内に設定されています。以下はその設定オプションです。

| Parameter | Description | Default |
|-----------|-------------|---------|
| `tasks.enabled` | クラスター内の cron タスクを有効化/無効化します。デフォルトでは、HyperDX イメージがプロセス内で cron タスクを実行します。クラスター内で別の cron タスクとして実行したい場合は、true に設定します。 | `false` |
| `tasks.checkAlerts.schedule` | check-alerts タスクの cron スケジュール | `*/1 * * * *` |
| `tasks.checkAlerts.resources` | check-alerts タスクのリソース要求および制限 | `values.yaml` を参照 |



## チャートのアップグレード

新しいバージョンにアップグレードするには、次のとおりです。

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

利用可能な Helm チャートのバージョンを確認するには:

```shell
helm search repo clickstack
```


## ClickStack のアンインストール

デプロイメントを削除するには、次のようにします。

```shell
helm uninstall my-clickstack
```

これにより、そのリリースに関連するすべてのリソースは削除されますが、永続データ（存在する場合）は残ります。


## トラブルシューティング

### ログの確認

```shell
kubectl logs -l app.kubernetes.io/name=clickstack
```

### インストール失敗時のデバッグ

```shell
helm install my-clickstack clickstack/clickstack --debug --dry-run
```

### デプロイの確認

```shell
kubectl get pods -l app.kubernetes.io/name=clickstack
```

:::tip Additional Troubleshooting Resources
イングレス固有の問題、TLS 関連の問題、またはクラウドデプロイメントのトラブルシューティングについては、以下を参照してください:

* [Ingress Troubleshooting](/docs/use-cases/observability/clickstack/deployment/helm-configuration#troubleshooting-ingress) - アセット配信、パス書き換え、ブラウザ関連の問題
* [Cloud Deployments](/docs/use-cases/observability/clickstack/deployment/helm-cloud#loadbalancer-dns-resolution-issue) - GKE OpAMP の問題やクラウド特有の問題
  :::

<JSONSupport />

これらの環境変数は、パラメータまたは `values.yaml` のいずれかを使用して設定できます。例:

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

または `--set` オプションを使用して指定します:

```shell
helm install my-clickstack clickstack/clickstack \
  --set "hyperdx.env[0].name=BETA_CH_OTEL_JSON_SCHEMA_ENABLED" \
  --set "hyperdx.env[0].value=true" \
  --set "otel.env[0].name=OTEL_AGENT_FEATURE_GATE_ARG" \
  --set "otel.env[0].value=--feature-gates=clickhouse.json"
```


## 関連ドキュメント {#related-documentation}

### デプロイメントガイド {#deployment-guides}
- [デプロイメントオプション](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部 ClickHouse、OTel collector を利用する構成および最小構成でのデプロイメント
- [設定ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API キー、シークレット、イングレスの設定
- [クラウドデプロイメント](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS、AKS の設定と本番運用のベストプラクティス

### 追加リソース {#additional-resources}
- [ClickStack 入門ガイド](/docs/use-cases/observability/clickstack/getting-started) - ClickStack の概要
- [ClickStack Helm チャートリポジトリ](https://github.com/hyperdxio/helm-charts) - チャートのソースコードと values のリファレンス
- [Kubernetes ドキュメント](https://kubernetes.io/docs/) - Kubernetes リファレンス
- [Helm ドキュメント](https://helm.sh/docs/) - Helm リファレンス
