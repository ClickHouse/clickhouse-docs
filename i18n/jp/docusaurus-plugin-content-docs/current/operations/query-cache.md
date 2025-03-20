---
slug: /operations/query-cache
sidebar_position: 65
sidebar_label: クエリキャッシュ
---


# クエリキャッシュ

クエリキャッシュは、`SELECT` クエリを一度だけ計算し、その後同じクエリの実行をキャッシュから直接提供できるようにします。クエリの種類によっては、これにより ClickHouse サーバのレイテンシやリソース消費を劇的に削減することができます。

## 背景、設計、制限 {#background-design-and-limitations}

クエリキャッシュは一般的に、トランザクション整合性のあるものと整合性のないものとを見ることができます。

- トランザクション整合性のあるキャッシュでは、データベースは `SELECT` クエリの結果が変わった場合、または変わる可能性がある場合にキャッシュされたクエリ結果を無効に（破棄）します。ClickHouse では、データを変更する操作には、テーブルへの挿入/更新/削除や、マージ操作が含まれます。トランザクション整合性のあるキャッシングは、特に OLTP データベースに適しています。例えば、[MySQL](https://dev.mysql.com/doc/refman/5.6/en/query-cache.html)（8.0 以降にクエリキャッシュを削除）や、[Oracle](https://docs.oracle.com/database/121/TGDBA/tune_result_cache.htm) などがあります。
- トランザクション整合性のないキャッシュでは、クエリ結果にわずかな不正確さが受け入れられます。これは、すべてのキャッシュエントリに有効期限が設定され、その後は期限切れになる（例：1分）という前提のもと、基になるデータがこの期間中にほとんど変更されないと仮定します。このアプローチは全体的に OLAP データベースにより適しています。トランザクション整合性のないキャッシングが十分な例としては、複数のユーザーが同時にアクセスする報告ツール内の時間ごとの販売レポートが挙げられます。販売データは通常、データベースがレポートを一度だけ計算する必要があるほどゆっくりと変化します（最初の `SELECT` クエリで表されている）。以降のクエリは、クエリキャッシュから直接提供できます。この例では、適切な有効期限は30分に設定できます。

トランザクション整合性のないキャッシングは、従来はクライアントツールやプロキシパッケージ（例：[chproxy](https://www.chproxy.org/configuration/caching/)）によって提供されており、データベースと相互作用するために同じキャッシングロジックと設定が重複することが多いです。ClickHouse のクエリキャッシュでは、キャッシングロジックをサーバ側に移動させます。これにより、メンテナンスの手間が減り、冗長性を避けることができます。

## 設定と利用法 {#configuration-settings-and-usage}

:::note
ClickHouse Cloud では、クエリキャッシュ設定を編集するには [クエリレベル設定](/operations/settings/query-level) を使用する必要があります。[設定レベルの設定](/operations/configuration-files) の編集は現在サポートされていません。
:::

設定 [use_query_cache](/operations/settings/settings#use_query_cache) は、特定のクエリまたは現在のセッションのすべてのクエリがクエリキャッシュを利用すべきかどうかを制御するために使用されます。例えば、次のクエリの最初の実行は

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true;
```

クエリ結果をクエリキャッシュに格納します。同じクエリの以降の実行（`use_query_cache = true` のパラメータを使用した場合でも）は、キャッシュから計算された結果を読み取り、即座に返します。

:::note
設定 `use_query_cache` と他のクエリキャッシュ関連の設定は、スタンドアロンの `SELECT` ステートメントにのみ影響します。特に、`CREATE VIEW AS SELECT [...] SETTINGS use_query_cache = true` によって作成されたビューへの `SELECT` の結果は、`SETTINGS use_query_cache = true` で実行されない限り、キャッシュされません。
:::

キャッシュの利用方法は、設定 [enable_writes_to_query_cache](/operations/settings/settings#enable_writes_to_query_cache) と [enable_reads_from_query_cache](/operations/settings/settings#enable_reads_from_query_cache)（どちらもデフォルトでは `true`）を使用して、より詳細に構成できます。前者は、クエリ結果がキャッシュに格納されるかどうかを制御し、後者はデータベースがクエリ結果をキャッシュから取得しようとするかどうかを決定します。たとえば、次のクエリはキャッシュを受動的に利用します。つまり、キャッシュから読み取ろうとしますが、その結果をキャッシュに保存しません。

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, enable_writes_to_query_cache = false;
```

最大の制御を得るためには、一般的に、設定 `use_query_cache`、`enable_writes_to_query_cache` および `enable_reads_from_query_cache` を特定のクエリにのみ提供することが推奨されます。また、ユーザーまたはプロファイルレベルでキャッシングを有効にすることも可能ですが（例：`SET use_query_cache = true` を介して）、その場合はすべての `SELECT` クエリがキャッシュされた結果を返す可能性があることを念頭に置く必要があります。

クエリキャッシュは、ステートメント `SYSTEM DROP QUERY CACHE` を使用してクリアできます。クエリキャッシュの内容はシステムテーブル [system.query_cache](system-tables/query_cache.md) に表示されます。データベース起動以来のクエリキャッシュヒット数とミス数は、システムテーブル [system.events](system-tables/events.md) に "QueryCacheHits" および "QueryCacheMisses" というイベントとして表示されます。これらのカウンターは、設定 `use_query_cache = true` で実行される `SELECT` クエリに対してのみ更新され、他のクエリは "QueryCacheMisses" に影響を与えません。システムテーブル [system.query_log](system-tables/query_log.md) のフィールド `query_cache_usage` では、実行された各クエリについて、そのクエリ結果がクエリキャッシュに書き込まれたか、または読み取られたかが表示されます。システムテーブル [system.asynchronous_metrics](system-tables/asynchronous_metrics.md) にある非同期メトリクス "QueryCacheEntries" および "QueryCacheBytes" は、現在クエリキャッシュに含まれるエントリ数/バイト数を示します。

クエリキャッシュは各 ClickHouse サーバプロセスにつき一度存在します。ただし、キャッシュ結果はデフォルトではユーザー間で共有されません。これは変更可能ですが（以下参照）、セキュリティ上の理由から推奨されません。

クエリ結果は、クエリの [抽象構文木 (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) によってクエリキャッシュに参照されます。これは、キャッシングが大文字/小文字に依存しないことを意味し、たとえば `SELECT 1` と `select 1` は同じクエリとして扱われます。マッチングをより自然にするために、クエリキャッシュに関連するすべてのクエリレベル設定は AST から削除されます。

クエリが例外またはユーザーのキャンセルにより中断された場合、クエリキャッシュにはエントリが書き込まれません。

クエリキャッシュのサイズ（バイト単位）、キャッシュエントリの最大数、および個々のキャッシュエントリの最大サイズ（バイトおよびレコード単位）は、さまざまな [サーバ設定オプション](/operations/server-configuration-parameters/settings#query_cache) を使用して構成できます。

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

ユーザーごとのキャッシュ使用を制限することも可能です。これには、[設定プロファイル](settings/settings-profiles.md) および [設定の制約](settings/constraints-on-settings.md) を使用します。具体的には、ユーザーがクエリキャッシュに割り当てられる最大メモリ量（バイト単位）および保存されるクエリ結果の最大数を制限できます。そのためには、まず `users.xml` 内のユーザープロファイルに設定 [query_cache_max_size_in_bytes](/operations/settings/settings#query_cache_max_size_in_bytes) と [query_cache_max_entries](/operations/settings/settings#query_cache_max_entries) を提供し、その後両方の設定を読み取り専用にします。

``` xml
<profiles>
    <default>
        <!-- ユーザー/プロファイル 'default' に対する最大キャッシュサイズ（バイト単位） -->
        <query_cache_max_size_in_bytes>10000</query_cache_max_size_in_bytes>
        <!-- ユーザー/プロファイル 'default' のキャッシュに保存される SELECT クエリ結果の最大数 -->
        <query_cache_max_entries>100</query_cache_max_entries>
        <!-- 両方の設定を読み取り専用にして、ユーザーが変更できないようにする -->
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

クエリの実行時間が、結果をキャッシュできるまでに必要な最小の時間を定義するには、設定 [query_cache_min_query_duration](/operations/settings/settings#query_cache_min_query_duration) を使用できます。たとえば、

``` sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, query_cache_min_query_duration = 5000;
```

というクエリの結果は、クエリが5秒以上実行される場合にのみキャッシュされます。クエリをキャッシュするまでに何回実行される必要があるかを指定することも可能で、その場合は設定 [query_cache_min_query_runs](/operations/settings/settings#query_cache_min_query_runs) を使用します。

クエリキャッシュのエントリーは、一定の時間経過後（生存期間）に古くなります。デフォルトでは、この期間は60秒ですが、設定 [query_cache_ttl](/operations/settings/settings#query_cache_ttl) を使用して、セッション、プロファイル、またはクエリレベルで異なる値を指定できます。クエリキャッシュは、エントリーが古くなると「遅延的に」エビクトします。つまり、エントリーが古くなると即座にキャッシュから削除されるわけではありません。代わりに、新しいエントリーがクエリキャッシュに挿入されるとき、データベースはその新しいエントリーに対してキャッシュに十分な空きスペースがあるかどうかを確認します。十分な空きスペースがない場合、データベースはすべての古いエントリーを削除しようとします。それでもなおキャッシュに十分な空きスペースがない場合、新しいエントリーは挿入されません。

クエリキャッシュのエントリーはデフォルトで圧縮されます。これにより、クエリキャッシュへの書き込みまたは読み込みの速度が遅くなる代わりに、全体のメモリ消費が削減されます。圧縮を無効にするには、設定 [query_cache_compress_entries](/operations/settings/settings#query_cache_compress_entries) を使用します。

時には、同じクエリの複数の結果をキャッシュしておくことが有用です。これは、クエリキャッシュエントリのラベル（または名前空間）として機能する設定 [query_cache_tag](/operations/settings/settings#query_cache_tag) を使用して実現できます。クエリキャッシュは、異なるタグを持つ同じクエリの結果を異なるものとして扱います。

同じクエリに対して三つの異なるクエリキャッシュエントリーを作成する例：

```sql
SELECT 1 SETTINGS use_query_cache = true; -- query_cache_tagは暗黙的に ''（空文字）
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 1';
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 2';
```

特定のタグ `tag` を持つエントリーのみをクエリキャッシュから削除するには、ステートメント `SYSTEM DROP QUERY CACHE TAG 'tag'` を使用できます。

ClickHouse は、[max_block_size](/operations/settings/settings#max_block_size) 行のブロックでテーブルデータを読み取ります。フィルタリング、集計、等により、結果ブロックは通常 'max_block_size' よりもずっと小さくなりますが、いくつかのケースでは、ずっと大きくなることもあります。設定 [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results)（デフォルトで有効）は、結果ブロックが小さい場合には圧縮されるか、大きい場合には 'max_block_size' サイズのブロックに分割されるかを制御します。これにより、クエリキャッシュへの書き込みのパフォーマンスが低下しますが、キャッシュエントリーの圧縮率が向上し、後でクエリキャッシュから結果が提供される際のブロックのグラニュラリティがより自然になります。

その結果、クエリキャッシュは各クエリに対して複数の（部分的な）結果ブロックを保存します。この動作は良いデフォルトですが、設定 [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results) を使用して抑制することができます。

また、非決定的関数を含むクエリの結果は、デフォルトではキャッシュされません。これらの関数には以下が含まれます。
- 辞書にアクセスするための関数: [`dictGet()`](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) 等。
- [ユーザー定義関数](../sql-reference/statements/create/function.md)、
- 現在の日付または時間を返す関数: [`now()`](../sql-reference/functions/date-time-functions.md#now),
  [`today()`](../sql-reference/functions/date-time-functions.md#today),
  [`yesterday()`](../sql-reference/functions/date-time-functions.md#yesterday) 等、
- ランダムな値を返す関数: [`randomString()`](../sql-reference/functions/random-functions.md#randomString),
  [`fuzzBits()`](../sql-reference/functions/random-functions.md#fuzzBits) 等、
- クエリ処理に使用される内部チャンクのサイズや順序に依存する関数:
  [`nowInBlock()`](../sql-reference/functions/date-time-functions.md#nowInBlock) 等、
  [`rowNumberInBlock()`](../sql-reference/functions/other-functions.md#rowNumberInBlock),
  [`runningDifference()`](../sql-reference/functions/other-functions.md#runningDifference),
  [`blockSize()`](../sql-reference/functions/other-functions.md#blockSize) 等、
- 環境に依存する関数: [`currentUser()`](../sql-reference/functions/other-functions.md#currentUser),
  [`queryID()`](/sql-reference/functions/other-functions#queryid),
  [`getMacro()`](../sql-reference/functions/other-functions.md#getMacro) 等。

非決定的関数の結果を強制的にキャッシュするには、設定 [query_cache_nondeterministic_function_handling](/operations/settings/settings#query_cache_nondeterministic_function_handling) を使用してください。

システムテーブル（例: [system.processes](system-tables/processes.md) または [information_schema.tables](system-tables/information_schema.md)）を含むクエリの結果は、デフォルトではキャッシュされません。システムテーブルのクエリ結果を強制的にキャッシュするには、設定 [query_cache_system_table_handling](/operations/settings/settings#query_cache_system_table_handling) を使用します。

最後に、セキュリティ上の理由から、クエリキャッシュのエントリーはユーザー間で共有されません。たとえば、ユーザー A は、他のユーザー B が持っていない行ポリシーを回避するために、別のユーザー B と同じクエリを実行することができてはいけません。しかし、必要であれば、設定 [query_cache_share_between_users](/operations/settings/settings#query_cache_share_between_users) を提供することで、他のユーザーがアクセスできる（つまり共有される）ようにキャッシュエントリーをマークできます。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse クエリキャッシュの紹介](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)
