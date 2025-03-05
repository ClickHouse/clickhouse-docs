---
title: BigQuery から ClickHouse Cloud への移行
slug: /migrations/bigquery/migrating-to-clickhouse-cloud
description: BigQuery から ClickHouse Cloud へのデータ移行方法
keywords: [移行, 移行, 移行中, データ, etl, elt, BigQuery]
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

## なぜ ClickHouse Cloud を選ぶべきか？ {#why-use-clickhouse-cloud-over-bigquery}

要約：ClickHouse は、現代のデータ分析において BigQuery よりも高速で、安価で、強力だからです。

<br />

<img src={bigquery_2}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

## BigQuery から ClickHouse Cloud へのデータのロード {#loading-data-from-bigquery-to-clickhouse-cloud}
### データセット {#dataset}

BigQuery から ClickHouse Cloud への典型的な移行を示すために、[こちら](/getting-started/example-datasets/stackoverflow)で文書化されている Stack Overflow データセットを使用します。これは、2008年から2024年4月までに Stack Overflow で発生したすべての `post`、`vote`、`user`、`comment`、および `badge` を含みます。このデータの BigQuery スキーマは以下に示されています。

<br />

<img src={bigquery_3}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '1000px'}} />

<br />

このデータセットを BigQuery インスタンスに投入して移行手順をテストしたいユーザーには、GCS バケットに Parquet 形式でデータを提供し、テーブルを作成してロードするための DDL コマンドが[こちら](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==)にあります。

### データの移行 {#migrating-data}

BigQuery と ClickHouse Cloud の間でデータを移行するプロセスは、主に 2 つのワークロードタイプに分類されます：

- **初期バルクロードと定期的な更新** - 初期データセットをマイグレーションし、定期的に設定された間隔（例：日次）で更新を行う必要があります。ここでの更新は、変更があった行を再送信することで処理されます。これには比較に使用できるカラム（例：日付）を利用します。削除はデータセットの完全な定期リロードによって処理されます。
- **リアルタイムレプリケーションまたは CDC** - 初期データセットをマイグレーションし、このデータセットの変更を数秒の遅延で ClickHouse に反映させる必要があります。これは効果的に[変更データキャプチャ（CDC）プロセス](https://en.wikipedia.org/wiki/Change_data_capture)です。BigQuery のテーブルの挿入、更新、削除は、ClickHouse の同等のテーブルに適用される必要があります。

#### Google Cloud Storage (GCS) を介したバルクロード {#bulk-loading-via-google-cloud-storage-gcs}

BigQuery はデータを Google のオブジェクトストア（GCS）にエクスポートすることをサポートしています。私たちの例のデータセットについては：

1. 7 つのテーブルを GCS にエクスポートします。そのためのコマンドは[こちら](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==)にあります。

2. データを ClickHouse Cloud にインポートします。そのためには、[gcs テーブル関数](/sql-reference/table-functions/gcs)を使用できます。DDL とインポートクエリは[こちら](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==)にあります。ClickHouse Cloud インスタンスは複数の計算ノードから構成されるため、`gcs` テーブル関数の代わりに [s3Cluster テーブル関数](/sql-reference/table-functions/s3Cluster)を使用します。この関数は gcs バケットでも動作し、[ClickHouse Cloud サービスのすべてのノードを活用します](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers) 。

<br />

<img src={bigquery_4}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '600px'}} />

<br />

このアプローチにはいくつかの利点があります：

- BigQuery のエクスポート機能では、データのサブセットをエクスポートするためのフィルターをサポートしています。
- BigQuery は [Parquet、Avro、JSON、および CSV](https://cloud.google.com/bigquery/docs/exporting-data) 形式へのエクスポートをサポートしており、いくつかの[圧縮タイプ](https://cloud.google.com/bigquery/docs/exporting-data)が ClickHouse でサポートされています。
- GCS は [オブジェクトライフサイクル管理](https://cloud.google.com/storage/docs/lifecycle)をサポートしており、ClickHouse にエクスポートおよびインポートされたデータは、指定された期間後に削除できます。
- [Google は GCS に 50TB までを無料でエクスポートできる](https://cloud.google.com/bigquery/quotas#export_jobs)ため、ユーザーは GCS ストレージのみを支払います。
- エクスポートは自動的に複数のファイルを生成し、各ファイルは最大 1GB のテーブルデータに制限されます。これにより、ClickHouse でのインポートを並列化できます。

以下の例を試す前に、ユーザーは[エクスポートに必要な権限](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions)と[ローカリティの推奨事項](https://cloud.google.com/bigquery/docs/exporting-data#data-locations)を確認して、エクスポートとインポートのパフォーマンスを最大化することをお勧めします。

### スケジュールクエリを介したリアルタイムレプリケーションまたは CDC {#real-time-replication-or-cdc-via-scheduled-queries}

変更データキャプチャ（CDC）は、2 つのデータベース間のテーブルを同期させるプロセスです。これは、更新と削除をほぼリアルタイムで処理する必要がある場合、非常に複雑になります。1つのアプローチは、BigQuery の [スケジュールクエリ機能](https://cloud.google.com/bigquery/docs/scheduling-queries)を利用して定期エクスポートをスケジュールすることです。データを ClickHouse に挿入する際に若干の遅延を受け入れることができれば、このアプローチは実装とメンテナンスが容易です。例は、[このブログ投稿](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries)で示されています。

## スキーマの設計 {#designing-schemas}

Stack Overflow データセットには、多くの関連テーブルがあります。最初に主要なテーブルの移行に重点を置くことをお勧めします。これは必ずしも最も大きなテーブルである必要はなく、むしろ最も分析クエリが発生すると予想されるテーブルです。これにより、ClickHouse の主要な概念に慣れることができます。このテーブルは、追加のテーブルが追加されるにつれて完全に ClickHouse の機能を利用し、最適なパフォーマンスを得るために再設計が必要になる場合があります。このモデリングプロセスについては、[データモデリングの文書](/data-modeling/schema-design#next-data-modelling-techniques)で詳しく説明しています。

この原則に従い、主要な `posts` テーブルに焦点を当てます。このテーブルの BigQuery スキーマは以下に示されています：

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

[ここで説明されているプロセス](/data-modeling/schema-design)を適用することで、以下のスキーマが得られます：

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

このテーブルには、シンプルな [`INSERT INTO SELECT`](/sql-reference/statements/insert-into) を使用してデータを投入できます。GCS からのエクスポートデータを [`gcs` テーブル関数](/sql-reference/table-functions/gcs) を使用して読み取ります。ClickHouse Cloud では、GCS 互換の [`s3Cluster` テーブル関数](/sql-reference/table-functions/s3Cluster) を使用して、複数のノードにわたってローディングを並列化することもできます：

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs('gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

新しいスキーマでは、null 値は保持されません。上記の挿入はこれらをそれぞれの型のデフォルト値に暗黙的に変換します。整数の場合は 0、文字列の場合は空値になります。ClickHouse は任意の数値を自動的にターゲット精度に変換します。

## ClickHouse の主キーはどのように異なるか？ {#how-are-clickhouse-primary-keys-different}

[こちら](https://migrations/bigquery)で説明されているように、BigQuery と同様に、ClickHouse ではテーブルの主キー列の値の一意性を強制しません。

BigQuery のクラスタリングに似て、ClickHouse のテーブルのデータは主キー列によってディスクに順序付けて保存されます。このソート順は、クエリオプティマイザーによって利用され、再ソートを防ぎ、結合のメモリ使用量を最小限に抑え、制限条件に対してショートサーキットを可能にします。

BigQuery とは異なり、ClickHouse は主キー列の値に基づいて [（スパース）主インデックス](/guides/best-practices/sparse-primary-indexes) を自動的に作成します。このインデックスは、主キー列にフィルターを含むすべてのクエリを高速化するために使用されます。具体的には：

- メモリとディスクの効率が、ClickHouse がしばしば使用されるスケールにおいて非常に重要です。データは、部分として知られるチャンクで ClickHouse テーブルに書き込まれ、バックグラウンドで部分をマージするためのルールが適用されます。ClickHouse では、各部分に独自の主インデックスがあります。部分がマージされると、マージされた部分の主インデックスもマージされます。これらのインデックスは、各行に対して構築されるのではなく、部分の主インデックスは行のグループごとに 1 つのインデックスエントリを持ちます。この手法はスパースインデックスと呼ばれます。
- スパースインデックスが可能なのは、ClickHouse が指定されたキーによってディスク上に行を順序付けて保存するためです。単一行を直接位置指定するのではなく（B-Tree ベースのインデックスのように）、スパース主インデックスは、フィルターに一致する可能性のある行のグループを迅速に識別します（インデックスエントリに対する二分探索を介して）。識別された可能性のある一致する行のグループは、並行して ClickHouse エンジンにストリーミングされて一致を見つけます。このインデックス設計により、主インデックスは小さく（メインメモリに完全に収まります）、クエリ実行時間を大幅に短縮できます。特にデータ分析のユースケースで一般的に使用される範囲クエリの場合に有効です。詳細については、[この詳細ガイド](https://guides/best-practices/sparse-primary-indexes) をお勧めします。

<br />

<img src={bigquery_5}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

ClickHouse で選択された主キーは、インデックスだけでなく、ディスク上にデータが書き込まれる順序も決定します。このため、圧縮レベルに大きな影響を与え、これはクエリパフォーマンスに影響を与える可能性があります。ほとんどのカラムの値が連続して書き込まれる順序付けキーを使用すると、選択された圧縮アルゴリズム（およびコーデック）がデータをより効果的に圧縮できるようになります。

> テーブル内のすべてのカラムは、指定された順序付けキーの値に基づいてソートされます。テーブルキー自体に含まれているかどうかに関係ありません。たとえば、`CreationDate` がキーとして使用されている場合、他のすべてのカラムの値の順序は `CreationDate` カラムの値の順序に対応します。複数の順序付けキーを指定することも可能です - これは `SELECT` クエリの `ORDER BY` 句と同じ意味で順序づけられます。

### 順序付けキーの選択 {#choosing-an-ordering-key}

順序付けキーを選択する際の考慮事項とステップについては、`posts` テーブルを例に、[こちら](https://data-modeling/schema-design#choosing-an-ordering-key)を参照してください。

## データモデリング技術 {#data-modeling-techniques}

BigQuery から移行するユーザーには、[ClickHouse でのデータモデリングに関するガイド](/data-modeling/schema-design)を読むことをお勧めします。このガイドは、同じ Stack Overflow データセットを使用し、ClickHouse の機能を活用した複数のアプローチを検討しています。

### パーティション {#partitions}

BigQuery ユーザーは、大規模データベースのパフォーマンスと管理性を向上させるために、テーブルを「パーティション」と呼ばれる小さく、より管理しやすい部分に分割するテーブルのパーティショニングの概念に慣れているでしょう。このパーティショニングは、指定されたカラムに対する範囲（例：日付）、定義済みのリスト、またはキーに対するハッシュを使用して達成できます。これにより、管理者は日付範囲や地理的位置に基づいてデータを整理できます。

パーティショニングは、パーティションプルーニングを通じて、より高速なデータアクセスを可能にし、クエリパフォーマンスの向上に貢献します。また、バックアップやデータ削除などのメンテナンスタスクにも役立ち、テーブル全体ではなく個々のパーティションで操作を行うことができます。さらに、パーティショニングは、複数のパーティションに負荷を分散させることで、BigQuery データベースのスケーラビリティを大幅に向上させる可能性があります。

ClickHouse では、テーブルが初めて定義される際に [`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key) 句を使ってパーティショニングを指定します。この句には、行が送信されるパーティションを定義する SQL 式を含めることができます。

<br />

<img src={bigquery_6}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

データの部分はディスク上の各パーティションに論理的に関連付けられ、孤立してクエリを実行できます。以下の例では、`toYear(CreationDate)` の式を使用して年単位で `posts` テーブルをパーティション分けします。行が ClickHouse に挿入されると、この式が各行に対して評価され、行は新しいデータ部分が所属する結果のパーティションにルーティングされます。

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

ClickHouse におけるパーティショニングは、BigQuery におけるアプリケーションと似ていますが、いくつかの微妙な違いがあります。具体的には：

- **データ管理** - ClickHouse では、ユーザーは主にデータ管理機能としてパーティショニングを検討すべきであり、クエリ最適化技術とは考えないべきです。キーに基づいてデータを論理的に分けることで、各パーティションは独立して操作できます（例えば、削除）。これにより、ユーザーはパーティションを移動し、したがってサブセットを[ストレージティア](/integrations/s3#storage-tiers)の間で効率的に移動できます。例として、以下では 2008年の投稿を削除します：

```sql
SELECT DISTINCT partition
FROM system.parts
WHERE `table` = 'posts'

┌─partition─┐
│ 2008  	│
│ 2009  	│
│ 2010  	│
│ 2011  	│
│ 2012  	│
│ 2013  	│
│ 2014  	│
│ 2015  	│
│ 2016  	│
│ 2017  	│
│ 2018  	│
│ 2019  	│
│ 2020  	│
│ 2021  	│
│ 2022  	│
│ 2023  	│
│ 2024  	│
└───────────┘

17 rows in set. Elapsed: 0.002 sec.

	ALTER TABLE posts
	(DROP PARTITION '2008')

Ok.

0 rows in set. Elapsed: 0.103 sec.
```

- **クエリ最適化** - パーティションはクエリパフォーマンスに役立ちますが、これはアクセスパターンに大きく依存します。クエリがごく少数のパーティション（理想的には 1 つ）をターゲットにする場合、パフォーマンスが向上する可能性があります。これは、パーティショニングキーが主キーに含まれていない場合にのみ通常有用です。しかし、多くのパーティションをカバーする必要があるクエリは、パーティショニングを使用しない場合よりもパフォーマンスが低下する可能性があります（パーティショニングの結果として部分が多くなる可能性があるため）。単一のパーティションをターゲットにする利点は、特にそのパーティションキーがすでに主キーに早期に存在する場合にはほとんどなくなります。パーティショニングは、各パーティションの値がユニークである場合に[GROUP BYクエリを最適化するために使用](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)できます。しかし、一般的にはユーザーは主キーが最適化されていることを確認し、特定の予測可能なサブセットにアクセスするパターンがある場合を除いてはクエリ最適化手法としてパーティショニングを考慮すべきです。例えば、日単位でのパーティショニングは、ほとんどのクエリが前日である場合に有効です。

#### 推奨事項 {#recommendations}

ユーザーは、パーティショニングをデータ管理技術と考慮すべきです。特に、時系列データの操作においてクラスターからデータを期限切れにする必要がある場合、古いパーティションを[単純に削除する](/sql-reference/statements/alter/partition#alter_drop-partition)ことができます。

重要：パーティショニングキーの式が高いカーディナリティセットを生成しないようにしてください。すなわち、100 を超えるパーティションの作成は避けるべきです。例えば、クライアントの識別子や名前などの高いカーディナリティのカラムでデータをパーティショニングしないでください。その代わりに、クライアントの識別子や名前を `ORDER BY` 式の最初のカラムにしてください。

> 内部的に ClickHouse は、挿入されたデータのために[部分を作成します](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)。データの挿入が増えると、パーツの数は増加します。クエリパフォーマンスを低下させる過剰な数のパーツを防ぐために、パーツはバックグラウンドの非同期プロセスでマージされます。パーツの数が[予め設定された制限](/operations/settings/merge-tree-settings#parts-to-throw-insert)を超えると、ClickHouse は挿入時に["too many parts"エラー](https://knowledgebase/exception-too-many-parts)として例外を投げます。これは通常の操作下では発生しないはずで、ClickHouse が誤って設定されているか間違って使用されている場合にのみ発生します。多くの小さな挿入が行われた場合などです。パーツはパーティションごとに孤立して作成されるため、パーティションの数を増やすとパーツの数も増加します。したがって、高カーディナリティパーティショニングキーはこのエラーを引き起こす可能性があり、避けるべきです。

## マテリアライズドビューとプロジェクション {#materialized-views-vs-projections}

ClickHouse のプロジェクションの概念により、ユーザーはテーブルに対して複数の `ORDER BY` 句を指定できます。

[ClickHouse データモデリング](/data-modeling/schema-design)では、マテリアライズドビューを使用して集約を事前計算したり、行を変換したり、さまざまなアクセスパターンに対してクエリを最適化したりする方法を探ります。後者については、マテリアライズドビューが異なる順序キーを持つターゲットテーブルに行を送信する例が[こちら](/materialized-view/incremental-materialized-view#lookup-table)に示されています。

たとえば、次のクエリを考えてみましょう：

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
   │ 0.18181818181818182  │
   └────────────────────┘

1 row in set. Elapsed: 0.040 sec. Processed 90.38 million rows, 361.59 MB (2.25 billion rows/s., 9.01 GB/s.)
Peak memory usage: 201.93 MiB.
```

このクエリは、`UserId` が順序キーではないため、90m のすべての行をスキャンする必要があります（速くはありますが）。以前は、`PostId` のルックアップとして機能するマテリアライズドビューを使用してこれを解決しました。同じ問題はプロジェクションを使用して解決できます。以下のコマンドは、`ORDER BY user_id` 用のプロジェクションを追加します。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

注意：プロジェクションを最初に作成し、次にそれをマテリアライズする必要があります。この後者のコマンドは、データが2つの異なる順序でディスクに保存されることを意味します。データが作成される際にプロジェクションを自動的に保守することもできます。以下に示すように、データが作成される際にプロジェクションが定義されます。

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

プロジェクションが `ALTER` コマンドを介して作成された場合、その作成は非同期です。その後 `MATERIALIZE PROJECTION` コマンドが発行されます。ユーザーは次のクエリを使用してこの操作の進捗を確認でき、`is_done=1` を待ちます。

```sql
SELECT
	parts_to_do,
	is_done,
	latest_fail_reason
FROM system.mutations
WHERE (`table` = 'comments') AND (command LIKE '%MATERIALIZE%')

   ┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
1. │       	1 │   	0 │                	│
   └─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

上記のクエリを繰り返すと、パフォーマンスの向上が見られ、追加のストレージが必要になります。

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

[`EXPLAIN` コマンド](/sql-reference/statements/explain)を使用して、プロジェクションがこのクエリを提供するために使用されたことを確認します：

```sql
EXPLAIN indexes = 1
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

	┌─explain─────────────────────────────────────────────┐
 1. │ Expression ((Projection + Before ORDER BY))     	│
 2. │   Aggregating                                   	│
 3. │ 	Filter                                      	│
 4. │   	ReadFromMergeTree (comments_user_id)      	│
 5. │   	Indexes:                                  	│
 6. │     	PrimaryKey                              	│
 7. │       	Keys:                                 	│
 8. │         	UserId                              	│
 9. │       	Condition: (UserId in [8592047, 8592047]) │
10. │       	Parts: 2/2                            	│
11. │       	Granules: 2/11360                     	│
	└─────────────────────────────────────────────────────┘

11行が設定されました。経過時間: 0.004秒。
```

### プロジェクションを使用する際の注意点 {#when-to-use-projections}

プロジェクションは、自動的にデータが挿入される際に維持されるため、新しいユーザーにとって魅力的な機能です。さらに、クエリは、プロジェクションが可能な限り利用される単一のテーブルに送信されることができますので、応答時間の短縮が可能です。

<br />

<img src={bigquery_7}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

これは、ユーザーが適切な最適化されたターゲットテーブルを選択したり、フィルタによってクエリを再作成したりする必要があるマテリアライズドビューとは対照的です。これにより、ユーザーアプリケーションへの重点が大きくなり、クライアント側の複雑さが増します。

これらの利点にもかかわらず、プロジェクションにはユーザーが認識しておくべきいくつかの内在的な制限があり、したがって控えめに展開するべきです：

- プロジェクションは、ソーステーブルと（隠し）のターゲットテーブルで異なる TTL を使用することを許可していません。マテリアライズドビューは異なる TTL を許可します。
- プロジェクションは、（隠し）ターゲットテーブルのために `optimize_read_in_order` を現在サポートしていません。
- プロジェクションを持つテーブルでは、軽量な更新と削除はサポートされていません。
- マテリアライズドビューは連鎖的に使用できます。1 つのマテリアライズドビューのターゲットテーブルが他のマテリアライズドビューのソーステーブルになり得るのに対して、プロジェクションではこれを行うことができません。
- プロジェクションは結合をサポートしていませんが、マテリアライズドビューはサポートしています。
- プロジェクションはフィルター（`WHERE` 句）をサポートしていませんが、マテリアライズドビューはサポートしています。

次のような場合にはプロジェクションを使用することをお勧めします：

- データの完全な再順序化が必要な場合。プロ젝ションの式で `GROUP BY` を理論的に使用することは可能ですが、マテリアライズドビューは集計を維持するためにより効果的です。クエリオプティマイザーは、`SELECT * ORDER BY x` のような単純な再順序を使用するプロジェクションを利用しやすいです。ユーザーは、この式でカラムのサブセットを選択してストレージフットプリントを減少させることができます。
- 追加のストレージフットプリントとデータを 2 回書き込むためのオーバーヘッドに関連することに慣れている場合。挿入速度への影響をテストし、[ストレージのオーバーヘッドを評価](https://data-compression/compression-in-clickhouse)してください。

## BigQuery のクエリを ClickHouse で書き換え {#rewriting-bigquery-queries-in-clickhouse}

以下は、BigQuery と ClickHouse を比較したサンプルクエリです。このリストは、ClickHouse の機能を利用してクエリを大幅に簡素化できる方法を示すことを目的としています。ここでの例は、全ての Stack Overflow データセット（2024 年 4 月まで）を使用しています。

**最も多くのビューを受けるユーザー（質問が 10 件以上）:**

_BigQuery_

<img src={bigquery_8}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '500px'}} />

<br />

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

**最も多くのビューを受けるタグ:**

_BigQuery_

<br />

<img src={bigquery_9}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '400px'}} />

<br />

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

可能な場合は、ユーザーは ClickHouse の集約関数を利用すべきです。以下では、[`argMax` 関数](/sql-reference/aggregate-functions/reference/argmax) を使用して、各年の最もビューされた質問を計算する方法を示します。

_BigQuery_

<br />

<img src={bigquery_10}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '500px'}} />

<br />

<img src={bigquery_11}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '500px'}} />

<br />

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

…

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
## 条件式と配列 {#conditionals-and-arrays}

条件式と配列関数を使用すると、クエリが大幅に簡素化されます。次のクエリは、2022年から2023年にかけて最も大きな割合で増加したタグ（出現回数が10,000回以上のもの）を計算します。条件式、配列関数、`HAVING`および `SELECT` 節でのエイリアス再利用の能力により、以下の ClickHouse クエリが簡潔であることに注目してください。

_BigQuery_

<br />

<img src={bigquery_12}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '500px'}} />

<br />

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
│ next.js   │   13788 │     10520 │   31.06463878326996 │
│ spring-boot │     16573 │     17721 │  -6.478189718413183 │
│ .net      │   11458 │     12968 │ -11.644046884639112 │
│ azure     │   11996 │     14049 │ -14.613139725247349 │
│ docker    │   13885 │     16877 │  -17.72826924216389 │
└─────────────┴────────────┴────────────┴─────────────────────┘

5 行がセットされました。経過時間: 0.096 秒。5.08百万行、155.73 MB（53.10百万行/秒、1.63 GB/秒）が処理されました。
ピークメモリ使用量: 410.37 MiB.
```

これで、BigQuery から ClickHouse に移行するユーザーのための基本ガイドは終了です。BigQuery から移行するユーザーには、ClickHouse の高度な機能についてさらに学ぶために [ClickHouse におけるデータモデリング](/data-modeling/schema-design) のガイドを読むことをお勧めします。
