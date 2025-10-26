---
'description': 'ClickHouseのサンプリングクエリプロファイラーツールに関するDocumentation'
'sidebar_label': 'クエリプロファイリング'
'sidebar_position': 54
'slug': '/operations/optimizing-performance/sampling-query-profiler'
'title': 'サンプリングクエリプロファイラー'
'doc_type': 'reference'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# サンプリングクエリプロファイラー

ClickHouseは、クエリ実行を分析するためのサンプリングプロファイラーを実行します。プロファイラーを使用すると、クエリ実行中に最も頻繁に使用されたソースコードルーチンを特定できます。CPU時間やアイドル時間を含むウォールクロック時間を追跡できます。

クエリプロファイラーは、ClickHouse Cloudで自動的に有効になっており、以下のようにサンプルクエリを実行できます。

:::note ClickHouse Cloudで以下のクエリを実行する場合は、`FROM system.trace_log`を`FROM clusterAllReplicas(default, system.trace_log)`に変更して、クラスターのすべてのノードから選択してください。
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

セルフマネージドデプロイメントでクエリプロファイラーを使用するには：

- サーバー設定の [trace_log](../../operations/server-configuration-parameters/settings.md#trace_log) セクションを設定します。

    このセクションは、プロファイラーの機能の結果を含む [trace_log](/operations/system-tables/trace_log) システムテーブルを構成します。デフォルトで構成されています。このテーブルのデータは、実行中のサーバーに対してのみ有効であることを忘れないでください。サーバーを再起動すると、ClickHouseはテーブルをクリーンアップせず、すべての格納された仮想メモリアドレスが無効になる可能性があります。

- [query_profiler_cpu_time_period_ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns) または [query_profiler_real_time_period_ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns) 設定を設定します。両方の設定を同時に使用できます。

    これらの設定によりプロファイラータイマーを構成できます。これらはセッション設定であるため、サーバー全体、個々のユーザーやユーザープロファイル、インタラクティブセッション、各個別クエリに対して異なるサンプリング頻度を取得できます。

デフォルトのサンプリング頻度は1秒あたり1サンプルで、CPUタイマーとリアルタイマーの両方が有効になっています。この頻度は、ClickHouseクラスターに関する十分な情報を収集することを可能にします。同時に、この頻度で作業すると、プロファイラーはClickHouseサーバーのパフォーマンスに影響を与えません。各個別クエリをプロファイルする必要がある場合は、より高いサンプリング頻度を使用することをお勧めします。

`trace_log`システムテーブルを分析するには：

- `clickhouse-common-static-dbg`パッケージをインストールします。 [DEBパッケージからのインストール](../../getting-started/install/install.mdx)を参照してください。

- [allow_introspection_functions](../../operations/settings/settings.md#allow_introspection_functions) 設定でイントロスペクション機能を許可します。

    セキュリティ上の理由から、イントロスペクション機能はデフォルトで無効になっています。

- `addressToLine`、`addressToLineWithInlines`、`addressToSymbol`、および `demangle` [イントロスペクション関数](../../sql-reference/functions/introspection.md)を使用して、ClickHouseコード内の関数名とその位置を取得します。特定のクエリのプロファイルを取得するには、`trace_log`テーブルのデータを集計する必要があります。個々の関数または全体のスタックトレースでデータを集計できます。

`trace_log`情報を視覚化したい場合は、[flamegraph](/interfaces/third-party/gui#clickhouse-flamegraph) および [speedscope](https://github.com/laplab/clickhouse-speedscope)を試してください。

## 例 {#example}

この例では、私たちは：

- クエリ識別子と現在の日付で `trace_log` データをフィルタリングします。

- スタックトレースで集計します。

- イントロスペクション関数を使用して、以下のレポートを取得します：

  - シンボル名とそれに対応するソースコード関数。
  - これらの関数のソースコード位置。

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
