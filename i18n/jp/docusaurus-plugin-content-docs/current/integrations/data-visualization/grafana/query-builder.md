---
sidebar_label: 'クエリビルダー'
sidebar_position: 2
slug: /integrations/grafana/query-builder
description: 'ClickHouse Grafana プラグインでクエリビルダーを使用する'
title: 'クエリビルダー'
doc_type: 'guide'
keywords: ['grafana', 'クエリビルダー', '可視化', 'ダッシュボード', 'プラグイン']
---

import Image from '@theme/IdealImage';
import demo_table_query from '@site/static/images/integrations/data-visualization/grafana/demo_table_query.png';
import demo_logs_query from '@site/static/images/integrations/data-visualization/grafana/demo_logs_query.png';
import demo_logs_query_fields from '@site/static/images/integrations/data-visualization/grafana/demo_logs_query_fields.png';
import demo_time_series_query from '@site/static/images/integrations/data-visualization/grafana/demo_time_series_query.png';
import demo_trace_query from '@site/static/images/integrations/data-visualization/grafana/demo_trace_query.png';
import demo_raw_sql_query from '@site/static/images/integrations/data-visualization/grafana/demo_raw_sql_query.png';
import trace_id_in_table from '@site/static/images/integrations/data-visualization/grafana/trace_id_in_table.png';
import trace_id_in_logs from '@site/static/images/integrations/data-visualization/grafana/trace_id_in_logs.png';
import demo_data_links from '@site/static/images/integrations/data-visualization/grafana/demo_data_links.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# クエリビルダー

<ClickHouseSupportedBadge/>

あらゆるクエリは ClickHouse プラグインを使用して実行できます。
クエリビルダーはシンプルなクエリに便利なオプションですが、複雑なクエリには [SQL Editor](#sql-editor) を使用する必要があります。

クエリビルダー内のすべてのクエリには[クエリタイプ](#query-types)があり、少なくとも 1 つの列を選択する必要があります。

使用可能なクエリタイプは次のとおりです:
- [Table](#table): データをテーブル形式で表示するための最も単純なクエリタイプです。集約関数を含むシンプルおよび複雑なクエリの双方に対応する汎用的なタイプとして有効です。
- [Logs](#logs): ログ用のクエリを構築するために最適化されています。[デフォルトを設定](./config.md#logs)した Explore ビューで使用すると最も効果的です。
- [Time Series](#time-series): 時系列クエリを構築する場合に最適です。専用の時間列を選択し、集約関数を追加できます。
- [Traces](#traces): トレースの検索・閲覧に最適化されています。[デフォルトを設定](./config.md#traces)した Explore ビューで使用すると最も効果的です。
- [SQL Editor](#sql-editor): クエリを完全に制御したい場合に使用できます。このモードでは、任意の SQL クエリを実行できます。



## クエリタイプ {#query-types}

_クエリタイプ_設定により、構築するクエリのタイプに合わせてクエリビルダーのレイアウトが変更されます。
クエリタイプは、データを可視化する際に使用するパネルも決定します。

### テーブル {#table}

最も柔軟性の高いクエリタイプはテーブルクエリです。これは、シンプルなクエリと集約クエリの両方を処理するように設計された、他のクエリビルダーを包括するタイプです。

| フィールド        | 説明                                                                                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Builder Mode | シンプルクエリでは集約とGroup Byが除外され、集約クエリではこれらのオプションが含まれます。                                                                                                               |
| Columns      | 選択された列。このフィールドには生のSQLを入力でき、関数や列のエイリアスを使用できます。                                                                                                       |
| Aggregates   | [集約関数](/sql-reference/aggregate-functions/index.md)のリスト。関数と列にカスタム値を指定できます。集約モードでのみ表示されます。                                              |
| Group By     | [GROUP BY](/sql-reference/statements/select/group-by.md)式のリスト。集約モードでのみ表示されます。                                                                                                              |
| Order By     | [ORDER BY](/sql-reference/statements/select/order-by.md)式のリスト。                                                                                                                              |
| Limit        | クエリの末尾に[LIMIT](/sql-reference/statements/select/limit.md)ステートメントを追加します。`0`に設定すると除外されます。一部の可視化では、すべてのデータを表示するために`0`に設定する必要があります。 |
| Filters      | `WHERE`句に適用するフィルターのリスト。                                                                                                                                                       |

<Image
  size='md'
  img={demo_table_query}
  alt='集約テーブルクエリの例'
  border
/>

このクエリタイプは、データをテーブルとして表示します。

### ログ {#logs}

ログクエリタイプは、ログデータのクエリに特化したクエリビルダーを提供します。
データソースの[ログ設定](./config.md#logs)でデフォルト値を構成することで、クエリビルダーにデフォルトのデータベース/テーブルと列を事前にロードできます。
OpenTelemetryを有効にすると、スキーマバージョンに応じて列を自動選択することもできます。

**Time**と**Level**フィルターはデフォルトで追加され、Time列に対するOrder Byも含まれます。
これらのフィルターはそれぞれのフィールドに紐付けられており、列が変更されると更新されます。
**Level**フィルターはデフォルトでSQLから除外されており、`IS ANYTHING`オプションから変更すると有効になります。

ログクエリタイプは[データリンク](#data-links)をサポートしています。

| フィールド          | 説明                                                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Use OTel       | OpenTelemetry列を有効にします。選択された列を上書きして、選択されたOTelスキーマバージョンで定義された列を使用します(列の選択が無効になります)。                                 |
| Columns        | ログ行に追加する追加の列。このフィールドには生のSQLを入力でき、関数や列のエイリアスを使用できます。                                                                |
| Time           | ログのプライマリタイムスタンプ列。時間型を表示しますが、カスタム値/関数も指定できます。                                                                            |
| Log Level      | オプション。ログの_レベル_または_重大度_。値は通常、`INFO`、`error`、`Debug`などです。                                                                                  |
| Message        | ログメッセージの内容。                                                                                                                                                                                   |
| Order By       | [ORDER BY](/sql-reference/statements/select/order-by.md)式のリスト。                                                                                                            |
| Limit          | クエリの末尾に[LIMIT](/sql-reference/statements/select/limit.md)ステートメントを追加します。`0`に設定すると除外されますが、大規模なログデータセットには推奨されません。 |
| Filters        | `WHERE`句に適用するフィルターのリスト。                                                                                                                                     |
| Message Filter | `LIKE %value%`を使用してログを便利にフィルタリングするためのテキスト入力。入力が空の場合は除外されます。                                                                                         |

<Image size='md' img={demo_logs_query} alt='OTelログクエリの例' border />

<br />
このクエリタイプは、上部にログヒストグラムパネルとともに、ログパネルにデータを表示します。

クエリで選択された追加の列は、展開されたログ行で表示できます:

<Image
  size='md'
  img={demo_logs_query_fields}
  alt='ログクエリの追加フィールドの例'
  border
/>

### 時系列 {#time-series}

時系列クエリタイプは[テーブル](#table)に似ていますが、時系列データに特化しています。

2つのビューはほぼ同じですが、以下の顕著な違いがあります:

- 専用の_Time_フィールド。
- 集約モードでは、Timeフィールドに対するGroup Byとともに、時間間隔マクロが自動的に適用されます。
- 集約モードでは、「Columns」フィールドが非表示になります。
- **Time**フィールドに対して、時間範囲フィルターとOrder Byが自動的に追加されます。

:::important 可視化でデータが欠けていませんか?
場合によっては、制限がデフォルトで`1000`に設定されているため、時系列パネルが途中で切れているように見えることがあります。

(データセットが許可する場合)`0`に設定して`LIMIT`句を削除してみてください。
:::


| フィールド        | 説明                                                                                                                                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Builder Mode | シンプルクエリは集約とGroup Byを除外し、集約クエリにはこれらのオプションが含まれます。                                                                                                                                     |
| Time         | クエリの主要な時刻列。時刻型を表示しますが、カスタム値や関数も使用できます。                                                                                                                       |
| Columns      | 選択された列。このフィールドには生のSQLを入力でき、関数や列の別名設定が可能です。シンプルモードでのみ表示されます。                                                                                                                |
| Aggregates   | [集約関数](/sql-reference/aggregate-functions/index.md)のリスト。関数と列にカスタム値を使用できます。集約モードでのみ表示されます。                                                                    |
| Group By     | [GROUP BY](/sql-reference/statements/select/group-by.md)式のリスト。集約モードでのみ表示されます。                                                                                                                                    |
| Order By     | [ORDER BY](/sql-reference/statements/select/order-by.md)式のリスト。                                                                                                                                                    |
| Limit        | クエリの末尾に[LIMIT](/sql-reference/statements/select/limit.md)文を追加します。`0`に設定すると除外されます。完全な可視化を表示するため、一部の時系列データセットではこの設定が推奨されます。 |
| Filters      | `WHERE`句で適用されるフィルタのリスト。                                                                                                                                                                             |

<Image
  size='md'
  img={demo_time_series_query}
  alt='時系列クエリの例'
  border
/>

このクエリタイプは、時系列パネルでデータをレンダリングします。

### トレース {#traces}

トレースクエリタイプは、トレースを簡単に検索および表示するためのクエリビルダーを提供します。
OpenTelemetryデータ用に設計されていますが、異なるスキーマからトレースをレンダリングするために列を選択できます。
データソースの[トレース設定](./config.md#traces)でデフォルト値を構成することで、クエリビルダーにデフォルトのデータベース/テーブルおよび列を事前にロードできます。デフォルト値が構成されている場合、列の選択はデフォルトで折りたたまれます。
OpenTelemetryを有効にして、スキーマバージョンに応じて列を自動選択することもできます。

デフォルトフィルタは、最上位レベルのスパンのみを表示する目的で追加されます。
TimeおよびDuration Time列のOrder Byも含まれています。
これらのフィルタはそれぞれのフィールドに紐付けられており、列が変更されると更新されます。
**Service Name**フィルタはデフォルトでSQLから除外されており、`IS ANYTHING`オプションから変更すると有効になります。

トレースクエリタイプは[データリンク](#data-links)をサポートしています。

| フィールド                 | 説明                                                                                                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trace Mode            | クエリをトレース検索からトレースIDルックアップに変更します。                                                                                                                                      |
| Use OTel              | OpenTelemetry列を有効にします。選択されたOTelスキーマバージョンで定義された列を使用するように、選択された列を上書きします(列の選択を無効にします)。                                   |
| Trace ID Column       | トレースのID。                                                                                                                                                                              |
| Span ID Column        | スパンID。                                                                                                                                                                                     |
| Parent Span ID Column | 親スパンID。最上位レベルのトレースでは通常空です。                                                                                                                                  |
| Service Name Column   | サービス名。                                                                                                                                                                                |
| Operation Name Column | 操作名。                                                                                                                                                                              |
| Start Time Column     | トレーススパンの主要な時刻列。スパンが開始された時刻。                                                                                                                  |
| Duration Time Column  | スパンの期間。デフォルトでは、Grafanaはこれをミリ秒単位の浮動小数点数として想定しています。`Duration Unit`ドロップダウンを介して自動的に変換が適用されます。                             |
| Duration Unit         | 期間に使用される時間の単位。デフォルトはナノ秒。選択された単位は、Grafanaが要求するミリ秒単位の浮動小数点数に変換されます。                                       |
| Tags Column           | スパンタグ。OTelベースのスキーマを使用していない場合は除外してください。特定のMap列型を想定しています。                                                                                          |
| Service Tags Column   | サービスタグ。OTelベースのスキーマを使用していない場合は除外してください。特定のMap列型を想定しています。                                                                                       |
| Order By              | [ORDER BY](/sql-reference/statements/select/order-by.md)式のリスト。                                                                                                              |
| Limit                 | クエリの末尾に[LIMIT](/sql-reference/statements/select/limit.md)文を追加します。`0`に設定すると除外されますが、大規模なトレースデータセットではこれは推奨されません。 |
| Filters               | `WHERE`句で適用されるフィルタのリスト。                                                                                                                                       |
| Trace ID              | フィルタリングするトレースID。トレースIDモードでのみ使用され、トレースID[データリンク](#data-links)を開く際に使用されます。                                                                                 |

<Image size='md' img={demo_trace_query} alt='OTelトレースクエリの例' border />

このクエリタイプは、トレース検索モードではテーブルビューで、トレースIDモードではトレースパネルでデータをレンダリングします。


## SQLエディタ {#sql-editor}

クエリビルダーでは複雑すぎるクエリの場合、SQLエディタを使用できます。
これにより、プレーンなClickHouse SQLを直接記述して実行できるため、クエリを完全に制御できます。

SQLエディタは、クエリエディタの上部にある「SQL Editor」を選択することで開くことができます。

このモードでも[マクロ関数](#macros)を引き続き使用できます。

クエリタイプを切り替えることで、クエリに最適な可視化を取得できます。
この切り替えは、ダッシュボードビューでも効果があり、特に時系列データで顕著です。

<Image size='md' img={demo_raw_sql_query} alt='生SQLクエリの例' border />


## データリンク {#data-links}

Grafana [データリンク](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-data-links)を使用して新しいクエリにリンクできます。
この機能はClickHouseプラグインで有効化されており、トレースからログへ、またはその逆方向へのリンクが可能です。[データソースの設定](./config.md#opentelemetry)でログとトレースの両方にOpenTelemetryを設定している場合に最適に動作します。

<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "15px"
  }}
>
  テーブル内のトレースリンクの例
  <Image size='sm' img={trace_id_in_table} alt='Trace links in table' border />
</div>

<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between"
  }}
>
  ログ内のトレースリンクの例
  <Image size='md' img={trace_id_in_logs} alt='Trace links in logs' border />
</div>

### データリンクの作成方法 {#how-to-make-a-data-link}

クエリ内で`traceID`という名前の列を選択することでデータリンクを作成できます。この名前は大文字小文字を区別せず、「ID」の前にアンダースコアを追加することもサポートされています。例えば、`traceId`、`TraceId`、`TRACE_ID`、`tracE_iD`はすべて有効です。

[ログ](#logs)または[トレース](#traces)クエリでOpenTelemetryが有効化されている場合、トレースID列が自動的に含まれます。

トレースID列を含めることで、「**View Trace**」と「**View Logs**」のリンクがデータに付加されます。

### リンク機能 {#linking-abilities}

データリンクが存在する場合、提供されたトレースIDを使用してトレースとログを開くことができます。

「**View Trace**」はトレースを含む分割パネルを開き、「**View Logs**」はトレースIDでフィルタリングされたログクエリを開きます。
エクスプローラービューではなくダッシュボードからリンクをクリックした場合、リンクはエクスプローラービューの新しいタブで開かれます。

クエリタイプをまたぐ場合(ログからトレース、トレースからログ)には、[ログ](./config.md#logs)と[トレース](./config.md#traces)の両方にデフォルト設定が必要です。同じクエリタイプのリンクを開く場合は、クエリを単純にコピーできるため、デフォルト設定は不要です。

<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between"
  }}
>
  ログクエリ(左パネル)からトレース(右パネル)を表示する例
  <Image
    size='md'
    img={demo_data_links}
    alt='Example of data links linking'
    border
  />
</div>


## マクロ {#macros}

マクロは、クエリに動的なSQLを追加するためのシンプルな方法です。
クエリがClickHouseサーバーに送信される前に、プラグインはマクロを展開し、完全な式に置き換えます。

SQLエディタとQuery Builderの両方からのクエリでマクロを使用できます。

### マクロの使用 {#using-macros}

マクロは、必要に応じて複数回、クエリ内のどこにでも含めることができます。

以下は`$__timeFilter`マクロを使用する例です:

入力:

```sql
SELECT log_time, log_message
FROM logs
WHERE $__timeFilter(log_time)
```

最終的なクエリ出力:

```sql
SELECT log_time, log_message
FROM logs
WHERE log_time >= toDateTime(1415792726) AND log_time <= toDateTime(1447328726)
```

この例では、Grafanaダッシュボードの時間範囲が`log_time`カラムに適用されます。

プラグインは波括弧`{}`を使用した表記もサポートしています。[パラメータ](/sql-reference/syntax.md#defining-and-using-query-parameters)内でクエリが必要な場合は、この表記を使用してください。

### マクロ一覧 {#list-of-macros}

以下は、プラグインで利用可能なすべてのマクロの一覧です:

| マクロ                                        | 説明                                                                                                                                                                         | 出力例                                                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `$__dateFilter(columnName)`                  | Grafanaパネルの時間範囲を[Date](/sql-reference/data-types/date.md)として使用し、指定されたカラムに対する時間範囲フィルタに置き換えられます。                                         | `columnName >= toDate('2022-10-21') AND columnName <= toDate('2022-10-23')`                                       |
| `$__timeFilter(columnName)`                  | Grafanaパネルの時間範囲を[DateTime](/sql-reference/data-types/datetime.md)として使用し、指定されたカラムに対する時間範囲フィルタに置き換えられます。                                 | `columnName >= toDateTime(1415792726) AND time <= toDateTime(1447328726)`                                         |
| `$__timeFilter_ms(columnName)`               | Grafanaパネルの時間範囲を[DateTime64](/sql-reference/data-types/datetime64.md)として使用し、指定されたカラムに対する時間範囲フィルタに置き換えられます。                             | `columnName >= fromUnixTimestamp64Milli(1415792726123) AND columnName <= fromUnixTimestamp64Milli(1447328726456)` |
| `$__dateTimeFilter(dateColumn, timeColumn)`  | 別々のDateカラムとDateTimeカラムを使用して`$__dateFilter()`と`$__timeFilter()`を組み合わせた省略記法です。エイリアス`$__dt()`                                                           | `$__dateFilter(dateColumn) AND $__timeFilter(timeColumn)`                                                         |
| `$__fromTime`                                | Grafanaパネル範囲の開始時刻を[DateTime](/sql-reference/data-types/datetime.md)にキャストしたものに置き換えられます。                                                               | `toDateTime(1415792726)`                                                                                          |
| `$__fromTime_ms`                             | パネル範囲の開始時刻を[DateTime64](/sql-reference/data-types/datetime64.md)にキャストしたものに置き換えられます。                                                                   | `fromUnixTimestamp64Milli(1415792726123)`                                                                         |
| `$__toTime`                                  | Grafanaパネル範囲の終了時刻を[DateTime](/sql-reference/data-types/datetime.md)にキャストしたものに置き換えられます。                                                                 | `toDateTime(1447328726)`                                                                                          |
| `$__toTime_ms`                               | パネル範囲の終了時刻を[DateTime64](/sql-reference/data-types/datetime64.md)にキャストしたものに置き換えられます。                                                                     | `fromUnixTimestamp64Milli(1447328726456)`                                                                         |
| `$__timeInterval(columnName)`                | ウィンドウサイズ(秒単位)に基づいて間隔を計算する関数に置き換えられます。                                                                                                    | `toStartOfInterval(toDateTime(columnName), INTERVAL 20 second)`                                                   |
| `$__timeInterval_ms(columnName)`             | ウィンドウサイズ(ミリ秒単位)に基づいて間隔を計算する関数に置き換えられます。                                                                                               | `toStartOfInterval(toDateTime64(columnName, 3), INTERVAL 20 millisecond)`                                         |
| `$__interval_s`                              | ダッシュボードの間隔(秒単位)に置き換えられます。                                                                                                                                      | `20`                                                                                                              |
| `$__conditionalAll(condition, $templateVar)` | 第2パラメータのテンプレート変数がすべての値を選択していない場合は第1パラメータに置き換えられます。テンプレート変数がすべての値を選択している場合は1=1に置き換えられます。 | `condition` または `1=1`                                                                                              |
