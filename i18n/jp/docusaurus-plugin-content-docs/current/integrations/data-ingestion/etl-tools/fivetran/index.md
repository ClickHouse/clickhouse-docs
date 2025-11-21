---
sidebar_label: 'Fivetran'
slug: /integrations/fivetran
sidebar_position: 2
description: 'ユーザーは ClickHouse 上で dbt を使用してデータの変換とモデリングを行うことができます'
title: 'Fivetran と ClickHouse Cloud'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
keywords: ['fivetran', 'data movement', 'etl', 'clickhouse destination', 'automated data platform']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Fivetran と ClickHouse Cloud

<ClickHouseSupportedBadge/>



## 概要 {#overview}

[Fivetran](https://www.fivetran.com)は、クラウドデータプラットフォーム間でのデータ移動を自動化するプラットフォームです。

[ClickHouse Cloud](https://clickhouse.com/cloud)は[Fivetranの接続先](https://fivetran.com/docs/destinations/clickhouse)としてサポートされており、さまざまなソースからClickHouseへデータをロードすることができます。

:::note
[ClickHouse Cloudの接続先](https://fivetran.com/docs/destinations/clickhouse)は現在プライベートプレビュー中です。問題が発生した場合は、ClickHouseサポートまでお問い合わせください。
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


## ClickHouse Cloud 宛先 {#clickhouse-cloud-destination}

Fivetran ウェブサイトの公式ドキュメントを参照してください:

- [ClickHouse 宛先の概要](https://fivetran.com/docs/destinations/clickhouse)
- [ClickHouse 宛先のセットアップガイド](https://fivetran.com/docs/destinations/clickhouse/setup-guide)


## お問い合わせ {#contact-us}

ご質問や機能リクエストがございましたら、[サポートチケット](/about-us/support)を作成してください。
