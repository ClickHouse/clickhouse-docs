---
description: "英語の画像キャプション付きの4億枚の画像を含むデータセット"
slug: /getting-started/example-datasets/laion-400m-dataset
sidebar_label: Laion-400M データセット
title: "Laion-400M データセット"
---

[Laion-400M データセット](https://laion.ai/blog/laion-400-open-dataset/) は、英語の画像キャプション付きの4億枚の画像を含んでいます。現在、Laionは[さらに大きなデータセット](https://laion.ai/blog/laion-5b/)を提供していますが、これを扱う際の方法は似ています。

このデータセットには、画像のURL、画像と画像キャプションの両方の埋め込み、画像と画像キャプション間の類似度スコア、さらにメタデータ（画像の幅/高さ、ライセンス、NSFWフラグなど）が含まれています。このデータセットを使用して、ClickHouseにおける[近似最近傍探索](../../engines/table-engines/mergetree-family/annindexes.md)のデモを行います。

## データ準備 {#data-preparation}

埋め込みとメタデータは、原データ中の別々のファイルに保存されています。データ準備ステップでは、データをダウンロードし、ファイルをマージし、CSVに変換してClickHouseにインポートします。これには、以下の`download.sh`スクリプトを使用できます：

```bash
number=${1}
if [[ $number == '' ]]; then
    number=1
fi;
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/img_emb/img_emb_${number}.npy          # 画像埋め込みをダウンロード
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/text_emb/text_emb_${number}.npy        # テキスト埋め込みをダウンロード
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/metadata/metadata_${number}.parquet    # メタデータをダウンロード
python3 process.py $number # ファイルをマージしてCSVに変換
```
スクリプト`process.py`は以下のように定義されています：

```python
import pandas as pd
import numpy as np
import os
import sys

str_i = str(sys.argv[1])
npy_file = "img_emb_" + str_i + '.npy'
metadata_file = "metadata_" + str_i + '.parquet'
text_npy =  "text_emb_" + str_i + '.npy'


# 全ファイルを読み込む
im_emb = np.load(npy_file)
text_emb = np.load(text_npy) 
data = pd.read_parquet(metadata_file)


# ファイルを結合
data = pd.concat([data, pd.DataFrame({"image_embedding" : [*im_emb]}), pd.DataFrame({"text_embedding" : [*text_emb]})], axis=1, copy=False)


# ClickHouseにインポートするカラム
data = data[['url', 'caption', 'NSFW', 'similarity', "image_embedding", "text_embedding"]]


# np.arraysをリストに変換
data['image_embedding'] = data['image_embedding'].apply(lambda x: list(x))
data['text_embedding'] = data['text_embedding'].apply(lambda x: list(x))


# キャプションにはすべての種類のクオートが含まれることがあるため、この小さなハックが必要
data['caption'] = data['caption'].apply(lambda x: x.replace("'", " ").replace('"', " "))


# データをCSVファイルとしてエクスポート
data.to_csv(str_i + '.csv', header=False)


# 原データファイルを削除
os.system(f"rm {npy_file} {metadata_file} {text_npy}")
```

データ準備パイプラインを開始するには、次のコマンドを実行してください：

```bash
seq 0 409 | xargs -P1 -I{} bash -c './download.sh {}'
```

データセットは410ファイルに分割されており、それぞれのファイルには約100万行が含まれています。データの小さなサブセットで作業したい場合は、制限を調整してください。例：`seq 0 9 | ...`。

（上記のPythonスクリプトは非常に遅く（1ファイルあたり約2〜10分）、多くのメモリ（1ファイルあたり41 GB）を消費し、結果として得られるCSVファイルも大きく（各ファイル10 GB）、注意が必要です。十分なRAMがある場合は、より多くの並列性のために`-P1`の数を増やしてください。これでも依然として遅い場合は、より良い取り込み手順を考えてみてください - .npyファイルをparquetに変換し、その後すべての処理をClickHouseで行うことを検討しても良いでしょう。）

## テーブルの作成 {#create-table}

インデックスなしでテーブルを作成するには、次のコマンドを実行します：

```sql
CREATE TABLE laion
(
    `id` Int64,
    `url` String,
    `caption` String,
    `NSFW` String,
    `similarity` Float32,
    `image_embedding` Array(Float32),
    `text_embedding` Array(Float32)
)
ENGINE = MergeTree
ORDER BY id
SETTINGS index_granularity = 8192
```

CSVファイルをClickHouseにインポートするには：

```sql
INSERT INTO laion FROM INFILE '{path_to_csv_files}/*.csv'
```

## ブルートフォースANN検索を実行（ANNインデックスなし） {#run-a-brute-force-ann-search-without-ann-index}

ブルートフォース近似最近傍検索を実行するには：

```sql
SELECT url, caption FROM laion ORDER BY L2Distance(image_embedding, {target:Array(Float32)}) LIMIT 30
```

`target`は512要素の配列で、クライアントパラメータです。そのような配列を取得する便利な方法は、記事の最後に紹介されます。現在は、ランダムな猫の画像の埋め込みを`target`として実行できます。

**結果**

```markdown
┌─url───────────────────────────────────────────────────────────────────────────────────────────────────────────┬─caption────────────────────────────────────────────────────────────────┐
│ https://s3.amazonaws.com/filestore.rescuegroups.org/6685/pictures/animals/13884/13884995/63318230_463x463.jpg │ Adoptable Female Domestic Short Hair                                   │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/8/b/6/239905226.jpg                                        │ Adopt A Pet :: Marzipan - New York, NY                                 │
│ http://d1n3ar4lqtlydb.cloudfront.net/9/2/4/248407625.jpg                                                      │ Adopt A Pet :: Butterscotch - New Castle, DE                           │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/e/e/c/245615237.jpg                                        │ Adopt A Pet :: Tiggy - Chicago, IL                                     │
│ http://pawsofcoronado.org/wp-content/uploads/2012/12/rsz_pumpkin.jpg                                          │ Pumpkin an orange tabby  kitten for adoption                           │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/7/8/3/188700997.jpg                                        │ Adopt A Pet :: Brian the Brad Pitt of cats - Frankfort, IL             │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/8/b/d/191533561.jpg                                        │ Domestic Shorthair Cat for adoption in Mesa, Arizona - Charlie         │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/0/1/2/221698235.jpg                                        │ Domestic Shorthair Cat for adoption in Marietta, Ohio - Daisy (Spayed) │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────┘

8行がセットされました。経過時間: 6.432秒。処理済み 1965万行、43.96 GB (306万行/秒、6.84 GB/秒)
```

## ANNインデックスを使用したANNを実行 {#run-a-ann-with-an-ann-index}

ANNインデックスを使用した新しいテーブルを作成し、既存のテーブルからデータを挿入します：

```sql
CREATE TABLE laion_annoy
(
    `id` Int64,
    `url` String,
    `caption` String,
    `NSFW` String,
    `similarity` Float32,
    `image_embedding` Array(Float32),
    `text_embedding` Array(Float32),
    INDEX annoy_image image_embedding TYPE annoy(),
    INDEX annoy_text text_embedding TYPE annoy()
)
ENGINE = MergeTree
ORDER BY id
SETTINGS index_granularity = 8192;

INSERT INTO laion_annoy SELECT * FROM laion;
```

デフォルトでは、AnnoyインデックスはL2距離をメトリックとして使用します。インデックスの作成と検索のためのさらなる調整機能については、Annoyインデックスの[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)を参照してください。では、同じクエリで再度チェックしましょう：

```sql
SELECT url, caption FROM laion_annoy ORDER BY l2Distance(image_embedding, {target:Array(Float32)}) LIMIT 8
```

**結果**

```response
┌─url──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─caption──────────────────────────────────────────────────────────────┐
│ http://tse1.mm.bing.net/th?id=OIP.R1CUoYp_4hbeFSHBaaB5-gHaFj                                                                                                                         │ bed bugs and pets can cats carry bed bugs pets adviser               │
│ http://pet-uploads.adoptapet.com/1/9/c/1963194.jpg?336w                                                                                                                              │ Domestic Longhair Cat for adoption in Quincy, Massachusetts - Ashley │
│ https://thumbs.dreamstime.com/t/cat-bed-12591021.jpg                                                                                                                                 │ Cat on bed Stock Image                                               │
│ https://us.123rf.com/450wm/penta/penta1105/penta110500004/9658511-portrait-of-british-short-hair-kitten-lieing-at-sofa-on-sun.jpg                                                    │ Portrait of british short hair kitten lieing at sofa on sun.         │
│ https://www.easypetmd.com/sites/default/files/Wirehaired%20Vizsla%20(2).jpg                                                                                                          │ Vizsla (Wirehaired) image 3                                          │
│ https://images.ctfassets.net/yixw23k2v6vo/0000000200009b8800000000/7950f4e1c1db335ef91bb2bc34428de9/dog-cat-flickr-Impatience_1.jpg?w=600&h=400&fm=jpg&fit=thumb&q=65&fl=progressive │ dog and cat image                                                    │
│ https://i1.wallbox.ru/wallpapers/small/201523/eaa582ee76a31fd.jpg                                                                                                                    │ cats, kittens, faces, tonkinese                                      │
│ https://www.baxterboo.com/images/breeds/medium/cairn-terrier.jpg                                                                                                                     │ Cairn Terrier Photo                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────┘

8行がセットされました。経過時間: 0.641秒。処理済み 22060行、49.36 MB (91530行/秒、204.81 MB/秒)
```

速度は大幅に向上しましたが、結果の正確性は低下しました。これは、ANNインデックスが近似検索結果のみを提供するためです。例では、類似の画像埋め込みを検索しましたが、正の画像キャプション埋め込みを検索することも可能です。

## UDFを使用して埋め込みを作成する {#creating-embeddings-with-udfs}

通常、新しい画像や新しい画像キャプションのために埋め込みを作成し、データ内で類似の画像/画像キャプションのペアを検索したいと考えます。[UDF](/sql-reference/functions/udf)を使用して、クライアントを離れることなく`target`ベクトルを作成できます。データと新しい埋め込みを検索するために同じモデルを使用することが重要です。以下のスクリプトは、データセットの基礎となる`ViT-B/32`モデルを利用します。

### テキスト埋め込み {#text-embeddings}

まず、次のPythonスクリプトをClickHouseのデータパスの`user_scripts/`ディレクトリに保存し、実行可能にします（`chmod +x encode_text.py`）。

`encode_text.py`：

```python
#!/usr/bin/python3
import clip
import torch
import numpy as np
import sys

if __name__ == '__main__':
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model, preprocess = clip.load("ViT-B/32", device=device)
    for text in sys.stdin:
        inputs = clip.tokenize(text)
        with torch.no_grad():
            text_features = model.encode_text(inputs)[0].tolist()
            print(text_features)
        sys.stdout.flush()
```

次に、ClickHouseサーバーの設定ファイル内の`<user_defined_executable_functions_config>/path/to/*_function.xml</user_defined_executable_functions_config>`で参照される場所に`encode_text_function.xml`を作成します。

```xml
<functions>
    <function>
        <type>executable</type>
        <name>encode_text</name>
        <return_type>Array(Float32)</return_type>
        <argument>
            <type>String</type>
            <name>text</name>
        </argument>
        <format>TabSeparated</format>
        <command>encode_text.py</command>
        <command_read_timeout>1000000</command_read_timeout>
    </function>
</functions>
```

これで、次のように簡単に使用できます：

```sql
SELECT encode_text('cat');
```
最初の実行はモデルを読み込むため遅くなりますが、繰り返し実行は早くなります。その後、出力を`SET param_target=...`にコピーし、クエリを書くのが簡単になります。

### 画像埋め込み {#image-embeddings}

画像埋め込みも同様に作成できますが、テキストの代わりにローカル画像へのパスをPythonスクリプトに提供します。

`encode_image.py`

```python
#!/usr/bin/python3
import clip
import torch
import numpy as np
from PIL import Image
import sys

if __name__ == '__main__':
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model, preprocess = clip.load("ViT-B/32", device=device)
    for text in sys.stdin:
        image = preprocess(Image.open(text.strip())).unsqueeze(0).to(device)
        with torch.no_grad():
            image_features = model.encode_image(image)[0].tolist()
            print(image_features)
        sys.stdout.flush()
```

`encode_image_function.xml`

```xml
<functions>
    <function>
        <type>executable_pool</type>
        <name>encode_image</name>
        <return_type>Array(Float32)</return_type>
        <argument>
            <type>String</type>
            <name>path</name>
        </argument>
        <format>TabSeparated</format>
        <command>encode_image.py</command>
        <command_read_timeout>1000000</command_read_timeout>
    </function>
</functions>
```

次に、このクエリを実行します：

```sql
SELECT encode_image('/path/to/your/image');
```
