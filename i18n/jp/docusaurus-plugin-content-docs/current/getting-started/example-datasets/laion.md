---
description: '英語の画像キャプション付き 4 億枚の画像を含むデータセット'
sidebar_label: 'Laion-400M データセット'
slug: /getting-started/example-datasets/laion-400m-dataset
title: 'Laion-400M データセット'
doc_type: 'guide'
keywords: ['サンプルデータセット', 'laion', '画像埋め込み', 'サンプルデータ', '機械学習']
---

[Laion-400M データセット](https://laion.ai/blog/laion-400-open-dataset/) には、英語の画像キャプション付きの 4 億枚の画像が含まれています。現在 Laion からは[さらに大規模なデータセット](https://laion.ai/blog/laion-5b/)も提供されていますが、扱い方は概ね同様です。

このデータセットには、画像 URL、画像および画像キャプションの両方の埋め込みベクトル、画像と画像キャプション間の類似度スコアに加え、画像の幅・高さ、ライセンス、NSFW フラグといったメタデータが含まれています。このデータセットを使って、ClickHouse における[近似最近傍探索](../../engines/table-engines/mergetree-family/annindexes.md)をデモに使用できます。

## データの準備 {#data-preparation}

生データでは、埋め込みベクトルとメタデータは別々のファイルに保存されています。データ準備ステップでは、データをダウンロードし、ファイルをマージして CSV に変換し、ClickHouse に取り込みます。そのために次の `download.sh` スクリプトを使用できます。

```bash
number=${1}
if [[ $number == '' ]]; then
    number=1
fi;
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/img_emb/img_emb_${number}.npy          # download image embedding
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/text_emb/text_emb_${number}.npy        # download text embedding
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/metadata/metadata_${number}.parquet    # download metadata
python3 process.py $number # merge files and convert to CSV
```

`process.py` スクリプトは次のように定義されています：

```python
import pandas as pd
import numpy as np
import os
import sys

str_i = str(sys.argv[1])
npy_file = "img_emb_" + str_i + '.npy'
metadata_file = "metadata_" + str_i + '.parquet'
text_npy =  "text_emb_" + str_i + '.npy'

# load all files
im_emb = np.load(npy_file)
text_emb = np.load(text_npy) 
data = pd.read_parquet(metadata_file)

# combine files
data = pd.concat([data, pd.DataFrame({"image_embedding" : [*im_emb]}), pd.DataFrame({"text_embedding" : [*text_emb]})], axis=1, copy=False)

# columns to be imported into ClickHouse
data = data[['url', 'caption', 'NSFW', 'similarity', "image_embedding", "text_embedding"]]

# transform np.arrays to lists
data['image_embedding'] = data['image_embedding'].apply(lambda x: x.tolist())
data['text_embedding'] = data['text_embedding'].apply(lambda x: x.tolist())

# this small hack is needed because caption sometimes contains all kind of quotes
data['caption'] = data['caption'].apply(lambda x: x.replace("'", " ").replace('"', " "))

# export data as CSV file
data.to_csv(str_i + '.csv', header=False)

# removed raw data files
os.system(f"rm {npy_file} {metadata_file} {text_npy}")
```

データ準備パイプラインを開始するには、次のコマンドを実行します。

```bash
seq 0 409 | xargs -P1 -I{} bash -c './download.sh {}'
```

このデータセットは 410 個のファイルに分割されており、各ファイルには約 100 万行が含まれています。より小さいサブセットで作業したい場合は、`seq 0 9 | ...` のように上限値を調整してください。

（上記の Python スクリプトは非常に遅く（ファイルあたり約 2〜10 分）、大量のメモリを消費し（ファイルあたり 41 GB）、生成される CSV ファイルも大きいです（各 10 GB）ので注意してください。十分な RAM がある場合は、並列度を上げるために `-P1` の数値を増やしてください。それでもまだ遅い場合は、より効率的なインジェスト手順を検討してください。たとえば .npy ファイルを Parquet に変換し、その後の処理をすべて ClickHouse で行う方法などが考えられます。）


## テーブルを作成する {#create-table}

まずは索引なしのテーブルを作成するために、次を実行します：

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

CSV ファイルを ClickHouse にインポートするには:

```sql
INSERT INTO laion FROM INFILE '{path_to_csv_files}/*.csv'
```

`id` カラムは単なる例示用であり、スクリプトによって一意ではない値が設定されている点に注意してください。


## 総当たりによるベクトル類似検索を実行する {#run-a-brute-force-vector-similarity-search}

総当たり方式で近似ベクトル検索を行うには、次を実行します。

```sql
SELECT url, caption FROM laion ORDER BY cosineDistance(image_embedding, {target:Array(Float32)}) LIMIT 10
```

`target` は 512 要素の配列であり、クライアント側パラメータです。
このような配列を取得するための便利な方法は、記事の最後で紹介します。
ここでは、ランダムな LEGO セットの画像を `target` の埋め込みとして計算してみます。

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

10 rows in set. Elapsed: 4.605 sec. Processed 100.38 million rows, 309.98 GB (21.80 million rows/s., 67.31 GB/s.)
```


## ベクトル類似インデックスを使って近似ベクトル類似検索を実行する {#run-an-approximate-vector-similarity-search-with-a-vector-similarity-index}

次に、このテーブルに 2 つのベクトル類似インデックスを定義します。

```sql
ALTER TABLE laion ADD INDEX image_index image_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
ALTER TABLE laion ADD INDEX text_index text_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
```

インデックス作成および検索時のパラメータとパフォーマンス上の考慮事項については、[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)を参照してください。
上記のインデックス定義では、距離指標として「cosine distance」を使用する HNSW インデックスを指定し、パラメータ「hnsw&#95;max&#95;connections&#95;per&#95;layer」を 64、「hnsw&#95;candidate&#95;list&#95;size&#95;for&#95;construction」を 256 に設定しています。
このインデックスは、メモリ使用量を最適化するために、量子化として半精度ブレインフロート（bfloat16）を使用します。

インデックスの構築およびマテリアライズを行うには、次の文を実行します：

```sql
ALTER TABLE laion MATERIALIZE INDEX image_index;
ALTER TABLE laion MATERIALIZE INDEX text_index;
```

索引の構築と保存には、行数や HNSW 索引パラメータによっては数分から数時間かかる場合があります。

ベクトル検索を実行するには、同じクエリをもう一度実行します。

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

10 rows in set. Elapsed: 0.019 sec. Processed 137.27 thousand rows, 24.42 MB (7.38 million rows/s., 1.31 GB/s.)
```

クエリのレイテンシは大幅に短縮されました。これは、ベクトル索引を用いて最近傍が取得されたためです。
ベクトル類似度索引を用いたベクトル類似度検索は、総当たり検索の結果とわずかに異なる結果を返す場合があります。
HNSW 索引は、HNSW パラメータを慎重に選択し、索引品質を評価することで、リコールが 1 に近い値（総当たり検索と同等の精度）を達成できる可能性があります。


## UDF を使用した埋め込みの作成 {#creating-embeddings-with-udfs}

通常は、新しい画像や新しい画像キャプションに対して埋め込みを作成し、データ内から類似した画像／画像キャプションのペアを検索します。[UDF](/sql-reference/functions/udf) を使用すると、クライアントを離れることなく `target` ベクターを作成できます。データの作成と検索用の新しい埋め込みの作成には、同じモデルを使用することが重要です。次のスクリプトでは、データセットの基盤となっている `ViT-B/32` モデルを利用します。

### テキストの埋め込み {#text-embeddings}

まず、次の Python スクリプトを ClickHouse のデータパス配下の `user_scripts/` ディレクトリに保存し、実行可能属性を付与します（`chmod +x encode_text.py`）。

`encode_text.py`:

```python
#!/usr/bin/python3
#!Note: Change the above python3 executable location if a virtual env is being used.
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

次に、ClickHouse サーバー設定ファイルで `<user_defined_executable_functions_config>/path/to/*_function.xml</user_defined_executable_functions_config>` として指定されている場所に、`encode_text_function.xml` を作成します。

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

これで、次のように使用できます。

```sql
SELECT encode_text('cat');
```

最初の実行はモデルの読み込みが行われるため遅くなりますが、2回目以降は高速になります。その後、出力結果を `SET param_target=...` にコピーすれば、簡単にクエリを記述できます。あるいは、`encode_text()` 関数を `cosineDistance` 関数の引数として直接使用することもできます。

```SQL
SELECT url
FROM laion
ORDER BY cosineDistance(text_embedding, encode_text('a dog and a cat')) ASC
LIMIT 10
```

`encode_text()` UDF 自体の計算および埋め込みベクトルの出力には、数秒かかる場合がある点に注意してください。


### 画像埋め込み {#image-embeddings}

画像埋め込みも同様の方法で作成でき、ローカルにファイルとして保存されている画像から埋め込みを生成するための Python スクリプトを提供しています。

`encode_image.py`

```python
#!/usr/bin/python3
#!Note: Change the above python3 executable location if a virtual env is being used.
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

検索に使用するサンプル画像を取得します：

```shell
# get a random image of a LEGO set
$ wget http://cdn.firstcry.com/brainbees/images/products/thumb/191325a.jpg
```

次に、上記の画像の埋め込みを生成するために、次のクエリを実行します：

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
