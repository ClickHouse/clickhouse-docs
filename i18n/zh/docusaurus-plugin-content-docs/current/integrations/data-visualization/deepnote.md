---
sidebar_label: 'Deepnote'
sidebar_position: 11
slug: /integrations/deepnote
keywords: ['clickhouse', 'Deepnote', 'connect', 'integrate', 'notebook']
description: '高效查询非常大的数据集，分析和建模于熟悉的笔记本环境中。'
---

import deepnote_01 from '@site/static/images/integrations/data-visualization/deepnote_01.png';
import deepnote_02 from '@site/static/images/integrations/data-visualization/deepnote_02.png';
import deepnote_03 from '@site/static/images/integrations/data-visualization/deepnote_03.png';

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# 将 ClickHouse 连接到 Deepnote

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a> 是一个为团队构建的协作数据笔记本，用于发现和分享见解。除了与 Jupyter 兼容外，它还在云端运行，为您提供一个集中地点，以高效合作并开展数据科学项目。

本指南假定您已经拥有一个 Deepnote 账户，并且您有一个正在运行的 ClickHouse 实例。

## 交互示例 {#interactive-example}
如果您想探索从 Deepnote 数据笔记本查询 ClickHouse 的交互示例，请点击下面的按钮以启动一个连接到 [ClickHouse playground](../../getting-started/playground.md) 的模板项目。

[<img src="https://deepnote.com/buttons/launch-in-deepnote.svg"/>](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)

## 连接到 ClickHouse {#connect-to-clickhouse}

1. 在 Deepnote 中，选择“集成”概述并点击 ClickHouse 瓦片。

<img src={deepnote_01} class="image" alt="ClickHouse integration tile" style={{width: '100%'}}/>

2. 提供您 ClickHouse 实例的连接详情：
<ConnectionDetails />

   <img src={deepnote_02} class="image" alt="ClickHouse details dialog" style={{width: '100%'}}/>

   **_注意:_** 如果您的 ClickHouse 连接受到 IP 访问列表保护，您可能需要允许 Deepnote 的 IP 地址。有关更多信息，请参见 [Deepnote 的文档](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses)。
3. 恭喜您！您现在已将 ClickHouse 集成到 Deepnote 中。

## 使用 ClickHouse 集成 {#using-clickhouse-integration}

1. 从笔记本右侧开始连接 ClickHouse 集成。

   <img src={deepnote_03} class="image" alt="ClickHouse details dialog" style={{width: '100%'}}/>

2. 现在创建一个新的 ClickHouse 查询块并查询您的数据库。查询结果将被保存为 DataFrame 并存储在 SQL 块中指定的变量中。
3. 您还可以将任何现有的 [SQL 块](https://docs.deepnote.com/features/sql-cells) 转换为 ClickHouse 块。
