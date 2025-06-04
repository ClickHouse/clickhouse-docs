---
'slug': '/use-cases/observability/clickstack/ingesting-data/kubernetes'
'pagination_prev': null
'pagination_next': null
'description': 'Kubernetes 集成用于 ClickStack - ClickHouse 观察性栈'
'title': 'Kubernetes'
---

ClickStack 使用 OpenTelemetry (OTel) 收集器从 Kubernetes 集群中收集日志、指标和 Kubernetes 事件，并将它们转发到 ClickStack。我们支持原生的 OTel 日志格式，并且不需要额外的供应商特定配置。

本指南集成了以下内容：

- **日志**
- **基础设施指标**

:::note
要发送应用级别的指标或 APM/追踪，您还需要将相应的语言集成添加到您的应用程序中。
:::

## 创建 OTel Helm Chart 配置文件 {#creating-the-otel-helm-chart-config-files}

为了从每个节点和集群本身收集日志和指标，我们需要部署两个单独的 OpenTelemetry 收集器。一个将作为 DaemonSet 部署，以从每个节点收集日志和指标，另一个将作为部署部署，以收集集群本身的日志和指标。

### 创建 DaemonSet 配置 {#creating-the-daemonset-configuration}

DaemonSet 将从集群中的每个节点收集日志和指标，但不会收集 Kubernetes 事件或集群范围的指标。

创建一个名为 `daemonset.yaml` 的文件，内容如下：

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
      endpoint: 'https://in-otel.hyperdx.io'
      headers:
        authorization: '<YOUR_INGESTION_API_KEY>'
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

### 创建部署配置 {#creating-the-deployment-configuration}

为了收集 Kubernetes 事件和集群范围的指标，我们需要将一个单独的 OpenTelemetry 收集器作为部署进行部署。

创建一个名为 `deployment.yaml` 的文件，内容如下：

```yaml copy

# deployment.yaml
mode: deployment


# We only want one of these collectors - any more, and we'd produce duplicate data
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
  # Configures the collector to collect Kubernetes events.
  # Adds the k8sobject receiver to the logs pipeline and collects Kubernetes events by default.
  # More info: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver
  kubernetesEvents:
    enabled: true
  # Configures the Kubernetes Cluster Receiver to collect cluster-level metrics.
  # Adds the k8s_cluster receiver to the metrics pipeline and adds the necessary rules to ClusteRole.
  # More Info: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-cluster-receiver
  clusterMetrics:
    enabled: true

config:
  exporters:
    otlphttp:
      endpoint: 'https://in-otel.hyperdx.io'
      headers:
        authorization: '<YOUR_INGESTION_API_KEY>'
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

## 部署 OpenTelemetry 收集器 {#deploying-the-otel-collector}

现在可以使用 [OpenTelemetry Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector) 在您的 Kubernetes 集群中部署 OpenTelemetry 收集器。

添加 OpenTelemetry Helm 仓库：

```bash copy
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts # Add OTel Helm repo
```

使用上述配置安装图表：

```bash copy
helm install my-opentelemetry-collector-deployment open-telemetry/opentelemetry-collector -f deployment.yaml
helm install my-opentelemetry-collector-daemonset open-telemetry/opentelemetry-collector -f daemonset.yaml
```

现在，您的 Kubernetes 集群中的指标、日志和 Kubernetes 事件应该出现在 HyperDX 中。

## 转发资源标签到 Pods（推荐） {#forwarding-resouce-tags-to-pods}

为了将应用级别的日志、指标和追踪与 Kubernetes 元数据（例如 pod 名称、命名空间等）关联起来，您需要使用 `OTEL_RESOURCE_ATTRIBUTES` 环境变量将 Kubernetes 元数据转发到您的应用程序。

以下是一个示例部署，通过环境变量将 Kubernetes 元数据转发到应用程序：

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
