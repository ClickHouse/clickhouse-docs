---
slug: /use-cases/observability/clickstack/deployment/helm
title: "Helm"
pagination_prev: null
pagination_next: null
sidebar_position: 2
description: "HelmによるClickStackのデプロイ - ClickHouse Observability Stack"
doc_type: "guide"
keywords:
  [
    "ClickStack Helm chart",
    "Helm ClickHouse deployment",
    "HyperDX Helm installation",
    "Kubernetes observability stack",
    "ClickStack Kubernetes deployment"
  ]
---

import Image from "@theme/IdealImage"
import hyperdx_24 from "@site/static/images/use-cases/observability/hyperdx-24.png"
import hyperdx_login from "@site/static/images/use-cases/observability/hyperdx-login.png"
import JSONSupport from "@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md"

HyperDXのHelmチャートは[こちら](https://github.com/hyperdxio/helm-charts)で提供されており、本番環境へのデプロイには**推奨される**方法です。

デフォルトでは、Helmチャートは以下を含むすべてのコアコンポーネントをプロビジョニングします:

- **ClickHouse**
- **HyperDX**
- **OpenTelemetry (OTel) コレクター**
- **MongoDB** (永続的なアプリケーション状態の保存用)

ただし、既存のClickHouseデプロイメント(例えば**ClickHouse Cloud**でホストされているもの)と統合するように簡単にカスタマイズできます。

このチャートは、以下を含む標準的なKubernetesのベストプラクティスをサポートしています:

- `values.yaml`による環境固有の設定
- リソース制限とポッドレベルのスケーリング
- TLSとIngressの設定
- シークレット管理と認証設定

### 適用対象 {#suitable-for}

- 概念実証
- 本番環境


## デプロイ手順 {#deployment-steps}

<br />

<VerticalStepper headerLevel="h3">

### 前提条件 {#prerequisites}

- [Helm](https://helm.sh/) v3以上
- Kubernetesクラスタ（v1.20以上を推奨）
- クラスタと対話するように設定された`kubectl`

### HyperDX Helmリポジトリの追加 {#add-the-hyperdx-helm-repository}

HyperDX Helmリポジトリを追加します：

```shell
helm repo add hyperdx https://hyperdxio.github.io/helm-charts
helm repo update
```

### HyperDXのインストール {#installing-hyperdx}

デフォルト値でHyperDXチャートをインストールするには：

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2
```

### インストールの確認 {#verify-the-installation}

インストールを確認します：

```shell
kubectl get pods -l "app.kubernetes.io/name=hdx-oss-v2"
```

すべてのポッドの準備が完了したら、次に進みます。

### ポートフォワーディング {#forward-ports}

ポートフォワーディングにより、HyperDXへのアクセスとセットアップが可能になります。本番環境にデプロイする場合は、適切なネットワークアクセス、TLS終端、およびスケーラビリティを確保するために、ingressまたはロードバランサーを介してサービスを公開してください。ポートフォワーディングは、ローカル開発や単発の管理タスクに適しており、長期運用や高可用性環境には適していません。

```shell
kubectl port-forward \
  pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}') \
  8080:3000
```

### UIへのアクセス {#navigate-to-the-ui}

[http://localhost:8080](http://localhost:8080)にアクセスして、HyperDX UIを開きます。

要件を満たすユーザー名とパスワードを指定してユーザーを作成します。

<Image img={hyperdx_login} alt='HyperDX UI' size='lg' />

`Create`をクリックすると、HelmチャートでデプロイされたClickHouseインスタンスのデータソースが作成されます。

:::note デフォルト接続の上書き
統合されたClickHouseインスタンスへのデフォルト接続を上書きできます。詳細については、["ClickHouse Cloudの使用"](#using-clickhouse-cloud)を参照してください。
:::

代替のClickHouseインスタンスを使用する例については、["ClickHouse Cloud接続の作成"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)を参照してください。

### 値のカスタマイズ（オプション） {#customizing-values}

`--set`フラグを使用して設定をカスタマイズできます。例：

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2 --set key=value
```

または、`values.yaml`を編集します。デフォルト値を取得するには：

```shell
helm show values hyperdx/hdx-oss-v2 > values.yaml
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
helm install my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
```

### シークレットの使用（オプション） {#using-secrets}

APIキーやデータベース認証情報などの機密データを扱うには、Kubernetesシークレットを使用します。HyperDX Helmチャートは、変更してクラスタに適用できるデフォルトのシークレットファイルを提供しています。

#### 事前設定されたシークレットの使用 {#using-pre-configured-secrets}

Helmチャートには、[`charts/hdx-oss-v2/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/hdx-oss-v2/templates/secrets.yaml)にあるデフォルトのシークレットテンプレートが含まれています。このファイルは、シークレットを管理するための基本構造を提供します。

シークレットを手動で適用する必要がある場合は、提供された`secrets.yaml`テンプレートを変更して適用します：

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

必要に応じて、カスタムKubernetesシークレットを手動で作成できます：

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```


#### シークレットの参照 {#referencing-a-secret}

`values.yaml`でシークレットを参照するには:

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```

</VerticalStepper>


## ClickHouse Cloudの使用 {#using-clickhouse-cloud}

ClickHouse Cloudを使用する場合は、HelmチャートによってデプロイされたClickHouseインスタンスを無効化し、Cloudの認証情報を指定してください:


```shell
# ClickHouse Cloudの認証情報を指定する
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # 完全なhttps URL
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
```


# デフォルトの接続設定を上書きする方法

helm install myrelease hyperdx-helm --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} --set clickhouse.config.users.otelUser=${CLICKHOUSE_USER} --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD}

````

または、`values.yaml`ファイルを使用します：

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
````


```shell
helm install my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
# またはインストール済みの場合...
# helm upgrade my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
```


## 本番環境に関する注意事項 {#production-notes}

デフォルトでは、このチャートはClickHouseとOTelコレクターもインストールします。ただし、本番環境では、ClickHouseとOTelコレクターを別々に管理することを推奨します。

ClickHouseとOTelコレクターを無効にするには、以下の値を設定します。

```shell
helm install myrelease hyperdx-helm --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
```


## タスク設定 {#task-configuration}

デフォルトでは、チャート設定にcronjobとして1つのタスクが存在し、アラートを発火すべきかどうかをチェックする役割を担います。以下はその設定オプションです:

| パラメータ                     | 説明                                                                                                                                                                         | デフォルト           |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `tasks.enabled`               | クラスタ内のcronタスクを有効化/無効化します。デフォルトでは、HyperDXイメージはプロセス内でcronタスクを実行します。クラスタ内で別個のcronタスクを使用する場合はtrueに変更してください。 | `false`           |
| `tasks.checkAlerts.schedule`  | check-alertsタスクのcronスケジュール                                                                                                                                             | `*/1 * * * *`     |
| `tasks.checkAlerts.resources` | check-alertsタスクのリソース要求と制限                                                                                                                              | `values.yaml`を参照 |


## チャートのアップグレード {#upgrading-the-chart}

新しいバージョンにアップグレードする場合:

```shell
helm upgrade my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
```

利用可能なチャートバージョンを確認する場合:

```shell
helm search repo hyperdx
```


## HyperDXのアンインストール {#uninstalling-hyperdx}

デプロイメントを削除するには:

```shell
helm uninstall my-hyperdx
```

これにより、リリースに関連付けられたすべてのリソースが削除されますが、永続データ(存在する場合)は残ることがあります。


## トラブルシューティング {#troubleshooting}

### ログの確認 {#checking-logs}

```shell
kubectl logs -l app.kubernetes.io/name=hdx-oss-v2
```

### インストール失敗のデバッグ {#debugging-a-failed-instance}

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2 --debug --dry-run
```

### デプロイメントの検証 {#verifying-deployment}

```shell
kubectl get pods -l app.kubernetes.io/name=hdx-oss-v2
```

<JSONSupport />

ユーザーはこれらの環境変数をパラメータまたは`values.yaml`のいずれかで設定できます。例:

_values.yaml_

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

または`--set`を使用:

```shell
helm install myrelease hyperdx-helm --set "hyperdx.env[0].name=BETA_CH_OTEL_JSON_SCHEMA_ENABLED" \
  --set "hyperdx.env[0].value=true" \
  --set "otel.env[0].name=OTEL_AGENT_FEATURE_GATE_ARG" \
  --set "otel.env[0].value=--feature-gates=clickhouse.json"
```
