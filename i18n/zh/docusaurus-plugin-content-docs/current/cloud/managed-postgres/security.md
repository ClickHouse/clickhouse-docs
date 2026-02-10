---
slug: /cloud/managed-postgres/security
sidebar_label: '安全性'
title: '安全性'
description: 'ClickHouse Managed Postgres 的安全功能，包括 IP 白名单、加密和 Private Link'
keywords: ['Postgres 安全性', 'IP 白名单', '加密', 'TLS', 'SSL', 'Private Link', '备份保留期']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import ipFilters from '@site/static/images/managed-postgres/ip-filters.png';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="security" />

Managed Postgres 采用企业级安全功能构建，以保护您的数据并满足合规性要求。本页将介绍网络安全、加密以及备份保留策略。


## IP 白名单 \{#ip-whitelisting\}

IP 过滤器用于控制哪些源 IP 地址可以连接到你的 Managed Postgres 实例，在网络层面提供访问控制，从而保护数据库免受未授权连接。

<Image img={ipFilters} alt="IP 访问列表配置" size="md" border/>

### 配置 IP 过滤器 \{#configuring-ip-filters\}

有关配置 IP 过滤器的详细信息，请参阅 [Settings](/cloud/managed-postgres/settings#ip-filters) 页面。

可以指定：

- 单个 IP 地址（例如 `203.0.113.5`）
- 网络的 CIDR 网段（例如 `192.168.1.0/24`）
- **Anywhere（任意地址）**：允许所有 IP 地址（不建议在生产环境中使用）
- **Nowhere（全部禁止）**：阻止所有连接

:::warning 生产环境最佳实践
如果未配置 IP 过滤器，则默认允许来自所有 IP 地址的连接。对于生产环境工作负载，请将访问限制在已知的 IP 地址或 CIDR 网段内。建议仅允许来自以下来源的访问：

- 应用服务器
- VPN 网关的 IP 地址
- 用于管理访问的跳板机（bastion host）
- 用于自动化部署的 CI/CD 流水线的 IP 地址
:::

## 加密 \{#encryption\}

托管版 Postgres 会对您的数据进行静态加密和传输加密，以确保全面的数据保护。

### 静态加密 \{#encryption-at-rest\}

Managed Postgres 存储的所有数据均采用静态加密，以防止未经授权访问底层存储基础设施。

#### NVMe 存储加密 \{#nvme-encryption\}

存储在 NVMe 驱动器上的数据库文件、事务日志和临时文件会采用行业标准的加密算法进行加密。此加密机制对你的应用程序完全透明，无需任何额外配置。

#### 对象存储加密（S3） \{#s3-encryption\}

存储在对象存储中的备份和预写日志（Write-Ahead Log，WAL）归档在静态存储时同样会被加密。这包括：

- 每日完整备份
- 增量 WAL 归档
- 时间点恢复数据

所有备份数据都存储在专用、隔离的存储桶（bucket）中，并为每个实例单独设定凭证范围，从而确保备份数据保持安全，只能被授权系统访问。

:::info
静态数据加密在所有 Managed Postgres 实例中默认启用且无法禁用，无需进行任何额外配置。
:::

### 传输中加密 \{#encryption-in-transit\}

所有与 Managed Postgres 的网络连接都使用 TLS（Transport Layer Security，传输层安全协议）进行保护，以保障数据在应用程序与数据库之间传输过程中的安全。

#### TLS/SSL 配置 \{#tls-ssl\}

默认情况下，连接会使用 TLS 加密，但不进行证书验证。对于生产环境，我们建议使用经过验证的 TLS 进行连接，以确保您正在与正确的服务器通信。

有关 TLS 配置和连接选项的更多详细信息，请参阅[连接](/cloud/managed-postgres/connection#tls)页面。

## Private Link \{#private-link\}

Private Link 允许在不将流量暴露到公共互联网的情况下，在您的 Managed Postgres 实例与 Virtual Private Cloud (VPC) 之间建立私有连接，从而在网络隔离和安全性方面提供额外一层保障。

:::note 需要手动配置
Private Link 功能已支持，但需要由 ClickHouse 支持团队进行手动配置。此功能非常适合具有严格网络隔离要求的企业级客户。
:::

### 申请配置 Private Link \{#requesting-private-link\}

要为托管 Postgres 实例启用 Private Link：

1. **联系 ClickHouse 支持**，创建一个支持工单
2. **提供以下信息**：
   - 你的 ClickHouse 组织 ID
   - Postgres 服务的 ID/主机名
   - 你希望通过 Private Link 进行连接的 AWS 账户 ID/ARN
     - （可选）除 Postgres 实例所在区域以外，你希望发起连接的其他区域

3. **ClickHouse 支持将会**：
   - 在托管 Postgres 侧预配 Private Link 端点
   - 向你提供端点连接详情，你可以使用这些信息创建 endpoint interface（终端节点接口）。

4. **配置你的 Private Link**：
   - 前往 AWS 设置中的 endpoint interface（终端节点接口），使用 ClickHouse 支持提供的配置来创建 Private Link。
   - 当你的 Private Link 处于“Available”状态后，你可以使用 AWS 控制台中提供的 Private DNS 名称进行连接。

## 备份保留策略 \{#backup-retention\}

托管 Postgres 会自动备份您的数据，以防范意外删除、数据损坏或其他导致数据丢失的情况。

### 保留策略 \{#retention-policy\}

- **默认保留期**：7 天
- **备份频率**：每天全量备份 + 持续 WAL 归档（每 60 秒或 16 MB，以先到者为准）
- **恢复精度**：在保留窗口内支持任意时间点恢复（Point-in-time recovery）

### 备份安全性 \{#backup-security\}

备份与您的主数据具备相同级别的安全保障：

- 对象存储中的**静态数据加密（Encryption at rest）**
- 每个实例使用**隔离的存储桶**，并配限定范围的凭据
- **访问控制**仅授予与该备份关联的 Postgres 实例。

有关备份策略和时间点恢复的更多详细信息，请参阅[备份与恢复](/cloud/managed-postgres/backup-and-restore)页面。