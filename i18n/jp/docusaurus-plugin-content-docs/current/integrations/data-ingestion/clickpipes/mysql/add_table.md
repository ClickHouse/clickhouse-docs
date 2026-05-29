---
title: 'ClickPipe に特定のテーブルを追加する'
description: 'ClickPipe に特定のテーブルを追加する手順を説明します。'
sidebar_label: 'テーブルを追加'
slug: /integrations/clickpipes/mysql/add_table
show_title: false
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'

特定のテーブルをパイプに追加すると役立つ場合があります。これは、トランザクション処理や分析のワークロードが拡大するにつれて、一般的に必要になります。

## 特定のテーブルを ClickPipe に追加する手順 \{#add-tables-steps\}

次の手順で実行できます。

1. [パイプを一時停止](./pause_and_resume.md)します。
2. **Edit Table settings** をクリックします。
3. 対象のテーブルを見つけます。検索バーで検索できます。
4. チェックボックスをクリックしてテーブルを選択します。

<br />

<Image img={add_table} border size="md" />

5. **update** をクリックします。
6. 更新が正常に完了すると、パイプのステータスは順に `Setup`、`Snapshot`、`Running` になります。テーブルの初期ロードは **Tables** タブで追跡できます。

:::info
既存のテーブルの CDC は、新しいテーブルのスナップショットが完了すると自動的に再開されます。
:::