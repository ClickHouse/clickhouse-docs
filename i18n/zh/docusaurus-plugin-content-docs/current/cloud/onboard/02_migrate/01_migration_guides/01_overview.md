---
sidebar_label: '概览'
sidebar_position: 1
slug: /integrations/migration/overview
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data']
title: '将数据迁移到 ClickHouse'
description: '本页介绍将数据迁移到 ClickHouse 的可用选项'
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

根据您当前数据所在的位置，有多种方式可以将数据迁移到 ClickHouse Cloud：

- [自托管迁移到 Cloud](/cloud/migration/clickhouse-to-cloud)：使用 `remoteSecure` 函数传输数据
- [从其他 DBMS 迁移](/cloud/migration/clickhouse-local)：使用 [clickhouse-local] ETL 工具，并结合适用于您当前 DBMS 的相应 ClickHouse 表函数
- [从任意来源迁移！](/cloud/migration/etl-tool-to-clickhouse)：使用众多主流 ETL/ELT 工具之一，这些工具可以连接各种不同的数据源
- [对象存储](/integrations/migration/object-storage-to-clickhouse)：可轻松将 S3 中的数据插入到 ClickHouse 中

在示例 [从 Redshift 迁移](/migrations/redshift/migration-guide) 中，我们介绍了三种不同的数据迁移到 ClickHouse 的方法。