---
slug: /operations/settings/query-complexity
sidebar_position: 59
sidebar_label: クエリの複雑さに対する制限
title: "クエリの複雑さに対する制限"
description: "クエリの複雑さを制限する設定。"
---

# クエリの複雑さに対する制限

クエリの複雑さに対する制限は設定の一部です。  
これらはユーザーインターフェースからの安全な実行を提供するために使用されます。  
ほとんどの制限は `SELECT` にのみ適用されます。分散クエリ処理では、各サーバーごとに制限が適用されます。

ClickHouseはデータの部分に対して制限をチェックし、各行ではなく、データの部分のサイズを超えることができます。

「何かの最大量に関する制限」は、制限なしを意味する値0を取ることができます。  
ほとんどの制限には、制限を超えたときに何をするかを指定する `overflow_mode` 設定もあります。  
これは `throw` または `break` のいずれかの値を取ることができます。集計に関する制限（group_by_overflow_mode）は `any` の値も持っています。

`throw` – 例外をスローします（デフォルト）。

`break` – クエリの実行を停止し、ソースデータが尽きたかのように部分結果を返します。

`any (group_by_overflow_mode のみ)` – セットに入ったキーの集計を続けますが、新しいキーはセットに追加しません。

## max_memory_usage {#settings_max_memory_usage}

単一のサーバー上でクエリを実行するために使用される最大RAM量です。

デフォルト設定は無制限です（`0` に設定）。

クラウドのデフォルト値: レプリカのRAM量に依存します。

この設定は使用可能なメモリの量やマシン全体のメモリ量を考慮しません。  
制限は単一のサーバー内の単一のクエリに適用されます。  
各クエリの現在のメモリ消費量を確認するには `SHOW PROCESSLIST` を使用できます。  
さらに、各クエリのピークメモリ消費量が追跡され、ログに書き込まれます。

特定の集約関数の状態に対してメモリ使用量は監視されません。

`String` および `Array` 引数からの `min`、`max`、`any`、`anyLast`、`argMin`、`argMax` の集約関数の状態に対するメモリ使用量は完全には追跡されません。

メモリ消費は、`max_memory_usage_for_user` および [max_server_memory_usage](../../operations/server-configuration-parameters/settings.md#max_server_memory_usage) パラメータによっても制限されます。

## max_memory_usage_for_user {#max-memory-usage-for-user}

単一のサーバーでユーザーのクエリを実行するために使用される最大RAM量です。

デフォルト値は [Settings.h](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/Settings.h#L288) で定義されています。  
デフォルトでは、量は制限されていません（`max_memory_usage_for_user = 0`）。

また [max_memory_usage](#settings_max_memory_usage) の説明も参照してください。

たとえば、ユーザー名 `clickhouse_read` に対して `max_memory_usage_for_user` を1000バイトに設定したい場合は、次のステートメントを使用できます。

``` sql
ALTER USER clickhouse_read SETTINGS max_memory_usage_for_user = 1000;
```

正しく設定されたことを確認するには、クライアントからログアウトし再度ログインした後、`getSetting` 関数を使用します。

```sql
SELECT getSetting('max_memory_usage_for_user');
```

## max_rows_to_read {#max-rows-to-read}

各ブロック（各行ではなく）でチェックされる次の制限があります。つまり、制限を少し超えても問題ありません。

クエリを実行する際に、テーブルから読み取ることができる最大行数です。

## max_bytes_to_read {#max-bytes-to-read}

クエリを実行する際に、テーブルから読み取ることができる最大バイト数（非圧縮データ）です。

## read_overflow_mode {#read-overflow-mode}

読み取ったデータの量が制限の1つを超える場合に何をするか： 'throw' または 'break'。デフォルトは throw です。

## max_rows_to_read_leaf {#max-rows-to-read-leaf}

各ブロック（各行ではなく）でチェックされる次の制限があります。つまり、制限を少し超えても問題ありません。

分散クエリを実行する際に、リーフノードのローカルテーブルから読み取ることができる最大行数です。  
分散クエリは各シャード（リーフ）に対して複数のサブクエリを出すことができますが、この制限は読み取り段階でリーフノードにのみチェックされ、ルートノードでの結果マージ段階では無視されます。  
たとえば、クラスターが2つのシャードで構成されていて、それぞれのシャードが100行のテーブルを含む場合、`max_rows_to_read=150` の設定で両方のテーブルからすべてのデータを読み取ることを想定した分散クエリは失敗します。合計で200行になるからです。一方、`max_rows_to_read_leaf=150` のクエリは成功します。これは、リーフノードが最大で100行を読み取るからです。

## max_bytes_to_read_leaf {#max-bytes-to-read-leaf}

分散クエリを実行する際に、リーフノードのローカルテーブルから読み取ることができる最大バイト数（非圧縮データ）です。  
分散クエリは各シャード（リーフ）に対して複数のサブクエリを出すことができますが、この制限は読み取り段階でリーフノードにのみチェックされ、ルートノードでの結果マージ段階では無視されます。  
たとえば、クラスターが2つのシャードで構成されていて、それぞれのシャードが100バイトのデータを含むテーブルを持つ場合、`max_bytes_to_read=150` の設定で両方のテーブルからすべてのデータを読み取ることを想定した分散クエリは失敗します。合計で200バイトになるからです。一方、`max_bytes_to_read_leaf=150` のクエリは成功します。これは、リーフノードが最大で100バイトを読み取るからです。

## read_overflow_mode_leaf {#read-overflow-mode-leaf}

リーフノードで読み取ったデータの量が制限を超えた場合に何をするか： 'throw' または 'break'。デフォルトは throw です。

## max_rows_to_group_by {#settings-max-rows-to-group-by}

集計から受け取る最大ユニークキー数。この設定により、集計時のメモリ消費量を制限できます。

## group_by_overflow_mode {#group-by-overflow-mode}

集計のためのユニークキー数が制限を超えた場合に何をするか： 'throw'、'break'、または 'any'。デフォルトは throw です。  
'any' 値を使用すると、GROUP BY の近似を実行できます。この近似の質はデータの統計的性質に依存します。

## max_bytes_before_external_group_by {#settings-max_bytes_before_external_group_by}

外部メモリでの `GROUP BY` 句の実行を有効または無効にします。 [外部メモリでのGROUP BY](../../sql-reference/statements/select/group-by.md#select-group-by-in-external-memory) を参照してください。

可能な値：

- 単一の [GROUP BY](../../sql-reference/statements/select/group-by.md#select-group-by-clause) 操作に使用できる最大RAM量（バイト）。
- 0 — 外部メモリでの `GROUP BY` 無効。

デフォルト値: `0`。

クラウドのデフォルト値: レプリカごとのメモリ量の半分。

## max_bytes_ratio_before_external_group_by {#settings-max_bytes_ratio_before_external_group_by}

`GROUP BY` に許可されている使用可能なメモリの比率で、これに達すると外部メモリを使用して集約します。

たとえば、0.6 に設定すると、`GROUP BY` は実行開始時に使用可能なメモリの `60%` を使用でき、その後、外部集約の使用を開始します。

デフォルト値: `0.5`。

## max_bytes_before_external_sort {#settings-max_bytes_before_external_sort}

外部メモリでの `ORDER BY` 句の実行を有効または無効にします。 [ORDER BY 実装の詳細](../../sql-reference/statements/select/order-by.md#implementation-details) を参照してください。

- 単一の [ORDER BY](../../sql-reference/statements/select/order-by.md) 操作に使用できる最大RAM量（バイト）。推奨される値は使用可能なシステムメモリの半分です。
- 0 — 外部メモリでの `ORDER BY` 無効。

デフォルト値: 0。

クラウドのデフォルト値: レプリカごとのメモリ量の半分。

## max_bytes_ratio_before_external_sort {#settings-max_bytes_ratio_before_external_sort}

`ORDER BY` に許可されている使用可能なメモリの比率で、これに達すると外部ソートを使用します。

たとえば、0.6 に設定すると、`ORDER BY` は実行開始時に使用可能なメモリの `60%` を使用でき、その後、外部ソートの使用を開始します。

デフォルト値: `0.5`。

## max_rows_to_sort {#max-rows-to-sort}

ソート前の最大行数。この設定により、ソート時のメモリ消費量を制限できます。

## max_bytes_to_sort {#max-bytes-to-sort}

ソート前の最大バイト数です。

## sort_overflow_mode {#sort-overflow-mode}

ソート前に受け取った行数が制限の1つを超えた場合に何をするか： 'throw' または 'break'。デフォルトは throw です。

## max_result_rows {#setting-max_result_rows}

結果に含まれる行数の制限。また、サブクエリおよび分散クエリの各サーバーでもチェックされます。値が `0` の場合、制限は適用されません。

デフォルト値: `0`。

クラウドのデフォルト値: `0`。

## max_result_bytes {#max-result-bytes}

結果に含まれるバイト数の制限。同様に、前の設定と同じです。

## result_overflow_mode {#result-overflow-mode}

結果のボリュームが制限の1つを超えた場合に何をするか： 'throw' または 'break'。

'break' の使用は LIMIT を使用することに似ています。 `Break` はブロックレベルでのみ実行を中止します。つまり、返される行の数が [max_result_rows](#setting-max_result_rows)、[max_block_size](../../operations/settings/settings.md#setting-max_block_size) の倍数であり、[max_threads](../../operations/settings/settings.md#max_threads) に依存します。

デフォルト値: `throw`。

クラウドのデフォルト値: `throw`。

例：

``` sql
SET max_threads = 3, max_block_size = 3333;
SET max_result_rows = 3334, result_overflow_mode = 'break';

SELECT *
FROM numbers_mt(100000)
FORMAT Null;
```

結果:

``` text
6666 行のセット ...
```

## max_execution_time {#max-execution-time}

最大クエリ実行時間（秒）です。  
この時間中、ソート段階の1つや、集約関数のマージ時にはチェックされません。

`max_execution_time` パラメータは理解するのが少し難しい場合があります。  
これは、現在のクエリ実行速度に対する補間に基づいて動作します（この動作は [timeout_before_checking_execution_speed](#timeout-before-checking-execution-speed) によって制御されます）。  
ClickHouseは、期待される実行時間が指定された `max_execution_time` を超えた場合、クエリを中断します。  
デフォルトでは、`timeout_before_checking_execution_speed` は10秒に設定されています。つまり、クエリが10秒実行された後、ClickHouseは総実行時間の推定を開始します。  
たとえば、`max_execution_time` が3600秒（1時間）に設定されている場合、推定時間がこの3600秒の制限を超えた場合、ClickHouseはクエリを終了します。  
`timeout_before_checking_execution_speed `を0に設定すると、ClickHouseは `max_execution_time` の基準として時計の時間を使用します。

## timeout_overflow_mode {#timeout-overflow-mode}

クエリが `max_execution_time` よりも長く実行される場合、または推定実行時間が `max_estimated_execution_time` よりも長くなる場合に何をするか： `throw` または `break`。デフォルトは `throw` です。

## max_execution_time_leaf {#max_execution_time_leaf}

`max_execution_time` と類似のセマンティクスですが、分散またはリモートクエリに対してのみリーフノードで適用されます。

たとえば、リーフノードの実行時間を `10s` に制限したいが、初期ノードには制限を設けたくない場合は、ネストされたサブクエリ設定の `max_execution_time` の代わりに次のように記述します。

``` sql
SELECT count() FROM cluster(cluster, view(SELECT * FROM t SETTINGS max_execution_time = 10));
```

次のようにクエリ設定として `max_execution_time_leaf` を使用できます：

``` sql
SELECT count() FROM cluster(cluster, view(SELECT * FROM t)) SETTINGS max_execution_time_leaf = 10;
```

## timeout_overflow_mode_leaf {#timeout_overflow_mode_leaf}

リーフノードでクエリの実行が `max_execution_time_leaf` よりも長く続いた場合、何をするか： `throw` または `break`。デフォルトは `throw` です。

## min_execution_speed {#min-execution-speed}

秒あたりの最小実行速度。'timeout_before_checking_execution_speed' が切れると、各データブロックでチェックされます。  
実行速度がこれを下回ると、例外がスローされます。

## min_execution_speed_bytes {#min-execution-speed-bytes}

秒あたりの最小実行バイト数。'timeout_before_checking_execution_speed' が切れると、各データブロックでチェックされます。  
実行速度がこれを下回ると、例外がスローされます。

## max_execution_speed {#max-execution-speed}

秒あたりの最大実行行数。'timeout_before_checking_execution_speed' が切れると、各データブロックでチェックされます。  
実行速度がこれを超えると、実行速度が減少します。

## max_execution_speed_bytes {#max-execution-speed-bytes}

秒あたりの最大実行バイト数。'timeout_before_checking_execution_speed' が切れると、各データブロックでチェックされます。  
実行速度がこれを超えると、実行速度が減少します。

## timeout_before_checking_execution_speed {#timeout-before-checking-execution-speed}

指定された秒数が経過した後、実行速度があまりにも遅くないこと（'min_execution_speed' 以上）を確認します。

## max_estimated_execution_time {#max_estimated_execution_time}

最大クエリ推定実行時間（秒）。'timeout_before_checking_execution_speed' が切れると、各データブロックでチェックされます。

## max_columns_to_read {#max-columns-to-read}

単一のクエリでテーブルから読み取ることができる最大カラム数です。クエリがより多くのカラムの読み取りを要求した場合は、例外がスローされます。

## max_temporary_columns {#max-temporary-columns}

クエリを実行する際にRAM内に同時に保持する必要がある最大一時カラム数（定数カラムを含む）。  
この数を超える一時カラムがあると、例外がスローされます。

## max_temporary_non_const_columns {#max-temporary-non-const-columns}

'`max_temporary_columns` と同じですが、定数カラムをカウントしません。  
定数カラムはクエリを実行するときに頻繁に形成されますが、ほぼゼロの計算リソースを必要とします。

## max_subquery_depth {#max-subquery-depth}

サブクエリの最大ネスト深度。サブクエリが深すぎる場合、例外がスローされます。デフォルトは100です。

## max_pipeline_depth {#max-pipeline-depth}

最大パイプラインの深さです。クエリ処理中に各データブロックが通過する変換の数に対応します。単一のサーバーの制限内でカウントされます。  
パイプラインの深さが大きすぎると、例外がスローされます。デフォルトは1000です。

## max_ast_depth {#max-ast-depth}

クエリ構文木の最大ネスト深度。これを超えると、例外がスローされます。  
この時点では、構文解析中ではなく、クエリの解析後にのみチェックされます。  
つまり、構文木が深すぎると、解析中に作成されることがありますが、クエリは失敗します。デフォルトは1000です。

## max_ast_elements {#max-ast-elements}

クエリ構文木の最大要素数。これを超えると、例外がスローされます。  
前述の設定と同様に、クエリ解析後にのみチェックされます。デフォルトは50,000です。

## max_rows_in_set {#max-rows-in-set}

サブクエリから作成されたIN句に対するデータセットの最大行数です。

## max_bytes_in_set {#max-bytes-in-set}

サブクエリから作成されたIN句で使用される最大バイト数（非圧縮データ）です。

## set_overflow_mode {#set-overflow-mode}

データの量が制限の1つを超えた場合に何をするか： 'throw' または 'break'。デフォルトは throw です。

## max_rows_in_distinct {#max-rows-in-distinct}

DISTINCTを使用する場合の最大異なる行数です。

## max_bytes_in_distinct {#max-bytes-in-distinct}

DISTINCTを使用する際にハッシュテーブルが使用する最大バイト数です。

## distinct_overflow_mode {#distinct-overflow-mode}

データの量が制限の1つを超えた場合に何をするか： 'throw' または 'break'。デフォルトは throw です。

## max_rows_to_transfer {#max-rows-to-transfer}

GLOBAL INを使用する際に、リモートサーバーに渡すことができる最大行数です。

## max_bytes_to_transfer {#max-bytes-to-transfer}

GLOBAL INを使用する際に、リモートサーバーに渡すことができる最大バイト数（非圧縮データ）です。

## transfer_overflow_mode {#transfer-overflow-mode}

データの量が制限の1つを超えた場合に何をするか： 'throw' または 'break'。デフォルトは throw です。

## max_rows_in_join {#settings-max_rows_in_join}

テーブルを結合する際に使用されるハッシュテーブルの行数を制限します。

この設定は[SELECT ... JOIN](../../sql-reference/statements/select/join.md#select-join) 操作と [Join](../../engines/table-engines/special/join.md) テーブルエンジンに適用されます。

クエリに複数の結合が含まれている場合、ClickHouseはそれぞれの中間結果に対してこの設定をチェックします。

ClickHouseは、制限に達したときにさまざまなアクションを実行できます。使用は [join_overflow_mode](#settings-join_overflow_mode) 設定を使用してアクションを選択します。

可能な値：

- 正の整数。
- 0 — 無制限の行数。

デフォルト値: 0。

## max_bytes_in_join {#settings-max_bytes_in_join}

テーブルを結合する際に使用されるハッシュテーブルのサイズ（バイト）を制限します。

この設定は[SELECT ... JOIN](../../sql-reference/statements/select/join.md#select-join) 操作および [Join table engine](../../engines/table-engines/special/join.md) に適用されます。

クエリに結合が含まれている場合、ClickHouseはそれぞれの中間結果に対してこの設定をチェックします。

ClickHouseは、制限に達したときにさまざまなアクションを実行できます。使用は [join_overflow_mode](#settings-join_overflow_mode) 設定を使用してアクションを選択します。

可能な値：

- 正の整数。
- 0 — メモリ制御は無効。

デフォルト値: 0。

## join_overflow_mode {#settings-join_overflow_mode}

以下のいずれかの結合制限に達した場合にClickHouseが実行するアクションを定義します：

- [max_bytes_in_join](#settings-max_bytes_in_join)
- [max_rows_in_join](#settings-max_rows_in_join)

可能な値：

- `THROW` — ClickHouseは例外をスローして操作を中断します。
- `BREAK` — ClickHouseは操作を中断し、例外をスローしません。

デフォルト値: `THROW`。

**関連記事**

- [JOIN句](../../sql-reference/statements/select/join.md#select-join)
- [Joinテーブルエンジン](../../engines/table-engines/special/join.md)

## max_partitions_per_insert_block {#settings-max_partitions_per_insert_block}

単一の挿入ブロック内の最大パーティション数を制限します。

- 正の整数。
- 0 — パーティションの無制限な数。

デフォルト値: 100。

**詳細**

データを挿入すると、ClickHouseは挿入ブロック内のパーティション数を計算します。  
挿入ブロック内のパーティション数が `max_partitions_per_insert_block` を超える場合、ClickHouseは警告をログに記録するか、`throw_on_max_partitions_per_insert_block` に基づいて例外をスローします。  
例外には次のテキストが含まれます：

> "単一のINSERTブロックに対してパーティションが多すぎます（`partitions_count` パーティション、制限は " + toString(max_partitions) + "）。制限は 'max_partitions_per_insert_block' 設定によって制御されます。  
大きな数のパーティションは一般的な誤解です。これにより重大なパフォーマンスの悪影響が生じる可能性があります。これにはサーバーの起動遅延、INSERTクエリの遅延、SELECTクエリの遅延が含まれます。  
テーブルの推奨パーティション数は1000～10000未満です。  
パーティションはSELECTクエリを高速化するために意図されていないことに注意してください（ORDER BYキーが範囲クエリを高速にするのに十分です）。  
パーティションはデータ操作（DROP PARTITIONなど）のために設計されています。"

## throw_on_max_partitions_per_insert_block {#settings-throw_on_max_partition_per_insert_block}

`max_partitions_per_insert_block` に達した場合の動作を制御することを許可します。

- `true`  - 挿入ブロックが `max_partitions_per_insert_block` に達したときに、例外が発生します。
- `false` - `max_partitions_per_insert_block` に達したときに警告を記録します。

デフォルト値: `true`

## max_temporary_data_on_disk_size_for_user {#settings_max_temporary_data_on_disk_size_for_user}

同時に実行されているすべてのユーザークエリの一時ファイルによるディスク消費の最大量（バイト）。  
ゼロは無制限を意味します。

デフォルト値: 0。

## max_temporary_data_on_disk_size_for_query {#settings_max_temporary_data_on_disk_size_for_query}

同時に実行されているすべてのクエリの一時ファイルによるディスク消費の最大量（バイト）。  
ゼロは無制限を意味します。

デフォルト値: 0。

## max_sessions_for_user {#max-sessions-per-user}

認証されたユーザーごとにClickHouseサーバーへの同時セッションの最大数です。

例：

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
    <!-- ユーザーAliceは、ClickHouseサーバーに1回のみ接続できます。 -->
    <Alice>
        <profile>single_session_user</profile>
    </Alice>
    <!-- ユーザーBobは2回の同時セッションを使用できます。 -->
    <Bob>
        <profile>two_sessions_profile</profile>
    </Bob>
    <!-- ユーザーCharlesは、任意の数の同時セッションを使用できます。 -->
    <Charles>
       <profile>unlimited_sessions_profile</profile>
    </Charles>
</users>
```

デフォルト値: 0（同時セッションの無限数）。  

## max_partitions_to_read {#max-partitions-to-read}

1つのクエリでアクセスできる最大パーティション数を制限します。

テーブルを作成する際に指定された設定値は、クエリレベルの設定でオーバーライドできます。

可能な値：

- 任意の正の整数。

デフォルト値: -1（無制限）。

テーブル設定でMergeTree設定 [max_partitions_to_read](merge-tree-settings#max-partitions-to-read) を指定することもできます。
