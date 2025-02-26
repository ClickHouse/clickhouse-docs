---
description: "英語の画像キャプション付きの4億枚の画像を含むデータセット"
slug: /getting-started/example-datasets/laion-400m-dataset
sidebar_label: Laion-400Mデータセット
title: "Laion-400Mデータセット"
---

[Laion-400Mデータセット](https://laion.ai/blog/laion-400-open-dataset/)は、英語の画像キャプション付きで4億枚の画像を含んでいます。Laionは現在、[さらに大きなデータセット](https://laion.ai/blog/laion-5b/)を提供していますが、その扱いは似ています。

このデータセットには、画像のURL、画像および画像キャプションの埋め込み、画像と画像キャプション間の類似性スコア、メタデータ（例：画像の幅/高さ、ライセンス、NSFWフラグなど）が含まれています。このデータセットを使用して、ClickHouseでの[近似最近傍探索](../../engines/table-engines/mergetree-family/annindexes.md)を示すことができます。

## データ準備 {#data-preparation}

埋め込みとメタデータは、元データの別々のファイルに保存されています。データ準備ステップでは、データをダウンロードし、ファイルをマージし、CSVに変換してClickHouseにインポートします。以下の`download.sh`スクリプトを使用できます：

```bash
number=${1}
if [[ $number == '' ]]; then
    number=1
fi;
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/img_emb/img_emb_${number}.npy          # 画像埋め込みをダウンロード
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/text_emb/text_emb_${number}.npy        # テキスト埋め込みをダウンロード
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/metadata/metadata_${number}.parquet    # メタデータをダウンロード
python3 process.py $number # ファイルをマージし、CSVに変換
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

# すべてのファイルを読み込む
im_emb = np.load(npy_file)
text_emb = np.load(text_npy) 
data = pd.read_parquet(metadata_file)

# ファイルを結合
data = pd.concat([data, pd.DataFrame({"image_embedding" : [*im_emb]}), pd.DataFrame({"text_embedding" : [*text_emb]})], axis=1, copy=False)

# ClickHouseにインポートするカラム
data = data[['url', 'caption', 'NSFW', 'similarity', "image_embedding", "text_embedding"]]

# np.arrayをリストに変換
data['image_embedding'] = data['image_embedding'].apply(lambda x: list(x))
data['text_embedding'] = data['text_embedding'].apply(lambda x: list(x))

# キャプションにさまざまな引用符が含まれることがあるため、この小さなハックが必要
data['caption'] = data['caption'].apply(lambda x: x.replace("'", " ").replace('"', " "))

# データをCSVファイルとしてエクスポート
data.to_csv(str_i + '.csv', header=False)

# 元データファイルを削除
os.system(f"rm {npy_file} {metadata_file} {text_npy}")
```

データ準備パイプラインを始めるには、次のように実行します：

```bash
seq 0 409 | xargs -P1 -I{} bash -c './download.sh {}'
```

データセットは410のファイルに分割されており、各ファイルは約100万行を含んでいます。データの小さなサブセットで作業したい場合は、制限を調整してください（例：`seq 0 9 | ...`）。

（上記のPythonスクリプトは非常に遅く（ファイルごとに約2-10分）、多くのメモリ（ファイルごとに41 GB）を消費し、結果のCSVファイルも大きい（各10 GB）ため注意が必要です。十分なRAMがあれば、より多くの並列性のために`-P1`の数字を増やしてください。これでもまだ遅い場合は、.npyファイルをparquetに変換してから、ClickHouseで他の処理を行うなど、より良いインジェスト手順を考えてください。）

## テーブル作成 {#create-table}

インデックスなしでテーブルを作成するには、次のように実行します：

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

ブルートフォース近似最近傍検索を実行するには、次のように実行します：

```sql
SELECT url, caption FROM laion ORDER BY L2Distance(image_embedding, {target:Array(Float32)}) LIMIT 30
```

`target`は512要素の配列で、クライアントパラメータです。そのような配列を取得する便利な方法は、記事の最後に紹介されます。今のところ、ランダムな猫の画像の埋め込みを`target`として実行できます。

**結果**

```markdown
┌─url───────────────────────────────────────────────────────────────────────────────────────────────────────────┬─caption────────────────────────────────────────────────────────────────┐
│ https://s3.amazonaws.com/filestore.rescuegroups.org/6685/pictures/animals/13884/13884995/63318230_463x463.jpg │ Adoption可能なオスのドメスティックショートヘア                              │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/8/b/6/239905226.jpg                                        │ Adopt A Pet :: Marzipan - ニューヨーク, NY                                │
│ http://d1n3ar4lqtlydb.cloudfront.net/9/2/4/248407625.jpg                                                      │ Adopt A Pet :: Butterscotch - ニューストン, DE                           │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/e/e/c/245615237.jpg                                        │ Adopt A Pet :: Tiggy - シカゴ, IL                                      │
│ http://pawsofcoronado.org/wp-content/uploads/2012/12/rsz_pumpkin.jpg                                          │ パンプキン オレンジタビー子猫のための養子                           │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/7/8/3/188700997.jpg                                        │ Adopt A Pet :: ブライアン - フランクフォート, IL                             │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/8/b/d/191533561.jpg                                        │ メサ, アリゾナの養子に入るドメスティックショートヘア - チャーリー         │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/0/1/2/221698235.jpg                                        │ マリエッタ, オハイオの養子に入るドメスティックショートヘア - デイジー（避妊済み） │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────┘

8行が設定されました。経過時間: 6.432秒。19.65百万行を処理、43.96 GB（3.06百万行/s., 6.84 GB/s.）
```

## ANNインデックスでのANNを実行 {#run-a-ann-with-an-ann-index}

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

デフォルトでは、AnnoyインデックスはL2距離をメトリックとして使用します。インデックス作成と検索のさらなる調整方法は、Annoyインデックスの[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)に記載されています。同じクエリで再度確認してみましょう：

```sql
SELECT url, caption FROM laion_annoy ORDER BY l2Distance(image_embedding, {target:Array(Float32)}) LIMIT 8
```

**結果**

```response
┌─url──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─caption──────────────────────────────────────────────────────────────┐
│ http://tse1.mm.bing.net/th?id=OIP.R1CUoYp_4hbeFSHBaaB5-gHaFj                                                                                                                         │ ベッドバグとペット、猫はベッドバグを運ぶことができるペットアドバイザー     │
│ http://pet-uploads.adoptapet.com/1/9/c/1963194.jpg?336w                                                                                                                              │ ドメスティックロングヘアキャットの養子 - マサチューセッツ州クインシー - アシュリー │
│ https://thumbs.dreamstime.com/t/cat-bed-12591021.jpg                                                                                                                                 │ ベッドの上の猫 ストックイメージ                                   │
│ https://us.123rf.com/450wm/penta/penta1105/penta110500004/9658511-portrait-of-british-short-hair-kitten-lieing-at-sofa-on-sun.jpg                                                    │ ソファの上で横たわるブリティッシュショートヘア子猫のポートレート       │
│ https://www.easypetmd.com/sites/default/files/Wirehaired%20Vizsla%20(2).jpg                                                                                                          │ ヴィズラ（ワイヤーヘア）の画像3                                    │
│ https://images.ctfassets.net/yixw23k2v6vo/0000000200009b8800000000/7950f4e1c1db335ef91bb2bc34428de9/dog-cat-flickr-Impatience_1.jpg?w=600&h=400&fm=jpg&fit=thumb&q=65&fl=progressive │ 犬と猫の画像                                               │
│ https://i1.wallbox.ru/wallpapers/small/201523/eaa582ee76a31fd.jpg                                                                                                                    │ 猫、子猫、顔、トンキニーズ                                         │
│ https://www.baxterboo.com/images/breeds/medium/cairn-terrier.jpg                                                                                                                     │ ケアーンテリアの写真                                          │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────┘

8行が設定されました。経過時間: 0.641秒。22.06千行を処理、49.36 MB（91.53千行/s., 204.81 MB/s.）
```

速度は大幅に向上しましたが、結果の精度が低下しました。これは、ANNインデックスが近似検索結果しか提供しないためです。例では類似の画像埋め込みを検索しましたが、ポジティブな画像キャプション埋め込みを検索することも可能です。

## UDFを使用した埋め込みの作成 {#creating-embeddings-with-udfs}

通常、新しい画像や新しい画像キャプションのために埋め込みを作成し、データ内の類似の画像/画像キャプションペアを検索したいと思います。[UDF](../../sql-reference/functions/overview#sql-user-defined-functions)を使用して、クライアントを離れることなく`target`ベクトルを作成できます。データと新しい埋め込みを検索するためには同じモデルを使用することが重要です。以下のスクリプトは、データセットの土台にもなっている`ViT-B/32`モデルを利用しています。

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

次に、ClickHouseサーバーの設定ファイル内の`<user_defined_executable_functions_config>/path/to/*_function.xml`に参照される場所に`encode_text_function.xml`を作成します。

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

これで簡単に使用できます：

```sql
SELECT encode_text('cat');
```
最初の実行はモデルを読み込むので遅くなりますが、繰り返し実行すると速くなります。その後、出力を`SET param_target=...`にコピーし、クエリを書くことができます。

### 画像埋め込み {#image-embeddings}

画像埋め込みも同様に作成できますが、画像キャプションテキストの代わりにローカル画像へのパスをPythonスクリプトに渡します。

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

次に、次のクエリを実行します：

```sql
SELECT encode_image('/path/to/your/image');
```
