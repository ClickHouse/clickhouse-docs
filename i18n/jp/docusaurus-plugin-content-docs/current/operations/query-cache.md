---
'description': 'ClickHouse でクエリキャッシュ機能の使用と設定方法に関するガイド'
'sidebar_label': 'クエリキャッシュ'
'sidebar_position': 65
'slug': '/operations/query-cache'
'title': 'クエリキャッシュ'
---




# クエリキャッシュ

クエリキャッシュを使用すると、`SELECT` クエリを一度だけ計算し、同じクエリのさらなる実行をキャッシュから直接提供することができます。クエリの種類によっては、これにより ClickHouse サーバーのレイテンシとリソース消費を大幅に削減することができます。

## 背景、設計と制限 {#background-design-and-limitations}

クエリキャッシュは一般的に、トランザクション整合性を持つか持たないかで見ることができます。

- トランザクション整合性のあるキャッシュでは、`SELECT` クエリの結果が変更された場合、または変更される可能性がある場合に、データベースはキャッシュされたクエリ結果を無効に（破棄）します。ClickHouse では、データを変更する操作には、テーブルへの挿入/更新/削除や、単一のマージが含まれます。トランザクション整合性のあるキャッシングは、特に OLTP データベースに適しています。たとえば、[MySQL](https://dev.mysql.com/doc/refman/5.6/en/query-cache.html)（v8.0以降はクエリキャッシュを削除しました）や [Oracle](https://docs.oracle.com/database/121/TGDBA/tune_result_cache.htm) です。
- トランザクション整合性のないキャッシュでは、クエリ結果にわずかな不正確さが許容され、すべてのキャッシュエントリには有効期間が割り当てられ、その後に有効期限が切れます（例：1分）。この期間中、基礎データはあまり変化しないと想定しています。このアプローチは、全体的に OLAP データベースにより適しています。トランザクション整合性のないキャッシングが十分である例としては、複数のユーザーが同時にアクセスするレポートツールの時間ごとの販売レポートがあります。販売データは通常、データベースがレポートを一度だけ計算する必要があるほど十分に遅く変化します（最初の `SELECT` クエリで表される）。その後のクエリは、クエリキャッシュから直接提供されます。この例では、妥当な有効期間は30分かもしれません。

トランザクション整合性のないキャッシングは、通常、データベースと対話するクライアントツールやプロキシパッケージ（例：[chproxy](https://www.chproxy.org/configuration/caching/)）によって提供されます。その結果、同じキャッシングロジックと設定がしばしばデュプリケートされます。ClickHouse のクエリキャッシュでは、キャッシングロジックがサーバー側に移動します。これにより、メンテナンスの手間が減り、冗長性が回避されます。

## 設定と使用法 {#configuration-settings-and-usage}

:::note
ClickHouse Cloud では、クエリキャッシュ設定を編集するために [クエリレベルの設定](/operations/settings/query-level) を使用する必要があります。現在、[設定レベルの設定](/operations/configuration-files)を編集することはサポートされていません。
:::

:::note
[clickhouse-local](utilities/clickhouse-local.md) は、一度に単一のクエリを実行します。クエリ結果のキャッシングは意味を成さないため、clickhouse-local ではクエリ結果キャッシュが無効になっています。
:::

設定 [use_query_cache](/operations/settings/settings#use_query_cache) を使用すると、特定のクエリまたは現在のセッションのすべてのクエリがクエリキャッシュを利用するかどうかを制御できます。たとえば、次のクエリの最初の実行

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true;
```

は、クエリ結果をクエリキャッシュに保存します。同じクエリのその後の実行（パラメータ `use_query_cache = true` でも）では、キャッシュから計算された結果を直接読み込んで即座に返します。

:::note
設定 `use_query_cache` および他のすべてのクエリキャッシュ関連設定は、スタンドアロンの `SELECT` 文に対してのみ影響を与えます。特に、`CREATE VIEW AS SELECT [...] SETTINGS use_query_cache = true` で作成されたビューへの `SELECT` の結果は、`SETTINGS use_query_cache = true` で実行されない限りキャッシュされません。
:::

キャッシュの利用方法は、設定 [enable_writes_to_query_cache](/operations/settings/settings#enable_writes_to_query_cache) および [enable_reads_from_query_cache](/operations/settings/settings#enable_reads_from_query_cache) を使用して、より詳細に構成できます（両方ともデフォルトでは `true` です）。前者の設定はクエリ結果がキャッシュに保存されるかどうかを制御し、後者の設定はデータベースがクエリ結果をキャッシュから取得しようとするかどうかを決定します。たとえば、次のクエリはキャッシュを受動的に使用します、つまり、キャッシュから読み取ろうとしますがその結果を保存しません：

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, enable_writes_to_query_cache = false;
```

最大限の制御を得るために、一般的に、設定 `use_query_cache`、`enable_writes_to_query_cache` および `enable_reads_from_query_cache` を特定のクエリのみに提供することが推奨されます。また、ユーザーやプロファイルレベルでキャッシングを有効にすることも可能ですが（例：`SET use_query_cache = true` 経由）、その場合、すべての `SELECT` クエリがキャッシュされた結果を返す可能性があることに注意する必要があります。

クエリキャッシュは、ステートメント `SYSTEM DROP QUERY CACHE` を使用してクリアできます。クエリキャッシュの内容はシステムテーブル [system.query_cache](system-tables/query_cache.md) に表示されます。データベースの起動以来のクエリキャッシュのヒット数とミス数は、システムテーブル [system.events](system-tables/events.md) にイベント "QueryCacheHits" と "QueryCacheMisses" として表示されます。これらのカウンタは、`use_query_cache = true` 設定で実行される `SELECT` クエリに対してのみ更新され、他のクエリは "QueryCacheMisses" に影響を与えません。システムテーブル [system.query_log](system-tables/query_log.md) のフィールド `query_cache_usage` は、実行された各クエリについて、そのクエリ結果がクエリキャッシュに書き込まれたか、読み込まれたかを示します。システムテーブル [system.asynchronous_metrics](system-tables/asynchronous_metrics.md) の非同期メトリクス "QueryCacheEntries" と "QueryCacheBytes" は、現在クエリキャッシュが含むエントリ数およびバイト数を示します。

クエリキャッシュは、各 ClickHouse サーバープロセスごとに一度だけ存在します。ただし、キャッシュ結果はデフォルトではユーザー間で共有されません。これは変更可能ですが（以下参照）、セキュリティ上の理由から推奨されません。

クエリ結果は、そのクエリの [抽象構文木 (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) でクエリキャッシュに参照されます。つまり、キャッシングは大文字と小文字に依存しないため、たとえば `SELECT 1` と `select 1` は同じクエリとして扱われます。マッチングをより自然にするために、クエリキャッシュに関連するすべてのクエリレベル設定は、AST から削除されます。

クエリが例外またはユーザーキャンセルにより中断された場合、エントリはクエリキャッシュに書き込まれません。

クエリキャッシュのサイズ（バイト単位）、最大キャッシュエントリ数、および個々のキャッシュエントリの最大サイズ（バイトおよびレコード単位）は、異なる [サーバー設定オプション](/operations/server-configuration-parameters/settings#query_cache) を使用して構成できます。

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

個々のユーザーのキャッシュ使用量を制限することも可能です。これは [設定プロファイル](settings/settings-profiles.md) および [設定制約](settings/constraints-on-settings.md) を使用して行います。具体的には、ユーザーがクエリキャッシュに割り当てられる最大メモリ量（バイト単位）や、最大の保存クエリ結果数を制限できます。そのために、まず `users.xml` のユーザープロファイル内で設定 [query_cache_max_size_in_bytes](/operations/settings/settings#query_cache_max_size_in_bytes) と [query_cache_max_entries](/operations/settings/settings#query_cache_max_entries) を提供し、次に両方の設定を読み取り専用にします：

```xml
<profiles>
    <default>
        <!-- ユーザー/プロファイル 'default' の最大キャッシュサイズ（バイト単位） -->
        <query_cache_max_size_in_bytes>10000</query_cache_max_size_in_bytes>
        <!-- ユーザー/プロファイル 'default' のキャッシュに保存された最大SELECTクエリ結果数 -->
        <query_cache_max_entries>100</query_cache_max_entries>
        <!-- ユーザーがこれらの設定を変更できないようにするために、両方の設定を読み取り専用にします -->
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

クエリの結果がキャッシュされるために、クエリが少なくともどのくらいの時間実行される必要があるかを定義するには、設定 [query_cache_min_query_duration](/operations/settings/settings#query_cache_min_query_duration) を使用します。たとえば、次のクエリの結果

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, query_cache_min_query_duration = 5000;
```

は、クエリが5秒以上実行される場合にのみキャッシュされます。また、キャッシュされるまでにクエリがどのくらい実行される必要があるかを指定することも可能です - そのためには設定 [query_cache_min_query_runs](/operations/settings/settings#query_cache_min_query_runs) を使用します。

クエリキャッシュのエントリは、一定の時間（有効期限）が経過すると古くなります。デフォルトでは、この期間は60秒ですが、異なる値をセッション、プロファイルまたはクエリレベルで指定できます。設定 [query_cache_ttl](/operations/settings/settings#query_cache_ttl) を使用します。クエリキャッシュは、エントリを「遅延的に」削除します。つまり、エントリが古くなった場合、それはすぐにキャッシュから削除されるわけではありません。代わりに、クエリキャッシュに新しいエントリを挿入する必要がある場合、データベースは新しいエントリ用の十分な空きスペースがキャッシュにあるかどうかを確認します。これが不可能な場合、データベースはすべての古いエントリを削除しようとします。それでもキャッシュに十分な空きスペースがない場合、新しいエントリは挿入されません。

クエリキャッシュ内のエントリは、デフォルトで圧縮されています。これにより、キャッシュへの書き込みおよび読み込みの速度が遅くなる代わりに、全体のメモリ消費が削減されます。圧縮を無効にするには、設定 [query_cache_compress_entries](/operations/settings/settings#query_cache_compress_entries) を使用します。

同じクエリの複数の結果をキャッシュしておくことが有用な場合があります。これは、設定 [query_cache_tag](/operations/settings/settings#query_cache_tag) を使用して、クエリキャッシュエントリのラベル（または名前空間）として機能させることで達成できます。クエリキャッシュは、異なるタグを持つ同じクエリの結果を異なるものとして扱います。

同じクエリのために3つの異なるクエリキャッシュエントリを作成する例：

```sql
SELECT 1 SETTINGS use_query_cache = true; -- query_cache_tag は暗黙的に ''（空文字列）です
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 1';
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 2';
```

`tag` タグを持つエントリのみをクエリキャッシュから削除するには、ステートメント `SYSTEM DROP QUERY CACHE TAG 'tag'` を使用できます。

ClickHouse は、[max_block_size](/operations/settings/settings#max_block_size) 行のブロックでテーブルデータを読み取ります。フィルタリング、集約などにより、結果ブロックは通常「max_block_size」よりはるかに小さくなりますが、はるかに大きくなる場合もあります。設定 [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results) （デフォルトでは有効） は、結果ブロックが小さい場合は圧縮されるか、大きい場合は「max_block_size」サイズのブロックに分割されるかを制御します。これにより、クエリキャッシュへの書き込み性能は低下しますが、キャッシュエントリの圧縮率が向上し、後でクエリ結果がクエリキャッシュから提供される際に、より自然なブロック粒度が提供されます。

その結果、クエリキャッシュは各クエリの複数の（部分的な）結果ブロックを保存します。この動作は良好なデフォルトですが、設定 [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results) を使用して抑制することができます。

また、非決定論的関数を含むクエリの結果は、デフォルトではキャッシュされません。このような関数には以下が含まれます：
- 辞書にアクセスするための関数： [`dictGet()`](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) など。
- XML 定義に `<deterministic>true</deterministic>` タグのない [ユーザー定義関数](../sql-reference/statements/create/function.md)。
- 現在の日付または時刻を返す関数： [`now()`](../sql-reference/functions/date-time-functions.md#now)、[`today()`](../sql-reference/functions/date-time-functions.md#today)、[`yesterday()`](../sql-reference/functions/date-time-functions.md#yesterday) など。
- ランダムな値を返す関数： [`randomString()`](../sql-reference/functions/random-functions.md#randomString)、[`fuzzBits()`](../sql-reference/functions/random-functions.md#fuzzBits) など。
- クエリ処理に使用される内部チャンクのサイズと順序に依存する関数： [`nowInBlock()`](../sql-reference/functions/date-time-functions.md#nowInBlock) など、[`rowNumberInBlock()`](../sql-reference/functions/other-functions.md#rowNumberInBlock)、[`runningDifference()`](../sql-reference/functions/other-functions.md#runningDifference)、[`blockSize()`](../sql-reference/functions/other-functions.md#blockSize) など。
- 環境に依存する関数： [`currentUser()`](../sql-reference/functions/other-functions.md#currentUser)、[`queryID()`](/sql-reference/functions/other-functions#queryid)、[`getMacro()`](../sql-reference/functions/other-functions.md#getMacro) など。

非決定論的関数を含むクエリの結果を強制的にキャッシュするには、設定 [query_cache_nondeterministic_function_handling](/operations/settings/settings#query_cache_nondeterministic_function_handling) を使用します。

システムテーブル（例：[system.processes](system-tables/processes.md) や [information_schema.tables](system-tables/information_schema.md)）を含むクエリの結果は、デフォルトではキャッシュされません。システムテーブルを含むクエリの結果を強制的にキャッシュするには、設定 [query_cache_system_table_handling](/operations/settings/settings#query_cache_system_table_handling) を使用します。

最後に、クエリキャッシュのエントリはセキュリティ上の理由からユーザー間で共有されません。たとえば、ユーザー A は、ユーザー B が存在しない行ポリシーを回避するために、別のユーザー B と同じクエリを実行することはできません。ただし、必要に応じて、キャッシュエントリを他のユーザーがアクセス可能（つまり共有）としてマークすることができます。設定 [query_cache_share_between_users](/operations/settings/settings#query_cache_share_between_users) を提供することによってです。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse クエリキャッシュの導入](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)
