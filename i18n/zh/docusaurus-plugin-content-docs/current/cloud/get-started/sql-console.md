---
sidebar_title: 'SQL控制台'
slug: /cloud/get-started/sql-console
description: '使用SQL控制台运行查询和创建可视化。'
keywords: ['sql控制台', 'sql客户端', '云控制台', '控制台']
---

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


# SQL控制台

SQL控制台是探索和查询你的ClickHouse Cloud数据库的最快捷方式。你可以使用SQL控制台来：

- 连接到你的ClickHouse Cloud服务
- 查看、过滤和排序表数据
- 只需几次点击即可执行查询并可视化结果数据
- 与团队成员分享查询，更有效地协作。

### 探索表 {#exploring-tables}

### 查看表列表和架构信息 {#viewing-table-list-and-schema-info}

你ClickHouse实例中包含的表概述可以在左侧边栏区域找到。使用左侧栏顶部的数据库选择器查看特定数据库中的表。

<img src={table_list_and_schema} alt="table list and schema"/>

列表中的表也可以展开以查看列和类型。

<img src={view_columns} alt="view columns"/>

### 探索表数据 {#exploring-table-data}

点击列表中的表以在新标签中打开它。在表视图中，可以轻松查看、选择和复制数据。注意在复制粘贴到Microsoft Excel和Google Sheets等电子表格应用程序时，结构和格式会被保留。你可以使用页脚的导航在表数据的页面间翻转（分页以30行增量）。

<img src={abc} alt="abc"/>

### 检查单元格数据 {#inspecting-cell-data}

可以使用单元格检查工具查看单个单元格中包含的大量数据。要打开它，请右键点击一个单元格并选择“检查单元格”。点击检查器内容右上角的复制图标可以复制单元格检查器的内容。

<img src={inspecting_cell_content} alt="inspecting cell content"/>

## 过滤和排序表 {#filtering-and-sorting-tables}

### 排序表 {#sorting-a-table}

要在SQL控制台中排序表，请打开一个表并选择工具栏中的“排序”按钮。此按钮将打开一个菜单，让你可以配置排序。你可以选择按哪个列进行排序并配置排序的顺序（升序或降序）。选择“应用”或按回车键以排序你的表。

<img src={sort_descending_on_column} alt="sort descending on a column"/>

SQL控制台还允许你向表中添加多个排序。再次点击“排序”按钮以添加另一个排序。

:::note
排序是按照它们在排序面板中的出现顺序（从上到下）应用的。要删除一个排序，只需点击排序旁边的“x”按钮。
:::

### 过滤表 {#filtering-a-table}

要在SQL控制台中过滤表，打开一个表并选择“过滤”按钮。与排序一样，此按钮将打开一个菜单，让你可以配置你的过滤器。你可以选择按哪个列进行过滤并选择必要的标准。SQL控制台智能地显示与列中包含的数据类型相对应的过滤选项。

<img src={filter_on_radio_column_equal_gsm} alt="filter on the radio column equal to GSM"/>

当你对过滤器满意时，可以选择“应用”以过滤数据。你还可以添加额外的过滤器，如下所示。

<img src={add_more_filters} alt="Add a filter on range greater than 2000"/>

类似于排序功能，点击过滤器旁边的“x”按钮以删除它。

### 同时过滤和排序 {#filtering-and-sorting-together}

SQL控制台允许你同时过滤和排序表。为此，按照上述步骤添加所有所需的过滤器和排序，然后点击“应用”按钮。

<img src={filtering_and_sorting_together} alt="Filtering and sorting together"/>

### 从过滤器和排序创建查询 {#creating-a-query-from-filters-and-sorts}

SQL控制台可以将你的排序和过滤直接转换为查询，只需一键。只需从工具栏选择“创建查询”按钮，并选择你的排序和过滤参数。点击“创建查询”后，将打开一个新的查询标签，预填充与表视图中数据对应的SQL命令。

<img src={create_a_query_from_sorts_and_filters} alt="Create a query from sorts and filters"/>

:::note
使用“创建查询”功能时，过滤和排序不是强制的。
:::

你可以通过阅读 (link) 查询文档来了解更多关于SQL控制台中查询的信息。

## 创建和运行查询 {#creating-and-running-a-query}

### 创建查询 {#creating-a-query}

在SQL控制台中创建新查询有两种方法。

- 点击标签栏中的“+”按钮
- 从左侧边栏查询列表中选择“新查询”按钮

<img src={creating_a_query} alt="Creating a query"/>

### 运行查询 {#running-a-query}

要运行查询，将你的SQL命令输入SQL编辑器，并点击“运行”按钮或使用快捷方式 `cmd / ctrl + enter`。要顺序写入和运行多个命令，请确保在每个命令后添加分号。

查询执行选项
默认情况下，点击运行按钮将执行SQL编辑器中的所有命令。SQL控制台支持两种其他查询执行选项：

- 运行选中的命令
- 在光标处运行命令

要运行选中的命令，突出显示所需的命令或命令序列，然后点击“运行”按钮（或使用快捷方式 `cmd / ctrl + enter`）。当选定项存在时，你也可以在SQL编辑器的上下文菜单中选择“运行选定”。

<img src={run_selected_query} alt="run selected query"/>

在当前位置运行命令可以通过两种方式实现：

- 从扩展的运行选项菜单中选择“在光标处” （或使用对应的 `cmd / ctrl + shift + enter` 键盘快捷方式）

<img src={run_at_cursor_2} alt="run at cursor"/>

  - 从SQL编辑器的上下文菜单中选择“在光标处运行”

<img src={run_at_cursor} alt="run at cursor"/>

:::note
光标位置处的命令在执行时会闪烁黄色。
:::

### 取消查询 {#canceling-a-query}

当查询正在运行时，查询编辑器工具栏中的“运行”按钮将被替换为“取消”按钮。只需点击此按钮或按 `Esc` 以取消查询。注意：已返回的任何结果在取消后将继续保留。

<img src={cancel_a_query} alt="Cancel a query"/>

### 保存查询 {#saving-a-query}

保存查询使你能够轻松找到它们并与队友分享。SQL控制台还允许你将查询组织到文件夹中。

要保存查询，只需点击工具栏中“运行”按钮旁边的“保存”按钮。输入所需的名称并点击“保存查询”。

:::note
使用快捷方式 `cmd / ctrl` + s 也会保存当前查询标签中的任何工作。
:::

<img src={sql_console_save_query} alt="Save query"/>

或者，你可以通过点击工具栏中的“无标题查询”，调整名称并按回车键，来同时命名和保存查询：
<img src={sql_console_rename} alt="Rename query"/>

### 查询共享 {#query-sharing}

SQL控制台允许你轻松与团队成员分享查询。SQL控制台支持四种访问级别，可在全局和按用户的基础上进行调整：

- 拥有者（可以调整共享选项）
- 写入访问
- 只读访问
- 无访问权限

保存查询后，点击工具栏中的“分享”按钮。将出现一个共享选项的模态框：

<img src={sql_console_share} alt="Share query"/>

要调整对所有有访问服务的组织成员的查询访问权限，只需在顶行中调整访问级别选择器：

<img src={sql_console_edit_access} alt="Edit access"/>

在上面应用后，所有有权访问SQL控制台的团队成员都可以查看（和执行）该查询。

要调整特定成员的查询访问权限，从“添加团队成员”选择器中选择所需的团队成员：

<img src={sql_console_add_team} alt="Add team member"/>

选择团队成员后，将出现一个新的项目，其中包含访问级别选择器：

<img src={sql_console_edit_member} alt="Edit team member access"/>

### 访问共享查询 {#accessing-shared-queries}

如果某个查询已与您共享，它将在SQL控制台左侧边栏的“查询”标签中显示：

<img src={sql_console_access_queries} alt="Access queries"/>

### 链接到查询（永久链接） {#linking-to-a-query-permalinks}

保存的查询也会被永久链接，这意味着你可以发送和接收共享查询的链接，并直接打开它们。

任何可能在查询中存在的参数的值将自动添加到保存的查询URL中作为查询参数。例如，如果查询包含 `{start_date: Date}` 和 `{end_date: Date}` 参数，永久链接可能如下所示： `https://console.clickhouse.cloud/services/:serviceId/console/query/:queryId?param_start_date=2015-01-01&param_end_date=2016-01-01`。

## 高级查询功能 {#advanced-querying-features}

### 搜索查询结果 {#searching-query-results}

执行查询后，你可以使用结果面板中的搜索输入快速在返回的结果集中进行搜索。此功能有助于预览附加 `WHERE` 子句的结果，或仅仅检查确保特定数据包含在结果集中。在输入搜索值后，结果面板将更新并返回包含与输入值匹配的条目的记录。在这个例子中，我们将在 `hackernews` 表中查找包含 `ClickHouse` 的所有 `breakfast` 实例（不区分大小写）：

<img src={search_hn} alt="Search Hacker News Data"/>

注意：任何匹配输入值的字段都将被返回。例如，以上截图中的第三条记录在 `by` 字段中不匹配“breakfast”，但在 `text` 字段中匹配：

<img src={match_in_body} alt="Match in body"/>

### 调整分页设置 {#adjusting-pagination-settings}

默认情况下，查询结果面板将在单个页面上显示每个结果记录。对于较大的结果集，分页结果可能更方便查看。这可以通过结果面板右下角的分页选择器来实现：

<img src={pagination} alt="Pagination options"/>

选择页面大小将立即对结果集应用分页，并在结果面板页脚中间出现导航选项。

<img src={pagination_nav} alt="Pagination navigation"/>

### 导出查询结果数据 {#exporting-query-result-data}

查询结果集可以直接从SQL控制台轻松导出为CSV格式。为此，请打开结果面板工具栏右侧的 `•••` 菜单并选择“下载为CSV”。

<img src={download_as_csv} alt="Download as CSV"/>

## 可视化查询数据 {#visualizing-query-data}

某些数据可以以图表形式更容易理解。你可以直接从SQL控制台仅需几次点击快速创建可视化查询结果数据。作为例子，我们将使用一个查询来计算纽约市出租车每周的统计数据：

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

<img src={tabular_query_results} alt="Tabular query results"/>

没有可视化，这些结果很难解读。让我们把它们转化为图表。

### 创建图表 {#creating-charts}

要开始构建可视化，请从查询结果面板工具栏中选择“图表”选项。将出现一个图表配置面板：

<img src={switch_from_query_to_chart} alt="Switch from query to chart"/>

我们将开始创建一个简单的条形图，跟踪按 `week` 的 `trip_total`。为此，我们将 `week` 字段拖到x轴，`trip_total` 字段拖到y轴：

<img src={trip_total_by_week} alt="Trip total by week"/>

大多数图表类型支持多个数值轴上的字段。为了演示，我们将 `fare_total` 字段拖到y轴：

<img src={bar_chart} alt="Bar chart"/>

### 自定义图表 {#customizing-charts}

SQL控制台支持十种图表类型，可以从图表配置面板中的图表类型选择器中选择。例如，我们可以轻松地将之前的图表类型从条形图更改为区域图：

<img src={change_from_bar_to_area} alt="Change from Bar chart to Area"/>

图表标题与提供数据的查询名称相匹配。更新查询的名称将导致图表标题也更新：

<img src={update_query_name} alt="Update query name"/>

在图表配置面板的“高级”部分还可以调整许多更高级的图表特征。首先，我们将调整以下设置：

- 副标题
- 轴标题
- x轴的标签方向

我们的图表将相应更新：

<img src={update_subtitle_etc} alt="Update subtitle etc."/>

在某些情况下，可能需要单独调整每个字段的轴尺度。这也可以通过在图表配置面板的“高级”部分中指定轴范围的最小值和最大值来实现。例如，上述图表看起来不错，但为了演示 `trip_total` 和 `fare_total` 字段之间的相关性，轴范围需要一些调整：

<img src={adjust_axis_scale} alt="Adjust axis scale"/>
