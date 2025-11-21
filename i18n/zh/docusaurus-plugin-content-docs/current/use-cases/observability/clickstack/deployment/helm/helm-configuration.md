---
slug: /use-cases/observability/clickstack/deployment/helm-configuration
title: 'Helm 配置'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: '为 ClickStack 的 Helm 部署配置 API 密钥、Secrets 和 Ingress'
doc_type: 'guide'
keywords: ['ClickStack 配置', 'Helm Secrets', 'API 密钥设置', 'Ingress 配置', 'TLS 设置']
---

本指南介绍 ClickStack 的 Helm 部署配置选项。有关基础安装，请参阅 [Helm 部署主指南](/docs/use-cases/observability/clickstack/deployment/helm)。



## API 密钥设置 {#api-key-setup}

成功部署 ClickStack 后,配置 API 密钥以启用遥测数据收集:

1. **访问您的 HyperDX 实例**,通过已配置的 Ingress 或服务端点访问
2. **登录 HyperDX 控制台**,导航至团队设置以生成或获取您的 API 密钥
3. **更新您的部署**,使用以下方法之一配置 API 密钥:

### 方法 1:通过 Helm 升级使用 values 文件更新 {#api-key-values-file}

将 API 密钥添加到您的 `values.yaml` 文件中:

```yaml
hyperdx:
  apiKey: "your-api-key-here"
```

然后升级您的部署:

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

### 方法 2:通过 Helm 升级使用 --set 标志更新 {#api-key-set-flag}

```shell
helm upgrade my-clickstack clickstack/clickstack --set hyperdx.apiKey="your-api-key-here"
```

### 重启 Pod 以应用更改 {#restart-pods}

更新 API 密钥后,重启 Pod 以加载新配置:

```shell
kubectl rollout restart deployment my-clickstack-clickstack-app my-clickstack-clickstack-otel-collector
```

:::note
该 Chart 会自动创建一个包含您 API 密钥的 Kubernetes Secret (`<release-name>-app-secrets`)。除非您需要使用外部 Secret,否则无需额外的 Secret 配置。
:::


## 密钥管理 {#secret-management}

处理敏感数据(如 API 密钥或数据库凭据)时,请使用 Kubernetes Secret。

### 使用预配置的 Secret {#using-pre-configured-secrets}

Helm Chart 包含一个默认的 Secret 模板,位于 [`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml)。该文件提供了管理 Secret 的基础结构。

如需手动应用 Secret,请修改并应用提供的 `secrets.yaml` 模板:

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

### 创建自定义 Secret {#creating-a-custom-secret}

手动创建自定义 Kubernetes Secret:

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```

### 在 values.yaml 中引用 Secret {#referencing-a-secret}

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```


## Ingress 设置 {#ingress-setup}

要通过域名暴露 HyperDX UI 和 API,请在 `values.yaml` 中启用 ingress。

### 通用 ingress 配置 {#general-ingress-configuration}

```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com" # Must match ingress host
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note 重要配置说明
`hyperdx.frontendUrl` 应与 ingress 主机匹配并包含协议(例如 `https://hyperdx.yourdomain.com`)。这可确保所有生成的链接、Cookie 和重定向正常工作。
:::

### 启用 TLS (HTTPS) {#enabling-tls}

要使用 HTTPS 保护您的部署:

**1. 使用您的证书和密钥创建 TLS Secret:**

```shell
kubectl create secret tls hyperdx-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

**2. 在 ingress 配置中启用 TLS:**

```yaml
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
      tlsSecretName: "hyperdx-tls"
```

### Ingress 配置示例 {#example-ingress-configuration}

作为参考,以下是生成的 ingress 资源示例:

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

### 常见 ingress 问题 {#common-ingress-pitfalls}

**路径和重写配置:**

- 对于 Next.js 和其他 SPA,始终使用如上所示的正则表达式路径和重写注解
- 不要仅使用 `path: /` 而不进行重写,这会导致静态资源服务失败

**`frontendUrl` 和 `ingress.host` 不匹配:**

- 如果这两者不匹配,您可能会遇到 Cookie、重定向和资源加载问题

**TLS 配置错误:**

- 确保您的 TLS Secret 有效并在 ingress 中正确引用
- 如果在启用 TLS 时通过 HTTP 访问应用,浏览器可能会阻止不安全的内容

**Ingress 控制器版本:**

- 某些功能(如正则表达式路径和重写)需要较新版本的 nginx ingress 控制器
- 使用以下命令检查您的版本:

```shell
kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```


## OTEL 采集器入口 {#otel-collector-ingress}

如果需要通过 Ingress 暴露 OTEL 采集器端点(用于追踪、指标、日志),请使用 `additionalIngresses` 配置。这对于从集群外部发送遥测数据或为采集器使用自定义域名非常有用。

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

- 这将为 OTEL 采集器端点创建一个单独的 Ingress 资源
- 您可以使用不同的域名、配置特定的 TLS 设置并应用自定义注解
- 正则表达式路径规则允许您通过单条规则路由所有 OTLP 信号(追踪、指标、日志)

:::note
如果不需要对外暴露 OTEL 采集器,可以跳过此配置。对于大多数用户而言,常规的 Ingress 设置已经足够。
:::


## Ingress 故障排查 {#troubleshooting-ingress}

**检查 Ingress 资源：**

```shell
kubectl get ingress -A
kubectl describe ingress <ingress-name>
```

**检查 Ingress 控制器日志：**

```shell
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

**测试资源 URL：**


使用 `curl` 验证静态资源是以 JS 而非 HTML 的形式提供的：

```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# 应返回 Content-Type: application/javascript
```

**浏览器开发者工具：**

* 在 Network（网络）选项卡中检查是否有 404，或是否有资源返回的是 HTML 而不是 JS
* 在控制台中查找类似 `Unexpected token <` 的错误（表示 JS 请求返回了 HTML）

**检查路径重写：**

* 确保 Ingress 没有去除或错误重写资源路径

**清除浏览器和 CDN 缓存：**

* 修改后清除浏览器缓存以及任何 CDN/代理缓存，以避免使用陈旧的资源


## 自定义配置值 {#customizing-values}

您可以通过 `--set` 参数自定义配置:

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

或者,创建自定义的 `values.yaml` 文件。获取默认配置值的方法:

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

hyperdx:
  ingress:
    enabled: true
    host: hyperdx.example.com
```

应用自定义配置值:

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
```


## 后续步骤 {#next-steps}

- [部署选项](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部系统和最小化部署
- [云部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS 和 AKS 配置
- [Helm 主指南](/docs/use-cases/observability/clickstack/deployment/helm) - 基础安装
