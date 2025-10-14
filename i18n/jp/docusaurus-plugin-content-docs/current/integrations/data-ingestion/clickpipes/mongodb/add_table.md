---
'title': 'ClickPipe に特定のテーブルを追加する'
'description': 'ClickPipe に特定のテーブルを追加するために必要なステップについて説明します。'
'sidebar_label': 'テーブル追加'
'slug': '/integrations/clickpipes/mongodb/add_table'
'show_title': false
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'


# ClickPipeに特定のテーブルを追加する

特定のテーブルをパイプに追加することが有用なシナリオがあります。これは、トランザクション処理または分析ワークロードがスケールするにつれて一般的な必要性となります。

## ClickPipeに特定のテーブルを追加する手順 {#add-tables-steps}

以下の手順で行うことができます：
1. [パイプを一時停止](./pause_and_resume.md)します。
2. テーブル設定を編集するをクリックします。
3. テーブルを見つけます - 検索バーで検索することで行えます。
4. チェックボックスをクリックしてテーブルを選択します。
<br/>
<Image img={add_table} border size="md"/>

5. 更新をクリックします。
6. 更新が成功すると、パイプは `Setup`、`Snapshot`、`Running` の順でステータスを表示します。テーブルの初期ロードは **Tables** タブで追跡できます。

:::info
既存のテーブルに対するCDCは、新しいテーブルのスナップショットが完了した後に自動的に再開されます。
:::
