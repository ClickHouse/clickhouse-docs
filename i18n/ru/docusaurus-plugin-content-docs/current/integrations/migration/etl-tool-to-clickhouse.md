---
sidebar_label: Использование стороннего ETL инструмента
sidebar_position: 20
keywords: [clickhouse, миграция, migrating, данные, etl, elt, clickhouse-local, clickhouse-client]
slug: '/cloud/migration/etl-tool-to-clickhouse'
---

import third_party_01 from '@site/static/images/integrations/migration/third-party-01.png';


# Использование стороннего ETL инструмента

<img src={third_party_01} class="image" alt="Миграция self-managed ClickHouse" style={{width: '40%', padding: '30px'}} />

Отличный вариант для перемещения данных из внешнего источника в ClickHouse — использовать один из многих популярных ETL и ELT. У нас есть документация, охватывающая следующее:

- [Airbyte](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)
- [Vector](/integrations/data-ingestion/etl-tools/vector-to-clickhouse.md)

Но также есть много других ETL/ELT инструментов, которые интегрируются с ClickHouse, поэтому проверьте документацию вашего любимого инструмента для получения подробностей.
