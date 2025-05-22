---
'sidebar_label': 'AWS PrivateLink for ClickPipes'
'description': '使用AWS PrivateLink在ClickPipes和数据源之间建立安全连接。'
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

您可以使用 [AWS PrivateLink](https://aws.amazon.com/privatelink/) 在 VPC、AWS 服务、您的本地系统与 ClickHouse Cloud 之间建立安全的连接，而无需将流量暴露于公共互联网。

本文档概述了 ClickPipes 反向私有端点功能，允许设置 AWS PrivateLink VPC 端点。

## 支持的 AWS PrivateLink 端点类型 {#aws-privatelink-endpoint-types}

ClickPipes 反向私有端点可以通过以下 AWS PrivateLink 方法之一进行配置：

- [VPC 资源](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)
- [MSK 多 VPC 连接 MSK ClickPipe](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html)
- [VPC 端点服务](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)

请遵循上面的链接以获取有关如何设置相应 AWS PrivateLink 共享的详细说明。

### VPC 资源 {#vpc-resource}

您的 VPC 资源可以通过 PrivateLink 在 ClickPipes 中访问。
资源配置可以针对特定主机或 RDS 集群 ARN。
不支持跨区域访问。

这是从 RDS 集群获取数据的 Postgres CDC 的首选选择。

有关更多详细信息，请参阅 [入门指南](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html)。

:::info
VPC 资源需要与 ClickPipes 帐户共享。将 `072088201116` 添加到您的资源共享配置的允许主体中。
有关共享资源的更多详细信息，请参阅 AWS 指南 [共享资源](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html)。
:::

### MSK 多 VPC 连接 {#msk-multi-vpc}

MSK 多 VPC 是 AWS MSK 的内置功能，允许您将多个 VPC 连接到单个 MSK 集群。
私有 DNS 支持是开箱即用的，无需任何额外配置。
不支持跨区域访问。

这是 ClickPipes 对于 MSK 的推荐选项。
有关更多详细信息，请参阅 [入门指南](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html)。

:::info
更新您的 MSK 集群策略，将 `072088201116` 添加到您的 MSK 集群的允许主体中。
有关更多详细信息，请参阅 AWS 指南 [附加集群策略](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html)。
:::

请按照我们的 [ClickPipes 的 MSK 设置指南](/knowledgebase/aws-privatelink-setup-for-msk-clickpipes) 来学习如何设置连接。

### VPC 端点服务 {#vpc-endpoint-service}

VPC 服务是与 ClickPipes 共享您的数据源的另一种方法。
它要求在数据源前设置一个 NLB（网络负载均衡器）并配置 VPC 端点服务以使用 NLB。

VPC 端点服务可以通过 [私有 DNS 进行配置](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html)，该 DNS将在 ClickPipes VPC 中访问。

这是首选选择，用于：

- 任何需要私有 DNS 支持的本地 Kafka 设置
- [Postgres CDC 的跨区域连接](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- MSK 集群的跨区域连接。请联系 ClickHouse 支持团队以获取协助。

有关更多详细信息，请参阅 [入门指南](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)。

:::info
将 ClickPipes 帐户 ID `072088201116` 添加到您的 VPC 端点服务的允许主体中。
有关更多详细信息，请参阅 AWS 指南 [管理权限](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions)。
:::

:::info
[跨区域访问](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region) 可为 ClickPipes 配置。将 [您的 ClickPipe 区域](#aws-privatelink-regions) 添加到您的 VPC 端点服务的允许区域中。
:::

## 创建带反向私有端点的 ClickPipe {#creating-clickpipe}

1. 访问您的 ClickHouse Cloud 服务的 SQL 控制台。

<Image img={cp_service} alt="ClickPipes service" size="md" border/>

2. 在左侧菜单中选择 `数据源` 按钮，然后点击 "设置 ClickPipe"

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. 选择 Kafka 或 Postgres 作为数据源。

<Image img={cp_rpe_select} alt="Select data source" size="lg" border/>

4. 选择 `反向私有端点` 选项。

<Image img={cp_rpe_step0} alt="Select reverse private endpoint" size="lg" border/>

5. 选择任何现有的反向私有端点或创建一个新端点。

:::info
如果 RDS 需要跨区域访问，您需要创建一个 VPC 端点服务， 
[本指南应提供](/knowledgebase/aws-privatelink-setup-for-clickpipes) 一个良好的起点来设置它。

对于同一区域访问，创建 VPC 资源是推荐的方法。
:::

<Image img={cp_rpe_step1} alt="Select reverse private endpoint" size="lg" border/>

6. 提供所选端点类型所需的参数。

<Image img={cp_rpe_step2} alt="Select reverse private endpoint" size="lg" border/>

    - 对于 VPC 资源，提供配置共享 ARN 和配置 ID。
    - 对于 MSK 多 VPC，提供集群 ARN 和与创建的端点一起使用的身份验证方法。
    - 对于 VPC 端点服务，提供服务名称。

7. 点击 `创建` 并等待反向私有端点准备就绪。

   如果您正在创建一个新端点，设置端点可能需要一些时间。
   一旦端点准备好，页面将自动刷新。
   VPC 端点服务可能需要在您的 AWS 控制台中接受连接请求。

<Image img={cp_rpe_step3} alt="Select reverse private endpoint" size="lg" border/>

8. 一旦端点准备就绪，您可以使用 DNS 名称连接到数据源。

   在端点列表中，您可以看到可用端点的 DNS 名称。
   这可以是 ClickPipes 提供的内部 DNS 名称或由 PrivateLink 服务提供的私有 DNS 名称。
   DNS 名称不是完整的网络地址。
   根据数据源添加端口。

   MSK 连接字符串可以在 AWS 控制台中访问。

   要查看完整的 DNS 名称列表，请在云服务设置中访问它。

## 管理现有反向私有端点 {#managing-existing-endpoints}

您可以在 ClickHouse Cloud 服务设置中管理现有的反向私有端点：

1. 在侧边栏找到 `设置` 按钮并点击它。

<Image img={cp_rpe_settings0} alt="ClickHouse Cloud settings" size="lg" border/>

2. 在 `ClickPipe 反向私有端点` 部分中点击 `反向私有端点`。

<Image img={cp_rpe_settings1} alt="ClickHouse Cloud settings" size="md" border/>

    将显示反向私有端点的扩展信息。

    可以从这里移除端点。这将影响任何使用此端点的 ClickPipes。

## 支持的 AWS 区域 {#aws-privatelink-regions}

AWS PrivateLink 支持以下 AWS 区域：

- `us-east-1` - 用于运行在 `us-east-1` 区域的 ClickHouse 服务
- `eu-central-1` 用于运行在 EU 区域的 ClickHouse 服务
- `us-east-2` - 用于在其他地方运行的 ClickHouse 服务

此限制不适用于支持跨区域连接的 PrivateLink VPC 端点服务类型。

## 限制 {#limitations}

在 ClickHouse Cloud 中创建的 ClickPipes 的 AWS PrivateLink 端点不能保证与 ClickHouse Cloud 服务在同一 AWS 区域中创建。

目前，仅 VPC 端点服务支持跨区域连接。

私有端点与特定的 ClickHouse 服务相关联，并且不能在服务之间转移。
多个 ClickPipes 可以重用同一 ClickHouse 服务的相同端点。
