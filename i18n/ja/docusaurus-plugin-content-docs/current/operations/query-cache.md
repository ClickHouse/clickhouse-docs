---
slug: /operations/query-cache
sidebar_position: 65
sidebar_label: クエリキャッシュ
---

# クエリキャッシュ

クエリキャッシュは、`SELECT` クエリを一度だけ計算し、その後の同じクエリの実行をキャッシュから直接提供できるようにします。クエリの種類に応じて、これにより ClickHouse サーバーのレイテンシとリソース消費を劇的に削減できます。

## 背景、設計、制限事項 {#background-design-and-limitations}

クエリキャッシュは一般的に、トランザクショナルに一貫したものと一貫していないものに分類することができます。

- トランザクショナルに一貫したキャッシュでは、`SELECT` クエリの結果が変更される、または変更される可能性がある場合、データベースはキャッシュされたクエリ結果を無効化します (破棄します)。ClickHouse において、データを変更する操作には、テーブルへの挿入/更新/削除や、複数のマージが含まれます。トランザクショナルに一貫したキャッシングは、OLTP データベースに特に適しています。例えば、[MySQL](https://dev.mysql.com/doc/refman/5.6/en/query-cache.html)（v8.0 以降にクエリキャッシュを削除）や、[Oracle](https://docs.oracle.com/database/121/TGDBA/tune_result_cache.htm) などです。
- トランザクショナルに一貫していないキャッシュでは、クエリ結果にわずかな不正確さが許容されており、すべてのキャッシュエントリに有効期限が割り当てられ、その後は期限切れになる（例：1分）という前提があります。この期間中に基になるデータがほとんど変わらないという仮定が成り立ちます。このアプローチは、全体として OLAP データベースにより適しています。トランザクショナルに一貫していないキャッシングが十分とされる例として、複数のユーザーが同時にアクセスするレポートツールにおける時刻ごとの売上レポートを考えてみてください。売上データは通常、データベースがレポートを一度（最初の `SELECT` クエリを表現）計算するだけで済むほど、十分にゆっくりと変化します。以降のクエリはキャッシュから直接提供されます。この例では、合理的な有効期限は30分かもしれません。

トランザクショナルに一貫していないキャッシングは、従来からクライアントツールやプロキシパッケージ（例：[chproxy](https://www.chproxy.org/configuration/caching/)）によってデータベースと連携し提供されています。その結果、同じキャッシングロジックと設定が一般的に重複します。ClickHouseのクエリキャッシュを使用することで、キャッシングロジックはサーバー側に移行します。これによりメンテナンスの手間が削減され、冗長性が回避されます。

## 設定と使用法 {#configuration-settings-and-usage}

:::note
ClickHouse Cloud では、[クエリレベル設定](/operations/settings/query-level)を使用してクエリキャッシュ設定を編集する必要があります。[設定レベル設定](/operations/configuration-files)を編集することは現在サポートされていません。
:::

設定 [use_query_cache](settings/settings.md#use-query-cache) を使用すると、特定のクエリまたは現在のセッションのすべてのクエリがクエリキャッシュを利用するかどうかを制御できます。たとえば、次のクエリの最初の実行は

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true;
```

クエリ結果をクエリキャッシュに保存します。以後の同じクエリ（パラメータ `use_query_cache = true` も含む）の実行は、キャッシュから計算結果を読み取り、すぐに返します。

:::note
設定 `use_query_cache` および他のすべてのクエリキャッシュ関連設定は、スタンドアロンの `SELECT` 文にのみ影響します。特に、`CREATE VIEW AS SELECT [...] SETTINGS use_query_cache = true` で作成されたビューの `SELECT` の結果は、`SELECT` 文が `SETTINGS use_query_cache = true` で実行されない限りキャッシュされません。
:::

キャッシュの使用方法は、設定 [enable_writes_to_query_cache](settings/settings.md#enable-writes-to-query-cache) および [enable_reads_from_query_cache](settings/settings.md#enable-reads-from-query-cache) を使用して、より詳細に構成できます（どちらもデフォルトで `true`）。前者の設定は、クエリ結果がキャッシュに保存されるかどうかを制御し、後者の設定はデータベースがキャッシュからクエリ結果を取得しようとするかどうかを決定します。たとえば、以下のクエリはキャッシュを受動的に使用し、すなわちキャッシュから読み取ろうとしますが、その結果をキャッシュには保存しません：

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, enable_writes_to_query_cache = false;
```

最大限の制御を行うには、一般的に設定 `use_query_cache`、`enable_writes_to_query_cache` および `enable_reads_from_query_cache` を特定のクエリにのみ提供することをお勧めします。ユーザーまたはプロファイルレベルでキャッシングを有効にすることも可能ですが（例：`SET use_query_cache = true`）、その場合はすべての `SELECT` クエリがキャッシュされた結果を返す可能性があることに注意してください。

クエリキャッシュはステートメント `SYSTEM DROP QUERY CACHE` を使用してクリアできます。クエリキャッシュの内容はシステムテーブル [system.query_cache](system-tables/query_cache.md) に表示されます。データベース起動以来のクエリキャッシュのヒット数とミス数は、システムテーブル [system.events](system-tables/events.md) のイベント "QueryCacheHits" および "QueryCacheMisses" として表示されます。これらのカウンターは、設定 `use_query_cache = true` で実行される `SELECT` クエリのみに更新され、他のクエリは "QueryCacheMisses" に影響しません。システムテーブル [system.query_log](system-tables/query_log.md) のフィールド `query_cache_usage` は、各実行されたクエリがクエリキャッシュに書き込まれたかまたは読み取られたかを示します。システムテーブル [system.asynchronous_metrics](system-tables/asynchronous_metrics.md) の非同期メトリクス "QueryCacheEntries" および "QueryCacheBytes" は、クエリキャッシュが現在持っているエントリ数/バイト数を示します。

クエリキャッシュは ClickHouse サーバープロセスごとに一度だけ存在します。ただし、キャッシュ結果はデフォルトではユーザー間で共有されません。これは変更することができますが（以下を参照）、セキュリティ上の理由から推奨されません。

クエリ結果は、そのクエリの [抽象構文木 (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) によってクエリキャッシュに参照されます。これは、キャッシングが大文字と小文字に無関係であることを意味します。たとえば、`SELECT 1` と `select 1` は同じクエリとして扱われます。より自然なマッチングを実現するために、クエリキャッシュに関連するすべてのクエリレベル設定は AST から除外されます。

クエリが例外やユーザーキャンセルのために中止された場合、クエリキャッシュにはエントリは書き込まれません。

クエリキャッシュのバイトサイズ、最大キャッシュエントリ数、および個々のキャッシュエントリの最大サイズ（バイトおよびレコード単位）は、さまざまな [サーバー設定オプション](server-configuration-parameters/settings.md#server_configuration_parameters_query-cache) を使用して構成できます。

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

個々のユーザーのキャッシュ使用を制限することも、[設定プロファイル](settings/settings-profiles.md)や [設定制約](settings/constraints-on-settings.md)を使用して可能です。より具体的には、ユーザーがクエリキャッシュに割り当てることができる最大メモリ量（バイト単位）と最大の保存クエリ結果数を制限することができます。そのためには、まずユーザープロファイル中の `users.xml` で設定 [query_cache_max_size_in_bytes](settings/settings.md#query-cache-max-size-in-bytes) と [query_cache_max_entries](settings/settings.md#query-cache-max-entries) を提供し、次に両方の設定を読み取り専用にします：

```xml
<profiles>
    <default>
        <!-- ユーザー/プロファイル 'default' の最大キャッシュサイズ（バイト単位） -->
        <query_cache_max_size_in_bytes>10000</query_cache_max_size_in_bytes>
        <!-- ユーザー/プロファイル 'default' のキャッシュに保存される最大の SELECT クエリ結果数 -->
        <query_cache_max_entries>100</query_cache_max_entries>
        <!-- ユーザー側で変更できないように両方の設定を読み取り専用にします -->
        <constraints>
            <query_cache_max_size_in_bytes>
                <readonly/>
            </query_cache_max_size_in_bytes>
            <query_cache_max_entries>
                <readonly/>
            </query_cache_max_entries>
        </constraints>
    </default>
</profiles>
```

クエリの結果をキャッシュできるようにするために、クエリが最低でもどれだけの時間実行される必要があるかを定義するには、設定 [query_cache_min_query_duration](settings/settings.md#query-cache-min-query-duration) を使用できます。たとえば、次のクエリの結果は

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, query_cache_min_query_duration = 5000;
```

クエリが5秒以上実行されている場合にのみキャッシュされます。また、クエリが結果をキャッシュするまでにどれだけ実行される必要があるかを指定することも可能です。そのためには、設定 [query_cache_min_query_runs](settings/settings.md#query-cache-min-query-runs) を使用します。

クエリキャッシュのエントリは特定の期間（有効期限）の後に古くなります。デフォルトでは、この期間は60秒ですが、異なる値をセッション、プロファイル、またはクエリレベルで設定することができます。これには設定 [query_cache_ttl](settings/settings.md#query-cache-ttl) を使用します。クエリキャッシュは、エントリが古くなったときに「遅延的に」エントリを排出します。つまり、エントリが古くなった場合、すぐにキャッシュから削除されるわけではありません。代わりに、新しいエントリをクエリキャッシュに挿入する際に、データベースは新しいエントリのためにキャッシュに十分な空きスペースがあるかどうかを確認します。これが成立しない場合、データベースはすべての古いエントリを削除しようとします。それでもなおキャッシュに十分な空きスペースがない場合、新しいエントリは挿入されません。

クエリキャッシュのエントリは、デフォルトで圧縮されます。これにより、全体的なメモリ消費は減少しますが、クエリキャッシュへの書き込みおよび読み取り速度は遅くなります。圧縮を無効にするには、設定 [query_cache_compress_entries](settings/settings.md#query-cache-compress-entries) を使用します。

同じクエリに対して複数の結果をキャッシュしておくことが役立つ場合があります。これを実現するためには、設定 [query_cache_tag](settings/settings.md#query-cache-tag) を使用します。これはクエリキャッシュエントリに対するラベル（または名前空間）のように機能します。同じクエリの結果が異なるタグを持つ場合、これらは異なると見なされます。

同じクエリに対して3つの異なるクエリキャッシュエントリを作成する例：

```sql
SELECT 1 SETTINGS use_query_cache = true; -- query_cache_tag は暗黙的に '' (空文字列) です
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 1';
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 2';
```

タグ `tag` を持つエントリのみをクエリキャッシュから削除するには、ステートメント `SYSTEM DROP QUERY CACHE TAG 'tag'` を使用できます。

ClickHouse は [max_block_size](settings/settings.md#setting-max_block_size) 行のブロックでテーブルデータを読み取ります。フィルタリング、集計、等により、結果のブロックは通常 'max_block_size' よりもかなり小さいですが、場合によってははるかに大きくなることもあります。設定 [query_cache_squash_partial_results](settings/settings.md#query-cache-squash-partial-results) （デフォルトでは有効）は、結果のブロックがクエリ結果キャッシュに挿入される前に、小さい場合には圧縮され（小さければ）、大きい場合には 'max_block_size' サイズのブロックに分割されるかどうかを制御します。これにより、クエリキャッシュへの書き込みパフォーマンスが低下しますが、キャッシュエントリの圧縮率が改善し、後でクエリ結果がクエリキャッシュから提供される際に、より自然なブロックの粒度が提供されます。

その結果、クエリキャッシュは各クエリの複数の（部分的な）結果ブロックを保存します。この動作は良好なデフォルトですが、設定 [query_cache_squash_partial_results](settings/settings.md#query-cache-squash-partial-results) を使用して抑制することができます。

また、非決定的関数を含むクエリの結果はデフォルトではキャッシュされません。これらの関数には以下が含まれます：
- 辞書にアクセスするための関数: [`dictGet()`](../sql-reference/functions/ext-dict-functions.md#dictGet) など。
- [ユーザー定義関数](../sql-reference/statements/create/function.md)。
- 現在の日付または時間を返す関数: [`now()`](../sql-reference/functions/date-time-functions.md#now)、[`today()`](../sql-reference/functions/date-time-functions.md#today)、[`yesterday()`](../sql-reference/functions/date-time-functions.md#yesterday) など。
- ランダムな値を返す関数: [`randomString()`](../sql-reference/functions/random-functions.md#randomString)、[`fuzzBits()`](../sql-reference/functions/random-functions.md#fuzzBits) など。
- クエリ処理に使用される内部チャンクのサイズと順序に依存する関数: [`nowInBlock()`](../sql-reference/functions/date-time-functions.md#nowInBlock) など、[`rowNumberInBlock()`](../sql-reference/functions/other-functions.md#rowNumberInBlock)、[`runningDifference()`](../sql-reference/functions/other-functions.md#runningDifference)、[`blockSize()`](../sql-reference/functions/other-functions.md#blockSize) など。
- 環境に依存する関数: [`currentUser()`](../sql-reference/functions/other-functions.md#currentUser)、[`queryID()`](../sql-reference/functions/other-functions.md#queryID)、[`getMacro()`](../sql-reference/functions/other-functions.md#getMacro) など。

非決定的関数のクエリ結果を強制的にキャッシュするには、設定 [query_cache_nondeterministic_function_handling](settings/settings.md#query-cache-nondeterministic-function-handling) を使用します。

システムテーブル（例: [system.processes](system-tables/processes.md) または [information_schema.tables](system-tables/information_schema.md)）を含むクエリの結果はデフォルトでキャッシュされません。システムテーブルのあるクエリの結果を強制的にキャッシュするには、設定 [query_cache_system_table_handling](settings/settings.md#query-cache-system-table-handling) を使用します。

最後に、セキュリティ上の理由から、クエリキャッシュのエントリはユーザー間で共有されていません。たとえば、ユーザー A は、他のユーザー B が存在する場合にクエリを実行しても、レポリポリシーを回避することはできません。ただし、必要であれば、設定 [query_cache_share_between_users](settings/settings.md#query-cache-share-between-users) を供給して、他のユーザーにアクセス可能（つまり、共有）なキャッシュエントリにマークすることができます。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse クエリキャッシュの導入](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)
