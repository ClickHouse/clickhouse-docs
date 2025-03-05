---
slug: /migrations/postgresql/designing-schemas
title: スキーマの設計
description: PostgreSQL から ClickHouse への移行時のスキーマの設計
keywords: [postgres, postgresql, migrate, migration, schema]
---

import postgres_b_tree from '@site/static/images/migrations/postgres-b-tree.png';
import postgres_sparse_index from '@site/static/images/migrations/postgres-sparse-index.png';

> これは、PostgreSQL から ClickHouse への移行に関するガイドの **第2部** です。このコンテンツは、ClickHouse のベストプラクティスに従った初期の機能的なシステムを展開する手助けをすることを目的とした、入門的な内容と考えることができます。複雑なトピックを避けており、完全に最適化されたスキーマを得るには至りませんが、ユーザーが本番システムを構築し、学習の基盤とするためのしっかりとした基盤を提供します。

Stack Overflow のデータセットには、多くの関連するテーブルが含まれています。移行は、まず主テーブルの移行に焦点を当てることをお勧めします。これが必ずしも最大のテーブルである必要はなく、最も多くの分析クエリを受け取ることが予想されるテーブルです。これにより、主に OLTP のバックグラウンドを持つ方にとって特に重要な ClickHouse の主要な概念に慣れることができます。このテーブルは、ClickHouse の機能を最大限に活用し、最適なパフォーマンスを得るために、追加のテーブルが追加される際にリモデリングが必要となるかもしれません。このモデリングプロセスについては、[データモデル文書](/data-modeling/schema-design#next-data-modelling-techniques)で探ります。

## 初期スキーマの設定 {#establish-initial-schema}

この原則に従い、主な `posts` テーブルに焦点を当てます。これに対応する PostgreSQL スキーマは以下に示されています：

```sql title="クエリ"
CREATE TABLE posts (
   Id int,
   PostTypeId int,
   AcceptedAnswerId text,
   CreationDate timestamp,
   Score int,
   ViewCount int,
   Body text,
   OwnerUserId int,
   OwnerDisplayName text,
   LastEditorUserId text,
   LastEditorDisplayName text,
   LastEditDate timestamp,
   LastActivityDate timestamp,
   Title text,
   Tags text,
   AnswerCount int,
   CommentCount int,
   FavoriteCount int,
   ContentLicense text,
   ParentId text,
   CommunityOwnedDate timestamp,
   ClosedDate timestamp,
   PRIMARY KEY (Id),
   FOREIGN KEY (OwnerUserId) REFERENCES users(Id)
)
```

上記の各カラムに対する同等の型を確立するために、[Postgres テーブル関数](/sql-reference/table-functions/postgresql)を使用して `DESCRIBE` コマンドを実行できます。次のコマンドをあなたの Postgres インスタンスに合わせて修正してください：

```sql title="クエリ"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

```response title="レスポンス"
┌─name──────────────────┬─type────────────────────┐
│ id                   │ Int32                   │
│ posttypeid          │ Nullable(Int32)        │
│ acceptedanswerid     │ Nullable(String)       │
│ creationdate        │ Nullable(DateTime64(6))│
│ score                │ Nullable(Int32)        │
│ viewcount            │ Nullable(Int32)        │
│ body                 │ Nullable(String)       │
│ owneruserid          │ Nullable(Int32)        │
│ ownerdisplayname     │ Nullable(String)       │
│ lasteditoruserid     │ Nullable(String)       │
│ lasteditordisplayname│ Nullable(String)       │
│ lasteditdate        │ Nullable(DateTime64(6))│
│ lastactivitydate    │ Nullable(DateTime64(6))│
│ title                │ Nullable(String)       │
│ tags                 │ Nullable(String)       │
│ answercount          │ Nullable(Int32)        │
│ commentcount         │ Nullable(Int32)        │
│ favoritecount        │ Nullable(Int32)        │
│ contentlicense       │ Nullable(String)       │
│ parentid            │ Nullable(String)       │
│ communityowneddate   │ Nullable(DateTime64(6))│
│ closeddate           │ Nullable(DateTime64(6))│
└───────────────────────┴─────────────────────────┘

22 行のセットです。経過時間: 0.478 秒。
```

これにより、初期の非最適化スキーマが提供されます。

> `NOT NULL 制約` がない場合、Postgres のカラムには Null 値を含むことができます。行の値を検査せずに、ClickHouse はこれらを同等の Nullable 型にマッピングします。主キーは Null ではないことに注意してください。これは Postgres の要件です。

これらの型を使用して ClickHouse テーブルを作成するには、シンプルな `CREATE AS EMPTY SELECT` コマンドを使用できます。

```sql title="クエリ"
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
```

このアプローチは、他の形式の s3 からデータをロードするためにも使用できます。Parquet 形式からこのデータをロードするための同等の例は、ここにあります。

## 初期ロード {#initial-load}

テーブルが作成されたので、[Postgres テーブル関数](/sql-reference/table-functions/postgresql)を使用して、Postgres から ClickHouse に行を挿入できます。

```sql title="クエリ"
INSERT INTO posts SELECT *
FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 行のセットです。経過時間: 1136.841 秒。処理された行数: 5890.89 万行、容量: 80.85 GB (51.80 千行/s., 71.12 MB/s.)
ピークメモリ使用量: 2.51 GiB。
```

> この操作は、Postgres にかなりの負荷をかける可能性があります。ユーザーは、プロダクションのワークロードに影響を与えないように、SQL スクリプトをエクスポートするなどの代替操作でバックフィルを実行することを検討するかもしれません。この操作のパフォーマンスは、Postgres と ClickHouse クラスターのサイズ、およびそれらのネットワーク接続に依存します。

> ClickHouse から Postgres への各 `SELECT` は、単一の接続を使用します。この接続は、設定 `postgresql_connection_pool_size`（デフォルト 16）でサイズ指定されたサーバー側の接続プールから取得されます。

フルデータセットを使用する場合、例では 5900 万のポストをロードするはずです。ClickHouse で単純なカウントを実行して確認します：

```sql title="クエリ"
SELECT count()
FROM posts
```

```response title="レスポンス"
┌──count()─┐
│ 58889566 │
└──────────┘
```

## 型の最適化 {#optimizing-types}

このスキーマの型を最適化する手順は、データが他のソース（例えば、S3 上の Parquet）からロードされた場合と同じです。この[代替ガイドを使用して Parquet]( /data-modeling/schema-design)で説明されたプロセスを適用すると、次のスキーマが得られます：

```sql title="クエリ"
CREATE TABLE posts_v2
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
COMMENT '最適化された型'
```

前のテーブルからデータを読み込み、このテーブルに挿入するために、シンプルな `INSERT INTO SELECT` でこれを行うことができます：

```sql title="クエリ"
INSERT INTO posts_v2 SELECT * FROM posts
0 行のセットです。経過時間: 146.471 秒。処理された行数: 5982.82 万行、容量：83.82 GB（408.40 千行/s., 572.25 MB/s.)
```

新しいスキーマには Null 値を保持しません。上記の挿入によって、これらはそれぞれの型のデフォルト値 - 整数の場合は 0、文字列の場合は空の値 - に暗黙的に変換されます。ClickHouse はまた、任意の数値をターゲット精度に自動的に変換します。

## ClickHouse の主（整列）キー {#primary-ordering-keys-in-clickhouse}

OLTP データベースから来たユーザーは、ClickHouse の同等の概念を探すことがよくあります。ClickHouse が `PRIMARY KEY` 構文をサポートしているのを見て、ユーザーは元の OLTP データベースと同じキーを使用してテーブルスキーマを定義したくなるかもしれません。これは適切ではありません。

### ClickHouse の主キーはどのように異なるのか？ {#how-are-clickhouse-primary-keys-different}

OLTP の主キーを ClickHouse で使用することが適切でない理由を理解するためには、まず ClickHouse のインデックスの基本を理解する必要があります。Postgres を例として比較しますが、これらの一般的な概念は他の OLTP データベースにも適用されます。

- Postgres の主キーは、定義上、行ごとに一意です。[B-木構造](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)を使用することで、このキーによって単一行を効率的にルックアップできます。ClickHouse は単一行値のルックアップに最適化できますが、分析ワークロードでは通常、いくつかのカラムを読む必要があり、多くの行を対象とします。フィルターは、集約が行われる**行のサブセット**を特定する必要があることが多いです。
- メモリとディスクの効率は、ClickHouse が頻繁に使用されるスケールにとって極めて重要です。データは、シャードと呼ばれるチャンクで ClickHouse テーブルに書き込まれ、バックグラウンドで統合規則が適用されます。ClickHouse では、各シャードには独自の主インデックスがあります。シャードがマージされると、マージされたシャードの主インデックスもマージされます。Postgres とは異なり、これらのインデックスは各行のために構築されません。むしろ、シャードの主インデックスは、行グループごとに 1 つのインデックスエントリを持ちます。この技術は**スパースインデックス**と呼ばれます。
- **スパースインデックス**は、ClickHouse がッシュのディスク上で指定されたキーに従って行をストレージするために可能になります。単一行を直接見つけるのではなく（B-木に基づくインデックスのように）、スパース主インデックスはインデックスエントリのバイナリ検索を介して可能性のある一致の行グループを迅速に特定します。見つかった一致する可能性のある行のグループは、並行して ClickHouse エンジンにストリーミングされ、一致を見つけます。このインデックスデザインにより、主インデックスは小さく（メインメモリに収まる）、クエリ実行時間が大幅に短縮されます。特にデータ分析のユースケースで典型的な範囲クエリの場合です。詳細については、[この詳細ガイド](/guides/best-practices/sparse-primary-indexes)をお勧めします。

<br />

<img src={postgres_b_tree} class="image" alt="PostgreSQL B-Tree インデックス" style={{width: '800px'}} />

<br />

<img src={postgres_sparse_index} class="image" alt="PostgreSQL スパースインデックス" style={{width: '800px'}} />

<br />

ClickHouse で選択されたキーは、インデックスだけでなく、ディスクにデータが書き込まれる順序も決定します。このため、圧縮レベルに劇的な影響を与え、さらにクエリパフォーマンスに影響を及ぼす可能性があります。大部分のカラムの値が連続した順序で書き込まれる整列キーは、選択された圧縮アルゴリズム（およびコーデック）がデータをより効果的に圧縮できるようにします。

> テーブル内のすべてのカラムは、指定された整列キーの値に基づいてソートされます。キー自体に含まれているかどうかは関係ありません。たとえば、`CreationDate` をキーとして使用した場合、他のすべてのカラムの値の順序は `CreationDate` カラムの値の順序に対応します。複数の整列キーを指定できます - これは `SELECT` クエリ内の `ORDER BY` 句と同じ意味で整列されます。

### 整列キーの選択 {#choosing-an-ordering-key}

整列キーの選択に関する考慮事項とステップについては、posts テーブルを例にして、[こちら]( /data-modeling/schema-design#choosing-an-ordering-key)をご覧ください。

## 圧縮 {#compression}

ClickHouse の列指向ストレージは、Postgres と比較して圧縮が大幅に改善されることがよくあります。以下に、両方のデータベースにおける Stack Overflow テーブルのストレージ要件を比較した例を示します：

```sql title="クエリ (Postgres)"
SELECT
    schemaname,
    tablename,
    pg_total_relation_size(schemaname || '.' || tablename) AS total_size_bytes,
    pg_total_relation_size(schemaname || '.' || tablename) / (1024 * 1024 * 1024) AS total_size_gb
FROM
    pg_tables s
WHERE
    schemaname = 'public';
```

```sql title="クエリ (ClickHouse)"
SELECT
	`table`,
	formatReadableSize(sum(data_compressed_bytes)) AS compressed_size
FROM system.parts
WHERE (database = 'stackoverflow') AND active
GROUP BY `table`
```

```response title="レスポンス"
┌─table───────┬─compressed_size─┐
│ posts       │ 25.17 GiB  	│
│ users       │ 846.57 MiB 	│
│ badges      │ 513.13 MiB 	│
│ comments    │ 7.11 GiB   	│
│ votes       │ 1.28 GiB   	│
│ posthistory │ 40.44 GiB  	│
│ postlinks   │ 79.22 MiB  	│
└─────────────┴─────────────────┘
```

圧縮の最適化と測定に関するさらに詳細は、[こちら]( /data-compression/compression-in-clickhouse)で確認できます。

[こちらをクリックして第3部へ](/migrations/postgresql/data-modeling-techniques)。
