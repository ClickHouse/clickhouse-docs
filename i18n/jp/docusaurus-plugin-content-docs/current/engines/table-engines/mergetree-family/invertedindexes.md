---
slug: /engines/table-engines/mergetree-family/invertedindexes
sidebar_label: フルテキストインデックス
description: テキスト内の検索語を素早く見つけます。
keywords: [フルテキスト検索, テキスト検索, インデックス, インデックス]
title: "フルテキストインデックスを使用したフルテキスト検索"
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# フルテキストインデックスを使用したフルテキスト検索

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

フルテキストインデックスは、[二次インデックス](/engines/table-engines/mergetree-family/mergetree.md/#available-types-of-indices)の実験的なタイプで、[String](/sql-reference/data-types/string.md)または[FixedString](/sql-reference/data-types/fixedstring.md)カラムのための高速なテキスト検索機能を提供します。フルテキストインデックスの主なアイデアは、「語句」からこれらの語句を含む行へのマッピングを保存することです。「語句」は、文字列カラムのトークン化されたセルです。たとえば、文字列セル「I will be a little late」はデフォルトで6つの語句「I」、「will」、「be」、「a」、「little」、「late」にトークン化されます。別のタイプのトークナイザーはn-グラムです。たとえば、3-グラムトークン化の結果は21の語句「I w」、「 wi」、「wil」、「ill」、「ll」、「l b」、「 be」などになります。入力文字列がより細かくトークン化されるほど、結果として得られるフルテキストインデックスは大きく、より有用になります。

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
フルテキストインデックスは実験的であり、まだ本番環境では使用しないでください。将来的には、DDL/DQL構文やパフォーマンス/圧縮特性について後方互換性のない方法で変更される可能性があります。
:::

## 使用法 {#usage}

フルテキストインデックスを使用するには、まず設定でそれらを有効にします。

```sql
SET allow_experimental_full_text_index = true;
```

フルテキストインデックスは、以下の構文を使用して文字列カラムに定義できます。

```sql
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
以前のバージョンのClickHouseでは、対応するインデックスタイプ名は`inverted`でした。
:::

`N`はトークナイザーを指定します。

- `full_text(0)`（または短縮形: `full_text()`）はトークナイザーを「トークン」に設定し、つまり空白で文字列を分割します。
- `full_text(N)`で`N`が2から8の間だと、トークナイザーを「ngrams(N)」に設定します。

ポスティングリストの最大行数は、第二引数として指定できます。このパラメーターは、巨大なポスティングリストファイルの生成を避けるためにポスティングリストのサイズを制御するために使用できます。以下のバリエーションがあります。

- `full_text(ngrams, max_rows_per_postings_list)`：指定されたmax_rows_per_postings_listを使用します（0でないと仮定します）
- `full_text(ngrams, 0)`：ポスティングリストの最大行数に制限なし
- `full_text(ngrams)`：デフォルトの最大行数（64K）を使用します。

スキッピングインデックスの一種であるフルテキストインデックスは、テーブル作成後にカラムに追加または削除できます。

```sql
ALTER TABLE tab DROP INDEX inv_idx;
ALTER TABLE tab ADD INDEX inv_idx(s) TYPE full_text(2);
```

インデックスを使用するには、特別な関数や構文は必要ありません。典型的な文字列検索条件は自動的にインデックスを利用します。例えば、以下のようなクエリを考えてみましょう。

```sql
INSERT INTO tab(key, str) values (1, 'Hello World');
SELECT * from tab WHERE str == 'Hello World';
SELECT * from tab WHERE str IN ('Hello', 'World');
SELECT * from tab WHERE str LIKE '%Hello%';
SELECT * from tab WHERE multiSearchAny(str, ['Hello', 'World']);
SELECT * from tab WHERE hasToken(str, 'Hello');
```

フルテキストインデックスは、`Array(String)`、`Array(FixedString)`、`Map(String)`および`Map(String)`型のカラムにも適用されます。

他の二次インデックスと同様に、各カラムパーツには独自のフルテキストインデックスがあります。さらに、各フルテキストインデックスは内部的に「セグメント」に分けられます。セグメントの存在とサイズは通常、ユーザーにとって透過的ですが、セグメントサイズはインデックス構築中のメモリ消費を決定します（例：2つのパーツがマージされるとき）。設定パラメーター「max_digestion_size_per_segment」（デフォルト: 256 MB）は、新しいセグメントが作成される前に基盤となるカラムから読み取られるデータの量を制御します。このパラメーターを増やすと、インデックス構築の中間メモリ消費量が増加しますが、クエリを評価するために平均してチェックする必要があるセグメントの数が減少するため、検索パフォーマンスも向上します。

## Hacker Newsデータセットのフルテキスト検索 {#full-text-search-of-the-hacker-news-dataset}

大量のテキストを含む大規模データセットにおけるフルテキストインデックスのパフォーマンス改善を見てみましょう。人気のHacker Newsウェブサイトでの2870万行のコメントを使用します。次のテーブルはフルテキストインデックスなしのものです。

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

2870万行はS3のParquetファイルにあり、これを`hackernews`テーブルに挿入します。

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

次に、`comment`カラムで`ClickHouse`（およびその大文字小文字のバリエーション）という用語を検索します。

```sql
SELECT count()
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse');
```

クエリの実行には3秒かかることに注意してください。

```response
┌─count()─┐
│    1145 │
└─────────┘

1行の結果がセットされました。経過時間: 3.001秒。2874万行、9.75 GBが処理されました（950万行/秒、3.25 GB/秒）。
```

`ALTER TABLE`を使用して、`comment`カラムの小文字にフルテキストインデックスを追加し、次にそれをマテリアライズします（これには時間がかかる場合があります - マテリアライズが完了するまで待ちます）。

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

...すると、クエリの実行速度が4倍速くなることに気づきます。

```response
┌─count()─┐
│    1145 │
└─────────┘

1行の結果がセットされました。経過時間: 0.747秒。449万行、1.77 GBが処理されました（601万行/秒、2.37 GB/秒）。
```

複数の用語のいずれかまたはすべてを検索することもできます。すなわち、選言または連言です。

```sql
-- 複数のORでの用語
SELECT count(*)
FROM hackernews
WHERE multiSearchAny(lower(comment), ['oltp', 'olap']);

-- 複数のANDでの用語
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'avx') AND hasToken(lower(comment), 'sve');
```

:::note
他の二次インデックスとは異なり、フルテキストインデックスは（現在のところ）行番号（行ID）にマッピングされます。これはパフォーマンスのためです。実際には、ユーザーはしばしば複数の語句を一度に検索します。たとえば、フィルタ条件`WHERE s LIKE '%little%' OR s LIKE '%big%'`は、インデックスによって「little」と「big」の語句の行IDリストの和を形成することにより直接評価できます。これにより、インデックス作成時に提供される`GRANULARITY`パラメーターは意味がなくなります（将来的には構文から削除される可能性があります）。
:::

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける逆インデックスの紹介](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
