---
'description': 'ClickHouseのサンプリングクエリプロファイラツールのドキュメント'
'sidebar_label': 'クエリプロファイリング'
'sidebar_position': 54
'slug': '/operations/optimizing-performance/sampling-query-profiler'
'title': 'サンプリングクエリプロファイラ'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# サンプリングクエリプロファイラ

ClickHouseはクエリ実行を分析するためのサンプリングプロファイラを実行します。プロファイラを使用すると、クエリ実行中に最も頻繁に使用されたソースコードルーチンを見つけることができます。CPU時間とアイドル時間を含むウォールクロック時間を追跡できます。

クエリプロファイラはClickHouse Cloudで自動的に有効になっており、次のようにサンプルクエリを実行できます。

:::note 
ClickHouse Cloudで次のクエリを実行している場合は、`FROM system.trace_log`を`FROM clusterAllReplicas(default, system.trace_log)`に変更して、クラスターのすべてのノードから選択してください。
:::

```sql
SELECT
    count(),
    arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
FROM system.trace_log
WHERE query_id = 'ebca3574-ad0a-400a-9cbc-dca382f5998c' AND trace_type = 'CPU' AND event_date = today()
GROUP BY trace
ORDER BY count() DESC
LIMIT 10
SETTINGS allow_introspection_functions = 1
```

セルフマネージドデプロイメントでクエリプロファイラを使用するには：

- サーバー構成の[trace_log](../../operations/server-configuration-parameters/settings.md#trace_log)セクションを設定します。

    このセクションはプロファイラの機能結果を含む[trace_log](/operations/system-tables/trace_log)システムテーブルを構成します。デフォルトで設定されています。このテーブルのデータは、実行中のサーバーでのみ有効であることに注意してください。サーバーの再起動後、ClickHouseはテーブルをクリーンアップせず、保存されたすべての仮想メモリアドレスが無効になる可能性があります。

- [query_profiler_cpu_time_period_ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns)または[query_profiler_real_time_period_ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns)設定を設定します。両方の設定は同時に使用可能です。

    これらの設定を使用すると、プロファイラタイマーを構成できます。これらはセッション設定であるため、サーバ全体、個別のユーザーまたはユーザープロファイル、対話型セッション、各個別のクエリのために異なるサンプリング頻度を取得できます。

デフォルトのサンプリング頻度は1秒あたり1サンプルで、CPUとリアルタイマーの両方が有効になっています。この頻度でClickHouseクラスターに関する十分な情報を収集できます。同時に、この頻度で作業すると、プロファイラはClickHouseサーバーのパフォーマンスに影響を与えません。各個別のクエリをプロファイルする必要がある場合は、より高いサンプリング頻度を使用することをお勧めします。

`trace_log`システムテーブルを分析するには：

- `clickhouse-common-static-dbg`パッケージをインストールします。 [DEBパッケージからインストール](../../getting-started/install/install.mdx)を参照してください。

- [allow_introspection_functions](../../operations/settings/settings.md#allow_introspection_functions)設定によってイントロスペクション関数を許可します。

    セキュリティ上の理由から、イントロスペクション関数はデフォルトで無効になっています。

- `addressToLine`、`addressToLineWithInlines`、`addressToSymbol`および`demangle` [イントロスペクション関数](../../sql-reference/functions/introspection.md)を使用して、ClickHouseコード内の関数名とその位置を取得します。あるクエリのプロファイルを取得するには、`trace_log`テーブルからデータを集約する必要があります。個々の関数または全体のスタックトレースによってデータを集約できます。

`trace_log`情報を視覚化する必要がある場合は、[flamegraph](/interfaces/third-party/gui#clickhouse-flamegraph)や[speedscope](https://github.com/laplab/clickhouse-speedscope)を試してください。

## サンプル {#example}

このサンプルでは：

- クエリ識別子と現在の日付で`trace_log`データをフィルタリングします。

- スタックトレースで集約します。

- イントロスペクション関数を使用して、次のレポートを取得します：

    - シンボル名と対応するソースコード関数。
    - これらの関数のソースコードの位置。

<!-- -->

```sql
SELECT
    count(),
    arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
FROM system.trace_log
WHERE (query_id = 'ebca3574-ad0a-400a-9cbc-dca382f5998c') AND (event_date = today())
GROUP BY trace
ORDER BY count() DESC
LIMIT 10
```
