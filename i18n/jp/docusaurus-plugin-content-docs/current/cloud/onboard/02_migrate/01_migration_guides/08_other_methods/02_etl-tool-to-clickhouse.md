---
sidebar_label: 'サードパーティ製ETLツールの使用'
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/etl-tool-to-clickhouse
title: 'サードパーティ製ETLツールの使用'
description: 'ClickHouseでサードパーティ製ETLツールを使用する方法を説明するページ'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import third_party_01 from '@site/static/images/integrations/migration/third-party-01.png';


# サードパーティ製 ETL ツールの利用

<Image img={third_party_01} size='sm' alt='Migrating Self-managed ClickHouse' background='white' />

外部データソースから ClickHouse にデータを移行する優れた方法の 1 つは、一般的な ETL/ELT ツールのいずれかを利用することです。以下のツールについてはドキュメントを用意しています。

- [Airbyte](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)
- [Vector](/integrations/data-ingestion/etl-tools/vector-to-clickhouse.md)

このほかにも ClickHouse と連携する ETL/ELT ツールは多数存在しますので、お使いのツールのドキュメントを参照して詳細を確認してください。