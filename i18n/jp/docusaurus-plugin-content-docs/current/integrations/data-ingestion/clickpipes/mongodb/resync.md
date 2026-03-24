---
title: 'データベース ClickPipe の再同期'
description: 'データベース ClickPipe の再同期に関するドキュメント'
slug: /integrations/clickpipes/mongodb/resync
sidebar_label: 'ClickPipe の再同期'
doc_type: 'guide'
keywords: ['clickpipes', 'MongoDB', 'CDC（変更データキャプチャ）', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';

### 再同期 では何が行われますか？ \{#what-mongodb-resync-do\}

再同期 では、次の操作が順番に実行されます。

1. 既存の ClickPipe が削除され、新しい「再同期」ClickPipe が開始されます。そのため、再同期 を実行すると、ソース テーブル構造の変更も取り込まれます。
2. 再同期 ClickPipe は、新しい一式の宛先テーブルを作成します (または置き換えます) 。これらのテーブル名は、`_resync` サフィックスが付く点を除いて、元のテーブルと同じです。
3. `_resync` テーブルに対して初回ロードが実行されます。
4. その後、`_resync` テーブルは元のテーブルと入れ替えられます。ソフト削除された行は、入れ替え前に元のテーブルから `_resync` テーブルへ移されます。

元の ClickPipe のすべての設定は、再同期 ClickPipe に引き継がれます。元の ClickPipe の統計値は UI でクリアされます。

### ClickPipe を再同期するユースケース \{#use-cases-mongodb-resync\}

主なシナリオをいくつか紹介します。

1. ソース テーブルに大規模なスキーマ変更を加える必要があり、その結果、既存の ClickPipe が使えなくなって再開が必要になることがあります。その場合は、変更の実施後に 再同期 をクリックするだけで対応できます。
2. 特に ClickHouse では、target テーブルの ORDER BY キーを変更する必要が生じることがあります。再同期 を実行すると、適切なソートキーを持つ新しいテーブルにデータを再投入できます。

### ClickPipe 再同期ガイド \{#guide-mongodb-resync\}

1. Data Sources タブで、再同期する MongoDB ClickPipe をクリックします。
2. **Settings** タブに移動します。
3. **再同期** ボタンをクリックします。

<Image img={resync_button} border size="md" />

4. 確認用のダイアログ ボックスが表示されます。再同期 をもう一度クリックします。
5. **Metrics** タブに移動します。
6. パイプのステータスが **Setup** または **Snapshot** になるまで待ちます。
7. 再同期の初回ロードは、**Tables** タブの **Initial Load Stats** セクションで確認できます。
8. 初回ロードが完了すると、パイプは `_resync` テーブルを元のテーブルとアトミックに入れ替えます。入れ替え中のステータスは **再同期** になります。
9. 入れ替えが完了すると、パイプは **Running** 状態に入り、有効な場合は CDC (変更データキャプチャ)  を実行します。