---
'slug': '/use-cases/observability/clickstack/getting-started/kubernetes'
'title': 'Kubernetesの監視'
'sidebar_position': 1
'pagination_prev': null
'pagination_next': null
'description': 'ClickStackを使ったKubernetesの監視の開始'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import DemoArchitecture from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/example-datasets/_snippets/_demo.md';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_kubernetes_data from '@site/static/images/use-cases/observability/hyperdx-kubernetes-data.png';
import copy_api_key from '@site/static/images/use-cases/observability/copy_api_key.png';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';
import dashboard_kubernetes from '@site/static/images/use-cases/observability/hyperdx-dashboard-kubernetes.png';

このガイドでは、Kubernetes システムからログやメトリクスを収集し、**ClickStack** に送信して可視化および分析を行う方法を説明します。デモデータとして、オプションで公式の Open Telemetry デモの ClickStack フォークを使用します。

<iframe width="768" height="432" src="https://www.youtube.com/embed/winI7256Ejk?si=TRThhzCJdq87xg_x" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 前提条件 {#prerequisites}

このガイドを利用するには、以下の条件を満たす必要があります。

- **Kubernetes クラスター**（推奨バージョンは v1.20 以上）で、ClickHouse 用に少なくとも 32 GiB の RAM と 100 GB のディスクスペースが 1 ノードに利用可能であること。
- **[Helm](https://helm.sh/)** v3 以上
- **`kubectl`** がクラスターと対話できるように設定されていること。

## デプロイオプション {#deployment-options}

以下のいずれかのデプロイオプションを使用して、このガイドに従うことができます。

- **セルフホスト**: Kubernetes クラスター内で ClickStack を完全にデプロイします。これには以下が含まれます。
  - ClickHouse
  - HyperDX
  - MongoDB（ダッシュボードの状態と構成に使用）

- **クラウドホスト**: **ClickHouse Cloud** を使用し、HyperDX は外部で管理されます。これにより、クラスター内で ClickHouse や HyperDX を実行する必要がなくなります。

アプリケーショントラフィックをシミュレートするために、オプションで [**OpenTelemetry Demo Application**](https://github.com/ClickHouse/opentelemetry-demo) の ClickStack フォークをデプロイできます。これにより、ログ、メトリクス、およびトレースを含むテレメトリデータが生成されます。すでにクラスターでワークロードが実行中の場合は、このステップをスキップし、既存のポッド、ノード、およびコンテナを監視できます。

<VerticalStepper headerLevel="h3">

### cert-manager のインストール (オプション) {#install-cert-manager}

セットアップで TLS 証明書が必要な場合は、Helm を使用して [cert-manager](https://cert-manager.io/) をインストールします。

```shell

# Add Cert manager repo 

helm repo add jetstack https://charts.jetstack.io 

helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set startupapicheck.timeout=5m --set installCRDs=true --set global.leaderElection.namespace=cert-manager
```

### OpenTelemetry デモのデプロイ (オプション) {#deploy-otel-demo}

この **ステップはオプションであり、監視する既存のポッドがないユーザー向けに設計されています**。Kubernetes 環境に既存のサービスをデプロイしているユーザーはこのデモをスキップできますが、このデモにはトレースとセッションリプレイデータを生成する計測されたマイクロサービスが含まれているため、ユーザーは ClickStack のすべての機能を探索できます。

以下は、観測可能性のテストと計測を示すために調整された OpenTelemetry デモアプリケーションスタックの ClickStack フォークを Kubernetes クラスター内にデプロイします。これには、バックエンドマイクロサービス、負荷生成器、テレメトリパイプライン、サポートインフラストラクチャ（例：Kafka、Redis）、および ClickStack との SDK 統合が含まれます。

すべてのサービスは `otel-demo` ネームスペースにデプロイされます。各デプロイメントには以下が含まれます。

- トレース、メトリクス、ログ用の OTel および ClickStack SDK による自動計測。
- すべてのサービスが、`my-hyperdx-hdx-oss-v2-otel-collector` OpenTelemetry コレクター（未デプロイ）に、その計測データを送信します。
- [リソースタグの転送](/use-cases/observability/clickstack/ingesting-data/kubernetes#forwarding-resouce-tags-to-pods)により、環境変数 `OTEL_RESOURCE_ATTRIBUTES` を介してログ、メトリクス、トレースを相関させます。

```shell
## download demo Kubernetes manifest file
curl -O https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml

# wget alternative

# wget https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
kubectl apply --namespace otel-demo -f opentelemetry-demo.yaml
```

デモのデプロイ後、すべてのポッドが正常に作成され、`Running` 状態であることを確認します。

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

<DemoArchitecture/>

### ClickStack Helm チャートリポジトリの追加 {#add-helm-clickstack}

ClickStack をデプロイするには、[公式 Helm チャート](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm)を使用します。

これには、HyperDX Helm リポジトリを追加する必要があります。

```shell
helm repo add hyperdx https://hyperdxio.github.io/helm-charts
helm repo update
```

### ClickStack のデプロイ {#deploy-clickstack}

Helm チャートをインストールすると、ClickStack をクラスターにデプロイできます。ClickHouse と HyperDX を Kubernete 環境内で実行するか、ClickHouse Cloud を使用して HyperDX を管理サービスとして利用することができます。
<br/>

<details>
<summary>セルフマネージドデプロイ</summary>

以下のコマンドは、`otel-demo` ネームスペースに ClickStack をインストールします。この helm チャートは以下をデプロイします：

- ClickHouse インスタンス
- HyperDX
- OTel コレクターの ClickStack ディストリビューション
- HyperDX アプリケーション状態のストレージ用 MongoDB

:::note
Kubernetes クラスターの設定に応じて、`storageClassName` を調整する必要があるかもしれません。
:::

OTel デモをデプロイしないユーザーは、適切なネームスペースを選択してこれを修正できます。

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2   --set clickhouse.persistence.dataSize=100Gi --set global.storageClassName="standard-rwo" -n otel-demo
```

:::warning ClickStack のプロダクション使用

このチャートは ClickHouse と OTel コレクターもインストールします。プロダクションでは、ClickHouse および OTel コレクターのオペレーターを使用することや、ClickHouse Cloud を利用することをお勧めします。

ClickHouse と OTel コレクターを無効にするには、次の値を設定します：

```shell
helm install myrelease <chart-name-or-path> --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
```

:::

</details>

<details>
<summary>ClickHouse Cloud を使用</summary>

ClickHouse Cloud を使用する場合は、ClickStack をデプロイし、[含まれる ClickHouse を無効にする](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud)ことができます。

:::note
このチャートは現在、常に HyperDX と MongoDB の両方をデプロイします。これらのコンポーネントは代替的なアクセスパスを提供しますが、ClickHouse Cloud 認証には統合されていません。これらのコンポーネントは、このデプロイメントモデルの管理者向けに設計されており、[デプロイされた OTel コレクターを介してデータを取り込むために必要なセキュアな取り込みキー](#retrieve-ingestion-api-key)へのアクセスを提供しますが、エンドユーザーに対しては公開されるべきではありません。
:::

```shell

# specify ClickHouse Cloud credentials
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # full https url
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

helm install my-hyperdx hyperdx/hdx-oss-v2  --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} --set clickhouse.config.users.otelUser=${CLICKHOUSE_USER} --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD} --set global.storageClassName="standard-rwo" -n otel-demo
```

</details>

デプロイ状況を確認するには、以下のコマンドを実行し、すべてのコンポーネントが `Running` 状態であることを確認します。ClickHouse Cloud を使用するユーザーにとっては、ClickHouse はここに表示されません。

```shell
kubectl get pods -l "app.kubernetes.io/name=hdx-oss-v2" -n otel-demo

NAME                                                    READY   STATUS    RESTARTS   AGE
my-hyperdx-hdx-oss-v2-app-78876d79bb-565tb              1/1     Running   0          14m
my-hyperdx-hdx-oss-v2-clickhouse-57975fcd6-ggnz2        1/1     Running   0          14m
my-hyperdx-hdx-oss-v2-mongodb-984845f96-czb6m           1/1     Running   0          14m
my-hyperdx-hdx-oss-v2-otel-collector-64cf698f5c-8s7qj   1/1     Running   0          14m
```

### HyperDX UI にアクセス {#access-the-hyperdx-ui}

:::note
ClickHouse Cloud を使用している場合でも、Kubernetes クラスターにデプロイされたローカルの HyperDX インスタンスが依然として必要です。これは、HyperDX にバンドルされた OpAMP サーバーによって管理される取り込みキーを提供し、デプロイされた OTel コレクターを介してのセキュアな取り込みを可能にします - これは現在 ClickHouse Cloud ホスティングバージョンには利用できない機能です。
:::

セキュリティのため、このサービスは `ClusterIP` を使用し、デフォルトで外部には公開されません。

HyperDX UI にアクセスするには、ポートフォワードを使用して 3000 ポートからローカルポート 8080 に接続します。

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

[http://localhost:8080](http://localhost:8080) に移動して HyperDX UI にアクセスします。

ユーザーを作成し、複雑さの要件を満たすユーザー名とパスワードを提供します。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

### 取り込み API キーを取得 {#retrieve-ingestion-api-key}

ClickStack コレクターによってデプロイされた OTel コレクターへの取り込みは、取り込みキーで保護されています。

[`チーム設定`](http://localhost:8080/team) に移動し、`API キー` セクションから `取り込み API キー` をコピーします。この API キーは、OpenTelemetry コレクターを介したデータ取り込みが安全であることを保証します。

<Image img={copy_api_key} alt="Copy API key" size="lg"/>

### API キー Kubernetes シークレットの作成 {#create-api-key-kubernetes-secret}

取り込み API キーと、ClickStack helm チャートでデプロイされた OTel コレクターの場所を含むコンフィグマップを持つ新しい Kubernetes シークレットを作成します。後のコンポーネントは、このシークレットを使用して ClickStack Helm チャートでデプロイされたコレクターへの取り込みを許可します。

```shell

# create secret with the ingestion API key
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
-n otel-demo


# create a ConfigMap pointing to the ClickStack OTel collector deployed above
kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318
```

取り込み API キーを考慮して OpenTelemetry デモアプリケーションポッドを再起動します。

```shell
kubectl rollout restart deployment -n otel-demo -l app.kubernetes.io/part-of=opentelemetry-demo
```

デモサービスからのトレースとログデータが HyperDX に流れ始めるはずです。

<Image img={hyperdx_kubernetes_data} alt="HyperDX Kubernetes Data" size="lg"/>

### OpenTelemetry Helm リポジトリの追加 {#add-otel-helm-repo}

Kubernetes のメトリックを収集するために、標準の OTel コレクターをデプロイし、上記の取り込み API キーを使用して ClickStack コレクターにデータを安全に送信するように設定します。

これには、OpenTelemetry Helm リポジトリをインストールする必要があります。

```shell

# Add Otel Helm repo
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts 
```

### Kubernetes コレクターコンポーネントのデプロイ {#deploy-kubernetes-collector-components}

クラスターそのものと各ノードからログやメトリクスを収集するために、2 つの別々の OpenTelemetry コレクターをデプロイする必要があります。それぞれ独自のマニフェストを持つ 2 つのマニフェスト - `k8s_deployment.yaml` と `k8s_daemonset.yaml` - は、Kubernetes クラスターから包括的なテレメトリデータを収集するために協力します。

- `k8s_deployment.yaml` は、**クラスター全体のイベントとメタデータ**を収集する **単一の OpenTelemetry コレクターインスタンス** をデプロイします。これにより、Kubernetes イベント、クラスターのメトリクスを収集し、ポッドラベルと注釈でテレメトリデータを強化します。このコレクターは、重複データを避けるために、単一のレプリカでスタンドアロンデプロイメントとして実行されます。

- `k8s_daemonset.yaml` は、クラスター内のすべてのノードで実行される **DaemonSet ベースのコレクター** をデプロイします。これにより、ノードレベルおよびポッドレベルのメトリクス、およびコンテナログが収集され、`kubeletstats`、`hostmetrics`、および Kubernetes 属性プロセッサのようなコンポーネントを使用します。これらのコレクターは、メタデータでログを強化し、OTLP エクスポーターを使用して HyperDX に送信します。

これらのマニフェストを組み合わせることで、インフラストラクチャからアプリケーションレベルのテレメトリに至るまで、クラスター全体の観測可能性を実現し、強化されたデータを ClickStack に送信して集中分析を行うことができます。

まず、デプロイメントとしてコレクターをインストールします。

```shell

# download manifest file
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_deployment.yaml

# install the helm chart
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


# We only want one of these collectors - any more and we'd produce duplicate data
replicaCount: 1

presets:
  kubernetesAttributes:
    enabled: true
    # When enabled, the processor will extract all labels for an associated pod and add them as resource attributes.
    # The label's exact name will be the key.
    extractAllPodLabels: true
    # When enabled, the processor will extract all annotations for an associated pod and add them as resource attributes.
    # The annotation's exact name will be the key.
    extractAllPodAnnotations: true
  # Configures the collector to collect Kubernetes events.
  # Adds the k8sobject receiver to the logs pipeline and collects Kubernetes events by default.
  # More Info: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver
  kubernetesEvents:
    enabled: true
  # Configures the Kubernetes Cluster Receiver to collect cluster-level metrics.
  # Adds the k8s_cluster receiver to the metrics pipeline and adds the necessary rules to ClusteRole.
  # More Info: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-cluster-receiver
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
        exporters:
          - otlphttp
      metrics:
        exporters:
          - otlphttp
```

</details>

次に、ノードおよびポッドレベルのメトリクスとログのためにコレクターを DaemonSet としてデプロイします。

```shell

# download manifest file
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_daemonset.yaml

# install the helm chart
helm install --namespace otel-demo k8s-otel-daemonset open-telemetry/opentelemetry-collector -f k8s_daemonset.yaml
```

<details>

<summary>
`k8s_daemonset.yaml`
</summary>

```yaml

# k8s_daemonset.yaml
mode: daemonset

image:
  repository: otel/opentelemetry-collector-contrib
  tag: 0.123.0


# Required to use the kubeletstats cpu/memory utilization metrics
clusterRole:
  create: true
  rules:
    - apiGroups:
        - ''
      resources:
        - nodes/proxy
      verbs:
        - get

presets:
  logsCollection:
    enabled: true
  hostMetrics:
    enabled: true
  # Configures the Kubernetes Processor to add Kubernetes metadata.
  # Adds the k8sattributes processor to all the pipelines and adds the necessary rules to ClusterRole.
  # More Info: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor
  kubernetesAttributes:
    enabled: true
    # When enabled, the processor will extract all labels for an associated pod and add them as resource attributes.
    # The label's exact name will be the key.
    extractAllPodLabels: true
    # When enabled, the processor will extract all annotations for an associated pod and add them as resource attributes.
    # The annotation's exact name will be the key.
    extractAllPodAnnotations: true
  # Configures the collector to collect node, pod, and container metrics from the API server on a kubelet..
  # Adds the kubeletstats receiver to the metrics pipeline and adds the necessary rules to ClusterRole.
  # More Info: https://opentelemetry.io/docs/kubernetes/collector/components/#kubeletstats-receiver
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
  receivers:
    # Configures additional kubelet metrics
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
        exporters:
          - otlphttp
      metrics:
        exporters:
          - otlphttp
```

</details>

### HyperDX での Kubernetes データの探索 {#explore-kubernetes-data-hyperdx}

HyperDX UI に移動します - Kubernetes にデプロイされたインスタンスまたは ClickHouse Cloud を介して。

<p/>
<details>
<summary>ClickHouse Cloud を使用</summary>

ClickHouse Cloud を使用している場合は、単に ClickHouse Cloud サービスにログインし、左メニューから「HyperDX」を選択します。自動的に認証され、ユーザーを作成する必要はありません。

データソースを作成するように求められたら、作成モデル内のすべてのデフォルト値を保持し、`otel_logs` の値を Table フィールドに入力してログソースを作成します。他のすべての設定は自動的に検出され、`新しいソースを保存` をクリックできます。

<Image force img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX Datasource" size="lg"/>

トレースおよびメトリクス用のデータソースも作成する必要があります。

たとえば、トレースおよび OTel メトリクス用のソースを作成するには、ユーザーはトップメニューから `新しいソースを作成` を選択できます。

<Image force img={hyperdx_create_new_source} alt="HyperDX create new source" size="lg"/>

ここから、必要なソースタイプを選択し、次に適切なテーブルを選択します。たとえば、トレースの場合は `otel_traces` テーブルを選択します。すべての設定は自動的に検出されるはずです。

<Image force img={hyperdx_create_trace_datasource} alt="HyperDX create trace source" size="lg"/>

:::note ソースの相関
ClickStack 内の異なるデータソース（ログやトレースなど）は互いに相関させることができます。これを有効にするには、各ソースに追加の設定が必要です。たとえば、ログソースでは対応するトレースソースを指定でき、その逆も可能です。「相関ソース」の詳細を参照してください。
:::

</details>

<details>

<summary>セルフマネージドデプロイを使用</summary>

ローカルにデプロイされた HyperDX にアクセスするには、ローカルコマンドを使用してポートフォワードを行い、[http://localhost:8080](http://localhost:8080) で HyperDX にアクセスします。

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

:::note ClickStack のプロダクション使用
プロダクション環境では、ClickHouse Cloud に HyperDX を使用しない場合、TLS を使用したイングレスを使用することをお勧めします。たとえば：

```shell
helm upgrade my-hyperdx hyperdx/hdx-oss-v2 \
--set hyperdx.ingress.enabled=true \
--set hyperdx.ingress.host=your-domain.com \
--set hyperdx.ingress.tls.enabled=true
```
::::

</details>

Kubernetes データを探索するには、専用のプレゼンテーションダッシュボード `/kubernetes` に移動します。例：[http://localhost:8080/kubernetes](http://localhost:8080/kubernetes)。

各タブ、Pods、Nodes、および Namespaces にはデータが表示されているはずです。

</VerticalStepper>

<Image img={dashboard_kubernetes} alt="ClickHouse kubernetes" size="lg"/>
