---
'sidebar_label': 'DbVisualizer'
'slug': '/integrations/dbvisualizer'
'description': 'DbVisualizer 是一款支持 ClickHouse 的数据库工具.'
'title': '将 DbVisualizer 连接到 ClickHouse'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import dbvisualizer_driver_manager from '@site/static/images/integrations/sql-clients/dbvisualizer-driver-manager.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# 连接 DbVisualizer 到 ClickHouse

<CommunityMaintainedBadge/>

## 开始或下载 DbVisualizer {#start-or-download-dbvisualizer}

DbVisualizer 可在 https://www.dbvis.com/download/ 获取。

## 1. 收集连接详情 {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. 内置 JDBC 驱动程序管理 {#2-built-in-jdbc-driver-management}

DbVisualizer 包含最新的 ClickHouse JDBC 驱动程序。它内置了完整的 JDBC 驱动程序管理，指向最新的版本以及驱动程序的历史版本。

<Image img={dbvisualizer_driver_manager} size="lg" border alt="DbVisualizer 驱动程序管理界面显示 ClickHouse JDBC 驱动程序配置" />

## 3. 连接到 ClickHouse {#3-connect-to-clickhouse}

要通过 DbVisualizer 连接数据库，您必须首先创建并设置一个数据库连接。

1. 从 **Database->Create Database Connection** 创建一个新连接，并从弹出菜单中选择一个适合您数据库的驱动程序。

2. 新连接的 **Object View** 标签页将被打开。

3. 在 **Name** 字段中输入连接的名称，并可选地在 **Notes** 字段中输入连接的描述。

4. 将 **Database Type** 保持为 **Auto Detect**。

5. 如果在 **Driver Type** 中选择的驱动程序标有绿色勾号，则表示它可以使用。如果没有绿色勾号，您可能需要在 **Driver Manager** 中配置驱动程序。

6. 在其余字段中输入有关数据库服务器的信息。

7. 通过点击 **Ping Server** 按钮验证能否与指定的地址和端口建立网络连接。

8. 如果 Ping Server 的结果显示服务器可以访问，请点击 **Connect** 连接到数据库服务器。

:::tip
如果您在连接数据库时遇到问题，请参见 [解决连接问题](https://confluence.dbvis.com/display/UG231/Fixing+Connection+Issues) 获取一些提示。

## 了解更多 {#learn-more}

要获取有关 DbVisualizer 的更多信息，请访问 [DbVisualizer 文档](https://confluence.dbvis.com/display/UG231/Users+Guide)。
