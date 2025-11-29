---
sidebar_label: '适用于 ClickPipes 的 AWS PrivateLink'
description: '使用 AWS PrivateLink 在 ClickPipes 与数据源之间建立安全连接。'
slug: /integrations/clickpipes/aws-privatelink
title: '适用于 ClickPipes 的 AWS PrivateLink'
doc_type: 'guide'
keywords: ['AWS PrivateLink', 'ClickPipes 安全性', 'VPC 终端节点', '私有连接', 'VPC 资源']
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


# 面向 ClickPipes 的 AWS PrivateLink {#aws-privatelink-for-clickpipes}

您可以使用 [AWS PrivateLink](https://aws.amazon.com/privatelink/) 在 VPC、AWS 服务、本地系统与 ClickHouse Cloud 之间建立安全连接，而无需将流量暴露在公共互联网中。

本文档介绍了 ClickPipes 的反向私有终端节点功能，
该功能允许您配置 AWS PrivateLink VPC 终端节点。



## 支持的 ClickPipes 数据源 {#supported-sources}

ClickPipes 反向私有端点功能目前仅适用于以下类型的数据源：
- Kafka
- Postgres
- MySQL
- MongoDB



## 支持的 AWS PrivateLink 端点类型 {#aws-privatelink-endpoint-types}

可以通过以下任一 AWS PrivateLink 方式来配置 ClickPipes 反向私有端点：

- [VPC 资源](#vpc-resource)
- [用于 MSK ClickPipe 的 MSK 多 VPC 连接](#msk-multi-vpc)
- [VPC 端点服务](#vpc-endpoint-service)

### VPC 资源 {#vpc-resource}

:::info
不支持跨 Region。
:::

你可以在 ClickPipes 中通过 [PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html) 访问 VPC 资源。此方式不需要在数据源前部署负载均衡器。

资源配置可以指定到某个特定主机或 RDS 集群的 ARN。

对于使用 Postgres CDC 从 RDS 集群摄取数据，这是首选方式。

要使用 VPC 资源配置 PrivateLink：

1. 创建资源网关
2. 创建资源配置
3. 创建资源共享

<VerticalStepper headerLevel="h4">

#### 创建资源网关 {#create-resource-gateway}

资源网关是接收你 VPC 中指定资源流量的入口。

:::note
建议与你的资源网关关联的子网具有足够数量的可用 IP 地址。
推荐每个子网至少使用 `/26` 子网掩码。

对于每个 VPC 端点（每个 Reverse Private Endpoint），AWS 要求每个子网提供一段连续的 16 个 IP 地址块（`/28` 子网掩码）。
如果不满足这一要求，Reverse Private Endpoint 将变为失败状态。
:::

你可以在 [AWS 控制台](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-gateway.html) 中创建资源网关，或者使用以下命令创建：

```bash
aws vpc-lattice create-resource-gateway \
    --vpc-identifier <VPC_ID> \
    --subnet-ids <SUBNET_IDS> \
    --security-group-ids <SG_IDs> \
    --name <RESOURCE_GATEWAY_NAME>
```

命令输出中会包含资源网关 ID，你在下一步中将用到它。

在继续之前，你需要等待资源网关进入 `Active` 状态。你可以通过运行以下命令检查其状态：

```bash
aws vpc-lattice get-resource-gateway \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID>
```

#### 创建 VPC Resource-Configuration {#create-resource-configuration}

Resource-Configuration 会与资源网关关联，使你的资源可以被访问。

你可以在 [AWS 控制台](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-configuration.html) 中创建 Resource-Configuration，或者使用以下命令创建：

```bash
aws vpc-lattice create-resource-configuration \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID> \
    --type <RESOURCE_CONFIGURATION_TYPE> \
    --resource-configuration-definition <RESOURCE_CONFIGURATION_DEFINITION> \
    --name <RESOURCE_CONFIGURATION_NAME>
```

最简单的[资源配置类型](https://docs.aws.amazon.com/vpc-lattice/latest/ug/resource-configuration.html#resource-configuration-types)是单个 Resource-Configuration。你可以直接使用 ARN 进行配置，或者共享一个 IP 地址，或一个能在公网上解析的域名。

例如，要使用某个 RDS 集群的 ARN 进行配置：

```bash
aws vpc-lattice create-resource-configuration \
    --name my-rds-cluster-config \
    --type ARN \
    --resource-gateway-identifier rgw-0bba03f3d56060135 \
    --resource-configuration-definition 'arnResource={arn=arn:aws:rds:us-east-1:123456789012:cluster:my-rds-cluster}'
```

:::note
无法为可公开访问的集群创建资源配置。
如果你的集群是可公开访问的，你必须先将集群修改为私有，然后再创建资源配置，
或者改用 [IP 允许列表](/integrations/clickpipes#list-of-static-ips)。
更多信息请参见 [AWS 文档](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html#resource-definition)。
:::

命令输出中会包含一个 Resource-Configuration 的 ARN，你在下一步中将用到它。输出中还会包含 Resource-Configuration ID，你在使用 VPC 资源配置 ClickPipe 连接时需要使用该 ID。

#### 创建 Resource-Share {#create-resource-share}

要共享你的资源，需要创建一个 Resource-Share。这是通过 Resource Access Manager（RAM）来实现的。


您可以通过 [AWS 控制台](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html) 将 Resource-Configuration 添加到 Resource-Share，或者使用 ClickPipes 账户 ID `072088201116`（arn:aws:iam::072088201116:root）运行以下命令来完成：

```bash
aws ram create-resource-share \
    --principals 072088201116 \
    --resource-arns <RESOURCE_CONFIGURATION_ARN> \
    --name <RESOURCE_SHARE_NAME>
```

命令输出中会包含一个 Resource-Share 的 ARN，您需要使用该 ARN 通过 VPC 资源建立 ClickPipe 连接。

现在，您已经可以使用 VPC 资源来[创建带有反向私有终端节点的 ClickPipe](#creating-clickpipe)。您需要：

- 将 `VPC endpoint type` 设置为 `VPC Resource`。
- 将 `Resource configuration ID` 设置为第 2 步中创建的 Resource-Configuration 的 ID。
- 将 `Resource share ARN` 设置为第 3 步中创建的 Resource-Share 的 ARN。

有关在 VPC 资源中使用 PrivateLink 的更多信息，请参阅 [AWS 文档](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)。

</VerticalStepper>

### MSK 多 VPC 连通性 {#msk-multi-vpc}

[Multi-VPC connectivity](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html) 是 AWS MSK 的内置功能，可让您将多个 VPC 连接到同一个 MSK 集群。
Private DNS 支持开箱即用，无需任何额外配置。
不支持跨区域。

这是 ClickPipes for MSK 的推荐选项。
有关更多详细信息，请参阅[入门指南](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html)。

:::info
更新您的 MSK 集群策略，并将 `072088201116` 添加到 MSK 集群的允许主体列表中。
有关更多信息，请参阅 AWS 关于[附加集群策略](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html)的指南。
:::

请按照我们的[用于 ClickPipes 的 MSK 配置指南](/knowledgebase/aws-privatelink-setup-for-msk-clickpipes)了解如何设置该连接。

### VPC 终端节点服务 {#vpc-endpoint-service}

[VPC 终端节点服务](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html) 是将数据源与 ClickPipes 共享的另一种方式。
这种方式需要在数据源前部署一个 NLB（Network Load Balancer，网络负载均衡器），并将 VPC 终端节点服务配置为使用该 NLB。

VPC 终端节点服务可以[配置为使用 Private DNS](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html)，该 DNS 可在 ClickPipes 的 VPC 中访问。

在以下场景中，这是首选方案：

- 任何需要 Private DNS 支持的本地部署 Kafka 环境
- [Postgres CDC 的跨区域连接](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- MSK 集群的跨区域连接。请联系 ClickHouse 支持团队以获取协助。

有关更多详细信息，请参阅[入门指南](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)。

:::info
将 ClickPipes 账户 ID `072088201116` 添加到 VPC 终端节点服务的允许主体列表中。
有关更多信息，请参阅 AWS 关于[管理权限](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions)的指南。
:::

:::info
可以为 ClickPipes 配置[跨区域访问](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region)。请将[您的 ClickPipe 区域](#aws-privatelink-regions)添加到 VPC 终端节点服务的允许区域列表中。
:::


## 使用反向私有终端节点创建 ClickPipe {#creating-clickpipe}

<VerticalStepper headerLevel="list">

1. 访问你的 ClickHouse Cloud 服务的 SQL 控制台（SQL Console）。

<Image img={cp_service} alt="ClickPipes 服务" size="md" border/>

2. 在左侧菜单中选择 `Data Sources` 按钮，然后单击 “Set up a ClickPipe”。

<Image img={cp_step0} alt="选择导入" size="lg" border/>

3. 选择 Kafka 或 Postgres 作为数据源。

<Image img={cp_rpe_select} alt="选择数据源" size="lg" border/>

4. 选择 `Reverse private endpoint` 选项。

<Image img={cp_rpe_step0} alt="选择反向私有终端节点" size="lg" border/>

5. 选择任一现有的反向私有终端节点，或创建一个新的终端节点。

:::info
如果 RDS 需要跨区域访问，你需要创建一个 VPC endpoint service，
[本指南](/knowledgebase/aws-privatelink-setup-for-clickpipes) 可以作为配置的良好起点。

对于同一区域访问，推荐的做法是创建一个 VPC Resource。
:::

<Image img={cp_rpe_step1} alt="选择反向私有终端节点" size="lg" border/>

6. 为所选终端节点类型提供所需参数。

<Image img={cp_rpe_step2} alt="选择反向私有终端节点" size="lg" border/>

    - 对于 VPC resource，请提供 configuration share ARN 和 configuration ID。
    - 对于 MSK multi-VPC，请提供集群 ARN 以及在创建终端节点时使用的认证方法。
    - 对于 VPC endpoint service，请提供 service name（服务名称）。

7. 单击 `Create` 并等待反向私有终端节点就绪。

   如果你正在创建一个新的终端节点，完成该终端节点的设置将需要一段时间。
   终端节点就绪后，页面会自动刷新。
   VPC endpoint service 可能需要你在 AWS 控制台中接受连接请求。

<Image img={cp_rpe_step3} alt="选择反向私有终端节点" size="lg" border/>

8. 终端节点就绪后，你可以使用 DNS 名称连接到数据源。

   在终端节点列表中，你可以看到可用终端节点的 DNS 名称。
   它可以是 ClickPipes 内部预配的 DNS 名称，也可以是由 PrivateLink 服务提供的私有 DNS 名称。
   DNS 名称不是完整的网络地址，
   需要根据数据源添加端口。

   MSK 连接字符串可以在 AWS 控制台中查看。

   如需查看完整的 DNS 名称列表，请在云服务设置中查看。

</VerticalStepper>



## 管理现有的反向私有端点 {#managing-existing-endpoints}

可以在 ClickHouse Cloud 的服务设置中管理现有的反向私有端点：

<VerticalStepper headerLevel="list">

1. 在侧边栏中找到 `Settings` 按钮并点击。

    <Image img={cp_rpe_settings0} alt="ClickHouse Cloud 设置" size="lg" border/>

2. 在 `ClickPipe reverse private endpoints` 部分中点击 `Reverse private endpoints`。

    <Image img={cp_rpe_settings1} alt="ClickHouse Cloud 设置" size="md" border/>

   反向私有端点的详细信息会显示在侧边弹出面板中。

   可以在此处删除该端点。这将影响所有使用此端点的 ClickPipes。

</VerticalStepper>



## 支援的 AWS 區域 {#aws-privatelink-regions}

針對 ClickPipes，AWS PrivateLink 僅在特定 AWS 區域提供支援。
請參閱 [ClickPipes 區域列表](/integrations/clickpipes#list-of-static-ips) 以查看可用區域。

此限制不適用於已啟用跨區域連線的 PrivateLink VPC 端點服務。



## 限制 {#limitations}

在 ClickHouse Cloud 中为 ClickPipes 创建的 AWS PrivateLink 端点不保证会位于与 ClickHouse Cloud 服务相同的 AWS 区域。

目前，只有 VPC 终端节点服务（VPC endpoint service）支持跨区域连接。

私有端点会关联到特定的 ClickHouse 服务，无法在服务之间复用或迁移。
针对单个 ClickHouse 服务的多个 ClickPipes 可以复用同一个端点。
