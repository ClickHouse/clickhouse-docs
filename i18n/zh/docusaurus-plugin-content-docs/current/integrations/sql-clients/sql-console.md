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

SQL 控制台是探索和查询您在 ClickHouse Cloud 中数据库的最快和最简单的方法。您可以使用 SQL 控制台来：

- 连接到您的 ClickHouse Cloud 服务
- 查看、筛选和排序表数据
- 执行查询并仅需几次点击即可可视化结果数据
- 与团队成员共享查询并更有效地协作。

## 探索表 {#exploring-tables}

### 查看表列表和架构信息 {#viewing-table-list-and-schema-info}

您 ClickHouse 实例中包含的表的概述可以在左侧边栏区域找到。使用左侧栏顶部的数据库选择器查看特定数据库中的表。

<Image img={table_list_and_schema} size="lg" border alt="表列表和架构视图，显示左侧边栏中的数据库表"/>

列表中的表也可以展开以查看列和类型。

<Image img={view_columns} size="lg" border alt="展开表视图，显示列名和数据类型"/>

### 探索表数据 {#exploring-table-data}

在列表中单击一个表以在新标签页中打开。在表视图中，可以轻松查看、选择和复制数据。请注意，当复制粘贴到电子表格应用程序（如 Microsoft Excel 和 Google Sheets）时，结构和格式会被保留。您可以使用底部导航在表数据的页面之间翻转（以 30 行为增量分页）。

<Image img={abc} size="lg" border alt="表视图显示可以选择和复制的数据"/>

### 检查单元格数据 {#inspecting-cell-data}

可使用单元格检查工具查看单个单元格内的大量数据。要打开它，请右键单击单元格并选择“检查单元格”。您可以通过单元格检查器内容右上角的复制图标复制单元格内容。

<Image img={inspecting_cell_content} size="lg" border alt="单元格检查器对话框，显示所选单元格的内容"/>

## 筛选和排序表 {#filtering-and-sorting-tables}

### 排序表 {#sorting-a-table}

要在 SQL 控制台中对表进行排序，打开一个表并选择工具栏中的“排序”按钮。该按钮将打开一个菜单，允许您配置排序。您可以选择一个用于排序的列，并配置排序的顺序（升序或降序）。选择“应用”或按 Enter 键以对表进行排序。

<Image img={sort_descending_on_column} size="lg" border alt="排序对话框，显示按列的降序排序配置"/>

SQL 控制台还允许您向表添加多个排序。再次单击“排序”按钮以添加另一个排序。注意：排序按其在排序面板中的出现顺序（从上到下）应用。要移除某个排序，只需单击排序旁边的“x”按钮。

### 筛选表 {#filtering-a-table}

要在 SQL 控制台中筛选表，打开一个表并选择“筛选”按钮。与排序一样，该按钮将打开一个菜单，允许您配置筛选。您可以选择一个用于筛选的列并选择所需的条件。SQL 控制台智能展示与列中包含的数据类型相对应的筛选选项。

<Image img={filter_on_radio_column_equal_gsm} size="lg" border alt="筛选对话框，显示配置筛选无线电列等于 GSM 的选项"/>

当您对筛选感到满意时，可以选择“应用”来筛选数据。您还可以添加附加筛选，如下所示。

<Image img={add_more_filters} size="lg" border alt="对话框，显示如何添加大于 2000 的附加筛选"/>

与排序功能类似，单击筛选旁边的“x”按钮以将其移除。

### 同时筛选和排序 {#filtering-and-sorting-together}

SQL 控制台允许您同时筛选和排序表。为此，使用上述步骤添加所有所需的筛选和排序，并单击“应用”按钮。

<Image img={filtering_and_sorting_together} size="lg" border alt="界面，显示同时应用的筛选和排序"/>

### 从筛选和排序创建查询 {#creating-a-query-from-filters-and-sorts}

SQL 控制台可以一键将您的排序和筛选直接转换为查询。只需从工具栏中选择“创建查询”按钮，并选择您的筛选和排序参数。单击“创建查询”后，将打开一个新查询标签，预填充与您表视图中包含的数据相对应的 SQL 命令。

<Image img={create_a_query_from_sorts_and_filters} size="lg" border alt="界面显示创建查询按钮，该按钮根据筛选和排序生成 SQL"/>

:::note
使用“创建查询”功能时，筛选和排序不是强制的。
:::

您可以通过阅读 (link) 查询文档进一步了解 SQL 控制台中的查询。

## 创建和运行查询 {#creating-and-running-a-query}

### 创建查询 {#creating-a-query}

在 SQL 控制台中有两种创建新查询的方法。

- 单击选项卡栏中的“+”按钮
- 从左侧边栏查询列表中选择“新查询”按钮

<Image img={creating_a_query} size="lg" border alt="界面，显示如何通过 + 按钮或新查询按钮创建新查询"/>

### 运行查询 {#running-a-query}

要运行查询，请在 SQL 编辑器中输入您的 SQL 命令，并单击“运行”按钮或使用快捷键 `cmd / ctrl + enter`。要按顺序编写和运行多个命令，请确保在每个命令后添加分号。

查询执行选项
默认情况下，单击运行按钮将运行 SQL 编辑器中包含的所有命令。SQL 控制台还支持两种其他查询执行选项：

- 运行选定命令
- 在光标位置运行命令

要运行所选命令，突出显示所需命令或命令序列，然后单击“运行”按钮（或使用快捷键 `cmd / ctrl + enter`）。在存在选择时，还可以从 SQL 编辑器上下文菜单中选择“运行选定内容”（右键单击编辑器中的任何位置打开）。

<Image img={run_selected_query} size="lg" border alt="界面，显示如何运行所选部分的 SQL 查询"/>

在当前光标位置运行命令可以通过两种方式来完成：

- 从扩展的运行选项菜单中选择“在光标处运行”（或使用相应的 `cmd / ctrl + shift + enter` 快捷键）

<Image img={run_at_cursor_2} size="lg" border alt="扩展运行选项菜单中的在光标处运行选项"/>

  - 从 SQL 编辑器上下文菜单中选择“在光标处运行”

<Image img={run_at_cursor} size="lg" border alt="SQL 编辑器上下文菜单中的在光标处运行选项"/>

:::note
执行时，光标位置的命令会闪烁黄色。
:::

### 取消查询 {#canceling-a-query}

在查询运行时，查询编辑器工具栏中的“运行”按钮将被“取消”按钮替换。只需单击此按钮或按 `Esc` 键即可取消查询。注意：取消后，已返回的任何结果将继续存在。

<Image img={cancel_a_query} size="lg" border alt="查询执行期间出现的取消按钮"/>

### 保存查询 {#saving-a-query}

如果尚未命名，您的查询将被称为“无标题查询”。单击查询名称以更改它。重命名查询将导致查询被保存。

<Image img={give_a_query_a_name} size="lg" border alt="界面，显示如何从无标题查询重命名查询"/>

您还可以使用保存按钮或 `cmd / ctrl + s` 快捷键来保存查询。

<Image img={save_the_query} size="lg" border alt="查询编辑器工具栏中的保存按钮"/>

## 使用 GenAI 管理查询 {#using-genai-to-manage-queries}

此功能允许用户用自然语言问题编写查询，并让查询控制台根据可用表的上下文创建 SQL 查询。GenAI 还可以帮助用户调试他们的查询。

有关 GenAI 的更多信息，请查看 [宣布在 ClickHouse Cloud 中的 GenAI 驱动查询建议博文](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud)。

### 表设置 {#table-setup}

让我们导入英国价格示例数据集，并使用它来创建一些 GenAI 查询。

1. 打开一个 ClickHouse Cloud 服务。
2. 通过单击 _+_ 图标创建新查询。
3. 粘贴并运行以下代码：

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

   该查询应该大约需要 1 秒完成。一旦完成，您将有一个名为 `uk_price_paid` 的空表。

4. 创建一个新查询并粘贴以下查询：

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

该查询从 `gov.uk` 网站提取数据集。此文件约 4GB，因此此查询将需要几分钟完成。一旦 ClickHouse 处理完查询，您应该在 `uk_price_paid` 表中获得整个数据集。

#### 查询创建 {#query-creation}

让我们使用自然语言创建一个查询。

1. 选择 **uk_price_paid** 表，然后点击 **创建查询**。
2. 点击 **生成 SQL**。您可能会被要求接受将您的查询发送到 Chat-GPT。您必须选择 **我同意** 以继续。
3. 现在您可以使用此提示输入自然语言查询，并让 ChatGPT 将其转换为 SQL 查询。在这个例子中，我们将输入：

   > 显示所有 uk_price_paid 交易按年计算的总价和总数。

4. 控制台将生成我们需要的查询，并在新标签中显示。在我们的示例中，GenAI 创建了以下查询：

```sql
-- Show me the total price and total number of all uk_price_paid transactions by year.
SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
FROM uk_price_paid
GROUP BY year(date)
```

5. 一旦您验证查询是正确的，请点击 **运行** 执行它。

### 调试 {#debugging}

现在，让我们测试 GenAI 的查询调试能力。

1. 通过单击 _+_ 图标创建新查询并粘贴以下代码：

```sql
-- Show me the total price and total number of all uk_price_paid transactions by year.
SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
FROM uk_price_paid
GROUP BY year(date)
```

2. 点击 **运行**。由于我们尝试从 `pricee` 获取值而不是 `price`，查询失败。
3. 点击 **修复查询**。
4. GenAI 将尝试修复查询。在这种情况下，它将 `pricee` 更改为 `price`。它还意识到 `toYear` 是在这种情况下使用的更好函数。
5. 选择 **应用** 以将建议的更改添加到您的查询并点击 **运行**。

请记住，GenAI 是一项实验性功能。对任何数据集运行 GenAI 生成的查询时要格外小心。

## 高级查询功能 {#advanced-querying-features}

### 搜索查询结果 {#searching-query-results}

在查询执行后，您可以使用结果窗格中的搜索输入快速搜索返回结果集。此功能可帮助预览附加 `WHERE` 子句的结果或简单地检查某些数据是否包含在结果集中。在搜索输入中输入值后，结果窗格将更新并返回包含与输入值匹配的条目。以这个例子为例，我们将查找 `hackernews` 表中包含 `ClickHouse` 的所有评论的 `breakfast` 的实例（不区分大小写）：

<Image img={search_hn} size="lg" border alt="搜索 Hacker News 数据"/>

注意：任何匹配输入值的字段都会被返回。例如，上述截图中的第三条记录在 `by` 字段中不匹配 “breakfast”，但在 `text` 字段中是匹配的：

<Image img={match_in_body} size="lg" border alt="正文中的匹配"/>

### 调整分页设置 {#adjusting-pagination-settings}

默认情况下，查询结果窗格将单个页面上显示每个结果记录。对于更大的结果集，分页结果以便于查看可能更可取。这可以通过结果窗格右下角的分页选择器来完成：

<Image img={pagination} size="lg" border alt="分页选项"/>

选择页面大小将立即对结果集应用分页，导航选项将出现在结果窗格底部的中间位置。

<Image img={pagination_nav} size="lg" border alt="分页导航"/>

### 导出查询结果数据 {#exporting-query-result-data}

查询结果集可以直接从 SQL 控制台轻松导出为 CSV 格式。为此，请打开结果窗格工具栏右侧的 `•••` 菜单，选择“下载为 CSV”。

<Image img={download_as_csv} size="lg" border alt="下载为 CSV"/>

## 可视化查询数据 {#visualizing-query-data}

某些数据在图表中更容易解读。您可以直接从 SQL 控制台仅需几次点击即可快速创建查询结果数据的可视化。例如，我们将使用计算纽约市出租车行程每周统计数据的查询：

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

<Image img={tabular_query_results} size="lg" border alt="表格查询结果"/>

如果没有可视化，这些结果是难以解读的。让我们将它们转换为图表。

### 创建图表 {#creating-charts}

要开始构建您的可视化，从查询结果窗格工具栏中选择“图表”选项。将出现一个图表配置窗格：

<Image img={switch_from_query_to_chart} size="lg" border alt="从查询切换到图表"/>

我们将首先创建一个简单的条形图来追踪 `trip_total` 按 `week`。为此，我们将拖动 `week` 字段到 x 轴，`trip_total` 字段到 y 轴：

<Image img={trip_total_by_week} size="lg" border alt="按周划分的行程总数"/>

大多数图表类型支持在数值轴上使用多个字段。为了演示，我们将 `fare_total` 字段拖到 y 轴上：

<Image img={bar_chart} size="lg" border alt="条形图"/>

### 自定义图表 {#customizing-charts}

SQL 控制台支持可以从图表配置窗格中的图表类型选择器中选择的十种图表类型。例如，我们可以轻松将之前的图表类型从条形图更改为面积图：

<Image img={change_from_bar_to_area} size="lg" border alt="从条形图更改为面积图"/>

图表标题与提供数据的查询名称匹配。更新查询名称将导致图表标题也更新：

<Image img={update_query_name} size="lg" border alt="更新查询名称"/>

在图表配置窗格的“高级”部分中，还可以调整许多更高级的图表特性。首先，我们将调整以下设置：

- 副标题
- 轴标题
- x 轴的标签方向

我们的图表将相应更新：

<Image img={update_subtitle_etc} size="lg" border alt="更新副标题等"/>

在某些情况下，可能需要独立调整每个字段的轴比例。这也可以通过在图表配置窗格的“高级”部分指定轴范围的最小值和最大值来完成。例如，上面的图表看起来不错，但为了演示 `trip_total` 和 `fare_total` 字段之间的关联，轴范围需要一些调整：

<Image img={adjust_axis_scale} size="lg" border alt="调整轴比例"/>

## 共享查询 {#sharing-queries}

SQL 控制台使您能够与团队共享查询。当查询被共享时，团队的所有成员都可以查看和编辑该查询。共享查询是与团队协作的好方法。

要共享查询，请单击查询工具栏中的“共享”按钮。

<Image img={sql_console_share} size="lg" border alt="查询工具栏中的共享按钮"/>

将打开一个对话框，允许您与团队的所有成员共享查询。如果您有多个团队，可以选择与哪个团队共享查询。

<Image img={sql_console_edit_access} size="lg" border alt="编辑对共享查询的访问权限的对话框"/>

<Image img={sql_console_add_team} size="lg" border alt="共享查询时为团队添加成员的界面"/>

<Image img={sql_console_edit_member} size="lg" border alt="编辑共享查询的成员访问权限的界面"/>

在某些情况下，可能需要独立调整每个字段的轴比例。这也可以通过在图表配置窗格的“高级”部分指定轴范围的最小值和最大值来完成。例如，上面的图表看起来不错，但为了演示 `trip_total` 和 `fare_total` 字段之间的关联，轴范围需要进行一些调整：

<Image img={sql_console_access_queries} size="lg" border alt="查询列表中的共享给我的部分"/>
