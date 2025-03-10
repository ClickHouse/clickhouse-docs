---
sidebar_label: '连接 Zing Data'
sidebar_position: 206
slug: /integrations/zingdata
keywords: ['clickhouse', 'Zing Data', '连接', '集成', '用户界面']
description: 'Zing Data 是为 ClickHouse 提供的简单社交商业智能，适用于 iOS、Android 和网页。'
---
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import zing_01 from '@site/static/images/integrations/data-visualization/zing_01.png';
import zing_02 from '@site/static/images/integrations/data-visualization/zing_02.png';
import zing_03 from '@site/static/images/integrations/data-visualization/zing_03.png';
import zing_04 from '@site/static/images/integrations/data-visualization/zing_04.png';
import zing_05 from '@site/static/images/integrations/data-visualization/zing_05.png';
import zing_06 from '@site/static/images/integrations/data-visualization/zing_06.png';
import zing_07 from '@site/static/images/integrations/data-visualization/zing_07.png';
import zing_08 from '@site/static/images/integrations/data-visualization/zing_08.png';
import zing_09 from '@site/static/images/integrations/data-visualization/zing_09.png';


# 连接 Zing Data 到 ClickHouse

<a href="https://www.zingdata.com/" target="_blank">Zing Data</a> 是一个数据探索和可视化平台。Zing Data 使用 ClickHouse 提供的 JS 驱动程序连接到 ClickHouse。

## 如何连接 {#how-to-connect}
1. 收集您的连接详细信息。
<ConnectionDetails />

2. 下载或访问 Zing Data

    * 要在移动设备上使用 ClickHouse 和 Zing Data，请在 [Google Play Store](https://play.google.com/store/apps/details?id=com.getzingdata.android) 或 [Apple App Store](https://apps.apple.com/us/app/zing-data-collaborative-bi/id1563294091) 下载 Zing Data 应用。

    * 要在网页上使用 ClickHouse 和 Zing Data，请访问 [Zing 网络控制台](https://console.getzingdata.com/) 并创建一个帐户。

3. 添加数据源

    * 要使用 Zing Data 与 ClickHouse 数据交互，您需要定义一个 **_datasource_**。在 Zing Data 的移动应用菜单中，选择 **Sources**，然后点击 **Add a Datasource**。

    * 在网页上添加数据源，点击顶部菜单中的 **Data Sources**，点击 **New Datasource** 并从下拉菜单中选择 **Clickhouse**。

    <img src={zing_01} alt="Zing 01"/>
    <br/>

4. 填写连接详细信息，然后点击 **Check Connection**。

    <img src={zing_02} alt="Zing 02"/>
    <br/>

5. 如果连接成功，Zing 将引导您进行表选择。选择所需的表格并点击 **Save**。如果 Zing 无法连接到您的数据源，您会看到一条消息，请您检查您的凭据并重试。如果在检查凭据并重试后仍然遇到问题，<a id="contact_link" href="mailto:hello@getzingdata.com">请在此联系 Zing 支持。</a>

    <img src={zing_03} alt="Zing 03"/>
    <br/>

6. 一旦 ClickHouse 数据源添加成功，它将在您的 Zing 组织的 **Data Sources** / **Sources** 标签下对所有人可用。

## 在 Zing Data 中创建图表和仪表板 {#creating-charts-and-dashboards-in-zing-data}

1. 在添加 ClickHouse 数据源后，点击网页上的 **Zing App**，或在移动设备上点击数据源以开始创建图表。

2. 在表格列表中点击一个表格以创建图表。

    <img src={zing_04} alt="Zing 04"/>
    <br/>

3. 使用可视化查询构建器选择所需的字段、聚合等，然后点击 **Run Question**。

    <img src={zing_05} alt="Zing 05"/>
    <br/>

4. 如果您熟悉 SQL，您也可以编写自定义 SQL 来运行查询并创建图表。

    <img src={zing_06} alt="Zing 06"/>
    <img src={zing_07} alt="Zing 07"/>

5. 示例图表如下所示。可以通过三点菜单保存问题。您可以对图表进行评论、标记团队成员、创建实时警报、改变图表类型等。

    <img src={zing_08} alt="Zing 08"/>
    <br/>

6. 可以通过主屏幕的 **Dashboards** 下的 "+" 图标创建仪表板。现有问题可以拖入以在仪表板上显示。

    <img src={zing_09} alt="Zing 09"/>
    <br/>

## 相关内容 {#related-content}

- 博客: [使用 ClickHouse 进行数据可视化 - Zing Data](https://getzingdata.com/blog/zing-adds-support-for-clickhouse-as-a-data-source/)
- [文档](https://docs.getzingdata.com/docs/)
- [快速开始](https://getzingdata.com/quickstart/)
- 创建仪表板的指南 [Create Dashboards](https://getzingdata.com/blog/new-feature-create-multi-question-dashboards/)
