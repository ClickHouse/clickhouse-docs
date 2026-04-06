---
slug: /use-cases/observability/clickstack/deployment/helm-v1
title: 'Helm（v1.x）'
pagination_prev: null
pagination_next: null
sidebar_position: 10
description: '使用 v1.x 内联模板 Helm 图表部署 ClickStack'
doc_type: 'guide'
keywords: ['ClickStack Helm 图表', 'Helm ClickHouse 部署', 'HyperDX Helm 安装', 'Kubernetes 可观测性堆栈', 'ClickStack Kubernetes 部署']
---

import Image from '@theme/IdealImage';
import hyperdx_24 from '@site/static/images/use-cases/observability/hyperdx-24.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import JSONSupport from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

:::warning 已弃用 — v1.x 图表
本页面介绍 **v1.x** 内联模板 Helm 图表。该图表目前处于维护模式，不会再增加新功能。对于新部署，请使用 [v2.x 图表](/docs/use-cases/observability/clickstack/deployment/helm)。如需迁移现有的 v1.x 部署，请参阅 [升级指南](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)。
:::

ClickStack 的 helm 图表可在[这里](https://github.com/ClickHouse/ClickStack-helm-charts)找到，并且是生产环境部署的**推荐**方式。

默认情况下，Helm 图表会部署所有核心组件，包括：

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel collector)**
* **MongoDB** (用于持久化应用状态)

不过，它也可以轻松自定义，以集成现有的 ClickHouse 部署，例如托管在 **ClickHouse Cloud** 中的部署。

该图表支持 Kubernetes 的标准最佳实践，包括：

* 通过 `values.yaml` 提供针对不同环境的配置
* 资源限制和 pod (容器组) 级别的伸缩
* TLS 和入口配置
* Secret 管理和身份验证配置

### 适用场景 \{#suitable-for\}

* 概念验证
* 生产环境

## 部署步骤 \{#deployment-steps\}

<br />

<VerticalStepper headerLevel="h3">
  ### 前提条件 \{#prerequisites\}

  * [Helm](https://helm.sh/) v3+
  * Kubernetes 集群 (推荐 v1.20+)
  * 已配置为可与集群交互的 `kubectl`

  ### 添加 ClickStack Helm 仓库 \{#add-the-clickstack-helm-repository\}

  添加 ClickStack Helm 仓库：

  ```shell
  helm repo add clickstack https://clickhouse.github.io/ClickStack-helm-charts
  helm repo update
  ```

  ### 安装 ClickStack \{#installing-clickstack\}

  要使用默认值安装 ClickStack Chart：

  ```shell
  helm install my-clickstack clickstack/clickstack
  ```

  ### 验证安装 \{#verify-the-installation\}

  验证安装：

  ```shell
  kubectl get pods -l "app.kubernetes.io/name=clickstack"
  ```

  当所有 Pod (容器组) 都已就绪后，继续下一步。

  ### 端口转发 \{#forward-ports\}

  通过端口转发，我们可以访问并搭建 HyperDX。对于部署到生产环境的用户，应改为通过入口或负载均衡器暴露服务，以确保正确的网络访问、TLS 终止和可扩展性。端口转发更适合本地开发或一次性的运维和管理任务，不适用于长期运行或高可用环境。

  ```shell
  kubectl port-forward \
    pod/$(kubectl get pod -l app.kubernetes.io/name=clickstack -o jsonpath='{.items[0].metadata.name}') \
    8080:3000
  ```

  :::tip 生产环境入口设置
  对于生产环境部署，请配置启用 TLS 的入口，而不要使用端口转发。有关详细设置说明，请参阅[入口配置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1#ingress-setup)。
  :::

  ### 进入界面 \{#navigate-to-the-ui\}

  访问 [http://localhost:8080](http://localhost:8080) 以打开 HyperDX 界面。

  创建用户，并提供符合要求的用户名和密码。

  <Image img={hyperdx_login} alt="HyperDX 界面" size="lg" />

  点击 `Create` 后，将为通过 Helm 图表部署的 ClickHouse 实例创建数据源。

  :::note 重写默认连接
  您可以重写连接到集成 ClickHouse 实例的默认连接配置。有关详细信息，请参阅[&quot;使用 ClickHouse Cloud&quot;](#using-clickhouse-cloud)。
  :::

  ### 自定义值 (可选) \{#customizing-values\}

  您可以使用 `--set` 标志来自定义设置。例如：

  ```shell
  helm install my-clickstack clickstack/clickstack --set key=value
  ```

  或者，直接编辑 `values.yaml`。如需获取默认值：

  ```shell
  helm show values clickstack/clickstack > values.yaml
  ```

  配置示例：

  ```yaml
  replicaCount: 2
  resources:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 250m
      memory: 256Mi
  ingress:
    enabled: true
    annotations:
      kubernetes.io/ingress.class: nginx
    hosts:
      - host: hyperdx.example.com
        paths:
          - path: /
            pathType: ImplementationSpecific
  ```

  ```shell
  helm install my-clickstack clickstack/clickstack -f values.yaml
  ```

  ### 使用 Secret (可选) \{#using-secrets\}

  如需处理 API 密钥或数据库凭据等敏感数据，请使用 Kubernetes Secret。HyperDX Helm 图表提供了默认的 Secret 文件，您可以根据需要修改并将其应用到集群中。

  #### 使用预配置的 Secret \{#using-pre-configured-secrets\}

  Helm 图表包含一个默认的 Secret 模板，位于 [`charts/clickstack/templates/secrets.yaml`](https://github.com/ClickHouse/ClickStack-helm-charts/blob/main/charts/clickstack/templates/secrets.yaml)。此文件提供了管理 Secret 的基础结构。

  如果您需要手动应用 Secret，请修改并应用提供的 `secrets.yaml` 模板：

  ```yaml
  apiVersion: v1
  kind: Secret
  metadata:
    name: hyperdx-secret
    annotations:
      "helm.sh/resource-policy": keep
  type: Opaque
  data:
    API_KEY: <base64-encoded-api-key>
  ```

  将该 Secret 应用到集群中：

  ```shell
  kubectl apply -f secrets.yaml
  ```

  #### 创建自定义 Secret \{#creating-a-custom-secret\}

  如果您愿意，也可以手动创建自定义 Kubernetes Secret：

  ```shell
  kubectl create secret generic hyperdx-secret \
    --from-literal=API_KEY=my-secret-api-key
  ```

  #### 引用 Secret \{#referencing-a-secret\}

  要在 `values.yaml` 中引用 Secret：

  ```yaml
  hyperdx:
    apiKey:
      valueFrom:
        secretKeyRef:
          name: hyperdx-secret
          key: API_KEY
  ```

  :::tip API 密钥管理
  有关 API 密钥设置的详细说明 (包括多种配置方法和 pod (容器组) 重启步骤) ，请参阅 [API 密钥设置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1#api-key-setup)。
  :::
</VerticalStepper>

## ClickHouse Cloud 的使用 \{#using-clickhouse-cloud\}

如果使用 ClickHouse Cloud，请禁用通过 Helm 图表部署的 ClickHouse 实例，并指定 ClickHouse Cloud 凭据：

```shell
# specify ClickHouse Cloud credentials
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # full https url
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

# how to overwrite default connection
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} \
  --set clickhouse.config.users.otelUser=${CLICKHOUSE_USER} \
  --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD}
```

或者，使用 `values.yaml` 文件：

```yaml
clickhouse:
  enabled: false
  persistence:
    enabled: false
  config:
    users:
      otelUser: ${CLICKHOUSE_USER}
      otelUserPassword: ${CLICKHOUSE_PASSWORD}

otel:
  clickhouseEndpoint: ${CLICKHOUSE_URL}

hyperdx:
  defaultConnections: |
    [
      {
        "name": "External ClickHouse",
        "host": "http://your-clickhouse-server:8123",
        "port": 8123,
        "username": "your-username",
        "password": "your-password"
      }
    ]
```

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
# or if installed...
# helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

:::tip 进阶外部配置
对于采用基于 Secret 的配置、外部 OTel collector 或精简部署的生产环境，请参阅[部署选项指南](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1)。
:::

## 生产环境说明 \{#production-notes\}

默认情况下，此 图表 还会安装 ClickHouse 和 OTel collector。不过，在生产环境中，建议分别管理 ClickHouse 和 OTel collector。

要禁用 ClickHouse 和 OTel collector，请设置以下值：

```shell
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.enabled=false
```

:::tip 生产环境最佳实践
对于生产环境部署 (包括高可用配置、资源管理、入口/TLS 配置以及 Cloud 特定配置，如 GKE、EKS、AKS) ，请参阅：

* [配置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - 入口、TLS 及密钥管理
* [Cloud 部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - Cloud 特定设置和生产环境检查清单
  :::

## 任务配置 \{#task-configuration\}

默认情况下，图表配置中有一个以 CronJob 形式运行的任务，负责检查是否应触发告警。以下是其配置选项：

| 参数                            | 说明                                                                                   | 默认值              |
| ----------------------------- | ------------------------------------------------------------------------------------ | ---------------- |
| `tasks.enabled`               | 在集群中启用/禁用 cron 任务。默认情况下，HyperDX 镜像会在进程内运行 cron 任务。如果你希望在集群中使用单独的 cron 任务，请将其设为 true。 | `false`          |
| `tasks.checkAlerts.schedule`  | `check-alerts` 任务的 Cron 调度计划                                                         | `*/1 * * * *`    |
| `tasks.checkAlerts.resources` | `check-alerts` 任务的资源请求和限制                                                            | 参见 `values.yaml` |

## 升级 图表 \{#upgrading-the-chart\}

要升级到新版本：

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

要查看可用的 图表 版本：

```shell
helm search repo clickstack
```

:::note 升级到 v2.x
如果要迁移到基于 v2.x 子图表 的图表，请参阅[升级指南](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)获取迁移说明。这是一项破坏性变更，不支持原地执行 `helm upgrade`。
:::

## 卸载 ClickStack \{#uninstalling-clickstack\}

删除该部署：

```shell
helm uninstall my-clickstack
```

这会删除与该发布相关的所有资源，但持久化数据 (如有) 可能仍会保留。

## 故障排查 \{#troubleshooting\}

### 查看日志 \{#checking-logs\}

```shell
kubectl logs -l app.kubernetes.io/name=clickstack
```

### 调试安装失败 \{#debugging-a-failed-install\}

```shell
helm install my-clickstack clickstack/clickstack --debug --dry-run
```

### 验证部署 \{#verifying-deployment\}

```shell
kubectl get pods -l app.kubernetes.io/name=clickstack
```

:::tip 更多故障排查资源
对于入口相关问题、TLS 问题或云部署故障排查，请参阅：

* [入口故障排查](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1#troubleshooting-ingress) - 静态资源服务、路径重写、浏览器问题
* [Cloud 部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1#loadbalancer-dns-resolution-issue) - GKE OpAMP 问题和 Cloud 特有问题
  :::

<JSONSupport />

您可以通过参数或 `values.yaml` 设置这些环境变量，例如：

*values.yaml*

```yaml
hyperdx:
  ...
  env:
    - name: BETA_CH_OTEL_JSON_SCHEMA_ENABLED
      value: "true"

otel:
  ...
  env:
    - name: OTEL_AGENT_FEATURE_GATE_ARG
      value: "--feature-gates=clickhouse.json"
```

或使用 `--set`：

```shell
helm install my-clickstack clickstack/clickstack \
  --set "hyperdx.env[0].name=BETA_CH_OTEL_JSON_SCHEMA_ENABLED" \
  --set "hyperdx.env[0].value=true" \
  --set "otel.env[0].name=OTEL_AGENT_FEATURE_GATE_ARG" \
  --set "otel.env[0].value=--feature-gates=clickhouse.json"
```

## 相关文档 \{#related-documentation\}

### v1.x 部署指南 \{#deployment-guides\}

* [部署选项 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1) - 外部 ClickHouse、OTel collector 和精简部署
* [配置指南 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - API 密钥、Secrets 和入口配置
* [Cloud 部署 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - GKE、EKS、AKS 配置和生产环境最佳实践

### v2.x 文档 \{#v2x-documentation\}

* [Helm (v2.x)](/docs/use-cases/observability/clickstack/deployment/helm) - v2.x 部署指南
* [升级指南](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - 从 v1.x 升级到 v2.x

### 更多资源 \{#additional-resources\}

* [ClickStack 入门指南](/use-cases/observability/clickstack/getting-started) - ClickStack 简介
* [ClickStack Helm 图表代码仓库](https://github.com/ClickHouse/ClickStack-helm-charts) - 图表源码和 values 参考
* [Kubernetes 文档](https://kubernetes.io/docs/) - Kubernetes 参考文档
* [Helm 文档](https://helm.sh/docs/) - Helm 参考文档