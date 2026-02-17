---
sidebar_label: 'クエリビルダー'
sidebar_position: 2
slug: /integrations/grafana/query-builder
description: 'ClickHouse Grafana プラグインでクエリビルダーを使用する方法'
title: 'クエリビルダー'
doc_type: 'guide'
keywords: ['grafana', 'クエリビルダー', '可視化', 'ダッシュボード', 'プラグイン']
integration:
  - support_level: 'core'
  - category: 'data_visualization'
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


# クエリビルダー \{#query-builder\}

<ClickHouseSupportedBadge/>

任意のクエリは ClickHouse プラグインで実行できます。
クエリビルダーはシンプルなクエリに便利なオプションですが、複雑なクエリについては [SQL Editor](#sql-editor) を使用する必要があります。

クエリビルダー内のすべてのクエリには [クエリタイプ](#query-types) があり、少なくとも 1 つのカラムを選択する必要があります。

利用可能なクエリタイプは次のとおりです:

- [Table](#table): データをテーブル形式で表示するための最も単純なクエリタイプです。集約関数を含むシンプルおよび複雑なクエリの両方に対する汎用的な選択肢として適しています。
- [Logs](#logs): ログ用のクエリを構築するために最適化されています。[デフォルトが設定された](./config.md#logs) Explore ビューで最も効果的に機能します。
- [Time Series](#time-series): 時系列クエリを構築する際に最適です。専用の時間カラムの選択と集約関数の追加が可能です。
- [Traces](#traces): トレースの検索・閲覧向けに最適化されています。[デフォルトが設定された](./config.md#traces) Explore ビューで最も効果的に機能します。
- [SQL Editor](#sql-editor): クエリを完全に制御したい場合に使用できます。このモードでは、任意の SQL クエリを実行できます。

## クエリタイプ \{#query-types\}

*Query Type* 設定を変更すると、作成しているクエリの種類に応じて Query Builder のレイアウトが変更されます。
また、クエリタイプは、データの可視化に使用されるパネルも決定します。

### Table \{#table\}

最も柔軟なクエリタイプはテーブルクエリです。これは、他のクエリビルダーが扱うシンプルクエリおよび集約クエリのどちらにも対応する汎用的なクエリタイプです。

| Field | Description |
|----|----|
| Builder Mode  | シンプルクエリでは Aggregates と Group By は使用せず、集約クエリではこれらのオプションを使用します。  |
| Columns | 選択されたカラム。関数やカラムのエイリアスを指定できるように、生の SQL をこのフィールドに直接入力できます。 |
| Aggregates | [集約関数](/sql-reference/aggregate-functions/index.md)の一覧。関数およびカラムに対してカスタム値を設定できます。Aggregate モードでのみ表示されます。 |
| Group By | [GROUP BY](/sql-reference/statements/select/group-by.md) 式の一覧。Aggregate モードでのみ表示されます。 |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 式の一覧。 |
| Limit | クエリの末尾に [LIMIT](/sql-reference/statements/select/limit.md) 文を追加します。`0` に設定された場合は追加されません。いくつかの可視化では、すべてのデータを表示するためにこれを `0` に設定する必要がある場合があります。 |
| Filters | `WHERE` 句に適用されるフィルターの一覧。 |

<Image size="md" img={demo_table_query} alt="集約テーブルクエリの例" border />

このクエリタイプでは、データはテーブルとして表示されます。

### Logs \{#logs\}

logs クエリ種別は、logs データのクエリに特化したクエリビルダーを提供します。
クエリビルダーにデフォルトのデータベース/テーブルおよびカラムをあらかじめ読み込ませるための既定値は、データソースの [log 設定](./config.md#logs) で構成できます。
OpenTelemetry を有効化すると、スキーマバージョンに応じてカラムを自動選択することもできます。

**Time** および **Level** フィルターはデフォルトで追加され、Time カラムに対する Order By も設定されます。
これらのフィルターはそれぞれ対応するフィールドに紐づいており、カラムが変更されると更新されます。
**Level** フィルターはデフォルトでは SQL から除外されており、`IS ANYTHING` オプションから変更した場合に有効になります。

logs クエリ種別は [data links](#data-links) をサポートします。

| Field | Description |
|----|----|
| Use OTel | OpenTelemetry カラムを有効にします。選択されたカラムを、選択した OTel スキーマバージョンで定義されるカラムで上書きします（カラム選択を無効化します）。 |
| Columns | ログ行に追加される追加カラム。このフィールドには生の SQL を入力でき、関数の利用やカラムの別名付けが可能です。 |
| Time | ログの主なタイムスタンプカラム。時刻型に類する型を表示しますが、任意の値や関数も指定できます。 |
| Log Level | 任意。ログの *level* または *severity*。典型的な値は `INFO`、`error`、`Debug` などです。 |
| Message | ログメッセージの内容。 |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 式のリスト。 |
| Limit | クエリ末尾に [LIMIT](/sql-reference/statements/select/limit.md) 文を付加します。`0` に設定した場合は除外されますが、大規模なログデータセットでは推奨されません。 |
| Filters | `WHERE` 句で適用されるフィルターのリスト。 |
| Message Filter | `LIKE %value%` を使ってログを簡単にフィルタリングするためのテキスト入力。入力が空の場合は除外されます。 |

<Image size="md" img={demo_logs_query} alt="Example OTel logs query" border />

<br/>

このクエリ種別では、データは logs パネルにレンダリングされ、その上部に logs ヒストグラムパネルが表示されます。

クエリで選択された追加カラムは、展開されたログ行で参照できます：

<Image size="md" img={demo_logs_query_fields} alt="Example of extra fields on logs query" border />

### 時系列 \{#time-series\}

時系列クエリタイプは [table](#table) と似ていますが、時系列データに特化しています。

2つのビューはほぼ同じですが、主に次の点が異なります。

- 専用の *Time* フィールド。
- Aggregate モードでは、Time フィールドに対する Group By とともに時間間隔マクロが自動的に適用されます。
- Aggregate モードでは "Columns" フィールドが非表示になります。
- **Time** フィールドに対して、時間範囲フィルタと Order By が自動的に追加されます。

:::important 可視化でデータが欠けていませんか？
デフォルトの制限値が `1000` に設定されているため、ケースによっては時系列パネルが途中で切れているように見える場合があります。

データセットが許す場合は、`LIMIT` 句を `0` に設定して削除してみてください。
:::

| フィールド | 説明 |
|----|----|
| Builder Mode  | Simple クエリでは Aggregates と Group By を含まず、aggregate クエリではそれらのオプションを含みます。  |
| Time | クエリの主な時刻カラムです。時刻型に類似した型を表示しますが、カスタム値や関数も指定できます。 |
| Columns | 選択されたカラムです。このフィールドには生の SQL を入力でき、関数やカラムのエイリアス指定が可能です。Simple モードでのみ表示されます。 |
| Aggregates | [aggregate functions](/sql-reference/aggregate-functions/index.md) のリストです。関数およびカラムに対してカスタム値を指定できます。Aggregate モードでのみ表示されます。 |
| Group By | [GROUP BY](/sql-reference/statements/select/group-by.md) 式のリストです。Aggregate モードでのみ表示されます。 |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 式のリストです。 |
| Limit | クエリ末尾に [LIMIT](/sql-reference/statements/select/limit.md) 文を追加します。`0` に設定した場合は除外されます。一部の時系列データセットでは、可視化を完全に表示するために `0` を推奨します。 |
| Filters | `WHERE` 句に適用されるフィルタのリストです。 |

<Image size="md" img={demo_time_series_query} alt="時系列クエリの例" border />

このクエリタイプでは、データは時系列パネルとしてレンダリングされます。

### トレース \{#traces\}

トレースクエリタイプは、トレースを簡単に検索および表示できるクエリビルダーを提供します。
これは OpenTelemetry データ向けに設計されていますが、カラムを選択することで、別のスキーマからのトレースを表示することもできます。
データソースの [trace configuration](./config.md#traces) でデフォルトを設定することで、デフォルトのデータベース／テーブルおよびカラムをあらかじめ読み込んだ状態でクエリビルダーを開くことができます。デフォルトが設定されている場合、カラム選択はデフォルトで折りたたまれます。
OpenTelemetry を有効にして、スキーマバージョンに応じてカラムを自動選択することもできます。

デフォルトのフィルターは、トップレベルの span のみを表示することを意図して追加されています。
Time カラムおよび Duration Time カラムに対する Order By 句も含まれます。
これらのフィルターはそれぞれのフィールドに紐付いており、カラムが変更されると更新されます。
**Service Name** フィルターはデフォルトでは SQL から除外されており、`IS ANYTHING` オプションから変更すると有効になります。

トレースクエリタイプは [data links](#data-links) をサポートしています。

| フィールド | 説明 |
|----|----|
| Trace Mode | クエリを Trace Search から Trace ID ルックアップに切り替えます。 |
| Use OTel | OpenTelemetry カラムを有効にします。選択されているカラムを上書きし、選択された OTel スキーマバージョンで定義されたカラムを使用します（カラム選択を無効化します）。 |
| Trace ID Column | トレースの ID。 |
| Span ID Column | Span ID。 |
| Parent Span ID Column | 親 span の ID。トップレベルトレースでは通常空です。 |
| Service Name Column | サービス名。 |
| Operation Name Column | オペレーション名。 |
| Start Time Column | トレース span の主要な時間カラム。span が開始した時刻。 |
| Duration Time Column | span の継続時間。デフォルトでは Grafana はこれがミリ秒単位の浮動小数点数であることを想定しています。`Duration Unit` ドロップダウンを介して自動的に変換が適用されます。 |
| Duration Unit | 継続時間に使用される時間の単位。デフォルトはナノ秒です。選択された単位は、Grafana が要求するミリ秒単位の浮動小数点数に変換されます。 |
| Tags Column | Span Tags。特定の Map カラム型を想定しているため、OTel ベースのスキーマを使用していない場合は除外してください。 |
| Service Tags Column | Service Tags。特定の Map カラム型を想定しているため、OTel ベースのスキーマを使用していない場合は除外してください。 |
| Order By | [ORDER BY](/sql-reference/statements/select/order-by.md) 式のリスト。 |
| Limit | クエリ末尾に [LIMIT](/sql-reference/statements/select/limit.md) 文を追加します。`0` に設定すると除外されますが、大規模なトレースデータセットでは推奨されません。 |
| Filters | `WHERE` 句に適用されるフィルターのリスト。 |
| Trace ID | フィルタリングに使用する Trace ID。Trace ID モードおよび Trace ID [data link](#data-links) を開く場合にのみ使用されます。 |

<Image size="md" img={demo_trace_query} alt="OTel トレースクエリの例" border />

このクエリタイプは、Trace Search モードではテーブルビューでデータを表示し、Trace ID モードではトレースパネルで表示します。

## SQL エディタ \{#sql-editor\}

クエリビルダーでは対応できないほど複雑なクエリには、SQL エディタを使用できます。
これにより、生の ClickHouse SQL を記述して実行できるため、クエリを完全に制御できます。

SQL エディタは、クエリ エディタ上部で「SQL Editor」を選択すると開きます。

このモードでも [Macro functions](#macros) を使用できます。

クエリタイプを切り替えることで、クエリに最も適した可視化を得ることができます。
この切り替えはダッシュボードビューでも有効であり、特に時系列データで効果があります。

<Image size="md" img={demo_raw_sql_query} alt="生の ClickHouse SQL クエリの例" border />

## データリンク \{#data-links\}

Grafana の [data links](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-data-links)
は、新しいクエリにリンクするために使用できます。
この機能は ClickHouse プラグインで有効になっており、トレースからログ、ログからトレースへの相互リンクに利用できます。これは、ログとトレースの双方について [データソースの設定](./config.md#opentelemetry) で OpenTelemetry が構成されている場合に最も効果的に機能します。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
  テーブル内でのトレースリンクの例
  <Image size="sm" img={trace_id_in_table} alt="テーブル内のトレースリンク" border />
</div>

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  ログ内でのトレースリンクの例
  <Image size="md" img={trace_id_in_logs} alt="ログ内のトレースリンク" border />
</div>

### データリンクを作成する方法 \{#how-to-make-a-data-link\}

クエリ内で `traceID` という名前のカラムを選択することで、データリンクを作成できます。この名前は大文字・小文字を区別せず、"ID" の前にアンダースコアを付けることもできます。たとえば、`traceId`、`TraceId`、`TRACE_ID`、`tracE_iD` はすべて有効です。

[log](#logs) クエリまたは [trace](#traces) クエリで OpenTelemetry が有効になっている場合、trace ID カラムが自動的に追加されます。

trace ID カラムを含めることで、"**View Trace**" および "**View Logs**" のリンクがデータに関連付けられます。

### リンク機能 \{#linking-abilities\}

データリンクが設定されていれば、付与されたトレース ID を使用してトレースとログを開くことができます。

「**View Trace**」をクリックするとトレースを表示する分割パネルが開き、「**View Logs**」をクリックすると、そのトレース ID でフィルタされたログクエリが開きます。
リンクを Explore ビューではなくダッシュボードからクリックした場合、そのリンクは Explore ビューの新しいタブで開かれます。

クエリタイプをまたいで遷移する場合（ログからトレース、またはトレースからログ）、[logs](./config.md#logs) と [traces](./config.md#traces) の両方でデフォルト設定を構成しておく必要があります。同一のクエリタイプへのリンクを開く場合には、クエリをそのままコピーできるため、デフォルト設定は不要です。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  ログクエリ（左ペイン）からトレース（右ペイン）を表示する例
  <Image size="md" img={demo_data_links} alt="データリンクの例" border />
</div>

## マクロ \{#macros\}

マクロは、クエリに動的な SQL を追加するための簡単な仕組みです。
クエリが ClickHouse サーバーに送信される前に、プラグインがマクロを展開して完全な式に置き換えます。

SQL Editor と Query Builder のどちらから送信されたクエリでもマクロを使用できます。

### マクロの使用 \{#using-macros\}

マクロはクエリ内の任意の場所で、必要に応じて複数回使用できます。

`$__timeFilter` マクロを使用する例を以下に示します。

入力例:

```sql
SELECT log_time, log_message
FROM logs
WHERE $__timeFilter(log_time)
```

最終的なクエリ結果：

```sql
SELECT log_time, log_message
FROM logs
WHERE log_time >= toDateTime(1415792726) AND log_time <= toDateTime(1447328726)
```

この例では、Grafana ダッシュボードの時間範囲が `log_time` カラムに適用されます。

このプラグインは、中かっこ `{}` を使用する記法にも対応しています。[パラメータ](/sql-reference/syntax.md#defining-and-using-query-parameters) 内でクエリが必要な場合は、この記法を使用してください。


### List of macros \{#list-of-macros\}

これは、プラグインで利用可能なすべてのマクロの一覧です。

| Macro                                        | Description                                                                                                                                                                         | Output example                                                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `$__dateFilter(columnName)`                  | Grafana パネルのタイムレンジを [Date](/sql-reference/data-types/date.md) として使用し、指定されたカラムに対する時間範囲フィルタに置き換えられます。                                 | `columnName >= toDate('2022-10-21') AND columnName <= toDate('2022-10-23')`                                       |
| `$__timeFilter(columnName)`                  | Grafana パネルのタイムレンジを [DateTime](/sql-reference/data-types/datetime.md) として使用し、指定されたカラムに対する時間範囲フィルタに置き換えられます。                         | `columnName >= toDateTime(1415792726) AND time <= toDateTime(1447328726)`                                         |
| `$__timeFilter_ms(columnName)`               | Grafana パネルのタイムレンジを [DateTime64](/sql-reference/data-types/datetime64.md) として使用し、指定されたカラムに対する時間範囲フィルタに置き換えられます。                     | `columnName >= fromUnixTimestamp64Milli(1415792726123) AND columnName <= fromUnixTimestamp64Milli(1447328726456)` |
| `$__dateTimeFilter(dateColumn, timeColumn)`  | 個別の Date カラムと DateTime カラムを使用して、`$__dateFilter()` と `$__timeFilter()` を組み合わせる短縮形です。エイリアスは `$__dt()` です。                                                                               | `$__dateFilter(dateColumn) AND $__timeFilter(timeColumn)`                                             |
| `$__fromTime`                                | Grafana パネルの時間範囲の開始時刻を [DateTime](/sql-reference/data-types/datetime.md) にキャストした値に置き換えられます。                                                     | `toDateTime(1415792726)`                                                                                          |
| `$__fromTime_ms`                             | Grafana パネルの時間範囲の開始時刻を [DateTime64](/sql-reference/data-types/datetime64.md) にキャストした値に置き換えられます。                                                         | `fromUnixTimestamp64Milli(1415792726123)`                                                                         |
| `$__toTime`                                  | Grafana パネルの時間範囲の終了時刻を [DateTime](/sql-reference/data-types/datetime.md) にキャストした値に置き換えられます。                                                       | `toDateTime(1447328726)`                                                                                          |
| `$__toTime_ms`                               | Grafana パネルの時間範囲の終了時刻を [DateTime64](/sql-reference/data-types/datetime64.md) にキャストした値に置き換えられます。                                                           | `fromUnixTimestamp64Milli(1447328726456)`                                                                         |
| `$__timeInterval(columnName)`                | ウィンドウサイズ（秒）に基づいて間隔を計算する関数に置き換えられます。                                                                                                    | `toStartOfInterval(toDateTime(columnName), INTERVAL 20 second)`                                                   |
| `$__timeInterval_ms(columnName)`             | ウィンドウサイズ（ミリ秒）に基づいて間隔を計算する関数に置き換えられます。                                                                                               | `toStartOfInterval(toDateTime64(columnName, 3), INTERVAL 20 millisecond)`                                         |
| `$__interval_s`                              | ダッシュボードのインターバル（秒）に置き換えられます。                                                                                                                                      | `20`                                                                                                              |
| `$__conditionalAll(condition, $templateVar)` | 2 つ目のパラメータの template 変数がすべての値を選択していない場合は 1 つ目のパラメータに、template 変数がすべての値を選択している場合は `1=1` に置き換えられます。 | `condition` または `1=1`                                                                                          |