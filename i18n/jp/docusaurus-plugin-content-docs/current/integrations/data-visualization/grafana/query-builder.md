---
sidebar_label: 'クエリビルダー'
sidebar_position: 2
slug: /integrations/grafana/query-builder
description: 'ClickHouse Grafanaプラグインでのクエリビルダーの使用'
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

すべてのクエリはClickHouseプラグインを使用して実行できます。
クエリビルダーは、より簡単なクエリに便利なオプションですが、複雑なクエリには[SQLエディター](#sql-editor)を使用する必要があります。

クエリビルダー内のすべてのクエリには[クエリタイプ](#query-types)があり、少なくとも1つのカラムを選択する必要があります。

利用可能なクエリタイプは以下の通りです：
- [テーブル](#table): テーブル形式でデータを表示するための最も簡単なクエリタイプ。単純で複雑なクエリの両方で集約関数を含むためのキャッチオールとして機能します。
- [ログ](#logs): ログ用のクエリを構築するために最適化されています。[デフォルトが設定](./config.md#logs)されている場合、エクスプロアビューで最もよく機能します。
- [時系列](#time-series): 時系列クエリを構築するのに最適です。専用の時間カラムを選択し、集約関数を追加できます。
- [トレース](#traces): トレースの検索/表示のために最適化されています。[デフォルトが設定](./config.md#traces)されている場合、エクスプロアビューで最もよく機能します。
- [SQLエディター](#sql-editor): クエリに完全な制御を希望する場合にSQLエディターを使用できます。このモードでは、任意のSQLクエリを実行できます。

## クエリタイプ {#query-types}

*クエリタイプ*の設定は、作成中のクエリのタイプに合わせてクエリビルダーのレイアウトを変更します。
クエリタイプは、データを視覚化する際に使用されるパネルも決定します。

### テーブル {#table}

最も柔軟なクエリタイプはテーブルクエリです。これは、単純および集約クエリを処理するために設計された他のクエリビルダーのキャッチオールです。

| フィールド | 説明 |
|----|----|
| ビルダーモード  | シンプルなクエリでは集約およびグループ化を除外し、集約クエリではこれらのオプションを含みます。  |
| カラム | 選択されたカラム。関数やカラムエイリアスを許可するために生のSQLをこのフィールドに入力できます。 |
| 集約 | [集約関数](/sql-reference/aggregate-functions/index.md)のリスト。関数とカラムのカスタム値を許可します。集約モードでのみ表示されます。 |
| グループ化 | [GROUP BY](/sql-reference/statements/select/group-by.md)の表現のリスト。集約モードでのみ表示されます。 |
| オーダーバイ | [ORDER BY](/sql-reference/statements/select/order-by.md)の表現のリスト。 |
| リミット | クエリの最後に[LIMIT](/sql-reference/statements/select/limit.md)ステートメントを追加します。`0`に設定すると除外されます。一部の視覚化では、すべてのデータを表示するためにこれを`0`に設定する必要があります。 |
| フィルター | `WHERE`句に適用されるフィルターのリスト。 |

<Image size="md" img={demo_table_query} alt="例の集約テーブルクエリ" border />

このクエリタイプではデータがテーブルとしてレンダリングされます。

### ログ {#logs}

ログクエリタイプは、ログデータをクエリするために特化したクエリビルダーを提供します。
データソースの[ログ設定](./config.md#logs)でデフォルトを設定することで、クエリビルダーをデフォルトのデータベース/テーブルおよびカラムを持つようにプリロードできます。
OpenTelemetryを有効にすることで、スキーマバージョンに従ってカラムを自動選択できます。

**時間**および **レベル** フィルターはデフォルトで追加され、時間カラムのオーダーバイも追加されます。
これらのフィルターはそれぞれのフィールドに紐づいており、カラムが変更されると更新されます。
**レベル**フィルターはデフォルトではSQLから除外されており、`IS ANYTHING`オプションから変更すると有効になります。

ログクエリタイプは[data links](#data-links)をサポートしています。

| フィールド | 説明 |
|----|----|
| OTelを使用 | OpenTelemetryカラムを有効にします。選択されたカラムを選択されたOTelスキーマバージョンによって定義されたカラムに上書きします（カラム選択を無効にします）。 |
| カラム | ログ行に追加する追加のカラム。関数やカラムエイリアスを許可するために生のSQLをこのフィールドに入力できます。 |
| 時間 | ログ用の主要なタイムスタンプカラム。時間っぽいタイプを表示しますが、カスタム値/関数も許可します。 |
| ログレベル | オプション。このログの*レベル*または*重大度*。値は通常`INFO`、`error`、`Debug`などの形式になります。 |
| メッセージ | ログメッセージの内容。 |
| オーダーバイ | [ORDER BY](/sql-reference/statements/select/order-by.md)の表現のリスト。 |
| リミット | クエリの最後に[LIMIT](/sql-reference/statements/select/limit.md)ステートメントを追加します。`0`に設定すると除外されますが、大きなログデータセットには推奨されません。 |
| フィルター | `WHERE`句に適用されるフィルターのリスト。 |
| メッセージフィルター | `LIKE %value%`を使って便利にログをフィルタリングするためのテキスト入力。入力が空の場合は除外されます。 |

<Image size="md" img={demo_logs_query} alt="例のOTelログクエリ" border />

<br/>
このクエリタイプでは、データはログパネルにレンダリングされ、上部にログヒストグラムパネルが表示されます。

クエリで選択された追加のカラムは、展開されたログ行で表示できます：
<Image size="md" img={demo_logs_query_fields} alt="ログクエリの追加フィールドの例" border />

### 時系列 {#time-series}

時系列クエリタイプは[テーブル](#table)に似ていますが、時系列データに重点を置いています。

2つのビューはほぼ同じですが、以下の著しい違いがあります：
  - 専用の*時間*フィールド。
  - 集約モードでは、時間カラムに対して自動的に時間間隔マクロが適用され、グループバイも適用されます。
  - 集約モードでは、「カラム」フィールドが非表示です。
  - **時間**フィールド用の時間範囲フィルターとオーダーバイが自動的に追加されます。

:::important 可視化にデータが欠けていますか？
場合によっては、時系列パネルが切り取られているように見えることがあります。デフォルトのリミットが`1000`になっているためです。

リミット句を`0`に設定することで削除してみてください（データセットが許可する場合）。
:::

| フィールド | 説明 |
|----|----|
| ビルダーモード  | シンプルなクエリでは集約およびグループ化を除外し、集約クエリではこれらのオプションを含みます。  |
| 時間 | クエリの主要な時間カラム。時間っぽいタイプを表示しますが、カスタム値/関数も許可します。 |
| カラム | 選択されたカラム。関数やカラムエイリアスを許可するために生のSQLをこのフィールドに入力できます。シンプルモードでのみ表示されます。 |
| 集約 | [集約関数](/sql-reference/aggregate-functions/index.md)のリスト。関数とカラムのカスタム値を許可します。集約モードでのみ表示されます。 |
| グループ化 | [GROUP BY](/sql-reference/statements/select/group-by.md)の表現のリスト。集約モードでのみ表示されます。 |
| オーダーバイ | [ORDER BY](/sql-reference/statements/select/order-by.md)の表現のリスト。 |
| リミット | クエリの最後に[LIMIT](/sql-reference/statements/select/limit.md)ステートメントを追加します。`0`に設定すると除外されますが、一部の時系列データセットでは完全な視覚化を表示するために推奨されます。 |
| フィルター | `WHERE`句に適用されるフィルターのリスト。 |

<Image size="md" img={demo_time_series_query} alt="例の時系列クエリ" border />

このクエリタイプでは、データが時系列パネルでレンダリングされます。

### トレース {#traces}

トレースクエリタイプは、トレースの検索と表示を簡単に行えるクエリビルダーを提供します。
これはOpenTelemetryデータ用に設計されていますが、異なるスキーマからトレースをレンダリングするためにカラムを選択できます。
データソースの[トレース設定](./config.md#traces)でデフォルトを設定することで、クエリビルダーをデフォルトのデータベース/テーブルおよびカラムを持つようにプリロードできます。デフォルトが設定されている場合、カラム選択はデフォルトで折り畳まれます。
OpenTelemetryを有効にすることで、スキーマバージョンに従ってカラムを自動選択できます。

デフォルトフィルタは、トップレベルのスパンのみを表示する意図で追加されます。
時間と持続時間カラムのオーダーバイも含まれています。
これらのフィルターはそれぞれのフィールドに紐づいており、カラムが変更されると更新されます。
**サービス名**フィルターはデフォルトではSQLから除外されていますが、`IS ANYTHING`オプションから変更すると有効になります。

トレースクエリタイプは[data links](#data-links)をサポートしています。

| フィールド | 説明 |
|----|----|
| トレースモード | クエリをトレース検索からトレースIDルックアップに変更します。 |
| OTelを使用 | OpenTelemetryカラムを有効にします。選択されたカラムを選択されたOTelスキーマバージョンによって定義されたカラムに上書きします（カラム選択を無効にします）。 |
| トレースIDカラム | トレースのID。 |
| スパンIDカラム | スパンID。 |
| 親スパンIDカラム | 親スパンID。これは通常、トップレベルのトレースでは空です。 |
| サービス名カラム | サービス名。 |
| オペレーション名カラム | オペレーション名。 |
| 開始時間カラム | トレーススパンの主要な時間カラム。スパンが開始された時間。 |
| 持続時間カラム | スパンの持続時間。デフォルトでは、Grafanaはこれがミリ秒の浮動小数点数であることを期待します。`Duration Unit`ドロップダウンを使用した自動変換が適用されます。 |
| 持続時間単位 | 持続時間に使用する時間の単位。デフォルトではナノ秒です。選択された単位は、Grafanaが要求する浮動小数点数にミリ秒に変換されます。 |
| タグカラム | スパンタグ。OTelベースのスキーマを使用しない場合はこれを除外します。特定のMapカラム型を期待します。 |
| サービスタグカラム | サービスタグ。OTelベースのスキーマを使用しない場合はこれを除外します。特定のMapカラム型を期待します。 |
| オーダーバイ | [ORDER BY](/sql-reference/statements/select/order-by.md)の表現のリスト。 |
| リミット | クエリの最後に[LIMIT](/sql-reference/statements/select/limit.md)ステートメントを追加します。`0`に設定すると除外されますが、大きなトレースデータセットには推奨されません。 |
| フィルター | `WHERE`句に適用されるフィルターのリスト。 |
| トレースID | フィルタリングに使用するトレースID。トレースIDモードでのみ使用され、トレースID[data link](#data-links)を開くときにのみ使用されます。 |

<Image size="md" img={demo_trace_query} alt="例のOTelトレースクエリ" border />

このクエリタイプでは、トレース検索モードでのテーブルビューと、トレースIDモードでのトレースパネルでデータがレンダリングされます。

## SQLエディター {#sql-editor}

クエリビルダーで複雑すぎるクエリには、SQLエディターを使用できます。
これにより、プレーンなClickHouse SQLを書いて実行することで、クエリに対する完全な制御が可能になります。

SQLエディターは、クエリエディターの上部で「SQLエディター」を選択することで開くことができます。

このモードでも[マクロ関数](#macros)を使用できます。

クエリタイプを切り替えて、クエリに最も適した可視化を取得できます。
この切り替えは、ダッシュボードビューでも影響があり、特に時系列データに注意が必要です。

<Image size="md" img={demo_raw_sql_query} alt="例の生SQLクエリ" border />

## データリンク {#data-links}

Grafanaの[data links](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-data-links)を使用して、新しいクエリにリンクできます。
この機能は、トレースとログの間でリンクするためにClickHouseプラグイン内で有効になっています。ログとトレースの両方にOpenTelemetryが設定されている場合に最もよく機能します。[データソースの設定](./config.md#opentelemetry)で行います。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
  テーブルでのトレースリンクの例
  <Image size="sm" img={trace_id_in_table} alt="テーブル内のトレースリンク" border />
</div>

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  ログ内のトレースリンクの例
  <Image size="md" img={trace_id_in_logs} alt="ログ内のトレースリンク" border />
</div>

### データリンクの作成方法 {#how-to-make-a-data-link}

クエリ内で`traceID`という名前のカラムを選択することでデータリンクを作成できます。この名前は大文字と小文字を区別せず、「ID」の前にアンダースコアを追加することができます。例：`traceId`、`TraceId`、`TRACE_ID`、`tracE_iD`はすべて有効です。

[ログ](#logs)や[トレース](#traces)のクエリでOpenTelemetryが有効になっている場合、トレースIDカラムが自動的に含まれます。

トレースIDカラムを含めることで、データに「**トレースを表示**」および「**ログを表示**」のリンクが付加されます。

### リンク機能 {#linking-abilities}

データリンクが存在する場合、提供されたトレースIDを使用してトレースとログを開くことができます。

「**トレースを表示**」を選択するとトレースが表示され、「**ログを表示**」を選択するとトレースIDでフィルタリングされたログクエリが開きます。
ダッシュボードからではなく、エクスプロアビューからリンクがクリックされた場合、リンクはエクスプロアビューの新しいタブで開かれます。

[ログ](./config.md#logs)と[トレース](./config.md#traces)の両方に対してデフォルトを設定することが、クエリタイプを越えて（ログからトレース、トレースからログ）必須です。同じクエリタイプのリンクを開く場合は、クエリを単純にコピーできるため、デフォルトは必要ありません。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  ログクエリ（左パネル）からのトレース表示（右パネル）の例
  <Image size="md" img={demo_data_links} alt="データリンクのリンクの例" border />
</div>

## マクロ {#macros}

マクロは、クエリに動的なSQLを追加する簡単な方法です。
クエリがClickHouseサーバーに送信される前に、プラグインはマクロを展開し、完全な式で置換します。

SQLエディターおよびクエリビルダーの両方からのクエリでマクロを使用できます。

### マクロの使用方法 {#using-macros}

マクロは、クエリ内の任意の場所に、必要に応じて複数回含めることができます。

以下は、`$__timeFilter`マクロの使用例です：

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

この例では、Grafanaダッシュボードの時間範囲が`log_time`カラムに適用されています。

プラグインでは、波括弧`{}`を使用した表記もサポートしています。この表記は、[パラメータ](/sql-reference/syntax.md#defining-and-using-query-parameters)内でのクエリが必要な場合に使用します。

### マクロのリスト {#list-of-macros}

これは、プラグイン内で利用可能なすべてのマクロのリストです：

| マクロ                                        | 説明                                                                                                                                                                         | 出力例                                                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `$__dateFilter(columnName)`                  | 指定されたカラムに対し、Grafanaパネルの時間範囲を使用した時間範囲フィルターに置き換えます。[Date](/sql-reference/data-types/date.md)として。                                 | `columnName >= toDate('2022-10-21') AND columnName <= toDate('2022-10-23')`                                       |
| `$__timeFilter(columnName)`                  | 指定されたカラムに対し、Grafanaパネルの時間範囲を使用した時間範囲フィルターに置き換えます。[DateTime](/sql-reference/data-types/datetime.md)として。                         | `columnName >= toDateTime(1415792726) AND time <= toDateTime(1447328726)`                                         |
| `$__timeFilter_ms(columnName)`               | 指定されたカラムに対し、Grafanaパネルの時間範囲を使用した時間範囲フィルターに置き換えます。[DateTime64](/sql-reference/data-types/datetime64.md)として。                     | `columnName >= fromUnixTimestamp64Milli(1415792726123) AND columnName <= fromUnixTimestamp64Milli(1447328726456)` |
| `$__dateTimeFilter(dateColumn, timeColumn)` | `$__dateFilter()`と`$__timeFilter()`をそれぞれの日付カラムと日付時間カラムを使用して組み合わせるショートハンド。エイリアス`$__dt()`                                                                               | `$__dateFilter(dateColumn) AND $__timeFilter(timeColumn)`                                             |
| `$__fromTime`                                | Grafanaパネルの範囲の開始時間を[DateTime](/sql-reference/data-types/datetime.md)としてキャストし、置き換えます。                                                     | `toDateTime(1415792726)`                                                                                          |
| `$__fromTime_ms`                             | パネル範囲の開始時間を[DateTime64](/sql-reference/data-types/datetime64.md)としてキャストし、置き換えます。                                                         | `fromUnixTimestamp64Milli(1415792726123)`                                                                         |
| `$__toTime`                                  | Grafanaパネルの範囲の終了時間を[DateTime](/sql-reference/data-types/datetime.md)としてキャストし、置き換えます。                                                       | `toDateTime(1447328726)`                                                                                          |
| `$__toTime_ms`                               | パネル範囲の終了時間を[DateTime64](/sql-reference/data-types/datetime64.md)としてキャストし、置き換えます。                                                           | `fromUnixTimestamp64Milli(1447328726456)`                                                                         |
| `$__timeInterval(columnName)`                | ウィンドウサイズに基づいて秒単位でインターバルを計算する関数で置き換えます。                                                                                                    | `toStartOfInterval(toDateTime(columnName), INTERVAL 20 second)`                                                   |
| `$__timeInterval_ms(columnName)`             | ウィンドウサイズに基づいてミリ秒単位でインターバルを計算する関数で置き換えます。                                                                                               | `toStartOfInterval(toDateTime64(columnName, 3), INTERVAL 20 millisecond)`                                         |
| `$__interval_s`                              | ダッシュボードインターバルを秒単位で置き換えます。                                                                                                                                      | `20`                                                                                                              |
| `$__conditionalAll(condition, $templateVar)` | テンプレート変数が2番目のパラメーターであらゆる値を選択しない場合、最初のパラメーターで置き換えます。テンプレート変数がすべての値を選択した場合、`1=1`に置き換えられます。 | `condition`または`1=1`                                                                                              |
