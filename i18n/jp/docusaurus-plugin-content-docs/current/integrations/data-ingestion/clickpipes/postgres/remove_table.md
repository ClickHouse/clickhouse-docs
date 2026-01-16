---
title: 'ClickPipe から特定のテーブルを削除する'
description: 'ClickPipe から特定のテーブルを削除する'
sidebar_label: 'テーブルの削除'
slug: /integrations/clickpipes/postgres/removing_tables
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'データ インジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

場合によっては、Postgres ClickPipe から特定のテーブルを除外したほうがよいことがあります。たとえば、分析ワークロードに必要ないテーブルであれば、それをスキップすることで、ClickHouse におけるストレージおよびレプリケーションのコストを削減できます。

## 特定のテーブルを削除する手順 \\{#remove-tables-steps\\}

最初の手順は、パイプからテーブルを外すことです。次の手順で行います。

1. パイプを[一時停止](./pause_and_resume.md)します。
2. 「Edit Table Settings」をクリックします。
3. 検索バーで対象のテーブルを検索して見つけます。
4. 選択済みのチェックボックスをクリックして、そのテーブルの選択を解除します。

<br/>

<Image img={remove_table} border size="md"/>

5. 「Update」をクリックします。
6. 更新が正常に完了すると、**Metrics** タブでステータスが **Running** になります。このテーブルは、以後この ClickPipe によってレプリケートされなくなります。