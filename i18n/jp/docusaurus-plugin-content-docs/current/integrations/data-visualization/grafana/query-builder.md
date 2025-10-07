---
'sidebar_label': 'クエリビルダー'
'sidebar_position': 2
'slug': '/integrations/grafana/query-builder'
'description': 'ClickHouse Grafana プラグインでの Query Builder の使用'
'title': 'クエリビルダー'
'doc_type': 'guide'
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

任意のクエリは ClickHouse プラグインで実行できます。
クエリビルダーはシンプルなクエリの便利なオプションですが、複雑なクエリには [SQL Editor](#sql-editor) を使用する必要があります。

クエリビルダー内のすべてのクエリには [クエリタイプ](#query-types) があり、少なくとも1つのカラムを選択する必要があります。

利用可能なクエリタイプは次のとおりです：
- [テーブル](#table)：テーブル形式でデータを表示するための最もシンプルなクエリタイプ。集約関数を含むシンプルおよび複雑なクエリのキャッチオールとしてもうまく機能します。
- [ログ](#logs)：ログ用にクエリを構築するために最適化されています。[defaults configured](./config.md#logs) に基づいて、エクスプロールビューで最適に動作します。
- [時系列](#time-series)：時系列クエリの構築に最適です。専用の時間カラムを選択し、集約関数を追加することができます。
- [トレース](#traces)：トレースの検索/表示に最適化されています。[defaults configured](./config.md#traces) に基づいて、エクスプロールビューで最適に動作します。
- [SQL Editor](#sql-editor)：クエリを完全に制御したい場合に使用できます。このモードでは、任意の SQL クエリを実行できます。

## クエリタイプ {#query-types}

*クエリタイプ* 設定は、構築中のクエリのタイプに合わせてクエリビルダーのレイアウトを変更します。
クエリタイプは、データを視覚化する際に使用されるパネルも決定します。

### テーブル {#table}

最も柔軟なクエリタイプはテーブルクエリです。これは、シンプルおよび集約クエリを処理するために設計された他のクエリビルダーのキャッチオールです。

| フィールド | 説明 |
|----|----|
| ビルダーモード  | シンプルなクエリは集計やグループバイを除外し、集約クエリはこれらのオプションを含みます。 |
| カラム | 選択されたカラム。関数やカラムエイリアスを使用できるように、このフィールドに生の SQL を入力できます。 |
| 集約 | [集約関数](/sql-reference/aggregate-functions/index.md) のリスト。関数とカラムに対してカスタム値を許可します。集約モードでのみ表示されます。 |
| グループバイ | [GROUP BY](/sql-reference/statements/select/group-by.md) 式のリスト。集約モードでのみ表示されます。 |
| オーダーバイ | [ORDER BY](/sql-reference/statements/select/order-by.md) 式のリスト。 |
| リミット | クエリの最後に [LIMIT](/sql-reference/statements/select/limit.md) ステートメントを追加します。`0` に設定されている場合は除外されます。一部の視覚化では、すべてのデータを表示するためにこれを `0` に設定する必要があるかもしれません。 |
| フィルター | `WHERE` 句に適用されるフィルターのリスト。 |

<Image size="md" img={demo_table_query} alt="例の集約テーブルクエリ" border />

このクエリタイプはデータをテーブルとして描画します。

### ログ {#logs}

ログクエリタイプは、ログデータをクエリするために焦点を当てたクエリビルダーを提供します。
データソースの [ログ設定](./config.md#logs) にデフォルトを設定することで、クエリビルダーをデフォルトのデータベース/テーブルとカラムで事前読み込みすることができます。
OpenTelemetry を有効にすると、スキーマバージョンに応じてカラムを自動選択することもできます。

デフォルトで **Time** と **Level** フィルターが追加され、時間カラムのオーダーバイが設定されています。
これらのフィルターはそれぞれのフィールドに紐付いており、カラムが変更されると更新されます。
**Level** フィルターはデフォルトで SQL から除外されており、`IS ANYTHING` オプションから変更すると有効になります。

ログクエリタイプは [データリンク](#data-links) をサポートしています。

| フィールド | 説明 |
|----|----|
| OTel を使用 | OpenTelemetry カラムを有効にします。選択されたカラムを、選択された OTel スキーマバージョンによって定義されたカラムを使用するように上書きします（カラム選択を無効にします）。 |
| カラム | ログ行に追加される追加カラム。関数やカラムエイリアスを使用できるように、このフィールドに生の SQL を入力できます。 |
| 時間 | ログの主要なタイムスタンプカラム。時間に似た型を表示しますが、カスタム値/関数を許可します。 |
| ログレベル | オプション。ログの *level* または *severity*。値は通常 `INFO`、`error`、`Debug` などに見えます。 |
| メッセージ | ログメッセージの内容。 |
| オーダーバイ | [ORDER BY](/sql-reference/statements/select/order-by.md) 式のリスト。 |
| リミット | クエリの最後に [LIMIT](/sql-reference/statements/select/limit.md) ステートメントを追加します。`0` に設定されている場合は除外されますが、大きなログデータセットには推奨されません。 |
| フィルター | `WHERE` 句に適用されるフィルターのリスト。 |
| メッセージフィルター | `LIKE %value%` を使用してログを便利にフィルターするためのテキスト入力。入力が空の場合は除外されます。 |

<Image size="md" img={demo_logs_query} alt="例のOTelログクエリ" border />

<br/>
このクエリタイプは、ログパネルおよび上部のログヒストグラムパネルでデータを描画します。

クエリで選択された追加カラムは、展開されたログ行で表示できます：
<Image size="md" img={demo_logs_query_fields} alt="ログクエリの追加フィールドの例" border />

### 時系列 {#time-series}

時系列クエリタイプは、[テーブル](#table) と似ていますが、時系列データに焦点を当てています。

2つのビューはほぼ同じですが、以下の顕著な違いがあります：
- 専用の *Time* フィールド。
- 集約モードでは、時間インターバルマクロが自動的に適用され、時間フィールドのグループバイも追加されます。
- 集約モードでは、"Columns" フィールドは非表示です。
- 時間範囲フィルターとオーダーバイが **Time** フィールドに自動的に追加されます。

:::important 可視化にデータが欠落していますか？
場合によっては、時系列パネルが切り取られて表示されることがあります。デフォルトではリミットが `1000` になっています。

データセットが許可されている場合、`LIMIT` 句を `0` に設定して削除してみてください。
:::

| フィールド | 説明 |
|----|----|
| ビルダーモード  | シンプルなクエリは集計やグループバイを除外し、集約クエリはこれらのオプションを含みます。 |
| 時間 | クエリの主要な時間カラム。時間に似た型を表示しますが、カスタム値/関数を許可します。 |
| カラム | 選択されたカラム。関数やカラムエイリアスを使用できるように、このフィールドに生の SQL を入力できます。シンプルモードでのみ表示されます。 |
| 集約 | [集約関数](/sql-reference/aggregate-functions/index.md) のリスト。関数とカラムに対してカスタム値を許可します。集約モードでのみ表示されます。 |
| グループバイ | [GROUP BY](/sql-reference/statements/select/group-by.md) 式のリスト。集約モードでのみ表示されます。 |
| オーダーバイ | [ORDER BY](/sql-reference/statements/select/order-by.md) 式のリスト。 |
| リミット | クエリの最後に [LIMIT](/sql-reference/statements/select/limit.md) ステートメントを追加します。`0` に設定されている場合は除外されます。これは、フルビジュアリゼーションを表示するために一部の時系列データセットで推奨されます。 |
| フィルター | `WHERE` 句に適用されるフィルターのリスト。 |

<Image size="md" img={demo_time_series_query} alt="例の時系列クエリ" border />

このクエリタイプは、時系列パネルでデータを描画します。

### トレース {#traces}

トレースクエリタイプは、トレースを簡単に検索および表示するためのクエリビルダーを提供します。
OpenTelemetry データ用に設計されていますが、異なるスキーマからトレースを描画するためにカラムを選択することができます。
データソースの [トレース設定](./config.md#traces) にデフォルトを設定することで、クエリビルダーをデフォルトのデータベース/テーブルとカラムで事前読み込みすることができます。デフォルトが設定されている場合、カラム選択はデフォルトで折りたたまれます。
OpenTelemetry を有効にすると、スキーマバージョンに応じてカラムを自動選択することもできます。

デフォルトフィルターは、最上位のスパンのみを表示することを目的として追加されます。
時間および経過時間カラムのオーダーバイも含まれています。
これらのフィルターはそれぞれのフィールドに紐付いており、カラムが変更されると更新されます。
**Service Name** フィルターはデフォルトで SQL から除外されており、`IS ANYTHING` オプションから変更すると有効になります。

トレースクエリタイプは [データリンク](#data-links) をサポートしています。

| フィールド | 説明 |
|----|----|
| トレースモード | クエリをトレース検索からトレース ID ルックアップに変更します。 |
| OTel を使用 | OpenTelemetry カラムを有効にします。選択されたカラムを、選択された OTel スキーマバージョンによって定義されたカラムを使用するように上書きします（カラム選択を無効にします）。 |
| トレース ID カラム | トレースの ID。 |
| スパン ID カラム | スパン ID。 |
| 親スパン ID カラム | 親スパン ID。通常、最上位のトレースでは空です。 |
| サービ名称カラム | サービス名。 |
| 操作名カラム | 操作名。 |
| 開始時間カラム | トレーススパンの主要な時間カラム。スパンが開始された時間。 |
| 経過時間カラム | スパンの時間。デフォルトでは、Grafana はこれをミリ秒単位の float で期待します。`Duration Unit` ドロップダウンを介して自動的に変換されます。 |
| 時間の単位 | 経過時間に使用される時間の単位。デフォルトではナノ秒です。選択された単位は、Grafana に必要なミリ秒の float に変換されます。 |
| タグカラム | スパンタグ。特定のマップカラムタイプを期待する OTel ベースのスキーマを使用しない場合は除外します。 |
| サービスタグカラム | サービスタグ。特定のマップカラムタイプを期待する OTel ベースのスキーマを使用しない場合は除外します。 |
| オーダーバイ | [ORDER BY](/sql-reference/statements/select/order-by.md) 式のリスト。 |
| リミット | クエリの最後に [LIMIT](/sql-reference/statements/select/limit.md) ステートメントを追加します。`0` に設定されている場合は除外されますが、大きなトレースデータセットには推奨されません。 |
| フィルター | `WHERE` 句に適用されるフィルターのリスト。 |
| トレース ID | フィルターのためのトレース ID。トレース ID モードでのみ使用され、トレース ID [データリンク](#data-links) を開くときに使用されます。 |

<Image size="md" img={demo_trace_query} alt="例のOTelトレースクエリ" border />

このクエリタイプは、トレース検索モードのためのテーブルビューでデータを描画し、トレース ID モードではトレースパネルを描画します。

## SQLエディター {#sql-editor}

クエリビルダーでは扱いきれないほど複雑なクエリの場合、SQLエディターを使用できます。
これにより、プレーンな ClickHouse SQL を記述して実行する完全な制御が可能になります。

SQLエディターは、クエリエディターの上部で「SQL Editor」を選択することで開くことができます。

[マクロ関数](#macros)もこのモードで使用できます。

クエリタイプを切り替えることで、クエリに最も適した可視化を取得できます。
この切り替えは、ダッシュボードビューでも影響を与え、特に時系列データにおいて顕著です。

<Image size="md" img={demo_raw_sql_query} alt="例の生SQLクエリ" border />

## データリンク {#data-links}

Grafana [データリンク](https://grafana.com/docs/grafana/latest/panels-visualizations/configure-data-links) を使用して新しいクエリにリンクできます。
この機能は、トレースをログにリンクするために ClickHouse プラグイン内で有効にされています。ログとトレースの両方に OpenTelemetry が設定されている場合に最も効果的です。[データソースの設定](./config.md#opentelemetry) に基づく。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
  テーブル内のトレースリンクの例
  <Image size="sm" img={trace_id_in_table} alt="テーブル内のトレースリンク" border />
</div>

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  ログ内のトレースリンクの例
  <Image size="md" img={trace_id_in_logs} alt="ログ内のトレースリンク" border />
</div>

### データリンクの作成方法 {#how-to-make-a-data-link}

クエリで `traceID` という名前のカラムを選択することでデータリンクを作成できます。この名前はケースインセンシティブであり、「ID」の前にアンダースコアを追加することもサポートしています。例えば、`traceId`、`TraceId`、`TRACE_ID`、`tracE_iD` はすべて有効です。

[ログ](#logs) または [トレース](#traces) クエリで OpenTelemetry が有効になっている場合、トレース ID カラムが自動的に含まれます。

トレース ID カラムを含めることで、"**View Trace**" と "**View Logs**" のリンクがデータに付加されます。

### リンク機能 {#linking-abilities}

データリンクがあることで、提供されたトレース ID を使用してトレースやログを開くことができます。

"**View Trace**" を選択すると、トレースのスプリットパネルが開き、"**View Logs**" を選択するとトレース ID でフィルタリングされたログクエリが開きます。
ダッシュボードからクリックした場合、リンクはエクスプロールビューの新しいタブで開かれます。

[ログ](./config.md#logs) と [トレース](./config.md#traces) の両方にデフォルトの設定がされていることが、クエリタイプを越えて（ログからトレース、トレースからログへの）必要です。クエリの同じタイプのリンクを開くときは、クエリが単にコピーできるため、デフォルトは必要ありません。

<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
  ログクエリ（左パネル）からトレース（右パネル）を表示する例
  <Image size="md" img={demo_data_links} alt="データリンクのリンクの例" border />
</div>

## マクロ {#macros}

マクロは、クエリにダイナミックな SQL を追加する簡単な方法です。
クエリが ClickHouse サーバーに送信される前に、プラグインはマクロを展開し、完全な式に置き換えます。

SQL エディターとクエリビルダーの両方からのクエリは、マクロを使用できます。

### マクロの使用 {#using-macros}

マクロは、クエリ内のいつでも、必要に応じて複数回含めることができます。

以下は、`$__timeFilter` マクロを使用した例です：

入力：
```sql
SELECT log_time, log_message
FROM logs
WHERE $__timeFilter(log_time)
```

最終クエリの出力：
```sql
SELECT log_time, log_message
FROM logs
WHERE log_time >= toDateTime(1415792726) AND log_time <= toDateTime(1447328726)
```

この例では、Grafana ダッシュボードの時間範囲が `log_time` カラムに適用されます。

プラグインは、波括弧 `{}` を使用した表記法もサポートしています。この表記法は、[パラメーター](/sql-reference/syntax.md#defining-and-using-query-parameters) が必要な場合に使用します。

### マクロのリスト {#list-of-macros}

これは、プラグインで利用可能なすべてのマクロのリストです：

| マクロ                                        | 説明                                                                                                                                                                         | 出力例                                                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `$__dateFilter(columnName)`                  | 提供されたカラムの範囲フィルターに置き換えられ、Grafana パネルの時間範囲を [Date](/sql-reference/data-types/date.md) として使用します。                                 | `columnName >= toDate('2022-10-21') AND columnName <= toDate('2022-10-23')`                                       |
| `$__timeFilter(columnName)`                  | 提供されたカラムの範囲フィルターに置き換えられ、Grafana パネルの時間範囲を [DateTime](/sql-reference/data-types/datetime.md) として使用します。                         | `columnName >= toDateTime(1415792726) AND time <= toDateTime(1447328726)`                                         |
| `$__timeFilter_ms(columnName)`               | 提供されたカラムの範囲フィルターに置き換えられ、Grafana パネルの時間範囲を [DateTime64](/sql-reference/data-types/datetime64.md) として使用します。                     | `columnName >= fromUnixTimestamp64Milli(1415792726123) AND columnName <= fromUnixTimestamp64Milli(1447328726456)` |
| `$__dateTimeFilter(dateColumn, timeColumn)`  | `$__dateFilter()` と `$__timeFilter()` を短縮して組み合わせ、別々の Date と DateTime カラムを使用します。エイリアス `$__dt()`                                                                               | `$__dateFilter(dateColumn) AND $__timeFilter(timeColumn)`                                             |
| `$__fromTime`                                | Grafana パネル範囲の開始時間を [DateTime](/sql-reference/data-types/datetime.md) にキャストして置き換えます。                                                     | `toDateTime(1415792726)`                                                                                          |
| `$__fromTime_ms`                             | パネル範囲の開始時間を [DateTime64](/sql-reference/data-types/datetime64.md) にキャストして置き換えます。                                                         | `fromUnixTimestamp64Milli(1415792726123)`                                                                         |
| `$__toTime`                                  | Grafana パネル範囲の終了時間を [DateTime](/sql-reference/data-types/datetime.md) にキャストして置き換えます。                                                       | `toDateTime(1447328726)`                                                                                          |
| `$__toTime_ms`                               | パネル範囲の終了時間を [DateTime64](/sql-reference/data-types/datetime64.md) にキャストして置き換えます。                                                           | `fromUnixTimestamp64Milli(1447328726456)`                                                                         |
| `$__timeInterval(columnName)`                | ウィンドウサイズに基づいてインターバルを計算する関数に置き換えます。                                                                                                    | `toStartOfInterval(toDateTime(columnName), INTERVAL 20 second)`                                                   |
| `$__timeInterval_ms(columnName)`             | ウィンドウサイズに基づいてミリ秒単位でインターバルを計算する関数に置き換えます。                                                                                               | `toStartOfInterval(toDateTime64(columnName, 3), INTERVAL 20 millisecond)`                                         |
| `$__interval_s`                              | ダッシュボードインターバルを秒単位で置き換えます。                                                                                                                                      | `20`                                                                                                              |
| `$__conditionalAll(condition, $templateVar)` | テンプレート変数がすべての値を選択しない場合、最初のパラメーターに置き換えます。テンプレート変数がすべての値を選択している場合は、1=1 に置き換えられます。 | `condition` または `1=1`                                                                                              |
