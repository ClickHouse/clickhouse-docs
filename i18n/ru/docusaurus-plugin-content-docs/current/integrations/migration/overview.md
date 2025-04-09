---
sidebar_label: 'Обзор'
sidebar_position: 1
slug: /integrations/migration/overview
keywords: ['clickhouse', 'миграция', 'миграция данных', 'перемещение', 'данные']
title: 'Миграция данных в ClickHouse'
description: 'Страница, описывающая доступные варианты миграции данных в ClickHouse'
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

Существует несколько вариантов миграции данных в ClickHouse Cloud, в зависимости от того, где в настоящее время находятся ваши данные:

- [С самоуправляемого в облако](./clickhouse-to-cloud.md): используйте функцию `remoteSecure` для передачи данных
- [Из другой СУБД](./clickhouse-local-etl.md): используйте инструмент [clickhouse-local] ETL вместе с соответствующей табличной функцией ClickHouse для вашей текущей СУБД
- [Везде!](./etl-tool-to-clickhouse.md): используйте один из популярных инструментов ETL/ELT, которые подключаются ко всем видам различных источников данных
- [Объектное хранилище](./object-storage-to-clickhouse.md): легко вставляйте данные из S3 в ClickHouse

В примере [Миграция из Redshift](/integrations/data-ingestion/redshift/index.md) мы представляем три различных способа миграции данных в ClickHouse.
