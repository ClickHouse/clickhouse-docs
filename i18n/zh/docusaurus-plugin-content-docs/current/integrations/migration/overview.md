---
sidebar_label: '概述'
sidebar_position: 1
slug: /integrations/migration/overview
keywords: ['clickhouse', '迁移', '迁移', '迁移', '数据']
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

有几种选项可以将数据迁移到 ClickHouse Cloud，具体取决于您的数据现在存储在哪里：

- [自管理到云](./clickhouse-to-cloud.md): 使用 `remoteSecure` 函数传输数据
- [另一个 DBMS](./clickhouse-local-etl.md): 使用 [clickhouse-local] ETL 工具以及适合您当前 DBMS 的 ClickHouse 表函数
- [任何地方！](./etl-tool-to-clickhouse.md): 使用许多流行的 ETL/ELT 工具之一，连接到各种不同的数据源
- [对象存储](./object-storage-to-clickhouse.md): 轻松将数据从 S3 插入到 ClickHouse

在例子 [从 Redshift 迁移](/integrations/data-ingestion/redshift/index.md) 中，我们提供了三种不同的方法将数据迁移到 ClickHouse。
