---
'title': 'ClickPipeから特定のテーブルを削除する'
'description': 'ClickPipeから特定のテーブルを削除する'
'sidebar_label': 'テーブルを削除'
'slug': '/integrations/clickpipes/mongodb/removing_tables'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

場合によっては、特定のテーブルをMongoDB ClickPipeから除外することが理にかなうことがあります。たとえば、テーブルが分析ワークロードに必要ない場合、そのテーブルをスキップすることでClickHouseでのストレージやレプリケーションコストを削減できます。

## 特定のテーブルを削除する手順 {#remove-tables-steps}

最初のステップは、パイプからテーブルを削除することです。これを行うための手順は次のとおりです。

1. [パイプを一時停止](./pause_and_resume.md)します。
2. テーブル設定の編集をクリックします。
3. テーブルを見つけます - 検索バーで検索することで行えます。
4. 選択されたチェックボックスをクリックしてテーブルの選択を解除します。
<br/>

<Image img={remove_table} border size="md"/>

5. 更新をクリックします。
6. 更新が成功すると、**メトリクス**タブに状態が**実行中**と表示されます。このテーブルはもはやこのClickPipeでレプリケートされません。
