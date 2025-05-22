---
'slug': '/integrations/dbeaver'
'sidebar_label': 'DBeaver'
'description': 'DBeaver是一个跨平台的数据库工具。'
'title': '将DBeaver连接到ClickHouse'
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

DBeaver 有多个版本可供选择。在本指南中使用的是 [DBeaver Community](https://dbeaver.io/)。可在 [这里](https://dbeaver.com/edition/) 查看各种版本和功能。 DBeaver 使用 JDBC 连接到 ClickHouse。

:::note
请使用 DBeaver 版本 23.1.0 或更高版本，以改善对 ClickHouse 中 `Nullable` 列的支持。
:::

## 1. 收集您的 ClickHouse 详细信息 {#1-gather-your-clickhouse-details}

DBeaver 通过 HTTP(S) 使用 JDBC 连接到 ClickHouse；您需要：

- 端点
- 端口号
- 用户名
- 密码

## 2. 下载 DBeaver {#2-download-dbeaver}

DBeaver 可以在 https://dbeaver.io/download/ 下载。

## 3. 添加数据库 {#3-add-a-database}

- 可以使用 **Database > New Database Connection** 菜单或 **Database Navigator** 中的 **New Database Connection** 图标来弹出 **Connect to a database** 对话框：

<Image img={dbeaver_add_database} size="md" border alt="添加新数据库" />

- 选择 **Analytical** 然后选择 **ClickHouse**：

- 构建 JDBC URL。在 **Main** 标签中设置主机、端口、用户名、密码和数据库：

<Image img={dbeaver_host_port} size="md" border alt="设置主机名、端口、用户、密码和数据库名称" />

- 默认情况下 **SSL > Use SSL** 属性将未设置，如果您连接到 ClickHouse Cloud 或需要在 HTTP 端口上使用 SSL 的服务器，则将 **SSL > Use SSL** 设置为开启：

<Image img={dbeaver_use_ssl} size="md" border alt="如需要，启用 SSL" />

- 测试连接：

<Image img={dbeaver_test_connection} size="md" border alt="测试连接" />

如果 DBeaver 检测到您没有安装 ClickHouse 驱动程序，则会提供下载这些驱动程序的选项：

<Image img={dbeaver_download_driver} size="md" border alt="下载 ClickHouse 驱动程序" />

- 下载驱动程序后，请再次 **Test** 连接：

<Image img={dbeaver_test_connection} size="md" border alt="测试连接" />

## 4. 查询 ClickHouse {#4-query-clickhouse}

打开查询编辑器并运行查询。

- 右键单击您的连接并选择 **SQL Editor > Open SQL Script** 打开查询编辑器：

<Image img={dbeaver_sql_editor} size="md" border alt="打开 SQL 编辑器" />

- 针对 `system.query_log` 的示例查询：

<Image img={dbeaver_query_log_select} size="md" border alt="示例查询" />

## 后续步骤 {#next-steps}

请参阅 [DBeaver wiki](https://github.com/dbeaver/dbeaver/wiki) 以了解 DBeaver 的功能，以及 [ClickHouse 文档](https://clickhouse.com/docs) 以了解 ClickHouse 的功能。
