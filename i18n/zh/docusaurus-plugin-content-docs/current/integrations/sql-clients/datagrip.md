---
sidebar_label: 'DataGrip'
slug: /integrations/datagrip
description: 'DataGrip 是一款开箱即用支持 ClickHouse 的数据库 IDE。'
title: '将 DataGrip 与 ClickHouse 连接'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'sql_client'
  - website: 'https://www.jetbrains.com/datagrip/'
keywords: ['DataGrip', 'database IDE', 'JetBrains', 'SQL client', 'integrated development environment']
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import datagrip_1 from '@site/static/images/integrations/sql-clients/datagrip-1.png';
import datagrip_5 from '@site/static/images/integrations/sql-clients/datagrip-5.png';
import datagrip_6 from '@site/static/images/integrations/sql-clients/datagrip-6.png';
import datagrip_7 from '@site/static/images/integrations/sql-clients/datagrip-7.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 在 DataGrip 中连接 ClickHouse

<CommunityMaintainedBadge/>



## 启动或下载 DataGrip {#start-or-download-datagrip}

DataGrip 可在 https://www.jetbrains.com/datagrip/ 下载


## 1. 收集连接信息 {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. 加载 ClickHouse 驱动程序 {#2-load-the-clickhouse-driver}

1. 启动 DataGrip,在 **Data Sources and Drivers** 对话框的 **Data Sources** 选项卡上,点击 **+** 图标

<Image
  img={datagrip_5}
  size='lg'
  border
  alt='DataGrip Data Sources 选项卡,+ 图标高亮显示'
/>

选择 **ClickHouse**

:::tip
随着您建立连接,列表顺序会发生变化,ClickHouse 可能暂时不在列表顶部。
:::

<Image
  img={datagrip_6}
  size='sm'
  border
  alt='DataGrip 从数据源列表中选择 ClickHouse'
/>

- 切换到 **Drivers** 选项卡并加载 ClickHouse 驱动程序

  为了减小下载体积,DataGrip 不自带驱动程序。在 **Drivers** 选项卡中,从 **Complete Support** 列表中选择 **ClickHouse**,然后展开 **+** 号。从 **Provided Driver** 选项中选择 **Latest stable** 驱动程序:

<Image
  img={datagrip_1}
  size='lg'
  border
  alt='DataGrip Drivers 选项卡显示 ClickHouse 驱动程序安装'
/>


## 3. 连接到 ClickHouse {#3-connect-to-clickhouse}

- 指定数据库连接详细信息,然后点击 **Test Connection**。
  在第一步中您已收集了连接详细信息 - 填写主机 URL、端口、用户名、密码和数据库名称,然后测试连接。

:::tip
在 **Host** 字段中仅输入主机名(例如 `your-host.clickhouse.cloud`),不要添加任何协议前缀(如 `https://`)。

对于 ClickHouse Cloud 连接,您必须在主机下方的 **URL** 字段中添加 `?ssl=true`。完整的 JDBC URL 应如下所示:

`jdbc:clickhouse://your-host.clickhouse.cloud:8443/default?ssl=true`

ClickHouse Cloud 要求所有连接使用 SSL 加密。如果没有 `?ssl=true` 参数,即使凭据正确,您也会看到 "Connection reset" 错误。

有关 JDBC URL 设置的更多详细信息,请参阅 [ClickHouse JDBC driver](https://github.com/ClickHouse/clickhouse-java) 代码仓库。
:::

<Image
  img={datagrip_7}
  border
  alt='带有 ClickHouse 设置的 DataGrip 连接详细信息表单'
/>


## 了解更多 {#learn-more}

如需了解有关 DataGrip 的更多信息,请访问 DataGrip 文档。
