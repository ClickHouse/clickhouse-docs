---
title: 'データベース ClickPipe の再同期'
description: 'データベース ClickPipe の再同期に関するドキュメント'
slug: /integrations/clickpipes/postgres/resync
sidebar_label: 'ClickPipe の再同期'
doc_type: 'guide'
keywords: ['ClickPipes', 'postgresql', 'CDC', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';

### 再同期 は何を行うのか？ \{#what-postgres-resync-do\}

再同期 では、次の操作がこの順序で実行されます。

1. 既存の ClickPipe が削除され、新しい「再同期」ClickPipe が開始されます。そのため、再同期 を実行すると、ソース テーブル構造の変更が反映されます。
2. 再同期 ClickPipe は、元のテーブルと同じ名前で、`_resync` サフィックスが付いた新しい一式の宛先テーブルを作成します (または置き換えます) 。
3. `_resync` テーブルに対して初回ロードが実行されます。
4. その後、`_resync` テーブルが元のテーブルと入れ替えられます。論理削除された行は、入れ替え前に元のテーブルから `_resync` テーブルに移されます。

元の ClickPipe のすべての設定は、再同期 ClickPipe に引き継がれます。元の ClickPipe の統計値は UI でクリアされます。

### ClickPipe を再同期するユースケース \{#use-cases-postgres-resync\}

主なシナリオをいくつか示します。

1. ソース テーブルに大幅なスキーマ変更を加える必要があり、その結果、既存の ClickPipe が使えなくなって再開が必要になる場合があります。変更を行った後に 再同期 をクリックするだけで再同期できます。
2. 特に ClickHouse では、target テーブルの ORDER BY キーを変更する必要がある場合があります。再同期 を実行すると、正しいソートキーで新しいテーブルにデータを再投入できます。
3. ClickPipe のレプリケーション スロット が無効になった場合: 再同期 によって、新しい ClickPipe とソース データベース上の新しい スロット が作成されます。

:::note
再同期は複数回実行できますが、再同期のたびに parallel threads を使用した初回ロードが行われるため、
ソース データベースへの load を考慮してください。
:::

### ClickPipe の再同期ガイド \{#guide-postgres-resync\}

1. **Data Sources** タブで、再同期する Postgres ClickPipe をクリックします。
2. **Settings** タブに移動します。
3. **再同期** ボタンをクリックします。

<Image img={resync_button} border size="md" />

4. 確認ダイアログが表示されます。もう一度 **再同期** をクリックします。
5. **Metrics** タブに移動します。
6. 約 5 秒後 (またはページを更新すると) 、パイプのステータスは **Setup** または **Snapshot** になります。
7. 再同期の初回ロードは、**Tables** タブの **Initial Load Stats** セクションで確認できます。
8. 初回ロードが完了すると、パイプは `_resync` テーブルを元のテーブルとアトミックに入れ替えます。入れ替え中のステータスは **再同期** になります。
9. 入れ替えが完了すると、パイプは **Running** 状態に入り、有効にすると CDC を実行します。