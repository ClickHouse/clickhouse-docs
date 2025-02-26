---
sidebar_label: 分析のヒント
sidebar_position: 4
slug: /integrations/tableau/analysis-tips
keywords: [clickhouse, tableau, online, mysql, connect, integrate, ui]
description: ClickHouse公式コネクターを使用する際のTableau分析のヒント。
---

# 分析のヒント
## MEDIAN() および PERCENTILE() 関数 {#median-and-percentile-functions}
- ライブモードでは、MEDIAN() および PERCENTILE() 関数（コネクタ v0.1.3 リリース以降）は、[ClickHouse の quantile() 関数](/sql-reference/aggregate-functions/reference/quantile/)を使用し、計算を大幅に高速化しますが、サンプリングを使用します。正確な計算結果を得たい場合は、`MEDIAN_EXACT()` および `PERCENTILE_EXACT()` 関数を使用してください（[quantileExact() 関数](/sql-reference/aggregate-functions/reference/quantileexact/)に基づいています）。
- エクストラクトモードでは、MEDIAN_EXACT() および PERCENTILE_EXACT() を使用できません。なぜなら、MEDIAN() および PERCENTILE() は常に正確で（遅い）からです。
## ライブモードの計算フィールドにおける追加関数 {#additional-functions-for-calculated-fields-in-live-mode}
ClickHouse にはデータ分析に使用できる膨大な数の関数があり、Tableau がサポートするものよりもはるかに多くなっています。ユーザーの便宜のために、計算フィールドを作成する際にライブモードで使用できる新しい関数を追加しました。残念ながら、Tableau インターフェースにこれらの関数の説明を追加することはできないため、ここに説明を追加します。
- **[`-If` 集約コンビネータ](/sql-reference/aggregate-functions/combinators/#-if)** *(v0.2.3 に追加)* - 集約計算の中で行レベルフィルターを持つことを可能にします。`SUM_IF(), AVG_IF(), COUNT_IF(), MIN_IF() および MAX_IF()` 関数が追加されました。
- **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** *(v0.2.1 に追加)* — 退屈な棒グラフは忘れましょう！代わりに `BAR()` 関数を使用してください（ClickHouse における [`bar()`](/sql-reference/functions/other-functions/#function-bar) の相当物）。たとえば、この計算フィールドは文字列として美しいバーを返します：
    ```text
    BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
    ```
    ```text
    == BAR() ==
    ██████████████████▊  327.06百万
    █████  88.02百万
    ███████████████  259.37百万
    ```
- **`COUNTD_UNIQ([my_field])`** *(v0.2.0 に追加)* — 引数の異なる値の近似数を計算します。相当するのは [uniq()](/sql-reference/aggregate-functions/reference/uniq/) です。`COUNTD()` よりもずっと速いです。
- **`DATE_BIN('day', 10, [my_datetime_or_date])`** *(v0.2.1 に追加)* — ClickHouse の [`toStartOfInterval()`](/sql-reference/functions/date-time-functions/#tostartofintervaltime-or-data-interval-x-unit-time-zone) と相当します。日付または日時を指定したインターバルに切り下げます。たとえば：
    ```text
     == my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
        28.07.2004 06:54:50    |              21.07.2004 00:00:00
        17.07.2004 14:01:56    |              11.07.2004 00:00:00
        14.07.2004 07:43:00    |              11.07.2004 00:00:00
    ```
- **`FORMAT_READABLE_QUANTITY([my_integer])`** *(v0.2.1 に追加)* — 数値に接尾辞（千、百万、十億など）を付けて丸めた数を文字列として返します。これは人間が大きな数を読みやすくするのに役立ちます。相当するのは [`formatReadableQuantity()`](/sql-reference/functions/other-functions/#formatreadablequantityx) です。
- **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** *(v0.2.1 に追加)* — 時間の差を秒単位で受け取ります。年、月、日、時間、分、秒の形式で時間の差を文字列で返します。`optional_max_unit` は表示する最大単位です。受け入れ可能な値：`seconds`, `minutes`, `hours`, `days`, `months`, `years`。相当するのは [`formatReadableTimeDelta()`](/sql-reference/functions/other-functions/#formatreadabletimedelta) です。
- **`GET_SETTING([my_setting_name])`** *(v0.2.1 に追加)* — カスタム設定の現在の値を返します。相当するのは [`getSetting()`](/sql-reference/functions/other-functions/#getSetting) です。
- **`HEX([my_string])`** *(v0.2.1 に追加)* — 引数の16進数表現を含む文字列を返します。相当するのは [`hex()`](/sql-reference/functions/encoding-functions/#hex) です。
- **`KURTOSIS([my_number])`** — シーケンスのサンプル尖度を計算します。相当するのは [`kurtSamp()`](/sql-reference/aggregate-functions/reference/kurtsamp/#kurtsamp) です。
- **`KURTOSISP([my_number])`** — シーケンスの尖度を計算します。相当するのは [`kurtPop()`](/sql-reference/aggregate-functions/reference/kurtpop/#kurtpop) です。
- **`MEDIAN_EXACT([my_number])`** *(v0.1.3 に追加)* — 数値データシーケンスの中央値を正確に計算します。相当するのは [`quantileExact(0.5)(...)`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact) です。
- **`MOD([my_number_1], [my_number_2])`** — 除算後の余りを計算します。引数が浮動小数点数の場合、小数部分が切り捨てられて整数に事前変換されます。相当するのは [`modulo()`](/sql-reference/functions/arithmetic-functions/#modulo) です。
- **`PERCENTILE_EXACT([my_number], [level_float])`** *(v0.1.3 に追加)* — 数値データシーケンスのパーセンタイルを正確に計算します。推奨されるレベル範囲は [0.01, 0.99] です。相当するのは [`quantileExact()()`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact) です。
- **`PROPER([my_string])`** *(v0.2.5 に追加)* - テキスト文字列を変換し、各単語の最初の文字を大文字にし、残りの文字を小文字にします。スペースや句読点などの非英数字文字も区切り記号として機能します。たとえば：
    ```text
    PROPER("PRODUCT name") => "Product Name"
    ```
    ```text
    PROPER("darcy-mae") => "Darcy-Mae"
    ```
- **`RAND()`** *(v0.2.1 に追加)* — 整数 (UInt32) 数値を返します。たとえば `3446222955`。相当するのは [`rand()`](/sql-reference/functions/random-functions/#rand) です。
- **`RANDOM()`** *(v0.2.1 に追加)* — 非公式な [`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results) Tableau 関数で、0 と 1 の間の浮動小数点数を返します。
- **`RAND_CONSTANT([optional_field])`** *(v0.2.1 に追加)* — ランダムな値を持つ定数カラムを生成します。`{RAND()}` 固定 LOD のようなものですが、より高速です。相当するのは [`randConstant()`](/sql-reference/functions/random-functions/#randconstant) です。
- **`REAL([my_number])`** — フィールドを浮動小数点数 (Float64) にキャストします。詳細は [`ここ`](/sql-reference/data-types/decimal/#operations-and-result-type) です。
- **`SHA256([my_string])`** *(v0.2.1 に追加)* — 文字列から SHA-256 ハッシュを計算し、結果のバイトセットを文字列 (FixedString) として返します。`HEX()` 関数と一緒に使うのが便利です。たとえば、`HEX(SHA256([my_string]))`。相当するのは [`SHA256()`](/sql-reference/functions/hash-functions/#sha) です。
- **`SKEWNESS([my_number])`** — シーケンスのサンプル歪度を計算します。相当するのは [`skewSamp()`](/sql-reference/aggregate-functions/reference/skewsamp/#skewsamp) です。
- **`SKEWNESSP([my_number])`** — シーケンスの歪度を計算します。相当するのは [`skewPop()`](/sql-reference/aggregate-functions/reference/skewpop/#skewpop) です。
- **`TO_TYPE_NAME([field])`** *(v0.2.1 に追加)* — 済み引数の ClickHouse 型名を含む文字列を返します。相当するのは [`toTypeName()`](/sql-reference/functions/other-functions/#totypenamex) です。
- **`TRUNC([my_float])`** — `FLOOR([my_float])` 関数と同じです。相当するのは [`trunc()`](/sql-reference/functions/rounding-functions/#truncx-n-truncatex-n) です。
- **`UNHEX([my_string])`** *(v0.2.1 に追加)* — `HEX()` の逆の操作を実行します。相当するのは [`unhex()`](/sql-reference/functions/encoding-functions/#unhexstr) です。
