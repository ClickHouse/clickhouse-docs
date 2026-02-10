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

# 将 Apache NiFi 连接到 ClickHouse \{#connect-apache-nifi-to-clickhouse\}

<CommunityMaintainedBadge />

<a href="https://nifi.apache.org/" target="_blank">Apache NiFi</a> 是一款开源工作流管理软件,旨在实现软件系统间的数据流自动化。它支持创建 ETL 数据管道,并内置超过 300 个数据处理器。本分步教程将演示如何将 Apache NiFi 同时作为数据源和目标连接到 ClickHouse,并加载示例数据集。

<VerticalStepper headerLevel="h2">
  ## 收集连接详细信息 \{#1-gather-your-connection-details\}

  <ConnectionDetails />

  ## 下载并运行 Apache NiFi \{#2-download-and-run-apache-nifi\}

  对于全新安装,请从 https://nifi.apache.org/download.html 下载二进制文件,然后运行 `./bin/nifi.sh start` 启动

  ## 下载 ClickHouse JDBC 驱动 \{#3-download-the-clickhouse-jdbc-driver\}

  1. 前往 GitHub 上的 <a href="https://github.com/ClickHouse/clickhouse-java/releases" target="_blank">ClickHouse JDBC 驱动发布页面</a>，查找最新的 JDBC 发行版。
  2. 在发布页面中，点击 “Show all xx assets”，然后查找包含关键字 “shaded” 或 “all” 的 JAR 文件，例如 `clickhouse-jdbc-0.5.0-all.jar`
  3. 将 JAR 文件放置在 Apache NiFi 可访问的文件夹中，并记下其绝对路径

  ## 添加 `DBCPConnectionPool` Controller Service 并配置其属性 \{#4-add-dbcpconnectionpool-controller-service-and-configure-its-properties\}

  1. 要在 Apache NiFi 中配置 Controller Service，点击“齿轮”按钮打开 NiFi Flow Configuration 页面

     <Image img={nifi01} size="sm" border alt="高亮显示齿轮按钮的 NiFi Flow Configuration 页面" />

  2. 选择 Controller Services 选项卡，并点击右上角的 `+` 按钮添加一个新的 Controller Service

     <Image img={nifi02} size="lg" border alt="高亮显示添加按钮的 Controller Services 选项卡" />

  3. 搜索 `DBCPConnectionPool` 并点击 “Add” 按钮

     <Image img={nifi03} size="lg" border alt="在 Controller Service 选择对话框中高亮显示 DBCPConnectionPool" />

  4. 新添加的 `DBCPConnectionPool` 默认处于 Invalid 状态。点击“齿轮”按钮开始配置

     <Image img={nifi04} size="lg" border alt="Controller Services 列表中显示无效的 DBCPConnectionPool 并高亮显示齿轮按钮" />

  5. 在 Properties 部分中，输入以下值

  | Property                    | Value                                                              | Remark                         |
  | --------------------------- | ------------------------------------------------------------------ | ------------------------------ |
  | Database Connection URL     | jdbc:ch:https://HOSTNAME:8443/default?ssl=true                     | 根据实际情况替换连接 URL 中的 HOSTNAME     |
  | Database Driver Class Name  | com.clickhouse.jdbc.ClickHouseDriver                               |                                |
  | Database Driver Location(s) | /etc/nifi/nifi-X.XX.X/lib/clickhouse-jdbc-0.X.X-patchXX-shaded.jar | ClickHouse JDBC 驱动 JAR 文件的绝对路径 |
  | Database User               | default                                                            | ClickHouse 用户名                 |
  | Password                    | password                                                           | ClickHouse 密码                  |

  6. 在 Settings 部分，将该 Controller Service 的名称修改为 “ClickHouse JDBC”，以便于识别

     <Image img={nifi05} size="lg" border alt="DBCPConnectionPool 配置对话框，展示已填写的属性" />

  7. 点击“闪电”按钮，然后点击 “Enable” 按钮，激活 `DBCPConnectionPool` Controller Service

     <Image img={nifi06} size="lg" border alt="在 Controller Services 列表中高亮显示闪电按钮" />

     <br />

     <Image img={nifi07} size="lg" border alt="启用 Controller Service 的确认对话框" />

  8. 检查 Controller Services 选项卡，确认该 Controller Service 已启用

     <Image img={nifi08} size="lg" border alt="Controller Services 列表中显示已启用的 ClickHouse JDBC 服务" />

  ## 使用 `ExecuteSQL` 处理器从表中读取数据 \{#5-read-from-a-table-using-the-executesql-processor\}

  1. 添加一个 `ExecuteSQL` Processor，以及相应的上游和下游 Processor

     <Image img={nifi09} size="md" border alt="NiFi 画布中展示工作流中的 ExecuteSQL 处理器" />

  2. 在 `ExecuteSQL` processor 的 Properties 部分中，输入以下值

     | Property                            | Value                        | Remark                                |
     | ----------------------------------- | ---------------------------- | ------------------------------------- |
     | Database Connection Pooling Service | ClickHouse JDBC              | 选择为 ClickHouse 配置的 Controller Service |
     | SQL select query                    | SELECT * FROM system.metrics | 在此输入查询                                |

  3. 启动 `ExecuteSQL` Processor

     <Image img={nifi10} size="lg" border alt="ExecuteSQL 处理器配置，展示已填写的属性" />

  4. 要确认查询已成功处理，请检查输出队列中的一个 `FlowFile`

     <Image img={nifi11} size="lg" border alt="List queue 对话框中显示可供检查的 flowfiles" />

  5. 将视图切换为“formatted”，以查看 `FlowFile` 的输出结果

     <Image img={nifi12} size="lg" border alt="FlowFile 内容查看器以格式化视图显示查询结果" />

  ## 使用 `MergeRecord` 和 `PutDatabaseRecord` 处理器写入表 \{#6-write-to-a-table-using-mergerecord-and-putdatabaserecord-processor\}

  1. 若要在一次 insert 操作中写入多行，首先需要将多条记录合并为一条记录。这可以通过使用 `MergeRecord` 处理器来完成

  2. 在 `MergeRecord` 处理器的 Properties 部分中，输入以下值

     | Property                  | Value               | Remark                                                          |
     | ------------------------- | ------------------- | --------------------------------------------------------------- |
     | Record Reader             | `JSONTreeReader`    | 选择合适的 Record Reader                                             |
     | Record Writer             | `JSONReadSetWriter` | 选择合适的 Record Writer                                             |
     | Minimum Number of Records | 1000                | 将此值修改为更大的数值，以便至少将这么多行合并为一条记录。默认值为 1 行                           |
     | Maximum Number of Records | 10000               | 将此值修改为大于 &quot;Minimum Number of Records&quot; 的数值。默认值为 1,000 行 |

  3. 要确认多条记录已合并为一条，请检查 `MergeRecord` 处理器的输入和输出。注意，输出是一个包含多个输入记录的数组。

     输入

     <Image img={nifi13} size="sm" border alt="包含单条记录的 MergeRecord 处理器输入" />

     输出

     <Image img={nifi14} size="sm" border alt="MergeRecord Processor 输出，显示合并后的记录数组" />

  4. 在 `PutDatabaseRecord` processor 的 Properties 部分中，输入以下值

     | Property                            | Value            | Remark                                                                       |
     | ----------------------------------- | ---------------- | ---------------------------------------------------------------------------- |
     | Record Reader                       | `JSONTreeReader` | 选择合适的 Record Reader                                                          |
     | Database Type                       | Generic          | 保持默认值                                                                        |
     | Statement Type                      | INSERT           |                                                                              |
     | Database Connection Pooling Service | ClickHouse JDBC  | 选择 ClickHouse JDBC Controller Service                                        |
     | Table Name                          | tbl              | 在此处输入表名                                                                      |
     | Translate Field Names               | false            | 设置为 &quot;false&quot;，这样插入的字段名必须与列名匹配                                        |
     | Maximum Batch Size                  | 1000             | 每次插入的最大行数。该值不应小于 `MergeRecord` 处理器中 &quot;Minimum Number of Records&quot; 的值 |

  5. 要确认每次插入都包含多行，请检查表中的行数在每次插入后是否至少增加 `MergeRecord` 中定义的 &quot;Minimum Number of Records&quot; 的数值。

     <Image img={nifi15} size="sm" border alt="查询结果显示目标表的行数" />

  6. 恭喜，您已通过 Apache NiFi 成功将数据加载到 ClickHouse 中！
</VerticalStepper>