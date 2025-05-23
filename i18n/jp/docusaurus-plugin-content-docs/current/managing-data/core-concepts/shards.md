---
'slug': '/shards'
'title': 'テーブルシャードとレプリカ'
'description': 'ClickHouseにおけるテーブルシャードとレプリカとは何ですか'
'keywords':
- 'shard'
- 'shards'
- 'sharding'
- 'replica'
- 'replicas'
---

import image_01 from '@site/static/images/managing-data/core-concepts/shards_01.png'
import image_02 from '@site/static/images/managing-data/core-concepts/shards_02.png'
import image_03 from '@site/static/images/managing-data/core-concepts/shards_03.png'
import image_04 from '@site/static/images/managing-data/core-concepts/shards_04.png'
import image_05 from '@site/static/images/managing-data/core-concepts/shards_replicas_01.png'
import Image from '@theme/IdealImage';

<br/>
:::note
このトピックは ClickHouse Cloud には適用されず、[Parallel Replicas](/docs/deployment-guides/parallel-replicas) は従来の共有何も持たない ClickHouse クラスターにおける複数のシャードのように機能し、オブジェクトストレージは[置き換えます](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates#shared-object-storage-for-data-availability) レプリカを確保し、高い可用性と障害耐性を実現します。
:::

## ClickHouseにおけるテーブルシャードとは何ですか？ {#what-are-table-shards-in-clickhouse}

従来の[共有何も持たない](https://en.wikipedia.org/wiki/Shared-nothing_architecture) ClickHouse クラスターでは、シャーディングは ① データが単一サーバーには大きすぎる、または ② 単一サーバーがデータの処理には遅すぎる場合に使用されます。次の図はケース ①を示しており、[uk_price_paid_simple](/parts) テーブルが単一マシンの容量を超えています:

<Image img={image_01} size="lg" alt='SHARDS'/>

<br/>

このような場合、データはテーブルシャードの形式で複数の ClickHouse サーバーに分割できます:

<Image img={image_02} size="lg" alt='SHARDS'/>

<br/>

各シャードはデータのサブセットを保持し、独立してクエリできる通常の ClickHouse テーブルとして機能します。ただし、クエリはそのサブセットのみを処理し、データの分布によっては有効なユースケースとなることがあります。通常、[分散テーブル](/docs/engines/table-engines/special/distributed)（しばしばサーバーごとに）は、全データセットの統一されたビューを提供します。データ自体は保存しませんが、**SELECT** クエリをすべてのシャードに転送し、結果を組み合わせ、**INSERT** をルーティングしてデータを均等に分配します。

## 分散テーブルの作成 {#distributed-table-creation}

**SELECT** クエリの転送と **INSERT** ルーティングを示すために、2つの ClickHouse サーバーに分割された [What are table parts](/parts) の例テーブルを考えます。まず、この設定に対応する **Distributed table** を作成するための DDL ステートメントを示します:


```sql
CREATE TABLE uk.uk_price_paid_simple_dist ON CLUSTER test_cluster
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = Distributed('test_cluster', 'uk', 'uk_price_paid_simple', rand())

`ON CLUSTER` 句により、DDL ステートメントは [分散 DDL ステートメント](/docs/sql-reference/distributed-ddl) となり、ClickHouse に `test_cluster` [クラスター定義](/docs/architecture/horizontal-scaling#replication-and-sharding-configuration) にリストされているすべてのサーバーでテーブルを作成するよう指示します。分散 DDL には、[クラスターアーキテクチャ](/docs/architecture/horizontal-scaling#architecture-diagram) において追加の [Keeper](https://clickhouse.com/clickhouse/keeper) コンポーネントが必要です。

[分散エンジンパラメーター](/docs/engines/table-engines/special/distributed#distributed-parameters) では、クラスタ名 (`test_cluster`)、シャーディングされたターゲットテーブルのデータベース名 (`uk`)、シャーディングされたターゲットテーブルの名前 (`uk_price_paid_simple`)、そして **INSERT ルーティング** のための **シャーディングキー** を指定します。この例では、[rand](/sql-reference/functions/random-functions#rand) 関数を使用して行をランダムにシャードに割り当てています。ただし、ユースケースに応じて、複雑な式でもシャーディングキーとして使用できます。次のセクションでは、INSERT ルーティングがどのように機能するかを示します。

## INSERT ルーティング {#insert-routing}

以下の図は、分散テーブルへの INSERT が ClickHouse でどのように処理されるかを示しています:

<Image img={image_03} size="lg" alt='SHARDS'/>

<br/>

① 分散テーブルをターゲットとする INSERT（単一行）が、直接またはロードバランサーを介して、テーブルをホストする ClickHouse サーバーに送信されます。

② INSERT の各行（この例では1つ）について、ClickHouse はシャーディングキー（ここでは rand()）を評価し、結果をシャードサーバーの数で割った余りを取得し、それをターゲットサーバー ID（ID は 0 から始まり、1 ずつ増加します）として使用します。そして、行は転送され、③ 該当するサーバーのテーブルシャードに挿入されます。

次のセクションでは、SELECT 転送がどのように機能するかを説明します。

## SELECT 転送 {#select-forwarding}

この図は、ClickHouse の分散テーブルを使用して SELECT クエリがどのように処理されるかを示しています:

<Image img={image_04} size="lg" alt='SHARDS'/>

<br/>

① 分散テーブルをターゲットとする SELECT 集約クエリが対応する ClickHouse サーバーに、直接またはロードバランサーを介して送信されます。

② 分散テーブルは、ターゲットテーブルのシャードをホストするすべてのサーバーにクエリを転送し、各 ClickHouse サーバーがローカル集約結果を**並行して**計算します。


その後、初めにターゲットとされた分散テーブルをホストする ClickHouse サーバーは、③ すべてのローカル結果を収集し、④ 最終的なグローバル結果に統合し、⑤ それをクエリ送信者に返します。

## ClickHouseにおけるテーブルレプリカとは何ですか？ {#what-are-table-replicas-in-clickhouse}

ClickHouseにおけるレプリケーションは、複数のサーバー間で**シャードデータのコピーを維持**することにより、**データの整合性**と**フェールオーバー**を保証します。ハードウェアの故障は避けられないため、レプリケーションは各シャードに複数のレプリカを持つことでデータ損失を防ぎます。書き込みは、直接または [分散テーブル](#distributed-table-creation) を介して任意のレプリカに送信でき、どの操作のためにレプリカが選択されます。変更は他のレプリカに自動的に伝播されます。故障やメンテナンスが発生した場合でも、データは他のレプリカで利用可能であり、失敗したホストが復旧すると自動的に同期されて最新の状態を維持します。

レプリケーションには、[クラスターアーキテクチャ](/docs/architecture/horizontal-scaling#architecture-diagram) に [Keeper](https://clickhouse.com/clickhouse/keeper) コンポーネントが必要であることに注意してください。

以下の図は、シャード `Shard-1` と `Shard-2` がそれぞれ 3 つのレプリカを持つ、6 にサーバーから成る ClickHouse クラスターを示しています。このクラスターにクエリが送信されます:

<Image img={image_05} size="lg" alt='SHARDS'/>

<br/>

クエリ処理は、レプリカがないセットアップと同様に機能し、各シャードの単一のレプリカがクエリを実行します。

> レプリカはデータの整合性とフェールオーバーを確保するだけでなく、複数のクエリを異なるレプリカで並行して実行できるため、クエリ処理のスループットを向上させます。

① 分散テーブルをターゲットとするクエリが、直接またはロードバランサーを介して対応する ClickHouse サーバーに送信されます。

② 分散テーブルは、各シャードから1つのレプリカにクエリを転送し、選択されたレプリカをホストする各 ClickHouse サーバーがそのローカルクエリ結果を並行して計算します。

残りの処理は、レプリカがないセットアップでの[同様](#select-forwarding)であり、上の図には示されていません。初めにターゲットとされた分散テーブルをホストする ClickHouse サーバーがすべてのローカル結果を収集し、最終的なグローバル結果に統合し、それをクエリ送信者に返します。

ClickHouse では、② のクエリ転送戦略を設定することができます。デフォルトでは、上の図とは異なり—分散テーブルは、使用可能な場合はローカルレプリカを[優先](/docs/operations/settings/settings#prefer_localhost_replica)しますが、他のロードバランシング[戦略](/docs/operations/settings/settings#load_balancing)も使用できます。

## 追加情報の取得先 {#where-to-find-more-information}

テーブルシャードとレプリカに関するこの高レベルの紹介を超える詳細については、[デプロイメントおよびスケーリングガイド](/docs/architecture/horizontal-scaling)を参照してください。

ClickHouseのシャードとレプリカについてのより深い理解のために、このチュートリアルビデオも強くお勧めします:

<iframe width="1024" height="576" src="https://www.youtube.com/embed/vBjCJtw_Ei0?si=WqopTrnti6usCMRs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
