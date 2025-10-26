---
'slug': '/data-modeling/denormalization'
'title': 'データの非正規化'
'description': '非正規化を使用してクエリパフォーマンスを向上させる方法'
'keywords':
- 'data denormalization'
- 'denormalize'
- 'query optimization'
'doc_type': 'guide'
---

import denormalizationDiagram from '@site/static/images/data-modeling/denormalization-diagram.png';
import denormalizationSchema from '@site/static/images/data-modeling/denormalization-schema.png';
import Image from '@theme/IdealImage';


# デノーマライズデータ

データのデノーマライズは、ClickHouseにおけるテクニックであり、フラットなテーブルを使用してクエリのレイテンシを最小限に抑えるためにジョインを回避します。

## 正規化とデノーマライズされたスキーマの比較 {#comparing-normalized-vs-denormalized-schemas}

データのデノーマライズは、特定のクエリパターンのためにデータベースのパフォーマンスを最適化するために、意図的に正規化プロセスを逆転させることを含みます。正規化されたデータベースでは、冗長性を最小限に抑え、データの整合性を確保するためにデータが複数の関連テーブルに分割されます。デノーマライズは、テーブルを統合し、データを複製し、計算されたフィールドを1つのテーブルまたはより少ないテーブルに組み込むことによって冗長性を再導入します - 事実上、クエリから挿入時にジョインを移動させます。

このプロセスは、クエリ時の複雑なジョインの必要性を減少させ、読み取り操作を大幅にスピードアップし、重い読み取り要件と複雑なクエリを持つアプリケーションに最適です。ただし、複製されたデータに対する変更は全インスタンスに伝播する必要があるため、書き込み操作やメンテナンスの複雑さが増す可能性があります。

<Image img={denormalizationDiagram} size="lg" alt="ClickHouseにおけるデノーマライズ"/>

<br />

NoSQLソリューションによって普及した一般的な手法は、`JOIN`サポートのない状況でデータをデノーマライズし、親行のすべての統計または関連行をカラムおよびネストされたオブジェクトとして格納することです。たとえば、ブログのスキーマの例では、すべての`Comments`をそれぞれの投稿のオブジェクトの`Array`として格納できます。

## デノーマライズを使用するタイミング {#when-to-use-denormalization}

一般的に、以下の場合にデノーマライズを推奨します：

- 変更が稀にしか行われないテーブルをデノーマライズするか、分析クエリにデータが利用可能になるまでの遅延が許容される場合、すなわちデータをバッチで完全に再ロードできる場合。
- 多対多の関係をデノーマライズするのは避けるべきです。これは、単一のソース行が変更された場合、多くの行を更新する必要が生じる可能性があります。
- 高いカーディナリティの関係をデノーマライズするのは避けるべきです。テーブルの各行に対して別のテーブルに数千の関連エントリがある場合、これらは`Array`として表現する必要があります - 原始型またはタプルのいずれかです。一般的に、1000以上のタプルを含む配列は推奨されません。
- すべてのカラムをネストされたオブジェクトとしてデノーマライズするのではなく、マテリアライズドビューを使用して統計情報のみをデノーマライズすることを検討してください（下記参照）。 

すべての情報をデノーマライズする必要はありません - 頻繁にアクセスされる必要のあるキー情報だけです。

デノーマライズ作業は、ClickHouseや上流で（例：Apache Flinkを使用して）処理することができます。

## 頻繁に更新されるデータのデノーマライズを避ける {#avoid-denormalization-on-frequently-updated-data}

ClickHouseにとって、デノーマライズはクエリパフォーマンスを最適化するためのいくつかのオプションの1つですが、慎重に使用する必要があります。データが頻繁に更新され、ほぼリアルタイムで更新される必要がある場合、このアプローチは避けるべきです。メインテーブルが主に追加のみであるか、定期的にバッチとして再ロードできる場合（例：日次）に使用します。

このアプローチは、主に1つの課題、すなわち書き込みパフォーマンスとデータ更新の課題に直面します。具体的には、デノーマライズはデータのジョインの責任をクエリ時間から取り込み時間にシフトさせます。このことはクエリパフォーマンスを大幅に改善する可能性がありますが、データの取り込みを複雑にし、構成に使用された行のいずれかが変更された場合、データパイプラインがClickHouseに行を再挿入する必要があることを意味します。これは、1つのソース行の変更がClickHouse内の多くの行を更新する必要がある可能性を意味します。複雑なスキーマでは、行が複雑なジョインから構成されている場合、ジョインのネストされたコンポーネント内の1つの行の変更は、潜在的に何百万もの行を更新する必要があることを意味する可能性があります。

これをリアルタイムで実現することはしばしば非現実的であり、技術的に膨大な工数を要します。二つの挑戦があるためです：

1. テーブル行が変更されたときに正しいジョイン文をトリガーすること。これは理想的には、ジョイン全体のすべてのオブジェクトを更新することなく、影響を受けたものだけを更新する必要があります。高スループットのもとで効率的に正しい行をフィルタリングするために、外部ツールやエンジニアリングが必要です。
1. ClickHouse内の行の更新を慎重に管理する必要があり、追加の複雑さを導入します。

<br />

したがって、すべてのデノーマライズオブジェクトを定期的に再ロードするバッチ更新プロセスがより一般的です。

## デノーマライズの実用的なケース {#practical-cases-for-denormalization}

デノーマライズが意義を持つ実用的な例と、他のアプローチがより望ましい場合をいくつか考えてみましょう。

`Posts`テーブルがすでに`AnswerCount`や`CommentCount`といった統計でデノーマライズされているとしましょう - ソースデータはこの形式で提供されます。実際には、これらの情報は頻繁に変更される可能性が高いため、正規化することを望むかもしれません。これらのカラムの多くは他のテーブルを通じても利用可能です - たとえば、投稿のコメントは`PostId`カラムと`Comments`テーブル経由で利用可能です。例では、投稿はバッチプロセスで再ロードされると仮定します。

私たちはまた、`Posts`にデノーマライズする他のテーブルについてのみ考えています、これは私たちが分析のためのメインテーブルと考えるからです。逆方向でのデノーマライズも、同様の考慮が適用されるいくつかのクエリには適切です。

*以下の各例では、両方のテーブルを使用したクエリが存在することを前提とします。*

### 投稿と投票 {#posts-and-votes}

投稿への投票は、別のテーブルとして表現されます。これに対する最適化されたスキーマは以下に示されており、データをロードするための挿入コマンドも示されています。

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

一見すると、これらは投稿テーブルでデノーマライズする候補かもしれません。しかし、このアプローチにはいくつかの課題があります。

投票は投稿に頻繁に追加されます。この数は時間の経過とともに投稿ごとに減少するかもしれませんが、次のクエリは30,000の投稿に対して約40,000の投票があることを示しています。

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
│               41759 │         33322 │
└──────────────────┴──────────────────┘
```

これに対処するには、遅延が許容できる場合にはバッチ処理が可能ですが、すべての投稿を定期的に再ロードしない限り、更新を処理する必要があります（望ましくない状況です）。

さらに問題なのは、一部の投稿に非常に多くの投票があることです：

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

ここでの主な観察は、各投稿の集計投票統計がほとんどの分析に対して十分であるということです - すべての投票情報をデノーマライズする必要はありません。たとえば、現在の`Score`カラムはそのような統計を表しています。すなわち、合計のアップ投票からダウン投票を引いたものです。理想的には、クエリ時にシンプルなルックアップでこれらの統計を取得できることが望ましいです（[dictionaries](/dictionary)を参照）。

### ユーザーとバッジ {#users-and-badges}

次に、`Users`と`Badges`について考えましょう：

<Image img={denormalizationSchema} size="lg" alt="ユーザーとバッジのスキーマ"/>

<p></p>
以下のコマンドでデータを挿入します：
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

ユーザーがバッジを頻繁に取得するかもしれませんが、これはデイリー以上に頻繁に更新する必要があるデータセットとは考えにくいです。バッジとユーザーの関係は一対多です。おそらく、バッジをユーザーにタプルのリストとして単にデノーマライズすることができるかもしれません。しかし、ユーザーあたりの最大バッジ数を確認すると理想的ではないことが分かります：

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

1行に19,000のオブジェクトをデノーマライズするのは現実的ではないでしょう。この関係は、別のテーブルとして残すか、統計を追加した方が良いかもしれません。

> ユーザーへのバッジからの統計（たとえば、バッジの数）をデノーマライズすることを考えるかもしれません。挿入時にこのデータセットのために辞書を使用する際の例として考えます。

### 投稿と投稿リンク {#posts-and-postlinks}

`PostLinks`は、ユーザーが関連している、または重複していると考える`Posts`を結びつけます。次のクエリはスキーマとロードコマンドを示しています：

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

デノーマライズを妨げる過剰なリンクがないことを確認できます：

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

同様に、これらのリンクは非常に頻繁に発生しているイベントではありません：

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
│                54 │                    44     │
└──────────────────┴──────────────────┘
```

これを以下のデノーマライズの例とします。

### シンプルな統計の例 {#simple-statistic-example}

ほとんどの場合、デノーマライズは親行に単一のカラムまたは統計を追加する必要があります。たとえば、重複投稿の数で投稿を豊かにしたいとし、単にカラムを追加する必要があるかもしれません。

```sql
CREATE TABLE posts_with_duplicate_count
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -other columns
   `DuplicatePosts` UInt16
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

このテーブルをポピュレートするために、重複統計を投稿と結合する`INSERT INTO SELECT`を利用します。

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

### 一対多の関係のための複雑なタイプの活用 {#exploiting-complex-types-for-one-to-many-relationships}

デノーマライズを行うためには、複雑なタイプを利用する必要があります。一対一の関係がデノーマライズされている場合、カラムの数が少ない場合、ユーザーは単にこれらを元のタイプの行として追加できます。上で示しましたが、大きなオブジェクトに対しては望ましくないことが多く、一対多の関係には適用できません。

複雑なオブジェクトまたは一対多の関係の場合、ユーザーは次のような方法を使用できます：

- 名前付きタプル - 関連構造を列のセットとして表現できるようにします。
- Array(Tuple) または Nested - 名前付きタプルの配列で、各エントリがオブジェクトを表します。一対多の関係に適用されます。

例として、以下に`PostLinks`を`Posts`にデノーマライズする方法を示します。

各投稿には他の投稿へのリンクの数が含まれる可能性があり、これは前述の`PostLinks`スキーマのように表現できます。ネストされたタイプとして、これらのリンクされた重複投稿を次のように表現することができます：

```sql
SET flatten_nested=0
CREATE TABLE posts_with_links
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -other columns
   `LinkedPosts` Nested(CreationDate DateTime64(3, 'UTC'), PostId Int32),
   `DuplicatePosts` Nested(CreationDate DateTime64(3, 'UTC'), PostId Int32),
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

> 設定`flatten_nested=0`の使用に注意してください。ネストされたデータのフラッティングを無効にすることを推奨します。

これを`INSERT INTO SELECT`と`OUTER JOIN`クエリを使用してデノーマライズを行うことができます：

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

> ここでのタイミングに注意してください。約2分で6600万行のデノーマライズができました。後で見ていくように、これはスケジュール可能な操作です。

`groupArray`関数を使用して、`PostLinks`を各`PostId`ごとの配列に集約し、結合の前にフィルタリングします。この配列は、その後、`LinkedPosts`および`DuplicatePosts`という2つのサブリストにフィルタリングされ、外部結合からの空の結果を除外します。

新しいデノーマライズされた構造を確認するために、いくつかの行を選択できます：

```sql
SELECT LinkedPosts, DuplicatePosts
FROM posts_with_links
WHERE (length(LinkedPosts) > 2) AND (length(DuplicatePosts) > 0)
LIMIT 1
FORMAT Vertical

Row 1:
──────
LinkedPosts:    [('2017-04-11 11:53:09.583',3404508),('2017-04-11 11:49:07.680',3922739),('2017-04-11 11:48:33.353',33058004)]
DuplicatePosts: [('2017-04-11 12:18:37.260',3922739),('2017-04-11 12:18:37.260',33058004)]
```

## デノーマライズの調整とスケジューリング {#orchestrating-and-scheduling-denormalization}

### バッチ {#batch}

デノーマライズを活用するには、変換プロセスを通じて実行され、調整される必要があります。

上記で示したように、ClickHouseは、データが`INSERT INTO SELECT`を介して読み込まれた後、この変換を実行するために使用できます。これは定期的なバッチ変換に適しています。

ユーザーは、定期的なバッチロードプロセスが許容されると仮定して、ClickHouseでの調整のためのいくつかのオプションがあります：

- **[Refreshable Materialized Views](/materialized-view/refreshable-materialized-view)** - リフレッシュ可能なマテリアライズドビューは、結果がターゲットテーブルに送信されるクエリを定期的にスケジュールするために使用できます。クエリ実行時にビューはターゲットテーブルを原子的に更新します。これは、この作業をスケジュールするためのClickHouseネイティブな方法を提供します。
- **外部ツール** - [dbt](https://www.getdbt.com/)や[Airflow](https://airflow.apache.org/)などのツールを利用して、変換を定期的にスケジュールすることができます。[ClickHouseのdbt統合](/integrations/dbt)は、ターゲットテーブルの新しいバージョンが作成され、その後原子的にクエリを受け取るバージョンと交換されることを保障します（[EXCHANGE](/sql-reference/statements/exchange)コマンドを介して）。

### ストリーミング {#streaming}

ユーザーは、ClickHouseの外部で挿入前にこのプロセスを実行することを望むかもしれません。Apache Flink（[Apache Flink](https://flink.apache.org/)）などのストリーミング技術を使用します。あるいは、データが挿入される際にこのプロセスを実行するために増分の[マテリアライズドビュー](/guides/developer/cascading-materialized-views)を使用することもできます。
