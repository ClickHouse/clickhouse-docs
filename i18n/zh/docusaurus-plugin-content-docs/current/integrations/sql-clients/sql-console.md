---
sidebar_label: 'SQL 控制台'
sidebar_position: 1
title: 'SQL 控制台'
slug: /integrations/sql-clients/sql-console
description: '了解 SQL 控制台'
doc_type: 'guide'
keywords: ['SQL 控制台', '查询界面', 'Web UI', 'SQL 编辑器', 'Cloud 控制台']
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

SQL 控制台是在 ClickHouse Cloud 中探索和查询数据库的最快、最简便方式。可以使用 SQL 控制台来：

- 连接到 ClickHouse Cloud 服务
- 查看、过滤和排序表数据
- 执行查询，并只需几次单击即可将结果数据可视化
- 与团队成员共享查询，更高效地协作

## 探索数据表 {#exploring-tables}

### 查看表列表和 schema 信息 {#viewing-table-list-and-schema-info}

您可以在左侧边栏查看 ClickHouse 实例中包含的表概览。使用左侧栏顶部的数据库选择器查看特定数据库中的表。

<Image img={table_list_and_schema} size="lg" border alt="表列表和 schema 视图，在左侧边栏中显示数据库表"/>

列表中的表也可以展开，以查看列及其类型。

<Image img={view_columns} size="lg" border alt="展开表视图，显示列名和数据类型"/>

### 浏览表数据 {#exploring-table-data}

点击列表中的某个表即可在新标签页中打开它。在 Table View 中，可以轻松查看、选择和复制数据。注意，将数据复制粘贴到 Microsoft Excel、Google Sheets 等电子表格应用时，其结构和格式都会被保留。可以使用页脚中的导航在各页表数据之间切换（每页包含 30 行数据）。

<Image img={abc} size="lg" border alt="显示可选择和复制数据的表视图"/>

### 检查单元格数据 {#inspecting-cell-data}

可以使用单元格检查器（Cell Inspector）工具查看单个单元格中包含的大量数据。要打开它，右键单击某个单元格并选择“Inspect Cell”。要复制单元格检查器中的内容，可以单击检查器内容右上角的复制图标。

<Image img={inspecting_cell_content} size="lg" border alt="单元格检查器对话框显示所选单元格的内容"/>

## 筛选和排序表 {#filtering-and-sorting-tables}

### 对表进行排序 {#sorting-a-table}

要在 SQL 控制台中对表进行排序，先打开表，然后在工具栏中点击 “Sort” 按钮。该按钮会打开一个菜单，你可以在其中配置排序。你可以选择用于排序的列，并设置排序顺序（升序或降序）。选择 “Apply” 或按 Enter 键即可对表进行排序。

<Image img={sort_descending_on_column} size="lg" border alt="排序对话框显示对某列进行降序排序的配置"/>

SQL 控制台还允许你为表添加多个排序条件。再次点击 “Sort” 按钮以添加另一个排序条件。注意：排序条件会按照它们在排序窗格中出现的顺序（从上到下）依次应用。要删除某个排序条件，只需点击该条件旁边的 “x” 按钮。

### 筛选表 {#filtering-a-table}

要在 SQL 控制台中筛选表，请打开一个表并选择 “Filter” 按钮。与排序类似，此按钮会打开一个菜单，用于配置筛选条件。你可以选择要用于筛选的列，并设置相应的条件。SQL 控制台会智能地显示与该列数据类型相匹配的筛选选项。

<Image img={filter_on_radio_column_equal_gsm} size="lg" border alt="筛选对话框显示将 radio 列筛选为等于 GSM 的配置"/>

当你对筛选条件满意时，可以选择 “Apply” 来应用筛选。你也可以像下面所示那样添加其他筛选条件。

<Image img={add_more_filters} size="lg" border alt="对话框显示如何添加大于 2000 的范围筛选条件"/>

与排序功能类似，单击筛选条件旁边的 “x” 按钮即可将其移除。

### 同时进行过滤和排序 {#filtering-and-sorting-together}

SQL 控制台支持同时对表进行过滤和排序。为此，请按照上文描述的步骤添加所有需要的过滤条件和排序规则，然后单击 “Apply” 按钮。

<Image img={filtering_and_sorting_together} size="lg" border alt="界面显示同时应用了过滤和排序"/>

### 从筛选器和排序创建查询 {#creating-a-query-from-filters-and-sorts}

SQL 控制台可以一键将你的排序和筛选直接转换为查询。只需在工具栏中选择所需的排序和筛选参数，然后点击 “Create Query” 按钮。点击 “Create Query” 后，会打开一个新的查询选项卡，并预先填充与当前表视图中数据对应的 SQL 命令。

<Image img={create_a_query_from_sorts_and_filters} size="lg" border alt="界面展示用于根据筛选器和排序生成 SQL 的 Create Query 按钮"/>

:::note
使用 “Create Query” 功能时，并不要求必须先设置筛选器和排序。
:::

你可以通过阅读 (link) 查询文档，进一步了解如何在 SQL 控制台中执行查询。

## 编写并运行查询 {#creating-and-running-a-query}

### 创建查询 {#creating-a-query}

在 SQL 控制台中，可以通过两种方式创建新查询：

- 点击标签栏中的 “+” 按钮
- 在左侧边栏的查询列表中点击 “New Query” 按钮

<Image img={creating_a_query} size="lg" border alt="界面展示如何通过 + 按钮或 New Query 按钮创建新查询"/>

### 运行查询 {#running-a-query}

要运行查询，请在 SQL 编辑器中输入 SQL 命令，然后单击 “Run” 按钮或使用快捷键 `cmd / ctrl + enter`。要按顺序编写并运行多个命令，请确保在每个命令后添加分号。

查询执行选项
默认情况下，单击 Run 按钮会运行 SQL 编辑器中包含的所有命令。SQL 控制台还支持另外两种查询执行方式：

- 运行选中的命令
- 在光标处运行命令

要运行选中的命令，先选中所需的命令或命令序列，然后单击 “Run” 按钮（或使用 `cmd / ctrl + enter` 快捷键）。当存在选中内容时，你也可以从 SQL 编辑器的上下文菜单中选择 “Run selected”（在编辑器任意位置右键单击打开）。

<Image img={run_selected_query} size="lg" border alt="展示如何运行选中部分 SQL 查询的界面"/>

在当前光标位置运行命令可以通过两种方式实现：

- 从扩展运行选项菜单中选择 “At Cursor”（或使用对应的 `cmd / ctrl + shift + enter` 键盘快捷键）

<Image img={run_at_cursor_2} size="lg" border alt="扩展运行选项菜单中的 Run at cursor 选项"/>

- 从 SQL 编辑器的上下文菜单中选择 “Run at cursor”

<Image img={run_at_cursor} size="lg" border alt="SQL Editor 上下文菜单中的 Run at cursor 选项"/>

:::note
光标位置处的命令在执行时会闪烁为黄色。
:::

### 取消查询 {#canceling-a-query}

当查询正在运行时，查询编辑器工具栏中的 “Run” 按钮会被 “Cancel” 按钮替换。只需点击此按钮或按下 `Esc` 即可取消查询。请注意：在取消之前已经返回的任何结果，在取消后仍会保留。

<Image img={cancel_a_query} size="lg" border alt="查询执行期间出现的取消按钮"/>

### 保存查询 {#saving-a-query}

如果尚未命名，你的查询名称会是“Untitled Query”。点击该查询名称即可修改。重命名查询时会自动保存该查询。

<Image img={give_a_query_a_name} size="lg" border alt="界面显示如何将查询从 Untitled Query 重命名"/>

你也可以使用保存按钮，或通过 `cmd / ctrl + s` 键盘快捷键来保存查询。

<Image img={save_the_query} size="lg" border alt="查询编辑器工具栏中的保存按钮"/>

## 使用 GenAI 管理查询 {#using-genai-to-manage-queries}

此功能使你能够以自然语言问题的形式编写查询，由查询控制台根据可用数据表的上下文自动生成相应的 SQL 查询。GenAI 还可以帮助你调试查询。

有关 GenAI 的更多信息，请参阅博客文章 [“Announcing GenAI powered query suggestions in ClickHouse Cloud”](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud)。

### 表设置 {#table-setup}

让我们导入英国房价支付示例数据集，并基于该数据集创建一些 GenAI 查询。

1. 打开一个 ClickHouse Cloud 服务实例。
1. 点击 _+_ 图标新建一个查询。
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

   该查询大约需要 1 秒完成。完成后，应当会得到一个名为 `uk_price_paid` 的空表。

1. 新建一个查询并粘贴以下查询：

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

此查询会从 `gov.uk` 网站获取数据集。该文件大小约为 4GB，因此此查询需要几分钟才能完成。ClickHouse 处理完该查询后，`uk_price_paid` 表中将包含完整的数据集。

#### 创建查询 {#query-creation}

让我们使用自然语言创建一个查询。

1. 选择 **uk_price_paid** 表，然后点击 **Create Query**。
1. 点击 **Generate SQL**。系统可能会提示你接受将查询发送到 Chat-GPT。你必须选择 **I agree** 才能继续。
1. 现在你可以在此输入框中输入自然语言查询，并让 ChatGPT 将其转换为 SQL 查询。在本示例中，我们将输入：

   > Show me the total price and total number of all uk_price_paid transactions by year.

1. 控制台会生成我们需要的查询，并在新选项卡中显示。在本示例中，GenAI 生成了如下查询：

   ```sql
   -- Show me the total price and total number of all uk_price_paid transactions by year.
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. 在你确认查询正确之后，点击 **Run** 来执行它。

### 调试 {#debugging}

现在，让我们测试一下 GenAI 的查询调试能力。

1. 点击 _+_ 图标创建一个新查询，并粘贴以下代码：

   ```sql
   -- Show me the total price and total number of all uk_price_paid transactions by year.
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. 点击 **Run**。查询会失败，因为我们试图从 `pricee` 而不是 `price` 获取值。
1. 点击 **Fix Query**。
1. GenAI 将尝试修复该查询。在这个例子中，它会将 `pricee` 改为 `price`，并且识别出在此场景中使用 `toYear` 函数会更合适。
1. 选择 **Apply**，将建议的更改应用到查询中，然后点击 **Run**。

请记住，GenAI 是一项实验性功能。在对任何数据集运行由 GenAI 生成的查询时请谨慎操作。

## 高级查询功能 {#advanced-querying-features}

### 搜索查询结果 {#searching-query-results}

在执行完查询后，你可以使用结果面板中的搜索框快速搜索返回的结果集。此功能有助于预览再添加一个 `WHERE` 子句后的结果，或者仅用于检查特定数据是否包含在结果集中。将某个值输入到搜索框后，结果面板会更新并返回包含与该输入值匹配内容的记录。在本示例中，我们将查找 `hackernews` 表中，所有评论内容（不区分大小写）包含 `ClickHouse` 且出现 `breakfast` 的记录：

<Image img={search_hn} size="lg" border alt="搜索 Hacker News 数据"/>

注意：只要有任一字段匹配输入的值，该记录就会被返回。例如，上述截图中的第三条记录在 `by` 字段中并不匹配 “breakfast”，但在 `text` 字段中匹配到了：

<Image img={match_in_body} size="lg" border alt="在正文中匹配"/>

### 调整分页设置 {#adjusting-pagination-settings}

默认情况下，查询结果面板会在单个页面上显示所有结果记录。对于较大的结果集，为了便于查看，可以将结果分页显示。可以使用结果面板右下角的分页选择器来完成此操作：

<Image img={pagination} size="lg" border alt="分页选项"/>

选择页面大小后，会立即对结果集启用分页，导航选项会显示在结果面板页脚的中间位置。

<Image img={pagination_nav} size="lg" border alt="分页导航"/>

### 导出查询结果数据 {#exporting-query-result-data}

在 SQL 控制台中，可以将查询结果集直接导出为 CSV 格式。点击结果面板工具栏右侧的 `•••` 菜单，然后选择“Download as CSV”。

<Image img={download_as_csv} size="lg" border alt="Download as CSV"/>

## 可视化查询数据 {#visualizing-query-data}

有些数据以图表形式呈现更易于理解。你可以在 SQL 控制台中，只需点击几下，就能直接基于查询结果数据快速创建可视化图表。作为示例，我们将使用一个计算纽约市出租车行程每周统计数据的查询：

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

如果不进行可视化，这些结果就很难理解。让我们把它们可视化成图表。


### 创建图表 {#creating-charts}

要开始构建可视化图表，请在查询结果面板的工具栏中选择 “Chart” 选项。此时会出现图表配置面板：

<Image img={switch_from_query_to_chart} size="lg" border alt="从查询切换到图表"/>

我们先创建一个简单的柱状图，用于按 `week` 跟踪 `trip_total`。为此，将 `week` 字段拖到 x 轴，将 `trip_total` 字段拖到 y 轴：

<Image img={trip_total_by_week} size="lg" border alt="按周统计行程总额"/>

大多数图表类型都支持在数值轴上放置多个字段。作为演示，我们将 `fare_total` 字段拖到 y 轴上：

<Image img={bar_chart} size="lg" border alt="柱状图"/>

### 自定义图表 {#customizing-charts}

SQL 控制台支持十种图表类型，可在图表配置面板中的图表类型选择器中进行选择。比如，我们可以轻松地将前一个图表的类型从 Bar 更改为 Area：

<Image img={change_from_bar_to_area} size="lg" border alt="从 Bar 图表更改为 Area"/>

图表标题与提供数据的查询名称一致。更新查询名称时，图表标题也会随之更新：

<Image img={update_query_name} size="lg" border alt="更新查询名称"/>

在图表配置面板的“Advanced”部分，还可以调整更多高级图表特性。首先，我们将调整以下设置：

- 副标题
- 坐标轴标题
- x 轴标签的方向

图表会相应更新：

<Image img={update_subtitle_etc} size="lg" border alt="更新副标题等"/>

在某些情况下，可能需要为每个字段分别调整坐标轴刻度。这同样可以在图表配置面板的“Advanced”部分中，通过为坐标轴范围指定最小值和最大值来实现。比如，上面的图表整体看起来不错，但为了展示 `trip_total` 和 `fare_total` 字段之间的相关性，需要对坐标轴范围做一些调整：

<Image img={adjust_axis_scale} size="lg" border alt="调整坐标轴刻度"/>

## 共享查询 {#sharing-queries}

SQL 控制台允许你与团队共享查询。查询被共享后，团队的所有成员都可以查看并编辑该查询。共享查询是与你的团队协作的高效方式。

要共享查询，请点击查询工具栏中的 “Share” 按钮。

<Image img={sql_console_share} size="lg" border alt="查询工具栏中的 Share 按钮"/>

此时会打开一个对话框，你可以将该查询共享给某个团队的所有成员。如果你属于多个团队，可以选择要将查询共享给哪个团队。

<Image img={sql_console_edit_access} size="lg" border alt="用于编辑共享查询访问权限的对话框"/>

<Image img={sql_console_add_team} size="lg" border alt="将团队添加到共享查询的界面"/>

<Image img={sql_console_edit_member} size="lg" border alt="编辑共享查询成员访问权限的界面"/>

在某些场景下，可能需要为每个字段单独调整坐标轴刻度。这也可以在图表配置面板的 “Advanced” 部分中，通过为坐标轴范围指定最小值和最大值来实现。比如，上述图表虽然整体不错，但为了更好地展示 `trip_total` 和 `fare_total` 字段之间的相关性，需要对坐标轴范围做一些调整：

<Image img={sql_console_access_queries} size="lg" border alt="查询列表中的 Shared with me 区域"/>