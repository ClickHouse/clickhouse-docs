---
'sidebar_label': '快速开始'
'sidebar_position': 1
'slug': '/integrations/grafana'
'description': '使用 Grafana 和 ClickHouse 的介绍'
'title': 'ClickHouse 数据源插件用于 Grafana'
'show_related_blogs': true
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import search from '@site/static/images/integrations/data-visualization/grafana/search.png';
import install from '@site/static/images/integrations/data-visualization/grafana/install.png';
import add_new_ds from '@site/static/images/integrations/data-visualization/grafana/add_new_ds.png';
import quick_config from '@site/static/images/integrations/data-visualization/grafana/quick_config.png';
import valid_ds from '@site/static/images/integrations/data-visualization/grafana/valid_ds.png';
import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# ClickHouse 数据源插件用于 Grafana

<ClickHouseSupportedBadge/>

通过 Grafana，您可以通过仪表板探索和共享所有数据。
Grafana 需要一个插件来连接 ClickHouse，该插件可以在其用户界面中轻松安装。

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

## 1. 收集连接详情 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 创建只读用户 {#2-making-a-read-only-user}

当将 ClickHouse 连接到像 Grafana 这样的数据可视化工具时，建议创建一个只读用户，以保护您的数据免受不必要的修改。

Grafana 不会验证查询是否安全。查询可以包含任何 SQL 语句，包括 `DELETE` 和 `INSERT`。

要配置只读用户，请按照以下步骤操作：
1. 创建一个 `readonly` 用户配置文件，遵循 [在 ClickHouse 中创建用户和角色](/operations/access-rights) 指南。
2. 确保 `readonly` 用户具有足够的权限以修改底层 [clickhouse-go client](https://github.com/ClickHouse/clickhouse-go) 所需的 `max_execution_time` 设置。
3. 如果您使用的是公共 ClickHouse 实例，不建议在 `readonly` 配置文件中设置 `readonly=2`。相反，保持 `readonly=1` 并将 `max_execution_time` 的约束类型设置为 [changeable_in_readonly](/operations/settings/constraints-on-settings)，以允许修改此设置。

## 3. 安装 ClickHouse 插件用于 Grafana {#3--install-the-clickhouse-plugin-for-grafana}

在 Grafana 可以连接到 ClickHouse 之前，您需要安装适当的 Grafana 插件。假设您已登录到 Grafana，按照以下步骤操作：

1. 在侧边栏的 **Connections** 页面，选择 **Add new connection** 标签。

2. 搜索 **ClickHouse** 并点击由 Grafana Labs 签名的插件：

    <Image size="md" img={search} alt="选择 connections 页面上的 ClickHouse 插件" border />

3. 在下一个屏幕上，点击 **Install** 按钮：

    <Image size="md" img={install} alt="安装 ClickHouse 插件" border />

## 4. 定义 ClickHouse 数据源 {#4-define-a-clickhouse-data-source}

1. 安装完成后，点击 **Add new data source** 按钮。（您也可以从 **Connections** 页面的 **Data sources** 标签中添加数据源。）

    <Image size="md" img={add_new_ds} alt="创建 ClickHouse 数据源" border />

2. 向下滚动找到 **ClickHouse** 数据源类型，或可以在 **Add data source** 页面上的搜索框中搜索它。选择 **ClickHouse** 数据源，以下页面将出现：

  <Image size="md" img={quick_config} alt="连接配置页面" border />

3. 输入您的服务器设置和凭据。关键设置包括：

- **服务器主机地址:** 您的 ClickHouse 服务的主机名。
- **服务器端口:** 您的 ClickHouse 服务的端口。根据服务器配置和协议，可能会有所不同。
- **协议:** 用于连接到您的 ClickHouse 服务的协议。
- **安全连接:** 如果您的服务器需要安全连接，请启用。
- **用户名** 和 **密码**: 输入您的 ClickHouse 用户凭据。如果您尚未配置任何用户，请尝试 `default` 作为用户名。建议 [配置一个只读用户](#2-making-a-read-only-user)。

有关更多设置，请查看 [插件配置](./config.md) 文档。

4. 点击 **Save & test** 按钮以验证 Grafana 是否可以连接到您的 ClickHouse 服务。如果成功，您将看到 **Data source is working** 消息：

    <Image size="md" img={valid_ds} alt="选择 Save & test" border />

## 5. 下一步 {#5-next-steps}

您的数据源现在可以使用了！了解有关如何使用 [查询构建器](./query-builder.md) 构建查询的更多信息。

有关配置的更多详情，请查看 [插件配置](./config.md) 文档。

如果您在这些文档中寻找的信息未包含在内，请查看 [GitHub 上的插件库](https://github.com/grafana/clickhouse-datasource)。

## 升级插件版本 {#upgrading-plugin-versions}

从 v4 开始，配置和查询能够随着新版本的发布而升级。

v3 的配置和查询在打开时会迁移到 v4。虽然旧的配置和仪表板将在 v4 中加载，但迁移不会持久化，直到它们在新版本中再次保存。如果您在打开旧配置/查询时遇到任何问题，请放弃更改并 [在 GitHub 上报告该问题](https://github.com/grafana/clickhouse-datasource/issues)。

如果配置/查询是使用新版本创建的，则插件无法降级到以前的版本。
