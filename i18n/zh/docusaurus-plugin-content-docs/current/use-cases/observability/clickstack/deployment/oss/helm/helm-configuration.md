---
slug: /use-cases/observability/clickstack/deployment/helm-configuration
title: 'Helm 配置'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: '为 ClickStack 的 Helm 部署配置 API 密钥、Secret 与入口'
doc_type: 'guide'
keywords: ['ClickStack 配置', 'Helm Secret', 'API 密钥配置', '入口配置', 'TLS 设置']
---

本指南介绍 ClickStack Helm 部署的配置选项。有关基本安装，请参阅[主 Helm 部署指南](/docs/use-cases/observability/clickstack/deployment/helm)。

## API 密钥设置 \{#api-key-setup\}

成功部署 ClickStack 之后，配置 API 密钥以启用遥测数据采集：

1. **访问你的 HyperDX 实例**，通过已配置的入口或服务访问地址进行访问
2. **登录 HyperDX 控制台**，进入 Team settings 以生成或获取你的 API 密钥
3. **使用以下任一方法**，将该 API 密钥更新到你的部署中：

### 方法 1：通过使用 values 文件的 helm upgrade 进行更新 \{#api-key-values-file\}

将 API 密钥添加到你的 `values.yaml` 文件中：

```yaml
hyperdx:
  apiKey: "your-api-key-here"
```

然后升级部署：

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```


### 方法二：使用 helm upgrade 命令并通过 --set 参数更新 \{#api-key-set-flag\}

```shell
helm upgrade my-clickstack clickstack/clickstack --set hyperdx.apiKey="your-api-key-here"
```


### 重启 Pod（容器组）以应用更改 \{#restart-pods\}

在更新 API 密钥后，重启 Pod（容器组）以使其加载新的配置：

```shell
kubectl rollout restart deployment my-clickstack-clickstack-app my-clickstack-clickstack-otel-collector
```

:::note
该 chart 会使用你的 API key 自动创建一个名为 `<release-name>-app-secrets` 的 Kubernetes Secret。除非你打算使用外部 Secret，否则无需进行任何额外的 Secret 配置。
:::


## 密钥管理 \{#secret-management\}

在处理诸如 API 密钥或数据库凭证等敏感数据时，请使用 Kubernetes Secret 资源。

### 使用预配置的 Secret \{#using-pre-configured-secrets\}

Helm 图表包含一个默认的 Secret 模板，位于 [`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml)。此文件为管理 Secret 提供了基础结构。

如果您需要手动应用 Secret，请修改并应用提供的 `secrets.yaml` 模板：

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

将该 Secret 应用到集群：

```shell
kubectl apply -f secrets.yaml
```


### 创建自定义 Secret \{#creating-a-custom-secret\}

手动创建一个自定义的 Kubernetes Secret：

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```


### 在 values.yaml 中引用 Secret 对象 \{#referencing-a-secret\}

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```


## 入口配置 \{#ingress-setup\}

要通过域名对外暴露 HyperDX UI 和 API，请在 `values.yaml` 中启用入口。

### 入口常规配置 \{#general-ingress-configuration\}

```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"  # Must match ingress host
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note 重要配置说明
`hyperdx.frontendUrl` 应与入口的主机名保持一致，并包含协议（例如 `https://hyperdx.yourdomain.com`）。这可确保所有生成的链接、cookie 和重定向正常工作。
:::


### 启用 TLS（HTTPS） \{#enabling-tls\}

要通过 HTTPS 保护您的部署：

**1. 使用您的证书和私钥创建一个 TLS Secret：**

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


### 常见入口陷阱 \{#common-ingress-pitfalls\}

**路径与重写配置：**

* 对于 Next.js 和其他 SPA，请始终使用如上所示的正则表达式路径与重写注解（annotation）
* 不要仅使用没有重写的 `path: /`，否则会导致静态资源无法正常提供

**`frontendUrl` 与 `ingress.host` 不匹配：**

* 如果二者不匹配，可能会遇到 cookies、重定向以及资源加载方面的问题

**TLS 配置错误：**

* 确保你的 TLS secret 有效，并在入口中被正确引用
* 如果在启用 TLS 的情况下通过 HTTP 访问应用，浏览器可能会阻止不安全内容

**入口控制器版本：**

* 某些功能（例如正则路径和重写）需要较新的 nginx 入口控制器版本
* 使用以下命令检查你的版本：

```shell
kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```


## OTEL collector 入口 \{#otel-collector-ingress\}

如果需要通过入口暴露 OTEL collector 的端点（用于跟踪、指标和日志），请使用 `additionalIngresses` 配置。这样可以便于从集群外部发送遥测数据，或者为 collector 配置自定义域名。

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
* 正则路径规则允许你通过单条规则路由所有 OTLP 信号（traces、metrics、logs）

:::note
如果你不需要将 OTel collector 暴露到集群外部，可以跳过此配置。对于大多数用户，通用的入口配置就足够了。
:::


## 排查入口问题 \{#troubleshooting-ingress\}

**检查入口资源：**

```shell
kubectl get ingress -A
kubectl describe ingress <ingress-name>
```

**检查入口控制器的日志：**

```shell
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

**测试资源 URL：**

使用 `curl` 验证静态资源是以 JS 而非 HTML 的形式提供：

```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# Should return Content-Type: application/javascript
```

**浏览器开发者工具（DevTools）：**

* 在 Network 面板中检查是否有 404，或资源返回的是 HTML 而不是 JS
* 在控制台中查找类似 `Unexpected token <` 的错误（表示 JS 请求返回了 HTML）

**检查路径重写：**

* 确认入口没有移除或错误重写资源路径

**清理浏览器和 CDN 缓存：**

* 修改完成后，清理浏览器缓存以及任何 CDN/代理缓存，避免加载陈旧的资源


## 自定义配置 \{#customizing-values\}

可以使用 `--set` 参数自定义设置：

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

或者，创建一个自定义的 `values.yaml` 文件。要获取默认配置：

```shell
helm show values clickstack/clickstack > values.yaml
```

配置示例：

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

应用你的自定义参数：

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
```


## 后续步骤 \{#next-steps\}

- [部署选项](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部系统与最小化部署
- [Cloud 部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS 和 AKS 配置
- [Helm 主指南](/docs/use-cases/observability/clickstack/deployment/helm) - 基本安装