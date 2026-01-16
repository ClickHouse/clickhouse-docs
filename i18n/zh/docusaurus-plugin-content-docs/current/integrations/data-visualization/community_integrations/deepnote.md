---
sidebar_label: 'Deepnote'
sidebar_position: 11
slug: /integrations/deepnote
keywords: ['clickhouse', 'Deepnote', '连接', '集成', '笔记本']
description: '在熟悉的 notebook 环境中高效查询超大规模数据集，进行分析和建模。'
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

# 将 ClickHouse 连接到 Deepnote \{#connect-clickhouse-to-deepnote\}

<CommunityMaintainedBadge/>

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a> 是一款协作数据笔记本，旨在帮助团队发现和共享洞察。除了兼容 Jupyter 之外，它还可在云端运行，为您提供一个集中化的协作空间，以便高效开展数据科学项目。

本指南假定您已经拥有 Deepnote 账户，并且已有一个正在运行的 ClickHouse 实例。

## 交互式示例 \\{#interactive-example\\}

如果您希望在 Deepnote 数据笔记本中探索从 ClickHouse 查询数据的交互式示例，请点击下方按钮，启动一个已连接到 [ClickHouse Playground](../../../getting-started/playground.md) 的模板项目。

[<Image size="logo" img="https://deepnote.com/buttons/launch-in-deepnote.svg" alt="在 Deepnote 中启动" />](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)

## 连接到 ClickHouse \\{#connect-to-clickhouse\\}

1. 在 Deepnote 中，打开 “Integrations” 概览并点击 ClickHouse 卡片。

<Image size="lg" img={deepnote_01} alt="ClickHouse 集成卡片" border />

2. 填写 ClickHouse 实例的连接详细信息：

<ConnectionDetails />

<Image size="md" img={deepnote_02} alt="ClickHouse 详情对话框" border />

**_注意：_** 如果您通过 IP 访问列表限制对 ClickHouse 的访问，则可能需要将 Deepnote 的 IP 地址加入允许列表。详细信息请参阅 [Deepnote 的文档](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses)。

3. 恭喜！您已在 Deepnote 中成功集成 ClickHouse。

## 使用 ClickHouse 集成 \\{#using-clickhouse-integration\\}

1. 首先，在笔记本右侧连接 ClickHouse 集成。

   <Image size="lg" img={deepnote_03} alt="ClickHouse 详情对话框" border />

2. 现在创建一个新的 ClickHouse 查询块并查询你的数据库。查询结果会被保存为一个 DataFrame，并存储在 SQL 块中指定的变量中。
3. 你也可以将任意现有的 [SQL 块](https://docs.deepnote.com/features/sql-cells) 转换为 ClickHouse 块。