---
sidebar_label: 'ストリーミングとオブジェクトストレージ'
slug: /cloud/reference/billing/clickpipes/streaming-and-object-storage
title: 'ストリーミングとオブジェクトストレージ向け ClickPipes'
description: 'ストリーミングおよびオブジェクトストレージ向け ClickPipes の課金の概要'
doc_type: 'reference'
keywords: ['課金', 'ClickPipes', 'ストリーミング料金', 'コスト', '料金']
---

import ClickPipesFAQ from '../../../_snippets/_clickpipes_faq.md'


# ストリーミングおよびオブジェクトストレージ向け ClickPipes \\{#clickpipes-for-streaming-object-storage\\}

このセクションでは、ストリーミングおよびオブジェクトストレージ向け ClickPipes の料金モデルについて説明します。



## ClickPipes の料金体系はどのようになっていますか？ \\{#what-does-the-clickpipes-pricing-structure-look-like\\}

2 つの要素で構成されています。

- **コンピュート**: **1 ユニットあたり 1 時間単位**の料金。
  コンピュートは、ClickPipes のレプリカポッドがデータをアクティブに取り込んでいるかどうかにかかわらず、稼働していることに対するコストを表します。
  これはすべての種類の ClickPipes に適用されます。
- **取り込むデータ**: **GB あたり**の料金。
  データ取り込み料金は、レプリカポッド経由で転送されるデータについて、すべてのストリーミング ClickPipes
  (Kafka, Confluent, Amazon MSK, Amazon Kinesis, Redpanda, WarpStream, Azure Event Hubs)
  に適用されます。取り込まれるデータサイズ (GB) は、ソースから受信したバイト数 (非圧縮または圧縮) に基づいて課金されます。



## ClickPipes レプリカとは何ですか？ \\{#what-are-clickpipes-replicas\\}

ClickPipes は、ClickHouse Cloud サービスとは独立して実行およびスケールする専用インフラストラクチャを介して、リモートデータソースからデータを取り込みます。
そのため、専用のコンピュート レプリカを使用します。



## デフォルトのレプリカ数とそのサイズは何ですか？ \\{#what-is-the-default-number-of-replicas-and-their-size\\}

各 ClickPipe はデフォルトでレプリカ 1 の構成となっており、512 MiB の RAM と 0.125 vCPU（XS）が割り当てられています。
これは **0.0625** ClickHouse コンピュートユニット（1 ユニット = 8 GiB RAM、2 vCPU）に相当します。



## ClickPipes の公開料金は？ \\{#what-are-the-clickpipes-public-prices\\}

- Compute: 1ユニットあたり1時間 \$0.20（デフォルトのレプリカサイズの場合、レプリカあたり1時間 \$0.0125）
- 取り込まれたデータ: 1 GB あたり \$0.04

Compute の料金は、ClickPipe 内のレプリカの**数**と**サイズ**によって決まります。デフォルトのレプリカサイズは垂直スケーリングで調整でき、各レプリカサイズの料金は次のとおりです。

| Replica Size               | Compute Units | RAM     | vCPU   | Price per Hour |
|----------------------------|---------------|---------|--------|----------------|
| Extra Small (XS) (default) | 0.0625        | 512 MiB | 0.125. | $0.0125        |
| Small (S)                  | 0.125         | 1 GiB   | 0.25   | $0.025         |
| Medium (M)                 | 0.25          | 2 GiB   | 0.5    | $0.05          |
| Large (L)                  | 0.5           | 4 GiB   | 1.0    | $0.10          |
| Extra Large (XL)           | 1.0           | 8 GiB   | 2.0    | $0.20          |



## 例ではどのようになるでしょうか？ \\{#how-does-it-look-in-an-illustrative-example\\}

特に断りがない限り、以下の例では M サイズのレプリカ 1 個を前提とします。

<table><thead>
  <tr>
    <th></th>
    <th>24 時間あたり 100 GB</th>
    <th>24 時間あたり 1 TB</th>
    <th>24 時間あたり 10 TB</th>
  </tr></thead>
<tbody>
  <tr>
    <td>ストリーミング ClickPipe</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 100) = \$5.20</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 1000) = \$41.20</td>
    <td>レプリカ 4 個の場合: <br></br> (0.25 x 0.20 x 24 x 4) + (0.04 x 10000) = \$404.80</td>
  </tr>
  <tr>
    <td>オブジェクトストレージ ClickPipe $^*$</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
  </tr>
</tbody>
</table>

$^1$ _オーケストレーション用のコンピュートとして課金されるのは ClickPipes のみであり、実際のデータ転送は基盤となる ClickHouse Service によって行われるものと想定しています_



## ストリーミングおよびオブジェクトストレージ用 ClickPipes に関する FAQ \\{#faq-streaming-and-object-storage\\}

<ClickPipesFAQ/>