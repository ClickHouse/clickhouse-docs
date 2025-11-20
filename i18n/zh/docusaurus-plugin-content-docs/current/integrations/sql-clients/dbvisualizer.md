---
sidebar_label: 'DbVisualizer'
slug: /integrations/dbvisualizer
description: 'DbVisualizer 是一款对 ClickHouse 提供增强支持的数据库工具。'
title: '将 DbVisualizer 连接到 ClickHouse'
keywords: ['DbVisualizer', 'database visualization', 'SQL client', 'JDBC driver', 'database tool']
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'sql_client'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import dbvisualizer_driver_manager from '@site/static/images/integrations/sql-clients/dbvisualizer-driver-manager.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 DbVisualizer 连接至 ClickHouse

<CommunityMaintainedBadge/>



## 启动或下载 DbVisualizer {#start-or-download-dbvisualizer}

DbVisualizer 可从 https://www.dbvis.com/download/ 下载


## 1. 收集连接信息 {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. 内置 JDBC 驱动管理 {#2-built-in-jdbc-driver-management}

DbVisualizer 内置了最新的 ClickHouse JDBC 驱动程序,并提供完整的 JDBC 驱动管理功能,支持访问最新版本和历史版本的驱动程序。

<Image
  img={dbvisualizer_driver_manager}
  size='lg'
  border
  alt='DbVisualizer 驱动管理器界面,显示 ClickHouse JDBC 驱动配置'
/>


## 3. 连接到 ClickHouse {#3-connect-to-clickhouse}

要使用 DbVisualizer 连接到数据库，首先必须创建并设置一个数据库连接。

1. 通过 **Database -> Create Database Connection** 创建一个新连接，并在弹出菜单中为数据库选择驱动程序。

2. 新连接会打开一个 **Object View** 选项卡。

3. 在 **Name** 字段中输入连接名称，可选地在 **Notes** 字段中输入该连接的说明。

4. 将 **Database Type** 保持为 **Auto Detect**。

5. 如果在 **Driver Type** 中选择的驱动带有绿色对勾标记，则表示可以直接使用。若没有绿色对勾标记，则可能需要在 **Driver Manager** 中配置该驱动。

6. 在其余字段中输入数据库服务器的相关信息。

7. 点击 **Ping Server** 按钮，验证是否可以与指定的地址和端口建立网络连接。

8. 如果 Ping Server 的结果显示服务器可达，点击 **Connect** 以连接到数据库服务器。

:::tip
如果在连接数据库时遇到问题，请参阅 [Fixing Connection Issues](https://www.dbvis.com/docs/ug/troubleshooting/fixing-connection-issues/) 获取一些故障排查建议。


## 了解更多 {#learn-more}

如需了解更多关于 DbVisualizer 的信息,请访问 [DbVisualizer 文档](https://www.dbvis.com/docs/ug/)。
