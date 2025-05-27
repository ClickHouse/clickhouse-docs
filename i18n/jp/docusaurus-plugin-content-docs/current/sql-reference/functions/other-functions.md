---
'description': 'Documentation for Other Functions'
'sidebar_label': 'Other'
'sidebar_position': 140
'slug': '/sql-reference/functions/other-functions'
'title': 'Other Functions'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';



# その他の関数
## hostName {#hostname}

この関数が実行されたホストの名前を返します。関数がリモートサーバーで実行されている場合（分散処理）、リモートサーバーの名前が返されます。
関数が分散テーブルのコンテキストで実行されると、各シャードに関連する値を持つ通常のカラムが生成されます。それ以外の場合は、定数値が生成されます。

**構文**

```sql
hostName()
```

**戻り値**

- ホスト名。 [String](../data-types/string.md)。
## getMacro {#getMacro}

サーバー構成の [macros](../../operations/server-configuration-parameters/settings.md#macros) セクションから名前付き値を返します。

**構文**

```sql
getMacro(name);
```

**引数**

- `name` — `<macros>` セクションから取得するマクロ名。 [String](/sql-reference/data-types/string).

**戻り値**

- 指定されたマクロの値。 [String](../data-types/string.md).

**例**

サーバー設定ファイルの `<macros>` セクションの例:

```xml
<macros>
    <test>Value</test>
</macros>
```

クエリ:

```sql
SELECT getMacro('test');
```

結果:

```text
┌─getMacro('test')─┐
│ Value            │
└──────────────────┘
```

同じ値は次のように取得できます:

```sql
SELECT * FROM system.macros
WHERE macro = 'test';
```

```text
┌─macro─┬─substitution─┐
│ test  │ Value        │
└───────┴──────────────┘
```
## fqdn {#fqdn}

ClickHouseサーバーの完全修飾ドメイン名を返します。

**構文**

```sql
fqdn();
```

エイリアス: `fullHostName`, `FQDN`.

**戻り値**

- 完全修飾ドメイン名の文字列。 [String](../data-types/string.md).

**例**

```sql
SELECT FQDN();
```

結果:

```text
┌─FQDN()──────────────────────────┐
│ clickhouse.ru-central1.internal │
└─────────────────────────────────┘
```
## basename {#basename}

文字列の末尾をその最後のスラッシュまたはバックスラッシュに従って抽出します。この関数は、パスからファイル名を抽出するためによく使用されます。

```sql
basename(expr)
```

**引数**

- `expr` — [String](../data-types/string.md) 型の値。バックスラッシュはエスケープする必要があります。

**戻り値**

以下を含む文字列:

- 最後のスラッシュまたはバックスラッシュの後の入力文字列の末尾。入力文字列がスラッシュまたはバックスラッシュで終わる場合（例: `/` または `c:\`）、関数は空の文字列を返します。
- スラッシュまたはバックスラッシュがない場合は、元の文字列。

**例**

クエリ:

```sql
SELECT 'some/long/path/to/file' AS a, basename(a)
```

結果:

```text
┌─a──────────────────────┬─basename('some\\long\\path\\to\\file')─┐
│ some\long\path\to\file │ file                                   │
└────────────────────────┴────────────────────────────────────────┘
```

クエリ:

```sql
SELECT 'some\\long\\path\\to\\file' AS a, basename(a)
```

結果:

```text
┌─a──────────────────────┬─basename('some\\long\\path\\to\\file')─┐
│ some\long\path\to\file │ file                                   │
└────────────────────────┴────────────────────────────────────────┘
```

クエリ:

```sql
SELECT 'some-file-name' AS a, basename(a)
```

結果:

```text
┌─a──────────────┬─basename('some-file-name')─┐
│ some-file-name │ some-file-name             │
└────────────────┴────────────────────────────┘
```
## visibleWidth {#visiblewidth}

値をテキスト形式（タブ区切り）でコンソールに出力する際のおおよその幅を計算します。
この関数は、システムによって [Pretty formats](../../interfaces/formats.md)を実装するために使用されます。

`NULL`は `Pretty`フォーマットの `NULL` に相当する文字列として表されます。

**構文**

```sql
visibleWidth(x)
```

**例**

クエリ:

```sql
SELECT visibleWidth(NULL)
```

結果:

```text
┌─visibleWidth(NULL)─┐
│                  4 │
└────────────────────┘
```
## toTypeName {#totypename}

渡された引数の型名を返します。

`NULL`が渡された場合、関数は `Nullable(Nothing)` 型を返します。これは、ClickHouseの内部 `NULL` 表現に対応します。

**構文**

```sql
toTypeName(value)
```

**引数**

- `value` — 任意の型の値。

**戻り値**

- 入力値のデータ型名。 [String](../data-types/string.md).

**例**

クエリ:

```sql
SELECT toTypeName(123);
```

結果:

```response
┌─toTypeName(123)─┐
│ UInt8           │
└─────────────────┘
```
## blockSize {#blockSize}

ClickHouseでは、クエリは [blocks](/development/architecture#block)（チャンク）で処理されます。
この関数は、関数が呼び出されたブロックのサイズ（行数）を返します。

**構文**

```sql
blockSize()
```

**例**

クエリ:

```sql
DROP TABLE IF EXISTS test;
CREATE TABLE test (n UInt8) ENGINE = Memory;

INSERT INTO test
SELECT * FROM system.numbers LIMIT 5;

SELECT blockSize()
FROM test;
```

結果:

```response
   ┌─blockSize()─┐
1. │           5 │
2. │           5 │
3. │           5 │
4. │           5 │
5. │           5 │
   └─────────────┘
```
## byteSize {#bytesize}

メモリ内の引数の未圧縮バイトサイズの見積もりを返します。

**構文**

```sql
byteSize(argument [, ...])
```

**引数**

- `argument` — 値。

**戻り値**

- メモリ内の引数のバイトサイズの見積もり。 [UInt64](../data-types/int-uint.md).

**例**

[String](../data-types/string.md) 引数の場合、関数は文字列の長さ + 9（終端ゼロ + 長さ）を返します。

クエリ:

```sql
SELECT byteSize('string');
```

結果:

```text
┌─byteSize('string')─┐
│                 15 │
└────────────────────┘
```

クエリ:

```sql
CREATE TABLE test
(
    `key` Int32,
    `u8` UInt8,
    `u16` UInt16,
    `u32` UInt32,
    `u64` UInt64,
    `i8` Int8,
    `i16` Int16,
    `i32` Int32,
    `i64` Int64,
    `f32` Float32,
    `f64` Float64
)
ENGINE = MergeTree
ORDER BY key;

INSERT INTO test VALUES(1, 8, 16, 32, 64,  -8, -16, -32, -64, 32.32, 64.64);

SELECT key, byteSize(u8) AS `byteSize(UInt8)`, byteSize(u16) AS `byteSize(UInt16)`, byteSize(u32) AS `byteSize(UInt32)`, byteSize(u64) AS `byteSize(UInt64)`, byteSize(i8) AS `byteSize(Int8)`, byteSize(i16) AS `byteSize(Int16)`, byteSize(i32) AS `byteSize(Int32)`, byteSize(i64) AS `byteSize(Int64)`, byteSize(f32) AS `byteSize(Float32)`, byteSize(f64) AS `byteSize(Float64)` FROM test ORDER BY key ASC FORMAT Vertical;
```

結果:

```text
Row 1:
──────
key:               1
byteSize(UInt8):   1
byteSize(UInt16):  2
byteSize(UInt32):  4
byteSize(UInt64):  8
byteSize(Int8):    1
byteSize(Int16):   2
byteSize(Int32):   4
byteSize(Int64):   8
byteSize(Float32): 4
byteSize(Float64): 8
```

関数が複数の引数を持つ場合は、引数のバイトサイズを累積します。

クエリ:

```sql
SELECT byteSize(NULL, 1, 0.3, '');
```

結果:

```text
┌─byteSize(NULL, 1, 0.3, '')─┐
│                         19 │
└────────────────────────────┘
```
## materialize {#materialize}

定数を単一の値を含む完全なカラムに変換します。
完全なカラムと定数がメモリにおいて異なる方法で表現されます。
関数は通常、通常の引数と定数引数で異なるコードを実行しますが、結果は通常同じです。
この関数は、この動作をデバッグするために使用できます。

**構文**

```sql
materialize(x)
```

**引数**

- `x` — 定数。 [Constant](overview.md/#constants).

**戻り値**

- 単一の値 `x` を含むカラム。

**例**

以下の例では、`countMatches` 関数は定数の第二引数を期待します。
この動作は、定数を完全なカラムに変換するために `materialize` 関数を使用することでデバッグでき、非定数引数に対して関数がエラーを投げることを確認できます。

クエリ:

```sql
SELECT countMatches('foobarfoo', 'foo');
SELECT countMatches('foobarfoo', materialize('foo'));
```

結果:

```response
2
Code: 44. DB::Exception: Received from localhost:9000. DB::Exception: Illegal type of argument #2 'pattern' of function countMatches, expected constant String, got String
```
## ignore {#ignore}

任意の引数を受け入れ、無条件に `0` を返します。
引数は内部的に評価されるため、ベンチマーク等に役立ちます。

**構文**

```sql
ignore([arg1[, arg2[, ...]])
```

**引数**

- 任意の型の任意の個数の引数を受け入れ、`NULL`も含まれます。

**戻り値**

- `0` を返します。

**例**

クエリ:

```sql
SELECT ignore(0, 'ClickHouse', NULL);
```

結果:

```response
┌─ignore(0, 'ClickHouse', NULL)─┐
│                             0 │
└───────────────────────────────┘
```
## sleep {#sleep}

クエリの実行に遅延や一時停止を導入するために使用します。主にテストやデバッグ目的で使用されます。

**構文**

```sql
sleep(seconds)
```

**引数**

- `seconds`: [UInt*](../data-types/int-uint.md) または [Float](../data-types/float.md) クエリ実行を最大3秒間停止する秒数です。小数点以下の秒数を指定するために浮動小数点値を使用できます。

**戻り値**

この関数は値を返しません。

**例**

```sql
SELECT sleep(2);
```

この関数は値を返しません。しかし、`clickhouse client` でこの関数を実行すると、以下のような出力が得られます:

```response
SELECT sleep(2)

Query id: 8aa9943e-a686-45e1-8317-6e8e3a5596ac

┌─sleep(2)─┐
│        0 │
└──────────┘

1 row in set. Elapsed: 2.012 sec.
```

このクエリは完了する前に2秒間一時停止します。この間に結果は返されず、クエリがハングしているか応答がないように見えるでしょう。

**実装の詳細**

`sleep()` 関数は一般的に本番環境では使用されず、クエリのパフォーマンスやシステムの応答性に悪影響を及ぼす可能性があります。しかし、以下のシナリオでは有用です。

1. **テスト**: ClickHouseのテストやベンチマーク時に、特定の条件下でのシステムの動作を観察するために遅延をシミュレートしたり、一時停止を導入したりすることができます。
2. **デバッグ**: システムの状態や特定の時点でのクエリの実行を検査する必要がある場合、`sleep()`を使用して一時停止を導入し、関連情報を確認できます。
3. **シミュレーション**: 特定の外部システムやネットワーク遅延など、実際のシナリオをシミュレートする必要がある場合、遅延を発生させることがあります。

`sleep()` 関数は慎重に使用し、必要なときだけ使用することが重要です。システム全体のパフォーマンスや応答性に影響を及ぼす可能性があるためです。
## sleepEachRow {#sleepeachrow}

結果セットの各行に対して指定された秒数の間クエリの実行を一時停止します。

**構文**

```sql
sleepEachRow(seconds)
```

**引数**

- `seconds`: [UInt*](../data-types/int-uint.md) または [Float*](../data-types/float.md) 結果セット内の各行のクエリ実行を最大3秒間一時停止する秒数です。小数点以下の秒数を指定するために浮動小数点値を使用できます。

**戻り値**

この関数は受け取った引数と同じ値を返し、変更しません。

**例**

```sql
SELECT number, sleepEachRow(0.5) FROM system.numbers LIMIT 5;
```

```response
┌─number─┬─sleepEachRow(0.5)─┐
│      0 │                 0 │
│      1 │                 0 │
│      2 │                 0 │
│      3 │                 0 │
│      4 │                 0 │
└────────┴───────────────────┘
```

しかし出力は遅延し、各行の間に0.5秒の一時停止があります。

`sleepEachRow()` 関数は、主に `sleep()` 関数と同様に、テストとデバッグに使用されます。行ごとの処理に遅延をシミュレートしたり、一時停止を導入したりすることができ、以下のようなシナリオで有用です。

1. **テスト**: 特定の条件下でClickHouseのパフォーマンスをテストまたはベンチマークする際に、処理される各行に遅延を導入したり、一時的な停止を行うことができます。
2. **デバッグ**: 各行の処理の状態を調べる必要がある場合、`sleepEachRow()` を使用して一時停止を導入し、関連情報を確認できます。
3. **シミュレーション**: 外部システムやネットワーク遅延など、処理される各行に遅延を加えるシナリオをシミュレートする必要がある場合があります。

`sleep()` 関数と同様に、`sleepEachRow()` を慎重に使用し、必要なときだけ使用することが重要です。特に大規模な結果セットを処理する場合、ClickHouseシステムの全体的なパフォーマンスと応答性に重大な影響を及ぼす可能性があります。
## currentDatabase {#currentdatabase}

現在のデータベースの名前を返します。
`CREATE TABLE` クエリのテーブルエンジンパラメータで、データベースを指定する必要がある場合に便利です。

**構文**

```sql
currentDatabase()
```

**戻り値**

- 現在のデータベース名を返します。 [String](../data-types/string.md).

**例**

クエリ:

```sql
SELECT currentDatabase()
```

結果:

```response
┌─currentDatabase()─┐
│ default           │
└───────────────────┘
```
## currentUser {#currentUser}

現在のユーザーの名前を返します。分散クエリの場合、クエリを初期化したユーザーの名前が返されます。

**構文**

```sql
currentUser()
```

エイリアス: `user()`, `USER()`, `current_user()`。エイリアスは大文字と小文字を区別しません。

**戻り値**

- 現在のユーザーの名前。 [String](../data-types/string.md).
- 分散クエリの場合、クエリを初期化したユーザーのログイン名。 [String](../data-types/string.md).

**例**

```sql
SELECT currentUser();
```

結果:

```text
┌─currentUser()─┐
│ default       │
└───────────────┘
```
## currentSchemas {#currentschemas}

現在のデータベーススキーマの名前を持つ単一要素配列を返します。

**構文**

```sql
currentSchemas(bool)
```

エイリアス: `current_schemas`.

**引数**

- `bool`: ブール値。 [Bool](../data-types/boolean.md).

:::note
ブール引数は無視されます。それはこの関数のPostgreSQLでの実装との互換性のために存在します。
:::

**戻り値**

- 現在のデータベースの名前を持つ単一要素配列を返します。

**例**

```sql
SELECT currentSchemas(true);
```

結果:

```response
['default']
```
## isConstant {#isconstant}

引数が定数式であるかどうかを返します。

定数式は、クエリ解析中に結果が既に知られている式、すなわち実行前の式です。例えば、[リテラル](../../sql-reference/syntax.md#literals)に対する式は定数式です。

この関数は主に開発、デバッグ、デモ用に設計されています。

**構文**

```sql
isConstant(x)
```

**引数**

- `x` — 確認する式。

**戻り値**

- `1` もし `x` が定数であれば。 [UInt8](../data-types/int-uint.md).
- `0` もし `x` が非定数であれば。 [UInt8](../data-types/int-uint.md).

**例**

クエリ:

```sql
SELECT isConstant(x + 1) FROM (SELECT 43 AS x)
```

結果:

```text
┌─isConstant(plus(x, 1))─┐
│                      1 │
└────────────────────────┘
```

クエリ:

```sql
WITH 3.14 AS pi SELECT isConstant(cos(pi))
```

結果:

```text
┌─isConstant(cos(pi))─┐
│                   1 │
└─────────────────────┘
```

クエリ:

```sql
SELECT isConstant(number) FROM numbers(1)
```

結果:

```text
┌─isConstant(number)─┐
│                  0 │
└────────────────────┘
```
## hasColumnInTable {#hascolumnintable}

データベース名、テーブル名、および定数文字列としてのカラム名を与えると、指定されたカラムが存在する場合は1を返し、そうでない場合は0を返します。

**構文**

```sql
hasColumnInTable(\['hostname'\[, 'username'\[, 'password'\]\],\] 'database', 'table', 'column')
```

**引数**

- `database` : データベースの名前。 [String literal](/sql-reference/syntax#string)
- `table` : テーブルの名前。 [String literal](/sql-reference/syntax#string)
- `column` : カラムの名前。 [String literal](/sql-reference/syntax#string)
- `hostname` : チェックを行うリモートサーバーの名前。 [String literal](/sql-reference/syntax#string)
- `username` : リモートサーバーのユーザー名。 [String literal](/sql-reference/syntax#string)
- `password` : リモートサーバーのパスワード。 [String literal](/sql-reference/syntax#string)

**戻り値**

- 指定されたカラムが存在する場合は `1`。
- それ以外の場合は `0`。

**実装の詳細**

ネストされたデータ構造の要素について、カラムの存在を確認します。ネストされたデータ構造自体については、関数は0を返します。

**例**

クエリ:

```sql
SELECT hasColumnInTable('system','metrics','metric')
```

```response
1
```

```sql
SELECT hasColumnInTable('system','metrics','non-existing_column')
```

```response
0
```
## hasThreadFuzzer {#hasthreadfuzzer}

Thread Fuzzerが有効かどうかを返します。テストに使用して、実行が長すぎないようにすることができます。

**構文**

```sql
hasThreadFuzzer();
```
## bar {#bar}

棒グラフを作成します。

`bar(x, min, max, width)` は、`(x - min)` に比例した幅を持つバンドを描画し、`x = max` の場合は幅 `width` の文字を同じ数描画します。

**引数**

- `x` — 表示するサイズ。
- `min, max` — 整数の定数。値は `Int64` に収まる必要があります。
- `width` — 定数の正の整数。小数にすることもできます。

バンドはシンボルの八分の一までの精度で描画されます。

例:

```sql
SELECT
    toHour(EventTime) AS h,
    count() AS c,
    bar(c, 0, 600000, 20) AS bar
FROM test.hits
GROUP BY h
ORDER BY h ASC
```

```text
┌──h─┬──────c─┬─bar────────────────┐
│  0 │ 292907 │ █████████▋         │
│  1 │ 180563 │ ██████             │
│  2 │ 114861 │ ███▋               │
│  3 │  85069 │ ██▋                │
│  4 │  68543 │ ██▎                │
│  5 │  78116 │ ██▌                │
│  6 │ 113474 │ ███▋               │
│  7 │ 170678 │ █████▋             │
│  8 │ 278380 │ █████████▎         │
│  9 │ 391053 │ █████████████      │
│ 10 │ 457681 │ ███████████████▎   │
│ 11 │ 493667 │ ████████████████▍  │
│ 12 │ 509641 │ ████████████████▊  │
│ 13 │ 522947 │ █████████████████▍ │
│ 14 │ 539954 │ █████████████████▊ │
│ 15 │ 528460 │ █████████████████▌ │
│ 16 │ 539201 │ █████████████████▊ │
│ 17 │ 523539 │ █████████████████▍ │
│ 18 │ 506467 │ ████████████████▊  │
│ 19 │ 520915 │ █████████████████▎ │
│ 20 │ 521665 │ █████████████████▍ │
│ 21 │ 542078 │ ██████████████████ │
│ 22 │ 493642 │ ████████████████▍  │
│ 23 │ 400397 │ █████████████▎     │
└────┴────────┴────────────────────┘
```
## transform {#transform}

明示的に定義されたいくつかの要素を他のものに変換するために値を変換します。
この関数には2つのバリエーションがあります:
### transform(x, array_from, array_to, default) {#transformx-array_from-array_to-default}

`x` – 変換するもの。

`array_from` – 変換するための定数配列。

`array_to` – 'from'の値を変換するための定数配列。

`default` – 'x'が'from'のいずれの値とも等しくない場合に使用する値。

`array_from` と `array_to` は等しい数の要素を持たなければなりません。

シグネチャ:

`x` が `array_from` の要素の1つと等しい場合、関数は `array_to` の対応する要素（すなわち、同じ配列インデックスの要素）を返します。それ以外の場合は、`default` を返します。 `array_from` に一致する複数の要素がある場合は、その最初の要素に対応するものを返します。

`transform(T, Array(T), Array(U), U) -> U`

`T` と `U` は数値、文字列、または日付または日時型です。
同じ文字（TまたはU）は、型が相互に互換性があり、必ずしも等しい必要はないことを意味します。
例えば、最初の引数は `Int64` 型である一方、第二の引数は `Array(UInt16)` 型である可能性があります。

例:

```sql
SELECT
    transform(SearchEngineID, [2, 3], ['Yandex', 'Google'], 'Other') AS title,
    count() AS c
FROM test.hits
WHERE SearchEngineID != 0
GROUP BY title
ORDER BY c DESC
```

```text
┌─title─────┬──────c─┐
│ Yandex    │ 498635 │
│ Google    │ 229872 │
│ Other     │ 104472 │
└───────────┴────────┘
```
### transform(x, array_from, array_to) {#transformx-array_from-array_to}

他のバリエーションに似ていますが、'default' 引数がありません。一致部分が見つからなかった場合、`x` が返されます。

例:

```sql
SELECT
    transform(domain(Referer), ['yandex.ru', 'google.ru', 'vkontakte.ru'], ['www.yandex', 'example.com', 'vk.com']) AS s,
    count() AS c
FROM test.hits
GROUP BY domain(Referer)
ORDER BY count() DESC
LIMIT 10
```

```text
┌─s──────────────┬───────c─┐
│                │ 2906259 │
│ www.yandex     │  867767 │
│ ███████.ru     │  313599 │
│ mail.yandex.ru │  107147 │
│ ██████.ru      │  100355 │
│ █████████.ru   │   65040 │
│ news.yandex.ru │   64515 │
│ ██████.net     │   59141 │
│ example.com    │   57316 │
└────────────────┴─────────┘
```
## formatReadableDecimalSize {#formatreadabledecimalsize}

サイズ（バイト数）を与えると、この関数は可読性のある丸められたサイズをサフィックス（KB、MB、等）付きで文字列として返します。

この関数の逆操作は [parseReadableSize](#parsereadablesize)、[parseReadableSizeOrZero](#parsereadablesizeorzero)、および [parseReadableSizeOrNull](#parsereadablesizeornull) です。

**構文**

```sql
formatReadableDecimalSize(x)
```

**例**

クエリ:

```sql
SELECT
    arrayJoin([1, 1024, 1024*1024, 192851925]) AS filesize_bytes,
    formatReadableDecimalSize(filesize_bytes) AS filesize
```

結果:

```text
┌─filesize_bytes─┬─filesize───┐
│              1 │ 1.00 B     │
│           1024 │ 1.02 KB   │
│        1048576 │ 1.05 MB   │
│      192851925 │ 192.85 MB │
└────────────────┴────────────┘
```
## formatReadableSize {#formatreadablesize}

サイズ（バイト数）を与えると、この関数は可読性のある丸められたサイズをサフィックス（KiB、MiB等）付きで文字列として返します。

この関数の逆操作は [parseReadableSize](#parsereadablesize)、[parseReadableSizeOrZero](#parsereadablesizeorzero)、および [parseReadableSizeOrNull](#parsereadablesizeornull) です。

**構文**

```sql
formatReadableSize(x)
```
エイリアス: `FORMAT_BYTES`.

:::note
この関数は任意の数値型を入力として受け入れますが、内部ではそれらをFloat64にキャストします。大きな値の場合、結果は最適でない場合があります。
:::

**例**

クエリ:

```sql
SELECT
    arrayJoin([1, 1024, 1024*1024, 192851925]) AS filesize_bytes,
    formatReadableSize(filesize_bytes) AS filesize
```

結果:

```text
┌─filesize_bytes─┬─filesize───┐
│              1 │ 1.00 B     │
│           1024 │ 1.00 KiB   │
│        1048576 │ 1.00 MiB   │
│      192851925 │ 183.92 MiB │
└────────────────┴────────────┘
```
## formatReadableQuantity {#formatreadablequantity}

数値が与えられると、この関数はサフィックス（千、百万、十億等）付きの丸められた数値を文字列として返します。

**構文**

```sql
formatReadableQuantity(x)
```

:::note
この関数は任意の数値型を入力として受け入れますが、内部ではそれらをFloat64にキャストします。大きな値の場合、結果は最適でない場合があります。
:::

**例**

クエリ:

```sql
SELECT
    arrayJoin([1024, 1234 * 1000, (4567 * 1000) * 1000, 98765432101234]) AS number,
    formatReadableQuantity(number) AS number_for_humans
```

結果:

```text
┌─────────number─┬─number_for_humans─┐
│           1024 │ 1.02 thousand     │
│        1234000 │ 1.23 million      │
│     4567000000 │ 4.57 billion      │
│ 98765432101234 │ 98.77 trillion    │
└────────────────┴───────────────────┘
```
## formatReadableTimeDelta {#formatreadabletimedelta}

与えられた時間の間隔（デルタ）を秒単位で、この関数は年/月/日/時間/分/秒/ミリ秒/マイクロ秒/ナノ秒として文字列の時間のデルタを返します。

**構文**

```sql
formatReadableTimeDelta(column[, maximum_unit, minimum_unit])
```

:::note
この関数は任意の数値型を入力として受け入れますが、内部ではそれらをFloat64にキャストします。大きな値の場合、結果は最適でない場合があります。
:::

**引数**

- `column` — 数値の時間のデルタを含むカラム。
- `maximum_unit` — オプション。表示する最大単位。
  - 許可される値: `nanoseconds`, `microseconds`, `milliseconds`, `seconds`, `minutes`, `hours`, `days`, `months`, `years`.
  - デフォルト値: `years`.
- `minimum_unit` — オプション。表示する最小単位。すべての小さい単位は切り捨てられます。
  - 許可される値: `nanoseconds`, `microseconds`, `milliseconds`, `seconds`, `minutes`, `hours`, `days`, `months`, `years`.
  - 明示的に指定された値が `maximum_unit` より大きい場合、例外が発生します。
  - デフォルト値: `seconds` が `maximum_unit` が `seconds` 以上の場合、`nanoseconds` それ以外。

**例**

```sql
SELECT
    arrayJoin([100, 12345, 432546534]) AS elapsed,
    formatReadableTimeDelta(elapsed) AS time_delta
```

```text
┌────elapsed─┬─time_delta ─────────────────────────────────────────────────────┐
│        100 │ 1 minute and 40 seconds                                         │
│      12345 │ 3 hours, 25 minutes and 45 seconds                              │
│  432546534 │ 13 years, 8 months, 17 days, 7 hours, 48 minutes and 54 seconds │
└────────────┴─────────────────────────────────────────────────────────────────┘
```

```sql
SELECT
    arrayJoin([100, 12345, 432546534]) AS elapsed,
    formatReadableTimeDelta(elapsed, 'minutes') AS time_delta
```

```text
┌────elapsed─┬─time_delta ─────────────────────────────────────────────────────┐
│        100 │ 1 minute and 40 seconds                                         │
│      12345 │ 205 minutes and 45 seconds                                      │
│  432546534 │ 7209108 minutes and 54 seconds                                  │
└────────────┴─────────────────────────────────────────────────────────────────┘
```

```sql
SELECT
    arrayJoin([100, 12345, 432546534.00000006]) AS elapsed,
    formatReadableTimeDelta(elapsed, 'minutes', 'nanoseconds') AS time_delta
```

```text
┌────────────elapsed─┬─time_delta─────────────────────────────────────┐
│                100 │ 1 minute and 40 seconds                        │
│              12345 │ 205 minutes and 45 seconds                     │
│ 432546534.00000006 │ 7209108 minutes, 54 seconds and 60 nanoseconds │
└────────────────────┴────────────────────────────────────────────────┘
```
## parseReadableSize {#parsereadablesize}

与えられた文字列はバイトサイズを含み、`B`, `KiB`, `KB`, `MiB`, `MB`などの単位（すなわち、[ISO/IEC 80000-13](https://en.wikipedia.org/wiki/ISO/IEC_80000) または十進バイト単位）を持つ場合、この関数は対応するバイト数を返します。  
この関数が入力値を解析できない場合、例外が発生します。

この関数の逆操作は [formatReadableSize](#formatreadablesize) および [formatReadableDecimalSize](#formatreadabledecimalsize) です。

**構文**

```sql
parseReadableSize(x)
```

**引数**

- `x` : ISO/IEC 80000-13または十進バイト単位での可読サイズ ([String](../../sql-reference/data-types/string.md))。

**戻り値**

- バイト数、整数に切り上げられた値 ([UInt64](../../sql-reference/data-types/int-uint.md))。

**例**

```sql
SELECT
    arrayJoin(['1 B', '1 KiB', '3 MB', '5.314 KiB']) AS readable_sizes,  
    parseReadableSize(readable_sizes) AS sizes;
```

```text
┌─readable_sizes─┬───sizes─┐
│ 1 B            │       1 │
│ 1 KiB          │    1024 │
│ 3 MB           │ 3000000 │
│ 5.314 KiB      │    5442 │
└────────────────┴─────────┘
```
## parseReadableSizeOrNull {#parsereadablesizeornull}

与えられた文字列はバイトサイズを含み、`B`, `KiB`, `KB`, `MiB`, `MB`などの単位（すなわち、[ISO/IEC 80000-13](https://en.wikipedia.org/wiki/ISO/IEC_80000) または十進バイト単位）を持つ場合、この関数は対応するバイト数を返します。  
この関数が入力値を解析できない場合、`NULL` を返します。

この関数の逆操作は [formatReadableSize](#formatreadablesize) および [formatReadableDecimalSize](#formatreadabledecimalsize) です。

**構文**

```sql
parseReadableSizeOrNull(x)
```

**引数**

- `x` : ISO/IEC 80000-13または十進バイト単位での可読サイズ ([String](../../sql-reference/data-types/string.md))。

**戻り値**

- バイト数、整数に切り上げられた値、または入力を解析できなかった場合はNULL（Nullable([UInt64](../../sql-reference/data-types/int-uint.md))）。

**例**

```sql
SELECT
    arrayJoin(['1 B', '1 KiB', '3 MB', '5.314 KiB', 'invalid']) AS readable_sizes,  
    parseReadableSizeOrNull(readable_sizes) AS sizes;
```

```text
┌─readable_sizes─┬───sizes─┐
│ 1 B            │       1 │
│ 1 KiB          │    1024 │
│ 3 MB           │ 3000000 │
│ 5.314 KiB      │    5442 │
│ invalid        │    ᴺᵁᴸᴸ │
└────────────────┴─────────┘
```
## parseReadableSizeOrZero {#parsereadablesizeorzero}

与えられた文字列はバイトサイズを含み、`B`, `KiB`, `KB`, `MiB`, `MB`などの単位（すなわち、[ISO/IEC 80000-13](https://en.wikipedia.org/wiki/ISO/IEC_80000) または十進バイト単位）を持つ場合、この関数は対応するバイト数を返します。もしこの関数が入力値を解析できない場合、`0` を返します。

この関数の逆操作は [formatReadableSize](#formatreadablesize) および [formatReadableDecimalSize](#formatreadabledecimalsize) です。

**構文**

```sql
parseReadableSizeOrZero(x)
```

**引数**

- `x` : ISO/IEC 80000-13または十進バイト単位での可読サイズ ([String](../../sql-reference/data-types/string.md))。

**戻り値**

- バイト数、整数に切り上げられた値、または入力を解析できなかった場合は0 ([UInt64](../../sql-reference/data-types/int-uint.md))。

**例**

```sql
SELECT
    arrayJoin(['1 B', '1 KiB', '3 MB', '5.314 KiB', 'invalid']) AS readable_sizes,  
    parseReadableSizeOrZero(readable_sizes) AS sizes;
```

```text
┌─readable_sizes─┬───sizes─┐
│ 1 B            │       1 │
│ 1 KiB          │    1024 │
│ 3 MB           │ 3000000 │
│ 5.314 KiB      │    5442 │
│ invalid        │       0 │
└────────────────┴─────────┘
```

## parseTimeDelta {#parsetimedelta}

数値の配列を解析し、時間単位に似たものの後に続くものを解析します。

**構文**

```sql
parseTimeDelta(timestr)
```

**引数**

- `timestr` — 数値のシーケンスと、時間単位に似たものの配列。

**返される値**

- 秒数の浮動小数点数。

**例**

```sql
SELECT parseTimeDelta('11s+22min')
```

```text
┌─parseTimeDelta('11s+22min')─┐
│                        1331 │
└─────────────────────────────┘
```

```sql
SELECT parseTimeDelta('1yr2mo')
```

```text
┌─parseTimeDelta('1yr2mo')─┐
│                 36806400 │
└──────────────────────────┘
```
## least {#least}

1つ以上の入力引数の中で最小の引数を返します。`NULL` 引数は無視されます。

**構文**

```sql
least(a, b)
```

:::note
バージョン [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) では互換性のない変更が導入され、`NULL` 値が無視されるようになりました。以前は、引数の1つが `NULL` の場合は `NULL` を返していました。以前の動作を保持するには、設定 `least_greatest_legacy_null_behavior` （デフォルト: `false`）を `true` に設定します。
:::
## greatest {#greatest}

1つ以上の入力引数の中で最大の引数を返します。`NULL` 引数は無視されます。

**構文**

```sql
greatest(a, b)
```

:::note
バージョン [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) では互換性のない変更が導入され、`NULL` 値が無視されるようになりました。以前は、引数の1つが `NULL` の場合は `NULL` を返していました。以前の動作を保持するには、設定 `least_greatest_legacy_null_behavior` （デフォルト: `false`）を `true` に設定します。
:::
## uptime {#uptime}

サーバの稼働時間を秒単位で返します。
分散テーブルのコンテキストで実行される場合、この関数は各シャードに関連する値を持つ通常のカラムを生成します。それ以外の場合は定数値を生成します。

**構文**

```sql
uptime()
```

**返される値**

- 秒の時間値。 [UInt32](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT uptime() as Uptime;
```

結果:

```response
┌─Uptime─┐
│  55867 │
└────────┘
```
## version {#version}

現在の ClickHouse のバージョンを文字列形式で返します。

- メジャーバージョン
- マイナーバージョン
- パッチバージョン
- 前回の安定リリースからのコミット数。

```text
major_version.minor_version.patch_version.number_of_commits_since_the_previous_stable_release
```

分散テーブルのコンテキストで実行される場合、この関数は各シャードに関連する値を持つ通常のカラムを生成します。それ以外の場合は定数値を生成します。

**構文**

```sql
version()
```

**引数**

なし。

**返される値**

- 現在の ClickHouse のバージョン。 [String](../data-types/string)。

**実装詳細**

なし。

**例**

クエリ:

```sql
SELECT version()
```

**結果**:

```response
┌─version()─┐
│ 24.2.1.1  │
└───────────┘
```
## buildId {#buildid}

実行中の ClickHouse サーバーのバイナリに対してコンパイラによって生成されたビルドIDを返します。
分散テーブルのコンテキストで実行される場合、この関数は各シャードに関連する値を持つ通常のカラムを生成します。それ以外の場合は定数値を生成します。

**構文**

```sql
buildId()
```
## blockNumber {#blocknumber}

行を含む [ブロック](../../development/architecture.md#block) の単調増加シーケンス番号を返します。
返されるブロック番号は最善を尽くして更新されるため、完全に正確でない場合があります。

**構文**

```sql
blockNumber()
```

**返される値**

- 行が存在するデータブロックのシーケンス番号。 [UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT blockNumber()
FROM
(
    SELECT *
    FROM system.numbers
    LIMIT 10
) SETTINGS max_block_size = 2
```

結果:

```response
┌─blockNumber()─┐
│             7 │
│             7 │
└───────────────┘
┌─blockNumber()─┐
│             8 │
│             8 │
└───────────────┘
┌─blockNumber()─┐
│             9 │
│             9 │
└───────────────┘
┌─blockNumber()─┐
│            10 │
│            10 │
└───────────────┘
┌─blockNumber()─┐
│            11 │
│            11 │
└───────────────┘
```
## rowNumberInBlock {#rowNumberInBlock}

`rowNumberInBlock` が処理する各 [ブロック](../../development/architecture.md#block) の現在の行の番号を返します。
返される番号は、各ブロックで0から始まります。

**構文**

```sql
rowNumberInBlock()
```

**返される値**

- データブロック内の行の序数番号、0から始まります。 [UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT rowNumberInBlock()
FROM
(
    SELECT *
    FROM system.numbers_mt
    LIMIT 10
) SETTINGS max_block_size = 2
```

結果:

```response
┌─rowNumberInBlock()─┐
│                  0 │
│                  1 │
└────────────────────┘
┌─rowNumberInBlock()─┐
│                  0 │
│                  1 │
└────────────────────┘
┌─rowNumberInBlock()─┐
│                  0 │
│                  1 │
└────────────────────┘
┌─rowNumberInBlock()─┐
│                  0 │
│                  1 │
└────────────────────┘
┌─rowNumberInBlock()─┐
│                  0 │
│                  1 │
└────────────────────┘
```
## rowNumberInAllBlocks {#rownumberinallblocks}

`rowNumberInAllBlocks` によって処理される各行に対して、一意の行番号を返します。返される番号は0から始まります。

**構文**

```sql
rowNumberInAllBlocks()
```

**返される値**

- データブロック内の行の序数番号、0から始まります。 [UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT rowNumberInAllBlocks()
FROM
(
    SELECT *
    FROM system.numbers_mt
    LIMIT 10
)
SETTINGS max_block_size = 2
```

結果:

```response
┌─rowNumberInAllBlocks()─┐
│                      0 │
│                      1 │
└────────────────────────┘
┌─rowNumberInAllBlocks()─┐
│                      4 │
│                      5 │
└────────────────────────┘
┌─rowNumberInAllBlocks()─┐
│                      2 │
│                      3 │
└────────────────────────┘
┌─rowNumberInAllBlocks()─┐
│                      6 │
│                      7 │
└────────────────────────┘
┌─rowNumberInAllBlocks()─┐
│                      8 │
│                      9 │
└────────────────────────┘
```
## normalizeQuery {#normalizequery}

リテラル、リテラルのシーケンスおよび複雑なエイリアス（空白を含む、2桁以上または36バイト以上の長さのもの、UUIDなど）をプレースホルダー `?` に置き換えます。

**構文**

```sql
normalizeQuery(x)
```

**引数**

- `x` — 文字のシーケンス。 [String](../data-types/string.md)。

**返される値**

- プレースホルダーを含む文字のシーケンス。 [String](../data-types/string.md)。

**例**

クエリ:

```sql
SELECT normalizeQuery('[1, 2, 3, x]') AS query;
```

結果:

```result
┌─query────┐
│ [?.., x] │
└──────────┘
```
## normalizeQueryKeepNames {#normalizequerykeepnames}

リテラルおよびリテラルのシーケンスをプレースホルダー `?` に置き換えますが、複雑なエイリアス（空白を含む、2桁以上または36バイト以上の長さのものを含む）を置き換えません。これにより、複雑なクエリログをよりよく分析できます。

**構文**

```sql
normalizeQueryKeepNames(x)
```

**引数**

- `x` — 文字のシーケンス。 [String](../data-types/string.md)。

**返される値**

- プレースホルダーを含む文字のシーケンス。 [String](../data-types/string.md)。

**例**

クエリ:

```sql
SELECT normalizeQuery('SELECT 1 AS aComplexName123'), normalizeQueryKeepNames('SELECT 1 AS aComplexName123');
```

結果:

```result
┌─normalizeQuery('SELECT 1 AS aComplexName123')─┬─normalizeQueryKeepNames('SELECT 1 AS aComplexName123')─┐
│ SELECT ? AS `?`                               │ SELECT ? AS aComplexName123                            │
└───────────────────────────────────────────────┴────────────────────────────────────────────────────────┘
```
## normalizedQueryHash {#normalizedqueryhash}

類似のクエリに対してリテラルの値を除外した同一の64ビットハッシュ値を返します。クエリログを分析するのに役立ちます。

**構文**

```sql
normalizedQueryHash(x)
```

**引数**

- `x` — 文字のシーケンス。 [String](../data-types/string.md)。

**返される値**

- ハッシュ値。 [UInt64](/sql-reference/data-types/int-uint#integer-ranges)。

**例**

クエリ:

```sql
SELECT normalizedQueryHash('SELECT 1 AS `xyz`') != normalizedQueryHash('SELECT 1 AS `abc`') AS res;
```

結果:

```result
┌─res─┐
│   1 │
└─────┘
```
## normalizedQueryHashKeepNames {#normalizedqueryhashkeepnames}

[normalizedQueryHash](#normalizedqueryhash) と同様の機能ですが、リテラルの値を除外した同一の64ビットハッシュ値を返しますが、ハッシュ前に複雑なエイリアス（空白を含む、2桁以上または36バイト以上の長さのものなど）をプレースホルダーに置き換えません。クエリログを分析するのに役立ちます。

**構文**

```sql
normalizedQueryHashKeepNames(x)
```

**引数**

- `x` — 文字のシーケンス。 [String](../data-types/string.md)。

**返される値**

- ハッシュ値。 [UInt64](/sql-reference/data-types/int-uint#integer-ranges)。

**例**

```sql
SELECT normalizedQueryHash('SELECT 1 AS `xyz123`') != normalizedQueryHash('SELECT 1 AS `abc123`') AS normalizedQueryHash;
SELECT normalizedQueryHashKeepNames('SELECT 1 AS `xyz123`') != normalizedQueryHashKeepNames('SELECT 1 AS `abc123`') AS normalizedQueryHashKeepNames;
```

結果:

```result
┌─normalizedQueryHash─┐
│                   0 │
└─────────────────────┘
┌─normalizedQueryHashKeepNames─┐
│                            1 │
└──────────────────────────────┘
```
## neighbor {#neighbor}

<DeprecatedBadge/>

指定されたオフセットの前または後の行にアクセスするウィンドウ関数です。

**構文**

```sql
neighbor(column, offset[, default_value])
```

この関数の結果は、影響を受けるデータブロックおよびブロック内のデータの順序に依存します。

:::note
現在処理しているデータブロックの内部でのみ隣接を返します。
このエラーが起こりやすい動作のため、この関数は非推奨です。適切なウィンドウ関数を使用してください。
:::

`neighbor()` の計算中の行の順序は、ユーザーに返される行の順序とは異なる場合があります。
それを防ぐために、[ORDER BY](../../sql-reference/statements/select/order-by.md) を使用してサブクエリを作成し、サブクエリの外部から関数を呼び出すことができます。

**引数**

- `column` — カラム名またはスカラー式。
- `offset` — `column` における現在の行の前または後ろを見ている行数。 [Int64](../data-types/int-uint.md)。
- `default_value` — オプション。オフセットがブロック境界を超えた場合の返される値。影響を受けるデータブロックのデータ型です。

**返される値**

- 現在の行から `offset` の距離にある `column` の値（`offset` がブロック境界の外でない場合）。
- `column` のデフォルト値または `default_value`（指定されている場合）(オフセットがブロック境界の外にある場合)。

:::note
返される型は、影響を受けるデータブロックのものであるか、デフォルト値の型です。
:::

**例**

クエリ:

```sql
SELECT number, neighbor(number, 2) FROM system.numbers LIMIT 10;
```

結果:

```text
┌─number─┬─neighbor(number, 2)─┐
│      0 │                   2 │
│      1 │                   3 │
│      2 │                   4 │
│      3 │                   5 │
│      4 │                   6 │
│      5 │                   7 │
│      6 │                   8 │
│      7 │                   9 │
│      8 │                   0 │
│      9 │                   0 │
└────────┴─────────────────────┘
```

クエリ:

```sql
SELECT number, neighbor(number, 2, 999) FROM system.numbers LIMIT 10;
```

結果:

```text
┌─number─┬─neighbor(number, 2, 999)─┐
│      0 │                        2 │
│      1 │                        3 │
│      2 │                        4 │
│      3 │                        5 │
│      4 │                        6 │
│      5 │                        7 │
│      6 │                        8 │
│      7 │                        9 │
│      8 │                      999 │
│      9 │                      999 │
└────────┴──────────────────────────┘
```

この関数は、前年対前年の指標値を計算するために使用できます。

クエリ:

```sql
WITH toDate('2018-01-01') AS start_date
SELECT
    toStartOfMonth(start_date + (number * 32)) AS month,
    toInt32(month) % 100 AS money,
    neighbor(money, -12) AS prev_year,
    round(prev_year / money, 2) AS year_over_year
FROM numbers(16)
```

結果:

```text
┌──────month─┬─money─┬─prev_year─┬─year_over_year─┐
│ 2018-01-01 │    32 │         0 │              0 │
│ 2018-02-01 │    63 │         0 │              0 │
│ 2018-03-01 │    91 │         0 │              0 │
│ 2018-04-01 │    22 │         0 │              0 │
│ 2018-05-01 │    52 │         0 │              0 │
│ 2018-06-01 │    83 │         0 │              0 │
│ 2018-07-01 │    13 │         0 │              0 │
│ 2018-08-01 │    44 │         0 │              0 │
│ 2018-09-01 │    75 │         0 │              0 │
│ 2018-10-01 │     5 │         0 │              0 │
│ 2018-11-01 │    36 │         0 │              0 │
│ 2018-12-01 │    66 │         0 │              0 │
│ 2019-01-01 │    97 │        32 │           0.33 │
│ 2019-02-01 │    28 │        63 │           2.25 │
│ 2019-03-01 │    56 │        91 │           1.62 │
│ 2019-04-01 │    87 │        22 │           0.25 │
└────────────┴───────┴───────────┴────────────────┘
```
## runningDifference {#runningDifference}

データブロック内の2つの連続した行の値の差を計算します。
最初の行については0を返し、以降の行については前の行との違いを返します。

:::note
現在処理しているデータブロック内のみで差異が返されます。
このエラーが起こりやすい動作のため、この関数は非推奨です。適切なウィンドウ関数を使用してください。
:::

この関数の結果は、影響を受けるデータブロックおよびブロック内のデータの順序に依存します。

`runningDifference()` の計算中の行の順序は、ユーザーに返される行の順序とは異なる場合があります。
それを防ぐために、[ORDER BY](../../sql-reference/statements/select/order-by.md) を使用してサブクエリを作成し、サブクエリの外部から関数を呼び出すことができます。

**構文**

```sql
runningDifference(x)
```

**例**

クエリ:

```sql
SELECT
    EventID,
    EventTime,
    runningDifference(EventTime) AS delta
FROM
(
    SELECT
        EventID,
        EventTime
    FROM events
    WHERE EventDate = '2016-11-24'
    ORDER BY EventTime ASC
    LIMIT 5
)
```

結果:

```text
┌─EventID─┬───────────EventTime─┬─delta─┐
│    1106 │ 2016-11-24 00:00:04 │     0 │
│    1107 │ 2016-11-24 00:00:05 │     1 │
│    1108 │ 2016-11-24 00:00:05 │     0 │
│    1109 │ 2016-11-24 00:00:09 │     4 │
│    1110 │ 2016-11-24 00:00:10 │     1 │
└─────────┴─────────────────────┴───────┘
```

ブロックサイズが結果に影響することに注意してください。 `runningDifference` の内部状態は新しいブロックごとにリセットされます。

クエリ:

```sql
SELECT
    number,
    runningDifference(number + 1) AS diff
FROM numbers(100000)
WHERE diff != 1
```

結果:

```text
┌─number─┬─diff─┐
│      0 │    0 │
└────────┴──────┘
┌─number─┬─diff─┐
│  65536 │    0 │
└────────┴──────┘
```

クエリ:

```sql
set max_block_size=100000 -- default value is 65536!

SELECT
    number,
    runningDifference(number + 1) AS diff
FROM numbers(100000)
WHERE diff != 1
```

結果:

```text
┌─number─┬─diff─┐
│      0 │    0 │
└────────┴──────┘
```
## runningDifferenceStartingWithFirstValue {#runningdifferencestartingwithfirstvalue}

:::note
この関数は非推奨です （`runningDifference` の注記を参照）。
:::

[生の `runningDifference`](/sql-reference/functions/other-functions#runningDifference) と同様ですが、最初の行の値を最初の行の値として返します。
## runningConcurrency {#runningconcurrency}

同時発生イベントの数を計算します。
各イベントには開始時刻と終了時刻があります。開始時刻はイベントに含まれ、終了時刻は含まれません。開始時刻と終了時刻を持つカラムは同じデータ型でなければなりません。
この関数は、各イベントの開始時刻でのアクティブな（同時に発生している）イベントの総数を計算します。

:::tip
イベントは開始時刻で昇順に並べられている必要があります。この要件が違反された場合、関数は例外を発生させます。各データブロックは別個に処理されます。異なるデータブロックのイベントが重なる場合、正しく処理することはできません。
:::

**構文**

```sql
runningConcurrency(start, end)
```

**引数**

- `start` — イベントの開始時刻を持つカラム。 [Date](../data-types/date.md)、 [DateTime](../data-types/datetime.md)、または [DateTime64](../data-types/datetime64.md)。
- `end` — イベントの終了時刻を持つカラム。 [Date](../data-types/date.md)、 [DateTime](../data-types/datetime.md)、または [DateTime64](../data-types/datetime64.md)。

**返される値**

- 各イベントの開始時刻での同時発生イベントの数。 [UInt32](../data-types/int-uint.md)

**例**

テーブルを考慮してください:

```text
┌──────start─┬────────end─┐
│ 2021-03-03 │ 2021-03-11 │
│ 2021-03-06 │ 2021-03-12 │
│ 2021-03-07 │ 2021-03-08 │
│ 2021-03-11 │ 2021-03-12 │
└────────────┴────────────┘
```

クエリ:

```sql
SELECT start, runningConcurrency(start, end) FROM example_table;
```

結果:

```text
┌──────start─┬─runningConcurrency(start, end)─┐
│ 2021-03-03 │                              1 │
│ 2021-03-06 │                              2 │
│ 2021-03-07 │                              3 │
│ 2021-03-11 │                              2 │
└────────────┴────────────────────────────────┘
```
## MACNumToString {#macnumtostring}

UInt64 数をビッグエンディアン形式の MAC アドレスとして解釈します。対応する MAC アドレスを AA:BB:CC:DD:EE:FF（コロン区切りの16進数形式の数字）として文字列で返します。

**構文**

```sql
MACNumToString(num)
```
## MACStringToNum {#macstringtonum}

MACNumToString の逆関数。MAC アドレスが無効な形式の場合、0 を返します。

**構文**

```sql
MACStringToNum(s)
```
## MACStringToOUI {#macstringtooui}

AA:BB:CC:DD:EE:FF（コロン区切りの16進数形式の数字）である MAC アドレスから最初の3つのオクテットを UInt64 数として返します。MAC アドレスが無効な形式の場合、0 を返します。

**構文**

```sql
MACStringToOUI(s)
```
## getSizeOfEnumType {#getsizeofenumtype}

[Enum](../data-types/enum.md) のフィールド数を返します。
タイプが `Enum` でない場合は例外がスローされます。

**構文**

```sql
getSizeOfEnumType(value)
```

**引数:**

- `value` — `Enum` 型の値。

**返される値**

- `Enum` 入力値を持つフィールドの数。

**例**

```sql
SELECT getSizeOfEnumType( CAST('a' AS Enum8('a' = 1, 'b' = 2) ) ) AS x
```

```text
┌─x─┐
│ 2 │
└───┘
```
## blockSerializedSize {#blockserializedsize}

圧縮を考慮せずにディスク上のサイズを返します。

```sql
blockSerializedSize(value[, value[, ...]])
```

**引数**

- `value` — すべての値。

**返される値**

- 圧縮なしで値のブロックを書き込むためにディスクに書き込まれるバイト数。

**例**

クエリ:

```sql
SELECT blockSerializedSize(maxState(1)) as x
```

結果:

```text
┌─x─┐
│ 2 │
└───┘
```
## toColumnTypeName {#tocolumntypename}

値を表すデータ型の内部名を返します。

**構文**

```sql
toColumnTypeName(value)
```

**引数:**

- `value` — すべての型の値。

**返される値**

- `value` を表現するために使用される内部データ型名。

**例**

`toTypeName` と `toColumnTypeName` の違いを示します。

```sql
SELECT toTypeName(CAST('2018-01-01 01:02:03' AS DateTime))
```

結果:

```text
┌─toTypeName(CAST('2018-01-01 01:02:03', 'DateTime'))─┐
│ DateTime                                            │
└─────────────────────────────────────────────────────┘
```

クエリ:

```sql
SELECT toColumnTypeName(CAST('2018-01-01 01:02:03' AS DateTime))
```

結果:

```text
┌─toColumnTypeName(CAST('2018-01-01 01:02:03', 'DateTime'))─┐
│ Const(UInt32)                                             │
└───────────────────────────────────────────────────────────┘
```

この例は、`DateTime` データ型が内部的に `Const(UInt32)` として保存されることを示しています。
## dumpColumnStructure {#dumpcolumnstructure}

RAM内のデータ構造の詳細な説明を出力します。

```sql
dumpColumnStructure(value)
```

**引数:**

- `value` — すべての型の値。

**返される値**

- `value` を表すために使用されるカラム構造の説明。

**例**

```sql
SELECT dumpColumnStructure(CAST('2018-01-01 01:02:03', 'DateTime'))
```

```text
┌─dumpColumnStructure(CAST('2018-01-01 01:02:03', 'DateTime'))─┐
│ DateTime, Const(size = 1, UInt32(size = 1))                  │
└──────────────────────────────────────────────────────────────┘
```
## defaultValueOfArgumentType {#defaultvalueofargumenttype}

指定されたデータ型のデフォルト値を返します。

ユーザーが設定したカスタムカラムによるデフォルト値は含まれません。

**構文**

```sql
defaultValueOfArgumentType(expression)
```

**引数:**

- `expression` — 任意の型の値または任意の型の値を生成する式。

**返される値**

- 数値の場合は `0`。
- 文字列の場合は空の文字列。
- [Nullable](../data-types/nullable.md) の場合は `ᴺᵁᴸᴸ`。

**例**

クエリ:

```sql
SELECT defaultValueOfArgumentType( CAST(1 AS Int8) )
```

結果:

```text
┌─defaultValueOfArgumentType(CAST(1, 'Int8'))─┐
│                                           0 │
└─────────────────────────────────────────────┘
```

クエリ:

```sql
SELECT defaultValueOfArgumentType( CAST(1 AS Nullable(Int8) ) )
```

結果:

```text
┌─defaultValueOfArgumentType(CAST(1, 'Nullable(Int8)'))─┐
│                                                  ᴺᵁᴸᴸ │
└───────────────────────────────────────────────────────┘
```
## defaultValueOfTypeName {#defaultvalueoftypename}

指定された型名のデフォルト値を返します。

ユーザーが設定したカスタムカラムによるデフォルト値は含まれません。

```sql
defaultValueOfTypeName(type)
```

**引数:**

- `type` — 型名を表す文字列。

**返される値**

- 数値の場合は `0`。
- 文字列の場合は空の文字列。
- [Nullable](../data-types/nullable.md) の場合は `ᴺᵁᴸᴸ`。

**例**

クエリ:

```sql
SELECT defaultValueOfTypeName('Int8')
```

結果:

```text
┌─defaultValueOfTypeName('Int8')─┐
│                              0 │
└────────────────────────────────┘
```

クエリ:

```sql
SELECT defaultValueOfTypeName('Nullable(Int8)')
```

結果:

```text
┌─defaultValueOfTypeName('Nullable(Int8)')─┐
│                                     ᴺᵁᴸᴸ │
└──────────────────────────────────────────┘
```
## indexHint {#indexhint}

この関数はデバッグと内部視察用に意図されています。引数を無視し、常に1を返します。引数は評価されません。

ただし、インデックス分析中に、この関数をラップされていない引数は選択されます。この状態によりインデックスレンジを条件によって選択し、さらにその条件によってフィルタリングされないように思います。ClickHouse のインデックスはスパースであり、`indexHint` を使用すると、同じ条件を直接指定するよりも多くのデータが得られます。

**構文**

```sql
SELECT * FROM table WHERE indexHint(<expression>)
```

**返される値**

- `1`. [Uint8](../data-types/int-uint.md)。

**例**

以下は、テーブル [ontime](../../getting-started/example-datasets/ontime.md) からのテストデータの例です。

テーブル:

```sql
SELECT count() FROM ontime
```

```text
┌─count()─┐
│ 4276457 │
└─────────┘
```

テーブルは `(FlightDate, (Year, FlightDate))` のフィールドにインデックスがあります。

インデックスを使用していないクエリを作成します:

```sql
SELECT FlightDate AS k, count() FROM ontime GROUP BY k ORDER BY k
```

ClickHouse は全テーブルを処理しました (`Processed 4.28 million rows`)。

結果:

```text
┌──────────k─┬─count()─┐
│ 2017-01-01 │   13970 │
│ 2017-01-02 │   15882 │
........................
│ 2017-09-28 │   16411 │
│ 2017-09-29 │   16384 │
│ 2017-09-30 │   12520 │
└────────────┴─────────┘
```

特定の日付を選択しインデックスを適用します:

```sql
SELECT FlightDate AS k, count() FROM ontime WHERE k = '2017-09-15' GROUP BY k ORDER BY k
```

ClickHouse は同様に少ない行数を処理します（`Processed 32.74 thousand rows`）。

結果:

```text
┌──────────k─┬─count()─┐
│ 2017-09-15 │   16428 │
└────────────┴─────────┘
```

今度は、式 `k = '2017-09-15'` を関数 `indexHint` にラップします:

クエリ:

```sql
SELECT
    FlightDate AS k,
    count()
FROM ontime
WHERE indexHint(k = '2017-09-15')
GROUP BY k
ORDER BY k ASC
```

ClickHouse は再度インデックスを使用し、前回と同様に（`Processed 32.74 thousand rows`）です。
式 `k = '2017-09-15'` は結果を生成する際には使用されません。
この例の中で、`indexHint` 関数は隣接する日付が表示できるようにします。

結果:

```text
┌──────────k─┬─count()─┐
│ 2017-09-14 │    7071 │
│ 2017-09-15 │   16428 │
│ 2017-09-16 │    1077 │
│ 2017-09-30 │    8167 │
└────────────┴─────────┘
```
## replicate {#replicate}

単一の値を持つ配列を作成します。

:::note
この関数は、[arrayJoin](/sql-reference/functions/array-join) の内部実装に使用されます。
:::

**構文**

```sql
replicate(x, arr)
```

**引数**

- `x` — 結果の配列に埋め込む値。
- `arr` — 配列。 [Array](../data-types/array.md)。

**返される値**

`arr` と同じ長さの配列を作成し、値 `x` で埋めます。 [Array](../data-types/array.md)。

**例**

クエリ:

```sql
SELECT replicate(1, ['a', 'b', 'c']);
```

結果:

```text
┌─replicate(1, ['a', 'b', 'c'])─┐
│ [1,1,1]                       │
└───────────────────────────────┘
```
## revision {#revision}

現在の ClickHouse [サーバーのリビジョン](../../operations/system-tables/metrics#revision)を返します。

**構文**

```sql
revision()
```

**返される値**

- 現在の ClickHouse サーバーのリビジョン。 [UInt32](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT revision();
```

結果:

```response
┌─revision()─┐
│      54485 │
└────────────┘
```
## filesystemAvailable {#filesystemavailable}

データベースの永続性をホストしているファイルシステムの空きスペースの量を返します。返された値は、総空きスペース ([filesystemUnreserved](#filesystemunreserved)) より常に小さくなります。これは、いくつかのスペースがオペレーティングシステムのために予約されているためです。

**構文**

```sql
filesystemAvailable()
```

**返される値**

- バイト単位の残りの空きスペースの量。 [UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT formatReadableSize(filesystemAvailable()) AS "Available space";
```

結果:

```text
┌─Available space─┐
│ 30.75 GiB       │
└─────────────────┘
```
## filesystemUnreserved {#filesystemunreserved}

データベースの永続性をホストしているファイルシステムの総空きスペースの量を返します。（以前の `filesystemFree`）。 [filesystemAvailable](#filesystemavailable) も参照してください。

**構文**

```sql
filesystemUnreserved()
```

**返される値**

- バイト単位の空きスペースの量。 [UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT formatReadableSize(filesystemUnreserved()) AS "Free space";
```

結果:

```text
┌─Free space─┐
│ 32.39 GiB  │
└────────────┘
```
## filesystemCapacity {#filesystemcapacity}

ファイルシステムの容量をバイト単位で返します。データディレクトリへの [path](../../operations/server-configuration-parameters/settings.md#path) が設定されている必要があります。

**構文**

```sql
filesystemCapacity()
```

**返される値**

- バイト単位のファイルシステムの容量。 [UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT formatReadableSize(filesystemCapacity()) AS "Capacity";
```

結果:

```text
┌─Capacity──┐
│ 39.32 GiB │
└───────────┘
```
## initializeAggregation {#initializeaggregation}

単一の値に基づいて集約関数の結果を計算します。この関数は、[-State](/sql-reference/aggregate-functions/combinators#-state) を用いて集約関数を初期化するために使用できます。集約関数の状態を作成し、[AggregateFunction](/sql-reference/data-types/aggregatefunction) タイプのカラムに挿入するか、初期化された集約をデフォルト値として使用できます。

**構文**

```sql
initializeAggregation (aggregate_function, arg1, arg2, ..., argN)
```

**引数**

- `aggregate_function` — 初期化する集約関数の名前。 [String](../data-types/string.md)。
- `arg` — 集約関数の引数。

**返される値**

- 関数に渡された各行の集約結果。

返される型は、`initializeAggregation` が最初の引数として受け取る型と同じです。

**例**

クエリ:

```sql
SELECT uniqMerge(state) FROM (SELECT initializeAggregation('uniqState', number % 3) AS state FROM numbers(10000));
```

結果:

```text
┌─uniqMerge(state)─┐
│                3 │
└──────────────────┘
```

クエリ:

```sql
SELECT finalizeAggregation(state), toTypeName(state) FROM (SELECT initializeAggregation('sumState', number % 3) AS state FROM numbers(5));
```

結果:

```text
┌─finalizeAggregation(state)─┬─toTypeName(state)─────────────┐
│                          0 │ AggregateFunction(sum, UInt8) │
│                          1 │ AggregateFunction(sum, UInt8) │
│                          2 │ AggregateFunction(sum, UInt8) │
│                          0 │ AggregateFunction(sum, UInt8) │
│                          1 │ AggregateFunction(sum, UInt8) │
└────────────────────────────┴───────────────────────────────┘
```

`AggregatingMergeTree` テーブルエンジンと `AggregateFunction` カラムの例：

```sql
CREATE TABLE metrics
(
    key UInt64,
    value AggregateFunction(sum, UInt64) DEFAULT initializeAggregation('sumState', toUInt64(0))
)
ENGINE = AggregatingMergeTree
ORDER BY key
```

```sql
INSERT INTO metrics VALUES (0, initializeAggregation('sumState', toUInt64(42)))
```

**参照**

- [arrayReduce](../../sql-reference/functions/array-functions.md#arrayreduce)
```
## finalizeAggregation {#finalizeaggregation}

集約関数の状態が与えられた場合、この関数は集約の結果（または [-State](/sql-reference/aggregate-functions/combinators#-state) コンビネーターを使用している場合は最終状態）を返します。

**構文**

```sql
finalizeAggregation(state)
```

**引数**

- `state` — 集約の状態。[AggregateFunction](/sql-reference/data-types/aggregatefunction)。

**返される値**

- 集約された値。

:::note
返される型は、集約された任意の型と同じです。
:::

**例**

クエリ:

```sql
SELECT finalizeAggregation(( SELECT countState(number) FROM numbers(10)));
```

結果:

```text
┌─finalizeAggregation(_subquery16)─┐
│                               10 │
└──────────────────────────────────┘
```

クエリ:

```sql
SELECT finalizeAggregation(( SELECT sumState(number) FROM numbers(10)));
```

結果:

```text
┌─finalizeAggregation(_subquery20)─┐
│                               45 │
└──────────────────────────────────┘
```

`NULL` 値は無視されます。

クエリ:

```sql
SELECT finalizeAggregation(arrayReduce('anyState', [NULL, 2, 3]));
```

結果:

```text
┌─finalizeAggregation(arrayReduce('anyState', [NULL, 2, 3]))─┐
│                                                          2 │
└────────────────────────────────────────────────────────────┘
```

結合例:

クエリ:

```sql
WITH initializeAggregation('sumState', number) AS one_row_sum_state
SELECT
    number,
    finalizeAggregation(one_row_sum_state) AS one_row_sum,
    runningAccumulate(one_row_sum_state) AS cumulative_sum
FROM numbers(10);
```

結果:

```text
┌─number─┬─one_row_sum─┬─cumulative_sum─┐
│      0 │           0 │              0 │
│      1 │           1 │              1 │
│      2 │           2 │              3 │
│      3 │           3 │              6 │
│      4 │           4 │             10 │
│      5 │           5 │             15 │
│      6 │           6 │             21 │
│      7 │           7 │             28 │
│      8 │           8 │             36 │
│      9 │           9 │             45 │
└────────┴─────────────┴────────────────┘
```

**関連項目**

- [arrayReduce](../../sql-reference/functions/array-functions.md#arrayreduce)
- [initializeAggregation](#initializeaggregation)
## runningAccumulate {#runningaccumulate}

データブロックの各行に対して集約関数の状態を累計します。

:::note
状態は各新しいデータブロックごとにリセットされます。
このエラーを引き起こす可能性のある動作のため、この関数は非推奨です。代わりに適切なウィンドウ関数を使用してください。
:::

**構文**

```sql
runningAccumulate(agg_state[, grouping]);
```

**引数**

- `agg_state` — 集約関数の状態。[AggregateFunction](/sql-reference/data-types/aggregatefunction)。
- `grouping` — グルーピングキー。オプショナル。`grouping` 値が変更された場合、関数の状態がリセットされます。等号演算子が定義されている任意の [サポートされるデータ型](../data-types/index.md)を指定できます。

**返される値**

- 各結果行には、現在の位置までのすべての入力行に対して累積された集約関数の結果が含まれます。`runningAccumulate` は、各新しいデータブロックごとに状態をリセットします、または `grouping` の値が変更されたとき。

型は使用される集約関数によって異なります。

**例**

`runningAccumulate` を使用して、グルーピングなしおよびグルーピングありで数値の累積合計を求める方法を考えます。

クエリ:

```sql
SELECT k, runningAccumulate(sum_k) AS res FROM (SELECT number as k, sumState(k) AS sum_k FROM numbers(10) GROUP BY k ORDER BY k);
```

結果:

```text
┌─k─┬─res─┐
│ 0 │   0 │
│ 1 │   1 │
│ 2 │   3 │
│ 3 │   6 │
│ 4 │  10 │
│ 5 │  15 │
│ 6 │  21 │
│ 7 │  28 │
│ 8 │  36 │
│ 9 │  45 │
└───┴─────┘
```

サブクエリは、`0`から`9`までのそれぞれの数値に対して`sumState`を生成します。 `sumState`は、単一の数値の合計を含む[sum](../../sql-reference/aggregate-functions/reference/sum.md)関数の状態を返します。

クエリ全体は以下のことを実行します:

1. 最初の行では、`runningAccumulate`は`sumState(0)`を取得し、`0`を返します。
2. 2番目の行では、関数は`sumState(0)`と`sumState(1)`をマージし、`sumState(0 + 1)`を生成し、合計として`1`を返します。
3. 3番目の行では、関数は`sumState(0 + 1)`と`sumState(2)`をマージし、`sumState(0 + 1 + 2)`を生成し、結果として`3`を返します。
4. この動作はブロックが終了するまで繰り返されます。

以下の例は、`groupping`パラメータの使用法を示しています:

クエリ:

```sql
SELECT
    grouping,
    item,
    runningAccumulate(state, grouping) AS res
FROM
(
    SELECT
        toInt8(number / 4) AS grouping,
        number AS item,
        sumState(number) AS state
    FROM numbers(15)
    GROUP BY item
    ORDER BY item ASC
);
```

結果:

```text
┌─grouping─┬─item─┬─res─┐
│        0 │    0 │   0 │
│        0 │    1 │   1 │
│        0 │    2 │   3 │
│        0 │    3 │   6 │
│        1 │    4 │   4 │
│        1 │    5 │   9 │
│        1 │    6 │  15 │
│        1 │    7 │  22 │
│        2 │    8 │   8 │
│        2 │    9 │  17 │
│        2 │   10 │  27 │
│        2 │   11 │  38 │
│        3 │   12 │  12 │
│        3 │   13 │  25 │
│        3 │   14 │  39 │
└──────────┴──────┴─────┘
```

このように、`runningAccumulate`は各行のグループの状態を別々にマージします。
## joinGet {#joinget}

この関数は、辞書と同様にテーブルからデータを抽出できるようにします。[Join](../../engines/table-engines/special/join.md#creating-a-table) テーブルから指定された結合キーを使用してデータを取得します。

:::note
`ENGINE = Join(ANY, LEFT, <join_keys>)`文で作成されたテーブルのみをサポートします。
:::

**構文**

```sql
joinGet(join_storage_table_name, `value_column`, join_keys)
```

**引数**

- `join_storage_table_name` — 検索が行われる場所を示す [識別子](/sql-reference/syntax#identifiers)。
- `value_column` — 必要なデータを含むテーブルのカラムの名前。
- `join_keys` — キーのリスト。

:::note
識別子はデフォルトデータベース内で検索されます（設定ファイル内の `default_database` を参照）。デフォルトデータベースを上書きするには、`USE db_name` を使用するか、例のようにセパレーター `db_name.db_table` を介してデータベースとテーブルを指定します。
:::

**返される値**

- キーのリストに対応する値のリストを返します。

:::note
特定のキーがソーステーブルに存在しない場合、テーブル作成時の [join_use_nulls](../../operations/settings/settings.md#join_use_nulls) 設定に基づいて `0` または `null` が返されます。
`join_use_nulls` に関する詳細は [Join operation](../../engines/table-engines/special/join.md)を参照してください。
:::

**例**

入力テーブル:

```sql
CREATE DATABASE db_test;
CREATE TABLE db_test.id_val(`id` UInt32, `val` UInt32) ENGINE = Join(ANY, LEFT, id);
INSERT INTO db_test.id_val VALUES (1, 11)(2, 12)(4, 13);
SELECT * FROM db_test.id_val;
```

```text
┌─id─┬─val─┐
│  4 │  13 │
│  2 │  12 │
│  1 │  11 │
└────┴─────┘
```

クエリ:

```sql
SELECT number, joinGet(db_test.id_val, 'val', toUInt32(number)) from numbers(4);
```

結果:

```text
   ┌─number─┬─joinGet('db_test.id_val', 'val', toUInt32(number))─┐
1. │      0 │                                                  0 │
2. │      1 │                                                 11 │
3. │      2 │                                                 12 │
4. │      3 │                                                  0 │
   └────────┴────────────────────────────────────────────────────┘
```

`join_use_nulls` 設定は、テーブル作成時にソーステーブルにキーが存在しない場合の返される動作を変更するために使用できます。

```sql
CREATE DATABASE db_test;
CREATE TABLE db_test.id_val_nulls(`id` UInt32, `val` UInt32) ENGINE = Join(ANY, LEFT, id) SETTINGS join_use_nulls=1;
INSERT INTO db_test.id_val_nulls VALUES (1, 11)(2, 12)(4, 13);
SELECT * FROM db_test.id_val_nulls;
```

```text
┌─id─┬─val─┐
│  4 │  13 │
│  2 │  12 │
│  1 │  11 │
└────┴─────┘
```

クエリ:

```sql
SELECT number, joinGet(db_test.id_val_nulls, 'val', toUInt32(number)) from numbers(4);
```

結果:

```text
   ┌─number─┬─joinGet('db_test.id_val_nulls', 'val', toUInt32(number))─┐
1. │      0 │                                                     ᴺᵁᴸᴸ │
2. │      1 │                                                       11 │
3. │      2 │                                                       12 │
4. │      3 │                                                     ᴺᵁᴸᴸ │
   └────────┴──────────────────────────────────────────────────────────┘
```
## joinGetOrNull {#joingetornull}

[joinGet](#joinget) のように動作しますが、キーが欠落している場合はデフォルト値の代わりに `NULL` を返します。

**構文**

```sql
joinGetOrNull(join_storage_table_name, `value_column`, join_keys)
```

**引数**

- `join_storage_table_name` — 検索が行われる場所を示す [識別子](/sql-reference/syntax#identifiers)。
- `value_column` — 必要なデータを含むテーブルのカラムの名前。
- `join_keys` — キーのリスト。

:::note
識別子はデフォルトデータベース内で検索されます（設定ファイル内の `default_database` を参照）。デフォルトデータベースを上書きするには、`USE db_name` を使用するか、例のようにセパレーター `db_name.db_table` を介してデータベースとテーブルを指定します。
:::

**返される値**

- キーのリストに対応する値のリストを返します。

:::note
特定のキーがソーステーブルに存在しない場合、そのキーに対して `NULL` が返されます。
:::

**例**

入力テーブル:

```sql
CREATE DATABASE db_test;
CREATE TABLE db_test.id_val(`id` UInt32, `val` UInt32) ENGINE = Join(ANY, LEFT, id);
INSERT INTO db_test.id_val VALUES (1, 11)(2, 12)(4, 13);
SELECT * FROM db_test.id_val;
```

```text
┌─id─┬─val─┐
│  4 │  13 │
│  2 │  12 │
│  1 │  11 │
└────┴─────┘
```

クエリ:

```sql
SELECT number, joinGetOrNull(db_test.id_val, 'val', toUInt32(number)) from numbers(4);
```

結果:

```text
   ┌─number─┬─joinGetOrNull('db_test.id_val', 'val', toUInt32(number))─┐
1. │      0 │                                                     ᴺᵁᴸᴸ │
2. │      1 │                                                       11 │
3. │      2 │                                                       12 │
4. │      3 │                                                     ᴺᵁᴸᴸ │
   └────────┴──────────────────────────────────────────────────────────┘
```
## catboostEvaluate {#catboostevaluate}

<CloudNotSupportedBadge/>

:::note
この関数は ClickHouse Cloud では利用できません。
:::

外部の catboost モデルを評価します。[CatBoost](https://catboost.ai) は、Yandex が開発した機械学習用のオープンソースの勾配ブースティングライブラリです。
catboost モデルへのパスとモデル引数（特徴）を受け取ります。Float64 を返します。

**構文**

```sql
catboostEvaluate(path_to_model, feature_1, feature_2, ..., feature_n)
```

**例**

```sql
SELECT feat1, ..., feat_n, catboostEvaluate('/path/to/model.bin', feat_1, ..., feat_n) AS prediction
FROM data_table
```

**前提条件**

1. catboost 評価ライブラリをビルドする

catboost モデルを評価する前に、`libcatboostmodel.<so|dylib>` ライブラリを利用できるようにする必要があります。コンパイル方法については、[CatBoost documentation](https://catboost.ai/docs/concepts/c-plus-plus-api_dynamic-c-pluplus-wrapper.html)を参照してください。

次に、clickhouse 設定内で `libcatboostmodel.<so|dylib>` へのパスを指定します。

```xml
<clickhouse>
...
    <catboost_lib_path>/path/to/libcatboostmodel.so</catboost_lib_path>
...
</clickhouse>
```

セキュリティと分離の理由で、モデル評価はサーバープロセスではなく、clickhouse-library-bridge プロセスで実行されます。
`catboostEvaluate()` の最初の実行時、サーバーはライブラリブリッジプロセスを開始します。このプロセスは、すでに実行中でない限りです。両方のプロセスは HTTP インターフェイスを介して通信します。デフォルトでは、ポート `9012` が使用されます。別のポートを指定することも可能で、ポート `9012` が別のサービスに既に割り当てられている場合に便利です。

```xml
<library_bridge>
    <port>9019</port>
</library_bridge>
```

2. libcatboost を使用して catboost モデルをトレーニングする

トレーニングデータセットから catboost モデルをトレーニングする方法は、[Training and applying models](https://catboost.ai/docs/features/training.html#training)を参照してください。
## throwIf {#throwif}

引数 `x` が true の場合、例外をスローします。

**構文**

```sql
throwIf(x[, message[, error_code]])
```

**引数**

- `x` - チェックする条件。
- `message` - カスタムエラーメッセージを提供する定数文字列。オプショナル。
- `error_code` - カスタムエラーメッセージを提供する定数整数。オプショナル。

`error_code` 引数を使用するには、設定パラメータ `allow_custom_error_code_in_throwif` を有効にする必要があります。

**例**

```sql
SELECT throwIf(number = 3, 'Too many') FROM numbers(10);
```

結果:

```text
↙ Progress: 0.00 rows, 0.00 B (0.00 rows/s., 0.00 B/s.) Received exception from server (version 19.14.1):
Code: 395. DB::Exception: Received from localhost:9000. DB::Exception: Too many.
```
## identity {#identity}

引数をそのまま返します。デバッグとテストを意図しています。インデックスを使用するのをキャンセルし、フルスキャンのクエリパフォーマンスを取得します。クエリがインデックスの使用を検討されるとき、アナライザーは`identity`関数内のすべてを無視します。また、定数の折り畳みを無効にします。

**構文**

```sql
identity(x)
```

**例**

クエリ:

```sql
SELECT identity(42);
```

結果:

```text
┌─identity(42)─┐
│           42 │
└──────────────┘
```
## getSetting {#getsetting}

現在の [カスタム設定](/operations/settings/query-level#custom_settings) の値を返します。

**構文**

```sql
getSetting('custom_setting');
```

**パラメータ**

- `custom_setting` — 設定名。[String](../data-types/string.md)。

**返される値**

- 設定の現在の値。

**例**

```sql
SET custom_a = 123;
SELECT getSetting('custom_a');
```

結果:

```text
123
```

**関連項目**

- [Custom Settings](/operations/settings/query-level#custom_settings)
## getSettingOrDefault {#getsettingordefault}

現在の [カスタム設定](/operations/settings/query-level#custom_settings) の値を返すか、カスタム設定が現在のプロファイルに設定されていない場合は、2 番目の引数で指定されているデフォルト値を返します。

**構文**

```sql
getSettingOrDefault('custom_setting', default_value);
```

**パラメータ**

- `custom_setting` — 設定名。[String](../data-types/string.md)。
- `default_value` — custom_setting が設定されていない場合に返す値。値は任意のデータ型または Null である可能性があります。

**返される値**

- 設定の現在の値または、設定が設定されていない場合は default_value。

**例**

```sql
SELECT getSettingOrDefault('custom_undef1', 'my_value');
SELECT getSettingOrDefault('custom_undef2', 100);
SELECT getSettingOrDefault('custom_undef3', NULL);
```

結果:

```text
my_value
100
NULL
```

**関連項目**

- [Custom Settings](/operations/settings/query-level#custom_settings)
## isDecimalOverflow {#isdecimaloverflow}

[Decimal](../data-types/decimal.md) 値がその精度を超えているか、指定された精度を超えているかをチェックします。

**構文**

```sql
isDecimalOverflow(d, [p])
```

**引数**

- `d` — 値。[Decimal](../data-types/decimal.md)。
- `p` — 精度。オプション。省略すると、最初の引数の初期精度が使用されます。このパラメータは、他のデータベースやファイル間でデータを移行する際に役立つことがあります。[UInt8](/sql-reference/data-types/int-uint#integer-ranges)。

**返される値**

- `1` — Decimal 値がその精度によって許可されるより多くの桁を持っている場合、
- `0` — Decimal 値が指定された精度を満たしている場合。

**例**

クエリ:

```sql
SELECT isDecimalOverflow(toDecimal32(1000000000, 0), 9),
       isDecimalOverflow(toDecimal32(1000000000, 0)),
       isDecimalOverflow(toDecimal32(-1000000000, 0), 9),
       isDecimalOverflow(toDecimal32(-1000000000, 0));
```

結果:

```text
1    1    1    1
```
## countDigits {#countdigits}

値を表すのに必要な小数桁数を返します。

**構文**

```sql
countDigits(x)
```

**引数**

- `x` — [Int](../data-types/int-uint.md) または [Decimal](../data-types/decimal.md) 値。

**返される値**

- 桁数。[UInt8](/sql-reference/data-types/int-uint#integer-ranges)。

:::note
`Decimal` 値の場合、スケールを考慮します: 結果は基になる整数型 `(value * scale)` に対して計算されます。例えば: `countDigits(42) = 2`, `countDigits(42.000) = 5`, `countDigits(0.04200) = 4`。つまり、 `countDecimal(x) > 18` で `Decimal64` に対する小数オーバーフローをチェックできます。これは、[isDecimalOverflow](#isdecimaloverflow) の遅いバリアントです。
:::

**例**

クエリ:

```sql
SELECT countDigits(toDecimal32(1, 9)), countDigits(toDecimal32(-1, 9)),
       countDigits(toDecimal64(1, 18)), countDigits(toDecimal64(-1, 18)),
       countDigits(toDecimal128(1, 38)), countDigits(toDecimal128(-1, 38));
```

結果:

```text
10    10    19    19    39    39
```
## errorCodeToName {#errorcodetoname}

- エラーコードのテキスト名。[LowCardinality(String)](../data-types/lowcardinality.md)。

**構文**

```sql
errorCodeToName(1)
```

結果:

```text
UNSUPPORTED_METHOD
```
## tcpPort {#tcpport}

このサーバーがリッスンしている [ネイティブインターフェイス](../../interfaces/tcp.md) の TCP ポート番号を返します。
分散テーブルのコンテキストで実行されると、この関数は各シャードに関連する正常なカラムを生成します。それ以外の場合は定数値が生成されます。

**構文**

```sql
tcpPort()
```

**引数**

- なし。

**返される値**

- TCP ポート番号。[UInt16](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT tcpPort();
```

結果:

```text
┌─tcpPort()─┐
│      9000 │
└───────────┘
```

**関連項目**

- [tcp_port](../../operations/server-configuration-parameters/settings.md#tcp_port)
## currentProfiles {#currentprofiles}

現在のユーザーの現在の [設定プロファイル](../../guides/sre/user-management/index.md#settings-profiles-management) のリストを返します。

コマンド [SET PROFILE](/sql-reference/functions/other-functions#currentprofiles) を使用して、現在の設定プロファイルを変更できます。`SET PROFILE` コマンドが使用されていない場合、この関数は現在のユーザーの定義で指定されたプロファイルを返します（[CREATE USER](/sql-reference/statements/create/user) を参照）。

**構文**

```sql
currentProfiles()
```

**返される値**

- 現在のユーザーの設定プロファイルのリスト。[Array](../data-types/array.md)([String](../data-types/string.md)).
## enabledProfiles {#enabledprofiles}

現在のユーザーに明示的および暗黙的に割り当てられている設定プロファイルを返します。明示的に割り当てられたプロファイルは、[currentProfiles](#currentprofiles) 関数によって返されるものと同じです。暗黙的に割り当てられたプロファイルには、他の割り当てられたプロファイルの親プロファイル、付与されたロールを介して割り当てられたプロファイル、自身の設定を介して割り当てられたプロファイル、および主要なデフォルトプロファイルが含まれます（主要なサーバー設定ファイル内の `default_profile` セクションを参照）。

**構文**

```sql
enabledProfiles()
```

**返される値**

- 有効な設定プロファイルのリスト。[Array](../data-types/array.md)([String](../data-types/string.md)).
## defaultProfiles {#defaultprofiles}

現在のユーザーの定義で指定されたすべてのプロファイルを返します（[CREATE USER](/sql-reference/statements/create/user) 文を参照）。

**構文**

```sql
defaultProfiles()
```

**返される値**

- デフォルト設定プロファイルのリスト。[Array](../data-types/array.md)([String](../data-types/string.md)).
## currentRoles {#currentroles}

現在のユーザーに割り当てられたロールを返します。ロールは [SET ROLE](/sql-reference/statements/set-role) 文によって変更できます。`SET ROLE` 文が使用されていない場合、関数 `currentRoles` は `defaultRoles` と同じものを返します。

**構文**

```sql
currentRoles()
```

**返される値**

- 現在のユーザーの現在のロールのリスト。[Array](../data-types/array.md)([String](../data-types/string.md)).
## enabledRoles {#enabledroles}

現在のロールおよび現在のロールに付与されたロールの名前を返します。

**構文**

```sql
enabledRoles()
```

**返される値**

- 現在のユーザーに対して有効なロールのリスト。[Array](../data-types/array.md)([String](../data-types/string.md)).
## defaultRoles {#defaultroles}

ユーザーがログインしたときにデフォルトで有効になるロールを返します。最初は、現在のユーザーに付与されたすべてのロールです（[GRANT](../../sql-reference/statements/grant.md#select)を参照）が、それは [SET DEFAULT ROLE](/sql-reference/statements/set-role#set-default-role) 文によって変更される可能性があります。

**構文**

```sql
defaultRoles()
```

**返される値**

- 現在のユーザーのデフォルトロールのリスト。[Array](../data-types/array.md)([String](../data-types/string.md)).
## getServerPort {#getserverport}

サーバーポート番号を返します。ポートがサーバーによって使用されていない場合、例外をスローします。

**構文**

```sql
getServerPort(port_name)
```

**引数**

- `port_name` — サーバーポートの名前。[String](/sql-reference/data-types/string)。可能な値:

  - 'tcp_port'
  - 'tcp_port_secure'
  - 'http_port'
  - 'https_port'
  - 'interserver_http_port'
  - 'interserver_https_port'
  - 'mysql_port'
  - 'postgresql_port'
  - 'grpc_port'
  - 'prometheus.port'

**返される値**

- サーバーポートの番号。[UInt16](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT getServerPort('tcp_port');
```

結果:

```text
┌─getServerPort('tcp_port')─┐
│ 9000                      │
└───────────────────────────┘
```
## queryID {#queryid}

現在のクエリの ID を返します。クエリの他のパラメータは、[system.query_log](../../operations/system-tables/query_log.md) テーブルから `query_id` を介して抽出できます。

[initialQueryID](#initialqueryid) 関数とは対照的に、`queryID` は異なるシャードで異なる結果を返すことがあります（例を参照）。

**構文**

```sql
queryID()
```

**返される値**

- 現在のクエリの ID。[String](../data-types/string.md)

**例**

クエリ:

```sql
CREATE TABLE tmp (str String) ENGINE = Log;
INSERT INTO tmp (*) VALUES ('a');
SELECT count(DISTINCT t) FROM (SELECT queryID() AS t FROM remote('127.0.0.{1..3}', currentDatabase(), 'tmp') GROUP BY queryID());
```

結果:

```text
┌─count()─┐
│ 3       │
└─────────┘
```
## initialQueryID {#initialqueryid}

初期の現在のクエリの ID を返します。クエリの他のパラメータは、[system.query_log](../../operations/system-tables/query_log.md) テーブルから `initial_query_id` を介して抽出できます。

[queryID](/sql-reference/functions/other-functions#queryid) 関数とは対照的に、`initialQueryID` は異なるシャードで同じ結果を返します（例を参照）。

**構文**

```sql
initialQueryID()
```

**返される値**

- 初期の現在のクエリの ID。[String](../data-types/string.md)

**例**

クエリ:

```sql
CREATE TABLE tmp (str String) ENGINE = Log;
INSERT INTO tmp (*) VALUES ('a');
SELECT count(DISTINCT t) FROM (SELECT initialQueryID() AS t FROM remote('127.0.0.{1..3}', currentDatabase(), 'tmp') GROUP BY queryID());
```

結果:

```text
┌─count()─┐
│ 1       │
└─────────┘
```
## initialQueryStartTime {#initialquerystarttime}

初期の現在のクエリの開始時間を返します。

`initialQueryStartTime` は異なるシャードで同じ結果を返します（例を参照）。

**構文**

```sql
initialQueryStartTime()
```

**返される値**

- 初期の現在のクエリの開始時間。[DateTime](../data-types/datetime.md)

**例**

クエリ:

```sql
CREATE TABLE tmp (str String) ENGINE = Log;
INSERT INTO tmp (*) VALUES ('a');
SELECT count(DISTINCT t) FROM (SELECT initialQueryStartTime() AS t FROM remote('127.0.0.{1..3}', currentDatabase(), 'tmp') GROUP BY queryID());
```

結果:

```text
┌─count()─┐
│ 1       │
└─────────┘
```
## partitionID {#partitionid}

[パーティション ID](../../engines/table-engines/mergetree-family/custom-partitioning-key.md) を計算します。

:::note
この関数は遅く、大量の行には呼び出さないでください。
:::

**構文**

```sql
partitionID(x[, y, ...]);
```

**引数**

- `x` — パーティション ID を返す対象のカラム。
- `y, ...` — パーティション ID を返す残りの N カラム（オプション）。

**返される値**

- 行が属するパーティション ID。[String](../data-types/string.md)。

**例**

クエリ:

```sql
DROP TABLE IF EXISTS tab;

CREATE TABLE tab
(
  i int,
  j int
)
ENGINE = MergeTree
PARTITION BY i
ORDER BY tuple();

INSERT INTO tab VALUES (1, 1), (1, 2), (1, 3), (2, 4), (2, 5), (2, 6);

SELECT i, j, partitionID(i), _partition_id FROM tab ORDER BY i, j;
```

結果:

```response
┌─i─┬─j─┬─partitionID(i)─┬─_partition_id─┐
│ 1 │ 1 │ 1              │ 1             │
│ 1 │ 2 │ 1              │ 1             │
│ 1 │ 3 │ 1              │ 1             │
└───┴───┴────────────────┴───────────────┘
┌─i─┬─j─┬─partitionID(i)─┬─_partition_id─┐
│ 2 │ 4 │ 2              │ 2             │
│ 2 │ 5 │ 2              │ 2             │
│ 2 │ 6 │ 2              │ 2             │
└───┴───┴────────────────┴───────────────┘
```
## shardNum {#shardnum}

分散クエリ内でデータの一部を処理するシャードのインデックスを返します。インデックスは `1` から始まります。
クエリが分散していない場合、定数値 `0` が返されます。

**構文**

```sql
shardNum()
```

**返される値**

- シャードインデックスまたは定数 `0`。[UInt32](../data-types/int-uint.md)。

**例**

以下の例では、2 つのシャードを持つ構成が使用されています。クエリは、すべてのシャードで [system.one](../../operations/system-tables/one.md) テーブルに対して実行されます。

クエリ:

```sql
CREATE TABLE shard_num_example (dummy UInt8)
    ENGINE=Distributed(test_cluster_two_shards_localhost, system, one, dummy);
SELECT dummy, shardNum(), shardCount() FROM shard_num_example;
```

結果:

```text
┌─dummy─┬─shardNum()─┬─shardCount()─┐
│     0 │          2 │            2 │
│     0 │          1 │            2 │
└───────┴────────────┴──────────────┘
```

**関連項目**

- [Distributed Table Engine](../../engines/table-engines/special/distributed.md)
## shardCount {#shardcount}

分散クエリのためのシャードの総数を返します。
クエリが分散していない場合、定数値 `0` が返されます。

**構文**

```sql
shardCount()
```

**返される値**

- シャードの総数または `0`。[UInt32](../data-types/int-uint.md)。

**関連項目**

- [shardNum()](#shardnum) 関数の例にも `shardCount()` 関数呼び出しが含まれています。
## getOSKernelVersion {#getoskernelversion}

現在の OS カーネルバージョンを含む文字列を返します。

**構文**

```sql
getOSKernelVersion()
```

**引数**

- なし。

**返される値**

- 現在の OS カーネルバージョン。[String](../data-types/string.md)。

**例**

クエリ:

```sql
SELECT getOSKernelVersion();
```

結果:

```text
┌─getOSKernelVersion()────┐
│ Linux 4.15.0-55-generic │
└─────────────────────────┘
```
## zookeeperSessionUptime {#zookeepersessionuptime}

現在の ZooKeeper セッションの稼働時間を秒単位で返します。

**構文**

```sql
zookeeperSessionUptime()
```

**引数**

- なし。

**返される値**

- 現在の ZooKeeper セッションの稼働時間（秒）。[UInt32](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT zookeeperSessionUptime();
```

結果:

```text
┌─zookeeperSessionUptime()─┐
│                      286 │
└──────────────────────────┘
```
## generateRandomStructure {#generaterandomstructure}

ランダムなテーブル構造を `column1_name column1_type, column2_name column2_type, ...` 形式で生成します。

**構文**

```sql
generateRandomStructure([number_of_columns, seed])
```

**引数**

- `number_of_columns` — 結果テーブル構造におけるカラムの数。0または`Null`に設定すると、カラムの数は1から128の間でランダムに決定されます。デフォルト値: `Null`。
- `seed` - 安定した結果を生成するためのランダムシード。シードが指定されていないか`Null`に設定されている場合、ランダムに生成されます。

すべての引数は定数でなければなりません。

**返される値**

- ランダムに生成されたテーブル構造。[String](../data-types/string.md)。

**例**

クエリ:

```sql
SELECT generateRandomStructure()
```

結果:

```text
┌─generateRandomStructure()─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ c1 Decimal32(5), c2 Date, c3 Tuple(LowCardinality(String), Int128, UInt64, UInt16, UInt8, IPv6), c4 Array(UInt128), c5 UInt32, c6 IPv4, c7 Decimal256(64), c8 Decimal128(3), c9 UInt256, c10 UInt64, c11 DateTime │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

クエリ:

```sql
SELECT generateRandomStructure(1)
```

結果:

```text
┌─generateRandomStructure(1)─┐
│ c1 Map(UInt256, UInt16)    │
└────────────────────────────┘
```

クエリ:

```sql
SELECT generateRandomStructure(NULL, 33)
```

結果:

```text
┌─generateRandomStructure(NULL, 33)─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ c1 DateTime, c2 Enum8('c2V0' = 0, 'c2V1' = 1, 'c2V2' = 2, 'c2V3' = 3), c3 LowCardinality(Nullable(FixedString(30))), c4 Int16, c5 Enum8('c5V0' = 0, 'c5V1' = 1, 'c5V2' = 2, 'c5V3' = 3), c6 Nullable(UInt8), c7 String, c8 Nested(e1 IPv4, e2 UInt8, e3 UInt16, e4 UInt16, e5 Int32, e6 Map(Date, Decimal256(70))) │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**注**: 複雑な型（Array, Tuple, Map, Nested）の最大ネスト深度は16に制限されています。

この関数は、[generateRandom](../../sql-reference/table-functions/generate.md) と組み合わせて使用することで、完全にランダムなテーブルを生成するために使用できます。
## structureToCapnProtoSchema {#structure_to_capn_proto_schema}

ClickHouseのテーブル構造をCapnProtoスキーマに変換します。

**構文**

```sql
structureToCapnProtoSchema(structure)
```

**引数**

- `structure` — `column1_name column1_type, column2_name column2_type, ...` 形式のテーブル構造。
- `root_struct_name` — CapnProtoスキーマのルート構造体の名前。デフォルト値 - `Message`。

**返される値**

- CapnProtoスキーマ。[String](../data-types/string.md)。

**例**

クエリ:

```sql
SELECT structureToCapnProtoSchema('column1 String, column2 UInt32, column3 Array(String)') FORMAT RawBLOB
```

結果:

```text
@0xf96402dd754d0eb7;

struct Message
{
    column1 @0 : Data;
    column2 @1 : UInt32;
    column3 @2 : List(Data);
}
```

クエリ:

```sql
SELECT structureToCapnProtoSchema('column1 Nullable(String), column2 Tuple(element1 UInt32, element2 Array(String)), column3 Map(String, String)') FORMAT RawBLOB
```

結果:

```text
@0xd1c8320fecad2b7f;

struct Message
{
    struct Column1
    {
        union
        {
            value @0 : Data;
            null @1 : Void;
        }
    }
    column1 @0 : Column1;
    struct Column2
    {
        element1 @0 : UInt32;
        element2 @1 : List(Data);
    }
    column2 @1 : Column2;
    struct Column3
    {
        struct Entry
        {
            key @0 : Data;
            value @1 : Data;
        }
        entries @0 : List(Entry);
    }
    column3 @2 : Column3;
}
```

クエリ:

```sql
SELECT structureToCapnProtoSchema('column1 String, column2 UInt32', 'Root') FORMAT RawBLOB
```

結果:

```text
@0x96ab2d4ab133c6e1;

struct Root
{
    column1 @0 : Data;
    column2 @1 : UInt32;
}
```
## structureToProtobufSchema {#structure_to_protobuf_schema}

ClickHouseのテーブル構造をProtobufスキーマに変換します。

**構文**

```sql
structureToProtobufSchema(structure)
```

**引数**

- `structure` — `column1_name column1_type, column2_name column2_type, ...` 形式のテーブル構造。
- `root_message_name` — Protobufスキーマのルートメッセージの名前。デフォルト値 - `Message`。

**返される値**

- Protobufスキーマ。[String](../data-types/string.md)。

**例**

クエリ:

```sql
SELECT structureToProtobufSchema('column1 String, column2 UInt32, column3 Array(String)') FORMAT RawBLOB
```

結果:

```text
syntax = "proto3";

message Message
{
    bytes column1 = 1;
    uint32 column2 = 2;
    repeated bytes column3 = 3;
}
```

クエリ:

```sql
SELECT structureToProtobufSchema('column1 Nullable(String), column2 Tuple(element1 UInt32, element2 Array(String)), column3 Map(String, String)') FORMAT RawBLOB
```

結果:

```text
syntax = "proto3";

message Message
{
    bytes column1 = 1;
    message Column2
    {
        uint32 element1 = 1;
        repeated bytes element2 = 2;
    }
    Column2 column2 = 2;
    map<string, bytes> column3 = 3;
}
```

クエリ:

```sql
SELECT structureToProtobufSchema('column1 String, column2 UInt32', 'Root') FORMAT RawBLOB
```

結果:

```text
syntax = "proto3";

message Root
{
    bytes column1 = 1;
    uint32 column2 = 2;
}
```
## formatQuery {#formatquery}

指定されたSQLクエリのフォーマット済みのバージョンを返します。これは、複数行になる可能性があります。

クエリが正しくない場合は例外がスローされます。その代わりに`NULL`を返すには、関数`formatQueryOrNull()`を使用できます。

**構文**

```sql
formatQuery(query)
formatQueryOrNull(query)
```

**引数**

- `query` - フォーマットするSQLクエリ。[String](../data-types/string.md)

**返される値**

- フォーマットされたクエリ。[String](../data-types/string.md)。

**例**

```sql
SELECT formatQuery('select a,    b FRom tab WHERE a > 3 and  b < 3');
```

結果:

```result
┌─formatQuery('select a,    b FRom tab WHERE a > 3 and  b < 3')─┐
│ SELECT
    a,
    b
FROM tab
WHERE (a > 3) AND (b < 3)            │
└───────────────────────────────────────────────────────────────┘
```
## formatQuerySingleLine {#formatquerysingleline}

formatQuery()に似ていますが、返されるフォーマット済みの文字列には改行が含まれていません。

クエリが正しくない場合は例外がスローされます。その代わりに`NULL`を返すには、関数`formatQuerySingleLineOrNull()`を使用できます。

**構文**

```sql
formatQuerySingleLine(query)
formatQuerySingleLineOrNull(query)
```

**引数**

- `query` - フォーマットするSQLクエリ。[String](../data-types/string.md)

**返される値**

- フォーマットされたクエリ。[String](../data-types/string.md)。

**例**

```sql
SELECT formatQuerySingleLine('select a,    b FRom tab WHERE a > 3 and  b < 3');
```

結果:

```result
┌─formatQuerySingleLine('select a,    b FRom tab WHERE a > 3 and  b < 3')─┐
│ SELECT a, b FROM tab WHERE (a > 3) AND (b < 3)                          │
└─────────────────────────────────────────────────────────────────────────┘
```
## variantElement {#variantelement}

`Variant`カラムから指定された型のカラムを抽出します。

**構文**

```sql
variantElement(variant, type_name, [, default_value])
```

**引数**

- `variant` — Variantカラム。[Variant](../data-types/variant.md)。
- `type_name` — 抽出するバリアント型の名前。[String](../data-types/string.md)。
- `default_value` - 指定された型のバリアントが存在しない場合に使用されるデフォルト値。任意の型を指定できます。オプション。

**返される値**

- 指定された型の `Variant` カラムのサブカラム。

**例**

```sql
CREATE TABLE test (v Variant(UInt64, String, Array(UInt64))) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT v, variantElement(v, 'String'), variantElement(v, 'UInt64'), variantElement(v, 'Array(UInt64)') FROM test;
```

```text
┌─v─────────────┬─variantElement(v, 'String')─┬─variantElement(v, 'UInt64')─┬─variantElement(v, 'Array(UInt64)')─┐
│ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ                        │                        ᴺᵁᴸᴸ │ []                                 │
│ 42            │ ᴺᵁᴸᴸ                        │                          42 │ []                                 │
│ Hello, World! │ Hello, World!               │                        ᴺᵁᴸᴸ │ []                                 │
│ [1,2,3]       │ ᴺᵁᴸᴸ                        │                        ᴺᵁᴸᴸ │ [1,2,3]                            │
└───────────────┴─────────────────────────────┴─────────────────────────────┴────────────────────────────────────┘
```
## variantType {#varianttype}

`Variant`カラムの各行に対してバリアント型名を返します。行がNULLの場合は`'None'`を返します。

**構文**

```sql
variantType(variant)
```

**引数**

- `variant` — Variantカラム。[Variant](../data-types/variant.md)。

**返される値**

- 各行のバリアント型名を持つEnum8カラム。

**例**

```sql
CREATE TABLE test (v Variant(UInt64, String, Array(UInt64))) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT variantType(v) FROM test;
```

```text
┌─variantType(v)─┐
│ None           │
│ UInt64         │
│ String         │
│ Array(UInt64)  │
└────────────────┘
```

```sql
SELECT toTypeName(variantType(v)) FROM test LIMIT 1;
```

```text
┌─toTypeName(variantType(v))──────────────────────────────────────────┐
│ Enum8('None' = -1, 'Array(UInt64)' = 0, 'String' = 1, 'UInt64' = 2) │
└─────────────────────────────────────────────────────────────────────┘
```
## minSampleSizeConversion {#minsamplesizeconversion}

2つのサンプルにおけるコンバージョン（比率）を比較するA/Bテストのための最小限のサンプルサイズを計算します。

**構文**

```sql
minSampleSizeConversion(baseline, mde, power, alpha)
```

[この記事](https://towardsdatascience.com/required-sample-size-for-a-b-testing-6f6608dd330a)で説明されている数式を使用します。治療群と対照群のサイズが等しいと仮定します。グループの1回あたり必要なサンプルサイズを返します（つまり、実験全体に必要なサンプルサイズは返された値の2倍です）。

**引数**

- `baseline` — 基準コンバージョン。[Float](../data-types/float.md)。
- `mde` — 最小検出効果（MDE）をパーセンテージポイントとして指定します（例：基準コンバージョン0.25の場合、MDE0.03は0.25 ± 0.03への変化を意味します）。[Float](../data-types/float.md)。
- `power` — テストの必要な統計的パワー（1 - 第II種エラーの確率）。[Float](../data-types/float.md)。
- `alpha` — テストの必要な有意水準（第I種エラーの確率）。[Float](../data-types/float.md)。

**返される値**

3つの要素を持つ名前付き[Tuple](../data-types/tuple.md):

- `"minimum_sample_size"` — 必要なサンプルサイズ。[Float64](../data-types/float.md)。
- `"detect_range_lower"` — 指定された必要なサンプルサイズでは検出不可能な範囲の下限（つまり`"detect_range_lower"`以下のすべての値は指定された`alpha`および`power`で検出可能です）。`baseline - mde`として計算されます。[Float64](../data-types/float.md)。
- `"detect_range_upper"` — 指定された必要なサンプルサイズでは検出不可能な範囲の上限（つまり`"detect_range_upper"`以上のすべての値は指定された`alpha`および`power`で検出可能です）。`baseline + mde`として計算されます。[Float64](../data-types/float.md)。

**例**

次のクエリは、基準コンバージョン25%、MDE3%、有意水準5%、望ましい統計的パワー80%を持つA/Bテストのための必要なサンプルサイズを計算します。

```sql
SELECT minSampleSizeConversion(0.25, 0.03, 0.80, 0.05) AS sample_size;
```

結果:

```text
┌─sample_size───────────────────┐
│ (3396.077603219163,0.22,0.28) │
└───────────────────────────────┘
```
## minSampleSizeContinuous {#minsamplesizecontinuous}

2つのサンプルで連続した指標の平均を比較するためのA/Bテストに必要な最小サンプルサイズを計算します。

**構文**

```sql
minSampleSizeContinous(baseline, sigma, mde, power, alpha)
```

別名: `minSampleSizeContinous`

[この記事](https://towardsdatascience.com/required-sample-size-for-a-b-testing-6f6608dd330a)で説明されている数式を使用します。治療群と対照群のサイズが等しいと仮定します。グループの1回あたり必要なサンプルサイズを返します（つまり、実験全体に必要なサンプルサイズは返された値の2倍です）。また、治療群と対照群でテスト指標の分散が等しいと仮定します。

**引数**

- `baseline` — 指標の基準値。[Integer](../data-types/int-uint.md) または [Float](../data-types/float.md)。
- `sigma` — 指標の基準標準偏差。[Integer](../data-types/int-uint.md) または [Float](../data-types/float.md)。
- `mde` — 基準値のパーセンテージとしての最小検出効果（MDE）（例：基準値112.25の場合、MDE0.03は112.25 ± 112.25\*0.03の変化を意味します）。[Integer](../data-types/int-uint.md) または [Float](../data-types/float.md)。
- `power` — テストの必要な統計的パワー（1 - 第II種エラーの確率）。[Integer](../data-types/int-uint.md) または [Float](../data-types/float.md)。
- `alpha` — テストの必要な有意水準（第I種エラーの確率）。[Integer](../data-types/int-uint.md) または [Float](../data-types/float.md)。

**返される値**

3つの要素を持つ名前付き[Tuple](../data-types/tuple.md):

- `"minimum_sample_size"` — 必要なサンプルサイズ。[Float64](../data-types/float.md)。
- `"detect_range_lower"` — 指定された必要なサンプルサイズでは検出不可能な範囲の下限（つまり`"detect_range_lower"`以下のすべての値は指定された`alpha`および`power`で検出可能です）。`baseline * (1 - mde)`として計算されます。[Float64](../data-types/float.md)。
- `"detect_range_upper"` — 指定された必要なサンプルサイズでは検出不可能な範囲の上限（つまり`"detect_range_upper"`以上のすべての値は指定された`alpha`および`power`で検出可能です）。`baseline * (1 + mde)`として計算されます。[Float64](../data-types/float.md)。

**例**

次のクエリは、基準値112.25、標準偏差21.1、MDE3%、有意水準5%、望ましい統計的パワー80%を持つ指標のA/Bテストに必要なサンプルサイズを計算します。

```sql
SELECT minSampleSizeContinous(112.25, 21.1, 0.03, 0.80, 0.05) AS sample_size;
```

結果:

```text
┌─sample_size───────────────────────────┐
│ (616.2931945826209,108.8825,115.6175) │
└───────────────────────────────────────┘
```
## connectionId {#connectionid}

現在のクエリを提出したクライアントの接続IDを取得し、UInt64整数として返します。

**構文**

```sql
connectionId()
```

別名: `connection_id`.

**パラメータ**

なし。

**返される値**

現在の接続ID。[UInt64](../data-types/int-uint.md)。

**実装の詳細**

この関数はデバッグシナリオやMySQLハンドラ内での内部目的で最も有用です。MySQLの`CONNECTION_ID`関数との互換性のために作成されました。通常のプロダクションクエリでは一般的に使用されません。

**例**

クエリ:

```sql
SELECT connectionId();
```

```response
0
```
## getClientHTTPHeader {#getclienthttpheader}

HTTPヘッダーの値を取得します。

そのようなヘッダーが存在しないか、現在のリクエストがHTTPインターフェース経由で実行されていない場合、この関数は空の文字列を返します。
特定のHTTPヘッダー（例：`Authentication`や`X-ClickHouse-*`）には制限があります。

この関数を使用するには、設定`allow_get_client_http_header`を有効にする必要があります。
セキュリティ上の理由から、この設定はデフォルトでは有効になっていません。`Cookie`など、一部のヘッダーには機密情報が含まれている可能性があるためです。

この関数では、HTTPヘッダーは大文字と小文字を区別します。

この関数が分散クエリのコンテキストで使用される場合、イニシエーターノードでのみ非空の結果が返されます。
## showCertificate {#showcertificate}

現在のサーバーのSSL証明書に関する情報を表示します。SSL証明書が構成されている場合に限ります。接続を検証するためにOpenSSL証明書を使用するようにClickHouseを構成する方法については、[SSL-TLSの設定](/guides/sre/configuring-ssl)を参照してください。

**構文**

```sql
showCertificate()
```

**返される値**

- 構成されたSSL証明書に関連するキーと値のペアのマップ。[Map](../data-types/map.md)([String](../data-types/string.md), [String](../data-types/string.md))。

**例**

クエリ:

```sql
SELECT showCertificate() FORMAT LineAsString;
```

結果:

```response
{'version':'1','serial_number':'2D9071D64530052D48308473922C7ADAFA85D6C5','signature_algo':'sha256WithRSAEncryption','issuer':'/CN=marsnet.local CA','not_before':'May  7 17:01:21 2024 GMT','not_after':'May  7 17:01:21 2025 GMT','subject':'/CN=chnode1','pkey_algo':'rsaEncryption'}
```
## lowCardinalityIndices {#lowcardinalityindices}

[LowCardinality](../data-types/lowcardinality.md)カラムの辞書における値の位置を返します。位置は1から始まります。LowCardinalityはパーツごとの辞書を持っているため、この関数は異なるパーツで同じ値に対して異なる位置を返すことがあります。

**構文**

```sql
lowCardinalityIndices(col)
```

**引数**

- `col` — ローカーダリティカラム。[LowCardinality](../data-types/lowcardinality.md)。

**返される値**

- 現在のパーツの辞書における値の位置。[UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
DROP TABLE IF EXISTS test;
CREATE TABLE test (s LowCardinality(String)) ENGINE = Memory;

-- 2つのパーツを作成:

INSERT INTO test VALUES ('ab'), ('cd'), ('ab'), ('ab'), ('df');
INSERT INTO test VALUES ('ef'), ('cd'), ('ab'), ('cd'), ('ef');

SELECT s, lowCardinalityIndices(s) FROM test;
```

結果:

```response
   ┌─s──┬─lowCardinalityIndices(s)─┐
1. │ ab │                        1 │
2. │ cd │                        2 │
3. │ ab │                        1 │
4. │ ab │                        1 │
5. │ df │                        3 │
   └────┴──────────────────────────┘
    ┌─s──┬─lowCardinalityIndices(s)─┐
 6. │ ef │                        1 │
 7. │ cd │                        2 │
 8. │ ab │                        3 │
 9. │ cd │                        2 │
10. │ ef │                        1 │
    └────┴──────────────────────────┘
```
## lowCardinalityKeys {#lowcardinalitykeys}

[LowCardinality](../data-types/lowcardinality.md)カラムの辞書の値を返します。ブロックが辞書のサイズよりも小さいか大きい場合、結果は切り捨てられるか、デフォルト値で拡張されます。LowCardinalityはパーツごとの辞書を持っているため、この関数は異なるパーツで異なる辞書の値を返すことがあります。

**構文**

```sql
lowCardinalityIndices(col)
```

**引数**

- `col` — ローカーダリティカラム。[LowCardinality](../data-types/lowcardinality.md)。

**返される値**

- 辞書のキー。[UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
DROP TABLE IF EXISTS test;
CREATE TABLE test (s LowCardinality(String)) ENGINE = Memory;

-- 2つのパーツを作成:

INSERT INTO test VALUES ('ab'), ('cd'), ('ab'), ('ab'), ('df');
INSERT INTO test VALUES ('ef'), ('cd'), ('ab'), ('cd'), ('ef');

SELECT s, lowCardinalityKeys(s) FROM test;
```

結果:

```response
   ┌─s──┬─lowCardinalityKeys(s)─┐
1. │ ef │                       │
2. │ cd │ ef                    │
3. │ ab │ cd                    │
4. │ cd │ ab                    │
5. │ ef │                       │
   └────┴───────────────────────┘
    ┌─s──┬─lowCardinalityKeys(s)─┐
 6. │ ab │                       │
 7. │ cd │ ab                    │
 8. │ ab │ cd                    │
 9. │ ab │ df                    │
10. │ df │                       │
    └────┴───────────────────────┘
```
## displayName {#displayname}

[config](/operations/configuration-files)から`display_name`の値を返します。設定されていない場合は、サーバーの完全修飾ドメイン名（FQDN）を返します。

**構文**

```sql
displayName()
```

**返される値**

- 設定からの`display_name`の値、設定されていない場合はサーバーのFQDN。[String](../data-types/string.md)。

**例**

`config.xml`で`display_name`を設定できます。たとえば、`display_name`が'production'に設定されているサーバーの例を取り上げます：

```xml
<!-- クリックハウスクライアントで表示される名前です。
     デフォルトでは、"production"を含むものはすべてクエリプロンプトで赤くハイライトされます。
-->
<display_name>production</display_name>
```

クエリ:

```sql
SELECT displayName();
```

結果:

```response
┌─displayName()─┐
│ production    │
└───────────────┘
```
## transactionID {#transactionid}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

[transaction](/guides/developer/transactional#transactions-commit-and-rollback)のIDを返します。

:::note
この関数は実験的機能セットの一部です。設定ファイルにこの設定を追加して実験的なトランザクションサポートを有効にします：
```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

詳細については、[トランザクションサポート（ACID）](/guides/developer/transactional#transactions-commit-and-rollback)のページを参照してください。
:::

**構文**

```sql
transactionID()
```

**返される値**

- `start_csn`、`local_tid`、および `host_id`からなるタプルを返します。[Tuple](../data-types/tuple.md)。

- `start_csn`: グローバルの連続番号で、このトランザクションが開始したときに見た最も新しいコミットタイムスタンプ。[UInt64](../data-types/int-uint.md)。
- `local_tid`: 特定の`start_csn`内でこのホストによって開始された各トランザクションに対して一意のローカル連続番号。[UInt64](../data-types/int-uint.md)。
- `host_id`: このトランザクションを開始したホストのUUID。[UUID](../data-types/uuid.md)。

**例**

クエリ:

```sql
BEGIN TRANSACTION;
SELECT transactionID();
ROLLBACK;
```

結果:

```response
┌─transactionID()────────────────────────────────┐
│ (32,34,'0ee8b069-f2bb-4748-9eae-069c85b5252b') │
└────────────────────────────────────────────────┘
```
## transactionLatestSnapshot {#transactionlatestsnapshot}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

読み取り可能な[transaction](/guides/developer/transactional#transactions-commit-and-rollback)の最新スナップショット（コミットシーケンス番号）を返します。

:::note
この関数は実験的機能セットの一部です。設定ファイルにこの設定を追加して実験的なトランザクションサポートを有効にします：

```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

詳細については、[トランザクションサポート（ACID）](/guides/developer/transactional#transactions-commit-and-rollback)のページを参照してください。
:::

**構文**

```sql
transactionLatestSnapshot()
```

**返される値**

- トランザクションの最新スナップショット（CSN）を返します。[UInt64](../data-types/int-uint.md)

**例**

クエリ:

```sql
BEGIN TRANSACTION;
SELECT transactionLatestSnapshot();
ROLLBACK;
```

結果:

```response
┌─transactionLatestSnapshot()─┐
│                          32 │
└─────────────────────────────┘
```
## transactionOldestSnapshot {#transactionoldestsnapshot}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

実行中の[transaction](/guides/developer/transactional#transactions-commit-and-rollback)に対して可視状態の最古のスナップショット（コミットシーケンス番号）を返します。

:::note
この関数は実験的機能セットの一部です。設定ファイルにこの設定を追加して実験的なトランザクションサポートを有効にします：

```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

詳細については、[トランザクションサポート（ACID）](/guides/developer/transactional#transactions-commit-and-rollback)のページを参照してください。
:::

**構文**

```sql
transactionOldestSnapshot()
```

**返される値**

- トランザクションの最古のスナップショット（CSN）を返します。[UInt64](../data-types/int-uint.md)

**例**

クエリ:

```sql
BEGIN TRANSACTION;
SELECT transactionLatestSnapshot();
ROLLBACK;
```

結果:

```response
┌─transactionOldestSnapshot()─┐
│                          32 │
└─────────────────────────────┘
```
## getSubcolumn {#getsubcolumn}

テーブル式または識別子とサブカラムの名前を持つ定数文字列を受け取り、要求されたサブカラムを抽出して返します。

**構文**

```sql
getSubcolumn(col_name, subcol_name)
```

**引数**

- `col_name` — テーブル式または識別子。[Expression](../syntax.md/#expressions), [Identifier](../syntax.md/#identifiers)。
- `subcol_name` — サブカラムの名前。[String](../data-types/string.md)。

**返される値**

- 抽出されたサブカラムを返します。

**例**

クエリ:

```sql
CREATE TABLE t_arr (arr Array(Tuple(subcolumn1 UInt32, subcolumn2 String))) ENGINE = MergeTree ORDER BY tuple();
INSERT INTO t_arr VALUES ([(1, 'Hello'), (2, 'World')]), ([(3, 'This'), (4, 'is'), (5, 'subcolumn')]);
SELECT getSubcolumn(arr, 'subcolumn1'), getSubcolumn(arr, 'subcolumn2') FROM t_arr;
```

結果:

```response
   ┌─getSubcolumn(arr, 'subcolumn1')─┬─getSubcolumn(arr, 'subcolumn2')─┐
1. │ [1,2]                           │ ['Hello','World']               │
2. │ [3,4,5]                         │ ['This','is','subcolumn']       │
   └─────────────────────────────────┴─────────────────────────────────┘
```
## getTypeSerializationStreams {#gettypeserializationstreams}

データ型のシリアルストリームのパスを列挙します。

:::note
この関数は開発者向けに設計されています。
:::

**構文**

```sql
getTypeSerializationStreams(col)
```

**引数**

- `col` — データ型を検出するためのカラムまたはデータ型の文字列表現。

**返される値**

- すべてのシリアルストリームのサブストリームパスを持つ配列を返します。[Array](../data-types/array.md)([String](../data-types/string.md))。

**例**

クエリ:

```sql
SELECT getTypeSerializationStreams(tuple('a', 1, 'b', 2));
```

結果:

```response
   ┌─getTypeSerializationStreams(('a', 1, 'b', 2))─────────────────────────────────────────────────────────────────────────┐
1. │ ['{TupleElement(1), Regular}','{TupleElement(2), Regular}','{TupleElement(3), Regular}','{TupleElement(4), Regular}'] │
   └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

クエリ:

```sql
SELECT getTypeSerializationStreams('Map(String, Int64)');
```

結果:

```response
   ┌─getTypeSerializationStreams('Map(String, Int64)')────────────────────────────────────────────────────────────────┐
1. │ ['{ArraySizes}','{ArrayElements, TupleElement(keys), Regular}','{ArrayElements, TupleElement(values), Regular}'] │
   └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
## globalVariable {#globalvariable}

定数文字列引数を受け取り、その名前のグローバル変数の値を返します。この関数はMySQLとの互換性のために設計されており、通常のClickHouseの操作には必要ないか、役に立ちません。定義されているダミーのグローバル変数はほんの数個です。

**構文**

```sql
globalVariable(name)
```

**引数**

- `name` — グローバル変数名。[String](../data-types/string.md)。

**返される値**

- 変数`name`の値を返します。

**例**

クエリ:

```sql
SELECT globalVariable('max_allowed_packet');
```

結果:

```response
┌─globalVariable('max_allowed_packet')─┐
│                             67108864 │
└──────────────────────────────────────┘
```
## getMaxTableNameLengthForDatabase {#getmaxtablenamelengthfordatabase}

指定されたデータベースにおける最長テーブル名を返します。

**構文**

```sql
getMaxTableNameLengthForDatabase(database_name)
```

**引数**

- `database_name` — 指定されたデータベースの名前。[String](../data-types/string.md)。

**返される値**

- 最長テーブル名の長さを返します。

**例**

クエリ:

```sql
SELECT getMaxTableNameLengthForDatabase('default');
```

結果:

```response
┌─getMaxTableNameLengthForDatabase('default')─┐
│                                         206 │
└─────────────────────────────────────────────┘
```
## getServerSetting {#getserversetting}

サーバー設定の現在の値を返します。

**構文**

```sql
getServerSetting('server_setting');
```

**パラメータ**

- `server_setting` — 設定名。[String](../data-types/string.md)。

**返される値**

- サーバー設定の現在の値。

**例**

```sql
SELECT getServerSetting('allow_use_jemalloc_memory');
```

結果:

```text
┌─getServerSetting('allow_use_jemalloc_memory')─┐
│ true                                          │
└───────────────────────────────────────────────┘
```
## getMergeTreeSetting {#getmergetreesetting}

マージツリー設定の現在の値を返します。

**構文**

```sql
getMergeTreeSetting('merge_tree_setting');
```

**パラメータ**

- `merge_tree_setting` — 設定名。[String](../data-types/string.md)。

**返される値**

- マージツリー設定の現在の値。

**例**

```sql
SELECT getMergeTreeSetting('index_granularity');
```

結果:

```text
┌─getMergeTree(index_granularity')─┐
│                     8192         │
└──────────────────────────────────┘
```
