---
sidebar_label: 'MinIO'
sidebar_position: 6
slug: /integrations/minio
description: 'Страница, описывающая использование MinIO с ClickHouse'
title: 'Использование MinIO'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
keywords: ['s3', 'minio', 'объектное хранилище', 'загрузка данных', 'совместимое хранилище']
---

# Использование MinIO \{#using-minio\}

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

Все функции и таблицы `S3` совместимы с [MinIO](https://min.io/). Вы можете получить более высокую пропускную способность при использовании самостоятельно развернутых хранилищ MinIO, особенно при оптимальной сетевой локальности.

Конфигурация `S3-backed MergeTree` также совместима, с некоторыми незначительными изменениями в настройках:

```xml
<clickhouse>
    <storage_configuration>
        ...
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>https://min.io/tables//</endpoint>
                <access_key_id>your_access_key_id</access_key_id>
                <secret_access_key>your_secret_access_key</secret_access_key>
                <region></region>
                <metadata_path>/var/lib/clickhouse/disks/s3/</metadata_path>
            </s3>
            <s3_cache>
                <type>cache</type>
                <disk>s3</disk>
                <path>/var/lib/clickhouse/disks/s3_cache/</path>
                <max_size>10Gi</max_size>
            </s3_cache>
        </disks>
        ...
    </storage_configuration>
</clickhouse>
```

:::tip
Обратите внимание на двойной слэш в теге `<endpoint>` — он нужен, чтобы указать корень бакета.
:::
