---
'sidebar_label': '仪表板'
'slug': '/cloud/manage/dashboards'
'title': '仪表板'
'description': 'SQL控制台的仪表板功能允许您收集和分享来自已保存查询的可视化数据。'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import dashboards_2 from '@site/static/images/cloud/dashboards/2_dashboards.png';
import dashboards_3 from '@site/static/images/cloud/dashboards/3_dashboards.png';
import dashboards_4 from '@site/static/images/cloud/dashboards/4_dashboards.png';
import dashboards_5 from '@site/static/images/cloud/dashboards/5_dashboards.png';
import dashboards_6 from '@site/static/images/cloud/dashboards/6_dashboards.png';
import dashboards_7 from '@site/static/images/cloud/dashboards/7_dashboards.png';
import dashboards_8 from '@site/static/images/cloud/dashboards/8_dashboards.png';
import dashboards_9 from '@site/static/images/cloud/dashboards/9_dashboards.png';
import dashboards_10 from '@site/static/images/cloud/dashboards/10_dashboards.png';
import dashboards_11 from '@site/static/images/cloud/dashboards/11_dashboards.png';

# 仪表板

<BetaBadge />

SQL 控制台的仪表板功能允许您收集并分享来自保存查询的可视化内容。开始时可以通过保存和可视化查询，将查询可视化添加到仪表板，以及使用查询参数使仪表板具备交互性。

## 核心概念 {#core-concepts}

### 查询共享 {#query-sharing}

为了与同事共享您的仪表板，请确保共享底层的保存查询。用户必须至少对底层的保存查询拥有只读访问权限，才能查看可视化。

### 交互性 {#interactivity}

使用 [查询参数](/sql-reference/syntax#defining-and-using-query-parameters) 使您的仪表板具备交互性。例如，您可以在 `WHERE` 子句中添加一个查询参数，使其作为过滤器。

您可以通过在可视化设置中选择“过滤器”类型，使用 **全局** 过滤器侧边栏切换查询参数输入。您也可以通过将其链接到仪表板上的另一个对象（如表）来切换查询参数输入。请参阅下面快速入门指南的 “[配置过滤器](/cloud/manage/dashboards#configure-a-filter)” 部分。

## 快速入门 {#quick-start}

让我们创建一个仪表板，以使用 [query_log](/operations/system-tables/query_log) 系统表监控我们的 ClickHouse 服务。

## 快速入门 {#quick-start-1}

### 创建保存查询 {#create-a-saved-query}

如果您已经有要可视化的保存查询，可以跳过此步骤。

打开一个新的查询标签。让我们编写一个查询，以计算按日期统计的服务查询量，使用 ClickHouse 系统表：

<Image img={dashboards_2} size="md" alt="创建保存查询" border/>

我们可以以表格格式查看查询结果，或开始从图表视图构建可视化。在下一步中，我们将查询保存为 `随时间变化的查询`：

<Image img={dashboards_3} size="md" alt="保存查询" border/>

关于保存查询的更多文档可以在 [保存查询部分](/cloud/get-started/sql-console#saving-a-query) 中找到。

我们可以创建并保存另一个查询 `按查询类型统计查询数量`，以计算按查询类型统计的查询数量。下面是 SQL 控制台中数据的条形图可视化。

<Image img={dashboards_4} size="md" alt="查询结果的条形图可视化" border/>

现在有了两个查询，让我们创建一个仪表板来可视化和收集这些查询。

### 创建仪表板 {#create-a-dashboard}

导航到仪表板面板，点击“新仪表板”。在您分配名称后，您便成功创建了第一个仪表板！

<Image img={dashboards_5} size="md" alt="创建新仪表板" border/>

### 添加可视化 {#add-a-visualization}

有两个保存查询，`随时间变化的查询` 和 `按查询类型统计查询数量`。让我们将第一个可视化为折线图。为您的可视化提供标题和副标题，并选择要可视化的查询。接下来，选择 “折线” 图表类型，并分配 x 轴和 y 轴。

<Image img={dashboards_6} size="md" alt="添加可视化" border/>

在此，还可以进行其他样式更改——例如数字格式、图例布局和轴标签。

接下来，让我们将第二个查询可视化为表格，并将其放在折线图下方。

<Image img={dashboards_7} size="md" alt="将查询结果可视化为表格" border/>

通过可视化两个保存查询，您已创建了第一个仪表板！

### 配置过滤器 {#configure-a-filter}

让我们通过添加一个查询类型的过滤器，使该仪表板具备交互性，以便您只显示与 Insert 查询相关的趋势。我们将通过使用 [查询参数](/sql-reference/syntax#defining-and-using-query-parameters) 来完成此任务。

点击折线图旁边的三个点，然后点击查询旁边的铅笔按钮，以打开内联查询编辑器。在这里，我们可以直接从仪表板编辑底层的保存查询。

<Image img={dashboards_8} size="md" alt="编辑底层查询" border/>

现在，当按下黄色运行查询按钮时，您将看到之前的相同查询，仅过滤 Insert 查询。点击保存按钮以更新查询。当您返回到图表设置时，您将能够过滤折线图。

现在，通过顶部功能区的全局过滤器，您可以通过更改输入切换过滤器。

<Image img={dashboards_9} size="md" alt="调整全局过滤器" border/>

假设您想将折线图的过滤器链接到表格。您可以通过返回可视化设置，并将 query_kind 查询参数的值源更改为表，选择 query_kind 列作为链接字段来做到这一点。

<Image img={dashboards_10} size="md" alt="更改查询参数" border/>

现在，您可以从按类型的查询表直接控制折线图的过滤器，使您的仪表板具备交互性。

<Image img={dashboards_11} size="md" alt="控制折线图的过滤器" border/>
