---
sidebar_label: 'NiFi'
sidebar_position: 12
keywords: ['clickhouse', 'NiFi', '连接', '集成', 'etl', '数据集成']
slug: /integrations/nifi
description: '使用 NiFi 数据管道将数据流式摄取到 ClickHouse 中'
title: '将 Apache NiFi 连接到 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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


# 将 Apache NiFi 连接到 ClickHouse {#connect-apache-nifi-to-clickhouse}

<CommunityMaintainedBadge />

<a href='https://nifi.apache.org/' target='_blank'>
  Apache NiFi
</a>
是一款开源工作流管理软件,旨在实现软件系统间的数据流自动化。它支持创建 ETL 数据管道,并内置超过 300 个数据处理器。本分步教程将演示如何将 Apache NiFi 同时作为数据源和目标连接到 ClickHouse,并加载示例数据集。

<VerticalStepper headerLevel="h2">


## 准备连接信息 {#1-gather-your-connection-details}

<ConnectionDetails />



## 下载并运行 Apache NiFi {#2-download-and-run-apache-nifi}

对于全新部署，请从 https://nifi.apache.org/download.html 下载二进制文件，并通过运行 `./bin/nifi.sh start` 来启动



## 下载 ClickHouse JDBC 驱动程序 {#3-download-the-clickhouse-jdbc-driver}

1. 访问 GitHub 上的 <a href="https://github.com/ClickHouse/clickhouse-java/releases" target="_blank">ClickHouse JDBC 驱动程序发布页面</a>，并找到最新的 JDBC 发行版本
2. 在该版本的发布内容中，点击 “Show all xx assets”，然后查找文件名中包含关键字 “shaded” 或 “all” 的 JAR 文件，例如 `clickhouse-jdbc-0.5.0-all.jar`
3. 将该 JAR 文件放置在 Apache NiFi 可访问的文件夹中，并记录其绝对路径



## 添加 `DBCPConnectionPool` Controller Service 并配置其属性 {#4-add-dbcpconnectionpool-controller-service-and-configure-its-properties}

1. 要在 Apache NiFi 中配置 Controller Service，点击“齿轮”按钮打开 NiFi Flow Configuration 页面

    <Image img={nifi01} size="sm" border alt="高亮显示齿轮按钮的 NiFi Flow Configuration 页面" />

2. 选择 Controller Services 选项卡，并点击右上角的 `+` 按钮添加一个新的 Controller Service

    <Image img={nifi02} size="lg" border alt="高亮显示添加按钮的 Controller Services 选项卡" />

3. 搜索 `DBCPConnectionPool` 并点击 “Add” 按钮

    <Image img={nifi03} size="lg" border alt="在 Controller Service 选择对话框中高亮显示 DBCPConnectionPool" />

4. 新添加的 `DBCPConnectionPool` 默认处于 Invalid 状态。点击“齿轮”按钮开始配置

    <Image img={nifi04} size="lg" border alt="Controller Services 列表中显示无效的 DBCPConnectionPool 并高亮显示齿轮按钮" />

5. 在 Properties 部分中，输入以下值

  | Property                    | Value                                                              | Remark                                                                        |
  | --------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
  | Database Connection URL     | jdbc:ch:https://HOSTNAME:8443/default?ssl=true                     | 根据实际情况替换连接 URL 中的 HOSTNAME                                       |
  | Database Driver Class Name  | com.clickhouse.jdbc.ClickHouseDriver                               ||
  | Database Driver Location(s) | /etc/nifi/nifi-X.XX.X/lib/clickhouse-jdbc-0.X.X-patchXX-shaded.jar | ClickHouse JDBC 驱动 JAR 文件的绝对路径                                      |
  | Database User               | default                                                            | ClickHouse 用户名                                                             |
  | Password                    | password                                                           | ClickHouse 密码                                                               |

6. 在 Settings 部分，将该 Controller Service 的名称修改为 “ClickHouse JDBC”，以便于识别

    <Image img={nifi05} size="lg" border alt="DBCPConnectionPool 配置对话框，展示已填写的属性" />

7. 点击“闪电”按钮，然后点击 “Enable” 按钮，激活 `DBCPConnectionPool` Controller Service

    <Image img={nifi06} size="lg" border alt="在 Controller Services 列表中高亮显示闪电按钮" />

    <br/>

    <Image img={nifi07} size="lg" border alt="启用 Controller Service 的确认对话框" />

8. 检查 Controller Services 选项卡，确认该 Controller Service 已启用

    <Image img={nifi08} size="lg" border alt="Controller Services 列表中显示已启用的 ClickHouse JDBC 服务" />



## 使用 `ExecuteSQL` 处理器从表中读取数据 {#5-read-from-a-table-using-the-executesql-processor}

1. 添加一个 `ExecuteSQL` 处理器，并配置相应的上游和下游处理器

    <Image img={nifi09} size="md" border alt="NiFi 画布中显示包含 ExecuteSQL 处理器的工作流" />

2. 在 `ExecuteSQL` 处理器的 "Properties" 部分中，输入以下值

    | Property                            | Value                                | Remark                                                     |
    |-------------------------------------|--------------------------------------|------------------------------------------------------------|
    | Database Connection Pooling Service | ClickHouse JDBC                      | 选择为 ClickHouse 配置的 Controller Service                |
    | SQL select query                    | SELECT * FROM system.metrics         | 在此输入你的查询                                           |

3. 启动 `ExecuteSQL` 处理器

    <Image img={nifi10} size="lg" border alt="ExecuteSQL 处理器配置界面，属性已填写完成" />

4. 为确认查询已成功处理，检查输出队列中的任意一个 `FlowFile`

    <Image img={nifi11} size="lg" border alt="队列列表对话框，显示可供检查的 FlowFile" />

5. 将视图切换为 "formatted" 以查看输出 `FlowFile` 的结果

    <Image img={nifi12} size="lg" border alt="FlowFile 内容查看器，以 formatted 视图显示查询结果" />



## 使用 `MergeRecord` 和 `PutDatabaseRecord` 处理器写入表 {#6-write-to-a-table-using-mergerecord-and-putdatabaserecord-processor}

1. 要在单次插入中写入多行数据,首先需要将多条记录合并为单条记录。可以使用 `MergeRecord` 处理器来完成此操作

2. 在 `MergeRecord` 处理器的"Properties"部分,输入以下值

   | Property                  | Value               | Remark                                                                                                                 |
   | ------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
   | Record Reader             | `JSONTreeReader`    | 选择适当的记录读取器                                                                                   |
   | Record Writer             | `JSONReadSetWriter` | 选择适当的记录写入器                                                                                   |
   | Minimum Number of Records | 1000                | 将此值更改为更大的数字,以便合并最小数量的行来形成单条记录。默认为 1 行 |
   | Maximum Number of Records | 10000               | 将此值更改为大于"Minimum Number of Records"的数字。默认为 1,000 行                                 |

3. 要确认多条记录已合并为一条,请检查 `MergeRecord` 处理器的输入和输出。注意输出是多条输入记录组成的数组

   输入

   <Image
     img={nifi13}
     size='sm'
     border
     alt='MergeRecord 处理器输入显示单条记录'
   />

   输出

   <Image
     img={nifi14}
     size='sm'
     border
     alt='MergeRecord 处理器输出显示合并后的记录数组'
   />

4. 在 `PutDatabaseRecord` 处理器的"Properties"部分,输入以下值

   | Property                            | Value            | Remark                                                                                                                                     |
   | ----------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
   | Record Reader                       | `JSONTreeReader` | 选择适当的记录读取器                                                                                                       |
   | Database Type                       | Generic          | 保留默认值                                                                                                                           |
   | Statement Type                      | INSERT           |                                                                                                                                            |
   | Database Connection Pooling Service | ClickHouse JDBC  | 选择 ClickHouse 控制器服务                                                                                                   |
   | Table Name                          | tbl              | 在此处输入您的表名                                                                                                                 |
   | Translate Field Names               | false            | 设置为"false",以便插入的字段名称必须与列名匹配                                                                     |
   | Maximum Batch Size                  | 1000             | 每次插入的最大行数。此值不应低于 `MergeRecord` 处理器中"Minimum Number of Records"的值 |

5. 要确认每次插入包含多行数据,请检查表中的行数是否至少按 `MergeRecord` 中定义的"Minimum Number of Records"值递增

   <Image
     img={nifi15}
     size='sm'
     border
     alt='查询结果显示目标表中的行数'
   />

6. 恭喜 - 您已成功使用 Apache NiFi 将数据加载到 ClickHouse 中!

</VerticalStepper>
