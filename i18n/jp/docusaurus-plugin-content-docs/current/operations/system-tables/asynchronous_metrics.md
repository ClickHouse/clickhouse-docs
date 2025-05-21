description: 'バックグラウンドで定期的に計算されるメトリクスを含むシステムテーブル。例えば、使用中のRAMの量。'
keywords: ['system table', 'asynchronous_metrics']
slug: /operations/system-tables/asynchronous_metrics
title: 'system.asynchronous_metrics'
```

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.asynchronous_metrics

<SystemTableCloud/>

バックグラウンドで定期的に計算されるメトリクスを含みます。例えば、使用中のRAMの量です。

カラム:

- `metric` ([String](../../sql-reference/data-types/string.md)) — メトリクス名。
- `value` ([Float64](../../sql-reference/data-types/float.md)) — メトリクス値。
- `description` ([String](../../sql-reference/data-types/string.md)) - メトリクスの説明。

**例**

```sql
SELECT * FROM system.asynchronous_metrics LIMIT 10
```

```text
┌─metric──────────────────────────────────┬──────value─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ AsynchronousMetricsCalculationTimeSpent │ 0.00179053 │ 非同期メトリクスの計算に費やされた時間（この値は非同期メトリクスのオーバーヘッドです）。                                                                                                                                              │
│ NumberOfDetachedByUserParts             │          0 │ `ALTER TABLE DETACH` クエリによりユーザーによって非同期的に切り離されたMergeTreeテーブルのパーツの総数（予期しない、破損した、または無視されたパーツは含まれません）。サーバーは切り離されたパーツを気にせず、それらは削除できます。                          │
│ NumberOfDetachedParts                   │          0 │ MergeTreeテーブルから切り離されたパーツの総数。パーツは、ユーザーが `ALTER TABLE DETACH` クエリを使用して切り離すことも、サーバー自体がパーツが破損、予期しない、または不要な場合に切り離されることもあります。サーバーは切り離されたパーツを気にせず、それらは削除できます。 │
│ TotalRowsOfMergeTreeTables              │    2781309 │ MergeTreeファミリーのすべてのテーブルに格納されている行（レコード）の総数。                                                                                                                                                                                   │
│ TotalBytesOfMergeTreeTables             │    7741926 │ MergeTreeファミリーのすべてのテーブルに格納されているバイト数（圧縮含む、データおよびインデックス）。                                                                                                                                                   │
│ NumberOfTables                          │         93 │ サーバー上のデータベース全体にわたるテーブルの総数（MergeTreeテーブルを含めることができないデータベースは除外）。除外されるデータベースエンジンは、`Lazy`、`MySQL`、`PostgreSQL`、`SQlite`など、動的にテーブルのセットを生成するものです。 │
│ NumberOfDatabases                       │          6 │ サーバー上のデータベースの総数。                                                                                                                                                                                                                   │
│ MaxPartCountForPartition                │          6 │ MergeTreeファミリーのすべてのテーブルのすべてのパーティションにおけるパーツの最大数。300を超える値は、設定ミス、過負荷、大規模なデータロードを示します。                                                                       │
│ ReplicasSumMergesInQueue                │          0 │ レプリケーションされたテーブルにおけるキュー内のマージ操作の合計（まだ適用されていない）。                                                                                                                                                                       │
│ ReplicasSumInsertsInQueue               │          0 │ レプリケーションされたテーブルにおけるキュー内のINSERT操作の合計（まだレプリケートされていない）。                                                                                                                                                                   │
└─────────────────────────────────────────┴────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

<!--- system.eventsおよびsystem.metricsとは異なり、非同期メトリクスはソースコードファイル内で簡単にリストアップされることはなく、src/Interpreters/ServerAsynchronousMetrics.cpp内のロジックと混合されています。 読者の便宜のためにここに明示的にリストアップします。 --->
## メトリクスの説明 {#metric-descriptions}
### AsynchronousHeavyMetricsCalculationTimeSpent {#asynchronousheavymetricscalculationtimespent}

非同期の重い（テーブル関連）メトリクスの計算に費やされた時間（この値は非同期メトリクスのオーバーヘッドです）。
### AsynchronousHeavyMetricsUpdateInterval {#asynchronousheavymetricsupdateinterval}

重い（テーブル関連）メトリクスの更新間隔。
### AsynchronousMetricsCalculationTimeSpent {#asynchronousmetricscalculationtimespent}

非同期メトリクスの計算に費やされた時間（この値は非同期メトリクスのオーバーヘッドです）。
### AsynchronousMetricsUpdateInterval {#asynchronousmetricsupdateinterval}

メトリクスの更新間隔。
### BlockActiveTime_*name* {#blockactivetime_name}

ブロックデバイスにIOリクエストがキューされている時間（秒単位）。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれており、clickhouse-serverだけではありません。ソース: `/sys/block`。参照：https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardBytes_*name* {#blockdiscardbytes_name}

ブロックデバイスで破棄されたバイト数。これらの操作はSSDに関連します。破棄操作はClickHouseでは使用されていませんが、システム上の他のプロセスによって使用される可能性があります。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。ソース: `/sys/block`。参照：https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardMerges_*name* {#blockdiscardmerges_name}

ブロックデバイスから要求された破棄操作の数と、OS IOスケジューラによって一緒にマージされた数。これらの操作はSSDに関連します。破棄操作はClickHouseでは使用されていませんが、システム上の他のプロセスによって使用される可能性があります。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。ソース: `/sys/block`。参照：https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardOps_*name* {#blockdiscardops_name}

ブロックデバイスから要求された破棄操作の数。これらの操作はSSDに関連します。破棄操作はClickHouseでは使用されていませんが、システム上の他のプロセスによって使用される可能性があります。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。ソース: `/sys/block`。参照：https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardTime_*name* {#blockdiscardtime_name}

ブロックデバイスから要求された破棄操作に費やされた時間（秒単位）、すべての操作を合算したもの。これらの操作はSSDに関連します。破棄操作はClickHouseでは使用されていませんが、システム上の他のプロセスによって使用される可能性があります。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。ソース: `/sys/block`。参照：https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockInFlightOps_*name* {#blockinflightops_name}

この値は、デバイスドライバに対して発行されたがまだ完了していないI/Oリクエストの数をカウントします。キューにあるがまだデバイスドライバに発行されていないIOリクエストは含まれません。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスが含まれています。ソース: `/sys/block`。参照：https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockQueueTime_*name* {#blockqueuetime_name}

この値は、IOリクエストがこのブロックデバイスで待機したミリ秒数をカウントします。複数のIOリクエストが待機している場合、この値は待機しているリクエストの数にミリ秒数を掛けたものとして増加します。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスが含まれています。ソース: `/sys/block`。参照：https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadBytes_*name* {#blockreadbytes_name}

ブロックデバイスから読み取られたバイト数。これは、OSページキャッシュの使用により、ファイルシステムから読み取られたバイト数よりも少ない場合があります。この値はシステム全体のメトリクスで、ホストマシン上のすべてのプロセスが含まれています。ソース: `/sys/block`。参照：https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadMerges_*name* {#blockreadmerges_name}

ブロックデバイスから要求された読み取り操作の数と、OS IOスケジューラによって一緒にマージされた数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスが含まれています。ソース: `/sys/block`。参照：https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadOps_*name* {#blockreadops_name}

ブロックデバイスから要求された読み取り操作の数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスが含まれています。ソース: `/sys/block`。参照：https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadTime_*name* {#blockreadtime_name}

ブロックデバイスから要求された読み取り操作に費やされた時間（秒単位）、すべての操作を合算したもの。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスが含まれています。ソース: `/sys/block`。参照：https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteBytes_*name* {#blockwritebytes_name}

ブロックデバイスに書き込まれたバイト数。これは、OSページキャッシュの使用により、ファイルシステムに書き込まれたバイト数よりも少ない場合があります。ブロックデバイスへの書き込みは、ファイルシステムへの対応する書き込みが完了するよりも後に行われる場合があります。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスが含まれています。ソース: `/sys/block`。参照：https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteMerges_*name* {#blockwritemerges_name}

ブロックデバイスから要求された書き込み操作の数と、OS IOスケジューラによって一緒にマージされた数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスが含まれています。ソース: `/sys/block`。参照：https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteOps_*name* {#blockwriteops_name}

ブロックデバイスから要求された書き込み操作の数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスが含まれています。ソース: `/sys/block`。参照：https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteTime_*name* {#blockwritetime_name}

ブロックデバイスから要求された書き込み操作に費やされた時間（秒単位）、すべての操作を合算したもの。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスが含まれています。ソース: `/sys/block`。参照：https://www.kernel.org/doc/Documentation/block/stat.txt
### CPUFrequencyMHz_*name* {#cpufrequencymhz_name}

CPUの現在の周波数（MHz単位）。ほとんどの現代のCPUは、電力を節約したり、ターボブーストを行うために動的に周波数を調整します。
### CompiledExpressionCacheBytes {#compiledexpressioncachebytes}

JITコンパイルされたコードのキャッシュに使用される合計バイト数。
### CompiledExpressionCacheCount {#compiledexpressioncachecount}

JITコンパイルされたコードのキャッシュ内の総エントリ数。
### DiskAvailable_*name* {#diskavailable_name}

ディスク（仮想ファイルシステム）上の空きバイト数。リモートファイルシステムは、16 EiBのような大きな値を表示する場合があります。
### DiskTotal_*name* {#disktotal_name}

ディスク（仮想ファイルシステム）の総サイズ（バイト単位）。リモートファイルシステムは、16 EiBのような大きな値を表示する場合があります。
### DiskUnreserved_*name* {#diskunreserved_name}

マージ、フェッチ、ムーブの予約を除いたディスク（仮想ファイルシステム）上の空きバイト数。リモートファイルシステムは、16 EiBのような大きな値を表示する場合があります。
### DiskUsed_*name* {#diskused_name}

ディスク（仮想ファイルシステム）上の使用されたバイト数。リモートファイルシステムは、常にこの情報を提供するわけではありません。
### FilesystemCacheBytes {#filesystemcachebytes}

`cache`仮想ファイルシステムにおける合計バイト数。このキャッシュはディスク上に保持されます。
### FilesystemCacheFiles {#filesystemcachefiles}

`cache`仮想ファイルシステムにおけるキャッシュされたファイルセグメントの総数。このキャッシュはディスク上に保持されます。
### FilesystemLogsPathAvailableBytes {#filesystemlogspathavailablebytes}

ClickHouseログパスがマウントされているボリューム上の空きバイト数。この値がゼロに近づく場合は、構成ファイルでのログローテーションの調整が必要です。
### FilesystemLogsPathAvailableINodes {#filesystemlogspathavailableinodes}

ClickHouseログパスがマウントされているボリューム上の空きinodeの数。
### FilesystemLogsPathTotalBytes {#filesystemlogspathtotalbytes}

ClickHouseログパスがマウントされているボリュームのサイズ（バイト単位）。ログには少なくとも10GBが推奨されます。
### FilesystemLogsPathTotalINodes {#filesystemlogspathtotalinodes}

ClickHouseログパスがマウントされているボリューム上のinodeの総数。
### FilesystemLogsPathUsedBytes {#filesystemlogspathusedbytes}

ClickHouseログパスがマウントされているボリューム上の使用されているバイト数。
### FilesystemLogsPathUsedINodes {#filesystemlogspathusedinodes}

ClickHouseログパスがマウントされているボリューム上の使用されているinodeの数。
### FilesystemMainPathAvailableBytes {#filesystemmainpathavailablebytes}

メインのClickHouseパスがマウントされているボリューム上の空きバイト数。
### FilesystemMainPathAvailableINodes {#filesystemmainpathavailableinodes}

メインのClickHouseパスがマウントされているボリューム上の空きinodeの数。これがゼロに近づくと、誤設定を示し、「デバイスに空きスペースなし」が表示されることがあります。
### FilesystemMainPathTotalBytes {#filesystemmainpathtotalbytes}

メインのClickHouseパスがマウントされているボリュームのサイズ（バイト単位）。
### FilesystemMainPathTotalINodes {#filesystemmainpathtotalinodes}

メインのClickHouseパスがマウントされているボリューム上のinodeの総数。これが2500万未満であると、誤設定を示します。
### FilesystemMainPathUsedBytes {#filesystemmainpathusedbytes}

メインのClickHouseパスがマウントされているボリューム上の使用されているバイト数。
### FilesystemMainPathUsedINodes {#filesystemmainpathusedinodes}

メインのClickHouseパスがマウントされているボリューム上の使用されているinodeの数。この値は主にファイルの数に相当します。
### HTTPThreads {#httpthreads}

HTTPインターフェースのサーバー内のスレッド数（TLSなし）。
### InterserverThreads {#interserverthreads}

レプリカ通信プロトコルのサーバー内のスレッド数（TLSなし）。
### Jitter {#jitter}

非同期メトリクスの計算のためにスレッドが起こされる予定時間と、実際に起こされた時間の差。この値は全体的なシステムの遅延と応答性の指標です。
### LoadAverage*N* {#loadaveragen}

全システムの負荷で、1分間の指数平滑化で平均されています。この負荷はCPUで現在実行中またはIOを待機している、または待機中だがまだスケジューリングされていないスレッドの数を示します。この数にはすべてのプロセスが含まれ、クリックハウスサーバーだけではありません。この数値は、システムが過負荷である場合や、多くのプロセスがCPUやIOを待機している場合に、CPUコアの数よりも大きくなることがあります。
### MMapCacheCells {#mmapcachecells}

`mmap`で開かれたファイルの数（メモリにマッピングされています）。この設定が `local_filesystem_read_method` を `mmap` に設定したクエリに使用されます。`mmap` で開かれたファイルはコストのかかるTLBフラッシュを避けるためにキャッシュに保持されています。
### MarkCacheBytes {#markcachebytes}

マークキャッシュのバイト単位の合計サイズ。
### MarkCacheFiles {#markcachefiles}

マークキャッシュにキャッシュされたマークファイルの総数。
### MaxPartCountForPartition {#maxpartcountforpartition}

MergeTreeファミリーのすべてのテーブルのすべてのパーティションでのパーツの最大数。300を超える値は、設定ミス、過負荷、大規模なデータロードを示します。
### MemoryCode {#memorycode}

サーバープロセスの機械コードページのためにマッピングされた仮想メモリの量（バイト単位）。
### MemoryDataAndStack {#memorydataandstack}

スタックおよび割り当てメモリの使用のためにマッピングされた仮想メモリの量（バイト単位）。スレッドごとのスタックや、'mmap'システムコールで割り当てられたほとんどの割り当てメモリが含まれているかどうかは不明です。このメトリクスは、完全性の理由だけで存在します。監視には `MemoryResident` メトリクスの使用をお勧めします。
### MemoryResidentMax {#memoryresidentmax}

サーバープロセスによって使用された最大の物理メモリの量（バイト単位）。
### MemoryResident {#memoryresident}

サーバープロセスによって使用された物理メモリの量（バイト単位）。
### MemoryShared {#memoryshared}

サーバープロセスによって使用され、他のプロセスにも共有されているメモリの量（バイト単位）。ClickHouseは共有メモリを使用しませんが、OSによってその理由で共有とラベル付けされたメモリの一部かもしれません。このメトリクスは監視するのにあまり意味がないため、完全性の理由だけで存在します。
### MemoryVirtual {#memoryvirtual}

サーバープロセスによって割り当てられた仮想アドレス空間のサイズ（バイト単位）。仮想アドレス空間のサイズは通常、物理メモリ消費よりもはるかに大きく、メモリ消費量の推定としては使用されるべきではありません。このメトリクスの大きな値は完全に正常であり、技術的な意味しかありません。
### MySQLThreads {#mysqlthreads}

MySQL互換プロトコルのサーバー内のスレッド数。
### NetworkReceiveBytes_*name* {#networkreceivebytes_name}

ネットワークインターフェース経由で受信したバイト数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。
### NetworkReceiveDrop_*name* {#networkreceivedrop_name}

ネットワークインターフェースを介して受信中にパケットがドロップされた回数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。
### NetworkReceiveErrors_*name* {#networkreceiveerrors_name}

ネットワークインターフェースで受信中にエラーが発生した回数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。
### NetworkReceivePackets_*name* {#networkreceivepackets_name}

ネットワークインターフェースを介して受信したネットワークパケットの数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。
### NetworkSendBytes_*name* {#networksendbytes_name}

ネットワークインターフェースを介して送信されたバイト数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。
### NetworkSendDrop_*name* {#networksenddrop_name}

ネットワークインターフェースを介して送信中にパケットがドロップされた回数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。
### NetworkSendErrors_*name* {#networksenderrors_name}

ネットワークインターフェースを介して送信中にエラー（例えば、TCP再送）が発生した回数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。
### NetworkSendPackets_*name* {#networksendpackets_name}

ネットワークインターフェースを介して送信されたネットワークパケットの数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。
### NumberOfDatabases {#numberofdatabases}

サーバー上のデータベースの総数。
### NumberOfDetachedByUserParts {#numberofdetachedbyuserparts}

`ALTER TABLE DETACH` クエリによりユーザーによって非同期的に切り離されたMergeTreeテーブルのパーツの総数（予期しない、破損した、または無視されたパーツは含まれません）。サーバーは切り離されたパーツを気にせず、それらは削除できます。
### NumberOfDetachedParts {#numberofdetachedparts}

MergeTreeテーブルから切り離されたパーツの総数。パーツは、ユーザーが `ALTER TABLE DETACH` クエリを使用して切り離すことも、サーバー自体がパーツが破損、予期しない、または不要な場合に切り離されることもあります。サーバーは切り離されたパーツを気にせず、それらは削除できます。
### NumberOfTables {#numberoftables}

サーバー上のデータベース全体にわたるテーブルの総数（MergeTreeテーブルを含むことができないデータベースは除外）。除外されるデータベースエンジンは、動的にテーブルのセットを生成するもの（`Lazy`、`MySQL`、`PostgreSQL`、`SQlite`など）です。
### OSContextSwitches {#oscontextswitches}

ホストマシンでシステムが乗り越えたコンテキストスイッチの数。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスが含まれています。 
### OSGuestNiceTime {#osguestnicetime}

Linuxカーネルの制御下でのゲストオペレーティングシステムに対して仮想CPUを実行するために費やされた時間の比率。ゲストの優先順位が高く設定されている場合は優先的に実行されることになる（man procfs参照）。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。このメトリクスはClickHouseには関連性がありませんが、完全性のために存在します。単一CPUコアの値は[0..1]の範囲にあり、すべてのCPUコアの値はその合計として計算されます[0..num cores]。
### OSGuestNiceTimeCPU_*N* {#osguestnicetimecpu_n}

Linuxカーネルの制御下でのゲストオペレーティングシステムに対して仮想CPUを実行するために費やされた時間の比率。ゲストの優先順位が高く設定されている場合は優先的に実行されることになる（man procfs参照）。これはシステム全体のメトリクスで、ホストマシン上のすべてのプロセスが含まれています。このメトリクスはClickHouseには関連性がありませんが、完全性のために存在します。単一CPUコアの値は[0..1]の範囲にあり、すべてのCPUコアの値はその合計として計算されます[0..num cores]。
### OSGuestNiceTimeNormalized {#osguestnicetimenormalized}

この値は `OSGuestNiceTime` に似ていますが、CPUコアの数で割って[0..1]の範囲に測定します。これにより、コアの数が非均一であっても、クラスター内の複数のサーバーでこのメトリクスの値を平均化し、平均リソース利用率メトリクスを取得することができます。
### OSGuestTime {#osguesttime}

Linuxカーネルの制御下でのゲストオペレーティングシステムに対して仮想CPUを実行するために費やされた時間の比率（man procfs参照）。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。このメトリクスはClickHouseには関連性がありませんが、完全性のために存在します。単一CPUコアの値は[0..1]の範囲にあり、すべてのCPUコアの値はその合計として計算されます[0..num cores]。
### OSGuestTimeCPU_*N* {#osguesttimecpu_n}

Linuxカーネルの制御下でのゲストオペレーティングシステムに対して仮想CPUを実行するために費やされた時間の比率（man procfs参照）。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。このメトリクスはClickHouseには関連性がありませんが、完全性のために存在します。単一CPUコアの値は[0..1]の範囲にあり、すべてのCPUコアの値はその合計として計算されます[0..num cores]。
### OSGuestTimeNormalized {#osguesttimenormalized}

この値は `OSGuestTime` に似ていますが、CPUコアの数で割って[0..1]の範囲に測定します。これにより、コアの数が非均一であっても、クラスター内の複数のサーバーでこのメトリクスの値を平均化し、平均リソース利用率メトリクスを取得することができます。
### OSIOWaitTime {#osiowaittime}

CPUコアがコードを実行していなかった時間の比率で、OSカーネルがIOを待機しているプロセスを実行しなかった時間を指します。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。単一CPUコアの値は[0..1]の範囲にあり、すべてのCPUコアの値はその合計として計算されます[0..num cores]。
### OSIOWaitTimeCPU_*N* {#osiowaittimecpu_n}

CPUコアがコードを実行していなかった時間の比率で、OSカーネルがIOを待機しているプロセスを実行しなかった時間を指します。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。単一CPUコアの値は[0..1]の範囲にあり、すべてのCPUコアの値はその合計として計算されます[0..num cores]。
### OSIOWaitTimeNormalized {#osiowaittimenormalized}

この値は `OSIOWaitTime` に似ていますが、CPUコアの数で割って[0..1]の範囲に測定します。これにより、コアの数が非均一であっても、クラスター内の複数のサーバーでこのメトリクスの値を平均化し、平均リソース利用率メトリクスを取得することができます。
### OSIdleTime {#osidletime}

CPUコアがアイドル状態であった時間の比率（プロセスがIO待機であっても実行できなかった状態にない）。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。CPUが内部的な理由により過小利用されている時間（メモリ負荷、パイプラインの停滞、ブランチミス予測、別のSMTコアを実行中）の時間は含まれません。単一CPUコアの値は[0..1]の範囲にあり、すべてのCPUコアの値はその合計として計算されます[0..num cores]。
### OSIdleTimeCPU_*N* {#osidletimecpu_n}

CPUコアがアイドル状態であった時間の比率（プロセスがIO待機であっても実行できなかった状態にない）。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。CPUが内部的な理由により過小利用されている時間（メモリ負荷、パイプラインの停滞、ブランチミス予測、別のSMTコアを実行中）の時間は含まれません。単一CPUコアの値は[0..1]の範囲にあり、すべてのCPUコアの値はその合計として計算されます[0..num cores]。
### OSIdleTimeNormalized {#osidletimenormalized}

この値は `OSIdleTime` に類似していますが、CPUコアの数で割って[0..1]の範囲に測定されます。これにより、コアの数が非均一であっても、クラスター内の複数のサーバーでこのメトリクスの値を平均化し、平均リソース利用率メトリクスを取得することができます。
### OSInterrupts {#osinterrupts}

ホストマシン上の割り込みの数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。
### OSIrqTime {#osirqtime}

CPUでハードウェア割り込み要求を処理するために費やされた時間の比率。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれる。高い数値はハードウェアの構成ミスや非常に高いネットワーク負荷を示す場合があります。単一CPUコアの値は[0..1]の範囲にあり、すべてのCPUコアの値はその合計として計算されます[0..num cores]。
### OSIrqTimeCPU_*N* {#osirqtimecpu_n}

CPUでハードウェア割り込み要求を処理するために費やされた時間の比率。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれます。高い数値はハードウェアの構成ミスや非常に高いネットワーク負荷を示す場合があります。単一CPUコアの値は[0..1]の範囲にあり、すべてのCPUコアの値はその合計として計算されます[0..num cores]。
### OSIrqTimeNormalized {#osirqtimenormalized}

この値は `OSIrqTime` に似ていますが、CPUコアの数で割って[0..1]の範囲に測定します。これにより、コアの数が非均一であっても、クラスター内の複数のサーバーでこのメトリクスの値を平均化し、平均リソース利用率メトリクスを取得することができます。
### OSMemoryAvailable {#osmemoryavailable}

プログラムが使用できるメモリの量（バイト単位）。これは `OSMemoryFreePlusCached` メトリクスに非常に似ています。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。
### OSMemoryBuffers {#osmemorybuffers}

OSカーネルバッファによって使用されているメモリの量（バイト単位）。通常は小さいべきであり、大きな値はOSの設定ミスを示す可能性があります。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。
### OSMemoryCached {#osmemorycached}

OSページキャッシュによって使用されるメモリの量（バイト単位）。通常、利用可能なメモリのほとんどはOSページキャッシュによって使用されます。このメトリクスの高い値は正常で期待されます。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。
### OSMemoryFreePlusCached {#osmemoryfreepluscached}

ホストシステム上の空きメモリ+OSページキャッシュメモリ（バイト単位）。このメモリはプログラムによって使用可能です。この値は `OSMemoryAvailable` に非常に似ているべきです。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスが含まれています。
```
```yaml
title: 'OSメモリ計測'
sidebar_label: 'OSメモリ計測'
keywords: ['ClickHouse', '監視', 'メトリクス', 'OSメモリ']
description: 'ClickHouseのOSメモリに関するメトリクス'
```

### OSMemoryFreeWithoutCached {#osmemoryfreewithoutcached}

ホストシステム上の使用可能なメモリの量（バイト単位）。これは、OSページキャッシュメモリによって使用されるメモリは含まれません。ページキャッシュメモリはプログラムによっても利用可能であるため、このメトリクスの値は混乱を招く可能性があります。代わりに、`OSMemoryAvailable`メトリクスを参照してください。便宜上、`OSMemoryFreePlusCached`メトリクスも提供しています。これは、OSMemoryAvailableとある程度類似するべきです。詳細については、https://www.linuxatemyram.com/ を参照してください。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセス（clickhouse-serverだけでなく）を含みます。

### OSMemoryTotal {#osmemorytotal}

ホストシステム上のメモリの総量（バイト単位）。

### OSNiceTime {#osnicetime}

CPUコアが高優先度のユーザースペースコードを実行していた時間の比率。このメトリクスはシステム全体のものであり、ホストマシン上のすべてのプロセス（clickhouse-serverだけでなく）を含みます。単一のCPUコアの値は[0..1]の範囲内になります。すべてのCPUコアの値は、これらの合計として計算されます[0..コア数]。

### OSNiceTimeCPU_*N* {#osnicetimecpu_n}

CPUコアが高優先度のユーザースペースコードを実行していた時間の比率。このメトリクスはシステム全体のものであり、ホストマシン上のすべてのプロセス（clickhouse-serverだけでなく）を含みます。単一のCPUコアの値は[0..1]の範囲内になります。すべてのCPUコアの値は、これらの合計として計算されます[0..コア数]。

### OSNiceTimeNormalized {#osnicetimenormalized}

この値は`OSNiceTime`に似ていますが、測定するCPUコアの数で割られ、コアの数に関係なく[0..1]の範囲で測定されます。これにより、クラスタ内の複数のサーバーでこのメトリクスの値を平均化でき、コアの数が非均一であっても平均的なリソース利用メトリクスを得ることができます。

### OSOpenFiles {#osopenfiles}

ホストマシンで開かれているファイルの総数。このメトリクスはシステム全体のものであり、ホストマシン上のすべてのプロセス（clickhouse-serverだけでなく）を含みます。

### OSProcessesBlocked {#osprocessesblocked}

I/Oの完了を待ってブロックされているスレッドの数（`man procfs`参照）。このメトリクスはシステム全体のものであり、ホストマシン上のすべてのプロセス（clickhouse-serverだけでなく）を含みます。

### OSProcessesCreated {#osprocessescreated}

作成されたプロセスの数。このメトリクスはシステム全体のものであり、ホストマシン上のすべてのプロセス（clickhouse-serverだけでなく）を含みます。

### OSProcessesRunning {#osprocessesrunning}

オペレーティングシステムによって実行可能（実行中または実行準備中）のスレッドの数。このメトリクスはシステム全体のものであり、ホストマシン上のすべてのプロセス（clickhouse-serverだけでなく）を含みます。

### OSSoftIrqTime {#ossoftirqtime}

CPU上でソフトウェア割り込み要求を実行するために費やした時間の比率。このメトリクスはシステム全体のものであり、ホストマシン上のすべてのプロセス（clickhouse-serverだけでなく）を含みます。このメトリクスの高い値は、システム上で非効率なソフトウェアが実行されていることを示唆する可能性があります。単一のCPUコアの値は[0..1]の範囲内になります。すべてのCPUコアの値は、これらの合計として計算されます[0..コア数]。

### OSSoftIrqTimeCPU_*N* {#ossoftirqtimecpu_n}

CPU上でソフトウェア割り込み要求を実行するために費やした時間の比率。このメトリクスはシステム全体のものであり、ホストマシン上のすべてのプロセス（clickhouse-serverだけでなく）を含みます。このメトリクスの高い値は、システム上で非効率なソフトウェアが実行されていることを示唆する可能性があります。単一のCPUコアの値は[0..1]の範囲内になります。すべてのCPUコアの値は、これらの合計として計算されます[0..コア数]。

### OSSoftIrqTimeNormalized {#ossoftirqtimenormalized}

この値は`OSSoftIrqTime`に似ていますが、測定するCPUコアの数で割られ、コアの数に関係なく[0..1]の範囲で測定されます。これにより、クラスタ内の複数のサーバーでこのメトリクスの値を平均化でき、コアの数が非均一であっても平均的なリソース利用メトリクスを得ることができます。

### OSStealTime {#osstealtime}

仮想化環境で実行されているときに、他のオペレーティングシステムで過ごした時間の比率。このメトリクスはシステム全体のものであり、ホストマシン上のすべてのプロセス（clickhouse-serverだけでなく）を含みます。すべての仮想化環境がこのメトリクスを提供するわけではなく、大半のものは提供しません。単一のCPUコアの値は[0..1]の範囲内になります。すべてのCPUコアの値は、これらの合計として計算されます[0..コア数]。

### OSStealTimeCPU_*N* {#osstealtimecpu_n}

仮想化環境で実行されているときに、他のオペレーティングシステムで過ごした時間の比率。このメトリクスはシステム全体のものであり、ホストマシン上のすべてのプロセス（clickhouse-serverだけでなく）を含みます。すべての仮想化環境がこのメトリクスを提供するわけではなく、大半のものは提供しません。単一のCPUコアの値は[0..1]の範囲内になります。すべてのCPUコアの値は、これらの合計として計算されます[0..コア数]。

### OSStealTimeNormalized {#osstealtimenormalized}

この値は`OSStealTime`に似ていますが、測定するCPUコアの数で割られ、コアの数に関係なく[0..1]の範囲で測定されます。これにより、クラスタ内の複数のサーバーでこのメトリクスの値を平均化でき、コアの数が非均一であっても平均的なリソース利用メトリクスを得ることができます。

### OSSystemTime {#ossystemtime}

CPUコアがOSカーネル（システム）コードを実行していた時間の比率。このメトリクスはシステム全体のものであり、ホストマシン上のすべてのプロセス（clickhouse-serverだけでなく）を含みます。単一のCPUコアの値は[0..1]の範囲内になります。すべてのCPUコアの値は、これらの合計として計算されます[0..コア数]。

### OSSystemTimeCPU_*N* {#ossystemtimecpu_n}

CPUコアがOSカーネル（システム）コードを実行していた時間の比率。このメトリクスはシステム全体のものであり、ホストマシン上のすべてのプロセス（clickhouse-serverだけでなく）を含みます。単一のCPUコアの値は[0..1]の範囲内になります。すべてのCPUコアの値は、これらの合計として計算されます[0..コア数]。

### OSSystemTimeNormalized {#ossystemtimenormalized}

この値は`OSSystemTime`に似ていますが、測定するCPUコアの数で割られ、コアの数に関係なく[0..1]の範囲で測定されます。これにより、クラスタ内の複数のサーバーでこのメトリクスの値を平均化でき、コアの数が非均一であっても平均的なリソース利用メトリクスを得ることができます。

### OSThreadsRunnable {#osthreadsrunnable}

OSカーネルスケジューラが見た「実行可能」スレッドの総数。

### OSThreadsTotal {#osthreadstotal}

OSカーネルスケジューラが見たスレッドの総数。

### OSUptime {#osuptime}

ホストサーバー（ClickHouseが実行されているマシン）の稼働時間（秒単位）。

### OSUserTime {#osusertime}

CPUコアがユーザースペースコードを実行していた時間の比率。このメトリクスはシステム全体のものであり、ホストマシン上のすべてのプロセス（clickhouse-serverだけでなく）を含みます。これには、CPUが内部的な理由（メモリの読み込み、パイプラインの停滞、分岐の誤予測、別のSMTコアの実行）により過小利用されていた時間も含まれます。単一のCPUコアの値は[0..1]の範囲内になります。すべてのCPUコアの値は、これらの合計として計算されます[0..コア数]。

### OSUserTimeCPU_*N* {#osusertimecpu_n}

CPUコアがユーザースペースコードを実行していた時間の比率。このメトリクスはシステム全体のものであり、ホストマシン上のすべてのプロセス（clickhouse-serverだけでなく）を含みます。これには、CPUが内部的な理由（メモリの読み込み、パイプラインの停滞、分岐の誤予測、別のSMTコアの実行）により過小利用されていた時間も含まれます。単一のCPUコアの値は[0..1]の範囲内になります。すべてのCPUコアの値は、これらの合計として計算されます[0..コア数]。

### OSUserTimeNormalized {#osusertimenormalized}

この値は`OSUserTime`に似ていますが、測定するCPUコアの数で割られ、コアの数に関係なく[0..1]の範囲で測定されます。これにより、クラスタ内の複数のサーバーでこのメトリクスの値を平均化でき、コアの数が非均一であっても平均的なリソース利用メトリクスを得ることができます。

### PostgreSQLThreads {#postgresqlthreads}

PostgreSQL互換プロトコルサーバー内のスレッド数。

### QueryCacheBytes {#querycachebytes}

クエリキャッシュの合計サイズ（バイト単位）。

### QueryCacheEntries {#querycacheentries}

クエリキャッシュ内のエントリの総数。

### ReplicasMaxAbsoluteDelay {#replicasmaxabsolutedelay}

レプリケートテーブルにおける最も新しいレプリケート部分と、レプリケートする必要がある最も新しいデータ部分との秒単位の最大の違い。非常に高い値は、データが存在しないレプリカを示します。

### ReplicasMaxInsertsInQueue {#replicasmaxinsertsinqueue}

レプリケートテーブルにおける挿入操作の最大数（まだレプリケートされていないもの）。

### ReplicasMaxMergesInQueue {#replicasmaxmergesinqueue}

レプリケートテーブルにおけるマージ操作の最大数（まだ適用されていないもの）。

### ReplicasMaxQueueSize {#replicasmaxqueuesize}

レプリケートテーブルにおけるキューの最大サイズ（getやmergeなどの操作数）。

### ReplicasMaxRelativeDelay {#replicasmaxrelativedelay}

レプリカ遅延と同じテーブルの最新レプリカの遅延との最大の違い（レプリケートテーブルにおいて）。

### ReplicasSumInsertsInQueue {#replicassuminsertsinqueue}

レプリケートテーブルにおける挿入操作の合計数（まだレプリケートされていないもの）。

### ReplicasSumMergesInQueue {#replicassummergesinqueue}

レプリケートテーブルにおけるマージ操作の合計数（まだ適用されていないもの）。

### ReplicasSumQueueSize {#replicassumqueuesize}

レプリケートテーブルにおけるキューサイズの合計（getやmergeなどの操作数）。

### TCPThreads {#tcpthreads}

TCPプロトコル（TLSなし）サーバー内のスレッド数。

### Temperature_*N* {#temperature_n}

対応するデバイスの温度（℃）。センサーは非現実的な値を返すことがあります。ソース：`/sys/class/thermal`

### Temperature_*name* {#temperature_name}

対応するハードウェアモニターおよびセンサーによって報告された温度（℃）。センサーは非現実的な値を返すことがあります。ソース：`/sys/class/hwmon`

### TotalBytesOfMergeTreeTables {#totalbytesofmergetreetables}

すべてのMergeTree系テーブルに保存されているバイトの総量（圧縮されており、データとインデックスを含む）。

### TotalPartsOfMergeTreeTables {#totalpartsofmergetreetables}

すべてのMergeTree系テーブルにおけるデータ部分の総量。10 000を超える数字は、サーバーの起動時間に悪影響を及ぼし、パーティションキーの選択が不合理であることを示す可能性があります。

### TotalPrimaryKeyBytesInMemory {#totalprimarykeybytesinmemory}

主キーの値によって使用されるメモリの総量（バイト単位）。（アクティブな部分のみを考慮）

### TotalPrimaryKeyBytesInMemoryAllocated {#totalprimarykeybytesinmemoryallocated}

主キーの値に予約されたメモリの総量（バイト単位）。（アクティブな部分のみを考慮）

### TotalRowsOfMergeTreeTables {#totalrowsofmergetreetables}

すべてのMergeTree系テーブルに保存されている行（レコード）の合計量。

### UncompressedCacheBytes {#uncompressedcachebytes}

非圧縮キャッシュの合計サイズ（バイト単位）。非圧縮キャッシュは通常、パフォーマンスを改善せず、主に避けるべきです。

### UncompressedCacheCells {#uncompressedcachecells}

非圧縮キャッシュ内のエントリの総数。各エントリは解凍されたデータブロックを示します。非圧縮キャッシュは通常、パフォーマンスを改善せず、主に避けるべきです。

### Uptime {#uptime}

サーバーの稼働時間（秒単位）。接続を受け付ける前のサーバーの初期化に費やされた時間も含まれます。

### jemalloc.active {#jemallocactive}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.allocated {#jemallocallocated}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.dirty_purged {#jemallocarenasalldirty_purged}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.muzzy_purged {#jemallocarenasallmuzzy_purged}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.pactive {#jemallocarenasallpactive}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.pdirty {#jemallocarenasallpdirty}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.pmuzzy {#jemallocarenasallpmuzzy}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.background_thread.num_runs {#jemallocbackground_threadnum_runs}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.background_thread.num_threads {#jemallocbackground_threadnum_threads}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.background_thread.run_intervals {#jemallocbackground_threadrun_intervals}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.epoch {#jemallocepoch}

jemalloc（ジャソン・エバンスのメモリアロケータ）の統計の内部インクリメンタル更新番号であり、他のすべての`jemalloc`メトリクスで使用されます。

### jemalloc.mapped {#jemallocmapped}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.metadata {#jemallocmetadata}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.metadata_thp {#jemallocmetadata_thp}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.resident {#jemallocresident}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.retained {#jemallocretained}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.prof.active {#jemallocprofactive}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

**See Also**

- [Monitoring](../../operations/monitoring.md) — ClickHouse監視の基本概念。
- [system.metrics](/operations/system-tables/metrics) — 即時計算されたメトリクスを含む。
- [system.events](/operations/system-tables/events) — 発生したイベントの数を含む。
- [system.metric_log](/operations/system-tables/metric_log) — `system.metrics`および`system.events`テーブルからのメトリクス値の履歴を含む。
