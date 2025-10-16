---
'sidebar_label': 'ストリーミングおよびオブジェクトストレージ'
'slug': '/cloud/reference/billing/clickpipes/streaming-and-object-storage'
'title': 'ストリーミングおよびオブジェクトストレージのための ClickPipes'
'description': 'ストリーミングおよびオブジェクトストレージに関する ClickPipesの請求概説'
'doc_type': 'reference'
---

import ClickPipesFAQ from '../../../_snippets/_clickpipes_faq.md'


# ClickPipes for streaming and object storage {#clickpipes-for-streaming-object-storage}

このセクションでは、ストリーミングおよびオブジェクトストレージのためのClickPipesの価格モデルについて説明します。

## ClickPipesの価格構造はどのようになっていますか？ {#what-does-the-clickpipes-pricing-structure-look-like}

それは二つの次元から構成されています：

- **コンピュート**: 1時間あたりの価格 **（単位あたり）**。
  コンピュートは、ClickPipesのレプリカポッドを実行するためのコストを表し、データを積極的に取り込んでいるかどうかにかかわらずかかります。
  これはすべてのClickPipesタイプに適用されます。
- **取り込まれたデータ**: 1GBあたりの価格 **（単位あたり）**。
  取り込まれるデータ料金は、すべてのストリーミングClickPipes
  (Kafka, Confluent, Amazon MSK, Amazon Kinesis, Redpanda, WarpStream, Azure Event Hubs)
  に適用され、レプリカポッドを介して転送されたデータに基づきます。取り込まれたデータサイズ（GB）は、ソースから受信したバイトに基づいて課金されます（圧縮または非圧縮にかかわらず）。

## ClickPipesのレプリカとは何ですか？ {#what-are-clickpipes-replicas}

ClickPipesは、専用のインフラストラクチャを介してリモートデータソースからデータを取り込みます。
このインフラストラクチャは、ClickHouse Cloudサービスとは独立して実行およびスケールします。
このため、専用のコンピュートレプリカを使用します。

## デフォルトのレプリカ数とそのサイズは何ですか？ {#what-is-the-default-number-of-replicas-and-their-size}

各ClickPipeは、512 MiBのRAMと0.125 vCPU（XS）を提供されるデフォルトで1つのレプリカを持ちます。
これは **0.0625** ClickHouseコンピュートユニットに相当します（1ユニット = 8 GiB RAM, 2 vCPUs）。

## ClickPipesの公表価格は何ですか？ {#what-are-the-clickpipes-public-prices}

- コンピュート: \$0.20（1時間あたりの単位あたり価格）（デフォルトのレプリカサイズの1レプリカあたり1時間あたり\$0.0125）
- 取り込まれたデータ: \$0.04（1GBあたりの価格）

コンピュート次元の価格は、ClickPipe内のレプリカの **数** および **サイズ** に依存します。デフォルトのレプリカサイズは垂直スケーリングを用いて調整でき、各レプリカサイズの価格は以下の通りです：

| レプリカサイズ               | コンピュートユニット | RAM     | vCPU   | 料金（1時間あたり） |
|----------------------------|---------------|---------|--------|----------------|
| エクストラスモール (XS) (デフォルト) | 0.0625        | 512 MiB | 0.125  | \$0.0125      |
| スモール (S)                  | 0.125         | 1 GiB   | 0.25   | \$0.025       |
| ミディアム (M)                 | 0.25          | 2 GiB   | 0.5    | \$0.05        |
| ラージ (L)                  | 0.5           | 4 GiB   | 1.0    | \$0.10        |
| エクストララージ (XL)           | 1.0           | 8 GiB   | 2.0    | \$0.20        |

## イラスト例ではどのようになりますか？ {#how-does-it-look-in-an-illustrative-example}

以下の例は、明示的に言及されない限り、単一のMサイズのレプリカを前提としています。

<table><thead>
  <tr>
    <th></th>
    <th>24時間あたり100GB</th>
    <th>24時間あたり1TB</th>
    <th>24時間あたり10TB</th>
  </tr></thead>
<tbody>
  <tr>
    <td>ストリーミング ClickPipe</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 100) = \$5.20</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 1000) = \$41.20</td>
    <td>4レプリカの場合: <br></br> (0.25 x 0.20 x 24 x 4) + (0.04 x 10000) = \$404.80</td>
  </tr>
  <tr>
    <td>オブジェクトストレージ ClickPipe $^*$</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
  </tr>
</tbody>
</table>

$^1$ _オーケストレーションのためのClickPipesのコンピュートのみ、
効果的なデータ転送は、基盤となるClickhouseサービスによって仮定されます_

## ストリーミングおよびオブジェクトストレージ ClickPipesのFAQ {#faq-streaming-and-object-storage}

<ClickPipesFAQ/>
