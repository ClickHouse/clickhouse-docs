---
title: '特定のテーブルを ClickPipe に追加する'
description: '特定のテーブルを ClickPipe に追加するための手順を説明します。'
sidebar_label: 'テーブルを追加'
slug: /integrations/clickpipes/mongodb/add_table
show_title: false
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'


# 特定のテーブルを ClickPipe に追加する

状況によっては、特定のテーブルをパイプに追加できると便利です。トランザクション処理や分析ワークロードの規模が大きくなるにつれて、これは一般的なニーズになってきます。



## ClickPipeに特定のテーブルを追加する手順 {#add-tables-steps}

以下の手順で実行できます:

1. パイプを[一時停止](./pause_and_resume.md)します。
2. 「Edit Table settings」をクリックします。
3. 対象のテーブルを検索します - 検索バーで検索して見つけることができます。
4. チェックボックスをクリックしてテーブルを選択します。

   <br />
   <Image img={add_table} border size='md' />

5. 「update」をクリックします。
6. 更新が成功すると、パイプは`Setup`、`Snapshot`、`Running`の順にステータスが遷移します。テーブルの初期ロードは**Tables**タブで追跡できます。

:::info
既存のテーブルのCDCは、新しいテーブルのスナップショットが完了した後に自動的に再開されます。
:::
