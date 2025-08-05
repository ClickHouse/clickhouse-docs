---
description: 'テキスト内の検索用語を迅速に見つけます。'
keywords:
- 'full-text search'
- 'text search'
- 'index'
- 'indices'
sidebar_label: 'フルテキストインデックス'
slug: '/engines/table-engines/mergetree-family/invertedindexes'
title: 'フルテキスト検索を使用したフルテキストインデックス'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# フルテキスト検索とフルテキストインデックスの使用

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

フルテキストインデックスは、[セカンダリインデックス](/engines/table-engines/mergetree-family/mergetree.md/#available-types-of-indices)の実験的なタイプで、[String](/sql-reference/data-types/string.md)または[FixedString](/sql-reference/data-types/fixedstring.md)カラムのための高速テキスト検索機能を提供します。フルテキストインデックスの主なアイデアは、「用語」とそれらを含む行とのマッピングを保存することです。「用語」は文字列カラムのトークン化されたセルです。たとえば、文字列セル「I will be a little late」はデフォルトで六つの用語「I」、「will」、「be」、「a」、「little」、「late」にトークン化されます。別のトークナイザの種類はn-グラムです。例えば、3-グラムトークン化の結果は21の用語「I w」、「 wi」、「wil」、「ill」、「ll 」、「l b」、「 be」などとなります。入力文字列が細かくトークン化されるほど、結果として得られるフルテキストインデックスは大きく、かつより有用になります。

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
フルテキストインデックスは実験的であり、まだ本番環境での使用には適していません。将来的にはDDL/DQL構文やパフォーマンス/圧縮特性に関して後方互換性のない方法で変更される可能性があります。
:::

## 使用法 {#usage}

フルテキストインデックスを使用するには、まず設定でそれを有効にします：

```sql
SET allow_experimental_full_text_index = true;
```

フルテキストインデックスは、次の構文を使用して文字列カラムに定義できます。

```sql
CREATE TABLE tab
(
    `key` UInt64,
    `str` String,
    INDEX inv_idx(str) TYPE gin(tokenizer = 'default|ngram|noop' [, ngram_size = N] [, max_rows_per_postings_list = M]) GRANULARITY 1
)
ENGINE = MergeTree
ORDER BY key
```

ここで、`tokenizer`はトークナイザを指定します：

- `default`はトークナイザを「tokens('default')」に設定します。すなわち、非英数字文字に沿って文字列を分割します。
- `ngram`はトークナイザを「tokens('ngram')」に設定します。すなわち、文字列を等しいサイズの用語に分割します。
- `noop`はトークナイザを「tokens('noop')」に設定します。すなわち、各値自体が用語となります。

ngramサイズは、`ngram_size`パラメータを介して指定できます。これはオプションのパラメータです。以下のバリエーションが存在します：

- `ngram_size = N`：`N`が2から8の範囲内で、トークナイザを「tokens('ngram', N)」に設定します。
- 指定しない場合：デフォルトのngramサイズは3を使用します。

最大行数は、オプションの`max_rows_per_postings_list`を介して指定できます。このパラメータは、巨大なポスティングリストファイルを生成しないようにポスティングリストサイズを制御するために使用できます。以下のバリエーションが存在します：

- `max_rows_per_postings_list = 0`：ポスティングリストあたりの最大行数に制限はありません。
- `max_rows_per_postings_list = M`：`M`は少なくとも8192である必要があります。
- 指定しない場合：デフォルトの最大行数は64Kを使用します。

フルテキストインデックスは、テーブル作成後にカラムにドロップまたは追加できます。

```sql
ALTER TABLE tab DROP INDEX inv_idx;
ALTER TABLE tab ADD INDEX inv_idx(s) TYPE gin(tokenizer = 'default');
```

インデックスを使用するには、特別な関数や構文は必要ありません。典型的な文字列検索述語は自動的にインデックスを利用します。例えば：

```sql
INSERT INTO tab(key, str) values (1, 'Hello World');
SELECT * from tab WHERE str == 'Hello World';
SELECT * from tab WHERE str IN ('Hello', 'World');
SELECT * from tab WHERE str LIKE '%Hello%';
SELECT * from tab WHERE multiSearchAny(str, ['Hello', 'World']);
SELECT * from tab WHERE hasToken(str, 'Hello');
```

フルテキストインデックスは、`Array(String)`、`Array(FixedString)`、`Map(String)`、および`Map(String)`タイプのカラムでも機能します。

他のセカンダリインデックスと同様に、各カラムパートには独自のフルテキストインデックスがあります。さらに、各フルテキストインデックスは内部的に「セグメント」に分割されます。セグメントの存在とサイズは一般的にユーザーには透明ですが、セグメントサイズはインデックス構築中のメモリ消費を決定します（例えば、2つのパーツがマージされるとき）。設定パラメータ「max_digestion_size_per_segment」（デフォルト：256 MB）は、新しいセグメントが作成される前に基盤となるカラムから読み込まれるデータ量を制御します。このパラメータを増やすことにより、インデックス構築中の中間メモリ消費が増加しますが、クエリを評価するためにチェックする必要のあるセグメントが少なくなるため、ルックアップパフォーマンスも向上します。

## Hacker Newsデータセットのフルテキスト検索 {#full-text-search-of-the-hacker-news-dataset}

テキストがたくさんある大規模データセットに対するフルテキストインデックスのパフォーマンス向上を見てみましょう。人気のあるHacker Newsウェブサイトの2870万行のコメントを使用します。以下はフルテキストインデックスのないテーブルです：

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

2870万行はS3のParquetファイルにあり、これを`hackernews`テーブルに挿入します：

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

`comment`カラムで `ClickHouse`（さまざまな大文字と小文字のバリエーション）を探す以下の単純な検索を考えてみましょう：

```sql
SELECT count()
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse');
```

クエリの実行に3秒かかることに注意してください：

```response
┌─count()─┐
│    1145 │
└─────────┘

1 row in set. Elapsed: 3.001 sec. Processed 28.74 million rows, 9.75 GB (9.58 million rows/s., 3.25 GB/s.)
```

次に、`ALTER TABLE`を使用して、`comment`カラムの小文字に対してフルテキストインデックスを追加し、それをマテリアライズします（これはしばらく時間がかかる場合があります。マテリアライズされるまで待ってください）：

```sql
ALTER TABLE hackernews
     ADD INDEX comment_lowercase(lower(comment)) TYPE gin;

ALTER TABLE hackernews MATERIALIZE INDEX comment_lowercase;
```

同じクエリを実行します...

```sql
SELECT count()
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse')
```

...そしてクエリが4倍速く実行されることに気付きます：

```response
┌─count()─┐
│    1145 │
└─────────┘

1 row in set. Elapsed: 0.747 sec. Processed 4.49 million rows, 1.77 GB (6.01 million rows/s., 2.37 GB/s.)
```

また、複数の用語、すなわち、選言または共言で検索することもできます：

```sql
-- 複数のOR条件のある用語
SELECT count(*)
FROM hackernews
WHERE multiSearchAny(lower(comment), ['oltp', 'olap']);

-- 複数のAND条件のある用語
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'avx') AND hasToken(lower(comment), 'sve');
```

:::note
他のセカンダリインデックスとは異なり、フルテキストインデックスは（現時点では）行番号（行ID）にマッピングされます。この設計の理由はパフォーマンスです。実際には、ユーザーはしばしば複数の用語を一度に検索します。たとえば、フィルタ述語 `WHERE s LIKE '%little%' OR s LIKE '%big%'` は、「little」と「big」の用語の行IDリストの和を形成することにより、フルテキストインデックスを使用して直接評価できます。これにより、インデックス作成時に提供されるパラメータ `GRANULARITY` は意味を持たなくなります（将来的には構文から削除される可能性があります）。
:::

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける逆インデックスの導入](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
