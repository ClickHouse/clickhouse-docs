---
description: '英語の画像キャプション付き 4 億枚の画像を含むデータセット'
sidebar_label: 'Laion-400M データセット'
slug: /getting-started/example-datasets/laion-400m-dataset
title: 'Laion-400M データセット'
doc_type: 'guide'
keywords: ['サンプルデータセット', 'laion', '画像埋め込み', 'サンプルデータ', '機械学習']
---

[Laion-400M データセット](https://laion.ai/blog/laion-400-open-dataset/)には、英語の画像キャプション付きの 4 億枚の画像が含まれています。現在 Laion は[さらに大規模なデータセット](https://laion.ai/blog/laion-5b/)も提供していますが、扱い方はほぼ同様です。

このデータセットには、画像の URL、画像および画像キャプションそれぞれの埋め込みベクトル、画像と画像キャプション間の類似度スコアに加え、画像の幅/高さ、ライセンス、NSFW フラグといったメタデータが含まれます。このデータセットを使って、ClickHouse における[近似最近傍検索](../../engines/table-engines/mergetree-family/annindexes.md)を実演できます。

## データ準備 {#data-preparation}

生データでは、埋め込みとメタデータは別々のファイルに保存されています。データ準備のステップでは、データをダウンロードしてファイルを結合し、
CSV に変換して ClickHouse にインポートします。そのために、次の `download.sh` スクリプトを使用できます。

```bash
number=${1}
if [[ $number == '' ]]; then
    number=1
fi;
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/img_emb/img_emb_${number}.npy          # 画像埋め込みをダウンロード
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/text_emb/text_emb_${number}.npy        # テキスト埋め込みをダウンロード
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/metadata/metadata_${number}.parquet    # メタデータをダウンロード
python3 process.py $number # ファイルを結合しCSVに変換
```

`process.py` スクリプトは次のように定義されています。

```python
import pandas as pd
import numpy as np
import os
import sys

str_i = str(sys.argv[1])
npy_file = "img_emb_" + str_i + '.npy'
metadata_file = "metadata_" + str_i + '.parquet'
text_npy =  "text_emb_" + str_i + '.npy'

# 全ファイルを読み込み {#load-all-files}
im_emb = np.load(npy_file)
text_emb = np.load(text_npy) 
data = pd.read_parquet(metadata_file)

# ファイルを結合 {#combine-files}
data = pd.concat([data, pd.DataFrame({"image_embedding" : [*im_emb]}), pd.DataFrame({"text_embedding" : [*text_emb]})], axis=1, copy=False)

# ClickHouseへインポートする列 {#columns-to-be-imported-into-clickhouse}
data = data[['url', 'caption', 'NSFW', 'similarity', "image_embedding", "text_embedding"]]

# np.arraysをリストへ変換 {#transform-nparrays-to-lists}
data['image_embedding'] = data['image_embedding'].apply(lambda x: x.tolist())
data['text_embedding'] = data['text_embedding'].apply(lambda x: x.tolist())

# captionに様々な引用符が含まれる場合があるため、この回避策が必要 {#this-small-hack-is-needed-because-caption-sometimes-contains-all-kind-of-quotes}
data['caption'] = data['caption'].apply(lambda x: x.replace("'", " ").replace('"', " "))

# データをCSVファイルとしてエクスポート {#export-data-as-csv-file}
data.to_csv(str_i + '.csv', header=False)

# 生データファイルを削除 {#removed-raw-data-files}
os.system(f"rm {npy_file} {metadata_file} {text_npy}")
```

データ準備パイプラインを開始するには、次のコマンドを実行します:

```bash
seq 0 409 | xargs -P1 -I{} bash -c './download.sh {}'
```

このデータセットは 410 個のファイルに分割されており、各ファイルにはおよそ 100 万行が含まれています。より小さなサブセットで作業したい場合は、単に上限を調整してください（例: `seq 0 9 | ...`）。

（上記の Python スクリプトは非常に遅く（1 ファイルあたり約 2〜10 分）、大量のメモリを消費し（1 ファイルあたり 41 GB）、生成される CSV ファイルも大きい（各 10 GB）ため、注意してください。十分な RAM がある場合は、より高い並列度を得るために `-P1` の値を増やしてください。これでもまだ遅い場合は、より良いインジェスト手順を検討してください。たとえば .npy ファイルを Parquet に変換してから、残りの処理をすべて ClickHouse で行うなどです。）

## テーブルを作成する {#create-table}

最初にインデックスなしでテーブルを作成するには、次を実行します。

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
```

CSV ファイルを ClickHouse にインポートするには、次の手順を実行します。

```sql
INSERT INTO laion FROM INFILE '{path_to_csv_files}/*.csv'
```

`id` 列はあくまで例示用のものであり、スクリプトによって一意ではない値が入力されている点に注意してください。


## 総当たり方式でベクトル類似度検索を実行する {#run-a-brute-force-vector-similarity-search}

総当たり方式の近似ベクトル検索を実行するには、次を実行します。

```sql
SELECT url, caption FROM laion ORDER BY cosineDistance(image_embedding, {target:Array(Float32)}) LIMIT 10
```

`target` は 512 要素からなる配列であり、クライアントパラメータです。
そのような配列を取得するための便利な方法は、記事の最後で紹介します。
今のところは、ランダムな LEGO セットの画像を `target` として埋め込みを実行してみます。

**結果**

```markdown
    ┌─url───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─caption──────────────────────────────────────────────────────────────────────────┐
 1. │ https://s4.thcdn.com/productimg/600/600/11340490-9914447026352671.jpg                                                                                                                         │ LEGO Friends: Puppy Treats & Tricks (41304)                                      │
 2. │ https://www.avenuedelabrique.com/img/uploads/f20fd44bfa4bd49f2a3a5fad0f0dfed7d53c3d2f.jpg                                                                                                     │ Nouveau LEGO Friends 41334 Andrea s Park Performance 2018                        │
 3. │ http://images.esellerpro.com/2489/I/667/303/3938_box_in.jpg                                                                                                                                   │ 3938 LEGO Andreas Bunny House Girls Friends Heartlake Age 5-12 / 62 Pieces  New! │
 4. │ http://i.shopmania.org/180x180/7/7f/7f1e1a2ab33cde6af4573a9e0caea61293dfc58d.jpg?u=https%3A%2F%2Fs.s-bol.com%2Fimgbase0%2Fimagebase3%2Fextralarge%2FFC%2F4%2F0%2F9%2F9%2F9200000049789904.jpg │ LEGO Friends Avonturenkamp Boomhuis - 41122                                      │
 5. │ https://s.s-bol.com/imgbase0/imagebase/large/FC/5/5/9/4/1004004011684955.jpg                                                                                                                  │ LEGO Friends Andrea s Theatershow - 3932                                         │
 6. │ https://www.jucariicucubau.ro/30252-home_default/41445-lego-friends-ambulanta-clinicii-veterinare.jpg                                                                                         │ 41445 - LEGO Friends - Ambulanta clinicii veterinare                             │
 7. │ https://cdn.awsli.com.br/600x1000/91/91201/produto/24833262/234c032725.jpg                                                                                                                    │ LEGO FRIENDS 41336 EMMA S ART CAFÉ                                               │
 8. │ https://media.4rgos.it/s/Argos/6174930_R_SET?$Thumb150$&amp;$Web$                                                                                                                             │ more details on LEGO Friends Stephanie s Friendship Cake Set - 41308.            │
 9. │ https://thumbs4.ebaystatic.com/d/l225/m/mG4k6qAONd10voI8NUUMOjw.jpg                                                                                                                           │ Lego Friends Gymnast 30400 Polybag 26 pcs                                        │
10. │ http://www.ibrickcity.com/wp-content/gallery/41057/thumbs/thumbs_lego-41057-heartlake-horse-show-friends-3.jpg                                                                                │ lego-41057-heartlake-horse-show-friends-3                                        │
    └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────────────────┘

10行のセット。経過時間: 4.605秒。処理済み: 1億0038万行、309.98 GB (2180万行/秒、67.31 GB/秒)
```

## ベクトル類似度インデックスを使って近似ベクトル類似検索を実行する {#run-an-approximate-vector-similarity-search-with-a-vector-similarity-index}

ここでは、テーブルに 2 つのベクトル類似度インデックスを定義します。

```sql
ALTER TABLE laion ADD INDEX image_index image_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
ALTER TABLE laion ADD INDEX text_index text_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
```

インデックス作成および検索時のパラメータとパフォーマンス面での考慮事項については、[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)を参照してください。
上記のインデックス定義では、「cosine distance」を距離指標として使用する HNSW インデックスを指定しており、パラメータ「hnsw&#95;max&#95;connections&#95;per&#95;layer」を 64 に、「hnsw&#95;candidate&#95;list&#95;size&#95;for&#95;construction」を 256 に設定しています。
このインデックスは、メモリ使用量を最適化するために、量子化として半精度ブレインフロート (bfloat16) を使用します。

インデックスを構築およびマテリアライズするには、次のステートメントを実行します。

```sql
ALTER TABLE laion MATERIALIZE INDEX image_index;
ALTER TABLE laion MATERIALIZE INDEX text_index;
```

インデックスの構築と保存には、行数や HNSW インデックスのパラメータによっては、数分から数時間程度かかる場合があります。

ベクトル検索を実行するには、同じクエリをもう一度実行するだけです。

```sql
SELECT url, caption FROM laion ORDER BY cosineDistance(image_embedding, {target:Array(Float32)}) LIMIT 10
```

**結果**

```response
    ┌─url───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─caption──────────────────────────────────────────────────────────────────────────┐
 1. │ https://s4.thcdn.com/productimg/600/600/11340490-9914447026352671.jpg                                                                                                                         │ LEGO Friends: Puppy Treats & Tricks (41304)                                      │
 2. │ https://www.avenuedelabrique.com/img/uploads/f20fd44bfa4bd49f2a3a5fad0f0dfed7d53c3d2f.jpg                                                                                                     │ Nouveau LEGO Friends 41334 Andrea s Park Performance 2018                        │
 3. │ http://images.esellerpro.com/2489/I/667/303/3938_box_in.jpg                                                                                                                                   │ 3938 LEGO Andreas Bunny House Girls Friends Heartlake Age 5-12 / 62 Pieces  New! │
 4. │ http://i.shopmania.org/180x180/7/7f/7f1e1a2ab33cde6af4573a9e0caea61293dfc58d.jpg?u=https%3A%2F%2Fs.s-bol.com%2Fimgbase0%2Fimagebase3%2Fextralarge%2FFC%2F4%2F0%2F9%2F9%2F9200000049789904.jpg │ LEGO Friends Avonturenkamp Boomhuis - 41122                                      │
 5. │ https://s.s-bol.com/imgbase0/imagebase/large/FC/5/5/9/4/1004004011684955.jpg                                                                                                                  │ LEGO Friends Andrea s Theatershow - 3932                                         │
 6. │ https://www.jucariicucubau.ro/30252-home_default/41445-lego-friends-ambulanta-clinicii-veterinare.jpg                                                                                         │ 41445 - LEGO Friends - Ambulanta clinicii veterinare                             │
 7. │ https://cdn.awsli.com.br/600x1000/91/91201/produto/24833262/234c032725.jpg                                                                                                                    │ LEGO FRIENDS 41336 EMMA S ART CAFÉ                                               │
 8. │ https://media.4rgos.it/s/Argos/6174930_R_SET?$Thumb150$&amp;$Web$                                                                                                                             │ more details on LEGO Friends Stephanie s Friendship Cake Set - 41308.            │
 9. │ https://thumbs4.ebaystatic.com/d/l225/m/mG4k6qAONd10voI8NUUMOjw.jpg                                                                                                                           │ Lego Friends Gymnast 30400 Polybag 26 pcs                                        │
10. │ http://www.ibrickcity.com/wp-content/gallery/41057/thumbs/thumbs_lego-41057-heartlake-horse-show-friends-3.jpg                                                                                │ lego-41057-heartlake-horse-show-friends-3                                        │
    └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────────────────┘

10行のセット。経過時間: 0.019秒。処理済み: 137.27千行、24.42 MB (7.38百万行/秒、1.31 GB/秒)
```

ベクトルインデックスを使用して最近傍を取得したため、クエリレイテンシが大幅に短縮されました。
ベクトル類似度インデックスを用いたベクトル類似検索では、総当たり検索の結果とわずかに異なる結果が返される場合があります。
HNSW インデックスは、HNSW パラメータを慎重に選定し、インデックス品質を評価することで、リコールを 1 に近づける（総当たり検索と同等の精度を達成する）ことが可能です。

## UDF を使用した埋め込みの作成 {#creating-embeddings-with-udfs}

通常は、新しい画像や新しい画像キャプションに対して埋め込みを作成し、そのデータ内で類似する画像／画像キャプションのペアを検索します。[UDF](/sql-reference/functions/udf) を使用すると、クライアント環境を離れることなく `target` ベクトルを作成できます。データ作成時と検索用の新しい埋め込みを生成する際には、同じモデルを使用することが重要です。以下のスクリプトは、データセットの基盤にもなっている `ViT-B/32` モデルを利用します。

### テキスト埋め込み {#text-embeddings}

まず、次の Python スクリプトを ClickHouse のデータパス配下にある `user_scripts/` ディレクトリに保存し、実行可能にします（`chmod +x encode_text.py`）。

`encode_text.py`:

```python
#!/usr/bin/python3
#!注意: 仮想環境を使用する場合は、上記のpython3実行ファイルのパスを変更してください。
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

次に、ClickHouse サーバーの設定ファイルで `<user_defined_executable_functions_config>/path/to/*_function.xml</user_defined_executable_functions_config>` として指定されているパスに `encode_text_function.xml` を作成します。

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

これで次のように簡単に使えます:

```sql
SELECT encode_text('cat');
```

最初の実行はモデルを読み込むために遅くなりますが、2回目以降は高速になります。その後、出力を `SET param_target=...` にコピーすれば、簡単にクエリを書けます。あるいは、`encode_text()` 関数を `cosineDistance` 関数への引数として直接渡すこともできます。

```SQL
SELECT url
FROM laion
ORDER BY cosineDistance(text_embedding, encode_text('a dog and a cat')) ASC
LIMIT 10
```

`encode_text()` UDF 自体が計算を行い埋め込みベクトルを出力するまでに、数秒かかる場合があることに注意してください。

### 画像埋め込み {#image-embeddings}

画像埋め込みも同様に作成できるように、ローカルにファイルとして保存されている画像の埋め込みを生成するための Python スクリプトを用意しています。

`encode_image.py`

```python
#!/usr/bin/python3
#!注意: 仮想環境を使用する場合は、上記のpython3実行ファイルのパスを変更してください。
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

検索用のサンプル画像を取得：

```shell
# LEGOセットのランダムな画像を取得 {#get-a-random-image-of-a-lego-set}
$ wget http://cdn.firstcry.com/brainbees/images/products/thumb/191325a.jpg
```

次に、先ほどの画像の埋め込みを生成するために、次のクエリを実行します：

```sql
SELECT encode_image('/path/to/your/image');
```

完全な検索クエリは次のとおりです。

```sql
SELECT
    url,
    caption
FROM laion
ORDER BY cosineDistance(image_embedding, encode_image('/path/to/your/image')) ASC
LIMIT 10
```
