import Image from '@theme/IdealImage';
import provider_selection from '@site/static/images/clickstack/getting-started/provider_selection.png';
import advanced_resources from '@site/static/images/clickstack/getting-started/advanced_resources.png';
import service_provisioned from '@site/static/images/clickstack/getting-started/service_provisioned.png';
import region_resources from '@site/static/images/clickstack/getting-started/region_resources.png';

:::note Scale vs Enterprise
我们建议大多数 ClickStack 工作负载使用此 [Scale 层级](/cloud/manage/cloud-tiers)。如果您需要高级安全功能（例如 SAML、CMEK 或满足 HIPAA 合规要求），请选择 Enterprise 层级。它还为超大规模 ClickStack 部署提供自定义硬件配置。在这些情况下，我们建议联系支持团队。
:::

选择 Cloud 提供商和区域。

<Image img={region_resources} size="md" alt="资源选择器" border />

在指定 CPU 和内存时，请根据预期的 ClickStack 摄取吞吐量进行估算。下表为这些资源的规格提供参考指导。

| 每月摄取量              | 推荐计算资源         |
| ------------------ | -------------- |
| &lt; 10 TB / month | 2 vCPU × 3 副本  |
| 10–50 TB / month   | 4 vCPU × 3 副本  |
| 50–100 TB / month  | 8 vCPU × 3 副本  |
| 100–500 TB / month | 30 vCPU × 3 副本 |
| 1 PB+ / month      | 59 vCPU × 3 副本 |

这些推荐值基于以下假设：

* 数据量指每月的**未压缩摄取量**，适用于日志和跟踪数据。
* 查询模式对可观测性场景来说是典型的，大多数查询针对**最新数据**，通常为最近 24 小时。
* 摄取在整个月内相对**均匀分布**。如果您预期存在突发流量或峰值，应预留额外余量。
* 存储通过 ClickHouse Cloud 对象存储单独处理，并不是保留期的限制因素。我们假设保留时间较长的数据访问频率较低。

对于经常查询更长时间范围、执行重度聚合，或需要支持大量并发用户的访问模式，可能需要更多计算资源。

虽然两个副本即可满足给定摄取吞吐量的 CPU 和内存要求，但我们建议在可能的情况下使用三个副本，以在实现相同总容量的同时提升服务冗余度。

:::note
这些数值仅为**估算值**，应作为初始基线使用。实际需求取决于查询复杂度、并发度、保留策略以及摄取吞吐量的波动情况。请始终监控资源使用情况，并根据需要进行扩缩容。
:::

指定完需求后，您的托管 ClickStack 服务将需要几分钟时间完成预配。在等待预配期间，您可以随时浏览 [ClickHouse Cloud 控制台](/cloud/overview) 的其他部分。

一旦**预配完成，左侧菜单中的 &#39;ClickStack&#39; 选项将被启用**。
