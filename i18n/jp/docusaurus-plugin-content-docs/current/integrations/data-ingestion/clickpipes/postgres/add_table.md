---
title: 'ClickPipe に特定のテーブルを追加する'
description: '特定のテーブルを ClickPipe に追加するために必要な手順を説明します。'
sidebar_label: 'テーブルの追加'
slug: /integrations/clickpipes/postgres/add_table
show_title: false
keywords: ['clickpipes postgres', 'テーブルを追加', 'テーブル設定', '初期ロード', 'スナップショット']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'

# ClickPipe に特定のテーブルを追加する {#adding-specific-tables-to-a-clickpipe}

特定のテーブルをパイプに追加すると便利な場合があります。トランザクションワークロードや分析ワークロードがスケールするにつれて、これは一般的な要件となります。

## 特定のテーブルを ClickPipe に追加する手順 {#add-tables-steps}

以下の手順で実行します。
1. パイプを[一時停止](./pause_and_resume.md)します。
2. 「Edit Table settings」をクリックします。
3. 追加したいテーブルを検索バーで検索して見つけます。
4. チェックボックスをクリックしてテーブルを選択します。
<br/>
<Image img={add_table} border size="md"/>

5. 「Update」をクリックします。
6. 正常に更新されると、パイプのステータスが `Setup`、`Snapshot`、`Running` の順に遷移します。テーブルの初期ロードは **Tables** タブで確認できます。

:::info
既存テーブルに対する CDC（変更データキャプチャ）は、新しいテーブルのスナップショット完了後に自動的に再開されます。
:::
