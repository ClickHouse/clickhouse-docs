---
description: 'ClickHouse のサンプリングクエリプロファイラーツールに関するドキュメント'
sidebar_label: 'クエリプロファイリング'
sidebar_position: 54
slug: /operations/optimizing-performance/sampling-query-profiler
title: 'サンプリングクエリプロファイラー'
doc_type: 'reference'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';


# サンプリングクエリプロファイラ

ClickHouse にはクエリ実行を解析できるサンプリングプロファイラが搭載されています。プロファイラを使用すると、クエリ実行中に最も頻繁に使用されたソースコード内のルーチンを特定できます。CPU 時間と、アイドル時間を含むウォールクロック時間（実時間）を追跡できます。

クエリプロファイラは ClickHouse Cloud では自動的に有効化されており、次のようにサンプルクエリを実行できます。

:::note ClickHouse Cloud で以下のクエリを実行する場合は、クラスタ内のすべてのノードから取得するために、`FROM system.trace_log` を `FROM clusterAllReplicas(default, system.trace_log)` に変更してください。
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

自己管理型デプロイメントでクエリプロファイラを使用するには、次の手順を実行します。

* サーバー設定の [trace&#95;log](../../operations/server-configuration-parameters/settings.md#trace_log) セクションを設定します。

  このセクションでは、プロファイラの動作結果を格納する [trace&#95;log](/operations/system-tables/trace_log) システムテーブルを構成します。デフォルトで有効になっています。このテーブル内のデータは、稼働中のサーバーに対してのみ有効であることに注意してください。サーバー再起動後、ClickHouse はこのテーブルをクリーンアップせず、保存されている仮想メモリアドレスはすべて無効になる可能性があります。

* [query&#95;profiler&#95;cpu&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns) または [query&#95;profiler&#95;real&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns) 設定を構成します。両方の設定を同時に使用できます。

  これらの設定により、プロファイラのタイマーを構成できます。これはセッション設定であるため、サーバー全体、個々のユーザーやユーザープロファイル、対話型セッション、さらに各個別クエリごとに異なるサンプリング頻度を設定できます。

デフォルトのサンプリング頻度は 1 秒あたり 1 サンプルで、CPU タイマーと実時間タイマーの両方が有効になっています。この頻度により、ClickHouse クラスターに関する十分な情報を収集できます。同時に、この頻度で動作してもプロファイラは ClickHouse サーバーのパフォーマンスに影響を与えません。各個別クエリを詳細にプロファイルする必要がある場合は、より高いサンプリング頻度の使用を検討してください。

`trace_log` システムテーブルを分析するには、次の手順を実行します。

* `clickhouse-common-static-dbg` パッケージをインストールします。詳細は [Install from DEB Packages](../../getting-started/install/install.mdx) を参照してください。

* [allow&#95;introspection&#95;functions](../../operations/settings/settings.md#allow_introspection_functions) 設定で introspection 関数を許可します。

  セキュリティ上の理由から、introspection 関数はデフォルトで無効になっています。

* `addressToLine`、`addressToLineWithInlines`、`addressToSymbol`、`demangle` などの [introspection 関数](../../sql-reference/functions/introspection.md) を使用して、ClickHouse コード内の関数名およびその位置を取得します。特定のクエリについてプロファイルを取得するには、`trace_log` テーブルからデータを集約する必要があります。個々の関数単位、またはスタックトレース全体単位でデータを集約できます。

`trace_log` の情報を可視化する必要がある場合は、[flamegraph](/interfaces/third-party/gui#clickhouse-flamegraph) や [speedscope](https://github.com/laplab/clickhouse-speedscope) の使用を検討してください。


## 例

この例では次のことを行います。

* クエリ識別子と現在の日付で `trace_log` データをフィルタリングします。
* スタックトレース単位で集計します。
* イントロスペクション用関数を使用して、次の内容を含むレポートを取得します。
  * シンボル名と、それに対応するソースコード上の関数名
  * これらの関数が記述されているソースコード上の位置

{/* */ }

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
