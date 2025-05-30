---
'slug': '/use-cases/observability/clickstack/getting-started/remote-demo-data'
'title': '远程演示数据集'
'sidebar_position': 2
'pagination_prev': null
'pagination_next': null
'description': '开始使用 ClickStack 和远程演示数据集'
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
import architecture from '@site/static/images/use-cases/observability/hyperdx-demo/architecture.png';
import demo_sources from '@site/static/images/use-cases/observability/hyperdx-demo//demo_sources.png';
import edit_connection from '@site/static/images/use-cases/observability/edit_connection.png';

**以下指南假设您已使用 [一体化镜像的说明](/use-cases/observability/clickstack/getting-started) 或 [仅本地模式](/use-cases/observability/clickstack/deployment/local-mode-only) 部署了 ClickStack，并完成了初始用户创建。**

本入门指南使用一个可在演示服务器上访问的数据集，该数据集在用户首次部署 HyperDX 时可以使用。该数据集托管在公共 ClickHouse 实例上，网址为 [sql.clickhouse.com](https://sql.clickhouse.com)。

它包含从 ClickHouse 版本的官方 OpenTelemetry（OTel）演示中捕获的大约 40 小时的数据。数据每晚重放，时间戳调整为当前时间窗口，允许用户利用 HyperDX 的集成日志、跟踪和指标来探索系统行为。

:::note 数据变体
由于数据集从每天午夜重放，因此确切的可视化效果可能会因您探索演示的时间而异。
:::

## 演示场景 {#demo-scenario}

在本次演示中，我们调查一个涉及销售望远镜及相关配件的电子商务网站的事件。

客户支持团队报告称，用户在结帐时遇到支付完成问题。该问题已上报给网站可靠性工程（SRE）团队进行调查。

SRE 团队将使用 HyperDX 分析日志、跟踪和指标来诊断和解决问题，然后审查会话数据，以确认他们的结论是否与实际用户行为一致。

## 演示架构 {#demo-architecture}

此演示重用官方 OpenTelemetry 演示。它由用不同编程语言编写的微服务组成，这些微服务通过 gRPC 和 HTTP 相互通信，还有一个使用 Locust 生成虚拟用户流量的负载生成器。

<Image img={architecture} alt="架构" size="lg"/>

_版权: https://opentelemetry.io/docs/demo/architecture/_

有关演示的更多细节，请参阅 [官方 OpenTelemetry 文档](https://opentelemetry.io/docs/demo/)。 

## 演示步骤 {#demo-steps}

**我们已经使用 [ClickStack SDKs](/use-cases/observability/clickstack/sdks) 对此次演示进行了注入，在 Kubernetes 中部署了服务，并收集了指标和日志。**

<VerticalStepper headerLevel="h3">

### 连接到演示服务器 {#connect-to-the-demo-server}

:::note 仅本地模式
如果您在本地模式中部署时点击了 `连接到演示服务器`，可以跳过此步骤。如果使用此模式，数据源将以 `Demo_` 为前缀，例如 `Demo_Logs`
:::

导航到 `团队设置` 并点击 `编辑` 以修改 `本地连接`：

<Image img={edit_connection} alt="编辑连接" size="lg"/>

将连接名称更改为 `Demo`，并按照以下演示服务器的连接详细信息填写后续表单：

- `连接名称`: `Demo`
- `主机`: `https://sql-clickhouse.clickhouse.com`
- `用户名`: `otel_demo`
- `密码`: 保持为空

<Image img={edit_demo_connection} alt="编辑演示连接" size="lg"/>

### 修改数据源 {#modify-sources}

:::note 仅本地模式
如果您在本地模式中部署时点击了 `连接到演示服务器`，可以跳过此步骤。如果使用此模式，数据源将以 `Demo_` 为前缀，例如 `Demo_Logs`
:::

向上滚动到 `数据源`，并修改每个数据源 `日志`、`跟踪`、`指标` 和 `会话`，使其使用 `otel_v2` 数据库。 

<Image img={edit_demo_source} alt="编辑演示数据源" size="lg"/>

:::note
您可能需要重新加载页面，以确保每个数据源中列出所有数据库。
:::

### 调整时间范围 {#adjust-the-timeframe}

使用右上角的时间选择器，将时间调整为显示过去 `1天` 的所有数据。

<Image img={step_2} alt="步骤 2" size="lg"/>

您可能会在概述条形图中观察到错误数量的微小差异，多根连续条形中的红色部分有所增加。

:::note
条形图的位置可能因您查询数据集的时间而有所不同。
:::

### 过滤错误 {#filter-to-errors}

为了突出错误的发生，请使用 `SeverityText` 过滤器并选择 `错误`，以仅显示错误级别的条目。

错误应该更加明显：

<Image img={step_3} alt="步骤 3" size="lg"/>

### 识别错误模式 {#identify-error-patterns}

借助 HyperDX 的聚类功能，您可以自动识别错误并将其分组为有意义的模式。这在处理大量日志和跟踪时加速了用户分析。要使用此功能，请从左侧面板的 `分析模式` 菜单中选择 `事件模式`。

错误集群揭示了与支付失败相关的问题，包括一个名为 `未能下订单` 的模式。附加集群还表明存在信用卡收费和缓存已满的问题。

<Image img={step_4} alt="步骤 4" size="lg"/>

请注意，这些错误集群可能源自不同的服务。

### 探索错误模式 {#explore-error-pattern}

点击最明显的错误集群，它与我们报告的用户能够完成支付的问题相关：`未能下订单`。

这将显示与 `前端` 服务关联的此错误的所有发生实例的列表：

<Image img={step_5} alt="步骤 5" size="lg"/>

选择任何一个结果错误。日志元数据将详细显示。向下滚动 `概览` 和 `列值`，表明由于缓存问题导致的信用卡收费失败：

`未能收费：无法收费信用卡：rpc 错误：代码 = Unknown 描述 = Visa 缓存已满：无法添加新项目。`

<Image img={step_6} alt="步骤 6" size="lg"/>

### 探索基础设施 {#explore-the-infrastructure}

我们已识别出与缓存相关的错误，这可能导致支付失败。我们仍需要确定此问题在我们的微服务架构中来源于哪里。

鉴于缓存问题，调查基础设施是合乎逻辑的 - 可能我们在相关 Pods 中存在内存问题？在 ClickStack 中，日志和指标是统一的，并在上下文中显示，使快速查找根本原因变得更加容易。

选择 `基础设施` 标签以查看与 `前端` 服务的底层 Pods 相关的指标，并扩大时间范围至 `1天`：

<Image img={step_7} alt="步骤 7" size="lg"/>

问题似乎与基础设施无关 - 在该时间段内没有指标显著变化：无论是在错误发生之前还是之后。关闭基础设施标签。

### 探索跟踪 {#explore-a-trace}

在 ClickStack 中，跟踪也会自动与日志和指标相关联。让我们探索与我们选择的日志相关的跟踪，以识别责任服务。

选择 `跟踪` 以可视化相关跟踪。向下滚动，通过后续视图，我们可以看到 HyperDX 如何能够在微服务之间可视化分布式跟踪，连接每个服务中的跨度。一次支付明显涉及多个微服务，包括执行结账和货币转换的服务。

<Image img={step_8} alt="步骤 8" size="lg"/>

向下滚动到视图底部，我们可以看到 `支付` 服务导致了错误，这反过来又向上传播至调用链。

<Image img={step_9} alt="步骤 9" size="lg"/>

### 搜索跟踪 {#searching-traces} 

我们已经确定用户由于支付服务中的缓存问题未能完成购买。让我们更详细地探索此服务的跟踪，以查看是否可以了解更多关于根本原因的信息。

通过选择 `搜索` 切换到主搜索视图。为 `跟踪` 切换数据源，选择 `结果表` 视图。**确保时间跨度仍然在过去一天内。**

<Image img={step_10} alt="步骤 10" size="lg"/>

该视图显示了过去一天内的所有跟踪。我们知道问题起源于支付服务，因此将 `ServiceName` 过滤器应用于 `支付`。

<Image img={step_11} alt="步骤 11" size="lg"/>

如果我们选择 `事件模式` 对跟踪应用事件聚类，我们可以立刻看到支付服务中的缓存问题。

<Image img={step_12} alt="步骤 12" size="lg"/>

### 为跟踪探索基础设施 {#explore-infrastructure-for-a-trace}

通过单击 `结果表` 切换到结果视图。使用 `StatusCode` 过滤器和 `错误` 值进行错误过滤。

<Image img={step_13} alt="步骤 13" size="lg"/>

选择 `错误：Visa 缓存已满：无法添加新项目。` 错误，切换到 `基础设施` 标签并将时间跨度扩大至 `1天`。

<Image img={step_14} alt="步骤 14" size="lg"/>

通过将跟踪与指标关联，我们可以看到内存和 CPU 随着 `支付` 服务的增加而上升，然后下降到 `0`（我们可以将其归因于 Pod 重启） - 这表明缓存问题引发了资源问题。我们可以预期这影响了支付完成时间。

### 事件增量以加快解决时间 {#event-deltas-for-faster-resolution} 

事件增量通过将性能或错误率的变化归因于特定数据子集，帮助揭示异常 - 使快速定位根本原因变得更容易。

虽然我们知道 `支付` 服务存在缓存问题，导致资源消耗增加，但我们尚未完全确定根本原因。

返回结果表视图，选择包含错误的时间段以限制数据。确保您选择错误之前和之后的若干小时（问题可能仍在发生）：

<Image img={step_15} alt="步骤 15" size="lg"/>

移除错误过滤器，并从左侧 `分析模式` 菜单中选择 `事件增量`。

<Image img={step_16} alt="步骤 16" size="lg"/>

顶部面板显示了时间分布，颜色指示事件密度（跨度的数量）。主要集中之外的事件子集通常是值得调查的。

如果我们选择持续时间大于 `200ms` 的事件，并应用 `按选择过滤` 的过滤器，我们可以将分析限制在较慢的事件：

<Image img={step_17} alt="步骤 17" size="lg"/>

对数据子集进行分析后，我们可以看到大多数性能峰值都与 `visa` 交易相关。

### 使用图表获取更多上下文 {#using-charts-for-more-context}

在 ClickStack 中，我们可以从日志、跟踪或指标中图示任何数值，以获取更多的上下文。 

我们已确立：

- 我们的问题出在支付服务
- 缓存已满
- 这导致资源消耗增加
- 该问题阻止了 Visa 支付的完成 - 或至少导致其完成时间很长。

<br/>

从左侧菜单中选择 `图表浏览器`。填写以下值以按照图表类型显示支付完成所需的时间：

- `数据源`: `跟踪`
- `指标`: `最大`
- `SQL 列`: `持续时间`
- `条件`: `ServiceName: payment`
- `时间段`: `过去 1 天`

<br/>

点击 `▶️` 会显示支付性能随时间的减退情况。 

<Image img={step_18} alt="步骤 18" size="lg"/>

如果我们将 `分组依据` 设置为 `SpanAttributes['app.payment.card_type']`（只需输入 `card` 进行自动完成功能），我们可以看到与万事达卡相比，Visa 交易的服务性能如何衰退：

<Image img={step_19} alt="步骤 19" size="lg"/>

注意，一旦出现错误，响应会以 `0s` 返回。

### 更深入探索指标的上下文 {#exploring-metrics-for-more-context}

最后，让我们将缓存大小作为指标绘图，以查看它随时间的变化，从而提供更好的上下文。

填写以下值：

- `数据源`: `指标`
- `指标`: `最大`
- `SQL 列`: `visa_validation_cache.size (gauge)`（只需输入 `cache` 进行自动完成功能）
- `条件`: `ServiceName: payment`
- `分组依据`: `<empty>`

我们可以看到缓存大小在 4-5 小时内增加（可能是在软件部署后），然后达到最大值 `100,000`。通过 `匹配事件示例`，我们可以看到我们的错误与缓存达到此限制相关，之后记录的大小为 `0`，响应也返回为 `0s`。

<Image img={step_20} alt="步骤 20" size="lg"/>

总之，通过探索日志、跟踪和最后的指标，我们得出以下结论：

- 我们的问题出在支付服务
- 由于可能的部署，服务行为发生变化，导致 Visa 缓存在 4-5 小时内缓慢增加 - 达到最大值 `100,000`。
- 这导致缓存增长时资源消耗增加 - 很可能由于实现不佳
- 随着缓存的增长，Visa 支付的性能下降
- 当达到最大尺寸时，缓存拒绝支付并报告其大小为 `0`。

### 使用会话 {#using-sessions} 

会话让我可以重播用户体验，从用户的角度提供有关错误如何发生的可视化说明。尽管通常不用于诊断根本原因，但它们在确认客户支持报告的问题时很有价值，还可以作为更深入调查的起点。

在 HyperDX 中，会话与跟踪和日志相关联，提供有关根本原因的完整视图。

例如，如果支持团队提供了遇到支付问题的用户电子邮件 `Braulio.Roberts23@hotmail.com`，通常更有效的做法是先查看他们的会话，而不是直接搜索日志或跟踪。

从左侧菜单导航到 `客户端会话` 标签，确保数据源设置为 `会话`，时间范围设置为 `过去 1天`：

<Image img={step_21} alt="步骤 21" size="lg"/>

搜索 `SpanAttributes.userEmail: Braulio` 找到我们的客户会话。选择该会话将显示该客户会话的浏览器事件和关联跨度在左侧，用户的浏览器体验将重新渲染在右侧：

<Image img={step_22} alt="步骤 22" size="lg"/>

### 重播会话 {#replaying-sessions} 

通过按 ▶️ 按钮来重播会话。在 `高亮` 和 `所有事件` 之间切换，允许不同程度的跨度粒度，其中前者突出显示关键事件和错误。 

如果我们向下滚动到跨度的底部，可以看到一个与 `/api/checkout` 相关的 `500` 错误。为这个特定跨度按 ▶️ 按钮将重播移动到会话的这一点，让我们确认客户体验 - 支付似乎就是无法完成，没有错误显示。

<Image img={step_23} alt="步骤 23" size="lg"/>

选择这个跨度我们可以确认这是由内部错误引起的。通过点击 `跟踪` 标签并滚动浏览连接的跨度，我们能够确认客户确实是我们缓存问题的受害者。

<Image img={step_24} alt="步骤 24" size="lg"/>

</VerticalStepper>

该演示通过处理电子商务应用中的支付失败事件，展示了 ClickStack 如何通过统一的日志、跟踪、指标和会话重播帮助揭示根本原因 - 探索我们的 [其他入门指南](/use-cases/observability/clickstack/sample-datasets)，深入了解特定功能。
