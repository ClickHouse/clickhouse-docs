import redshiftToClickhouse from '@site/static/images/integrations/data-ingestion/redshift/redshift-to-clickhouse.png';
import push from '@site/static/images/integrations/data-ingestion/redshift/push.png';
import pull from '@site/static/images/integrations/data-ingestion/redshift/pull.png';
import pivot from '@site/static/images/integrations/data-ingestion/redshift/pivot.png';
import s3_1 from '@site/static/images/integrations/data-ingestion/redshift/s3-1.png';
import s3_2 from '@site/static/images/integrations/data-ingestion/redshift/s3-2.png';
import Image from '@theme/IdealImage';

## Введение {#introduction}

[Amazon Redshift](https://aws.amazon.com/redshift/) — это популярное облачное решение для хранения данных, которое является частью предложений Amazon Web Services. Этот руководств представляет различные подходы к миграции данных из экземпляра Redshift в ClickHouse. Мы рассмотрим три варианта:

<Image img={redshiftToClickhouse} size="md" alt="Опции миграции из Redshift в ClickHouse" background="white"/>

С точки зрения экземпляра ClickHouse, вы можете:

1. **[PUSH](#push-data-from-redshift-to-clickhouse)** данные в ClickHouse с помощью стороннего инструмента или сервиса ETL/ELT

2. **[PULL](#pull-data-from-redshift-to-clickhouse)** данные из Redshift, используя ClickHouse JDBC Bridge

3. **[PIVOT](#pivot-data-from-redshift-to-clickhouse-using-s3)** с использованием объектного хранилища S3 по логике "Сначала выгрузить, затем загрузить"

:::note
Мы использовали Redshift в качестве источника данных в этом учебном пособии. Тем не менее, представленные здесь подходы к миграции не эксклюзивны для Redshift, и аналогичные шаги могут быть выведены для любого совместимого источника данных.
:::

## Отправка данных из Redshift в ClickHouse {#push-data-from-redshift-to-clickhouse}

В сценарии отправки идея состоит в том, чтобы использовать сторонний инструмент или сервис (либо собственный код, либо [ETL/ELT](https://en.wikipedia.org/wiki/Extract,_transform,_load#ETL_vs._ELT)), чтобы отправить ваши данные в экземпляр ClickHouse. Например, вы можете использовать программное обеспечение, такое как [Airbyte](https://www.airbyte.com/), для перемещения данных между вашим экземпляром Redshift (как источником) и ClickHouse в качестве назначения ([см. наше руководство по интеграции для Airbyte](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md))

<Image img={push} size="md" alt="PUSH из Redshift в ClickHouse" background="white"/>

### Плюсы {#pros}

* Это может использовать существующий каталог коннекторов программного обеспечения ETL/ELT.
* Встроенные возможности для синхронизации данных (добавление/перезапись/инкрементная логика).
* Возможность реализации сценариев преобразования данных (например, см. наше [руководство по интеграции для dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)).

### Минусы {#cons}

* Пользователи должны настроить и поддерживать инфраструктуру ETL/ELT.
* В архитектуру вводится сторонний элемент, который может стать потенциальным узким местом по масштабируемости.

## Получение данных из Redshift в ClickHouse {#pull-data-from-redshift-to-clickhouse}

В сценарии получения идея состоит в том, чтобы использовать ClickHouse JDBC Bridge для прямого подключения к кластеру Redshift из экземпляра ClickHouse и выполнения запросов `INSERT INTO ... SELECT`:

<Image img={pull} size="md" alt="PULL из Redshift в ClickHouse" background="white"/>

### Плюсы {#pros-1}

* Универсальность для всех совместимых с JDBC инструментов
* Элегантное решение для выполнения запросов к нескольким внешним источникам данных из ClickHouse

### Минусы {#cons-1}

* Требуется экземпляр ClickHouse JDBC Bridge, который может стать потенциальным узким местом по масштабируемости

:::note
Несмотря на то, что Redshift основан на PostgreSQL, использование функции таблицы PostgreSQL или движка таблицы ClickHouse невозможно, так как ClickHouse требует версию PostgreSQL 9 или выше, а API Redshift основан на более ранней версии (8.x).
:::

### Учебное пособие {#tutorial}

Чтобы использовать этот вариант, вам нужно настроить ClickHouse JDBC Bridge. ClickHouse JDBC Bridge — это отдельное Java-приложение, которое обрабатывает соединение JDBC и выполняет функции прокси между экземпляром ClickHouse и источниками данных. В этом учебном пособии мы использовали предварительно заполненный экземпляр Redshift с [образцовой базой данных](https://docs.aws.amazon.com/redshift/latest/dg/c_sampledb.html).

<VerticalStepper headerLevel="h4">

#### Развертывание ClickHouse JDBC Bridge {#deploy-clickhouse-jdbc-bridge}

Разверните ClickHouse JDBC Bridge. Для получения дополнительной информации см. наше руководство пользователя по [JDBC для внешних источников данных](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md)

:::note
Если вы используете ClickHouse Cloud, вам нужно будет запустить свой ClickHouse JDBC Bridge в отдельной среде и подключиться к ClickHouse Cloud, используя функцию [remoteSecure](/sql-reference/table-functions/remote/)
:::

#### Настройка источника данных Redshift {#configure-your-redshift-datasource}

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

#### Выполнение запросов к экземпляру Redshift из ClickHouse {#query-your-redshift-instance-from-clickhouse}

После развертывания и запуска ClickHouse JDBC Bridge вы можете начать выполнять запросы к вашему экземпляру Redshift из ClickHouse

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

В следующем разделе мы покажем, как импортировать данные, используя оператор `INSERT INTO ... SELECT`

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

## Свод данных из Redshift в ClickHouse с использованием S3 {#pivot-data-from-redshift-to-clickhouse-using-s3}

В этом сценарии мы экспортируем данные в S3 в промежуточном сводном формате и на втором этапе загружаем данные из S3 в ClickHouse.

<Image img={pivot} size="md" alt="PIVOT из Redshift с использованием S3" background="white"/>

### Плюсы {#pros-2}

* И Redshift, и ClickHouse имеют мощные функции интеграции с S3.
* Использует существующие функции, такие как команда Redshift `UNLOAD` и функцию таблицы/движок таблицы ClickHouse для S3.
* Безшовно масштабируется благодаря параллельным чтениям и высоким возможностям пропускной способности при передаче данных в/из S3 в ClickHouse.
* Может использовать сложные и сжатые форматы, такие как Apache Parquet.

### Минусы {#cons-2}

* Два шага в процессе (выгрузка из Redshift, затем загрузка в ClickHouse).

### Учебное пособие {#tutorial-1}

<VerticalStepper headerLevel="h4">

#### Выгрузка данных в корзину S3 с помощью UNLOAD {#export-data-into-an-s3-bucket-using-unload}

Используя функцию [UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html) Redshift, выгрузите данные в существующую приватную корзину S3:

<Image img={s3_1} size="md" alt="UNLOAD из Redshift в S3" background="white"/>

Это создаст файлы частей, содержащие сырые данные в S3

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

В качестве альтернативы ClickHouse может попытаться вывести структуру таблицы, используя `CREATE TABLE ... EMPTY AS SELECT`:

```sql
CREATE TABLE users
ENGINE = MergeTree ORDER BY username
EMPTY AS
SELECT * FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
```

Это особенно хорошо работает, когда данные находятся в формате, содержащем информацию о типах данных, например, Parquet.

#### Загрузка файлов S3 в ClickHouse {#load-s3-files-into-clickhouse}

Загрузите файлы S3 в ClickHouse, используя оператор `INSERT INTO ... SELECT`:

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
В этом примере использовался CSV в качестве сводного формата. Однако для производственных рабочих нагрузок мы рекомендуем использовать Apache Parquet как лучший вариант для больших миграций, так как он поддерживает сжатие и может снизить затраты на хранение, сокращая время передачи. (По умолчанию для каждого группы строк применяется сжатие с помощью SNAPPY). ClickHouse также использует ориентированность колонок Parquet для ускорения приемки данных.
:::

</VerticalStepper>