---
slug: /shards
title: テーブルシャード
description: ClickHouseにおけるテーブルシャードとは
keywords: [shard, shards, sharding]
---

import image_01 from '@site/static/images/managing-data/core-concepts/shards_01.png'
import image_02 from '@site/static/images/managing-data/core-concepts/shards_02.png'
import image_03 from '@site/static/images/managing-data/core-concepts/shards_03.png'
import image_04 from '@site/static/images/managing-data/core-concepts/shards_04.png'

## ClickHouseにおけるテーブルシャードとは？ {#what-are-table-shards-in-clickhouse}

> このトピックは、同じ目的を果たす [Parallel Replicas](/docs/deployment-guides/parallel-replicas) がある ClickHouse Cloud には適用されません。

<br/>

ClickHouse OSS では、シャーディングは ① データが単一サーバーでは大きすぎる場合、または ② 単一サーバーの処理が遅すぎる場合に使用されます。次の図は、[uk_price_paid_simple](/parts) テーブルが単一のマシンのキャパシティを超えているケース ① を示しています：

<img src={image_01} alt='SHARDS' class='image' />
<br/>

この場合、データはテーブルシャードの形で複数の ClickHouse サーバーに分割することができます：

<img src={image_02} alt='SHARDS' class='image' />
<br/>

各シャードはデータのサブセットを保持し、独立してクエリを実行できる通常の ClickHouse テーブルとして機能します。ただし、クエリはそのサブセットのみを処理します。これはデータの分配に応じて有効かもしれません。一般的には、[distributed table](/docs/engines/table-engines/special/distributed)（通常はサーバーごとに）によって、完全なデータセットの統一ビューが提供されます。このテーブルはデータを直接保存するのではなく、すべてのシャードに **SELECT** クエリを転送し、結果を集約し、データを均等に分配するために **INSERTS** をルーティングします。

## 分散テーブルの作成 {#distributed-table-creation}

**SELECT** クエリの転送と **INSERT** ルーティングを示すために、2つの ClickHouse サーバーに分割された [What are table parts](/parts) の例テーブルを考えます。まず、この設定のための対応する **Distributed table** を作成するための DDL ステートメントを示します：

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

`ON CLUSTER` 句は DDL ステートメントを [distributed DDL statement](/docs/sql-reference/distributed-ddl) にし、ClickHouse に `test_cluster` [クラスター定義](/docs/architecture/horizontal-scaling#replication-and-sharding-configuration) にリストされたすべてのサーバー上にテーブルを作成するよう指示します。分散 DDL には、[cluster architecture](/docs/architecture/horizontal-scaling#architecture-diagram) における追加の [Keeper](https://clickhouse.com/clickhouse/keeper) コンポーネントが必要です。

[distributed engine parameters](/docs/engines/table-engines/special/distributed#distributed-parameters) では、シャーディング対象テーブルのためのクラスター名（`test_cluster`）、データベース名（`uk`）、シャーディング対象テーブルの名前（`uk_price_paid_simple`）、および **sharding key** を指定します。この例では、行をシャードにランダムに割り当てるために [rand]((/docs/sql-reference/functions/random-functions#rand)) 関数を使用します。ただし、使用ケースに応じて、任意の式—even complex ones—をシャーディングキーとして使用できます。次のセクションでは、INSERT ルーティングがどのように機能するかを示します。

## INSERT ルーティング {#insert-routing}

以下の図は、分散テーブルへの INSERT が ClickHouse でどのように処理されるかを示しています：

<img src={image_03} alt='SHARDS' class='image' />
<br/>

① 分散テーブルを対象とした INSERT （単一行）が、直接またはロードバランサーを介して、テーブルをホストしている ClickHouse サーバーに送信されます。

② INSERT の各行（例では1行）のために、ClickHouse はシャーディングキー（ここでは rand()）を評価し、結果をシャードサーバーの数で割った余りを取得し、それをターゲットサーバー ID として使用します（ID は 0 から始まり 1 ずつ増加します）。その後、行は転送され、③ 対応するサーバーのテーブルシャードに挿入されます。

次のセクションでは、SELECT 転送がどのように機能するかを説明します。

## SELECT 転送 {#select-forwarding}

この図は、ClickHouse における分散テーブルでの SELECT クエリの処理方法を示しています：

<img src={image_04} alt='SHARDS' class='image' />
<br/>

① 分散テーブルを対象とした SELECT 集計クエリが、直接またはロードバランサーを介して、対応する ClickHouse サーバーに送信されます。

② 分散テーブルは、ターゲットテーブルのシャードをホストしているすべてのサーバーにクエリを転送し、各 ClickHouse サーバーは **並列** にローカル集計結果を計算します。

その後、最初に対象となった分散テーブルをホストしている ClickHouse サーバーは ③ すべてのローカル結果を集め、④ 最終的なグローバル結果にマージし、⑤ クエリ送信者に返します。

## さらなる情報を見つけるには {#where-to-find-more-information}

テーブルシャードに関するこの高レベルな紹介を超える詳細については、[deployment and scaling guide](/docs/architecture/horizontal-scaling) をご覧ください。

ClickHouse シャードのより深い理解のために、このチュートリアルビデオも強くお勧めします：

<iframe width="768" height="432" src="https://www.youtube.com/embed/vBjCJtw_Ei0?si=WqopTrnti6usCMRs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
