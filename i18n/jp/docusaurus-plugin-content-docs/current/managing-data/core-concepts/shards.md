---
slug: /shards
title: テーブルのシャードとレプリカ
description: ClickHouseにおけるテーブルのシャードとレプリカとは？
keywords: [shard, shards, sharding, replica, replicas]
---

import image_01 from '@site/static/images/managing-data/core-concepts/shards_01.png'
import image_02 from '@site/static/images/managing-data/core-concepts/shards_02.png'
import image_03 from '@site/static/images/managing-data/core-concepts/shards_03.png'
import image_04 from '@site/static/images/managing-data/core-concepts/shards_04.png'
import image_05 from '@site/static/images/managing-data/core-concepts/shards_replicas_01.png'

## ClickHouseにおけるテーブルのシャードとは？ {#what-are-table-shards-in-clickhouse}
<br/>

:::note
このトピックはClickHouse Cloudには適用されません。ここでは、[Parallel Replicas](/docs/deployment-guides/parallel-replicas)が従来の共有無しClickHouseクラスタにおける複数のシャードと同じ目的を果たします。
:::

従来の[共有無し](https://en.wikipedia.org/wiki/Shared-nothing_architecture) ClickHouseクラスタでは、シャーディングは①データが単一サーバーでは大きすぎる場合、または②単一サーバーのデータ処理が遅すぎる場合に使用されます。次の図は、[uk_price_paid_simple](/parts)テーブルが単一のマシンの容量を超えるケース①を示しています：

<img src={image_01} alt='SHARDS' class='image' />
<br/>

このような場合、データはテーブルのシャードとして複数のClickHouseサーバーに分割できます：

<img src={image_02} alt='SHARDS' class='image' />
<br/>

各シャードはデータのサブセットを保持し、独立してクエリ可能な通常のClickHouseテーブルとして機能します。ただし、クエリはそのサブセットのみを処理し、データの分布に応じて有効なユースケースになる場合があります。通常、[分散テーブル](/docs/engines/table-engines/special/distributed)（サーバーごとにしばしば）により、フルデータセットの統一されたビューが提供されます。これはデータを自体で保存せず、すべてのシャードに**SELECT**クエリを転送し、結果を集約して**INSERT**をルーティングし、データを均等に分配します。

## 分散テーブルの作成 {#distributed-table-creation}

**SELECT**クエリの転送と**INSERT**のルーティングを説明するために、2つのClickHouseサーバー間で分割された[What are table parts](/parts)の例のテーブルを考えます。まず、この設定のために対応する**分散テーブル**を作成するDDLステートメントを示します：

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

`ON CLUSTER`句はDDLステートメントを[分散DDLステートメント](/docs/sql-reference/distributed-ddl)にし、ClickHouseに`test_cluster` [クラスタ定義](/docs/architecture/horizontal-scaling#replication-and-sharding-configuration)に列挙されたすべてのサーバーでテーブルを作成するよう指示します。分散DDLには[Keeper](https://clickhouse.com/clickhouse/keeper)コンポーネントが[クラスタアーキテクチャ](/docs/architecture/horizontal-scaling#architecture-diagram)で必要です。

[分散エンジンのパラメータ](/docs/engines/table-engines/special/distributed#distributed-parameters)では、クラスタ名（`test_cluster`）、シャードされた対象テーブルのデータベース名（`uk`）、シャードされた対象テーブルの名前（`uk_price_paid_simple`）、INSERTルーティングのための**シャーディングキー**を指定します。この例では、[rand](/sql-reference/functions/random-functions#rand)関数を使用して行をシャードにランダムに割り当てています。ただし、ユースケースに応じて、任意の式（複雑な場合でも）がシャーディングキーとして使用できます。次のセクションではINSERTルーティングの動作を説明します。

## INSERTルーティング {#insert-routing}

以下の図は、ClickHouseにおける分散テーブルへのINSERTの処理方法を示しています：

<img src={image_03} alt='SHARDS' class='image' />
<br/>

①分散テーブルを対象とするINSERT（単一の行を含む）が、このテーブルをホストするClickHouseサーバーに、直接、または負荷分散装置を介して送信されます。

②INSERTからの各行（ここでは1つ）について、ClickHouseはシャーディングキー（ここではrand()）を評価し、その結果をシャードサーバーの数で割った余りを計算し、これをターゲットサーバーIDとして使用します（IDは0から始まり、1ずつ増加します）。その後、行は転送され、③対応するサーバーのテーブルシャードに挿入されます。

次のセクションでは、SELECT転送の動作を説明します。

## SELECT転送 {#select-forwarding}

この図は、ClickHouseの分散テーブルを使用したSELECTクエリの処理方法を示しています：

<img src={image_04} alt='SHARDS' class='image' />
<br/>

①分散テーブルを対象とするSELECT集計クエリが、直接、または負荷分散装置を介して対応するClickHouseサーバーに送信されます。

②分散テーブルは、対象テーブルのシャードをホストしているすべてのサーバーにクエリを転送し、各ClickHouseサーバーがそのローカル集計結果を**並行して**計算します。

次に、最初にターゲットされた分散テーブルをホストするClickHouseサーバーが、③すべてのローカル結果を収集し、④それらを最終的なグローバル結果にマージし、⑤クエリ送信者に返します。

## ClickHouseにおけるテーブルのレプリカとは？ {#what-are-table-replicas-in-clickhouse}

ClickHouseにおけるレプリケーションは、**データの整合性**と**フェイルオーバー**を保証するために、複数のサーバーにわたって**シャードデータのコピー**を維持します。ハードウェア障害は避けられないため、レプリケーションは各シャードが複数のレプリカを持つことでデータ損失を防ぎます。書き込みは、直接または[分散テーブル](#distributed-table-creation)を介して任意のレプリカに向けることができ、そこで操作のためのレプリカを選択します。変更は他のレプリカに自動的に伝播され、障害やメンテナンスが発生した場合でも、他のレプリカでデータは利用可能であり、障害が発生したホストが回復すると、自動的に同期して最新の状態を保ちます。

レプリケーションには、[Keeper](https://clickhouse.com/clickhouse/keeper)コンポーネントが[クラスタアーキテクチャ](/docs/architecture/horizontal-scaling#architecture-diagram)で必要です。

以下の図は、6つのサーバーを持つClickHouseクラスタを示しています。前述の`Shard-1`と`Shard-2`の2つのテーブルシャードにはそれぞれ3つのレプリカがあります。このクラスタにクエリが送信されます：

<img src={image_05} alt='SHARDS' class='image' />
<br/>

クエリ処理はレプリカ無しの設定と同様に機能し、各シャードの単一のレプリカのみがクエリを実行します。

> レプリカはデータの整合性とフェイルオーバーを保証するだけでなく、異なるレプリカ間で複数のクエリを並行して実行できるため、クエリ処理のスループットを向上させます。

①分散テーブルを対象とするクエリが、直接または負荷分散装置を介して対応するClickHouseサーバーに送信されます。

②分散テーブルは、各シャードから1つのレプリカにクエリを転送し、選択されたレプリカをホストする各ClickHouseサーバーがそのローカルクエリ結果を並行して計算します。

残りは、レプリカ無しの設定での[同様](#select-forwarding)な動作をし、上記の図には示されていません。最初にターゲットされた分散テーブルをホストするClickHouseサーバーが、すべてのローカル結果を収集し、それらを最終的なグローバル結果にマージし、クエリ送信者に返します。

ClickHouseは②のクエリ転送戦略を設定可能であることに注意してください。デフォルトでは、上記の図とは異なり、分散テーブルは—利用可能な場合は—ローカルレプリカを[優先](/docs/operations/settings/settings#prefer_localhost_replica)しますが、他の負荷分散[戦略](/docs/operations/settings/settings#load_balancing)も使用可能です。

## さらなる情報を見つけるには {#where-to-find-more-information}

テーブルのシャードとレプリカに関するこの高レベルの紹介以外の詳細については、[デプロイメントおよびスケーリングガイド](/docs/architecture/horizontal-scaling)をご覧ください。

ClickHouseのシャードとレプリカについてより深く掘り下げるには、このチュートリアルビデオも強くお勧めします：

<iframe width="768" height="432" src="https://www.youtube.com/embed/vBjCJtw_Ei0?si=WqopTrnti6usCMRs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
