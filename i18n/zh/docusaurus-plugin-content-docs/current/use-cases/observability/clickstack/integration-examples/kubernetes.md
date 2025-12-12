---
slug: /use-cases/observability/clickstack/integrations/kubernetes
pagination_prev: null
pagination_next: null
description: 'ClickStack 的 Kubernetes 集成 - ClickHouse 可观测性栈'
title: 'Kubernetes'
doc_type: 'guide'
keywords: ['clickstack', 'kubernetes', '日志', '可观测性', '容器监控']
---

ClickStack 使用 OpenTelemetry (OTel) collector 从 Kubernetes 集群中收集日志、指标和 Kubernetes 事件，并将其转发到 ClickStack。我们支持原生 OTel 日志格式，无需任何额外的厂商特定配置。

本指南涵盖以下内容：

- **日志 (Logs)**
- **基础设施指标 (Infra Metrics)**

:::note
要发送应用级别的指标或 APM/trace，你还需要在应用中添加相应的语言集成。
:::

本指南假设你已经部署了一个作为网关的 [ClickStack OTel collector](/use-cases/observability/clickstack/ingesting-data/otel-collector)，并通过摄取 API key 实现了安全防护。

## 创建 OTel Helm 图表配置文件 {#creating-the-otel-helm-chart-config-files}

为了同时从每个节点以及整个集群层面收集日志和指标，我们需要部署两个独立的 OpenTelemetry collector。一个将以 DaemonSet 守护进程集的形式部署，用于从每个节点收集日志和指标，另一个将以 Deployment 部署的形式部署，用于从整个集群收集日志和指标。

### 创建 API key Secret {#create-api-key-secret}

使用来自 HyperDX 的[摄取 API key](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data)创建一个新的 Kubernetes Secret。下面将要安装的组件会使用这个 Secret，将数据安全地摄取到你的 ClickStack OTel collector 中：

```shell
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
```

此外，创建一个 ConfigMap，用于保存 ClickStack OTel collector 的地址：

```shell
kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=<OTEL_COLLECTOR_ENDPOINT>
# e.g. kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318
```

### 创建 DaemonSet 守护进程集配置 {#creating-the-daemonset-configuration}

DaemonSet 守护进程集会从集群中的每个节点收集日志和指标，但不会收集 Kubernetes 事件或集群范围的指标。

下载 DaemonSet 守护进程集清单：

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

### 创建部署配置 {#creating-the-deployment-configuration}

要收集 Kubernetes 事件和集群范围的指标，我们需要另外部署一个以 Deployment 方式运行的独立 OpenTelemetry collector。

下载该 Deployment 的清单文件：

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

## 部署 OpenTelemetry 收集器 {#deploying-the-otel-collector}

现在可以使用
[OpenTelemetry Helm 图表](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector)
在 Kubernetes 集群中部署 OpenTelemetry 收集器。

添加 OpenTelemetry Helm 仓库：

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts # Add OTel Helm repo
```

使用上述配置安装该 chart：

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
        # 结合 Kubernetes Attribute Processor 使用，可确保
        # pod（容器组）的日志和指标与服务名称相关联。
        service.name: <MY_APP_NAME>
    spec:
      containers:
        - name: app-container
          image: my-image
          env:
            # ... 其他环境变量
            # 通过 downward API 收集 K8s 元数据并转发至应用程序
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
            # 通过 OTEL_RESOURCE_ATTRIBUTES 将 K8s 元数据转发至应用程序
            - name: OTEL_RESOURCE_ATTRIBUTES
              value: k8s.pod.name=$(POD_NAME),k8s.pod.uid=$(POD_UID),k8s.namespace.name=$(POD_NAMESPACE),k8s.node.name=$(NODE_NAME),k8s.deployment.name=$(DEPLOYMENT_NAME)
```
