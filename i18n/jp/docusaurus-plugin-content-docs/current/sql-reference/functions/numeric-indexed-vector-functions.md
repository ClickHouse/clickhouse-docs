---
'description': 'NumericIndexedVector とその関数に関する Documentation'
'sidebar_label': 'NumericIndexedVector'
'slug': '/sql-reference/functions/numeric-indexed-vector-functions'
'title': 'NumericIndexedVector 関数'
'doc_type': 'reference'
---


# NumericIndexedVector

NumericIndexedVectorは、ベクターをカプセル化し、ベクター集約および点ごとの操作を実装する抽象データ構造です。Bit-Sliced Indexはそのストレージ方式です。理論的基盤と使用シナリオについては、論文[Large-Scale Metric Computation in Online Controlled Experiment Platform](https://arxiv.org/pdf/2405.08411)を参照してください。

## BSI {#bit-sliced-index}

BSI (Bit-Sliced Index) ストレージ方式では、データは[Bit-Sliced Index](https://dl.acm.org/doi/abs/10.1145/253260.253268)に格納され、次に[Roaring Bitmap](https://github.com/RoaringBitmap/RoaringBitmap)を用いて圧縮されます。集約操作と点ごとの操作は圧縮されたデータに対して直接行われ、ストレージとクエリの効率を大幅に向上させることができます。

ベクターはインデックスとそれに対応する値を含みます。以下は、BSIストレージモードにおけるこのデータ構造のいくつかの特性と制約です：

- インデックスタイプは、`UInt8`、`UInt16`、または`UInt32`のいずれかでなければなりません。**注意：** 64ビットのRoaring Bitmapの実装のパフォーマンスを考慮すると、BSI形式は`UInt64`/`Int64`をサポートしていません。
- 値のタイプは、`Int8`、`Int16`、`Int32`、`Int64`、`UInt8`、`UInt16`、`UInt32`、`UInt64`、`Float32`、または`Float64`のいずれかでなければなりません。**注意：** 値のタイプは自動的に拡張されません。たとえば、値のタイプに`UInt8`を使用すると、`UInt8`の容量を超える合計はオーバーフローを引き起こし、高いタイプに昇格することはありません。同様に、整数に対する操作は整数結果を返します（例：除算は自動的に浮動小数点結果に変換されません）。したがって、値のタイプを事前に計画し設計することが重要です。現実のシナリオでは、浮動小数点タイプ（`Float32`/`Float64`）が一般的に使用されます。
- 同じインデックスタイプと値のタイプを持つ2つのベクターのみが操作を実行できます。
- 基本のストレージはBit-Sliced Indexを使用し、ビットマップはインデックスを保存します。Roaring Bitmapはビットマップの具体的な実装として使用されます。インデックスをできるだけ多くのRoaring Bitmapコンテナに集中させることが、圧縮とクエリパフォーマンスを最大化するためのベストプラクティスです。
- Bit-Sliced Indexメカニズムは値をバイナリに変換します。浮動小数点タイプに対しては、変換には固定小数点表現が使用され、精度の損失を引き起こす可能性があります。精度は小数部分に使用するビットの数をカスタマイズすることで調整でき、デフォルトは24ビットであり、ほとんどのシナリオに十分です。NumericIndexedVectorを構築する際には、`-State`を用いてaggregate関数groupNumericIndexedVectorを使用することで、整数ビット数と小数ビット数をカスタマイズできます。
- インデックスには、非零値、零値、存在しないの3つのケースがあります。NumericIndexedVectorでは、非零値と零値のみが保存されます。また、2つのNumericIndexedVector間の点ごとの操作では、存在しないインデックスの値は0として扱われます。除算のシナリオでは、除数がゼロのとき、結果はゼロになります。

## Create a numericIndexedVector object {#create-numeric-indexed-vector-object}

この構造を作成する方法は2つあります。1つは、`-State`を用いて集約関数`groupNumericIndexedVector`を使用することです。
追加の条件を受け入れるために接尾辞`-if`を追加できます。
集約関数は、条件をトリガーする行のみを処理します。
もう1つは、`numericIndexedVectorBuild`を使用してマップから構築することです。
`groupNumericIndexedVectorState`関数は、パラメーターを通じて整数ビット数と小数ビット数をカスタマイズでき、`numericIndexedVectorBuild`ではできません。

## groupNumericIndexedVector {#group-numeric-indexed-vector}

2つのデータカラムからNumericIndexedVectorを構築し、すべての値の合計を`Float64`型で返します。接尾辞`State`を追加した場合、NumericIndexedVectorオブジェクトを返します。

**構文**

```sql
groupNumericIndexedVectorState(col1, col2)
groupNumericIndexedVectorState(type, integer_bit_num, fraction_bit_num)(col1, col2)
```

**パラメーター**

- `type`: 文字列、オプション。ストレージ形式を指定します。現在は、 `'BSI'` のみがサポートされています。
- `integer_bit_num`: `UInt32`, オプション。`'BSI'`ストレージ形式の下で有効で、このパラメーターは整数部分に使用されるビット数を示します。インデックスタイプが整数タイプの場合、デフォルト値はインデックスを格納するために使用されるビット数に対応します。たとえば、インデックスタイプがUInt16の場合、デフォルトの`integer_bit_num`は16です。Float32およびFloat64インデックスタイプの場合、`integer_bit_num`のデフォルト値は40であり、表現可能なデータの整数部分は範囲`[-2^39, 2^39 - 1]`にあります。合法な範囲は`[0, 64]`です。
- `fraction_bit_num`: `UInt32`, オプション。`'BSI'`ストレージ形式の下で有効で、このパラメーターは小数部分に使用されるビット数を示します。値のタイプが整数の場合、デフォルト値は0であり; 値のタイプがFloat32またはFloat64の場合、デフォルト値は24です。合法な範囲は`[0, 24]`です。
- また、`integer_bit_num + fraction_bit_num`の有効な範囲は`[0, 64]`であるという制約もあります。
- `col1`: インデックスカラム。サポートされているタイプ：`UInt8`/`UInt16`/`UInt32`/`Int8`/`Int16`/`Int32`。
- `col2`: 値カラム。サポートされているタイプ：`Int8`/`Int16`/`Int32`/`Int64`/`UInt8`/`UInt16`/`UInt32`/`UInt64`/`Float32`/`Float64`。

**戻り値**

すべての値の合計を表す`Float64` 値。

**例**

テストデータ：

```text
UserID  PlayTime
1       10
2       20
3       30
```

クエリ & 結果：

```sql
SELECT groupNumericIndexedVector(UserID, PlayTime) AS num FROM t;
┌─num─┐
│  60 │
└─────┘

SELECT groupNumericIndexedVectorState(UserID, PlayTime) as res, toTypeName(res), numericIndexedVectorAllValueSum(res) FROM t;
┌─res─┬─toTypeName(res)─────────────────────────────────────────────┬─numericIndexedVectorAllValueSum(res)──┐
│     │ AggregateFunction(groupNumericIndexedVector, UInt8, UInt8)  │ 60                                    │
└─────┴─────────────────────────────────────────────────────────────┴───────────────────────────────────────┘

SELECT groupNumericIndexedVectorStateIf(UserID, PlayTime, day = '2025-04-22') as res, toTypeName(res), numericIndexedVectorAllValueSum(res) FROM t;
┌─res─┬─toTypeName(res)────────────────────────────────────────────┬─numericIndexedVectorAllValueSum(res)──┐
│     │ AggregateFunction(groupNumericIndexedVector, UInt8, UInt8) │ 30                                    │
└─────┴────────────────────────────────────────────────────────────┴───────────────────────────────────────┘

SELECT groupNumericIndexedVectorStateIf('BSI', 32, 0)(UserID, PlayTime, day = '2025-04-22') as res, toTypeName(res), numericIndexedVectorAllValueSum(res) FROM t;
┌─res─┬─toTypeName(res)──────────────────────────────────────────────────────────┬─numericIndexedVectorAllValueSum(res)──┐
│     │ AggregateFunction('BSI', 32, 0)(groupNumericIndexedVector, UInt8, UInt8) │ 30                                    │
└─────┴──────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────┘
```

## numericIndexedVectorBuild {#numeric-indexed-vector-build}

マップからNumericIndexedVectorを作成します。マップのキーはベクターのインデックスを表し、マップの値はベクターの値を表します。

構文

```sql
numericIndexedVectorBuild(map)
```

引数

- `map` – インデックスから値へのマッピング。

例

```sql
SELECT numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30])) AS res, toTypeName(res);
```

結果

```text
┌─res─┬─toTypeName(res)────────────────────────────────────────────┐
│     │ AggregateFunction(groupNumericIndexedVector, UInt8, UInt8) │
└─────┴────────────────────────────────────────────────────────────┘
```

## numericIndexedVectorToMap

NumericIndexedVectorをマップに変換します。

構文

```sql
numericIndexedVectorToMap(numericIndexedVector)
```

引数

- `numericIndexedVector` – NumericIndexedVectorオブジェクト。

例

```sql
SELECT numericIndexedVectorToMap(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

結果

```text
┌─res──────────────┐
│ {1:10,2:20,3:30} │
└──────────────────┘
```

## numericIndexedVectorCardinality

NumericIndexedVectorのカーディナリティ（ユニークなインデックスの数）を返します。

構文

```sql
numericIndexedVectorCardinality(numericIndexedVector)
```

引数

- `numericIndexedVector` – NumericIndexedVectorオブジェクト。

例

```sql
SELECT numericIndexedVectorCardinality(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

結果

```text
┌─res─┐
│  3  │
└─────┘
```

## numericIndexedVectorAllValueSum

NumericIndexedVectorのすべての値の合計を返します。

構文

```sql
numericIndexedVectorAllValueSum(numericIndexedVector)
```

引数

- `numericIndexedVector` – NumericIndexedVectorオブジェクト。

例

```sql
SELECT numericIndexedVectorAllValueSum(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

結果

```text
┌─res─┐
│  60 │
└─────┘
```

## numericIndexedVectorGetValue

指定されたインデックスに対応する値を取得します。

構文

```sql
numericIndexedVectorGetValue(numericIndexedVector, index)
```

引数

- `numericIndexedVector` – NumericIndexedVectorオブジェクト。
- `index` – 値を取得するインデックス。

例

```sql
SELECT numericIndexedVectorGetValue(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30])), 3) AS res;
```

結果

```text
┌─res─┐
│  30 │
└─────┘
```

## numericIndexedVectorShortDebugString

NumericIndexedVectorの内部情報をJSON形式で返します。この関数は主にデバッグ目的で使用されます。

構文

```sql
numericIndexedVectorShortDebugString(numericIndexedVector)
```

引数

- `numericIndexedVector` – NumericIndexedVectorオブジェクト。

例

```sql
SELECT numericIndexedVectorShortDebugString(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res\G;
```
結果

```text
Row 1:
──────
res: {"vector_type":"BSI","index_type":"char8_t","value_type":"char8_t","integer_bit_num":8,"fraction_bit_num":0,"zero_indexes_info":{"cardinality":"0"},"non_zero_indexes_info":{"total_cardinality":"3","all_value_sum":60,"number_of_bitmaps":"8","bitmap_info":{"cardinality":{"0":"0","1":"2","2":"2","3":"2","4":"2","5":"0","6":"0","7":"0"}}}}
```

- `vector_type`: ベクターのストレージタイプ、現在は`BSI`のみがサポートされています。
- `index_type`: インデックスタイプ。
- `value_type`: 値のタイプ。

以下の情報はBSIベクタータイプで有効です。

- `integer_bit_num`: 整数部分に使用されるビット数。
- `fraction_bit_num`: 小数部分に使用されるビット数。
- `zero_indexes info`: 値が0に等しいインデックスの情報
    - `cardinality`: 値が0に等しいインデックスの数。
- `non_zero_indexes info`: 値が0に等しくないインデックスの情報
    - `total_cardinality`: 値が0に等しくないインデックスの数。
    - `all value sum`: すべての値の合計。
    - `number_of_bitmaps`: 値が0に等しくないこのインデックスによって使用されるビットマップの数。
    - `bitmap_info`: 各ビットマップの情報
        - `cardinality`: 各ビットマップ内のインデックスの数。

## numericIndexedVectorPointwiseAdd

NumericIndexedVectorと別のNumericIndexedVectorまたは数値定数との点ごとの加算を行います。関数は新しいNumericIndexedVectorを返します。

構文

```sql
numericIndexedVectorPointwiseAdd(numericIndexedVector, numericIndexedVector | numeric)
```

引数

- `numericIndexedVector` – NumericIndexedVectorオブジェクト。
- `numeric` - 数値定数。

例

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseAdd(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseAdd(vec1, 2)) AS res2;
```

結果

```text
┌─res1──────────────────┬─res2─────────────┐
│ {1:10,2:30,3:50,4:30} │ {1:12,2:22,3:32} │
└───────────────────────┴──────────────────┘
```

## numericIndexedVectorPointwiseSubtract

NumericIndexedVectorと別のNumericIndexedVectorまたは数値定数との点ごとの減算を行います。関数は新しいNumericIndexedVectorを返します。

構文

```sql
numericIndexedVectorPointwiseSubtract(numericIndexedVector, numericIndexedVector | numeric)
```

引数

- `numericIndexedVector` – NumericIndexedVectorオブジェクト。
- `numeric` - 数値定数。

例

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseSubtract(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseSubtract(vec1, 2)) AS res2;
```

結果

```text
┌─res1───────────────────┬─res2────────────┐
│ {1:10,2:10,3:10,4:-30} │ {1:8,2:18,3:28} │
└────────────────────────┴─────────────────┘
```

## numericIndexedVectorPointwiseMultiply

NumericIndexedVectorと別のNumericIndexedVectorまたは数値定数との点ごとの乗算を行います。関数は新しいNumericIndexedVectorを返します。

構文

```sql
numericIndexedVectorPointwiseMultiply(numericIndexedVector, numericIndexedVector | numeric)
```

引数

- `numericIndexedVector` – NumericIndexedVectorオブジェクト。
- `numeric` - 数値定数。

例

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseMultiply(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseMultiply(vec1, 2)) AS res2;
```

結果

```text
┌─res1──────────┬─res2─────────────┐
│ {2:200,3:600} │ {1:20,2:40,3:60} │
└───────────────┴──────────────────┘
```

## numericIndexedVectorPointwiseDivide

NumericIndexedVectorと別のNumericIndexedVectorまたは数値定数との点ごとの除算を行います。関数は新しいNumericIndexedVectorを返します。除数がゼロのとき、結果はゼロになります。

構文

```sql
numericIndexedVectorPointwiseDivide(numericIndexedVector, numericIndexedVector | numeric)
```

引数

- `numericIndexedVector` – NumericIndexedVectorオブジェクト。
- `numeric` - 数値定数。

例

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseDivide(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseDivide(vec1, 2)) AS res2;
```

結果

```text
┌─res1────────┬─res2────────────┐
│ {2:2,3:1.5} │ {1:5,2:10,3:15} │
└─────────────┴─────────────────┘
```

## numericIndexedVectorPointwiseEqual

NumericIndexedVectorと別のNumericIndexedVectorまたは数値定数との点ごとの比較を実行します。結果は、値が等しいインデックスを含むNumericIndexedVectorであり、すべての対応する値は1に設定されます。

構文

```sql
numericIndexedVectorPointwiseEqual(numericIndexedVector, numericIndexedVector | numeric)
```

引数

- `numericIndexedVector` – NumericIndexedVectorオブジェクト。
- `numeric` - 数値定数。

例

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseEqual(vec1, 20)) AS res2;
```

結果

```text
┌─res1──┬─res2──┐
│ {2:1} │ {2:1} │
└───────┴───────┘
```

## numericIndexedVectorPointwiseNotEqual

NumericIndexedVectorと別のNumericIndexedVectorまたは数値定数との点ごとの比較を実行します。結果は、値が等しくないインデックスを含むNumericIndexedVectorであり、すべての対応する値は1に設定されます。

構文

```sql
numericIndexedVectorPointwiseNotEqual(numericIndexedVector, numericIndexedVector | numeric)
```

引数

- `numericIndexedVector` – NumericIndexedVectorオブジェクト。
- `numeric` - 数値定数。

例

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseNotEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseNotEqual(vec1, 20)) AS res2;
```

結果

```text
┌─res1──────────┬─res2──────┐
│ {1:1,3:1,4:1} │ {1:1,3:1} │
└───────────────┴───────────┘
```

## numericIndexedVectorPointwiseLess

NumericIndexedVectorと別のNumericIndexedVectorまたは数値定数との点ごとの比較を実行します。結果は、最初のベクターの値が2番目のベクターの値より小さいインデックスを含むNumericIndexedVectorであり、すべての対応する値は1に設定されます。

構文

```sql
numericIndexedVectorPointwiseLess(numericIndexedVector, numericIndexedVector | numeric)
```

引数

- `numericIndexedVector` – NumericIndexedVectorオブジェクト。
- `numeric` - 数値定数。

例

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLess(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLess(vec1, 20)) AS res2;
```

結果

```text
┌─res1──────┬─res2──┐
│ {3:1,4:1} │ {1:1} │
└───────────┴───────┘
```

## numericIndexedVectorPointwiseLessEqual

NumericIndexedVectorと別のNumericIndexedVectorまたは数値定数との点ごとの比較を実行します。結果は、最初のベクターの値が2番目のベクターの値以下のインデックスを含むNumericIndexedVectorであり、すべての対応する値は1に設定されます。

構文

```sql
numericIndexedVectorPointwiseLessEqual(numericIndexedVector, numericIndexedVector | numeric)
```

引数

- `numericIndexedVector` – NumericIndexedVectorオブジェクト。
- `numeric` - 数値定数。

例

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLessEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLessEqual(vec1, 20)) AS res2;
```

結果

```text
┌─res1──────────┬─res2──────┐
│ {2:1,3:1,4:1} │ {1:1,2:1} │
└───────────────┴───────────┘
```

## numericIndexedVectorPointwiseGreater

NumericIndexedVectorと別のNumericIndexedVectorまたは数値定数との点ごとの比較を実行します。結果は、最初のベクターの値が2番目のベクターの値より大きいインデックスを含むNumericIndexedVectorであり、すべての対応する値は1に設定されます。

構文

```sql
numericIndexedVectorPointwiseGreater(numericIndexedVector, numericIndexedVector | numeric)
```

引数

- `numericIndexedVector` – NumericIndexedVectorオブジェクト。
- `numeric` - 数値定数。

例

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 50]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreater(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreater(vec1, 20)) AS res2;
```

結果

```text
┌─res1──────┬─res2──┐
│ {1:1,3:1} │ {3:1} │
└───────────┴───────┘
```

## numericIndexedVectorPointwiseGreaterEqual

NumericIndexedVectorと別のNumericIndexedVectorまたは数値定数との点ごとの比較を実行します。結果は、最初のベクターの値が2番目のベクターの値以上のインデックスを含むNumericIndexedVectorであり、すべての対応する値は1に設定されます。

構文

```sql
numericIndexedVectorPointwiseGreaterEqual(numericIndexedVector, numericIndexedVector | numeric)
```

引数

- `numericIndexedVector` – NumericIndexedVectorオブジェクト。
- `numeric` - 数値定数。

例

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 50]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreaterEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreaterEqual(vec1, 20)) AS res2;
```

結果

```text
┌─res1──────────┬─res2──────┐
│ {1:1,2:1,3:1} │ {2:1,3:1} │
└───────────────┴───────────┘
```

<!-- 
the tags below are used to generate the documentation from system tables, and should not be removed.
For more details see https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
