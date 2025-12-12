---
description: 'バックグラウンドで定期的に計算されるメトリクスを格納する system テーブルです。たとえば、使用中の RAM 量などがあります。'
keywords: ['システムテーブル', 'asynchronous_metrics']
slug: /operations/system-tables/asynchronous_metrics
title: 'system.asynchronous_metrics'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.asynchronous&#95;metrics {#systemasynchronous_metrics}

<SystemTableCloud />

バックグラウンドで定期的に計算されるメトリクスを含みます。例えば、RAM の使用量などです。

列:

* `metric` ([String](../../sql-reference/data-types/string.md)) — メトリクス名。
* `value` ([Float64](../../sql-reference/data-types/float.md)) — メトリクス値。
* `description` ([String](../../sql-reference/data-types/string.md)) — メトリクスの説明。

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

{/*- system.events や system.metrics の場合とは異なり、非同期メトリクスは単純なリストとして 1 つのソースコードファイルにまとめられているわけではなく、
      src/Interpreters/ServerAsynchronousMetrics.cpp 内のロジックと混在しています。
      読者の利便性のため、ここで明示的に一覧を示します。 -*/ }


## メトリクスの説明 {#metric-descriptions}

### AsynchronousHeavyMetricsCalculationTimeSpent {#asynchronousheavymetricscalculationtimespent}

テーブル関連の重い非同期メトリクスの計算に費やされた時間（秒）。これは非同期メトリクスによるオーバーヘッドです。

### AsynchronousHeavyMetricsUpdateInterval {#asynchronousheavymetricsupdateinterval}

重い（テーブル関連）メトリクスの更新間隔

### AsynchronousMetricsCalculationTimeSpent {#asynchronousmetricscalculationtimespent}

非同期メトリクスの計算に要した時間（秒）。非同期メトリクスに伴うオーバーヘッドを表します。

### AsynchronousMetricsUpdateInterval {#asynchronousmetricsupdateinterval}

メトリクス更新間隔

### BlockActiveTime_*name* {#blockactivetime_name}

ブロックデバイスに対する IO リクエストがキューに滞留していた時間（秒単位）。これはシステム全体に関するメトリクスであり、clickhouse-server に限らずホストマシン上のすべてのプロセスが対象です。参照元: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockDiscardBytes_*name* {#blockdiscardbytes_name}

ブロックデバイス上で破棄されたバイト数です。これらの操作は SSD に対して有効です。Discard 操作は ClickHouse では使用されませんが、システム上の他のプロセスで使用される場合があります。これはシステム全体のメトリクスであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスが対象となります。出典: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockDiscardMerges_*name* {#blockdiscardmerges_name}

ブロックデバイスに対して要求された discard 操作のうち、OS の I/O スケジューラによってマージされた操作の数です。これらの操作は SSD に関連するものです。discard 操作は ClickHouse 自体では使用しませんが、システム上の他のプロセスで使用される場合があります。これはシステム全体にわたるメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが対象となります。出典: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockDiscardOps_*name* {#blockdiscardops_name}

ブロックデバイスに対して要求された discard 操作の数。これらの操作は SSD に関連があります。Discard 操作は ClickHouse 自体では使用されませんが、システム上の他のプロセスで使用される可能性があります。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。出典: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockDiscardTime_*name* {#blockdiscardtime_name}

ブロックデバイスに対して要求された Discard 操作に費やされた時間（秒）で、すべての操作の合計です。これらの操作は SSD に関係します。Discard 操作は ClickHouse では使用しませんが、システム上の他のプロセスで使用されることがあります。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが対象になります。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt も参照してください。

### BlockInFlightOps_*name* {#blockinflightops_name}

この値は、デバイスドライバに発行されたものの、まだ完了していない I/O リクエストの数を表します。デバイスドライバにまだ発行されておらず、キュー内にある I/O リクエストは含まれません。これはシステム全体のメトリクスであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスが対象となります。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt も参照してください。

### BlockQueueTime_*name* {#blockqueuetime_name}

この値は、このブロックデバイスに対する I/O リクエストが待機していたミリ秒数の合計をカウントします。複数の I/O リクエストが待機している場合、この値は「ミリ秒数 × 待機リクエスト数」の積として増加します。これはシステム全体にわたるメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが対象となります。出典: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockReadBytes_*name* {#blockreadbytes_name}

ブロックデバイスから読み取られたバイト数。OS のページキャッシュを使用して I/O を削減するため、ファイルシステムから読み取られたバイト数より少ない場合があります。これはシステム全体にわたるメトリックであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。出典: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockReadMerges_*name* {#blockreadmerges_name}

ブロックデバイスに対して要求され、OS の I/O スケジューラによってマージされた読み取り処理の回数です。これはシステム全体のメトリクスであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスが対象になります。出典: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockReadOps_*name* {#blockreadops_name}

ブロックデバイスに対して要求された読み取り操作の回数。このメトリクスはシステム全体のものであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスが対象です。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockReadTime_*name* {#blockreadtime_name}

ブロックデバイスに対して要求されたすべての読み取り操作に費やされた時間の合計（秒）です。これはシステム全体のメトリクスであり、`clickhouse-server` だけでなくホストマシン上のすべてのプロセスが対象となります。出典: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockWriteBytes_*name* {#blockwritebytes_name}

ブロックデバイスに書き込まれたバイト数。OS のページキャッシュの利用により I/O が節約されるため、ファイルシステムに書き込まれたバイト数より少なくなる場合があります。ブロックデバイスへの書き込みは、ライトスルー型のキャッシュのために、対応するファイルシステムへの書き込みよりも後で発生することがあります。これはシステム全体のメトリクスであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスが含まれます。出典: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockWriteMerges_*name* {#blockwritemerges_name}

ブロックデバイスへの書き込み要求が、OS の I/O スケジューラによってマージされた回数。このメトリクスはシステム全体の値であり、clickhouse-server だけでなくホストマシン上のすべてのプロセスを含みます。ソース: `/sys/block`。参照: https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockWriteOps_*name* {#blockwriteops_name}

ブロックデバイスに対して要求された書き込み操作の回数。このメトリクスはシステム全体のものであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。出典: `/sys/block`。詳細は https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockWriteTime_*name* {#blockwritetime_name}

ブロックデバイスに対して発行された書き込み処理に費やされた合計時間（秒）です。すべての処理を合算した値であり、システム全体のメトリクスです。ホストマシン上のすべてのプロセスが対象であり、clickhouse-server だけには限定されません。出典: `/sys/block`。詳細は https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### CPUFrequencyMHz_*name* {#cpufrequencymhz_name}

CPU の現在の周波数（MHz 単位）。ほとんどの最新の CPU では、省電力やターボブーストのために周波数が動的に調整されます。

### DictionaryMaxUpdateDelay {#dictionarymaxlastsuccessfulupdatetime}

Dictionary の更新の最大遅延（秒）。

### DictionaryTotalFailedUpdates {#dictionaryloadfailed}

すべての Dictionary において、最後に正常にロードされて以降に発生したエラーの数。

### DiskAvailable_*name* {#diskavailable_name}

ディスク（仮想ファイルシステム）上で利用可能なバイト数。リモートファイルシステムでは、16 EiB のような非常に大きな値が表示される場合があります。

### DiskTotal_*name* {#disktotal_name}

ディスク（仮想ファイルシステム）の合計サイズ（バイト単位）です。リモートファイルシステムでは、16 EiB のような非常に大きな値が表示される場合があります。

### DiskUnreserved_*name* {#diskunreserved_name}

マージ、フェッチ、および移動用に予約されている領域を除いた、ディスク（仮想ファイルシステム）上の利用可能なバイト数。リモートファイルシステムでは、16 EiB のような非常に大きな値が表示されることがあります。

### DiskUsed_*name* {#diskused_name}

ディスク（仮想ファイルシステム）上で使用されているバイト数。リモートファイルシステムでは、この情報が常に提供されるとは限りません。

### FilesystemCacheBytes {#filesystemcachebytes}

`cache` 仮想ファイルシステム内の合計バイト数。このキャッシュはディスク上に保存されます。

### FilesystemCacheFiles {#filesystemcachefiles}

`cache` 仮想ファイルシステム内にキャッシュされているファイルセグメントの総数です。このキャッシュはディスク上に保持されます。

### FilesystemLogsPathAvailableBytes {#filesystemlogspathavailablebytes}

ClickHouse のログパスがマウントされているボリューム上で使用可能なバイト数です。この値がゼロに近づいている場合は、設定ファイルでログローテーションを調整する必要があります。

### FilesystemLogsPathAvailableINodes {#filesystemlogspathavailableinodes}

ClickHouse のログパスがマウントされているボリューム上で利用可能な inode 数。

### FilesystemLogsPathTotalBytes {#filesystemlogspathtotalbytes}

ClickHouse のログのパスがマウントされているボリュームのサイズ（バイト単位）です。ログ用には少なくとも 10 GB を確保することを推奨します。

### FilesystemLogsPathTotalINodes {#filesystemlogspathtotalinodes}

ClickHouse のログパスがマウントされているボリューム上の inode の総数です。

### FilesystemLogsPathUsedBytes {#filesystemlogspathusedbytes}

ClickHouse のログパスがマウントされているボリュームで使用中のバイト数。

### FilesystemLogsPathUsedINodes {#filesystemlogspathusedinodes}

ClickHouse のログのパスがマウントされているボリュームで使用中の inode 数。

### FilesystemMainPathAvailableBytes {#filesystemmainpathavailablebytes}

ClickHouse のメインパスがマウントされているボリュームで利用可能なバイト数。

### FilesystemMainPathAvailableINodes {#filesystemmainpathavailableinodes}

メインの ClickHouse パスがマウントされているボリューム上で利用可能な inode の数です。値がゼロに近い場合は設定の誤りを示しており、ディスクが満杯でなくても「no space left on device」というエラーが発生します。

### FilesystemMainPathTotalBytes {#filesystemmainpathtotalbytes}

ClickHouse のメインパスがマウントされているボリュームの容量（バイト単位）。

### FilesystemMainPathTotalINodes {#filesystemmainpathtotalinodes}

メインの ClickHouse パスがマウントされているボリューム上の inode の総数です。2,500 万未満の場合は、設定ミスであることを示します。

### FilesystemMainPathUsedBytes {#filesystemmainpathusedbytes}

ClickHouse のメインパスがマウントされているボリューム上で使用されているバイト数です。

### FilesystemMainPathUsedINodes {#filesystemmainpathusedinodes}

メインの ClickHouse パスがマウントされているボリューム上で使用されている inode の数。この値は主にファイル数に対応します。

### HTTPThreads {#httpthreads}

HTTP インターフェイスサーバーのスレッド数（TLS なし）。

### InterserverThreads {#interserverthreads}

レプリカ間通信プロトコル用サーバーにおけるスレッド数（TLS を使用しない）。

### ジッター {#jitter}

非同期メトリクスを計算するスレッドがウェイクアップするようにスケジュールされた時刻と、実際にウェイクアップした時刻との差。システム全体のレイテンシーおよび応答性を示すプロキシ指標です。

### LoadAverage*N* {#loadaveragen}

システム全体の負荷を、1 分間の指数平滑による平均値として表したものです。ここでいう負荷とは、すべてのプロセス（OS カーネルのスケジューリング単位）に属するスレッドの数であり、現在 CPU で実行中か、I/O 待ち、もしくは実行可能だが現時点ではスケジュールされていないものを指します。この数値には、clickhouse-server だけでなく、すべてのプロセスが含まれます。システムが過負荷になり、多数のプロセスが実行可能だが CPU または I/O を待っている場合、この数値は CPU コア数を上回ることがあります。

### MaxPartCountForPartition {#maxpartcountforpartition}

MergeTree ファミリーに属するすべてのテーブルにおける、すべてのパーティションを対象とした 1 パーティションあたりの最大パーツ数。300 を超える値は、誤った設定、過負荷、または大量のデータロードを示します。

### MemoryCode {#memorycode}

サーバープロセスの機械語コードページ用にマップされている仮想メモリ量（バイト単位）。

### MemoryDataAndStack {#memorydataandstack}

スタックおよび割り当て済みメモリ用にマップされた仮想メモリ量（バイト単位）。スレッドごとのスタックや、`mmap` システムコールで割り当てられる大部分のメモリを含むかどうかは定義されていません。このメトリクスは、指標の網羅性を保つためだけに存在します。監視には `MemoryResident` メトリクスを使用することを推奨します。

### MemoryResidentMax {#memoryresidentmax}

サーバープロセスが使用する物理メモリの最大量（バイト単位）。

### MemoryResident {#memoryresident}

サーバープロセスが使用している物理メモリの量（バイト単位）。

### MemoryShared {#memoryshared}

サーバープロセスによって使用されているメモリ量のうち、他のプロセスとも共有されている部分をバイト単位で表します。ClickHouse は共有メモリを使用しませんが、一部のメモリが OS の都合により共有としてラベル付けされることがあります。このメトリクスは監視してもあまり意味がなく、完全性を保つためだけに存在しています。

### MemoryVirtual {#memoryvirtual}

サーバープロセスによって割り当てられた仮想アドレス空間のサイズ（バイト単位）。仮想アドレス空間のサイズは通常、物理メモリ消費量よりもはるかに大きく、実際のメモリ使用量の推定には使用すべきではありません。このメトリクスの値が大きいことはごく正常であり、技術的な意味を持つに過ぎません。

### MySQLThreads {#mysqlthreads}

MySQL 互換プロトコルサーバーのスレッド数。

### NetworkReceiveBytes_*name* {#networkreceivebytes_name}

ネットワークインターフェイス経由で受信したバイト数。これはシステム全体のメトリックであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスが対象となります。

### NetworkReceiveDrop_*name* {#networkreceivedrop_name}

ネットワークインターフェイス経由で受信中にドロップされたパケットのバイト数。このメトリクスはシステム全体に関するものであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。

### NetworkReceiveErrors_*name* {#networkreceiveerrors_name}

ネットワークインターフェイス経由での受信時に発生したエラーの回数。これはシステム全体にわたるメトリクスであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスが対象です。

### NetworkReceivePackets_*name* {#networkreceivepackets_name}

ネットワークインターフェイス経由で受信したネットワークパケットの数です。このメトリクスはシステム全体に対するものであり、ホストマシン上のすべてのプロセス（clickhouse-server だけでなく）を対象とします。

### NetworkSendBytes_*name* {#networksendbytes_name}

ネットワークインターフェイス経由で送信されたバイト数を表します。これはシステム全体に関するメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが対象になります。

### NetworkSendDrop_*name* {#networksenddrop_name}

ネットワークインターフェイス経由で送信中にパケットがドロップされた回数。これはシステム全体にわたるメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが対象となります。

### NetworkSendErrors_*name* {#networksenderrors_name}

ネットワークインターフェイス経由で送信中にエラー（例: TCP 再送信）が発生した回数。このメトリクスはシステム全体のもので、ホストマシン上のすべてのプロセスが対象であり、clickhouse-server に限定されません。

### NetworkSendPackets_*name* {#networksendpackets_name}

ネットワークインターフェイス経由で送信されたネットワークパケットの数。このメトリクスはシステム全体にわたるものであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが対象です。

### NumberOfDatabases {#numberofdatabases}

サーバー上のデータベースの総数。

### NumberOfDetachedByUserParts {#numberofdetachedbyuserparts}

`ALTER TABLE DETACH` クエリを使用してユーザーが MergeTree テーブルから切り離したパーツの総数です（予期しないパーツや破損したパーツ、無視されたパーツとは対照的です）。サーバーは切り離されたパーツを扱わないため、それらは削除してもかまいません。

### NumberOfDetachedParts {#numberofdetachedparts}

MergeTree テーブルから切り離されたパーツの総数です。パーツは、`ALTER TABLE DETACH` クエリを使用してユーザーが切り離すことも、パーツが破損している、想定外である、または不要である場合にサーバーが自動的に切り離すこともあります。サーバーは切り離されたパーツを扱わないため、これらは削除できます。

### NumberOfTables {#numberoftables}

サーバー上のデータベース全体で合計したテーブル数であり、MergeTree テーブルを含むことができないデータベースを除外した値です。除外されるデータベースエンジンには、`Lazy`、`MySQL`、`PostgreSQL`、`SQlite` のように、オンデマンドでテーブルの集合を生成するものが含まれます。

### OSContextSwitches {#oscontextswitches}

ホストマシン上でシステムが行ったコンテキストスイッチの回数です。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが対象になります。

### OSGuestNiceTime {#osguestnicetime}

Linux カーネルの管理下で、ゲスト OS の仮想 CPU が高い優先度に設定されて実行されていた時間の比率（`man procfs` を参照）。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスを含む。ClickHouse にとっては特に意味のないメトリクスだが、網羅性のために定義されている。単一の CPU コアに対する値は [0..1] の範囲となる。すべての CPU コアに対する値は、それらを合計した [0..num cores] の範囲で計算される。

### OSGuestNiceTimeCPU_*N* {#osguestnicetimecpu_n}

Linux カーネルの制御下で、ゲスト OS 用の仮想 CPU を、ゲスト OS が高い優先度に設定されている状態で実行していた時間の比率（`man procfs` を参照）。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。ClickHouse にとっては無関係なメトリクスですが、網羅性のために掲載されています。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、それぞれのコアの値を合計して計算され、[0..num cores] の範囲になります。

### OSGuestNiceTimeNormalized {#osguestnicetimenormalized}

この値は `OSGuestNiceTime` と同様ですが、CPU コア数で割った値であり、コア数に依存せず [0..1] の範囲で測定できるようにしたものです。これにより、コア数が揃っていないクラスター内の複数サーバー間でも本メトリクスの値を平均化でき、平均的なリソース利用状況を表すメトリクスを取得できます。

### OSGuestTime {#osguesttime}

Linux カーネルの制御下で、ゲスト OS 向けに仮想 CPU を実行していた時間の比率です（`man procfs` を参照）。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。このメトリクスは ClickHouse 固有のものではありませんが、網羅性のために定義されています。1 つの CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、各コアの値を合計して [0..num cores] の範囲で計算されます。

### OSGuestTimeCPU_*N* {#osguesttimecpu_n}

Linux カーネルの制御下で、ゲスト OS 向けに仮想 CPU を実行することに費やされた時間の割合です（`man procfs` を参照）。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが対象になります。ClickHouse にとっては本質的に関係のないメトリクスですが、指標の網羅性のために提供されています。単一の CPU コアあたりの値は [0..1] の範囲になります。すべての CPU コアについては、それらを合計した値として [0..num cores] の範囲で計算されます。

### OSGuestTimeNormalized {#osguesttimenormalized}

この値は `OSGuestTime` と同様ですが、CPU コア数で割ることで、コア数に依存せず [0..1] の範囲で測定できるようにしたものです。これにより、コア数が不均一なクラスタ内の複数サーバ間でもこのメトリクスの値を平均化でき、平均的なリソース使用率を表すメトリクスを得ることができます。

### OSIOWaitTime {#osiowaittime}

CPU コアがコードを実行しておらず、かつプロセスが IO 待ちのために OS カーネルもその CPU 上で他のプロセスを実行していなかった時間の比率です。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、それらを合計した [0..num cores] の範囲の値として計算されます。

### OSIOWaitTimeCPU_*N* {#osiowaittimecpu_n}

CPU コアがコードを実行しておらず、プロセスが I/O を待機しているために OS カーネルもこの CPU 上で他のプロセスを実行していなかった時間の比率です。これはシステム全体で集計されるメトリクスであり、ClickHouse サーバーだけでなくホストマシン上のすべてのプロセスが含まれます。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、各コアの値を合計したものであり、[0..コア数] の範囲になります。

### OSIOWaitTimeNormalized {#osiowaittimenormalized}

この値は `OSIOWaitTime` と同様ですが、CPU コア数で割ることで、コア数に依存せず 0〜1 の範囲で測定できるようにしたものです。これにより、コア数が揃っていないクラスター内の複数サーバー間でもこのメトリクスの値を平均化でき、リソース使用率の平均的なメトリクスを得ることができます。

### OSIdleTime {#osidletime}

OS カーネルの観点から見た、CPU コアがアイドル状態（I/O 待ちで実行待機しているプロセスすら存在しない状態）であった時間の割合です。これはシステム全体のメトリクスであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスを含みます。また、CPU 内部の要因（メモリロード、パイプラインストール、分岐予測ミス、別の SMT コアの実行）によって CPU の利用率が低下していた時間は含みません。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、それらを合計したものとして [0..CPU コア数] の範囲で計算されます。

### OSIdleTimeCPU_*N* {#osidletimecpu_n}

OS カーネルの観点から見た、CPU コアがアイドル状態（I/O 待ちのプロセスを実行する準備すらしていない状態）にあった時間の比率です。これはシステム全体のメトリクスであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスを含みます。一方で、CPU の内部要因（メモリアクセス、パイプラインのストール、分岐予測ミス、別の SMT コアの実行など）によって CPU が十分に活用されていなかった時間は含みません。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、それら全体にわたる合計として計算され、[0..num cores] の範囲になります。

### OSIdleTimeNormalized {#osidletimenormalized}

この値は `OSIdleTime` と同様ですが、CPU コア数で割った値であり、コア数に依存せず 0〜1 の範囲で測定されます。これにより、コア数が不均一なクラスター内の複数サーバー間でも、このメトリクスの値を平均化して、平均的なリソース利用率メトリクスを取得できます。

### OSInterrupts {#osinterrupts}

ホストマシン上で発生した割り込みの総数です。これはシステム全体に関するメトリクスであり、`clickhouse-server` だけでなく、ホストマシン上のすべてのプロセスによるものが含まれます。

### OSIrqTime {#osirqtime}

CPU 上でハードウェア割り込み要求を処理するのに費やされた時間の割合です。これはシステム全体に関するメトリクスであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスが対象となります。このメトリクスが高い場合、ハードウェア構成の不備や非常に高いネットワーク負荷を示している可能性があります。単一 CPU コアの値は [0..1] の範囲になります。すべての CPU コアに対する値は、各コアの値を合計した [0..num cores] の範囲で計算されます。

### OSIrqTimeCPU_*N* {#osirqtimecpu_n}

CPU 上でハードウェア割り込み要求を処理するのに費やされた時間の割合です。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスを含みます。このメトリクスの値が高い場合、ハードウェアの誤設定や非常に高いネットワーク負荷を示している可能性があります。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、それらの合計として計算され、[0..num cores] の範囲になります。

### OSIrqTimeNormalized {#osirqtimenormalized}

この値は `OSIrqTime` と同様ですが、CPU コア数で割った値であり、コア数に関係なく [0..1] の範囲で計測できるようにしたものです。これにより、コア数が均一でないクラスター内の複数サーバー間でもこのメトリクスの値を平均化でき、平均的なリソース使用率を表す指標を得ることができます。

### OSMemoryAvailable {#osmemoryavailable}

プログラムが使用可能なメモリ量（バイト単位）。`OSMemoryFreePlusCached` メトリクスと非常によく似ています。これはシステム全体のメトリクスであり、clickhouse-server だけでなく、ホストマシン上で動作するすべてのプロセスが対象となります。

### OSMemoryBuffers {#osmemorybuffers}

OS カーネルバッファで使用されているメモリ量（バイト単位）。通常は小さい値になるはずであり、大きな値は OS の誤設定を示している可能性があります。これはシステム全体のメトリクスであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスを対象とします。

### OSMemoryCached {#osmemorycached}

OS のページキャッシュによって使用されているメモリ量（バイト単位）です。通常、利用可能なメモリのほぼすべてが OS のページキャッシュとして使用されるため、このメトリクスの値が高いことは正常かつ想定どおりの状態です。これはシステム全体のメトリクスであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスを含みます。

### OSMemoryFreePlusCached {#osmemoryfreepluscached}

ホストシステム上の空きメモリ量と OS ページキャッシュメモリ量の合計（バイト単位）。このメモリはプログラムが利用できるメモリです。値は `OSMemoryAvailable` と非常に近い値になるはずです。これはシステム全体に対するメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが対象に含まれます。

### OSMemoryFreeWithoutCached {#osmemoryfreewithoutcached}

ホストシステム上の空きメモリ量（バイト単位）。これは OS のページキャッシュメモリとして使用されているメモリ量を含みません。ページキャッシュメモリはプログラムからも利用可能であるため、このメトリクスの値は分かりにくい場合があります。代わりに `OSMemoryAvailable` メトリクスを参照してください。利便性のため、`OSMemoryFreePlusCached` メトリクスも提供しており、これは OSMemoryAvailable とおおよそ同様の値になるはずです。https://www.linuxatemyram.com/ も参照してください。これはシステム全体に関するメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスを含みます。

### OSMemoryTotal {#osmemorytotal}

ホストシステムに搭載されているメモリの総量（バイト単位）。

### OSNiceTime {#osnicetime}

CPU コアが優先度の高いユーザ空間コードを実行していた時間の比率です。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスを含みます。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、それらを合計したものとして [0..num cores] の範囲になります。

### OSNiceTimeCPU_*N* {#osnicetimecpu_n}

CPU コアが高い優先度でユーザー空間コードを実行していた時間の比率です。これはシステム全体に対するメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが対象となります。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、各コアの値を合計したものであり、範囲は [0..num cores] になります。

### OSNiceTimeNormalized {#osnicetimenormalized}

この値は `OSNiceTime` と同様ですが、CPU コア数で割ることで、コア数に依存せず [0..1] の範囲で測定できるようにした指標です。これにより、サーバーごとにコア数が異なるクラスター環境でも、このメトリクスの値を複数サーバー間で平均化でき、平均的なリソース使用率を表すメトリクスを取得できます。

### OSOpenFiles {#osopenfiles}

ホストマシン上で開かれているファイルの総数です。これはシステム全体に関するメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが対象です。

### OSProcessesBlocked {#osprocessesblocked}

I/O 完了を待ってブロックされているスレッド数（`man procfs` を参照）。これはシステム全体に関するメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。

### OSProcessesCreated {#osprocessescreated}

作成されたプロセスの数です。これはシステム全体にわたるメトリクスで、ホストマシン上のすべてのプロセスが対象であり、`clickhouse-server` だけに限定されません。

### OSProcessesRunning {#osprocessesrunning}

オペレーティングシステムによって実行可能（実行中または実行待ち）とされているスレッド数です。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセスを含み、clickhouse-server だけに限定されません。

### OSSoftIrqTime {#ossoftirqtime}

CPU 上でソフトウェア割り込み要求の処理に費やされた時間の割合です。これはシステム全体にわたるメトリクスであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスが含まれます。このメトリクスの値が高い場合は、システム上で非効率なソフトウェアが動作している可能性があります。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、それらを合計した [0..num cores] の範囲で計算されます。

### OSSoftIrqTimeCPU_*N* {#ossoftirqtimecpu_n}

CPU 上でソフトウェア割り込み要求 (softirq) の処理に費やされた時間の割合です。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが対象となります。このメトリクスの値が高い場合は、システム上で非効率なソフトウェアが動作している可能性を示します。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、それらを合計した [0..コア数] の範囲になります。

### OSSoftIrqTimeNormalized {#ossoftirqtimenormalized}

この値は `OSSoftIrqTime` と同様ですが、CPU コア数で割ることで、コア数に依存せず [0..1] の範囲で表現されるようにしたものです。これにより、クラスタ内でコア数が不均一な複数サーバー間でも、このメトリクスの値を平均して、リソース使用率の平均を表すメトリクスを得ることができます。

### OSStealTime {#osstealtime}

仮想化環境で動作している際に、CPU 時間のうち他のオペレーティングシステムに割り当てられている時間の比率です。これはシステム全体のメトリクスであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスが対象となります。このメトリクスを提供しない仮想化環境も多く、ほとんどの環境では利用できません。単一の CPU コアに対する値は区間 [0..1] の範囲になります。すべての CPU コアに対する値は、各コアの値を合計したもので [0..num cores] の範囲になります。

### OSStealTimeCPU_*N* {#osstealtimecpu_n}

仮想化環境で動作しているときに、CPU が他のオペレーティングシステムに費やした時間の割合です。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが対象となります。すべての仮想化環境でこのメトリクスが提供されているわけではなく、多くの環境では提供されていません。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、それらを合計した [0..num cores] の範囲となるように計算されます。

### OSStealTimeNormalized {#osstealtimenormalized}

この値は `OSStealTime` と同様ですが、CPU コア数で割ったものであり、コア数に依存せず [0..1] の範囲で測定されます。これにより、クラスター内でコア数が不均一な複数サーバー間でも、このメトリクスの値を平均化し、平均的なリソース使用率の指標を得ることができます。

### OSSystemTime {#ossystemtime}

CPU コアが OS カーネル（システム）コードを実行していた時間の比率です。これはホストマシン上のすべてのプロセスを含むシステム全体のメトリクスであり、clickhouse-server だけを対象にしたものではありません。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、各コアの値を合計したもので [0..コア数] の範囲になります。

### OSSystemTimeCPU_*N* {#ossystemtimecpu_n}

CPU コアが OS カーネル（system）コードを実行していた時間の比率です。これはホストマシン上のすべてのプロセス（`clickhouse-server` だけでなく）を含むシステム全体のメトリクスです。単一の CPU コアに対する値は、区間 [0..1] の範囲になります。すべての CPU コアに対する値は、各コアの値を合計して算出され、区間 [0..num cores] の範囲になります。

### OSSystemTimeNormalized {#ossystemtimenormalized}

この値は `OSSystemTime` と同様ですが、CPU コア数で割ることで、コア数に依存せず [0..1] の範囲で測定できるようにしたものです。これにより、コア数が不揃いなクラスタ内の複数サーバー間でもこのメトリクス値を平均化でき、平均的なリソース利用率を表すメトリクスを得ることができます。

### OSThreadsRunnable {#osthreadsrunnable}

OS カーネルスケジューラから見て「runnable」状態にあるスレッドの総数。

### OSThreadsTotal {#osthreadstotal}

OS カーネルスケジューラから見て認識されるスレッドの総数。

### OSUptime {#osuptime}

ホストサーバー（ClickHouse が稼働しているマシン）の稼働時間（秒）。

### OSUserTime {#osusertime}

CPU コアがユーザー空間のコードを実行していた時間の比率です。これはシステム全体にわたるメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが対象になります。これには、CPU 内部要因（メモリロード、パイプラインストール、分岐予測ミス、別の SMT コアの実行）により CPU 資源が十分に活用されていなかった時間も含まれます。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、各コアの値の合計として計算され、[0..num cores] の範囲になります。

### OSUserTimeCPU_*N* {#osusertimecpu_n}

CPU コアがユーザー空間のコードを実行していた時間の比率です。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。これには、CPU 内部の要因（メモリロード、パイプラインスタール、分岐予測ミス、別の SMT コアの実行）によって CPU が十分に活用されていなかった時間も含まれます。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、それらを合計した [0..CPU コア数] の範囲になります。

### OSUserTimeNormalized {#osusertimenormalized}

この値は `OSUserTime` と同様ですが、CPU コア数で割ることで、コア数に依存せず [0..1] の範囲に正規化されます。これにより、クラスタ内でコア数が揃っていない複数のサーバー間でも、このメトリクスの値を平均し、平均的なリソース利用率のメトリクスを得ることができます。

### PostgreSQLThreads {#postgresqlthreads}

PostgreSQL 互換プロトコルのサーバーのスレッド数。

### ReplicasMaxAbsoluteDelay {#replicasmaxabsolutedelay}

すべての Replicated テーブルにおいて、最も新しいレプリケート済みパーツと、まだレプリケートされていない最も新しいデータパーツとの最大時間差（秒）。非常に大きい値は、データが存在しないレプリカであることを示します。

### ReplicasMaxInsertsInQueue {#replicasmaxinsertsinqueue}

Replicated テーブル全体で、キュー内（まだレプリケートされていない）に保持できる INSERT 操作の最大数。

### ReplicasMaxMergesInQueue {#replicasmaxmergesinqueue}

すべての Replicated テーブルを対象として、キュー内にある（まだ適用されていない）マージ処理の最大数。

### ReplicasMaxQueueSize {#replicasmaxqueuesize}

Replicated テーブル全体での最大キューサイズ（get や merge などの操作数の合計）。

### ReplicasMaxRelativeDelay {#replicasmaxrelativedelay}

Replicated テーブル全体で、各レプリカの遅延と、同じテーブルにおける最新のレプリカの遅延との差分の最大値。

### ReplicasSumInsertsInQueue {#replicassuminsertsinqueue}

Replicated テーブル全体で、キューにたまっている（まだレプリケートされていない）INSERT 操作の合計値。

### ReplicasSumMergesInQueue {#replicassummergesinqueue}

Replicated テーブル全体で、キュー内（まだ適用されていない）にあるマージ処理数の合計。

### ReplicasSumQueueSize {#replicassumqueuesize}

Replicated テーブル全体にわたるキューサイズの合計（get や merge などの操作数）。

### TCPThreads {#tcpthreads}

TCP プロトコル（TLS なし）のサーバーのスレッド数。

### Temperature_*N* {#temperature_n}

対応するデバイスの温度（℃）です。センサーが現実的でない値を返すことがあります。ソース: `/sys/class/thermal`

### Temperature_*name* {#temperature_name}

対応するハードウェアモニターおよびセンサーによって報告される温度（℃）。センサーによっては、現実的ではない値を返す場合があります。ソース: `/sys/class/hwmon`

### TotalBytesOfMergeTreeTables {#totalbytesofmergetreetables}

すべての MergeTree ファミリーのテーブルに保存されている圧縮済みバイト数の合計（データおよびインデックスを含む）。

### TotalPartsOfMergeTreeTables {#totalpartsofmergetreetables}

MergeTree ファミリーに属するすべてのテーブルに含まれるデータパーツの合計数。10 000 を超える数はサーバーの起動時間に悪影響を与え、パーティションキーの選択が不適切である可能性を示します。

### TotalPrimaryKeyBytesInMemory {#totalprimarykeybytesinmemory}

プライマリキー値により使用されているメモリ量の合計（バイト単位）。アクティブなパーツのみが対象です。

### TotalPrimaryKeyBytesInMemoryAllocated {#totalprimarykeybytesinmemoryallocated}

プライマリキー値のために確保されているメモリ容量の合計（バイト単位）。アクティブなパーツのみが対象です。

### TotalRowsOfMergeTreeTables {#totalrowsofmergetreetables}

MergeTree ファミリーに属するすべてのテーブルに格納されている行（レコード）の合計数。

### 稼働時間 {#uptime}

秒単位のサーバー稼働時間です。接続を受け付ける前のサーバー初期化に要した時間も含みます。

### ZooKeeperClientLastZXIDSeen {#zookeeperclientlastzxidseen}

現在の ZooKeeper クライアントセッションで最後に確認された ZXID。クライアントが ZooKeeper からトランザクションを受信するたびに、この値は単調に増加します。

### jemalloc.active {#jemallocactive}

低レベルメモリアロケータ（jemalloc）の内部メトリクスです。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.allocated {#jemallocallocated}

低レベルのメモリアロケータ（jemalloc）の内部メトリック。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.dirty_purged {#jemallocarenasalldirty_purged}

低レベルメモリアロケータ（jemalloc）の内部メトリクスの 1 つです。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.muzzy_purged {#jemallocarenasallmuzzy_purged}

低レベルメモリアロケータ（jemalloc）の内部メトリックです。詳しくは https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.pactive {#jemallocarenasallpactive}

低レベルメモリアロケータ（jemalloc）の内部メトリックです。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.pdirty {#jemallocarenasallpdirty}

低レベルなメモリアロケータ（jemalloc）の内部メトリクスです。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.pmuzzy {#jemallocarenasallpmuzzy}

低レベルメモリアロケータ（jemalloc）の内部メトリックです。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.background_thread.num_runs {#jemallocbackground_threadnum_runs}

低レベルメモリアロケータ（jemalloc）に関する内部メトリクスです。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.background_thread.num_threads {#jemallocbackground_threadnum_threads}

低レベルメモリアロケータ（jemalloc）の内部メトリクスです。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.background_thread.run_intervals {#jemallocbackground_threadrun_intervals}

低レベルメモリアロケーター（jemalloc）の内部メトリックです。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.epoch {#jemallocepoch}

すべての `jemalloc` メトリクスで使用される、jemalloc（Jason Evans のメモリアロケータ）の統計情報に対する内部インクリメンタル更新番号です。

### jemalloc.mapped {#jemallocmapped}

低レベルなメモリアロケータ（jemalloc）の内部メトリクスです。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.metadata {#jemallocmetadata}

低レベルメモリアロケータ（jemalloc）の内部メトリクスです。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.metadata_thp {#jemallocmetadata_thp}

低レベルメモリアロケータ（jemalloc）の内部メトリックです。詳細については https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.resident {#jemallocresident}

低レベルメモリアロケーター（jemalloc）の内部指標です。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.retained {#jemallocretained}

低レベルのメモリアロケータ（jemalloc）の内部メトリックです。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.prof.active {#jemallocprofactive}

低レベルメモリアロケータ（jemalloc）の内部メトリクスです。詳細は https://jemalloc.net/jemalloc.3.html を参照してください。

**関連項目**

- [Monitoring](../../operations/monitoring.md) — ClickHouse のモニタリングに関する基本概念。
- [system.metrics](/operations/system-tables/metrics) — 即時計算されるメトリクスを含みます。
- [system.events](/operations/system-tables/events) — 発生したイベントの数を含みます。
- [system.metric_log](/operations/system-tables/metric_log) — `system.metrics` および `system.events` テーブルにおけるメトリクス値の履歴を保持します。