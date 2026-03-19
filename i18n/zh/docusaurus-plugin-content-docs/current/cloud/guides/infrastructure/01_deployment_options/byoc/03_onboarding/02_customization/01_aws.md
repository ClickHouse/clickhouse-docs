---
title: 'AWS 自定义配置'
slug: /cloud/reference/byoc/onboarding/customization-aws
sidebar_label: 'AWS 自定义配置'
keywords: ['BYOC', 'Cloud', '自带 Cloud', 'onboarding', 'AWS', 'VPC']
description: '在您现有的 AWS VPC 中部署 ClickHouse BYOC'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_subnet_1 from '@site/static/images/cloud/reference/byoc-subnet-1.png';
import byoc_subnet_2 from '@site/static/images/cloud/reference/byoc-subnet-2.png';
import byoc_s3_endpoint from '@site/static/images/cloud/reference/byoc-s3-endpoint.png'

## 适用于 AWS 的客户管理的 VPC (BYO-VPC) \{#customer-managed-vpc-aws\}

如果您希望使用现有 VPC 部署 ClickHouse BYOC，而不是由 ClickHouse Cloud 预配新的 VPC，请按照以下步骤操作。此方式可让您更好地控制网络配置，并将 ClickHouse BYOC 集成到现有的网络基础设施中。

### 配置现有 VPC \{#configure-existing-vpc\}

1. 为 VPC 添加标签 `clickhouse-byoc="true"`。
2. 在 3 个不同的可用区中，至少分配 3 个私有子网供 ClickHouse Cloud 使用。
3. 确保每个子网的最小 CIDR 范围为 `/23` (例如 10.0.0.0/23) ，以便为 ClickHouse 部署提供足够的 IP 地址。
4. 为每个子网添加标签 `kubernetes.io/role/internal-elb=1` 和 `clickhouse-byoc="true"`，以确保负载均衡器配置正确。

<Image img={byoc_subnet_1} size="lg" alt="BYOC VPC 子网" />

<Image img={byoc_subnet_2} size="lg" alt="BYOC VPC 子网标签" />

### 配置 S3 Gateway Endpoint \{#configure-s3-endpoint\}

如果您的 VPC 尚未配置 S3 Gateway Endpoint，则需要创建一个，以便在您的 VPC 与 Amazon S3 之间启用安全的私有通信。此终端节点使您的 ClickHouse 服务无需经过公共互联网即可访问 S3。有关示例配置，请参阅下方截图。

<Image img={byoc_s3_endpoint} size="lg" alt="BYOC S3 Endpoint" />

### 确保网络连通性 \{#ensure-network-connectivity\}

**出站互联网访问**
您的 VPC 至少必须允许出站互联网访问，以便 ClickHouse BYOC 组件能够与 Tailscale 控制平面通信。Tailscale 用于为私有管理操作提供安全的零信任网络。通过 Tailscale 进行初始注册和配置需要公网连通性，这可以通过直接访问互联网或经由 NAT 网关实现。为了同时保障 BYOC 部署的隐私和安全，必须具备这种连通性。

**DNS 解析**
请确保您的 VPC 具备正常的 DNS 解析能力，并且不会阻止、干扰或覆盖标准 DNS 名称。ClickHouse BYOC 依赖 DNS 来解析 Tailscale 控制服务器以及 ClickHouse 服务端点。如果 DNS 不可用或配置错误，BYOC 服务可能无法连接或无法正常运行。

### 配置您的 AWS 账户 \{#configure-aws-account\}

要允许 ClickHouse Cloud 部署到您现有的 VPC 中，您需要在 AWS 账户中授予所需的 IAM 权限。这可以通过启动引导 CloudFormation stack 或 Terraform module 来完成，过程与标准 onboarding 类似。

1. 部署 [CloudFormation template](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc_v2.yaml) 或 [Terraform module](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz) 以创建所需的 IAM 角色。
2. 将 `IncludeVPCWritePermissions` 参数设置为 `false`，以确保 ClickHouse Cloud 不会获得修改您自主管理的 VPC 的权限。
3. 这将在您的 AWS 账户中创建 `ClickHouseManagementRole`，仅向 ClickHouse Cloud 授予预配和管理您的 BYOC 部署所需的最小权限。

:::note
虽然您的 VPC 由您自行控制，但 ClickHouse Cloud 仍需要 IAM 权限来创建和管理 Kubernetes 集群、用于 service account 的 IAM 角色、S3 bucket，以及 AWS 账户中的其他必要资源。
:::

### 联系 ClickHouse 支持团队 \{#contact-clickhouse-support\}

完成上述配置步骤后，请使用以下信息提交支持工单：

* 您的 AWS 账户 ID
* 您希望部署服务的 AWS 区域
* 您的 VPC ID
* 您为 ClickHouse 分配的私有子网 ID
* 这些子网所在的可用区

我们的团队将审核您的配置，并在我们这边完成服务预配。

## 客户管理的 IAM 角色 \{#customer-managed-iam-roles\}

对于有高级安全要求或严格合规策略的组织，您可以提供自己的 IAM 角色，而无需由 ClickHouse Cloud 为您创建。这样，您可以完全控制 IAM 权限，并执行组织内部的安全策略。

:::info
客户管理的 IAM 角色目前处于私有预览阶段。如果您需要此功能，请联系 ClickHouse 支持团队，讨论您的具体需求和时间安排。

该功能可用后，您将能够：

* 提供预先配置的 IAM 角色供 ClickHouse Cloud 使用
* 移除用于跨账户访问的 `ClickHouseManagementRole` 所需的 IAM 相关写权限
* 完全控制角色权限和信任关系
:::

有关 ClickHouse Cloud 默认创建的 IAM 角色的信息，请参阅 [BYOC 权限参考](/cloud/reference/byoc/reference/priviledge)。