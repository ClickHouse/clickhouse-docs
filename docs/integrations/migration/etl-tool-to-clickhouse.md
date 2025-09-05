---
sidebar_label: 'Using a 3rd-party ETL Tool'
sidebar_position: 20
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/etl-tool-to-clickhouse
title: 'Using a 3rd-party ETL Tool'
description: 'Page describing how to use a 3rd-party ETL tool with ClickHouse'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import third_party_01 from '@site/static/images/integrations/migration/third-party-01.png';

# Using a 3rd-party ETL Tool

<Image img={third_party_01} size='sm' alt='Migrating Self-managed ClickHouse' background='white' />

A great option for moving data from an external data source into ClickHouse is to use one of the many popular ETL and ELT. We have docs that cover the following:

- [Airbyte](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)
- [Vector](/integrations/data-ingestion/etl-tools/vector-to-clickhouse.md)

But there are many other ETL/ELT tools that integrate with ClickHouse, so check your favorite tool's documentation for details.
