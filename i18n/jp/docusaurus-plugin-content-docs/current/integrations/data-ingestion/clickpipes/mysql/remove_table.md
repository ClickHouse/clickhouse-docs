---
title: 'ClickPipe から特定のテーブルを除外する'
description: 'ClickPipe から特定のテーブルを除外する'
sidebar_label: 'テーブルの除外'
slug: /integrations/clickpipes/mysql/removing_tables
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'データインジェスト', 'リアルタイム同期']
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

場合によっては、特定のテーブルを MySQL ClickPipe から除外したほうがよい場合があります。たとえば、あるテーブルが分析ワークロードに不要であれば、そのテーブルをスキップすることで、ClickHouse でのストレージやレプリケーションのコストを削減できます。


## 特定のテーブルを削除する手順 {#remove-tables-steps}

最初の手順は、パイプからテーブルを除外することです。これは次の手順で実行できます。

1. パイプを[一時停止](./pause_and_resume.md)します。
2. 「Edit Table Settings」をクリックします。
3. 対象のテーブルを探します（検索バーで検索できます）。
4. 選択されているチェックボックスをクリックして、そのテーブルの選択を解除します。
<br/>

<Image img={remove_table} border size="md"/>

5. 「Update」をクリックします。
6. 正常に更新されると、**Metrics** タブでステータスが **Running** になります。このテーブルは今後、この ClickPipe によってレプリケートされなくなります。
