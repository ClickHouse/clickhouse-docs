---
'slug': '/integrations/dbeaver'
'sidebar_label': 'DBeaver'
'description': 'DBeaver 是一个多平台的 DATABASE 工具。'
'title': '连接 DBeaver 到 ClickHouse'
'doc_type': 'guide'
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


# 连接 DBeaver 到 ClickHouse

<ClickHouseSupportedBadge/>

DBeaver 提供多种版本。在本指南中使用的是 [DBeaver Community](https://dbeaver.io/)。可以在 [这里](https://dbeaver.com/edition/) 查看各种版本及其功能。 DBeaver 通过 JDBC 连接到 ClickHouse。

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

DBeaver 可在 https://dbeaver.io/download/ 下载

## 3. 添加数据库 {#3-add-a-database}

- 可以使用 **Database > New Database Connection** 菜单或 **Database Navigator** 中的 **New Database Connection** 图标打开 **连接数据库** 对话框：

<Image img={dbeaver_add_database} size="md" border alt="添加新数据库" />

- 选择 **Analytical** 然后选择 **ClickHouse**：

- 构建 JDBC URL。在 **Main** 标签中设置主机、端口、用户名、密码和数据库：

<Image img={dbeaver_host_port} size="md" border alt="设置主机名、端口、用户、密码和数据库名" />

- 默认情况下，**SSL > Use SSL** 属性将未设置，如果您要连接到 ClickHouse Cloud 或需要在 HTTP 端口上使用 SSL 的服务器，则需将 **SSL > Use SSL** 设置为开启：

<Image img={dbeaver_use_ssl} size="md" border alt="如有需要，启用 SSL" />

- 测试连接：

<Image img={dbeaver_test_connection} size="md" border alt="测试连接" />

如果 DBeaver 检测到您没有安装 ClickHouse 驱动程序，它会提供下载链接：

<Image img={dbeaver_download_driver} size="md" border alt="下载 ClickHouse 驱动程序" />

- 下载驱动程序后，再次 **测试** 连接：

<Image img={dbeaver_test_connection} size="md" border alt="测试连接" />

## 4. 查询 ClickHouse {#4-query-clickhouse}

打开查询编辑器并运行查询。

- 右键单击您的连接，选择 **SQL Editor > Open SQL Script** 打开查询编辑器：

<Image img={dbeaver_sql_editor} size="md" border alt="打开 SQL 编辑器" />

- 针对 `system.query_log` 的示例查询：

<Image img={dbeaver_query_log_select} size="md" border alt="示例查询" />

## 后续步骤 {#next-steps}

查看 [DBeaver wiki](https://github.com/dbeaver/dbeaver/wiki) 了解 DBeaver 的功能，以及 [ClickHouse 文档](https://clickhouse.com/docs) 了解 ClickHouse 的功能。
