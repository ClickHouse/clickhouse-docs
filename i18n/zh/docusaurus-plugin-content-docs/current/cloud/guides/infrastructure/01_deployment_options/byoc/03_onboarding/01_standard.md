---
title: '标准接入流程'
slug: /cloud/reference/byoc/onboarding/standard
sidebar_label: '标准流程'
keywords: ['BYOC', '云', '自带云', '接入']
description: '在您自己的云基础设施上部署 ClickHouse'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_onboarding_1 from '@site/static/images/cloud/reference/byoc-onboarding-1.png'
import byoc_onboarding_2 from '@site/static/images/cloud/reference/byoc-onboarding-2.png'
import byoc_onboarding_3 from '@site/static/images/cloud/reference/byoc-onboarding-3.png'
import byoc_new_service_1 from '@site/static/images/cloud/reference/byoc-new-service-1.png'


## 什么是标准 Onboarding？ \{#what-is-standard-onboarding\}

**标准 Onboarding** 是在您自己的云账号中使用 BYOC 部署 ClickHouse 的默认引导式工作流。在这种方式下，ClickHouse Cloud 会在您的 AWS 账号/GCP 项目中预配部署所需的所有核心云资源——例如 VPC、子网、安全组、Kubernetes（EKS/GKE）集群，以及相关的 IAM 角色/服务账号。这样可以确保配置的一致性和安全性，并最大限度减少您团队所需的手动操作。

使用标准 Onboarding 时，您只需提供一个专用的 AWS 账号/GCP 项目，并运行一个初始栈（通过 CloudFormation 或 Terraform）来创建 ClickHouse Cloud 对后续设置进行编排所需的最小 IAM 权限和信任关系。后续的所有步骤——包括基础设施预配和服务启动——都通过 ClickHouse Cloud Web 控制台进行管理。

强烈建议客户准备一个**专用**的 AWS 账号或 GCP 项目来承载 ClickHouse BYOC 部署，以在权限和资源层面实现更好的隔离。ClickHouse 会在您的账号中部署一整套专用的云资源（VPC、Kubernetes 集群、IAM 角色、S3 存储桶等）。

如果您需要更加定制化的设置（例如部署到一个已有的 VPC 中），请参考 [Customized Onboarding](/cloud/reference/byoc/onboarding/customization) 文档。

## 申请访问权限 \{#request-access\}

要开始接入流程，请[联系我们](https://clickhouse.com/cloud/bring-your-own-cloud)。我们的团队会引导您了解 BYOC 的各项要求，帮助您选择最合适的部署选项，并将您的账户加入允许列表。

## 接入流程 \{#onboarding-process\}

### 准备 AWS 账户 / GCP 项目 \{#prepare-an-aws-account\}

在您的组织下准备一个全新的 AWS 账户或 GCP 项目。访问我们的 Web 控制台：https://console.clickhouse.cloud/byocOnboarding 继续进行设置。 

<VerticalStepper headerLevel="h3">

### 选择 Cloud 提供商 \{#choose-cloud-provider\}

<Image img={byoc_onboarding_1} size="lg" alt="BYOC choose CSP" background='black'/>

### 账户 / 项目设置 \{#account-setup\}

初始 BYOC 设置可以通过 [CloudFormation 模板（AWS）](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml) 或 [Terraform 模块（GCP）](https://github.com/ClickHouse/terraform-byoc-onboarding/tree/main/modules/gcp) 来完成。该步骤会创建一个高权限 IAM 角色，使来自 ClickHouse Cloud 的 BYOC 控制器能够管理您的基础设施。 

<Image img={byoc_onboarding_2} size="lg" alt="BYOC initialize account" background='black'/>

:::note
用于运行 ClickHouse 的存储桶、VPC、Kubernetes 集群和计算资源不包含在此初始设置中。它们将在下一步中进行创建和配置。
:::
#### AWS 的替代 Terraform 模块 \{#terraform-module-aws\}

如果您更倾向于在 AWS 部署中使用 Terraform 而不是 CloudFormation，我们也提供了一个 [适用于 AWS 的 Terraform 模块](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz)。

用法：
```hcl
module "clickhouse_onboarding" {
  source   = "https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz"
  byoc_env = "production"
}
```

### 设置 BYOC 基础设施 \{#setup-byoc-infrastructure\}

系统会提示您通过 ClickHouse Cloud 控制台设置基础设施，包括 S3 存储桶、VPC 和 Kubernetes 集群。某些配置必须在此阶段确定，因为之后无法更改。具体包括：

- **Region（区域）**：我们的文档 [supported regions](https://clickhouse.com/docs/cloud/reference/supported-regions) 中列出的所有**公共区域（public regions）**均可用于 BYOC 部署。目前不支持私有区域（private regions）。

- **VPC CIDR 范围**：默认情况下，我们为 BYOC 的 VPC CIDR 范围使用 `10.0.0.0/16`。如果计划与其他账户进行 VPC 对等连接（VPC peering），请确保 CIDR 段不重叠。为 BYOC 分配合适的 CIDR 范围，最小前缀长度为 `/22`，以容纳必要的工作负载。

- **可用区（Availability Zones）**：如果计划使用 VPC 对等连接，在源账户和 BYOC 账户之间对齐可用区可以帮助降低跨可用区（cross-AZ）流量成本。例如，在 AWS 中，可用区后缀（`a`、`b`、`c`）在不同账户中可能对应不同的物理可用区 ID。详细信息请参考 [AWS 指南](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html)。

<Image img={byoc_onboarding_3} size="lg" alt="BYOC setup infra" background='black'/>

</VerticalStepper>

### 创建您的首个 BYOC ClickHouse 服务 \{#create-clickhouse-service\}

在 BYOC 基础设施完成部署后，您就可以启动首个 ClickHouse 服务了。打开 ClickHouse Cloud 控制台，选择您的 BYOC 环境，并根据提示创建一个新服务。

<Image img={byoc_new_service_1} size="md" alt="BYOC 创建新服务"/>

在创建服务过程中，您需要配置以下选项：

- **Service name**：为您的 ClickHouse 服务输入一个清晰且具有描述性的名称。
- **BYOC infrastructure**：选择运行服务的 BYOC 环境，包括云账户和区域。
- **Resource configuration**：选择分配给 ClickHouse 副本的 CPU 和内存资源。
- **Replica count**：设置副本数量以增强高可用性。