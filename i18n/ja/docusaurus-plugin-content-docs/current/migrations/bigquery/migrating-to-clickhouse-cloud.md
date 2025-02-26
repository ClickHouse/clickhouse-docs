---
title: BigQueryからClickHouse Cloudへの移行
slug: /migrations/bigquery/migrating-to-clickhouse-cloud
description: BigQueryからClickHouse Cloudにデータを移行する方法
keywords: [移行, マイグレーション, データ, ETL, ELT, BigQuery]
---

## BigQueryよりClickHouse Cloudを選ぶ理由は？ {#why-use-clickhouse-cloud-over-bigquery}

TLDR: ClickHouseは現代のデータ分析において、BigQueryよりも速く、安価で、より強力だからです：

<br />

<img src={require('../images/bigquery-2.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

## BigQueryからClickHouse Cloudへのデータのロード {#loading-data-from-bigquery-to-clickhouse-cloud}

### データセット {#dataset}

BigQueryからClickHouse Cloudへの典型的なマイグレーションを示す例データセットとして、[こちら](https://stackoverflow.com/)に文書化されているStack Overflowデータセットを使用します。これは、2008年から2024年4月までの間にStack Overflowで発生したすべての`post`、`vote`、`user`、`comment`、および`badge`を含んでいます。このデータのBigQueryスキーマは以下の通りです：

<br />

<img src={require('../images/bigquery-3.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '1000px'}} />

<br />

このデータセットをBigQueryインスタンスに入れてマイグレーション手順をテストしたいユーザー向けに、Parquet形式でGCSバケットにテーブル用データを提供しています。また、BigQueryでテーブルを作成し、データをロードするためのDDLコマンドも[こちら](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==)で入手できます。

### データの移行 {#migrating-data}

BigQueryとClickHouse Cloud間のデータの移行は、2つの主なワークロードタイプに分類されます：

- **初期の一括ロードと定期的な更新** - 初期データセットは移行され、定期的な更新が一定の間隔（例：毎日）で行われる必要があります。ここでの更新は、変更された行を再送信することによって処理されます - 比較に使えるカラム（例：日付）によって特定されます。削除はデータセット全体の定期的な再ロードで処理されます。
- **リアルタイムレプリケーションまたはCDC** - 初期データセットは移行される必要があります。このデータセットへの変更は、数秒の遅延でClickHouseに反映される必要があります。これは、実質的には[変更データキャプチャ（CDC）プロセス](https://en.wikipedia.org/wiki/Change_data_capture)であり、BigQueryのテーブルの挿入、更新、削除がClickHouseの同等のテーブルに適用されなければなりません。

#### Google Cloud Storage（GCS）経由のバルクローディング {#bulk-loading-via-google-cloud-storage-gcs}

BigQueryはGoogleのオブジェクトストア（GCS）へのデータエクスポートをサポートしています。例データセットに対して：

1. 7つのテーブルをGCSにエクスポートします。そのためのコマンドは[こちら](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==)で入手できます。

2. データをClickHouse Cloudにインポートします。そのためには、[gcsテーブル関数](/sql-reference/table-functions/gcs)を使用できます。DDLおよびインポートクエリは[こちら](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==)で入手できます。ClickHouse Cloudインスタンスは複数のコンピュートノードで構成されるため、`gcs`テーブル関数の代わりに、[s3Clusterテーブル関数](/sql-reference/table-functions/s3Cluster)を使用しています。この関数はGCSバケットでも機能し、[ClickHouse Cloudサービスの全ノードを利用して](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers)データを並行してロードすることができます。

<br />

<img src={require('../images/bigquery-4.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '600px'}} />

<br />

このアプローチにはいくつかの利点があります：

- BigQueryのエクスポート機能は、データのサブセットをエクスポートするためのフィルタをサポートしています。
- BigQueryは、[Parquet、Avro、JSON、CSV](https://cloud.google.com/bigquery/docs/exporting-data)形式およびいくつかの[圧縮タイプ](https://cloud.google.com/bigquery/docs/exporting-data)をサポートしています - すべてClickHouseによってサポートされています。
- GCSは[オブジェクトライフサイクル管理](https://cloud.google.com/storage/docs/lifecycle)をサポートし、ClickHouseにエクスポートされたデータを指定された期間後に削除できます。
- [Googleは、GCSに1日あたり最大50TBを無料でエクスポートすることを許可しています](https://cloud.google.com/bigquery/quotas#export_jobs)。ユーザーはGCSストレージのみを支払います。
- エクスポートは自動的に複数のファイルを生成し、各ファイルを最大1GBのテーブルデータに制限します。これは、ClickHouseのインポートを並列にすることを可能にするため、有益です。

以下の例を試す前に、ユーザーには[エクスポートに必要な権限](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions)および[ローカリティ推奨](https://cloud.google.com/bigquery/docs/exporting-data#data-locations)を確認し、エクスポートおよびインポートのパフォーマンスを最大化することを推奨します。

### スケジュールされたクエリを通じたリアルタイムレプリケーションまたはCDC {#real-time-replication-or-cdc-via-scheduled-queries}

変更データキャプチャ（CDC）は、2つのデータベース間でテーブルを同期させるプロセスです。更新と削除をほぼリアルタイムで処理する場合、これはかなり複雑になります。一つのアプローチは、BigQueryの[スケジュールクエリ機能](https://cloud.google.com/bigquery/docs/scheduling-queries)を使用して、定期的なエクスポートをスケジュールすることです。ClickHouseにデータが挿入されるまでの遅延を受け入れられる場合、このアプローチは実装と維持が容易です。例については[この記事](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries)を参照してください。

## スキーマの設計 {#designing-schemas}

Stack Overflowデータセットには、多くの関連テーブルが含まれています。最初にプライマリテーブルの移行に焦点を当てることを推奨します。これが必ずしも最大のテーブルである必要はありませんが、最も分析クエリを受けると予想されるテーブルです。これにより、ClickHouseの主要な概念に慣れることができます。このテーブルは、ClickHouseの機能を最大限に活用し、最適なパフォーマンスを得るために、他のテーブルが追加されると再構築が必要になる場合があります。このモデリングプロセスについては、[データモデリングドキュメント](/data-modeling/schema-design#next-data-modelling-techniques)で探求しています。

この原則を遵守し、メインの`posts`テーブルに焦点を当てます。このテーブルのBigQueryスキーマは以下の通りです：

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

[ここで説明されたプロセス](/data-modeling/schema-design)を適用すると、次のスキーマが得られます：

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

このテーブルには、[`INSERT INTO SELECT`](/sql-reference/statements/insert-into)を使用して簡単にデータを挿入できます。GCSからエクスポートされたデータを[`gcs`テーブル関数](/sql-reference/table-functions/gcs)を使用して読み込みます。ClickHouse Cloudでは、`s3Cluster`テーブル関数を使用して、複数のノードでロードを並行化できます：

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs( 'gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

新しいスキーマでは、NULLを保持しません。上記の挿入は、これらをそれぞれの型のデフォルト値に暗黙的に変換します - 整数の場合は0、文字列の場合は空値です。ClickHouseはまた、数値を自動的にターゲット精度に変換します。

## ClickHouseの主キーはどのように異なるのか？ {#how-are-clickhouse-primary-keys-different}

[ここで説明されているように](/migrations/bigquery)、BigQueryと同様に、ClickHouseではテーブルの主キー列の値の一意性を強制しません。

ClickHouseのテーブルのデータは、主キー列でディスクに順序付けされて保存されます。これは、クエリオプティマイザによって利用され、再ソートを防ぎ、ジョインのメモリ使用量を最小限に抑え、リミット句のショートサーキットを可能にします。
BigQueryとは異なり、ClickHouseは主キー列の値に基づいて[sparseな主インデックス](/optimize/sparse-primary-indexes)を自動的に作成します。このインデックスは、主キー列にフィルタが含まれるすべてのクエリの速度向上に使用されます。具体的には：

- メモリとディスクの効率は、ClickHouseがしばしば使用されるスケールにとって極めて重要です。データはパーツとして知られるチャンクに分けてClickHouseテーブルに書き込まれ、バックグラウンドでパーツをマージするためのルールが適用されます。ClickHouseでは、各パートに独自の主インデックスがあります。パーツがマージされると、マージされたパーツの主インデックスもマージされます。これらのインデックスは各行のために構築されているわけではありません。代わりに、パートの主インデックスは行のグループごとに1つのインデックスエントリを持ちます - この手法はスパースインデキシングと呼ばれます。
- スパースインデキシングが可能なのは、ClickHouseがパートの行を指定されたキーに従ってディスクに順序付けて保存するからです。単一の行を直接特定するのではなく（Bツリーに基づくインデックスのように）、スパース主インデックスは、インデックスエントリのバイナリサーチを介してクエリに一致する可能性のある行のグループを迅速に特定することを可能にします。特定された行のグループは、並行してClickHouseエンジンにストリーミングされ、マッチを見つけます。このインデックス設計により、主インデックスは小さく（メインメモリに完全に収まる）、特にデータ分析の使用ケースで一般的な範囲クエリのクエリ実行時間を大幅に短縮できます。詳細については、[この詳細ガイド](/optimize/sparse-primary-indexes)を推奨します。

<br />

<img src={require('../images/bigquery-5.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

ClickHouseで選択された主キーは、インデックスだけでなく、ディスク上にデータが書き込まれる順序も決定します。これにより、圧縮レベルに大きな影響があり、クエリパフォーマンスにも影響を与える可能性があります。大半のカラムの値が連続して書き込まれるような順序キーは、選択された圧縮アルゴリズム（およびコーデック）がデータをより効果的に圧縮することを可能にします。

> テーブル内のすべてのカラムは、指定された順序キーの値に基づいてソートされます。それがキー自体に含まれているかどうかに関係なく。たとえば、`CreationDate`がキーとして使用される場合、他のすべてのカラムの値の順序は`CreationDate`カラムの値の順序に対応します。複数の順序キーを指定することも可能であり、これは`SELECT`クエリの`ORDER BY`句と同じ意味論で順序付けを行います。

### 順序キーの選択 {#choosing-an-ordering-key}

順序キーの選択に関する考慮事項と手順については、`posts`テーブルを例にして[こちら](https://data-modeling/schema-design#choosing-an-ordering-key)をご覧ください。

## データモデリング技法 {#data-modeling-techniques}

BigQueryから移行するユーザーは、[ClickHouseにおけるデータモデリングのガイド](/data-modeling/schema-design)を読むことを推奨します。このガイドでは、同じStack Overflowデータセットを使用し、ClickHouseの機能を利用した複数のアプローチを探求しています。

### パーティション {#partitions}

BigQueryユーザーは、大規模データベースのパフォーマンスと管理を向上させるためにテーブルをパーティションという小さく管理しやすい部分に分割する概念に親しんでいます。このパーティション化は、指定されたカラムに対する範囲（例：日付）、定義済みリスト、またはキーに対するハッシュを使用して達成できます。これにより、管理者は日付範囲や地理的ロケーションといった特定の基準に基づいてデータを整理することができます。

パーティション化は、パーティションプルーニングを介してデータアクセスを迅速化し、より効率的なインデックス付けを可能にすることでクエリパフォーマンスを改善します。また、個々のパーティションに対する操作（バックアップやデータのピュアリングなど）を許可することにより、全体のテーブルではなく個別のパーティションでメンテナンスタスクを簡素化するのにも役立ちます。さらに、パーティション化により、複数のパーティションに負荷を分散させることによってBigQueryデータベースのスケーラビリティを大幅に向上させることができます。

ClickHouseでは、パーティション化は、テーブルが最初に定義される際に[`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key)句で指定されます。この句には、行がどのパーティションに送られるかを定義するSQL式を含めることができます。

<br />

<img src={require('../images/bigquery-6.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

データパーツはディスク上の各パーティションに論理的に関連付けられ、孤立してクエリされることができます。以下の例では、[`toYear(CreationDate)`](/sql-reference/functions/date-time-functions#toyear)式を使用して、年ごとに`posts`テーブルをパーティション分けします。行がClickHouseに挿入されると、この式は各行に対して評価され、行は結果のパーティションに新しいデータパーツとしてルーティングされます。

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

ClickHouseにおけるパーティション化の用途はBigQueryと似ていますが、いくつかの微妙な違いがあります。具体的には：

- **データ管理** - ClickHouseでは、ユーザーは主にデータ管理機能としてパーティション化を考慮すべきです。キーに基づいて論理的にデータを分離することで、各パーティションは独立して操作できる（例：削除可能）ようになります。これにより、ユーザーはパーティションを移動したり、パーティション間で[ストレージ階層](/integrations/s3#storage-tiers)を効率的に移動させたり、データを[有効期限切れにしたり/集群から効率的に削除したり](/sql-reference/statements/alter/partition)できます。以下の例では、2008年の投稿を削除しています：

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

- **クエリの最適化** - パーティションがクエリパフォーマンスを助けることはありますが、これはアクセスパターンに大きく依存します。もしクエリが特定のパーティション（理想的には1つ）をターゲットにする場合、パフォーマンスが向上する可能性があります。これは主に、パーティションキーが主キーに含まれておらず、フィルタリングに使用されている場合に限ります。逆に、多くのパーティションをカバーする必要があるクエリは、パーティションなしの場合よりもパフォーマンスが悪化する可能性があります（パーティション化の結果、パーツが増える可能性があるため）。特定のパーティションをターゲットにする利点は、パーティションキーがすでに主キーの先頭にある場合は、ほとんど無いか、全くないでしょう。パーティションは[cGROUP BYクエリの最適化](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)にも使用できますが、各パーティションの値がユニークである必要があります。ただし、一般的に、ユーザーは主キーが最適化されていることを確認し、例外的な場合にのみ、特定の予測可能なサブセットにアクセスパターンがある場合にパーティション化をクエリ最適化技術として考慮するべきです（例えば、日や、ほとんどのクエリが昨日に実行される場合のように）。

#### 推奨事項 {#recommendations}

ユーザーは、データ管理技術としてパーティション化を考慮すべきです。特に、時系列データを扱う場合に、クラスターからデータを有効期限切れにする必要がある時に最適です。最も古いパーティションは[単に削除でき](https://sql-reference/statements/alter/partition#alter_drop-partition)ます。

重要なこと：パーティションキーの式が高カーディナリティの集合を生成しないようにしてください。すなわち、100以上のパーティションを作成することは避けるべきです。たとえば、クライアント識別子や名前などの高カーディナリティ列でデータをパーティション化しないでください。代わりに、クライアント識別子や名前を`ORDER BY`式の最初の列として指定してください。

> 内部的に、ClickHouseは挿入されたデータのために[パーツ](/optimize/sparse-primary-indexes#clickhouse-index-design)を作成します。データが挿入されるたびに、パーツの数は増加します。クエリパフォーマンスを低下させるほどの過剰なパーツ数を防ぐために、背景の非同期プロセスでパーツがマージされます。パーツの数が[事前に設定された制限](https://operations/settings/merge-tree-settings#parts-to-throw-insert)を超えると、ClickHouseは挿入時に["too many parts"エラー](https://docs/knowledgebase/exception-too-many-parts)を発生させます。これは通常の操作中には発生せず、ClickHouseが誤って構成されているか、誤って使用されている場合（例えば、多くの小さな挿入など）にのみ発生します。パーツはパーティションごとに独立して作成されるため、パーティションの数が増えると、パーツの数も増加します。高カーディナリティのパーティションキーはこのエラーを引き起こす可能性があるため、避けるべきです。

## マテリアライズドビュー対プロジェクション {#materialized-views-vs-projections}

ClickHouseのプロジェクションの概念は、ユーザーがテーブルに対して複数の`ORDER BY`句を指定できることを可能にします。

[ClickHouseデータモデリング](/data-modeling/schema-design)では、マテリアライズドビューを使用して集約を事前計算し、行を変換し、さまざまなアクセスパターンのためにクエリを最適化する方法を探求します。後者については、[こちらで例を提供しました](/materialized-view#lookup-table)があり、マテリアライズドビューが挿入を受け取る元のテーブルとは異なる順序キーを持つターゲットテーブルに行を送信します。

例えば、以下のクエリを考えてみてください：

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

このクエリは、90m行すべてをスキャンする必要があります（確かに迅速に）、`UserId`が順序キーでないためです。以前、これを`PostId`のルックアップとして機能するマテリアライズドビューを使用して解決しました。プロジェクションでも同じ問題を解決できます。以下のコマンドは、`ORDER BY user_id`のプロジェクションを追加します。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

プロジェクションを作成した後、最初に作成し、次にマテリアライズする必要があります。この後者のコマンドは、データが異なる順序でディスクに2回保存されることを引き起こします。プロジェクションは、データが作成されるときに定義することもでき、以下のように、データが挿入されるたびに自動的に維持されます。

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

プロジェクションが`ALTER`コマンドを介して作成された場合、`MATERIALIZE PROJECTION`コマンドが発行されると、作成は非同期になります。ユーザーは以下のクエリでこの操作の進捗状況を確認でき、`is_done=1`を待機します。

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

上記のクエリを繰り返すと、追加のストレージを代償にパフォーマンスが大幅に改善されていることがわかります。

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

[`EXPLAIN`コマンド](/sql-reference/statements/explain)を使用して、プロジェクションがこのクエリに使用されていることも確認できます：

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

### プロジェクションを使用する際の注意点 {#when-to-use-projections}

プロジェクションは新しいユーザーにとって魅力的な機能で、自動的にデータが挿入されると維持されます。さらに、すべてのクエリを単一のテーブルに送り、プロジェクションを活用して応答時間を短縮することができます。

<br />

<img src={require('../images/bigquery-7.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

これは、マテリアライズドビューとは対照的で、ユーザーが適切な最適化されたターゲットテーブルを選択するか、フィルターに応じてクエリを書き換える必要があります。これにより、ユーザアプリケーションに対する重要性が高まり、クライアント側の複雑さが増加します。

これらの利点にもかかわらず、プロジェクションにはユーザーが認識すべきいくつかの固有の制限があり、慎重に展開する必要があります：

- プロジェクションでは、ソーステーブルと（隠された）ターゲットテーブルに対して異なるTTLを使用できません。マテリアライズドビューは異なるTTLを許容します。
- プロジェクションは（隠された）ターゲットテーブルに対する`optimize_read_in_order`を現在サポートしていません。
- プロジェクションを持つテーブルでは軽量削除および更新はサポートされていません。
- マテリアライズドビューはチェーン化でき、1つのマテリアライズドビューのターゲットテーブルが別のマテリアライズドビューのソーステーブルになることができます。これはプロジェクションでは実行できません。
- プロジェクションは結合をサポートしていませんが、マテリアライズドビューはサポートしています。
- プロジェクションはフィルター（`WHERE`句）をサポートしていませんが、マテリアライズドビューはサポートしています。

プロジェクションを使用することをお勧めするのは、以下の場合です：

- データの完全な順序変更が必要な場合。プロジェクションの式は、理論的には`GROUP BY`を使用できますが、マテリアライズドビューは集約の維持により効果的です。クエリオプティマイザは、単純な順序変更、つまり、`SELECT * ORDER BY x`を使用するプロジェクションを活用する可能性が高いです。ユーザーはこの式でストレージフットプリントを削減するために列のサブセットを選択できます。
- ユーザーは、データを2回書き込むことに伴うストレージフットプリントおよびオーバーヘッドの増加に満足している場合。挿入速度に与える影響をテストし、[ストレージオーバーヘッド](https://data-compression/compression-in-clickhouse)を評価してください。

## BigQueryのクエリをClickHouseで書き換える {#rewriting-bigquery-queries-in-clickhouse}

以下は、BigQueryとClickHouseを比較する例のクエリです。このリストは、ClickHouseの機能を利用してクエリを大幅に単純化する方法を示すことを目的としています。ここでの例は、完全なStack Overflowデータセット（2024年4月まで）を使用しています。

**（質問が10件以上の）最も多くのビューを受け取るユーザー:**

_BigQuery_

<img src={require('../images/bigquery-8.png').default}    
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

**最も多くのビューを受け取るタグは:**

_BigQuery_

<br />

<img src={require('../images/bigquery-9.png').default}    
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

可能な限り、ユーザーはClickHouseの集約関数を利用すべきです。以下に、[`argMax`関数](/sql-reference/aggregate-functions/reference/argmax)を使用して、毎年の最も閲覧された質問を計算する例を示します。

_BigQuery_

<br />

<img src={require('../images/bigquery-10.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '500px'}} />

<br />

<img src={require('../images/bigquery-11.png').default}    
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

## 条件と配列 {#conditionals-and-arrays}

条件および配列関数は、クエリを大幅に簡潔にします。以下のクエリは、2022年から2023年にかけての大きなパーセンテージ増加を示すタグ（出現が1万回以上のもの）を計算します。以下のClickHouseクエリは、条件、配列関数、および`HAVING`と`SELECT`句内でエイリアスを再利用する能力のおかげで短くなっています。

_BigQuery_

<br />

<img src={require('../images/bigquery-12.png').default}    
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

5 rows in set. Elapsed: 0.096 sec. Processed 5.08 million rows, 155.73 MB (53.10 million rows/s., 1.63 GB/s.)
```
ピークメモリ使用量: 410.37 MiB。
```

これで、BigQuery から ClickHouse に移行するユーザー向けの基本ガイドは終了です。BigQuery から移行するユーザーは、[ClickHouse におけるデータのモデリング](/data-modeling/schema-design) ガイドを読むことをお勧めします。これにより、ClickHouse の高度な機能についてさらに学ぶことができます。
```
