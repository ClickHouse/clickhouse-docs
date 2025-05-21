---
'sidebar_label': 'ClickPipes 的 AWS PrivateLink'
'description': '使用 AWS PrivateLink 在 ClickPipes 和数据源之间建立安全连接。'
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

您可以使用 [AWS PrivateLink](https://aws.amazon.com/privatelink/) 在 VPC、AWS 服务、您内部部署的系统和 ClickHouse Cloud 之间建立安全连接，而无需将流量暴露给公共互联网。

本文档概述了 ClickPipes 反向私有端点功能，允许设置 AWS PrivateLink VPC 端点。

## 支持的 AWS PrivateLink 端点类型 {#aws-privatelink-endpoint-types}

ClickPipes 反向私有端点可以使用以下 AWS PrivateLink 方法之一进行配置：

- [VPC 资源](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)
- [MSK 多 VPC 连接用于 MSK ClickPipe](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html)
- [VPC 端点服务](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)

请按照上面的链接获取详细的说明，以设置相应的 AWS PrivateLink 共享。

### VPC 资源 {#vpc-resource}

您的 VPC 资源可以通过 PrivateLink 在 ClickPipes 中被访问。
资源配置可以针对特定主机或 RDS 集群 ARN。
不支持跨区域。

这是从 RDS 集群摄取数据的 Postgres CDC 的首选选择。

有关更多详细信息，请查看 [入门指南](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html)。

:::info
VPC 资源需要与 ClickPipes 账户共享。请将 `072088201116` 添加到您的资源共享配置中的允许主体。
有关详细信息，请参见 AWS 指南 [共享资源](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html)。
:::

### MSK 多 VPC 连接 {#msk-multi-vpc}

MSK 多 VPC 是 AWS MSK 的内置功能，允许您将多个 VPC 连接到单个 MSK 集群。
私有 DNS 支持是开箱即用的，无需任何额外配置。
不支持跨区域。

这是 ClickPipes 用于 MSK 的推荐选项。
有关更多详细信息，请参见 [入门指南](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html)。

:::info
更新您的 MSK 集群策略，并将 `072088201116` 添加到您 MSK 集群的允许主体。
有关详细信息，请参见 AWS 指南 [附加集群策略](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html)。
:::

请遵循我们的 [MSK 设置指南用于 ClickPipes](/knowledgebase/aws-privatelink-setup-for-msk-clickpipes) 了解如何设置连接。

### VPC 端点服务 {#vpc-endpoint-service}

VPC 服务是与 ClickPipes 共享数据源的另一种方法。
这需要在您的数据源前面设置一个 NLB（网络负载均衡器），并配置 VPC 端点服务以使用 NLB。

VPC 端点服务可以与 [私有 DNS 进行配置](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html)，将可在 ClickPipes VPC 中访问。

这是首选的选择，用于：

- 任何需要私有 DNS 支持的内部 Kafka 设置
- [Postgres CDC 的跨区域连接](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- MSK 集群的跨区域连接。请联系 ClickHouse 支持团队寻求帮助。

有关更多详细信息，请参见 [入门指南](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)。

:::info
将 ClickPipes 账户 ID `072088201116` 添加到您的 VPC 端点服务的允许主体中。
有关详细信息，请参见 AWS 指南 [管理权限](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions)。
:::

:::info
可以为 ClickPipes 配置 [跨区域访问](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region)。将 [您的 ClickPipe 区域](#aws-privatelink-regions) 添加到 VPC 端点服务中的允许区域中。
:::

## 创建反向私有端点的 ClickPipe {#creating-clickpipe}

1. 访问您的 ClickHouse Cloud 服务的 SQL 控制台。

<Image img={cp_service} alt="ClickPipes service" size="md" border/>

2. 在左侧菜单中选择 `数据源` 按钮，然后点击“设置 ClickPipe”。

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. 选择 Kafka 或 Postgres 作为数据源。

<Image img={cp_rpe_select} alt="Select data source" size="lg" border/>

4. 选择 `反向私有端点` 选项。

<Image img={cp_rpe_step0} alt="Select reverse private endpoint" size="lg" border/>

5. 选择任何现有的反向私有端点或创建一个新的。

:::info
如果需要为 RDS 创建跨区域访问，您需要创建一个 VPC 端点服务，并且 [本指南应该提供](/knowledgebase/aws-privatelink-setup-for-clickpipes) 设置它的良好起点。

对于同一区域访问，建议创建 VPC 资源。
:::

<Image img={cp_rpe_step1} alt="Select reverse private endpoint" size="lg" border/>

6. 提供所选端点类型所需的参数。

<Image img={cp_rpe_step2} alt="Select reverse private endpoint" size="lg" border/>

    - 对于 VPC 资源，提供配置共享 ARN 和配置 ID。
    - 对于 MSK 多 VPC，提供集群 ARN 和用于创建端点的身份验证方法。
    - 对于 VPC 端点服务，提供服务名称。

7. 单击 `创建`，并等待反向私有端点准备就绪。

   如果您正在创建一个新的端点，则设置端点将需要一些时间。
   一旦端点准备就绪，页面将自动刷新。
   VPC 端点服务可能需要在您的 AWS 控制台中接受连接请求。

<Image img={cp_rpe_step3} alt="Select reverse private endpoint" size="lg" border/>

8. 一旦端点准备就绪，您可以使用 DNS 名称连接到数据源。

   在端点列表中，您可以看到可用端点的 DNS 名称。
   它可以是 ClickPipes 提供的内部 DNS 名称或由 PrivateLink 服务提供的私有 DNS 名称。
   DNS 名称不是完整的网络地址。
   根据数据源添加端口。

   MSK 连接字符串可以在 AWS 控制台中访问。

   要查看 DNS 名称的完整列表，请在云服务设置中访问它。

## 管理现有的反向私有端点 {#managing-existing-endpoints}

您可以在 ClickHouse Cloud 服务设置中管理现有的反向私有端点：

1. 在侧边栏中找到 `设置` 按钮并单击它。

<Image img={cp_rpe_settings0} alt="ClickHouse Cloud settings" size="lg" border/>

2. 在 `ClickPipe 反向私有端点` 部分中点击 `反向私有端点`。

<Image img={cp_rpe_settings1} alt="ClickHouse Cloud settings" size="md" border/>

   将在弹出窗口中显示反向私有端点的扩展信息。

   可以从这里删除端点。它将影响使用此端点的任何 ClickPipes。

## 支持的 AWS 区域 {#aws-privatelink-regions}

AWS PrivateLink 支持以下 AWS 区域：

- `us-east-1` - 用于在 `us-east-1` 区域运行的 ClickHouse 服务
- `eu-central-1` - 用于在欧盟区域运行的 ClickHouse 服务
- `us-east-2` - 用于在其他地方运行的 ClickHouse 服务

此限制不适用于 PrivateLink VPC 端点服务类型，因为它支持跨区域连接。

## 限制 {#limitations}

在 ClickHouse Cloud 中为 ClickPipes 创建的 AWS PrivateLink 端点不保证与 ClickHouse Cloud 服务位于同一 AWS 区域。

目前，只有 VPC 端点服务支持跨区域连接。

私有端点链接到特定的 ClickHouse 服务，并且不可在服务之间转移。
单个 ClickHouse 服务的多个 ClickPipes 可以重用相同的端点。
