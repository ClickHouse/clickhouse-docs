---
slug: /operations/optimizing-performance/sampling-query-profiler
sidebar_position: 54
sidebar_label: クエリプロファイリング
---
import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# サンプリングクエリプロファイラー

ClickHouseはクエリ実行を分析するためのサンプリングプロファイラーを実行します。プロファイラーを使用すると、クエリ実行中に最も頻繁に使用されたソースコードのルーチンを見つけることができます。CPU時間や壁時計時間、アイドル時間を含む経過時間を追跡できます。

クエリプロファイラーはClickHouse Cloudで自動的に有効になっており、以下のようにサンプルクエリを実行できます。

:::note ClickHouse Cloudで以下のクエリを実行する場合は、`FROM system.trace_log`を`FROM clusterAllReplicas(default, system.trace_log)`に変更して、クラスタのすべてのノードから選択するようにしてください。
:::

``` sql
SELECT
    count(),
    arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
FROM system.trace_log
WHERE (query_id = 'ebca3574-ad0a-400a-9cbc-dca382f5998c') AND (event_date = today())
GROUP BY trace
ORDER BY count() DESC
LIMIT 10
SETTINGS allow_introspection_functions = 1
```

セルフマネージドデプロイメントでは、クエリプロファイラーを使用するには:

- [trace_log](../../operations/server-configuration-parameters/settings.md#trace_log)セクションをサーバー設定で設定してください。

    このセクションは、プロファイラー機能の結果を含む[trace_log](/operations/system-tables/trace_log)システムテーブルを構成します。デフォルトで設定されています。このテーブルのデータは、稼働中のサーバーに対してのみ有効であることに注意してください。サーバーを再起動した後、ClickHouseはテーブルをクリーンアップせず、すべての保存された仮想メモリアドレスが無効になる可能性があります。

- [query_profiler_cpu_time_period_ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns)または[query_profiler_real_time_period_ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns)設定を設定してください。両方の設定は同時に使用できます。

    これらの設定では、プロファイラタイマーを構成できます。これらはセッション設定であるため、サーバー全体、個々のユーザーやユーザープロファイル、対話型セッション、個々のクエリごとに異なるサンプリング頻度を得ることができます。

デフォルトのサンプリング頻度は1秒あたり1サンプルで、CPUタイマーと実際のタイマーの両方が有効です。この頻度では、ClickHouseクラスターに関する十分な情報を収集できます。同時に、この頻度で作業する場合、プロファイラーはClickHouseサーバーのパフォーマンスに影響を与えません。各個別のクエリをプロファイリングする必要がある場合は、より高いサンプリング頻度を使用してください。

`trace_log`システムテーブルを分析するには:

- `clickhouse-common-static-dbg`パッケージをインストールしてください。詳細は[DEBパッケージからのインストール](../../getting-started/install.md#install-from-deb-packages)を参照してください。

- [allow_introspection_functions](../../operations/settings/settings.md#allow_introspection_functions)設定により、イントロスペクション関数を有効にしてください。

    セキュリティ上の理由から、イントロスペクション関数はデフォルトで無効になっています。

- `addressToLine`、`addressToLineWithInlines`、`addressToSymbol`および`demangle` [イントロスペクション関数](../../sql-reference/functions/introspection.md)を使用して、ClickHouseコード内の関数名とその位置を取得します。特定のクエリのプロファイルを取得するには、`trace_log`テーブルからデータを集約する必要があります。個々の関数別またはスタックトレース全体別にデータを集約できます。

`trace_log`情報を視覚化する必要がある場合は、[flamegraph](/interfaces/third-party/gui#clickhouse-flamegraph)や[speedscope](https://github.com/laplab/clickhouse-speedscope)をお試しください。

## 例 {#example}

この例では、私たちは:

- クエリ識別子と現在の日付で`trace_log`データをフィルタリングします。

- スタックトレースで集約します。

- イントロスペクション関数を使用して、以下のレポートを取得します。

    - シンボルの名前および対応するソースコード関数。
    - これらの関数のソースコードの位置。

<!-- -->

``` sql
SELECT
    count(),
    arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
FROM system.trace_log
WHERE (query_id = 'ebca3574-ad0a-400a-9cbc-dca382f5998c') AND (event_date = today())
GROUP BY trace
ORDER BY count() DESC
LIMIT 10
```
