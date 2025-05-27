---
'sidebar_label': 'TABLUM.IO'
'slug': '/integrations/tablumio'
'description': 'TABLUM.IO 是一个支持 ClickHouse 的数据管理 SaaS，开箱即用。'
'title': '连接 TABLUM.IO 到 ClickHouse'
---

import Image from '@theme/IdealImage';
import tablum_ch_0 from '@site/static/images/integrations/sql-clients/tablum-ch-0.png';
import tablum_ch_1 from '@site/static/images/integrations/sql-clients/tablum-ch-1.png';
import tablum_ch_2 from '@site/static/images/integrations/sql-clients/tablum-ch-2.png';
import tablum_ch_3 from '@site/static/images/integrations/sql-clients/tablum-ch-3.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 连接 TABLUM.IO 到 ClickHouse

<CommunityMaintainedBadge/>

## 打开 TABLUM.IO 启动页面 {#open-the-tablumio-startup-page}

:::note
  您可以在您的 Linux 服务器上使用 Docker 安装自托管版本的 TABLUM.IO。
:::


## 1. 注册或登录到服务 {#1-sign-up-or-sign-in-to-the-service}

  首先，使用您的电子邮件注册 TABLUM.IO，或通过 Google 或 Facebook 帐户进行快速登录。

<Image img={tablum_ch_0} size="md" border alt="TABLUM.IO 登录页面" />

## 2. 添加 ClickHouse 连接器 {#2-add-a-clickhouse-connector}

收集您的 ClickHouse 连接详细信息，导航到 **Connector** 选项卡，并填写主机 URL、端口、用户名、密码、数据库名称和连接器名称。完成这些字段后，点击 **Test connection** 按钮以验证详细信息，然后点击 **Save connector for me** 以使其持久化。

:::tip
确保您指定正确的 **HTTP** 端口，并根据您的连接详细信息切换 **SSL** 模式。
:::

:::tip
通常，使用 TLS 时端口为 8443，不使用 TLS 时端口为 8123。
:::

<Image img={tablum_ch_1} size="lg" border alt="在 TABLUM.IO 中添加 ClickHouse 连接器" />

## 3. 选择连接器 {#3-select-the-connector}

导航到 **Dataset** 选项卡。在下拉菜单中选择最近创建的 ClickHouse 连接器。在右侧面板中，您将看到可用表和模式的列表。

<Image img={tablum_ch_2} size="lg" border alt="在 TABLUM.IO 中选择 ClickHouse 连接器" />

## 4. 输入 SQL 查询并运行 {#4-input-a-sql-query-and-run-it}

在 SQL 控制台中输入查询并按 **Run Query**。结果将以电子表格的形式显示。

:::tip
右键点击列名称以打开带有排序、过滤和其他操作的下拉菜单。
:::

<Image img={tablum_ch_3} size="lg" border alt="在 TABLUM.IO 中运行 SQL 查询" />

:::note
使用 TABLUM.IO，您可以
* 在您的 TABLUM.IO 帐户中创建和使用多个 ClickHouse 连接器，
* 在任何加载的数据上运行查询，无论数据源如何，
* 共享结果作为新的 ClickHouse 数据库。
:::

## 了解更多 {#learn-more}

在 https://tablum.io 找到有关 TABLUM.IO 的更多信息。
