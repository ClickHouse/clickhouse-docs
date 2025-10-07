---
'sidebar_label': 'Deepnote'
'sidebar_position': 11
'slug': '/integrations/deepnote'
'keywords':
- 'clickhouse'
- 'Deepnote'
- 'connect'
- 'integrate'
- 'notebook'
'description': '高效查询非常大的数据集，在熟悉的笔记本环境中进行分析和建模。'
'title': '将 ClickHouse 连接到 Deepnote'
'doc_type': 'guide'
---

import deepnote_01 from '@site/static/images/integrations/data-visualization/deepnote_01.png';
import deepnote_02 from '@site/static/images/integrations/data-visualization/deepnote_02.png';
import deepnote_03 from '@site/static/images/integrations/data-visualization/deepnote_03.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# 将 ClickHouse 连接到 Deepnote

<CommunityMaintainedBadge/>

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a> 是一个为团队构建的协作数据笔记本，使数据洞察的发现与分享变得更加高效。除了兼容 Jupyter，它还在云端运行，为您提供一个集中协作和高效工作于数据科学项目的地方。

本指南假定您已经拥有 Deepnote 账户，并且有一个正在运行的 ClickHouse 实例。

## 交互示例 {#interactive-example}
如果您想探索从 Deepnote 数据笔记本查询 ClickHouse 的交互示例，请点击下面的按钮启动一个连接到 [ClickHouse playground](../../getting-started/playground.md) 的模板项目。

[<Image size="logo" img="https://deepnote.com/buttons/launch-in-deepnote.svg" alt="在 Deepnote 中启动" />](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)

## 连接到 ClickHouse {#connect-to-clickhouse}

1. 在 Deepnote 中，选择 "Integrations" 概览并点击 ClickHouse 瓷砖。

<Image size="lg" img={deepnote_01} alt="ClickHouse 集成瓷砖" border />

2. 提供您的 ClickHouse 实例的连接详细信息：
<ConnectionDetails />

   <Image size="md" img={deepnote_02} alt="ClickHouse 详细信息对话框" border />

   **_注意：_** 如果您的 ClickHouse 连接受 IP 访问列表保护，您可能需要允许 Deepnote 的 IP 地址。有关更多信息，请参阅 [Deepnote 的文档](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses)。

3. 恭喜您！您现在已将 ClickHouse 集成到 Deepnote 中。

## 使用 ClickHouse 集成 {#using-clickhouse-integration}

1. 首先，在您的笔记本右侧连接到 ClickHouse 集成。

   <Image size="lg" img={deepnote_03} alt="ClickHouse 详细信息对话框" border />

2. 现在创建一个新的 ClickHouse 查询块并查询您的数据库。查询结果将作为数据框（DataFrame）保存，并存储在 SQL 块指定的变量中。
3. 您还可以将任何现有的 [SQL 块](https://docs.deepnote.com/features/sql-cells) 转换为 ClickHouse 块。
