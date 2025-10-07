---
'sidebar_position': 1
'sidebar_label': 'Хранение и вычисления отдельно'
'slug': '/guides/separation-storage-compute'
'title': 'Хранение и вычисления отдельно'
'description': 'Этот гид исследует, как вы можете использовать ClickHouse и S3 для
  реализации архитектуры с отделённым хранением и вычислениями.'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import BucketDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';
import s3_bucket_example from '@site/static/images/guides/s3_bucket_example.png';


# Разделение хранения и вычислений

## Обзор {#overview}

Этот документ исследует, как вы можете использовать ClickHouse и S3 для реализации архитектуры с разделённым хранением и вычислениями.

Разделение хранения и вычислений означает, что ресурсы вычислений и хранения управляются независимо. В ClickHouse это позволяет улучшить масштабируемость, экономичность и гибкость. Вы можете масштабировать ресурсы хранения и вычислений отдельно по мере необходимости, оптимизируя производительность и затраты.

Использование ClickHouse с S3 особенно полезно для случаев, когда производительность запросов к "холодным" данным менее критична. ClickHouse поддерживает использование S3 в качестве хранилища для движка `MergeTree` с использованием `S3BackedMergeTree`. Этот движок таблиц позволяет пользователям воспользоваться преимуществами масштабируемости и экономии затрат S3, сохраняя производительность вставки и запросов движка `MergeTree`.

Обратите внимание, что реализация и управление архитектурой с разделённым хранением и вычислениями более сложны по сравнению со стандартными развертываниями ClickHouse. Хотя самоуправляемый ClickHouse позволяет разделять хранение и вычисления, как обсуждалось в этом руководстве, мы рекомендуем использовать [ClickHouse Cloud](https://clickhouse.com/cloud), который позволяет вам использовать ClickHouse в этой архитектуре без конфигурации, используя [движок таблиц `SharedMergeTree`](/cloud/reference/shared-merge-tree).

*Это руководство предполагает, что вы используете ClickHouse версии 22.8 или выше.*

:::warning
Не настраивайте политику жизненного цикла AWS/GCS. Это не поддерживается и может привести к повреждённым таблицам.
:::

## 1. Используйте S3 в качестве диска ClickHouse {#1-use-s3-as-a-clickhouse-disk}

### Создание диска {#creating-a-disk}

Создайте новый файл в каталоге ClickHouse `config.d`, чтобы сохранить конфигурацию хранения:

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

Скопируйте следующий XML в newly созданный файл, заменив `BUCKET`, `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY` на данные вашего AWS-ведра, где вы хотите хранить свои данные:

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

Если вам необходимо дополнительно указать настройки для диска S3, например, указать `region` или отправить пользовательский HTTP `header`, вы можете найти список соответствующих настроек [здесь](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3).

Вы также можете заменить `access_key_id` и `secret_access_key` на следующее, что попытается получить учётные данные из переменных окружения и метаданных Amazon EC2:

```bash
<use_environment_credentials>true</use_environment_credentials>
```

После того, как вы создали файл конфигурации, вам нужно обновить владельца файла на пользователя и группу clickhouse:

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

Теперь вы можете перезапустить сервер ClickHouse, чтобы изменения вступили в силу:

```bash
service clickhouse-server restart
```

## 2. Создание таблицы, использующей S3 {#2-create-a-table-backed-by-s3}

Чтобы проверить, правильно ли мы настроили диск S3, мы можем попытаться создать и запросить таблицу.

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

Обратите внимание, что нам не нужно было указывать движок как `S3BackedMergeTree`. ClickHouse автоматически конвертирует тип движка внутренне, если обнаруживает, что таблица использует S3 для хранения.

Покажите, что таблица была создана с правильной политикой:

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

Проверим, что наши строки были вставлены:

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

В консоли AWS, если ваши данные были успешно вставлены в S3, вы должны увидеть, что ClickHouse создал новые файлы в вашем указанном ведре.

Если всё прошло успешно, вы теперь используете ClickHouse с разделённым хранением и вычислениями!

<Image img={s3_bucket_example} size="md" alt="Пример ведра S3 с использованием разделения вычислений и хранения" border/>

## 3. Реализация репликации для отказоустойчивости (по желанию) {#3-implementing-replication-for-fault-tolerance-optional}

:::warning
Не настраивайте политику жизненного цикла AWS/GCS. Это не поддерживается и может привести к повреждённым таблицам.
:::

Для обеспечения отказоустойчивости вы можете использовать несколько узлов сервера ClickHouse, распределённых по нескольким регионам AWS, с ведром S3 для каждого узла.

Репликация с помощью дисков S3 может быть осуществлена с помощью движка таблиц `ReplicatedMergeTree`. Смотрите следующее руководство для подробностей:
- [Репликация одного шары в двух регионах AWS с использованием S3 Object Storage](/integrations/s3#s3-multi-region).

## Дальнейшее чтение {#further-reading}

- [Движок таблиц SharedMergeTree](/cloud/reference/shared-merge-tree)
- [Блог-объявление SharedMergeTree](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
