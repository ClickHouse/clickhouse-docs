---
title: 'ClickPipe に特定のテーブルを追加する'
description: 'ClickPipe に特定のテーブルを追加するための手順を説明します。'
sidebar_label: 'テーブルを追加'
slug: /integrations/clickpipes/postgres/add_table
show_title: false
keywords: ['clickpipes postgres', 'テーブルを追加', 'テーブル設定', '初期ロード', 'スナップショット']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'

特定のテーブルをパイプに追加すると便利なケースがあります。これは、トランザクション処理や分析のworkloadが拡大するにつれて、よく生じる要件です。

## ClickPipe に特定のテーブルを追加する手順 \{#add-tables-steps\}

次の手順で実行します。

1. パイプを[一時停止](./pause_and_resume.md)します。
2. **Edit Table settings** をクリックします。
3. 対象のテーブルを探します。検索バーで検索できます。
4. チェックボックスをクリックしてテーブルを選択します。

<br />

<Image img={add_table} border size="md" />

5. **Update** をクリックします。
6. 更新が正常に完了すると、パイプのステータスは `Setup`、`Snapshot`、`Running` の順に変わります。テーブルの初期ロードは **Tables** タブで確認できます。

:::info
既存テーブルの CDC は、新しいテーブルのスナップショットが完了すると自動的に再開されます。
:::