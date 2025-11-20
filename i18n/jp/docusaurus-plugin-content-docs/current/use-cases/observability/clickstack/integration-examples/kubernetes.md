---
slug: /use-cases/observability/clickstack/integrations/kubernetes
pagination_prev: null
pagination_next: null
description: 'ClickStack 向け Kubernetes 連携 - ClickHouse Observability スタック'
title: 'Kubernetes'
doc_type: 'guide'
keywords: ['clickstack', 'kubernetes', 'logs', 'observability', 'container monitoring']
---

ClickStack は OpenTelemetry (OTel) コレクターを使用して、Kubernetes クラスターからログ、メトリクス、および Kubernetes イベントを収集し、それらを ClickStack に転送します。OTel のネイティブなログ形式をサポートしており、ベンダー固有の追加設定は不要です。

このガイドでは、次のデータを取り込みます:

- **ログ**
- **インフラメトリクス**

:::note
アプリケーションレベルのメトリクスや APM/トレースを送信するには、対応する言語向けインテグレーションをアプリケーションに追加する必要があります。
:::

このガイドでは、インジェスト用 API キーで保護された [ClickStack OTel コレクターをゲートウェイとしてデプロイしている](/use-cases/observability/clickstack/ingesting-data/otel-collector)ことを前提とします。



## OTel Helm チャート設定ファイルの作成 {#creating-the-otel-helm-chart-config-files}

各ノードとクラスタ自体の両方からログとメトリクスを収集するには、2つの独立した OpenTelemetry コレクターをデプロイする必要があります。1つは DaemonSet としてデプロイされ、各ノードからログとメトリクスを収集します。もう1つはデプロイメントとしてデプロイされ、クラスタ自体からログとメトリクスを収集します。

### API キーシークレットの作成 {#create-api-key-secret}

HyperDX の [ingestion API Key](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data) を使用して新しい Kubernetes シークレットを作成します。これは、以下でインストールされるコンポーネントが ClickStack OTel コレクターに安全にデータを取り込むために使用されます:

```shell
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
```

さらに、ClickStack OTel コレクターの場所を指定する ConfigMap を作成します:


```shell
kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=<OTEL_COLLECTOR_ENDPOINT>
# 例: kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318
```

### DaemonSet設定の作成 {#creating-the-daemonset-configuration}

DaemonSetはクラスタ内の各ノードからログとメトリクスを収集しますが、Kubernetesイベントやクラスタ全体のメトリクスは収集しません。

DaemonSetマニフェストをダウンロードします:

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

# Kubernetes メタデータを追加するための Kubernetes Processor を設定します。

# すべてのパイプラインに k8sattributes プロセッサを追加し、ClusterRole に必要なルールを追加します。

# 詳細: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor

kubernetesAttributes:
enabled: true # 有効にすると、プロセッサは関連するポッドのすべてのラベルを抽出し、リソース属性として追加します。ラベルの正確な名前がキーになります。
extractAllPodLabels: true # 有効にすると、プロセッサは関連するポッドのすべてのアノテーションを抽出し、リソース属性として追加します。アノテーションの正確な名前がキーになります。
extractAllPodAnnotations: true

# kubelet 上の API サーバーからノード、ポッド、コンテナのメトリクスを収集するようにコレクターを設定します。

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

Kubernetes イベントとクラスタ全体のメトリクスを収集するには、デプロイメントとして別の OpenTelemetry コレクターをデプロイする必要があります。

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
enabled: true # 有効にすると、プロセッサは関連するポッドのすべてのラベルを抽出し、リソース属性として追加します。ラベルの正確な名前がキーになります。
extractAllPodLabels: true # 有効にすると、プロセッサは関連するポッドのすべてのアノテーションを抽出し、リソース属性として追加します。アノテーションの正確な名前がキーになります。
extractAllPodAnnotations: true

# Kubernetesイベントを収集するようにコレクターを設定します。

# k8sobject receiverをログパイプラインに追加し、デフォルトでKubernetesイベントを収集します。

# 詳細情報: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver

kubernetesEvents:
enabled: true

# クラスターレベルのメトリクスを収集するようにKubernetes Cluster Receiverを設定します。

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

```


## OpenTelemetryコレクターのデプロイ {#deploying-the-otel-collector}

OpenTelemetryコレクターは、[OpenTelemetry Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector)を使用してKubernetesクラスターにデプロイできるようになりました。

OpenTelemetry Helmリポジトリを追加します:

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts # OTel Helmリポジトリを追加
```

上記の設定でチャートをインストールします:

```shell copy
helm install my-opentelemetry-collector-deployment open-telemetry/opentelemetry-collector -f k8s_deployment.yaml
helm install my-opentelemetry-collector-daemonset open-telemetry/opentelemetry-collector -f k8s_daemonset.yaml
```

これで、Kubernetesクラスターからのメトリクス、ログ、Kubernetesイベントが
HyperDX内に表示されるようになります。


## リソースタグのPodへの転送（推奨） {#forwarding-resouce-tags-to-pods}

アプリケーションレベルのログ、メトリクス、トレースをKubernetesメタデータ（例：Pod名、Namespaceなど）と関連付けるには、`OTEL_RESOURCE_ATTRIBUTES`環境変数を使用してKubernetesメタデータをアプリケーションに転送します。

以下は、環境変数を使用してKubernetesメタデータをアプリケーションに転送するデプロイメントの例です：


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
        # Podのログとメトリクスがサービス名に関連付けられることを保証します。
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
