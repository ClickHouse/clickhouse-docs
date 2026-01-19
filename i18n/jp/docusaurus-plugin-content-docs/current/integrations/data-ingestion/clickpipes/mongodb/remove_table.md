---
title: 'ClickPipe から特定のテーブルを削除する'
description: 'ClickPipe から特定のテーブルを削除する'
sidebar_label: 'テーブルの削除'
slug: /integrations/clickpipes/mongodb/removing_tables
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

場合によっては、特定のテーブルを MongoDB の ClickPipe から除外するのが理にかなうことがあります。たとえば、あるテーブルが分析ワークロードに不要な場合、それをスキップすることで、ClickHouse におけるストレージおよびレプリケーションコストを削減できます。

## 特定のテーブルを削除する手順 \{#remove-tables-steps\}

最初に、対象のテーブルをパイプから削除します。次の手順で行います。

1. パイプを[一時停止](./pause_and_resume.md)します。
2. 「Edit Table Settings」をクリックします。
3. 対象のテーブルを見つけます。検索バーで検索します。
4. 選択済みのチェックボックスをクリックして、そのテーブルの選択を解除します。

<br/>

<Image img={remove_table} border size="md"/>

5. 「Update」をクリックします。
6. 更新が成功すると、**Metrics** タブのステータスが **Running** になります。このテーブルはこの ClickPipe によって複製されなくなります。