---
'title': 'データベース ClickPipe の再同期'
'description': 'データベース ClickPipe の再同期に関するドキュメント'
'slug': '/integrations/clickpipes/postgres/resync'
'sidebar_label': '再同期 ClickPipe'
'doc_type': 'guide'
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';

### What does Resync do? {#what-postgres-resync-do}

Resyncには以下の操作が順に含まれます：
1. 既存のClickPipeが削除され、新しい「resync」ClickPipeが開始されます。これにより、ソーステーブルの構造への変更がresyncの際に反映されます。
2. resync ClickPipeは、元のテーブルと同じ名前で、'_resync'サフィックスが付いた新しい宛先テーブルのセットを作成（または置き換え）します。
3. '_resync'テーブルに対して初期ロードが行われます。
4. その後、'_resync'テーブルは元のテーブルと入れ替えられます。ソフト削除された行は、入れ替えの前に元のテーブルから'_resync'テーブルに転送されます。

元のClickPipeのすべての設定は、resync ClickPipeに保持されます。元のClickPipeの統計はUIでクリアされます。

### Use cases for resyncing a ClickPipe {#use-cases-postgres-resync}

以下はいくつかのシナリオです：

1. ソーステーブルに対して大規模なスキーマ変更を行う必要があり、既存のClickPipeが壊れる場合があります。その場合、変更を行った後に単にResyncをクリックすればよいです。
2. 特にClickhouseの場合、ターゲットテーブルのORDER BYキーを変更する必要があったかもしれません。新しいテーブルに正しいソートキーでデータを再入力するためにResyncを行うことができます。
3. ClickPipeのレプリケーションスロットが無効になった場合：Resyncは、新しいClickPipeとソースデータベース上の新しいスロットを作成します。

:::note
複数回resyncを行うことができますが、resyncの際にはソースデータベースへの負荷を考慮してください。初期ロードには各回で並行スレッドが関与します。
:::

### Resync ClickPipe Guide {#guide-postgres-resync}

1. データソースタブで、resyncしたいPostgres ClickPipeをクリックします。
2. **Settings**タブに移動します。
3. **Resync**ボタンをクリックします。

<Image img={resync_button} border size="md"/>

4. 確認のためのダイアログボックスが表示されるはずです。再度Resyncをクリックします。
5. **Metrics**タブに移動します。
6. 約5秒後（およびページをリフレッシュすると）、パイプのステータスが**Setup**または**Snapshot**になっているはずです。
7. resyncの初期ロードは**Tables**タブの**Initial Load Stats**セクションで監視できます。
8. 初期ロードが完了すると、パイプは原子的に'_resync'テーブルと元のテーブルを入れ替えます。入れ替えの間、ステータスは**Resync**になります。
9. 入れ替えが完了すると、パイプは**Running**状態に入り、CDCが有効になっている場合は実行します。
