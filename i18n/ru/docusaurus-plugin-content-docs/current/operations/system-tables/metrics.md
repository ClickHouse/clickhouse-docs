---
description: 'Системная таблица, содержащая метрики, которые могут быть рассчитаны мгновенно или имеют текущее значение.'
slug: /operations/system-tables/metrics
title: 'system.metrics'
keywords: ['system table', 'metrics']
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Содержит метрики, которые могут быть рассчитаны мгновенно или имеют текущее значение. Например, количество одновременно обрабатываемых запросов или текущая задержка реплики. Эта таблица всегда актуальна.

Колонки:

- `metric` ([String](../../sql-reference/data-types/string.md)) — название метрики.
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — значение метрики.
- `description` ([String](../../sql-reference/data-types/string.md)) — описание метрики.
- `name` ([String](../../sql-reference/data-types/string.md)) — псевдоним для `metric`.

Вы можете найти все поддерживаемые метрики в исходном файле [src/Common/CurrentMetrics.cpp](https://github.com/ClickHouse/ClickHouse/blob/master/src/Common/CurrentMetrics.cpp).

**Пример**

``` sql
SELECT * FROM system.metrics LIMIT 10
```

``` text
┌─metric───────────────────────────────┬─value─┬─description────────────────────────────────────────────────────────────┐
│ Query                                │     1 │ Количество выполняемых запросов                                          │
│ Merge                                │     0 │ Количество выполняемых фоновых объединений                                │
│ PartMutation                         │     0 │ Количество мутаций (ALTER DELETE/UPDATE)                                 │
│ ReplicatedFetch                      │     0 │ Количество частей данных, извлекаемых из реплик                         │
│ ReplicatedSend                       │     0 │ Количество частей данных, отправляемых в реплики                        │
│ ReplicatedChecks                     │     0 │ Количество частей, проверяющих согласованность                           │
│ BackgroundMergesAndMutationsPoolTask │     0 │ Количество активных объединений и мутаций в связанном фоновой пулах    │
│ BackgroundFetchesPoolTask            │     0 │ Количество активных извлечений в связанном фоновой пулах                │
│ BackgroundCommonPoolTask             │     0 │ Количество активных задач в связанном фоновой пулах                     │
│ BackgroundMovePoolTask               │     0 │ Количество активных задач в BackgroundProcessingPool для перемещений    │
└──────────────────────────────────────┴───────┴────────────────────────────────────────────────────────────────────────┘
```

## Описание метрик {#metric-descriptions}

### AggregatorThreads {#aggregatorthreads}

Количество потоков в пуле потоков Aggregator.

### AggregatorThreadsActive {#aggregatorthreadsactive}

Количество потоков в пуле потоков Aggregator, выполняющих задачу.

### TablesLoaderForegroundThreads {#tablesloaderforegroundthreads}

Количество потоков в пуле потоков асинхронного загрузчика переднего плана.

### TablesLoaderForegroundThreadsActive {#tablesloaderforegroundthreadsactive}

Количество потоков в пуле потоков асинхронного загрузчика переднего плана, выполняющих задачу.

### TablesLoaderBackgroundThreads {#tablesloaderbackgroundthreads}

Количество потоков в пуле потоков асинхронного загрузчика фонового плана.

### TablesLoaderBackgroundThreadsActive {#tablesloaderbackgroundthreadsactive}

Количество потоков в пуле потоков асинхронного загрузчика фонового плана, выполняющих задачу.

### AsyncInsertCacheSize {#asyncinsertcachesize}

Количество хэш-ид асинхронных вставок в кеше.

### AsynchronousInsertThreads {#asynchronousinsertthreads}

Количество потоков в пуле потоков AsynchronousInsert.

### AsynchronousInsertThreadsActive {#asynchronousinsertthreadsactive}

Количество потоков в пуле потоков AsynchronousInsert, выполняющих задачу.

### AsynchronousReadWait {#asynchronousreadwait}

Количество потоков, ожидающих асинхронного чтения.

### BackgroundBufferFlushSchedulePoolSize {#backgroundbufferflushschedulepoolsize}

Ограничение на количество задач в BackgroundBufferFlushSchedulePool.

### BackgroundBufferFlushSchedulePoolTask {#backgroundbufferflushschedulepooltask}

Количество активных задач в BackgroundBufferFlushSchedulePool. Этот пул используется для периодических сбросов буфера.

### BackgroundCommonPoolSize {#backgroundcommonpoolsize}

Ограничение на количество задач в связанном фоновой пуле.

### BackgroundCommonPoolTask {#backgroundcommonpooltask}

Количество активных задач в связанном фоновой пуле.

### BackgroundDistributedSchedulePoolSize {#backgrounddistributedschedulepoolsize}

Ограничение на количество задач в BackgroundDistributedSchedulePool.

### BackgroundDistributedSchedulePoolTask {#backgrounddistributedschedulepooltask}

Количество активных задач в BackgroundDistributedSchedulePool. Этот пул используется для распределенной отправки данных, происходящей в фоновом режиме.

### BackgroundFetchesPoolSize {#backgroundfetchespoolsize}

Ограничение на количество одновременно извлекаемых данных в связанном фоновой пуле.

### BackgroundFetchesPoolTask {#backgroundfetchespooltask}

Количество активных извлечений в связанном фоновой пуле.

### BackgroundMergesAndMutationsPoolSize {#backgroundmergesandmutationspoolsize}

Ограничение на количество активных объединений и мутаций в связанном фоновой пуле.

### BackgroundMergesAndMutationsPoolTask {#backgroundmergesandmutationspooltask}

Количество активных объединений и мутаций в связанном фоновой пуле.

### BackgroundMessageBrokerSchedulePoolSize {#backgroundmessagebrokerschedulepoolsize}

Ограничение на количество задач в BackgroundProcessingPool для потоковой передачи сообщений.

### BackgroundMessageBrokerSchedulePoolTask {#backgroundmessagebrokerschedulepooltask}

Количество активных задач в BackgroundProcessingPool для потоковой передачи сообщений.

### BackgroundMovePoolSize {#backgroundmovepoolsize}

Ограничение на количество задач в BackgroundProcessingPool для перемещений.

### BackgroundMovePoolTask {#backgroundmovepooltask}

Количество активных задач в BackgroundProcessingPool для перемещений.

### BackgroundSchedulePoolSize {#backgroundschedulepoolsize}

Ограничение на количество задач в BackgroundSchedulePool. Этот пул используется для периодических задач ReplicatedMergeTree, таких как очистка старых частей данных, изменение частей данных, повторная инициализация реплик и т.д.

### BackgroundSchedulePoolTask {#backgroundschedulepooltask}

Количество активных задач в BackgroundSchedulePool. Этот пул используется для периодических задач ReplicatedMergeTree, таких как очистка старых частей данных, изменение частей данных, повторная инициализация реплик и т.д.

### BackupsIOThreads {#backupsiothreads}

Количество потоков в пуле потоков BackupsIO.

### BackupsIOThreadsActive {#backupsiothreadsactive}

Количество потоков в пуле потоков BackupsIO, выполняющих задачу.

### BackupsThreads {#backupsthreads}

Количество потоков в пуле потоков для BACKUP.

### BackupsThreadsActive {#backupsthreadsactive}

Количество потоков в пуле потоков для BACKUP, выполняющих задачу.

### BrokenDistributedFilesToInsert {#brokendistributedfilestoinsert}

Количество файлов для асинхронной вставки в распределенные таблицы, которые были помечены как поврежденные. Эта метрика начинается с 0 при старте. Количество файлов для каждого шард суммируется.

### CacheDetachedFileSegments {#cachedetachedfilesegments}

Количество существующих сегментов кэша файлов.

### CacheDictionaryThreads {#cachedictionarythreads}

Количество потоков в пуле потоков CacheDictionary.

### CacheDictionaryThreadsActive {#cachedictionarythreadsactive}

Количество потоков в пуле потоков CacheDictionary, выполняющих задачу.

### CacheDictionaryUpdateQueueBatches {#cachedictionaryupdatequeuebatches}

Количество 'пакетов' (набора ключей) в очереди обновления в CacheDictionaries.

### CacheDictionaryUpdateQueueKeys {#cachedictionaryupdatequeuekeys}

Точное количество ключей в очереди обновления в CacheDictionaries.

### CacheFileSegments {#cachefilesegments}

Количество существующих сегментов кэша файлов.

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

Количество запросов INSERT, которые задерживаются из-за большого количества активных частей данных для партиции в таблице MergeTree.

### DestroyAggregatesThreads {#destroyaggregatesthreads}

Количество потоков в пуле потоков для уничтожения агрегатных состояний.

### DestroyAggregatesThreadsActive {#destroyaggregatesthreadsactive}

Количество потоков в пуле потоков для уничтожения агрегатных состояний, выполняющих задачу.

### DictCacheRequests {#dictcacherequests}

Количество запросов в полете к источникам данных словарей кэшированного типа.

### DiskObjectStorageAsyncThreads {#diskobjectstorageasyncthreads}

Количество потоков в асинхронном пуле потоков для DiskObjectStorage.

### DiskObjectStorageAsyncThreadsActive {#diskobjectstorageasyncthreadsactive}

Количество потоков в асинхронном пуле потоков для DiskObjectStorage, выполняющих задачу.

### DiskSpaceReservedForMerge {#diskspacereservedformerge}

Дисковое пространство, зарезервированное для текущих фоновых объединений. Оно немного превышает общий размер частей, которые в данный момент объединяются.

### DistributedFilesToInsert {#distributedfilestoinsert}

Количество ожидающих файлов для обработки для асинхронной вставки в распределенные таблицы. Количество файлов для каждого шард суммируется.

### DistributedSend {#distributedsend}

Количество соединений с удаленными серверами, отправляющих данные, которые были INSERTированы в распределенные таблицы. Режим как синхронный, так и асинхронный.

### EphemeralNode {#ephemeralnode}

Количество эфемерных узлов в ZooKeeper.

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

Количество соединений с HTTP сервером.

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

Количество SQE io_uring в полете.

### IOUringPendingEvents {#iouringpendingevents}

Количество ожидающих SQE io_uring, ждущих отправки.

### IOWriterThreads {#iowriterthreads}

Количество потоков в пуле потоков записи IO.

### IOWriterThreadsActive {#iowriterthreadsactive}

Количество потоков в пуле потоков записи IO, выполняющих задачу.

### InterserverConnection {#interserverconnection}

Количество соединений от других реплик для извлечения частей.

### KafkaAssignedPartitions {#kafkaassignedpartitions}

Количество партиций, в которых таблицы Kafka в настоящее время назначены.

### KafkaBackgroundReads {#kafkabackgroundreads}

Количество фоновых чтений, которые в настоящее время работают (заполнение материализованных представлений из Kafka).

### KafkaConsumers {#kafkaconsumers}

Количество активных потребителей Kafka.

### KafkaConsumersInUse {#kafkaconsumersinuse}

Количество потребителей, которые в настоящее время используются для прямых или фоновых чтений.

### KafkaConsumersWithAssignment {#kafkaconsumerswithassignment}

Количество активных потребителей Kafka, у которых есть некоторые назначенные партиции.

### KafkaLibrdkafkaThreads {#kafkalibrdkafkathreads}

Количество активных потоков librdkafka.

### KafkaProducers {#kafkaproducers}

Количество активных созданных продюсеров Kafka.

### KafkaWrites {#kafkawrites}

Количество сейчас выполняемых вставок в Kafka.

### KeeperAliveConnections {#keeperaliveconnections}

Количество живых соединений.

### KeeperOutstandingRequests {#keeperoutstandingrequests}

Количество неполученных запросов.

### LocalThread {#localthread}

Количество потоков в локальных пулах потоков. Потоки в локальных пулах потоков берутся из глобального пула потоков.

### LocalThreadActive {#localthreadactive}

Количество потоков в локальных пулах потоков, выполняющих задачу.

### MMappedAllocBytes {#mmappedallocbytes}

Общее количество байтов, выделенных для mmapped.

### MMappedAllocs {#mmappedallocs}

Общее количество mmapped выделений.

### MMappedFileBytes {#mmappedfilebytes}

Общая размер mmapped-файловых регионов.

### MMappedFiles {#mmappedfiles}

Общее количество mmapped-файлов.

### MarksLoaderThreads {#marksloaderthreads}

Количество потоков в пуле потоков для загрузки марок.

### MarksLoaderThreadsActive {#marksloaderthreadsactive}

Количество потоков в пуле потоков для загрузки марок, выполняющих задачу.

### MaxDDLEntryID {#maxddlentryid}

Максимальная обработанная запись DDL от DDLWorker.

### MaxPushedDDLEntryID {#maxpushedddlentryid}

Максимальная запись DDL от DDLWorker, отправленной в ZooKeeper.

### MemoryTracking {#memorytracking}

Общее количество памяти (в байтах), выделенной сервером.

### Merge {#merge}

Количество выполняемых фоновых объединений.

### MergeTreeAllRangesAnnouncementsSent {#mergetreeallrangesannouncementssent}

Текующее количество объявлений, отправляемых в полете с удаленного сервера инициатору сервера о наборе частей данных (для таблиц MergeTree). Измеряется на стороне удаленного сервера.

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

Текующее количество запросов обратного вызова в полете с удаленного сервера обратно к инициатору для выбора задачи чтения (для таблиц MergeTree). Измеряется на стороне удаленного сервера.

### Move {#move}

Количество в настоящее время выполняемых перемещений.

### MySQLConnection {#mysqlconnection}

Количество клиентских соединений, использующих протокол MySQL.

### NetworkReceive {#networkreceive}

Количество потоков, принимающих данные из сети. Включается только взаимодействие с сетью, относящееся к ClickHouse, не включая библиотеки третьих сторон.

### NetworkSend {#networksend}

Количество потоков, отправляющих данные в сеть. Включается только взаимодействие с сетью, относящееся к ClickHouse, не включая библиотеки третьих сторон.

### OpenFileForRead {#openfileforread}

Количество файлов, открытых для чтения.

### OpenFileForWrite {#openfileforwrite}

Количество файлов, открытых для записи.

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

Часть перемещена на другой диск и должна быть удалена в собственном деструкторе.

### PartsDeleting {#partsdeleting}

Неактивная часть данных с счетчиком ссылок, которая сейчас удаляется очищающим процессом.

### PartsOutdated {#partsoutdated}

Неактивная часть данных, но может быть использована только текущими SELECT; может быть удалена после завершения SELECT.

### PartsPreActive {#partspreactive}

Часть находится в data_parts, но не используется для SELECT.

### PartsPreCommitted {#partsprecommitted}

Устарело. См. PartsPreActive.

### PartsTemporary {#partstemporary}

Часть сейчас создается, она не в списке data_parts.

### PartsWide {#partswide}

Широкие части.

### PendingAsyncInsert {#pendingasyncinsert}

Количество асинхронных вставок, ожидающих сброса.

### PostgreSQLConnection {#postgresqlconnection}

Количество клиентских соединений, использующих протокол PostgreSQL.

### Query {#query}

Количество выполняемых запросов.

### QueryPreempted {#querypreempted}

Количество запросов, которые остановлены и ожидают из-за настройки 'приоритета'.

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

Количество системных вызовов на чтение (read, pread, io_getevents и т.д.) в полете.

### ReadTaskRequestsSent {#readtaskrequestssent}

Текующее количество запросов обратного вызова в полете с удаленного сервера обратно к инициатору для выбора задачи чтения (для функции таблицы s3Cluster и аналогичных). Измеряется на стороне удаленного сервера.

### ReadonlyReplica {#readonlyreplica}

Количество реплицированных таблиц, которые в настоящее время находятся в режиме только для чтения из-за повторной инициализации после потери сессии ZooKeeper или из-за запуска без настройки ZooKeeper.

### RemoteRead {#remoteread}

Количество чтений с удаленным считывателем в полете.

### ReplicatedChecks {#replicatedchecks}

Количество частей данных, проверяющих согласованность.

### ReplicatedFetch {#replicatedfetch}

Количество частей данных, извлекаемых из реплики.

### ReplicatedSend {#replicatedsend}

Количество частей данных, отправляемых в реплики.

### RestartReplicaThreads {#restartreplicathreads}

Количество потоков в пуле потоков RESTART REPLICA.

### RestartReplicaThreadsActive {#restartreplicathreadsactive}

Количество потоков в пуле потоков RESTART REPLICA, выполняющих задачу.

### RestoreThreads {#restorethreads}

Количество потоков в пуле потоков для ВОССТАНОВЛЕНИЯ.

### RestoreThreadsActive {#restorethreadsactive}

Количество потоков в пуле потоков для ВОССТАНОВЛЕНИЯ, выполняющих задачу.

### Revision {#revision}

Ревизия сервера. Это число, увеличиваемое для каждого релиза или релиза-кандидата, кроме патч-релизов.

### S3Requests {#s3requests}

Запросы S3.

### SendExternalTables {#sendexternaltables}

Количество соединений, отправляющих данные для внешних таблиц на удаленные серверы. Внешние таблицы используются для реализации операторов GLOBAL IN и GLOBAL JOIN с распределенными подзапросами.

### SendScalars {#sendscalars}

Количество соединений, отправляющих данные для скаляров на удаленные серверы.

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

Количество соединений с TCP сервером (клиенты с нативным интерфейсом), также включаются соединения сервер-сервер для распределенных запросов.

### TablesToDropQueueSize {#tablestodropqueuesize}

Количество удаленных таблиц, ожидающих удаления данных в фоновом режиме.

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

Версия сервера в едином целочисленном формате в базе 1000. Например, версия 11.22.33 переводится в 11022033.

### Write {#write}

Количество системных вызовов на запись (write, pwrite, io_getevents и т.д.) в полете.

### ZooKeeperRequest {#zookeeperrequest}

Количество запросов к ZooKeeper в полете.

### ZooKeeperSession {#zookeepersession}

Количество сессий (соединений) к ZooKeeper. Не должно быть более одной, так как использование более чем одного соединения с ZooKeeper может привести к ошибкам из-за отсутствия линейности (устаревшие чтения), что позволяет модель согласованности ZooKeeper.

### ZooKeeperWatch {#zookeeperwatch}

Количество подписок (подписок на события) в ZooKeeper.

### ConcurrencyControlAcquired {#concurrencycontrolacquired}

Общее количество занятых слотов ЦП.

### ConcurrencyControlSoftLimit {#concurrencycontrolsoftlimit}

Значение мягкого предела на количество слотов ЦП.

**Смотрите также**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — Содержит периодически вычисляемые метрики.
- [system.events](/operations/system-tables/events) — Содержит количество произошедших событий.
- [system.metric_log](/operations/system-tables/metric_log) — Содержит историю значений метрик из таблиц `system.metrics` и `system.events`.
- [Monitoring](../../operations/monitoring.md) — Основные концепции мониторинга ClickHouse.
