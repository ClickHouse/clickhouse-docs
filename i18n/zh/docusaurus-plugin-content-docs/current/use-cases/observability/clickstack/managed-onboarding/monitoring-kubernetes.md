---
slug: /use-cases/observability/clickstack/monitoring-kubernetes
title: '监控 Kubernetes'
description: '将 Kubernetes 集群中的日志、基础设施指标和事件采集到托管 ClickStack 中'
doc_type: 'guide'
keywords: ['clickstack', 'kubernetes', 'k8s', '托管', '可观测性', '日志', '指标', '事件', 'daemonset', 'helm']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

import Image from '@theme/IdealImage';
import clickstack_cloud from '@site/static/images/use-cases/observability/clickstack-cloud-v2.png';
import clickstack_search_with_k8_logs from '@site/static/images/use-cases/observability/clickstack-search-with-k8-logs.png';
import clickstack_dashboard_kubernetes from '@site/static/images/use-cases/observability/clickstack-dashboard-kubernetes.png';

本指南将指导你把集群中的日志、基础设施指标和 Kubernetes 事件收集到托管 ClickStack 中，然后在内置的 Kubernetes 仪表板中查看它们。

这种模式遵循标准的 OpenTelemetry 部署方式：通过 [OpenTelemetry Helm 图表](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector) 部署两个 collector，并分别通过 OTLP 转发到你的 ClickStack gateway collector。一个 **DaemonSet 守护进程集** 运行在每个节点上，用于收集容器日志和 kubelet 节点代理指标。一个单副本的 **部署** 用于收集 Kubernetes 事件和整个集群范围的指标。有关 gateway 角色的背景说明，请参阅 [Collector roles](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)。

本指南假定你已完成 [设置 OpenTelemetry Collector](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector)，并且已有一个正在运行的 ClickStack gateway collector。

对于运行在 Kubernetes 中的工作负载，gateway collector 本身应当**使用上游 OpenTelemetry Helm 图表和 ClickStack collector 镜像部署在同一个集群内**。请按照 [部署 collector](/use-cases/observability/clickstack/ingesting-data/otel-collector#configuring-the-collector) 中的 Helm 路径进行安装。**请确保已记录此 OTLP 端点**。

<VerticalStepper headerLevel="h2">
  ## 准备前置条件 \{#gather-prerequisites\}

  您需要：

  * 一个 **Kubernetes 集群** (建议使用 v1.20+) ，并已配置好可连接该集群的 `kubectl`。
  * **[Helm](https://helm.sh/) v3+**。
  * 你的 ClickStack gateway collector 的**OTLP 端点**，且该端点应可从集群内部访问，例如 `http://clickstack-otel-collector.observability.svc.cluster.local:4318`。collector 应部署在你的 DaemonSet 守护进程集和部署都能访问到的位置，通常是在同一集群中，或通过 `LoadBalancer` 类型的 Service 暴露。
  * 在部署网关收集器时设置的 `OTLP_AUTH_TOKEN` 值。如果你没有为收集器启用安全防护，则可以跳过下面的 Secret 步骤，并从清单中移除 `authorization` 请求头。

  :::note Gateway 的运行位置
  对于集群内部署，请将 gateway collector 作为 Kubernetes `Deployment` 或 `StatefulSet` 运行在同一集群中，并通过集群内 service DNS 进行访问。对于运行在集群外部的 gateway，请使用其可从外部访问的 URL。
  :::

  ## 创建认证 Secret 和 ConfigMap \{#create-secret-and-configmap\}

  选择您希望 collector 所在的命名空间，然后创建一个包含 `OTLP_AUTH_TOKEN` 的 Secret 以及一个指向 gateway 的 ConfigMap：

  ```shell
  export OTLP_AUTH_TOKEN="a-strong-shared-secret"
  export OTEL_COLLECTOR_ENDPOINT="http://clickstack-otel-collector.observability.svc.cluster.local:4318"
  export NAMESPACE=observability

  kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

  kubectl create secret generic clickstack-otlp-secret \
    --from-literal=OTLP_AUTH_TOKEN=${OTLP_AUTH_TOKEN} \
    -n ${NAMESPACE}

  kubectl create configmap otel-config-vars \
    --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=${OTEL_COLLECTOR_ENDPOINT} \
    -n ${NAMESPACE}
  ```

  下面两个 collector 均通过 `extraEnvs` 读取这些值，因此它们共用同一个 Secret 和 ConfigMap。

  ## 添加 OpenTelemetry Helm 仓库 \{#add-otel-helm-repo\}

  ```shell
  helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
  helm repo update
  ```

  ## 部署集群采集器 \{#deploy-cluster-collector\}

  这是一个单副本部署，用于采集 **Kubernetes 事件**和**集群级指标** (节点数量、pod (容器组)  阶段、部署状态等) 。运行多个副本会产生重复数据。

  将以下内容保存为 `k8s_deployment.yaml`：

  <details>
    <summary>`k8s_deployment.yaml`</summary>

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
        extractAllPodLabels: true
        extractAllPodAnnotations: true
      # Collects Kubernetes events via the k8sobject receiver.
      kubernetesEvents:
        enabled: true
      # Collects cluster-level metrics via the k8s_cluster receiver.
      clusterMetrics:
        enabled: true

    extraEnvs:
      - name: OTLP_AUTH_TOKEN
        valueFrom:
          secretKeyRef:
            name: clickstack-otlp-secret
            key: OTLP_AUTH_TOKEN
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
            authorization: "${env:OTLP_AUTH_TOKEN}"
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

  安装：

  ```shell
  helm install k8s-otel-deployment open-telemetry/opentelemetry-collector \
    -f k8s_deployment.yaml \
    -n ${NAMESPACE}
  ```

  ## 部署节点 collector \{#deploy-node-collector\}

  这是一个在每个节点上运行的 DaemonSet 守护进程集，用于采集**容器日志**、**主机指标**和 **kubelet 节点代理指标** (各 pod (容器组) 和各容器相对于请求值与限制值的 CPU 及内存使用率) 。

  将以下内容保存为 `k8s_daemonset.yaml`：

  <details>
    <summary>`k8s_daemonset.yaml`</summary>

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
      kubernetesAttributes:
        enabled: true
        extractAllPodLabels: true
        extractAllPodAnnotations: true
      kubeletMetrics:
        enabled: true

    extraEnvs:
      - name: OTLP_AUTH_TOKEN
        valueFrom:
          secretKeyRef:
            name: clickstack-otlp-secret
            key: OTLP_AUTH_TOKEN
            optional: true
      - name: YOUR_OTEL_COLLECTOR_ENDPOINT
        valueFrom:
          configMapKeyRef:
            name: otel-config-vars
            key: YOUR_OTEL_COLLECTOR_ENDPOINT

    config:
      receivers:
        # Additional kubelet metrics expressed as utilisation against requests and limits.
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
            authorization: "${env:OTLP_AUTH_TOKEN}"

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

  安装：

  ```shell
  helm install k8s-otel-daemonset open-telemetry/opentelemetry-collector \
    -f k8s_daemonset.yaml \
    -n ${NAMESPACE}
  ```

  确认两个 release 均处于健康状态：

  ```shell
  kubectl get pods -n ${NAMESPACE} -l app.kubernetes.io/name=opentelemetry-collector
  ```

  您应该看到每个节点上有一个部署 (Deployment) pod (容器组) 和一个 DaemonSet 守护进程集 pod (容器组) ，所有 pod (容器组) 均处于 `Running` 状态。

  ## 将 Kubernetes 属性转发至您的应用 (推荐) \{#forward-k8s-attributes\}

  要将应用程序的日志、指标和链路追踪与 Kubernetes 元数据 (pod (容器组) 名称、命名空间、节点、部署) 关联，请通过 `OTEL_RESOURCE_ATTRIBUTES` 将元数据注入您的应用程序。DaemonSet 守护进程集的 `k8sattributes` 处理器随后会使用匹配的 pod (容器组) 和节点属性，对传入的遥测数据进行补全丰富。

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
          service.name: <MY_APP_NAME>
      spec:
        containers:
          - name: app-container
            image: my-image
            env:
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
              - name: OTEL_RESOURCE_ATTRIBUTES
                value: k8s.pod.name=$(POD_NAME),k8s.pod.uid=$(POD_UID),k8s.namespace.name=$(POD_NAMESPACE),k8s.node.name=$(NODE_NAME),k8s.deployment.name=$(DEPLOYMENT_NAME)
  ```

  ## 在 ClickStack 界面中确认 \{#confirm-in-ui\}

  在 [ClickHouse Cloud 控制台](https://console.clickhouse.cloud) 中打开您的服务，然后从左侧菜单选择 **ClickStack**。

  <Image img={clickstack_cloud} size="lg" alt="启动 ClickStack" border />

  在 **Search** 视图中，将数据源切换为 `Logs`，并将时间范围设置为 **Last 15 minutes**。集群各节点的容器日志应在数秒内出现，并附带 `k8s.namespace.name`、`k8s.pod.name` 和 `k8s.node.name` 等属性。

  <Image img={clickstack_search_with_k8_logs} size="lg" alt="显示 Kubernetes 日志的 ClickStack 搜索视图" />

  要查看基础设施指标和事件，请依次点击 **仪表盘** -&gt; **Kubernetes**，打开内置的 **Kubernetes** 仪表盘。`Pods`、`Nodes` 和 `Namespaces` 标签页中均应已有数据。

  <Image img={clickstack_dashboard_kubernetes} size="lg" alt="ClickStack Kubernetes 仪表盘" border />

  如果没有任何内容显示：

  * 确认 DaemonSet 守护进程集和部署对应的 Pod (容器组) 处于 `Running` 状态，并使用 `kubectl logs -n ${NAMESPACE} <pod>` 持续查看其日志。
  * 确认从集群内部可以访问 `YOUR_OTEL_COLLECTOR_ENDPOINT` (使用 `kubectl exec` 进入其中一个采集器 Pod (容器组) ，然后用 `curl` 访问该端点) 。
  * 检查 secret 中的 `OTLP_AUTH_TOKEN` 是否与网关 collector 中设置的值一致。

  ## 延伸阅读 \{#further-reading\}

  * 有关完整的接收器、处理器和调优选项，请参阅 [Kubernetes 集成参考](/use-cases/observability/clickstack/integrations/kubernetes)。
  * 有关应用侧富集的更多信息，请参阅[将资源标签转发到 Pod (容器组) ](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods)。
  * [保护收集器](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector)，可在 OTLP 端点启用 TLS，并使用最小权限的摄取用户。
  * [资源估算](/use-cases/observability/clickstack/ingesting-data/otel-collector#estimating-resources)，用于估算 gateway 和 agent 部署在预期吞吐量下所需的资源。
  * [投入生产环境](/use-cases/observability/clickstack/production)以获取生产部署建议。
</VerticalStepper>