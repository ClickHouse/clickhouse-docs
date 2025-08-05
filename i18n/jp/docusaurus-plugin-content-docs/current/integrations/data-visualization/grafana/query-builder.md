---
sidebar_label: 'クエリビルダー'
sidebar_position: 2
slug: '/integrations/grafana/query-builder'
description: 'ClickHouse Grafanaプラグイン内のクエリビルダーの使用方法'
title: 'クエリビルダー'
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

任意のクエリは ClickHouse プラグインを使用して実行できます。
クエリビルダーは簡単なクエリに便利なオプションですが、複雑なクエリの場合は [SQL エディタ](#sql-editor) を使用する必要があります。

クエリビルダー内のすべてのクエリには [クエリタイプ](#query-types) があり、少なくとも1つのカラムを選択する必要があります。

利用可能なクエリタイプは次のとおりです：
- [テーブル](#table)：データをテーブル形式で表示するための最もシンプルなクエリタイプ。集計関数を含む単純および複雑なクエリのどちらにも機能します。
- [ログ](#logs)：ログクエリの構築に最適化されています。[defaults configured](./config.md#logs) が設定された探索ビューで最適に機能します。
- [時系列](#time-series)：時系列クエリを構築するために最適です。専用の時間カラムを選択し、集計関数を追加することができます。
- [トレース](#traces)：トレースの検索/表示に最適化されています。[defaults configured](./config.md#traces) が設定された探索ビューで最適に機能します。
- [SQL エディタ](#sql-editor)：完全にクエリを制御したい場合に SQL エディタを使用できます。このモードでは、任意の SQL クエリを実行できます。

## クエリタイプ {#query-types}

*クエリタイプ*設定は、ビルドされるクエリのタイプに合わせてクエリビルダーのレイアウトを変更します。
クエリタイプは、データを視覚化する際に使用されるパネルも決定します。

### テーブル {#table}

最も柔軟なクエリタイプはテーブルクエリです。これは、単純および集計クエリを処理するために設計された他のクエリビルダーのすべてをキャッチオールするものです。

| フィールド | 説明 |
|----|----|
| ビルダーモード | 単純なクエリは Aggregates および Group By を除外し、集計クエリはこれらのオプションを含みます。 |
| カラム | 選択されたカラム。生の SQL をこのフィールドに入力して関数やカラムのエイリアスを指定できます。 |
| 集計 | [集計関数](/sql-reference/aggregate-functions/index.md)のリスト。関数およびカラムのカスタム値を許可します。Aggregate モードのみに表示されます。 |
| Group By | 一連の [GROUP BY](/sql-reference/statements/select/group-by.md) 表現。Aggregate モードのみに表示されます。 |
| Order By | 一連の [ORDER BY](/sql-reference/statements/select/order-by.md) 表現。 |
| Limit | クエリの末尾に [LIMIT](/sql-reference/statements/select/limit.md) ステートメントを追加します。 `0` に設定すると除外されます。一部の視覚化では、この値を `0` に設定する必要があり、すべてのデータを表示できる必要があります。 |
| フィルタ | `WHERE` 句に適用されるフィルタのリスト。 |

<Image size="md" img={demo_table_query} alt="例の集計テーブルクエリ" border />

このクエリタイプはデータをテーブルとして表示します。

### ログ {#logs}

ログクエリタイプはログデータをクエリするために特化したクエリビルダーを提供します。
データソースの [ログ設定](./config.md#logs) でデフォルトを設定することで、クエリビルダーがデフォルトのデータベース/テーブルおよびカラムで事前にロードされるようにできます。
OpenTelemetry を有効にすることで、スキーマバージョンに応じたカラムを自動的に選択することも可能です。

**時間** と **レベル** のフィルタがデフォルトで追加され、時間カラムに対する Order By も含まれます。
これらのフィルタはそれぞれのフィールドに関連付けられており、カラムが変更されると更新されます。
**Level** フィルタはデフォルトで SQL から除外されており、`IS ANYTHING` オプションから変更することで有効にできます。

ログクエリタイプは [データリンク](#data-links) をサポートしています。

| フィールド | 説明 |
|----|----|
| OTel を使用 | OpenTelemetry カラムを有効にします。選択されたカラムは、選択された OTel スキーマバージョンによって定義されたカラムを使用するために上書きされます（カラム選択は無効になります）。 |
| カラム | ログ行に追加する追加カラム。生の SQL をこのフィールドに入力して関数やカラムのエイリアスを指定できます。 |
| 時間 | ログの主要なタイムスタンプカラム。時間のような型を表示しますが、カスタム値/関数を許可します。 |
| ログレベル | オプション。ログの*レベル*または*重大度*。値は一般的に `INFO`、`error`、`Debug` などの形式です。 |
| メッセージ | ログメッセージの内容。 |
| Order By | 一連の [ORDER BY](/sql-reference/statements/select/order-by.md) 表現。 |
| Limit | クエリの末尾に [LIMIT](/sql-reference/statements/select/limit.md) ステートメントを追加します。 `0` に設定すると除外されますが、大規模なログデータセットには推奨されません。 |
| フィルタ | `WHERE` 句に適用されるフィルタのリスト。 |
| メッセージフィルタ | `LIKE %value%` を使用してログを便利にフィルタリングするためのテキスト入力。入力が空の場合は除外されます。 |

<Image size="md" img={demo_logs_query} alt="例の OTel ログクエリ" border />

<br/>
このクエリタイプは、データをログパネルに表示し、その上にログのヒストグラムパネルを表示します。

クエリで選択された追加カラムは、展開されたログ行で表示できます：
<Image size="md" img={demo_logs_query_fields} alt="ログクエリの追加フィールドの例" border />

### 時系列 {#time-series}

時系列クエリタイプは、[テーブル](#table) に似ていますが、時系列データに焦点を当てています。

二つのビューは主に同じですが、顕著な違いは次のとおりです：
  - 専用の *時間* フィールド。
  - Aggregate モードでは、時間フィールドに対して自動的に時間間隔マクロが適用され、Group By も適用されます。
  - Aggregate モードでは、「カラム」フィールドが非表示になります。
  - **時間** フィールドに対して時系列フィルタと Order By が自動的に追加されます。

:::important ビジュアライゼーションにデータが欠けていますか？
一部のケースでは、時系列パネルがカットオフされているように表示されます。これは、デフォルトの制限が `1000` に設定されているためです。

データセットが許可する場合は、`LIMIT` 句を `0` に設定して削除してみてください。
:::

| フィールド | 説明 |
|----|----|
| ビルダーモード | 単純なクエリは Aggregates および Group By を除外し、集計クエリはこれらのオプションを含みます。 |
| 時間 | クエリの主要な時間カラム。時間のような型を表示しますが、カスタム値/関数を許可します。 |
| カラム | 選択されたカラム。生の SQL をこのフィールドに入力して関数やカラムのエイリアスを指定できます。単純モードでのみ表示されます。 |
| 集計 | [集計関数](/sql-reference/aggregate-functions/index.md)のリスト。関数およびカラムのカスタム値を許可します。Aggregate モードのみに表示されます。 |
| Group By | 一連の [GROUP BY](/sql-reference/statements/select/group-by.md) 表現。Aggregate モードのみに表示されます。 |
| Order By | 一連の [ORDER BY](/sql-reference/statements/select/order-by.md) 表現。 |
| Limit | クエリの末尾に [LIMIT](/sql-reference/statements/select/limit.md) ステートメントを追加します。 `0` に設定すると除外されます。これは、完全なビジュアライゼーションを表示するためにいくつかの時系列データセットで推奨されます。 |
| フィルタ | `WHERE` 句に適用されるフィルタのリスト。 |

<Image size="md" img={demo_time_series_query} alt="例の時系列クエリ" border />

このクエリタイプは、時系列パネルを使用してデータを表示します。

### トレース {#traces}

トレースクエリタイプは、トレースの検索や表示を簡単に行えるクエリビルダーを提供します。
OpenTelemetry データ用に設計されていますが、異なるスキーマからトレースをレンダリングするためにカラムを選択することもできます。
データソースの [トレース設定](./config.md#traces) でデフォルトを設定することで、クエリビルダーがデフォルトのデータベース/テーブルおよびカラムで事前にロードされるようにできます。デフォルトが設定されている場合、カラム選択はデフォルトで collapsed されます。
OpenTelemetry を有効にすることで、スキーマバージョンに応じたカラムを自動的に選択することも可能です。

デフォルトフィルタが追加されており、最上位のスパンのみを表示することを目的としています。
時間と期間の列に対する Order By も含まれています。
これらのフィルタはそれぞれのフィールドに関連付けられており、カラムが変更されると更新されます。
**サービス名** フィルタはデフォルトで SQL から除外されており、`IS ANYTHING` オプションから変更することで有効にできます。

トレースクエリタイプは [データリンク](#data-links) をサポートしています。

| フィールド | 説明 |
|----|----|
| トレースモード | クエリをトレース検索からトレース ID ルックアップに変更します。 |
| OTel を使用 | OpenTelemetry カラムを有効にします。選択されたカラムは、選択された OTel スキーマバージョンによって定義されたカラムを使用するために上書きされます（カラム選択は無効になります）。 |
| トレース ID カラム | トレースの ID です。 |
| スパン ID カラム | スパン ID。 |
| 親スパン ID カラム | 親スパン ID。上位レベルのトレースの場合は通常空です。 |
| サービス名カラム | サービス名。 |
| 操作名カラム | 操作名。 |
| 開始時間カラム | トレーススパンの主要な時間カラム。スパンが開始されたときの時間。 |
| 期間時間カラム | スパンの期間。デフォルトで Grafana はこれをミリ秒の float として期待します。`Duration Unit` ドロップダウンを介して自動的に変換が適用されます。 |
| 期間単位 | 期間に使用される時間の単位。デフォルトはナノ秒です。選択した単位は、Grafana が必要とするミリ秒の float に変換されます。 |
| タグカラム | スパンタグ。OTel ベースのスキーマを使用しない場合、このフィールドは除外してください。特定のマップカラムタイプを必要とします。 |
| サービスタグカラム | サービスタグ。OTel ベースのスキーマを使用しない場合、このフィールドは除外してください。特定のマップカラムタイプを必要とします。 |
| Order By | 一連の [ORDER BY](/sql-reference/statements/select/order-by.md) 表現。 |
| Limit | クエリの末尾に [LIMIT](/sql-reference/statements/select/limit.md) ステートメントを追加します。 `0` に設定すると除外されますが、大規模なトレースデータセットには推奨されません。 |
| フィルタ | `WHERE` 句に適用されるフィルタのリスト。 |
| トレース ID | フィルタリングするトレース ID。トレース ID モードでのみ使用され、トレース ID [データリンク](#data-links) を開く際に使用されます。 |

<Image size="md" img={demo_trace_query} alt="例の OTel トレースクエリ" border />

このクエリタイプは、トレース検索モードではテーブルビューで、トレース ID モードではトレースパネルでデータを表示します。

## SQL エディタ {#sql-editor}

クエリビルダーでは複雑すぎるクエリには、SQL エディタを使用できます。
これにより、ClickHouse SQL をそのまま記述して実行できるようになり、クエリを完全に制御できます。

SQL エディタは、クエリエディタの上部で「SQL エディタ」を選択することで開くことができます。

このモードでも [マクロ関数](#macros) を使用することができます。

最適なビジュアライゼーションを得るためにクエリタイプの間で切り替えることができます。
この切り替えはダッシュボードビューでも影響を与え、特に時系列データに顕著です。

<Image size="md" img={demo_raw_sql_query} alt="例の生の SQL クエリ" border />

## データリンク {#data-links}

Grafana [データリンク](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-data-links)を使用して新しいクエリへのリンクを作成できます。
この機能は、トレースをログにリンクさせるための ClickHouse プラグイン内で有効になっています。また、その逆も可能です。これは、[data source's config](./config.md#opentelemetry) でログとトレースの両方に OpenTelemetry が設定されている場合に最も効果的に機能します。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
  テーブル内のトレースリンクの例
  <Image size="sm" img={trace_id_in_table} alt="テーブル内のトレースリンク" border />
</div>

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  ログ内のトレースリンクの例
  <Image size="md" img={trace_id_in_logs} alt="ログ内のトレースリンク" border />
</div>

### データリンクの作成方法 {#how-to-make-a-data-link}

クエリ内で `traceID` というカラムを選択することでデータリンクを作成できます。この名前は大文字小文字を区別せず、"ID" の前にアンダースコアを追加することもサポートしています。例えば：`traceId`、`TraceId`、`TRACE_ID`、`tracE_iD` はすべて有効です。

[ログ](#logs) または [トレース](#traces) クエリで OpenTelemetry が有効になっている場合、トレース ID カラムは自動的に追加されます。

トレース ID カラムを含めることで、データに "**View Trace**" および "**View Logs**" リンクが付けられます。

### リンク機能 {#linking-abilities}

データリンクがあることで、提供されたトレース ID を使用してトレースやログを開くことができます。

"**View Trace**"はトレースを含むスプリットパネルを開き、"**View Logs**"はトレース ID でフィルタリングされたログクエリを開きます。
ダッシュボードからクリックされたリンクは、探索ビューの新しいタブで開かれます。

[ログ](./config.md#logs) と [トレース](./config.md#traces) の両方にデフォルトを設定することが、クエリタイプを横断する場合（ログからトレース、トレースからログ）に必要です。同じクエリタイプのリンクを開く場合は、クエリを単にコピーすればよいため、デフォルトは必要ありません。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  ログクエリ (左パネル) からトレース (右パネル) を表示する例
  <Image size="md" img={demo_data_links} alt="データリンクの例" border />
</div>


## マクロ {#macros}

マクロはクエリに動的 SQL を追加する簡単な方法です。
クエリが ClickHouse サーバーに送信される前に、プラグインはマクロを展開し、完全な式で置き換えます。

SQL エディタとクエリビルダーの両方からのクエリにマクロを使用できます。

### マクロの使用 {#using-macros}

マクロはクエリ内の任意の場所に含めることができ、必要に応じて複数回使用できます。

以下は `$__timeFilter` マクロの使用例です：

入力：
```sql
SELECT log_time, log_message
FROM logs
WHERE $__timeFilter(log_time)
```

最終的なクエリ出力：
```sql
SELECT log_time, log_message
FROM logs
WHERE log_time >= toDateTime(1415792726) AND log_time <= toDateTime(1447328726)
```

この例では、Grafana ダッシュボードの時間範囲が `log_time` カラムに適用されます。

プラグインは、ブレース `{}` を使用した表記法もサポートしています。この表記法は、[パラメーター](/sql-reference/syntax.md#defining-and-using-query-parameters)内で必要なクエリに使用します。

### マクロの一覧 {#list-of-macros}

これはプラグインで利用可能なすべてのマクロのリストです：

| マクロ                                        | 説明                                                                                                                                                                         | 出力例                                                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `$__dateFilter(columnName)`                  | 提供されたカラムに対して時間範囲フィルタに置き換えられ、Grafana パネルの時間範囲を [Date](/sql-reference/data-types/date.md) として使用します。                                 | `columnName >= toDate('2022-10-21') AND columnName <= toDate('2022-10-23')`                                       |
| `$__timeFilter(columnName)`                  | 提供されたカラムに対して時間範囲フィルタに置き換えられ、Grafana パネルの時間範囲を [DateTime](/sql-reference/data-types/datetime.md) として使用します。                         | `columnName >= toDateTime(1415792726) AND time <= toDateTime(1447328726)`                                         |
| `$__timeFilter_ms(columnName)`               | 提供されたカラムに対して時間範囲フィルタに置き換えられ、Grafana パネルの時間範囲を [DateTime64](/sql-reference/data-types/datetime64.md) として使用します。                     | `columnName >= fromUnixTimestamp64Milli(1415792726123) AND columnName <= fromUnixTimestamp64Milli(1447328726456)` |
| `$__dateTimeFilter(dateColumn, timeColumn)`  | `$__dateFilter()` と `$__timeFilter()` を組み合わせて、別々の Date と DateTime カラムを使用するための簡略記法。エイリアス `$__dt()`                                                                               | `$__dateFilter(dateColumn) AND $__timeFilter(timeColumn)`                                             |
| `$__fromTime`                                | Grafana パネル範囲の開始時間を [DateTime](/sql-reference/data-types/datetime.md) にキャストして置き換えられます。                                                     | `toDateTime(1415792726)`                                                                                          |
| `$__fromTime_ms`                             | パネル範囲の開始時間を [DateTime64](/sql-reference/data-types/datetime64.md) にキャストして置き換えられます。                                                         | `fromUnixTimestamp64Milli(1415792726123)`                                                                         |
| `$__toTime`                                  | Grafana パネル範囲の終了時間を [DateTime](/sql-reference/data-types/datetime.md) にキャストして置き換えられます。                                                       | `toDateTime(1447328726)`                                                                                          |
| `$__toTime_ms`                               | パネル範囲の終了時間を [DateTime64](/sql-reference/data-types/datetime64.md) にキャストして置き換えられます。                                                           | `fromUnixTimestamp64Milli(1447328726456)`                                                                         |
| `$__timeInterval(columnName)`                | ウィンドウサイズに基づいて秒単位で間隔を計算する関数に置き換えられます。                                                                                                    | `toStartOfInterval(toDateTime(columnName), INTERVAL 20 second)`                                                   |
| `$__timeInterval_ms(columnName)`             | ウィンドウサイズに基づいてミリ秒単位で間隔を計算する関数に置き換えられます。                                                                                               | `toStartOfInterval(toDateTime64(columnName, 3), INTERVAL 20 millisecond)`                                         |
| `$__interval_s`                              | ダッシュボード間隔を秒単位で置き換えます。                                                                                                                                      | `20`                                                                                                              |
| `$__conditionalAll(condition, $templateVar)` | テンプレート変数がすべての値を選択しない場合は最初のパラメーターに置き換えられます。テンプレート変数がすべての値を選択した場合は `1=1` に置き換えられます。 | `condition` または `1=1`                                                                                              |
