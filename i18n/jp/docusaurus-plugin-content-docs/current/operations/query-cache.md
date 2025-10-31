---
'description': 'ClickHouseでのクエリキャッシュ機能の使用と設定に関するガイド'
'sidebar_label': 'クエリキャッシュ'
'sidebar_position': 65
'slug': '/operations/query-cache'
'title': 'クエリキャッシュ'
'doc_type': 'guide'
---


# クエリキャッシュ

クエリキャッシュは、`SELECT` クエリを一度だけ計算し、同じクエリのさらなる実行をキャッシュから直接提供することを可能にします。クエリのタイプによっては、これにより ClickHouse サーバーのレイテンシとリソース消費が大幅に減少することがあります。

## 背景、設計と制限 {#background-design-and-limitations}

一般的に、クエリキャッシュはトランザクション的に一貫したものと、一貫していないものに分けることができます。

- トランザクション的に一貫したキャッシュでは、`SELECT` クエリの結果が変更された場合、または変更される可能性がある場合、データベースはキャッシュされたクエリ結果を無効化（破棄）します。ClickHouse では、データを変更する操作には、テーブルへの挿入/更新/削除や、崩壊マージが含まれます。トランザクション的に一貫したキャッシングは、特に OLTP データベースに適しています。たとえば、[MySQL](https://dev.mysql.com/doc/refman/5.6/en/query-cache.html)（v8.0 以降にクエリキャッシュが削除されました）や、[Oracle](https://docs.oracle.com/database/121/TGDBA/tune_result_cache.htm)などです。
- トランザクション的に一貫していないキャッシュでは、クエリ結果のわずかな不正確さが許容され、すべてのキャッシュエントリには、有効期限（例：1分）が割り当てられ、この期間中に基礎データがわずかにしか変更されないと仮定されます。このアプローチは全体として OLAP データベースにより適しています。トランザクション的に一貫していないキャッシングが十分である例として、複数のユーザーが同時にアクセスするレポートツールでの時間毎の売上レポートを考えてください。売上データは通常、データベースがレポートを一度（最初の `SELECT` クエリで）計算するだけで済むほど遅く変更されます。以降のクエリはクエリキャッシュから直接提供されます。この例では、合理的な有効期限は30分になるでしょう。

トランザクション的に一貫していないキャッシングは、従来、データベースと対話するクライアントツールやプロキシパッケージ（例：[chproxy](https://www.chproxy.org/configuration/caching/)）によって提供されてきました。その結果、同じキャッシングロジックと設定がしばしば複製されます。ClickHouse のクエリキャッシュでは、キャッシングロジックがサーバー側に移動します。これにより、メンテナンス負担が軽減され、冗長性が回避されます。

## 設定と使用法 {#configuration-settings-and-usage}

:::note
ClickHouse Cloud では、クエリキャッシュ設定を編集するには、[クエリレベル設定](/operations/settings/query-level)を使用する必要があります。[設定レベル設定](/operations/configuration-files)の編集は現在サポートされていません。
:::

:::note
[clickhouse-local](utilities/clickhouse-local.md) は一度に一つのクエリを実行します。クエリ結果のキャッシングは意味を持たないため、clickhouse-local ではクエリ結果キャッシュが無効になります。
:::

設定 [use_query_cache](/operations/settings/settings#use_query_cache) を使用すると、特定のクエリまたは現在のセッションのすべてのクエリがクエリキャッシュを利用するかどうかを制御できます。たとえば、クエリの最初の実行

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true;
```

は、クエリ結果をクエリキャッシュに保存します。同じクエリの以降の実行（パラメータ `use_query_cache = true` を使用する場合も含む）は、キャッシュから計算された結果を読み込み、即座に返します。

:::note
`use_query_cache` とその他のクエリキャッシュ関連の設定は、スタンドアロンの `SELECT` 文にのみ影響します。特に、`CREATE VIEW AS SELECT [...] SETTINGS use_query_cache = true` で作成されたビューへの `SELECT` の結果は、`SELECT` 文が `SETTINGS use_query_cache = true` で実行されない限りキャッシュされません。
:::

キャッシュの利用方法は、設定 [enable_writes_to_query_cache](/operations/settings/settings#enable_writes_to_query_cache) と [enable_reads_from_query_cache](/operations/settings/settings#enable_reads_from_query_cache) を使用してより詳細に構成できます（どちらもデフォルトで `true`）。前者の設定は、クエリ結果がキャッシュに保存されるかどうかを制御し、後者の設定は、データベースがキャッシュからクエリ結果を取得しようと試みるかどうかを決定します。たとえば、次のクエリはキャッシュを受動的に使用します。つまり、読み取ろうとしますが、結果をキャッシュに保存しません：

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, enable_writes_to_query_cache = false;
```

最大限の制御を得るためには、一般的に特定のクエリに対してのみ `use_query_cache`、`enable_writes_to_query_cache`、`enable_reads_from_query_cache` の設定を提供することをお勧めします。ユーザーまたはプロファイルレベルでキャッシュを有効にすることも可能ですが（例：`SET use_query_cache = true` を介して）、すべての `SELECT` クエリがその場合にキャッシュされた結果を返すことに留意すべきです。

クエリキャッシュは、ステートメント `SYSTEM DROP QUERY CACHE` を使用してクリアできます。クエリキャッシュの内容は、システムテーブル [system.query_cache](system-tables/query_cache.md) に表示されます。データベース開始以来のクエリキャッシュのヒット数とミス数は、システムテーブル [system.events](system-tables/events.md) にイベント "QueryCacheHits" と "QueryCacheMisses" として表示されます。両方のカウンターは、設定 `use_query_cache = true` で実行される `SELECT` クエリのみが更新されます。他のクエリは "QueryCacheMisses" に影響を与えません。システムテーブル [system.query_log](system-tables/query_log.md) のフィールド `query_cache_usage` は、実行された各クエリについて、クエリ結果がクエリキャッシュに書き込まれたか、または読み込まれたかを示します。システムテーブル [system.metrics](system-tables/metrics.md) のメトリクス `QueryCacheEntries` と `QueryCacheBytes` は、クエリキャッシュが現在どれだけのエントリ/バイトを含んでいるかを示します。

クエリキャッシュは、ClickHouse サーバープロセスごとに一度存在します。ただし、デフォルトではキャッシュ結果はユーザー間で共有されません。これを変更することも可能ですが（以下参照）、安全上の理由から推奨されません。

クエリキャッシュ内のクエリ結果は、それらのクエリの [抽象構文木 (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) によって参照されます。これは、キャッシングが大文字と小文字に依存しないことを意味します。たとえば、`SELECT 1` と `select 1` は同じクエリとして扱われます。マッチングをより自然にするために、クエリキャッシュに関連するすべてのクエリレベル設定は、AST から削除されます。

クエリが例外またはユーザーキャンセルによって中止された場合、キャッシュにはエントリは書かれません。

クエリキャッシュのサイズ（バイトで）、最大キャッシュエントリ数、および個々のキャッシュエントリの最大サイズ（バイトおよびレコードで）は、さまざまな [サーバー設定オプション](/operations/server-configuration-parameters/settings#query_cache) を使用して構成できます。

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

個々のユーザーのキャッシュ使用量を制限することも、[設定プロファイル](settings/settings-profiles.md)および [設定の制約](settings/constraints-on-settings.md)を使用して行うことができます。具体的には、ユーザーがクエリキャッシュに割り当てることができる最大メモリ量（バイト単位）と、最大保存クエリ結果数を制限できます。そのためには、まず `users.xml` のユーザープロファイルに設定 [query_cache_max_size_in_bytes](/operations/settings/settings#query_cache_max_size_in_bytes) と [query_cache_max_entries](/operations/settings/settings#query_cache_max_entries) を提供し、その後両方の設定を読み取り専用にします：

```xml
<profiles>
    <default>
        <!-- The maximum cache size in bytes for user/profile 'default' -->
        <query_cache_max_size_in_bytes>10000</query_cache_max_size_in_bytes>
        <!-- The maximum number of SELECT query results stored in the cache for user/profile 'default' -->
        <query_cache_max_entries>100</query_cache_max_entries>
        <!-- Make both settings read-only so the user cannot change them -->
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

クエリの結果がキャッシュ可能であるために、少なくともどのくらいの時間クエリを実行する必要があるかを定義するには、設定 [query_cache_min_query_duration](/operations/settings/settings#query_cache_min_query_duration) を使用できます。たとえば、クエリ

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, query_cache_min_query_duration = 5000;
```

の結果は、クエリが5秒以上実行された場合にのみキャッシュされます。クエリがキャッシュされるまでに、どのくらいの頻度で実行される必要があるかを指定することも可能です。その場合は設定 [query_cache_min_query_runs](/operations/settings/settings#query_cache_min_query_runs) を使用します。

クエリキャッシュ内のエントリは、一定の期間（有効期限）経過後に古くなります。デフォルトでは、この期間は60秒ですが、セッション、プロファイル、またはクエリレベルで設定 [query_cache_ttl](/operations/settings/settings#query_cache_ttl) を使用して異なる値を指定できます。クエリキャッシュは、エントリを「遅延的に」削除します。つまり、エントリが古くなるとすぐにキャッシュから取り除かれるのではなく、新しいエントリがクエリキャッシュに挿入される際に、データベースは新しいエントリのためにキャッシュが十分な空き容量を持っているかどうかを確認します。これが満たされていない場合、データベースは古いエントリをすべて削除しようとします。それでもキャッシュに十分な空きスペースがない場合、新しいエントリは挿入されません。

クエリキャッシュ内のエントリはデフォルトで圧縮されます。これにより、クエリキャッシュへの書き込み/読み取りの速度は遅くなるものの、全体のメモリ消費が減少します。圧縮を無効にするには、設定 [query_cache_compress_entries](/operations/settings/settings#query_cache_compress_entries) を使用します。

同じクエリに対して複数の結果をキャッシュしておくことが有用な場合があります。これは、設定 [query_cache_tag](/operations/settings/settings#query_cache_tag) を使用することによって実現できます。これはクエリキャッシュエントリのラベル（またはネームスペース）として機能します。クエリキャッシュは、異なるタグを持つ同じクエリの結果を異なるものと見なします。

同じクエリに対して3つの異なるクエリキャッシュエントリを作成する例：

```sql
SELECT 1 SETTINGS use_query_cache = true; -- query_cache_tag is implicitly '' (empty string)
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 1';
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 2';
```

クエリキャッシュから `tag` タグのエントリのみを削除するには、ステートメント `SYSTEM DROP QUERY CACHE TAG 'tag'` を使用できます。

ClickHouse は、[max_block_size](/operations/settings/settings#max_block_size) 行のブロックでテーブルデータを読み取ります。フィルタリング、集約などのために、結果ブロックは通常「max_block_size」よりもはるかに小さくなりますが、大きくなるケースもあります。設定 [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results)（デフォルトで有効）は、クエリ結果キャッシュに挿入する前に、結果ブロックが「小さい」場合は潰し（スカッシュ）、大きい場合は「max_block_size」サイズのブロックに分割するかどうかを制御します。この設定により、クエリキャッシュへの書き込みのパフォーマンスが低下しますが、キャッシュエントリの圧縮率が向上し、クエリ結果が後でクエリキャッシュから提供される際により自然なブロックの粒度が提供されます。

結果として、クエリキャッシュは各クエリのために複数の（部分的な）結果ブロックを保存します。この動作はデフォルトとしては良好ですが、設定 [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results) を使用して抑制することができます。

また、非決定論的関数を含むクエリの結果はデフォルトでキャッシュされません。そのような関数には以下が含まれます：
- 辞書にアクセスするための関数：[ `dictGet()` ](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) など。
- タグ `<deterministic>true</deterministic>` が XML 定義にない [ユーザー定義関数](../sql-reference/statements/create/function.md)。
- 現在の日付や時間を返す関数：[ `now()` ](../sql-reference/functions/date-time-functions.md#now)、[ `today()` ](../sql-reference/functions/date-time-functions.md#today)、[ `yesterday()` ](../sql-reference/functions/date-time-functions.md#yesterday) など。
- ランダム値を返す関数：[ `randomString()` ](../sql-reference/functions/random-functions.md#randomString)、[ `fuzzBits()` ](../sql-reference/functions/random-functions.md#fuzzBits) など。
- クエリ処理に使用される内部チャンクのサイズや順序に依存する関数：[ `nowInBlock()` ](../sql-reference/functions/date-time-functions.md#nowInBlock) など、[ `rowNumberInBlock()` ](../sql-reference/functions/other-functions.md#rowNumberInBlock)、[ `runningDifference()` ](../sql-reference/functions/other-functions.md#runningDifference)、[ `blockSize()` ](../sql-reference/functions/other-functions.md#blockSize) など。
- 環境に依存する関数：[ `currentUser()` ](../sql-reference/functions/other-functions.md#currentUser)、[ `queryID()` ](/sql-reference/functions/other-functions#queryid)、[ `getMacro()` ](../sql-reference/functions/other-functions.md#getMacro) など。

非決定論的関数を含むクエリの結果を強制的にキャッシュしたい場合は、設定 [query_cache_nondeterministic_function_handling](/operations/settings/settings#query_cache_nondeterministic_function_handling) を使用します。

システムテーブル（例：[system.processes](system-tables/processes.md) などや [information_schema.tables](system-tables/information_schema.md)）を含むクエリの結果はデフォルトでキャッシュされません。システムテーブルの結果をキャッシュすることを強制するには、設定 [query_cache_system_table_handling](/operations/settings/settings#query_cache_system_table_handling) を使用します。

最後に、セキュリティ上の理由から、クエリキャッシュ内のエントリはユーザー間で共有されません。たとえば、ユーザー A は、別のユーザー B のために存在しない行ポリシーを回避して、同じクエリを実行することはできません。ただし、必要に応じて、設定 [query_cache_share_between_users](/operations/settings/settings#query_cache_share_between_users) を提供することにより、他のユーザー（すなわち共有可能）にエントリをマークすることができます。

## 関連コンテンツ {#related-content}

- ブログ：[ClickHouse クエリキャッシュの紹介](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)
