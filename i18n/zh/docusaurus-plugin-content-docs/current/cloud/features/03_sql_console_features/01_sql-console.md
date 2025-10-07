---
'sidebar_title': 'SQL Console'
'slug': '/cloud/get-started/sql-console'
'description': '运行查询并使用 SQL 控制台创建可视化.'
'keywords':
- 'sql console'
- 'sql client'
- 'cloud console'
- 'console'
'title': 'SQL 控制台'
'doc_type': 'guide'
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


# SQL 控制台

SQL 控制台是在 ClickHouse Cloud 中探索和查询数据库的最快、最简单的方法。您可以使用 SQL 控制台来：

- 连接到您的 ClickHouse Cloud 服务
- 查看、过滤和排序表数据
- 执行查询并在几次点击中可视化结果数据
- 与团队成员共享查询，更有效地协作。

### 探索表 {#exploring-tables}

### 查看表列表和架构信息 {#viewing-table-list-and-schema-info}

在左侧边栏区域可以找到您 ClickHouse 实例中包含的表的概述。使用左栏顶部的数据库选择器查看特定数据库中的表。

<Image img={table_list_and_schema} size="md" alt='表列表和架构' />
表列表中的表也可以展开以查看列和类型。

<Image img={view_columns} size="md" alt='查看列' />

### 探索表数据 {#exploring-table-data}

在列表中单击一个表以在新选项卡中打开它。在表视图中，可以轻松查看、选择和复制数据。注意，复制粘贴到电子表格应用程序（如 Microsoft Excel 和 Google Sheets）时结构和格式保持不变。您可以使用页脚中的导航在表数据的页面之间翻转（按 30 行递增分页）。

<Image img={abc} size="md" alt='abc' />

### 检查单元格数据 {#inspecting-cell-data}

单元格检查工具可用于查看包含在单个单元格中的大量数据。要打开它，右键单击单元格并选择“检查单元格”。通过单击检查器内容右上角的复制图标可以复制单元格检查器的内容。

<Image img={inspecting_cell_content} size="md" alt='检查单元格内容' />

## 过滤和排序表 {#filtering-and-sorting-tables}

### 排序表 {#sorting-a-table}

要在 SQL 控制台中对表进行排序，打开表并选择工具栏中的“排序”按钮。此按钮将打开一个菜单，允许您配置排序。您可以选择要排序的列并配置排序的顺序（升序或降序）。选择“应用”或按 Enter 来对表进行排序。

<Image img={sort_descending_on_column} size="md" alt='在一列上降序排序' />

SQL 控制台还允许您对表添加多个排序。再次单击“排序”按钮以添加另一个排序。

:::note
排序是按照它们在排序面板中出现的顺序（从上到下）应用的。要移除排序，只需单击排序旁边的“x”按钮。
:::

### 过滤表 {#filtering-a-table}

要在 SQL 控制台中过滤表，打开表并选择“过滤”按钮。与排序一样，此按钮将打开一个菜单，允许您配置过滤器。您可以选择要过滤的列并选择必要的标准。SQL 控制台智能地显示与列中包含的数据类型相对应的过滤选项。

<Image img={filter_on_radio_column_equal_gsm} size="md" alt='过滤无线列等于 GSM' />

当您对过滤器感到满意时，可以选择“应用”以过滤数据。您还可以添加其他过滤器，如下所示。

<Image img={add_more_filters} size="md" alt='在范围大于 2000 上添加过滤器' />

与排序功能类似，单击过滤器旁边的“x”按钮以移除它。

### 同时过滤和排序 {#filtering-and-sorting-together}

SQL 控制台允许您同时过滤和排序表。为此，使用上述步骤添加所有所需的过滤器和排序，然后单击“应用”按钮。

<Image img={filtering_and_sorting_together} size="md" alt='在范围大于 2000 上添加过滤器' />

### 从过滤器和排序创建查询 {#creating-a-query-from-filters-and-sorts}

SQL 控制台可以一键将您的排序和过滤器直接转换为查询。只需选择工具栏中的“创建查询”按钮，附上您选择的排序和过滤参数。单击“创建查询”后，将打开一个新的查询选项卡，其中预填充了与您表视图中包含的数据对应的 SQL 命令。

<Image img={create_a_query_from_sorts_and_filters} size="md" alt='从排序和过滤器创建查询' />

:::note
使用“创建查询”功能时，过滤器和排序不是强制性的。
:::

您可以通过阅读 (link) 查询文档了解有关 SQL 控制台中查询的更多信息。

## 创建和运行查询 {#creating-and-running-a-query}

### 创建查询 {#creating-a-query}

在 SQL 控制台中有两种方法可以创建新查询。

- 单击标签栏中的“+”按钮
- 从左侧边栏查询列表中选择“新查询”按钮

<Image img={creating_a_query} size="md" alt='创建查询' />

### 运行查询 {#running-a-query}

要运行查询，请在 SQL 编辑器中输入您的 SQL 命令，并单击“运行”按钮或使用快捷键 `cmd / ctrl + enter`。要顺序编写和运行多个命令，请确保在每个命令后添加分号。

查询执行选项
默认情况下，单击运行按钮将运行 SQL 编辑器中包含的所有命令。SQL 控制台支持两种其他查询执行选项：

- 运行选定的命令
- 在光标处运行命令

要运行选定的命令，突出显示所需的命令或命令序列，然后单击“运行”按钮（或使用 `cmd / ctrl + enter` 快捷键）。在有选定项时，您也可以在 SQL 编辑器上下文菜单中选择“运行选择的”。

<Image img={run_selected_query} size="md" alt='运行选定的查询' />

运行当前光标位置的命令可以通过两种方式实现：

- 从扩展运行选项菜单中选择“在光标处” （或使用相应的 `cmd / ctrl + shift + enter` 键盘快捷键）

<Image img={run_at_cursor_2} size="md" alt='在光标处运行' />

- 从 SQL 编辑器上下文菜单选择“在光标处运行”

<Image img={run_at_cursor} size="md" alt='在光标处运行' />

:::note
光标位置的命令在执行时会闪烁黄色。
:::

### 取消查询 {#canceling-a-query}

在查询运行时，查询编辑器工具栏中的“运行”按钮将替换为“取消”按钮。只需单击该按钮或按 `Esc` 来取消查询。注意：已经返回的任何结果在取消后将继续存在。

<Image img={cancel_a_query} size="md" alt='取消查询' />

### 保存查询 {#saving-a-query}

保存查询可以让您更轻松地找到它们并与您的团队成员共享。SQL 控制台还允许您将查询组织到文件夹中。

要保存查询，只需单击工具栏中紧邻“运行”按钮的“保存”按钮。输入所需名称并单击“保存查询”。

:::note
使用快捷键 `cmd / ctrl` + s 也将保存当前查询选项卡中的任何工作。
:::

<Image img={sql_console_save_query} size="md" alt='保存查询' />

或者，您也可以通过单击工具栏中的“无标题查询”，调整名称并按回车键来同时命名和保存查询：

<Image img={sql_console_rename} size="md" alt='重命名查询' />

### 查询共享 {#query-sharing}

SQL 控制台允许您轻松与团队成员共享查询。SQL 控制台支持四个访问级别，可以在全局和按用户基础上进行调整：

- 拥有者（可以调整共享选项）
- 写访问
- 只读访问
- 无访问

保存查询后，单击工具栏中的“共享”按钮。将出现一个共享选项的模态框：

<Image img={sql_console_share} size="md" alt='共享查询' />

要为所有访问服务的组织成员调整查询访问权限，只需在顶部行中调整访问级别选择器：

<Image img={sql_console_edit_access} size="md" alt='编辑访问权限' />

应用上述内容后，该查询现在可以由所有访问 SQL 控制台的团队成员查看（和执行）。

要为特定成员调整查询访问权限，从“添加团队成员”选择器中选择所需的团队成员：

<Image img={sql_console_add_team} size="md" alt='添加团队成员' />

选择团队成员后，应出现一行新项目及其访问级别选择器：

<Image img={sql_console_edit_member} size="md" alt='编辑团队成员访问权限' />

### 访问共享查询 {#accessing-shared-queries}

如果有查询与您共享，它将在 SQL 控制台左侧边栏的“查询”选项卡中显示：

<Image img={sql_console_access_queries} size="md" alt='访问查询' />

### 链接到查询 (永久链接) {#linking-to-a-query-permalinks}

保存的查询也具有永久链接，这意味着您可以发送和接收共享查询的链接并直接打开它们。

查询中可能存在的任何参数的值会自动添加到保存的查询 URL 作为查询参数。例如，如果查询包含 `{start_date: Date}` 和 `{end_date: Date}` 参数，则永久链接可能看起来像：`https://console.clickhouse.cloud/services/:serviceId/console/query/:queryId?param_start_date=2015-01-01&param_end_date=2016-01-01`。

## 高级查询功能 {#advanced-querying-features}

### 搜索查询结果 {#searching-query-results}

查询执行后，您可以使用结果面板中的搜索输入框快速搜索返回的结果集。此功能有助于预览额外的 `WHERE` 子句的结果，或者仅仅检查特定数据是否包含在结果集中。在搜索输入框中输入值后，结果面板将更新并返回包含与输入值匹配的条目。以下示例中，我们将搜索 `hackernews` 表中所有包含 `ClickHouse` 的 `breakfast` 评论（不区分大小写）：

<Image img={search_hn} size="md" alt='搜索 Hacker News 数据' />

注意：任何与输入值匹配的字段都将被返回。例如，上述屏幕截图中的第三条记录在 `by` 字段中不匹配“breakfast”，但是 `text` 字段中的确有：

<Image img={match_in_body} size="md" alt='主体中的匹配项' />

### 调整分页设置 {#adjusting-pagination-settings}

默认情况下，查询结果面板将在单个页面上显示每个结果记录。对于较大的结果集，可能更希望分页结果以便于查看。这可以通过结果面板右下角的分页选择器来完成：

<Image img={pagination} size="md" alt='分页选项' />

选择页面大小将立即将分页应用于结果集，并在结果面板页脚中间显示导航选项。

<Image img={pagination_nav} size="md" alt='分页导航' />

### 导出查询结果数据 {#exporting-query-result-data}

查询结果集可以轻松地从 SQL 控制台导出为 CSV 格式。要做到这一点，打开结果面板工具栏右侧的 `•••` 菜单，选择“下载为 CSV”。

<Image img={download_as_csv} size="md" alt='下载为 CSV' />

## 可视化查询数据 {#visualizing-query-data}

某些数据以图表形式呈现时更容易解释。您可以直接从 SQL 控制台快速创建查询结果数据的可视化，仅需几次点击。例如，我们将使用一个计算纽约市出租车行程每周统计数据的查询：

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

<Image img={tabular_query_results} size="md" alt='表格查询结果' />

没有可视化时，这些结果很难解释。让我们将它们转化为图表。

### 创建图表 {#creating-charts}

要开始构建可视化，选择查询结果面板工具栏中的“图表”选项。将出现一个图表配置面板：

<Image img={switch_from_query_to_chart} size="md" alt='从查询切换到图表' />

我们将开始创建一个简单的柱状图，跟踪 `trip_total` 按 `week`。为此，我们将 `week` 字段拖动到 x 轴，将 `trip_total` 字段拖动到 y 轴：

<Image img={trip_total_by_week} size="md" alt='按周计算的行程总额' />

大多数图表类型支持在数值轴上使用多个字段。为了演示，我们将 `fare_total` 字段拖到 y 轴：

<Image img={bar_chart} size="md" alt='柱状图' />

### 自定义图表 {#customizing-charts}

SQL 控制台支持十种图表类型，可以从图表配置面板中的图表类型选择器中选择。例如，我们可以轻松将之前的图表类型从柱状图更改为区域图：

<Image img={change_from_bar_to_area} size="md" alt='从柱状图更改为区域图' />

图表标题匹配提供数据的查询名称。更新查询的名称将导致图表标题也更新：

<Image img={update_query_name} size="md" alt='更新查询名称' />

在图表配置面板的“高级”部分中，还可以调整许多更高级的图表特性。首先，我们将调整以下设置：

- 副标题
- 轴标题
- x 轴的标签方向

我们的图表将相应更新：

<Image img={update_subtitle_etc} size="md" alt='更新副标题等' />

在某些情况下，可能需要分别调整每个字段的轴缩放。这也可以在图表配置面板的“高级”部分中通过指定轴范围的最小值和最大值来完成。作为示例，上述图表看起来不错，但为了演示 `trip_total` 和 `fare_total` 字段之间的相关性，轴范围需要进行一些调整：

<Image img={adjust_axis_scale} size="md" alt='调整轴缩放' />
