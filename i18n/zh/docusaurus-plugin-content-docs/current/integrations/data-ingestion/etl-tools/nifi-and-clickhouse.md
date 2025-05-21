---
'sidebar_label': 'NiFi'
'sidebar_position': 12
'keywords':
- 'clickhouse'
- 'NiFi'
- 'connect'
- 'integrate'
- 'etl'
- 'data integration'
'slug': '/integrations/nifi'
'description': '使用 NiFi 数据流管道将数据流入 ClickHouse'
'title': 'Connect Apache NiFi to ClickHouse'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import nifi01 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_01.png';
import nifi02 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_02.png';
import nifi03 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_03.png';
import nifi04 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_04.png';
import nifi05 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_05.png';
import nifi06 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_06.png';
import nifi07 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_07.png';
import nifi08 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_08.png';
import nifi09 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_09.png';
import nifi10 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_10.png';
import nifi11 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_11.png';
import nifi12 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_12.png';
import nifi13 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_13.png';
import nifi14 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_14.png';
import nifi15 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_15.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 连接 Apache NiFi 到 ClickHouse

<CommunityMaintainedBadge/>

<a href="https://nifi.apache.org/" target="_blank">Apache NiFi</a> 是一款开源工作流管理软件，旨在自动化软件系统之间的数据流。它允许创建 ETL 数据管道，并配备超过 300 个数据处理器。本教程分步展示如何将 Apache NiFi 连接到 ClickHouse，作为数据源和目标，并加载示例数据集。

## 1. 收集连接详细信息 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 下载并运行 Apache NiFi {#2-download-and-run-apache-nifi}

1. 对于全新设置，请从 https://nifi.apache.org/download.html 下载二进制文件，并通过运行 `./bin/nifi.sh start` 启动

## 3. 下载 ClickHouse JDBC 驱动程序 {#3-download-the-clickhouse-jdbc-driver}

1. 访问 <a href="https://github.com/ClickHouse/clickhouse-java/releases" target="_blank">ClickHouse JDBC 驱动程序发布页面</a>，查找最新的 JDBC 发行版本
2. 在发布版本中，点击“显示所有 xx 资产”，查找包含关键字“shaded”或“all”的 JAR 文件，例如 `clickhouse-jdbc-0.5.0-all.jar`
3. 将 JAR 文件放置在 Apache NiFi 可访问的文件夹中，并记下绝对路径

## 4. 添加 `DBCPConnectionPool` 控制服务并配置其属性 {#4-add-dbcpconnectionpool-controller-service-and-configure-its-properties}

1. 要在 Apache NiFi 中配置控制服务，请点击“齿轮”按钮访问 NiFi 流配置页面

    <Image img={nifi01} size="sm" border alt="NiFi 流配置页面，突出显示齿轮按钮" />

2. 选择控制服务标签，点击右上角的 `+` 按钮添加新的控制服务

    <Image img={nifi02} size="lg" border alt="控制服务标签，突出显示添加按钮" />

3. 搜索 `DBCPConnectionPool` 并点击“添加”按钮

    <Image img={nifi03} size="lg" border alt="控制服务选择对话框，突出显示 DBCPConnectionPool" />

4. 新添加的 `DBCPConnectionPool` 默认处于无效状态。点击“齿轮”按钮开始配置

    <Image img={nifi04} size="lg" border alt="控制服务列表，显示无效的 DBCPConnectionPool，突出显示齿轮按钮" />

5. 在“属性”部分，输入以下值

  | 属性                          | 值                                                                | 备注                                                                        |
  | ----------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
  | 数据库连接 URL               | jdbc:ch:https://HOSTNAME:8443/default?ssl=true                     | 根据需要替换连接 URL 中的 HOSTNAME                                        |
  | 数据库驱动类名               | com.clickhouse.jdbc.ClickHouseDriver                               ||
  | 数据库驱动位置               | /etc/nifi/nifi-X.XX.X/lib/clickhouse-jdbc-0.X.X-patchXX-shaded.jar | ClickHouse JDBC 驱动 JAR 文件的绝对路径                                     |
  | 数据库用户                   | default                                                            | ClickHouse 用户名                                                           |
  | 密码                          | password                                                 | ClickHouse 密码                                                              |

6. 在设置部分，将控制服务的名称更改为“ClickHouse JDBC”，以便于引用

    <Image img={nifi05} size="lg" border alt="DBCPConnectionPool 配置对话框，显示填写的属性" />

7. 通过点击“闪电”按钮和“启用”按钮来激活 `DBCPConnectionPool` 控制服务

    <Image img={nifi06} size="lg" border alt="控制服务列表，突出显示闪电按钮" />

    <br/>

    <Image img={nifi07} size="lg" border alt="启用控制服务确认对话框" />

8. 检查控制服务标签，确保控制服务已启用

    <Image img={nifi08} size="lg" border alt="控制服务列表，显示已启用的 ClickHouse JDBC 服务" />

## 5. 使用 `ExecuteSQL` 处理器从表中读取数据 {#5-read-from-a-table-using-the-executesql-processor}

1. 添加一个 ​`​ExecuteSQL` 处理器，以及适当的上游和下游处理器

    <Image img={nifi09} size="md" border alt="NiFi 画布，显示 ExecuteSQL 处理器在工作流中" />

2. 在 ​`​ExecuteSQL` 处理器的“属性”部分，输入以下值

    | 属性                               | 值                                   | 备注                                                  |
    |------------------------------------|--------------------------------------|-------------------------------------------------------|
    | 数据库连接池服务                  | ClickHouse JDBC                      | 选择为 ClickHouse 配置的控制服务                     |
    | SQL 查询                             | SELECT * FROM system.metrics         | 在此输入你的查询                                      |

3. 启动 `​​ExecuteSQL` 处理器

    <Image img={nifi10} size="lg" border alt="ExecuteSQL 处理器配置，显示填写的属性" />

4. 为了确认查询已成功处理，检查输出队列中的一个 `FlowFile`

    <Image img={nifi11} size="lg" border alt="列表队列对话框，显示准备检查的 flowfiles" />

5. 切换视图到“格式化”以查看输出 `FlowFile` 的结果

    <Image img={nifi12} size="lg" border alt="FlowFile 内容查看器，显示格式化视图中的查询结果" />

## 6. 使用 `MergeRecord` 和 `PutDatabaseRecord` 处理器向表中写入数据 {#6-write-to-a-table-using-mergerecord-and-putdatabaserecord-processor}

1. 为了在单次插入中写入多行，我们首先需要将多个记录合并为一个单一记录。这可以使用 `MergeRecord` 处理器完成

2. 在 `MergeRecord` 处理器的“属性”部分，输入以下值

    | 属性                      | 值               | 备注                                                                                                                    |
    |---------------------------|-------------------|-------------------------------------------------------------------------------------------------------------------------|
    | 记录读取器                | `JSONTreeReader`    | 选择适当的记录读取器                                                                                                  |
    | 记录写入器                | `JSONReadSetWriter` | 选择适当的记录写入器                                                                                                  |
    | 最小记录数                | 1000              | 将此值更改为更高的数字，以便最小行数合并成单一记录。默认为 1 行                                            |
    | 最大记录数                | 10000             | 将此值更改为高于“最小记录数”的数字。默认为 1,000 行                                                                |

3. 为了确认多个记录已合并为一个，检查 `MergeRecord` 处理器的输入和输出。注意输出是多个输入记录的数组。

    输入
    <Image img={nifi13} size="sm" border alt="MergeRecord 处理器输入，显示单个记录" />

    输出
    <Image img={nifi14} size="sm" border alt="MergeRecord 处理器输出，显示合并的记录数组" />

4. 在 `PutDatabaseRecord` 处理器的“属性”部分，输入以下值

    | 属性                               | 值               | 备注                                                                                                                        |
    |------------------------------------|-------------------|-----------------------------------------------------------------------------------------------------------------------------|
    | 记录读取器                         | `JSONTreeReader`  | 选择适当的记录读取器                                                                                                      |
    | 数据库类型                        | Generic           | 保持默认                                                                                                                   |
    | 语句类型                          | INSERT            |                                                                                                                                  |
    | 数据库连接池服务                  | ClickHouse JDBC   | 选择 ClickHouse 控制服务                                                                                                    |
    | 表名                             | tbl               | 在此输入你的表名称                                                                                                          |
    | 翻译字段名称                      | false             | 设置为“false”，以便插入的字段名称必须与列名匹配                                                                             |
    | 最大批次大小                     | 1000              | 每次插入的最大行数。该值不得低于 `MergeRecord` 处理器中的“最小记录数”值                                                  |

5. 为了确认每次插入包含多行，请检查表中的行计数是否至少增加了 “MergeRecord” 中定义的“最小记录数”的值。

    <Image img={nifi15} size="sm" border alt="查询结果，显示目标表中的行计数" />

6. 恭喜 - 你已成功使用 Apache NiFi 加载数据到 ClickHouse！
