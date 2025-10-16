---
'title': 'BigQueryからClickHouse Cloudへの移行'
'slug': '/migrations/bigquery/migrating-to-clickhouse-cloud'
'description': 'BigQueryからClickHouse Cloudへのデータを移行する方法'
'keywords':
- 'BigQuery'
'show_related_blogs': true
'sidebar_label': '移行ガイド'
'doc_type': 'guide'
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

## なぜ ClickHouse Cloud を BigQuery より使うべきか？ {#why-use-clickhouse-cloud-over-bigquery}

TLDR: ClickHouse は現代のデータ分析において BigQuery よりも高速で、コストが低く、より強力です。

<Image img={bigquery_2} size="md" alt="ClickHouse vs BigQuery"/>

## BigQuery から ClickHouse Cloud へのデータのロード {#loading-data-from-bigquery-to-clickhouse-cloud}

### データセット {#dataset}

BigQuery から ClickHouse Cloud への典型的な移行を示すための例として、Stack Overflow のデータセットを使用します。このデータセットには、2008 年から 2024 年 4 月まで Stack Overflow で発生したすべての `post`、`vote`、`user`、`comment`、`badge` が含まれています。このデータの BigQuery スキーマは以下に示されています。

<Image img={bigquery_3} size="lg" alt="Schema"/>

このデータセットを BigQuery インスタンスにロードして移行手順をテストしたいユーザー向けに、GCS バケットに Parquet 形式のデータを提供しており、BigQuery でのテーブルの作成とロードに必要な DDL コマンドは [こちら](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==) で入手できます。

### データの移行 {#migrating-data}

BigQuery と ClickHouse Cloud の間でデータを移行する方法は、主に2つのワークロードタイプに分類されます。

- **初期バルクロードと定期的な更新** - 初期データセットを移行し、例えば日次で定期的な更新を行う必要があります。ここでの更新は、変更された行を再送信することによって処理されます - 比較に使用できるカラム（例えば日付）で特定されます。削除はデータセットの完全な定期的再ロードによって処理されます。
- **リアルタイム複製または CDC** - 初期データセットを移行した後、このデータセットの変更を ClickHouse に近リアルタイムで反映させる必要があります。数秒の遅延は許容されます。これは実質的に [Change Data Capture (CDC) プロセス](https://en.wikipedia.org/wiki/Change_data_capture) であり、BigQuery のテーブルは ClickHouse と同期する必要があります。つまり、BigQuery テーブルの挿入、更新、削除は ClickHouse 内の同等のテーブルに適用される必要があります。

#### Google Cloud Storage (GCS) 経由のバルクロード {#bulk-loading-via-google-cloud-storage-gcs}

BigQuery はデータを Google のオブジェクトストア (GCS) にエクスポートすることをサポートしています。サンプルデータセットの場合:

1. 7 テーブルを GCS にエクスポートします。そのためのコマンドは [こちら](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==) で入手できます。

2. データを ClickHouse Cloud にインポートします。これには [gcs テーブル関数](/sql-reference/table-functions/gcs) を使用できます。DDL およびインポートクエリは [こちら](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==) で入手できます。ClickHouse Cloud のインスタンスが複数のコンピュートノードで構成されているため、`gcs` テーブル関数ではなく、[s3Cluster テーブル関数](/sql-reference/table-functions/s3Cluster) を使用しています。この関数は gcs バケットでも動作し、[ClickHouse Cloud サービスのすべてのノードを利用して](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers) データを並列にロードします。

<Image img={bigquery_4} size="md" alt="Bulk loading"/>

このアプローチにはいくつかの利点があります。

- BigQuery のエクスポート機能は、データのサブセットをエクスポートするためのフィルタをサポートしています。
- BigQuery は [Parquet、Avro、JSON、CSV](https://cloud.google.com/bigquery/docs/exporting-data) フォーマットやいくつかの [圧縮タイプ](https://cloud.google.com/bigquery/docs/exporting-data) にエクスポートすることをサポートしており、すべて ClickHouse によってサポートされています。
- GCS は [オブジェクトライフサイクル管理](https://cloud.google.com/storage/docs/lifecycle) をサポートしており、ClickHouse にエクスポートしてインポートされたデータを指定された期間後に削除できます。
- [Google は GCS に最大 50TB を無料でエクスポートできます](https://cloud.google.com/bigquery/quotas#export_jobs)。ユーザーは GCS ストレージの料金のみを支払います。
- エクスポートは複数のファイルを自動的に生成し、それぞれを最大 1GB のテーブルデータに制限します。これは ClickHouse にとって有益であり、インポートを並列化することを可能にします。

以下の例を試す前に、ユーザーは [エクスポートに必要な権限](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions) と [ローカリティの推奨事項](https://cloud.google.com/bigquery/docs/exporting-data#data-locations) を確認して、エクスポートとインポートのパフォーマンスを最大化することをお勧めします。

### スケジュールされたクエリ経由のリアルタイム複製または CDC {#real-time-replication-or-cdc-via-scheduled-queries}

Change Data Capture (CDC) は、テーブルを2つのデータベース間で同期させるプロセスです。更新や削除が近リアルタイムで処理される必要がある場合、これはかなり複雑です。1つのアプローチは、BigQuery の [スケジュールされたクエリ機能](https://cloud.google.com/bigquery/docs/scheduling-queries)を使用して定期的なエクスポートを単純にスケジュールすることです。ClickHouse に挿入されるデータに若干の遅延を受け入れられる場合、このアプローチは実装と維持が容易です。例は [このブログ記事](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries) に記載されています。

## スキーマの設計 {#designing-schemas}

Stack Overflow のデータセットには、いくつかの関連テーブルが含まれています。まず主テーブルの移行に焦点を当てることをお勧めします。これは必ずしも最も大きなテーブルである必要はなく、むしろ最も分析クエリを受けることが期待されるテーブルです。これにより、主要な ClickHouse の概念に慣れることができます。このテーブルは、追加のテーブルが追加されるにつれて、ClickHouse の機能をフルに活用し、最適なパフォーマンスを得るために再構成が必要な場合があります。このモデリングプロセスについては [データモデリングドキュメント](/data-modeling/schema-design#next-data-modeling-techniques) で探ります。

この原則に従って、主な `posts` テーブルに焦点を当てます。この BigQuery スキーマは以下に示されています。

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

[ここで説明されたプロセス](/data-modeling/schema-design)を適用すると、以下のスキーマが得られます。

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
   `ContentLicense`LowCardinality(String),
   `ParentId` String,
   `CommunityOwnedDate` DateTime,
   `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
COMMENT 'Optimized types'
```

このテーブルにデータを読み込むために、エクスポートされたデータを gcs から読み取る単純な [`INSERT INTO SELECT`](/sql-reference/statements/insert-into) を使ってこのテーブルにデータを挿入することができます。なお、ClickHouse Cloud では、複数のノードをまたいでロードを並列化するために、gcs 互換の [`s3Cluster` テーブル関数](/sql-reference/table-functions/s3Cluster) も使用できます。

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs( 'gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

新しいスキーマには null を保持しません。上記の挿入は、これらをそれぞれの型のデフォルト値 - 整数の場合は 0、文字列の場合は空の値に暗黙的に変換します。ClickHouse は、任意の数値をターゲットの精度に自動的に変換します。

## ClickHouse の主キーの違いは？ {#how-are-clickhouse-primary-keys-different}

[こちらで説明されているように](/migrations/bigquery)、BigQuery と同様に、ClickHouse ではテーブルの主キー列の値の一意性が強制されません。

BigQuery のクラスタリングと同様に、ClickHouse テーブルのデータは主キー列でディスクに順序付けて保存されます。このソート順は、クエリオプティマイザーによって利用され、再ソートを防ぎ、結合のメモリ使用量を最小限に抑え、リミット句の短絡を可能にします。
BigQuery と比較して、ClickHouse は主キー列の値に基づいて [（スパース）主インデックス](/guides/best-practices/sparse-primary-indexes) を自動的に作成します。このインデックスは、主キー列にフィルタを含むすべてのクエリを高速化するために使用されます。具体的には：

- メモリとディスクの効率は、ClickHouse がしばしば使用されるスケールにとって非常に重要です。データは、パーツと呼ばれるチャンクで ClickHouse テーブルに書き込まれ、バックグラウンドでパーツをマージするためのルールが適用されます。ClickHouse では、各パートには独自の主インデックスがあります。パーツがマージされると、マージされた部分の主インデックスもマージされます。ただし、これらのインデックスは各行ごとに構築されるわけではありません。代わりに、パートの主インデックスには、行のグループごとに1つのインデックスエントリがあります - この技術はスパースインデクシングと呼ばれます。
- スパースインデクシングが可能であるのは、ClickHouse がパートの行を、指定されたキーでディスクに順序付けて保存するためです。単一行を直接特定する（B-Tree ベースのインデックスのように）代わりに、スパース主インデックスは、クエリにマッチする可能性のある行のグループを迅速に識別することを可能にします（インデックスエントリに対する二分探索を介して）。特定された潜在的に一致する行のグループは、並行して ClickHouse エンジンにストリーミングされ、一致を見つけるために使用されます。このインデックス設計により、主インデックスは小さく（メインメモリに完全に収まる）、データ分析のユースケースで典型的な範囲クエリの実行時間を大幅に短縮します。詳細については、[この詳細ガイド](/guides/best-practices/sparse-primary-indexes)をお勧めします。

<Image img={bigquery_5} size="md" alt="ClickHouse Primary keys"/>

ClickHouse で選択された主キーは、インデックスだけでなく、ディスクに書き込まれるデータの順序も決定します。これにより、圧縮レベルに大きく影響を与え、結果的にクエリパフォーマンスにも影響を与えることがあります。ほとんどのカラムの値が連続的に書き込まれるような順序キーを選択すると、選択された圧縮アルゴリズム（およびコーデック）がデータをより効果的に圧縮できます。

> テーブル内のすべてのカラムは、指定された順序キーの値に基づいてソートされます。これは、そのキー自体に含まれているかどうかにかかわらず適用されます。例えば、`CreationDate` をキーとして使用すると、他のすべてのカラムの値の順序は `CreationDate` 列の値の順序に対応します。複数の順序キーを指定することができ、これは `SELECT` クエリの `ORDER BY` 句と同じ意味で順序付けが行われます。

### 順序キーの選択 {#choosing-an-ordering-key}

順序キーを選択するための考慮事項と手順について、`posts` テーブルを例にして [こちら](https://data-modeling/schema-design#choosing-an-ordering-key) を参照してください。

## データモデリング技術 {#data-modeling-techniques}

BigQuery から移行するユーザーは、[ClickHouse でのデータモデリングのガイド](/data-modeling/schema-design) を読むことをお勧めします。このガイドでは、同じ Stack Overflow データセットを使用して、ClickHouse の機能を利用した複数のアプローチを探ります。

### パーティション {#partitions}

BigQuery のユーザーは、大規模なデータベースのパフォーマンスと管理性を向上させるために、テーブルをパーティションと呼ばれる小さく管理しやすい部分に分割するテーブルパーティショニングの概念に慣れているでしょう。このパーティショニングは、指定されたカラム（例えば日付）の範囲、定義されたリスト、またはキーに対するハッシュを用いて実現できます。これにより、管理者はデータを日付範囲や地理的な場所など、特定の基準に基づいて整理できます。

パーティショニングは、パーティションプルーニングを通じてデータへのアクセスを高速化し、効率的なインデクシングによってクエリパフォーマンスを向上させるのに役立ちます。また、バックアップやデータの削除などのメンテナンスタスクでも、全体のテーブルではなく個々のパーティションに対する操作を行うことができます。さらに、パーティショニングは、複数のパーティションに負荷を分散することによって BigQuery データベースのスケーラビリティを大幅に向上させることができます。

ClickHouse では、テーブルが初めて定義されるときに [`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key) 句を使用してパーティショニングを指定します。この句には、SQL 式を任意のカラムに対して含めることができ、その結果が行が送信されるパーティションを定義します。

<Image img={bigquery_6} size="md" alt="Partitions"/>

データパーツはディスク上の各パーティションと論理的に関連付けられ、独立してクエリされます。以下の例では、`toYear(CreationDate)` の式を使用して `posts` テーブルを年ごとにパーティション化します。行が ClickHouse に挿入されると、この式は各行に対して評価され、行はそのパーティションに属する新しいデータパーツとしてルーティングされます。

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

ClickHouse のパーティショニングは、BigQuery と同様のアプリケーションを持ちますが、いくつかの微妙な違いがあります。具体的には：

- **データ管理** - ClickHouse では、ユーザーはパーティショニングをデータ管理機能と見なすべきです。キーに基づいてデータを論理的に分離することにより、各パーティションは独立して操作できる（例えば削除できる）ことを意味します。これにより、ユーザーはパーティションを移動させることができ、特定の条件に基づいて [ストレージ階層間で効率的に移動](https://integrations/s3#storage-tiers) したり、[データを期限切れにして効果的に削除](https://sql-reference/statements/alter/partition)したりできます。例えば、以下のように 2008 年の投稿を削除することができます：

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

- **クエリ最適化** - パーティションはクエリパフォーマンスの向上を助けることがありますが、これはアクセスパターンに大きく依存します。クエリが特定のいくつかのパーティション（理想的には1つ）をターゲットにする場合、パフォーマンスは向上する可能性があります。これは、パーティショニングキーが主キーに含まれていなく、フィルタリングによって使用される場合にのみ一般的に有益です。ただし、多くのパーティションをカバーする必要があるクエリは、パーティショニングを使用しない場合よりもパフォーマンスが悪くなる場合があります（パーティショニングの結果としてパーツが増加する可能性があるためです）。単一のパーティションをターゲットにする利点は、パーティショニングキーがすでに主キーの初期エントリーである場合には顕著ではなくなります。パーティショニングは、各パーティションの値が一意である場合に [GROUP BY クエリを最適化](https://engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key) にも使用できます。ただし、一般的に、ユーザーは主キーが最適化されていることを確認し、特定の予測可能なサブセットへのアクセスパターンがある特別なケースでのみパーティショニングをクエリ最適化技術と考慮すべきです。

#### お勧め {#recommendations}

ユーザーは、パーティショニングはデータ管理技術として考えるべきです。これは、タイムシリーズデータを扱う際にクラスターからデータを期限切れにする必要がある場合に理想的です。例えば、最も古いパーティションは [単に削除](https://sql-reference/statements/alter/partition#drop-partitionpart) できます。

重要: パーティショニングキーの式が高いカーディナリティのセットを生成しないことを確認してください。すなわち、100 を超えるパーティションを作成しないようにしてください。例えば、クライアント識別子や名前のような高いカーディナリティのカラムでデータをパーティショニングしないでください。代わりに、クライアント識別子や名前を `ORDER BY` 式の最初のカラムにします。

> 内部的に、ClickHouse は挿入されたデータのために [パーツを作成](https://guides/best-practices/sparse-primary-indexes#clickhouse-index-design) します。データが追加されると、パーツの数は増加します。過度に高い数のパーツを防ぐために、これはクエリパフォーマンスを低下させる（読み取るファイルが多くなるため）ので、パーツはバックグラウンドの非同期プロセスで統合されます。パーツの数が [事前設定された制限](https://operations/settings/merge-tree-settings#parts_to_throw_insert) を超えると、ClickHouse は挿入時に ["too many parts" エラー](https://knowledgebase/exception-too-many-parts)として例外をスローします。これは通常の操作では発生せず、ClickHouse が誤設定されているか、正しく使用されていない場合（例えば、小さな挿入が多い場合）にのみ発生します。パーツは各パーティションごとに独立して作成されるため、パーティションの数を増やすとパーツの数も増加します。したがって、高いカーディナリティのパーティショニングキーはこのエラーを引き起こす可能性があるため、回避すべきです。

## マテリアライズドビューとプロジェクション {#materialized-views-vs-projections}

ClickHouse のプロジェクションの概念により、ユーザーはテーブルに対して複数の `ORDER BY` 句を指定できます。

[ClickHouse データモデリング](/data-modeling/schema-design) の中で、マテリアライズドビューが ClickHouse で集約を事前計算したり、行を変換したり、さまざまなアクセスパターン向けにクエリを最適化する方法について説明します。後者については、[ここに例を示しました](/materialized-view/incremental-materialized-view#lookup-table)。マテリアライズドビューは、元のテーブルへの挿入と異なる順序キーを持つターゲットテーブルに行を送信します。

例えば、以下のクエリを考えてみてください。

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
   │ 0.18181818181818182 │
   └─────────────────────┘
--highlight-next-line
1 row in set. Elapsed: 0.040 sec. Processed 90.38 million rows, 361.59 MB (2.25 billion rows/s., 9.01 GB/s.)
Peak memory usage: 201.93 MiB.
```

このクエリでは、`UserId` が順序キーではないため、9000 万件のすべての行をスキャンする必要があります（迅速ですが）。以前は、`PostId` のルックアップとして機能するマテリアライズドビューを使用してこの問題を解決しました。同じ問題はプロジェクションを使用して解決できます。以下のコマンドは `ORDER BY user_id` のプロジェクションを追加します。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

まずプロジェクションを作成してからマテリアライズする必要があることに注意してください。この後者のコマンドは、データを二回ディスクに保存し、二つの異なる順序にします。プロジェクションは、データが作成されたときに以下のように定義され、自動的にメンテナンスされます。

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
    --highlight-begin
    PROJECTION comments_user_id
    (
    SELECT *
    ORDER BY UserId
    )
    --highlight-end
)
ENGINE = MergeTree
ORDER BY PostId
```

プロジェクションが `ALTER` コマンドによって作成される場合、`MATERIALIZE PROJECTION` コマンドが発行されたときに作成は非同期的です。ユーザーは以下のクエリでこの操作の進行状況を確認でき、`is_done=1` になるのを待ちます。

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

上記のクエリを繰り返すと、パフォーマンスが大幅に向上したことが確認できますが、追加のストレージの代償があります。

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘
--highlight-next-line
1 row in set. Elapsed: 0.008 sec. Processed 16.36 thousand rows, 98.17 KB (2.15 million rows/s., 12.92 MB/s.)
Peak memory usage: 4.06 MiB.
```

[`EXPLAIN` コマンド](/sql-reference/statements/explain)を使用して、このクエリがプロジェクションを使用してサーブされたことを確認します。

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

プロジェクションは、新しいユーザーにとって魅力的な機能です。なぜなら、データが挿入されると自動的に維持されるからです。さらに、クエリは可能な限りプロジェクションが活用される単一のテーブルに送信され、応答時間を短縮します。

<Image img={bigquery_7} size="md" alt="Projections"/>

これは、マテリアライズドビューとは対照的です。マテリアライズドビューでは、ユーザーが適切な最適化されたターゲットテーブルを選択するか、フィルタに応じてクエリを再構築する必要があります。これは、ユーザーアプリケーションにより多くの重視を置き、クライアント側の複雑性を増加させます。

これらの利点にもかかわらず、プロジェクションにはいくつかの固有の制限があり、ユーザーはそれを理解した上で慎重に展開すべきです。詳細については、["マテリアライズドビューとプロジェクション"](/managing-data/materialized-views-versus-projections)を参照してください。

プロジェクションを使用することをお勧めするのは次のような場合です：

- データの完全な再順序が必要な場合。プロジェクション内の式は理論的には `GROUP BY` を使用することができるが、マテリアライズドビューは集計を維持するのにより効果的です。クエリオプティマイザーも、単純な再順序を使用するプロジェクションを利用する可能性が高く、すなわち `SELECT * ORDER BY x` となります。ユーザーは、この式の中でストレージフットプリントを削減するために、カラムのサブセットを選択できます。
- ユーザーがストレージフットプリントの増加やデータを二回書くオーバーヘッドに対して快適である場合。挿入速度への影響をテストし、[ストレージオーバーヘッドを評価](https://data-compression/compression-in-clickhouse)します。

## BigQuery のクエリを ClickHouse で書き直す {#rewriting-bigquery-queries-in-clickhouse}

以下は、BigQuery と ClickHouse を比較した例クエリです。このリストは、ClickHouse の機能を利用してクエリを大幅に簡素化する方法を示すことを目的としています。ここでの例は、Stack Overflow のデータセット全体（2024年4月まで）を使用しています。

**最も多くのビューを受けたユーザー（10件以上の質問を持つ）:**

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

**最も多くのビューを受けたタグ:**

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

## 集約関数 {#aggregate-functions}

可能な限り、ユーザーは ClickHouse の集約関数を活用すべきです。以下では、[`argMax` 関数](/sql-reference/aggregate-functions/reference/argmax)を使用して、各年の最も閲覧された質問を計算する方法を示します。

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

## 条件文と配列 {#conditionals-and-arrays}

条件文と配列関数はクエリを大幅に簡素化します。以下のクエリは、2022 年から 2023 年にかけて最も大きなパーセンテージの増加を持つタグ（10000 件以上の出現）を計算します。以下の ClickHouse クエリは、条件文、配列関数、`HAVING` および `SELECT` 句でのエイリアスの再利用が可能であるため、簡潔です。

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

これで、BigQuery から ClickHouse への移行に関する基本ガイドが終了します。BigQuery から移行するユーザーは、ClickHouse の [データモデリング](https://data-modeling/schema-design) ガイドを読むことで、ClickHouse の高度な機能についてさらに学ぶことをお勧めします。
