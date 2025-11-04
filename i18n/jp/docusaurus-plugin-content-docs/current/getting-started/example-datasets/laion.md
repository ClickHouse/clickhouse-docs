---
'description': 'データセットは、英語の画像キャプション付きで4億枚の画像を含みます'
'sidebar_label': 'Laion-400M デataset'
'slug': '/getting-started/example-datasets/laion-400m-dataset'
'title': 'Laion-400M デataset'
'doc_type': 'reference'
---

The [Laion-400M dataset](https://laion.ai/blog/laion-400-open-dataset/) には、英語の画像キャプションを持つ4億枚の画像が含まれています。現在、Laionは[さらに大きなデータセット](https://laion.ai/blog/laion-5b/)を提供していますが、それを扱うのは似たようなものになるでしょう。

このデータセットには、画像のURL、画像および画像キャプションの埋め込み、画像と画像キャプションの間の類似度スコア、および画像の幅/高さ、ライセンス、NSFWフラグなどのメタデータが含まれています。このデータセットを使用して、ClickHouseにおける[近似最近傍検索](../../engines/table-engines/mergetree-family/annindexes.md)を示すことができます。

## データ準備 {#data-preparation}

埋め込みとメタデータは、生データの別々のファイルに格納されています。データ準備ステップでは、データをダウンロードし、ファイルをマージし、CSVに変換してClickHouseにインポートします。これには、以下の `download.sh` スクリプトを使用できます：

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
スクリプト `process.py` は以下のように定義されています：

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

データ準備パイプラインを開始するには、次を実行します：

```bash
seq 0 409 | xargs -P1 -I{} bash -c './download.sh {}'
```

データセットは410ファイルに分割されており、各ファイルには約100万行が含まれています。データの小さなサブセットで作業したい場合は、単に制限を調整してください。例： `seq 0 9 | ...`。

（上記のPythonスクリプトは非常に遅く（ファイルごとに約2～10分）、多くのメモリ（ファイルごとに41GB）が必要で、生成されるCSVファイルは大きい（各10GB）ため、注意が必要です。十分なRAMがある場合は、`-P1` の数を増やして並列処理を増やしてください。これでも遅すぎる場合は、より良い取り込み手順を考えることを検討してください。たとえば、.npyファイルをparquetに変換し、その後にClickHouseで他の処理を行うなどです。）

## テーブル作成 {#create-table}

インデックスなしでテーブルを最初に作成するには、次を実行します：

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

`id` カラムは単なる例示用であり、スクリプトによって非一意の値で populated されます。

## ブルートフォースベクター類似検索を実行する {#run-a-brute-force-vector-similarity-search}

ブルートフォース近似ベクター検索を実行するには、次を実行します：

```sql
SELECT url, caption FROM laion ORDER BY cosineDistance(image_embedding, {target:Array(Float32)}) LIMIT 10
```

`target` は512要素の配列とクライアントパラメータです。
そのような配列を取得する便利な方法は、この記事の最後に示されます。
とりあえず、ランダムなLEGOセットの画像の埋め込みを `target` として実行できます。

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

## ベクター類似度インデックスを使用して近似ベクター類似検索を実行する {#run-an-approximate-vector-similarity-search-with-a-vector-similarity-index}

それでは、テーブルに対して2つのベクター類似度インデックスを定義しましょう。

```sql
ALTER TABLE laion ADD INDEX image_index image_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
ALTER TABLE laion ADD INDEX text_index text_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
```

インデックス作成および検索のためのパラメータとパフォーマンス考慮事項は、[ドキュメンテーション](../../engines/table-engines/mergetree-family/annindexes.md)に記載されています。
上記のインデックス定義は、距離測定として「コサイン距離」を使用し、「hnsw_max_connections_per_layer」パラメータを64、「hnsw_candidate_list_size_for_construction」パラメータを256に設定したHNSWインデックスを指定します。
インデックスは、メモリ使用量を最適化するために、半精度脳浮動小数点（bfloat16）を量子化として使用します。

インデックスを構築してマテリアライズするには、次の文を実行します：

```sql
ALTER TABLE laion MATERIALIZE INDEX image_index;
ALTER TABLE laion MATERIALIZE INDEX text_index;
```

インデックスの構築と保存には、行数やHNSWインデックスパラメータに応じて数分または数時間かかることがあります。

ベクター検索を行うには、同じクエリを再度実行するだけです：

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

クエリの遅延は大幅に減少しました。なぜなら、最近傍の隣接点がベクターインデックスを使用して取得されたからです。
ベクター類似度インデックスを使用したベクター類似検索は、ブルートフォース検索の結果とわずかに異なる結果を返す場合があります。
HNSWインデックスは、HNSWパラメータの慎重な選択とインデックス品質の評価により、リコールを1に近づけることができ、ブルートフォース検索と同じ精度を実現できます。

## UDFを使用した埋め込みの作成 {#creating-embeddings-with-udfs}

通常、新しい画像や新しい画像キャプションの埋め込みを作成し、データ内で似たような画像/画像キャプションのペアを検索したいと考えます。クライアントを離れることなく `target` ベクターを作成するために、[UDF](/sql-reference/functions/udf)を使用できます。同じモデルを使用してデータを作成し、検索のために新しい埋め込みを作成することが重要です。以下のスクリプトは、データセットの基盤でもある `ViT-B/32` モデルを利用しています。

### テキスト埋め込み {#text-embeddings}

最初に、次のPythonスクリプトをClickHouseデータパスの `user_scripts/` ディレクトリに保存し、実行可能にします（`chmod +x encode_text.py`）。

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

次に、ClickHouseサーバーの設定ファイル内の `<user_defined_executable_functions_config>/path/to/*_function.xml</user_defined_executable_functions_config>` で参照される場所に `encode_text_function.xml` を作成します。

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

これで、単に次を使用できます：

```sql
SELECT encode_text('cat');
```
初回の実行はモデルを読み込むため遅くなりますが、繰り返しの実行は速くなります。出力を `SET param_target=...` にコピーし、簡単にクエリを書くことができます。あるいは、 `encode_text()` 関数を `cosineDistance` 関数の引数として直接使用できます：

```SQL
SELECT url
FROM laion
ORDER BY cosineDistance(text_embedding, encode_text('a dog and a cat')) ASC
LIMIT 10
```

`encode_text()` UDF自体は、埋め込みベクターを計算して発行するのに数秒かかる可能性があることに注意してください。

### 画像埋め込み {#image-embeddings}

画像埋め込みは同様に作成でき、ローカルにファイルとして保存された画像の埋め込みを生成できるPythonスクリプトを提供します。

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

検索するためのサンプル画像を取得します：

```shell

# get a random image of a LEGO set
$ wget http://cdn.firstcry.com/brainbees/images/products/thumb/191325a.jpg
```

次に、上記画像の埋め込みを生成するために、このクエリを実行します：

```sql
SELECT encode_image('/path/to/your/image');
```

完全な検索クエリは次の通りです：

```sql
SELECT
    url,
    caption
FROM laion
ORDER BY cosineDistance(image_embedding, encode_image('/path/to/your/image')) ASC
LIMIT 10
```
