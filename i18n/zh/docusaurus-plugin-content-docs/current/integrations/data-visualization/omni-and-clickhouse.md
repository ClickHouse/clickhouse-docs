---
sidebar_label: 'Omni'
slug: /integrations/omni
keywords: ['clickhouse', 'Omni', 'connect', 'integrate', 'ui']
description: 'Omni 是一款企业级 BI、数据应用和内嵌分析平台，帮助你实时探索并共享洞察。'
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

Omni 可以通过官方 ClickHouse 数据源连接到 ClickHouse Cloud 或自托管部署。



## 1. 收集连接信息 {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. 创建 ClickHouse 数据源 {#2-create-a-clickhouse-data-source}

导航至 Admin -> Connections,然后点击右上角的"Add Connection"按钮。

<Image
  size='lg'
  img={omni_01}
  alt='Omni 管理界面,显示 Connections 部分中的 Add Connection 按钮'
  border
/>
<br />

选择 `ClickHouse`。在表单中输入您的凭据信息。

<Image
  size='lg'
  img={omni_02}
  alt='Omni 的 ClickHouse 连接配置界面,显示凭据表单字段'
  border
/>
<br />

现在您可以在 Omni 中查询和可视化 ClickHouse 的数据了。
