---
slug: /use-cases/observability/clickstack/deployment/helm-configuration
title: 'Helm 配置'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: '配置用于 ClickStack Helm 部署的 API 密钥、Secret 和入口'
doc_type: 'guide'
keywords: ['ClickStack 配置', 'Helm Secret', 'API 密钥设置', '入口配置', 'TLS 设置']
---

:::warning Helm 图表版本 2.x
本页面介绍的是基于子图表的 **v2.x** Helm 图表。如果你仍在使用 v1.x 内联模板图表，请参阅 [Helm 配置 (v1.x) ](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1)。有关迁移步骤，请参阅 [升级指南](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)。
:::

这个指南介绍了 ClickStack Helm 部署的配置选项。有关基本安装，请参阅 [Helm 部署主指南](/docs/use-cases/observability/clickstack/deployment/helm)。

## Values 的组织方式 \{#values-organization\}

v2.x 图表 在 `hyperdx:` 块下按 Kubernetes 资源类型组织 values：

```yaml
hyperdx:
  ports:          # Shared port numbers (Deployment, Service, ConfigMap, Ingress)
    api: 8000
    app: 3000
    opamp: 4320

  frontendUrl: "http://localhost:3000"

  config:         # → clickstack-config ConfigMap (non-sensitive env vars)
    APP_PORT: "3000"
    HYPERDX_LOG_LEVEL: "info"

  secrets:        # → clickstack-secret Secret (sensitive env vars)
    HYPERDX_API_KEY: "..."
    CLICKHOUSE_PASSWORD: "otelcollectorpass"
    CLICKHOUSE_APP_PASSWORD: "hyperdx"
    MONGODB_PASSWORD: "hyperdx"

  deployment:     # K8s Deployment spec (image, replicas, probes, etc.)
  service:        # K8s Service spec (type, annotations)
  ingress:        # K8s Ingress spec (host, tls, annotations)
  podDisruptionBudget:  # K8s PDB spec
  tasks:          # K8s CronJob specs
```

所有环境变量都会通过两个采用固定名称的资源传递，HyperDX 部署**和** OTel collector 都通过 `envFrom` 共享这两个资源：

* **`clickstack-config`** ConfigMap — 由 `hyperdx.config` 填充
* **`clickstack-secret`** Secret — 由 `hyperdx.secrets` 填充

现在不再有单独的 OTel 专用 ConfigMap。两个工作负载都从相同的来源读取。

## API 密钥设置 \{#api-key-setup\}

成功部署 ClickStack 后，请配置 API 密钥以启用遥测数据采集：

1. **通过已配置的入口或服务端点访问您的 HyperDX 实例**
2. **登录 HyperDX 仪表板**，然后前往团队设置以生成或获取您的 API 密钥
3. **更新您的部署**，通过以下任一方法添加 API 密钥：

### 方法 1：通过 Helm upgrade 配合 values 文件更新 \{#api-key-values-file\}

将 API 密钥添加到 `values.yaml` 中：

```yaml
hyperdx:
  secrets:
    HYPERDX_API_KEY: "your-api-key-here"
```

然后升级部署：

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

### 方法 2：通过 Helm upgrade 命令配合 --set 标志更新 \{#api-key-set-flag\}

```shell
helm upgrade my-clickstack clickstack/clickstack \
  --set hyperdx.secrets.HYPERDX_API_KEY="your-api-key-here"
```

### 重启 Pod (容器组) 以应用变更 \{#restart-pods\}

更新 API 密钥后，重启 Pod (容器组) 以使新配置生效：

```shell
kubectl rollout restart deployment my-clickstack-clickstack-app
```

:::note
该 图表 会根据你的配置值自动创建一个 Kubernetes secret (`clickstack-secret`) 。除非你想使用外部 secret，否则无需额外配置 secret。
:::

## 机密管理 \{#secret-management\}

为管理 API 密钥或数据库凭据等敏感数据，v2.x 图表 提供了一个统一的 `clickstack-secret` 资源，其内容来自 `hyperdx.secrets`。

### 默认 Secret 值 \{#default-secret-values\}

该 图表 为所有 Secret 提供了默认值。请在你的 `values.yaml` 中重写这些值：

```yaml
hyperdx:
  secrets:
    HYPERDX_API_KEY: "your-api-key"
    CLICKHOUSE_PASSWORD: "your-clickhouse-otel-password"
    CLICKHOUSE_APP_PASSWORD: "your-clickhouse-app-password"
    MONGODB_PASSWORD: "your-mongodb-password"
```

### 外部 Secret 的使用 \{#using-external-secret\}

对于需要将凭证与 Helm values 分离的生产环境部署，请使用外部 Kubernetes Secret：

```bash
# Create your secret
kubectl create secret generic my-clickstack-secrets \
  --from-literal=HYPERDX_API_KEY=my-secret-api-key \
  --from-literal=CLICKHOUSE_PASSWORD=my-ch-password \
  --from-literal=CLICKHOUSE_APP_PASSWORD=my-ch-app-password \
  --from-literal=MONGODB_PASSWORD=my-mongo-password
```

然后在 values 中引用它：

```yaml
hyperdx:
  useExistingConfigSecret: true
  existingConfigSecret: "my-clickstack-secrets"
```

## 入口设置 \{#ingress-setup\}

如需通过域名对外暴露 HyperDX 界面和 API，请在 `values.yaml` 中启用入口。

### 通用入口配置 \{#general-ingress-configuration\}

```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"  # Must match ingress host

  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note 重要配置说明
`hyperdx.frontendUrl` 应与入口主机保持一致，并包含协议 (例如 `https://hyperdx.yourdomain.com`) 。这可确保所有生成的链接、Cookie 和重定向均能正常工作。
:::

### 启用 TLS (HTTPS) \{#enabling-tls\}

要通过 HTTPS 保护您的部署：

**1. 使用您的证书和密钥创建一个 TLS Secret：**

```shell
kubectl create secret tls hyperdx-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

**2. 在入口配置中启用 TLS：**

```yaml
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
      tlsSecretName: "hyperdx-tls"
```

### 入口配置示例 \{#example-ingress-configuration\}

以下是生成的入口资源示例，供参考：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hyperdx-app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$1
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  ingressClassName: nginx
  rules:
    - host: hyperdx.yourdomain.com
      http:
        paths:
          - path: /(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: my-clickstack-clickstack-app
                port:
                  number: 3000
  tls:
    - hosts:
        - hyperdx.yourdomain.com
      secretName: hyperdx-tls
```

### 常见入口问题 \{#common-ingress-pitfalls\}

**路径与重写配置：**

* 对于 Next.js 和其他 SPA，始终使用如上所示的 Regex 路径和重写注解
* 不要只使用 `path: /` 而不配置重写，否则会导致静态资源无法正常提供

**`frontendUrl` 与 `ingress.host` 不匹配：**

* 如果两者不一致，可能会导致 cookie、重定向和资源加载出现问题

**TLS 配置错误：**

* 确保你的 TLS secret 有效，并且已在入口中正确引用
* 如果已启用 TLS，却仍通过 HTTP 访问应用，浏览器可能会阻止不安全内容

**入口控制器版本：**

* 某些功能 (如 Regex 路径和重写) 需要较新的 nginx 入口控制器版本
* 使用以下命令检查版本：

```shell
kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```

## OTel collector 入口 \{#otel-collector-ingress\}

如果您需要通过入口暴露 OTel collector 端点 (用于链路追踪、指标和日志) ，请使用 `additionalIngresses` 配置。这对于从集群外部发送遥测数据，或为 collector 配置自定义域名很有帮助。

```yaml
hyperdx:
  ingress:
    enabled: true
    additionalIngresses:
      - name: otel-collector
        annotations:
          nginx.ingress.kubernetes.io/ssl-redirect: "false"
          nginx.ingress.kubernetes.io/force-ssl-redirect: "false"
          nginx.ingress.kubernetes.io/use-regex: "true"
        ingressClassName: nginx
        hosts:
          - host: collector.yourdomain.com
            paths:
              - path: /v1/(traces|metrics|logs)
                pathType: Prefix
                port: 4318
                name: otel-collector
        tls:
          - hosts:
              - collector.yourdomain.com
            secretName: collector-tls
```

* 这会为 OTEL collector 端点创建单独的入口资源
* 您可以使用不同的域名、配置特定的 TLS 设置，并添加自定义注解
* Regex 路径规则允许您通过单条规则路由所有 OTLP 信号 (追踪、指标、日志)

:::note
如果您不需要将 OTEL collector 对外暴露，则可以跳过此配置。对于大多数用户，通用入口配置已足够。
:::

或者，您可以使用 [`additionalManifests`](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) 来定义完全自定义的入口资源，例如 AWS ALB Ingress。

## OTel collector 配置 \{#otel-collector-configuration\}

OTel collector 通过官方 OpenTelemetry Collector Helm 图表部署，为 `otel-collector:` 子图表。请直接在 values 的 `otel-collector:` 下进行配置：

```yaml
otel-collector:
  enabled: true
  mode: deployment
  replicaCount: 3
  resources:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "256Mi"
      cpu: "200m"
  nodeSelector:
    node-role: monitoring
  tolerations:
    - key: monitoring
      operator: Equal
      value: otel
      effect: NoSchedule
```

环境变量 (如 ClickHouse 端点、OpAMP URL 等) 通过统一的 `clickstack-config` ConfigMap 和 `clickstack-secret` Secret 进行共享。该子图表的 `extraEnvsFrom` 已预先设置为同时从两者读取。

有关所有可用的子图表值，请参见 [OpenTelemetry collector Helm 图表](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector)。

## MongoDB 配置 \{#mongodb-configuration\}

MongoDB 由 MCK Operator 通过 `MongoDBCommunity` 自定义资源进行管理。该 CR 的规格会从 `mongodb.spec` 直接按原样渲染：

```yaml
mongodb:
  enabled: true
  spec:
    members: 1
    type: ReplicaSet
    version: "5.0.32"
    security:
      authentication:
        modes: ["SCRAM"]
    statefulSet:
      spec:
        volumeClaimTemplates:
          - metadata:
              name: data-volume
            spec:
              accessModes: ["ReadWriteOnce"]
              storageClassName: "your-storage-class"
              resources:
                requests:
                  storage: 10Gi
```

MongoDB 密码在 `hyperdx.secrets.MONGODB_PASSWORD` 中进行设置。有关所有可用的 CRD 字段，请参阅 [MCK 文档](https://github.com/mongodb/mongodb-kubernetes/tree/master/docs/mongodbcommunity)。

## ClickHouse 配置 \{#clickhouse-configuration\}

ClickHouse 由 ClickHouse Operator 通过 `ClickHouseCluster` 和 `KeeperCluster` 自定义资源进行管理。这两个 CR 的规范都会基于 values 直接原样渲染：

```yaml
clickhouse:
  enabled: true
  port: 8123
  nativePort: 9000
  prometheus:
    enabled: true
    port: 9363
  keeper:
    spec:
      replicas: 1
      dataVolumeClaimSpec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 5Gi
  cluster:
    spec:
      replicas: 1
      shards: 1
      dataVolumeClaimSpec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
```

ClickHouse 用户凭据来自 `hyperdx.secrets` (而非 v1.x 中使用的 `clickhouse.config.users`) 。有关所有可用的 CRD 字段，请参阅 [ClickHouse Operator 配置指南](https://clickhouse.com/docs/clickhouse-operator/guides/configuration)。

## 入口故障排查 \{#troubleshooting-ingress\}

**检查入口资源：**

```shell
kubectl get ingress -A
kubectl describe ingress <ingress-name>
```

**检查入口控制器日志：**

```shell
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

**测试资源 URL：**

使用 `curl` 验证静态资源返回的是 JS 而非 HTML：

```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# Should return Content-Type: application/javascript
```

**浏览器开发者工具：**

* 在 Network 选项卡中检查是否有 404，或资源返回的是 HTML 而不是 JS
* 在控制台中查找类似 `Unexpected token <` 的错误 (这表示返回给 JS 的实际上是 HTML)

**检查路径重写：**

* 确保入口不会剥离资源路径，或错误地重写这些路径

**清除浏览器和 CDN 缓存：**

* 变更后，清除浏览器缓存以及所有 CDN/代理缓存，以避免使用过期资源

## 自定义值 \{#customizing-values\}

您可以使用 `--set` 参数来自定义这些设置：

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

或者，创建自定义的 `values.yaml`。如需获取默认值：

```shell
helm show values clickstack/clickstack > values.yaml
```

应用自定义值：

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
```

## 后续步骤 \{#next-steps\}

* [部署选项](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部系统与最小化部署
* [Cloud 部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS 和 AKS 配置
* [升级指南](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - 从 v1.x 迁移到 v2.x
* [其他清单文件](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) - 自定义 Kubernetes 对象
* [Helm 主指南](/docs/use-cases/observability/clickstack/deployment/helm) - 基本安装
* [配置 (v1.x) ](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - v1.x 配置指南