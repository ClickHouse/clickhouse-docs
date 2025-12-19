---
description: 'テキスト内の検索語句を迅速に見つけます。'
keywords: ['全文検索', 'テキストインデックス', 'インデックス', 'インデックス（複数形）']
sidebar_label: 'テキストインデックスを使用した全文検索'
slug: /engines/table-engines/mergetree-family/invertedindexes
title: 'テキストインデックスを使用した全文検索'
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';


# テキストインデックスを使用した全文検索 {#full-text-search-using-text-indexes}

<BetaBadge/>

ClickHouse のテキストインデックス（["inverted indexes"](https://en.wikipedia.org/wiki/Inverted_index) とも呼ばれます）は、文字列データに対して高速な全文検索機能を提供します。
インデックスは、列内の各トークンを、そのトークンを含む行に対応付けます。
トークンは、トークン化と呼ばれる処理によって生成されます。
例えば、ClickHouse は英語の文 "All cat like mice." を、デフォルトでは ["All", "cat", "like", "mice"] のようにトークン化します（末尾のドットは無視される点に注意してください）。
ログデータ向けなど、より高度なトークナイザーも利用できます。

## テキストインデックスの作成 {#creating-a-text-index}

テキストインデックスを作成するには、まず該当する実験的な設定を有効にしてください。

```sql
SET allow_experimental_full_text_index = true;
```

テキストインデックスは、次の構文を使用して、[String](/sql-reference/data-types/string.md)、[FixedString](/sql-reference/data-types/fixedstring.md)、[Array(String)](/sql-reference/data-types/array.md)、[Array(FixedString)](/sql-reference/data-types/array.md)、および [Map](/sql-reference/data-types/map.md)（[mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) および [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues) マップ関数を通じて）列に定義できます。

```sql
CREATE TABLE tab
(
    `key` UInt64,
    `str` String,
    INDEX text_idx(str) TYPE text(
                                -- Mandatory parameters:
                                tokenizer = splitByNonAlpha
                                            | splitByString[(S)]
                                            | ngrams[(N)]
                                            | sparseGrams[(min_length[, max_length[, min_cutoff_length]])]
                                            | array
                                -- Optional parameters:
                                [, preprocessor = expression(str)]
                                -- Optional advanced parameters:
                                [, dictionary_block_size = D]
                                [, dictionary_block_frontcoding_compression = B]
                                [, max_cardinality_for_embedded_postings = M]
                                [, bloom_filter_false_positive_rate = R]
                            ) [GRANULARITY 64]
)
ENGINE = MergeTree
ORDER BY key
```

**トークナイザー引数（必須）**。`tokenizer` 引数は使用するトークナイザーを指定します：

* `splitByNonAlpha` は、英数字以外の ASCII 文字で文字列を分割します（関数 [splitByNonAlpha](/sql-reference/functions/splitting-merging-functions.md/#splitByNonAlpha) も参照してください）。
* `splitByString(S)` は、ユーザー定義の区切り文字列 `S` に従って文字列を分割します（関数 [splitByString](/sql-reference/functions/splitting-merging-functions.md/#splitByString) も参照してください）。
  区切り文字列はオプションのパラメータで指定できます。たとえば `tokenizer = splitByString([', ', '; ', '\n', '\\'])` のように指定します。
  それぞれの区切り文字列は、複数文字（例では `', '`）から構成されていてもかまいません。
  区切り文字リストを明示的に指定しない場合（たとえば `tokenizer = splitByString`）、既定の区切り文字リストは単一の空白 `[' ']` です。
* `ngrams(N)` は、文字列を同じ長さの `N`-gram に分割します（関数 [ngrams](/sql-reference/functions/splitting-merging-functions.md/#ngrams) も参照してください）。
  n-gram の長さは 1 から 8 の整数でオプション引数として指定できます。たとえば `tokenizer = ngrams(3)` のように指定します。
  n-gram の既定サイズは、明示的に指定されない場合（たとえば `tokenizer = ngrams`）は 3 です。
* `sparseGrams(min_length, max_length, min_cutoff_length)` は、`min_length` 以上 `max_length` 以下（両端を含む）の長さの可変長 n-gram に文字列を分割します（関数 [sparseGrams](/sql-reference/functions/string-functions#sparseGrams) も参照してください）。
  明示的に指定されない場合、`min_length` と `max_length` の既定値はそれぞれ 3 と 100 です。
  パラメータ `min_cutoff_length` が指定されている場合、その長さ以上の n-gram のみがインデックスに保存されます。
  `ngrams(N)` と比べて、`sparseGrams` トークナイザーは可変長の N-gram を生成するため、元のテキストをより柔軟に表現できます。
  たとえば `tokenizer = sparseGrams(3, 5, 4)` は内部的には入力文字列から 3・4・5-gram を生成しますが、インデックスには 4-gram と 5-gram のみが保存されます。
* `array` はトークン化を行いません。つまり各行の値全体が 1 つのトークンになります（関数 [array](/sql-reference/functions/array-functions.md/#array) も参照してください）。

:::note
`splitByString` トークナイザーは、左から右へ区切り文字列を順に適用します。
これにより曖昧さが生じる場合があります。
たとえば、区切り文字列を `['%21', '%']` とすると `%21abc` は `['abc']` にトークン化されますが、区切り文字列の順序を `['%', '%21']` と入れ替えると、出力は `['21abc']` になります。
多くの場合、より長い区切り文字列が優先的にマッチすることを期待するでしょう。
これは一般には、区切り文字列を長いものから短いものの順に渡すことで実現できます。
区切り文字列が [prefix code](https://en.wikipedia.org/wiki/Prefix_code) を形成している場合は、任意の順序で渡すことができます。
:::


:::warning
現時点では、中国語などの非西洋言語のテキストに対してテキストインデックスを構築することは推奨されません。
現在サポートされているトークナイザーでは、インデックスサイズの肥大化とクエリ時間の増大を引き起こす可能性があります。
今後、これらのケースをより適切に処理する言語固有の専用トークナイザーを追加する予定です。
:::

トークナイザーが入力文字列をどのように分割するかをテストするには、ClickHouseの[tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens)関数を使用します:

例:

```sql
SELECT tokens('abc def', 'ngrams', 3);
```

結果:

```result
['abc','bc ','c d',' de','def']
```

**プリプロセッサ引数(オプション)**。`preprocessor`引数は、トークン化の前に入力文字列に適用される式です。

プリプロセッサ引数の典型的な使用例には以下が含まれます

1. 大文字小文字を区別しないマッチングを可能にするための小文字化／大文字化処理。例: [lower](/sql-reference/functions/string-functions.md/#lower)、[lowerUTF8](/sql-reference/functions/string-functions.md/#lowerUTF8)。以下の最初の例を参照してください。
2. UTF-8正規化。例:[normalizeUTF8NFC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFC)、[normalizeUTF8NFD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFD)、[normalizeUTF8NFKC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKC)、[normalizeUTF8NFKD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKD)、[toValidUTF8](/sql-reference/functions/string-functions.md/#toValidUTF8)。
3. 不要な文字または部分文字列の削除または変換。例:[extractTextFromHTML](/sql-reference/functions/string-functions.md/#extractTextFromHTML)、[substring](/sql-reference/functions/string-functions.md/#substring)、[idnaEncode](/sql-reference/functions/string-functions.md/#idnaEncode)。

プリプロセッサ式は、[String](/sql-reference/data-types/string.md)型または[FixedString](/sql-reference/data-types/fixedstring.md)型の入力値を同じ型の値に変換する必要があります。

例:

* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(col))`
* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = substringIndex(col, '\n', 1))`
* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(extractTextFromHTML(col))`

また、プリプロセッサ式は、テキストインデックスが定義されているカラムのみを参照する必要があります。
非決定的関数の使用は許可されていません。

関数[hasToken](/sql-reference/functions/string-search-functions.md/#hasToken)、[hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens)、[hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens)は、プリプロセッサを使用して検索語をトークン化する前にまず変換します。

例えば、

```sql
CREATE TABLE tab
(
    key UInt64,
    str String,
    INDEX idx(str) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(str))
)
ENGINE = MergeTree
ORDER BY tuple();

SELECT count() FROM tab WHERE hasToken(str, 'Foo');
```

は以下と等価です:

```sql
CREATE TABLE tab
(
    key UInt64,
    str String,
    INDEX idx(lower(str)) TYPE text(tokenizer = 'splitByNonAlpha')
)
ENGINE = MergeTree
ORDER BY tuple();

SELECT count() FROM tab WHERE hasToken(str, lower('Foo'));
```

**その他の引数(オプション)**。ClickHouseのテキストインデックスは[セカンダリインデックス](/engines/table-engines/mergetree-family/mergetree.md/#skip-index-types)として実装されています。
ただし、他のスキップインデックスとは異なり、テキストインデックスのデフォルトのインデックスGRANULARITYは64です。
この値は経験的に選択されており、ほとんどのユースケースにおいて速度とインデックスサイズの適切なトレードオフを提供します。
上級ユーザーは異なるインデックス粒度を指定できます(ただし、推奨しません)。

<details markdown="1">
  <summary>オプションの高度なパラメータ</summary>

  以下の高度なパラメータのデフォルト値は、ほぼすべての状況で適切に機能します。
  これらを変更することは推奨しません。

  オプションパラメータ`dictionary_block_size`(デフォルト:128)は、辞書ブロックのサイズを行数で指定します。

  オプションパラメータ`dictionary_block_frontcoding_compression`(デフォルト:1)は、辞書ブロックが圧縮としてフロントコーディングを使用するかどうかを指定します。

  オプションパラメータ`max_cardinality_for_embedded_postings`(デフォルト:16)は、ポスティングリストを辞書ブロックに埋め込むべきカーディナリティの閾値を指定します。

  オプションパラメータ`bloom_filter_false_positive_rate`(デフォルト:0.1)は、Dictionary Bloom Filterの偽陽性率を指定します。
</details>

テキストインデックスは、テーブル作成後にカラムに追加したり削除したりできます。

```sql
ALTER TABLE tab DROP INDEX text_idx;
ALTER TABLE tab ADD INDEX text_idx(s) TYPE text(tokenizer = splitByNonAlpha);
```


## テキストインデックスの使用 {#using-a-text-index}

SELECT クエリでテキストインデックスを使用するのは簡単で、一般的な文字列検索関数では自動的にインデックスが利用されます。
インデックスが存在しない場合、以下の文字列検索関数は低速な総当たりスキャンによる処理にフォールバックします。

### サポートされている関数 {#functions-support}

SELECT クエリの `WHERE` 句でテキスト関数が使用されている場合、テキストインデックスを利用できます。

```sql
SELECT [...]
FROM [...]
WHERE string_search_function(column_with_text_index)
```


#### `=` と `!=` {#functions-example-equals-notequals}

`=` ([equals](/sql-reference/functions/comparison-functions.md/#equals)) と `!=` ([notEquals](/sql-reference/functions/comparison-functions.md/#notEquals)) は、指定された検索語全体と一致します。

例:

```sql
SELECT * from tab WHERE str = 'Hello';
```

テキストインデックスは `=` と `!=` をサポートしますが、等値・不等値検索が有効になるのは `array` トークナイザを使用する場合のみです（このトークナイザではインデックスに行全体の値が格納されます）。


#### `IN` と `NOT IN` {#functions-example-in-notin}

`IN`（[`in`](/sql-reference/functions/in-functions)）と `NOT IN`（[`notIn`](/sql-reference/functions/in-functions)）は `equals` および `notEquals` 関数と似ていますが、検索語句のいずれかに一致するもの（`IN`）、あるいはどれにも一致しないもの（`NOT IN`）を判定します。

例:

```sql
SELECT * from tab WHERE str IN ('Hello', 'World');
```

`=` および `!=` と同様の制限が適用されます。つまり、`IN` と `NOT IN` は `array` トークナイザと組み合わせて使用する場合にのみ意味があります。


#### `LIKE`、`NOT LIKE` および `match` {#functions-example-like-notlike-match}

:::note
これらの関数がフィルタリングのためにテキストインデックスを使用するのは、インデックスのトークナイザーが `splitByNonAlpha` または `ngrams` のいずれかである場合に限られます。
:::

テキストインデックスで `LIKE` ([like](/sql-reference/functions/string-search-functions.md/#like))、`NOT LIKE` ([notLike](/sql-reference/functions/string-search-functions.md/#notLike))、および [match](/sql-reference/functions/string-search-functions.md/#match) 関数を使用するには、ClickHouse が検索語句から完全なトークンを抽出できる必要があります。

例:

```sql
SELECT count() FROM tab WHERE comment LIKE 'support%';
```

この例の `support` は、`support`、`supports`、`supporting` などにマッチする可能性があります。
この種のクエリは部分文字列クエリであり、テキストインデックスによって高速化することはできません。

LIKE クエリでテキストインデックスを活用するには、LIKE パターンを次のように書き換える必要があります。

```sql
SELECT count() FROM tab WHERE comment LIKE ' support %'; -- or `% support %`
```

`support` の前後に空白を入れることで、その語をトークンとして抽出できるようにします。


#### `startsWith` と `endsWith` {#functions-example-startswith-endswith}

`LIKE` と同様に、関数 [startsWith](/sql-reference/functions/string-functions.md/#startsWith) と [endsWith](/sql-reference/functions/string-functions.md/#endsWith) は、検索語句から完全なトークンを抽出できる場合にのみテキストインデックスを使用できます。

例:

```sql
SELECT count() FROM tab WHERE startsWith(comment, 'clickhouse support');
```

この例では、`clickhouse` だけがトークンとして扱われます。
`support` は `support`、`supports`、`supporting` などにマッチする可能性があるため、トークンとはみなされません。

`clickhouse supports` で始まるすべての行を見つけるには、検索パターンの末尾にスペースを 1 つ追加してください：

```sql
startsWith(comment, 'clickhouse supports ')`
```

同様に、`endsWith` も先頭に空白を 1 つ付けて使用します。

```sql
SELECT count() FROM tab WHERE endsWith(comment, ' olap engine');
```


#### `hasToken` と `hasTokenOrNull` {#functions-example-hastoken-hastokenornull}

関数 [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken) および [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull) は、指定された単一のトークンを対象にマッチングを行います。

前述の関数とは異なり、これらは検索語句をトークン化せず、入力が単一のトークンであると仮定します。

例:

```sql
SELECT count() FROM tab WHERE hasToken(comment, 'clickhouse');
```

関数 `hasToken` と `hasTokenOrNull` は、`text` インデックスと併用する場合に最も高いパフォーマンスを発揮します。


#### `hasAnyTokens` と `hasAllTokens` {#functions-example-hasanytokens-hasalltokens}

関数 [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) と [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) は、指定されたトークンの一部またはすべてにマッチします。

これら 2 つの関数は、検索トークンを、インデックス列で使用されるものと同じトークナイザでトークン化される文字列として、または検索前に追加のトークナイズ処理を行わない、すでにトークン化済みのトークン配列として受け取ります。
詳細については、それぞれの関数のドキュメントを参照してください。

例:

```sql
-- Search tokens passed as string argument
SELECT count() FROM tab WHERE hasAnyTokens(comment, 'clickhouse olap');
SELECT count() FROM tab WHERE hasAllTokens(comment, 'clickhouse olap');

-- Search tokens passed as Array(String)
SELECT count() FROM tab WHERE hasAnyTokens(comment, ['clickhouse', 'olap']);
SELECT count() FROM tab WHERE hasAllTokens(comment, ['clickhouse', 'olap']);
```


#### `has` {#functions-example-has}

配列関数 [has](/sql-reference/functions/array-functions#has) は、文字列配列内の単一のトークンとの一致を判定します。

例:

```sql
SELECT count() FROM tab WHERE has(array, 'clickhouse');
```


#### `mapContains` {#functions-example-mapcontains}

関数 [mapContains](/sql-reference/functions/tuple-map-functions#mapcontains)（`mapContainsKey` のエイリアス）は、マップのキーに含まれる単一のトークンとの一致を判定します。

例:

```sql
SELECT count() FROM tab WHERE mapContainsKey(map, 'clickhouse');
-- OR
SELECT count() FROM tab WHERE mapContains(map, 'clickhouse');
```


#### `operator[]` {#functions-example-access-operator}

アクセス演算子 [operator[]](/sql-reference/operators#access-operators) は、テキストインデックスと併用してキーおよび値をフィルタするために使用できます。

例:

```sql
SELECT count() FROM tab WHERE map['engine'] = 'clickhouse';
```

`Array(T)` 型および `Map(K, V)` 型のカラムをテキストインデックスと併用する場合の例を以下に示します。


### テキストインデックスを使用した `Array` および `Map` カラムの例 {#text-index-array-and-map-examples}

#### Array(String) カラムへのインデックス作成 {#text-index-example-array}

ブログプラットフォームを想像してください。著者はキーワードを使って自身のブログ記事にカテゴリー付けを行います。
ユーザーには、トピックを検索したりクリックしたりすることで関連するコンテンツを見つけてほしいと考えています。

次のようなテーブル定義を想定します。

```sql
CREATE TABLE posts (
    post_id UInt64,
    title String,
    content String,
    keywords Array(String)
)
ENGINE = MergeTree
ORDER BY (post_id);
```

テキストインデックスが存在しない場合、特定のキーワード（例：`clickhouse`）を含む投稿を見つけるには、すべてのエントリをフルスキャンする必要があります。

```sql
SELECT count() FROM posts WHERE has(keywords, 'clickhouse'); -- slow full-table scan - checks every keyword in every post
```

プラットフォームが成長するにつれて、クエリはすべての行の `keywords` 配列を走査する必要があるため、次第に処理が遅くなっていきます。
このパフォーマンス上の問題を解決するために、列 `keywords` に対してテキストインデックスを定義します。

```sql
ALTER TABLE posts ADD INDEX keywords_idx(keywords) TYPE text(tokenizer = splitByNonAlpha);
ALTER TABLE posts MATERIALIZE INDEX keywords_idx; -- Don't forget to rebuild the index for existing data
```


#### Map 列のインデックス作成 {#text-index-example-map}

多くのオブザーバビリティのユースケースでは、ログメッセージは「コンポーネント」に分割され、タイムスタンプには日時型、ログレベルには enum 型など、適切なデータ型で保存されます。
メトリクスのフィールドはキーと値のペアとして保存するのが最適です。
運用チームは、デバッグ、セキュリティインシデント、監視のために、ログを効率的に検索する必要があります。

次のような logs テーブルを考えます：

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

テキストインデックスがない場合、[Map](/sql-reference/data-types/map.md) 型データを検索するには、テーブルのフルスキャンが必要になります。

```sql
-- Finds all logs with rate limiting data:
SELECT count() FROM logs WHERE has(mapKeys(attributes), 'rate_limit'); -- slow full-table scan

-- Finds all logs from a specific IP:
SELECT count() FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- slow full-table scan
```

ログ量が増加すると、これらのクエリは遅くなります。

解決策は、[Map](/sql-reference/data-types/map.md) のキーと値に対してテキストインデックスを作成することです。
フィールド名や属性タイプでログを検索する必要がある場合は、[mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) を使用してテキストインデックスを作成します。

```sql
ALTER TABLE logs ADD INDEX attributes_keys_idx mapKeys(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_keys_idx;
```

ログの属性の実際の内容を検索する必要がある場合は、[mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues) を使用してテキストインデックスを作成します。

```sql
ALTER TABLE logs ADD INDEX attributes_vals_idx mapValues(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_vals_idx;
```

クエリの例:

```sql
-- Find all rate-limited requests:
SELECT * FROM logs WHERE mapContainsKey(attributes, 'rate_limit'); -- fast

-- Finds all logs from a specific IP:
SELECT * FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- fast
```


## パフォーマンスチューニング {#performance-tuning}

### 直接読み取り {#direct-read}

特定の種類のテキストクエリは、「direct read」と呼ばれる最適化によって大幅に高速化されます。
より正確には、`SELECT` クエリがテキスト列を *選択しない* 場合に、この最適化を適用できます。

例:

```sql
SELECT column_a, column_b, ... -- not: column_with_text_index
FROM [...]
WHERE string_search_function(column_with_text_index)
```

ClickHouse におけるダイレクトリード最適化は、基盤となるテキスト列にアクセスせずに、テキストインデックスのみ（すなわちテキストインデックスのルックアップ）の使用によってクエリに応答します。
テキストインデックスのルックアップは比較的少量のデータしか読み取らないため、ClickHouse の通常のスキップインデックス（スキップインデックスのルックアップの後に、残った granule の読み込みとフィルタリングを行う）よりもはるかに高速です。

ダイレクトリードは次の 2 つの設定で制御されます。

* 設定 [query&#95;plan&#95;direct&#95;read&#95;from&#95;text&#95;index](../../../operations/settings/settings#query_plan_direct_read_from_text_index) は、ダイレクトリードを全体として有効にするかどうかを指定します。
* 設定 [use&#95;skip&#95;indexes&#95;on&#95;data&#95;read](../../../operations/settings/settings#use_skip_indexes_on_data_read) は、ダイレクトリードのもう 1 つの前提条件です。ClickHouse データベースで [compatibility](../../../operations/settings/settings#compatibility) &lt; 25.10 の場合、`use_skip_indexes_on_data_read` は無効化されているため、compatibility 設定値を引き上げるか、明示的に `SET use_skip_indexes_on_data_read = 1` と設定する必要があります。

また、ダイレクトリードを利用するには、テキストインデックスが完全にマテリアライズされている必要があります（そのためには `ALTER TABLE ... MATERIALIZE INDEX` を使用します）。

**サポートされている関数**
ダイレクトリード最適化は、`hasToken`、`hasAllTokens`、`hasAnyTokens` 関数をサポートします。
これらの関数は AND、OR、NOT 演算子と組み合わせることもできます。
WHERE 句には、（テキスト列やその他の列に対する）追加の非テキスト検索関数によるフィルタも含めることができます。その場合でもダイレクトリード最適化は使用されますが、効果は小さくなります（サポートされているテキスト検索関数にのみ適用されるため）。

クエリがダイレクトリードを利用しているかを確認するには、`EXPLAIN PLAN actions = 1` を指定してクエリを実行します。
例として、ダイレクトリードを無効にしたクエリは次のようになります

```sql
EXPLAIN PLAN actions = 1
SELECT count()
FROM tab
WHERE hasToken(col, 'some_token')
SETTINGS query_plan_direct_read_from_text_index = 0, -- disable direct read
         use_skip_indexes_on_data_read = 1;
```

戻り値

```text
[...]
Filter ((WHERE + Change column names to column identifiers))
Filter column: hasToken(__table1.col, 'some_token'_String) (removed)
Actions: INPUT : 0 -> col String : 0
         COLUMN Const(String) -> 'some_token'_String String : 1
         FUNCTION hasToken(col :: 0, 'some_token'_String :: 1) -> hasToken(__table1.col, 'some_token'_String) UInt8 : 2
[...]
```

一方、同じクエリを `query_plan_direct_read_from_text_index = 1` で実行すると

```sql
EXPLAIN PLAN actions = 1
SELECT count()
FROM tab
WHERE hasToken(col, 'some_token')
SETTINGS query_plan_direct_read_from_text_index = 1, -- enable direct read
         use_skip_indexes_on_data_read = 1;
```

戻り値

```text
[...]
Expression (Before GROUP BY)
Positions:
  Filter
  Filter column: __text_index_idx_hasToken_94cc2a813036b453d84b6fb344a63ad3 (removed)
  Actions: INPUT :: 0 -> __text_index_idx_hasToken_94cc2a813036b453d84b6fb344a63ad3 UInt8 : 0
[...]
```

2番目の EXPLAIN PLAN の出力には、仮想カラム `__text_index_<index_name>_<function_name>_<id>` が含まれます。
このカラムが存在する場合は、ダイレクトリードが使用されます。


### キャッシュ {#caching}

テキストインデックスの一部をメモリ上でバッファリングするために、複数のキャッシュが利用可能です（[Implementation Details](#implementation) セクションを参照）。
現在、I/O を削減するために、テキストインデックスのデシリアライズ済みディクショナリブロック、ヘッダー、およびポスティングリスト用のキャッシュが用意されています。
これらは設定 [use_text_index_dictionary_cache](/operations/settings/settings#use_text_index_dictionary_cache)、[use_text_index_header_cache](/operations/settings/settings#use_text_index_header_cache)、および [use_text_index_postings_cache](/operations/settings/settings#use_text_index_postings_cache) によって有効化できます。
デフォルトでは、すべてのキャッシュは無効になっています。

キャッシュを設定するには、以下のサーバー設定を参照してください。

#### 辞書ブロックキャッシュ設定 {#caching-dictionary}

| Setting                                                                                                                                                  | Description                                                                                                    |
|----------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| [text_index_dictionary_block_cache_policy](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_policy)                | テキストインデックス辞書ブロックキャッシュのポリシー名。                                                          |
| [text_index_dictionary_block_cache_size](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size)                    | キャッシュの最大サイズ（バイト単位）。                                                                          |
| [text_index_dictionary_block_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_max_entries)      | キャッシュ内のデシリアライズ済み辞書ブロックの最大数。                                                          |
| [text_index_dictionary_block_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size_ratio)        | テキストインデックス辞書ブロックキャッシュにおける保護キューのサイズの、キャッシュ全体サイズに対する割合。       |

#### ヘッダーキャッシュ設定 {#caching-header}

| Setting                                                                                                                              | Description                                                                                          |
|--------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| [text_index_header_cache_policy](/operations/server-configuration-parameters/settings#text_index_header_cache_policy)                | テキストインデックスヘッダーキャッシュのポリシー名。                                                  |
| [text_index_header_cache_size](/operations/server-configuration-parameters/settings#text_index_header_cache_size)                    | キャッシュの最大サイズ（バイト単位）。                                                                |
| [text_index_header_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_header_cache_max_entries)      | キャッシュ内のデシリアライズ済みヘッダーの最大数。                                                    |
| [text_index_header_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_header_cache_size_ratio)        | テキストインデックスヘッダーキャッシュにおける保護キューのサイズの、キャッシュ全体サイズに対する割合。 |

#### ポスティングリストキャッシュ設定 {#caching-posting-lists}

| Setting                                                                                                                               | Description                                                                                             |
|---------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [text_index_postings_cache_policy](/operations/server-configuration-parameters/settings#text_index_postings_cache_policy)             | テキストインデックスのポスティングリストキャッシュのポリシー名。                                           |
| [text_index_postings_cache_size](/operations/server-configuration-parameters/settings#text_index_postings_cache_size)                 | キャッシュの最大サイズ（バイト単位）。                                                                   |
| [text_index_postings_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_postings_cache_max_entries)   | キャッシュ内のデシリアライズ済みポスティングの最大数。                                                   |
| [text_index_postings_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_postings_cache_size_ratio)     | テキストインデックスのポスティングリストキャッシュにおける保護キューのサイズの、キャッシュ全体サイズに対する割合。 |

## 実装の詳細 {#implementation}

各テキストインデックスは、2 つの（抽象的な）データ構造から構成されます:
- 各トークンをポスティングリストにマッピングする辞書
- 各々が行番号の集合を表すポスティングリストの集合

テキストインデックスはスキップインデックスであるため、これらのデータ構造は論理的にはインデックスグラニュール単位で存在します。

インデックス作成時には、3 つのファイルが（パートごとに）作成されます。

**Dictionary blocks file (.dct)**

インデックスグラニュール内のトークンはソートされ、128 トークンごとの辞書ブロックに格納されます（ブロックサイズはパラメータ `dictionary_block_size` で設定可能です）。
Dictionary blocks file (.dct) は、あるパート内のすべてのインデックスグラニュールに対するすべての辞書ブロックから構成されます。

**Index granules file (.idx)**

Index granules file (.idx) には、各辞書ブロックについて、そのブロックの先頭トークン、dictionary blocks file 内での相対オフセット、そしてブロック内のすべてのトークンに対するブルームフィルタが含まれます。
この疎なインデックス構造は、ClickHouse の [sparse primary key index](https://clickhouse.com/docs/guides/best-practices/sparse-primary-indexes) と類似しています。
ブルームフィルタにより、検索対象のトークンが辞書ブロックに含まれていない場合、その辞書ブロックを早期にスキップできます。

**Postings lists file (.pst)**

すべてのトークンに対するポスティングリストは、postings lists file 内に連続して配置されます。
ストレージ容量を節約しつつ、高速な積集合および和集合の演算を可能にするため、ポスティングリストは [roaring bitmaps](https://roaringbitmap.org/) として保存されます。
ポスティングリストの基数が 16 未満の場合（パラメータ `max_cardinality_for_embedded_postings` で設定可能）、そのリストは辞書内に埋め込まれます。

## 例：Hackernews データセット {#hacker-news-dataset}

大量のテキストを含む大規模なデータセットに対するテキストインデックスのパフォーマンス向上を確認していきます。
ここでは、人気サイトである Hacker News 上のコメント 2,870 万件を使用します。
以下はテキストインデックスを作成していないテーブルです：

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

この 2,870 万行は S3 上の Parquet ファイルに格納されています。これらを `hackernews` テーブルに挿入しましょう:

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

`ALTER TABLE` を使用して comment 列にテキストインデックスを追加し、次にそれをマテリアライズします:

```sql
-- Add the index
ALTER TABLE hackernews ADD INDEX comment_idx(comment) TYPE text(tokenizer = splitByNonAlpha);

-- Materialize the index for existing data
ALTER TABLE hackernews MATERIALIZE INDEX comment_idx SETTINGS mutations_sync = 2;
```

では、`hasToken`、`hasAnyTokens`、`hasAllTokens` 関数を使ってクエリを実行してみます。
次の例では、通常のインデックススキャンとダイレクトリードによる最適化の間で、どれほど大きな性能差が生じるかを示します。


### 1. `hasToken` を使用する {#using-hasToken}

`hasToken` は、テキストに特定の単一トークンが含まれているかどうかをチェックします。
ここでは大文字小文字を区別して、`ClickHouse` というトークンを検索します。

**ダイレクトリード無効（標準スキャン）**
デフォルトでは、ClickHouse はスキップインデックスを使ってグラニュールをフィルタリングし、そのグラニュールに対してカラムデータを読み込みます。
ダイレクトリードを無効にすることで、この動作をシミュレートできます。

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│     516 │
└─────────┘

1 row in set. Elapsed: 0.362 sec. Processed 24.90 million rows, 9.51 GB
```

**ダイレクトリード有効（高速インデックス読み取り）**
次に、デフォルトで有効になっているダイレクトリードを使用して同じクエリを実行します。

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│     516 │
└─────────┘

1 row in set. Elapsed: 0.008 sec. Processed 3.15 million rows, 3.15 MB
```

直接読み取りクエリは 45 倍以上高速 (0.362s 対 0.008s) で、インデックスのみから読み取ることで処理するデータ量も大幅に削減されます (9.51 GB 対 3.15 MB)。


### 2. `hasAnyTokens` を使用する {#using-hasAnyTokens}

`hasAnyTokens` は、テキストに指定したトークンのうち少なくとも 1 つが含まれているかどうかをチェックします。
ここでは、`love` または `ClickHouse` のいずれかを含むコメントを検索します。

**ダイレクトリード無効（標準スキャン）**

```sql
SELECT count()
FROM hackernews
WHERE hasAnyTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│  408426 │
└─────────┘

1 row in set. Elapsed: 1.329 sec. Processed 28.74 million rows, 9.72 GB
```

**ダイレクトリード有効（高速インデックス読み取り）**

```sql
SELECT count()
FROM hackernews
WHERE hasAnyTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│  408426 │
└─────────┘

1 row in set. Elapsed: 0.015 sec. Processed 27.99 million rows, 27.99 MB
```

この一般的な「OR」検索では、パフォーマンス向上はさらに顕著です。
このクエリはフルカラムスキャンを回避することで、約 89 倍高速 (1.329 秒 対 0.015 秒) になります。


### 3. `hasAllTokens`の使用 {#using-hasAllTokens}

`hasAllTokens`は、テキストに指定されたすべてのトークンが含まれているかを確認します。
&#39;love&#39;と&#39;ClickHouse&#39;の両方を含むコメントを検索します。

**ダイレクトリード無効（標準スキャン）**
ダイレクトリードが無効な場合でも、標準スキップインデックスは依然として有効です。
2870万行を14.746万行にフィルタリングしますが、カラムから57.03 MBを読み取る必要があります。

```sql
SELECT count()
FROM hackernews
WHERE hasAllTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│      11 │
└─────────┘

1 row in set. Elapsed: 0.184 sec. Processed 147.46 thousand rows, 57.03 MB
```

**ダイレクトリード有効（高速インデックス読み取り）**
ダイレクトリードではインデックスデータに対してクエリを実行し、147.46 KB だけを読み取って結果を返します。

```sql
SELECT count()
FROM hackernews
WHERE hasAllTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│      11 │
└─────────┘

1 row in set. Elapsed: 0.007 sec. Processed 147.46 thousand rows, 147.46 KB
```

この「AND」検索では、ダイレクトリード最適化は標準のスキップインデックススキャンと比較して 26 倍以上高速です（0.184 秒対 0.007 秒）。


### 4. 複合検索: OR, AND, NOT, ... {#compound-search}

ダイレクトリード最適化は、複合ブール式にも適用されます。
ここでは、大文字小文字を区別しない検索で「ClickHouse」または「clickhouse」を検索します。

**ダイレクトリード無効（標準スキャン）**

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse') OR hasToken(comment, 'clickhouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│     769 │
└─────────┘

1 row in set. Elapsed: 0.450 sec. Processed 25.87 million rows, 9.58 GB
```

**ダイレクトリード有効（高速インデックス読み取り）**

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse') OR hasToken(comment, 'clickhouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│     769 │
└─────────┘

1 row in set. Elapsed: 0.013 sec. Processed 25.87 million rows, 51.73 MB
```

インデックスの結果を組み合わせることで、直接読み取りクエリは 34 倍高速 (0.450 秒対 0.013 秒) になり、9.58 GB のカラムデータを読み込む必要がなくなります。
この特定のケースでは、`hasAnyTokens(comment, ['ClickHouse', 'clickhouse'])` が推奨される、より効率的な構文です。


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse における転置インデックスの紹介](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
- ブログ: [ClickHouse の全文検索の内部構造: 高速・ネイティブ・列指向](https://clickhouse.com/blog/clickhouse-full-text-search)
- 動画: [全文検索インデックス: 設計と実験](https://www.youtube.com/watch?v=O_MnyUkrIq8)