---
slug: /integrations/dbeaver
sidebar_label: DBeaver
description: 'DBeaver 是一个多平台数据库工具。'
---

import dbeaver_add_database from '@site/static/images/integrations/sql-clients/dbeaver-add-database.png';
import dbeaver_host_port from '@site/static/images/integrations/sql-clients/dbeaver-host-port.png';
import dbeaver_use_ssl from '@site/static/images/integrations/sql-clients/dbeaver-use-ssl.png';
import dbeaver_test_connection from '@site/static/images/integrations/sql-clients/dbeaver-test-connection.png';
import dbeaver_download_driver from '@site/static/images/integrations/sql-clients/dbeaver-download-driver.png';
import dbeaver_sql_editor from '@site/static/images/integrations/sql-clients/dbeaver-sql-editor.png';
import dbeaver_query_log_select from '@site/static/images/integrations/sql-clients/dbeaver-query-log-select.png';


# 连接 DBeaver 到 ClickHouse

DBeaver 提供多种版本。在本指南中使用 [DBeaver Community](https://dbeaver.io/)。有关各种版本和功能，请参见 [这里](https://dbeaver.com/edition/)。 DBeaver 通过 JDBC 连接到 ClickHouse。

:::note
请使用 DBeaver 版本 23.1.0 或更高版本，以改善对 ClickHouse 中 `Nullable` 列的支持。
:::

## 1. 收集您的 ClickHouse 详情 {#1-gather-your-clickhouse-details}

DBeaver 使用 JDBC 通过 HTTP(S) 连接到 ClickHouse；您需要：

- 端点
- 端口号
- 用户名
- 密码

## 2. 下载 DBeaver {#2-download-dbeaver}

DBeaver 可在 https://dbeaver.io/download/ 下载。

## 3. 添加数据库 {#3-add-a-database}

- 可以使用 **数据库 > 新建数据库连接** 菜单或在 **数据库导航器** 中点击 **新建数据库连接** 图标，调出 **连接到数据库** 对话框：

<img src={dbeaver_add_database} class="image" alt="添加新数据库" />

- 选择 **分析型**，然后选择 **ClickHouse**：

- 构建 JDBC URL。在 **主** 标签中设置主机、端口、用户名、密码和数据库：

<img src={dbeaver_host_port} class="image" alt="设置主机名、端口、用户、密码和数据库名称" />

- 默认情况下，**SSL > 使用 SSL** 属性未设置，如果您连接到 ClickHouse Cloud 或需要在 HTTP 端口上使用 SSL 的服务器，则将 **SSL > 使用 SSL** 设置为开启：

<img src={dbeaver_use_ssl} class="image" alt="如果需要，启用 SSL" />

- 测试连接：

<img src={dbeaver_test_connection} class="image" alt="测试连接" />

如果 DBeaver 检测到您未安装 ClickHouse 驱动程序，它将提供下载选项：

<img src={dbeaver_download_driver} class="image" alt="下载 ClickHouse 驱动程序" />

- 下载驱动程序后再次 **测试** 连接：

<img src={dbeaver_test_connection} class="image" alt="测试连接" />

## 4. 查询 ClickHouse {#4-query-clickhouse}

打开查询编辑器并运行查询。

- 右键点击您的连接，选择 **SQL 编辑器 > 打开 SQL 脚本**，以打开查询编辑器：

<img src={dbeaver_sql_editor} class="image" alt="打开 SQL 编辑器" />

- 针对 `system.query_log` 的示例查询：

<img src={dbeaver_query_log_select} class="image" alt="示例查询" />

## 后续步骤 {#next-steps}

请参阅 [DBeaver wiki](https://github.com/dbeaver/dbeaver/wiki)，了解 DBeaver 的功能，以及 [ClickHouse 文档](https://clickhouse.com/docs)，了解 ClickHouse 的功能。
