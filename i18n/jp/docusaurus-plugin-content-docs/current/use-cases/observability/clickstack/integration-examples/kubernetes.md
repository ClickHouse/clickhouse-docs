---
slug: /use-cases/observability/clickstack/integrations/kubernetes
pagination_prev: null
pagination_next: null
description: 'ClickStack 向けの Kubernetes 連携 - ClickHouse Observability Stack'
title: 'Kubernetes'
doc_type: 'guide'
keywords: ['clickstack', 'kubernetes', 'logs', 'observability', 'container monitoring']
---

ClickStack は OpenTelemetry (OTel) collector を使用して、Kubernetes クラスタからログ、メトリクス、および Kubernetes イベントを収集し、それらを ClickStack に転送します。ネイティブな OTel ログ形式に対応しており、ベンダー固有の追加設定は不要です。

このガイドでは、次の内容を扱います:

- **Logs**
- **Infra Metrics**

:::note
アプリケーションレベルのメトリクスや APM/トレースを送信するには、対応する言語向けのインテグレーションをアプリケーション側にも追加する必要があります。
:::

このガイドでは、インジェスト API key で保護された [ClickStack OTel collector をゲートウェイとして](/use-cases/observability/clickstack/ingesting-data/otel-collector) デプロイ済みであることを前提としています。



## OTel の Helm チャート設定ファイルを作成する

各ノードおよびクラスター自体の両方からログとメトリクスを収集するために、2 つの OpenTelemetry collector を別々にデプロイする必要があります。1 つは各ノードからログとメトリクスを収集するためのデーモンセットとしてデプロイし、もう 1 つはクラスター自体からログとメトリクスを収集するためのデプロイメントとしてデプロイします。

### API key シークレットを作成する

HyperDX の [インジェスト API key](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data) を使用して、新しい Kubernetes Secret を作成します。これは、以下でインストールするコンポーネントが、ClickStack の OTel collector に安全にデータをインジェストするために使用します。

```shell
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
```

さらに、ClickStack の OTel collector の接続先を指定する ConfigMap を作成します：


```shell
kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=<OTEL_COLLECTOR_ENDPOINT>
# e.g. kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318
```

### デーモンセット設定の作成 {#creating-the-daemonset-configuration}

デーモンセットはクラスタ内の各ノードからログとメトリクスを収集しますが、Kubernetesイベントやクラスタ全体のメトリクスは収集しません。

デーモンセットマニフェストをダウンロードします:

```shell
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_daemonset.yaml
```

<details>

<summary>`k8s_daemonset.yaml`</summary>


```yaml
# daemonset.yaml
mode: daemonset
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

# すべてのパイプラインに k8sattributes プロセッサを追加し、クラスター ロールに必要なルールを追加します。

# 詳細: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor

kubernetesAttributes:
enabled: true # 有効にすると、プロセッサは関連するポッドのすべてのラベルを抽出し、リソース属性として追加します。# ラベルの正確な名前がキーになります。
extractAllPodLabels: true # 有効にすると、プロセッサは関連するポッドのすべてのアノテーションを抽出し、リソース属性として追加します。# アノテーションの正確な名前がキーになります。
extractAllPodAnnotations: true

# キューブレット上の API サーバーからノード、ポッド、コンテナのメトリクスを収集するようにコレクタを設定します。

# メトリクスパイプラインに kubeletstats レシーバーを追加し、クラスター ロールに必要なルールを追加します。

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
receivers: # 追加のキューブレットメトリクスを設定
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
      headers:
        authorization: "${env:HYPERDX_API_KEY}"
compression: gzip

service:
pipelines:
logs:
exporters: - otlphttp
metrics:
exporters: - otlphttp

````

</details>

### デプロイメント設定の作成 {#creating-the-deployment-configuration}

Kubernetes イベントとクラスター全体のメトリクスを収集するには、デプロイメントとして別個の OpenTelemetry コレクタをデプロイする必要があります。

デプロイメントマニフェストをダウンロードします:

```shell
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_deployment.yaml
````

<details>
<summary>k8s_deployment.yaml</summary>


```yaml
# deployment.yaml
mode: deployment

image:
  repository: otel/opentelemetry-collector-contrib
  tag: 0.123.0
```


# これらのコレクターは1つのみ必要です - 複数存在すると重複データが生成されます

replicaCount: 1

presets:
kubernetesAttributes:
enabled: true # 有効にすると、プロセッサは関連するポッドのすべてのラベルを抽出し、リソース属性として追加します。# ラベルの正確な名前がキーになります。
extractAllPodLabels: true # 有効にすると、プロセッサは関連するポッドのすべてのアノテーションを抽出し、リソース属性として追加します。# アノテーションの正確な名前がキーになります。
extractAllPodAnnotations: true

# Kubernetesイベントを収集するようコレクターを設定します。

# k8sobject receiverをログパイプラインに追加し、デフォルトでKubernetesイベントを収集します。

# 詳細: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver

kubernetesEvents:
enabled: true

# クラスターレベルのメトリクスを収集するようKubernetes Cluster Receiverを設定します。

# k8s_cluster receiverをメトリクスパイプラインに追加し、必要なルールをClusterRoleに追加します。

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

```


## OpenTelemetry collector のデプロイ

OpenTelemetry collector は、[OpenTelemetry Helm チャート](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector) を使って Kubernetes クラスターにデプロイできます。

OpenTelemetry の Helm リポジトリを追加します。

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts # OTel Helmリポジトリを追加
```

上記の設定でチャートをインストールします。

```shell copy
helm install my-opentelemetry-collector-deployment open-telemetry/opentelemetry-collector -f k8s_deployment.yaml
helm install my-opentelemetry-collector-daemonset open-telemetry/opentelemetry-collector -f k8s_daemonset.yaml
```

これで、Kubernetes クラスターのメトリクス、ログ、および Kubernetes イベントが HyperDX に表示されるようになります。


## リソースタグをポッドへ転送する（推奨） {#forwarding-resouce-tags-to-pods}

アプリケーションレベルのログ、メトリクス、トレースを Kubernetes メタデータ
（例: ポッド名、ネームスペースなど）と相関付けるには、`OTEL_RESOURCE_ATTRIBUTES` 環境変数を使用して
Kubernetes メタデータをアプリケーションへ転送することを推奨します。

以下は、環境変数を使用して Kubernetes メタデータをアプリケーションへ
転送するデプロイメントの例です。



```yaml
# my_app_deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: app
  template:
    metadata:
      labels:
        app: app
        # Kubernetes Attribute Processorと組み合わせることで、
        # ポッドのログとメトリクスがサービス名に関連付けられます。
        service.name: <MY_APP_NAME>
    spec:
      containers:
        - name: app-container
          image: my-image
          env:
            # ... その他の環境変数
            # Downward APIからK8sメタデータを収集してアプリに転送
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: POD_UID
              valueFrom:
                fieldRef:
                  fieldPath: metadata.uid
            - name: POD_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
            - name: NODE_NAME
              valueFrom:
                fieldRef:
                  fieldPath: spec.nodeName
            - name: DEPLOYMENT_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.labels['deployment']
            # OTEL_RESOURCE_ATTRIBUTES経由でK8sメタデータをアプリに転送
            - name: OTEL_RESOURCE_ATTRIBUTES
              value: k8s.pod.name=$(POD_NAME),k8s.pod.uid=$(POD_UID),k8s.namespace.name=$(POD_NAMESPACE),k8s.node.name=$(NODE_NAME),k8s.deployment.name=$(DEPLOYMENT_NAME)
```
