---
sidebar_label: 'Deepnote'
sidebar_position: 11
slug: /integrations/deepnote
keywords: ['clickhouse', 'Deepnote', 'connect', 'integrate', 'notebook']
description: '在熟悉的 notebook 环境中高效查询超大规模数据集，并完成分析和建模。'
title: '连接 ClickHouse 与 Deepnote'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
  - website: 'https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote'
---

import deepnote_01 from '@site/static/images/integrations/data-visualization/deepnote_01.png';
import deepnote_02 from '@site/static/images/integrations/data-visualization/deepnote_02.png';
import deepnote_03 from '@site/static/images/integrations/data-visualization/deepnote_03.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# 将 ClickHouse 连接到 Deepnote

<CommunityMaintainedBadge/>

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a> 是一款面向团队的协作式数据笔记本，帮助用户发掘并分享洞察。它不仅兼容 Jupyter，还在云端运行，为你提供一个集中的协作空间，从而高效地协同处理和开展数据科学项目。

本指南假定你已经拥有 Deepnote 账户，并且有一个正在运行的 ClickHouse 实例。



## 交互式示例 {#interactive-example}

如果您想体验从 Deepnote 数据笔记本查询 ClickHouse 的交互式示例,请点击下方按钮启动一个连接到 [ClickHouse 演示环境](../../../getting-started/playground.md)的模板项目。

[<Image size="logo" img="https://deepnote.com/buttons/launch-in-deepnote.svg" alt="在 Deepnote 中启动" />](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)


## 连接到 ClickHouse {#connect-to-clickhouse}

1. 在 Deepnote 中,选择"Integrations"概览页面并点击 ClickHouse 图标。

<Image size='lg' img={deepnote_01} alt='ClickHouse integration tile' border />

2. 提供您的 ClickHouse 实例的连接详细信息:

   <ConnectionDetails />

   <Image size='md' img={deepnote_02} alt='ClickHouse details dialog' border />

   **_注意:_** 如果您的 ClickHouse 连接受 IP 访问列表保护,您可能需要将 Deepnote 的 IP 地址添加到允许列表中。更多信息请参阅 [Deepnote 文档](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses)。

3. 恭喜!您已成功将 ClickHouse 集成到 Deepnote 中。


## 使用 ClickHouse 集成 {#using-clickhouse-integration}

1. 首先在笔记本右侧连接 ClickHouse 集成。

   <Image size='lg' img={deepnote_03} alt='ClickHouse 详细信息对话框' border />

2. 然后创建一个新的 ClickHouse 查询块来查询数据库。查询结果将以 DataFrame 形式保存,并存储在 SQL 块中指定的变量里。
3. 您也可以将任何现有的 [SQL 块](https://docs.deepnote.com/features/sql-cells) 转换为 ClickHouse 块。
