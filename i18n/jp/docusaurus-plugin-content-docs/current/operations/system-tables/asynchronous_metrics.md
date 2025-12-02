---
description: 'バックグラウンドで定期的に計算されるメトリクスを保持する system テーブル。例えば、使用中の RAM の量。'
keywords: ['system テーブル', 'asynchronous_metrics']
slug: /operations/system-tables/asynchronous_metrics
title: 'system.asynchronous_metrics'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.asynchronous&#95;metrics {#systemasynchronous_metrics}

<SystemTableCloud />

バックグラウンドで定期的に計算されるメトリクスを保持しています。たとえば、使用中の RAM の量などです。

列:

* `metric` ([String](../../sql-reference/data-types/string.md)) — メトリクス名。
* `value` ([Float64](../../sql-reference/data-types/float.md)) — メトリクス値。
* `description` ([String](../../sql-reference/data-types/string.md)) — メトリクスの説明

**例**

```sql
SELECT * FROM system.asynchronous_metrics LIMIT 10
```

```text
┌─metric──────────────────────────────────┬──────value─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ AsynchronousMetricsCalculationTimeSpent │ 0.00179053 │ 非同期メトリクスの計算に費やされた時間(秒単位)。これは非同期メトリクスのオーバーヘッドです。                                                                                                                                              │
│ NumberOfDetachedByUserParts             │          0 │ ユーザーが `ALTER TABLE DETACH` クエリでMergeTreeテーブルから切り離したパーツの総数(予期しないパーツ、破損したパーツ、無視されたパーツとは異なります)。サーバーは切り離されたパーツを管理しないため、削除可能です。                          │
│ NumberOfDetachedParts                   │          0 │ MergeTreeテーブルから切り離されたパーツの総数。パーツは、ユーザーが `ALTER TABLE DETACH` クエリで切り離すか、パーツが破損、予期しない、または不要な場合にサーバー自体が切り離すことがあります。サーバーは切り離されたパーツを管理しないため、削除可能です。 │
│ TotalRowsOfMergeTreeTables              │    2781309 │ MergeTreeファミリーのすべてのテーブルに格納されている行(レコード)の総数。                                                                                                                                                                                   │
│ TotalBytesOfMergeTreeTables             │    7741926 │ MergeTreeファミリーのすべてのテーブルに格納されているバイト数の総量(データとインデックスを含む圧縮済み)。                                                                                                                                                   │
│ NumberOfTables                          │         93 │ サーバー上のデータベース全体で集計されたテーブルの総数。MergeTreeテーブルを含むことができないデータベースは除外されます。除外されるデータベースエンジンは、`Lazy`、`MySQL`、`PostgreSQL`、`SQlite`など、テーブルのセットを動的に生成するものです。 │
│ NumberOfDatabases                       │          6 │ サーバー上のデータベースの総数。                                                                                                                                                                                                                   │
│ MaxPartCountForPartition                │          6 │ MergeTreeファミリーのすべてのテーブルの全パーティションにおける、パーティションあたりのパーツの最大数。300を超える値は、設定ミス、過負荷、または大量のデータロードを示します。                                                                       │
│ ReplicasSumMergesInQueue                │          0 │ Replicatedテーブル全体でキュー内のマージ操作(まだ適用されていないもの)の合計。                                                                                                                                                                       │
│ ReplicasSumInsertsInQueue               │          0 │ Replicatedテーブル全体でキュー内のINSERT操作(まだ複製されていないもの)の合計。                                                                                                                                                                   │
└─────────────────────────────────────────┴────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

{/*- system.events や system.metrics と異なり、非同期メトリクスはソースコードファイル内に単純な一覧として定義されているわけではなく、
      src/Interpreters/ServerAsynchronousMetrics.cpp 内のロジックと混在して記述されています。
      読者の便宜のため、ここで明示的に列挙します。 -*/ }

## メトリクスの説明 {#metric-descriptions}

### AsynchronousHeavyMetricsCalculationTimeSpent {#asynchronousheavymetricscalculationtimespent}

非同期の重い（テーブル関連の）メトリクスの計算に費やされた時間（秒単位）。これは非同期メトリクスのオーバーヘッドです。

### AsynchronousHeavyMetricsUpdateInterval {#asynchronousheavymetricsupdateinterval}

重い（テーブル関連の）メトリクスの更新間隔

### AsynchronousMetricsCalculationTimeSpent {#asynchronousmetricscalculationtimespent}

非同期メトリクスの計算に費やされた時間（秒単位）。これは非同期メトリクスのオーバーヘッドです。

### AsynchronousMetricsUpdateInterval {#asynchronousmetricsupdateinterval}

メトリクスの更新間隔

### BlockActiveTime_*name* {#blockactivetime_name}

ブロックデバイスで I/O リクエストがキューに積まれていた時間（秒単位）。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセス（clickhouse-server だけでなく）を含みます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockDiscardBytes_*name* {#blockdiscardbytes_name}

ブロックデバイス上で破棄されたバイト数。これらの操作は SSD に関連があります。破棄（discard）操作は ClickHouse では使用されませんが、システム上の他のプロセスで使用される可能性があります。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセス（clickhouse-server だけでなく）を含みます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockDiscardMerges_*name* {#blockdiscardmerges_name}

ブロックデバイスに対して要求され、OS の I/O スケジューラによってマージされた破棄（discard）操作の数。これらの操作は SSD に関連があります。破棄操作は ClickHouse では使用されませんが、システム上の他のプロセスで使用される可能性があります。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセス（clickhouse-server だけでなく）を含みます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockDiscardOps_*name* {#blockdiscardops_name}

ブロックデバイスに対して要求された破棄（discard）操作の数。これらの操作は SSD に関連があります。破棄操作は ClickHouse では使用されませんが、システム上の他のプロセスで使用される可能性があります。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセス（clickhouse-server だけでなく）を含みます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockDiscardTime_*name* {#blockdiscardtime_name}

ブロックデバイスに対して要求された破棄（discard）操作に費やされた時間（秒単位）の合計。すべての操作にわたって合算されます。これらの操作は SSD に関連があります。破棄操作は ClickHouse では使用されませんが、システム上の他のプロセスで使用される可能性があります。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセス（clickhouse-server だけでなく）を含みます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockInFlightOps_*name* {#blockinflightops_name}

デバイスドライバに発行されたものの、まだ完了していない I/O リクエストの数。この値には、キュー内にはあるがまだデバイスドライバに発行されていない I/O リクエストは含まれません。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセス（clickhouse-server だけでなく）を含みます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockQueueTime_*name* {#blockqueuetime_name}

この値は、I/O リクエストがこのブロックデバイス上で待機していたミリ秒数をカウントします。複数の I/O リクエストが待機している場合、この値は「ミリ秒数 × 待機しているリクエスト数」の積として増加します。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセス（clickhouse-server だけでなく）を含みます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockReadBytes_*name* {#blockreadbytes_name}

ブロックデバイスから読み取られたバイト数。OS のページキャッシュの利用により I/O が節約されるため、ファイルシステムから読み取られたバイト数より少なくなる場合があります。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセス（clickhouse-server だけでなく）を含みます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockReadMerges_*name* {#blockreadmerges_name}

ブロックデバイスに対して要求され、OS の I/O スケジューラによってマージされた読み取り操作の数。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセス（clickhouse-server だけでなく）を含みます。ソース: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください。

### BlockReadOps_*name* {#blockreadops_name}

ブロックデバイスに対して要求された読み取り処理の回数。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。出典: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください

### BlockReadTime_*name* {#blockreadtime_name}

ブロックデバイスに対して要求された読み取り処理に費やされた時間（秒）。すべての処理の合計です。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。出典: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください

### BlockWriteBytes_*name* {#blockwritebytes_name}

ブロックデバイスに書き込まれたバイト数。OS のページキャッシュの利用によって IO が削減されるため、ファイルシステムに書き込まれたバイト数よりも小さくなる場合があります。ライトスルーキャッシュにより、対応するファイルシステムへの書き込みより後になってブロックデバイスへの書き込みが行われることがあります。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。出典: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください

### BlockWriteMerges_*name* {#blockwritemerges_name}

OS の IO スケジューラによってマージされた、ブロックデバイスへの書き込み要求の回数。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。出典: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください

### BlockWriteOps_*name* {#blockwriteops_name}

ブロックデバイスに対して要求された書き込み処理の回数。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。出典: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください

### BlockWriteTime_*name* {#blockwritetime_name}

ブロックデバイスに対して要求された書き込み処理に費やされた時間（秒）。すべての処理の合計です。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。出典: `/sys/block`。https://www.kernel.org/doc/Documentation/block/stat.txt を参照してください

### CPUFrequencyMHz_*name* {#cpufrequencymhz_name}

CPU の現在の動作周波数（MHz 単位）。最近の CPU の多くは、省電力やターボブーストのために周波数を動的に調整します。

### DictionaryMaxUpdateDelay {#dictionarymaxlastsuccessfulupdatetime}

辞書更新の最大遅延時間（秒）。

### DictionaryTotalFailedUpdates {#dictionaryloadfailed}

直近の成功した読み込み以降、すべての辞書で発生したエラーの総数。

### DiskAvailable_*name* {#diskavailable_name}

ディスク（仮想ファイルシステム）上で利用可能なバイト数。リモートファイルシステムでは 16 EiB のような大きな値を報告することがあります。

### DiskTotal_*name* {#disktotal_name}

ディスク（仮想ファイルシステム）の総サイズ（バイト単位）。リモートファイルシステムでは 16 EiB のような大きな値を報告することがあります。

### DiskUnreserved_*name* {#diskunreserved_name}

マージ、フェッチ、移動のための予約分を除いた、ディスク（仮想ファイルシステム）上で利用可能なバイト数。リモートファイルシステムでは 16 EiB のような大きな値を報告することがあります。

### DiskUsed_*name* {#diskused_name}

ディスク（仮想ファイルシステム）上で使用中のバイト数。リモートファイルシステムでは、この情報が常に提供されるとは限りません。

### FilesystemCacheBytes {#filesystemcachebytes}

`cache` 仮想ファイルシステム内の合計バイト数。このキャッシュはディスク上に保持されます。

### FilesystemCacheFiles {#filesystemcachefiles}

`cache` 仮想ファイルシステム内のキャッシュされたファイルセグメントの総数。このキャッシュはディスク上に保持されます。

### FilesystemLogsPathAvailableBytes {#filesystemlogspathavailablebytes}

ClickHouse のログパスがマウントされているボリューム上で利用可能なバイト数。この値がゼロに近づいてきた場合は、設定ファイルでログローテーションを調整する必要があります。

### FilesystemLogsPathAvailableINodes {#filesystemlogspathavailableinodes}

ClickHouse のログパスがマウントされているボリューム上で利用可能な iノード数。

### FilesystemLogsPathTotalBytes {#filesystemlogspathtotalbytes}

ClickHouse のログパスがマウントされているボリュームのサイズ（バイト単位）。ログ用に少なくとも 10 GB を確保することを推奨します。

### FilesystemLogsPathTotalINodes {#filesystemlogspathtotalinodes}

ClickHouse のログパスがマウントされているボリューム上の iノードの総数。

### FilesystemLogsPathUsedBytes {#filesystemlogspathusedbytes}

ClickHouse のログパスがマウントされているボリューム上で使用中のバイト数。

### FilesystemLogsPathUsedINodes {#filesystemlogspathusedinodes}

ClickHouse のログパスがマウントされているボリューム上で使用中の iノード数。

### FilesystemMainPathAvailableBytes {#filesystemmainpathavailablebytes}

メインの ClickHouse パスがマウントされているボリュームで利用可能なバイト数。

### FilesystemMainPathAvailableINodes {#filesystemmainpathavailableinodes}

メインの ClickHouse パスがマウントされているボリュームで利用可能な inode の数。値が 0 に近い場合は設定ミスを示しており、ディスクが満杯でなくても「no space left on device」というエラーが発生します。

### FilesystemMainPathTotalBytes {#filesystemmainpathtotalbytes}

メインの ClickHouse パスがマウントされているボリュームのサイズ（バイト単位）。

### FilesystemMainPathTotalINodes {#filesystemmainpathtotalinodes}

メインの ClickHouse パスがマウントされているボリューム上の inode の総数。2,500 万未満の場合、設定ミスを示します。

### FilesystemMainPathUsedBytes {#filesystemmainpathusedbytes}

メインの ClickHouse パスがマウントされているボリュームで使用中のバイト数。

### FilesystemMainPathUsedINodes {#filesystemmainpathusedinodes}

メインの ClickHouse パスがマウントされているボリュームで使用中の inode の数。この値は主にファイル数に対応します。

### HTTPThreads {#httpthreads}

HTTP インターフェイスのサーバーにおけるスレッド数（TLS なし）。

### InterserverThreads {#interserverthreads}

レプリカ間通信プロトコルのサーバーにおけるスレッド数（TLS なし）。

### Jitter {#jitter}

非同期メトリクスを計算するスレッドが起床するようにスケジュールされた時刻と、実際に起床した時刻との差分。システム全体のレイテンシーと応答性の代理指標です。

### LoadAverage*N* {#loadaveragen}

1 分間の指数平滑化平均で算出したシステム全体のロード。ロードは、すべてのプロセス（OS カーネルのスケジューリング対象）において、現在 CPU 上で実行中、IO 待ち、または今はスケジュールされていないが実行可能状態にあるスレッド数を表します。この数値には、clickhouse-server だけでなくすべてのプロセスが含まれます。システムが過負荷であり、多数のプロセスが実行可能だが CPU または IO を待っている場合、この数値は CPU コア数を上回ることがあります。

### MaxPartCountForPartition {#maxpartcountforpartition}

すべての MergeTree 系テーブルのすべてのパーティションにおける、パーティションごとのパーツ数の最大値。300 を超える値は、設定ミス、過負荷、または大量データのロードを示します。

### MemoryCode {#memorycode}

サーバープロセスの機械語ページ向けにマッピングされた仮想メモリ量（バイト単位）。

### MemoryDataAndStack {#memorydataandstack}

スタックおよび割り当てられたメモリの使用のためにマッピングされた仮想メモリ量（バイト単位）。スレッドごとのスタックや、`mmap` システムコールで割り当てられた大部分のメモリを含むかどうかは規定されていません。このメトリクスは完全性のために存在します。監視には `MemoryResident` メトリクスを使用することを推奨します。

### MemoryResidentMax {#memoryresidentmax}

サーバープロセスによって使用された物理メモリ量の最大値（バイト単位）。

### MemoryResident {#memoryresident}

サーバープロセスによって使用されている物理メモリ量（バイト単位）。

### MemoryShared {#memoryshared}

サーバープロセスによって使用され、かつ他のプロセスと共有されているメモリ量（バイト単位）。ClickHouse は共有メモリを使用しませんが、一部のメモリは OS の都合により共有としてラベル付けされる場合があります。このメトリクスを監視してもあまり意味はなく、完全性のために存在しています。

### MemoryVirtual {#memoryvirtual}

サーバープロセスによって割り当てられた仮想アドレス空間のサイズ（バイト単位）。仮想アドレス空間のサイズは通常、物理メモリ消費量よりもはるかに大きく、メモリ消費量の推定には使用すべきではありません。このメトリクスの値が大きくてもまったく正常であり、技術的な意味しか持ちません。

### MySQLThreads {#mysqlthreads}

MySQL 互換プロトコルのサーバーにおけるスレッド数。

### NetworkReceiveBytes_*name* {#networkreceivebytes_name}

ネットワークインターフェイス経由で受信したバイト数。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。

### NetworkReceiveDrop_*name* {#networkreceivedrop_name}

ネットワークインターフェイス経由で受信中にドロップされたパケットのバイト数。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。

### NetworkReceiveErrors_*name* {#networkreceiveerrors_name}

ネットワークインターフェイス経由での受信時にエラーが発生した回数。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。

### NetworkReceivePackets_*name* {#networkreceivepackets_name}

 ネットワークインターフェイス経由で受信したネットワークパケット数。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスを含みます。

### NetworkSendBytes_*name* {#networksendbytes_name}

 ネットワークインターフェイス経由で送信されたバイト数。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスを含みます。

### NetworkSendDrop_*name* {#networksenddrop_name}

 ネットワークインターフェイス経由で送信中にパケットがドロップされた回数。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスを含みます。

### NetworkSendErrors_*name* {#networksenderrors_name}

 ネットワークインターフェイス経由で送信中にエラー（例: TCP 再送）が発生した回数。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスを含みます。

### NetworkSendPackets_*name* {#networksendpackets_name}

 ネットワークインターフェイス経由で送信されたネットワークパケット数。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスを含みます。

### NumberOfDatabases {#numberofdatabases}

サーバー上のデータベースの総数。

### NumberOfDetachedByUserParts {#numberofdetachedbyuserparts}

ユーザーが `ALTER TABLE DETACH` クエリを使用して MergeTree テーブルから切り離した part の総数（予期しない、破損した、または無視された part とは対照的）。サーバーは切り離された part を管理対象とはみなさず、これらは削除可能です。

### NumberOfDetachedParts {#numberofdetachedparts}

MergeTree テーブルから切り離された part の総数。part は、ユーザーが `ALTER TABLE DETACH` クエリで切り離すか、part が破損している、予期しない、または不要な場合にはサーバー自身によって切り離されることがあります。サーバーは切り離された part を管理対象とはみなさず、これらは削除可能です。

### NumberOfTables {#numberoftables}

サーバー上のデータベースをまたいで合計したテーブルの総数。ただし、MergeTree テーブルを含まないデータベースは除外されます。除外されるデータベースエンジンは、`Lazy`、`MySQL`、`PostgreSQL`、`SQlite` のように、テーブル集合をオンザフライで（動的に）生成するものです。

### OSContextSwitches {#oscontextswitches}

ホストマシン上でシステムに発生したコンテキストスイッチの回数。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスを含みます。

### OSGuestNiceTime {#osguestnicetime}

Linux カーネルの制御下で、ゲスト OS 用の仮想 CPU を、ゲストが高い優先度に設定されている状態で実行するのに費やした時間の比率（`man procfs` を参照）。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスを含みます。このメトリクスは ClickHouse にとっては無関係ですが、完全性のために存在します。単一の CPU コアについての値は [0..1] の範囲になります。すべての CPU コアについての値は、それらを合計した [0..num cores] の範囲で計算されます。

### OSGuestNiceTimeCPU_*N* {#osguestnicetimecpu_n}

Linux カーネルの制御下で、ゲスト OS 用の仮想 CPU を、ゲストが高い優先度に設定されている状態で実行するのに費やした時間の比率（`man procfs` を参照）。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスを含みます。このメトリクスは ClickHouse にとっては無関係ですが、完全性のために存在します。単一の CPU コアについての値は [0..1] の範囲になります。すべての CPU コアについての値は、それらを合計した [0..num cores] の範囲で計算されます。

### OSGuestNiceTimeNormalized {#osguestnicetimenormalized}

値は `OSGuestNiceTime` と同様ですが、CPU コア数で割られており、コア数に依存せず [0..1] の範囲で測定されます。これにより、コア数が一様でない場合でも、クラスタ内の複数サーバーにわたってこのメトリクスの値を平均し、平均的なリソース使用率メトリクスを得ることが可能になります。

### OSGuestTime {#osguesttime}

Linux カーネルの制御下でゲスト OS 用の仮想 CPU を実行するのに費やした時間の比率（`man procfs` を参照）。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスを含みます。このメトリクスは ClickHouse にとっては無関係ですが、完全性のために存在します。単一の CPU コアについての値は [0..1] の範囲になります。すべての CPU コアについての値は、それらを合計した [0..num cores] の範囲で計算されます。

### OSGuestTimeCPU_*N* {#osguesttimecpu_n}

Linux カーネルの制御下で、ゲスト OS 向けの仮想 CPU を実行していた時間の比率です（`man procfs` を参照）。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。このメトリクスは ClickHouse にとっては本質的ではありませんが、完全性のために用意されています。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、各コアの値を合計して [0..num cores] の範囲で算出されます。

### OSGuestTimeNormalized {#osguesttimenormalized}

値は `OSGuestTime` と同様ですが、CPU コア数で割ることで、コア数に関係なく [0..1] の範囲で測定されます。これにより、クラスタ内でコア数が一様でない複数サーバー間でも、このメトリクスの値を平均化して、平均的なリソース使用率メトリクスを取得できます。

### OSIOWaitTime {#osiowaittime}

CPU コアがコードを実行しておらず、かつプロセスが I/O を待機しているために OS カーネルがこの CPU 上で他のいかなるプロセスも実行していなかった時間の比率です。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、各コアの値を合計して [0..num cores] の範囲で算出されます。

### OSIOWaitTimeCPU_*N* {#osiowaittimecpu_n}

CPU コアがコードを実行しておらず、かつプロセスが I/O を待機しているために OS カーネルがこの CPU 上で他のいかなるプロセスも実行していなかった時間の比率です。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、各コアの値を合計して [0..num cores] の範囲で算出されます。

### OSIOWaitTimeNormalized {#osiowaittimenormalized}

値は `OSIOWaitTime` と同様ですが、CPU コア数で割ることで、コア数に関係なく [0..1] の範囲で測定されます。これにより、クラスタ内でコア数が一様でない複数サーバー間でも、このメトリクスの値を平均化して、平均的なリソース使用率メトリクスを取得できます。

### OSIdleTime {#osidletime}

OS カーネルの観点から見た、CPU コアがアイドル状態（I/O 待ちのプロセスを実行する準備すらしていない状態）であった時間の比率です。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。これは、CPU 内部要因（メモリロード、パイプラインストール、分岐予測ミス、別の SMT コアの実行）によって CPU が十分に活用されていなかった時間は含みません。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、各コアの値を合計して [0..num cores] の範囲で算出されます。

### OSIdleTimeCPU_*N* {#osidletimecpu_n}

OS カーネルの観点から見た、CPU コアがアイドル状態（I/O 待ちのプロセスを実行する準備すらしていない状態）であった時間の比率です。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。これは、CPU 内部要因（メモリロード、パイプラインストール、分岐予測ミス、別の SMT コアの実行）によって CPU が十分に活用されていなかった時間は含みません。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、各コアの値を合計して [0..num cores] の範囲で算出されます。

### OSIdleTimeNormalized {#osidletimenormalized}

値は `OSIdleTime` と同様ですが、CPU コア数で割ることで、コア数に関係なく [0..1] の範囲で測定されます。これにより、クラスタ内でコア数が一様でない複数サーバー間でも、このメトリクスの値を平均化して、平均的なリソース使用率メトリクスを取得できます。

### OSInterrupts {#osinterrupts}

ホストマシン上で発生した割り込み回数です。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。

### OSIrqTime {#osirqtime}

CPU 上でハードウェア割り込み処理を実行していた時間の比率です。これはシステム全体のメトリクスであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスが含まれます。このメトリクスの値が高い場合は、ハードウェアの誤った構成、または非常に高いネットワーク負荷を示している可能性があります。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、各コアの値を合計して [0..num cores] の範囲で算出されます。

### OSIrqTimeCPU_*N* {#osirqtimecpu_n}

CPU 上でハードウェア割り込み要求を処理するのに費やされた時間の比率です。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセス（clickhouse-server だけではありません）を含みます。このメトリクスの値が高い場合、ハードウェアの誤設定や非常に高いネットワーク負荷を示している可能性があります。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、それらの合計として計算され、[0..num cores] の範囲になります。

### OSIrqTimeNormalized {#osirqtimenormalized}

`OSIrqTime` と同様の値ですが、CPU コア数で割ることで、コア数にかかわらず [0..1] の範囲で測定されます。これにより、コア数が一様でないクラスター内の複数サーバー間でも、このメトリクスの値を平均して、平均的なリソース使用率メトリクスを得ることができます。

### OSMemoryAvailable {#osmemoryavailable}

プログラムで使用可能なメモリ量（バイト単位）です。これは `OSMemoryFreePlusCached` メトリクスと非常によく似ています。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセス（clickhouse-server だけではありません）を含みます。

### OSMemoryBuffers {#osmemorybuffers}

OS カーネルバッファによって使用されているメモリ量（バイト単位）です。通常は小さい値であるべきであり、大きな値は OS の誤設定を示している可能性があります。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセス（clickhouse-server だけではありません）を含みます。

### OSMemoryCached {#osmemorycached}

OS のページキャッシュによって使用されているメモリ量（バイト単位）です。通常、利用可能なメモリのほとんどすべてが OS のページキャッシュによって使用されるため、このメトリクスの値が高いことは正常であり、期待される動作です。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセス（clickhouse-server だけではありません）を含みます。

### OSMemoryFreePlusCached {#osmemoryfreepluscached}

ホストシステム上の空きメモリと OS ページキャッシュメモリを合わせた量（バイト単位）です。このメモリはプログラムで使用可能です。この値は `OSMemoryAvailable` と非常によく似たものになるはずです。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセス（clickhouse-server だけではありません）を含みます。

### OSMemoryFreeWithoutCached {#osmemoryfreewithoutcached}

ホストシステム上の空きメモリ量（バイト単位）です。これは、OS のページキャッシュメモリによって使用されているメモリ量（バイト単位）を含みません。ページキャッシュメモリもプログラムで利用可能であるため、このメトリクスの値は混乱を招く場合があります。代わりに `OSMemoryAvailable` メトリクスを参照してください。便宜上、`OSMemoryFreePlusCached` メトリクスも提供しており、これは OSMemoryAvailable とある程度似た値になるはずです。併せて https://www.linuxatemyram.com/ も参照してください。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセス（clickhouse-server だけではありません）を含みます。

### OSMemoryTotal {#osmemorytotal}

ホストシステム上のメモリの総量（バイト単位）です。

### OSNiceTime {#osnicetime}

CPU コアがより高い優先度でユーザ空間コードを実行していた時間の比率です。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセス（clickhouse-server だけではありません）を含みます。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、それらの合計として計算され、[0..num cores] の範囲になります。

### OSNiceTimeCPU_*N* {#osnicetimecpu_n}

CPU コアがより高い優先度でユーザ空間コードを実行していた時間の比率です。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセス（clickhouse-server だけではありません）を含みます。単一の CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、それらの合計として計算され、[0..num cores] の範囲になります。

### OSNiceTimeNormalized {#osnicetimenormalized}

`OSNiceTime` と同様の値ですが、CPU コア数で割ることで、コア数にかかわらず [0..1] の範囲で測定されます。これにより、コア数が一様でないクラスター内の複数サーバー間でも、このメトリクスの値を平均して、平均的なリソース使用率メトリクスを得ることができます。

### OSOpenFiles {#osopenfiles}

ホストマシン上で開かれているファイルの総数です。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセス（clickhouse-server だけではありません）を含みます。

### OSProcessesBlocked {#osprocessesblocked}

I/O の完了待ちでブロックされているスレッド数です（`man procfs` を参照）。これはシステム全体のメトリクスであり、ホストマシン上のすべてのプロセス（clickhouse-server だけではありません）を含みます。

### OSProcessesCreated {#osprocessescreated}

作成されたプロセスの数。これはシステム全体のメトリクスであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスが含まれます。

### OSProcessesRunning {#osprocessesrunning}

オペレーティングシステムによって「実行可能」（実行中または実行待ち）とみなされているスレッドの数。これはシステム全体のメトリクスであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスが含まれます。

### OSSoftIrqTime {#ossoftirqtime}

CPU 上でソフトウェア割り込み要求を処理するのに費やされた時間の割合。これはシステム全体のメトリクスであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスが含まれます。このメトリクスの値が高い場合、システム上で非効率なソフトウェアが動作している可能性を示します。単一 CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、それらを合計した [0..num cores] の範囲で計算されます。

### OSSoftIrqTimeCPU_*N* {#ossoftirqtimecpu_n}

CPU 上でソフトウェア割り込み要求を処理するのに費やされた時間の割合。これはシステム全体のメトリクスであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスが含まれます。このメトリクスの値が高い場合、システム上で非効率なソフトウェアが動作している可能性を示します。単一 CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、それらを合計した [0..num cores] の範囲で計算されます。

### OSSoftIrqTimeNormalized {#ossoftirqtimenormalized}

値の意味は `OSSoftIrqTime` と同様ですが、CPU コア数で割ることで、コア数に依存せず常に [0..1] の範囲で測定されます。これにより、コア数が不均一な場合でも、クラスタ内の複数サーバーにわたってこのメトリクスの値を平均化し、平均的なリソース使用率メトリクスを得ることができます。

### OSStealTime {#osstealtime}

仮想化環境で動作している際に、CPU が他のオペレーティングシステムで費やした時間の割合。これはシステム全体のメトリクスであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスが含まれます。このメトリクスを提供する仮想化環境はすべてではなく、多くは提供しません。単一 CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、それらを合計した [0..num cores] の範囲で計算されます。

### OSStealTimeCPU_*N* {#osstealtimecpu_n}

仮想化環境で動作している際に、CPU が他のオペレーティングシステムで費やした時間の割合。これはシステム全体のメトリクスであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスが含まれます。このメトリクスを提供する仮想化環境はすべてではなく、多くは提供しません。単一 CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、それらを合計した [0..num cores] の範囲で計算されます。

### OSStealTimeNormalized {#osstealtimenormalized}

値の意味は `OSStealTime` と同様ですが、CPU コア数で割ることで、コア数に依存せず常に [0..1] の範囲で測定されます。これにより、コア数が不均一な場合でも、クラスタ内の複数サーバーにわたってこのメトリクスの値を平均化し、平均的なリソース使用率メトリクスを得ることができます。

### OSSystemTime {#ossystemtime}

CPU コアが OS カーネル（システム）コードを実行していた時間の割合。これはシステム全体のメトリクスであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスが含まれます。単一 CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、それらを合計した [0..num cores] の範囲で計算されます。

### OSSystemTimeCPU_*N* {#ossystemtimecpu_n}

CPU コアが OS カーネル（システム）コードを実行していた時間の割合。これはシステム全体のメトリクスであり、clickhouse-server だけでなく、ホストマシン上のすべてのプロセスが含まれます。単一 CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、それらを合計した [0..num cores] の範囲で計算されます。

### OSSystemTimeNormalized {#ossystemtimenormalized}

値の意味は `OSSystemTime` と同様ですが、CPU コア数で割ることで、コア数に依存せず常に [0..1] の範囲で測定されます。これにより、コア数が不均一な場合でも、クラスタ内の複数サーバーにわたってこのメトリクスの値を平均化し、平均的なリソース使用率メトリクスを得ることができます。

### OSThreadsRunnable {#osthreadsrunnable}

OS カーネルのスケジューラから見て「実行可能」となっているスレッドの総数。

### OSThreadsTotal {#osthreadstotal}

OS カーネルのスケジューラから見たスレッドの総数。

### OSUptime {#osuptime}

ClickHouse が稼働しているホストサーバー（マシン）の稼働時間（秒単位）。

### OSUserTime {#osusertime}

CPU コアがユーザー空間コードを実行していた時間の比率。このメトリクスはシステム全体のものであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスを含みます。また、CPU 内部の要因（メモリロード、パイプラインストール、分岐予測ミス、別の SMT コアの実行など）により CPU が過小利用されていた時間も含みます。単一 CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、それらの合計として計算され [0..num cores] の範囲になります。

### OSUserTimeCPU_*N* {#osusertimecpu_n}

CPU コアがユーザー空間コードを実行していた時間の比率。このメトリクスはシステム全体のものであり、clickhouse-server だけでなくホストマシン上のすべてのプロセスを含みます。また、CPU 内部の要因（メモリロード、パイプラインストール、分岐予測ミス、別の SMT コアの実行など）により CPU が過小利用されていた時間も含みます。単一 CPU コアに対する値は [0..1] の範囲になります。すべての CPU コアに対する値は、それらの合計として計算され [0..num cores] の範囲になります。

### OSUserTimeNormalized {#osusertimenormalized}

`OSUserTime` と同様の値ですが、CPU コア数で割ることで、コア数に依存せず常に [0..1] の範囲になるようにしたものです。これにより、コア数が不均一であってもクラスタ内の複数サーバー間でこのメトリクスの値を平均化し、平均的なリソース利用率メトリクスを得ることができます。

### PostgreSQLThreads {#postgresqlthreads}

PostgreSQL 互換プロトコルのサーバー内のスレッド数。

### ReplicasMaxAbsoluteDelay {#replicasmaxabsolutedelay}

すべての Replicated テーブルにおいて、最新のレプリケート済みパーツと、まだレプリケートされていない最新のデータパーツとの秒単位での最大差分。非常に大きな値は、データを持たないレプリカが存在することを示します。

### ReplicasMaxInsertsInQueue {#replicasmaxinsertsinqueue}

すべての Replicated テーブルにおいて、キュー内（まだレプリケートされていない）にある INSERT 操作数の最大値。

### ReplicasMaxMergesInQueue {#replicasmaxmergesinqueue}

すべての Replicated テーブルにおいて、キュー内（まだ適用されていない）にあるマージ操作数の最大値。

### ReplicasMaxQueueSize {#replicasmaxqueuesize}

すべての Replicated テーブルにおいて、get や merge などの操作数として表したキューサイズの最大値。

### ReplicasMaxRelativeDelay {#replicasmaxrelativedelay}

すべての Replicated テーブルにおいて、あるレプリカの遅延と、そのテーブルでもっとも最新なレプリカの遅延との差分の最大値。

### ReplicasSumInsertsInQueue {#replicassuminsertsinqueue}

すべての Replicated テーブルにおいて、キュー内（まだレプリケートされていない）にある INSERT 操作数の合計。

### ReplicasSumMergesInQueue {#replicassummergesinqueue}

すべての Replicated テーブルにおいて、キュー内（まだ適用されていない）にあるマージ操作数の合計。

### ReplicasSumQueueSize {#replicassumqueuesize}

すべての Replicated テーブルにおいて、get や merge などの操作数として表したキューサイズの合計。

### TCPThreads {#tcpthreads}

TCP プロトコル（TLS なし）のサーバー内のスレッド数。

### Temperature_*N* {#temperature_n}

対応するデバイスの温度（℃）。センサーは非現実的な値を返す場合があります。取得元: `/sys/class/thermal`

### Temperature_*name* {#temperature_name}

対応するハードウェアモニターおよび対応するセンサーが報告する温度（℃）。センサーは非現実的な値を返す場合があります。取得元: `/sys/class/hwmon`

### TotalBytesOfMergeTreeTables {#totalbytesofmergetreetables}

すべての MergeTree ファミリーのテーブルに保存されているバイト数（圧縮後、データおよびインデックスを含む）の合計。

### TotalPartsOfMergeTreeTables {#totalpartsofmergetreetables}

すべての MergeTree ファミリーのテーブルに存在するデータパーツの総数。10 000 を超える値はサーバーの起動時間に悪影響を与え、パーティションキーの選択が不適切であることを示している可能性があります。

### TotalPrimaryKeyBytesInMemory {#totalprimarykeybytesinmemory}

プライマリキー値に使用されているメモリ量（バイト単位）の合計（アクティブなパーツのみを対象）。

### TotalPrimaryKeyBytesInMemoryAllocated {#totalprimarykeybytesinmemoryallocated}

プライマリキー値のために予約されているメモリ量（バイト単位）の合計（アクティブなパーツのみを対象）。

### TotalRowsOfMergeTreeTables {#totalrowsofmergetreetables}

MergeTree ファミリーのすべてのテーブルに保存されている行（レコード）の総数。

### Uptime {#uptime}

サーバーの稼働時間（秒単位）。接続を受け付けるまでのサーバー初期化に要した時間も含まれます。

### jemalloc.active {#jemallocactive}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.allocated {#jemallocallocated}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.dirty_purged {#jemallocarenasalldirty_purged}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.muzzy_purged {#jemallocarenasallmuzzy_purged}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.pactive {#jemallocarenasallpactive}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.pdirty {#jemallocarenasallpdirty}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.arenas.all.pmuzzy {#jemallocarenasallpmuzzy}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.background_thread.num_runs {#jemallocbackground_threadnum_runs}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.background_thread.num_threads {#jemallocbackground_threadnum_threads}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.background_thread.run_intervals {#jemallocbackground_threadrun_intervals}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.epoch {#jemallocepoch}

jemalloc（Jason Evans のメモリアロケータ）の統計情報に対する内部の増分更新番号で、他のすべての `jemalloc` メトリクスで使用されます。

### jemalloc.mapped {#jemallocmapped}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.metadata {#jemallocmetadata}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.metadata_thp {#jemallocmetadata_thp}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.resident {#jemallocresident}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.retained {#jemallocretained}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。https://jemalloc.net/jemalloc.3.html を参照してください。

### jemalloc.prof.active {#jemallocprofactive}

低レベルメモリアロケータ（jemalloc）の内部メトリクス。https://jemalloc.net/jemalloc.3.html を参照してください。

**関連項目**

- [Monitoring](../../operations/monitoring.md) — ClickHouse のモニタリングに関する基本概念。
- [system.metrics](/operations/system-tables/metrics) — 即時計算されるメトリクスを含みます。
- [system.events](/operations/system-tables/events) — 発生したイベント数を含みます。
- [system.metric_log](/operations/system-tables/metric_log) — テーブル `system.metrics` および `system.events` のメトリクス値の履歴を含みます。
