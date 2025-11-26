---
slug: /integrations/dbeaver
sidebar_label: 'DBeaver'
description: 'DBeaver 是一款跨平台的数据库工具。'
title: '使用 DBeaver 连接 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'sql_client'
  - website: 'https://github.com/dbeaver/dbeaver'
keywords: ['DBeaver', '数据库管理', 'SQL 客户端', 'JDBC 连接', '跨平台']
---

import Image from '@theme/IdealImage';
import dbeaver_add_database from '@site/static/images/integrations/sql-clients/dbeaver-add-database.png';
import dbeaver_host_port from '@site/static/images/integrations/sql-clients/dbeaver-host-port.png';
import dbeaver_use_ssl from '@site/static/images/integrations/sql-clients/dbeaver-use-ssl.png';
import dbeaver_test_connection from '@site/static/images/integrations/sql-clients/dbeaver-test-connection.png';
import dbeaver_download_driver from '@site/static/images/integrations/sql-clients/dbeaver-download-driver.png';
import dbeaver_sql_editor from '@site/static/images/integrations/sql-clients/dbeaver-sql-editor.png';
import dbeaver_query_log_select from '@site/static/images/integrations/sql-clients/dbeaver-query-log-select.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 将 DBeaver 连接到 ClickHouse

<ClickHouseSupportedBadge/>

DBeaver 提供多个版本。在本指南中，我们使用的是 [DBeaver Community](https://dbeaver.io/)。请在[此处](https://dbeaver.com/edition/)查看不同版本及其功能。DBeaver 通过 JDBC 连接到 ClickHouse。

:::note
请使用 23.1.0 或更高版本的 DBeaver，以获得对 ClickHouse 中 `Nullable` 列的更佳支持。
:::



## 1. 收集您的 ClickHouse 连接信息 {#1-gather-your-clickhouse-details}

DBeaver 通过基于 HTTP(S) 的 JDBC 连接到 ClickHouse，您需要准备：

- endpoint（端点）
- 端口号
- 用户名
- 密码



## 2. 下载 DBeaver {#2-download-dbeaver}

您可以从 https://dbeaver.io/download/ 下载 DBeaver



## 3. 添加数据库 {#3-add-a-database}

- 通过 **Database > New Database Connection** 菜单，或 **Database Navigator** 中的 **New Database Connection** 图标，打开 **Connect to a database** 对话框：

<Image img={dbeaver_add_database} size="md" border alt="添加新数据库" />

- 选择 **Analytical**，然后选择 **ClickHouse**：

- 构建 JDBC URL。在 **Main** 选项卡中设置 Host、Port、Username、Password 和 Database：

<Image img={dbeaver_host_port} size="md" border alt="设置主机名、端口、用户、密码和数据库名称" />

- 默认情况下 **SSL > Use SSL** 属性未启用，如果您连接的是 ClickHouse Cloud 或在 HTTP 端口上要求 SSL 的服务器，则需要将 **SSL > Use SSL** 打开：

<Image img={dbeaver_use_ssl} size="md" border alt="如有需要，启用 SSL" />

- 测试连接：

<Image img={dbeaver_test_connection} size="md" border alt="测试连接" />

如果 DBeaver 检测到您尚未安装 ClickHouse 驱动，它会提示为您下载：

<Image img={dbeaver_download_driver} size="md" border alt="下载 ClickHouse 驱动" />

- 驱动下载完成后，再次点击 **Test** 测试连接：

<Image img={dbeaver_test_connection} size="md" border alt="测试连接" />



## 4. 查询 ClickHouse {#4-query-clickhouse}

打开查询编辑器并执行查询。

- 在连接上单击右键并选择 **SQL Editor > Open SQL Script** 打开查询编辑器：

<Image img={dbeaver_sql_editor} size="md" border alt="打开 SQL 编辑器" />

- 针对 `system.query_log` 的示例查询：

<Image img={dbeaver_query_log_select} size="md" border alt="示例查询" />



## 后续步骤 {#next-steps}

请参阅 [DBeaver wiki](https://github.com/dbeaver/dbeaver/wiki) 了解 DBeaver 的功能，并查阅 [ClickHouse 文档](https://clickhouse.com/docs) 了解 ClickHouse 的功能。
