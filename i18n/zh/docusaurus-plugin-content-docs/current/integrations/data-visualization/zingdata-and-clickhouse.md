---
'sidebar_label': 'Zing Data'
'sidebar_position': 206
'slug': '/integrations/zingdata'
'keywords':
- 'Zing Data'
'description': 'Zing Data 是为 ClickHouse 提供的简单社交商业智能，适用于 iOS、Android 和网页。'
'title': '将 Zing Data 连接到 ClickHouse'
'show_related_blogs': true
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import zing_01 from '@site/static/images/integrations/data-visualization/zing_01.png';
import zing_02 from '@site/static/images/integrations/data-visualization/zing_02.png';
import zing_03 from '@site/static/images/integrations/data-visualization/zing_03.png';
import zing_04 from '@site/static/images/integrations/data-visualization/zing_04.png';
import zing_05 from '@site/static/images/integrations/data-visualization/zing_05.png';
import zing_06 from '@site/static/images/integrations/data-visualization/zing_06.png';
import zing_07 from '@site/static/images/integrations/data-visualization/zing_07.png';
import zing_08 from '@site/static/images/integrations/data-visualization/zing_08.png';
import zing_09 from '@site/static/images/integrations/data-visualization/zing_09.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 Zing Data 连接到 ClickHouse

<CommunityMaintainedBadge/>

<a href="https://www.zingdata.com/" target="_blank">Zing Data</a> 是一个数据探索和可视化平台。Zing Data 使用 ClickHouse 提供的 JS 驱动程序连接到 ClickHouse。

## 如何连接 {#how-to-connect}
1. 收集您的连接详细信息。
<ConnectionDetails />

2. 下载或访问 Zing Data

    * 要在移动设备上使用 Zing Data 连接 ClickHouse，请在 [Google Play 商店](https://play.google.com/store/apps/details?id=com.getzingdata.android) 或 [Apple App Store](https://apps.apple.com/us/app/zing-data-collaborative-bi/id1563294091) 中下载 Zing Data 应用。

    * 要在网页上使用 Zing Data 连接 ClickHouse，请访问 [Zing Web 控制台](https://console.getzingdata.com/) 并创建一个帐户。

3. 添加数据源

    * 要使用 Zing Data 与您的 ClickHouse 数据进行交互，您需要定义一个 **_datasource_**。在 Zing Data 的移动应用菜单中，选择 **Sources**，然后单击 **Add a Datasource**。

    * 要在网页上添加数据源，请单击顶部菜单中的 **Data Sources**，然后单击 **New Datasource**，从下拉菜单中选择 **Clickhouse**。

    <Image size="md" img={zing_01} alt="Zing Data 界面，显示新增数据源按钮和下拉菜单中的 ClickHouse 选项" border />
    <br/>

4. 填写连接详细信息，然后单击 **Check Connection**。

    <Image size="md" img={zing_02} alt="Zing Data 中的 ClickHouse 连接配置表单，包含服务器、端口、数据库、用户名和密码字段" border />
    <br/>

5. 如果连接成功，Zing 将继续进行表选择。选择所需的表，然后单击 **Save**。如果 Zing 无法连接到您的数据源，您将看到一条消息，要求您检查凭据并重试。如果在检查凭据并重试后仍然遇到问题，请 <a id="contact_link" href="mailto:hello@getzingdata.com">在这里联系 Zing 支持。</a>

    <Image size="md" img={zing_03} alt="Zing Data 表选择界面，显示可用的 ClickHouse 表及复选框" border />
    <br/>

6. 一旦 Clickhouse 数据源被添加，它将可供您 Zing 组织中的所有人使用，位于 **Data Sources** / **Sources** 标签下。

## 在 Zing Data 中创建图表和仪表板 {#creating-charts-and-dashboards-in-zing-data}

1. 在添加了 Clickhouse 数据源后，点击网页上的 **Zing App**，或在移动设备上点击数据源以开始创建图表。

2. 在表列表中单击一个表以创建图表。

    <Image size="sm" img={zing_04} alt="Zing Data 界面，显示可用 ClickHouse 表的表列表" border />
    <br/>

3. 使用可视查询构建器选择所需的字段、聚合等，然后单击 **Run Question**。

    <Image size="md" img={zing_05} alt="Zing Data 可视查询构建器界面，包含字段选择和聚合选项" border />
    <br/>

4. 如果您熟悉 SQL，您也可以编写自定义 SQL 来运行查询并创建图表。

    <Image size="md" img={zing_06} alt="Zing Data 中的 SQL 编辑模式，显示 SQL 查询编写界面" border />
    <Image size="md" img={zing_07} alt="Zing Data 中的 SQL 查询结果，以表格格式显示数据" border />

5. 示例图表如下面所示。可以使用三点菜单保存该问题。您可以对图表进行评论，标记团队成员，创建实时警报，更改图表类型等。

    <Image size="md" img={zing_08} alt="Zing Data 中的示例图表可视化，显示来自 ClickHouse 的数据以及选项菜单" border />
    <br/>

6. 可以使用主屏幕上 **Dashboards** 下的 "+" 图标创建仪表板。现有问题可以拖拽以在仪表板上显示。

    <Image size="md" img={zing_09} alt="Zing Data 仪表板视图，显示多种可视化内容排列在仪表板布局中" border />
    <br/>

## 相关内容 {#related-content}

- [文档](https://docs.getzingdata.com/docs/)
- [快速入门](https://getzingdata.com/quickstart/)
- 创建仪表板指南 [Create Dashboards](https://getzingdata.com/blog/new-feature-create-multi-question-dashboards/)
