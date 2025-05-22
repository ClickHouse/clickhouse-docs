---
'sidebar_label': 'DataGrip'
'slug': '/integrations/datagrip'
'description': 'DataGrip 是一个支持 ClickHouse 的数据库 IDE。'
'title': '连接 DataGrip 到 ClickHouse'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import datagrip_1 from '@site/static/images/integrations/sql-clients/datagrip-1.png';
import datagrip_5 from '@site/static/images/integrations/sql-clients/datagrip-5.png';
import datagrip_6 from '@site/static/images/integrations/sql-clients/datagrip-6.png';
import datagrip_7 from '@site/static/images/integrations/sql-clients/datagrip-7.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 连接 DataGrip 到 ClickHouse

<CommunityMaintainedBadge/>

## 1. 启动或下载 DataGrip {#start-or-download-datagrip}

DataGrip 可在 https://www.jetbrains.com/datagrip/ 获取。

## 2. 收集连接详细信息 {#1-gather-your-connection-details}
<ConnectionDetails />

## 3. 加载 ClickHouse 驱动 {#2-load-the-clickhouse-driver}

1. 启动 DataGrip，并在 **数据源** 标签页的 **数据源和驱动程序** 对话框中，点击 **+** 图标

<Image img={datagrip_5} size="lg" border alt="DataGrip 数据源标签页中突出显示的 + 图标" />

  选择 **ClickHouse**

  :::tip
  随着您建立连接，顺序会发生变化，ClickHouse 可能还不在列表的顶部。
  :::

<Image img={datagrip_6} size="sm" border alt="DataGrip 从数据源列表中选择 ClickHouse" />

- 切换到 **驱动程序** 标签页并加载 ClickHouse 驱动

  为了减少下载大小，DataGrip 不附带驱动程序。在 **驱动程序** 标签页中
  从 **完全支持** 列表中选择 **ClickHouse**，并展开 **+** 符号。 从 **提供的驱动** 选项中选择 **最新稳定** 驱动：

<Image img={datagrip_1} size="lg" border alt="DataGrip 驱动程序标签页显示 ClickHouse 驱动安装" />

## 4. 连接到 ClickHouse {#3-connect-to-clickhouse}

- 指定您的数据库连接详细信息，然后点击 **测试连接**：

  在第一步中，您收集了连接详细信息，填写主机 URL、端口、用户名、密码和数据库名称，然后测试连接。

  :::tip
  DataGrip 对话框中的 **HOST** 项实际上是一个 URL，详见下图。

  有关 JDBC URL 设置的更多详细信息，请参阅 [ClickHouse JDBC driver](https://github.com/ClickHouse/clickhouse-java) 仓库。
  :::

<Image img={datagrip_7} size="md" border alt="DataGrip 连接详细信息表单与 ClickHouse 设置" />

## 了解更多 {#learn-more}

有关 DataGrip 的更多信息，请访问 DataGrip 文档。
