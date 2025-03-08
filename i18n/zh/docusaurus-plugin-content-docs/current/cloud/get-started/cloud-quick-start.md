---
sidebar_position: 1
slug: /cloud/get-started/cloud-quick-start
sidebar_label: 云快速入门
keywords: [clickhouse, 安装, 入门, 快速入门]
pagination_next: cloud/get-started/sql-console
---
import signup_page from '@site/static/images/_snippets/signup_page.png';
import select_plan from '@site/static/images/_snippets/select_plan.png';
import createservice1 from '@site/static/images/_snippets/createservice1.png';
import scaling_limits from '@site/static/images/_snippets/scaling_limits.png';
import createservice8 from '@site/static/images/_snippets/createservice8.png';
import show_databases from '@site/static/images/_snippets/show_databases.png';
import service_connect from '@site/static/images/_snippets/service_connect.png';
import data_sources from '@site/static/images/_snippets/data_sources.png';
import select_data_source from '@site/static/images/_snippets/select_data_source.png';
import client_details from '@site/static/images/_snippets/client_details.png';
import new_rows_from_csv from '@site/static/images/_snippets/new_rows_from_csv.png';
import SQLConsoleDetail from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_launch_sql_console.md';


# ClickHouse 云快速入门

获取并运行 ClickHouse 的最快、最简单的方法是在 [ClickHouse Cloud](https://console.clickhouse.cloud) 中创建一个新服务。

## 1. 创建 ClickHouse 服务 {#1-create-a-clickhouse-service}

要在 [ClickHouse Cloud](https://console.clickhouse.cloud) 中创建免费 ClickHouse 服务，您只需通过以下步骤注册：

  - 在 [注册页面](https://console.clickhouse.cloud/signUp) 创建一个帐户
  - 您可以选择使用电子邮件或通过 Google SSO、Microsoft SSO、AWS Marketplace、Google Cloud 或 Microsoft Azure 注册
  - 如果您使用电子邮件和密码注册，请记住在收到的电子邮件中的链接内的 24 小时内验证您的电子邮件地址
  - 使用刚创建的用户名和密码登录

<div class="eighty-percent">
    <img src={signup_page} class="image" alt="选择计划" />
</div>
<br/>

登录后，ClickHouse Cloud 启动入职向导，指导您创建新的 ClickHouse 服务。您将首先被要求 [选择一个计划](/cloud/manage/cloud-tiers):

<div class="eighty-percent">
    <img src={select_plan} class="image" alt="选择计划" />
</div>
<br/>

:::tip
我们建议对大多数工作负载选择 Scale 级别。
有关层的更多详细信息，请参见 [这里](/cloud/manage/cloud-tiers)
:::

选择计划时，您需要选择要部署首个服务的目标区域。
可用的具体选项将取决于所选级别。
在以下步骤中，我们假设用户选择了推荐的 Scale 级别。

选择要部署服务的区域，并为您的新服务命名：

<div class="eighty-percent">
    <img src={createservice1} class="image" alt="新 ClickHouse 服务" />
</div>
<br/>

默认情况下，Scale 级别将创建 3 个副本，每个副本具有 4 个 VCPUs 和 16 GiB RAM。默认情况下，将在 Scale 级别启用 [垂直自动缩放](/manage/scaling#vertical-auto-scaling)。

用户可以根据需要自定义服务资源，指定副本之间缩放的最小和最大大小。准备就绪后，选择 `创建服务`。

<div class="eighty-percent">
    <img src={scaling_limits} class="image" alt="缩放限制" />
</div>
<br/>

恭喜！您的 ClickHouse Cloud 服务已启动并运行，入职流程完成。继续阅读以获取有关如何开始摄取和查询您的数据的详细信息。

## 2. 连接到 ClickHouse {#2-connect-to-clickhouse}
连接到 ClickHouse 有两种方法：
  - 通过我们的基于网络的 SQL 控制台连接
  - 与您的应用程序连接

### 使用 SQL 控制台连接 {#connect-using-sql-console}

为了快速入门，ClickHouse 提供了一个基于 Web 的 SQL 控制台，您将在完成入职后被重定向到此控制台。

<div class="eighty-percent">
    <img src={createservice8} class="image" alt="SQL 控制台" />
</div>
<br/>

创建一个查询标签并输入简单的查询以验证您的连接是否正常工作：

<br/>
```sql
SHOW databases
```

您应该在列表中看到 4 个数据库，以及您可能已添加的任何数据库。

<div class="eighty-percent">
    <img src={show_databases} class="image" alt="SQL 控制台" />
</div>
<br/>

就这样 - 您已准备好开始使用您的新 ClickHouse 服务！

### 与您的应用程序连接 {#connect-with-your-app}

从导航菜单中按下连接按钮。一个模态框将打开，提供您的服务凭据，并提供有关如何与您的接口或语言客户端连接的一组说明。

<div class="eighty-percent">
    <img src={service_connect} class="image" alt="服务连接" />
</div>
<br/>

如果您看不到您的语言客户端，您可能希望查看我们的 [集成列表](/integrations)。

## 3. 添加数据 {#3-add-data}

ClickHouse 处理数据时效果更佳！有多种添加数据的方法，其中大多数可以在数据源页面上找到，该页面可以在导航菜单中访问。

<div class="eighty-percent">
    <img src={data_sources} class="image" alt="数据源" />
</div>
<br/>

您可以使用以下方法上传数据：
  - 设置一个 ClickPipe 以开始从 S3、Postgres、Kafka、GCS 等数据源摄取数据
  - 使用 SQL 控制台
  - 使用 ClickHouse 客户端
  - 上传文件 - 支持的格式包括 JSON、CSV 和 TSV
  - 从文件 URL 上传数据

### ClickPipes {#clickpipes}

[ClickPipes](http://clickhouse.com/docs/integrations/clickpipes) 是一个管理集成平台，可以通过单击几下按钮来简单地从各种来源摄取数据。为最苛刻的工作负载而设计，ClickPipes 的强大且可扩展的架构可确保一致的性能和可靠性。ClickPipes 可用于长期流媒体需求或一次性数据加载作业。

<div class="eighty-percent">
    <img src={select_data_source} class="image" alt="选择数据源" />
</div>
<br/>

### 使用 SQL 控制台添加数据 {#add-data-using-the-sql-console}

与大多数数据库管理系统一样，ClickHouse 将表按逻辑分组为 **数据库**。使用 [`CREATE DATABASE`](../../sql-reference/statements/create/database.md) 命令在 ClickHouse 中创建一个新数据库：

```sql
CREATE DATABASE IF NOT EXISTS helloworld
```

运行以下命令在 `helloworld` 数据库中创建名为 `my_first_table` 的表：

```sql
CREATE TABLE helloworld.my_first_table
(
    user_id UInt32,
    message String,
    timestamp DateTime,
    metric Float32
)
ENGINE = MergeTree()
PRIMARY KEY (user_id, timestamp)
```

在上面的示例中，`my_first_table` 是具有四列的 [`MergeTree`](../../engines/table-engines/mergetree-family/mergetree.md) 表：

  - `user_id`:  32 位无符号整数（[UInt32](../../sql-reference/data-types/int-uint.md)）
  - `message`: [String](../../sql-reference/data-types/string.md) 数据类型，替代其他数据库系统中的 `VARCHAR`、`BLOB`、`CLOB` 等类型
  - `timestamp`: [DateTime](../../sql-reference/data-types/datetime.md) 值，表示某一时刻
  - `metric`: 32 位浮点数（[Float32](../../sql-reference/data-types/float.md)）

:::note 表引擎
表引擎决定：
  - 数据如何存储以及存储位置
  - 支持哪些查询
  - 数据是否被复制
<br/>
有许多表引擎可供选择，但对于单节点 ClickHouse 服务器上的简单表来说，[`MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) 是您可能的选择。
:::

#### 对主键的简要介绍 {#a-brief-intro-to-primary-keys}

在继续之前，了解 ClickHouse 中主键的工作原理是很重要的（主键的实现可能看起来出乎意料！）：

  - ClickHouse 中的主键对表中的每一行 **_不是唯一的_**

ClickHouse 表的主键决定了数据写入磁盘时的排序方式。每 8,192 行或 10MB 数据（称为 **索引粒度**）会在主键索引文件中创建一个条目。这个粒度概念创建了一个 **稀疏索引**，可以轻松地适应内存，粒度表示在 `SELECT` 查询期间处理的最小列数据块。

主键可以使用 `PRIMARY KEY` 参数定义。如果您定义一个未指定 `PRIMARY KEY` 的表，则键成为 `ORDER BY` 子句中指定的元组。如果您同时指定了 `PRIMARY KEY` 和 `ORDER BY`，则主键必须是排序顺序的子集。

主键也是排序键，即 `(user_id, timestamp)` 的元组。因此，存储在每个列文件中的数据将按 `user_id` 然后按 `timestamp` 进行排序。

要深入了解 ClickHouse 的核心概念，请参见 [“核心概念”](../../managing-data/core-concepts/index.md)。

#### 将数据插入您的表 {#insert-data-into-your-table}

您可以使用熟悉的 [`INSERT INTO TABLE`](../../sql-reference/statements/insert-into.md) 命令，但重要的是要了解，每次插入到 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) 表中都会在存储中创建一个 **部分**。

:::tip ClickHouse 最佳实践
每批插入大量行 - 幾万行甚至數百万行一次。别担心 - ClickHouse 轻松处理这种体积，并且通过发送更少的写请求到您的服务来 [节省您的资金](/cloud/bestpractices/bulkinserts.md)。
:::

<br/>

即使是一个简单的示例，让我们插入多于一行的数据：

```sql
INSERT INTO helloworld.my_first_table (user_id, message, timestamp, metric) VALUES
    (101, 'Hello, ClickHouse!',                                 now(),       -1.0    ),
    (102, '插入大量行每批',                     yesterday(), 1.41421 ),
    (102, '根据您常用的查询对数据进行排序', today(),     2.718   ),
    (101, '粒度是读取的最小数据块',      now() + 5,   3.14159 )
```

:::note
请注意，`timestamp` 列是使用各种 [**Date**](../../sql-reference/data-types/date.md) 和 [**DateTime**](../../sql-reference/data-types/datetime.md) 函数填充的。ClickHouse 具有数百个有用的函数，您可以在 [**函数**部分](/sql-reference/functions/) 中查看它们。
:::

让我们验证它是否成功：

```sql
SELECT * FROM helloworld.my_first_table
```

### 使用 ClickHouse 客户端添加数据 {#add-data-using-the-clickhouse-client}

您还可以使用名为 [**clickhouse 客户端**](/interfaces/cli) 的命令行工具连接到您的 ClickHouse Cloud 服务。单击左侧菜单中的 `连接` 以访问这些详细信息。在对话框中从下拉菜单中选择 `Native`：

<div class="eighty-percent">
    <img src={client_details} class="image" alt="clickhouse 客户端连接详细信息" />
</div>
<br/>

1. 安装 [ClickHouse](/interfaces/cli)。

2. 运行命令，替换您的主机名、用户名和密码：

```bash
./clickhouse client --host HOSTNAME.REGION.CSP.clickhouse.cloud \
--secure --port 9440 \
--user default \
--password <password>
```
如果您看到笑脸提示符，则说明您已准备好运行查询！
```response
:)
```

3. 通过运行以下查询来尝试一下：

<br/>

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

请注意，响应以良好的表格格式返回：

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ 插入大量行每批                     │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ 根据您常用的查询对数据进行排序 │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ Hello, ClickHouse!                                 │ 2022-03-22 14:04:09 │      -1 │
│     101 │ 粒度是读取的最小数据块      │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

4 行被集合。耗时：0.008 秒。
```

4. 添加 [`FORMAT`](../../sql-reference/statements/select/format.md) 子句以指定 ClickHouse 支持的多种输出格式之一：

<br/>

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
FORMAT TabSeparated
```
在上面的查询中，输出返回为制表符分隔：
```response
Query id: 3604df1c-acfd-4117-9c56-f86c69721121

102 插入大量行每批	2022-03-21 00:00:00	1.41421
102 根据您常用的查询对数据进行排序	2022-03-22 00:00:00	2.718
101 Hello, ClickHouse!	2022-03-22 14:04:09	-1
101 粒度是读取的最小数据块	2022-03-22 14:04:14	3.14159

4 行被集合。耗时：0.005 秒。
```

5. 要退出 `clickhouse client`，输入 **exit** 命令：

<br/>

```bash
exit
```

### 上传文件 {#upload-a-file}

入门数据库时的常见任务是插入一些您已经在文件中的数据。我们在线提供一些示例数据，您可以插入这些数据，这些数据代表点击流数据 - 包括用户 ID、访问的 URL 和事件的时间戳。

假设我们在名为 `data.csv` 的 CSV 文件中有以下文本：

```bash title="data.csv"
102,这是文件中的数据,2022-02-22 10:43:28,123.45
101,它是用逗号分隔的,2022-02-23 00:00:00,456.78
103,使用 FORMAT 指定格式,2022-02-21 10:43:30,678.90
```

1. 以下命令将数据插入到 `my_first_table` 中：

<br/>

```bash
./clickhouse client --host HOSTNAME.REGION.CSP.clickhouse.cloud \
--secure --port 9440 \
--user default \
--password <password> \
--query='INSERT INTO helloworld.my_first_table FORMAT CSV' < data.csv
```

2. 请注意，如果从 SQL 控制台查询，现在新行会出现在表中：

<br/>

<div class="eighty-percent">
    <img src={new_rows_from_csv} class="image" alt="来自 CSV 文件的新行" />
</div>
<br/>

## 接下来怎么办？ {#whats-next}

- [教程](/tutorial.md) 让您向表中插入 200 万行并编写一些分析查询
- 我们有一个 [示例数据集列表](/getting-started/index.md)，附带如何插入它们的说明
- 查看我们 25 分钟的视频，了解 [ClickHouse 入门](https://clickhouse.com/company/events/getting-started-with-clickhouse/)
- 如果您的数据来自外部源，请查看我们的 [集成指南集合](/integrations/index.mdx)，以连接消息队列、数据库、管道等
- 如果您使用的是 UI/BI 可视化工具，请查看 [连接 UI 到 ClickHouse 的用户指南](/integrations/data-visualization)
- [主键](guides/best-practices/sparse-primary-indexes.md) 的用户指南是您需要了解的有关主键及其定义的所有信息

