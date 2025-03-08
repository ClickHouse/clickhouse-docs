---
slug: /sql-reference/table-functions/
sidebar_label: Функции таблиц
sidebar_position: 1
---


# Функции таблиц

Функции таблиц — это методы для построения таблиц.

Вы можете использовать функции таблиц в:

- [FROM](../../sql-reference/statements/select/from.md) клаузе запроса `SELECT`.

   Метод создания временной таблицы, доступной только в текущем запросе. Таблица удаляется после завершения запроса.

- [CREATE TABLE AS table_function()](../../sql-reference/statements/create/table.md) запросе.

   Это один из методов создания таблицы.

- [INSERT INTO TABLE FUNCTION](/sql-reference/statements/insert-into#inserting-using-a-table-function) запросе.

:::note
Вы не можете использовать функции таблиц, если настройка [allow_ddl](/operations/settings/settings#allow_ddl) отключена.
:::
| Страница | Описание |
|-----|-----|
| [fileCluster](/sql-reference/table-functions/fileCluster) | Позволяет одновременно обрабатывать файлы, соответствующие указанному пути, на нескольких узлах внутри кластера. Инициатор устанавливает соединения с рабочими узлами, расширяет шаблоны в пути к файлу и делегирует задачи чтения файлов рабочим узлам. Каждый рабочий узел запрашивает у инициатора следующий файл для обработки, повторяя процесс, пока все задачи не будут завершены (все файлы не будут прочитаны). |
| [input](/sql-reference/table-functions/input) | Функция таблицы, которая позволяет эффективно преобразовывать и вставлять данные, отправленные на сервер с заданной структурой, в таблицу с другой структурой. |
| [iceberg](/sql-reference/table-functions/iceberg) | Предоставляет интерфейс, подобный таблице, для работы с таблицами Apache Iceberg в Amazon S3, Azure, HDFS или локальном хранилище. |
| [executable](/engines/table-functions/executable) | Функция таблицы `executable` создает таблицу на основе вывода пользовательской функции (UDF), которую вы определяете в скрипте, который выводит строки в **stdout**. |
| [timeSeriesMetrics](/sql-reference/table-functions/timeSeriesMetrics) | timeSeriesMetrics возвращает таблицу метрик, используемую таблицей `db_name.time_series_table`, чей движок таблицы является TimeSeries. |
| [loop](/sql-reference/table-functions/loop) | Функция таблицы loop в ClickHouse используется для возврата результатов запроса в бесконечном цикле. |
| [url](/sql-reference/table-functions/url) | Создает таблицу из `URL` с заданным `format` и `structure` |
| [hudi](/sql-reference/table-functions/hudi) | Предоставляет интерфейс, подобный таблице, для работы с таблицами Apache Hudi в Amazon S3. |
| [fuzzQuery](/sql-reference/table-functions/fuzzQuery) | Искажает данную строку запроса случайными варьированями. |
| [clusterAllReplicas](/sql-reference/table-functions/cluster) | Позволяет обращаться ко всем шартам (настроенным в разделе `remote_servers`) кластера без создания распределенной таблицы. |
| [urlCluster](/sql-reference/table-functions/urlCluster) | Позволяет обрабатывать файлы из URL параллельно с многих узлов в указанном кластере. |
| [redis](/sql-reference/table-functions/redis) | Эта функция таблицы позволяет интегрировать ClickHouse с Redis. |
| [icebergCluster](/sql-reference/table-functions/icebergCluster) | Расширение к функции iceberg, которое позволяет обрабатывать файлы из Apache Iceberg параллельно на многих узлах в указанном кластере. |
| [view](/sql-reference/table-functions/view) | Превращает подзапрос в таблицу. Функция реализует представления. |
| [file](/sql-reference/table-functions/file) | Движок таблицы, который предоставляет интерфейс, подобный таблице, для выбора и вставки данных из файлов, аналогично функции таблицы s3. Используйте `file()` при работе с локальными файлами и `s3()` при работе с ведрами в облачном хранилище, таком как S3, GCS или MinIO. |
| [timeSeriesTags](/sql-reference/table-functions/timeSeriesTags) | Функция таблицы timeSeriesTags возвращает таблицу тегов, используемую таблицей `db_name.time_series_table`, чей движок таблицы является TimeSeries. |
| [mysql](/sql-reference/table-functions/mysql) | Позволяет выполнять запросы `SELECT` и `INSERT` на данных, которые хранятся на удаленном сервере MySQL. |
| [](/sql-reference/table-functions/s3) | Предоставляет интерфейс, подобный таблице, для выбора/вставки файлов в Amazon S3 и Google Cloud Storage. Эта функция таблицы аналогична функции hdfs, но предлагает специфические функции для S3. |
| [dictionary](/sql-reference/table-functions/dictionary) | Отображает данные словаря как таблицу ClickHouse. Работает так же, как движок Dictionary. |
| [hdfs](/sql-reference/table-functions/hdfs) | Создает таблицу из файлов в HDFS. Эта функция таблицы аналогична функциям url и file. |
| [fuzzJSON](/sql-reference/table-functions/fuzzJSON) | Искажает строку JSON случайными варьированями. |
| [hdfsCluster](/sql-reference/table-functions/hdfsCluster) | Позволяет обрабатывать файлы из HDFS параллельно с многих узлов в указанном кластере. |
| [zeros](/sql-reference/table-functions/zeros) | Используется в тестовых целях как самый быстрый метод для генерации большого количества строк. Похоже на системные таблицы `system.zeros` и `system.zeros_mt`. |
| [values](/sql-reference/table-functions/values) | создает временное хранилище, которое заполняет колонки значениями. |
| [generateRandom](/sql-reference/table-functions/generate) | Генерирует случайные данные с заданной схемой. Позволяет заполнять тестовые таблицы этими данными. Не все типы поддерживаются. |
| [deltaLake](/sql-reference/table-functions/deltalake) | Предоставляет интерфейс, подобный таблице, для работы с таблицами Delta Lake в Amazon S3. |
| [gcs](/sql-reference/table-functions/gcs) | Предоставляет интерфейс, подобный таблице, для выборки и вставки данных из Google Cloud Storage. Требует IAM роль `Storage Object User`. |
| [mergeTreeIndex](/sql-reference/table-functions/mergeTreeIndex) | Представляет содержимое индекса и файлов меток таблиц MergeTree. Может использоваться для интроспекции. |
| [postgresql](/sql-reference/table-functions/postgresql) | Позволяет выполнять запросы `SELECT` и `INSERT` на данных, которые хранятся на удаленном сервере PostgreSQL. |
| [timeSeriesData](/sql-reference/table-functions/timeSeriesData) | timeSeriesData возвращает таблицу данных, используемую таблицей `db_name.time_series_table`, чей движок таблицы является TimeSeries. |
| [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage) | Предоставляет интерфейс, подобный таблице, для выборки/вставки файлов в Azure Blob Storage. Похоже на функцию s3. |
| [odbc](/sql-reference/table-functions/odbc) | Возвращает таблицу, которая подключена через ODBC. |
| [merge](/sql-reference/table-functions/merge) | Создает временную таблицу Merge. Структура таблицы берется из первой таблицы, которая соответствует регулярному выражению. |
| [hudiCluster Table Function](/sql-reference/table-functions/hudiCluster) | Расширение к функции hudi таблицы. Позволяет обрабатывать файлы из таблиц Apache Hudi в Amazon S3 параллельно на многих узлах в указанном кластере. |
| [generate_series (generateSeries)](/sql-reference/table-functions/generate_series) | Возвращает таблицу с единственной колонкой 'generate_series' (UInt64), содержащей целые числа от начала до конца включительно. |
| [azureBlobStorageCluster](/sql-reference/table-functions/azureBlobStorageCluster) | Позволяет обрабатывать файлы из Azure Blob Storage параллельно с многих узлов в указанном кластере. |
| [jdbc](/sql-reference/table-functions/jdbc) | Возвращает таблицу, подключенную через JDBC драйвер. |
| [format](/sql-reference/table-functions/format) | Парсит данные из аргументов в соответствии с указанным форматом ввода. Если аргумент структуры не указан, он извлекается из данных. |
| [s3Cluster](/sql-reference/table-functions/s3Cluster) | Расширение к функции s3, которая позволяет обрабатывать файлы из Amazon S3 и Google Cloud Storage параллельно на многих узлах в указанном кластере. |
| [](/sql-reference/table-functions/generateSeries) |  |
| [sqlite](/sql-reference/table-functions/sqlite) | Позволяет выполнять запросы на данные, хранящиеся в базе данных SQLite. |
| [deltaLakeCluster](/sql-reference/table-functions/deltalakeCluster) | Это расширение к функции deltaLake. |
| [numbers](/sql-reference/table-functions/numbers) | Возвращает таблицы с единственной колонкой 'number', которая содержит специфицируемые целые числа. |
| [null](/sql-reference/table-functions/null) | Создает временную таблицу заданной структуры с движком таблицы Null. Функция используется для удобства написания тестов и демонстраций. |
| [remote, remoteSecure](/sql-reference/table-functions/remote) | Функция таблицы `remote` позволяет получать доступ к удаленным серверам в реальном времени, т.е. без создания распределенной таблицы. Функция таблицы `remoteSecure` аналогична `remote`, но соединение защищено. |
| [mongodb](/sql-reference/table-functions/mongodb) | Позволяет выполнять запросы `SELECT` на данных, которые хранятся на удаленном сервере MongoDB. |

