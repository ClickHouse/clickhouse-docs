---
description: "バックグラウンドで定期的に計算されるメトリクスを含むシステムテーブル。たとえば、使用中のRAMの量。"
slug: /operations/system-tables/asynchronous_metrics
title: "system.asynchronous_metrics"
keywords: ["system table", "asynchronous_metrics"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

バックグラウンドで定期的に計算されるメトリクスを含みます。たとえば、使用中のRAMの量です。

カラム:

- `metric` ([String](../../sql-reference/data-types/string.md)) — メトリクス名。
- `value` ([Float64](../../sql-reference/data-types/float.md)) — メトリクス値。
- `description` ([String](../../sql-reference/data-types/string.md)) — メトリクスの説明。

**例**

``` sql
SELECT * FROM system.asynchronous_metrics LIMIT 10
```

``` text
┌─metric──────────────────────────────────┬──────value─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ AsynchronousMetricsCalculationTimeSpent │ 0.00179053 │ 非同期メトリクスの計算にかかった時間（この値は非同期メトリクスのオーバーヘッドです）。                                                                                                                                              │
│ NumberOfDetachedByUserParts             │          0 │ ユーザーによって `ALTER TABLE DETACH` クエリで切り離されたMergeTreeテーブルからのパーツの総数（予期しないもの、壊れたもの、無視されたものではなく）。サーバーは切り離されたパーツを気にせず、削除することができます。                          │
│ NumberOfDetachedParts                   │          0 │ MergeTreeテーブルから切り離されたパーツの総数。パーツは、ユーザーが `ALTER TABLE DETACH` クエリを使って切り離すことができ、サーバー自体も壊れた、予期しない、または不要な場合に切り離すことができます。サーバーは切り離されたパーツを気にせず、削除することができます。 │
│ TotalRowsOfMergeTreeTables              │    2781309 │ MergeTreeファミリーに保存されている全テーブルの行（レコード）の合計数。                                                                                                                                                                                   │
│ TotalBytesOfMergeTreeTables             │    7741926 │ MergeTreeファミリーに保存されている全テーブルのバイト数（圧縮されたもの、データとインデックスを含む）の合計。                                                                                                                                                   │
│ NumberOfTables                          │         93 │ サーバー上のデータベース全体で合計されたテーブルの総数。MergeTreeテーブルを含むことができないデータベースは除外されます。除外されるデータベースエンジンは、`Lazy`、`MySQL`、`PostgreSQL`、`SQlite`など、テーブルのセットをリアルタイムで生成するものです。 │
│ NumberOfDatabases                       │          6 │ サーバー上のデータベースの総数。                                                                                                                                                                                                                   │
│ MaxPartCountForPartition                │          6 │ MergeTreeファミリーの全テーブルのすべてのパーティションにおける、パーティションあたりの最大パーツ数。300を超える値は、設定ミス、オーバーロード、または大量のデータのロードを示します。                                                                       │
│ ReplicasSumMergesInQueue                │          0 │ レプリケーテッドテーブル全体でキュー内のマージ操作の合計（まだ適用されていないもの）。                                                                                                                                                                       │
│ ReplicasSumInsertsInQueue               │          0 │ レプリケーテッドテーブル全体でキュー内のINSERT操作の合計（まだレプリケートされていないもの）。                                                                                                                                                                   │
└─────────────────────────────────────────┴────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

<!--- system.eventsやsystem.metricsとは異なり、非同期メトリクスはソースコードファイルの単純なリストとして収集されず、src/Interpreters/ServerAsynchronousMetrics.cppのロジックと混合されます。
      読者の便宜のためにここに明示的にリストしています。 --->
## メトリクスの説明 {#metric-descriptions}
### AsynchronousHeavyMetricsCalculationTimeSpent {#asynchronousheavymetricscalculationtimespent}

非同期の重い（テーブル関連）メトリクスの計算にかかった時間（この値は非同期メトリクスのオーバーヘッドです）。
### AsynchronousHeavyMetricsUpdateInterval {#asynchronousheavymetricsupdateinterval}

重い（テーブル関連）メトリクスの更新間隔。
### AsynchronousMetricsCalculationTimeSpent {#asynchronousmetricscalculationtimespent}

非同期メトリクスの計算にかかった時間（この値は非同期メトリクスのオーバーヘッドです）。
### AsynchronousMetricsUpdateInterval {#asynchronousmetricsupdateinterval}

メトリクスの更新間隔。
### BlockActiveTime_*name* {#blockactivetime_name}

ブロックデバイスがIOリクエストをキューイングしていた時間（秒単位）。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。出所: `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardBytes_*name* {#blockdiscardbytes_name}

ブロックデバイスで破棄されたバイト数。これらの操作はSSDに関連します。破棄操作はClickHouseでは使用されませんが、システム上の他のプロセスによって使用される可能性があります。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。出所: `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardMerges_*name* {#blockdiscardmerges_name}

ブロックデバイスから要求され、OS IOスケジューラによってマージされた破棄操作の数。これらの操作はSSDに関連します。破棄操作はClickHouseでは使用されませんが、システム上の他のプロセスによって使用される可能性があります。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。出所: `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardOps_*name* {#blockdiscardops_name}

ブロックデバイスで要求された破棄操作の数。これらの操作はSSDに関連します。破棄操作はClickHouseでは使用されませんが、システム上の他のプロセスによって使用される可能性があります。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。出所: `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardTime_*name* {#blockdiscardtime_name}

ブロックデバイスから要求された破棄操作で消費された時間（秒単位）、すべての操作を合計。これらの操作はSSDに関連します。破棄操作はClickHouseでは使用されませんが、システム上の他のプロセスによって使用される可能性があります。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。出所: `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockInFlightOps_*name* {#blockinflightops_name}

この値は、デバイスドライバに発行されたがまだ完了していないI/Oリクエストの数をカウントします。まだデバイスドライバに発行されていないが、キューにあるIOリクエストは含まれません。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。出所: `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockQueueTime_*name* {#blockqueuetime_name}

この値は、このブロックデバイスでIOリクエストが待機したミリ秒数をカウントします。複数のIOリクエストが待機する場合、この値は、待機中のリクエストの数×待機したミリ秒数として増加します。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。出所: `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadBytes_*name* {#blockreadbytes_name}

ブロックデバイスから読み取られたバイト数。OSページキャッシュの使用により、ファイルシステムから読み取られたバイト数よりも少ない場合があります。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。出所: `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadMerges_*name* {#blockreadmerges_name}

ブロックデバイスから要求され、OS IOスケジューラによってマージされた読み取り操作の数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。出所: `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadOps_*name* {#blockreadops_name}

ブロックデバイスから要求された読み取り操作の数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。出所: `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadTime_*name* {#blockreadtime_name}

ブロックデバイスから要求された読み取り操作にかかった時間（秒単位）、すべての操作を合計。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。出所: `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteBytes_*name* {#blockwritebytes_name}

ブロックデバイスに書き込まれたバイト数。OSページキャッシュの使用により、ファイルシステムに書き込まれたバイト数よりも少ない場合があります。ブロックデバイスへの書き込みは、対応するファイルシステムへの書き込みよりも遅くなることがあります。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。出所: `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteMerges_*name* {#blockwritemerges_name}

ブロックデバイスから要求され、OS IOスケジューラによってマージされた書き込み操作の数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。出所: `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteOps_*name* {#blockwriteops_name}

ブロックデバイスから要求された書き込み操作の数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。出所: `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteTime_*name* {#blockwritetime_name}

ブロックデバイスから要求された書き込み操作にかかった時間（秒単位）、すべての操作を合計。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。出所: `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt
### CPUFrequencyMHz_*name* {#cpufrequencymhz_name}

CPUの現在の周波数（MHz単位）。ほとんどの最新のCPUは、電力消費を抑えるために周波数を動的に調整し、ターボブーストを行います。
### CompiledExpressionCacheBytes {#compiledexpressioncachebytes}

JITコンパイルされたコードのキャッシュに使用される合計バイト数。
### CompiledExpressionCacheCount {#compiledexpressioncachecount}

JITコンパイルされたコードのキャッシュ内の合計エントリ数。
### DiskAvailable_*name* {#diskavailable_name}

ディスク（仮想ファイルシステム）上の利用可能なバイト数。リモートファイルシステムは16 EiBなどの大きな値を表示することがあります。
### DiskTotal_*name* {#disktotal_name}

ディスクの総サイズ（バイト単位）（仮想ファイルシステム）。リモートファイルシステムは16 EiBなどの大きな値を表示することがあります。
### DiskUnreserved_*name* {#diskunreserved_name}

マージ、フェッチ、および移動のための予約なしのディスク（仮想ファイルシステム）上の利用可能なバイト数。リモートファイルシステムは16 EiBなどの大きな値を表示することがあります。
### DiskUsed_*name* {#diskused_name}

ディスク（仮想ファイルシステム）上の使用済みバイト数。リモートファイルシステムはこの情報を常に提供するわけではありません。
### FilesystemCacheBytes {#filesystemcachebytes}

`cache`仮想ファイルシステム内の合計バイト数。このキャッシュはディスク上に保持されます。
### FilesystemCacheFiles {#filesystemcachefiles}

`cache`仮想ファイルシステム内のキャッシュされたファイルセグメントの総数。このキャッシュはディスク上に保持されます。
### FilesystemLogsPathAvailableBytes {#filesystemlogspathavailablebytes}

ClickHouseログパスがマウントされているボリューム上の利用可能なバイト数。この値がゼロに近づくと、設定ファイルでのログローテーションを調整する必要があります。
### FilesystemLogsPathAvailableINodes {#filesystemlogspathavailableinodes}

ClickHouseログパスがマウントされているボリューム上の利用可能なinodeの数。
### FilesystemLogsPathTotalBytes {#filesystemlogspathtotalbytes}

ClickHouseログパスがマウントされているボリュームのサイズ（バイト単位）。ログには少なくとも10 GBを確保することをお勧めします。
### FilesystemLogsPathTotalINodes {#filesystemlogspathtotalinodes}

ClickHouseログパスがマウントされているボリューム上のinodeの総数。
### FilesystemLogsPathUsedBytes {#filesystemlogspathusedbytes}

ClickHouseログパスがマウントされているボリューム上の使用済みバイト数。
### FilesystemLogsPathUsedINodes {#filesystemlogspathusedinodes}

ClickHouseログパスがマウントされているボリューム上の使用済みinodeの数。
### FilesystemMainPathAvailableBytes {#filesystemmainpathavailablebytes}

メインClickHouseパスがマウントされているボリューム上の利用可能なバイト数。
### FilesystemMainPathAvailableINodes {#filesystemmainpathavailableinodes}

メインClickHouseパスがマウントされているボリューム上の利用可能なinodeの数。この値がゼロに近づくと、設定ミスを示し、ディスクが満杯でないにもかかわらず「デバイスに空き容量がない」というエラーが発生します。
### FilesystemMainPathTotalBytes {#filesystemmainpathtotalbytes}

メインClickHouseパスがマウントされているボリュームのサイズ（バイト単位）。
### FilesystemMainPathTotalINodes {#filesystemmainpathtotalinodes}

メインClickHouseパスがマウントされているボリューム上のinodeの総数。この値が2500万未満であれば、設定ミスを示します。
### FilesystemMainPathUsedBytes {#filesystemmainpathusedbytes}

メインClickHouseパスがマウントされているボリューム上の使用済みバイト数。
### FilesystemMainPathUsedINodes {#filesystemmainpathusedinodes}

メインClickHouseパスがマウントされているボリューム上の使用済みinodeの数。この値は主にファイルの数に対応します。
### HTTPThreads {#httpthreads}

HTTPインターフェースのサーバー内のスレッド数（TLSなし）。
### InterserverThreads {#interserverthreads}

レプリカ間通信プロトコルのサーバー内のスレッド数（TLSなし）。
### Jitter {#jitter}

非同期メトリクス計算のスレッドが再起動するまでにスケジュールされた時間と、実際に再起動された時間の差。システム全体のレイテンシーと応答性の指標。
### LoadAverage*N* {#loadaveragen}

すべてのプロセスにわたって1分間の指数加重平均で得られたシステム全体の負荷。負荷は、現在CPUで実行中またはIOを待機しているか、実行可能ですが現在スケジュールされていないスレッドの数を表します。この数値にはすべてのプロセスが含まれ、ClickHouseサーバーだけではありません。この数値は、システムがオーバーロード状態で、実行可能な多くのプロセスがCPUやIOを待機しているときに、CPUコアの数を超えることがあります。
### MMapCacheCells {#mmapcachecells}

`mmap`（メモリにマッピングされた）でオープンされたファイルの数。この機能は、`local_filesystem_read_method`が`mmap`に設定されているクエリに使用されます。`mmap`でオープンされたファイルは、コストの高いTLBフラッシュを避けるためにキャッシュに保持されます。
### MarkCacheBytes {#markcachebytes}

マークキャッシュの合計サイズ（バイト単位）。
### MarkCacheFiles {#markcachefiles}

マークキャッシュにキャッシュされたマークファイルの総数。
### MaxPartCountForPartition {#maxpartcountforpartition}

MergeTreeファミリーのすべてのテーブルのすべてのパーティションにおける、パーティションあたりの最大パーツ数。300を超える値は、設定ミス、オーバーロード、または大量のデータのロードを示します。
### MemoryCode {#memorycode}

サーバープロセスのマシンコードページにマッピングされた仮想メモリの量（バイト単位）。
### MemoryDataAndStack {#memorydataandstack}

スタックや割り当てられたメモリの使用にマッピングされた仮想メモリの量（バイト単位）。この値にはスレッドごとのスタックや、'mmap'システムコールで割り当てられたほとんどの割り当てメモリが含まれるかどうかは不明です。このメトリクスは、完全さのために存在します。監視のためには、`MemoryResident`メトリクスを使用することを推奨します。
### MemoryResidentMax {#memoryresidentmax}

サーバープロセスによって使用された最大の物理メモリ量（バイト単位）。
### MemoryResident {#memoryresident}

サーバープロセスによって使用された物理メモリ量（バイト単位）。
### MemoryShared {#memoryshared}

サーバープロセスで使用されている、他のプロセスとも共有されるメモリの量（バイト単位）。ClickHouseは共有メモリを使用しませんが、OSの特性により一部のメモリが共有されることがあります。このメトリクスは監視にはあまり意味がなく、完全性のためにのみ存在します。
### MemoryVirtual {#memoryvirtual}

サーバープロセスによって割り当てられた仮想アドレス空間のサイズ（バイト単位）。仮想アドレス空間のサイズは通常、物理メモリの消費よりもはるかに大きく、メモリ消費量の見積もりに使うべきではありません。このメトリクスの大きな値は完全に正常であり、技術的な意味しか持ちません。
### MySQLThreads {#mysqlthreads}

MySQL互換プロトコルのサーバー内のスレッド数。
### NetworkReceiveBytes_*name* {#networkreceivebytes_name}

ネットワークインターフェースを通じて受信したバイト数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。
### NetworkReceiveDrop_*name* {#networkreceivedrop_name}

ネットワークインターフェースを通じて受信する際にパケットがドロップされた回数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。
### NetworkReceiveErrors_*name* {#networkreceiveerrors_name}

ネットワークインターフェースを通じて受信する際にエラーが発生した回数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。
### NetworkReceivePackets_*name* {#networkreceivepackets_name}

ネットワークインターフェースを通じて受信したネットワークパケットの数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。
### NetworkSendBytes_*name* {#networksendbytes_name}

ネットワークインターフェースを通じて送信したバイト数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。
### NetworkSendDrop_*name* {#networksenddrop_name}

ネットワークインターフェースを通じて送信する際にパケットがドロップされた回数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。
### NetworkSendErrors_*name* {#networksenderrors_name}

ネットワークインターフェースを通じて送信する際にエラーが発生した回数（例: TCP再送信）。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。
### NetworkSendPackets_*name* {#networksendpackets_name}

ネットワークインターフェースを通じて送信したネットワークパケットの数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。
### NumberOfDatabases {#numberofdatabases}

サーバー上のデータベースの総数。
### NumberOfDetachedByUserParts {#numberofdetachedbyuserparts}

ユーザーによって `ALTER TABLE DETACH` クエリで切り離されたMergeTreeテーブルからのパーツの総数（予期しないもの、壊れたもの、無視されたものではなく）。サーバーは切り離されたパーツを気にせず、削除することができます。
### NumberOfDetachedParts {#numberofdetachedparts}

MergeTreeテーブルから切り離されたパーツの総数。パーツはユーザーによって `ALTER TABLE DETACH` クエリで切り離されるか、部分が壊れていたり、予期しない、または不要な場合にサーバー自身によって切り離されることがあります。サーバーは切り離されたパーツを気にせず、削除することができます。
### NumberOfTables {#numberoftables}

サーバー上のデータベース全体で合計されたテーブルの総数。MergeTreeテーブルを含むことができないデータベースは除外されます。除外されるデータベースエンジンは、`Lazy`、`MySQL`、`PostgreSQL`、`SQlite`など、テーブルのセットをリアルタイムで生成するものです。
### OSContextSwitches {#oscontextswitches}

ホストマシンでシステムが経験したコンテキストスイッチの数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。
### OSGuestNiceTime {#osguestnicetime}

Linuxカーネルによって制御されているゲストオペレーティングシステムの仮想CPUを実行するのに費やされた時間の比率。ゲストが優先度を高く設定された場合（参照: `man procfs`）。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。このメトリクスはClickHouseには無関係ですが、完全性のために存在します。単一のCPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は、すべてのコアを通じての合計として計算されます[0..コアの数]。
### OSGuestNiceTimeCPU_*N* {#osguestnicetimecpu_n}

Linuxカーネルによって制御されているゲストオペレーティングシステムの仮想CPUを実行するのに費やされた時間の比率。ゲストが優先度を高く設定された場合（参照: `man procfs`）。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。このメトリクスはClickHouseには無関係ですが、完全性のために存在します。単一のCPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は、すべてのコアを通じての合計として計算されます[0..コアの数]。
### OSGuestNiceTimeNormalized {#osguestnicetimenormalized}

値は`OSGuestNiceTime`に似ていますが、CPUコア数で割った値です。これにより、コア数が非均一な複数のサーバーの間で、このメトリクスの値を平均化しつつ、平均リソース使用メトリクスを取得できます。
### OSGuestTime {#osguesttime}

Linuxカーネルによって制御されているゲストオペレーティングシステムの仮想CPUを実行するのに費やされた時間の比率（参照: `man procfs`）。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。このメトリクスはClickHouseには無関係ですが、完全性のために存在します。単一のCPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は、すべてのコアを通じての合計として計算されます[0..コアの数]。
### OSGuestTimeCPU_*N* {#osguesttimecpu_n}

Linuxカーネルによって制御されているゲストオペレーティングシステムの仮想CPUを実行するのに費やされた時間の比率（参照: `man procfs`）。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。このメトリクスはClickHouseには無関係ですが、完全性のために存在します。単一のCPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は、すべてのコアを通じての合計として計算されます[0..コアの数]。
### OSGuestTimeNormalized {#osguesttimenormalized}

値は`OSGuestTime`に似ていますが、CPUコア数で割った値です。これにより、コア数が非均一な複数のサーバーの間で、このメトリクスの値を平均化しつつ、平均リソース使用メトリクスを取得できます。
### OSIOWaitTime {#osiowaittime}

CPUコアがコードを実行していなかった時間の比率ですが、プロセスがIOを待機しているためにOSカーネルが他のプロセスをこのCPU上で実行しなかった場合。このメトリクスはシステム全体のもので、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。単一のCPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は、すべてのコアを通じての合計として計算されます[0..コアの数]。
### OSIOWaitTimeCPU_*N* {#osiowaittimecpu_n}

CPUコアがコードを実行していなかった時間の比率ですが、プロセスがIOを待機しているためにOSカーネルが他のプロセスをこのCPU上で実行しなかった場合。このメトリクスはシステム全体のもので、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。単一のCPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は、すべてのコアを通じての合計として計算されます[0..コアの数]。
### OSIOWaitTimeNormalized {#osiowaittimenormalized}

値は`OSIOWaitTime`に似ていますが、CPUコア数で割った値です。これにより、コア数が非均一な複数のサーバーの間で、このメトリクスの値を平均化しつつ、平均リソース使用メトリクスを取得できます。
### OSIdleTime {#osidletime}

CPUコアがアイドル状態であった時間（IOを待っているプロセスを実行する準備もしていない）を示す比率です。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。これはCPU内部の理由（メモリ負荷、パイプラインの停止、分岐の誤予測、他のSMTコアの実行）による過小利用の時間は含まれません。単一のCPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は、すべてのコアを通じての合計として計算されます[0..コアの数]。
### OSIdleTimeCPU_*N* {#osidletimecpu_n}

CPUコアがアイドル状態であった時間（IOを待っているプロセスを実行する準備もしていない）を示す比率です。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。これはCPU内部の理由（メモリ負荷、パイプラインの停止、分岐の誤予測、他のSMTコアの実行）による過小利用の時間は含まれません。単一のCPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は、すべてのコアを通じての合計として計算されます[0..コアの数]。
### OSIdleTimeNormalized {#osidletimenormalized}

値は`OSIdleTime`に似ていますが、CPUコア数で割った値です。これにより、コア数が非均一な複数のサーバーの間で、このメトリクスの値を平均化しつつ、平均リソース使用メトリクスを取得できます。
### OSInterrupts {#osinterrupts}

ホストマシン上での割り込みの数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。
### OSIrqTime {#osirqtime}

CPUでハードウェア割り込み要求を実行するのに費やされた時間の比率。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。このメトリクスの高い値は、ハードウェアの設定ミスや非常に高いネットワーク負荷を示すかもしれません。単一のCPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は、すべてのコアを通じての合計として計算されます[0..コアの数]。
### OSIrqTimeCPU_*N* {#osirqtimecpu_n}

CPUでハードウェア割り込み要求を実行するのに費やされた時間の比率。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。このメトリクスの高い値は、ハードウェアの設定ミスや非常に高いネットワーク負荷を示すかもしれません。単一のCPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は、すべてのコアを通じての合計として計算されます[0..コアの数]。
### OSIrqTimeNormalized {#osirqtimenormalized}

値は`OSIrqTime`に似ていますが、CPUコア数で割った値です。これにより、コア数が非均一な複数のサーバーの間で、このメトリクスの値を平均化しつつ、平均リソース使用メトリクスを取得できます。
### OSMemoryAvailable {#osmemoryavailable}

プログラムが使用できるメモリの量（バイト単位）。これは`OSMemoryFreePlusCached`メトリクスに非常に似ています。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。
### OSMemoryBuffers {#osmemorybuffers}

OSカーネルバッファが使用しているメモリの量（バイト単位）。通常は小さく、大きな値はOSの設定ミスを示す可能性があります。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。
### OSMemoryCached {#osmemorycached}

OSページキャッシュが使用しているメモリの量（バイト単位）。通常、ほぼすべての利用可能なメモリがOSページキャッシュによって使われます。高い値はこのメトリクスでは正常で予想されることです。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。
### OSMemoryFreePlusCached {#osmemoryfreepluscached}

ホストシステム上の自由なメモリとOSページキャッシュメモリの合計（バイト単位）。このメモリはプログラムに使用できるものです。値は`OSMemoryAvailable`と非常に似ているはずです。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含みます。ClickHouseサーバーだけではありません。
### OSMemoryFreeWithoutCached {#osmemoryfreewithoutcached}

ホストシステム上の使用可能なメモリの量（バイト単位）。これは、OSページキャッシュメモリによって使用されるメモリを含まない。ページキャッシュメモリはプログラムによって使用可能であるため、このメトリックの値は混乱を招く可能性があります。代わりに `OSMemoryAvailable` メトリックを参照してください。便利のために、`OSMemoryFreePlusCached` メトリックも提供しており、これはある程度 `OSMemoryAvailable` に類似しています。詳細は https://www.linuxatemyram.com/ を参照してください。これはシステム全体のメトリックであり、ホストマシン上のすべてのプロセスを含み、clickhouse-server のみを含むわけではありません。
### OSMemoryTotal {#osmemorytotal}

ホストシステム上のメモリの総量（バイト単位）。
### OSNiceTime {#osnicetime}

CPUコアが高優先度のユーザースペースコードを実行していた時間の割合。这 はシステム全体のメトリックであり、ホストマシン上のすべてのプロセスを含み、clickhouse-server のみを含むわけではありません。単一のCPUコアの値は [0..1] の範囲になります。すべてのCPUコアの値は、合計として計算されます [0..num cores]。
### OSNiceTimeCPU_*N* {#osnicetimecpu_n}

CPUコアが高優先度のユーザースペースコードを実行していた時間の割合。这 はシステム全体のメトリックであり、ホストマシン上のすべてのプロセスを含み、clickhouse-server のみを含むわけではありません。単一のCPUコアの値は [0..1] の範囲になります。すべてのCPUコアの値は、合計として計算されます [0..num cores]。
### OSNiceTimeNormalized {#osnicetimenormalized}

この値は `OSNiceTime` と似ていますが、CPUコアの数で割ったもので、コアの数に関係なく [0..1] の範囲で測定されます。これにより、コアの数が均一でない場合でも、クラスター内の複数のサーバー間でこのメトリックの値を平均化し、平均的なリソース利用メトリックを取得できます。
### OSOpenFiles {#osopenfiles}

ホストマシン上で開かれているファイルの総数。これはシステム全体のメトリックであり、ホストマシン上のすべてのプロセスを含み、clickhouse-server のみを含むわけではありません。
### OSProcessesBlocked {#osprocessesblocked}

I/O の完了を待ってブロックされているスレッドの数（`man procfs`）。これはシステム全体のメトリックであり、ホストマシン上のすべてのプロセスを含み、clickhouse-server のみを含むわけではありません。
### OSProcessesCreated {#osprocessescreated}

作成されたプロセスの数。これはシステム全体のメトリックであり、ホストマシン上のすべてのプロセスを含み、clickhouse-server のみを含むわけではありません。
### OSProcessesRunning {#osprocessesrunning}

オペレーティングシステムによって実行可能（実行中または実行準備中）のスレッドの数。これはシステム全体のメトリックであり、ホストマシン上のすべてのプロセスを含み、clickhouse-server のみを含むわけではありません。
### OSSoftIrqTime {#ossoftirqtime}

CPU上でソフトウェア割り込み要求を実行するために費やされた時間の割合。これはシステム全体のメトリックであり、ホストマシン上のすべてのプロセスを含み、clickhouse-server のみを含むわけではありません。このメトリックの値が高い場合、システム上で非効率的なソフトウェアが実行されている可能性があります。単一のCPUコアの値は [0..1] の範囲になります。すべてのCPUコアの値は、合計として計算されます [0..num cores]。
### OSSoftIrqTimeCPU_*N* {#ossoftirqtimecpu_n}

CPU上でソフトウェア割り込み要求を実行するために費やされた時間の割合。これはシステム全体のメトリックであり、ホストマシン上のすべてのプロセスを含み、clickhouse-server のみを含むわけではありません。このメトリックの値が高い場合、システム上で非効率的なソフトウェアが実行されている可能性があります。単一のCPUコアの値は [0..1] の範囲になります。すべてのCPUコアの値は、合計として計算されます [0..num cores]。
### OSSoftIrqTimeNormalized {#ossoftirqtimenormalized}

この値は `OSSoftIrqTime` と似ていますが、CPUコアの数で割ったもので、コアの数に関係なく [0..1] の範囲で測定されます。これにより、コアの数が均一でない場合でも、クラスター内の複数のサーバー間でこのメトリックの値を平均化し、平均的なリソース利用メトリックを取得できます。
### OSStealTime {#osstealtime}

仮想化環境でのCPUが他のオペレーティングシステムで費やした時間の割合。これはシステム全体のメトリックであり、ホストマシン上のすべてのプロセスを含み、clickhouse-server のみを含むわけではありません。すべての仮想化環境がこのメトリックを提供しているわけではありません。単一のCPUコアの値は [0..1] の範囲になります。すべてのCPUコアの値は、合計として計算されます [0..num cores]。
### OSStealTimeCPU_*N* {#osstealtimecpu_n}

仮想化環境でのCPUが他のオペレーティングシステムで費やした時間の割合。これはシステム全体のメトリックであり、ホストマシン上のすべてのプロセスを含み、clickhouse-server のみを含むわけではありません。すべての仮想化環境がこのメトリックを提供しているわけではありません。単一のCPUコアの値は [0..1] の範囲になります。すべてのCPUコアの値は、合計として計算されます [0..num cores]。
### OSStealTimeNormalized {#osstealtimenormalized}

この値は `OSStealTime` と似ていますが、CPUコアの数で割ったもので、コアの数に関係なく [0..1] の範囲で測定されます。これにより、コアの数が均一でない場合でも、クラスター内の複数のサーバー間でこのメトリックの値を平均化し、平均的なリソース利用メトリックを取得できます。
### OSSystemTime {#ossystemtime}

CPUコアがOSカーネル（システム）コードを実行していた時間の割合。これはシステム全体のメトリックであり、ホストマシン上のすべてのプロセスを含み、clickhouse-server のみを含むわけではありません。単一のCPUコアの値は [0..1] の範囲になります。すべてのCPUコアの値は、合計として計算されます [0..num cores]。
### OSSystemTimeCPU_*N* {#ossystemtimecpu_n}

CPUコアがOSカーネル（システム）コードを実行していた時間の割合。これはシステム全体のメトリックであり、ホストマシン上のすべてのプロセスを含み、clickhouse-server のみを含むわけではありません。単一のCPUコアの値は [0..1] の範囲になります。すべてのCPUコアの値は、合計として計算されます [0..num cores]。
### OSSystemTimeNormalized {#ossystemtimenormalized}

この値は `OSSystemTime` と似ていますが、CPUコアの数で割ったもので、コアの数に関係なく [0..1] の範囲で測定されます。これにより、コアの数が均一でない場合でも、クラスター内の複数のサーバー間でこのメトリックの値を平均化し、平均的なリソース利用メトリックを取得できます。
### OSThreadsRunnable {#osthreadsrunnable}

OSカーネルスケジューラが見ている「実行可能」スレッドの総数。
### OSThreadsTotal {#osthreadstotal}

OSカーネルスケジューラが見ているスレッドの総数。
### OSUptime {#osuptime}

ホストサーバー（ClickHouse が実行されているマシン）の稼働時間（秒単位）。
### OSUserTime {#osusertime}

CPUコアがユーザースペースコードを実行していた時間の割合。これはシステム全体のメトリックであり、ホストマシン上のすべてのプロセスを含み、clickhouse-server のみを含むわけではありません。これには、CPUが内部の理由（メモリのロード、パイプラインの停滞、分岐予測の誤り、他の SMT コアの実行）によって過少利用されていた時間も含まれます。単一のCPUコアの値は [0..1] の範囲になります。すべてのCPUコアの値は、合計として計算されます [0..num cores]。
### OSUserTimeCPU_*N* {#osusertimecpu_n}

CPUコアがユーザースペースコードを実行していた時間の割合。これはシステム全体のメトリックであり、ホストマシン上のすべてのプロセスを含み、clickhouse-server のみを含むわけではありません。これには、CPUが内部の理由（メモリのロード、パイプラインの停滞、分岐予測の誤り、他の SMT コアの実行）によって過少利用されていた時間も含まれます。単一のCPUコアの値は [0..1] の範囲になります。すべてのCPUコアの値は、合計として計算されます [0..num cores]。
### OSUserTimeNormalized {#osusertimenormalized}

この値は `OSUserTime` と似ていますが、CPUコアの数で割ったもので、コアの数に関係なく [0..1] の範囲で測定されます。これにより、コアの数が均一でない場合でも、クラスター内の複数のサーバー間でこのメトリックの値を平均化し、平均的なリソース利用メトリックを取得できます。
### PostgreSQLThreads {#postgresqlthreads}

PostgreSQL 互換プロトコルのサーバーにおけるスレッドの数。
### QueryCacheBytes {#querycachebytes}

クエリキャッシュの総サイズ（バイト単位）。
### QueryCacheEntries {#querycacheentries}

クエリキャッシュ内のエントリの総数。
### ReplicasMaxAbsoluteDelay {#replicasmaxabsolutedelay}

最も新しい複製されたパーツと、まだ複製されていない最も新しいデータパーツの間の最大の差（秒単位）。非常に高い値は、データを持たないレプリカを示します。
### ReplicasMaxInsertsInQueue {#replicasmaxinsertsinqueue}

複製されたテーブル全体で、キュー内の最大 INSERT 操作数（まだ複製されていない）。
### ReplicasMaxMergesInQueue {#replicasmaxmergesinqueue}

複製されたテーブル全体で、キュー内の最大マージ操作数（まだ適用されていない）。
### ReplicasMaxQueueSize {#replicasmaxqueuesize}

複製されたテーブル全体での最大キューサイズ（取得、マージなどの操作数）。
### ReplicasMaxRelativeDelay {#replicasmaxrelativedelay}

複製されたテーブル全体での、レプリカの遅延と同じテーブルの最も最新のレプリカの遅延との最大差。
### ReplicasSumInsertsInQueue {#replicassuminsertsinqueue}

複製されたテーブル全体での、キュー内のINSERT操作の合計数（まだ複製されていない）。
### ReplicasSumMergesInQueue {#replicassummergesinqueue}

複製されたテーブル全体での、キュー内のマージ操作の合計数（まだ適用されていない）。
### ReplicasSumQueueSize {#replicassumqueuesize}

複製されたテーブル全体での合計キューサイズ（取得、マージなどの操作数）。
### TCPThreads {#tcpthreads}

TCPプロトコルのサーバーにおけるスレッドの数（TLSなし）。
### Temperature_*N* {#temperature_n}

該当デバイスの温度（℃）。センサーは非現実的な値を返すことがあります。ソース: `/sys/class/thermal`
### Temperature_*name* {#temperature_name}

対応するハードウェアモニターおよび対応するセンサーから報告される温度（℃）。センサーは非現実的な値を返すことがあります。ソース: `/sys/class/hwmon`
### TotalBytesOfMergeTreeTables {#totalbytesofmergetreetables}

MergeTreeファミリのすべてのテーブルに保存されているバイトの総量（圧縮されており、データとインデックスを含む）。
### TotalPartsOfMergeTreeTables {#totalpartsofmergetreetables}

MergeTreeファミリのすべてのテーブルにあるデータパーツの総数。10,000を超える数は、サーバーの起動時間に悪影響を及ぼし、パーティションキーの不合理な選択を示す可能性があります。
### TotalPrimaryKeyBytesInMemory {#totalprimarykeybytesinmemory}

主キー値によって使用されるメモリの総量（バイト単位）（アクティブなパーツのみを考慮）。
### TotalPrimaryKeyBytesInMemoryAllocated {#totalprimarykeybytesinmemoryallocated}

主キー値のために確保されたメモリの総量（バイト単位）（アクティブなパーツのみを考慮）。
### TotalRowsOfMergeTreeTables {#totalrowsofmergetreetables}

MergeTreeファミリのすべてのテーブルに保存されている行（レコード）の総数。
### UncompressedCacheBytes {#uncompressedcachebytes}

非圧縮キャッシュの総サイズ（バイト単位）。非圧縮キャッシュは通常パフォーマンスを向上させず、主に回避するべきです。
### UncompressedCacheCells {#uncompressedcachecells}

非圧縮キャッシュ内のエントリの総数。各エントリは、解凍されたデータブロックを表します。非圧縮キャッシュは通常パフォーマンスを向上させず、主に回避するべきです。
### Uptime {#uptime}

サーバーの稼働時間（秒単位）。接続を受け入れる前のサーバー初期化に費やされた時間を含みます。
### jemalloc.active {#jemallocactive}

低レベルのメモリアロケータ (jemalloc) の内部メトリック。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。
### jemalloc.allocated {#jemallocallocated}

低レベルのメモリアロケータ (jemalloc) の内部メトリック。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。
### jemalloc.arenas.all.dirty_purged {#jemallocarenasalldirty_purged}

低レベルのメモリアロケータ (jemalloc) の内部メトリック。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。
### jemalloc.arenas.all.muzzy_purged {#jemallocarenasallmuzzy_purged}

低レベルのメモリアロケータ (jemalloc) の内部メトリック。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。
### jemalloc.arenas.all.pactive {#jemallocarenasallpactive}

低レベルのメモリアロケータ (jemalloc) の内部メトリック。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。
### jemalloc.arenas.all.pdirty {#jemallocarenasallpdirty}

低レベルのメモリアロケータ (jemalloc) の内部メトリック。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。
### jemalloc.arenas.all.pmuzzy {#jemallocarenasallpmuzzy}

低レベルのメモリアロケータ (jemalloc) の内部メトリック。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。
### jemalloc.background_thread.num_runs {#jemallocbackground_threadnum_runs}

低レベルのメモリアロケータ (jemalloc) の内部メトリック。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。
### jemalloc.background_thread.num_threads {#jemallocbackground_threadnum_threads}

低レベルのメモリアロケータ (jemalloc) の内部メトリック。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。
### jemalloc.background_thread.run_intervals {#jemallocbackground_threadrun_intervals}

低レベルのメモリアロケータ (jemalloc) の内部メトリック。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。
### jemalloc.epoch {#jemallocepoch}

jemalloc（Jason Evans のメモリアロケータ）の統計の内部インクリメンタル更新番号、他のすべての `jemalloc` メトリックで使用されます。
### jemalloc.mapped {#jemallocmapped}

低レベルのメモリアロケータ (jemalloc) の内部メトリック。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。
### jemalloc.metadata {#jemallocmetadata}

低レベルのメモリアロケータ (jemalloc) の内部メトリック。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。
### jemalloc.metadata_thp {#jemallocmetadata_thp}

低レベルのメモリアロケータ (jemalloc) の内部メトリック。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。
### jemalloc.resident {#jemallocresident}

低レベルのメモリアロケータ (jemalloc) の内部メトリック。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。
### jemalloc.retained {#jemallocretained}

低レベルのメモリアロケータ (jemalloc) の内部メトリック。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。
### jemalloc.prof.active {#jemallocprofactive}

低レベルのメモリアロケータ (jemalloc) の内部メトリック。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

**参照資料**

- [Monitoring](../../operations/monitoring.md) — ClickHouse モニタリングの基本概念。
- [system.metrics](/operations/system-tables/metrics) — 即時計算されたメトリックを含む。
- [system.events](/operations/system-tables/events) — 発生したイベントの数を含む。
- [system.metric_log](../../operations/system-tables/metric_log.md#system_tables-metric_log) — `system.metrics` と `system.events` テーブルからのメトリック値の履歴を含む。
