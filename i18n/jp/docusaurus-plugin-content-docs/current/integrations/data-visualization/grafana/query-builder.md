---
sidebar_label: 'クエリビルダー'
sidebar_position: 2
slug: /integrations/grafana/query-builder
description: 'ClickHouse Grafana プラグインにおけるクエリビルダーの使用'
title: 'クエリビルダー'
doc_type: 'guide'
keywords: ['grafana', 'query builder', 'visualization', 'dashboards', 'plugin']
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

任意のクエリを ClickHouse プラグインで実行できます。
クエリビルダーは比較的単純なクエリに便利なオプションですが、複雑なクエリには [SQL Editor](#sql-editor) を使用する必要があります。

クエリビルダー内のすべてのクエリには[クエリタイプ](#query-types)があり、少なくとも 1 つのカラムを選択する必要があります。

利用可能なクエリタイプは次のとおりです:
- [Table](#table): データをテーブル形式で表示するための、最も基本的なクエリタイプです。集約関数を含む、単純なクエリから複雑なクエリまで、幅広い用途で利用できます。
- [Logs](#logs): ログ向けクエリの作成に最適化されています。[デフォルトが構成](./config.md#logs)された Explore ビューで最大限に活用できます。
- [Time Series](#time-series): 時系列クエリの作成に最適です。専用の時間カラムを選択し、集約関数を追加できます。
- [Traces](#traces): トレースの検索・閲覧に最適化されています。[デフォルトが構成](./config.md#traces)された Explore ビューで最大限に活用できます。
- [SQL Editor](#sql-editor): クエリを完全に制御したい場合に使用します。このモードでは、任意の SQL クエリを実行できます。



## クエリタイプ {#query-types}

_クエリタイプ_設定により、構築するクエリのタイプに合わせてクエリビルダーのレイアウトが変更されます。
クエリタイプは、データを可視化する際に使用されるパネルも決定します。

### テーブル {#table}

最も柔軟なクエリタイプはテーブルクエリです。これは、シンプルなクエリと集約クエリの両方を処理するように設計された、他のクエリビルダーを包括するタイプです。

| フィールド        | 説明                                                                                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ビルダーモード | シンプルクエリは集約とGroup Byを除外し、集約クエリはこれらのオプションを含みます。                                                                                                               |
| カラム      | 選択されたカラム。このフィールドには生のSQLを入力でき、関数やカラムのエイリアスを使用できます。                                                                                                       |
| 集約   | [集約関数](/sql-reference/aggregate-functions/index.md)のリスト。関数とカラムのカスタム値を指定できます。集約モードでのみ表示されます。                                              |
| Group By     | [GROUP BY](/sql-reference/statements/select/group-by.md)式のリスト。集約モードでのみ表示されます。                                                                                              |
| Order By     | [ORDER BY](/sql-reference/statements/select/order-by.md)式のリスト。                                                                                                                              |
| Limit        | クエリの末尾に[LIMIT](/sql-reference/statements/select/limit.md)ステートメントを追加します。`0`に設定すると除外されます。一部の可視化では、すべてのデータを表示するために`0`に設定する必要がある場合があります。 |
| フィルター      | `WHERE`句で適用されるフィルターのリスト。                                                                                                                                                       |

<Image
  size='md'
  img={demo_table_query}
  alt='集約テーブルクエリの例'
  border
/>

このクエリタイプは、データをテーブルとして表示します。

### ログ {#logs}

ログクエリタイプは、ログデータのクエリに特化したクエリビルダーを提供します。
データソースの[ログ設定](./config.md#logs)でデフォルト値を設定することで、クエリビルダーにデフォルトのデータベース/テーブルとカラムを事前にロードできます。
OpenTelemetryを有効にすると、スキーマバージョンに応じてカラムを自動選択することもできます。

**Time**と**Level**フィルターがデフォルトで追加され、Timeカラムに対するOrder Byも追加されます。
これらのフィルターはそれぞれのフィールドに紐付けられており、カラムが変更されると更新されます。
**Level**フィルターはデフォルトでSQLから除外されており、`IS ANYTHING`オプションから変更すると有効になります。

ログクエリタイプは[データリンク](#data-links)をサポートしています。

| フィールド          | 説明                                                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Use OTel       | OpenTelemetryカラムを有効にします。選択されたカラムを上書きして、選択されたOTelスキーマバージョンで定義されたカラムを使用します(カラム選択を無効にします)。                                 |
| カラム        | ログ行に追加される追加カラム。このフィールドには生のSQLを入力でき、関数やカラムのエイリアスを使用できます。                                                                |
| Time           | ログの主要なタイムスタンプカラム。時刻型を表示しますが、カスタム値/関数も指定できます。                                                                            |
| Log Level      | オプション。ログの_レベル_または_重大度_。値は通常、`INFO`、`error`、`Debug`などです。                                                                                  |
| Message        | ログメッセージの内容。                                                                                                                                                                   |
| Order By       | [ORDER BY](/sql-reference/statements/select/order-by.md)式のリスト。                                                                                                            |
| Limit          | クエリの末尾に[LIMIT](/sql-reference/statements/select/limit.md)ステートメントを追加します。`0`に設定すると除外されますが、大規模なログデータセットには推奨されません。 |
| フィルター        | `WHERE`句で適用されるフィルターのリスト。                                                                                                                                     |
| Message Filter | `LIKE %value%`を使用してログを便利にフィルタリングするためのテキスト入力。入力が空の場合は除外されます。                                                                                         |

<Image size='md' img={demo_logs_query} alt='OTelログクエリの例' border />

<br />
このクエリタイプは、データをログパネルに表示し、上部にログヒストグラムパネルも表示します。

クエリで選択された追加カラムは、展開されたログ行で表示できます:

<Image
  size='md'
  img={demo_logs_query_fields}
  alt='ログクエリの追加フィールドの例'
  border
/>

### 時系列 {#time-series}

時系列クエリタイプは[テーブル](#table)に似ていますが、時系列データに焦点を当てています。

2つのビューはほぼ同じですが、以下の顕著な違いがあります:

- 専用の_Time_フィールド。
- 集約モードでは、時間間隔マクロが自動的に適用され、Timeフィールドに対するGroup Byも追加されます。
- 集約モードでは、「カラム」フィールドが非表示になります。
- **Time**フィールドに対して、時間範囲フィルターとOrder Byが自動的に追加されます。

:::important 可視化でデータが欠けていませんか?
場合によっては、制限がデフォルトで`1000`に設定されているため、時系列パネルが途切れて表示されることがあります。

(データセットが許可する場合)制限を`0`に設定して`LIMIT`句を削除してみてください。
:::


| フィールド        | 説明                                                                                                                                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Builder Mode | シンプルクエリは集約とGroup Byを除外し、集約クエリにはこれらのオプションが含まれます。                                                                                                                                     |
| Time         | クエリの主要な時刻カラム。時刻型が表示されますが、カスタム値や関数も使用できます。                                                                                                                       |
| Columns      | 選択されたカラム。このフィールドには生のSQLを入力でき、関数やカラムのエイリアスを使用できます。シンプルモードでのみ表示されます。                                                                                                                |
| Aggregates   | [集約関数](/sql-reference/aggregate-functions/index.md)のリスト。関数とカラムにカスタム値を使用できます。集約モードでのみ表示されます。                                                                    |
| Group By     | [GROUP BY](/sql-reference/statements/select/group-by.md)式のリスト。集約モードでのみ表示されます。                                                                                                                                    |
| Order By     | [ORDER BY](/sql-reference/statements/select/order-by.md)式のリスト。                                                                                                                                                    |
| Limit        | クエリの末尾に[LIMIT](/sql-reference/statements/select/limit.md)文を追加します。`0`に設定すると除外されます。完全な可視化を表示するために、一部の時系列データセットではこの設定が推奨されます。 |
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
OpenTelemetryデータ向けに設計されていますが、異なるスキーマからトレースをレンダリングするためにカラムを選択することもできます。
データソースの[トレース設定](./config.md#traces)でデフォルト値を設定することで、クエリビルダーにデフォルトのデータベース/テーブルおよびカラムを事前にロードできます。デフォルト値が設定されている場合、カラム選択はデフォルトで折りたたまれます。
OpenTelemetryを有効にすると、スキーマバージョンに応じてカラムを自動選択することもできます。

デフォルトフィルタは、トップレベルのスパンのみを表示する目的で追加されます。
TimeカラムとDuration Timeカラムに対するOrder Byも含まれています。
これらのフィルタはそれぞれのフィールドに紐付けられており、カラムが変更されると更新されます。
**Service Name**フィルタはデフォルトでSQLから除外されており、`IS ANYTHING`オプションから変更すると有効になります。

トレースクエリタイプは[データリンク](#data-links)をサポートしています。

| フィールド                 | 説明                                                                                                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trace Mode            | クエリをトレース検索からトレースIDルックアップに変更します。                                                                                                                                      |
| Use OTel              | OpenTelemetryカラムを有効にします。選択されたOTelスキーマバージョンで定義されたカラムを使用するように、選択されたカラムを上書きします(カラム選択を無効にします)。                                   |
| Trace ID Column       | トレースのID。                                                                                                                                                                              |
| Span ID Column        | スパンID。                                                                                                                                                                                     |
| Parent Span ID Column | 親スパンID。トップレベルのトレースでは通常空です。                                                                                                                                  |
| Service Name Column   | サービス名。                                                                                                                                                                                |
| Operation Name Column | オペレーション名。                                                                                                                                                                              |
| Start Time Column     | トレーススパンの主要な時刻カラム。スパンが開始された時刻です。                                                                                                                  |
| Duration Time Column  | スパンの期間。デフォルトでは、Grafanaはこれをミリ秒単位の浮動小数点数として想定しています。`Duration Unit`ドロップダウンを介して自動的に変換が適用されます。                             |
| Duration Unit         | 期間に使用される時間の単位。デフォルトはナノ秒です。選択された単位は、Grafanaが要求するミリ秒単位の浮動小数点数に変換されます。                                       |
| Tags Column           | スパンタグ。OTelベースのスキーマを使用していない場合は除外してください。特定のMapカラム型を想定しています。                                                                                          |
| Service Tags Column   | サービスタグ。OTelベースのスキーマを使用していない場合は除外してください。特定のMapカラム型を想定しています。                                                                                       |
| Order By              | [ORDER BY](/sql-reference/statements/select/order-by.md)式のリスト。                                                                                                              |
| Limit                 | クエリの末尾に[LIMIT](/sql-reference/statements/select/limit.md)文を追加します。`0`に設定すると除外されますが、大規模なトレースデータセットではこれは推奨されません。 |
| Filters               | `WHERE`句で適用されるフィルタのリスト。                                                                                                                                       |
| Trace ID              | フィルタリングするトレースID。トレースIDモードで使用され、トレースID[データリンク](#data-links)を開く際にも使用されます。                                                                                 |

<Image size='md' img={demo_trace_query} alt='OTelトレースクエリの例' border />

このクエリタイプは、トレース検索モードではテーブルビューで、トレースIDモードではトレースパネルでデータをレンダリングします。


## SQLエディタ {#sql-editor}

クエリビルダーでは複雑すぎるクエリの場合、SQLエディタを使用できます。
これにより、ClickHouse SQLを直接記述・実行できるため、クエリを完全に制御できます。

SQLエディタは、クエリエディタの上部にある「SQL Editor」を選択することで開くことができます。

[マクロ関数](#macros)は、このモードでも引き続き使用できます。

クエリタイプを切り替えることで、クエリに最適な可視化を取得できます。
この切り替えは、ダッシュボードビューでも効果があり、特に時系列データで顕著です。

<Image size='md' img={demo_raw_sql_query} alt='SQLクエリの例' border />


## データリンク {#data-links}

Grafana [データリンク](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-data-links)を使用して、新しいクエリへリンクできます。

この機能はClickHouseプラグインで有効化されており、トレースからログへ、またはその逆方向へのリンクが可能です。[データソースの設定](./config.md#opentelemetry)でログとトレースの両方にOpenTelemetryを設定すると最適に動作します。

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

クエリ内で`traceID`という名前のカラムを選択することで、データリンクを作成できます。この名前は大文字小文字を区別せず、「ID」の前にアンダースコアを追加することもサポートしています。例えば、`traceId`、`TraceId`、`TRACE_ID`、`tracE_iD`はすべて有効です。

[ログ](#logs)または[トレース](#traces)クエリでOpenTelemetryが有効化されている場合、トレースIDカラムが自動的に含まれます。

トレースIDカラムを含めることで、「**View Trace**」と「**View Logs**」のリンクがデータに付加されます。

### リンク機能 {#linking-abilities}

データリンクが存在する場合、提供されたトレースIDを使用してトレースとログを開くことができます。

「**View Trace**」はトレースを含む分割パネルを開き、「**View Logs**」はトレースIDでフィルタリングされたログクエリを開きます。
探索ビューではなくダッシュボードからリンクをクリックした場合、リンクは探索ビューの新しいタブで開かれます。

クエリタイプをまたぐ場合(ログからトレース、トレースからログ)は、[ログ](./config.md#logs)と[トレース](./config.md#traces)の両方にデフォルト設定が必要です。同じクエリタイプのリンクを開く場合は、クエリを単純にコピーできるため、デフォルト設定は不要です。

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

マクロは、クエリに動的なSQLを追加するシンプルな方法です。
クエリがClickHouseサーバーに送信される前に、プラグインはマクロを展開し、完全な式に置き換えます。

SQLエディタとクエリビルダーの両方のクエリでマクロを使用できます。

### マクロの使用 {#using-macros}

マクロはクエリ内のどこにでも、必要に応じて複数回含めることができます。

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
| `$__dateFilter(columnName)`                  | 指定されたカラムに対して、Grafanaパネルの時間範囲を[Date](/sql-reference/data-types/date.md)として使用した時間範囲フィルタに置き換えられます。                                         | `columnName >= toDate('2022-10-21') AND columnName <= toDate('2022-10-23')`                                       |
| `$__timeFilter(columnName)`                  | 指定されたカラムに対して、Grafanaパネルの時間範囲を[DateTime](/sql-reference/data-types/datetime.md)として使用した時間範囲フィルタに置き換えられます。                                 | `columnName >= toDateTime(1415792726) AND time <= toDateTime(1447328726)`                                         |
| `$__timeFilter_ms(columnName)`               | 指定されたカラムに対して、Grafanaパネルの時間範囲を[DateTime64](/sql-reference/data-types/datetime64.md)として使用した時間範囲フィルタに置き換えられます。                             | `columnName >= fromUnixTimestamp64Milli(1415792726123) AND columnName <= fromUnixTimestamp64Milli(1447328726456)` |
| `$__dateTimeFilter(dateColumn, timeColumn)`  | 別々のDateカラムとDateTimeカラムを使用して`$__dateFilter()`と`$__timeFilter()`を組み合わせた短縮形です。エイリアス: `$__dt()`                                                           | `$__dateFilter(dateColumn) AND $__timeFilter(timeColumn)`                                                         |
| `$__fromTime`                                | Grafanaパネル範囲の開始時刻を[DateTime](/sql-reference/data-types/datetime.md)にキャストしたものに置き換えられます。                                                               | `toDateTime(1415792726)`                                                                                          |
| `$__fromTime_ms`                             | パネル範囲の開始時刻を[DateTime64](/sql-reference/data-types/datetime64.md)にキャストしたものに置き換えられます。                                                                   | `fromUnixTimestamp64Milli(1415792726123)`                                                                         |
| `$__toTime`                                  | Grafanaパネル範囲の終了時刻を[DateTime](/sql-reference/data-types/datetime.md)にキャストしたものに置き換えられます。                                                                 | `toDateTime(1447328726)`                                                                                          |
| `$__toTime_ms`                               | パネル範囲の終了時刻を[DateTime64](/sql-reference/data-types/datetime64.md)にキャストしたものに置き換えられます。                                                                     | `fromUnixTimestamp64Milli(1447328726456)`                                                                         |
| `$__timeInterval(columnName)`                | ウィンドウサイズに基づいて秒単位で間隔を計算する関数に置き換えられます。                                                                                                    | `toStartOfInterval(toDateTime(columnName), INTERVAL 20 second)`                                                   |
| `$__timeInterval_ms(columnName)`             | ウィンドウサイズに基づいてミリ秒単位で間隔を計算する関数に置き換えられます。                                                                                               | `toStartOfInterval(toDateTime64(columnName, 3), INTERVAL 20 millisecond)`                                         |
| `$__interval_s`                              | ダッシュボードの間隔(秒単位)に置き換えられます。                                                                                                                                      | `20`                                                                                                              |
| `$__conditionalAll(condition, $templateVar)` | 第2パラメータのテンプレート変数がすべての値を選択していない場合は第1パラメータに置き換えられます。テンプレート変数がすべての値を選択している場合は1=1に置き換えられます。 | `condition` または `1=1`                                                                                              |
