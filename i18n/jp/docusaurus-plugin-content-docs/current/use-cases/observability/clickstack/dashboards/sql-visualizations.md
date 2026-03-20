---
slug: /use-cases/observability/clickstack/dashboards/sql-visualizations
title: 'SQLベースのビジュアライゼーション'
sidebar_label: 'SQLベースのビジュアライゼーション'
pagination_prev: null
pagination_next: null
description: 'ClickStackでSQLクエリを使用してビジュアライゼーションを作成する'
doc_type: 'guide'
keywords: ['ClickStack', 'ダッシュボード', 'ビジュアライゼーション', 'SQL', 'オブザーバビリティ']
---

import Image from '@theme/IdealImage';
import sql_editor_button from '@site/static/images/use-cases/observability/sql-editor-button.png';

ClickStack は、生のSQLクエリに基づくビジュアライゼーションをサポートします。これにより、ダッシュボードレベルの時間範囲、フィルタリング、チャート描画と連携しながら、クエリロジックを完全に制御できます。

SQLベースのビジュアライゼーションは、組み込みの Chart Explorer では対応できないことを行う必要がある場合に役立ちます。たとえば、テーブルを結合したり、チャートビルダーでサポートされていない複雑な集計を構築したりする場合です。


## SQL ベースのビジュアライゼーションの作成 \{#creating-a-raw-sql-chart\}

SQL ベースのビジュアライゼーションを作成するには、ダッシュボードのタイルエディタを開き、**SQL** タブを選択します。

<Image img={sql_editor_button} alt="SQL エディタボタン" size="lg" />

ここからは、次の手順を実行します。

1. クエリの実行先となる **ClickHouse 接続** を選択します。
2. 必要に応じて **ソース** を選択します。これにより、`$__filters` マクロを介してダッシュボードレベルのフィルタリングをチャートに適用できるようになります。
3. エディタで SQL クエリを記述し、クエリパラメータとマクロを使用して、ダッシュボードの時間範囲やフィルタリングと連携させます。
4. **play** ボタンをクリックして結果をプレビューし、**Save** をクリックします。

## クエリパラメータ \{#query-parameters\}

[クエリパラメータ](/sql-reference/syntax#defining-and-using-query-parameters)を使用すると、SQL でダッシュボードの現在の時間範囲と粒度を参照できます。ClickHouse のパラメータ化クエリ構文 `{paramName:Type}` を使用します。

### 使用可能なパラメータ \{#available-parameters\}

使用可能なパラメータは、チャートの種類によって異なります。

**折れ線チャートおよび積み上げ棒チャート:**

| パラメータ                           | 型     | 説明                              |
| ------------------------------- | ----- | ------------------------------- |
| `{startDateMilliseconds:Int64}` | Int64 | ダッシュボードの日付範囲の開始時刻 (エポックからのミリ秒)  |
| `{endDateMilliseconds:Int64}`   | Int64 | ダッシュボードの日付範囲の終了時刻 (エポックからのミリ秒)  |
| `{intervalSeconds:Int64}`       | Int64 | 時間バケットのサイズ (粒度に基づく、秒単位)         |
| `{intervalMilliseconds:Int64}`  | Int64 | 時間バケットのサイズ (粒度に基づく、ミリ秒単位)       |

**テーブル、円グラフ、および数値チャート:**

| パラメータ                           | 型     | 説明                              |
| ------------------------------- | ----- | ------------------------------- |
| `{startDateMilliseconds:Int64}` | Int64 | ダッシュボードの日付範囲の開始時刻 (エポックからのミリ秒)  |
| `{endDateMilliseconds:Int64}`   | Int64 | ダッシュボードの日付範囲の終了時刻 (エポックからのミリ秒)  |

## マクロ \{#macros\}

マクロは、よく使われる ClickHouse SQL の式に展開されるショートカットです。`$__` プレフィックスが付き、クエリが ClickHouse に送信される前に置き換えられます。

### 時間境界マクロ \{#time-boundary-macros\}

これらのマクロは、ダッシュボードの開始時刻または終了時刻を表す ClickHouse 式を返します。引数はありません。

| Macro            | Expands to                                                            | カラム型 |
|------------------|-----------------------------------------------------------------------|----------|
| `$__fromTime`    | `toDateTime(fromUnixTimestamp64Milli({startDateMilliseconds:Int64}))` | DateTime |
| `$__toTime`      | `toDateTime(fromUnixTimestamp64Milli({endDateMilliseconds:Int64}))`   | DateTime |
| `$__fromTime_ms` | `fromUnixTimestamp64Milli({startDateMilliseconds:Int64})`             | DateTime64 |
| `$__toTime_ms`   | `fromUnixTimestamp64Milli({endDateMilliseconds:Int64})`               | DateTime64 |
| `$__interval_s`  | `{intervalSeconds:Int64}`                                             | Int64 |

### 時間フィルタマクロ \{#time-filter-macros\}

これらのマクロは、カラムをダッシュボードの時間範囲でフィルタリングする `WHERE` 句のフラグメントを生成します。

| Macro                                 | 説明                                                       |
|---------------------------------------|------------------------------------------------------------|
| `$__timeFilter(column)`               | `DateTime` カラムをダッシュボードの範囲でフィルタリングします |
| `$__timeFilter_ms(column)`            | `DateTime64` (ミリ秒) カラムをダッシュボードの範囲でフィルタリングします |
| `$__dateFilter(column)`               | `Date` カラムをダッシュボードの範囲でフィルタリングします     |
| `$__dateTimeFilter(dateCol, timeCol)` | 個別の `Date` カラムと `DateTime` カラムを使用してフィルタリングします |
| `$__dt(dateCol, timeCol)`             | `$__dateTimeFilter` のエイリアス                           |

`$__timeFilter(TimestampTime)` の**展開例**:

```sql
TimestampTime >= toDateTime(fromUnixTimestamp64Milli({startDateMilliseconds:Int64}))
AND TimestampTime <= toDateTime(fromUnixTimestamp64Milli({endDateMilliseconds:Int64}))
```

### 時間間隔マクロ \{#time-interval-macros\}

これらのマクロは、タイムスタンプのカラムをダッシュボードの粒度に対応する時間間隔にまとめます。通常、時系列チャートで `SELECT` 句および `GROUP BY` 句に使用されます。これらは、Line および Stacked-bar のビジュアライゼーションでのみ利用できます。

| Macro                        | 説明                                                |
| ---------------------------- | ------------------------------------------------- |
| `$__timeInterval(column)`    | `DateTime` カラムを `intervalSeconds` 間隔にまとめます        |
| `$__timeInterval_ms(column)` | `DateTime64` カラムを `intervalMilliseconds` 間隔にまとめます |

`$__timeInterval(TimestampTime)` の**展開例**:

```sql
toStartOfInterval(toDateTime(TimestampTime), INTERVAL {intervalSeconds:Int64} second)
```


### ダッシュボードフィルタマクロ \{#dashboard-filter-macro\}

| Macro        | 説明                                                 |
| ------------ | -------------------------------------------------- |
| `$__filters` | ダッシュボードレベルのフィルタリング条件に置き換えられます (ソースを選択している必要があります)  |

グラフで **ソース** が選択され、ダッシュボードのフィルタリングがアクティブな場合、`$__filters` は対応する SQL の `WHERE` 条件に展開されます。ソースが選択されていない場合、またはフィルタリングが適用されていない場合は、`(1=1)` に展開されるため、`WHERE` 句に含めても常に安全です。

## クエリ結果がどのようにプロットされるか \{#how-results-are-plotted\}

ClickStack は、カラムの型に基づいて、結果のカラムをチャート要素に自動的にマッピングします。マッピングルールは、チャートの種類によって異なります。

### 折れ線チャートと積み上げ棒チャート \{#line-and-stacked-bar-charts\}

| ロール               | Column type                        | Description                                                                                 |
|--------------------|------------------------------------|---------------------------------------------------------------------------------------------|
| **タイムスタンプ**      | 最初の `Date` または `DateTime` カラム  | x 軸として使用されます。                                                                    |
| **系列値**   | すべての数値カラム                | 各数値カラムは個別の系列としてプロットされます。通常、これらは集計値です。                  |
| **グループ名**    | 文字列、Map、または Array カラム      | 任意です。グループ値が異なる行は、それぞれ別の系列としてプロットされます。                  |

### 円チャート \{#pie-chart\}

| ロール             | カラム型                        | 説明                                                     |
|-------------------|--------------------------------|----------------------------------------------------------|
| **スライス値**    | 最初の数値カラム               | 各スライスの大きさを決定します。                         |
| **スライスラベル** | 文字列、Map、または Array カラム | 任意です。一意の値ごとにスライスラベルになります。      |

### 数値チャート \{#number-chart\}

| ロール       | カラム型          | 説明                                                            |
|------------|------------------|-----------------------------------------------------------------|
| **Number** | 最初の数値カラム | 最初の数値カラムの最初の行にある値が表示されます。             |

### テーブルチャート \{#table-chart\}

結果のすべてのカラムが、そのままテーブルのカラムとして表示されます。

## 例 \{#examples\}

:::note 必要なシステムテーブルへのアクセス
[play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) で以下の例を実行する場合は、`otel_v2.otel_logs` または `otel_v2.otel_traces` を指定する必要があります。
:::

### 折れ線チャート — サービス別のログ件数の推移 \{#example-line-chart\}

このクエリは、ダッシュボードの粒度に一致する時間間隔で集計し、サービスごとのログイベント数をカウントします。

```sql
SELECT
  toStartOfInterval(TimestampTime, INTERVAL {intervalSeconds:Int64} second) AS ts,
  ServiceName,
  count() AS count
FROM otel_logs
WHERE TimestampTime >= fromUnixTimestamp64Milli({startDateMilliseconds:Int64})
  AND TimestampTime < fromUnixTimestamp64Milli({endDateMilliseconds:Int64})
  AND $__filters
GROUP BY ServiceName, ts
ORDER BY ts ASC
```

- `ts` (DateTime) は、x 軸のタイムスタンプとして使用されます。
- `count` (数値) は、系列の値としてプロットされます。
- `ServiceName` (文字列) は、サービスごとに別々の線を作成します。

### 折れ線チャート — マクロを使用 \{#example-line-chart-macros\}

簡潔にするため、マクロを使用して記述した同じクエリ:

```sql
SELECT
  $__timeInterval(TimestampTime) AS ts,
  ServiceName,
  count() AS count
FROM otel_logs
WHERE $__timeFilter(TimestampTime)
  AND $__filters
GROUP BY ServiceName, ts
ORDER BY ts ASC
```

### 積み上げ棒チャート — 重大度別エラー数 \{#example-stacked-bar\}

```sql
SELECT
  $__timeInterval(TimestampTime) AS ts,
  lower(SeverityText),
  count() AS count
FROM otel_logs
WHERE $__timeFilter(TimestampTime)
  AND lower(SeverityText) IN ('error', 'warn')
  AND $__filters
GROUP BY SeverityText, ts
ORDER BY ts ASC
```

### テーブルチャート — 最も遅いエンドポイント上位10件 \{#example-table\}

```sql
SELECT
  SpanName AS endpoint,
  avg(Duration) / 1000 AS avg_duration_ms,
  count() AS request_count
FROM otel_traces
WHERE $__timeFilter(Timestamp)
  AND $__filters
GROUP BY SpanName
ORDER BY avg_duration_ms DESC
LIMIT 10
```


### 円チャート — サービス別のリクエスト分布 \{#example-pie\}

```sql
SELECT
  ServiceName,
  count() AS request_count
FROM otel_traces
WHERE $__timeFilter(Timestamp)
  AND $__filters
GROUP BY ServiceName
```

- `request_count` (数値) は各スライスの大きさを決定します。
- `ServiceName` (文字列) は各スライスのラベルになります。

### 数値チャート — エラーの総数 \{#example-number\}

```sql
SELECT
  count() AS total_errors
FROM otel_logs
WHERE $__timeFilter(TimestampTime)
  AND SeverityText = 'error'
  AND $__filters
```

最初の行にある数値 `total_errors` が表示されます。


## 注意事項 \{#notes\}

- SQL ベースのビジュアライゼーションは、`readonly` モードを有効にした状態で実行されます。許可されるのは `SELECT` クエリのみです。
- SQL ベースのビジュアライゼーションでは、SQL クエリは必ず 1 つである必要があります。複数のクエリはサポートされていません。
- SQL エディタでは、クエリパラメータとマクロの両方に対してオートコンプリート候補が表示されます。
- SQL ベースのビジュアライゼーションにダッシュボードフィルタを適用するには、ソースを選択する必要があります。正確にフィルタリングするため、ソースはクエリ対象のテーブルと一致している必要があります。