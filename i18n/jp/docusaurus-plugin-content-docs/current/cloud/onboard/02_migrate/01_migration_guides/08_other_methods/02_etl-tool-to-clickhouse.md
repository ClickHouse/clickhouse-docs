---
sidebar_label: 'サードパーティETLツールの使用'
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/etl-tool-to-clickhouse
title: 'サードパーティETLツールの使用'
description: 'ClickHouseとサードパーティETLツールを連携する方法を説明するページ'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import third_party_01 from '@site/static/images/integrations/migration/third-party-01.png';


# サードパーティETLツールの使用

<Image img={third_party_01} size='sm' alt='セルフマネージドClickHouseの移行' background='white' />

外部データソースからClickHouseへデータを移行する際の有効な選択肢として、広く利用されているETL/ELTツールの活用が挙げられます。以下のツールについてドキュメントを提供しています:

- [Airbyte](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)
- [Vector](/integrations/data-ingestion/etl-tools/vector-to-clickhouse.md)

これら以外にも、ClickHouseと連携可能なETL/ELTツールは多数存在します。詳細については、ご利用のツールのドキュメントをご参照ください。