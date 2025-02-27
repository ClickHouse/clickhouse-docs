---
slug: /engines/table-engines/mergetree-family/invertedindexes
sidebar_label: フルテキストインデックス
description: テキスト内の検索用語を迅速に見つける。
keywords: [フルテキスト検索, テキスト検索, インデックス, インデックス]
title: "フルテキストインデックスを使用したフルテキスト検索"
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# フルテキストインデックスを使用したフルテキスト検索

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

フルテキストインデックスは、[セカンダリインデックス](/engines/table-engines/mergetree-family/mergetree.md/#available-types-of-indices)の実験的なタイプであり、[String](/sql-reference/data-types/string.md)または[FixedString](/sql-reference/data-types/fixedstring.md)カラムに対して、高速なテキスト検索機能を提供します。フルテキストインデックスの主なアイデアは、「用語」とそれを含む行のマッピングを保存することです。「用語」とは、文字列カラムのトークン化されたセルのことです。たとえば、文字列セル「I will be a little late」はデフォルトで六つの用語「I」、「will」、「be」、「a」、「little」、「late」にトークン化されます。もう一つのトークナイザーのタイプはn-グラムです。たとえば、3-グラムトークン化の結果は21の用語「I w」、「 wi」、「wil」、「ill」、「ll 」、「l b」、「 be」などになります。入力文字列がより細かくトークン化されるほど、結果的なフルテキストインデックスは大きく、かつより有用になります。

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/O_MnyUkrIq8"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

:::note
フルテキストインデックスは実験的であり、まだ本番環境では使用すべきではありません。将来的にはDDL/DQL構文やパフォーマンス/圧縮特性に関して、後方互換性のない形で変更される可能性があります。
:::

## 使用法 {#usage}

フルテキストインデックスを使用するには、まず設定でそれらを有効にします：

```sql
SET allow_experimental_full_text_index = true;
```

フルテキストインデックスは、次の構文を使って文字列カラムに定義できます：

``` sql
CREATE TABLE tab
(
    `key` UInt64,
    `str` String,
    INDEX inv_idx(str) TYPE full_text(0) GRANULARITY 1
)
ENGINE = MergeTree
ORDER BY key
```

:::note
ClickHouseの以前のバージョンでは、対応するインデックスタイプ名は`inverted`でした。
:::

ここで、`N`はトークナイザーを指定します：

- `full_text(0)`（あるいは短く表記して`full_text()`）はトークナイザーを「トークン」に設定し、すなわち空白で文字列を分割します。
- `full_text(N)`は`N`が2から8の間で、トークナイザーを「ngrams(N)」に設定します。

ポスティングリストあたりの最大行数は、第二のパラメータとして指定できます。このパラメータは、巨大なポスティングリストファイルの生成を避けるためにポスティングリストのサイズを制御するために使用されます。以下のバリエーションがあります：

- `full_text(ngrams, max_rows_per_postings_list)`：指定されたmax_rows_per_postings_listを使用します（0でないと仮定）。
- `full_text(ngrams, 0)`：ポスティングリストあたりの最大行数の制限はありません。
- `full_text(ngrams)`：デフォルトの最大行数（64K）を使用します。

スキップインデックスの一種であるフルテキストインデックスは、テーブル作成後にカラムに追加したり削除したりできます：

``` sql
ALTER TABLE tab DROP INDEX inv_idx;
ALTER TABLE tab ADD INDEX inv_idx(s) TYPE full_text(2);
```

インデックスを使用するために特別な関数や構文は必要ありません。典型的な文字列検索述語は自動的にインデックスを活用します。以下はその例です：

```sql
INSERT INTO tab(key, str) values (1, 'Hello World');
SELECT * from tab WHERE str == 'Hello World';
SELECT * from tab WHERE str IN ('Hello', 'World');
SELECT * from tab WHERE str LIKE '%Hello%';
SELECT * from tab WHERE multiSearchAny(str, ['Hello', 'World']);
SELECT * from tab WHERE hasToken(str, 'Hello');
```

フルテキストインデックスは、`Array(String)`, `Array(FixedString)`, `Map(String)`, および `Map(String)`のカラムにも機能します。

他のセカンダリインデックスと同様に、各カラムパートは独自のフルテキストインデックスを持ちます。さらに、各フルテキストインデックスは内部的に「セグメント」に分割されます。セグメントの存在とサイズは通常ユーザーにとって透過的ですが、セグメントサイズはインデックス構築中のメモリ消費量を決定します（例えば、二つのパーツがマージされるとき）。設定パラメータ「max_digestion_size_per_segment」（デフォルトは256MB）は、新しいセグメントが作成される前に基盤となるカラムから読み込まれるデータ量を制御します。このパラメータを増やすと、インデックス構築中の中間メモリ消費量が増加しますが、クエリを評価するために平均してチェックする必要のあるセグメントが少なくなるため、ルックアップパフォーマンスも向上します。

## Hacker Newsデータセットのフルテキスト検索 {#full-text-search-of-the-hacker-news-dataset}

多くのテキストが含まれる大規模データセットにおけるフルテキストインデックスのパフォーマンス改善を見てみましょう。人気のHacker Newsウェブサイトにある2870万行のコメントを使用します。こちらがフルテキストインデックスなしのテーブルです：

```sql
CREATE TABLE hackernews (
    id UInt64,
    deleted UInt8,
    type String,
    author String,
    timestamp DateTime,
    comment String,
    dead UInt8,
    parent UInt64,
    poll UInt64,
    children Array(UInt32),
    url String,
    score UInt32,
    title String,
    parts Array(UInt32),
    descendants UInt32
)
ENGINE = MergeTree
ORDER BY (type, author);
```

2870万行はS3内のParquetファイルに格納されています - それを`hackernews`テーブルに挿入しましょう：

```sql
INSERT INTO hackernews
	SELECT * FROM s3Cluster(
        'default',
        'https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.parquet',
        'Parquet',
        '
    id UInt64,
    deleted UInt8,
    type String,
    by String,
    time DateTime,
    text String,
	dead UInt8,
	parent UInt64,
	poll UInt64,
    kids Array(UInt32),
    url String,
    score UInt32,
    title String,
    parts Array(UInt32),
    descendants UInt32');
```

`comment`カラム内で用語`ClickHouse`（およびその大文字と小文字のバリエーション）の単純な検索を考えてみましょう：

```sql
SELECT count()
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse');
```

このクエリを実行するのに3秒かかります：

```response
┌─count()─┐
│    1145 │
└─────────┘

1 row in set. Elapsed: 3.001 sec. Processed 28.74 million rows, 9.75 GB (9.58 million rows/s., 3.25 GB/s.)
```

次に、`ALTER TABLE`を使用して`comment`カラムの小文字にフルテキストインデックスを追加し、インデックスをマテリアライズします（マテリアライズには少し時間がかかる場合がありますので、完了するまで待ちください）：

```sql
ALTER TABLE hackernews
     ADD INDEX comment_lowercase(lower(comment)) TYPE full_text;

ALTER TABLE hackernews MATERIALIZE INDEX comment_lowercase;
```

同じクエリを実行します...

```sql
SELECT count()
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse')
```

...そして、クエリが4倍速く実行されることに気付きます：

```response
┌─count()─┐
│    1145 │
└─────────┘

1 row in set. Elapsed: 0.747 sec. Processed 4.49 million rows, 1.77 GB (6.01 million rows/s., 2.37 GB/s.)
```

さらに、複数の用語のいずれか、またはすべてを検索することもできます。即ち、論理和または論理積です：

```sql
-- 複数のOR条件の用語
SELECT count(*)
FROM hackernews
WHERE multiSearchAny(lower(comment), ['oltp', 'olap']);

-- 複数のAND条件の用語
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'avx') AND hasToken(lower(comment), 'sve');
```

:::note
他のセカンダリインデックスとは異なり、フルテキストインデックスは（今のところ）行番号（行ID）にマップされています。これによりパフォーマンスが向上します。実際には、ユーザーはしばしば複数の用語を一度に検索します。例えば、フィルタ述語`WHERE s LIKE '%little%' OR s LIKE '%big%'`は、用語「little」と「big」の行IDリストの和を形成することによって直接実行できます。これにより、インデックス作成時に供給されたパラメータ`GRANULARITY`は意味を持たなくなります（将来的に構文から削除されるかもしれません）。
:::

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける逆インデックスの紹介](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
