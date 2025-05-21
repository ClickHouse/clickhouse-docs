description: 'テキスト内の検索語を迅速に見つける。'
keywords: ['全文検索', 'テキスト検索', 'インデックス', 'インデックス群']
sidebar_label: '全文インデックス'
slug: /engines/table-engines/mergetree-family/invertedindexes
title: '全文インデックスを使用した全文検索'
```

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 全文インデックスを使用した全文検索

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

全文インデックスは、[セカンダリインデックス](/engines/table-engines/mergetree-family/mergetree.md/#available-types-of-indices)の実験的なタイプで、[String](/sql-reference/data-types/string.md)または[FixedString](/sql-reference/data-types/fixedstring.md)カラムに対して迅速なテキスト検索機能を提供します。全文インデックスの主なアイデアは、「用語」からこれらの用語を含む行へのマッピングを保存することです。「用語」は、文字列カラムのトークン化されたセルです。たとえば、文字列セル「I will be a little late」は、デフォルトで「I」、「will」、「be」、「a」、「little」、「late」の6つの用語にトークン化されます。別のタイプのトークナイザーはn-gramsです。たとえば、3-gramトークン化の結果は「I w」、「 wi」、「wil」、「ill」、「ll 」、「l b」、「 be」などの21の用語になります。入力文字列が細かくトークン化されるほど、得られる全文インデックスは大きくなりますが、同時に有用性も増します。

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
全文インデックスは実験的であり、まだ本番環境では使用すべきではありません。将来的にDDL/DQL構文や性能/圧縮特性に関して後方互換性のない方法で変更される可能性があります。
:::

## 使用法 {#usage}

全文インデックスを使用するには、まず設定で有効にします。

```sql
SET allow_experimental_full_text_index = true;
```

次に、以下の構文を使用して文字列カラムに全文インデックスを定義できます。

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

ここで、`tokenizer`はトークナイザーを指定します：

- `default` は「tokens('default')」にトークナイザーを設定します。つまり、文字列を英数字以外の文字で分割します。
- `ngram` は「tokens('ngram')」にトークナイザーを設定します。つまり、文字列を等しいサイズの用語に分割します。
- `noop` は「tokens('noop')」にトークナイザーを設定します。つまり、各値自体が用語になります。

n-gramサイズは`ngram_size`パラメータを介して指定できます。これはオプションのパラメータです。以下のバリエーションがあります：

- `ngram_size = N`：`N`が2から8の間で、トークナイザーを「tokens('ngram', N)」に設定します。
- 指定しない場合：デフォルトのn-gramサイズが3が使用されます。

投稿リストあたりの最大行数は、オプションの`max_rows_per_postings_list`を介して指定できます。このパラメータは、巨大な投稿リストファイルの生成を避けるために、投稿リストのサイズを制御するために使用できます。以下のバリエーションがあります：

- `max_rows_per_postings_list = 0`：投稿リストあたりの最大行数に制限はありません。
- `max_rows_per_postings_list = M`：`M`は少なくとも8192である必要があります。
- 指定しない場合：デフォルトの最大行数が64Kが使用されます。

データスキッピングインデックスの一種である全文インデックスは、テーブル作成後にカラムに追加または削除できます。

```sql
ALTER TABLE tab DROP INDEX inv_idx;
ALTER TABLE tab ADD INDEX inv_idx(s) TYPE gin(tokenizer = 'default');
```

インデックスを使用するには、特別な関数や構文は必要ありません。一般的な文字列検索述語は自動的にインデックスを活用します。例として、以下を考慮してください：

```sql
INSERT INTO tab(key, str) values (1, 'Hello World');
SELECT * from tab WHERE str == 'Hello World';
SELECT * from tab WHERE str IN ('Hello', 'World');
SELECT * from tab WHERE str LIKE '%Hello%';
SELECT * from tab WHERE multiSearchAny(str, ['Hello', 'World']);
SELECT * from tab WHERE hasToken(str, 'Hello');
```

全文インデックスは、`Array(String)`、`Array(FixedString)`、`Map(String)`および`Map(String)`型の列にも適用されます。

他のセカンダリインデックスと同様に、各カラムパートには独自の全文インデックスがあります。さらに、各全文インデックスは内部的に「セグメント」に分割されています。セグメントの存在とサイズは一般的にはユーザーには透明ですが、セグメントサイズはインデックス構築中のメモリ消費を決定します（例えば、2つのパーツがマージされるとき）。設定パラメータ「max_digestion_size_per_segment」（デフォルト：256 MB）は、新しいセグメントが作成される前に基盤となるカラムから消費されるデータの量を制御します。パラメータを増加させることで、インデックス構築中の中間メモリ消費が増加しますが、クエリを評価する際に、平均してチェックする必要のあるセグメントが少なくなるため、ルックアップ性能も向上します。

## Hacker News データセットの全文検索 {#full-text-search-of-the-hacker-news-dataset}

大量のテキストを持つ大規模データセットにおける全文インデックスのパフォーマンス向上を見てみましょう。人気のHacker Newsウェブサイトの28.7M行のコメントを使用します。全文インデックスのないテーブルは次のとおりです。

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

28.7M行はS3のParquetファイルにあり、`hackernews`テーブルに挿入します。

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

`comment`カラム内の用語`ClickHouse`（およびその大小文字の変化）に対する次の単純な検索を考えてみましょう：

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

`ALTER TABLE`を使用して、`comment`カラムの小文字に全文インデックスを追加し、それをマテリアライズします（これは時間がかかる場合があります。マテリアライズが完了するまで待ちます）：

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

...そしてクエリが4倍速く実行されることに気づきます：

```response
┌─count()─┐
│    1145 │
└─────────┘

1 row in set. Elapsed: 0.747 sec. Processed 4.49 million rows, 1.77 GB (6.01 million rows/s., 2.37 GB/s.)
```

また、複数の用語の1つまたはすべてを検索したり、つまり、論理和や論理積を実行したりできます。

```sql
-- 複数のORで結合された用語
SELECT count(*)
FROM hackernews
WHERE multiSearchAny(lower(comment), ['oltp', 'olap']);

-- 複数のANDで結合された用語
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'avx') AND hasToken(lower(comment), 'sve');
```

:::note
他のセカンダリインデックスとは異なり、全文インデックスは（現在のところ）行番号（行ID）にマッピングされます。これはパフォーマンス上の理由からです。実際、ユーザーは複数の用語を一度に検索することが多いです。たとえば、フィルタ述語 `WHERE s LIKE '%little%' OR s LIKE '%big%'` は、用語「little」と「big」の行IDリストの和を形成することによって、全文インデックスを使用して直接評価できます。これは、インデックス作成時に指定されたパラメータ`GRANULARITY`が意味を持たないことも意味します（将来的に構文から削除される可能性があります）。
:::

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける逆インデックスの導入](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
