---
'slug': '/integrations/s3/performance'
'sidebar_position': 2
'sidebar_label': 'Оптимизация производительности'
'title': 'Оптимизация производительности вставки и чтения S3'
'description': 'Оптимизация производительности чтения и вставки S3'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import InsertMechanics from '@site/static/images/integrations/data-ingestion/s3/insert_mechanics.png';
import Pull from '@site/static/images/integrations/data-ingestion/s3/pull.png';
import Merges from '@site/static/images/integrations/data-ingestion/s3/merges.png';
import ResourceUsage from '@site/static/images/integrations/data-ingestion/s3/resource_usage.png';
import InsertThreads from '@site/static/images/integrations/data-ingestion/s3/insert_threads.png';
import S3Cluster from '@site/static/images/integrations/data-ingestion/s3/s3Cluster.png';
import HardwareSize from '@site/static/images/integrations/data-ingestion/s3/hardware_size.png';

Этот раздел сосредоточен на оптимизации производительности при чтении и вставке данных из S3 с использованием [табличных функций s3](/sql-reference/table-functions/s3).

:::info
**Урок, описанный в этом руководстве, может быть применен к другим реализациям объектного хранилища с их собственными специализированными табличными функциями, такими как [GCS](/sql-reference/table-functions/gcs) и [Azure Blob storage](/sql-reference/table-functions/azureBlobStorage).**
:::

Перед настройкой потоков и размеров блоков для улучшения производительности вставки мы рекомендуем пользователям понять механику вставок в S3. Если вы знакомы с механикой вставок или просто хотите получить несколько быстрых советов, пропустите к нашему примеру [ниже](/integrations/s3/performance#example-dataset).

## Механика вставки (один узел) {#insert-mechanics-single-node}

Два основных фактора, помимо размера оборудования, влияют на производительность и использование ресурсов механики вставки данных ClickHouse (для одного узла): **размер блока вставки** и **параллелизм вставки**.

### Размер блока вставки {#insert-block-size}

<Image img={InsertMechanics} size="lg" border alt="Механика размера блока вставки в ClickHouse" />

При выполнении `INSERT INTO SELECT` ClickHouse получает некоторую порцию данных и ① формирует (по крайней мере) один блок вставки в памяти (по [ключу партиционирования](/engines/table-engines/mergetree-family/custom-partitioning-key)) из полученных данных. Данные блока сортируются, и применяются специфические для движка таблицы оптимизации. Затем данные сжимаются и ② записываются в хранилище базы данных в виде новой части данных.

Размер блока вставки влияет как на [использование ввода-вывода диска](https://en.wikipedia.org/wiki/Category:Disk_file_systems), так и на использование памяти сервера ClickHouse. Более крупные блоки вставки используют больше памяти, но создают больше и менее новых частей. Чем меньше частей ClickHouse необходимо создать для загрузки большого объема данных, тем меньше количества ввода-вывода на диске и автоматических [фоновых слияний требуется](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges).

При использовании запроса `INSERT INTO SELECT` в комбинации с интеграционным движком таблицы или табличной функцией, данные извлекаются сервером ClickHouse:

<Image img={Pull} size="lg" border alt="Извлечение данных из внешних источников в ClickHouse" />

Пока данные полностью не загружены, сервер выполняет цикл:

```bash
① Pull and parse the next portion of data and form an in-memory data block (one per partitioning key) from it.

② Write the block into a new part on storage.

Go to ① 
```

В ① размер зависит от размера блока вставки, который можно контролировать с помощью двух настроек:

- [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) (по умолчанию: `1048545` строк)
- [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes) (по умолчанию: `256 MiB`)

Когда либо указанное количество строк собирается в блоке вставки, либо достигается настроенный объем данных (в зависимости от того, что произойдет первым), это приведет к записи блока в новую часть. Цикл вставки продолжается на шаге ①.

Обратите внимание, что значение `min_insert_block_size_bytes` обозначает не сжатый размер блока в памяти (а не сжатый размер части на диске). Также обратите внимание, что созданные блоки и части редко точно содержат настроенное количество строк или байт, потому что ClickHouse потоково и [обрабатывает](https://clickhouse.com/company/events/query-performance-introspection) данные поблочно. Поэтому эти настройки указывают минимальные пороги.

#### Имейте в виду о слияниях {#be-aware-of-merges}

Чем меньше настроенный размер блока вставки, тем больше начальных частей создается для большой загрузки данных, и тем больше фоновых слияний частей выполняется одновременно с приемом данных. Это может вызвать конфликт ресурсов (CPU и память) и потребовать дополнительного времени (для достижения [здорового](/operations/settings/merge-tree-settings#parts_to_throw_insert) (3000) количества частей) после завершения загрузки.

:::important
Производительность запросов ClickHouse негативно пострадает, если количество частей превысит [рекомендуемые пределы](/operations/settings/merge-tree-settings#parts_to_throw_insert).
:::

ClickHouse будет постоянно [сливать части](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance) в более крупные части, пока они не [достигнут](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) сжатого размера ~150 GiB. Эта диаграмма показывает, как сервер ClickHouse сливает части:

<Image img={Merges} size="lg" border alt="Фоновые слияния в ClickHouse" />

Один сервер ClickHouse использует несколько [потоков фонового слияния](/operations/server-configuration-parameters/settings#background_pool_size) для выполнения параллельных [слияний частей](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges:~:text=to%20execute%20concurrent-,part%20merges,-.%20Each%20thread%20executes). Каждый поток выполняет цикл:

```bash
① Decide which parts to merge next, and load these parts as blocks into memory.

② Merge the loaded blocks in memory into a larger block.

③ Write the merged block into a new part on disk.

Go to ①
```

Обратите внимание, что [увеличение](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#hardware-size) количества ядер CPU и объема RAM увеличивает пропускную способность фонового слияния.

Части, которые были объединены в более крупные части, помечаются как [неактивные](/operations/system-tables/parts) и в конечном итоге удаляются через [настраиваемое](/operations/settings/merge-tree-settings#old_parts_lifetime) количество минут. С течением времени это создает дерево объединенных частей (отсюда и название [`MergeTree`](/engines/table-engines/mergetree-family) таблицы).

### Параллелизм вставки {#insert-parallelism}

<Image img={ResourceUsage} size="lg" border alt="Использование ресурсов для параллелизма вставки" />

Сервер ClickHouse может одновременно обрабатывать и вставлять данные. Уровень параллелизма вставки влияет на производительность загрузки и использование памяти сервера ClickHouse. Загрузка и обработка данных параллельно требуют больше основной памяти, но увеличивают пропускную способность загрузки, так как данные обрабатываются быстрее.

Табличные функции, такие как s3, позволяют задавать наборы имен файлов для загрузки через глобальные шаблоны. Когда глобальный шаблон соответствует нескольким существующим файлам, ClickHouse может параллельно читать данные из этих файлов и вставлять данные в таблицу, используя параллельно выполняющиеся потоки вставки (по серверу):

<Image img={InsertThreads} size="lg" border alt="Параллельные потоки вставки в ClickHouse" />

Пока все данные из всех файлов не обработаны, каждый поток вставки выполняет цикл:

```bash
① Get the next portion of unprocessed file data (portion size is based on the configured block size) and create an in-memory data block from it.

② Write the block into a new part on storage.

Go to ①. 
```

Количество таких параллельных потоков вставки можно настроить с помощью параметра [`max_insert_threads`](/operations/settings/settings#max_insert_threads). Значение по умолчанию равно `1` для открытого исходного кода ClickHouse и `4` для [ClickHouse Cloud](https://clickhouse.com/cloud).

С большим количеством файлов параллельная обработка с помощью нескольких потоков вставки работает хорошо. Она может полностью загрузить как доступные ядра CPU, так и пропускную способность сети (для параллельных загрузок файлов). В сценариях, когда в таблицу загружается всего лишь несколько больших файлов, ClickHouse автоматически устанавливает высокий уровень параллелизма обработки данных и оптимизирует использование пропускной способности сети, создавая дополнительные потоки чтения для каждого потока вставки для чтения (загрузки) более различных диапазонов в пределах больших файлов параллельно.

Для функции и таблицы s3 параллельная загрузка отдельного файла определяется значениями [max_download_threads](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_threads) и [max_download_buffer_size](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_buffer_size). Файлы будут загружаться параллельно только если их размер превышает `2 * max_download_buffer_size`. По умолчанию значение `max_download_buffer_size` установлено на 10 Миб. В некоторых случаях вы можете безопасно увеличить этот размер буфера до 50 МБ (`max_download_buffer_size=52428800`), с целью обеспечить, чтобы каждый файл загружался только одним потоком. Это может уменьшить время, затрачиваемое каждым потоком на вызовы S3, и тем самым снизить время ожидания S3. Кроме того, для файлов, которые слишком малы для параллельного чтения, чтобы увеличить пропускную способность, ClickHouse автоматически предварительно загружает данные, предварительно прочитывая такие файлы асинхронно.

## Измерение производительности {#measuring-performance}

Оптимизация производительности запросов с использованием табличных функций S3 необходима как при выполнении запросов к данным на месте, т.е. ad-hoc запросах, где используется только вычисление ClickHouse, и данные остаются в S3 в оригинальном формате, так и при вставке данных из S3 в движок таблицы ClickHouse MergeTree. Если не указано иное, следующие рекомендации применимы к обоим сценариям.

## Влияние размера оборудования {#impact-of-hardware-size}

<Image img={HardwareSize} size="lg" border alt="Влияние размера оборудования на производительность ClickHouse" />

Количество доступных ядер CPU и размер RAM влияют на:

- поддержку [начального размера частей](#insert-block-size)
- возможный уровень [параллелизма вставки](#insert-parallelism)
- пропускную способность [фоновых слияний частей](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)

и, таким образом, на общую пропускную способность загрузки.

## Региональная локализация {#region-locality}

Убедитесь, что ваши корзины расположены в том же регионе, что и ваши экземпляры ClickHouse. Эта простая оптимизация может значительно улучшить производительность пропускной способности, особенно если вы размещаете свои экземпляры ClickHouse на инфраструктуре AWS.

## Форматы {#formats}

ClickHouse может читать файлы, хранящиеся в корзинах S3, в [поддерживаемых форматах](/interfaces/formats#formats-overview) с использованием функции `s3` и движка `S3`. Если читать сырые файлы, некоторые из этих форматов имеют разные преимущества:

* Форматы с закодированными именами колонок, такие как Native, Parquet, CSVWithNames и TabSeparatedWithNames, будут менее многословными для запроса, поскольку пользователю не потребуется указывать имя колонки в функции `s3`. Имена колонок позволяют получить информацию из этих данных.
* Форматы будут отличаться по производительности относительно скорости чтения и записи. Native и Parquet представляют собой самые оптимальные форматы для производительности чтения, поскольку они уже ориентированы на столбцы и более компактны. Кроме того, нативный формат имеет преимущество в соответствии с тем, как ClickHouse хранит данные в памяти - что позволяет уменьшить накладные расходы на обработку при потоковой передаче данных в ClickHouse.
* Размер блока часто влияет на задержку чтения больших файлов. Это особенно заметно, если вы только выполняете выборку из данных, т.е. возвращаете первые N строк. В случае таких форматов, как CSV и TSV, файлы должны быть разборчивыми, чтобы вернуть набор строк. Форматы, такие как Native и Parquet, позволят быструю выборку в результате.
* Каждый формат сжатия имеет свои плюсы и минусы, часто балансируя уровень сжатия для скорости и смещения производительности сжатия или разжатия. Если сжимать сырые файлы, такие как CSV или TSV, lz4 предлагает самую быструю производительность разжатия за счет уровня сжатия. Gzip, как правило, обеспечивает лучшее сжатие за счет незначительного уменьшения скорости чтения. Xz это продвигает дальше, предлагая, как правило, лучшее сжатие с самой медленной производительностью сжатия и разжатия. Если экспортировать, Gz и lz4 предлагают сопоставимые скорости сжатия. Сравните это с вашими скоростями соединения. Любые выигрыши от более быстрого разжатия или сжатия легко могут быть нивелированы медленным соединением с вашими корзинами s3.
* Форматы, такие как native или parquet, обычно не оправдывают накладные расходы на сжатие. Любые экономии в размере данных, скорее всего, будут минимальными, поскольку эти форматы по своей природе компактны. Время, затраченное на сжатие и разжатие, редко компенсирует время передачи по сети — особенно если s3 доступен по всему миру с более высокой пропускной способностью сети.

## Пример набора данных {#example-dataset}

Чтобы проиллюстрировать дальнейшие потенциальные оптимизации, мы будем использовать [посты из набора данных Stack Overflow](/data-modeling/schema-design#stack-overflow-dataset) - оптимизируя как запрос, так и производительность вставки этих данных.

Этот набор данных состоит из 189 файлов Parquet, по одному на каждый месяц с июля 2008 года по март 2024 года.

Обратите внимание, что мы используем Parquet для производительности, согласно нашим [рекомендациям выше](#formats), выполняя все запросы на кластере ClickHouse, расположенном в том же регионе, что и корзина. Этот кластер состоит из 3 узлов, каждый с 32 ГиБ ОЗУ и 8 vCPU.

Без каких-либо настроек мы демонстрируем производительность вставки этого набора данных в движок таблицы MergeTree, а также выполняем запрос для вычисления пользователей, задающих наибольшее количество вопросов. Оба этих запроса намеренно требуют полного сканирования данных.

```sql
-- Top usernames
SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5

┌─OwnerDisplayName─┬─num_posts─┐
│ user330315       │     10344 │
│ user4039065      │      5316 │
│ user149341       │      4102 │
│ user529758       │      3700 │
│ user3559349      │      3068 │
└──────────────────┴───────────┘

5 rows in set. Elapsed: 3.013 sec. Processed 59.82 million rows, 24.03 GB (19.86 million rows/s., 7.98 GB/s.)
Peak memory usage: 603.64 MiB.

-- Load into posts table
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')

0 rows in set. Elapsed: 191.692 sec. Processed 59.82 million rows, 24.03 GB (312.06 thousand rows/s., 125.37 MB/s.)
```

В нашем примере мы возвращаем всего несколько строк. Если вы измеряете производительность запросов `SELECT`, где большие объемы данных возвращаются клиенту, используйте [null формат](/interfaces/formats/#null) для запросов или направляйте результаты на [`Null` engine](/engines/table-engines/special/null.md). Это должно избежать перегрузки клиента данными и насыщения сети.

:::info
При чтении из запросов начальный запрос может показаться более медленным, чем если бы тот же запрос был повторен. Это может быть связано как с собственным кэшированием S3, так и с [Кэшем вывода схемы ClickHouse](/operations/system-tables/schema_inference_cache). Это хранилище хранит выведенную схему для файлов и означает, что шаг вывода может быть пропущен при последующих обращениях, тем самым reducing время запроса.
:::

## Использование потоков для чтения {#using-threads-for-reads}

Производительность чтения в S3 будет линейно увеличиваться с количеством ядер, при условии, что вы не ограничены пропускной способностью сети или локальным вводом-выводом. Увеличение количества потоков также имеет накладные расходы на память, о которых пользователи должны знать. Следующее можно изменить для повышения производительности чтения:

* Обычно значение по умолчанию для `max_threads` достаточно, т.е. количество ядер. Если объем памяти, используемой для запроса, высок, и это нужно уменьшить, или `LIMIT` на результатах низок, это значение можно установить ниже. Пользователи с большим объемом памяти могут попробовать увеличить это значение для возможного повышения пропускной способности чтения из S3. Обычно это только полезно на машинах с меньшим количеством ядер, т.е. &lt; 10. Выгода от дальнейшей параллелизации, как правило, уменьшается, поскольку другие ресурсы действуют как узкое место, т.е. конфликты сети и CPU.
* Версии ClickHouse перед 22.3.1 параллелизовали чтения по нескольким файлам только при использовании функции `s3` или движка таблицы `S3`. Это требовало от пользователя обеспечения того, чтобы файлы были разделены на фрагменты на S3 и читались с использованием глобального шаблона для достижения оптимальной производительности чтения. Более поздние версии теперь параллелизуют загрузку внутри файла.
* В сценариях с низким количеством потоков пользователи могут извлечь выгоду из установки `remote_filesystem_read_method` в "read", чтобы обеспечить синхронное чтение файлов из S3.
* Для функции и таблицы s3 параллельная загрузка отдельного файла определяется значениями [`max_download_threads`](/operations/settings/settings#max_download_threads) и [`max_download_buffer_size`](/operations/settings/settings#max_download_buffer_size). В то время как [`max_download_threads`](/operations/settings/settings#max_download_threads) контролирует количество используемых потоков, файлы будут загружаться параллельно только если их размер превышает 2 * `max_download_buffer_size`. По умолчанию значение `max_download_buffer_size` установлено на 10 Миб. В некоторых случаях вы можете безопасно увеличить этот размер буфера до 50 МБ (`max_download_buffer_size=52428800`), с целью обеспечить, чтобы меньшие файлы загружались только одним потоком. Это может сократить время, которое каждый поток тратит на вызовы S3, и, следовательно, снизить время ожидания S3. См. [этот блог-пост](https://clickhouse.com/blog/clickhouse-1-trillion-row-challenge) для примера этого.

Перед внесением каких-либо изменений для повышения производительности убедитесь, что вы проводите правильные измерения. Поскольку запросы API S3 чувствительны к задержке и могут влиять на время клиента, используйте журнал запросов для получения метрик производительности, т.е. `system.query_log`.

Рассмотрим наш предыдущий запрос, удвоение `max_threads` до `16` (по умолчанию `max_thread` равно количеству ядер на узле) улучшает производительность нашего запроса на чтение в 2 раза за счет увеличения использования памяти. Дальнейшее увеличение `max_threads` дает уменьшаемую отдачу, как показано.

```sql
SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 16

┌─OwnerDisplayName─┬─num_posts─┐
│ user330315       │     10344 │
│ user4039065      │      5316 │
│ user149341       │      4102 │
│ user529758       │      3700 │
│ user3559349      │      3068 │
└──────────────────┴───────────┘

5 rows in set. Elapsed: 1.505 sec. Processed 59.82 million rows, 24.03 GB (39.76 million rows/s., 15.97 GB/s.)
Peak memory usage: 178.58 MiB.

SETTINGS max_threads = 32

5 rows in set. Elapsed: 0.779 sec. Processed 59.82 million rows, 24.03 GB (76.81 million rows/s., 30.86 GB/s.)
Peak memory usage: 369.20 MiB.

SETTINGS max_threads = 64

5 rows in set. Elapsed: 0.674 sec. Processed 59.82 million rows, 24.03 GB (88.81 million rows/s., 35.68 GB/s.)
Peak memory usage: 639.99 MiB.
```

## Настройка потоков и размера блока для вставок {#tuning-threads-and-block-size-for-inserts}

Для достижения максимальной производительности загрузки вы должны выбрать (1) размер блока вставки и (2) соответствующий уровень параллелизма вставки на основе (3) количества доступных ядер CPU и RAM. В резюме:

- Чем больше мы [настраиваем размер блока вставки](#insert-block-size), тем меньше частей ClickHouse необходимо создать, и тем меньше [ввода-вывода на диске](https://en.wikipedia.org/wiki/Category:Disk_file_systems) и [фоновых слияний](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) требуется.  
- Чем больше мы настраиваем [количество параллельных потоков вставки](#insert-parallelism), тем быстрее будут обрабатываться данные.

Существует конфликтующая торговля между этими двумя факторами производительности (плюс компромисс с фоновыми слияниями частей). Объем доступной основной памяти серверов ClickHouse ограничен. Более крупные блоки используют больше основной памяти, что ограничивает количество параллельных потоков вставки, которые мы можем использовать. Напротив, более высокое число параллельных потоков вставки требует больше основной памяти, так как количество потоков вставки определяет количество блоков вставки, создаваемых в памяти одновременно. Это ограничивает возможный размер блоков вставки. Кроме того, может возникнуть конфликт ресурсов между потоками вставки и потоками фонового слияния. Высокое количество настроенных потоков вставки (1) создает больше частей, которые необходимо объединить, и (2) отнимает ядра CPU и память у потоков фонового слияния.

Для подробного описания того, как поведение этих параметров влияет на производительность и ресурсы, мы рекомендуем [прочитать этот блог-пост](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2). Как описано в этом блог-посте, настройка может включать тщательный баланс двух параметров. Это исчерпывающее тестирование часто является непрактичным, поэтому в резюме мы рекомендуем:

```bash
• max_insert_threads: choose ~ half of the available CPU cores for insert threads (to leave enough dedicated cores for background merges)

• peak_memory_usage_in_bytes: choose an intended peak memory usage; either all available RAM (if it is an isolated ingest) or half or less (to leave room for other concurrent tasks)

Then:
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```

С помощью этой формулы вы можете установить `min_insert_block_size_rows` в 0 (чтобы отключить порог на основе строк), установив `max_insert_threads` на выбранное значение и `min_insert_block_size_bytes` на рассчитанный результат из вышеприведенной формулы.

Используя эту формулу с нашим ранее упомянутым примером Stack Overflow:

- `max_insert_threads=4` (8 ядер на узел)
- `peak_memory_usage_in_bytes` - 32 ГиБ (100% ресурсов узла) или `34359738368` байт.
- `min_insert_block_size_bytes` = `34359738368/(3*4) = 2863311530`

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 128.566 sec. Processed 59.82 million rows, 24.03 GB (465.28 thousand rows/s., 186.92 MB/s.)
```

Как видно, настройка этих параметров улучшила производительность вставки более чем на `33%`. Мы оставляем это читателю, чтобы узнать, сможет ли улучшить производительность одиночного узла еще больше.

## Масштабирование с ресурсами и узлами {#scaling-with-resources-and-nodes}

Масштабирование с ресурсами и узлами применяется как к запросам на чтение, так и к запросам на вставку.

### Вертикальное масштабирование {#vertical-scaling}

Все предыдущие настройки и запросы использовали только один узел в нашем кластере ClickHouse Cloud. Пользователи также часто имеют более одного узла ClickHouse. Мы рекомендуем пользователям сначала масштабировать вертикально, улучшая пропускную способность S3 линейно с увеличением количества ядер. Если мы повторим наши предыдущие запросы на вставку и чтение на большем узле ClickHouse Cloud с удвоенными ресурсами (64 ГиБ, 16 vCPUs) с соответствующими настройками, оба будут выполняться примерно в два раза быстрее.

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=8, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 67.294 sec. Processed 59.82 million rows, 24.03 GB (888.93 thousand rows/s., 357.12 MB/s.)

SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 92

5 rows in set. Elapsed: 0.421 sec. Processed 59.82 million rows, 24.03 GB (142.08 million rows/s., 57.08 GB/s.)
```

:::note
Отдельные узлы также могут сталкиваться с узкими местами из-за сети и запросов S3 GET, что препятствует линейному масштабированию производительности вертикально.
:::

### Горизонтальное масштабирование {#horizontal-scaling}

В конечном счете, горизонтальное масштабирование часто необходимо из-за доступности оборудования и экономической эффективности. В ClickHouse Cloud производственные кластеры имеют не менее 3 узлов. Пользователи также могут захотеть использовать все узлы для вставки.

Использование кластера для чтения из S3 требует использования функции `s3Cluster`, как описано в [Использование кластеров](/integrations/s3#utilizing-clusters). Это позволяет распределять чтения по узлам.

Сервер, который первоначально получает запрос вставки, сначала разрешает глобальный шаблон, а затем динамически распределяет обработку каждого соответствующего файла на себя и другие серверы.

<Image img={S3Cluster} size="lg" border alt="Функция s3Cluster в ClickHouse" />

Мы повторяем наш предыдущий запрос на чтение, распределяя нагрузку по 3 узлам, подгоняя запрос для использования `s3Cluster`. Это выполняется автоматически в ClickHouse Cloud, ссылаясь на кластер `default`.

Как отмечалось в [Использование кластеров](/integrations/s3#utilizing-clusters), эта работа распределяется на уровне файлов. Для использования этой функции пользователям потребуется достаточное количество файлов, т.е. хотя бы > количество узлов.

```sql
SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 16

┌─OwnerDisplayName─┬─num_posts─┐
│ user330315       │     10344 │
│ user4039065      │      5316 │
│ user149341       │      4102 │
│ user529758       │      3700 │
│ user3559349      │      3068 │
└──────────────────┴───────────┘

5 rows in set. Elapsed: 0.622 sec. Processed 59.82 million rows, 24.03 GB (96.13 million rows/s., 38.62 GB/s.)
Peak memory usage: 176.74 MiB.
```

Аналогично, наш запрос на вставку можно распределить, используя улучшенные настройки, выявленные ранее для одного узла:

```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 171.202 sec. Processed 59.82 million rows, 24.03 GB (349.41 thousand rows/s., 140.37 MB/s.)
```

Читатели заметят, что чтение файлов улучшило производительность запроса, но не производительность вставок. По умолчанию, хотя чтения распределяются с использованием `s3Cluster`, вставки будут происходить против инициирующего узла. Это означает, что, хотя чтения будут происходить на каждом узле, полученные строки будут направлены к инициатору для распределения. В сценариях с высокой пропускной способностью это может стать узким местом. Чтобы устранить это, установите параметр `parallel_distributed_insert_select` для функции `s3cluster`.

Установив его значение на `parallel_distributed_insert_select=2`, мы обеспечиваем выполнение `SELECT` и `INSERT` на каждом шарде из/в подлежащую таблицу распределенного движка на каждом узле.

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 54.571 sec. Processed 59.82 million rows, 24.03 GB (1.10 million rows/s., 440.38 MB/s.)
Peak memory usage: 11.75 GiB.
```

Как и ожидалось, это уменьшает производительность вставки в 3 раза.

## Дальнейшая настройка {#further-tuning}

### Отключение дедупликации {#disable-de-duplication}

Операции вставки иногда могут завершаться неудачно из-за ошибок, таких как тайм-ауты. Когда вставки не удались, данные могли быть успешно вставлены, а могли и нет. Чтобы разрешить безопасно повторно пытаться вставить данные клиентом, по умолчанию в распределенных развертываниях, таких как ClickHouse Cloud, ClickHouse пытается определить, были ли данные уже успешно вставлены. Если вставленные данные помечены как дубликаты, ClickHouse не вставляет их в целевую таблицу. Однако пользователь все равно получит статус успешной операции, как будто данные были вставлены нормально.

Хотя это поведение, которое влечет за собой дополнительные накладные расходы на вставку, имеет смысл при загрузке данных с клиента или партиями, оно может быть избыточным при выполнении `INSERT INTO SELECT` из объектного хранилища. Отключив эту функциональность во время вставки, мы можем улучшить производительность, как показано ниже:

```sql
INSERT INTO posts
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0

0 rows in set. Elapsed: 52.992 sec. Processed 59.82 million rows, 24.03 GB (1.13 million rows/s., 453.50 MB/s.)
Peak memory usage: 26.57 GiB.
```

### Оптимизация при вставке {#optimize-on-insert}

В ClickHouse настройка `optimize_on_insert` управляет тем, происходит ли слияние частей данных в процессе вставки. Когда включено (`optimize_on_insert = 1` по умолчанию), небольшие части сливаются в более крупные по мере их вставки, улучшая производительность запросов, уменьшая количество частей, которые необходимо прочитать. Тем не менее, это слияние добавляет накладные расходы к процессу вставки, потенциально замедляя вставку с высокой производительностью.

Отключение этой настройки (`optimize_on_insert = 0`) пропускает слияние во время вставок, позволяя данным записываться быстрее, особенно при работе с частыми маленькими вставками. Процесс слияния откладывается на фон, что позволяет лучше справляться с производительностью вставки, но временно увеличивает количество мелких частей, что может замедлить запросы, пока фоновые слияния не завершатся. Эта настройка идеальна, когда производительность вставки является приоритетом, и процесс фонового слияния может эффективно выполнять оптимизацию позже. Как показано ниже, отключение настройки может улучшить пропускную способность вставки:

```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 rows in set. Elapsed: 49.688 sec. Processed 59.82 million rows, 24.03 GB (1.20 million rows/s., 483.66 MB/s.)
```

## Разные заметки {#misc-notes}

* Для сценариев с низким объемом памяти рассмотрите возможность понижения `max_insert_delayed_streams_for_parallel_write`, если вставляете в S3.
