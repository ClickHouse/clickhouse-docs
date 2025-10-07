---
slug: '/operations/system-tables/metrics'
description: 'Системная таблица, содержащая метрики, которые могут быть рассчитаны'
title: system.metrics
keywords: ['системная таблица', 'метрики']
doc_type: reference
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.metrics

<SystemTableCloud/>

Содержит метрики, которые могут быть рассчитаны мгновенно или имеют текущее значение. Например, количество одновременно обрабатываемых запросов или текущее задержка реплики. Эта таблица всегда актуальна.

Колонки:

- `metric` ([String](../../sql-reference/data-types/string.md)) — Название метрики.
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — Значение метрики.
- `description` ([String](../../sql-reference/data-types/string.md)) — Описание метрики.
- `name` ([String](../../sql-reference/data-types/string.md)) — Псевдоним для `metric`.

Вы можете найти все поддерживаемые метрики в исходном файле [src/Common/CurrentMetrics.cpp](https://github.com/ClickHouse/ClickHouse/blob/master/src/Common/CurrentMetrics.cpp).

**Пример**

```sql
SELECT * FROM system.metrics LIMIT 10
```

```text
┌─metric───────────────────────────────┬─value─┬─description────────────────────────────────────────────────────────────┐
│ Query                                │     1 │ Number of executing queries                                            │
│ Merge                                │     0 │ Number of executing background merges                                  │
│ PartMutation                         │     0 │ Number of mutations (ALTER DELETE/UPDATE)                              │
│ ReplicatedFetch                      │     0 │ Number of data parts being fetched from replicas                       │
│ ReplicatedSend                       │     0 │ Number of data parts being sent to replicas                            │
│ ReplicatedChecks                     │     0 │ Number of data parts checking for consistency                          │
│ BackgroundMergesAndMutationsPoolTask │     0 │ Number of active merges and mutations in an associated background pool │
│ BackgroundFetchesPoolTask            │     0 │ Number of active fetches in an associated background pool              │
│ BackgroundCommonPoolTask             │     0 │ Number of active tasks in an associated background pool                │
│ BackgroundMovePoolTask               │     0 │ Number of active tasks in BackgroundProcessingPool for moves           │
└──────────────────────────────────────┴───────┴────────────────────────────────────────────────────────────────────────┘
```

## Описание метрик {#metric-descriptions}

### AggregatorThreads {#aggregatorthreads}

Количество потоков в пуле потоков Aggregator.

### AggregatorThreadsActive {#aggregatorthreadsactive}

Количество потоков в пуле потоков Aggregator, выполняющих задачу.

### TablesLoaderForegroundThreads {#tablesloaderforegroundthreads}

Количество потоков в пуле потоков фона асинхронного загрузчика.

### TablesLoaderForegroundThreadsActive {#tablesloaderforegroundthreadsactive}

Количество потоков в пуле потока фона асинхронного загрузчика, выполняющих задачу.

### TablesLoaderBackgroundThreads {#tablesloaderbackgroundthreads}

Количество потоков в пуле фоновых потоков асинхронного загрузчика.

### TablesLoaderBackgroundThreadsActive {#tablesloaderbackgroundthreadsactive}

Количество потоков в пуле фоновых потоков асинхронного загрузчика, выполняющих задачу.

### AsyncInsertCacheSize {#asyncinsertcachesize}

Количество хеш-идентификаторов асинхронных вставок в кэше.

### AsynchronousInsertThreads {#asynchronousinsertthreads}

Количество потоков в пуле потоков AsynchronousInsert.

### AsynchronousInsertThreadsActive {#asynchronousinsertthreadsactive}

Количество потоков в пуле потоков AsynchronousInsert, выполняющих задачу.

### AsynchronousReadWait {#asynchronousreadwait}

Количество потоков, ожидающих асинхронного чтения.

### BackgroundBufferFlushSchedulePoolSize {#backgroundbufferflushschedulepoolsize}

Ограничение на количество задач в пуле BackgroundBufferFlushSchedule.

### BackgroundBufferFlushSchedulePoolTask {#backgroundbufferflushschedulepooltask}

Количество активных задач в пуле BackgroundBufferFlushSchedule. Этот пул используется для периодических сбросов буферов.

### BackgroundCommonPoolSize {#backgroundcommonpoolsize}

Ограничение на количество задач в связанном фоновой пуле.

### BackgroundCommonPoolTask {#backgroundcommonpooltask}

Количество активных задач в связанном фоновой пуле.

### BackgroundDistributedSchedulePoolSize {#backgrounddistributedschedulepoolsize}

Ограничение на количество задач в пуле BackgroundDistributedSchedule.

### BackgroundDistributedSchedulePoolTask {#backgrounddistributedschedulepooltask}

Количество активных задач в пуле BackgroundDistributedSchedule. Этот пул используется для распределенных отправок, которые выполняются в фоне.

### BackgroundFetchesPoolSize {#backgroundfetchespoolsize}

Ограничение на количество одновременно выполняемых выборок в связанном фоновой пуле.

### BackgroundFetchesPoolTask {#backgroundfetchespooltask}

Количество активных выборок в связанном фоновой пуле.

### BackgroundMergesAndMutationsPoolSize {#backgroundmergesandmutationspoolsize}

Ограничение на количество активных слияний и мутаций в связанном фоновой пуле.

### BackgroundMergesAndMutationsPoolTask {#backgroundmergesandmutationspooltask}

Количество активных слияний и мутаций в связанном фоновой пуле.

### BackgroundMessageBrokerSchedulePoolSize {#backgroundmessagebrokerschedulepoolsize}

Ограничение на количество задач в пуле BackgroundProcessingPool для потоковой передачи сообщений.

### BackgroundMessageBrokerSchedulePoolTask {#backgroundmessagebrokerschedulepooltask}

Количество активных задач в пуле BackgroundProcessingPool для потоковой передачи сообщений.

### BackgroundMovePoolSize {#backgroundmovepoolsize}

Ограничение на количество задач в пуле BackgroundProcessingPool для перемещений.

### BackgroundMovePoolTask {#backgroundmovepooltask}

Количество активных задач в пуле BackgroundProcessingPool для перемещений.

### BackgroundSchedulePoolSize {#backgroundschedulepoolsize}

Ограничение на количество задач в пуле BackgroundSchedulePool. Этот пул используется для периодических задач ReplicatedMergeTree, таких как очистка старых частей данных, изменение частей данных, повторная инициализация реплик и т.д.

### BackgroundSchedulePoolTask {#backgroundschedulepooltask}

Количество активных задач в пуле BackgroundSchedulePool. Этот пул используется для периодических задач ReplicatedMergeTree, таких как очистка старых частей данных, изменение частей данных, повторная инициализация реплик и т.д.

### BackupsIOThreads {#backupsiothreads}

Количество потоков в пуле потоков BackupsIO.

### BackupsIOThreadsActive {#backupsiothreadsactive}

Количество потоков в пуле потоков BackupsIO, выполняющих задачу.

### BackupsThreads {#backupsthreads}

Количество потоков в пуле потоков для BACKUP.

### BackupsThreadsActive {#backupsthreadsactive}

Количество потоков в пуле потоков для BACKUP, выполняющих задачу.

### BrokenDistributedFilesToInsert {#brokendistributedfilestoinsert}

Количество файлов для асинхронной вставки в распределенные таблицы, которые были отмечены как поврежденные. Эта метрика начнется с 0 при старте. Количество файлов для каждой шард суммируется.

### CacheDetachedFileSegments {#cachedetachedfilesegments}

Количество существующих отложенных сегментов файлов кэша.

### CacheDictionaryThreads {#cachedictionarythreads}

Количество потоков в пуле потоков CacheDictionary.

### CacheDictionaryThreadsActive {#cachedictionarythreadsactive}

Количество потоков в пуле потоков CacheDictionary, выполняющих задачу.

### CacheDictionaryUpdateQueueBatches {#cachedictionaryupdatequeuebatches}

Количество "пакетов" (набор ключей) в очереди обновления в CacheDictionaries.

### CacheDictionaryUpdateQueueKeys {#cachedictionaryupdatequeuekeys}

Точное количество ключей в очереди обновления в CacheDictionaries.

### CacheFileSegments {#cachefilesegments}

Количество существующих сегментов файлов кэша.

### ContextLockWait {#contextlockwait}

Количество потоков, ожидающих блокировки в контексте. Это глобальная блокировка.

### DDLWorkerThreads {#ddlworkerthreads}

Количество потоков в пуле потоков DDLWorker для запросов ON CLUSTER.

### DDLWorkerThreadsActive {#ddlworkerthreadsactive}

Количество потоков в пуле потоков DDLWorker для запросов ON CLUSTER, выполняющих задачу.

### DatabaseCatalogThreads {#databasecatalogthreads}

Количество потоков в пуле потоков DatabaseCatalog.

### DatabaseCatalogThreadsActive {#databasecatalogthreadsactive}

Количество потоков в пуле потоков DatabaseCatalog, выполняющих задачу.

### DatabaseOnDiskThreads {#databaseondiskthreads}

Количество потоков в пуле потоков DatabaseOnDisk.

### DatabaseOnDiskThreadsActive {#databaseondiskthreadsactive}

Количество потоков в пуле потоков DatabaseOnDisk, выполняющих задачу.

### DelayedInserts {#delayedinserts}

Количество запросов INSERT, которые замедляются из-за большого количества активных частей данных для партиции в таблице MergeTree.

### DestroyAggregatesThreads {#destroyaggregatesthreads}

Количество потоков в пуле потоков для уничтожения агрегатных состояний.

### DestroyAggregatesThreadsActive {#destroyaggregatesthreadsactive}

Количество потоков в пуле потоков для уничтожения агрегатных состояний, выполняющих задачу.

### DictCacheRequests {#dictcacherequests}

Количество запросов в пути к источникам данных словарей кэшированного типа.

### DiskObjectStorageAsyncThreads {#diskobjectstorageasyncthreads}

Количество потоков в пуле фоновых потоков для DiskObjectStorage.

### DiskObjectStorageAsyncThreadsActive {#diskobjectstorageasyncthreadsactive}

Количество потоков в пуле фоновых потоков для DiskObjectStorage, выполняющих задачу.

### DiskSpaceReservedForMerge {#diskspacereservedformerge}

Диск пространство, зарезервированное для текущих фоновых слияний. Это немного больше, чем общий размер в настоящее время сливаемых частей.

### DistributedFilesToInsert {#distributedfilestoinsert}

Количество ожидающих файлов для обработки асинхронной вставки в распределенные таблицы. Количество файлов для каждой шард суммируется.

### DistributedSend {#distributedsend}

Количество соединений с удаленными серверами, отправляющими данные, которые были INSERTed в распределенные таблицы. Как синхронный, так и асинхронный режим.

### EphemeralNode {#ephemeralnode}

Количество эфемерных узлов, хранящихся в ZooKeeper.

### FilesystemCacheElements {#filesystemcacheelements}

Элементы кэша файловой системы (сегменты файлов)

### FilesystemCacheReadBuffers {#filesystemcachereadbuffers}

Количество активных буферов кэша.

### FilesystemCacheSize {#filesystemcachesize}

Размер кэша файловой системы в байтах.

### QueryCacheBytes {#querycachebytes}

Общий размер кэша запросов в байтах.

### QueryCacheEntries {#querycacheentries}

Общее количество записей в кэше запросов.

### UncompressedCacheBytes {#uncompressedcachebytes}

Общий размер не сжатого кэша в байтах. Не сжатый кэш обычно не улучшает производительность и его следует избегать.

### UncompressedCacheCells {#uncompressedcachecells}

### CompiledExpressionCacheBytes {#compiledexpressioncachebytes}

Общее количество байтов, используемых для кэша JIT-собранного кода.

### CompiledExpressionCacheCount {#compiledexpressioncachecount}

Общее количество записей в кэше JIT-собранного кода.

### MMapCacheCells {#mmapcachecells}

Количество файлов, открытых с помощью `mmap` (отображенных в памяти). Это используется для запросов с настройкой `local_filesystem_read_method`, установленной в `mmap`. Файлы, открытые с помощью `mmap`, хранятся в кэше, чтобы избежать дорогих сбросов TLB.

### MarkCacheBytes {#markcachebytes}

Общий размер кэша меток в байтах.

### MarkCacheFiles {#markcachefiles}

Общее количество файлов меток, кэшированных в кэше меток.

### GlobalThread {#globalthread}

Количество потоков в глобальном пуле потоков.

### GlobalThreadActive {#globalthreadactive}

Количество потоков в глобальном пуле потоков, выполняющих задачу.

### HTTPConnection {#httpconnection}

Количество соединений к HTTP-серверу.

### HashedDictionaryThreads {#hasheddictionarythreads}

Количество потоков в пуле потоков HashedDictionary.

### HashedDictionaryThreadsActive {#hasheddictionarythreadsactive}

Количество потоков в пуле потоков HashedDictionary, выполняющих задачу.

### IOPrefetchThreads {#ioprefetchthreads}

Количество потоков в пуле потоков предварительной выборки IO.

### IOPrefetchThreadsActive {#ioprefetchthreadsactive}

Количество потоков в пуле потоков предварительной выборки IO, выполняющих задачу.

### IOThreads {#iothreads}

Количество потоков в пуле потоков IO.

### IOThreadsActive {#iothreadsactive}

Количество потоков в пуле потоков IO, выполняющих задачу.

### IOUringInFlightEvents {#iouringinflightevents}

Количество событий SQE в io_uring в полете.

### IOUringPendingEvents {#iouringpendingevents}

Количество SQE событий io_uring, ожидающих отправки.

### IOWriterThreads {#iowriterthreads}

Количество потоков в пуле потоков записи IO.

### IOWriterThreadsActive {#iowriterthreadsactive}

Количество потоков в пуле потоков записи IO, выполняющих задачу.

### InterserverConnection {#interserverconnection}

Количество соединений от других реплик для извлечения частей.

### KafkaAssignedPartitions {#kafkaassignedpartitions}

Количество разделов Kafka, в настоящее время назначенных.

### KafkaBackgroundReads {#kafkabackgroundreads}

Количество фоновых чтений, которые в настоящее время работают (население материализованных представлений из Kafka).

### KafkaConsumers {#kafkaconsumers}

Количество активных Kafka потребителей.

### KafkaConsumersInUse {#kafkaconsumersinuse}

Количество потребителей, которые в настоящее время используются для прямых или фоновых чтений.

### KafkaConsumersWithAssignment {#kafkaconsumerswithassignment}

Количество активных Kafka потребителей, которым назначены некоторые разделы.

### KafkaLibrdkafkaThreads {#kafkalibrdkafkathreads}

Количество активных потоков librdkafka.

### KafkaProducers {#kafkaproducers}

Количество активных созданных Kafka производителей.

### KafkaWrites {#kafkawrites}

Количество в настоящее время выполняемых вставок в Kafka.

### KeeperAliveConnections {#keeperaliveconnections}

Количество активных соединений.

### KeeperOutstandingRequests {#keeperoutstandingrequests}

Количество незавершенных запросов.

### LocalThread {#localthread}

Количество потоков в локальных пулах потоков. Потоки в локальных пулах потоков берутся из глобального пула потоков.

### LocalThreadActive {#localthreadactive}

Количество потоков в локальных пулах потоков, выполняющих задачу.

### MMappedAllocBytes {#mmappedallocbytes}

Сумма байтов mmapped аллокаций.

### MMappedAllocs {#mmappedallocs}

Общее количество mmapped аллокаций.

### MMappedFileBytes {#mmappedfilebytes}

Сумма размеров mmapped областей файлов.

### MMappedFiles {#mmappedfiles}

Общее количество mmapped файлов.

### MarksLoaderThreads {#marksloaderthreads}

Количество потоков в пуле потоков для загрузки меток.

### MarksLoaderThreadsActive {#marksloaderthreadsactive}

Количество потоков в пуле потоков для загрузки меток, выполняющих задачу.

### MaxDDLEntryID {#maxddlentryid}

Максимальный обработанный DDL-запись DDLWorker.

### MaxPushedDDLEntryID {#maxpushedddlentryid}

Максимальная DDL-запись DDLWorker, которая была отправлена в ZooKeeper.

### MemoryTracking {#memorytracking}

Общее количество памяти (в байтах), выделенной сервером.

### Merge {#merge}

Количество выполняемых фоновых слияний.

### MergeTreeAllRangesAnnouncementsSent {#mergetreeallrangesannouncementssent}

Текущий номер дублирующихся объявлений, отправляемых в полете от удаленного сервера к инициирующему серверу о наборе частей данных (для таблиц MergeTree). Измеряется со стороны удаленного сервера.

### MergeTreeBackgroundExecutorThreads {#mergetreebackgroundexecutorthreads}

Количество потоков в пуле потоков MergeTreeBackgroundExecutor.

### MergeTreeBackgroundExecutorThreadsActive {#mergetreebackgroundexecutorthreadsactive}

Количество потоков в пуле потоков MergeTreeBackgroundExecutor, выполняющих задачу.

### MergeTreeDataSelectExecutorThreads {#mergetreedataselectexecutorthreads}

Количество потоков в пуле потоков MergeTreeDataSelectExecutor.

### MergeTreeDataSelectExecutorThreadsActive {#mergetreedataselectexecutorthreadsactive}

Количество потоков в пуле потоков MergeTreeDataSelectExecutor, выполняющих задачу.

### MergeTreePartsCleanerThreads {#mergetreepartscleanerthreads}

Количество потоков в пуле потоков очистки частей MergeTree.

### MergeTreePartsCleanerThreadsActive {#mergetreepartscleanerthreadsactive}

Количество потоков в пуле потоков очистки частей MergeTree, выполняющих задачу.

### MergeTreePartsLoaderThreads {#mergetreepartsloaderthreads}

Количество потоков в пуле потоков загрузки частей MergeTree.

### MergeTreePartsLoaderThreadsActive {#mergetreepartsloaderthreadsactive}

Количество потоков в пуле потоков загрузки частей MergeTree, выполняющих задачу.

### MergeTreeReadTaskRequestsSent {#mergetreereadtaskrequestssent}

Текущее количество обратных запросов в полете от удаленного сервера обратно к инициирующему серверу для выбора задачи чтения (для функции таблицы s3Cluster и аналогичных). Измеряется со стороны удаленного сервера.

### Move {#move}

Количество в настоящее время выполняемых перемещений.

### MySQLConnection {#mysqlconnection}

Количество клиентских соединений, использующих протокол MySQL.

### NetworkReceive {#networkreceive}

Количество потоков, получающих данные из сети. Учитывается только взаимодействие с сетью, относящееся к ClickHouse, не включая сторонние библиотеки.

### NetworkSend {#networksend}

Количество потоков, отправляющих данные в сеть. Учитывается только взаимодействие с сетью, относящее к ClickHouse, не включая сторонние библиотеки.

### OpenFileForRead {#openfileforread}

Количество файлов, открытых для чтения.

### OpenFileForWrite {#openfileforwrite}

Количество файлов, открытых для записи.

### ParallelFormattingOutputFormatThreads {#parallelformattingoutputformatthreads}

Количество потоков в пуле потоков ParallelFormattingOutputFormatThreads.

### ParallelFormattingOutputFormatThreadsActive {#parallelformattingoutputformatthreadsactive}

Количество потоков в пуле потоков ParallelFormattingOutputFormatThreads, выполняющих задачу.

### PartMutation {#partmutation}

Количество мутаций (ALTER DELETE/UPDATE).

### PartsActive {#partsactive}

Активная часть данных, используемая текущими и предстоящими SELECT.

### PartsCommitted {#partscommitted}

Устарело. См. PartsActive.

### PartsCompact {#partscompact}

Компактные части.

### PartsDeleteOnDestroy {#partsdeleteondestroy}

Часть была перемещена на другой диск и должна быть удалена в собственном деструкторе.

### PartsDeleting {#partsdeleting}

Неактивная часть данных с идентификатором счётчика, в данный момент удаляемая очистителем.

### PartsOutdated {#partsoutdated}

Неактивная часть данных, но может быть использована только текущими SELECT, может быть удалена после завершения SELECT.

### PartsPreActive {#partspreactive}

Часть находится в data_parts, но не используется для SELECT.

### PartsPreCommitted {#partsprecommitted}

Устарело. См. PartsPreActive.

### PartsTemporary {#partstemporary}

Часть сейчас генерируется, она отсутствует в списке data_parts.

### PartsWide {#partswide}

Широкие части.

### PendingAsyncInsert {#pendingasyncinsert}

Количество асинхронных вставок, которые ожидают сброса.

### PostgreSQLConnection {#postgresqlconnection}

Количество клиентских соединений, использующих протокол PostgreSQL.

### Query {#query}

Количество выполняемых запросов.

### QueryPreempted {#querypreempted}

Количество запросов, которые были остановлены и ожидают из-за настройки "приоритет".

### QueryThread {#querythread}

Количество потоков обработки запросов.

### RWLockActiveReaders {#rwlockactivereaders}

Количество потоков, удерживающих блокировку на чтение в RWLock таблицы.

### RWLockActiveWriters {#rwlockactivewriters}

Количество потоков, удерживающих блокировку на запись в RWLock таблицы.

### RWLockWaitingReaders {#rwlockwaitingreaders}

Количество потоков, ожидающих чтения на RWLock таблицы.

### RWLockWaitingWriters {#rwlockwaitingwriters}

Количество потоков, ожидающих записи на RWLock таблицы.

### Read {#read}

Количество системных вызовов чтения (read, pread, io_getevents и т. д.) в полете.

### ReadTaskRequestsSent {#readtaskrequestssent}

Текущее количество обратных запросов в полете от удаленного сервера обратно к инициирующему серверу для выбора задачи чтения (для функции таблицы s3Cluster и аналогичных). Измеряется со стороны удаленного сервера.

### ReadonlyReplica {#readonlyreplica}

Количество реплицированных таблиц, которые в настоящее время находятся в состоянии только для чтения из-за повторной инициализации после потери сессии ZooKeeper или из-за запуска без настройки ZooKeeper.

### RemoteRead {#remoteread}

Количество чтений с удалённым считывателем в полете.

### ReplicatedChecks {#replicatedchecks}

Количество частей данных, проверяющих на согласованность.

### ReplicatedFetch {#replicatedfetch}

Количество частей данных, извлекаемых из реплики.

### ReplicatedSend {#replicatedsend}

Количество частей данных, отправляемых на реплики.

### RestartReplicaThreads {#restartreplicathreads}

Количество потоков в пуле потоков RESTART REPLICA.

### RestartReplicaThreadsActive {#restartreplicathreadsactive}

Количество потоков в пуле потоков RESTART REPLICA, выполняющих задачу.

### RestoreThreads {#restorethreads}

Количество потоков в пуле потоков для RESTORE.

### RestoreThreadsActive {#restorethreadsactive}

Количество потоков в пуле потоков для RESTORE, выполняющих задачу.

### Revision {#revision}

Ревизия сервера. Это число увеличивается для каждого выпуска или релиза-кандидата, кроме патч-релизов.

### S3Requests {#s3requests}

Запросы S3.

### SendExternalTables {#sendexternaltables}

Количество соединений, которые отправляют данные для внешних таблиц на удаленные серверы. Внешние таблицы используются для реализации операторов GLOBAL IN и GLOBAL JOIN с распределенными подзапросами.

### SendScalars {#sendscalars}

Количество соединений, которые отправляют данные для скалярных значений на удаленные серверы.

### StorageBufferBytes {#storagebufferbytes}

Количество байтов в буферах таблиц Buffer.

### StorageBufferRows {#storagebufferrows}

Количество строк в буферах таблиц Buffer.

### StorageDistributedThreads {#storagedistributedthreads}

Количество потоков в пуле потоков StorageDistributed.

### StorageDistributedThreadsActive {#storagedistributedthreadsactive}

Количество потоков в пуле потоков StorageDistributed, выполняющих задачу.

### StorageHiveThreads {#storagehivethreads}

Количество потоков в пуле потоков StorageHive.

### StorageHiveThreadsActive {#storagehivethreadsactive}

Количество потоков в пуле потоков StorageHive, выполняющих задачу.

### StorageS3Threads {#storages3threads}

Количество потоков в пуле потоков StorageS3.

### StorageS3ThreadsActive {#storages3threadsactive}

Количество потоков в пуле потоков StorageS3, выполняющих задачу.

### SystemReplicasThreads {#systemreplicasthreads}

Количество потоков в пуле потоков system.replicas.

### SystemReplicasThreadsActive {#systemreplicasthreadsactive}

Количество потоков в пуле потоков system.replicas, выполняющих задачу.

### TCPConnection {#tcpconnection}

Количество соединений к TCP-серверу (клиенты с нативным интерфейсом), также включает соединения сервер-сервер для распределенных запросов.

### TablesToDropQueueSize {#tablestodropqueuesize}

Количество удаленных таблиц, которые ожидают фонового удаления данных.

### TemporaryFilesForAggregation {#temporaryfilesforaggregation}

Количество временных файлов, созданных для внешней агрегации.

### TemporaryFilesForJoin {#temporaryfilesforjoin}

Количество временных файлов, созданных для JOIN.

### TemporaryFilesForSort {#temporaryfilesforsort}

Количество временных файлов, созданных для внешней сортировки.

### TemporaryFilesUnknown {#temporaryfilesunknown}

Количество временных файлов, созданных без известной цели.

### ThreadPoolFSReaderThreads {#threadpoolfsreaderthreads}

Количество потоков в пуле потоков для local_filesystem_read_method=threadpool.

### ThreadPoolFSReaderThreadsActive {#threadpoolfsreaderthreadsactive}

Количество потоков в пуле потоков для local_filesystem_read_method=threadpool, выполняющих задачу.

### ThreadPoolRemoteFSReaderThreads {#threadpoolremotefsreaderthreads}

Количество потоков в пуле потоков для remote_filesystem_read_method=threadpool.

### ThreadPoolRemoteFSReaderThreadsActive {#threadpoolremotefsreaderthreadsactive}

Количество потоков в пуле потоков для remote_filesystem_read_method=threadpool, выполняющих задачу.

### ThreadsInOvercommitTracker {#threadsinovercommittracker}

Количество ожидающих потоков внутри OvercommitTracker.

### TotalTemporaryFiles {#totaltemporaryfiles}

Количество созданных временных файлов.

### VersionInteger {#versioninteger}

Версия сервера в виде одного целого числа в системе счисления с основанием 1000. Например, версия 11.22.33 преобразуется в 11022033.

### Write {#write}

Количество системных вызовов записи (write, pwrite, io_getevents и т. д.) в полете.

### ZooKeeperRequest {#zookeeperrequest}

Количество запросов в ZooKeeper в полете.

### ZooKeeperSession {#zookeepersession}

Количество сессий (соединений) с ZooKeeper. Не должно быть более одного, так как использование более чем одного соединения с ZooKeeper может привести к ошибкам из-за отсутствия линейности (устаревшие чтения), что допускает модель согласованности ZooKeeper.

### ZooKeeperWatch {#zookeeperwatch}

Количество наблюдений (подписок на события) в ZooKeeper.

### ConcurrencyControlAcquired {#concurrencycontrolacquired}

Общее количество занятых слотов CPU.

### ConcurrencyControlSoftLimit {#concurrencycontrolsoftlimit}

Значение мягкого лимита на количество слотов CPU.

**Смотрите также**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — Содержит периодически рассчитываемые метрики.
- [system.events](/operations/system-tables/events) — Содержит множество произошедших событий.
- [system.metric_log](/operations/system-tables/metric_log) — Содержит историю значений метрик из таблиц `system.metrics` и `system.events`.
- [Мониторинг](../../operations/monitoring.md) — Основные концепции мониторинга ClickHouse.