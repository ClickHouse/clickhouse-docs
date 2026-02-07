import Image from '@theme/IdealImage';
import clickstack_managed_ui from '@site/static/images/clickstack/getting-started/clickstack_managed_ui.png';
import create_vector_datasource from '@site/static/images/clickstack/create-vector-datasource.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

选择 &#39;Launch ClickStack&#39; 以访问 ClickStack UI（HyperDX）。系统会自动完成身份验证并进行重定向。

<Tabs groupId="click-stackui-data-sources">
  <TabItem value="open-telemetry" label="OpenTelemetry" default>
    系统会为所有 OpenTelemetry 数据预先创建数据源。

    <Image img={clickstack_managed_ui} size="lg" alt="ClickStack UI" />
  </TabItem>

  <TabItem value="vector" label="Vector" default>
    如果你使用的是 Vector，则需要手动创建数据源。首次登录时系统会提示你创建一个数据源。下面展示了一个日志数据源的示例配置。

    <Image img={create_vector_datasource} alt="创建数据源 - vector" size="lg" />

    此配置假设使用 Nginx 风格的 schema，并使用 `time_local` 列作为时间戳。在可能的情况下，这一列应为主键中声明的时间戳列。**该列是必需的**。

    我们同样建议更新 `Default SELECT`，以显式定义在日志视图中返回哪些列。如果还有其他可用字段，例如服务名称、日志级别或 body 列，也可以在此进行配置。如果用于显示的时间戳列与上述在表主键中使用的时间戳列不同，也可以在此进行覆盖配置。

    在上面的示例中，数据中并不存在 `Body` 列。相反，它是通过一个 SQL 表达式定义的，该表达式根据可用字段重构了一条 Nginx 日志行。

    有关其他可用选项，请参阅[配置参考](/use-cases/observability/clickstack/config)。

    创建完成后，你将被引导到搜索视图，在那里可以立即开始探索你的数据。

    <Image img={clickstack_managed_ui} size="lg" alt="ClickStack UI" />
  </TabItem>
</Tabs>

<br />

就是这样 —— 一切就绪。🎉

现在就开始探索 ClickStack 吧：开始搜索日志和跟踪（traces），查看日志、跟踪和指标如何在实时环境中进行关联，构建仪表盘、探索服务地图、发现事件变化和模式，并设置告警以提前发现问题。
