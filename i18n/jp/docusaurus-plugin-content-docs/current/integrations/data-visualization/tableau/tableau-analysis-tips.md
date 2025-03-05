---
sidebar_label: 分析のヒント
sidebar_position: 4
slug: /integrations/tableau/analysis-tips
keywords: [clickhouse, tableau, online, mysql, connect, integrate, ui]
description: ClickHouse公式コネクタを使用する際のTableau分析のヒント。
---


# 分析のヒント
## MEDIAN() と PERCENTILE() 関数 {#median-and-percentile-functions}
- Liveモードでは、MEDIAN() と PERCENTILE() 関数（コネクタ v0.1.3 リリース以来）は、[ClickHouseの quantile()() 関数](/sql-reference/aggregate-functions/reference/quantile/)を使用しており、計算速度を大幅に向上させますが、サンプリングを使用します。正確な計算結果を得たい場合は、`MEDIAN_EXACT()` と `PERCENTILE_EXACT()` 関数（[quantileExact()()](/sql-reference/aggregate-functions/reference/quantileexact/)に基づく）を使用してください。
- Extractモードでは、MEDIAN_EXACT() と PERCENTILE_EXACT() を使用できません。なぜなら、MEDIAN() と PERCENTILE() は常に正確だからです（ただし遅いです）。

## Liveモードの計算フィールド用の追加関数 {#additional-functions-for-calculated-fields-in-live-mode}
ClickHouseにはデータ分析に使用できる膨大な数の関数があり、Tableauがサポートしているものよりもはるかに多いです。ユーザーの便宜のために、計算フィールドを作成する際に Liveモードで使用可能な新しい関数を追加しました。残念ながら、Tableauインターフェース内でこれらの関数に説明を追加することはできないため、ここに説明を追加します。
- **[`-If` 集約コンビネーター](/sql-reference/aggregate-functions/combinators/#-if)** *(v0.2.3で追加)* - 集約計算内に行レベルのフィルターを持つことができます。 `SUM_IF(), AVG_IF(), COUNT_IF(), MIN_IF() & MAX_IF()` 関数が追加されました。
- **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** *(v0.2.1で追加)* — 退屈な棒グラフは忘れてください！代わりに `BAR()` 関数を使用してください（ClickHouseの[`bar()`](/sql-reference/functions/other-functions/#function-bar)に相当）。例えば、この計算フィールドは文字列として素敵なバーを返します：
    ```text
    BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
    ```
    ```text
    == BAR() ==
    ██████████████████▊  327.06百万
    █████  88.02百万
    ███████████████  259.37百万
    ```
- **`COUNTD_UNIQ([my_field])`** *(v0.2.0で追加)* — 引数の異なる値の近似数を計算します。 [uniq()](/sql-reference/aggregate-functions/reference/uniq/)に相当します。 `COUNTD()` よりもはるかに高速です。
- **`DATE_BIN('day', 10, [my_datetime_or_date])`** *(v0.2.1で追加)* — ClickHouseの[`toStartOfInterval()`](/sql-reference/functions/date-time-functions/#tostartofintervaltime-or-data-interval-x-unit-time-zone)に相当します。指定した間隔に日付または日時を切り捨てます。例えば：
    ```text
     == my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
        28.07.2004 06:54:50    |              21.07.2004 00:00:00
        17.07.2004 14:01:56    |              11.07.2004 00:00:00
        14.07.2004 07:43:00    |              11.07.2004 00:00:00
    ```
- **`FORMAT_READABLE_QUANTITY([my_integer])`** *(v0.2.1で追加)* — サフィックス（千、百万、十億など）付きの丸められた数値を文字列として返します。人間が大きな数字を読み取るために便利です。 [`formatReadableQuantity()`](/sql-reference/functions/other-functions/#formatreadablequantityx) に相当します。
- **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** *(v0.2.1で追加)* — 秒単位の時間差を受け取ります。年、月、日、時、分、秒の形式で時間差を文字列として返します。 `optional_max_unit` は表示する最大単位です。受け入れ可能な値: `seconds`, `minutes`, `hours`, `days`, `months`, `years`。 [`formatReadableTimeDelta()`](/sql-reference/functions/other-functions/#formatreadabletimedelta) に相当します。
- **`GET_SETTING([my_setting_name])`** *(v0.2.1で追加)* — カスタム設定の現在の値を返します。 [`getSetting()`](/sql-reference/functions/other-functions/#getSetting) に相当します。
- **`HEX([my_string])`** *(v0.2.1で追加)* — 引数の16進数表現を含む文字列を返します。 [`hex()`](/sql-reference/functions/encoding-functions/#hex) に相当します。
- **`KURTOSIS([my_number])`** — シーケンスのサンプル尖度を計算します。 [`kurtSamp()`](/sql-reference/aggregate-functions/reference/kurtsamp/#kurtsamp) に相当します。
- **`KURTOSISP([my_number])`** — シーケンスの尖度を計算します。 [`kurtPop()`](/sql-reference/aggregate-functions/reference/kurtpop/#kurtpop) に相当します。
- **`MEDIAN_EXACT([my_number])`** *(v0.1.3で追加)* — 数値データシーケンスの中央値を正確に計算します。 [`quantileExact(0.5)(...)`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact) に相当します。
- **`MOD([my_number_1], [my_number_2])`** — 除算後の余りを計算します。引数が浮動小数点数の場合、小数部分を切り捨てて整数に変換します。 [`modulo()`](/sql-reference/functions/arithmetic-functions/#modulo) に相当します。
- **`PERCENTILE_EXACT([my_number], [level_float])`** *(v0.1.3で追加)* — 数値データのパーセンタイルを正確に計算します。推奨されるレベル範囲は [0.01, 0.99] です。 [`quantileExact()()`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact) に相当します。
- **`PROPER([my_string])`** *(v0.2.5で追加)* - テキスト文字列を、それぞれの単語の最初の文字を大文字にし、残りの文字を小文字に変換します。スペースや句読点などの非英数字もセパレーターとして機能します。例えば：
    ```text
    PROPER("PRODUCT name") => "Product Name"
    ```
    ```text
    PROPER("darcy-mae") => "Darcy-Mae"
    ```
- **`RAND()`** *(v0.2.1で追加)* — 整数 (UInt32) 数値を返します。例えば `3446222955`。 [`rand()`](/sql-reference/functions/random-functions/#rand) に相当します。
- **`RANDOM()`** *(v0.2.1で追加)* — 非公式な [`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results) Tableau関数で、0と1の間の浮動小数点数を返します。
- **`RAND_CONSTANT([optional_field])`** *(v0.2.1で追加)* — ランダムな値を持つ定数カラムを生成します。`{RAND()}` 固定LODのようなものですが、高速です。 [`randConstant()`](/sql-reference/functions/random-functions/#randconstant) に相当します。
- **`REAL([my_number])`** — フィールドを浮動小数点数 (Float64) にキャストします。詳細は[`ここ`](/sql-reference/data-types/decimal/#operations-and-result-type)をご覧ください。
- **`SHA256([my_string])`** *(v0.2.1で追加)* — 文字列からSHA-256ハッシュを計算し、結果のバイトセットを文字列 (FixedString) として返します。`HEX()` 関数と一緒に使うと便利です。例えば、`HEX(SHA256([my_string]))`。 [`SHA256()`](/sql-reference/functions/hash-functions/#sha) に相当します。
- **`SKEWNESS([my_number])`** — シーケンスのサンプル歪度を計算します。 [`skewSamp()`](/sql-reference/aggregate-functions/reference/skewsamp/#skewsamp) に相当します。
- **`SKEWNESSP([my_number])`** — シーケンスの歪度を計算します。 [`skewPop()`](/sql-reference/aggregate-functions/reference/skewpop/#skewpop) に相当します。
- **`TO_TYPE_NAME([field])`** *(v0.2.1で追加)* — 引数の ClickHouse 型名を含む文字列を返します。 [`toTypeName()`](/sql-reference/functions/other-functions/#totypenamex) に相当します。
- **`TRUNC([my_float])`** — `FLOOR([my_float])` 関数と同じです。 [`trunc()`](/sql-reference/functions/rounding-functions/#truncx-n-truncatex-n) に相当します。
- **`UNHEX([my_string])`** *(v0.2.1で追加)* — `HEX()` の逆の操作を行います。 [`unhex()`](/sql-reference/functions/encoding-functions/#unhexstr) に相当します。
