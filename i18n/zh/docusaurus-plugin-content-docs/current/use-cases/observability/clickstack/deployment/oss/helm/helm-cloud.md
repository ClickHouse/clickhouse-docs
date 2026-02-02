---
slug: /use-cases/observability/clickstack/deployment/helm-cloud
title: 'Helm 云环境部署'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: '在 GKE、EKS 和 AKS 上部署 ClickStack 的云环境专用配置'
doc_type: 'guide'
keywords: ['ClickStack GKE', 'ClickStack EKS', 'ClickStack AKS', 'Kubernetes 云环境部署', '生产环境部署']
---

本指南介绍在托管 Kubernetes 服务上部署 ClickStack 时的云环境专用配置。有关基础安装步骤，请参阅 [Helm 主部署指南](/docs/use-cases/observability/clickstack/deployment/helm)。

## Google Kubernetes Engine (GKE) \{#google-kubernetes-engine-gke\}

在 GKE 上部署时，由于云平台特有的网络行为，你可能需要覆盖某些配置值。

### LoadBalancer DNS 解析问题 \{#loadbalancer-dns-resolution-issue\}

GKE 的 LoadBalancer 服务可能会导致内部 DNS 解析问题，即 pod（容器组）之间的通信会被解析到外部 IP，而不是保持在集群网络内部。该问题会特别影响 OTel collector 与 OpAMP 服务器之间的连接。

**症状：**

* OTel collector 日志中出现带有集群 IP 地址的“connection refused”错误
* OpAMP 连接失败，例如：`dial tcp 34.118.227.30:4320: connect: connection refused`

**解决方案：**

在 OpAMP 服务器的 URL 中使用完全限定域名（FQDN）：

```shell
helm install my-clickstack clickstack/clickstack \
  --set hyperdx.frontendUrl="http://your-external-ip-or-domain.com" \
  --set otel.opampServerUrl="http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```


### GKE 的其他注意事项 \{#other-gke-considerations\}

```yaml
# values-gke.yaml
hyperdx:
  frontendUrl: "http://34.123.61.99"  # Use your LoadBalancer external IP

otel:
  opampServerUrl: "http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"

# Adjust for GKE pod networking if needed
clickhouse:
  config:
    clusterCidrs:
      - "10.8.0.0/16"  # GKE commonly uses this range
      - "10.0.0.0/8"   # Fallback for other configurations
```


## Amazon EKS \{#amazon-eks\}

在 EKS 上进行部署时，可考虑以下常见配置：

```yaml
# values-eks.yaml
hyperdx:
  frontendUrl: "http://your-alb-domain.com"

# EKS typically uses these pod CIDRs
clickhouse:
  config:
    clusterCidrs:
      - "192.168.0.0/16"
      - "10.0.0.0/8"

# Enable ingress for production
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
```


## Azure AKS \{#azure-aks\}

对于在 AKS 上的部署：

```yaml
# values-aks.yaml
hyperdx:
  frontendUrl: "http://your-azure-lb.com"

# AKS pod networking
clickhouse:
  config:
    clusterCidrs:
      - "10.244.0.0/16"  # Common AKS pod CIDR
      - "10.0.0.0/8"
```


## 生产环境 Cloud 部署检查清单 \{#production-cloud-deployment-checklist\}

在任意云服务商上将 ClickStack 部署到生产环境之前：

- [ ] 使用你的外部域名/IP 正确配置 `frontendUrl`
- [ ] 设置带有 TLS 的入口（Ingress），以提供 HTTPS 访问
- [ ] 如遇到连接问题（尤其是在 GKE 上），将 `otel.opampServerUrl` 替换为 FQDN
- [ ] 根据你的 pod（容器组）网络 CIDR 调整 `clickhouse.config.clusterCidrs`
- [ ] 为生产工作负载配置持久化存储
- [ ] 设置合适的资源 requests 和 limits
- [ ] 启用监控和告警
- [ ] 配置备份和灾难恢复
- [ ] 实施规范的机密信息（Secret）管理

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


### 高可用 \{#high-availability\}

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

确保持久卷已为数据保留正确配置：

```yaml
clickhouse:
  persistence:
    enabled: true
    size: 100Gi
    storageClass: "fast-ssd"  # Use cloud-specific storage class
```

**不同 Cloud 平台对应的存储类：**

* **GKE**: `pd-ssd` 或 `pd-balanced`
* **EKS**: `gp3` 或 `io2`
* **AKS**: `managed-premium` 或 `managed-csi`


### 浏览器兼容性说明 \{#browser-compatibility-notes\}

对于仅使用 HTTP 的部署（开发/测试环境），由于安全上下文（secure context）要求，某些浏览器可能会显示与加密 API 相关的错误。对于生产环境部署，务必通过入口配置启用 HTTPS，并使用正确配置的 TLS 证书。

有关 TLS 配置的说明，请参阅 [入口配置](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup)。

## 后续步骤 \{#next-steps\}

- [配置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API 密钥、机密信息和入口
- [部署选项](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部系统的配置
- [Helm 主指南](/docs/use-cases/observability/clickstack/deployment/helm) - 基础安装