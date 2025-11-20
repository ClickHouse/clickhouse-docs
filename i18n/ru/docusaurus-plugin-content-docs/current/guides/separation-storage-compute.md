---
sidebar_position: 1
sidebar_label: 'Разделение хранилища и вычислений'
slug: /guides/separation-storage-compute
title: 'Разделение хранилища и вычислений'
description: 'В этом руководстве рассматривается, как использовать ClickHouse и S3 для реализации архитектуры с разделением хранилища и вычислений.'
doc_type: 'guide'
keywords: ['хранилище', 'вычисления', 'архитектура', 'масштабируемость', 'облако']
---

import Image from '@theme/IdealImage';
import BucketDetails from '@site/docs/_snippets/_S3_authentication_and_bucket.md';
import s3_bucket_example from '@site/static/images/guides/s3_bucket_example.png';


# Разделение хранения и вычислений



## Обзор {#overview}

Это руководство описывает, как использовать ClickHouse и S3 для реализации архитектуры с разделением хранилища и вычислительных ресурсов.

Разделение хранилища и вычислительных ресурсов означает, что вычислительные мощности и ресурсы хранения управляются независимо друг от друга. В ClickHouse это обеспечивает лучшую масштабируемость, экономическую эффективность и гибкость. Вы можете масштабировать хранилище и вычислительные ресурсы независимо по мере необходимости, оптимизируя производительность и затраты.

Использование ClickHouse с хранением в S3 особенно полезно для сценариев, где производительность запросов к «холодным» данным менее критична. ClickHouse поддерживает использование S3 в качестве хранилища для движка `MergeTree` через `S3BackedMergeTree`. Этот движок таблиц позволяет пользователям использовать преимущества масштабируемости и экономичности S3, сохраняя при этом производительность вставки и выполнения запросов движка `MergeTree`.

Обратите внимание, что реализация и управление архитектурой с разделением хранилища и вычислительных ресурсов является более сложной задачей по сравнению со стандартными развертываниями ClickHouse. Хотя самостоятельно управляемый ClickHouse позволяет разделять хранилище и вычислительные ресурсы, как описано в этом руководстве, мы рекомендуем использовать [ClickHouse Cloud](https://clickhouse.com/cloud), который позволяет использовать ClickHouse в этой архитектуре без дополнительной настройки с помощью [движка таблиц `SharedMergeTree`](/cloud/reference/shared-merge-tree).

_Это руководство предполагает, что вы используете ClickHouse версии 22.8 или выше._

:::warning
Не настраивайте политики жизненного цикла AWS/GCS. Это не поддерживается и может привести к повреждению таблиц.
:::


## 1. Использование S3 в качестве диска ClickHouse {#1-use-s3-as-a-clickhouse-disk}

### Создание диска {#creating-a-disk}

Создайте новый файл в директории `config.d` ClickHouse для хранения конфигурации хранилища:

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

Скопируйте следующий XML в созданный файл, заменив `BUCKET`, `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY` на параметры вашего AWS bucket, в котором вы хотите хранить данные:

```xml
<clickhouse>
  <storage_configuration>
    <disks>
      <s3_disk>
        <type>s3</type>
        <endpoint>$BUCKET</endpoint>
        <access_key_id>$ACCESS_KEY_ID</access_key_id>
        <secret_access_key>$SECRET_ACCESS_KEY</secret_access_key>
        <metadata_path>/var/lib/clickhouse/disks/s3_disk/</metadata_path>
      </s3_disk>
      <s3_cache>
        <type>cache</type>
        <disk>s3_disk</disk>
        <path>/var/lib/clickhouse/disks/s3_cache/</path>
        <max_size>10Gi</max_size>
      </s3_cache>
    </disks>
    <policies>
      <s3_main>
        <volumes>
          <main>
            <disk>s3_disk</disk>
          </main>
        </volumes>
      </s3_main>
    </policies>
  </storage_configuration>
</clickhouse>
```

Если необходимо дополнительно указать настройки для диска S3, например, задать `region` или отправить пользовательский HTTP-заголовок `header`, список соответствующих настроек можно найти [здесь](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3).

Вы также можете заменить `access_key_id` и `secret_access_key` следующим параметром, который попытается получить учетные данные из переменных окружения и метаданных Amazon EC2:

```bash
<use_environment_credentials>true</use_environment_credentials>
```

После создания конфигурационного файла необходимо изменить владельца файла на пользователя и группу clickhouse:

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

Теперь можно перезапустить сервер ClickHouse, чтобы изменения вступили в силу:

```bash
service clickhouse-server restart
```


## 2. Создание таблицы с хранением в S3 {#2-create-a-table-backed-by-s3}

Чтобы проверить правильность настройки диска S3, можно попробовать создать таблицу и выполнить к ней запрос.

Создайте таблицу, указав новую политику хранения S3:

```sql
CREATE TABLE my_s3_table
  (
    `id` UInt64,
    `column1` String
  )
ENGINE = MergeTree
ORDER BY id
SETTINGS storage_policy = 's3_main';
```

Обратите внимание, что не требуется указывать движок как `S3BackedMergeTree`. ClickHouse автоматически преобразует тип движка внутри системы, если обнаруживает, что таблица использует S3 для хранения данных.

Убедитесь, что таблица создана с правильной политикой:

```sql
SHOW CREATE TABLE my_s3_table;
```

Вы должны увидеть следующий результат:

```response
┌─statement────────────────────────────────────────────────────
│ CREATE TABLE default.my_s3_table
(
  `id` UInt64,
  `column1` String
)
ENGINE = MergeTree
ORDER BY id
SETTINGS storage_policy = 's3_main', index_granularity = 8192
└──────────────────────────────────────────────────────────────
```

Теперь вставим несколько строк в нашу новую таблицу:

```sql
INSERT INTO my_s3_table (id, column1)
  VALUES (1, 'abc'), (2, 'xyz');
```

Проверим, что строки были вставлены:

```sql
SELECT * FROM my_s3_table;
```

```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ xyz     │
└────┴─────────┘

2 строки в наборе. Затрачено: 0.284 сек.
```

В консоли AWS, если данные были успешно вставлены в S3, вы увидите, что ClickHouse создал новые файлы в указанном бакете.

Если всё прошло успешно, теперь вы используете ClickHouse с разделением хранения и вычислений!

<Image
  img={s3_bucket_example}
  size='md'
  alt='Пример бакета S3 с использованием разделения вычислений и хранения'
  border
/>


## 3. Реализация репликации для отказоустойчивости (необязательно) {#3-implementing-replication-for-fault-tolerance-optional}

:::warning
Не настраивайте политики жизненного цикла AWS/GCS. Это не поддерживается и может привести к повреждению таблиц.
:::

Для обеспечения отказоустойчивости можно использовать несколько узлов сервера ClickHouse, распределённых по нескольким регионам AWS, с отдельным бакетом S3 для каждого узла.

Репликацию с дисками S3 можно реализовать с помощью движка таблиц `ReplicatedMergeTree`. Подробности см. в следующем руководстве:

- [Репликация одного шарда между двумя регионами AWS с использованием S3 Object Storage](/integrations/s3#s3-multi-region).


## Дополнительные материалы {#further-reading}

- [Движок таблиц SharedMergeTree](/cloud/reference/shared-merge-tree)
- [Блог-пост с анонсом SharedMergeTree](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
