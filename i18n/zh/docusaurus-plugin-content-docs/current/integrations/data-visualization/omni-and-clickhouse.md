---
sidebar_label: 'Omni'
slug: /integrations/omni
keywords: ['clickhouse', 'Omni', 'connect', 'integrate', 'ui']
description: 'Omni 是一个企业级 BI、数据应用和嵌入式分析平台，可帮助你实时探索和分享洞察。'
title: 'Omni'
doc_type: 'guide'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import omni_01 from '@site/static/images/integrations/data-visualization/omni_01.png';
import omni_02 from '@site/static/images/integrations/data-visualization/omni_02.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Omni

<PartnerBadge/>

Omni 可以通过官方 ClickHouse 数据源连接到 ClickHouse Cloud 或本地自建部署的 ClickHouse。



## 1. 收集连接信息 {#1-gather-your-connection-details}

<ConnectionDetails />



## 2. 创建 ClickHouse 数据源 {#2-create-a-clickhouse-data-source}

进入 Admin -> Connections，然后点击右上角的“Add Connection”按钮。

<Image size="lg" img={omni_01} alt="Omni 管理界面在 Connections 部分中显示 Add Connection 按钮" border />
<br/>

选择 `ClickHouse`，并在表单中输入你的认证信息。

<Image size="lg" img={omni_02} alt="Omni 中用于 ClickHouse 的连接配置界面，显示认证信息表单字段" border />
<br/>

现在你就可以在 Omni 中查询和可视化 ClickHouse 中的数据了。
