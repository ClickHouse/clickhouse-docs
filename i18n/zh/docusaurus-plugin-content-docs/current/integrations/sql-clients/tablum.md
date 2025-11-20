---
sidebar_label: 'TABLUM.IO'
slug: /integrations/tablumio
description: 'TABLUM.IO 是一款开箱即用支持 ClickHouse 的数据管理类 SaaS 服务。'
title: '将 TABLUM.IO 连接至 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'sql_client'
keywords: ['tablum', 'sql client', 'database tool', 'query tool', 'desktop app']
---

import Image from '@theme/IdealImage';
import tablum_ch_0 from '@site/static/images/integrations/sql-clients/tablum-ch-0.png';
import tablum_ch_1 from '@site/static/images/integrations/sql-clients/tablum-ch-1.png';
import tablum_ch_2 from '@site/static/images/integrations/sql-clients/tablum-ch-2.png';
import tablum_ch_3 from '@site/static/images/integrations/sql-clients/tablum-ch-3.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 TABLUM.IO 连接至 ClickHouse

<CommunityMaintainedBadge/>



## 打开 TABLUM.IO 启动页面 {#open-the-tablumio-startup-page}

:::note
您可以在 Linux 服务器上使用 Docker 安装自托管版本的 TABLUM.IO。
:::


## 1. 注册或登录服务 {#1-sign-up-or-sign-in-to-the-service}

首先,使用您的电子邮箱注册 TABLUM.IO,或通过 Google 或 Facebook 账户快速登录。

<Image img={tablum_ch_0} size='md' border alt='TABLUM.IO 登录页面' />


## 2. 添加 ClickHouse 连接器 {#2-add-a-clickhouse-connector}

收集您的 ClickHouse 连接信息,进入 **Connector** 选项卡,填写主机 URL、端口、用户名、密码、数据库名称和连接器名称。填写完这些字段后,点击 **Test connection** 按钮验证连接信息,然后点击 **Save connector for me** 保存连接器配置。

:::tip
请确保根据您的连接信息指定正确的 **HTTP** 端口并启用或禁用 **SSL** 模式。
:::

:::tip
通常情况下,使用 TLS 时端口为 8443,不使用 TLS 时端口为 8123。
:::

<Image
  img={tablum_ch_1}
  size='lg'
  border
  alt='在 TABLUM.IO 中添加 ClickHouse 连接器'
/>


## 3. 选择连接器 {#3-select-the-connector}

导航到 **Dataset** 选项卡。在下拉菜单中选择刚创建的 ClickHouse 连接器。在右侧面板中,您将看到可用的表和架构列表。

<Image
  img={tablum_ch_2}
  size='lg'
  border
  alt='在 TABLUM.IO 中选择 ClickHouse 连接器'
/>


## 4. 输入并运行 SQL 查询 {#4-input-a-sql-query-and-run-it}

在 SQL 控制台中输入查询语句,然后点击 **Run Query**。查询结果将以表格形式显示。

:::tip
右键点击列名可打开下拉菜单,其中包含排序、筛选等操作选项。
:::

<Image
  img={tablum_ch_3}
  size='lg'
  border
  alt='在 TABLUM.IO 中运行 SQL 查询'
/>

:::note
使用 TABLUM.IO,您可以:

- 在您的 TABLUM.IO 账户中创建和使用多个 ClickHouse 连接器
- 对任何已加载的数据运行查询,无论数据来源如何
- 将查询结果共享为新的 ClickHouse 数据库
  :::


## 了解更多 {#learn-more}

访问 https://tablum.io 了解更多关于 TABLUM.IO 的信息。
