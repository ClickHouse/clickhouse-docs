---
title: 'データベース ClickPipe の再同期'
description: 'データベース ClickPipe を再同期するためのドキュメント'
slug: /integrations/clickpipes/mysql/resync
sidebar_label: 'ClickPipe の再同期'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'CDC', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';

### 再同期 は何を行いますか？ \{#what-mysql-resync-do\}

再同期 では、次の操作が順に実行されます。

1. 既存の ClickPipe が削除され、新しい「再同期」ClickPipe が開始されます。そのため、再同期 を実行すると、ソース テーブル構造の変更も反映されます。
2. 再同期 ClickPipe は、元のテーブルと同じ名前で、ただし `_resync` サフィックスが付いた新しい一式の宛先テーブルを作成します (または置き換えます) 。
3. `_resync` テーブルに対して初回ロードが実行されます。
4. その後、`_resync` テーブルが元のテーブルと入れ替えられます。論理削除された行は、入れ替え前に元のテーブルから `_resync` テーブルへ転送されます。

元の ClickPipe のすべての設定は、再同期 ClickPipe に引き継がれます。元の ClickPipe のSTATISTICSは UI でクリアされます。

### ClickPipe を再同期するユースケース \{#use-cases-mysql-resync\}

以下に、いくつかのシナリオを示します。

1. ソーステーブルに大規模なスキーマ変更を行う必要があり、その結果、既存の ClickPipe が使えなくなってやり直しが必要になる場合があります。その場合は、変更の実施後に 再同期 をクリックするだけです。
2. 特に ClickHouse では、target テーブルの ORDER BY キーを変更する必要がある場合があります。再同期 を実行すると、正しいソートキーを持つ新しいテーブルにデータを再投入できます。

:::note
再同期は複数回実行できますが、実行時にはソース データベースへの負荷を考慮してください。
:::

### ClickPipe 再同期ガイド \{#guide-mysql-resync\}

1. **Data Sources** タブで、再同期したい MySQL ClickPipe をクリックします。
2. **Settings** タブに移動します。
3. **再同期** ボタンをクリックします。

<Image img={resync_button} border size="md" />

4. 確認ダイアログが表示されるので、もう一度 **再同期** をクリックします。
5. **Metrics** タブに移動します。
6. 5 秒ほどで (ページを更新した場合も同様に) 、パイプラインのステータスが **Setup** または **Snapshot** になります。
7. 再同期の初回ロードは、**Tables** タブの **Initial Load Stats** セクションで確認できます。
8. 初回ロードが完了すると、パイプラインは `_resync` テーブルを元のテーブルとアトミックに入れ替えます。入れ替え中のステータスは **再同期** になります。
9. 入れ替えが完了すると、パイプラインは **Running** 状態になり、有効な場合は CDC (変更データキャプチャ) を実行します。