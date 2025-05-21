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
'description': '描述将数据迁移到 ClickHouse 的可用选项的页面'
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

根据您的数据当前所在位置，有几种将数据迁移到 ClickHouse Cloud 的选项：

- [自管理到云](./clickhouse-to-cloud.md): 使用 `remoteSecure` 函数传输数据
- [其他 DBMS](./clickhouse-local-etl.md): 使用 [clickhouse-local] ETL 工具以及适合您当前 DBMS 的 ClickHouse 表函数
- [任何地方！](./etl-tool-to-clickhouse.md): 使用与各种不同数据源连接的众多流行 ETL/ELT 工具之一
- [对象存储](./object-storage-to-clickhouse.md): 轻松将数据从 S3 插入 ClickHouse

在示例 [从 Redshift 迁移](/integrations/data-ingestion/redshift/index.md) 中，我们展示了三种将数据迁移到 ClickHouse 的不同方法。
