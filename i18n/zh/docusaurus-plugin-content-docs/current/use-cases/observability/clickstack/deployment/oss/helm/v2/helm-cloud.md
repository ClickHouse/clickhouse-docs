---
slug: /use-cases/observability/clickstack/deployment/helm-cloud
title: 'Helm Cloud 部署'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: '在 GKE、EKS 和 AKS 上部署 ClickStack 的 Cloud 专用配置'
doc_type: 'guide'
keywords: ['ClickStack GKE', 'ClickStack EKS', 'ClickStack AKS', 'Kubernetes Cloud 部署', '生产部署']
---

:::warning Chart 版本 2.x
本页介绍的是基于子图表的 **v2.x** Helm 图表。如果你仍在使用 v1.x 内联模板图表，请参阅 [Helm Cloud 部署 (v1.x) ](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1)。有关迁移步骤，请参阅 [升级指南](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)。
:::

本指南介绍了在托管 Kubernetes 服务上部署 ClickStack 时所需的 Cloud 专用配置。有关基本安装，请参阅 [Helm 部署主指南](/docs/use-cases/observability/clickstack/deployment/helm)。

## Google Kubernetes Engine (GKE) \{#google-kubernetes-engine-gke\}

部署到 GKE 时，由于云环境特有的网络行为，您可能需要重写某些配置值。

### LoadBalancer DNS 解析问题 \{#loadbalancer-dns-resolution-issue\}

GKE 的 LoadBalancer 服务可能会导致内部 DNS 解析异常，使 pod (容器组) 之间的通信被解析到外部 IP，而不是保留在集群网络内部。这会特别影响 OTel collector 与 OpAMP 服务器之间的连接。

**症状：**

* OTel collector 日志中出现与集群 IP 地址相关的“connection refused”错误
* OpAMP 连接失败，例如：`dial tcp 34.118.227.30:4320: connect: connection refused`

**解决方案：**

对 OpAMP 服务器 URL 使用完全限定域名 (FQDN) ：

```shell
helm install my-clickstack clickstack/clickstack \
  --set hyperdx.frontendUrl="http://your-external-ip-or-domain.com" \
  --set hyperdx.config.OPAMP_SERVER_URL="http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```

### GKE 示例 Values \{#gke-example-values\}

```yaml
# values-gke.yaml
hyperdx:
  frontendUrl: "http://34.123.61.99"  # Use your LoadBalancer external IP

  config:
    OPAMP_SERVER_URL: "http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"

clickhouse:
  keeper:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "pd-ssd"
        resources:
          requests:
            storage: 5Gi
  cluster:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "pd-ssd"
        resources:
          requests:
            storage: 10Gi
```

## Amazon EKS \{#amazon-eks\}

对于 EKS 部署，可参考以下常见配置：

```yaml
# values-eks.yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"

  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true

clickhouse:
  keeper:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "gp3"
        resources:
          requests:
            storage: 5Gi
  cluster:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "gp3"
        resources:
          requests:
            storage: 10Gi
```

有关 AWS ALB 入口配置，请参阅[附加清单指南](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests#aws-alb-ingress)以及 [ALB 示例 values](https://github.com/ClickHouse/ClickStack-helm-charts/tree/main/examples/alb-ingress)。

## Azure AKS \{#azure-aks\}

对于 AKS 的部署：

```yaml
# values-aks.yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"

clickhouse:
  keeper:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "managed-csi"
        resources:
          requests:
            storage: 5Gi
  cluster:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "managed-csi"
        resources:
          requests:
            storage: 10Gi
```

## 生产环境云部署检查清单 \{#production-cloud-deployment-checklist\}

在任意云服务商上将 ClickStack 部署到生产环境之前：

* [ ] 使用外部域名/IP 正确配置 `hyperdx.frontendUrl`
* [ ] 配置启用 TLS 的入口，以提供 HTTPS 访问
* [ ] 如果遇到连接问题 (尤其是在 GKE 上) ，请使用 FQDN 重写 OpAMP 服务器 URL
* [ ] 为 ClickHouse 和 Keeper 的卷声明配置存储类
* [ ] 设置适当的资源请求和限制
* [ ] 启用监控和告警
* [ ] 配置备份和灾难恢复
* [ ] 通过 `hyperdx.secrets` 或外部 Secrets 实现适当的机密管理

## 生产环境最佳实践 \{#production-best-practices\}

### 资源管理 \{#resource-management\}

```yaml
hyperdx:
  deployment:
    resources:
      requests:
        cpu: 500m
        memory: 1Gi
      limits:
        cpu: "2"
        memory: 4Gi

otel-collector:
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 200m
      memory: 256Mi
```

### 高可用性 \{#high-availability\}

```yaml
hyperdx:
  deployment:
    replicas: 3
    topologySpreadConstraints:
      - maxSkew: 1
        topologyKey: kubernetes.io/hostname
        whenUnsatisfiable: ScheduleAnyway
        labelSelector:
          matchLabels:
            app.kubernetes.io/name: clickstack

  podDisruptionBudget:
    enabled: true
    minAvailable: 1
```

### 持久化存储 \{#persistent-storage\}

确保已通过 Operator CR 规范配置持久卷，以保留数据：

```yaml
clickhouse:
  keeper:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "fast-ssd"
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 5Gi
  cluster:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "fast-ssd"
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 100Gi

mongodb:
  spec:
    statefulSet:
      spec:
        volumeClaimTemplates:
          - metadata:
              name: data-volume
            spec:
              storageClassName: "fast-ssd"
              accessModes: ["ReadWriteOnce"]
              resources:
                requests:
                  storage: 10Gi
```

**云平台特定的存储类：**

* **GKE**: `pd-ssd` 或 `pd-balanced`
* **EKS**: `gp3` 或 `io2`
* **AKS**: `managed-premium` 或 `managed-csi`

### 浏览器兼容性说明 \{#browser-compatibility-notes\}

对于仅使用 HTTP 的部署 (开发/测试) ，由于安全上下文要求，某些浏览器可能会报 crypto API 错误。对于生产环境部署，请始终通过入口配置使用带有有效 TLS 证书的 HTTPS。

有关 TLS 设置说明，请参阅[入口配置](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup)。

## 后续步骤 \{#next-steps\}

* [配置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API 密钥、Secret 和入口
* [部署选项](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部系统配置
* [升级指南](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - 从 v1.x 迁移到 v2.x
* [附加清单](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) - 自定义 Kubernetes 对象
* [Helm 指南](/docs/use-cases/observability/clickstack/deployment/helm) - 基本安装
* [Cloud 部署 (v1.x) ](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - v1.x Cloud 配置