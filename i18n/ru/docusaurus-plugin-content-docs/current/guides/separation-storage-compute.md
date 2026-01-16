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
import BucketDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';
import s3_bucket_example from '@site/static/images/guides/s3_bucket_example.png';


# Разделение хранилища и вычислений \\{#separation-of-storage-and-compute\\}

## Обзор \\{#overview\\}

В этом руководстве рассматривается, как использовать ClickHouse и S3 для реализации архитектуры с раздельными хранением и вычислительными ресурсами.

Разделение хранилища и вычислительных ресурсов означает, что вычислительные ресурсы и ресурсы хранения управляются независимо друг от друга. В ClickHouse это обеспечивает лучшую масштабируемость, экономическую эффективность и гибкость. Вы можете независимо масштабировать хранилище и вычислительные ресурсы по мере необходимости, оптимизируя производительность и затраты.

Использование ClickHouse с хранилищем в S3 особенно полезно для сценариев, где производительность запросов по «холодным» данным менее критична. ClickHouse поддерживает использование S3 в качестве хранилища для движка `MergeTree` с помощью `S3BackedMergeTree`. Этот табличный движок позволяет воспользоваться масштабируемостью и экономичностью S3, сохраняя при этом производительность вставки и выполнения запросов движка `MergeTree`.

Обратите внимание, что реализация и эксплуатация архитектуры с разделением хранилища и вычислительных ресурсов сложнее по сравнению со стандартными развертываниями ClickHouse. Хотя самостоятельно управляемый ClickHouse позволяет разделять хранилище и вычислительные ресурсы, как описано в этом руководстве, мы рекомендуем использовать [ClickHouse Cloud](https://clickhouse.com/cloud), который позволяет использовать ClickHouse в этой архитектуре без дополнительной конфигурации, с использованием табличного движка [`SharedMergeTree`](/cloud/reference/shared-merge-tree).

*В этом руководстве предполагается, что вы используете ClickHouse версии 22.8 или выше.*

:::warning
Не настраивайте какие-либо политики жизненного цикла AWS/GCS. Это не поддерживается и может привести к повреждению таблиц.
:::

## 1. Использование S3 в качестве диска для ClickHouse \\{#1-use-s3-as-a-clickhouse-disk\\}

### Создание диска \{#creating-a-disk\}

Создайте новый файл в каталоге `config.d` ClickHouse для хранения конфигурации хранилища:

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

Скопируйте следующий XML в только что созданный файл, заменив `BUCKET`, `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY` на параметры бакета AWS, в который вы хотите сохранять данные:

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

Если вам необходимо более точно настроить диск S3, например указать `region` или отправить пользовательский HTTP `header`, вы можете найти список соответствующих настроек [здесь](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3).

Вы также можете заменить `access_key_id` и `secret_access_key` на следующие значения, которые попытаются получить учетные данные из переменных среды и метаданных Amazon EC2:

```bash
<use_environment_credentials>true</use_environment_credentials>
```

После того как вы создали файл конфигурации, необходимо изменить владельца файла на пользователя и группу clickhouse:

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

Теперь вы можете перезапустить сервер ClickHouse, чтобы изменения вступили в силу:

```bash
service clickhouse-server restart
```


## 2. Создайте таблицу с использованием S3 \{#2-create-a-table-backed-by-s3\}

Чтобы проверить, что диск S3 настроен правильно, можно попробовать создать таблицу и выполнить к ней запрос.

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

Обратите внимание, что нам не нужно было указывать движок таблицы как `S3BackedMergeTree`. ClickHouse автоматически преобразует тип движка, если обнаруживает, что таблица использует S3 в качестве хранилища.

Проверьте, что таблица была создана с правильной политикой хранения:

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

Убедимся, что наши записи были вставлены:

```sql
SELECT * FROM my_s3_table;
```

```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ xyz     │
└────┴─────────┘

2 rows in set. Elapsed: 0.284 sec.
```

В консоли AWS, если ваши данные были успешно записаны в S3, вы увидите, что ClickHouse создал новые файлы в указанном вами S3-бакете.

Если всё прошло успешно, вы теперь используете ClickHouse с раздельными хранилищем и вычислительными ресурсами!

<Image img={s3_bucket_example} size="md" alt="Пример бакета S3 с разделением вычислений и хранилища" border />


## 3. Реализация репликации для отказоустойчивости (необязательно) \\{#3-implementing-replication-for-fault-tolerance-optional\\}

:::warning
Не настраивайте политики жизненного цикла AWS/GCS. Это не поддерживается и может привести к некорректной работе таблиц.
:::

Для обеспечения отказоустойчивости вы можете использовать несколько серверных узлов ClickHouse, распределённых по нескольким регионам AWS, с отдельным бакетом S3 для каждого узла.

Репликация с дисками S3 может быть реализована с помощью движка таблиц `ReplicatedMergeTree`. Подробности см. в следующем руководстве:

- [Репликация одного сегмента между двумя регионами AWS с использованием S3 Object Storage](/integrations/s3#s3-multi-region).

## Дополнительные материалы \\{#further-reading\\}

- [Движок таблицы SharedMergeTree](/cloud/reference/shared-merge-tree)
- [Анонс SharedMergeTree в блоге](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)