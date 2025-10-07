---
'slug': '/use-cases/observability/clickstack/deployment/helm'
'title': 'Helm'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 2
'description': 'Helmを使ったClickStackのデプロイ - ClickHouseの可観測スタック'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import hyperdx_24 from '@site/static/images/use-cases/observability/hyperdx-24.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import JSONSupport from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

The helm chart for HyperDX can be found [here](https://github.com/hyperdxio/helm-charts) and is the **recommended** method for production deployments.

By default, the Helm chart provisions all core components, including:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB** (for persistent application state)

However, it can be easily customized to integrate with an existing ClickHouse deployment - for example, one hosted in **ClickHouse Cloud**.

The chart supports standard Kubernetes best practices, including:

- Environment-specific configuration via `values.yaml`
- Resource limits and pod-level scaling
- TLS and ingress configuration
- Secrets management and authentication setup

### Suitable for {#suitable-for}

* Proof of concepts
* Production

## Deployment steps {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Prerequisites {#prerequisites}

- [Helm](https://helm.sh/) v3+
- Kubernetes cluster (v1.20+ recommended)
- `kubectl` configured to interact with your cluster

### Add the HyperDX Helm repository {#add-the-hyperdx-helm-repository}

Add the HyperDX Helm repository:

```shell
helm repo add hyperdx https://hyperdxio.github.io/helm-charts
helm repo update
```

### Installing HyperDX {#installing-hyperdx}

To install the HyperDX chart with default values:

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2
```

### Verify the installation {#verify-the-installation}

Verify the installation:

```shell
kubectl get pods -l "app.kubernetes.io/name=hdx-oss-v2"
```

When all pods are ready, proceed.

### Forward ports {#forward-ports}

ポートフォワーディングを使用することで、HyperDXにアクセスして設定することができます。プロダクションにデプロイするユーザーは、適切なネットワークアクセス、TLS終端、およびスケーラビリティを保証するために、代わりにサービスをイングレスまたはロードバランサーを介して公開するべきです。ポートフォワーディングは、ローカル開発や一時的な管理タスクには適していますが、長期的または高可用性の環境には最適ではありません。

```shell
kubectl port-forward \
  pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}') \
  8080:3000
```

### Navigate to the UI {#navigate-to-the-ui}

[http://localhost:8080](http://localhost:8080)を訪れて、HyperDXのUIにアクセスします。

ユーザーを作成し、要件を満たすユーザー名とパスワードを提供します。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

`Create`をクリックすると、HelmチャートでデプロイされたClickHouseインスタンスに対してデータソースが作成されます。

:::note デフォルト接続のオーバーライド
統合されたClickHouseインスタンスへのデフォルト接続をオーバーライドできます。詳細については、["Using ClickHouse Cloud"](#using-clickhouse-cloud)を参照してください。
:::

代替のClickHouseインスタンスの使用例については、["Create a ClickHouse Cloud connection"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)を参照してください。

### Customizing values (optional) {#customizing-values}

`--set`フラグを使用して設定をカスタマイズできます。たとえば：

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2 --set key=value

Alternatively, edit the `values.yaml`. To retrieve the default values:

```shell
helm show values hyperdx/hdx-oss-v2 > values.yaml
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
helm install my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
```

### Using secrets (optional) {#using-secrets}

APIキーやデータベース資格情報などの機密データを処理するために、Kubernetesシークレットを使用します。HyperDX Helmチャートは、デフォルトのシークレットファイルを提供しており、それを変更してクラスターに適用できます。

#### Using pre-configured secrets {#using-pre-configured-secrets}

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

シークレットをクラスターに適用します：

```shell
kubectl apply -f secrets.yaml
```

#### Creating a custom secret {#creating-a-custom-secret}

好みで、カスタムのKubernetesシークレットを手動で作成できます：

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```

#### Referencing a secret {#referencing-a-secret}

`values.yaml`でシークレットを参照するには：

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```

</VerticalStepper>

## Using ClickHouse Cloud {#using-clickhouse-cloud}

ClickHouse Cloudを使用する場合、HelmチャートでデプロイされたClickHouseインスタンスを無効にし、Cloudの資格情報を指定します：

```shell

# specify ClickHouse Cloud credentials
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # full https url
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>


# how to overwrite default connection
helm install myrelease hyperdx-helm --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} --set clickhouse.config.users.otelUser=${CLICKHOUSE_USER} --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD}
```

代わりに、`values.yaml`ファイルを使用します：

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
helm install my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml

# or if installed...

# helm upgrade my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
```

## Production notes {#production-notes}

デフォルトでは、このチャートはClickHouseとOTelコレクタもインストールします。ただし、プロダクション環境では、ClickHouseとOTelコレクタを別々に管理することをお勧めします。

ClickHouseとOTelコレクタを無効にするには、次の値を設定します：

```shell
helm install myrelease hyperdx-helm --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
```

## Task configuration {#task-configuration}

デフォルトでは、チャートにはcronjobとして設定された1つのタスクがあります。これはアラートが発生すべきかどうかを確認します。その設定オプションは以下の通りです：

| パラメーター | 説明 | デフォルト |
|-----------|-------------|---------|
| `tasks.enabled` | クラスターでのcronタスクの有効/無効を設定します。デフォルトでは、HyperDXイメージはプロセス内でcronタスクを実行します。クラスター内の別のcronタスクを使用したい場合はtrueに変更します。 | `false` |
| `tasks.checkAlerts.schedule` | check-alertsタスクのcronスケジュール | `*/1 * * * *` |
| `tasks.checkAlerts.resources` | check-alertsタスクのリソース要求と制限 | `values.yaml`参照 |

## Upgrading the chart {#upgrading-the-chart}

新しいバージョンにアップグレードするには：

```shell
helm upgrade my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
```

利用可能なチャートバージョンを確認するには：

```shell
helm search repo hyperdx
```

## Uninstalling HyperDX {#uninstalling-hyperdx}

デプロイメントを削除するには：

```shell
helm uninstall my-hyperdx
```

これにより、リリースに関連付けられたすべてのリソースが削除されますが、永続データ（ある場合）は残る可能性があります。

## Troubleshooting {#troubleshooting}

### Checking logs {#checking-logs}

```shell
kubectl logs -l app.kubernetes.io/name=hdx-oss-v2
```

### Debugging a failed install {#debugging-a-failed-instance}

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2 --debug --dry-run
```

### Verifying deployment {#verifying-deployment}

```shell
kubectl get pods -l app.kubernetes.io/name=hdx-oss-v2
```

<JSONSupport/>

ユーザーは、次の環境変数をパラメーターまたは`values.yaml`を介して設定できます。例えば、

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

または`--set`経由で：

```shell
helm install myrelease hyperdx-helm --set "hyperdx.env[0].name=BETA_CH_OTEL_JSON_SCHEMA_ENABLED" \
  --set "hyperdx.env[0].value=true" \
  --set "otel.env[0].name=OTEL_AGENT_FEATURE_GATE_ARG" \
  --set "otel.env[0].value=--feature-gates=clickhouse.json"
```
