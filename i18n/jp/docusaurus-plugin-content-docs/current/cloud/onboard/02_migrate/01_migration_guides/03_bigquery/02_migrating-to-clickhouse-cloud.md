---
title: 'BigQuery から ClickHouse Cloud への移行'
slug: /migrations/bigquery/migrating-to-clickhouse-cloud
description: 'BigQuery のデータを ClickHouse Cloud に移行する方法'
keywords: ['BigQuery']
show_related_blogs: true
sidebar_label: '移行ガイド'
doc_type: 'guide'
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


## BigQueryよりもClickHouse Cloudを使用する理由 {#why-use-clickhouse-cloud-over-bigquery}

要約：ClickHouseは、最新のデータ分析においてBigQueryよりも高速、低コスト、かつ高性能だからです：

<Image img={bigquery_2} size='md' alt='ClickHouse vs BigQuery' />


## BigQueryからClickHouse Cloudへのデータ読み込み {#loading-data-from-bigquery-to-clickhouse-cloud}

### データセット {#dataset}

BigQueryからClickHouse Cloudへの典型的な移行を示すサンプルデータセットとして、[こちら](/getting-started/example-datasets/stackoverflow)に記載されているStack Overflowデータセットを使用します。このデータセットには、2008年から2024年4月までにStack Overflowで発生したすべての`post`、`vote`、`user`、`comment`、`badge`が含まれています。このデータのBigQueryスキーマを以下に示します。

<Image img={bigquery_3} size='lg' alt='スキーマ' />

移行手順をテストするためにこのデータセットをBigQueryインスタンスに投入したいユーザー向けに、GCSバケット内にこれらのテーブルのデータをParquet形式で提供しており、BigQueryでテーブルを作成および読み込むためのDDLコマンドは[こちら](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==)で入手できます。

### データの移行 {#migrating-data}

BigQueryとClickHouse Cloud間のデータ移行は、主に2つのワークロードタイプに分類されます。

- **定期更新を伴う初期一括読み込み** - 初期データセットを移行し、その後、設定された間隔（例：日次）で定期的に更新を行います。ここでの更新は、変更された行を再送信することで処理されます。変更された行は、比較に使用できる列（例：日付）によって識別されます。削除は、データセット全体の定期的な再読み込みによって処理されます。
- **リアルタイムレプリケーションまたはCDC** - 初期データセットを移行する必要があります。このデータセットへの変更は、数秒の遅延のみを許容してClickHouseにほぼリアルタイムで反映される必要があります。これは実質的に[Change Data Capture（CDC）プロセス](https://en.wikipedia.org/wiki/Change_data_capture)であり、BigQueryのテーブルをClickHouseと同期する必要があります。つまり、BigQueryテーブルでの挿入、更新、削除は、ClickHouseの対応するテーブルに適用される必要があります。

#### Google Cloud Storage（GCS）経由の一括読み込み {#bulk-loading-via-google-cloud-storage-gcs}

BigQueryは、Googleのオブジェクトストレージ（GCS）へのデータエクスポートをサポートしています。サンプルデータセットの場合：

1. 7つのテーブルをGCSにエクスポートします。そのためのコマンドは[こちら](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==)で入手できます。

2. データをClickHouse Cloudにインポートします。そのために[gcsテーブル関数](/sql-reference/table-functions/gcs)を使用できます。DDLおよびインポートクエリは[こちら](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==)で入手できます。ClickHouse Cloudインスタンスは複数のコンピュートノードで構成されているため、`gcs`テーブル関数の代わりに[s3Clusterテーブル関数](/sql-reference/table-functions/s3Cluster)を使用しています。この関数はgcsバケットでも動作し、[ClickHouse Cloudサービスのすべてのノードを活用](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers)してデータを並列に読み込みます。

<Image img={bigquery_4} size='md' alt='一括読み込み' />

このアプローチには多くの利点があります。

- BigQueryのエクスポート機能は、データのサブセットをエクスポートするためのフィルタをサポートしています。
- BigQueryは、[Parquet、Avro、JSON、CSV](https://cloud.google.com/bigquery/docs/exporting-data)形式および複数の[圧縮タイプ](https://cloud.google.com/bigquery/docs/exporting-data)へのエクスポートをサポートしており、これらはすべてClickHouseでサポートされています。
- GCSは[オブジェクトライフサイクル管理](https://cloud.google.com/storage/docs/lifecycle)をサポートしており、エクスポートされてClickHouseにインポートされたデータを指定期間後に削除できます。
- [Googleは1日あたり最大50TBまでGCSへの無料エクスポートを許可しています](https://cloud.google.com/bigquery/quotas#export_jobs)。ユーザーはGCSストレージの料金のみを支払います。
- エクスポートは自動的に複数のファイルを生成し、各ファイルを最大1GBのテーブルデータに制限します。これにより、インポートを並列化できるため、ClickHouseにとって有益です。

以下の例を試す前に、エクスポートとインポートのパフォーマンスを最大化するために、[エクスポートに必要な権限](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions)と[ロケーションの推奨事項](https://cloud.google.com/bigquery/docs/exporting-data#data-locations)を確認することをお勧めします。


### スケジュールクエリによるリアルタイムレプリケーションまたはCDC {#real-time-replication-or-cdc-via-scheduled-queries}

Change Data Capture(CDC)は、2つのデータベース間でテーブルの同期を維持するプロセスです。更新と削除をほぼリアルタイムで処理する必要がある場合、これは大幅に複雑になります。1つのアプローチとして、BigQueryの[スケジュールクエリ機能](https://cloud.google.com/bigquery/docs/scheduling-queries)を使用して定期的なエクスポートをスケジュールする方法があります。ClickHouseへのデータ挿入にある程度の遅延を許容できる場合、このアプローチは実装と保守が容易です。具体例は[このブログ記事](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries)で紹介されています。


## スキーマの設計 {#designing-schemas}

Stack Overflowデータセットには、複数の関連テーブルが含まれています。まず主要なテーブルの移行に焦点を当てることをお勧めします。これは必ずしも最大のテーブルである必要はなく、最も多くの分析クエリが実行されると予想されるテーブルです。これにより、ClickHouseの主要な概念に習熟することができます。このテーブルは、ClickHouseの機能を最大限に活用し最適なパフォーマンスを得るために、追加のテーブルが加わるにつれて再モデリングが必要になる場合があります。このモデリングプロセスについては、[データモデリングドキュメント](/data-modeling/schema-design#next-data-modeling-techniques)で詳しく説明しています。

この原則に従い、メインの`posts`テーブルに焦点を当てます。このテーブルのBigQueryスキーマを以下に示します:

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

[こちらで説明されている](/data-modeling/schema-design)プロセスを適用すると、以下のスキーマになります:

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
COMMENT '最適化された型'
```

このテーブルには、シンプルな[`INSERT INTO SELECT`](/sql-reference/statements/insert-into)を使用してデータを投入できます。[`gcs`テーブル関数](/sql-reference/table-functions/gcs)を使用してGCSからエクスポートされたデータを読み取ります。なお、ClickHouse Cloudでは、GCS互換の[`s3Cluster`テーブル関数](/sql-reference/table-functions/s3Cluster)を使用して、複数のノードにわたってロードを並列化することもできます:

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs( 'gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

新しいスキーマではnull値を保持しません。上記のINSERT文は、これらを暗黙的にそれぞれの型のデフォルト値に変換します - 整数の場合は0、文字列の場合は空の値です。ClickHouseは数値も自動的にターゲットの精度に変換します。


## ClickHouseのプライマリキーはどう違うのか？ {#how-are-clickhouse-primary-keys-different}

[こちら](/migrations/bigquery)で説明されているように、BigQueryと同様に、ClickHouseはテーブルのプライマリキー列の値に対して一意性を強制しません。

BigQueryのクラスタリングと同様に、ClickHouseテーブルのデータはプライマリキー列によって順序付けられてディスクに保存されます。このソート順序は、クエリオプティマイザによって再ソートの防止、結合時のメモリ使用量の最小化、limit句のショートサーキットの有効化に利用されます。
BigQueryとは対照的に、ClickHouseはプライマリキー列の値に基づいて[（スパース）プライマリインデックス](/guides/best-practices/sparse-primary-indexes)を自動的に作成します。このインデックスは、プライマリキー列にフィルタを含むすべてのクエリを高速化するために使用されます。具体的には：

- ClickHouseが使用される規模において、メモリとディスクの効率性は極めて重要です。データはパートと呼ばれるチャンク単位でClickHouseテーブルに書き込まれ、バックグラウンドでパートをマージするためのルールが適用されます。ClickHouseでは、各パートが独自のプライマリインデックスを持ちます。パートがマージされると、マージされたパートのプライマリインデックスもマージされます。これらのインデックスは各行に対して構築されるわけではないことに注意してください。代わりに、パートのプライマリインデックスは行のグループごとに1つのインデックスエントリを持ちます。この技術はスパースインデックスと呼ばれます。
- スパースインデックスが可能なのは、ClickHouseが指定されたキーによって順序付けられた状態でパートの行をディスクに保存するためです。単一の行を直接特定する（B-Treeベースのインデックスのような）代わりに、スパースプライマリインデックスは（インデックスエントリに対する二分探索を介して）クエリに一致する可能性のある行のグループを迅速に識別します。特定された一致する可能性のある行のグループは、その後並列にClickHouseエンジンにストリーミングされ、一致するものを見つけます。このインデックス設計により、プライマリインデックスを小さく保ちながら（完全にメインメモリに収まる）、特にデータ分析のユースケースで典型的な範囲クエリにおいて、クエリ実行時間を大幅に高速化できます。詳細については、[この詳細ガイド](/guides/best-practices/sparse-primary-indexes)を参照してください。

<Image img={bigquery_5} size='md' alt='ClickHouseプライマリキー' />

ClickHouseで選択されたプライマリキーは、インデックスだけでなく、データがディスクに書き込まれる順序も決定します。このため、圧縮レベルに大きな影響を与える可能性があり、それがクエリパフォーマンスに影響します。ほとんどの列の値が連続した順序で書き込まれるようにする順序キーは、選択された圧縮アルゴリズム（およびコーデック）がデータをより効果的に圧縮できるようにします。

> テーブル内のすべての列は、キー自体に含まれているかどうかに関係なく、指定された順序キーの値に基づいてソートされます。たとえば、`CreationDate`がキーとして使用される場合、他のすべての列の値の順序は`CreationDate`列の値の順序に対応します。複数の順序キーを指定できます。これは`SELECT`クエリの`ORDER BY`句と同じセマンティクスで順序付けされます。

### 順序キーの選択 {#choosing-an-ordering-key}

postsテーブルを例として、順序キーを選択する際の考慮事項と手順については、[こちら](/data-modeling/schema-design#choosing-an-ordering-key)を参照してください。


## データモデリング技法 {#data-modeling-techniques}

BigQueryから移行するユーザーには、[ClickHouseにおけるデータモデリングガイド](/data-modeling/schema-design)を読むことをお勧めします。このガイドでは同じStack Overflowデータセットを使用し、ClickHouseの機能を活用した複数のアプローチを解説しています。

### パーティション {#partitions}

BigQueryユーザーは、大規模データベースのパフォーマンスと管理性を向上させるために、テーブルをパーティションと呼ばれるより小さく管理しやすい単位に分割するテーブルパーティショニングの概念に馴染みがあるでしょう。このパーティショニングは、指定されたカラムの範囲(例:日付)、定義されたリスト、またはキーに対するハッシュを使用して実現できます。これにより、管理者は日付範囲や地理的位置などの特定の基準に基づいてデータを整理できます。

パーティショニングは、パーティションプルーニングによる高速なデータアクセスとより効率的なインデックス作成を可能にすることで、クエリパフォーマンスの向上に貢献します。また、テーブル全体ではなく個々のパーティションに対して操作を実行できるため、バックアップやデータ削除などのメンテナンスタスクも容易になります。さらに、パーティショニングは複数のパーティションに負荷を分散することで、BigQueryデータベースのスケーラビリティを大幅に向上させることができます。

ClickHouseでは、パーティショニングはテーブルの初期定義時に[`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key)句を使用して指定します。この句には任意のカラムに対するSQL式を含めることができ、その結果によって行がどのパーティションに送られるかが決定されます。

<Image img={bigquery_6} size='md' alt='パーティション' />

データパーツはディスク上の各パーティションに論理的に関連付けられ、個別にクエリを実行できます。以下の例では、[`toYear(CreationDate)`](/sql-reference/functions/date-time-functions#toYear)式を使用してpostsテーブルを年ごとにパーティション分割しています。ClickHouseに行が挿入されると、この式が各行に対して評価され、行はそのパーティションに属する新しいデータパーツの形式で該当するパーティションにルーティングされます。

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

#### 適用例 {#applications}

ClickHouseにおけるパーティショニングはBigQueryと同様の適用例がありますが、いくつかの微妙な違いがあります。具体的には:

- **データ管理** - ClickHouseでは、ユーザーはパーティショニングを主にデータ管理機能として考えるべきであり、クエリ最適化技法ではありません。キーに基づいてデータを論理的に分離することで、各パーティションは独立して操作(例:削除)できます。これにより、ユーザーはパーティション、つまりデータのサブセットを[ストレージ階層](/integrations/s3#storage-tiers)間で効率的に移動したり、[データを期限切れにしたり、クラスタから効率的に削除](/sql-reference/statements/alter/partition)したりできます。以下の例では、2008年の投稿を削除しています:

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


- **クエリ最適化** - パーティションはクエリパフォーマンスの向上に寄与できますが、これはアクセスパターンに大きく依存します。クエリが少数のパーティション(理想的には1つ)のみを対象とする場合、パフォーマンスが向上する可能性があります。これは通常、パーティショニングキーがプライマリキーに含まれておらず、それによってフィルタリングを行う場合にのみ有用です。しかし、多数のパーティションをカバーする必要があるクエリは、パーティショニングを使用しない場合よりもパフォーマンスが低下する可能性があります(パーティショニングの結果としてパーツが増える可能性があるため)。パーティショニングキーがすでにプライマリキーの先頭付近に存在する場合、単一パーティションを対象とすることの利点はさらに小さくなるか、ほぼ存在しなくなります。各パーティション内の値が一意である場合、パーティショニングは[`GROUP BY`クエリの最適化](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)にも使用できます。ただし、一般的には、ユーザーはプライマリキーが最適化されていることを確認し、アクセスパターンが特定の予測可能なデータのサブセットにアクセスする例外的なケース(例:日単位でパーティショニングし、ほとんどのクエリが直近の日を対象とする場合)でのみ、クエリ最適化手法としてパーティショニングを検討すべきです。

#### 推奨事項 {#recommendations}

ユーザーはパーティショニングをデータ管理手法として検討すべきです。時系列データを扱う際にクラスタからデータを削除する必要がある場合に理想的です。例えば、最も古いパーティションは[単純に削除](/sql-reference/statements/alter/partition#drop-partitionpart)できます。

重要:パーティショニングキー式が高カーディナリティセットにならないようにしてください。つまり、100を超えるパーティションの作成は避けるべきです。例えば、クライアント識別子や名前などの高カーディナリティカラムでデータをパーティショニングしないでください。代わりに、クライアント識別子や名前を`ORDER BY`式の最初のカラムにしてください。

> 内部的に、ClickHouseは挿入されたデータに対して[パーツを作成](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)します。より多くのデータが挿入されると、パーツの数が増加します。過度に多数のパーツを防ぐため(読み取るファイルが増えるためクエリパフォーマンスが低下します)、パーツはバックグラウンドの非同期プロセスでマージされます。パーツの数が[事前設定された制限](/operations/settings/merge-tree-settings#parts_to_throw_insert)を超えると、ClickHouseは挿入時に["too many parts"エラー](/knowledgebase/exception-too-many-parts)として例外をスローします。これは通常の運用では発生せず、ClickHouseが誤って設定されているか、誤って使用されている場合(例:多数の小さな挿入)にのみ発生します。パーツはパーティションごとに独立して作成されるため、パーティション数を増やすとパーツ数も増加します。つまり、パーティション数の倍数になります。したがって、高カーディナリティのパーティショニングキーはこのエラーを引き起こす可能性があり、避けるべきです。


## マテリアライズドビュー vs プロジェクション {#materialized-views-vs-projections}

ClickHouseのプロジェクション機能により、ユーザーはテーブルに対して複数の`ORDER BY`句を指定できます。

[ClickHouseデータモデリング](/data-modeling/schema-design)では、マテリアライズドビューをClickHouseで使用して集計を事前計算し、行を変換し、異なるアクセスパターンに対してクエリを最適化する方法を解説しています。後者については、マテリアライズドビューが挿入を受け取る元のテーブルとは異なるソートキーを持つターゲットテーブルに行を送信する[例を提供しました](/materialized-view/incremental-materialized-view#lookup-table)。

例えば、次のクエリを考えてみましょう：

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

このクエリは、`UserId`がソートキーではないため、すべての9000万行をスキャンする必要があります（ただし高速です）。以前は、`PostId`のルックアップとして機能するマテリアライズドビューを使用してこれを解決しました。同じ問題はプロジェクションで解決できます。以下のコマンドは、`ORDER BY user_id`を持つプロジェクションを追加します。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

まずプロジェクションを作成し、次にそれをマテリアライズする必要があることに注意してください。この後者のコマンドにより、データは2つの異なる順序でディスク上に2回保存されます。プロジェクションは、以下に示すようにデータ作成時に定義することもでき、データが挿入されると自動的に維持されます。

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

プロジェクションが`ALTER`コマンドで作成される場合、`MATERIALIZE PROJECTION`コマンドが発行されると作成は非同期で行われます。ユーザーは次のクエリでこの操作の進行状況を確認でき、`is_done=1`になるまで待ちます。

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

上記のクエリを繰り返すと、追加のストレージを犠牲にしてパフォーマンスが大幅に向上していることがわかります。

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

[`EXPLAIN`コマンド](/sql-reference/statements/explain)を使用して、このクエリの処理にプロジェクションが使用されたことも確認できます：

```sql
EXPLAIN indexes = 1
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

```


┌─explain─────────────────────────────────────────────┐

1. │ Expression ((Projection + Before ORDER BY))         │
2. │   Aggregating                                       │
3. │   Filter                                            │
4. │           ReadFromMergeTree (comments&#95;user&#95;id)      │
5. │           Indexes:                                  │
6. │           PrimaryKey                                │
7. │           Keys:                                     │
8. │           UserId                                    │
9. │           Condition: (UserId in [8592047, 8592047]) │
10. │           Parts: 2/2                                │
11. │           Granules: 2/11360                         │
    └─────────────────────────────────────────────────────┘

11 行。経過時間: 0.004 秒。

```

### プロジェクションを使用する場合 {#when-to-use-projections}

プロジェクションは、データ挿入時に自動的にメンテナンスされるため、新規ユーザーにとって魅力的な機能です。さらに、クエリは単一のテーブルに送信するだけで済み、可能な場合はプロジェクションが自動的に活用されて応答時間が短縮されます。

<Image img={bigquery_7} size="md" alt="Projections"/>

これは、マテリアライズドビューとは対照的です。マテリアライズドビューでは、フィルタに応じて適切に最適化されたターゲットテーブルを選択するか、クエリを書き直す必要があります。これにより、ユーザーアプリケーション側の負担が増大し、クライアント側の複雑性が高まります。

これらの利点にもかかわらず、プロジェクションにはユーザーが認識すべき固有の制限があるため、慎重に使用する必要があります。詳細については、["マテリアライズドビュー vs プロジェクション"](/managing-data/materialized-views-versus-projections)を参照してください。

次の場合にプロジェクションの使用を推奨します:

- データの完全な並べ替えが必要な場合。プロジェクション内の式は理論的には`GROUP BY`を使用できますが、集計の維持にはマテリアライズドビューの方が効果的です。また、クエリオプティマイザは、単純な並べ替えを使用するプロジェクション(例: `SELECT * ORDER BY x`)を活用する可能性が高くなります。この式で列のサブセットを選択することで、ストレージ使用量を削減できます。
- ストレージ使用量の増加とデータを2回書き込むオーバーヘッドを許容できる場合。挿入速度への影響をテストし、[ストレージオーバーヘッドを評価](/data-compression/compression-in-clickhouse)してください。
```


## ClickHouseでBigQueryクエリを書き換える {#rewriting-bigquery-queries-in-clickhouse}

以下では、BigQueryとClickHouseを比較するクエリ例を示します。このリストは、ClickHouseの機能を活用してクエリを大幅に簡素化する方法を示すことを目的としています。ここでの例では、完全なStack Overflowデータセット(2024年4月まで)を使用しています。

**最も多くの閲覧数を獲得しているユーザー(10件以上の質問を持つ):**

_BigQuery_

<Image img={bigquery_8} size='sm' alt='BigQueryクエリの書き換え' border />

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

**最も多くの閲覧数を獲得しているタグ:**

_BigQuery_

<br />

<Image img={bigquery_9} size='sm' alt='BigQuery 1' border />

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

可能な限り、ClickHouseの集約関数を活用してください。以下では、[`argMax`関数](/sql-reference/aggregate-functions/reference/argmax)を使用して、各年で最も閲覧された質問を算出する例を示します。

_BigQuery_

<Image img={bigquery_10} border size='sm' alt='集約関数 1' />

<Image img={bigquery_11} border size='sm' alt='集約関数 2' />

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

17行のセット。経過時間: 0.225秒。処理行数: 2435万行、1.86 GB（毎秒1億799万行、8.26 GB/秒）
ピークメモリ使用量: 377.26 MiB。
```


## 条件式と配列 {#conditionals-and-arrays}

条件式関数と配列関数を使用することで、クエリを大幅に簡潔にできます。以下のクエリは、2022年から2023年にかけて増加率が最も高かったタグ(出現回数が10000回以上)を計算します。条件式、配列関数、および`HAVING`句と`SELECT`句でエイリアスを再利用できる機能により、ClickHouseのクエリがいかに簡潔になるかに注目してください。

_BigQuery_

<Image img={bigquery_12} size='sm' border alt='条件式と配列' />

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

5行が返されました。経過時間: 0.096秒。処理行数: 508万行、155.73 MB (5310万行/秒、1.63 GB/秒)
ピークメモリ使用量: 410.37 MiB。
```

以上で、BigQueryからClickHouseへ移行するユーザー向けの基本ガイドは終了です。BigQueryから移行するユーザーには、ClickHouseの高度な機能について詳しく学ぶために、[ClickHouseにおけるデータモデリング](/data-modeling/schema-design)のガイドをお読みいただくことをお勧めします。
