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
import byoc_s3_endpoint from '@site/static/images/cloud/reference/byoc-s3-endpoint.png';
import byoc_aws_existing_vpc_ui from '@site/static/images/cloud/reference/byoc-aws-existing-vpc-ui.png';


## 适用于 AWS 的客户管理的 VPC (BYO-VPC) \{#customer-managed-vpc-aws\}

如果您希望使用现有 VPC 部署 ClickHouse BYOC，而不是由 ClickHouse Cloud 预配新的 VPC，请按照以下步骤操作。此方式可让您更好地控制网络配置，并将 ClickHouse BYOC 集成到现有的网络基础设施中。

<VerticalStepper headerLevel="h3">
  ### 配置现有 VPC

  1. 为 VPC 添加标签 `clickhouse-byoc="true"`。
  2. 在 3 个不同的可用区中，至少为 ClickHouse Cloud 分配 3 个私有子网。
  3. 确保每个子网的最小 CIDR 范围为 `/23` (例如 `10.0.0.0/23`) ，以便为 ClickHouse 部署提供充足的 IP 地址。
  4. 为每个子网添加标签 `kubernetes.io/role/internal-elb=1` 和 `clickhouse-byoc="true"`，以确保负载均衡器得到正确配置。

  <Image img={byoc_subnet_1} size="lg" alt="BYOC VPC 子网" />

  <Image img={byoc_subnet_2} size="lg" alt="BYOC VPC 子网标签" />

  ### 配置 S3 网关端点

  如果您的 VPC 尚未配置 S3 网关端点，则需要创建一个，以便在 VPC 与 Amazon S3 之间启用安全的私有通信。该端点使 ClickHouse 服务无需经过公网即可访问 S3。示例配置请参见下方截图。

  <Image img={byoc_s3_endpoint} size="lg" alt="BYOC S3 端点" />

  ### 确保网络连通性

  **出站互联网访问**
  您的 VPC 至少必须允许出站互联网访问，以便 ClickHouse BYOC 组件能够与 Tailscale 控制平面通信。Tailscale 用于为私有管理操作提供安全的零信任网络。通过 Tailscale 进行初始注册和配置需要公网连通性，这可以通过直接访问互联网或经由 NAT 网关实现。为了同时保障 BYOC 部署的隐私和安全，必须具备这种连通性。

  **DNS 解析**
  请确保您的 VPC 具备正常的 DNS 解析能力，并且不会阻止、干扰或覆盖标准 DNS 名称。ClickHouse BYOC 依赖 DNS 来解析 Tailscale 控制服务器以及 ClickHouse 服务端点。如果 DNS 不可用或配置错误，BYOC 服务可能无法连接或无法正常运行。

  ### 配置您的 AWS 账户

  初始 BYOC 设置会创建一个高权限 IAM 角色 (`ClickHouseManagementRole`) ，使来自 ClickHouse Cloud 的 BYOC 控制器能够管理您的基础设施。您可以使用 [CloudFormation 模板](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml) 或 [Terraform 模块](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz) 执行此操作。

  在部署 `BYO-VPC` 配置时，请将 `IncludeVPCWritePermissions` 参数设置为 `false`，以确保 ClickHouse Cloud 不会获得修改您客户管理的 VPC 的权限。

  :::note
  运行 ClickHouse 所需的存储桶、Kubernetes 集群和计算资源不包含在此初始设置中。它们将在后续步骤中预配。虽然 VPC 由您自行管理，但 ClickHouse Cloud 仍需要 IAM 权限，以便在您的 AWS 账户中创建和管理 Kubernetes 集群、服务账户的 IAM 角色、S3 存储桶以及其他必要资源。
  :::

  #### 替代 Terraform 模块

  如果您更倾向于使用 Terraform 而不是 CloudFormation，请使用以下模块：

  ```hcl
  module "clickhouse_onboarding" {
    source                     = "https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz"
    byoc_env                   = "production"
    include_vpc_write_permissions = false
  }
  ```

  ### 搭建 BYOC 基础设施

  在 ClickHouse Cloud 控制台中，前往 [BYOC 设置页面](https://console.clickhouse.cloud/byocOnboarding) 并配置以下内容：

  1. 在 **VPC 配置** 下，选择 **使用现有 VPC**。
  2. 输入您的 **VPC ID** (例如 `vpc-0bb751a5b888ad123`) 。
  3. 输入您之前配置的 3 个子网的 **私有子网 ID**。
  4. 如果您的配置需要面向公网的负载均衡器，可选择输入 **公有子网 ID**。
  5. 点击 **设置基础设施** 开始预配。

  <Image img={byoc_aws_existing_vpc_ui} size="lg" alt="已选择 Use existing VPC 的 ClickHouse Cloud BYOC 设置界面" />

  :::note
  新区域设置最多可能需要 40 分钟。
  :::
</VerticalStepper>

## 客户管理的 IAM 角色

对于有高级安全要求或严格合规策略的组织，您可以提供自己的 IAM 角色，而无需由 ClickHouse Cloud 为您创建。这样，您可以完全控制 IAM 权限，并执行组织内部的安全策略。

:::info
客户管理的 IAM 角色目前处于私有预览阶段。如果您需要此功能，请联系 ClickHouse Support，讨论您的具体需求和时间安排。

该功能可用后，您将能够：

* 提供预先配置的 IAM 角色供 ClickHouse Cloud 使用
* 移除用于跨账户访问的 `ClickHouseManagementRole` 所需的 IAM 相关写权限
* 完全控制角色权限和信任关系
  :::

有关 ClickHouse Cloud 默认创建的 IAM 角色的信息，请参阅 [BYOC 特权参考](/cloud/reference/byoc/reference/privilege)。