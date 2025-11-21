---
description: '英語の画像キャプション付き 4 億枚の画像を含むデータセット'
sidebar_label: 'Laion-400M データセット'
slug: /getting-started/example-datasets/laion-400m-dataset
title: 'Laion-400M データセット'
doc_type: 'guide'
keywords: ['サンプルデータセット', 'laion', '画像埋め込み', 'サンプルデータ', '機械学習']
---

[Laion-400M データセット](https://laion.ai/blog/laion-400-open-dataset/) には、英語の画像キャプション付きの 4 億枚の画像が含まれています。現在 Laion は[さらに大規模なデータセット](https://laion.ai/blog/laion-5b/)も提供していますが、その扱い方も本データセットと同様です。

このデータセットには、画像の URL、画像および画像キャプションそれぞれの埋め込み、画像と画像キャプション間の類似度スコアに加え、画像の幅/高さ、ライセンス、NSFW フラグといったメタデータが含まれます。このデータセットを使って、ClickHouse における[近似最近傍探索](../../engines/table-engines/mergetree-family/annindexes.md)をデモンストレーションできます。



## データの準備 {#data-preparation}

埋め込みとメタデータは、生データ内の別々のファイルに保存されています。データ準備ステップでは、データをダウンロードし、ファイルを結合し、CSV形式に変換してClickHouseにインポートします。この処理には、以下の`download.sh`スクリプトを使用できます:

```bash
number=${1}
if [[ $number == '' ]]; then
    number=1
fi;
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/img_emb/img_emb_${number}.npy          # 画像埋め込みをダウンロード
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/text_emb/text_emb_${number}.npy        # テキスト埋め込みをダウンロード
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/metadata/metadata_${number}.parquet    # メタデータをダウンロード
python3 process.py $number # ファイルを結合してCSVに変換
```

`process.py`スクリプトは以下のように定義されています:

```python
import pandas as pd
import numpy as np
import os
import sys

str_i = str(sys.argv[1])
npy_file = "img_emb_" + str_i + '.npy'
metadata_file = "metadata_" + str_i + '.parquet'
text_npy =  "text_emb_" + str_i + '.npy'

```


# すべてのファイルを読み込む
im_emb = np.load(npy_file)
text_emb = np.load(text_npy) 
data = pd.read_parquet(metadata_file)



# ファイルを結合

data = pd.concat([data, pd.DataFrame({"image_embedding" : [*im_emb]}), pd.DataFrame({"text_embedding" : [*text_emb]})], axis=1, copy=False)


# ClickHouse にインポートする列
data = data[['url', 'caption', 'NSFW', 'similarity', "image_embedding", "text_embedding"]]



# np.array をリスト型に変換する
data['image_embedding'] = data['image_embedding'].apply(lambda x: x.tolist())
data['text_embedding'] = data['text_embedding'].apply(lambda x: x.tolist())



# caption にさまざまな種類のクォート文字が含まれる場合があるため、この簡単なハックが必要になります
data['caption'] = data['caption'].apply(lambda x: x.replace("'", " ").replace('"', " "))



# データを CSV ファイルに書き出す
data.to_csv(str_i + '.csv', header=False)



# 生データファイルを削除

os.system(f&quot;rm {npy_file} {metadata_file} {text_npy}&quot;)

````

データ準備パイプラインを開始するには、以下を実行します：

```bash
seq 0 409 | xargs -P1 -I{} bash -c './download.sh {}'
````

このデータセットは 410 個のファイルに分割されており、各ファイルには約 100 万行が含まれています。より小さいサブセットのデータで作業したい場合は、単に範囲を調整してください（例: `seq 0 9 | ...`）。

（上記の Python スクリプトは非常に遅く（1 ファイルあたり約 2〜10 分）、大量のメモリを消費し（1 ファイルあたり 41 GB）、生成される CSV ファイルも大きいです（各 10 GB）ので注意が必要です。十分な RAM がある場合は、より高い並列度を得るために `-P1` の数値を増やしてください。これでもまだ遅い場合は、より良い取り込み手順の検討をおすすめします。たとえば、.npy ファイルを Parquet に変換し、その後のすべての処理を ClickHouse で行うといった方法です。）


## テーブルの作成 {#create-table}

インデックスなしでテーブルを作成するには、以下を実行します:

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

CSVファイルをClickHouseにインポートするには:

```sql
INSERT INTO laion FROM INFILE '{path_to_csv_files}/*.csv'
```

なお、`id`列は説明用であり、スクリプトによって一意でない値が設定されます。


## ブルートフォースベクトル類似検索の実行 {#run-a-brute-force-vector-similarity-search}

ブルートフォース近似ベクトル検索を実行するには、以下を実行します:

```sql
SELECT url, caption FROM laion ORDER BY cosineDistance(image_embedding, {target:Array(Float32)}) LIMIT 10
```

`target`は512要素の配列で、クライアントパラメータです。
このような配列を取得する便利な方法は、記事の最後で紹介します。
ここでは、ランダムなLEGOセットの画像の埋め込みを`target`として実行できます。

**結果**

```markdown
    ┌─url───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─caption──────────────────────────────────────────────────────────────────────────┐

1.  │ https://s4.thcdn.com/productimg/600/600/11340490-9914447026352671.jpg │ LEGO Friends: Puppy Treats & Tricks (41304) │
2.  │ https://www.avenuedelabrique.com/img/uploads/f20fd44bfa4bd49f2a3a5fad0f0dfed7d53c3d2f.jpg │ Nouveau LEGO Friends 41334 Andrea s Park Performance 2018 │
3.  │ http://images.esellerpro.com/2489/I/667/303/3938_box_in.jpg │ 3938 LEGO Andreas Bunny House Girls Friends Heartlake Age 5-12 / 62 Pieces New! │
4.  │ http://i.shopmania.org/180x180/7/7f/7f1e1a2ab33cde6af4573a9e0caea61293dfc58d.jpg?u=https%3A%2F%2Fs.s-bol.com%2Fimgbase0%2Fimagebase3%2Fextralarge%2FFC%2F4%2F0%2F9%2F9%2F9200000049789904.jpg │ LEGO Friends Avonturenkamp Boomhuis - 41122 │
5.  │ https://s.s-bol.com/imgbase0/imagebase/large/FC/5/5/9/4/1004004011684955.jpg │ LEGO Friends Andrea s Theatershow - 3932 │
6.  │ https://www.jucariicucubau.ro/30252-home_default/41445-lego-friends-ambulanta-clinicii-veterinare.jpg │ 41445 - LEGO Friends - Ambulanta clinicii veterinare │
7.  │ https://cdn.awsli.com.br/600x1000/91/91201/produto/24833262/234c032725.jpg │ LEGO FRIENDS 41336 EMMA S ART CAFÉ │
8.  │ https://media.4rgos.it/s/Argos/6174930_R_SET?$Thumb150$&amp;$Web$ │ more details on LEGO Friends Stephanie s Friendship Cake Set - 41308. │
9.  │ https://thumbs4.ebaystatic.com/d/l225/m/mG4k6qAONd10voI8NUUMOjw.jpg │ Lego Friends Gymnast 30400 Polybag 26 pcs │
10. │ http://www.ibrickcity.com/wp-content/gallery/41057/thumbs/thumbs_lego-41057-heartlake-horse-show-friends-3.jpg │ lego-41057-heartlake-horse-show-friends-3 │
    └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────────────────┘

10行のセット。経過時間: 4.605秒。処理済み: 1億38万行、309.98 GB (2180万行/秒、67.31 GB/秒)
```


## ベクトル類似度インデックスを使用した近似ベクトル類似度検索の実行 {#run-an-approximate-vector-similarity-search-with-a-vector-similarity-index}

それでは、テーブルに2つのベクトル類似度インデックスを定義しましょう。

```sql
ALTER TABLE laion ADD INDEX image_index image_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
ALTER TABLE laion ADD INDEX text_index text_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
```

インデックスの作成と検索に関するパラメータおよびパフォーマンスの考慮事項については、[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)を参照してください。
上記のインデックス定義では、距離メトリックとして「コサイン距離」を使用するHNSWインデックスを指定し、パラメータ「hnsw_max_connections_per_layer」を64に、パラメータ「hnsw_candidate_list_size_for_construction」を256に設定しています。
このインデックスは、メモリ使用量を最適化するために、量子化として半精度ブレインフロート(bfloat16)を使用します。

インデックスを構築してマテリアライズするには、次のステートメントを実行します:

```sql
ALTER TABLE laion MATERIALIZE INDEX image_index;
ALTER TABLE laion MATERIALIZE INDEX text_index;
```

インデックスの構築と保存には、行数とHNSWインデックスパラメータに応じて、数分から数時間かかる場合があります。

ベクトル検索を実行するには、同じクエリを再度実行します:

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

```


10 行の結果。経過時間: 0.019 秒。処理済み 137.27 千行, 24.42 MB (7.38 百万行/秒, 1.31 GB/秒.)

```

ベクトルインデックスを使用して最近傍を取得したため、クエリのレイテンシが大幅に減少しました。
ベクトル類似度インデックスを使用したベクトル類似度検索では、ブルートフォース検索の結果とわずかに異なる結果が返される場合があります。
HNSWインデックスは、HNSWパラメータを慎重に選択し、インデックスの品質を評価することで、1に近い再現率(ブルートフォース検索と同等の精度)を達成できる可能性があります。
```


## UDFを使用した埋め込みの作成 {#creating-embeddings-with-udfs}

通常、新しい画像や画像キャプションの埋め込みを作成し、データ内で類似した画像/画像キャプションのペアを検索する必要があります。[UDF](/sql-reference/functions/udf)を使用することで、クライアントから離れることなく`target`ベクトルを作成できます。データと検索用の新しい埋め込みを作成する際には、同じモデルを使用することが重要です。以下のスクリプトは、データセットの基盤となっている`ViT-B/32`モデルを利用しています。

### テキスト埋め込み {#text-embeddings}

まず、以下のPythonスクリプトをClickHouseデータパスの`user_scripts/`ディレクトリに保存し、実行可能にします(`chmod +x encode_text.py`)。

`encode_text.py`:

```python
#!/usr/bin/python3
#!注意: 仮想環境を使用している場合は、上記のpython3実行可能ファイルの場所を変更してください。
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

次に、ClickHouseサーバー設定ファイルの`<user_defined_executable_functions_config>/path/to/*_function.xml</user_defined_executable_functions_config>`で参照される場所に`encode_text_function.xml`を作成します。

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

これで、次のように簡単に使用できます:

```sql
SELECT encode_text('cat');
```

最初の実行はモデルを読み込むため遅くなりますが、繰り返し実行すると高速になります。その後、出力を`SET param_target=...`にコピーして、クエリを簡単に記述できます。あるいは、`encode_text()`関数を`cosineDistance`関数の引数として直接使用することもできます:

```SQL
SELECT url
FROM laion
ORDER BY cosineDistance(text_embedding, encode_text('a dog and a cat')) ASC
LIMIT 10
```

`encode_text()` UDF自体が埋め込みベクトルを計算して出力するのに数秒かかる場合があることに注意してください。

### 画像埋め込み {#image-embeddings}

画像埋め込みも同様に作成でき、ローカルにファイルとして保存された画像の埋め込みを生成できるPythonスクリプトを提供しています。

`encode_image.py`

```python
#!/usr/bin/python3
#!注意: 仮想環境を使用している場合は、上記のpython3実行可能ファイルの場所を変更してください。
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

検索用のサンプル画像を取得します:


```shell
# LEGOセットのランダムな画像を取得する
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
