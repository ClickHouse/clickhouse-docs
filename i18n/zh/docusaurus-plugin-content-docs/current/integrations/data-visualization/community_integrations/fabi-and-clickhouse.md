---
sidebar_label: 'Fabi.ai'
slug: /integrations/fabi.ai
keywords: ['clickhouse', 'Fabi.ai', 'connect', 'integrate', 'notebook', 'ui', 'analytics']
description: 'Fabi.ai 是一体化的协作式数据分析平台。你可以借助 SQL、Python、AI 和零代码，以前所未有的速度构建仪表板和数据工作流'
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

<a href="https://www.fabi.ai/" target="_blank">Fabi.ai</a> 是一体化协同数据分析平台。你可以利用 SQL、Python、AI 和零代码工具，以前所未有的速度构建仪表板和数据工作流。结合 ClickHouse 的强大扩展性与性能，你可以在数分钟内基于海量数据集构建并共享你的首个高性能仪表板。

<Image size="md" img={fabi_01} alt="Fabi.ai 数据探索与工作流平台" border />



## 收集连接详细信息 {#gather-your-connection-details}

<ConnectionDetails />


## 创建 Fabi.ai 账户并连接 ClickHouse {#connect-to-clickhouse}

登录或创建您的 Fabi.ai 账户:https://app.fabi.ai/

1. 首次创建账户时,系统会提示您连接数据库;如果您已有账户,请点击任意 Smartbook 左侧的数据源面板,然后选择"添加数据源"。

   <Image size='lg' img={fabi_02} alt='添加数据源' border />

2. 随后系统会提示您输入连接详细信息。

   <Image size='md' img={fabi_03} alt='ClickHouse 凭据表单' border />

3. 恭喜!您现在已将 ClickHouse 集成到 Fabi.ai 中。


## 查询 ClickHouse {#querying-clickhouse}

将 Fabi.ai 连接到 ClickHouse 后,进入任意 [Smartbook](https://docs.fabi.ai/analysis_and_reporting/smartbooks) 并创建一个 SQL 单元格。如果您的 Fabi.ai 实例仅连接了一个数据源,SQL 单元格将自动默认为 ClickHouse;否则,您可以从数据源下拉菜单中选择要查询的数据源。

<Image size='lg' img={fabi_04} alt='查询 ClickHouse' border />


## 其他资源 {#additional-resources}

[Fabi.ai](https://www.fabi.ai) 文档：https://docs.fabi.ai/introduction

[Fabi.ai](https://www.fabi.ai) 入门教程视频：https://www.youtube.com/playlist?list=PLjxPRVnyBCQXxxByw2CLC0q7c-Aw6t2nl
