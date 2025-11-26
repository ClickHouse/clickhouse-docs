---
slug: /use-cases/observability/clickstack/getting-started/kubernetes
title: '监控 Kubernetes'
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 入门 Kubernetes 监控'
doc_type: '指南'
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

本指南帮助你从 Kubernetes 系统中收集日志和指标，并将其发送到 **ClickStack** 进行可视化和分析。作为演示数据，我们可以选择使用 ClickStack 维护的官方 OpenTelemetry 演示应用的 fork。

<iframe width="768" height="432" src="https://www.youtube.com/embed/winI7256Ejk?si=TRThhzCJdq87xg_x" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />


## 前置条件 {#prerequisites}

使用本指南前，您需要具备：

- 一个 **Kubernetes 集群**（建议 v1.20+），并在某个节点上为 ClickHouse 预留至少 32 GiB 内存和 100 GB 磁盘空间。
- **[Helm](https://helm.sh/)** v3+
- 已正确配置、可与集群交互的 **`kubectl`**

## 部署选项 {#deployment-options}

可以使用以下任一部署选项来完成本指南：

- **自托管**：在 Kubernetes 集群中完整部署 ClickStack，包括：
  - ClickHouse
  - HyperDX
  - MongoDB（用于仪表盘状态和配置）

- **云托管**：使用 **ClickHouse Cloud**，并将 HyperDX 作为外部托管服务使用。这样就无需在集群内部运行 ClickHouse 或 HyperDX。

为了模拟应用程序流量，可以选择部署 ClickStack 分支版本的 [**OpenTelemetry Demo Application**](https://github.com/ClickHouse/opentelemetry-demo)。这会生成包括日志、指标和追踪在内的遥测数据。如果集群中已经有工作负载在运行，可以跳过此步骤，直接监控现有的 Pod（容器组）、节点和容器。

<VerticalStepper headerLevel="h3">
  ### 安装 cert-manager(可选)

  如果您的部署需要 TLS 证书,请使用 Helm 安装 [cert-manager](https://cert-manager.io/):

  ```shell
  # 添加 cert-manager 仓库 

  helm repo add jetstack https://charts.jetstack.io 

  helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set startupapicheck.timeout=5m --set installCRDs=true --set global.leaderElection.namespace=cert-manager
  ```

  ### 部署 OpenTelemetry 演示（可选）

  此**步骤为可选项，适用于没有现有 Pod（容器组）需要监控的用户**。虽然已在 Kubernetes 环境中部署了现有服务的用户可以跳过此步骤，但本演示包含已插桩的微服务，这些微服务会生成追踪和会话回放数据，让用户能够体验 ClickStack 的所有功能。

  以下步骤将在 Kubernetes 集群中部署 ClickStack 分支版本的 OpenTelemetry Demo Application 堆栈,专为可观测性测试和仪表化演示而定制。该堆栈包含后端微服务、负载生成器、遥测管道、支撑基础设施(如 Kafka、Redis)以及与 ClickStack 的 SDK 集成。

  所有服务均部署到 `otel-demo` 命名空间。每个部署包括：

  * 使用 OTel 和 ClickStack SDKS 对链路追踪、指标和日志进行自动仪表化。
  * 所有服务会将其遥测数据发送到 `my-hyperdx-hdx-oss-v2-otel-collector` OpenTelemetry 收集器（尚未部署）
  * [将资源标签转发](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods)，以便通过环境变量 `OTEL_RESOURCE_ATTRIBUTES` 关联日志、指标和追踪数据。

  ```shell
  ## 下载演示 Kubernetes 清单文件
  curl -O https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
  # wget 替代命令
  # wget https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
  kubectl apply --namespace otel-demo -f opentelemetry-demo.yaml
  ```

  部署演示环境后，确认所有 Pod（容器组）已成功创建并处于 `Running` 状态：

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

  ### 添加 ClickStack Helm 图表仓库

  要部署 ClickStack,我们使用[官方 Helm 图表](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm)。

  这需要添加 HyperDX Helm 仓库：

  ```shell
  helm repo add hyperdx https://hyperdxio.github.io/helm-charts
  helm repo update
  ```

  ### 部署 ClickStack

  安装 Helm 图表后,您可以将 ClickStack 部署到集群。您可以选择在 Kubernetes 环境中运行所有组件(包括 ClickHouse 和 HyperDX),也可以使用 ClickHouse Cloud,HyperDX 在其中同样以托管服务的形式提供。

  <br />

  <details>
    <summary>自托管部署</summary>

    以下命令会将 ClickStack 安装到 `otel-demo` 命名空间。该 Helm 图表会部署：

    * 一个 ClickHouse 实例
    * HyperDX
    * ClickStack 版本的 OTel collector
    * 用于存储 HyperDX 应用状态的 MongoDB

    :::note
    您可能需要根据 Kubernetes 集群的配置调整 `storageClassName`。
    :::

    未部署 OTel 演示环境的用户可以修改此设置，选择合适的命名空间。

    ```shell
    helm install my-hyperdx hyperdx/hdx-oss-v2   --set clickhouse.persistence.dataSize=100Gi --set global.storageClassName="standard-rwo" -n otel-demo
    ```

    :::warning 生产环境中的 ClickStack

    此 Chart 还会安装 ClickHouse 和 OTel collector。对于生产环境，建议使用 ClickHouse 和 OTel collector 的 Operator，和/或使用 ClickHouse Cloud。

    要禁用 ClickHouse 和 OTel collector，请设置以下配置项：

    ```shell
    helm install myrelease <chart-name-or-path> --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
    ```

    :::
  </details>

  <details>
    <summary>使用 ClickHouse Cloud</summary>

    如果你更希望使用 ClickHouse Cloud，可以部署 ClickStack 并[禁用内置的 ClickHouse](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud)。

    :::note
    该 chart 当前始终会同时部署 HyperDX 和 MongoDB。虽然这些组件提供了一条替代访问路径，但它们并未与 ClickHouse Cloud 的身份验证机制集成。在此部署模型中，这些组件主要供管理员使用，[用于获取安全摄取密钥](#retrieve-ingestion-api-key)，该密钥是通过已部署的 OTel collector 进行摄取所必需的，但不应向终端用户暴露。
    :::

    ```shell
    # 指定 ClickHouse Cloud 凭据
    export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # 完整的 https 地址
    export CLICKHOUSE_USER=<CLICKHOUSE_USER>
    export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

    helm install my-hyperdx hyperdx/hdx-oss-v2  --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} --set clickhouse.config.users.otelUserName=${CLICKHOUSE_USER} --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD} --set global.storageClassName="standard-rwo" -n otel-demo
    ```
  </details>

  要验证部署状态,请运行以下命令并确认所有组件均处于 `Running` 状态。注意:使用 ClickHouse Cloud 的用户在此列表中不会看到 ClickHouse 组件:

  ```shell
  kubectl get pods -l "app.kubernetes.io/name=hdx-oss-v2" -n otel-demo

  NAME                                                    READY   STATUS    RESTARTS   AGE
  my-hyperdx-hdx-oss-v2-app-78876d79bb-565tb              1/1     Running   0          14m
  my-hyperdx-hdx-oss-v2-clickhouse-57975fcd6-ggnz2        1/1     Running   0          14m
  my-hyperdx-hdx-oss-v2-mongodb-984845f96-czb6m           1/1     Running   0          14m
  my-hyperdx-hdx-oss-v2-otel-collector-64cf698f5c-8s7qj   1/1     Running   0          14m
  ```

  ### 访问 HyperDX UI

  :::note
  即使使用 ClickHouse Cloud,仍需在 Kubernetes 集群中部署本地 HyperDX 实例。该实例提供由 HyperDX 内置的 OpAMP 服务器管理的摄取密钥,用于保护通过已部署的 OTel collector 进行的数据摄取——此功能目前在 ClickHouse Cloud 托管版本中尚不可用。
  :::

  出于安全考虑,该服务使用 `ClusterIP` 类型,默认不对外暴露。

  要访问 HyperDX UI,请将端口 3000 转发到本地端口 8080。

  ```shell
  kubectl port-forward \
   pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
    8080:3000 \
   -n otel-demo
  ```

  访问 [http://localhost:8080](http://localhost:8080) 以访问 HyperDX UI。

  创建用户,提供满足复杂度要求的用户名和密码。

  <Image img={hyperdx_login} alt="HyperDX 界面" size="lg" />

  ### 获取摄取 API 密钥

  通过 ClickStack collector 部署的 OTel collector 的数据摄取由摄取密钥进行保护。

  导航至 [`Team Settings`](http://localhost:8080/team) 并从 `API Keys` 部分复制 `Ingestion API Key`。此 API key 可确保通过 OpenTelemetry collector 摄取的数据是安全的。

  <Image img={copy_api_key} alt="复制 API 密钥" size="lg" />

  ### 创建 API 密钥 Kubernetes Secret

  创建一个新的 Kubernetes secret,其中包含摄取 API key,以及一个 config map,用于存储通过 ClickStack Helm 图表部署的 OTel collector 的位置信息。后续组件将使用这些配置,以便将数据摄取到通过 ClickStack Helm 图表部署的 collector 中:

  ```shell
  # 使用摄取 API key 创建 secret
  kubectl create secret generic hyperdx-secret \
  --from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
  -n otel-demo

  # 创建 ConfigMap 指向上面部署的 ClickStack OTel collector
  kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318
  ```

  重启 OpenTelemetry Demo Application 的 Pod（容器组）以应用摄取 API key。

  ```shell
  kubectl rollout restart deployment -n otel-demo -l app.kubernetes.io/part-of=opentelemetry-demo
  ```

  演示服务的追踪和日志数据现在应开始流入 HyperDX。

  <Image img={hyperdx_kubernetes_data} alt="HyperDX Kubernetes 数据" size="lg" />

  ### 添加 OpenTelemetry Helm 仓库

  为了收集 Kubernetes 指标,我们将部署一个标准的 OTel collector,并配置其使用上述摄取 API key 将数据安全地发送到我们的 ClickStack collector。

  这需要我们安装 OpenTelemetry Helm 仓库:

  ```shell
  # 添加 OTel Helm 仓库
  helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
  ```

  ### 部署 Kubernetes 采集器组件

  要从集群本身和各个节点收集日志和指标,需要部署两个独立的 OpenTelemetry 收集器,每个收集器使用各自的清单文件。所提供的两个清单文件 `k8s_deployment.yaml` 和 `k8s_daemonset.yaml` 协同工作,从 Kubernetes 集群中收集全面的遥测数据。

  * `k8s_deployment.yaml` 会部署一个 **OpenTelemetry Collector 单实例**，负责采集**整个集群范围内的事件和元数据**。它会收集 Kubernetes 事件、集群指标，并使用 pod（容器组）标签和注解来丰富遥测数据。该收集器作为一个独立的部署运行，仅启用一个副本，以避免产生重复数据。

  * `k8s_daemonset.yaml` 部署了一个**基于 DaemonSet 的采集器**，会在集群中的每个节点上运行。它使用 `kubeletstats`、`hostmetrics` 和 Kubernetes Attribute Processor 等组件，收集**节点级和 pod（容器组）级指标**以及容器日志。这些采集器为日志附加元数据，并通过 OTLP exporter 将其发送到 HyperDX。

  这些清单共同实现了集群的全栈可观测性,涵盖从基础设施到应用级别的遥测数据,并将增强后的数据发送到 ClickStack 进行集中分析。

  首先,将收集器安装为 Deployment:

  ```shell
  # 下载清单文件
  curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_deployment.yaml
  # 安装 helm 图表
  helm install --namespace otel-demo k8s-otel-deployment open-telemetry/opentelemetry-collector -f k8s_deployment.yaml
  ```

  <details>
    <summary>k8s&#95;deployment.yaml</summary>

    ```yaml
    # k8s_deployment.yaml
    mode: deployment

    image:
      repository: otel/opentelemetry-collector-contrib
      tag: 0.123.0
     
    # 我们只需要一个收集器实例 - 多个实例会产生重复数据
    replicaCount: 1
     
    presets:
      kubernetesAttributes:
        enabled: true
        # 启用后，处理器将提取关联 pod（容器组）的所有标签并将其添加为资源属性。
        # 标签的确切名称将作为键。
        extractAllPodLabels: true
        # 启用后，处理器将提取关联 pod（容器组）的所有注解并将其添加为资源属性。
        # 注解的确切名称将作为键。
        extractAllPodAnnotations: true
      # 配置收集器以收集 Kubernetes 事件。
      # 将 k8sobject receiver 添加到日志管道，默认收集 Kubernetes 事件。
      # 更多信息：https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver
      kubernetesEvents:
        enabled: true
      # 配置 Kubernetes Cluster Receiver 以收集集群级指标。
      # 将 k8s_cluster receiver 添加到指标管道，并向 ClusterRole 添加必要的规则。
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
            exporters:
              - otlphttp
          metrics:
            exporters:
              - otlphttp
    ```
  </details>

  接下来，将收集器部署为 DaemonSet 守护进程集，用于收集节点和 pod（容器组）级别的指标和日志：

  ```shell
  # 下载清单文件
  curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_daemonset.yaml
  # 安装 helm 图表
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
       
    # 使用 kubeletstats CPU/内存利用率指标的必要配置
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
      # 配置 Kubernetes 处理器以添加 Kubernetes 元数据。
      # 将 k8sattributes 处理器添加到所有管道，并向集群角色添加必要的规则。
      # 更多信息：https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor
      kubernetesAttributes:
        enabled: true
        # 启用后，处理器将提取关联 pod（容器组）的所有标签，并将其作为资源属性添加。
        # 标签的确切名称将作为键。
        extractAllPodLabels: true
        # 启用后，处理器将提取关联 pod（容器组）的所有注解，并将其作为资源属性添加。
        # 注解的确切名称将作为键。
        extractAllPodAnnotations: true
      # 配置收集器从 kubelet 节点代理上的 API 服务器收集节点、pod（容器组）和容器指标。
      # 将 kubeletstats 接收器添加到指标管道，并向集群角色添加必要的规则。
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
      receivers:
        # 配置额外的 kubelet 节点代理指标
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

  ### 在 HyperDX 中探索 Kubernetes 数据

  访问您的 HyperDX UI——可以使用 Kubernetes 部署的实例，或通过 ClickHouse Cloud 访问。

  <p />

  <details>
    <summary>使用 ClickHouse Cloud</summary>

    如果使用 ClickHouse Cloud，只需登录到你的 ClickHouse Cloud 服务，然后在左侧菜单中选择 “HyperDX”。你会被自动完成身份验证，无需创建用户。

    当系统提示你创建数据源时，保留创建数据源对话框中的所有默认值，仅将 Table 字段填写为 `otel_logs`，以创建一个日志数据源。其他所有设置应会被自动检测，你可以直接点击 `Save New Source`。

    <Image force img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX 数据源" size="lg" />

    你还需要为 traces 和 metrics 创建数据源。

    例如，要为 traces 和 OTel metrics 创建数据源，用户可以从顶部菜单中选择 `Create New Source`。

    <Image force img={hyperdx_create_new_source} alt="HyperDX 创建新数据源" size="lg" />

    在这里，选择所需的数据源类型，然后选择相应的表，例如对于 traces，选择表 `otel_traces`。所有设置应会被自动检测。

    <Image force img={hyperdx_create_trace_datasource} alt="HyperDX 创建 trace 数据源" size="lg" />

    :::note 关联来源
    请注意，ClickStack 中的不同数据源——例如日志和 traces——可以彼此关联。要启用这一点，需要在每个数据源上进行额外配置。例如，在日志数据源中，你可以指定对应的 trace 数据源，反之亦然，在 traces 数据源中指定日志数据源。有关更多详细信息，请参阅 “关联来源”。
    :::
  </details>

  <details>
    <summary>使用自托管部署</summary>

    要访问本地部署的 HyperDX，可以在本地执行端口转发命令，然后通过 [http://localhost:8080](http://localhost:8080) 访问 HyperDX。

    ```shell
    kubectl port-forward \
     pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
      8080:3000 \
     -n otel-demo
    ```

    :::note 生产环境中的 ClickStack
    在生产环境中，如果未在 ClickHouse Cloud 中使用 HyperDX，建议使用启用了 TLS 的入口（Ingress）。例如：

    ```shell
    helm upgrade my-hyperdx hyperdx/hdx-oss-v2 \
    --set hyperdx.ingress.enabled=true \
    --set hyperdx.ingress.host=your-domain.com \
    --set hyperdx.ingress.tls.enabled=true
    ```

    ::::
  </details>

  要浏览 Kubernetes 数据,请导航至专用仪表板 `/kubernetes`,例如 [http://localhost:8080/kubernetes](http://localhost:8080/kubernetes)。

  每个选项卡（Pod（容器组）、节点和命名空间）都应显示相应数据。
</VerticalStepper>

<Image img={dashboard_kubernetes} alt="ClickHouse Kubernetes 仪表板" size="lg"/>