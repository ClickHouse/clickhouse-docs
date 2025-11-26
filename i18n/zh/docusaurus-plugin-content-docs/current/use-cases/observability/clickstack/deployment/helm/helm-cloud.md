---
slug: /use-cases/observability/clickstack/deployment/helm-cloud
title: 'Helm 云部署'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: '在 GKE、EKS 和 AKS 上部署 ClickStack 的云平台特定配置'
doc_type: 'guide'
keywords: ['ClickStack GKE', 'ClickStack EKS', 'ClickStack AKS', 'Kubernetes 云部署', '生产部署']
---

本指南介绍在托管 Kubernetes 服务上部署 ClickStack 时的云平台特定配置。有关基础安装，请参阅 [Helm 通用部署指南](/docs/use-cases/observability/clickstack/deployment/helm)。

## Google Kubernetes Engine (GKE) {#google-kubernetes-engine-gke}

在部署到 GKE 时，由于云环境特有的网络特性，可能需要覆盖某些默认配置值。

### LoadBalancer DNS 解析问题

GKE 的 LoadBalancer 服务可能会导致内部 DNS 解析问题，即 pod（容器组）之间的通信会被解析到外部 IP，而不是保持在集群网络内部。这会特别影响 OTel collector 与 OpAMP server 之间的连接。

**症状：**

* OTel collector 日志中出现带有集群 IP 地址的 “connection refused” 错误
* OpAMP 连接失败，例如：`dial tcp 34.118.227.30:4320: connect: connection refused`

**解决方案：**

在 OpAMP server 的 URL 中使用完全限定域名（FQDN）：

```shell
helm install my-clickstack clickstack/clickstack \
  --set hyperdx.frontendUrl="http://your-external-ip-or-domain.com" \
  --set otel.opampServerUrl="http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```


### 其他 GKE 注意事项

```yaml
# values-gke.yaml
hyperdx:
  frontendUrl: "http://34.123.61.99"  # 使用您的 LoadBalancer 外部 IP

otel:
  opampServerUrl: "http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"

# 如需要，可根据 GKE pod（容器组）网络进行调整
clickhouse:
  config:
    clusterCidrs:
      - "10.8.0.0/16"  # GKE 通常使用此范围
      - "10.0.0.0/8"   # 其他配置的后备选项
```


## Amazon EKS

在 EKS 上进行部署时，可以考虑以下常见配置：

```yaml
# values-eks.yaml
hyperdx:
  frontendUrl: "http://your-alb-domain.com"

# EKS 通常使用以下 pod CIDR
clickhouse:
  config:
    clusterCidrs:
      - "192.168.0.0/16"
      - "10.0.0.0/8"

# 为生产环境启用 Ingress
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
```


## Azure AKS

适用于 AKS 部署：

```yaml
# values-aks.yaml
hyperdx:
  frontendUrl: "http://your-azure-lb.com"

# AKS pod（容器组）网络配置
clickhouse:
  config:
    clusterCidrs:
      - "10.244.0.0/16"  # 常见 AKS pod（容器组）CIDR
      - "10.0.0.0/8"
```


## 生产环境云部署检查清单 {#production-cloud-deployment-checklist}

在任何云服务商上将 ClickStack 部署到生产环境之前：

- [ ] 使用外部域名/IP 正确配置 `frontendUrl`
- [ ] 配置启用 TLS 的入口（Ingress），提供 HTTPS 访问
- [ ] 如果遇到连接问题（尤其是在 GKE 上），将 `otel.opampServerUrl` 设置为 FQDN
- [ ] 根据 pod（容器组）网络 CIDR 调整 `clickhouse.config.clusterCidrs`
- [ ] 为生产工作负载配置持久存储
- [ ] 设置合适的资源请求和限制
- [ ] 启用监控和告警
- [ ] 配置备份和灾难恢复
- [ ] 实施适当的 Secret 管理

## 生产环境最佳实践 {#production-best-practices}

### 资源管理

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


### 高可用性

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


### 持久化存储

确保持久卷已配置好用于数据保留：

```yaml
clickhouse:
  persistence:
    enabled: true
    size: 100Gi
    storageClass: "fast-ssd"  # 使用云平台特定的存储类
```

**各云平台特定的存储类：**

* **GKE**: `pd-ssd` 或 `pd-balanced`
* **EKS**: `gp3` 或 `io2`
* **AKS**: `managed-premium` 或 `managed-csi`


### 浏览器兼容性注意事项 {#browser-compatibility-notes}

对于仅使用 HTTP 的部署（开发/测试环境），某些浏览器可能会因为安全上下文要求而在使用加密 API 时出现错误。对于生产环境部署，请务必通过入口配置使用启用正确 TLS 证书的 HTTPS。

有关 TLS 配置步骤，请参阅[入口配置](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup)。

## 后续步骤 {#next-steps}

- [配置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API 密钥、机密信息和入口
- [部署选项](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部系统配置
- [Helm 主指南](/docs/use-cases/observability/clickstack/deployment/helm) - 基本安装