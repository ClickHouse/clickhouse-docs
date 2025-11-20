---
sidebar_label: '适用于 ClickPipes 的 AWS PrivateLink'
description: '使用 AWS PrivateLink 在 ClickPipes 与数据源之间建立安全连接。'
slug: /integrations/clickpipes/aws-privatelink
title: '适用于 ClickPipes 的 AWS PrivateLink'
doc_type: 'guide'
keywords: ['aws privatelink', 'ClickPipes security', 'vpc endpoint', 'private connectivity', 'vpc resource']
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


# 适用于 ClickPipes 的 AWS PrivateLink

您可以使用 [AWS PrivateLink](https://aws.amazon.com/privatelink/) 在 VPC、AWS 服务、本地系统与 ClickHouse Cloud 之间建立安全连接，而无需将流量暴露在公共互联网中。

本文档概述了 ClickPipes 的反向私有终端节点功能，该功能允许您设置 AWS PrivateLink VPC 终端节点。



## 支持的 ClickPipes 数据源 {#supported-sources}

ClickPipes 反向私有端点功能仅支持以下数据源类型：

- Kafka
- Postgres
- MySQL


## 支持的 AWS PrivateLink 端点类型 {#aws-privatelink-endpoint-types}

ClickPipes 反向私有端点可以使用以下 AWS PrivateLink 方式之一进行配置:

- [VPC 资源](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)
- [MSK ClickPipe 的 MSK 多 VPC 连接](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html)
- [VPC 端点服务](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)

### VPC 资源 {#vpc-resource}

您可以通过 [PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html) 在 ClickPipes 中访问 VPC 资源。此方式无需在数据源前设置负载均衡器。

资源配置可以针对特定主机或 RDS 集群 ARN。
不支持跨区域。

对于从 RDS 集群摄取数据的 Postgres CDC,这是首选方式。

使用 VPC 资源设置 PrivateLink:

1. 创建资源网关
2. 创建资源配置
3. 创建资源共享

<VerticalStepper headerLevel="h4">

#### 创建资源网关 {#create-resource-gateway}

资源网关是接收 VPC 中指定资源流量的接入点。

:::note
建议您的资源网关附加的子网具有足够的可用 IP 地址。
建议每个子网至少使用 `/26` 子网掩码。

对于每个 VPC 端点(每个反向私有端点),AWS 要求每个子网有连续的 16 个 IP 地址块(`/28` 子网掩码)。
如果不满足此要求,反向私有端点将转换为失败状态。
:::

您可以从 [AWS 控制台](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-gateway.html)创建资源网关,或使用以下命令:

```bash
aws vpc-lattice create-resource-gateway \
    --vpc-identifier <VPC_ID> \
    --subnet-ids <SUBNET_IDS> \
    --security-group-ids <SG_IDs> \
    --name <RESOURCE_GATEWAY_NAME>
```

输出将包含资源网关 ID,您在下一步中需要使用它。

在继续之前,您需要等待资源网关进入 `Active` 状态。您可以通过运行以下命令检查状态:

```bash
aws vpc-lattice get-resource-gateway \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID>
```

#### 创建 VPC 资源配置 {#create-resource-configuration}

资源配置与资源网关关联,以使您的资源可访问。

您可以从 [AWS 控制台](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-configuration.html)创建资源配置,或使用以下命令:

```bash
aws vpc-lattice create-resource-configuration \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID> \
    --type <RESOURCE_CONFIGURATION_TYPE> \
    --resource-configuration-definition <RESOURCE_CONFIGURATION_DEFINITION> \
    --name <RESOURCE_CONFIGURATION_NAME>
```

最简单的[资源配置类型](https://docs.aws.amazon.com/vpc-lattice/latest/ug/resource-configuration.html#resource-configuration-types)是单个资源配置。您可以直接使用 ARN 进行配置,或共享可公开解析的 IP 地址或域名。

例如,使用 RDS 集群的 ARN 进行配置:

```bash
aws vpc-lattice create-resource-configuration \
    --name my-rds-cluster-config \
    --type ARN \
    --resource-gateway-identifier rgw-0bba03f3d56060135 \
    --resource-configuration-definition 'arnResource={arn=arn:aws:rds:us-east-1:123456789012:cluster:my-rds-cluster}'
```

:::note
您无法为可公开访问的集群创建资源配置。
如果您的集群可公开访问,则必须先修改集群使其变为私有,然后再创建资源配置,
或改用 [IP 允许列表](/integrations/clickpipes#list-of-static-ips)。
有关更多信息,请参阅 [AWS 文档](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html#resource-definition)。
:::

输出将包含资源配置 ARN,您在下一步中需要使用它。它还将包含资源配置 ID,您在设置与 VPC 资源的 ClickPipe 连接时需要使用它。

#### 创建资源共享 {#create-resource-share}


共享您的资源需要创建资源共享(Resource-Share)。这通过资源访问管理器(RAM)来实现。

您可以通过 [AWS 控制台](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html)将资源配置(Resource-Configuration)添加到资源共享中,或使用 ClickPipes 账户 ID `072088201116` (arn:aws:iam::072088201116:root) 运行以下命令:

```bash
aws ram create-resource-share \
    --principals 072088201116 \
    --resource-arns <RESOURCE_CONFIGURATION_ARN> \
    --name <RESOURCE_SHARE_NAME>
```

输出将包含资源共享 ARN,在设置使用 VPC 资源的 ClickPipe 连接时需要用到它。

现在您可以使用 VPC 资源[创建带有反向私有端点的 ClickPipe](#creating-clickpipe)。您需要:

- 将 `VPC endpoint type` 设置为 `VPC Resource`。
- 将 `Resource configuration ID` 设置为步骤 2 中创建的资源配置 ID。
- 将 `Resource share ARN` 设置为步骤 3 中创建的资源共享 ARN。

有关使用 VPC 资源的 PrivateLink 的更多详细信息,请参阅 [AWS 文档](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)。

</VerticalStepper>

### MSK 多 VPC 连接 {#msk-multi-vpc}

[多 VPC 连接](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html)是 AWS MSK 的内置功能,允许您将多个 VPC 连接到单个 MSK 集群。
私有 DNS 支持开箱即用,无需任何额外配置。
不支持跨区域连接。

这是 ClickPipes 连接 MSK 的推荐选项。
有关更多详细信息,请参阅[入门指南](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html)。

:::info
更新您的 MSK 集群策略,将 `072088201116` 添加到 MSK 集群的允许主体中。
有关更多详细信息,请参阅 AWS 指南中的[附加集群策略](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html)部分。
:::

请参阅我们的 [ClickPipes MSK 设置指南](/knowledgebase/aws-privatelink-setup-for-msk-clickpipes)了解如何设置连接。

### VPC 端点服务 {#vpc-endpoint-service}

[VPC 端点服务](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)是与 ClickPipes 共享数据源的另一种方法。
它需要在数据源前设置 NLB(网络负载均衡器),
并配置 VPC 端点服务使用该 NLB。

VPC 端点服务可以[配置私有 DNS](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html),
该 DNS 将在 ClickPipes VPC 中可访问。

它是以下场景的首选方案:

- 任何需要私有 DNS 支持的本地 Kafka 部署
- [Postgres CDC 的跨区域连接](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- MSK 集群的跨区域连接。请联系 ClickHouse 支持团队寻求帮助。

有关更多详细信息,请参阅[入门指南](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)。

:::info
将 ClickPipes 账户 ID `072088201116` 添加到 VPC 端点服务的允许主体中。
有关更多详细信息,请参阅 AWS 指南中的[管理权限](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions)部分。
:::

:::info
可以为 ClickPipes 配置[跨区域访问](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region)。将[您的 ClickPipe 区域](#aws-privatelink-regions)添加到 VPC 端点服务的允许区域中。
:::


## 使用反向私有端点创建 ClickPipe {#creating-clickpipe}

<VerticalStepper headerLevel="list">

1. 访问您的 ClickHouse Cloud 服务的 SQL 控制台。

<Image img={cp_service} alt='ClickPipes service' size='md' border />

2. 在左侧菜单中选择 `Data Sources` 按钮,然后点击 "Set up a ClickPipe"

<Image img={cp_step0} alt='Select imports' size='lg' border />

3. 选择 Kafka 或 Postgres 作为数据源。

<Image img={cp_rpe_select} alt='Select data source' size='lg' border />

4. 选择 `Reverse private endpoint` 选项。

<Image
  img={cp_rpe_step0}
  alt='Select reverse private endpoint'
  size='lg'
  border
/>

5. 选择现有的反向私有端点或创建新端点。

:::info
如果 RDS 需要跨区域访问,您需要创建 VPC 端点服务,[本指南](/knowledgebase/aws-privatelink-setup-for-clickpipes)提供了良好的设置起点。

对于同区域访问,建议创建 VPC 资源。
:::

<Image
  img={cp_rpe_step1}
  alt='Select reverse private endpoint'
  size='lg'
  border
/>

6. 为所选端点类型提供必需的参数。

<Image
  img={cp_rpe_step2}
  alt='Select reverse private endpoint'
  size='lg'
  border
/>

    - 对于 VPC 资源,提供配置共享 ARN 和配置 ID。
    - 对于 MSK 多 VPC,提供集群 ARN 以及已创建端点使用的身份验证方法。
    - 对于 VPC 端点服务,提供服务名称。

7. 点击 `Create` 并等待反向私有端点就绪。

   如果您正在创建新端点,设置端点需要一些时间。
   端点就绪后,页面将自动刷新。
   VPC 端点服务可能需要在您的 AWS 控制台中接受连接请求。

<Image
  img={cp_rpe_step3}
  alt='Select reverse private endpoint'
  size='lg'
  border
/>

8. 端点就绪后,您可以使用 DNS 名称连接到数据源。

   在端点列表中,您可以看到可用端点的 DNS 名称。
   它可以是 ClickPipes 内部预配的 DNS 名称,也可以是 PrivateLink 服务提供的私有 DNS 名称。
   DNS 名称不是完整的网络地址。
   请根据数据源添加端口。

   MSK 连接字符串可在 AWS 控制台中访问。

   要查看完整的 DNS 名称列表,请在云服务设置中访问。

</VerticalStepper>


## 管理现有的反向私有端点 {#managing-existing-endpoints}

您可以在 ClickHouse Cloud 服务设置中管理现有的反向私有端点:

<VerticalStepper headerLevel="list">

1. 在侧边栏中找到 `Settings` 按钮并点击。

   <Image
     img={cp_rpe_settings0}
     alt='ClickHouse Cloud 设置'
     size='lg'
     border
   />

2. 在 `ClickPipe reverse private endpoints` 部分点击 `Reverse private endpoints`。

   <Image
     img={cp_rpe_settings1}
     alt='ClickHouse Cloud 设置'
     size='md'
     border
   />

   反向私有端点的详细信息将显示在弹出面板中。

   可以在此处删除端点。删除操作将影响所有使用该端点的 ClickPipes。

</VerticalStepper>


## 支持的 AWS 区域 {#aws-privatelink-regions}

ClickPipes 对 AWS PrivateLink 的支持仅限于特定的 AWS 区域。
请参阅 [ClickPipes 区域列表](/integrations/clickpipes#list-of-static-ips)查看可用区域。

此限制不适用于已启用跨区域连接的 PrivateLink VPC 终端节点服务。


## 限制 {#limitations}

在 ClickHouse Cloud 中为 ClickPipes 创建的 AWS PrivateLink 端点不保证会创建在与 ClickHouse Cloud 服务相同的 AWS 区域中。

目前,仅 VPC 端点服务支持跨区域连接。

私有端点与特定的 ClickHouse 服务关联,无法在不同服务之间转移。单个 ClickHouse 服务的多个 ClickPipes 可以重用同一端点。
