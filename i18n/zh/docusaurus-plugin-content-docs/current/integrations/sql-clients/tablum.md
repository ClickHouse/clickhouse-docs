---
'sidebar_label': 'TABLUM.IO'
'slug': '/integrations/tablumio'
'description': 'TABLUM.IO是一种支持ClickHouse开箱即用的数据管理SaaS。'
'title': 'Connecting TABLUM.IO to ClickHouse'
---

import Image from '@theme/IdealImage';
import tablum_ch_0 from '@site/static/images/integrations/sql-clients/tablum-ch-0.png';
import tablum_ch_1 from '@site/static/images/integrations/sql-clients/tablum-ch-1.png';
import tablum_ch_2 from '@site/static/images/integrations/sql-clients/tablum-ch-2.png';
import tablum_ch_3 from '@site/static/images/integrations/sql-clients/tablum-ch-3.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 TABLUM.IO 连接到 ClickHouse

<CommunityMaintainedBadge/>

## 打开 TABLUM.IO 启动页面 {#open-the-tablumio-startup-page}

:::note
  您可以在 Linux 服务器上通过 docker 安装 TABLUM.IO 的自托管版本。
:::


## 1. 注册或登录服务 {#1-sign-up-or-sign-in-to-the-service}

  首先，使用您的电子邮件注册 TABLUM.IO，或者通过 Google 或 Facebook 账户快速登录。

<Image img={tablum_ch_0} size="md" border alt="TABLUM.IO 登录页面" />

## 2. 添加 ClickHouse 连接器 {#2-add-a-clickhouse-connector}

收集您的 ClickHouse 连接详细信息，导航到 **Connector** 标签页，并填写主机 URL、端口、用户名、密码、数据库名称和连接器名称。完成这些字段后，点击 **Test connection** 按钮以验证详细信息，然后点击 **Save connector for me** 以使其持久化。

:::tip
确保您指定了正确的 **HTTP** 端口，并根据您的连接详细信息切换 **SSL** 模式。
:::

:::tip
通常，使用 TLS 时端口为 8443，未使用 TLS 时端口为 8123。
:::

<Image img={tablum_ch_1} size="lg" border alt="在 TABLUM.IO 中添加 ClickHouse 连接器" />

## 3. 选择连接器 {#3-select-the-connector}

导航到 **Dataset** 标签页。在下拉菜单中选择最近创建的 ClickHouse 连接器。在右侧面板中，您将看到可用表和架构的列表。

<Image img={tablum_ch_2} size="lg" border alt="在 TABLUM.IO 中选择 ClickHouse 连接器" />

## 4. 输入 SQL 查询并运行它 {#4-input-a-sql-query-and-run-it}

在 SQL 控制台中输入一个查询并按 **Run Query**。结果将以电子表格的形式显示。

:::tip
右键单击列名以打开带有排序、筛选和其他操作的下拉菜单。
:::

<Image img={tablum_ch_3} size="lg" border alt="在 TABLUM.IO 中运行 SQL 查询" />

:::note
通过 TABLUM.IO，您可以
* 在您的 TABLUM.IO 账户中创建和使用多个 ClickHouse 连接器，
* 在加载的任何数据上运行查询，无论数据源如何，
* 将结果作为新的 ClickHouse 数据库进行共享。
:::

## 了解更多 {#learn-more}

有关 TABLUM.IO 的更多信息，请访问 https://tablum.io。
