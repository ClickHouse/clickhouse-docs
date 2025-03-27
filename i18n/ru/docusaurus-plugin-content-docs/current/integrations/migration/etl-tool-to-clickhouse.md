---
sidebar_label: 'Использование сторонних ETL инструментов'
sidebar_position: 20
keywords: ['clickhouse', 'мигрировать', 'миграция', 'миграция', 'данные', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/etl-tool-to-clickhouse
title: 'Использование сторонних ETL инструментов'
description: 'Страница, описывающая, как использовать сторонний ETL инструмент с ClickHouse'
---

import Image from '@theme/IdealImage';
import third_party_01 from '@site/static/images/integrations/migration/third-party-01.png';


# Использование сторонних ETL инструментов

<Image img={third_party_01} size='sm' alt='Миграция самоуправляемого ClickHouse' background='white' />

Отличным вариантом для переноса данных из внешнего источника в ClickHouse является использование одного из популярных инструментов ETL и ELT. У нас есть документация, охватывающая следующее:

- [Airbyte](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)
- [Vector](/integrations/data-ingestion/etl-tools/vector-to-clickhouse.md)

Но есть и множество других ETL/ELT инструментов, которые интегрируются с ClickHouse, поэтому проверьте документацию вашего любимого инструмента для получения подробной информации.
