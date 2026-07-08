---
slug: /use-cases/observability/clickstack/deployment/helm-additional-manifests
title: 'Helm 附加清单'
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: '使用 additionalManifests 与 ClickStack Helm 图表一同部署自定义 Kubernetes 对象'
doc_type: 'guide'
keywords: ['ClickStack 附加清单', 'Helm 自定义资源', 'NetworkPolicy', 'HPA', 'ALB 入口', 'Kubernetes']
---

:::note 仅适用于 2.x 图表版本
`additionalManifests` 功能仅在基于子图表的 **v2.x** Helm 图表中可用。
:::

`additionalManifests` 配置项可让您与 ClickStack 图表一同部署任意 Kubernetes 对象。可将其用于 Helm 图表原生未提供模板支持的资源，例如 `NetworkPolicy`、`HorizontalPodAutoscaler`、`ServiceAccount`、`PodMonitor`、自定义 `Ingress` 对象，或任何其他 Kubernetes API 对象。

## 工作方式 \{#how-it-works\}

`additionalManifests` 中的每个条目都是一个完整的 Kubernetes 资源定义。该 图表 会：

1. 遍历列表中的每个条目
2. 将条目转换为 YAML (`toYaml`)
3. 使用 Helm `tpl` 计算该 YAML 中的模板表达式

模板表达式可引用：

* `.Release.Name`、`.Release.Namespace`
* `include "clickstack.fullname" .` 及其他 图表 辅助函数
* `.Values.*`

```yaml
additionalManifests:
  - apiVersion: v1
    kind: ConfigMap
    metadata:
      name: '{{ include "clickstack.fullname" . }}-custom'
    data:
      release: '{{ .Release.Name }}'
```

## values 文件限制 \{#values-file-constraints\}

`additionalManifests` 在 values 文件中配置，而 values 文件会在 `tpl` 运行前先按 YAML 解析。

* values 文件中的任何 `{{ ... }}` 都必须置于带引号的字符串内
* 结构性模板块不是有效的 values YAML (例如，单独使用 `{{- include ... | nindent ... }}`)
* 对于非字符串字段 (例如数字端口) ，请使用字面量值或命名端口
* 如果需要结构性模板，请使用包装 图表 的模板，而不要直接使用原始 values 文件

```yaml
# Valid in values.yaml
name: '{{ include "clickstack.fullname" . }}-app'

# Invalid in values.yaml (unquoted template expression)
name: {{ include "clickstack.fullname" . }}-app

# Invalid in values.yaml (structural template block)
labels:
  {{- include "clickstack.labels" . | nindent 2 }}
```

## 可用的 Chart 辅助函数 \{#available-chart-helpers\}

这些辅助函数定义在 `templates/_helpers.tpl` 中：

| Helper                           | Description            | Values-file usage |
| -------------------------------- | ---------------------- | ----------------- |
| `clickstack.name`                | Chart 名称 (截断为 63 个字符)  | 可安全用于带引号的标量值      |
| `clickstack.fullname`            | 带 Release 限定的名称        | 可安全用于带引号的标量值      |
| `clickstack.chart`               | Chart 名称 + 版本          | 可安全用于带引号的标量值      |
| `clickstack.selectorLabels`      | Selector 标签块           | 仅用于包装型 Chart 模板   |
| `clickstack.labels`              | 标准标签块                  | 仅用于包装型 Chart 模板   |
| `clickstack.mongodb.fullname`    | MongoDB CR 名称          | 可安全用于带引号的标量值      |
| `clickstack.clickhouse.fullname` | ClickHouse CR 名称       | 可安全用于带引号的标量值      |
| `clickstack.otel.fullname`       | OTel collector 名称      | 可安全用于带引号的标量值      |

## 示例 \{#examples\}

### ServiceAccount \{#serviceaccount\}

```yaml
additionalManifests:
  - apiVersion: v1
    kind: ServiceAccount
    metadata:
      name: '{{ include "clickstack.fullname" . }}'
      namespace: '{{ .Release.Namespace }}'
      labels:
        app.kubernetes.io/name: '{{ include "clickstack.name" . }}'
        app.kubernetes.io/instance: '{{ .Release.Name }}'
      annotations:
        eks.amazonaws.com/role-arn: "arn:aws:iam::123456789:role/my-role"
```

### NetworkPolicy \{#networkpolicy\}

将入站流量限制为仅允许访问 HyperDX pod (容器组) ：

```yaml
additionalManifests:
  - apiVersion: networking.k8s.io/v1
    kind: NetworkPolicy
    metadata:
      name: '{{ include "clickstack.fullname" . }}-allow-ingress'
    spec:
      podSelector:
        matchLabels:
          app.kubernetes.io/name: '{{ include "clickstack.name" . }}'
          app.kubernetes.io/instance: '{{ .Release.Name }}'
      policyTypes:
        - Ingress
      ingress:
        - from:
            - namespaceSelector:
                matchLabels:
                  kubernetes.io/metadata.name: ingress-nginx
          ports:
            - protocol: TCP
              port: 3000
            - protocol: TCP
              port: 8000
```

### HorizontalPodAutoscaler \{#horizontalpodautoscaler\}

```yaml
additionalManifests:
  - apiVersion: autoscaling/v2
    kind: HorizontalPodAutoscaler
    metadata:
      name: '{{ include "clickstack.fullname" . }}-hpa'
    spec:
      scaleTargetRef:
        apiVersion: apps/v1
        kind: Deployment
        name: '{{ include "clickstack.fullname" . }}-app'
      minReplicas: 2
      maxReplicas: 10
      metrics:
        - type: Resource
          resource:
            name: cpu
            target:
              type: Utilization
              averageUtilization: 75
```

### PodMonitor (Prometheus Operator) \{#podmonitor\}

```yaml
additionalManifests:
  - apiVersion: monitoring.coreos.com/v1
    kind: PodMonitor
    metadata:
      name: '{{ include "clickstack.fullname" . }}'
      labels:
        release: prometheus
    spec:
      selector:
        matchLabels:
          app.kubernetes.io/name: '{{ include "clickstack.name" . }}'
          app.kubernetes.io/instance: '{{ .Release.Name }}'
      podMetricsEndpoints:
        - port: app
          interval: 30s
```

### AWS ALB 入口 \{#aws-alb-ingress\}

使用 [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/) 时，请禁用 图表 内置的 nginx 入口，并定义自定义的 ALB 入口：

```yaml
hyperdx:
  ingress:
    enabled: false

additionalManifests:
  - apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata:
      name: '{{ include "clickstack.fullname" . }}-alb'
      annotations:
        alb.ingress.kubernetes.io/scheme: internet-facing
        alb.ingress.kubernetes.io/target-type: ip
        alb.ingress.kubernetes.io/certificate-arn: "arn:aws:acm:us-east-1:123456789:certificate/abc-123"
        alb.ingress.kubernetes.io/listen-ports: '[{"HTTPS":443}]'
        alb.ingress.kubernetes.io/ssl-redirect: "443"
        alb.ingress.kubernetes.io/group.name: clickstack
        alb.ingress.kubernetes.io/healthcheck-path: /api/health
    spec:
      ingressClassName: alb
      rules:
        - host: clickstack.example.com
          http:
            paths:
              - path: /
                pathType: Prefix
                backend:
                  service:
                    name: '{{ include "clickstack.fullname" . }}-app'
                    port:
                      name: app
```

有关完整的 ALB 配置示例 (包括内部 OTel collector 入口和 HPA) ，请参阅 [ALB 示例 values 配置](https://github.com/ClickHouse/ClickStack-helm-charts/tree/main/examples/alb-ingress)。

### TargetGroupBinding \{#targetgroupbinding\}

对于需要显式指定 `TargetGroupBinding` 资源的 ALB 场景：

```yaml
additionalManifests:
  - apiVersion: elbv2.k8s.aws/v1beta1
    kind: TargetGroupBinding
    metadata:
      name: '{{ include "clickstack.fullname" . }}-tgb'
    spec:
      serviceRef:
        name: '{{ include "clickstack.fullname" . }}-app'
        port: app
      targetGroupARN: "arn:aws:elasticloadbalancing:us-east-1:123456789:targetgroup/my-tg/abc123"
      targetType: ip
```

## 进阶：wrapper chart 模板 \{#advanced-wrapper-chart-templates\}

如果你需要使用像 `include "clickstack.labels" . | nindent 4` 这样的结构辅助函数内容，应通过 wrapper chart 模板 (`templates/*.yaml`) 进行渲染，而不要将这些代码块直接写入 values 文件。

wrapper chart 模板示例片段：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "clickstack.fullname" . }}-extra
  labels:
    {{- include "clickstack.labels" . | nindent 4 }}
data:
  appPort: "{{ .Values.hyperdx.ports.app }}"
```

## 提示 \{#tips\}

### Helm 钩子 \{#helm-hooks\}

每个 `additionalManifests` 条目都会渲染为一份独立的 YAML 文档。您可以添加 Helm 钩子注解，以控制安装/升级的顺序：

```yaml
additionalManifests:
  - apiVersion: batch/v1
    kind: Job
    metadata:
      name: post-install-job
      annotations:
        helm.sh/hook: post-install
        helm.sh/hook-delete-policy: hook-succeeded
    spec:
      template:
        spec:
          restartPolicy: Never
          containers:
            - name: migrate
              image: my-migration-image:latest
              command: ["./migrate.sh"]
```

### CRD 顺序 \{#crd-ordering\}

如果附加的 清单 包含自定义资源 (例如 `PodMonitor`) ，则在执行安装或升级之前，集群中必须已存在相应的 CRD。

### 组合多个资源 \{#combining-multiple-resources\}

`additionalManifests` 是一个列表。各条目会按列表顺序渲染，且每个条目都会生成一个独立的 YAML 文档。

## 后续步骤 \{#next-steps\}

* [Helm 主要指南](/docs/use-cases/observability/clickstack/deployment/helm) - 基本安装
* [配置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API 密钥、Secret 和入口
* [Cloud 部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS 和 AKS 配置
* [ClickStack Helm 图表代码仓库](https://github.com/ClickHouse/ClickStack-helm-charts) - 图表源代码和 values 参考