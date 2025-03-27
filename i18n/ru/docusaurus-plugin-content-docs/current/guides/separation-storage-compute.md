---
sidebar_position: 1
sidebar_label: 'Разделение Хранения и Вычислений'
slug: /guides/separation-storage-compute
title: 'Разделение Хранения и Вычислений'
description: 'Этот гид рассматривает, как можно использовать ClickHouse и S3 для реализации архитектуры с разделенным хранением и вычислениями.'
---

import Image from '@theme/IdealImage';
import BucketDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';
import s3_bucket_example from '@site/static/images/guides/s3_bucket_example.png';


# Разделение Хранения и Вычислений

## Обзор {#overview}

Этот гид рассматривает, как можно использовать ClickHouse и S3 для реализации архитектуры с разделенным хранением и вычислениями.

Разделение хранения и вычислений означает, что вычислительные ресурсы и ресурсы хранения управляются независимо. В ClickHouse это позволяет добиться лучшей масштабируемости, экономии затрат и гибкости. Вы можете масштабировать ресурсы хранения и вычислений отдельно по мере необходимости, оптимизируя производительность и расходы.

Использование ClickHouse с поддержкой S3 особенно полезно для тех случаев, когда производительность запросов к "холодным" данным менее критична. ClickHouse поддерживает использование S3 в качестве хранилища для движка `MergeTree` с использованием `S3BackedMergeTree`. Этот движок таблиц позволяет пользователям использовать преимущества масштабируемости и экономии затрат S3, сохраняя производительность вставки и запросов движка `MergeTree`.

Обратите внимание, что реализация и управление архитектурой с разделенным хранением и вычислениями более сложны по сравнению со стандартными развертываниями ClickHouse. Хотя самоуправляемый ClickHouse позволяет разделять хранение и вычисления, как обсуждается в этом гиде, мы рекомендуем использовать [ClickHouse Cloud](https://clickhouse.com/cloud), который позволяет вам использовать ClickHouse в этой архитектуре без конфигурации с помощью [табличного движка `SharedMergeTree`](/cloud/reference/shared-merge-tree).

*Этот гид предполагает, что вы используете версию ClickHouse 22.8 или выше.*

:::warning
Не настраивайте никакую политику жизненного цикла AWS/GCS. Это не поддерживается и может привести к повреждению таблиц.
:::

## 1. Используйте S3 в качестве диска ClickHouse {#1-use-s3-as-a-clickhouse-disk}

### Создание диска {#creating-a-disk}

Создайте новый файл в директории ClickHouse `config.d` для хранения конфигурации хранения:

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

Скопируйте следующий XML в только что созданный файл, заменив `BUCKET`, `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY` на детали AWS-бакета, в котором вы хотите хранить ваши данные:

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

Если вам нужно дополнительно задать настройки для диска S3, например, указать `region` или отправить пользовательский HTTP `header`, вы можете найти список соответствующих настроек [здесь](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3).

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

Чтобы проверить, правильно ли мы настроили диск S3, мы можем попытаться создать и выполнить запрос к таблице.

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

Проверим, что наши строки были добавлены:

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

Если все прошло успешно, теперь вы используете ClickHouse с разделенным хранением и вычислениями!

<Image img={s3_bucket_example} size="md" alt="Пример бакета S3 с использованием разделения вычислений и хранения" border/>

## 3. Реализация репликации для отказоустойчивости (необязательно) {#3-implementing-replication-for-fault-tolerance-optional}

:::warning
Не настраивайте никакую политику жизненного цикла AWS/GCS. Это не поддерживается и может привести к повреждению таблиц.
:::

Для обеспечения отказоустойчивости вы можете использовать несколько узлов сервера ClickHouse, распределенных по нескольким регионам AWS, с бакетом S3 для каждого узла.

Репликация с использованием дисков S3 может быть достигнута с помощью движка таблиц `ReplicatedMergeTree`. См. следующий гид для деталей:
- [Репликация одного шарда через два региона AWS с использованием S3 Object Storage](/integrations/s3#s3-multi-region).

## Дальнейшее Чтение {#further-reading}

- [Движок таблиц SharedMergeTree](/cloud/reference/shared-merge-tree)
- [Блог-объявление SharedMergeTree](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
