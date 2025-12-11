---
sidebar_label: '使用第三方 ETL 工具'
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/etl-tool-to-clickhouse
title: '使用第三方 ETL 工具'
description: '介绍如何将第三方 ETL 工具与 ClickHouse 配合使用的页面'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import third_party_01 from '@site/static/images/integrations/migration/third-party-01.png';

将外部数据源中的数据迁移到 ClickHouse，一个很好的选择是使用众多流行的 ETL 和 ELT 工具之一。我们已有文档覆盖以下内容：

* [Airbyte](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)
* [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)
* [Vector](/integrations/data-ingestion/etl-tools/vector-to-clickhouse.md)

此外，还有许多其他可与 ClickHouse 集成的 ETL/ELT 工具，请查阅您常用工具的文档以获取详细信息。

<Image img={third_party_01} size="lg" alt="迁移自管理的 ClickHouse" />
