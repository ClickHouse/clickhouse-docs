---
sidebar_label: 'SQL 控制台'
sidebar_position: 1
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
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

SQL 控制台是您在 ClickHouse Cloud 中探索和查询数据库的最快和最简单的方法。您可以使用 SQL 控制台来：

- 连接到您的 ClickHouse Cloud 服务
- 查看、过滤和排序表数据
- 执行查询并在几次点击中可视化结果数据
- 与团队成员共享查询，并更有效地协作。

## 探索表 {#exploring-tables}

### 查看表列表和架构信息 {#viewing-table-list-and-schema-info}

您 ClickHouse 实例中包含的表概述可以在左侧边栏区域找到。使用左侧栏顶部的数据库选择器查看特定数据库中的表。

<img src={table_list_and_schema} alt="表列表和架构"/>

列表中的表也可以展开以查看列和类型。

<img src={view_columns} alt="查看列"/>

### 探索表数据 {#exploring-table-data}

点击列表中的一个表以在新标签页中打开它。在表视图中，可以轻松查看、选择和复制数据。请注意，在将数据复制粘贴到 Microsoft Excel 和 Google 表格等电子表格应用程序时，结构和格式将得到保留。您可以使用页脚的导航在每 30 行的分页中翻转表数据的页面。

<img src={abc} alt="abc"/>

### 检查单元格数据 {#inspecting-cell-data}

单元格检查器工具可用于查看单个单元格中包含的大量数据。要打开它，请右键单击一个单元格并选择“检查单元格”。点击检查器内容右上角的复制图标可以复制单元格检查器的内容。

<img src={inspecting_cell_content} alt="检查单元格内容"/>

## 过滤和排序表 {#filtering-and-sorting-tables}

### 排序表 {#sorting-a-table}

要在 SQL 控制台中排序表，请打开一个表并选择工具栏中的“排序”按钮。此按钮将打开一个菜单，允许您配置排序。您可以选择一个列作为排序依据并配置排序顺序（升序或降序）。选择“应用”或按回车以对表进行排序。

<img src={sort_descending_on_column} alt="按列降序排序"/>

SQL 控制台还允许您向表中添加多个排序。再次点击“排序”按钮以添加另一项排序。注意：排序将按照它们在排序面板中的出现顺序（从上到下）应用。要移除一个排序，只需点击该排序旁边的“x”按钮。

### 过滤表 {#filtering-a-table}

要在 SQL 控制台中过滤表，请打开一个表并选择“过滤”按钮。与排序相似，此按钮将打开一个菜单，允许您配置过滤条件。您可以选择一个列作为过滤依据并选择必要的条件。SQL 控制台智能地显示与列中包含的数据类型相对应的过滤选项。

<img src={filter_on_radio_column_equal_gsm} alt="过滤在列上等于 GSM"/>

当您对过滤条件满意时，可以选择“应用”以过滤数据。您还可以添加更多过滤条件，如下所示。

<img src={add_more_filters} alt="添加大于 2000 的范围过滤器"/>

与排序功能类似，点击过滤器旁边的“x”按钮以移除它。

### 一起过滤和排序 {#filtering-and-sorting-together}

SQL 控制台允许您同时过滤和排序表。为此，使用上述步骤添加所有所需的过滤器和排序，然后点击“应用”按钮。

<img src={filtering_and_sorting_together} alt="一起过滤和排序"/>

### 从过滤器和排序创建查询 {#creating-a-query-from-filters-and-sorts}

SQL 控制台可以直接将您的排序和过滤转换为查询，只需一击。只需选择工具栏中的“创建查询”按钮，并配置您选择的排序和过滤参数。点击“创建查询”后，将打开一个新的查询标签，预填充对应于您表视图中数据的 SQL 命令。

<img src={create_a_query_from_sorts_and_filters} alt="从排序和过滤创建查询"/>

:::note
在使用“创建查询”功能时，过滤器和排序不是强制性的。
:::

您可以通过阅读 (链接) 查询文档来了解有关 SQL 控制台中查询的更多信息。

## 创建和运行查询 {#creating-and-running-a-query}

### 创建查询 {#creating-a-query}

在 SQL 控制台中，有两种方法可以创建新查询。

- 点击标签栏中的“+”按钮
- 从左侧边栏查询列表中选择“新建查询”按钮

<img src={creating_a_query} alt="创建查询"/>

### 运行查询 {#running-a-query}

要运行查询，请在 SQL 编辑器中输入您的 SQL 命令，并点击“运行”按钮或使用快捷键 `cmd / ctrl + enter`。要依次编写和运行多个命令，请确保在每个命令后添加分号。

查询执行选项
默认情况下，点击运行按钮将运行 SQL 编辑器中包含的所有命令。SQL 控制台支持两种其他查询执行选项：

- 运行选定的命令
- 在光标处运行命令

要运行选定的命令，请突出显示所需的命令或命令序列，单击“运行”按钮（或使用 `cmd / ctrl + enter` 快捷键）。当存在选择时，您还可以从 SQL 编辑器上下文菜单中选择“运行选定”。

<img src={run_selected_query} alt="运行选定的查询"/>

要在当前光标位置运行命令，可以通过以下两种方式实现：

- 从扩展运行选项菜单中选择“在光标处运行”（或使用相应的 `cmd / ctrl + shift + enter` 快捷键）

<img src={run_at_cursor_2} alt="在光标处运行"/>

  - 从 SQL 编辑器上下文菜单中选择“在光标处运行”

<img src={run_at_cursor} alt="在光标处运行"/>

:::note
光标位置上的命令将在执行时会闪烁黄色。
:::

### 取消查询 {#canceling-a-query}

在查询运行时，查询编辑器工具栏中的“运行”按钮将替换为“取消”按钮。只需点击此按钮或按 `Esc` 以取消查询。注意：已返回的任何结果在取消后仍将保留。

<img src={cancel_a_query} alt="取消查询"/>

### 保存查询 {#saving-a-query}

如果没有为您的查询命名，它应该被称为“未命名查询”。点击查询名称以更改它。重命名查询将导致查询被保存。

<img src={give_a_query_a_name} alt="给查询命名"/>

您还可以使用保存按钮或 `cmd / ctrl + s` 键盘快捷键来保存查询。

<img src={save_the_query} alt="保存查询"/>

## 使用 GenAI 管理查询 {#using-genai-to-manage-queries}

此功能允许用户将查询编写为自然语言问题，并让查询控制台根据可用表的上下文创建 SQL 查询。GenAI 还可以帮助用户调试查询。

有关 GenAI 的更多信息，请查看 [ClickHouse Cloud 博客文章中的 GenAI 驱动的查询建议](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud)。

### 表设置 {#table-setup}

让我们导入英国价格支付示例数据集，并使用它创建一些 GenAI 查询。

1. 打开一个 ClickHouse Cloud 服务。
1. 通过点击 _+_ 图标创建一个新查询。
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

   此查询应该花费大约 1 秒完成。完成后，您应该有一个名为 `uk_price_paid` 的空表。

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

此查询从 `gov.uk` 网站提取数据集。该文件大小约为 4GB，因此该查询将需要几分钟才能完成。完成后，ClickHouse 应该在 `uk_price_paid` 表中包含整个数据集。

#### 查询创建 {#query-creation}

让我们使用自然语言创建一个查询。

1. 选择 **uk_price_paid** 表，然后点击 **创建查询**。
1. 点击 **生成 SQL**。您可能会被要求接受您的查询发送给 Chat-GPT。您必须选择 **我同意** 以继续。
1. 现在，您可以使用此提示输入自然语言查询，并让 ChatGPT 将其转换为 SQL 查询。在此示例中，我们将输入：

   > 显示按年统计的所有 uk_price_paid 交易的总价格和交易总数。

1. 控制台将生成我们需要的查询并在新标签中显示。在我们的示例中，GenAI 创建了以下查询：

   ```sql
   -- 显示按年统计的所有 uk_price_paid 交易的总价格和交易总数。
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. 一旦您确认查询是正确的，点击 **运行** 以执行它。

### 调试 {#debugging}

现在，让我们测试 GenAI 的查询调试能力。

1. 通过点击 _+_ 图标创建一个新查询，并粘贴以下代码：

   ```sql
   -- 显示按年统计的所有 uk_price_paid 交易的总价格和交易总数。
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. 点击 **运行**。由于我们尝试获取 `pricee` 的值，而不是 `price`，所以查询失败。
1. 点击 **修复查询**。
1. GenAI 将尝试修复查询。在这种情况下，它将 `pricee` 更改为 `price`。它还意识到在这种情况下使用 `toYear` 是更好的函数。
1. 选择 **应用** 以将建议的更改添加到您的查询并点击 **运行**。

请记住，GenAI 是一个实验性功能。在针对任何数据集运行 GenAI 生成的查询时请谨慎。

## 高级查询功能 {#advanced-querying-features}

### 搜索查询结果 {#searching-query-results}

在查询执行后，您可以使用结果面板中的搜索输入快速搜索返回的结果集。此功能有助于预览附加 `WHERE` 子句的结果，或简单地检查特定数据是否包含在结果集中。在搜索输入中输入值后，结果面板将更新并返回包含匹配输入值的记录。在此示例中，我们将查找 `hackernews` 表中所有包含 `ClickHouse`（不区分大小写）的 `breakfast` 的实例：

<img src={search_hn} alt="搜索 Hacker News 数据"/>

注意：任何匹配输入值的字段都将被返回。例如，上述截图中的第三条记录在 `by` 字段中不匹配‘breakfast’，但在 `text` 字段中则匹配：

<img src={match_in_body} alt="在正文中匹配"/>

### 调整分页设置 {#adjusting-pagination-settings}

默认情况下，查询结果面板将显示所有结果记录在单个页面中。对于较大的结果集，分页结果以便于查看可能更为可取。这可以使用结果面板右下角的分页选择器完成：

<img src={pagination} alt="分页选项"/>

选择页面大小将立即应用分页到结果集，并在结果面板页脚中部出现导航选项。

<img src={pagination_nav} alt="分页导航"/>

### 导出查询结果数据 {#exporting-query-result-data}

查询结果集可以直接从 SQL 控制台轻松导出为 CSV 格式。为此，请打开结果面板工具栏右侧的 `•••` 菜单并选择“下载为 CSV”。

<img src={download_as_csv} alt="下载为 CSV"/>

## 可视化查询数据 {#visualizing-query-data}

某些数据在图表形式中更易于解释。您可以在 SQL 控制台中仅需几次点击即快速创建查询结果数据的可视化。例如，使用一个计算 NYC 出租车行程每周统计数据的查询：

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

<img src={tabular_query_results} alt="表格查询结果"/>

没有可视化，这些结果很难解释。让我们将其转化为图表。

### 创建图表 {#creating-charts}

要开始构建您的可视化，请从查询结果面板工具栏中选择“图表”选项。图表配置面板将出现：

<img src={switch_from_query_to_chart} alt="从查询切换到图表"/>

我们将开始创建一个简单的柱状图，以 `week` 为 `trip_total` 的跟踪。为此，我们将将 `week` 字段拖动到 x 轴，将 `trip_total` 字段拖动到 y 轴：

<img src={trip_total_by_week} alt="按周统计总行程"/>

大多数图表类型支持多个字段在数值轴上。为了演示，我们将把 `fare_total` 字段拖到 y 轴：

<img src={bar_chart} alt="柱状图"/>

### 自定义图表 {#customizing-charts}

SQL 控制台支持十种图表类型，可以从图表配置面板中的图表类型选择器选择。例如，我们可以轻松将先前的图表类型从柱状图更改为区域图：

<img src={change_from_bar_to_area} alt="从柱状图更改为区域图"/>

图表标题与提供数据的查询名称相匹配。更新查询的名称将导致图表标题更新：

<img src={update_query_name} alt="更新查询名称"/>

在图表配置面板的“高级”部分，许多更高级的图表特性也可以进行调整。首先，我们将调整以下设置：

- 副标题
- 轴标题
- x 轴标签方向

我们的图表将相应更新：

<img src={update_subtitle_etc} alt="更新副标题等."/>

在某些情况下，可能需要独立调整每个字段的轴刻度。这也可以通过指定轴范围的最小值和最大值来完成。例如，上述图表看起来不错，但为了展示 `trip_total` 和 `fare_total` 字段之间的相关性，轴范围需要一些调整：

<img src={adjust_axis_scale} alt="调整轴刻度"/>
