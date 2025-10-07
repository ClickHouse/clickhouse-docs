---
'sidebar_label': '分析提示'
'sidebar_position': 4
'slug': '/integrations/tableau/analysis-tips'
'keywords':
- 'clickhouse'
- 'tableau'
- 'online'
- 'mysql'
- 'connect'
- 'integrate'
- 'ui'
'description': '使用 ClickHouse 公式コネクタ时的 Tableau 分析提示。'
'title': '分析提示'
'doc_type': 'guide'
---


# 分析のヒント
## MEDIAN() および PERCENTILE() 関数 {#median-and-percentile-functions}
- ライブモードでは、MEDIAN() および PERCENTILE() 関数（コネクタ v0.1.3 リリース以降）は、[ClickHouse quantile()() 関数](/sql-reference/aggregate-functions/reference/quantile/)を使用し、計算を大幅に高速化しますが、サンプリングを使用します。正確な計算結果が必要な場合は、`MEDIAN_EXACT()` および `PERCENTILE_EXACT()` 関数を使用してください（[quantileExact()()](/sql-reference/aggregate-functions/reference/quantileexact/) に基づいています）。
- エクストラクモードでは、MEDIAN_EXACT() および PERCENTILE_EXACT() を使用できません。なぜなら、MEDIAN() および PERCENTILE() は常に正確（しかし遅い）だからです。
## ライブモードの計算フィールド用の追加関数 {#additional-functions-for-calculated-fields-in-live-mode}
ClickHouse には、データ分析に使用できる関数が非常に多くあります — Tableau がサポートしているよりもはるかに多いです。ユーザーの利便性のために、計算フィールドを作成する際にライブモードで利用できる新しい関数を追加しました。残念ながら、これらの関数に対する説明を Tableau インターフェースに追加することはできないため、ここに説明を追加します。
- **[`-If` 集約コンビネータ](/sql-reference/aggregate-functions/combinators/#-if)** *(v0.2.3 で追加)* - 集約計算内で行レベルフィルタを持つことを可能にします。`SUM_IF(), AVG_IF(), COUNT_IF(), MIN_IF() & MAX_IF()` 関数が追加されました。
- **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** *(v0.2.1 で追加)* — 退屈な棒グラフは忘れてください！代わりに `BAR()` 関数を使用してください（ClickHouse の [`bar()`](/sql-reference/functions/other-functions#bar) に相当）。例えば、この計算フィールドはストリングとして美しいバーを返します：
```text
BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
```
```text
== BAR() ==
██████████████████▊  327.06 million
█████  88.02 million
███████████████  259.37 million
```
- **`COUNTD_UNIQ([my_field])`** *(v0.2.0 で追加)* — 引数の異なる値の近似数を計算します。Equivalent of [uniq()](/sql-reference/aggregate-functions/reference/uniq/)。`COUNTD()` よりもはるかに高速です。
- **`DATE_BIN('day', 10, [my_datetime_or_date])`** *(v0.2.1 で追加)* — ClickHouse の [`toStartOfInterval()`](/sql-reference/functions/date-time-functions#toStartOfInterval) に相当します。日付または日付と時刻を指定された間隔に切り捨てます。例えば：
```text
== my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
   28.07.2004 06:54:50    |              21.07.2004 00:00:00
   17.07.2004 14:01:56    |              11.07.2004 00:00:00
   14.07.2004 07:43:00    |              11.07.2004 00:00:00
```
- **`FORMAT_READABLE_QUANTITY([my_integer])`** *(v0.2.1 で追加)* — サフィックス（千、百万、十億など）を持つ丸められた数をストリングとして返します。大きな数を人間が読みやすくするのに便利です。Equivalent of [`formatReadableQuantity()`](/sql-reference/functions/other-functions#formatreadablequantity)。
- **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** *(v0.2.1 で追加)* — 秒単位の時間デルタを受け入れます。時間デルタ（日、月、年、時間、分、秒）をストリングとして返します。`optional_max_unit` は表示する最大単位です。受け入れ可能な値：`seconds`, `minutes`, `hours`, `days`, `months`, `years`。Equivalent of [`formatReadableTimeDelta()`](/sql-reference/functions/other-functions/#formatreadabletimedelta)。
- **`GET_SETTING([my_setting_name])`** *(v0.2.1 で追加)* — カスタム設定の現在の値を返します。Equivalent of [`getSetting()`](/sql-reference/functions/other-functions#getsetting)。
- **`HEX([my_string])`** *(v0.2.1 で追加)* — 引数の16進表現を含むストリングを返します。Equivalent of [`hex()`](/sql-reference/functions/encoding-functions/#hex)。
- **`KURTOSIS([my_number])`** — 数列のサンプルの尖度を計算します。Equivalent of [`kurtSamp()`](/sql-reference/aggregate-functions/reference/kurtsamp)。
- **`KURTOSISP([my_number])`** — 数列の尖度を計算します。Equivalent of [`kurtPop()`](/sql-reference/aggregate-functions/reference/kurtpop)。
- **`MEDIAN_EXACT([my_number])`** *(v0.1.3 で追加)* — 数値データ列の中央値を正確に計算します。Equivalent of [`quantileExact(0.5)(...)`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact)。
- **`MOD([my_number_1], [my_number_2])`** — 除算後の余りを計算します。引数が浮動小数点数の場合、小数部分を切り捨てて整数に前変換されます。Equivalent of [`modulo()`](/sql-reference/functions/arithmetic-functions/#modulo)。
- **`PERCENTILE_EXACT([my_number], [level_float])`** *(v0.1.3 で追加)* — 数値データ列のパーセンタイルを正確に計算します。推奨されるレベル範囲は [0.01, 0.99] です。Equivalent of [`quantileExact()()`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact)。
- **`PROPER([my_string])`** *(v0.2.5 で追加)* - テキストストリングを変換して、各単語の最初の文字を大文字にし、残りの文字を小文字にします。スペースや句読点のような非英数字文字もセパレーターとして機能します。例えば：
```text
PROPER("PRODUCT name") => "Product Name"
```
```text
PROPER("darcy-mae") => "Darcy-Mae"
```
- **`RAND()`** *(v0.2.1 で追加)* — 整数（UInt32）数を返します。例えば `3446222955`。Equivalent of [`rand()`](/sql-reference/functions/random-functions/#rand)。
- **`RANDOM()`** *(v0.2.1 で追加)* — 非公式な [`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results) Tableau 関数で、0 と 1 の間の浮動小数点数を返します。
- **`RAND_CONSTANT([optional_field])`** *(v0.2.1 で追加)* — ランダム値を持つ定数カラムを生成します。固定LODのような `{RAND()}` ですが、より高速です。Equivalent of [`randConstant()`](/sql-reference/functions/random-functions/#randconstant)。
- **`REAL([my_number])`** — フィールドを浮動小数点数（Float64）にキャストします。詳細は [`here`](/sql-reference/data-types/decimal/#operations-and-result-type)。
- **`SHA256([my_string])`** *(v0.2.1 で追加)* — ストリングから SHA-256 ハッシュを計算し、結果のバイトセットをストリング（FixedString）として返します。たとえば、`HEX(SHA256([my_string]))` と一緒に使用するのに便利です。Equivalent of [`SHA256()`](/sql-reference/functions/hash-functions#SHA256)。
- **`SKEWNESS([my_number])`** — 数列のサンプルの歪度を計算します。Equivalent of [`skewSamp()`](/sql-reference/aggregate-functions/reference/skewsamp)。
- **`SKEWNESSP([my_number])`** — 数列の歪度を計算します。Equivalent of [`skewPop()`](/sql-reference/aggregate-functions/reference/skewpop)。
- **`TO_TYPE_NAME([field])`** *(v0.2.1 で追加)* — 渡された引数の ClickHouse 型名を含むストリングを返します。Equivalent of [`toTypeName()`](/sql-reference/functions/other-functions#totypename)。
- **`TRUNC([my_float])`** — `FLOOR([my_float])` 関数と同じです。Equivalent of [`trunc()`](/sql-reference/functions/rounding-functions#truncate)。
- **`UNHEX([my_string])`** *(v0.2.1 で追加)* — `HEX()` の逆の操作を実行します。Equivalent of [`unhex()`](/sql-reference/functions/encoding-functions#unhex)。
