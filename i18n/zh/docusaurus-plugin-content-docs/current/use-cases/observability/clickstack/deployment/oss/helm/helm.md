---
slug: /use-cases/observability/clickstack/deployment/helm
title: 'Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 2
description: '使用 Helm 部署 ClickStack - ClickHouse 可观测性栈'
doc_type: 'guide'
keywords: ['ClickStack Helm 图表', '使用 Helm 部署 ClickHouse', '使用 Helm 安装 HyperDX', 'Kubernetes 可观测性栈', '在 Kubernetes 上部署 ClickStack']
---

import Image from '@theme/IdealImage';
import hyperdx_24 from '@site/static/images/use-cases/observability/hyperdx-24.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import JSONSupport from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

:::warning 图表迁移
如果您当前正在使用 `hdx-oss-v2` Helm 图表，请迁移到 `clickstack` Helm 图表。`hdx-oss-v2` 图表目前处于维护模式，将不再增加新功能。所有后续开发都集中在 `clickstack` 图表上，它在提供相同功能的同时改进了命名并具有更好的组织结构。
:::

ClickStack 的 Helm 图表可以在[这里](https://github.com/ClickHouse/ClickStack-helm-charts)找到，是生产环境部署的**推荐**方式。

默认情况下，该 Helm 图表会部署所有核心组件，包括：

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB**（用于持久化应用程序状态）

不过，您可以轻松自定义它，以集成到现有的 ClickHouse 部署中——例如托管在 **ClickHouse Cloud** 上的部署。

该图表支持标准的 Kubernetes 最佳实践，包括：

* 通过 `values.yaml` 进行按环境的配置
* 资源限制和 pod（容器组）级别的伸缩
* TLS 和入口配置
* Secret 管理和认证配置


### 适用场景 \{#suitable-for\}

* 概念验证
* 生产环境

## 部署步骤 \{#deployment-steps\}

<br/>

<VerticalStepper headerLevel="h3">
  ### 前提条件

  * [Helm](https://helm.sh/) v3+
  * Kubernetes 集群（推荐使用 v1.20 及以上版本）
  * 已配置好的 `kubectl`，用于与集群交互

  ### 添加 ClickStack Helm 仓库

  添加 ClickStack Helm 仓库：

  ```shell
  helm repo add clickstack https://clickhouse.github.io/ClickStack-helm-charts
  helm repo update
  ```

  ### 安装 ClickStack

  使用默认值安装 ClickStack chart:

  ```shell
  helm install my-clickstack clickstack/clickstack
  ```

  ### 验证安装

  验证安装:

  ```shell
  kubectl get pods -l "app.kubernetes.io/name=clickstack"
  ```

  当所有 Pod（容器组）就绪后，继续执行后续步骤。

  ### 端口转发

  端口转发允许我们访问和配置 HyperDX。在生产环境中部署时,用户应改为通过入口或负载均衡器暴露服务,以确保正确的网络访问、TLS 终止和可扩展性。端口转发最适合用于本地开发或一次性管理任务,不适用于长期运行或高可用性环境。

  ```shell
  kubectl port-forward \
    pod/$(kubectl get pod -l app.kubernetes.io/name=clickstack -o jsonpath='{.items[0].metadata.name}') \
    8080:3000
  ```

  :::tip 生产环境入口配置
  在生产环境部署时,应配置带 TLS 的入口,而非使用端口转发。详细配置说明请参阅[入口配置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup)。
  :::

  ### 访问 UI 界面

  访问 [http://localhost:8080](http://localhost:8080) 以访问 HyperDX UI。

  创建用户,提供满足要求的用户名和密码。

  <Image img={hyperdx_login} alt="HyperDX 界面" size="lg" />

  点击 `Create` 后,将为使用 Helm 图表部署的 ClickHouse 实例创建数据源。

  :::note 覆盖默认连接
  您可以覆盖集成 ClickHouse 实例的默认连接。详情请参阅[&quot;使用 ClickHouse Cloud&quot;](#using-clickhouse-cloud)。
  :::

  ### 自定义配置值(可选)

  您可以通过 `--set` 标志自定义设置。例如:

  ```shell
  helm install my-clickstack clickstack/clickstack --set key=value
  ```

  或者,编辑 `values.yaml` 文件。获取默认值的方法如下:

  ```shell
  helm show values clickstack/clickstack > values.yaml
  ```

  示例配置:

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

  ### 使用 Secret(可选)

  处理 API 密钥或数据库凭据等敏感数据时,请使用 Kubernetes secrets。HyperDX Helm 图表提供了默认的 secret 文件,您可以修改并应用到您的集群。

  #### 使用预配置的 Secret

  该 Helm 图表包含一个默认的 secret 模板,位于 [`charts/clickstack/templates/secrets.yaml`](https://github.com/ClickHouse/ClickStack-helm-charts/blob/main/charts/clickstack/templates/secrets.yaml)。该文件提供了管理 secret 的基础结构。

  如果需要手动应用 secret,请修改并应用提供的 `secrets.yaml` 模板:

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

  将 Secret 应用到集群:

  ```shell
  kubectl apply -f secrets.yaml
  ```

  #### 创建自定义 Secret

  如果您希望手动创建自定义 Kubernetes Secret,可以执行以下操作:

  ```shell
  kubectl create secret generic hyperdx-secret \
    --from-literal=API_KEY=my-secret-api-key
  ```

  #### 引用 Secret

  在 `values.yaml` 中引用 Secret:

  ```yaml
  hyperdx:
    apiKey:
      valueFrom:
        secretKeyRef:
          name: hyperdx-secret
          key: API_KEY
  ```

  :::tip API 密钥管理
  有关 API 密钥设置的详细说明,包括多种配置方法和 pod(容器组)重启步骤,请参阅 [API 密钥设置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration#api-key-setup)。
  :::
</VerticalStepper>

## 使用 ClickHouse Cloud

如果使用 ClickHouse Cloud，应禁用通过 Helm 图表部署的 ClickHouse 实例，并配置 Cloud 凭据：

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

或者使用 `values.yaml` 文件：

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

:::tip 高级外部配置
对于在生产环境中使用基于 Secret 的配置、外部 OTel collector 或最小化部署方案的情况，请参阅 [Deployment Options 指南](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options)。
:::


## 生产环境注意事项

默认情况下，该 chart 也会安装 ClickHouse 和 OTel collector。但在生产环境中，建议分别管理 ClickHouse 和 OTel collector。

要禁用 ClickHouse 和 OTel collector，请设置以下参数：

```shell
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.enabled=false
```

:::tip 生产环境最佳实践
对于包括高可用配置、资源管理、入口/TLS 设置以及特定 Cloud 提供商（GKE、EKS、AKS）相关配置在内的生产环境部署，请参见：

* [Configuration Guide](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - 入口、TLS 与 Secret 管理
* [Cloud Deployments](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - Cloud 专用设置与生产环境检查清单
  :::


## 任务配置 {#task-configuration}

默认情况下，chart 中配置了一个以 cronjob 形式运行的任务，用于检查是否需要触发告警。其配置选项如下：

| Parameter | Description | Default |
|-----------|-------------|---------|
| `tasks.enabled` | 在集群中启用/禁用 cron 任务。默认情况下，HyperDX 镜像会在进程内运行 cron 任务。如果你更希望在集群中使用单独的 cron 任务，请将其设置为 true。 | `false` |
| `tasks.checkAlerts.schedule` | `check-alerts` 任务的 cron 调度计划 | `*/1 * * * *` |
| `tasks.checkAlerts.resources` | `check-alerts` 任务的资源请求和限制（requests 和 limits） | 参见 `values.yaml` |

## 升级 chart

要升级到较新的版本：

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

要查看可用的 chart 版本：

```shell
helm search repo clickstack
```


## 卸载 ClickStack

要移除该部署：

```shell
helm uninstall my-clickstack
```

这将删除与该发布相关的所有资源，但持久化数据（如果有）可能会保留。


## 故障排查 {#troubleshooting}

### 查看日志 \{#customizing-values\}

```shell
kubectl logs -l app.kubernetes.io/name=clickstack
```


### 排查安装失败问题 \{#using-secrets\}

```shell
helm install my-clickstack clickstack/clickstack --debug --dry-run
```


### 验证部署

```shell
kubectl get pods -l app.kubernetes.io/name=clickstack
```

:::tip 其他故障排查资源
对于 Ingress 相关问题、TLS 问题或 Cloud 部署的故障排查，请参阅：

* [Ingress 故障排查](/docs/use-cases/observability/clickstack/deployment/helm-configuration#troubleshooting-ingress) - 资源服务、路径重写、浏览器相关问题
* [Cloud 部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud#loadbalancer-dns-resolution-issue) - GKE OpAMP 问题和特定于 Cloud 的问题
  :::

<JSONSupport />

你可以通过参数或 `values.yaml` 来设置这些环境变量，例如：

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


## 相关文档 {#related-documentation}

### 部署指南 {#deployment-guides}

- [部署选项](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部 ClickHouse、OTel collector 与最小化部署
- [配置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API 密钥、机密信息和入口（Ingress）配置
- [Cloud 部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS、AKS 配置及生产环境最佳实践

### 其他资源 {#additional-resources}

- [ClickStack 入门指南](/docs/use-cases/observability/clickstack/getting-started/index) - ClickStack 简介
- [ClickStack Helm 图表仓库](https://github.com/ClickHouse/ClickStack-helm-charts) - 图表源代码与 values 配置参考
- [Kubernetes 文档](https://kubernetes.io/docs/) - Kubernetes 参考
- [Helm 文档](https://helm.sh/docs/) - Helm 参考