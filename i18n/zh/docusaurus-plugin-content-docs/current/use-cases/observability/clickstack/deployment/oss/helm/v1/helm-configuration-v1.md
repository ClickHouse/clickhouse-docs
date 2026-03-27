---
slug: /use-cases/observability/clickstack/deployment/helm-configuration-v1
title: 'Helm 配置（v1.x）'
pagination_prev: null
pagination_next: null
sidebar_position: 11
description: '为 v1.x ClickStack Helm 部署配置 API 密钥、Secret 和入口'
doc_type: 'guide'
keywords: ['ClickStack 配置', 'Helm Secret', 'API 密钥设置', '入口配置', 'TLS 设置']
---

:::warning 已弃用 — v1.x Helm 图表
本页介绍 **v1.x** 内联模板 Helm 图表的配置。该图表目前处于维护模式。有关 v2.x 图表，请参阅 [Helm 配置](/docs/use-cases/observability/clickstack/deployment/helm-configuration)。如需迁移，请参阅 [升级指南](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)。
:::

本指南介绍 ClickStack Helm 部署的配置选项。有关基本安装，请参阅 [Helm 部署主指南](/docs/use-cases/observability/clickstack/deployment/helm-v1)。

## API 密钥设置 \{#api-key-setup\}

成功部署 ClickStack 后，配置 API 密钥以启用遥测数据采集：

1. **通过已配置的入口或服务端点访问 HyperDX 实例**
2. **登录 HyperDX 控制台**，然后前往团队设置以生成或获取 API 密钥
3. **使用以下任一方法更新部署**，添加 API 密钥：

### 方法 1：使用 Helm upgrade 和 values 文件进行更新 \{#api-key-values-file\}

将 API 密钥添加到 `values.yaml` 中：

```yaml
hyperdx:
  apiKey: "your-api-key-here"
```

然后升级部署：

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

### 方法 2：通过 Helm upgrade 命令结合 --set 参数进行更新 \{#api-key-set-flag\}

```shell
helm upgrade my-clickstack clickstack/clickstack --set hyperdx.apiKey="your-api-key-here"
```

### 重启 Pod (容器组) 以使变更生效 \{#restart-pods\}

更新 API 密钥后，重启 Pod (容器组) ，以加载新配置：

```shell
kubectl rollout restart deployment my-clickstack-clickstack-app my-clickstack-clickstack-otel-collector
```

:::note
该 Helm 图表 会自动创建一个包含您的 API 密钥的 Kubernetes secret (`<release-name>-app-secrets`) 。除非您想使用外部 secret，否则无需额外的 secret 配置。
:::

## Secret 管理 \{#secret-management\}

对于 API 密钥或数据库凭据等敏感数据，请使用 Kubernetes Secret。

### 使用预配置的 Secret \{#using-pre-configured-secrets\}

Helm 图表包含一个默认的 Secret 模板，位于 [`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml)。该文件提供了用于管理 Secret 的基础结构。

如果需要手动应用 Secret，请修改并应用提供的 `secrets.yaml` 模板：

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

### 创建自定义 Secret \{#creating-a-custom-secret\}

手动创建自定义 Kubernetes Secret：

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```

### 在 values.yaml 中引用 Secret 资源 \{#referencing-a-secret\}

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```

## 入口设置 \{#ingress-setup\}

要通过域名对外暴露 HyperDX 界面和 API，请在 `values.yaml` 中启用入口。

### 通用入口配置 \{#general-ingress-configuration\}

```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"  # Must match ingress host
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note 重要配置说明
`hyperdx.frontendUrl` 应与入口主机名保持一致，并包含协议 (例如：`https://hyperdx.yourdomain.com`) 。这样可确保所有生成的链接、Cookie 和重定向都能正常工作。
:::

### 启用 TLS (HTTPS) \{#enabling-tls\}

要通过 HTTPS 保护您的部署：

**1. 使用证书和密钥创建 TLS Secret：**

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

* 对于 Next.js 和其他 SPA，始终应按上文所示使用 Regex 路径和重写注解
* 不要只使用 `path: /` 而不配置重写，否则会导致静态资源无法正常提供

**`frontendUrl` 与 `ingress.host` 不一致：**

* 如果两者不一致，可能会导致 cookie、重定向和资源加载出现问题

**TLS 配置不当：**

* 确保你的 TLS secret 有效，并且已在入口中被正确引用
* 如果已启用 TLS，但你仍通过 HTTP 访问应用，浏览器可能会阻止不安全内容

**入口控制器版本：**

* 某些功能 (例如 Regex 路径和重写) 需要较新的 nginx 入口控制器版本
* 使用以下命令检查版本：

```shell
kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```

## OTel collector 入口 \{#otel-collector-ingress\}

如果您需要通过入口对外暴露 OTel collector 端点 (用于追踪、指标和日志) ，请使用 `additionalIngresses` 配置。这对于从集群外发送遥测数据，或为 collector 配置自定义域名非常有用。

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

* 这会为 OTel collector 端点创建单独的入口资源
* 您可以使用不同的域名、配置特定的 TLS 设置，并添加自定义注解
* Regex 路径规则允许您通过单条规则路由所有 OTLP 信号 (追踪、指标、日志)

:::note
如果您不需要将 OTel collector 对外暴露，可以跳过此配置。对于大多数用户，通用入口配置已足够。
:::

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

使用 `curl` 验证返回的静态资源是 JS，而不是 HTML：

```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# Should return Content-Type: application/javascript
```

**浏览器开发者工具：**

* 在“网络”标签页中检查是否存在 404，或资源返回的是 HTML 而不是 JS
* 在控制台中查找类似 `Unexpected token <` 的错误 (表明返回给 JS 资源的是 HTML)

**检查路径重写：**

* 确保入口不会剥离资源路径，或错误地重写资源路径

**清除浏览器和 CDN 缓存：**

* 完成变更后，清除浏览器缓存以及所有 CDN/代理缓存，以避免继续使用过期资源

## 自定义值 \{#customizing-values\}

您可以通过 `--set` 参数自定义配置项：

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

或者，创建自定义的 `values.yaml`。如需获取默认值：

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

hyperdx:
  ingress:
    enabled: true
    host: hyperdx.example.com
```

应用自定义值：

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
```

## 后续步骤 \{#next-steps\}

* [部署选项 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1) - 外部系统和最小部署
* [Cloud 部署 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - GKE、EKS 和 AKS 配置
* [Helm 主指南 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-v1) - 基本安装
* [Helm 配置 (v2.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - v2.x 配置指南
* [升级指南](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - 从 v1.x 迁移到 v2.x