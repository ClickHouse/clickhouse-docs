---
title: 'ClickPipe に特定のテーブルを追加する'
description: 'ClickPipe に特定のテーブルを追加するための手順を説明します。'
sidebar_label: 'テーブルを追加'
slug: /integrations/clickpipes/mongodb/add_table
show_title: false
doc_type: 'guide'
keywords: ['ClickPipes', 'MongoDB', 'CDC', 'インジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'

特定のテーブルをパイプに追加すると便利な場合があります。これは、トランザクション処理や分析のワークロードが拡大するにつれて、一般的に必要になる要件です。

## ClickPipe に特定のテーブルを追加する手順 \{#add-tables-steps\}

次の手順で実行できます。

1. [パイプを一時停止](./pause_and_resume.md)します。
2. [Edit Table settings] をクリックします。
3. 追加するテーブルを探します。検索バーで検索できます。
4. チェックボックスをクリックしてテーブルを選択します。

<br />

<Image img={add_table} border size="md" />

5. [update] をクリックします。
6. 更新が成功すると、パイプのステータスはこの順に `Setup`、`Snapshot`、`Running` になります。テーブルの初期ロードは **Tables** タブで確認できます。

:::info
既存のテーブルの CDC は、新しいテーブルの snapshot が完了すると自動的に自動再開されます。
:::