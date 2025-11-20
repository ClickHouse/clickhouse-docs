---
slug: /use-cases/observability/clickstack/integrations/kubernetes
pagination_prev: null
pagination_next: null
description: 'ClickStack 的 Kubernetes 集成 - ClickHouse 可观测性技术栈'
title: 'Kubernetes'
doc_type: 'guide'
keywords: ['clickstack', 'kubernetes', 'logs', 'observability', 'container monitoring']
---

ClickStack 使用 OpenTelemetry (OTel) collector 从 Kubernetes 集群中收集日志、指标和 Kubernetes 事件，并将其转发到 ClickStack。我们支持原生 OTel 日志格式，无需任何额外的厂商特定配置。

本指南涵盖以下内容：

- **日志（Logs）**
- **基础设施指标（Infra Metrics）**

:::note
如需发送应用级别的指标或 APM/追踪（traces），你还需要在应用程序中添加相应语言的集成。
:::

本指南假定你已经部署了一个[作为网关的 ClickStack OTel collector](/use-cases/observability/clickstack/ingesting-data/otel-collector)，并通过接入 API 密钥进行了安全防护。



## 创建 OTel Helm Chart 配置文件 {#creating-the-otel-helm-chart-config-files}

为了从每个节点和集群本身收集日志和指标,我们需要部署两个独立的 OpenTelemetry 收集器。其中一个将以 DaemonSet 方式部署,用于从每个节点收集日志和指标;另一个将以 Deployment 方式部署,用于从集群本身收集日志和指标。

### 创建 API 密钥 Secret {#create-api-key-secret}

使用来自 HyperDX 的[数据摄取 API 密钥](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data)创建一个新的 Kubernetes Secret。下面安装的组件将使用该密钥安全地将数据摄取到您的 ClickStack OTel 收集器:

```shell
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
```

此外,还需创建一个 ConfigMap 来指定 ClickStack OTel 收集器的位置:


```shell
kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=<OTEL_COLLECTOR_ENDPOINT>
# e.g. kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318
```

### 创建 DaemonSet 配置 {#creating-the-daemonset-configuration}

DaemonSet 将从集群中的每个节点收集日志和指标,但不会收集 Kubernetes 事件或集群级指标。

下载 DaemonSet 清单文件:

```shell
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_daemonset.yaml
```

<details>

<summary>`k8s_daemonset.yaml`</summary>


```yaml
# daemonset.yaml
mode: daemonset
```


# 使用 kubeletstats CPU/内存利用率指标所需配置

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

# 配置 Kubernetes 处理器以添加 Kubernetes 元数据

# 将 k8sattributes 处理器添加到所有管道,并向 ClusterRole 添加必要的规则

# 更多信息:https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor

kubernetesAttributes:
enabled: true # 启用后,处理器将提取关联 Pod 的所有标签并将其作为资源属性添加。# 标签的确切名称将作为键。
extractAllPodLabels: true # 启用后,处理器将提取关联 Pod 的所有注解并将其作为资源属性添加。# 注解的确切名称将作为键。
extractAllPodAnnotations: true

# 配置收集器从 kubelet 上的 API 服务器收集节点、Pod 和容器指标

# 将 kubeletstats 接收器添加到指标管道,并向 ClusterRole 添加必要的规则

# 更多信息:https://opentelemetry.io/docs/kubernetes/collector/components/#kubeletstats-receiver

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
receivers: # 配置额外的 kubelet 指标
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

### 创建部署配置 {#creating-the-deployment-configuration}

要收集 Kubernetes 事件和集群范围的指标,我们需要将单独的 OpenTelemetry 收集器部署为 Deployment。

下载部署清单:

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


# 我们只需要一个收集器 - 多个收集器会产生重复数据

replicaCount: 1

presets:
kubernetesAttributes:
enabled: true # 启用后,处理器将提取关联 Pod 的所有标签并将其作为资源属性添加。# 标签的确切名称将作为键。
extractAllPodLabels: true # 启用后,处理器将提取关联 Pod 的所有注解并将其作为资源属性添加。# 注解的确切名称将作为键。
extractAllPodAnnotations: true

# 配置收集器以收集 Kubernetes 事件。

# 将 k8sobject 接收器添加到日志管道,默认收集 Kubernetes 事件。

# 更多信息:https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver

kubernetesEvents:
enabled: true

# 配置 Kubernetes 集群接收器以收集集群级指标。

# 将 k8s_cluster 接收器添加到指标管道,并将必要的规则添加到 ClusterRole。

# 更多信息:https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-cluster-receiver

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


## 部署 OpenTelemetry 收集器 {#deploying-the-otel-collector}

现在可以使用 [OpenTelemetry Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector) 在 Kubernetes 集群中部署 OpenTelemetry 收集器。

添加 OpenTelemetry Helm 仓库:

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts # 添加 OTel Helm 仓库
```

使用上述配置安装 chart:

```shell copy
helm install my-opentelemetry-collector-deployment open-telemetry/opentelemetry-collector -f k8s_deployment.yaml
helm install my-opentelemetry-collector-daemonset open-telemetry/opentelemetry-collector -f k8s_daemonset.yaml
```

现在,来自 Kubernetes 集群的指标、日志和 Kubernetes 事件应该会显示在 HyperDX 中。


## 将资源标签转发到 Pod(推荐) {#forwarding-resouce-tags-to-pods}

为了将应用程序级别的日志、指标和追踪与 Kubernetes 元数据(如 Pod 名称、命名空间等)关联起来,您需要使用 `OTEL_RESOURCE_ATTRIBUTES` 环境变量将 Kubernetes 元数据转发到应用程序。

以下是使用环境变量将 Kubernetes 元数据转发到应用程序的部署示例:


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
        # 与 Kubernetes 属性处理器配合使用，可确保
        # Pod 的日志和指标关联到服务名称。
        service.name: <MY_APP_NAME>
    spec:
      containers:
        - name: app-container
          image: my-image
          env:
            # ... 其他环境变量
            # 从 Downward API 收集 K8s 元数据转发至应用
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
            # 通过 OTEL_RESOURCE_ATTRIBUTES 将 K8s 元数据转发至应用
            - name: OTEL_RESOURCE_ATTRIBUTES
              value: k8s.pod.name=$(POD_NAME),k8s.pod.uid=$(POD_UID),k8s.namespace.name=$(POD_NAMESPACE),k8s.node.name=$(NODE_NAME),k8s.deployment.name=$(DEPLOYMENT_NAME)
```
