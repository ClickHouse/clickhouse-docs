---
slug: /operations/optimizing-performance/sampling-query-profiler
sidebar_position: 54
sidebar_label: クエリプロファイリング
---
import SelfManaged from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

# サンプリングクエリプロファイラー

ClickHouseはサンプリングプロファイラーを実行しており、クエリの実行を分析できます。プロファイラーを使用すると、クエリ実行中に最も頻繁に使用されるソースコードのルーチンを見つけることができます。CPU時間と、アイドル時間を含む実行時間を追跡できます。

クエリプロファイラーはClickHouse Cloudで自動的に有効になっており、以下のようにサンプルクエリを実行できます。

:::note ClickHouse Cloudで以下のクエリを実行する場合、`FROM system.trace_log`を`FROM clusterAllReplicas(default, system.trace_log)`に変更して、クラスタのすべてのノードから選択してください。
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

セルフマネージドのデプロイメントでクエリプロファイラーを使用するには：

- サーバー設定の[trace_log](../../operations/server-configuration-parameters/settings.md#trace_log)セクションを設定します。

    このセクションは、プロファイラーの機能の結果を含む[trace_log](../../operations/system-tables/trace_log.md#system_tables-trace_log)システムテーブルを構成します。デフォルトで設定されています。このテーブルのデータは、稼働中のサーバーに対してのみ有効であることを忘れないでください。サーバーを再起動後、ClickHouseはテーブルをクリーンアップせず、すべての格納された仮想メモリアドレスが無効になる可能性があります。

- [query_profiler_cpu_time_period_ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns)または[query_profiler_real_time_period_ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns)設定を設定します。これらの設定は同時に使用できます。

    これらの設定により、プロファイラのタイマーを構成できます。これらはセッション設定であるため、サーバ全体、個々のユーザーまたはユーザープロファイル、インタラクティブセッション、および各クエリごとに異なるサンプリング頻度を得ることができます。

デフォルトのサンプリング頻度は1秒あたり1サンプルで、CPUタイマーと実時間タイマーの両方が有効になっています。この頻度は、ClickHouseクラスタに関する十分な情報を収集することを可能にします。同時に、この頻度で作業する場合、プロファイラーはClickHouseサーバーのパフォーマンスに影響を与えません。各個別のクエリをプロファイリングする必要がある場合は、より高いサンプリング頻度を使用することをお勧めします。

`trace_log`システムテーブルを分析するには：

- `clickhouse-common-static-dbg`パッケージをインストールします。[DEBパッケージからのインストール](../../getting-started/install.md#install-from-deb-packages)を参照してください。

- [allow_introspection_functions](../../operations/settings/settings.md#allow_introspection_functions)設定を使用して、イントロスペクション関数を許可します。

    セキュリティ上の理由から、イントロスペクション関数はデフォルトで無効になっています。

- `addressToLine`、`addressToLineWithInlines`、`addressToSymbol`、および`demangle` [イントロスペクション関数](../../sql-reference/functions/introspection.md)を使用して、ClickHouseコード内の関数名とその位置を取得します。特定のクエリのプロファイルを取得するには、`trace_log`テーブルからデータを集計する必要があります。個々の関数または全体のスタックトレースによってデータを集計できます。

`trace_log`の情報を視覚化する必要がある場合は、[flamegraph](../../interfaces/third-party/gui.md#clickhouse-flamegraph-clickhouse-flamegraph)や[speedscope](https://github.com/laplab/clickhouse-speedscope)を試してください。

## 例 {#example}

この例では、私たちは：

- クエリ識別子と現在の日付で`trace_log`データをフィルタリングします。

- スタックトレースで集計します。

- イントロスペクション関数を使用して、以下のレポートを取得します：

    - シンボル名と対応するソースコード関数。
    - これらの関数のソースコード位置。

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
