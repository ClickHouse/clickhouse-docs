---
title: 'BYOC GCP 私有网络设置'
slug: /cloud/reference/byoc/onboarding/network-gcp
sidebar_label: 'GCP 私有网络设置'
keywords: ['BYOC', '云', '自带云环境', 'VPC 对等连接', 'gcp', 'private service connect']
description: '为 GCP 上的 BYOC 配置 VPC 对等连接或 Private Service Connect'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-gcp-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-gcp-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-gcp-3.png';
import byoc_privatelink_1 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-1.png';
import byoc_privatelink_2 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-2.png';
import byoc_privatelink_3 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-3.png';
import byoc_privatelink_4 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-4.png';
import byoc_privatelink_5 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-5.png';
import byoc_privatelink_6 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-6.png';

ClickHouse BYOC 在 GCP 上支持两种私有连接选项：VPC 对等连接和 Private Service Connect。流量全程在 GCP 网络内传输，不会经过公共互联网。

## 前提条件 \{#common-prerequisites\}

VPC 对等连接和 Private Service Connect 均需执行的通用步骤。

### 为 ClickHouse BYOC 启用私有负载均衡器 \{#step-enable-private-load-balancer-for-clickhouse-byoc\}

请联系 ClickHouse Support 以启用私有负载均衡器。

## 搭建 VPC 对等连接 \{#gcp-vpc-peering\}

请先熟悉 [GCP VPC peering 功能](https://docs.cloud.google.com/vpc/docs/vpc-peering)，并注意 VPC 对等连接的限制 (例如，已对等连接的 VPC 网络之间，子网 IP 范围不能重叠) 。ClickHouse BYOC 使用私有负载均衡器，通过对等连接为 ClickHouse 服务提供网络连通性。

要为 ClickHouse BYOC 创建或删除 VPC 对等连接，请按以下步骤操作：

:::note
以下示例步骤适用于简单场景；对于更进阶的场景 (例如与本地网络连通的对等连接) ，可能需要做一些调整。
:::

<VerticalStepper headerLevel="h3">
  ### 创建对等连接 \{#step-1-create-a-peering-connection\}

  在此示例中，我们将为 BYOC VPC 网络与另一个现有 VPC 网络搭建对等连接。

  1. 在 ClickHouse BYOC 的 Google Cloud 项目中，前往 “VPC Network”。
  2. 选择 “VPC network peering”。
  3. 点击 “Create connection”。
  4. 根据你的需求填写必要字段。下图展示了如何在同一个 GCP 项目内创建对等连接。

  <Image img={byoc_vpcpeering} size="md" alt="BYOC 创建对等连接" border />

  GCP VPC 对等连接需要在这两个网络之间建立 2 个连接才能生效 (即，一个从 BYOC 网络到现有 VPC 网络，另一个从现有 VPC 网络到 BYOC 网络) 。因此，你还需要按相反方向再创建 1 个连接。下图展示了第二个对等连接的创建界面：

  <Image img={byoc_vpcpeering2} size="md" alt="BYOC 接受对等连接" border />

  两个连接都创建完成后，刷新 Google Cloud Console 网页，这 2 个连接的状态应变为 “Active”：

  <Image img={byoc_vpcpeering3} size="lg" alt="BYOC 接受对等连接" border />

  现在，应可从已建立对等连接的 VPC 访问 ClickHouse 服务。

  ### 通过对等连接访问 ClickHouse 服务 \{#step-2-access-ch-service-via-peering\}

  为了以私有方式访问 ClickHouse，系统会预配私有负载均衡器和私有端点，以便从用户已建立对等连接的 VPC 安全连接。私有端点沿用公网端点的格式，并带有 `-private` 后缀。例如：

  * **公网端点**: `h5ju65kv87.mhp0y4dmph.us-east1.gcp.byoc.clickhouse.cloud`
  * **私有端点**: `h5ju65kv87-private.mhp0y4dmph.us-east1.gcp.byoc.clickhouse.cloud`
</VerticalStepper>

## 搭建 PSC (Private Service Connect) \{#gcp-psc\}

GCP PSC (Private Service Connect) 可为您的 ClickHouse BYOC 服务提供安全的私有网络连接，无需 VPC 对等连接或互联网网关。

<VerticalStepper headerLevel="h3">
  ### 申请设置 PSC 服务 \{#step-1-request-psc-setup\}

  联系 [ClickHouse Support](https://clickhouse.com/cloud/bring-your-own-cloud)，为您的 BYOC 部署申请设置 PSC 服务。此阶段无需提供特定信息——只需说明您希望搭建 PSC 连接即可。

  ClickHouse Support 将启用所需的基础设施组件，包括**私有负载均衡器**和 **PSC 服务**。

  ### 获取 GCP PSC 服务名称和 DNS 名称 \{#step-2-obtain-gcp-service-attachment-and-dns-name-for-private-service-connect\}

  ClickHouse Support 将向您提供 PSC 服务名称。您也可以在 ClickHouse Cloud 控制台中的 &quot;Organization&quot; -&gt; &quot;Infrastructure&quot; 下获取；点击基础设施名称即可查看详细信息。

  <Image img={byoc_privatelink_1} size="lg" alt="BYOC PSC 端点" border />

  <Image img={byoc_privatelink_2} size="lg" alt="BYOC PSC 端点" border />

  您也可以在 GCP Private Service Connect 控制台的 &quot;Published services&quot; 下找到 PSC 服务名称 (按服务名称筛选，或查找 ClickHouse 服务) 。

  <Image img={byoc_privatelink_3} size="lg" alt="BYOC PSC 端点" border />

  <Image img={byoc_privatelink_4} size="lg" alt="BYOC PSC 端点" border />

  ### 在您的网络中创建 PSC 端点 \{#step-3-create-endpoint\}

  在 ClickHouse Support 完成其侧的 PSC 服务启用后，您需要在客户端应用所在的网络中创建一个 PSC 端点，以连接到 ClickHouse PSC 服务。

  1. **创建 PSC 端点**：

  * 前往 GCP Console -&gt; Network Services → Private Service Connect → Connect Endpoint
  * 在 &quot;Target&quot; 中选择 &quot;Published service&quot;，并在 &quot;Target details&quot; 中输入上一步获取的 PSC 服务名称
  * 输入一个有效的端点名称
  * 选择您的网络和子网 (即客户端应用发起连接所使用的网络)
  * 为该端点选择或创建一个新的 IP 地址，该 IP 地址将在步骤 [为端点设置私有 DNS 名称](#step-4-set-private-dns-name-for-endpoint) 中使用
  * 点击 &quot;Add Endpoint&quot;，等待片刻以完成端点创建。
  * 端点状态应变为 &quot;Accepted&quot;；如果未自动变为该状态，请联系 ClickHouse Support。

  <Image img={byoc_privatelink_5} size="lg" alt="BYOC PSC 端点创建" border />

  2. **获取 PSC Connection ID**：

  * 点击进入端点详情，并获取 &quot;PSC Connection ID&quot;，该 ID 将在步骤 [将端点的 PSC Connection ID 添加到服务允许列表](#step-5-add-endpoint-id-allowlist) 中使用

  <Image img={byoc_privatelink_6} size="lg" alt="BYOC PSC 端点详情" border />

  ### 为端点设置私有 DNS 名称 \{#step-4-set-private-dns-name-for-endpoint\}

  :::note
  配置 DNS 的方式有多种。请根据您的具体使用场景设置 DNS。
  :::

  您需要将 [获取 GCP PSC 服务名称和 DNS 名称](#step-2-obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 步骤中获取的 &quot;DNS name&quot; 的所有子域名 (通配符) 指向 GCP PSC 端点 IP 地址。这可确保您 VPC/网络中的服务或组件能够正确解析该地址。

  ### 将端点的 PSC Connection ID 添加到服务允许列表 \{#step-5-add-endpoint-id-allowlist\}

  创建好 PSC 端点且其状态为 &quot;Accepted&quot; 后，您需要将该端点的 PSC Connection ID 添加到**每个要通过 PSC 访问的 ClickHouse 服务**的允许列表中。

  **联系 ClickHouse Support**：

  * 向 ClickHouse Support 提供端点的 PSC Connection ID
  * 说明哪些 ClickHouse 服务应允许来自此端点的访问
  * ClickHouse Support 将把该端点的 Connection ID 添加到服务允许列表中

  ### 通过 PSC 连接到 ClickHouse \{#step-6-connect-via-psc-endpoint\}

  在端点 Connection ID 被添加到允许列表后，您就可以使用 PSC 端点连接到您的 ClickHouse 服务。

  PSC 端点格式与公网端点类似，但会包含一个 `p` 子域名。例如：

  * **公网端点**: `h5ju65kv87.mhp0y4dmph.us-east1.gcp.clickhouse-byoc.com`
  * **PSC 端点**: `h5ju65kv87.p.mhp0y4dmph.us-east1.gcp.clickhouse-byoc.com`
</VerticalStepper>