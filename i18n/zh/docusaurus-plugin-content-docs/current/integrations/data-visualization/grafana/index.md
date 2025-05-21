---
'sidebar_label': '快速开始'
'sidebar_position': 1
'slug': '/integrations/grafana'
'description': '介绍如何在 Grafana 中使用 ClickHouse'
'title': 'ClickHouse data source plugin for Grafana'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';
import search from '@site/static/images/integrations/data-visualization/grafana/search.png';
import install from '@site/static/images/integrations/data-visualization/grafana/install.png';
import add_new_ds from '@site/static/images/integrations/data-visualization/grafana/add_new_ds.png';
import quick_config from '@site/static/images/integrations/data-visualization/grafana/quick_config.png';
import valid_ds from '@site/static/images/integrations/data-visualization/grafana/valid_ds.png';
import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# ClickHouse 数据源插件用于 Grafana

<ClickHouseSupportedBadge/>

使用 Grafana，您可以通过仪表板探索和共享所有数据。
Grafana 需要一个插件来连接到 ClickHouse，这个插件可以轻松地在其 UI 中安装。

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

## 1. 收集您的连接详情 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 创建只读用户 {#2-making-a-read-only-user}

在将 ClickHouse 连接到像 Grafana 这样的数据可视化工具时，建议创建一个只读用户以保护您的数据不受不必要的修改。

Grafana 不会验证查询是否安全。查询可以包含任何 SQL 语句，包括 `DELETE` 和 `INSERT`。

要配置只读用户，请按照以下步骤操作：
1. 创建一个 `readonly` 用户配置文件，参考 [在 ClickHouse 中创建用户和角色](/operations/access-rights) 指南。
2. 确保 `readonly` 用户拥有足够的权限以修改底层 [clickhouse-go client](https://github.com/ClickHouse/clickhouse-go) 所需的 `max_execution_time` 设置。
3. 如果您使用的是公共 ClickHouse 实例，不建议在 `readonly` 配置文件中设置 `readonly=2`。相反，保留 `readonly=1`，并将 `max_execution_time` 的约束类型设置为 [changeable_in_readonly](/operations/settings/constraints-on-settings)，以允许修改该设置。

## 3. 安装 ClickHouse 插件用于 Grafana {#3--install-the-clickhouse-plugin-for-grafana}

在 Grafana 连接到 ClickHouse 之前，您需要安装相应的 Grafana 插件。假设您已登录 Grafana，请按照以下步骤操作：

1. 在侧边栏的 **Connections** 页面中，选择 **Add new connection** 标签。

2. 搜索 **ClickHouse**，并点击由 Grafana Labs 签名的插件：

    <Image size="md" img={search} alt="在连接页面选择 ClickHouse 插件" border />

3. 在下一个屏幕上，点击 **Install** 按钮：

    <Image size="md" img={install} alt="安装 ClickHouse 插件" border />

## 4. 定义 ClickHouse 数据源 {#4-define-a-clickhouse-data-source}

1. 安装完成后，点击 **Add new data source** 按钮。 (您也可以从 **Connections** 页面上的 **Data sources** 标签中添加数据源。)

    <Image size="md" img={add_new_ds} alt="创建 ClickHouse 数据源" border />

2. 向下滚动并找到 **ClickHouse** 数据源类型，或者可以在 **Add data source** 页面中的搜索栏中搜索它。选择 **ClickHouse** 数据源，以下页面将出现：

  <Image size="md" img={quick_config} alt="连接配置页面" border />

3. 输入您的服务器设置和凭据。关键设置为：

- **服务器主机地址：** 您的 ClickHouse 服务的主机名。
- **服务器端口：** 您的 ClickHouse 服务的端口。依据服务器配置和协议会有所不同。
- **协议：** 用于连接您的 ClickHouse 服务的协议。
- **安全连接：** 如果您的服务器需要安全连接，请启用。
- **用户名** 和 **密码**：输入您的 ClickHouse 用户凭据。如果您未配置任何用户，请尝试使用 `default` 作为用户名。建议 [配置一个只读用户](#2-making-a-read-only-user)。

有关更多设置，请查看 [插件配置](./config.md) 文档。

4. 点击 **Save & test** 按钮以验证 Grafana 是否可以连接到您的 ClickHouse 服务。如果成功，您将看到 **Data source is working** 消息：

    <Image size="md" img={valid_ds} alt="选择保存并测试" border />

## 5. 下一步 {#5-next-steps}

您的数据源现在已准备好使用！了解更多关于如何使用 [查询构建器](./query-builder.md) 构建查询的信息。

有关配置的更多详细信息，请查看 [插件配置](./config.md) 文档。

如果您正在寻找这些文档中未包含的更多信息，请查看 [GitHub 上的插件库](https://github.com/grafana/clickhouse-datasource)。

## 升级插件版本 {#upgrading-plugin-versions}

从 v4 开始，配置和查询能够在新版本发布时进行升级。

来自 v3 的配置和查询在打开时会迁移到 v4。虽然旧的配置和仪表板将在 v4 中加载，但迁移不会被保留，直到您在新版本中再次保存它们。如果您在打开旧配置/查询时发现任何问题，请放弃您的更改并 [在 GitHub 上报告问题](https://github.com/grafana/clickhouse-datasource/issues)。

如果配置/查询是使用新版本创建的，则插件不能降级到以前的版本。

## 相关内容 {#related-content}

- [GitHub 上的插件库](https://github.com/grafana/clickhouse-datasource)
- 博客：[使用 ClickHouse 可视化数据 - 第 1 部分 - Grafana](https://clickhouse.com/blog/visualizing-data-with-grafana)
- 博客：[使用 Grafana 可视化 ClickHouse 数据 - 视频](https://www.youtube.com/watch?v=Ve-VPDxHgZU)
- 博客：[ClickHouse Grafana 插件 4.0 - 提升 SQL 可观察性](https://clickhouse.com/blog/clickhouse-grafana-plugin-4-0)
- 博客：[将数据导入 ClickHouse - 第 3 部分 - 使用 S3](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)
- 博客：[使用 ClickHouse 构建可观察性解决方案 - 第 1 部分 - 日志](https://clickhouse.com/blog/storing-log-data-in-clickhouse-fluent-bit-vector-open-telemetry)
- 博客：[使用 ClickHouse 构建可观察性解决方案 - 第 2 部分 - 跟踪](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
- 博客 & 网络研讨会：[使用 ClickHouse + Grafana 进行开源 GitHub 活动的故事](https://clickhouse.com/blog/introduction-to-clickhouse-and-grafana-webinar)
