---
'slug': '/use-cases/observability/clickstack/getting-started/remote-demo-data'
'title': '远程演示数据集'
'sidebar_position': 2
'pagination_prev': null
'pagination_next': null
'description': '开始使用 ClickStack 和远程演示数据集'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import demo_connection from '@site/static/images/use-cases/observability/hyperdx-demo/demo_connection.png';
import edit_demo_connection from '@site/static/images/use-cases/observability/hyperdx-demo/edit_demo_connection.png';
import edit_demo_source from '@site/static/images/use-cases/observability/hyperdx-demo/edit_demo_source.png';
import step_2 from '@site/static/images/use-cases/observability/hyperdx-demo/step_2.png';
import step_3 from '@site/static/images/use-cases/observability/hyperdx-demo/step_3.png';
import step_4 from '@site/static/images/use-cases/observability/hyperdx-demo/step_4.png';
import step_5 from '@site/static/images/use-cases/observability/hyperdx-demo/step_5.png';
import step_6 from '@site/static/images/use-cases/observability/hyperdx-demo/step_6.png';
import step_7 from '@site/static/images/use-cases/observability/hyperdx-demo/step_7.png';
import step_8 from '@site/static/images/use-cases/observability/hyperdx-demo/step_8.png';
import step_9 from '@site/static/images/use-cases/observability/hyperdx-demo/step_9.png';
import step_10 from '@site/static/images/use-cases/observability/hyperdx-demo/step_10.png';
import step_11 from '@site/static/images/use-cases/observability/hyperdx-demo/step_11.png';
import step_12 from '@site/static/images/use-cases/observability/hyperdx-demo/step_12.png';
import step_13 from '@site/static/images/use-cases/observability/hyperdx-demo/step_13.png';
import step_14 from '@site/static/images/use-cases/observability/hyperdx-demo/step_14.png';
import step_15 from '@site/static/images/use-cases/observability/hyperdx-demo/step_15.png';
import step_16 from '@site/static/images/use-cases/observability/hyperdx-demo/step_16.png';
import step_17 from '@site/static/images/use-cases/observability/hyperdx-demo/step_17.png';
import step_18 from '@site/static/images/use-cases/observability/hyperdx-demo/step_18.png';
import step_19 from '@site/static/images/use-cases/observability/hyperdx-demo/step_19.png';
import step_20 from '@site/static/images/use-cases/observability/hyperdx-demo/step_20.png';
import step_21 from '@site/static/images/use-cases/observability/hyperdx-demo/step_21.png';
import step_22 from '@site/static/images/use-cases/observability/hyperdx-demo/step_22.png';
import step_23 from '@site/static/images/use-cases/observability/hyperdx-demo/step_23.png';
import step_24 from '@site/static/images/use-cases/observability/hyperdx-demo/step_24.png';
import demo_sources from '@site/static/images/use-cases/observability/hyperdx-demo//demo_sources.png';
import edit_connection from '@site/static/images/use-cases/observability/edit_connection.png';
import DemoArchitecture from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/example-datasets/_snippets/_demo.md';

**以下指南假定您已使用[一体化镜像说明](/use-cases/observability/clickstack/getting-started)或[仅本地模式](/use-cases/observability/clickstack/deployment/local-mode-only)部署了ClickStack，并完成了初始用户创建。或者，用户可以跳过所有本地设置，直接连接到我们托管的ClickStack演示[play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)，该演示使用此数据集。**

本指南使用在公共ClickHouse游乐场上托管的示例数据集，可以从您的本地ClickStack部署连接到该数据集：[sql.clickhouse.com](https://sql.clickhouse.com)。

:::warning 在ClickHouse Cloud中不支持HyperDX
当HyperDX托管在ClickHouse Cloud时，不支持远程数据库。因此，此数据集不受支持。
:::

该数据集包含大约40小时的数据，这些数据是从ClickHouse版本的官方OpenTelemetry (OTel)演示中捕获的。数据在晚上重播，时间戳调整为当前时间范围，允许用户使用HyperDX集成的日志、跟踪和指标来探索系统行为。

:::note 数据变化
由于数据集每天从午夜开始重播，确切的可视化可能会根据您何时探索演示而有所不同。
:::

## 演示场景 {#demo-scenario}

在此演示中，我们调查一个涉及销售望远镜及相关配件的电子商务网站的事件。

客户支持团队报告用户在结账时遇到完成付款的问题。该问题已升级至网站可靠性工程（SRE）团队进行调查。

使用HyperDX，SRE团队将分析日志、跟踪和指标以诊断和解决问题，然后审查会话数据以确认他们的结论是否与实际用户行为一致。

## Open Telemetry演示 {#otel-demo}

此演示使用[ClickStack维护的官方OpenTelemetry演示的分支](https://github.com/ClickHouse/opentelemetry-demo)。

<DemoArchitecture/>

## 演示步骤 {#demo-steps}

**我们已使用[ClickStack SDKs](/use-cases/observability/clickstack/sdks)为本演示进行了仪器化，服务已在Kubernetes中部署，并收集了指标和日志。**

<VerticalStepper headerLevel="h3">

### 连接到演示服务器 {#connect-to-the-demo-server}

:::note 仅本地模式
如果您在本地模式下部署时单击了`连接到演示服务器`，则可以跳过此步骤。如果使用此模式，数据源将以`Demo_`为前缀，例如`Demo_Logs`。
:::

导航到`团队设置`，并单击`编辑`以修改`本地连接`：

<Image img={edit_connection} alt="编辑连接" size="lg"/>

将连接重命名为`Demo`，并填写后续表单，使用以下演示服务器的连接详细信息：

- `连接名称`：`Demo`
- `主机`：`https://sql-clickhouse.clickhouse.com`
- `用户名`：`otel_demo`
- `密码`：保留为空

<Image img={edit_demo_connection} alt="编辑演示连接" size="lg"/>

### 修改数据源 {#modify-sources}

:::note 仅本地模式
如果您在本地模式下部署时单击了`连接到演示服务器`，则可以跳过此步骤。如果使用此模式，数据源将以`Demo_`为前缀，例如`Demo_Logs`。
:::

向上滚动到`数据源`，并修改每个数据源——`日志`、`跟踪`、`指标`和`会话`——以使用`otel_v2`数据库。

<Image img={edit_demo_source} alt="编辑演示数据源" size="lg"/>

:::note
您可能需要重新加载页面以确保每个数据源中列出了完整的数据库列表。
:::

### 调整时间范围 {#adjust-the-timeframe}

使用右上角的时间选择器，将时间调整为显示过去`1天`的所有数据。

<Image img={step_2} alt="步骤 2" size="lg"/>

您可能会注意到概述条形图中错误数量的微小差异，在几个连续的条形图中红色有所增加。

:::note
条形图的位置将根据您查询数据集的时间而有所不同。
:::

### 筛选错误 {#filter-to-errors}

为了突出错误的发生，使用`SeverityText`过滤器并选择`error`，仅显示错误级别的条目。

错误应更加明显：

<Image img={step_3} alt="步骤 3" size="lg"/>

### 识别错误模式 {#identify-error-patterns}

通过HyperDX的聚类功能，您可以自动识别错误并将其分组为有意义的模式。这加速了在处理大量日志和跟踪时的用户分析。要使用此功能，请从左侧面板的`分析模式`菜单中选择`事件模式`。

错误聚类显示与支付失败相关的问题，包括命名模式`无法下订单`。其他聚类还表明存在收费和缓存满的问题。

<Image img={step_4} alt="步骤 4" size="lg"/>

请注意，这些错误聚类可能来自不同服务。

### 探索错误模式 {#explore-error-pattern}

单击与我们报告的用户无法完成付款问题相关的最明显错误聚类：`无法下订单`。

这将显示与`frontend`服务相关的此错误的所有发生列表：

<Image img={step_5} alt="步骤 5" size="lg"/>

选择任何结果错误。日志元数据将详细显示。浏览`概述`和`列值`部分表明，由于缓存问题导致收费卡的问题：

`失败充卡：无法充卡：rpc错误：代码=未知描述=Visa缓存已满：无法添加新项目。`

<Image img={step_6} alt="步骤 6" size="lg"/>

### 探索基础架构 {#explore-the-infrastructure}

我们已确定一个与缓存相关的错误可能导致支付失败。我们仍需确定此问题在我们的微服务架构中来自何处。

考虑到缓存问题，调查基础架构是有意义的——关联的pod中是否可能存在内存问题？在ClickStack中，日志和指标是统一的并且以上下文方式显示，使得快速发现根本原因变得更加容易。

选择`基础架构`标签以查看与`frontend`服务相关的基础架构pod的指标，并将时间范围扩大到`1d`：

<Image img={step_7} alt="步骤 7" size="lg"/>

该问题似乎与基础架构无关 - 在错误发生的时间段内，没有指标显著变化：之前或之后。关闭基础架构标签。

### 探索跟踪 {#explore-a-trace}

在ClickStack中，跟踪也会自动与日志和指标相关联。让我们探索与我们的选择日志相关的跟踪，以识别负责的服务。

选择`跟踪`以可视化相关的跟踪。向下滚动浏览后续视图，我们可以看到HyperDX如何能够在微服务中可视化分布式跟踪，连接每个服务中的跨度。一个支付显然涉及多个微服务，包括处理结账和货币转换的服务。

<Image img={step_8} alt="步骤 8" size="lg"/>

向下滚动该视图的底部，我们可以看到`payment`服务导致了错误，导致错误回溯。

<Image img={step_9} alt="步骤 9" size="lg"/>

### 搜索跟踪 {#searching-traces}

我们已确定用户因支付服务中的缓存问题无法完成购买。让我们更详细地探索此服务的跟踪，以了解根本原因。

通过选择`搜索`切换到主要搜索视图。切换`Traces`的数据源，并选择`结果表`视图。**确保时间段仍然覆盖过去一天。**

<Image img={step_10} alt="步骤 10" size="lg"/>

该视图显示过去一天的所有跟踪。我们知道问题来源于我们的支付服务，因此将`支付`过滤器应用于`ServiceName`。

<Image img={step_11} alt="步骤 11" size="lg"/>

如果我们通过选择`事件模式`将事件聚类应用于跟踪，我们可以立即看到与`支付`服务相关的缓存问题。

<Image img={step_12} alt="步骤 12" size="lg"/>

### 探索跟踪的基础架构 {#explore-infrastructure-for-a-trace}

通过单击`结果表`切换到结果视图。使用`StatusCode`过滤器和`错误`值筛选错误。

<Image img={step_13} alt="步骤 13" size="lg"/>

选择一个`错误：Visa缓存已满：无法添加新项目。`错误，切换到`基础架构`标签并将时间段扩大到`1d`。

<Image img={step_14} alt="步骤 14" size="lg"/>

通过将跟踪与指标关联，我们可以看到`payment`服务的内存和CPU在崩溃之前增加到`0`（我们可以将此归因于pod重启）—暗示缓存问题导致资源问题。我们可以预期这影响了支付完成的时间。

### 事件增量以加快解决 {#event-deltas-for-faster-resolution}

事件增量通过将性能或错误率的变化归因于特定的数据子集来帮助发现异常——使得更容易快速找到根本原因。

虽然我们知道`payment`服务存在缓存问题，导致资源消耗增加，但尚未完全识别根本原因。

返回到结果表视图，选择包含错误的时间段以限制数据。确保您选择错误左侧和错误之后的几个小时（该问题可能仍在发生）：

<Image img={step_15} alt="步骤 15" size="lg"/>

移除错误过滤器，然后从左侧的`分析模式`菜单中选择`事件增量`。

<Image img={step_16} alt="步骤 16" size="lg"/>

顶部面板显示时间分布，颜色表示事件密度（跨度数量）。主要集中之外的事件子集通常是值得调查的。

如果我们选择持续时间大于`200ms`的事件，并应用过滤器`按选择过滤`，我们可以将分析限制为较慢的事件：

<Image img={step_17} alt="步骤 17" size="lg"/>

通过对数据子集进行分析，我们可以看到大多数性能尖峰与`visa`交易相关。

### 使用图表以获得更多上下文 {#using-charts-for-more-context}

在ClickStack中，我们可以从日志、跟踪或指标中绘制任何数值以获得更多上下文。

我们已确定：

- 我们的问题出在支付服务上
- 一个缓存已满
- 这导致资源消耗增加
- 该问题阻止了Visa支付完成——或者至少导致其完成时间过长。

<br/>

从左侧菜单中选择`图表浏览器`。完成以下值以按图表类型绘制支付完成所需时间：

- `数据源`：`Traces`
- `指标`：`最大值`
- `SQL列`：`持续时间`
- `条件`：`ServiceName: payment`
- `时间跨度`：`过去1天`

<br/>

单击`▶️`将显示支付性能随时间的下降情况。

<Image img={step_18} alt="步骤 18" size="lg"/>

如果我们将`按`设置为`SpanAttributes['app.payment.card_type']`（只需键入`card`以自动完成），我们可以看到Visa交易相对于万事达卡交易的服务性能如何下降：

<Image img={step_19} alt="步骤 19" size="lg"/>

请注意，一旦出现错误，响应返回时间为`0s`。

### 探索指标以获得更多上下文 {#exploring-metrics-for-more-context}

最后，让我们将缓存大小绘制为指标，以查看其随时间的变化，从而为我们提供更多上下文。

完成以下值：

- `数据源`：`Metrics`
- `指标`：`最大值`
- `SQL列`：`visa_validation_cache.size (gauge)`（只需键入`cache`以自动完成）
- `条件`：`ServiceName: payment`
- `按`：`<empty>`

我们可以看到缓存大小在4-5小时内增加（可能是在软件部署之后），然后达到最大大小`100,000`。从`匹配事件示例`中可以看到，我们的错误与缓存达到此限制相关，其中记录为`0`的大小，同时响应也返回为`0s`。

<Image img={step_20} alt="步骤 20" size="lg"/>

总结，通过探索日志、跟踪的最后指标，我们得出以下结论：

- 我们的问题出在支付服务上
- 服务行为的变化，可能是由于部署，导致Visa缓存在4-5小时内逐渐增加，达到最大大小`100,000`。
- 这导致随着缓存大小的增长资源消耗增加——可能是由于一个糟糕的实现
- 随着缓存的增长，Visa支付的性能下降
- 当达到最大大小时，缓存拒绝支付并报告其大小为`0`。

### 使用会话 {#using-sessions}

会话允许我们重放用户体验，从用户的角度提供有关错误发生方式的可视化说明。虽然通常不用于诊断根本原因，但它们对确认客户支持报告的问题非常有价值，并可作为更深入调查的起点。

在HyperDX中，会话与跟踪和日志相关联，提供对根本原因的完整视图。

例如，如果支持团队提供了遇到付款问题的用户的电子邮件`Braulio.Roberts23@hotmail.com`——从他们的会话开始通常比直接搜索日志或跟踪更有效。

从左侧菜单导航到`客户会话`标签，确保数据源设置为`会话`，时间段设置为`过去1天`：

<Image img={step_21} alt="步骤 21" size="lg"/>

搜索`SpanAttributes.userEmail: Braulio`以找到我们客户的会话。选择该会话将显示左侧客户会话的浏览器事件和相关跨度，同时右侧重新渲染用户的浏览器体验：

<Image img={step_22} alt="步骤 22" size="lg"/>

### 重放会话 {#replaying-sessions}

通过按 ▶️ 按钮重放会话。切换`高亮`和`所有事件`之间可以实现不同程度的跨度粒度，前者突出显示关键事件和错误。

如果我们向下滚动到跨度的底部，我们可以看到与`/api/checkout`相关的`500`错误。选择该特定跨度的▶️按钮将回放移动到会话中的这一点，让我们确认客户的体验——付款似乎无法成功，并且没有错误显示。

<Image img={step_23} alt="步骤 23" size="lg"/>

通过选择该跨度我们可以确认这是由内部错误引起的。通过单击`跟踪`标签并滚动连接的跨度，我们能够确认客户确实是我们的缓存问题的受害者。

<Image img={step_24} alt="步骤 24" size="lg"/>

</VerticalStepper>

本演示展示了一个真实世界事件，涉及电子商务应用中支付失败的问题，展示了ClickStack如何通过统一的日志、跟踪、指标和会话重放帮助发现根本原因——探索我们的[其他入门指南](/use-cases/observability/clickstack/sample-datasets)，深入了解特定功能。
