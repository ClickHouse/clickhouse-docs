---
description: 'ClickHouseにおけるクエリキャッシュ機能の使用と設定に関するガイド'
sidebar_label: 'クエリキャッシュ'
sidebar_position: 65
slug: /operations/query-cache
title: 'クエリキャッシュ'
---


# クエリキャッシュ

クエリキャッシュは、`SELECT` クエリを一度だけ計算し、その後の同じクエリの実行をキャッシュから直接提供することを可能にします。
クエリの種類に応じて、これによりClickHouseサーバーのレイテンシとリソース消費が大幅に削減されることがあります。

## 背景、設計、および制限 {#background-design-and-limitations}

クエリキャッシュは一般的に、トランザクショナルに一貫性のあるものと一貫性のないものとに分けられます。

- トランザクショナルに一貫性のあるキャッシュでは、`SELECT` クエリの結果が変更されるか変更の可能性がある場合に、データベースはキャッシュされたクエリ結果を無効にします（破棄します）。
  ClickHouseでは、データを変更する操作には、テーブルへの挿入/更新/削除や、崩壊マージが含まれます。トランザクショナルに一貫性のあるキャッシングは、OLTPデータベースに特に適しています。たとえば、[MySQL](https://dev.mysql.com/doc/refman/5.6/en/query-cache.html)（バージョン8.0以降にクエリキャッシュを削除）や[Oracle](https://docs.oracle.com/database/121/TGDBA/tune_result_cache.htm)のようなデータベースです。
- トランザクショナルに一貫性のないキャッシュでは、クエリ結果のわずかな不正確さが受け入れられます。これは、すべてのキャッシュエントリに有効期限が設定され、その後期限切れとなるという前提のもとで成立します（例：1分）およびこの期間中に基盤となるデータがわずかしか変更されないことを前提としています。このアプローチは全体としてOLAPデータベースにより適しています。トランザクショナルに一貫性のないキャッシングが十分である例としては、複数のユーザーが同時にアクセスするレポートツールでの毎時販売レポートがあります。販売データは通常、十分に遅く変化するため、データベースはレポートを一度（最初の`SELECT`クエリで表される）だけ計算する必要があります。その後のクエリはクエリキャッシュから直接提供されます。この例では、合理的な有効期限は30分である可能性があります。

トランザクショナルに一貫性のないキャッシングは、従来、データベースと対話するクライアントツールやプロキシパッケージ（例：[chproxy](https://www.chproxy.org/configuration/caching/)）によって提供されていました。その結果、同じキャッシングロジックと設定がしばしば複製されることになります。ClickHouseのクエリキャッシュでは、キャッシングロジックがサーバー側に移行します。これにより、メンテナンスの手間が減り、冗長性を避けることができます。

## 設定と使用法 {#configuration-settings-and-usage}

:::note
ClickHouse Cloudでは、クエリキャッシュ設定を編集するには[クエリレベル設定](/operations/settings/query-level)を使用する必要があります。[設定レベル設定](/operations/configuration-files)の編集は現在サポートされていません。
:::

:::note
[clickhouse-local](utilities/clickhouse-local.md)は、一度に1つのクエリを実行します。クエリ結果のキャッシングは意味を持たないため、clickhouse-localではクエリ結果キャッシュが無効にされています。
:::

設定 [use_query_cache](/operations/settings/settings#use_query_cache) を使用して、特定のクエリまたは現在のセッションのすべてのクエリがクエリキャッシュを利用するかどうかを制御できます。たとえば、クエリの最初の実行は次のようになります。

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true;
```

このクエリの結果は、クエリキャッシュに保管されます。同じクエリの次回以降の実行（`use_query_cache = true`をパラメーターとして持つ場合）では、キャッシュから計算された結果が読み取られ、即座に返されます。

:::note
設定 `use_query_cache` およびその他のクエリキャッシュ関連設定は、スタンドアロンの `SELECT` 文にのみ効果があります。特に、`CREATE VIEW AS SELECT [...] SETTINGS use_query_cache = true`によって作成されたビューへの`SELECT`文の結果は、`SELECT`文が`SETTINGS use_query_cache = true`で実行されない限り、キャッシュされません。
:::

キャッシュの利用方法は、設定 [enable_writes_to_query_cache](/operations/settings/settings#enable_writes_to_query_cache) と [enable_reads_from_query_cache](/operations/settings/settings#enable_reads_from_query_cache) を使用してさらに詳細に設定できます（どちらもデフォルトで `true`）。前者の設定は、クエリ結果がキャッシュに保存されるかどうかを制御し、後者の設定はデータベースがクエリ結果をキャッシュから取得しようとするかどうかを決定します。たとえば、次のクエリは、キャッシュを受動的に利用し、つまりそれから読み取ろうとしますが、その結果をキャッシュに保存しません。

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, enable_writes_to_query_cache = false;
```

最大の制御を実現するためには、一般的には設定 `use_query_cache`、`enable_writes_to_query_cache`、および `enable_reads_from_query_cache` を特定のクエリにのみ提供することを推奨します。また、ユーザーまたはプロファイルレベルでキャッシングを有効にすることも可能ですが（例：`SET use_query_cache = true`を介して）、その場合、すべての `SELECT` クエリがキャッシュされた結果を返す可能性があることに留意する必要があります。

クエリキャッシュは、ステートメント `SYSTEM DROP QUERY CACHE` を使用してクリアできます。クエリキャッシュの内容は、システムテーブル [system.query_cache](system-tables/query_cache.md) に表示されます。データベース開始以来のクエリキャッシュのヒット数とミス数は、システムテーブル [system.events](system-tables/events.md) に「QueryCacheHits」と「QueryCacheMisses」として表示されます。これらのカウンタは、設定 `use_query_cache = true` で実行される `SELECT` クエリにのみ更新され、他のクエリは「QueryCacheMisses」に影響を与えません。システムテーブル [system.query_log](system-tables/query_log.md) のフィールド `query_cache_usage` は、実行された各クエリがクエリ結果をキャッシュに書き込まれたか、キャッシュから読み取られたかを示します。システムテーブル [system.asynchronous_metrics](system-tables/asynchronous_metrics.md) の非同期メトリクス「QueryCacheEntries」と「QueryCacheBytes」は、現在クエリキャッシュに含まれるエントリ/バイト数を示します。

クエリキャッシュは、ClickHouseサーバープロセスごとに1回存在します。ただし、キャッシュ結果はデフォルトではユーザー間で共有されません。これは変更可能ですが（下記参照）、セキュリティ上の理由から推奨されません。

クエリ結果は、そのクエリの [抽象構文木 (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) によってクエリキャッシュに参照されます。これは、キャッシングが大文字と小文字に無関係であることを意味します。たとえば、`SELECT 1` と `select 1` は同じクエリとして扱われます。マッチングをより自然にするために、クエリキャッシュに関連するすべてのクエリレベル設定はASTから削除されます。

クエリが例外やユーザーキャンセルにより中断された場合、クエリキャッシュにはエントリが書き込まれません。

クエリキャッシュのサイズ（バイト単位）、キャッシュエントリの最大数、および個々のキャッシュエントリの最大サイズ（バイトおよびレコード単位）は、さまざまな [サーバー設定オプション](/operations/server-configuration-parameters/settings#query_cache) を使用して設定できます。

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

また、[設定プロファイル](settings/settings-profiles.md) と [設定制約](settings/constraints-on-settings.md) を使用して、個別のユーザーのキャッシュ使用量を制限することもできます。具体的には、ユーザーがクエリキャッシュに確保できるメモリ量（バイト単位）と、保存されるクエリ結果の最大数を制限できます。そのためには、最初に `users.xml` のユーザープロファイル内で設定 [query_cache_max_size_in_bytes](/operations/settings/settings#query_cache_max_size_in_bytes) と [query_cache_max_entries](/operations/settings/settings#query_cache_max_entries) を提供し、次に両方の設定を読み取り専用にします。

```xml
<profiles>
    <default>
        <!-- ユーザー/プロファイル 'default' の最大キャッシュサイズ（バイト単位） -->
        <query_cache_max_size_in_bytes>10000</query_cache_max_size_in_bytes>
        <!-- ユーザー/プロファイル 'default' のキャッシュに保存されるSELECTクエリ結果の最大数 -->
        <query_cache_max_entries>100</query_cache_max_entries>
        <!-- ユーザーがこれらの設定を変更できないように、両方の設定を読み取り専用にします -->
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

クエリの結果をキャッシュできるまでの実行時間を求めるには、設定 [query_cache_min_query_duration](/operations/settings/settings#query_cache_min_query_duration) を使用します。たとえば、次のクエリの結果は：

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, query_cache_min_query_duration = 5000;
```

クエリが5秒以上実行される場合にのみキャッシュされます。また、結果がキャッシュされるまでにクエリが実行される必要がある回数を指定することも可能です。そのためには、設定 [query_cache_min_query_runs](/operations/settings/settings#query_cache_min_query_runs) を使用します。

クエリキャッシュ内のエントリは、特定の期間（TTL）後に古くなります。デフォルトでは、この期間は60秒ですが、設定 [query_cache_ttl](/operations/settings/settings#query_cache_ttl) を使用してセッション、プロファイル、またはクエリレベルで異なる値を指定できます。クエリキャッシュは「遅延的に」エントリを排除します。これは、エントリが古くなると、すぐにキャッシュから削除されるのではなく、新しいエントリをクエリキャッシュに挿入する際に、データベースが新しいエントリ用にキャッシュに十分な空きスペースがあるかどうかをチェックすることを意味します。これが満たされない場合、データベースはすべての古いエントリを削除しようとします。それでもキャッシュに十分な空きスペースがない場合、新しいエントリは挿入されません。

クエリキャッシュ内のエントリはデフォルトで圧縮されます。これにより、クエリキャッシュへの書き込みおよび読み込みは遅くなりますが、全体のメモリ消費量が削減されます。圧縮を無効にするには、設定 [query_cache_compress_entries](/operations/settings/settings#query_cache_compress_entries) を使用します。

同じクエリに対して複数の結果をキャッシュすることが有用な場合があります。これは、クエリキャッシュエントリにラベル（または名前空間）として機能する設定 [query_cache_tag](/operations/settings/settings#query_cache_tag) を使用することで実現できます。同じクエリの異なるタグを持つ結果は、クエリキャッシュによって異なるものとして扱われます。

同じクエリに対する3つの異なるクエリキャッシュエントリを作成する例：

```sql
SELECT 1 SETTINGS use_query_cache = true; -- query_cache_tag は暗黙に ''（空文字列）
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 1';
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 2';
```

クエリキャッシュからタグ `tag` のみを削除するには、ステートメント `SYSTEM DROP QUERY CACHE TAG 'tag'` を使用できます。

ClickHouseは、[max_block_size](/operations/settings/settings#max_block_size) 行のブロックでテーブルデータを読み取ります。フィルタリング、集計などにより、結果ブロックは通常「max_block_size」よりもはるかに小さくなりますが、場合によってはより大きくなることもあります。設定 [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results)（デフォルトで有効）は、結果ブロックが小さい場合には圧縮されるか（小さい場合）、分割されるか（大きい場合）を制御します。これにより、クエリキャッシュへの書き込みのパフォーマンスが低下する一方で、キャッシュエントリの圧縮率が向上し、後でクエリ結果がクエリキャッシュから提供される際のブロックの粒度がより自然になります。

その結果、クエリキャッシュは各クエリの複数の（部分的な）結果ブロックを保存します。この動作は良いデフォルトですが、設定 [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results) を使用して抑制できます。

また、非決定性関数を含むクエリの結果はデフォルトでキャッシュされません。このような関数には、次のものが含まれます：
- 辞書にアクセスするための関数: [`dictGet()`](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) など。
- XML定義でタグ `<deterministic>true</deterministic>` を持たない [ユーザー定義関数](../sql-reference/statements/create/function.md)。
- 現在の日付または時間を返す関数: [`now()`](../sql-reference/functions/date-time-functions.md#now)、[`today()`](../sql-reference/functions/date-time-functions.md#today)、[`yesterday()`](../sql-reference/functions/date-time-functions.md#yesterday) など。
- ランダム値を返す関数: [`randomString()`](../sql-reference/functions/random-functions.md#randomString)、[`fuzzBits()`](../sql-reference/functions/random-functions.md#fuzzBits) など。
- クエリ処理に使用される内部チャンクのサイズと順序に依存する関数: [`nowInBlock()`](../sql-reference/functions/date-time-functions.md#nowInBlock) など、[`rowNumberInBlock()`](../sql-reference/functions/other-functions.md#rowNumberInBlock)、[`runningDifference()`](../sql-reference/functions/other-functions.md#runningDifference)、[`blockSize()`](../sql-reference/functions/other-functions.md#blockSize) など。
- 環境に依存する関数: [`currentUser()`](../sql-reference/functions/other-functions.md#currentUser)、[`queryID()`](/sql-reference/functions/other-functions#queryid)、[`getMacro()`](../sql-reference/functions/other-functions.md#getMacro) など。

非決定性関数を含むクエリの結果を無条件にキャッシュさせるには、設定 [query_cache_nondeterministic_function_handling](/operations/settings/settings#query_cache_nondeterministic_function_handling) を使用します。

システムテーブル（例: [system.processes](system-tables/processes.md) または[information_schema.tables](system-tables/information_schema.md)）を含むクエリの結果はデフォルトでキャッシュされません。システムテーブルを含むクエリの結果を無条件にキャッシュさせるには、設定 [query_cache_system_table_handling](/operations/settings/settings#query_cache_system_table_handling) を使用します。

最後に、セキュリティ上の理由から、クエリキャッシュのエントリはユーザー間で共有されません。たとえば、ユーザーAは、ユーザーBに存在しない行ポリシーを回避するために、別のユーザーと同じクエリを実行することはできません。ただし、必要に応じて、設定 [query_cache_share_between_users](/operations/settings/settings#query_cache_share_between_users) を提供することで、他のユーザー（すなわち共有）によってアクセス可能なキャッシュエントリとしてマークすることもできます。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseクエリキャッシュの紹介](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)
