---
slug: /sql-reference/functions/other-functions
sidebar_position: 140
sidebar_label: その他
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';

# その他の関数
## hostName {#hostname}

この関数が実行されたホストの名前を返します。関数がリモートサーバー（分散処理）で実行される場合、リモートサーバーの名前が返されます。
関数が分散テーブルのコンテキストで実行される場合、各シャードに関連する値を持つ通常のカラムを生成します。それ以外の場合は、定数値を生成します。

**構文**

```sql
hostName()
```

**返される値**

- ホスト名。 [String](../data-types/string.md)。
## getMacro {#getMacro}

サーバー構成の[マクロ](../../operations/server-configuration-parameters/settings.md#macros)セクションから名前付きの値を返します。

**構文**

```sql
getMacro(name);
```

**引数**

- `name` — `<macros>` セクションから取得するマクロの名前。 [String](../data-types/string.md#string)。

**返される値**

- 指定されたマクロの値。 [String](../data-types/string.md)。

**例**

サーバー構成ファイルでの `<macros>` セクションの例:

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

**返される値**

- 完全修飾ドメイン名を持つ文字列。 [String](../data-types/string.md)。

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

最後のスラッシュまたはバックスラッシュの後にある文字列の末尾を抽出します。この関数は通常、パスからファイル名を抽出するために使用されます。

```sql
basename(expr)
```

**引数**

- `expr` — [String](../data-types/string.md) 型の値。バックスラッシュはエスケープする必要があります。

**返される値**

入力文字列の末尾を含む文字列:

- 最後のスラッシュまたはバックスラッシュの後にある入力文字列の尾部。入力文字列がスラッシュまたはバックスラッシュで終わっている場合（例えば `/` または `c:\`）、関数は空の文字列を返します。
- スラッシュまたはバックスラッシュがない場合は元の文字列。

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

テキスト形式（タブ区切り）で値を出力する際の近似的な幅を計算します。
この関数は、[Pretty formats](../../interfaces/formats.md)を実装するためにシステムによって使用されます。

`NULL` は `Pretty` フォーマット内の `NULL` に対応する文字列として表されます。

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

`NULL` が渡されると、この関数は型 `Nullable(Nothing)` を返します。これはClickHouseの内部の `NULL` 表現に対応します。

**構文**

```sql
toTypeName(value)
```

**引数**

- `value` — 任意の型の値。

**返される値**

- 入力値のデータ型名。 [String](../data-types/string.md)。

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

ClickHouse では、クエリは[ブロック](/development/architecture#block)（チャンク）で処理されます。
この関数は、関数が呼び出されるブロックのサイズ（行数）を返します。

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

引数のメモリ内の未圧縮バイトサイズの推定値を返します。

**構文**

```sql
byteSize(argument [, ...])
```

**引数**

- `argument` — 値。

**返される値**

- メモリ内の引数のバイトサイズの推定値。 [UInt64](../data-types/int-uint.md)。

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
byteSize(Int32):  4
byteSize(Int64):   8
byteSize(Float32): 4
byteSize(Float64): 8
```

関数に複数の引数がある場合、関数はそれらのバイトサイズを合計します。

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

定数を単一の値を含むフルカラムに変換します。
フルカラムと定数はメモリ内で異なる方法で表現されます。
関数は通常、通常の引数と定数引数に対して異なるコードを実行しますが、結果は通常同じであるはずです。
この関数はこの動作をデバッグするために使用できます。

**構文**

```sql
materialize(x)
```

**引数**

- `x` — 定数。 [Constant](overview.md/#constants)。

**返される値**

- 単一の値 `x` を含むカラム。

**例**

以下の例では `countMatches` 関数は定数の2番目の引数を期待します。
この動作は、定数をフルカラムに変換するために `materialize` 関数を使用することでデバッグでき、その結果、関数が非定数引数に対してエラーをスローすることを確認します。

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

任意の引数を受け取り、無条件で `0` を返します。
引数は内部で評価され続け、ベンチマークなどに役立ちます。

**構文**

```sql
ignore([arg1[, arg2[, ...]])
```

**引数**

- 任意の型の任意の数の引数を受け付け、`NULL`も含まれます。

**返される値**

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

クエリの実行に遅延や一時停止を導入するために使用されます。主にテストおよびデバッグの目的で使用されます。

**構文**

```sql
sleep(seconds)
```

**引数**

- `seconds`: [UInt*](../data-types/int-uint.md) または [Float](../data-types/float.md) クエリの実行を最大3秒間一時停止する秒数。小数点値にして小数秒を指定できます。

**返される値**

この関数は値を返しません。

**例**

```sql
SELECT sleep(2);
```

この関数は値を返しません。ただし、`clickhouse client` で関数を実行すると、次のような出力が表示されます:

```response
SELECT sleep(2)

Query id: 8aa9943e-a686-45e1-8317-6e8e3a5596ac

┌─sleep(2)─┐
│        0 │
└──────────┘

1 row in set. Elapsed: 2.012 sec.
```

このクエリは完了する前に2秒間一時停止します。この間、結果は返されず、クエリはハングしているように見えるか、応答がないように見えるでしょう。

**実装の詳細**

`sleep()` 関数は、一般的に本番環境では使用されません。なぜなら、クエリパフォーマンスやシステムの応答性に悪影響を及ぼす可能性があるためです。しかし、以下のシナリオで役立つ場合があります:

1. **テスト**: ClickHouseをテストしたりベンチマークを行う際、特定の条件下でシステムの挙動を観察するために遅延をシミュレートしたり、一時停止を導入したりすることがあります。
2. **デバッグ**: システムの状態や特定の時間におけるクエリの実行状態を調べる必要がある場合、`sleep()`を使用して一時停止を引き起こし、関連情報を検査または収集できるようにします。
3. **シミュレーション**: ネットワーク遅延や外部システム依存関係など、現実世界のシナリオで遅延や一時停止が発生する場合のシミュレーションを行いたい場合にも便利です。

`sleep()` 関数を使用する際には注意して行い、必要な時にのみ利用することが重要です。これにより、ClickHouseシステムの全体的なパフォーマンスと応答性に影響を与える可能性があります。
## sleepEachRow {#sleepeachrow}

結果セット内の各行に対して指定された秒数だけクエリの実行を一時停止します。

**構文**

```sql
sleepEachRow(seconds)
```

**引数**

- `seconds`: [UInt*](../data-types/int-uint.md) または [Float*](../data-types/float.md) 各結果セットの行を一時停止するための秒数。最大3秒。小数点値にして小数秒を指定できます。

**返される値**

この関数は、受け取った入力値と同じものを返し、修正しません。

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

しかし、出力は遅延し、各行の間に0.5秒の一時停止があります。

`sleepEachRow()` 関数は、`sleep()` 関数と同様に主にテストおよびデバッグの目的で使用されます。各行の処理に遅延をシミュレートしたり、一時停止を導入したりすることができるため、次のようなシナリオで便利です:

1. **テスト**: ClickHouseのパフォーマンスを特定の条件下でテストしたりベンチマークしたりする際に、各処理された行に対して遅延をシミュレートしたり一時停止を導入したりできます。
2. **デバッグ**: 各行の処理の際のシステムの状態やクエリの実行を調べる必要がある場合、`sleepEachRow()`を使用して一時停止を導入し、関連情報を検査または収集できるようにします。
3. **シミュレーション**: 外部システムやネットワーク遅延など、各行処理の際に発生する現実世界のシナリオをシミュレートしたい場合に便利です。

`[`sleep()` 関数](#sleep) と同様に、`sleepEachRow()`の使用は注意して行い、必要な時にのみ行うことが重要です。特に大規模な結果セットを扱う場合、全体的なパフォーマンスと応答性に大きな影響を与える可能性があります。
## currentDatabase {#currentdatabase}

現在のデータベースの名前を返します。
これは、`CREATE TABLE` クエリのテーブルエンジンパラメータでデータベースを指定する際に便利です。

**構文**

```sql
currentDatabase()
```

**返される値**

- 現在のデータベース名を返します。 [String](../data-types/string.md)。

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

現在のユーザーの名前を返します。分散クエリの場合、クエリを開始したユーザーの名前が返されます。

**構文**

```sql
currentUser()
```

エイリアス: `user()`, `USER()`, `current_user()`。エイリアスは大文字と小文字を区別しません。

**返される値**

- 現在のユーザーの名前。 [String](../data-types/string.md)。
- 分散クエリの場合、クエリを開始したユーザーのログイン。 [String](../data-types/string.md)。

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

現在のデータベーススキーマの名前が含まれる単一要素の配列を返します。

**構文**

```sql
currentSchemas(bool)
```

エイリアス: `current_schemas`.

**引数**

- `bool`: 真偽値。 [Bool](../data-types/boolean.md)。

:::note
真偽値の引数は無視されます。これは、この関数の[実装](https://www.postgresql.org/docs/7.3/functions-misc.html)のPostgreSQLとの互換性のために存在するだけです。
:::

**返される値**

- 現在のデータベース名を含む単一要素の配列を返します。

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

定数式とは、クエリ解析中にその結果が既知である式、すなわち実行前に分かる式です。たとえば、[リテラル](../../sql-reference/syntax.md#literals)の式は定数式です。

この関数は主に開発、デバッグ、デモのために意図されています。

**構文**

```sql
isConstant(x)
```

**引数**

- `x` — チェックする式。

**返される値**

- `1` もし `x` が定数である場合。 [UInt8](../data-types/int-uint.md)。
- `0` もし `x` が非定数である場合。 [UInt8](../data-types/int-uint.md)。

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

データベース名、テーブル名、およびカラム名を定数文字列として与えると、指定されたカラムが存在する場合は1を返し、存在しない場合は0を返します。

**構文**

```sql
hasColumnInTable(\['hostname'\[, 'username'\[, 'password'\]\],\] 'database', 'table', 'column')
```

**引数**

- `database` : データベースの名前。 [String literal](../syntax#syntax-string-literal)
- `table` : テーブルの名前。 [String literal](../syntax#syntax-string-literal)
- `column` : カラムの名前。 [String literal](../syntax#syntax-string-literal)
- `hostname` : チェックを行うリモートサーバーの名前。 [String literal](../syntax#syntax-string-literal)
- `username` : リモートサーバーのユーザー名。 [String literal](../syntax#syntax-string-literal)
- `password` : リモートサーバーのパスワード。 [String literal](../syntax#syntax-string-literal)

**返される値**

- 指定されたカラムが存在する場合は `1`。
- 存在しない場合は `0`。

**実装の詳細**

ネストデータ構造内の要素に対して、カラムの存在をチェックします。ネストデータ構造自体については、0を返します。

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

Thread Fuzzerが有効かどうかを返します。テストで実行があまりにも長くならないように使用できます。

**構文**

```sql
hasThreadFuzzer();
```
## bar {#bar}

棒グラフを描画します。

`bar(x, min, max, width)`は、`(x - min)` に比例する幅を持つバンドを描画し、`x = max` のときに `width` の文字と等しくなります。

**引数**

- `x` — 表示するサイズ。
- `min, max` — 整数定数。値は `Int64` に収まる必要があります。
- `width` — 定数の正の整数、小数点も可能。

バンドは、記号の八分の一の精度で描かれます。

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

定義されたマッピングに従って値を変換します。
この関数には2つのバリエーションがあります：
### transform(x, array_from, array_to, default) {#transformx-array_from-array_to-default}

`x` – 変換する対象。

`array_from` – 変換する定数の配列。

`array_to` – 'from' の値を変換するための定数の配列。

`default` – 'x' が 'from' の値と等しくない場合に使用する値。

`array_from` と `array_to` は同じ数の要素を持たなければなりません。

署名:

`transform(T, Array(T), Array(U), U) -> U`

`T` および `U` は数値、文字列、または日付または日付時刻のタイプです。
同じ文字（T または U）は、タイプが互換性を持っている必要がありますが、必ずしも等しい必要はありません。
たとえば、最初の引数は `Int64` 型で、2番目の引数は `Array(UInt16)` 型である可能性があります。

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

他のバリエーションと似ていますが、'default' 引数がありません。マッチが見つからない場合は `x` が返されます。

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

サイズ（バイト数）を与えると、この関数は文字列として読みやすく、四捨五入されたサイズを返します（KB、MB、等）。

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

サイズ（バイト数）を与えると、この関数は文字列として読みやすく、四捨五入されたサイズを返します（KiB、MiB、等）。

この関数の逆操作は [parseReadableSize](#parsereadablesize)、[parseReadableSizeOrZero](#parsereadablesizeorzero)、および [parseReadableSizeOrNull](#parsereadablesizeornull) です。

**構文**

```sql
formatReadableSize(x)
```
エイリアス: `FORMAT_BYTES`.

:::note
この関数は任意の数値型を入力として受け付けますが、内部ではFloat64にキャストされます。大きな値の場合、結果が最適でない可能性があります。
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

数値を与えると、この関数は文字列として丸められた数値と接尾辞（千、百万、十億など）を返します。

**構文**

```sql
formatReadableQuantity(x)
```

:::note
この関数は任意の数値型を入力として受け付けますが、内部ではFloat64にキャストされます。大きな値の場合、結果が最適でない可能性があります。
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

時間間隔（デルタ）を秒単位で与えると、この関数は年/月/日/時間/分/秒/ミリ秒/マイクロ秒/ナノ秒の形式で文字列としての時間差を返します。

**構文**

```sql
formatReadableTimeDelta(column[, maximum_unit, minimum_unit])
```

:::note
この関数は任意の数値型を入力として受け付けますが、内部ではFloat64にキャストされます。大きな値の場合、結果が最適でない可能性があります。
:::

**引数**

- `column` — 数値の時間差を含むカラム。
- `maximum_unit` — 任意。表示する最大単位。
  - 許可される値: `nanoseconds`, `microseconds`, `milliseconds`, `seconds`, `minutes`, `hours`, `days`, `months`, `years`。
  - デフォルト値: `years`。
- `minimum_unit` — 任意。表示する最小単位。すべての小さい単位は切り捨てられます。
  - 許可される値: `nanoseconds`, `microseconds`, `milliseconds`, `seconds`, `minutes`, `hours`, `days`, `months`, `years`。
  - 明示的に指定された値が `maximum_unit` より大きい場合、例外がスローされます。
  - デフォルト値: `seconds` が `maximum_unit` が `seconds` またはそれ以上の場合、`nanoseconds` それ以外。

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

バイトサイズを含む文字列を与えると、`B`, `KiB`, `KB`, `MiB`, `MB`, 等の単位で、この関数は対応するバイト数を返します。  
入力値の解析に失敗した場合、例外をスローします。

この関数の逆操作は [formatReadableSize](#formatreadablesize) および [formatReadableDecimalSize](#formatreadabledecimalsize) です。

**構文**

```sql
parseReadableSize(x)
```

**引数**

- `x` : ISO/IEC 80000-13 または十進バイト単位を持つ読み取り可能なサイズ ([String](../../sql-reference/data-types/string.md))。

**返される値**

- バイト数、最も近い整数に丸められたもの ([UInt64](../../sql-reference/data-types/int-uint.md))。

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

バイトサイズを含む文字列を与えると、`B`, `KiB`, `KB`, `MiB`, `MB`, 等の単位で、この関数は対応するバイト数を返します。  
入力値を解析できない場合は `NULL` を返します。

この関数の逆操作は [formatReadableSize](#formatreadablesize) および [formatReadableDecimalSize](#formatreadabledecimalsize) です。

**構文**

```sql
parseReadableSizeOrNull(x)
```

**引数**

- `x` : ISO/IEC 80000-13 または十進バイト単位を持つ読み取り可能なサイズ ([String](../../sql-reference/data-types/string.md))。

**返される値**

- バイト数、最も近い整数に丸められたもの、または入力を解析できない場合はNULL (Nullable([UInt64](../../sql-reference/data-types/int-uint.md)))。

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

バイトサイズを含む文字列を与えると、`B`, `KiB`, `KB`, `MiB`, `MB`, 等の単位で、この関数は対応するバイト数を返します。入力値の解析に失敗した場合、0を返します。

この関数の逆操作は [formatReadableSize](#formatreadablesize) および [formatReadableDecimalSize](#formatreadabledecimalsize) です。

**構文**

```sql
parseReadableSizeOrZero(x)
```

**引数**

- `x` : ISO/IEC 80000-13 または十進バイト単位を持つ読み取り可能なサイズ ([String](../../sql-reference/data-types/string.md))。

**返される値**

- バイト数、最も近い整数に丸められたもの、または入力を解析できなかった場合は0 ([UInt64](../../sql-reference/data-types/int-uint.md))。

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

数値の列を解析し、時間単位に似たものが続く。

**構文**

```sql
parseTimeDelta(timestr)
```

**引数**

- `timestr` — 時間単位に似たものが続く数値の列。

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

一つ以上の入力引数のうち、最小の引数を返します。 `NULL` 引数は無視されます。

**構文**

```sql
least(a, b)
```

:::note
バージョン [24.12](/whats-new/changelog#-clickhouse-release-2412-2024-12-19) では、`NULL` 値が無視されるように後方互換性のない変更が導入されました。以前は、引数の一つが `NULL` の場合に `NULL` が返されていました。以前の動作を保持するには、設定 `least_greatest_legacy_null_behavior` （デフォルト: `false`）を `true` に設定してください。
:::

## greatest {#greatest}

一つ以上の入力引数のうち、最大の引数を返します。 `NULL` 引数は無視されます。

**構文**

```sql
greatest(a, b)
```

:::note
バージョン [24.12](/whats-new/changelog#-clickhouse-release-2412-2024-12-19) では、`NULL` 値が無視されるように後方互換性のない変更が導入されました。以前は、引数の一つが `NULL` の場合に `NULL` が返されていました。以前の動作を保持するには、設定 `least_greatest_legacy_null_behavior` （デフォルト: `false`）を `true` に設定してください。
:::

## uptime {#uptime}

サーバーの稼働時間を秒単位で返します。
分散テーブルのコンテキストで実行された場合、この関数は各シャードに関連する値を持つ通常のカラムを生成します。そうでない場合は、定数値を生成します。

**構文**

```sql
uptime()
```

**返される値**

- 秒の時間値。[UInt32](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT uptime() as Uptime;
```

結果：

```response
┌─Uptime─┐
│  55867 │
└────────┘
```

## version {#version}

ClickHouse の現在のバージョンを、次の形式の文字列として返します。

- メジャーバージョン
- マイナーバージョン
- パッチバージョン
- 前の安定リリース以降のコミット数。

```text
major_version.minor_version.patch_version.number_of_commits_since_the_previous_stable_release
```

分散テーブルのコンテキストで実行された場合、この関数は各シャードに関連する値を持つ通常のカラムを生成します。そうでない場合は、定数値を生成します。

**構文**

```sql
version()
```

**引数**

なし。

**返される値**

- ClickHouse の現在のバージョン。[String](../data-types/string)。

**実装の詳細**

なし。

**例**

クエリ：

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

実行中の ClickHouse サーバーバイナリのコンパイラによって生成されたビルド ID を返します。
分散テーブルのコンテキストで実行された場合、この関数は各シャードに関連する値を持つ通常のカラムを生成します。そうでない場合は、定数値を生成します。

**構文**

```sql
buildId()
```

## blockNumber {#blocknumber}

行を含む [ブロック](../../development/architecture.md#block) の単調増加するシーケンス番号を返します。
返されるブロック番号は、最善の努力に基づいて更新されます。すなわち、完全に正確でない場合があります。

**構文**

```sql
blockNumber()
```

**返される値**

- 行が位置するデータブロックのシーケンス番号。[UInt64](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT blockNumber()
FROM
(
    SELECT *
    FROM system.numbers
    LIMIT 10
) SETTINGS max_block_size = 2
```

結果：

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

`rowNumberInBlock` によって処理される各 [ブロック](../../development/architecture.md#block) に対して、現在の行の番号を返します。
返される番号は、各ブロックの0から始まります。

**構文**

```sql
rowNumberInBlock()
```

**返される値**

- データブロック内の行の順序番号（0からスタート）。[UInt64](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT rowNumberInBlock()
FROM
(
    SELECT *
    FROM system.numbers_mt
    LIMIT 10
) SETTINGS max_block_size = 2
```

結果：

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

`rowNumberInAllBlocks` によって処理される各行に対して、ユニークな行番号を返します。返される番号は0から始まります。

**構文**

```sql
rowNumberInAllBlocks()
```

**返される値**

- データブロック内の行の順序番号（0からスタート）。[UInt64](../data-types/int-uint.md)。

**例**

クエリ：

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

結果：

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

リテラル、リテラルの列、および複雑なエイリアス（ホワイトスペース、2桁以上、またはUUIDのように36バイト以上の長さを含む）をプレースホルダー `?` に置き換えます。

**構文**

```sql
normalizeQuery(x)
```

**引数**

- `x` — 文字の列。[String](../data-types/string.md)。

**返される値**

- プレースホルダーを含む文字の列。[String](../data-types/string.md)。

**例**

クエリ：

```sql
SELECT normalizeQuery('[1, 2, 3, x]') AS query;
```

結果：

```result
┌─query────┐
│ [?.., x] │
└──────────┘
```

## normalizeQueryKeepNames {#normalizequerykeepnames}

リテラル、リテラルの列をプレースホルダー `?` に置き換えますが、複雑なエイリアス（ホワイトスペース、2桁以上、またはUUIDのように36バイト以上の長さを含む）を置き換えません。これにより、複雑なクエリログをより良く分析することができます。

**構文**

```sql
normalizeQueryKeepNames(x)
```

**引数**

- `x` — 文字の列。[String](../data-types/string.md)。

**返される値**

- プレースホルダーを含む文字の列。[String](../data-types/string.md)。

**例**

クエリ：

```sql
SELECT normalizeQuery('SELECT 1 AS aComplexName123'), normalizeQueryKeepNames('SELECT 1 AS aComplexName123');
```

結果：

```result
┌─normalizeQuery('SELECT 1 AS aComplexName123')─┬─normalizeQueryKeepNames('SELECT 1 AS aComplexName123')─┐
│ SELECT ? AS `?`                               │ SELECT ? AS aComplexName123                            │
└───────────────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

## normalizedQueryHash {#normalizedqueryhash}

リテラルの値を除いて、類似のクエリに対して同一の64ビットハッシュ値を返します。クエリログの分析に役立ちます。

**構文**

```sql
normalizedQueryHash(x)
```

**引数**

- `x` — 文字の列。[String](../data-types/string.md)。

**返される値**

- ハッシュ値。[UInt64](/sql-reference/data-types/int-uint#integer-ranges)。

**例**

クエリ：

```sql
SELECT normalizedQueryHash('SELECT 1 AS `xyz`') != normalizedQueryHash('SELECT 1 AS `abc`') AS res;
```

結果：

```result
┌─res─┐
│   1 │
└─────┘
```

## normalizedQueryHashKeepNames {#normalizedqueryhashkeepnames}

[normalizedQueryHash](#normalizedqueryhash) と同様に、リテラルの値を除いて、類似のクエリに対して同一の64ビットハッシュ値を返しますが、ハッシュの前に複雑なエイリアス（ホワイトスペース、2桁以上、またはUUIDのように36バイト以上の長さを含む）でプレースホルダーを使用しません。クエリログの分析に役立ちます。

**構文**

```sql
normalizedQueryHashKeepNames(x)
```

**引数**

- `x` — 文字の列。[String](../data-types/string.md)。

**返される値**

- ハッシュ値。[UInt64](/sql-reference/data-types/int-uint#integer-ranges)。

**例**

```sql
SELECT normalizedQueryHash('SELECT 1 AS `xyz123`') != normalizedQueryHash('SELECT 1 AS `abc123`') AS normalizedQueryHash;
SELECT normalizedQueryHashKeepNames('SELECT 1 AS `xyz123`') != normalizedQueryHashKeepNames('SELECT 1 AS `abc123`') AS normalizedQueryHashKeepNames;
```

結果：

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

指定されたオフセット前または後の現在の行の列にアクセスできるウィンドウ関数。

**構文**

```sql
neighbor(column, offset[, default_value])
```

この関数の結果は、影響を受けるデータブロックおよびブロック内のデータの順序に依存します。

:::note
現在処理中のデータブロック内においてのみ隣接の値が返されます。
この誤動作のために、この関数は非推奨とされています。適切なウィンドウ関数を使用してください。
:::

`neighbor()` の計算中の行の順序は、ユーザーに返される行の順序と異なる場合があります。
それを防ぐために、[ORDER BY](../../sql-reference/statements/select/order-by.md) を含むサブクエリを作成し、サブクエリの外部から関数を呼ぶことができます。

**引数**

- `column` — カラム名またはスカラー式。
- `offset` — `column` において現在の行の前または後に見る行の数。[Int64](../data-types/int-uint.md)。
- `default_value` — オプション。オフセットがブロック境界を超えた場合に返される値。影響を受けるデータブロックのデータタイプ。

**返される値**

- 現在の行からオフセット距離の `column` の値が返されます（もしオフセットがブロック境界を超えていない場合）。
- オフセットがブロック境界を超えている場合は、`column` のデフォルト値または `default_value` （指定された場合）が返されます。

:::note
戻り値の型は、影響を受けるデータブロックの型またはデフォルト値の型になります。
:::

**例**

クエリ：

```sql
SELECT number, neighbor(number, 2) FROM system.numbers LIMIT 10;
```

結果：

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

クエリ：

```sql
SELECT number, neighbor(number, 2, 999) FROM system.numbers LIMIT 10;
```

結果：

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

この関数は、前年比のメトリック値を計算するために使用できます。

クエリ：

```sql
WITH toDate('2018-01-01') AS start_date
SELECT
    toStartOfMonth(start_date + (number * 32)) AS month,
    toInt32(month) % 100 AS money,
    neighbor(money, -12) AS prev_year,
    round(prev_year / money, 2) AS year_over_year
FROM numbers(16)
```

結果：

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

データブロック内の連続した二つの行値の差を計算します。
最初の行に対しては0を返し、以降の行には前の行との違いが返されます。

:::note
現在処理中のデータブロック内においてのみ差が返されます。
この誤動作のために、この関数は非推奨とされています。適切なウィンドウ関数を使用してください。
:::

関数の結果は、影響を受けるデータブロックとブロック内のデータの順序に依存します。

`runningDifference()` の計算中の行の順序は、ユーザーに返される行の順序と異なる場合があります。
それを防ぐために、[ORDER BY](../../sql-reference/statements/select/order-by.md) を含むサブクエリを作成し、サブクエリの外部から関数を呼ぶことができます。

**構文**

```sql
runningDifference(x)
```

**例**

クエリ：

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

結果：

```text
┌─EventID─┬───────────EventTime─┬─delta─┐
│    1106 │ 2016-11-24 00:00:04 │     0 │
│    1107 │ 2016-11-24 00:00:05 │     1 │
│    1108 │ 2016-11-24 00:00:05 │     0 │
│    1109 │ 2016-11-24 00:00:09 │     4 │
│    1110 │ 2016-11-24 00:00:10 │     1 │
└─────────┴─────────────────────┴───────┘
```

ブロックサイズが結果に影響することに注意してください。`runningDifference` の内部状態は、新しいブロックごとにリセットされます。

クエリ：

```sql
SELECT
    number,
    runningDifference(number + 1) AS diff
FROM numbers(100000)
WHERE diff != 1
```

結果：

```text
┌─number─┬─diff─┐
│      0 │    0 │
└────────┴──────┘
┌─number─┬─diff─┐
│  65536 │    0 │
└────────┴──────┘
```

クエリ：

```sql
set max_block_size=100000 -- デフォルト値は65536です！

SELECT
    number,
    runningDifference(number + 1) AS diff
FROM numbers(100000)
WHERE diff != 1
```

結果：

```text
┌─number─┬─diff─┐
│      0 │    0 │
└────────┴──────┘
```

## runningDifferenceStartingWithFirstValue {#runningdifferencestartingwithfirstvalue}

:::note
この関数は非推奨です（`runningDifference` の注記を参照）。
:::

[runningDifference](./other-functions.md#other_functions-runningdifference) と同様ですが、最初の行の値を最初の行の値として返します。

## runningConcurrency {#runningconcurrency}

同時イベントの数を計算します。
各イベントには開始時間と終了時間があります。開始時間はイベントに含まれ、終了時間は除外されます。開始時間および終了時間を持つカラムは同じデータタイプでなければなりません。
この関数は、各イベント開始時間ごとにアクティブ（同時）イベントの総数を計算します。

:::tip
イベントは開始時間で昇順に整列される必要があります。この要件が破られると、関数は例外を発生させます。すべてのデータブロックは別々に処理されます。異なるデータブロックからのイベントが重なる場合、正しく処理できません。
:::

**構文**

```sql
runningConcurrency(start, end)
```

**引数**

- `start` — イベントの開始時間を持つカラム。[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、または [DateTime64](../data-types/datetime64.md)。
- `end` — イベントの終了時間を持つカラム。[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、または [DateTime64](../data-types/datetime64.md)。

**返される値**

- 各イベント開始時間における同時イベントの数。[UInt32](../data-types/int-uint.md)

**例**

テーブルを考慮します：

```text
┌──────start─┬────────end─┐
│ 2021-03-03 │ 2021-03-11 │
│ 2021-03-06 │ 2021-03-12 │
│ 2021-03-07 │ 2021-03-08 │
│ 2021-03-11 │ 2021-03-12 │
└────────────┴────────────┘
```

クエリ：

```sql
SELECT start, runningConcurrency(start, end) FROM example_table;
```

結果：

```text
┌──────start─┬─runningConcurrency(start, end)─┐
│ 2021-03-03 │                              1 │
│ 2021-03-06 │                              2 │
│ 2021-03-07 │                              3 │
│ 2021-03-11 │                              2 │
└────────────┴────────────────────────────────┘
```

## MACNumToString {#macnumtostring}

UInt64 数値をビッグエンディアン形式の MAC アドレスとして解釈します。AA:BB:CC:DD:EE:FF（16進数形式のコロン区切りの数字）として文字列で対応する MAC アドレスを返します。

**構文**

```sql
MACNumToString(num)
```

## MACStringToNum {#macstringtonum}

MACNumToString の逆関数。MAC アドレスの形式が無効な場合、0 を返します。

**構文**

```sql
MACStringToNum(s)
```

## MACStringToOUI {#macstringtooui}

AA:BB:CC:DD:EE:FF（16進数形式のコロン区切りの数字）形式の MAC アドレスが与えられた場合、最初の三つのオクテットを UInt64 数値として返します。MAC アドレスの形式が無効な場合、0 を返します。

**構文**

```sql
MACStringToOUI(s)
```

## getSizeOfEnumType {#getsizeofenumtype}

[Enum](../data-types/enum.md) のフィールドの数を返します。
タイプが `Enum` でない場合、例外がスローされます。

**構文**

```sql
getSizeOfEnumType(value)
```

**引数:**

- `value` — `Enum` タイプの値。

**返される値**

- `Enum` 入力値のフィールドの数。

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

- `value` — 任意の値。

**返される値**

- 圧縮なしで値のブロックのためにディスクに書き込まれるバイト数。

**例**

クエリ：

```sql
SELECT blockSerializedSize(maxState(1)) as x
```

結果：

```text
┌─x─┐
│ 2 │
└───┘
```

## toColumnTypeName {#tocolumntypename}

値を表すためのデータタイプの内部名を返します。

**構文**

```sql
toColumnTypeName(value)
```

**引数:**

- `value` — 任意の種類の値。

**返される値**

- `value` を表すために使用される内部データ型名。

**例**

`toTypeName` と `toColumnTypeName` の違い：

```sql
SELECT toTypeName(CAST('2018-01-01 01:02:03' AS DateTime))
```

結果：

```text
┌─toTypeName(CAST('2018-01-01 01:02:03', 'DateTime'))─┐
│ DateTime                                            │
└─────────────────────────────────────────────────────┘
```

クエリ：

```sql
SELECT toColumnTypeName(CAST('2018-01-01 01:02:03' AS DateTime))
```

結果：

```text
┌─toColumnTypeName(CAST('2018-01-01 01:02:03', 'DateTime'))─┐
│ Const(UInt32)                                             │
└───────────────────────────────────────────────────────────┘
```

この例は、`DateTime` データタイプが内部的に `Const(UInt32)` として格納されていることを示しています。

## dumpColumnStructure {#dumpcolumnstructure}

RAM内のデータ構造の詳細な説明を出力します。

```sql
dumpColumnStructure(value)
```

**引数:**

- `value` — 任意の種類の値。

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

与えられたデータタイプのデフォルト値を返します。

ユーザーによって設定されるカスタムカラムのデフォルト値は含まれません。

**構文**

```sql
defaultValueOfArgumentType(expression)
```

**引数:**

- `expression` — 任意のタイプの値または任意のタイプの値を生成する式。

**返される値**

- 数値の場合は `0`。
- 文字列の場合は空文字列。
- [Nullable](../data-types/nullable.md) の場合は `ᴺᵁᴸᴸ`。

**例**

クエリ：

```sql
SELECT defaultValueOfArgumentType( CAST(1 AS Int8) )
```

結果：

```text
┌─defaultValueOfArgumentType(CAST(1, 'Int8'))─┐
│                                           0 │
└─────────────────────────────────────────────┘
```

クエリ：

```sql
SELECT defaultValueOfArgumentType( CAST(1 AS Nullable(Int8) ) )
```

結果：

```text
┌─defaultValueOfArgumentType(CAST(1, 'Nullable(Int8)'))─┐
│                                                  ᴺᵁᴸᴸ │
└───────────────────────────────────────────────────────┘
```

## defaultValueOfTypeName {#defaultvalueoftypename}

与えられたタイプ名のデフォルト値を返します。

ユーザーによって設定されるカスタムカラムのデフォルト値は含まれません。

```sql
defaultValueOfTypeName(type)
```

**引数:**

- `type` — タイプ名を表す文字列。

**返される値**

- 数値の場合は `0`。
- 文字列の場合は空文字列。
- [Nullable](../data-types/nullable.md) の場合は `ᴺᵁᴸᴸ`。

**例**

クエリ：

```sql
SELECT defaultValueOfTypeName('Int8')
```

結果：

```text
┌─defaultValueOfTypeName('Int8')─┐
│                              0 │
└────────────────────────────────┘
```

クエリ：

```sql
SELECT defaultValueOfTypeName('Nullable(Int8)')
```

結果：

```text
┌─defaultValueOfTypeName('Nullable(Int8)')─┐
│                                     ᴺᵁᴸᴸ │
└──────────────────────────────────────────┘
```

## indexHint {#indexhint}

この関数はデバッグおよび内部解析を目的としています。引数を無視し、常に1を返します。引数は評価されません。

ただし、インデックス分析中、この関数の引数は `indexHint` でラップされていないと仮定されます。これにより、この条件によってさらにフィルタリングすることなく、対応する条件を使用してインデックス範囲内のデータを選択します。ClickHouse のインデックスはスパースであり、`indexHint` を使用すると、同じ条件を直接指定するよりも多くのデータが返されます。

**構文**

```sql
SELECT * FROM table WHERE indexHint(<expression>)
```

**返される値**

- `1`。[Uint8](../data-types/int-uint.md)。

**例**

テーブル [ontime](../../getting-started/example-datasets/ontime.md) からのテストデータの例。

テーブル：

```sql
SELECT count() FROM ontime
```

```text
┌─count()─┐
│ 4276457 │
└─────────┘
```

テーブルには `(FlightDate, (Year, FlightDate))` フィールドにインデックスがあります。

インデックスを使用しないクエリを作成します：

```sql
SELECT FlightDate AS k, count() FROM ontime GROUP BY k ORDER BY k
```

ClickHouse はテーブル全体を処理しました（`Processed 4.28 million rows`）。

結果：

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

特定の日付を選択してインデックスを適用します：

```sql
SELECT FlightDate AS k, count() FROM ontime WHERE k = '2017-09-15' GROUP BY k ORDER BY k
```

ClickHouse はインデックスを使用して、はるかに少ない行数を処理しました（`Processed 32.74 thousand rows`）。

結果：

```text
┌──────────k─┬─count()─┐
│ 2017-09-15 │   16428 │
└────────────┴─────────┘
```

次に、式 `k = '2017-09-15'` を `indexHint` 関数でラップします：

クエリ：

```sql
SELECT
    FlightDate AS k,
    count()
FROM ontime
WHERE indexHint(k = '2017-09-15')
GROUP BY k
ORDER BY k ASC
```

ClickHouse は以前と同じ方法でインデックスを使用しました（`Processed 32.74 thousand rows`）。
結果を生成する際に式 `k = '2017-09-15'` は使用されませんでした。
この例により、`indexHint` 関数を使用して隣接する日付を確認できます。

結果：

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
この関数は [arrayJoin](../../sql-reference/functions/array-join.md#functions_arrayjoin) の内部実装で使用されます。
:::

**構文**

```sql
replicate(x, arr)
```

**引数**

- `x` — 結果配列を埋める値。
- `arr` — 配列。[Array](../data-types/array.md)。

**返される値**

`arr` と同じ長さの配列で、値 `x` で満たされます。[Array](../data-types/array.md)。

**例**

クエリ：

```sql
SELECT replicate(1, ['a', 'b', 'c']);
```

結果：

```text
┌─replicate(1, ['a', 'b', 'c'])─┐
│ [1,1,1]                       │
└───────────────────────────────┘
```

## revision {#revision}

現在の ClickHouse [サーバーのリビジョン](../../operations/system-tables/metrics#revision) を返します。

**構文**

```sql
revision()
```

**返される値**

- 現在の ClickHouse サーバーのリビジョン。[UInt32](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT revision();
```

結果：

```response
┌─revision()─┐
│      54485 │
└────────────┘
```

## filesystemAvailable {#filesystemavailable}

データベースの永続性をホストしているファイルシステムの空き容量を返します。返される値は常に総空き容量（[filesystemUnreserved](#filesystemunreserved)）より小さく、いくらかのスペースはオペレーティングシステムのために予約されています。

**構文**

```sql
filesystemAvailable()
```

**返される値**

- 残りの空き容量（バイト単位）。[UInt64](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT formatReadableSize(filesystemAvailable()) AS "Available space";
```

結果：

```text
┌─Available space─┐
│ 30.75 GiB       │
└─────────────────┘
```

## filesystemUnreserved {#filesystemunreserved}

データベースの永続性をホストしているファイルシステムの総空き容量を返します。（以前は `filesystemFree` でした）。 [`filesystemAvailable`](#filesystemavailable) も参照してください。

**構文**

```sql
filesystemUnreserved()
```

**返される値**

- 空き容量（バイト単位）。[UInt64](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT formatReadableSize(filesystemUnreserved()) AS "Free space";
```

結果：

```text
┌─Free space─┐
│ 32.39 GiB  │
└────────────┘
```

## filesystemCapacity {#filesystemcapacity}

ファイルシステムの容量（バイト単位）を返します。データディレクトリへの [path](../../operations/server-configuration-parameters/settings.md#path) を設定する必要があります。

**構文**

```sql
filesystemCapacity()
```

**返される値**

- ファイルシステムの容量（バイト単位）。[UInt64](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT formatReadableSize(filesystemCapacity()) AS "Capacity";
```

結果：

```text
┌─Capacity──┐
│ 39.32 GiB │
└───────────┘
```

## initializeAggregation {#initializeaggregation}

単一の値に基づいて集約関数の結果を計算します。この関数は、[-State](../../sql-reference/aggregate-functions/combinators.md#agg-functions-combinator-state) を持つ集約関数を初期化するために使用されます。集約関数の状態を作成し、[AggregateFunction](../data-types/aggregatefunction.md#data-type-aggregatefunction) 型のカラムに挿入するか、初期化された集約をデフォルト値として使用できます。

**構文**

```sql
initializeAggregation (aggregate_function, arg1, arg2, ..., argN)
```

**引数**

- `aggregate_function` — 初期化する集約関数の名前。[String](../data-types/string.md)。
- `arg` — 集約関数の引数。

**返される値**

- 関数に渡された各行の集約の結果。

戻り値の型は、`initializeAggregation` が最初の引数として受け取る関数の戻り値の型と同じです。

**例**

クエリ：

```sql
SELECT uniqMerge(state) FROM (SELECT initializeAggregation('uniqState', number % 3) AS state FROM numbers(10000));
```

結果：

```text
┌─uniqMerge(state)─┐
│                3 │
└──────────────────┘
```

クエリ：

```sql
SELECT finalizeAggregation(state), toTypeName(state) FROM (SELECT initializeAggregation('sumState', number % 3) AS state FROM numbers(5));
```

結果：

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
## finalizeAggregation {#finalizeaggregation}

与えられた集約関数の状態に基づいて、この関数は集約の結果（または [-State](../../sql-reference/aggregate-functions/combinators.md#agg-functions-combinator-state) コンビネータを使用した場合の最終状態）を返します。

**構文**

```sql
finalizeAggregation(state)
```

**引数**

- `state` — 集約の状態。[AggregateFunction](../data-types/aggregatefunction.md#data-type-aggregatefunction)。

**返される値**

- 集約された値。

:::note
返される型は、集約された任意の型と等しいです。
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

データブロックの各行に対して集約関数の状態を累積します。

:::note
新しいデータブロックごとに状態がリセットされます。
このエラーの発生しやすい動作のため、この関数は非推奨となっています。適切なウィンドウ関数の使用をお勧めします。
:::

**構文**

```sql
runningAccumulate(agg_state[, grouping]);
```

**引数**

- `agg_state` — 集約関数の状態。[AggregateFunction](../data-types/aggregatefunction.md#data-type-aggregatefunction)。
- `grouping` — グルーピングキー。オプション。`grouping` 値が変更されると、関数の状態がリセットされます。等価演算子が定義されている任意の [サポートされているデータ型](../data-types/index.md) を使用できます。

**返される値**

- 各結果行は、現在の位置までのすべての入力行に対して蓄積された集約関数の結果を含みます。`runningAccumulate` は、各新しいデータブロックまたは `grouping` 値が変更されると状態をリセットします。

使用される集約関数によって型が異なります。

**例**

`runningAccumulate` を使用して、グルーピングなしとグルーピングありで数値の累積和を求める方法を考えてみましょう。

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

サブクエリは `0` から `9` までの各数値に対して `sumState` を生成します。`sumState` は特定の数の合計を含む [sum](../../sql-reference/aggregate-functions/reference/sum.md) 関数の状態を返します。

全体のクエリは次のことを行います：

1. 最初の行では、`runningAccumulate` が `sumState(0)` を取得し、`0` を返します。
2. 2 番目の行では、関数が `sumState(0)` と `sumState(1)` をマージし、`sumState(0 + 1)` を生成し、その結果として `1` を返します。
3. 3 番目の行では、関数が `sumState(0 + 1)` と `sumState(2)` をマージし、`sumState(0 + 1 + 2)` を生成し、その結果として `3` を返します。
4. このアクションはブロックの終わりまで繰り返されます。

以下の例は `groupping` パラメータの使用例を示しています：

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

ご覧のように、`runningAccumulate` は各行のグループの状態を別々にマージします。
## joinGet {#joinget}

この関数は、指定された結合キーを使用して、辞書のようにテーブルからデータを抽出することを可能にします。

:::note
`ENGINE = Join(ANY, LEFT, <join_keys>)` ステートメントで作成されたテーブルのみをサポートします。
:::

**構文**

```sql
joinGet(join_storage_table_name, `value_column`, join_keys)
```

**引数**

- `join_storage_table_name` — 検索が行われる場所を示す [識別子](../../sql-reference/syntax.md#syntax-identifiers) 。
- `value_column` — 必要なデータを含むテーブルのカラム名。
- `join_keys` — キーのリスト。

:::note
識別子はデフォルトデータベースで検索されます（設定 `default_database` は設定ファイルを参照）。デフォルトデータベースをオーバーライドするには、`USE db_name` を使うか、データベースとテーブルを `db_name.db_table` の形式で指定します。
:::

**返される値**

- キーのリストに対応する値のリストを返します。

:::note
特定のキーがソーステーブルに存在しない場合、テーブル作成時の [join_use_nulls](../../operations/settings/settings.md#join_use_nulls) 設定に基づき `0` または `null` が返されます。
`join_use_nulls` に関する詳細は [Join operation](../../engines/table-engines/special/join.md) で確認できます。
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

 `join_use_nulls` は、ソーステーブルにキーが存在しない場合に返される値を変更するためにテーブル作成時に使用できます。

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

[joinGet](#joinget) と似ていますが、キーが欠落している場合はデフォルト値の代わりに `NULL` を返します。

**構文**

```sql
joinGetOrNull(join_storage_table_name, `value_column`, join_keys)
```

**引数**

- `join_storage_table_name` — 検索が行われる場所を示す [識別子](../../sql-reference/syntax.md#syntax-identifiers) 。
- `value_column` — 必要なデータを含むテーブルのカラム名。
- `join_keys` — キーのリスト。

:::note
識別子はデフォルトデータベースで検索されます（設定 `default_database` は設定ファイルを参照）。デフォルトデータベースをオーバーライドするには、`USE db_name` を使うか、データベースとテーブルを `db_name.db_table` の形式で指定します。
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
この関数は ClickHouse Cloud では使用できません。
:::

外部の catboost モデルを評価します。[CatBoost](https://catboost.ai) は、Yandex が開発した機械学習用のオープンソースの勾配ブースティングライブラリです。
catboost モデルへのパスとモデル引数（特徴）を受け入れます。Float64 を返します。

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

catboost モデルを評価する前に、`libcatboostmodel.<so|dylib>` ライブラリを使用可能にする必要があります。どのようにコンパイルするかは [CatBoost documentation](https://catboost.ai/docs/concepts/c-plus-plus-api_dynamic-c-pluplus-wrapper.html) を参照してください。

次に、clickhouse 構成に `libcatboostmodel.<so|dylib>` へのパスを指定します。

```xml
<clickhouse>
...
    <catboost_lib_path>/path/to/libcatboostmodel.so</catboost_lib_path>
...
</clickhouse>
```

セキュリティと隔離の理由から、モデル評価はサーバープロセスではなく、clickhouse-library-bridge プロセスで実行されます。
`catboostEvaluate()` の最初の実行時に、ライブラリブリッジプロセスがまだ実行されていない場合、サーバーがそのプロセスを開始します。両方のプロセスは HTTP インターフェースを使用して通信します。デフォルトでは、ポート `9012` が使用されます。別のポートを指定することも可能です。これは、ポート `9012` が他のサービスに既に割り当てられている場合に役立ちます。

```xml
<library_bridge>
    <port>9019</port>
</library_bridge>
```

2. libcatboost を使用して catboost モデルをトレーニングする

[Training and applying models](https://catboost.ai/docs/features/training.html#training) を参照して、トレーニングデータセットから catboost モデルをトレーニングする方法を確認してください。
## throwIf {#throwif}

引数 `x` が真であれば、例外をスローします。

**構文**

```sql
throwIf(x[, message[, error_code]])
```

**引数**

- `x` - 確認する条件。
- `message` - カスタムエラーメッセージを提供する定数文字列。オプション。
- `error_code` - カスタムエラーコードを提供する定数整数。オプション。

`error_code` 引数を使用するには、構成パラメータ `allow_custom_error_code_in_throwif` を有効にする必要があります。

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

引数をそのまま返します。デバッグとテストのために意図されています。インデックスを使用するのをキャンセルし、フルスキャンのクエリ性能を得ることができます。クエリがインデックスの使用可能性を分析する際、アナライザーは `identity` 関数内のすべてを無視します。定数のフォルディングも無効になります。

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

- [Custom Settings](/operations/settings/overview#custom_settings)
## getSettingOrDefault {#getsettingordefault}

現在の [カスタム設定](/operations/settings/overview#custom_settings) の値を返すか、カスタム設定が現在のプロファイルに設定されていない場合は第2引数で指定されたデフォルト値を返します。

**構文**

```sql
getSettingOrDefault('custom_setting', default_value);
```

**パラメータ**

- `custom_setting` — 設定名。[String](../data-types/string.md)。
- `default_value` — custom_setting が設定されていない場合に返す値。値は任意のデータ型であったり Null であったりします。

**返される値**

- 設定の現在の値または、設定がされていない場合は default_value。

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

- [Custom Settings](/operations/settings/overview#custom_settings)
## isDecimalOverflow {#isdecimaloverflow}

[Decimal](../data-types/decimal.md) 値が精度外または指定された精度を超えているかどうかを確認します。

**構文**

```sql
isDecimalOverflow(d, [p])
```

**引数**

- `d` — 値。[Decimal](../data-types/decimal.md)。
- `p` — 精度。オプション。省略した場合、最初の引数の初期精度が使用されます。このパラメータは、他のデータベースやファイル間のデータを移行する際に役立ちます。[UInt8](/sql-reference/data-types/int-uint#integer-ranges)。

**返される値**

- `1` — Decimal 値がその精度によって許可された桁数を超えている、
- `0` — Decimal 値が指定された精度を満たしています。

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
1	1	1	1
```
## countDigits {#countdigits}

値を表示するのに必要な小数桁数を返します。

**構文**

```sql
countDigits(x)
```

**引数**

- `x` — [Int](../data-types/int-uint.md) または [Decimal](../data-types/decimal.md) 値。

**返される値**

- 桁数。[UInt8](/sql-reference/data-types/int-uint#integer-ranges)。

:::note
`Decimal` 値については、そのスケールを考慮しています：基盤となる整数型に対して `value * scale` の計算を行います。たとえば：`countDigits(42) = 2`, `countDigits(42.000) = 5`, `countDigits(0.04200) = 4`。すなわち、`countDecimal(x) > 18` の場合に `Decimal64` で小数オーバーフローを確認できます。これは [isDecimalOverflow](#isdecimaloverflow) の遅いバリアントです。
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
10	10	19	19	39	39
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

このサーバーがリッスンしている [ネイティブインターフェース](../../interfaces/tcp.md) の TCP ポート番号を返します。
分散テーブルのコンテキストで実行されると、この関数は各シャードに関連する値を持つ通常のカラムを生成します。それ以外の場合は定数値になります。

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

コマンド [SET PROFILE](../../sql-reference/statements/set.md#query-set) を使用して、現在の設定プロファイルを変更できます。`SET PROFILE` コマンドが使用されない場合、この関数は現在のユーザーの定義で指定されたプロファイルを返します（[CREATE USER](/sql-reference/statements/create/user) を参照）。

**構文**

```sql
currentProfiles()
```

**返される値**

- 現在のユーザーの設定プロファイルのリスト。[Array](../data-types/array.md)([String](../data-types/string.md))。
## enabledProfiles {#enabledprofiles}

現在のユーザーに明示的および暗黙的に割り当てられた設定プロファイルを返します。明示的に割り当てられたプロファイルは、[currentProfiles](#currentprofiles) 関数によって返されるのと同じです。暗黙的に割り当てられたプロファイルには、他の割り当てられたプロファイルの親プロファイル、付与されたロールを介して割り当てられたプロファイル、自身の設定を介して割り当てられたプロファイル、主要なデフォルトプロファイルが含まれます（メインサーバー設定ファイルの `default_profile` セクションを参照）。

**構文**

```sql
enabledProfiles()
```

**返される値**

- 有効な設定プロファイルのリスト。[Array](../data-types/array.md)([String](../data-types/string.md))。
## defaultProfiles {#defaultprofiles}

現在のユーザーの定義で指定されたすべてのプロファイルを返します（「[CREATE USER](/sql-reference/statements/create/user)」ステートメントを参照）。

**構文**

```sql
defaultProfiles()
```

**返される値**

- デフォルト設定プロファイルのリスト。[Array](../data-types/array.md)([String](../data-types/string.md))。
## currentRoles {#currentroles}

現在のユーザーに割り当てられたロールを返します。ロールは [SET ROLE](../../sql-reference/statements/set-role.md#set-role-statement) ステートメントによって変更できます。`SET ROLE` ステートメントが使用されない場合、`currentRoles` 関数は `defaultRoles` と同じ値を返します。

**構文**

```sql
currentRoles()
```

**返される値**

- 現在のユーザーに対するロールのリスト。[Array](../data-types/array.md)([String](../data-types/string.md))。
## enabledRoles {#enabledroles}

現在のロールおよび現在のロールに付与されたロールの名前を返します。

**構文**

```sql
enabledRoles()
```

**返される値**

- 現在のユーザーに対する有効なロールのリスト。[Array](../data-types/array.md)([String](../data-types/string.md))。
## defaultRoles {#defaultroles}

現在のユーザーがログインするときにデフォルトで有効になっているロールを返します。最初はこれらは現在のユーザーに付与されたすべてのロールです（[GRANT](../../sql-reference/statements/grant.md#select) を参照）が、[SET DEFAULT ROLE](../../sql-reference/statements/set-role.md#set-default-role-statement) ステートメントによって変更できます。

**構文**

```sql
defaultRoles()
```

**返される値**

- 現在のユーザーに対するデフォルトのロールのリスト。[Array](../data-types/array.md)([String](../data-types/string.md))。
## getServerPort {#getserverport}

サーバーポート番号を返します。ポートがサーバーによって使用されていない場合、例外をスローします。

**構文**

```sql
getServerPort(port_name)
```

**引数**

- `port_name` — サーバーポートの名前。[String](../data-types/string.md#string)。考えられる値:

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

現在のクエリの ID を返します。クエリの他のパラメータは、`query_id` を介して [system.query_log](../../operations/system-tables/query_log.md) テーブルから抽出できます。

[initialQueryID](#initialqueryid) 関数とは対照的に、`queryID` は異なるシャードで異なる結果を返す可能性があります（例を参照）。

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

初期の現在のクエリの ID を返します。クエリの他のパラメータは、`initial_query_id` を介して [system.query_log](../../operations/system-tables/query_log.md) テーブルから抽出できます。

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

初期の現在のクエリの開始時刻を返します。

`initialQueryStartTime` は異なるシャードで同じ結果を返します（例を参照）。

**構文**

```sql
initialQueryStartTime()
```

**返される値**

- 初期の現在のクエリの開始時刻。[DateTime](../data-types/datetime.md)

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
この関数は遅く、大量の行に対して呼び出すべきではありません。
:::

**構文**

```sql
partitionID(x[, y, ...]);
```

**引数**

- `x` — パーティション ID を返すカラム。
- `y, ...` — パーティション ID を返す残りの N カラム（オプション）。

**返される値**

- 行が所属するパーティション ID。[String](../data-types/string.md)。

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

分散クエリでデータの部分を処理するシャードのインデックスを返します。インデックスは `1` から開始します。
クエリが分散されていない場合は、定数値 `0` を返します。

**構文**

```sql
shardNum()
```

**返される値**

- シャードインデックスまたは定数 `0`。[UInt32](../data-types/int-uint.md)。

**例**

次の例では、2 つのシャードが使用される構成が利用されています。クエリは [system.one](../../operations/system-tables/one.md) テーブルに対してすべてのシャードで実行されます。

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

- [分散テーブルエンジン](../../engines/table-engines/special/distributed.md)
## shardCount {#shardcount}

分散クエリのためのシャードの総数を返します。
クエリが分散されていない場合は、定数値 `0` を返します。

**構文**

```sql
shardCount()
```

**返される値**

- シャードの総数または `0`。[UInt32](../data-types/int-uint.md)。

**関連項目**

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
## generateRandomStructure {#generaterandomstructure}

ランダムなテーブル構造を生成し、形式は `column1_name column1_type, column2_name column2_type, ...` です。

**構文**

```sql
generateRandomStructure([number_of_columns, seed])
```

**引数**

- `number_of_columns` — 結果のテーブル構造に含めるカラムの数の指定。0または `Null` に設定すると、カラムの数は1から128の間でランダムに決定されます。デフォルト値: `Null`。
- `seed` - 安定した結果を生成するための乱数シード。指定されていない、または `Null` に設定されると、ランダムに生成されます。

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

**注意**: 複雑な型（Array、Tuple、Map、Nested）の最大入れ子深さは16に制限されています。

この関数は、[generateRandom](../../sql-reference/table-functions/generate.md) と組み合わせて使用することで、完全にランダムなテーブルを生成するために利用できます。

## structureToCapnProtoSchema {#structure_to_capn_proto_schema}

ClickHouseのテーブル構造をCapnProtoスキーマに変換します。

**構文**

```sql
structureToCapnProtoSchema(structure)
```

**引数**

- `structure` — テーブル構造、形式は `column1_name column1_type, column2_name column2_type, ...`。
- `root_struct_name` — CapnProtoスキーマのルート構造体の名前。デフォルト値 - `Message`;

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

- `structure` — テーブル構造、形式は `column1_name column1_type, column2_name column2_type, ...`。
- `root_message_name` — Protobufスキーマのルートメッセージの名前。デフォルト値 - `Message`;

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

指定したSQLクエリの形式を整え、複数行のバージョンを返します。

クエリが適切に構成されていない場合は例外がスローされます。 `NULL` を返すためには、`formatQueryOrNull()` 関数を使用することができます。

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

`formatQuery()` と同様ですが、返されるフォーマット済み文字列には改行は含まれません。

クエリが適切に構成されていない場合は例外がスローされます。 `NULL` を返すためには、`formatQuerySingleLineOrNull()` 関数を使用することができます。

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

`Variant` カラムから指定した型のカラムを抽出します。

**構文**

```sql
variantElement(variant, type_name, [, default_value])
```

**引数**

- `variant` — Variantカラム。 [Variant](../data-types/variant.md)。
- `type_name` — 抽出するバリアント型の名前。 [String](../data-types/string.md)。
- `default_value` - 指定した型のバリアントを持たない場合に使用されるデフォルト値。任意の型可能。

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
│ [1,2,3]       │ ᴺᵁᴸᴸ                        │                        ᴺᵁᴸᴸ │ [1,2,3]                            │
└───────────────┴─────────────────────────────┴─────────────────────────────┴────────────────────────────────────┘
```

## variantType {#varianttype}

`Variant`カラムの各行に対するバリアント型名を返します。行がNULLを含む場合、その行には `'None'` が返されます。

**構文**

```sql
variantType(variant)
```

**引数**

- `variant` — Variantカラム。 [Variant](../data-types/variant.md)。

**返される値**

- 各行に対するバリアント型名を持つEnum8カラム。

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

2つのサンプル間のコンバーション（比）を比較するA/Bテストに必要な最小サンプルサイズを計算します。

**構文**

```sql
minSampleSizeConversion(baseline, mde, power, alpha)
```

[このアーティクル](https://towardsdatascience.com/required-sample-size-for-a-b-testing-6f6608dd330a)で説明されている式を使用します。処理群と制御群のサイズが同じであると仮定します。返される値は1つの群に必要なサンプルサイズ（すなわち、実験全体に必要なサンプルサイズは返された値の2倍です）。

**引数**

- `baseline` — 基準となるコンバーション。 [Float](../data-types/float.md)。
- `mde` — 最小検出可能効果（MDE）をパーセントポイントで表したもの（例えば、基準値が0.25でMDEが0.03の場合、0.25±0.03の期待変化を意味します）。 [Float](../data-types/float.md)。
- `power` — テストの必要な統計的パワー（1 - タイプIIエラーの確率）。 [Float](../data-types/float.md)。
- `alpha` — テストの必要な有意水準（タイプIエラーの確率）。 [Float](../data-types/float.md)。

**返される値**

名前付き [Tuple](../data-types/tuple.md) で3つの要素を持ちます:

- `"minimum_sample_size"` — 必要なサンプルサイズ。 [Float64](../data-types/float.md)。
- `"detect_range_lower"` — 返された必要なサンプルサイズで検出できない範囲の下限（すなわち、`"detect_range_lower"`以下のすべての値は提供された `alpha` と `power` で検出可能です）。 `baseline - mde` として計算されます。 [Float64](../data-types/float.md)。
- `"detect_range_upper"` — 返された必要なサンプルサイズで検出できない範囲の上限（すなわち、`"detect_range_upper"`以上のすべての値は提供された `alpha` と `power` で検出可能です）。 `baseline + mde` として計算されます。 [Float64](../data-types/float.md)。

**例**

以下のクエリは、基準コンバーションが25%、MDEが3%、有意水準が5%、統計的パワーが80%のA/Bテストに必要なサンプルサイズを計算します:

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

2つのサンプル間で連続的なメトリックの平均を比較するA/Bテストに必要な最小サンプルサイズを計算します。

**構文**

```sql
minSampleSizeContinous(baseline, sigma, mde, power, alpha)
```

エイリアス: `minSampleSizeContinous`

[このアーティクル](https://towardsdatascience.com/required-sample-size-for-a-b-testing-6f6608dd330a)で説明されている式を使用します。処理群と制御群のサイズが同じであると仮定します。返される値は1つの群に必要なサンプルサイズ（すなわち、実験全体に必要なサンプルサイズは返された値の2倍です）。また、処理群と制御群におけるテストメトリックの分散が等しいことも仮定します。

**引数**

- `baseline` — メトリックの基準値。 [Integer](../data-types/int-uint.md) または [Float](../data-types/float.md)。
- `sigma` — メトリックの基準標準偏差。 [Integer](../data-types/int-uint.md) または [Float](../data-types/float.md)。
- `mde` — 基準値のパーセンテージとして示される最小検出可能効果（MDE）（例えば、基準値が112.25でMDEが0.03の場合、112.25±112.25\*0.03の期待変化を意味します）。 [Integer](../data-types/int-uint.md) または [Float](../data-types/float.md)。
- `power` — テストの必要な統計的パワー（1 - タイプIIエラーの確率）。 [Integer](../data-types/int-uint.md) または [Float](../data-types/float.md)。
- `alpha` — テストの必要な有意水準（タイプIエラーの確率）。 [Integer](../data-types/int-uint.md) または [Float](../data-types/float.md)。

**返される値**

名前付き [Tuple](../data-types/tuple.md) で3つの要素を持ちます:

- `"minimum_sample_size"` — 必要なサンプルサイズ。 [Float64](../data-types/float.md)。
- `"detect_range_lower"` — 返された必要なサンプルサイズで検出できない範囲の下限（すなわち、`"detect_range_lower"`以下のすべての値は提供された `alpha` と `power` で検出可能です）。 `baseline * (1 - mde)` として計算されます。 [Float64](../data-types/float.md)。
- `"detect_range_upper"` — 返された必要なサンプルサイズで検出できない範囲の上限（すなわち、`"detect_range_upper"`以上のすべての値は提供された `alpha` と `power` で検出可能です）。 `baseline * (1 + mde)` として計算されます。 [Float64](../data-types/float.md)。

**例**

以下のクエリは、基準値が112.25、標準偏差が21.1、MDEが3%、有意水準が5%、統計的パワーが80%のメトリックに関するA/Bテストに必要なサンプルサイズを計算します:

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

エイリアス: `connection_id`。

**パラメータ**

なし。

**返される値**

現在の接続ID。 [UInt64](../data-types/int-uint.md)。

**実装の詳細**

この関数は、デバッグシナリオやMySQLハンドラ内での内部目的に最も便利です。これは、[MySQLの `CONNECTION_ID` 関数](https://dev.mysql.com/doc/refman/8.0/en/information-functions.html#function_connection-id)との互換性のために作成されました。通常のクエリでは使用されません。

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

そのようなヘッダーが存在しない場合や、現在のリクエストがHTTPインターフェイスを介して行われていない場合、この関数は空の文字列を返します。特定のHTTPヘッダー（例： `Authentication` と `X-ClickHouse-*`）は制限されています。

この関数は、設定 `allow_get_client_http_header` が有効にされている必要があります。この設定は、セキュリティ上の理由からデフォルトでは無効になっています。これは、 `Cookie` のようなヘッダーが機密情報を含む可能性があるためです。

この関数ではHTTPヘッダーは大文字小文字を区別します。

この関数が分散クエリのコンテキストで使用される場合、非空の結果は開始ノードでのみ返されます。

## showCertificate {#showcertificate}

構成されている場合、現在のサーバーのSSL証明書の情報を表示します。接続を検証するためにClickHouseがOpenSSL証明書を使用する方法については、[SSL-TLSの設定](/guides/sre/configuring-ssl)を参照してください。

**構文**

```sql
showCertificate()
```

**返される値**

- 構成されたSSL証明書に関連するキー・バリューのマップ。 [Map](../data-types/map.md)([String](../data-types/string.md), [String](../data-types/string.md))。

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

[LowCardinality](../data-types/lowcardinality.md)カラムの辞書内の値の位置を返します。位置は1から開始します。LowCardinalityはパーツごとの辞書を持っているため、この関数は異なるパーツで同じ値に対して異なる位置を返すことがあります。

**構文**

```sql
lowCardinalityIndices(col)
```

**引数**

- `col` — low cardinalityカラム。 [LowCardinality](../data-types/lowcardinality.md)。

**返される値**

- 現在のパーツの辞書内における値の位置。 [UInt64](../data-types/int-uint.md)。

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

[LowCardinality](../data-types/lowcardinality.md)カラムの辞書の値を返します。ブロックが辞書のサイズより小さいまたは大きい場合、結果は切り捨てられるか、デフォルト値で拡張されます。LowCardinalityはパーツごとの辞書を持っているため、この関数は異なるパーツで異なる辞書値を返すことがあります。

**構文**

```sql
lowCardinalityKeys(col)
```

**引数**

- `col` — low cardinalityカラム。 [LowCardinality](../data-types/lowcardinality.md)。

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

[config](../../operations/configuration-files.md/#configuration-files) からの `display_name` の値を返すか、設定されていない場合はサーバーの完全修飾ドメイン名（FQDN）を返します。

**構文**

```sql
displayName()
```

**返される値**

- configからの`display_name`の値、または設定されていない場合はサーバーFQDN。 [String](../data-types/string.md)。

**例**

`config.xml` で `display_name` を設定できます。 例えば`display_name`が'production'に設定されているサーバーの場合:

```xml
<!-- これはclickhouse-clientに表示される名前です。
     デフォルトでは、"production"を含むものは、クエリプロンプトで赤色で強調表示されます。
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

[transaction](/guides/developer/transactional#transactions-commit-and-rollback) のIDを返します。

:::note
この関数は実験的な機能セットの一部です。構成に次の設定を追加して実験的トランザクションサポートを有効にします:
```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

詳細は、[Transactional (ACID) support](/guides/developer/transactional#transactions-commit-and-rollback)のページを参照してください。
:::

**構文**

```sql
transactionID()
```

**返される値**

- `start_csn`、`local_tid`、`host_id`で構成されたタプルを返します。 [Tuple](../data-types/tuple.md)。

- `start_csn`: このトランザクションが開始されたときに観測された最新のコミットタイムスタンプである、グローバル順序番号。 [UInt64](../data-types/int-uint.md)。
- `local_tid`: 特定の `start_csn` のもと、このホストによって開始された各トランザクションに対して一意のローカル順序番号。 [UInt64](../data-types/int-uint.md)。
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

読み取り可能な[transaction](/guides/developer/transactional#transactions-commit-and-rollback)の最新スナップショット（コミットシーケンス番号）を返します。

:::note
この関数は実験的な機能セットの一部です。構成に次の設定を追加して実験的トランザクションサポートを有効にします:

```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

詳細は、[Transactional (ACID) support](/guides/developer/transactional#transactions-commit-and-rollback)のページを参照してください。
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

ランニング中の[transaction](/guides/developer/transactional#transactions-commit-and-rollback)に対して可視の最も古いスナップショット（コミットシーケンス番号）を返します。

:::note
この関数は実験的な機能セットの一部です。構成に次の設定を追加して実験的トランザクションサポートを有効にします:

```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

詳細は、[Transactional (ACID) support](/guides/developer/transactional#transactions-commit-and-rollback)のページを参照してください。
:::

**構文**

```sql
transactionOldestSnapshot()
```

**返される値**

- トランザクションの最も古いスナップショット（CSN）を返します。 [UInt64](../data-types/int-uint.md)

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

テーブル式または識別子とサブカラムの名前を定数文字列で指定し、要求されたサブカラムを抽出します。

**構文**

```sql
getSubcolumn(col_name, subcol_name)
```

**引数**

- `col_name` — テーブル式または識別子。 [Expression](../syntax.md/#expressions)、[Identifier](../syntax.md/#identifiers)。
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
この関数は開発者の使用を想定しています。
:::

**構文**

```sql
getTypeSerializationStreams(col)
```

**引数**

- `col` — データ型を検出するためのカラムまたはデータ型の文字列表現。

**返される値**

- すべてのシリアライズサブストリームパスを含む配列を返します。 [Array](../data-types/array.md)([String](../data-types/string.md))。

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

定数文字列引数を取り、その名前のグローバル変数の値を返します。この関数はMySQLとの互換性のために設計されており、ClickHouseの通常の操作には必要ないかつ役に立たないものです。定義されているグローバル変数はごくわずかです。

**構文**

```sql
globalVariable(name)
```

**引数**

- `name` — グローバル変数名。 [String](../data-types/string.md)。

**返される値**

- 変数 `name` の値を返します。

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

指定されたデータベースにおける最大テーブル名の長さを返します。

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
