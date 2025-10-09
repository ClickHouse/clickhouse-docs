---
'sidebar_label': 'Fabi.ai'
'slug': '/integrations/fabi.ai'
'keywords':
- 'clickhouse'
- 'Fabi.ai'
- 'connect'
- 'integrate'
- 'notebook'
- 'ui'
- 'analytics'
'description': 'Fabi.ai 是一个全功能的协作数据分析平台。您可以利用 SQL、Python、AI 和无代码构建仪表板和数据工作流，比以往任何时候都更快。'
'title': '将 ClickHouse 连接到 Fabi.ai'
'doc_type': 'guide'
---

import fabi_01 from '@site/static/images/integrations/data-visualization/fabi_01.png';
import fabi_02 from '@site/static/images/integrations/data-visualization/fabi_02.png';
import fabi_03 from '@site/static/images/integrations/data-visualization/fabi_03.png';
import fabi_04 from '@site/static/images/integrations/data-visualization/fabi_04.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# 将 ClickHouse 连接到 Fabi.ai

<CommunityMaintainedBadge/>

<a href="https://www.fabi.ai/" target="_blank">Fabi.ai</a> 是一个一体化的协作数据分析平台。您可以利用 SQL、Python、AI 和无代码，快速构建仪表板和数据工作流。结合 ClickHouse 的规模和强大功能，您可以在几分钟内在海量数据集上构建并分享您的第一个高性能仪表板。

<Image size="md" img={fabi_01} alt="Fabi.ai 数据探索和工作流平台" border />

## 收集连接详细信息 {#gather-your-connection-details}

<ConnectionDetails />

## 创建您的 Fabi.ai 账户并连接 ClickHouse {#connect-to-clickhouse}

登录或创建您的 Fabi.ai 账户： https://app.fabi.ai/

1. 在您首次创建账户时，系统会提示您连接数据库；如果您已经有账户，请点击任意 Smartbook 左侧的数据源面板，然后选择添加数据源。

   <Image size="lg" img={fabi_02} alt="添加数据源" border />

2. 然后将提示您输入连接详细信息。

   <Image size="md" img={fabi_03} alt="ClickHouse 凭据表单" border />

3. 恭喜您！您现在已经将 ClickHouse 集成到 Fabi.ai 中。

## 查询 ClickHouse {#querying-clickhouse}

一旦您将 Fabi.ai 连接到 ClickHouse，前往任何 [Smartbook](https://docs.fabi.ai/analysis_and_reporting/smartbooks) 并创建一个 SQL 单元。如果您的 Fabi.ai 实例只连接了一个数据源，则 SQL 单元将自动默认为 ClickHouse；否则，您可以从源下拉列表中选择查询源。

   <Image size="lg" img={fabi_04} alt="查询 ClickHouse" border />

## 其他资源 {#additional-resources}

[Fabi.ai](https://www.fabi.ai) 文档: https://docs.fabi.ai/introduction

[Fabi.ai](https://www.fabi.ai) 入门教程视频: https://www.youtube.com/playlist?list=PLjxPRVnyBCQXxxByw2CLC0q7c-Aw6t2nl
