---
title: "CSVファイルをアップロードする"
---

import uploadcsv1 from '@site/static/images/integrations/migration/uploadcsv1.png';
import uploadcsv2 from '@site/static/images/integrations/migration/uploadcsv2.png';
import uploadcsv3 from '@site/static/images/integrations/migration/uploadcsv3.png';
import uploadcsv4 from '@site/static/images/integrations/migration/uploadcsv4.png';
import uploadcsv5 from '@site/static/images/integrations/migration/uploadcsv5.png';


# CSVファイルをアップロードする

ヘッダー行にカラム名を含むCSVまたはTSVファイルをアップロードすることができ、ClickHouseはデータ型を推測するために行のバッチを前処理し、その後新しいテーブルに行を挿入します。

1. まず、あなたのClickHouse Cloudサービスの**詳細**ページに移動します:

<img src={uploadcsv1} class="image" alt="詳細ページ" />

2. **アクション**のドロップダウンメニューから**データをロード**を選択します:

<img src={uploadcsv2} class="image" alt="データを追加" />

3. **データソース**ページの**ファイルアップロード**ボタンをクリックし、表示されるダイアログウィンドウでアップロードしたいファイルを選択します。**開く**をクリックして進みます（以下の例はmacOS上のものであり、他のオペレーティングシステムでは異なる場合があります）。

<img src={uploadcsv3} class="image" alt="アップロードするファイルを選択" />

4. ClickHouseは推測されたデータ型を表示します。

<img src={uploadcsv4} class="image" alt="推測されたデータ型" />

5. ***新しいテーブル名を入力***してデータを挿入し、**ClickHouseにインポート**ボタンをクリックします。

<img src={uploadcsv5} class="image" alt="アップロードするファイルを選択" />

6. ClickHouseサービスに接続し、テーブルが正常に作成されたことを確認し、データが準備完了です！データを視覚化したい場合は、ClickHouseに簡単に接続できる[BIツール](../data-visualization/index.md)をチェックしてください。
