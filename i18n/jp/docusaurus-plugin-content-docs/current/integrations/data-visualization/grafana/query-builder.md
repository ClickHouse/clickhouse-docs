---
sidebar_label: 'Query Builder'
sidebar_position: 2
slug: /integrations/grafana/query-builder
description: 'ClickHouse Grafana プラグインにおける Query Builder の使用'
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
クエリビルダーはシンプルなクエリに便利なオプションですが、複雑なクエリには [SQL Editor](#sql-editor) を使用する必要があります。

クエリビルダー内のすべてのクエリには[クエリ種別](#query-types)があり、少なくとも 1 つのカラムを選択する必要があります。

利用可能なクエリ種別は次のとおりです:
- [Table](#table): データをテーブル形式で表示する最も単純なクエリ種別です。集約関数を含むシンプルおよび複雑なクエリの両方に対応できる汎用的なオプションです。
- [Logs](#logs): ログ向けクエリの構築に最適化されています。[デフォルトを設定](./config.md#logs)した Explore ビューで使用すると最も効果的です。
- [Time Series](#time-series): 時系列クエリの構築に最適です。専用の時刻カラムを選択し、集約関数を追加できます。
- [Traces](#traces): トレースの検索・閲覧に最適化されています。[デフォルトを設定](./config.md#traces)した Explore ビューで使用すると最も効果的です。
- [SQL Editor](#sql-editor): クエリを完全に制御したい場合に使用できます。このモードでは、任意の SQL クエリを実行できます。



## クエリタイプ {#query-types}

*クエリタイプ* 設定を変更すると、作成するクエリの種類に合わせてクエリビルダーのレイアウトが変わります。
クエリタイプは、データを可視化する際に使用されるパネルも決定します。

### テーブル {#table}

最も柔軟なクエリタイプはテーブルクエリです。これは、シンプルクエリと集約クエリの両方を扱えるように設計された、他のクエリビルダーの汎用的なタイプです。

| フィールド | 説明 |
|----|----|
| Builder Mode  | シンプルクエリでは集約関数と Group By を除外し、集約クエリではこれらのオプションを含みます。 |
| Columns | 選択されたカラム。このフィールドには生のSQLを入力でき、関数やカラムのエイリアスを使用できます。 |
| Aggregates | [集約関数](/sql-reference/aggregate-functions/index.md) のリスト。関数およびカラムに対してカスタム値を指定できます。Aggregate モードのときのみ表示されます。 |
| Group By | [GROUP BY](/sql-reference/statements/select/group-by.md) 式のリスト。Aggregate モードのときのみ表示されます。 |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 式のリスト。 |
| Limit | クエリの末尾に [LIMIT](/sql-reference/statements/select/limit.md) 句を追加します。`0` に設定すると除外されます。すべてのデータを表示するために、いくつかの可視化では `0` に設定する必要がある場合があります。 |
| Filters | `WHERE` 句で適用されるフィルターのリスト。 |

<Image size="md" img={demo_table_query} alt="集約テーブルクエリの例" border />

このクエリタイプでは、データはテーブルとしてレンダリングされます。

### ログ {#logs}

ログクエリタイプは、ログデータのクエリに特化したクエリビルダーを提供します。
データソースの [ログ設定](./config.md#logs) でデフォルトを構成することで、クエリビルダーにデフォルトのデータベース／テーブルおよびカラムをあらかじめ読み込ませることができます。
OpenTelemetry を有効にすると、スキーマバージョンに応じてカラムを自動選択することもできます。

**Time** と **Level** のフィルターはデフォルトで追加され、Time カラムに対する Order By も設定されます。
これらのフィルターはそれぞれのフィールドに紐づいており、カラムが変更されると更新されます。
**Level** フィルターはデフォルトでは SQL から除外されており、`IS ANYTHING` オプションから変更すると有効になります。

ログクエリタイプは [データリンク](#data-links) をサポートします。

| フィールド | 説明 |
|----|----|
| Use OTel | OpenTelemetry 用のカラムを有効にします。選択されているカラムを上書きし、選択した OTel スキーマバージョンで定義されたカラムを使用します（カラム選択は無効になります）。 |
| Columns | ログ行に追加されるカラム。このフィールドには生のSQLを入力でき、関数やカラムのエイリアスを使用できます。 |
| Time | ログの主なタイムスタンプカラム。時刻型のカラムを表示しますが、カスタム値／関数も使用できます。 |
| Log Level | 任意。ログの *レベル* または *重要度*。値は通常 `INFO`、`error`、`Debug` などです。 |
| Message | ログメッセージの内容。 |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 式のリスト。 |
| Limit | クエリの末尾に [LIMIT](/sql-reference/statements/select/limit.md) 句を追加します。`0` に設定すると除外されますが、大規模なログデータセットでは推奨されません。 |
| Filters | `WHERE` 句で適用されるフィルターのリスト。 |
| Message Filter | `LIKE %value%` を用いてログを簡便にフィルタリングするためのテキスト入力。入力が空の場合は除外されます。 |

<Image size="md" img={demo_logs_query} alt="OTel ログクエリの例" border />

<br/>
このクエリタイプでは、データはログパネルにレンダリングされ、上部にはログのヒストグラムパネルが表示されます。

クエリで選択された追加カラムは、展開表示したログ行で確認できます:
<Image size="md" img={demo_logs_query_fields} alt="ログクエリでの追加フィールドの例" border />

### 時系列 {#time-series}

時系列クエリタイプは [table](#table) に似ていますが、時系列データに特化しています。

2つのビューはほぼ同じですが、次のような主な違いがあります:
- 専用の *Time* フィールド。
- Aggregate モードでは、Time フィールドに対する Group By と一緒に、時間間隔マクロが自動的に適用されます。
- Aggregate モードでは、"Columns" フィールドが非表示になります。
- **Time** フィールドに対して、時間範囲フィルターと Order By が自動的に追加されます。

:::important 可視化でデータが欠けていませんか？
一部のケースでは、デフォルトの limit が `1000` であるため、時系列パネルが途中で切れているように見えることがあります。

（データセットが許容する場合は）`LIMIT` 句を `0` に設定して削除してみてください。
:::



| Field | Description |
|----|----|
| Builder Mode  | Simple クエリでは Aggregate と Group By を除外し、Aggregate クエリではこれらのオプションを含めます。 |
| Time | クエリにおける主要な時間カラムです。時刻型のカラムが表示されますが、カスタム値や関数も指定できます。 |
| Columns | 選択されたカラムです。関数やカラムのエイリアスを利用するために、生の SQL をこのフィールドに直接入力できます。Simple モードでのみ表示されます。 |
| Aggregates | [aggregate functions](/sql-reference/aggregate-functions/index.md) の一覧です。関数名やカラム名にカスタム値を指定できます。Aggregate モードでのみ表示されます。 |
| Group By | [GROUP BY](/sql-reference/statements/select/group-by.md) 式の一覧です。Aggregate モードでのみ表示されます。 |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 式の一覧です。 |
| Limit | クエリ末尾に [LIMIT](/sql-reference/statements/select/limit.md) 句を追加します。`0` に設定した場合は除外されます。一部の時系列データセットでは、可視化を全期間表示するために `0` が推奨される場合があります。 |
| Filters | `WHERE` 句に適用されるフィルターの一覧です。 |

<Image size="md" img={demo_time_series_query} alt="時系列クエリの例" border />

このクエリタイプでは、データが時系列パネルでレンダリングされます。

### Traces {#traces}

Trace クエリタイプは、トレースを簡単に検索・閲覧するためのクエリビルダーを提供します。
OpenTelemetry データ向けに設計されていますが、スキーマが異なる場合でもカラムを選択してトレースをレンダリングできます。
データソースの [trace configuration](./config.md#traces) でデフォルトを設定しておくと、クエリビルダーにデフォルトのデータベース／テーブルとカラムを事前読み込みできます。デフォルトが設定されている場合、カラム選択はデフォルトで折りたたまれます。
OpenTelemetry を有効化して、スキーマバージョンに従ってカラムを自動選択させることもできます。

デフォルトフィルターは、トップレベルの span のみを表示する目的で追加されています。
Time カラムと Duration Time カラムに対する Order By も含まれます。
これらのフィルターはそれぞれのフィールドに紐づいており、カラムが変更されると更新されます。
**Service Name** フィルターはデフォルトでは SQL から除外されており、`IS ANYTHING` 以外のオプションに変更すると有効になります。

Trace クエリタイプは [data links](#data-links) をサポートします。

| Field | Description |
|----|----|
| Trace Mode | クエリを Trace Search と Trace ID lookup の間で切り替えます。 |
| Use OTel | OpenTelemetry 用のカラムを有効化します。選択済みカラムを、選択された OTel スキーマバージョンで定義されたカラムに上書きします（カラム選択を無効化します）。 |
| Trace ID Column | Trace の ID です。 |
| Span ID Column | Span ID です。 |
| Parent Span ID Column | 親 span の ID です。トップレベルのトレースでは通常空になります。 |
| Service Name Column | Service 名です。 |
| Operation Name Column | Operation 名です。 |
| Start Time Column | Trace span における主要な時間カラムです。span の開始時刻を表します。 |
| Duration Time Column | span の継続時間です。デフォルトでは、Grafana はこれをミリ秒単位の float として想定しています。`Duration Unit` ドロップダウンで指定された単位からの変換が自動的に適用されます。 |
| Duration Unit | Duration に使用される時間単位です。デフォルトはナノ秒です。選択された単位は、Grafana が要求するミリ秒単位の float に変換されます。 |
| Tags Column | Span Tags です。特定の Map カラム型を想定しているため、OTel ベースのスキーマを使用していない場合は除外してください。 |
| Service Tags Column | Service Tags です。特定の Map カラム型を想定しているため、OTel ベースのスキーマを使用していない場合は除外してください。 |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 式の一覧です。 |
| Limit | クエリ末尾に [LIMIT](/sql-reference/statements/select/limit.md) 句を追加します。`0` に設定した場合は除外されますが、大規模な Trace データセットでは推奨されません。 |
| Filters | `WHERE` 句に適用されるフィルターの一覧です。 |
| Trace ID | フィルター対象の Trace ID です。Trace ID モードと、Trace ID [data link](#data-links) を開く場合にのみ使用されます。 |

<Image size="md" img={demo_trace_query} alt="OTel トレースクエリの例" border />

このクエリタイプでは、Trace Search モードではテーブルビューでデータがレンダリングされ、Trace ID モードではトレースパネルでレンダリングされます。



## SQL エディタ {#sql-editor}

クエリビルダーでは扱いきれないような複雑なクエリには、SQL エディタを使用できます。
生の ClickHouse SQL を記述して実行することで、クエリを完全に制御できます。

SQL エディタは、クエリエディタ上部の「SQL Editor」を選択して開きます。

このモードでも [マクロ関数](#macros) を使用できます。

クエリの種類を切り替えることで、クエリに最も適した可視化を得ることができます。
この切り替えはダッシュボードビューでも有効で、特に時系列データで効果があります。

<Image size="md" img={demo_raw_sql_query} alt="生の SQL クエリの例" border />



## データリンク {#data-links}

Grafana の [data links](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-data-links)
を使用して、新しいクエリへのリンクを作成できます。
この機能は ClickHouse プラグインで有効になっており、トレースからログへのリンクおよびその逆方向のリンクに利用できます。[データソースの設定](./config.md#opentelemetry)でログとトレースの両方に対して OpenTelemetry が構成されている場合に、最も有効に機能します。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
  テーブル内のトレースリンクの例
  <Image size="sm" img={trace_id_in_table} alt="Trace links in table" border />
</div>

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  ログ内のトレースリンクの例
  <Image size="md" img={trace_id_in_logs} alt="Trace links in logs" border />
</div>

### データリンクの作成方法 {#how-to-make-a-data-link}

クエリ内で `traceID` という名前の列を選択することで、データリンクを作成できます。この名前は大文字小文字を区別せず、"ID" の前にアンダースコアを付けることもサポートします。たとえば、`traceId`、`TraceId`、`TRACE_ID`、`tracE_iD` はすべて有効です。

[ログ](#logs) または [トレース](#traces) クエリで OpenTelemetry が有効になっている場合、トレース ID 列は自動的に含まれます。

トレース ID 列を含めることで、「**View Trace**」および「**View Logs**」リンクがデータに付与されます。

### リンクの機能 {#linking-abilities}

データリンクが存在する場合、付与されたトレース ID を使用してトレースおよびログを開くことができます。

「**View Trace**」はトレースを表示する分割パネルを開き、「**View Logs**」はトレース ID でフィルタされたログクエリを開きます。
リンクが Explore ビューではなくダッシュボードからクリックされた場合、そのリンクは Explore ビューの新しいタブで開かれます。

クエリタイプをまたいでリンクする場合（ログからトレース、またはトレースからログ）、[ログ](./config.md#logs) と [トレース](./config.md#traces) の両方に対してデフォルト設定が構成されている必要があります。同じクエリタイプのリンクを開く場合は、クエリをそのままコピーできるため、デフォルト設定は不要です。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  ログクエリ（左パネル）からトレース（右パネル）を表示する例
  <Image size="md" img={demo_data_links} alt="Example of data links linking" border />
</div>



## マクロ

マクロは、クエリに動的な SQL を追加するための簡単な方法です。
クエリが ClickHouse サーバーに送信される前に、プラグインがマクロを展開し、完全な式に置き換えます。

SQL Editor と Query Builder の両方で発行したクエリで、マクロを使用できます。

### マクロの使用方法

マクロは、クエリ内の任意の位置に、必要に応じて複数回含めることができます。

`$__timeFilter` マクロの使用例は次のとおりです。

入力:

```sql
SELECT log_time, log_message
FROM logs
WHERE $__timeFilter(log_time)
```

最終クエリ結果：

```sql
SELECT log_time, log_message
FROM logs
WHERE log_time >= toDateTime(1415792726) AND log_time <= toDateTime(1447328726)
```

この例では、Grafana ダッシュボードの時間範囲が `log_time` 列に適用されます。

プラグインは、波括弧 `{}` を用いた記法にも対応しています。[パラメーター](/sql-reference/syntax.md#defining-and-using-query-parameters) 内でクエリが必要な場合は、この記法を使用します。

### マクロ一覧

これは、プラグインで利用可能なすべてのマクロの一覧です。

| Macro                                        | Description                                                                                               | Output example                                                                                                    |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `$__dateFilter(columnName)`                  | Grafana パネルの時間範囲を用いて、指定された列に対する [Date](/sql-reference/data-types/date.md) 型の時間範囲フィルターに展開されます。             | `columnName >= toDate('2022-10-21') AND columnName <= toDate('2022-10-23')`                                       |
| `$__timeFilter(columnName)`                  | Grafana パネルの時間範囲を用いて、指定された列に対する [DateTime](/sql-reference/data-types/datetime.md) 型の時間範囲フィルターに展開されます。     | `columnName >= toDateTime(1415792726) AND time <= toDateTime(1447328726)`                                         |
| `$__timeFilter_ms(columnName)`               | Grafana パネルの時間範囲を用いて、指定された列に対する [DateTime64](/sql-reference/data-types/datetime64.md) 型の時間範囲フィルターに展開されます。 | `columnName >= fromUnixTimestamp64Milli(1415792726123) AND columnName <= fromUnixTimestamp64Milli(1447328726456)` |
| `$__dateTimeFilter(dateColumn, timeColumn)`  | 個別の Date 列と DateTime 列を使用して、`$__dateFilter()` と `$__timeFilter()` を組み合わせるための短縮表記です。エイリアスは `$__dt()` です。   | `$__dateFilter(dateColumn) AND $__timeFilter(timeColumn)`                                                         |
| `$__fromTime`                                | Grafana パネル範囲の開始時刻を [DateTime](/sql-reference/data-types/datetime.md) 型にキャストした値に展開されます。                   | `toDateTime(1415792726)`                                                                                          |
| `$__fromTime_ms`                             | パネル範囲の開始時刻を [DateTime64](/sql-reference/data-types/datetime64.md) 型にキャストした値に展開されます。                       | `fromUnixTimestamp64Milli(1415792726123)`                                                                         |
| `$__toTime`                                  | Grafana パネル範囲の終了時刻を [DateTime](/sql-reference/data-types/datetime.md) 型にキャストした値に展開されます。                   | `toDateTime(1447328726)`                                                                                          |
| `$__toTime_ms`                               | Grafana パネル範囲の終了時刻を [DateTime64](/sql-reference/data-types/datetime64.md) 型にキャストした値に展開されます。               | `fromUnixTimestamp64Milli(1447328726456)`                                                                         |
| `$__timeInterval(columnName)`                | ウィンドウサイズ（秒）に基づいてインターバルを計算する関数に展開されます。                                                                     | `toStartOfInterval(toDateTime(columnName), INTERVAL 20 second)`                                                   |
| `$__timeInterval_ms(columnName)`             | ウィンドウサイズ（ミリ秒）に基づいてインターバルを計算する関数に展開されます。                                                                   | `toStartOfInterval(toDateTime64(columnName, 3), INTERVAL 20 millisecond)`                                         |
| `$__interval_s`                              | ダッシュボードのインターバル（秒）に展開されます。                                                                                 | `20`                                                                                                              |
| `$__conditionalAll(condition, $templateVar)` | 第 2 引数のテンプレート変数がすべての値を選択していない場合は第 1 引数に、テンプレート変数がすべての値を選択している場合は `1=1` に展開されます。                           | `condition` または `1=1`                                                                                             |
