---
slug: /data-modeling/denormalization
title: データの非正規化
description: クエリパフォーマンスを向上させるための非正規化の使用方法
keywords: [データ非正規化, 非正規化, クエリ最適化]
---

import denormalizationDiagram from '@site/static/images/data-modeling/denormalization-diagram.png';
import denormalizationSchema from '@site/static/images/data-modeling/denormalization-schema.png';


# データの非正規化

データの非正規化は、ClickHouseにおける技術で、フラットなテーブルを使用して結合を回避し、クエリの遅延を最小化するのに役立ちます。

## 正規化スキーマと非正規化スキーマの比較 {#comparing-normalized-vs-denormalized-schemas}

データの非正規化は、特定のクエリパターンのデータベースパフォーマンスを最適化するために、意図的に正規化プロセスを逆転させることを含みます。正規化されたデータベースでは、冗長性を最小化し、データの整合性を確保するために、データが複数の関連テーブルに分割されています。非正規化は、テーブルを組み合わせ、データを重複させ、計算フィールドを単一のテーブルまたは少数のテーブルに組み込むことで冗長性を再導入し、クエリから挿入時に結合を移動させます。

このプロセスにより、クエリ時に複雑な結合が必要なくなり、読み取り操作の速度が大幅に向上する可能性があり、重い読み取り要件や複雑なクエリを持つアプリケーションに最適です。しかし、重複したデータへの変更はすべてのインスタンスに伝播する必要があるため、書き込み操作とメンテナンスの複雑さが増す可能性があります。

<img src={denormalizationDiagram} class="image" alt="ClickHouseにおける非正規化" style={{width: '100%', background: 'none'}} />

<br />

NoSQLソリューションで一般的に利用される技術は、`JOIN`サポートがない場合にデータを非正規化し、すべての統計または関連行を親行のカラムやネストされたオブジェクトとして保存することです。例えば、ブログのスキーマの例では、すべての`Comments`をそれぞれの投稿の`Array`として保存することができます。

## 非正規化を使用するタイミング {#when-to-use-denormalization}

一般的に、以下のケースで非正規化を推奨します：

- 変更頻度が低いテーブルや、分析クエリのためにデータが利用可能になるまでの遅延を許容できるもの、すなわちデータをバッチで完全に再ロードできる場合に非正規化します。
- 多対多関係の非正規化は避けます。これにより、単一のソース行が変更された場合に多くの行を更新する必要が生じる可能性があります。
- 高カーディナリティの関係の非正規化は避けます。テーブルの各行に別のテーブルに数千の関連エントリがある場合、これらは`Array`として表現する必要があります―原始型またはタプルのいずれか。一般的に、1000タプルを超える配列は推奨されません。
- すべてのカラムをネストされたオブジェクトとして非正規化するのではなく、統計のみをMaterialized Viewを使用して非正規化することを検討します（以下参照）。

すべての情報を非正規化する必要はなく、頻繁にアクセスされるキー情報のみを対象としてください。

非正規化の作業は、ClickHouseまたは上流で処理できます（例：Apache Flinkを使用）。

## 頻繁に更新されるデータでの非正規化を避ける {#avoid-denormalization-on-frequently-updated-data}

ClickHouseにおいて、非正規化はクエリ性能を最適化するためにユーザーが使用できるいくつかのオプションの1つですが、慎重に使用する必要があります。データが頻繁に更新され、リアルタイムに近い更新が必要な場合、このアプローチは避けるべきです。主なテーブルが主に追加専用であるか、バッチとして定期的に再ロードできる場合にのみこの方法を使用してください（例：毎日）。

このアプローチには1つの主な課題があります―書き込みパフォーマンスとデータの更新です。より具体的には、非正規化はクエリ時から摂取時にデータ結合の責任をシフトさせます。これはクエリ性能を大幅に向上させる可能性がありますが、摂取プロセスを複雑にし、行を構成するために使用された行が変更された場合、データパイプラインがClickHouseに再挿入する必要があります。これにより、単一のソース行の変更がClickHouse内の多くの行を更新する必要が生じる可能性があります。複雑なスキーマの場合、結合から構成された行のネストされたコンポーネントの単一行の変更が、数百万の行の更新を意味する可能性があります。

リアルタイムでこれを実現することはしばしば非現実的であり、2つの課題により、かなりのエンジニアリングが必要です：

1. テーブル行が変更されたときに正しい結合文をトリガーすること。これは理想的には結合のすべてのオブジェクトを更新しないようにすべきであり、影響を受けたもののみを更新する必要があります。正しい行を効率的にフィルタリングするために結合を修正し、高スループットでこれを実現するには、外部ツールやエンジニアリングが必要です。
2. ClickHouse内の行の更新は慎重に管理する必要があり、追加の複雑さを導入します。

<br />

そのため、すべての非正規化されたオブジェクトが定期的に再ロードされるバッチ更新プロセスが一般的です。

## 非正規化の実用ケース {#practical-cases-for-denormalization}

非正規化が理にかなういくつかの実用的な例と、他のアプローチが望ましい場合を考えてみましょう。

すでに`AnswerCount`や`CommentCount`などの統計で非正規化された`Posts`テーブルを考えてみましょう－ソースデータはこの形式で提供されます。実際には、情報が頻繁に変更される可能性が高いため、このデータを正規化したいと考えるかもしれません。また、これらのカラムの多くは他のテーブルからも利用可能です（例：投稿のコメントは`PostId`カラムと`Comments`テーブルを通じて入手可能です）。例の目的のために、投稿はバッチプロセスで再ロードされると仮定します。

また、他のテーブルを`Posts`に対して非正規化することのみを考慮します。これは分析用の主なテーブルと見なしています。他の方向に非正規化することも特定のクエリには適切ですが、上記の考慮が適用されます。

*以下の各例では、結合を使用するクエリが存在すると仮定します。*

### 投稿と投票 {#posts-and-votes}

投稿への投票は別テーブルとして表されます。この最適化スキーマは以下に示され、データをロードするための挿入コマンドも含まれています：

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

最初の見た目では、これらは投稿テーブルの非正規化候補かもしれません。このアプローチにはいくつかの課題があります。

投稿には頻繁に投票が追加されます。このため、時間が経つにつれて投稿ごとの投票数は減少するかもしれませんが、次のクエリは、30,000件の投稿に対しておおよそ40,000件の投票があることを示しています。

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

これは、遅延を許容できればバッチ処理で対処可能ですが、これでも更新を扱う必要があります。すべての投稿を定期的に再ロードすることを除きます（望ましくない可能性があります）。

さらに厄介なのは、一部の投稿が極端に多くの投票を持っていることです：

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

ここでの主な観察は、各投稿の集計された投票統計がほとんどの分析にとって十分であるということです―すべての投票情報を非正規化する必要はありません。たとえば、現在の`Score`カラムはそのような統計を表しており、つまりはトータルのアップ票からダウン票を引いたものです。理想的には、クエリ時にシンプルなルックアップでこれらの統計を取得できればと思います（see [dictionaries](/dictionary)）。

### ユーザーとバッジ {#users-and-badges}

次に、`Users`と`Badges`を考えてみましょう：

<img src={denormalizationSchema} class="image" alt="Users and Badges schema" style={{width: '100%', background: 'none'}} />

<p></p>
データを次のコマンドで挿入します：
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

ユーザーは頻繁にバッジを取得することがありますが、これはおそらく毎日更新する必要のあるデータセットではないでしょう。バッジとユーザーの関係は1対多です。バッジをユーザーにタプルのリストとして単純に非正規化できるかもしれませんが、クイックチェックでユーザーごとの最高バッジ数を確認したところ、これは理想的ではないことが示唆されています。

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

1行に19,000オブジェクトを非正規化するのは現実的ではないでしょう。この関係は、別のテーブルのままにするか、統計を追加するのが最適かもしれません。

> ユーザーにバッジの数などのバッジからの統計を非正規化することを検討するかもしれません。このデータセットに付随した例を挿入時にディクショナリを使用する際に考慮します。

### 投稿とポストリンク {#posts-and-postlinks}

`PostLinks`は、ユーザーが関連しているまたは重複していると考える`Posts`を接続します。次のクエリはスキーマとロードコマンドを示しています：

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

非正規化を妨げるような過剰な数のリンクを持つ投稿は存在しないことを確認できます：

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

また、これらのリンクは過度に頻繁に発生するイベントではありません：

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

これを非正規化の例として使用します。

### 単純な統計例 {#simple-statistic-example}

ほとんどの場合、非正規化には親行に単一のカラムまたは統計を追加する必要があります。たとえば、重複する投稿の数で投稿を豊かにしたい場合、単にカラムを追加するだけで済みます。

```sql
CREATE TABLE posts_with_duplicate_count
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -他のカラム
   `DuplicatePosts` UInt16
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

このテーブルをポピュレートするために、`INSERT INTO SELECT`を利用して重複統計と投稿を結合します。

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

### 一対多関係のための複雑なタイプの活用 {#exploiting-complex-types-for-one-to-many-relationships}

非正規化を実行するためには、複雑なタイプを活用する必要があります。一対一の関係が低カラム数で非正規化されている場合、ユーザーはこれらを以前の型でもって単独カラムとして追加できます。ただし、これがより大きなオブジェクトにとって好ましくない場合や、一対多関係に適用できない場合があります。

複雑なオブジェクトや一対多関係において、ユーザーは以下を使用できます：

- 名前付きタプル - 関連構造をカラムのセットとして表現できます。
- Array(Tuple)またはNested - 名前付きタプルの配列、すなわちNestedであり、それぞれのエントリは1つのオブジェクトを表します。一対多関係に適用可能です。

以下に、`PostLinks`を`Posts`に非正規化する例を示します。

各投稿には、以前の`PostLinks`スキーマにあったように、他の投稿への数のリンクを含むことができます。ネストされたタイプとして、リンクされた投稿と重複投稿を次のように表現できます：

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

> 設定`flatten_nested=0`の使用に注意してください。ネストされたデータの平坦化を無効にすることを推奨します。

`INSERT INTO SELECT`を用いて、`OUTER JOIN`クエリを使用してこの非正規化を実行できます：

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

> ここでのタイミングに注意してください。約2分で6600万行を非正規化することができました。後で見ていくように、これはスケジュール可能な操作です。

`groupArray`関数を使用して、各`PostId`用に`PostLinks`を配列に圧縮することに成功しました。次に、この配列は2つのサブリストにフィルタリングされます：`LinkedPosts`と`DuplicatePosts`であり、外部結合からの空の結果を除外します。

新しい非正規化構造を確認するために、いくつかの行を選択します：

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

## 非正規化の統括とスケジューリング {#orchestrating-and-scheduling-denormalization}

### バッチ {#batch}

非正規化を活用するには、トランスフォーメーションプロセスが必要です。その中で実施し、統率することが可能です。

ClickHouseは`INSERT INTO SELECT`を通じてデータがロードされた後に、このトランスフォーメーションを実行する方法を示しました。これは定期的なバッチ変換に適しています。

ユーザーは、定期的なバッチロードプロセスが許容されると仮定すると、ClickHouse内でこれを統率するオプションがいくつかあります：

- **[リフレッシュ可能なMaterialized Views](/materialized-view/refreshable-materialized-view)** - リフレッシュ可能なMaterialized Viewsは、定期的にクエリをスケジュールし、その結果をターゲットテーブルに送信するために使用できます。クエリが実行されると、ビューはターゲットテーブルが原子的に更新されることを保証します。これはClickHouseネイティブな方法で、この作業をスケジュールできます。
- **外部ツール** - [dbt](https://www.getdbt.com/)や[Airflow](https://airflow.apache.org/)などのツールを利用して、定期的に変換をスケジュールすることができます。[dbtのClickHouse統合](/integrations/dbt)により、これは原子的に実行され、新しいバージョンのターゲットテーブルが作成され、クエリを受信するバージョンと原子的に交換されます（[EXCHANGE](/sql-reference/statements/exchange)コマンド経由）。

### ストリーミング {#streaming}

ユーザーは、ClickHouseの外部で、このプロセスをデータを挿入する前に実行することを希望するかもしれません。例えば、[Apache Flink](https://flink.apache.org/)などのストリーミング技術を使用します。あるいは、データが挿入される際にこのプロセスを実行するために、増分の[Materialized Views](/guides/developer/cascading-materialized-views)を使用できます。
