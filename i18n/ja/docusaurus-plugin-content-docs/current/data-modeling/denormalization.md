---
slug: /data-modeling/denormalization
title: データの非正規化
description: クエリパフォーマンスを改善するための非正規化の使用法
keywords: [データ非正規化, 非正規化, クエリ最適化]
---

# データの非正規化

データ非正規化は、ClickHouseにおける技術で、フラットなテーブルを使用して、結合を避けることでクエリの待ち時間を最小限に抑える手法です。

## 正規化スキーマと非正規化スキーマの比較 {#comparing-normalized-vs-denormalized-schemas}

データの非正規化は、特定のクエリパターンに対してデータベースパフォーマンスを最適化するために、意図的に正規化プロセスを逆転させることです。正規化されたデータベースでは、冗長性を最小限に抑え、データの整合性を確保するために、データが複数の関連テーブルに分割されます。非正規化は、テーブルを結合し、データを複製し、計算フィールドを1つのテーブルまたはより少ないテーブルに組み込むことで冗長性を再導入します。これは、クエリ時に結合を移動させることを効果的に意味します。

このプロセスは、クエリ時の複雑な結合が必要なくなり、読み取り操作を大幅に加速することができるため、重い読み取り要求および複雑なクエリを持つアプリケーションに最適です。しかし、複製されたデータの変更は一貫性を保つためにすべてのインスタンスに伝播される必要があるため、書き込み操作とメンテナンスの複雑さが増す可能性があります。

<img src={require('./images/denormalization-diagram.png').default}
  class='image'
  alt='ClickHouseにおける非正規化'
  style={{width: '100%', background: 'none' }} />

<br />

NoSQLソリューションによって広められた一般的な手法は、`JOIN`サポートがない場合にデータを非正規化し、親行に統計情報や関連行を全てカラムやネストしたオブジェクトとして保存するものです。例えば、ブログのスキーマの例では、すべての`Comments`をそれぞれの投稿のオブジェクトの`Array`として保存できます。

## 非正規化を使用する場合 {#when-to-use-denormalization}

一般的には、以下のケースで非正規化を推奨します。

- データが頻繁には変更されないテーブルや、分析クエリのためにデータの可用性に対して遅延を許容できる場合。すなわち、データをバッチで完全に再読み込みできる必要があります。
- 多対多のリレーションシップを非正規化することを避けるべきです。これは、単一のソース行が変更された場合に、多くの行を更新する必要が生じることがあります。
- 高カーディナリティのリレーションシップを非正規化することを避けるべきです。テーブルの各行が別のテーブルに数千の関連エントリを持つ場合、これらは`Array`として表現される必要があります - プリミティブ型またはタプルのいずれかです。一般的には、1000以上のタプルを持つ配列は推奨されません。
- すべてのカラムをネストしたオブジェクトとして非正規化するのではなく、マテリアライズドビューを使用して単に統計情報を非正規化することを検討してください（下記参照）。

すべての情報を非正規化する必要はありません - 頻繁にアクセスされる必要のある重要な情報だけで十分です。

非正規化の作業は、ClickHouse内または上流で処理できます。たとえば、Apache Flinkを使用して。

## 頻繁に更新されるデータでの非正規化を避ける {#avoid-denormalization-on-frequently-updated-data}

ClickHouseでは、非正規化はクエリパフォーマンスを最適化するためのいくつかのオプションの一つですが、慎重に使用する必要があります。データが頻繁に更新され、ほぼリアルタイムで更新する必要がある場合、このアプローチは避けるべきです。この方法は、メインテーブルが主に追加オンリーであるか、定期的にバッチとして再読み込みできる場合に使用します（例：毎日）。

このアプローチでは、主に2つの課題があります - 書き込みパフォーマンスとデータの更新です。より具体的には、非正規化はデータの結合の責任をクエリ時から取り込み時へ移行します。これはクエリパフォーマンスを大幅に向上させることができますが、取り込みプロセスを複雑にし、データパイプラインは、その行のいずれかの行が変更された場合にClickHouseに行を再挿入する必要があります。これは、1つのソース行の変更が、多くのClickHouse内の行を更新する必要がある可能性を意味します。複雑なスキーマでは、行が複雑な結合から構成されている場合、結合のネストされたコンポーネントでの単一の行変更は、潜在的に数百万行に影響を与える可能性があります。

リアルタイムでこれを達成するのはしばしば非現実的であり、2つの課題により大規模なエンジニアリングが必要です：

1. テーブル行が変更されたときに正しい結合文をトリガーする必要があります。理想的には、結合のすべてのオブジェクトが更新されることはなく、影響を受けたものだけが更新されるべきです。効率的に正しい行にフィルターリングするように結合を変更し、高スループットでこれを達成するには、外部ツールまたはエンジニアリングが必要です。
2. ClickHouse内の行更新は慎重に管理する必要があり、追加の複雑さを導入します。

<br />

したがって、すべての非正規化オブジェクトが定期的に再読み込みされるバッチ更新プロセスがより一般的です。

## 非正規化の実用的なケース {#practical-cases-for-denormalization}

非正規化が意味を成す場合と、他のアプローチの方が望ましい場合のいくつかの実用的な例を考えてみましょう。

`Posts`テーブルには、すでに`AnswerCount`や`CommentCount`などの統計情報が非正規化されて格納されていると仮定します。実際には、これらの情報は頻繁に変更されることが予想されるため、正規化した方が良いかもしれません。これらのカラムの多くは、別のテーブルからも取得できます。たとえば、投稿のコメントは`PostId`カラムと`Comments`テーブルを通じて利用可能です。この例では、投稿がバッチプロセスで再読み込みされると仮定します。

我々はまた、分析のために`Posts`を主要テーブルと考えるため、他のテーブルを`Posts`に非正規化することだけを検討します。他の方向への非正規化もいくつかのクエリには適当であり、上記の同様の考慮が適用されます。

*以下の各例について、両方のテーブルを結合に使用する必要があるクエリが存在するとします。*

### 投稿と投票 {#posts-and-votes}

投稿に対する投票は別のテーブルとして表されます。この最適化されたスキーマは、以下のように示されており、データをロードするための挿入コマンドも示されています。

```sql
CREATE TABLE votes
(
	`Id` UInt32,
	`PostId` Int32,
	`VoteTypeId` UInt8,
	`CreationDate` DateTime64(3, 'UTC'),
	`UserId` Int32,
	`BountyAmount` UInt8
)
ENGINE = MergeTree
ORDER BY (VoteTypeId, CreationDate, PostId)

INSERT INTO votes SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 26.272 sec. Processed 238.98 million rows, 2.13 GB (9.10 million rows/s., 80.97 MB/s.)
```

一見すると、これらは投稿テーブルの非正規化候補かもしれません。しかし、このアプローチにはいくつかの課題があります。

投稿に対する投票は頻繁に追加されます。これは時間とともに投稿毎に減少するかもしれませんが、以下のクエリは1時間あたり約4万票の投票が30,000投稿に対してあることを示しています。

```sql
SELECT round(avg(c)) AS avg_votes_per_hr, round(avg(posts)) AS avg_posts_per_hr
FROM
(
	SELECT
    	toStartOfHour(CreationDate) AS hr,
    	count() AS c,
    	uniq(PostId) AS posts
	FROM votes
	GROUP BY hr
)

┌─avg_votes_per_hr─┬─avg_posts_per_hr─┐
│        	41759 │        	33322 │
└──────────────────┴──────────────────┘
```

これは、遅延を許容できるのであればバッチ処理で対応できますが、それでも更新を処理する必要があります。そうでなければ、すべての投稿を定期的に再読み込みせざるを得なくなります（望ましくない可能性が高い）。

さらに問題なのは、一部の投稿には極めて多くの投票が付いていることです：

```sql
SELECT PostId, concat('https://stackoverflow.com/questions/', PostId) AS url, count() AS c
FROM votes
GROUP BY PostId
ORDER BY c DESC
LIMIT 5

┌───PostId─┬─url──────────────────────────────────────────┬─────c─┐
│ 11227902 │ https://stackoverflow.com/questions/11227902 │ 35123 │
│   927386 │ https://stackoverflow.com/questions/927386   │ 29090 │
│ 11227809 │ https://stackoverflow.com/questions/11227809 │ 27475 │
│   927358 │ https://stackoverflow.com/questions/927358   │ 26409 │
│  2003515 │ https://stackoverflow.com/questions/2003515  │ 25899 │
└──────────┴──────────────────────────────────────────────┴───────┘
```

ここでの主な観察は、各投稿に対する集計投票統計が大部分の分析に十分であり、すべての投票情報を非正規化する必要はないということです。たとえば、現在の`Score`カラムはそのような統計を示しています。すなわち、合計のアップボートからダウンボートを引いた値です。理想的には、クエリ時に単純なルックアップでこれらの統計を取得できれば良いでしょう（[Dictionary](https://dictionaries)を参照）。

### ユーザーとバッジ {#users-and-badges}

次に、`Users`および`Badges`を考えてみましょう：

<img src={require('./images/denormalization-schema.png').default}
  class='image'
  alt='UsersとBadgesのスキーマ'
  style={{width: '100%', background: 'none' }} />

<p></p>
最初に次のコマンドを使用してデータを挿入します：
<p></p>

```sql
CREATE TABLE users
(
    `Id` Int32,
    `Reputation` LowCardinality(String),
    `CreationDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
    `DisplayName` String,
    `LastAccessDate` DateTime64(3, 'UTC'),
    `AboutMe` String,
    `Views` UInt32,
    `UpVotes` UInt32,
    `DownVotes` UInt32,
    `WebsiteUrl` String,
    `Location` LowCardinality(String),
    `AccountId` Int32
)
ENGINE = MergeTree
ORDER BY (Id, CreationDate)
```

```sql
CREATE TABLE badges
(
    `Id` UInt32,
    `UserId` Int32,
    `Name` LowCardinality(String),
    `Date` DateTime64(3, 'UTC'),
    `Class` Enum8('Gold' = 1, 'Silver' = 2, 'Bronze' = 3),
    `TagBased` Bool
)
ENGINE = MergeTree
ORDER BY UserId

INSERT INTO users SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet')

0 rows in set. Elapsed: 26.229 sec. Processed 22.48 million rows, 1.36 GB (857.21 thousand rows/s., 51.99 MB/s.)

INSERT INTO badges SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 18.126 sec. Processed 51.29 million rows, 797.05 MB (2.83 million rows/s., 43.97 MB/s.)
```

ユーザーは頻繁にバッジを取得する可能性がありますが、これは1日に1回以上更新する必要があるデータセットではないでしょう。このバッジとユーザーの関係は一対多です。バッジをユーザーにタプルのリストとして単に非正規化することは可能でしょうか？しかし、高い数のバッジを持つユーザーがいることを確認するためのクイックチェックを行った結果これは理想的ではないことが示されました：

```sql
SELECT UserId, count() AS c FROM badges GROUP BY UserId ORDER BY c DESC LIMIT 5

┌─UserId─┬─────c─┐
│  22656 │ 19334 │
│   6309 │ 10516 │
│ 100297 │  7848 │
│ 157882 │  7574 │
│  29407 │  6512 │
└────────┴───────┘
```

おそらく、1行に19kオブジェクトを非正規化するのは現実的ではないでしょう。このリレーションシップは、別々のテーブルとして残すか、統計情報を追加した方が良いかもしれません。

> バッジからユーザーへの統計を非正規化すること、たとえばバッジの数を非正規化したいかもしれません。このデータセットで挿入時にDictionaryを使用する場合に、私たちはそのような例を考えます。

### 投稿と投稿リンク {#posts-and-postlinks}

`PostLinks`は、ユーザーが関連しているか重複していると考える`Posts`を接続します。以下のクエリは、スキーマとロードコマンドを示しています：

```sql
CREATE TABLE postlinks
(
  `Id` UInt64,
  `CreationDate` DateTime64(3, 'UTC'),
  `PostId` Int32,
  `RelatedPostId` Int32,
  `LinkTypeId` Enum('Linked' = 1, 'Duplicate' = 3)
)
ENGINE = MergeTree
ORDER BY (PostId, RelatedPostId)

INSERT INTO postlinks SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/postlinks.parquet')

0 rows in set. Elapsed: 4.726 sec. Processed 6.55 million rows, 129.70 MB (1.39 million rows/s., 27.44 MB/s.)
```

非正規化を妨げるような投稿の過度なリンク数は確認されません：

```sql
SELECT PostId, count() AS c
FROM postlinks
GROUP BY PostId
ORDER BY c DESC LIMIT 5

┌───PostId─┬───c─┐
│ 22937618 │ 125 │
│  9549780 │ 120 │
│  3737139 │ 109 │
│ 18050071 │ 103 │
│ 25889234 │  82 │
└──────────┴─────┘
```

同様に、これらのリンクは非常に頻繁に発生するイベントではありません：

```sql
SELECT
  round(avg(c)) AS avg_votes_per_hr,
  round(avg(posts)) AS avg_posts_per_hr
FROM
(
  SELECT
  toStartOfHour(CreationDate) AS hr,
  count() AS c,
  uniq(PostId) AS posts
  FROM postlinks
  GROUP BY hr
)

┌─avg_votes_per_hr─┬─avg_posts_per_hr─┐
│      		 54 │      		 44	│
└──────────────────┴──────────────────┘
```

これは、以下の非正規化の例として使用します。

### 単純な統計例 {#simple-statistic-example}

ほとんどの場合、非正規化には親行に単一のカラムまたは統計を追加します。例えば、重複投稿の数で投稿を強化したい場合は、単にカラムを追加するだけで済みます。

```sql
CREATE TABLE posts_with_duplicate_count
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -他のカラム
   `DuplicatePosts` UInt16
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

このテーブルをポピュレートするために、重複統計を投稿と結合して`INSERT INTO SELECT`を使用します。

```sql
INSERT INTO posts_with_duplicate_count SELECT
    posts.*,
    DuplicatePosts
FROM posts AS posts
LEFT JOIN
(
    SELECT PostId, countIf(LinkTypeId = 'Duplicate') AS DuplicatePosts
    FROM postlinks
    GROUP BY PostId
) AS postlinks ON posts.Id = postlinks.PostId
```

### 1対多リレーションシップのための複雑なタイプの活用 {#exploiting-complex-types-for-one-to-many-relationships}

非正規化を行うためには、複雑なタイプを活用する必要があります。1対1のリレーションシップが非正規化される場合、カラム数が少ない場合は、ユーザーが単に元のタイプの行として追加することができます。しかし、これは大きなオブジェクトや1対多のリレーションシップに対しては望ましくなく、実行可能ではありません。

複雑なオブジェクトや1対多のリレーションシップの場合、ユーザーは以下を利用できます。

- 名前付きタプル - これにより、関連構造をカラムセットとして表現できます。
- Array(Tuple)またはNested - 名前付きタプルの配列、ネストしたオブジェクトとも呼ばれるもので、各エントリがオブジェクトを表しています。1対多のリレーションシップに適用されます。

例として、`PostLinks`を`Posts`に非正規化する方法を以下に示します。

各投稿は、前述の`PostLinks`スキーマに示されたように、他の投稿へリンクを含むことができます。ネストタイプとして、リンクおよび重複投稿を以下のように表すことができます：

```sql
SET flatten_nested=0
CREATE TABLE posts_with_links
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -他のカラム
   `LinkedPosts` Nested(CreationDate DateTime64(3, 'UTC'), PostId Int32),
   `DuplicatePosts` Nested(CreationDate DateTime64(3, 'UTC'), PostId Int32),
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

> `flatten_nested=0`の設定を使用している点に注意してください。ネストされたデータのフラット化を無効にすることを推奨します。

この非正規化を、`INSERT INTO SELECT`と`OUTER JOIN`クエリを使用して実行できます：

```sql
INSERT INTO posts_with_links
SELECT
    posts.*,
    arrayMap(p -> (p.1, p.2), arrayFilter(p -> p.3 = 'Linked' AND p.2 != 0, Related)) AS LinkedPosts,
    arrayMap(p -> (p.1, p.2), arrayFilter(p -> p.3 = 'Duplicate' AND p.2 != 0, Related)) AS DuplicatePosts
FROM posts
LEFT JOIN (
    SELECT
   	 PostId,
   	 groupArray((CreationDate, RelatedPostId, LinkTypeId)) AS Related
    FROM postlinks
    GROUP BY PostId
) AS postlinks ON posts.Id = postlinks.PostId

0 rows in set. Elapsed: 155.372 sec. Processed 66.37 million rows, 76.33 GB (427.18 thousand rows/s., 491.25 MB/s.)
Peak memory usage: 6.98 GiB.
```

> ここでのタイミングに注目してください。66百万行を約2分で非正規化しました。後で見るように、これはスケジュールできる操作です。

`groupArray`関数を使用して、`PostLinks`を各`PostId`の配列に集約し、結合の前に準備します。この配列は、`LinkedPosts`と`DuplicatePosts`の2つのサブリストにフィルタリングされ、外部結合からの空の結果が含まれないようにします。

新しく非正規化された構造を確認するためにいくつかの行を選択します：

```sql
SELECT LinkedPosts, DuplicatePosts
FROM posts_with_links
WHERE (length(LinkedPosts) > 2) AND (length(DuplicatePosts) > 0)
LIMIT 1
FORMAT Vertical

Row 1:
──────
LinkedPosts:	[('2017-04-11 11:53:09.583',3404508),('2017-04-11 11:49:07.680',3922739),('2017-04-11 11:48:33.353',33058004)]
DuplicatePosts: [('2017-04-11 12:18:37.260',3922739),('2017-04-11 12:18:37.260',33058004)]
```

## 非正規化の調整とスケジュール {#orchestrating-and-scheduling-denormalization}

### バッチ {#batch}

非正規化を活用するには、これを実行および調整できる変換プロセスが必要です。

上記で示したように、ClickHouseを使用して`INSERT INTO SELECT`を介してデータがロードされた後にこの変換を実行できます。これは定期的なバッチ変換に適しています。

ユーザーには、定期的なバッチロードプロセスが許可されると仮定して、ClickHouse内でこれを調整するためのいくつかのオプションがあります：

- **[リフレッシュ可能なマテリアライズドビュー](/materialized-view/refreshable-materialized-view)** - リフレッシュ可能なマテリアライズドビューを使用して、条件に基づいてクエリを定期的にスケジュールし、結果をターゲットテーブルに送信できます。クエリ実行時に、ビューはターゲットテーブルを原子的に更新します。これにより、この作業をスケジュールするClickHouse独自の手段を提供します。
- **外部ツール** - [dbt](https://www.getdbt.com/)や[Airflow](https://airflow.apache.org/)などのツールを利用して、定期的に変換をスケジュールします。[dbtのClickHouse統合](/integrations/dbt)により、ターゲットテーブルの新しいバージョンが作成され、その後原子的にクエリを受け取るバージョンと交換されます（[EXCHANGE](/sql-reference/statements/exchange)コマンドを介して）。

### ストリーミング {#streaming}

ユーザーは、挿入前にClickHouseの外部でこれを実行したい場合もあります。この場合、[Apache Flink](https://flink.apache.org/)などのストリーミング技術を使用できます。また、データが挿入されると同時にこのプロセスを実行するために、インクリメンタルな[マテリアライズドビュー](/guides/developer/cascading-materialized-views)を使用することもできます。
