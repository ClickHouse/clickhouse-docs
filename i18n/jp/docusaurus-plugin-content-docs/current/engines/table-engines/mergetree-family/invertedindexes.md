---
description: 'テキスト内の検索語句を高速に特定します。'
keywords: ['全文検索', 'テキストインデックス', 'インデックス', 'インデックス（複数形）']
sidebar_label: 'テキストインデックスを使用した全文検索'
slug: /engines/table-engines/mergetree-family/invertedindexes
title: 'テキストインデックスを使用した全文検索'
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# テキストインデックスを使用した全文検索

<PrivatePreviewBadge/>

ClickHouse のテキストインデックス（["逆インデックス"](https://en.wikipedia.org/wiki/Inverted_index)とも呼ばれます）は、文字列データに対して高速な全文検索機能を提供します。
インデックスは、列内の各トークンを、そのトークンを含む行にひも付けます。
トークンは、トークン化と呼ばれる処理によって生成されます。
たとえば、ClickHouse は英語の文「All cat like mice.」をデフォルトで ["All", "cat", "like", "mice"] のようにトークン化します（末尾のドットは無視される点に注意してください）。
ログデータ向けなど、より高度なトークナイザーも利用できます。



## テキストインデックスの作成 {#creating-a-text-index}

テキストインデックスを作成するには、まず対応する実験的設定を有効にします:

```sql
SET allow_experimental_full_text_index = true;
```

テキストインデックスは、[String](/sql-reference/data-types/string.md)、[FixedString](/sql-reference/data-types/fixedstring.md)、[Array(String)](/sql-reference/data-types/array.md)、[Array(FixedString)](/sql-reference/data-types/array.md)、および[Map](/sql-reference/data-types/map.md)（[mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys)と[mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues)マップ関数経由）カラムに対して、以下の構文を使用して定義できます:

```sql
CREATE TABLE tab
(
    `key` UInt64,
    `str` String,
    INDEX text_idx(str) TYPE text(
                                -- 必須パラメータ:
                                tokenizer = splitByNonAlpha
                                            | splitByString[(S)]
                                            | ngrams[(N)]
                                            | sparseGrams[(min_length[, max_length[, min_cutoff_length]])]
                                            | array
                                -- オプションパラメータ:
                                [, preprocessor = expression(str)]
                                -- オプション詳細パラメータ:
                                [, dictionary_block_size = D]
                                [, dictionary_block_frontcoding_compression = B]
                                [, max_cardinality_for_embedded_postings = M]
                                [, bloom_filter_false_positive_rate = R]
                            ) [GRANULARITY 64]
)
ENGINE = MergeTree
ORDER BY key
```

**トークナイザー引数（必須）**。`tokenizer`引数はトークナイザーを指定します:

- `splitByNonAlpha`は、英数字以外のASCII文字で文字列を分割します（関数[splitByNonAlpha](/sql-reference/functions/splitting-merging-functions.md/#splitByNonAlpha)も参照してください）。
- `splitByString(S)`は、ユーザー定義の区切り文字列`S`で文字列を分割します（関数[splitByString](/sql-reference/functions/splitting-merging-functions.md/#splitByString)も参照してください）。
  区切り文字は、オプションパラメータを使用して指定できます。例えば、`tokenizer = splitByString([', ', '; ', '\n', '\\'])`のようにします。
  各文字列は複数の文字で構成できることに注意してください（例では`', '`）。
  明示的に指定されていない場合（例えば、`tokenizer = splitByString`）、デフォルトの区切り文字リストは単一の空白文字`[' ']`です。
- `ngrams(N)`は、文字列を等しいサイズの`N`グラムに分割します（関数[ngrams](/sql-reference/functions/splitting-merging-functions.md/#ngrams)も参照してください）。
  nグラムの長さは、2から8の間のオプション整数パラメータを使用して指定できます。例えば、`tokenizer = ngrams(3)`のようにします。
  明示的に指定されていない場合（例えば、`tokenizer = ngrams`）、デフォルトのnグラムサイズは3です。
- `sparseGrams(min_length, max_length, min_cutoff_length)`は、文字列を最小`min_length`文字、最大`max_length`文字（両端を含む）の可変長nグラムに分割します（関数[sparseGrams](/sql-reference/functions/string-functions#sparseGrams)も参照してください）。
  明示的に指定されていない場合、`min_length`と`max_length`のデフォルト値はそれぞれ3と100です。
  パラメータ`min_cutoff_length`が指定されている場合、長さが`min_cutoff_length`以上のnグラムのみがインデックスに格納されます。
  `ngrams(N)`と比較して、`sparseGrams`トークナイザーは可変長Nグラムを生成し、元のテキストのより柔軟な表現を可能にします。
  例えば、`tokenizer = sparseGrams(3, 5, 4)`は、入力文字列から内部的に3グラム、4グラム、5グラムを生成しますが、インデックスには4グラムと5グラムのみが格納されます。
- `array`はトークン化を行いません。つまり、各行の値がトークンとなります（関数[array](/sql-reference/functions/array-functions.md/#array)も参照してください）。

:::note
`splitByString`トークナイザーは、分割区切り文字を左から右に適用します。
これにより曖昧さが生じる可能性があります。
例えば、区切り文字列`['%21', '%']`は`%21abc`を`['abc']`としてトークン化しますが、両方の区切り文字列を`['%', '%21']`に入れ替えると`['21abc']`が出力されます。
ほとんどの場合、マッチングでは長い区切り文字を優先することが望ましいです。
これは一般的に、区切り文字列を長さの降順で渡すことで実現できます。
区切り文字列が[接頭符号](https://en.wikipedia.org/wiki/Prefix_code)を形成する場合、任意の順序で渡すことができます。
:::


:::warning
現時点では、中国語などの非西洋言語のテキストに対してテキストインデックスを構築することは推奨されません。
現在サポートされているトークナイザーでは、インデックスサイズが非常に大きくなり、クエリ時間が長くなる可能性があります。
将来的には、これらのケースをより適切に処理する言語固有の専用トークナイザーを追加する予定です。
:::

トークナイザーが入力文字列をどのように分割するかをテストするには、ClickHouseの[tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens)関数を使用できます:

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

1. 大文字小文字を区別しないマッチングを可能にするための小文字化または大文字化、例えば[lower](/sql-reference/functions/string-functions.md/#lower)、[lowerUTF8](/sql-reference/functions/string-functions.md/#lowerUTF8)など。以下の最初の例を参照してください。
2. UTF-8正規化、例えば[normalizeUTF8NFC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFC)、[normalizeUTF8NFD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFD)、[normalizeUTF8NFKC](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKC)、[normalizeUTF8NFKD](/sql-reference/functions/string-functions.md/#normalizeUTF8NFKD)、[toValidUTF8](/sql-reference/functions/string-functions.md/#toValidUTF8)。
3. 不要な文字または部分文字列の削除または変換、例えば[extractTextFromHTML](/sql-reference/functions/string-functions.md/#extractTextFromHTML)、[substring](/sql-reference/functions/string-functions.md/#substring)、[idnaEncode](/sql-reference/functions/string-functions.md/#idnaEncode)。

プリプロセッサ式は、[String](/sql-reference/data-types/string.md)型または[FixedString](/sql-reference/data-types/fixedstring.md)型の入力値を同じ型の値に変換する必要があります。

例:

- `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(col))`
- `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = substringIndex(col, '\n', 1))`
- `INDEX idx(col) TYPE text(tokenizer = 'splitByNonAlpha', preprocessor = lower(extractTextFromHTML(col))`

また、プリプロセッサ式は、テキストインデックスが定義されている列のみを参照する必要があります。
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

は次と等価です:

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
ただし、他のスキップインデックスとは異なり、テキストインデックスはデフォルトのインデックスGRANULARITYが64です。
この値は経験的に選択されており、ほとんどの使用例において速度とインデックスサイズの間で適切なトレードオフを提供します。
上級ユーザーは異なるインデックス粒度を指定できます(ただし、これは推奨しません)。

<details markdown="1">

<summary>オプションの高度なパラメータ</summary>

以下の高度なパラメータのデフォルト値は、ほぼすべての状況で適切に機能します。
これらを変更することは推奨しません。

オプションパラメータ`dictionary_block_size`(デフォルト: 128)は、辞書ブロックのサイズを行数で指定します。

オプションパラメータ`dictionary_block_frontcoding_compression`(デフォルト: 1)は、辞書ブロックが圧縮としてフロントコーディングを使用するかどうかを指定します。

オプションパラメータ`max_cardinality_for_embedded_postings`(デフォルト: 16)は、ポスティングリストを辞書ブロックに埋め込むべきカーディナリティの閾値を指定します。


オプションパラメータ `bloom_filter_false_positive_rate`（デフォルト: 0.1）は、辞書ブルームフィルタの偽陽性率を指定します。

</details>

テキストインデックスは、テーブル作成後にカラムへ追加または削除できます:

```sql
ALTER TABLE tab DROP INDEX text_idx;
ALTER TABLE tab ADD INDEX text_idx(s) TYPE text(tokenizer = splitByNonAlpha);
```


## テキストインデックスの使用 {#using-a-text-index}

SELECTクエリでテキストインデックスを使用するのは簡単です。一般的な文字列検索関数が自動的にインデックスを活用するためです。
インデックスが存在しない場合、以下の文字列検索関数は低速な全件スキャンにフォールバックします。

### サポートされている関数 {#functions-support}

SELECTクエリの`WHERE`句でテキスト関数が使用されている場合、テキストインデックスを利用できます:

```sql
SELECT [...]
FROM [...]
WHERE string_search_function(column_with_text_index)
```

#### `=`と`!=` {#functions-example-equals-notequals}

`=`([equals](/sql-reference/functions/comparison-functions.md/#equals))と`!=`([notEquals](/sql-reference/functions/comparison-functions.md/#notEquals))は、指定された検索語全体に一致します。

例:

```sql
SELECT * from tab WHERE str = 'Hello';
```

テキストインデックスは`=`と`!=`をサポートしていますが、等価性と不等価性の検索は`array`トークナイザーでのみ有効です(インデックスが行全体の値を格納するため)。

#### `IN`と`NOT IN` {#functions-example-in-notin}

`IN`([in](/sql-reference/functions/in-functions))と`NOT IN`([notIn](/sql-reference/functions/in-functions))は、`equals`と`notEquals`関数に似ていますが、検索語のすべて(`IN`)またはいずれも一致しない(`NOT IN`)場合に一致します。

例:

```sql
SELECT * from tab WHERE str IN ('Hello', 'World');
```

`=`と`!=`と同じ制限が適用されます。つまり、`IN`と`NOT IN`は`array`トークナイザーと組み合わせた場合にのみ有効です。

#### `LIKE`、`NOT LIKE`、`match` {#functions-example-like-notlike-match}

:::note
これらの関数は、インデックストークナイザーが`splitByNonAlpha`または`ngrams`のいずれかである場合にのみ、フィルタリングにテキストインデックスを使用します。
:::

テキストインデックスで`LIKE`([like](/sql-reference/functions/string-search-functions.md/#like))、`NOT LIKE`([notLike](/sql-reference/functions/string-search-functions.md/#notLike))、および[match](/sql-reference/functions/string-search-functions.md/#match)関数を使用するには、ClickHouseが検索語から完全なトークンを抽出できる必要があります。

例:

```sql
SELECT count() FROM tab WHERE comment LIKE 'support%';
```

この例の`support`は、`support`、`supports`、`supporting`などに一致する可能性があります。
この種のクエリは部分文字列クエリであり、テキストインデックスによって高速化することはできません。

LIKEクエリでテキストインデックスを活用するには、LIKEパターンを次のように書き換える必要があります:

```sql
SELECT count() FROM tab WHERE comment LIKE ' support %'; -- or `% support %`
```

`support`の左右のスペースにより、この語がトークンとして抽出できることが保証されます。

#### `startsWith`と`endsWith` {#functions-example-startswith-endswith}

`LIKE`と同様に、[startsWith](/sql-reference/functions/string-functions.md/#startsWith)と[endsWith](/sql-reference/functions/string-functions.md/#endsWith)関数は、検索語から完全なトークンを抽出できる場合にのみテキストインデックスを使用できます。

例:

```sql
SELECT count() FROM tab WHERE startsWith(comment, 'clickhouse support');
```

この例では、`clickhouse`のみがトークンとみなされます。
`support`は、`support`、`supports`、`supporting`などに一致する可能性があるため、トークンではありません。

`clickhouse supports`で始まるすべての行を見つけるには、検索パターンの末尾にスペースを追加してください:

```sql
startsWith(comment, 'clickhouse supports ')`
```

同様に、`endsWith`は先頭にスペースを付けて使用する必要があります:

```sql
SELECT count() FROM tab WHERE endsWith(comment, ' olap engine');
```

#### `hasToken`と`hasTokenOrNull` {#functions-example-hastoken-hastokenornull}

[hasToken](/sql-reference/functions/string-search-functions.md/#hasToken)と[hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull)関数は、指定された単一のトークンに対して一致します。

前述の関数とは異なり、これらの関数は検索語をトークン化しません(入力が単一のトークンであると仮定します)。

例:

```sql
SELECT count() FROM tab WHERE hasToken(comment, 'clickhouse');
```

`hasToken`と`hasTokenOrNull`関数は、`text`インデックスで使用する最もパフォーマンスの高い関数です。

#### `hasAnyTokens`と`hasAllTokens` {#functions-example-hasanytokens-hasalltokens}


関数 [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens) および [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens) は、指定されたトークンの1つまたはすべてに対してマッチングを行います。

これら2つの関数は、検索トークンをインデックスカラムに使用されるのと同じトークナイザーでトークン化される文字列として、または検索前にトークン化が適用されない処理済みトークンの配列として受け取ります。
詳細については関数のドキュメントを参照してください。

例:

```sql
-- 文字列引数として渡された検索トークン
SELECT count() FROM tab WHERE hasAnyTokens(comment, 'clickhouse olap');
SELECT count() FROM tab WHERE hasAllTokens(comment, 'clickhouse olap');

-- Array(String)として渡された検索トークン
SELECT count() FROM tab WHERE hasAnyTokens(comment, ['clickhouse', 'olap']);
SELECT count() FROM tab WHERE hasAllTokens(comment, ['clickhouse', 'olap']);
```

#### `has` {#functions-example-has}

配列関数 [has](/sql-reference/functions/array-functions#has) は、文字列配列内の単一のトークンに対してマッチングを行います。

例:

```sql
SELECT count() FROM tab WHERE has(array, 'clickhouse');
```

#### `mapContains` {#functions-example-mapcontains}

関数 [mapContains](/sql-reference/functions/tuple-map-functions#mapcontains) (`mapContainsKey` のエイリアス) は、マップのキー内の単一のトークンに対してマッチングを行います。

例:

```sql
SELECT count() FROM tab WHERE mapContainsKey(map, 'clickhouse');
-- または
SELECT count() FROM tab WHERE mapContains(map, 'clickhouse');
```

#### `operator[]` {#functions-example-access-operator}

アクセス [演算子[]](/sql-reference/operators#access-operators) は、テキストインデックスと組み合わせてキーと値をフィルタリングするために使用できます。

例:

```sql
SELECT count() FROM tab WHERE map['engine'] = 'clickhouse';
```

テキストインデックスで `Array(T)` 型および `Map(K, V)` 型のカラムを使用する例については、以下を参照してください。

### テキストインデックスを使用した `Array` および `Map` カラムの例 {#text-index-array-and-map-examples}

#### Array(String) カラムのインデックス化 {#text-index-example-array}

著者がキーワードを使用してブログ投稿を分類するブログプラットフォームを想像してください。
ユーザーがトピックを検索またはクリックすることで関連コンテンツを発見できるようにしたいと考えています。

次のテーブル定義を考えてみましょう:

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

テキストインデックスがない場合、特定のキーワード(例: `clickhouse`)を含む投稿を見つけるには、すべてのエントリをスキャンする必要があります:

```sql
SELECT count() FROM posts WHERE has(keywords, 'clickhouse'); -- 低速なフルテーブルスキャン - すべての投稿のすべてのキーワードをチェック
```

プラットフォームが成長するにつれて、クエリがすべての行のすべてのキーワード配列を検査する必要があるため、処理速度はますます低下します。
このパフォーマンス問題を解決するために、カラム `keywords` に対してテキストインデックスを定義します:

```sql
ALTER TABLE posts ADD INDEX keywords_idx(keywords) TYPE text(tokenizer = splitByNonAlpha);
ALTER TABLE posts MATERIALIZE INDEX keywords_idx; -- 既存データのインデックスを再構築することを忘れずに
```

#### Mapカラムのインデックス化 {#text-index-example-map}

多くの可観測性のユースケースでは、ログメッセージは「コンポーネント」に分割され、適切なデータ型として保存されます。例えば、タイムスタンプには日時型、ログレベルには列挙型などです。
メトリクスフィールドはキーと値のペアとして保存するのが最適です。
運用チームは、デバッグ、セキュリティインシデント、監視のためにログを効率的に検索する必要があります。

次のログテーブルを考えてみましょう:

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

テキストインデックスがない場合、[Map](/sql-reference/data-types/map.md) データの検索にはフルテーブルスキャンが必要です:

```sql
-- レート制限データを含むすべてのログを検索:
SELECT count() FROM logs WHERE has(mapKeys(attributes), 'rate_limit'); -- 低速なフルテーブルスキャン

-- 特定のIPからのすべてのログを検索:
SELECT count() FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- 低速なフルテーブルスキャン
```

ログ量が増加するにつれて、これらのクエリは遅くなります。

解決策は、[Map](/sql-reference/data-types/map.md) のキーと値に対してテキストインデックスを作成することです。
フィールド名または属性タイプでログを検索する必要がある場合は、[mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) を使用してテキストインデックスを作成します:


```sql
ALTER TABLE logs ADD INDEX attributes_keys_idx mapKeys(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_keys_idx;
```

属性の実際の内容に対して検索を行う必要がある場合は、[mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues) を使用してテキストインデックスを作成します。

```sql
ALTER TABLE logs ADD INDEX attributes_vals_idx mapValues(attributes) TYPE text(tokenizer = array);
ALTER TABLE posts MATERIALIZE INDEX attributes_vals_idx;
```

クエリ例:

```sql
-- レート制限されたすべてのリクエストを検索:
SELECT * FROM logs WHERE mapContainsKey(attributes, 'rate_limit'); -- fast

-- 特定のIPアドレスからのすべてのログを検索:
SELECT * FROM logs WHERE has(mapValues(attributes), '192.168.1.1'); -- fast
```


## パフォーマンスチューニング {#performance-tuning}

### ダイレクトリード {#direct-read}

特定のタイプのテキストクエリは、「ダイレクトリード」と呼ばれる最適化によって大幅に高速化できます。
より具体的には、SELECTクエリがテキストカラムからの射影を行わ_ない_場合に、この最適化を適用できます。

例:

```sql
SELECT column_a, column_b, ... -- column_with_text_indexは含めない
FROM [...]
WHERE string_search_function(column_with_text_index)
```

ClickHouseのダイレクトリード最適化は、基盤となるテキストカラムにアクセスすることなく、テキストインデックス(すなわち、テキストインデックスルックアップ)のみを使用してクエリに応答します。
テキストインデックスルックアップは比較的少量のデータを読み取るため、ClickHouseの通常のスキップインデックス(スキップインデックスルックアップを行い、その後、残存するグラニュールをロードしてフィルタリングする)よりもはるかに高速です。

ダイレクトリードは2つの設定によって制御されます:

- 設定[query_plan_direct_read_from_text_index](../../../operations/settings/settings#query_plan_direct_read_from_text_index)は、ダイレクトリードが一般的に有効かどうかを指定します。
- 設定[use_skip_indexes_on_data_read](../../../operations/settings/settings#use_skip_indexes_on_data_read)は、ダイレクトリードのもう1つの前提条件です。[compatibility](../../../operations/settings/settings#compatibility) < 25.10のClickHouseデータベースでは、`use_skip_indexes_on_data_read`が無効になっているため、互換性設定値を上げるか、明示的に`SET use_skip_indexes_on_data_read = 1`を実行する必要があります。

また、ダイレクトリードを使用するには、テキストインデックスが完全にマテリアライズされている必要があります(そのためには`ALTER TABLE ... MATERIALIZE INDEX`を使用してください)。

**サポートされている関数**
ダイレクトリード最適化は、`hasToken`、`hasAllTokens`、および`hasAnyTokens`関数をサポートしています。
これらの関数は、AND、OR、NOT演算子で組み合わせることもできます。
WHERE句には、テキスト検索関数以外の追加フィルタ(テキストカラムまたは他のカラム用)を含めることもできます。その場合、ダイレクトリード最適化は引き続き使用されますが、効果は低下します(サポートされているテキスト検索関数にのみ適用されます)。

クエリがダイレクトリードを利用しているかどうかを確認するには、`EXPLAIN PLAN actions = 1`を使用してクエリを実行します。
例として、ダイレクトリードが無効なクエリは

```sql
EXPLAIN PLAN actions = 1
SELECT count()
FROM tab
WHERE hasToken(col, 'some_token')
SETTINGS query_plan_direct_read_from_text_index = 0, -- ダイレクトリードを無効化
         use_skip_indexes_on_data_read = 1;
```

次のように返します

```text
[...]
Filter ((WHERE + Change column names to column identifiers))
Filter column: hasToken(__table1.col, 'some_token'_String) (removed)
Actions: INPUT : 0 -> col String : 0
         COLUMN Const(String) -> 'some_token'_String String : 1
         FUNCTION hasToken(col :: 0, 'some_token'_String :: 1) -> hasToken(__table1.col, 'some_token'_String) UInt8 : 2
[...]
```

一方、`query_plan_direct_read_from_text_index = 1`で実行した同じクエリは

```sql
EXPLAIN PLAN actions = 1
SELECT count()
FROM tab
WHERE hasToken(col, 'some_token')
SETTINGS query_plan_direct_read_from_text_index = 1, -- ダイレクトリードを有効化
         use_skip_indexes_on_data_read = 1;
```

次のように返します

```text
[...]
Expression (Before GROUP BY)
Positions:
  Filter
  Filter column: __text_index_idx_hasToken_94cc2a813036b453d84b6fb344a63ad3 (removed)
  Actions: INPUT :: 0 -> __text_index_idx_hasToken_94cc2a813036b453d84b6fb344a63ad3 UInt8 : 0
[...]
```

2番目のEXPLAIN PLAN出力には、仮想カラム`__text_index_<index_name>_<function_name>_<id>`が含まれています。
このカラムが存在する場合、ダイレクトリードが使用されています。

### キャッシング {#caching}

テキストインデックスの一部をメモリにバッファリングするために、さまざまなキャッシュが利用可能です([実装の詳細](#implementation)セクションを参照):
現在、I/Oを削減するために、テキストインデックスのデシリアライズされた辞書ブロック、ヘッダー、およびポスティングリスト用のキャッシュがあります。
これらは、設定[use_text_index_dictionary_cache](/operations/settings/settings#use_text_index_dictionary_cache)、[use_text_index_header_cache](/operations/settings/settings#use_text_index_header_cache)、および[use_text_index_postings_cache](/operations/settings/settings#use_text_index_postings_cache)を介して有効にできます。
デフォルトでは、すべてのキャッシュが無効になっています。

キャッシュを設定するには、以下のサーバー設定を参照してください。

#### 辞書ブロックキャッシュ設定 {#caching-dictionary}


| 設定項目                                                                                                                                            | 説明                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [text_index_dictionary_block_cache_policy](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_policy)           | テキストインデックス辞書ブロックキャッシュのポリシー名。                                                                |
| [text_index_dictionary_block_cache_size](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size)               | キャッシュの最大サイズ（バイト数）。                                                                                  |
| [text_index_dictionary_block_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_max_entries) | キャッシュ内に保持するデシリアライズ済み辞書ブロックの最大数。                                                    |
| [text_index_dictionary_block_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_dictionary_block_cache_size_ratio)   | テキストインデックス辞書ブロックキャッシュにおいて、保護キューがキャッシュ全体に対して占めるサイズの比率。 |

#### ヘッダーキャッシュの設定 {#caching-header}

| 設定項目                                                                                                                        | 説明                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [text_index_header_cache_policy](/operations/server-configuration-parameters/settings#text_index_header_cache_policy)           | テキストインデックスヘッダーキャッシュのポリシー名。                                                                |
| [text_index_header_cache_size](/operations/server-configuration-parameters/settings#text_index_header_cache_size)               | キャッシュの最大サイズ（バイト数）。                                                                        |
| [text_index_header_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_header_cache_max_entries) | キャッシュ内に保持するデシリアライズ済みヘッダーの最大数。                                                    |
| [text_index_header_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_header_cache_size_ratio)   | テキストインデックスヘッダーキャッシュにおいて、保護キューがキャッシュ全体に対して占めるサイズの比率。 |

#### ポスティングリストキャッシュの設定 {#caching-posting-lists}

| 設定項目                                                                                                                            | 説明                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [text_index_postings_cache_policy](/operations/server-configuration-parameters/settings#text_index_postings_cache_policy)           | テキストインデックスのポスティングキャッシュのポリシー名。                                                                |
| [text_index_postings_cache_size](/operations/server-configuration-parameters/settings#text_index_postings_cache_size)               | キャッシュの最大サイズ（バイト数）。                                                                          |
| [text_index_postings_cache_max_entries](/operations/server-configuration-parameters/settings#text_index_postings_cache_max_entries) | キャッシュ内に保持するデシリアライズ済みポスティングの最大数。                                                     |
| [text_index_postings_cache_size_ratio](/operations/server-configuration-parameters/settings#text_index_postings_cache_size_ratio)   | テキストインデックスのポスティングキャッシュにおいて、保護キューがキャッシュ全体に対して占めるサイズの比率。 |


## 実装の詳細 {#implementation}

各テキストインデックスは、2つの(抽象的な)データ構造で構成されています:

- 各トークンをポスティングリストにマッピングする辞書
- 行番号の集合をそれぞれ表すポスティングリストの集合

テキストインデックスはスキップインデックスであるため、これらのデータ構造はインデックスグラニュールごとに論理的に存在します。

インデックス作成時には、3つのファイルが(パートごとに)作成されます:

**辞書ブロックファイル (.dct)**

インデックスグラニュール内のトークンはソートされ、それぞれ128トークンの辞書ブロックに格納されます(ブロックサイズは`dictionary_block_size`パラメータで設定可能です)。
辞書ブロックファイル(.dct)は、パート内のすべてのインデックスグラニュールのすべての辞書ブロックで構成されます。

**インデックスグラニュールファイル (.idx)**

インデックスグラニュールファイルには、各辞書ブロックについて、ブロックの最初のトークン、辞書ブロックファイル内の相対オフセット、およびブロック内のすべてのトークンに対するブルームフィルタが含まれています。
このスパースインデックス構造は、ClickHouseの[スパースプライマリキーインデックス](https://clickhouse.com/docs/guides/best-practices/sparse-primary-indexes)に類似しています。
ブルームフィルタにより、検索対象のトークンが辞書ブロックに含まれていない場合、辞書ブロックを早期にスキップすることができます。

**ポスティングリストファイル (.pst)**

すべてのトークンのポスティングリストは、ポスティングリストファイル内に順次配置されます。
高速な積集合および和集合演算を可能にしながら容量を節約するため、ポスティングリストは[roaring bitmaps](https://roaringbitmap.org/)として格納されます。
ポスティングリストのカーディナリティが16未満の場合(`max_cardinality_for_embedded_postings`パラメータで設定可能)、辞書に埋め込まれます。


## 例: Hackernewsデータセット {#hacker-news-dataset}

大量のテキストを含む大規模データセットにおけるテキストインデックスのパフォーマンス向上を見ていきましょう。
人気のHacker Newsウェブサイトの2870万行のコメントを使用します。
以下はテキストインデックスなしのテーブルです:

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

2870万行のデータはS3上のParquetファイルに格納されています。これらを`hackernews`テーブルに挿入しましょう:

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

`ALTER TABLE`を使用してcommentカラムにテキストインデックスを追加し、それをマテリアライズします:

```sql
-- インデックスを追加
ALTER TABLE hackernews ADD INDEX comment_idx(comment) TYPE text(tokenizer = splitByNonAlpha);

-- 既存データに対してインデックスをマテリアライズ
ALTER TABLE hackernews MATERIALIZE INDEX comment_idx SETTINGS mutations_sync = 2;
```

それでは、`hasToken`、`hasAnyTokens`、`hasAllTokens`関数を使用してクエリを実行しましょう。
以下の例では、標準的なインデックススキャンと直接読み取り最適化の間の劇的なパフォーマンス差を示します。

### 1. `hasToken`の使用 {#using-hasToken}

`hasToken`は、テキストに特定の単一トークンが含まれているかをチェックします。
大文字小文字を区別するトークン'ClickHouse'を検索します。

**直接読み取り無効(標準スキャン)**
デフォルトでは、ClickHouseはスキップインデックスを使用してグラニュールをフィルタリングし、それらのグラニュールのカラムデータを読み取ります。
直接読み取りを無効にすることで、この動作をシミュレートできます。

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│     516 │
└─────────┘

1行が返されました。経過時間: 0.362秒。処理行数: 2490万行、9.51 GB
```

**直接読み取り有効(高速インデックス読み取り)**
次に、直接読み取りを有効にして(デフォルト)同じクエリを実行します。

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│     516 │
└─────────┘

1行が返されました。経過時間: 0.008秒。処理行数: 315万行、3.15 MB
```

直接読み取りクエリは45倍以上高速(0.362秒 対 0.008秒)であり、インデックスのみから読み取ることで処理するデータ量が大幅に削減されます(9.51 GB 対 3.15 MB)。

### 2. `hasAnyTokens`の使用 {#using-hasAnyTokens}

`hasAnyTokens`は、テキストに指定されたトークンのうち少なくとも1つが含まれているかをチェックします。
'love'または'ClickHouse'のいずれかを含むコメントを検索します。

**直接読み取り無効(標準スキャン)**

```sql
SELECT count()
FROM hackernews
WHERE hasAnyTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│  408426 │
└─────────┘

1行が返されました。経過時間: 1.329秒。処理行数: 2874万行、9.72 GB
```

**直接読み取り有効(高速インデックス読み取り)**

```sql
SELECT count()
FROM hackernews
WHERE hasAnyTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│  408426 │
└─────────┘

```


1行を返しました。経過時間: 0.015秒。処理行数: 2799万行、27.99 MB

````
この一般的な「OR」検索では、高速化がさらに顕著になります。
フルカラムスキャンを回避することで、クエリは約89倍高速化されます(1.329秒 vs 0.015秒)。

### 3. `hasAllTokens`の使用 {#using-hasAllTokens}

`hasAllTokens`は、テキストに指定されたすべてのトークンが含まれているかをチェックします。
ここでは、'love'と'ClickHouse'の両方を含むコメントを検索します。

**ダイレクトリード無効(標準スキャン)**
ダイレクトリードが無効な場合でも、標準のスキップインデックスは依然として有効です。
2870万行を147.46K行にフィルタリングしますが、それでもカラムから57.03 MBを読み取る必要があります。

```sql
SELECT count()
FROM hackernews
WHERE hasAllTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│      11 │
└─────────┘

1行を返しました。経過時間: 0.184秒。処理行数: 147.46千行、57.03 MB
````

**ダイレクトリード有効(高速インデックス読み取り)**
ダイレクトリードは、インデックスデータを操作することでクエリに応答し、147.46 KBのみを読み取ります。

```sql
SELECT count()
FROM hackernews
WHERE hasAllTokens(comment, 'love ClickHouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│      11 │
└─────────┘

1行を返しました。経過時間: 0.007秒。処理行数: 147.46千行、147.46 KB
```

この「AND」検索では、ダイレクトリード最適化は標準のスキップインデックススキャンよりも26倍以上高速です(0.184秒 vs 0.007秒)。

### 4. 複合検索: OR、AND、NOT、... {#compound-search}

ダイレクトリード最適化は、複合ブール式にも適用されます。
ここでは、'ClickHouse'または'clickhouse'の大文字小文字を区別しない検索を実行します。

**ダイレクトリード無効(標準スキャン)**

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse') OR hasToken(comment, 'clickhouse')
SETTINGS query_plan_direct_read_from_text_index = 0, use_skip_indexes_on_data_read = 0;

┌─count()─┐
│     769 │
└─────────┘

1行を返しました。経過時間: 0.450秒。処理行数: 2587万行、9.58 GB
```

**ダイレクトリード有効(高速インデックス読み取り)**

```sql
SELECT count()
FROM hackernews
WHERE hasToken(comment, 'ClickHouse') OR hasToken(comment, 'clickhouse')
SETTINGS query_plan_direct_read_from_text_index = 1, use_skip_indexes_on_data_read = 1;

┌─count()─┐
│     769 │
└─────────┘

1行を返しました。経過時間: 0.013秒。処理行数: 2587万行、51.73 MB
```

インデックスからの結果を組み合わせることで、ダイレクトリードクエリは34倍高速化され(0.450秒 vs 0.013秒)、9.58 GBのカラムデータの読み取りを回避します。
この特定のケースでは、`hasAnyTokens(comment, ['ClickHouse', 'clickhouse'])`がより効率的な推奨構文となります。


## 関連コンテンツ {#related-content}

- ブログ:[ClickHouseにおける転置インデックスの導入](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
- ブログ:[ClickHouseの全文検索の内部:高速、ネイティブ、カラムナー](https://clickhouse.com/blog/clickhouse-full-text-search)
- 動画:[全文インデックス:設計と実験](https://www.youtube.com/watch?v=O_MnyUkrIq8)
