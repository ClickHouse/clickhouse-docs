---
'description': 'データセットには LAION 5B データセットからの 1 億ベクトルが含まれています'
'sidebar_label': 'LAION 5B データセット'
'slug': '/getting-started/example-datasets/laion-5b-dataset'
'title': 'LAION 5B データセット'
'keywords':
- 'semantic search'
- 'vector similarity'
- 'approximate nearest neighbours'
- 'embeddings'
'doc_type': 'reference'
---

import search_results_image from '@site/static/images/getting-started/example-datasets/laion5b_visualization_1.png'
import Image from '@theme/IdealImage';

## Introduction {#introduction}

[LAION 5bデータセット](https://laion.ai/blog/laion-5b/)には、58.5億の画像-テキスト埋め込みと関連する画像メタデータが含まれています。埋め込みは、 `Open AI CLIP` モデル [ViT-L/14](https://huggingface.co/sentence-transformers/clip-ViT-L-14) を使用して生成されました。各埋め込みベクトルの次元は `768` です。

このデータセットは、大規模な現実世界のベクトル検索アプリケーションの設計、サイズ、パフォーマンスの側面をモデル化するために使用できます。このデータセットは、テキストから画像の検索および画像から画像の検索の両方に使用できます。

## Dataset details {#dataset-details}

完全なデータセットは、[the-eye.eu](https://the-eye.eu/public/AI/cah/laion5b/) で `npy` と `Parquet` ファイルの混合として利用可能です。

ClickHouseは、100百万のベクトルのサブセットを `S3` バケットに提供しました。
`S3` バケットには10個の `Parquet` ファイルが含まれており、各 `Parquet` ファイルには1000万行が含まれています。

ユーザーはまず、[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)を参照して、このデータセットのストレージおよびメモリ要件を見積もるためのサイズ計算を実行することをお勧めします。

## Steps {#steps}

<VerticalStepper headerLevel="h3">

### Create table {#create-table}

埋め込みとその関連属性を保存するために `laion_5b_100m` テーブルを作成します：

```sql
CREATE TABLE laion_5b_100m
(
    id UInt32,
    image_path String,
    caption String,
    NSFW Nullable(String) default 'unknown',
    similarity Float32,
    LICENSE Nullable(String),
    url String,
    key String,
    status LowCardinality(String),
    width Int32,
    height Int32,
    original_width Int32,
    original_height Int32,
    exif Nullable(String),
    md5 String,
    vector Array(Float32) CODEC(NONE)
) ENGINE = MergeTree ORDER BY (id)
```

`id` は単にインクリメントされる整数です。追加の属性は、ベクトル類似性検索を理解するための述語に使用でき、ポストフィルタリング/プリフィルタリングと組み合わせることができます。詳細は[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)を参照してください。

### Load data {#load-table}

すべての `Parquet` ファイルからデータセットをロードするには、次のSQL文を実行します：

```sql
INSERT INTO laion_5b_100m SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/laion-5b/laion5b_100m_*.parquet');
```

テーブルに100百万行をロードするには数分かかります。

あるいは、特定の数のファイル/行をロードするために個々のSQL文を実行することもできます。

```sql
INSERT INTO laion_5b_100m SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/laion-5b/laion5b_100m_part_1_of_10.parquet');
INSERT INTO laion_5b_100m SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/laion-5b/laion5b_100m_part_2_of_10.parquet');
⋮
```

### Run a brute-force vector similarity search {#run-a-brute-force-vector-similarity-search}

KNN (k - 最近傍探索) またはブルートフォース検索は、データセット内の各ベクトルと検索埋め込みベクトルとの距離を計算し、距離を順序付けて最近傍を取得することを含みます。データセット自体からベクトルの1つを検索ベクトルとして使用できます。例えば：

```sql title="Query"
SELECT id, url 
FROM laion_5b_100m
ORDER BY cosineDistance( vector, (SELECT vector FROM laion_5b_100m WHERE id = 9999) ) ASC
LIMIT 20

The vector in the row with id = 9999 is the embedding for an image of a Deli restaurant.
```

```response title="Response"
    ┌───────id─┬─url───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 1. │     9999 │ https://certapro.com/belleville/wp-content/uploads/sites/1369/2017/01/McAlistersFairviewHgts.jpg                                                                                                                                  │
 2. │ 60180509 │ https://certapro.com/belleville/wp-content/uploads/sites/1369/2017/01/McAlistersFairviewHgts-686x353.jpg                                                                                                                          │
 3. │  1986089 │ https://www.gannett-cdn.com/-mm-/ceefab710d945bb3432c840e61dce6c3712a7c0a/c=30-0-4392-3280/local/-/media/2017/02/14/FortMyers/FortMyers/636226855169587730-McAlister-s-Exterior-Signage.jpg?width=534&amp;height=401&amp;fit=crop │
 4. │ 51559839 │ https://img1.mashed.com/img/gallery/how-rich-is-the-mcalisters-deli-ceo-and-whats-the-average-pay-of-its-employees/intro-1619793841.jpg                                                                                           │
 5. │ 22104014 │ https://www.restaurantmagazine.com/wp-content/uploads/2016/04/Largest-McAlisters-Deli-Franchisee-to-Expand-into-Nebraska.jpg                                                                                                      │
 6. │ 54337236 │ http://www.restaurantnews.com/wp-content/uploads/2015/11/McAlisters-Deli-Giving-Away-Gift-Cards-With-Win-One-Gift-One-Holiday-Promotion.jpg                                                                                       │
 7. │ 20770867 │ http://www.restaurantnews.com/wp-content/uploads/2016/04/McAlisters-Deli-Aims-to-Attract-New-Franchisees-in-Florida-as-Chain-Enters-New-Markets.jpg                                                                               │
 8. │ 22493966 │ https://www.restaurantmagazine.com/wp-content/uploads/2016/06/McAlisters-Deli-Aims-to-Attract-New-Franchisees-in-Columbus-Ohio-as-Chain-Expands-feature.jpg                                                                       │
 9. │  2224351 │ https://holttribe.com/wp-content/uploads/2019/10/60880046-879A-49E4-8E13-1EE75FB24980-900x675.jpeg                                                                                                                                │
10. │ 30779663 │ https://www.gannett-cdn.com/presto/2018/10/29/PMUR/685f3e50-cce5-46fb-9a66-acb93f6ea5e5-IMG_6587.jpg?crop=2166,2166,x663,y0&amp;width=80&amp;height=80&amp;fit=bounds                                                             │
11. │ 54939148 │ https://www.priceedwards.com/sites/default/files/styles/staff_property_listing_block/public/for-lease/images/IMG_9674%20%28Custom%29_1.jpg?itok=sa8hrVBT                                                                          │
12. │ 95371605 │ http://www.restaurantmagazine.com/wp-content/uploads/2015/08/McAlisters-Deli-Signs-Development-Agreement-with-Kingdom-Foods-to-Grow-in-Southern-Mississippi.jpg                                                                   │
13. │ 79564563 │ https://www.restaurantmagazine.com/wp-content/uploads/2016/05/McAlisters-Deli-Aims-to-Attract-New-Franchisees-in-Denver-as-Chain-Expands.jpg                                                                                      │
14. │ 76429939 │ http://www.restaurantnews.com/wp-content/uploads/2016/08/McAlisters-Deli-Aims-to-Attract-New-Franchisees-in-Pennsylvania-as-Chain-Expands.jpg                                                                                     │
15. │ 96680635 │ https://img.claz.org/tc/400x320/9w3hll-UQNHGB9WFlhSGAVCWhheBQkeWh5SBAkUWh9SBgsJFxRcBUMNSR4cAQENXhJARwgNTRYcBAtDWh5WRQEJXR5SR1xcFkYKR1tYFkYGR1pVFiVyP0ImaTA                                                                        │
16. │ 48716846 │ http://tse2.mm.bing.net/th?id=OIP.nN2qJqGUJs_fVNdTiFyGnQHaEc                                                                                                                                                                      │
17. │  4472333 │ https://sgi.offerscdn.net/i/zdcs-merchants/05lG0FpXPIvsfiHnT3N8FQE.h200.w220.flpad.v22.bffffff.png                                                                                                                                │
18. │ 82667887 │ https://irs2.4sqi.net/img/general/200x200/11154479_OEGbrkgWB5fEGrrTkktYvCj1gcdyhZn7TSQSAqN2Yqw.jpg                                                                                                                                │
19. │ 57525607 │ https://knoji.com/images/logo/mcalistersdelicom.jpg                                                                                                                                                                               │
20. │ 15785896 │ https://www.groupnimb.com/mimg/merimg/mcalister-s-deli_1446088739.jpg                                                                                                                                                             │
    └──────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

#highlight-next-line
20 rows in set. Elapsed: 3.968 sec. Processed 100.38 million rows, 320.81 GB (25.30 million rows/s., 80.84 GB/s.)
```

クエリの待機時間を記録しておきますので、ANN（ベクトルインデックスを使用）のクエリの待機時間と比較できます。100百万行のデータでは、上記のクエリはベクトルインデックスなしで完了するのに数秒/分かかる可能性があります。

### Build a vector similarity index {#build-vector-similarity-index}

次のSQLを実行して、`laion_5b_100m` テーブルの `vector` カラムにベクトル類似性インデックスを定義し、構築します：

```sql
ALTER TABLE laion_5b_100m ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 768, 'bf16', 64, 512);

ALTER TABLE laion_5b_100m MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

インデックスの作成および検索に関するパラメーターとパフォーマンスの考慮事項は、[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)に記載されています。上記の文は、HNSWハイパーパラメーター `M` と `ef_construction` にそれぞれ64と512の値を使用しています。ユーザーは、選択された値に対応してインデックスの構築時間と検索結果の品質を評価することによって、これらのパラメーターの最適な値を慎重に選択する必要があります。

インデックスの構築および保存には、使用可能なCPUコアの数とストレージ帯域幅に応じて、フルの100百万データセットで数時間かかる場合があります。

### Perform ANN search {#perform-ann-search}

ベクトル類似性インデックスが構築されると、ベクトル検索クエリは自動的にインデックスを使用します：

```sql title="Query"
SELECT id, url 
FROM laion_5b_100m
ORDER BY cosineDistance( vector, (SELECT vector FROM laion_5b_100m WHERE id = 9999) ) ASC
LIMIT 20

```

初回のベクトルインデックスのメモリへのロードには数秒または数分かかる場合があります。

### Generate embeddings for search query {#generating-embeddings-for-search-query}

`LAION 5b` データセットの埋め込みベクトルは、`OpenAI CLIP` モデル `ViT-L/14` を使用して生成されました。

次のPythonスクリプトは、`CLIP` APIsを使用してプログラムmaticallyに埋め込みベクトルを生成する方法を示す例として提供されています。検索埋め込みベクトルは、その後、`SELECT` クエリ内の [`cosineDistance()`](/sql-reference/functions/distance-functions#cosineDistance) 関数に引数として渡されます。

`clip` パッケージをインストールするには、[OpenAI GitHubリポジトリ](https://github.com/openai/clip)を参照してください。

```python
import torch
import clip
import numpy as np
import sys
import clickhouse_connect

device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-L/14", device=device)


# Search for images that contain both a dog and a cat
text = clip.tokenize(["a dog and a cat"]).to(device)

with torch.no_grad():
    text_features = model.encode_text(text)
    np_arr = text_features.detach().cpu().numpy()

    # Pass ClickHouse credentials here
    chclient = clickhouse_connect.get_client()

    params = {'v1': list(np_arr[0])}
    result = chclient.query("SELECT id, url FROM laion_5b_100m ORDER BY cosineDistance(vector, %(v1)s) LIMIT 100",
                            parameters=params)

    # Write the results to a simple HTML page that can be opened in the browser. Some URLs may have become obsolete.
    print("<html>")
    for r in result.result_rows:
        print("<img src = ", r[1], 'width="200" height="200">')
    print("</html>")
```

上記の検索の結果は以下の通りです：

<Image img={search_results_image} alt="Vector Similarity Search Results" size="md"/>

</VerticalStepper>
