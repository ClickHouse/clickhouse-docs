import Image from '@theme/IdealImage';
import provider_selection from '@site/static/images/clickstack/getting-started/provider_selection.png';
import advanced_resources from '@site/static/images/clickstack/getting-started/advanced_resources.png';
import service_provisioned from '@site/static/images/clickstack/getting-started/service_provisioned.png';
import region_resources from '@site/static/images/clickstack/getting-started/region_resources.png';
import ResourceEstimation from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/managing/_snippets/_resource_estimation.md';

:::note Scale vs Enterprise
我们建议大多数 ClickStack 工作负载使用此 [Scale 层级](/cloud/manage/cloud-tiers)。如果您需要高级安全功能 (例如 SAML、CMEK 或满足 HIPAA 合规要求) ，请选择 Enterprise 层级。它还为超大规模 ClickStack 部署提供自定义硬件配置。在这些情况下，我们建议联系支持团队。
:::

选择 Cloud 提供商和区域。

<Image img={region_resources} size="md" alt="资源选择器" border />

在指定 CPU 和内存时，请根据预期的 ClickStack 摄取吞吐量进行估算。下表为这些资源的规格提供参考指导。

<ResourceEstimation />

指定完需求后，您的托管 ClickStack 服务将需要几分钟时间完成预配。在等待预配期间，您可以随时浏览 [ClickHouse Cloud 控制台](/cloud/overview) 的其他部分。

一旦**预配完成，左侧菜单中的 &#39;ClickStack&#39; 选项将被启用**。
