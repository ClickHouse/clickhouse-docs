---
'slug': '/use-cases/observability/clickstack/event_deltas'
'title': '与 ClickStack 的事件增量'
'sidebar_label': '事件增量'
'pagination_prev': null
'pagination_next': null
'description': '与 ClickStack 的事件增量'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import event_deltas from '@site/static/images/use-cases/observability/hyperdx-demo/step_17.png';
import event_deltas_no_selected from '@site/static/images/use-cases/observability/event_deltas_no_selected.png';
import event_deltas_highlighted from '@site/static/images/use-cases/observability/event_deltas_highlighted.png';
import event_deltas_selected from '@site/static/images/use-cases/observability/event_deltas_selected.png';
import event_deltas_issue from '@site/static/images/use-cases/observability/event_deltas_issue.png';
import event_deltas_outliers from '@site/static/images/use-cases/observability/event_deltas_outliers.png';
import event_deltas_separation from '@site/static/images/use-cases/observability/event_deltas_separation.png';
import event_deltas_inappropriate from '@site/static/images/use-cases/observability/event_deltas_inappropriate.png';

Event Deltas in ClickStack 是一个以跟踪为中心的功能，能够自动分析跟踪的属性，以揭示性能退化时发生了什么变化。通过比较正常与慢速跟踪在一个语料库中的延迟分布，ClickStack 突出显示了哪些属性与差异最相关——无论是新的部署版本、特定的端点，还是特定的用户 ID。

在手动筛选跟踪数据的过程中，事件增量可以揭示在两个数据子集之间驱动延迟差异的关键属性，这使得诊断回归和精准定位根本原因变得更加容易。此功能使您能够可视化原始跟踪，并立即看到影响性能变化的因素，加快事件响应，并减少平均解决时间。

<Image img={event_deltas} alt="Event Deltas" size="lg"/>

## 使用事件增量 {#using-event-deltas}

事件增量可以通过 ClickStack 中选择 `Trace` 类型数据源的 **Search** 面板直接使用。

从左上角的 **Analysis Mode** 选择器中，选择 **Event Deltas**（选定 `Trace` 数据源）以切换到标准结果表，该表将跨度显示为行。

<Image img={event_deltas_no_selected} alt="Event Deltas not selected" size="lg"/>

此视图呈现了随时间变化的跨度分布，显示延迟如何随数量变化而变化。纵轴表示延迟，而颜色表示在给定点的跟踪密度，亮黄色区域对应着更高的跟踪浓度。通过这个可视化，用户可以迅速看到跨度在延迟和计数之间的分布情况，使识别性能变化或异常变得更加容易。

<Image img={event_deltas_highlighted} alt="Event Deltas highlighted" size="lg"/>

然后用户可以选择可视化中的某个区域——理想情况下是具有较长持续时间跨度和足够密度的区域，并随后选择 **Filter by Selection**。这将指定用于分析的“异常值”。事件增量随后将识别与这个异常子集中的那些跨度最相关的列和关键值。通过关注具有重要异常值的区域，ClickStack 突出显示了使此子集与整体语料库区分开来的独特值，揭示了与观察到的性能差异最相关的属性。

<Image img={event_deltas_selected} alt="Event Deltas selected" size="lg"/>

对于每一列，ClickStack 识别那些明显偏向于所选异常子集的值。换句话说，当某个值出现在一列中时，如果它主要出现在异常值中而不是整体数据集（正常值）中，它会被突出显示为重要。具有最强偏差的列将首先列出，揭示与异常跨度最强相关的属性，并将其与基线行为区分开来。

<Image img={event_deltas_outliers} alt="Event Deltas outliers" size="lg"/>

考虑上面的示例，其中 `SpanAttributes.app.payment.card_type` 列已被显示。这里，事件增量分析显示 `29%` 的正常值使用 MasterCard，而异常值中为 `0%`，而 `100%` 的异常值使用 Visa，正常值中为 `71%`。这表明 Visa 卡类型与异常的高延迟跟踪高度相关，而 MasterCard 仅出现在正常子集中。

<Image img={event_deltas_issue} alt="Event Deltas issue" size="lg"/>

反之，完全与正常值关联的值也许同样有趣。在上面的示例中，错误 `Visa Cash Full` 完全出现在正常值中，而在异常跨度中完全缺失。在这种情况下，延迟始终低于约 50 毫秒，表明此错误与低延迟相关。

## 事件增量的工作原理 {#how-event-deltas-work}

事件增量通过发出两个查询来工作：一个针对所选的异常区域，另一个针对正常区域。每个查询被限制在适当的持续时间和时间窗口。接下来，检查两个结果集中的事件样本，并识别在异常值中主要出现的值集中度高的列。首先显示的是只在异常子集中出现 100% 值的列，从而突出显示观察到差异中最负责任的属性。

## 推荐 {#recommendations}

事件增量在分析集中于特定服务时效果最佳。多个服务之间的延迟可能差异很大，这使得识别最为关键的异常值的列和值变得更加困难。在启用事件增量之前，请将跨度过滤到延迟分布预计相似的集合中。目标分析那些广泛的延迟变异不寻常的集合，以获取最有用的洞察，避免那些变异是常态的情况（例如两个不同的服务）。

选择区域时，用户应针对明确显示慢速与快速持续时间分布的子集，允许高延迟跨度被清晰隔离以供分析。例如，请注意下面选择的区域明确捕获了一组慢速跨度供分析。

<Image img={event_deltas_separation} alt="Event Deltas Separation" size="lg"/>

反之，以下数据集在使用事件增量时难以以有用的方式进行分析。

<Image img={event_deltas_inappropriate} alt="Event Deltas Poor seperation" size="lg"/>
