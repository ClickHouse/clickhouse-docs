---
'title': 'データベース ClickPipe の再同期'
'description': 'データベース ClickPipe の再同期に関するドキュメント'
'slug': '/integrations/clickpipes/mysql/resync'
'sidebar_label': 'ClickPipe の再同期'
'doc_type': 'guide'
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';

### Resyncは何をしますか？ {#what-mysql-resync-do}

Resyncは以下の操作を順番に行います。

1. 既存のClickPipeが削除され、新しい「resync」ClickPipeが開始されます。これにより、ソーステーブルの構造に対する変更がresync時に反映されます。
2. resync ClickPipeは、元のテーブルと同じ名前で、`_resync`サフィックスが付いた新しい一式の宛先テーブルを作成（または置き換え）します。
3. `_resync`テーブルに初期ロードが実行されます。
4. その後、`_resync`テーブルが元のテーブルと置き換えられます。ソフト削除された行は、置き換えの前に元のテーブルから`_resync`テーブルに移動されます。

元のClickPipeのすべての設定は、resync ClickPipeに保持されます。元のClickPipeの統計はUIでクリアされます。

### ClickPipeのresyncのユースケース {#use-cases-mysql-resync}

いくつかのシナリオを示します。

1. ソーステーブルに対して大規模なスキーマ変更を行う必要がある場合、既存のClickPipeが機能しなくなる可能性があり、再起動が必要です。変更を行った後、Resyncをクリックするだけです。
2. 特にClickhouseの場合、ターゲットテーブルのORDER BYキーを変更する必要がある場合があります。Resyncを使用して、新しいテーブルに正しいソートキーでデータを再配置できます。

:::note
複数回のresyncが可能ですが、resync時にはソースデータベースへの負荷を考慮してください。
:::

### Resync ClickPipeガイド {#guide-mysql-resync}

1. データソースタブで、resyncしたいMySQL ClickPipeをクリックします。
2. **設定**タブに移動します。
3. **Resync**ボタンをクリックします。

<Image img={resync_button} border size="md"/>

4. 確認のダイアログボックスが表示されます。再度Resyncをクリックします。
5. **メトリクス**タブに移動します。
6. 約5秒後（及びページの再読み込み時に）、パイプのステータスは**Setup**または**Snapshot**になります。
7. resyncの初期ロードは、**テーブル**タブの**初期ロード統計**セクションで監視できます。
8. 初期ロードが完了すると、パイプは原子的に`_resync`テーブルと元のテーブルを置き換えます。置き換え中は、ステータスは**Resync**になります。
9. 置き換えが完了すると、パイプは**Running**状態に入り、CDCが有効な場合は実行されます。
