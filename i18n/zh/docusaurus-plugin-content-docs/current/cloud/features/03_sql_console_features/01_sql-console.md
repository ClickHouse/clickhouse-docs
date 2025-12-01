---
sidebar_title: 'SQL 控制台'
slug: /cloud/get-started/sql-console
description: '使用 SQL 控制台运行查询并创建可视化。'
keywords: ['SQL 控制台', 'SQL 客户端', '云控制台', '控制台']
title: 'SQL 控制台'
doc_type: 'guide'
---

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

# SQL 控制台 {#sql-console}

SQL 控制台是在 ClickHouse Cloud 中浏览和查询数据库的最快、最简便方式。您可以使用 SQL 控制台来：

- 连接到 ClickHouse Cloud 服务
- 查看、过滤和排序表数据
- 只需点击几下即可执行查询并可视化结果数据
- 与团队成员共享查询并更高效地协作。

### 浏览数据表 {#exploring-tables}

### 查看数据表列表和 schema 信息 {#viewing-table-list-and-schema-info}

左侧边栏区域展示了 ClickHouse 实例中包含的数据表概览。使用左侧栏顶部的数据库选择器可以查看特定数据库中的数据表。

<Image img={table_list_and_schema} size="md" alt="table list and schema" />
列表中的表还可以展开，以查看列及其类型。

<Image img={view_columns} size="md" alt="view columns" />

### 浏览表数据 {#exploring-table-data}

单击列表中的某个表即可在新选项卡中打开它。在表视图中，可以轻松地查看、选择和复制数据。注意，当复制并粘贴到 Microsoft Excel 和 Google Sheets 等电子表格应用程序时，其结构和格式都会被保留。可以使用页脚中的导航在表数据各页之间切换（每页 30 行分页）。

<Image img={abc} size="md" alt="abc" />

### 检查单元格数据 {#inspecting-cell-data}

可以使用“单元格检查器”工具来查看单个单元格中包含的大量数据。要打开它，在单元格上单击鼠标右键并选择“Inspect Cell”。通过单击检查器内容右上角的复制图标即可复制单元格检查器中的内容。

<Image img={inspecting_cell_content} size="md" alt="inspecting cell content" />

## 过滤和排序表 {#filtering-and-sorting-tables}

### 对表进行排序 {#sorting-a-table}

要在 SQL 控制台中对表进行排序，打开表并选择工具栏中的“Sort”按钮。该按钮会打开一个菜单，用于配置排序条件。可以选择要排序的列，并配置排序顺序（升序或降序）。选择“Apply”或按 Enter 键即可对表进行排序。

<Image img={sort_descending_on_column} size="md" alt='对某一列进行降序排序' />

SQL 控制台还允许为同一张表添加多个排序条件。再次单击“Sort”按钮可以添加另一个排序条件。 

:::note
排序会按照它们在排序面板中出现的顺序（从上到下）依次应用。要移除某个排序，只需单击该排序旁边的“x”按钮。
:::

### 过滤表 {#filtering-a-table}

要在 SQL 控制台中过滤表，打开表并选择“Filter”按钮。与排序类似，该按钮会打开一个菜单，用于配置过滤条件。可以选择要过滤的列并设置所需的条件。SQL 控制台会智能地显示与该列数据类型相匹配的过滤选项。

<Image img={filter_on_radio_column_equal_gsm} size="md" alt='在 radio 列上添加等于 GSM 的过滤条件' />

在对过滤条件满意后，可以选择“Apply”来应用过滤。也可以像下面所示那样添加更多过滤条件。

<Image img={add_more_filters} size="md" alt='添加一个大于 2000 的区间过滤条件' />

与排序功能类似，单击过滤条件旁边的“x”按钮即可将其移除。

### 同时过滤和排序 {#filtering-and-sorting-together}

SQL 控制台允许在同一张表上同时进行过滤和排序。为此，请按照上述步骤添加所有需要的过滤条件和排序条件，然后单击“Apply”按钮。

<Image img={filtering_and_sorting_together} size="md" alt='添加一个大于 2000 的区间过滤条件' />

### 从过滤和排序创建查询 {#creating-a-query-from-filters-and-sorts}

SQL 控制台可以一键将排序和过滤条件直接转换为查询。只需在工具栏中选择“Create Query”按钮，并使用所选的排序和过滤参数。单击“Create query”后，会打开一个新的查询选项卡，其中预填充了与当前表视图数据相对应的 SQL 命令。

<Image img={create_a_query_from_sorts_and_filters} size="md" alt='从排序和过滤条件创建查询' />

:::note
使用“Create Query”功能时，并不要求必须先设置过滤或排序条件。
:::

可以通过阅读 (link) 查询文档，进一步了解如何在 SQL 控制台中执行查询。

## 创建和运行查询 {#creating-and-running-a-query}

### 创建查询 {#creating-a-query}

在 SQL 控制台中有两种方式创建新查询：

- 点击选项卡栏中的 “+” 按钮
- 在左侧边栏的查询列表中选择 “New Query” 按钮

<Image img={creating_a_query} size="md" alt="创建查询" />

### 运行查询 {#running-a-query}

要运行查询，请在 SQL 编辑器中输入 SQL 命令，然后点击 “Run” 按钮，或使用快捷键 `cmd / ctrl + enter`。要按顺序编写并运行多个命令，请确保在每条命令后添加分号。

查询执行选项  
默认情况下，点击运行按钮会运行 SQL 编辑器中包含的所有命令。SQL 控制台还支持另外两种查询执行选项：

- 运行选中的命令
- 运行光标所在位置的命令

要运行选中的命令，高亮选中所需的命令或命令序列，然后点击 “Run” 按钮（或使用快捷键 `cmd / ctrl + enter`）。当存在选中内容时，你也可以在 SQL 编辑器中右键打开上下文菜单并选择 “Run selected”。

<Image img={run_selected_query} size="md" alt="运行选中查询" />

在当前光标位置运行命令可以通过两种方式实现：

- 在扩展运行选项菜单中选择 “At Cursor”（或使用对应的 `cmd / ctrl + shift + enter` 键盘快捷键）

<Image img={run_at_cursor_2} size="md" alt="在光标处运行" />

- 在 SQL 编辑器的上下文菜单中选择 “Run at cursor”

<Image img={run_at_cursor} size="md" alt="在光标处运行" />

:::note
执行时，光标所在位置的命令会短暂闪烁为黄色。
:::

### 取消查询 {#canceling-a-query}

在查询运行期间，查询编辑器工具栏中的 “Run” 按钮会被 “Cancel” 按钮替代。只需点击该按钮或按下 `Esc` 即可取消查询。注意：任何已经返回的结果在取消后仍会保留。

<Image img={cancel_a_query} size="md" alt="取消查询" />

### 保存查询 {#saving-a-query}

保存查询可以帮助你在之后轻松找到它们，并与团队成员共享。SQL 控制台还允许你将查询组织到文件夹中。

要保存查询，只需点击工具栏中紧挨着 “Run” 按钮的 “Save” 按钮。输入期望的名称并点击 “Save Query”。

:::note
使用快捷键 `cmd / ctrl` + s 也会保存当前查询选项卡中的所有工作内容。
:::

<Image img={sql_console_save_query} size="md" alt="保存查询" />

或者，你也可以通过点击工具栏中的 “Untitled Query”，在命名的同时完成保存，修改名称后按 Enter 即可：

<Image img={sql_console_rename} size="md" alt="重命名查询" />

### 查询共享 {#query-sharing}

SQL 控制台允许你轻松将查询与团队成员共享。SQL 控制台支持四种访问级别，这些级别既可以全局调整，也可以按用户单独设置：

- Owner（可调整共享选项）
- 写入权限
- 只读权限
- 无访问权限

保存查询后，点击工具栏中的 “Share” 按钮。此时会弹出带有共享选项的模态对话框：

<Image img={sql_console_share} size="md" alt="共享查询" />

要为所有有权访问该服务的组织成员调整查询访问权限，只需调整顶行中的访问级别选择器：

<Image img={sql_console_edit_access} size="md" alt="编辑访问权限" />

应用上述设置后，所有具有该服务 SQL 控制台访问权限的团队成员现在都可以查看（并执行）该查询。

要为特定成员调整查询访问权限，请在 “Add a team member” 选择器中选择目标团队成员：

<Image img={sql_console_add_team} size="md" alt="添加团队成员" />

选择团队成员后，会出现一个带有访问级别选择器的新条目：

<Image img={sql_console_edit_member} size="md" alt="编辑团队成员访问权限" />

### 访问共享查询 {#accessing-shared-queries}

如果有查询已与你共享，它会显示在 SQL 控制台左侧边栏的 “Queries” 选项卡中：

<Image img={sql_console_access_queries} size="md" alt="访问查询" />

### 链接到查询（永久链接） {#linking-to-a-query-permalinks}

已保存的查询也会生成永久链接，这意味着你可以将共享查询的链接发送给他人或从他人处接收，并直接打开这些查询。

查询中可能存在的任何参数的取值都会自动作为查询参数添加到已保存查询的 URL 中。例如，如果查询包含 `{start_date: Date}` 和 `{end_date: Date}` 这两个参数，则永久链接可能如下所示：`https://console.clickhouse.cloud/services/:serviceId/console/query/:queryId?param_start_date=2015-01-01&param_end_date=2016-01-01`。

## 高级查询功能 {#advanced-querying-features}

### 搜索查询结果 {#searching-query-results}

查询执行完成后，你可以使用结果面板中的搜索框快速在返回的结果集中进行搜索。此功能有助于预览额外添加 `WHERE` 子句后的结果，或简单检查特定数据是否包含在结果集中。在搜索框中输入值后，结果面板会更新，并返回包含与输入值匹配条目的记录。在此示例中，我们将查找 `hackernews` 表中所有评论内容包含 `ClickHouse`（不区分大小写）且包含 `breakfast` 的实例：

<Image img={search_hn} size="md" alt="搜索 Hacker News 数据" />

注意：任何字段只要匹配输入的值，就会被返回。例如，上方截图中的第三条记录在 `by` 字段中不匹配 `breakfast`，但在 `text` 字段中匹配：

<Image img={match_in_body} size="md" alt="在正文中的匹配" />

### 调整分页设置 {#adjusting-pagination-settings}

默认情况下，查询结果面板会在单个页面上显示所有结果记录。对于较大的结果集，为了更易于查看，可以对结果进行分页。你可以使用结果面板右下角的分页选择器来完成此操作：

<Image img={pagination} size="md" alt="分页选项" />

选择页面大小后，会立即对结果集应用分页，并且导航选项会显示在结果面板页脚的中间位置。

<Image img={pagination_nav} size="md" alt="分页导航" />

### 导出查询结果数据 {#exporting-query-result-data}

可以直接从 SQL 控制台将查询结果集轻松导出为 CSV 格式。要执行此操作，请打开结果面板工具栏右侧的 `•••` 菜单并选择“Download as CSV”。

<Image img={download_as_csv} size="md" alt="下载为 CSV" />

## 可视化查询数据 {#visualizing-query-data}

某些数据以图表形式呈现更便于理解。你可以在 SQL 控制台中，直接基于查询结果快速生成可视化图表，只需点击几下即可。作为示例，我们将使用一个计算纽约市出租车行程周度统计的查询：

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

<Image img={tabular_query_results} size="md" alt="表格查询结果" />

如果不进行可视化，这些结果很难理解。我们来把它们转换成图表。

### 创建图表 {#creating-charts}

要开始构建可视化，请在查询结果面板的工具栏中选择 `Chart` 选项。此时会出现图表配置面板：

<Image img={switch_from_query_to_chart} size="md" alt="从查询切换到图表" />

我们先创建一个简单的柱状图，用于按 `week` 跟踪 `trip_total`。为此，我们将 `week` 字段拖到 x 轴，将 `trip_total` 字段拖到 y 轴：

<Image img={trip_total_by_week} size="md" alt="按周统计行程总额" />

大多数图表类型都支持在数值轴上使用多个字段。为演示这一点，我们将 `fare_total` 字段也拖到 y 轴上：

<Image img={bar_chart} size="md" alt="柱状图" />

### 自定义图表 {#customizing-charts}

SQL 控制台支持十种图表类型，可以在图表配置面板中的图表类型选择器中进行选择。例如，我们可以轻松地将前一个图表的类型从柱状图切换为面积图：

<Image img={change_from_bar_to_area} size="md" alt="从柱状图切换到面积图" />

图表标题与提供数据的查询名称保持一致。更新查询名称后，图表标题也会随之更新：

<Image img={update_query_name} size="md" alt="更新查询名称" />

还可以在图表配置面板的 `Advanced` 部分调整更多高级的图表属性。首先，我们来调整以下设置：

* 副标题
* 坐标轴标题
* x 轴标签方向

图表会随之更新：

<Image img={update_subtitle_etc} size="md" alt="更新副标题等" />

在某些情况下，可能需要分别调整每个字段的坐标轴范围。你也可以在图表配置面板的 `Advanced` 部分，通过为坐标轴范围指定最小值和最大值来完成这一操作。比如，上面的图表看起来不错，但为了演示 `trip_total` 和 `fare_total` 字段之间的相关性，我们需要对坐标轴范围进行一些调整：

<Image img={adjust_axis_scale} size="md" alt="调整坐标轴刻度" />
