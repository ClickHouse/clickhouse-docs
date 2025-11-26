---
sidebar_label: 'Zing Data'
sidebar_position: 206
slug: /integrations/zingdata
keywords: ['Zing Data']
description: 'Zing Data 是为 ClickHouse 打造的简洁易用的社交化商业智能平台，适用于 iOS、Android 和 Web。'
title: '将 Zing Data 连接到 ClickHouse'
show_related_blogs: true
doc_type: 'guide'
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

<a href="https://www.zingdata.com/" target="_blank">Zing Data</a> 是一个数据探索与可视化平台。Zing Data 通过 ClickHouse 提供的 JS 驱动连接到 ClickHouse。



## 如何连接 {#how-to-connect}
1. 收集你的连接信息。
<ConnectionDetails />

2. 下载或访问 Zing Data

    * 如需在移动端将 ClickHouse 与 Zing Data 一起使用，请在 [Google Play Store](https://play.google.com/store/apps/details?id=com.getzingdata.android) 或 [Apple App Store](https://apps.apple.com/us/app/zing-data-collaborative-bi/id1563294091) 下载 Zing Data 应用。

    * 如需在 Web 上将 ClickHouse 与 Zing Data 一起使用，请访问 [Zing Web 控制台](https://console.getzingdata.com/) 并创建一个账户。

3. 添加数据源

    * 若要在 Zing Data 中操作你的 ClickHouse 数据，你需要先定义一个 **_datasource_**（数据源）。在 Zing Data 移动应用的菜单中，选择 **Sources**，然后点击 **Add a Datasource**。

    * 若要在 Web 端添加数据源，点击顶部菜单中的 **Data Sources**，再点击 **New Datasource**，并在下拉菜单中选择 **ClickHouse**。

    <Image size="md" img={zing_01} alt="Zing Data 界面显示 New Datasource 按钮以及下拉菜单中的 ClickHouse 选项" border />
    <br/>

4. 填写连接信息并点击 **Check Connection**。

    <Image size="md" img={zing_02} alt="Zing Data 中的 ClickHouse 连接配置表单，包含 server、port、database、username 和 password 字段" border />
    <br/>

5. 如果连接成功，Zing 会进入表选择页面。选择所需的数据表并点击 **Save**。如果 Zing 无法连接到你的数据源，你会看到一条消息，提示你检查凭据并重试。如果在检查凭据并重试后仍然遇到问题，请 <a id="contact_link" href="mailto:hello@getzingdata.com">联系 Zing 支持。</a>

    <Image size="md" img={zing_03} alt="Zing Data 表选择界面，显示带复选框的可用 ClickHouse 数据表" border />
    <br/>

6. 一旦添加了 ClickHouse 数据源，它将在你的 Zing 组织中对所有成员可见，位于 **Data Sources** / **Sources** 选项卡下。



## 在 Zing Data 中创建图表和仪表板 {#creating-charts-and-dashboards-in-zing-data}

1. 在添加好 ClickHouse 数据源之后，在 Web 端点击 **Zing App**，或在移动端点击该数据源以开始创建图表。

2. 在表列表中点击某个表以创建图表。

    <Image size="sm" img={zing_04} alt="Zing Data 界面显示表列表以及可用的 ClickHouse 表" border />
    <br/>

3. 使用可视化查询构建器选择所需字段、聚合等，然后点击 **Run Question**。

    <Image size="md" img={zing_05} alt="Zing Data 可视化查询构建器界面，包含字段选择和聚合选项" border />
    <br/>

4. 如果熟悉 SQL，也可以编写自定义 SQL 来运行查询并创建图表。

    <Image size="md" img={zing_06} alt="Zing Data 中的 SQL 编辑器模式，展示 SQL 查询编写界面" border />
    <Image size="md" img={zing_07} alt="Zing Data 中 SQL 查询结果，以表格形式展示的数据" border />

5. 示例图表如下所示。可以通过三点菜单保存该问题。你可以在图表上发表评论、@ 提及团队成员、创建实时告警、更改图表类型等。

    <Image size="md" img={zing_08} alt="Zing Data 中的示例图表可视化，展示来自 ClickHouse 的数据以及选项菜单" border />
    <br/>

6. 可以在首页的 **Dashboards** 下，通过点击“+”图标来创建仪表板。可以将已有的问题拖拽进来，以显示在仪表板上。

    <Image size="md" img={zing_09} alt="Zing Data 仪表板视图，展示在仪表板布局中排列的多个可视化图表" border />
    <br/>



## 相关内容 {#related-content}

- [文档](https://docs.getzingdata.com/docs/)
- [快速入门](https://getzingdata.com/quickstart/)
- [创建仪表板](https://getzingdata.com/blog/new-feature-create-multi-question-dashboards/)指南
