---
sidebar_label: 'Deepnote'
sidebar_position: 11
slug: /integrations/deepnote
keywords: ['clickhouse', 'Deepnote', '连接', '集成', 'notebook']
description: '在熟悉的 notebook 环境中高效查询海量数据集，并进行分析和建模。'
title: '将 ClickHouse 连接到 Deepnote'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
  - website: 'https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote'
---

import deepnote_01 from '@site/static/images/integrations/data-visualization/deepnote_01.png';
import deepnote_02 from '@site/static/images/integrations/data-visualization/deepnote_02.png';
import deepnote_03 from '@site/static/images/integrations/data-visualization/deepnote_03.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

<CommunityMaintainedBadge />

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a> 是一个面向团队的协作式数据 notebook，帮助团队发现并共享洞察。除了兼容 Jupyter 之外，它还支持在云端运行，并提供一个统一的平台，便于高效协作和开展数据科学项目。

本指南假定你已经拥有 Deepnote 账户，并且有一个正在运行的 ClickHouse 实例。

## 交互式示例 \{#interactive-example\}

如果您想体验一个在 Deepnote 数据 notebook 中查询 ClickHouse 的交互式示例，请点击下方按钮，启动一个已连接到 [ClickHouse playground](../../../getting-started/playground.md) 的模板项目。

[<Image size="logo" img="https://deepnote.com/buttons/launch-in-deepnote.svg" alt="在 Deepnote 中启动" />](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)

## 连接到 ClickHouse \{#connect-to-clickhouse\}

1. 在 Deepnote 中，选择“Integrations”概览，然后点击 ClickHouse 卡片。

<Image size="lg" img={deepnote_01} alt="ClickHouse 集成卡片" border />

2. 填写您的 ClickHouse 实例连接信息：

<ConnectionDetails />

<Image size="md" img={deepnote_02} alt="ClickHouse 详细信息对话框" border />

***注意：*** 如果您到 ClickHouse 的连接受 IP Access List 保护，可能需要将 Deepnote 的 IP 地址加入允许列表。请参阅 [Deepnote 文档](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses) 了解更多信息。

3. 恭喜！您已成功将 ClickHouse 集成到 Deepnote 中。

## 使用 ClickHouse 集成 \{#using-clickhouse-integration\}

1. 首先，连接到 notebook 右侧的 ClickHouse 集成。

   <Image size="lg" img={deepnote_03} alt="ClickHouse 详细信息对话框" border />

2. 现在，新建一个 ClickHouse 查询块，并查询你的数据库。查询结果将保存为 DataFrame，并存储在 SQL 块中指定的变量中。

3. 你也可以将现有的任何 [SQL 块](https://docs.deepnote.com/features/sql-cells)转换为 ClickHouse 块。