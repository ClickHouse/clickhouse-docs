---
sidebar_label: 'Omni'
slug: /integrations/omni
keywords: ['clickhouse', 'Omni', '连接', '集成', '用户界面']
description: 'Omni 是一个面向企业的 BI、数据应用和嵌入式分析平台，可帮助您实时探索并分享洞察。'
title: 'Omni'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import omni_01 from '@site/static/images/integrations/data-visualization/omni_01.png';
import omni_02 from '@site/static/images/integrations/data-visualization/omni_02.png';
import PartnerBadge from '@theme/badges/PartnerBadge';

<PartnerBadge />

Omni 可通过官方 ClickHouse 数据源连接到 ClickHouse Cloud 或本地部署的 ClickHouse。

## 1. 收集您的连接信息 \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. 创建 ClickHouse 数据源 \{#2-create-a-clickhouse-data-source\}

前往 Admin -&gt; Connections，然后点击右上角的“Add Connection”按钮。

<Image size="lg" img={omni_01} alt="显示 Connections 部分中 Add Connection 按钮的 Omni 管理界面" border />

<br />

选择 `ClickHouse`，然后在表单中输入您的凭据。

<Image size="lg" img={omni_02} alt="用于 ClickHouse 的 Omni 连接配置界面，显示凭据表单字段" border />

<br />

现在，您就可以在 Omni 中查询并可视化 ClickHouse 中的数据了。