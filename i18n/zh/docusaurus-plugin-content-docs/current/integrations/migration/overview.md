---
'sidebar_label': '概述'
'sidebar_position': 1
'slug': '/integrations/migration/overview'
'keywords':
- 'clickhouse'
- 'migrate'
- 'migration'
- 'migrating'
- 'data'
'title': '将数据迁移到 ClickHouse'
'description': '页面描述了将数据迁移到 ClickHouse 可用的选项'
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

根据您当前数据的存放位置，有几种将数据迁移到 ClickHouse Cloud 的选项：

- [自管理到 Cloud](./clickhouse-to-cloud.md): 使用 `remoteSecure` 函数传输数据
- [其他 DBMS](./clickhouse-local-etl.md): 使用 [clickhouse-local] ETL 工具以及适合您当前 DBMS 的 ClickHouse 表函数
- [任何地方!](./etl-tool-to-clickhouse.md): 使用许多流行的 ETL/ELT 工具，这些工具可以连接到各种不同的数据源
- [对象存储](./object-storage-to-clickhouse.md): 轻松将数据从 S3 插入到 ClickHouse

在示例 [从 Redshift 迁移](/integrations/data-ingestion/redshift/index.md) 中，我们展示了三种将数据迁移到 ClickHouse 的不同方式。
