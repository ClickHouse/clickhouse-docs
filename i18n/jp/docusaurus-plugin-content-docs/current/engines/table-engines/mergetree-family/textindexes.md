---
description: 'テキスト内の検索キーワードをすばやく見つけます。'
keywords: ['全文検索', 'テキストインデックス', 'テキスト索引', '索引']
sidebar_label: 'テキストインデックスを使用した全文検索'
slug: /engines/table-engines/mergetree-family/textindexes
title: 'テキストインデックスを使用した全文検索'
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';


# テキストインデックスを使用した全文検索 {#full-text-search-using-text-indexes}

<BetaBadge/>

ClickHouse のテキストインデックス（["inverted indexes"](https://en.wikipedia.org/wiki/Inverted_index) としても知られています）は、文字列データに対して高速な全文検索機能を提供します。
この索引は、カラム内の各トークンを、そのトークンを含む行に対応付けます。
トークンは、トークナイゼーション（トークン化）と呼ばれる処理によって生成されます。
たとえば、ClickHouse は英語の文 "All cat like mice." をデフォルトで ["All", "cat", "like", "mice"] のようにトークン化します（末尾のドットは無視される点に注意してください）。
ログデータ向けなど、さらに高度なトークナイザーも利用可能です。

## テキスト索引の作成 {#creating-a-text-index}

テキスト索引を作成するには、まず対応する実験的な設定を有効化します。

```sql
SET enable_full_text_index = true;
```

テキストインデックスは、次の構文を使用して [String](/sql-reference/data-types/string.md)、[FixedString](/sql-reference/data-types/fixedstring.md)、[Array(String)](/sql-reference/data-types/array.md)、[Array(FixedString)](/sql-reference/data-types/array.md)、および [Map](/sql-reference/data-types/map.md)（map 関数 [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapKeys) および [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapValues) を介して）のカラムに定義できます。

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
                                [, posting_list_block_size = C]
                            )
)
ENGINE = MergeTree
ORDER BY key
```

**トークナイザー引数（必須）**。`tokenizer` 引数で使用するトークナイザーを指定します。

* `splitByNonAlpha` は、英数字以外の ASCII 文字で文字列を分割します（関数 [splitByNonAlpha](/sql-reference/functions/splitting-merging-functions.md/#splitByNonAlpha) も参照してください）。
* `splitByString(S)` は、ユーザー定義のセパレーター文字列 `S` に基づいて文字列を分割します（関数 [splitByString](/sql-reference/functions/splitting-merging-functions.md/#splitByString) も参照してください）。
  セパレーターはオプションのパラメーターで指定できます。例えば、`tokenizer = splitByString([', ', '; ', '\n', '\\'])` のように指定します。
  各文字列は複数文字から構成できます（例では `', '`）。
  セパレーターが明示的に指定されていない場合（例えば `tokenizer = splitByString`）、デフォルトのセパレーターリストは 1 つの空白 `[' ']` です。
* `ngrams(N)` は、文字列を同じ長さの `N`-gram に分割します（関数 [ngrams](/sql-reference/functions/splitting-merging-functions.md/#ngrams) も参照してください）。
  n-gram の長さは 1 から 8 の整数値をオプションパラメーターとして指定できます。例えば、`tokenizer = ngrams(3)` のように指定します。
  n-gram のデフォルトサイズは、明示的に指定されていない場合（例えば `tokenizer = ngrams`）、3 です。
* `sparseGrams(min_length, max_length, min_cutoff_length)` は、`min_length` 文字以上 `max_length` 文字以下（両端を含む）の可変長 n-gram に文字列を分割します（関数 [sparseGrams](/sql-reference/functions/string-functions#sparseGrams) も参照してください）。
  明示的に指定されていない場合、`min_length` と `max_length` のデフォルトはそれぞれ 3 と 100 です。
  パラメーター `min_cutoff_length` が指定されている場合、その長さ以上の n-gram のみが返されます。
  `ngrams(N)` と比較して、`sparseGrams` トークナイザーは可変長の N-gram を生成し、元のテキストをより柔軟に表現できます。
  例えば、`tokenizer = sparseGrams(3, 5, 4)` は内部的には入力文字列から 3-, 4-, 5-gram を生成しますが、4-gram と 5-gram のみが返されます。
* `array` はトークナイズを行わず、各行の値全体を 1 つのトークンとして扱います（関数 [array](/sql-reference/functions/array-functions.md/#array) も参照してください）。

:::note
`splitByString` トークナイザーは、セパレーターを左から右の順に適用します。
これによりあいまいさが生じる可能性があります。
例えば、セパレーター文字列 `['%21', '%']` を指定すると、`%21abc` は `['abc']` にトークナイズされますが、セパレーター文字列を `['%', '%21']` の順にすると、出力は `['21abc']` になります。
多くの場合、より長いセパレーターを優先してマッチさせたいはずです。
これは一般的には、セパレーター文字列を長い順（長さの降順）に渡すことで実現できます。
セパレーター文字列が [prefix code](https://en.wikipedia.org/wiki/Prefix_code) を構成している場合は、任意の順序で渡すことができます。
:::

:::warning
現時点では、中国語などの非西欧言語のテキストに対してテキスト索引を構築することは推奨されません。
現在サポートされているトークナイザーでは、索引サイズが非常に大きくなり、クエリ時間も長くなる可能性があります。
将来的には、これらのケースをより適切に処理できる、言語ごとに特化したトークナイザーを追加する予定です。
:::


トークナイザーが入力文字列をどのように分割するかをテストするには、ClickHouseの[tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens)関数を使用します:

例：

```sql
SELECT tokens('abc def', 'ngrams', 3);
```

結果:

```result
['abc','bc ','c d',' de','def']
```

**Preprocessor引数（オプション）**。`preprocessor`引数は、トークン化前に入力文字列に適用される式です。

プリプロセッサ引数の典型的な使用例は以下の通りです

1. 小文字化または大文字化によって大文字・小文字を区別しないマッチングを行います。例: [lower](/sql-reference/functions/string-functions.md/#lower)、[lowerUTF8](/sql-reference/functions/string-functions.md/#lowerUTF8)。以下の最初の例を参照してください。
2. UTF-8 の正規化。例: [normalizeUTF8NFC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFC)、[normalizeUTF8NFD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFD)、[normalizeUTF8NFKC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKC)、[normalizeUTF8NFKD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKD)、[toValidUTF8](/sql-reference/functions/string-functions.md/#toValidUTF8)。
3. 不要な文字や部分文字列を削除または変換する。例えば、[extractTextFromHTML](/sql-reference/functions/string-functions.md/#extractTextFromHTML)、[substring](/sql-reference/functions/string-functions.md/#substring)、[idnaEncode](/sql-reference/functions/string-functions.md/#idnaEncode) など。

プリプロセッサ式は、[String](/sql-reference/data-types/string.md)型または[FixedString](/sql-reference/data-types/fixedstring.md)型の入力値を、同じ型の値に変換しなければなりません。

例:

* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(col))`
* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = substringIndex(col, '\n', 1))`
* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(extractTextFromHTML(col))`

また、プリプロセッサ式は、テキスト索引が定義されているカラムのみを参照する必要があります。
非決定的関数の使用は許可されていません。

関数 [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken)、[hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens)、および [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) は、プリプロセッサを使用して検索語をトークン化する前に変換を行います。

例：

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

は以下と同等です:

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

**その他の引数(オプション)**。ClickHouseのテキスト索引は[セカンダリ索引](/engines/table-engines/mergetree-family/mergetree.md/#skip-index-types)として実装されています。
ただし、他のスキップ索引とは異なり、テキスト索引は無限の粒度を持っています。つまり、テキスト索引はパーツ全体に対して作成され、明示的に指定した索引粒度は無視されます。
この値は経験的に選択されており、ほとんどのユースケースにおいて速度と索引サイズの適切なトレードオフを提供します。
上級ユーザーは異なる索引粒度を指定できますが、推奨しません。

<details markdown="1">

<summary>オプションの高度なパラメータ</summary>

以下の高度なパラメータのデフォルト値は、ほぼすべての状況で適切に動作します。
これらを変更することは推奨しません。

オプションのパラメータ `dictionary_block_size`（デフォルト: 512）は、Dictionary ブロックのサイズ（行数）を指定します。

オプションのパラメータ `dictionary_block_frontcoding_compression`（デフォルト: 1）は、Dictionary ブロックが圧縮方式としてフロントコーディングを使用するかどうかを指定します。

オプションのパラメータ `posting_list_block_size`（デフォルト: 1048576）は、ポスティングリストブロックのサイズ（行数）を指定します。

</details>

テキスト索引は、テーブル作成後でもカラムに追加したり削除したりできます。

```sql
ALTER TABLE tab DROP INDEX text_idx;
ALTER TABLE tab ADD INDEX text_idx(s) TYPE text(tokenizer = splitByNonAlpha);
```


## テキスト索引の使用 {#using-a-text-index}

SELECT クエリでテキスト索引を利用するのは容易で、一般的な文字列検索関数は索引を自動的に利用します。
索引が存在しない場合、以下の文字列検索関数は遅いフルスキャンにフォールバックします。

### サポートされている関数 {#functions-support}

テキストインデックスは、`WHERE` 句または `PREWHERE` 句でテキスト関数が使用されている場合に使用できます。

```sql
SELECT [...]
FROM [...]
WHERE string_search_function(column_with_text_index)
```


#### `=` と `!=` {#functions-example-equals-notequals}

`=` ([equals](/sql-reference/functions/comparison-functions.md/#equals)) と `!=` ([notEquals](/sql-reference/functions/comparison-functions.md/#notEquals)) は、指定した検索語と完全に一致するものを対象とします。

例:

```sql
SELECT * from tab WHERE str = 'Hello';
```

テキストインデックスは `=` と `!=` をサポートしますが、等価検索や不等価検索が有効なのは `array` tokenizer を使用する場合のみです（`array` tokenizer により、索引には行全体の値が保存されます）。


#### `IN` および `NOT IN` {#functions-example-in-notin}

`IN` ([in](/sql-reference/functions/in-functions)) と `NOT IN` ([notIn](/sql-reference/functions/in-functions)) は、関数 `equals` および `notEquals` と似ていますが、検索語のいずれかに一致するもの（`IN`）、または検索語のどれにも一致しないもの（`NOT IN`）を検索します。

例:

```sql
SELECT * from tab WHERE str IN ('Hello', 'World');
```

`=` および `!=` と同じ制約が適用されます。つまり、`IN` と `NOT IN` は `array` トークナイザーと組み合わせて使用する場合にのみ有効です。


#### `LIKE`、`NOT LIKE`、`match` {#functions-example-like-notlike-match}

:::note
これらの関数がフィルタリング時にテキスト索引を利用できるのは、索引トークナイザが `splitByNonAlpha`、`ngrams`、または `sparseGrams` の場合のみです。
:::

`LIKE`（[like](/sql-reference/functions/string-search-functions.md/#like)）、`NOT LIKE`（[notLike](/sql-reference/functions/string-search-functions.md/#notLike)）、および [match](/sql-reference/functions/string-search-functions.md/#match) 関数をテキスト索引と併用するには、ClickHouse が検索語句から完全なトークンを抽出できる必要があります。
`ngrams` トークナイザを用いた索引では、特殊文字で区切られた検索文字列の長さが ngram の長さ以上である場合に、この条件を満たします。

`splitByNonAlpha` トークナイザを用いたテキスト索引の例：

```sql
SELECT count() FROM tab WHERE comment LIKE 'support%';
```

この例の `support` は、`support`、`supports`、`supporting` などにマッチします。
この種のクエリは部分一致クエリであり、テキストインデックスによって高速化することはできません。

LIKE クエリでテキストインデックスを活用するには、LIKE パターンを次のように書き換える必要があります。

```sql
SELECT count() FROM tab WHERE comment LIKE ' support %'; -- or `% support %`
```

`support` の左右に空白を入れておくことで、その語をトークンとして抽出できるようにしています。


#### `startsWith` と `endsWith` {#functions-example-startswith-endswith}

`LIKE` と同様に、[startsWith](/sql-reference/functions/string-functions.md/#startsWith) 関数と [endsWith](/sql-reference/functions/string-functions.md/#endsWith) 関数は、検索語句から完全なトークンを抽出できる場合に限り、テキストインデックスを利用できます。
`ngrams` トークナイザーを用いるテキストインデックスの場合、検索する接頭辞または接尾辞の長さが ngram の長さ以上であれば、この条件を満たします。

`splitByNonAlpha` トークナイザーを用いるテキストインデックスの例：

```sql
SELECT count() FROM tab WHERE startsWith(comment, 'clickhouse support');
```

この例では、`clickhouse` だけがトークンとして扱われます。
`support` は `support`、`supports`、`supporting` などにマッチする可能性があるため、トークンとは見なされません。

`clickhouse supports` で始まるすべての行を検索するには、検索パターンの末尾にスペースを 1 つ追加してください。

```sql
startsWith(comment, 'clickhouse supports ')`
```

同様に、`endsWith` も先頭にスペースを付けて使用します。

```sql
SELECT count() FROM tab WHERE endsWith(comment, ' olap engine');
```


#### `hasToken` と `hasTokenOrNull` {#functions-example-hastoken-hastokenornull}

[hasToken](/sql-reference/functions/string-search-functions.md/#hasToken) 関数と [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull) 関数は、指定された 1 つのトークンに対して照合を行います。

前述の関数とは異なり、検索語句をトークン化しません（入力が 1 つのトークンであると仮定します）。

例:

```sql
SELECT count() FROM tab WHERE hasToken(comment, 'clickhouse');
```

`text` 索引と組み合わせて使用する場合、`hasToken` 関数と `hasTokenOrNull` 関数が最も効率的です。


#### `hasAnyTokens` と `hasAllTokens` {#functions-example-hasanytokens-hasalltokens}

関数 [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) および [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) は、指定されたトークンの一部またはすべてにマッチします。

これら 2 つの関数は、検索トークンを、索引用カラムで使用されているものと同じトークナイザーでトークナイズされる文字列として指定するか、あるいは検索前に追加のトークナイズを行わない、既に処理済みのトークン配列として指定できます。
詳細については関数のドキュメントを参照してください。

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

配列関数 [has](/sql-reference/functions/array-functions#has) は、文字列配列内の特定のトークンに対して一致判定を行います。

例:

```sql
SELECT count() FROM tab WHERE has(array, 'clickhouse');
```


#### `mapContains` {#functions-example-mapcontains}

[mapContains](/sql-reference/functions/tuple-map-functions#mapcontains) 関数（`mapContainsKey` のエイリアス）は、検索文字列から抽出されたトークンを、マップのキーに含まれるトークンと照合してマッチさせます。挙動は、`String` カラムに対する `equals` 関数と似ています。テキストインデックスは、`mapKeys(map)` 式に対して作成されている場合にのみ使用されます。

例:

```sql
SELECT count() FROM tab WHERE mapContainsKey(map, 'clickhouse');
-- OR
SELECT count() FROM tab WHERE mapContains(map, 'clickhouse');
```


#### `mapContainsValue` {#functions-example-mapcontainsvalue}

[mapContainsValue](/sql-reference/functions/tuple-map-functions#mapcontainsvalue) 関数は、検索対象とする文字列から抽出されたトークンに対して、マップの値の中から一致を検索します。この動作は、`String` カラムに対する `equals` 関数と同様です。テキストインデックスは、`mapValues(map)` 式上に作成されている場合にのみ使用されます。

例:

```sql
SELECT count() FROM tab WHERE mapContainsValue(map, 'clickhouse');
```


#### `mapContainsKeyLike` と `mapContainsValueLike` {#functions-example-mapcontainslike}

[mapContainsKeyLike](/sql-reference/functions/tuple-map-functions#mapContainsKeyLike) 関数と [mapContainsValueLike](/sql-reference/functions/tuple-map-functions#mapContainsValueLike) 関数は、マップのキーまたは値（それぞれ対応する関数に応じて）に対してパターンマッチを行います。

例:

```sql
SELECT count() FROM tab WHERE mapContainsKeyLike(map, '% clickhouse %');
SELECT count() FROM tab WHERE mapContainsValueLike(map, '% clickhouse %');
```


#### `operator[]` {#functions-example-access-operator}

アクセス演算子 [operator[]](/sql-reference/operators#access-operators) をテキスト索引と組み合わせて使用し、キーと値をフィルタリングできます。テキスト索引は、`mapKeys(map)` または `mapValues(map)` の式、あるいはその両方に対して作成されている場合にのみ使用されます。

例:

```sql
SELECT count() FROM tab WHERE map['engine'] = 'clickhouse';
```

テキスト索引で `Array(T)` 型および `Map(K, V)` 型のカラムを使用する例を以下に示します。


### テキスト索引付き `Array` および `Map` カラムの例 {#text-index-array-and-map-examples}

#### Array(String) カラムのインデックス作成 {#text-index-example-array}

ブログプラットフォームを想像してください。著者はキーワードを使ってブログ記事にカテゴリを付けます。
ユーザーには、トピックを検索したりクリックしたりして関連コンテンツを見つけられるようにしたいとします。

次のテーブル定義を考えてみます。

```sql
CREATE TABLE posts
(
    post_id UInt64,
    title String,
    content String,
    keywords Array(String)
)
ENGINE = MergeTree
ORDER BY (post_id);
```

テキスト索引がない場合、特定のキーワード（例：`clickhouse`）を含む投稿を見つけるには、すべてのエントリを走査する必要があります。

```sql
SELECT count() FROM posts WHERE has(keywords, 'clickhouse'); -- slow full-table scan - checks every keyword in every post
```

プラットフォームが成長するにつれて、クエリではすべての行の `keywords` 配列を走査する必要があるため、処理がますます遅くなります。
このパフォーマンスの問題を解決するために、カラム `keywords` に対してテキスト索引を定義します。

```sql
ALTER TABLE posts ADD INDEX keywords_idx(keywords) TYPE text(tokenizer = splitByNonAlpha);
ALTER TABLE posts MATERIALIZE INDEX keywords_idx; -- Don't forget to rebuild the index for existing data
```


#### Map カラムへのインデックス作成 {#text-index-example-map}

多くのオブザーバビリティ関連のユースケースでは、ログメッセージは「コンポーネント」に分割され、タイムスタンプには datetime 型、ログレベルには enum 型など、適切なデータ型として保存されます。
メトリクスのフィールドはキー・バリューのペアとして保存するのが最適です。
運用チームは、デバッグやセキュリティインシデント、監視のために、ログを効率的に検索する必要があります。

次のような logs テーブルを考えてみましょう:

```sql
CREATE TABLE logs
(
    id UInt64,
    timestamp DateTime,
    message String,
    attributes Map(String, String)
)
ENGINE = MergeTree
ORDER BY (timestamp);
```

テキストインデックスがない場合、[Map](/sql-reference/data-types/map.md) データを検索するにはテーブル全体をスキャンする必要があります。

```sql
-- Finds all logs with rate limiting data:
SELECT count() FROM logs WHERE has(mapKeys(attributes), 'rate_limit'); -- slow full-table scan

-- Finds all logs from a specific IP:
SELECT count() FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- slow full-table scan
```

ログ量が増えると、これらのクエリは遅くなります。

解決策は、[Map](/sql-reference/data-types/map.md) のキーと値に対してテキスト索引を作成することです。
フィールド名や属性タイプでログを検索する必要がある場合は、[mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapKeys) を使用してテキスト索引を作成します。

```sql
ALTER TABLE logs ADD INDEX attributes_keys_idx mapKeys(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_keys_idx;
```

属性値の実際の内容を検索する必要がある場合は、[mapValues](/sql-reference/functions/tuple-map-functions.md/#mapValues) を使用してテキスト索引を作成します。

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

-- Finds all logs where any attribute includes an error:
SELECT * FROM logs WHERE mapContainsValueLike(attributes, '% error %'); -- fast
```


## パフォーマンスのチューニング {#performance-tuning}

### ダイレクトリード {#direct-read}

特定の種類のテキストクエリは、「ダイレクトリード」と呼ばれる最適化によって大幅に高速化されます。

例:

```sql
SELECT column_a, column_b, ...
FROM [...]
WHERE string_search_function(column_with_text_index)
```

ClickHouse のダイレクトリード最適化は、基盤となるテキストカラムにアクセスせず、テキストインデックス（すなわちテキストインデックスルックアップ）のみを用いてクエリに応答します。
テキストインデックスルックアップは読み取るデータ量が比較的少ないため、ClickHouse の通常のスキップインデックス（スキップインデックスのルックアップを行った後に、残ったグラニュールを読み込み・フィルタリングする）よりもはるかに高速です。

ダイレクトリードは 2 つの設定で制御されます:

* ダイレクトリードを全体として有効にするかどうかを指定する [query&#95;plan&#95;direct&#95;read&#95;from&#95;text&#95;index](../../../operations/settings/settings#query_plan_direct_read_from_text_index) 設定。
* ダイレクトリードのもう 1 つの前提条件である [use&#95;skip&#95;indexes&#95;on&#95;data&#95;read](../../../operations/settings/settings#use_skip_indexes_on_data_read) 設定。なお、[compatibility](../../../operations/settings/settings#compatibility) &lt; 25.10 の ClickHouse データベースでは `use_skip_indexes_on_data_read` は無効化されているため、compatibility 設定値を引き上げるか、明示的に `SET use_skip_indexes_on_data_read = 1` を実行する必要があります。

また、ダイレクトリードを使用するにはテキストインデックスが完全にマテリアライズされている必要があります（そのためには `ALTER TABLE ... MATERIALIZE INDEX` を使用します）。

**サポートされている関数**

ダイレクトリード最適化は `hasToken`、`hasAllTokens`、`hasAnyTokens` 関数をサポートします。
テキストインデックスが `array` トークナイザーで作成されている場合、`equals`、`has`、`mapContainsKey`、`mapContainsValue` 関数に対してもダイレクトリードがサポートされます。
これらの関数は AND、OR、NOT 演算子で組み合わせることもできます。
`WHERE` または `PREWHERE` 句には、（テキストカラムやその他のカラムに対する）追加の非テキスト検索関数によるフィルタも含めることができます。この場合でもダイレクトリード最適化は使用されますが、その効果は小さくなります（サポートされているテキスト検索関数にのみ適用されるためです）。

クエリがダイレクトリードを利用しているかを確認するには、`EXPLAIN PLAN actions = 1` を付けてクエリを実行します。
例として、ダイレクトリードを無効にしたクエリは次のようになります。

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

一方、`query_plan_direct_read_from_text_index = 1` を指定して同じクエリを実行した場合

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

2つ目の EXPLAIN PLAN の出力には、仮想カラム `__text_index_<index_name>_<function_name>_<id>` が含まれています。
このカラムが存在する場合、直接読み取りが使用されます。

ダイレクトリード最適化のパフォーマンス向上効果は、テキストカラムがテキスト検索関数内でのみ使用されている場合に最大になります。この場合、クエリはカラムデータをまったく読み取らずに済みます。ただし、テキストカラムがクエリ内の他の箇所で参照されて読み取りが必要な場合でも、ダイレクトリード最適化は依然としてパフォーマンス向上に寄与します。

**ヒントとしてのダイレクトリード**

ヒントとしてのダイレクトリードは、通常のダイレクトリードと同じ原理に基づきますが、基盤となるテキストカラムを削除せずに、テキストインデックスデータから構築された追加のフィルタを付加する点が異なります。これは、テキストインデックスのみへのアクセスでは偽陽性が発生しうる関数に対して使用されます。

サポートされている関数は `like`、`startsWith`、`endsWith`、`equals`、`has`、`mapContainsKey`、`mapContainsValue` です。

ヒントフィルタは、他のフィルタと組み合わせて結果セットをさらに絞り込むための追加の選択性を提供し、他のカラムから読み取るデータ量を減らすのに役立ちます。


ダイレクトリードをヒントとして使用するかどうかは、[query&#95;plan&#95;text&#95;index&#95;add&#95;hint](../../../operations/settings/settings#query_plan_text_index_add_hint) の設定で制御されます（既定で有効です）。

ヒントを指定しないクエリの例：

```sql
EXPLAIN actions = 1
SELECT count()
FROM tab
WHERE (col LIKE '%some-token%') AND (d >= today())
SETTINGS use_skip_indexes_on_data_read = 1, query_plan_text_index_add_hint = 0
FORMAT TSV
```

戻り値

```text
[...]
Prewhere filter column: and(like(__table1.col, \'%some-token%\'_String), greaterOrEquals(__table1.d, _CAST(20440_Date, \'Date\'_String))) (removed)
[...]
```

一方、`query_plan_text_index_add_hint = 1` を指定して同じクエリを実行した場合には

```sql
EXPLAIN actions = 1
SELECT count()
FROM tab
WHERE col LIKE '%some-token%'
SETTINGS use_skip_indexes_on_data_read = 1, query_plan_text_index_add_hint = 1
```

戻り値

```text
[...]
Prewhere filter column: and(__text_index_idx_col_like_d306f7c9c95238594618ac23eb7a3f74, like(__table1.col, \'%some-token%\'_String), greaterOrEquals(__table1.d, _CAST(20440_Date, \'Date\'_String))) (removed)
[...]
```

2 つ目の `EXPLAIN PLAN` の出力では、フィルター条件に追加の条件（`__text_index_...`）が加えられていることが分かります。[`PREWHERE`](docs/sql-reference/statements/select/prewhere) 最適化により、フィルター条件は 3 つの個別の条件（論理積の各節）に分解され、計算コストが小さいものから順に適用されます。このクエリでは、適用順序は `__text_index_...`、次に `greaterOrEquals(...)`、最後に `like(...)` です。この順序付けにより、テキストインデックスと元のフィルターだけでスキップされるグラニュールよりもさらに多くのデータグラニュールをスキップし、そのうえで `WHERE` 句以降のクエリで使用される重いカラムを読み込む前に、読み取るデータ量を一層削減できます。


### キャッシュ {#caching}

テキストインデックスの一部をメモリ上でバッファするために、複数のキャッシュが利用できます（[Implementation Details](#implementation) セクションを参照してください）。
現在、I/O を削減するために、テキストインデックスのデシリアライズ済みの Dictionary ブロック、ヘッダー、およびポスティングリスト向けのキャッシュが用意されています。
これらは設定 [use_text_index_dictionary_cache](/operations/settings/settings#use_text_index_dictionary_cache)、[use_text_index_header_cache](/operations/settings/settings#use_text_index_header_cache)、および [use_text_index_postings_cache](/operations/settings/settings#use_text_index_postings_cache) で有効化できます。
デフォルトでは、すべてのキャッシュは無効になっています。
キャッシュを削除するには、[SYSTEM DROP TEXT INDEX CACHES](../../../sql-reference/statements/system#drop-text-index-caches) 文を使用します。

キャッシュを構成するには、以下のサーバー設定を参照してください。

#### Dictionary ブロックキャッシュ設定 {#caching-dictionary}

| Setting                                                                                                                                                  | 説明                                                                                                            |
|----------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| [text_index_dictionary_block_cache_policy](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_policy)                | テキストインデックス Dictionary ブロックキャッシュのポリシー名。                                                |
| [text_index_dictionary_block_cache_size](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size)                    | キャッシュの最大サイズ（バイト単位）。                                                                         |
| [text_index_dictionary_block_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_max_entries)      | キャッシュ内に保持されるデシリアライズ済み Dictionary ブロック数の上限。                                       |
| [text_index_dictionary_block_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size_ratio)        | テキストインデックス Dictionary ブロックキャッシュにおける、保護キューのサイズ（キャッシュ全体に対する比率）。 |

#### ヘッダーキャッシュの設定 {#caching-header}

| 設定                                                                                                                                | 説明                                                                                                 |
|--------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| [text_index_header_cache_policy](/operations/server-configuration-parameters/settings#text_index_header_cache_policy)                | テキストインデックスヘッダーキャッシュのポリシー名。                                                 |
| [text_index_header_cache_size](/operations/server-configuration-parameters/settings#text_index_header_cache_size)                    | キャッシュの最大サイズ（バイト単位）。                                                               |
| [text_index_header_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_header_cache_max_entries)      | キャッシュ内のデシリアライズ済みヘッダーの最大数。                                                   |
| [text_index_header_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_header_cache_size_ratio)        | テキストインデックスヘッダーキャッシュにおける、保護キューのサイズがキャッシュ全体サイズに対して占める割合。 |

#### ポスティングリストキャッシュ設定 {#caching-posting-lists}

| 設定                                                                                                                               | 説明                                                                                             |
|---------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [text_index_postings_cache_policy](/operations/server-configuration-parameters/settings#text_index_postings_cache_policy)             | テキストインデックスのポスティングリストキャッシュポリシー名。                                                                  |
| [text_index_postings_cache_size](/operations/server-configuration-parameters/settings#text_index_postings_cache_size)                 | キャッシュの最大サイズ（バイト単位）。                                                                            |
| [text_index_postings_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_postings_cache_max_entries)   | キャッシュ内のデシリアライズ済みポスティングリストの最大件数。                                                       |
| [text_index_postings_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_postings_cache_size_ratio)     | テキストインデックスのポスティングリストキャッシュにおける保護キューサイズの、キャッシュ全体サイズに対する比率。   |

## 実装の詳細 {#implementation}

各テキスト索引は、2つの（抽象的な）データ構造から構成されます。

- 各トークンをポスティングリストに対応付ける dictionary
- 行番号の集合を表す複数のポスティングリストの集合

テキスト索引はパーツ全体に対して構築されます。他のスキップ索引と異なり、テキスト索引はデータパーツのマージ時に再構築するのではなく、マージによって統合できます。

索引の作成時には、3つのファイルが（パーツごとに）作成されます。

**Dictionary blocks ファイル (.dct)**

テキスト索引内のトークンはソートされ、各 512 トークン（ブロックサイズはパラメータ `dictionary_block_size` で設定可能）ごとの dictionary block に格納されます。
Dictionary blocks ファイル (.dct) は、1 つのパーツ内にあるすべての索引グラニュールに対応するすべての dictionary block から構成されます。

**Index header ファイル (.idx)**

Index header ファイルには、各 dictionary block について、そのブロックの最初のトークンと、dictionary blocks ファイル内での相対オフセットが格納されます。

このスパースな索引構造は、ClickHouse の [sparse primary key index](https://clickhouse.com/docs/guides/best-practices/sparse-primary-indexes)) と同様です。

**Postings lists ファイル (.pst)**

すべてのトークンに対するポスティングリストは、postings lists ファイル内に連続して配置されます。
領域を節約しつつ、高速な積集合および和集合の演算を可能にするために、ポスティングリストは [roaring bitmaps](https://roaringbitmap.org/) として格納されます。
ポスティングリストが `posting_list_block_size` より大きい場合は、複数のブロックに分割され、postings lists ファイル内に連続して格納されます。

**テキスト索引のマージ**

データパーツがマージされる際、テキスト索引を最初から再構築する必要はなく、マージ処理の別ステップで効率的にマージできます。このステップでは、各パーツからソート済みの dictionary を読み込み、それらを結合して新しい統合 dictionary を作成します。ポスティングリスト内の行番号も、初期マージフェーズで作成された旧行番号から新行番号へのマッピングを用いて、マージ後のデータパーツ内での新しい位置を反映するように再計算されます。このテキスト索引のマージ方法は、`_part_offset` カラムを持つ [projections](/docs/sql-reference/statements/alter/projection#normal-projection-with-part-offset-field) がマージされる方法と類似しています。索引がソースパーツ内でマテリアライズされていない場合は、その索引を構築して一時ファイルに書き出し、その後、他のパーツの索引や他の一時索引ファイルと一緒にマージします。

## 例：Hackernews データセット {#hacker-news-dataset}

大量のテキストを含む大規模データセットに対するテキスト索引のパフォーマンス向上を見ていきます。
ここでは、人気サイト「Hacker News」のコメント 2,870 万行を使用します。
以下はテキスト索引なしのテーブルです。

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

この 2,870 万行は S3 上の Parquet ファイルに格納されています — これらを `hackernews` テーブルに挿入しましょう：

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

`ALTER TABLE` を使用して comment カラムにテキスト索引を追加し、その索引をマテリアライズします。

```sql
-- Add the index
ALTER TABLE hackernews ADD INDEX comment_idx(comment) TYPE text(tokenizer = splitByNonAlpha);

-- Materialize the index for existing data
ALTER TABLE hackernews MATERIALIZE INDEX comment_idx SETTINGS mutations_sync = 2;
```

では、`hasToken`、`hasAnyTokens`、`hasAllTokens` 関数を使ってクエリを実行してみましょう。
次の例では、通常の索引スキャンとダイレクトリード最適化を比較した場合の、劇的なパフォーマンス差を示します。


### 1. `hasToken` を使用する {#using-hasToken}

`hasToken` は、テキストに特定の単一トークンが含まれているかどうかを確認します。
ここでは、大文字・小文字を区別するトークン &#39;ClickHouse&#39; を検索します。

**ダイレクトリード無効化（標準スキャン）**
デフォルトでは、ClickHouse はスキップインデックスを使用してグラニュールをフィルタリングし、そのグラニュールのカラムデータを読み取ります。
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

**ダイレクトリード有効（高速索引読み出し）**
次に、ダイレクトリードを有効にした状態（これがデフォルト）で同じクエリを実行します。

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

直接読み取りクエリは、索引だけを読み取ることで 45 倍以上高速 (0.362 秒 対 0.008 秒) であり、処理するデータ量も大幅に少なくなります (9.51 GB 対 3.15 MB)。


### 2. `hasAnyTokens` の使用 {#using-hasAnyTokens}

`hasAnyTokens` は、テキストに指定されたトークンのうち少なくとも 1 つが含まれているかどうかをチェックします。
ここでは、&#39;love&#39; または &#39;ClickHouse&#39; のいずれかを含むコメントを検索します。

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

**ダイレクト読み取りの有効化（索引の高速読み取り）**

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

この一般的な「OR」検索では、性能向上はさらに顕著です。
フルカラムスキャンを回避することで、クエリはほぼ 89 倍高速になります（1.329秒 対 0.015秒）。


### 3. `hasAllTokens` の使用 {#using-hasAllTokens}

`hasAllTokens` は、テキストが指定されたすべてのトークンを含んでいるかどうかをチェックします。
ここでは、&#39;love&#39; と &#39;ClickHouse&#39; の両方を含むコメントを検索します。

**ダイレクトリード無効（標準スキャン）**
ダイレクトリードを無効にしても、標準のスキップ索引は引き続き有効です。
28.7M 行を 147.46K 行まで絞り込みますが、それでもカラムから 57.03 MB を読み取る必要があります。

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

**ダイレクトリード有効（高速な索引読み取り）**
ダイレクトリードは索引データのみを操作してクエリに応答し、読み取るデータ量は 147.46 KB にとどまります。

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

この「AND」検索では、ダイレクトリード最適化は標準的なスキップ索引スキャンに比べて 26 倍以上高速です（0.184 秒に対して 0.007 秒）。


### 4. 複合検索: OR、AND、NOT、... {#compound-search}

ダイレクトリードの最適化は、複合的なブール式にも適用されます。
ここでは、大文字小文字を区別せずに「ClickHouse」または「clickhouse」を検索します。

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

**ダイレクト読み取りの有効化（高速な索引読み取り）**

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

索引からの結果を組み合わせることで、直接読み取りクエリは 34 倍高速になり（0.450 秒から 0.013 秒へ短縮され）、9.58 GB 分のカラムデータの読み取りを回避できます。
このケースでは、`hasAnyTokens(comment, ['ClickHouse', 'clickhouse'])` が、より効率的で推奨される構文となります。


## 関連資料 {#related-content}

- ブログ: [Introducing Inverted Indices in ClickHouse](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
- ブログ: [Inside ClickHouse full-text search: fast, native, and columnar](https://clickhouse.com/blog/clickhouse-full-text-search)
- 動画: [Full-Text Indices: Design and Experiments](https://www.youtube.com/watch?v=O_MnyUkrIq8)