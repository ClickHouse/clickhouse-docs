---
sidebar_label: '适用于 ClickPipes 的 AWS PrivateLink'
description: '使用 AWS PrivateLink 在 ClickPipes 与数据源之间建立安全连接。'
slug: /integrations/clickpipes/aws-privatelink
title: '适用于 ClickPipes 的 AWS PrivateLink'
doc_type: 'guide'
keywords: ['aws privatelink', 'ClickPipes 安全性', 'vpc 终端节点', '私有连接', 'vpc 资源']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_rpe_select from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_select.png';
import cp_rpe_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step0.png';
import cp_rpe_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step1.png';
import cp_rpe_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step2.png';
import cp_rpe_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step3.png';
import cp_rpe_settings0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_settings0.png';
import cp_rpe_settings1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_settings1.png';
import Image from '@theme/IdealImage';


# 适用于 ClickPipes 的 AWS PrivateLink \{#aws-privatelink-for-clickpipes\}

您可以使用 [AWS PrivateLink](https://aws.amazon.com/privatelink/) 在 VPC、AWS 服务、本地系统与 ClickHouse Cloud 之间建立安全连接，而无需将流量暴露到公有互联网。

本文档介绍了 ClickPipes 的反向私有终端节点功能，该功能允许您设置 AWS PrivateLink VPC 终端节点。

## 支持的 ClickPipes 数据源 \{#supported-sources\}

ClickPipes 反向 PrivateLink 端点功能仅限于以下数据源类型：

- Kafka
- Postgres
- MySQL
- MongoDB

## 支持的 AWS PrivateLink 端点类型 \{#aws-privatelink-endpoint-types\}

ClickPipes 反向私有端点可以通过以下任一 AWS PrivateLink 方案进行配置：

- [VPC 资源](#vpc-resource)
- [适用于 MSK ClickPipe 的 MSK 多 VPC 连接](#msk-multi-vpc)
- [VPC 端点服务](#vpc-endpoint-service)

### VPC 资源 \{#vpc-resource\}

:::info
不支持跨区域访问。
:::

可以在 ClickPipes 中通过 [PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html) 访问您的 VPC 资源。此方式无需在数据源前部署负载均衡器。

资源配置可以针对特定主机或 RDS 集群 ARN 进行设置。

在从 RDS 集群进行 Postgres CDC 数据摄取时，这是首选方案。

要为 VPC 资源配置 PrivateLink：

1. 创建资源网关
2. 创建资源配置
3. 创建资源共享

<VerticalStepper headerLevel="h4">
  #### 创建 resource gateway

  Resource gateway 是在你的 VPC 中接收指定资源流量的入口。

  :::note
  建议为附加到 resource gateway 的子网预留足够的可用 IP 地址。
  推荐为每个子网至少使用 `/26` 子网掩码。

  对于每个 VPC endpoint（每个 Reverse Private Endpoint），AWS 要求每个子网中提供连续的 16 个 IP 地址块（`/28` 子网掩码）。
  如果不满足该要求,Reverse Private Endpoint 会转为失败状态。
  :::

  你可以通过 [AWS 控制台](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-gateway.html) 或使用以下命令创建 resource gateway:

  ```bash
  aws vpc-lattice create-resource-gateway \
      --vpc-identifier <VPC_ID> \
      --subnet-ids <SUBNET_IDS> \
      --security-group-ids <SG_IDs> \
      --name <RESOURCE_GATEWAY_NAME>
  ```

  输出中会包含一个 resource gateway ID,你在下一步中将需要用到它。

  在继续之前,你需要等待 resource gateway 进入 `Active` 状态。你可以通过运行以下命令检查其状态:

  ```bash
  aws vpc-lattice get-resource-gateway \
      --resource-gateway-identifier <RESOURCE_GATEWAY_ID>
  ```

  #### 创建 VPC Resource-Configuration

  Resource-Configuration 与 resource gateway 关联,用于使你的资源可以被访问。

  你可以通过 [AWS 控制台](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-configuration.html) 或使用以下命令创建 Resource-Configuration:

  ```bash
  aws vpc-lattice create-resource-configuration \
      --resource-gateway-identifier <RESOURCE_GATEWAY_ID> \
      --type <RESOURCE_CONFIGURATION_TYPE> \
      --resource-configuration-definition <RESOURCE_CONFIGURATION_DEFINITION> \
      --name <RESOURCE_CONFIGURATION_NAME>
  ```

  最简单的[资源配置类型](https://docs.aws.amazon.com/vpc-lattice/latest/ug/resource-configuration.html#resource-configuration-types)是单个 Resource-Configuration。你可以直接使用 ARN 进行配置,或者共享一个 IP 地址或一个可被公网解析的域名。

  例如,使用某个 RDS 集群的 ARN 进行配置:

  ```bash
  aws vpc-lattice create-resource-configuration \
      --name my-rds-cluster-config \
      --type ARN \
      --resource-gateway-identifier rgw-0bba03f3d56060135 \
      --resource-configuration-definition 'arnResource={arn=arn:aws:rds:us-east-1:123456789012:cluster:my-rds-cluster}'
  ```

  :::note
  你不能为一个可公网访问的集群创建资源配置。
  如果你的集群可公网访问,你必须在创建资源配置前修改该集群,使其变为私有,
  或者改用 [IP allow list](/integrations/clickpipes#list-of-static-ips)。
  更多信息请参见 [AWS 文档](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html#resource-definition)。
  :::

  输出中会包含一个 Resource-Configuration ARN,你在下一步中将需要用到它。输出中还会包含一个 Resource-Configuration ID,你将使用它与 VPC 资源一起设置 ClickPipe 连接。

  #### 创建 Resource-Share

  要共享你的资源,需要创建一个 Resource-Share。这是通过 Resource Access Manager (RAM) 来实现的。

  :::note
  一个 Resource-Share 只能用于单个 Reverse Private Endpoint,不能重复使用。
  如果你需要为多个 Reverse Private Endpoint 使用同一个 Resource-Configuration,
  你必须为每个 endpoint 创建单独的 Resource-Share。
  在删除 Reverse Private Endpoint 后,Resource-Share 会保留在你的 AWS 账户中,
  如果不再需要,必须手动删除。
  :::

  你可以通过 [AWS 控制台](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html) 将 Resource-Configuration 加入 Resource-Share,或者使用以下命令,并指定 ClickPipes 账号 ID `072088201116`(arn:aws:iam::072088201116:root):

  ```bash
  aws ram create-resource-share \
      --principals 072088201116 \
      --resource-arns <RESOURCE_CONFIGURATION_ARN> \
      --name <RESOURCE_SHARE_NAME>
  ```

  输出中会包含一个 Resource-Share ARN,你将使用它与 VPC 资源一起设置 ClickPipe 连接。

  现在,你已准备好使用 VPC 资源[创建带 Reverse private endpoint 的 ClickPipe](#creating-clickpipe)。你需要:

  * 将 `VPC endpoint type` 设置为 `VPC Resource`。
  * 将 `Resource configuration ID` 设置为在步骤 2 中创建的 Resource-Configuration 的 ID。
  * 将 `Resource share ARN` 设置为步骤 3 中创建的 Resource-Share 的 ARN。

  关于使用 VPC 资源的 PrivateLink 的更多详情,请参见 [AWS 文档](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)。
</VerticalStepper>

### MSK 多 VPC 连接 {#msk-multi-vpc}

[Multi-VPC connectivity](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html) 是 AWS MSK 的一个内置功能，它允许你将多个 VPC 连接到同一个 MSK 集群。
Private DNS 开箱即用，无需任何额外配置。
不支持跨区域。

这是 ClickPipes for MSK 的推荐方案。
有关更多详细信息，请参阅[入门指南](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html)。

:::info
更新你的 MSK 集群策略，并将 `072088201116` 添加到该 MSK 集群的允许主体中。
更多信息请参阅 AWS 关于[附加集群策略](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html)的指南。
:::

请参阅我们的 [适用于 ClickPipes 的 MSK 设置指南](/knowledgebase/aws-privatelink-setup-for-msk-clickpipes) 了解如何完成连接配置。

### VPC endpoint service {#vpc-endpoint-service}

[VPC endpoint service](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html) 是将你的数据源以另一种方式提供给 ClickPipes 使用的方案。
它需要在你的数据源前部署一个 NLB（Network Load Balancer，网络负载均衡器），
并将 VPC endpoint service 配置为使用该 NLB。

VPC endpoint service 可以[配置私有 DNS](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html)，该 DNS 可在 ClickPipes 的 VPC 中访问。

这是首选方案，适用于：

- 任何需要私有 DNS 支持的本地（on‑premises）Kafka 部署
- [用于 Postgres CDC 的跨区域连接](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- MSK 集群的跨区域连接。请联系 ClickHouse 支持团队获取协助。

有关更多详细信息，请参阅[入门指南](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)。

:::info
将 ClickPipes 账户 ID `072088201116` 添加到你的 VPC endpoint service 的允许主体列表中。
更多详情请参阅 AWS 关于[管理权限](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions)的指南。
:::

:::info
可以为 ClickPipes 配置[跨区域访问](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region)。
将[你的 ClickPipe 所在区域](#aws-privatelink-regions)添加到 VPC endpoint service 的允许区域列表中。
:::

## 使用反向私有端点创建 ClickPipe {#creating-clickpipe}

<VerticalStepper headerLevel="list">

1. 访问 ClickHouse Cloud 服务的 SQL Console。

<Image img={cp_service} alt="ClickPipes 服务" size="md" border/>

2. 在左侧菜单中选择 `Data Sources` 按钮，并点击“Set up a ClickPipe”。

<Image img={cp_step0} alt="选择导入" size="lg" border/>

3. 选择 Kafka 或 Postgres 作为数据源。

<Image img={cp_rpe_select} alt="选择数据源" size="lg" border/>

4. 选择 `Reverse private endpoint` 选项。

<Image img={cp_rpe_step0} alt="选择反向私有端点" size="lg" border/>

5. 从现有反向私有端点中选择一个，或者创建一个新的。

:::info
如果 RDS 需要跨区域访问，您需要创建一个 VPC endpoint service，
[此指南可以作为](/knowledgebase/aws-privatelink-setup-for-clickpipes) 进行设置的良好起点。

对于同一区域访问，推荐的做法是创建一个 VPC Resource。
:::

<Image img={cp_rpe_step1} alt="选择反向私有端点" size="lg" border/>

6. 为所选端点类型提供所需参数。

<Image img={cp_rpe_step2} alt="选择反向私有端点" size="lg" border/>

    - 对于 VPC resource，提供 configuration share ARN 和 configuration ID。
    - 对于 MSK multi-VPC，提供 cluster ARN 和在创建端点时使用的认证方式。
    - 对于 VPC endpoint service，提供服务名称。

7. 点击 `Create` 并等待反向私有端点就绪。

   如果您正在创建一个新端点，完成设置需要一些时间。
   端点就绪后页面会自动刷新。
   对于 VPC endpoint service，您可能需要在 AWS 控制台中接受连接请求。

<Image img={cp_rpe_step3} alt="选择反向私有端点" size="lg" border/>

8. 端点就绪后，您可以使用 DNS 名称连接到数据源。

   在端点列表中，您可以看到可用端点的 DNS 名称。
   它可以是 ClickPipes 内部预配的 DNS 名称，也可以是由 PrivateLink 服务提供的私有 DNS 名称。
   DNS 名称并不是完整的网络地址。
   请根据数据源添加端口。

   MSK 连接字符串可以在 AWS 控制台中获取。

   要查看完整的 DNS 名称列表，请在 Cloud 服务设置中访问。

</VerticalStepper>

## 管理现有反向私有端点 {#managing-existing-endpoints}

可以在 ClickHouse Cloud 的服务设置中管理现有的反向私有端点：

<VerticalStepper headerLevel="list">

1. 在侧边栏中找到 `Settings` 按钮并点击。

    <Image img={cp_rpe_settings0} alt="ClickHouse Cloud 设置" size="lg" border/>

2. 在 `ClickPipe reverse private endpoints` 区域中点击 `Reverse private endpoints`。

    <Image img={cp_rpe_settings1} alt="ClickHouse Cloud 设置" size="md" border/>

   反向私有端点的详细信息会显示在侧边弹出面板中。

   可以在此处移除端点。这将影响所有使用该端点的 ClickPipes。

</VerticalStepper>

## 支持的 AWS 区域 {#aws-privatelink-regions}

对于 ClickPipes，AWS PrivateLink 的支持仅限于特定的 AWS 区域。
请参阅 [ClickPipes 区域列表](/integrations/clickpipes#list-of-static-ips) 以查看可用区域。

此限制不适用于已启用跨区域连接的 PrivateLink VPC 终端节点服务。

## 限制 \{#limitations\}

在 ClickHouse Cloud 中为 ClickPipes 创建的 AWS PrivateLink 终端节点不保证会位于与 ClickHouse Cloud 服务相同的 AWS 区域。

目前，只有 VPC endpoint service 支持跨区域连接。

私有终端节点绑定到特定的 ClickHouse 服务，无法在服务之间迁移。针对单个 ClickHouse 服务的多个 ClickPipes 可以复用同一个终端节点。

AWS MSK 在每个 MSK 集群、每种认证类型（SASL_IAM 或 SASL_SCRAM）下仅支持一个 PrivateLink（VPC endpoint）。因此，多个 ClickHouse Cloud 服务或组织在使用相同认证类型时，无法为同一个 MSK 集群分别创建独立的 PrivateLink 连接。

### 非活动终端节点的自动清理 {#automatic-cleanup}

处于终止状态的反向私有终端节点会在指定的宽限期后自动删除。
这可确保未使用或配置错误的终端节点不会被无限期保留。

针对不同的终端节点状态，适用以下宽限期：

| Status | Grace Period | Description |
|---|---|---|
| **Failed** | 7 天 | 终端节点在预配过程中遇到错误。 |
| **Pending Acceptance** | 1 天 | 服务所有者尚未接受该终端节点连接。 |
| **Rejected** | 1 天 | 终端节点连接被服务所有者拒绝。 |
| **Expired** | 立即 | 终端节点已过期，会被立即移除。 |

一旦宽限期结束，该终端节点及其所有关联资源会被自动删除。

若要防止自动移除，请在宽限期结束前解决导致该状态的根本问题。
例如，在 AWS 控制台中接受处于待接受状态的连接请求，
或在终端节点进入失败状态后重新创建该终端节点。