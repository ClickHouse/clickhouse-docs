---
sidebar_label: 'Fivetran'
slug: /integrations/fivetran
sidebar_position: 2
description: '用户可以使用 dbt 在 ClickHouse 中对其数据进行转换和建模'
title: 'Fivetran 与 ClickHouse Cloud'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
keywords: ['fivetran', '数据迁移', 'etl', 'ClickHouse 目标端', '自动化数据平台']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Fivetran 与 ClickHouse Cloud

<ClickHouseSupportedBadge/>



## 概览 {#overview}

[Fivetran](https://www.fivetran.com) 是一款自动化数据迁移平台，可用于在云数据平台之间，以及从云数据平台中导出或导入数据。

[ClickHouse Cloud](https://clickhouse.com/cloud) 目前已作为 [Fivetran 目标端](https://fivetran.com/docs/destinations/clickhouse) 之一受到支持，允许用户将来自各种数据源的数据加载到 ClickHouse 中。

:::note
[ClickHouse Cloud 目标端](https://fivetran.com/docs/destinations/clickhouse) 当前处于私有预览阶段，如遇任何问题，请联系 ClickHouse 支持团队。
:::

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/sWe5JHW3lAs"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>



## ClickHouse Cloud 目标 {#clickhouse-cloud-destination}

请参阅 Fivetran 官网上的官方文档：

- [ClickHouse 目标概览](https://fivetran.com/docs/destinations/clickhouse)
- [ClickHouse 目标设置指南](https://fivetran.com/docs/destinations/clickhouse/setup-guide)



## 联系我们 {#contact-us}

如果您有任何问题，或希望提出新功能需求，请提交[支持工单](/about-us/support)。
