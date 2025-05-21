---
title: 'ClickPipeから特定のテーブルを削除する'
description: 'ClickPipeから特定のテーブルを削除する'
sidebar_label: 'テーブルを削除する'
slug: /integrations/clickpipes/postgres/removing_tables
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

場合によっては、Postgres ClickPipeから特定のテーブルを除外することが理にかなっています。たとえば、分析ワークロードに必要ないテーブルは、スキップすることでClickHouseにおけるストレージおよびレプリケーションコストを削減できます。

## 特定のテーブルを削除する手順 {#remove-tables-steps}

最初のステップは、パイプからテーブルを削除することです。これは以下の手順で行うことができます。

1. [一時停止](./pause_and_resume.md)をクリックして、パイプを一時停止します。
2. テーブル設定の編集をクリックします。
3. テーブルを見つけます - 検索バーで検索することで行えます。
4. 選択されたチェックボックスをクリックして、そのテーブルの選択を解除します。
<br/>

<Image img={remove_table} border size="md"/>

5. 更新をクリックします。
6. 更新が成功すると、**メトリクス**タブにステータスが**実行中**と表示されます。このテーブルはもはやこのClickPipeによってレプリケートされることはありません。
