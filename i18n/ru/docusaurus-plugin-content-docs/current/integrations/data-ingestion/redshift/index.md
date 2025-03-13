---
sidebar_label: Redshift
slug: /integrations/redshift
description: Миграция данных из Redshift в ClickHouse
---
---

import redshiftToClickhouse from '@site/static/images/integrations/data-ingestion/redshift/redshift-to-clickhouse.png';
import push from '@site/static/images/integrations/data-ingestion/redshift/push.png';
import pull from '@site/static/images/integrations/data-ingestion/redshift/pull.png';
import pivot from '@site/static/images/integrations/data-ingestion/redshift/pivot.png';
import s3_1 from '@site/static/images/integrations/data-ingestion/redshift/s3-1.png';
import s3_2 from '@site/static/images/integrations/data-ingestion/redshift/s3-2.png';


# Миграция данных из Redshift в ClickHouse

## Связанный контент {#related-content}

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/SyhZmS5ZZaA"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

- Блог: [Оптимизация аналитических нагрузок: Сравнение Redshift и ClickHouse](https://clickhouse.com/blog/redshift-vs-clickhouse-comparison)

## Введение {#introduction}

[Amazon Redshift](https://aws.amazon.com/redshift/) — это популярное облачное решение для хранения данных, входящее в состав предложений Amazon Web Services. Этот гид представляет различные подходы к миграции данных из экземпляра Redshift в ClickHouse. Мы рассмотрим три варианта:

<img src={redshiftToClickhouse} class="image" alt="Варианты миграции из Redshift в ClickHouse"/>

С точки зрения экземпляра ClickHouse у вас есть возможность:

1. **[PUSH](#push-data-from-redshift-to-clickhouse)** данные в ClickHouse с помощью стороннего инструмента или сервиса ETL/ELT

2. **[PULL](#pull-data-from-redshift-to-clickhouse)** данные из Redshift, используя ClickHouse JDBC Bridge

3. **[PIVOT](#pivot-data-from-redshift-to-clickhouse-using-s3)** с использованием хранилища объектов S3, используя логику "Разгрузить, затем загрузить"

:::note
В этом учебнике мы использовали Redshift в качестве источника данных. Однако представленные здесь подходы миграции не являются эксклюзивными для Redshift, и аналогичные шаги могут быть применены для любого совместимого источника данных.
:::


## Перенос данных из Redshift в ClickHouse {#push-data-from-redshift-to-clickhouse}

В сценарии push основная идея состоит в том, чтобы использовать сторонний инструмент или сервис (либо пользовательский код, либо [ETL/ELT](https://en.wikipedia.org/wiki/Extract,_transform,_load#ETL_vs._ELT)), чтобы передать ваши данные в экземпляр ClickHouse. Например, вы можете использовать такое программное обеспечение, как [Airbyte](https://www.airbyte.com/), для передачи данных между вашим экземпляром Redshift (в качестве источника) и ClickHouse как целью ([см. наш гид по интеграции для Airbyte](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md))


<img src={push} class="image" alt="PUSH из Redshift в ClickHouse"/>

### Плюсы {#pros}

* Может использовать существующий каталог соединителей из программного обеспечения ETL/ELT.
* Встроенные возможности для синхронизации данных (добавление/перезапись/логика инкремента).
* Позволяет сценарии трансформации данных (например, см. наш [гид по интеграции для dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)).

### Минусы {#cons}

* Пользователям необходимо настроить и поддерживать инфраструктуру ETL/ELT.
* Вводит элемент третьей стороны в архитектуру, который может стать потенциальным узким местом для масштабируемости.


## Извлечение данных из Redshift в ClickHouse {#pull-data-from-redshift-to-clickhouse}

В сценарии pull основная идея состоит в том, чтобы использовать ClickHouse JDBC Bridge для подключения к кластеру Redshift непосредственно из экземпляра ClickHouse и выполнения запросов `INSERT INTO ... SELECT`:


<img src={pull} class="image" alt="PULL из Redshift в ClickHouse"/>

### Плюсы {#pros-1}

* Универсально для всех инструментов, совместимых с JDBC
* Элегантное решение для выполнения запросов к нескольким внешним источникам данных из ClickHouse

### Минусы {#cons-1}

* Требуется экземпляр ClickHouse JDBC Bridge, который может стать потенциальным узким местом для масштабируемости


:::note
Несмотря на то, что Redshift основан на PostgreSQL, использование функции таблицы PostgreSQL или таблицы ClickHouse невозможно, так как ClickHouse требует версию PostgreSQL 9 или выше, а API Redshift основан на более ранней версии (8.x).
:::

### Учебник {#tutorial}

Чтобы использовать этот вариант, вам нужно настроить ClickHouse JDBC Bridge. ClickHouse JDBC Bridge — это отдельное Java-приложение, которое обеспечивает подключение JDBC и действует как прокси между экземпляром ClickHouse и источниками данных. Для этого учебника мы использовали заранее заполненный экземпляр Redshift с [образцом базы данных](https://docs.aws.amazon.com/redshift/latest/dg/c_sampledb.html).


1. Разверните ClickHouse JDBC Bridge. Для получения дополнительной информации см. наш пользовательский гид по [JDBC для внешних источников данных](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md)

:::note
Если вы используете ClickHouse Cloud, вам необходимо запустить ClickHouse JDBC Bridge в отдельной среде и подключиться к ClickHouse Cloud, используя функцию [remoteSecure](/sql-reference/table-functions/remote/)
:::

2. Настройте ваш источник данных Redshift для ClickHouse JDBC Bridge. Например, `/etc/clickhouse-jdbc-bridge/config/datasources/redshift.json `

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

3. После развертывания и запуска ClickHouse JDBC Bridge вы можете начать запрашивать ваш экземпляр Redshift из ClickHouse

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

  5 строк в наборе. Затрачено: 0.438 сек.
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

  1 строка в наборе. Затрачено: 0.304 сек.
  ```


4. В дальнейшем мы покажем импорт данных с использованием оператора `INSERT INTO ... SELECT`

  ```sql
  # СОЗДАНИЕ ТАБЛИЦЫ с 3 колонками
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

  0 строк в наборе. Затрачено: 0.233 сек.
  ```

  ```sql
  # ИМПОРТ ДАННЫХ
  INSERT INTO users_imported (*) SELECT *
  FROM jdbc('redshift', 'select username, firstname, lastname from users')
  ```

  ```response
  Query id: 9d3a688d-b45a-40f4-a7c7-97d93d7149f1

  Ok.

  0 строк в наборе. Затрачено: 4.498 сек. Обработано 49.99 тысяч строк, 2.49 MB (11.11 тысяч строк/с., 554.27 KB/с.)
  ```

## Поворот данных из Redshift в ClickHouse с использованием S3 {#pivot-data-from-redshift-to-clickhouse-using-s3}

В этом сценарии мы экспортируем данные в S3 в промежуточном формате и, на втором этапе, загружаем данные из S3 в ClickHouse.

<img src={pivot} class="image" alt="PIVOT из Redshift с использованием S3"/>

### Плюсы {#pros-2}

* И Redshift, и ClickHouse имеют мощные функции интеграции S3.
* Использует существующие функции, такие как команда Redshift `UNLOAD` и функция таблицы/табличный движок S3 ClickHouse.
* Легко масштабируется благодаря параллельным чтениям и высоким темпам передачи данных из/в S3 в ClickHouse.
* Можете использовать сложные и сжатые форматы, такие как Apache Parquet.

### Минусы {#cons-2}

* Два этапа в процессе (разгрузка из Redshift затем загрузка в ClickHouse).

### Учебник {#tutorial-1}

1. С помощью функции [UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html) Redshift экспортируйте данные в существующий частный S3-бакет:

    <img src={s3_1} class="image" alt="UNLOAD из Redshift в S3"/>

    Это сгенерирует файлы частей, содержащие необработанные данные в S3

    <img src={s3_2} class="image" alt="Данные в S3"/>

2. Создайте таблицу в ClickHouse:

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

    Это особенно хорошо работает, когда данные находятся в формате, который содержит информацию о типах данных, например, Parquet.

3. Загрузите файлы S3 в ClickHouse с помощью оператора `INSERT INTO ... SELECT`:
    ```sql
    INSERT INTO users SELECT *
    FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
    ```

    ```response
    Query id: 2e7e219a-6124-461c-8d75-e4f5002c8557

    Ok.

    0 строк в наборе. Затрачено: 0.545 сек. Обработано 49.99 тысяч строк, 2.34 MB (91.72 тысяч строк/с., 4.30 MB/с.)
    ```

:::note
В этом примере использовался формат CSV как поворотный формат. Однако для производственных нагрузок мы рекомендуем Apache Parquet как лучший вариант для больших миграций, так как он сопровождается сжатием и может снизить затраты на хранение, уменьшая время передачи. (По умолчанию каждая группа строк сжимается с использованием SNAPPY). ClickHouse также использует колонкоориентированность Parquet для ускорения загрузки данных.
:::
