---
title: "データベースClickPipeの再同期"
description: "データベースClickPipeの再同期に関するドキュメント"
slug: /integrations/clickpipes/postgres/resync
sidebar_label: "ClickPipeの再同期"
doc_type: "guide"
keywords:
  ["clickpipes", "postgresql", "cdc", "データ取り込み", "リアルタイム同期"]
---

import resync_button from "@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png"
import Image from "@theme/IdealImage"

### 再同期の機能 {#what-postgres-resync-do}

再同期では、以下の操作が順番に実行されます:

1. 既存のClickPipeが削除され、新しい「再同期」ClickPipeが開始されます。これにより、再同期時にソーステーブル構造の変更が反映されます。
2. 再同期ClickPipeは、元のテーブルと同じ名前に`_resync`サフィックスを付けた新しい宛先テーブルセットを作成(または置換)します。
3. `_resync`テーブルに対して初期ロードが実行されます。
4. `_resync`テーブルが元のテーブルと入れ替えられます。スワップの前に、論理削除された行が元のテーブルから`_resync`テーブルに転送されます。

元のClickPipeのすべての設定は再同期ClickPipeに保持されます。元のClickPipeの統計情報はUIでクリアされます。

### ClickPipe再同期のユースケース {#use-cases-postgres-resync}

以下にいくつかのシナリオを示します:

1. ソーステーブルに対して既存のClickPipeを破壊するような大規模なスキーマ変更を実行し、再起動が必要になる場合があります。変更を実行した後、再同期をクリックするだけで対応できます。
2. ClickHouse固有のケースとして、ターゲットテーブルのORDER BYキーを変更する必要がある場合があります。再同期を使用して、正しいソートキーで新しいテーブルにデータを再投入できます。
3. ClickPipeのレプリケーションスロットが無効化された場合:再同期により、新しいClickPipeとソースデータベース上の新しいスロットが作成されます。

:::note
再同期は複数回実行できますが、毎回並列スレッドによる初期ロードが発生するため、
再同期時のソースデータベースへの負荷を考慮してください。
:::

### ClickPipe再同期ガイド {#guide-postgres-resync}

1. データソースタブで、再同期したいPostgres ClickPipeをクリックします。
2. **設定**タブに移動します。
3. **再同期**ボタンをクリックします。

<Image img={resync_button} border size='md' />

4. 確認用のダイアログボックスが表示されます。再度「再同期」をクリックします。
5. **メトリクス**タブに移動します。
6. 約5秒後(またはページを更新すると)、パイプのステータスが**セットアップ**または**スナップショット**になります。
7. 再同期の初期ロードは、**テーブル**タブの**初期ロード統計**セクションで監視できます。
8. 初期ロードが完了すると、パイプは`_resync`テーブルを元のテーブルとアトミックに入れ替えます。スワップ中、ステータスは**再同期中**になります。
9. スワップが完了すると、パイプは**実行中**状態になり、有効化されている場合はCDCを実行します。
