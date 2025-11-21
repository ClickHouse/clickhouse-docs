---
sidebar_title: 'SQL 控制台'
slug: /cloud/get-started/sql-console
description: '使用 SQL 控制台运行查询并创建可视化。'
keywords: ['sql 控制台', 'sql 客户端', '云控制台', '控制台']
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


# SQL 控制台

SQL 控制台是在 ClickHouse Cloud 中探索和查询数据库最快捷、最简便的方式。您可以使用 SQL 控制台:

- 连接到您的 ClickHouse Cloud 服务
- 查看、筛选和排序表数据
- 只需点击几下即可执行查询并可视化结果数据
- 与团队成员共享查询并更高效地协作。

### 探索表 {#exploring-tables}

### 查看表列表和模式信息 {#viewing-table-list-and-schema-info}

您可以在左侧边栏区域查看 ClickHouse 实例中包含的表的概览。使用左侧栏顶部的数据库选择器可查看特定数据库中的表

<Image img={table_list_and_schema} size='md' alt='表列表和模式' />
列表中的表也可以展开以查看列和类型

<Image img={view_columns} size='md' alt='查看列' />

### 探索表数据 {#exploring-table-data}

点击列表中的表可在新标签页中打开它。在表视图中,可以轻松查看、选择和复制数据。请注意,复制粘贴到电子表格应用程序(如 Microsoft Excel 和 Google Sheets)时会保留结构和格式。您可以使用页脚中的导航在表数据页面之间翻页(每页 30 行)。

<Image img={abc} size='md' alt='表数据视图' />

### 检查单元格数据 {#inspecting-cell-data}

单元格检查器工具可用于查看单个单元格中包含的大量数据。要打开它,请右键单击单元格并选择"检查单元格"。可以通过点击检查器内容右上角的复制图标来复制单元格检查器的内容。

<Image img={inspecting_cell_content} size='md' alt='检查单元格内容' />


## 过滤和排序表 {#filtering-and-sorting-tables}

### 对表进行排序 {#sorting-a-table}

要在 SQL 控制台中对表进行排序,请打开表并点击工具栏中的"排序"按钮。该按钮将打开一个菜单,允许您配置排序选项。您可以选择用于排序的列,并配置排序顺序(升序或降序)。点击"应用"或按 Enter 键即可对表进行排序

<Image
  img={sort_descending_on_column}
  size='md'
  alt='对列进行降序排序'
/>

SQL 控制台还支持为表添加多个排序条件。再次点击"排序"按钮即可添加另一个排序条件。

:::note
排序按照它们在排序面板中的显示顺序(从上到下)依次应用。要删除某个排序条件,只需点击该排序条件旁边的"x"按钮。
:::

### 对表进行过滤 {#filtering-a-table}

要在 SQL 控制台中对表进行过滤,请打开表并点击"过滤"按钮。与排序类似,该按钮将打开一个菜单,允许您配置过滤条件。您可以选择用于过滤的列并设置相应的条件。SQL 控制台会根据列中包含的数据类型智能显示相应的过滤选项。

<Image
  img={filter_on_radio_column_equal_gsm}
  size='md'
  alt='对 radio 列进行过滤,等于 GSM'
/>

当您对过滤条件满意后,可以点击"应用"来过滤数据。您还可以添加更多过滤条件,如下所示。

<Image
  img={add_more_filters}
  size='md'
  alt='添加 range 大于 2000 的过滤条件'
/>

与排序功能类似,点击过滤条件旁边的"x"按钮即可将其删除。

### 同时进行过滤和排序 {#filtering-and-sorting-together}

SQL 控制台允许您同时对表进行过滤和排序。按照上述步骤添加所有需要的过滤条件和排序条件,然后点击"应用"按钮即可。

<Image
  img={filtering_and_sorting_together}
  size='md'
  alt='添加 range 大于 2000 的过滤条件'
/>

### 从过滤和排序条件创建查询 {#creating-a-query-from-filters-and-sorts}

SQL 控制台可以一键将您的排序和过滤条件直接转换为查询语句。只需在工具栏中点击"创建查询"按钮,并使用您选择的排序和过滤参数。点击"创建查询"后,将打开一个新的查询选项卡,其中预填充了与表视图中数据相对应的 SQL 命令。

<Image
  img={create_a_query_from_sorts_and_filters}
  size='md'
  alt='从排序和过滤条件创建查询'
/>

:::note
使用"创建查询"功能时,过滤和排序条件不是必需的。
:::

您可以通过阅读(链接)查询文档来了解有关在 SQL 控制台中进行查询的更多信息。


## 创建和运行查询 {#creating-and-running-a-query}

### 创建查询 {#creating-a-query}

在 SQL 控制台中有两种方式创建新查询。

- 点击标签栏中的"+"按钮
- 从左侧边栏查询列表中选择"新建查询"按钮

<Image img={creating_a_query} size='md' alt='创建查询' />

### 运行查询 {#running-a-query}

要运行查询,请在 SQL 编辑器中输入 SQL 命令,然后点击"运行"按钮或使用快捷键 `cmd / ctrl + enter`。要按顺序编写和运行多个命令,请确保在每个命令后添加分号。

查询执行选项
默认情况下,点击运行按钮将运行 SQL 编辑器中包含的所有命令。SQL 控制台还支持另外两种查询执行选项:

- 运行选定的命令
- 运行光标处的命令

要运行选定的命令,请高亮显示所需的命令或命令序列,然后点击"运行"按钮(或使用 `cmd / ctrl + enter` 快捷键)。当存在选定内容时,您还可以从 SQL 编辑器上下文菜单(通过在编辑器内任意位置右键点击打开)中选择"运行选定内容"。

<Image img={run_selected_query} size='md' alt='运行选定的查询' />

在当前光标位置运行命令可以通过两种方式实现:

- 从扩展运行选项菜单中选择"光标处"(或使用相应的 `cmd / ctrl + shift + enter` 键盘快捷键)

<Image img={run_at_cursor_2} size='md' alt='在光标处运行' />

- 从 SQL 编辑器上下文菜单中选择"在光标处运行"

<Image img={run_at_cursor} size='md' alt='在光标处运行' />

:::note
光标位置的命令在执行时会闪烁黄色。
:::

### 取消查询 {#canceling-a-query}

当查询正在运行时,查询编辑器工具栏中的"运行"按钮将被替换为"取消"按钮。只需点击此按钮或按 `Esc` 键即可取消查询。注意:已返回的任何结果在取消后将保留。

<Image img={cancel_a_query} size='md' alt='取消查询' />

### 保存查询 {#saving-a-query}

保存查询可以让您以后轻松找到它们并与团队成员共享。SQL 控制台还允许您将查询组织到文件夹中。

要保存查询,只需点击工具栏中紧邻"运行"按钮的"保存"按钮。输入所需的名称并点击"保存查询"。

:::note
使用快捷键 `cmd / ctrl + s` 也会保存当前查询标签页中的任何工作。
:::

<Image img={sql_console_save_query} size='md' alt='保存查询' />

或者,您可以通过点击工具栏中的"未命名查询",调整名称并按 Enter 键来同时命名和保存查询:

<Image img={sql_console_rename} size='md' alt='重命名查询' />

### 查询共享 {#query-sharing}

SQL 控制台允许您轻松地与团队成员共享查询。SQL 控制台支持四个访问级别,可以在全局和每个用户的基础上进行调整:

- 所有者(可以调整共享选项)
- 写入权限
- 只读权限
- 无权限

保存查询后,点击工具栏中的"共享"按钮。将出现一个包含共享选项的模态框:

<Image img={sql_console_share} size='md' alt='共享查询' />

要为所有有权访问该服务的组织成员调整查询访问权限,只需调整顶部行中的访问级别选择器:

<Image img={sql_console_edit_access} size='md' alt='编辑访问权限' />

应用上述设置后,所有有权访问该服务 SQL 控制台的团队成员现在都可以查看(和执行)该查询。

要为特定成员调整查询访问权限,请从"添加团队成员"选择器中选择所需的团队成员:

<Image img={sql_console_add_team} size='md' alt='添加团队成员' />

选择团队成员后,应出现一个带有访问级别选择器的新行项:

<Image img={sql_console_edit_member} size='md' alt='编辑团队成员访问权限' />

### 访问共享查询 {#accessing-shared-queries}

如果有查询与您共享,它将显示在 SQL 控制台左侧边栏的"查询"标签页中:

<Image img={sql_console_access_queries} size='md' alt='访问查询' />

### 链接到查询(永久链接) {#linking-to-a-query-permalinks}


已保存的查询也会生成永久链接，这意味着可以发送和接收指向共享查询的链接，并直接打开它们。

查询中可能存在的任何参数的值都会自动作为查询参数添加到已保存查询的 URL 中。例如，如果查询包含 `{start_date: Date}` 和 `{end_date: Date}` 参数，则永久链接可能如下所示：`https://console.clickhouse.cloud/services/:serviceId/console/query/:queryId?param_start_date=2015-01-01&param_end_date=2016-01-01`。



## 高级查询功能 {#advanced-querying-features}

### 搜索查询结果 {#searching-query-results}

执行查询后,您可以使用结果面板中的搜索输入框快速搜索返回的结果集。此功能可帮助您预览添加 `WHERE` 子句后的结果,或简单地检查结果集中是否包含特定数据。在搜索输入框中输入值后,结果面板将更新并返回包含匹配条目的记录。在此示例中,我们将在 `hackernews` 表中查找包含 `ClickHouse` 的评论中所有出现 `breakfast` 的实例(不区分大小写):

<Image img={search_hn} size='md' alt='搜索 Hacker News 数据' />

注意:任何与输入值匹配的字段都会被返回。例如,上面截图中的第三条记录的 `by` 字段不匹配 'breakfast',但 `text` 字段匹配:

<Image img={match_in_body} size='md' alt='正文中的匹配' />

### 调整分页设置 {#adjusting-pagination-settings}

默认情况下,查询结果面板会在单个页面上显示所有结果记录。对于较大的结果集,分页显示结果可能更便于查看。您可以使用结果面板右下角的分页选择器来实现:

<Image img={pagination} size='md' alt='分页选项' />

选择页面大小后将立即对结果集应用分页,导航选项会出现在结果面板页脚的中间位置

<Image img={pagination_nav} size='md' alt='分页导航' />

### 导出查询结果数据 {#exporting-query-result-data}

查询结果集可以直接从 SQL 控制台轻松导出为 CSV 格式。操作方法是打开结果面板工具栏右侧的 `•••` 菜单并选择"下载为 CSV"。

<Image img={download_as_csv} size='md' alt='下载为 CSV' />


## 可视化查询数据 {#visualizing-query-data}

某些数据以图表形式展示时更容易理解。您可以直接在 SQL 控制台中,通过几次点击即可从查询结果数据快速创建可视化图表。作为示例,我们将使用一个计算纽约市出租车行程每周统计数据的查询:

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

<Image img={tabular_query_results} size='md' alt='表格查询结果' />

如果没有可视化,这些结果很难解读。让我们将它们转换为图表。

### 创建图表 {#creating-charts}

要开始构建可视化图表,请从查询结果面板工具栏中选择"Chart"选项。图表配置面板将会显示:

<Image
  img={switch_from_query_to_chart}
  size='md'
  alt='从查询切换到图表'
/>

我们将首先创建一个简单的柱状图,按 `week` 跟踪 `trip_total`。为此,我们将 `week` 字段拖动到 x 轴,将 `trip_total` 字段拖动到 y 轴:

<Image img={trip_total_by_week} size='md' alt='按周统计的行程总数' />

大多数图表类型支持在数值轴上使用多个字段。为了演示,我们将 fare_total 字段拖动到 y 轴上:

<Image img={bar_chart} size='md' alt='柱状图' />

### 自定义图表 {#customizing-charts}

SQL 控制台支持十种图表类型,可以从图表配置面板中的图表类型选择器中选择。例如,我们可以轻松地将之前的图表类型从柱状图更改为面积图:

<Image
  img={change_from_bar_to_area}
  size='md'
  alt='从柱状图更改为面积图'
/>

图表标题与提供数据的查询名称相匹配。更新查询名称将同时更新图表标题:

<Image img={update_query_name} size='md' alt='更新查询名称' />

还可以在图表配置面板的"Advanced"部分调整更多高级图表特性。首先,我们将调整以下设置:

- 副标题
- 轴标题
- x 轴的标签方向

图表将相应更新:

<Image img={update_subtitle_etc} size='md' alt='更新副标题等' />

在某些情况下,可能需要独立调整每个字段的轴刻度。这也可以在图表配置面板的"Advanced"部分通过指定轴范围的最小值和最大值来完成。例如,上面的图表看起来不错,但为了展示 `trip_total` 和 `fare_total` 字段之间的相关性,需要对轴范围进行一些调整:

<Image img={adjust_axis_scale} size='md' alt='调整轴刻度' />
