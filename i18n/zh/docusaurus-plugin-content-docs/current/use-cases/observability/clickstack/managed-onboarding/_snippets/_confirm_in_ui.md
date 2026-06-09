import Image from '@theme/IdealImage';
import clickstack_cloud from '@site/static/images/use-cases/observability/clickstack-cloud-first-time.png';
import clickstack_start_ingestion from '@site/static/images/use-cases/observability/clickstack-start-ingestion.png';
import clickstack_start_exploring from '@site/static/images/use-cases/observability/clickstack-start-exploring.png';
import clickstack_search from '@site/static/images/use-cases/observability/clickstack-search.png';

在 [ClickHouse Cloud 控制台](https://console.clickhouse.cloud) 中打开你的服务，然后从左侧菜单中选择 **ClickStack**，再选择 **开始摄取**。

<Image img={clickstack_cloud} size="lg" alt="启动 ClickStack" border />

下一步可以跳过，因为你已经配置好了采集器。点击 **启动 ClickStack** 继续。

ClickStack 会在新标签页中打开，你应该会被自动带到 **Getting Started** 页面。如果没有，请从左侧菜单中选择 **Getting Started**，然后点击 **开始摄取**，接着点击 **Next**。

<Image img={clickstack_start_ingestion} size="lg" alt="ClickStack 开始摄取" border />

ClickStack 应会自动检测你的表和遥测数据，让你可以继续。选择 **开始探索**，开始查看你的 trace 数据。

<Image img={clickstack_start_exploring} size="lg" alt="ClickStack 开始探索" border />

将数据源切换为 `Logs`，并将时间范围设置为 **最近 15 分钟**。来自 `otelgen` 的合成日志应会在几秒内出现。

<Image img={clickstack_search} size="lg" alt="显示日志的 ClickStack 搜索视图" />

如果没有显示任何内容：

* 确认传递给 `otelgen` 的认证请求头值与你的采集器预期的一致。
* 持续查看采集器的日志，并查找导出错误。
* 验证采集器上配置的 ClickHouse 端点同时包含协议和端口 (`https://...:8443`) 。