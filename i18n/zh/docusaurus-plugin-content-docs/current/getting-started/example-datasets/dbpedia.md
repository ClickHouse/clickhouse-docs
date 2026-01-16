---
description: '包含来自维基百科的 100 万篇文章及其向量嵌入的数据集'
sidebar_label: 'dbpedia 数据集'
slug: /getting-started/example-datasets/dbpedia-dataset
title: 'dbpedia 数据集'
keywords: ['语义搜索', '向量相似搜索', '近似最近邻', '嵌入']
doc_type: 'guide'
---

[dbpedia 数据集](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M) 包含来自维基百科的 100 万篇文章，以及使用 OpenAI 的 [text-embedding-3-large](https://platform.openai.com/docs/models/text-embedding-3-large) 模型生成的向量嵌入。

该数据集是理解向量嵌入、向量相似搜索和生成式 AI 的优秀入门数据集。我们使用该数据集来演示 ClickHouse 中的[近似最近邻搜索](../../engines/table-engines/mergetree-family/annindexes.md)，以及一个简单但功能强大的问答应用。

## 数据集详情 \\{#dataset-details\\}

该数据集包含位于 [huggingface.co](https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/) 上的 26 个 `Parquet` 文件。文件名为 `0.parquet`、`1.parquet`、...、`25.parquet`。要查看该数据集的一些示例记录，请访问此 [Hugging Face 页面](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M)。

## 创建表 \\{#create-table\\}

创建 `dbpedia` 表，用于存储文章 ID、标题、正文和嵌入向量：

```sql
CREATE TABLE dbpedia
(
  id      String,
  title   String,
  text    String,
  vector  Array(Float32) CODEC(NONE)
) ENGINE = MergeTree ORDER BY (id);

```

## 加载表数据 \\{#load-table\\}

要从所有 Parquet 文件中加载数据集，请运行以下 shell 命令：

```shell
for i in $(seq 0 25); do
  echo "Processing file ${i}..."
  clickhouse client -q "INSERT INTO dbpedia SELECT _id, title, text, \"text-embedding-3-large-1536-embedding\" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/${i}.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;"
  echo "File ${i} complete."
done
```

另外，也可以按下方所示分别运行 SQL 语句，来加载这 25 个 Parquet 文件中的每一个：

```sql
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/0.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/1.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
...
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/25.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;

```

确认 `dbpedia` 表中已有 100 万行数据：

```sql
SELECT count(*)
FROM dbpedia

   ┌─count()─┐
1. │ 1000000 │
   └─────────┘
```

## 语义搜索 \\{#semantic-search\\}

推荐阅读：["Vector embeddings" OpenAPI 指南](https://platform.openai.com/docs/guides/embeddings)

使用向量嵌入进行语义搜索（也称为 _similarity search_，相似度搜索）通常包括以下步骤：

- 接收用户用自然语言提出的搜索查询，例如 _"Tell me about some scenic rail journeys”_、_“Suspense novels set in Europe”_ 等
- 使用 LLM 模型为该搜索查询生成嵌入向量
- 在数据集中查找与该搜索嵌入向量最接近的最近邻

_最近邻_ 指的是与用户查询最相关的文档、图像或其他内容。
检索结果是生成式 AI 应用中 RAG（检索增强生成，Retrieval Augmented Generation）的关键输入。

## 运行暴力向量相似度搜索 \\{#run-a-brute-force-vector-similarity-search\\}

KNN（k 近邻）搜索或暴力搜索是指计算数据集中每个向量与搜索嵌入向量之间的距离，然后对这些距离进行排序以获得最近邻。使用 `dbpedia` 数据集时，一种快速、直观地观察语义搜索效果的方法，是直接使用数据集本身的嵌入向量作为搜索向量。例如：

```sql title="Query"
SELECT id, title
FROM dbpedia
ORDER BY cosineDistance(vector, ( SELECT vector FROM dbpedia WHERE id = '<dbpedia:The_Remains_of_the_Day>') ) ASC
LIMIT 20
```

```response title="Response"
    ┌─id────────────────────────────────────────┬─title───────────────────────────┐
 1. │ <dbpedia:The_Remains_of_the_Day>          │ The Remains of the Day          │
 2. │ <dbpedia:The_Remains_of_the_Day_(film)>   │ The Remains of the Day (film)   │
 3. │ <dbpedia:Never_Let_Me_Go_(novel)>         │ Never Let Me Go (novel)         │
 4. │ <dbpedia:Last_Orders>                     │ Last Orders                     │
 5. │ <dbpedia:The_Unconsoled>                  │ The Unconsoled                  │
 6. │ <dbpedia:The_Hours_(novel)>               │ The Hours (novel)               │
 7. │ <dbpedia:An_Artist_of_the_Floating_World> │ An Artist of the Floating World │
 8. │ <dbpedia:Heat_and_Dust>                   │ Heat and Dust                   │
 9. │ <dbpedia:A_Pale_View_of_Hills>            │ A Pale View of Hills            │
10. │ <dbpedia:Howards_End_(film)>              │ Howards End (film)              │
11. │ <dbpedia:When_We_Were_Orphans>            │ When We Were Orphans            │
12. │ <dbpedia:A_Passage_to_India_(film)>       │ A Passage to India (film)       │
13. │ <dbpedia:Memoirs_of_a_Survivor>           │ Memoirs of a Survivor           │
14. │ <dbpedia:The_Child_in_Time>               │ The Child in Time               │
15. │ <dbpedia:The_Sea,_the_Sea>                │ The Sea, the Sea                │
16. │ <dbpedia:The_Master_(novel)>              │ The Master (novel)              │
17. │ <dbpedia:The_Memorial>                    │ The Memorial                    │
18. │ <dbpedia:The_Hours_(film)>                │ The Hours (film)                │
19. │ <dbpedia:Human_Remains_(film)>            │ Human Remains (film)            │
20. │ <dbpedia:Kazuo_Ishiguro>                  │ Kazuo Ishiguro                  │
    └───────────────────────────────────────────┴─────────────────────────────────┘
#highlight-next-line
20 rows in set. Elapsed: 0.261 sec. Processed 1.00 million rows, 6.22 GB (3.84 million rows/s., 23.81 GB/s.)
```

记下查询延迟，以便后续与 ANN（基于向量索引）的查询延迟进行比较。
同时分别记录在 OS 文件缓存为冷状态时，以及在将 `max_threads` 设置为 1 时的查询延迟，以识别实际的计算资源占用和存储带宽使用情况（从而可以将结果推算到包含数百万向量的生产数据集！）

## 构建向量相似度索引 \\{#build-vector-similarity-index\\}

运行以下 SQL，在 `vector` 列上定义并构建向量相似度索引：

```sql
ALTER TABLE dbpedia ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 1536, 'bf16', 64, 512);

ALTER TABLE dbpedia MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

索引创建和搜索的参数及性能方面的考虑在[文档](../../engines/table-engines/mergetree-family/annindexes.md)中有详细说明。

根据可用 CPU 核心数量和存储带宽的不同，构建并保存索引可能需要几分钟时间。

## 执行 ANN 搜索 \\{#perform-ann-search\\}

*Approximate Nearest Neighbours*（近似最近邻，ANN）指一类技术（例如采用图结构、随机森林等特殊数据结构），可以比精确向量搜索更快地计算结果。结果的准确度通常在实际使用中已经“足够好”。许多近似算法提供参数，用于在结果准确度和搜索时间之间进行权衡和调优。

一旦向量相似度索引构建完成，向量搜索查询将会自动使用该索引：

```sql title="Query"
SELECT
    id,
    title
FROM dbpedia
ORDER BY cosineDistance(vector, (
        SELECT vector
        FROM dbpedia
        WHERE id = '<dbpedia:Glacier_Express>'
    )) ASC
LIMIT 20
```

```response title="Response"
    ┌─id──────────────────────────────────────────────┬─title─────────────────────────────────┐
 1. │ <dbpedia:Glacier_Express>                       │ Glacier Express                       │
 2. │ <dbpedia:BVZ_Zermatt-Bahn>                      │ BVZ Zermatt-Bahn                      │
 3. │ <dbpedia:Gornergrat_railway>                    │ Gornergrat railway                    │
 4. │ <dbpedia:RegioExpress>                          │ RegioExpress                          │
 5. │ <dbpedia:Matterhorn_Gotthard_Bahn>              │ Matterhorn Gotthard Bahn              │
 6. │ <dbpedia:Rhaetian_Railway>                      │ Rhaetian Railway                      │
 7. │ <dbpedia:Gotthard_railway>                      │ Gotthard railway                      │
 8. │ <dbpedia:Furka–Oberalp_railway>                 │ Furka–Oberalp railway                 │
 9. │ <dbpedia:Jungfrau_railway>                      │ Jungfrau railway                      │
10. │ <dbpedia:Monte_Generoso_railway>                │ Monte Generoso railway                │
11. │ <dbpedia:Montreux–Oberland_Bernois_railway>     │ Montreux–Oberland Bernois railway     │
12. │ <dbpedia:Brienz–Rothorn_railway>                │ Brienz–Rothorn railway                │
13. │ <dbpedia:Lauterbrunnen–Mürren_mountain_railway> │ Lauterbrunnen–Mürren mountain railway │
14. │ <dbpedia:Luzern–Stans–Engelberg_railway_line>   │ Luzern–Stans–Engelberg railway line   │
15. │ <dbpedia:Rigi_Railways>                         │ Rigi Railways                         │
16. │ <dbpedia:Saint-Gervais–Vallorcine_railway>      │ Saint-Gervais–Vallorcine railway      │
17. │ <dbpedia:Gatwick_Express>                       │ Gatwick Express                       │
18. │ <dbpedia:Brünig_railway_line>                   │ Brünig railway line                   │
19. │ <dbpedia:Regional-Express>                      │ Regional-Express                      │
20. │ <dbpedia:Schynige_Platte_railway>               │ Schynige Platte railway               │
    └─────────────────────────────────────────────────┴───────────────────────────────────────┘
#highlight-next-line
20 rows in set. Elapsed: 0.025 sec. Processed 32.03 thousand rows, 2.10 MB (1.29 million rows/s., 84.80 MB/s.)
```

## 为搜索查询生成嵌入向量 \\{#generating-embeddings-for-search-query\\}

目前为止看到的相似度搜索查询，都是使用 `dbpedia` 表中已有的向量之一作为搜索向量。在实际应用中，需要根据用户输入的查询（可能是自然语言）来生成搜索向量。搜索向量应当使用与为数据集生成嵌入向量时相同的 LLM 模型生成。

下面给出一个示例 Python 脚本，用于演示如何以编程方式调用 OpenAI API，使用 `text-embedding-3-large` 模型生成嵌入向量。生成的搜索嵌入向量随后作为参数传递给 `SELECT` 查询中的 `cosineDistance()` 函数。

运行该脚本需要在环境变量 `OPENAI_API_KEY` 中设置 OpenAI API 密钥。注册 [https://platform.openai.com](https://platform.openai.com) 后即可获取 OpenAI API 密钥。

```python
import sys
from openai import OpenAI
import clickhouse_connect

ch_client = clickhouse_connect.get_client(compress=False) # Pass ClickHouse credentials
openai_client = OpenAI() # Set OPENAI_API_KEY environment variable

def get_embedding(text, model):
  text = text.replace("\n", " ")
  return openai_client.embeddings.create(input = [text], model=model, dimensions=1536).data[0].embedding


while True:
    # Accept the search query from user
    print("Enter a search query :")
    input_query = sys.stdin.readline();

    # Call OpenAI API endpoint to get the embedding
    print("Generating the embedding for ", input_query);
    embedding = get_embedding(input_query,
                              model='text-embedding-3-large')

    # Execute vector search query in ClickHouse
    print("Querying clickhouse...")
    params = {'v1':embedding, 'v2':10}
    result = ch_client.query("SELECT id,title,text FROM dbpedia ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

    for row in result.result_rows:
        print(row[0], row[1], row[2])
        print("---------------")
```

## 问答演示应用 \\{#q-and-a-demo-application\\}

上面的示例演示了使用 ClickHouse 进行语义搜索和文档检索。下面将介绍一个非常简单但具有巨大潜力的生成式 AI 示例应用。

该应用执行以下步骤：

1. 接收用户输入的一个*主题*
2. 通过调用 OpenAI 提供的 `text-embedding-3-large` 模型 API，为该*主题*生成一个嵌入向量
3. 在 `dbpedia` 表上使用向量相似度搜索，检索与之高度相关的 Wikipedia 文章/文档
4. 接收用户输入的与该*主题*相关的自然语言开放式问题
5. 使用 OpenAI 的 `gpt-3.5-turbo` Chat API，根据第 3 步检索到的文档中的知识回答该问题。
   第 3 步检索到的文档作为*上下文*传递给 Chat API，是生成式 AI 中的关键纽带。

下面先给出运行该问答应用时的一些示例对话，然后是该问答应用的代码。
运行该应用需要在环境变量 `OPENAI_API_KEY` 中设置一个 OpenAI API 密钥。
在 [https://platform.openai.com](https://platform.openai.com) 注册后即可获取 OpenAI API 密钥。

```shell
$ python3 QandA.py

Enter a topic : FIFA world cup 1990
Generating the embedding for 'FIFA world cup 1990' and collecting 100 articles related to it from ClickHouse...

Enter your question : Who won the golden boot
Salvatore Schillaci of Italy won the Golden Boot at the 1990 FIFA World Cup.


Enter a topic : Cricket world cup
Generating the embedding for 'Cricket world cup' and collecting 100 articles related to it from ClickHouse...

Enter your question : Which country has hosted the world cup most times
England and Wales have hosted the Cricket World Cup the most times, with the tournament being held in these countries five times - in 1975, 1979, 1983, 1999, and 2019.

$
```

代码：

```Python
import sys
import time
from openai import OpenAI
import clickhouse_connect

ch_client = clickhouse_connect.get_client(compress=False) # Pass ClickHouse credentials here
openai_client = OpenAI() # Set the OPENAI_API_KEY environment variable

def get_embedding(text, model):
  text = text.replace("\n", " ")
  return openai_client.embeddings.create(input = [text], model=model, dimensions=1536).data[0].embedding

while True:
    # Take the topic of interest from user
    print("Enter a topic : ", end="", flush=True)
    input_query = sys.stdin.readline()
    input_query = input_query.rstrip()

    # Generate an embedding vector for the search topic and query ClickHouse
    print("Generating the embedding for '" + input_query + "' and collecting 100 articles related to it from ClickHouse...");
    embedding = get_embedding(input_query,
                              model='text-embedding-3-large')

    params = {'v1':embedding, 'v2':100}
    result = ch_client.query("SELECT id,title,text FROM dbpedia ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

    # Collect all the matching articles/documents
    results = ""
    for row in result.result_rows:
        results = results + row[2]

    print("\nEnter your question : ", end="", flush=True)
    question = sys.stdin.readline();

    # Prompt for the OpenAI Chat API
    query = f"""Use the below content to answer the subsequent question. If the answer cannot be found, write "I don't know."

Content:
\"\"\"
{results}
\"\"\"

Question: {question}"""

    GPT_MODEL = "gpt-3.5-turbo"
    response = openai_client.chat.completions.create(
        messages=[
        {'role': 'system', 'content': "You answer questions about {input_query}."},
        {'role': 'user', 'content': query},
       ],
       model=GPT_MODEL,
       temperature=0,
    )

    # Print the answer to the question!
    print(response.choices[0].message.content)
    print("\n")
```
