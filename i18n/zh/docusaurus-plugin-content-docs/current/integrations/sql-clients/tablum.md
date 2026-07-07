---
sidebar_label: 'TABLUM.IO'
slug: /integrations/tablumio
description: 'TABLUM.IO 是一款原生支持 ClickHouse 的数据管理 SaaS。'
title: '将 TABLUM.IO 连接到 ClickHouse'
doc_type: 'guide'
keywords: ['tablum', 'SQL 客户端', '数据库工具', '查询工具', '桌面应用']
integration:
  - support_level: 'community'
  - category: 'sql_client'
---

import Image from '@theme/IdealImage';
import tablum_ch_0 from '@site/static/images/integrations/sql-clients/tablum-ch-0.png';
import tablum_ch_1 from '@site/static/images/integrations/sql-clients/tablum-ch-1.png';
import tablum_ch_2 from '@site/static/images/integrations/sql-clients/tablum-ch-2.png';
import tablum_ch_3 from '@site/static/images/integrations/sql-clients/tablum-ch-3.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

<CommunityMaintainedBadge />

## 打开 TABLUM.IO 首页 \{#open-the-tablumio-startup-page\}

:::note
你可以在 Linux 服务器上通过 Docker 安装 TABLUM.IO 的自托管版本。
:::

## 1. 注册或登录该服务 \{#1-sign-up-or-sign-in-to-the-service\}

首先，使用您的电子邮箱注册 TABLUM.IO，或通过 Google 或 Facebook 账号快速登录。

<Image img={tablum_ch_0} size="md" border alt="TABLUM.IO 登录页面" />

## 2. 添加 ClickHouse 连接器 \{#2-add-a-clickhouse-connector\}

准备好 ClickHouse 的连接信息，打开 **Connector** 选项卡，然后填写主机 URL、端口、用户名、密码、数据库名称以及连接器名称。填写完成后，点击 **Test connection** 按钮验证连接信息，再点击 **Save connector for me** 将其保存。

:::tip
请根据您的连接信息填写正确的 **HTTP** 端口，并相应切换 **SSL** 模式。
:::

:::tip
通常，使用 TLS 时端口为 8443；不使用 TLS 时端口为 8123。
:::

<Image img={tablum_ch_1} size="lg" border alt="在 TABLUM.IO 中添加 ClickHouse 连接器" />

## 3. 选择连接器 \{#3-select-the-connector\}

转到 **Dataset** 选项卡。在下拉菜单中选择最近创建的 ClickHouse 连接器。右侧面板会显示可用的表和 schema 列表。

<Image img={tablum_ch_2} size="lg" border alt="在 TABLUM.IO 中选择 ClickHouse 连接器" />

## 4. 输入 SQL 查询并运行 \{#4-input-a-sql-query-and-run-it\}

在 SQL 控制台中输入查询，然后点击 **运行查询**。结果将以表格形式显示。

:::tip
右键单击列名，打开包含排序、筛选和其他操作的下拉菜单。
:::

<Image img={tablum_ch_3} size="lg" border alt="在 TABLUM.IO 中运行 SQL 查询" />

:::note
使用 TABLUM.IO，您可以

* 在您的 TABLUM.IO 账户中创建并使用多个 ClickHouse 连接器，
* 对任何已加载的数据运行查询，而不受数据源限制，
* 将结果作为新的 ClickHouse 数据库共享。
  :::

## 了解更多 \{#learn-more\}

请访问 https://tablum.io，了解有关 TABLUM.IO 的更多信息。