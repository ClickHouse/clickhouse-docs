---
description: 'ClickHouse におけるクエリキャッシュ機能の使用方法と設定に関するガイド'
sidebar_label: 'クエリキャッシュ'
sidebar_position: 65
slug: /operations/query-cache
title: 'クエリキャッシュ'
doc_type: 'guide'
---



# クエリキャッシュ

クエリキャッシュを使用すると、`SELECT` クエリを一度だけ計算し、その後の同一クエリの結果をキャッシュから直接返すことができます。
クエリの種類によっては、これにより ClickHouse サーバーのレイテンシとリソース消費を大幅に削減できます。



## 背景、設計、および制限事項 {#background-design-and-limitations}

クエリキャッシュは一般的に、トランザクション整合性があるものとないものに分類できます。

- トランザクション整合性があるキャッシュでは、`SELECT`クエリの結果が変更された場合、または変更される可能性がある場合に、データベースはキャッシュされたクエリ結果を無効化(破棄)します。ClickHouseでは、データを変更する操作には、テーブルへの挿入/更新/削除、または圧縮マージが含まれます。トランザクション整合性があるキャッシュは、特にOLTPデータベースに適しています。例えば、[MySQL](https://dev.mysql.com/doc/refman/5.6/en/query-cache.html)(v8.0以降でクエリキャッシュを削除)や[Oracle](https://docs.oracle.com/database/121/TGDBA/tune_result_cache.htm)などです。
- トランザクション整合性がないキャッシュでは、すべてのキャッシュエントリに有効期限(例:1分)が設定され、その期間中に基礎データがわずかしか変化しないという前提のもと、クエリ結果にわずかな不正確さが許容されます。このアプローチは全体的にOLAPデータベースにより適しています。トランザクション整合性がないキャッシュで十分な例として、複数のユーザーが同時にアクセスするレポートツールの時間別売上レポートを考えてみましょう。売上データは通常、十分にゆっくりと変化するため、データベースはレポートを一度だけ計算すればよく(最初の`SELECT`クエリで表される)、それ以降のクエリはクエリキャッシュから直接提供できます。この例では、妥当な有効期限は30分程度です。

トランザクション整合性がないキャッシュは、従来、データベースと連携するクライアントツールやプロキシパッケージ(例:[chproxy](https://www.chproxy.org/configuration/caching/))によって提供されてきました。その結果、同じキャッシュロジックと設定が重複することがよくありました。ClickHouseのクエリキャッシュでは、キャッシュロジックがサーバー側に移行します。これにより、保守作業が軽減され、冗長性が回避されます。


## 設定とその使用方法 {#configuration-settings-and-usage}

:::note
ClickHouse Cloudでは、クエリキャッシュの設定を編集するために[クエリレベル設定](/operations/settings/query-level)を使用する必要があります。[設定ファイルレベルの設定](/operations/configuration-files)の編集は現在サポートされていません。
:::

:::note
[clickhouse-local](utilities/clickhouse-local.md)は一度に1つのクエリのみを実行します。クエリ結果のキャッシュは意味をなさないため、clickhouse-localではクエリ結果キャッシュが無効になっています。
:::

設定[use_query_cache](/operations/settings/settings#use_query_cache)を使用して、特定のクエリまたは現在のセッションのすべてのクエリがクエリキャッシュを利用するかどうかを制御できます。例えば、次のクエリの最初の実行では

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true;
```

クエリ結果がクエリキャッシュに保存されます。同じクエリの後続の実行（同様に`use_query_cache = true`パラメータを指定）では、計算された結果がキャッシュから読み取られ、即座に返されます。

:::note
設定`use_query_cache`およびその他すべてのクエリキャッシュ関連の設定は、独立した`SELECT`文に対してのみ効果があります。特に、`CREATE VIEW AS SELECT [...] SETTINGS use_query_cache = true`で作成されたビューへの`SELECT`の結果は、`SELECT`文が`SETTINGS use_query_cache = true`で実行されない限りキャッシュされません。
:::

キャッシュの利用方法は、設定[enable_writes_to_query_cache](/operations/settings/settings#enable_writes_to_query_cache)と[enable_reads_from_query_cache](/operations/settings/settings#enable_reads_from_query_cache)（両方ともデフォルトで`true`）を使用してより詳細に設定できます。前者の設定はクエリ結果がキャッシュに保存されるかどうかを制御し、後者の設定はデータベースがキャッシュからクエリ結果を取得しようとするかどうかを決定します。例えば、次のクエリはキャッシュを受動的にのみ使用します。つまり、キャッシュからの読み取りは試みますが、結果をキャッシュに保存しません：

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, enable_writes_to_query_cache = false;
```

最大限の制御を行うには、設定`use_query_cache`、`enable_writes_to_query_cache`、`enable_reads_from_query_cache`を特定のクエリに対してのみ指定することが一般的に推奨されます。ユーザーレベルまたはプロファイルレベルでキャッシュを有効にすること（例：`SET use_query_cache = true`経由）も可能ですが、その場合すべての`SELECT`クエリがキャッシュされた結果を返す可能性があることに留意する必要があります。

クエリキャッシュは`SYSTEM DROP QUERY CACHE`文を使用してクリアできます。クエリキャッシュの内容はシステムテーブル[system.query_cache](system-tables/query_cache.md)に表示されます。データベース起動以降のクエリキャッシュのヒット数とミス数は、システムテーブル[system.events](system-tables/events.md)のイベント「QueryCacheHits」と「QueryCacheMisses」として表示されます。両方のカウンターは、設定`use_query_cache = true`で実行される`SELECT`クエリに対してのみ更新され、その他のクエリは「QueryCacheMisses」に影響しません。システムテーブル[system.query_log](system-tables/query_log.md)のフィールド`query_cache_usage`は、実行された各クエリについて、クエリ結果がクエリキャッシュに書き込まれたか、またはクエリキャッシュから読み取られたかを示します。システムテーブル[system.metrics](system-tables/metrics.md)のメトリクス`QueryCacheEntries`と`QueryCacheBytes`は、クエリキャッシュが現在含んでいるエントリ数とバイト数を示します。

クエリキャッシュはClickHouseサーバープロセスごとに1つ存在します。ただし、キャッシュ結果はデフォルトではユーザー間で共有されません。これは変更可能ですが（後述）、セキュリティ上の理由から推奨されません。

クエリ結果は、クエリの[抽象構文木（AST）](https://en.wikipedia.org/wiki/Abstract_syntax_tree)によってクエリキャッシュ内で参照されます。これは、キャッシュが大文字・小文字を区別しないことを意味します。例えば、`SELECT 1`と`select 1`は同じクエリとして扱われます。マッチングをより自然にするため、クエリキャッシュに関連するすべてのクエリレベル設定と[出力フォーマット](settings/settings-formats.md)の設定はASTから除外されます。

例外またはユーザーによるキャンセルによってクエリが中止された場合、クエリキャッシュにエントリは書き込まれません。

クエリキャッシュのバイト単位のサイズ、キャッシュエントリの最大数、および個々のキャッシュエントリの最大サイズ（バイト単位およびレコード単位）は、さまざまな[サーバー設定オプション](/operations/server-configuration-parameters/settings#query_cache)を使用して設定できます。


```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

[settings profiles](settings/settings-profiles.md) と [settings
constraints](settings/constraints-on-settings.md) を使用して、個々のユーザーごとにキャッシュ使用量を制限することもできます。具体的には、クエリキャッシュ内でユーザーが割り当て可能なメモリの最大量（バイト単位）や、保存されるクエリ結果の最大数を制限できます。そのためには、まず `users.xml` 内のユーザープロファイルで
[query&#95;cache&#95;max&#95;size&#95;in&#95;bytes](/operations/settings/settings#query_cache_max_size_in_bytes) と
[query&#95;cache&#95;max&#95;entries](/operations/settings/settings#query_cache_max_entries) を設定し、そのうえで両方の設定を
readonly にします。

```xml
<profiles>
    <default>
        <!-- ユーザー/プロファイル 'default' の最大キャッシュサイズ(バイト単位) -->
        <query_cache_max_size_in_bytes>10000</query_cache_max_size_in_bytes>
        <!-- ユーザー/プロファイル 'default' のキャッシュに格納されるSELECTクエリ結果の最大数 -->
        <query_cache_max_entries>100</query_cache_max_entries>
        <!-- 両方の設定を読み取り専用にし、ユーザーが変更できないようにする -->
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

クエリの結果をキャッシュ対象とするために、そのクエリが少なくともどの程度の時間実行されている必要があるかを指定するには、設定
[query&#95;cache&#95;min&#95;query&#95;duration](/operations/settings/settings#query_cache_min_query_duration) を使用できます。たとえば、次のクエリの結果は

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, query_cache_min_query_duration = 5000;
```

は、クエリの実行時間が 5 秒を超えた場合にのみキャッシュされます。クエリの結果がキャッシュされるまでに、そのクエリを何回実行する必要があるかを指定することもできます。その場合は、設定 [query&#95;cache&#95;min&#95;query&#95;runs](/operations/settings/settings#query_cache_min_query_runs) を使用します。

クエリキャッシュ内のエントリは、一定時間が経過すると期限切れ（stale）になります（TTL: time-to-live）。デフォルトでは、この期間は 60 秒ですが、設定 [query&#95;cache&#95;ttl](/operations/settings/settings#query_cache_ttl) を使用して、セッション、プロファイル、またはクエリ単位で異なる値を指定できます。クエリキャッシュはエントリを「遅延（lazy）」方式で削除します。つまり、エントリが期限切れになっても、すぐにはキャッシュから削除されません。代わりに、新しいエントリをクエリキャッシュに挿入しようとしたとき、データベースは新しいエントリ用の空き容量がキャッシュに十分あるかどうかを確認します。十分でない場合、データベースはすべての期限切れエントリを削除しようとします。それでもキャッシュに十分な空き容量がない場合、新しいエントリは挿入されません。

クエリキャッシュ内のエントリは、デフォルトで圧縮されます。これにより、クエリキャッシュ全体のメモリ消費量が削減されますが、その代わりにクエリキャッシュへの書き込み／読み出しは遅くなります。圧縮を無効にするには、設定 [query&#95;cache&#95;compress&#95;entries](/operations/settings/settings#query_cache_compress_entries) を使用します。

同じクエリに対して複数の結果をキャッシュしておきたい場合があります。これは、クエリキャッシュエントリのラベル（または名前空間）のように機能する設定 [query&#95;cache&#95;tag](/operations/settings/settings#query_cache_tag) を使用することで実現できます。クエリキャッシュは、同じクエリであってもタグが異なる結果は別物として扱います。

同じクエリに対して 3 つの異なるクエリキャッシュエントリを作成する例:

```sql
SELECT 1 SETTINGS use_query_cache = true; -- query_cache_tagは暗黙的に''(空文字列)です
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 1';
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 2';
```

クエリキャッシュからタグ `tag` の付いたエントリだけを削除するには、`SYSTEM DROP QUERY CACHE TAG 'tag'` ステートメントを使用できます。


ClickHouse はテーブルデータを [max_block_size](/operations/settings/settings#max_block_size) 行のブロック単位で読み込みます。フィルタリングや集約などにより、
結果ブロックは通常は `max_block_size` よりかなり小さくなりますが、場合によってはそれよりも大きくなることもあります。
[query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results)（デフォルトで有効）は、結果ブロックがクエリ結果
キャッシュに挿入される前に、ブロックが非常に小さい場合にはまとめ、大きい場合には `max_block_size` のサイズのブロックに分割するかどうかを制御します。
これによりクエリキャッシュへの書き込み性能は低下しますが、キャッシュエントリの圧縮率が向上し、後でクエリキャッシュからクエリ結果を返す際の
ブロック粒度がより自然になります。

その結果、クエリキャッシュは各クエリに対して複数の（部分的な）結果ブロックを保存します。この挙動はデフォルトとしては有用ですが、設定
[query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results) を用いて抑制できます。

また、非決定的関数を含むクエリの結果はデフォルトではキャッシュされません。そのような関数には次のものが含まれます。
- 辞書へのアクセス用関数: [`dictGet()`](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) など
- XML 定義内にタグ `<deterministic>true</deterministic>` を持たない [ユーザー定義関数](../sql-reference/statements/create/function.md)
- 現在の日付や時刻を返す関数: [`now()`](../sql-reference/functions/date-time-functions.md#now),
  [`today()`](../sql-reference/functions/date-time-functions.md#today),
  [`yesterday()`](../sql-reference/functions/date-time-functions.md#yesterday) など
- ランダムな値を返す関数: [`randomString()`](../sql-reference/functions/random-functions.md#randomString),
  [`fuzzBits()`](../sql-reference/functions/random-functions.md#fuzzBits) など
- クエリ処理に用いられる内部チャンクのサイズや順序に結果が依存する関数:
  [`nowInBlock()`](../sql-reference/functions/date-time-functions.md#nowInBlock) など、
  [`rowNumberInBlock()`](../sql-reference/functions/other-functions.md#rowNumberInBlock),
  [`runningDifference()`](../sql-reference/functions/other-functions.md#runningDifference),
  [`blockSize()`](../sql-reference/functions/other-functions.md#blockSize) など
- 環境に依存する関数: [`currentUser()`](../sql-reference/functions/other-functions.md#currentUser),
  [`queryID()`](/sql-reference/functions/other-functions#queryID),
  [`getMacro()`](../sql-reference/functions/other-functions.md#getMacro) など。

非決定的関数を含むクエリの結果を、デフォルト設定に関係なく強制的にキャッシュしたい場合は、
[query_cache_nondeterministic_function_handling](/operations/settings/settings#query_cache_nondeterministic_function_handling) 設定を使用します。

system テーブル（例: [system.processes](system-tables/processes.md) や
[information_schema.tables](system-tables/information_schema.md)）を含むクエリの結果は、デフォルトではキャッシュされません。
system テーブルを含むクエリの結果を強制的にキャッシュしたい場合は、
[query_cache_system_table_handling](/operations/settings/settings#query_cache_system_table_handling) 設定を使用します。

最後に、セキュリティ上の理由から、クエリキャッシュ内のエントリはユーザー間で共有されません。例えば、ユーザー A が、行ポリシーが存在しない別の
ユーザー B と同じクエリを実行することで、あるテーブル上の行ポリシーを回避できてはなりません。しかし、必要であれば、
[query_cache_share_between_users](/operations/settings/settings#query_cache_share_between_users) 設定を指定することで、キャッシュエントリを他のユーザー
からアクセス可能（すなわち共有）としてマークできます。



## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseクエリキャッシュの紹介](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)
