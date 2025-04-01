---
sidebar_position: 1
sidebar_label: Разделение хранилища и вычислений
slug: /guides/separation-storage-compute
---

import BucketDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';
import s3_bucket_example from '@site/static/images/guides/s3_bucket_example.png';


# Разделение хранилища и вычислений

## Обзор {#overview}

В этом руководстве рассматривается, как вы можете использовать ClickHouse и S3 для реализации архитектуры с разделенным хранилищем и вычислениями.

Разделение хранилища и вычислений означает, что вычислительные ресурсы и ресурсы хранения управляются независимо. В ClickHouse это позволяет улучшить масштабируемость, оптимальность затрат и гибкость. Вы можете масштабировать ресурсы хранения и вычисления отдельно по мере необходимости, оптимизируя производительность и затраты.

Использование ClickHouse с поддержкой S3 особенно полезно для случаев, когда производительность запросов на "холодных" данных менее критична. ClickHouse поддерживает использование S3 в качестве хранилища для движка `MergeTree` с помощью `S3BackedMergeTree`. Этот движок таблицы позволяет пользователям использовать преимущества масштабируемости и стоимости S3, сохраняя при этом производительность вставки и запросов движка `MergeTree`.

Обратите внимание, что реализация и управление архитектурой разделения хранилища и вычислений сложнее по сравнению со стандартными развертываниями ClickHouse. Хотя self-managed ClickHouse позволяет разделять хранилище и вычисления, как обсуждено в этом руководстве, мы рекомендуем использовать [ClickHouse Cloud](https://clickhouse.com/cloud), который позволяет вам использовать ClickHouse в этой архитектуре без конфигурации с помощью [движка таблиц `SharedMergeTree`](/cloud/reference/shared-merge-tree).

*Данное руководство предполагает, что вы используете ClickHouse версии 22.8 или выше.*

:::warning
Не настраивайте политику жизненного цикла AWS/GCS. Это не поддерживается и может привести к поломке таблиц.
:::

## 1. Используйте S3 в качестве диска ClickHouse {#1-use-s3-as-a-clickhouse-disk}

### Создание диска {#creating-a-disk}

Создайте новый файл в каталоге `config.d` ClickHouse для хранения конфигурации хранилища:

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

Скопируйте следующий XML в вновь созданный файл, заменив `BUCKET`, `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY` на данные вашего AWS-бакета, куда вы хотите сохранить свои данные:

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

Если вам нужно дополнительно указать параметры для диска S3, например, указать `region` или отправить пользовательский HTTP `header`, вы можете найти список соответствующих параметров [здесь](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3).

Вы также можете заменить `access_key_id` и `secret_access_key` на следующее, что попытается получить учетные данные из переменных окружения и метаданных Amazon EC2:

```bash
<use_environment_credentials>true</use_environment_credentials>
```

После создания файла конфигурации вам необходимо обновить владельца файла на пользователя и группу clickhouse:

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

Теперь вы можете перезапустить сервер ClickHouse, чтобы изменения вступили в силу:

```bash
service clickhouse-server restart
```

## 2. Создайте таблицу с поддержкой S3 {#2-create-a-table-backed-by-s3}

Чтобы проверить, что мы правильно настроили диск S3, мы можем попытаться создать и запросить таблицу.

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

Обратите внимание, что нам не нужно было указывать движок как `S3BackedMergeTree`. ClickHouse автоматически преобразует тип движка внутренне, если обнаружит, что таблица использует S3 для хранения.

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

В консоли AWS, если ваши данные были успешно вставлены в S3, вы должны увидеть, что ClickHouse создал новые файлы в вашем указанном бакете.

Если все прошло успешно, вы теперь используете ClickHouse с разделенным хранилищем и вычислениями!

<img src={s3_bucket_example}
    alt="Пример бакета S3 с использованием разделения вычислений и хранилища"
    class="image"
/>

## 3. Реализация репликации для повышения устойчивости (по желанию) {#3-implementing-replication-for-fault-tolerance-optional}

:::warning
Не настраивайте политику жизненного цикла AWS/GCS. Это не поддерживается и может привести к поломке таблиц.
:::

Для повышения устойчивости вы можете использовать несколько узлов сервера ClickHouse, распределенных по нескольким регионам AWS, с бакетом S3 для каждого узла.

Репликация с дисками S3 может быть выполнена с помощью движка таблиц `ReplicatedMergeTree`. Смотрите следующее руководство для подробностей:
- [Репликация одного шарда между двумя регионами AWS с использованием S3 Object Storage](/integrations/s3#s3-multi-region).

## Дальнейшее чтение {#further-reading}

- [Движок таблиц SharedMergeTree](/cloud/reference/shared-merge-tree)
- [Блог-анонс SharedMergeTree](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
