---
title: '自定义部署'
slug: /cloud/reference/byoc/onboarding/customization
sidebar_label: '自定义部署'
keywords: ['BYOC', '云', '自带云环境', '上手引导']
description: '在您自己的云基础设施上部署 ClickHouse'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_subnet_1 from '@site/static/images/cloud/reference/byoc-subnet-1.png';
import byoc_subnet_2 from '@site/static/images/cloud/reference/byoc-subnet-2.png';
import byoc_s3_endpoint from '@site/static/images/cloud/reference/byoc-s3-endpoint.png'


## 客户自管 VPC（BYO-VPC） \{#customer-managed-vpc\}

:::note
目前仅支持 **AWS**。对 GCP 的支持已在规划中。
:::

如果希望在现有 VPC 中部署 ClickHouse BYOC，而不是由 ClickHouse Cloud 创建新的 VPC，请按照以下步骤操作。此方式可以让你对网络配置拥有更高的控制权，并将 ClickHouse BYOC 集成到现有的网络基础设施中。

### 配置您的现有 VPC \{#configure-existing-vpc\}

1. 为该 VPC 添加标签 `clickhouse-byoc="true"`。
2. 在 3 个不同的可用区中分配至少 3 个私有子网供 ClickHouse Cloud 使用。
3. 确保每个子网的 CIDR 网段至少为 `/23`（例如 10.0.0.0/23），以为 ClickHouse 部署提供足够的 IP 地址。
4. 为每个子网添加标签 `kubernetes.io/role/internal-elb=1` 和 `clickhouse-byoc="true"`，以正确配置负载均衡器。

<Image img={byoc_subnet_1} size="lg" alt="BYOC VPC 子网" />

<Image img={byoc_subnet_2} size="lg" alt="BYOC VPC 子网标签" />

### 配置 S3 网关终端节点（Gateway Endpoint）\{#configure-s3-endpoint\}

如果您的 VPC 尚未配置 S3 网关终端节点，则需要创建一个，以便在 VPC 与 Amazon S3 之间启用安全、私有的通信。通过该终端节点，ClickHouse 服务可以在不经过公共互联网的情况下访问 S3。请参考下方截图中的示例配置。

<Image img={byoc_s3_endpoint} size="lg" alt="BYOC S3 Endpoint" />

### 确保网络连通性 \{#ensure-network-connectivity\}

**出站互联网访问**  
您的 VPC 至少需要允许出站互联网访问，以便 ClickHouse BYOC 组件能够与 Tailscale 控制平面通信。Tailscale 用于为私有管理操作提供安全的零信任网络。与 Tailscale 的初始注册和设置需要公共互联网连接，可以通过直连互联网或通过 NAT 网关实现。为确保 BYOC 部署的隐私性和安全性，必须具备上述连通性。

**DNS 解析**  
确保您的 VPC 具备正常工作的 DNS 解析能力，且不会阻止、干扰或覆盖标准 DNS 名称。ClickHouse BYOC 依赖 DNS 来解析 Tailscale 控制服务器以及 ClickHouse 服务端点。如果 DNS 不可用或配置错误，BYOC 服务可能无法正常连接或正常运行。

### 配置你的 AWS 账户 \{#configure-aws-account\}

为了允许 ClickHouse Cloud 部署到你现有的 VPC 中，你需要在 AWS 账户中授予必要的 IAM 权限。可以通过启动一个引导用的 CloudFormation stack 或 Terraform module 来完成，这与标准接入流程类似。

1. 部署 [CloudFormation template](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc_v2.yaml) 或 [Terraform module](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz) 来创建所需的 IAM 角色。
2. 将 `IncludeVPCWritePermissions` 参数设置为 `false`，以确保 ClickHouse Cloud 不会获得修改你自管 VPC 的权限。
3. 这将在你的 AWS 账户中创建 `ClickHouseManagementRole`，仅向 ClickHouse Cloud 授予置备和管理 BYOC 部署所需的最小权限。

:::note
即使你控制自己的 VPC，ClickHouse Cloud 仍然需要 IAM 权限来创建和管理 Kubernetes 集群、服务账号所使用的 IAM 角色、S3 存储桶，以及你 AWS 账户中的其他关键资源。
:::

### 联系 ClickHouse 支持 \{#contact-clickhouse-support\}

完成上述配置步骤后，请创建一个支持工单，并包含以下信息：

* 您的 AWS 账户 ID
* 您希望部署该服务的 AWS 区域
* 您的 VPC ID
* 您为 ClickHouse 分配的私有子网 ID
* 这些子网所在的可用区

我们的团队会审核您的配置，并在我们这边完成资源的开通与配置工作。 

## 客户自管理 IAM 角色 \{#customer-managed-iam-roles\}

对于具有高级安全需求或严格合规策略的组织，您可以提供自己的 IAM 角色，而不是由 ClickHouse Cloud 为您创建角色。此方式可让您对 IAM 权限拥有完全控制权，并使您能够严格执行组织的安全策略。

:::info
客户自管理 IAM 角色目前处于私有预览阶段。如果您需要此功能，请联系 ClickHouse 支持，讨论您的具体需求和时间规划。

在该功能正式开放后，您将能够：

* 为 ClickHouse Cloud 提供预先配置的 IAM 角色以供使用
* 移除用于跨账户访问的 `ClickHouseManagementRole` 对 IAM 相关权限的写入权限
* 完全掌控角色权限和信任关系
:::

有关 ClickHouse Cloud 默认创建的 IAM 角色的信息，请参阅 [BYOC Privilege Reference](/cloud/reference/byoc/reference/priviledge)。