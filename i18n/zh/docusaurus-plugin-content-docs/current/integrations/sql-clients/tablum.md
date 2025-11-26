---
sidebar_label: 'TABLUM.IO'
slug: /integrations/tablumio
description: 'TABLUM.IO 是一款开箱即用、支持 ClickHouse 的数据管理 SaaS。'
title: '将 TABLUM.IO 连接到 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'sql_client'
keywords: ['tablum', 'SQL 客户端', '数据库工具', '查询工具', '桌面应用']
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
  你可以通过 Docker 在 Linux 服务器上安装 TABLUM.IO 的自托管版本。
:::



## 1. 注册或登录服务 {#1-sign-up-or-sign-in-to-the-service}

  首先，使用您的邮箱在 TABLUM.IO 注册，或者通过 Google 或 Facebook 账号快速登录。

<Image img={tablum_ch_0} size="md" border alt="TABLUM.IO 登录页面" />



## 2. 添加 ClickHouse 连接器 {#2-add-a-clickhouse-connector}

准备好 ClickHouse 连接信息，进入 **Connector** 选项卡，填写 host URL、port、username、password、database name 以及连接器名称。完成这些字段后，点击 **Test connection** 按钮验证配置信息，然后点击 **Save connector for me** 以便持久保存该连接器。

:::tip
请确保你指定了正确的 **HTTP** 端口，并根据连接配置切换 **SSL** 模式。
:::

:::tip
通常，在使用 TLS 时端口为 8443，而不使用 TLS 时端口为 8123。
:::

<Image img={tablum_ch_1} size="lg" border alt="在 TABLUM.IO 中添加 ClickHouse 连接器" />



## 3. 选择连接器 {#3-select-the-connector}

进入 **Dataset** 选项卡。在下拉列表中选择刚创建的 ClickHouse 连接器。在右侧面板中，您将看到可用的表和架构列表。

<Image img={tablum_ch_2} size="lg" border alt="在 TABLUM.IO 中选择 ClickHouse 连接器" />



## 4. 输入 SQL 查询并运行 {#4-input-a-sql-query-and-run-it}

在 SQL 控制台中输入查询，然后点击 **Run Query**。结果会以电子表格形式显示。

:::tip
右键单击列名可打开包含排序、过滤和其他操作的下拉菜单。
:::

<Image img={tablum_ch_3} size="lg" border alt="在 TABLUM.IO 中运行 SQL 查询" />

:::note
使用 TABLUM.IO，您可以：
* 在您的 TABLUM.IO 账户中创建和使用多个 ClickHouse 连接器，
* 对任意已加载的数据运行查询，而不受数据源限制，
* 将查询结果共享为新的 ClickHouse 数据库。
:::



## 了解更多 {#learn-more}

请访问 https://tablum.io 获取更多关于 TABLUM.IO 的信息。
