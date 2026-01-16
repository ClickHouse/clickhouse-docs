---
sidebar_label: 'DbVisualizer'
slug: /integrations/dbvisualizer
description: 'DbVisualizer 是一款对 ClickHouse 提供增强支持的数据库工具。'
title: '将 DbVisualizer 连接到 ClickHouse'
keywords: ['DbVisualizer', '数据库可视化', 'SQL 客户端', 'JDBC 驱动', '数据库工具']
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'sql_client'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import dbvisualizer_driver_manager from '@site/static/images/integrations/sql-clients/dbvisualizer-driver-manager.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# 在 DbVisualizer 中连接 ClickHouse \\{#connecting-dbvisualizer-to-clickhouse\\}

<CommunityMaintainedBadge/>

## 启动或下载 DbVisualizer \\{#start-or-download-dbvisualizer\\}

可从 https://www.dbvis.com/download/ 下载 DbVisualizer

## 1. 收集连接信息 \\{#1-gather-your-connection-details\\}

<ConnectionDetails />

## 2. 内置 JDBC 驱动管理 \\{#2-built-in-jdbc-driver-management\\}

DbVisualizer 自带最新的 ClickHouse JDBC 驱动程序，并内置完整的 JDBC 驱动管理功能，可指向驱动程序的最新发布版本以及历史版本。

<Image img={dbvisualizer_driver_manager} size="lg" border alt="DbVisualizer 驱动管理器界面，显示 ClickHouse JDBC 驱动配置" />

## 3. 连接到 ClickHouse \\{#3-connect-to-clickhouse\\}

要使用 DbVisualizer 连接数据库，首先必须创建并配置一个数据库连接。

1. 通过 **Database->Create Database Connection** 创建一个新连接，并在弹出菜单中为你的数据库选择一个驱动程序。

2. 会打开该新连接的 **Object View** 选项卡。

3. 在 **Name** 字段中输入连接名称，并可选地在 **Notes** 字段中输入该连接的说明。

4. 将 **Database Type** 保持为 **Auto Detect**。

5. 如果在 **Driver Type** 中选定的驱动程序旁带有绿色对勾，则说明它已可用。如果没有绿色对勾，你可能需要在 **Driver Manager** 中配置该驱动程序。

6. 在其余字段中输入数据库服务器的信息。

7. 点击 **Ping Server** 按钮，验证是否可以与指定地址和端口建立网络连接。

8. 如果 Ping Server 的结果显示服务器可达，点击 **Connect** 以连接到数据库服务器。

:::tip
如果在连接数据库时遇到问题，可参阅 [修复连接问题](https://www.dbvis.com/docs/ug/troubleshooting/fixing-connection-issues/) 获取一些建议。

## 深入了解 \\{#learn-more\\}

如需了解 DbVisualizer 的更多信息，请访问 [DbVisualizer 文档](https://www.dbvis.com/docs/ug/)。