---
description: 'ClickHouseにおけるサンプリングクエリプロファイラーツールのドキュメント'
sidebar_label: 'クエリプロファイリング'
sidebar_position: 54
slug: /operations/optimizing-performance/sampling-query-profiler
title: 'サンプリングクエリプロファイラー'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';


# サンプリングクエリプロファイラー

ClickHouseはクエリ実行を分析するためのサンプリングプロファイラーを実行します。プロファイラーを使用することで、クエリ実行中に最も頻繁に使用されるソースコードのルーチンを特定できます。CPU時間とアイドル時間を含む実行時間をトレースできます。

クエリプロファイラーはClickHouse Cloudで自動的に有効になり、以下のようにサンプルクエリを実行できます。

:::note ClickHouse Cloudで以下のクエリを実行している場合は、すべてのノードから選択するために`FROM system.trace_log`を`FROM clusterAllReplicas(default, system.trace_log)`に変更してください。
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

- サーバー設定の[trace_log](../../operations/server-configuration-parameters/settings.md#trace_log)セクションを設定します。

    このセクションは、プロファイラーの機能結果を含む[trace_log](/operations/system-tables/trace_log)システムテーブルを構成します。デフォルトでは設定されています。このテーブルのデータは、サーバーが実行されている場合のみ有効です。サーバー再起動後、ClickHouseはテーブルをクリーンアップせず、すべての保存された仮想メモリアドレスが無効になる可能性があります。

- [query_profiler_cpu_time_period_ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns)または[query_profiler_real_time_period_ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns)設定を設定します。両方の設定は同時に使用できます。

    これらの設定により、プロファイラのタイマーを設定できます。これらはセッション設定であり、サーバー全体、個別のユーザーまたはユーザープロファイル、インタラクティブセッション、各クエリごとに異なるサンプリング周波数を取得できます。

デフォルトのサンプリング周波数は1秒あたり1サンプルで、CPUタイマーとリアルタイムタイマーの両方が有効です。この周波数では、ClickHouseクラスタに関する十分な情報を収集できます。同時に、この周波数で作業することで、プロファイラーはClickHouseサーバーのパフォーマンスに影響を与えません。各クエリをプロファイリングする必要がある場合は、より高いサンプリング周波数を使用してください。

`trace_log`システムテーブルを分析するには：

- `clickhouse-common-static-dbg`パッケージをインストールします。 [DEBパッケージからのインストール](../../getting-started/install/install.mdx)を参照してください。

- [allow_introspection_functions](../../operations/settings/settings.md#allow_introspection_functions)設定により、インストロスペクション関数を許可します。

    セキュリティ上の理由から、インストロスペクション関数はデフォルトで無効になっています。

- `addressToLine`、`addressToLineWithInlines`、`addressToSymbol`および`demangle` [インストロスペクション関数](../../sql-reference/functions/introspection.md)を使用して、ClickHouseコード内の関数名およびその位置を取得します。特定のクエリのプロファイルを取得するには、`trace_log`テーブルからデータを集約する必要があります。個別の関数またはスタックトレース全体でデータを集約できます。

`trace_log`情報を視覚化する必要がある場合は、[flamegraph](/interfaces/third-party/gui#clickhouse-flamegraph)や[speedscope](https://github.com/laplab/clickhouse-speedscope)を試してみてください。

## 例 {#example}

この例では：

- クエリ識別子と現在の日付で`trace_log`データをフィルタリングします。

- スタックトレースで集約します。

- インストロスペクション関数を使用して、以下のレポートを取得します：

    - シンボルの名前とそれに対応するソースコード関数。
    - これらの関数のソースコードの場所。

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
