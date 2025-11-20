---
sidebar_label: 'ストリーミングとオブジェクトストレージ'
slug: /cloud/reference/billing/clickpipes/streaming-and-object-storage
title: 'ストリーミングおよびオブジェクトストレージ向け ClickPipes'
description: 'ストリーミングおよびオブジェクトストレージ向け ClickPipes の課金概要'
doc_type: 'reference'
keywords: ['billing', 'clickpipes', 'streaming pricing', 'costs', 'pricing']
---

import ClickPipesFAQ from '../../../_snippets/_clickpipes_faq.md'


# ストリーミングおよびオブジェクトストレージ向けClickPipes {#clickpipes-for-streaming-object-storage}

このセクションでは、ストリーミングおよびオブジェクトストレージ向けClickPipesの料金モデルについて概説します。


## ClickPipesの料金体系はどのようになっていますか？ {#what-does-the-clickpipes-pricing-structure-look-like}

料金体系は2つの要素で構成されています：

- **コンピュート**: **ユニットあたり時間単位**の料金。
  コンピュートは、データを積極的に取り込んでいるかどうかに関わらず、ClickPipesレプリカポッドの実行コストを表します。
  すべてのClickPipesタイプに適用されます。
- **取り込みデータ**: **GB単位**の料金。
  取り込みデータ料金は、レプリカポッド経由で転送されるデータに対して、すべてのストリーミングClickPipes
  (Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、Azure Event Hubs)
  に適用されます。取り込みデータサイズ(GB)は、ソースから受信したバイト数(非圧縮または圧縮)に基づいて課金されます。


## ClickPipesレプリカとは？ {#what-are-clickpipes-replicas}

ClickPipesは、ClickHouse Cloudサービスとは独立して動作・スケールする専用インフラストラクチャを通じて、リモートデータソースからデータを取り込みます。
そのため、専用のコンピュートレプリカを使用します。


## デフォルトのレプリカ数とそのサイズは？ {#what-is-the-default-number-of-replicas-and-their-size}

各ClickPipeはデフォルトで1つのレプリカを使用し、512 MiBのRAMと0.125 vCPU（XS）が割り当てられます。
これは**0.0625** ClickHouseコンピュートユニット（1ユニット = 8 GiB RAM、2 vCPU）に相当します。


## ClickPipesの公開価格について {#what-are-the-clickpipes-public-prices}

- コンピュート: 1ユニットあたり1時間$0.20（デフォルトのレプリカサイズの場合、レプリカあたり1時間$0.0125）
- 取り込みデータ: 1GBあたり$0.04

コンピュートの価格は、ClickPipe内のレプリカの**数**と**サイズ**によって決まります。デフォルトのレプリカサイズは垂直スケーリングで調整可能で、各レプリカサイズの価格は以下の通りです:

| レプリカサイズ               | コンピュートユニット | RAM     | vCPU   | 1時間あたりの価格 |
| -------------------------- | ------------- | ------- | ------ | -------------- |
| Extra Small (XS)（デフォルト） | 0.0625        | 512 MiB | 0.125. | $0.0125        |
| Small (S)                  | 0.125         | 1 GiB   | 0.25   | $0.025         |
| Medium (M)                 | 0.25          | 2 GiB   | 0.5    | $0.05          |
| Large (L)                  | 0.5           | 4 GiB   | 1.0    | $0.10          |
| Extra Large (XL)           | 1.0           | 8 GiB   | 2.0    | $0.20          |


## 具体例で見るとどうなるか？ {#how-does-it-look-in-an-illustrative-example}

以下の例では、特に明記されていない限り、単一のMサイズレプリカを想定しています。

<table>
  <thead>
    <tr>
      <th></th>
      <th>24時間で100 GB</th>
      <th>24時間で1 TB</th>
      <th>24時間で10 TB</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ストリーミングClickPipe</td>
      <td>(0.25 x 0.20 x 24) + (0.04 x 100) = \$5.20</td>
      <td>(0.25 x 0.20 x 24) + (0.04 x 1000) = \$41.20</td>
      <td>
        4レプリカの場合: <br></br> (0.25 x 0.20 x 24 x 4) + (0.04 x 10000) =
        \$404.80
      </td>
    </tr>
    <tr>
      <td>オブジェクトストレージClickPipe $^*$</td>
      <td>(0.25 x 0.20 x 24) = \$1.20</td>
      <td>(0.25 x 0.20 x 24) = \$1.20</td>
      <td>(0.25 x 0.20 x 24) = \$1.20</td>
    </tr>
  </tbody>
</table>

$^1$ _オーケストレーション用のClickPipesコンピュートのみ、
実際のデータ転送は基盤となるClickHouseサービスによって処理されることを想定_


## ストリーミングおよびオブジェクトストレージ ClickPipes の FAQ {#faq-streaming-and-object-storage}

<ClickPipesFAQ />
