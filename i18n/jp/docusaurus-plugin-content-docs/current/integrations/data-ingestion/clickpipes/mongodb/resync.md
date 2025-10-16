---
'title': 'データベース ClickPipe の再同期'
'description': 'データベース ClickPipe の再同期に関するドキュメント'
'slug': '/integrations/clickpipes/mongodb/resync'
'sidebar_label': 'ClickPipe の再同期'
'doc_type': 'guide'
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';

### Resyncは何を行いますか？ {#what-mongodb-resync-do}

Resyncは次の操作を順に実行します：

1. 既存のClickPipeが削除され、新しい「resync」ClickPipeが開始されます。これにより、ソーステーブル構造の変更がresync時に反映されます。
2. resync ClickPipeは、元のテーブルと同じ名前を持ち、末尾に`_resync`を付加した新しい一連の宛先テーブルを作成（または置き換え）します。
3. `_resync`テーブルに対する初期ロードが実行されます。
4. `_resync`テーブルは元のテーブルと交換されます。ソフト削除された行は交換の前に元のテーブルから`_resync`テーブルに転送されます。

元のClickPipeのすべての設定はresync ClickPipeに保持されます。元のClickPipeの統計はUIでクリアされます。

### ClickPipeのresyncのユースケース {#use-cases-mongodb-resync}

以下は幾つかのシナリオです：

1. ソーステーブルに対して重要なスキーマ変更を行う必要があり、既存のClickPipeが壊れて再起動が必要な場合があります。変更を行った後、単にResyncをクリックするだけで済みます。
2. 特にClickhouseの場合、ターゲットテーブルのORDER BYキーを変更する必要があったかもしれません。正しいソートキーで新しいテーブルにデータを再投入するためにResyncを行うことができます。

### Resync ClickPipeガイド {#guide-mongodb-resync}

1. データソースタブで、resyncしたいMongoDB ClickPipeをクリックします。
2. **設定**タブに移動します。
3. **Resync**ボタンをクリックします。

<Image img={resync_button} border size="md"/>

4. 確認のためのダイアログボックスが表示されます。再度Resyncをクリックします。
5. **メトリクス**タブに移動します。
6. パイプのステータスが**セットアップ**または**スナップショット**になるまで待ちます。
7. resyncの初期ロードは、**テーブル**タブの**初期ロード統計**セクションで監視できます。
8. 初期ロードが完了すると、パイプは原子性を持って`_resync`テーブルと元のテーブルを交換します。交換中はステータスが**Resync**になります。
9. 交換が完了すると、パイプは**実行中**の状態に入り、CDCが有効な場合はそれを実行します。
