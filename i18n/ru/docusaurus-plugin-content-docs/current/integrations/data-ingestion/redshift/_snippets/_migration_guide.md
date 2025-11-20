import redshiftToClickhouse from '@site/static/images/integrations/data-ingestion/redshift/redshift-to-clickhouse.png';
import push from '@site/static/images/integrations/data-ingestion/redshift/push.png';
import pull from '@site/static/images/integrations/data-ingestion/redshift/pull.png';
import pivot from '@site/static/images/integrations/data-ingestion/redshift/pivot.png';
import s3_1 from '@site/static/images/integrations/data-ingestion/redshift/s3-1.png';
import s3_2 from '@site/static/images/integrations/data-ingestion/redshift/s3-2.png';
import Image from '@theme/IdealImage';



## Введение {#introduction}

[Amazon Redshift](https://aws.amazon.com/redshift/) — популярное облачное решение для хранения данных, входящее в состав сервисов Amazon Web Services. В этом руководстве представлены различные подходы к миграции данных из экземпляра Redshift в ClickHouse. Мы рассмотрим три варианта:

<Image
  img={redshiftToClickhouse}
  size='md'
  alt='Варианты миграции из Redshift в ClickHouse'
  background='white'
/>

С точки зрения экземпляра ClickHouse можно:

1. **[ОТПРАВИТЬ](#push-data-from-redshift-to-clickhouse)** данные в ClickHouse с помощью стороннего инструмента или сервиса ETL/ELT

2. **[ПОЛУЧИТЬ](#pull-data-from-redshift-to-clickhouse)** данные из Redshift с использованием ClickHouse JDBC Bridge

3. **[ПЕРЕНЕСТИ](#pivot-data-from-redshift-to-clickhouse-using-s3)** через объектное хранилище S3 по принципу «сначала выгрузка, затем загрузка»

:::note
В этом руководстве в качестве источника данных используется Redshift. Однако представленные подходы к миграции не ограничиваются только Redshift — аналогичные шаги применимы к любому совместимому источнику данных.
:::


## Отправка данных из Redshift в ClickHouse {#push-data-from-redshift-to-clickhouse}

В сценарии отправки данных используется сторонний инструмент или сервис (пользовательский код или [ETL/ELT](https://en.wikipedia.org/wiki/Extract,_transform,_load#ETL_vs._ELT)) для передачи данных в экземпляр ClickHouse. Например, можно использовать [Airbyte](https://www.airbyte.com/) для перемещения данных из экземпляра Redshift (источник) в ClickHouse (назначение) ([см. руководство по интеграции с Airbyte](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md))

<Image
  img={push}
  size='md'
  alt='PUSH из Redshift в ClickHouse'
  background='white'
/>

### Преимущества {#pros}

- Использование существующего каталога коннекторов ETL/ELT-инструментов.
- Встроенные возможности синхронизации данных (логика добавления/перезаписи/инкремента).
- Поддержка сценариев преобразования данных (например, см. [руководство по интеграции с dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)).

### Недостатки {#cons}

- Необходимость настройки и поддержки инфраструктуры ETL/ELT.
- Добавление стороннего компонента в архитектуру, который может стать узким местом масштабируемости.


## Извлечение данных из Redshift в ClickHouse {#pull-data-from-redshift-to-clickhouse}

В сценарии извлечения используется ClickHouse JDBC Bridge для прямого подключения к кластеру Redshift из экземпляра ClickHouse и выполнения запросов `INSERT INTO ... SELECT`:

<Image
  img={pull}
  size='md'
  alt='Извлечение из Redshift в ClickHouse'
  background='white'
/>

### Преимущества {#pros-1}

- Универсальность для всех инструментов, совместимых с JDBC
- Элегантное решение для выполнения запросов к нескольким внешним источникам данных из ClickHouse

### Недостатки {#cons-1}

- Требуется экземпляр ClickHouse JDBC Bridge, который может стать потенциальным узким местом масштабируемости

:::note
Несмотря на то что Redshift основан на PostgreSQL, использование табличной функции или движка таблиц PostgreSQL в ClickHouse невозможно, поскольку ClickHouse требует PostgreSQL версии 9 или выше, а API Redshift основан на более ранней версии (8.x).
:::

### Руководство {#tutorial}

Для использования этого варианта необходимо настроить ClickHouse JDBC Bridge. ClickHouse JDBC Bridge — это автономное Java-приложение, которое обрабатывает подключения JDBC и выступает в качестве прокси между экземпляром ClickHouse и источниками данных. В этом руководстве используется предварительно заполненный экземпляр Redshift с [примером базы данных](https://docs.aws.amazon.com/redshift/latest/dg/c_sampledb.html).

<VerticalStepper headerLevel="h4">

#### Развертывание ClickHouse JDBC Bridge {#deploy-clickhouse-jdbc-bridge}

Разверните ClickHouse JDBC Bridge. Подробнее см. в руководстве пользователя по [JDBC для внешних источников данных](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md)

:::note
Если вы используете ClickHouse Cloud, вам потребуется запустить ClickHouse JDBC Bridge в отдельной среде и подключиться к ClickHouse Cloud с помощью функции [remoteSecure](/sql-reference/table-functions/remote/)
:::

#### Настройка источника данных Redshift {#configure-your-redshift-datasource}

Настройте источник данных Redshift для ClickHouse JDBC Bridge. Например, `/etc/clickhouse-jdbc-bridge/config/datasources/redshift.json `

```json
{
  "redshift-server": {
    "aliases": ["redshift"],
    "driverUrls": [
      "https://s3.amazonaws.com/redshift-downloads/drivers/jdbc/2.1.0.4/redshift-jdbc42-2.1.0.4.jar"
    ],
    "driverClassName": "com.amazon.redshift.jdbc.Driver",
    "jdbcUrl": "jdbc:redshift://redshift-cluster-1.ckubnplpz1uv.us-east-1.redshift.amazonaws.com:5439/dev",
    "username": "awsuser",
    "password": "<password>",
    "maximumPoolSize": 5
  }
}
```

#### Выполнение запросов к экземпляру Redshift из ClickHouse {#query-your-redshift-instance-from-clickhouse}

После развертывания и запуска ClickHouse JDBC Bridge можно начать выполнять запросы к экземпляру Redshift из ClickHouse

```sql
SELECT *
FROM jdbc('redshift', 'select username, firstname, lastname from users limit 5')
```

```response
Query id: 1b7de211-c0f6-4117-86a2-276484f9f4c0

┌─username─┬─firstname─┬─lastname─┐
│ PGL08LJI │ Vladimir  │ Humphrey │
│ XDZ38RDD │ Barry     │ Roy      │
│ AEB55QTM │ Reagan    │ Hodge    │
│ OWY35QYB │ Tamekah   │ Juarez   │
│ MSD36KVR │ Mufutau   │ Watkins  │
└──────────┴───────────┴──────────┘

5 rows in set. Elapsed: 0.438 sec.
```

```sql
SELECT *
FROM jdbc('redshift', 'select count(*) from sales')
```

```response
Query id: 2d0f957c-8f4e-43b2-a66a-cc48cc96237b

┌──count─┐
│ 172456 │
└────────┘

1 rows in set. Elapsed: 0.304 sec.
```

#### Импорт данных из Redshift в ClickHouse {#import-data-from-redshift-to-clickhouse}

Далее показан импорт данных с использованием инструкции `INSERT INTO ... SELECT`


```sql
# СОЗДАНИЕ ТАБЛИЦЫ с 3 столбцами
CREATE TABLE users_imported
(
   `username` String,
   `firstname` String,
   `lastname` String
)
ENGINE = MergeTree
ORDER BY firstname
```

```response
Query id: c7c4c44b-cdb2-49cf-b319-4e569976ab05

Ok.

0 rows in set. Elapsed: 0.233 sec.
```

```sql
INSERT INTO users_imported (*) SELECT *
FROM jdbc('redshift', 'select username, firstname, lastname from users')
```

```response
Query id: 9d3a688d-b45a-40f4-a7c7-97d93d7149f1

Ok.

0 rows in set. Elapsed: 4.498 sec. Processed 49.99 thousand rows, 2.49 MB (11.11 thousand rows/s., 554.27 KB/s.)
```

</VerticalStepper>


## Перенос данных из Redshift в ClickHouse через S3 {#pivot-data-from-redshift-to-clickhouse-using-s3}

В этом сценарии мы экспортируем данные в S3 в промежуточном формате, а затем, на втором этапе, загружаем данные из S3 в ClickHouse.

<Image
  img={pivot}
  size='md'
  alt='Перенос из Redshift через S3'
  background='white'
/>

### Преимущества {#pros-2}

- И Redshift, и ClickHouse обладают мощными возможностями интеграции с S3.
- Использует существующие функции, такие как команда `UNLOAD` в Redshift и табличная функция / движок таблиц S3 в ClickHouse.
- Легко масштабируется благодаря параллельному чтению и высокой пропускной способности при работе с S3 в ClickHouse.
- Позволяет использовать продвинутые форматы со сжатием, такие как Apache Parquet.

### Недостатки {#cons-2}

- Процесс состоит из двух этапов (выгрузка из Redshift, затем загрузка в ClickHouse).

### Руководство {#tutorial-1}

<VerticalStepper headerLevel="h4">

#### Экспорт данных в бакет S3 с помощью UNLOAD {#export-data-into-an-s3-bucket-using-unload}

Используя функцию [UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html) в Redshift, экспортируйте данные в существующий приватный бакет S3:

<Image
  img={s3_1}
  size='md'
  alt='Выгрузка из Redshift в S3'
  background='white'
/>

Это создаст файлы-части, содержащие исходные данные в S3

<Image img={s3_2} size='md' alt='Данные в S3' background='white' />

#### Создание таблицы в ClickHouse {#create-the-table-in-clickhouse}

Создайте таблицу в ClickHouse:

```sql
CREATE TABLE users
(
  username String,
  firstname String,
  lastname String
)
ENGINE = MergeTree
ORDER BY username
```

Альтернативно, ClickHouse может автоматически определить структуру таблицы с помощью `CREATE TABLE ... EMPTY AS SELECT`:

```sql
CREATE TABLE users
ENGINE = MergeTree ORDER BY username
EMPTY AS
SELECT * FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
```

Это особенно хорошо работает, когда данные находятся в формате, содержащем информацию о типах данных, например Parquet.

#### Загрузка файлов из S3 в ClickHouse {#load-s3-files-into-clickhouse}

Загрузите файлы из S3 в ClickHouse с помощью оператора `INSERT INTO ... SELECT`:

```sql
INSERT INTO users SELECT *
FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
```

```response
Query id: 2e7e219a-6124-461c-8d75-e4f5002c8557

Ok.

0 rows in set. Elapsed: 0.545 sec. Processed 49.99 thousand rows, 2.34 MB (91.72 thousand rows/s., 4.30 MB/s.)
```

:::note
В этом примере в качестве промежуточного формата использовался CSV. Однако для промышленных нагрузок мы рекомендуем Apache Parquet как лучший вариант для крупных миграций, поскольку он поддерживает сжатие и позволяет снизить затраты на хранение, одновременно сокращая время передачи данных. (По умолчанию каждая группа строк сжимается с использованием SNAPPY). ClickHouse также использует колоночную ориентацию Parquet для ускорения загрузки данных.
:::

</VerticalStepper>
