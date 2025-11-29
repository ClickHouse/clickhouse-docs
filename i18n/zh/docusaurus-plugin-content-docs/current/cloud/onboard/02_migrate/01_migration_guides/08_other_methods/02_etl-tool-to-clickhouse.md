---
sidebar_label: '使用第三方 ETL 工具'
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/etl-tool-to-clickhouse
title: '使用第三方 ETL 工具'
description: '本页介绍如何将第三方 ETL 工具与 ClickHouse 配合使用'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import third_party_01 from '@site/static/images/integrations/migration/third-party-01.png';

# 使用第三方 ETL 工具 {#using-a-3rd-party-etl-tool}

<Image img={third_party_01} size="sm" alt="迁移自托管 ClickHouse" background="white" />

将数据从外部数据源迁移到 ClickHouse 的一个很好的选择，是使用众多流行的 ETL/ELT 工具之一。我们提供以下相关文档：

* [Airbyte](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)
* [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)
* [Vector](/integrations/data-ingestion/etl-tools/vector-to-clickhouse.md)

此外，还有许多其他 ETL/ELT 工具可以与 ClickHouse 集成，请查阅所使用工具的文档以获取详细信息。