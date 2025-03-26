---
sidebar_label: 'MinIO'
sidebar_position: 6
slug: /integrations/minio
description: 'Страница, описывающая, как использовать MinIO с ClickHouse'
title: 'Использование MinIO'
---


# Использование MinIO

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

Все функции и таблицы S3 совместимы с [MinIO](https://min.io/). Пользователи могут наблюдать более высокую пропускную способность на самоуправляемых хранилищах MinIO, особенно в случае оптимальной сетевой локальности.

Также конфигурация backed merge tree совместима, с некоторыми незначительными изменениями в конфигурации:

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
Обратите внимание на двойной слэш в теге endpoint, это необходимо для обозначения корня корзины.
:::
