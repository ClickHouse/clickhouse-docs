---
description: '包含来自 Wikipedia 的 100 万篇文章及其向量嵌入的数据集'
sidebar_label: 'dbpedia 数据集'
slug: /getting-started/example-datasets/dbpedia-dataset
title: 'dbpedia 数据集'
keywords: ['semantic search', 'vector similarity', 'approximate nearest neighbours', 'embeddings']
doc_type: 'guide'
---

[dbpedia 数据集](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M) 包含来自 Wikipedia 的 100 万篇文章，以及使用 OpenAI 的 [text-embedding-3-large](https://platform.openai.com/docs/models/text-embedding-3-large) 模型生成的向量嵌入。

该数据集非常适合作为入门数据集，帮助理解向量嵌入、向量相似性搜索和生成式 AI。我们使用该数据集在 ClickHouse 中演示[近似最近邻搜索](../../engines/table-engines/mergetree-family/annindexes.md)，以及一个简单但功能强大的问答应用。



## 数据集详情 {#dataset-details}

该数据集包含 26 个 `Parquet` 文件,位于 [huggingface.co](https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/)。文件命名为 `0.parquet`、`1.parquet`、……、`25.parquet`。如需查看数据集的示例行,请访问此 [Hugging Face 页面](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M)。


## 创建表 {#create-table}

创建 `dbpedia` 表以存储文章 ID、标题、文本和嵌入向量：

```sql
CREATE TABLE dbpedia
(
  id      String,
  title   String,
  text    String,
  vector  Array(Float32) CODEC(NONE)
) ENGINE = MergeTree ORDER BY (id);

```


## 加载表 {#load-table}

要从所有 Parquet 文件加载数据集,请运行以下 shell 命令:

```shell
$ seq 0 25 | xargs -P1 -I{} clickhouse client -q "INSERT INTO dbpedia SELECT _id, title, text, \"text-embedding-3-large-1536-embedding\" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/{}.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;"
```

或者,也可以运行如下所示的单独 SQL 语句来逐个加载这 25 个 Parquet 文件:

```sql
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/0.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/1.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
...
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/25.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;

```

验证 `dbpedia` 表中是否包含 100 万行数据:

```sql
SELECT count(*)
FROM dbpedia

   ┌─count()─┐
1. │ 1000000 │
   └─────────┘
```


## 语义搜索 {#semantic-search}

推荐阅读：["向量嵌入" OpenAI 指南](https://platform.openai.com/docs/guides/embeddings)

使用向量嵌入的语义搜索（也称为_相似性搜索_）包括以下步骤：

- 接受用户以自然语言输入的搜索查询,例如 _"介绍一些风景优美的铁路旅程"_、_"以欧洲为背景的悬疑小说"_ 等
- 使用 LLM 模型为搜索查询生成嵌入向量
- 在数据集中查找与搜索嵌入向量最接近的邻近项

_最近邻_是指与用户查询相关的文档、图像或内容结果。检索到的结果是生成式 AI 应用中检索增强生成（RAG）的关键输入。


## 运行暴力向量相似度搜索 {#run-a-brute-force-vector-similarity-search}

KNN(k - 最近邻)搜索或暴力搜索需要计算数据集中每个向量到搜索嵌入向量的距离,然后对距离进行排序以获得最近邻。使用 `dbpedia` 数据集时,一种快速直观观察语义搜索效果的方法是使用数据集本身的嵌入向量作为搜索向量。例如:

```sql title="查询"
SELECT id, title
FROM dbpedia
ORDER BY cosineDistance(vector, ( SELECT vector FROM dbpedia WHERE id = '<dbpedia:The_Remains_of_the_Day>') ) ASC
LIMIT 20
```

```response title="响应"
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
返回 20 行。耗时:0.261 秒。处理了 100 万行,6.22 GB(384 万行/秒,23.81 GB/秒)
```

记录查询延迟,以便与 ANN(使用向量索引)的查询延迟进行比较。
同时记录冷操作系统文件缓存和 `max_threads=1` 情况下的查询延迟,以了解真实的计算资源使用量和存储带宽使用量(将其推算到包含数百万向量的生产数据集!)


## 构建向量相似度索引 {#build-vector-similarity-index}

运行以下 SQL 语句在 `vector` 列上定义并构建向量相似度索引:

```sql
ALTER TABLE dbpedia ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 1536, 'bf16', 64, 512);

ALTER TABLE dbpedia MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

索引创建和搜索的参数及性能考量详见[文档](../../engines/table-engines/mergetree-family/annindexes.md)。

构建和保存索引可能需要几分钟时间,具体取决于可用 CPU 核心数和存储带宽。


## 执行 ANN 搜索 {#perform-ann-search}

_近似最近邻_（Approximate Nearest Neighbours,简称 ANN)指的是一组技术(例如图和随机森林等特殊数据结构),这些技术的计算速度远快于精确向量搜索。其结果准确度通常对于实际应用来说"足够好"。许多近似技术提供参数来调整结果准确度与搜索时间之间的权衡。

一旦构建了向量相似度索引,向量搜索查询将自动使用该索引:

```sql title="查询"
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

```response title="响应"
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
返回 20 行。耗时:0.025 秒。处理了 32.03 千行,2.10 MB(129 万行/秒,84.80 MB/秒)
```


## 为搜索查询生成嵌入向量 {#generating-embeddings-for-search-query}

到目前为止看到的相似性搜索查询使用 `dbpedia` 表中的现有向量之一作为搜索向量。在实际应用中,需要根据用户输入的查询生成搜索向量,该查询可能是自然语言形式。搜索向量应使用与为数据集生成嵌入向量相同的 LLM 模型来生成。

下面列出了一个示例 Python 脚本,演示如何通过编程方式调用 OpenAI API,使用 `text-embedding-3-large` 模型生成嵌入向量。然后将搜索嵌入向量作为参数传递给 `SELECT` 查询中的 `cosineDistance()` 函数。

运行该脚本需要在环境变量 `OPENAI_API_KEY` 中设置 OpenAI API 密钥。OpenAI API 密钥可以在 https://platform.openai.com 注册后获取。

```python
import sys
from openai import OpenAI
import clickhouse_connect

ch_client = clickhouse_connect.get_client(compress=False) # 传递 ClickHouse 凭据
openai_client = OpenAI() # 设置 OPENAI_API_KEY 环境变量

def get_embedding(text, model):
  text = text.replace("\n", " ")
  return openai_client.embeddings.create(input = [text], model=model, dimensions=1536).data[0].embedding


while True:
    # 接受用户的搜索查询
    print("输入搜索查询:")
    input_query = sys.stdin.readline();

    # 调用 OpenAI API 端点获取嵌入向量
    print("正在为以下内容生成嵌入向量:", input_query);
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


## 问答演示应用 {#q-and-a-demo-application}

上述示例演示了使用 ClickHouse 进行语义搜索和文档检索。接下来将介绍一个非常简单但极具潜力的生成式 AI 示例应用。

该应用执行以下步骤:

1. 接受用户输入的_主题_
2. 通过调用 OpenAI API 使用 `text-embedding-3-large` 模型为_主题_生成嵌入向量
3. 使用 `dbpedia` 表上的向量相似度搜索检索高度相关的 Wikipedia 文章/文档
4. 接受用户提出的与_主题_相关的自然语言自由格式问题
5. 使用 OpenAI `gpt-3.5-turbo` Chat API 基于步骤 #3 中检索到的文档知识来回答问题。
   步骤 #3 中检索到的文档作为_上下文_传递给 Chat API,是生成式 AI 中的关键环节。

下面首先列出运行问答应用的几个对话示例,然后是问答应用的代码。运行该应用需要在环境变量 `OPENAI_API_KEY` 中设置 OpenAI API 密钥。OpenAI API 密钥可以在 https://platform.openai.com 注册后获取。

```shell
$ python3 QandA.py

输入主题: FIFA world cup 1990
正在为 'FIFA world cup 1990' 生成嵌入向量并从 ClickHouse 收集 100 篇相关文章...

输入您的问题: Who won the golden boot
意大利的萨尔瓦托雷·斯基拉奇在 1990 年 FIFA 世界杯上赢得了金靴奖。


输入主题: Cricket world cup
正在为 'Cricket world cup' 生成嵌入向量并从 ClickHouse 收集 100 篇相关文章...

输入您的问题: Which country has hosted the world cup most times
英格兰和威尔士举办板球世界杯的次数最多,该赛事在这些国家举办了五次 - 分别在 1975 年、1979 年、1983 年、1999 年和 2019 年。

$
```

代码:

```Python
import sys
import time
from openai import OpenAI
import clickhouse_connect

ch_client = clickhouse_connect.get_client(compress=False) # 在此处传递 ClickHouse 凭据
openai_client = OpenAI() # 设置 OPENAI_API_KEY 环境变量

def get_embedding(text, model):
  text = text.replace("\n", " ")
  return openai_client.embeddings.create(input = [text], model=model, dimensions=1536).data[0].embedding

while True:
    # 从用户获取感兴趣的主题
    print("输入主题: ", end="", flush=True)
    input_query = sys.stdin.readline()
    input_query = input_query.rstrip()

    # 为搜索主题生成嵌入向量并查询 ClickHouse
    print("正在为 '" + input_query + "' 生成嵌入向量并从 ClickHouse 收集 100 篇相关文章...");
    embedding = get_embedding(input_query,
                              model='text-embedding-3-large')

    params = {'v1':embedding, 'v2':100}
    result = ch_client.query("SELECT id,title,text FROM dbpedia ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

    # 收集所有匹配的文章/文档
    results = ""
    for row in result.result_rows:
        results = results + row[2]

    print("\n输入您的问题: ", end="", flush=True)
    question = sys.stdin.readline();

    # OpenAI Chat API 的提示
    query = f"""使用以下内容回答后续问题。如果找不到答案,请写"我不知道。"

内容:
\"\"\"
{results}
\"\"\"

问题: {question}"""

    GPT_MODEL = "gpt-3.5-turbo"
    response = openai_client.chat.completions.create(
        messages=[
        {'role': 'system', 'content': "您回答关于 {input_query} 的问题。"},
        {'role': 'user', 'content': query},
       ],
       model=GPT_MODEL,
       temperature=0,
    )

    # 打印问题的答案!
    print(response.choices[0].message.content)
    print("\n")
```
