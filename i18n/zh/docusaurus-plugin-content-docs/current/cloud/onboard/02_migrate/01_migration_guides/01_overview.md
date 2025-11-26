---
sidebar_label: '概述'
sidebar_position: 1
slug: /integrations/migration/overview
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data']
title: '将数据迁移到 ClickHouse'
description: '介绍可用于将数据迁移到 ClickHouse 的各种选项的页面'
doc_type: 'guide'
---

# 将数据迁移到 ClickHouse

<div class='vimeo-container'>
  <iframe src="https://player.vimeo.com/video/753082620?h=eb566c8c08"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

<br/>

根据当前数据所在的位置，有多种方式可以将数据迁移到 ClickHouse Cloud：

- [自托管迁移到 Cloud](/cloud/migration/clickhouse-to-cloud)：使用 `remoteSecure` 函数传输数据
- [其他 DBMS](/cloud/migration/clickhouse-local)：将 [clickhouse-local] ETL 工具与适用于当前 DBMS 的相应 ClickHouse 表函数配合使用
- [任意数据源！](/cloud/migration/etl-tool-to-clickhouse)：使用众多常用的 ETL/ELT 工具之一连接各种不同的数据源
- [对象存储](/integrations/migration/object-storage-to-clickhouse)：轻松将 S3 中的数据插入到 ClickHouse 中

在示例 [从 Redshift 迁移](/migrations/redshift/migration-guide) 中，我们展示了三种不同的数据迁移方式，将数据迁移到 ClickHouse。