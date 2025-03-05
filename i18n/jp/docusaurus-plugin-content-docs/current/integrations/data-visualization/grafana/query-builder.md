---
sidebar_label: クエリビルダー
sidebar_position: 2
slug: /integrations/grafana/query-builder
description: ClickHouse Grafana プラグインでのクエリビルダーの使用
---

import demo_table_query from '@site/static/images/integrations/data-visualization/grafana/demo_table_query.png';
import demo_logs_query from '@site/static/images/integrations/data-visualization/grafana/demo_logs_query.png';
import demo_logs_query_fields from '@site/static/images/integrations/data-visualization/grafana/demo_logs_query_fields.png';
import demo_time_series_query from '@site/static/images/integrations/data-visualization/grafana/demo_time_series_query.png';
import demo_trace_query from '@site/static/images/integrations/data-visualization/grafana/demo_trace_query.png';
import demo_raw_sql_query from '@site/static/images/integrations/data-visualization/grafana/demo_raw_sql_query.png';
import trace_id_in_table from '@site/static/images/integrations/data-visualization/grafana/trace_id_in_table.png';
import trace_id_in_logs from '@site/static/images/integrations/data-visualization/grafana/trace_id_in_logs.png';
import demo_data_links from '@site/static/images/integrations/data-visualization/grafana/demo_data_links.png';


# クエリビルダー

すべてのクエリは ClickHouse プラグインで実行できます。
クエリビルダーは、簡単なクエリに便利ですが、複雑なクエリの場合は [SQL エディタ](#sql-editor) を使用する必要があります。

クエリビルダー内のすべてのクエリには [クエリタイプ](#query-types) があり、少なくとも1つのカラムを選択する必要があります。

使用可能なクエリタイプは次のとおりです：
- [テーブル](#table): テーブル形式でデータを表示するための最もシンプルなクエリタイプ。集約関数を含む単純なクエリと複雑なクエリの両方に対応します。
- [ログ](#logs): ログのクエリを構築するために最適化されています。[デフォルトが設定された状態](./config.md#logs)での探索ビューで最も効果的です。
- [時系列](#time-series): 時系列クエリを構築するために最適です。専用の時間カラムを選択し、集約関数を追加できます。
- [トレース](#traces): トレースの検索/表示に最適化されています。[デフォルトが設定された状態](./config.md#traces)での探索ビューで最も効果的です。
- [SQL エディタ](#sql-editor): フルコントロールを持つ必要がある場合は SQL エディタを使用できます。このモードでは、任意の SQL クエリを実行できます。

## クエリタイプ {#query-types}

*クエリタイプ* 設定は、構築中のクエリのタイプに合わせてクエリビルダーのレイアウトを変更します。
クエリタイプは、データを視覚化する際に使用されるパネルも決定します。

### テーブル {#table}

最も柔軟なクエリタイプはテーブルクエリです。これは、単純および集約クエリを処理するために設計された他のクエリビルダーのキャッチオールです。

| フィールド | 説明 |
|----|----|
| ビルダー モード  | 単純なクエリは集約およびグループ化を除外し、集約クエリはこれらのオプションを含みます。  |
| カラム | 選択されたカラム。ここに生の SQL を入力することで、関数およびカラムのエイリアス指定が可能です。 |
| 集約 | [集約関数](/sql-reference/aggregate-functions/index.md) のリスト。関数とカラムにカスタム値を設定できます。集約モードのみ表示されます。 |
| グループ化 | [GROUP BY](/sql-reference/statements/select/group-by.md) の式リスト。集約モードのみ表示されます。 |
| 注文 | [ORDER BY](/sql-reference/statements/select/order-by.md) の式リスト。 |
| 制限 | クエリの最後に [LIMIT](/sql-reference/statements/select/limit.md) ステートメントを追加します。`0` に設定すると除外されます。一部の視覚化では、この値を `0` に設定する必要があります。すべてのデータを表示するために必要です。 |
| フィルター | `WHERE` 句に適用するフィルターのリスト。 |

<img src={demo_table_query} class="image" alt="例の集約テーブルクエリ" />

このクエリタイプはデータをテーブルとしてレンダリングします。

### ログ {#logs}

ログクエリタイプは、ログデータをクエリするために特化したクエリビルダーを提供します。
データソースの [ログ設定](./config.md#logs) でデフォルトを設定することで、クエリビルダーがデフォルトのデータベース/テーブルおよびカラムで事前にロードされるようにできます。
OpenTelemetry を有効にすると、スキーマバージョンに応じてカラムを自動的に選択できます。

デフォルトで **時間** および **レベル** フィルターが追加され、時間カラムのための Order By も含まれています。
これらのフィルターはそれぞれのフィールドに関連付けられており、カラムが変更されると更新されます。
**レベル** フィルターはデフォルトで SQL から除外されており、`IS ANYTHING` オプションを変更すると有効になります。

ログクエリタイプは [データリンク](#data-links) をサポートしています。

| フィールド | 説明 |
|----|----|
| OTel を使用 | OpenTelemetry カラムを有効にします。選択されたカラムが選択された OTel スキーマバージョンによって定義されるカラムに上書きされます（これによりカラム選択が無効になります）。 |
| カラム | ログ行に追加する追加のカラム。ここに生の SQL を入力することで、関数およびカラムのエイリアス指定が可能です。 |
| 時間 | ログの主要なタイムスタンプカラム。時間のようなタイプを表示しますが、カスタム値/関数も許可されます。 |
| ログレベル | オプション。ログの *レベル* または *重要度*。値は通常 `INFO`、`error`、`Debug` などの形式です。 |
| メッセージ | ログメッセージの内容。 |
| 注文 | [ORDER BY](/sql-reference/statements/select/order-by.md) の式リスト。 |
| 制限 | クエリの最後に [LIMIT](/sql-reference/statements/select/limit.md) ステートメントを追加します。`0` に設定すると除外されますが、大きなログデータセットでは推奨されません。 |
| フィルター | `WHERE` 句に適用するフィルターのリスト。 |
| メッセージフィルター | `LIKE %value%` を使用してログを簡単にフィルタリングするためのテキスト入力。入力が空の場合は除外されます。 |

<img src={demo_logs_query} class="image" alt="例の OTel ログクエリ" />

<br/>
このクエリタイプは、データをログパネルに表示し、その上にログのヒストグラムパネルを表示します。

クエリで選択された追加のカラムは、展開されたログ行で確認できます：
<img src={demo_logs_query_fields} class="image" alt="ログクエリの追加フィールドの例" />


### 時系列 {#time-series}

時系列クエリタイプは [テーブル](#table) と似ていますが、時系列データに重点を置いています。

2 つのビューはほぼ同じですが、以下の顕著な違いがあります：
  - 専用の *時間* フィールド。
  - 集約モードでは、時間カラムのために時刻間隔マクロが自動的に適用され、グループ化が行われます。
  - 集約モードでは、「カラム」フィールドが非表示になります。
  - **時間** フィールドに対して自動的に時系列フィルターと Order By が追加されます。

:::重要 データが欠落していますか？
場合によっては、時系列パネルが切り取られて見えることがあります。デフォルトの制限が `1000` であるためです。

データセットが許可される場合は、`LIMIT` 句を `0` に設定して削除してみてください。
:::

| フィールド | 説明 |
|----|----|
| ビルダー モード  | 単純なクエリは集約およびグループ化を除外し、集約クエリはこれらのオプションを含みます。  |
| 時間 | クエリの主要な時間カラム。時間のようなタイプを表示しますが、カスタム値/関数も許可されます。 |
| カラム | 選択されたカラム。ここに生の SQL を入力することで、関数およびカラムのエイリアス指定が可能です。単純モードのみで表示されます。 |
| 集約 | [集約関数](/sql-reference/aggregate-functions/index.md) のリスト。関数とカラムにカスタム値を設定できます。集約モードのみ表示されます。 |
| グループ化 | [GROUP BY](/sql-reference/statements/select/group-by.md) の式リスト。集約モードのみ表示されます。 |
| 注文 | [ORDER BY](/sql-reference/statements/select/order-by.md) の式リスト。 |
| 制限 | クエリの最後に [LIMIT](/sql-reference/statements/select/limit.md) ステートメントを追加します。`0` に設定すると除外されますが、これは時系列データセットのフルビジュアライゼーションを表示するために推奨されます。 |
| フィルター | `WHERE` 句に適用するフィルターのリスト。 |

<img src={demo_time_series_query} class="image" alt="例の時系列クエリ" />

このクエリタイプはデータを時系列パネルでレンダリングします。

### トレース {#traces}

トレースクエリタイプは、トレースを簡単に検索および表示するためのクエリビルダーを提供します。
これは OpenTelemetry データのために設計されていますが、異なるスキーマからトレースをレンダリングするためにカラムを選択できます。
データソースの [トレース設定](./config.md#traces) でデフォルトを設定することで、クエリビルダーがデフォルトのデータベース/テーブルおよびカラムで事前にロードされるようにできます。デフォルトが設定されている場合、カラム選択はデフォルトで折りたたまれます。
OpenTelemetry を有効にすると、スキーマバージョンに応じてカラムを自動的に選択できます。

デフォルトフィルターは、最上位スパンのみを表示することを目的に追加されます。
時間および持続時間カラムについての Order By も含まれています。
これらのフィルターはそれぞれのフィールドに関連付けられており、カラムが変更されると更新されます。
**サービス名** フィルターはデフォルトで SQL から除外されており、`IS ANYTHING` オプションを変更すると有効になります。

トレースクエリタイプは [データリンク](#data-links) をサポートしています。

| フィールド | 説明 |
|----|----|
| トレースモード | クエリをトレース検索からトレース ID ルックアップに変更します。 |
| OTel を使用 | OpenTelemetry カラムを有効にします。選択されたカラムが選択された OTel スキーマバージョンによって定義されるカラムに上書きされます（これによりカラム選択が無効になります）。 |
| トレース ID カラム | トレースの ID。 |
| スパン ID カラム | スパン ID。 |
| 親スパン ID カラム | 親スパン ID。通常、これは最上位のトレースでは空です。 |
| サービス名カラム | サービス名。 |
| 操作名カラム | 操作名。 |
| 開始時間カラム | トレーススパンのための主要な時間カラム。スパンが開始された時刻。 |
| 持続時間カラム | スパンの持続時間。デフォルトでは、Grafana はこれをミリ秒の float として期待します。`Duration Unit` ドロップダウンを介して自動的に変換が適用されます。 |
| 持続時間の単位 | 持続時間に使用される時間の単位。デフォルトではナノ秒です。選択された単位は、Grafana が必要とするミリ秒の float に変換されます。 |
| タグカラム | スパンのタグ。OTel ベースのスキーマを使用しない場合は、特定のマップカラム型を期待するため、これを除外します。 |
| サービスタグカラム | サービスのタグ。OTel ベースのスキーマを使用しない場合は、特定のマップカラム型を期待するため、これを除外します。 |
| 注文 | [ORDER BY](/sql-reference/statements/select/order-by.md) の式リスト。 |
| 制限 | クエリの最後に [LIMIT](/sql-reference/statements/select/limit.md) ステートメントを追加します。`0` に設定すると除外されますが、大きなトレースデータセットでは推奨されません。 |
| フィルター | `WHERE` 句に適用するフィルターのリスト。 |
| トレース ID | フィルターとして使用するトレース ID。トレース ID モードおよびトレース ID [データリンク](#data-links) を開くときにのみ使用されます。 |

<img src={demo_trace_query} class="image" alt="例の OTel トレースクエリ" />

このクエリタイプは、トレース検索モードのためのテーブルビューでデータをレンダリングし、トレース ID モードのためのトレースパネルをレンダリングします。

## SQL エディタ {#sql-editor}

クエリビルダーでは複雑すぎるクエリには、SQL エディタを使用できます。
これにより、プレーンな ClickHouse SQL を書いて実行することで、クエリを完全に制御できます。

SQL エディタは、クエリエディタの上部で「SQL エディタ」を選択することで開くことができます。

[マクロ関数](#macros) は、このモードでも使用できます。

クエリタイプを切り替えて、クエリに最も適した視覚化を取得できます。
この切替は、ダッシュボードビューでも影響があり、特に時系列データに対して顕著です。

<img src={demo_raw_sql_query} class="image" alt="例の生の SQL クエリ" />

## データリンク {#data-links}

Grafana の [データリンク](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-data-links)
を使用して新しいクエリにリンクできます。
この機能は、トレースをログに、またその逆にリンクするために ClickHouse プラグイン内で有効になっています。両方のログとトレースのために OpenTelemetry が設定されている場合、最も効果的に機能します。[データソースの設定](./config.md#opentelemetry) で設定します。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
  テーブル内のトレースリンクの例
  <img src={trace_id_in_table} class="image" alt="テーブル内のトレースリンク" />
</div>

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  ログ内のトレースリンクの例
  <img src={trace_id_in_logs} class="image" alt="ログ内のトレースリンク" />
</div>

### データリンクの作成方法 {#how-to-make-a-data-link}

クエリ内で `traceID` という名前のカラムを選択することでデータリンクを作成できます。この名前は大文字と小文字を区別せず、"ID" の前にアンダースコアを追加できます。たとえば、`traceId`、`TraceId`、`TRACE_ID`、および `tracE_iD` はすべて有効です。

[ログ](#logs) または [トレース](#traces) クエリで OpenTelemetry が有効になっている場合、トレース ID カラムは自動的に追加されます。

トレース ID カラムを含めることで、データに "**トレースを表示**" および "**ログを表示**" リンクが付加されます。

### リンク機能 {#linking-abilities}

データリンクが存在することで、提供されたトレース ID を使用してトレースとログを開くことができます。

"**トレースを表示**" はトレースを含む分割パネルを開き、"**ログを表示**" はトレース ID に基づいてフィルタリングされたログクエリを開きます。
ダッシュボードからではなく、探索ビューからリンクがクリックされた場合、そのリンクは探索ビューの新しいタブで開かれます。

クエリタイプを跨ぐ場合（ログからトレース、トレースからログ）には、[ログ](./config.md#logs) と [トレース](./config.md#traces) の両方のデフォルトが設定されている必要があります。同じクエリタイプのリンクを開く場合は、クエリを単にコピーできるため、デフォルトは必要ありません。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  ログクエリ（左パネル）からトレースを表示する例（右パネル）
  <img src={demo_data_links} class="image" alt="データリンクのリンクの例" />
</div>


## マクロ {#macros}

マクロは、クエリに動的な SQL を追加する簡単な方法です。
クエリが ClickHouse サーバーに送信される前に、プラグインはマクロを展開し、完全な式に置き換えます。

SQL エディタとクエリビルダーの両方のクエリでマクロを使用できます。


### マクロの使用 {#using-macros}

マクロはクエリの任意の場所に含めることができ、必要に応じて複数回使用できます。

以下は `$__timeFilter` マクロの使用例です：

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

この例では、Grafana ダッシュボードの時間範囲が `log_time` カラムに適用されます。

プラグインは、ブレース `{}` を使用した表記もサポートしています。これは、[パラメータ](/sql-reference/syntax.md#defining-and-using-query-parameters) 内でクエリが必要な場合に使用します。

### マクロのリスト {#list-of-macros}

以下は、プラグインで利用可能なすべてのマクロのリストです：

| マクロ                                        | 説明                                                                                                                                                                         | 出力例                                                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `$__dateFilter(columnName)`                  | 提供されたカラムに対して、Grafana パネルの時間範囲を使用して時間範囲フィルターで置き換えます。[Date](/sql-reference/data-types/date.md) として。                                 | `columnName >= toDate('2022-10-21') AND columnName <= toDate('2022-10-23')`                                       |
| `$__timeFilter(columnName)`                  | 提供されたカラムに対して、Grafana パネルの時間範囲を使用して時間範囲フィルターで置き換えます。[DateTime](/sql-reference/data-types/datetime.md) として。                         | `columnName >= toDateTime(1415792726) AND time <= toDateTime(1447328726)`                                         |
| `$__timeFilter_ms(columnName)`               | 提供されたカラムに対して、Grafana パネルの時間範囲を使用して時間範囲フィルターで置き換えます。[DateTime64](/sql-reference/data-types/datetime64.md) として。                     | `columnName >= fromUnixTimestamp64Milli(1415792726123) AND columnName <= fromUnixTimestamp64Milli(1447328726456)` |
| `$__dateTimeFilter(dateColumn, timeColumn)`  | `$__dateFilter()` と `$__timeFilter()` を組み合わせたショートハンドで、別々の Date と DateTime カラムを使用します。エイリアス `$__dt()`                                                                               | `$__dateFilter(dateColumn) AND $__timeFilter(timeColumn)`                                             |
| `$__fromTime`                                | Grafana パネル範囲の開始時間で [DateTime](/sql-reference/data-types/datetime.md) にキャストして置き換えます。                                                     | `toDateTime(1415792726)`                                                                                          |
| `$__fromTime_ms`                             | パネル範囲の開始時間で [DateTime64](/sql-reference/data-types/datetime64.md) にキャストして置き換えます。                                                         | `fromUnixTimestamp64Milli(1415792726123)`                                                                         |
| `$__toTime`                                  | Grafana パネル範囲の終了時間で [DateTime](/sql-reference/data-types/datetime.md) にキャストして置き換えます。                                                       | `toDateTime(1447328726)`                                                                                          |
| `$__toTime_ms`                               | パネル範囲の終了時間で [DateTime64](/sql-reference/data-types/datetime64.md) にキャストして置き換えます。                                                           | `fromUnixTimestamp64Milli(1447328726456)`                                                                         |
| `$__timeInterval(columnName)`                | ウィンドウサイズに基づいて秒単位で間隔を計算する関数で置き換えます。                                                                                                    | `toStartOfInterval(toDateTime(columnName), INTERVAL 20 second)`                                                   |
| `$__timeInterval_ms(columnName)`             | ウィンドウサイズに基づいてミリ秒単位で間隔を計算する関数で置き換えます。                                                                                               | `toStartOfInterval(toDateTime64(columnName, 3), INTERVAL 20 millisecond)`                                         |
| `$__interval_s`                              | ダッシュボードの間隔を秒単位で置き換えます。                                                                                                                                      | `20`                                                                                                              |
| `$__conditionalAll(condition, $templateVar)` | テンプレート変数がすべての値を選択しない場合は最初のパラメーターで置き換え、テンプレート変数がすべての値を選択する場合は 1=1 で置き換えます。 | `condition` または `1=1`                                                                                              |
