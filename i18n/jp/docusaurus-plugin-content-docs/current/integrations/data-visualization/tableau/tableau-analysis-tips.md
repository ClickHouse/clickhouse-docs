---
sidebar_label: '分析のヒント'
sidebar_position: 4
slug: /integrations/tableau/analysis-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'ClickHouse 公式コネクタ使用時の Tableau での分析のヒント。'
title: '分析のヒント'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

# 分析のポイント \{#analysis-tips\}

## MEDIAN() と PERCENTILE() 関数 \{#median-and-percentile-functions\}

- Live モードでは、MEDIAN() と PERCENTILE() 関数（connector v0.1.3 のリリース以降）は、サンプリングに基づいて計算を行う [ClickHouse quantile()() 関数](/sql-reference/aggregate-functions/reference/quantile/) を利用するため、計算が大幅に高速化されます。正確な計算結果が必要な場合は、[quantileExact()()](/sql-reference/aggregate-functions/reference/quantileexact/) に基づく `MEDIAN_EXACT()` と `PERCENTILE_EXACT()` 関数を使用してください。
- Extract モードでは、MEDIAN() と PERCENTILE() が常に正確（ただし低速）であるため、MEDIAN_EXACT() と PERCENTILE_EXACT() は使用できません。

## ライブモードでの計算フィールド向けの追加関数 \{#additional-functions-for-calculated-fields-in-live-mode\}

ClickHouse にはデータ分析に利用できる関数が非常に多数用意されており、その数は Tableau がサポートするものをはるかに上回ります。ユーザーの利便性を高めるため、ライブモードで計算フィールドを作成する際に使用できる新しい関数を追加しました。残念ながら、Tableau のインターフェイス上でこれらの関数に説明を付与することはできないため、ここでそれぞれの説明を補足します。

* **[`-If` Aggregation Combinator](/sql-reference/aggregate-functions/combinators/#-if)** *(v0.2.3 で追加)* - 集約計算内で行レベルフィルターを直接使用できるようにします。`SUM_IF(), AVG_IF(), COUNT_IF(), MIN_IF() & MAX_IF()` 関数が追加されました。
* **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** *(v0.2.1 で追加)* — 退屈な棒グラフのことは忘れましょう！代わりに `BAR()` 関数を使いましょう（ClickHouse における [`bar()`](/sql-reference/functions/other-functions#bar) と同等）。例えば、次の計算フィールドは文字列として見栄えの良いバーを返します:
  ```text
  BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
  ```
  ```text
  == BAR() ==
  ██████████████████▊  327.06 million
  █████  88.02 million
  ███████████████  259.37 million
  ```
* **`COUNTD_UNIQ([my_field])`** *(v0.2.0 で追加)* — 引数に含まれる異なる値のおおよその件数を計算します。[uniq()](/sql-reference/aggregate-functions/reference/uniq/) と同等で、`COUNTD()` よりもはるかに高速です。
* **`DATE_BIN('day', 10, [my_datetime_or_date])`** *(v0.2.1 で追加)* — ClickHouse における [`toStartOfInterval()`](/sql-reference/functions/date-time-functions#toStartOfInterval) と同等の関数です。指定された間隔単位で Date または Date &amp; Time を切り捨てます。例えば次のとおりです:
  ```text
   == my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
      28.07.2004 06:54:50    |              21.07.2004 00:00:00
      17.07.2004 14:01:56    |              11.07.2004 00:00:00
      14.07.2004 07:43:00    |              11.07.2004 00:00:00
  ```
* **`FORMAT_READABLE_QUANTITY([my_integer])`** *(v0.2.1 で追加)* — 数値を四捨五入し、接尾辞（thousand、million、billion など）を付けた文字列として返します。人間が大きな数値を読みやすくするのに便利です。[`formatReadableQuantity()`](/sql-reference/functions/other-functions#formatReadableQuantity) と同等です。
* **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** *(v0.2.1 で追加)* — 秒単位の時間差を受け取り、(year, month, day, hour, minute, second) で表される時間差を文字列として返します。`optional_max_unit` は表示する最大の単位です。指定可能な値は `seconds`、`minutes`、`hours`、`days`、`months`、`years` です。[`formatReadableTimeDelta()`](/sql-reference/functions/other-functions/#formatReadableTimeDelta) と同等の関数です。
* **`GET_SETTING([my_setting_name])`** *(v0.2.1 で追加)* — カスタム設定の現在の値を返します。[`getSetting()`](/sql-reference/functions/other-functions#getSetting) と同等です。
* **`HEX([my_string])`** *(v0.2.1 で追加)* — 引数の 16 進数表現を表す文字列を返します。[`hex()`](/sql-reference/functions/encoding-functions/#hex) と同等です。
* **`KURTOSIS([my_number])`** — 値の列の標本尖度を計算します。[`kurtSamp()`](/sql-reference/aggregate-functions/reference/kurtsamp) に相当します。
* **`KURTOSISP([my_number])`** — 数列の尖度を計算します。[`kurtPop()`](/sql-reference/aggregate-functions/reference/kurtpop) と同等です。
* **`MEDIAN_EXACT([my_number])`** *(v0.1.3 で追加)* — 数値データ列の中央値を厳密に計算します。[`quantileExact(0.5)(...)`](/sql-reference/aggregate-functions/reference/quantileexact) と同等です。
* **`MOD([my_number_1], [my_number_2])`** — 除算の余りを計算します。引数が浮動小数点数の場合は、小数部分を切り捨てて整数に変換してから処理されます。[`modulo()`](/sql-reference/functions/arithmetic-functions/#modulo) と同等です。
* **`PERCENTILE_EXACT([my_number], [level_float])`** *(v0.1.3 で追加)* — 数値データシーケンスのパーセンタイルを厳密に計算します。推奨されるレベル値の範囲は [0.01, 0.99] です。[`quantileExact()()`](/sql-reference/aggregate-functions/reference/quantileexact) と同等です。
* **`PROPER([my_string])`** *(v0.2.5 で追加)* - テキスト文字列の各単語の先頭文字を大文字にし、残りの文字を小文字に変換します。スペースや句読点などの英数字以外の文字も区切り文字として扱われます。例：
  ```text
  PROPER("PRODUCT name") => "Product Name"
  ```
  ```text
  PROPER("darcy-mae") => "Darcy-Mae"
  ```
* **`RAND()`** *(v0.2.1 で追加)* — 整数値 (UInt32) を返します。例えば `3446222955` のような値です。[`rand()`](/sql-reference/functions/random-functions/#rand) と同等です。
* **`RANDOM()`** *(v0.2.1 で追加)* — 非公式の Tableau 関数 [`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results) で、0 以上 1 以下の浮動小数点数を返します。
* **`RAND_CONSTANT([optional_field])`** *(v0.2.1 で追加されました)* — ランダムな値を持つ定数カラムを生成します。`{RAND()}` の Fixed LOD のようなものですが、より高速です。[`randConstant()`](/sql-reference/functions/random-functions/#randConstant) と等価です。
* **`REAL([my_number])`** — フィールドを float 型（Float64）にキャストします。詳細は[`こちら`](/sql-reference/data-types/decimal/#operations-and-result-type)を参照してください。
* **`SHA256([my_string])`** *(v0.2.1 で追加)* — 文字列から SHA-256 ハッシュを計算し、その結果のバイト列を FixedString 型の文字列として返します。`HEX()` 関数と組み合わせて、例えば `HEX(SHA256([my_string]))` のように使うと便利です。[`SHA256()`](/sql-reference/functions/hash-functions#SHA256) と同等です。
* **`SKEWNESS([my_number])`** — 数列の標本歪度を計算します。[`skewSamp()`](/sql-reference/aggregate-functions/reference/skewsamp) と同等です。
* **`SKEWNESSP([my_number])`** — データ列の歪度を計算します。[`skewPop()`](/sql-reference/aggregate-functions/reference/skewpop) と同等です。
* **`TO_TYPE_NAME([field])`** *(v0.2.1 で追加)* — 渡された引数の ClickHouse の型名を含む文字列を返します。[`toTypeName()`](/sql-reference/functions/other-functions#toTypeName) と同等です。
* **`TRUNC([my_float])`** — `FLOOR([my_float])` 関数と同じ動作をします。[`trunc()`](/sql-reference/functions/rounding-functions#trunc) と等価です。
* **`UNHEX([my_string])`** *(v0.2.1 で追加)* — `HEX()` の逆の操作を実行します。[`unhex()`](/sql-reference/functions/encoding-functions#unhex) と同等です。