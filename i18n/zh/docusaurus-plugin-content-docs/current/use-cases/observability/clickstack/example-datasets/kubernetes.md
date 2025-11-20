---
slug: /use-cases/observability/clickstack/getting-started/kubernetes
title: '监控 Kubernetes'
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: '开始使用 ClickStack 并监控 Kubernetes'
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

本指南可帮助你从 Kubernetes 系统中收集日志和指标，并将其发送到 **ClickStack** 进行可视化和分析。作为演示数据，我们可以选择使用 ClickStack 派生的官方 OpenTelemetry 演示项目。

<iframe width="768" height="432" src="https://www.youtube.com/embed/winI7256Ejk?si=TRThhzCJdq87xg_x" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />


## 前置条件 {#prerequisites}

本指南要求您具备以下条件：

- 一个 **Kubernetes 集群**（推荐 v1.20 及以上版本），其中至少有一个节点可为 ClickHouse 提供 32 GiB 内存和 100GB 磁盘空间。
- **[Helm](https://helm.sh/)** v3 及以上版本
- **`kubectl`**，已配置为可与您的集群交互


## 部署选项 {#deployment-options}

您可以使用以下任一部署选项来按照本指南操作:

- **自托管**: 在您的 Kubernetes 集群内完整部署 ClickStack,包括:
  - ClickHouse
  - HyperDX
  - MongoDB(用于仪表板状态和配置)

- **云托管**: 使用 **ClickHouse Cloud**,HyperDX 由外部管理。这样就无需在集群内运行 ClickHouse 或 HyperDX。

为了模拟应用程序流量,您可以选择部署 ClickStack 分支的 [**OpenTelemetry Demo Application**](https://github.com/ClickHouse/opentelemetry-demo)。这将生成包括日志、指标和追踪在内的遥测数据。如果您的集群中已经有正在运行的工作负载,可以跳过此步骤并监控现有的 Pod、节点和容器。

<VerticalStepper headerLevel="h3">

### 安装 cert-manager(可选) {#install-cert-manager}

如果您的设置需要 TLS 证书,请使用 Helm 安装 [cert-manager](https://cert-manager.io/):


```shell
# 添加 Cert manager 仓库

helm repo add jetstack https://charts.jetstack.io

helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set startupapicheck.timeout=5m --set installCRDs=true --set global.leaderElection.namespace=cert-manager
```

### 部署 OpenTelemetry 演示应用(可选) {#deploy-otel-demo}

此**步骤为可选项,适用于没有现有 Pod 需要监控的用户**。虽然已在 Kubernetes 环境中部署了现有服务的用户可以跳过此步骤,但此演示应用包含了已插桩的微服务,这些服务会生成追踪和会话回放数据,使用户能够体验 ClickStack 的所有功能。

以下操作将在 Kubernetes 集群中部署 ClickStack 分支版本的 OpenTelemetry 演示应用程序栈,专为可观测性测试和展示插桩功能而定制。它包括后端微服务、负载生成器、遥测管道、支撑基础设施(例如 Kafka、Redis)以及与 ClickStack 的 SDK 集成。

所有服务都部署到 `otel-demo` 命名空间。每个部署包括:

- 使用 OTel 和 ClickStack SDK 对追踪、指标和日志进行自动插桩。
- 所有服务将其插桩数据发送到 `my-hyperdx-hdx-oss-v2-otel-collector` OpenTelemetry 收集器(未部署)
- [转发资源标签](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods),通过环境变量 `OTEL_RESOURCE_ATTRIBUTES` 关联日志、指标和追踪。


```shell
## 下载演示 Kubernetes 清单文件
curl -O https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
# wget 替代命令
# wget https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
kubectl apply --namespace otel-demo -f opentelemetry-demo.yaml
```

部署演示后,确认所有 Pod 已成功创建并处于 `Running` 状态:

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

### 添加 ClickStack Helm Chart 仓库 {#add-helm-clickstack}

要部署 ClickStack,我们使用[官方 Helm Chart](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm)。

这需要添加 HyperDX Helm 仓库:

```shell
helm repo add hyperdx https://hyperdxio.github.io/helm-charts
helm repo update
```

### 部署 ClickStack {#deploy-clickstack}

安装 Helm Chart 后,您可以将 ClickStack 部署到集群。您可以在 Kubernetes 环境中运行所有组件(包括 ClickHouse 和 HyperDX),也可以使用 ClickHouse Cloud,其中 HyperDX 也作为托管服务提供。

<br />

<details>
<summary>自托管部署</summary>

以下命令将 ClickStack 安装到 `otel-demo` 命名空间。该 Helm Chart 部署:

- 一个 ClickHouse 实例
- HyperDX
- OTel Collector 的 ClickStack 发行版
- 用于存储 HyperDX 应用状态的 MongoDB

:::note
您可能需要根据 Kubernetes 集群配置调整 `storageClassName`。
:::

未部署 OTel 演示的用户可以修改此配置,选择合适的命名空间。

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2   --set clickhouse.persistence.dataSize=100Gi --set global.storageClassName="standard-rwo" -n otel-demo
```

:::warning 生产环境中的 ClickStack


此 chart 还会安装 ClickHouse 和 OTel collector。对于生产环境,建议使用 ClickHouse 和 OTel collector 的 operator,和/或使用 ClickHouse Cloud。

要禁用 ClickHouse 和 OTel collector,请设置以下值:

```shell
helm install myrelease <chart-name-or-path> --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
```

:::

</details>

<details>
<summary>使用 ClickHouse Cloud</summary>

如果您希望使用 ClickHouse Cloud,可以部署 ClickStack 并[禁用内置的 ClickHouse](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud)。

:::note
该 chart 目前始终会同时部署 HyperDX 和 MongoDB。虽然这些组件提供了替代访问路径,但它们未与 ClickHouse Cloud 身份验证集成。在此部署模式中,这些组件面向管理员使用,[提供对安全摄取密钥的访问](#retrieve-ingestion-api-key),该密钥是通过已部署的 OTel collector 进行数据摄取所必需的,但不应向最终用户公开。
:::


```shell
# 指定 ClickHouse Cloud 凭据
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # 完整的 https URL
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

helm install my-hyperdx hyperdx/hdx-oss-v2  --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} --set clickhouse.config.users.otelUserName=${CLICKHOUSE_USER} --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD} --set global.storageClassName="standard-rwo" -n otel-demo
```

</details>

要验证部署状态,请运行以下命令并确认所有组件均处于 `Running` 状态。注意:使用 ClickHouse Cloud 的用户在此列表中不会看到 ClickHouse:

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
即使使用 ClickHouse Cloud,仍需要在 Kubernetes 集群中部署本地 HyperDX 实例。它提供由 HyperDX 内置的 OpAMP 服务器管理的接入密钥,通过已部署的 OTel 收集器保护数据接入 - 这是 ClickHouse Cloud 托管版本目前尚不支持的功能。
:::

出于安全考虑,该服务使用 `ClusterIP`,默认不对外暴露。

要访问 HyperDX UI,请将端口 3000 转发到本地端口 8080。

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

在浏览器中访问 [http://localhost:8080](http://localhost:8080) 以打开 HyperDX UI。

创建用户,提供符合复杂度要求的用户名和密码。

<Image img={hyperdx_login} alt='HyperDX UI' size='lg' />

### 获取接入 API 密钥 {#retrieve-ingestion-api-key}

通过 ClickStack 收集器部署的 OTel 收集器的数据接入使用接入密钥进行保护。

导航至 [`Team Settings`](http://localhost:8080/team),从 `API Keys` 部分复制 `Ingestion API Key`。此 API 密钥可确保通过 OpenTelemetry 收集器进行的数据接入是安全的。

<Image img={copy_api_key} alt='Copy API key' size='lg' />

### 创建 API 密钥 Kubernetes Secret {#create-api-key-kubernetes-secret}

使用接入 API 密钥创建一个新的 Kubernetes Secret,以及一个包含通过 ClickStack Helm Chart 部署的 OTel 收集器位置的 ConfigMap。后续组件将使用它来允许数据接入到通过 ClickStack Helm Chart 部署的收集器中:


```shell
# 使用数据采集 API 密钥创建 secret
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
-n otel-demo
```


# 创建指向上述已部署 ClickStack OTel 收集器的 ConfigMap

kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318

````

重启 OpenTelemetry 演示应用程序 Pod 以应用 Ingestion API Key。

```shell
kubectl rollout restart deployment -n otel-demo -l app.kubernetes.io/part-of=opentelemetry-demo
````

演示服务的追踪和日志数据现在应开始流入 HyperDX。

<Image img={hyperdx_kubernetes_data} alt='HyperDX Kubernetes 数据' size='lg' />

### 添加 OpenTelemetry Helm 仓库 {#add-otel-helm-repo}

为收集 Kubernetes 指标,我们将部署一个标准 OTel 收集器,并配置其使用上述 Ingestion API Key 将数据安全发送到 ClickStack 收集器。

这需要安装 OpenTelemetry Helm 仓库:


```shell
# 添加 Otel Helm 仓库
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

### 部署 Kubernetes 采集器组件 {#deploy-kubernetes-collector-components}

为了从集群本身和各个节点收集日志和指标,我们需要部署两个独立的 OpenTelemetry 采集器,每个采集器都有各自的清单文件。提供的两个清单文件 - `k8s_deployment.yaml` 和 `k8s_daemonset.yaml` - 协同工作,从您的 Kubernetes 集群收集全面的遥测数据。

- `k8s_deployment.yaml` 部署**单个 OpenTelemetry Collector 实例**,负责收集**集群范围的事件和元数据**。它收集 Kubernetes 事件、集群指标,并使用 Pod 标签和注解丰富遥测数据。此采集器作为独立部署运行,使用单个副本以避免数据重复。

- `k8s_daemonset.yaml` 部署**基于 DaemonSet 的采集器**,在集群中的每个节点上运行。它使用 `kubeletstats`、`hostmetrics` 和 Kubernetes 属性处理器等组件收集**节点级和 Pod 级指标**以及容器日志。这些采集器使用元数据丰富日志,并通过 OTLP 导出器将其发送到 HyperDX。

这些清单文件共同实现了跨集群的全栈可观测性,涵盖从基础设施到应用程序级的遥测数据,并将丰富后的数据发送到 ClickStack 进行集中分析。

首先,将采集器安装为 Deployment:


```shell
# 下载清单文件
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_deployment.yaml
# 安装 Helm chart
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


# 我们只需要一个收集器 - 多个收集器会产生重复数据

replicaCount: 1

presets:
kubernetesAttributes:
enabled: true # 启用后,处理器将提取关联 Pod 的所有标签并将其添加为资源属性。# 标签的确切名称将作为键。
extractAllPodLabels: true # 启用后,处理器将提取关联 Pod 的所有注解并将其添加为资源属性。# 注解的确切名称将作为键。
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

接下来,将收集器部署为 DaemonSet 以收集节点和 Pod 级的指标和日志:

```


```shell
# 下载清单文件
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_daemonset.yaml
# 安装 Helm chart
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

# 将 k8sattributes 处理器添加到所有管道,并向 ClusterRole 添加必要的规则。

# 更多信息:https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor

kubernetesAttributes:
enabled: true # 启用后,处理器将提取关联 Pod 的所有标签并将其添加为资源属性。# 标签的确切名称将作为键。
extractAllPodLabels: true # 启用后,处理器将提取关联 Pod 的所有注解并将其添加为资源属性。# 注解的确切名称将作为键。
extractAllPodAnnotations: true

# 配置收集器从 kubelet 上的 API 服务器收集节点、Pod 和容器指标。

# 将 kubeletstats 接收器添加到指标管道,并向 ClusterRole 添加必要的规则。

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

导航到您的 HyperDX UI - 可以使用 Kubernetes 部署的实例或通过 ClickHouse Cloud 访问。

<p/>
<details>
<summary>使用 ClickHouse Cloud</summary>

如果使用 ClickHouse Cloud,只需登录到您的 ClickHouse Cloud 服务并从左侧菜单中选择"HyperDX"。您将自动完成身份验证,无需创建用户。

当提示创建数据源时,在创建源模型中保留所有默认值,在 Table 字段中填入值 `otel_logs` - 以创建日志源。所有其他设置应自动检测,然后您可以点击 `Save New Source`。

<Image force img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX 数据源" size="lg"/>

您还需要为追踪和指标创建数据源。

例如,要为追踪和 OTel 指标创建源,用户可以从顶部菜单中选择 `Create New Source`。

<Image force img={hyperdx_create_new_source} alt="HyperDX 创建新源" size="lg"/>

从这里,选择所需的源类型,然后选择相应的表,例如对于追踪,选择表 `otel_traces`。所有设置应自动检测。

<Image force img={hyperdx_create_trace_datasource} alt="HyperDX 创建追踪源" size="lg"/>

```


:::note 关联数据源
请注意,ClickStack 中的不同数据源(如日志和追踪)可以相互关联。要启用此功能,需要在每个数据源上进行额外配置。例如,在日志源中,您可以指定相应的追踪源,在追踪源中也可以指定相应的日志源。有关更多详细信息,请参阅"关联数据源"。
:::

</details>

<details>

<summary>使用自管理部署</summary>

要访问本地部署的 HyperDX,您可以使用以下命令进行端口转发,然后通过 [http://localhost:8080](http://localhost:8080) 访问 HyperDX。

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

:::note 生产环境中的 ClickStack
在生产环境中,如果您未在 ClickHouse Cloud 中使用 HyperDX,我们建议使用带 TLS 的 ingress。例如:

```shell
helm upgrade my-hyperdx hyperdx/hdx-oss-v2 \
--set hyperdx.ingress.enabled=true \
--set hyperdx.ingress.host=your-domain.com \
--set hyperdx.ingress.tls.enabled=true
```

:::

</details>

要浏览 Kubernetes 数据,请导航至专用仪表板 `/kubernetes`,例如 [http://localhost:8080/kubernetes](http://localhost:8080/kubernetes)。

每个选项卡(Pods、Nodes 和 Namespaces)都应显示相应的数据。

</VerticalStepper>

<Image img={dashboard_kubernetes} alt='ClickHouse kubernetes' size='lg' />
