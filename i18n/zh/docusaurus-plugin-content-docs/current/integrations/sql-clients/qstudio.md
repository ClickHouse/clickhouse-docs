---
slug: /integrations/qstudio
sidebar_label: 'QStudio'
description: 'QStudio 是一款免费的 SQL 工具。'
title: '将 QStudio 连接到 ClickHouse'
doc_type: 'guide'
keywords: ['qstudio', 'sql client', 'database tool', 'query tool', 'ide']
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import qstudio_add_connection from '@site/static/images/integrations/sql-clients/qstudio-add-connection.png';
import qstudio_running_query from '@site/static/images/integrations/sql-clients/qstudio-running-query.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 QStudio 连接到 ClickHouse

<CommunityMaintainedBadge/>

QStudio 是一款免费的 SQL 图形界面工具，可用于运行 SQL 脚本、轻松浏览数据表、绘制图表以及导出查询结果。它可在所有操作系统上运行，并可连接各种数据库。

QStudio 通过 JDBC 连接到 ClickHouse。



## 1. 收集 ClickHouse 连接信息 {#1-gather-your-clickhouse-details}

QStudio 通过 HTTP(S) 协议使用 JDBC 连接到 ClickHouse,您需要准备以下信息:

- 端点地址
- 端口号
- 用户名
- 密码

<ConnectionDetails />


## 2. 下载 QStudio {#2-download-qstudio}

QStudio 可从以下地址下载：https://www.timestored.com/qstudio/download/


## 3. 添加数据库 {#3-add-a-database}

- 首次打开 QStudio 时,点击菜单选项 **Server->Add Server** 或工具栏上的添加服务器按钮。
- 然后设置以下详细信息:

<Image
  img={qstudio_add_connection}
  size='lg'
  border
  alt='QStudio 数据库连接配置界面,显示 ClickHouse 连接设置'
/>

1.  Server Type: Clickhouse.com
2.  注意:Host 字段必须包含 https://
    Host: https://abc.def.clickhouse.cloud
    Port: 8443
3.  Username: default
    Password: `XXXXXXXXXXX`
4.  点击 Add

如果 QStudio 检测到您尚未安装 ClickHouse JDBC 驱动程序,它会提示为您下载:


## 4. 查询 ClickHouse {#4-query-clickhouse}

- 打开查询编辑器并运行查询。您可以通过以下方式运行查询:
- Ctrl + e - 运行选中的文本
- Ctrl + Enter - 运行当前行

- 查询示例:

<Image
  img={qstudio_running_query}
  size='lg'
  border
  alt='QStudio 界面展示针对 ClickHouse 数据库执行 SQL 查询示例'
/>


## 后续步骤 {#next-steps}

参阅 [QStudio](https://www.timestored.com/qstudio) 了解 QStudio 的功能,以及 [ClickHouse 文档](https://clickhouse.com/docs) 了解 ClickHouse 的功能。
