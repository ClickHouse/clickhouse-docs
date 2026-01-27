---
title: '私有网络配置'
slug: /cloud/reference/byoc/onboarding/network
sidebar_label: '私有网络配置'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'vpc peering', 'privatelink']
description: '在您自己的云基础设施上部署 ClickHouse'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-3.png';
import byoc_vpcpeering4 from '@site/static/images/cloud/reference/byoc-vpcpeering-4.png';
import byoc_privatelink_1 from '@site/static/images/cloud/reference/byoc-privatelink-1.png';
import byoc_privatelink_2 from '@site/static/images/cloud/reference/byoc-privatelink-2.png';

ClickHouse BYOC 支持多种私有网络选项，以增强安全性并为您的服务提供直接连接能力。本指南将介绍推荐的方法，帮助您在自己的 AWS 或 GCP 账户中，将 ClickHouse Cloud 部署安全地连接到其他网络或服务，例如内部应用程序或分析工具。我们将介绍 VPC Peering、AWS PrivateLink 和 GCP Private Service Connect 等选项，并概述每种方式的主要步骤和注意事项。

如果您需要为 ClickHouse BYOC 部署配置私有网络连接，请按照本指南中的步骤操作，或联系 ClickHouse Support 获取更高级场景的协助。


## 配置 VPC 对等连接（AWS） \{#aws-vpc-peering\}

要为 ClickHouse BYOC 创建或删除 VPC 对等连接（VPC peering），请按照以下步骤操作：

<VerticalStepper headerLevel="h3">

### 为 ClickHouse BYOC 启用私有负载均衡器 \{#step-1-enable-private-load-balancer-for-clickhouse-byoc\}
联系 ClickHouse Support 以启用 Private Load Balancer。

### 创建对等连接 \{#step-2-create-a-peering-connection\}
1. 在 ClickHouse BYOC 账户中进入 VPC 控制台（VPC Dashboard）。
2. 选择 Peering Connections。
3. 点击 Create Peering Connection。
4. 将 VPC Requester 设置为 ClickHouse VPC ID。
5. 将 VPC Accepter 设置为目标 VPC ID（如适用，请选择另一个账户）。
6. 点击 Create Peering Connection。

<Image img={byoc_vpcpeering} size="lg" alt="BYOC Create Peering Connection" border />

### 接受对等连接请求 \{#step-3-accept-the-peering-connection-request\}
在对等端账户中，通过 (VPC -> Peering connections -> Actions -> Accept request) 页面批准该 VPC 对等连接请求。

<Image img={byoc_vpcpeering2} size="lg" alt="BYOC Accept Peering Connection" border />

### 向 ClickHouse VPC 路由表添加目标 \{#step-4-add-destination-to-clickhouse-vpc-route-tables\}
在 ClickHouse BYOC 账户中，
1. 在 VPC 控制台中选择 Route Tables。
2. 搜索 ClickHouse VPC ID，编辑附加到私有子网的每个路由表。
3. 在 Routes 选项卡下点击 Edit 按钮。
4. 点击 Add another route。
5. 在 Destination 中输入目标 VPC 的 CIDR 范围。
6. 在 Target 中选择 “Peering Connection”，并选择该对等连接的 ID。

<Image img={byoc_vpcpeering3} size="lg" alt="BYOC Add route table" border />

### 向目标 VPC 路由表添加目标 \{#step-5-add-destination-to-the-target-vpc-route-tables\}
在对等端的 AWS 账户中，
1. 在 VPC 控制台中选择 Route Tables。
2. 搜索目标 VPC ID。
3. 在 Routes 选项卡下点击 Edit 按钮。
4. 点击 Add another route。
5. 在 Destination 中输入 ClickHouse VPC 的 CIDR 范围。
6. 在 Target 中选择 “Peering Connection”，并选择该对等连接的 ID。

<Image img={byoc_vpcpeering4} size="lg" alt="BYOC Add route table" border />

### 编辑安全组以允许对等 VPC 访问 \{#step-6-edit-security-group-to-allow-peered-vpc-access\}

在 ClickHouse BYOC 账户中，您需要更新 Security Group 设置，以允许来自对等 VPC 的流量。请联系 ClickHouse Support，请求添加包含对等 VPC CIDR 范围的入站规则。

---
现在应可以从对等 VPC 访问 ClickHouse 服务。
</VerticalStepper>

为了通过私有方式访问 ClickHouse，会为来自用户对等 VPC 的安全连接预配一个私有负载均衡器和私有 endpoint。该私有 endpoint 的格式与公共 endpoint 相同，但带有 `-private` 后缀。例如：

- **Public endpoint**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **Private endpoint**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

可选：在验证 peering 正常工作之后，您可以请求删除 ClickHouse BYOC 的公共负载均衡器。

## 配置 PrivateLink（AWS） \{#setup-privatelink\}

AWS PrivateLink 为你的 ClickHouse BYOC 服务提供安全、私有的连接，而无需 VPC 对等连接或 Internet 网关。流量完全在 AWS 网络内部传输，从不经过公共互联网。

<VerticalStepper headerLevel="h3">

### 请求配置 PrivateLink \{#step-1-request-privatelink-setup\}

联系 [ClickHouse Support](https://clickhouse.com/cloud/bring-your-own-cloud) 请求为你的 BYOC 部署配置 PrivateLink。在此阶段不需要提供特定信息——只需说明你希望配置 PrivateLink 连接即可。

ClickHouse Support 将启用必要的基础设施组件，包括 **私有负载均衡器** 和 **PrivateLink 服务端点**。

### 在你的 VPC 中创建端点 \{#step-2-create-endpoint\}

在 ClickHouse Support 端启用 PrivateLink 之后，你需要在客户端应用所在的 VPC 中创建一个 VPC 端点，以连接到 ClickHouse PrivateLink 服务。

1. **获取 Endpoint Service Name**：
   - ClickHouse Support 会向你提供 Endpoint Service 名称
   - 你也可以在 AWS VPC 控制台的 “Endpoint Services” 中找到它（按服务名称过滤或查找 ClickHouse 服务）

<Image img={byoc_privatelink_1} size="lg" alt="BYOC PrivateLink 服务端点" border />

2. **创建 VPC Endpoint**：
   - 进入 AWS VPC Console → Endpoints → Create Endpoint
   - 选择 “Find service by name”，并输入由 ClickHouse Support 提供的 Endpoint Service 名称
   - 选择你的 VPC 并选择子网（建议每个可用区选择一个子网）
   - **重要**：为该端点启用 “Private DNS names”——这是确保 DNS 正常解析所必需的
   - 为端点选择或创建一个安全组
   - 点击 “Create Endpoint”

:::important
**DNS 要求**： 
- 在创建 VPC 端点时启用 “Private DNS names”
- 确保你的 VPC 启用了 “DNS Hostnames”（VPC Settings → DNS resolution 和 DNS hostnames）

这些设置是 PrivateLink DNS 正常工作的前提条件。
:::

3. **批准端点连接**：
   - 创建端点后，你需要批准连接请求
   - 在 VPC Console 中进入 “Endpoint Connections”
   - 找到来自 ClickHouse 的连接请求并点击 “Accept” 进行批准

<Image img={byoc_privatelink_2} size="lg" alt="BYOC PrivateLink 连接批准" border />

### 将 Endpoint ID 添加到服务允许列表 \{#step-3-add-endpoint-id-allowlist\}

当你的 VPC 端点创建完成且连接已获批准后，你需要将该 Endpoint ID 添加到每个希望通过 PrivateLink 访问的 ClickHouse 服务的允许列表中。

1. **获取你的 Endpoint ID**：
   - 在 AWS VPC Console 中进入 Endpoints
   - 选择你新创建的端点
   - 复制 Endpoint ID（其格式类似于 `vpce-xxxxxxxxxxxxxxxxx`）

2. **联系 ClickHouse Support**：
   - 将 Endpoint ID 提供给 ClickHouse Support
   - 指定应允许此端点访问哪些 ClickHouse 服务
   - ClickHouse Support 会将 Endpoint ID 添加到对应服务的允许列表中

### 通过 PrivateLink 连接到 ClickHouse \{#step-4-connect-via-privatelink\}

在 Endpoint ID 已添加到允许列表后，你就可以使用 PrivateLink 端点连接到你的 ClickHouse 服务。

PrivateLink 端点的格式与公共端点类似，但包含一个 `vpce` 子域。例如：

- **公共端点**：`h5ju65kv87.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`
- **PrivateLink 端点**：`h5ju65kv87.vpce.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`

在你的 VPC 中进行 DNS 解析时，当你使用 `vpce` 子域格式时，流量会自动通过 PrivateLink 端点进行路由。

</VerticalStepper>

### PrivateLink 访问控制 \{#privatelink-access-control\}

通过 PrivateLink 访问 ClickHouse 服务受两个层级的控制：

1. **Istio Authorization Policy**：ClickHouse Cloud 的服务级别授权策略
2. **VPC Endpoint Security Group**：附加到您的 VPC 终端节点（VPC endpoint）的安全组，用于控制您 VPC 中哪些资源可以使用该终端节点

:::note
私有负载均衡器的“Enforce inbound rules on PrivateLink traffic”功能已禁用，因此访问仅由 Istio 授权策略和您的 VPC 终端节点的安全组进行控制。
:::

### PrivateLink DNS \{#privatelink-dns\}

用于 BYOC 终端节点的 PrivateLink DNS（采用 `*.vpce.{subdomain}` 格式）利用了 AWS PrivateLink 内置的 “Private DNS names” 功能。无需配置 Route 53 记录——在以下条件满足时，DNS 解析会自动完成：

- 在 VPC 终端节点上启用了 “Private DNS names”
- VPC 启用了 “DNS Hostnames”

这样可确保使用 `vpce` 子域的连接会自动通过 PrivateLink 终端节点路由，而无需额外的 DNS 配置。

## VPC Peering（GCP）和 Private Service Connect（GCP） \{#setup-gcp\}

GCP VPC Peering 和 Private Service Connect 为基于 GCP 的 BYOC 部署提供类似的专用私有连通能力。此功能目前仍在开发中。如果您需要在 GCP BYOC 部署中使用 VPC Peering 或 Private Service Connect，请[联系 ClickHouse 支持](https://clickhouse.com/cloud/bring-your-own-cloud)，以讨论可用性和配置要求。