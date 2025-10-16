---
'slug': '/use-cases/observability/clickstack/ingesting-data/kubernetes'
'pagination_prev': null
'pagination_next': null
'description': 'Kubernetes と ClickStack の統合 - ClickHouse の可観測性スタック'
'title': 'Kubernetes'
'doc_type': 'guide'
---

ClickStackは、Kubernetesクラスターからログ、メトリクス、およびKubernetesイベントを収集し、それをClickStackに転送するためにOpenTelemetry (OTel) コレクタを使用します。私たちはネイティブOTelログ形式をサポートしており、追加のベンダー固有の設定は必要ありません。

このガイドでは以下を統合します：

- **ログ**
- **インフラメトリクス**

:::note
アプリケーションレベルのメトリクスやAPM/トレースを送信するには、対応する言語統合をアプリケーションに追加する必要があります。
:::

以下のガイドでは、[ClickStack OTelコレクタをゲートウェイとしてデプロイした]( /use-cases/observability/clickstack/ingesting-data/otel-collector)と仮定しています。これは、データ取り込みAPIキーで保護されています。

## OTel Helmチャート構成ファイルの作成 {#creating-the-otel-helm-chart-config-files}

各ノードおよびクラスター自体からログとメトリクスを収集するために、2つの別々のOpenTelemetryコレクタをデプロイする必要があります。1つは各ノードからログとメトリクスを収集するためにDaemonSetとしてデプロイされ、もう1つはクラスター自体からログとメトリクスを収集するためにデプロイとしてデプロイされます。

### APIキーシークレットの作成 {#create-api-key-secret}

HyperDXの[取り込みAPIキー]( /use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data)を使用して新しいKubernetesシークレットを作成します。これは、以下にインストールするコンポーネントがClickStack OTelコレクタに安全にデータを取り込むために使用されます：

```shell
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
```

さらに、ClickStack OTelコレクタの場所に関する設定マップを作成します：

```shell
kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=<OTEL_COLLECTOR_ENDPOINT>

# e.g. kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318
```

### DaemonSet構成の作成 {#creating-the-daemonset-configuration}

DaemonSetはクラスター内の各ノードからログとメトリクスを収集しますが、Kubernetesイベントやクラスター全体のメトリクスは収集しません。

DaemonSetマニフェストをダウンロードします：

```shell
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_daemonset.yaml
```
<details>

<summary>`k8s_daemonset.yaml`</summary>

```yaml

# daemonset.yaml
mode: daemonset


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
  # More info: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor
  kubernetesAttributes:
    enabled: true
    # When enabled the processor will extra all labels for an associated pod and add them as resource attributes.
    # The label's exact name will be the key.
    extractAllPodLabels: true
    # When enabled the processor will extra all annotations for an associated pod and add them as resource attributes.
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
      headers:
        authorization: "${env:HYPERDX_API_KEY}"
      compression: gzip

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

### デプロイ構成の作成 {#creating-the-deployment-configuration}

Kubernetesイベントやクラスター全体のメトリクスを収集するために、別のOpenTelemetryコレクタをデプロイとして展開する必要があります。

デプロイマニフェストをダウンロードします：

```shell
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_deployment.yaml
```

<details>
<summary>k8s_deployment.yaml</summary>

```yaml

# deployment.yaml
mode: deployment

image:
  repository: otel/opentelemetry-collector-contrib
  tag: 0.123.0


# We only want one of these collectors - any more and we'd produce duplicate data
replicaCount: 1

presets:
  kubernetesAttributes:
    enabled: true
    # When enabled the processor will extra all labels for an associated pod and add them as resource attributes.
    # The label's exact name will be the key.
    extractAllPodLabels: true
    # When enabled the processor will extra all annotations for an associated pod and add them as resource attributes.
    # The annotation's exact name will be the key.
    extractAllPodAnnotations: true
  # Configures the collector to collect kubernetes events.
  # Adds the k8sobject receiver to the logs pipeline and collects kubernetes events by default.
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

## OpenTelemetryコレクタのデプロイ {#deploying-the-otel-collector}

OpenTelemetryコレクタは、[OpenTelemetry Helmチャート](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector)を使用してKubernetesクラスターにデプロイできます。

OpenTelemetry Helmリポジトリを追加します：

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts # Add OTel Helm repo
```

上記の設定でチャートをインストールします：

```shell copy
helm install my-opentelemetry-collector-deployment open-telemetry/opentelemetry-collector -f k8s_deployment.yaml
helm install my-opentelemetry-collector-daemonset open-telemetry/opentelemetry-collector -f k8s_daemonset.yaml
```

これで、Kubernetesクラスターからのメトリクス、ログ、KubernetesイベントがHyperDX内に表示されるはずです。

## リソースタグをポッドに転送する（推奨） {#forwarding-resouce-tags-to-pods}

アプリケーションレベルのログ、メトリクス、およびトレースをKubernetesメタデータ（例：ポッド名、ネームスペースなど）と相関させるには、Kubernetesメタデータを`OTEL_RESOURCE_ATTRIBUTES`環境変数を使用してアプリケーションに転送する必要があります。

以下は、Kubernetesメタデータを環境変数を使用してアプリケーションに転送する例のデプロイメントです：

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
        # Combined with the Kubernetes Attribute Processor, this will ensure
        # the pod's logs and metrics will be associated with a service name.
        service.name: <MY_APP_NAME>
    spec:
      containers:
        - name: app-container
          image: my-image
          env:
            # ... other environment variables
            # Collect K8s metadata from the downward API to forward to the app
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
            # Forward the K8s metadata to the app via OTEL_RESOURCE_ATTRIBUTES
            - name: OTEL_RESOURCE_ATTRIBUTES
              value: k8s.pod.name=$(POD_NAME),k8s.pod.uid=$(POD_UID),k8s.namespace.name=$(POD_NAMESPACE),k8s.node.name=$(NODE_NAME),k8s.deployment.name=$(DEPLOYMENT_NAME)
```
