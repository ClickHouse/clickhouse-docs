---
slug: /use-cases/observability/clickstack/deployment/helm
title: "Helm"
pagination_prev: null
pagination_next: null
sidebar_position: 2
description: "使用 Helm 部署 ClickStack - ClickHouse 可观测性技术栈"
doc_type: "guide"
keywords:
  [
    "ClickStack Helm chart",
    "Helm ClickHouse deployment",
    "HyperDX Helm installation",
    "Kubernetes observability stack",
    "ClickStack Kubernetes deployment"
  ]
---

import Image from "@theme/IdealImage"
import hyperdx_24 from "@site/static/images/use-cases/observability/hyperdx-24.png"
import hyperdx_login from "@site/static/images/use-cases/observability/hyperdx-login.png"
import JSONSupport from "@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md"

:::warning Chart 迁移
如果您当前正在使用 `hdx-oss-v2` chart,请迁移至 `clickstack` chart。`hdx-oss-v2` chart 目前处于维护模式,不再接收新功能。所有新开发工作都集中在 `clickstack` chart 上,它提供相同的功能,同时具有更优的命名规范和更好的组织结构。
:::

HyperDX 的 Helm chart 可以在[此处](https://github.com/hyperdxio/helm-charts)找到,这是生产环境部署的**推荐**方法。

默认情况下,Helm chart 会配置所有核心组件,包括:

- **ClickHouse**
- **HyperDX**
- **OpenTelemetry (OTel) collector**
- **MongoDB**(用于持久化应用程序状态)

不过,它可以轻松自定义以集成现有的 ClickHouse 部署 - 例如托管在 **ClickHouse Cloud** 中的部署。

该 chart 支持标准的 Kubernetes 最佳实践,包括:

- 通过 `values.yaml` 进行环境特定配置
- 资源限制和 Pod 级别扩展
- TLS 和 Ingress 配置
- 密钥管理和身份验证设置

### 适用场景 {#suitable-for}

- 概念验证
- 生产环境


## 部署步骤 {#deployment-steps}

<br />

<VerticalStepper headerLevel="h3">

### 前置条件 {#prerequisites}

- [Helm](https://helm.sh/) v3+
- Kubernetes 集群(建议 v1.20+)
- 已配置 `kubectl` 与您的集群交互

### 添加 ClickStack Helm 仓库 {#add-the-clickstack-helm-repository}

添加 ClickStack Helm 仓库:

```shell
helm repo add clickstack https://hyperdxio.github.io/helm-charts
helm repo update
```

### 安装 ClickStack {#installing-clickstack}

使用默认值安装 ClickStack chart:

```shell
helm install my-clickstack clickstack/clickstack
```

### 验证安装 {#verify-the-installation}

验证安装:

```shell
kubectl get pods -l "app.kubernetes.io/name=clickstack"
```

当所有 pod 就绪后,继续下一步。

### 转发端口 {#forward-ports}

端口转发允许我们访问和设置 HyperDX。部署到生产环境的用户应通过 ingress 或负载均衡器暴露服务,以确保正确的网络访问、TLS 终止和可扩展性。端口转发最适合本地开发或一次性管理任务,不适用于长期运行或高可用性环境。

```shell
kubectl port-forward \
  pod/$(kubectl get pod -l app.kubernetes.io/name=clickstack -o jsonpath='{.items[0].metadata.name}') \
  8080:3000
```

:::tip 生产环境 Ingress 设置
对于生产环境部署,请配置带 TLS 的 ingress 而不是端口转发。详细设置说明请参阅 [Ingress 配置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup)。
:::

### 访问 UI {#navigate-to-the-ui}

访问 [http://localhost:8080](http://localhost:8080) 以访问 HyperDX UI。

创建用户,提供符合要求的用户名和密码。

<Image img={hyperdx_login} alt='HyperDX UI' size='lg' />

点击 `Create` 后,将为通过 Helm chart 部署的 ClickHouse 实例创建数据源。

:::note 覆盖默认连接
您可以覆盖到集成 ClickHouse 实例的默认连接。详情请参阅 ["使用 ClickHouse Cloud"](#using-clickhouse-cloud)。
:::

有关使用其他 ClickHouse 实例的示例,请参阅 ["创建 ClickHouse Cloud 连接"](/docs/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。

### 自定义配置(可选) {#customizing-values}

您可以使用 `--set` 标志自定义设置。例如:

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

或者,编辑 `values.yaml`。要获取默认值:

```shell
helm show values clickstack/clickstack > values.yaml
```

配置示例:

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

### 使用 Secret(可选) {#using-secrets}

对于处理敏感数据(如 API 密钥或数据库凭据),请使用 Kubernetes Secret。HyperDX Helm chart 提供了默认的 Secret 文件,您可以修改并应用到集群。

#### 使用预配置的 Secret {#using-pre-configured-secrets}

Helm chart 包含一个位于 [`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml) 的默认 Secret 模板。该文件提供了管理 Secret 的基础结构。

如果需要手动应用 Secret,请修改并应用提供的 `secrets.yaml` 模板:

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

将 Secret 应用到您的集群:

```shell
kubectl apply -f secrets.yaml
```

#### 创建自定义 Secret {#creating-a-custom-secret}


如果需要,您可以手动创建自定义 Kubernetes secret:

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```

#### 引用 secret {#referencing-a-secret}

在 `values.yaml` 中引用 secret:

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```

:::tip API 密钥管理
有关 API 密钥设置的详细说明(包括多种配置方法和 pod 重启流程),请参阅 [API 密钥设置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration#api-key-setup)。
:::

</VerticalStepper>


## 使用 ClickHouse Cloud {#using-clickhouse-cloud}


如果使用 ClickHouse Cloud，请禁用由 Helm chart 部署的 ClickHouse 实例，并配置 ClickHouse Cloud 凭证：

```shell
# 指定 ClickHouse Cloud 凭证
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # 完整的 https URL
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
对于使用基于密钥的配置、外部 OTEL 采集器或最小化设置的生产环境部署,请参阅[部署选项指南](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options)。
:::


## 生产环境注意事项 {#production-notes}

默认情况下,此 chart 还会安装 ClickHouse 和 OTel 采集器。但是,对于生产环境,建议您单独管理 ClickHouse 和 OTel 采集器。

要禁用 ClickHouse 和 OTel 采集器,请设置以下值:

```shell
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.enabled=false
```

:::tip 生产环境最佳实践
有关生产环境部署(包括高可用性配置、资源管理、Ingress/TLS 设置以及云平台特定配置(GKE、EKS、AKS)),请参阅:

- [配置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - Ingress、TLS 和密钥管理
- [云平台部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - 云平台特定设置和生产环境检查清单
  :::


## 任务配置 {#task-configuration}

默认情况下，chart 配置中包含一个以 cronjob 形式运行的任务，负责检查是否应触发告警。以下是其配置选项：

| 参数                          | 描述                                                                                                                                                                                | 默认值            |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `tasks.enabled`               | 启用/禁用集群中的 cron 任务。默认情况下，HyperDX 镜像会在进程中运行 cron 任务。如果您希望在集群中使用独立的 cron 任务，请将此项设置为 true。 | `false`           |
| `tasks.checkAlerts.schedule`  | check-alerts 任务的 Cron 调度计划                                                                                                                                                    | `*/1 * * * *`     |
| `tasks.checkAlerts.resources` | check-alerts 任务的资源请求和限制                                                                                                                                                     | 参见 `values.yaml` |


## 升级 Chart {#upgrading-the-chart}

升级到新版本：

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

查看可用的 Chart 版本：

```shell
helm search repo clickstack
```


## 卸载 ClickStack {#uninstalling-clickstack}

要删除部署，请执行：

```shell
helm uninstall my-clickstack
```

此操作将删除与该发布版本关联的所有资源,但持久化数据(如果存在)可能会保留。


## 故障排查 {#troubleshooting}

### 检查日志 {#checking-logs}

```shell
kubectl logs -l app.kubernetes.io/name=clickstack
```

### 调试安装失败 {#debugging-a-failed-install}

```shell
helm install my-clickstack clickstack/clickstack --debug --dry-run
```

### 验证部署 {#verifying-deployment}

```shell
kubectl get pods -l app.kubernetes.io/name=clickstack
```

:::tip 其他故障排查资源
有关 Ingress 相关问题、TLS 问题或云部署故障排查,请参阅:

- [Ingress 故障排查](/docs/use-cases/observability/clickstack/deployment/helm-configuration#troubleshooting-ingress) - 资源服务、路径重写、浏览器问题
- [云部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud#loadbalancer-dns-resolution-issue) - GKE OpAMP 问题和云平台特定问题
  :::

<JSONSupport />

用户可以通过参数或 `values.yaml` 文件设置这些环境变量,例如:

_values.yaml_

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

或通过 `--set` 参数:

```shell
helm install my-clickstack clickstack/clickstack \
  --set "hyperdx.env[0].name=BETA_CH_OTEL_JSON_SCHEMA_ENABLED" \
  --set "hyperdx.env[0].value=true" \
  --set "otel.env[0].name=OTEL_AGENT_FEATURE_GATE_ARG" \
  --set "otel.env[0].value=--feature-gates=clickhouse.json"
```


## 相关文档 {#related-documentation}

### 部署指南 {#deployment-guides}

- [部署选项](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部 ClickHouse、OTEL 采集器和最小化部署
- [配置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API 密钥、Secret 和 Ingress 设置
- [云部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS、AKS 配置和生产环境最佳实践

### 其他资源 {#additional-resources}

- [ClickStack 入门指南](/docs/use-cases/observability/clickstack/getting-started) - ClickStack 简介
- [ClickStack Helm Charts 仓库](https://github.com/hyperdxio/helm-charts) - Chart 源代码和配置值参考
- [Kubernetes 文档](https://kubernetes.io/docs/) - Kubernetes 参考文档
- [Helm 文档](https://helm.sh/docs/) - Helm 参考文档
