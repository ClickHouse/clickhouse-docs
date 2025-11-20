---
sidebar_label: 'NiFi'
sidebar_position: 12
keywords: ['clickhouse', 'NiFi', 'connect', 'integrate', 'etl', 'data integration']
slug: /integrations/nifi
description: '使用 NiFi 数据管道将数据流式导入 ClickHouse'
title: '将 Apache NiFi 连接到 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
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


# 将 Apache NiFi 连接到 ClickHouse

<CommunityMaintainedBadge />

<a href='https://nifi.apache.org/' target='_blank'>
  Apache NiFi
</a>
是一款开源工作流管理软件,旨在实现软件系统之间的数据流自动化。它支持创建 ETL 数据管道,并内置超过 300 个数据处理器。本分步教程将演示如何将 Apache NiFi 作为数据源和目标连接到 ClickHouse,以及如何加载示例数据集。

<VerticalStepper headerLevel="h2">


## 收集连接详细信息 {#1-gather-your-connection-details}

<ConnectionDetails />


## 下载并运行 Apache NiFi {#2-download-and-run-apache-nifi}

对于全新安装,请从 https://nifi.apache.org/download.html 下载二进制文件,然后通过运行 `./bin/nifi.sh start` 命令来启动


## 下载 ClickHouse JDBC 驱动程序 {#3-download-the-clickhouse-jdbc-driver}

1. 访问 GitHub 上的 <a href="https://github.com/ClickHouse/clickhouse-java/releases" target="_blank">ClickHouse JDBC 驱动程序发布页面</a>,查找最新的 JDBC 发布版本
2. 在发布版本中,点击"Show all xx assets",查找包含关键字"shaded"或"all"的 JAR 文件,例如 `clickhouse-jdbc-0.5.0-all.jar`
3. 将 JAR 文件放置在 Apache NiFi 可访问的文件夹中,并记录其绝对路径


## 添加 `DBCPConnectionPool` 控制器服务并配置其属性 {#4-add-dbcpconnectionpool-controller-service-and-configure-its-properties}

1. 要在 Apache NiFi 中配置控制器服务,请单击"齿轮"按钮访问 NiFi 流配置页面

   <Image
     img={nifi01}
     size='sm'
     border
     alt='NiFi 流配置页面,齿轮按钮已高亮显示'
   />

2. 选择控制器服务选项卡,然后单击右上角的 `+` 按钮添加新的控制器服务

   <Image
     img={nifi02}
     size='lg'
     border
     alt='控制器服务选项卡,添加按钮已高亮显示'
   />

3. 搜索 `DBCPConnectionPool` 并单击"添加"按钮

   <Image
     img={nifi03}
     size='lg'
     border
     alt='控制器服务选择对话框,DBCPConnectionPool 已高亮显示'
   />

4. 新添加的 `DBCPConnectionPool` 默认处于无效状态。单击"齿轮"按钮开始配置

   <Image
     img={nifi04}
     size='lg'
     border
     alt='控制器服务列表显示无效的 DBCPConnectionPool,齿轮按钮已高亮显示'
   />

5. 在"属性"部分下,输入以下值

| 属性                        | 值                                                                 | 备注                                                 |
| --------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------- |
| Database Connection URL     | jdbc:ch:https://HOSTNAME:8443/default?ssl=true                     | 相应地替换连接 URL 中的 HOSTNAME                     |
| Database Driver Class Name  | com.clickhouse.jdbc.ClickHouseDriver                               |                                                      |
| Database Driver Location(s) | /etc/nifi/nifi-X.XX.X/lib/clickhouse-jdbc-0.X.X-patchXX-shaded.jar | ClickHouse JDBC 驱动程序 JAR 文件的绝对路径          |
| Database User               | default                                                            | ClickHouse 用户名                                    |
| Password                    | password                                                           | ClickHouse 密码                                      |

6. 在设置部分,将控制器服务的名称更改为"ClickHouse JDBC"以便于引用

   <Image
     img={nifi05}
     size='lg'
     border
     alt='DBCPConnectionPool 配置对话框显示已填写的属性'
   />

7. 单击"闪电"按钮然后单击"启用"按钮来激活 `DBCPConnectionPool` 控制器服务

   <Image
     img={nifi06}
     size='lg'
     border
     alt='控制器服务列表,闪电按钮已高亮显示'
   />

   <br />

   <Image
     img={nifi07}
     size='lg'
     border
     alt='启用控制器服务确认对话框'
   />

8. 检查控制器服务选项卡并确保控制器服务已启用

   <Image
     img={nifi08}
     size='lg'
     border
     alt='控制器服务列表显示已启用的 ClickHouse JDBC 服务'
   />


## 使用 `ExecuteSQL` 处理器从表中读取数据 {#5-read-from-a-table-using-the-executesql-processor}

1. 添加一个 `ExecuteSQL` 处理器,以及相应的上游和下游处理器

   <Image
     img={nifi09}
     size='md'
     border
     alt='NiFi 画布显示工作流中的 ExecuteSQL 处理器'
   />

2. 在 `ExecuteSQL` 处理器的"Properties"部分中,输入以下值

   | Property                            | Value                         | Remark                                                  |
   | ----------------------------------- | ----------------------------- | ------------------------------------------------------- |
   | Database Connection Pooling Service | ClickHouse JDBC               | 选择为 ClickHouse 配置的 Controller Service |
   | SQL select query                    | SELECT \* FROM system.metrics | 在此处输入您的查询语句                                   |

3. 启动 `ExecuteSQL` 处理器

   <Image
     img={nifi10}
     size='lg'
     border
     alt='ExecuteSQL 处理器配置界面,属性已填写完成'
   />

4. 要确认查询已成功处理,请检查输出队列中的某个 `FlowFile`

   <Image
     img={nifi11}
     size='lg'
     border
     alt='列表队列对话框显示待检查的 FlowFile'
   />

5. 将视图切换为"formatted"以查看输出 `FlowFile` 的结果

   <Image
     img={nifi12}
     size='lg'
     border
     alt='FlowFile 内容查看器以格式化视图显示查询结果'
   />


## 使用 `MergeRecord` 和 `PutDatabaseRecord` 处理器写入表 {#6-write-to-a-table-using-mergerecord-and-putdatabaserecord-processor}

1. 要在单次插入中写入多行数据,首先需要将多条记录合并为单条记录。可以使用 `MergeRecord` 处理器来实现

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
   | Database Type                       | Generic          | 保持默认值                                                                                                                           |
   | Statement Type                      | INSERT           |                                                                                                                                            |
   | Database Connection Pooling Service | ClickHouse JDBC  | 选择 ClickHouse 控制器服务                                                                                                   |
   | Table Name                          | tbl              | 在此输入您的表名                                                                                                                 |
   | Translate Field Names               | false            | 设置为"false",以便插入的字段名必须与列名匹配                                                                     |
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
