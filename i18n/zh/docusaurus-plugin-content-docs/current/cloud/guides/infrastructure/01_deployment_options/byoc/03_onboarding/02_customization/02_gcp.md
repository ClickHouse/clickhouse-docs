---
title: 'GCP 自定义配置'
slug: /cloud/reference/byoc/onboarding/customization-gcp
sidebar_label: 'GCP 自定义配置'
keywords: ['BYOC', '云', '自有云', '入门引导', 'GCP', 'VPC']
description: '将 ClickHouse BYOC 部署到您现有的 GCP VPC 中'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_gcp_subnet from '@site/static/images/cloud/reference/byoc-gcp-subnet.png';

## 适用于 GCP 的客户自管 VPC (BYO-VPC) \{#customer-managed-vpc-gcp\}

如果您希望使用现有 VPC 来部署 ClickHouse BYOC，而不是由 ClickHouse Cloud 预配新的 VPC，请按以下步骤操作。此方法可让您更好地控制网络配置，并将 ClickHouse BYOC 集成到现有网络基础设施中。

### 配置现有 VPC \{#configure-existing-vpc\}

1. 在 [ClickHouse BYOC 支持的区域](/cloud/reference/byoc/supported-regions)中，至少为 ClickHouse Kubernetes (GKE) 集群分配 1 个私有子网。确保该子网的 CIDR 范围至少为 `/24` (例如 10.0.0.0/24) ，以便为 GKE 集群节点提供充足的 IP 地址。
2. 在该私有子网中，至少分配 1 个用于 GKE 集群 Pod (容器组) 的次级 IPv4 地址范围。该次级范围至少应为 `/23`，以便为 GKE 集群 Pod (容器组) 提供充足的 IP 地址。
3. 在该子网上启用 **Private Google Access**。这样，GKE 节点无需外部 IP 地址即可访问 Google API 和服务。

<Image img={byoc_gcp_subnet} size="lg" alt="BYOC GCP 子网详细信息，显示主 IPv4 范围和次级 IPv4 范围，并已启用 Private Google Access" />

### 确保网络连通性 \{#ensure-network-connectivity\}

**Cloud NAT 网关**
确保已为该 VPC 部署 [Cloud NAT 网关](https://cloud.google.com/nat/docs/overview)。ClickHouse BYOC 组件需要出站互联网访问，才能与 Tailscale 控制平面通信。Tailscale 用于为私有管理操作提供安全的零信任网络。Cloud NAT 网关可为没有外部 IP 地址的实例提供这种出站连接。

**DNS 解析**
确保您的 VPC 具备正常的 DNS 解析能力，且不会阻止、干扰或覆盖标准 DNS 名称。ClickHouse BYOC 依赖 DNS 来解析 Tailscale 控制服务器以及 ClickHouse 服务端点。如果 DNS 不可用或配置错误，BYOC 服务可能无法连接或无法正常运行。

### 联系 ClickHouse 支持团队 \{#contact-clickhouse-support\}

完成上述配置步骤后，请使用以下信息创建支持工单：

* 您的 GCP 项目 ID
* 您希望部署服务的 GCP 区域
* 您的 VPC 网络名称
* 您为 ClickHouse 分配的子网名称
* (可选) 专用于 ClickHouse 的次级 IPv4 地址范围名称。仅当私有子网具有多个次级 IPv4 地址范围，且并非全部都将用于 ClickHouse 时，才需要提供此信息

我们的团队将审核您的配置，并在我们这边完成预配。