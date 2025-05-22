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

# SQL 控制台

SQL 控制台是探索和查询您在 ClickHouse Cloud 中的数据库的最快、最简单的方法。您可以使用 SQL 控制台来：

- 连接到您的 ClickHouse Cloud 服务
- 查看、筛选和排序表数据
- 执行查询并仅需几次点击即可可视化结果数据
- 与团队成员分享查询并更有效地协作。

### 探索表 {#exploring-tables}

### 查看表列表和模式信息 {#viewing-table-list-and-schema-info}

在您的 ClickHouse 实例中包含的表的概述可以在左侧边栏区域找到。使用左侧栏顶部的数据库选择器查看特定数据库中的表。

<Image img={table_list_and_schema} size="md" alt='表列表和模式' />
列表中的表也可以展开以查看列和类型。

<Image img={view_columns} size="md" alt='查看列' />

### 探索表数据 {#exploring-table-data}

单击列表中的表以在新选项卡中打开它。在表视图中，数据可以方便地查看、选择和复制。请注意，当将数据复制粘贴到 Microsoft Excel 和 Google Sheets 等电子表格应用程序中时，结构和格式会得到保留。您可以使用页脚中的导航在表数据之间翻页（每30行分页）。

<Image img={abc} size="md" alt='abc' />

### 检查单元格数据 {#inspecting-cell-data}

可以使用单元格检查器工具查看单个单元格中包含的大量数据。要打开它，右键单击一个单元格并选择“检查单元格”。可以通过单击检查器内容右上角的复制图标来复制单元格检查器的内容。

<Image img={inspecting_cell_content} size="md" alt='检查单元格内容' />

## 筛选和排序表 {#filtering-and-sorting-tables}

### 排序表 {#sorting-a-table}

要在 SQL 控制台中对表进行排序，请打开一个表并选择工具栏中的“排序”按钮。此按钮将打开一个菜单，允许您配置排序。您可以选择要排序的列并配置排序的顺序（升序或降序）。选择“应用”或按 Enter 以对表进行排序。

<Image img={sort_descending_on_column} size="md" alt='按列降序排序' />

SQL 控制台还允许您向表添加多个排序。再次单击“排序”按钮以添加另一个排序。

:::note
排序按其在排序窗格中的顺序（从上到下）应用。要删除排序，只需单击排序旁边的“x”按钮。
:::

### 筛选表 {#filtering-a-table}

要在 SQL 控制台中筛选表，请打开一个表并选择“筛选”按钮。与排序一样，此按钮将打开一个菜单，允许您配置筛选。您可以选择要筛选的列并选择必要的条件。SQL 控制台会智能地显示与列中数据类型相对应的筛选选项。

<Image img={filter_on_radio_column_equal_gsm} size="md" alt='在无线电列上筛选等于 GSM' />

当您满意筛选时，可以选择“应用”来筛选数据。您还可以添加额外的筛选，如下所示。

<Image img={add_more_filters} size="md" alt='添加大于 2000 的范围筛选' />

类似于排序功能，单击筛选旁边的“x”按钮以删除它。

### 同时筛选和排序 {#filtering-and-sorting-together}

SQL 控制台允许您同时筛选和排序表。要做到这一点，请使用上述步骤添加所有所需的筛选和排序，然后单击“应用”按钮。

<Image img={filtering_and_sorting_together} size="md" alt='添加大于2000的范围筛选' />

### 从筛选和排序创建查询 {#creating-a-query-from-filters-and-sorts}

SQL 控制台可以通过一次点击将您的排序和筛选直接转换为查询。只需从工具栏中选择“创建查询”按钮，并选择您希望的排序和筛选参数。单击“创建查询”后，将打开一个新查询选项卡，预填充对应于您表视图中数据的 SQL 命令。

<Image img={create_a_query_from_sorts_and_filters} size="md" alt='从排序和筛选创建查询' />

:::note
在使用“创建查询”功能时，筛选和排序不是必须的。
:::

您可以通过阅读 (link) 查询文档来了解更多关于 SQL 控制台中查询的内容。

## 创建和运行查询 {#creating-and-running-a-query}

### 创建查询 {#creating-a-query}

有两种方法可以在 SQL 控制台中创建新查询。

- 单击选项卡栏中的“+”按钮
- 从左侧边栏查询列表中选择“新查询”按钮

<Image img={creating_a_query} size="md" alt='创建查询' />

### 运行查询 {#running-a-query}

要运行查询，请在 SQL 编辑器中输入您的 SQL 命令，然后单击“运行”按钮或使用快捷键 `cmd / ctrl + enter`。要顺序写入和运行多个命令，请确保在每个命令后添加分号。

查询执行选项
默认情况下，单击运行按钮将运行 SQL 编辑器中包含的所有命令。SQL 控制台支持两个其他查询执行选项：

- 运行选定的命令
- 在光标处运行命令

要运行选定的命令，请突出显示所需的命令或命令序列，然后单击“运行”按钮（或使用快捷键 `cmd / ctrl + enter`）。当存在选择时，您还可以从 SQL 编辑器上下文菜单中选择“运行选定的”选项（通过右键单击编辑器中的任意位置打开）。

<Image img={run_selected_query} size="md" alt='运行选定的查询' />

在当前光标位置运行命令可以通过两种方式实现：

- 从扩展运行选项菜单中选择“在光标处”（或使用相应的 `cmd / ctrl + shift + enter` 快捷键）

<Image img={run_at_cursor_2} size="md" alt='在光标处运行' />

  - 从 SQL 编辑器上下文菜单中选择“在光标处运行”

<Image img={run_at_cursor} size="md" alt='在光标处运行' />

:::note
光标位置处的命令将在执行时闪烁黄色。
:::

### 取消查询 {#canceling-a-query}

当查询正在运行时，查询编辑器工具栏中的“运行”按钮将被“取消”按钮替换。只需单击此按钮或按 `Esc` 以取消查询。注意：任何已经返回的结果在取消后将保持存在。

<Image img={cancel_a_query} size="md" alt='取消查询' />

### 保存查询 {#saving-a-query}

保存查询可以让您在以后轻松找到它们并与团队成员分享。SQL 控制台还允许您将查询组织到文件夹中。

要保存查询，只需单击工具栏中“运行”按钮旁边的“保存”按钮。输入所需名称，然后单击“保存查询”。

:::note
使用快捷键 `cmd / ctrl` + s 也会保存当前查询选项卡中的任何工作。
:::

<Image img={sql_console_save_query} size="md" alt='保存查询' />

或者，您可以通过单击工具栏中的“无标题查询”，调整名称并按 Enter 以同时命名和保存查询：

<Image img={sql_console_rename} size="md" alt='重命名查询' />

### 查询共享 {#query-sharing}

SQL 控制台允许您轻松地与团队成员共享查询。SQL 控制台支持四个级别的访问权限，既可以全局调整，也可以逐用户调整：

- 拥有者（可以调整共享选项）
- 写访问
- 只读访问
- 无访问权限

保存查询后，单击工具栏中的“共享”按钮。一个带有共享选项的模态将出现：

<Image img={sql_console_share} size="md" alt='共享查询' />

要调整对所有有权访问本服务的组织成员的查询访问，只需调整顶部行中的访问级别选择器：

<Image img={sql_console_edit_access} size="md" alt='编辑访问' />

应用上述后，所有有权访问该 SQL 控制台的团队成员现在都可以查看（和执行）该查询。

要调整特定成员的查询访问，从“添加团队成员”选择器中选择所需的团队成员：

<Image img={sql_console_add_team} size="md" alt='添加团队成员' />

选择团队成员后，应该会出现一项新的条目，带有访问级别选择器：

<Image img={sql_console_edit_member} size="md" alt='编辑团队成员访问' />

### 访问共享查询 {#accessing-shared-queries}

如果有查询与您共享，它将显示在 SQL 控制台左侧边栏的“查询”选项卡中：

<Image img={sql_console_access_queries} size="md" alt='访问查询' />

### 链接到查询（永久链接） {#linking-to-a-query-permalinks}

保存的查询也会生成永久链接，这意味着您可以发送和接收指向共享查询的链接，并直接打开它们。

任何可能存在于查询中的参数值会自动添加到保存的查询 URL 作为查询参数。例如，如果查询包含 `{start_date: Date}` 和 `{end_date: Date}` 参数，那么永久链接可能看起来像：`https://console.clickhouse.cloud/services/:serviceId/console/query/:queryId?param_start_date=2015-01-01&param_end_date=2016-01-01`。

## 高级查询功能 {#advanced-querying-features}

### 搜索查询结果 {#searching-query-results}

查询执行后，您可以使用结果窗格中的搜索输入快速搜索返回的结果集。此功能有助于预览额外的 `WHERE` 子句的结果，或仅仅检查特定数据是否包含在结果集中。输入值后，结果窗格将更新并返回包含与输入值匹配的条目记录。在这个示例中，我们将在 `hackernews` 表中搜索所有包含 `ClickHouse` 的 `breakfast` 评论（不区分大小写）：

<Image img={search_hn} size="md" alt='搜索 Hacker News 数据' />

注意：任何与输入值匹配的字段都将被返回。例如，上述截图中的第三条记录在 `by` 字段中不匹配 'breakfast'，但在 `text` 字段中匹配：

<Image img={match_in_body} size="md" alt='在正文中匹配' />

### 调整分页设置 {#adjusting-pagination-settings}

默认情况下，查询结果窗格将显示所有结果记录在单个页面上。对于较大的结果集，可能更希望分页结果以便于查看。这可以通过结果窗格右下角的分页选择器来实现：

<Image img={pagination} size="md" alt='分页选项' />

选择页面大小将立即对结果集应用分页，并且导航选项将出现在结果窗格底部的中间。

<Image img={pagination_nav} size="md" alt='分页导航' />

### 导出查询结果数据 {#exporting-query-result-data}

查询结果集可以直接从 SQL 控制台轻松导出为 CSV 格式。为此，打开结果窗格工具栏右侧的 `•••` 菜单，并选择“下载为 CSV”。

<Image img={download_as_csv} size="md" alt='下载为 CSV' />

## 可视化查询数据 {#visualizing-query-data}

某些数据可以更容易地以图表形式解释。您可以快速直接从 SQL 控制台从查询结果数据创建可视化，仅需几次点击。例如，我们将使用一个查询来计算纽约市出租车旅行的每周统计数据：

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

<Image img={tabular_query_results} size="md" alt='表格查询结果' />

没有可视化，这些结果很难解释。让我们将它们转化为图表。

### 创建图表 {#creating-charts}

要开始构建您的可视化，从查询结果窗格工具栏中选择“图表”选项。图表配置面板将出现：

<Image img={switch_from_query_to_chart} size="md" alt='从查询切换到图表' />

我们将开始创建一个简单的柱状图，跟踪按周的 `trip_total`。为此，我们将 `week` 字段拖到 x 轴，而将 `trip_total` 字段拖到 y 轴：

<Image img={trip_total_by_week} size="md" alt='按周的总旅行次数' />

大多数图表类型支持多个字段在数值轴上。为了演示，我们将 fare_total 字段拖到 y 轴：

<Image img={bar_chart} size="md" alt='柱状图' />

### 自定义图表 {#customizing-charts}

SQL 控制台支持十种图表类型，可以从图表配置面板中的图表类型选择器中选择。例如，我们可以轻松地将之前的图表类型从柱状图更改为面积图：

<Image img={change_from_bar_to_area} size="md" alt='从柱状图更改为面积图' />

图表标题与提供数据的查询名称匹配。更新查询名称将导致图表标题也更新：

<Image img={update_query_name} size="md" alt='更新查询名称' />

在图表配置面板的“高级”部分中还可以调整一些更高级的图表特性。首先，我们将调整以下设置：

- 副标题
- 轴标题
- x 轴的标签方向

我们的图表将相应更新：

<Image img={update_subtitle_etc} size="md" alt='更新副标题等' />

在某些情况下，可能需要独立调整每个字段的轴比例。这也可以在图表配置面板的“高级”部分中通过指定轴范围的最小值和最大值来实现。例如，上述图表看起来不错，但为了展示我们的 `trip_total` 和 `fare_total` 字段之间的关联，轴范围需要进行一些调整：

<Image img={adjust_axis_scale} size="md" alt='调整轴比例' />
