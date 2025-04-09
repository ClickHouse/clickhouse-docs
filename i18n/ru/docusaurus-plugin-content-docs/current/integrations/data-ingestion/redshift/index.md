---
sidebar_label: 'Redshift'
slug: /integrations/redshift
description: 'Миграция данных из Redshift в ClickHouse'
title: 'Миграция данных из Redshift в ClickHouse'
---

import redshiftToClickhouse from '@site/static/images/integrations/data-ingestion/redshift/redshift-to-clickhouse.png';
import push from '@site/static/images/integrations/data-ingestion/redshift/push.png';
import pull from '@site/static/images/integrations/data-ingestion/redshift/pull.png';
import pivot from '@site/static/images/integrations/data-ingestion/redshift/pivot.png';
import s3_1 from '@site/static/images/integrations/data-ingestion/redshift/s3-1.png';
import s3_2 from '@site/static/images/integrations/data-ingestion/redshift/s3-2.png';
import Image from '@theme/IdealImage';


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

[Amazon Redshift](https://aws.amazon.com/redshift/) — популярное облачное решение для хранения данных, которое является частью предложений Amazon Web Services. Этот гид представляет различные подходы к миграции данных из экземпляра Redshift в ClickHouse. Мы рассмотрим три варианта:

<Image img={redshiftToClickhouse} size="lg" alt="Опции миграции Redshift в ClickHouse" background="white"/>

С точки зрения экземпляра ClickHouse, вы можете:

1. **[PUSH](#push-data-from-redshift-to-clickhouse)** данные в ClickHouse, используя сторонний инструмент или сервис ETL/ELT

2. **[PULL](#pull-data-from-redshift-to-clickhouse)** данные из Redshift с использованием ClickHouse JDBC Bridge

3. **[PIVOT](#pivot-data-from-redshift-to-clickhouse-using-s3)** с использованием объектного хранилища S3, применяя логику «Выгрузить, затем загрузить»

:::note
В этом учебнике мы использовали Redshift в качестве источника данных. Тем не менее, представленные подходы миграции не являются эксклюзивными для Redshift, и аналогичные шаги могут быть применены к любому совместимому источнику данных.
:::


## Передача данных из Redshift в ClickHouse {#push-data-from-redshift-to-clickhouse}

В сценарии передачи данные отправляются с помощью стороннего инструмента или сервиса (либо кастомного кода, либо [ETL/ELT](https://en.wikipedia.org/wiki/Extract,_transform,_load#ETL_vs._ELT)), чтобы отправить ваши данные в экземпляр ClickHouse. Например, вы можете использовать программное обеспечение, такое как [Airbyte](https://www.airbyte.com/), чтобы перемещать данные между вашим экземпляром Redshift (в качестве источника) и ClickHouse в качестве назначения ([см. наш гид по интеграции для Airbyte](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md))

<Image img={push} size="lg" alt="PUSH Redshift в ClickHouse" background="white"/>

### Плюсы {#pros}

* Использует существующий каталог коннекторов ETL/ELT программного обеспечения.
* Встроенные возможности для синхронизации данных (добавление/перезапись/инкрементная логика).
* Позволяет сценарии преобразования данных (например, см. наш [гид по интеграции для dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)).

### Минусы {#cons}

* Пользователям необходимо настраивать и поддерживать инфраструктуру ETL/ELT.
* Внесение стороннего элемента в архитектуру, что может стать потенциальным узким местом в масштабируемости.


## Извлечение данных из Redshift в ClickHouse {#pull-data-from-redshift-to-clickhouse}

В сценарии извлечения идея заключается в использовании ClickHouse JDBC Bridge для непосредственного подключения к кластеру Redshift из экземпляра ClickHouse и выполнения запросов `INSERT INTO ... SELECT`:

<Image img={pull} size="lg" alt="PULL из Redshift в ClickHouse" background="white"/>

### Плюсы {#pros-1}

* Обобщенный для всех инструментов, совместимых с JDBC
* Элегантное решение для выполнения запросов к нескольким внешним источникам данных из ClickHouse

### Минусы {#cons-1}

* Требуется экземпляр ClickHouse JDBC Bridge, что может стать потенциальным узким местом в масштабируемости


:::note
Хотя Redshift основан на PostgreSQL, использование функции таблицы или движка таблицы ClickHouse для PostgreSQL невозможно, так как ClickHouse требует версию PostgreSQL 9 или выше, а API Redshift основан на более ранней версии (8.x).
:::

### Учебник {#tutorial}

Чтобы использовать этот вариант, необходимо настроить ClickHouse JDBC Bridge. ClickHouse JDBC Bridge — это автономное Java-приложение, которое обрабатывает соединение JDBC и служит прокси между экземпляром ClickHouse и источниками данных. Для этого учебника мы использовали предварительно заполненный экземпляр Redshift с [образцом базы данных](https://docs.aws.amazon.com/redshift/latest/dg/c_sampledb.html).

1. Разверните ClickHouse JDBC Bridge. Для получения дополнительной информации смотрите наш пользовательский гид по [JDBC для внешних источников данных](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md)

:::note
Если вы используете ClickHouse Cloud, вам нужно будет запустить ClickHouse JDBC Bridge в отдельной среде и подключиться к ClickHouse Cloud с помощью функции [remoteSecure](/sql-reference/table-functions/remote/)
:::

2. Настройте источник данных Redshift для ClickHouse JDBC Bridge. Например, `/etc/clickhouse-jdbc-bridge/config/datasources/redshift.json `

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

3. Как только ClickHouse JDBC Bridge будет развернут и запущен, вы можете начать выполнять запросы к вашему экземпляру Redshift из ClickHouse

  ```sql
  SELECT *
  FROM jdbc('redshift', 'select username, firstname, lastname from users limit 5')
  ```

  ```response
  Query id: 1b7de211-c0f6-4117-86a2-276484f9f4c0

  ┌─username─┬─firstname─┬─lastname─┐
  │ PGL08LJI │ Владимир  │ Хамфри  │
  │ XDZ38RDD │ Барри     │ Рой      │
  │ AEB55QTM │ Рейган    │ Ходж    │
  │ OWY35QYB │ Тмекхах   │ Хуарес   │
  │ MSD36KVR │ Муфутау   │ Уоткинс  │
  └──────────┴───────────┴──────────┘

  5 строк в наборе. Время: 0.438 сек.
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

  1 строка в наборе. Время: 0.304 сек.
  ```


4. Далее мы покажем импорт данных с помощью оператора `INSERT INTO ... SELECT`

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

  0 строк в наборе. Время: 0.233 сек.
  ```

  ```sql
  # ИМПОРТ ДАННЫХ
  INSERT INTO users_imported (*) SELECT *
  FROM jdbc('redshift', 'select username, firstname, lastname from users')
  ```

  ```response
  Query id: 9d3a688d-b45a-40f4-a7c7-97d93d7149f1

  Ok.

  0 строк в наборе. Время: 4.498 сек. Обработано 49.99 тысяч строк, 2.49 МБ (11.11 тысяч строк/с, 554.27 КБ/с.)
  ```

## Пивот данных из Redshift в ClickHouse с использованием S3 {#pivot-data-from-redshift-to-clickhouse-using-s3}

В этом сценарии мы экспортируем данные в S3 в промежуточном формате пивота, а затем загружаем данные из S3 в ClickHouse.

<Image img={pivot} size="lg" alt="ПИВОТ из Redshift с использованием S3" background="white"/>

### Плюсы {#pros-2}

* И Redshift, и ClickHouse обладают мощными функциями интеграции с S3.
* Использует существующие функции, такие как команда `UNLOAD` в Redshift и функция таблицы / движок таблицы S3 в ClickHouse.
* Масштабируется без проблем благодаря параллельному чтению и высокой пропускной способности между S3 и ClickHouse.
* Может использовать сложные и сжатые форматы, такие как Apache Parquet.

### Минусы {#cons-2}

* Два шага в процессе (выгрузка из Redshift, затем загрузка в ClickHouse).

### Учебник {#tutorial-1}

1. Используя функцию [UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html) в Redshift, экспортируйте данные в существующее частное S3 хранилище:

    <Image img={s3_1} size="md" alt="Выгрузка из Redshift в S3" background="white"/>

    Это приведет к созданию файлов частей, содержащих необработанные данные в S3

    <Image img={s3_2} size="md" alt="Данные в S3" background="white"/>

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

    В качестве альтернативы ClickHouse может попробовать вывести структуру таблицы, используя `CREATE TABLE ... EMPTY AS SELECT`:

    ```sql
    CREATE TABLE users
    ENGINE = MergeTree ORDER BY username
    EMPTY AS
    SELECT * FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
    ```

    Это особенно хорошо работает, когда данные находятся в формате, содержащем информацию о типах данных, как Parquet.

3. Загрузите S3 файлы в ClickHouse с помощью оператора `INSERT INTO ... SELECT`:
    ```sql
    INSERT INTO users SELECT *
    FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
    ```

    ```response
    Query id: 2e7e219a-6124-461c-8d75-e4f5002c8557

    Ok.

    0 строк в наборе. Время: 0.545 сек. Обработано 49.99 тысяч строк, 2.34 МБ (91.72 тысяч строк/с, 4.30 МБ/с.)
    ```

:::note
В этом примере использовался CSV в качестве формата пивота. Тем не менее, для производственных задач мы рекомендуем использовать Apache Parquet в качестве лучшего варианта для крупных миграций, так как он содержит сжатие и может сэкономить некоторые затраты на хранение, одновременно уменьшая время передачи. (По умолчанию каждая группа строк сжимается с использованием SNAPPY). ClickHouse также использует колонкоориентированность Parquet для ускорения приема данных.
:::
