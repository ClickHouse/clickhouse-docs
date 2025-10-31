---
'sidebar_label': 'DataGrip'
'slug': '/integrations/datagrip'
'description': 'DataGrip 是一个支持 ClickHouse 的数据库 IDE。'
'title': '连接 DataGrip 到 ClickHouse'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import datagrip_1 from '@site/static/images/integrations/sql-clients/datagrip-1.png';
import datagrip_5 from '@site/static/images/integrations/sql-clients/datagrip-5.png';
import datagrip_6 from '@site/static/images/integrations/sql-clients/datagrip-6.png';
import datagrip_7 from '@site/static/images/integrations/sql-clients/datagrip-7.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 连接 DataGrip 到 ClickHouse

<CommunityMaintainedBadge/>

## 启动或下载 DataGrip {#start-or-download-datagrip}

DataGrip 可在 https://www.jetbrains.com/datagrip/ 获得。

## 1. 收集连接细节 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 加载 ClickHouse 驱动 {#2-load-the-clickhouse-driver}

1. 启动 DataGrip，在 **数据源** 标签中，点击 **数据源和驱动** 对话框中的 **+** 图标。

<Image img={datagrip_5} size="lg" border alt="DataGrip 数据源选项卡，突出显示 + 图标" />

  选择 **ClickHouse**

  :::tip
  当您建立连接时，顺序会发生变化，ClickHouse 可能尚未在您的列表顶部。
  :::

<Image img={datagrip_6} size="sm" border alt="DataGrip 从数据源列表中选择 ClickHouse" />

- 切换到 **驱动** 标签并加载 ClickHouse 驱动

  DataGrip 不随带驱动以最小化下载大小。在 **驱动** 标签中，从 **完全支持** 列表中选择 **ClickHouse**，并展开 **+** 符号。选择 **提供的驱动** 中的 **最新稳定** 驱动：

<Image img={datagrip_1} size="lg" border alt="DataGrip 驱动选项卡显示 ClickHouse 驱动安装" />

## 3. 连接到 ClickHouse {#3-connect-to-clickhouse}

- 指定您的数据库连接细节，然后点击 **测试连接**：

  在第一步中，您收集了连接细节，填写主机 URL、端口、用户名、密码和数据库名称，然后测试连接。

  :::tip
  DataGrip 对话框中的 **HOST** 条目实际上是一个 URL，详见下图。

  有关 JDBC URL 设置的更多详情，请参阅 [ClickHouse JDBC 驱动](https://github.com/ClickHouse/clickhouse-java) 存储库。
  :::

<Image img={datagrip_7} size="md" border alt="DataGrip 连接细节表单，包含 ClickHouse 设置" />

## 了解更多 {#learn-more}

有关 DataGrip 的更多信息，请访问 DataGrip 文档。
