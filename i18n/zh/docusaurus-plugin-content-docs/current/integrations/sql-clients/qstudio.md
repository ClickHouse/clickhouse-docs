---
slug: /integrations/qstudio
sidebar_label: QStudio
description: QStudio 是一个免费的 SQL 工具。
---
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import qstudio_add_connection from '@site/static/images/integrations/sql-clients/qstudio-add-connection.png';
import qstudio_running_query from '@site/static/images/integrations/sql-clients/qstudio-running-query.png';

QStudio 是一个免费的 SQL GUI，它允许运行 SQL 脚本、轻松浏览表格、生成图表和导出结果。它在每个操作系统上均可使用，兼容所有数据库。


# 将 QStudio 连接到 ClickHouse

QStudio 使用 JDBC 连接到 ClickHouse。

## 1. 收集您的 ClickHouse 详情 {#1-gather-your-clickhouse-details}

QStudio 通过 HTTP(S) 使用 JDBC 连接到 ClickHouse；您需要：

- 终端节点
- 端口号
- 用户名
- 密码

<ConnectionDetails />

## 2. 下载 QStudio {#2-download-qstudio}

QStudio 可在 https://www.timestored.com/qstudio/download/ 上下载。

## 3. 添加数据库 {#3-add-a-database}

- 当您第一次打开 QStudio 时，点击菜单选项 **Server->Add Server** 或工具栏上的添加服务器按钮。
- 然后设置详细信息：

<img src={qstudio_add_connection} alt="配置新数据库" />

1.   服务器类型：Clickhouse.com
2.    关于主机的说明：您必须包含 https://
    主机： https://abc.def.clickhouse.cloud
    端口： 8443
3.  用户名：default
    密码： `XXXXXXXXXXX`
 4. 点击添加

如果 QStudio 检测到您没有安装 ClickHouse JDBC 驱动程序，它将提供下载选项：

## 4. 查询 ClickHouse {#4-query-clickhouse}

- 打开查询编辑器并运行查询。您可以通过以下方式运行查询 
- Ctrl + e - 运行高亮文本
- Ctrl + Enter - 运行当前行

- 示例查询：

<img src={qstudio_running_query} alt="示例查询" />

## 后续步骤 {#next-steps}

请参阅 [QStudio](https://www.timestored.com/qstudio) 以了解 QStudio 的功能，并查看 [ClickHouse 文档](https://clickhouse.com/docs) 以了解 ClickHouse 的功能。
