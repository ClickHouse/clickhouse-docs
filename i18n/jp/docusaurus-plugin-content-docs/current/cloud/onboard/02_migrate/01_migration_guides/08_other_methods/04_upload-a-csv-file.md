---
title: 'ファイルのアップロード'
slug: /cloud/migrate/upload-a-csv-file
description: 'Cloud へファイルをアップロードする方法'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import csv_01 from '@site/static/images/cloud/migrate/csv_01.png';
import csv_02 from '@site/static/images/cloud/migrate/csv_02.png';
import csv_03 from '@site/static/images/cloud/migrate/csv_03.png';
import csv_04 from '@site/static/images/cloud/migrate/csv_04.png';
import csv_05 from '@site/static/images/cloud/migrate/csv_05.png';
import csv_06 from '@site/static/images/cloud/migrate/csv_06.png';
import csv_07 from '@site/static/images/cloud/migrate/csv_07.png';
import csv_08 from '@site/static/images/cloud/migrate/csv_08.png';
import csv_09 from '@site/static/images/cloud/migrate/csv_09.png';
import csv_10 from '@site/static/images/cloud/migrate/csv_10.png';


# Cloud にファイルをアップロードする {#upload-files-to-cloud}

ClickHouse Cloud はファイルのインポートを簡単に行う方法を提供しており、
次の形式をサポートしています:

| Format                          |
|---------------------------------|
| `CSV`                           |
| `CSVWithNamesAndTypes`          |
| `CSVWithNames`                  |
| `JSONEachRow`                   |
| `TabSeparated`                  |
| `TabSeparatedWithNames`         |
| `TabSeparatedWithNamesAndTypes` |

<VerticalStepper headerLevel="h2">

## ファイルをアップロードする {#upload-file}

Cloud のホーム画面から、以下のように対象のサービスを選択します:

<Image img={csv_01} alt="upload_file_02" />

サービスがアイドル状態の場合は、起動する必要があります。

左側のタブから、以下のように `Data sources` を選択します:

<Image img={csv_02} alt="upload_file_03" />

次に、データソースページ右側の `Upload a file` を選択します:

<Image img={csv_03} alt="upload_file_04" />

ファイルダイアログがポップアップし、Cloud サービス上のテーブルに
データを挿入するために使用するファイルを選択できます。

<Image img={csv_04} alt="upload_file_05" />

## テーブルを構成する {#configure-table}

ファイルのアップロードが完了すると、データを挿入したいテーブルの設定が
できるようになります。先頭 3 行を使ったテーブルのプレビューが表示されます。

<Image img={csv_08} alt="upload_file_08" />

ここで、データの格納先テーブルを選択できます。選択肢は次のとおりです:

- 新しいテーブル
- 既存のテーブル

<br/>
どのデータベースにデータを取り込むか、さらに新しいテーブルの場合は
作成されるテーブル名を指定できます。また、ソートキーも選択できます:

<Image img={csv_05} alt="upload_file_05" />

ファイルから読み取られたカラムは `Source field` として表示され、各フィールドごとに
次の項目を変更できます:
- 推論された型
- デフォルト値
- カラムを [Nullable](/sql-reference/data-types/nullable) にするかどうか

<Image img={csv_06} alt="upload_file_06" />

:::note フィールドの除外
インポートに含めたくないフィールドは削除することもできます。
:::

使用したいテーブルエンジンの種類を指定できます:

- `MergeTree`
- `ReplacingMergeTree`
- `SummingMergeTree`
- `Null`
<br/>
パーティションキー式とプライマリキー式を指定できます。

<Image img={csv_07} alt="upload_file_07" />

`Import to ClickHouse`（上記）をクリックしてデータをインポートします。データインポートは、
`Status` カラムに `queued` ステータスバッジが表示されるように、キューに登録されます。
また、`Open as query`（上記）をクリックして、SQL コンソールで INSERT クエリを
開くこともできます。このクエリは、`URL` テーブル関数を使用して、アップロードされた
ファイルを S3 バケットから挿入します。

<Image img={csv_09} alt="upload_file_09" />

ジョブが失敗した場合は、`Data upload history` タブの `Status` カラムに `failed`
ステータスバッジが表示されます。`View Details` をクリックすると、アップロードが失敗した
理由の詳細を確認できます。失敗した INSERT のエラーメッセージに基づいて、テーブル設定を
変更するか、データをクレンジングする必要がある場合があります。

<Image img={csv_10} alt="upload_file_11" />

</VerticalStepper>