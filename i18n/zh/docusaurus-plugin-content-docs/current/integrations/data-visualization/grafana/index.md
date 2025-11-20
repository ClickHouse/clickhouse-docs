---
sidebar_label: '快速入门'
sidebar_position: 1
slug: /integrations/grafana
description: '在 Grafana 中使用 ClickHouse 的入门介绍'
title: '用于 Grafana 的 ClickHouse 数据源插件'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
  - website: 'https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/'
keywords: ['Grafana', '数据可视化', '仪表板', '插件', '数据源']
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';
import search from '@site/static/images/integrations/data-visualization/grafana/search.png';
import install from '@site/static/images/integrations/data-visualization/grafana/install.png';
import add_new_ds from '@site/static/images/integrations/data-visualization/grafana/add_new_ds.png';
import quick_config from '@site/static/images/integrations/data-visualization/grafana/quick_config.png';
import valid_ds from '@site/static/images/integrations/data-visualization/grafana/valid_ds.png';
import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 用于 Grafana 的 ClickHouse 数据源插件

<ClickHouseSupportedBadge/>

借助 Grafana，您可以通过仪表板探索并共享所有数据。
Grafana 需要一个插件才能连接到 ClickHouse，并且可以在其 UI 中轻松完成安装。

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/bRce9xWiqQM"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>



## 1. 收集连接详细信息 {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. 创建只读用户 {#2-making-a-read-only-user}

将 ClickHouse 连接到 Grafana 等数据可视化工具时,建议创建只读用户以保护数据免遭意外修改。

Grafana 不会验证查询的安全性。查询可以包含任何 SQL 语句,包括 `DELETE` 和 `INSERT`。

要配置只读用户,请按照以下步骤操作:

1. 按照[在 ClickHouse 中创建用户和角色](/operations/access-rights)指南创建 `readonly` 用户配置文件。
2. 确保 `readonly` 用户具有足够的权限来修改底层 [clickhouse-go 客户端](https://github.com/ClickHouse/clickhouse-go)所需的 `max_execution_time` 设置。
3. 如果您使用的是公共 ClickHouse 实例,不建议在 `readonly` 配置文件中设置 `readonly=2`。应保持 `readonly=1`,并将 `max_execution_time` 的约束类型设置为 [changeable_in_readonly](/operations/settings/constraints-on-settings) 以允许修改此设置。


## 3. 安装 Grafana 的 ClickHouse 插件 {#3--install-the-clickhouse-plugin-for-grafana}

在 Grafana 能够连接到 ClickHouse 之前,您需要安装相应的 Grafana 插件。假设您已登录 Grafana,请按照以下步骤操作:

1. 在侧边栏的 **Connections** 页面中,选择 **Add new connection** 选项卡。

2. 搜索 **ClickHouse** 并点击由 Grafana Labs 签名的插件:

   <Image
     size='md'
     img={search}
     alt='在连接页面选择 ClickHouse 插件'
     border
   />

3. 在下一个页面上,点击 **Install** 按钮:

   <Image size='md' img={install} alt='安装 ClickHouse 插件' border />


## 4. 定义 ClickHouse 数据源 {#4-define-a-clickhouse-data-source}

1. 安装完成后,点击 **Add new data source** 按钮。(您也可以从 **Connections** 页面的 **Data sources** 选项卡中添加数据源。)

   <Image
     size='md'
     img={add_new_ds}
     alt='创建 ClickHouse 数据源'
     border
   />

2. 向下滚动并找到 **ClickHouse** 数据源类型,或者在 **Add data source** 页面的搜索栏中搜索。选择 **ClickHouse** 数据源后,将显示以下页面:

<Image
  size='md'
  img={quick_config}
  alt='连接配置页面'
  border
/>

3. 输入服务器设置和凭据。关键设置包括:

- **Server host address:** ClickHouse 服务的主机名。
- **Server port:** ClickHouse 服务的端口。具体端口取决于服务器配置和协议。
- **Protocol:** 用于连接 ClickHouse 服务的协议。
- **Secure connection:** 如果服务器需要安全连接,请启用此选项。
- **Username** 和 **Password**: 输入 ClickHouse 用户凭据。如果尚未配置任何用户,可以尝试使用 `default` 作为用户名。建议[配置只读用户](#2-making-a-read-only-user)。

有关更多设置,请参阅[插件配置](./config.md)文档。

4. 点击 **Save & test** 按钮以验证 Grafana 是否能够连接到 ClickHouse 服务。如果连接成功,您将看到 **Data source is working** 消息:

   <Image size='md' img={valid_ds} alt='选择 Save & test' border />


## 5. 后续步骤 {#5-next-steps}

您的数据源现已配置完成,可以开始使用了!了解更多关于如何使用[查询构建器](./query-builder.md)构建查询的信息。

有关配置的更多详细信息,请参阅[插件配置](./config.md)文档。

如果您需要查找本文档中未涵盖的更多信息,请访问 [GitHub 上的插件代码仓库](https://github.com/grafana/clickhouse-datasource)。


## 升级插件版本 {#upgrading-plugin-versions}

从 v4 版本开始,配置和查询可以随新版本发布而升级。

v3 的配置和查询在打开时会自动迁移到 v4。虽然旧的配置和仪表板可以在 v4 中加载,但迁移结果不会持久化保存,除非在新版本中重新保存。如果您在打开旧配置/查询时遇到任何问题,请放弃更改并[在 GitHub 上报告问题](https://github.com/grafana/clickhouse-datasource/issues)。

如果配置/查询是使用较新版本创建的,插件将无法降级到旧版本。
