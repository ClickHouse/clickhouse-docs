---
title: 'データベース ClickPipe の再同期'
description: 'データベース ClickPipe の再同期手順について説明します'
slug: /integrations/clickpipes/mysql/resync
sidebar_label: 'ClickPipe の再同期'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'データインジェスト', 'リアルタイム同期']
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';

### Resync は何を行いますか？

Resync では、次の処理が以下の順序で行われます。

1. 既存の ClickPipe が削除され、新しい「resync」ClickPipe が起動されます。これにより、Resync を実行した時点で、ソーステーブル構造の変更が取り込まれます。
2. resync ClickPipe は、元のテーブル名に `_resync` サフィックスを付けたテーブルを新しい宛先テーブルとして作成（または再作成）します。
3. `_resync` テーブルに対して初期ロードが実行されます。
4. その後、`_resync` テーブルと元のテーブルがスワップされます。スワップ前に、ソフトデリートされた行は元のテーブルから `_resync` テーブルへ転送されます。

元の ClickPipe のすべての設定は、resync ClickPipe に引き継がれます。元の ClickPipe の統計情報は UI 上でクリアされます。

### ClickPipe を Resync するユースケース

いくつかのシナリオを示します。

1. 既存の ClickPipe が動作しなくなるような大きなスキーマ変更をソーステーブルに対して行う必要があり、再起動が必要になる場合があります。その場合、変更を行ったあとに Resync をクリックするだけで済みます。
2. 特に ClickHouse の場合、ターゲットテーブルの ORDER BY キーを変更する必要が生じることがあります。Resync を実行することで、新しいテーブルに正しいソートキーでデータを再投入できます。

:::note
Resync を複数回実行することも可能ですが、その際にはソースデータベースへの負荷を考慮してください。
:::

### Resync ClickPipe ガイド

1. **Data Sources** タブで、Resync を実行したい MySQL ClickPipe をクリックします。
2. **Settings** タブに移動します。
3. **Resync** ボタンをクリックします。

<Image img={resync_button} border size="md" />

4. 確認用のダイアログボックスが表示されます。もう一度 Resync をクリックします。
5. **Metrics** タブに移動します。
6. おおよそ 5 秒後（およびページを更新したタイミングで）、パイプのステータスは **Setup** または **Snapshot** になっているはずです。
7. Resync の初期ロードは、**Tables** タブの **Initial Load Stats** セクションで監視できます。
8. 初期ロードが完了すると、パイプは `_resync` テーブルと元のテーブルをアトミックにスワップします。スワップ中はステータスが **Resync** になります。
9. スワップが完了すると、パイプは **Running** 状態に入り、有効化されている場合は CDC（変更データキャプチャ）を実行します。
