---
description: 'ClickHouse のクエリキャッシュ機能の利用と設定に関するガイド'
sidebar_label: 'クエリキャッシュ'
sidebar_position: 65
slug: /operations/query-cache
title: 'クエリキャッシュ'
doc_type: 'guide'
---

# クエリキャッシュ {#query-cache}

クエリキャッシュを使用すると、`SELECT` クエリを一度だけ実行して結果を保存し、同じクエリの後続の実行にはキャッシュから直接結果を返すことができます。
クエリの種類によっては、これにより ClickHouse サーバーのレイテンシとリソース消費を劇的に削減できます。

## 背景、設計、制限事項 {#background-design-and-limitations}

クエリキャッシュは、一般的にトランザクション整合性のあるものとないものに分類できます。

- トランザクション整合性のあるキャッシュでは、`SELECT` クエリの結果が変化した、あるいは変化する可能性がある場合に、データベースはキャッシュされたクエリ結果を無効化（破棄）します。ClickHouse では、データを変更する操作には、テーブルへの挿入/更新/削除や collapsing merge が含まれます。トランザクション整合性のあるキャッシュは、特に OLTP データベースに適しており、たとえば
  [MySQL](https://dev.mysql.com/doc/refman/5.6/en/query-cache.html)（v8.0 以降でクエリキャッシュは廃止）や
  [Oracle](https://docs.oracle.com/database/121/TGDBA/tune_result_cache.htm) などがあります。
- トランザクション整合性のないキャッシュでは、すべてのキャッシュエントリに有効期間が割り当てられ、その期間経過後に失効する（例: 1 分）こと、そしてその期間中に基になるデータの変更がわずかであることを前提として、クエリ結果のわずかな不正確さを許容します。このアプローチは全体として OLAP データベースにより適しています。トランザクション整合性のないキャッシュで十分な例としては、複数のユーザーが同時にアクセスするレポーティングツールにおける毎時の売上レポートが挙げられます。売上データの変化は通常比較的ゆっくりであるため、データベースはレポートを一度だけ（最初の `SELECT` クエリで）計算すればよく、その後のクエリはクエリキャッシュから直接提供できます。この例では、妥当な有効期間は 30 分程度と考えられます。

トランザクション整合性のないキャッシュは、従来はデータベースとやり取りするクライアントツールやプロキシパッケージ（例:
[chproxy](https://www.chproxy.org/configuration/caching/)）によって提供されてきました。その結果、同じキャッシュロジックと設定が重複することがよくあります。ClickHouse のクエリキャッシュでは、キャッシュロジックがサーバー側に移されます。これにより、保守の手間が減り、冗長性も回避できます。

## 設定と使用方法 {#configuration-settings-and-usage}

:::note
ClickHouse Cloud では、クエリキャッシュの設定を変更するには [クエリレベルの設定](/operations/settings/query-level) を使用する必要があります。[設定ファイルレベルの設定](/operations/configuration-files) の編集は現在サポートされていません。
:::

:::note
[clickhouse-local](utilities/clickhouse-local.md) は一度に 1 つのクエリしか実行しません。そのためクエリ結果をキャッシュする意味がないので、clickhouse-local ではクエリ結果キャッシュは無効化されています。
:::

SETTING [use&#95;query&#95;cache](/operations/settings/settings#use_query_cache) を使用すると、特定のクエリ、または現在のセッション内のすべてのクエリでクエリキャッシュを利用するかどうかを制御できます。たとえば、クエリの最初の実行では

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true;
```

これによりクエリ結果はクエリキャッシュに保存されます。同じクエリを後続で実行した場合（パラメータ `use_query_cache = true` を指定した場合も同様に）、
計算済みの結果をキャッシュから読み取り、即座に返します。

:::note
`use_query_cache` と、その他すべてのクエリキャッシュ関連の設定は、スタンドアロンの `SELECT` 文に対してのみ効果があります。特に、
`CREATE VIEW AS SELECT [...] SETTINGS use_query_cache = true` によって作成された VIEW に対する `SELECT` の結果は、その `SELECT`
文が `SETTINGS use_query_cache = true` を指定して実行されない限り、キャッシュされません。
:::

キャッシュの利用方法は、設定 [enable&#95;writes&#95;to&#95;query&#95;cache](/operations/settings/settings#enable_writes_to_query_cache)
および [enable&#95;reads&#95;from&#95;query&#95;cache](/operations/settings/settings#enable_reads_from_query_cache)（どちらもデフォルトは `true`）を使うことで、
より詳細に構成できます。前者の設定はクエリ結果をキャッシュに保存するかどうかを制御し、後者の設定はデータベースがクエリ結果をキャッシュから
取得しようとするかどうかを決定します。たとえば、次のクエリはキャッシュを受動的にのみ使用し、すなわちキャッシュからの読み取りは試みますが、
その結果をキャッシュには保存しません。

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, enable_writes_to_query_cache = false;
```

最大限の制御を行うため、通常は `use_query_cache`、`enable_writes_to_query_cache`、`enable_reads_from_query_cache` の各設定は、特定のクエリに対してのみ指定することが推奨されます。`SET use_query_cache = true` のように、USER またはプロファイル単位でキャッシュを有効化することも可能ですが、その場合、すべての `SELECT` クエリがキャッシュされた結果を返す可能性があることに留意する必要があります。

クエリキャッシュは `SYSTEM DROP QUERY CACHE` ステートメントでクリアできます。クエリキャッシュの内容はシステムテーブル
[system.query&#95;cache](system-tables/query_cache.md) に表示されます。データベース起動以降のクエリキャッシュのヒット数とミス数は、システムテーブル [system.events](system-tables/events.md) のイベント &quot;QueryCacheHits&quot; および &quot;QueryCacheMisses&quot; として表示されます。両カウンタは、`use_query_cache = true` が有効な状態で実行される `SELECT` クエリに対してのみ更新され、それ以外のクエリは &quot;QueryCacheMisses&quot; に影響しません。システムテーブル [system.query&#95;log](system-tables/query_log.md) のフィールド `query_cache_usage` は、各実行クエリについて、その結果がクエリキャッシュに書き込まれたか、あるいはクエリキャッシュから読み出されたかを示します。システムテーブル
[system.metrics](system-tables/metrics.md) にあるメトリクス `QueryCacheEntries` および `QueryCacheBytes` は、クエリキャッシュに現在含まれているエントリ数およびバイト数を示します。

クエリキャッシュは ClickHouse サーバープロセスごとに 1 つ存在します。ただし、キャッシュ結果はデフォルトでは USER 間で共有されません。これは（後述のとおり）変更可能ですが、セキュリティ上の理由から推奨されません。

クエリ結果は、そのクエリの [Abstract Syntax Tree (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) によってクエリキャッシュ内で参照されます。これは、キャッシュが大文字・小文字に依存しないことを意味し、例えば `SELECT 1` と `select 1` は同一のクエリとして扱われます。一致処理をより自然にするため、クエリキャッシュおよび [output formatting](settings/settings-formats.md) に関連するすべてのクエリレベルの設定は AST から削除されます。

クエリが例外やユーザーによるキャンセルにより中止された場合、そのエントリはクエリキャッシュに書き込まれません。

クエリキャッシュのサイズ（バイト単位）、キャッシュエントリの最大数、および個々のキャッシュエントリの最大サイズ（バイト数およびレコード数）は、さまざまな[サーバー設定オプション](/operations/server-configuration-parameters/settings#query_cache)を使用して構成できます。


```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

[settings profiles](settings/settings-profiles.md) と [settings
constraints](settings/constraints-on-settings.md) を使用して、個々のユーザーのキャッシュ利用量を制限することもできます。具体的には、ユーザーがクエリキャッシュ内で割り当て可能なメモリの最大量（バイト単位）と、保存できるクエリ結果の最大数を制限できます。そのためには、まず `users.xml` 内のユーザープロファイルで
[query&#95;cache&#95;max&#95;size&#95;in&#95;bytes](/operations/settings/settings#query_cache_max_size_in_bytes) と
[query&#95;cache&#95;max&#95;entries](/operations/settings/settings#query_cache_max_entries) を設定し、その後両方の設定を読み取り専用（readonly）にします。

```xml
<profiles>
    <default>
        <!-- ユーザー／プロファイル 'default' のキャッシュの最大サイズ（バイト単位） -->
        <query_cache_max_size_in_bytes>10000</query_cache_max_size_in_bytes>
        <!-- ユーザー／プロファイル 'default' のキャッシュに保存される SELECT クエリ結果の最大件数 -->
        <query_cache_max_entries>100</query_cache_max_entries>
        <!-- 両方の設定を読み取り専用にして、ユーザーが変更できないようにする -->
        <constraints>
            <query_cache_max_size_in_bytes>
                <readonly/>
            </query_cache_max_size_in_bytes>
            <query_cache_max_entries>
                <readonly/>
            <query_cache_max_entries>
        </constraints>
    </default>
</profiles>
```

クエリ結果をキャッシュ対象とするための最小実行時間を定義するには、設定
[query&#95;cache&#95;min&#95;query&#95;duration](/operations/settings/settings#query_cache_min_query_duration) を使用できます。たとえば、次のクエリの結果は

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, query_cache_min_query_duration = 5000;
```

クエリ結果は、クエリの実行時間が 5 秒より長い場合にのみキャッシュされます。クエリの結果がキャッシュされるまでに、そのクエリを何回実行する必要があるかも指定できます。その場合は設定 [query&#95;cache&#95;min&#95;query&#95;runs](/operations/settings/settings#query_cache_min_query_runs) を使用します。

クエリキャッシュ内のエントリは、一定時間が経過すると古くなります（time-to-live）。デフォルトではこの期間は 60 秒ですが、[query&#95;cache&#95;ttl](/operations/settings/settings#query_cache_ttl) 設定を使って、セッション、プロファイル、またはクエリ単位で別の値を指定できます。クエリキャッシュはエントリを「遅延的に」追い出します。つまり、エントリが古くなっても、キャッシュから即座には削除されません。代わりに、新しいエントリをクエリキャッシュに挿入しようとしたとき、データベースは新しいエントリ用の空き領域がキャッシュ内に十分あるかどうかを確認します。そうでない場合、データベースはすべての古いエントリを削除しようとします。それでもキャッシュに十分な空き領域がない場合は、新しいエントリは挿入されません。

クエリが HTTP 経由で実行される場合、ClickHouse はキャッシュされたエントリの経過時間（秒単位）と有効期限のタイムスタンプを示す `Age` および `Expires` ヘッダーを設定します。

クエリキャッシュ内のエントリは、デフォルトで圧縮されます。これは、クエリキャッシュへの書き込み／読み取りが遅くなる代わりに、全体的なメモリ使用量を削減するためです。圧縮を無効にするには、設定 [query&#95;cache&#95;compress&#95;entries](/operations/settings/settings#query_cache_compress_entries) を使用します。

同じクエリに対して複数の結果をキャッシュしておきたい場合があります。これは、クエリキャッシュエントリのラベル（またはネームスペース）の役割を果たす設定 [query&#95;cache&#95;tag](/operations/settings/settings#query_cache_tag) を使用することで実現できます。クエリキャッシュは、同じクエリでもタグが異なれば、結果を別物として扱います。

同じクエリに対して 3 つの異なるクエリキャッシュエントリを作成する例:

```sql
SELECT 1 SETTINGS use_query_cache = true; -- query_cache_tag は暗黙的に ''（空文字列）になります
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 1';
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 2';
```

クエリキャッシュからタグ `tag` が付いたエントリのみを削除するには、`SYSTEM DROP QUERY CACHE TAG 'tag'` 文を使用します。


ClickHouse はテーブルデータを [max_block_size](/operations/settings/settings#max_block_size) 行ずつのブロック単位で読み取ります。フィルタリングや集約などの処理の結果、
結果ブロックは通常は `max_block_size` よりかなり小さくなりますが、逆に `max_block_size` より大きくなる場合もあります。
[query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results)（デフォルトで有効）の設定は、
結果ブロックが非常に小さい場合に結合したり、非常に大きい場合に分割して、`max_block_size` 行のブロックにしてから
クエリ結果キャッシュに挿入するかどうかを制御します。これによりクエリキャッシュへの書き込み性能は低下しますが、
キャッシュエントリの圧縮率が向上し、後でクエリキャッシュからクエリ結果を提供する際に、より自然なブロック粒度が得られます。

その結果、クエリキャッシュは各クエリに対して複数の（部分的な）結果ブロックを保持します。この動作はデフォルトとしては有用ですが、
設定 [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results) を用いることで抑制できます。

また、非決定的関数を含むクエリの結果はデフォルトではキャッシュされません。このような関数には次のものが含まれます。

- 辞書へアクセスする関数: [`dictGet()`](/sql-reference/functions/ext-dict-functions) など
- XML 定義内で `<deterministic>true</deterministic>` タグを持たない
  [ユーザー定義関数](../sql-reference/statements/create/function.md)
- 現在の日付や時刻を返す関数:
  [`now()`](../sql-reference/functions/date-time-functions.md#now),
  [`today()`](../sql-reference/functions/date-time-functions.md#today),
  [`yesterday()`](../sql-reference/functions/date-time-functions.md#yesterday) など
- ランダムな値を返す関数:
  [`randomString()`](../sql-reference/functions/random-functions.md#randomString),
  [`fuzzBits()`](../sql-reference/functions/random-functions.md#fuzzBits) など
- クエリ処理に使用される内部の chunk のサイズと順序に依存する関数:
  [`nowInBlock()`](../sql-reference/functions/date-time-functions.md#nowInBlock) など、
  [`rowNumberInBlock()`](../sql-reference/functions/other-functions.md#rowNumberInBlock),
  [`runningDifference()`](../sql-reference/functions/other-functions.md#runningDifference),
  [`blockSize()`](../sql-reference/functions/other-functions.md#blockSize) など
- 環境に依存する関数:
  [`currentUser()`](../sql-reference/functions/other-functions.md#currentUser),
  [`queryID()`](/sql-reference/functions/other-functions#queryID),
  [`getMacro()`](../sql-reference/functions/other-functions.md#getMacro) など

それでも非決定的関数を含むクエリの結果を強制的にキャッシュしたい場合は、
設定 [query_cache_nondeterministic_function_handling](/operations/settings/settings#query_cache_nondeterministic_function_handling) を使用します。

system テーブルを含むクエリ（例: [system.processes](system-tables/processes.md) や
[information_schema.tables](system-tables/information_schema.md)）の結果は、デフォルトではキャッシュされません。
system テーブルを含むクエリの結果を強制的にキャッシュしたい場合は、
設定 [query_cache_system_table_handling](/operations/settings/settings#query_cache_system_table_handling) を使用します。

最後に、セキュリティ上の理由から、クエリキャッシュ内のエントリはユーザー間で共有されません。たとえば、ユーザー A は、
ユーザー B に対しては存在しない行ポリシーを、B と同じクエリを実行することによって回避できてはなりません。
ただし必要に応じて、設定
[query_cache_share_between_users](/operations/settings/settings#query_cache_share_between_users) を指定することで、
キャッシュエントリを他のユーザーからアクセス可能（すなわち共有）にすることができます。

## 関連コンテンツ {#related-content}

- ブログ記事: [Introducing the ClickHouse Query Cache](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)