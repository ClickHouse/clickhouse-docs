---
slug: /use-cases/observability/clickstack/deployment/helm-cloud
title: 'Helm 云平台部署'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: '在 GKE、EKS 和 AKS 上部署 ClickStack 的云平台特定配置'
doc_type: 'guide'
keywords: ['ClickStack GKE', 'ClickStack EKS', 'ClickStack AKS', 'Kubernetes 云部署', '生产环境部署']
---

本指南介绍在托管式 Kubernetes 服务上部署 ClickStack 时的云平台特定配置。有关基础安装，请参阅[通用 Helm 部署指南](/docs/use-cases/observability/clickstack/deployment/helm)。



## Google Kubernetes Engine (GKE) {#google-kubernetes-engine-gke}

在部署到 GKE 时,由于云平台特定的网络行为,您可能需要覆盖某些配置值。

### LoadBalancer DNS 解析问题 {#loadbalancer-dns-resolution-issue}

GKE 的 LoadBalancer 服务可能会导致内部 DNS 解析问题,pod 之间的通信会解析为外部 IP 地址,而不是保持在集群网络内部。这会特别影响 OTEL 收集器与 OpAMP 服务器之间的连接。

**症状:**

- OTEL 收集器日志显示带有集群 IP 地址的 "connection refused" 错误
- OpAMP 连接失败,例如:`dial tcp 34.118.227.30:4320: connect: connection refused`

**解决方案:**

为 OpAMP 服务器 URL 使用完全限定域名 (FQDN):

```shell
helm install my-clickstack clickstack/clickstack \
  --set hyperdx.frontendUrl="http://your-external-ip-or-domain.com" \
  --set otel.opampServerUrl="http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```

### 其他 GKE 注意事项 {#other-gke-considerations}


```yaml
# values-gke.yaml
hyperdx:
  frontendUrl: "http://34.123.61.99"  # 使用您的 LoadBalancer 外部 IP

otel:
  opampServerUrl: "http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```


# 如有需要，针对 GKE Pod 网络进行调整

clickhouse:
config:
clusterCidrs:

* &quot;10.8.0.0/16&quot;  # GKE 通常使用此网段
* &quot;10.0.0.0/8&quot;   # 用于其他配置的备用网段

```
```


## Amazon EKS {#amazon-eks}


在 EKS 部署中，可以考虑以下常见配置：

```yaml
# values-eks.yaml
hyperdx:
  frontendUrl: "http://your-alb-domain.com"
```


# EKS 通常使用这些 Pod CIDR
clickhouse:
  config:
    clusterCidrs:
      - "192.168.0.0/16"
      - "10.0.0.0/8"



# 在生产环境中启用 Ingress

hyperdx:
ingress:
enabled: true
host: &quot;hyperdx.yourdomain.com&quot;
tls:
enabled: true

```
```


## Azure AKS {#azure-aks}


针对 AKS 部署：

```yaml
# values-aks.yaml
hyperdx:
  frontendUrl: "http://your-azure-lb.com"
```


# AKS Pod 网络

clickhouse:
config:
clusterCidrs:

* &quot;10.244.0.0/16&quot;  # 常用 AKS Pod CIDR
* &quot;10.0.0.0/8&quot;

```
```


## 生产环境云部署检查清单 {#production-cloud-deployment-checklist}

在任何云服务商上将 ClickStack 部署到生产环境之前:

- [ ] 使用您的外部域名/IP 正确配置 `frontendUrl`
- [ ] 为 HTTPS 访问配置带 TLS 的 ingress
- [ ] 如遇到连接问题,请使用 FQDN 覆盖 `otel.opampServerUrl`(尤其是在 GKE 上)
- [ ] 根据您的 Pod 网络 CIDR 调整 `clickhouse.config.clusterCidrs`
- [ ] 为生产工作负载配置持久化存储
- [ ] 设置合理的资源请求和限制
- [ ] 启用监控和告警
- [ ] 配置备份和灾难恢复
- [ ] 实施妥善的密钥管理


## 生产环境最佳实践 {#production-best-practices}

### 资源管理 {#resource-management}

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

### 高可用性 {#high-availability}

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

### 持久化存储 {#persistent-storage}

确保配置持久化卷以保留数据:

```yaml
clickhouse:
  persistence:
    enabled: true
    size: 100Gi
    storageClass: "fast-ssd" # 使用云平台特定的存储类
```

**云平台特定的存储类:**

- **GKE**: `pd-ssd` 或 `pd-balanced`
- **EKS**: `gp3` 或 `io2`
- **AKS**: `managed-premium` 或 `managed-csi`

### 浏览器兼容性说明 {#browser-compatibility-notes}

对于仅使用 HTTP 的部署(开发/测试环境),某些浏览器可能会因安全上下文要求而显示加密 API 错误。对于生产环境部署,应始终通过 ingress 配置使用带有有效 TLS 证书的 HTTPS。

有关 TLS 设置说明,请参阅 [Ingress 配置](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup)。


## 后续步骤 {#next-steps}

- [配置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API 密钥、Secret 和 Ingress
- [部署选项](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部系统配置
- [Helm 主指南](/docs/use-cases/observability/clickstack/deployment/helm) - 基础安装
