---
'sidebar_label': 'DbVisualizer'
'slug': '/integrations/dbvisualizer'
'description': 'DbVisualizer 是一种数据库工具，具备对 ClickHouse 的扩展支持。'
'title': '将 DbVisualizer 连接到 ClickHouse'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import dbvisualizer_driver_manager from '@site/static/images/integrations/sql-clients/dbvisualizer-driver-manager.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 连接 DbVisualizer 和 ClickHouse

<CommunityMaintainedBadge/>

## 开始或下载 DbVisualizer {#start-or-download-dbvisualizer}

DbVisualizer 可在 https://www.dbvis.com/download/ 获取。

## 1. 收集连接细节 {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. 内置 JDBC 驱动程序管理 {#2-built-in-jdbc-driver-management}

DbVisualizer 随附最新的 ClickHouse JDBC 驱动程序。它具有完整的 JDBC 驱动程序管理功能，指向最新版本以及驱动程序的历史版本。

<Image img={dbvisualizer_driver_manager} size="lg" border alt="DbVisualizer 驱动管理界面显示 ClickHouse JDBC 驱动配置" />

## 3. 连接到 ClickHouse {#3-connect-to-clickhouse}

要使用 DbVisualizer 连接到数据库，您必须首先创建并设置数据库连接。

1. 从 **Database->Create Database Connection** 创建一个新连接，并从弹出菜单中选择数据库的驱动程序。

2. 为新连接打开一个 **Object View** 选项卡。

3. 在 **Name** 字段中输入连接名称，并可选地在 **Notes** 字段中输入连接描述。

4. 将 **Database Type** 保持为 **Auto Detect**。

5. 如果 **Driver Type** 中所选的驱动程序带有绿色勾号，则准备就绪。如果没有绿色勾号，则可能需要在 **Driver Manager** 中配置该驱动程序。

6. 在其他字段中输入有关数据库服务器的信息。

7. 通过单击 **Ping Server** 按钮验证是否可以与指定的地址和端口建立网络连接。

8. 如果 Ping Server 的结果显示服务器可达，请单击 **Connect** 连接到数据库服务器。

:::tip
如果在连接到数据库时遇到问题，请参阅 [修复连接问题](https://www.dbvis.com/docs/ug/troubleshooting/fixing-connection-issues/) 的一些提示。

## 了解更多 {#learn-more}

要获取有关 DbVisualizer 的更多信息，请访问 [DbVisualizer 文档](https://www.dbvis.com/docs/ug/)。
