---
slug: /use-cases/observability/clickstack/deployment/helm-configuration
title: 'Helm 配置'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: '为 ClickStack 的 Helm 部署配置 API 密钥、Secret 和入口'
doc_type: 'guide'
keywords: ['ClickStack 配置', 'Helm Secret', 'API 密钥设置', '入口配置', 'TLS 设置']
---

本指南介绍 ClickStack 的 Helm 部署可用的配置选项。有关基本安装，请参阅[主要 Helm 部署指南](/docs/use-cases/observability/clickstack/deployment/helm)。



## API 密钥设置

成功部署 ClickStack 之后，配置 API 密钥以启用遥测数据采集：

1. **通过已配置的入口或服务端点访问你的 HyperDX 实例**
2. **登录 HyperDX 仪表盘**，进入 Team settings 以生成或获取你的 API 密钥
3. **使用以下任一方式，将 API 密钥更新到你的部署中**：

### 方法一：通过携带 values 文件的 helm upgrade 更新

将 API 密钥添加到你的 `values.yaml` 中：

```yaml
hyperdx:
  apiKey: "your-api-key-here"
```

然后升级部署：

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

### 方法 2：通过 helm upgrade 并使用 --set 参数进行更新

```shell
helm upgrade my-clickstack clickstack/clickstack --set hyperdx.apiKey="你的-api-密钥"
```

### 重启 Pod（容器组）以使更改生效

在更新 API 密钥之后，重启 Pod（容器组）以加载新的配置：

```shell
kubectl rollout restart deployment my-clickstack-clickstack-app my-clickstack-clickstack-otel-collector
```

:::note
该 chart 会使用你的 API Key 自动创建一个 Kubernetes Secret（`<release-name>-app-secrets`）。除非你希望使用外部 Secret，否则无需进行额外的 Secret 配置。
:::


## Secret 管理

在处理 API 密钥或数据库凭据等敏感数据时，请使用 Kubernetes Secret。

### 使用预配置的 Secret

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

### 创建自定义 Secret

手动创建一个自定义的 Kubernetes Secret：

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```

### 在 values.yaml 中引用 Secret 对象

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```


## 入口设置

要通过域名对外暴露 HyperDX UI 和 API，请在 `values.yaml` 文件中启用入口。

### 通用入口配置

```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"  # 必须与 Ingress 主机匹配
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note 重要配置说明
`hyperdx.frontendUrl` 应与入口的主机名保持一致，并包含协议（例如：`https://hyperdx.yourdomain.com`），以确保所有生成的链接、cookie 和重定向都能正常工作。
:::

### 启用 TLS（HTTPS）

要使用 HTTPS 保护部署：

**1. 使用证书和私钥创建一个 TLS Secret：**

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

供参考，下面是生成的入口资源示例：

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
    - host: hyperdx.你的域名.com
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
        - hyperdx.你的域名.com
      secretName: hyperdx-tls
```

### 常见入口陷阱

**路径与重写配置：**

* 对于 Next.js 和其他 SPA，请始终使用如上所示的正则表达式路径和重写注解
* 不要只使用不带重写的 `path: /`，否则会导致静态资源无法正常提供

**`frontendUrl` 与 `ingress.host` 不匹配：**

* 如果二者不匹配，可能会出现 cookies、重定向以及资源加载方面的问题

**TLS 配置错误：**

* 确保 TLS Secret 有效，并在入口配置中被正确引用
* 启用 TLS 时，如果通过 HTTP 访问应用，浏览器可能会阻止不安全内容

**Ingress controller 版本：**

* 某些功能（例如正则路径和重写）需要较新的 nginx ingress controller 版本
* 使用以下命令检查版本：

```shell
kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```


## OTEL collector 入口

如果需要通过入口暴露 OTEL collector 的端点（traces、metrics、logs），请使用 `additionalIngresses` 配置。这对于从集群外部发送遥测数据或为 collector 使用自定义域名非常有用。

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

* 这会为 OTEL collector 端点创建一个单独的入口资源
* 可以使用不同的域名、配置特定的 TLS 设置，并添加自定义注解
* 使用正则表达式的路径规则可以通过单个规则路由所有 OTLP 信号（traces、metrics、logs）

:::note
如果不需要将 OTEL collector 暴露到集群外部，可以跳过此配置。对大多数用户而言，通用的入口配置就足够了。
:::


## 入口故障排查

**检查入口资源：**

```shell
kubectl get ingress -A
kubectl describe ingress <ingress-name>
```

**查看入口控制器日志：**

```shell
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

**测试资源 URL：**


使用 `curl` 验证静态资源是以 JS 而非 HTML 的形式提供：

```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# 应返回 Content-Type: application/javascript
```

**浏览器开发者工具：**

* 在 Network（网络）面板中检查是否存在 404，或资源返回的是 HTML 而不是 JS
* 在控制台中查找诸如 `Unexpected token <` 之类的错误（表示为 JS 请求返回了 HTML）

**检查路径重写：**

* 确保入口不会剥离或错误地重写资源路径

**清理浏览器和 CDN 缓存：**

* 更改配置后，请清理浏览器缓存以及任何 CDN/代理缓存，以避免加载陈旧资源


## 自定义值

可以使用 `--set` 参数来自定义配置：

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

或者创建一个自定义的 `values.yaml` 文件。要获取默认配置值：

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

应用你的自定义配置：

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
```


## 后续步骤 {#next-steps}

- [部署选项](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部系统与最小化部署方案
- [云端部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS 和 AKS 配置
- [主要 Helm 指南](/docs/use-cases/observability/clickstack/deployment/helm) - 基本安装
