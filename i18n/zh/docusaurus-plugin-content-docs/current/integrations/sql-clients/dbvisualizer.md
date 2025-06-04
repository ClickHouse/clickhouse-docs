---
'sidebar_label': 'DbVisualizer'
'slug': '/integrations/dbvisualizer'
'description': 'DbVisualizer 是一个具有对 ClickHouse 扩展支持的数据库工具。'
'title': '将 DbVisualizer 连接到 ClickHouse'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import dbvisualizer_driver_manager from '@site/static/images/integrations/sql-clients/dbvisualizer-driver-manager.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 连接 DbVisualizer 到 ClickHouse

<CommunityMaintainedBadge/>

## 开始或下载 DbVisualizer {#start-or-download-dbvisualizer}

DbVisualizer 可在 https://www.dbvis.com/download/ 获取。

## 1. 收集连接详细信息 {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. 内置 JDBC 驱动管理 {#2-built-in-jdbc-driver-management}

DbVisualizer 包含最新的 ClickHouse JDBC 驱动。它内置了完整的 JDBC 驱动管理，指向最新版本以及驱动的历史版本。

<Image img={dbvisualizer_driver_manager} size="lg" border alt="DbVisualizer 驱动管理界面显示 ClickHouse JDBC 驱动配置" />

## 3. 连接到 ClickHouse {#3-connect-to-clickhouse}

要通过 DbVisualizer 连接数据库，您必须首先创建并设置数据库连接。

1. 从 **Database->Create Database Connection** 创建一个新连接，并从弹出菜单中选择数据库驱动。

2. 为新连接打开 **Object View** 选项卡。

3. 在 **Name** 字段中输入连接的名称，可选地在 **Notes** 字段中输入连接的描述。

4. 将 **Database Type** 保持为 **Auto Detect**。

5. 如果在 **Driver Type** 中选定的驱动旁边标有绿色勾号，则可以使用。如果未标记绿色勾号，您可能需要在 **Driver Manager** 中配置驱动。

6. 在其余字段中输入数据库服务器的信息。

7. 点击 **Ping Server** 按钮，验证是否可以与指定的地址和端口建立网络连接。

8. 如果 Ping Server 的结果显示可以到达服务器，点击 **Connect** 以连接到数据库服务器。

:::tip
如果您在连接数据库时遇到问题，请参见 [Fixing Connection Issues](https://confluence.dbvis.com/display/UG231/Fixing+Connection+Issues) 获取一些提示。

## 了解更多 {#learn-more}

有关 DbVisualizer 的更多信息，请访问 [DbVisualizer documentation](https://confluence.dbvis.com/display/UG231/Users+Guide)。
