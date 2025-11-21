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
    "Helm ClickHouse 部署",
    "HyperDX Helm 安装",
    "Kubernetes 可观测性技术栈",
    "ClickStack Kubernetes 部署"
  ]
---

import Image from "@theme/IdealImage"
import hyperdx_24 from "@site/static/images/use-cases/observability/hyperdx-24.png"
import hyperdx_login from "@site/static/images/use-cases/observability/hyperdx-login.png"
import JSONSupport from "@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md"

HyperDX 的 Helm chart 可以在[此处](https://github.com/hyperdxio/helm-charts)找到,这是生产环境部署的**推荐**方法。

默认情况下,Helm chart 会预配所有核心组件,包括:

- **ClickHouse**
- **HyperDX**
- **OpenTelemetry (OTel) collector**
- **MongoDB**(用于持久化应用状态)

但是,它可以轻松定制以集成现有的 ClickHouse 部署 - 例如,托管在 **ClickHouse Cloud** 中的部署。

该 chart 支持标准的 Kubernetes 最佳实践,包括:

- 通过 `values.yaml` 进行特定环境配置
- 资源限制和 Pod 级别扩缩容
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

### 添加 HyperDX Helm 仓库 {#add-the-hyperdx-helm-repository}

添加 HyperDX Helm 仓库:

```shell
helm repo add hyperdx https://hyperdxio.github.io/helm-charts
helm repo update
```

### 安装 HyperDX {#installing-hyperdx}

使用默认值安装 HyperDX chart:

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2
```

### 验证安装 {#verify-the-installation}

验证安装:

```shell
kubectl get pods -l "app.kubernetes.io/name=hdx-oss-v2"
```

当所有 pod 就绪后,继续下一步。

### 转发端口 {#forward-ports}

端口转发允许我们访问和设置 HyperDX。部署到生产环境的用户应通过 ingress 或负载均衡器暴露服务,以确保正确的网络访问、TLS 终止和可扩展性。端口转发最适合本地开发或一次性管理任务,不适用于长期运行或高可用性环境。

```shell
kubectl port-forward \
  pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}') \
  8080:3000
```

### 访问 UI {#navigate-to-the-ui}

访问 [http://localhost:8080](http://localhost:8080) 以打开 HyperDX UI。

创建用户,提供符合要求的用户名和密码。

<Image img={hyperdx_login} alt='HyperDX UI' size='lg' />

点击 `Create` 后,将为通过 Helm chart 部署的 ClickHouse 实例创建数据源。

:::note 覆盖默认连接
您可以覆盖到集成 ClickHouse 实例的默认连接。详情请参阅 ["使用 ClickHouse Cloud"](#using-clickhouse-cloud)。
:::

有关使用其他 ClickHouse 实例的示例,请参阅 ["创建 ClickHouse Cloud 连接"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。

### 自定义值(可选) {#customizing-values}

您可以使用 `--set` 标志自定义设置。例如:

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2 --set key=value
```

或者,编辑 `values.yaml`。要获取默认值:

```shell
helm show values hyperdx/hdx-oss-v2 > values.yaml
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
helm install my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
```

### 使用 secrets(可选) {#using-secrets}

对于处理敏感数据(如 API 密钥或数据库凭据),请使用 Kubernetes secrets。HyperDX Helm charts 提供了默认的 secret 文件,您可以修改并应用到集群中。

#### 使用预配置的 secrets {#using-pre-configured-secrets}

Helm chart 包含一个默认的 secret 模板,位于 [`charts/hdx-oss-v2/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/hdx-oss-v2/templates/secrets.yaml)。该文件提供了管理 secrets 的基础结构。

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

将 secret 应用到您的集群:

```shell
kubectl apply -f secrets.yaml
```

#### 创建自定义 secret {#creating-a-custom-secret}

如果您愿意,可以手动创建自定义 Kubernetes secret:

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```


#### 引用密钥 {#referencing-a-secret}

要在 `values.yaml` 中引用密钥:

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```

</VerticalStepper>


## 使用 ClickHouse Cloud {#using-clickhouse-cloud}

如果使用 ClickHouse Cloud,用户需要禁用通过 Helm chart 部署的 ClickHouse 实例,并指定 Cloud 凭据:


```shell
# 指定 ClickHouse Cloud 凭证
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # 完整的 https URL
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
```


# 如何覆盖默认连接配置

helm install myrelease hyperdx-helm --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} --set clickhouse.config.users.otelUser=${CLICKHOUSE_USER} --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD}

````

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
        "name": "外部 ClickHouse",
        "host": "http://your-clickhouse-server:8123",
        "port": 8123,
        "username": "your-username",
        "password": "your-password"
      }
    ]
````


```shell
helm install my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
# 如果已安装，则使用...
# helm upgrade my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
```


## 生产环境注意事项 {#production-notes}

默认情况下,此 chart 也会安装 ClickHouse 和 OTel 采集器。但在生产环境中,建议您单独管理 ClickHouse 和 OTel 采集器。

要禁用 ClickHouse 和 OTel 采集器,请设置以下值:

```shell
helm install myrelease hyperdx-helm --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
```


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
helm upgrade my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
```

查看可用的 Chart 版本：

```shell
helm search repo hyperdx
```


## 卸载 HyperDX {#uninstalling-hyperdx}

要移除部署:

```shell
helm uninstall my-hyperdx
```

此命令将删除与该发行版相关的所有资源,但持久化数据(如果存在)可能会保留。


## 故障排查 {#troubleshooting}

### 检查日志 {#checking-logs}

```shell
kubectl logs -l app.kubernetes.io/name=hdx-oss-v2
```

### 调试安装失败 {#debugging-a-failed-instance}

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2 --debug --dry-run
```

### 验证部署 {#verifying-deployment}

```shell
kubectl get pods -l app.kubernetes.io/name=hdx-oss-v2
```

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
helm install myrelease hyperdx-helm --set "hyperdx.env[0].name=BETA_CH_OTEL_JSON_SCHEMA_ENABLED" \
  --set "hyperdx.env[0].value=true" \
  --set "otel.env[0].name=OTEL_AGENT_FEATURE_GATE_ARG" \
  --set "otel.env[0].value=--feature-gates=clickhouse.json"
```
