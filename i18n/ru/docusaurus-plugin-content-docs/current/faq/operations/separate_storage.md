---
slug: /faq/operations/deploy-separate-storage-and-compute
title: 'Можно ли развернуть ClickHouse с раздельными слоями хранения и вычислений?'
sidebar_label: 'Можно ли развернуть ClickHouse с раздельными слоями хранения и вычислений?'
toc_hidden: true
toc_priority: 20
description: 'На этой странице приведён ответ на вопрос, можно ли развернуть ClickHouse с раздельными слоями хранения и вычислений'
doc_type: 'guide'
keywords: ['storage', 'disk configuration', 'data organization', 'volume management', 'storage tiers']
---

Краткий ответ — «да».

Object storage (S3, GCS) может использоваться как эластичное основное хранилище данных для таблиц ClickHouse. Доступны руководства [S3-backed MergeTree](/integrations/data-ingestion/s3/index.md) и [GCS-backed MergeTree](/integrations/data-ingestion/gcs/index.md). В этой конфигурации локально на вычислительных узлах хранятся только метаданные. В таком окружении вы можете легко масштабировать вычислительные ресурсы вверх и вниз, поскольку дополнительным узлам нужно реплицировать только метаданные.