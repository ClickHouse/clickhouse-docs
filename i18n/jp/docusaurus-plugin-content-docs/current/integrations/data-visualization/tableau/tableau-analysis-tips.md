---
'sidebar_label': 'Analysis Tips'
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
'description': 'ClickHouse 公式コネクタを使用する際のTableau解析のヒント。'
'title': 'Analysis tips'
---




# 分析のヒント
## MEDIAN() および PERCENTILE() 関数 {#median-and-percentile-functions}
- ライブモードでは、MEDIAN() および PERCENTILE() 関数（コネクタ v0.1.3 リリース以降）は [ClickHouse quantile()() 関数](/sql-reference/aggregate-functions/reference/quantile/) を使用し、計算速度が大幅に向上しますが、サンプリングを利用します。正確な計算結果が必要な場合は、`MEDIAN_EXACT()` および `PERCENTILE_EXACT()` 関数を使用してください（[quantileExact()()](/sql-reference/aggregate-functions/reference/quantileexact/) に基づく）。
- エクストラクトモードでは、MEDIAN_EXACT() および PERCENTILE_EXACT() を使用できません。なぜなら、MEDIAN() および PERCENTILE() は常に正確（そして遅い）だからです。
## ライブモードでの計算フィールドのための追加関数 {#additional-functions-for-calculated-fields-in-live-mode}
ClickHouse にはデータ分析に使用できる関数が多数あり、Tableau がサポートしているものよりも遥かに多くあります。ユーザーの便宜のために、計算フィールドを作成する際にライブモードで使用可能な新しい関数を追加しました。残念ながら、Tableau インターフェイスにはこれらの関数の説明を追加することができないため、ここに説明を追加します。
- **[`-If` 集約コンビネータ](/sql-reference/aggregate-functions/combinators/#-if)** *(v0.2.3 に追加)* - 集約計算内に行レベルのフィルターを持つことができます。`SUM_IF(), AVG_IF(), COUNT_IF(), MIN_IF() & MAX_IF()` 関数が追加されました。
- **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** *(v0.2.1 に追加)* — 退屈な棒グラフは忘れましょう！代わりに `BAR()` 関数を使用してください（ClickHouse の [`bar()`](/sql-reference/functions/other-functions#bar) と同等）。例えば、この計算フィールドは文字列として美しい棒を返します：
    ```text
    BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
    ```
    ```text
    == BAR() ==
    ██████████████████▊  327.06 million
    █████  88.02 million
    ███████████████  259.37 million
    ```
- **`COUNTD_UNIQ([my_field])`** *(v0.2.0 に追加)* — 引数の異なる値の近似数を計算します。[uniq()](/sql-reference/aggregate-functions/reference/uniq/) と同等。`COUNTD()` よりもはるかに高速です。
- **`DATE_BIN('day', 10, [my_datetime_or_date])`** *(v0.2.1 に追加)* — ClickHouse の [`toStartOfInterval()`](/sql-reference/functions/date-time-functions#tostartofinterval) と同等。与えられたインターバルに基づいて日付または日付と時間を切り捨てます。例えば：
    ```text
     == my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
        28.07.2004 06:54:50    |              21.07.2004 00:00:00
        17.07.2004 14:01:56    |              11.07.2004 00:00:00
        14.07.2004 07:43:00    |              11.07.2004 00:00:00
    ```
- **`FORMAT_READABLE_QUANTITY([my_integer])`** *(v0.2.1 に追加)* — 接尾辞（千、百万、十億など）を伴った丸めた数値を文字列として返します。これは人間が大きな数を読むのに便利です。[`formatReadableQuantity()`](/sql-reference/functions/other-functions#formatreadablequantity) と同等。
- **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** *(v0.2.1 に追加)* — 秒単位の時間差を受け取ります。文字列として (年、月、日、時間、分、秒) の時間差を返します。`optional_max_unit` は表示する最大単位です。受け入れ可能な値：`seconds`, `minutes`, `hours`, `days`, `months`, `years`。[`formatReadableTimeDelta()`](/sql-reference/functions/other-functions/#formatreadabletimedelta) と同等。
- **`GET_SETTING([my_setting_name])`** *(v0.2.1 に追加)* — カスタム設定の現在の値を返します。[`getSetting()`](/sql-reference/functions/other-functions#getsetting) と同等。
- **`HEX([my_string])`** *(v0.2.1 に追加)* — 引数の16進数表現を含む文字列を返します。[`hex()`](/sql-reference/functions/encoding-functions/#hex) と同等。
- **`KURTOSIS([my_number])`** — 数列のサンプル尖度を計算します。[`kurtSamp()`](/sql-reference/aggregate-functions/reference/kurtsamp) と同等。
- **`KURTOSISP([my_number])`** — 数列の尖度を計算します。[`kurtPop()`](/sql-reference/aggregate-functions/reference/kurtpop) と同等。
- **`MEDIAN_EXACT([my_number])`** *(v0.1.3 に追加)* — 数値データのシーケンスの中央値を正確に計算します。[`quantileExact(0.5)(...)`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact) と同等。
- **`MOD([my_number_1], [my_number_2])`** — 割り算の余りを計算します。引数が浮動小数点数である場合、小数部分を切り捨てて整数に変換されます。[`modulo()`](/sql-reference/functions/arithmetic-functions/#modulo) と同等。
- **`PERCENTILE_EXACT([my_number], [level_float])`** *(v0.1.3 に追加)* — 数値データシーケンスのパーセンタイルを正確に計算します。推奨されるレベル範囲は [0.01, 0.99] です。[`quantileExact()()`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact) と同等。
- **`PROPER([my_string])`** *(v0.2.5 に追加)* - 各単語の最初の文字を大文字にし、それ以外の文字は小文字に変換します。スペースや句読点などの非アルファベット文字も区切りとして作用します。例えば：
    ```text
    PROPER("PRODUCT name") => "Product Name"
    ```
    ```text
    PROPER("darcy-mae") => "Darcy-Mae"
    ```
- **`RAND()`** *(v0.2.1 に追加)* — 整数 (UInt32) の数を返します。例えば `3446222955`。[`rand()`](/sql-reference/functions/random-functions/#rand) と同等。
- **`RANDOM()`** *(v0.2.1 に追加)* — 非公式の [`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results) Tableau 関数で、0と1の間の浮動小数点数を返します。
- **`RAND_CONSTANT([optional_field])`** *(v0.2.1 に追加)* — ランダム値の定数カラムを生成します。 `{RAND()}` 固定 LOD に似ていますが、より高速です。[`randConstant()`](/sql-reference/functions/random-functions/#randconstant) と同等。
- **`REAL([my_number])`** — フィールドを浮動小数点数 (Float64) にキャストします。詳細は [`here`](/sql-reference/data-types/decimal/#operations-and-result-type)。
- **`SHA256([my_string])`** *(v0.2.1 に追加)* — 文字列からSHA-256ハッシュを計算し、得られたバイトセットを文字列 (FixedString) として返します。`HEX()` 関数と一緒に使うのが便利です。例えば、`HEX(SHA256([my_string]))`。[`SHA256()`](/sql-reference/functions/hash-functions#sha1-sha224-sha256-sha512-sha512_256) と同等。
- **`SKEWNESS([my_number])`** — 数列のサンプル歪度を計算します。[`skewSamp()`](/sql-reference/aggregate-functions/reference/skewsamp) と同等。
- **`SKEWNESSP([my_number])`** — 数列の歪度を計算します。[`skewPop()`](/sql-reference/aggregate-functions/reference/skewpop) と同等。
- **`TO_TYPE_NAME([field])`** *(v0.2.1 に追加)* — 渡された引数の ClickHouse 型名を含む文字列を返します。[`toTypeName()`](/sql-reference/functions/other-functions#totypename) と同等。
- **`TRUNC([my_float])`** — `FLOOR([my_float])` 関数と同じです。[`trunc()`](/sql-reference/functions/rounding-functions#truncate) と同等。
- **`UNHEX([my_string])`** *(v0.2.1 に追加)* — `HEX()` の逆操作を行います。[`unhex()`](/sql-reference/functions/encoding-functions#unhex) と同等。
