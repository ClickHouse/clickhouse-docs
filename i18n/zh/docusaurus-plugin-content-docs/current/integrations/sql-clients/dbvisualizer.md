---
sidebar_label: 'DbVisualizer'
slug: '/integrations/dbvisualizer'
description: 'DbVisualizer 是一个具有对 ClickHouse 扩展支持的数据库工具。'
---
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import dbvisualizer_driver_manager from '@site/static/images/integrations/sql-clients/dbvisualizer-driver-manager.png';


# 连接 DbVisualizer 到 ClickHouse

## 开始或下载 DbVisualizer {#start-or-download-dbvisualizer}

DbVisualizer 可在 https://www.dbvis.com/download/ 下载。

## 1. 收集你的连接详细信息 {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. 内置 JDBC 驱动管理 {#2-built-in-jdbc-driver-management}

DbVisualizer 包含最新的 ClickHouse JDBC 驱动程序。它内置了完整的 JDBC 驱动管理，指向最新的发布版本以及驱动的历史版本。

<img src={dbvisualizer_driver_manager} class="image" alt="DbVisualizer 01" />

## 3. 连接到 ClickHouse {#3-connect-to-clickhouse}

要通过 DbVisualizer 连接数据库，你必须先创建和设置一个数据库连接。

1. 从 **Database->Create Database Connection** 创建一个新连接，并从弹出菜单中选择你的数据库驱动。

2. 新连接的 **Object View** 标签将会打开。

3. 在 **Name** 字段中输入连接名称，并可选地在 **Notes** 字段中输入连接描述。

4. 将 **Database Type** 保持为 **Auto Detect**。

5. 如果 **Driver Type** 中选定的驱动标记有绿色勾号，则表示可以使用。如果没有绿色勾号，你可能需要在 **Driver Manager** 中配置该驱动。

6. 在其余字段中输入有关数据库服务器的信息。

7. 点击 **Ping Server** 按钮验证是否可以建立与指定地址和端口的网络连接。

8. 如果 Ping Server 的结果显示可以访问服务器，点击 **Connect** 以连接到数据库服务器。

:::tip
如果你在连接数据库时遇到问题，请参见 [修复连接问题](https://confluence.dbvis.com/display/UG231/Fixing+Connection+Issues) 获取一些提示。

## 了解更多 {#learn-more}

有关 DbVisualizer 的更多信息，请访问 [DbVisualizer 文档](https://confluence.dbvis.com/display/UG231/Users+Guide)。
