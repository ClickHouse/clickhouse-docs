---
slug: /migrations/postgresql/designing-schemas
title: スキーマ設計
description: PostgreSQLからClickHouseへの移行時のスキーマ設計
keywords: [postgres, postgresql, migrate, migration, schema]
---

> これは**パート2**であり、PostgreSQLからClickHouseへの移行に関するガイドの一部です。この内容は入門的なものであり、ClickHouseのベストプラクティスに従った初期機能システムをユーザーがデプロイするのを支援することを目的としています。複雑なトピックは避け、完全に最適化されたスキーマには至りませんが、生産システムを構築し、学習の基礎を築くためのしっかりとした基盤を提供します。

Stack Overflowデータセットにはいくつかの関連するテーブルが含まれています。移行では、最初にプライマリテーブルの移行を重点的に行うことをお勧めします。必ずしも最も大きなテーブルである必要はなく、むしろ最も多くの分析クエリを受けることが予想されるテーブルです。これにより、主なClickHouseの概念に慣れることができ、特にOLTP環境から来た場合には重要です。このテーブルは、ClickHouseの機能を十分に活用し、最適なパフォーマンスを得るために、追加のテーブルが追加されるときに再構築が必要になる場合があります。このモデリングプロセスについては、[データモデリングドキュメント](/data-modeling/schema-design#next-data-modelling-techniques)で探ります。

## 初期スキーマの確立 {#establish-initial-schema}

この原則に従い、私たちは主な`posts`テーブルに焦点を当てます。このテーブルのPostgresスキーマは以下の通りです：

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

上記の各カラムの同等の型を確立するために、`DESCRIBE`コマンドを使用し、[Postgresテーブル関数](/sql-reference/table-functions/postgresql)を使います。以下のコマンドをあなたのPostgresインスタンスに合わせて修正してください：

```sql title="クエリ"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

```response title="レスポンス"
┌─name──────────────────┬─type────────────────────┐
│ id           		│ Int32                   │
│ posttypeid   		│ Nullable(Int32)	  │
│ acceptedanswerid 	│ Nullable(String)   	  │
│ creationdate 		│ Nullable(DateTime64(6)) │
│ score        		│ Nullable(Int32)	  │
│ viewcount    		│ Nullable(Int32)	  │
│ body         		│ Nullable(String)   	  │
│ owneruserid  		│ Nullable(Int32)	  │
│ ownerdisplayname 	│ Nullable(String)   	  │
│ lasteditoruserid 	│ Nullable(String)   	  │
│ lasteditordisplayname │ Nullable(String)   	  │
│ lasteditdate 		│ Nullable(DateTime64(6)) │
│ lastactivitydate 	│ Nullable(DateTime64(6)) │
│ title        		│ Nullable(String)   	  │
│ tags         		│ Nullable(String)   	  │
│ answercount  		│ Nullable(Int32)	  │
│ commentcount 		│ Nullable(Int32)	  │
│ favoritecount		│ Nullable(Int32)	  │
│ contentlicense   	│ Nullable(String)   	  │
│ parentid     		│ Nullable(String)   	  │
│ communityowneddate    │ Nullable(DateTime64(6)) │
│ closeddate   		│ Nullable(DateTime64(6)) │
└───────────────────────┴─────────────────────────┘

22行がセットに含まれています。経過時間: 0.478秒。
```

これにより、初期の非最適化済みスキーマが提供されます。

> `NOT NULL制約`がないため、PostgresのカラムにはNull値を含むことができます。行の値を検査せずに、ClickHouseはこれを同等のNullable型にマッピングします。なお、プライマリキーはNullではないことが必須です。これはPostgresでの要件です。

これらの型を使用してClickHouseテーブルを作成するには、単純な`CREATE AS EMPTY SELECT`コマンドを使用します。

```sql title="クエリ"
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
```

このアプローチは、他の形式のs3からデータをロードするためにも使用できます。Parquet形式からのデータを読み込む同等の例については、こちらをご覧ください。

## 初期ロード {#initial-load}

テーブルが作成されたので、PostgresからClickHouseに行を挿入することができます。[Postgresテーブル関数](/sql-reference/table-functions/postgresql)を使用します。

```sql title="クエリ"
INSERT INTO posts SELECT *
FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 行がセットに含まれています。経過時間: 1136.841秒。58.89百万行、80.85 GBを処理しました (51.80千行/s., 71.12 MB/s.)
ピークメモリ使用量: 2.51 GiB。
```

> この操作はPostgresにかなりの負荷をかける可能性があります。ユーザーは、生産ワークロードに影響を与えないように代替操作でバックフィルを行うことを検討するかもしれません。例えば、SQLスクリプトをエクスポートします。この操作のパフォーマンスは、PostgresとClickHouseのクラスターサイズ、およびそのネットワークインターコネクトに依存します。

> ClickHouseからPostgresへの各`SELECT`は、単一の接続を使用します。この接続は`postgresql_connection_pool_size`（デフォルト16）でサイズが設定されたサーバー側の接続プールから取られます。

フルデータセットを使用した場合、例は59mの投稿をロードするはずです。ClickHouseで簡単にカウントというクエリで確認できます。

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

このスキーマの型を最適化するステップは、他のソースからデータをロードした場合（例えば、S3のParquet）と同じです。この[代替ガイドでのParquetを使用するプロセス](/data-modeling/schema-design)を適用すると、次のスキーマが得られます。

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

これは、以前のテーブルからデータを読み込み、新しいテーブルに挿入する単純な`INSERT INTO SELECT`でポピュレートできます。

```sql title="クエリ"
INSERT INTO posts_v2 SELECT * FROM posts
0 行がセットに含まれています。経過時間: 146.471秒。59.82百万行、83.82 GBを処理しました (408.40千行/s., 572.25 MB/s.)
```

新しいスキーマでは、Nullは保持されません。上記の挿入は、これをそれぞれの型のデフォルト値（整数の場合は0、文字列の場合は空の値）に暗黙的に変換します。ClickHouseはまた、数値をそのターゲット精度に自動的に変換します。

## ClickHouseにおけるプライマリ（順序）キー {#primary-ordering-keys-in-clickhouse}

OLTPデータベースから来たユーザーは、ClickHouseにおける同等の概念を探すことがよくあります。ClickHouseが`PRIMARY KEY`構文をサポートしていることに気づくと、ユーザーは元のOLTPデータベースと同じキーを使用してテーブルスキーマを定義したくなるかもしれません。これは適切ではありません。

### ClickHouseのプライマリキーが異なる理由 {#how-are-clickhouse-primary-keys-different}

OLTPのプライマリキーをClickHouseで使用することが適切でない理由を理解するためには、ClickHouseのインデックスの基本を理解する必要があります。Postgresを比較の例として使用しますが、これらの一般的な概念は他のOLTPデータベースにも適用されます。

- Postgresのプライマリキーは、定義上、行ごとに一意です。 [B-tree構造](/optimize/sparse-primary-indexes#an-index-design-for-massive-data-scales)の使用により、このキーによって単一行を効率よく検索することができます。ClickHouseは単一行の値を検索するために最適化できますが、分析ワークロードでは通常、数行の大量のカラムを読み込むことを必要とします。フィルタは**集約が実行される行のサブセット**を特定する必要があることが多いです。
- メモリとディスクの効率は、ClickHouseがよく使用される規模において非常に重要です。データはパーツと呼ばれるチャンクでClickHouseテーブルに書き込まれ、バックグラウンドでパーツをマージするためのルールが適用されます。ClickHouseでは各パーツには自分のプライマリインデックスがあります。パーツがマージされると、マージされたパーツのプライマリインデックスもマージされます。Postgresとは異なり、これらのインデックスは各行のために構築されません。代わりに、パーツのプライマリインデックスは、行のグループごとに1つのインデックスエントリーを持ちます。この手法は**スパースインデクシング**と呼ばれます。
- **スパースインデクシング**が可能なのは、ClickHouseがディスク上で、指定されたキーによってカラムを順序付けて行を保存するからです。単一行を直接見つけるのではなく（B-TREEベースのインデックスのように）、スパースプライマリインデックスは、インデックスエントリーのバイナリサーチを通じて、クエリと一致する可能性のある行のグループを素早く特定できます。見つかった一致の可能性がある行のグループが、並行してClickHouseエンジンにストリーミングされ、一致が見つかるようになります。このインデックス設計は、プライマリインデックスを小さく保ち（メインメモリに完全に収まる）、クエリ実行時間を大幅に短縮します。特に、データ分析のユースケースで一般的な範囲クエリの場合です。詳細については、[詳しいガイド](/optimize/sparse-primary-indexes)をご覧ください。

<br />

<img src={require('../images/postgres-b-tree.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

<img src={require('../images/postgres-sparse-index.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

ClickHouseで選択されたキーは、インデックスだけでなく、ディスク上にデータが書き込まれる順序も決定します。このため、圧縮レベルに大きな影響を及ぼし、結果としてクエリパフォーマンスにも影響を与える可能性があります。ほとんどのカラムの値が連続的に書き込まれる順序を引き起こす順序キーは、選択された圧縮アルゴリズム（およびコーデック）がデータをより効果的に圧縮できるようにします。

> テーブル内のすべてのカラムは、指定された順序キーの値に基づいてソートされます。これは、それ自体がキーに含まれているかどうかに関係なくです。たとえば、`CreationDate`がキーとして使用される場合、他のすべてのカラムの値の順序は、`CreationDate`カラムの値の順序に対応します。複数の順序キーを指定できます。この場合、`SELECT`クエリの`ORDER BY`句と同じ意味で順序付けられます。

### 順序キーの選択 {#choosing-an-ordering-key}

順序キーを選択する際の考慮事項およびステップについては、投稿テーブルを例として、[こちら](/data-modeling/schema-design#choosing-an-ordering-key)を参照してください。

## 圧縮 {#compression}

ClickHouseの列指向ストレージは、Postgresと比較して圧縮が大幅に優れていることを意味します。以下は、両方のデータベースでのStack Overflowテーブルに対するストレージ要件を比較した例です。

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
│ postlinks   │ 79.22 MiB   	│
└─────────────┴─────────────────┘
```

圧縮の最適化と測定に関する詳細は、[こちら](/data-compression/compression-in-clickhouse)を参照してください。

[こちらをクリックしてパート3に進む](/migrations/postgresql/data-modeling-techniques).
