---
sidebar_label: 'SQL 控制台'
sidebar_position: 1
title: 'SQL 控制台'
slug: /integrations/sql-clients/sql-console
description: '了解 SQL 控制台'
doc_type: 'guide'
keywords: ['sql console', 'query interface', 'web ui', 'sql editor', 'cloud console']
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

SQL 控制台是在 ClickHouse Cloud 中探索和查询数据库的最快、最简便方式。您可以使用 SQL 控制台来：

- 连接到您的 ClickHouse Cloud 服务
- 查看、过滤和排序表数据
- 只需点击几下即可执行查询并将结果数据可视化
- 与团队成员共享查询并更高效地协作。



## 探索表 {#exploring-tables}

### 查看表列表和模式信息 {#viewing-table-list-and-schema-info}

您可以在左侧边栏区域查看 ClickHouse 实例中包含的表的概览。使用左侧栏顶部的数据库选择器可查看特定数据库中的表

<Image
  img={table_list_and_schema}
  size='lg'
  border
  alt='表列表和模式视图,显示左侧边栏中的数据库表'
/>

列表中的表可以展开以查看列名和数据类型

<Image
  img={view_columns}
  size='lg'
  border
  alt='展开的表视图,显示列名和数据类型'
/>

### 探索表数据 {#exploring-table-data}

点击列表中的表可在新标签页中打开。在表视图中,可以轻松查看、选择和复制数据。请注意,复制粘贴到电子表格应用程序(如 Microsoft Excel 和 Google Sheets)时会保留结构和格式。您可以使用页脚中的导航在表数据页面之间切换(每页 30 行)。

<Image
  img={abc}
  size='lg'
  border
  alt='表视图显示可选择和复制的数据'
/>

### 检查单元格数据 {#inspecting-cell-data}

单元格检查器工具可用于查看单个单元格中包含的大量数据。要打开它,请右键单击单元格并选择"检查单元格"。可以通过点击检查器内容右上角的复制图标来复制单元格检查器的内容。

<Image
  img={inspecting_cell_content}
  size='lg'
  border
  alt='单元格检查器对话框,显示所选单元格的内容'
/>


## 过滤和排序表 {#filtering-and-sorting-tables}

### 对表进行排序 {#sorting-a-table}

要在 SQL 控制台中对表进行排序,请打开表并选择工具栏中的"排序"按钮。该按钮将打开一个菜单,允许您配置排序方式。您可以选择用于排序的列,并配置排序顺序(升序或降序)。选择"应用"或按 Enter 键即可对表进行排序

<Image
  img={sort_descending_on_column}
  size='lg'
  border
  alt='排序对话框,显示对列进行降序排序的配置'
/>

SQL 控制台还允许您为表添加多个排序条件。再次点击"排序"按钮即可添加另一个排序条件。注意:排序按照它们在排序面板中出现的顺序(从上到下)依次应用。要删除某个排序条件,只需点击该排序条件旁边的"x"按钮。

### 过滤表 {#filtering-a-table}

要在 SQL 控制台中过滤表,请打开表并选择"过滤"按钮。与排序类似,该按钮将打开一个菜单,允许您配置过滤条件。您可以选择用于过滤的列并设置必要的条件。SQL 控制台会智能地显示与列中数据类型相对应的过滤选项。

<Image
  img={filter_on_radio_column_equal_gsm}
  size='lg'
  border
  alt='过滤对话框,显示将 radio 列过滤为等于 GSM 的配置'
/>

当您对过滤条件满意后,可以选择"应用"来过滤数据。您还可以添加其他过滤条件,如下所示。

<Image
  img={add_more_filters}
  size='lg'
  border
  alt='对话框显示如何添加 range 大于 2000 的附加过滤条件'
/>

与排序功能类似,点击过滤条件旁边的"x"按钮即可将其删除。

### 同时过滤和排序 {#filtering-and-sorting-together}

SQL 控制台允许您同时对表进行过滤和排序。为此,请按照上述步骤添加所有所需的过滤条件和排序条件,然后点击"应用"按钮。

<Image
  img={filtering_and_sorting_together}
  size='lg'
  border
  alt='界面显示同时应用过滤和排序'
/>

### 从过滤和排序创建查询 {#creating-a-query-from-filters-and-sorts}

SQL 控制台可以一键将您的排序和过滤条件直接转换为查询。只需在工具栏中选择"创建查询"按钮,并使用您选择的排序和过滤参数。点击"创建查询"后,将打开一个新的查询选项卡,其中预填充了与表视图中数据相对应的 SQL 命令。

<Image
  img={create_a_query_from_sorts_and_filters}
  size='lg'
  border
  alt='界面显示可从过滤和排序生成 SQL 的"创建查询"按钮'
/>

:::note
使用"创建查询"功能时,过滤和排序并非必需。
:::

您可以通过阅读(链接)查询文档来了解有关在 SQL 控制台中进行查询的更多信息。


## 创建和运行查询 {#creating-and-running-a-query}

### 创建查询 {#creating-a-query}

在 SQL 控制台中有两种方式创建新查询。

- 点击标签栏中的"+"按钮
- 从左侧边栏查询列表中选择"新建查询"按钮

<Image
  img={creating_a_query}
  size='lg'
  border
  alt='显示如何使用 + 按钮或新建查询按钮创建新查询的界面'
/>

### 运行查询 {#running-a-query}

要运行查询,请在 SQL 编辑器中输入 SQL 命令,然后点击"运行"按钮或使用快捷键 `cmd / ctrl + enter`。要按顺序编写和运行多个命令,请确保在每个命令后添加分号。

查询执行选项
默认情况下,点击运行按钮将运行 SQL 编辑器中包含的所有命令。SQL 控制台还支持另外两种查询执行选项:

- 运行选定的命令
- 运行光标处的命令

要运行选定的命令,请高亮显示所需的命令或命令序列,然后点击"运行"按钮(或使用 `cmd / ctrl + enter` 快捷键)。当存在选定内容时,您还可以从 SQL 编辑器上下文菜单(通过在编辑器内任意位置右键点击打开)中选择"运行选定内容"。

<Image
  img={run_selected_query}
  size='lg'
  border
  alt='显示如何运行选定的 SQL 查询部分的界面'
/>

在当前光标位置运行命令可以通过两种方式实现:

- 从扩展运行选项菜单中选择"在光标处运行"(或使用相应的 `cmd / ctrl + shift + enter` 键盘快捷键)

<Image
  img={run_at_cursor_2}
  size='lg'
  border
  alt='扩展运行选项菜单中的"在光标处运行"选项'
/>

- 从 SQL 编辑器上下文菜单中选择"在光标处运行"

<Image
  img={run_at_cursor}
  size='lg'
  border
  alt='SQL 编辑器上下文菜单中的"在光标处运行"选项'
/>

:::note
光标位置处的命令在执行时会闪烁黄色。
:::

### 取消查询 {#canceling-a-query}

当查询正在运行时,查询编辑器工具栏中的"运行"按钮将被替换为"取消"按钮。只需点击此按钮或按 `Esc` 键即可取消查询。注意:已返回的任何结果在取消后将保留。

<Image
  img={cancel_a_query}
  size='lg'
  border
  alt='查询执行期间出现的取消按钮'
/>

### 保存查询 {#saving-a-query}

如果之前未命名,您的查询应该被称为"未命名查询"。点击查询名称以更改它。重命名查询将导致查询被保存。

<Image
  img={give_a_query_a_name}
  size='lg'
  border
  alt='显示如何从未命名查询重命名查询的界面'
/>

您还可以使用保存按钮或 `cmd / ctrl + s` 键盘快捷键来保存查询。

<Image
  img={save_the_query}
  size='lg'
  border
  alt='查询编辑器工具栏中的保存按钮'
/>


## 使用 GenAI 管理查询 {#using-genai-to-manage-queries}

此功能允许用户以自然语言问题的形式编写查询,查询控制台将根据可用表的上下文自动生成 SQL 查询。GenAI 还可以帮助用户调试查询。

有关 GenAI 的更多信息,请查看[在 ClickHouse Cloud 中宣布 GenAI 驱动的查询建议博客文章](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud)。

### 表设置 {#table-setup}

让我们导入英国房价支付示例数据集,并使用它来创建一些 GenAI 查询。

1. 打开 ClickHouse Cloud 服务。
1. 点击 _+_ 图标创建新查询。
1. 粘贴并运行以下代码:

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

   此查询应在大约 1 秒内完成。完成后,您将拥有一个名为 `uk_price_paid` 的空表。

1. 创建新查询并粘贴以下查询:

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

此查询从 `gov.uk` 网站获取数据集。该文件约为 4GB,因此此查询需要几分钟才能完成。ClickHouse 处理完查询后,`uk_price_paid` 表中将包含完整的数据集。

#### 查询创建 {#query-creation}

让我们使用自然语言创建查询。

1. 选择 **uk_price_paid** 表,然后点击 **Create Query**。
1. 点击 **Generate SQL**。系统可能会要求您同意将查询发送到 Chat-GPT。您必须选择 **I agree** 才能继续。
1. 现在您可以使用此提示输入自然语言查询,并让 ChatGPT 将其转换为 SQL 查询。在此示例中,我们将输入:

   > Show me the total price and total number of all uk_price_paid transactions by year.

1. 控制台将生成所需的查询并在新标签页中显示。在我们的示例中,GenAI 创建了以下查询:

   ```sql
   -- Show me the total price and total number of all uk_price_paid transactions by year.
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. 验证查询正确后,点击 **Run** 执行。

### 调试 {#debugging}

现在,让我们测试 GenAI 的查询调试功能。

1. 点击 _+_ 图标创建新查询并粘贴以下代码:


```sql
   -- 按年份显示 uk_price_paid 表中所有交易的总价和交易总数。
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
```

1. 点击 **Run**。查询会失败，因为我们试图从 `pricee` 而不是 `price` 中获取值。
2. 点击 **Fix Query**。
3. GenAI 会尝试修复该查询。在本例中，它将 `pricee` 更改为 `price`。它还判断在此场景中使用 `toYear` 是更合适的函数。
4. 选择 **Apply** 将建议的更改应用到你的查询中，然后点击 **Run**。

请记住，GenAI 是一项实验性功能。在针对任何数据集运行由 GenAI 生成的查询时，请务必谨慎。


## 高级查询功能 {#advanced-querying-features}

### 搜索查询结果 {#searching-query-results}

执行查询后,您可以使用结果面板中的搜索输入框快速搜索返回的结果集。此功能可帮助您预览添加 `WHERE` 子句后的结果,或简单地检查结果集中是否包含特定数据。在搜索输入框中输入值后,结果面板将更新并返回包含匹配条目的记录。在此示例中,我们将在 `hackernews` 表中查找包含 `ClickHouse` 的评论中所有 `breakfast` 的实例(不区分大小写):

<Image img={search_hn} size='lg' border alt='搜索 Hacker News 数据' />

注意:任何与输入值匹配的字段都会被返回。例如,上面截图中的第三条记录的 `by` 字段不匹配 'breakfast',但 `text` 字段匹配:

<Image img={match_in_body} size='lg' border alt='正文中的匹配' />

### 调整分页设置 {#adjusting-pagination-settings}

默认情况下,查询结果面板会在单个页面上显示所有结果记录。对于较大的结果集,分页显示结果可能更便于查看。您可以使用结果面板右下角的分页选择器来实现:

<Image img={pagination} size='lg' border alt='分页选项' />

选择页面大小后将立即对结果集应用分页,导航选项会出现在结果面板页脚的中间位置

<Image img={pagination_nav} size='lg' border alt='分页导航' />

### 导出查询结果数据 {#exporting-query-result-data}

查询结果集可以直接从 SQL 控制台轻松导出为 CSV 格式。操作方法是打开结果面板工具栏右侧的 `•••` 菜单并选择"下载为 CSV"。

<Image img={download_as_csv} size='lg' border alt='下载为 CSV' />


## 可视化查询数据 {#visualizing-query-data}

某些数据以图表形式呈现时更容易理解。您可以直接在 SQL 控制台中,通过几次点击即可从查询结果数据快速创建可视化图表。作为示例,我们将使用一个计算纽约市出租车行程每周统计数据的查询:

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

<Image
  img={tabular_query_results}
  size='lg'
  border
  alt='表格查询结果'
/>

如果没有可视化,这些结果很难解读。让我们将它们转换为图表。

### 创建图表 {#creating-charts}

要开始构建可视化图表,请从查询结果面板工具栏中选择"Chart"选项。图表配置面板将会出现:

<Image
  img={switch_from_query_to_chart}
  size='lg'
  border
  alt='从查询切换到图表'
/>

我们将首先创建一个简单的柱状图,按 `week` 跟踪 `trip_total`。为此,我们将 `week` 字段拖动到 x 轴,将 `trip_total` 字段拖动到 y 轴:

<Image img={trip_total_by_week} size='lg' border alt='按周统计的行程总数' />

大多数图表类型支持在数值轴上使用多个字段。为了演示,我们将 fare_total 字段拖动到 y 轴上:

<Image img={bar_chart} size='lg' border alt='柱状图' />

### 自定义图表 {#customizing-charts}

SQL 控制台支持十种图表类型,可以从图表配置面板中的图表类型选择器中选择。例如,我们可以轻松地将之前的图表类型从柱状图更改为面积图:

<Image
  img={change_from_bar_to_area}
  size='lg'
  border
  alt='从柱状图更改为面积图'
/>

图表标题与提供数据的查询名称相匹配。更新查询名称将导致图表标题也随之更新:

<Image img={update_query_name} size='lg' border alt='更新查询名称' />

还可以在图表配置面板的"Advanced"部分调整更多高级图表特性。首先,我们将调整以下设置:

- 副标题
- 坐标轴标题
- x 轴的标签方向

我们的图表将相应更新:

<Image img={update_subtitle_etc} size='lg' border alt='更新副标题等' />

在某些场景中,可能需要独立调整每个字段的坐标轴刻度。这也可以在图表配置面板的"Advanced"部分通过指定坐标轴范围的最小值和最大值来完成。例如,上面的图表看起来不错,但为了展示 `trip_total` 和 `fare_total` 字段之间的相关性,坐标轴范围需要进行一些调整:

<Image img={adjust_axis_scale} size='lg' border alt='调整坐标轴刻度' />


## 共享查询 {#sharing-queries}

SQL 控制台支持与团队共享查询。查询共享后,团队所有成员均可查看和编辑该查询。共享查询是团队协作的有效方式。

要共享查询,请点击查询工具栏中的"Share"按钮。

<Image
  img={sql_console_share}
  size='lg'
  border
  alt='查询工具栏中的共享按钮'
/>

系统将打开一个对话框,允许您与团队所有成员共享查询。如果您拥有多个团队,可以选择要共享查询的目标团队。

<Image
  img={sql_console_edit_access}
  size='lg'
  border
  alt='编辑共享查询访问权限的对话框'
/>

<Image
  img={sql_console_add_team}
  size='lg'
  border
  alt='将团队添加到共享查询的界面'
/>

<Image
  img={sql_console_edit_member}
  size='lg'
  border
  alt='编辑成员对共享查询访问权限的界面'
/>

在某些场景下,可能需要独立调整各字段的坐标轴刻度。这可以在图表配置面板的"Advanced"部分中通过指定坐标轴范围的最小值和最大值来实现。例如,上图显示效果良好,但为了展示 `trip_total` 和 `fare_total` 字段之间的相关性,需要对坐标轴范围进行适当调整:

<Image
  img={sql_console_access_queries}
  size='lg'
  border
  alt='查询列表中的"与我共享"部分'
/>
