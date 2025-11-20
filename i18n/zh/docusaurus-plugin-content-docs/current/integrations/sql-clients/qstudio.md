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

QStudio 是一款免费的 SQL 图形界面工具，支持运行 SQL 脚本、便捷浏览数据表、绘制图表以及导出结果。它可以在任何操作系统上与任何数据库配合使用。

QStudio 通过 JDBC 连接到 ClickHouse。



## 1. 收集您的 ClickHouse 连接信息 {#1-gather-your-clickhouse-details}

QStudio 通过 JDBC over HTTP(S) 连接到 ClickHouse；您需要准备以下信息：

- 端点地址
- 端口号
- 用户名
- 密码

<ConnectionDetails />


## 2. 下载 QStudio {#2-download-qstudio}

QStudio 可从 https://www.timestored.com/qstudio/download/ 获取


## 3. 添加数据库 {#3-add-a-database}

- 首次打开 QStudio 时,点击菜单选项 **Server->Add Server** 或工具栏上的添加服务器按钮。
- 然后设置以下详细信息:

<Image
  img={qstudio_add_connection}
  size='lg'
  border
  alt='QStudio 数据库连接配置界面,显示 ClickHouse 连接设置'
/>

1.  服务器类型: Clickhouse.com
2.  注意:主机地址必须包含 https://
    主机: https://abc.def.clickhouse.cloud
    端口: 8443
3.  用户名: default
    密码: `XXXXXXXXXXX`
4.  点击 Add

如果 QStudio 检测到您尚未安装 ClickHouse JDBC 驱动程序,它将提示为您下载:


## 4. 查询 ClickHouse {#4-query-clickhouse}

- 打开查询编辑器并运行查询。可以通过以下方式运行查询:
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

请参阅 [QStudio](https://www.timestored.com/qstudio) 了解 QStudio 的功能,以及 [ClickHouse 文档](https://clickhouse.com/docs) 了解 ClickHouse 的功能。
