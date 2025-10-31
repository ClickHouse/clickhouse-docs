---
'sidebar_label': 'SQL 控制台'
'sidebar_position': 1
'title': 'SQL 控制台'
'slug': '/integrations/sql-clients/sql-console'
'description': '了解 SQL 控制台'
'doc_type': 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import Image from '@theme/IdealImage';
import table_list_and_schema from '@site/static/images/cloud/sqlconsole/table-list-and-schema.png';
import view_columns from '@site/static/images/cloud/sqlconsole/view-columns.png';
import abc from '@site/static/images/cloud/sqlconsole/abc.png';
import inspecting_cell_content from '@site/static/images/cloud/sqlconsole/inspecting-cell-content.png';
import sort_descending_on_column from '@site/static/images/cloud/sqlconsole/sort-descending-on-column.png';
import filter_on_radio_column_equal_gsm from '@site/static/images/cloud/sqlconsole/filter-on-radio-column-equal-gsm.png';
import add_more_filters from '@site/static/images/cloud/sqlconsole/add-more-filters.png';
import filtering_and_sorting_together from '@site/static/images/cloud/sqlconsole/filtering-and-sorting-together.png';
import create_a_query_from_sorts_and_filters from '@site/static/images/cloud/sqlconsole/create-a-query-from-sorts-and-filters.png';
import creating_a_query from '@site/static/images/cloud/sqlconsole/creating-a-query.png';
import run_selected_query from '@site/static/images/cloud/sqlconsole/run-selected-query.png';
import run_at_cursor_2 from '@site/static/images/cloud/sqlconsole/run-at-cursor-2.png';
import run_at_cursor from '@site/static/images/cloud/sqlconsole/run-at-cursor.png';
import cancel_a_query from '@site/static/images/cloud/sqlconsole/cancel-a-query.png';
import sql_console_save_query from '@site/static/images/cloud/sqlconsole/sql-console-save-query.png';
import sql_console_rename from '@site/static/images/cloud/sqlconsole/sql-console-rename.png';
import sql_console_share from '@site/static/images/cloud/sqlconsole/sql-console-share.png';
import sql_console_edit_access from '@site/static/images/cloud/sqlconsole/sql-console-edit-access.png';
import sql_console_add_team from '@site/static/images/cloud/sqlconsole/sql-console-add-team.png';
import sql_console_edit_member from '@site/static/images/cloud/sqlconsole/sql-console-edit-member.png';
import sql_console_access_queries from '@site/static/images/cloud/sqlconsole/sql-console-access-queries.png';
import search_hn from '@site/static/images/cloud/sqlconsole/search-hn.png';
import match_in_body from '@site/static/images/cloud/sqlconsole/match-in-body.png';
import pagination from '@site/static/images/cloud/sqlconsole/pagination.png';
import pagination_nav from '@site/static/images/cloud/sqlconsole/pagination-nav.png';
import download_as_csv from '@site/static/images/cloud/sqlconsole/download-as-csv.png';
import tabular_query_results from '@site/static/images/cloud/sqlconsole/tabular-query-results.png';
import switch_from_query_to_chart from '@site/static/images/cloud/sqlconsole/switch-from-query-to-chart.png';
import trip_total_by_week from '@site/static/images/cloud/sqlconsole/trip-total-by-week.png';
import bar_chart from '@site/static/images/cloud/sqlconsole/bar-chart.png';
import change_from_bar_to_area from '@site/static/images/cloud/sqlconsole/change-from-bar-to-area.png';
import update_query_name from '@site/static/images/cloud/sqlconsole/update-query-name.png';
import update_subtitle_etc from '@site/static/images/cloud/sqlconsole/update-subtitle-etc.png';
import adjust_axis_scale from '@site/static/images/cloud/sqlconsole/adjust-axis-scale.png';
import give_a_query_a_name from '@site/static/images/cloud/sqlconsole/give-a-query-a-name.png'
import save_the_query from '@site/static/images/cloud/sqlconsole/save-the-query.png'


# SQL 控制台

SQL 控制台是探索和查询您在 ClickHouse Cloud 中的数据库的最快和最简单的方法。您可以使用 SQL 控制台来：

- 连接到您的 ClickHouse Cloud 服务
- 查看、过滤和排序表数据
- 执行查询并在短短几次点击中可视化结果数据
- 与团队成员共享查询，并更有效地协作。

## 探索表格 {#exploring-tables}

### 查看表格列表和模式信息 {#viewing-table-list-and-schema-info}

您 ClickHouse 实例中包含的表格概览可以在左侧边栏区域中找到。使用左侧栏顶部的数据库选择器查看特定数据库中的表格。

<Image img={table_list_and_schema} size="lg" border alt="表格列表和模式视图显示左侧边栏中的数据库表格"/>

列表中的表格也可以展开以查看列和类型。

<Image img={view_columns} size="lg" border alt="展开的表格视图显示列名称和数据类型"/>

### 探索表格数据 {#exploring-table-data}

单击列表中的一个表格以在新选项卡中打开。在表格视图中，数据可以轻松查看、选择和复制。请注意，结构和格式在复制粘贴到 Microsoft Excel 和 Google Sheets 等电子表格应用程序时会被保留。您可以使用页脚中的导航在表格数据的页面之间翻转（30 行递增分页）。

<Image img={abc} size="lg" border alt="表格视图显示可以选择和复制的数据"/>

### 检查单元格数据 {#inspecting-cell-data}

单元格检查工具可用于查看单个单元格中包含的大量数据。要打开它，请右键单击单元格并选择“检查单元格”。单元格检查器中的内容可以通过单击检查器内容右上角的复制图标来复制。

<Image img={inspecting_cell_content} size="lg" border alt="单元格检查器对话框显示所选单元格的内容"/>

## 过滤和排序表格 {#filtering-and-sorting-tables}

### 排序表格 {#sorting-a-table}

要在 SQL 控制台中排序表格，请打开一个表格并在工具栏中选择“排序”按钮。此按钮将打开一个菜单，允许您配置排序。您可以选择按某一列排序，并配置排序的顺序（升序或降序）。选择“应用”或按 Enter 键以排序您的表格。

<Image img={sort_descending_on_column} size="lg" border alt="排序对话框显示按列进行降序排序的配置"/>

SQL 控制台还允许您向表格添加多个排序。再次单击“排序”按钮以添加另一个排序。注意：排序按出现的顺序应用于排序窗格（从上到下）。要移除排序，只需单击排序旁边的“x”按钮。

### 过滤表格 {#filtering-a-table}

要在 SQL 控制台中过滤表格，请打开一个表格并选择“过滤”按钮。与排序一样，此按钮将打开一个菜单，允许您配置过滤器。您可以选择按某一列过滤并选择必要的条件。SQL 控制台智能地显示与列中包含的数据类型相对应的过滤选项。

<Image img={filter_on_radio_column_equal_gsm} size="lg" border alt="过滤对话框显示配置使无线电列等于 GSM"/>

当您对过滤器满意时，可以选择“应用”以过滤数据。您还可以添加附加过滤器，如下所示。

<Image img={add_more_filters} size="lg" border alt="对话框显示如何添加一个额外的范围大于 2000 的过滤器"/>

与排序功能类似，单击过滤器旁边的“x”按钮以移除它。

### 同时过滤和排序 {#filtering-and-sorting-together}

SQL 控制台允许您同时过滤和排序表格。要做到这一点，请使用上述步骤添加所有所需的过滤器和排序，然后单击“应用”按钮。

<Image img={filtering_and_sorting_together} size="lg" border alt="界面显示同时应用过滤和排序"/>

### 从过滤器和排序创建查询 {#creating-a-query-from-filters-and-sorts}

SQL 控制台可以通过一次点击将您的排序和过滤器直接转换为查询。只需从工具栏中选择“创建查询”按钮，选择您想要的排序和过滤参数。单击“创建查询”后，将打开一个新查询选项卡，并预填充与您表格视图中包含的数据相对应的 SQL 命令。

<Image img={create_a_query_from_sorts_and_filters} size="lg" border alt="界面显示生成 SQL 的创建查询按钮"/>

:::note
在使用“创建查询”功能时，过滤器和排序不是必需的。
:::

您可以通过阅读 (link) 查询文档了解有关 SQL 控制台中查询的更多信息。

## 创建和运行查询 {#creating-and-running-a-query}

### 创建查询 {#creating-a-query}

在 SQL 控制台中有两种方法可以创建新查询。

- 单击选项卡栏中的“+”按钮
- 从左侧边栏查询列表中选择“新查询”按钮

<Image img={creating_a_query} size="lg" border alt="界面显示如何使用 + 按钮或新查询按钮创建新查询"/>

### 运行查询 {#running-a-query}

要运行查询，请在 SQL 编辑器中输入您的 SQL 命令，然后单击“运行”按钮或使用快捷键 `cmd / ctrl + enter`。要顺序编写和运行多个命令，请确保在每个命令后添加分号。

查询执行选项
默认情况下，单击运行按钮将运行 SQL 编辑器中包含的所有命令。SQL 控制台支持另外两种查询执行选项：

- 运行选定的命令
- 运行光标处的命令

要运行选定的命令，请突出显示所需的命令或命令序列，然后单击“运行”按钮（或使用 `cmd / ctrl + enter` 快捷键）。当存在选择时，您还可以从 SQL 编辑器上下文菜单中选择“运行所选”（通过右键单击编辑器中的任何位置打开）。

<Image img={run_selected_query} size="lg" border alt="界面显示如何运行 SQL 查询的选定部分"/>

在当前光标位置运行命令可以通过两种方式实现：

- 从扩展运行选项菜单中选择“在光标处”（或使用相应的 `cmd / ctrl + shift + enter` 键盘快捷键）

<Image img={run_at_cursor_2} size="lg" border alt="扩展运行选项菜单中的在光标处选项"/>

- 从 SQL 编辑器上下文菜单中选择“在光标处运行”

<Image img={run_at_cursor} size="lg" border alt="SQL 编辑器上下文菜单中的在光标处运行选项"/>

:::note
在执行时，光标位置的命令将闪烁黄色。
:::

### 取消查询 {#canceling-a-query}

在查询运行时，查询编辑器工具栏中的“运行”按钮将被“取消”按钮替换。只需单击此按钮或按 `Esc` 以取消查询。注意：已返回的任何结果在取消后将保留。

<Image img={cancel_a_query} size="lg" border alt="查询执行期间出现的取消按钮"/>

### 保存查询 {#saving-a-query}

如果之前未命名，您的查询应称为“未命名查询”。单击查询名称以更改它。重命名查询将导致该查询被保存。

<Image img={give_a_query_a_name} size="lg" border alt="界面显示如何将查询从未命名查询重命名"/>

您还可以使用保存按钮或 `cmd / ctrl + s` 键盘快捷键保存查询。

<Image img={save_the_query} size="lg" border alt="查询编辑器工具栏中的保存按钮"/>

## 使用 GenAI 管理查询 {#using-genai-to-manage-queries}

此功能允许用户将查询编写为自然语言问题，并让查询控制台根据可用表格的上下文创建 SQL 查询。GenAI 还可以帮助用户调试他们的查询。

有关 GenAI 的更多信息，请查看 [宣布 ClickHouse Cloud 中基于 GenAI 的查询建议的博客文章](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud)。

### 表格设置 {#table-setup}

让我们导入英国价格支付示例数据集并使用它来创建一些 GenAI 查询。

1. 打开一个 ClickHouse Cloud 服务。
1. 单击 _+_ 图标创建一个新查询。
1. 粘贴并运行以下代码：

```sql
CREATE TABLE uk_price_paid
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4, 'other' = 0),
    is_new UInt8,
    duration Enum8('freehold' = 1, 'leasehold' = 2, 'unknown' = 0),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2);
```

   该查询应该在大约 1 秒内完成。完成后，您应该有一个名为 `uk_price_paid` 的空表格。

1. 创建一个新查询并粘贴以下查询：

```sql
INSERT INTO uk_price_paid
WITH
   splitByChar(' ', postcode) AS p
SELECT
    toUInt32(price_string) AS price,
    parseDateTimeBestEffortUS(time) AS date,
    p[1] AS postcode1,
    p[2] AS postcode2,
    transform(a, ['T', 'S', 'D', 'F', 'O'], ['terraced', 'semi-detached', 'detached', 'flat', 'other']) AS type,
    b = 'Y' AS is_new,
    transform(c, ['F', 'L', 'U'], ['freehold', 'leasehold', 'unknown']) AS duration,
    addr1,
    addr2,
    street,
    locality,
    town,
    district,
    county
FROM url(
    'http://prod.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv',
    'CSV',
    'uuid_string String,
    price_string String,
    time String,
    postcode String,
    a String,
    b String,
    c String,
    addr1 String,
    addr2 String,
    street String,
    locality String,
    town String,
    district String,
    county String,
    d String,
    e String'
) SETTINGS max_http_get_redirects=10;
```

此查询从 `gov.uk` 网站获取数据集。此文件大小约为 ~4GB，因此此查询将需要几分钟才能完成。一旦 ClickHouse 处理了查询，您应该在 `uk_price_paid` 表中拥有整个数据集。

#### 查询创建 {#query-creation}

让我们使用自然语言来创建一个查询。

1. 选择 **uk_price_paid** 表，然后单击 **创建查询**。
1. 单击 **生成 SQL**。您可能被要求接受将查询发送到 Chat-GPT。您必须选择 **我同意** 继续。
1. 现在，您可以使用此提示输入自然语言查询，并让 ChatGPT 将其转换为 SQL 查询。在此示例中，我们将输入：

   > 给我展示按年份分类的所有 uk_price_paid 交易的总价格和总数量。

1. 控制台将生成我们所需的查询并在新选项卡中显示。在我们的示例中，GenAI 创建了以下查询：

```sql
-- Show me the total price and total number of all uk_price_paid transactions by year.
SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
FROM uk_price_paid
GROUP BY year(date)
```

1. 一旦您确认查询正确，请单击 **运行** 以执行它。

### 调试 {#debugging}

现在，让我们测试 GenAI 的查询调试功能。

1. 单击 _+_ 图标创建一个新查询并粘贴以下代码：

```sql
-- Show me the total price and total number of all uk_price_paid transactions by year.
SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
FROM uk_price_paid
GROUP BY year(date)
```

1. 单击 **运行**。由于我们尝试从 `pricee` 中获取值而不是 `price`，查询失败。
1. 单击 **修复查询**。
1. GenAI 将尝试修复查询。在这种情况下，它将 `pricee` 更改为 `price`。它还意识到在这种情况下使用 `toYear` 是更好的函数。
1. 选择 **应用** 以将建议的更改添加到查询中，然后单击 **运行**。

请记住，GenAI 是一个实验性功能。在针对任何数据集运行由 GenAI 生成的查询时请谨慎。

## 高级查询功能 {#advanced-querying-features}

### 搜索查询结果 {#searching-query-results}

执行查询后，您可以使用结果窗格中的搜索输入快速搜索返回的结果集。此功能帮助预览其他 `WHERE` 子句的结果，或者仅仅检查确保特定数据包含在结果集中。在搜索输入中输入值后，结果窗格将更新并返回包含与输入值匹配的条目的记录。在此示例中，我们将查找 `hackernews` 表中所有包含 `ClickHouse` 的 `breakfast` 评论（不区分大小写）：

<Image img={search_hn} size="lg" border alt="搜索 Hacker News 数据"/>

注意：任何匹配输入值的字段都将返回。例如，上面截图中的第三条记录在 `by` 字段中不匹配 'breakfast'，但在 `text` 字段中确实匹配：

<Image img={match_in_body} size="lg" border alt="正文中的匹配项"/>

### 调整分页设置 {#adjusting-pagination-settings}

默认情况下，查询结果窗格将在单个页面上显示每个结果记录。对于较大的结果集，分页结果可能更方便查看。这可以使用结果窗格右下角的分页选择器实现：

<Image img={pagination} size="lg" border alt="分页选项"/>

选择页面大小将立即将分页应用于结果集，并且导航选项将出现在结果窗格底部的中间位置。

<Image img={pagination_nav} size="lg" border alt="分页导航"/>

### 导出查询结果数据 {#exporting-query-result-data}

查询结果集可以直接从 SQL 控制台轻松导出为 CSV 格式。为此，请打开结果窗格工具栏右侧的 `•••` 菜单，并选择“下载为 CSV”。

<Image img={download_as_csv} size="lg" border alt="下载为 CSV"/>

## 可视化查询数据 {#visualizing-query-data}

有些数据以图表形式更容易解释。您可以直接从 SQL 控制台快速从查询结果数据创建可视化图。在此示例中，我们将使用一个计算纽约市出租车行程每周统计的查询：

```sql
SELECT
   toStartOfWeek(pickup_datetime) AS week,
   sum(total_amount) AS fare_total,
   sum(trip_distance) AS distance_total,
   count(*) AS trip_total
FROM
   nyc_taxi
GROUP BY
   1
ORDER BY
   1 ASC
```

<Image img={tabular_query_results} size="lg" border alt="表格查询结果"/>

没有可视化，这些结果很难解释。让我们将它们转换为图表。

### 创建图表 {#creating-charts}

要开始构建可视化，请从查询结果窗格工具栏中选择“图表”选项。图表配置窗格将出现：

<Image img={switch_from_query_to_chart} size="lg" border alt="从查询切换到图表"/>

我们将首先创建一个简单的条形图，跟踪 `trip_total` 按 `week`。为此，我们将 `week` 字段拖到 x 轴上，并将 `trip_total` 字段拖到 y 轴上：

<Image img={trip_total_by_week} size="lg" border alt="按周统计旅行总额"/>

大多数图表类型支持在数值轴上使用多个字段。为了演示，我们将 `fare_total` 字段拖到 y 轴上：

<Image img={bar_chart} size="lg" border alt="条形图"/>

### 自定义图表 {#customizing-charts}

SQL 控制台支持十种图表类型，可以从图表配置窗格中的图表类型选择器中选择。例如，我们可以轻松地将先前的图表类型从条形图更改为面积图：

<Image img={change_from_bar_to_area} size="lg" border alt="将条形图更改为面积图"/>

图表标题与提供数据的查询名称匹配。更新查询名称将导致图表标题也更新：

<Image img={update_query_name} size="lg" border alt="更新查询名称"/>

在图表配置窗格的“高级”部分中还可以调整许多更高级图表特性。为了开始，我们将调整以下设置：

- 副标题
- 轴标题
- x 轴标签方向

我们的图表将相应更新：

<Image img={update_subtitle_etc} size="lg" border alt="更新副标题等."/>

在某些情况下，可能需要独立调整每个字段的轴刻度。这也可以在“高级”部分的图表配置窗格中通过为轴范围指定最小值和最大值来实现。例如，上述图表看起来不错，但为了演示 `trip_total` 和 `fare_total` 字段之间的相关性，需要对轴范围进行一些调整：

<Image img={adjust_axis_scale} size="lg" border alt="调整轴刻度"/>

## 共享查询 {#sharing-queries}

SQL 控制台使您能够与团队共享查询。当查询被共享时，所有团队成员都可以查看和编辑该查询。共享查询是与团队协作的好方法。

要共享查询，请单击查询工具栏中的“共享”按钮。

<Image img={sql_console_share} size="lg" border alt="查询工具栏中的共享按钮"/>

将打开一个对话框，允许您与团队的所有成员共享查询。如果您有多个团队，可以选择将查询共享给哪个团队。

<Image img={sql_console_edit_access} size="lg" border alt="编辑对共享查询访问权限的对话框"/>

<Image img={sql_console_add_team} size="lg" border alt="将团队添加到共享查询的界面"/>

<Image img={sql_console_edit_member} size="lg" border alt="编辑对共享查询的成员访问权限的界面"/>

在某些情况下，可能需要独立调整每个字段的轴刻度。这也可以在“高级”部分的图表配置窗格中通过为轴范围指定最小值和最大值来实现。例如，上述图表看起来不错，但为了演示 `trip_total` 和 `fare_total` 字段之间的相关性，需要对轴范围进行一些调整：

<Image img={sql_console_access_queries} size="lg" border alt="查询列表中的与我共享部分"/>
