---
slug: /operations/settings/query-complexity
sidebar_position: 59
sidebar_label: クエリの複雑さに対する制限
title: "クエリの複雑さに対する制限"
description: "クエリの複雑さを制限する設定。"
---


# クエリの複雑さに対する制限

クエリの複雑さに対する制限は設定の一部です。
それらはユーザーインターフェースからの安全な実行を提供するために使用されます。
ほとんどの制限は `SELECT` にのみ適用されます。分散クエリ処理の場合、制限は各サーバーごとに適用されます。

ClickHouse はデータのパーツに対して制限を確認しますが、各行ではありません。つまり、データパーツのサイズによって制限の値を超えることができます。

「何かの最大量」に関する制限は 0 の値を取ることができ、これは「無制限」を意味します。
ほとんどの制限には 'overflow_mode' 設定もあり、制限を超えた場合に何を行うかを指定します。
それは `throw` または `break` のいずれかの値を取ることができます。集約に関する制限 (group_by_overflow_mode) には `any` の値もあります。

`throw` – 例外をスローします (デフォルト)。

`break` – クエリの実行を停止し、部分的な結果を返します。データソースが不足したかのように。

`any (group_by_overflow_mode 用にのみ)` – セットに入ったキーの集約を継続しますが、新しいキーはセットに追加しません。

## max_memory_usage {#settings_max_memory_usage}

単一サーバーでクエリを実行するために使用する最大 RAM の量。

デフォルト設定は無制限です ( `0` に設定)。

クラウドのデフォルト値: レプリカの RAM の量に依存します。

設定は利用可能なメモリの量やマシンの総メモリ量を考慮しません。
制限は単一のサーバー内の単一クエリに適用されます。
現在のクエリごとのメモリ消費量を確認するには、`SHOW PROCESSLIST` を使用できます。
さらに、各クエリのピークメモリ消費量が追跡され、ログに記録されます。

特定の集約関数の状態についてはメモリ使用量は監視されません。

`String` および `Array` 引数からの集約関数 `min`、`max`、`any`、`anyLast`、`argMin`、`argMax` の状態については、メモリ使用量が完全に追跡されません。

メモリ消費は、`max_memory_usage_for_user` および [max_server_memory_usage](../../operations/server-configuration-parameters/settings.md#max_server_memory_usage) というパラメータによっても制限されます。

## max_memory_usage_for_user {#max-memory-usage-for-user}

単一サーバーでユーザーのクエリを実行するために使用する最大 RAM の量。

デフォルト値は [Settings.h](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/Settings.h#L288) で定義されています。デフォルトでは、量に制限はありません ( `max_memory_usage_for_user = 0` )。

[ max_memory_usage](#settings_max_memory_usage) の説明も参照してください。

たとえば、ユーザー `clickhouse_read` のために `max_memory_usage_for_user` を 1000 バイトに設定したい場合、次のステートメントを使用できます。

``` sql
ALTER USER clickhouse_read SETTINGS max_memory_usage_for_user = 1000;
```

動作したかどうか確認するには、クライアントからログアウトして再ログインし、次の `getSetting` 関数を使用します。

```sql
SELECT getSetting('max_memory_usage_for_user');
```

## max_rows_to_read {#max-rows-to-read}

次の制限は各ブロックでチェックできます (各行ではなく)。つまり、制限を少し超えることができます。

クエリを実行するときにテーブルから読み取れる最大行数です。

## max_bytes_to_read {#max-bytes-to-read}

クエリを実行するときにテーブルから読み取れる最大バイト数 (未圧縮データ) です。

## read_overflow_mode {#read-overflow-mode}

読み取るデータの量がいずれかの制限を超えた場合にどうするか: 'throw' または 'break'。デフォルトは throw です。

## max_rows_to_read_leaf {#max-rows-to-read-leaf}

次の制限は各ブロックでチェックできます (各行ではなく)。つまり、制限を少し超えることができます。

分散クエリを実行する際、リーフノードのローカルテーブルから読み取れる最大行数です。
分散クエリは各シャード (リーフ) に対して複数のサブクエリを発行できますが、この制限はリーフノードの読み取り段階でのみチェックされ、ルートノードでの結果マージ段階では無視されます。たとえば、クラスターが 2 つのシャードで構成され、それぞれのシャードが 100 行のテーブルを含む場合、`max_rows_to_read=150` を設定した分散クエリは、合計 200 行であるため失敗します。一方、`max_rows_to_read_leaf=150` を指定したクエリは、リーフノードが最大 100 行を読み取るため成功します。

## max_bytes_to_read_leaf {#max-bytes-to-read-leaf}

分散クエリを実行する際、リーフノードのローカルテーブルから読み取れる最大バイト数 (未圧縮データ) です。分散クエリは各シャード (リーフ) に対して複数のサブクエリを発行できますが、この制限はリーフノードの読み取り段階でのみチェックされ、ルートノードでの結果マージ段階では無視されます。
たとえば、クラスターが 2 つのシャードで構成され、それぞれのシャードが 100 バイトのデータを持つテーブルを含む場合、`max_bytes_to_read=150` を設定した分散クエリは合計 200 バイトのデータを読み取ろうとするため失敗します。一方、`max_bytes_to_read_leaf=150` を指定したクエリは、リーフノードが最大 100 バイトを読み取るため成功します。

## read_overflow_mode_leaf {#read-overflow-mode-leaf}

リーフノードで読み取るデータの量がいずれかのリーフ制限を超えた場合にどうするか: 'throw' または 'break'。デフォルトは throw です。

## max_rows_to_group_by {#settings-max-rows-to-group-by}

集約から得られるユニークキーの最大数。この設定は、集約時のメモリ消費を制限することを可能にします。

## group_by_overflow_mode {#group-by-overflow-mode}

集約に対するユニークキーの数が制限を超えた場合にどうするか: 'throw'、'break'、または 'any'。デフォルトは throw です。
'any' 値を使用することで、GROUP BY の近似を実行できます。この近似の質はデータの統計的性質に依存します。

## max_bytes_before_external_group_by {#settings-max_bytes_before_external_group_by}

外部メモリでの `GROUP BY` 句の実行を有効または無効にします。[GROUP BY in external memory](/sql-reference/statements/select/group-by#group-by-in-external-memory) を参照してください。

可能な値:

- 単一の [GROUP BY](/sql-reference/statements/select/group-by) 操作に使用できる最大 RAM の容量 (バイト単位)。
- 0 — 外部メモリでの `GROUP BY` が無効。

デフォルト値: `0`。

クラウドデフォルト値: レプリカごとのメモリ量の半分。

## max_bytes_ratio_before_external_group_by {#settings-max_bytes_ratio_before_external_group_by}

`GROUP BY` に許可される利用可能なメモリの比率。これに達したら、集約のために外部メモリを使用します。

たとえば、`0.6` に設定すると、`GROUP BY` は実行開始時に利用可能なメモリ (サーバー/ユーザー/マージに対して) の `60%` を使用することを許可し、その後外部集約を使用し始めます。

デフォルト値: `0.5`。

## max_bytes_before_external_sort {#settings-max_bytes_before_external_sort}

外部メモリでの `ORDER BY` 句の実行を有効または無効にします。[ORDER BY Implementation Details](../../sql-reference/statements/select/order-by.md#implementation-details) を参照してください。

- 単一の [ORDER BY](../../sql-reference/statements/select/order-by.md) 操作に使用できる最大 RAM の容量 (バイト単位)。推奨値は利用可能なシステムメモリの半分です。
- 0 — 外部メモリでの `ORDER BY` が無効。

デフォルト値: 0。

クラウドデフォルト値: レプリカごとのメモリ量の半分。

## max_bytes_ratio_before_external_sort {#settings-max_bytes_ratio_before_external_sort}

`ORDER BY` に許可される利用可能なメモリの比率。これに達したら、外部ソートを使用します。

たとえば、`0.6` に設定すると、`ORDER BY` は実行開始時に利用可能なメモリ (サーバー/ユーザー/マージに対して) の `60%` を使用することを許可し、その後外部ソートを使用し始めます。

デフォルト値: `0.5`。

## max_rows_to_sort {#max-rows-to-sort}

ソート前の最大行数。この設定は、ソート中のメモリ消費を制限することを可能にします。

## max_bytes_to_sort {#max-bytes-to-sort}

ソート前の最大バイト数。

## sort_overflow_mode {#sort-overflow-mode}

ソート前に受け取った行数がいずれかの制限を超えた場合にどうするか: 'throw' または 'break'。デフォルトは throw です。

## max_result_rows {#setting-max_result_rows}

結果の行数の制限。サブクエリや、分散クエリの一部を実行するリモートサーバーに対してもチェックされます。値が `0` の場合は制限は適用されません。

デフォルト値: `0`。

クラウドデフォルト値: `0`。

## max_result_bytes {#max-result-bytes}

結果のバイト数の制限。前の設定と同じです。

## result_overflow_mode {#result-overflow-mode}

結果の量がいずれかの制限を超えた場合にどうするか: 'throw' または 'break'。

'break' を使うことは、LIMIT を使用することに似ています。`Break` はブロックレベルでのみ実行を中断します。つまり、返される行の量は [max_result_rows](#setting-max_result_rows) より大きく、[max_block_size](/operations/settings/settings#max_block_size) の倍数であり、[max_threads](../../operations/settings/settings.md#max_threads) に依存します。

デフォルト値: `throw`。

クラウドデフォルト値: `throw`。

例:

``` sql
SET max_threads = 3, max_block_size = 3333;
SET max_result_rows = 3334, result_overflow_mode = 'break';

SELECT *
FROM numbers_mt(100000)
FORMAT Null;
```

結果:

``` text
6666 行がセットに含まれています。 ...
```

## max_execution_time {#max-execution-time}

最大クエリ実行時間（秒単位）。
この時点では、ソートステージのいずれか、または集約関数のマージおよび最終段階ではチェックされません。

`max_execution_time` パラメータは理解するのが少し難しい場合があります。
このパラメータは、現在のクエリの実行速度に対して補間の基準で動作します（この動作は [timeout_before_checking_execution_speed](#timeout-before-checking-execution-speed) によって制御されます）。
ClickHouse は、予測される実行時間が指定された `max_execution_time` を超える場合、クエリを中断します。
たとえば、`max_execution_time` が 3600 秒（1 時間）に設定されている場合、ClickHouse は推定時間がこの 3600 秒の制限を超えるとクエリを終了します。
`timeout_before_checking_execution_speed ` を 0 に設定すると、ClickHouse は `max_execution_time` の基準として時計時間を使用します。

## timeout_overflow_mode {#timeout-overflow-mode}

クエリの実行が `max_execution_time` より長い場合、または見積もり実行時間が `max_estimated_execution_time` より長い場合にどうするか: `throw` または `break`。デフォルトは `throw` です。

## max_execution_time_leaf {#max_execution_time_leaf}

`max_execution_time` と同様の意味ですが、分散クエリやリモートクエリのリーフノードにのみ適用されます。

たとえば、リーフノードでの実行時間を `10s` に制限したいが初期ノードで制限がない場合、ネストされたサブクエリ設定で `max_execution_time` を持つ代わりに、次のようにクエリ設定を使用します。

``` sql
SELECT count() FROM cluster(cluster, view(SELECT * FROM t SETTINGS max_execution_time = 10));
```

代わりに `max_execution_time_leaf` を次のようにクエリ設定として使用できます。

``` sql
SELECT count() FROM cluster(cluster, view(SELECT * FROM t)) SETTINGS max_execution_time_leaf = 10;
```

## timeout_overflow_mode_leaf {#timeout_overflow_mode_leaf}

リーフノードのクエリが `max_execution_time_leaf` より長い場合にどうするか: `throw` または `break`。デフォルトは `throw` です。

## min_execution_speed {#min-execution-speed}

秒あたりの最小実行速度。'timeout_before_checking_execution_speed' が期限切れの際に各データブロックで確認されます。実行速度がそれより低い場合は、例外がスローされます。

## min_execution_speed_bytes {#min-execution-speed-bytes}

秒あたりの最小実行バイト数。'timeout_before_checking_execution_speed' が期限切れの際に各データブロックで確認されます。実行速度がそれより低い場合は、例外がスローされます。

## max_execution_speed {#max-execution-speed}

秒あたりの最大実行行数。'timeout_before_checking_execution_speed' が期限切れの際に各データブロックで確認されます。実行速度が高い場合、実行速度が低下します。

## max_execution_speed_bytes {#max-execution-speed-bytes}

秒あたりの最大実行バイト数。'timeout_before_checking_execution_speed' が期限切れの際に各データブロックで確認されます。実行速度が高い場合、実行速度が低下します。

## timeout_before_checking_execution_speed {#timeout-before-checking-execution-speed}

実行速度が遅すぎないこと（'min_execution_speed' 以上）を確認します。指定した秒数が経過した後に実行されます。

## max_estimated_execution_time {#max_estimated_execution_time}

最大クエリ推定実行時間（秒単位）。'timeout_before_checking_execution_speed' が期限切れの際に各データブロックで確認されます。

## max_columns_to_read {#max-columns-to-read}

単一のクエリでテーブルから読み取ることができる最大カラム数。クエリがより多くのカラムを読み取ることを要求する場合、例外をスローします。

## max_temporary_columns {#max-temporary-columns}

クエリを実行しているときに RAM に同時に保持する必要がある最大一時カラム数 (定数カラムを含む)。これを超える一時カラムがある場合、例外をスローします。

## max_temporary_non_const_columns {#max-temporary-non-const-columns}

'max_temporary_columns' と同様ですが、定数カラムをカウントしません。
定数カラムはクエリを実行しているときに頻繁に生成されますが、計算リソースをほぼ必要としません。

## max_subquery_depth {#max-subquery-depth}

サブクエリの最大ネスト深度。サブクエリがこれより深い場合、例外をスローします。デフォルトは 100 です。

## max_pipeline_depth {#max-pipeline-depth}

最大パイプライン深度。各データブロックがクエリ処理中に通過する変換の数に対応します。単一のサーバー内での範囲で計算されます。パイプライン深度がこれを超えると、例外をスローします。デフォルトは 1000 です。

## max_ast_depth {#max-ast-depth}

クエリ構文木の最大ネスト深度。これを超えた場合、例外をスローします。
現在、このチェックは構文解析中には行われず、クエリを解析した後にのみ行われます。つまり、あまりにも深い構文木が解析中に生成される可能性がありますが、クエリは失敗します。デフォルトは 1000 です。

## max_ast_elements {#max-ast-elements}

クエリ構文木の最大要素数。これを超えた場合、例外をスローします。
この設定も前の設定と同様に、クエリが解析された後にのみチェックされます。デフォルトは 50,000 です。

## max_rows_in_set {#max-rows-in-set}

サブクエリから作成された IN 句のデータセットにおける最大行数。

## max_bytes_in_set {#max-bytes-in-set}

サブクエリから作成された IN 句におけるセットが使用する最大バイト数（未圧縮データ）。

## set_overflow_mode {#set-overflow-mode}

データの量がいずれかの制限を超えた場合にどうするか: 'throw' または 'break'。デフォルトは throw です。

## max_rows_in_distinct {#max-rows-in-distinct}

DISTINCT を使用する際の最大異なる行数。

## max_bytes_in_distinct {#max-bytes-in-distinct}

DISTINCT を使用する際にハッシュテーブルが使用する最大バイト数。

## distinct_overflow_mode {#distinct-overflow-mode}

データの量がいずれかの制限を超えた場合にどうするか: 'throw' または 'break'。デフォルトは throw です。

## max_rows_to_transfer {#max-rows-to-transfer}

GLOBAL IN を使用する際にリモートサーバーに渡すことができる最大行数。

## max_bytes_to_transfer {#max-bytes-to-transfer}

GLOBAL IN を使用する際にリモートサーバーに渡すことができる最大バイト数（未圧縮データ）。

## transfer_overflow_mode {#transfer-overflow-mode}

データの量がいずれかの制限を超えた場合にどうするか: 'throw' または 'break'。デフォルトは throw です。

## max_rows_in_join {#settings-max_rows_in_join}

テーブルを結合する際に使用されるハッシュテーブルの行数を制限します。

この設定は [SELECT ... JOIN](/sql-reference/statements/select/join) 操作と [Join](../../engines/table-engines/special/join.md) テーブルエンジンに適用されます。

クエリに複数の結合が含まれている場合、ClickHouse はこの設定をすべての中間結果に対して確認します。

ClickHouse は制限に達した場合のさまざまなアクションを実行できます。アクションを選択するには [join_overflow_mode](#settings-join_overflow_mode) 設定を使用します。

可能な値:

- 正の整数。
- 0 — 無制限の行数。

デフォルト値: 0。

## max_bytes_in_join {#settings-max_bytes_in_join}

テーブルを結合する際に使用されるハッシュテーブルのサイズ（バイト数）を制限します。

この設定は [SELECT ... JOIN](/sql-reference/statements/select/join) 操作と [Join table engine](../../engines/table-engines/special/join.md) に適用されます。

クエリに結合が含まれている場合、ClickHouse はこの設定をすべての中間結果に対して確認します。

ClickHouse は制限に達した場合のさまざまなアクションを実行できます。アクションを選択するには [join_overflow_mode](#settings-join_overflow_mode) 設定を使用します。

可能な値:

- 正の整数。
- 0 — メモリ制御が無効。

デフォルト値: 0。

## join_overflow_mode {#settings-join_overflow_mode}

次の条件を満たすときに ClickHouse が行うアクションを定義します。

- [max_bytes_in_join](#settings-max_bytes_in_join)
- [max_rows_in_join](#settings-max_rows_in_join)

可能な値:

- `THROW` — ClickHouse は例外をスローし、操作を中断します。
- `BREAK` — ClickHouse は操作を中断し、例外をスローしません。

デフォルト値: `THROW`。

**関連項目**

- [JOIN 句](/sql-reference/statements/select/join)
- [Join テーブルエンジン](../../engines/table-engines/special/join.md)

## max_partitions_per_insert_block {#settings-max_partitions_per_insert_block}

単一の挿入ブロックに含めることができる最大パーティション数を制限します。

- 正の整数。
- 0 — 無制限のパーティション数。

デフォルト値: 100。

**詳細**

データを挿入する際、ClickHouse は挿入ブロック内のパーティション数を計算します。パーティション数が `max_partitions_per_insert_block` を超える場合、ClickHouse は `throw_on_max_partitions_per_insert_block` に基づいて警告を記録するか、例外をスローします。例外は次のテキストを持ちます。

> "単一の INSERT ブロックに対してパーティションが多すぎます（`partitions_count` パーティション、制限は " + toString(max_partitions) + "）。制限は 'max_partitions_per_insert_block' 設定によって制御されています。パーティション数が多いことは一般的な誤解です。それはサーバーの起動を遅くしたり、INSERT クエリや SELECT クエリを遅くしたりする大きなネガティブなパフォーマンス影響をもたらします。テーブルの推奨されるパーティションの総数は 1000..10000 未満です。パーティショニングは SELECT クエリを高速化するためには意図されていません（ORDER BY キーは範囲クエリを高速化するのに十分です）。パーティションはデータ操作 (DROP PARTITION など) のために意図されています。"

## throw_on_max_partitions_per_insert_block {#settings-throw_on_max_partition_per_insert_block}

`max_partitions_per_insert_block` に達したときの動作を制御できます。

- `true`  - 挿入ブロックが `max_partitions_per_insert_block` に達すると、例外が発生します。
- `false` - `max_partitions_per_insert_block` に達したときに警告を記録します。

デフォルト値: `true`

## max_temporary_data_on_disk_size_for_user {#settings_max_temporary_data_on_disk_size_for_user}

すべての同時に実行されているユーザークエリによってディスク上の一時ファイルが消費する最大データ量（バイト単位）。
ゼロは無制限を意味します。

デフォルト値: 0。

## max_temporary_data_on_disk_size_for_query {#settings_max_temporary_data_on_disk_size_for_query}

すべての同時に実行されているクエリによってディスク上の一時ファイルが消費する最大データ量（バイト単位）。
ゼロは無制限を意味します。

デフォルト値: 0。

## max_sessions_for_user {#max-sessions-per-user}

ClickHouse サーバーへの認証されたユーザーごとの最大同時セッション数。

例:

``` xml
<profiles>
    <single_session_profile>
        <max_sessions_for_user>1</max_sessions_for_user>
    </single_session_profile>
    <two_sessions_profile>
        <max_sessions_for_user>2</max_sessions_for_user>
    </two_sessions_profile>
    <unlimited_sessions_profile>
        <max_sessions_for_user>0</max_sessions_for_user>
    </unlimited_sessions_profile>
</profiles>
<users>
     <!-- ユーザーアリスは、同時に1回のClickHouseサーバーに接続できます。 -->
    <Alice>
        <profile>single_session_user</profile>
    </Alice>
    <!-- ユーザー ボブは、同時に 2 回のセッションを使用できます。 -->
    <Bob>
        <profile>two_sessions_profile</profile>
    </Bob>
    <!-- ユーザー チャールズは、無制限の同時セッションを使用できます。 -->
    <Charles>
       <profile>unlimited_sessions_profile</profile>
    </Charles>
</users>
```

デフォルト値: 0 (同時セッションの無限数)。

## max_partitions_to_read {#max-partitions-to-read}

1 回のクエリでアクセスできるパーティションの最大数を制限します。

テーブル作成時に指定された設定値は、クエリレベルの設定を介して上書きできます。

可能な値:

- 任意の正の整数。

デフォルト値: -1 (無制限)。

テーブルの設定において、MergeTree 設定 [max_partitions_to_read](merge-tree-settings#max-partitions-to-read) を指定することもできます。
