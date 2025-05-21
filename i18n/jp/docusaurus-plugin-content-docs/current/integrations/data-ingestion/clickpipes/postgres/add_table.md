---
title: 'ClickPipeに特定のテーブルを追加する'
description: 'ClickPipeに特定のテーブルを追加するためのステップを説明します。'
sidebar_label: 'テーブルを追加'
slug: /integrations/clickpipes/postgres/add_table
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'

特定のテーブルをパイプに追加することが有用なシナリオがあります。これは、トランザクションまたは分析ワークロードがスケールするにつれて一般的な必要性になります。

## 特定のテーブルを追加する手順 {#add-tables-steps}
これは以下の手順で行うことができます：
1. [一時停止](./pause_and_resume.md)をします。
2. テーブル設定の編集をクリックします。
3. テーブルを見つけます - 検索バーで検索することで行えます。
4. チェックボックスをクリックしてテーブルを選択します。
<br/>
<Image img={add_table} border size="md"/>

5. 更新をクリックします。
6. 更新が成功すると、パイプは `Setup`、`Snapshot`、`Running` の順にステータスを持ちます。テーブルの初期ロードは **Tables** タブで追跡できます。
