---
sidebar_label: 'SQL 控制台'
sidebar_position: 1
title: 'SQL 控制台'
slug: /integrations/sql-clients/sql-console
description: '了解 SQL 控制台'
doc_type: '指南'
keywords: ['SQL 控制台', '查询界面', 'Web UI', 'SQL 编辑器', '云控制台']
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


# SQL 控制台 {#sql-console}

SQL 控制台是在 ClickHouse Cloud 中探索和查询数据库的最快、最简便方式。您可以使用 SQL 控制台：

- 连接到 ClickHouse Cloud 服务
- 查看、筛选和排序表数据
- 只需几次点击即可执行查询并将结果数据可视化
- 与团队成员共享查询，从而更高效地协作



## 浏览数据表 {#exploring-tables}

### 查看数据表列表和表结构信息 {#viewing-table-list-and-schema-info}

可以在左侧边栏区域查看 ClickHouse 实例中包含的数据表概览。使用左侧顶部的数据库选择器查看特定数据库中的数据表。

<Image img={table_list_and_schema} size="lg" border alt="左侧边栏中显示数据库表的数据表列表和表结构视图"/>

列表中的数据表也可以展开，以查看列及其数据类型。

<Image img={view_columns} size="lg" border alt="展开的数据表视图，显示列名和数据类型"/>

### 浏览表数据 {#exploring-table-data}

单击列表中的某个数据表，会在新标签页中打开该表。在表视图中，可以方便地查看、选择和复制数据。注意，当复制并粘贴到 Microsoft Excel、Google Sheets 等电子表格应用程序时，其结构和格式会被保留。您可以使用页脚中的导航在表数据分页之间切换（每页 30 行）。

<Image img={abc} size="lg" border alt="表视图显示可被选择和复制的数据"/>

### 检查单元格数据 {#inspecting-cell-data}

可以使用单元格检查器工具查看单个单元格中包含的大量数据。要打开它，请右键单击某个单元格并选择“Inspect Cell”。可以通过单击检查器内容右上角的复制图标来复制单元格检查器中的内容。

<Image img={inspecting_cell_content} size="lg" border alt="单元格检查器对话框显示所选单元格的内容"/>



## 筛选和排序表格 {#filtering-and-sorting-tables}

### 排序表格 {#sorting-a-table}

要在 SQL 控制台中对表格进行排序，打开一个表并选择工具栏中的“Sort”按钮。此按钮会打开一个菜单，用于配置排序方式。你可以选择要按其排序的列，并配置排序顺序（升序或降序）。选择“Apply”或按 Enter 键即可对表格进行排序。

<Image img={sort_descending_on_column} size="lg" border alt="排序对话框显示在某列上配置降序排序"/>

SQL 控制台还允许你为表格添加多个排序条件。再次单击“Sort”按钮可添加另一个排序条件。注意：排序条件会按它们在排序面板中出现的顺序（自上而下）依次应用。要移除某个排序条件，只需单击该排序条件旁边的“x”按钮。

### 筛选表格 {#filtering-a-table}

要在 SQL 控制台中对表格进行筛选，打开一个表并选择“Filter”按钮。与排序类似，此按钮会打开一个菜单，用于配置筛选条件。你可以选择要根据其进行筛选的列，并选择所需的条件。SQL 控制台会智能显示与该列中数据类型相对应的筛选选项。

<Image img={filter_on_radio_column_equal_gsm} size="lg" border alt="筛选对话框显示对 radio 列配置等于 GSM 的筛选条件"/>

当你对筛选条件满意后，可以选择“Apply”来应用筛选。你还可以像下面所示那样添加额外的筛选条件。

<Image img={add_more_filters} size="lg" border alt="对话框显示如何添加一个大于 2000 的范围额外筛选条件"/>

与排序功能类似，单击筛选条件旁边的“x”按钮即可将其移除。

### 同时进行筛选和排序 {#filtering-and-sorting-together}

SQL 控制台允许你同时对表格进行筛选和排序。要实现这一点，请使用上述步骤添加所有需要的筛选条件和排序条件，然后单击“Apply”按钮。

<Image img={filtering_and_sorting_together} size="lg" border alt="界面显示同时应用筛选和排序"/>

### 从筛选和排序创建查询 {#creating-a-query-from-filters-and-sorts}

SQL 控制台可以一键将当前的排序和筛选条件转换为查询。只需在配置好所需排序和筛选参数后，从工具栏中选择“Create Query”按钮。单击“Create query”后，将打开一个新的查询选项卡，并预先填充与当前表视图中数据相对应的 SQL 命令。

<Image img={create_a_query_from_sorts_and_filters} size="lg" border alt="界面显示 Create Query 按钮，它会根据筛选和排序生成 SQL"/>

:::note
在使用“Create Query”功能时，筛选和排序并不是必需的。
:::

你可以通过阅读 (link) 查询文档来进一步了解如何在 SQL 控制台中编写查询。



## 创建和运行查询 {#creating-and-running-a-query}

### 创建查询 {#creating-a-query}

在 SQL 控制台中有两种方式创建新查询：

- 点击标签栏中的 “+” 按钮
- 在左侧边栏的查询列表中选择 “New Query” 按钮

<Image img={creating_a_query} size="lg" border alt="界面展示如何通过 + 按钮或 New Query 按钮创建新查询"/>

### 运行查询 {#running-a-query}

要运行查询，在 SQL 编辑器中输入 SQL 命令，然后点击 “Run” 按钮，或使用快捷键 `cmd / ctrl + enter`。若要顺序编写并运行多个命令，请确保在每个命令后添加分号。

查询执行选项  
默认情况下，点击 “Run” 按钮会运行 SQL 编辑器中包含的所有命令。SQL 控制台还支持另外两种查询执行选项：

- 运行选中的命令
- 运行光标所在的命令

要运行选中的命令，先选中所需的单个命令或一系列命令，然后点击 “Run” 按钮（或使用 `cmd / ctrl + enter` 快捷键）。当存在选中内容时，你也可以从 SQL 编辑器的上下文菜单中选择 “Run selected”（在编辑器任意位置右键打开菜单）。

<Image img={run_selected_query} size="lg" border alt="界面展示如何运行选中的部分 SQL 查询"/>

在当前光标位置运行命令可以通过两种方式实现：

- 从扩展运行选项菜单中选择 “At Cursor”（或使用对应的 `cmd / ctrl + shift + enter` 键盘快捷键）

<Image img={run_at_cursor_2} size="lg" border alt="扩展运行选项菜单中的 Run at cursor 选项"/>

- 在 SQL 编辑器的上下文菜单中选择 “Run at cursor”

<Image img={run_at_cursor} size="lg" border alt="SQL Editor 上下文菜单中的 Run at cursor 选项"/>

:::note
执行时，光标所在位置的命令会短暂闪烁为黄色。
:::

### 取消查询 {#canceling-a-query}

当查询正在运行时，Query Editor 工具栏中的 “Run” 按钮会被 “Cancel” 按钮替换。只需点击此按钮或按下 `Esc` 即可取消查询。注意：任何已经返回的结果在取消后都会保留。

<Image img={cancel_a_query} size="lg" border alt="查询执行期间出现的 Cancel 按钮"/>

### 保存查询 {#saving-a-query}

如果之前没有命名，你的查询名称会显示为 “Untitled Query”。点击该名称即可对其重命名。重命名查询会触发保存该查询。

<Image img={give_a_query_a_name} size="lg" border alt="界面展示如何将查询从 Untitled Query 重命名"/>

你也可以使用保存按钮或 `cmd / ctrl + s` 键盘快捷键来保存查询。

<Image img={save_the_query} size="lg" border alt="Query Editor 工具栏中的保存按钮"/>



## 使用 GenAI 管理查询 {#using-genai-to-manage-queries}

此功能允许用户以自然语言问题的形式编写查询，由查询控制台根据可用数据表的上下文生成 SQL 查询。GenAI 还可以帮助用户调试查询。

有关 GenAI 的更多信息，请参阅博文：[Announcing GenAI powered query suggestions in ClickHouse Cloud](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud)。

### 表准备 {#table-setup}

我们来导入英国房价支付示例数据集，并用它来创建一些 GenAI 查询。

1. 打开一个 ClickHouse Cloud 服务。
1. 点击 _+_ 图标创建一个新查询。
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

   此查询大约需要 1 秒完成。完成后，您应当会得到一个名为 `uk_price_paid` 的空表。

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

此查询会从 `gov.uk` 网站获取数据集。该文件大小约为 4GB，因此该查询将需要几分钟才能完成。ClickHouse 处理完查询后，您应该会在 `uk_price_paid` 表中获得整个数据集。

#### 查询创建 {#query-creation}

我们来使用自然语言创建一个查询。

1. 选择 **uk_price_paid** 表，然后点击 **Create Query**。
1. 点击 **Generate SQL**。系统可能会要求您接受将查询发送到 ChatGPT。您必须选择 **I agree** 才能继续。
1. 现在您可以在此提示框中输入自然语言查询，并让 ChatGPT 将其转换为 SQL 查询。本示例中我们将输入：

   > Show me the total price and total number of all uk_price_paid transactions by year.

1. 控制台会生成我们所需的查询，并将其展示在一个新标签页中。在我们的示例中，GenAI 生成了如下查询：

   ```sql
   -- Show me the total price and total number of all uk_price_paid transactions by year.
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. 在您确认查询正确后，点击 **Run** 执行它。

### 调试 {#debugging}

现在，我们来测试 GenAI 的查询调试能力。

1. 点击 _+_ 图标创建一个新查询，并粘贴以下代码：



```sql
   -- 按年份显示 uk_price_paid 表中所有交易的总价格和总交易数。
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
```

1. 点击 **Run**。查询会失败，因为我们尝试从 `pricee` 而不是 `price` 中获取值。
2. 点击 **Fix Query**。
3. GenAI 会尝试修复查询。在这个例子中，它将 `pricee` 修改为 `price`，并判断在这种场景下使用 `toYear` 是更合适的函数。
4. 选择 **Apply** 将建议的更改应用到查询中，然后点击 **Run**。

请注意，GenAI 是一项实验性功能。在对任何数据集运行由 GenAI 生成的查询时，请务必谨慎。


## 高级查询功能 {#advanced-querying-features}

### 搜索查询结果 {#searching-query-results}

在查询执行完成后，可以使用结果面板中的搜索框快速检索返回的结果集。此功能有助于预览新增 `WHERE` 子句的结果，或简单检查结果集中是否包含特定数据。向搜索框中输入值后，结果面板会更新并返回包含与输入值匹配条目的记录。在此示例中，我们将在 `hackernews` 表中查找所有评论内容包含 `ClickHouse`（不区分大小写）且出现 `breakfast` 的记录：

<Image img={search_hn} size="lg" border alt="搜索 Hacker News 数据"/>

注意：只要任意字段中匹配输入值，该记录都会被返回。例如，上方截图中的第三条记录在 `by` 字段中并不匹配 `breakfast`，但在 `text` 字段中匹配到了：

<Image img={match_in_body} size="lg" border alt="在正文中匹配"/>

### 调整分页设置 {#adjusting-pagination-settings}

默认情况下，查询结果面板会在单个页面上显示所有结果记录。对于较大的结果集，为了更便于查看，可能希望对结果进行分页。可以使用结果面板右下角的分页选择器来完成此操作：

<Image img={pagination} size="lg" border alt="分页选项"/>

选择页面大小后，分页会立即应用到结果集，并且导航选项会显示在结果面板页脚的中间位置。

<Image img={pagination_nav} size="lg" border alt="分页导航"/>

### 导出查询结果数据 {#exporting-query-result-data}

可以直接在 SQL 控制台中将查询结果集轻松导出为 CSV 格式。为此，在结果面板工具栏右侧打开 `•••` 菜单，然后选择“Download as CSV”。

<Image img={download_as_csv} size="lg" border alt="下载为 CSV"/>



## 可视化查询数据 {#visualizing-query-data}

某些数据以图表形式展示会更易于理解。你可以在 SQL 控制台中直接基于查询结果数据快速创建可视化，只需几次点击。作为示例，我们将使用一个查询来计算纽约市出租车行程的每周统计信息：

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

<Image img={tabular_query_results} size="lg" border alt="表格查询结果" />

在没有可视化的情况下，这些结果很难理解和分析。我们将它们转换成图表。

### 创建图表 {#creating-charts}

要开始构建可视化，请在查询结果面板的工具栏中选择 “Chart” 选项。此时会显示图表配置面板：

<Image img={switch_from_query_to_chart} size="lg" border alt="从查询切换到图表" />

我们先创建一个按 `week` 跟踪 `trip_total` 的简单柱状图。为此，将 `week` 字段拖到 x 轴，将 `trip_total` 字段拖到 y 轴：

<Image img={trip_total_by_week} size="lg" border alt="按周统计行程总额" />

大多数图表类型都支持在数值轴上放置多个字段。为演示这一点，我们将 `fare_total` 字段再拖到 y 轴上：

<Image img={bar_chart} size="lg" border alt="柱状图" />

### 自定义图表 {#customizing-charts}

SQL 控制台支持十种图表类型，可以在图表配置面板中的图表类型选择器中进行选择。例如，我们可以轻松地将前面的图表类型从柱状图 (Bar) 更改为面积图 (Area)：

<Image img={change_from_bar_to_area} size="lg" border alt="从柱状图更改为面积图" />

图表标题与提供数据的查询名称一致。更新查询名称时，图表标题也会随之更新：

<Image img={update_query_name} size="lg" border alt="更新查询名称" />

在图表配置面板的 “Advanced” 部分中，还可以调整许多更高级的图表特性。首先，我们将调整以下设置：

* 副标题
* 轴标题
* x 轴的标签方向

图表会相应更新：

<Image img={update_subtitle_etc} size="lg" border alt="更新副标题等" />

在某些情况下，可能需要分别调整每个字段的坐标轴范围。这也可以在图表配置面板的 “Advanced” 部分中，通过为轴范围指定最小值和最大值来实现。比如，上面的图表已经不错，但为了更好地展示 `trip_total` 和 `fare_total` 字段之间的相关性，需要对轴范围稍作调整：

<Image img={adjust_axis_scale} size="lg" border alt="调整坐标轴刻度" />


## 共享查询 {#sharing-queries}

SQL 控制台支持你与团队共享查询。查询一旦共享，团队的所有成员都可以查看和编辑该查询。共享查询是与团队协作的有效方式。

要共享查询，请单击查询工具栏中的 “Share” 按钮。

<Image img={sql_console_share} size="lg" border alt="查询工具栏中的 Share 按钮"/>

此时会弹出一个对话框，你可以在其中将查询共享给某个团队的所有成员。如果你隶属于多个团队，可以选择要将查询共享给哪个团队。

<Image img={sql_console_edit_access} size="lg" border alt="用于编辑共享查询访问权限的对话框"/>

<Image img={sql_console_add_team} size="lg" border alt="用于向共享查询添加团队的界面"/>

<Image img={sql_console_edit_member} size="lg" border alt="用于编辑成员对共享查询访问权限的界面"/>

在某些情况下，可能需要分别调整每个字段的坐标轴刻度。你也可以在图表配置面板的 “Advanced” 部分，通过为坐标轴范围指定最小值和最大值来实现这一点。例如，上面的图表整体效果不错，但为了更好地展示 `trip_total` 和 `fare_total` 字段之间的相关性，需要对坐标轴范围进行一些调整：

<Image img={sql_console_access_queries} size="lg" border alt="查询列表中“Shared with me（与我共享）”部分"/>
