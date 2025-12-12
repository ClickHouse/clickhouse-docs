---
sidebar_label: 'サードパーティ製 ETL ツールの利用'
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/etl-tool-to-clickhouse
title: 'サードパーティ製 ETL ツールの利用'
description: 'ClickHouse でサードパーティ製 ETL ツールを利用する方法を説明するページ'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import third_party_01 from '@site/static/images/integrations/migration/third-party-01.png';

外部データソースから ClickHouse にデータを取り込む優れた方法の 1 つは、数多く存在する一般的な ETL/ELT ツールを利用することです。次のツールについてはドキュメントを用意しています。

* [Airbyte](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)
* [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)
* [Vector](/integrations/data-ingestion/etl-tools/vector-to-clickhouse.md)

しかし、ClickHouse と連携できる ETL/ELT ツールは他にも多数あるため、お使いのツールのドキュメントを確認して詳細を参照してください。

<Image img={third_party_01} size="lg" alt="セルフマネージド ClickHouse の移行" />
