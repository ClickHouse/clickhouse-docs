---
'slug': '/integrations/qstudio'
'sidebar_label': 'QStudio'
'description': 'QStudio 是一个免费的 SQL 工具。'
'title': '连接 QStudio 到 ClickHouse'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import qstudio_add_connection from '@site/static/images/integrations/sql-clients/qstudio-add-connection.png';
import qstudio_running_query from '@site/static/images/integrations/sql-clients/qstudio-running-query.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 QStudio 连接到 ClickHouse

<CommunityMaintainedBadge/>

QStudio 是一个免费的 SQL GUI，允许运行 SQL 脚本、轻松浏览表格、绘制图表和导出结果。它适用于所有操作系统和所有数据库。

QStudio 通过 JDBC 连接到 ClickHouse。

## 1. 收集你的 ClickHouse 详细信息 {#1-gather-your-clickhouse-details}

QStudio 使用 HTTP(S) 上的 JDBC 连接到 ClickHouse；你需要：

- 端点
- 端口号
- 用户名
- 密码

<ConnectionDetails />

## 2. 下载 QStudio {#2-download-qstudio}

QStudio 可在 https://www.timestored.com/qstudio/download/ 下载

## 3. 添加数据库 {#3-add-a-database}

- 当你第一次打开 QStudio 时，点击菜单选项 **Server->Add Server** 或工具栏上的添加服务器按钮。
- 然后设置详细信息：

<Image img={qstudio_add_connection} size="lg" border alt="QStudio 数据库连接配置界面显示 ClickHouse 连接设置" />

1.   服务器类型：Clickhouse.com
2.   注意：对于主机，你必须包含 https://
    主机： https://abc.def.clickhouse.cloud
    端口： 8443
3.   用户名：default
    密码： `XXXXXXXXXXX`
4. 点击添加

如果 QStudio 检测到你没有安装 ClickHouse JDBC 驱动程序，它会提供下载链接：

## 4. 查询 ClickHouse {#4-query-clickhouse}

- 打开查询编辑器并运行查询。你可以通过以下方式运行查询：
- Ctrl + e - 运行高亮文本
- Ctrl + Enter - 运行当前行

- 一个示例查询：

<Image img={qstudio_running_query} size="lg" border alt="QStudio 界面显示对 ClickHouse 数据库执行的示例 SQL 查询" />

## 下一步 {#next-steps}

请参阅 [QStudio](https://www.timestored.com/qstudio) 了解 QStudio 的功能，以及 [ClickHouse 文档](https://clickhouse.com/docs) 了解 ClickHouse 的功能。
