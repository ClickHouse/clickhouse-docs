---
sidebar_label: 'Обзор'
sidebar_position: 1
slug: /integrations/migration/overview
keywords: ['clickhouse', 'миграция', 'миграция данных', 'перенос данных']
title: 'Перенос данных в ClickHouse'
description: 'Страница, описывающая доступные варианты переноса данных в ClickHouse'
---


# Перенос данных в ClickHouse

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

Существует несколько вариантов переноса данных в ClickHouse Cloud, в зависимости от того, где ваши данные находятся в данный момент:

- [С самоуправляемого в облако](./clickhouse-to-cloud.md): используйте функцию `remoteSecure` для передачи данных
- [С другого СУБД](./clickhouse-local-etl.md): используйте ETL инструмент [clickhouse-local] вместе с соответствующей табличной функцией ClickHouse для вашей текущей СУБД
- [Откуда угодно!](./etl-tool-to-clickhouse.md): используйте один из множества популярных ETL/ELT инструментов, которые подключаются ко всем видам различных источников данных
- [Объектное хранилище](./object-storage-to-clickhouse.md): легко вставьте данные из S3 в ClickHouse

В примере [Миграция из Redshift](/integrations/data-ingestion/redshift/index.md) мы представляем три различных способа переноса данных в ClickHouse.
