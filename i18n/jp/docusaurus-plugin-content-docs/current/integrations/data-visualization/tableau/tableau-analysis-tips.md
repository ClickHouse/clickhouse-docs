---
sidebar_label: '分析のヒント'
sidebar_position: 4
slug: /integrations/tableau/analysis-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'ClickHouse公式コネクタを使用する際のTableau分析のヒント。'
title: '分析のヒント'
---


# 分析のヒント
## MEDIAN() と PERCENTILE() 関数 {#median-and-percentile-functions}
- Live モードでは、MEDIAN() と PERCENTILE() 関数（コネクタ v0.1.3 リリース以降）は [ClickHouse の quantile() 関数](/sql-reference/aggregate-functions/reference/quantile/) を使用し、計算を大幅に高速化しますが、サンプリングを利用します。正確な計算結果を得たい場合は、関数 `MEDIAN_EXACT()` と `PERCENTILE_EXACT()`（[quantileExact() 関数](/sql-reference/aggregate-functions/reference/quantileexact/) に基づく）を使用してください。
- Extract モードでは、MEDIAN_EXACT() と PERCENTILE_EXACT() を使用できません。なぜなら、MEDIAN() と PERCENTILE() は常に正確（かつ遅い）だからです。
## Live モードの計算フィールド用の追加関数 {#additional-functions-for-calculated-fields-in-live-mode}
ClickHouse にはデータ分析に使用できる多くの関数が用意されており、Tableau がサポートしているよりもはるかに多くあります。ユーザーの便宜のために、計算フィールドを作成する際に Live モードで使用できる新しい関数を追加しました。残念ながら、Tableau インターフェースでこれらの関数に説明を追加することはできないため、ここで説明を追加します。
- **[`-If` 集約コンビネーター](/sql-reference/aggregate-functions/combinators/#-if)** *(v0.2.3 で追加)* - 集計計算の中で行レベルのフィルターを持つことを可能にします。`SUM_IF(), AVG_IF(), COUNT_IF(), MIN_IF() & MAX_IF()` 関数が追加されました。
- **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** *(v0.2.1 で追加)* — 退屈な棒グラフは忘れましょう！代わりに `BAR()` 関数を使用してください（ClickHouse の [`bar()`](/sql-reference/functions/other-functions#bar) と同等）。例えば、この計算フィールドは、文字列として美しいバーを返します：
    ```text
    BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
    ```
    ```text
    == BAR() ==
    ██████████████████▊  327.06 million
    █████  88.02 million
    ███████████████  259.37 million
    ```
- **`COUNTD_UNIQ([my_field])`** *(v0.2.0 で追加)* — 引数の異なる値の近似数を計算します。これは、[uniq()](/sql-reference/aggregate-functions/reference/uniq/) の同等物です。`COUNTD()` よりもはるかに速いです。
- **`DATE_BIN('day', 10, [my_datetime_or_date])`** *(v0.2.1 で追加)* — ClickHouse の [`toStartOfInterval()`](/sql-reference/functions/date-time-functions#tostartofinterval) の同等です。日付または日付＆時刻を指定された間隔に切り下げます。例えば：
    ```text
     == my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
        28.07.2004 06:54:50    |              21.07.2004 00:00:00
        17.07.2004 14:01:56    |              11.07.2004 00:00:00
        14.07.2004 07:43:00    |              11.07.2004 00:00:00
    ```
- **`FORMAT_READABLE_QUANTITY([my_integer])`** *(v0.2.1 で追加)* — サフィックス（千、百万、十億など）付きの丸められた数字を文字列として返します。これは、大きな数字を人間が読みやすくするのに便利です。これは、[formatReadableQuantity()](/sql-reference/functions/other-functions#formatreadablequantity) の同等物です。
- **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** *(v0.2.1 で追加)* — 秒単位の時間間隔を受け取ります。年、月、日、時間、分、秒としての時間間隔を文字列として返します。`optional_max_unit` は表示する最大単位です。許容される値： `seconds`, `minutes`, `hours`, `days`, `months`, `years`。これは、[formatReadableTimeDelta()](/sql-reference/functions/other-functions/#formatreadabletimedelta) の同等です。
- **`GET_SETTING([my_setting_name])`** *(v0.2.1 で追加)* — カスタム設定の現在の値を返します。これは、[getSetting()](/sql-reference/functions/other-functions#getsetting) の同等物です。
- **`HEX([my_string])`** *(v0.2.1 で追加)* — 引数の16進数表現を含む文字列を返します。これは、[hex()](/sql-reference/functions/encoding-functions/#hex) の同等物です。
- **`KURTOSIS([my_number])`** — シーケンスのサンプル尖度を計算します。これは、[kurtSamp()](/sql-reference/aggregate-functions/reference/kurtsamp) の同等物です。
- **`KURTOSISP([my_number])`** — シーケンスの尖度を計算します。これは、[kurtPop()](/sql-reference/aggregate-functions/reference/kurtpop) の同等物です。
- **`MEDIAN_EXACT([my_number])`** *(v0.1.3 で追加)* — 数値データ列の中央値を正確に計算します。これは、[quantileExact(0.5)(...) ](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact) の同等物です。
- **`MOD([my_number_1], [my_number_2])`** — 割り算の余りを計算します。引数が浮動小数点数の場合、小数部分を切り捨て整数に事前変換されます。これは、[modulo()](/sql-reference/functions/arithmetic-functions/#modulo) の同等物です。
- **`PERCENTILE_EXACT([my_number], [level_float])`** *(v0.1.3 で追加)* — 数値データ列のパーセンタイルを正確に計算します。推奨されるレベル範囲は [0.01, 0.99] です。これは、[quantileExact()() ](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact) の同等物です。
- **`PROPER([my_string])`** *(v0.2.5 で追加)* - 各単語の最初の文字を大文字にし、残りの文字を小文字に変換します。スペースや句読点などの非英数字もセパレーターとして機能します。例えば：
    ```text
    PROPER("PRODUCT name") => "Product Name"
    ```
    ```text
    PROPER("darcy-mae") => "Darcy-Mae"
    ```
- **`RAND()`** *(v0.2.1 で追加)* — 整数 (UInt32) 数を返します。例えば、`3446222955` のように。これは、[rand()](/sql-reference/functions/random-functions/#rand) の同等物です。
- **`RANDOM()`** *(v0.2.1 で追加)* — 浮動小数点数の 0 と 1 の間の値を返す非公式の [`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results) Tableau 関数です。
- **`RAND_CONSTANT([optional_field])`** *(v0.2.1 で追加)* — ランダムな値を持つ定数カラムを生成します。 `{RAND()}` のような固定 LOD ですが、より速いです。これは、[randConstant()](/sql-reference/functions/random-functions/#randconstant) の同等物です。
- **`REAL([my_number])`** — フィールドを浮動小数点（Float64）にキャストします。詳細は [`here`](/sql-reference/data-types/decimal/#operations-and-result-type) を参照してください。
- **`SHA256([my_string])`** *(v0.2.1 で追加)* — 文字列から SHA-256 ハッシュを計算し、結果のバイトセットを文字列（FixedString）として返します。 `HEX()` 関数と共に使用するのに便利です。例えば、`HEX(SHA256([my_string]))`。これは、[SHA256()](/sql-reference/functions/hash-functions#sha1-sha224-sha256-sha512-sha512_256) の同等物です。
- **`SKEWNESS([my_number])`** — シーケンスのサンプル歪度を計算します。これは、[skewSamp()](/sql-reference/aggregate-functions/reference/skewsamp) の同等物です。
- **`SKEWNESSP([my_number])`** — シーケンスの歪度を計算します。これは、[skewPop()](/sql-reference/aggregate-functions/reference/skewpop) の同等物です。
- **`TO_TYPE_NAME([field])`** *(v0.2.1 で追加)* — 引数の ClickHouse 型名を含む文字列を返します。これは、[toTypeName()](/sql-reference/functions/other-functions#totypename) の同等物です。
- **`TRUNC([my_float])`** — これは `FLOOR([my_float])` 関数と同じです。これは、[trunc()](/sql-reference/functions/rounding-functions#truncate) の同等物です。
- **`UNHEX([my_string])`** *(v0.2.1 で追加)* — `HEX()` の逆の操作を行います。これは、[unhex()](/sql-reference/functions/encoding-functions#unhex) の同等物です。
