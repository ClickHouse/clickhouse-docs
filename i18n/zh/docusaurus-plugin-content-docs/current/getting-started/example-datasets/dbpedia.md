---
'description': '数据集包含来自 Wikipedia 的 100 万篇文章及其向量嵌入'
'sidebar_label': 'dbpedia 数据集'
'slug': '/getting-started/example-datasets/dbpedia-dataset'
'title': 'dbpedia 数据集'
'keywords':
- 'semantic search'
- 'vector similarity'
- 'approximate nearest neighbours'
- 'embeddings'
'doc_type': 'reference'
---

The [dbpedia 数据集](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M) 包含来自 Wikipedia 的 100 万篇文章及其使用 [text-embedding-3-large](https://platform.openai.com/docs/models/text-embedding-3-large) 模型生成的向量嵌入。

该数据集是理解向量嵌入、向量相似性搜索和生成 AI 的绝佳入门数据集。我们使用该数据集演示 ClickHouse 中的 [近似最近邻搜索](../../engines/table-engines/mergetree-family/annindexes.md) 以及一个简单但强大的问答应用程序。

## 数据集详情 {#dataset-details}

该数据集包含位于 [huggingface.co](https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/) 的 26 个 `Parquet` 文件。文件名为 `0.parquet`、`1.parquet`、...、`25.parquet`。要查看数据集的一些示例行，请访问这个 [Hugging Face 页面](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M)。

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

要从所有 Parquet 文件加载数据集，请运行以下 shell 命令：

```shell
$ seq 0 25 | xargs -P1 -I{} clickhouse client -q "INSERT INTO dbpedia SELECT _id, title, text, \"text-embedding-3-large-1536-embedding\" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/{}.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;"
```

或者，可以像下面所示的那样运行单个 SQL 语句以加载每个 Parquet 文件：

```sql
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/0.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/1.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
...
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/25.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;

```

验证在 `dbpedia` 表中看到 100 万行：

```sql
SELECT count(*)
FROM dbpedia

   ┌─count()─┐
1. │ 1000000 │
   └─────────┘
```

## 语义搜索 {#semantic-search}

推荐阅读: ["向量嵌入 OpenAPI 指南"](https://platform.openai.com/docs/guides/embeddings)

使用向量嵌入的语义搜索（也称为 _相似性搜索_）涉及以下步骤：

- 接受来自用户的自然语言搜索查询，例如 _"告诉我一些风景优美的火车旅行"_、_“设定在欧洲的悬疑小说”_ 等等
- 使用 LLM 模型为搜索查询生成嵌入向量
- 在数据集中查找与搜索嵌入向量最近的邻居

_最近邻居_ 是指与用户查询相关的文档、图像或内容。检索到的结果是生成 AI 应用程序中检索增强生成 (RAG) 的关键输入。

## 运行暴力搜索向量相似性搜索 {#run-a-brute-force-vector-similarity-search}

KNN (k - 最近邻) 搜索或暴力搜索涉及计算数据集中每个向量与搜索嵌入向量之间的距离，然后对距离进行排序以获得最近邻居。 使用 `dbpedia` 数据集，观察语义搜索的快速技术是使用数据集本身的嵌入向量作为搜索向量。例如：

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

记录查询延迟，以便与 ANN（使用向量索引）的查询延迟进行比较。
还应记录冷启动操作系统文件缓存情况下的查询延迟及 `max_threads=1` 的情况，以识别实际计算使用情况和存储带宽使用情况（将其外推到拥有数百万个向量的生产数据集！）

## 构建向量相似性索引 {#build-vector-similarity-index}

运行以下 SQL 以在 `vector` 列上定义并构建向量相似性索引：

```sql
ALTER TABLE dbpedia ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 1536, 'bf16', 64, 512);

ALTER TABLE dbpedia MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

索引创建和搜索的参数及性能考虑在 [文档](../../engines/table-engines/mergetree-family/annindexes.md) 中进行了描述。

构建和保存索引可能需要几分钟，具体取决于可用的 CPU 核心数量和存储带宽。

## 执行 ANN 搜索 {#perform-ann-search}

_近似最近邻_ 或 ANN 是指一组技术（例如，图和随机森林等特定数据结构），它们计算结果的速度比精确向量搜索快得多。结果的准确度通常对于实际使用来说是“足够好”的。许多近似技术提供参数以调整结果准确性和搜索时间之间的权衡。

一旦向量相似性索引构建完成，向量搜索查询将自动使用该索引：

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

## 为搜索查询生成嵌入 {#generating-embeddings-for-search-query}

到目前为止看到的相似性搜索查询使用 `dbpedia` 表中的现有向量作为搜索向量。在实际应用中，搜索向量必须为用户输入的查询生成，该查询可以是自然语言的。搜索向量应使用与生成数据集嵌入向量相同的 LLM 模型生成。

下面列出了一个示例 Python 脚本，演示如何程序性地调用 OpenAI API 来使用 `text-embedding-3-large` 模型生成嵌入向量。然后将搜索嵌入向量作为参数传递给 `SELECT` 查询中的 `cosineDistance()` 函数。

运行该脚本需要在环境变量 `OPENAI_API_KEY` 中设置 OpenAI API 密钥。
OpenAI API 密钥可在 https://platform.openai.com 注册后获取。

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

## 问答演示应用程序 {#q-and-a-demo-application}

上述示例演示了使用 ClickHouse 的语义搜索和文档检索。接下来是一个非常简单但具有高潜力的生成 AI 示例应用程序。

该应用执行以下步骤：

1. 接受用户输入的 _主题_
2. 通过调用 OpenAI API 生成与 `text-embedding-3-large` 模型关联的 _主题_ 的嵌入向量
3. 使用在 `dbpedia` 表上进行的向量相似性搜索检索高度相关的 Wikipedia 文章/文档
4. 接受用户与 _主题_ 相关的自然语言自由形式问题
5. 使用 OpenAI `gpt-3.5-turbo` 聊天 API 根据在步骤 #3 中检索到的文档中的知识回答问题。
   步骤 #3 中检索到的文档作为 _上下文_ 传递给聊天 API，并且是生成 AI 中的关键链接。

先列出运行问答应用程序的一些对话示例，然后是问答应用程序的代码。运行该应用程序需要在环境变量 `OPENAI_API_KEY` 中设置 OpenAI API 密钥。OpenAI API 密钥可在 https://platform.openai.com 注册后获取。

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
