---
title: "データベースClickPipeの再同期"
description: "データベースClickPipeの再同期に関するドキュメント"
slug: /integrations/clickpipes/mysql/resync
sidebar_label: "ClickPipeの再同期"
doc_type: "guide"
keywords: ["clickpipes", "mysql", "cdc", "data ingestion", "real-time sync"]
---

import resync_button from "@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png"
import Image from "@theme/IdealImage"

### 再同期の機能 {#what-mysql-resync-do}

再同期では、以下の操作が順番に実行されます:

1. 既存のClickPipeが削除され、新しい「再同期」ClickPipeが開始されます。これにより、再同期を実行すると、ソーステーブル構造の変更が反映されます。
2. 再同期ClickPipeは、元のテーブルと同じ名前に `_resync` サフィックスを付けた新しい宛先テーブルセットを作成(または置換)します。
3. `_resync` テーブルに対して初期ロードが実行されます。
4. その後、`_resync` テーブルが元のテーブルと入れ替えられます。論理削除された行は、入れ替え前に元のテーブルから `_resync` テーブルに転送されます。

元のClickPipeのすべての設定は、再同期ClickPipeに保持されます。元のClickPipeの統計情報はUIからクリアされます。

### ClickPipe再同期のユースケース {#use-cases-mysql-resync}

以下にいくつかのシナリオを示します:

1. ソーステーブルに対して、既存のClickPipeが動作しなくなり再起動が必要となるような大規模なスキーマ変更を実行する必要がある場合があります。変更を実行した後、再同期をクリックするだけで対応できます。
2. 特にClickHouseの場合、ターゲットテーブルのORDER BYキーを変更する必要がある場合があります。再同期を実行することで、適切なソートキーを持つ新しいテーブルにデータを再投入できます。

:::note
再同期は複数回実行できますが、再同期時にはソースデータベースへの負荷を考慮してください。
:::

### ClickPipe再同期ガイド {#guide-mysql-resync}

1. データソースタブで、再同期したいMySQL ClickPipeをクリックします。
2. **設定**タブに移動します。
3. **再同期**ボタンをクリックします。

<Image img={resync_button} border size='md' />

4. 確認用のダイアログボックスが表示されます。再度、再同期をクリックします。
5. **メトリクス**タブに移動します。
6. 約5秒後(またはページを更新すると)、パイプのステータスが**Setup**または**Snapshot**になります。
7. 再同期の初期ロードは、**テーブル**タブの**Initial Load Stats**セクションで監視できます。
8. 初期ロードが完了すると、パイプは `_resync` テーブルを元のテーブルとアトミックに入れ替えます。入れ替え中、ステータスは**Resync**になります。
9. 入れ替えが完了すると、パイプは**Running**状態になり、有効化されている場合はCDCを実行します。
