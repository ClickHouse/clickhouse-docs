---
sidebar_label: 'Обзор'
sidebar_position: 1
slug: /integrations/migration/overview
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data']
title: 'Миграция данных в ClickHouse'
description: 'Страница с описанием вариантов миграции данных в ClickHouse'
doc_type: 'guide'
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

Существует несколько вариантов миграции данных в ClickHouse Cloud в зависимости от того, где сейчас находятся ваши данные:

- [Self-managed to Cloud](/cloud/migration/clickhouse-to-cloud): используйте функцию `remoteSecure` для переноса данных
- [Another DBMS](/cloud/migration/clickhouse-local): используйте ETL‑инструмент [clickhouse-local] вместе с соответствующей табличной функцией ClickHouse для вашей текущей СУБД
- [Anywhere!](/cloud/migration/etl-tool-to-clickhouse): используйте один из множества популярных ETL/ELT‑инструментов, которые подключаются к самым разным источникам данных
- [Object Storage](/integrations/migration/object-storage-to-clickhouse): просто загружайте данные из S3 в ClickHouse

В примере [Migrate from Redshift](/migrations/redshift/migration-guide) мы показываем три разных способа миграции данных в ClickHouse.