---
'sidebar_label': 'Обзор'
'sidebar_position': 1
'slug': '/integrations/migration/overview'
'keywords':
- 'clickhouse'
- 'migrate'
- 'migration'
- 'migrating'
- 'data'
'title': 'Перенос данных в ClickHouse'
'description': 'Страница, описывающая доступные варианты переноса данных в ClickHouse'
'doc_type': 'guide'
---
# Миграция данных в ClickHouse

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

Существует несколько вариантов миграции данных в ClickHouse Cloud, в зависимости от того, где ваши данные находятся сейчас:

- [С самоуправляемого на облако](/cloud/migration/clickhouse-to-cloud): используйте функцию `remoteSecure` для передачи данных
- [С другого СУБД](/cloud/migration/clickhouse-local): используйте инструмент [clickhouse-local] для ETL вместе с соответствующей табличной функцией ClickHouse для вашей текущей СУБД
- [Где угодно!](/cloud/migration/etl-tool-to-clickhouse): используйте один из многочисленных популярных ETL/ELT инструментов, которые подключаются ко всем видам различных источников данных
- [Объектное Хранилище](/integrations/migration/object-storage-to-clickhouse): легко вставляйте данные из S3 в ClickHouse

В примере [Миграция из Redshift](/migrations/redshift/migration-guide) мы представляем три разных способа миграции данных в ClickHouse.