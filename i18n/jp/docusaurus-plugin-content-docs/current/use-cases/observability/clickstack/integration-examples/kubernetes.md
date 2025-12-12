---
slug: /use-cases/observability/clickstack/integrations/kubernetes
pagination_prev: null
pagination_next: null
description: 'ClickStack 向け Kubernetes 連携 - ClickHouse Observability Stack'
title: 'Kubernetes'
doc_type: 'guide'
keywords: ['clickstack', 'kubernetes', 'ログ', 'オブザーバビリティ', 'コンテナー監視']
---

ClickStack は OpenTelemetry (OTel) collector を使用して、Kubernetes クラスターからログ、メトリクス、Kubernetes イベントを収集し、ClickStack に転送します。ネイティブな OTel ログ形式をサポートしており、ベンダー固有の追加設定は不要です。

このガイドでは、次の内容を扱います:

- **ログ**
- **インフラメトリクス**

:::note
アプリケーションレベルのメトリクスや APM/トレースを送信するには、対応する言語向けのインテグレーションをアプリケーションにも追加する必要があります。
:::

本ガイドは、[ClickStack OTel collector をゲートウェイとしてデプロイ](/use-cases/observability/clickstack/ingesting-data/otel-collector)済みであり、インジェスト API key によって保護されていることを前提としています。

## OTel Helm チャートの設定ファイルを作成する {#creating-the-otel-helm-chart-config-files}

各ノードおよびクラスター全体の両方からログとメトリクスを収集するには、OpenTelemetry コレクターを 2 つデプロイする必要があります。1 つは各ノードからログとメトリクスを収集するデーモンセットとして、もう 1 つはクラスター全体からログとメトリクスを収集するデプロイメントとしてデプロイします。

### API キー用 Secret の作成 {#create-api-key-secret}

HyperDX で作成した [インジェスト API key](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data) を使用して、新しい Kubernetes Secret を作成します。これは、この後インストールするコンポーネントが ClickStack の OTel collector に対して安全にデータをインジェストするために使用されます。

```shell
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
```

さらに、ClickStack の OTel collector の場所を指定する ConfigMap を作成します:

```shell
kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=<OTEL_COLLECTOR_ENDPOINT>
# e.g. kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318
```

### デーモンセット構成の作成 {#creating-the-daemonset-configuration}

デーモンセットは、クラスター内の各ノードからログとメトリクスを収集しますが、Kubernetes のイベントやクラスター全体のメトリクスは収集しません。

デーモンセットのマニフェストをダウンロードします:

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

### デプロイメント構成の作成 {#creating-the-deployment-configuration}

Kubernetes のイベントとクラスター全体のメトリクスを収集するために、別の OpenTelemetry コレクターをデプロイメントとしてデプロイする必要があります。

デプロイメント用マニフェストをダウンロードします:

```shell
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_deployment.yaml
```

<details>
  <summary>k8s&#95;deployment.yaml</summary>

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

## OpenTelemetry collector のデプロイ {#deploying-the-otel-collector}

OpenTelemetry collector は、Kubernetes クラスターに\
[OpenTelemetry Helm チャート](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector) を使用してデプロイできます。

OpenTelemetry の Helm リポジトリを追加します:

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts # Add OTel Helm repo
```

上記の設定でチャートをインストールします:

```shell copy
helm install my-opentelemetry-collector-deployment open-telemetry/opentelemetry-collector -f k8s_deployment.yaml
helm install my-opentelemetry-collector-daemonset open-telemetry/opentelemetry-collector -f k8s_daemonset.yaml
```

Now the metrics, logs and Kubernetes events from your Kubernetes cluster should
now appear inside HyperDX.

## Forwarding resource tags to pods (Recommended) {#forwarding-resouce-tags-to-pods}

To correlate application-level logs, metrics, and traces with Kubernetes metadata
(ex. pod name, namespace, etc.), you'll want to forward the Kubernetes metadata
to your application using the `OTEL_RESOURCE_ATTRIBUTES` environment variable.

Here's an example deployment that forwards the Kubernetes metadata to the
application using environment variables:

```yaml
# my_app_deployment.yaml {#deploymentyaml}

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
        # ポッドのログとメトリクスがサービス名に関連付けられることを保証します。
        service.name: <MY_APP_NAME>
    spec:
      containers:
        - name: app-container
          image: my-image
          env:
            # ... その他の環境変数
            # downward APIからK8sメタデータを収集してアプリに転送
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
