---
title: '特定のテーブルを ClickPipe に追加する'
description: '特定のテーブルを ClickPipe に追加するための手順を説明します。'
sidebar_label: 'テーブルの追加'
slug: /integrations/clickpipes/postgres/add_table
show_title: false
keywords: ['clickpipes postgres', 'テーブルを追加', 'テーブル設定', '初期ロード', 'スナップショット']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'


# 特定のテーブルを ClickPipe に追加する

特定のテーブルをパイプに追加できると便利なケースがあります。トランザクション処理や分析ワークロードがスケールするにつれて、これは一般的な要件となります。



## ClickPipeに特定のテーブルを追加する手順 {#add-tables-steps}

以下の手順で実行できます:

1. パイプを[一時停止](./pause_and_resume.md)します。
2. 「Edit Table settings」をクリックします。
3. テーブルを検索します - 検索バーで検索できます。
4. チェックボックスをクリックしてテーブルを選択します。

   <br />
   <Image img={add_table} border size='md' />

5. 「update」をクリックします。
6. 更新が正常に完了すると、パイプのステータスは順に`Setup`、`Snapshot`、`Running`となります。テーブルの初期ロードは**Tables**タブで追跡できます。

:::info
既存テーブルのCDCは、新しいテーブルのスナップショットが完了した後に自動的に再開されます。
:::
