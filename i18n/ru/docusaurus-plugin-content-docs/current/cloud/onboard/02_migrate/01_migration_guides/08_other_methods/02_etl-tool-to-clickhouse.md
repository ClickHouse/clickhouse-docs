---
sidebar_label: 'Использование стороннего ETL-инструмента'
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/etl-tool-to-clickhouse
title: 'Использование стороннего ETL-инструмента'
description: 'Страница, описывающая использование стороннего ETL-инструмента с ClickHouse'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import third_party_01 from '@site/static/images/integrations/migration/third-party-01.png';


# Использование стороннего ETL-инструмента

<Image img={third_party_01} size='sm' alt='Миграция самоуправляемого ClickHouse' background='white' />

Отличный вариант переноса данных из внешнего источника в ClickHouse — использовать один из многочисленных популярных ETL- и ELT-инструментов. В нашей документации рассматриваются следующие варианты:

- [Airbyte](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)
- [Vector](/integrations/data-ingestion/etl-tools/vector-to-clickhouse.md)

Однако существует множество других ETL/ELT-инструментов, которые интегрируются с ClickHouse, поэтому обратитесь к документации вашего предпочитаемого инструмента за подробностями.