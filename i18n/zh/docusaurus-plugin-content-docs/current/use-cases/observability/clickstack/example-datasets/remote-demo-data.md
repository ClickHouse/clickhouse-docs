---
slug: /use-cases/observability/clickstack/getting-started/remote-demo-data
title: '远程演示数据集'
sidebar_position: 2
pagination_prev: null
pagination_next: null
description: '开始使用 ClickStack 和远程演示数据集'
doc_type: 'guide'
keywords: ['clickstack', 'example data', 'sample dataset', 'logs', 'observability']
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
import DemoArchitecture from '@site/docs/use-cases/observability/clickstack/example-datasets/_snippets/_demo.md';

**以下指南假设你已经按照[一体化镜像的部署说明](/use-cases/observability/clickstack/getting-started)或[仅本地模式](/use-cases/observability/clickstack/deployment/local-mode-only)部署了 ClickStack，并完成了初始用户创建。或者，你也可以跳过所有本地环境搭建，直接连接到我们托管的 ClickStack 演示环境 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)，该环境正是使用本数据集。**

本指南使用的是托管在公共 ClickHouse playground [sql.clickhouse.com](https://sql.clickhpouse.com) 上的示例数据集，你可以从本地部署的 ClickStack 连接到该数据集。

:::warning Not supported with HyperDX in ClickHouse Cloud
当 HyperDX 托管在 ClickHouse Cloud 中时，不支持远程数据库。因此，本数据集也不受支持。
:::


它包含从官方 OpenTelemetry（OTel）演示的 ClickHouse 版本中采集的大约 40 小时的数据。数据会在每晚重放，并将时间戳调整到当前时间窗口，使用户可以使用 HyperDX 集成的日志、追踪和指标来探索系统行为。

:::note 数据差异
由于数据集会在每天的午夜开始重放，具体的可视化结果可能会因你浏览演示的时间不同而有所差异。
:::



## 演示场景 {#demo-scenario}

在本演示中,我们将调查一起涉及销售望远镜及相关配件的电商网站故障事件。

客户支持团队报告称,用户在结账时无法完成支付。该问题已上报至站点可靠性工程(SRE)团队进行调查。

SRE 团队将使用 HyperDX 分析日志、追踪和指标来诊断并解决该问题——然后审查会话数据以确认其结论是否与实际用户行为一致。


## OpenTelemetry 演示 {#otel-demo}

此演示使用了官方 OpenTelemetry 演示的 [ClickStack 维护分支](https://github.com/ClickHouse/opentelemetry-demo)。

<DemoArchitecture />


## 演示步骤 {#demo-steps}

**我们使用 [ClickStack SDK](/use-cases/observability/clickstack/sdks) 对此演示进行了插桩,在 Kubernetes 中部署服务,并从中收集了指标和日志。**

<VerticalStepper headerLevel="h3">

### 连接到演示服务器 {#connect-to-the-demo-server}

:::note 仅本地模式
如果您在本地模式部署时点击了 `Connect to Demo Server`,则可以跳过此步骤。如果使用此模式,数据源将以 `Demo_` 为前缀,例如 `Demo_Logs`
:::

导航到 `Team Settings` 并点击 `Local Connection` 的 `Edit`:

<Image img={edit_connection} alt='Edit Connection' size='lg' />

将连接重命名为 `Demo` 并使用以下演示服务器的连接详细信息填写后续表单:

- `Connection Name`: `Demo`
- `Host`: `https://sql-clickhouse.clickhouse.com`
- `Username`: `otel_demo`
- `Password`: 留空

<Image img={edit_demo_connection} alt='Edit Demo Connection' size='lg' />

### 修改数据源 {#modify-sources}

:::note 仅本地模式
如果您在本地模式部署时点击了 `Connect to Demo Server`,则可以跳过此步骤。如果使用此模式,数据源将以 `Demo_` 为前缀,例如 `Demo_Logs`
:::

向上滚动到 `Sources` 并修改每个数据源 - `Logs`、`Traces`、`Metrics` 和 `Sessions` - 以使用 `otel_v2` 数据库。

<Image img={edit_demo_source} alt='Edit Demo Source' size='lg' />

:::note
您可能需要重新加载页面以确保每个数据源中列出完整的数据库列表。
:::

### 调整时间范围 {#adjust-the-timeframe}

使用右上角的时间选择器调整时间以显示过去 `1 day` 的所有数据。

<Image img={step_2} alt='Step 2' size='lg' />

您可能会在概览条形图中看到错误数量的细微差异,在几个连续的条形中红色略有增加。

:::note
条形的位置会根据您查询数据集的时间而有所不同。
:::

### 筛选错误 {#filter-to-errors}

要突出显示错误的出现,请使用 `SeverityText` 筛选器并选择 `error` 以仅显示错误级别的条目。

错误应该更加明显:

<Image img={step_3} alt='Step 3' size='lg' />

### 识别错误模式 {#identify-error-patterns}

使用 HyperDX 的聚类功能,您可以自动识别错误并将其分组为有意义的模式。这在处理大量日志和追踪时可以加速用户分析。要使用它,请从左侧面板的 `Analysis Mode` 菜单中选择 `Event Patterns`。

错误集群揭示了与支付失败相关的问题,包括一个名为 `Failed to place order` 的模式。其他集群还表明存在信用卡扣费问题和缓存已满的问题。

<Image img={step_4} alt='Step 4' size='lg' />

请注意,这些错误集群可能来自不同的服务。

### 探索错误模式 {#explore-error-pattern}

点击与我们报告的用户无法完成支付问题相关的最明显的错误集群:`Failed to place order`。

这将显示与 `frontend` 服务关联的此错误的所有出现列表:

<Image img={step_5} alt='Step 5' size='lg' />

选择任何一个结果错误。日志元数据将详细显示。滚动浏览 `Overview` 和 `Column Values` 表明由于缓存导致的信用卡扣费问题:

`failed to charge card: could not charge the card: rpc error: code = Unknown desc = Visa cache full: cannot add new item.`

<Image img={step_6} alt='Step 6' size='lg' />

### 探索基础设施 {#explore-the-infrastructure}

我们已经识别出一个可能导致支付失败的缓存相关错误。我们仍然需要确定此问题在我们的微服务架构中的来源。

鉴于缓存问题,调查底层基础设施是合理的 - 相关 Pod 中可能存在内存问题?在 ClickStack 中,日志和指标是统一的并在上下文中显示,这使得更容易快速发现根本原因。

选择 `Infrastructure` 选项卡以查看与 `frontend` 服务的底层 Pod 关联的指标,并将时间跨度扩大到 `1d`:

<Image img={step_7} alt='Step 7' size='lg' />


该问题似乎与基础设施无关——在错误发生前后的时间段内，没有任何指标发生明显变化。关闭基础设施选项卡。

### 探索追踪 {#explore-a-trace}

在 ClickStack 中，追踪会自动与日志和指标关联。让我们探索与所选日志关联的追踪,以识别负责的服务。

选择 `Trace` 以可视化关联的追踪。向下滚动后续视图,我们可以看到 HyperDX 如何可视化跨微服务的分布式追踪,连接每个服务中的 span。一次支付显然涉及多个微服务,包括执行结账和货币转换的服务。

<Image img={step_8} alt='步骤 8' size='lg' />

通过滚动到视图底部,我们可以看到 `payment` 服务导致了错误,该错误随后沿调用链向上传播。

<Image img={step_9} alt='步骤 9' size='lg' />

### 搜索追踪 {#searching-traces}

我们已经确定用户由于支付服务中的缓存问题而无法完成购买。让我们更详细地探索该服务的追踪,看看是否能进一步了解根本原因。

通过选择 `Search` 切换到主搜索视图。将数据源切换为 `Traces` 并选择 `Results table` 视图。**确保时间跨度仍为最近一天。**

<Image img={step_10} alt='步骤 10' size='lg' />

此视图显示最近一天的所有追踪。我们知道问题源于支付服务,因此将 `payment` 过滤器应用于 `ServiceName`。

<Image img={step_11} alt='步骤 11' size='lg' />

如果我们通过选择 `Event Patterns` 对追踪应用事件聚类,就可以立即看到 `payment` 服务的缓存问题。

<Image img={step_12} alt='步骤 12' size='lg' />

### 探索追踪的基础设施 {#explore-infrastructure-for-a-trace}

通过点击 `Results table` 切换到结果视图。使用 `StatusCode` 过滤器和 `Error` 值过滤错误。

<Image img={step_13} alt='步骤 13' size='lg' />

选择一个 `Error: Visa cache full: cannot add new item.` 错误,切换到 `Infrastructure` 选项卡并将时间跨度扩大到 `1d`。

<Image img={step_14} alt='步骤 14' size='lg' />

通过将追踪与指标关联,我们可以看到 `payment` 服务的内存和 CPU 使用量增加,然后降至 `0`(我们可以将此归因于 pod 重启)——这表明缓存问题导致了资源问题。我们可以预期这影响了支付完成时间。

### 使用事件增量加快问题解决 {#event-deltas-for-faster-resolution}

事件增量通过将性能或错误率的变化归因于特定数据子集来帮助发现异常,从而更容易快速定位根本原因。

虽然我们知道 `payment` 服务存在缓存问题,导致资源消耗增加,但我们尚未完全确定根本原因。

返回结果表视图并选择包含错误的时间段以限制数据。确保在错误左侧选择几个小时,如果可能的话也选择错误之后的时间(问题可能仍在发生):

<Image img={step_15} alt='步骤 15' size='lg' />

移除错误过滤器,并从左侧 `Analysis Mode` 菜单中选择 `Event Deltas`。

<Image img={step_16} alt='步骤 16' size='lg' />

顶部面板显示时间分布,颜色表示事件密度(span 数量)。主要集中区域之外的事件子集通常值得调查。

如果我们选择持续时间大于 `200ms` 的事件,并应用 `Filter by selection` 过滤器,就可以将分析限制在较慢的事件上:

<Image img={step_17} alt='步骤 17' size='lg' />

通过对数据子集进行分析,我们可以看到大多数性能峰值与 `visa` 交易相关。

### 使用图表获取更多上下文信息 {#using-charts-for-more-context}

在 ClickStack 中,我们可以绘制来自日志、追踪或指标的任何数值,以获取更多上下文信息。

我们已经确定:

- 问题出在支付服务上
- 缓存已满
- 这导致资源消耗增加
- 该问题阻止了 visa 支付完成——或者至少导致它们需要很长时间才能完成。

<br />

从左侧菜单中选择 `Chart Explorer`。填写以下值以按图表类型绘制支付完成所需时间:


- `Data Source`(数据源):`Traces`
- `Metric`(指标):`Maximum`
- `SQL Column`(SQL 列):`Duration`
- `Where`(条件):`ServiceName: payment`
- `Timespan`(时间跨度):`Last 1 day`

<br />

点击 `▶️` 将显示支付性能随时间推移的下降情况。

<Image img={step_18} alt='Step 18' size='lg' />

如果我们将 `Group By` 设置为 `SpanAttributes['app.payment.card_type']`(只需输入 `card` 即可自动完成),我们可以看到相对于 Mastercard,Visa 交易的服务性能是如何下降的:

<Image img={step_19} alt='Step 19' size='lg' />

请注意,一旦发生错误,响应会在 `0s` 内返回。

### 探索指标以获取更多上下文 {#exploring-metrics-for-more-context}

最后,让我们将缓存大小作为指标绘制出来,以查看它随时间的变化情况,从而为我们提供更多上下文信息。

填写以下值:

- `Data Source`(数据源):`Metrics`
- `Metric`(指标):`Maximum`
- `SQL Column`(SQL 列):`visa_validation_cache.size (gauge)`(只需输入 `cache` 即可自动完成)
- `Where`(条件):`ServiceName: payment`
- `Group By`(分组依据):`<empty>`

我们可以看到缓存大小在 4-5 小时内持续增长(可能是在软件部署之后),最终达到最大值 `100,000`。从 `Sample Matched Events` 中我们可以看到,错误与缓存达到此限制相关,之后缓存被记录为大小 `0`,响应也在 `0s` 内返回。

<Image img={step_20} alt='Step 20' size='lg' />

总之,通过探索日志、追踪和指标,我们得出以下结论:

- 问题出在支付服务上
- 服务行为的变化(可能是由于部署)导致 Visa 缓存在 4-5 小时内缓慢增长 - 达到最大值 `100,000`
- 随着缓存大小的增长,资源消耗增加 - 可能是由于实现不当
- 随着缓存的增长,Visa 支付的性能下降
- 在达到最大值时,缓存拒绝支付并将自身报告为大小 `0`

### 使用会话 {#using-sessions}

会话允许我们重放用户体验,从用户的角度提供错误发生过程的可视化记录。虽然通常不用于诊断根本原因,但它们对于确认向客户支持报告的问题很有价值,并且可以作为深入调查的起点。

在 HyperDX 中,会话与追踪和日志相关联,提供了对根本原因的完整视图。

例如,如果支持团队提供了遇到支付问题的用户的电子邮件 `Braulio.Roberts23@hotmail.com` - 从他们的会话开始通常比直接搜索日志或追踪更有效。

从左侧菜单导航到 `Client Sessions` 选项卡,然后确保数据源设置为 `Sessions`,时间段设置为 `Last 1 day`:

<Image img={step_21} alt='Step 21' size='lg' />

搜索 `SpanAttributes.userEmail: Braulio` 以查找我们客户的会话。选择会话后,左侧将显示客户会话的浏览器事件和相关 span,右侧将重新渲染用户的浏览器体验:

<Image img={step_22} alt='Step 22' size='lg' />

### 重放会话 {#replaying-sessions}

可以通过按 ▶️ 按钮来重放会话。在 `Highlighted` 和 `All Events` 之间切换可以实现不同程度的 span 粒度,前者会突出显示关键事件和错误。

如果我们滚动到 span 的底部,可以看到与 `/api/checkout` 相关的 `500` 错误。选择此特定 span 的 ▶️ 按钮会将重放移动到会话中的这一点,使我们能够确认客户的体验 - 支付似乎根本无法工作,且没有渲染任何错误信息。

<Image img={step_23} alt='Step 23' size='lg' />

选择该 span,我们可以确认这是由内部错误引起的。通过点击 `Trace` 选项卡并滚动浏览连接的 span,我们能够确认客户确实是我们缓存问题的受害者。

<Image img={step_24} alt='Step 24' size='lg' />

</VerticalStepper>

此演示演练了一个涉及电子商务应用程序中支付失败的真实事件,展示了 ClickStack 如何通过统一的日志、追踪、指标和会话重放来帮助发现根本原因 - 探索我们的[其他入门指南](/use-cases/observability/clickstack/sample-datasets)以深入了解特定功能。
