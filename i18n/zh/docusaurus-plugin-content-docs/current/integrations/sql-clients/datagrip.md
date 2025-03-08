---
sidebar_label: 'DataGrip'
slug: '/integrations/datagrip'
description: 'DataGrip 是一个数据库 IDE，开箱即用支持 ClickHouse。'
---
```
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import datagrip_1 from '@site/static/images/integrations/sql-clients/datagrip-1.png';
import datagrip_5 from '@site/static/images/integrations/sql-clients/datagrip-5.png';
import datagrip_6 from '@site/static/images/integrations/sql-clients/datagrip-6.png';
import datagrip_7 from '@site/static/images/integrations/sql-clients/datagrip-7.png';


# 连接 DataGrip 到 ClickHouse

## 启动或下载 DataGrip {#start-or-download-datagrip}

DataGrip 可通过 https://www.jetbrains.com/datagrip/ 获取。

## 1. 收集您的连接详细信息 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 加载 ClickHouse 驱动程序 {#2-load-the-clickhouse-driver}

1. 启动 DataGrip，在 **数据源** 选项卡的 **数据源和驱动程序** 对话框中，点击 **+** 图标

<img src={datagrip_5} class="image" alt="DataGrip 05" />

  选择 **ClickHouse**

  :::tip
  当您建立连接时，顺序会发生变化，ClickHouse 可能还不是列表顶部的选项。
  :::

<img src={datagrip_6} class="image" alt="DataGrip 06" />

- 切换到 **驱动程序** 选项卡并加载 ClickHouse 驱动程序

  DataGrip 不附带驱动程序，以便最小化下载大小。在 **驱动程序** 选项卡中
  从 **完全支持** 列表中选择 **ClickHouse**，然后展开 **+** 标志。 从 **提供的驱动程序** 选项中选择 **最新稳定** 驱动程序：

<img src={datagrip_1} class="image" alt="DataGrip 01" />

## 3. 连接到 ClickHouse {#3-connect-to-clickhouse}

- 指定您的数据库连接详细信息，并点击 **测试连接**：

  在第一步中，您收集了连接详细信息，填写主机 URL、端口、用户名、密码和数据库名称，然后测试连接。

  :::tip
  DataGrip 对话框中的 **HOST** 条目实际上是一个 URL，见下图。

  有关 JDBC URL 设置的更多详情，请参考 [ClickHouse JDBC 驱动程序](https://github.com/ClickHouse/clickhouse-java) 仓库。
  :::

<img src={datagrip_7} class="image" alt="DataGrip 07" />

## 了解更多 {#learn-more}

有关 DataGrip 的更多信息，请访问 DataGrip 文档。
