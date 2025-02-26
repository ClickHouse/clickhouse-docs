---
sidebar_label: クエリビルダー
sidebar_position: 2
slug: /integrations/grafana/query-builder
description: ClickHouse Grafanaプラグインにおけるクエリビルダーの使用
---

# クエリビルダー

ClickHouseプラグインを使用して、任意のクエリを実行できます。
クエリビルダーはシンプルなクエリに便利なオプションですが、複雑なクエリには[SQLエディタ](#sql-editor)を使用する必要があります。

クエリビルダー内のすべてのクエリは[クエリタイプ](#query-types)を持ち、少なくとも1つのカラムを選択する必要があります。

利用可能なクエリタイプは以下の通りです：
- [テーブル](#table): データをテーブル形式で表示するための最もシンプルなクエリタイプ。集約関数を含む単純および複雑なクエリのキャッチオールとしてうまく機能します。
- [ログ](#logs): ログ用クエリを構築するために最適化されています。[デフォルトが設定された](./config.md#logs)探査ビューで最も効果的です。
- [時系列](#time-series): 時系列クエリの構築に最適です。専用の時間カラムを選択し、集約関数を追加できます。
- [トレース](#traces): トレースの検索/表示に最適化されています。[デフォルトが設定された](./config.md#traces)探査ビューで最も効果的です。
- [SQLエディタ](#sql-editor): クエリに対して完全な制御を希望する場合はSQLエディタを使用できます。このモードでは、任意のSQLクエリを実行できます。

## クエリタイプ {#query-types}

*クエリタイプ*設定は、構築されるクエリのタイプに合わせてクエリビルダーのレイアウトを変更します。
クエリタイプは、データの視覚化に使用されるパネルも決定します。

### テーブル {#table}

最も柔軟なクエリタイプはテーブルクエリです。これは、単純なクエリと集約クエリを処理するために設計された他のクエリビルダーのキャッチオールです。

| フィールド | 説明 |
|----|----|
| ビルダーモード  | 単純なクエリは集約とグループ化を除外し、集約クエリはこれらのオプションを含みます。  |
| カラム | 選択されたカラム。ここに生のSQLを入力することで関数やカラムのエイリアスを使用できます。 |
| 集約 | [集約関数](/sql-reference/aggregate-functions/index.md)のリスト。関数とカラムのカスタム値を許可します。集約モードでのみ表示されます。 |
| グループ化 | [GROUP BY](/sql-reference/statements/select/group-by.md)式のリスト。集約モードでのみ表示されます。 |
| 順序付け | [ORDER BY](/sql-reference/statements/select/order-by.md)式のリスト。 |
| 制限 | クエリの末尾に[LIMIT](/sql-reference/statements/select/limit.md)文を追加します。  `0`に設定すると、除外されます。一部の視覚化では、すべてのデータを表示するためにこれを`0`に設定する必要がある場合があります。 |
| フィルタ | `WHERE`句に適用されるフィルタのリスト。 |

<img src={require('./images/demo_table_query.png').default} class="image" alt="集約テーブルクエリの例" />

このクエリタイプはデータをテーブルとしてレンダリングします。

### ログ {#logs}

ログクエリタイプは、ログデータのクエリに特化したクエリビルダーを提供します。
データソースの[ログ設定](./config.md#logs)でデフォルトを設定することで、クエリビルダーをデフォルトのデータベース/テーブルおよびカラムで事前に読み込むことができます。
OpenTelemetryも有効にすると、スキーマバージョンに応じてカラムが自動的に選択されます。

**時間**および**レベル**フィルタはデフォルトで追加され、時間カラムのための順序付けも含まれています。
これらのフィルタは、それぞれのフィールドに結びついており、カラムが変更されると更新されます。
**レベル**フィルタはデフォルトでSQLから除外されており、`IS ANYTHING`オプションから変更すると有効になります。

ログクエリタイプは[data links](#data-links)をサポートしています。

| フィールド | 説明 |
|----|----|
| OTelを使用 | OpenTelemetryカラムを有効にします。選択されたカラムは、選択されたOTelスキーマバージョンで定義されたカラムを使用するように上書きされます（カラム選択が無効になります）。 |
| カラム | ログ行に追加される追加カラム。ここに生のSQLを入力することで関数やカラムのエイリアスを使用できます。 |
| 時間 | ログの主要なタイムスタンプカラム。時間のような型を表示しますが、カスタム値/関数を許可します。 |
| ログレベル | 任意。ログの*レベル*または*重要度*。値は通常`INFO`、`error`、`Debug`などの形式です。 |
| メッセージ | ログメッセージの内容。 |
| 順序付け | [ORDER BY](/sql-reference/statements/select/order-by.md)式のリスト。 |
| 制限 | クエリの末尾に[LIMIT](/sql-reference/statements/select/limit.md)文を追加します。 `0`に設定すると除外されますが、大規模なログデータセットには推奨されません。 |
| フィルタ | `WHERE`句に適用されるフィルタのリスト。 |
| メッセージフィルタ | `LIKE %value%`を使ってログを簡単にフィルタするためのテキスト入力。入力が空の場合は除外されます。 |

<img src={require('./images/demo_logs_query.png').default} class="image" alt="OTelログクエリの例" />

<br/>
このクエリタイプは、データをログパネルにレンダリングし、上部にログヒストグラムパネルを表示します。

クエリで選択された追加カラムは、展開されたログ行で表示できます：
<img src={require('./images/demo_logs_query_fields.png').default} class="image" alt="ログクエリの追加フィールドの例" />


### 時系列 {#time-series}

時系列クエリタイプは、[テーブル](#table)に似ていますが、時系列データに焦点を当てています。

この2つのビューはほとんど同じですが、以下の違いがあります：
  - 専用の*時間*フィールド。
  - 集約モードでは、時間フィールドのグループ化と共に自動的に時間間隔マクロが適用されます。
  - 集約モードでは、「カラム」フィールドは非表示になります。
  - **時間**フィールドに対して時間範囲フィルタと順序付けが自動的に追加されます。

:::important あなたの視覚化はデータが欠けていますか？
場合によっては、時系列パネルが切り取られているように見えることがあります。デフォルトでは制限が`1000`に設定されているからです。

データセットが許可する場合は、`LIMIT`句を`0`に設定して削除してみてください。
:::

| フィールド | 説明 |
|----|----|
| ビルダーモード  | 単純なクエリは集約とグループ化を除外し、集約クエリはこれらのオプションを含みます。  |
| 時間 | クエリにおける主要な時間カラム。 時間のような型を表示しますが、カスタム値/関数を許可します。 |
| カラム | 選択されたカラム。生のSQLをこのフィールドに入力することで、関数やカラムのエイリアスを使用できます。単純モードでのみ表示されます。 |
| 集約 | [集約関数](/sql-reference/aggregate-functions/index.md)のリスト。関数とカラムのカスタム値を許可します。集約モードでのみ表示されます。 |
| グループ化 | [GROUP BY](/sql-reference/statements/select/group-by.md)式のリスト。集約モードでのみ表示されます。 |
| 順序付け | [ORDER BY](/sql-reference/statements/select/order-by.md)式のリスト。 |
| 制限 | クエリの末尾に[LIMIT](/sql-reference/statements/select/limit.md)文を追加します。`0`に設定すると除外されますが、これを推奨する場合があります。 |
| フィルタ | `WHERE`句に適用されるフィルタのリスト。 |

<img src={require('./images/demo_time_series_query.png').default} class="image" alt="時系列クエリの例" />

このクエリタイプは、時系列パネルでデータをレンダリングします。

### トレース {#traces}

トレースクエリタイプは、トレースを簡単に検索および表示できるクエリビルダーを提供します。
これはOpenTelemetryデータ用に設計されていますが、異なるスキーマからトレースをレンダリングするためにカラムを選択することもできます。
データソースの[トレース設定](./config.md#traces)でデフォルトを設定することで、クエリビルダーをデフォルトのデータベース/テーブルおよびカラムで事前に読み込むことができます。デフォルトが設定されている場合、カラム選択はデフォルトで折りたたまれます。
OpenTelemetryも有効にすると、スキーマバージョンに応じてカラムが自動的に選択されます。

デフォルトフィルタは、トップレベルのスパンのみを表示する意図で追加されます。
時間と持続時間のカラムに対する順序付けも含まれています。
これらのフィルタはそれぞれのフィールドに結びついており、カラムが変更されると更新されます。
**サービス名**フィルタはデフォルトでSQLから除外されており、`IS ANYTHING`オプションから変更すると有効になります。

トレースクエリタイプは[data links](#data-links)をサポートしています。

| フィールド | 説明 |
|----|----|
| トレースモード | クエリをトレース検索からトレースIDのルックアップに変更します。 |
| OTelを使用 | OpenTelemetryカラムを有効にします。選択されたカラムは、選択されたOTelスキーマバージョンで定義されたカラムを使用するように上書きされます（カラム選択が無効になります）。 |
| トレースIDカラム | トレースのID。 |
| スパンIDカラム | スパンID。 |
| 親スパンIDカラム | 親スパンID。これは通常、トップレベルのトレースでは空です。 |
| サービス名カラム | サービス名。 |
| 操作名カラム | 操作名。 |
| 開始時間カラム | トレーススパンの主要な時間カラム。スパンが開始された時刻。 |
| 持続時間カラム | スパンの持続時間。Grafanaは通常、これをミリ秒の浮動小数点数として期待します。`Duration Unit`ドロップダウンを介して自動的に変換が適用されます。 |
| 持続時間単位 | 持続時間に使用される時間の単位。デフォルトはナノ秒です。選択された単位は、Grafanaが要求するミリ秒の浮動小数点数に変換されます。 |
| タグカラム | スパンクラス。OTelベースのスキーマを使用しない場合は除外してください。特定のMapカラム型を期待します。 |
| サービスタグカラム | サービスタグ。OTelベースのスキーマを使用しない場合は除外してください。特定のMapカラム型を期待します。 |
| 順序付け | [ORDER BY](/sql-reference/statements/select/order-by.md)式のリスト。 |
| 制限 | クエリの末尾に[LIMIT](/sql-reference/statements/select/limit.md)文を追加します。`0`に設定すると除外されますが、大規模なトレースデータセットには推奨されません。 |
| フィルタ | `WHERE`句に適用されるフィルタのリスト。 |
| トレースID | フィルタするトレースID。トレースIDモードでのみ使用され、トレースIDの[data link](#data-links)を開くときに使用されます。 |

<img src={require('./images/demo_trace_query.png').default} class="image" alt="OTelトレースクエリの例" />

このクエリタイプは、トレース検索モードのテーブルビューでデータをレンダリングし、トレースIDモードのトレースパネルでデータを表示します。

## SQLエディタ {#sql-editor}

クエリビルダーでは複雑すぎるクエリには、SQLエディタを使用できます。
これにより、単純なClickHouse SQLを書いて実行することで、クエリを完全に制御できます。

SQLエディタは、クエリエディタの上部で「SQLエディタ」を選択することで開くことができます。

このモードでも[マクロ関数](#macros)を使用できます。

クエリタイプを切り替えて、クエリに最適な視覚化を得ることができます。
この切り替えは、ダッシュボードビューでも影響があります。特に時系列データで顕著です。

<img src={require('./images/demo_raw_sql_query.png').default} class="image" alt="生のSQLクエリの例" />

## データリンク {#data-links}

Grafanaの[data links](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-data-links)を使用して、新しいクエリにリンクできます。
この機能は、ClickHouseプラグイン内でトレースをログにリンクしたり、その逆を行うために有効になっています。[データソースの設定](./config.md#opentelemetry)で両方のログとトレースのOpenTelemetryを設定することで、最適に機能します。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
  テーブル内のトレースリンクの例
  <img src={require('./images/trace_id_in_table.png').default} class="image" alt="テーブル内のトレースリンク" />
</div>

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  ログ内のトレースリンクの例
  <img src={require('./images/trace_id_in_logs.png').default} class="image" alt="ログ内のトレースリンク" />
</div>

### データリンクの作成方法 {#how-to-make-a-data-link}

クエリ内で`traceID`という名前のカラムを選択することでデータリンクを作成できます。この名前は大文字小文字を区別せず、"ID"の前にアンダースコアを追加することもサポートしています。例： `traceId`、`TraceId`、`TRACE_ID`、および `tracE_iD` はすべて有効です。

[ログ](#logs)または[トレース](#traces)クエリでOpenTelemetryが有効な場合、トレースIDカラムが自動的に含まれます。

トレースIDカラムを含めることで、「**トレースを表示**」および「**ログを表示**」のリンクがデータに付加されます。

### リンク機能 {#linking-abilities}

データリンクが存在する場合、提供されたトレースIDを使用してトレースやログを開くことができます。

「**トレースを表示**」をクリックするとトレースが表示される分割パネルが開き、「**ログを表示**」をクリックするとトレースIDによってフィルタされたログクエリが開きます。
ダッシュボードから探査ビューにリンクがクリックされると、そのリンクは新しいタブで探査ビューに開かれます。

[ログ](./config.md#logs)と[トレース](./config.md#traces)の両方にデフォルトが設定されている必要があります（ログからトレースへおよびトレースからログへの場合）。同じクエリタイプのリンクを開く場合は、クエリを単にコピーできるため、デフォルトは必須ではありません。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  ログクエリ（左パネル）からトレースを表示（右パネル）する例
  <img src={require('./images/demo_data_links.png').default} class="image" alt="データリンクのリンクの例" />
</div>


## マクロ {#macros}

マクロは、クエリに動的なSQLを追加する簡単な方法です。
クエリがClickHouseサーバーに送信される前に、プラグインはマクロを展開し、完全な式に置き換えます。

SQLエディタおよびクエリビルダーからのクエリでもマクロを使用できます。


### マクロの使用 {#using-macros}

マクロは、クエリ内の任意の場所に含めることができ、必要に応じて複数回使用できます。

以下は `$__timeFilter` マクロを使用した例です：

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

この例では、Grafanaダッシュボードの時間範囲が`log_time`カラムに適用されています。

プラグインは、中括弧 `{}` を使用した表記もサポートしています。この表記は、[パラメータ](/sql-reference/syntax.md#defining-and-using-query-parameters)内でクエリが必要な場合に使用してください。

### マクロの一覧 {#list-of-macros}

以下は、プラグインで利用可能なすべてのマクロの一覧です：

| マクロ                                        | 説明                                                                                                                                                                         | 出力例                                                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `$__dateFilter(columnName)`                  | 指定されたカラムに対して、Grafanaパネルの時間範囲を使用して時間範囲フィルタに置き換えます。[Date](/sql-reference/data-types/date.md)として。                                 | `columnName >= toDate('2022-10-21') AND columnName <= toDate('2022-10-23')`                                       |
| `$__timeFilter(columnName)`                  | 指定されたカラムに対して、Grafanaパネルの時間範囲を使用して時間範囲フィルタに置き換えます。[DateTime](/sql-reference/data-types/datetime.md)として。                         | `columnName >= toDateTime(1415792726) AND time <= toDateTime(1447328726)`                                         |
| `$__timeFilter_ms(columnName)`               | 指定されたカラムに対して、Grafanaパネルの時間範囲を使用して時間範囲フィルタに置き換えます。[DateTime64](/sql-reference/data-types/datetime64.md)として。                     | `columnName >= fromUnixTimestamp64Milli(1415792726123) AND columnName <= fromUnixTimestamp64Milli(1447328726456)` |
| `$__dateTimeFilter(dateColumn, timeColumn)`  | `$__dateFilter()` と `$__timeFilter()` を組み合わせた略記法で、別々のDateおよびDateTimeカラムを使用します。エイリアスは `$__dt()` です。                                                                               | `$__dateFilter(dateColumn) AND $__timeFilter(timeColumn)`                                             |
| `$__fromTime`                                | Grafanaパネル範囲の開始時間を[DateTime](/sql-reference/data-types/datetime.md)としてキャストして置き換えます。                                                     | `toDateTime(1415792726)`                                                                                          |
| `$__fromTime_ms`                             | パネル範囲の開始時間を[DateTime64](/sql-reference/data-types/datetime64.md)としてキャストして置き換えます。                                                         | `fromUnixTimestamp64Milli(1415792726123)`                                                                         |
| `$__toTime`                                  | Grafanaパネル範囲の終了時間を[DateTime](/sql-reference/data-types/datetime.md)としてキャストして置き換えます。                                                       | `toDateTime(1447328726)`                                                                                          |
| `$__toTime_ms`                               | パネル範囲の終了時間を[DateTime64](/sql-reference/data-types/datetime64.md)としてキャストして置き換えます。                                                           | `fromUnixTimestamp64Milli(1447328726456)`                                                                         |
| `$__timeInterval(columnName)`                | ウィンドウサイズに基づいて秒単位で間隔を計算する関数に置き換えます。                                                                                                    | `toStartOfInterval(toDateTime(columnName), INTERVAL 20 second)`                                                   |
| `$__timeInterval_ms(columnName)`             | ウィンドウサイズに基づいてミリ秒単位で間隔を計算する関数に置き換えます。                                                                                               | `toStartOfInterval(toDateTime64(columnName, 3), INTERVAL 20 millisecond)`                                         |
| `$__interval_s`                              | ダッシュボード間隔を秒単位で置き換えます。                                                                                                                                      | `20`                                                                                                              |
| `$__conditionalAll(condition, $templateVar)` | テンプレート変数がすべての値を選択しない場合は最初のパラメータに置き換えます。テンプレート変数がすべての値を選択した場合は `1=1` に置き換えられます。 | `condition` または `1=1`                                                                                              |
