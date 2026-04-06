---
slug: /use-cases/observability/clickstack/deployment/helm
title: 'Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 2
description: '通过 Helm 部署 ClickStack - ClickHouse 可观测性堆栈'
doc_type: 'guide'
keywords: ['ClickStack Helm 图表', '通过 Helm 部署 ClickHouse', 'HyperDX Helm 安装', 'Kubernetes 可观测性堆栈', 'ClickStack Kubernetes 部署']
---

import Image from '@theme/IdealImage';
import hyperdx_24 from '@site/static/images/use-cases/observability/hyperdx-24.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import JSONSupport from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

:::warning Chart 版本 2.x
本页面介绍基于子图的 **v2.x** Helm 图表。如果你仍在使用 v1.x 内联模板图表，请参阅 [v1.x Helm 指南](/docs/use-cases/observability/clickstack/deployment/helm-v1)。如需迁移步骤，请参阅 [升级指南](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)。
:::

ClickStack 的 Helm 图表可在[此处](https://github.com/ClickHouse/ClickStack-helm-charts)找到，也是生产环境部署的**推荐**方式。

v2.x 图表采用**两阶段安装**。首先通过 `clickstack-operators` 图表安装 Operator 和 CRD，随后安装主 `clickstack` 图表；该图表会为 ClickHouse、MongoDB 和 OpenTelemetry collector 创建由 Operator 管理的自定义资源。

默认情况下，Helm 图表会预配所有核心组件，包括：

* **ClickHouse** — 由 [ClickHouse Operator](https://clickhouse.com/docs/clickhouse-operator/overview) 通过 `ClickHouseCluster` 和 `KeeperCluster` 自定义资源管理
* **HyperDX** — 可观测性 UI 和 API
* **OpenTelemetry (OTel) collector** — 作为子图通过[官方 OpenTelemetry Collector Helm 图表](https://github.com/open-telemetry/opentelemetry-helm-charts)部署
* **MongoDB** — 由 [MongoDB Kubernetes Operator (MCK)](https://github.com/mongodb/mongodb-kubernetes) 通过 `MongoDBCommunity` 自定义资源管理

不过，也可以轻松自定义该图表，以集成现有的 ClickHouse 部署——例如托管在 **ClickHouse Cloud** 中的部署。

该图表支持 Kubernetes 最佳实践，包括：

* 通过 `values.yaml` 进行环境特定配置
* 资源限制和 pod (容器组) 级扩缩容
* TLS 和入口配置
* Secret 管理和身份验证配置
* 用于与图表一同部署任意 Kubernetes 对象 (NetworkPolicy、HPA、ALB Ingress 等) 的[附加清单](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests)

### 适用场景 \{#suitable-for\}

* 概念验证
* 生产环境

## 部署步骤 \{#deployment-steps\}

<br />

<VerticalStepper headerLevel="h3">
  ### 前提条件 \{#prerequisites\}

  * [Helm](https://helm.sh/) v3+
  * Kubernetes 集群 (推荐使用 v1.20+)
  * 已配置为可与你的集群交互的 `kubectl`

  ### 添加 ClickStack Helm 仓库 \{#add-the-clickstack-helm-repository\}

  添加 ClickStack Helm 仓库：

  ```shell
  helm repo add clickstack https://clickhouse.github.io/ClickStack-helm-charts
  helm repo update
  ```

  ### 安装 Operator \{#install-the-operators\}

  请先安装 Operator Chart。这会注册主 Chart 所需的 CRD：

  ```shell
  helm install clickstack-operators clickstack/clickstack-operators
  ```

  继续之前，请等待 operator 的 Pod (容器组) 全部就绪：

  ```shell
  kubectl get pods -l app.kubernetes.io/instance=clickstack-operators
  ```

  ### 安装 ClickStack \{#installing-clickstack\}

  待各个 operator 均已运行后，安装主 chart：

  ```shell
  helm install my-clickstack clickstack/clickstack
  ```

  ### 验证安装情况 \{#verify-the-installation\}

  验证安装情况：

  ```shell
  kubectl get pods -l "app.kubernetes.io/name=clickstack"
  ```

  当所有 Pod (容器组) 都已就绪后，即可继续。

  ### 端口转发 \{#forward-ports\}

  通过端口转发，我们可以访问并搭建 HyperDX。对于部署到生产环境的用户，建议改为通过入口或负载均衡器公开该服务，以确保适当的网络访问、TLS 终止和可扩展性。端口转发更适合本地开发或一次性的运维和管理任务，不适用于长期运行或高可用环境。

  ```shell
  kubectl port-forward \
    pod/$(kubectl get pod -l app.kubernetes.io/name=clickstack -o jsonpath='{.items[0].metadata.name}') \
    8080:3000
  ```

  :::tip 生产环境入口设置
  对于生产环境部署，请配置带有 TLS 的入口，而不要使用端口转发。有关详细设置说明，请参阅[入口配置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup)。
  :::

  ### 进入 UI \{#navigate-to-the-ui\}

  访问 [http://localhost:8080](http://localhost:8080) 以打开 HyperDX 界面。

  创建用户，并提供符合要求的用户名和密码。

  <Image img={hyperdx_login} alt="HyperDX 界面" size="lg" />

  点击 `Create` 后，系统会为通过 Helm 图表部署的 ClickHouse 实例创建数据源。

  :::note 重写默认连接
  您可以重写与集成 ClickHouse 实例的默认连接。有关详细信息，请参阅[&quot;使用 ClickHouse Cloud&quot;](#using-clickhouse-cloud)。
  :::

  ### 自定义值 (可选) \{#customizing-values\}

  您可以使用 `--set` 标志来自定义设置。例如：

  ```shell
  helm install my-clickstack clickstack/clickstack --set key=value
  ```

  或者，编辑 `values.yaml`。如需获取默认值：

  ```shell
  helm show values clickstack/clickstack > values.yaml
  ```

  示例配置：

  ```yaml
  hyperdx:
    frontendUrl: "https://hyperdx.example.com"

    deployment:
      replicas: 2
      resources:
        limits:
          cpu: "2"
          memory: 4Gi
        requests:
          cpu: 500m
          memory: 1Gi

    ingress:
      enabled: true
      host: hyperdx.example.com
      tls:
        enabled: true
        tlsSecretName: "hyperdx-tls"
  ```

  ```shell
  helm install my-clickstack clickstack/clickstack -f values.yaml
  ```

  ### 使用 Secret (可选) \{#using-secrets\}

  v2.x chart 使用统一的 Secret (`clickstack-secret`) ，其内容来自 values 中的 `hyperdx.secrets`。所有敏感环境变量 (包括 ClickHouse 密码、MongoDB 密码和 HyperDX API 密钥) 都通过这一个 Secret 统一管理。

  要重写 Secret 值：

  ```yaml
  hyperdx:
    secrets:
      HYPERDX_API_KEY: "your-api-key"
      CLICKHOUSE_PASSWORD: "your-clickhouse-password"
      CLICKHOUSE_APP_PASSWORD: "your-app-password"
      MONGODB_PASSWORD: "your-mongodb-password"
  ```

  对于外部 Secret 管理 (例如使用 Secret Operator) ，您可以引用现有的 Kubernetes Secret：

  ```yaml
  hyperdx:
    useExistingConfigSecret: true
    existingConfigSecret: "my-external-secret"
    existingConfigConnectionsKey: "connections.json"
    existingConfigSourcesKey: "sources.json"
  ```

  :::tip API 密钥管理
  有关 API 密钥设置的详细说明 (包括多种配置方法和 pod (容器组) 重启步骤) ，请参阅 [API 密钥设置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration#api-key-setup)。
  :::
</VerticalStepper>

## 使用 ClickHouse Cloud \{#using-clickhouse-cloud\}

如果使用 ClickHouse Cloud，请禁用内置的 ClickHouse 实例，并提供 Cloud 凭据：

```yaml
# values-clickhouse-cloud.yaml
clickhouse:
  enabled: false

hyperdx:
  secrets:
    CLICKHOUSE_PASSWORD: "your-cloud-password"
    CLICKHOUSE_APP_PASSWORD: "your-cloud-password"

  useExistingConfigSecret: true
  existingConfigSecret: "clickhouse-cloud-config"
  existingConfigConnectionsKey: "connections.json"
  existingConfigSourcesKey: "sources.json"
```

单独创建连接 Secret：

```bash
cat <<EOF > connections.json
[
  {
    "name": "ClickHouse Cloud",
    "host": "https://your-cloud-instance.clickhouse.cloud",
    "port": 8443,
    "username": "default",
    "password": "your-cloud-password"
  }
]
EOF

kubectl create secret generic clickhouse-cloud-config \
  --from-file=connections.json=connections.json

rm connections.json
```

```shell
helm install my-clickstack clickstack/clickstack -f values-clickhouse-cloud.yaml
```

:::tip 进阶外部配置
如果是在生产环境中部署，并使用基于 Secret 的配置、外部 OTel collector 或最简设置，请参阅[部署选项指南](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options)。
:::

## 生产环境注意事项 \{#production-notes\}

默认情况下，此 图表 会安装 ClickHouse、MongoDB 和 OTel collector。对于生产环境，建议将 ClickHouse 和 OTel collector 分开管理。

要禁用 ClickHouse 和 OTel collector：

```yaml
clickhouse:
  enabled: false

otel-collector:
  enabled: false
```

:::tip 生产环境最佳实践
对于生产环境部署 (包括高可用性配置、资源管理、入口/TLS 配置以及云平台特定配置 (GKE、EKS、AKS) ) ，请参阅：

* [配置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - 入口、TLS 和密钥管理
* [Cloud 部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - Cloud 特定配置和生产环境检查清单
  :::

## 任务配置 \{#task-configuration\}

默认情况下，图表 配置中包含一个以 CronJob 形式运行的任务，用于检查是否应触发告警。在 v2.x 中，任务配置已移至 `hyperdx.tasks` 下：

| 参数                                    | 说明                                                                                   | 默认值              |
| ------------------------------------- | ------------------------------------------------------------------------------------ | ---------------- |
| `hyperdx.tasks.enabled`               | 启用/禁用集群中的 cron 任务。默认情况下，HyperDX 镜像会在进程内运行 cron 任务。如果你希望在集群中使用独立的 cron 任务，请将其设为 true。 | `false`          |
| `hyperdx.tasks.checkAlerts.schedule`  | check-alerts 任务的 Cron 调度计划                                                           | `*/1 * * * *`    |
| `hyperdx.tasks.checkAlerts.resources` | check-alerts 任务的资源请求和限制                                                              | 参见 `values.yaml` |

## 升级 Helm Chart \{#upgrading-the-chart\}

要升级到新版本：

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

要查看可用的 Chart 版本：

```shell
helm search repo clickstack
```

:::note 从 v1.x 升级
如果您正从 v1.x 的 内联模板图表 升级，请参阅[升级指南](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)了解迁移说明。这是一项破坏性变更——不支持就地执行 `helm upgrade`。
:::

## 卸载 ClickStack \{#uninstalling-clickstack\}

按相反的顺序卸载：

```shell
helm uninstall my-clickstack            # Remove app + CRs first
helm uninstall clickstack-operators     # Remove operators + CRDs
```

**注意：**由 MongoDB 和 ClickHouse Operator 创建的 PersistentVolumeClaim **不会**在执行 `helm uninstall` 时被删除。这是有意为之，旨在防止意外数据丢失。要清理 PVC，请参阅：

* [MongoDB Kubernetes Operator 文档](https://github.com/mongodb/mongodb-kubernetes/tree/master/docs/mongodbcommunity)
* [ClickHouse Operator 清理文档](https://clickhouse.com/docs/clickhouse-operator/managing-clusters/cleanup)

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

:::tip 其他故障排查资源
对于入口相关问题、TLS 问题或 Cloud 部署故障排查，请参阅：

* [入口故障排查](/docs/use-cases/observability/clickstack/deployment/helm-configuration#troubleshooting-ingress) - 静态资源提供、路径重写、浏览器问题
* [Cloud 部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud#loadbalancer-dns-resolution-issue) - GKE OpAMP 问题和 Cloud 特定问题
  :::

<JSONSupport />

您可以通过 `values.yaml` 中的 `hyperdx.config` 设置这些环境变量：

```yaml
hyperdx:
  config:
    BETA_CH_OTEL_JSON_SCHEMA_ENABLED: "true"
    OTEL_AGENT_FEATURE_GATE_ARG: "--feature-gates=clickhouse.json"
```

或者通过 `--set`：

```shell
helm install my-clickstack clickstack/clickstack \
  --set "hyperdx.config.BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true" \
  --set "hyperdx.config.OTEL_AGENT_FEATURE_GATE_ARG=--feature-gates=clickhouse.json"
```

## 相关文档 \{#related-documentation\}

### 部署指南 \{#deployment-guides\}

* [部署选项](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部 ClickHouse、OTel collector 和最简部署
* [配置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API 密钥、Secret 和入口设置
* [Cloud 部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS、AKS 配置和生产环境最佳实践
* [升级指南](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - 从 v1.x 迁移到 v2.x
* [附加清单](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) - 随图表一同部署自定义 Kubernetes 对象

### v1.x 文档 \{#v1x-documentation\}

* [Helm (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-v1) - v1.x 部署指南
* [配置 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - v1.x 配置
* [部署选项 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1) - v1.x 部署选项
* [Cloud 部署 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - v1.x Cloud 配置

### 更多资源 \{#additional-resources\}

* [ClickStack 入门指南](/use-cases/observability/clickstack/getting-started) - ClickStack 简介
* [ClickStack Helm 图表代码仓库](https://github.com/ClickHouse/ClickStack-helm-charts) - 图表源代码及 values 参考
* [Kubernetes 文档](https://kubernetes.io/docs/) - Kubernetes 参考
* [Helm 文档](https://helm.sh/docs/) - Helm 参考