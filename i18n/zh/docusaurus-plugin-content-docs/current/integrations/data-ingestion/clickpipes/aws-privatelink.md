---
'sidebar_label': 'AWS PrivateLink for ClickPipes'
'description': '通过 AWS PrivateLink 在 ClickPipes 和数据源之间建立安全连接。'
'slug': '/integrations/clickpipes/aws-privatelink'
'title': 'AWS PrivateLink for ClickPipes'
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


# AWS PrivateLink for ClickPipes

您可以使用 [AWS PrivateLink](https://aws.amazon.com/privatelink/) 在 VPC、AWS 服务、您的本地系统和 ClickHouse Cloud 之间建立安全连接，而不将流量暴露于公共互联网。

本文件概述了 ClickPipes 反向私有端点功能，允许设置 AWS PrivateLink VPC 端点。

## 支持的 AWS PrivateLink 端点类型 {#aws-privatelink-endpoint-types}

ClickPipes 反向私有端点可以通过以下 AWS PrivateLink 方法之一进行配置：

- [VPC 资源](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)
- [MSK multi-VPC 连接用于 MSK ClickPipe](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html)
- [VPC 端点服务](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)

请按照上述链接中的详细说明设置相应的 AWS PrivateLink 共享。

### VPC 资源 {#vpc-resource}

您可以通过 PrivateLink 在 ClickPipes 中访问 VPC 资源。
资源配置可以针对特定主机或 RDS 集群 ARN 进行设置。
不支持跨区域。

这是从 RDS 集群中获取数据的 Postgres CDC 的首选选择。

有关详细信息，请参见 [入门指南](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html)。

:::info
VPC 资源需要与 ClickPipes 帐户共享。将 `072088201116` 添加到您的资源共享配置中的允许主体中。
有关详细信息，请参见 AWS 指南 [共享资源](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html)。
:::

### MSK multi-VPC 连接 {#msk-multi-vpc}

MSK multi-VPC 是 AWS MSK 的内置功能，允许您将多个 VPC 连接到单个 MSK 集群。
私有 DNS 支持是开箱即用的，不需要任何额外配置。
不支持跨区域。

这是 ClickPipes 对于 MSK 推荐的选项。
有关详细信息，请参见 [入门指南](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html)。

:::info
请更新您的 MSK 集群策略，并将 `072088201116` 添加到您的 MSK 集群的允许主体中。
有关详细信息，请参见 AWS 指南 [附加集群策略](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html)。
:::

请查看我们的 [MSK 设置指南以获取 ClickPipes](/knowledgebase/aws-privatelink-setup-for-msk-clickpipes)，了解如何设置连接。

### VPC 端点服务 {#vpc-endpoint-service}

VPC 服务是与 ClickPipes 共享数据源的另一种方法。
它需要在您的数据源前设置 NLB（网络负载均衡器）并配置 VPC 端点服务以使用 NLB。

VPC 端点服务可以 [配置为私有 DNS](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html)，
该 DNS 将在 ClickPipes VPC 中可访问。

它是以下情况的首选选择：

- 任何需要私有 DNS 支持的本地 Kafka 设置
- [Postgres CDC 的跨区域连接](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- MSK 集群的跨区域连接。有关帮助，请联系 ClickHouse 支持团队。

有关详细信息，请参见 [入门指南](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)。

:::info
将 ClickPipes 帐户 ID `072088201116` 添加到您的 VPC 端点服务的允许主体中。
有关详细信息，请参见 AWS 指南 [管理权限](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions)。
:::

:::info
可以为 ClickPipes 配置 [跨区域访问](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region)。
将 [您的 ClickPipe 区域](#aws-privatelink-regions) 添加到您的 VPC 端点服务的允许区域中。
:::

## 创建带有反向私有端点的 ClickPipe {#creating-clickpipe}

1. 访问您 ClickHouse Cloud 服务的 SQL 控制台。

<Image img={cp_service} alt="ClickPipes service" size="md" border/>

2. 在左侧菜单上选择 `Data Sources` 按钮并单击 "Set up a ClickPipe"

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. 选择 Kafka 或 Postgres 作为数据源。

<Image img={cp_rpe_select} alt="Select data source" size="lg" border/>

4. 选择 `Reverse private endpoint` 选项。

<Image img={cp_rpe_step0} alt="Select reverse private endpoint" size="lg" border/>

5. 选择现有的反向私有端点或创建新的。

:::info
如果需要 RDS 的跨区域访问，则需要创建 VPC 端点服务， 
[本指南应提供](/knowledgebase/aws-privatelink-setup-for-clickpipes) 一个良好的起点来设置它。

对于同一区域访问，创建 VPC 资源是推荐的方法。
:::

<Image img={cp_rpe_step1} alt="Select reverse private endpoint" size="lg" border/>

6. 为所选端点类型提供所需的参数。

<Image img={cp_rpe_step2} alt="Select reverse private endpoint" size="lg" border/>

    - 对于 VPC 资源，提供配置共享 ARN 和配置 ID。
    - 对于 MSK multi-VPC，提供集群 ARN 和用于创建端点的身份验证方法。
    - 对于 VPC 端点服务，提供服务名称。

7. 单击 `Create` 并等待反向私有端点准备就绪。

   如果您正在创建新的端点，则设置该端点可能需要一些时间。
   一旦端点准备就绪，页面将自动刷新。
   VPC 端点服务可能需要在您的 AWS 控制台中接受连接请求。

<Image img={cp_rpe_step3} alt="Select reverse private endpoint" size="lg" border/>

8. 一旦端点准备就绪，您可以使用 DNS 名称连接到数据源。

   在端点列表中，您可以看到可用端点的 DNS 名称。
   它可以是 ClickPipes 自行配置的内部 DNS 名称或由 PrivateLink 服务提供的私有 DNS 名称。
   DNS 名称不是完整的网络地址。
   根据数据源添加对应的端口。

   MSK 连接字符串可以在 AWS 控制台中访问。

   要查看完整的 DNS 名称列表，请在云服务设置中访问它。

## 管理现有的反向私有端点 {#managing-existing-endpoints}

您可以在 ClickHouse Cloud 服务设置中管理现有的反向私有端点：

1. 在侧边栏找到 `Settings` 按钮并单击它。

<Image img={cp_rpe_settings0} alt="ClickHouse Cloud settings" size="lg" border/>

2. 在 `ClickPipe reverse private endpoints` 部分中点击 `Reverse private endpoints`。

<Image img={cp_rpe_settings1} alt="ClickHouse Cloud settings" size="md" border/>

    反向私有端点的扩展信息将在飞出窗口中显示。

    可以从这里移除端点。这将影响使用该端点的任何 ClickPipes。

## 支持的 AWS 区域 {#aws-privatelink-regions}

以下 AWS 区域支持 AWS PrivateLink：

- `us-east-1` - 用于运行在 `us-east-1` 区域的 ClickHouse 服务
- `eu-central-1` - 用于在欧洲区域运行的 ClickHouse 服务
- `us-east-2` - 用于其他地方运行的 ClickHouse 服务

此限制不适用于 PrivateLink VPC 端点服务类型，因为它支持跨区域连接。

## 限制 {#limitations}

在 ClickHouse Cloud 中为 ClickPipes 创建的 AWS PrivateLink 端点无法保证与 ClickHouse Cloud 服务位于同一 AWS 区域。

目前，仅 VPC 端点服务支持跨区域连接。

私有端点与特定 ClickHouse 服务关联，无法在服务之间转移。
对于单个 ClickHouse 服务，可以有多个 ClickPipes 共享同一个端点。
