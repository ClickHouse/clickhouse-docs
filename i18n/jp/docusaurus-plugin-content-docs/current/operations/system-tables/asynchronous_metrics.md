---
description: 'バックグラウンドで定期的に計算されるメトリクスを保持するシステムテーブル。たとえば、使用中の RAM の量。'
keywords: ['システムテーブル', 'asynchronous_metrics']
slug: /operations/system-tables/asynchronous_metrics
title: 'system.asynchronous_metrics'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.asynchronous_metrics

<SystemTableCloud />

バックグラウンドで定期的に計算されるメトリクスを含みます。例えば、使用中のRAM容量などです。

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
│ AsynchronousMetricsCalculationTimeSpent │ 0.00179053 │ 非同期メトリクスの計算に費やされた時間(秒単位)(これは非同期メトリクスのオーバーヘッドです)。                                                                                                                                              │
│ NumberOfDetachedByUserParts             │          0 │ ユーザーが`ALTER TABLE DETACH`クエリを使用してMergeTreeテーブルから切り離したパーツの総数(予期しない、破損した、または無視されたパーツとは対照的)。サーバーは切り離されたパーツを気にせず、それらは削除可能です。                          │
│ NumberOfDetachedParts                   │          0 │ MergeTreeテーブルから切り離されたパーツの総数。パーツは、ユーザーが`ALTER TABLE DETACH`クエリで切り離すか、パーツが破損している、予期しない、または不要な場合にサーバー自体が切り離すことができます。サーバーは切り離されたパーツを気にせず、それらは削除可能です。 │
│ TotalRowsOfMergeTreeTables              │    2781309 │ MergeTreeファミリーのすべてのテーブルに格納されている行(レコード)の総数。                                                                                                                                                                                   │
│ TotalBytesOfMergeTreeTables             │    7741926 │ MergeTreeファミリーのすべてのテーブルに格納されているバイト数の総量(圧縮済み、データとインデックスを含む)。                                                                                                                                                   │
│ NumberOfTables                          │         93 │ サーバー上のデータベース全体でのテーブルの総数。MergeTreeテーブルを含むことができないデータベースは除外されます。除外されるデータベースエンジンは、`Lazy`、`MySQL`、`PostgreSQL`、`SQlite`のように、テーブルのセットを動的に生成するものです。 │
│ NumberOfDatabases                       │          6 │ サーバー上のデータベースの総数。                                                                                                                                                                                                                   │
│ MaxPartCountForPartition                │          6 │ MergeTreeファミリーのすべてのテーブルのすべてのパーティション全体での、パーティションあたりのパーツの最大数。300を超える値は、設定ミス、過負荷、または大量のデータロードを示します。                                                                       │
│ ReplicasSumMergesInQueue                │          0 │ Replicatedテーブル全体でのキュー内のマージ操作(まだ適用されていない)の合計。                                                                                                                                                                       │
│ ReplicasSumInsertsInQueue               │          0 │ Replicatedテーブル全体でのキュー内のINSERT操作(まだ複製されていない)の合計。                                                                                                                                                                   │
└─────────────────────────────────────────┴────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

<!--- Unlike with system.events and system.metrics, the asynchronous metrics are not gathered in a simple list in a source code file - they
      are mixed with logic in src/Interpreters/ServerAsynchronousMetrics.cpp.
      Listing them here explicitly for reader convenience. --->


## メトリックの説明 {#metric-descriptions}

### AsynchronousHeavyMetricsCalculationTimeSpent {#asynchronousheavymetricscalculationtimespent}

非同期重量級メトリック(テーブル関連)の計算に費やされた時間(秒単位)。これは非同期メトリックのオーバーヘッドです。

### AsynchronousHeavyMetricsUpdateInterval {#asynchronousheavymetricsupdateinterval}

重量級メトリック(テーブル関連)の更新間隔

### AsynchronousMetricsCalculationTimeSpent {#asynchronousmetricscalculationtimespent}

非同期メトリックの計算に費やされた時間(秒単位)。これは非同期メトリックのオーバーヘッドです。

### AsynchronousMetricsUpdateInterval {#asynchronousmetricsupdateinterval}

メトリックの更新間隔

### BlockActiveTime\__name_ {#blockactivetime_name}

ブロックデバイスがIOリクエストをキューに保持していた時間(秒単位)。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスが含まれます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockDiscardBytes\__name_ {#blockdiscardbytes_name}

ブロックデバイス上で破棄されたバイト数。これらの操作はSSDに関連します。破棄操作はClickHouseでは使用されませんが、システム上の他のプロセスで使用される可能性があります。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスが含まれます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockDiscardMerges\__name_ {#blockdiscardmerges_name}

ブロックデバイスに要求され、OS IOスケジューラによってマージされた破棄操作の数。これらの操作はSSDに関連します。破棄操作はClickHouseでは使用されませんが、システム上の他のプロセスで使用される可能性があります。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスが含まれます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockDiscardOps\__name_ {#blockdiscardops_name}

ブロックデバイスに要求された破棄操作の数。これらの操作はSSDに関連します。破棄操作はClickHouseでは使用されませんが、システム上の他のプロセスで使用される可能性があります。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスが含まれます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockDiscardTime\__name_ {#blockdiscardtime_name}

ブロックデバイスに要求された破棄操作に費やされた時間(秒単位)で、すべての操作の合計。これらの操作はSSDに関連します。破棄操作はClickHouseでは使用されませんが、システム上の他のプロセスで使用される可能性があります。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスが含まれます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockInFlightOps\__name_ {#blockinflightops_name}

デバイスドライバに発行されたがまだ完了していないI/Oリクエストの数。キューに入っているがまだデバイスドライバに発行されていないIOリクエストは含まれません。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスが含まれます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockQueueTime\__name_ {#blockqueuetime_name}

このブロックデバイス上でIOリクエストが待機したミリ秒数。複数のIOリクエストが待機している場合、この値はミリ秒数と待機中のリクエスト数の積として増加します。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスが含まれます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockReadBytes\__name_ {#blockreadbytes_name}

ブロックデバイスから読み取られたバイト数。IOを節約するOSページキャッシュの使用により、ファイルシステムから読み取られたバイト数よりも少なくなる場合があります。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスが含まれます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockReadMerges\__name_ {#blockreadmerges_name}

ブロックデバイスに要求され、OS IOスケジューラによってマージされた読み取り操作の数。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスが含まれます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockReadOps\__name_ {#blockreadops_name}


ブロックデバイスに要求された読み取り操作の数。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください

### BlockReadTime\__name_ {#blockreadtime_name}

ブロックデバイスに要求された読み取り操作に費やされた時間(秒単位)で、すべての操作の合計値です。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください

### BlockWriteBytes\__name_ {#blockwritebytes_name}

ブロックデバイスに書き込まれたバイト数。IOを削減するOSページキャッシュの使用により、ファイルシステムに書き込まれたバイト数よりも少なくなる場合があります。ライトスルーキャッシュにより、ブロックデバイスへの書き込みは、対応するファイルシステムへの書き込みよりも後に発生する場合があります。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください

### BlockWriteMerges\__name_ {#blockwritemerges_name}

ブロックデバイスに要求され、OS IOスケジューラによってマージされた書き込み操作の数。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください

### BlockWriteOps\__name_ {#blockwriteops_name}

ブロックデバイスに要求された書き込み操作の数。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください

### BlockWriteTime\__name_ {#blockwritetime_name}

ブロックデバイスに要求された書き込み操作に費やされた時間(秒単位)で、すべての操作の合計値です。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください

### CPUFrequencyMHz\__name_ {#cpufrequencymhz_name}

CPUの現在の周波数(MHz単位)。最近のCPUのほとんどは、省電力とターボブーストのために周波数を動的に調整します。

### DictionaryMaxUpdateDelay {#dictionarymaxlastsuccessfulupdatetime}

辞書更新の最大遅延時間(秒単位)。

### DictionaryTotalFailedUpdates {#dictionaryloadfailed}

すべての辞書において、最後に成功したロード以降のエラー数。

### DiskAvailable\__name_ {#diskavailable_name}

ディスク(仮想ファイルシステム)上の利用可能なバイト数。リモートファイルシステムでは16 EiBのような大きな値が表示されることがあります。

### DiskTotal\__name_ {#disktotal_name}

ディスク(仮想ファイルシステム)の合計サイズ(バイト単位)。リモートファイルシステムでは16 EiBのような大きな値が表示されることがあります。

### DiskUnreserved\__name_ {#diskunreserved_name}

マージ、フェッチ、移動のための予約を除いた、ディスク(仮想ファイルシステム)上の利用可能なバイト数。リモートファイルシステムでは16 EiBのような大きな値が表示されることがあります。

### DiskUsed\__name_ {#diskused_name}

ディスク(仮想ファイルシステム)上の使用済みバイト数。リモートファイルシステムでは常にこの情報が提供されるとは限りません。

### FilesystemCacheBytes {#filesystemcachebytes}

`cache`仮想ファイルシステム内の合計バイト数。このキャッシュはディスク上に保持されます。

### FilesystemCacheFiles {#filesystemcachefiles}

`cache`仮想ファイルシステム内のキャッシュされたファイルセグメントの合計数。このキャッシュはディスク上に保持されます。

### FilesystemLogsPathAvailableBytes {#filesystemlogspathavailablebytes}

ClickHouseログパスがマウントされているボリューム上の利用可能なバイト数。この値がゼロに近づいた場合は、設定ファイルでログローテーションを調整する必要があります。

### FilesystemLogsPathAvailableINodes {#filesystemlogspathavailableinodes}

ClickHouseログパスがマウントされているボリューム上の利用可能なinode数。

### FilesystemLogsPathTotalBytes {#filesystemlogspathtotalbytes}

ClickHouseログパスがマウントされているボリュームのサイズ(バイト単位)。ログには少なくとも10 GBを確保することを推奨します。

### FilesystemLogsPathTotalINodes {#filesystemlogspathtotalinodes}

ClickHouseログパスがマウントされているボリューム上のinode総数。

### FilesystemLogsPathUsedBytes {#filesystemlogspathusedbytes}

ClickHouseログパスがマウントされているボリューム上の使用済みバイト数。

### FilesystemLogsPathUsedINodes {#filesystemlogspathusedinodes}

ClickHouseログパスがマウントされているボリューム上の使用済みinode数。


### FilesystemMainPathAvailableBytes {#filesystemmainpathavailablebytes}

メインのClickHouseパスがマウントされているボリュームで利用可能なバイト数。

### FilesystemMainPathAvailableINodes {#filesystemmainpathavailableinodes}

メインのClickHouseパスがマウントされているボリュームで利用可能なinode数。この値がゼロに近い場合は設定ミスを示しており、ディスクが満杯でなくても「デバイスに空き容量がありません」というエラーが発生します。

### FilesystemMainPathTotalBytes {#filesystemmainpathtotalbytes}

メインのClickHouseパスがマウントされているボリュームのサイズ(バイト単位)。

### FilesystemMainPathTotalINodes {#filesystemmainpathtotalinodes}

メインのClickHouseパスがマウントされているボリュームの総inode数。2500万未満の場合は設定ミスを示しています。

### FilesystemMainPathUsedBytes {#filesystemmainpathusedbytes}

メインのClickHouseパスがマウントされているボリュームで使用されているバイト数。

### FilesystemMainPathUsedINodes {#filesystemmainpathusedinodes}

メインのClickHouseパスがマウントされているボリュームで使用されているinode数。この値は主にファイル数に対応します。

### HTTPThreads {#httpthreads}

HTTPインターフェースのサーバー内のスレッド数(TLSなし)。

### InterserverThreads {#interserverthreads}

レプリカ間通信プロトコルのサーバー内のスレッド数(TLSなし)。

### Jitter {#jitter}

非同期メトリクス計算用スレッドが起動予定だった時刻と実際に起動した時刻との時間差。システム全体のレイテンシと応答性を示す代理指標です。

### LoadAverage*N* {#loadaveragen}

1分間の指数平滑化によるシステム全体の平均負荷。この負荷は、すべてのプロセス(OSカーネルのスケジューリングエンティティ)のスレッド数を表し、現在CPUで実行中、I/O待機中、または実行準備が整っているがこの時点ではスケジュールされていないスレッドが含まれます。この数値にはclickhouse-serverだけでなく、すべてのプロセスが含まれます。システムが過負荷状態で、多くのプロセスが実行準備が整っているがCPUまたはI/Oを待機している場合、この数値はCPUコア数を超えることがあります。

### MaxPartCountForPartition {#maxpartcountforpartition}

MergeTreeファミリーのすべてのテーブルのすべてのパーティションにおける、パーティションあたりの最大パート数。300を超える値は、設定ミス、過負荷、または大量のデータ投入を示しています。

### MemoryCode {#memorycode}

サーバープロセスのマシンコードページにマッピングされている仮想メモリの量(バイト単位)。

### MemoryDataAndStack {#memorydataandstack}

スタックの使用と割り当てられたメモリのためにマッピングされている仮想メモリの量(バイト単位)。スレッドごとのスタックと、'mmap'システムコールで割り当てられた割り当て済みメモリの大部分が含まれるかどうかは不明です。このメトリクスは完全性のためにのみ存在します。監視には`MemoryResident`メトリクスの使用を推奨します。

### MemoryResidentMax {#memoryresidentmax}

サーバープロセスが使用した物理メモリの最大量(バイト単位)。

### MemoryResident {#memoryresident}

サーバープロセスが使用している物理メモリの量(バイト単位)。

### MemoryShared {#memoryshared}

サーバープロセスが使用しているメモリのうち、他のプロセスとも共有されているメモリの量(バイト単位)。ClickHouseは共有メモリを使用しませんが、一部のメモリはOS独自の理由により共有としてラベル付けされることがあります。このメトリクスは監視する意味があまりなく、完全性のためにのみ存在します。

### MemoryVirtual {#memoryvirtual}

サーバープロセスによって割り当てられている仮想アドレス空間のサイズ(バイト単位)。仮想アドレス空間のサイズは通常、物理メモリ消費量よりもはるかに大きく、メモリ消費量の推定値として使用すべきではありません。このメトリクスの大きな値は完全に正常であり、技術的な意味しか持ちません。

### MySQLThreads {#mysqlthreads}

MySQL互換プロトコルのサーバー内のスレッド数。

### NetworkReceiveBytes\__name_ {#networkreceivebytes_name}

ネットワークインターフェース経由で受信したバイト数。これはシステム全体のメトリクスであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスが含まれます。

### NetworkReceiveDrop\__name_ {#networkreceivedrop_name}

ネットワークインターフェース経由での受信中にドロップされたパケットのバイト数。これはシステム全体のメトリクスであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスが含まれます。

### NetworkReceiveErrors\__name_ {#networkreceiveerrors_name}

ネットワークインターフェース経由での受信中にエラーが発生した回数。これはシステム全体のメトリクスであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスが含まれます。


### NetworkReceivePackets\__name_ {#networkreceivepackets_name}

ネットワークインターフェース経由で受信したネットワークパケットの数。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### NetworkSendBytes\__name_ {#networksendbytes_name}

ネットワークインターフェース経由で送信したバイト数。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### NetworkSendDrop\__name_ {#networksenddrop_name}

ネットワークインターフェース経由での送信中にパケットがドロップされた回数。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### NetworkSendErrors\__name_ {#networksenderrors_name}

ネットワークインターフェース経由での送信中にエラー(例: TCP再送信)が発生した回数。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### NetworkSendPackets\__name_ {#networksendpackets_name}

ネットワークインターフェース経由で送信したネットワークパケットの数。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### NumberOfDatabases {#numberofdatabases}

サーバー上のデータベースの総数。

### NumberOfDetachedByUserParts {#numberofdetachedbyuserparts}

ユーザーが`ALTER TABLE DETACH`クエリを使用してMergeTreeテーブルから切り離したパーツの総数(予期しない、破損した、または無視されたパーツとは対照的)。サーバーは切り離されたパーツを管理しないため、削除することができます。

### NumberOfDetachedParts {#numberofdetachedparts}

MergeTreeテーブルから切り離されたパーツの総数。パーツは、ユーザーが`ALTER TABLE DETACH`クエリを使用して切り離すか、パーツが破損している、予期しない、または不要な場合にサーバー自体が切り離すことができます。サーバーは切り離されたパーツを管理しないため、削除することができます。

### NumberOfTables {#numberoftables}

サーバー上のデータベース全体で合計されたテーブルの総数。MergeTreeテーブルを含むことができないデータベースは除外されます。除外されるデータベースエンジンは、`Lazy`、`MySQL`、`PostgreSQL`、`SQlite`のように、テーブルのセットを動的に生成するものです。

### OSContextSwitches {#oscontextswitches}

ホストマシン上でシステムが実行したコンテキストスイッチの回数。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSGuestNiceTime {#osguestnicetime}

Linuxカーネルの制御下でゲストオペレーティングシステムの仮想CPUを実行するために費やした時間の比率。ゲストがより高い優先度に設定されている場合(`man procfs`を参照)。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。このメトリックはClickHouseには関係ありませんが、完全性のために存在しています。単一のCPUコアの値は[0..1]の区間になります。すべてのCPUコアの値は、それらの合計として計算されます[0..コア数]。

### OSGuestNiceTimeCPU\__N_ {#osguestnicetimecpu_n}

Linuxカーネルの制御下でゲストオペレーティングシステムの仮想CPUを実行するために費やした時間の比率。ゲストがより高い優先度に設定されている場合(`man procfs`を参照)。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。このメトリックはClickHouseには関係ありませんが、完全性のために存在しています。単一のCPUコアの値は[0..1]の区間になります。すべてのCPUコアの値は、それらの合計として計算されます[0..コア数]。

### OSGuestNiceTimeNormalized {#osguestnicetimenormalized}

値は`OSGuestNiceTime`と同様ですが、CPUコア数で除算され、コア数に関係なく[0..1]の区間で測定されます。これにより、コア数が均一でない場合でも、クラスター内の複数のサーバー間でこのメトリックの値を平均化し、平均リソース使用率メトリックを取得できます。

### OSGuestTime {#osguesttime}

Linuxカーネルの制御下でゲストオペレーティングシステムの仮想CPUを実行するために費やした時間の比率(`man procfs`を参照)。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。このメトリックはClickHouseには関係ありませんが、完全性のために存在しています。単一のCPUコアの値は[0..1]の区間になります。すべてのCPUコアの値は、それらの合計として計算されます[0..コア数]。

### OSGuestTimeCPU\__N_ {#osguesttimecpu_n}


Linuxカーネルの制御下でゲストオペレーティングシステムの仮想CPUを実行するために費やされた時間の比率（`man procfs`を参照）。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。このメトリックはClickHouseには無関係ですが、完全性のために存在しています。単一のCPUコアの値は[0..1]の区間になります。すべてのCPUコアの値は、それらの合計として計算されます[0..コア数]。

### OSGuestTimeNormalized {#osguesttimenormalized}

値は`OSGuestTime`と同様ですが、コア数に関係なく[0..1]の区間で測定されるようにCPUコア数で除算されています。これにより、コア数が不均一な場合でも、クラスタ内の複数のサーバー間でこのメトリックの値を平均化し、平均的なリソース使用率メトリックを取得できます。

### OSIOWaitTime {#osiowaittime}

プロセスがIOを待機していたため、CPUコアがコードを実行しておらず、かつOSカーネルがこのCPU上で他のプロセスを実行しなかった時間の比率。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。単一のCPUコアの値は[0..1]の区間になります。すべてのCPUコアの値は、それらの合計として計算されます[0..コア数]。

### OSIOWaitTimeCPU\__N_ {#osiowaittimecpu_n}

プロセスがIOを待機していたため、CPUコアがコードを実行しておらず、かつOSカーネルがこのCPU上で他のプロセスを実行しなかった時間の比率。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。単一のCPUコアの値は[0..1]の区間になります。すべてのCPUコアの値は、それらの合計として計算されます[0..コア数]。

### OSIOWaitTimeNormalized {#osiowaittimenormalized}

値は`OSIOWaitTime`と同様ですが、コア数に関係なく[0..1]の区間で測定されるようにCPUコア数で除算されています。これにより、コア数が不均一な場合でも、クラスタ内の複数のサーバー間でこのメトリックの値を平均化し、平均的なリソース使用率メトリックを取得できます。

### OSIdleTime {#osidletime}

OSカーネルの観点から、CPUコアがアイドル状態（IOを待機しているプロセスを実行する準備さえできていない状態）であった時間の比率。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。これには、CPU内部の理由（メモリロード、パイプラインストール、分岐予測ミス、別のSMTコアの実行）によってCPUが十分に活用されていなかった時間は含まれません。単一のCPUコアの値は[0..1]の区間になります。すべてのCPUコアの値は、それらの合計として計算されます[0..コア数]。

### OSIdleTimeCPU\__N_ {#osidletimecpu_n}

OSカーネルの観点から、CPUコアがアイドル状態（IOを待機しているプロセスを実行する準備さえできていない状態）であった時間の比率。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。これには、CPU内部の理由（メモリロード、パイプラインストール、分岐予測ミス、別のSMTコアの実行）によってCPUが十分に活用されていなかった時間は含まれません。単一のCPUコアの値は[0..1]の区間になります。すべてのCPUコアの値は、それらの合計として計算されます[0..コア数]。

### OSIdleTimeNormalized {#osidletimenormalized}

値は`OSIdleTime`と同様ですが、コア数に関係なく[0..1]の区間で測定されるようにCPUコア数で除算されています。これにより、コア数が不均一な場合でも、クラスタ内の複数のサーバー間でこのメトリックの値を平均化し、平均的なリソース使用率メトリックを取得できます。

### OSInterrupts {#osinterrupts}

ホストマシン上の割り込みの数。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSIrqTime {#osirqtime}

CPU上でハードウェア割り込み要求を実行するために費やされた時間の比率。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。このメトリックの値が高い場合は、ハードウェアの設定ミスまたは非常に高いネットワーク負荷を示している可能性があります。単一のCPUコアの値は[0..1]の区間になります。すべてのCPUコアの値は、それらの合計として計算されます[0..コア数]。


### OSIrqTimeCPU\__N_ {#osirqtimecpu_n}

CPUでハードウェア割り込み要求を実行するために費やされた時間の比率。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。このメトリックの値が高い場合は、ハードウェアの設定ミスまたは非常に高いネットワーク負荷を示している可能性があります。単一のCPUコアの値は[0..1]の区間になります。すべてのCPUコアの値は、それらの合計として計算されます[0..コア数]。

### OSIrqTimeNormalized {#osirqtimenormalized}

値は`OSIrqTime`と同様ですが、コア数に関係なく[0..1]の区間で測定されるようにCPUコア数で除算されています。これにより、コア数が不均一な場合でも、クラスタ内の複数のサーバー間でこのメトリックの値を平均化し、平均的なリソース使用率メトリックを取得できます。

### OSMemoryAvailable {#osmemoryavailable}

プログラムが使用可能なメモリの量(バイト単位)。これは`OSMemoryFreePlusCached`メトリックと非常に似ています。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSMemoryBuffers {#osmemorybuffers}

OSカーネルバッファが使用するメモリの量(バイト単位)。通常、これは小さい値であるべきで、大きな値はOSの設定ミスを示している可能性があります。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSMemoryCached {#osmemorycached}

OSページキャッシュが使用するメモリの量(バイト単位)。通常、利用可能なメモリのほぼすべてがOSページキャッシュによって使用されます。このメトリックの値が高いことは正常であり、想定される動作です。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSMemoryFreePlusCached {#osmemoryfreepluscached}

ホストシステム上の空きメモリとOSページキャッシュメモリの合計量(バイト単位)。このメモリはプログラムが使用可能です。値は`OSMemoryAvailable`と非常に似ているはずです。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSMemoryFreeWithoutCached {#osmemoryfreewithoutcached}

ホストシステム上の空きメモリの量(バイト単位)。これにはOSページキャッシュメモリが使用するメモリは含まれません。ページキャッシュメモリもプログラムが使用可能であるため、このメトリックの値は混乱を招く可能性があります。代わりに`OSMemoryAvailable`メトリックを参照してください。利便性のため、OSMemoryAvailableとある程度似ている`OSMemoryFreePlusCached`メトリックも提供しています。https://www.linuxatemyram.com/ も参照してください。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSMemoryTotal {#osmemorytotal}

ホストシステム上のメモリの総量(バイト単位)。

### OSNiceTime {#osnicetime}

CPUコアが高い優先度でユーザー空間コードを実行していた時間の比率。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。単一のCPUコアの値は[0..1]の区間になります。すべてのCPUコアの値は、それらの合計として計算されます[0..コア数]。

### OSNiceTimeCPU\__N_ {#osnicetimecpu_n}

CPUコアが高い優先度でユーザー空間コードを実行していた時間の比率。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。単一のCPUコアの値は[0..1]の区間になります。すべてのCPUコアの値は、それらの合計として計算されます[0..コア数]。

### OSNiceTimeNormalized {#osnicetimenormalized}

値は`OSNiceTime`と同様ですが、コア数に関係なく[0..1]の区間で測定されるようにCPUコア数で除算されています。これにより、コア数が不均一な場合でも、クラスタ内の複数のサーバー間でこのメトリックの値を平均化し、平均的なリソース使用率メトリックを取得できます。

### OSOpenFiles {#osopenfiles}

ホストマシン上で開かれているファイルの総数。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSProcessesBlocked {#osprocessesblocked}

I/Oの完了を待ってブロックされているスレッドの数(`man procfs`)。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。


### OSProcessesCreated {#osprocessescreated}

作成されたプロセスの数。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSProcessesRunning {#osprocessesrunning}

オペレーティングシステムによる実行可能な(実行中または実行準備完了の)スレッドの数。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSSoftIrqTime {#ossoftirqtime}

CPUでソフトウェア割り込み要求を実行するために費やされた時間の比率。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。このメトリックの値が高い場合、システム上で非効率なソフトウェアが実行されていることを示している可能性があります。単一のCPUコアの値は[0..1]の区間内になります。すべてのCPUコアの値は、それらの合計として計算されます[0..コア数]。

### OSSoftIrqTimeCPU\__N_ {#ossoftirqtimecpu_n}

CPUでソフトウェア割り込み要求を実行するために費やされた時間の比率。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。このメトリックの値が高い場合、システム上で非効率なソフトウェアが実行されていることを示している可能性があります。単一のCPUコアの値は[0..1]の区間内になります。すべてのCPUコアの値は、それらの合計として計算されます[0..コア数]。

### OSSoftIrqTimeNormalized {#ossoftirqtimenormalized}

この値は`OSSoftIrqTime`と同様ですが、CPUコア数で除算され、コア数に関係なく[0..1]の区間で測定されます。これにより、コア数が不均一であっても、クラスタ内の複数のサーバー間でこのメトリックの値を平均化し、平均的なリソース使用率メトリックを取得できます。

### OSStealTime {#osstealtime}

仮想化環境で実行されている際に、CPUが他のオペレーティングシステムで費やした時間の比率。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。すべての仮想化環境がこのメトリックを提供するわけではなく、ほとんどの環境では提供されません。単一のCPUコアの値は[0..1]の区間内になります。すべてのCPUコアの値は、それらの合計として計算されます[0..コア数]。

### OSStealTimeCPU\__N_ {#osstealtimecpu_n}

仮想化環境で実行されている際に、CPUが他のオペレーティングシステムで費やした時間の比率。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。すべての仮想化環境がこのメトリックを提供するわけではなく、ほとんどの環境では提供されません。単一のCPUコアの値は[0..1]の区間内になります。すべてのCPUコアの値は、それらの合計として計算されます[0..コア数]。

### OSStealTimeNormalized {#osstealtimenormalized}

この値は`OSStealTime`と同様ですが、CPUコア数で除算され、コア数に関係なく[0..1]の区間で測定されます。これにより、コア数が不均一であっても、クラスタ内の複数のサーバー間でこのメトリックの値を平均化し、平均的なリソース使用率メトリックを取得できます。

### OSSystemTime {#ossystemtime}

CPUコアがOSカーネル(システム)コードを実行していた時間の比率。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。単一のCPUコアの値は[0..1]の区間内になります。すべてのCPUコアの値は、それらの合計として計算されます[0..コア数]。

### OSSystemTimeCPU\__N_ {#ossystemtimecpu_n}

CPUコアがOSカーネル(システム)コードを実行していた時間の比率。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスを含みます。単一のCPUコアの値は[0..1]の区間内になります。すべてのCPUコアの値は、それらの合計として計算されます[0..コア数]。

### OSSystemTimeNormalized {#ossystemtimenormalized}

この値は`OSSystemTime`と同様ですが、CPUコア数で除算され、コア数に関係なく[0..1]の区間で測定されます。これにより、コア数が不均一であっても、クラスタ内の複数のサーバー間でこのメトリックの値を平均化し、平均的なリソース使用率メトリックを取得できます。

### OSThreadsRunnable {#osthreadsrunnable}

OSカーネルスケジューラが認識する「実行可能」スレッドの総数。

### OSThreadsTotal {#osthreadstotal}


OSカーネルスケジューラが認識するスレッドの総数。

### OSUptime {#osuptime}

ホストサーバー(ClickHouseが実行されているマシン)の稼働時間(秒単位)。

### OSUserTime {#osusertime}

CPUコアがユーザー空間コードを実行していた時間の比率。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスが含まれます。また、CPU内部の要因(メモリロード、パイプラインストール、分岐予測ミス、別のSMTコアの実行)によってCPUが十分に活用されていなかった時間も含まれます。単一のCPUコアの値は[0..1]の区間になります。すべてのCPUコアの値は、それらの合計として計算されます[0..コア数]。

### OSUserTimeCPU\__N_ {#osusertimecpu_n}

CPUコアがユーザー空間コードを実行していた時間の比率。これはシステム全体のメトリックであり、clickhouse-serverだけでなく、ホストマシン上のすべてのプロセスが含まれます。また、CPU内部の要因(メモリロード、パイプラインストール、分岐予測ミス、別のSMTコアの実行)によってCPUが十分に活用されていなかった時間も含まれます。単一のCPUコアの値は[0..1]の区間になります。すべてのCPUコアの値は、それらの合計として計算されます[0..コア数]。

### OSUserTimeNormalized {#osusertimenormalized}

この値は`OSUserTime`と同様ですが、CPUコア数で除算されており、コア数に関係なく[0..1]の区間で測定されます。これにより、コア数が均一でない場合でも、クラスタ内の複数のサーバー間でこのメトリックの値を平均化し、平均的なリソース使用率メトリックを取得できます。

### PostgreSQLThreads {#postgresqlthreads}

PostgreSQL互換プロトコルのサーバー内のスレッド数。

### ReplicasMaxAbsoluteDelay {#replicasmaxabsolutedelay}

Replicatedテーブル全体における、最新のレプリケート済みパートと、まだレプリケートされていない最新のデータパートとの間の最大差(秒単位)。非常に高い値は、データのないレプリカを示します。

### ReplicasMaxInsertsInQueue {#replicasmaxinsertsinqueue}

Replicatedテーブル全体における、キュー内の(まだレプリケートされていない)INSERT操作の最大数。

### ReplicasMaxMergesInQueue {#replicasmaxmergesinqueue}

Replicatedテーブル全体における、キュー内の(まだ適用されていない)マージ操作の最大数。

### ReplicasMaxQueueSize {#replicasmaxqueuesize}

Replicatedテーブル全体における、最大キューサイズ(get、mergeなどの操作数)。

### ReplicasMaxRelativeDelay {#replicasmaxrelativedelay}

Replicatedテーブル全体における、レプリカの遅延と同じテーブルの最新レプリカの遅延との間の最大差。

### ReplicasSumInsertsInQueue {#replicassuminsertsinqueue}

Replicatedテーブル全体における、キュー内の(まだレプリケートされていない)INSERT操作の合計数。

### ReplicasSumMergesInQueue {#replicassummergesinqueue}

Replicatedテーブル全体における、キュー内の(まだ適用されていない)マージ操作の合計数。

### ReplicasSumQueueSize {#replicassumqueuesize}

Replicatedテーブル全体における、キューサイズの合計(get、mergeなどの操作数)。

### TCPThreads {#tcpthreads}

TCPプロトコル(TLSなし)のサーバー内のスレッド数。

### Temperature\__N_ {#temperature_n}

対応するデバイスの温度(℃)。センサーは非現実的な値を返すことがあります。ソース: `/sys/class/thermal`

### Temperature\__name_ {#temperature_name}

対応するハードウェアモニターと対応するセンサーによって報告される温度(℃)。センサーは非現実的な値を返すことがあります。ソース: `/sys/class/hwmon`

### TotalBytesOfMergeTreeTables {#totalbytesofmergetreetables}

MergeTreeファミリーのすべてのテーブルに格納されているバイトの総量(圧縮済み、データとインデックスを含む)。

### TotalPartsOfMergeTreeTables {#totalpartsofmergetreetables}

MergeTreeファミリーのすべてのテーブルにおけるデータパートの総数。10,000を超える数値はサーバーの起動時間に悪影響を及ぼし、パーティションキーの選択が不適切であることを示す可能性があります。

### TotalPrimaryKeyBytesInMemory {#totalprimarykeybytesinmemory}

プライマリキー値によって使用されるメモリの総量(バイト単位)(アクティブなパートのみを考慮)。

### TotalPrimaryKeyBytesInMemoryAllocated {#totalprimarykeybytesinmemoryallocated}

プライマリキー値のために予約されているメモリの総量(バイト単位)(アクティブなパートのみを考慮)。


### TotalRowsOfMergeTreeTables {#totalrowsofmergetreetables}

MergeTreeファミリーの全テーブルに格納されている行(レコード)の総数。

### Uptime {#uptime}

サーバーの稼働時間(秒単位)。接続を受け付ける前のサーバー初期化に要した時間を含みます。

### jemalloc.active {#jemallocactive}

低レベルメモリアロケータ(jemalloc)の内部メトリック。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.allocated {#jemallocallocated}

低レベルメモリアロケータ(jemalloc)の内部メトリック。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.dirty_purged {#jemallocarenasalldirty_purged}

低レベルメモリアロケータ(jemalloc)の内部メトリック。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.muzzy_purged {#jemallocarenasallmuzzy_purged}

低レベルメモリアロケータ(jemalloc)の内部メトリック。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.pactive {#jemallocarenasallpactive}

低レベルメモリアロケータ(jemalloc)の内部メトリック。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.pdirty {#jemallocarenasallpdirty}

低レベルメモリアロケータ(jemalloc)の内部メトリック。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.pmuzzy {#jemallocarenasallpmuzzy}

低レベルメモリアロケータ(jemalloc)の内部メトリック。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.background_thread.num_runs {#jemallocbackground_threadnum_runs}

低レベルメモリアロケータ(jemalloc)の内部メトリック。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.background_thread.num_threads {#jemallocbackground_threadnum_threads}

低レベルメモリアロケータ(jemalloc)の内部メトリック。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.background_thread.run_intervals {#jemallocbackground_threadrun_intervals}

低レベルメモリアロケータ(jemalloc)の内部メトリック。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.epoch {#jemallocepoch}

jemalloc(Jason Evansのメモリアロケータ)の統計情報の内部増分更新番号。他のすべての`jemalloc`メトリックで使用されます。

### jemalloc.mapped {#jemallocmapped}

低レベルメモリアロケータ(jemalloc)の内部メトリック。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.metadata {#jemallocmetadata}

低レベルメモリアロケータ(jemalloc)の内部メトリック。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.metadata_thp {#jemallocmetadata_thp}

低レベルメモリアロケータ(jemalloc)の内部メトリック。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.resident {#jemallocresident}

低レベルメモリアロケータ(jemalloc)の内部メトリック。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.retained {#jemallocretained}

低レベルメモリアロケータ(jemalloc)の内部メトリック。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.prof.active {#jemallocprofactive}

低レベルメモリアロケータ(jemalloc)の内部メトリック。https://jemalloc.net/jemalloc.3.html を参照してください。

**関連項目**

- [Monitoring](../../operations/monitoring.md) — ClickHouseモニタリングの基本概念。
- [system.metrics](/operations/system-tables/metrics) — 即座に計算されたメトリックを含みます。
- [system.events](/operations/system-tables/events) — 発生したイベントの数を含みます。
- [system.metric_log](/operations/system-tables/metric_log) — `system.metrics`と`system.events`テーブルからのメトリック値の履歴を含みます。
