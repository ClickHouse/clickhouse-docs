---
'sidebar_label': 'Zing Data'
'sidebar_position': 206
'slug': '/integrations/zingdata'
'keywords':
- 'clickhouse'
- 'Zing Data'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Zing Data 是为 ClickHouse 提供的简单社会商业智能，适用于 iOS、Android 和网页。'
'title': '将 Zing Data 连接到 ClickHouse'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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

# 连接 Zing Data 到 ClickHouse

<CommunityMaintainedBadge/>

<a href="https://www.zingdata.com/" target="_blank">Zing Data</a> 是一个数据探索和可视化平台。Zing Data 使用 ClickHouse 提供的 JS 驱动程序连接到 ClickHouse。

## 如何连接 {#how-to-connect}
1. 收集您的连接详细信息。
<ConnectionDetails />

2. 下载或访问 Zing Data

    * 要在移动设备上使用 Clickhouse 和 Zing Data，请在 [Google Play 商店](https://play.google.com/store/apps/details?id=com.getzingdata.android) 或 [Apple App Store](https://apps.apple.com/us/app/zing-data-collaborative-bi/id1563294091) 下载 Zing Data 应用。

    * 要在网络上使用 Clickhouse 和 Zing Data，请访问 [Zing 网络控制台](https://console.getzingdata.com/) 并创建一个帐户。

3. 添加数据源

    * 要与 Zing Data 交互您的 ClickHouse 数据，您需要定义一个 **_数据源_**。在 Zing Data 的移动应用菜单中，选择 **Sources**，然后点击 **Add a Datasource**。

    * 要在网络上添加数据源，请点击顶部菜单中的 **Data Sources**，点击 **New Datasource** 并从下拉菜单中选择 **Clickhouse**。

    <Image size="md" img={zing_01} alt="Zing Data 界面显示新数据源按钮和下拉菜单中的 ClickHouse 选项" border />
    <br/>

4. 填写连接详细信息并点击 **Check Connection**。

    <Image size="md" img={zing_02} alt="Zing Data 中的 ClickHouse 连接配置表单，字段包括服务器、端口、数据库、用户名和密码" border />
    <br/>

5. 如果连接成功，Zing 将引导您进行表格选择。选择所需的表并点击 **Save**。如果 Zing 无法连接到您的数据源，您将看到一个消息，要求您检查凭据并重试。如果在检查凭据并重试后仍然遇到问题，<a id="contact_link" href="mailto:hello@getzingdata.com">请在此联系 Zing 支持。</a>

    <Image size="md" img={zing_03} alt="Zing Data 表格选择界面显示可用的 ClickHouse 表格及复选框" border />
    <br/>

6. 一旦添加了 Clickhouse 数据源，它将在您的 Zing 组织的 **Data Sources** / **Sources** 选项卡下对所有人可用。

## 在 Zing Data 中创建图表和仪表板 {#creating-charts-and-dashboards-in-zing-data}

1. 在您的 Clickhouse 数据源添加后，点击网页上的 **Zing App**，或在移动设备上点击数据源以开始创建图表。

2. 点击表格列表下的某个表以创建图表。

    <Image size="sm" img={zing_04} alt="Zing Data 界面显示可用的 ClickHouse 表格列表" border />
    <br/>

3. 使用可视化查询构建器选择所需的字段、聚合等，并点击 **Run Question**。

    <Image size="md" img={zing_05} alt="Zing Data 可视化查询构建器界面，具有字段选择和聚合选项" border />
    <br/>

4. 如果您熟悉 SQL，您还可以编写自定义 SQL 来执行查询并创建图表。

    <Image size="md" img={zing_06} alt="Zing Data 中的 SQL 编辑模式，显示 SQL 查询编写界面" border />
    <Image size="md" img={zing_07} alt="Zing Data 中的 SQL 查询结果，以表格格式显示数据" border />

5. 示例图表如下所示。可以使用三点菜单保存问题。您可以对图表进行评论，标记团队成员，创建实时警报，更改图表类型等。

    <Image size="md" img={zing_08} alt="Zing Data 中的示例图表可视化，显示来自 ClickHouse 的数据及选项菜单" border />
    <br/>

6. 可以使用主页屏幕下的 **Dashboards** 中的 "+" 图标创建仪表板。现有问题可以拖动到仪表板上进行显示。

    <Image size="md" img={zing_09} alt="Zing Data 仪表板视图，显示按仪表板布局排列的多个可视化" border />
    <br/>

## 相关内容 {#related-content}

- 博客: [使用 ClickHouse 可视化数据 - Zing Data](https://getzingdata.com/blog/zing-adds-support-for-clickhouse-as-a-data-source/)
- [文档](https://docs.getzingdata.com/docs/)
- [快速入门](https://getzingdata.com/quickstart/)
- 创建仪表板指南 [Create Dashboards](https://getzingdata.com/blog/new-feature-create-multi-question-dashboards/)
