---
sidebar_label: 'Использование ETL инструмента третьей стороны'
sidebar_position: 20
keywords: ['clickhouse', 'миграция', 'перемещение', 'данные', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/etl-tool-to-clickhouse
title: 'Использование ETL инструмента третьей стороны'
description: 'Страница, описывающая, как использовать ETL инструмент третьей стороны с ClickHouse'
---

import Image from '@theme/IdealImage';
import third_party_01 from '@site/static/images/integrations/migration/third-party-01.png';


# Использование ETL инструмента третьей стороны

<Image img={third_party_01} size='sm' alt='Миграция самоуправляемого ClickHouse' background='white' />

Отличным вариантом для перемещения данных из внешнего источника в ClickHouse является использование одного из множества популярных ETL и ELT инструментов. У нас есть документация, которая охватывает следующее:

- [Airbyte](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)
- [Vector](/integrations/data-ingestion/etl-tools/vector-to-clickhouse.md)

Но есть и много других ETL/ELT инструментов, которые интегрируются с ClickHouse, так что проверьте документацию вашего любимого инструмента для получения подробностей.
