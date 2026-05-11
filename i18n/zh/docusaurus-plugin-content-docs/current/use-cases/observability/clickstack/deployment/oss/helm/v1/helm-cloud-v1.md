---
slug: /use-cases/observability/clickstack/deployment/helm-cloud-v1
title: 'Helm 云部署（v1.x）'
pagination_prev: null
pagination_next: null
sidebar_position: 13
description: '使用 v1.x Helm 图表在 GKE、EKS 和 AKS 上部署 ClickStack 的云环境专用配置'
doc_type: 'guide'
keywords: ['ClickStack GKE', 'ClickStack EKS', 'ClickStack AKS', 'Kubernetes 云部署', '生产部署']
---

:::warning 已弃用 — v1.x 图表
本页面介绍的是 **v1.x** 内联模板 Helm 图表在云环境中的部署方式，该图表目前处于维护模式。有关 v2.x 图表，请参见 [Helm 云部署](/docs/use-cases/observability/clickstack/deployment/helm-cloud)。如需迁移，请参见 [升级指南](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)。
:::

本指南介绍了在托管 Kubernetes 服务上部署 ClickStack 的云环境专用配置。有关基础安装，请参见 [Helm 部署主指南](/docs/use-cases/observability/clickstack/deployment/helm-v1)。

## Google Kubernetes Engine (GKE) \{#google-kubernetes-engine-gke\}

部署到 GKE 时，由于云环境特有的网络行为，你可能需要重写某些值。

### LoadBalancer DNS 解析问题 \{#loadbalancer-dns-resolution-issue\}

GKE 的 LoadBalancer 服务可能会导致内部 DNS 解析问题，使 pod (容器组) 之间的通信被解析到外部 IP，而不是保留在集群网络内部。这会特别影响 OTel collector 与 OpAMP 服务器之间的连接。

**症状：**

* OTel collector 日志中显示带有集群 IP 地址的“connection refused”错误
* OpAMP 连接失败，例如：`dial tcp 34.118.227.30:4320: connect: connection refused`

**解决方案：**

对 OpAMP 服务器 URL 使用完全限定域名 (FQDN) ：

```shell
helm install my-clickstack clickstack/clickstack \
  --set hyperdx.frontendUrl="http://your-external-ip-or-domain.com" \
  --set otel.opampServerUrl="http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```

### 其他 GKE 相关注意事项 \{#other-gke-considerations\}

```yaml
# values-gke.yaml
hyperdx:
  frontendUrl: "http://34.123.61.99"  # Use your LoadBalancer external IP

otel:
  opampServerUrl: "http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"

# Adjust for GKE pod（容器组） networking if needed
clickhouse:
  config:
    clusterCidrs:
      - "10.8.0.0/16"  # GKE commonly uses this range
      - "10.0.0.0/8"   # Fallback for other configurations
```

## Amazon EKS \{#amazon-eks\}

对于 EKS 部署，可参考以下常见配置：

```yaml
# values-eks.yaml
hyperdx:
  frontendUrl: "http://your-alb-domain.com"

# EKS typically uses these pod（容器组） CIDRs
clickhouse:
  config:
    clusterCidrs:
      - "192.168.0.0/16"
      - "10.0.0.0/8"

# Enable 入口 for production
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
```

## Azure AKS \{#azure-aks\}

对于 AKS 部署：

```yaml
# values-aks.yaml
hyperdx:
  frontendUrl: "http://your-azure-lb.com"

# AKS pod（容器组） networking
clickhouse:
  config:
    clusterCidrs:
      - "10.244.0.0/16"  # Common AKS pod（容器组） CIDR
      - "10.0.0.0/8"
```

## 生产环境 Cloud 部署检查清单 \{#production-cloud-deployment-checklist\}

在任何云服务商上将 ClickStack 部署到生产环境之前：

* [ ] 使用外部域名/IP 正确配置 `frontendUrl`
* [ ] 搭建启用 TLS 的入口，以提供 HTTPS 访问
* [ ] 如果遇到连接问题 (尤其是在 GKE 上) ，请将 `otel.opampServerUrl` 重写为 FQDN
* [ ] 根据你的 pod (容器组) 网络 CIDR 调整 `clickhouse.config.clusterCidrs`
* [ ] 为生产工作负载配置持久化存储
* [ ] 设置适当的资源请求和限制
* [ ] 启用监控和告警
* [ ] 配置备份和灾难恢复
* [ ] 实现适当的密钥管理

## 生产环境最佳实践 \{#production-best-practices\}

### 资源管理 \{#resource-management\}

```yaml
hyperdx:
  resources:
    requests:
      cpu: 500m
      memory: 1Gi
    limits:
      cpu: 2000m
      memory: 4Gi
```

### 高可用性 \{#high-availability\}

```yaml
hyperdx:
  replicaCount: 3

  affinity:
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            labelSelector:
              matchExpressions:
                - key: app.kubernetes.io/name
                  operator: In
                  values:
                    - clickstack
            topologyKey: kubernetes.io/hostname
```

### 持久化存储 \{#persistent-storage\}

确保已配置用于数据持久化的持久卷：

```yaml
clickhouse:
  persistence:
    enabled: true
    size: 100Gi
    storageClass: "fast-ssd"  # Use cloud-specific storage class
```

**云环境专用存储类：**

* **GKE**: `pd-ssd` 或 `pd-balanced`
* **EKS**: `gp3` 或 `io2`
* **AKS**: `managed-premium` 或 `managed-csi`

### 浏览器兼容性说明 \{#browser-compatibility-notes\}

对于仅使用 HTTP 的部署 (开发/测试环境) ，由于安全上下文要求，某些浏览器可能会报出 crypto API 错误。对于生产环境部署，请始终通过入口配置使用带有有效 TLS 证书的 HTTPS。

有关 TLS 设置说明，请参阅[入口配置](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1#ingress-setup)。

## 后续步骤 \{#next-steps\}

* [配置指南 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - API 密钥、Secret 和入口
* [部署选项 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1) - 外部系统配置
* [Helm 主指南 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-v1) - 基本安装
* [Cloud 部署 (v2.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - v2.x Cloud 指南
* [升级指南](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - 从 v1.x 迁移到 v2.x