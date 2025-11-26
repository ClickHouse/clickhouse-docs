---
slug: /use-cases/observability/clickstack/deployment/helm
title: 'Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 2
description: '使用 Helm 部署 ClickStack —— ClickHouse 可观测性栈'
doc_type: 'guide'
keywords: ['ClickStack Helm 图表', '使用 Helm 部署 ClickHouse', '通过 Helm 安装 HyperDX', 'Kubernetes 可观测性栈', 'ClickStack Kubernetes 部署']
---

import Image from '@theme/IdealImage';
import hyperdx_24 from '@site/static/images/use-cases/observability/hyperdx-24.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

:::warning Helm 图表迁移
如果您当前正在使用 `hdx-oss-v2` Helm 图表，请迁移到 `clickstack` Helm 图表。`hdx-oss-v2` Helm 图表目前处于维护模式，将不再加入新特性。后续所有开发工作都集中在 `clickstack` Helm 图表上，它在提供相同功能的同时改进了命名并具有更好的组织结构。
:::

HyperDX 的 Helm 图表可以在[这里](https://github.com/hyperdxio/helm-charts)找到，是生产环境部署的**推荐**方式。

默认情况下，该 Helm 图表会预配所有核心组件，包括：

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB**（用于持久化应用状态）

不过，您也可以很容易地对其进行自定义，以集成到现有的 ClickHouse 部署中——例如托管在 **ClickHouse Cloud** 中的集群。

该 Helm 图表支持标准的 Kubernetes 最佳实践，包括：

* 通过 `values.yaml` 进行按环境配置
* 资源限制和 pod（容器组）级的扩缩容
* TLS 和入口配置
* Secrets 管理和认证设置

### 适用于

* 概念验证（PoC）
* 生产环境


## 部署步骤 {#deployment-steps}

<br />

<VerticalStepper headerLevel="h3">

### 前置条件 {#prerequisites}

- [Helm](https://helm.sh/) v3+
- Kubernetes 集群（推荐 v1.20+）
- 已配置 `kubectl` 与您的集群交互

### 添加 ClickStack Helm 仓库 {#add-the-clickstack-helm-repository}

添加 ClickStack Helm 仓库：

```shell
helm repo add clickstack https://hyperdxio.github.io/helm-charts
helm repo update
```

### 安装 ClickStack {#installing-clickstack}

使用默认值安装 ClickStack 图表：

```shell
helm install my-clickstack clickstack/clickstack
```

### 验证安装 {#verify-the-installation}

验证安装：

```shell
kubectl get pods -l "app.kubernetes.io/name=clickstack"
```

当所有 Pod（容器组）就绪后，继续下一步操作。

### 转发端口 {#forward-ports}

端口转发允许我们访问和配置 HyperDX。在生产环境部署时，应通过入口或负载均衡器公开服务，以确保正确的网络访问、TLS 终止和可扩展性。端口转发最适合本地开发或一次性管理任务，不适用于长期运行或高可用性环境。

```shell
kubectl port-forward \
  pod/$(kubectl get pod -l app.kubernetes.io/name=clickstack -o jsonpath='{.items[0].metadata.name}') \
  8080:3000
```

:::tip 生产环境入口配置
对于生产环境部署，请配置带有 TLS 的入口，而不是使用端口转发。详细配置说明请参阅[入口配置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup)。
:::

### 访问用户界面 {#navigate-to-the-ui}

访问 [http://localhost:8080](http://localhost:8080) 以打开 HyperDX 用户界面。

创建用户，提供符合要求的用户名和密码。

<Image img={hyperdx_login} alt='HyperDX 用户界面' size='lg' />

点击 `Create` 后，将为通过 Helm 图表部署的 ClickHouse 实例创建数据源。

:::note 覆盖默认连接
您可以覆盖到集成 ClickHouse 实例的默认连接。详细信息请参阅["使用 ClickHouse Cloud"](#using-clickhouse-cloud)。
:::

有关使用其他 ClickHouse 实例的示例，请参阅["创建 ClickHouse Cloud 连接"](/docs/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。

### 自定义配置（可选） {#customizing-values}

您可以使用 `--set` 标志自定义配置。例如：

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

或者，编辑 `values.yaml` 文件。要获取默认值：

```shell
helm show values clickstack/clickstack > values.yaml
```

示例配置：

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

### 使用密钥（可选） {#using-secrets}

对于处理敏感数据（如 API 密钥或数据库凭据），请使用 Kubernetes 密钥。HyperDX Helm 图表提供了默认密钥文件，您可以修改并应用到集群。

#### 使用预配置的密钥 {#using-pre-configured-secrets}

Helm 图表包含位于 [`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml) 的默认密钥模板。此文件提供了管理密钥的基本结构。

如果需要手动应用密钥，请修改并应用提供的 `secrets.yaml` 模板：

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

将密钥应用到您的集群：

```shell
kubectl apply -f secrets.yaml
```

#### 创建自定义密钥 {#creating-a-custom-secret}


如果需要，您可以手动创建自定义 Kubernetes Secret：

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```

#### 引用 Secret {#referencing-a-secret}

在 `values.yaml` 中引用 Secret：

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```

:::tip API 密钥管理
有关 API 密钥设置的详细说明（包括多种配置方法和 pod（容器组）重启流程），请参阅 [API 密钥设置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration#api-key-setup)。
:::

</VerticalStepper>


## 使用 ClickHouse Cloud {#using-clickhouse-cloud}



如果使用 ClickHouse Cloud，用户需要禁用由 Helm 图表部署的 ClickHouse 实例，并配置 Cloud 凭证：

```shell
# 指定 ClickHouse Cloud 凭证
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # 完整的 https 地址
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
```


# 如何覆盖默认连接配置

helm install my-clickstack clickstack/clickstack \
--set clickhouse.enabled=false \
--set clickhouse.persistence.enabled=false \
--set otel.clickhouseEndpoint=${CLICKHOUSE_URL} \
--set clickhouse.config.users.otelUser=${CLICKHOUSE_USER} \
--set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD}

````

或者,使用 `values.yaml` 文件:
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
````


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

````
```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
# or if installed...
# helm upgrade my-clickstack clickstack/clickstack -f values.yaml
````

:::tip 高级外部配置
对于使用基于密钥的配置、外部 OTel collector 或最小化设置的生产环境部署,请参阅[部署选项指南](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options)。
:::


## 生产环境说明

默认情况下，此 chart 还会安装 ClickHouse 和 OTel collector。不过，在生产环境中，建议分别独立管理 ClickHouse 和 OTel collector。

要禁用 ClickHouse 和 OTel collector，请设置以下值：

```shell
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.enabled=false
```

:::tip 生产环境最佳实践
对于生产环境部署（包括高可用配置、资源管理、入口/TLS 设置以及云平台特定配置（GKE、EKS、AKS）），请参阅：

* [配置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - 入口、TLS 与 Secret 管理
* [云端部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - 云平台特定设置与生产环境检查清单
  :::


## 任务配置 {#task-configuration}

默认情况下，chart 中预置了一个以 cronjob 形式运行的任务，用于检查是否需要触发告警。其配置选项如下：

| Parameter | Description | Default |
|-----------|-------------|---------|
| `tasks.enabled` | 在集群中启用/禁用 cron 任务。默认情况下，HyperDX 镜像会在进程内部运行 cron 任务。如果你更希望在集群中使用单独的 cron 任务，请将其设置为 true。 | `false` |
| `tasks.checkAlerts.schedule` | `check-alerts` 任务的 Cron 调度表达式 | `*/1 * * * *` |
| `tasks.checkAlerts.resources` | `check-alerts` 任务的资源请求与限制 | 参见 `values.yaml` |



## 升级 chart

要升级到较新版本：

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

查看可用的 chart 版本：

```shell
helm search repo clickstack
```


## 卸载 ClickStack

要删除该部署：

```shell
helm uninstall my-clickstack
```

这将删除与该发布关联的所有资源，但持久化数据（如有）可能会保留。


## 故障排查

### 检查日志

```shell
kubectl logs -l app.kubernetes.io/name=clickstack
```

### 排查安装失败

```shell
helm install my-clickstack clickstack/clickstack --debug --dry-run
```

### 验证部署

```shell
kubectl get pods -l app.kubernetes.io/name=clickstack
```

:::tip 其他故障排查资源
对于入口相关问题、TLS 问题或云部署相关的故障排查，请参阅：

* [入口故障排查](/docs/use-cases/observability/clickstack/deployment/helm-configuration#troubleshooting-ingress) - 资源服务、路径重写、浏览器问题
* [云部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud#loadbalancer-dns-resolution-issue) - GKE OpAMP 问题以及云环境特定问题
  :::

<JSONSupport />

用户可以通过参数或在 `values.yaml` 中设置这些环境变量，例如：

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

或者使用 `--set`：

```shell
helm install my-clickstack clickstack/clickstack \
  --set "hyperdx.env[0].name=BETA_CH_OTEL_JSON_SCHEMA_ENABLED" \
  --set "hyperdx.env[0].value=true" \
  --set "otel.env[0].name=OTEL_AGENT_FEATURE_GATE_ARG" \
  --set "otel.env[0].value=--feature-gates=clickhouse.json"
```


## 相关文档 {#related-documentation}

### 部署指南 {#deployment-guides}
- [部署选项](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部 ClickHouse、OTel collector 和精简部署
- [配置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API 密钥、机密信息和入口配置
- [云部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS、AKS 配置和生产环境最佳实践

### 其他资源 {#additional-resources}
- [ClickStack 入门指南](/docs/use-cases/observability/clickstack/getting-started) - ClickStack 简介
- [ClickStack Helm 图表仓库](https://github.com/hyperdxio/helm-charts) - 图表源代码和 values 配置参考
- [Kubernetes 文档](https://kubernetes.io/docs/) - Kubernetes 参考文档
- [Helm 文档](https://helm.sh/docs/) - Helm 参考文档
