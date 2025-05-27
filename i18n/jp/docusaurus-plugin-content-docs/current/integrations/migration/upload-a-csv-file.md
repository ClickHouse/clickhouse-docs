---
'title': 'CSVファイルをアップロード'
'slug': '/integrations/migration/upload-a-csv-file'
'description': 'CSVファイルのアップロードについて学ぶ'
---

import Image from '@theme/IdealImage';
import uploadcsv1 from '@site/static/images/integrations/migration/uploadcsv1.png';
import uploadcsv2 from '@site/static/images/integrations/migration/uploadcsv2.png';
import uploadcsv3 from '@site/static/images/integrations/migration/uploadcsv3.png';
import uploadcsv4 from '@site/static/images/integrations/migration/uploadcsv4.png';
import uploadcsv5 from '@site/static/images/integrations/migration/uploadcsv5.png';


# CSVファイルのアップロード

ヘッダー行にカラム名を含むCSVまたはTSVファイルをアップロードすることができます。ClickHouseは行のバッチを前処理してカラムのデータ型を推測し、その後、行を新しいテーブルに挿入します。

1. まず、**詳細**ページに移動します。あなたのClickHouse Cloudサービスの:

<Image img={uploadcsv1} size='md' alt='詳細ページ' />

2. **アクション**ドロップダウンメニューから**データの読み込み**を選択します:

<Image img={uploadcsv2} size='sm' alt='データを追加' />

3. **データソース**ページの**ファイルアップロード**ボタンをクリックし、表示されるダイアログウィンドウでアップロードしたいファイルを選択します。**開く**をクリックして続行します（以下の例はmacOS上のものです。他のオペレーティングシステムでは異なる場合があります）。

<Image img={uploadcsv3} size='md' alt='アップロードするファイルを選択' />

4. ClickHouseは推測したデータ型を表示します。

<Image img={uploadcsv4} size='md' alt='推測されたデータ型' />

5. ***新しいテーブル名***を入力してデータを挿入し、次に**ClickHouseにインポート**ボタンをクリックします。

<Image img={uploadcsv5} size='md' alt='アップロードするファイルを選択' />

6. ClickHouseサービスに接続し、テーブルが正常に作成されたことを確認し、データの準備が整いました！データを視覚化したい場合は、ClickHouseに簡単に接続できる[BIツール](../data-visualization/index.md)をチェックしてみてください。
