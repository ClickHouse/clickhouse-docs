---
sidebar_label: '分析のヒント'
sidebar_position: 4
slug: /integrations/tableau/analysis-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'Tableau で ClickHouse 公式コネクタを使用する際の分析のヒント。'
title: '分析のヒント'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

# 分析のヒント \{#analysis-tips\}

## MEDIAN()関数とPERCENTILE()関数 \{#median-and-percentile-functions\}

- Live モードでは、`MEDIAN()` および `PERCENTILE()` 関数（connector v0.1.3 リリース以降）は [ClickHouse quantile()() 関数](/sql-reference/aggregate-functions/reference/quantile/) を使用します。これにより計算が大幅に高速化されますが、サンプリングを行うため近似値となります。正確な計算結果が必要な場合は、`MEDIAN_EXACT()` および `PERCENTILE_EXACT()` 関数（[quantileExact()()](/sql-reference/aggregate-functions/reference/quantileexact/) に基づく）を使用してください。
- Extract モードでは MEDIAN&#95;EXACT() と PERCENTILE&#95;EXACT() を使用できません。MEDIAN() と PERCENTILE() は常に厳密な値を返す（その分低速です）ためです。

## ライブモードの計算フィールドで使用可能な追加関数 \{#additional-functions-for-calculated-fields-in-live-mode\}

ClickHouseには、データ分析に使用できる関数が非常に多く、Tableauがサポートする数を大幅に上回ります。 ユーザーの利便性向上のため、計算フィールド作成時にLiveモードで使用可能な新しい関数を追加しました。 残念ながら、Tableauインターフェース内でこれらの関数に説明を追加することができないため、本ドキュメントにて説明を記載します。

* **[`-If` Aggregation Combinator](/sql-reference/aggregate-functions/combinators/#-if)** *(v0.2.3 で追加)* - 集約計算の中で直接行レベルフィルターを指定できるようにします。`SUM_IF(), AVG_IF(), COUNT_IF(), MIN_IF() & MAX_IF()` 関数が追加されました。
* **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** *(v0.2.1 で追加)* — 退屈な棒グラフは忘れてください！代わりに `BAR()` 関数を使用してください（ClickHouse における [`bar()`](/sql-reference/functions/other-functions#bar) と同等の機能です）。たとえば、次の計算フィールドは String 型で見やすいバーを返します:
  ```text
  BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
  ```
  ```text
  == BAR() ==
  ██████████████████▊  327.06 million
  █████  88.02 million
  ███████████████  259.37 million
  ```
* **`COUNTD_UNIQ([my_field])`** *(v0.2.0 で追加)* — 引数に含まれる異なる値のおおよその個数を計算します。[uniq()](/sql-reference/aggregate-functions/reference/uniq/) と同等です。`COUNTD()` よりもはるかに高速です。
* **`DATE_BIN('day', 10, [my_datetime_or_date])`** *(v0.2.1 で追加)* — ClickHouse の [`toStartOfInterval()`](/sql-reference/functions/date-time-functions#toStartOfInterval) と同等です。Date または Date &amp; Time を指定した間隔に丸めて切り捨てます。例:
  ```text
   == my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
      28.07.2004 06:54:50    |              21.07.2004 00:00:00
      17.07.2004 14:01:56    |              11.07.2004 00:00:00
      14.07.2004 07:43:00    |              11.07.2004 00:00:00
  ```
* **`FORMAT_READABLE_QUANTITY([my_integer])`** *(v0.2.1 で追加)* — 丸めた数値に接尾辞（thousand、million、billion など）を付けた文字列を返します。大きな数値を人間が読みやすい形式にするのに役立ちます。[`formatReadableQuantity()`](/sql-reference/functions/other-functions#formatReadableQuantity) と同等です。
* **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** *(v0.2.1 で追加)* — 秒単位の時間差を引数に取り、(年・月・日・時・分・秒) を含む時間差を文字列として返します。`optional_max_unit` は表示する最大単位です。指定可能な値: `seconds`、`minutes`、`hours`、`days`、`months`、`years`。[`formatReadableTimeDelta()`](/sql-reference/functions/other-functions/#formatReadableTimeDelta) と同等です。
* **`GET_SETTING([my_setting_name])`** *(v0.2.1 で追加)* — カスタム設定の現在の値を返します。[`getSetting()`](/sql-reference/functions/other-functions#getSetting) と同等です。
* **`HEX([my_string])`** *(v0.2.1 で追加)* — 引数の 16 進数表現を含む文字列を返します。[`hex()`](/sql-reference/functions/encoding-functions/#hex) に相当します。
* **`KURTOSIS([my_number])`** — 一連の値に対する標本尖度を計算します。[`kurtSamp()`](/sql-reference/aggregate-functions/reference/kurtsamp) と同等です。
* **`KURTOSISP([my_number])`** — 一連の値に対する尖度を計算します。[`kurtPop()`](/sql-reference/aggregate-functions/reference/kurtpop) と同等です。
* **`MEDIAN_EXACT([my_number])`** *(v0.1.3 で追加)* — 数値データ系列の中央値を厳密に計算します。[`quantileExact(0.5)(...)`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact) と同等です。
* **`MOD([my_number_1], [my_number_2])`** — 割り算の余りを計算します。引数が浮動小数点数の場合、小数部分を切り捨てて整数に変換してから演算を行います。[`modulo()`](/sql-reference/functions/arithmetic-functions/#modulo) と同等です。
* **`PERCENTILE_EXACT([my_number], [level_float])`** *(v0.1.3 で追加)* — 数値データ列のパーセンタイルを厳密に計算します。推奨されるレベルの範囲は [0.01, 0.99] です。[`quantileExact()()`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact) と同等の機能です。
* **`PROPER([my_string])`** *(v0.2.5 で追加)* - テキスト文字列内の各単語について先頭の文字を大文字にし、それ以外の文字を小文字に変換します。スペースや句読点などの英数字以外の文字も単語の区切り文字として扱われます。例えば次のとおりです。
  ```text
  PROPER("PRODUCT name") => "Product Name"
  ```
  ```text
  PROPER("darcy-mae") => "Darcy-Mae"
  ```
* **`RAND()`** *(v0.2.1 で追加)* — 整数値（UInt32 型）を返します。例: `3446222955`。[`rand()`](/sql-reference/functions/random-functions/#rand) と同等です。
* **`RANDOM()`** *(v0.2.1 で追加)* — Tableau の非公式な [`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results) 関数であり、0 以上 1 以下の浮動小数点数を返します。
* **`RAND_CONSTANT([optional_field])`** *(v0.2.1 で追加)* — ランダムな値を持つ定数列を生成します。`{RAND()}` の Fixed LOD 版のようなものですが、より高速です。[`randConstant()`](/sql-reference/functions/random-functions/#randConstant) と同等の動作をします。
* **`REAL([my_number])`** — フィールドを浮動小数点数（Float64）型にキャストします。詳細については[`こちら`](/sql-reference/data-types/decimal/#operations-and-result-type)を参照してください。
* **`SHA256([my_string])`** *(v0.2.1 で追加)* — 文字列から SHA-256 のハッシュ値を計算し、その結果のバイト列を FixedString 型の文字列として返します。`HEX()` 関数と組み合わせて、たとえば `HEX(SHA256([my_string]))` のように便利に使用できます。[`SHA256()`](/sql-reference/functions/hash-functions#SHA256) と同等です。
* **`SKEWNESS([my_number])`** — シーケンスの標本歪度を計算します。[`skewSamp()`](/sql-reference/aggregate-functions/reference/skewsamp) と同等です。
* **`SKEWNESSP([my_number])`** — シーケンスの歪度を計算します。[`skewPop()`](/sql-reference/aggregate-functions/reference/skewpop) と同等です。
* **`TO_TYPE_NAME([field])`** *(v0.2.1 で追加)* — 渡された引数の ClickHouse の型名を含む文字列を返します。[`toTypeName()`](/sql-reference/functions/other-functions#toTypeName) と同等です。
* **`TRUNC([my_float])`** — `FLOOR([my_float])` 関数と同じです。[`trunc()`](/sql-reference/functions/rounding-functions#trunc) と等価です。
* **`UNHEX([my_string])`** *(v0.2.1 で追加)* — `HEX()` の逆の変換を行います。[`unhex()`](/sql-reference/functions/encoding-functions#unhex) と同等です。