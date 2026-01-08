---
title: 'データベース ClickPipe の再同期'
description: 'データベース ClickPipe を再同期するための手順書'
slug: /integrations/clickpipes/postgres/resync
sidebar_label: 'ClickPipe の再同期'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';

### Resync は何を行いますか？ {#what-postgres-resync-do}

Resync では、次の処理がこの順番で行われます。

1. 既存の ClickPipe が削除され、新しい「Resync」ClickPipe が起動されます。これにより、ソーステーブル構造への変更は Resync を実行したタイミングで取り込まれます。
2. Resync ClickPipe は、元のテーブルと同じ名前に `_resync` サフィックスを付けた、新しい宛先テーブル群を作成（または置き換え）します。
3. `_resync` テーブルに対して初期ロードが実行されます。
4. その後、`_resync` テーブルと元のテーブルが入れ替えられます。この入れ替えの前に、ソフトデリートされた行は元のテーブルから `_resync` テーブルに転送されます。

元の ClickPipe のすべての設定は、Resync ClickPipe に引き継がれます。元の ClickPipe の統計情報は、UI 上ではリセットされます。

### ClickPipe を Resync するユースケース {#use-cases-postgres-resync}

いくつかのシナリオを挙げます。

1. 既存の ClickPipe が壊れてしまうような大きなスキーマ変更をソーステーブルに対して行う必要があり、再起動が必要になる場合があります。その場合は、変更を行ったあとに Resync をクリックするだけで済みます。
2. 特に ClickHouse の場合、ターゲットテーブルの ORDER BY キーを変更する必要があるかもしれません。Resync を実行することで、新しいテーブルに正しいソートキーでデータを再投入できます。
3. ClickPipe のレプリケーションスロットが無効になった場合、Resync を実行すると、新しい ClickPipe とソースデータベース上の新しいスロットが作成されます。

:::note
Resync は複数回実行できますが、そのたびに並列スレッドによる初期ロードが発生するため、
Resync 実行時にはソースデータベースへの負荷を考慮してください。
:::

### Resync ClickPipe ガイド {#guide-postgres-resync}

1. **Data Sources** タブで、Resync を実行したい Postgres ClickPipe をクリックします。
2. **Settings** タブに移動します。
3. **Resync** ボタンをクリックします。

<Image img={resync_button} border size="md" />

4. 確認用のダイアログボックスが表示されます。もう一度 Resync をクリックします。
5. **Metrics** タブに移動します。
6. 約 5 秒後（およびページをリフレッシュしたとき）、ClickPipe のステータスは **Setup** または **Snapshot** になっているはずです。
7. Resync の初期ロードは、**Tables** タブの **Initial Load Stats** セクションで監視できます。
8. 初期ロードが完了すると、ClickPipe は `_resync` テーブルと元のテーブルをアトミックに入れ替えます。入れ替え中、ステータスは **Resync** になります。
9. 入れ替えが完了すると、ClickPipe は **Running** 状態に入り、有効化されていれば CDC を実行します。