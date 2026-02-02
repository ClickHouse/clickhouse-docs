import Image from '@theme/IdealImage';
import provider_selection from '@site/static/images/clickstack/getting-started/provider_selection.png';
import advanced_resources from '@site/static/images/clickstack/getting-started/advanced_resources.png';
import service_provisioned from '@site/static/images/clickstack/getting-started/service_provisioned.png';

选择您的云服务提供商、希望部署的区域，并通过“Memory and Scaling”下拉菜单选择您每月需要处理的数据量。

这里只需提供一个大致估算值，表示您拥有的未压缩数据量，可以是日志或追踪数据（traces）。

<Image img={provider_selection} size="md" alt="资源选择器" border />

该估算值将用于确定支撑托管 ClickStack 服务的计算资源规格。默认情况下，新创建的组织会被设置为 [Scale 层级](/cloud/manage/cloud-tiers)。在 Scale 层级中，[垂直自动扩缩容](/manage/scaling#vertical-auto-scaling) 将默认启用。您可以稍后在 “Plans” 页面更改组织的层级。

对于了解自身需求的高级用户，也可以在 “Memory and Scaling” 下拉菜单中选择 “Custom Configuration”，以指定精确的预配资源，以及所需的企业功能。

<Image img={advanced_resources} size="md" alt="高级资源选择器" border />

在您指定完需求后，托管 ClickStack 服务将需要数分钟时间进行预配。预配完成的状态会在后续的 “ClickStack” 页面中显示。在等待预配完成的同时，您可以随时探索 [ClickHouse Cloud 控制台](/cloud/overview) 的其他功能。

<Image img={service_provisioned} size="md" alt="服务已预配" border />

预配完成后，选择 “Start Ingestion”。
