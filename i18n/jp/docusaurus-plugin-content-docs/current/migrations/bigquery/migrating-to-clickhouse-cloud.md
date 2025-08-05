---
title: 'BigQuery から ClickHouse Cloud への移行'
slug: '/migrations/bigquery/migrating-to-clickhouse-cloud'
description: 'BigQuery から ClickHouse Cloud へのデータ移行方法'
keywords:
- 'migrate'
- 'migration'
- 'migrating'
- 'data'
- 'etl'
- 'elt'
- 'BigQuery'
---

import bigquery_2 from '@site/static/images/migrations/bigquery-2.png';
import bigquery_3 from '@site/static/images/migrations/bigquery-3.png';
import bigquery_4 from '@site/static/images/migrations/bigquery-4.png';
import bigquery_5 from '@site/static/images/migrations/bigquery-5.png';
import bigquery_6 from '@site/static/images/migrations/bigquery-6.png';
import bigquery_7 from '@site/static/images/migrations/bigquery-7.png';
import bigquery_8 from '@site/static/images/migrations/bigquery-8.png';
import bigquery_9 from '@site/static/images/migrations/bigquery-9.png';
import bigquery_10 from '@site/static/images/migrations/bigquery-10.png';
import bigquery_11 from '@site/static/images/migrations/bigquery-11.png';
import bigquery_12 from '@site/static/images/migrations/bigquery-12.png';
import Image from '@theme/IdealImage';

## Why use ClickHouse Cloud over BigQuery? {#why-use-clickhouse-cloud-over-bigquery}

TLDR: ClickHouseはモダンデータ分析において、BigQueryよりも速く、安く、より強力であるためです。

<Image img={bigquery_2} size="md" alt="ClickHouse vs BigQuery"/>

## Loading data from BigQuery to ClickHouse Cloud {#loading-data-from-bigquery-to-clickhouse-cloud}

### Dataset {#dataset}

BigQueryからClickHouse Cloudへの典型的な移行を示す例として、[こちら](/getting-started/example-datasets/stackoverflow)に文書化されたStack Overflowデータセットを使用します。これには、2008年から2024年4月までにStack Overflowで発生したすべての`post`、`vote`、`user`、`comment`、および`badge`が含まれています。このデータのBigQueryスキーマは以下の通りです：

<Image img={bigquery_3} size="lg" alt="Schema"/>

このデータセットをテスト移行手順に従ってBigQueryインスタンスにポピュレートしたいユーザーのために、GCSバケットにParquet形式でテーブルのデータを提供しており、BigQueryでテーブルを作成しロードするためのDDLコマンドは[こちら](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==)で入手可能です。

### Migrating data {#migrating-data}

BigQueryとClickHouse Cloud間のデータ移行は、主に2つのワークロードタイプに分かれます：

- **初期バルクロードと定期的な更新** - 初期データセットは移行され、例として定期的に（例えば、日次）更新されます。ここでの更新は、変更された行を再送信することで処理されます - 比較に使用できるカラム（例えば、日付）で識別されます。削除はデータセットの完全な定期的リロードによって処理されます。
- **リアルタイム複製またはCDC** - 初期データセットは移行されなければなりません。このデータセットの変更は、数秒の遅延でClickHouseに反映される必要があります。これは基本的に[Change Data Capture (CDC)プロセス](https://en.wikipedia.org/wiki/Change_data_capture)であり、BigQuery内のテーブルはClickHouseと同期される必要があります。すなわち、BigQueryテーブル内の挿入、更新、削除は、ClickHouseの同等のテーブルに適用されます。

#### Bulk loading via Google Cloud Storage (GCS) {#bulk-loading-via-google-cloud-storage-gcs}

BigQueryはGoogleのオブジェクトストア（GCS）へのデータエクスポートをサポートしています。我々の例のデータセットでは：

1. 7つのテーブルをGCSにエクスポートします。そのためのコマンドは[こちら](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==)で利用可能です。

2. データをClickHouse Cloudにインポートします。そのために、[gcsテーブル関数](/sql-reference/table-functions/gcs)を使用できます。DDLおよびインポートクエリは[こちら](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==)で入手可能です。ClickHouse Cloudインスタンスは複数の計算ノードから構成されているため、`gcs`テーブル関数の代わりに、[s3Clusterテーブル関数](/sql-reference/table-functions/s3Cluster)を使用します。この関数はgcsバケットとも動作し、[ClickHouse Cloudサービスのすべてのノードを活用](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers)してデータを並列にロードします。

<Image img={bigquery_4} size="md" alt="Bulk loading"/>

このアプローチにはいくつかの利点があります：

- BigQueryのエクスポート機能は、データのサブセットをエクスポートするためのフィルターをサポートしています。
- BigQueryは[Parquet、Avro、JSON、およびCSV](https://cloud.google.com/bigquery/docs/exporting-data)フォーマットと、いくつかの[圧縮タイプ](https://cloud.google.com/bigquery/docs/exporting-data)へのエクスポートをサポートしており、これらは全てClickHouseでサポートされています。
- GCSは[オブジェクトライフサイクル管理](https://cloud.google.com/storage/docs/lifecycle)をサポートしており、エクスポートされてClickHouseにインポートされたデータは、指定された期間後に削除できます。
- [Googleは、GCSに1日に最大50TBを無料でエクスポートできることを許可しています](https://cloud.google.com/bigquery/quotas#export_jobs)。ユーザーはGCSストレージの料金のみを支払います。
- エクスポートは自動的に複数のファイルを生成し、各ファイルを最大1GBのテーブルデータに制限します。これはClickHouseにとって有利であり、インポートを並列処理できるようにします。

以下の例を試す前に、ユーザーには[エクスポートに必要な権限](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions)と[ローカリティの推奨事項](https://cloud.google.com/bigquery/docs/exporting-data#data-locations)を確認することをお勧めします。

### Real-time replication or CDC via scheduled queries {#real-time-replication-or-cdc-via-scheduled-queries}

Change Data Capture (CDC)とは、2つのデータベース間でテーブルを同期するプロセスです。更新や削除をリアルタイムで処理するには、かなりの複雑さが伴います。一つのアプローチは、BigQueryの[スケジュールクエリ機能](https://cloud.google.com/bigquery/docs/scheduling-queries)を使用して定期的なエクスポートをスケジュールすることです。ClickHouseへのデータ挿入時にある程度の遅延を受け入れられるのであれば、このアプローチは実装と維持が簡単です。例は[このブログ記事](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries)に記載されています。

## Designing Schemas {#designing-schemas}

Stack Overflowデータセットには関連する複数のテーブルが含まれています。まず、主なテーブルの移行に焦点を当てることをお勧めします。このテーブルが必ずしも最大のテーブルである必要はありませんが、最も分析クエリを受けると予想されるテーブルであるのが理想です。これにより、主要なClickHouseの概念に慣れることができます。このテーブルは、追加のテーブルを追加することでClickHouseの機能を完全に活用し、最適なパフォーマンスを得るために再モデリングが必要になるかもしれません。このモデリングプロセスについては、[データモデリングドキュメント](/data-modeling/schema-design#next-data-modeling-techniques)で探ります。

この原則に従い、主な`posts`テーブルに焦点を当てます。このテーブルのBigQueryスキーマは以下の通りです：

```sql
CREATE TABLE stackoverflow.posts (
    id INTEGER,
    posttypeid INTEGER,
    acceptedanswerid STRING,
    creationdate TIMESTAMP,
    score INTEGER,
    viewcount INTEGER,
    body STRING,
    owneruserid INTEGER,
    ownerdisplayname STRING,
    lasteditoruserid STRING,
    lasteditordisplayname STRING,
    lasteditdate TIMESTAMP,
    lastactivitydate TIMESTAMP,
    title STRING,
    tags STRING,
    answercount INTEGER,
    commentcount INTEGER,
    favoritecount INTEGER,
    conentlicense STRING,
    parentid STRING,
    communityowneddate TIMESTAMP,
    closeddate TIMESTAMP
);
```

### Optimizing types {#optimizing-types}

[こちら](/data-modeling/schema-design)で説明されているプロセスを適用すると、以下のスキーマが得られます：

```sql
CREATE TABLE stackoverflow.posts
(
   `Id` Int32,
   `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
   `AcceptedAnswerId` UInt32,
   `CreationDate` DateTime,
   `Score` Int32,
   `ViewCount` UInt32,
   `Body` String,
   `OwnerUserId` Int32,
   `OwnerDisplayName` String,
   `LastEditorUserId` Int32,
   `LastEditorDisplayName` String,
   `LastEditDate` DateTime,
   `LastActivityDate` DateTime,
   `Title` String,
   `Tags` String,
   `AnswerCount` UInt16,
   `CommentCount` UInt8,
   `FavoriteCount` UInt8,
   `ContentLicense` LowCardinality(String),
   `ParentId` String,
   `CommunityOwnedDate` DateTime,
   `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
COMMENT 'Optimized types'
```

このテーブルにデータをポピュレートするためには、GCSからエクスポートされたデータを読み取る簡単な[`INSERT INTO SELECT`](/sql-reference/statements/insert-into)を使用できます。[gcsテーブル関数](/sql-reference/table-functions/gcs)を使用すると、ClickHouse Cloudでもgcs互換の[`s3Cluster`テーブル関数](/sql-reference/table-functions/s3Cluster)を使用して、複数のノードにわたってロードを並列化できます：

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs('gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

新しいスキーマでは、nullを保持しません。上記の挿入は、各タイプのデフォルト値に暗黙的に変換します - 整数は0、文字列は空値に変換されます。ClickHouseはまた、自動的に数値をターゲット精度に変換します。

## How are ClickHouse Primary keys different? {#how-are-clickhouse-primary-keys-different}

[こちら](/migrations/bigquery)で説明されているように、BigQueryと同様に、ClickHouseはテーブルの主キー列の値に対して一意性を強制しません。

BigQueryのクラスタリングと同様に、ClickHouseテーブルのデータは主キー列によってディスクに順序付けられて保存されます。このソート順は、クエリオプティマイザーによって利用され、再ソートを防ぎ、結合のメモリ使用量を最小限に抑え、リミット句のためのショートサーキットを可能にします。
BigQueryとは対照的に、ClickHouseは主キー列の値に基づいて自動的に[sparse primary index](/guides/best-practices/sparse-primary-indexes)を作成します。このインデックスは、主キー列にフィルターを含むすべてのクエリを高速化するために使用されます。具体的には：

- メモリとディスク効率は、ClickHouseが使用される規模にとって極めて重要です。データは、パーツと呼ばれるチャンクでClickHouseテーブルに書き込まれ、バックグラウンドでパーツをマージするためのルールが適用されます。ClickHouseでは、各パートに独自の主インデックスがあります。パーツがマージされると、マージされたパートの主インデックスもマージされます。これらのインデックスは各行のために構築されるわけではありません。代わりに、パートの主インデックスは行のグループ毎に1つのインデックスエントリを持ち、この技術はスパースインデキシングと呼ばれます。
- スパースインデキシングが可能なのは、ClickHouseが指定されたキーによってディスク上にパートの行を順序付けて保存するためです。単一の行を直接特定するのではなく（Bツリーに基づいたインデックスのように）、スパースインデックスにより、インデックスエントリのバイナリ検索を介して、クエリに一致する可能性のある行のグループを迅速に特定できます。その後、特定された可能性のある一致する行のグループは、並列でClickHouseエンジンにストリーミングされ、一致を見つけます。このインデックス設計により、主インデックスは小さく保たれ（メインメモリに完全に収まる）、特にデータ分析用の範囲クエリに通常見られるクエリ実行時間を大幅に短縮します。詳細については[この詳細なガイド](/guides/best-practices/sparse-primary-indexes)をお勧めします。

<Image img={bigquery_5} size="md" alt="ClickHouse Primary keys"/>

ClickHouseで選択した主キーは、インデックスだけでなく、ディスクへのデータの書き込み順序も決定します。そのため、圧縮レベルに劇的な影響を与え、逆にクエリパフォーマンスに影響を与える可能性があります。ほとんどのカラムの値が連続的な順序で書き込まれる原因となる順序付けキーを持つと、選択された圧縮アルゴリズム（およびコーデック）はデータをより効果的に圧縮できます。

> テーブル内のすべての列は、指定された順序付けキーの値に基づいてソートされます。キー自体に含まれているかどうかに関わらず、例えば、`CreationDate`がキーとして使用される場合、すべての他の列の値の順序は`CreationDate`列の値の順序に対応します。複数の順序付けキーを指定することができます - これは`SELECT`クエリの`ORDER BY`句と同じ意味の順序を設定します。

### Choosing an ordering key {#choosing-an-ordering-key}

順序付けキーを選択する際の考慮事項と手順については、`posts` テーブルを例として[こちら](/data-modeling/schema-design#choosing-an-ordering-key)を参照してください。

## Data modeling techniques {#data-modeling-techniques}

BigQueryから移行するユーザーには、[ClickHouseでのデータモデリングガイド](/data-modeling/schema-design)を読むことをお勧めします。このガイドは、同じStack Overflowデータセットを使用し、ClickHouseの機能を使用した複数のアプローチを探ります。

### Partitions {#partitions}

BigQueryユーザーは、テーブルをパーティショニングして、大規模データベースのパフォーマンスや管理性を向上させる概念に慣れているでしょう。これにより、テーブルが「パーティション」と呼ばれるより小さく管理しやすい部分に分割されます。このパーティショニングは、指定された列（例：日付）に基づく範囲、定義されたリスト、またはキーにハッシュを適用することで実現できます。これにより、管理者は特定の基準に基づいてデータを整理できます（例：日付範囲や地理的位置）。

パーティショニングは、パーティションプルーニングを通じてより迅速なデータアクセスを可能にし、インデックスが効率的になることでクエリパフォーマンスを向上させるのに役立ちます。また、全体のテーブルではなく個々のパーティションでの操作を可能にすることで、バックアップやデータ削除などのメンテナンス作業においても役立ちます。さらに、パーティショニングは、複数のパーティションにわたって負荷を分散させることでBigQueryデータベースのスケーラビリティを大幅に向上させる可能性があります。

ClickHouseでは、テーブルが初期に定義される際に[`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key)句を指定します。この句は、任意のカラムに対するSQL式を含むことができ、その結果が行が送られるパーティションを定義します。

<Image img={bigquery_6} size="md" alt="Partitions"/>

データパーツはディスク上の各パーティションに論理的に関連付けられ、独立してクエリされることができます。以下の例では、`toYear(CreationDate)`式を使用して`posts`テーブルを年でパーティショニングします。行がClickHouseに挿入されると、この式は各行に対して評価され、その結果に基づいて新しいデータパーツとしてそのパーティションにルーティングされます。

```sql
CREATE TABLE posts
(
        `Id` Int32 CODEC(Delta(4), ZSTD(1)),
        `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
        `AcceptedAnswerId` UInt32,
        `CreationDate` DateTime64(3, 'UTC'),
...
        `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate)
PARTITION BY toYear(CreationDate)
```

#### Applications {#applications}

ClickHouseにおけるパーティショニングの適用は、BigQueryと似ていますが、いくつかの微妙な違いがあります。具体的には：

- **データ管理** - ClickHouseでは、ユーザーは主にパーティショニングをデータ管理機能とみなすべきです。キーに基づいてデータを論理的に分けることで、各パーティションに独立した操作（例：削除）が可能になります。これにより、パーティションを効率的に移動させ、[ストレージ層](/integrations/s3#storage-tiers)間でサブセットを移動させることができます。例えば、以下のクエリは2008年の投稿を削除します：

```sql
SELECT DISTINCT partition
FROM system.parts
WHERE `table` = 'posts'

┌─partition─┐
│ 2008      │
│ 2009      │
│ 2010      │
│ 2011      │
│ 2012      │
│ 2013      │
│ 2014      │
│ 2015      │
│ 2016      │
│ 2017      │
│ 2018      │
│ 2019      │
│ 2020      │
│ 2021      │
│ 2022      │
│ 2023      │
│ 2024      │
└───────────┘

17 rows in set. Elapsed: 0.002 sec.

ALTER TABLE posts
(DROP PARTITION '2008')

Ok.

0 rows in set. Elapsed: 0.103 sec.
```

- **クエリ最適化** - パーティショニングはクエリパフォーマンスに貢献することができますが、これはアクセスパターンに大きく依存します。クエリが少数のパーティション（理想的には1つ）のみを対象とする場合、パフォーマンスが改善される可能性があります。これは通常、パーティショニングキーが主キーに含まれていない場合にのみ有用であり、それを基にフィルタリングを行います。ただし、多くのパーティションをカバーする必要のあるクエリは、パーティショニングを使用しない場合よりもパフォーマンスが低下する可能性があります（パーティショニングの結果、より多くのパーツが生じる可能性があるため）。特定のパーティションを対象とすることの利点は、パーティショニングキーが既に主キーの早期エントリーである場合、ほとんど存在しません。パーティショニングは、各パーティションの値がユニークである場合に[GROUP BYクエリの最適化](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)に使用できます。しかし一般的には、ユーザーは主キーが最適化されていることを確認し、アクセスパターンが特定の予測可能なサブセットにアクセスする特例のケースでのみパーティショニングをクエリ最適化技術として検討すべきです（例：日別のパーティションで、ほとんどのクエリが前日）。

#### Recommendations {#recommendations}

ユーザーは、パーティショニングをデータ管理技術とみなすべきです。これは時間系列データを操作する際に、クラスタからデータを削除する必要がある場合に最適です（例：最も古いパーティションは[単に削除](https://sql-reference/statements/alter/partition#drop-partitionpart)できます）。

重要：パーティショニングキーの式が高いカーディナリティのセットを作成しないことを確認してください。すなわち、100を超えるパーティションを作成することは避けるべきです。例えば、クライアント識別子や名前のような高いカーディナリティの列でデータをパーティショニングしないでください。代わりに、クライアント識別子や名前を`ORDER BY`式の最初の列にします。

> 内部的に、ClickHouseは挿入されたデータのために[パーツを作成](https://guides/best-practices/sparse-primary-indexes#clickhouse-index-design)します。より多くのデータが挿入されるにつれて、パーツの数は増加します。クエリパフォーマンスを低下させないようにするため、パーツが過度に多くなるのを防ぐために、非同期プロセスでパーツが背景でマージされます。パーツの数が[事前に設定された制限](/operations/settings/merge-tree-settings#parts_to_throw_insert)を超えた場合、ClickHouseは挿入時に["too many parts"エラー](https://knowledgebase/exception-too-many-parts)として例外をスローします。これは通常の運用では発生せず、ClickHouseが誤設定されているか、誤って使用されている場合（例：小さな挿入が多数）にのみ発生します。パーツは各パーティションに対して独立に作成されるため、パーティション数の増加がパーツ数の増加をもたらします。高いカーディナリティのパーティショニングキーは、このエラーを引き起こす可能性があるため、避けるべきです。

## Materialized views vs projections {#materialized-views-vs-projections}

ClickHouseのプロジェクションの概念により、ユーザーはテーブルのために複数の`ORDER BY`句を指定できます。

[ClickHouseのデータモデリング](/data-modeling/schema-design)では、ClickHouseでマテリアライズドビューを使用して集計を事前計算し、行を変換し、異なるアクセスパターンに対するクエリを最適化する方法について探ります。後者に関しては、[引数のある例](https://materialized-view/incremental-materialized-view#lookup-table)を提供しており、マテリアライズドビューが、挿入を受け取る元のテーブルとは異なる順序付けキーを持つターゲットテーブルに行を送信します。

例えば、以下のクエリを考えてみましょう：

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
   │ 0.18181818181818182 │
   └─────────────────────┘

1 row in set. Elapsed: 0.040 sec. Processed 90.38 million rows, 361.59 MB (2.25 billion rows/s., 9.01 GB/s.)
Peak memory usage: 201.93 MiB.
```

このクエリはすべての9000万行をスキャンする必要があります（迅速に行われますが）、`UserId`が順序付けキーでないためです。以前は、`PostId`のルックアップとして機能するマテリアライズドビューを使用してこの問題を解決しました。同様の問題は、プロジェクションでも解決可能です。以下のコマンドは、`ORDER BY user_id`のプロジェクションを追加します。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

まずプロジェクションを作成し、その後マテリアライズする必要があります。この後者のコマンドは、データがディスクに異なる2つの順序で2回保存されることを意味します。プロジェクションは、データ作成時に定義することもでき、以下のように挿入されるデータとして自動的に維持されます。

```sql
CREATE TABLE comments
(
        `Id` UInt32,
        `PostId` UInt32,
        `Score` UInt16,
        `Text` String,
        `CreationDate` DateTime64(3, 'UTC'),
        `UserId` Int32,
        `UserDisplayName` LowCardinality(String),
        PROJECTION comments_user_id
        (
        SELECT *
        ORDER BY UserId
        )
)
ENGINE = MergeTree
ORDER BY PostId
```

プロジェクションが`ALTER`コマンドを介して作成される場合、`MATERIALIZE PROJECTION`コマンドが発行されると、作成は非同期になります。ユーザーは次のクエリでこの操作の進捗を確認し、`is_done=1`を待つことができます。

```sql
SELECT
        parts_to_do,
        is_done,
        latest_fail_reason
FROM system.mutations
WHERE (`table` = 'comments') AND (command LIKE '%MATERIALIZE%')

   ┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
1. │           1 │       0 │                    │
   └─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

上記のクエリを繰り返すと、パフォーマンスが大幅に改善されたことがわかりますが、追加のストレージの費用がかかります。

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘

1 row in set. Elapsed: 0.008 sec. Processed 16.36 thousand rows, 98.17 KB (2.15 million rows/s., 12.92 MB/s.)
Peak memory usage: 4.06 MiB.
```

[`EXPLAIN`コマンド](/sql-reference/statements/explain)を使用して、プロジェクションがこのクエリに使用されたことも確認できます：

```sql
EXPLAIN indexes = 1
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

    ┌─explain─────────────────────────────────────────────┐
 1. │ Expression ((Projection + Before ORDER BY))         │
 2. │   Aggregating                                       │
 3. │   Filter                                            │
 4. │           ReadFromMergeTree (comments_user_id)      │
 5. │           Indexes:                                  │
 6. │           PrimaryKey                                │
 7. │           Keys:                                     │
 8. │           UserId                                    │
 9. │           Condition: (UserId in [8592047, 8592047]) │
10. │           Parts: 2/2                                │
11. │           Granules: 2/11360                         │
    └─────────────────────────────────────────────────────┘

11 rows in set. Elapsed: 0.004 sec.
```

### When to use projections {#when-to-use-projections}

プロジェクションは新しいユーザーにとって魅力的な機能ですが、データが挿入されると自動的に維持されます。さらに、クエリはプロジェクションが可能な場合に利用される単一のテーブルに送信できます。

<Image img={bigquery_7} size="md" alt="Projections"/>

これは、マテリアライズドビューとは対照的で、ユーザーは適切な最適化ターゲットテーブルを選択するか、フィルターに応じてクエリを再作成する必要があります。これはユーザーのアプリケーションに対してより大きな重点を置き、クライアント側の複雑さを増加させます。

これらの利点にもかかわらず、プロジェクションにはユーザーが認識すべき固有の制限がありますので、慎重に適用する必要があります：

- プロジェクションは、ソーステーブルと（隠れた）ターゲットテーブルで異なるTTLを使用することを許可しません。マテリアライズドビューは異なるTTLを許可します。
- プロジェクションは（隠れた）ターゲットテーブルの`optimize_read_in_order`を現在サポートしていません。
- プロジェクションを持つテーブルでは、軽量更新や削除はサポートされていません。
- マテリアライズドビューはチェーン可能です：1つのマテリアライズドビューのターゲットテーブルは、別のマテリアライズドビューのソーステーブルにすることができます。このようなことはプロジェクションでは不可能です。
- プロジェクションは結合をサポートしていません；マテリアライズドビューはサポートしています。
- プロジェクションはフィルター（`WHERE`句）をサポートしていません；マテリアライズドビューはサポートしています。

プロジェクションを使用する場合：

- データの完全な並べ替えが必要とされる場合。プロジェクション内の式は理論的には`GROUP BY`を使用することができますが、マテリアライズドビューは集計を維持するためにより効果的です。また、クエリオプティマイザーはシンプルな並べ替えを使用するプロジェクションをより多く活用する傾向があります。すなわち、`SELECT * ORDER BY x`のように。ユーザーはこの式でストレージフットプリントを軽減するために列のサブセットを選ぶことができます。
- ユーザーが、ストレージフットプリントの増加とデータを2回書くことのオーバーヘッドを受け入れられる場合。挿入速度への影響をテストし、[ストレージのオーバーヘッドを評価](/data-compression/compression-in-clickhouse)する必要があります。

## Rewriting BigQuery queries in ClickHouse {#rewriting-bigquery-queries-in-clickhouse}

以下に、BigQueryとClickHouseのクエリを比較する例を示します。このリストは、ClickHouseの機能を活用してクエリを大幅に単純化する方法を示すことを目的としています。ここでの例では、Stack Overflowデータセット全体を使用しています（2024年4月まで）。

**最もビューを受けたユーザー（10以上の質問がある）:**

_BigQuery_

<Image img={bigquery_8} size="sm" alt="Rewriting BigQuery queries" border/>

_ClickHouse_

```sql
SELECT
    OwnerDisplayName,
    sum(ViewCount) AS total_views
FROM stackoverflow.posts
WHERE (PostTypeId = 'Question') AND (OwnerDisplayName != '')
GROUP BY OwnerDisplayName
HAVING count() > 10
ORDER BY total_views DESC
LIMIT 5

   ┌─OwnerDisplayName─┬─total_views─┐
1. │ Joan Venge       │    25520387 │
2. │ Ray Vega         │    21576470 │
3. │ anon             │    19814224 │
4. │ Tim              │    19028260 │
5. │ John             │    17638812 │
   └──────────────────┴─────────────┘

5 rows in set. Elapsed: 0.076 sec. Processed 24.35 million rows, 140.21 MB (320.82 million rows/s., 1.85 GB/s.)
Peak memory usage: 323.37 MiB.
```

**どのタグが最も多くのビューを受けるか:**

_BigQuery_

<br />

<Image img={bigquery_9} size="sm" alt="BigQuery 1" border/>

_ClickHouse_

```sql
-- ClickHouse
SELECT
    arrayJoin(arrayFilter(t -> (t != ''), splitByChar('|', Tags))) AS tags,
    sum(ViewCount) AS views
FROM stackoverflow.posts
GROUP BY tags
ORDER BY views DESC
LIMIT 5

   ┌─tags───────┬──────views─┐
1. │ javascript │ 8190916894 │
2. │ python     │ 8175132834 │
3. │ java       │ 7258379211 │
4. │ c#         │ 5476932513 │
5. │ android    │ 4258320338 │
   └────────────┴────────────┘

5 rows in set. Elapsed: 0.318 sec. Processed 59.82 million rows, 1.45 GB (188.01 million rows/s., 4.54 GB/s.)
Peak memory usage: 567.41 MiB.
```

## Aggregate functions {#aggregate-functions}

可能な場合は、ClickHouseの集約関数を利用すべきです。以下に、[`argMax`関数](/sql-reference/aggregate-functions/reference/argmax)を使用して、各年で最もビューされた質問を計算する例を示します。

_BigQuery_

<Image img={bigquery_10} border size="sm" alt="Aggregate functions 1"/>

<Image img={bigquery_11} border size="sm" alt="Aggregate functions 2"/>

_ClickHouse_

```sql
-- ClickHouse
SELECT
    toYear(CreationDate) AS Year,
    argMax(Title, ViewCount) AS MostViewedQuestionTitle,
    max(ViewCount) AS MaxViewCount
FROM stackoverflow.posts
WHERE PostTypeId = 'Question'
GROUP BY Year
ORDER BY Year ASC
FORMAT Vertical

Row 1:
──────
Year:                    2008
MostViewedQuestionTitle: How to find the index for a given item in a list?
MaxViewCount:            6316987

Row 2:
──────
Year:                    2009
MostViewedQuestionTitle: How do I undo the most recent local commits in Git?
MaxViewCount:            13962748

...

Row 16:
───────
Year:                    2023
MostViewedQuestionTitle: How do I solve "error: externally-managed-environment" every time I use pip 3?
MaxViewCount:            506822

Row 17:
───────
Year:                    2024
MostViewedQuestionTitle: Warning "Third-party cookie will be blocked. Learn more in the Issues tab"
MaxViewCount:            66975

17 rows in set. Elapsed: 0.225 sec. Processed 24.35 million rows, 1.86 GB (107.99 million rows/s., 8.26 GB/s.)
Peak memory usage: 377.26 MiB.
```

## Conditionals and Arrays {#conditionals-and-arrays}

条件および配列関数を使用すると、クエリが大幅に簡素化されます。以下のクエリは、2022年から2023年にかけて最大の割合の増加を持つタグ（10000回以上出現したタグ）を計算します。以下のClickHouseクエリは、条件、配列関数、および`HAVING`および`SELECT`句で別名を再利用する能力のおかげで簡潔です。

_BigQuery_

<Image img={bigquery_12} size="sm" border alt="Conditionals and Arrays"/>

_ClickHouse_

```sql
SELECT
    arrayJoin(arrayFilter(t -> (t != ''), splitByChar('|', Tags))) AS tag,
    countIf(toYear(CreationDate) = 2023) AS count_2023,
    countIf(toYear(CreationDate) = 2022) AS count_2022,
    ((count_2023 - count_2022) / count_2022) * 100 AS percent_change
FROM stackoverflow.posts
WHERE toYear(CreationDate) IN (2022, 2023)
GROUP BY tag
HAVING (count_2022 > 10000) AND (count_2023 > 10000)
ORDER BY percent_change DESC
LIMIT 5

┌─tag─────────┬─count_2023─┬─count_2022─┬──────percent_change─┐
│ next.js     │      13788 │      10520 │   31.06463878326996 │
│ spring-boot │      16573 │      17721 │  -6.478189718413183 │
│ .net        │      11458 │      12968 │ -11.644046884639112 │
│ azure       │      11996 │      14049 │ -14.613139725247349 │
│ docker      │      13885 │      16877 │  -17.72826924216389 │
└─────────────┴────────────┴────────────┴─────────────────────┘

5 rows in set. Elapsed: 0.096 sec. Processed 5.08 million rows, 155.73 MB (53.10 million rows/s., 1.63 GB/s.)
Peak memory usage: 410.37 MiB.
```

これで、BigQueryからClickHouseへ移行するユーザーの基本ガイドが完了しました。BigQueryから移行するユーザーには、ClickHouseの[データモデリングガイド](/data-modeling/schema-design)をお読みいただき、ClickHouseの高度な機能についてさらに学ぶことをお勧めします。
