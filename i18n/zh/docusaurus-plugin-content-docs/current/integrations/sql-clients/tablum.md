---
sidebar_label: 'TABLUM.IO'
slug: /integrations/tablumio
description: 'TABLUM.IO 是一个支持 ClickHouse 的数据管理 SaaS。'
---

import tablum_ch_0 from '@site/static/images/integrations/sql-clients/tablum-ch-0.png';
import tablum_ch_1 from '@site/static/images/integrations/sql-clients/tablum-ch-1.png';
import tablum_ch_2 from '@site/static/images/integrations/sql-clients/tablum-ch-2.png';
import tablum_ch_3 from '@site/static/images/integrations/sql-clients/tablum-ch-3.png';


# 将 TABLUM.IO 连接到 ClickHouse

## 打开 TABLUM.IO 启动页面 {#open-the-tablumio-startup-page}

TABLUM.IO 的云版本可在 [https://go.tablum.io/](https://go.tablum.io/) 访问。

:::note
  您可以在 Linux 服务器上通过 Docker 安装自托管版本的 TABLUM.IO。
:::

## 1. 注册或登录到服务 {#1-sign-up-or-sign-in-to-the-service}

  首先，使用您的电子邮件注册 TABLUM.IO，或通过 Google 或 Facebook 的帐户快速登录。

<img src={tablum_ch_0} class="image" alt="TABLUM.IO 0" />

## 2. 添加 ClickHouse 连接器 {#2-add-a-clickhouse-connector}

收集您的 ClickHouse 连接详细信息，导航到 **连接器** 标签页，填写主机 URL、端口、用户名、密码、数据库名称和连接器名称。在完成这些字段后，点击 **测试连接** 按钮以验证详细信息，然后点击 **为我保存连接器** 以使其持久化。

:::tip
确保您指定了正确的 **HTTP** 端口，并根据您的连接详细信息切换 **SSL** 模式。
:::

:::tip
通常，使用 TLS 时端口为 8443，未使用 TLS 时端口为 8123。
:::

<img src={tablum_ch_1} class="image" alt="TABLUM.IO 01" />

## 3. 选择连接器 {#3-select-the-connector}

导航到 **数据集** 标签页。在下拉菜单中选择最近创建的 ClickHouse 连接器。在右侧面板中，您将看到可用表和模式的列表。

<img src={tablum_ch_2} class="image" alt="TABLUM.IO 02" />

## 4. 输入 SQL 查询并运行 {#4-input-a-sql-query-and-run-it}

在 SQL 控制台中输入查询并按 **运行查询**。结果将以电子表格形式显示。

:::tip
右键点击列名称以打开包含排序、过滤和其他操作的下拉菜单。
:::

<img src={tablum_ch_3} class="image" alt="TABLUM.IO 03" />

:::note
使用 TABLUM.IO，您可以
* 在您的 TABLUM.IO 账户中创建和使用多个 ClickHouse 连接器，
* 对任何加载的数据运行查询，无论数据源是什么，
* 作为新的 ClickHouse 数据库共享结果。
:::

## 了解更多 {#learn-more}

有关 TABLUM.IO 的更多信息，请访问 https://tablum.io。
