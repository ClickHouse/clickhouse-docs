---
'description': 'システムテーブルは、バックグラウンドで定期的に計算されるメトリクスを含んでいます。例えば、使用中のRAMの量です。'
'keywords':
- 'system table'
- 'asynchronous_metrics'
'slug': '/operations/system-tables/asynchronous_metrics'
'title': 'system.asynchronous_metrics'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.asynchronous_metrics

<SystemTableCloud/>

背景で定期的に計算されるメトリクスを含みます。例えば、使用中のRAMの量などです。

カラム:

- `metric` ([String](../../sql-reference/data-types/string.md)) — メトリクス名。
- `value` ([Float64](../../sql-reference/data-types/float.md)) — メトリクス値。
- `description` ([String](../../sql-reference/data-types/string.md) - メトリクスの説明)

**例**

```sql
SELECT * FROM system.asynchronous_metrics LIMIT 10
```

```text
┌─metric──────────────────────────────────┬──────value─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ AsynchronousMetricsCalculationTimeSpent │ 0.00179053 │ Time in seconds spent for calculation of asynchronous metrics (this is the overhead of asynchronous metrics).                                                                                                                                              │
│ NumberOfDetachedByUserParts             │          0 │ The total number of parts detached from MergeTree tables by users with the `ALTER TABLE DETACH` query (as opposed to unexpected, broken or ignored parts). The server does not care about detached parts and they can be removed.                          │
│ NumberOfDetachedParts                   │          0 │ The total number of parts detached from MergeTree tables. A part can be detached by a user with the `ALTER TABLE DETACH` query or by the server itself it the part is broken, unexpected or unneeded. The server does not care about detached parts and they can be removed. │
│ TotalRowsOfMergeTreeTables              │    2781309 │ Total amount of rows (records) stored in all tables of MergeTree family.                                                                                                                                                                                   │
│ TotalBytesOfMergeTreeTables             │    7741926 │ Total amount of bytes (compressed, including data and indices) stored in all tables of MergeTree family.                                                                                                                                                   │
│ NumberOfTables                          │         93 │ Total number of tables summed across the databases on the server, excluding the databases that cannot contain MergeTree tables. The excluded database engines are those who generate the set of tables on the fly, like `Lazy`, `MySQL`, `PostgreSQL`, `SQlite`. │
│ NumberOfDatabases                       │          6 │ Total number of databases on the server.                                                                                                                                                                                                                   │
│ MaxPartCountForPartition                │          6 │ Maximum number of parts per partition across all partitions of all tables of MergeTree family. Values larger than 300 indicates misconfiguration, overload, or massive data loading.                                                                       │
│ ReplicasSumMergesInQueue                │          0 │ Sum of merge operations in the queue (still to be applied) across Replicated tables.                                                                                                                                                                       │
│ ReplicasSumInsertsInQueue               │          0 │ Sum of INSERT operations in the queue (still to be replicated) across Replicated tables.                                                                                                                                                                   │
└─────────────────────────────────────────┴────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

<!--- system.eventsやsystem.metricsとは異なり、非同期のメトリクスはソースコードファイル内に単純なリストとして収集されるわけではなく、src/Interpreters/ServerAsynchronousMetrics.cpp内のロジックと混在しています。
      読者の便宜のためにここに明示的にリスト化しています。 --->
## メトリクスの説明 {#metric-descriptions}
### AsynchronousHeavyMetricsCalculationTimeSpent {#asynchronousheavymetricscalculationtimespent}

非同期の重い（テーブル関連の）メトリクスの計算に要した時間（この時間は非同期メトリクスのオーバーヘッドです）。
### AsynchronousHeavyMetricsUpdateInterval {#asynchronousheavymetricsupdateinterval}

重い（テーブル関連の）メトリクスの更新間隔
### AsynchronousMetricsCalculationTimeSpent {#asynchronousmetricscalculationtimespent}

非同期メトリクスの計算に要した時間（この時間は非同期メトリクスのオーバーヘッドです）。
### AsynchronousMetricsUpdateInterval {#asynchronousmetricsupdateinterval}

メトリクスの更新間隔
### BlockActiveTime_*name* {#blockactivetime_name}

ブロックデバイスがIOリクエストを待機していた時間（秒単位）。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。ソース: `/sys/block`。詳細は https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockDiscardBytes_*name* {#blockdiscardbytes_name}

ブロックデバイスで破棄されたバイト数。これらの操作はSSDに関連します。ClickHouseでは破棄操作は使用されませんが、システム上の他のプロセスで使用される可能性があります。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。ソース: `/sys/block`。詳細は https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockDiscardMerges_*name* {#blockdiscardmerges_name}

ブロックデバイスから要求され、OSのIOスケジューラによってまとめられた破棄操作の数。これらの操作はSSDに関連します。ClickHouseでは破棄操作は使用されませんが、システム上の他のプロセスで使用される可能性があります。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。ソース: `/sys/block`。詳細は https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockDiscardOps_*name* {#blockdiscardops_name}

ブロックデバイスから要求された破棄操作の数。これらの操作はSSDに関連します。ClickHouseでは破棄操作は使用されませんが、システム上の他のプロセスで使用される可能性があります。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。ソース: `/sys/block`。詳細は https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockDiscardTime_*name* {#blockdiscardtime_name}

ブロックデバイスから要求された破棄操作に費やされた時間（秒単位）、すべての操作を合計したもの。これらの操作はSSDに関連します。ClickHouseでは破棄操作は使用されませんが、システム上の他のプロセスで使用される可能性があります。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。ソース: `/sys/block`。詳細は https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockInFlightOps_*name* {#blockinflightops_name}

この値は、デバイスドライバに発行されたがまだ完了していないI/Oリクエストの数をカウントします。これは、キューにあるがデバイスドライバに対してまだ発行されていないIOリクエストを含みません。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。ソース: `/sys/block`。詳細は https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockQueueTime_*name* {#blockqueuetime_name}

この値は、このブロックデバイス上でIOリクエストが待機していた時間（ミリ秒単位）をカウントします。複数のIOリクエストが待機している場合、この値は、待機しているリクエストの数×待機していたミリ秒の積として増加します。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。ソース: `/sys/block`。詳細は https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockReadBytes_*name* {#blockreadbytes_name}

ブロックデバイスから読み取られたバイト数。OSページキャッシュの使用により、ファイルシステムから読み取られたバイト数よりも少ない場合があります。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。ソース: `/sys/block`。詳細は https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockReadMerges_*name* {#blockreadmerges_name}

ブロックデバイスから要求され、OSのIOスケジューラによってまとめられた読み取り操作の数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。ソース: `/sys/block`。詳細は https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockReadOps_*name* {#blockreadops_name}

ブロックデバイスから要求された読み取り操作の数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。ソース: `/sys/block`。詳細は https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockReadTime_*name* {#blockreadtime_name}

ブロックデバイスから要求された読み取り操作に費やされた時間（秒単位）、すべての操作を合計したもの。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。ソース: `/sys/block`。詳細は https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockWriteBytes_*name* {#blockwritebytes_name}

ブロックデバイスに書き込まれたバイト数。OSページキャッシュの使用により、ファイルシステムに書き込まれたバイト数よりも少ない場合があります。ブロックデバイスに書き込むには、ファイルシステムへの対応する書き込みよりも後になる場合があります。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。ソース: `/sys/block`。詳細は https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockWriteMerges_*name* {#blockwritemerges_name}

ブロックデバイスから要求され、OSのIOスケジューラによってまとめられた書き込み操作の数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。ソース: `/sys/block`。詳細は https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockWriteOps_*name* {#blockwriteops_name}

ブロックデバイスから要求された書き込み操作の数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。ソース: `/sys/block`。詳細は https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockWriteTime_*name* {#blockwritetime_name}

ブロックデバイスから要求された書き込み操作に費やされた時間（秒単位）、すべての操作を合計したもの。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。ソース: `/sys/block`。詳細は https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### CPUFrequencyMHz_*name* {#cpufrequencymhz_name}

CPUの現在の周波数（MHz単位）。ほとんどの最新のCPUは、電力を節約し、Turbo Boostを利用するために、周波数を動的に調整します。
### DictionaryMaxUpdateDelay {#dictionarymaxlastsuccessfulupdatetime}

辞書の更新の最大遅延（秒単位）。
### DictionaryTotalFailedUpdates {#dictionaryloadfailed}

すべての辞書で最後の成功した読み込み以降のエラーの数。
### DiskAvailable_*name* {#diskavailable_name}

ディスク（仮想ファイルシステム）の空きバイト数。リモートファイルシステムは16EiBのような大きな値を示すことがあります。
### DiskTotal_*name* {#disktotal_name}

ディスク（仮想ファイルシステム）の総サイズ（バイト単位）。リモートファイルシステムは16EiBのような大きな値を示すことがあります。
### DiskUnreserved_*name* {#diskunreserved_name}

マージ、フェッチ、および移動のための予約なしで、ディスク（仮想ファイルシステム）の空きバイト数。リモートファイルシステムは16EiBのような大きな値を示すことがあります。
### DiskUsed_*name* {#diskused_name}

ディスク（仮想ファイルシステム）の使用バイト数。リモートファイルシステムは、この情報を提供しないことがあります。
### FilesystemCacheBytes {#filesystemcachebytes}

`cache`仮想ファイルシステムの合計バイト数。このキャッシュはディスクに保持されます。
### FilesystemCacheFiles {#filesystemcachefiles}

`cache`仮想ファイルシステムにおけるキャッシュされたファイルセグメントの合計数。このキャッシュはディスクに保持されます。
### FilesystemLogsPathAvailableBytes {#filesystemlogspathavailablebytes}

ClickHouseのログパスがマウントされているボリュームの使用可能なバイト数。この値がゼロに近づくと、設定ファイルでログのローテーションを調整する必要があります。
### FilesystemLogsPathAvailableINodes {#filesystemlogspathavailableinodes}

ClickHouseのログパスがマウントされているボリュームの使用可能なinodeの数。
### FilesystemLogsPathTotalBytes {#filesystemlogspathtotalbytes}

ClickHouseのログパスがマウントされているボリュームのサイズ（バイト単位）。ログには少なくとも10GBが推奨されます。
### FilesystemLogsPathTotalINodes {#filesystemlogspathtotalinodes}

ClickHouseのログパスがマウントされているボリュームのinodeの総数。
### FilesystemLogsPathUsedBytes {#filesystemlogspathusedbytes}

ClickHouseのログパスがマウントされているボリュームの使用バイト数。
### FilesystemLogsPathUsedINodes {#filesystemlogspathusedinodes}

ClickHouseのログパスがマウントされているボリュームの使用中のinodeの数。
### FilesystemMainPathAvailableBytes {#filesystemmainpathavailablebytes}

主なClickHouseパスがマウントされているボリュームの使用可能なバイト数。
### FilesystemMainPathAvailableINodes {#filesystemmainpathavailableinodes}

主なClickHouseパスがマウントされているボリュームの使用可能なinodeの数。この数がゼロに近づくと、設定ミスを示し、ディスクが満杯でなくても「デバイスに空き容量がありません」と表示されます。
### FilesystemMainPathTotalBytes {#filesystemmainpathtotalbytes}

主なClickHouseパスがマウントされているボリュームのサイズ（バイト単位）。
### FilesystemMainPathTotalINodes {#filesystemmainpathtotalinodes}

主なClickHouseパスがマウントされているボリュームのinodeの総数。この数が2500万未満の場合、設定ミスを示します。
### FilesystemMainPathUsedBytes {#filesystemmainpathusedbytes}

主なClickHouseパスがマウントされているボリュームの使用バイト数。
### FilesystemMainPathUsedINodes {#filesystemmainpathusedinodes}

主なClickHouseパスがマウントされているボリュームの使用中のinodeの数。この値は主にファイル数に対応します。
### HTTPThreads {#httpthreads}

HTTPインターフェースのサーバーでのスレッド数（TLSなし）。
### InterserverThreads {#interserverthreads}

レプリカ通信プロトコルのサーバーでのスレッド数（TLSなし）。
### Jitter {#jitter}

非同期メトリクスの計算のためにスレッドが予定された起動時間と実際に起動した時間の違い。全体的なシステムのレイテンシと応答性の代理指標です。
### LoadAverage*N* {#loadaveragen}

1分間の指数移動平均を用いたシステムの全体的な負荷。この負荷は、現在CPUで実行中またはIOを待機中、もしくはスケジュールされていない状態の全てのプロセス（OSカーネルのスケジューリングエンティティ）のスレッド数を表します。この数はclickhouse-serverだけでなく、すべてのプロセスを含みます。この数は、システムが過負荷の場合、CPUコアの数よりも大きくなることがあります。
### MaxPartCountForPartition {#maxpartcountforpartition}

MergeTreeファミリーのすべてのテーブルのすべてのパーティションにおけるパーツの最大数。300を超える値は設定ミス、過負荷、または大量データの読み込みを示します。
### MemoryCode {#memorycode}

サーバープロセスのマシンコードページにマッピングされた仮想メモリの量（バイト単位）。
### MemoryDataAndStack {#memorydataandstack}

スタックおよび確保されたメモリの使用のためにマッピングされた仮想メモリの量（バイト単位）。これには、スレッドごとのスタックや「mmap」システムコールで確保されたほとんどのメモリが含まれるかどうかは不明です。このメトリクスは完全性の理由でのみ存在します。監視には `MemoryResident` メトリクスの使用をお勧めします。
### MemoryResidentMax {#memoryresidentmax}

サーバープロセスによって使用される最大の物理メモリの量（バイト単位）。
### MemoryResident {#memoryresident}

サーバープロセスによって使用される物理メモリの量（バイト単位）。
### MemoryShared {#memoryshared}

サーバープロセスによって使用されている、他のプロセスと共有されているメモリの量（バイト単位）。ClickHouseは共有メモリを使用しませんが、OSによって他の理由で共有としてラベル付けされたメモリがあるかもしれません。このメトリクスは、監視する意味があまりなく、完全性の理由でのみ存在します。
### MemoryVirtual {#memoryvirtual}

サーバープロセスによって割り当てられた仮想アドレス空間のサイズ（バイト単位）。仮想アドレス空間のサイズは通常、物理メモリの消費よりもはるかに大きく、メモリ消費の推定としては使用されるべきではありません。このメトリクスの大きな値は完全に正常で、技術的な意味のみを持ちます。
### MySQLThreads {#mysqlthreads}

MySQL互換プロトコルのサーバー内のスレッド数。
### NetworkReceiveBytes_*name* {#networkreceivebytes_name}

ネットワークインターフェース経由で受信したバイト数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。
### NetworkReceiveDrop_*name* {#networkreceivedrop_name}

ネットワークインターフェースを介して受信中にパケットがドロップされたバイト数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。
### NetworkReceiveErrors_*name* {#networkreceiveerrors_name}

ネットワークインターフェースを介して受信中にエラーが発生した回数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。
### NetworkReceivePackets_*name* {#networkreceivepackets_name}

ネットワークインターフェースを介して受信したネットワークパケットの数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。
### NetworkSendBytes_*name* {#networksendbytes_name}

ネットワークインターフェースを介して送信されたバイト数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。
### NetworkSendDrop_*name* {#networksenddrop_name}

ネットワークインターフェースを介して送信中にパケットがドロップされた回数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。
### NetworkSendErrors_*name* {#networksenderrors_name}

ネットワークインターフェースを介して送信中に発生したエラー（例：TCP再送信）の回数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。
### NetworkSendPackets_*name* {#networksendpackets_name}

ネットワークインターフェースを介して送信されたネットワークパケットの数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。
### NumberOfDatabases {#numberofdatabases}

サーバー上のデータベースの総数。
### NumberOfDetachedByUserParts {#numberofdetachedbyuserparts}

`ALTER TABLE DETACH`クエリによってユーザーによって切り離されたMergeTreeテーブルからのパーツの総数（予期しない、破損した、または無視されたパーツは除く）。サーバーは切り離されたパーツを気にせず、それらは削除可能です。
### NumberOfDetachedParts {#numberofdetachedparts}

MergeTreeテーブルから切り離されたパーツの総数。パーツはユーザーによって `ALTER TABLE DETACH` クエリで切り離されたり、サーバー自身によってパーツが破損していたり、予期しない場合や不要な場合に切り離されることがあります。サーバーは切り離されたパーツを気にせず、それらは削除可能です。
### NumberOfTables {#numberoftables}

サーバー上のデータベースにわたる合計テーブル数で、MergeTreeテーブルを含むことができないデータベースは除外します。除外されるデータベースエンジンには、`Lazy`、`MySQL`、`PostgreSQL`、`SQlite` などがあります。
### OSContextSwitches {#oscontextswitches}

ホストマシンでのシステムのコンテキストスイッチの回数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。
### OSGuestNiceTime {#osguestnicetime}

Linuxカーネルの制御下にあるゲストオペレーティングシステム用の仮想CPUを実行するために費やされた時間の比率。ゲストが優先度を高く設定された場合（`man procfs`を参照）。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。このメトリクスはClickHouseには無関係ですが、完全性のために存在します。単一CPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は[0..コア数]の総和として計算されます。
### OSGuestNiceTimeCPU_*N* {#osguestnicetimecpu_n}

Linuxカーネルの制御下にあるゲストオペレーティングシステム用の仮想CPUを実行するために費やされた時間の比率。ゲストが優先度を高く設定された場合（`man procfs` を参照）。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。このメトリクスはClickHouseには無関係ですが、完全性のために存在します。単一CPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は[0..コア数]の総和として計算されます。
### OSGuestNiceTimeNormalized {#osguestnicetimenormalized}

この値は `OSGuestNiceTime` に似ていますが、CPUコアの番号で割った値で、[0..1]の範囲で測定されます。これにより、クラスター内の複数のサーバーにわたってこのメトリクスの値を平均化でき、コアの数が不均一でも、平均的なリソース利用メトリクスを取得できます。
### OSGuestTime {#osguesttime}

Linuxカーネルの制御下にあるゲストオペレーティングシステム用の仮想CPUを実行するために費やされた時間の比率（`man procfs` を参照）。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。このメトリクスはClickHouseには無関係ですが、完全性のために存在します。単一CPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は[0..コア数]の総和として計算されます。
### OSGuestTimeCPU_*N* {#osguesttimecpu_n}

Linuxカーネルの制御下にあるゲストオペレーティングシステム用の仮想CPUを実行するために費やされた時間の比率（`man procfs` を参照）。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。このメトリクスはClickHouseには無関係ですが、完全性のために存在します。単一CPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は[0..コア数]の総和として計算されます。
### OSGuestTimeNormalized {#osguesttimenormalized}

この値は `OSGuestTime` に似ていますが、CPUコアの番号で割った値で、[0..1]の範囲で測定されます。これにより、クラスター内の複数のサーバーにわたってこのメトリクスの値を平均化でき、コアの数が不均一でも、平均的なリソース利用メトリクスを取得できます。
### OSIOWaitTime {#osiowaittime}

CPUコアがコードを実行していないが、OSカーネルがこのCPUで他のプロセスを実行していない時間の比率で、プロセスがIOを待っていたためです。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。単一CPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は[0..コア数]の総和として計算されます。
### OSIOWaitTimeCPU_*N* {#osiowaittimecpu_n}

CPUコアがコードを実行していないが、OSカーネルがこのCPUで他のプロセスを実行していない時間の比率で、プロセスがIOを待っていたためです。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。単一CPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は[0..コア数]の総和として計算されます。
### OSIOWaitTimeNormalized {#osiowaittimenormalized}

この値は `OSIOWaitTime` に似ていますが、CPUコアの数で割った値で、[0..1]の範囲で測定されます。これにより、クラスター内の複数のサーバーにわたってこのメトリクスの値を平均化でき、コアの数が不均一でも、平均的なリソース利用メトリクスを取得できます。
### OSIdleTime {#osidletime}

OSカーネルの観点から、CPUコアがアイドル状態だった時間の比率（IOを待っているプロセスも準備ができていない状態）。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。CPUが内部的な理由（メモリ負荷、パイプラインの停止、分岐のミス予測、別のSMTコアの実行）により過小利用されていた時間は含まれません。単一CPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は[0..コア数]の総和として計算されます。
### OSIdleTimeCPU_*N* {#osidletimecpu_n}

OSカーネルの観点から、CPUコアがアイドル状態だった時間の比率（IOを待っているプロセスも準備ができていない状態）。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。CPUが内部的な理由（メモリ負荷、パイプラインの停止、分岐のミス予測、別のSMTコアの実行）により過小利用されていた時間は含まれません。単一CPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は[0..コア数]の総和として計算されます。
### OSIdleTimeNormalized {#osidletimenormalized}

この値は `OSIdleTime` に似ていますが、CPUコアの数で割った値で、[0..1]の範囲で測定されます。これにより、クラスター内の複数のサーバーにわたってこのメトリクスの値を平均化でき、コアの数が不均一でも、平均的なリソース利用メトリクスを取得できます。
### OSInterrupts {#osinterrupts}

ホストマシンでの割り込みの数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。
### OSIrqTime {#osirqtime}

CPU上でハードウェア割り込み要求を処理するために費やされた時間の比率。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。このメトリクスの高い値は、ハードウェアの設定ミスや非常に高いネットワーク負荷を示す可能性があります。単一CPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は[0..コア数]の総和として計算されます。
### OSIrqTimeCPU_*N* {#osirqtimecpu_n}

CPU上でハードウェア割り込み要求を処理するために費やされた時間の比率。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。このメトリクスの高い値は、ハードウェアの設定ミスや非常に高いネットワーク負荷を示す可能性があります。単一CPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は[0..コア数]の総和として計算されます。
### OSIrqTimeNormalized {#osirqtimenormalized}

この値は `OSIrqTime` に似ていますが、CPUコアの数で割った値で、[0..1]の範囲で測定されます。これにより、クラスター内の複数のサーバーにわたってこのメトリクスの値を平均化でき、コアの数が不均一でも、平均的なリソース利用メトリクスを取得できます。
### OSMemoryAvailable {#osmemoryavailable}

プログラムで使用可能なメモリの量（バイト単位）。これは `OSMemoryFreePlusCached` メトリクスに非常に似ています。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。
### OSMemoryBuffers {#osmemorybuffers}

OSカーネルバッファで使用されるメモリの量（バイト単位）。通常は小さいはずで、大きな値はOSの設定ミスを示すかもしれません。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。
### OSMemoryCached {#osmemorycached}

OSページキャッシュで使用されるメモリの量（バイト単位）。通常、ほとんどの空きメモリはOSページキャッシュで使用されるため、このメトリクスの高い値は正常で予期されます。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。
### OSMemoryFreePlusCached {#osmemoryfreepluscached}

ホストシステム上の空きメモリとOSページキャッシュメモリの合計量（バイト単位）。このメモリはプログラムが使用可能です。値は `OSMemoryAvailable` に非常に近いはずです。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。
### OSMemoryFreeWithoutCached {#osmemoryfreewithoutcached}

ホストシステム上の空きメモリの量（バイト単位）。これはOSページキャッシュメモリによって使用されるメモリは含まれません。このメモリはプログラムによっても利用可能なため、このメトリクスの値は混乱を招く可能性があります。代わりに `OSMemoryAvailable` メトリクスを参照してください。便利さのために、 `OSMemoryFreePlusCached` メトリクスも提供しており、これはOSMemoryAvailableにかなり類似しているはずです。さらに詳細は https://www.linuxatemyram.com/ を参照してください。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。
### OSMemoryTotal {#osmemorytotal}

ホストシステム上のメモリの総量（バイト単位）。
### OSNiceTime {#osnicetime}

CPUコアが優先度の高いユーザースペースコードを実行した時間の比率。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。単一CPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は[0..コア数]の総和として計算されます。
### OSNiceTimeCPU_*N* {#osnicetimecpu_n}

CPUコアが優先度の高いユーザースペースコードを実行した時間の比率。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。単一CPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は[0..コア数]の総和として計算されます。
### OSNiceTimeNormalized {#osnicetimenormalized}

この値は `OSNiceTime` に似ていますが、CPUコアの数で割った値で、[0..1]の範囲で測定されます。これにより、クラスター内の複数のサーバーにわたってこのメトリクスの値を平均化でき、コアの数が不均一でも、平均的なリソース利用メトリクスを取得できます。
### OSOpenFiles {#osopenfiles}

ホストマシン上で開いているファイルの総数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。
### OSProcessesBlocked {#osprocessesblocked}

I/Oの完了を待っている間にブロックされているスレッドの数（`man procfs`を参照）。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。
### OSProcessesCreated {#osprocessescreated}

作成されたプロセスの数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。
### OSProcessesRunning {#osprocessesrunning}

オペレーティングシステムによって実行可能（実行中または実行準備中）なスレッドの数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。
### OSSoftIrqTime {#ossoftirqtime}

CPU上でソフトウェア割り込み要求を実行するために費やされた時間の比率。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。このメトリクスの高い値は、システム上の非効率的なソフトウェアを示す可能性があります。単一CPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は[0..コア数]の総和として計算されます。
### OSSoftIrqTimeCPU_*N* {#ossoftirqtimecpu_n}

CPU上でソフトウェア割り込み要求を実行するために費やされた時間の比率。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。このメトリクスの高い値は、システム上の非効率的なソフトウェアを示す可能性があります。単一CPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は[0..コア数]の総和として計算されます。
### OSSoftIrqTimeNormalized {#ossoftirqtimenormalized}

この値は `OSSoftIrqTime` に似ていますが、CPUコアの数で割った値で、[0..1]の範囲で測定されます。これにより、クラスター内の複数のサーバーにわたってこのメトリクスの値を平均化でき、コアの数が不均一でも、平均的なリソース利用メトリクスを取得できます。
### OSStealTime {#osstealtime}

仮想化環境でのCPUが他のオペレーティングシステムで費やした時間の比率。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスを含みます。clickhouse-serverのみではありません。このメトリクスはすべての仮想化環境で表示されるものではなく、ほとんどのものはこの値を示しません。単一CPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は[0..コア数]の総和として計算されます。
### OSStealTimeCPU_*N* {#osstealtimecpu_n}

仮想環境で実行中の CPU が他のオペレーティングシステムで費やした時間の比率です。これはシステム全体のメトリックであり、ホストマシン上のすべてのプロセスが含まれており、clickhouse-server のみではありません。すべての仮想環境がこのメトリックを提供するわけではなく、ほとんどはそうではありません。単一の CPU コアの値は [0..1] の範囲になります。すべての CPU コアの値は、それらの合計として計算されます [0..num cores]。
### OSStealTimeNormalized {#osstealtimenormalized}

この値は `OSStealTime` と類似していますが、CPU コアの数で割って [0..1] の範囲で測定されます。これにより、コアの数が非均一であっても、クラスター内の複数のサーバー間でこのメトリックの値を平均化し、平均的なリソース使用率メトリックを得ることができます。
### OSSystemTime {#ossystemtime}

CPU コアが OS カーネル (システム) コードを実行していた時間の比率です。これはシステム全体のメトリックであり、ホストマシン上のすべてのプロセスが含まれており、clickhouse-server のみではありません。単一の CPU コアの値は [0..1] の範囲になります。すべての CPU コアの値は、それらの合計として計算されます [0..num cores]。
### OSSystemTimeCPU_*N* {#ossystemtimecpu_n}

CPU コアが OS カーネル (システム) コードを実行していた時間の比率です。これはシステム全体のメトリックであり、ホストマシン上のすべてのプロセスが含まれており、clickhouse-server のみではありません。単一の CPU コアの値は [0..1] の範囲になります。すべての CPU コアの値は、それらの合計として計算されます [0..num cores]。
### OSSystemTimeNormalized {#ossystemtimenormalized}

この値は `OSSystemTime` と類似していますが、CPU コアの数で割って [0..1] の範囲で測定されます。これにより、コアの数が非均一であっても、クラスター内の複数のサーバー間でこのメトリックの値を平均化し、平均的なリソース使用率メトリックを得ることができます。
### OSThreadsRunnable {#osthreadsrunnable}

OS カーネルスケジューラが見ている 'runnable' スレッドの総数。
### OSThreadsTotal {#osthreadstotal}

OS カーネルスケジューラが見ているスレッドの総数。
### OSUptime {#osuptime}

ホストサーバー (ClickHouse が実行されているマシン) の稼働時間（秒単位）。
### OSUserTime {#osusertime}

CPU コアがユーザ空間コードを実行していた時間の比率です。これはシステム全体のメトリックであり、ホストマシン上のすべてのプロセスが含まれており、clickhouse-server のみではありません。この値には、CPU がメモリ読み込み、パイプラインスタール、分岐ミス予測、別の SMT コアを実行しているために低下していた時間も含まれます。単一の CPU コアの値は [0..1] の範囲になります。すべての CPU コアの値は、それらの合計として計算されます [0..num cores]。
### OSUserTimeCPU_*N* {#osusertimecpu_n}

CPU コアがユーザ空間コードを実行していた時間の比率です。これはシステム全体のメトリックであり、ホストマシン上のすべてのプロセスが含まれており、clickhouse-server のみではありません。この値には、CPU がメモリ読み込み、パイプラインスタール、分岐ミス予測、別の SMT コアを実行しているために低下していた時間も含まれます。単一の CPU コアの値は [0..1] の範囲になります。すべての CPU コアの値は、それらの合計として計算されます [0..num cores]。
### OSUserTimeNormalized {#osusertimenormalized}

この値は `OSUserTime` と類似していますが、CPU コアの数で割って [0..1] の範囲で測定されます。これにより、コアの数が非均一であっても、クラスター内の複数のサーバー間でこのメトリックの値を平均化し、平均的なリソース使用率メトリックを得ることができます。
### PostgreSQLThreads {#postgresqlthreads}

PostgreSQL 互換プロトコルのサーバー内のスレッド数。
### ReplicasMaxAbsoluteDelay {#replicasmaxabsolutedelay}

Replicated テーブル間で、最も新しい複製されたパーツと、まだ複製されていない最も新しいデータパーツとの最大秒数差。非常に高い値は、データのないレプリカを示します。
### ReplicasMaxInsertsInQueue {#replicasmaxinsertsinqueue}

Replicated テーブル間で、キュー内の最大 INSERT 操作数（まだ複製されていない）。
### ReplicasMaxMergesInQueue {#replicasmaxmergesinqueue}

Replicated テーブル間で、キュー内の最大マージ操作数（まだ適用されていない）。
### ReplicasMaxQueueSize {#replicasmaxqueuesize}

Replicated テーブル間での最大キューサイズ（取得、マージなどの操作数）。
### ReplicasMaxRelativeDelay {#replicasmaxrelativedelay}

Replicated テーブル間で、レプリカの遅延と同じテーブルの最も最新のレプリカの遅延との最大差。
### ReplicasSumInsertsInQueue {#replicassuminsertsinqueue}

Replicated テーブル間でのキュー内の INSERT 操作の合計（まだ複製されていない）。
### ReplicasSumMergesInQueue {#replicassummergesinqueue}

Replicated テーブル間でのキュー内のマージ操作の合計（まだ適用されていない）。
### ReplicasSumQueueSize {#replicassumqueuesize}

Replicated テーブル間での合計キューサイズ（取得、マージなどの操作数）。
### TCPThreads {#tcpthreads}

TCP プロトコル（TLSなし）のサーバー内のスレッド数。
### Temperature_*N* {#temperature_n}

対応するデバイスの温度（℃）。センサーは非現実的な値を返すことがあります。ソース: `/sys/class/thermal`
### Temperature_*name* {#temperature_name}

対応するハードウェアモニターおよび対応するセンサーが報告する温度（℃）。センサーは非現実的な値を返すことがあります。ソース: `/sys/class/hwmon`
### TotalBytesOfMergeTreeTables {#totalbytesofmergetreetables}

MergeTree ファミリーのすべてのテーブルに保存されているバイト数（圧縮済み、データおよびインデックスを含む）の合計。
### TotalPartsOfMergeTreeTables {#totalpartsofmergetreetables}

MergeTree ファミリーのすべてのテーブルにおけるデータパーツの合計。10,000 より大きい数字は、サーバーの起動時間に悪影響を及ぼし、パーティションキーの不合理な選択を示す可能性があります。
### TotalPrimaryKeyBytesInMemory {#totalprimarykeybytesinmemory}

主キー値に使用されるメモリの総量（バイト単位）（アクティブパーツのみを考慮）。
### TotalPrimaryKeyBytesInMemoryAllocated {#totalprimarykeybytesinmemoryallocated}

主キー値に予約されたメモリの総量（バイト単位）（アクティブパーツのみを考慮）。
### TotalRowsOfMergeTreeTables {#totalrowsofmergetreetables}

MergeTree ファミリーのすべてのテーブルに保存されている行（レコード）の総数。
### Uptime {#uptime}

サーバーの稼働時間（秒単位）。接続を受け入れる前のサーバー初期化に費やされた時間が含まれています。
### jemalloc.active {#jemallocactive}

低レベルメモリアロケータ (jemalloc) の内部メトリック。詳しくは [https://jemalloc.net/jemalloc.3.html](https://jemalloc.net/jemalloc.3.html) を参照してください。
### jemalloc.allocated {#jemallocallocated}

低レベルメモリアロケータ (jemalloc) の内部メトリック。詳しくは [https://jemalloc.net/jemalloc.3.html](https://jemalloc.net/jemalloc.3.html) を参照してください。
### jemalloc.arenas.all.dirty_purged {#jemallocarenasalldirty_purged}

低レベルメモリアロケータ (jemalloc) の内部メトリック。詳しくは [https://jemalloc.net/jemalloc.3.html](https://jemalloc.net/jemalloc.3.html) を参照してください。
### jemalloc.arenas.all.muzzy_purged {#jemallocarenasallmuzzy_purged}

低レベルメモリアロケータ (jemalloc) の内部メトリック。詳しくは [https://jemalloc.net/jemalloc.3.html](https://jemalloc.net/jemalloc.3.html) を参照してください。
### jemalloc.arenas.all.pactive {#jemallocarenasallpactive}

低レベルメモリアロケータ (jemalloc) の内部メトリック。詳しくは [https://jemalloc.net/jemalloc.3.html](https://jemalloc.net/jemalloc.3.html) を参照してください。
### jemalloc.arenas.all.pdirty {#jemallocarenasallpdirty}

低レベルメモリアロケータ (jemalloc) の内部メトリック。詳しくは [https://jemalloc.net/jemalloc.3.html](https://jemalloc.net/jemalloc.3.html) を参照してください。
### jemalloc.arenas.all.pmuzzy {#jemallocarenasallpmuzzy}

低レベルメモリアロケータ (jemalloc) の内部メトリック。詳しくは [https://jemalloc.net/jemalloc.3.html](https://jemalloc.net/jemalloc.3.html) を参照してください。
### jemalloc.background_thread.num_runs {#jemallocbackground_threadnum_runs}

低レベルメモリアロケータ (jemalloc) の内部メトリック。詳しくは [https://jemalloc.net/jemalloc.3.html](https://jemalloc.net/jemalloc.3.html) を参照してください。
### jemalloc.background_thread.num_threads {#jemallocbackground_threadnum_threads}

低レベルメモリアロケータ (jemalloc) の内部メトリック。詳しくは [https://jemalloc.net/jemalloc.3.html](https://jemalloc.net/jemalloc.3.html) を参照してください。
### jemalloc.background_thread.run_intervals {#jemallocbackground_threadrun_intervals}

低レベルメモリアロケータ (jemalloc) の内部メトリック。詳しくは [https://jemalloc.net/jemalloc.3.html](https://jemalloc.net/jemalloc.3.html) を参照してください。
### jemalloc.epoch {#jemallocepoch}

jemalloc (Jason Evans のメモリアロケータ) の統計の内部インクリメンタル更新番号であり、他のすべての `jemalloc` メトリックで使用されます。
### jemalloc.mapped {#jemallocmapped}

低レベルメモリアロケータ (jemalloc) の内部メトリック。詳しくは [https://jemalloc.net/jemalloc.3.html](https://jemalloc.net/jemalloc.3.html) を参照してください。
### jemalloc.metadata {#jemallocmetadata}

低レベルメモリアロケータ (jemalloc) の内部メトリック。詳しくは [https://jemalloc.net/jemalloc.3.html](https://jemalloc.net/jemalloc.3.html) を参照してください。
### jemalloc.metadata_thp {#jemallocmetadata_thp}

低レベルメモリアロケータ (jemalloc) の内部メトリック。詳しくは [https://jemalloc.net/jemalloc.3.html](https://jemalloc.net/jemalloc.3.html) を参照してください。
### jemalloc.resident {#jemallocresident}

低レベルメモリアロケータ (jemalloc) の内部メトリック。詳しくは [https://jemalloc.net/jemalloc.3.html](https://jemalloc.net/jemalloc.3.html) を参照してください。
### jemalloc.retained {#jemallocretained}

低レベルメモリアロケータ (jemalloc) の内部メトリック。詳しくは [https://jemalloc.net/jemalloc.3.html](https://jemalloc.net/jemalloc.3.html) を参照してください。
### jemalloc.prof.active {#jemallocprofactive}

低レベルメモリアロケータ (jemalloc) の内部メトリック。詳しくは [https://jemalloc.net/jemalloc.3.html](https://jemalloc.net/jemalloc.3.html) を参照してください。

**参照**

- [Monitoring](../../operations/monitoring.md) — ClickHouse モニタリングの基本概念。
- [system.metrics](/operations/system-tables/metrics) — 即座に計算されたメトリックを含みます。
- [system.events](/operations/system-tables/events) — 発生したイベントの数を含みます。
- [system.metric_log](/operations/system-tables/metric_log) — `system.metrics` および `system.events` テーブルからのメトリック値の履歴を含みます。
