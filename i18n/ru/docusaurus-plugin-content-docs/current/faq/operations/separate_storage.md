---
slug: /faq/operations/deploy-separate-storage-and-compute
title: 'Можно ли развернуть ClickHouse с раздельными хранилищем и вычислениями?'
sidebar_label: 'Можно ли развернуть ClickHouse с раздельными хранилищем и вычислениями?'
toc_hidden: true
toc_priority: 20
description: 'На этой странице объясняется, можно ли развернуть ClickHouse с раздельными хранилищем и вычислениями'
doc_type: 'guide'
keywords: ['storage', 'disk configuration', 'data organization', 'volume management', 'storage tiers']
---

Краткий ответ — «да».

Объектное хранилище (S3, GCS) можно использовать как эластичное основное хранилище данных для таблиц ClickHouse. Доступны руководства [S3-backed MergeTree](/integrations/data-ingestion/s3/index.md) и [GCS-backed MergeTree](/integrations/data-ingestion/gcs/index.md). В этой конфигурации на вычислительных узлах локально хранятся только метаданные. В таком варианте вы можете легко масштабировать вычислительные ресурсы в обе стороны, так как дополнительным узлам нужно реплицировать только метаданные.