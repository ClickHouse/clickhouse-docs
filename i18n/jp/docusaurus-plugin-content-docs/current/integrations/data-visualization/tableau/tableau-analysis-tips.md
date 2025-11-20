---
sidebar_label: '分析のヒント'
sidebar_position: 4
slug: /integrations/tableau/analysis-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'ClickHouse 公式コネクタ使用時の Tableau での分析に関するヒント。'
title: '分析のヒント'
doc_type: 'guide'
---



# 分析のヒント

## MEDIAN()関数とPERCENTILE()関数 {#median-and-percentile-functions}

- Liveモードでは、MEDIAN()関数とPERCENTILE()関数（コネクタv0.1.3リリース以降）は[ClickHouse quantile()関数](/sql-reference/aggregate-functions/reference/quantile/)を使用します。これにより計算が大幅に高速化されますが、サンプリングが使用されます。正確な計算結果を得たい場合は、`MEDIAN_EXACT()`関数と`PERCENTILE_EXACT()`関数（[quantileExact()](/sql-reference/aggregate-functions/reference/quantileexact/)に基づく）を使用してください。
- Extractモードでは、MEDIAN()とPERCENTILE()は常に正確（ただし低速）であるため、MEDIAN_EXACT()とPERCENTILE_EXACT()を使用できません。

## Liveモードの計算フィールド用の追加関数 {#additional-functions-for-calculated-fields-in-live-mode}

ClickHouseには、データ分析に使用できる膨大な数の関数があり、Tableauがサポートする数をはるかに上回ります。ユーザーの利便性のため、計算フィールドを作成する際にLiveモードで使用できる新しい関数を追加しました。残念ながら、Tableauインターフェースでこれらの関数に説明を追加することができないため、ここで説明を記載します。

- **[`-If`集約コンビネータ](/sql-reference/aggregate-functions/combinators/#-if)** _（v0.2.3で追加）_ - 集約計算内で行レベルフィルタを直接使用できます。`SUM_IF()、AVG_IF()、COUNT_IF()、MIN_IF()、MAX_IF()`関数が追加されました。
- **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** _（v0.2.1で追加）_ — 退屈な棒グラフは忘れましょう！代わりに`BAR()`関数を使用してください（ClickHouseの[`bar()`](/sql-reference/functions/other-functions#bar)に相当）。例えば、この計算フィールドは文字列として視覚的なバーを返します：
  ```text
  BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
  ```
  ```text
  == BAR() ==
  ██████████████████▊  327.06 million
  █████  88.02 million
  ███████████████  259.37 million
  ```
- **`COUNTD_UNIQ([my_field])`** _（v0.2.0で追加）_ — 引数の異なる値の概数を計算します。[uniq()](/sql-reference/aggregate-functions/reference/uniq/)に相当します。`COUNTD()`よりもはるかに高速です。
- **`DATE_BIN('day', 10, [my_datetime_or_date])`** _（v0.2.1で追加）_ — ClickHouseの[`toStartOfInterval()`](/sql-reference/functions/date-time-functions#toStartOfInterval)に相当します。日付または日時を指定された間隔に切り捨てます。例：
  ```text
   == my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
      28.07.2004 06:54:50    |              21.07.2004 00:00:00
      17.07.2004 14:01:56    |              11.07.2004 00:00:00
      14.07.2004 07:43:00    |              11.07.2004 00:00:00
  ```
- **`FORMAT_READABLE_QUANTITY([my_integer])`** _（v0.2.1で追加）_ — 接尾辞（千、百万、十億など）を付けた丸められた数値を文字列として返します。人間が大きな数値を読みやすくするのに便利です。[`formatReadableQuantity()`](/sql-reference/functions/other-functions#formatReadableQuantity)に相当します。
- **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** _（v0.2.1で追加）_ — 秒単位の時間差を受け取ります。（年、月、日、時、分、秒）を含む時間差を文字列として返します。`optional_max_unit`は表示する最大単位です。使用可能な値：`seconds`、`minutes`、`hours`、`days`、`months`、`years`。[`formatReadableTimeDelta()`](/sql-reference/functions/other-functions/#formatReadableTimeDelta)に相当します。
- **`GET_SETTING([my_setting_name])`** _（v0.2.1で追加）_ — カスタム設定の現在の値を返します。[`getSetting()`](/sql-reference/functions/other-functions#getSetting)に相当します。
- **`HEX([my_string])`** _（v0.2.1で追加）_ — 引数の16進数表現を含む文字列を返します。[`hex()`](/sql-reference/functions/encoding-functions/#hex)に相当します。
- **`KURTOSIS([my_number])`** — 数列の標本尖度を計算します。[`kurtSamp()`](/sql-reference/aggregate-functions/reference/kurtsamp)に相当します。
- **`KURTOSISP([my_number])`** — 数列の尖度を計算します。[`kurtPop()`](/sql-reference/aggregate-functions/reference/kurtpop)に相当します。
- **`MEDIAN_EXACT([my_number])`** _（v0.1.3で追加）_ — 数値データ列の中央値を正確に計算します。[`quantileExact(0.5)(...)`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact)に相当します。
- **`MOD([my_number_1], [my_number_2])`** — 除算後の剰余を計算します。引数が浮動小数点数の場合、小数部分を切り捨てて整数に事前変換されます。[`modulo()`](/sql-reference/functions/arithmetic-functions/#modulo)に相当します。
- **`PERCENTILE_EXACT([my_number], [level_float])`** _（v0.1.3で追加）_ — 数値データ列のパーセンタイルを正確に計算します。推奨されるレベル範囲は[0.01, 0.99]です。[`quantileExact()()`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact)に相当します。
- **`PROPER([my_string])`** _（v0.2.5で追加）_ - テキスト文字列を変換し、各単語の最初の文字を大文字に、残りの文字を小文字にします。スペースや句読点などの非英数字文字も区切り文字として機能します。例：
  ```text
  PROPER("PRODUCT name") => "Product Name"
  ```
  ```text
  PROPER("darcy-mae") => "Darcy-Mae"
  ```
- **`RAND()`** _（v0.2.1で追加）_ — 整数（UInt32）を返します。例：`3446222955`。[`rand()`](/sql-reference/functions/random-functions/#rand)に相当します。
- **`RANDOM()`** _（v0.2.1で追加）_ — 非公式の[`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results) Tableau関数で、0から1の間の浮動小数点数を返します。
- **`RAND_CONSTANT([optional_field])`** _（v0.2.1で追加）_ — ランダムな値を持つ定数列を生成します。`{RAND()}`固定LODに似ていますが、より高速です。[`randConstant()`](/sql-reference/functions/random-functions/#randConstant)に相当します。
- **`REAL([my_number])`** — フィールドを浮動小数点数（Float64）にキャストします。詳細は[`こちら`](/sql-reference/data-types/decimal/#operations-and-result-type)。
- **`SHA256([my_string])`** _（v0.2.1で追加）_ — 文字列からSHA-256ハッシュを計算し、結果のバイト列を文字列（FixedString）として返します。`HEX()`関数と組み合わせて使用すると便利です。例：`HEX(SHA256([my_string]))`。[`SHA256()`](/sql-reference/functions/hash-functions#SHA256)に相当します。
- **`SKEWNESS([my_number])`** — 数列の標本歪度を計算します。[`skewSamp()`](/sql-reference/aggregate-functions/reference/skewsamp)に相当します。
- **`SKEWNESSP([my_number])`** — 数列の歪度を計算します。[`skewPop()`](/sql-reference/aggregate-functions/reference/skewpop)に相当します。
- **`TO_TYPE_NAME([field])`** _（v0.2.1で追加）_ — 渡された引数のClickHouse型名を含む文字列を返します。[`toTypeName()`](/sql-reference/functions/other-functions#toTypeName)に相当します。
- **`TRUNC([my_float])`** — `FLOOR([my_float])`関数と同じです。[`trunc()`](/sql-reference/functions/rounding-functions#trunc)に相当します。
- **`UNHEX([my_string])`** _（v0.2.1で追加）_ — `HEX()`の逆操作を実行します。[`unhex()`](/sql-reference/functions/encoding-functions#unhex)に相当します。
