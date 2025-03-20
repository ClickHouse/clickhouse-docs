---
description: "システムテーブルは、バックグラウンドで定期的に計算されるメトリックを含みます。たとえば、使用中のRAMの量などです。"
slug: /operations/system-tables/asynchronous_metrics
title: "system.asynchronous_metrics"
keywords: ["システムテーブル", "非同期メトリクス"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

バックグラウンドで定期的に計算されるメトリックを含みます。たとえば、使用中のRAMの量などです。

カラム:

- `metric` ([String](../../sql-reference/data-types/string.md)) — メトリック名。
- `value` ([Float64](../../sql-reference/data-types/float.md)) — メトリック値。
- `description` ([String](../../sql-reference/data-types/string.md)) — メトリックの説明。

**例**

``` sql
SELECT * FROM system.asynchronous_metrics LIMIT 10
```

``` text
┌─metric──────────────────────────────────┬──────value─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ AsynchronousMetricsCalculationTimeSpent │ 0.00179053 │ 非同期メトリクスの計算にかかった時間（これは非同期メトリクスのオーバーヘッドです）。                                                                                                                                              │
│ NumberOfDetachedByUserParts             │          0 │ ユーザーによって `ALTER TABLE DETACH` クエリで切り離された部分の総数（予期しない、壊れた、または無視された部分とは対照的）。サーバーは切り離された部分を気にせず、削除できます。                          │
│ NumberOfDetachedParts                   │          0 │ MergeTreeテーブルから切り離された部分の総数。部分はユーザーが `ALTER TABLE DETACH` クエリを使用して切り離すことができるか、サーバー自体が壊れた、予期しない、または不要な部分を切り離します。サーバーは切り離された部分を気にせず、削除できます。 │
│ TotalRowsOfMergeTreeTables              │    2781309 │ MergeTreeファミリーのすべてのテーブルに格納されている行（レコード）の総数。                                                                                                                                                                                   │
│ TotalBytesOfMergeTreeTables             │    7741926 │ MergeTreeファミリーのすべてのテーブルに格納されているバイト（データとインデックスを含む、圧縮された）の総数。                                                                                                                                                   │
│ NumberOfTables                          │         93 │ サーバー上のデータベース全体で合計されたテーブルの総数。MergeTreeテーブルを含むことができないデータベースは除外されます。除外されるデータベースエンジンは、`Lazy`、`MySQL`、`PostgreSQL`、`SQlite`のように、即座にテーブルのセットを生成するものです。 │
│ NumberOfDatabases                       │          6 │ サーバー上のデータベースの総数。                                                                                                                                                                                                                   │
│ MaxPartCountForPartition                │          6 │ MergeTreeファミリーのすべてのテーブルのすべてのパーティションにおける、パーティションごとの最大パーツ数。300を超える値は、設定ミス、オーバーロード、または大量のデータの読み込みを示します。                                                                       │
│ ReplicasSumMergesInQueue                │          0 │ レプリケーションテーブルのキュー内のマージ操作の合計（まだ適用されていない）。                                                                                                                                                                       │
│ ReplicasSumInsertsInQueue               │          0 │ レプリケーションテーブルのキュー内のINSERT操作の合計（まだ複製されていない）。                                                                                                                                                                   │
└─────────────────────────────────────────┴────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

<!--- system.events と system.metrics とは異なり、非同期メトリクスはソースコードファイルの単純なリストに集められていません - src/Interpreters/ServerAsynchronousMetrics.cpp 内のロジックと混在しています。読者の便宜のためにここに明示的にリストしています。 --->
## メトリックの説明 {#metric-descriptions}
### AsynchronousHeavyMetricsCalculationTimeSpent {#asynchronousheavymetricscalculationtimespent}

非同期の重い（テーブル関連の）メトリクスの計算にかかった時間（これは非同期メトリクスのオーバーヘッドです）。
### AsynchronousHeavyMetricsUpdateInterval {#asynchronousheavymetricsupdateinterval}

重い（テーブル関連の）メトリクスの更新間隔。
### AsynchronousMetricsCalculationTimeSpent {#asynchronousmetricscalculationtimespent}

非同期メトリクスの計算にかかった時間（これは非同期メトリクスのオーバーヘッドです）。
### AsynchronousMetricsUpdateInterval {#asynchronousmetricsupdateinterval}

メトリクスの更新間隔。
### BlockActiveTime_*name* {#blockactivetime_name}

ブロックデバイスにIOリクエストがキューされていた時間（秒単位）。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。ソース: `/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockDiscardBytes_*name* {#blockdiscardbytes_name}

ブロックデバイスで破棄されたバイト数。これらの操作はSSDに関連します。破棄操作はClickHouseでは使用されませんが、システム上の他のプロセスによって使用される可能性があります。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。ソース: `/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockDiscardMerges_*name* {#blockdiscardmerges_name}

ブロックデバイスから要求され、OS IOスケジューラによって一緒に結合された破棄操作の数。これらの操作はSSDに関連します。破棄操作はClickHouseでは使用されませんが、システム上の他のプロセスによって使用される可能性があります。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。ソース: `/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockDiscardOps_*name* {#blockdiscardops_name}

ブロックデバイスから要求された破棄操作の数。これらの操作はSSDに関連します。破棄操作はClickHouseでは使用されませんが、システム上の他のプロセスによって使用される可能性があります。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。ソース: `/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockDiscardTime_*name* {#blockdiscardtime_name}

ブロックデバイスから要求された破棄操作に費やされた時間（秒単位）、すべての操作を合計。これらの操作はSSDに関連します。破棄操作はClickHouseでは使用されませんが、システム上の他のプロセスによって使用される可能性があります。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。ソース: `/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockInFlightOps_*name* {#blockinflightops_name}

この値は、デバイスドライバーに発行されたがまだ完了していないI/Oリクエストの数をカウントします。これは、対向側のデバイスドライバーがIOリクエストを発行する前のキュー内にあるIOリクエストは含まれません。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。ソース: `/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockQueueTime_*name* {#blockqueuetime_name}

この値は、IOリクエストがこのブロックデバイスで待機しているミリ秒の数をカウントします。複数のIOリクエストが待機している場合、この値は待機しているリクエストの数にミリ秒数を掛けた積として増加します。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。ソース: `/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockReadBytes_*name* {#blockreadbytes_name}

ブロックデバイスから読み取られたバイト数。ファイルシステムから読み取られたバイト数より少なくなる可能性があります。これはOSのページキャッシュの使用によるもので、IOを節約します。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。ソース: `/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockReadMerges_*name* {#blockreadmerges_name}

ブロックデバイスから要求された読み取り操作と、OS IOスケジューラによって一緒に処理されたものの数。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。ソース: `/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockReadOps_*name* {#blockreadops_name}

ブロックデバイスから要求された読み取り操作の数。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。ソース: `/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockReadTime_*name* {#blockreadtime_name}

ブロックデバイスから要求される読み取り操作に費やされた時間（秒単位）、すべての操作を合計したものです。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。ソース: `/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockWriteBytes_*name* {#blockwritebytes_name}

ブロックデバイスに書き込まれたバイト数。ファイルシステムに書き込まれたバイト数よりも少なくなる可能性があります。これはOSページキャッシュの使用によるもので、IOを節約します。ブロックデバイスへの書き込みは、ファイルシステムへの対応する書き込みの後に行われる可能性があります（書き込みスルーキャッシングによる）。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。ソース: `/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockWriteMerges_*name* {#blockwritemerges_name}

ブロックデバイスから要求され、OS IOスケジューラによって一緒に処理された書き込み操作の数。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。ソース: `/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockWriteOps_*name* {#blockwriteops_name}

ブロックデバイスから要求された書き込み操作の数。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。ソース: `/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### BlockWriteTime_*name* {#blockwritetime_name}

ブロックデバイスから要求される書き込み操作に費やされた時間（秒単位）、すべての操作を合計したものです。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。ソース: `/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。
### CPUFrequencyMHz_*name* {#cpufrequencymhz_name}

現在のCPUの周波数（MHz）。ほとんどの最新CPUは、電力を節約し、ターボブーストを行うために周波数を動的に調整します。
### CompiledExpressionCacheBytes {#compiledexpressioncachebytes}

JITコンパイルされたコードのキャッシュに使用される合計バイト数。
### CompiledExpressionCacheCount {#compiledexpressioncachecount}

JITコンパイルされたコードのキャッシュにおける合計エントリー数。
### DiskAvailable_*name* {#diskavailable_name}

ディスク（仮想ファイルシステム）上の利用可能なバイト数。リモートファイルシステムは、16 EiBのような大きな値を示すことがあります。
### DiskTotal_*name* {#disktotal_name}

ディスク（仮想ファイルシステム）の合計サイズ（バイト単位）。リモートファイルシステムは、16 EiBのような大きな値を示すことがあります。
### DiskUnreserved_*name* {#diskunreserved_name}

マージ、フェッチ、移動のために予約されていないディスク（仮想ファイルシステム）上の利用可能なバイト数。リモートファイルシステムは、16 EiBのような大きな値を示すことがあります。
### DiskUsed_*name* {#diskused_name}

ディスク（仮想ファイルシステム）上で使用されているバイト数。リモートファイルシステムはこの情報を提供しないことがあります。
### FilesystemCacheBytes {#filesystemcachebytes}

`cache`仮想ファイルシステム内の合計バイト数。このキャッシュはディスク上に保持されます。
### FilesystemCacheFiles {#filesystemcachefiles}

`cache`仮想ファイルシステム内のキャッシュされたファイルセグメントの合計数。このキャッシュはディスク上に保持されます。
### FilesystemLogsPathAvailableBytes {#filesystemlogspathavailablebytes}

ClickHouseログパスがマウントされているボリューム上の利用可能なバイト数。この値がゼロに近づくと、設定ファイルでログのローテーションを調整する必要があります。
### FilesystemLogsPathAvailableINodes {#filesystemlogspathavailableinodes}

ClickHouseログパスがマウントされているボリューム上の利用可能なinodeの数。
### FilesystemLogsPathTotalBytes {#filesystemlogspathtotalbytes}

ClickHouseログパスがマウントされているボリュームのサイズ（バイト単位）。ログには少なくとも10GBを持つことを推奨します。
### FilesystemLogsPathTotalINodes {#filesystemlogspathtotalinodes}

ClickHouseログパスがマウントされているボリューム上のinodeの合計数。
### FilesystemLogsPathUsedBytes {#filesystemlogspathusedbytes}

ClickHouseログパスがマウントされているボリューム上で使用されているバイト数。
### FilesystemLogsPathUsedINodes {#filesystemlogspathusedinodes}

ClickHouseログパスがマウントされているボリューム上で使用されているinodeの数。
### FilesystemMainPathAvailableBytes {#filesystemmainpathavailablebytes}

ClickHouseのメインパスがマウントされているボリューム上の利用可能なバイト数。
### FilesystemMainPathAvailableINodes {#filesystemmainpathavailableinodes}

ClickHouseのメインパスがマウントされているボリューム上の利用可能なinodeの数。この値がゼロに近づくと、設定ミスを示し、ディスクが満杯でなくても「デバイスに空き領域がありません」というエラーが発生します。
### FilesystemMainPathTotalBytes {#filesystemmainpathtotalbytes}

ClickHouseのメインパスがマウントされているボリュームのサイズ（バイト単位）。
### FilesystemMainPathTotalINodes {#filesystemmainpathtotalinodes}

ClickHouseのメインパスがマウントされているボリューム上のinodeの合計数。この値が2500万未満の場合、設定ミスを示します。
### FilesystemMainPathUsedBytes {#filesystemmainpathusedbytes}

ClickHouseのメインパスがマウントされているボリューム上で使用されているバイト数。
### FilesystemMainPathUsedINodes {#filesystemmainpathusedinodes}

ClickHouseのメインパスがマウントされているボリューム上で使用されているinodeの数。この値は主にファイル数に対応します。
### HTTPThreads {#httpthreads}

HTTPインターフェースサーバー内のスレッド数（TLSなし）。
### InterserverThreads {#interserverthreads}

レプリカ通信プロトコルサーバー内のスレッド数（TLSなし）。
### Jitter {#jitter}

非同期メトリクスの計算のためのスレッドが起床する予定の時間と実際に起床した時間の差異。全体的なシステムの待機時間と応答性の代理指標です。
### LoadAverage*N* {#loadaveragen}

全システムの負荷で、1分間で指数平滑化された平均値。負荷は、CPUで現在実行中またはIO待ち、または実行準備が整っているスレッドの数を表します。これにはすべてのプロセスが含まれ、clickhouse-serverだけではありません。この数はCPUコア数を超える場合もあります。これは、システムが過負荷となっている場合や、多くのプロセスが実行準備が整っているがCPUやIOを待っている場合に起こります。
### MMapCacheCells {#mmapcachecells}

`mmap`（メモリにマッピングされた）で開かれたファイルの数。これは、`local_filesystem_read_method`の設定が`mmap`に設定されているクエリで使用されます。`mmap`で開かれたファイルは、コストのかかるTLBフラッシュを避けるためにキャッシュに保持されます。
### MarkCacheBytes {#markcachebytes}

マークキャッシュの合計サイズ（バイト単位）
### MarkCacheFiles {#markcachefiles}

マークキャッシュにキャッシュされたマークファイルの合計数
### MaxPartCountForPartition {#maxpartcountforpartition}

MergeTreeファミリーのすべてのテーブルのすべてのパーティションにおける、パーティションごとの最大パーツ数。300を超える値は、設定ミス、オーバーロード、または大量のデータの読み込みを示します。
### MemoryCode {#memorycode}

サーバープロセスの機械コードのページにマッピングされた仮想メモリの量（バイト単位）。
### MemoryDataAndStack {#memorydataandstack}

スタックおよび割り当てられたメモリの使用にマッピングされた仮想メモリの量（バイト単位）。これは、スレッドごとのスタックや、`mmap`システムコールによって割り当てられたほとんどのメモリを含むかどうかは指定されていません。このメトリックは完全性の理由のためにのみ存在します。監視には`MemoryResident`メトリックの使用をお勧めします。
### MemoryResidentMax {#memoryresidentmax}

サーバープロセスによって使用される最大の物理メモリ量（バイト単位）。
### MemoryResident {#memoryresident}

サーバープロセスによって使用される物理メモリの量（バイト単位）。
### MemoryShared {#memoryshared}

サーバープロセスによって使用される、他のプロセスと共有されるメモリの量（バイト単位）。ClickHouseは共有メモリを使用しませんが、一部のメモリはOSによって共有としてラベル付けされる可能性があります。このメトリックは監視する価値があまりなく、完全性の理由でのみ存在します。
### MemoryVirtual {#memoryvirtual}

サーバープロセスによって割り当てられた仮想アドレス空間のサイズ（バイト単位）。仮想アドレス空間のサイズは通常、物理メモリ消費量よりもはるかに大きく、メモリ消費量の推定には使用されるべきではありません。このメトリックの大きな値は全く正常であり、技術的にのみ意味があります。
### MySQLThreads {#mysqlthreads}

MySQL互換プロトコルサーバー内のスレッド数。
### NetworkReceiveBytes_*name* {#networkreceivebytes_name}

ネットワークインターフェース経由で受信したバイト数。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。
### NetworkReceiveDrop_*name* {#networkreceivedrop_name}

ネットワークインターフェースを介して受信中にパケットがドロップされた回数。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。
### NetworkReceiveErrors_*name* {#networkreceiveerrors_name}

ネットワークインターフェース経由で受信中にエラーが発生した回数。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。
### NetworkReceivePackets_*name* {#networkreceivepackets_name}

ネットワークインターフェース経由で受信したネットワークパケットの数。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。
### NetworkSendBytes_*name* {#networksendbytes_name}

ネットワークインターフェース経由で送信したバイト数。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。
### NetworkSendDrop_*name* {#networksenddrop_name}

ネットワークインターフェースを介して送信中にパケットがドロップされた回数。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。
### NetworkSendErrors_*name* {#networksenderrors_name}

ネットワークインターフェースを介して送信中にエラー（例えば、TCPの再送信）が発生した回数。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。
### NetworkSendPackets_*name* {#networksendpackets_name}

ネットワークインターフェース経由で送信したネットワークパケットの数。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。
### NumberOfDatabases {#numberofdatabases}

サーバー上のデータベースの総数。
### NumberOfDetachedByUserParts {#numberofdetachedbyuserparts}

ユーザーによって `ALTER TABLE DETACH` クエリで切り離されたMergeTreeテーブルの部分の総数（予期しない、壊れた、または無視された部分とは対照的）。サーバーは切り離された部分を気にせず、削除できます。
### NumberOfDetachedParts {#numberofdetachedparts}

MergeTreeテーブルから切り離された部分の総数。部分は、ユーザーによって `ALTER TABLE DETACH` クエリで切り離されたり、サーバー自身によって壊れた、予期しない、または不要な部分が切り離されたりします。サーバーは切り離された部分を気にせず、削除できます。
### NumberOfTables {#numberoftables}

サーバー上のすべてのデータベースにわたる合計テーブル数。MergeTreeテーブルを含めないデータベースを除外します。除外されるデータベースエンジンは、`Lazy`、`MySQL`、`PostgreSQL`、`SQlite`のように、即座にテーブルのセットを生成するものです。
### OSContextSwitches {#oscontextswitches}

ホストマシンでシステムが経験したコンテキストスイッチの数。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。
### OSGuestNiceTime {#osguestnicetime}

Linuxカーネルの制御下でのゲストオペレーティングシステムのための仮想CPUを稼働させている間の時間の比率。ゲストの優先度が高く設定された場合（`man procfs`を参照）。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。このメトリックはClickHouseには関係ありませんが、完全性のために存在します。単一のCPUコアの値は[0..1]の範囲にあり、すべてのCPUコアの値はこれらの合計として計算されます[0..コア数]。
### OSGuestNiceTimeCPU_*N* {#osguestnicetimecpu_n}

Linuxカーネルの制御下でのゲストオペレーティングシステムのための仮想CPUを稼働させている間の時間の比率。ゲストの優先度が高く設定された場合（`man procfs`を参照）。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。このメトリックはClickHouseには関係ありませんが、完全性のために存在します。単一のCPUコアの値は[0..1]の範囲にあり、すべてのCPUコアの値はこれらの合計として計算されます[0..コア数]。
### OSGuestNiceTimeNormalized {#osguestnicetimenormalized}

この値は`OSGuestNiceTime`に似ていますが、CPUコアの数で割って[0..1]の範囲に測定されます。これにより、クラスタ内の複数のサーバー間でこのメトリックの値を平均化でき、コアの数が不均一であっても、平均リソース利用メトリックを得ることができます。
### OSGuestTime {#osguesttime}

Linuxカーネルの制御下でのゲストオペレーティングシステムのための仮想CPUを稼働させている間の時間の比率（`man procfs`を参照）。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。このメトリックはClickHouseには関係ありませんが、完全性のために存在します。単一のCPUコアの値は[0..1]の範囲にあり、すべてのCPUコアの値はこれらの合計として計算されます[0..コア数]。
### OSGuestTimeCPU_*N* {#osguesttimecpu_n}

Linuxカーネルの制御下でのゲストオペレーティングシステムのための仮想CPUを稼働させている間の時間の比率（`man procfs`を参照）。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。このメトリックはClickHouseには関係ありませんが、完全性のために存在します。単一のCPUコアの値は[0..1]の範囲にあり、すべてのCPUコアの値はこれらの合計として計算されます[0..コア数]。
### OSGuestTimeNormalized {#osguesttimenormalized}

この値は`OSGuestTime`に似ていますが、CPUコアの数で割って[0..1]の範囲に測定されます。これにより、クラスタ内の複数のサーバー間でこのメトリックの値を平均化でき、コアの数が不均一であっても、平均リソース利用メトリックを得ることができます。
### OSIOWaitTime {#osiowaittime}

CPUコアがコードを実行していない時間の比率ですが、OSカーネルがこのCPUで他のプロセスを実行しなかった時、すなわちプロセスがIOを待機している時。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。単一のCPUコアの値は[0..1]の範囲にあり、すべてのCPUコアの値はこれらの合計として計算されます[0..コア数]。
### OSIOWaitTimeCPU_*N* {#osiowaittimecpu_n}

CPUコアがコードを実行していない時間の比率ですが、OSカーネルがこのCPUで他のプロセスを実行しなかった時、すなわちプロセスがIOを待機している時。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。単一のCPUコアの値は[0..1]の範囲にあり、すべてのCPUコアの値はこれらの合計として計算されます[0..コア数]。
### OSIOWaitTimeNormalized {#osiowaittimenormalized}

この値は`OSIOWaitTime`に似ていますが、CPUコアの数で割って[0..1]の範囲に測定されます。これにより、クラスタ内の複数のサーバー間でこのメトリックの値を平均化でき、コアの数が不均一であっても、平均リソース利用メトリックを得ることができます。
### OSIdleTime {#osidletime}

CPUコアがアイドル状態（IO待ちのプロセスを実行する準備すらできていない）であった時間の比率。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。これはメモリ負荷、パイプラインの遅延、分岐予測の誤り、他のSMTコアの実行など、CPU内部の理由によりCPUが過少利用されていた時間は含みません。単一のCPUコアの値は[0..1]の範囲にあり、すべてのCPUコアの値はこれらの合計として計算されます[0..コア数]。
### OSIdleTimeCPU_*N* {#osidletimecpu_n}

CPUコアがアイドル状態（IO待ちのプロセスを実行する準備すらできていない）であった時間の比率。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。これはメモリ負荷、パイプラインの遅延、分岐予測の誤り、他のSMTコアの実行など、CPU内部の理由によりCPUが過少利用されていた時間は含みません。単一のCPUコアの値は[0..1]の範囲にあり、すべてのCPUコアの値はこれらの合計として計算されます[0..コア数]。
### OSIdleTimeNormalized {#osidletimenormalized}

この値は`OSIdleTime`に似ていますが、CPUコアの数で割って[0..1]の範囲に測定されます。これにより、クラスタ内の複数のサーバー間でこのメトリックの値を平均化でき、コアの数が不均一であっても、平均リソース利用メトリックを得ることができます。
### OSInterrupts {#osinterrupts}

ホストマシンでの割り込みの回数。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。
### OSIrqTime {#osirqtime}

CPU上でハードウェア割り込み要求を処理するのに費やされた時間の比率。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。このメトリックの高い値は、ハードウェアの設定ミスや非常に高いネットワーク負荷を示す場合があります。単一のCPUコアの値は[0..1]の範囲にあり、すべてのCPUコアの値はこれらの合計として計算されます[0..コア数]。
### OSIrqTimeCPU_*N* {#osirqtimecpu_n}

CPU上でハードウェア割り込み要求を処理するのに費やされた時間の比率。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。このメトリックの高い値は、ハードウェアの設定ミスや非常に高いネットワーク負荷を示す場合があります。単一のCPUコアの値は[0..1]の範囲にあり、すべてのCPUコアの値はこれらの合計として計算されます[0..コア数]。
### OSIrqTimeNormalized {#osirqtimenormalized}

この値は`OSIrqTime`に似ていますが、CPUコアの数で割って[0..1]の範囲に測定されます。これにより、クラスタ内の複数のサーバー間でこのメトリックの値を平均化でき、コアの数が不均一であっても、平均リソース利用メトリックを得ることができます。
### OSMemoryAvailable {#osmemoryavailable}

プログラムが使用できるメモリの量（バイト単位）。これは`OSMemoryFreePlusCached`メトリックに非常に似ています。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。
### OSMemoryBuffers {#osmemorybuffers}

OSカーネルバッファに使用されるメモリの量（バイト単位）。これは通常小さいものであり、大きな値はOSの設定ミスを示す可能性があります。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。
### OSMemoryCached {#osmemorycached}

OSのページキャッシュに使用されるメモリの量（バイト単位）。通常、ほとんどの利用可能なメモリはOSページキャッシュに使用され、高い値は正常で予想されるものです。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。
### OSMemoryFreePlusCached {#osmemoryfreepluscached}

ホストシステム上の空きメモリとOSページキャッシュメモリの量（バイト単位）。このメモリはプログラムで使用可能です。この値は`OSMemoryAvailable`と非常に似ているはずです。これはシステム全体のメトリックで、ホストマシン上のすべてのプロセスが含まれ、clickhouse-serverだけではありません。
### OSMemoryFreeWithoutCached {#osmemoryfreewithoutcached}

ホストシステム上の空きメモリの量（バイト単位）。これは、OSページキャッシュメモリで使用されるメモリを含んでいません。ページキャッシュメモリはプログラムによっても使用可能なので、このメトリックの値は混乱を招くことがあります。代わりに `OSMemoryAvailable` メトリックを参照してください。便利なことに、 `OSMemoryFreePlusCached` メトリックも提供しており、これはOSMemoryAvailableに対してほぼ類似した値になります。詳細は https://www.linuxatemyram.com/ を参照してください。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSMemoryTotal {#osmemorytotal}

ホストシステム上のメモリの総量（バイト単位）。

### OSNiceTime {#osnicetime}

CPUコアがより高い優先度でユーザースペースコードを実行していた時間の割合。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。単一のCPUコアの値は [0..1] の範囲になります。すべてのCPUコアの値は、各コアの合計として計算されます [0..num cores]。

### OSNiceTimeCPU_*N* {#osnicetimecpu_n}

CPUコアがより高い優先度でユーザースペースコードを実行していた時間の割合。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。単一のCPUコアの値は [0..1] の範囲になります。すべてのCPUコアの値は、各コアの合計として計算されます [0..num cores]。

### OSNiceTimeNormalized {#osnicetimenormalized}

値は `OSNiceTime` と似ていますが、CPUコアの数で割った値で、コアの数に関わらず [0..1] の範囲で測定されます。これにより、クラスタ内の複数のサーバーでこのメトリックの値を平均化でき、コアの数が不均一でも平均的なリソース利用メトリックを得ることができます。

### OSOpenFiles {#osopenfiles}

ホストマシン上で開いているファイルの総数。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSProcessesBlocked {#osprocessesblocked}

I/Oの完了を待機してブロックされているスレッドの数（ `man procfs` 参照）。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSProcessesCreated {#osprocessescreated}

作成されたプロセスの数。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSProcessesRunning {#osprocessesrunning}

オペレーティングシステムによって実行可能な（実行中または実行の準備ができている）スレッドの数。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSSoftIrqTime {#ossoftirqtime}

CPU上でソフトウェア割り込み要求を実行するために費やされた時間の割合。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。このメトリックの高い値は、システム上で非効率なソフトウェアが実行されていることを示している可能性があります。単一のCPUコアの値は [0..1] の範囲になります。すべてのCPUコアの値は、各コアの合計として計算されます [0..num cores]。

### OSSoftIrqTimeCPU_*N* {#ossoftirqtimecpu_n}

CPU上でソフトウェア割り込み要求を実行するために費やされた時間の割合。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。このメトリックの高い値は、システム上で非効率なソフトウェアが実行されていることを示している可能性があります。単一のCPUコアの値は [0..1] の範囲になります。すべてのCPUコアの値は、各コアの合計として計算されます [0..num cores]。

### OSSoftIrqTimeNormalized {#ossoftirqtimenormalized}

値は `OSSoftIrqTime` と似ていますが、CPUコアの数で割った値で、コアの数に関わらず [0..1] の範囲で測定されます。これにより、クラスタ内の複数のサーバーでこのメトリックの値を平均化でき、コアの数が不均一でも平均的なリソース利用メトリックを得ることができます。

### OSStealTime {#osstealtime}

仮想化環境で実行中のCPUが他のオペレーティングシステムで過ごした時間の割合。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。すべての仮想化環境がこのメトリックを提供するわけではなく、そのほとんどは提供していません。単一のCPUコアの値は [0..1] の範囲になります。すべてのCPUコアの値は、各コアの合計として計算されます [0..num cores]。

### OSStealTimeCPU_*N* {#osstealtimecpu_n}

仮想化環境で実行中のCPUが他のオペレーティングシステムで過ごした時間の割合。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。すべての仮想化環境がこのメトリックを提供するわけではなく、そのほとんどは提供していません。単一のCPUコアの値は [0..1] の範囲になります。すべてのCPUコアの値は、各コアの合計として計算されます [0..num cores]。

### OSStealTimeNormalized {#osstealtimenormalized}

値は `OSStealTime` と似ていますが、CPUコアの数で割った値で、コアの数に関わらず [0..1] の範囲で測定されます。これにより、クラスタ内の複数のサーバーでこのメトリックの値を平均化でき、コアの数が不均一でも平均的なリソース利用メトリックを得ることができます。

### OSSystemTime {#ossystemtime}

CPUコアがOSカーネル（システム）コードを実行していた時間の割合。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。単一のCPUコアの値は [0..1] の範囲になります。すべてのCPUコアの値は、各コアの合計として計算されます [0..num cores]。

### OSSystemTimeCPU_*N* {#ossystemtimecpu_n}

CPUコアがOSカーネル（システム）コードを実行していた時間の割合。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。単一のCPUコアの値は [0..1] の範囲になります。すべてのCPUコアの値は、各コアの合計として計算されます [0..num cores]。

### OSSystemTimeNormalized {#ossystemtimenormalized}

値は `OSSystemTime` と似ていますが、CPUコアの数で割った値で、コアの数に関わらず [0..1] の範囲で測定されます。これにより、クラスタ内の複数のサーバーでこのメトリックの値を平均化でき、コアの数が不均一でも平均的なリソース利用メトリックを得ることができます。

### OSThreadsRunnable {#osthreadsrunnable}

OSカーネルスケジューラが見る「実行可能」スレッドの総数。

### OSThreadsTotal {#osthreadstotal}

OSカーネルスケジューラが見るスレッドの総数。

### OSUptime {#osuptime}

ホストサーバー（ClickHouseが実行されているマシン）のアップタイム（秒単位）。

### OSUserTime {#osusertime}

CPUコアがユーザースペースコードを実行していた時間の割合。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。これには、CPUが内部の理由（メモリー負荷、パイプラインの停止、ブランチの誤予測、別のSMTコアの実行）により過少利用されていた時間も含まれます。単一のCPUコアの値は [0..1] の範囲になります。すべてのCPUコアの値は、各コアの合計として計算されます [0..num cores]。

### OSUserTimeCPU_*N* {#osusertimecpu_n}

CPUコアがユーザースペースコードを実行していた時間の割合。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。これには、CPUが内部の理由（メモリー負荷、パイプラインの停止、ブランチの誤予測、別のSMTコアの実行）により過少利用されていた時間も含まれます。単一のCPUコアの値は [0..1] の範囲になります。すべてのCPUコアの値は、各コアの合計として計算されます [0..num cores]。

### OSUserTimeNormalized {#osusertimenormalized}

値は `OSUserTime` と似ていますが、CPUコアの数で割った値で、コアの数に関わらず [0..1] の範囲で測定されます。これにより、クラスタ内の複数のサーバーでこのメトリックの値を平均化でき、コアの数が不均一でも平均的なリソース利用メトリックを得ることができます。

### PostgreSQLThreads {#postgresqlthreads}

PostgreSQL互換プロトコルのサーバー内のスレッド数。

### QueryCacheBytes {#querycachebytes}

クエリキャッシュの合計サイズ（バイト単位）。

### QueryCacheEntries {#querycacheentries}

クエリキャッシュ内のエントリの総数。

### ReplicasMaxAbsoluteDelay {#replicasmaxabsolutedelay}

最も新しい複製されたパーツと、まだ複製されていない最も新しいデータパーツとの間の最大の秒数の差、複製されたテーブル全体で。非常に高い値はデータを持たないレプリカを示します。

### ReplicasMaxInsertsInQueue {#replicasmaxinsertsinqueue}

複製されたテーブル全体で、キュー内（まだ複製されていない）の最大INSERT操作数。

### ReplicasMaxMergesInQueue {#replicasmaxmergesinqueue}

複製されたテーブル全体で、キュー内（まだ適用されていない）の最大マージ操作数。

### ReplicasMaxQueueSize {#replicasmaxqueuesize}

複製されたテーブル全体での最大キューサイズ（getやmergeの操作数）。

### ReplicasMaxRelativeDelay {#replicasmaxrelativedelay}

複製されたテーブル全体での、レプリカの遅延と同じテーブルの最新のレプリカの遅延との間の最大の差。

### ReplicasSumInsertsInQueue {#replicassuminsertsinqueue}

複製されたテーブル全体で、キュー内（まだ複製されていない）のINSERT操作の合計。

### ReplicasSumMergesInQueue {#replicassummergesinqueue}

複製されたテーブル全体で、キュー内（まだ適用されていない）のマージ操作の合計。

### ReplicasSumQueueSize {#replicassumqueuesize}

複製されたテーブル全体での合計キューサイズ（getやmergeの操作数）。

### TCPThreads {#tcpthreads}

TCPプロトコル（TLSなし）のサーバー内のスレッド数。

### Temperature_*N* {#temperature_n}

対応するデバイスの温度（℃）。センサーが非現実的な値を返すことがあります。ソース: `/sys/class/thermal`

### Temperature_*name* {#temperature_name}

対応するハードウェアモニターと対応するセンサーから報告された温度（℃）。センサーが非現実的な値を返すことがあります。ソース: `/sys/class/hwmon`

### TotalBytesOfMergeTreeTables {#totalbytesofmergetreetables}

MergeTreeファミリー内のすべてのテーブルに保存されているバイトの総量（圧縮、データとインデックスを含む）。

### TotalPartsOfMergeTreeTables {#totalpartsofmergetreetables}

MergeTreeファミリー内のすべてのテーブルにおけるデータパーツの総数。10,000を超える数はサーバーの起動時間に悪影響を及ぼし、パーティションキーの不合理な選択を示す可能性があります。

### TotalPrimaryKeyBytesInMemory {#totalprimarykeybytesinmemory}

プライマリキー値に使用されるメモリの合計量（バイト単位）（アクティブなパーツのみを考慮）。

### TotalPrimaryKeyBytesInMemoryAllocated {#totalprimarykeybytesinmemoryallocated}

プライマリキー値のために確保されたメモリの合計量（バイト単位）（アクティブなパーツのみを考慮）。

### TotalRowsOfMergeTreeTables {#totalrowsofmergetreetables}

MergeTreeファミリー内のすべてのテーブルに保存されている行（レコード）の総数。

### UncompressedCacheBytes {#uncompressedcachebytes}

非圧縮キャッシュの総サイズ（バイト単位）。非圧縮キャッシュは通常パフォーマンスを向上させず、主に避けるべきです。

### UncompressedCacheCells {#uncompressedcachecells}

非圧縮キャッシュ内のエントリの総数。各エントリはデータの解凍されたブロックを表します。非圧縮キャッシュは通常パフォーマンスを向上させず、主に避けるべきです。

### Uptime {#uptime}

サーバーのアップタイム（秒単位）。接続を受け入れる前のサーバー初期化にかかった時間を含みます。

### jemalloc.active {#jemallocactive}

低レベルメモリアロケータ（jemalloc）の内部メトリック。See https://jemalloc.net/jemalloc.3.html

### jemalloc.allocated {#jemallocallocated}

低レベルメモリアロケータ（jemalloc）の内部メトリック。See https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.dirty_purged {#jemallocarenasalldirty_purged}

低レベルメモリアロケータ（jemalloc）の内部メトリック。See https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.muzzy_purged {#jemallocarenasallmuzzy_purged}

低レベルメモリアロケータ（jemalloc）の内部メトリック。See https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.pactive {#jemallocarenasallpactive}

低レベルメモリアロケータ（jemalloc）の内部メトリック。See https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.pdirty {#jemallocarenasallpdirty}

低レベルメモリアロケータ（jemalloc）の内部メトリック。See https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.pmuzzy {#jemallocarenasallpmuzzy}

低レベルメモリアロケータ（jemalloc）の内部メトリック。See https://jemalloc.net/jemalloc.3.html

### jemalloc.background_thread.num_runs {#jemallocbackground_threadnum_runs}

低レベルメモリアロケータ（jemalloc）の内部メトリック。See https://jemalloc.net/jemalloc.3.html

### jemalloc.background_thread.num_threads {#jemallocbackground_threadnum_threads}

低レベルメモリアロケータ（jemalloc）の内部メトリック。See https://jemalloc.net/jemalloc.3.html

### jemalloc.background_thread.run_intervals {#jemallocbackground_threadrun_intervals}

低レベルメモリアロケータ（jemalloc）の内部メトリック。See https://jemalloc.net/jemalloc.3.html

### jemalloc.epoch {#jemallocepoch}

jemalloc（Jason Evansのメモリアロケータ）の統計の内部インクリメンタル更新番号で、他のすべての `jemalloc` メトリックで使用されます。

### jemalloc.mapped {#jemallocmapped}

低レベルメモリアロケータ（jemalloc）の内部メトリック。See https://jemalloc.net/jemalloc.3.html

### jemalloc.metadata {#jemallocmetadata}

低レベルメモリアロケータ（jemalloc）の内部メトリック。See https://jemalloc.net/jemalloc.3.html

### jemalloc.metadata_thp {#jemallocmetadata_thp}

低レベルメモリアロケータ（jemalloc）の内部メトリック。See https://jemalloc.net/jemalloc.3.html

### jemalloc.resident {#jemallocresident}

低レベルメモリアロケータ（jemalloc）の内部メトリック。See https://jemalloc.net/jemalloc.3.html

### jemalloc.retained {#jemallocretained}

低レベルメモリアロケータ（jemalloc）の内部メトリック。See https://jemalloc.net/jemalloc.3.html

### jemalloc.prof.active {#jemallocprofactive}

低レベルメモリアロケータ（jemalloc）の内部メトリック。See https://jemalloc.net/jemalloc.3.html

**See Also**

- [Monitoring](../../operations/monitoring.md) — ClickHouseモニタリングの基本概念。
- [system.metrics](/operations/system-tables/metrics) — 即時に計算されたメトリックスを含む。
- [system.events](/operations/system-tables/events) — 発生したイベントの数を含む。
- [system.metric_log](/operations/system-tables/metric_log) — `system.metrics` および `system.events` テーブルからのメトリック値の履歴を含む。
