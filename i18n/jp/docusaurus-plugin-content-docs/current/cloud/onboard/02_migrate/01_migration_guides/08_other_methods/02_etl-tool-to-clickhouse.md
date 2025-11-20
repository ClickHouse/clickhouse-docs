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


# サードパーティ製 ETL ツールの利用

<Image img={third_party_01} size='sm' alt='自己管理型 ClickHouse の移行' background='white' />

外部のデータソースから ClickHouse にデータを取り込むには、数多く存在する一般的な ETL や ELT ツールを利用するのが有力な選択肢です。以下のツールについてはドキュメントを用意しています。

- [Airbyte](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)
- [Vector](/integrations/data-ingestion/etl-tools/vector-to-clickhouse.md)

このほかにも、ClickHouse と連携可能な ETL/ELT ツールは多数ありますので、お好みのツールのドキュメントを参照して詳細を確認してください。