---
description: 'System table containing metrics that are calculated periodically in
  the background. For example, the amount of RAM in use.'
keywords:
- 'system table'
- 'asynchronous_metrics'
slug: '/operations/system-tables/asynchronous_metrics'
title: 'system.asynchronous_metrics'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';



# system.asynchronous_metrics

<SystemTableCloud/>

バックグラウンドで定期的に計算されるメトリックを含みます。例えば、使用中のRAMの量です。

カラム：

- `metric` ([String](../../sql-reference/data-types/string.md)) — メトリック名。
- `value` ([Float64](../../sql-reference/data-types/float.md)) — メトリックの値。
- `description` ([String](../../sql-reference/data-types/string.md) - メトリックの説明)

**例**

```sql
SELECT * FROM system.asynchronous_metrics LIMIT 10
```

```text
┌─metric──────────────────────────────────┬──────value─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ AsynchronousMetricsCalculationTimeSpent │ 0.00179053 │ 非同期メトリックの計算に費やされた時間（秒単位）（これは非同期メトリックのオーバーヘッドです）。                                                                                                                                              │
│ NumberOfDetachedByUserParts             │          0 │ ユーザーが `ALTER TABLE DETACH` クエリを使用してMergeTreeテーブルから切り離したパーツの合計数（予期しない、壊れた、または無視されたパーツを除く）。サーバーは切り離されたパーツを気にせず、削除できます。                          │
│ NumberOfDetachedParts                   │          0 │ MergeTreeテーブルから切り離されたパーツの合計数。パーツはユーザーによって `ALTER TABLE DETACH` クエリで切り離されるか、壊れている、予期しない、または不要な場合はサーバー自体によって切り離されることがあります。サーバーは切り離されたパーツを気にせず、削除できます。 │
│ TotalRowsOfMergeTreeTables              │    2781309 │ MergeTreeファミリーのすべてのテーブルに保存された行（レコード）の合計数。                                                                                                                                                                                   │
│ TotalBytesOfMergeTreeTables             │    7741926 │ MergeTreeファミリーのすべてのテーブルに保存されたバイト（圧縮されたデータとインデックスを含む）の合計数。                                                                                                                                                   │
│ NumberOfTables                          │         93 │ サーバー上のデータベースに跨るテーブルの合計数。MergeTreeテーブルを含めることができないデータベースは除外されます。除外されるデータベースエンジンには、`Lazy`, `MySQL`, `PostgreSQL`, `SQlite` のように、即座にテーブルを生成するものがあります。 │
│ NumberOfDatabases                       │          6 │ サーバー上のデータベースの合計数。                                                                                                                                                                                                                   │
│ MaxPartCountForPartition                │          6 │ MergeTreeファミリーのすべてのテーブルにおけるパーティションあたりのパーツの最大数。300を超える値は、設定ミス、過負荷、または大量のデータ読み込みを示します。                                                                       │
│ ReplicasSumMergesInQueue                │          0 │ レプリケーテーブルに跨るキュー内のマージ操作の合計（まだ適用されていない）。                                                                                                                                                                       │
│ ReplicasSumInsertsInQueue               │          0 │ レプリケーテーブルに跨るキュー内のINSERT操作の合計（まだレプリケートされていない）。                                                                                                                                                                   │
└─────────────────────────────────────────┴────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

<!--- Unlike with system.events and system.metrics, the asynchronous metrics are not gathered in a simple list in a source code file - they
      are mixed with logic in src/Interpreters/ServerAsynchronousMetrics.cpp.
      Listing them here explicitly for reader convenience. --->
## メトリックの説明 {#metric-descriptions}
### AsynchronousHeavyMetricsCalculationTimeSpent {#asynchronousheavymetricscalculationtimespent}

非同期の重い（テーブル関連の）メトリックの計算に費やされた時間（秒単位）（これは非同期メトリックのオーバーヘッドです）。
### AsynchronousHeavyMetricsUpdateInterval {#asynchronousheavymetricsupdateinterval}

重い（テーブル関連の）メトリック更新の間隔
### AsynchronousMetricsCalculationTimeSpent {#asynchronousmetricscalculationtimespent}

非同期メトリックの計算に費やされた時間（秒単位）（これは非同期メトリックのオーバーヘッドです）。
### AsynchronousMetricsUpdateInterval {#asynchronousmetricsupdateinterval}

メトリック更新の間隔
### BlockActiveTime_*name* {#blockactivetime_name}

ブロックデバイスがIOリクエストをキューに保持していた時間（秒単位）。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけでなくなります。ソース： `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardBytes_*name* {#blockdiscardbytes_name}

ブロックデバイスで破棄されたバイト数。これらの操作はSSDに関連しています。破棄操作はClickHouseでは使用されませんが、システム上の他のプロセスによって使用されることがあります。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。ソース： `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardMerges_*name* {#blockdiscardmerges_name}

ブロックデバイスからリクエストされた破棄操作の数と、OSのIOスケジューラによって統合された数。これらの操作はSSDに関連しています。破棄操作はClickHouseでは使用されませんが、システム上の他のプロセスによって使用されることがあります。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。ソース： `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardOps_*name* {#blockdiscardops_name}

ブロックデバイスからリクエストされた破棄操作の数。これらの操作はSSDに関連しています。破棄操作はClickHouseでは使用されませんが、システム上の他のプロセスによって使用されることがあります。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。ソース： `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardTime_*name* {#blockdiscardtime_name}

ブロックデバイスからリクエストされた破棄操作に費やされた時間（秒単位）、すべての操作で合計されています。これらの操作はSSDに関連しています。破棄操作はClickHouseでは使用されませんが、システム上の他のプロセスによって使用されることがあります。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。ソース： `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockInFlightOps_*name* {#blockinflightops_name}

この値は、デバイスドライバに発行されたがまだ完了していないI/Oリクエストの数をカウントします。キューに入っているがまだデバイスドライバに発行されていないIOリクエストは含まれません。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。ソース： `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockQueueTime_*name* {#blockqueuetime_name}

この値は、IOリクエストがこのブロックデバイスで待機していたミリ秒数を数えます。待機しているIOリクエストが複数ある場合、この値は待機しているリクエストの数×待機していたミリ秒数の積として増加します。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。ソース： `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadBytes_*name* {#blockreadbytes_name}

ブロックデバイスから読み取られたバイト数。OSページキャッシュの使用により、ファイルシステムから読み取られたバイト数よりも少なくなる可能性があります。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。ソース： `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadMerges_*name* {#blockreadmerges_name}

ブロックデバイスからリクエストされた読み取り操作の数と、OSのIOスケジューラによって統合された数。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。ソース： `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadOps_*name* {#blockreadops_name}

ブロックデバイスからリクエストされた読み取り操作の数。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。ソース： `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadTime_*name* {#blockreadtime_name}

ブロックデバイスからリクエストされた読み取り操作に費やされた時間（秒単位）、すべての操作で合計されています。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。ソース： `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteBytes_*name* {#blockwritebytes_name}

ブロックデバイスに書き込まれたバイト数。OSページキャッシュの使用により、ファイルシステムに書き込まれたバイト数よりも少なくなることがあります。ブロックデバイスへの書き込みは、対応するファイルシステムへの書き込みより遅れることがあります。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。ソース： `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteMerges_*name* {#blockwritemerges_name}

ブロックデバイスからリクエストされた書き込み操作の数と、OSのIOスケジューラによって統合された数。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。ソース： `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteOps_*name* {#blockwriteops_name}

ブロックデバイスからリクエストされた書き込み操作の数。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。ソース： `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteTime_*name* {#blockwritetime_name}

ブロックデバイスからリクエストされた書き込み操作に費やされた時間（秒単位）、すべての操作で合計されています。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。ソース： `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### CPUFrequencyMHz_*name* {#cpufrequencymhz_name}

CPUの現在の周波数（MHz）。ほとんどの最新のCPUは、電力保存およびターボブーストのために周波数を動的に調整します。
### CompiledExpressionCacheBytes {#compiledexpressioncachebytes}

JITコンパイルされたコードのキャッシュに使用される合計バイト数。
### CompiledExpressionCacheCount {#compiledexpressioncachecount}

JITコンパイルされたコードのキャッシュ内のエントリの合計数。
### DiskAvailable_*name* {#diskavailable_name}

ディスク（仮想ファイルシステム）上の利用可能なバイト数。リモートファイルシステムは、16 EiBのような大きな値を示すことがあります。
### DiskTotal_*name* {#disktotal_name}

ディスクの合計サイズ（バイト単位、仮想ファイルシステム上）。リモートファイルシステムは、16 EiBのような大きな値を示すことがあります。
### DiskUnreserved_*name* {#diskunreserved_name}

マージ、フェッチ、移動のために予約されていないディスク（仮想ファイルシステム）上の利用可能なバイト数。リモートファイルシステムは、16 EiBのような大きな値を示すことがあります。
### DiskUsed_*name* {#diskused_name}

ディスク（仮想ファイルシステム）上の使用済みバイト数。リモートファイルシステムは、常にこの情報を提供しないことがあります。
### FilesystemCacheBytes {#filesystemcachebytes}

`cache` 仮想ファイルシステム内の合計バイト数。このキャッシュはディスク上に保持されます。
### FilesystemCacheFiles {#filesystemcachefiles}

`cache` 仮想ファイルシステム内のキャッシュされたファイルセグメントの合計数。このキャッシュはディスク上に保持されます。
### FilesystemLogsPathAvailableBytes {#filesystemlogspathavailablebytes}

ClickHouseログパスがマウントされているボリューム上の利用可能なバイト数。この値が0に近づくと、設定ファイルでのログローテーションを調整する必要があります。
### FilesystemLogsPathAvailableINodes {#filesystemlogspathavailableinodes}

ClickHouseログパスがマウントされているボリューム上の利用可能なinodeの数。
### FilesystemLogsPathTotalBytes {#filesystemlogspathtotalbytes}

ClickHouseログパスがマウントされているボリュームのサイズ（バイト単位）。ログのために少なくとも10GBを持つことを推奨します。
### FilesystemLogsPathTotalINodes {#filesystemlogspathtotalinodes}

ClickHouseログパスがマウントされているボリューム上のinodeの総数。
### FilesystemLogsPathUsedBytes {#filesystemlogspathusedbytes}

ClickHouseログパスがマウントされているボリューム上の使用済みバイト数。
### FilesystemLogsPathUsedINodes {#filesystemlogspathusedinodes}

ClickHouseログパスがマウントされているボリューム上の使用中のinodeの数。
### FilesystemMainPathAvailableBytes {#filesystemmainpathavailablebytes}

ClickHouseのメインパスがマウントされているボリューム上の利用可能なバイト数。
### FilesystemMainPathAvailableINodes {#filesystemmainpathavailableinodes}

ClickHouseのメインパスがマウントされているボリューム上の利用可能なinodeの数。この数が0に近い場合、設定ミスを示し、ディスクがいっぱいでなくても「デバイスに空きがありません」と表示されます。
### FilesystemMainPathTotalBytes {#filesystemmainpathtotalbytes}

ClickHouseのメインパスがマウントされているボリュームのサイズ（バイト単位）。
### FilesystemMainPathTotalINodes {#filesystemmainpathtotalinodes}

ClickHouseのメインパスがマウントされているボリューム上のinodeの総数。この数が2500万未満の場合、設定ミスを示します。
### FilesystemMainPathUsedBytes {#filesystemmainpathusedbytes}

ClickHouseのメインパスがマウントされているボリューム上の使用済みバイト数。
### FilesystemMainPathUsedINodes {#filesystemmainpathusedinodes}

ClickHouseのメインパスがマウントされているボリューム上の使用中のinodeの数。この値は、主にファイルの数に相当します。
### HTTPThreads {#httpthreads}

HTTPインターフェース（TLSなし）サーバーのスレッド数。
### InterserverThreads {#interserverthreads}

レプリカコミュニケーションプロトコル（TLSなし）サーバーのスレッド数。
### Jitter {#jitter}

非同期メトリック計算のためにスケジュールされたスレッドの起床時間と実際に起きた時間の差。全体的なシステムレイテンシーと応答性の代理指標です。
### LoadAverage*N* {#loadaveragen}

全システムの負荷で、1分間で指数平滑化された平均。負荷は、CPUによって現在実行中、IOを待機中、または実行準備が完了しているがこの時点ではスケジュールされていないプロセス（OSカーネルのスケジューリングエンティティ）のスレッド数を表します。この数は、clickhouse-serverだけでなく、すべてのプロセスを含みます。システムが過負荷になっている場合、多くのプロセスがCPUの待機中またはIO待機中であり、この数はCPUコア数を超えることがあります。
### MMapCacheCells {#mmapcachecells}

`mmap`（メモリにマッピングされた）で開かれているファイルの数。この設定が `local_filesystem_read_method` に設定されているクエリで使用されます。`mmap`で開かれたファイルは、高価なTLBフラッシュを避けるためにキャッシュ内に保持されます。
### MarkCacheBytes {#markcachebytes}

マークキャッシュのサイズ（バイト単位）
### MarkCacheFiles {#markcachefiles}

マークキャッシュにキャッシュされたマークファイルの合計数
### MaxPartCountForPartition {#maxpartcountforpartition}

MergeTreeファミリーのすべてのテーブルにおけるパーティションあたりのパーツの最大数。300を超える値は、設定ミス、過負荷、または大量のデータ読み込みを示します。
### MemoryCode {#memorycode}

サーバープロセスの機械コードページにマッピングされたバーチャルメモリの量（バイト単位）。
### MemoryDataAndStack {#memorydataandstack}

スタック使用と割り当てられたメモリのためにマッピングされたバーチャルメモリの量（バイト単位）。スレッドごとのスタックや、大半の割り当てられたメモリが `mmap` システムコールで割り当てられているかどうかは不明です。このメトリックは完全性の理由だけで存在します。監視される場合は `MemoryResident` メトリックを使用することをお勧めします。
### MemoryResidentMax {#memoryresidentmax}

サーバープロセスによって使用される最大物理メモリ（バイト単位）。
### MemoryResident {#memoryresident}

サーバープロセスによって使用される物理メモリ（バイト単位）。
### MemoryShared {#memoryshared}

サーバープロセスによって使用され、他のプロセスでも共有されているメモリ（バイト単位）。ClickHouseは共有メモリを使用しませんが、いくつかのメモリはOSによって独自の理由で共有されるとマークされることがあります。このメトリックは監視するのにあまり意味をなさず、完全性の理由だけで存在します。
### MemoryVirtual {#memoryvirtual}

サーバープロセスによって割り当てられたバーチャルアドレス空間のサイズ（バイト単位）。バーチャルアドレス空間のサイズは通常物理メモリ使用量よりも大きく、メモリ使用量の推定には使用しない方が良いです。このメトリックの大きな値は完全に正常であり、技術的な意味しかありません。
### MySQLThreads {#mysqlthreads}

MySQL互換プロトコルのサーバー内のスレッド数。
### NetworkReceiveBytes_*name* {#networkreceivebytes_name}

ネットワークインターフェースを介して受信したバイト数。この数はシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。
### NetworkReceiveDrop_*name* {#networkreceivedrop_name}

ネットワークインターフェースを介して受信中にパケットが破棄された回数。この数はシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。
### NetworkReceiveErrors_*name* {#networkreceiveerrors_name}

ネットワークインターフェースを介して受信中にエラーが発生した回数。この数はシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。
### NetworkReceivePackets_*name* {#networkreceivepackets_name}

ネットワークインターフェースを介して受信したネットワークパケットの数。この数はシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。
### NetworkSendBytes_*name* {#networksendbytes_name}

ネットワークインターフェースを介して送信したバイト数。この数はシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。
### NetworkSendDrop_*name* {#networksenddrop_name}

ネットワークインターフェースを介して送信中にパケットが破棄された回数。この数はシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。
### NetworkSendErrors_*name* {#networksenderrors_name}

ネットワークインターフェースを介して送信中にエラー（例：TCP再送）が発生した回数。この数はシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。
### NetworkSendPackets_*name* {#networksendpackets_name}

ネットワークインターフェースを介して送信されたネットワークパケットの数。この数はシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。
### NumberOfDatabases {#numberofdatabases}

サーバー上のデータベースの合計数。
### NumberOfDetachedByUserParts {#numberofdetachedbyuserparts}

ユーザーが `ALTER TABLE DETACH` クエリを使用してMergeTreeテーブルから切り離したパーツの合計数（予期しない、壊れた、または無視されたパーツを除く）。サーバーは切り離されたパーツを気にせず、削除できます。
### NumberOfDetachedParts {#numberofdetachedparts}

MergeTreeテーブルから切り離されたパーツの合計数。パーツはユーザーによって `ALTER TABLE DETACH` クエリで切り離されるか、壊れている、予期しない、または不要な場合はサーバー自体によって切り離されることがあります。サーバーは切り離されたパーツを気にせず、削除できます。
### NumberOfTables {#numberoftables}

サーバー上のデータベースに跨るテーブルの合計数。MergeTreeテーブルを含めることができないデータベースを除外します。除外されるデータベースエンジンには、`Lazy`, `MySQL`, `PostgreSQL`, `SQlite` のように、即座にテーブルを生成するものがあります。
### OSContextSwitches {#oscontextswitches}

ホストマシンでシステムが経たコンテキストスイッチの数。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。
### OSGuestNiceTime {#osguestnicetime}

Linuxカーネルの制御下にあるゲストオペレーティングシステム用の仮想CPUを実行するのに費やされた時間の比率で、ゲストが優先度を高く設定されているとき（`man procfs`を参照）。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。このメトリックはClickHouseには関係しませんが、完全性のために存在します。単一CPUコアの値は[0..1]の範囲で、すべてのCPUコアの値は[0..コア数]の合計として計算されます。
### OSGuestNiceTimeCPU_*N* {#osguestnicetimecpu_n}

Linuxカーネルの制御下にあるゲストオペレーティングシステム用の仮想CPUを実行するのに費やされた時間の比率で、ゲストが優先度を高く設定されているとき（`man procfs`を参照）。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。このメトリックはClickHouseには関係しませんが、完全性のために存在します。単一CPUコアの値は[0..1]の範囲で、すべてのCPUコアの値は[0..コア数]の合計として計算されます。
### OSGuestNiceTimeNormalized {#osguestnicetimenormalized}

この値は `OSGuestNiceTime` に似ていますが、CPUコア数で割ったもので、コア数に関係なく[0..1]の範囲で測定されます。これにより、クラスター内の複数のサーバーにわたるこのメトリックの値を平均化でき、コア数が不均一であっても、平均リソース使用メトリックを取得できます。
### OSGuestTime {#osguesttime}

Linuxカーネルの制御下にあるゲストオペレーティングシステム用の仮想CPUを実行するのに費やされた時間の比率（`man procfs`を参照）。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。このメトリックはClickHouseには関係しませんが、完全性のために存在します。単一CPUコアの値は[0..1]の範囲で、すべてのCPUコアの値は[0..コア数]の合計として計算されます。
### OSGuestTimeCPU_*N* {#osguesttimecpu_n}

Linuxカーネルの制御下にあるゲストオペレーティングシステム用の仮想CPUを実行するのに費やされた時間の比率（`man procfs`を参照）。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。このメトリックはClickHouseには関係しませんが、完全性のために存在します。単一CPUコアの値は[0..1]の範囲で、すべてのCPUコアの値は[0..コア数]の合計として計算されます。
### OSGuestTimeNormalized {#osguesttimenormalized}

この値は `OSGuestTime` に似ていますが、CPUコア数で割ったもので、コア数に関係なく[0..1]の範囲で測定されます。これにより、クラスター内の複数のサーバーにわたるこのメトリックの値を平均化でき、コア数が不均一であっても、平均リソース使用メトリックを取得できます。
### OSIOWaitTime {#osiowaittime}

CPUコアがコードを実行していなかった時間の比率です。ただし、OSカーネルがこのCPUで他のプロセスを実行していなかったため、プロセスがIOを待機していたとき。この数はシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。単一CPUコアの値は[0..1]の範囲で、すべてのCPUコアの値は[0..コア数]の合計として計算されます。
### OSIOWaitTimeCPU_*N* {#osiowaittimecpu_n}

CPUコアがコードを実行していなかった時間の比率です。ただし、OSカーネルがこのCPUで他のプロセスを実行していなかったため、プロセスがIOを待機していたとき。この数はシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。単一CPUコアの値は[0..1]の範囲で、すべてのCPUコアの値は[0..コア数]の合計として計算されます。
### OSIOWaitTimeNormalized {#osiowaittimenormalized}

この値は `OSIOWaitTime` に似ていますが、CPUコア数で割ったもので、コア数に関係なく[0..1]の範囲で測定されます。これにより、クラスター内の複数のサーバーにわたるこのメトリックの値を平均化でき、コア数が不均一であっても、平均リソース使用メトリックを取得できます。
### OSIdleTime {#osidletime}

CPUコアがアイドル状態（IOを待機しているプロセスを実行する準備でさえない）であった時間の比率。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。これは、CPU内部の理由による過小利用の時間は含まれません（メモリローディング、パイプラインのスタンバイ、ブランチのミス予測、別のSMTコアを実行中）。単一CPUコアの値は[0..1]の範囲で、すべてのCPUコアの値は[0..コア数]の合計として計算されます。
### OSIdleTimeCPU_*N* {#osidletimecpu_n}

CPUコアがアイドル状態（IOを待機しているプロセスを実行する準備でさえない）であった時間の比率。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。これは、CPU内部の理由による過小利用の時間は含まれません（メモリローディング、パイプラインのスタンバイ、ブランチのミス予測、別のSMTコアを実行中）。単一CPUコアの値は[0..1]の範囲で、すべてのCPUコアの値は[0..コア数]の合計として計算されます。
### OSIdleTimeNormalized {#osidletimenormalized}

この値は `OSIdleTime` に似ていますが、CPUコア数で割ったもので、コア数に関係なく[0..1]の範囲で測定されます。これにより、クラスター内の複数のサーバーにわたるこのメトリックの値を平均化でき、コア数が不均一であっても、平均リソース使用メトリックを取得できます。
### OSInterrupts {#osinterrupts}

ホストマシンでの割り込みの数。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。
### OSIrqTime {#osirqtime}

CPUでハードウェア割り込み要求を実行するのに費やされた時間の比率。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。このメトリックの高い数値は、ハードウェア設定ミスまたは非常に高いネットワーク負荷を示すことがあります。単一CPUコアの値は[0..1]の範囲で、すべてのCPUコアの値は[0..コア数]の合計として計算されます。
### OSIrqTimeCPU_*N* {#osirqtimecpu_n}

CPUでハードウェア割り込み要求を実行するのに費やされた時間の比率。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。このメトリックの高い数値は、ハードウェア設定ミスまたは非常に高いネットワーク負荷を示すことがあります。単一CPUコアの値は[0..1]の範囲で、すべてのCPUコアの値は[0..コア数]の合計として計算されます。
### OSIrqTimeNormalized {#osirqtimenormalized}

この値は `OSIrqTime` に似ていますが、CPUコア数で割ったもので、コア数に関係なく[0..1]の範囲で測定されます。これにより、クラスター内の複数のサーバーにわたるこのメトリックの値を平均化でき、コア数が不均一であっても、平均リソース使用メトリックを取得できます。
### OSMemoryAvailable {#osmemoryavailable}

プログラムによって使用可能なメモリの量（バイト単位）。これは、`OSMemoryFreePlusCached` メトリックに非常に似ています。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。
### OSMemoryBuffers {#osmemorybuffers}

OSカーネルバッファによって使用されるメモリの量（バイト単位）。これは通常小さく、大きな値はOSの設定ミスを示す可能性があります。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。
### OSMemoryCached {#osmemorycached}

OSページキャッシュによって使用されるメモリの量（バイト単位）。通常、使用可能なメモリのほとんどはOSページキャッシュによって使用されます。このメトリックの高い値は正常で期待されます。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。
### OSMemoryFreePlusCached {#osmemoryfreepluscached}

ホストシステム上の自由メモリとOSページキャッシュメモリの合計（バイト単位）。このメモリはプログラムによって使用可能です。この値は、`OSMemoryAvailable` に非常に似ています。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスを含み、clickhouse-serverだけではありません。
```
### OSMemoryFreeWithoutCached {#osmemoryfreewithoutcached}

ホストシステム上の空きメモリ量（バイト）。これは、OSのページキャッシュメモリによって使用されるメモリは含まれません。ページキャッシュメモリはプログラムによっても使用可能であるため、このメトリックの値は混乱を招くことがあります。代わりに `OSMemoryAvailable` メトリックを参照してください。便利のために、 `OSMemoryFreePlusCached` メトリックも提供しており、これはおおよそ OSMemoryAvailable に類似しています。また、https://www.linuxatemyram.com/も参照してください。これはシステム全体のメトリックで、clickhouse-serverだけでなくホストマシン上のすべてのプロセスを含みます。
### OSMemoryTotal {#osmemorytotal}

ホストシステム上のメモリの総量（バイト）。
### OSNiceTime {#osnicetime}

CPUコアが優先度の高いユーザースペースコードを実行していた時間の比率。これはシステム全体のメトリックで、clickhouse-serverだけでなくホストマシン上のすべてのプロセスを含みます。単一のCPUコアの値は [0..1] の間になります。すべてのCPUコアの値は、それらを合計したもの [0..num cores] として計算されます。
### OSNiceTimeCPU_*N* {#osnicetimecpu_n}

CPUコアが優先度の高いユーザースペースコードを実行していた時間の比率。これはシステム全体のメトリックで、clickhouse-serverだけでなくホストマシン上のすべてのプロセスを含みます。単一のCPUコアの値は [0..1] の間になります。すべてのCPUコアの値は、それらを合計したもの [0..num cores] として計算されます。
### OSNiceTimeNormalized {#osnicetimenormalized}

この値は `OSNiceTime` に類似していますが、測定するCPUコアの数で割って [0..1] の間で測定されるようになります。これにより、コア数が不均一である場合でもクラスター内の複数のサーバーでこのメトリックの値を平均化でき、平均的なリソース使用率メトリックを得ることができます。
### OSOpenFiles {#osopenfiles}

ホストマシン上のオープンファイルの総数。これはシステム全体のメトリックで、clickhouse-serverだけでなくホストマシン上のすべてのプロセスを含みます。
### OSProcessesBlocked {#osprocessesblocked}

I/Oの完了を待ってブロックされたスレッドの数（`man procfs`）。これはシステム全体のメトリックで、clickhouse-serverだけでなくホストマシン上のすべてのプロセスを含みます。
### OSProcessesCreated {#osprocessescreated}

作成されたプロセスの数。これはシステム全体のメトリックで、clickhouse-serverだけでなくホストマシン上のすべてのプロセスを含みます。
### OSProcessesRunning {#osprocessesrunning}

オペレーティングシステムによって実行可能（実行中または実行可能）のスレッドの数。これはシステム全体のメトリックで、clickhouse-serverだけでなくホストマシン上のすべてのプロセスを含みます。
### OSSoftIrqTime {#ossoftirqtime}

CPU上でソフトウェア割り込み要求を実行するために費やされた時間の比率。これはシステム全体のメトリックで、clickhouse-serverだけでなくホストマシン上のすべてのプロセスを含みます。このメトリックが高い場合、システム上で非効率的なソフトウェアが実行されている可能性があります。単一のCPUコアの値は [0..1] の間になります。すべてのCPUコアの値は、それらを合計したもの [0..num cores] として計算されます。
### OSSoftIrqTimeCPU_*N* {#ossoftirqtimecpu_n}

CPU上でソフトウェア割り込み要求を実行するために費やされた時間の比率。これはシステム全体のメトリックで、clickhouse-serverだけでなくホストマシン上のすべてのプロセスを含みます。このメトリックが高い場合、システム上で非効率的なソフトウェアが実行されている可能性があります。単一のCPUコアの値は [0..1] の間になります。すべてのCPUコアの値は、それらを合計したもの [0..num cores] として計算されます。
### OSSoftIrqTimeNormalized {#ossoftirqtimenormalized}

この値は `OSSoftIrqTime` に類似していますが、測定するCPUコアの数で割って [0..1] の間で測定されるようになります。これにより、コア数が不均一である場合でもクラスター内の複数のサーバーでこのメトリックの値を平均化でき、平均的なリソース使用率メトリックを得ることができます。
### OSStealTime {#osstealtime}

仮想化環境で実行されている際に、CPUが他のオペレーティングシステムに費やした時間の比率。これはシステム全体のメトリックで、clickhouse-serverだけでなくホストマシン上のすべてのプロセスを含みます。すべての仮想化環境がこのメトリックを提供するわけではなく、そのほとんどは提供していません。単一のCPUコアの値は [0..1] の間になります。すべてのCPUコアの値は、それらを合計したもの [0..num cores] として計算されます。
### OSStealTimeCPU_*N* {#osstealtimecpu_n}

仮想化環境で実行されている際に、CPUが他のオペレーティングシステムに費やした時間の比率。これはシステム全体のメトリックで、clickhouse-serverだけでなくホストマシン上のすべてのプロセスを含みます。すべての仮想化環境がこのメトリックを提供するわけではなく、そのほとんどは提供していません。単一のCPUコアの値は [0..1] の間になります。すべてのCPUコアの値は、それらを合計したもの [0..num cores] として計算されます。
### OSStealTimeNormalized {#osstealtimenormalized}

この値は `OSStealTime` に類似していますが、測定するCPUコアの数で割って [0..1] の間で測定されるようになります。これにより、コア数が不均一である場合でもクラスター内の複数のサーバーでこのメトリックの値を平均化でき、平均的なリソース使用率メトリックを得ることができます。
### OSSystemTime {#ossystemtime}

CPUコアがOSカーネル（システム）コードを実行していた時間の比率。これはシステム全体のメトリックで、clickhouse-serverだけでなくホストマシン上のすべてのプロセスを含みます。単一のCPUコアの値は [0..1] の間になります。すべてのCPUコアの値は、それらを合計したもの [0..num cores] として計算されます。
### OSSystemTimeCPU_*N* {#ossystemtimecpu_n}

CPUコアがOSカーネル（システム）コードを実行していた時間の比率。これはシステム全体のメトリックで、clickhouse-serverだけでなくホストマシン上のすべてのプロセスを含みます。単一のCPUコアの値は [0..1] の間になります。すべてのCPUコアの値は、それらを合計したもの [0..num cores] として計算されます。
### OSSystemTimeNormalized {#ossystemtimenormalized}

この値は `OSSystemTime` に類似していますが、測定するCPUコアの数で割って [0..1] の間で測定されるようになります。これにより、コア数が不均一である場合でもクラスター内の複数のサーバーでこのメトリックの値を平均化でき、平均的なリソース使用率メトリックを得ることができます。
### OSThreadsRunnable {#osthreadsrunnable}

OSカーネルスケジューラが見ている「実行可能」スレッドの総数。
### OSThreadsTotal {#osthreadstotal}

OSカーネルスケジューラが見ているスレッドの総数。
### OSUptime {#osuptime}

ホストサーバー（ClickHouseが実行されているマシン）の稼働時間（秒）。
### OSUserTime {#osusertime}

CPUコアがユーザースペースコードを実行していた時間の比率。これはシステム全体のメトリックで、clickhouse-serverだけでなくホストマシン上のすべてのプロセスを含みます。これには、CPUが内部理由（メモリ負荷、パイプラインスタール、分岐ミス予測、別のSMTコア実行）により過少利用されていた時間も含まれます。単一のCPUコアの値は [0..1] の間になります。すべてのCPUコアの値は、それらを合計したもの [0..num cores] として計算されます。
### OSUserTimeCPU_*N* {#osusertimecpu_n}

CPUコアがユーザースペースコードを実行していた時間の比率。これはシステム全体のメトリックで、clickhouse-serverだけでなくホストマシン上のすべてのプロセスを含みます。これには、CPUが内部理由（メモリ負荷、パイプラインスタール、分岐ミス予測、別のSMTコア実行）により過少利用されていた時間も含まれます。単一のCPUコアの値は [0..1] の間になります。すべてのCPUコアの値は、それらを合計したもの [0..num cores] として計算されます。
### OSUserTimeNormalized {#osusertimenormalized}

この値は `OSUserTime` に類似していますが、測定するCPUコアの数で割って [0..1] の間で測定されるようになります。これにより、コア数が不均一である場合でもクラスター内の複数のサーバーでこのメトリックの値を平均化でき、平均的なリソース使用率メトリックを得ることができます。
### PostgreSQLThreads {#postgresqlthreads}

PostgreSQL互換プロトコルのサーバー内のスレッド数。
### QueryCacheBytes {#querycachebytes}

クエリキャッシュの合計サイズ（バイト）。
### QueryCacheEntries {#querycacheentries}

クエリキャッシュ内のエントリの総数。
### ReplicasMaxAbsoluteDelay {#replicasmaxabsolutedelay}

最も新しいレプリケートパートとまだレプリケートされていない最も新しいデータパートの間の最大の差（秒数）、レプリケートテーブル全体で。非常に高い値は、データのないレプリカを示しています。
### ReplicasMaxInsertsInQueue {#replicasmaxinsertsinqueue}

レプリケートテーブル全体のキュー内の最大INSERT操作数（まだレプリケートされていない）。
### ReplicasMaxMergesInQueue {#replicasmaxmergesinqueue}

レプリケートテーブル全体のキュー内の最大マージ操作数（まだ適用されていない）。
### ReplicasMaxQueueSize {#replicasmaxqueuesize}

レプリケートテーブル全体の最大キューサイズ（取得やマージなどの操作の数）。
### ReplicasMaxRelativeDelay {#replicasmaxrelativedelay}

レプリカの遅延と同じテーブルの最も最新のレプリカの遅延の間の最大の差、レプリケートテーブル全体で。
### ReplicasSumInsertsInQueue {#replicassuminsertsinqueue}

レプリケートテーブル全体のキュー内のINSERT操作の合計数（まだレプリケートされていない）。
### ReplicasSumMergesInQueue {#replicassummergesinqueue}

レプリケートテーブル全体のキュー内のマージ操作の合計数（まだ適用されていない）。
### ReplicasSumQueueSize {#replicassumqueuesize}

レプリケートテーブル全体の合計キューサイズ（取得やマージなどの操作の数）。
### TCPThreads {#tcpthreads}

TCPプロトコルのサーバー内のスレッド数（TLSなし）。
### Temperature_*N* {#temperature_n}

対応するデバイスの温度（℃）。センサーは現実的でない値を返す可能性があります。ソース: `/sys/class/thermal`
### Temperature_*name* {#temperature_name}

対応するハードウェアモニターおよび対応するセンサーが報告する温度（℃）。センサーは現実的でない値を返す可能性があります。ソース: `/sys/class/hwmon`
### TotalBytesOfMergeTreeTables {#totalbytesofmergetreetables}

MergeTreeファミリのすべてのテーブルに保存されているバイトの総量（圧縮済み、データとインデックスを含む）。
### TotalPartsOfMergeTreeTables {#totalpartsofmergetreetables}

MergeTreeファミリのすべてのテーブルにおけるデータパーツの総数。10,000を超える数字は、サーバーの起動時間に悪影響を及ぼし、分割キーの不合理な選択を示す可能性があります。
### TotalPrimaryKeyBytesInMemory {#totalprimarykeybytesinmemory}

プライマリーキーの値（アクティブなパーツのみ考慮）のために使用されているメモリの総量（バイト）。
### TotalPrimaryKeyBytesInMemoryAllocated {#totalprimarykeybytesinmemoryallocated}

プライマリーキーの値（アクティブなパーツのみ考慮）のために予約されたメモリの総量（バイト）。
### TotalRowsOfMergeTreeTables {#totalrowsofmergetreetables}

MergeTreeファミリのすべてのテーブルに保存されている行（レコード）の総数。
### UncompressedCacheBytes {#uncompressedcachebytes}

未圧縮キャッシュの合計サイズ（バイト）。未圧縮キャッシュは通常、パフォーマンスを向上させず、主に避けるべきです。
### UncompressedCacheCells {#uncompressedcachecells}

未圧縮キャッシュ内のエントリの総数。各エントリはデコンプレッションされたデータブロックを表します。未圧縮キャッシュは通常、パフォーマンスを向上させず、主に避けるべきです。
### Uptime {#uptime}

サーバーの稼働時間（秒）。接続を受け入れる前のサーバー初期化に費やされた時間も含まれます。
### jemalloc.active {#jemallocactive}

低レベルメモリアロケーター（jemalloc）の内部メトリック。 https://jemalloc.net/jemalloc.3.htmlを参照してください。
### jemalloc.allocated {#jemallocallocated}

低レベルメモリアロケーター（jemalloc）の内部メトリック。 https://jemalloc.net/jemalloc.3.htmlを参照してください。
### jemalloc.arenas.all.dirty_purged {#jemallocarenasalldirty_purged}

低レベルメモリアロケーター（jemalloc）の内部メトリック。 https://jemalloc.net/jemalloc.3.htmlを参照してください。
### jemalloc.arenas.all.muzzy_purged {#jemallocarenasallmuzzy_purged}

低レベルメモリアロケーター（jemalloc）の内部メトリック。 https://jemalloc.net/jemalloc.3.htmlを参照してください。
### jemalloc.arenas.all.pactive {#jemallocarenasallpactive}

低レベルメモリアロケーター（jemalloc）の内部メトリック。 https://jemalloc.net/jemalloc.3.htmlを参照してください。
### jemalloc.arenas.all.pdirty {#jemallocarenasallpdirty}

低レベルメモリアロケーター（jemalloc）の内部メトリック。 https://jemalloc.net/jemalloc.3.htmlを参照してください。
### jemalloc.arenas.all.pmuzzy {#jemallocarenasallpmuzzy}

低レベルメモリアロケーター（jemalloc）の内部メトリック。 https://jemalloc.net/jemalloc.3.htmlを参照してください。
### jemalloc.background_thread.num_runs {#jemallocbackground_threadnum_runs}

低レベルメモリアロケーター（jemalloc）の内部メトリック。 https://jemalloc.net/jemalloc.3.htmlを参照してください。
### jemalloc.background_thread.num_threads {#jemallocbackground_threadnum_threads}

低レベルメモリアロケーター（jemalloc）の内部メトリック。 https://jemalloc.net/jemalloc.3.htmlを参照してください。
### jemalloc.background_thread.run_intervals {#jemallocbackground_threadrun_intervals}

低レベルメモリアロケーター（jemalloc）の内部メトリック。 https://jemalloc.net/jemalloc.3.htmlを参照してください。
### jemalloc.epoch {#jemallocepoch}

jemallocの統計の内部インクリメンタルアップデート番号（Jason Evansのメモリアロケーター）、すべての他の `jemalloc` メトリックで使用されます。
### jemalloc.mapped {#jemallocmapped}

低レベルメモリアロケーター（jemalloc）の内部メトリック。 https://jemalloc.net/jemalloc.3.htmlを参照してください。
### jemalloc.metadata {#jemallocmetadata}

低レベルメモリアロケーター（jemalloc）の内部メトリック。 https://jemalloc.net/jemalloc.3.htmlを参照してください。
### jemalloc.metadata_thp {#jemallocmetadata_thp}

低レベルメモリアロケーター（jemalloc）の内部メトリック。 https://jemalloc.net/jemalloc.3.htmlを参照してください。
### jemalloc.resident {#jemallocresident}

低レベルメモリアロケーター（jemalloc）の内部メトリック。 https://jemalloc.net/jemalloc.3.htmlを参照してください。
### jemalloc.retained {#jemallocretained}

低レベルメモリアロケーター（jemalloc）の内部メトリック。 https://jemalloc.net/jemalloc.3.htmlを参照してください。
### jemalloc.prof.active {#jemallocprofactive}

低レベルメモリアロケーター（jemalloc）の内部メトリック。 https://jemalloc.net/jemalloc.3.htmlを参照してください。

**関連情報**

- [Monitoring](../../operations/monitoring.md) — ClickHouseモニタリングの基本概念。
- [system.metrics](/operations/system-tables/metrics) — 即座に計算されたメトリックを含む。
- [system.events](/operations/system-tables/events) — 発生したイベントの数を含む。
- [system.metric_log](/operations/system-tables/metric_log) — `system.metrics` と `system.events` テーブルからのメトリック値の履歴を含む。
