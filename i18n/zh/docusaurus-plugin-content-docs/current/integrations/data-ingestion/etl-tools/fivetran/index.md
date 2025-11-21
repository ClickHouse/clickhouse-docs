---
sidebar_label: 'Fivetran'
slug: /integrations/fivetran
sidebar_position: 2
description: '用户可以在 ClickHouse 中使用 dbt 对数据进行转换和建模'
title: 'Fivetran 与 ClickHouse Cloud'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
keywords: ['fivetran', 'data movement', 'etl', 'clickhouse destination', 'automated data platform']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Fivetran 与 ClickHouse Cloud

<ClickHouseSupportedBadge/>



## 概述 {#overview}

[Fivetran](https://www.fivetran.com) 是一个自动化数据移动平台,可在云数据平台之间移入、移出和传输数据。

[ClickHouse Cloud](https://clickhouse.com/cloud) 支持作为 [Fivetran 目标](https://fivetran.com/docs/destinations/clickhouse)使用,允许用户将来自各种数据源的数据加载到 ClickHouse 中。

:::note
[ClickHouse Cloud 目标](https://fivetran.com/docs/destinations/clickhouse)目前处于私有预览阶段,如遇任何问题请联系 ClickHouse 支持团队。
:::

<div class='vimeo-container'>
  <iframe
    src='//www.youtube.com/embed/sWe5JHW3lAs'
    width='640'
    height='360'
    frameborder='0'
    allow='autoplay;
    fullscreen;
    picture-in-picture'
    allowfullscreen
  ></iframe>
</div>


## ClickHouse Cloud 目标 {#clickhouse-cloud-destination}

请参阅 Fivetran 网站上的官方文档:

- [ClickHouse 目标概述](https://fivetran.com/docs/destinations/clickhouse)
- [ClickHouse 目标设置指南](https://fivetran.com/docs/destinations/clickhouse/setup-guide)


## 联系我们 {#contact-us}

如果您有任何问题或功能需求，请创建[支持工单](/about-us/support)。
