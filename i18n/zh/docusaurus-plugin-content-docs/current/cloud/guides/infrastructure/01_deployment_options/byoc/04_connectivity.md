---
title: '连接 ClickHouse'
slug: /cloud/reference/byoc/connect
sidebar_label: '连接 ClickHouse'
keywords: ['BYOC', '云', '自带云', '连接 ClickHouse', '负载均衡器', 'PrivateLink']
description: '通过公有、私有或 PrivateLink 端点连接到您的 BYOC ClickHouse 服务'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_connect_1 from '@site/static/images/cloud/reference/byoc-connect-1.png';

本页介绍在 BYOC 环境中连接 ClickHouse 服务的多种方式。可以根据安全性和网络需求，在公网负载均衡器、私有负载均衡器或 PrivateLink/Private Service Connect 终端节点之间进行选择。


## 公共负载均衡器 \{#public-load-balancer\}

公共负载均衡器为您的 ClickHouse 服务提供公网访问入口。在使用由 ClickHouse 管理的专用 VPC 时，这是默认配置。

### 概览 \{#public-load-balancer-overview\}

- **访问**：可从公网访问
- **使用场景**：适用于需要从不同位置或网络进行连接的应用和用户
- **安全性**：通过 TLS 加密和基于 IP 的过滤进行防护（推荐）

### 通过公共负载均衡器连接 \{#connecting-via-public-load-balancer\}

要使用公共端点连接到您的 ClickHouse 服务：

1. 从 ClickHouse Cloud 控制台中**获取您的服务端点**。该端点显示在服务的 &quot;Connect&quot; 部分。

<Image img={byoc_connect_1} size="lg" alt="BYOC 连接" background="black" />

例如：

```text
sb9jmrq2ne.asf3kcggao.ap-southeast-1.aws.clickhouse-byoc.com
```


### IP 过滤 \{#public-ip-filtering\}

在使用公共负载均衡器时，**强烈建议**启用 IP 过滤（IP Access List），以将访问限制在已授权的 IP 地址或 CIDR 范围内。

有关 IP 过滤的详细信息，请参阅 [IP 访问列表文档](https://clickhouse.com/docs/cloud/security/setting-ip-filters)。

## 私有负载均衡器 \{#private-load-balancer\}

私有负载均衡器为您的 ClickHouse 服务提供内网访问，仅能从已连接网络（例如对等 VPC）内部访问。在使用客户自管的 VPC 时，这是默认配置。

### 概览 \{#private-load-balancer-overview\}

- **访问**：仅能从私有网络基础设施内部访问
- **使用场景**：适用于运行在同一云环境中或通过 VPC 对等连接的应用程序
- **安全性**：流量始终留在私有网络内部，不暴露于公共互联网

### 通过私有负载均衡器连接 \{#connecting-via-private-load-balancer\}

要使用私有端点进行连接：

1. **启用私有负载均衡器**（如果尚未启用）。如果需要为你的部署[启用私有负载均衡器](/cloud/reference/byoc/configurations#load-balancers)，请联系 ClickHouse 支持团队。
2. **确保网络连通性**：
   - 对于 VPC 对等连接：完成 VPC 对等连接设置（参见 [Private Networking Setup](/cloud/reference/byoc/onboarding/network)）
   - 对于其他私有网络：确保已配置路由以访问 BYOC VPC
3. **获取你的私有端点**：  
   私有端点可以在 ClickHouse Cloud 控制台中你的服务的 “Connect” 部分找到。私有端点与公共端点的格式相同，但在服务 ID 部分添加 `-private` 后缀。例如：
   - **公共端点**：`sb9jmrq2ne.asf3kcggao.ap-southeast-1.aws.clickhouse-byoc.com`
   - **私有端点**：`sb9jmrq2ne-private.asf3kcggao.ap-southeast-1.aws.clickhouse-byoc.com`

### IP 过滤 \{#private-ip-filtering\}

尽管私有负载均衡器只允许来自内部网络的访问，您仍然可以配置 IP 过滤，以更精细地控制私有网络中哪些源可以连接。私有负载均衡器的 IP 过滤使用与公共负载均衡器相同的配置机制：定义允许的 IP 地址或 CIDR 范围，ClickHouse Cloud 会将这些规则正确应用到每种端点类型。平台会自动区分公共和私有 CIDR 范围，并将它们分配给相应的负载均衡端点。请参阅 [IP 访问列表文档](https://clickhouse.com/docs/cloud/security/setting-ip-filters)。 

### 安全组配置 \{#security-group-configuration\}

对于 AWS 上的部署，私有负载均衡器的安全组用于控制哪些网络可以访问该端点。默认情况下，只允许来自 BYOC VPC 内部的流量。

有关详细信息，请参阅 [Private Load Balancer Security Group 配置](https://clickhouse.com/docs/cloud/reference/byoc/configurations#private-load-balancer-security-group)。

## PrivateLink 或 Private Service Connect \{#privatelink-or-private-service-connect\}

AWS PrivateLink 和 GCP Private Service Connect 提供了最安全的连接选项，使您无需使用 VPC 对等连接或 Internet 网关，即可通过私有网络访问 ClickHouse 服务。

### 概览 \{#privatelink-overview\}

- **访问**：通过云服务商提供的托管服务实现私有连接
- **网络隔离**：流量不会经过公共互联网
- **使用场景**：需要最高级别安全性和网络隔离的企业级部署
- **优势**： 
  - 无需 VPC 对等连接
  - 网络架构更加简化
  - 提升安全性和合规能力

### 通过 PrivateLink/Private Service Connect 进行连接 \{#connecting-via-privatelink\}

完成 PrivateLink 或 Private Service Connect 的设置（参见 [Private Networking Setup](/cloud/reference/byoc/onboarding/network)）。配置完成后，您可以使用特定于 PrivateLink 的 endpoint 格式连接到 ClickHouse 服务。PrivateLink endpoint 包含一个 `vpce` 子域名，用于表明其通过 VPC endpoint 进行路由。您在 VPC 中的 DNS 解析会自动将流量路由到该 PrivateLink endpoint。

PrivateLink endpoint 的格式与公共 endpoint 类似，但在服务子域和 BYOC 基础设施子域之间增加了一个 `vpce` 子域名。例如：

- **公共 endpoint**：`h5ju65kv87.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`
- **PrivateLink endpoint**：`h5ju65kv87.vpce.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`

### Endpoint ID 允许列表 \{#endpoint-id-allowlist\}

要使用 PrivateLink 或 Private Service Connect，必须在每个 ClickHouse 服务中显式允许客户端连接的 Endpoint ID。请联系 ClickHouse Support，并提供您的 Endpoint ID，以便将其添加到服务允许列表中。

有关详细的设置步骤，请参阅 [私有网络设置指南](/cloud/reference/byoc/onboarding/network)。

## 选择合适的连接方式 \{#choosing-connection-method\}

| 连接方式 | 安全等级 | 网络要求 | 使用场景 |
|------------------|----------------|---------------------|----------|
| **公共负载均衡器（Public Load Balancer）** | 中（配合 IP 过滤） | 需要公网访问 | 来自不同位置的应用或用户 |
| **私有负载均衡器（Private Load Balancer）** | 高 | VPC 对等连接或私有网络 | 位于同一云环境中的应用 |
| **PrivateLink/Private Service Connect** | 最高 | 云服务商托管服务 | 需要最高隔离级别的企业级部署 |

## 排查连接问题 \{#troubleshooting\}

如果遇到连接问题：

1. **验证端点可访问性**：确认使用的端点类型正确（公网 vs. 私网）
2. **检查 IP 过滤规则**：对于公网负载均衡器，确认您的 IP 地址在允许列表中
3. **验证网络连通性**：对于私网连接，确保 VPC 对等连接或 PrivateLink 配置正确
4. **检查安全组**：对于私网负载均衡器，确认安全组规则允许来自源网络的流量
4. **检查安全组**：对于 PrivateLink 或 Private Service Connect，确认端点 ID 已添加到 ClickHouse 服务的允许列表中
5. **检查身份验证**：确保使用的是正确的凭证（用户名和密码）
6. **联系支持团队**：如果问题仍然存在，请联系 ClickHouse 支持