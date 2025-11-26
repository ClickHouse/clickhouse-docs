---
description: 'LAION 5B データセット由来の 1 億個のベクトルを含むデータセット'
sidebar_label: 'LAION 5B データセット'
slug: /getting-started/example-datasets/laion-5b-dataset
title: 'LAION 5B データセット'
keywords: ['セマンティック検索', 'ベクトル類似度', '近似最近傍探索', '埋め込み表現']
doc_type: 'guide'
---

import search_results_image from '@site/static/images/getting-started/example-datasets/laion5b_visualization_1.png'
import Image from '@theme/IdealImage';


## はじめに {#introduction}

[LAION 5b データセット](https://laion.ai/blog/laion-5b/) には、58.5 億件の画像とテキストの埋め込み表現と、
それに関連する画像メタデータが含まれています。これらの埋め込みは、`OpenAI CLIP` モデル [ViT-L/14](https://huggingface.co/sentence-transformers/clip-ViT-L-14) を用いて生成されています。
各埋め込みベクトルの次元数は `768` です。

このデータセットは、大規模な実運用レベルのベクター検索アプリケーションにおける設計、サイジング、および
パフォーマンス面を検討・評価するために利用できます。テキストから画像への検索と
画像から画像への検索の両方に使用できます。



## データセットの詳細 {#dataset-details}

完全なデータセットは、`npy` と `Parquet` ファイルの組み合わせとして [the-eye.eu](https://the-eye.eu/public/AI/cah/laion5b/) から利用できます。

ClickHouse は、1 億個のベクトルからなるサブセットを `S3` バケットで提供しています。
この `S3` バケットには 10 個の `Parquet` ファイルが含まれており、各 `Parquet` ファイルには 1,000 万行が格納されています。

このデータセットのストレージおよびメモリ要件を見積もるために、まず [ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md) を参照しながらサイジングを行うことを推奨します。



## 手順 {#steps}

<VerticalStepper headerLevel="h3">

### テーブルを作成する {#create-table}

埋め込みとそれに関連する属性を保存するための `laion_5b_100m` テーブルを作成します。

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

`id` は単にインクリメントされる整数です。追加の属性は、[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)で説明されているように、事後フィルタリング／事前フィルタリングと組み合わせたベクトル類似検索を理解するためのクエリ述語として利用できます。

### データをロードする {#load-table}

すべての `Parquet` ファイルからデータセットをロードするには、次の SQL ステートメントを実行します。

```sql
INSERT INTO laion_5b_100m SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/laion-5b/laion5b_100m_*.parquet');
```

1億行をテーブルにロードする処理には、数分かかります。

または、個別の SQL ステートメントを実行して、特定の数のファイル／行だけをロードすることもできます。

```sql
INSERT INTO laion_5b_100m SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/laion-5b/laion5b_100m_part_1_of_10.parquet');
INSERT INTO laion_5b_100m SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/laion-5b/laion5b_100m_part_2_of_10.parquet');
⋮
```

### 総当たりのベクトル類似検索を実行する {#run-a-brute-force-vector-similarity-search}

KNN（k-Nearest Neighbours）検索または総当たり検索では、データセット内の各ベクトルと検索用の埋め込みベクトルとの距離を計算し、その距離で並べ替えることで最近傍を取得します。検索ベクトルとして、データセット内のベクトルの1つを利用できます。例えば、次のようになります。

```sql title="Query"
SELECT id, url
FROM laion_5b_100m
ORDER BY cosineDistance( vector, (SELECT vector FROM laion_5b_100m WHERE id = 9999) ) ASC
LIMIT 20

id = 9999 の行にあるベクトルは、デリレストランの画像に対応する埋め込みです。
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
20 行が結果セットに含まれます。経過時間: 3.968 秒。処理: 1.0038 億行、320.81 GB（2530 万行/秒、80.84 GB/秒）。

````

クエリのレイテンシを記録し、ANN（ベクトルインデックス使用時）のクエリレイテンシと比較できるようにします。
1億行のデータに対して、ベクトルインデックスなしで上記のクエリを実行すると、完了までに数秒から数分かかる場合があります。

### ベクトル類似度インデックスの構築                                 

以下のSQLを実行して、`laion_5b_100m`テーブルの`vector`カラムにベクトル類似度インデックスを定義および構築します：

```sql
ALTER TABLE laion_5b_100m ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 768, 'bf16', 64, 512);

ALTER TABLE laion_5b_100m MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
````

インデックスの作成および検索に関するパラメータとパフォーマンス上の考慮事項については、[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)で説明されています。
前述のステートメントでは、HNSW のハイパーパラメータ `M` と `ef_construction` に対して、それぞれ 64 と 512 の値を使用しています。
ユーザーは、インデックス構築時間と検索結果の品質を評価しつつ、これらのパラメータの最適な値を慎重に選定する必要があります。

利用可能な CPU コア数やストレージ帯域幅によっては、1 億件の全データセットに対するインデックスの構築と保存に数時間かかる場合もあります。

### ANN 検索を実行する

ベクトル類似度インデックスが構築されると、ベクトル検索クエリは自動的にそのインデックスを利用します。

```sql title="Query"
SELECT id, url 
FROM laion_5b_100m
ORDER BY cosineDistance( vector, (SELECT vector FROM laion_5b_100m WHERE id = 9999) ) ASC
LIMIT 20

```

ベクターインデックスをメモリに初回ロードする際には、数秒から数分かかる場合があります。

### 検索クエリ用の埋め込みを生成する

`LAION 5b` データセットの埋め込みベクトルは、`OpenAI CLIP` モデル `ViT-L/14` を使用して生成されました。

以下に、`CLIP` API を使用してプログラムから埋め込みベクトルを生成する方法を示す Python スクリプトの例を示します。検索用の埋め込みベクトルは、その後 `SELECT` クエリ内の [`cosineDistance()`](/sql-reference/functions/distance-functions#cosineDistance) 関数に引数として渡されます。

`clip` パッケージのインストール方法については、[OpenAI GitHub リポジトリ](https://github.com/openai/clip) を参照してください。

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

    # 結果をブラウザで開けるシンプルなHTMLページに書き込む。一部のURLは無効になっている可能性がある。
    print("<html>")
    for r in result.result_rows:
        print("<img src = ", r[1], 'width="200" height="200">')
    print("</html>")

```

上記の検索結果は以下の通りです:

<Image img={search_results_image} alt="ベクトル類似度検索結果" size="md"/>

</VerticalStepper>
```
