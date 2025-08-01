---
description: 'Dataset containing 400 million images with English image captions'
sidebar_label: 'Laion-400M dataset'
slug: '/getting-started/example-datasets/laion-400m-dataset'
title: 'Laion-400M dataset'
---



[Laion-400Mデータセット](https://laion.ai/blog/laion-400-open-dataset/)は、英語の画像キャプションを持つ4億の画像を含んでいます。現在、Laionは[さらに大きなデータセット](https://laion.ai/blog/laion-5b/)を提供していますが、取り扱いは似ています。

このデータセットには、画像のURL、画像および画像キャプションの埋め込み、画像と画像キャプションの間の類似度スコア、さらに画像の幅/高さ、ライセンス、NSFWフラグなどのメタデータが含まれています。このデータセットを使用して、ClickHouseでの[近似最近傍検索](../../engines/table-engines/mergetree-family/annindexes.md)を示すことができます。

## データ準備 {#data-preparation}

埋め込みとメタデータは、生のデータの別々のファイルに保存されています。データ準備ステップでは、データをダウンロードし、ファイルをマージし、CSVに変換してClickHouseにインポートします。以下の`download.sh`スクリプトを使用できます：

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


# 全ファイルをロード
im_emb = np.load(npy_file)
text_emb = np.load(text_npy) 
data = pd.read_parquet(metadata_file)


# ファイルを組み合わせる
data = pd.concat([data, pd.DataFrame({"image_embedding" : [*im_emb]}), pd.DataFrame({"text_embedding" : [*text_emb]})], axis=1, copy=False)


# ClickHouseにインポートするカラム
data = data[['url', 'caption', 'NSFW', 'similarity', "image_embedding", "text_embedding"]]


# np.arrayをリストに変換
data['image_embedding'] = data['image_embedding'].apply(lambda x: list(x))
data['text_embedding'] = data['text_embedding'].apply(lambda x: list(x))


# キャプションに含まれる様々な引用符に対してこの小さなハックが必要
data['caption'] = data['caption'].apply(lambda x: x.replace("'", " ").replace('"', " "))


# データをCSVファイルとしてエクスポート
data.to_csv(str_i + '.csv', header=False)


# 生データファイルを削除
os.system(f"rm {npy_file} {metadata_file} {text_npy}")
```

データ準備パイプラインを開始するには、次のコマンドを実行します：

```bash
seq 0 409 | xargs -P1 -I{} bash -c './download.sh {}'
```

データセットは410のファイルに分割されており、各ファイルには約100万行が含まれています。データの小さなサブセットで作業したい場合は、リミットを調整するだけです。例：`seq 0 9 | ...`。

（上記のPythonスクリプトは非常に遅い（1ファイルあたり約2〜10分）、多くのメモリを消費し（ファイルごとに41 GB）、結果として生成されるCSVファイルは大きい（各10 GB）ため、注意が必要です。十分なRAMがある場合は、並列性を高めるために`-P1`の数値を増やします。これでもまだ遅い場合は、より良いインジェスト手順を考案することを検討してください。たとえば、.npyファイルをparquetに変換し、その後に他の処理をClickHouseで行うことが考えられます。）

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

CSVファイルをClickHouseにインポートするには、次のコマンドを実行します：

```sql
INSERT INTO laion FROM INFILE '{path_to_csv_files}/*.csv'
```

## ANNインデックスなしでのブルートフォースANN検索の実行 {#run-a-brute-force-ann-search-without-ann-index}

ブルートフォース近似最近傍検索を実行するには、次のコマンドを実行します：

```sql
SELECT url, caption FROM laion ORDER BY L2Distance(image_embedding, {target:Array(Float32)}) LIMIT 30
```

`target`は512要素の配列で、クライアントパラメータです。そのような配列を取得する便利な方法は、この記事の終わりに紹介します。今のところ、ランダムな猫の画像の埋め込みを`target`として実行できます。

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

8 rows in set. Elapsed: 6.432 sec. Processed 19.65 million rows, 43.96 GB (3.06 million rows/s., 6.84 GB/s.)
```

## ANNインデックスを使用したANNの実行 {#run-a-ann-with-an-ann-index}

ANNインデックスを持つ新しいテーブルを作成し、既存のテーブルからデータを挿入します：

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

デフォルトでは、AnnoyインデックスはL2距離をメトリックとして使用します。インデックスの作成や検索のためのさらなる調整方法については、Annoyインデックスの[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)に記載されています。さて、同じクエリで再度確認してみましょう：

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

8 rows in set. Elapsed: 0.641 sec. Processed 22.06 thousand rows, 49.36 MB (91.53 thousand rows/s., 204.81 MB/s.)
```

スピードは大幅に向上しましたが、精度が低下しました。これは、ANNインデックスが近似検索結果のみを提供するためです。例では類似画像埋め込みを検索しましたが、ポジティブな画像キャプション埋め込みをも検索することが可能です。

## UDFを使用した埋め込みの作成 {#creating-embeddings-with-udfs}

通常、新しい画像や新しい画像キャプションのために埋め込みを作成し、データ内の類似画像/画像キャプションペアを検索したいと思います。[UDF](/sql-reference/functions/udf)を使用して、クライアントを離れることなく`target`ベクターを作成できます。データを作成し、検索のために新しい埋め込みを作成する際は、同じモデルを使用することが重要です。以下のスクリプトは、データセットの基盤となる`ViT-B/32`モデルを利用しています。

### テキスト埋め込み {#text-embeddings}

最初に、次のPythonスクリプトをClickHouseデータパスの`user_scripts/`ディレクトリに保存し、実行可能にします（`chmod +x encode_text.py`）。

`encode_text.py`:

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

次に、ClickHouseサーバ構成ファイルの`<user_defined_executable_functions_config>/path/to/*_function.xml</user_defined_executable_functions_config>`で参照される場所に`encode_text_function.xml`を作成します。

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

これで、単純に次のように使用できます：

```sql
SELECT encode_text('cat');
```
最初の実行は遅くなりますが、モデルをロードするためですが、繰り返しの実行は速くなります。その後、出力を`SET param_target=...`にコピーして、簡単にクエリを記述できます。

### 画像埋め込み {#image-embeddings}

画像埋め込みも同様に作成できますが、画像キャプションテキストの代わりにローカル画像へのパスをPythonスクリプトに提供します。

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
