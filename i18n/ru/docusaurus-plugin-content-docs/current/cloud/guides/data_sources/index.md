---
slug: /cloud/guides/data-sources
title: 'Источники данных'
hide_title: true
description: 'Страница содержания для раздела руководств по ClickHouse Cloud'
doc_type: 'landing-page'
keywords: ['cloud guides', 'documentation', 'how-to', 'cloud features', 'tutorials']
---



## Облачные интеграции {#cloud-integrations}

Этот раздел содержит руководства и справочные материалы по интеграции ClickHouse Cloud с внешними источниками данных, требующими дополнительной настройки.

| Страница                                                       | Описание                                                               |
| -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [IP-адреса облака](/manage/data-sources/cloud-endpoints-api) | Сетевая информация, необходимая для некоторых табличных функций и подключений |
| [Безопасный доступ к данным S3](/cloud/data-sources/secure-s3)    | Доступ к внешним источникам данных в AWS S3 с использованием ролевого доступа         |


## Дополнительные подключения к внешним источникам данных {#additional-connections-for-external-data-sources}

### ClickPipes для приёма данных {#clickpipes-for-data-ingestion}

ClickPipes позволяют легко интегрировать потоковые данные из различных источников. Дополнительную информацию см. в разделе [ClickPipes](/integrations/clickpipes) документации по интеграциям.

### Табличные функции как внешние источники данных {#table-functions-as-external-data-sources}

ClickHouse поддерживает ряд табличных функций для доступа к внешним источникам данных. Дополнительную информацию см. в разделе [табличные функции](/sql-reference/table-functions) справочника по SQL.
