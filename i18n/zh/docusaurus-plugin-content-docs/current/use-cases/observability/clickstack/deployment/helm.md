---
'slug': '/use-cases/observability/clickstack/deployment/helm'
'title': 'Helm'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 2
'description': '使用 Helm 部署 ClickStack - ClickHouse 观察堆栈'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import hyperdx_24 from '@site/static/images/use-cases/observability/hyperdx-24.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import JSONSupport from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

可以在 [这里](https://github.com/hyperdxio/helm-charts) 找到 HyperDX 的 Helm chart，这是用于生产部署的**推荐**方法。

默认情况下，Helm chart 将配置所有核心组件，包括：

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) 收集器**
* **MongoDB**（用于持久化应用状态）

然而，它可以轻松自定义以与现有的 ClickHouse 部署集成，例如，托管在 **ClickHouse Cloud** 中的实例。

该 chart 支持标准的 Kubernetes 最佳实践，包括：

- 通过 `values.yaml` 进行特定环境的配置
- 资源限制和 pod 级别扩展
- TLS 和入口配置
- 秘密管理和身份验证设置

### 适合 {#suitable-for}

* 概念验证
* 生产

## 部署步骤 {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### 先决条件 {#prerequisites}

- [Helm](https://helm.sh/) v3+
- Kubernetes 集群（建议 v1.20+）
- 配置好的 `kubectl` 用于与您的集群互动

### 添加 HyperDX Helm 仓库 {#add-the-hyperdx-helm-repository}

添加 HyperDX Helm 仓库：

```shell
helm repo add hyperdx https://hyperdxio.github.io/helm-charts
helm repo update
```

### 安装 HyperDX {#installing-hyperdx}

要使用默认值安装 HyperDX chart，请执行：

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2
```

### 验证安装 {#verify-the-installation}

验证安装：

```shell
kubectl get pods -l "app.kubernetes.io/name=hdx-oss-v2"
```

当所有 pods 就绪后，继续。

### 转发端口 {#forward-ports}

端口转发允许我们访问和设置 HyperDX。部署到生产的用户应该通过入口或负载均衡器公开服务，以确保适当的网络访问、TLS 终止和可扩展性。端口转发最适合本地开发或一次性管理任务，而不适合长期或高可用性环境。

```shell
kubectl port-forward \
  pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}') \
  8080:3000
```

### 导航到 UI {#navigate-to-the-ui}

访问 [http://localhost:8080](http://localhost:8080) 以访问 HyperDX UI。

创建一个用户，提供符合要求的用户名和密码。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

点击 `Create` 时，将为通过 Helm chart 部署的 ClickHouse 实例创建数据源。

:::note 覆盖默认连接
您可以覆盖与集成的 ClickHouse 实例的默认连接。详细信息请参阅 ["使用 ClickHouse Cloud"](#using-clickhouse-cloud)。
:::

有关使用替代 ClickHouse 实例的示例，请参见 ["创建 ClickHouse Cloud 连接"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。

### 自定义值（可选） {#customizing-values}

您可以使用 `--set` 标志自定义设置。例如：

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2 --set key=value

Alternatively, edit the `values.yaml`. To retrieve the default values:

```shell
helm show values hyperdx/hdx-oss-v2 > values.yaml
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
helm install my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
```

### 使用秘密（可选） {#using-secrets}

对于处理敏感数据（例如 API 密钥或数据库凭据），请使用 Kubernetes secrets。HyperDX Helm charts 提供默认的秘密文件，您可以修改并应用到您的集群。

#### 使用预配置的秘密 {#using-pre-configured-secrets}

Helm chart 包含一个位于 [`charts/hdx-oss-v2/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/hdx-oss-v2/templates/secrets.yaml) 的默认秘密模板。该文件提供管理秘密的基本结构。

如果您需要手动应用一个秘密，请修改并应用提供的 `secrets.yaml` 模板：

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

将秘密应用到您的集群：

```shell
kubectl apply -f secrets.yaml
```

#### 创建自定义秘密 {#creating-a-custom-secret}

如果更喜欢，您可以手动创建一个自定义的 Kubernetes 秘密：

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```

#### 引用秘密 {#referencing-a-secret}

要在 `values.yaml` 中引用一个秘密：

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

如果使用 ClickHouse Cloud 用户禁用通过 Helm chart 部署的 ClickHouse 实例并指定 Cloud 凭据：

```shell

# specify ClickHouse Cloud credentials
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # full https url
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>


# how to overwrite default connection
helm install myrelease hyperdx-helm --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} --set clickhouse.config.users.otelUser=${CLICKHOUSE_USER} --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD}
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
helm install my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml

# or if installed...

# helm upgrade my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
```

## 生产注意事项 {#production-notes}

默认情况下，该 chart 还会安装 ClickHouse 和 OTel 收集器。然而，对于生产而言，建议您单独管理 ClickHouse 和 OTel 收集器。

要禁用 ClickHouse 和 OTel 收集器，请设置以下值：

```shell
helm install myrelease hyperdx-helm --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
```

## 任务配置 {#task-configuration}

默认情况下，chart 设置中有一个作为 cronjob 的任务，负责检查是否应该触发警报。以下是其配置选项：

| 参数 | 描述 | 默认值 |
|-----------|-------------|---------|
| `tasks.enabled` | 启用/禁用集群中的 cron 任务。默认情况下，HyperDX 镜像将在进程中运行 cron 任务。如果您更愿意在集群中使用单独的 cron 任务，请更改为 true。 | `false` |
| `tasks.checkAlerts.schedule` | check-alerts 任务的 cron 调度 | `*/1 * * * *` |
| `tasks.checkAlerts.resources` | check-alerts 任务的资源请求和限制 | 见 `values.yaml` |

## 升级 chart {#upgrading-the-chart}

要升级到较新版本：

```shell
helm upgrade my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
```

要检查可用的 chart 版本：

```shell
helm search repo hyperdx
```

## 卸载 HyperDX {#uninstalling-hyperdx}

要删除部署：

```shell
helm uninstall my-hyperdx
```

这将删除与发布相关的所有资源，但持久数据（如果有）可能会保留。

## 故障排除 {#troubleshooting}

### 检查日志 {#checking-logs}

```shell
kubectl logs -l app.kubernetes.io/name=hdx-oss-v2
```

### 调试失败的安装 {#debugging-a-failed-instance}

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2 --debug --dry-run
```

### 验证部署 {#verifying-deployment}

```shell
kubectl get pods -l app.kubernetes.io/name=hdx-oss-v2
```

<JSONSupport/>

用户可以通过参数或 `values.yaml` 设置这些环境变量，例如：

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

或通过 `--set`：

```shell
helm install myrelease hyperdx-helm --set "hyperdx.env[0].name=BETA_CH_OTEL_JSON_SCHEMA_ENABLED" \
  --set "hyperdx.env[0].value=true" \
  --set "otel.env[0].name=OTEL_AGENT_FEATURE_GATE_ARG" \
  --set "otel.env[0].value=--feature-gates=clickhouse.json"
```
