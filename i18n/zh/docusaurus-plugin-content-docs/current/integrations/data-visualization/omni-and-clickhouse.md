---
sidebar_label: Omni
slug: /integrations/omni
keywords: ['clickhouse', 'Omni', 'connect', 'integrate', 'ui']
description: 'Omni 是一个企业平台，专注于 BI、数据应用和嵌入式分析，帮助您实时探索和分享洞察。'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import omni_01 from '@site/static/images/integrations/data-visualization/omni_01.png';
import omni_02 from '@site/static/images/integrations/data-visualization/omni_02.png';


# Omni

Omni 可以通过官方 ClickHouse 数据源连接到 ClickHouse Cloud 或本地部署。

## 1. 收集您的连接详情 {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. 创建 ClickHouse 数据源 {#2-create-a-clickhouse-data-source}

导航到 Admin -> Connections，然后点击右上角的 "Add Connection" 按钮。

<img src={omni_01} class="image" alt="添加新连接" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

选择 `ClickHouse`。在表单中输入您的凭据。

<img src={omni_02} class="image" alt="指定您的凭据" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

现在您应该能够在 Omni 中查询和可视化来自 ClickHouse 的数据。
