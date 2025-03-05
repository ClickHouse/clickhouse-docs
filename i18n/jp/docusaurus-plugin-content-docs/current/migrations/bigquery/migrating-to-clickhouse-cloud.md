---
title: BigQueryからClickHouse Cloudへの移行
slug: /migrations/bigquery/migrating-to-clickhouse-cloud
description: BigQueryからClickHouse Cloudへのデータ移行の方法
keywords: [移行, 移行作業, データ, ETL, ELT, BigQuery]
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

## なぜClickHouse Cloudを選ぶべきか？ {#why-use-clickhouse-cloud-over-bigquery}

TL;DR: ClickHouseは、現代のデータ分析においてBigQueryよりも速く、安価で、より強力だからです。

<br />

<img src={bigquery_2}
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />
## BigQueryからClickHouse Cloudへデータを読み込む {#loading-data-from-bigquery-to-clickhouse-cloud}
### データセット {#dataset}

BigQueryからClickHouse Cloudへの典型的な移行を示すためのサンプルデータセットとして、Stack Overflowデータセットを使用します。このデータセットには、2008年から2024年4月までにStack Overflowで発生したすべての `post`、`vote`、`user`、`comment`、および `badge` が含まれています。このデータのBigQueryスキーマは以下に示されています。

<br />

<img src={bigquery_3}
  class="image"
  alt="NEEDS ALT"
  style={{width: '1000px'}} />

<br />

このデータセットをBigQueryインスタンスに格納して移行手順をテストしたいユーザーのために、GCSバケットにParquet形式でこれらのテーブルのデータを提供しています。BigQueryでテーブルを作成しデータをロードするDDLコマンドは[こちら](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==)から入手できます。
### データの移行 {#migrating-data}

BigQueryとClickHouse Cloud間でのデータの移行は、主に2つのワークロードタイプに分類されます：

- **初回の一括ロードと定期的な更新** - 初回データセットを移行し、定期的な更新を設定された間隔で行う必要があります（例：毎日）。ここでの更新は、変更された行を再送信することで処理されます（例：日付など比較に使用できるカラムによって特定されます）。削除はデータセットの完全な定期的再読み込みによって処理されます。
- **リアルタイムレプリケーションまたはCDC** - 初回データセットを移行する必要があり、このデータセットの変更は数秒の遅延でClickHouseに反映される必要があります。これは効果的に[Change Data Capture (CDC)プロセス](https://en.wikipedia.org/wiki/Change_data_capture)であり、BigQueryのテーブルとClickHouseを同期させる必要があります。つまり、BigQueryテーブルでの挿入、更新、および削除を同等のClickHouseテーブルに適用する必要があります。
#### Google Cloud Storage (GCS)を介した一括ロード {#bulk-loading-via-google-cloud-storage-gcs}

BigQueryは、Googleのオブジェクトストレージ（GCS）へのデータのエクスポートをサポートしています。サンプルデータセットについては：

1. 7つのテーブルをGCSにエクスポートします。そのためのコマンドは[こちら](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==)で入手できます。

2. データをClickHouse Cloudにインポートします。その際、[gcsテーブル関数](/sql-reference/table-functions/gcs)を使用します。DDLおよびインポートクエリは[こちら](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==)で入手できます。ClickHouse Cloudインスタンスは複数のコンピュートノードで構成されているため、`gcs`テーブル関数の代わりに、[s3Clusterテーブル関数](/sql-reference/table-functions/s3Cluster)を使用しています。この関数はgcsバケットでも動作し、[ClickHouse Cloudサービスのすべてのノードを利用して](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers)データを並行してロードすることができます。

<br />

<img src={bigquery_4}
  class="image"
  alt="NEEDS ALT"
  style={{width: '600px'}} />

<br />

このアプローチにはいくつかの利点があります：

- BigQueryのエクスポート機能はデータのサブセットをエクスポートするためのフィルタをサポートしています。
- BigQueryは、[Parquet、Avro、JSON、CSV](https://cloud.google.com/bigquery/docs/exporting-data)形式およびいくつかの[圧縮タイプ](https://cloud.google.com/bigquery/docs/exporting-data)へのエクスポートをサポートしており、すべてClickHouseに対応しています。
- GCSは[オブジェクトライフサイクル管理](https://cloud.google.com/storage/docs/lifecycle)をサポートしており、ClickHouseにエクスポートおよびインポートされたデータを指定された期間後に削除することができます。
- [Googleは、1日あたり最大50TBをGCSに無料でエクスポートすることを許可しています](https://cloud.google.com/bigquery/quotas#export_jobs)。ユーザーはGCSのストレージにのみ料金を支払います。
- エクスポートは自動的に複数のファイルを生成し、各ファイルを最大1GBのテーブルデータに制限します。これはClickHouseにとって有益で、インポートを並行化することができます。

次の例を試す前に、ユーザーは[エクスポートに必要な権限](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions)および[ローカリティの推奨事項](https://cloud.google.com/bigquery/docs/exporting-data#data-locations)を確認し、エクスポートおよびインポートのパフォーマンスを最大化することをお勧めします。
### スケジュールクエリを介したリアルタイムレプリケーションまたはCDC {#real-time-replication-or-cdc-via-scheduled-queries}

Change Data Capture（CDC）は、2つのデータベース間でテーブルを同期させるプロセスです。更新と削除がリアルタイムで処理される必要がある場合、これはかなり複雑です。一つのアプローチは、BigQueryの[スケジュールクエリ機能](https://cloud.google.com/bigquery/docs/scheduling-queries)を使用して定期的なエクスポートをスケジュールすることです。ClickHouseへのデータ挿入にある程度の遅延を受け入れられるのであれば、このアプローチは実装とメンテナンスが容易です。具体例としては[このブログ投稿](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries)があります。
## スキーマの設計 {#designing-schemas}

Stack Overflowデータセットには、関連するテーブルがいくつか含まれています。最初にプライマリテーブルの移行に焦点を当てることをお勧めします。これは必ずしも最も大きなテーブルではなく、むしろ最も多くの分析クエリが受信されると予想されるテーブルです。これにより、主要なClickHouseの概念に慣れることができます。このテーブルは、追加のテーブルが追加されることでClickHouseの機能を最大限に活用し、最適なパフォーマンスを得るために再モデル化が必要となる場合があります。このモデリングプロセスについては、[データモデリングドキュメント](/data-modeling/schema-design#next-data-modelling-techniques)で詳しく説明しています。

この原則に従って、主要な `posts` テーブルに焦点を当てます。このテーブルのBigQueryスキーマは以下に示されています：

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

[ここで説明されているプロセス](/data-modeling/schema-design)を適用すると、以下のスキーマが得られます：

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

このテーブルに簡単な[`INSERT INTO SELECT`](/sql-reference/statements/insert-into)を使用して、gcsからエクスポートされたデータを読み込むことができます。ClickHouse Cloudでは、gcs互換の[`s3Cluster`テーブル関数](/sql-reference/table-functions/s3Cluster)を使用して、複数のノードでのロードを並行化できます：

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs( 'gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

新しいスキーマでは、nullを保持していません。上記の挿入は、暗黙的に各型のデフォルト値（整数の場合は0、文字列の場合は空の値）に変換されます。ClickHouseはまた、あらゆる数値をそのターゲット精度に自動的に変換します。
## ClickHouseの主キーはどのように異なるか？ {#how-are-clickhouse-primary-keys-different}

[ここで説明されているように](/migrations/bigquery)、BigQueryと同様に、ClickHouseはテーブルの主キー列値の一意性を強制しません。

BigQueryのクラスターと同様に、ClickHouseのテーブルのデータは主キー列によってディスクに順序付けられます。このソート順は、クエリオプティマイザによって利用され、再ソートを防ぎ、結合に必要なメモリ使用量を最小化し、制限句のショートサーキットを可能にします。
BigQueryとは異なり、ClickHouseは主キー列値に基づいて[sparseな主インデックス](/guides/best-practices/sparse-primary-indexes)を自動的に作成します。このインデックスは、主キー列にフィルタを含むすべてのクエリの実行を高速化するために使用されます。具体的には：

- メモリとディスクの効率は、ClickHouseがしばしば使用されるスケールでは最も重要です。データは、パーツとして知られるチャンクでClickHouseテーブルに書き込まれ、バックグラウンドでのマージに関するルールが適用されます。ClickHouseでは、各パーツには独自の主インデックスがあります。パーツがマージされると、マージされたパーツの主インデックスもマージされます。これらのインデックスは、各行ごとには作成されません。代わりに、パーツの主インデックスは、行のグループごとに1つのインデックスエントリを持ちます。この技術はスパースインデクシングと呼ばれます。
- スパースインデクシングが可能なのは、ClickHouseが指定されたキーによってディスク上の行を順序付けて格納しているからです。単一の行を直接見つけるのではなく（B-Treeベースのインデックスのように）、スパース主インデックスは、インデックスエントリ上での二分探索を介してクエリに一致する可能性のある行のグループを迅速に特定できるようにします。特定された可能性のある一致行のグループは、並行してClickHouseエンジンにストリーミングされて一致を見つけます。このインデックス設計により、主インデックスは小さく（メインメモリに完全に収まる）なりながら、クエリの実行時間を大幅に短縮することができます。特にデータ分析のユースケースで典型的な範囲クエリに対しては、さらにその効果が顕著です。詳細については、[この詳細なガイド](/guides/best-practices/sparse-primary-indexes)をお勧めします。

<br />

<img src={bigquery_5}
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

ClickHouseで選択された主キーは、インデックスだけでなく、データがディスクに書き込まれる順序も決定します。これにより、圧縮レベルに劇的に影響を与え、クエリパフォーマンスに影響を与えることがあります。ほとんどのカラムの値が連続して書き込まれる順序を引き起こす順序キーは、選択された圧縮アルゴリズム（およびコーデック）がデータをより効果的に圧縮できるようにします。

> テーブル内のすべてのカラムは、指定された順序キーの値に基づいてソートされます。これには、それ自体に含まれているかどうかにかかわらず。たとえば、`CreationDate`がキーとして使われる場合、他のすべてのカラムの値の順序は`CreationDate`カラムの値の順序に対応します。複数の順序キーを指定することができます。これにより、`SELECT`クエリの`ORDER BY`句と同じセマンティクスで順序付けられます。
### 順序キーの選択 {#choosing-an-ordering-key}

順序キーを選定する際の考慮事項とステップについては、`posts`テーブルを例に[こちら](https://data-modeling/schema-design#choosing-an-ordering-key)をご覧ください。
## データモデリング技術 {#data-modeling-techniques}

BigQueryから移行するユーザーは、[ClickHouseにおけるデータモデリングガイド](/data-modeling/schema-design)を読むことをお勧めします。このガイドでは、同じStack Overflowデータセットを使用し、ClickHouseの機能を活用した複数のアプローチを探ります。
### パーティション {#partitions}

BigQueryユーザーは、テーブルをパーティションに分割することで大規模データベースのパフォーマンスと管理性を向上させるテーブルパーティショニングの概念に慣れているでしょう。このパーティショニングは、指定されたカラムに基づいて範囲（例：日付）を使用するか、定義済みリスト、またはキーにハッシュを使用して達成できます。これにより、管理者は日付範囲や地理的位置などの特定の基準に基づいてデータを整理できます。

パーティショニングは、パーティションプルーニングを通じてより迅速なデータアクセスを可能にし、効率的なインデックス作成によってクエリパフォーマンスを改善するのに役立ちます。また、個々のパーティションではなく、テーブル全体ではなく、バックアップやデータ削除などのメンテナンスタスクを実施できるようになります。さらに、パーティショニングは、複数のパーティション間で負荷を分散させることで、BigQueryデータベースのスケーラビリティを大幅に向上させることができます。

ClickHouseでは、テーブルが最初に定義される際に[`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key)句を介してパーティショニングが指定されます。この句には、いかなるカラムのSQL式も含めることができ、その結果が行が送信されるパーティションを定義します。

<br />

<img src={bigquery_6}
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

データパーツは、ディスク上の各パーティションに論理的に関連づけられ、独立してクエリを実行できます。以下の例では、`CreationDate`を使用して年ごとに`posts`テーブルをパーティショニングします。この式は、ClickHouseへの行の挿入において、各行に対して評価されます。その結果、新たに追加されたデータパーツがそのパーティションに属する形でルーティングされます。

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

ClickHouseのパーティショニングには、BigQueryと同様のアプリケーションがありますが、いくつかの微妙な違いがあります。具体的には：

- **データ管理** - ClickHouseでは、ユーザーは主にパーティショニングをデータ管理機能と考えるべきです。キーに基づいて論理的にデータを分離することで、各パーティションは独立して操作できます（例：削除）。これにより、ユーザーはパーティションを効率的に移動し、サブセットを[ストレージ階層](/integrations/s3#storage-tiers)間で移動したり、[データを期限切れにしたり/クラスタから効率的に削除したり](https://sql-reference/statements/alter/partition)できます。例えば、2008年の投稿を削除する操作は以下のように行います：

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

- **クエリ最適化** - パーティションはクエリパフォーマンスを助ける可能性がありますが、これはアクセスパターンに大きく依存します。クエリが只に数個のパーティション（理想的には1つ）のみを対象にする場合、パフォーマンスは向上する可能性があります。しかし、パーティショニングキーが主キーに含まれている場合、その利点はほとんど存在しなくなります。特に多くのパーティションを対象とする必要があるクエリは、パーティショニングされていない場合よりもパフォーマンスが低下する可能性があります。また、パーティショニングは、[`GROUP BY`クエリの最適化](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)にも利用できる可能性があります。
#### 推奨事項 {#recommendations}

ユーザーは、データ管理技術としてパーティショニングを考慮すべきです。特に、時系列データを扱う場合、クラスターからデータを期限切れにする必要がある場合に理想的です。例えば、最も古いパーティションは[単純に削除する](https://sql-reference/statements/alter/partition#drop-partitionpart)ことができます。

重要: パーティショニングキーの式が高いカーディナリティのセットを生成しないことを確認してください。すなわち、100以上のパーティションを作成することは避けるべきです。例えば、クライアント識別子や名前のような高いカーディナリティのカラムでデータをパーティショニングしないでください。代わりに、`ORDER BY`式の最初のカラムにクライアント識別子または名前を指定します。

> 内部的に、ClickHouseは挿入されたデータに対して[パーツを作成](https://guides/best-practices/sparse-primary-indexes#clickhouse-index-design)します。データが挿入されるにつれて、パーツの数が増加します。クエリパフォーマンスが低下するほどの過剰なパーツの数を回避するために、パーツはバックグラウンドの非同期プロセスで統合されます。事前に設定された制限を超えると、ClickHouseは挿入時に["too many parts"エラー](https://knowledgebase/exception-too-many-parts)をスローします。これは通常の操作では発生せず、ClickHouseが正しく設定されていないか、誤って使用されている場合にのみ発生します（例：小さな挿入が多すぎる）。パーツは独立してパーティションごとに作成されるため、パーティションの数が増えるとパーツの数も増加します。高カーディナリティのパーティショニングキーは、このエラーを引き起こす可能性があるため、避けるべきです。
## マテリアライズドビューとプロジェクション {#materialized-views-vs-projections}

ClickHouseのプロジェクションの概念により、ユーザーはテーブルに複数の`ORDER BY`句を指定できます。

[ClickHouseデータモデリング](/data-modeling/schema-design)では、マテリアライズドビューを使用して、集計を事前計算し、行を変換し、異なるアクセスパターンに対するクエリを最適化する方法を探ります。この場合、マテリアライズドビューが異なる順序キーを持つターゲットテーブルに行を送信する例を[提供しました](/materialized-view/incremental-materialized-view#lookup-table)。

以下のクエリを考えます。

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

このクエリでは、`UserId`が順序キーでないため、90百万行すべてをスキャンする必要があります（迅速に行われるとはいえ）。以前は、`PostId`のルックアップとして動作するマテリアライズドビューを使用してこの問題を解決しました。同じ問題はプロジェクションでも解決できます。以下のコマンドでは、`ORDER BY user_id`のためのプロジェクションを追加します。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

注意: 最初にプロジェクションを作成し、次にそれをマテリアライズする必要があります。後者のコマンドは、データがディスクに2つの異なる順序で2回保存されることを引き起こします。データ作成時にプロジェクションを定義することもできます。そうすることで、データが挿入されるたびに自動的に維持されます。

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

プロジェクションを`ALTER`コマンドで作成した場合、作成時は非同期で、`MATERIALIZE PROJECTION`コマンドが発行された際に作成されます。ユーザーは、次のクエリでこの操作の進捗を確認し、`is_done=1`になるまで待つことができます。

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

上記のクエリを繰り返すと、ストレージの追加でパフォーマンスが大幅に改善されていることがわかります。

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

[`EXPLAIN`コマンド](/sql-reference/statements/explain)を使用して、このクエリがプロジェクションを使用したことも確認できます。

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

11 rows in set. Elapsed: 0.004 sec.
```
### プロジェクションを使用するタイミング {#when-to-use-projections}

プロジェクションは、新しいユーザーにとって魅力的な機能で、データが挿入される際に自動的に維持されます。さらに、クエリは単一のテーブルに送信され、プロジェクションが可能な限り活用され、応答時間を短縮します。

<br />

<img src={bigquery_7}
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

これは、ユーザーが適切な最適化されたターゲットテーブルを選択する必要があるマテリアライズドビューとは対照的です。これにより、ユーザーアプリケーションに対する重要性が増し、クライアント側の複雑さも増します。

これらの利点にもかかわらず、プロジェクションにはいくつかの固有の制限があります。ユーザーはこれらを把握し、慎重に展開する必要があります：

- プロジェクションは、ソーステーブルと（隠された）ターゲットテーブルに異なるTTLを使用することを許可しません。マテリアライズドビューは異なるTTLを許可します。
- プロジェクションは、（隠された）ターゲットテーブルに対して`optimize_read_in_order`を現在サポートしていません。
- プロジェクションを持つテーブルに対しては、軽量削除や更新がサポートされていません。
- マテリアライズドビューはチェーン化できます。1つのマテリアライズドビューのターゲットテーブルが別のマテリアライズドビューのソーステーブルになることが可能ですが、これはプロジェクションでは不可能です。
- プロジェクションは結合をサポートしませんが、マテリアライズドビューはサポートします。
- プロジェクションはフィルタ (`WHERE`句)をサポートしませんが、マテリアライズドビューはサポートします。

プロジェクションを使用することをお勧めするのは以下の場合です：

- データの完全な再配置が必要な場合。プロジェクションの式は理論的には`GROUP BY`を使うことができますが、集計を維持する場合はマテリアライズドビューの方が効果的です。クエリオプティマイザが、単純な再配置を利用したプロジェクションを利用する可能性が高くなります。つまり、`SELECT * ORDER BY x`とすることです。この式で列のサブセットを選択して、ストレージフットプリントを削減できます。
- ユーザーが、ストレージフットプリントの増加とデータの二重書き込みのオーバーヘッドを快く受け入れられる場合。挿入速度への影響をテストし、[ストレージのオーバーヘッドを評価](https://data-compression/compression-in-clickhouse)してください。
## BigQueryクエリをClickHouseで書き換える {#rewriting-bigquery-queries-in-clickhouse}

以下に、BigQueryとClickHouseを比較した例のクエリを示します。このリストは、ClickHouse機能を活用してクエリを大幅に簡素化する方法を示すことを目的としています。ここでの例は、完全なStack Overflowデータセット（2024年4月まで）を使用しています。

**（質問が10件以上の）最も多くのビューを受けたユーザー:**

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

**最も多くのビューを受けたタグは:**

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
## 集計関数 {#aggregate-functions}

可能な限り、ユーザーはClickHouseの集計関数を活用すべきです。以下に、[`argMax`関数](/sql-reference/aggregate-functions/reference/argmax)を使用して、毎年最も視聴された質問を計算する例を示します。

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
## Conditionals and Arrays {#conditionals-and-arrays}

条件付きおよび配列関数は、クエリを大幅に簡素化します。以下のクエリは、2022年から2023年にかけて最大の割合で増加したタグ（出現回数が10000を超えるもの）を計算します。条件付き、配列関数の活用、`HAVING`および`SELECT`句でのエイリアス再利用のおかげで、次の ClickHouse クエリは簡潔です。

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

5 行の結果。経過時間: 0.096 秒。5.08百万行を処理し、155.73 MB (53.10百万行/s., 1.63 GB/s.)。
ピークメモリ使用量: 410.37 MiB。
```

これで、BigQuery から ClickHouse に移行するユーザー向けの基本ガイドは終了です。BigQuery から移行するユーザーは、[ClickHouse でのデータモデリング](/data-modeling/schema-design) ガイドを読むことをお勧めします。これにより、ClickHouse の高度な機能についてさらに学ぶことができます。
