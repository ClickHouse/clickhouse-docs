---
description: 'その他の関数に関するドキュメンテーション'
sidebar_label: 'その他'
sidebar_position: 140
slug: /sql-reference/functions/other-functions
title: 'その他の関数'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';

# その他の関数
## hostName {#hostname}

この関数が実行されたホストの名前を返します。関数がリモートサーバー（分散処理）で実行される場合、リモートサーバー名が返されます。
関数が分散テーブルのコンテキストで実行される場合、各シャードに関連する値を持つ通常のカラムが生成されます。そうでない場合、定数値を生成します。

**構文**

```sql
hostName()
```

**返される値**

- ホスト名。 [String](../data-types/string.md)。
## getMacro {#getMacro}

サーバー構成の [macros](../../operations/server-configuration-parameters/settings.md#macros) セクションから命名された値を返します。

**構文**

```sql
getMacro(name);
```

**引数**

- `name` — `<macros>` セクションから取得するマクロ名。 [String](/sql-reference/data-types/string)。

**返される値**

- 指定されたマクロの値。 [String](../data-types/string.md)。

**例**

サーバー構成ファイルの例 `<macros>` セクション：

```xml
<macros>
    <test>Value</test>
</macros>
```

クエリ：

```sql
SELECT getMacro('test');
```

結果：

```text
┌─getMacro('test')─┐
│ Value            │
└──────────────────┘
```

同じ値は次のようにも取得できます：

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

別名: `fullHostName`, `FQDN`。

**返される値**

- 完全修飾ドメイン名を含む文字列。 [String](../data-types/string.md)。

**例**

```sql
SELECT FQDN();
```

結果：

```text
┌─FQDN()──────────────────────────┐
│ clickhouse.ru-central1.internal │
└─────────────────────────────────┘
```
## basename {#basename}

スラッシュまたはバックスラッシュの最後の部分に続く文字列のテールを抽出します。この関数は、パスからファイル名を抽出するために頻繁に使用されます。

```sql
basename(expr)
```

**引数**

- `expr` — [String](../data-types/string.md) 型の値。バックスラッシュはエスケープする必要があります。

**返される値**

入力文字列の以下を含む文字列：

- 最後のスラッシュまたはバックスラッシュの後の入力文字列のテール。入力文字列がスラッシュまたはバックスラッシュで終わる場合（例：`/` または `c:\`）、関数は空の文字列を返します。
- スラッシュまたはバックスラッシュがない場合は元の文字列。

**例**

クエリ：

```sql
SELECT 'some/long/path/to/file' AS a, basename(a)
```

結果：

```text
┌─a──────────────────────┬─basename('some\\long\\path\\to\\file')─┐
│ some\long\path\to\file │ file                                   │
└────────────────────────┴────────────────────────────────────────┘
```

クエリ：

```sql
SELECT 'some\\long\\path\\to\\file' AS a, basename(a)
```

結果：

```text
┌─a──────────────────────┬─basename('some\\long\\path\\to\\file')─┐
│ some\long\path\to\file │ file                                   │
└────────────────────────┴────────────────────────────────────────┘
```

クエリ：

```sql
SELECT 'some-file-name' AS a, basename(a)
```

結果：

```text
┌─a──────────────┬─basename('some-file-name')─┐
│ some-file-name │ some-file-name             │
└────────────────┴────────────────────────────┘
```
## visibleWidth {#visiblewidth}

値をテキスト形式（タブ区切り）でコンソールに出力する際の近似幅を計算します。
この関数は、[Pretty formats](../../interfaces/formats.md)を実装するためにシステムによって使用されます。

`NULL` は、`Pretty` フォーマット内の `NULL` に対応する文字列として表現されます。

**構文**

```sql
visibleWidth(x)
```

**例**

クエリ：

```sql
SELECT visibleWidth(NULL)
```

結果：

```text
┌─visibleWidth(NULL)─┐
│                  4 │
└────────────────────┘
```
## toTypeName {#totypename}

渡された引数の型名を返します。

`NULL` が渡されると、関数は `Nullable(Nothing)` 型を返します。これは ClickHouse の内部での `NULL` 表現に対応します。

**構文**

```sql
toTypeName(value)
```

**引数**

- `value` — 任意の型の値。

**返される値**

- 入力値のデータ型名。 [String](../data-types/string.md)。

**例**

クエリ：

```sql
SELECT toTypeName(123);
```

結果：

```response
┌─toTypeName(123)─┐
│ UInt8           │
└─────────────────┘
```
## blockSize {#blockSize}

ClickHouseでは、クエリは [blocks](/development/architecture#block)（チャンク）で処理されます。
この関数は、関数が呼び出されるブロックのサイズ（行数）を返します。

**構文**

```sql
blockSize()
```

**例**

クエリ：

```sql
DROP TABLE IF EXISTS test;
CREATE TABLE test (n UInt8) ENGINE = Memory;

INSERT INTO test
SELECT * FROM system.numbers LIMIT 5;

SELECT blockSize()
FROM test;
```

結果：

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

メモリ内の引数の非圧縮バイトサイズの見積もりを返します。

**構文**

```sql
byteSize(argument [, ...])
```

**引数**

- `argument` — 値。

**返される値**

- メモリ内の引数のバイトサイズの見積もり。 [UInt64](../data-types/int-uint.md)。

**例**

[String](../data-types/string.md) 引数の場合、関数は文字列の長さ + 9（終端ゼロ + 長さ）を返します。

クエリ：

```sql
SELECT byteSize('string');
```

結果：

```text
┌─byteSize('string')─┐
│                 15 │
└────────────────────┘
```

クエリ：

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

結果：

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

関数に複数の引数がある場合、関数はそれらのバイトサイズを累積します。

クエリ：

```sql
SELECT byteSize(NULL, 1, 0.3, '');
```

結果：

```text
┌─byteSize(NULL, 1, 0.3, '')─┐
│                         19 │
└────────────────────────────┘
```
## materialize {#materialize}

定数を単一値を含む完全なカラムに変換します。
完全なカラムと定数は、メモリ内で異なる方法で表現されます。
関数は通常、通常の引数と定数引数に対して異なるコードを実行しますが、結果は通常同じであるべきです。
この関数は、この動作をデバッグするために使用できます。

**構文**

```sql
materialize(x)
```

**パラメータ**

- `x` — 定数。 [Constant](overview.md/#constants)。

**返される値**

- 単一値 `x` を含むカラム。

**例**

次の例では、`countMatches` 関数は定数の第2引数を期待します。
この動作は、`materialize` 関数を使用して定数を完全なカラムに変換することによってデバッグできます。
非定数引数に対して関数がエラーを投げることを確認します。

クエリ：

```sql
SELECT countMatches('foobarfoo', 'foo');
SELECT countMatches('foobarfoo', materialize('foo'));
```

結果：

```response
2
Code: 44. DB::Exception: Received from localhost:9000. DB::Exception: Illegal type of argument #2 'pattern' of function countMatches, expected constant String, got String
```
## ignore {#ignore}

任意の引数を受け取り、無条件に `0` を返します。
引数は内部的に評価されますが、ベンチマークなどに便利です。

**構文**

```sql
ignore([arg1[, arg2[, ...]])
```

**引数**

- 任意の型の任意の数の引数を受け入れ、`NULL` も含まれます。

**返される値**

- `0` を返します。

**例**

クエリ：

```sql
SELECT ignore(0, 'ClickHouse', NULL);
```

結果：

```response
┌─ignore(0, 'ClickHouse', NULL)─┐
│                             0 │
└───────────────────────────────┘
```
## sleep {#sleep}

クエリの実行に遅延や休止を導入するために使用されます。主にテストやデバッグ目的で使用されます。

**構文**

```sql
sleep(seconds)
```

**引数**

- `seconds`: [UInt*](../data-types/int-uint.md) または [Float](../data-types/float.md) クエリの実行を中断する秒数、最大3秒まで。小数点値にすることで部分秒を指定できます。

**返される値**

この関数は返す値を持ちません。

**例**

```sql
SELECT sleep(2);
```

この関数は値を返しません。ただし、`clickhouse client` で関数を実行すると、次のような結果が表示されます：

```response
SELECT sleep(2)

Query id: 8aa9943e-a686-45e1-8317-6e8e3a5596ac

┌─sleep(2)─┐
│        0 │
└──────────┘

1 row in set. Elapsed: 2.012 sec.
```

このクエリは完了するまで2秒間一時停止します。この間、結果は返されず、クエリはハングしているまたは応答していないように見えることがあります。

**実装の詳細**

`sleep()` 関数は一般的に生産環境では使用されません。クエリのパフォーマンスやシステムの応答性に悪影響を及ぼす可能性があるからです。ただし、次のシナリオでは役立つことがあります：

1. **テスト**：ClickHouseをテストまたはベンチマークする場合、特定の条件下でシステムの挙動を観察するために遅延をシミュレートしたり、休止を導入したりすることが望ましい場合があります。
2. **デバッグ**：特定のポイントでシステムの状態やクエリの実行を調べる必要がある場合、`sleep()` を使用して一時停止し、関連情報を検査または収集できるようになります。
3. **シミュレーション**：外部システムやネットワークの遅延など、遅延や休止が発生する実世界の状況をシミュレートしたい場合もあります。

`sleep()` 関数は必要な場合に適切に使用し、パフォーマンスや応答性に影響を与える可能性があるため、注意が必要です。
## sleepEachRow {#sleepeachrow}

結果セット内の各行に対して指定された秒数クエリ実行を一時停止します。

**構文**

```sql
sleepEachRow(seconds)
```

**引数**

- `seconds`: [UInt*](../data-types/int-uint.md) または [Float*](../data-types/float.md) 各行に対してクエリ実行を一時停止する秒数、最大3秒まで。小数点値にすることで部分秒を指定できます。

**返される値**

この関数は受け取った同じ入力値を返し、変更しません。

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

しかし、出力は遅延し、各行の間に0.5秒の間隔があります。

`sleepEachRow()` 関数は、`sleep()` 関数と同様にテストやデバッグ目的で主に使用されます。各行の処理に遅延をシミュレートしたり、導入したりすることができるため、特定の条件下でClickHouseのパフォーマンスをテストまたはベンチマークする場合に役立ちます。

必要な場合に `sleepEachRow()` を適切に使用し、特に大きな結果セットの処理時に全体的なパフォーマンスや応答性に大きく影響を与える可能性があるため注意が必要です。
## currentDatabase {#currentdatabase}

現在のデータベースの名前を返します。
`CREATE TABLE` クエリ内でデータベースを指定する必要があるテーブルエンジンのパラメータで便利です。

**構文**

```sql
currentDatabase()
```

**返される値**

- 現在のデータベース名を返します。 [String](../data-types/string.md)。

**例**

クエリ：

```sql
SELECT currentDatabase()
```

結果：

```response
┌─currentDatabase()─┐
│ default           │
└───────────────────┘
```
## currentUser {#currentUser}

現在のユーザーの名前を返します。分散クエリの場合、クエリを開始したユーザーの名前が返されます。

**構文**

```sql
currentUser()
```

別名: `user()`, `USER()`, `current_user()`。別名は大文字と小文字を区別しません。

**返される値**

- 現在のユーザー名。 [String](../data-types/string.md)。
- 分散クエリでは、クエリを開始したユーザーのログイン。 [String](../data-types/string.md)。

**例**

```sql
SELECT currentUser();
```

結果：

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

別名: `current_schemas`。

**引数**

- `bool`: ブール値。 [Bool](../data-types/boolean.md)。

:::note
ブール引数は無視されます。これは、PostgreSQLにおけるこの関数の実装との互換性のためにだけ存在します。
:::

**返される値**

- 現在のデータベースの名前を持つ単一要素配列を返します。

**例**

```sql
SELECT currentSchemas(true);
```

結果：

```response
['default']
```
## isConstant {#isconstant}

引数が定数式であるかどうかを返します。

定数式とは、クエリ解析中に結果がわかる式のことです。すなわち、実行前です。例として、[リテラル](../../sql-reference/syntax.md#literals)を使った式は定数式です。

この関数は主に開発、デバッグ、およびデモンストレーションを意図しています。

**構文**

```sql
isConstant(x)
```

**引数**

- `x` — チェックする式。

**返される値**

- `x` が定数である場合 `1`。 [UInt8](../data-types/int-uint.md)。
- `x` が非定数である場合 `0`。 [UInt8](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT isConstant(x + 1) FROM (SELECT 43 AS x)
```

結果：

```text
┌─isConstant(plus(x, 1))─┐
│                      1 │
└────────────────────────┘
```

クエリ：

```sql
WITH 3.14 AS pi SELECT isConstant(cos(pi))
```

結果：

```text
┌─isConstant(cos(pi))─┐
│                   1 │
└─────────────────────┘
```

クエリ：

```sql
SELECT isConstant(number) FROM numbers(1)
```

結果：

```text
┌─isConstant(number)─┐
│                  0 │
└────────────────────┘
```
## hasColumnInTable {#hascolumnintable}

データベース名、テーブル名、およびカラム名を定数文字列として指定すると、指定されたカラムが存在すれば `1` を返し、そうでなければ `0` を返します。

**構文**

```sql
hasColumnInTable(\['hostname'\[, 'username'\[, 'password'\]\],\] 'database', 'table', 'column')
```

**パラメータ**

- `database` : データベース名。 [String literal](/sql-reference/syntax#string)
- `table` : テーブル名。 [String literal](/sql-reference/syntax#string)
- `column` : カラム名。 [String literal](/sql-reference/syntax#string)
- `hostname` : チェックを実行するリモートサーバー名。 [String literal](/sql-reference/syntax#string)
- `username` : リモートサーバーのユーザー名。 [String literal](/sql-reference/syntax#string)
- `password` : リモートサーバーのパスワード。 [String literal](/sql-reference/syntax#string)

**返される値**

- 指定されたカラムが存在すれば `1`。
- そうでなければ `0`。

**実装の詳細**

ネストされたデータ構造内の要素に対して、カラムの存在をチェックします。ネストされたデータ構造自体に対しては、関数は `0` を返します。

**例**

クエリ：

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

スレッドファズァが有効かどうかを返します。テストで実行時間が長すぎるのを防ぐために使用できます。

**構文**

```sql
hasThreadFuzzer();
```
## bar {#bar}

棒グラフを作成します。

`bar(x, min, max, width)` は、幅が `(x - min)` に比例し、`x = max` のときに幅が `width` 文字になるバンドを描画します。

**引数**

- `x` — 表示するサイズ。
- `min, max` — 整数定数。値は `Int64` に収まる必要があります。
- `width` — 定数、正の整数、小数点を含むことができます。

バンドは、シンボルの八分の一単位での精度で描画されます。

例：

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

明示的に定義された要素のマッピングに従って値を変換します。
この関数には2つのバリエーションがあります。
### transform(x, array_from, array_to, default) {#transformx-array_from-array_to-default}

`x` – 変換するもの。

`array_from` – 変換する定数の配列。

`array_to` – `from` の値を変換するための定数の配列。

`default` – `x` が `from` のいずれの値とも等しくない場合に使用する値。

`array_from` と `array_to` は同じ数の要素を持つ必要があります。

署名：

`x` が `array_from` の要素の1つと等しい場合、関数は `array_to` の対応する要素を返します。すなわち、同じ配列インデックスのものです。それ以外の場合は `default` を返します。`array_from` に複数の一致する要素が存在する場合、最初の要素に対応するものが返されます。

`transform(T, Array(T), Array(U), U) -> U`

`T` と `U` は数値、文字列、または Date または DateTime 型のいずれかです。
同じ文字（T または U）は、型が互換性があるべきことを示し、必ずしも等しくはないことを意味します。
たとえば、最初の引数は `Int64` 型であり、2番目の引数は `Array(UInt16)` 型であっても構いません。

例：

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

同様ですが、`default` 引数がありません。マッチが見つからない場合、`x` が返されます。

例：

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

サイズ（バイト数）を受け取り、可読性の高い、丸められたサイズに接尾辞（KB、MBなど）をつけて文字列として返します。

この関数の逆の操作は、[parseReadableSize](#parsereadablesize)、[parseReadableSizeOrZero](#parsereadablesizeorzero)、[parseReadableSizeOrNull](#parsereadablesizeornull) です。

**構文**

```sql
formatReadableDecimalSize(x)
```

**例**

クエリ：

```sql
SELECT
    arrayJoin([1, 1024, 1024*1024, 192851925]) AS filesize_bytes,
    formatReadableDecimalSize(filesize_bytes) AS filesize
```

結果：

```text
┌─filesize_bytes─┬─filesize───┐
│              1 │ 1.00 B     │
│           1024 │ 1.02 KB   │
│        1048576 │ 1.05 MB   │
│      192851925 │ 192.85 MB │
└────────────────┴────────────┘
```
## formatReadableSize {#formatreadablesize}

サイズ（バイト数）を受け取り、可読性の高い、丸められたサイズに接尾辞（KiB、MiBなど）をつけて文字列として返します。

この関数の逆の操作は、[parseReadableSize](#parsereadablesize)、[parseReadableSizeOrZero](#parsereadablesizeorzero)、[parseReadableSizeOrNull](#parsereadablesizeornull) です。

**構文**

```sql
formatReadableSize(x)
```
別名: `FORMAT_BYTES`。

:::note
この関数は任意の数値型を入力として受け入れますが、内部では Float64 にキャストされます。大きな値の場合、結果は最適でない可能性があります。
:::

**例**

クエリ：

```sql
SELECT
    arrayJoin([1, 1024, 1024*1024, 192851925]) AS filesize_bytes,
    formatReadableSize(filesize_bytes) AS filesize
```

結果：

```text
┌─filesize_bytes─┬─filesize───┐
│              1 │ 1.00 B     │
│           1024 │ 1.00 KiB   │
│        1048576 │ 1.00 MiB   │
│      192851925 │ 183.92 MiB │
└────────────────┴────────────┘
```
## formatReadableQuantity {#formatreadablequantity}

数値を受け取り、丸められた数値に接尾辞（千、百万、十億など）をつけて文字列として返します。

**構文**

```sql
formatReadableQuantity(x)
```

:::note
この関数は任意の数値型を入力として受け入れますが、内部では Float64 にキャストされます。大きな値の場合、結果は最適でない可能性があります。
:::

**例**

クエリ：

```sql
SELECT
    arrayJoin([1024, 1234 * 1000, (4567 * 1000) * 1000, 98765432101234]) AS number,
    formatReadableQuantity(number) AS number_for_humans
```

結果：

```text
┌─────────number─┬─number_for_humans─┐
│           1024 │ 1.02 thousand     │
│        1234000 │ 1.23 million      │
│     4567000000 │ 4.57 billion      │
│ 98765432101234 │ 98.77 trillion    │
└────────────────┴───────────────────┘
```
## formatReadableTimeDelta {#formatreadabletimedelta}

時間間隔（秒）を受け取り、この関数は年/月/日/時間/分/秒/ミリ秒/マイクロ秒/ナノ秒の文字列として返します。

**構文**

```sql
formatReadableTimeDelta(column[, maximum_unit, minimum_unit])
```

:::note
この関数は任意の数値型を入力として受け入れますが、内部では Float64 にキャストされます。大きな値の場合、結果は最適でない可能性があります。
:::

**引数**

- `column` — 数値の時間間隔を含むカラム。
- `maximum_unit` — オプション。表示する最大単位。
  - 受け入れ可能な値: `nanoseconds`, `microseconds`, `milliseconds`, `seconds`, `minutes`, `hours`, `days`, `months`, `years`。
  - デフォルト値: `years`。
- `minimum_unit` — オプション。表示する最小単位。すべての小さい単位は切り捨てられます。
  - 受け入れ可能な値: `nanoseconds`, `microseconds`, `milliseconds`, `seconds`, `minutes`, `hours`, `days`, `months`, `years`。
  - 明示的に指定された値が `maximum_unit` より大きい場合、例外がスローされます。
  - デフォルト値: `maximum_unit` が `seconds` 以上の場合は `seconds`、それ以外の場合は `nanoseconds`。

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

バイトサイズと `B`、`KiB`、`KB`、`MiB`、`MB` などの単位を含む文字列を受け取り、この関数は対応するバイト数を返します。  
この関数が入力値を解析できない場合、例外をスローします。

この関数の逆の操作は、[formatReadableSize](#formatreadablesize) および [formatReadableDecimalSize](#formatreadabledecimalsize) です。

**構文**

```sql
parseReadableSize(x)
```

**引数**

- `x` : ISO/IEC 80000-13 または小数バイト単位を使用した可読サイズ （[String](../../sql-reference/data-types/string.md)）。

**返される値**

- バイト数、四捨五入されて最も近い整数に rounded（[UInt64](../../sql-reference/data-types/int-uint.md)）。

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

バイトサイズと `B`、`KiB`、`KB`、`MiB`、`MB` などの単位を含む文字列を受け取り、この関数は対応するバイト数を返します。  
この関数が入力値を解析できない場合、`NULL` を返します。

この関数の逆の操作は、[formatReadableSize](#formatreadablesize) および [formatReadableDecimalSize](#formatreadabledecimalsize) です。

**構文**

```sql
parseReadableSizeOrNull(x)
```

**引数**

- `x` : ISO/IEC 80000-13  または小数バイト単位を使用した可読サイズ （[String](../../sql-reference/data-types/string.md)）。

**返される値**

- バイト数、四捨五入されて最も近い整数に rounded、または解析できない場合は NULL（Nullable([UInt64](../../sql-reference/data-types/int-uint.md)））。

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

バイトサイズと `B`、`KiB`、`KB`、`MiB`、`MB` などの単位を含む文字列を受け取り、この関数は対応するバイト数を返します。  
この関数が入力値を解析できない場合、`0` を返します。

この関数の逆の操作は、[formatReadableSize](#formatreadablesize) および [formatReadableDecimalSize](#formatreadabledecimalsize) です。

**構文**

```sql
parseReadableSizeOrZero(x)
```

**引数**

- `x` : ISO/IEC 80000-13  または小数バイト単位を使用した可読サイズ （[String](../../sql-reference/data-types/string.md)）。

**返される値**

- バイト数、四捨五入されて最も近い整数に rounded、または入力を解析できない場合は `0` ([UInt64](../../sql-reference/data-types/int-uint.md))。

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

数字のシーケンスを解析し、時間の単位に似たものに続けます。

**構文**

```sql
parseTimeDelta(timestr)
```

**引数**

- `timestr` — 数字のシーケンスと時間単位に似たもの。

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

1つ以上の入力引数の中で最小の引数を返します。 `NULL` 引数は無視されます。

**構文**

```sql
least(a, b)
```

:::note
バージョン [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) では、`NULL` 値が無視されるように後方互換性のない変更が導入されました。それ以前は、引数の1つが `NULL` の場合、`NULL` を返していました。以前の動作を維持するには、設定 `least_greatest_legacy_null_behavior` （デフォルト: `false`）を `true` に設定してください。 
:::
## greatest {#greatest}

1つ以上の入力引数の中で最大の引数を返します。 `NULL` 引数は無視されます。

**構文**

```sql
greatest(a, b)
```

:::note
バージョン [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) では、`NULL` 値が無視されるように後方互換性のない変更が導入されました。それ以前は、引数の1つが `NULL` の場合、`NULL` を返していました。以前の動作を維持するには、設定 `least_greatest_legacy_null_behavior` （デフォルト: `false`）を `true` に設定してください。 
:::
## uptime {#uptime}

サーバーの稼働時間を秒単位で返します。
分散テーブルのコンテキストで実行された場合、この関数は各シャードに関連する値を持つ通常のカラムを生成します。そうでない場合は、一定の値を生成します。

**構文**

```sql
uptime()
```

**返される値**

- 秒単位の時間値。 [UInt32](../data-types/int-uint.md)。

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

ClickHouseの現在のバージョンを文字列で返します。形式は次の通りです。

- メジャーバージョン
- マイナーバージョン
- パッチバージョン
- 前回の安定リリースからのコミット数

```text
major_version.minor_version.patch_version.number_of_commits_since_the_previous_stable_release
```

分散テーブルのコンテキストで実行された場合、この関数は各シャードに関連する値を持つ通常のカラムを生成します。そうでない場合は、一定の値を生成します。

**構文**

```sql
version()
```

**引数**

なし。

**返される値**

- 現在のClickHouseのバージョン。 [String](../data-types/string).

**実装の詳細**

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

実行中のClickHouseサーバーバイナリによって生成されたビルドIDを返します。
分散テーブルのコンテキストで実行された場合、この関数は各シャードに関連する値を持つ通常のカラムを生成します。そうでない場合は、一定の値を生成します。

**構文**

```sql
buildId()
```
## blockNumber {#blocknumber}

行を含む[ブロック](../../development/architecture.md#block)の単調増加シーケンス番号を返します。
返されるブロック番号は、ベストエフォートで更新されます。つまり、完全に正確でない可能性があります。

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

`rowNumberInBlock` によって処理された各[ブロック](../../development/architecture.md#block)の現在の行番号を返します。
返される番号は、各ブロックごとに0から始まります。

**構文**

```sql
rowNumberInBlock()
```

**返される値**

- データブロック内の行の順序番号（0から始まる）。 [UInt64](../data-types/int-uint.md)。

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

`rowNumberInAllBlocks` で処理された各行に対して一意の行番号を返します。返される番号は0から始まります。

**構文**

```sql
rowNumberInAllBlocks()
```

**返される値**

- データブロック内の行の順序番号（0から始まる）。 [UInt64](../data-types/int-uint.md)。

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

リテラル、リテラルのシーケンス、および複雑なエイリアス（空白を含む、2桁を超える数字や36バイト以上のもの（UUIDなど））をプレースホルダー `?` で置き換えます。

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

リテラル、リテラルのシーケンスをプレースホルダー `?` で置き換えますが、複雑なエイリアス（空白を含む、2桁を超える数字や36バイト以上のもの（UUIDなど））は置き換えません。これにより、複雑なクエリログの分析がより良くなります。

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

リテラルの値を除いた同様のクエリに対して同一の64ビットハッシュ値を返します。クエリログの分析に役立ちます。

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

[normalizedQueryHash](#normalizedqueryhash) と同様に、リテラルの値を除いた同様のクエリに対して同一の64ビットハッシュ値を返しますが、ハッシュ前に複雑なエイリアス（空白を含む、2桁を超える数字や36バイト以上のもの（UUIDなど））をプレースホルダーで置き換えません。クエリログの分析に役立ちます。

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

指定されたオフセット前後の行にアクセスするウィンドウ関数。

**構文**

```sql
neighbor(column, offset[, default_value])
```

関数の結果は、影響を受けるデータブロックとブロック内のデータの順序に依存します。

:::note
現在処理中のデータブロック内の隣接行のみを返します。
このエラーしやすい動作のため、関数は廃止予定です。適切なウィンドウ関数を代わりに使用してください。
:::

`neighbor()` の計算中の行の順序は、ユーザーに返される行の順序とは異なる場合があります。
それを防ぐために、[ORDER BY](../../sql-reference/statements/select/order-by.md) を使用したサブクエリを作成し、サブクエリの外から関数を呼び出すことができます。

**引数**

- `column` — カラム名またはスカラ式。
- `offset` — `column` の現在の行の前または後の行数。 [Int64](../data-types/int-uint.md)。
- `default_value` — オプション。オフセットがブロックの境界を超えた場合に返される値。影響を受けるデータブロックの型。

**返される値**

- 現在の行から `offset` 距離の `column` の値。オフセットがブロックの境界を超えていない場合。
- オフセットがブロックの境界を超えている場合、`column` のデフォルト値または `default_value`（指定されている場合）。

:::note
返されるタイプは影響を受けるデータブロックのものかデフォルト値の型になります。
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

この関数は、前年同期比メトリックを計算するために使用できます。

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
最初の行には0が返され、それ以降の行には前の行との差が返されます。

:::note
現在処理中のデータブロック内の差のみを返します。
このエラーしやすい動作のため、関数は廃止予定です。適切なウィンドウ関数を代わりに使用してください。
:::

関数の結果は、影響を受けるデータブロックとブロック内のデータの順序に依存します。

`runningDifference()` の計算中の行の順序は、ユーザーに返される行の順序とは異なる場合があります。
それを防ぐために、[ORDER BY](../../sql-reference/statements/select/order-by.md) を使用したサブクエリを作成し、サブクエリの外から関数を呼び出すことができます。

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

ブロックサイズが結果に影響を与えることに注意してください。`runningDifference` の内部状態は新しいブロックごとにリセットされます。

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
この関数は廃止予定です（`runningDifference`に関するノートを参照）。
:::

[runningDifference](/sql-reference/functions/other-functions#runningDifference) と同様ですが、最初の行の値を最初の行の値として返します。
## runningConcurrency {#runningconcurrency}

同時イベントの数を計算します。
各イベントには開始時間と終了時間があります。開始時間はイベントに含まれますが、終了時間は除外されます。開始時間と終了時間のあるカラムは同じデータ型でなければなりません。
関数は各イベントの開始時間ごとにアクティブな（同時）イベントの合計数を計算します。

:::tip
イベントは開始時間で昇順にソートされている必要があります。この要件を満たさない場合、関数は例外を発生させます。すべてのデータブロックが個別に処理されます。異なるデータブロックのイベントが重なる場合、正しく処理されません。
:::

**構文**

```sql
runningConcurrency(start, end)
```

**引数**

- `start` — イベントの開始時間を持つカラム。 [Date](../data-types/date.md)、 [DateTime](../data-types/datetime.md)、または [DateTime64](../data-types/datetime64.md)。
- `end` — イベントの終了時間を持つカラム。 [Date](../data-types/date.md)、 [DateTime](../data-types/datetime.md)、または [DateTime64](../data-types/datetime64.md)。

**返される値**

- 各イベントの開始時間における同時イベントの数。 [UInt32](../data-types/int-uint.md)

**例**

次のテーブルを考えます。

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

UInt64番号をビッグエンディアン形式のMACアドレスとして解釈します。対応するMACアドレスを、形式AA:BB:CC:DD:EE:FF（コロン区切りの16進数形式の数）として文字列で返します。

**構文**

```sql
MACNumToString(num)
```
## MACStringToNum {#macstringtonum}

MACNumToStringの逆関数です。MACアドレスが無効な形式の場合、0を返します。

**構文**

```sql
MACStringToNum(s)
```
## MACStringToOUI {#macstringtooui}

形式AA:BB:CC:DD:EE:FF（コロンで区切られた16進数形式の数）のMACアドレスを受け取り、最初の3オクテットをUInt64番号として返します。MACアドレスが無効な形式の場合、0を返します。

**構文**

```sql
MACStringToOUI(s)
```
## getSizeOfEnumType {#getsizeofenumtype}

[Enum](../data-types/enum.md)内のフィールド数を返します。
タイプが `Enum` でない場合、例外がスローされます。

**構文**

```sql
getSizeOfEnumType(value)
```

**引数:**

- `value` — `Enum`型の値。

**返される値**

- `Enum`入力値のフィールド数。

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

圧縮を考慮せず、ディスク上のサイズを返します。

```sql
blockSerializedSize(value[, value[, ...]])
```

**引数**

- `value` — 任意の値。

**返される値**

- 圧縮なしの値のブロックをディスクに書き込むためのバイト数。

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

- `value` — 任意のタイプの値。

**返される値**

- `value`を表すために使用される内部データ型名。

**例**

`toTypeName` と `toColumnTypeName` の違い:

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

この例は、`DateTime` データ型が内部的に `Const(UInt32)` として保存されていることを示しています。
## dumpColumnStructure {#dumpcolumnstructure}

RAM内のデータ構造の詳細な説明を出力します。

```sql
dumpColumnStructure(value)
```

**引数:**

- `value` — 任意のタイプの値。

**返される値**

- `value`を表現するために使用されるカラム構造の説明。

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

ユーザーによって設定されたカスタムカラムのデフォルト値は含まれていません。

**構文**

```sql
defaultValueOfArgumentType(expression)
```

**引数:**

- `expression` — 任意のタイプの値または任意のタイプの値を結果としてもたらす式。

**返される値**

- 数字の場合は `0`。
- 文字列の場合は空文字列。
- [Nullable](../data-types/nullable.md)の場合は `ᴺᵁᴸᴸ`。

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

ユーザーによって設定されたカスタムカラムのデフォルト値は含まれていません。

```sql
defaultValueOfTypeName(type)
```

**引数:**

- `type` — 型名を示す文字列。

**返される値**

- 数字の場合は `0`。
- 文字列の場合は空文字列。
- [Nullable](../data-types/nullable.md)の場合は `ᴺᵁᴸᴸ`。

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

この関数はデバッグや内省を目的としています。引数を無視し、常に1を返します。引数は評価されません。

ただし、インデックス分析中、この関数の引数は `indexHint` でラップされていないと仮定されます。これにより、条件によるインデックス範囲内のデータを選択できますが、この条件によるさらなるフィルタリングはありません。ClickHouseのインデックスはスパースであり、`indexHint`を使用すると、同じ条件を直接指定する場合よりも多くのデータが得られます。

**構文**

```sql
SELECT * FROM table WHERE indexHint(<expression>)
```

**返される値**

- `1`。 [Uint8](../data-types/int-uint.md)。

**例**

次の例は、テーブル [ontime](../../getting-started/example-datasets/ontime.md) からのテストデータの例です。

テーブル:

```sql
SELECT count() FROM ontime
```

```text
┌─count()─┐
│ 4276457 │
└─────────┘
```

テーブルには `(FlightDate, (Year, FlightDate))` のフィールドにインデックスがあります。

インデックスを使用しないクエリを作成します:

```sql
SELECT FlightDate AS k, count() FROM ontime GROUP BY k ORDER BY k
```

ClickHouseはテーブル全体を処理しました（`Processed 4.28 million rows`）。

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

特定の日付を選択してインデックスを適用します:

```sql
SELECT FlightDate AS k, count() FROM ontime WHERE k = '2017-09-15' GROUP BY k ORDER BY k
```

ClickHouseは今度は、はるかに少ない行数（`Processed 32.74 thousand rows`）を処理します。

結果:

```text
┌──────────k─┬─count()─┐
│ 2017-09-15 │   16428 │
└────────────┴─────────┘
```

次に、式 `k = '2017-09-15'` を `indexHint` 関数でラップします:

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

ClickHouseは以前と同じようにインデックスを使用しました（`Processed 32.74 thousand rows`）。
式 `k = '2017-09-15'` は結果を生成する際に使用されませんでした。
この例では、`indexHint`関数を使用すると、隣接する日付を見ることができます。

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
この関数は、[arrayJoin](/sql-reference/functions/array-join)の内部実装に使用されます。
:::

**構文**

```sql
replicate(x, arr)
```

**引数**

- `x` — 結果配列を埋める値。
- `arr` — 配列。 [Array](../data-types/array.md)。

**返される値**

`arr`と同じ長さの配列で、値 `x` で埋められています。 [Array](../data-types/array.md)。

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

現在のClickHouse [サーバーのリビジョン](../../operations/system-tables/metrics#revision)を返します。

**構文**

```sql
revision()
```

**返される値**

- 現在のClickHouseサーバーのリビジョン。 [UInt32](../data-types/int-uint.md)。

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

データベースの永続性をホスティングしているファイルシステムの自由なスペースの量を返します。返される値は常に、オペレーティングシステムのために予約されたスペースよりも小さくなります（[filesystemUnreserved](#filesystemunreserved)を参照）。

**構文**

```sql
filesystemAvailable()
```

**返される値**

- バイト単位の残りのスペースの量。 [UInt64](../data-types/int-uint.md)。

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

データベースの永続性をホスティングしているファイルシステム上の自由なスペースの全体量を返します。 （以前は `filesystemFree`）。 [`filesystemAvailable`](#filesystemavailable) も参照してください。

**構文**

```sql
filesystemUnreserved()
```

**返される値**

- バイト単位の自由なスペースの量。 [UInt64](../data-types/int-uint.md)。

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

ファイルシステムの容量をバイト単位で返します。データディレクトリへの[パス](../../operations/server-configuration-parameters/settings.md#path)を構成する必要があります。

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

単一の値に基づいて集計関数の結果を計算します。この関数は、[-State](/sql-reference/aggregate-functions/combinators#-state)の集計関数を初期化するために使用できます。集計関数の状態を作成し、[AggregateFunction](/sql-reference/data-types/aggregatefunction)型のカラムに挿入するか、初期化された集計をデフォルト値として使用できます。

**構文**

```sql
initializeAggregation (aggregate_function, arg1, arg2, ..., argN)
```

**引数**

- `aggregate_function` — 初期化する集計関数の名前。 [String](../data-types/string.md)。
- `arg` — 集計関数の引数。

**返される値**

- 関数に渡される各行に対する集計結果。

戻り値の型は、`initializeAggregation` が最初の引数として受け取る関数の戻り値の型と同じです。

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

`AggregatingMergeTree`テーブルエンジンおよび `AggregateFunction`カラムの例:

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

**参照先**

- [arrayReduce](../../sql-reference/functions/array-functions.md#arrayreduce)
```
```yaml
title: 'aggregate関数を確定する'
sidebar_label: 'aggregate関数を確定する'
keywords: ['aggregate', 'functions', 'ClickHouse', 'SQL']
description: 'aggregate関数の状態を指定し、集計結果を取得します。'
```

## finalizeAggregation {#finalizeaggregation}

与えられた集計関数の状態に基づいて、この関数は集計結果（または [-State](/sql-reference/aggregate-functions/combinators#-state) 組み合わせ子を使用する場合の最終状態）を返します。

**構文**

```sql
finalizeAggregation(state)
```

**引数**

- `state` — 集計の状態。[AggregateFunction](/sql-reference/data-types/aggregatefunction).

**返される値**

- 集計された値。

:::note
返される型は、集計されたすべての型と同じです。
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

`NULL` 値は無視されることに注意してください。

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

組み合わせの例:

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

**参考**

- [arrayReduce](../../sql-reference/functions/array-functions.md#arrayreduce)
- [initializeAggregation](#initializeaggregation)

## runningAccumulate {#runningaccumulate}

データブロックの各行に対して集計関数の状態を累積します。

:::note
状態は各新しいデータブロックごとにリセットされます。
この動作はエラーを引き起こしやすいため、この関数は非推奨です。代わりに適切なウィンドウ関数を使用してください。
:::

**構文**

```sql
runningAccumulate(agg_state[, grouping]);
```

**引数**

- `agg_state` — 集計関数の状態。[AggregateFunction](/sql-reference/data-types/aggregatefunction).
- `grouping` — グルーピングキー。オプション。`grouping` 値が変更されると、関数の状態はリセットされます。等しい演算子が定義されている任意の [サポートされているデータ型](../data-types/index.md) であることができます。

**返される値**

- 各結果行は、すべての入力行に対して現在の位置まで累積された集計関数の結果を含みます。`runningAccumulate` は、各新しいデータブロックまたは `grouping` 値が変更されると状態をリセットします。

使用されている集計関数に応じて型が異なります。

**例**

`runningAccumulate` を使用してグループ化なしおよびグループ化ありの数値の累積合計を求める方法を考えてみます。

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

サブクエリは、`0` から `9` までの各数のために `sumState` を生成します。`sumState` は、単一の数の合計を含む [sum](../../sql-reference/aggregate-functions/reference/sum.md) 関数の状態を返します。

全体のクエリは次のことを行います。

1. 最初の行の場合、`runningAccumulate` は `sumState(0)` を取得し、`0` を返します。
2. 2番目の行の場合、関数は `sumState(0)` と `sumState(1)` をマージし、`sumState(0 + 1)` として `1` を結果として返します。
3. 3番目の行の場合、関数は `sumState(0 + 1)` と `sumState(2)` をマージし、`sumState(0 + 1 + 2)` として `3` を結果として返します。
4. この処理はブロックが終了するまで繰り返されます。

次の例は `grouping` パラメータの使用法を示します。

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

ご覧のとおり、`runningAccumulate` は各行のグループごとに状態をマージします。

## joinGet {#joinget}

この関数は、辞書のデータを抽出するのと同様に、テーブルからデータを抽出することを可能にします。[Join](../../engines/table-engines/special/join.md#creating-a-table) テーブルから指定された結合キーを使用してデータを取得します。

:::note
`ENGINE = Join(ANY, LEFT, <join_keys>)` ステートメントを使用して作成されたテーブルのみをサポートします。
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
識別子は、デフォルトデータベース内で検索されます（設定を参照 `default_database` ）。デフォルトデータベースをオーバーライドするには、`USE db_name` を使用するか、データベースとテーブルをセパレーター `db_name.db_table` を介して指定します（例を参照）。
:::

**返される値**

- キーのリストに対応する値のリストを返します。

:::note
特定のキーがソーステーブルに存在しない場合は、テーブル作成時の設定 [join_use_nulls](../../operations/settings/settings.md#join_use_nulls) に基づいて `0` または `null` が返されます。
`join_use_nulls` についての詳細は [Join 操作](../../engines/table-engines/special/join.md) にあります。
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

`join_use_nulls` 設定を使用すると、ソーステーブルにキーが存在しない場合に返される動作を変更できます。

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

[joinGet](#joinget) と同様ですが、キーが欠落している場合はデフォルト値の代わりに `NULL` を返します。

**構文**

```sql
joinGetOrNull(join_storage_table_name, `value_column`, join_keys)
```

**引数**

- `join_storage_table_name` — 検索が行われる場所を示す [識別子](/sql-reference/syntax#identifiers)。
- `value_column` — 必要なデータを含むテーブルのカラムの名前。
- `join_keys` — キーのリスト。

:::note
識別子は、デフォルトデータベース内で検索されます（設定を参照 `default_database` ）。デフォルトデータベースをオーバーライドするには、`USE db_name` を使用するか、データベースとテーブルをセパレーター `db_name.db_table` を介して指定します（例を参照）。
:::

**返される値**

- キーのリストに対応する値のリストを返します。

:::note
特定のキーがソーステーブルに存在しない場合、そのキーについては `NULL` が返されます。
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

外部の catboost モデルを評価します。[CatBoost](https://catboost.ai) は、Yandex によって開発された機械学習のためのオープンソースの勾配ブースティングライブラリです。
catboost モデルへのパスとモデル引数（特徴）を受け取り、Float64 を返します。

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

catboost モデルを評価する前に、`libcatboostmodel.<so|dylib>` ライブラリを利用可能にする必要があります。[CatBoost ドキュメント](https://catboost.ai/docs/concepts/c-plus-plus-api_dynamic-c-pluplus-wrapper.html) を参照してコンパイル方法を学んでください。

次に、ClickHouse 設定ファイルで `libcatboostmodel.<so|dylib>` へのパスを指定します:

```xml
<clickhouse>
...
    <catboost_lib_path>/path/to/libcatboostmodel.so</catboost_lib_path>
...
</clickhouse>
```

セキュリティと隔離の理由から、モデル評価はサーバープロセス内ではなく、clickhouse-library-bridge プロセス内で実行されます。
`catboostEvaluate()` の最初の実行時、サーバーはライブラリブリッジプロセスを開始します（もしすでに実行されていない場合）。両プロセスは HTTP インターフェースを介して通信します。デフォルトではポート `9012` が使用されます。他のサービスでポート `9012` がすでに使用されている場合は、以下のように別のポートを指定できます。

```xml
<library_bridge>
    <port>9019</port>
</library_bridge>
```

2. libcatboost を使用して catboost モデルをトレーニングする

トレーニングデータセットから catboost モデルをトレーニングし適用する方法は [Training and applying models](https://catboost.ai/docs/features/training.html#training) を参照してください。

## throwIf {#throwif}

引数 `x` が真の場合は例外をスローします。

**構文**

```sql
throwIf(x[, message[, error_code]])
```

**引数**

- `x` - チェックする条件。
- `message` - カスタムエラーメッセージを提供する定数文字列。オプション。
- `error_code` - カスタムエラーコードを提供する定数整数。オプション。

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

引数を返します。デバッグおよびテスト用で、インデックスの使用をキャンセルし、フルスキャンのクエリパフォーマンスを得ることを目的としています。インデックスの使用可能性についてクエリが分析されるとき、アナライザーは `identity` 関数内のすべてを無視します。また、定数の折りたたみを無効にします。

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

**パラメーター**

- `custom_setting` — 設定名。[String](../data-types/string.md).

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

**参考**

- [カスタム設定](/operations/settings/query-level#custom_settings)

## getSettingOrDefault {#getsettingordefault}

現在の [カスタム設定](/operations/settings/query-level#custom_settings) の値を返すか、第二引数で指定されたデフォルト値を返します。

**構文**

```sql
getSettingOrDefault('custom_setting', default_value);
```

**パラメーター**

- `custom_setting` — 設定名。[String](../data-types/string.md).
- `default_value` — custom_setting が現在のプロファイルで設定されていない場合に返す値。値はどのデータ型でも Null でも可能です。

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

**参考**

- [カスタム設定](/operations/settings/query-level#custom_settings)

## isDecimalOverflow {#isdecimaloverflow}

[Decimal](../data-types/decimal.md) 値がその精度を超えているか、指定された精度を超えているかをチェックします。

**構文**

```sql
isDecimalOverflow(d, [p])
```

**引数**

- `d` — 値。[Decimal](../data-types/decimal.md).
- `p` — 精度。オプション。省略した場合、最初の引数の初期精度が使用されます。このパラメータは、他のデータベースやファイルへのデータを移行するのに役立ちます。[UInt8](/sql-reference/data-types/int-uint#integer-ranges)。

**返される値**

- `1` — Decimal 値がその精度によって許可されている以上の桁数を持つ、
- `0` — Decimal 値が指定された精度を満たす。

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

値を表現するために必要な10進数の桁数を返します。

**構文**

```sql
countDigits(x)
```

**引数**

- `x` — [Int](../data-types/int-uint.md) または [Decimal](../data-types/decimal.md) 値。

**返される値**

- 桁数。[UInt8](/sql-reference/data-types/int-uint#integer-ranges)。

:::note
`Decimal` 値については、そのスケールを考慮します: 結果は基になる整数型の `(value * scale)` に対して計算されます。例えば: `countDigits(42) = 2`, `countDigits(42.000) = 5`, `countDigits(0.04200) = 4`。つまり、`countDecimal(x) > 18` で `Decimal64` の 10 進数オーバーフローを確認できます。これは [isDecimalOverflow](#isdecimaloverflow) の遅いバリアントです。
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

このサーバーがリッスンしている [ネイティブインターフェース](../../interfaces/tcp.md) TCP ポート番号を返します。
分散テーブルのコンテキストで実行されると、この関数は各シャードに関連する値を持つ通常のカラムを生成します。そうでなければ定数値を生成します。

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

**参考**

- [tcp_port](../../operations/server-configuration-parameters/settings.md#tcp_port)

## currentProfiles {#currentprofiles}

現在のユーザーに対する現在の [設定プロファイル](../../guides/sre/user-management/index.md#settings-profiles-management) のリストを返します。

コマンド [SET PROFILE](/sql-reference/functions/other-functions#currentprofiles) を使用して、現在の設定プロファイルを変更することができます。`SET PROFILE` コマンドが使用されていない場合、この関数は現在のユーザーの定義で指定されたプロファイルを返します（[CREATE USER](/sql-reference/statements/create/user) を参照）。

**構文**

```sql
currentProfiles()
```

**返される値**

- 現在のユーザーの設定プロファイルのリスト。[Array](../data-types/array.md)([String](../data-types/string.md))。

## enabledProfiles {#enabledprofiles}

現在のユーザーに明示的および暗黙的に割り当てられた設定プロファイルを返します。明示的に割り当てられたプロファイルは、[currentProfiles](#currentprofiles) 関数によって返されるものと同じです。暗黙的に割り当てられたプロファイルには、他の割り当てられたプロファイルの親プロファイル、付与されたロールによって割り当てられたプロファイル、独自の設定によって割り当てられたプロファイル、メインのデフォルトプロファイルが含まれます（メインサーバー設定ファイルの `default_profile` セクション参照）。

**構文**

```sql
enabledProfiles()
```

**返される値**

- 有効な設定プロファイルのリスト。[Array](../data-types/array.md)([String](../data-types/string.md))。

## defaultProfiles {#defaultprofiles}

現在のユーザーの定義で指定されたすべてのプロファイルを返します（[CREATE USER](/sql-reference/statements/create/user) ステートメントを参照）。

**構文**

```sql
defaultProfiles()
```

**返される値**

- デフォルトの設定プロファイルのリスト。[Array](../data-types/array.md)([String](../data-types/string.md))。

## currentRoles {#currentroles}

現在のユーザーに割り当てられたロールを返します。ロールは [SET ROLE](/sql-reference/statements/set-role) ステートメントによって変更できます。`SET ROLE` ステートメントが使用されていない場合、`currentRoles` 関数は `defaultRoles` と同じ結果を返します。

**構文**

```sql
currentRoles()
```

**返される値**

- 現在のユーザーの現在のロールのリスト。[Array](../data-types/array.md)([String](../data-types/string.md))。

## enabledRoles {#enabledroles}

現在のロールおよび一部の現在のロールに付与されたロールの名前を返します。

**構文**

```sql
enabledRoles()
```

**返される値**

- 現在のユーザーの有効なロールのリスト。[Array](../data-types/array.md)([String](../data-types/string.md))。

## defaultRoles {#defaultroles}

現在のユーザーがログイン時にデフォルトで有効になるロールを返します。最初はこれらはすべて、現在のユーザーに付与されたロールです（[GRANT](../../sql-reference/statements/grant.md#select) を参照）が、これを [SET DEFAULT ROLE](/sql-reference/statements/set-role#set-default-role) ステートメントで変更できます。

**構文**

```sql
defaultRoles()
```

**返される値**

- 現在のユーザーのデフォルトロールのリスト。[Array](../data-types/array.md)([String](../data-types/string.md))。

## getServerPort {#getserverport}

サーバーポート番号を返します。ポートがサーバーによって使用されていない場合は、例外をスローします。

**構文**

```sql
getServerPort(port_name)
```

**引数**

- `port_name` — サーバーポートの名前。[String](/sql-reference/data-types/string). 可能な値:

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

現在のクエリの ID を返します。クエリのその他のパラメータは [system.query_log](../../operations/system-tables/query_log.md) テーブルから `query_id` を介して抽出できます。

[initialQueryID](#initialqueryid) 関数とは異なり、`queryID` は異なるシャードで異なる結果を返すことがあります（例を参照）。

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

初期の現在のクエリの ID を返します。クエリのその他のパラメータは [system.query_log](../../operations/system-tables/query_log.md) テーブルから `initial_query_id` を介して抽出できます。

[queryID](/sql-reference/functions/other-functions#queryid) 関数とは異なり、`initialQueryID` は異なるシャードで同じ結果を返します（例を参照）。

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

[パーティションID](../../engines/table-engines/mergetree-family/custom-partitioning-key.md) を計算します。

:::note
この関数は遅く、大量の行に対して呼び出すべきではありません。
:::

**構文**

```sql
partitionID(x[, y, ...]);
```

**引数**

- `x` — パーティションIDを返すカラム。
- `y, ...` — パーティションIDを返す残りの N カラム（オプション）。

**返される値**

- 行が属するパーティション ID。[String](../data-types/string.md) 。

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

分散クエリでデータの一部を処理するシャードのインデックスを返します。インデックスは `1` から始まります。
クエリが分散されていない場合は、定数値 `0` が返されます。

**構文**

```sql
shardNum()
```

**返される値**

- シャードインデックスまたは定数 `0`。[UInt32](../data-types/int-uint.md)。

**例**

次の例では、2つのシャードで構成される構成が使用されています。クエリは [system.one](../../operations/system-tables/one.md) テーブル上で各シャードで実行されます。

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

**参考**

- [分散テーブルエンジン](../../engines/table-engines/special/distributed.md)

## shardCount {#shardcount}

分散クエリのためのシャードの総数を返します。クエリが分散されていない場合は、定数値 `0` が返されます。

**構文**

```sql
shardCount()
```

**返される値**

- シャードの総数または `0`。[UInt32](../data-types/int-uint.md)。

**参考**

- [shardNum()](#shardnum) 関数の例には `shardCount()` 関数呼び出しも含まれます。

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

- 現在の ZooKeeper セッションの稼働時間を秒単位で返します。[UInt32](../data-types/int-uint.md)。

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
```yaml
title: 'ランダムなテーブル構造を生成する'
sidebar_label: 'ランダムテーブル生成'
keywords: ['ランダムテーブル', 'テーブル構造', '生成']
description: 'ランダムなテーブル構造を生成するClickHouseの機能について説明します。'
```

## generateRandomStructure {#generaterandomstructure}

ランダムなテーブル構造を `column1_name column1_type, column2_name column2_type, ...` の形式で生成します。

**構文**

```sql
generateRandomStructure([number_of_columns, seed])
```

**引数**

- `number_of_columns` — 結果のテーブル構造で望ましいカラム数。0または`Null`に設定されると、カラム数は1から128の間でランダムになります。デフォルト値: `Null`。
- `seed` - 安定した結果を生成するためのランダムシード。シードが指定されていないか`Null`に設定された場合は、ランダムに生成されます。

すべての引数は定数でなければなりません。

**返される値**

- ランダムに生成されたテーブル構造。 [String](../data-types/string.md)。

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

**注意**: 複雑な型（Array, Tuple, Map, Nested）の最大ネスト深度は16に制限されています。

この関数は[generateRandom](../../sql-reference/table-functions/generate.md)と組み合わせて、完全にランダムなテーブルを生成するために使用できます。

## structureToCapnProtoSchema {#structure_to_capn_proto_schema}

ClickHouseのテーブル構造をCapnProtoスキーマに変換します。

**構文**

```sql
structureToCapnProtoSchema(structure)
```

**引数**

- `structure` — `column1_name column1_type, column2_name column2_type, ...` 形式のテーブル構造。
- `root_struct_name` — CapnProtoスキーマにおけるルート構造体の名前。デフォルト値 - `Message`;

**返される値**

- CapnProtoスキーマ。 [String](../data-types/string.md)。

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
- `root_message_name` — Protobufスキーマにおけるルートメッセージの名前。デフォルト値 - `Message`;

**返される値**

- Protobufスキーマ。 [String](../data-types/string.md)。

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

与えられたSQLクエリのフォーマット済み（おそらく複数行）のバージョンを返します。

クエリが整形されていない場合は例外がスローされます。代わりに`NULL`を返すには、関数`formatQueryOrNull()`を使用します。

**構文**

```sql
formatQuery(query)
formatQueryOrNull(query)
```

**引数**

- `query` - フォーマットされるSQLクエリ。 [String](../data-types/string.md)

**返される値**

- フォーマットされたクエリ。 [String](../data-types/string.md)。

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

`formatQuery()` に似ていますが、返されるフォーマット済みストリングには改行が含まれません。

クエリが整形されていない場合は例外がスローされます。代わりに`NULL`を返すには、関数`formatQuerySingleLineOrNull()`を使用します。

**構文**

```sql
formatQuerySingleLine(query)
formatQuerySingleLineOrNull(query)
```

**引数**

- `query` - フォーマットされるSQLクエリ。 [String](../data-types/string.md)

**返される値**

- フォーマットされたクエリ。 [String](../data-types/string.md)。

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

- `variant` — Variantカラム。 [Variant](../data-types/variant.md)。
- `type_name` — 抽出するvariant型の名前。 [String](../data-types/string.md)。
- `default_value` - variantが指定された型のvariantを持っていない場合に使用されるデフォルト値。任意です。

**返される値**

- 指定された型の`Variant`カラムのサブカラム。

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
│ [1,2,3]       │ ᴺᵁᴺᴸᴸ                       │                        ᴺᵁᴸᴸ │ [1,2,3]                            │
└───────────────┴─────────────────────────────┴─────────────────────────────┴────────────────────────────────────┘
```

## variantType {#varianttype}

`Variant`カラムの各行に対するvariant型名を返します。行がNULLを含む場合、`'None'`を返します。

**構文**

```sql
variantType(variant)
```

**引数**

- `variant` — Variantカラム。 [Variant](../data-types/variant.md)。

**返される値**

- 各行に対するvariant型名を持つEnum8カラム。

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

2つのサンプル間でのコンバージョン（比率）を比較するためのA/Bテストで必要な最小サンプルサイズを計算します。

**構文**

```sql
minSampleSizeConversion(baseline, mde, power, alpha)
```

[この指標](https://towardsdatascience.com/required-sample-size-for-a-b-testing-6f6608dd330a)で説明されたフォーミュラを使用します。処置群と対照群のサイズが等しいと仮定しています。1つのグループに必要なサンプルサイズを返します（つまり、全実験に必要なサンプルサイズは返された値の2倍です）。

**引数**

- `baseline` — 基準コンバージョン。 [Float](../data-types/float.md)。
- `mde` — 最小検出可能効果（MDE）をパーセンテージポイントとして表現（例: 基準コンバージョンが0.25の場合、MDEが0.03は0.25 ± 0.03に期待される変化を意味します）。[Float](../data-types/float.md)。
- `power` — テストの必要な統計的パワー（1 - タイプIIエラーの確率）。 [Float](../data-types/float.md)。
- `alpha` — テストの必要な有意レベル（タイプIエラーの確率）。 [Float](../data-types/float.md)。

**返される値**

名前付き[Tuple](../data-types/tuple.md)を返します。3つの要素：

- `"minimum_sample_size"` — 必要なサンプルサイズ。 [Float64](../data-types/float.md)。
- `"detect_range_lower"` — 返された必要なサンプルサイズで検出できない値の範囲の下限（すなわち、`"detect_range_lower"`以下のすべての値は、指定された`alpha`および`power`で検出可能です）。基準値 - mdeとして計算されます。 [Float64](../data-types/float.md)。
- `"detect_range_upper"` — 返された必要なサンプルサイズで検出できない値の範囲の上限（すなわち、`"detect_range_upper"`以上のすべての値は、指定された`alpha`および`power`で検出可能です）。基準値 + mdeとして計算されます。 [Float64](../data-types/float.md)。

**例**

次のクエリは、基準コンバージョンが25%、MDEが3%、有意レベルが5%、望ましい統計的パワーが80%のA/Bテストに必要なサンプルサイズを計算します。

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

2つのサンプル間での連続メトリックの平均を比較するA/Bテストに必要な最小サンプルサイズを計算します。

**構文**

```sql
minSampleSizeContinous(baseline, sigma, mde, power, alpha)
```

エイリアス: `minSampleSizeContinous`

[この指標](https://towardsdatascience.com/required-sample-size-for-a-b-testing-6f6608dd330a)で説明されたフォーミュラを使用します。処置群と対照群のサイズが等しいと仮定しています。全実験に必要なサンプルサイズは返された値の2倍です。さらに、処置群と対照群のテストメトリックの分散が等しいと仮定しています。

**引数**

- `baseline` — メトリックの基準値。 [Integer](../data-types/int-uint.md) または [Float](../data-types/float.md)。
- `sigma` — メトリックの基準標準偏差。 [Integer](../data-types/int-uint.md) または [Float](../data-types/float.md)。
- `mde` — 基準値のパーセンテージとしての最小検出可能効果（例: 基準値が112.25の場合、MDEが0.03は112.25 ± 112.25*0.03に期待される変化を意味します）。 [Integer](../data-types/int-uint.md) または [Float](../data-types/float.md)。
- `power` — テストの必要な統計的パワー（1 - タイプIIエラーの確率）。 [Integer](../data-types/int-uint.md) または [Float](../data-types/float.md)。
- `alpha` — テストの必要な有意レベル（タイプIエラーの確率）。 [Integer](../data-types/int-uint.md) または [Float](../data-types/float.md)。

**返される値**

名前付き[Tuple](../data-types/tuple.md)を返します。3つの要素：

- `"minimum_sample_size"` — 必要なサンプルサイズ。 [Float64](../data-types/float.md)。
- `"detect_range_lower"` — 返された必要なサンプルサイズで検出できない値の範囲の下限（すなわち、`"detect_range_lower"`以下のすべての値は、指定された`alpha`および`power`で検出可能です）。計算は `baseline * (1 - mde)` です。 [Float64](../data-types/float.md)。
- `"detect_range_upper"` — 返された必要なサンプルサイズで検出できない値の範囲の上限（すなわち、`"detect_range_upper"`以上のすべての値は、指定された`alpha`および`power`で検出可能です）。計算は `baseline * (1 + mde)` です。 [Float64](../data-types/float.md)。

**例**

次のクエリは、基準値が112.25、標準偏差が21.1、MDEが3%、有意レベルが5%、望ましい統計的パワーが80%のメトリックに対するA/Bテストに必要なサンプルサイズを計算します。

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

現在のクエリを送信したクライアントの接続IDを取得し、UInt64整数として返します。

**構文**

```sql
connectionId()
```

エイリアス: `connection_id`.

**パラメータ**

ありません。

**返される値**

現在の接続ID。 [UInt64](../data-types/int-uint.md)。

**実装の詳細**

この関数は、デバッグシナリオやMySQLハンドラ内部での利用に最も有用です。MySQLの`CONNECTION_ID`関数に互換性を持たせるために作成されました。通常のクエリではあまり使用されません。

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

指定されたヘッダーが存在しない場合や、現在のリクエストがHTTPインターフェイスを介して行われていない場合、関数は空の文字列を返します。
特定のHTTPヘッダー（例: `Authentication` と `X-ClickHouse-*` ）には制限があります。

この関数を使用するには、`allow_get_client_http_header`という設定を有効にする必要があります。
セキュリティ上の理由からデフォルトでは有効になっておらず、`Cookie`のようなヘッダーには機密情報が含まれている可能性があります。

この関数でHTTPヘッダーは大文字小文字を区別します。

この関数を分散クエリのコンテキストで使用すると、イニシエータノードでのみ非空の結果が返されます。

## showCertificate {#showcertificate}

現在のサーバーのSSL証明書についての情報を表示します。SSL証明書の使用を設定する方法については、[SSL-TLSの設定](/guides/sre/configuring-ssl)を参照してください。

**構文**

```sql
showCertificate()
```

**返される値**

- 設定されたSSL証明書に関連するキーと値のペアのマップ。 [Map](../data-types/map.md)([String](../data-types/string.md), [String](../data-types/string.md))。

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

[LowCardinality](../data-types/lowcardinality.md)カラムの辞書内の値の位置を返します。位置は1から始まります。LowCardinalityはパーツごとに辞書を持っているため、同じ値に対して異なるパーツで異なる位置が返される場合があります。

**構文**

```sql
lowCardinalityIndices(col)
```

**引数**

- `col` — 低カーディナリティカラム。 [LowCardinality](../data-types/lowcardinality.md)。

**返される値**

- 現在のパーツの辞書内の値の位置。 [UInt64](../data-types/int-uint.md)。

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

[LowCardinality](../data-types/lowcardinality.md)カラムの辞書の値を返します。ブロックのサイズが辞書のサイズより小さい場合、結果は切り捨てられ、サイズが大きい場合はデフォルト値で拡張されます。LowCardinalityはパーツごとに辞書を持っているため、同じ値に対して異なるパーツで異なる辞書の値が返される場合があります。

**構文**

```sql
lowCardinalityKeys(col)
```

**引数**

- `col` — 低カーディナリティカラム。 [LowCardinality](../data-types/lowcardinality.md)。

**返される値**

- 辞書のキー。 [UInt64](../data-types/int-uint.md)。

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

設定から`display_name`の値を返すか、設定されていない場合はサーバーの完全修飾ドメイン名（FQDN）を返します。

**構文**

```sql
displayName()
```

**返される値**

- 設定からの`display_name`の値または設定されていない場合のサーバーのFQDN。 [String](../data-types/string.md)。

**例**

`config.xml`で`display_name`を設定できます。例えば、`display_name`が'production'に設定されているサーバーの場合：

```xml
<!-- clickhouse-clientで表示される名前です。
     デフォルトでは、「production」を含むものは、クエリプロンプトで赤色で強調表示されます。
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

[トランザクション](/guides/developer/transactional#transactions-commit-and-rollback)のIDを返します。

:::note
この関数は実験的な機能の一部です。実験的なトランザクションサポートを有効にするには、この設定を構成に追加します：
```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

詳細については、[トランザクション（ACID）サポート](/guides/developer/transactional#transactions-commit-and-rollback)のページを参照してください。
:::

**構文**

```sql
transactionID()
```

**返される値**

- `start_csn`、`local_tid`および`host_id`からなるタプルを返します。 [Tuple](../data-types/tuple.md)。

- `start_csn`: トランザクションが開始されたときに見られた最新のコミットタイムスタンプを示すグローバルシーケンシャル番号。 [UInt64](../data-types/int-uint.md)。
- `local_tid`: このホストによって特定の`start_csn`内で開始された各トランザクションのユニークなローカルシーケンシャル番号。 [UInt64](../data-types/int-uint.md)。
- `host_id`: このトランザクションを開始したホストのUUID。 [UUID](../data-types/uuid.md)。

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

読み取り可能な[トランザクション](/guides/developer/transactional#transactions-commit-and-rollback)の最新スナップショット（コミットシーケンス番号）を返します。

:::note
この関数は実験的な機能の一部です。実験的なトランザクションサポートを有効にするには、この設定を構成に追加します：

```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

詳細については、[トランザクション（ACID）サポート](/guides/developer/transactional#transactions-commit-and-rollback)のページを参照してください。
:::

**構文**

```sql
transactionLatestSnapshot()
```

**返される値**

- トランザクションの最新スナップショット（CSN）を返します。 [UInt64](../data-types/int-uint.md)

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

実行中の[トランザクション](/guides/developer/transactional#transactions-commit-and-rollback)に対して可視の最古のスナップショット（コミットシーケンス番号）を返します。

:::note
この関数は実験的な機能の一部です。実験的なトランザクションサポートを有効にするには、この設定を構成に追加します：

```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

詳細については、[トランザクション（ACID）サポート](/guides/developer/transactional#transactions-commit-and-rollback)のページを参照してください。
:::

**構文**

```sql
transactionOldestSnapshot()
```

**返される値**

- トランザクションの最古のスナップショット（CSN）を返します。 [UInt64](../data-types/int-uint.md)

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

テーブル式または識別子とサブカラムの名前を含む定数文字列を受け取り、その式から抽出した要求されたサブカラムを返します。

**構文**

```sql
getSubcolumn(col_name, subcol_name)
```

**引数**

- `col_name` — テーブル式または識別子。 [Expression](../syntax.md/#expressions), [Identifier](../syntax.md/#identifiers)。
- `subcol_name` — サブカラムの名前。 [String](../data-types/string.md)。

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

データ型のストリームパスを列挙します。

:::note
この関数は開発者向けに設計されています。
:::

**構文**

```sql
getTypeSerializationStreams(col)
```

**引数**

- `col` — データ型のカラムまたは文字列表現。データ型が検出されます。

**返される値**

- すべてのシリアライズサブストリームパスを持つ配列を返します。[Array](../data-types/array.md)([String](../data-types/string.md))。

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

定数文字列引数を受け取り、その名前のグローバル変数の値を返します。この関数はMySQLとの互換性のために設計されており、ClickHouseの通常の操作には必要ないか、有用ではありません。定義されているダミーのグローバル変数はわずかです。

**構文**

```sql
globalVariable(name)
```

**引数**

- `name` — グローバル変数名。 [String](../data-types/string.md)。

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

指定されたデータベースにおけるテーブル名の最大長を返します。

**構文**

```sql
getMaxTableNameLengthForDatabase(database_name)
```

**引数**

- `database_name` — 指定されたデータベースの名前。 [String](../data-types/string.md)。

**返される値**

- 最大テーブル名の長さを返します。

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

サーバー設定の現行値を返します。

**構文**

```sql
getServerSetting('server_setting');
```

**パラメータ**

- `server_setting` — 設定名。 [String](../data-types/string.md)。

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

- `merge_tree_setting` — 設定名。 [String](../data-types/string.md)。

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
