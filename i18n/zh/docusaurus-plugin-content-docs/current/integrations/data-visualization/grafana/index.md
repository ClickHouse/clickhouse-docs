---
sidebar_label: '快速入门'
sidebar_position: 1
slug: /integrations/grafana
description: '在 Grafana 中使用 ClickHouse 的简介'
title: 'Grafana 的 ClickHouse 数据源插件'
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

借助 Grafana，你可以通过仪表板探索并共享所有数据。
Grafana 需要安装一个插件才能连接到 ClickHouse，可以在其 UI 中轻松完成安装。

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

当将 ClickHouse 连接到 Grafana 等数据可视化工具时，建议创建一个只读用户，以保护数据免遭不必要的修改。

Grafana 不会校验查询是否安全。查询中可以包含任意 SQL 语句，包括 `DELETE` 和 `INSERT`。

要配置只读用户，请按照以下步骤操作：
1. 按照 [Creating Users and Roles in ClickHouse](/operations/access-rights) 指南创建一个 `readonly` 用户配置文件。
2. 确保 `readonly` 用户具有足够的权限来修改底层 [clickhouse-go client](https://github.com/ClickHouse/clickhouse-go) 所需的 `max_execution_time` 设置。
3. 如果使用的是对公网开放的 ClickHouse 实例，则不建议在 `readonly` 配置文件中设置 `readonly=2`。相反，应保持 `readonly=1`，并将 `max_execution_time` 的约束类型设置为 [changeable_in_readonly](/operations/settings/constraints-on-settings)，以允许修改该设置。



## 3.  为 Grafana 安装 ClickHouse 插件 {#3--install-the-clickhouse-plugin-for-grafana}

在 Grafana 能连接到 ClickHouse 之前，你需要先安装相应的 Grafana 插件。假设你已经登录到 Grafana，请按照以下步骤操作：

1. 在侧边栏打开 **Connections** 页面，选择 **Add new connection** 选项卡。

2. 搜索 **ClickHouse**，然后点击由 Grafana Labs 签名的插件：

    <Image size="md" img={search} alt="在 Connections 页面选择 ClickHouse 插件" border />

3. 在接下来的页面中，点击 **Install** 按钮：

    <Image size="md" img={install} alt="安装 ClickHouse 插件" border />



## 4. 定义 ClickHouse 数据源 {#4-define-a-clickhouse-data-source}

1. 安装完成后，单击 **Add new data source** 按钮。（你也可以在 **Connections** 页面下的 **Data sources** 选项卡中添加数据源。）

    <Image size="md" img={add_new_ds} alt="Create a ClickHouse data source" border />

2. 向下滚动找到 **ClickHouse** 数据源类型，或者在 **Add data source** 页面顶部的搜索栏中搜索它。选择 **ClickHouse** 数据源后，会显示如下页面：

  <Image size="md" img={quick_config} alt="Connection configuration page" border />

3. 输入你的服务器设置和凭据。关键设置包括：

- **Server host address：** ClickHouse 服务的主机名。
- **Server port：** ClickHouse 服务的端口。具体取决于服务器配置和协议。
- **Protocol：** 用于连接 ClickHouse 服务的协议。
- **Secure connection：** 如果你的服务器要求安全连接，请启用此项。
- **Username** 和 **Password**：输入你的 ClickHouse 用户凭据。如果你尚未配置任何用户，可以尝试将用户名设为 `default`。建议[配置一个只读用户](#2-making-a-read-only-user)。

更多设置请参阅 [plugin configuration](./config.md) 文档。

4. 单击 **Save & test** 按钮以验证 Grafana 是否可以连接到你的 ClickHouse 服务。如果连接成功，你会看到 **Data source is working** 消息：

    <Image size="md" img={valid_ds} alt="Select Save & test" border />



## 5. 后续步骤 {#5-next-steps}

您的数据源现在已经准备就绪，可以开始使用了！在[查询构建器](./query-builder.md)文档中了解如何构建查询。

有关配置的更多详细信息，请查看[插件配置](./config.md)文档。

如果这些文档中未涵盖您需要的更多信息，请查看 [GitHub 上的插件仓库](https://github.com/grafana/clickhouse-datasource)。



## 升级插件版本 {#upgrading-plugin-versions}

自 v4 起，随着新版本发布，可以对现有配置和查询进行升级。

v3 的配置和查询在被打开时会自动迁移到 v4。虽然旧的配置和仪表盘会在 v4 中加载，但在使用新版本重新保存之前，迁移结果不会被持久化。如果在打开旧配置或查询时发现任何问题，请放弃更改并[在 GitHub 上报告问题](https://github.com/grafana/clickhouse-datasource/issues)。

如果配置或查询是由较新版本创建的，则无法将插件回退到之前的版本。
