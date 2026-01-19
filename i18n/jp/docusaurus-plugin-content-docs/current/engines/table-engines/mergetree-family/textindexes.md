---
description: 'テキスト内の検索語をすばやく見つけます。'
keywords: ['全文検索', 'テキストインデックス', '索引', '索引']
sidebar_label: 'テキストインデックスを使用した全文検索'
slug: /engines/table-engines/mergetree-family/textindexes
title: 'テキストインデックスを使用した全文検索'
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';


# テキスト索引を使用した全文検索 \{#full-text-search-using-text-indexes\}

<BetaBadge/>

ClickHouse のテキスト索引（["inverted indexes"](https://en.wikipedia.org/wiki/Inverted_index) としても知られています）は、文字列データに対して高速な全文検索機能を提供します。
この索引は、カラム内の各トークンを、そのトークンを含む行にマッピングします。
トークンはトークナイズと呼ばれる処理によって生成されます。
例えば、ClickHouse は英語の文 "All cat like mice." をデフォルトで ["All", "cat", "like", "mice"] のようにトークナイズします（末尾のドットは無視されることに注意してください）。
ログデータ向けなど、より高度なトークナイザーも利用できます。

## テキスト索引の作成 \{#creating-a-text-index\}

テキスト索引を作成するには、まず対応する実験的な SETTING を有効化します。

```sql
SET enable_full_text_index = true;
```

テキスト索引は、次の構文を使用して、[String](/sql-reference/data-types/string.md)、[FixedString](/sql-reference/data-types/fixedstring.md)、[Array(String)](/sql-reference/data-types/array.md)、[Array(FixedString)](/sql-reference/data-types/array.md)、および [Map](/sql-reference/data-types/map.md)（[mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapKeys) および [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapValues) の map 関数経由）カラムに定義できます。

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

**Tokenizer 引数（必須）**。`tokenizer` 引数は使用するトークナイザーを指定します:

* `splitByNonAlpha` は、英数字以外の ASCII 文字で文字列を分割します（関数 [splitByNonAlpha](/sql-reference/functions/splitting-merging-functions.md/#splitByNonAlpha) も参照）。
* `splitByString(S)` は、ユーザー定義の区切り文字列 `S` ごとに文字列を分割します（関数 [splitByString](/sql-reference/functions/splitting-merging-functions.md/#splitByString) も参照）。
  区切り文字列はオプションのパラメータで指定できます。例えば、`tokenizer = splitByString([', ', '; ', '\n', '\\'])` のように指定します。
  各区切り文字列は複数文字から構成されてもかまわず（例では `', '`）、そのまま 1 つの区切り文字列として扱われます。
  区切り文字列のリストを明示的に指定しなかった場合（例えば `tokenizer = splitByString`）、デフォルトの区切り文字は単一の空白 `[' ']` です。
* `ngrams(N)` は、文字列を固定長 `N` の N-gram に分割します（関数 [ngrams](/sql-reference/functions/splitting-merging-functions.md/#ngrams) も参照）。
  N-gram の長さは 1 から 8 の整数のオプション引数で指定でき、例えば `tokenizer = ngrams(3)` のように指定します。
  N-gram サイズを明示的に指定しなかった場合（例えば `tokenizer = ngrams`）、デフォルト値は 3 です。
* `sparseGrams(min_length, max_length, min_cutoff_length)` は、`min_length` 文字以上 `max_length` 文字以下（両端を含む）の可変長 N-gram に文字列を分割します（関数 [sparseGrams](/sql-reference/functions/string-functions#sparseGrams) も参照）。
  明示的に指定しない場合、`min_length` と `max_length` のデフォルトはそれぞれ 3 と 100 です。
  パラメータ `min_cutoff_length` を指定すると、長さが `min_cutoff_length` 以上の N-gram のみが返されます。
  `ngrams(N)` と比べて、`sparseGrams` トークナイザーは可変長 N-gram を生成するため、元テキストのより柔軟な表現が可能です。
  例えば、`tokenizer = sparseGrams(3, 5, 4)` は内部的には入力文字列から 3-, 4-, 5-gram を生成しますが、返されるのは 4-gram と 5-gram のみです。
* `array` はトークナイズを行いません。すなわち、各行の値全体が 1 つのトークンになります（関数 [array](/sql-reference/functions/array-functions.md/#array) も参照）。

:::note
`splitByString` トークナイザーは、左から右へ順に区切り文字列を適用します。
これによりあいまいさが生じる場合があります。
例えば、区切り文字列を `['%21', '%']` とすると、`%21abc` は `['abc']` としてトークナイズされますが、区切り文字列の順序を `['%', '%21']` と入れ替えると、`['21abc']` が出力されます。
多くの場合、マッチングではより長い区切り文字列を優先的にマッチさせたいはずです。
これは一般的に、区切り文字列を長い順（長さの降順）で渡すことで実現できます。
区切り文字列が [prefix code](https://en.wikipedia.org/wiki/Prefix_code) を形成している場合には、任意の順序で渡しても問題ありません。
:::

:::warning
現在のところ、中国語のような非西洋言語のテキストに対してテキストインデックスを構築することは推奨されません。
現時点でサポートされているトークナイザーでは、索引サイズやクエリ時間が非常に大きくなる可能性があります。
これらのケースをより適切に扱うため、将来的には言語別に特化したトークナイザーを追加する予定です。
:::


トークナイザが入力文字列をどのように分割するかをテストするには、ClickHouse の [tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens) 関数を使用できます。

例：

```sql
SELECT tokens('abc def', 'ngrams', 3);
```

結果：

```result
['abc','bc ','c d',' de','def']
```

**前処理引数（オプション）**。引数 `preprocessor` は、トークン化の前に入力文字列に適用される式です。

`preprocessor` 引数の代表的なユースケースには次のようなものがあります。

1. 大文字化／小文字化による大文字小文字を区別しないマッチングの実現。例: [lower](/sql-reference/functions/string-functions.md/#lower), [lowerUTF8](/sql-reference/functions/string-functions.md/#lowerUTF8)（以下の最初の例を参照）。
2. UTF-8 正規化。例: [normalizeUTF8NFC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFC), [normalizeUTF8NFD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFD), [normalizeUTF8NFKC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKC), [normalizeUTF8NFKD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKD), [toValidUTF8](/sql-reference/functions/string-functions.md/#toValidUTF8)。
3. 不要な文字や部分文字列の削除または変換。例: [extractTextFromHTML](/sql-reference/functions/string-functions.md/#extractTextFromHTML), [substring](/sql-reference/functions/string-functions.md/#substring), [idnaEncode](/sql-reference/functions/string-functions.md/#idnaEncode)。

`preprocessor` 式は、型 [String](/sql-reference/data-types/string.md) または [FixedString](/sql-reference/data-types/fixedstring.md) の入力値を、同じ型の値に変換しなければなりません。

例:

* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(col))`
* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = substringIndex(col, '\n', 1))`
* `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(extractTextFromHTML(col))`

また、`preprocessor` 式は、そのテキストインデックスが定義されているカラムのみを参照しなければなりません。
非決定的な関数を使用することはできません。

[hasToken](/sql-reference/functions/string-search-functions.md/#hasToken)、[hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens)、[hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) 関数は、検索語をトークン化する前に `preprocessor` を使って検索語を変換します。

例:

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

と同等になります:

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

**その他の引数 (オプション)**。ClickHouse のテキスト索引は[セカンダリ索引](/engines/table-engines/mergetree-family/mergetree.md/#skip-index-types)として実装されています。
ただし、他のスキップ索引と異なり、テキスト索引は実質的に無限の粒度を持ちます。つまり、テキスト索引はパーツ全体に対して作成され、明示的に指定された索引粒度は無視されます。
この既定値は経験的に選択されたもので、ほとんどのユースケースで速度と索引サイズの間の良好なトレードオフを提供します。
上級ユーザーは別の索引粒度を指定できますが、推奨はしません。

<details markdown="1">
  <summary>オプションの高度なパラメータ</summary>

  以下の高度なパラメータのデフォルト値は、ほぼすべての状況で適切に機能します。
  これらを変更することは推奨しません。

  オプションのパラメータ `dictionary_block_size` (デフォルト: 512) は、Dictionary ブロックのサイズを行数で指定します。

  オプションのパラメータ `dictionary_block_frontcoding_compression` (デフォルト: 1) は、Dictionary ブロックで圧縮方式として front coding を使用するかどうかを指定します。

  オプションのパラメータ `posting_list_block_size` (デフォルト: 1048576) は、posting list ブロックのサイズを行数で指定します。
</details>

テキスト索引は、テーブル作成後にカラムへ追加したり、カラムから削除したりできます。

```sql
ALTER TABLE tab DROP INDEX text_idx;
ALTER TABLE tab ADD INDEX text_idx(s) TYPE text(tokenizer = splitByNonAlpha);
```


## テキスト索引の使用 \{#using-a-text-index\}

SELECT クエリでテキスト索引を利用するのは容易で、一般的な文字列検索関数は自動的にその索引を活用します。
索引が存在しない場合、以下の文字列検索関数は低速な総当たりスキャンを行います。

### サポートされている関数 \{#functions-support\}

`WHERE` 句または `PREWHERE` 句でテキスト関数が使用されている場合、テキストインデックスを使用できます。

```sql
SELECT [...]
FROM [...]
WHERE string_search_function(column_with_text_index)
```


#### `=` と `!=` \{#functions-example-equals-notequals\}

`=` ([equals](/sql-reference/functions/comparison-functions.md/#equals)) と `!=` ([notEquals](/sql-reference/functions/comparison-functions.md/#notEquals)) は、指定された検索語句全体と一致します。

例:

```sql
SELECT * from tab WHERE str = 'Hello';
```

テキスト索引は `=` と `!=` をサポートしますが、`array` tokenizer を使う場合にのみ、等号／不等号による検索が意味を持ちます（その場合、索引には行全体の値が格納されるためです）。


#### `IN` と `NOT IN` \{#functions-example-in-notin\}

`IN` ([in](/sql-reference/functions/in-functions)) と `NOT IN` ([notIn](/sql-reference/functions/in-functions)) は `equals` および `notEquals` 関数と似ていますが、`IN` はいずれかの検索語に一致するもの、`NOT IN` はいずれの検索語にも一致しないものにマッチします。

例:

```sql
SELECT * from tab WHERE str IN ('Hello', 'World');
```

`=` および `!=` と同じ制限が適用されます。つまり、`IN` と `NOT IN` は `array` トークナイザーと併用する場合にのみ有効です。


#### `LIKE`, `NOT LIKE` および `match` \{#functions-example-like-notlike-match\}

:::note
これらの関数がテキストインデックスをフィルタリングに利用するのは、インデックスの tokenizer が `splitByNonAlpha`、`ngrams`、または `sparseGrams` のいずれかである場合に限られます。
:::

テキストインデックスで `LIKE` ([like](/sql-reference/functions/string-search-functions.md/#like))、`NOT LIKE` ([notLike](/sql-reference/functions/string-search-functions.md/#notLike))、および [match](/sql-reference/functions/string-search-functions.md/#match) 関数を使用するには、ClickHouse が検索語から完全なトークンを抽出できる必要があります。
`ngrams` tokenizer を持つインデックスでは、ワイルドカードの間にある検索文字列の長さが ngram の長さ以上であれば、この条件を満たします。

`splitByNonAlpha` tokenizer を持つテキストインデックスの例:

```sql
SELECT count() FROM tab WHERE comment LIKE 'support%';
```

この例の `support` は、`support`、`supports`、`supporting` などにマッチし得ます。
この種のクエリは部分文字列クエリであり、テキスト索引によって高速化することはできません。

LIKE クエリでテキスト索引を活用するには、LIKE パターンを次のように書き換える必要があります。

```sql
SELECT count() FROM tab WHERE comment LIKE ' support %'; -- or `% support %`
```

`support` の左右に空白を入れておくことで、その語をトークンとして抽出できるようにします。


#### `startsWith` と `endsWith` \{#functions-example-startswith-endswith\}

`LIKE` と同様に、関数 [startsWith](/sql-reference/functions/string-functions.md/#startsWith) と [endsWith](/sql-reference/functions/string-functions.md/#endsWith) は、検索語から完全なトークンを抽出できる場合にのみテキストインデックスを使用できます。
`ngrams` トークナイザーを使用するインデックスでは、ワイルドカードの間にある検索文字列の長さが ngram の長さ以上である場合に、この条件を満たします。

`splitByNonAlpha` トークナイザーを用いたテキストインデックスの例:

```sql
SELECT count() FROM tab WHERE startsWith(comment, 'clickhouse support');
```

この例では、`clickhouse` だけがトークンとして扱われます。
`support` は `support`、`supports`、`supporting` などにマッチする可能性があるため、トークンとは見なされません。

`clickhouse supports` で始まるすべての行を検索するには、検索パターンの末尾にスペースを付けてください。

```sql
startsWith(comment, 'clickhouse supports ')`
```

同様に、`endsWith` は先頭にスペース（空白）を付けて使用します。

```sql
SELECT count() FROM tab WHERE endsWith(comment, ' olap engine');
```


#### `hasToken` および `hasTokenOrNull` \{#functions-example-hastoken-hastokenornull\}

関数 [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken) と [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull) は、指定された 1 つのトークンとの照合を行います。

前述の関数とは異なり、検索語句をトークン化しません（入力が 1 つのトークンであることを前提とします）。

例:

```sql
SELECT count() FROM tab WHERE hasToken(comment, 'clickhouse');
```

関数 `hasToken` と `hasTokenOrNull` は、`text` 索引と組み合わせて使用できる最も高性能な関数です。


#### `hasAnyTokens` と `hasAllTokens` \{#functions-example-hasanytokens-hasalltokens\}

関数 [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) と [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) は、指定されたトークンのいずれか、またはすべてにマッチします。

これら 2 つの関数では、検索トークンは、索引用カラムに対して使用されているものと同じトークナイザでトークナイズされる文字列として指定するか、あるいは検索前にトークナイズを行う必要のない、すでに処理済みのトークン配列として指定できます。
詳細は各関数のドキュメントを参照してください。

例:

```sql
-- Search tokens passed as string argument
SELECT count() FROM tab WHERE hasAnyTokens(comment, 'clickhouse olap');
SELECT count() FROM tab WHERE hasAllTokens(comment, 'clickhouse olap');

-- Search tokens passed as Array(String)
SELECT count() FROM tab WHERE hasAnyTokens(comment, ['clickhouse', 'olap']);
SELECT count() FROM tab WHERE hasAllTokens(comment, ['clickhouse', 'olap']);
```


#### `has` \{#functions-example-has\}

配列関数 [has](/sql-reference/functions/array-functions#has) は、文字列の配列に含まれる単一のトークンに対してマッチします。

例:

```sql
SELECT count() FROM tab WHERE has(array, 'clickhouse');
```


#### `mapContains` \{#functions-example-mapcontains\}

[mapContains](/sql-reference/functions/tuple-map-functions#mapContains) 関数（`mapContainsKey` のエイリアス）は、検索対象の文字列から抽出されたトークンを map のキーと照合します。
動作は、`String` カラムに対する `equals` 関数と同様です。
テキストインデックスが使用されるのは、`mapKeys(map)` 式に対して作成されている場合のみです。

例:

```sql
SELECT count() FROM tab WHERE mapContainsKey(map, 'clickhouse');
-- OR
SELECT count() FROM tab WHERE mapContains(map, 'clickhouse');
```


#### `mapContainsValue` \{#functions-example-mapcontainsvalue\}

[mapContainsValue](/sql-reference/functions/tuple-map-functions#mapContainsValue) 関数は、検索対象文字列から抽出されたトークンがマップの値に含まれるかどうかを照合します。
挙動は、`String` カラムに対する `equals` 関数と類似しています。
テキストインデックスは、`mapValues(map)` 式に対して作成されている場合にのみ使用されます。

例:

```sql
SELECT count() FROM tab WHERE mapContainsValue(map, 'clickhouse');
```


#### `mapContainsKeyLike` と `mapContainsValueLike` \{#functions-example-mapcontainslike\}

関数 [mapContainsKeyLike](/sql-reference/functions/tuple-map-functions#mapContainsKeyLike) と [mapContainsValueLike](/sql-reference/functions/tuple-map-functions#mapContainsValueLike) は、マップのすべてのキー（または値）を対象に、パターンとの照合を行います。

例:

```sql
SELECT count() FROM tab WHERE mapContainsKeyLike(map, '% clickhouse %');
SELECT count() FROM tab WHERE mapContainsValueLike(map, '% clickhouse %');
```


#### `operator[]` \{#functions-example-access-operator\}

アクセス用の [operator[]](/sql-reference/operators#access-operators) は、テキスト索引と組み合わせて使用することで、キーや値をフィルタリングできます。テキスト索引が使用されるのは、`mapKeys(map)` または `mapValues(map)`、あるいはその両方の式に対して作成されている場合のみです。

例：

```sql
SELECT count() FROM tab WHERE map['engine'] = 'clickhouse';
```

テキスト索引と併用する `Array(T)` 型および `Map(K, V)` 型カラムの例を以下に示します。


### `Array` および `Map` カラムに対するテキストインデックスの例 \{#text-index-array-and-map-examples\}

#### Array(String) カラムのインデックス化 \{#text-index-example-array\}

ブログプラットフォームを想像してください。そこでは、著者がブログ記事にキーワードを付けてカテゴリ分けしています。
ユーザーには、トピックを検索したりクリックしたりすることで、関連コンテンツを見つけてほしいと考えています。

次のテーブル定義を考えてみてください：

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

テキスト索引がない場合、特定のキーワード（例：`clickhouse`）を含む投稿を検索するには、すべてのエントリを走査する必要があります。

```sql
SELECT count() FROM posts WHERE has(keywords, 'clickhouse'); -- slow full-table scan - checks every keyword in every post
```

プラットフォームが成長するにつれて、クエリはすべての行の keywords 配列を走査しなければならないため、処理がますます遅くなっていきます。
このパフォーマンス上の問題を解消するために、カラム `keywords` に対してテキスト索引を定義します。

```sql
ALTER TABLE posts ADD INDEX keywords_idx(keywords) TYPE text(tokenizer = splitByNonAlpha);
ALTER TABLE posts MATERIALIZE INDEX keywords_idx; -- Don't forget to rebuild the index for existing data
```


#### Map カラムのインデックス作成 \{#text-index-example-map\}

多くのオブザーバビリティのユースケースでは、ログメッセージは「コンポーネント」に分割され、タイムスタンプには日時型、ログレベルには enum 型など、適切なデータ型として保存されます。
メトリクスフィールドは、キーと値のペアとして保存するのが最適です。
運用チームは、デバッグ、セキュリティインシデント、監視のために、ログを効率的に検索する必要があります。

次のような logs テーブルを考えてみます:

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

テキストインデックスがない場合、[Map](/sql-reference/data-types/map.md) データの検索にはテーブル全体のフルスキャンが必要になります。

```sql
-- Finds all logs with rate limiting data:
SELECT count() FROM logs WHERE has(mapKeys(attributes), 'rate_limit'); -- slow full-table scan

-- Finds all logs from a specific IP:
SELECT count() FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- slow full-table scan
```

ログ量が増えるにつれて、これらのクエリは遅くなります。

解決策は、[Map](/sql-reference/data-types/map.md) のキーおよび値に対してテキスト索引を作成することです。
フィールド名や属性タイプでログを検索したい場合は、[mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapKeys) を使用してテキスト索引を作成します。

```sql
ALTER TABLE logs ADD INDEX attributes_keys_idx mapKeys(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_keys_idx;
```

属性の実際の内容を検索する必要がある場合は、[mapValues](/sql-reference/functions/tuple-map-functions.md/#mapValues) を使用してテキスト索引を作成します。

```sql
ALTER TABLE logs ADD INDEX attributes_vals_idx mapValues(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_vals_idx;
```

クエリ例:

```sql
-- Find all rate-limited requests:
SELECT * FROM logs WHERE mapContainsKey(attributes, 'rate_limit'); -- fast

-- Finds all logs from a specific IP:
SELECT * FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- fast

-- Finds all logs where any attribute includes an error:
SELECT * FROM logs WHERE mapContainsValueLike(attributes, '% error %'); -- fast
```


## パフォーマンスチューニング \{#performance-tuning\}

### ダイレクトリード \{#direct-read\}

特定の種類のテキストクエリは、「ダイレクトリード」と呼ばれる最適化によって大幅に高速化されます。

例：

```sql
SELECT column_a, column_b, ...
FROM [...]
WHERE string_search_function(column_with_text_index)
```

ClickHouse における direct read 最適化は、基盤となるテキストカラムにアクセスせず、テキスト索引（つまりテキスト索引ルックアップ）だけを用いてクエリに応答します。
テキスト索引ルックアップは比較的少量のデータしか読み込まないため、通常の ClickHouse のスキップ索引（スキップ索引のルックアップの後に、残りのグラニュールの読み込みとフィルタリングを行う）よりもはるかに高速です。

Direct read は次の 2 つの設定で制御されます。

* Setting [query&#95;plan&#95;direct&#95;read&#95;from&#95;text&#95;index](../../../operations/settings/settings#query_plan_direct_read_from_text_index)（デフォルトで true）。direct read を全般的に有効にするかどうかを指定します。
* Setting [use&#95;skip&#95;indexes&#95;on&#95;data&#95;read](../../../operations/settings/settings#use_skip_indexes_on_data_read)。direct read のもう一つの前提条件です。ClickHouse バージョン &gt;= 26.1 では、この設定はデフォルトで有効です。以前のバージョンでは、明示的に `SET use_skip_indexes_on_data_read = 1` を実行する必要があります。

また、direct read を使用するには、テキスト索引が完全にマテリアライズされている必要があります（そのためには `ALTER TABLE ... MATERIALIZE INDEX` を使用します）。

**サポートされる関数**

Direct read 最適化は、関数 `hasToken`、`hasAllTokens`、および `hasAnyTokens` をサポートします。
テキスト索引が `array` tokenizer で定義されている場合、関数 `equals`、`has`、`mapContainsKey`、`mapContainsValue` に対しても direct read がサポートされます。
これらの関数は、`AND`、`OR`、`NOT` 演算子で組み合わせることもできます。
`WHERE` または `PREWHERE` 句には、（テキストカラムまたは他のカラムに対する）追加の非テキスト検索関数によるフィルタを含めることもできます。この場合でも direct read 最適化は使用されますが、その効果は低くなります（サポートされているテキスト検索関数にのみ適用されるためです）。

あるクエリが direct read を利用しているかを確認するには、そのクエリを `EXPLAIN PLAN actions = 1` 付きで実行します。
例として、direct read を無効にしたクエリは

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

一方、同じクエリを `query_plan_direct_read_from_text_index = 1` の設定で実行すると

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

2つ目の EXPLAIN PLAN の出力には、仮想カラム `__text_index_<index_name>_<function_name>_<id>` が含まれます。
このカラムが存在する場合は、direct read が使用されています。

WHERE 句のフィルタがテキスト検索関数のみで構成されている場合、クエリはカラムデータの読み取り自体を完全に回避でき、direct read によって最大のパフォーマンス向上が得られます。
ただし、クエリ内の他の箇所でテキストカラムにアクセスしている場合でも、direct read により依然としてパフォーマンス改善が見込めます。

**ヒントとしての direct read**

ヒントとしての direct read は、通常の direct read と同じ原理に基づきますが、基礎となるテキストカラムは削除せずに、テキストインデックスのデータから構築された追加フィルタを適用する点が異なります。
これは、テキストインデックスのみを読んだ場合に誤検出（false positive）が発生しうる関数に対して使用されます。

サポートされている関数は、`like`、`startsWith`、`endsWith`、`equals`、`has`、`mapContainsKey`、`mapContainsValue` です。

この追加フィルタにより、他のフィルタと組み合わせて結果セットをさらに絞り込むための追加の選択性が得られ、他のカラムから読み取るデータ量を削減するのに役立ちます。

ヒントとしての direct read は、[query&#95;plan&#95;text&#95;index&#95;add&#95;hint](../../../operations/settings/settings#query_plan_text_index_add_hint)（デフォルトで有効）を設定することで制御できます。

ヒントを使用しないクエリの例:


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

一方、同じクエリを `query_plan_text_index_add_hint = 1` を有効にして実行した場合は

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

2つ目の EXPLAIN PLAN の出力では、フィルター条件に追加の連言条件（`__text_index_...`）が加えられていることが分かります。
[PREWHERE](docs/sql-reference/statements/select/prewhere) 最適化により、フィルター条件は3つの個別の連言条件に分解され、計算コストが低いものから順に適用されます。
このクエリでは、適用順序は `__text_index_...`、次に `greaterOrEquals(...)`、最後に `like(...)` となります。
この順序付けにより、テキスト索引と元のフィルター条件でスキップされるグラニュールに加えて、クエリの `WHERE` 句以降で使用される重いカラムを読み込む前に、さらに多くのデータグラニュールをスキップできるため、読み取るデータ量を一層削減できます。


### キャッシュ \{#caching\}

メモリ内でテキストインデックスの一部をバッファリングするために、さまざまなキャッシュを使用できます（[Implementation Details](#implementation) セクションを参照）。
現在、I/O を削減するために、デシリアライズ済みの Dictionary ブロック、テキストインデックスのヘッダー、およびポスティングリスト用のキャッシュが用意されています。
これらは、設定 [use_text_index_dictionary_cache](/operations/settings/settings#use_text_index_dictionary_cache)、[use_text_index_header_cache](/operations/settings/settings#use_text_index_header_cache)、および [use_text_index_postings_cache](/operations/settings/settings#use_text_index_postings_cache) によって有効化できます。
デフォルトでは、すべてのキャッシュは無効になっています。
キャッシュを破棄するには、文 [SYSTEM DROP TEXT INDEX CACHES](../../../sql-reference/statements/system#drop-text-index-caches) を使用します。

キャッシュを構成するには、以下のサーバー設定を参照してください。

#### Dictionary ブロックキャッシュの設定 \{#caching-dictionary\}

| Setting                                                                                                                                                  | Description                                                                                                    |
|----------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| [text_index_dictionary_block_cache_policy](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_policy)                | テキストインデックス用 Dictionary ブロックキャッシュのポリシー名。                                             |
| [text_index_dictionary_block_cache_size](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size)                    | キャッシュの最大サイズ（バイト単位）。                                                                         |
| [text_index_dictionary_block_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_max_entries)      | キャッシュ内のデシリアライズ済み Dictionary ブロックの最大数。                                                 |
| [text_index_dictionary_block_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size_ratio)        | テキストインデックス用 Dictionary ブロックキャッシュにおける、キャッシュ全体サイズに対する保護キューサイズの比率。 |

#### ヘッダーキャッシュの設定 \{#caching-header\}

| Setting                                                                                                                              | 説明                                                                                                  |
|--------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| [text_index_header_cache_policy](/operations/server-configuration-parameters/settings#text_index_header_cache_policy)                | テキストインデックスヘッダーキャッシュのポリシー名。                                                  |
| [text_index_header_cache_size](/operations/server-configuration-parameters/settings#text_index_header_cache_size)                    | キャッシュの最大サイズ（バイト単位）。                                                                |
| [text_index_header_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_header_cache_max_entries)      | キャッシュ内に保持されるデシリアライズ済みヘッダーの最大数。                                          |
| [text_index_header_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_header_cache_size_ratio)        | テキストインデックスヘッダーキャッシュにおける、保護キューのサイズがキャッシュ全体のサイズに対して占める割合。 |

#### ポスティングリストキャッシュの設定 \{#caching-posting-lists\}

| Setting                                                                                                                               | 説明                                                                                                    |
|---------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [text_index_postings_cache_policy](/operations/server-configuration-parameters/settings#text_index_postings_cache_policy)             | テキストインデックスのポスティングリストキャッシュポリシー名。                                         |
| [text_index_postings_cache_size](/operations/server-configuration-parameters/settings#text_index_postings_cache_size)                 | キャッシュの最大サイズ（バイト単位）。                                                                  |
| [text_index_postings_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_postings_cache_max_entries)   | キャッシュ内のデシリアライズ済みポスティングの最大数。                                                 |
| [text_index_postings_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_postings_cache_size_ratio)     | テキストインデックスのポスティングリストキャッシュにおける保護キューのサイズが、キャッシュ全体サイズに占める割合。 |

## 実装の詳細 \{#implementation\}

各テキスト索引は、2 つの（抽象的な）データ構造から構成されます:

- 各トークンをポスティングリストにマッピングする dictionary と、
- 各々が行番号の集合を表す複数のポスティングリストの集合。

テキスト索引はパーツ全体に対して構築されます。
他のスキップ索引と異なり、テキスト索引はデータパーツをマージする際に再構築するのではなく、マージすることができます（下記参照）。

索引の作成時には、3 つのファイルが生成されます（パーツごと）:

**Dictionary blocks ファイル (.dct)**

テキスト索引内のトークンはソートされ、各 512 トークンの dictionary ブロックに格納されます（ブロックサイズはパラメータ `dictionary_block_size` によって設定可能です）。
Dictionary blocks ファイル (.dct) は、そのパーツ内のすべての索引グラニュールに含まれる dictionary ブロックから構成されます。

**Index header ファイル (.idx)**

Index header ファイルには、各 dictionary ブロックについて、そのブロックの最初のトークンと dictionary blocks ファイル内での相対オフセットが含まれます。

このスパース索引構造は、ClickHouse の [sparse primary key index](https://clickhouse.com/docs/guides/best-practices/sparse-primary-indexes) と類似しています。

**Postings lists ファイル (.pst)**

すべてのトークンに対するポスティングリストは、postings lists ファイル内に連続して配置されます。
空間を節約しつつ高速な積集合および和集合演算を可能にするため、ポスティングリストは [roaring bitmaps](https://roaringbitmap.org/) として格納されます。
ポスティングリストが `posting_list_block_size` より大きい場合、それは複数のブロックに分割され、postings lists ファイル内に連続して格納されます。

**テキスト索引のマージ**

データパーツがマージされるとき、テキスト索引を最初から再構築する必要はなく、代わりにマージ処理の別ステップで効率的にマージできます。
このステップでは、各入力パーツのテキスト索引のソート済み dictionary が読み込まれ、新しい統合 dictionary に結合されます。
ポスティングリスト内の行番号も、初期マージフェーズ中に作成される旧行番号から新行番号へのマッピングを用いて、マージ後のデータパーツ内での新しい位置を反映するよう再計算されます。
このテキスト索引のマージ方式は、`_part_offset` カラムを持つ [projections](/docs/sql-reference/statements/alter/projection#normal-projection-with-part-offset-field) がマージされる方法と似ています。
ソースパーツ内で索引がマテリアライズされていない場合、それは構築され、一時ファイルに書き出された後、他のパーツおよび他の一時索引ファイルの索引とともにマージされます。

## 例: Hackernews データセット \{#hacker-news-dataset\}

大量のテキストを含む大規模データセットに対するテキスト索引のパフォーマンス向上を確認します。
人気サイト Hacker News 上のコメント 2,870 万行を使用します。
以下はテキスト索引を定義していないテーブルです:

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

約 2,870 万行のデータは S3 上の Parquet ファイルに格納されています。これらを `hackernews` テーブルに挿入しましょう。

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

`ALTER TABLE` を使用して comment カラムにテキスト索引を追加し、その後マテリアライズします。

```sql
-- Add the index
ALTER TABLE hackernews ADD INDEX comment_idx(comment) TYPE text(tokenizer = splitByNonAlpha);

-- Materialize the index for existing data
ALTER TABLE hackernews MATERIALIZE INDEX comment_idx SETTINGS mutations_sync = 2;
```

では、`hasToken`、`hasAnyTokens`、`hasAllTokens` 関数を使ってクエリを実行してみましょう。
次の例では、標準的な索引スキャンと直接読み取り最適化を比較した際の、劇的なパフォーマンス差を示します。


### 1. `hasToken` の使用 \{#using-hasToken\}

`hasToken` は、テキストに特定の 1 つのトークンが含まれているかどうかを確認します。
ここでは大文字小文字を区別してトークン &#39;ClickHouse&#39; を検索します。

**ダイレクトリード無効化（標準スキャン）**
デフォルトでは、ClickHouse はスキップ索引を使ってグラニュールをフィルタリングし、その後それらのグラニュールのカラムデータを読み取ります。
この挙動は、ダイレクトリードを無効にすることで再現できます。

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

**ダイレクトリード有効時（Fast index read）**
ここでは、ダイレクトリードを有効にした状態（デフォルト）で、同じクエリを実行します。

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

ダイレクトリードクエリは 45 倍以上高速で (0.362 秒 対 0.008 秒)、インデックスだけを読み取ることで処理するデータ量も大幅に削減されます (9.51 GB 対 3.15 MB)。


### 2. `hasAnyTokens` を使用する \{#using-hasAnyTokens\}

`hasAnyTokens` は、テキストに指定したトークンのうち少なくとも 1 つが含まれているかどうかを判定します。
ここでは、&#39;love&#39; または &#39;ClickHouse&#39; のいずれかを含むコメントを検索します。

**Direct read 無効（標準スキャン）**

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

**ダイレクトリードの有効化（索引の高速読み取り）**

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

この一般的な「OR」検索では、高速化の度合いはさらに顕著です。
フルカラムスキャンを回避することで、クエリはほぼ89倍高速になります（1.329秒 vs 0.015秒）。


### 3. `hasAllTokens` の使用 \{#using-hasAllTokens\}

`hasAllTokens` は、テキストが指定されたトークンをすべて含んでいるかどうかをチェックします。
ここでは、`love` と `ClickHouse` の両方を含むコメントを検索します。

**ダイレクトリード無効（標準スキャン）**
ダイレクトリードを無効化していても、標準のスキップ索引は引き続き機能します。
28.7M 行をわずか 147.46K 行まで絞り込みますが、それでもカラムから 57.03 MB を読み取る必要があります。

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
ダイレクトリードでは索引データ上で処理を行うことでクエリに応答し、147.46 KB 分のデータしか読み取りません。

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

この「AND」条件の検索では、ダイレクトリード最適化のほうが標準的なスキップ索引スキャンよりも 26 倍以上高速（0.184s 対 0.007s）です。


### 4. 複合検索: OR、AND、NOT、... \{#compound-search\}

ダイレクトリードの最適化は、複合ブール式にも適用されます。
ここでは、「ClickHouse」または「clickhouse」を対象に、大文字と小文字を区別しない検索を行います。

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

**ダイレクトリードを有効化（索引の高速読み取り）**

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

索引からの結果を組み合わせることで、直接読み出しクエリは 34 倍高速（0.450s 対 0.013s）になり、9.58 GB のカラムデータを読み取る必要がなくなります。
このケースでは、`hasAnyTokens(comment, ['ClickHouse', 'clickhouse'])` が、より効率的で推奨される構文となります。


## 関連情報 \{#related-content\}

- ブログ: [Introducing Inverted Indices in ClickHouse](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
- ブログ: [Inside ClickHouse full-text search: fast, native, and columnar](https://clickhouse.com/blog/clickhouse-full-text-search)
- 動画: [Full-Text Indices: Design and Experiments](https://www.youtube.com/watch?v=O_MnyUkrIq8)