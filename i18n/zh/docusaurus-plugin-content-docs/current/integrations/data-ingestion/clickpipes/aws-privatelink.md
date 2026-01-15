---
sidebar_label: '适用于 ClickPipes 的 AWS PrivateLink'
description: '使用 AWS PrivateLink 在 ClickPipes 与数据源之间建立安全连接。'
slug: /integrations/clickpipes/aws-privatelink
title: '适用于 ClickPipes 的 AWS PrivateLink'
doc_type: 'guide'
keywords: ['aws privatelink', 'ClickPipes 安全', 'vpc endpoint', '私有连接', 'vpc 资源']
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

# ClickPipes 的 AWS PrivateLink {#aws-privatelink-for-clickpipes}

你可以使用 [AWS PrivateLink](https://aws.amazon.com/privatelink/) 在 VPC、AWS 服务、本地部署系统和 ClickHouse Cloud 之间建立安全连接，而无需将流量暴露到公共互联网。

本文档概述了 ClickPipes 的反向私有终端节点功能，
该功能允许你配置 AWS PrivateLink VPC 终端节点。

## 支持的 ClickPipes 数据源 {#supported-sources}

ClickPipes 反向 PrivateLink 终端节点功能目前仅适用于以下数据源类型：

- Kafka
- Postgres
- MySQL
- MongoDB

## 支持的 AWS PrivateLink 端点类型 {#aws-privatelink-endpoint-types}

ClickPipes 反向私有端点可以通过以下任一 AWS PrivateLink 方案进行配置：

- [VPC 资源](#vpc-resource)
- [用于 MSK ClickPipe 的 MSK 多 VPC 连接](#msk-multi-vpc)
- [VPC 端点服务](#vpc-endpoint-service)

### VPC 资源 {#vpc-resource}

:::info
不支持跨 Region。
:::

您可以在 ClickPipes 中通过 [PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html) 访问 VPC 资源。此方式无需在数据源前配置负载均衡器。

资源配置可以针对特定主机或 RDS 集群 ARN 进行设置。

这是使用 Postgres 的 CDC 从 RDS 集群摄取数据的首选方式。

要为 VPC 资源配置 PrivateLink：

1. 创建资源网关
2. 创建资源配置
3. 创建资源共享

<VerticalStepper headerLevel="h4">

#### 创建资源网关 {#create-resource-gateway}

资源网关是在 VPC 中为指定资源接收入站流量的端点。

:::note
建议与资源网关关联的子网具有充足的可用 IP 地址。
推荐每个子网至少使用 `/26` 的子网掩码。

对于每个 VPC 终端节点（每个 Reverse Private Endpoint），AWS 要求在每个子网上预留一段连续的 16 个 IP 地址（对应 `/28` 子网掩码）。
如果不满足该要求，Reverse Private Endpoint 将变为失败状态。
:::

你可以从 [AWS 控制台](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-gateway.html) 创建资源网关，或者使用以下命令创建：

```bash
aws vpc-lattice create-resource-gateway \
    --vpc-identifier <VPC_ID> \
    --subnet-ids <SUBNET_IDS> \
    --security-group-ids <SG_IDs> \
    --name <RESOURCE_GATEWAY_NAME>
```

输出结果中会包含一个 resource gateway ID，后续步骤会用到它。

在继续之前，你需要先等待该 resource gateway 进入 `Active` 状态。你可以通过运行以下命令来检查其状态：

```bash
aws vpc-lattice get-resource-gateway \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID>
```

#### 创建 VPC 资源配置 {#create-resource-configuration}

资源配置与资源网关关联，用于使你的资源可访问。

你可以在 [AWS 控制台](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-configuration.html)中创建资源配置，或使用以下命令创建：

```bash
aws vpc-lattice create-resource-configuration \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID> \
    --type <RESOURCE_CONFIGURATION_TYPE> \
    --resource-configuration-definition <RESOURCE_CONFIGURATION_DEFINITION> \
    --name <RESOURCE_CONFIGURATION_NAME>
```

最简单的[资源配置类型](https://docs.aws.amazon.com/vpc-lattice/latest/ug/resource-configuration.html#resource-configuration-types)是单个 Resource-Configuration。你可以直接通过 ARN 进行配置，或指定一个可在公网解析的 IP 地址或域名。

例如，要使用 RDS 集群的 ARN 进行配置：

```bash
aws vpc-lattice create-resource-configuration \
    --name my-rds-cluster-config \
    --type ARN \
    --resource-gateway-identifier rgw-0bba03f3d56060135 \
    --resource-configuration-definition 'arnResource={arn=arn:aws:rds:us-east-1:123456789012:cluster:my-rds-cluster}'
```

:::note
你无法为可公开访问的集群创建资源配置。
如果你的集群是可公开访问的，你必须先修改该集群
使其变为私有，然后再创建资源配置，
或者改为使用 [IP 允许列表](/integrations/clickpipes#list-of-static-ips)。
更多信息请参阅 [AWS 文档](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html#resource-definition)。
:::

输出中会包含一个 Resource-Configuration ARN，你在下一步中需要用到它。输出中还会包含一个 Resource-Configuration ID，你在为 VPC 资源设置 ClickPipe 连接时需要用到它。

#### 创建 Resource-Share {#create-resource-share}

要共享资源，需要先创建一个 Resource-Share。这是通过 Resource Access Manager (RAM) 实现的。

你可以通过 [AWS 控制台](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html) 将 Resource-Configuration 加入 Resource-Share，或者使用 ClickPipes 的账户 ID `072088201116`（arn:aws:iam::072088201116:root）运行以下命令来完成：

```bash
aws ram create-resource-share \
    --principals 072088201116 \
    --resource-arns <RESOURCE_CONFIGURATION_ARN> \
    --name <RESOURCE_SHARE_NAME>
```

输出将包含一个 Resource-Share ARN，后续在使用 VPC 资源创建 ClickPipe 连接时需要用到。

现在可以使用 VPC 资源[创建带有反向私有终端节点的 ClickPipe](#creating-clickpipe)。你需要：

* 将 `VPC endpoint type` 设置为 `VPC Resource`。
* 将 `Resource configuration ID` 设置为在步骤 2 中创建的 Resource-Configuration 的 ID。
* 将 `Resource share ARN` 设置为在步骤 3 中创建的 Resource-Share 的 ARN。

有关基于 VPC 资源的 PrivateLink 的更多详情，请参阅 [AWS 文档](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)。

</VerticalStepper>


### MSK 多 VPC 连接 {#msk-multi-vpc}

[Multi-VPC connectivity](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html) 是 AWS MSK 的一项内置功能，允许你将多个 VPC 连接到同一个 MSK 集群。
默认支持 Private DNS，且不需要任何额外配置。
不支持跨区域。

这是 ClickPipes for MSK 推荐使用的选项。
更多详情请参阅 [getting started](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html) 指南。

:::info
更新你的 MSK 集群策略，将 `072088201116` 添加到 MSK 集群允许的主体列表中。
更多信息请参阅 AWS 关于[附加集群策略](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html)的指南。
:::

请参阅我们的 [ClickPipes 的 MSK 设置指南](/knowledgebase/aws-privatelink-setup-for-msk-clickpipes) 以了解如何配置该连接。

### VPC 终端节点服务 {#vpc-endpoint-service}

[VPC 终端节点服务](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html) 是向 ClickPipes 暴露你的数据源的另一种方式。
它需要在你的数据源前部署一个 NLB（Network Load Balancer），
并将 VPC 终端节点服务配置为使用该 NLB。

VPC 终端节点服务可以[配置私有 DNS](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html)，该私有 DNS 可以在 ClickPipes 的 VPC 中访问。

它是以下场景的首选方案：

- 任何需要私有 DNS 支持的本地 Kafka 部署
- [Postgres CDC 的跨区域连接](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- MSK 集群的跨区域连接。请联系 ClickHouse 支持团队以获取帮助。

有关更多详细信息，请参阅[入门指南](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)。

:::info
在你的 VPC 终端节点服务中，将 ClickPipes 账户 ID `072088201116` 添加到允许的主体列表中。
有关更多详细信息，请参阅 AWS 关于[管理权限](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions)的指南。
:::

:::info
可以为 ClickPipes 配置[跨区域访问](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region)。
在你的 VPC 终端节点服务中，将[你的 ClickPipe 区域](#aws-privatelink-regions)添加到允许的区域列表中。
:::

## 使用反向私有终端节点创建 ClickPipe {#creating-clickpipe}

<VerticalStepper headerLevel="list">

1. 访问 ClickHouse Cloud 服务的 SQL Console。

<Image img={cp_service} alt="ClickPipes 服务" size="md" border/>

2. 在左侧菜单中选择 `Data Sources` 按钮，然后点击“Set up a ClickPipe”。

<Image img={cp_step0} alt="选择导入" size="lg" border/>

3. 选择 Kafka 或 Postgres 作为数据源。

<Image img={cp_rpe_select} alt="选择数据源" size="lg" border/>

4. 选择 `Reverse private endpoint` 选项。

<Image img={cp_rpe_step0} alt="选择反向私有终端节点" size="lg" border/>

5. 选择任一现有的反向私有终端节点，或创建一个新的。

:::info
如果 RDS 需要跨区域访问，你需要创建一个 VPC 终端节点服务 (VPC endpoint service)，
[本指南](/knowledgebase/aws-privatelink-setup-for-clickpipes) 是进行相关配置的良好起点。

对于同区域访问，推荐的做法是创建一个 VPC 资源 (VPC Resource)。
:::

<Image img={cp_rpe_step1} alt="选择反向私有终端节点" size="lg" border/>

6. 为所选终端节点类型填写所需参数。

<Image img={cp_rpe_step2} alt="选择反向私有终端节点" size="lg" border/>

```
- For VPC resource, provide the configuration share ARN and configuration ID.
- For MSK multi-VPC, provide the cluster ARN and authentication method used with a created endpoint.
- For VPC endpoint service, provide the service name.
```

7. 点击 `Create`，并等待反向私有端点准备就绪。

如果正在创建一个新的端点，完成端点的配置需要一些时间。
端点就绪后，页面会自动刷新。
VPC endpoint service 可能需要您在 AWS 控制台中接受连接请求。

<Image img={cp_rpe_step3} alt="选择反向私有端点" size="lg" border/>

8. 端点准备就绪后，您可以使用 DNS 名称连接到数据源。

   在端点列表中，可以看到可用端点的 DNS 名称。
   该名称可以是 ClickPipes 在内部预配的 DNS 名称，也可以是由 PrivateLink 服务提供的私有 DNS 名称。
   DNS 名称并不是完整的网络地址。
   请根据数据源添加端口。

   可以在 AWS 控制台中查看 MSK 连接字符串。

   要查看完整的 DNS 名称列表，请在云服务设置中查看。

</VerticalStepper>


## 管理现有反向私有端点 {#managing-existing-endpoints}

您可以在 ClickHouse Cloud 的服务设置中管理现有的反向私有端点：

<VerticalStepper headerLevel="list">

1. 在侧边栏中找到 `Settings` 按钮并点击它。

    <Image img={cp_rpe_settings0} alt="ClickHouse Cloud 设置" size="lg" border/>

2. 在 `ClickPipe reverse private endpoints` 部分中点击 `Reverse private endpoints`。

    <Image img={cp_rpe_settings1} alt="ClickHouse Cloud 设置" size="md" border/>

   反向私有端点的详细信息会显示在侧边弹出面板中。

   您可以在这里删除该端点。这将影响任何使用此端点的 ClickPipes。

</VerticalStepper>

## 支持的 AWS 区域 {#aws-privatelink-regions}

对于 ClickPipes，AWS PrivateLink 目前仅限于特定的 AWS 区域。
请参阅 [ClickPipes 区域列表](/integrations/clickpipes#list-of-static-ips) 以查看可用区域。

此限制不适用于已启用跨区域连接的 PrivateLink VPC 终端节点服务（endpoint service）。

## 限制 {#limitations}

在 ClickHouse Cloud 中为 ClickPipes 创建的 AWS PrivateLink 端点无法保证与 ClickHouse Cloud 服务位于同一 AWS 区域。

目前，只有 VPC 端点服务支持跨区域连接。

私有端点与特定的 ClickHouse 服务绑定，不能在服务之间迁移或共享。
针对单个 ClickHouse 服务的多个 ClickPipes 可以复用同一个端点。