import Image from '@theme/IdealImage';
import provider_selection from '@site/static/images/clickstack/getting-started/provider_selection.png';
import advanced_resources from '@site/static/images/clickstack/getting-started/advanced_resources.png';
import service_provisioned from '@site/static/images/clickstack/getting-started/service_provisioned.png';

选择你的云服务提供商、希望部署的区域，以及你每月的数据量，并通过“Memory and Scaling”下拉菜单进行配置。

这里应填写你数据量的粗略估算，包括未压缩形式的日志或跟踪数据。

<Image img={provider_selection} size="md" alt="资源选择器" border />

该估算将用于确定为你的 Managed ClickStack 服务分配的计算资源规格。默认情况下，新组织会被放置在 [Scale 层级](/cloud/manage/cloud-tiers)。在 Scale 层级中，[纵向自动扩缩容](/manage/scaling#vertical-auto-scaling) 将默认启用。你可以稍后在“Plans”页面更改你的组织层级。

对于理解自身资源需求的高级用户，可以通过在“Memory and Scaling”下拉菜单中选择“Custom Configuration”，来精确指定预配的资源以及任意企业特性。

<Image img={advanced_resources} size="md" alt="高级资源选择器" border />

在你指定完需求后，你的 Managed ClickStack 服务将需要数分钟完成预配。预配完成情况会在后续的 “ClickStack” 页面中显示。等待预配期间，你可以随时浏览 [ClickHouse Cloud 控制台](/cloud/overview) 的其他内容。

<Image img={service_provisioned} size="md" alt="服务已预配" border />

预配完成后，选择“Start Ingestion”。
