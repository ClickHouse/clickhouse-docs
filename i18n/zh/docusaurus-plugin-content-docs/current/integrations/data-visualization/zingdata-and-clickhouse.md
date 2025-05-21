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
'description': 'Zing Data is simple social business intelligence for ClickHouse, made
  for iOS, Android and the web.'
'title': 'Connect Zing Data to ClickHouse'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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
1. 收集您的连接细节。
<ConnectionDetails />

2. 下载或访问 Zing Data

    * 要在移动设备上使用 ClickHouse 和 Zing Data，请在 [Google Play 商店](https://play.google.com/store/apps/details?id=com.getzingdata.android) 或者 [Apple App Store](https://apps.apple.com/us/app/zing-data-collaborative-bi/id1563294091) 下载 Zing Data 应用。

    * 要在网络上使用 ClickHouse 和 Zing Data，请访问 [Zing 网络控制台](https://console.getzingdata.com/) 并创建一个帐户。

3. 添加数据源

    * 要与 Zing Data 交互您 ClickHouse 数据，您需要定义一个 **_datasource_**。在 Zing Data 的移动应用菜单中，选择 **Sources**，然后点击 **Add a Datasource**。

    * 要在网络上添加数据源，请点击顶部菜单中的 **Data Sources**，然后点击 **New Datasource** 从下拉菜单中选择 **Clickhouse**。

    <Image size="md" img={zing_01} alt="Zing Data 界面显示新数据源按钮和 ClickHouse 选项的下拉菜单" border />
    <br/>

4. 填写连接细节并点击 **Check Connection**。

    <Image size="md" img={zing_02} alt="Zing Data 中 ClickHouse 连接配置表单，包括服务器、端口、数据库、用户名和密码的字段" border />
    <br/>

5. 如果连接成功，Zing 将引导您进行表选择。选择所需的表并点击 **Save**。如果 Zing 无法连接到您的数据源，您会看到一条消息提示您检查凭据并重试。如果在检查凭据并重试后仍然遇到问题，<a id="contact_link" href="mailto:hello@getzingdata.com">请在这里联系 Zing 支持。</a>

    <Image size="md" img={zing_03} alt="Zing Data 表选择界面显示可用的 ClickHouse 表及复选框" border />
    <br/>

6. 添加后，ClickHouse 数据源将在您 Zing 组织中的 **Data Sources** / **Sources** 标签下对所有人可用。

## 在 Zing Data 中创建图表和仪表板 {#creating-charts-and-dashboards-in-zing-data}

1. 在添加 ClickHouse 数据源后，点击网页版的 **Zing App**，或在移动设备上点击数据源以开始创建图表。

2. 点击表格列表下的一个表以创建图表。

    <Image size="sm" img={zing_04} alt="Zing Data 界面显示包含可用 ClickHouse 表的表格列表" border />
    <br/>

3. 使用可视化查询构建器选择所需字段、聚合等，然后点击 **Run Question**。

    <Image size="md" img={zing_05} alt="Zing Data 可视化查询构建器界面，包含字段选择和聚合选项" border />
    <br/>

4. 如果您熟悉 SQL，您也可以编写自定义 SQL 来运行查询并创建图表。

    <Image size="md" img={zing_06} alt="Zing Data 中的 SQL 编辑模式显示 SQL 查询编写界面" border />
    <Image size="md" img={zing_07} alt="Zing Data 中的 SQL 查询结果以表格形式显示数据" border />

5. 一个示例图表如下所示。问题可以通过三点菜单进行保存。您可以对图表进行评论，标记您的团队成员，创建实时警报，改变图表类型等。

    <Image size="md" img={zing_08} alt="Zing Data 中的示例图表可视化，显示来自 ClickHouse 的数据以及选项菜单" border />
    <br/>

6. 可以使用主屏幕中 **Dashboards** 下的 "+" 图标创建仪表板。现有的问题可以拖入，以显示在仪表板上。

    <Image size="md" img={zing_09} alt="Zing Data 仪表板视图显示多个可视化以仪表板布局排列" border />
    <br/>

## 相关内容 {#related-content}

- 博客: [使用 ClickHouse 可视化数据 - Zing Data](https://getzingdata.com/blog/zing-adds-support-for-clickhouse-as-a-data-source/)
- [文档](https://docs.getzingdata.com/docs/)
- [快速入门](https://getzingdata.com/quickstart/)
- 创建仪表板指南 [Create Dashboards](https://getzingdata.com/blog/new-feature-create-multi-question-dashboards/)
