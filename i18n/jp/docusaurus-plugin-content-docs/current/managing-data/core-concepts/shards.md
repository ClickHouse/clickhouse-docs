---
slug: /shards
title: 'テーブルのシャードとレプリカ'
description: 'ClickHouseにおけるテーブルのシャードとレプリカとは'
keywords: ['シャード', 'シャード', 'シャーディング', 'レプリカ', 'レプリカ']
---

import image_01 from '@site/static/images/managing-data/core-concepts/shards_01.png'
import image_02 from '@site/static/images/managing-data/core-concepts/shards_02.png'
import image_03 from '@site/static/images/managing-data/core-concepts/shards_03.png'
import image_04 from '@site/static/images/managing-data/core-concepts/shards_04.png'
import image_05 from '@site/static/images/managing-data/core-concepts/shards_replicas_01.png'
import Image from '@theme/IdealImage';

<br/>
:::note
このトピックはClickHouse Cloudには適用されません。[Parallel Replicas](/docs/deployment-guides/parallel-replicas)は従来の共有なしのClickHouseクラスターにおける複数のシャードのように機能し、オブジェクトストレージは[レプリカを置き換え](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates#shared-object-storage-for-data-availability)高可用性とフォールトトレランスを確保します。
:::

## ClickHouseにおけるテーブルのシャードとは？ {#what-are-table-shards-in-clickhouse}

従来の[共有なし](https://en.wikipedia.org/wiki/Shared-nothing_architecture)のClickHouseクラスターでは、シャーディングは ① データが単一のサーバーに対して大きすぎる場合、または ② 単一のサーバーがデータの処理に対して遅すぎる場合に使用されます。次の図は、[uk_price_paid_simple](/parts)テーブルが単一のマシンの容量を超えているケース①を示しています:

<Image img={image_01} size="lg" alt='SHARDS'/>

<br/>

このような場合、データはテーブルのシャードとして複数のClickHouseサーバーに分割されます:

<Image img={image_02} size="lg" alt='SHARDS'/>

<br/>

各シャードはデータのサブセットを保持し、独立してクエリできる通常のClickHouseテーブルとして機能します。ただし、クエリはそのサブセットのみを処理するため、データの分散に応じて有効なユースケースとなる可能性があります。通常、[分散テーブル](/docs/engines/table-engines/special/distributed)（サーバーごとに多くの場合）が完全なデータセットの統一ビューを提供します。それ自体はデータを保存せず、**SELECT**クエリをすべてのシャードに転送し、結果を組み立て、均等にデータを分配するために**INSERT**をルーティングします。

## 分散テーブルの作成 {#distributed-table-creation}

**SELECT**クエリの転送と**INSERT**ルーティングを示すために、二つのClickHouseサーバーに跨る二つのシャードに分割された[What are table parts](/parts)の例テーブルを考えます。まず、このセットアップに関連する**分散テーブル**を作成するためのDDLステートメントを示します:

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

`ON CLUSTER`句はDDLステートメントを[分散DDLステートメント](/docs/sql-reference/distributed-ddl)にし、ClickHouseに`test_cluster`の[クラスター定義](/docs/architecture/horizontal-scaling#replication-and-sharding-configuration)にリストされているすべてのサーバーにテーブルを作成するよう指示します。分散DDLには、[クラスターアーキテクチャ](/docs/architecture/horizontal-scaling#architecture-diagram)において追加の[Keeper](https://clickhouse.com/clickhouse/keeper)コンポーネントが必要です。

[分散エンジンパラメータ](/docs/engines/table-engines/special/distributed#distributed-parameters)では、シャーディングされたターゲットテーブルのデータベース名（`uk`）、シャーディングされたターゲットテーブルの名前（`uk_price_paid_simple`）、およびINSERTルーティングのための**シャーディングキー**を指定します。この例では、[rand](/sql-reference/functions/random-functions#rand)関数を使用して行をランダムにシャードに割り当てています。ただし、ユースケースに応じて、複雑な式でもシャーディングキーとして使用できます。次のセクションではINSERTルーティングがどのように機能するかを説明します。

## INSERTルーティング {#insert-routing}

次の図は、分散テーブルへのINSERTがClickHouseでどのように処理されるかを示しています:

<Image img={image_03} size="lg" alt='SHARDS'/>

<br/>

① ターゲットとなる分散テーブルに対して単一の行を持つINSERTが、直接あるいはロードバランサを介してClickHouseサーバーに送信されます。

② INSERTからの各行（この例では1つのみ）について、ClickHouseはシャーディングキー（ここではrand()）を評価し、その結果をシャードサーバーの数で割った余りを取り、これをターゲットサーバーIDとして使用します（IDは0から始まり1ずつ増加します）。行は次に転送され、③ 対応するサーバーのテーブルシャードに挿入されます。

次のセクションでは、SELECT転送がどのように機能するかを説明します。

## SELECT転送 {#select-forwarding}

この図は、ClickHouseにおける分散テーブルでSELECTクエリがどのように処理されるかを示しています:

<Image img={image_04} size="lg" alt='SHARDS'/>

<br/>

① ターゲットとなる分散テーブルに対してSELECT集計クエリが、直接あるいはロードバランサを介して対応するClickHouseサーバーに送信されます。

② 分散テーブルは、ターゲットテーブルのシャードをホストしているすべてのサーバーにクエリを転送し、各ClickHouseサーバーが**並列**にローカル集計結果を計算します。

その後、最初にターゲットとなった分散テーブルをホストするClickHouseサーバーは、③ すべてのローカル結果を収集し、④ 最終的なグローバル結果にマージし、⑤ クエリの送信者に返します。

## ClickHouseにおけるテーブルのレプリカとは？ {#what-are-table-replicas-in-clickhouse}

ClickHouseにおけるレプリケーションは、複数のサーバーにわたって**シャードデータのコピー**を保持することにより、**データの整合性**と**フェイルオーバー**を確保します。ハードウェアの故障は避けられないため、レプリケーションは各シャードが複数のレプリカを持つことによりデータ損失を防ぎます。書き込みは、直接または[分散テーブル](#distributed-table-creation)を介して行うことができ、そこで操作のためのレプリカを選択します。変更は他のレプリカに自動的に伝播されます。失敗やメンテナンスが発生した場合、データは他のレプリカ上で利用可能であり、一度失敗したホストが回復すると、それに同期して最新の状態を保ちます。

レプリケーションには、[クラスターアーキテクチャ](/docs/architecture/horizontal-scaling#architecture-diagram)において[Keeper](https://clickhouse.com/clickhouse/keeper)コンポーネントが必要ですので注意してください。

次の図は、6つのサーバーを持つClickHouseクラスターを示しており、前述の二つのテーブルシャード`Shard-1`と`Shard-2`はそれぞれ三つのレプリカを持っています。このクラスターにクエリが送信されます:

<Image img={image_05} size="lg" alt='SHARDS'/>

<br/>

クエリ処理は、レプリカのないセットアップと同様に機能し、各シャードからの単一のレプリカのみがクエリを実行します。

> レプリカは、データの整合性とフェイルオーバーを確保するだけでなく、異なるレプリカ間で複数のクエリを並行して実行できるため、クエリ処理のスループットを向上させます。

① ターゲットとなる分散テーブルにクエリが送信され、直接またはロードバランサ経由で対応するClickHouseサーバーに送られます。

② 分散テーブルは、各シャードから選択されたレプリカの1つにクエリを転送し、そこでレプリカをホストする各ClickHouseサーバーがローカルのクエリ結果を並行して計算します。

残りは、レプリカのないセットアップの[同様](#select-forwarding)に機能し、図には示されていません。最初にターゲットとされた分散テーブルをホストするClickHouseサーバーがすべてのローカル結果を収集し、最終的なグローバル結果にマージし、クエリの送信者に返します。

ClickHouseでは、②のクエリ転送戦略を構成することができますので注意してください。デフォルトでは、上の図とは異なり、分散テーブルは利用可能な場合、ローカルレプリカを[優先し](https://docs.clickhouse.com/operations/settings/settings#prefer_localhost_replica)、他のロードバランシング[戦略](https://docs.clickhouse.com/operations/settings/settings#load_balancing)を使用することもできます。

## さらに情報を見つけるには {#where-to-find-more-information}

テーブルのシャードとレプリカに関するこの概要の他の詳細については、[デプロイメントとスケーリングガイド](/docs/architecture/horizontal-scaling)をご覧ください。

ClickHouseのシャードとレプリカに関する深い理解のために、このチュートリアル動画を強くお勧めします:

<iframe width="1024" height="576" src="https://www.youtube.com/embed/vBjCJtw_Ei0?si=WqopTrnti6usCMRs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
