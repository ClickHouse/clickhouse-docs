---
sidebar_label: 'SQL 控制台'
sidebar_position: 1
title: 'SQL 控制台'
slug: /integrations/sql-clients/sql-console
description: '了解 SQL 控制台'
doc_type: 'guide'
keywords: ['sql 控制台', '查询界面', 'Web UI', 'sql 编辑器', '云控制台']
integration:
   - support_level: 'community'
   - category: 'sql_client'
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


# SQL 控制台 \{#sql-console\}

SQL 控制台是在 ClickHouse Cloud 中探索和查询数据库的最快且最简便的方式。您可以使用 SQL 控制台来：

- 连接到您的 ClickHouse Cloud 服务
- 查看、过滤和排序表数据
- 执行查询，并只需点击几下即可可视化结果数据
- 与团队成员共享查询并更高效地协作。

## 浏览表 \{#exploring-tables\}

### 查看表列表和表结构信息 \{#viewing-table-list-and-schema-info\}

您可以在左侧边栏查看 ClickHouse 实例中包含的表的概览。使用左侧边栏顶部的数据库选择器来查看特定数据库中的表。

<Image img={table_list_and_schema} size="lg" border alt="左侧边栏中显示数据库表的表列表和表结构视图"/>

列表中的表也可以展开，以查看其列和数据类型。

<Image img={view_columns} size="lg" border alt="展开的表视图，显示列名和数据类型"/>

### 浏览表数据 \{#exploring-table-data\}

点击列表中的某个表，在新标签页中打开它。在表视图中，可以方便地查看、选择和复制数据。请注意，将数据复制并粘贴到 Microsoft Excel、Google Sheets 等电子表格应用时，其结构和格式会被保留。你可以使用页脚中的导航在表数据的各个页面之间切换（分页步长为每 30 行）。

<Image img={abc} size="lg" border alt="表视图展示了可选择和复制的数据"/>

### 检查单元格数据 \{#inspecting-cell-data\}

可以使用单元格检查器工具（Cell Inspector）查看单个单元格中包含的大量数据。要打开它，右键单击某个单元格并选择“Inspect Cell”。通过单击检查器内容右上角的复制图标即可复制单元格检查器中的内容。

<Image img={inspecting_cell_content} size="lg" border alt="显示所选单元格内容的单元格检查器对话框"/>

## 表的筛选和排序 \{#filtering-and-sorting-tables\}

### 对表进行排序 \{#sorting-a-table\}

要在 SQL 控制台中对表排序，先打开一个表，然后在工具栏中单击 “Sort” 按钮。此按钮会打开一个菜单，你可以在其中配置排序条件。你可以选择用于排序的列，并设置排序顺序（升序或降序）。选择 “Apply” 或按 Enter 键即可对表进行排序。

<Image img={sort_descending_on_column} size="lg" border alt="Sort 对话框显示了对某列进行降序排序的配置"/>

SQL 控制台还允许你为一个表添加多个排序条件。再次单击 “Sort” 按钮以添加另一个排序条件。注意：排序会按照它们在排序面板中出现的顺序（从上到下）应用。要删除某个排序条件，只需单击该排序旁边的 “x” 按钮。

### 筛选表格 \{#filtering-a-table\}

要在 SQL 控制台中筛选表格，打开一个表并选择“Filter”按钮。与排序类似，此按钮会打开一个菜单，用于配置筛选条件。你可以选择要筛选的列，并设置相应的条件。SQL 控制台会智能地显示与该列数据类型相对应的筛选选项。

<Image img={filter_on_radio_column_equal_gsm} size="lg" border alt="筛选对话框，展示如何配置筛选条件以筛选单选列等于 GSM 的记录"/>

当你对筛选条件满意时，可以选择“Apply”来应用筛选数据。你也可以像下图所示添加额外的筛选条件。

<Image img={add_more_filters} size="lg" border alt="对话框展示如何添加一个大于 2000 的范围额外筛选条件"/>

与排序功能类似，点击筛选条件旁边的“x”按钮即可将其移除。

### 同时进行筛选和排序 \{#filtering-and-sorting-together\}

SQL 控制台允许你同时对表进行筛选和排序。为此，请按照上文所述的步骤添加所有需要的筛选条件和排序规则，然后单击 “Apply” 按钮。

<Image img={filtering_and_sorting_together} size="lg" border alt="界面同时展示已应用的筛选和排序"/>

### 通过过滤和排序创建查询 \{#creating-a-query-from-filters-and-sorts\}

SQL 控制台可以一键将你的排序和过滤直接转换为查询。只需在工具栏中，使用所需的排序和过滤参数，选择 “Create Query（创建查询）” 按钮即可。单击 “Create Query” 后，将会打开一个新的查询选项卡，并预先填充与你的表视图中数据相对应的 SQL 命令。

<Image img={create_a_query_from_sorts_and_filters} size="lg" border alt="界面显示 Create Query 按钮，可根据过滤和排序生成 SQL"/>

:::note
使用 “Create Query” 功能时，并不要求必须先设置过滤和排序。
:::

你可以通过阅读 (link) 查询文档，进一步了解在 SQL 控制台中执行查询的相关内容。

## 编写并运行查询 \{#creating-and-running-a-query\}

### 创建查询 \{#creating-a-query\}

在 SQL 控制台中，新建查询有两种方式：

- 点击标签栏中的 “+” 按钮
- 在左侧边栏的查询列表中选择 “New Query” 按钮

<Image img={creating_a_query} size="lg" border alt="界面展示如何通过 “+” 按钮或 “New Query” 按钮新建查询"/>

### 运行查询 \{#running-a-query\}

要运行查询，在 SQL 编辑器中输入 SQL 命令，然后单击 “Run” 按钮，或使用快捷键 `cmd / ctrl + enter`。要按顺序编写并运行多个命令，请确保在每个命令后添加分号。

查询执行选项  
默认情况下，单击 “Run” 按钮会运行 SQL 编辑器中包含的所有命令。SQL 控制台还支持另外两种查询执行选项：

- 运行选中命令
- 运行光标所在命令

要运行选中命令，高亮选中所需的命令或命令序列，然后单击 “Run” 按钮（或使用快捷键 `cmd / ctrl + enter`）。当存在选中内容时，你也可以从 SQL 编辑器的上下文菜单中选择 “Run selected”（通过在编辑器任意位置右键打开）。

<Image img={run_selected_query} size="lg" border alt="展示如何运行选中的 SQL 查询片段的界面"/>

运行当前光标位置的命令可以通过两种方式实现：

- 从扩展运行选项菜单中选择 “At Cursor”（或使用对应的键盘快捷键 `cmd / ctrl + shift + enter`）

<Image img={run_at_cursor_2} size="lg" border alt="扩展运行选项菜单中的 Run at cursor 选项"/>

- 从 SQL 编辑器上下文菜单中选择 “Run at cursor”

<Image img={run_at_cursor} size="lg" border alt="SQL 编辑器上下文菜单中的 Run at cursor 选项"/>

:::note
光标所在位置的命令在执行时会闪烁为黄色。
:::

### 取消查询 \{#canceling-a-query\}

当查询正在运行时，查询编辑器工具栏中的 “Run” 按钮会变为 “Cancel” 按钮。点击该按钮或按下 `Esc` 键即可取消查询。注意：在取消之前已返回的任何结果将会保留。

<Image img={cancel_a_query} size="lg" border alt="查询执行期间显示的取消按钮"/>

### 保存查询 \{#saving-a-query\}

如果之前没有命名，你的查询会被命名为 “Untitled Query”。点击查询名称即可修改它。重命名查询将会保存该查询。

<Image img={give_a_query_a_name} size="lg" border alt="展示如何将查询从 Untitled Query 重命名的界面"/>

你也可以使用保存按钮或 `cmd / ctrl + s` 键盘快捷键来保存查询。

<Image img={save_the_query} size="lg" border alt="查询编辑器工具栏中的保存按钮"/>

## 使用 GenAI 管理查询 \{#using-genai-to-manage-queries\}

此功能允许您以自然语言问题的形式编写查询，由查询控制台根据可用数据表的上下文生成 SQL 查询。GenAI 还可以帮助您调试查询。

有关 GenAI 的更多信息，请参阅博客文章：[在 ClickHouse Cloud 中推出由 GenAI 驱动的查询建议](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud)。

### 表准备 \{#table-setup\}

我们来导入英国房价支付（UK Price Paid）示例数据集，并用它来创建一些 GenAI 查询。

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

   此查询大约需要 1 秒钟完成。完成后，你应该会得到一个名为 `uk_price_paid` 的空表。

1. 创建一个新查询，并粘贴以下查询语句：

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

此查询会从 `gov.uk` 网站获取该数据集。该文件大小约为 4 GB，因此此查询需要几分钟才能完成。一旦 ClickHouse 处理完查询，你就会在 `uk_price_paid` 表中获得完整的数据集。

#### 创建查询 \{#query-creation\}

让我们使用自然语言来创建一个查询。

1. 选择 **uk_price_paid** 表，然后点击 **Create Query**。
1. 点击 **Generate SQL**。系统可能会要求您接受将查询发送给 Chat-GPT。您必须选择 **I agree** 才能继续。
1. 现在，您可以在该提示中输入自然语言查询，由 ChatGPT 将其转换为 SQL 查询。在此示例中，我们将输入：

   > Show me the total price and total number of all uk_price_paid transactions by year.

1. 控制台将生成所需的查询，并在新标签页中显示。在我们的示例中，GenAI 创建了以下查询：

   ```sql
   -- Show me the total price and total number of all uk_price_paid transactions by year.
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. 在确认查询正确后，点击 **Run** 执行它。

### 调试 \{#debugging\}

现在，让我们测试 GenAI 的查询调试能力。

1. 点击 _+_ 图标创建一个新查询，并粘贴以下代码：

   ```sql
   -- Show me the total price and total number of all uk_price_paid transactions by year.
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. 点击 **Run**。查询会失败，因为我们尝试从 `pricee` 而不是 `price` 中获取值。
1. 点击 **Fix Query**。
1. GenAI 会尝试修复查询。在这个示例中，它将 `pricee` 修改为 `price`，并识别出在这种场景下使用 `toYear` 是更合适的函数。
1. 选择 **Apply** 将建议的更改应用到查询中，然后点击 **Run**。

请记住，GenAI 是一项实验性功能。在针对任何数据集运行由 GenAI 生成的查询时，请务必谨慎。

## 高级查询功能 \{#advanced-querying-features\}

### 搜索查询结果 \{#searching-query-results\}

在查询执行完成后，可以使用结果面板中的搜索输入框快速搜索返回的结果集。该功能有助于预览额外 `WHERE` 子句的结果，或者简单检查结果集中是否包含特定数据。将值输入搜索框后，结果面板会更新，只返回包含与输入值匹配内容的记录。在下面的示例中，我们将查找 `hackernews` 表中所有评论内容中包含 `ClickHouse`（不区分大小写）且包含 `breakfast` 的记录：

<Image img={search_hn} size="lg" border alt="搜索 Hacker News 数据"/>

注意：任何字段中只要有与输入值匹配的内容，都会被返回。例如，上面截图中的第三条记录在 `by` 字段中不匹配 `breakfast`，但在 `text` 字段中匹配了：

<Image img={match_in_body} size="lg" border alt="正文中的匹配"/>

### 调整分页设置 \{#adjusting-pagination-settings\}

默认情况下，查询结果窗格会在单个页面上显示所有结果记录。对于较大的结果集，为了更便于查看，可能更适合对结果进行分页。可以使用结果窗格右下角的分页选择器来完成此操作：

<Image img={pagination} size="lg" border alt="分页选项"/>

选择页面大小后，会立即对结果集应用分页，并且导航选项会显示在结果窗格页脚的中间位置。

<Image img={pagination_nav} size="lg" border alt="分页导航"/>

### 导出查询结果数据 \{#exporting-query-result-data\}

在 SQL 控制台中，可直接将查询结果集导出为 CSV 格式。为此，打开结果窗格工具栏右侧的 `•••` 菜单，然后选择“Download as CSV”。

<Image img={download_as_csv} size="lg" border alt="下载为 CSV"/>

## 可视化查询数据 \{#visualizing-query-data\}

有些数据以图表形式展示更容易理解。你可以在 SQL 控制台中，通过几次点击就能直接基于查询结果快速创建可视化图表。作为示例，我们将使用一个计算纽约市出租车行程每周统计信息的查询：

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

<Image img={tabular_query_results} size="lg" border alt="表格化查询结果" />

在没有可视化的情况下，这些结果很难理解。接下来我们把它们转换成图表。


### 创建图表 \{#creating-charts\}

要开始构建可视化，在查询结果面板的工具栏中选择“Chart”选项。此时会显示一个图表配置面板：

<Image img={switch_from_query_to_chart} size="lg" border alt="从查询切换到图表"/>

我们先创建一个简单的柱状图，用于按 `week` 跟踪 `trip_total`。为此，将 `week` 字段拖到 x 轴，将 `trip_total` 字段拖到 y 轴：

<Image img={trip_total_by_week} size="lg" border alt="按周统计行程总额"/>

大多数图表类型支持在数值轴上添加多个字段。例如，我们将 `fare_total` 字段拖到 y 轴上：

<Image img={bar_chart} size="lg" border alt="柱状图"/>

### 自定义图表 \{#customizing-charts\}

SQL 控制台支持十种图表类型，可以在图表配置面板中的图表类型选择器中进行选择。例如，我们可以轻松地将上一张图表的类型从 Bar 更改为 Area：

<Image img={change_from_bar_to_area} size="lg" border alt="将 Bar 图表更改为 Area"/>

图表标题与提供数据的查询名称保持一致。更新查询名称时，图表标题也会随之更新：

<Image img={update_query_name} size="lg" border alt="更新查询名称"/>

在图表配置面板的 “Advanced” 部分，还可以调整更多高级图表属性。首先，我们将调整以下设置：

- 副标题
- 坐标轴标题
- x 轴标签方向

图表会随之更新：

<Image img={update_subtitle_etc} size="lg" border alt="更新副标题等"/>

在某些场景中，可能需要分别调整每个字段的坐标轴刻度。这同样可以在图表配置面板的 “Advanced” 部分，通过为坐标轴范围指定最小值和最大值来实现。举例来说，上面的图表整体效果不错，但为了更好地展示 `trip_total` 和 `fare_total` 字段之间的相关性，需要对坐标轴范围做一些调整：

<Image img={adjust_axis_scale} size="lg" border alt="调整坐标轴刻度"/>

## 共享查询 \{#sharing-queries\}

SQL 控制台允许你与团队共享查询。共享查询后，团队的所有成员都可以查看和编辑该查询。共享查询是与你的团队协作的有效方式。

要共享查询，请单击查询工具栏中的 “Share” 按钮。

<Image img={sql_console_share} size="lg" border alt="查询工具栏中的 “Share” 按钮"/>

此时会弹出一个对话框，允许你将查询与某个团队的所有成员共享。如果你有多个团队，可以选择要与哪个团队共享该查询。

<Image img={sql_console_edit_access} size="lg" border alt="用于编辑共享查询访问权限的对话框"/>

<Image img={sql_console_add_team} size="lg" border alt="用于将团队添加到共享查询的界面"/>

<Image img={sql_console_edit_member} size="lg" border alt="用于编辑成员对共享查询访问权限的界面"/>

在某些场景下，可能需要分别调整每个字段的坐标轴范围或比例。这也可以在图表配置面板的 “Advanced” 部分中，通过为坐标轴范围指定最小值和最大值来实现。举例来说，上面的图表看起来不错，但为了展示 `trip_total` 和 `fare_total` 字段之间的相关性，需要对坐标轴范围进行一些调整：

<Image img={sql_console_access_queries} size="lg" border alt="查询列表中 “Shared with me” 部分"/>