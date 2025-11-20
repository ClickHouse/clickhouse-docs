---
sidebar_label: '使用第三方 ETL 工具'
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/etl-tool-to-clickhouse
title: '使用第三方 ETL 工具'
description: '介绍如何将第三方 ETL 工具与 ClickHouse 搭配使用的页面'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import third_party_01 from '@site/static/images/integrations/migration/third-party-01.png';


# 使用第三方 ETL 工具

<Image img={third_party_01} size='sm' alt='迁移自管 ClickHouse' background='white' />

将数据从外部数据源迁移到 ClickHouse 的一个极佳选项是使用众多流行的 ETL 或 ELT 工具之一。我们提供了以下相关文档：

- [Airbyte](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)
- [Vector](/integrations/data-ingestion/etl-tools/vector-to-clickhouse.md)

此外，还有许多其他 ETL/ELT 工具可以与 ClickHouse 集成，请查阅你常用工具的文档以了解详情。