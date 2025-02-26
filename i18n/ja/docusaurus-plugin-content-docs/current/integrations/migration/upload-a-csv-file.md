---
title: "CSVファイルのアップロード"
---

# CSVファイルのアップロード

ヘッダー行にカラム名を含むCSVまたはTSVファイルをアップロードすることができ、ClickHouseは行のバッチを前処理してカラムのデータ型を推測し、その後新しいテーブルに行を挿入します。

1. まず、**Details**ページに移動します：

    ![詳細ページ](./images/uploadcsv1.png)

2. **Actions**ドロップダウンメニューから**Load data**を選択します：

    ![データの追加](./images/uploadcsv2.png)

3. **Datasources**ページの**File upload**ボタンをクリックし、表示されるダイアログウィンドウでアップロードしたいファイルを選択します。**Open**をクリックして進みます（以下の例はmacOS上のもので、他のオペレーティングシステムでは異なる場合があります）。

    ![アップロードするファイルを選択](./images/uploadcsv3.png)

4. ClickHouseは推測したデータ型を表示します。

    ![推測されたデータ型](./images/uploadcsv4.png)

5. ***新しいテーブル名を入力***し、データを挿入するために、**Import to ClickHouse**ボタンをクリックします。

    ![アップロードするファイルを選択](./images/uploadcsv5.png)

6. ClickHouseサービスに接続し、テーブルが正常に作成されたことを確認し、データの準備が整いました！データを可視化したい場合は、ClickHouseに簡単に接続できる[BIツール](../data-visualization/index.md)をチェックしてみてください。
