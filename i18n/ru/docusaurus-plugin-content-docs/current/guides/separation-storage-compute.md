---
sidebar_position: 1
sidebar_label: 'Разделение хранилища и вычислений'
slug: /guides/separation-storage-compute
title: 'Разделение хранилища и вычислений'
description: 'Этот гид исследует, как вы можете использовать ClickHouse и S3 для реализации архитектуры с разделенным хранилищем и вычислениями.'
---

import Image from '@theme/IdealImage';
import BucketDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';
import s3_bucket_example from '@site/static/images/guides/s3_bucket_example.png';


# Разделение хранилища и вычислений

## Обзор {#overview}

Этот гид исследует, как вы можете использовать ClickHouse и S3 для реализации архитектуры с разделенным хранилищем и вычислениями.

Разделение хранилища и вычислений означает, что вычислительные ресурсы и ресурсы хранения управляются независимо. В ClickHouse это позволяет добиться лучшей масштабируемости, эффективности затрат и гибкости. Вы можете отдельно масштабировать ресурсы хранения и вычислений по мере необходимости, оптимизируя производительность и затраты.

Использование ClickHouse с поддержкой S3 особенно полезно для случаев, когда производительность запросов к "холодным" данным менее критична. ClickHouse поддерживает использование S3 в качестве хранилища для движка `MergeTree` с использованием `S3BackedMergeTree`. Этот движок таблиц позволяет пользователям использовать преимущества масштабируемости и экономии затрат S3, сохраняя производительность вставки и запросов движка `MergeTree`.

Обратите внимание, что реализация и управление архитектурой с разделением хранилища и вычислений более сложны по сравнению с стандартными внедрениями ClickHouse. Хотя самоуправляемый ClickHouse позволяет разделять хранилище и вычисления, как обсуждено в этом гиде, мы рекомендуем использовать [ClickHouse Cloud](https://clickhouse.com/cloud), который позволяет использовать ClickHouse в этой архитектуре без конфигурации, используя [`SharedMergeTree` движок таблицы](/cloud/reference/shared-merge-tree).

*Этот гид предполагает, что вы используете ClickHouse версии 22.8 или выше.*

:::warning
Не настраивайте никаких политик жизненного цикла AWS/GCS. Это не поддерживается и может привести к повреждению таблиц.
:::

## 1. Использование S3 как диска ClickHouse {#1-use-s3-as-a-clickhouse-disk}

### Создание диска {#creating-a-disk}

Создайте новый файл в каталоге ClickHouse `config.d`, чтобы сохранить конфигурацию хранения:

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

Скопируйте следующий XML в вновь созданный файл, заменив `BUCKET`, `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY` на данные вашего AWS бакета, в котором вы хотите хранить свои данные:

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

Если вам нужно дополнительно указать настройки для S3 диска, например, указать `region` или отправить пользовательский HTTP `header`, вы можете найти список соответствующих настроек [здесь](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3).

Вы также можете заменить `access_key_id` и `secret_access_key` на следующее, что попытается получить учетные данные из переменных окружения и метаданных Amazon EC2:

```bash
<use_environment_credentials>true</use_environment_credentials>
```

После того как вы создали файл конфигурации, вам нужно обновить владельца файла на пользователя и группу clickhouse:

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

Теперь вы можете перезапустить сервер ClickHouse, чтобы изменения вступили в силу:

```bash
service clickhouse-server restart
```

## 2. Создание таблицы с поддержкой S3 {#2-create-a-table-backed-by-s3}

Чтобы проверить, что мы правильно настроили диск S3, мы можем попытаться создать и запрашивать таблицу.

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

Обратите внимание, что нам не нужно было указывать движок как `S3BackedMergeTree`. ClickHouse автоматически преобразует тип движка на внутреннем уровне, если он обнаруживает, что таблица использует S3 для хранения.

Проверьте, что таблица была создана с правильной политикой:

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

Теперь давайте вставим несколько строк в нашу новую таблицу:

```sql
INSERT INTO my_s3_table (id, column1)
  VALUES (1, 'abc'), (2, 'xyz');
```

Давайте проверим, что наши строки были вставлены:

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

В консоли AWS, если ваши данные успешно вставлены в S3, вы должны увидеть, что ClickHouse создал новые файлы в вашем указанном бакете.

Если всё прошло успешно, вы теперь используете ClickHouse с разделенным хранилищем и вычислениями!

<Image img={s3_bucket_example} size="md" alt="Пример бакета S3 с разделением вычислений и хранилища" border/>

## 3. Реализация репликации для отказоустойчивости (необязательно) {#3-implementing-replication-for-fault-tolerance-optional}

:::warning
Не настраивайте никаких политик жизненного цикла AWS/GCS. Это не поддерживается и может привести к повреждению таблиц.
:::

Для обеспечения отказоустойчивости вы можете использовать несколько узлов сервера ClickHouse, распределенных по нескольким регионам AWS, с бакетом S3 для каждого узла.

Репликация с использованием S3 дисков может быть выполнена с помощью движка таблиц `ReplicatedMergeTree`. См. следующий гид для получения деталей:
- [Репликация одного шарда через два региона AWS с использованием S3 Object Storage](/integrations/s3#s3-multi-region).

## Дальнейшее Чтение {#further-reading}

- [SharedMergeTree движок таблицы](/cloud/reference/shared-merge-tree)
- [Блог-объявление о SharedMergeTree](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
