---
sidebar_label: Обзор
sidebar_position: 1
slug: /integrations/migration/overview
keywords: ['clickhouse', 'миграция', 'мигрировать', 'данные']
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

- [Self-managed в Cloud](./clickhouse-to-cloud.md): используйте функцию `remoteSecure` для передачи данных
- [Другой СУБД](./clickhouse-local-etl.md): используйте инструмент [clickhouse-local] ETL вместе с подходящей функцией таблицы ClickHouse для вашей текущей СУБД
- [Куда угодно!](./etl-tool-to-clickhouse.md): используйте один из популярных ETL/ELT инструментов, которые подключаются ко всем типам различных источников данных
- [Объектное хранилище](./object-storage-to-clickhouse.md): легко вставить данные из S3 в ClickHouse

В примере [Миграция из Redshift](/integrations/data-ingestion/redshift/index.md) мы представляем три различных способа миграции данных в ClickHouse.
