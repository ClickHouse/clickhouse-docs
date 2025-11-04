---
'slug': '/use-cases/observability/clickstack/getting-started/kubernetes'
'title': '监视 Kubernetes'
'sidebar_position': 1
'pagination_prev': null
'pagination_next': null
'description': '开始使用 ClickStack 和监视 Kubernetes'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import DemoArchitecture from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/example-datasets/_snippets/_demo.md';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_kubernetes_data from '@site/static/images/use-cases/observability/hyperdx-kubernetes-data.png';
import copy_api_key from '@site/static/images/use-cases/observability/copy_api_key.png';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';
import dashboard_kubernetes from '@site/static/images/use-cases/observability/hyperdx-dashboard-kubernetes.png';

本指南允许您从 Kubernetes 系统收集日志和指标，并将其发送到 **ClickStack** 进行可视化和分析。对于演示数据，我们可选地使用 ClickStack 的官方 Open Telemetry 演示的分叉。

<iframe width="768" height="432" src="https://www.youtube.com/embed/winI7256Ejk?si=TRThhzCJdq87xg_x" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 前提条件 {#prerequisites}

本指南要求您具备：

- 一个 **Kubernetes 集群**（推荐使用 v1.20+），至少在一个节点上具备 32 GiB 的内存和 100GB 的磁盘空间用于 ClickHouse。
- **[Helm](https://helm.sh/)** v3+
- 配置好的 **`kubectl`**，以与您的集群进行交互

## 部署选项 {#deployment-options}

您可以使用以下任一部署选项遵循本指南：

- **自托管**：完全在您的 Kubernetes 集群中部署 ClickStack，包括：
  - ClickHouse
  - HyperDX
  - MongoDB（用于仪表板状态和配置）

- **云托管**：使用 **ClickHouse Cloud**，而 HyperDX 在外部管理。这消除了必须在您的集群内部运行 ClickHouse 或 HyperDX 的需要。

为了模拟应用流量，您可以选择性地部署 ClickStack 的 [**OpenTelemetry 演示应用**](https://github.com/ClickHouse/opentelemetry-demo) 的分叉。这会生成包括日志、指标和跟踪的遥测数据。如果您已经在集群中运行工作负载，可以跳过此步骤，监控现有的 pods、节点和容器。

<VerticalStepper headerLevel="h3">

### 安装 cert-manager（可选） {#install-cert-manager}

如果您的设置需要 TLS 证书，请使用 Helm 安装 [cert-manager](https://cert-manager.io/)：

```shell

# Add Cert manager repo 

helm repo add jetstack https://charts.jetstack.io 

helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set startupapicheck.timeout=5m --set installCRDs=true --set global.leaderElection.namespace=cert-manager
```

### 部署 OpenTelemetry 演示（可选） {#deploy-otel-demo}

此 **步骤是可选的，旨在针对没有现有 pods 进行监控的用户**。虽然在 Kubernetes 环境中已经部署现有服务的用户可以跳过此步骤，但该演示确实包括生成跟踪和会话重放数据的仪器化微服务 - 允许用户探索 ClickStack 的所有功能。

以下在 Kubernetes 集群内部署 ClickStack 的 OpenTelemetry 演示应用程序堆栈，旨在进行可观察性测试和展示仪器化。它包括后端微服务、负载生成器、遥测管道、支持基础设施（例如 Kafka、Redis）以及与 ClickStack 的 SDK 集成。

所有服务都部署在 `otel-demo` 命名空间中。每个部署包括：

- 使用 OTel 和 ClickStack SDK 进行自动仪器化，用于跟踪、指标和日志。
- 所有服务将其仪器化发送到 `my-hyperdx-hdx-oss-v2-otel-collector` OpenTelemetry 收集器（尚未部署）
- [将资源标签转发](/use-cases/observability/clickstack/ingesting-data/kubernetes#forwarding-resouce-tags-to-pods) 通过环境变量 `OTEL_RESOURCE_ATTRIBUTES` 来关联日志、指标和跟踪。

```shell
## download demo Kubernetes manifest file
curl -O https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml

# wget alternative

# wget https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
kubectl apply --namespace otel-demo -f opentelemetry-demo.yaml
```

在演示部署时，请确认所有 pods 已成功创建并处于 `Running` 状态：

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

### 添加 ClickStack Helm 图表仓库 {#add-helm-clickstack}

要部署 ClickStack，我们使用 [官方 Helm 图表](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm)。

这要求我们添加 HyperDX Helm 仓库：

```shell
helm repo add hyperdx https://hyperdxio.github.io/helm-charts
helm repo update
```

### 部署 ClickStack {#deploy-clickstack}

安装 Helm 图表后，您可以将 ClickStack 部署到您的集群。您可以运行所有组件，包括 ClickHouse 和 HyperDX，或者使用 ClickHouse Cloud，在该环境下 HyperDX 也作为托管服务提供。
<br/>

<details>
<summary>自管理部署</summary>

以下命令将 ClickStack 安装到 `otel-demo` 命名空间中。该 helm 图表部署：

- 一个 ClickHouse 实例
- HyperDX
- ClickStack 版本的 OTel 收集器
- 用于存储 HyperDX 应用状态的 MongoDB

:::note
您可能需要根据您的 Kubernetes 集群配置调整 `storageClassName`。
:::

未部署 OTel 演示的用户可以对此进行修改，选择适当的命名空间。

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2   --set clickhouse.persistence.dataSize=100Gi --set global.storageClassName="standard-rwo" -n otel-demo
```

:::warning ClickStack 生产环境

此图表还安装 ClickHouse 和 OTel 收集器。在生产环境中，建议您使用 clickhouse 和 OTel 收集器操作器和/或使用 ClickHouse Cloud。

要禁用 clickhouse 和 OTel 收集器，请设置以下值：

```shell
helm install myrelease <chart-name-or-path> --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
```

:::

</details>

<details>
<summary>使用 ClickHouse Cloud</summary>

如果您更愿意使用 ClickHouse Cloud，您可以部署 ClickStack 并 [禁用包含的 ClickHouse](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud)。

:::note
该图表当前始终部署 HyperDX 和 MongoDB。虽然这些组件提供了替代访问路径，但它们与 ClickHouse Cloud 身份验证未集成。这些组件旨在为此部署模型中的管理员提供 [访问安全的摄取密钥](#retrieve-ingestion-api-key)，以便通过部署的 OTel 收集器进行摄取，但不应对最终用户开放。
:::

```shell

# specify ClickHouse Cloud credentials
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # full https url
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

helm install my-hyperdx hyperdx/hdx-oss-v2  --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} --set clickhouse.config.users.otelUser=${CLICKHOUSE_USER} --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD} --set global.storageClassName="standard-rwo" -n otel-demo
```

</details>

要验证部署状态，请运行以下命令并确认所有组件处于 `Running` 状态。请注意，对于使用 ClickHouse Cloud 的用户，ClickHouse 将不在其中：

```shell
kubectl get pods -l "app.kubernetes.io/name=hdx-oss-v2" -n otel-demo

NAME                                                    READY   STATUS    RESTARTS   AGE
my-hyperdx-hdx-oss-v2-app-78876d79bb-565tb              1/1     Running   0          14m
my-hyperdx-hdx-oss-v2-clickhouse-57975fcd6-ggnz2        1/1     Running   0          14m
my-hyperdx-hdx-oss-v2-mongodb-984845f96-czb6m           1/1     Running   0          14m
my-hyperdx-hdx-oss-v2-otel-collector-64cf698f5c-8s7qj   1/1     Running   0          14m
```

### 访问 HyperDX UI {#access-the-hyperdx-ui}

:::note
即使使用 ClickHouse Cloud，在 Kubernetes 集群中部署的本地 HyperDX 实例仍然是必要的。它提供了一个由与 HyperDX 一起捆绑的 OpAMP 服务器管理的摄取密钥，通过部署的 OTel 收集器进行安全摄取 - 这种功能在 ClickHouse Cloud 托管版本中当前不可用。
:::

出于安全原因，服务使用 `ClusterIP`，默认情况下不对外暴露。

要访问 HyperDX UI，从 3000 转发到本地端口 8080。

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

导航到 [http://localhost:8080](http://localhost:8080) 以访问 HyperDX UI。

创建一个用户，提供满足复杂性要求的用户名和密码。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

### 检索摄取 API 密钥 {#retrieve-ingestion-api-key}

通过 ClickStack 收集器部署的 OTel 收集器的摄取是使用摄取密钥安全的。

导航到 [`Team Settings`](http://localhost:8080/team) 并从 `API Keys` 部分复制 `Ingestion API Key`。此 API 密钥确保通过 OpenTelemetry 收集器的数据摄取是安全的。

<Image img={copy_api_key} alt="复制 API 密钥" size="lg"/>

### 创建 API 密钥 Kubernetes Secret {#create-api-key-kubernetes-secret}

使用摄取 API 密钥以及包含 ClickStack helm 图表中部署的 OTel 收集器位置的配置映射创建一个新的 Kubernetes secret。后续组件将使用此信息允许数据摄取到部署的 ClickStack Helm 图表中：

```shell

# create secret with the ingestion API key
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
-n otel-demo


# create a ConfigMap pointing to the ClickStack OTel collector deployed above
kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318
```

重新启动 OpenTelemetry 演示应用程序的 pods，以考虑摄取 API 密钥。

```shell
kubectl rollout restart deployment -n otel-demo -l app.kubernetes.io/part-of=opentelemetry-demo
```

来自演示服务的跟踪和日志数据现在应开始流入 HyperDX。

<Image img={hyperdx_kubernetes_data} alt="HyperDX Kubernetes 数据" size="lg"/>

### 添加 OpenTelemetry Helm 仓库 {#add-otel-helm-repo}

为了收集 Kubernetes 指标，我们将部署一个标准的 OTel 收集器，并配置它以通过上述摄取 API 密钥安全地发送数据到我们的 ClickStack 收集器。

这要求我们安装 OpenTelemetry Helm 仓库：

```shell

# Add Otel Helm repo
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts 
```

### 部署 Kubernetes 收集器组件 {#deploy-kubernetes-collector-components}

为了从集群本身及每个节点收集日志和指标，我们需要部署两个单独的 OpenTelemetry 收集器，每个收集器都有其自己的清单。这两个提供的清单 - `k8s_deployment.yaml` 和 `k8s_daemonset.yaml` - 协同工作以收集来自您的 Kubernetes 集群的全面遥测数据。

- `k8s_deployment.yaml` 部署一个 **单个 OpenTelemetry Collector 实例**，负责收集 **集群范围内的事件和元数据**。它收集 Kubernetes 事件、集群指标，并通过 pod 标签和注释丰富遥测数据。此收集器作为独立部署运行，具有单个副本以避免重复数据。

- `k8s_daemonset.yaml` 部署一个 **基于 DaemonSet 的收集器**，在集群中的每个节点上运行。它收集 **节点级别和 pod 级别的指标**，以及容器日志，使用 `kubeletstats`、`hostmetrics` 和 Kubernetes 属性处理器等组件。这些收集器使用元数据丰富日志，并通过 OTLP 导出器将其发送到 HyperDX。

这两个清单一起使整个集群的可观察性成为可能，从基础设施到应用程序级别的遥测，并将丰富的数据发送到 ClickStack 进行集中分析。

首先，作为部署安装收集器：

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

接下来，作为 DaemonSet 部署收集器以处理节点和 pod 级别的指标和日志：

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

### 在 HyperDX 中探索 Kubernetes 数据 {#explore-kubernetes-data-hyperdx}

导航到您的 HyperDX UI - 使用您 Kubernetes 部署的实例或通过 ClickHouse Cloud。

<p/>
<details>
<summary>使用 ClickHouse Cloud</summary>

如果使用 ClickHouse Cloud，只需登录到您的 ClickHouse Cloud 服务，并从左侧菜单中选择 "HyperDX"。您将被自动认证，不需要创建用户。

当提示创建数据源时，保留创建源模型中的所有默认值，在表字段中填写值 `otel_logs` - 以创建一个日志源。所有其他设置应被自动检测，您可以点击 `Save New Source`。

<Image force img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX 数据源" size="lg"/>

您还需要为跟踪和指标创建数据源。

例如，要为跟踪和 OTel 指标创建源，用户可以从顶部菜单中选择 `Create New Source`。

<Image force img={hyperdx_create_new_source} alt="HyperDX 创建新源" size="lg"/>

从这里，选择所需的源类型，然后选择相应的表，例如对于跟踪，选择表 `otel_traces`。所有设置应被自动检测。

<Image force img={hyperdx_create_trace_datasource} alt="HyperDX 创建跟踪源" size="lg"/>

:::note 关联源
请注意，在 ClickStack 中不同的数据源—例如日志和跟踪—可以彼此关联。要启用此功能，每个源需要额外配置。例如，在日志源中，您可以指定相应的跟踪源，而在跟踪源中反之亦然。有关详细信息，请参见 "关联源"。
:::

</details>

<details>

<summary>使用自管理部署</summary>

要访问本地部署的 HyperDX，您可以使用本地命令进行端口转发，并访问 HyperDX，地址为 [http://localhost:8080](http://localhost:8080)。

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

:::note ClickStack 生产环境
在生产环境中，如果您不在 ClickHouse Cloud 中使用 HyperDX，建议使用 TLS 的 ingress。例如：

```shell
helm upgrade my-hyperdx hyperdx/hdx-oss-v2 \
--set hyperdx.ingress.enabled=true \
--set hyperdx.ingress.host=your-domain.com \
--set hyperdx.ingress.tls.enabled=true
```
::::

</details>

要探索 Kubernetes 数据，导航到专用仪表板 `/kubernetes`，例如 [http://localhost:8080/kubernetes](http://localhost:8080/kubernetes)。

每个选项卡，Pods、Nodes 和 Namespaces，都应该填充数据。

</VerticalStepper>

<Image img={dashboard_kubernetes} alt="ClickHouse Kubernetes" size="lg"/>
