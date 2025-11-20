---
slug: /use-cases/observability/clickstack/getting-started/kubernetes
title: 'Kubernetes の監視'
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: 'ClickStack を使った Kubernetes 監視のはじめ方'
doc_type: 'guide'
keywords: ['clickstack', 'kubernetes', 'logs', 'observability', 'container monitoring']
---

import Image from '@theme/IdealImage';
import DemoArchitecture from '@site/docs/use-cases/observability/clickstack/example-datasets/_snippets/_demo.md';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_kubernetes_data from '@site/static/images/use-cases/observability/hyperdx-kubernetes-data.png';
import copy_api_key from '@site/static/images/use-cases/observability/copy_api_key.png';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';
import dashboard_kubernetes from '@site/static/images/use-cases/observability/hyperdx-dashboard-kubernetes.png';

このガイドでは、Kubernetes システムからログとメトリクスを収集し、それらを可視化と分析のために **ClickStack** に送信する方法を説明します。デモ用データとしては、オプションで公式 Open Telemetry デモの ClickStack フォークを使用します。

<iframe width="768" height="432" src="https://www.youtube.com/embed/winI7256Ejk?si=TRThhzCJdq87xg_x" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />


## 前提条件 {#prerequisites}

このガイドを使用するには、以下が必要です：

- **Kubernetesクラスタ**（v1.20以上を推奨）で、ClickHouse用に少なくとも1つのノードに32 GiB以上のRAMと100GB以上のディスク容量が利用可能であること
- **[Helm](https://helm.sh/)** v3以上
- **`kubectl`**がクラスタと通信できるように設定されていること


## デプロイオプション {#deployment-options}

このガイドは、以下のいずれかのデプロイオプションを使用して進めることができます:

- **セルフホスト**: ClickStackをKubernetesクラスタ内に完全にデプロイします。以下が含まれます:
  - ClickHouse
  - HyperDX
  - MongoDB (ダッシュボードの状態と設定に使用)

- **クラウドホスト**: **ClickHouse Cloud**を使用し、HyperDXは外部で管理します。これにより、クラスタ内でClickHouseやHyperDXを実行する必要がなくなります。

アプリケーショントラフィックをシミュレートするには、オプションでClickStackフォークの[**OpenTelemetry Demo Application**](https://github.com/ClickHouse/opentelemetry-demo)をデプロイできます。これにより、ログ、メトリクス、トレースを含むテレメトリデータが生成されます。クラスタ内で既にワークロードが実行されている場合は、このステップをスキップして既存のポッド、ノード、コンテナを監視できます。

<VerticalStepper headerLevel="h3">

### cert-managerのインストール (オプション) {#install-cert-manager}

セットアップでTLS証明書が必要な場合は、Helmを使用して[cert-manager](https://cert-manager.io/)をインストールします:


```shell
# Cert managerリポジトリを追加

helm repo add jetstack https://charts.jetstack.io

helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set startupapicheck.timeout=5m --set installCRDs=true --set global.leaderElection.namespace=cert-manager
```

### OpenTelemetry Demoのデプロイ（オプション） {#deploy-otel-demo}

この**手順はオプションであり、監視対象となる既存のポッドがないユーザーを対象としています**。Kubernetes環境に既存のサービスがデプロイされているユーザーはスキップできますが、このデモにはトレースとセッションリプレイデータを生成する計装済みマイクロサービスが含まれており、ユーザーはClickStackのすべての機能を試すことができます。

以下では、可観測性テストと計装のデモンストレーションに特化したClickStackフォーク版のOpenTelemetry DemoアプリケーションスタックをKubernetesクラスター内にデプロイします。バックエンドマイクロサービス、負荷生成ツール、テレメトリパイプライン、サポートインフラストラクチャ（Kafka、Redisなど）、およびClickStackとのSDK統合が含まれます。

すべてのサービスは`otel-demo`名前空間にデプロイされます。各デプロイメントには以下が含まれます：

- トレース、メトリクス、ログに対するOTelおよびClickStack SDKによる自動計装
- すべてのサービスは計装データを`my-hyperdx-hdx-oss-v2-otel-collector` OpenTelemetryコレクター（未デプロイ）に送信
- 環境変数`OTEL_RESOURCE_ATTRIBUTES`を介してログ、メトリクス、トレースを関連付けるための[リソースタグの転送](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods)


```shell
## デモ用Kubernetesマニフェストファイルをダウンロード
curl -O https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
# wgetを使用する場合
# wget https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
kubectl apply --namespace otel-demo -f opentelemetry-demo.yaml
```

デモのデプロイ後、すべてのPodが正常に作成され、`Running`状態になっていることを確認します:

```shell
kubectl get pods -n=otel-demo

NAME                                 READY   STATUS    RESTARTS   AGE
accounting-fd44f4996-fcl4k           1/1     Running   0          13m
ad-769f968468-qq8mw                  1/1     Running   0          13m
artillery-loadgen-7bc4bdf47d-5sb96   1/1     Running   0          13m
cart-5b4c98bd8-xm7m2                 1/1     Running   0          13m
checkout-784f69b785-cnlpp            1/1     Running   0          13m
currency-fd7775b9c-rf6cr             1/1     Running   0          13m
email-5c54598f99-2td8s               1/1     Running   0          13m
flagd-5466775df7-zjb4x               2/2     Running   0          13m
fraud-detection-5769fdf75f-cjvgh     1/1     Running   0          13m
frontend-6dcb696646-fmcdz            1/1     Running   0          13m
frontend-proxy-7b8f6cd957-s25qj      1/1     Running   0          13m
image-provider-5fdb455756-fs4xv      1/1     Running   0          13m
kafka-7b6666866d-xfzn6               1/1     Running   0          13m
load-generator-57cbb7dfc9-ncxcf      1/1     Running   0          13m
payment-6d96f9bcbd-j8tj6             1/1     Running   0          13m
product-catalog-7fb77f9c78-49bhj     1/1     Running   0          13m
quote-576c557cdf-qn6pr               1/1     Running   0          13m
recommendation-546cc68fdf-8x5mm      1/1     Running   0          13m
shipping-7fc69f7fd7-zxrx6            1/1     Running   0          13m
valkey-cart-5f7b667bb7-gl5v4         1/1     Running   0          13m
```

<DemoArchitecture />

### ClickStack Helmチャートリポジトリを追加 {#add-helm-clickstack}

ClickStackをデプロイするには、[公式Helmチャート](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm)を使用します。

そのため、HyperDX Helmリポジトリを追加する必要があります:

```shell
helm repo add hyperdx https://hyperdxio.github.io/helm-charts
helm repo update
```

### ClickStackをデプロイ {#deploy-clickstack}

Helmチャートをインストールした後、クラスタにClickStackをデプロイできます。ClickHouseとHyperDXを含むすべてのコンポーネントをKubernetes環境内で実行するか、HyperDXがマネージドサービスとして利用可能なClickHouse Cloudを使用することができます。

<br />

<details>
<summary>セルフマネージドデプロイメント</summary>

次のコマンドは、`otel-demo`名前空間にClickStackをインストールします。このHelmチャートは以下をデプロイします:

- ClickHouseインスタンス
- HyperDX
- OTelコレクタのClickStackディストリビューション
- HyperDXアプリケーション状態を保存するためのMongoDB

:::note
Kubernetesクラスタの構成に応じて、`storageClassName`を調整する必要がある場合があります。
:::

OTelデモをデプロイしないユーザーは、適切な名前空間を選択してこれを変更できます。

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2   --set clickhouse.persistence.dataSize=100Gi --set global.storageClassName="standard-rwo" -n otel-demo
```

:::warning 本番環境でのClickStack


このチャートはClickHouseとOTelコレクターもインストールします。本番環境では、ClickHouseおよびOTelコレクターのオペレーターを使用するか、ClickHouse Cloudを使用することを推奨します。

ClickHouseとOTelコレクターを無効にするには、以下の値を設定します:

```shell
helm install myrelease <chart-name-or-path> --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
```

:::

</details>

<details>
<summary>ClickHouse Cloudの使用</summary>

ClickHouse Cloudを使用する場合は、ClickStackをデプロイし、[同梱されているClickHouseを無効化](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud)できます。

:::note
このチャートは現在、常にHyperDXとMongoDBの両方をデプロイします。これらのコンポーネントは代替アクセス経路を提供しますが、ClickHouse Cloud認証とは統合されていません。このデプロイモデルでは、これらのコンポーネントは管理者向けであり、デプロイされたOTelコレクターを通じてデータを取り込むために必要な[セキュアな取り込みキーへのアクセスを提供](#retrieve-ingestion-api-key)しますが、エンドユーザーには公開すべきではありません。
:::


```shell
# ClickHouse Cloudの認証情報を指定
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # 完全なhttps URL
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

helm install my-hyperdx hyperdx/hdx-oss-v2  --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} --set clickhouse.config.users.otelUserName=${CLICKHOUSE_USER} --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD} --set global.storageClassName="standard-rwo" -n otel-demo
```

</details>

デプロイメントのステータスを確認するには、以下のコマンドを実行し、すべてのコンポーネントが`Running`状態であることを確認してください。ClickHouse Cloudを使用している場合、ClickHouseはこのリストに表示されないことに注意してください:

```shell
kubectl get pods -l "app.kubernetes.io/name=hdx-oss-v2" -n otel-demo

NAME                                                    READY   STATUS    RESTARTS   AGE
my-hyperdx-hdx-oss-v2-app-78876d79bb-565tb              1/1     Running   0          14m
my-hyperdx-hdx-oss-v2-clickhouse-57975fcd6-ggnz2        1/1     Running   0          14m
my-hyperdx-hdx-oss-v2-mongodb-984845f96-czb6m           1/1     Running   0          14m
my-hyperdx-hdx-oss-v2-otel-collector-64cf698f5c-8s7qj   1/1     Running   0          14m
```

### HyperDX UIへのアクセス {#access-the-hyperdx-ui}

:::note
ClickHouse Cloudを使用している場合でも、KubernetesクラスタにデプロイされたローカルのHyperDXインスタンスは必要です。これは、HyperDXにバンドルされているOpAMPサーバーによって管理されるインジェストキーを提供し、デプロイされたOTelコレクターを通じて安全なインジェストを実現します。この機能は現在、ClickHouse Cloudホスト版では利用できません。
:::

セキュリティのため、このサービスは`ClusterIP`を使用しており、デフォルトでは外部に公開されません。

HyperDX UIにアクセスするには、ポート3000からローカルポート8080へポートフォワードを設定します。

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

[http://localhost:8080](http://localhost:8080)にアクセスして、HyperDX UIを開きます。

複雑性要件を満たすユーザー名とパスワードを指定して、ユーザーを作成します。

<Image img={hyperdx_login} alt='HyperDX UI' size='lg' />

### インジェストAPIキーの取得 {#retrieve-ingestion-api-key}

ClickStackコレクターによってデプロイされたOTelコレクターへのインジェストは、インジェストキーによって保護されています。

[`Team Settings`](http://localhost:8080/team)に移動し、`API Keys`セクションから`Ingestion API Key`をコピーします。このAPIキーにより、OpenTelemetryコレクターを通じたデータインジェストが安全に行われます。

<Image img={copy_api_key} alt='Copy API key' size='lg' />

### APIキーのKubernetes Secretの作成 {#create-api-key-kubernetes-secret}

インジェストAPIキーと、ClickStack HelmチャートでデプロイされたOTelコレクターの場所を含むコンフィグマップを使用して、新しいKubernetes Secretを作成します。後続のコンポーネントは、これを使用してClickStack Helmチャートでデプロイされたコレクターへのインジェストを可能にします:


```shell
# 取り込みAPIキーを使用してシークレットを作成
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
-n otel-demo
```


# 上記でデプロイしたClickStack OTelコレクターを指すConfigMapを作成する

kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318

````

Ingestion APIキーを反映させるため、OpenTelemetryデモアプリケーションのPodを再起動します。

```shell
kubectl rollout restart deployment -n otel-demo -l app.kubernetes.io/part-of=opentelemetry-demo
````

これで、デモサービスからのトレースとログデータがHyperDXに流れ始めます。

<Image img={hyperdx_kubernetes_data} alt='HyperDX Kubernetesデータ' size='lg' />

### OpenTelemetry Helmリポジトリを追加する {#add-otel-helm-repo}

Kubernetesメトリクスを収集するため、標準のOTelコレクターをデプロイし、上記のIngestion APIキーを使用してClickStackコレクターに安全にデータを送信するように設定します。

そのためには、OpenTelemetry Helmリポジトリをインストールする必要があります:


```shell
# Otel Helmリポジトリを追加
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

### Kubernetesコレクターコンポーネントのデプロイ {#deploy-kubernetes-collector-components}

クラスター自体と各ノードの両方からログとメトリクスを収集するには、それぞれ独自のマニフェストを持つ2つの別々のOpenTelemetryコレクターをデプロイする必要があります。提供される2つのマニフェスト(`k8s_deployment.yaml`と`k8s_daemonset.yaml`)は連携して、Kubernetesクラスターから包括的なテレメトリデータを収集します。

- `k8s_deployment.yaml`は、**クラスター全体のイベントとメタデータ**を収集する**単一のOpenTelemetry Collectorインスタンス**をデプロイします。Kubernetesイベントやクラスターメトリクスを収集し、ポッドのラベルとアノテーションでテレメトリデータをエンリッチします。このコレクターは、データの重複を避けるために単一レプリカのスタンドアロンデプロイメントとして実行されます。

- `k8s_daemonset.yaml`は、クラスター内のすべてのノードで実行される**DaemonSetベースのコレクター**をデプロイします。`kubeletstats`、`hostmetrics`、Kubernetes属性プロセッサーなどのコンポーネントを使用して、**ノードレベルおよびポッドレベルのメトリクス**とコンテナログを収集します。これらのコレクターはログをメタデータでエンリッチし、OTLPエクスポーターを使用してHyperDXに送信します。

これらのマニフェストを組み合わせることで、インフラストラクチャからアプリケーションレベルのテレメトリまで、クラスター全体のフルスタックオブザーバビリティが実現され、エンリッチされたデータはClickStackに送信されて一元的な分析が行われます。

まず、コレクターをデプロイメントとしてインストールします:


```shell
# マニフェストファイルのダウンロード
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_deployment.yaml
# Helmチャートのインストール
helm install --namespace otel-demo k8s-otel-deployment open-telemetry/opentelemetry-collector -f k8s_deployment.yaml
```

<details>
<summary>k8s_deployment.yaml</summary>


```yaml
# k8s_deployment.yaml
mode: deployment

image:
  repository: otel/opentelemetry-collector-contrib
  tag: 0.123.0
```


# これらのコレクターは1つのみ必要です - 複数存在すると重複データが生成されます

replicaCount: 1

presets:
kubernetesAttributes:
enabled: true # 有効にすると、プロセッサは関連するポッドのすべてのラベルを抽出し、リソース属性として追加します。# ラベルの正確な名前がキーとなります。
extractAllPodLabels: true # 有効にすると、プロセッサは関連するポッドのすべてのアノテーションを抽出し、リソース属性として追加します。# アノテーションの正確な名前がキーとなります。
extractAllPodAnnotations: true

# Kubernetesイベントを収集するようコレクターを設定します。

# k8sobjectレシーバーをログパイプラインに追加し、デフォルトでKubernetesイベントを収集します。

# 詳細: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver

kubernetesEvents:
enabled: true

# クラスターレベルのメトリクスを収集するようKubernetes Cluster Receiverを設定します。

# k8s_clusterレシーバーをメトリクスパイプラインに追加し、必要なルールをClusterRoleに追加します。

# 詳細: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-cluster-receiver

clusterMetrics:
enabled: true

extraEnvs:

- name: HYPERDX_API_KEY
  valueFrom:
  secretKeyRef:
  name: hyperdx-secret
  key: HYPERDX_API_KEY
  optional: true
- name: YOUR_OTEL_COLLECTOR_ENDPOINT
  valueFrom:
  configMapKeyRef:
  name: otel-config-vars
  key: YOUR_OTEL_COLLECTOR_ENDPOINT

config:
exporters:
otlphttp:
endpoint: "${env:YOUR_OTEL_COLLECTOR_ENDPOINT}"
      compression: gzip
      headers:
        authorization: "${env:HYPERDX_API_KEY}"
service:
pipelines:
logs:
exporters: - otlphttp
metrics:
exporters: - otlphttp

```

</details>

次に、ノードおよびポッドレベルのメトリクスとログ用にコレクターをDaemonSetとしてデプロイします:

```


```shell
# マニフェストファイルをダウンロード
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_daemonset.yaml
# Helmチャートをインストール
helm install --namespace otel-demo k8s-otel-daemonset open-telemetry/opentelemetry-collector -f k8s_daemonset.yaml
```

<details>

<summary>`k8s_daemonset.yaml`</summary>


```yaml
# k8s_daemonset.yaml
mode: daemonset

image:
  repository: otel/opentelemetry-collector-contrib
  tag: 0.123.0
```


# kubeletstats の CPU/メモリ使用率メトリクスを使用するために必要

clusterRole:
create: true
rules: - apiGroups: - ''
resources: - nodes/proxy
verbs: - get

presets:
logsCollection:
enabled: true
hostMetrics:
enabled: true

# Kubernetes メタデータを追加するための Kubernetes プロセッサを設定します。

# すべてのパイプラインに k8sattributes プロセッサを追加し、ClusterRole に必要なルールを追加します。

# 詳細: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor

kubernetesAttributes:
enabled: true # 有効にすると、プロセッサは関連する Pod のすべてのラベルを抽出し、リソース属性として追加します。# ラベルの正確な名前がキーになります。
extractAllPodLabels: true # 有効にすると、プロセッサは関連する Pod のすべてのアノテーションを抽出し、リソース属性として追加します。# アノテーションの正確な名前がキーになります。
extractAllPodAnnotations: true

# kubelet 上の API サーバーからノード、Pod、コンテナのメトリクスを収集するようにコレクターを設定します。

# メトリクスパイプラインに kubeletstats レシーバーを追加し、ClusterRole に必要なルールを追加します。

# 詳細: https://opentelemetry.io/docs/kubernetes/collector/components/#kubeletstats-receiver

kubeletMetrics:
enabled: true

extraEnvs:

- name: HYPERDX_API_KEY
  valueFrom:
  secretKeyRef:
  name: hyperdx-secret
  key: HYPERDX_API_KEY
  optional: true
- name: YOUR_OTEL_COLLECTOR_ENDPOINT
  valueFrom:
  configMapKeyRef:
  name: otel-config-vars
  key: YOUR_OTEL_COLLECTOR_ENDPOINT

config:
receivers: # 追加の kubelet メトリクスを設定
kubeletstats:
collection_interval: 20s
auth_type: 'serviceAccount'
endpoint: '${env:K8S_NODE_NAME}:10250'
insecure_skip_verify: true
metrics:
k8s.pod.cpu_limit_utilization:
enabled: true
k8s.pod.cpu_request_utilization:
enabled: true
k8s.pod.memory_limit_utilization:
enabled: true
k8s.pod.memory_request_utilization:
enabled: true
k8s.pod.uptime:
enabled: true
k8s.node.uptime:
enabled: true
k8s.container.cpu_limit_utilization:
enabled: true
k8s.container.cpu_request_utilization:
enabled: true
k8s.container.memory_limit_utilization:
enabled: true
k8s.container.memory_request_utilization:
enabled: true
container.uptime:
enabled: true

exporters:
otlphttp:
endpoint: "${env:YOUR_OTEL_COLLECTOR_ENDPOINT}"
      compression: gzip
      headers:
        authorization: "${env:HYPERDX_API_KEY}"

service:
pipelines:
logs:
exporters: - otlphttp
metrics:
exporters: - otlphttp

```

</details>

### HyperDX で Kubernetes データを探索 {#explore-kubernetes-data-hyperdx}

HyperDX UI に移動します。Kubernetes にデプロイされたインスタンスまたは ClickHouse Cloud 経由でアクセスできます。

<p/>
<details>
<summary>ClickHouse Cloud を使用する</summary>

ClickHouse Cloud を使用する場合は、ClickHouse Cloud サービスにログインし、左側のメニューから「HyperDX」を選択します。自動的に認証されるため、ユーザーを作成する必要はありません。

データソースの作成を求められたら、ソース作成モデル内のすべてのデフォルト値を保持し、Table フィールドに `otel_logs` を入力してログソースを作成します。その他の設定は自動検出されるため、`Save New Source` をクリックできます。

<Image force img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX データソース" size="lg"/>

トレースとメトリクス用のデータソースも作成する必要があります。

例えば、トレースと OTel メトリクスのソースを作成するには、上部メニューから `Create New Source` を選択します。

<Image force img={hyperdx_create_new_source} alt="HyperDX 新規ソース作成" size="lg"/>

ここから、必要なソースタイプを選択し、続いて適切なテーブルを選択します。例えば、トレースの場合は `otel_traces` テーブルを選択します。すべての設定は自動検出されます。

<Image force img={hyperdx_create_trace_datasource} alt="HyperDX トレースソース作成" size="lg"/>

```


:::note ソースの相関付け
ClickStackでは、ログやトレースなどの異なるデータソースを相互に相関付けることができます。これを有効にするには、各ソースで追加の設定が必要です。例えば、ログソースで対応するトレースソースを指定でき、トレースソースでも同様です。詳細については「Correlated sources」を参照してください。
:::

</details>

<details>

<summary>セルフマネージド型デプロイメントを使用する場合</summary>

ローカルにデプロイされたHyperDXにアクセスするには、以下のコマンドでポートフォワーディングを行い、[http://localhost:8080](http://localhost:8080)でHyperDXにアクセスします。

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

:::note 本番環境でのClickStack
本番環境では、ClickHouse CloudでHyperDXを使用していない場合、TLSを使用したIngressの利用を推奨します。例：

```shell
helm upgrade my-hyperdx hyperdx/hdx-oss-v2 \
--set hyperdx.ingress.enabled=true \
--set hyperdx.ingress.host=your-domain.com \
--set hyperdx.ingress.tls.enabled=true
```

:::

</details>

Kubernetesデータを確認するには、`/kubernetes`にある専用ダッシュボードに移動します（例：[http://localhost:8080/kubernetes](http://localhost:8080/kubernetes)）。

Pods、Nodes、Namespacesの各タブにデータが表示されます。

</VerticalStepper>

<Image img={dashboard_kubernetes} alt='ClickHouse kubernetes' size='lg' />
