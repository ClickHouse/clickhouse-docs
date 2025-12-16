import redshiftToClickhouse from '@site/static/images/integrations/data-ingestion/redshift/redshift-to-clickhouse.png';
import push from '@site/static/images/integrations/data-ingestion/redshift/push.png';
import pull from '@site/static/images/integrations/data-ingestion/redshift/pull.png';
import pivot from '@site/static/images/integrations/data-ingestion/redshift/pivot.png';
import s3_1 from '@site/static/images/integrations/data-ingestion/redshift/s3-1.png';
import s3_2 from '@site/static/images/integrations/data-ingestion/redshift/s3-2.png';
import Image from '@theme/IdealImage';

## Введение {#introduction}

[Amazon Redshift](https://aws.amazon.com/redshift/) — это популярное облачное решение для построения хранилищ данных, входящее в состав сервисов Amazon Web Services. В этом руководстве представлены различные подходы к миграции данных из кластера Redshift в ClickHouse. Мы рассмотрим три варианта:

<Image img={redshiftToClickhouse} size="md" alt="Варианты миграции из Redshift в ClickHouse"/>

Со стороны ClickHouse вы можете:

1. **[PUSH](#push-data-from-redshift-to-clickhouse)** отправлять данные в ClickHouse, используя сторонний ETL/ELT‑инструмент или сервис

2. **[PULL](#pull-data-from-redshift-to-clickhouse)** забирать данные из Redshift с использованием ClickHouse JDBC Bridge

3. **[PIVOT](#pivot-data-from-redshift-to-clickhouse-using-s3)** использовать объектное хранилище S3 по принципу «выгрузить, затем загрузить»

:::note
В этом руководстве мы использовали Redshift в качестве источника данных. Однако представленные здесь подходы к миграции не ограничиваются Redshift, и аналогичные шаги можно применить к любому совместимому источнику данных.
:::

## Отправка данных из Redshift в ClickHouse {#push-data-from-redshift-to-clickhouse}

В push-сценарии идея заключается в использовании стороннего инструмента или сервиса (кастомного кода или решения класса [ETL/ELT](https://en.wikipedia.org/wiki/Extract,_transform,_load#ETL_vs._ELT)) для отправки ваших данных в экземпляр ClickHouse. Например, вы можете использовать такое программное обеспечение, как [Airbyte](https://www.airbyte.com/), чтобы перемещать данные между экземпляром Redshift (в качестве источника) и ClickHouse (в качестве приёмника) ([см. наше руководство по интеграции с Airbyte](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)).

<Image img={push} size="md" alt="PUSH из Redshift в ClickHouse"/>

### Преимущества {#pros}

* Возможность использования существующего каталога коннекторов ETL/ELT‑ПО.
* Встроенные механизмы для поддержания данных в синхронизированном состоянии (логика добавления/перезаписи/инкрементных обновлений).
* Возможность реализации сценариев преобразования данных (см., например, наше [руководство по интеграции с dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)).

### Недостатки {#cons}

* Пользователям необходимо настроить и поддерживать ETL/ELT‑инфраструктуру.
* В архитектуру добавляется сторонний элемент, который может стать потенциальным узким местом для масштабирования.

## Получение данных из Redshift в ClickHouse {#pull-data-from-redshift-to-clickhouse}

В pull-сценарии используется ClickHouse JDBC Bridge для подключения к кластеру Redshift непосредственно из экземпляра ClickHouse и выполнения запросов `INSERT INTO ... SELECT`:

<Image img={pull} size="md" alt="PULL from Redshift to ClickHouse"/>

### Преимущества {#pros-1}

* Подходит для всех инструментов, совместимых с JDBC
* Элегантное решение, позволяющее выполнять запросы к нескольким внешним источникам данных непосредственно из ClickHouse

### Недостатки {#cons-1}

* Требует экземпляра ClickHouse JDBC Bridge, который может стать потенциальным узким местом при масштабировании

:::note
Несмотря на то, что Redshift основан на PostgreSQL, использование табличной функции PostgreSQL в ClickHouse или движка таблиц PostgreSQL невозможно, поскольку ClickHouse требует PostgreSQL версии 9 или выше, а API Redshift основан на более ранней версии (8.x).
:::

### Практическое руководство {#tutorial}

Чтобы использовать этот подход, необходимо настроить ClickHouse JDBC Bridge. ClickHouse JDBC Bridge — это автономное Java‑приложение, которое обрабатывает JDBC‑подключения и действует как прокси между экземпляром ClickHouse и источниками данных. В этом руководстве используется предварительно заполненный экземпляр Redshift с [примером базы данных](https://docs.aws.amazon.com/redshift/latest/dg/c_sampledb.html).

<VerticalStepper headerLevel="h4">

#### Разверните ClickHouse JDBC Bridge {#deploy-clickhouse-jdbc-bridge}

Разверните ClickHouse JDBC Bridge. Для получения дополнительной информации см. руководство по [JDBC для внешних источников данных](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md).

:::note
Если вы используете ClickHouse Cloud, вам необходимо запустить ClickHouse JDBC Bridge в отдельной среде и подключиться к ClickHouse Cloud с помощью функции [remoteSecure](/sql-reference/table-functions/remote/).
:::

#### Настройте источник данных Redshift {#configure-your-redshift-datasource}

Настройте источник данных Redshift для ClickHouse JDBC Bridge. Например, `/etc/clickhouse-jdbc-bridge/config/datasources/redshift.json `

```json
{
 "redshift-server": {
   "aliases": [
     "redshift"
   ],
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

#### Выполните запрос к экземпляру Redshift из ClickHouse {#query-your-redshift-instance-from-clickhouse}

После того как ClickHouse JDBC Bridge будет развернут и запущен, вы можете начинать выполнять запросы к экземпляру Redshift из ClickHouse.

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

Ниже показан пример импорта данных с использованием выражения `INSERT INTO ... SELECT`.

```sql
# TABLE CREATION with 3 columns
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

## Преобразование данных из Redshift в ClickHouse с использованием S3 {#pivot-data-from-redshift-to-clickhouse-using-s3}

В этом сценарии мы экспортируем данные в S3 в промежуточном формате PIVOT, а затем, на втором шаге, загружаем данные из S3 в ClickHouse.

<Image img={pivot} size="md" alt="PIVOT из Redshift с использованием S3"/>

### Преимущества {#pros-2}

* И Redshift, и ClickHouse обладают мощными возможностями интеграции с S3.
* Использует уже имеющиеся возможности, такие как команда Redshift `UNLOAD` и табличная функция/движок таблиц S3 в ClickHouse.
* Масштабируется без дополнительных усилий благодаря параллельным чтениям и высокой пропускной способности при чтении и записи данных в S3 из ClickHouse.
* Может использовать сложные и сжатые форматы, такие как Apache Parquet.

### Недостатки {#cons-2}

* Два шага в процессе: сначала выгрузка из Redshift, затем загрузка в ClickHouse.

### Практическое руководство {#tutorial-1}

<VerticalStepper headerLevel="h4">

#### Экспорт данных в бакет S3 с помощью UNLOAD {#export-data-into-an-s3-bucket-using-unload}

Используя функцию Redshift [UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html), экспортируйте данные в существующий приватный бакет S3:

<Image img={s3_1} size="md" alt="UNLOAD из Redshift в S3" background="white"/>

Будут сгенерированы файлы-части (part files), содержащие необработанные данные в S3.

<Image img={s3_2} size="md" alt="Данные в S3" background="white"/>

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

В качестве альтернативы ClickHouse может попытаться определить структуру таблицы с помощью `CREATE TABLE ... EMPTY AS SELECT`:

```sql
CREATE TABLE users
ENGINE = MergeTree ORDER BY username
EMPTY AS
SELECT * FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
```

Это особенно хорошо работает, когда данные находятся в формате, содержащем информацию о типах данных, например Parquet.

#### Загрузка файлов S3 в ClickHouse {#load-s3-files-into-clickhouse}

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
В этом примере в качестве промежуточного формата использовался CSV. Однако для рабочих нагрузок в продакшене мы рекомендуем Apache Parquet как лучший вариант для крупных миграций, поскольку он поддерживает сжатие и может снизить затраты на хранение, одновременно сокращая время передачи данных. (По умолчанию каждая группа строк сжимается с помощью SNAPPY). ClickHouse также использует ориентированность Parquet на столбцы для ускорения приёма данных.
:::

</VerticalStepper>