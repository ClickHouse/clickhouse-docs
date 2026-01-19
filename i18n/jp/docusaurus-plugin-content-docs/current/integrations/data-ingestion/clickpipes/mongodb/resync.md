---
title: 'データベース ClickPipe の再同期'
description: 'データベース ClickPipe を再同期するためのドキュメント'
slug: /integrations/clickpipes/mongodb/resync
sidebar_label: 'ClickPipe の再同期'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'データ インジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';

### Resync は何を行いますか？ \{#what-mongodb-resync-do\}

Resync では、次の処理がこの順序で実行されます。

1. 既存の ClickPipe が削除され、新しい「resync」ClickPipe が起動されます。これにより、ソーステーブルのスキーマ変更は、Resync を実行したタイミングで取り込まれます。
2. Resync ClickPipe は、元のテーブルと同じ名前に `_resync` サフィックスを付与した新しい宛先テーブル群を作成（または置き換え）します。
3. `_resync` テーブルに対して初回ロードが実行されます。
4. その後、`_resync` テーブルは元のテーブルと入れ替えられます。入れ替え前に、元のテーブルから `_resync` テーブルにソフトデリートされた行が転送されます。

元の ClickPipe のすべての設定は Resync ClickPipe に引き継がれます。元の ClickPipe の統計情報は UI 上でクリアされます。

### ClickPipe を Resync するユースケース \{#use-cases-mongodb-resync\}

次のようなシナリオが考えられます。

1. 既存の ClickPipe が動作しなくなるような大きなスキーマ変更をソーステーブルに対して行う必要があり、再起動が必要になる場合があります。この場合は、変更を行った後に Resync をクリックするだけでかまいません。
2. 特に ClickHouse の場合、ターゲットテーブルの ORDER BY キーを変更する必要があるかもしれません。そのような場合は、Resync によって新しいテーブルに正しいソートキーでデータを再投入できます。

### Resync ClickPipe ガイド \{#guide-mongodb-resync\}

1. **Data Sources** タブで、Resync を実行したい MongoDB ClickPipe をクリックします。
2. **Settings** タブに移動します。
3. **Resync** ボタンをクリックします。

<Image img={resync_button} border size="md" />

4. 確認用のダイアログボックスが表示されます。もう一度 Resync をクリックします。
5. **Metrics** タブに移動します。
6. パイプのステータスが **Setup** または **Snapshot** になるまで待ちます。
7. Resync の初回ロードは、**Tables** タブ内の **Initial Load Stats** セクションで監視できます。
8. 初回ロードが完了すると、パイプは `_resync` テーブルを元のテーブルとアトミックに入れ替えます。入れ替え中のステータスは **Resync** になります。
9. 入れ替えが完了すると、パイプは **Running** 状態になり、有効化されていれば CDC（変更データキャプチャ）を実行します。