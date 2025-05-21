---
title: 'BigQuery から ClickHouse Cloud への移行'
slug: /migrations/bigquery/migrating-to-clickhouse-cloud
description: 'BigQuery から ClickHouse Cloud へのデータ移行方法'
keywords: ['migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'BigQuery']
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

## ClickHouse Cloud を使う理由 {#why-use-clickhouse-cloud-over-bigquery}

TLDR: ClickHouse は、現代のデータ分析において、BigQuery よりも速く、安価で、より強力だからです。

<Image img={bigquery_2} size="md" alt="ClickHouse vs BigQuery"/>

## BigQuery から ClickHouse Cloud へのデータの読み込み {#loading-data-from-bigquery-to-clickhouse-cloud}
### データセット {#dataset}

BigQuery から ClickHouse Cloud への典型的な移行を示すために、Stack Overflow のデータセットを使用します。このデータセットには、2008 年から 2024 年 4 月までの Stack Overflow に発生したすべての `post`、`vote`、`user`、`comment`、および `badge` が含まれています。このデータの BigQuery スキーマは以下に示されています。

<Image img={bigquery_3} size="lg" alt="Schema"/>

このデータセットを BigQuery インスタンスに読み込んで移行手順をテストしたいユーザーのために、GCS バケットに Parquet 形式のデータを提供し、DDL コマンドを使用してテーブルを作成し、データをロードする方法が [こちら](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==) から入手できます。

### データの移行 {#migrating-data}

BigQuery と ClickHouse Cloud の間でのデータ移行は、2 つの主なワークロードタイプに分かれます：

- **初期の一括ロードと定期的な更新** - 初期データセットを移行し、その後定期的にセットされた間隔で更新を行わなければなりません。ここでの更新は、比較に使用できるカラム（例えば日付）によって特定された変更された行を再送信することによって処理されます。削除はデータセットの完全な定期的な再ロードによって処理されます。
- **リアルタイムレプリケーションまたは CDC** - 初期データセットを移行し、このデータセットの変更を ClickHouse にほぼリアルタイムで反映させる必要があります。数秒の遅延のみが許容されます。これは実質的に [Change Data Capture (CDC) プロセス](https://en.wikipedia.org/wiki/Change_data_capture) であり、BigQuery のテーブルの挿入、更新、削除を ClickHouse の同等のテーブルに適用する必要があります。

#### Google Cloud Storage (GCS) 経由での一括ロード {#bulk-loading-via-google-cloud-storage-gcs}

BigQuery は Google のオブジェクトストレージ (GCS) へのデータのエクスポートをサポートします。例示データセットについては：

1. 7 つのテーブルを GCS にエクスポートします。そのためのコマンドは [こちら](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==) で入手できます。

2. データを ClickHouse Cloud にインポートします。そのために [gcs テーブル関数](/sql-reference/table-functions/gcs) を使用できます。DDL およびインポートクエリは [こちら](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==) から入手できます。ClickHouse Cloud インスタンスは複数のコンピュート ノードで構成されているため、`gcs` テーブル関数ではなく、[s3Cluster テーブル関数](/sql-reference/table-functions/s3Cluster) を使用します。この関数は GCS バケットでも機能し、[ClickHouse Cloud サービスのすべてのノードを利用して](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers) データを並行してロードします。

<Image img={bigquery_4} size="md" alt="Bulk loading"/>

このアプローチにはいくつかの利点があります：

- BigQuery エクスポート機能は、データのサブセットをエクスポートするためのフィルターをサポートしています。
- BigQuery は [Parquet、Avro、JSON、および CSV](https://cloud.google.com/bigquery/docs/exporting-data) 形式およびいくつかの [圧縮タイプ](https://cloud.google.com/bigquery/docs/exporting-data) にエクスポートをサポートしており、これらはすべて ClickHouse でもサポートされています。
- GCS は [オブジェクトライフサイクル管理](https://cloud.google.com/storage/docs/lifecycle) をサポートしており、エクスポートされ、ClickHouse にインポートされたデータは指定された期間経過後に削除されることがあります。
- [Google は、1 日あたり最大 50TB を GCS に無料でエクスポートできることを許可](https://cloud.google.com/bigquery/quotas#export_jobs)しています。ユーザーは GCS ストレージにのみ料金を支払います。
- エクスポートは自動的に複数のファイルを生成し、各ファイルの最大サイズは 1GB のテーブルデータに制限されます。これは ClickHouse にとって有益であり、インポートを並行化することを可能にします。

以下の例を試す前に、ユーザーは [エクスポートに必要な権限](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions) および [ローカリティの推奨事項](https://cloud.google.com/bigquery/docs/exporting-data#data-locations) を確認し、エクスポートおよびインポートのパフォーマンスを最大化することをお勧めします。

### スケジュールされたクエリ経由でのリアルタイムレプリケーションまたは CDC {#real-time-replication-or-cdc-via-scheduled-queries}

Change Data Capture (CDC) は、2 つのデータベース間でテーブルを同期し続けるプロセスです。更新と削除をほぼリアルタイムで処理する必要がある場合、これはかなり複雑になります。1 つのアプローチは、BigQuery の [スケジュールクエリ機能](https://cloud.google.com/bigquery/docs/scheduling-queries) を使用して、定期的なエクスポートをスケジュールすることです。ClickHouse にデータが挿入されるまでにいくつかの遅延を受け入れることができる場合、このアプローチは実装と維持が簡単です。例は [このブログ記事](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries) に示されています。

## スキーマの設計 {#designing-schemas}

Stack Overflow のデータセットには、いくつかの関連テーブルが含まれています。最初に主テーブルを移行することをお勧めします。これは必ずしも最も大きなテーブルである必要はなく、むしろ最も多くの分析クエリを受け取ることが期待されるテーブルです。これにより、ClickHouse の主要な概念に慣れることができます。このテーブルは、ClickHouse の機能を最大限に活用し、最適なパフォーマンスを得るために、追加のテーブルが追加されると変更する必要があるかもしれません。このモデリングプロセスについては、[データモデリングのドキュメント](/data-modeling/schema-design#next-data-modeling-techniques) で詳しく説明しています。

この原則に従って、私たちは主要な `posts` テーブルに焦点を当てます。この BigQuery スキーマは以下に示されています：

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

### 型の最適化 {#optimizing-types}

[こちらで説明されたプロセス](/data-modeling/schema-design) を適用することにより、次のスキーマが得られます：

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

このテーブルにデータを追加するには、エクスポートされたデータを gcs から読み込むシンプルな [`INSERT INTO SELECT`](/sql-reference/statements/insert-into) を使用できます。ClickHouse Cloud では、gcs 互換の [`s3Cluster` テーブル関数](/sql-reference/table-functions/s3Cluster) を使用して、複数のノードにわたってロードを並行化することもできます：

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs( 'gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

新しいスキーマでは、Null を保持しません。上記の挿入は、これらをそれぞれの型のデフォルト値 - 整数の場合は 0、文字列の場合は空の値にimplicitly に変換します。ClickHouse はまた、数値を自動的にそのターゲット精度に変換します。

## ClickHouse の主キーはどのように異なるか {#how-are-clickhouse-primary-keys-different}

[こちらで説明されたように](/migrations/bigquery)、BigQuery のように ClickHouse もテーブルの主キー列の値の一意性を強制しません。

BigQuery におけるクラスタリングと同様に、ClickHouse テーブルのデータは主キー列によって順序付けられてディスクに保存されます。このソート順は、クエリオプティマイザによって利用され、ソートを防ぎ、結合のメモリ使用量を最小限に抑え、リミット句の短絡評価を可能にします。
BigQuery とは対照的に、ClickHouse は主キー列の値に基づいて [（スパース）主インデックス](https://guides/best-practices/sparse-primary-indexes) を自動的に作成します。このインデックスは、主キー列にフィルターが含まれるすべてのクエリを高速化するために使用されます。具体的には：

- メモリとディスクの効率は、ClickHouse がしばしば使用されるスケールにおいて重要です。データは、パーツと呼ばれるチャンクで ClickHouse テーブルに書き込まれ、バックグラウンドでのマージのためにルールが適用されます。ClickHouse では、各パーツは独自の主インデックスを持っています。パーツがマージされると、マージされたパーツの主インデックスもマージされます。これらのインデックスは各行に対して構築されているわけではありません。代わりに、パーツの主インデックスは行のグループごとに 1 つのインデックスエントリを持つ - この手法をスパースインデックスと呼びます。
- スパースインデックスは、ClickHouse がパートの行を指定されたキーで順序付けてディスクに保存するため可能です。単一の行を直接特定するのではなく（Bツリー ベースのインデックスのように）、スパース主インデックスは、クエリに一致する可能性のある行のグループを迅速に特定します（インデックスエントリに対する二分探索を介して）。特定されたグループの潜在的に一致する行は、その後、並行して ClickHouse エンジンにストリーミングされます。このインデックス設計により、主インデックスは小さく（メインメモリに完全に収まる）なる一方で、クエリの実行時間を大幅に短縮することができます。特に、データ分析ユースケースで一般的な範囲クエリに効果的です。詳細については、[この詳細ガイド](https://guides/best-practices/sparse-primary-indexes) をお勧めします。

<Image img={bigquery_5} size="md" alt="ClickHouse Primary keys"/>

ClickHouse で選択された主キーは、インデックスだけでなく、ディスクにデータが書き込まれる順序も決定します。これにより、圧縮レベルに劇的に影響を与え、これがクエリのパフォーマンスにも影響を与えることがあります。ほとんどのカラムの値が連続して書き込まれる順序付けキーは、選択された圧縮アルゴリズム（およびコーデック）がデータをより効果的に圧縮することを可能にします。

> テーブル内のすべてのカラムは、指定された順序付けキーの値に基づいてソートされます。キー自体に含まれているかどうかにかかわらず。たとえば、`CreationDate` がキーとして使用されている場合、他のすべてのカラムの値の順序は、`CreationDate` カラムの値の順序に対応します。複数の順序付けキーを指定することができ - これは `SELECT` クエリの `ORDER BY` 句と同じ意味で順序付けされます。

### 順序付けキーの選択 {#choosing-an-ordering-key}

順序付けキーを選ぶ際の考慮事項や手順については、posts テーブルを例に [こちら](https://data-modeling/schema-design#choosing-an-ordering-key) でご覧ください。

## データモデリング技術 {#data-modeling-techniques}

BigQuery から移行するユーザーは、ClickHouse におけるデータモデリングのガイド [を読むことをお勧めします](/data-modeling/schema-design)。このガイドでは、同じ Stack Overflow データセットを使用し、ClickHouse の機能を利用した複数のアプローチを探ります。

### パーティション {#partitions}

BigQuery ユーザーは、データベースのパフォーマンスと管理性が向上するように大型データベースを小さく、より管理可能な部分に分割するテーブルのパーティショニングの概念に慣れているでしょう。このパーティショニングは、指定されたカラム（例えば、日付）の範囲、定義されたリスト、またはキーに対するハッシュを使用して達成できます。これにより、管理者は、日付範囲や地理的条件に基づいてデータを整理できます。

パーティショニングは、パーティション プルーニングによるデータアクセスを迅速化し、効率的なインデックス作成を可能にすることで、クエリのパフォーマンス向上に役立ちます。また、バックアップやデータの削除などのメンテナンスタスクにも役立ちます。これにより、テーブル全体ではなく、個々のパーティションに対して操作が可能になります。さらに、パーティショニングは、データロードを複数のパーティションに分散させることにより、BigQuery データベースのスケーラビリティを大幅に向上させることができます。

ClickHouse では、パーティショニングはテーブルが初期に定義される際に [`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key) 句を介して指定されます。この句は、任意のカラムに対する SQL 式を含むことができ、その結果が行が送られるパーティションを決定します。

<Image img={bigquery_6} size="md" alt="Partitions"/>

データパーツは、ディスク上の各パーティションに論理的に関連付けられ、個別にクエリされています。以下の例では、`toYear(CreationDate)` を使用して年ごとに posts テーブルをパーティショニングしています。ClickHouse に行が挿入されると、この式は各行に対して評価され、行はその結果として得られたパーティションにルーティングされ、新しいデータパーツがそのパーティションに属します。

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

#### アプリケーション {#applications}

ClickHouse におけるパーティショニングは、BigQuery でのアプリケーションと類似していますが、いくつかの微妙な違いがあります。具体的には：

- **データ管理** - ClickHouse では、ユーザーは主にパーティショニングをデータ管理機能と見なすべきです。キーに基づいて論理的にデータを分離することにより、各パーティションは独立して操作できます（例えば、削除）。これにより、ユーザーはパーティションを移動させ、サブセットを [ストレージ層](/integrations/s3#storage-tiers) の間で効率的に移動させたり、時間経過でデータを削除/効率的にクラスタから削除したりできます。例えば、2008 年の投稿を削除する場合は：

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

- **クエリの最適化** - パーティションはクエリのパフォーマンスに役立つ可能性がありますが、これはアクセスパターンによって大きく左右されます。クエリが少数のパーティション（理想的には 1 つ）を対象とする場合、パフォーマンスが向上する可能性があります。これは、パーティショニングキーが主キーに含まれていない場合に、フィルタリングによって役立つ場合があります。ただし、多くのパーティションをカバーする必要があるクエリは、パーティショニングを使用しない場合よりもパフォーマンスが低下する可能性があります（パーティショニングの結果としてパーツが増える可能性があるため）。特定のパーティションをターゲットにする利点は、パーティショニングキーがすでに主キーの先行エントリである場合にはあまり明確ではなくなるか、存在しない場合もあります。パーティショニングはまた、各パーティション内の値が一意である場合に、`GROUP BY` クエリの最適化にも使用できます。しかし、一般的にユーザーは主キーが最適化されていることを確認し、特定の予測可能なサブセットのデータをアクセスする場合を除いて、パーティショニングをクエリ最適化技術として考慮すべきです。

#### 推奨事項 {#recommendations}

ユーザーはパーティショニングをデータ管理技術と見なすべきです。時系列データを扱う場合、クラスタからデータを削除する必要がある場合に理想的です。例えば、古いパーティションは [単純に削除することができます](/sql-reference/statements/alter/partition#drop-partitionpart)。

重要：パーティショニングキーの式が高いカーディナリティのセットを生じないことを確認してください。つまり、100 以上のパーティションの作成は避けるべきです。例えば、クライアント識別子や名前などの高いカーディナリティのカラムでデータをパーティショニングしないでください。代わりに、クライアント識別子または名前を `ORDER BY` 式の最初のカラムにしてください。

> Internally, ClickHouse は挿入されたデータのために [parts](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design) を作成します。データが増えるにつれて、パーツの数が増える。クエリパフォーマンスを低下させる過剰な数のパーツを防ぐために、バックグラウンドの非同期プロセスでパーツが統合されます。パーツの数が [事前設定された限度](/operations/settings/merge-tree-settings#parts_to_throw_insert) を超えると、ClickHouse は挿入時に「["too many parts" エラー](https://knowledgebase/exception-too-many-parts)」として例外を発生させます。これは通常の操作では発生せず、ClickHouse が誤って設定されているか、適切に使用されていない場合（例えば、多数の小さな挿入の場合）にのみ発生します。パーツはパーティションごとに孤立して作成されるため、パーティションの数を増やすとパーツの数も増加します。したがって、高いカーディナリティのパーティショニングキーは、このエラーを引き起こす可能性があり、避けるべきです。

## 物化ビューとプロジェクション {#materialized-views-vs-projections}

ClickHouse のプロジェクションの概念により、ユーザーはテーブルのために複数の `ORDER BY` 句を指定できます。

[ClickHouse データモデリング](/data-modeling/schema-design) では、物化ビューを ClickHouse で使用して集計を事前に計算し、行を変換し、異なるアクセスパターンに対してクエリを最適化する方法を探ります。後者については、物化ビューが元のテーブルとは異なる順序キーでターゲットテーブルに行を送信する例を [提供しました](/materialized-view/incremental-materialized-view#lookup-table)。

例えば、次のクエリを考えてみます：

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

このクエリは、すべての 90m 行をスキャンする必要があります（もちろん速いですが）、`UserId` は順序キーではありません。以前は、物化ビューを使用して `PostId` のルックアップを行うことで解決しました。同じ問題は、プロジェクションでも解決できます。以下のコマンドは、`ORDER BY user_id` のためのプロジェクションを追加します。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

プロジェクションを作成する前にまず作成し、その後それを物化する必要があります。この後者のコマンドにより、データはディスク上に異なる順序で 2 回保存されます。データの作成時にプロジェクションを定義することも可能で、以下のように、データが挿入される際に自動的にメンテナンスされます。

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

プロジェクションが `ALTER` コマンドを介して作成されると、その作成は非同期であり、`MATERIALIZE PROJECTION` コマンドが発行されます。ユーザーは次のクエリでこの操作の進捗を確認し、`is_done=1` を待つことができます。

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

上記のクエリを繰り返すと、パフォーマンスが大幅に向上していることが確認できますが、追加のストレージが必要です。

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

次に [`EXPLAIN` コマンド](/sql-reference/statements/explain) を使用して、このクエリをサービスするためにプロジェクションが使用されたことも確認します：

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

### プロジェクションを使用するタイミング {#when-to-use-projections}

プロジェクションは、新しいユーザーにとって魅力的な機能です。データが挿入される際に自動的にメンテナンスされます。さらに、クエリはプロジェクションが可能な限り利用される単一のテーブルに送信できます。これにより、応答時間が短縮されます。

<Image img={bigquery_7} size="md" alt="Projections"/>

これは、ユーザーが適切な最適化されたターゲットテーブルを選択するか、フィルタに応じてクエリを再構築しなければならない物化ビューとは対照的です。これは、ユーザーアプリケーションにより大きな重みを置き、クライアント側の複雑さを増加させます。

これらの利点にもかかわらず、プロジェクションにはユーザーが認識すべきいくつかの制限があり、したがって節度を持って展開すべきです：

- プロジェクションでは、ソーステーブルと（隠れた）ターゲットテーブルに異なる TTL を使用できません。物化ビューは異なる TTL を許可します。
- プロジェクションは現在、（隠れた）ターゲットテーブルに対する `optimize_read_in_order` をサポートしていません。
- プロジェクションを持つテーブルには、論理的な更新と削除はサポートされていません。
- 物化ビューは連鎖することができ、1 つの物化ビューのターゲットテーブルが別の物化ビューのソーステーブルになることができ、そのように続きます。これはプロジェクションでは不可能です。
- プロジェクションは結合をサポートしていませんが、物化ビューはサポートしています。
- プロジェクションはフィルタ (`WHERE` 句) をサポートしていませんが、物化ビューはサポートしています。

プロジェクションを使用することをお勧めする場合は：

- データの完全な再配置が必要な場合。この式のプロジェクションは理論的には `GROUP BY` を使用できますが、集約の維持には物化ビューの方が有効です。クエリオプティマイザは、単純な再配置を利用するプロジェクションを利用する可能性が高くなります。すなわち、`SELECT * ORDER BY x`。この式でストレージのフットプリントを減少させるために列のサブセットを選択することができます。
- ユーザーは、データを二重で書き込むことに伴うストレージフットプリントとオーバーヘッドの増加に対して快適である。挿入速度への影響をテストし、[ストレージオーバーヘッドを評価してください](/data-compression/compression-in-clickhouse)。
```

## 条件式と配列 {#conditionals-and-arrays}

条件式と配列関数はクエリを大幅に簡素化します。以下のクエリは、2022年から2023年にかけて最も大きな割合の増加を示すタグ（10000回以上出現するもの）を計算します。条件式、配列関数、`HAVING`および`SELECT`句内でエイリアスを再利用する能力により、以下のClickHouseクエリは簡潔です。

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

5 行がセットされました。経過時間: 0.096 秒。処理行数: 508万行、155.73 MB (5300万行/s., 1.63 GB/s.)
ピークメモリ使用量: 410.37 MiB.
```

これで、BigQueryからClickHouseに移行するユーザー向けの基本ガイドは終了です。BigQueryから移行するユーザーには、ClickHouseの高度な機能について学ぶために、[ClickHouseでのデータのモデリング](／data-modeling/schema-design) のガイドを読むことをお勧めします。
