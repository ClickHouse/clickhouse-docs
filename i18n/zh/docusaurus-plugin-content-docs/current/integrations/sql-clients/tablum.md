---
'sidebar_label': 'TABLUM.IO'
'slug': '/integrations/tablumio'
'description': 'TABLUM.IO 是一个支持 ClickHouse 的数据管理 SaaS，开箱即用。'
'title': '连接 TABLUM.IO 到 ClickHouse'
'doc_type': 'guide'
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
  您可以在自己的 Linux 服务器上通过 docker 安装 TABLUM.IO 的自托管版本。
:::

## 1. 注册或登录服务 {#1-sign-up-or-sign-in-to-the-service}

  首先，使用您的电子邮件注册 TABLUM.IO，或通过 Google 或 Facebook 的帐户进行快速登录。

<Image img={tablum_ch_0} size="md" border alt="TABLUM.IO 登录页面" />

## 2. 添加 ClickHouse 连接器 {#2-add-a-clickhouse-connector}

收集您的 ClickHouse 连接详细信息，导航到 **连接器** 标签，填写主机 URL、端口、用户名、密码、数据库名称和连接器名称。在完成这些字段后，点击 **测试连接** 按钮以验证详细信息，然后点击 **为我保存连接器** 使其持久化。

:::tip
确保您指定正确的 **HTTP** 端口，并根据您的连接细节切换 **SSL** 模式。
:::

:::tip
通常，使用 TLS 时端口为 8443，不使用 TLS 时端口为 8123。
:::

<Image img={tablum_ch_1} size="lg" border alt="在 TABLUM.IO 中添加 ClickHouse 连接器" />

## 3. 选择连接器 {#3-select-the-connector}

导航到 **数据集** 标签。在下拉菜单中选择最近创建的 ClickHouse 连接器。在右侧面板中，您将看到可用表和模式的列表。

<Image img={tablum_ch_2} size="lg" border alt="在 TABLUM.IO 中选择 ClickHouse 连接器" />

## 4. 输入 SQL 查询并运行 {#4-input-a-sql-query-and-run-it}

在 SQL 控制台中输入查询，然后按 **运行查询**。结果将以电子表格的形式显示。

:::tip
右键点击列名以打开带有排序、过滤和其他操作的下拉菜单。
:::

<Image img={tablum_ch_3} size="lg" border alt="在 TABLUM.IO 中运行 SQL 查询" />

:::note
使用 TABLUM.IO，您可以
* 在您的 TABLUM.IO 帐户内创建和利用多个 ClickHouse 连接器，
* 针对任何加载的数据运行查询，无论数据源如何，
* 将结果作为新的 ClickHouse 数据库共享。
:::

## 了解更多 {#learn-more}

在 https://tablum.io 查找有关 TABLUM.IO 的更多信息。
