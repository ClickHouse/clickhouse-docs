---
description: 'LAION 5B データセットから取得した 1 億個のベクトルを含むデータセット'
sidebar_label: 'LAION 5B データセット'
slug: /getting-started/example-datasets/laion-5b-dataset
title: 'LAION 5B データセット'
keywords: ['semantic search', 'vector similarity', 'approximate nearest neighbours', 'embeddings']
doc_type: 'guide'
---

import search_results_image from '@site/static/images/getting-started/example-datasets/laion5b_visualization_1.png'
import Image from '@theme/IdealImage';


## はじめに {#introduction}

[LAION 5bデータセット](https://laion.ai/blog/laion-5b/)には、58.5億の画像-テキスト埋め込みと関連する画像メタデータが含まれています。埋め込みは`Open AI CLIP`モデル[ViT-L/14](https://huggingface.co/sentence-transformers/clip-ViT-L-14)を使用して生成されました。各埋め込みベクトルの次元数は`768`です。

このデータセットは、大規模な実環境のベクトル検索アプリケーションにおけるモデル設計、サイジング、パフォーマンス面の検証に使用できます。このデータセットは、テキストから画像への検索と画像から画像への検索の両方に使用できます。


## データセットの詳細 {#dataset-details}

完全なデータセットは、`npy`および`Parquet`ファイルの混合形式で[the-eye.eu](https://the-eye.eu/public/AI/cah/laion5b/)から入手できます。

ClickHouseは、1億ベクトルのサブセットを`S3`バケットで提供しています。
この`S3`バケットには10個の`Parquet`ファイルが含まれており、各`Parquet`ファイルには1,000万行が格納されています。

このデータセットのストレージとメモリ要件を見積もるために、[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)を参照してサイジング演習を事前に実行することを推奨します。


## 手順 {#steps}

<VerticalStepper headerLevel="h3">

### テーブルの作成 {#create-table}

埋め込みベクトルとそれに関連する属性を格納するための`laion_5b_100m`テーブルを作成します:

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

`id`は単なる増分整数です。追加の属性は述語で使用でき、[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)で説明されているように、事後フィルタリング/事前フィルタリングと組み合わせたベクトル類似性検索を理解するために利用できます。

### データの読み込み {#load-table}

すべての`Parquet`ファイルからデータセットを読み込むには、以下のSQL文を実行します:

```sql
INSERT INTO laion_5b_100m SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/laion-5b/laion5b_100m_*.parquet');
```

テーブルへの1億行の読み込みには数分かかります。

または、個別のSQL文を実行して特定の数のファイル/行を読み込むこともできます。

```sql
INSERT INTO laion_5b_100m SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/laion-5b/laion5b_100m_part_1_of_10.parquet');
INSERT INTO laion_5b_100m SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/laion-5b/laion5b_100m_part_2_of_10.parquet');
⋮
```

### ブルートフォースベクトル類似性検索の実行 {#run-a-brute-force-vector-similarity-search}

KNN(k近傍法)検索またはブルートフォース検索は、データセット内の各ベクトルと検索埋め込みベクトルとの距離を計算し、その距離を順序付けして最近傍を取得する手法です。データセット自体のベクトルの1つを検索ベクトルとして使用できます。例えば:

```sql title="クエリ"
SELECT id, url
FROM laion_5b_100m
ORDER BY cosineDistance( vector, (SELECT vector FROM laion_5b_100m WHERE id = 9999) ) ASC
LIMIT 20

id = 9999の行のベクトルは、デリレストランの画像の埋め込みベクトルです。
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
```

#highlight-next-line
20 rows in set. Elapsed: 3.968 sec. Processed 100.38 million rows, 320.81 GB (25.30 million rows/s., 80.84 GB/s.)

````

クエリのレイテンシを記録しておき、ANN（ベクトルインデックス使用時）のクエリレイテンシと比較できるようにします。
1億行のデータでは、ベクトルインデックスを使用しない上記のクエリは完了までに数秒から数分かかる可能性があります。

### ベクトル類似度インデックスの構築 {#build-vector-similarity-index}

以下のSQLを実行して、`laion_5b_100m`テーブルの`vector`列にベクトル類似度インデックスを定義し構築します:

```sql
ALTER TABLE laion_5b_100m ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 768, 'bf16', 64, 512);

ALTER TABLE laion_5b_100m MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
````

インデックス作成と検索のパラメータおよびパフォーマンスに関する考慮事項については、[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)を参照してください。
上記のステートメントでは、HNSWハイパーパラメータ`M`と`ef_construction`にそれぞれ64と512の値を使用しています。
ユーザーは、インデックス構築時間と検索結果の品質を評価し、選択した値に応じてこれらのパラメータの最適な値を慎重に選択する必要があります。

1億件の完全なデータセットに対するインデックスの構築と保存は、利用可能なCPUコア数とストレージ帯域幅によっては数時間かかる場合があります。

### ANN検索の実行 {#perform-ann-search}

ベクトル類似度インデックスが構築されると、ベクトル検索クエリは自動的にインデックスを使用します:

```sql title="Query"
SELECT id, url
FROM laion_5b_100m
ORDER BY cosineDistance( vector, (SELECT vector FROM laion_5b_100m WHERE id = 9999) ) ASC
LIMIT 20

```

ベクトルインデックスの初回メモリロードには数秒から数分かかる場合があります。

### 検索クエリの埋め込みベクトル生成 {#generating-embeddings-for-search-query}

`LAION 5b`データセットの埋め込みベクトルは、`OpenAI CLIP`モデル`ViT-L/14`を使用して生成されました。

以下に、`CLIP` APIを使用してプログラムで埋め込みベクトルを生成する方法を示すPythonスクリプトの例を示します。検索用の埋め込みベクトルは、`SELECT`クエリ内の[`cosineDistance()`](/sql-reference/functions/distance-functions#cosineDistance)関数の引数として渡されます。

`clip`パッケージをインストールするには、[OpenAI GitHubリポジトリ](https://github.com/openai/clip)を参照してください。

```python
import torch
import clip
import numpy as np
import sys
import clickhouse_connect

device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-L/14", device=device)

```


# 犬と猫の両方が含まれる画像を検索

text = clip.tokenize(["a dog and a cat"]).to(device)

with torch.no_grad():
text_features = model.encode_text(text)
np_arr = text_features.detach().cpu().numpy()

    # ここでClickHouseの認証情報を渡す
    chclient = clickhouse_connect.get_client()

    params = {'v1': list(np_arr[0])}
    result = chclient.query("SELECT id, url FROM laion_5b_100m ORDER BY cosineDistance(vector, %(v1)s) LIMIT 100",
                            parameters=params)

    # 結果をブラウザで開けるシンプルなHTMLページに書き出す。一部のURLは無効になっている可能性がある。
    print("<html>")
    for r in result.result_rows:
        print("<img src = ", r[1], 'width="200" height="200">')
    print("</html>")

```

The result of the above search is shown below:

<Image img={search_results_image} alt="ベクトル類似度検索結果" size="md"/>

</VerticalStepper>
```
