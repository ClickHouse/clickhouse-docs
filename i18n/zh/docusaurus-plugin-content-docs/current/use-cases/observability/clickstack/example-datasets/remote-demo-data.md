---
slug: /use-cases/observability/clickstack/getting-started/remote-demo-data
title: '远程演示数据集'
sidebar_position: 2
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 与远程演示数据集入门'
doc_type: 'guide'
keywords: ['clickstack', '示例数据', '样本数据集', '日志', '可观测性']
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

**本指南假设您已按照[一体化镜像部署说明](/use-cases/observability/clickstack/getting-started)或[仅本地模式](/use-cases/observability/clickstack/deployment/local-mode-only)部署了 ClickStack，并完成了初始用户创建。或者，您也可以跳过所有本地环境搭建，直接连接到我们托管的 ClickStack 演示实例 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)，该实例使用的就是本数据集。**

本指南使用托管在公共 ClickHouse playground [sql.clickhouse.com](https://sql.clickhpouse.com) 上的示例数据集，您可以从本地部署的 ClickStack 连接到该数据集。

:::warning Not supported with HyperDX in ClickHouse Cloud
当 HyperDX 托管在 ClickHouse Cloud 中时，不支持远程数据库。因此，在该环境中无法使用此数据集。
:::


其中包含了大约 40 小时的数据，这些数据捕获自官方 OpenTelemetry (OTel) 演示的 ClickHouse 版本。数据会在每晚重放，并将时间戳调整到当前时间窗口，使用户能够通过 HyperDX 中集成的日志、链路追踪和指标来探索系统行为。

:::note 数据差异
由于数据集会从每天的午夜开始重放，因此具体的可视化结果可能会因您查看演示的时间不同而有所变化。
:::

## 演示场景 {#demo-scenario}

在本次演示中，我们将调查一个与销售天文望远镜及相关配件的电商网站有关的故障事件。

客服团队报告称，用户在结账时完成支付时遇到问题。该问题已升级至网站可靠性工程（SRE）团队进行排查。

SRE 团队将使用 HyperDX 分析日志、追踪和指标，以诊断并解决该问题，随后再审查会话数据，以确认他们的结论是否与真实的用户行为一致。

## OpenTelemetry 演示 {#otel-demo}

本演示使用了官方 OpenTelemetry 演示的一个 [由 ClickStack 维护的分支](https://github.com/ClickHouse/opentelemetry-demo)。

<DemoArchitecture/>

## 演示步骤 {#demo-steps}

**我们已使用 [ClickStack SDKS](/use-cases/observability/clickstack/sdks) 对本演示进行了观测性埋点，将各个服务部署在 Kubernetes 中，并从中采集指标和日志。**

<VerticalStepper headerLevel="h3">
  ### 连接到演示服务器

  :::note 仅本地模式
  如果在本地模式部署时点击了 `Connect to Demo Server`，则可以跳过此步骤。如果使用此模式，数据源将以 `Demo_` 为前缀，例如 `Demo_Logs`
  :::

  导航至 `Team Settings`（团队设置），然后点击 `Local Connection`（本地连接）的 `Edit`（编辑）按钮：

  <Image img={edit_connection} alt="编辑连接" size="lg" />

  将连接重命名为 `Demo`,并在后续表单中填写演示服务器的以下连接详细信息:

  * `连接名称`：`Demo`
  * `Host`: `https://sql-clickhouse.clickhouse.com`
  * `Username`: `otel_demo`
  * `Password`：留空

  <Image img={edit_demo_connection} alt="编辑演示连接" size="lg" />

  ### 修改数据源

  :::note 仅本地模式
  如果在本地模式部署时点击了 `Connect to Demo Server`，则可以跳过此步骤。如果使用此模式，数据源将以 `Demo_` 为前缀，例如 `Demo_Logs`
  :::

  向上滚动到 `Sources` 并修改每个数据源 - `Logs`、`Traces`、`Metrics` 和 `Sessions` - 使其使用 `otel_v2` 数据库。

  <Image img={edit_demo_source} alt="编辑演示数据源" size="lg" />

  :::note
  您可能需要刷新页面，以确保每个数据源中显示完整的数据库列表。
  :::

  ### 调整时间范围

  使用右上角的时间选择器调整时间,以显示过去 `1 天` 的所有数据。

  <Image img={step_2} alt="第 2 步" size="lg" />

  您可能会在概览条形图中观察到错误数量的细微差异,表现为连续几个柱状图的红色部分略有增加。

  :::note
  柱状图的位置将根据查询数据集的时间而有所不同。
  :::

  ### 筛选错误

  要突出显示错误事件,请使用 `SeverityText` 过滤器并选择 `error`,以仅显示错误级别的日志条目。

  错误应该更加明显:

  <Image img={step_3} alt="步骤 3" size="lg" />

  ### 识别错误模式

  通过 HyperDX 的聚类功能,您可以自动识别错误并将其分组为有意义的模式。在处理大量日志和追踪数据时,这可以加快分析速度。要使用该功能,请从左侧面板的 `Analysis Mode` 菜单中选择 `Event Patterns`。

  错误集群显示了与支付失败相关的问题，包括一个名为 `Failed to place order` 的模式。其他集群还显示了信用卡扣款问题和缓存已满的问题。

  <Image img={step_4} alt="步骤 4" size="lg" />

  请注意，这些错误集群可能来源于不同的服务。

  ### 探索错误模式

  点击与我们报告的用户无法完成支付问题关联度最高的错误集群:`Failed to place order`。

  这将显示与 `frontend` 服务关联的所有此错误出现记录的列表:

  <Image img={step_5} alt="步骤 5" size="lg" />

  选择任意一个错误结果。日志元数据将详细显示。通过浏览 `Overview` 和 `Column Values` 两个部分,可以发现充电卡存在缓存相关的问题:

  `扣款失败：无法对卡进行扣款：rpc error: code = Unknown desc = Visa 缓存已满：无法添加新项目。`

  <Image img={step_6} alt="步骤 6" size="lg" />

  ### 探索基础架构

  我们已识别出一个缓存相关错误,该错误可能导致支付失败。我们仍需定位此问题在微服务架构中的来源。

  鉴于缓存问题，有必要检查底层基础设施——相关 Pod（容器组）可能存在内存问题。在 ClickStack 中，日志和指标统一展示并关联上下文，便于快速定位根本原因。

  选择 `Infrastructure` 选项卡，查看 `frontend` 服务底层 Pod（容器组）的相关指标，并将时间范围扩展至 `1d`：

  <Image img={step_7} alt="第 7 步" size="lg" />

  该问题似乎与基础设施无关——在错误发生前后的时间段内,各项指标均未发生明显变化。关闭基础设施选项卡。

  ### 探索追踪

  在 ClickStack 中,追踪数据也会自动与日志和指标进行关联。让我们查看与所选日志关联的追踪数据,以确定负责的服务。

  选择 `Trace` 以可视化关联的追踪。向下滚动查看后续视图,可以看到 HyperDX 如何将跨微服务的分布式追踪可视化,并连接每个服务中的 span。一次支付操作显然涉及多个微服务,包括执行结账和货币转换的服务。

  <Image img={step_8} alt="第 8 步" size="lg" />

  通过滚动到视图底部,可以看到 `payment` 服务引发了该错误,错误随后沿调用链向上传播。

  <Image img={step_9} alt="步骤 9" size="lg" />

  ### 搜索链路追踪

  我们已确认用户因支付服务的缓存问题而无法完成购买。接下来,让我们更详细地查看该服务的追踪数据,以进一步分析根本原因。

  通过选择 `Search` 切换到主搜索视图。将数据源切换为 `Traces` 并选择 `Results table` 视图。**确保时间范围仍为最近一天。**

  <Image img={step_10} alt="第 10 步" size="lg" />

  此视图显示最近一天内的所有追踪数据。我们知道问题源自支付服务,因此在 `ServiceName` 字段应用 `payment` 过滤器。

  <Image img={step_11} alt="步骤 11" size="lg" />

  通过选择 `Event Patterns` 对追踪数据应用事件聚类，即可立即发现 `payment` 服务的缓存问题。

  <Image img={step_12} alt="步骤 12" size="lg" />

  ### 探索追踪的基础设施

  点击 `Results table` 切换至结果视图。使用 `StatusCode` 筛选器和 `Error` 值筛选错误记录。

  <Image img={step_13} alt="步骤 13" size="lg" />

  选择一个 `Error: Visa cache full: cannot add new item.` 错误，切换到 `Infrastructure` 选项卡，并将时间跨度扩大到 `1d`。

  <Image img={step_14} alt="步骤 14" size="lg" />

  通过关联追踪数据与指标数据，我们可以看到 `payment` 服务的内存和 CPU 使用率上升，随后骤降至 `0`（可归因于 pod（容器组）重启）——这表明缓存问题引发了资源问题。可以预期这已影响支付完成时间。

  ### 事件增量加速问题解决

  事件增量（Event Deltas）通过将性能或错误率的变化归因于特定数据子集来帮助识别异常，从而更便于快速定位根本原因。

  虽然我们知道 `payment` 服务存在缓存问题，导致资源消耗增加，但尚未完全确定根本原因。

  返回结果表视图,选择包含错误的时间段以限制数据范围。请确保选择错误发生时间前后各几个小时的数据(如果可能),因为问题可能仍在持续:

  <Image img={step_15} alt="步骤 15" size="lg" />

  移除错误过滤器,然后从左侧的 `分析模式` 菜单中选择 `事件增量`。

  <Image img={step_16} alt="步骤 16" size="lg" />

  顶部面板显示时序分布,颜色表示事件密度(span 数量)。主要集中区域之外的事件子集通常值得重点排查。

  选择持续时间大于 `200ms` 的事件，并应用 `Filter by selection` 过滤器，即可将分析范围限定为较慢的事件：

  <Image img={step_17} alt="第 17 步" size="lg" />

  通过对数据子集的分析,可以看到大多数性能峰值与 `visa` 交易相关。

  ### 使用图表获取更多上下文

  在 ClickStack 中,我们可以将日志、追踪或指标中的任何数值绘制成图表,以获取更丰富的上下文信息。

  我们已经完成了以下配置：

  * 我们的问题出在支付服务上
  * 缓存已满
  * 这导致资源消耗上升
  * 该问题导致 Visa 支付无法完成，或者至少会严重拖慢支付完成时间。

  <br />

  从左侧菜单中选择 `Chart Explorer`。填写以下值，按图表类型绘制支付完成所需时间：

  * `数据源`：`跟踪`
  * `指标`: `最大值`
  * `SQL 列`：`Duration`
  * `其中：` `ServiceName: payment`
  * `时间范围`: `最近 1 天`

  <br />

  点击 `▶️` 将显示支付性能随时间的变化趋势。

  <Image img={step_18} alt="步骤 18" size="lg" />

  将 `Group By` 设置为 `SpanAttributes['app.payment.card_type']`(输入 `card` 即可自动补全),可以看到 Visa 交易相对于 Mastercard 交易的服务性能下降情况:

  <Image img={step_19} alt="步骤 19" size="lg" />

  请注意,一旦发生错误,响应会立即返回(耗时 `0s`)。

  ### 探索指标的更多上下文信息

  最后,我们将缓存大小作为指标进行绘制,以观察其随时间的变化行为,从而获得更多上下文信息。

  填写以下配置值:

  * `数据源`：`指标`
  * `Metric`: `最大值`
  * `SQL Column`: `visa_validation_cache.size (gauge)`（只需输入 `cache` 即可自动补全）
  * `Where`: `ServiceName: payment`
  * `Group By`：`<empty>`

  我们可以看到缓存大小在 4-5 小时内逐渐增加(可能是在软件部署之后),最终达到 `100,000` 的最大值。从 `Sample Matched Events` 中可以看到,我们的错误与缓存达到此限制关联,之后缓存大小被记录为 `0`,响应时间也变为 `0s`。

  <Image img={step_20} alt="步骤 20" size="lg" />

  综上所述,通过探索日志、追踪和指标,我们得出以下结论:

  * 我们的问题出在支付服务上
  * 服务行为发生变化（很可能是由一次部署引起），导致签证缓存的大小在 4–5 小时内缓慢增长，最终达到 `100,000` 的峰值。
  * 随着缓存规模不断增大，资源消耗也随之增加，这很可能是由于实现不当所致
  * 随着缓存不断增大，Visa 支付的性能逐渐下降
  * 在达到最大容量时，缓存会拒绝支付请求，并将自身报告为大小为 `0`。

  ### 使用会话

  会话功能允许我们重放用户体验,从用户视角提供错误发生过程的可视化记录。虽然通常不用于诊断根本原因,但对于确认客户支持团队收到的问题报告非常有价值,并可作为深入调查的起点。

  在 HyperDX 中,会话与链路追踪和日志关联,提供问题根因的完整视图。

  例如,如果支持团队提供了遇到支付问题的用户邮箱 `Braulio.Roberts23@hotmail.com`,通常从该用户的会话入手进行分析会比直接搜索日志或追踪更有效。

  从左侧菜单导航至 `Client Sessions` 选项卡,并确保数据源设置为 `Sessions`,时间段设置为 `Last 1 day`:

  <Image img={step_21} alt="步骤 21" size="lg" />

  搜索 `SpanAttributes.userEmail: Braulio` 以查找客户会话。选择该会话后,左侧将显示该客户会话的浏览器事件和关联 span,右侧将重现用户的浏览器操作过程:

  <Image img={step_22} alt="步骤 22" size="lg" />

  ### 回放会话

  点击 ▶️ 按钮即可回放会话。在 `Highlighted` 和 `All Events` 之间切换可调整 span 的粒度级别，前者突出显示关键事件和错误。

  滚动到 span 列表底部,可以看到与 `/api/checkout` 关联的 `500` 错误。点击该 span 的 ▶️ 按钮,回放将跳转到会话中的此时间点,从而确认客户的实际体验——支付功能无法正常工作,且未显示任何错误信息。

  <Image img={step_23} alt="步骤 23" size="lg" />

  选择该 span 后,我们可以确认这是由内部错误导致的。通过点击 `Trace` 选项卡并滚动浏览关联的 span,我们能够确认该客户确实受到了缓存问题的影响。

  <Image img={step_24} alt="步骤 24" size="lg" />
</VerticalStepper>

本示例演示一个电商应用中支付失败的真实事故，展示 ClickStack 如何通过统一的日志、链路追踪、指标和会话回放来帮助定位根因——可查看我们的[其他入门指南](/use-cases/observability/clickstack/sample-datasets)，以更深入地探索特定功能。