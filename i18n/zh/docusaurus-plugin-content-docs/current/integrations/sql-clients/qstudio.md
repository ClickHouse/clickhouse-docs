---
slug: /integrations/qstudio
sidebar_label: 'QStudio'
description: 'QStudio 是一款免费的 SQL 工具。'
title: '将 QStudio 连接到 ClickHouse'
doc_type: 'guide'
keywords: ['qstudio', 'sql 客户端', '数据库工具', '查询工具', 'IDE']
integration:
  - support_level: 'community'
  - category: 'sql_client'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import qstudio_add_connection from '@site/static/images/integrations/sql-clients/qstudio-add-connection.png';
import qstudio_running_query from '@site/static/images/integrations/sql-clients/qstudio-running-query.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# 将 QStudio 连接到 ClickHouse {#connect-qstudio-to-clickhouse}

<CommunityMaintainedBadge/>

QStudio 是一款免费的 SQL 图形界面工具，可用于运行 SQL 脚本、便捷浏览数据表、绘制图表并导出结果。它适用于任何操作系统，并可连接到任意数据库。

QStudio 通过 JDBC 连接到 ClickHouse。

## 1. 收集 ClickHouse 连接信息 {#1-gather-your-clickhouse-details}

QStudio 通过 HTTP(S) 上的 JDBC 连接到 ClickHouse；您需要准备：

- endpoint（服务地址）
- 端口号
- 用户名
- 密码

<ConnectionDetails />

## 2. 下载 QStudio {#2-download-qstudio}

QStudio 可从 https://www.timestored.com/qstudio/download/ 下载。

## 3. 添加数据库 {#3-add-a-database}

- 初次打开 QStudio 时，点击菜单选项 **Server->Add Server**，或者点击工具栏上的添加服务器按钮。
- 然后设置以下详细信息：

<Image img={qstudio_add_connection} size="lg" border alt="QStudio 数据库连接配置界面，显示 ClickHouse 连接设置" />

1.   Server Type: Clickhouse.com
2.    请注意，在 Host 中必须包含 https://
    Host: https://abc.def.clickhouse.cloud
    Port: 8443
3.  Username: default
    Password: `XXXXXXXXXXX`
 4. 点击 Add

如果 QStudio 检测到您尚未安装 ClickHouse JDBC 驱动程序，它会提示您下载安装：

## 4. 查询 ClickHouse {#4-query-clickhouse}

- 打开查询编辑器并运行查询。可以通过以下方式运行查询：
- Ctrl + e - 运行高亮文本
- Ctrl + Enter - 运行当前行

- 示例查询：

<Image img={qstudio_running_query} size="lg" border alt="QStudio 界面展示在 ClickHouse 数据库上执行示例 SQL 查询的画面" />

## 下一步 {#next-steps}

请参阅 [QStudio](https://www.timestored.com/qstudio) 以了解 QStudio 的功能特性，并查看 [ClickHouse 文档](https://clickhouse.com/docs) 以了解 ClickHouse 的功能特性。