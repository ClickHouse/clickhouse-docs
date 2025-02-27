---
description: "バックグラウンドで定期的に計算されるメトリックを含むシステムテーブル。例えば、使用中のRAMの量。"
slug: /operations/system-tables/asynchronous_metrics
title: "asynchronous_metrics"
keywords: ["system table", "asynchronous_metrics"]
---
import SystemTableCloud from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

バックグラウンドで定期的に計算されるメトリックを含みます。例えば、使用中のRAMの量。

カラム:

- `metric` ([String](../../sql-reference/data-types/string.md)) — メトリック名。
- `value` ([Float64](../../sql-reference/data-types/float.md)) — メトリック値。
- `description` ([String](../../sql-reference/data-types/string.md) - メトリック説明)

**例**

``` sql
SELECT * FROM system.asynchronous_metrics LIMIT 10
```

``` text
┌─metric──────────────────────────────────┬──────value─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ AsynchronousMetricsCalculationTimeSpent │ 0.00179053 │ 非同期メトリックの計算にかかった時間 (秒)（これが非同期メトリックのオーバーヘッドです）。                                                                                                                                              │
│ NumberOfDetachedByUserParts             │          0 │ ユーザーが `ALTER TABLE DETACH` クエリでMergeTreeテーブルから分離したパーツの合計数 (予期しない、壊れた、または無視されたパーツとは異なります)。サーバーは分離されたパーツを気にせず、これらは削除可能です。                          │
│ NumberOfDetachedParts                   │          0 │ MergeTreeテーブルから分離されたパーツの合計数。パーツは `ALTER TABLE DETACH` クエリによってユーザーによって分離されることができ、サーバー自身によっても分離されることがあります、それが壊れていたり、予期しないものであったり、不要であったりする場合。サーバーは分離されたパーツを気にせず、これらは削除可能です。 │
│ TotalRowsOfMergeTreeTables              │    2781309 │ MergeTreeファミリーのすべてのテーブルに保存されている行（レコード）の合計数。                                                                                                                                                                                   │
│ TotalBytesOfMergeTreeTables             │    7741926 │ MergeTreeファミリーのすべてのテーブルに保存されているバイト数（圧縮済み、データとインデックスを含む）。                                                                                                                                                   │
│ NumberOfTables                          │         93 │ サーバー上のデータベース全体で合計されたテーブルの数。MergeTreeテーブルを含むことができないデータベースは除外されます。除外されるデータベースエンジンは、`Lazy`、`MySQL`、`PostgreSQL`、`SQLite`のように、動的にテーブルセットを生成するものです。 │
│ NumberOfDatabases                       │          6 │ サーバー上のデータベースの合計数。                                                                                                                                                                                                                   │
│ MaxPartCountForPartition                │          6 │ MergeTreeファミリーのすべてのテーブルのすべてのパーティションでのパーツの最大数。300を超える値は、設定ミス、過負荷、大量データの読み込みを示します。                                                                       │
│ ReplicasSumMergesInQueue                │          0 │ レプリケーションテーブル間のキュー内のマージ操作の合計数（まだ適用されていない）。                                                                                                                                                                       │
│ ReplicasSumInsertsInQueue               │          0 │ レプリケーションテーブル間のキュー内のINSERT操作の合計数（まだレプリケートされていない）。                                                                                                                                                                   │
└─────────────────────────────────────────┴────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

<!--- system.events や system.metrics とは異なり、非同期メトリックはソースコードファイルの単純なリストとして集計されていない - それらは src/Interpreters/ServerAsynchronousMetrics.cpp のロジックと混在しています。
      読者の便宜のため、ここで明示的に列挙します。 --->

## メトリックの説明 {#metric-descriptions}


### AsynchronousHeavyMetricsCalculationTimeSpent {#asynchronousheavymetricscalculationtimespent}

非同期重（テーブル関連）メトリックの計算にかかった時間（秒）（これが非同期メトリックのオーバーヘッドです）。

### AsynchronousHeavyMetricsUpdateInterval {#asynchronousheavymetricsupdateinterval}

重（テーブル関連）メトリックの更新間隔。

### AsynchronousMetricsCalculationTimeSpent {#asynchronousmetricscalculationtimespent}

非同期メトリックの計算にかかった時間（秒）（これが非同期メトリックのオーバーヘッドです）。

### AsynchronousMetricsUpdateInterval {#asynchronousmetricsupdateinterval}

メトリックの更新間隔。

### BlockActiveTime_*name* {#blockactivetime_name}

ブロックデバイスにIOリクエストがキューに入れられていた時間（秒）。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれます。クリックハウスサーバーだけではありません。ソース：`/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockDiscardBytes_*name* {#blockdiscardbytes_name}

ブロックデバイス上で捨てられたバイト数。これらの操作はSSDに関連しています。ClickHouseでは使用されませんが、システム上の他のプロセスで使用されることがあります。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれます。ソース：`/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockDiscardMerges_*name* {#blockdiscardmerges_name}

ブロックデバイスから要求された捨て操作の数と、OS IOスケジューラによって一緒にマージされたもの。これらの操作はSSDに関連しています。ClickHouseでは使用されませんが、システム上の他のプロセスで使用されることがあります。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれます。ソース：`/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockDiscardOps_*name* {#blockdiscardops_name}

ブロックデバイスから要求された捨て操作の数。これらの操作はSSDに関連しています。ClickHouseでは使用されませんが、システム上の他のプロセスで使用されることがあります。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれます。ソース：`/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockDiscardTime_*name* {#blockdiscardtime_name}

ブロックデバイスから要求された捨て操作に費やされた時間（秒）の合計。これらの操作はSSDに関連しています。ClickHouseでは使用されませんが、システム上の他のプロセスで使用されることがあります。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれます。ソース：`/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockInFlightOps_*name* {#blockinflightops_name}

この値は、デバイスドライバに対して発行されたI/Oリクエストの数をカウントしますが、まだ完了していません。これは、キューにあるがまだデバイスドライバに発行されていないIOリクエストは含まれません。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれます。ソース：`/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockQueueTime_*name* {#blockqueuetime_name}

この値は、IOリクエストがこのブロックデバイスで待機していたミリ秒数をカウントします。複数のIOリクエストが待機している場合、この値は待機しているリクエストの数とミリ秒数の積として増加します。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれます。ソース：`/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockReadBytes_*name* {#blockreadbytes_name}

ブロックデバイスから読み取られたバイト数。これは、OSページキャッシュによるIOの節約のため、ファイルシステムから読み取られたバイト数よりも少ない場合があります。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれます。ソース：`/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockReadMerges_*name* {#blockreadmerges_name}

ブロックデバイスから要求された読み取り操作の数と、OS IOスケジューラによって一緒にマージされたもの。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれます。ソース：`/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockReadOps_*name* {#blockreadops_name}

ブロックデバイスから要求された読み取り操作の数。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれます。ソース：`/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockReadTime_*name* {#blockreadtime_name}

ブロックデバイスから要求された読み取り操作に費やされた時間（秒）をすべての操作にわたって合計したもの。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれます。ソース：`/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockWriteBytes_*name* {#blockwritebytes_name}

ブロックデバイスに書き込まれたバイト数。これは、OSページキャッシュによるIOの節約のため、ファイルシステムに書き込まれたバイト数より少ない場合があります。ブロックデバイスへの書き込みは、対応するファイルシステムへの書き込みよりも遅れる場合があります。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれます。ソース：`/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockWriteMerges_*name* {#blockwritemerges_name}

ブロックデバイスから要求された書き込み操作の数と、OS IOスケジューラによって一緒にマージされたもの。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれます。ソース：`/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockWriteOps_*name* {#blockwriteops_name}

ブロックデバイスから要求された書き込み操作の数。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれます。ソース：`/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockWriteTime_*name* {#blockwritetime_name}

ブロックデバイスから要求した書き込み操作にかかった時間（秒）の合計。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれます。ソース：`/sys/block`。詳細については https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### CPUFrequencyMHz_*name* {#cpufrequencymhz_name}

CPUの現在の周波数（MHz）。ほとんどの現代的なCPUは、節電とターボブーストのために周波数を動的に調整します。

### CompiledExpressionCacheBytes {#compiledexpressioncachebytes}

JITコンパイルされたコードのキャッシュに使用される合計バイト数。

### CompiledExpressionCacheCount {#compiledexpressioncachecount}

JITコンパイルされたコードのキャッシュ内の合計エントリ数。

### DiskAvailable_*name* {#diskavailable_name}

ディスク上の使用可能なバイト数（仮想ファイルシステム）。リモートファイルシステムは16 EiBのような大きな値を示すことがあります。

### DiskTotal_*name* {#disktotal_name}

ディスクの総サイズ（バイト数）（仮想ファイルシステム）。リモートファイルシステムは16 EiBのような大きな値を示すことがあります。

### DiskUnreserved_*name* {#diskunreserved_name}

マージ、フォッチ、および移動のための予約がないディスクの使用可能なバイト数（仮想ファイルシステム）。リモートファイルシステムは16 EiBのような大きな値を示すことがあります。

### DiskUsed_*name* {#diskused_name}

ディスク上で使用されているバイト数（仮想ファイルシステム）。リモートファイルシステムは、常にこの情報を提供するわけではありません。

### FilesystemCacheBytes {#filesystemcachebytes}

`cache` 仮想ファイルシステム内の合計バイト数。このキャッシュはディスク上に保持されます。

### FilesystemCacheFiles {#filesystemcachefiles}

`cache` 仮想ファイルシステム内にキャッシュされたファイルセグメントの合計数。このキャッシュはディスク上に保持されます。

### FilesystemLogsPathAvailableBytes {#filesystemlogspathavailablebytes}

ClickHouseのログパスがマウントされたボリューム上の使用可能なバイト数。この値がゼロに近づくと、設定ファイルでのログローテーションの調整が必要です。

### FilesystemLogsPathAvailableINodes {#filesystemlogspathavailableinodes}

ClickHouseのログパスがマウントされたボリューム上の使用可能なiノードの数。

### FilesystemLogsPathTotalBytes {#filesystemlogspathtotalbytes}

ClickHouseのログパスがマウントされたボリュームのサイズ（バイト）。ログには少なくとも10GBを持つことが推奨されます。

### FilesystemLogsPathTotalINodes {#filesystemlogspathtotalinodes}

ClickHouseのログパスがマウントされたボリューム上のiノードの合計数。

### FilesystemLogsPathUsedBytes {#filesystemlogspathusedbytes}

ClickHouseのログパスがマウントされたボリューム上で使用されているバイト数。

### FilesystemLogsPathUsedINodes {#filesystemlogspathusedinodes}

ClickHouseのログパスがマウントされたボリューム上で使用されているiノードの数。

### FilesystemMainPathAvailableBytes {#filesystemmainpathavailablebytes}

メインのClickHouseパスがマウントされたボリューム上の使用可能なバイト数。

### FilesystemMainPathAvailableINodes {#filesystemmainpathavailableinodes}

メインのClickHouseパスがマウントされたボリューム上の使用可能なiノードの数。これがゼロに近い場合、設定ミスを示しており、ディスクが満杯でなくても「デバイスに空き容量がありません」と表示される場合があります。

### FilesystemMainPathTotalBytes {#filesystemmainpathtotalbytes}

メインのClickHouseパスがマウントされたボリュームのサイズ（バイト）。

### FilesystemMainPathTotalINodes {#filesystemmainpathtotalinodes}

メインのClickHouseパスがマウントされたボリューム上のiノードの合計数。これが2500万未満の場合、設定ミスを示しています。

### FilesystemMainPathUsedBytes {#filesystemmainpathusedbytes}

メインのClickHouseパスがマウントされたボリューム上で使用されているバイト数。

### FilesystemMainPathUsedINodes {#filesystemmainpathusedinodes}

メインのClickHouseパスがマウントされたボリューム上で使用されているiノードの数。この値は主にファイルの数に対応します。

### HTTPThreads {#httpthreads}

HTTPインターフェースのサーバー内のスレッド数（TLSなし）。

### InterserverThreads {#interserverthreads}

レプリカ間通信プロトコルのサーバー内のスレッド数（TLSなし）。

### Jitter {#jitter}

非同期メトリックを計算するスレッドがスケジュールされたウェイクアップ時間と、実際にウェイクアップした時間の違い。全体的なシステムの待機時間と応答性の代理指標。

### LoadAverage*N* {#loadaveragen}

システム全体の負荷を1分間の指数スムージングで平均したもの。負荷は、CPUによって現在実行中またはIOを待機している、もしくは実行可能だが現時点でスケジュールされていないすべてのプロセス（OSカーネルのスケジューリングエンティティ）におけるスレッドの数を示します。この数にはすべてのプロセスが含まれ、クリックハウスサーバーだけではありません。この数はCPUコアの数を超える場合があります。システムが過負荷の場合、多くのプロセスが実行準備ができてはいるがCPUやIOを待っている状態です。

### MMapCacheCells {#mmapcachecells}

`mmap`（メモリにマッピングされた）で開かれたファイルの数。この設定が `local_filesystem_read_method` に `mmap` に設定されているクエリで使用されます。`mmap`で開かれたファイルは、コストのかかるTLBフラッシュを避けるためにキャッシュに保持されます。

### MarkCacheBytes {#markcachebytes}

マークキャッシュの合計サイズ（バイト）。

### MarkCacheFiles {#markcachefiles}

マークキャッシュにキャッシュされたマークファイルの合計数。

### MaxPartCountForPartition {#maxpartcountforpartition}

MergeTreeファミリーのすべてのテーブルのすべてのパーティションでのパーツの最大数。300を超える値は設定ミス、過負荷、大量データの読み込みを示します。

### MemoryCode {#memorycode}

サーバープロセスの機械語ページのためにマッピングされた仮想メモリの量（バイト）。

### MemoryDataAndStack {#memorydataandstack}

スタックの使用とためにマッピングされた仮想メモリの量（バイト）。それにはスレッドごとのスタックや、'mmap'システムコールで割り当てられたほとんどの割り当てられたメモリが含まれるかどうかは不明です。このメトリックは完全性の理由でのみ存在します。監視には `MemoryResident` メトリックの使用をお勧めします。

### MemoryResidentMax {#memoryresidentmax}

サーバープロセスによって使用される最大物理メモリの量（バイト）。

### MemoryResident {#memoryresident}

サーバープロセスによって使用される物理メモリの量（バイト）。

### MemoryShared {#memoryshared}

サーバープロセスによって使用され、他のプロセスとも共有されているメモリの量（バイト）。ClickHouseは共有メモリを使用しませんが、OSの理由でいくつかのメモリが共有としてラベル付けされることがあります。このメトリックは監視の意味をあまり持たず、完全性の理由でのみ存在します。

### MemoryVirtual {#memoryvirtual}

サーバープロセスによって割り当てられた仮想アドレス空間のサイズ（バイト）。仮想アドレス空間のサイズは通常、物理メモリの消費よりもはるかに大きく、メモリ消費の見積もりとして使用されるべきではありません。このメトリックの大きな値は完全に正常であり、技術的な意味を持つだけです。

### MySQLThreads {#mysqlthreads}

MySQL互換プロトコルのサーバー内のスレッド数。

### NetworkReceiveBytes_*name* {#networkreceivebytes_name}

ネットワークインターフェースを介して受信されたバイト数。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれ、クリックハウスサーバーだけではありません。

### NetworkReceiveDrop_*name* {#networkreceivedrop_name}

ネットワークインターフェースを介して受信中にパケットがドロップされた回数。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれ、クリックハウスサーバーだけではありません。

### NetworkReceiveErrors_*name* {#networkreceiveerrors_name}

ネットワークインターフェースを介して受信中にエラーが発生した回数。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれ、クリックハウスサーバーだけではありません。

### NetworkReceivePackets_*name* {#networkreceivepackets_name}

ネットワークインターフェースを介して受信されたネットワークパケットの数。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれ、クリックハウスサーバーだけではありません。

### NetworkSendBytes_*name* {#networksendbytes_name}

ネットワークインターフェースを介して送信されたバイト数。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれ、クリックハウスサーバーだけではありません。

### NetworkSendDrop_*name* {#networksenddrop_name}

ネットワークインターフェースを介して送信中にパケットがドロップされた回数。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれ、クリックハウスサーバーだけではありません。

### NetworkSendErrors_*name* {#networksenderrors_name}

ネットワークインターフェースを介して送信中にエラー（例：TCP再送）が発生した回数。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれ、クリックハウスサーバーだけではありません。

### NetworkSendPackets_*name* {#networksendpackets_name}

ネットワークインターフェースを介して送信されたネットワークパケットの数。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれ、クリックハウスサーバーだけではありません。

### NumberOfDatabases {#numberofdatabases}

サーバー上のデータベースの合計数。

### NumberOfDetachedByUserParts {#numberofdetachedbyuserparts}

ユーザーが `ALTER TABLE DETACH` クエリでMergeTreeテーブルから分離したパーツの合計数（予期しない、壊れた、または無視されたパーツとは異なります）。サーバーは分離されたパーツを気にせず、これらは削除可能です。

### NumberOfDetachedParts {#numberofdetachedparts}

MergeTreeテーブルから分離されたパーツの合計数。パーツは `ALTER TABLE DETACH` クエリによってユーザーによって分離されることができ、サーバー自身によっても分離されることがあります、それが壊れていたり、予期しないものであったり、不要であったりする場合。サーバーは分離されたパーツを気にせず、これらは削除可能です。

### NumberOfTables {#numberoftables}

サーバー上のデータベース全体で合計されたテーブルの数。ただし、MergeTreeテーブルを格納できないデータベースは除外されます。除外されるデータベースエンジンは、`Lazy`、`MySQL`、`PostgreSQL`、`SQLite`など、動的にテーブルセットを生成するものです。

### OSContextSwitches {#oscontextswitches}

ホストマシンでシステムが受けたコンテキストスイッチの数。これは全体的なメトリックで、ホストマシン上のすべてのプロセスが含まれ、クリックハウスサーバーだけではありません。

### OSGuestNiceTime {#osguestnicetime}

Linuxカーネルの制御下でゲストオペレーティングシステムのために仮想CPUを実行するために費やされた時間の比率。この時、ゲストはより高い優先度に設定されました（`man procfs`を参照）。これは全体的なメトリックで、すべてのホストマシン上のプロセスが含まれ、クリックハウスサーバーだけではありません。このメトリックはClickHouseには関連しませんが、完全性のために存在します。単一のCPUコアに対する値は[0..1]の間になります。すべてのCPUコアに対する値は、[0..num cores]の範囲で計算されます。

### OSGuestNiceTimeCPU_*N* {#osguestnicetimecpu_n}

Linuxカーネルの制御下でゲストオペレーティングシステムのために仮想CPUを実行するために費やされた時間の比率。この時、ゲストはより高い優先度に設定されました（`man procfs`を参照）。これは全体的なメトリックで、すべてのホストマシン上のプロセスが含まれ、クリックハウスサーバーだけではありません。このメトリックはClickHouseには関連しませんが、完全性のために存在します。単一のCPUコアに対する値は[0..1]の間になります。すべてのCPUコアに対する値は、[0..num cores]の範囲で計算されます。

### OSGuestNiceTimeNormalized {#osguestnicetimenormalized}

値は `OSGuestNiceTime` と似ていますが、CPUコアの数で割って[0..1]の範囲で測定されます。これにより、コアの数が均一でなくても、クラスター内の複数のサーバー間でこのメトリックの値を平均化し、依然として平均リソース使用率のメトリックを得ることができます。

### OSGuestTime {#osguesttime}

Linuxカーネルの制御下でゲストオペレーティングシステムのために仮想CPUを実行するために費やされた時間の比率（`man procfs`を参照）。これは全体的なメトリックで、すべてのホストマシン上のプロセスが含まれ、クリックハウスサーバーだけではありません。このメトリックはClickHouseには関連しませんが、完全性のために存在します。単一のCPUコアに対する値は[0..1]の間になります。すべてのCPUコアに対する値は、[0..num cores]の範囲で計算されます。

### OSGuestTimeCPU_*N* {#osguesttimecpu_n}

Linuxカーネルの制御下でゲストオペレーティングシステムのために仮想CPUを実行するために費やされた時間の比率（`man procfs`を参照）。これは全体的なメトリックで、すべてのホストマシン上のプロセスが含まれ、クリックハウスサーバーだけではありません。このメトリックはClickHouseには関連しませんが、完全性のために存在します。単一のCPUコアに対する値は[0..1]の間になります。すべてのCPUコアに対する値は、[0..num cores]の範囲で計算されます。

### OSGuestTimeNormalized {#osguesttimenormalized}

値は `OSGuestTime` と似ていますが、CPUコアの数で割って[0..1]の範囲で測定されます。これにより、コアの数が均一でなくても、クラスター内の複数のサーバー間でこのメトリックの値を平均化し、依然として平均リソース使用率のメトリックを得ることができます。

### OSIOWaitTime {#osiowaittime}

CPUコアがコードを実行していない時間の比率、ただしOSカーネルがこのCPU上で他のプロセスを実行していなかった場合（プロセスがIOを待っていたため）。これは全体的なメトリックで、すべてのホストマシン上のプロセスが含まれ、クリックハウスサーバーだけではありません。単一のCPUコアに対する値は[0..1]の間になります。すべてのCPUコアに対する値は、[0..num cores]の範囲で計算されます。

### OSIOWaitTimeCPU_*N* {#osiowaittimecpu_n}

CPUコアがコードを実行していない時間の比率、ただしOSカーネルがこのCPU上で他のプロセスを実行していなかった場合（プロセスがIOを待っていたため）。これは全体的なメトリックで、すべてのホストマシン上のプロセスが含まれ、クリックハウスサーバーだけではありません。単一のCPUコアに対する値は[0..1]の間になります。すべてのCPUコアに対する値は、[0..num cores]の範囲で計算されます。

### OSIOWaitTimeNormalized {#osiowaittimenormalized}

値は `OSIOWaitTime` と似ていますが、CPUコアの数で割って[0..1]の範囲で測定されます。これにより、コアの数が均一でなくても、クラスター内の複数のサーバー間でこのメトリックの値を平均化し、依然として平均リソース使用率のメトリックを得ることができます。

### OSIdleTime {#osidletime}

OSカーネルの観点から見た場合、CPUコアがアイドル状態（プロセスを待っている状態にさえなっていない）の時間の比率。これは全体的なメトリックで、すべてのホストマシン上のプロセスが含まれ、クリックハウスサーバーだけではありません。この数値は、CPUが内部の理由（メモリの負荷、パイプラインの停滞、分岐予測の誤り、別のSMTコアの実行）により過小利用されていた時間を含まない。この値は単一のCPUコアに対しては[0..1]の範囲になります。すべてのCPUコアに対する値は、[0..num cores]の範囲で計算されます。

### OSIdleTimeCPU_*N* {#osidletimecpu_n}

OSカーネルの観点から見た場合、CPUコアがアイドル状態（プロセスを待っている状態にさえなっていない）の時間の比率。これは全体的なメトリックで、すべてのホストマシン上のプロセスが含まれ、クリックハウスサーバーだけではありません。この数値は、CPUが内部の理由（メモリの負荷、パイプラインの停滞、分岐予測の誤り、別のSMTコアの実行）により過小利用されていた時間を含まない。この値は単一のCPUコアに対しては[0..1]の範囲になります。すべてのCPUコアに対する値は、[0..num cores]の範囲で計算されます。

### OSIdleTimeNormalized {#osidletimenormalized}

値は `OSIdleTime` と似ていますが、CPUコアの数で割って[0..1]の範囲で測定されます。これにより、コアの数が均一でなくても、クラスター内の複数のサーバー間でこのメトリックの値を平均化し、依然として平均リソース使用率のメトリックを得ることができます。

### OSInterrupts {#osinterrupts}

ホストマシンでの割り込み数。これは全体的なメトリックで、すべてのホストマシン上のプロセスが含まれ、クリックハウスサーバーだけではありません。

### OSIrqTime {#osirqtime}

CPU上でハードウェアイラプトリクエストを実行するために費やされた時間の比率。これは全体的なメトリックで、すべてのホストマシン上のプロセスが含まれ、クリックハウスサーバーだけではありません。このメトリックの高い数値は、ハードウェアの設定ミスまたは非常に高いネットワーク負荷を示す可能性があります。単一のCPUコアに対する値は[0..1]の範囲になります。すべてのCPUコアに対する値は、[0..num cores]の範囲で計算されます。

### OSIrqTimeCPU_*N* {#osirqtimecpu_n}

CPU上でハードウェアイラプトリクエストを実行するために費やされた時間の比率。これは全体的なメトリックで、すべてのホストマシン上のプロセスが含まれ、クリックハウスサーバーだけではありません。このメトリックの高い数値は、ハードウェアの設定ミスまたは非常に高いネットワーク負荷を示す可能性があります。単一のCPUコアに対する値は[0..1]の範囲になります。すべてのCPUコアに対する値は、[0..num cores]の範囲で計算されます。

### OSIrqTimeNormalized {#osirqtimenormalized}

値は `OSIrqTime` と似ていますが、CPUコアの数で割って[0..1]の範囲で測定されます。これにより、コアの数が均一でなくても、クラスター内の複数のサーバー間でこのメトリックの値を平均化し、依然として平均リソース使用率のメトリックを得ることができます。

### OSMemoryAvailable {#osmemoryavailable}

プログラムによって使用可能なメモリの量（バイト）。これは `OSMemoryFreePlusCached` メトリックと非常に似ています。これは全体的なメトリックで、すべてのホストマシン上のプロセスが含まれ、クリックハウスサーバーだけではありません。

### OSMemoryBuffers {#osmemorybuffers}

OSカーネルバッファによって使用されるメモリの量（バイト）。通常は小さいはずで、大きな値はOSの設定ミスを示す可能性があります。これは全体的なメトリックで、すべてのホストマシン上のプロセスが含まれ、クリックハウスサーバーだけではありません。

### OSMemoryCached {#osmemorycached}

OSページキャッシュによって使用されるメモリの量（バイト）。通常、利用可能なメモリのほぼすべてがOSページキャッシュによって使用されます。このメトリックの高い値は普通のことで、予期されるものです。これは全体的なメトリックで、すべてのホストマシン上のプロセスが含まれ、クリックハウスサーバーだけではありません。

### OSMemoryFreePlusCached {#osmemoryfreepluscached}

以下は、ClickHouseのドキュメントの日本語訳です。元のHTMLタグやマークダウンフォーマットを維持しています。

---

ホストシステムの無料メモリとOSページキャッシュメモリの合計、バイト単位。このメモリはプログラムによって使用可能です。この値は`OSMemoryAvailable`と非常に似ているべきです。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSMemoryFreeWithoutCached {#osmemoryfreewithoutcached}

ホストシステムの無料メモリの量、バイト単位。これはOSページキャッシュメモリが使用しているメモリを含まない、バイト単位の値です。ページキャッシュメモリもプログラムによって使用可能であるため、このメトリックの値は混乱を招くことがあります。代わりに`OSMemoryAvailable`メトリックを参照してください。便宜上、`OSMemoryFreePlusCached`メトリックも提供しており、これはOSMemoryAvailableにある程度似ているはずです。また、https://www.linuxatemyram.com/も参照してください。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSMemoryTotal {#osmemorytotal}

ホストシステムの総メモリ量、バイト単位。

### OSNiceTime {#osnicetime}

CPUコアが高優先度のユーザースペースコードを実行していた時間の比率。このメトリックはシステム全体であり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。単一のCPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は、それらの合計として計算されます[0..num cores]。

### OSNiceTimeCPU_*N* {#osnicetimecpu_n}

CPUコアが高優先度のユーザースペースコードを実行していた時間の比率。このメトリックはシステム全体であり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。単一のCPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は、それらの合計として計算されます[0..num cores]。

### OSNiceTimeNormalized {#osnicetimenormalized}

この値は`OSNiceTime`と似ていますが、CPUコアの数で割って[0..1]の範囲で測定され、コアの数に関係なくです。これにより、クラスタ内の複数のサーバーにわたってこのメトリックの値を平均化でき、コアの数が非均一であっても平均リソース利用メトリックを取得できます。

### OSOpenFiles {#osopenfiles}

ホストマシンでオープンされているファイルの総数。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSProcessesBlocked {#osprocessesblocked}

I/Oの完了を待ってブロックされているスレッドの数（`man procfs`）。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSProcessesCreated {#osprocessescreated}

作成されたプロセスの数。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSProcessesRunning {#osprocessesrunning}

オペレーティングシステムによって実行可能（実行中または実行準備中）のスレッドの数。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSSoftIrqTime {#ossoftirqtime}

CPU上でソフトウェア割り込み要求を実行するのに費やされた時間の比率。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。このメトリックの値が高い場合、システム上で非効率なソフトウェアが実行されていることを示している可能性があります。単一のCPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は、それらの合計として計算されます[0..num cores]。

### OSSoftIrqTimeCPU_*N* {#ossoftirqtimecpu_n}

CPU上でソフトウェア割り込み要求を実行するのに費やされた時間の比率。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。このメトリックの値が高い場合、システム上で非効率なソフトウェアが実行されていることを示している可能性があります。単一のCPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は、それらの合計として計算されます[0..num cores]。

### OSSoftIrqTimeNormalized {#ossoftirqtimenormalized}

この値は`OSSoftIrqTime`と似ていますが、CPUコアの数で割って[0..1]の範囲で測定され、コアの数に関係なくです。これにより、クラスタ内の複数のサーバーにわたってこのメトリックの値を平均化でき、コアの数が非均一であっても平均リソース利用メトリックを取得できます。

### OSStealTime {#osstealtime}

仮想環境でCPUが他のオペレーティングシステムで費やした時間の比率。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。すべての仮想化環境がこのメトリックを提供するわけではなく、ほとんどは提供しません。単一のCPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は、それらの合計として計算されます[0..num cores]。

### OSStealTimeCPU_*N* {#osstealtimecpu_n}

仮想環境でCPUが他のオペレーティングシステムで費やした時間の比率。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。すべての仮想化環境がこのメトリックを提供するわけではなく、ほとんどは提供しません。単一のCPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は、それらの合計として計算されます[0..num cores]。

### OSStealTimeNormalized {#osstealtimenormalized}

この値は`OSStealTime`と似ていますが、CPUコアの数で割って[0..1]の範囲で測定され、コアの数に関係なくです。これにより、クラスタ内の複数のサーバーにわたってこのメトリックの値を平均化でき、コアの数が非均一であっても平均リソース利用メトリックを取得できます。

### OSSystemTime {#ossystemtime}

CPUコアがOSカーネル（システム）コードを実行していた時間の比率。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。単一のCPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は、それらの合計として計算されます[0..num cores]。

### OSSystemTimeCPU_*N* {#ossystemtimecpu_n}

CPUコアがOSカーネル（システム）コードを実行していた時間の比率。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。単一のCPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は、それらの合計として計算されます[0..num cores]。

### OSSystemTimeNormalized {#ossystemtimenormalized}

この値は`OSSystemTime`と似ていますが、CPUコアの数で割って[0..1]の範囲で測定され、コアの数に関係なくです。これにより、クラスタ内の複数のサーバーにわたってこのメトリックの値を平均化でき、コアの数が非均一であっても平均リソース利用メトリックを取得できます。

### OSThreadsRunnable {#osthreadsrunnable}

OSカーネルスケジューラーが見た「実行可能」スレッドの総数。

### OSThreadsTotal {#osthreadstotal}

OSカーネルスケジューラーが見たスレッドの総数。

### OSUptime {#osuptime}

ホストサーバー（ClickHouseが実行されているマシン）の稼働時間、秒単位。

### OSUserTime {#osusertime}

CPUコアがユーザースペースコードを実行していた時間の比率。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。これは、CPU内部の理由（メモリ負荷、パイプラインの停滞、分岐ミス、別のSMTコアの実行）によってCPUが過小利用されていた時間も含まれます。単一のCPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は、それらの合計として計算されます[0..num cores]。

### OSUserTimeCPU_*N* {#osusertimecpu_n}

CPUコアがユーザースペースコードを実行していた時間の比率。このメトリックはシステム全体のものであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。これは、CPU内部の理由（メモリ負荷、パイプラインの停滞、分岐ミス、別のSMTコアの実行）によってCPUが過小利用されていた時間も含まれます。単一のCPUコアの値は[0..1]の範囲になります。すべてのCPUコアの値は、それらの合計として計算されます[0..num cores]。

### OSUserTimeNormalized {#osusertimenormalized}

この値は`OSUserTime`と似ていますが、CPUコアの数で割って[0..1]の範囲で測定され、コアの数に関係なくです。これにより、クラスタ内の複数のサーバーにわたってこのメトリックの値を平均化でき、コアの数が非均一であっても平均リソース利用メトリックを取得できます。

### PostgreSQLThreads {#postgresqlthreads}

PostgreSQL互換プロトコルのサーバー内のスレッドの数。

### QueryCacheBytes {#querycachebytes}

クエリキャッシュの総サイズ（バイト単位）。

### QueryCacheEntries {#querycacheentries}

クエリキャッシュ内のエントリの総数。

### ReplicasMaxAbsoluteDelay {#replicasmaxabsolutedelay}

Replicatedテーブル間で最も新しい複製されたパーツと、まだ複製されていない最も新しいデータパーツとの最大秒数の差。非常に高い値は、データのないレプリカを示します。

### ReplicasMaxInsertsInQueue {#replicasmaxinsertsinqueue}

Replicatedテーブル間でキュー内にあるINSERT操作の最大数（まだ複製されていない）。

### ReplicasMaxMergesInQueue {#replicasmaxmergesinqueue}

Replicatedテーブル間でキュー内にあるマージ操作の最大数（まだ適用されていない）。

### ReplicasMaxQueueSize {#replicasmaxqueuesize}

Replicatedテーブル間での最大キューサイズ（get、mergeの操作数）。

### ReplicasMaxRelativeDelay {#replicasmaxrelativedelay}

Replicatedテーブル間でのレプリカ遅延と同じテーブルの最新レプリカの遅延との最大の差。

### ReplicasSumInsertsInQueue {#replicassuminsertsinqueue}

Replicatedテーブル間でキュー内にあるINSERT操作の合計（まだ複製されていない）。

### ReplicasSumMergesInQueue {#replicassummergesinqueue}

Replicatedテーブル間でキュー内にあるマージ操作の合計（まだ適用されていない）。

### ReplicasSumQueueSize {#replicassumqueuesize}

Replicatedテーブル間での合計キューサイズ（get、mergeの操作数）。

### TCPThreads {#tcpthreads}

TCPプロトコルのサーバー内のスレッドの数（TLSなし）。

### Temperature_*N* {#temperature_n}

対応するデバイスの温度（℃）。センサーは非現実的な値を返すことがあります。出所: `/sys/class/thermal`

### Temperature_*name* {#temperature_name}

対応するハードウェアモニターおよび対応するセンサーが報告する温度（℃）。センサーは非現実的な値を返すことがあります。出所: `/sys/class/hwmon`

### TotalBytesOfMergeTreeTables {#totalbytesofmergetreetables}

MergeTreeファミリーのすべてのテーブルに保持されているバイトの総量（圧縮されており、データとインデックスを含む）。

### TotalPartsOfMergeTreeTables {#totalpartsofmergetreetables}

MergeTreeファミリーのすべてのテーブルのデータパーツの総数。10,000を超える数字は、サーバーの起動時間に悪影響を及ぼし、パーティションキーの不合理な選択を示す可能性があります。

### TotalPrimaryKeyBytesInMemory {#totalprimarykeybytesinmemory}

プライマリキー値が使用するメモリの総量（バイト単位、アクティブパーツのみ考慮）。

### TotalPrimaryKeyBytesInMemoryAllocated {#totalprimarykeybytesinmemoryallocated}

プライマリキー値が予約するメモリの総量（バイト単位、アクティブパーツのみ考慮）。

### TotalRowsOfMergeTreeTables {#totalrowsofmergetreetables}

MergeTreeファミリーのすべてのテーブルに保存されている行（レコード）の総数。

### UncompressedCacheBytes {#uncompressedcachebytes}

未圧縮キャッシュの総サイズ（バイト単位）。未圧縮キャッシュは通常パフォーマンスを向上させず、主に避けるべきです。

### UncompressedCacheCells {#uncompressedcachecells}

未圧縮キャッシュ内のエントリの総数。各エントリはデコンプレッションされたデータブロックを表します。未圧縮キャッシュは通常パフォーマンスを向上させず、主に避けるべきです。

### Uptime {#uptime}

サーバーの稼働時間（秒単位）。接続を受け入れる前のサーバー初期化に費やされた時間を含みます。

### jemalloc.active {#jemallocactive}

低レベルメモリアロケータ（jemalloc）の内部メトリックです。詳細については、https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.allocated {#jemallocallocated}

低レベルメモリアロケータ（jemalloc）の内部メトリックです。詳細については、https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.dirty_purged {#jemallocarenasalldirty_purged}

低レベルメモリアロケータ（jemalloc）の内部メトリックです。詳細については、https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.muzzy_purged {#jemallocarenasallmuzzy_purged}

低レベルメモリアロケータ（jemalloc）の内部メトリックです。詳細については、https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.pactive {#jemallocarenasallpactive}

低レベルメモリアロケータ（jemalloc）の内部メトリックです。詳細については、https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.pdirty {#jemallocarenasallpdirty}

低レベルメモリアロケータ（jemalloc）の内部メトリックです。詳細については、https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.pmuzzy {#jemallocarenasallpmuzzy}

低レベルメモリアロケータ（jemalloc）の内部メトリックです。詳細については、https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.background_thread.num_runs {#jemallocbackground_threadnum_runs}

低レベルメモリアロケータ（jemalloc）の内部メトリックです。詳細については、https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.background_thread.num_threads {#jemallocbackground_threadnum_threads}

低レベルメモリアロケータ（jemalloc）の内部メトリックです。詳細については、https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.background_thread.run_intervals {#jemallocbackground_threadrun_intervals}

低レベルメモリアロケータ（jemalloc）の内部メトリックです。詳細については、https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.epoch {#jemallocepoch}

jemalloc（Jason Evansのメモリアロケータ）の統計の内部インクリメンタル更新番号で、すべての他の`jemalloc`メトリックで使用されます。

### jemalloc.mapped {#jemallocmapped}

低レベルメモリアロケータ（jemalloc）の内部メトリックです。詳細については、https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.metadata {#jemallocmetadata}

低レベルメモリアロケータ（jemalloc）の内部メトリックです。詳細については、https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.metadata_thp {#jemallocmetadata_thp}

低レベルメモリアロケータ（jemalloc）の内部メトリックです。詳細については、https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.resident {#jemallocresident}

低レベルメモリアロケータ（jemalloc）の内部メトリックです。詳細については、https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.retained {#jemallocretained}

低レベルメモリアロケータ（jemalloc）の内部メトリックです。詳細については、https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.prof.active {#jemallocprofactive}

低レベルメモリアロケータ（jemalloc）の内部メトリックです。詳細については、https://jemalloc.net/jemalloc.3.html を参照してください。

**関連情報**

- [Monitoring](../../operations/monitoring.md) — ClickHouseモニタリングの基本概念。
- [system.metrics](../../operations/system-tables/metrics.md#system_tables-metrics) — 即座に計算されたメトリックを含みます。
- [system.events](../../operations/system-tables/events.md#system_tables-events) — 発生したイベントのいくつかを含みます。
- [system.metric_log](../../operations/system-tables/metric_log.md#system_tables-metric_log) — `system.metrics`および`system.events`テーブルからのメトリック値の履歴を含みます。
