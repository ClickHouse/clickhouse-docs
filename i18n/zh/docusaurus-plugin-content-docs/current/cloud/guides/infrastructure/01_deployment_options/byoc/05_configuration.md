---
title: '基础架构配置'
slug: /cloud/reference/byoc/configurations
sidebar_label: '基础架构配置'
keywords: ['BYOC', '云', '自带云', '基础架构', '配置']
description: '配置负载均衡器、节点组和其他 BYOC 基础架构组件'
doc_type: 'reference'
---

本页面介绍了适用于 BYOC 部署的各类基础架构配置选项。这些配置使您能够自定义网络、安全和计算资源，以满足您的特定需求。

## 负载均衡器 \{#load-balancers\}

BYOC 部署使用 **Network Load Balancers (NLBs)** 来管理并路由发往 ClickHouse 服务的流量。你可以根据自己的网络模型在 *公网* 和 *私网* 负载均衡器端点之间进行选择。

| 负载均衡器类型       | ClickHouse 托管的专用 VPC | 客户自管 VPC            |
|--------------------- |:-------------------------:|:-----------------------:|
| **Public NLB**       | 默认启用                  | 默认禁用                |
| **Private NLB**      | 默认禁用                  | 默认启用                |

**公网负载均衡器：**  

- 提供对 ClickHouse 服务的公网（面向互联网）访问。
- 在使用 ClickHouse 托管的专用 VPC 时通常默认启用。
- 在使用客户自管 VPC 时，为增强安全性通常默认禁用。

**私网负载均衡器：**  

- 提供私有（内部）访问，仅能从已连接的网络内部访问。
- 在使用客户自管 VPC 时通常默认启用。
- 在使用 ClickHouse 托管的专用 VPC 时通常默认禁用。

你可以联系 **ClickHouse Cloud Support**，根据你的需求调整需要启用的端点。

### 适用于 AWS 的私有负载均衡器安全组 \{#private-load-balancer-security-group\}

如果您在 BYOC 部署中选择使用私有负载均衡器，则必须确保已配置合适的安全组规则，以允许来自目标私有网络（例如已建立对等连接的 VPC）的访问。默认情况下，安全组只允许来自该 VPC 内部的流量。

要为私有负载均衡器设置安全组：

**联系 ClickHouse 支持团队**，请求修改入站安全组规则，以允许来自您特定源网络的流量：

- **VPC Peering**：请求添加规则，以允许来自已对等 VPC 的 CIDR 网段的流量。
- **PrivateLink**：无需更改安全组，因为该流量不受负载均衡器安全组的控制。
- **其他网络设置**：说明您的具体场景，以便支持团队提供相应协助。

:::note
所有针对私有负载均衡器安全组的更改都必须由 ClickHouse 支持团队执行。这样可以确保配置的一致性，并避免在 ClickHouse Cloud 托管环境中产生冲突。
:::

## PrivateLink 或 Private Service Connect \{#privatelink-or-private-service-connect\}

为了实现最大程度的网络隔离和安全性，BYOC 部署可以使用 **AWS PrivateLink** 或 **GCP Private Service Connect**。这些选项允许您的应用通过私有方式连接到 ClickHouse Cloud 服务，而无需进行 VPC 对等连接或将终端节点暴露到公共互联网。

有关分步设置说明，请参阅[私有网络设置指南](/cloud/reference/byoc/onboarding/network)。

## Kubernetes API 私有连接 \{#k8s-api-private-connection\}

默认情况下，您的 BYOC 集群的 Kubernetes API 服务器端点可以从公网访问，但会通过 IP 过滤，仅允许来自 ClickHouse NAT Gateway IP 的访问。为了更高的安全性，您可以将 Kubernetes API 服务器限制为只能通过使用 Tailscale 的私有网络连接进行访问。

:::note
如果您完全依赖 Tailscale 来实现私有连通性，一旦 Tailscale agent 不可用，ClickHouse 支持团队可能会失去对您环境的访问权限。这可能会导致排障或支持响应时间延迟。
:::

**联系 ClickHouse 支持团队** 以申请配置私有 API 端点。

## 节点组 \{#node-groups\}

Kubernetes 节点组是由计算实例组成的集合，为在 BYOC 部署中运行 ClickHouse 服务提供所需资源。ClickHouse Cloud 管理这些节点组，并自动处理它们的配置和伸缩。

### 默认配置 \{#default-configuration\}

BYOC 集群默认包含两种主要的节点组类型：

- **System Node Group（系统节点组）**  
  承载关键的系统工作负载——例如 ClickHouse Operator、Istio（用于服务网格 service mesh）、监控组件（Prometheus、Grafana、AlertManager）、cluster autoscaler 以及其他核心服务。这些节点通常使用标准的 x86 实例类型。

- **Workload Node Groups（工作负载节点组）**  
  专用于 ClickHouse 数据工作负载，包括服务器和 Keeper 服务。默认情况下，工作负载节点运行在基于 ARM 的实例上，在性能与成本之间实现高效平衡。不过，它们也可以根据需求配置为其他 CPU/内存规格，或者切换为 x86 架构。

### 自定义节点组 \{#customizing-node-groups\}

需要更为专用的资源或架构？可以使用以下自定义选项——请联系 ClickHouse Support 进行讨论和实施：

- **实例类型选择**  
  选择特定实例类型，以满足性能、合规性、高内存/CPU，或利用预留资源等需求。
- **CPU/内存比例**  
  按需调整工作负载节点组的计算规格。
- **架构**  
  如有需要，可将工作负载节点组从 ARM 切换到 x86。

> **注意：** 不支持 Spot（可抢占）实例；所有 BYOC 节点组默认运行在按需实例上。

:::note
所有节点组的自定义与配置更改都必须通过 ClickHouse Support 协调完成，以确保兼容性、稳定性与最佳性能。
:::

### 自动扩缩容 \{#auto-scaling\}

集群节点组会根据以下因素，由集群自动扩缩容组件（cluster autoscaler）自动进行扩缩容：

- pod（容器组）的资源请求与限制
- 整体集群容量与利用率
- ClickHouse 服务的扩缩容需求

无需人工干预。ClickHouse Cloud 会为您的部署持续管理资源与扩缩容。