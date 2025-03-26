---
description: 'Системная таблица, содержащая метрики, которые могут быть рассчитаны мгновенно или имеют текущее значение.'
keywords: ['системная таблица', 'метрики']
slug: /operations/system-tables/metrics
title: 'system.metrics'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.metrics

<SystemTableCloud/>

Содержит метрики, которые могут быть рассчитаны мгновенно или имеют текущее значение. Например, количество одновременно обрабатываемых запросов или текущее время задержки реплики. Эта таблица всегда актуальна.

Столбцы:

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
│ Query                                │     1 │ Количество выполняемых запросов                                         │
│ Merge                                │     0 │ Количество выполняемых фонових слияний                                  │
│ PartMutation                         │     0 │ Количество мутаций (ALTER DELETE/UPDATE)                               │
│ ReplicatedFetch                      │     0 │ Количество частей данных, извлекаемых из реплик                         │
│ ReplicatedSend                       │     0 │ Количество частей данных, отправляемых в реплики                        │
│ ReplicatedChecks                     │     0 │ Количество частей данных, проверяемых на согласованность               │
│ BackgroundMergesAndMutationsPoolTask │     0 │ Количество активных слияний и мутаций в связанном фоновом пуле        │
│ BackgroundFetchesPoolTask            │     0 │ Количество активных извлечений в связанном фоновом пуле                │
│ BackgroundCommonPoolTask             │     0 │ Количество активных задач в связанном фоновом пуле                     │
│ BackgroundMovePoolTask               │     0 │ Количество активных задач в BackgroundProcessingPool для перемещений    │
└──────────────────────────────────────┴───────┴────────────────────────────────────────────────────────────────────────┘
```

## Описания метрик {#metric-descriptions}

### AggregatorThreads {#aggregatorthreads}

Количество потоков в пуле потоков Aggregator.

### AggregatorThreadsActive {#aggregatorthreadsactive}

Количество потоков в пуле потоков Aggregator, выполняющих задачу.

### TablesLoaderForegroundThreads {#tablesloaderforegroundthreads}

Количество потоков в пуле потоков асинхронного загрузчика для переднего плана.

### TablesLoaderForegroundThreadsActive {#tablesloaderforegroundthreadsactive}

Количество потоков в пуле потоков асинхронного загрузчика для переднего плана, выполняющих задачу.

### TablesLoaderBackgroundThreads {#tablesloaderbackgroundthreads}

Количество потоков в пуле потоков асинхронного загрузчика для фона.

### TablesLoaderBackgroundThreadsActive {#tablesloaderbackgroundthreadsactive}

Количество потоков в пуле потоков асинхронного загрузчика для фона, выполняющих задачу.

### AsyncInsertCacheSize {#asyncinsertcachesize}

Количество уникальных идентификаторов хешей асинхронных вставок в кэше.

### AsynchronousInsertThreads {#asynchronousinsertthreads}

Количество потоков в пуле потоков AsynchronousInsert.

### AsynchronousInsertThreadsActive {#asynchronousinsertthreadsactive}

Количество потоков в пуле потоков AsynchronousInsert, выполняющих задачу.

### AsynchronousReadWait {#asynchronousreadwait}

Количество потоков, ожидающих асинхронного чтения.

### BackgroundBufferFlushSchedulePoolSize {#backgroundbufferflushschedulepoolsize}

Лимит на количество задач в BackgroundBufferFlushSchedulePool.

### BackgroundBufferFlushSchedulePoolTask {#backgroundbufferflushschedulepooltask}

Количество активных задач в BackgroundBufferFlushSchedulePool. Этот пул используется для периодического сброса буфера.

### BackgroundCommonPoolSize {#backgroundcommonpoolsize}

Лимит на количество задач в связанном фоновом пуле.

### BackgroundCommonPoolTask {#backgroundcommonpooltask}

Количество активных задач в связанном фоновом пуле.

### BackgroundDistributedSchedulePoolSize {#backgrounddistributedschedulepoolsize}

Лимит на количество задач в BackgroundDistributedSchedulePool.

### BackgroundDistributedSchedulePoolTask {#backgrounddistributedschedulepooltask}

Количество активных задач в BackgroundDistributedSchedulePool. Этот пул используется для распределенных отправок, которые выполняются в фоне.

### BackgroundFetchesPoolSize {#backgroundfetchespoolsize}

Лимит на количество одновременных извлечений в связанном фоновом пуле.

### BackgroundFetchesPoolTask {#backgroundfetchespooltask}

Количество активных извлечений в связанном фоновом пуле.

### BackgroundMergesAndMutationsPoolSize {#backgroundmergesandmutationspoolsize}

Лимит на количество активных слияний и мутаций в связанном фоновом пуле.

### BackgroundMergesAndMutationsPoolTask {#backgroundmergesandmutationspooltask}

Количество активных слияний и мутаций в связанном фоновом пуле.

### BackgroundMessageBrokerSchedulePoolSize {#backgroundmessagebrokerschedulepoolsize}

Лимит на количество задач в BackgroundProcessingPool для потоковой передачи сообщений.

### BackgroundMessageBrokerSchedulePoolTask {#backgroundmessagebrokerschedulepooltask}

Количество активных задач в BackgroundProcessingPool для потоковой передачи сообщений.

### BackgroundMovePoolSize {#backgroundmovepoolsize}

Лимит на количество задач в BackgroundProcessingPool для перемещений.

### BackgroundMovePoolTask {#backgroundmovepooltask}

Количество активных задач в BackgroundProcessingPool для перемещений.

### BackgroundSchedulePoolSize {#backgroundschedulepoolsize}

Лимит на количество задач в BackgroundSchedulePool. Этот пул используется для периодических задач ReplicatedMergeTree, таких как очистка старых частей данных, изменение частей данных, повторная инициализация реплики и т. д.

### BackgroundSchedulePoolTask {#backgroundschedulepooltask}

Количество активных задач в BackgroundSchedulePool. Этот пул используется для периодических задач ReplicatedMergeTree, таких как очистка старых частей данных, изменение частей данных, повторная инициализация реплики и т. д.

### BackupsIOThreads {#backupsiothreads}

Количество потоков в пуле потоков BackupsIO.

### BackupsIOThreadsActive {#backupsiothreadsactive}

Количество потоков в пуле потоков BackupsIO, выполняющих задачу.

### BackupsThreads {#backupsthreads}

Количество потоков в пуле потоков для BACKUP.

### BackupsThreadsActive {#backupsthreadsactive}

Количество потоков в пуле потоков для BACKUP, выполняющих задачу.

### BrokenDistributedFilesToInsert {#brokendistributedfilestoinsert}

Количество файлов для асинхронной вставки в распределенные таблицы, которые были помечены как поврежденные. Эта метрика будет начинаться с 0 при запуске. Количество файлов для каждой шардовой группы суммируется.

### CacheDetachedFileSegments {#cachedetachedfilesegments}

Количество существующих сегментов отключенных файлов кэша.

### CacheDictionaryThreads {#cachedictionarythreads}

Количество потоков в пуле потоков CacheDictionary.

### CacheDictionaryThreadsActive {#cachedictionarythreadsactive}

Количество потоков в пуле потоков CacheDictionary, выполняющих задачу.

### CacheDictionaryUpdateQueueBatches {#cachedictionaryupdatequeuebatches}

Количество 'пакетов' (набор ключей) в очереди обновлений в CacheDictionaries.

### CacheDictionaryUpdateQueueKeys {#cachedictionaryupdatequeuekeys}

Точное количество ключей в очереди обновлений в CacheDictionaries.

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

Количество SQL-запросов INSERT, которые замедлены из-за большого числа активных частей данных для раздела в таблице MergeTree.

### DestroyAggregatesThreads {#destroyaggregatesthreads}

Количество потоков в пуле потоков для уничтожения агрегатных состояний.

### DestroyAggregatesThreadsActive {#destroyaggregatesthreadsactive}

Количество потоков в пуле потоков для уничтожения агрегатных состояний, выполняющих задачу.

### DictCacheRequests {#dictcacherequests}

Количество запросов к источникам данных словарей кэша в полете.

### DiskObjectStorageAsyncThreads {#diskobjectstorageasyncthreads}

Количество потоков в асинхронном пуле потоков для DiskObjectStorage.

### DiskObjectStorageAsyncThreadsActive {#diskobjectstorageasyncthreadsactive}

Количество потоков в асинхронном пуле потоков для DiskObjectStorage, выполняющих задачу.

### DiskSpaceReservedForMerge {#diskspacereservedformerge}

Жесткий диск, зарезервированный для текущих фоновых слияний. Он немного превышает общий размер текущих сливаемых частей.

### DistributedFilesToInsert {#distributedfilestoinsert}

Количество ожидающих файлов для обработки асинхронной вставки в распределенные таблицы. Количество файлов для каждой шардовой группы суммируется.

### DistributedSend {#distributedsend}

Количество подключений к удаленным серверам, отправляющих данные, которые были вставлены в распределенные таблицы. Как в синхронном, так и в асинхронном режиме.

### EphemeralNode {#ephemeralnode}

Количество эфемерных узлов, удерживаемых в ZooKeeper.

### FilesystemCacheElements {#filesystemcacheelements}

Элементы кэша файловой системы (сегменты файлов).

### FilesystemCacheReadBuffers {#filesystemcachereadbuffers}

Количество активных буферов кэша.

### FilesystemCacheSize {#filesystemcachesize}

Размер кэша файловой системы в байтах.

### GlobalThread {#globalthread}

Количество потоков в глобальном пуле потоков.

### GlobalThreadActive {#globalthreadactive}

Количество потоков в глобальном пуле потоков, выполняющих задачу.

### HTTPConnection {#httpconnection}

Количество подключений к HTTP-серверу.

### HashedDictionaryThreads {#hasheddictionarythreads}

Количество потоков в пуле потоков HashedDictionary.

### HashedDictionaryThreadsActive {#hasheddictionarythreadsactive}

Количество потоков в пуле потоков HashedDictionary, выполняющих задачу.

### IOPrefetchThreads {#ioprefetchthreads}

Количество потоков в пуле потоков предварительного получения ввода-вывода.

### IOPrefetchThreadsActive {#ioprefetchthreadsactive}

Количество потоков в пуле потоков предварительного получения ввода-вывода, выполняющих задачу.

### IOThreads {#iothreads}

Количество потоков в пуле потоков ввода-вывода.

### IOThreadsActive {#iothreadsactive}

Количество потоков в пуле потоков ввода-вывода, выполняющих задачу.

### IOUringInFlightEvents {#iouringinflightevents}

Количество io_uring SQE, находящихся в полете.

### IOUringPendingEvents {#iouringpendingevents}

Количество io_uring SQE, ожидающих отправки.

### IOWriterThreads {#iowriterthreads}

Количество потоков в пуле потоков записи ввода-вывода.

### IOWriterThreadsActive {#iowriterthreadsactive}

Количество потоков в пуле потоков записи ввода-вывода, выполняющих задачу.

### InterserverConnection {#interserverconnection}

Количество подключений от других реплик для извлечения частей.

### KafkaAssignedPartitions {#kafkaassignedpartitions}

Количество партиций, которые в настоящее время назначены таблицам Kafka.

### KafkaBackgroundReads {#kafkabackgroundreads}

Количество фоновых чтений, которые в настоящее время работают (население материализованных представлений из Kafka).

### KafkaConsumers {#kafkaconsumers}

Количество активных потребителей Kafka.

### KafkaConsumersInUse {#kafkaconsumersinuse}

Количество потребителей, которые в настоящее время используются для прямых или фоновых чтений.

### KafkaConsumersWithAssignment {#kafkaconsumerswithassignment}

Количество активных потребителей Kafka, у которых есть назначенные партиции.

### KafkaLibrdkafkaThreads {#kafkalibrdkafkathreads}

Количество активных потоков librdkafka.

### KafkaProducers {#kafkaproducers}

Количество активных созданных производителей Kafka.

### KafkaWrites {#kafkawrites}

Количество в настоящее время выполняемых вставок в Kafka.

### KeeperAliveConnections {#keeperaliveconnections}

Количество активных подключений.

### KeeperOutstandingRequests {#keeperoutstandingrequests}

Количество ожидающих запросов.

### LocalThread {#localthread}

Количество потоков в локальных пулах потоков. Потоки в локальных пулах потоков берутся из глобального пула потоков.

### LocalThreadActive {#localthreadactive}

Количество потоков в локальных пулах потоков, выполняющих задачу.

### MMappedAllocBytes {#mmappedallocbytes}

Сумма байтов mmapped-выделений.

### MMappedAllocs {#mmappedallocs}

Общее количество mmapped-выделений.

### MMappedFileBytes {#mmappedfilebytes}

Сумма размера mmapped-области файлов.

### MMappedFiles {#mmappedfiles}

Общее количество mmapped-файлов.

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

Текущее количество объявлений, которые отправляются в полете от удаленного сервера к инициирующему серверу о наборе частей данных (для таблиц MergeTree). Измеряется на стороне удаленного сервера.

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

Текущее количество запросов обратного вызова в полете от удаленного сервера обратно к инициирующему серверу для выбора задачи чтения (для функции таблицы s3Cluster и подобной). Измеряется на стороне удаленного сервера.

### Move {#move}

Количество в настоящее время выполняемых перемещений.

### MySQLConnection {#mysqlconnection}

Количество клиентских подключений с использованием MySQL-протокола.

### NetworkReceive {#networkreceive}

Количество потоков, принимающих данные из сети. Включена только сетевая взаимодействие, связанная с ClickHouse, а не сторонними библиотеками.

### NetworkSend {#networksend}

Количество потоков, отправляющих данные в сеть. Включена только сетевая взаимодействие, связанная с ClickHouse, а не сторонними библиотеками.

### OpenFileForRead {#openfileforread}

Количество открытых для чтения файлов.

### OpenFileForWrite {#openfileforwrite}

Количество открытых для записи файлов.

### ParallelFormattingOutputFormatThreads {#parallelformattingoutputformatthreads}

Количество потоков в пуле потоков ParallelFormattingOutputFormatThreads.

### ParallelFormattingOutputFormatThreadsActive {#parallelformattingoutputformatthreadsactive}

Количество потоков в пуле потоков ParallelFormattingOutputFormatThreads, выполняющих задачу.

### ParallelParsingInputFormatThreads {#parallelparsinginputformatthreads}

Количество потоков в пуле потоков ParallelParsingInputFormat.

### ParallelParsingInputFormatThreadsActive {#parallelparsinginputformatthreadsactive}

Количество потоков в пуле потоков ParallelParsingInputFormat, выполняющих задачу.

### PartMutation {#partmutation}

Количество мутаций (ALTER DELETE/UPDATE).

### PartsActive {#partsactive}

Активная часть данных, используемая текущими и предстоящими SELECT.

### PartsCommitted {#partscommitted}

Устарело. См. PartsActive.

### PartsCompact {#partscompact}

Компактные части.

### PartsDeleteOnDestroy {#partsdeleteondestroy}

Часть, перемещенная на другой диск и должна быть удалена в собственном деструкторе.

### PartsDeleting {#partsdeleting}

Неактивная часть данных с идентификатором счетчика ссылок, которая сейчас удаляется очистителем.

### PartsOutdated {#partsoutdated}

Неактивная часть данных, но может использоваться только текущими SELECT, может быть удалена после завершения SELECT.

### PartsPreActive {#partspreactive}

Часть находится в data_parts, но не используется для SELECT.

### PartsPreCommitted {#partsprecommitted}

Устарело. См. PartsPreActive.

### PartsTemporary {#partstemporary}

Часть сейчас генерируется, она не в списке data_parts.

### PartsWide {#partswide}

Широкие части.

### PendingAsyncInsert {#pendingasyncinsert}

Количество асинхронных вставок, которые ожидают сброса.

### PostgreSQLConnection {#postgresqlconnection}

Количество клиентских подключений с использованием PostgreSQL-протокола.

### Query {#query}

Количество выполняемых запросов.

### QueryPreempted {#querypreempted}

Количество запросов, которые были остановлены и ожидают из-за настройки 'приоритета'.

### QueryThread {#querythread}

Количество потоков обработки запросов.

### RWLockActiveReaders {#rwlockactivereaders}

Количество потоков, удерживающих блокировку на чтение в RWLock таблицы.

### RWLockActiveWriters {#rwlockactivewriters}

Количество потоков, удерживающих блокировку на запись в RWLock таблицы.

### RWLockWaitingReaders {#rwlockwaitingreaders}

Количество потоков, ожидающих чтения в RWLock таблицы.

### RWLockWaitingWriters {#rwlockwaitingwriters}

Количество потоков, ожидающих записи в RWLock таблицы.

### Read {#read}

Количество системных вызовов чтения (read, pread, io_getevents и т. д.) в полете.

### ReadTaskRequestsSent {#readtaskrequestssent}

Текущее количество запросов обратного вызова в полете от удаленного сервера обратно к инициирующему серверу для выбора задачи чтения (для функции таблицы s3Cluster и подобной). Измеряется на стороне удаленного сервера.

### ReadonlyReplica {#readonlyreplica}

Количество реплицированных таблиц, которые в настоящее время находятся в состоянии только для чтения из-за повторной инициализации после потери сессии ZooKeeper или из-за запуска без настроенного ZooKeeper.

### RemoteRead {#remoteread}

Количество чтений с удаленным читателем в полете.

### ReplicatedChecks {#replicatedchecks}

Количество частей данных, проверяемых на согласованность.

### ReplicatedFetch {#replicatedfetch}

Количество частей данных, извлекаемых из реплики.

### ReplicatedSend {#replicatedsend}

Количество частей данных, отправляемых в реплики.

### RestartReplicaThreads {#restartreplicathreads}

Количество потоков в пуле потоков для RESTART REPLICA.

### RestartReplicaThreadsActive {#restartreplicathreadsactive}

Количество потоков в пуле потоков для RESTART REPLICA, выполняющих задачу.

### RestoreThreads {#restorethreads}

Количество потоков в пуле потоков для RESTORE.

### RestoreThreadsActive {#restorethreadsactive}

Количество потоков в пуле потоков для RESTORE, выполняющих задачу.

### Revision {#revision}

Ревизия сервера. Это число увеличивается при каждом релизе или релизе-кандидате, кроме патч-релизов.

### S3Requests {#s3requests}

Запросы S3.

### SendExternalTables {#sendexternaltables}

Количество подключений, которые отправляют данные для внешних таблиц на удаленные серверы. Внешние таблицы используются для реализации операторов GLOBAL IN и GLOBAL JOIN с распределенными подзапросами.

### SendScalars {#sendscalars}

Количество подключений, которые отправляют данные для скалярных значений на удаленные серверы.

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

Количество подключений к TCP-серверу (клиенты с нативным интерфейсом), также включаются соединения сервера-сервера для распределенных запросов.

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

Версия сервера в одном целочисленном числе в базе 1000. Например, версия 11.22.33 преобразуется в 11022033.

### Write {#write}

Количество системных вызовов записи (write, pwrite, io_getevents и т. д.) в полете.

### ZooKeeperRequest {#zookeeperrequest}

Количество запросов к ZooKeeper в полете.

### ZooKeeperSession {#zookeepersession}

Количество сессий (соединений) к ZooKeeper. Не должно быть больше одной, поскольку использование более одного соединения к ZooKeeper может привести к ошибкам из-за отсутствия линейной согласованности (устаревших чтений), которая допускается моделью согласованности ZooKeeper.

### ZooKeeperWatch {#zookeeperwatch}

Количество подписок (подписок на события) в ZooKeeper.

### ConcurrencyControlAcquired {#concurrencycontrolacquired}

Общее количество захваченных слотов CPU.

### ConcurrencyControlSoftLimit {#concurrencycontrolsoftlimit}

Значение мягкого лимита на количество слотов CPU.

**Смотрите также**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — Содержит периодически рассчитываемые метрики.
- [system.events](/operations/system-tables/events) — Содержит множество произошедших событий.
- [system.metric_log](/operations/system-tables/metric_log) — Содержит историю значений метрик из таблиц `system.metrics` и `system.events`.
- [Мониторинг](../../operations/monitoring.md) — Основные концепции мониторинга ClickHouse.
