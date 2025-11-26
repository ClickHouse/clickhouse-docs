---
slug: /use-cases/observability/clickstack/deployment/helm-configuration
title: 'Helm 配置'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: '为 ClickStack 的 Helm 部署配置 API 密钥、Secrets 和入口'
doc_type: 'guide'
keywords: ['ClickStack 配置', 'Helm Secrets', 'API 密钥设置', '入口配置', 'TLS 设置']
---

本指南介绍 ClickStack Helm 部署的配置选项。有关基本安装，请参阅[主 Helm 部署指南](/docs/use-cases/observability/clickstack/deployment/helm)。

## API 密钥设置 {#api-key-setup}

成功部署 ClickStack 之后，配置 API 密钥以启用遥测数据采集：

1. **访问你的 HyperDX 实例**，通过已配置的入口或服务端点
2. **登录 HyperDX 仪表盘**，进入“Team settings”以生成或获取你的 API 密钥
3. **使用以下任一方法在部署中配置 API 密钥**：

### 方法一：通过带有 values 文件的 Helm upgrade 命令进行更新

将 API key 添加到 `values.yaml` 文件中：

```yaml
hyperdx:
  apiKey: "your-api-key-here"
```

然后升级该部署：

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```


### 方法 2：通过带有 --set 参数的 helm upgrade 命令进行更新

```shell
helm upgrade my-clickstack clickstack/clickstack --set hyperdx.apiKey="your-api-key-here"
```


### 重启 Pod（容器组）以应用更改

更新 API 密钥后，重启 Pod（容器组），使其加载新配置：

```shell
kubectl rollout restart deployment my-clickstack-clickstack-app my-clickstack-clickstack-otel-collector
```

:::note
该 chart 会使用你的 API key 自动创建一个名为 `<release-name>-app-secrets` 的 Kubernetes Secret。除非你打算使用外部 Secret，否则无需进行额外的 Secret 配置。
:::


## Secret 管理 {#secret-management}

对于 API 密钥或数据库凭据等敏感数据，请使用 Kubernetes Secret 资源进行管理。

### 使用预配置的 Secret

Helm 图表包含一个默认的 Secret 模板，位于 [`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml)。此文件提供了用于管理 Secret 的基础结构。

如需手动应用 Secret，请先修改并应用提供的 `secrets.yaml` 模板：

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

将该 Secret 应用于集群：

```shell
kubectl apply -f secrets.yaml
```


### 创建自定义 Secret

手动创建一个自定义的 Kubernetes Secret：

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=我的密钥
```


### 在 values.yaml 中引用 Secret

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```


## 入口配置 {#ingress-setup}

要通过域名对外暴露 HyperDX 的 UI 和 API，请在 `values.yaml` 中启用入口配置。

### 常规入口配置

```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"  # 必须与 Ingress 主机匹配
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note 重要配置说明
`hyperdx.frontendUrl` 应当与入口（Ingress）的主机名匹配，并且包含协议（例如：`https://hyperdx.yourdomain.com`）。这样可以确保所有生成的链接、cookie 和重定向都能正常工作。
:::


### 启用 TLS（HTTPS）

要通过 HTTPS 保护你的部署：

**1. 使用你的证书和密钥创建一个 TLS 类型的 Secret：**

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


### 入口配置示例

供参考，下面是生成的入口资源：

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


### 常见入口问题

**路径与重写配置：**

* 对于 Next.js 和其他 SPA，请始终使用上面示例中的正则表达式路径和重写 annotation
* 不要只使用未配置重写的 `path: /`，否则会导致静态资源无法正确提供

**`frontendUrl` 与 `ingress.host` 不匹配：**

* 如果两者不匹配，可能会遇到 cookies、重定向和静态资源加载等问题

**TLS 配置错误：**

* 确保你的 TLS secret 有效，并在入口配置中被正确引用
* 启用 TLS 时，如果仍通过 HTTP 访问应用，浏览器可能会阻止不安全内容

**入口控制器版本：**

* 某些功能（例如正则路径和重写）需要较新的 nginx 入口控制器版本
* 使用以下命令检查你的版本：

```shell
kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```


## OTel collector 入口

如果需要通过入口将 OTel collector 的端点（用于 traces、metrics、logs）暴露出去，请使用 `additionalIngresses` 配置。这在需要从集群外部发送遥测数据，或为 collector 使用自定义域名时非常有用。

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

* 这会为 OTel collector 的端点创建一个单独的入口资源
* 可以使用不同的域名、配置特定的 TLS 设置，并应用自定义注解
* 正则路径规则允许通过一条规则路由所有 OTLP 信号（traces、metrics、logs）

:::note
如果不需要将 OTel collector 暴露到集群外部，可以跳过此配置。对于大多数用户，通用的入口配置已经足够。
:::


## 入口故障排查

**检查入口资源：**

```shell
kubectl get ingress -A
kubectl describe ingress <ingress-名称>
```

**查看入口控制器日志：**

```shell
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

**测试资源 URL：**

使用 `curl` 验证静态资源是以 JS 而不是 HTML 的形式返回：

```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# 应返回 Content-Type: application/javascript
```

**浏览器开发者工具：**

* 在 Network（网络）选项卡中检查是否有 404，或资源返回的是 HTML 而不是 JS
* 在控制台中查找类似 `Unexpected token <` 的错误（表明 JS 请求返回了 HTML）

**检查路径重写：**

* 确保入口（Ingress）没有剥离或错误重写资源路径

**清理浏览器和 CDN 缓存：**

* 变更之后，清理浏览器缓存以及任何 CDN/代理缓存，以避免使用陈旧的资源


## 自定义配置

可以使用 `--set` 标志来自定义配置：

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

或者创建一个自定义的 `values.yaml` 文件。要获取默认值：

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

应用你的自定义值：

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
```


## 后续步骤 {#next-steps}

- [部署选项](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部系统和最小部署方案
- [云部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS 和 AKS 配置
- [Helm 主要指南](/docs/use-cases/observability/clickstack/deployment/helm) - 基本安装