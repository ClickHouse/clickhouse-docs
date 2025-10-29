---
'title': '特定のテーブルを ClickPipe に追加する'
'description': '特定のテーブルを ClickPipe に追加するために必要なステップを説明します。'
'sidebar_label': 'テーブルを追加'
'slug': '/integrations/clickpipes/postgres/add_table'
'show_title': false
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'


# ClickPipeに特定のテーブルを追加する

特定のテーブルをパイプに追加することが有用なシナリオがあります。これは、トランザクションや分析の作業負荷がスケールするにつれて一般的な必要性となります。

## ClickPipeに特定のテーブルを追加する手順 {#add-tables-steps}

特定のテーブルを追加する手順は以下の通りです：
1. [一時停止](./pause_and_resume.md)します。
2. テーブル設定を編集するをクリックします。
3. テーブルを見つけます - 検索バーで検索することができます。
4. チェックボックスをクリックしてテーブルを選択します。
<br/>
<Image img={add_table} border size="md"/>

5. 更新をクリックします。
6. 更新が成功すると、パイプは `Setup`、`Snapshot`、`Running` の順にステータスを持ちます。テーブルの初期ロードは **Tables** タブで追跡できます。

:::info
既存のテーブルのCDCは、新しいテーブルのスナップショットが完了すると自動的に再開されます。
:::
