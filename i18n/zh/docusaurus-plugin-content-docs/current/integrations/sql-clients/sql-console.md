---
'sidebar_label': 'SQL 控制台'
'sidebar_position': 1
'title': 'SQL 控制台'
'slug': '/integrations/sql-clients/sql-console'
'description': '了解 SQL 控制台'
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

SQL 控制台是探索和查询您在 ClickHouse Cloud 中数据库的最快和最简便的方法。您可以使用 SQL 控制台：

- 连接到您的 ClickHouse Cloud 服务
- 查看、过滤和排序表数据
- 只需几次点击即可执行查询并可视化结果数据
- 与团队成员共享查询并更有效地协作。

## 探索表 {#exploring-tables}

### 查看表列表和模式信息 {#viewing-table-list-and-schema-info}

您的 ClickHouse 实例中包含的表的概述可以在左侧边栏区域找到。使用左侧栏顶部的数据库选择器查看特定数据库中的表

<Image img={table_list_and_schema} size="lg" border alt="表列表和模式视图显示左侧边栏中的数据库表"/>

列表中的表也可以展开以查看列和类型

<Image img={view_columns} size="lg" border alt="查看扩展表显示列名和数据类型"/>

### 探索表数据 {#exploring-table-data}

单击列表中的表以在新标签中打开它。在表视图中，数据可以轻松查看、选择和复制。请注意，在复制到电子表格应用程序（如 Microsoft Excel 和 Google Sheets）时，结构和格式会被保留。您可以使用页脚中的导航在表数据的页面之间切换（按 30 行递增进行分页）。

<Image img={abc} size="lg" border alt="表视图显示可以选择和复制的数据"/>

### 检查单元格数据 {#inspecting-cell-data}

单元格检查器工具可用于查看包含在单个单元格中的大量数据。要打开它，右键单击单元格并选择“检查单元格”。通过单击检查器内容右上角的复制图标，可以复制单元格检查器的内容。

<Image img={inspecting_cell_content} size="lg" border alt="单元格检查器对话框显示选定单元格的内容"/>

## 过滤和排序表 {#filtering-and-sorting-tables}

### 排序表 {#sorting-a-table}

要在 SQL 控制台中排序表，打开一个表并选择工具栏中的“排序”按钮。该按钮将打开一个菜单，让您配置排序。您可以选择一个列进行排序并配置排序的顺序（升序或降序）。选择“应用”或按 Enter 键以对表进行排序

<Image img={sort_descending_on_column} size="lg" border alt="排序对话框显示对列进行降序排序的配置"/>

SQL 控制台还允许您对表添加多个排序。再次单击“排序”按钮以添加另一个排序。注意：排序按它们在排序面板中出现的顺序（从上到下）应用。要删除排序，只需单击排序旁边的“x”按钮。

### 过滤表 {#filtering-a-table}

要在 SQL 控制台中过滤表，打开一个表并选择“过滤”按钮。与排序一样，该按钮将打开一个菜单，让您配置过滤。您可以选择一个列进行过滤并选择必要的条件。SQL 控制台智能地显示与列中包含的数据类型相对应的过滤选项。

<Image img={filter_on_radio_column_equal_gsm} size="lg" border alt="过滤对话框显示过滤电台列等于 GSM 的配置"/>

当您对过滤感到满意时，可以选择“应用”以过滤您的数据。您还可以添加其他过滤器，如下所示。

<Image img={add_more_filters} size="lg" border alt="对话框显示如何添加一个附加的过滤器，范围大于 2000"/>

与排序功能类似，单击过滤器旁边的“x”按钮以将其删除。

### 同时过滤和排序 {#filtering-and-sorting-together}

SQL 控制台允许您同时过滤和排序一个表。为此，请按照上述步骤添加所有所需的过滤器和排序，并单击“应用”按钮。

<Image img={filtering_and_sorting_together} size="lg" border alt="界面显示同时应用的过滤和排序"/>

### 从过滤器和排序中创建查询 {#creating-a-query-from-filters-and-sorts}

SQL 控制台可以一键将您的排序和过滤直接转换为查询。只需从工具栏中选择“创建查询”按钮和您选择的排序及过滤参数。在单击“创建查询”后，新的查询标签将打开，预填充与您表视图中包含的数据相对应的 SQL 命令。

<Image img={create_a_query_from_sorts_and_filters} size="lg" border alt="界面显示生成 SQL 的创建查询按钮，来自过滤器和排序"/>

:::note
使用“创建查询”功能时，过滤器和排序不是强制的。
:::

您可以通过阅读 (link) 查询文档了解更多关于在 SQL 控制台中查询的信息。

## 创建和运行查询 {#creating-and-running-a-query}

### 创建查询 {#creating-a-query}

在 SQL 控制台中创建新查询有两种方法。

- 单击标签栏中的“+”按钮
- 从左侧边栏的查询列表中选择“新查询”按钮

<Image img={creating_a_query} size="lg" border alt="界面显示如何使用 + 按钮或新查询按钮创建新查询"/>

### 运行查询 {#running-a-query}

要运行查询，请在 SQL 编辑器中输入您的 SQL 命令，然后单击“运行”按钮或使用快捷键 `cmd / ctrl + enter`。要逐个顺序编写和运行多个命令，请确保在每个命令后添加分号。

查询执行选项
默认情况下，单击运行按钮将运行 SQL 编辑器中包含的所有命令。SQL 控制台还支持另外两种查询执行选项：

- 运行选定的命令
- 运行光标处的命令

要运行选定的命令，请突出显示所需的命令或命令序列，然后单击“运行”按钮（或使用 `cmd / ctrl + enter` 快捷键）。当有选定内容时，您也可以从 SQL 编辑器上下文菜单中选择“运行选定”。

<Image img={run_selected_query} size="lg" border alt="界面显示如何运行 SQL 查询选定部分"/>

在当前位置运行光标处的命令有两种方法：

- 从扩展运行选项菜单中选择“在光标处”（或使用相应的 `cmd / ctrl + shift + enter` 快捷键）

<Image img={run_at_cursor_2} size="lg" border alt="扩展运行选项菜单中的光标处运行选项"/>

  - 从 SQL 编辑器上下文菜单中选择“在光标处运行”

<Image img={run_at_cursor} size="lg" border alt="SQL 编辑器上下文菜单中的光标处运行选项"/>

:::note
光标位置的命令在执行时将闪烁黄色。
:::

### 取消查询 {#canceling-a-query}

当查询正在运行时，查询编辑器工具栏中的“运行”按钮将被“取消”按钮替换。只需单击此按钮或按 `Esc` 键以取消查询。注意：任何已经返回的结果在取消后将持续存在。

<Image img={cancel_a_query} size="lg" border alt="查询执行期间出现的取消按钮"/>

### 保存查询 {#saving-a-query}

如果未提前命名，您的查询应称为“无标题查询”。单击查询名称以更改它。重命名查询将导致查询被保存。

<Image img={give_a_query_a_name} size="lg" border alt="界面显示如何将查询从无标题查询重命名"/>

您还可以使用保存按钮或 `cmd / ctrl + s` 快捷键来保存查询。

<Image img={save_the_query} size="lg" border alt="查询编辑器工具栏中的保存按钮"/>

## 使用 GenAI 管理查询 {#using-genai-to-manage-queries}

此功能允许用户将查询作为自然语言问题编写，并让查询控制台根据可用表的上下文创建 SQL 查询。GenAI 还可以帮助用户调试他们的查询。

有关 GenAI 的更多信息，请查看 [ClickHouse Cloud 中启动 GenAI 驱动的查询建议的博客文章](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud)。

### 表设置 {#table-setup}

让我们导入英国价格支付示例数据集，并用它来创建一些 GenAI 查询。

1. 打开一个 ClickHouse Cloud 服务。
1. 点击 _+_ 图标创建新查询。
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

   此查询应在大约 1 秒内完成。完成后，您应该有一个名为 `uk_price_paid` 的空表。

1. 创建一个新查询，并粘贴以下查询：

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

此查询从 `gov.uk` 网站获取数据集。此文件大小约为 4GB，因此此查询将花费几分钟才能完成。一旦 ClickHouse 处理了查询，您应该在 `uk_price_paid` 表中拥有整个数据集。

#### 查询创建 {#query-creation}

让我们使用自然语言创建一个查询。

1. 选择 **uk_price_paid** 表，然后单击 **创建查询**。
1. 单击 **生成 SQL**。您可能需要接受您的查询将发送到 Chat-GPT。您必须选择 **我同意** 以继续。
1. 现在您可以使用此提示输入一个自然语言查询，并让 ChatGPT 将其转换为 SQL 查询。在本例中，我们将输入：

   > 按年显示所有 uk_price_paid 交易的总价格和总数量。

1. 控制台将生成我们要查找的查询并在新标签中显示。在我们的示例中，GenAI 创建了以下查询：

```sql
-- Show me the total price and total number of all uk_price_paid transactions by year.
SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
FROM uk_price_paid
GROUP BY year(date)
```

1. 验证查询正确后，单击 **运行** 以执行它。

### 调试 {#debugging}

现在，让我们测试 GenAI 的查询调试功能。

1. 点击 _+_ 图标创建一个新查询，并粘贴以下代码：

```sql
-- Show me the total price and total number of all uk_price_paid transactions by year.
SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
FROM uk_price_paid
GROUP BY year(date)
```

1. 单击 **运行**。查询失败，因为我们试图从 `pricee` 获取值，而不是 `price`。
1. 单击 **修复查询**。
1. GenAI 将尝试修复查询。在这种情况下，它将 `pricee` 更改为 `price`。它还意识到 `toYear` 是在这种情况下使用的更好函数。
1. 选择 **应用** 以将建议的更改添加到您的查询，并单击 **运行**。

请记住，GenAI 是一项实验性功能。在针对任何数据集运行 GenAI 生成的查询时请务必小心。

## 高级查询功能 {#advanced-querying-features}

### 搜索查询结果 {#searching-query-results}

查询执行后，您可以使用结果窗格中的搜索输入快速搜索返回的结果集。此功能有助于预览额外的 `WHERE` 子句的结果，或简单地检查特定数据是否包含在结果集中。在搜索输入中输入一个值后，结果窗格将更新并返回包含与输入值匹配的条目的记录。在本例中，我们将查找 `hackernews` 表中包含 `ClickHouse` 的所有 `breakfast` 实例（不区分大小写）：

<Image img={search_hn} size="lg" border alt="搜索黑客新闻数据"/>

注意：任何匹配输入值的字段都会被返回。例如，上述截图中的第三条记录在 `by` 字段中不匹配 'breakfast'，但 `text` 字段是匹配的：

<Image img={match_in_body} size="lg" border alt="正文中的匹配"/>

### 调整分页设置 {#adjusting-pagination-settings}

默认情况下，查询结果窗格将在单个页面上显示每个结果记录。对于较大的结果集，可能更希望对结果进行分页以便于查看。这可以通过结果窗格右下角的分页选择器完成：

<Image img={pagination} size="lg" border alt="分页选项"/>

选择页面大小将立即对结果集应用分页，并在结果窗格底部中间出现导航选项

<Image img={pagination_nav} size="lg" border alt="分页导航"/>

### 导出查询结果数据 {#exporting-query-result-data}

查询结果集可以轻松导出为 CSV 格式，直接从 SQL 控制台完成。为此，请打开结果窗格工具栏右侧的 `•••` 菜单，然后选择“下载为 CSV”。

<Image img={download_as_csv} size="lg" border alt="下载为 CSV"/>

## 可视化查询数据 {#visualizing-query-data}

有些数据在图表形式中更易于被理解。您可以通过 SQL 控制台直接从查询结果数据快速创建可视化，只需几次点击。例如，我们将使用一个查询来计算纽约市出租车旅行的每周统计数据：

```sql
select
   toStartOfWeek(pickup_datetime) as week,
   sum(total_amount) as fare_total,
   sum(trip_distance) as distance_total,
   count(*) as trip_total
from
   nyc_taxi
group by
   1
order by
   1 asc
```

<Image img={tabular_query_results} size="lg" border alt="表格式查询结果"/>

没有可视化，这些结果很难理解。让我们将它们转换为图表。

### 创建图表 {#creating-charts}

要开始构建您的可视化，请从查询结果窗格工具栏中选择“图表”选项。将出现一个图表配置面板：

<Image img={switch_from_query_to_chart} size="lg" border alt="从查询切换到图表"/>

我们将首先创建一个简单的条形图，跟踪按周计算的 `trip_total`。要实现此目标，我们将把 `week` 字段拖到 x 轴，将 `trip_total` 字段拖到 y 轴：

<Image img={trip_total_by_week} size="lg" border alt="按周计算的旅行总数"/>

大多数图表类型支持多个字段在数值轴上。例如说明，我们将 `fare_total` 字段拖到 y 轴上：

<Image img={bar_chart} size="lg" border alt="条形图"/>

### 自定义图表 {#customizing-charts}

SQL 控制台支持的十种图表类型可以从图表配置面板中的图表类型选择器中选择。例如，我们可以轻松将上一个图表类型从条形图更改为面积图：

<Image img={change_from_bar_to_area} size="lg" border alt="从条形图更改为面积图"/>

图表标题与提供数据的查询名称匹配。更新查询名称将导致图表标题也更新：

<Image img={update_query_name} size="lg" border alt="更新查询名称"/>

在图表配置面板的“高级”部分中，还可以调整一些更高级的图表特性。首先，我们将调整以下设置：

- 副标题
- 轴标题
- x 轴的标签方向

我们的图表将相应更新：

<Image img={update_subtitle_etc} size="lg" border alt="更新副标题等信息"/>

在某些情况下，可能需要独立调整每个字段的轴刻度。这也可以在图表配置面板的“高级”部分完成，通过为轴范围指定最小值和最大值。例如，上述图表看起来不错，但为了展示我们的 `trip_total` 和 `fare_total` 字段之间的相关性，需要对轴范围进行一些调整：

<Image img={adjust_axis_scale} size="lg" border alt="调整轴刻度"/>

## 共享查询 {#sharing-queries}

SQL 控制台使您能够与团队共享查询。当查询被共享时，团队中的所有成员都可以查看和编辑该查询。共享查询是与团队协作的好方法。

要共享查询，请单击查询工具栏中的“共享”按钮。

<Image img={sql_console_share} size="lg" border alt="查询工具栏中的共享按钮"/>

将打开一个对话框，允许您与团队中的所有成员共享查询。如果您有多个团队，您可以选择与哪个团队共享查询。

<Image img={sql_console_edit_access} size="lg" border alt="编辑对共享查询的访问权限的对话框"/>

<Image img={sql_console_add_team} size="lg" border alt="为共享查询添加团队的界面"/>

<Image img={sql_console_edit_member} size="lg" border alt="编辑对共享查询的成员访问权限的界面"/>

在某些情况下，可能需要独立调整每个字段的轴刻度。这也可以在图表配置面板的“高级”部分完成，通过为轴范围指定最小值和最大值。例如，上述图表看起来不错，但为了展示我们的 `trip_total` 和 `fare_total` 字段之间的相关性，需要对轴范围进行一些调整：

<Image img={sql_console_access_queries} size="lg" border alt="查询列表中的与我共享的部分"/>
