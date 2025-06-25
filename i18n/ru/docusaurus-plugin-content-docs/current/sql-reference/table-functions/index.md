---
description: 'Документация для Табличных Функций'
sidebar_label: 'Табличные Функции'
sidebar_position: 1
slug: /sql-reference/table-functions/
title: 'Табличные Функции'
---


# Табличные Функции

Табличные функции — это методы для создания таблиц.

Вы можете использовать табличные функции в:

- [FROM](../../sql-reference/statements/select/from.md) части запроса `SELECT`.

   Метод создания временной таблицы, которая доступна только в текущем запросе. Таблица удаляется, когда запрос завершается.

- [CREATE TABLE AS table_function()](../../sql-reference/statements/create/table.md) запросе.

   Это один из методов создания таблицы.

- [INSERT INTO TABLE FUNCTION](/sql-reference/statements/insert-into#inserting-using-a-table-function) запросе.

:::note
Вы не можете использовать табличные функции, если настройка [allow_ddl](/operations/settings/settings#allow_ddl) отключена.
:::
| Страница | Описание |
|-----|-----|
| [fileCluster](/sql-reference/table-functions/fileCluster) | Включает одновременную обработку файлов, соответствующих указанному пути, на нескольких узлах кластера. Инициатор устанавливает соединения с рабочими узлами, расширяет шаблоны в пути к файлу и делегирует задачи чтения файлов рабочим узлам. Каждый рабочий узел запрашивает у инициатора следующий файл для обработки, повторяя до завершения всех задач (все файлы прочитаны). |
| [input](/sql-reference/table-functions/input) | Табличная функция, которая позволяет эффективно конвертировать и вставлять данные, отправленные на сервер с заданной структурой, в таблицу с другой структурой. |
| [iceberg](/sql-reference/table-functions/iceberg) | Обеспечивает интерфейс, похожий на таблицу, только для чтения, к таблицам Apache Iceberg в Amazon S3, Azure, HDFS или локально хранящимся. |
| [executable](/engines/table-functions/executable) | Табличная функция `executable` создает таблицу на основе вывода пользовательской функции (UDF), которую вы определяете в скрипте, выводящем строки в **stdout**. |
| [timeSeriesMetrics](/sql-reference/table-functions/timeSeriesMetrics) | timeSeriesMetrics возвращает таблицу метрик, используемую таблицей `db_name.time_series_table`, чье движок таблицы — TimeSeries. |
| [loop](/sql-reference/table-functions/loop) | Табличная функция loop в ClickHouse используется для возвращения результатов запроса в бесконечном цикле. |
| [url](/sql-reference/table-functions/url) | Создает таблицу из `URL` с заданным `формат` и `структуре` |
| [hudi](/sql-reference/table-functions/hudi) | Обеспечивает интерфейс, похожий на таблицу, только для чтения, к таблицам Apache Hudi в Amazon S3. |
| [fuzzQuery](/sql-reference/table-functions/fuzzQuery) | Изменяет заданную строку запроса случайными вариациями. |
| [clusterAllReplicas](/sql-reference/table-functions/cluster) | Позволяет получить доступ ко всем шартам (настроенным в разделе `remote_servers`) кластера без создания распределенной таблицы. |
| [urlCluster](/sql-reference/table-functions/urlCluster) | Позволяет обрабатывать файлы по URL параллельно с разных узлов в указанном кластере. |
| [redis](/sql-reference/table-functions/redis) | Эта табличная функция позволяет интегрировать ClickHouse с Redis. |
| [icebergCluster](/sql-reference/table-functions/icebergCluster) | Расширение табличной функции iceberg, позволяющее параллельно обрабатывать файлы из Apache Iceberg на многих узлах в указанном кластере. |
| [view](/sql-reference/table-functions/view) | Превращает подзапрос в таблицу. Функция реализует представления. |
| [file](/sql-reference/table-functions/file) | Движок таблицы, который предоставляет интерфейс, похожий на таблицу, для выполнения SELECT и INSERT из файлов, аналогично функции s3. Используйте `file()` при работе с локальными файлами и `s3()` при работе с хранилищами объектов, такими как S3, GCS или MinIO. |
| [timeSeriesTags](/sql-reference/table-functions/timeSeriesTags) | Табличная функция timeSeriesTags возвращает таблицу тегов, используемую таблицей `db_name.time_series_table`, чье движок таблицы — TimeSeries. |
| [mysql](/sql-reference/table-functions/mysql) | Позволяет выполнять запросы `SELECT` и `INSERT` на данных, хранящихся на удаленном сервере MySQL. |
| [mergeTreeProjection](/sql-reference/table-functions/mergeTreeProjection) | Представляет содержимое некоторой проекции в таблицах MergeTree. Может быть использована для инстроспекции. |
| [s3 Table Function](/sql-reference/table-functions/s3) | Обеспечивает интерфейс, похожий на таблицу, для выбора/вставки файлов в Amazon S3 и Google Cloud Storage. Эта табличная функция аналогична функции hdfs, но предоставляет специфические функции для S3. |
| [dictionary](/sql-reference/table-functions/dictionary) | Отображает данные словаря как таблицу ClickHouse. Работает так же, как движок Dictionary. |
| [hdfs](/sql-reference/table-functions/hdfs) | Создает таблицу из файлов в HDFS. Эта табличная функция аналогична функциям url и file. |
| [fuzzJSON](/sql-reference/table-functions/fuzzJSON) | Изменяет строку JSON случайными вариациями. |
| [hdfsCluster](/sql-reference/table-functions/hdfsCluster) | Позволяет обрабатывать файлы из HDFS параллельно на многих узлах в указанном кластере. |
| [zeros](/sql-reference/table-functions/zeros) | Используется в тестовых целях как самый быстрый метод для генерации множества строк. Аналогично системным таблицам `system.zeros` и `system.zeros_mt`. |
| [values](/sql-reference/table-functions/values) | создает временное хранилище, которое заполняет колонки значениями. |
| [generateRandom](/sql-reference/table-functions/generate) | Генерирует случайные данные с заданной схемой. Позволяет заполнять тестовые таблицы этими данными. Не все типы поддерживаются. |
| [deltaLake](/sql-reference/table-functions/deltalake) | Обеспечивает интерфейс, похожий на таблицу, только для чтения, к таблицам Delta Lake в Amazon S3. |
| [gcs](/sql-reference/table-functions/gcs) | Предоставляет интерфейс, похожий на таблицу, для `SELECT` и `INSERT` данных из Google Cloud Storage. Требует IAM роли `Storage Object User`. |
| [mergeTreeIndex](/sql-reference/table-functions/mergeTreeIndex) | Представляет содержимое индексных и меток файлов таблиц MergeTree. Может быть использована для инстроспекции. |
| [postgresql](/sql-reference/table-functions/postgresql) | Позволяет выполнять запросы `SELECT` и `INSERT` на данных, хранящихся на удаленном сервере PostgreSQL. |
| [timeSeriesData](/sql-reference/table-functions/timeSeriesData) | timeSeriesData возвращает таблицу данных, используемую таблицей `db_name.time_series_table`, чье движок таблицы — TimeSeries. |
| [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage) | Предоставляет интерфейс, похожий на таблицу, для выбора/вставки файлов в Azure Blob Storage. Похожа на функцию s3. |
| [odbc](/sql-reference/table-functions/odbc) | Возвращает таблицу, которая подключена через ODBC. |
| [merge](/sql-reference/table-functions/merge) | Создает временную таблицу Merge. Структура будет выведена из базовых таблиц с использованием объединения их колонок и определения общих типов. |
| [hudiCluster Table Function](/sql-reference/table-functions/hudiCluster) | Расширение табличной функции hudi. Позволяет параллельно обрабатывать файлы из таблиц Apache Hudi в Amazon S3 на многих узлах в указанном кластере. |
| [generate_series (generateSeries)](/sql-reference/table-functions/generate_series) | Возвращает таблицу с единственным столбцом `generate_series` (UInt64), который содержит целые числа от начала до конца включительно. |
| [azureBlobStorageCluster](/sql-reference/table-functions/azureBlobStorageCluster) | Позволяет параллельно обрабатывать файлы из Azure Blob Storage на многих узлах в указанном кластере. |
| [jdbc](/sql-reference/table-functions/jdbc) | Возвращает таблицу, которая подключена через JDBC драйвер. |
| [format](/sql-reference/table-functions/format) | Парсит данные из аргументов в соответствии с указанным форматом ввода. Если аргумент структура не указан, он извлекается из данных. |
| [s3Cluster](/sql-reference/table-functions/s3Cluster) | Расширение табличной функции s3, которое позволяет параллельно обрабатывать файлы из Amazon S3 и Google Cloud Storage на многих узлах в указанном кластере. |
| [TODO: Add title](/sql-reference/table-functions/generateSeries) | TODO: Добавить описание |
| [sqlite](/sql-reference/table-functions/sqlite) | Позволяет выполнять запросы к данным, хранящимся в базе данных SQLite. |
| [deltaLakeCluster](/sql-reference/table-functions/deltalakeCluster) | Это расширение табличной функции deltaLake. |
| [numbers](/sql-reference/table-functions/numbers) | Возвращает таблицы с единственным столбцом `number`, который содержит задаваемые целые числа. |
| [null](/sql-reference/table-functions/null) | Создает временную таблицу заданной структуры с движком Null. Функция используется для удобства написания тестов и демонстраций. |
| [remote, remoteSecure](/sql-reference/table-functions/remote) | Табличная функция `remote` позволяет получать доступ к удаленным серверам на лету, т.е. без создания распределенной таблицы. Табличная функция `remoteSecure` аналогична `remote`, но через защищенное соединение. |
| [mongodb](/sql-reference/table-functions/mongodb) | Позволяет выполнять запросы `SELECT` к данным, хранящимся на удаленном сервере MongoDB. |
