---
slug: /use-cases/observability/clickstack/getting-started/kubernetes
title: '监控 Kubernetes'
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 开始监控 Kubernetes'
doc_type: 'guide'
keywords: ['clickstack', 'kubernetes', 'logs', 'observability', 'container monitoring']
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

本指南将帮助您从 Kubernetes 系统中收集日志和指标，并将其发送到 **ClickStack** 进行可视化和分析。作为演示数据，我们可以选择使用官方 OpenTelemetry 演示应用的 ClickStack 分支。

<iframe width="768" height="432" src="https://www.youtube.com/embed/winI7256Ejk?si=TRThhzCJdq87xg_x" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />


## 先决条件 {#prerequisites}

使用本指南前，你需要具备：

- 一个 **Kubernetes 集群**（建议使用 v1.20+），并在单个节点上为 ClickHouse 预留至少 32 GiB 内存和 100GB 磁盘空间。
- **[Helm](https://helm.sh/)** v3+
- 已配置好、可与集群交互的 **`kubectl`**



## 部署选项 {#deployment-options}

你可以按照本指南，选择以下任一部署方式：

- **自托管**：在 Kubernetes 集群中完整部署 ClickStack，包括：
  - ClickHouse
  - HyperDX
  - MongoDB（用于存储仪表板状态和配置）

- **云托管**：使用 **ClickHouse Cloud**，并在集群外部托管 HyperDX。这样就不需要在集群内部运行 ClickHouse 或 HyperDX。

为了模拟应用流量，你可以选择部署 ClickStack 分支版本的 [**OpenTelemetry Demo Application**](https://github.com/ClickHouse/opentelemetry-demo)。它会生成包含日志、指标和追踪在内的遥测数据。如果你的集群中已经有正在运行的工作负载，可以跳过此步骤，直接监控现有的 Pod（容器组）、节点和容器。

<VerticalStepper headerLevel="h3">

### 安装 cert-manager（可选） {#install-cert-manager}

如果你的环境需要 TLS 证书，请使用 helm 安装 [cert-manager](https://cert-manager.io/)：


```shell
# 添加 cert-manager 仓库 

helm repo add jetstack https://charts.jetstack.io 

helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set startupapicheck.timeout=5m --set installCRDs=true --set global.leaderElection.namespace=cert-manager
```

### 部署 OpenTelemetry Demo（可选）

此**步骤为可选项，适用于当前没有可监控 pod（容器组）的用户**。虽然在 Kubernetes 环境中已有服务在运行的用户可以跳过本节，但该演示应用包含已接入观测埋点的微服务，会生成 trace 和会话回放数据，使用户能够探索 ClickStack 的全部功能。

下面的步骤会在 Kubernetes 集群中部署 ClickStack 维护的 OpenTelemetry Demo 应用栈，用于观测性测试和展示埋点。它包含后端微服务、负载生成器、遥测管道、支撑基础设施（例如 Kafka、Redis），以及与 ClickStack 的 SDK 集成。

所有服务都将被部署到 `otel-demo` 命名空间中。每个部署包括：

* 使用 OTel 和 ClickStack SDKS 对 traces、metrics 和 logs 进行自动埋点采集。
* 所有服务将其遥测数据发送到 `my-hyperdx-hdx-oss-v2-otel-collector` OpenTelemetry collector（本步骤不会一同部署）
* 通过环境变量 `OTEL_RESOURCE_ATTRIBUTES`，[转发资源标签](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods)，以便关联 logs、metrics 和 traces。


```shell
## 下载演示用的 Kubernetes 清单文件
curl -O https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
# 使用 wget 的替代方式
# wget https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
kubectl apply --namespace otel-demo -f opentelemetry-demo.yaml
```

在部署此演示后，确认所有 pod（容器组）都已成功创建并处于 `Running` 状态：

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

### 添加 ClickStack Helm 图表仓库 {#add-helm-clickstack}

要部署 ClickStack，我们使用[官方 Helm 图表](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm)。

这需要先添加 HyperDX 的 Helm 仓库：

```shell
helm repo add hyperdx https://hyperdxio.github.io/helm-charts
helm repo update
```

### 部署 ClickStack {#deploy-clickstack}

安装 Helm 图表后，您可以将 ClickStack 部署到集群中。您可以选择在 Kubernetes 集群中运行包括 ClickHouse 和 HyperDX 在内的所有组件，或者使用 ClickHouse Cloud，在其中 HyperDX 同样可作为托管服务提供。

<br />

<details>
<summary>自管理部署</summary>

以下命令会将 ClickStack 安装到 `otel-demo` 命名空间中。该 Helm 图表会部署：

- 一个 ClickHouse 实例
- HyperDX
- ClickStack 发行版中的 OTel collector
- 用于存储 HyperDX 应用状态的 MongoDB

:::note
您可能需要根据 Kubernetes 集群配置调整 `storageClassName`。
:::

未部署 OTel 演示环境的用户可以修改此值，选择合适的命名空间。

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2   --set clickhouse.persistence.dataSize=100Gi --set global.storageClassName="standard-rwo" -n otel-demo
```

:::warning 生产环境中的 ClickStack


本 chart 还会安装 ClickHouse 和 OTel collector。在生产环境中，建议使用 ClickHouse Operator 和 OTel collector Operator，和/或使用 ClickHouse Cloud。

要禁用 ClickHouse 和 OTel collector，请设置以下值：

```shell
helm install myrelease <chart-name-or-path> --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
```

:::

</details>

<details>
<summary>使用 ClickHouse Cloud</summary>

如果希望使用 ClickHouse Cloud，可以部署 ClickStack，并[禁用随附的 ClickHouse](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud)。

:::note
该 chart 当前始终同时部署 HyperDX 和 MongoDB。尽管这些组件提供了一条替代访问路径，但它们没有与 ClickHouse Cloud 的认证集成。在此部署模型中，这些组件面向管理员，[用于访问安全的摄取密钥](#retrieve-ingestion-api-key)，该密钥是通过已部署的 OTel collector 摄取数据所必需的，但不应向最终用户暴露。
:::


```shell
# 指定 ClickHouse Cloud 凭证
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # full https url
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

helm install my-hyperdx hyperdx/hdx-oss-v2  --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} --set clickhouse.config.users.otelUserName=${CLICKHOUSE_USER} --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD} --set global.storageClassName="standard-rwo" -n otel-demo
```

</details>

要验证部署状态，运行以下命令并确认所有组件都处于 `Running` 状态。注意：对于使用 ClickHouse Cloud 的用户，此列表中不会包含 ClickHouse 组件：

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
即使使用 ClickHouse Cloud，仍然需要在 Kubernetes 集群中部署本地 HyperDX 实例。该实例通过与 HyperDX 一同提供的 OpAMP 服务器来管理摄取密钥，并通过已部署的 OTel collector 安全地进行数据摄取——这一功能目前在 ClickHouse Cloud 托管版本中尚不可用。
:::

出于安全考虑，该服务使用 `ClusterIP`，默认不会对外暴露。

要访问 HyperDX UI，请将 3000 端口通过端口转发映射到本地 8080 端口。

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

在浏览器中访问 [http://localhost:8080](http://localhost:8080) 以打开 HyperDX UI。

创建一个用户，并提供符合复杂度要求的用户名和密码。

<Image img={hyperdx_login} alt='HyperDX 界面' size='lg' />

### 获取摄取 API key {#retrieve-ingestion-api-key}

向由 ClickStack 部署的 OTel collector 进行数据摄取时，会使用摄取密钥进行安全防护。

进入 [`Team Settings`](http://localhost:8080/team)，然后从 `API Keys` 部分复制 `Ingestion API Key`。此 API key 可确保通过 OpenTelemetry collector 进行的数据摄取是安全的。

<Image img={copy_api_key} alt='复制 API key' size='lg' />

### 创建 API Key Kubernetes Secret {#create-api-key-kubernetes-secret}

使用摄取 API key 创建一个新的 Kubernetes Secret，并创建一个包含通过 ClickStack Helm 图表部署的 OTel collector 地址的 ConfigMap。后续组件将使用这些配置，将数据摄取到通过 ClickStack Helm 图表部署的 collector 中：


```shell
# 使用摄取 API key 创建 Secret
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
-n otel-demo
```


# 创建一个 ConfigMap，指向上文中部署的 ClickStack OTel collector

kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR&#95;OTEL&#95;COLLECTOR&#95;ENDPOINT=[http://my-hyperdx-hdx-oss-v2-otel-collector:4318](http://my-hyperdx-hdx-oss-v2-otel-collector:4318)

````

重新启动 OpenTelemetry Demo Application 的 Pod（容器组），使摄取 API key 生效。 

```shell
kubectl rollout restart deployment -n otel-demo -l app.kubernetes.io/part-of=opentelemetry-demo
````

来自演示服务的跟踪和日志数据现在应该已经开始流入 HyperDX。

<Image img={hyperdx_kubernetes_data} alt="HyperDX Kubernetes Data" size="lg" />

### 添加 OpenTelemetry Helm 仓库

为了采集 Kubernetes 指标，我们将部署一个标准的 OTel collector，并将其配置为使用上面的摄取 API key 安全地将数据发送到我们的 ClickStack collector。

为此，我们需要安装 OpenTelemetry Helm 仓库：


```shell
# 添加 OTel Helm 仓库
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts 
```

### 部署 Kubernetes collector 组件

为了从集群本身以及每个节点收集日志和指标，我们需要部署两个独立的 OpenTelemetry collector，每个都有自己的 manifest。提供的两个 manifest——`k8s_deployment.yaml` 和 `k8s_daemonset.yaml`——协同工作，从你的 Kubernetes 集群中收集全面的遥测数据。

* `k8s_deployment.yaml` 部署一个**单一的 OpenTelemetry Collector 实例**，负责收集**集群范围内的事件和元数据**。它收集 Kubernetes 事件、集群指标，并使用 pod（容器组）标签和注解丰富遥测数据。该 collector 作为一个具有单副本的独立 Deployment 运行，以避免产生重复数据。

* `k8s_daemonset.yaml` 部署一个基于 **DaemonSet 的 collector**，它会在集群中的每个节点上运行。它使用 `kubeletstats`、`hostmetrics` 和 Kubernetes Attribute Processor 等组件收集**节点级和 pod 级指标**以及容器日志。这些 collector 会使用元数据丰富日志，并通过 OTLP 导出器将其发送到 HyperDX。

结合使用这些 manifest，可以在整个集群范围内实现从基础设施到应用级遥测的全栈可观测性，并将丰富后的数据发送到 ClickStack 进行集中分析。

首先，将 collector 作为一个 Deployment 进行安装：


```shell
# 下载清单文件
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_deployment.yaml
# 安装 Helm 图表
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


# 我们只需要一个这样的收集器，多于一个就会产生重复数据

replicaCount: 1

presets:
kubernetesAttributes:
enabled: true # 启用后，处理器会提取关联 pod（容器组）的所有标签，并将其添加为资源属性。 # 标签的精确名称将作为键。
extractAllPodLabels: true # 启用后，处理器会提取关联 pod（容器组）的所有注解，并将其添加为资源属性。 # 注解的精确名称将作为键。
extractAllPodAnnotations: true

# 将收集器配置为采集 Kubernetes 事件。

# 将 k8sobject receiver 添加到日志管道中，并默认采集 Kubernetes 事件。

# 更多信息：https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver

kubernetesEvents:
enabled: true

# 将 Kubernetes Cluster Receiver 配置为采集集群级别的指标。

# 将 k8s_cluster receiver 添加到指标管道中，并向 ClusterRole 添加必要的规则。

# 更多信息：https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-cluster-receiver

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

接下来，将收集器以 DaemonSet 守护进程集的形式部署，用于节点和 pod（容器组）级别的指标和日志：

```


```shell
# 下载清单文件
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_daemonset.yaml
# 安装 Helm 图表
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


# 使用 kubeletstats CPU/内存利用率指标所需的配置

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

# 配置 Kubernetes 处理器以添加 Kubernetes 元数据。

# 将 k8sattributes 处理器添加到所有管道中，并向集群角色添加所需的规则。

# 更多信息：https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor

kubernetesAttributes:
enabled: true # 启用后，处理器会提取关联 pod（容器组）的所有标签，并将其作为资源属性添加。 # 标签的完整名称将作为键。
extractAllPodLabels: true # 启用后，处理器会提取关联 pod（容器组）的所有注解，并将其作为资源属性添加。 # 注解的完整名称将作为键。
extractAllPodAnnotations: true

# 配置采集器，通过 kubelet 暴露的 API 服务器收集节点、pod（容器组）和容器指标。

# 将 kubeletstats 接收器添加到指标管道中，并向集群角色添加所需的规则。

# 更多信息：https://opentelemetry.io/docs/kubernetes/collector/components/#kubeletstats-receiver

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
receivers: # 配置附加的 kubelet 指标
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

### 在 HyperDX 中探索 Kubernetes 数据 {#explore-kubernetes-data-hyperdx}

进入您的 HyperDX 界面——可以使用在 Kubernetes 中部署的实例，也可以通过 ClickHouse Cloud 访问。

<p/>
<details>
<summary>使用 ClickHouse Cloud</summary>

如果使用 ClickHouse Cloud，只需登录到您的 ClickHouse Cloud 服务，并在左侧菜单中选择 “HyperDX”。系统会自动完成身份验证，您无需创建用户。

在提示创建数据源时，保留创建数据源对话框中的所有默认值，将 `Table` 字段填写为 `otel_logs`，以创建日志数据源。其他设置应会自动检测，此时可以直接点击 `Save New Source`。

<Image force img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX 数据源" size="lg"/>

您还需要为追踪和指标创建数据源。

例如，要为追踪和 OTel 指标创建数据源，用户可以从顶部菜单中选择 `Create New Source`。

<Image force img={hyperdx_create_new_source} alt="HyperDX 创建新数据源" size="lg"/>

在此处，先选择所需的数据源类型，然后选择相应的数据表，例如，对于追踪，选择表 `otel_traces`。所有设置都应会自动检测。

<Image force img={hyperdx_create_trace_datasource} alt="HyperDX 创建追踪数据源" size="lg"/>

```


:::note 关联来源
请注意，ClickStack 中的不同数据源（例如日志和追踪）可以彼此关联。要实现这一点，需要在每个数据源上进行额外配置。例如，在日志数据源中可以指定对应的追踪数据源，反之，在追踪数据源中也可以指定对应的日志数据源。有关更多详情，请参阅“关联来源”。
:::

</details>

<details>

<summary>使用自托管部署</summary>

要访问本地部署的 HyperDX，可以在本机使用端口转发命令，然后通过 [http://localhost:8080](http://localhost:8080) 访问 HyperDX。

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

:::note 生产环境中的 ClickStack
在生产环境中，如果没有在 ClickHouse Cloud 中使用 HyperDX，我们建议使用启用 TLS 的入口（Ingress）。示例：

```shell
helm upgrade my-hyperdx hyperdx/hdx-oss-v2 \
--set hyperdx.ingress.enabled=true \
--set hyperdx.ingress.host=your-domain.com \
--set hyperdx.ingress.tls.enabled=true
```

::::

</details>

要探索 Kubernetes 数据，请导航到 `/kubernetes` 路径下的专用预设仪表板，例如 [http://localhost:8080/kubernetes](http://localhost:8080/kubernetes)。

“Pods（pod（容器组））”、“Nodes（节点）”和 “Namespaces（命名空间）” 这几个选项卡中都应已有数据。

</VerticalStepper>

<Image img={dashboard_kubernetes} alt='ClickHouse Kubernetes 仪表板' size='lg' />
