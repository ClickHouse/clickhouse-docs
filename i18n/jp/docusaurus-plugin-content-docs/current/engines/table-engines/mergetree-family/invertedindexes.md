---
'description': 'テキスト内で検索語を迅速に見つける。'
'keywords':
- 'full-text search'
- 'text index'
- 'index'
- 'indices'
'sidebar_label': 'テキストインデックスを使用した全文検索'
'slug': '/engines/table-engines/mergetree-family/invertedindexes'
'title': 'テキストインデックスを使用した全文検索'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# フルテキスト検索とテキストインデックス

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

ClickHouse のテキストインデックス（「逆引きインデックス」とも呼ばれます）は、文字列データに対して高速なフルテキスト機能を提供します。
インデックスは、カラム内の各トークンを、そのトークンを含む行にマッピングします。
トークンは、トークン化と呼ばれるプロセスによって生成されます。
たとえば、ClickHouse は英語の文「All cat like mice.」をデフォルトで ["All", "cat", "like", "mice"] のようにトークン化します（末尾のドットは無視されます）。
ログデータ用のより高度なトークナイザーも利用可能です。

## テキストインデックスの作成 {#creating-a-text-index}

テキストインデックスを作成するには、まず対応する実験的設定を有効にします：

```sql
SET allow_experimental_full_text_index = true;
```

テキストインデックスは、[String](/sql-reference/data-types/string.md)、[FixedString](/sql-reference/data-types/fixedstring.md)、[Array(String)](/sql-reference/data-types/array.md)、[Array(FixedString)](/sql-reference/data-types/array.md)、および [Map](/sql-reference/data-types/map.md) （[mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) および [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues) マップ関数を介して）カラムに次の構文を使用して定義できます：

```sql
CREATE TABLE tab
(
    `key` UInt64,
    `str` String,
    INDEX text_idx(str) TYPE text(
                                -- Mandatory parameters:
                                tokenizer = splitByNonAlpha|splitByString(S)|ngrams(N)|array
                                -- Optional parameters:
                                [, dictionary_block_size = D]
                                [, dictionary_block_frontcoding_compression = B]
                                [, max_cardinality_for_embedded_postings = M]
                                [, bloom_filter_false_positive_rate = R]
                            ) [GRANULARITY 64]
)
ENGINE = MergeTree
ORDER BY key
```

`tokenizer` 引数は、トークナイザーを指定します：

- `splitByNonAlpha` は、非アルファベットの ASCII 文字で文字列を分割します（関数 [splitByNonAlpha](/sql-reference/functions/splitting-merging-functions.md/#splitbynonalpha) も参照）。
- `splitByString(S)` は、ユーザー定義の区切り文字列 `S` で文字列を分割します（関数 [splitByString](/sql-reference/functions/splitting-merging-functions.md/#splitbystring) も参照）。
  区切り文字はオプションのパラメータを使用して指定できます。例：`tokenizer = splitByString([', ', '; ', '\n', '\\'])`。
  各文字列は複数の文字で構成できることに注意してください（例では `', '`）。
  デフォルトの区切り文字リストは、明示的に指定されていない場合（例：`tokenizer = splitByString`）、単一の空白 `[' ']` です。
- `ngrams(N)` は、文字列を等しいサイズの `N`-gram に分割します（関数 [ngrams](/sql-reference/functions/splitting-merging-functions.md/#ngrams) も参照）。
  ngram の長さは、2 から 8 の間のオプションの整数パラメータで指定できます。例：`tokenizer = ngrams(3)`。
  デフォルトの ngram サイズは、明示的に指定されていない場合（例：`tokenizer = ngrams`）、3 です。
- `array` はトークン化を行わず、各行の値をトークンとして扱います（関数 [array](/sql-reference/functions/array-functions.md/#array) も参照）。

:::note
`splitByString` トークナイザーは、区切り文字を左から右に適用します。
これにより、あいまいさが生じる可能性があります。
たとえば、区切り文字列 `['%21', '%']` は、`%21abc` を `['abc']` としてトークン化しますが、両方の区切り文字列を入れ替えた場合 `['%', '%21']` は `['21abc']` という結果になります。
ほとんどの場合、より長い区切り文字を優先することを望むでしょう。
これは、一般的に、区切り文字列を長さの降順で渡すことで実現できます。
区切り文字列が [接頭辞コード](https://en.wikipedia.org/wiki/Prefix_code) を形成する場合は、任意の順序で渡すことができます。
:::

入力文字列をトークナイザーがどのように分割するかをテストするには、ClickHouse の [tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens) 関数を使用できます。

例として、

```sql
SELECT tokens('abc def', 'ngrams', 3) AS tokens;
```

が返されます

```result
+-tokens--------------------------+
| ['abc','bc ','c d',' de','def'] |
+---------------------------------+
```

ClickHouse のテキストインデックスは、[セカンダリインデックス](/engines/table-engines/mergetree-family/mergetree.md/#skip-index-types)として実装されています。
ただし、他のスキッピングインデックスとは異なり、テキストインデックスはデフォルトのインデックス GRANULARITY が 64 です。
この値は経験的に選ばれ、大多数のユースケースにおいて速度とインデックスサイズの良好なトレードオフを提供します。
高度なユーザーは、異なるインデックスの粒度を指定できます（これは推奨されません）。

<details markdown="1">

<summary>高度なパラメータ</summary>

次の高度なパラメータのデフォルト値は、事実上すべての状況でうまく機能します。
変更することは推奨しません。

オプションのパラメータ `dictionary_block_size` （デフォルト: 128）は、行数の辞書ブロックのサイズを指定します。

オプションのパラメータ `dictionary_block_frontcoding_compression` （デフォルト: 1）は、辞書ブロックがフロントコーディングを圧縮に使用するかどうかを指定します。

オプションのパラメータ `max_cardinality_for_embedded_postings` （デフォルト: 16）は、ポスティングリストが辞書ブロックに埋め込まれるべきカーディナリティのしきい値を指定します。

オプションのパラメータ `bloom_filter_false_positive_rate` （デフォルト: 0.1）は、辞書のブルームフィルターの偽陽性率を指定します。
</details>

テキストインデックスは、テーブルが作成された後にカラムに追加したり削除したりできます：

```sql
ALTER TABLE tab DROP INDEX text_idx;
ALTER TABLE tab ADD INDEX text_idx(s) TYPE text(tokenizer = splitByNonAlpha);
```

## テキストインデックスの使用 {#using-a-text-index}

SELECT クエリでテキストインデックスを使用するのは簡単で、一般的な文字列検索関数はインデックスを自動的に活用します。
インデックスが存在しない場合、以下の文字列検索関数は遅いブルートフォーススキャンにフォールバックします。

### サポートされている関数 {#functions-support}

テキスト関数が SELECT クエリの `WHERE` 節で使用されている場合、テキストインデックスを使用できます：

```sql
SELECT [...]
FROM [...]
WHERE string_search_function(column_with_text_index)
```

#### `=` と `!=` {#functions-example-equals-notequals}

`=` ([equals](/sql-reference/functions/comparison-functions.md/#equals)) と `!=` ([notEquals](/sql-reference/functions/comparison-functions.md/#notEquals)) は、与えられた検索語全体と一致します。

例：

```sql
SELECT * from tab WHERE str = 'Hello';
```

テキストインデックスは `=` と `!=` をサポートしていますが、等号および非等号の検索は、`array` トークナイザーとともに使用する場合のみ意味があります（これによりインデックスは行の完全な値を格納します）。

#### `IN` と `NOT IN` {#functions-example-in-notin}

`IN` ([in](/sql-reference/functions/in-functions)) と `NOT IN` ([notIn](/sql-reference/functions/in-functions)) は、`equals` および `notEquals` 関数に似ていますが、すべて（`IN`）または何も（`NOT IN`）の検索語に一致します。

例：

```sql
SELECT * from tab WHERE str IN ('Hello', 'World');
```

`=` と `!=` の場合と同様の制限が適用されます。すなわち、`IN` と `NOT IN` は `array` トークナイザーとともに使用する場合のみ意味があります。

#### `LIKE`、`NOT LIKE` および `match` {#functions-example-like-notlike-match}

:::note
これらの関数は、現在、テキストインデックスが `splitByNonAlpha` または `ngrams` のいずれかのトークナイザーである場合にのみフィルタリングにテキストインデックスを使用します。
:::

`LIKE` [like](/sql-reference/functions/string-search-functions.md/#like)、`NOT LIKE` ([notLike](/sql-reference/functions/string-search-functions.md/#notlike))、および [match](/sql-reference/functions/string-search-functions.md/#match) 関数をテキストインデックスと共に使用するには、ClickHouse が検索語から完全なトークンを抽出できる必要があります。

例：

```sql
SELECT count() FROM tab WHERE comment LIKE 'support%';
```

例の `support` は、`support`、`supports`、`supporting` などと一致する可能性があります。
この種のクエリは部分文字列クエリであり、テキストインデックスによって加速されることはありません。

LIKE クエリにテキストインデックスを活用するには、LIKE パターンを次のように書き換える必要があります：

```sql
SELECT count() FROM tab WHERE comment LIKE ' support %'; -- or `% support %`
```

`support` の左と右の空白は、その語がトークンとして抽出されることを保証します。

#### `startsWith` および `endsWith` {#functions-example-startswith-endswith}

`LIKE` と同様に、関数 [startsWith](/sql-reference/functions/string-functions.md/#startswith) および [endsWith](/sql-reference/functions/string-functions.md/#endswith) は、検索語から完全なトークンが抽出できる場合にのみテキストインデックスを使用できます。

例：

```sql
SELECT count() FROM tab WHERE startsWith(comment, 'clickhouse support');
```

例では、`clickhouse` のみがトークンと見なされます。
`support` はトークンではありません。なぜなら、それが `support`、`supports`、`supporting` などと一致する可能性があるからです。

`clickhouse supports` で始まるすべての行を見つけるには、検索パターンの末尾に余分な空白を追加してください：

```sql
startsWith(comment, 'clickhouse supports ')`
```

同様に、`endsWith` は先頭に空白を追加して使用する必要があります：

```sql
SELECT count() FROM tab WHERE endsWith(comment, ' olap engine');
```

#### `hasToken` および `hasTokenOrNull` {#functions-example-hastoken-hastokenornull}

関数 [hasToken](/sql-reference/functions/string-search-functions.md/#hastoken) および [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hastokenornull) は、与えられた単一のトークンに対して一致します。

以前に言及した関数とは異なり、検索語をトークン化しません（入力が単一のトークンであると仮定します）。

例：

```sql
SELECT count() FROM tab WHERE hasToken(comment, 'clickhouse');
```

関数 `hasToken` と `hasTokenOrNull` は、`text` インデックスで使用する最も高速な関数です。

#### `hasAnyTokens` および `hasAllTokens` {#functions-example-hasanytokens-hasalltokens}

関数 [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasanytokens) および [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasalltokens) は、与えられたトークンのいずれかまたはすべてに一致します。

`hasToken` と同様に、検索語のトークン化は行われません。

例：

```sql
SELECT count() FROM tab WHERE hasAnyTokens(comment, ['clickhouse', 'olap']);

SELECT count() FROM tab WHERE hasAllTokens(comment, ['clickhouse', 'olap']);
```

#### `has` {#functions-example-has}

配列関数 [has](/sql-reference/functions/array-functions#has) は、文字列の配列内の単一のトークンに対して一致します。

例：

```sql
SELECT count() FROM tab WHERE has(array, 'clickhouse');
```

#### `mapContains` {#functions-example-mapcontains}

関数 [mapContains](/sql-reference/functions/tuple-map-functions#mapcontains)（エイリアス：`mapContainsKey`）は、マップのキー内の単一のトークンに対して一致します。

例：

```sql
SELECT count() FROM tab WHERE mapContainsKey(map, 'clickhouse');
-- OR
SELECT count() FROM tab WHERE mapContains(map, 'clickhouse');
```

#### `operator[]` {#functions-example-access-operator}

アクセス [operator[]](/sql-reference/operators#access-operators) は、テキストインデックスを使用してキーと値をフィルタリングするために利用できます。

例：

```sql
SELECT count() FROM tab WHERE map['engine'] = 'clickhouse'; -- will use the text index if defined
```

テキストインデックスを使用した `Array(T)` および `Map(K, V)` の使用法に関する以下の例を参照してください。

### テキストインデックス `Array` と `Map` サポートの例 {#text-index-array-and-map-examples}

#### Array(String) のインデックス作成 {#text-indexi-example-array}

シンプルなブログプラットフォームでは、著者が投稿にキーワードを割り当ててコンテンツを分類します。
一般的な機能では、ユーザーがキーワードをクリックしたりトピックを検索したりして関連するコンテンツを見つけることができます。

次のテーブル定義を考えてみましょう：

```sql
CREATE TABLE posts (
    post_id UInt64,
    title String,
    content String,
    keywords Array(String) COMMENT 'Author-defined keywords'
)
ENGINE = MergeTree
ORDER BY (post_id);
```

テキストインデックスなしで特定のキーワード（例えば、`clickhouse`）を持つ投稿を見つけるには、すべてのエントリをスキャンする必要があります：

```sql
SELECT count() FROM posts WHERE has(keywords, 'clickhouse'); -- slow full-table scan - checks every keyword in every post
```

プラットフォームが成長するにつれて、すべての行のキーワード配列を調べなければならないため、ますます遅くなります。

このパフォーマンスの問題を克服するために、キーワードに対してテキストインデックスを定義し、すべてのキーワードを前処理する検索最適化構造を作成して、即時検索を可能にします：

```sql
ALTER TABLE posts ADD INDEX keywords_idx(keywords) TYPE text(tokenizer = splitByNonAlpha);
```

:::note
重要：テキストインデックスを追加した後、既存のデータに対して再構築する必要があります：

```sql
ALTER TABLE posts MATERIALIZE INDEX keywords_idx;
```
:::

#### Map のインデックス作成 {#text-index-example-map}

ログシステムでは、サーバー要求がメタデータをキーと値のペアで保存することがよくあります。運用チームは、デバッグ、セキュリティインシデント、および監視のためにログを効率的に検索する必要があります。

次のログテーブルを考えてみましょう：

```sql
CREATE TABLE logs (
    id UInt64,
    timestamp DateTime,
    message String,
    attributes Map(String, String)
)
ENGINE = MergeTree
ORDER BY (timestamp);
```

テキストインデックスなしで [Map](/sql-reference/data-types/map.md) データを検索するには、完全なテーブルスキャンが必要です：

1. レート制限のあるすべてのログを見つける：

```sql
SELECT count() FROM logs WHERE has(mapKeys(attributes), 'rate_limit'); -- slow full-table scan
```

2. 特定の IP からのすべてのログを見つける：

```sql
SELECT count() FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- slow full-table scan
```

ログボリュームが増えると、これらのクエリは遅くなります。

解決策は、[Map](/sql-reference/data-types/map.md) のキーと値に対してテキストインデックスを作成することです。

フィールド名や属性タイプでログを見つける必要がある場合は、[mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) を使用してテキストインデックスを作成します：

```sql
ALTER TABLE logs ADD INDEX attributes_keys_idx mapKeys(attributes) TYPE text(tokenizer = array);
```

属性の実際のコンテンツ内を検索する必要がある場合は、[mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues) を使用してテキストインデックスを作成します：

```sql
ALTER TABLE logs ADD INDEX attributes_vals_idx mapValues(attributes) TYPE text(tokenizer = array);
```

:::note
重要：テキストインデックスを追加した後、既存のデータに対して再構築する必要があります：

```sql
ALTER TABLE posts MATERIALIZE INDEX attributes_keys_idx;
ALTER TABLE posts MATERIALIZE INDEX attributes_vals_idx;
```
:::

1. レート制限されたリクエストをすべて見つける：

```sql
SELECT * FROM logs WHERE mapContainsKey(attributes, 'rate_limit'); -- fast
```

2. 特定の IP からのすべてのログを見つける：

```sql
SELECT * FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- fast
```

## 実装 {#implementation}

### インデックスレイアウト {#index-layout}

各テキストインデックスは、次の2つの（抽象）データ構造で構成されます：
- 各トークンをポスティングリストにマッピングする辞書、そして
- 各ポスティングリストは、行番号のセットを表します。

テキストインデックスはスキップインデックスであるため、これらのデータ構造は論理的にインデックス粒度ごとに存在します。

インデックス作成中に、各パートごとに3つのファイルが作成されます：

**辞書ブロックファイル (.dct)**

インデックス粒度内のトークンは整列され、128 トークンごとの辞書ブロックに格納されます（ブロックサイズは `dictionary_block_size` パラメータで設定可能）。
辞書ブロックファイル (.dct) は、パート内のすべてのインデックス粒度のすべての辞書ブロックで構成されています。

**インデックス粒度ファイル (.idx)**

インデックス粒度ファイルには、各辞書ブロックの最初のトークン、その辞書ブロックファイル内の相対オフセット、およびブロック内のすべてのトークンのブルームフィルターが含まれます。
このスパースインデックス構造は、ClickHouse の [スパース主キーインデックス](https://clickhouse.com/docs/guides/best-practices/sparse-primary-indexes) と似ています。
ブルームフィルターは、検索トークンが辞書ブロックに含まれていない場合、早期に辞書ブロックをスキップすることを可能にします。

**ポスティングリストファイル (.pst)**

すべてのトークンのポスティングリストは、ポスティングリストファイル内に順次配置されます。
空間を節約しながら、迅速な交差および和の操作を可能にするために、ポスティングリストは [ローニングビットマップ](https://roaringbitmap.org/) として保存されます。
ポスティングリストのカーディナリティが16未満（パラメータ `max_cardinality_for_embedded_postings` で設定可能）の場合、それは辞書に埋め込まれます。

### ダイレクトリード {#direct-read}

特定のタイプのテキストクエリは、「ダイレクトリード」と呼ばれる最適化によって大幅にスピードアップできます。
より具体的には、SELECT クエリがテキストカラムから _投影しない_ 場合に、最適化を適用できます。

例：

```sql
SELECT column_a, column_b, ... -- not: column_with_text_index
FROM [...]
WHERE string_search_function(column_with_text_index)
```

ClickHouse のダイレクトリード最適化は、テキストインデックス（つまり、テキストインデックスのルックアップ）を使用して、ベースとなるテキストカラムにアクセスすることなく、クエリに応答します。
テキストインデックスのルックアップは比較的少ないデータを読み取り、したがって ClickHouse の通常のスキッピングインデックスよりもはるかに高速です（通常のスキッピングインデックスは、スキッピングインデックスのルックアップを行った後、サバイビング粒度をロードしフィルタリングします）。

**サポートされている関数**
ダイレクトリード最適化は関数 `hasToken`、`searchAll`、および `searchAny` をサポートします。
これらの関数は AND、OR、および NOT 演算子と組み合わせることもできます。
WHERE 句には、追加の非テキスト検索関数フィルタ（テキストカラムや他のカラム用）を含めることもできます。この場合、ダイレクトリード最適化は依然として使用されますが、効果は薄くなります（サポートされているテキスト検索関数にのみ適用されます）。

## 例：Hackernews データセット {#hacker-news-dataset}

テキストインデックスが大量のテキストを含む大規模データセットに対してどのようにパフォーマンスを向上させるかを見てみましょう。
人気の Hacker News ウェブサイトのコメント 2870 万行を使用します。こちらがテキストインデックスなしのテーブルです：

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

2870 万行は S3 の Parquet ファイルに保存されています - それらを `hackernews` テーブルに挿入してみましょう：

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

`comment` カラムで `ClickHouse` （およびその大小文字のバリエーション）を探す簡単な検索を考えてみましょう：

```sql
SELECT count()
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse');
```

クエリの実行には 3 秒かかることに注意してください：

```response
┌─count()─┐
│    1145 │
└─────────┘

1 row in set. Elapsed: 3.001 sec. Processed 28.74 million rows, 9.75 GB (9.58 million rows/s., 3.25 GB/s.)
```

`ALTER TABLE` を使用して、`comment` カラムの小文字にテキストインデックスを追加し、それをマテリアライズします（これには時間がかかる場合があります - マテリアライズが完了するまでお待ちください）：

```sql
ALTER TABLE hackernews
     ADD INDEX comment_lowercase(lower(comment)) TYPE text;

ALTER TABLE hackernews MATERIALIZE INDEX comment_lowercase;
```

同じクエリを実行します…

```sql
SELECT count()
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse')
```

…クエリが 4 倍速く実行されることに気付きます：

```response
┌─count()─┐
│    1145 │
└─────────┘

1 row in set. Elapsed: 0.747 sec. Processed 4.49 million rows, 1.77 GB (6.01 million rows/s., 2.37 GB/s.)
```

また、複数の用語のいずれかまたはすべてを検索することもできます。すなわち、論理和または論理積の検索が可能です：

```sql
-- multiple OR'ed terms
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'avx') OR hasToken(lower(comment), 'sve');

-- multiple AND'ed terms
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'avx') AND hasToken(lower(comment), 'sve');
```

## 関連コンテンツ {#related-content}

- ブログ：[ClickHouse における逆引きインデックスの導入](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
- ブログ：[ClickHouse フルテキスト検索の内部：高速、ネイティブ、列指向](https://clickhouse.com/blog/clickhouse-full-text-search)
- 動画：[フルテキストインデックス：設計と実験](https://www.youtube.com/watch?v=O_MnyUkrIq8)
