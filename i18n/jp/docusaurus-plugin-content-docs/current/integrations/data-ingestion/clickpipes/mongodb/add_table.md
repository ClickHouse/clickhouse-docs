---
title: '特定のテーブルを ClickPipe に追加する'
description: '特定のテーブルを ClickPipe に追加するための手順を説明します。'
sidebar_label: 'テーブルを追加'
slug: /integrations/clickpipes/mongodb/add_table
show_title: false
doc_type: 'ガイド'
keywords: ['clickpipes', 'mongodb', 'cdc', 'データのインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'

# 特定のテーブルを ClickPipe に追加する \{#adding-specific-tables-to-a-clickpipe\}

ClickPipe に特定のテーブルを追加できると便利な場面があります。トランザクション処理や分析ワークロードがスケールするにつれて、こうしたニーズは一般的な要件となっていきます。

## 特定のテーブルを ClickPipe に追加する手順 \{#add-tables-steps\}

次の手順で行います。

1. パイプを[一時停止](./pause_and_resume.md)します。
2. **Edit Table settings** をクリックします。
3. 対象のテーブルを検索バーで検索して見つけます。
4. チェックボックスをクリックしてテーブルを選択します。

<br/>

<Image img={add_table} border size="md"/>

5. **update** をクリックします。
6. 正常に更新されると、パイプのステータスは順に `Setup`、`Snapshot`、`Running` となります。テーブルの初期ロードの進行状況は **Tables** タブで確認できます。

:::info
既存テーブルの CDC は、新しいテーブルのスナップショット完了後に自動的に再開されます。
:::