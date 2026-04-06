---
title: 'BYOC AWS 私有网络设置'
slug: /cloud/reference/byoc/onboarding/network-aws
sidebar_label: 'AWS 私有网络设置'
keywords: ['BYOC', '云', '自带云环境', 'VPC 对等连接', 'aws', 'PrivateLink']
description: '为 AWS 上的 BYOC 设置 VPC 对等连接或 PrivateLink'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-3.png';
import byoc_vpcpeering4 from '@site/static/images/cloud/reference/byoc-vpcpeering-4.png';
import byoc_privatelink_1 from '@site/static/images/cloud/reference/byoc-privatelink-1.png';
import byoc_privatelink_2 from '@site/static/images/cloud/reference/byoc-privatelink-2.png';

在 AWS 上运行的 ClickHouse BYOC 支持两种私有连接方式：VPC 对等连接和 AWS PrivateLink。

## 先决条件 \{#common-prerequisites\}

VPC 对等连接和 Privatelink 都需要执行的通用步骤。

### 要为 ClickHouse BYOC 启用私有负载均衡器 \{#step-enable-private-load-balancer-for-clickhouse-byoc\}

请联系 ClickHouse Support 以启用私有负载均衡器。

## 配置 VPC 对等连接 \{#aws-vpc-peering\}

如需为 ClickHouse BYOC 创建或删除 VPC 对等连接，请按以下步骤操作：

<VerticalStepper headerLevel="h3">
  ### 创建对等连接 \{#step-1-create-a-peering-connection\}

  1. 在 ClickHouse BYOC 账户中，进入 VPC Dashboard。
  2. 选择 Peering Connections。
  3. 点击 Create Peering Connection。
  4. 将 VPC Requester 设置为 ClickHouse VPC ID。
  5. 将 VPC Accepter 设置为目标 VPC ID。 (如适用，请选择另一个账户。)
  6. 点击 Create Peering Connection。

  <Image img={byoc_vpcpeering} size="lg" alt="BYOC 创建对等连接" border />

  ### 接受对等连接请求 \{#step-2-accept-the-peering-connection-request\}

  前往对等连接所属的账户，在 (VPC -&gt; Peering connections -&gt; Actions -&gt; Accept request) 页面批准此 VPC 对等连接请求。

  <Image img={byoc_vpcpeering2} size="lg" alt="BYOC 接受对等连接" border />

  ### 将目标路由添加到 ClickHouse VPC 路由表 \{#step-3-add-destination-to-clickhouse-vpc-route-tables\}

  在 ClickHouse BYOC 账户中：

  1. 在 VPC Dashboard 中选择 Route Tables。
  2. 搜索 ClickHouse VPC ID，并编辑每个关联到私有子网的路由表。
  3. 在 Routes 选项卡下点击 Edit 按钮。
  4. 点击 Add another route。
  5. 在 Destination 中输入目标 VPC 的 CIDR 范围。
  6. 在 Target 中选择“Peering Connection”和对应的对等连接 ID。

  <Image img={byoc_vpcpeering3} size="lg" alt="BYOC 添加路由表" border />

  ### 将目标路由添加到目标 VPC 路由表 \{#step-4-add-destination-to-the-target-vpc-route-tables\}

  在对等连接的 AWS 账户中：

  1. 在 VPC Dashboard 中选择 Route Tables。
  2. 搜索目标 VPC ID。
  3. 在 Routes 选项卡下点击 Edit 按钮。
  4. 点击 Add another route。
  5. 在 Destination 中输入 ClickHouse VPC 的 CIDR 范围。
  6. 在 Target 中选择“Peering Connection”和对应的对等连接 ID。

  <Image img={byoc_vpcpeering4} size="lg" alt="BYOC 添加路由表" border />

  ### 编辑安全组以允许来自对等 VPC 的访问 \{#step-5-edit-security-group-to-allow-peered-vpc-access\}

  在 ClickHouse BYOC 账户中，您需要更新 Security Group 设置，以允许来自对等 VPC 的流量。请联系 ClickHouse Support，申请添加包含对等 VPC CIDR 范围的入站规则。

  ***

  现在应已可以从对等 VPC 访问 ClickHouse 服务。
</VerticalStepper>

如需通过私有网络访问 ClickHouse，系统会预配私有负载均衡器和端点，以便从用户的对等 VPC 安全连接。私有端点遵循公共端点的格式，并附加 `-private` 后缀。例如：

* **公共端点**：`h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
* **私有端点**：`h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

可选：确认对等连接正常工作后，您可以申请移除 ClickHouse BYOC 的公共负载均衡器。

## 搭建 PrivateLink \{#setup-privatelink\}

AWS PrivateLink 可为您的 ClickHouse BYOC 服务提供安全的私有连接，无需 VPC 对等连接或互联网网关。流量全程在 AWS 网络内部传输，不会经过公共互联网。

<VerticalStepper headerLevel="h3">
  ### 申请配置 PrivateLink \{#step-1-request-privatelink-setup\}

  联系 [ClickHouse Support](https://clickhouse.com/cloud/bring-your-own-cloud)，为您的 BYOC 部署申请配置 PrivateLink。此阶段无需提供特定信息——只需说明您希望搭建 PrivateLink 连接即可。

  ClickHouse Support 将启用所需的基础设施组件，包括**私有负载均衡器**和**PrivateLink 服务端点**。

  ### 在您的 VPC 中创建端点 \{#step-2-create-endpoint\}

  在 ClickHouse Support 完成其侧的 PrivateLink 配置后，您需要在客户端应用所在的 VPC 中创建一个 VPC 端点，以连接到 ClickHouse PrivateLink 服务。

  1. **获取端点服务名称**：
     * ClickHouse Support 将向您提供端点服务名称
     * 您也可以在 AWS VPC 控制台的“Endpoint Services”下找到它 (按服务名称筛选，或查找 ClickHouse 服务)

  <Image img={byoc_privatelink_1} size="lg" alt="BYOC PrivateLink 服务端点" border />

  2. **创建 VPC 端点**：
     * 前往 AWS VPC 控制台 → Endpoints → Create Endpoint
     * 选择“Find service by name”，并输入 ClickHouse Support 提供的端点服务名称
     * 选择您的 VPC 和子网 (建议每个可用区选择一个)
     * **重要**：为该端点启用“Private DNS names”——这是确保 DNS 解析正常工作的必要条件
     * 为该端点选择或创建一个安全组
     * 点击“Create Endpoint”

  :::important
  **DNS 要求**：

  * 创建 VPC 端点时启用“Private DNS names”
  * 确保您的 VPC 已启用“DNS Hostnames” (VPC Settings → DNS resolution and DNS hostnames)

  这些设置是 PrivateLink DNS 正常工作的必要条件。
  :::

  3. **批准端点连接**：
     * 创建端点后，您需要批准该连接请求
     * 在 VPC 控制台中，前往“Endpoint Connections”
     * 找到来自 ClickHouse 的连接请求，然后点击“Accept”予以批准

  <Image img={byoc_privatelink_2} size="lg" alt="BYOC PrivateLink 批准" border />

  ### 将端点 ID 添加到服务允许列表 \{#step-3-add-endpoint-id-allowlist\}

  在您的 VPC 端点创建完成且连接已获批准后，您需要将端点 ID 添加到每个希望通过 PrivateLink 访问的 ClickHouse 服务的允许列表中。

  1. **获取您的端点 ID**：
     * 在 AWS VPC 控制台中，前往 Endpoints
     * 选择您新创建的端点
     * 复制端点 ID (格式类似于 `vpce-xxxxxxxxxxxxxxxxx`)

  2. **联系 ClickHouse Support**：
     * 将端点 ID 提供给 ClickHouse Support
     * 指定哪些 ClickHouse 服务应允许来自此端点的访问
     * ClickHouse Support 会将该端点 ID 添加到服务允许列表中

  ### 通过 PrivateLink 连接到 ClickHouse \{#step-4-connect-via-privatelink\}

  在端点 ID 被添加到允许列表后，您就可以使用 PrivateLink 端点连接到您的 ClickHouse 服务。

  PrivateLink 端点的格式与公共端点类似，但包含 `vpce` 子域。例如：

  * **公共端点**：`h5ju65kv87.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`
  * **PrivateLink 端点**：`h5ju65kv87.vpce.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`

  当您使用 `vpce` 子域格式时，VPC 中的 DNS 解析会自动将流量路由到 PrivateLink 端点。
</VerticalStepper>

### PrivateLink 访问控制 \{#privatelink-access-control\}

通过 PrivateLink 访问 ClickHouse 服务的权限由两个层面的机制控制：

1. **Istio Authorization Policy**：ClickHouse Cloud 的服务级授权策略
2. **VPC Endpoint Security Group**：附加到您的 VPC 端点上的安全组，用于控制您的 VPC 中哪些资源可以使用该端点

:::note
私有负载均衡器的“Enforce inbound rules on PrivateLink traffic”功能已禁用，因此访问权限仅由 Istio 授权策略和您的 VPC 端点安全组控制。
:::

### PrivateLink DNS \{#privatelink-dns\}

BYOC 端点的 PrivateLink DNS (采用 `*.vpce.{subdomain}` 格式) 利用了 AWS PrivateLink 内置的“Private DNS names”功能。无需配置 Route53 记录——在以下情况下，DNS 会自动完成解析：

* 您的 VPC 端点已启用“Private DNS names”
* 您的 VPC 已启用“DNS Hostnames”

这样可确保使用 `vpce` 子域名的连接自动通过 PrivateLink 端点进行路由，而无需额外的 DNS 配置。