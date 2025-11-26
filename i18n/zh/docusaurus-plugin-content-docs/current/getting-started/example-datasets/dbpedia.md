---
description: '包含 100 万篇来自维基百科的文章及其向量嵌入的数据集'
sidebar_label: 'dbpedia 数据集'
slug: /getting-started/example-datasets/dbpedia-dataset
title: 'dbpedia 数据集'
keywords: ['语义搜索', '向量相似度', '近似最近邻', '嵌入']
doc_type: 'guide'
---

[dbpedia 数据集](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M) 包含 100 万篇来自维基百科的文章以及使用 OpenAI 的 [text-embedding-3-large](https://platform.openai.com/docs/models/text-embedding-3-large) 模型生成的向量嵌入。

该数据集是理解向量嵌入、向量相似度搜索和生成式 AI 的理想入门数据集。我们使用该数据集在 ClickHouse 中演示[近似最近邻搜索](../../engines/table-engines/mergetree-family/annindexes.md)，以及一个简单但功能强大的问答（Q&A）应用。



## 数据集详情 {#dataset-details}

该数据集包含 26 个位于 [huggingface.co](https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/) 上的 `Parquet` 文件。文件命名为 `0.parquet`、`1.parquet`、...、`25.parquet`。要查看该数据集的一些示例数据行，请访问此 [Hugging Face 页面](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M)。



## 创建表

创建 `dbpedia` 表用于存储文章 ID、标题、正文和嵌入向量：

```sql
CREATE TABLE dbpedia
(
  id      String,
  title   String,
  text    String,
  vector  Array(Float32) CODEC(NONE)
) ENGINE = MergeTree ORDER BY (id);

```


## 加载表

要从所有 Parquet 文件中加载整个数据集，请运行以下 Shell 命令：

```shell
$ seq 0 25 | xargs -P1 -I{} clickhouse client -q "INSERT INTO dbpedia SELECT _id, title, text, \"text-embedding-3-large-1536-embedding\" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/{}.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;"
```

或者，也可以像下面这样分别运行 SQL 语句，逐个加载这 25 个 Parquet 文件：

```sql
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/0.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/1.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
...
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/25.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;

```

确认 `dbpedia` 表中已包含 100 万行数据：

```sql
SELECT count(*)
FROM dbpedia

   ┌─count()─┐
1. │ 1000000 │
   └─────────┘
```


## 语义搜索 {#semantic-search}

推荐阅读：["向量嵌入" OpenAI 指南](https://platform.openai.com/docs/guides/embeddings)

使用向量嵌入进行语义搜索（也称为 _similarity search_，即相似度搜索）通常包括以下步骤：

- 接收用户以自然语言输入的搜索查询，例如 _"Tell me about some scenic rail journeys”_、_“Suspense novels set in Europe”_ 等
- 使用 LLM 模型为该搜索查询生成向量嵌入
- 在数据集中查找与该查询向量嵌入最近邻的向量

_最近邻_ 指的是与用户查询最相关的文档、图像或其他内容。
检索到的结果是生成式 AI 应用中检索增强生成（RAG）的关键输入。



## 运行穷举式向量相似度搜索

KNN（k-近邻）搜索或穷举（暴力）搜索，是指计算数据集中每个向量到查询嵌入向量的距离，然后对这些距离进行排序以获得最近邻。对于 `dbpedia` 数据集，一个快速、直观地观察语义搜索效果的技巧，是使用数据集本身的嵌入向量作为查询向量。例如：

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
返回 20 行。用时:0.261 秒。已处理 100 万行,6.22 GB(384 万行/秒,23.81 GB/秒)
```

记下查询延迟，以便我们可以将其与 ANN（使用向量索引）的查询延迟进行比较。
同时在操作系统文件缓存处于冷缓存状态以及设置 `max_threads=1` 的情况下记录查询延迟，以便衡量实际的计算资源使用和存储带宽使用情况（并将结果外推到包含数百万向量的生产数据集！）


## 构建向量相似度索引

运行以下 SQL，在 `vector` 列上定义并构建向量相似度索引：

```sql
ALTER TABLE dbpedia ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 1536, 'bf16', 64, 512);

ALTER TABLE dbpedia MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

有关索引创建和搜索的参数及性能方面的注意事项，请参阅[文档](../../engines/table-engines/mergetree-family/annindexes.md)。

根据可用 CPU 核心数量和存储带宽的不同，构建并保存索引可能需要几分钟时间。


## 执行 ANN 搜索

*Approximate Nearest Neighbours*（近似最近邻，ANN）指一类技术（例如使用图或随机森林等特殊数据结构），可以比精确向量搜索更快地计算结果。其结果精度通常在实际使用中已经“足够好”。许多近似技术提供参数，可用于在结果精度和搜索时间之间进行权衡。

一旦构建好向量相似度索引，向量搜索查询将会自动使用该索引：

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
返回 20 行。用时:0.025 秒。已处理 3.203 万行,2.10 MB(129 万行/秒,84.80 MB/秒)。
```


## 为搜索查询生成嵌入向量

目前为止看到的相似度搜索查询，是使用 `dbpedia` 表中已有的某个向量作为搜索向量。在实际应用中，搜索向量需要根据用户输入的查询（可能是自然语言）生成。搜索向量必须使用与为数据集生成嵌入向量时相同的 LLM 模型来生成。

下面给出一个示例 Python 脚本，用于演示如何以编程方式调用 OpenAI API，使用 `text-embedding-3-large` 模型生成嵌入向量。然后，将生成的搜索嵌入向量作为参数传递给 `SELECT` 查询中的 `cosineDistance()` 函数。

运行该脚本需要在环境变量 `OPENAI_API_KEY` 中设置 OpenAI API 密钥。注册 [https://platform.openai.com](https://platform.openai.com) 后即可获取 OpenAI API 密钥。

```python
import sys
from openai import OpenAI
import clickhouse_connect

ch_client = clickhouse_connect.get_client(compress=False) # 传入 ClickHouse 凭据
openai_client = OpenAI() # 设置 OPENAI_API_KEY 环境变量

def get_embedding(text, model):
  text = text.replace("\n", " ")
  return openai_client.embeddings.create(input = [text], model=model, dimensions=1536).data[0].embedding


while True:
    # 接受用户输入的搜索查询
    print("请输入搜索查询:")
    input_query = sys.stdin.readline();

    # 调用 OpenAI API 端点获取嵌入向量
    print("正在生成嵌入向量:", input_query);
    embedding = get_embedding(input_query,
                              model='text-embedding-3-large')

    # 在 ClickHouse 中执行向量搜索查询
    print("正在查询 ClickHouse...")
    params = {'v1':embedding, 'v2':10}
    result = ch_client.query("SELECT id,title,text FROM dbpedia ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

    for row in result.result_rows:
        print(row[0], row[1], row[2])
        print("---------------")
```


## 问答演示应用程序

上面的示例展示了使用 ClickHouse 进行语义搜索和文档检索。接下来将介绍一个非常简单但潜力很大的生成式 AI 示例应用程序。

该应用程序执行以下步骤：

1. 接收来自用户的一个*主题*作为输入
2. 通过调用使用 `text-embedding-3-large` 模型的 OpenAI API，为该*主题*生成一个嵌入向量
3. 在 `dbpedia` 表上使用向量相似度搜索，检索与之高度相关的维基百科（Wikipedia）文章/文档
4. 接收用户针对该*主题*的自然语言自由形式问题
5. 使用 OpenAI 的 `gpt-3.5-turbo` Chat API，基于在步骤 3 中检索到的文档中的知识回答该问题。\
   在步骤 3 中检索到的文档会作为*上下文*传递给 Chat API，它们是生成式 AI 中的关键纽带。

下面首先列出运行该问答应用程序得到的几段对话示例，随后给出该问答应用程序的代码。运行该应用程序需要在环境变量 `OPENAI_API_KEY` 中设置一个 OpenAI API 密钥。注册 [https://platform.openai.com](https://platform.openai.com) 后即可获取 OpenAI API 密钥。

```shell
$ python3 QandA.py

Enter a topic : FIFA world cup 1990
正在为“FIFA world cup 1990”生成嵌入向量，并从 ClickHouse 中收集与其相关的 100 篇文章……

Enter your question : Who won the golden boot
意大利球员 Salvatore Schillaci 在 1990 年 FIFA 世界杯上获得了金靴奖。

Enter a topic : Cricket world cup
正在为“Cricket world cup”生成嵌入向量，并从 ClickHouse 中收集与其相关的 100 篇文章……

Enter your question : Which country has hosted the world cup most times
英格兰和威尔士主办板球世界杯的次数最多，该赛事在这两个国家共举办了五次——1975、1979、1983、1999 和 2019 年。

$
```

代码：

```Python
import sys
import time
from openai import OpenAI
import clickhouse_connect

ch_client = clickhouse_connect.get_client(compress=False) # 在此处传入 ClickHouse 凭据
openai_client = OpenAI() # 请设置环境变量 OPENAI_API_KEY

def get_embedding(text, model):
  text = text.replace("\n", " ")
  return openai_client.embeddings.create(input = [text], model=model, dimensions=1536).data[0].embedding

while True:
    # 从用户获取感兴趣的主题
    print("请输入主题：", end="", flush=True)
    input_query = sys.stdin.readline()
    input_query = input_query.rstrip()

    # 为搜索主题生成嵌入向量并在 ClickHouse 中执行查询
    print("Generating the embedding for '" + input_query + "' and collecting 100 articles related to it from ClickHouse...");
    embedding = get_embedding(input_query,
                              model='text-embedding-3-large')

    params = {'v1':embedding, 'v2':100}
    result = ch_client.query("SELECT id,title,text FROM dbpedia ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

    # 收集所有匹配的文章/文档
    results = ""
    for row in result.result_rows:
        results = results + row[2]

    print("\n请输入你的问题：", end="", flush=True)
    question = sys.stdin.readline();

    # 为 OpenAI Chat API 构造提示词
    query = f"""使用以下内容回答后面的问题。如果找不到答案，请输出 "I don't know."

内容:
\"\"\"
{results}
\"\"\"

问题：{question}"""

    GPT_MODEL = "gpt-3.5-turbo"
    response = openai_client.chat.completions.create(
        messages=[
        {'role': 'system', 'content': "你将回答关于 {input_query} 的问题。"},
        {'role': 'user', 'content': query},
       ],
       model=GPT_MODEL,
       temperature=0,
    )

    # 输出该问题的答案！
    print(response.choices[0].message.content)
    print("\n")
```
