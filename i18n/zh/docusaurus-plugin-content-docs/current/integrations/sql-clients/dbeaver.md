---
slug: /integrations/dbeaver
sidebar_label: 'DBeaver'
description: 'DBeaver 是一款跨平台的数据库工具。'
title: '使用 DBeaver 连接 ClickHouse'
doc_type: '指南'
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
import PartnerBadge from '@theme/badges/PartnerBadge';


# 将 DBeaver 连接到 ClickHouse \{#connect-dbeaver-to-clickhouse\}

<PartnerBadge/>

DBeaver 提供多个发行版。本指南中使用的是 [DBeaver Community](https://dbeaver.io/)。可在[此处](https://dbeaver.com/edition/)查看不同发行版及其功能。DBeaver 通过 JDBC 连接到 ClickHouse。

:::note
请使用 23.1.0 或更高版本的 DBeaver，以便更好地支持 ClickHouse 中的 `Nullable` 列。
:::

## 1. 收集您的 ClickHouse 连接信息 \{#1-gather-your-clickhouse-details\}

DBeaver 通过基于 HTTP(S) 的 JDBC 连接到 ClickHouse；您需要：

- endpoint
- 端口号
- 用户名
- 密码

## 2. 下载 DBeaver \{#2-download-dbeaver\}

可从 https://dbeaver.io/download/ 下载 DBeaver

## 3. 添加数据库 \{#3-add-a-database\}

- 使用 **Database > New Database Connection** 菜单，或在 **Database Navigator** 中点击 **New Database Connection** 图标，打开 **Connect to a database** 对话框：

<Image img={dbeaver_add_database} size="md" border alt="添加一个新的数据库" />

- 选择 **Analytical**，然后选择 **ClickHouse**：

- 构建 JDBC URL。在 **Main** 选项卡中设置 Host、Port、Username、Password 和 Database：

<Image img={dbeaver_host_port} size="md" border alt="设置主机名、端口、用户、密码和数据库名称" />

- 默认情况下 **SSL > Use SSL** 属性未勾选；如果连接的是 ClickHouse Cloud，或是要求在 HTTP 端口上使用 SSL 的服务器，则需要启用 **SSL > Use SSL**：

<Image img={dbeaver_use_ssl} size="md" border alt="如有需要则启用 SSL" />

- 测试连接：

<Image img={dbeaver_test_connection} size="md" border alt="测试连接" />

如果 DBeaver 检测到尚未安装 ClickHouse 驱动，它会提示下载驱动：

<Image img={dbeaver_download_driver} size="md" border alt="下载 ClickHouse 驱动" />

- 下载驱动后再次 **Test** 连接：

<Image img={dbeaver_test_connection} size="md" border alt="测试连接" />

## 4. 在 ClickHouse 中执行查询 \{#4-query-clickhouse\}

打开查询编辑器并运行一条查询语句。

- 右键单击你的连接并选择 **SQL Editor > Open SQL Script** 以打开查询编辑器：

<Image img={dbeaver_sql_editor} size="md" border alt="打开 SQL 编辑器" />

- 针对 `system.query_log` 的示例查询：

<Image img={dbeaver_query_log_select} size="md" border alt="示例查询" />

## 后续步骤 \{#next-steps\}

请参阅 [DBeaver wiki](https://github.com/dbeaver/dbeaver/wiki) 了解 DBeaver 的功能，并参阅 [ClickHouse 文档](https://clickhouse.com/docs) 了解 ClickHouse 的功能。