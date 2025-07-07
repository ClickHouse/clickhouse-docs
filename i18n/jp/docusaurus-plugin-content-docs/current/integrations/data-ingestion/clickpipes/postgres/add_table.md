---
'title': 'ClickPipe に特定のテーブルを追加する'
'description': '特定のテーブルを ClickPipe に追加する手順を説明します。'
'sidebar_label': 'テーブルの追加'
'slug': '/integrations/clickpipes/postgres/add_table'
'show_title': false
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'


# ClickPipeに特定のテーブルを追加する

パイプに特定のテーブルを追加することが有用なシナリオがあります。これは、トランザクションまたは分析のワークロードがスケールするにつれて、一般的な必要性となります。

## ClickPipeに特定のテーブルを追加する手順 {#add-tables-steps}

以下の手順で実行できます：
1. [一時停止](./pause_and_resume.md)します。
2. テーブル設定を編集をクリックします。
3. テーブルを見つけます - 検索バーで検索することで行うことができます。
4. チェックボックスをクリックしてテーブルを選択します。
<br/>
<Image img={add_table} border size="md"/>

5. 更新をクリックします。
6. 更新が成功すると、パイプは `Setup`、`Snapshot`、`Running` のステータスをその順番で持ちます。テーブルの初期ロードは **Tables** タブで追跡できます。
