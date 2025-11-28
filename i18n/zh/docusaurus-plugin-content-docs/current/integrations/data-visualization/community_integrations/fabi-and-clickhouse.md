---
sidebar_label: 'Fabi.ai'
slug: /integrations/fabi.ai
keywords: ['clickhouse', 'Fabi.ai', 'connect', 'integrate', 'notebook', 'ui', 'analytics']
description: 'Fabi.ai 是一体化的协作式数据分析平台。你可以借助 SQL、Python、AI 和无代码，比以往更快速地构建仪表盘和数据工作流'
title: '将 ClickHouse 连接到 Fabi.ai'
doc_type: 'guide'
---

import fabi_01 from '@site/static/images/integrations/data-visualization/fabi_01.png';
import fabi_02 from '@site/static/images/integrations/data-visualization/fabi_02.png';
import fabi_03 from '@site/static/images/integrations/data-visualization/fabi_03.png';
import fabi_04 from '@site/static/images/integrations/data-visualization/fabi_04.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# 将 ClickHouse 连接到 Fabi.ai

<CommunityMaintainedBadge/>

<a href="https://www.fabi.ai/" target="_blank">Fabi.ai</a> 是一个一体化协作式数据分析平台。你可以借助 SQL、Python、AI 和无代码能力，以前所未有的速度构建仪表盘和数据工作流。结合 ClickHouse 的强大规模与性能，你可以在几分钟内基于海量数据集构建并分享第一个高性能仪表盘。

<Image size="md" img={fabi_01} alt="Fabi.ai 数据探索与工作流平台" border />



## 收集连接信息 {#gather-your-connection-details}

<ConnectionDetails />



## 创建你的 Fabi.ai 账户并连接 ClickHouse {#connect-to-clickhouse}

登录或创建你的 Fabi.ai 账户：https://app.fabi.ai/

1. 在你首次创建账户时，系统会提示你连接数据库；如果你已经拥有账户，请在任意 Smartbook 左侧点击数据源面板，然后选择 Add Data Source。
   
   <Image size="lg" img={fabi_02} alt="添加数据源" border />

2. 随后系统会提示你输入连接信息。

   <Image size="md" img={fabi_03} alt="ClickHouse 凭据表单" border />

3. 恭喜！你已经将 ClickHouse 成功集成到 Fabi.ai 中。



## 查询 ClickHouse。 {#querying-clickhouse}

将 Fabi.ai 连接到 ClickHouse 之后，打开任意一个 [Smartbook](https://docs.fabi.ai/analysis_and_reporting/smartbooks) 并创建一个 SQL 单元格。如果你的 Fabi.ai 实例只连接了一个数据源，SQL 单元格会自动将 ClickHouse 设为默认数据源；否则，你可以在数据源下拉菜单中选择要查询的数据源。

   <Image size="lg" img={fabi_04} alt="Querying ClickHouse" border />



## 更多资源 {#additional-resources}

[Fabi.ai](https://www.fabi.ai) 文档：https://docs.fabi.ai/introduction

[Fabi.ai](https://www.fabi.ai) 入门教学视频：https://www.youtube.com/playlist?list=PLjxPRVnyBCQXxxByw2CLC0q7c-Aw6t2nl
