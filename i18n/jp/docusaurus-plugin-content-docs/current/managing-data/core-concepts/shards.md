---
slug: /shards
title: テーブルシャード
description: ClickHouseにおけるテーブルシャードとは
keywords: [シャード, シャード, シャーディング]
---

import image_01 from '@site/static/images/managing-data/core-concepts/shards_01.png'
import image_02 from '@site/static/images/managing-data/core-concepts/shards_02.png'
import image_03 from '@site/static/images/managing-data/core-concepts/shards_03.png'
import image_04 from '@site/static/images/managing-data/core-concepts/shards_04.png'

## ClickHouseにおけるテーブルシャードとは？ {#what-are-table-shards-in-clickhouse}

> このトピックはClickHouse Cloudには適用されません。[Parallel Replicas](/docs/deployment-guides/parallel-replicas)が同じ目的を果たします。

<br/>

ClickHouse OSSでは、シャーディングは①データが単一のサーバーに対して大きすぎる場合、または②単一のサーバーが処理に対して遅すぎる場合に使用されます。次の図は、[uk_price_paid_simple](/parts)テーブルが単一のマシンの容量を超える①のケースを示しています：

<img src={image_01} alt='SHARDS' class='image' />
<br/>

この場合、データは複数のClickHouseサーバーにテーブルシャードの形で分割できます：

<img src={image_02} alt='SHARDS' class='image' />
<br/>

各シャードはデータのサブセットを保持し、独立してクエリできる通常のClickHouseテーブルのように機能します。ただし、クエリはそのサブセットのみを処理し、データの分布によってはそれが有効である場合があります。通常、[分散テーブル](/docs/engines/table-engines/special/distributed)（通常はサーバーごとに）全データセットの統一ビューを提供します。自体はデータを保存せず、**SELECT**クエリをすべてのシャードに転送し、結果を集約し、**INSERTS**を均等にデータを分配するためにルーティングします。

## 分散テーブルの作成 {#distributed-table-creation}

**SELECT**クエリの転送と**INSERT**ルーティングを示すために、[What are table parts](/parts)の例において、二つのClickHouseサーバーにまたがる二つのシャードに分割されたテーブルを考えます。まず、このセットアップに対応する**分散テーブル**を作成するためのDDLステートメントを示します：

```sql
CREATE TABLE uk.uk_price_paid_simple_dist ON CLUSTER test_cluster
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = Distributed('test_cluster', 'uk', 'uk_price_paid_simple', rand())
```

`ON CLUSTER`句は、DDLステートメントを[分散DDLステートメント](/docs/sql-reference/distributed-ddl)にし、ClickHouseに`test_cluster`のリストにあるすべてのサーバーにテーブルを作成するよう指示します。分散DDLには、[クラスターアーキテクチャ](/docs/architecture/horizontal-scaling#architecture-diagram)に追加の[Keeper](https://clickhouse.com/clickhouse/keeper)コンポーネントが必要です。

[分散エンジンパラメータ](/docs/engines/table-engines/special/distributed#distributed-parameters)について、クラスター名（`test_cluster`）、シャードターゲットテーブルのデータベース名（`uk`）、シャードターゲットテーブルの名前（`uk_price_paid_simple`）、およびINSERTルーティングのための**シャーディングキー**を指定します。この例では、[rand]((/sql-reference/functions/random-functions#rand))関数を使用して行をシャードにランダムに割り当てます。ただし、使用ケースに応じて、任意の式—複雑なものでも—をシャーディングキーとして使用できます。次のセクションでは、INSERTルーティングがどのように機能するかを説明します。

## INSERTルーティング {#insert-routing}

次の図は、分散テーブルへのINSERTがClickHouseでどのように処理されるかを示しています：

<img src={image_03} alt='SHARDS' class='image' />
<br/>

① 分散テーブルを対象としたINSERT（単一行）が、直接的にまたはロードバランサー経由で、テーブルをホストするClickHouseサーバーに送信されます。

② INSERTからの各行に対して（例では1つだけ）、ClickHouseはシャーディングキー（ここではrand()）を評価し、その結果をシャードサーバー数で割った余りを取り、これをターゲットサーバーIDとして使用します（IDは0から始まり、1ずつ増加します）。行はその後転送され、③ 対応するサーバーのテーブルシャードに挿入されます。

次のセクションでは、SELECT転送がどのように機能するかを説明します。

## SELECT転送 {#select-forwarding}

この図は、ClickHouseで分散テーブルを使用してSELECTクエリがどのように処理されるかを示しています：

<img src={image_04} alt='SHARDS' class='image' />
<br/>

① 分散テーブルを対象としたSELECT集約クエリが、直接的にまたはロードバランサー経由で、対応するClickHouseサーバーに送信されます。

② 分散テーブルは、ターゲットテーブルのシャードをホストするすべてのサーバーにクエリを転送し、各ClickHouseサーバーが**並列**にローカル集約結果を計算します。

その後、当初ターゲットとされた分散テーブルをホストするClickHouseサーバーは、③ すべてのローカル結果を収集し、④ 最終的なグローバル結果にマージし、⑤ クエリ送信者に返します。

## さらなる情報を得るにはどこを参考にすればよいか {#where-to-find-more-information}

テーブルシャードに関するこの高レベルの紹介を超えた詳細については、[デプロイメントとスケーリングガイド](/docs/architecture/horizontal-scaling)をご覧ください。

また、ClickHouseのシャードについての深掘りを行うためのこのチュートリアルビデオを強くお勧めします：

<iframe width="768" height="432" src="https://www.youtube.com/embed/vBjCJtw_Ei0?si=WqopTrnti6usCMRs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
