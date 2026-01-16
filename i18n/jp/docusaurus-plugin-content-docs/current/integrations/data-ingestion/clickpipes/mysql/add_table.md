---
title: '特定のテーブルを ClickPipe に追加する'
description: '特定のテーブルを ClickPipe に追加するために必要な手順を説明します。'
sidebar_label: 'テーブルを追加'
slug: /integrations/clickpipes/mysql/add_table
show_title: false
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'CDC（変更データキャプチャ）', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'

# 特定のテーブルを ClickPipe に追加する \{#adding-specific-tables-to-a-clickpipe\}

ClickPipe に特定のテーブルを追加できると便利なケースがあります。トランザクション処理や分析ワークロードが拡大するにつれて、そのような要件は一般的になります。

## ClickPipe に特定のテーブルを追加する手順 \\{#add-tables-steps\\}

次の手順で実行します。

1. パイプを[一時停止](./pause_and_resume.md)します。
2. `Edit Table settings` をクリックします。
3. 検索バーでテーブル名を検索して対象のテーブルを見つけます。
4. チェックボックスをクリックしてテーブルを選択します。

<br/>

<Image img={add_table} border size="md"/>

5. `Update` をクリックします。
6. 更新が正常に完了すると、パイプのステータスはこの順番で `Setup`、`Snapshot`、`Running` となります。テーブルの初回読み込みは **Tables** タブで確認できます。

:::info
既存テーブルに対する CDC（変更データキャプチャ）は、新しいテーブルのスナップショットが完了すると自動的に再開されます。
:::