---
'description': '数据集包含来自 LAION 5B 数据集的 1 亿个向量'
'sidebar_label': 'LAION 5B 数据集'
'slug': '/getting-started/example-datasets/laion-5b-dataset'
'title': 'LAION 5B 数据集'
'keywords':
- 'semantic search'
- 'vector similarity'
- 'approximate nearest neighbours'
- 'embeddings'
'doc_type': 'reference'
---

import search_results_image from '@site/static/images/getting-started/example-datasets/laion5b_visualization_1.png'
import Image from '@theme/IdealImage';

## 介绍 {#introduction}

[LAION 5b 数据集](https://laion.ai/blog/laion-5b/) 包含 58.5 亿个图像-文本嵌入和相关的图像元数据。嵌入是使用 `Open AI CLIP` 模型 [ViT-L/14](https://huggingface.co/sentence-transformers/clip-ViT-L-14) 生成的。每个嵌入向量的维度是 `768`。

该数据集可用于大型实际向量搜索应用程序的设计、大小和性能方面建模。该数据集可用于文本到图像搜索和图像到图像搜索。

## 数据集细节 {#dataset-details}

完整的数据集以 `npy` 和 `Parquet` 文件的混合形式在 [the-eye.eu](https://the-eye.eu/public/AI/cah/laion5b/) 提供。

ClickHouse 已在 `S3` 桶中提供了 1 亿个向量的子集。该 `S3` 桶包含 10 个 `Parquet` 文件，每个 `Parquet` 文件填充了 1000 万行。

我们建议用户首先运行一个规模评估练习，通过参考 [文档](../../engines/table-engines/mergetree-family/annindexes.md) 来估算该数据集的存储和内存要求。

## 步骤 {#steps}

<VerticalStepper headerLevel="h3">

### 创建表 {#create-table}

创建 `laion_5b_100m` 表以存储嵌入及其相关属性：

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

`id` 只是一个递增的整数。其他属性可以用于谓词，以理解结合后过滤/前过滤的向量相似性搜索，如 [文档](../../engines/table-engines/mergetree-family/annindexes.md) 中所述。

### 加载数据 {#load-table}

要从所有 `Parquet` 文件加载数据集，运行以下 SQL 语句：

```sql
INSERT INTO laion_5b_100m SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/laion-5b/laion5b_100m_*.parquet');
```

将 1 亿行加载到表中可能需要几分钟。

或者，可以运行单独的 SQL 语句以加载特定数量的文件/行。

```sql
INSERT INTO laion_5b_100m SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/laion-5b/laion5b_100m_part_1_of_10.parquet');
INSERT INTO laion_5b_100m SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/laion-5b/laion5b_100m_part_2_of_10.parquet');
⋮
```

### 运行暴力向量相似性搜索 {#run-a-brute-force-vector-similarity-search}

KNN（k - 最近邻）搜索或暴力搜索涉及计算数据集中每个向量与搜索嵌入向量的距离，然后对距离进行排序以获取最近邻。我们可以使用数据集中的一个向量作为搜索向量。例如：

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

请注意查询延迟，以便我们可以将其与 ANN（使用向量索引）的查询延迟进行比较。对于 1 亿行，上述查询在没有向量索引的情况下可能需要几秒钟/几分钟才能完成。

### 构建向量相似性索引 {#build-vector-similarity-index}

运行以下 SQL 在 `laion_5b_100m` 表的 `vector` 列上定义并构建向量相似性索引：

```sql
ALTER TABLE laion_5b_100m ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 768, 'bf16', 64, 512);

ALTER TABLE laion_5b_100m MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

索引创建和搜索的参数以及性能考虑在 [文档](../../engines/table-engines/mergetree-family/annindexes.md) 中描述。上述语句分别使用 64 和 512 作为 HNSW 超参数 `M` 和 `ef_construction` 的值。用户需要通过评估索引构建时间和对应于所选值的搜索结果质量来仔细选择这些参数的最佳值。

构建和保存索引可能需要几个小时，具体取决于可用的 CPU 核心数量和存储带宽。

### 执行 ANN 搜索 {#perform-ann-search}

一旦构建了向量相似性索引，向量搜索查询将自动使用该索引：

```sql title="Query"
SELECT id, url 
FROM laion_5b_100m
ORDER BY cosineDistance( vector, (SELECT vector FROM laion_5b_100m WHERE id = 9999) ) ASC
LIMIT 20

```

第一次将向量索引加载到内存中可能需要几秒钟/几分钟。

### 为搜索查询生成嵌入 {#generating-embeddings-for-search-query}

`LAION 5b` 数据集嵌入向量是使用 `OpenAI CLIP` 模型 `ViT-L/14` 生成的。

下面提供了一个示例 Python 脚本，以演示如何使用 `CLIP` API 程序化生成嵌入向量。搜索嵌入向量随后作为参数传递给 `SELECT` 查询中的 [`cosineDistance()`](/sql-reference/functions/distance-functions#cosineDistance) 函数。

要安装 `clip` 包，请参阅 [OpenAI GitHub 库](https://github.com/openai/clip)。

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

上述搜索的结果如下所示：

<Image img={search_results_image} alt="向量相似性搜索结果" size="md"/>

</VerticalStepper>
