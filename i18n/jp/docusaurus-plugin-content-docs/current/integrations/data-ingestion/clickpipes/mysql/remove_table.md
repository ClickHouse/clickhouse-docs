---
title: 'ClickPipe から特定のテーブルを削除する'
description: 'ClickPipe から特定のテーブルを削除する'
sidebar_label: 'テーブルの削除'
slug: /integrations/clickpipes/mysql/removing_tables
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

場合によっては、MySQL ClickPipe から特定のテーブルを除外した方がよい場合があります。たとえば、あるテーブルが分析ワークロードに不要であれば、そのテーブルをスキップすることで、ClickHouse におけるストレージおよびレプリケーションコストを削減できます。


## 特定のテーブルを削除する手順 {#remove-tables-steps}

最初のステップは、パイプからテーブルを削除することです。以下の手順で実行できます:

1. パイプを[一時停止](./pause_and_resume.md)します。
2. Edit Table Settingsをクリックします。
3. テーブルを検索します - 検索バーで検索できます。
4. 選択されているチェックボックスをクリックして、テーブルの選択を解除します。
   <br />

<Image img={remove_table} border size='md' />

5. updateをクリックします。
6. 更新が正常に完了すると、**Metrics**タブでステータスが**Running**と表示されます。このテーブルは、このClickPipeによって複製されなくなります。
