---
'title': 'ClickPipeから特定のテーブルを削除する'
'description': 'ClickPipeから特定のテーブルを削除する'
'sidebar_label': 'テーブルを削除'
'slug': '/integrations/clickpipes/postgres/removing_tables'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

In some cases, it makes sense to exclude specific tables from a Postgres ClickPipe - for example, if a table isn't needed for your analytics workload, skipping it can reduce storage and replication costs in ClickHouse.

## 特定のテーブルを削除する手順 {#remove-tables-steps}

最初のステップは、パイプからテーブルを削除することです。これは次の手順で行うことができます：

1. [パイプを一時停止](./pause_and_resume.md)します。
2. テーブル設定の編集をクリックします。
3. テーブルを見つけます - これは検索バーで検索することで行うことができます。
4. 選択されているチェックボックスをクリックしてテーブルの選択を解除します。
<br/>

<Image img={remove_table} border size="md"/>

5. 更新をクリックします。
6. 更新が成功すると、**メトリクス**タブでステータスが**実行中**になります。このテーブルはもはやこのClickPipeによってレプリケートされません。
