---
slug: /use-cases/observability/clickstack/getting-started/kubernetes
title: 'Kubernetes の監視'
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: 'ClickStack ではじめる Kubernetes 監視'
doc_type: 'guide'
keywords: ['clickstack', 'kubernetes', 'ログ', 'オブザーバビリティ', 'コンテナ監視']
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

このガイドでは、Kubernetes システムからログとメトリクスを収集し、それらを可視化および分析するために **ClickStack** へ送信する方法を説明します。デモ用データには、オプションで ClickStack フォーク版の公式 OpenTelemetry デモを使用できます。

<iframe width="768" height="432" src="https://www.youtube.com/embed/winI7256Ejk?si=TRThhzCJdq87xg_x" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />


## 前提条件 {#prerequisites}

本ガイドの手順を進めるには、以下が必要です:

- **Kubernetes クラスター**（v1.20+ を推奨）で、少なくとも 32 GiB の RAM と、1 つのノード上に ClickHouse 用として 100GB の空きディスク容量があること
- **[Helm](https://helm.sh/)** v3+
- クラスターと通信できるように設定された **`kubectl`**



## デプロイオプション {#deployment-options}

このガイドでは、以下のいずれかのデプロイオプションを使用できます:

- **セルフホスト**: ClickStackを以下のコンポーネントを含めてKubernetesクラスタ内に完全にデプロイします:
  - ClickHouse
  - HyperDX
  - MongoDB (ダッシュボードの状態と設定に使用)

- **クラウドホスト**: **ClickHouse Cloud**を使用し、HyperDXは外部で管理します。これにより、クラスタ内でClickHouseやHyperDXを実行する必要がなくなります。

アプリケーショントラフィックをシミュレートするには、オプションでClickStackフォークの[**OpenTelemetry Demo Application**](https://github.com/ClickHouse/opentelemetry-demo)をデプロイできます。これにより、ログ、メトリクス、トレースを含むテレメトリデータが生成されます。クラスタ内で既にワークロードが実行されている場合は、この手順をスキップして既存のポッド、ノード、コンテナを監視できます。

<VerticalStepper headerLevel="h3">

### cert-managerのインストール (オプション) {#install-cert-manager}

セットアップでTLS証明書が必要な場合は、Helmを使用して[cert-manager](https://cert-manager.io/)をインストールします:


```shell
# cert-manager リポジトリを追加 

helm repo add jetstack https://charts.jetstack.io 

helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set startupapicheck.timeout=5m --set installCRDs=true --set global.leaderElection.namespace=cert-manager
```

### OpenTelemetry デモをデプロイする（オプション）

この**手順はオプションであり、監視対象の既存ポッドがないユーザーを対象としています**。Kubernetes 環境に既存のサービスをすでにデプロイしているユーザーはスキップしてもかまいませんが、このデモにはトレースとセッションリプレイ用データを生成する計測済みマイクロサービスが含まれており、ClickStack のすべての機能を確認できます。

以下の手順では、Kubernetes クラスター内に ClickStack フォーク版の OpenTelemetry Demo アプリケーションスタックをデプロイします。これはオブザーバビリティのテストおよび計測のデモに特化した構成です。バックエンドマイクロサービス、負荷ジェネレーター、テレメトリパイプライン、サポートインフラストラクチャ（例: Kafka、Redis）、および ClickStack 向け SDK 連携が含まれます。

すべてのサービスは `otel-demo` ネームスペースにデプロイされます。各デプロイメントには次が含まれます。

* トレース、メトリクス、ログ向けの OTel および ClickStack SDKs による自動計測
* すべてのサービスは `my-hyperdx-hdx-oss-v2-otel-collector` OpenTelemetry collector（このデモではデプロイされません）に計測データを送信します
* 環境変数 `OTEL_RESOURCE_ATTRIBUTES` を用いた[リソースタグの転送](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods)により、ログ、メトリクス、トレースを相関付けます。


```shell
## デモ用 Kubernetes マニフェストファイルをダウンロード
curl -O https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
# wget を使用する場合
# wget https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
kubectl apply --namespace otel-demo -f opentelemetry-demo.yaml
```

デモのデプロイ後、すべてのポッドが正常に作成され、`Running` 状態になっていることを確認します:

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

### ClickStack Helm チャートリポジトリを追加 {#add-helm-clickstack}

ClickStack をデプロイするには、[公式 Helm チャート](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm)を使用します。

そのため、HyperDX Helm リポジトリを追加する必要があります:

```shell
helm repo add hyperdx https://hyperdxio.github.io/helm-charts
helm repo update
```

### ClickStack をデプロイ {#deploy-clickstack}

Helm チャートをインストールした後、クラスタに ClickStack をデプロイできます。ClickHouse と HyperDX を含むすべてのコンポーネントを Kubernetes 環境内で実行するか、HyperDX もマネージドサービスとして利用可能な ClickHouse Cloud を使用するかを選択できます。

<br />

<details>
<summary>セルフマネージドデプロイメント</summary>

次のコマンドは、`otel-demo` ネームスペースに ClickStack をインストールします。この helm チャートは以下をデプロイします:

- ClickHouse インスタンス
- HyperDX
- ClickStack ディストリビューションの OTel collector
- HyperDX アプリケーション状態を保存するための MongoDB

:::note
Kubernetes クラスタの構成に応じて、`storageClassName` を調整する必要がある場合があります。
:::

OTel デモをデプロイしないユーザーは、適切なネームスペースを選択してこれを変更できます。

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2   --set clickhouse.persistence.dataSize=100Gi --set global.storageClassName="standard-rwo" -n otel-demo
```

:::warning 本番環境での ClickStack


このチャートはClickHouseとOTel collectorもインストールします。本番環境では、ClickHouseおよびOTel collectorのオペレーターを使用するか、ClickHouse Cloudを使用することを推奨します。

ClickHouseとOTel collectorを無効にするには、以下の値を設定します。

```shell
helm install myrelease <chart-name-or-path> --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
```

:::

</details>

<details>
<summary>ClickHouse Cloudの使用</summary>

ClickHouse Cloudを使用する場合は、ClickStackをデプロイし、[同梱されているClickHouseを無効化](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud)できます。

:::note
このチャートは現在、常にHyperDXとMongoDBの両方をデプロイします。これらのコンポーネントは代替アクセス経路を提供しますが、ClickHouse Cloud認証とは統合されていません。これらのコンポーネントは、このデプロイメントモデルにおいて管理者向けであり、デプロイされたOTel collectorを通じてデータを取り込むために必要な[セキュアなインジェストキーへのアクセスを提供](#retrieve-ingestion-api-key)しますが、エンドユーザーには公開すべきではありません。
:::


```shell
# ClickHouse Cloud の認証情報を指定
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # full https url
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

helm install my-hyperdx hyperdx/hdx-oss-v2  --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} --set clickhouse.config.users.otelUserName=${CLICKHOUSE_USER} --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD} --set global.storageClassName="standard-rwo" -n otel-demo
```

</details>

デプロイメントのステータスを確認するには、以下のコマンドを実行し、すべてのコンポーネントが `Running` 状態であることを確認します。ClickHouse Cloud を使用している場合、ClickHouse はこの一覧に表示されません:

```shell
kubectl get pods -l "app.kubernetes.io/name=hdx-oss-v2" -n otel-demo

NAME                                                    READY   STATUS    RESTARTS   AGE
my-hyperdx-hdx-oss-v2-app-78876d79bb-565tb              1/1     Running   0          14m
my-hyperdx-hdx-oss-v2-clickhouse-57975fcd6-ggnz2        1/1     Running   0          14m
my-hyperdx-hdx-oss-v2-mongodb-984845f96-czb6m           1/1     Running   0          14m
my-hyperdx-hdx-oss-v2-otel-collector-64cf698f5c-8s7qj   1/1     Running   0          14m
```

### HyperDX UI へのアクセス {#access-the-hyperdx-ui}

:::note
ClickHouse Cloud を使用している場合でも、Kubernetes クラスタにデプロイされたローカルの HyperDX インスタンスは必要です。これは、HyperDX にバンドルされた OpAMP サーバーによって管理されるインジェストキーを提供し、デプロイされた OTel collector を通じたインジェストを保護します。この機能は現在、ClickHouse Cloud ホスト版では利用できません。
:::

セキュリティのため、このサービスはクラスタIP を使用しており、デフォルトでは外部に公開されません。

HyperDX UI にアクセスするには、ポート 3000 からローカルのポート 8080 へポートフォワードを実行します。

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

[http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を開きます。

複雑性要件を満たすユーザー名とパスワードを指定してユーザーを作成します。

<Image img={hyperdx_login} alt='HyperDX UI' size='lg' />

### インジェスト API key の取得 {#retrieve-ingestion-api-key}

ClickStack によってデプロイされた OTel collector へのインジェストは、インジェストキーによって保護されています。

[`Team Settings`](http://localhost:8080/team) に移動し、`API Keys` セクションから `Ingestion API Key` をコピーします。この API key により、OpenTelemetry collector を通じたデータのインジェストが安全に行われます。

<Image img={copy_api_key} alt='Copy API key' size='lg' />

### API Key の Kubernetes Secret の作成 {#create-api-key-kubernetes-secret}

インジェスト API Key を含む新しい Kubernetes Secret と、ClickStack の helm チャートでデプロイされた OTel collector の場所を含む config map を作成します。後続のコンポーネントは、これを使用して ClickStack の Helm チャートでデプロイされた collector へのインジェストを可能にします:


```shell
# インジェスト API key でシークレットを作成
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
-n otel-demo
```


# 上でデプロイした ClickStack の OTel collector を参照する ConfigMap を作成する

kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR&#95;OTEL&#95;COLLECTOR&#95;ENDPOINT=[http://my-hyperdx-hdx-oss-v2-otel-collector:4318](http://my-hyperdx-hdx-oss-v2-otel-collector:4318)

````

インジェスト API key を反映させるために、OpenTelemetry Demo Application のポッドを再起動します。 

```shell
kubectl rollout restart deployment -n otel-demo -l app.kubernetes.io/part-of=opentelemetry-demo
````

デモサービスからのトレースおよびログデータが、HyperDX に流れ始めているはずです。

<Image img={hyperdx_kubernetes_data} alt="HyperDX Kubernetes Data" size="lg" />

### OpenTelemetry の Helm リポジトリを追加する

Kubernetes メトリクスを収集するために、標準的な OTel collector をデプロイし、上記のインジェスト API key を使用してデータを ClickStack collector に安全に送信するよう構成します。

そのために、OpenTelemetry の Helm リポジトリを追加する必要があります。


```shell
# OTel Helmリポジトリを追加
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts 
```

### Kubernetes コレクターコンポーネントのデプロイ

クラスター自体と各ノードの両方からログとメトリクスを収集するには、それぞれ専用のマニフェストを持つ 2 つの OpenTelemetry コレクターをデプロイする必要があります。ここで提供する 2 つのマニフェスト `k8s_deployment.yaml` と `k8s_daemonset.yaml` は連携して、Kubernetes クラスターから包括的なテレメトリデータを収集します。

* `k8s_deployment.yaml` は、**クラスター全体のイベントおよびメタデータの収集**を担当する **単一の OpenTelemetry Collector インスタンス** をデプロイします。Kubernetes イベントやクラスターメトリクスを収集し、ポッドのラベルやアノテーションでテレメトリデータを拡張します。このコレクターは、重複データを避けるためにレプリカ数 1 のスタンドアロンのデプロイメントとして実行されます。

* `k8s_daemonset.yaml` は、クラスター内のすべてのノード上で実行される **デーモンセットベースのコレクター** をデプロイします。`kubeletstats`、`hostmetrics`、`Kubernetes Attribute Processor` などのコンポーネントを使用して、**ノードレベルおよびポッドレベルのメトリクス** に加えてコンテナログを収集します。これらのコレクターはログをメタデータで拡張し、OTLP エクスポーターを使用して HyperDX に送信します。

これらのマニフェストを組み合わせることで、インフラストラクチャからアプリケーションレベルのテレメトリまで、クラスター全体のフルスタックな可観測性を実現し、拡張されたデータを ClickStack に送信して集約的な分析を行えます。

まず、デプロイメントとしてコレクターをインストールします:


```shell
# マニフェストファイルをダウンロード
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_deployment.yaml
# Helm チャートをインストール
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


# これらのコレクターは1つのみ必要です - 複数あるとデータが重複します

replicaCount: 1

presets:
kubernetesAttributes:
enabled: true # 有効にすると、プロセッサは関連するポッドのすべてのラベルを抽出し、リソース属性として追加します。ラベルの正確な名前がキーになります。
extractAllPodLabels: true # 有効にすると、プロセッサは関連するポッドのすべてのアノテーションを抽出し、リソース属性として追加します。アノテーションの正確な名前がキーになります。
extractAllPodAnnotations: true

# Kubernetesイベントを収集するようコレクターを設定します。

# k8sobject receiverをログパイプラインに追加し、デフォルトでKubernetesイベントを収集します。

# 詳細情報: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver

kubernetesEvents:
enabled: true

# クラスターレベルのメトリクスを収集するようKubernetes Cluster Receiverを設定します。

# k8s_cluster receiverをメトリクスパイプラインに追加し、必要なルールをClusterRoleに追加します。

# 詳細情報: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-cluster-receiver

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

次に、ノードおよびポッドレベルのメトリクスとログ用にコレクターをデーモンセットとしてデプロイします:

```


```shell
# マニフェストファイルをダウンロード
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_daemonset.yaml
# Helm チャートをインストール
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

# すべてのパイプラインに k8sattributes プロセッサを追加し、必要なルールをクラスター ロールに追加します。

# 詳細情報: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor

kubernetesAttributes:
enabled: true # 有効にすると、プロセッサは関連するポッドのすべてのラベルを抽出し、リソース属性として追加します。ラベルの正確な名前がキーになります。
extractAllPodLabels: true # 有効にすると、プロセッサは関連するポッドのすべてのアノテーションを抽出し、リソース属性として追加します。アノテーションの正確な名前がキーになります。
extractAllPodAnnotations: true

# キューブレット上の API サーバーからノード、ポッド、コンテナのメトリクスを収集するようにコレクターを設定します。

# kubeletstats レシーバーをメトリクスパイプラインに追加し、必要なルールをクラスター ロールに追加します。

# 詳細情報: https://opentelemetry.io/docs/kubernetes/collector/components/#kubeletstats-receiver

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
receivers: # 追加のキューブレットメトリクスを設定します
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

### HyperDX で Kubernetes データを探索する {#explore-kubernetes-data-hyperdx}

HyperDX UI に移動します。Kubernetes にデプロイされたインスタンスまたは ClickHouse Cloud 経由でアクセスしてください。

<p/>
<details>
<summary>ClickHouse Cloud を使用する場合</summary>

ClickHouse Cloud を使用する場合は、ClickHouse Cloud サービスにログインし、左側のメニューから「HyperDX」を選択してください。自動的に認証されるため、ユーザーを作成する必要はありません。

データソースの作成を求められたら、ソース作成モデル内のすべてのデフォルト値を保持し、Table フィールドに `otel_logs` を入力してログソースを作成します。その他の設定はすべて自動検出されるため、`新しいソースを保存` をクリックできます。

<Image force img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX データソース" size="lg"/>

トレースとメトリクス用のデータソースも作成する必要があります。

たとえば、トレースと OTel メトリクスのソースを作成するには、上部メニューから `新しいソースを作成` を選択します。

<Image force img={hyperdx_create_new_source} alt="HyperDX 新しいソースを作成" size="lg"/>

ここから、必要なソースタイプを選択し、続いて適切なテーブルを選択します。たとえば、トレースの場合は `otel_traces` テーブルを選択します。すべての設定は自動検出されます。

<Image force img={hyperdx_create_trace_datasource} alt="HyperDX トレースソースを作成" size="lg"/>

```


:::note ソースの相関付け
ClickStackでは、ログやトレースなどの異なるデータソースを相互に相関付けることができます。これを有効にするには、各ソースに追加の設定が必要です。例えば、ログソースでは対応するトレースソースを指定でき、トレースソースでも同様です。詳細については「相関ソース」を参照してください。
:::

</details>

<details>

<summary>セルフマネージドデプロイメントを使用する場合</summary>

ローカルにデプロイされたHyperDXにアクセスするには、以下のコマンドでポートフォワードを実行し、[http://localhost:8080](http://localhost:8080)でHyperDXにアクセスします。

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

:::note 本番環境でのClickStack
本番環境では、ClickHouse CloudでHyperDXを使用していない場合、TLSを使用したイングレスの使用を推奨します。例:

```shell
helm upgrade my-hyperdx hyperdx/hdx-oss-v2 \
--set hyperdx.ingress.enabled=true \
--set hyperdx.ingress.host=your-domain.com \
--set hyperdx.ingress.tls.enabled=true
```

:::

</details>

Kubernetesデータを探索するには、`/kubernetes`にある専用ダッシュボードに移動してください。例: [http://localhost:8080/kubernetes](http://localhost:8080/kubernetes)

各タブ(ポッド、ノード、ネームスペース)にデータが表示されます。

</VerticalStepper>

<Image img={dashboard_kubernetes} alt='ClickHouse kubernetes' size='lg' />
