---
title: 'ClickPipe から特定のテーブルを削除する'
description: 'ClickPipe から特定のテーブルを削除する'
sidebar_label: 'テーブルの削除'
slug: /integrations/clickpipes/postgres/removing_tables
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

場合によっては、特定のテーブルを Postgres ClickPipe の対象から除外した方が妥当な場合があります。たとえば、そのテーブルが分析ワークロードに不要であれば、取り込まずにスキップすることで、ClickHouse におけるストレージおよびレプリケーションのコストを削減できます。


## 特定のテーブルを削除する手順 {#remove-tables-steps}

最初の手順は、パイプからテーブルを削除することです。以下の手順で実行できます:

1. パイプを[一時停止](./pause_and_resume.md)します。
2. 「Edit Table Settings」をクリックします。
3. 対象のテーブルを特定します。検索バーで検索することで見つけることができます。
4. 選択されているチェックボックスをクリックして、テーブルの選択を解除します。
   <br />

<Image img={remove_table} border size='md' />

5. 「update」をクリックします。
6. 更新が正常に完了すると、**Metrics**タブでステータスが**Running**と表示されます。このテーブルは、このClickPipeによって複製されなくなります。
