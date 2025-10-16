---
'description': '数据集包含超过 2800 万个 Hacker News 帖子及其向量嵌入'
'sidebar_label': 'Hacker News 向量搜索数据集'
'slug': '/getting-started/example-datasets/hackernews-vector-search-dataset'
'title': 'Hacker News 向量搜索数据集'
'keywords':
- 'semantic search'
- 'vector similarity'
- 'approximate nearest neighbours'
- 'embeddings'
'doc_type': 'guide'
---

## 介绍 {#introduction}

[Hacker News 数据集](https://news.ycombinator.com/) 包含 2874 万
条帖子及其向量嵌入。这些嵌入是使用 [SentenceTransformers](https://sbert.net/) 模型 [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) 生成的。每个嵌入向量的维度为 `384`。

该数据集可用于走访大型、真实世界向量搜索应用程序的设计、规模和性能方面，该应用程序建立在用户生成的文本数据之上。

## 数据集详细信息 {#dataset-details}

ClickHouse 提供的完整数据集与向量嵌入作为一个单一的 `Parquet` 文件存储在 [S3 bucket](https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet)

我们建议用户首先进行规模估算，以通过参考 [文档](../../engines/table-engines/mergetree-family/annindexes.md) 来估计该数据集的存储和内存需求。

## 步骤 {#steps}

<VerticalStepper headerLevel="h3">

### 创建表 {#create-table}

创建 `hackernews` 表以存储帖子及其嵌入和相关属性：

```sql
CREATE TABLE hackernews
(
    `id` Int32,
    `doc_id` Int32,
    `text` String,
    `vector` Array(Float32),
    `node_info` Tuple(
        start Nullable(UInt64),
        end Nullable(UInt64)),
    `metadata` String,
    `type` Enum8('story' = 1, 'comment' = 2, 'poll' = 3, 'pollopt' = 4, 'job' = 5),
    `by` LowCardinality(String),
    `time` DateTime,
    `title` String,
    `post_score` Int32,
    `dead` UInt8,
    `deleted` UInt8,
    `length` UInt32
)
ENGINE = MergeTree
ORDER BY id;
```

`id` 仅为递增整数。额外的属性可用于谓词，以理解向量相似度搜索以及与后过滤/前过滤结合的情况，正如 [文档](../../engines/table-engines/mergetree-family/annindexes.md) 中所解释的那样。

### 加载数据 {#load-table}

要从 `Parquet` 文件加载数据集，请运行以下 SQL 语句：

```sql
INSERT INTO hackernews SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet');
```

将 2874 万行插入表中将需要几分钟。

### 构建向量相似度索引 {#build-vector-similarity-index}

运行以下 SQL 以定义并构建 `hackernews` 表的 `vector` 列上的向量相似度索引：

```sql
ALTER TABLE hackernews ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 384, 'bf16', 64, 512);

ALTER TABLE hackernews MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

索引创建和搜索的参数及性能考虑在 [文档](../../engines/table-engines/mergetree-family/annindexes.md) 中进行了描述。
上述语句分别使用 HNSW 超参数 `M` 和 `ef_construction` 的值 64 和 512。
用户需要通过评估索引构建时间和搜索结果质量来仔细选择这些参数的最佳值。

构建和保存索引可能需要几分钟到几个小时，具体取决于可用的 CPU 核心数量和存储带宽。

### 执行 ANN 搜索 {#perform-ann-search}

一旦构建了向量相似度索引，向量搜索查询将自动使用该索引：

```sql title="Query"
SELECT id, title, text
FROM hackernews
ORDER BY cosineDistance( vector, <search vector>)
LIMIT 10

```

第一次将向量索引加载到内存可能需要几秒钟到几分钟。

### 为搜索查询生成嵌入 {#generating-embeddings-for-search-query}

[Sentence Transformers](https://www.sbert.net/) 提供本地、易于使用的嵌入
模型，用于捕获句子和段落的语义含义。

HackerNews 数据集中包含从 
[all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) 模型生成的向量嵌入。

下面提供一个示例 Python 脚本，演示如何使用 `sentence_transformers` Python 包程序化生成
嵌入向量。搜索嵌入向量随后作为参数传递给 `SELECT` 查询中的 [`cosineDistance()`](/sql-reference/functions/distance-functions#cosineDistance) 函数。

```python
from sentence_transformers import SentenceTransformer
import sys

import clickhouse_connect

print("Initializing...")

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

chclient = clickhouse_connect.get_client() # ClickHouse credentials here

while True:
    # Take the search query from user
    print("Enter a search query :")
    input_query = sys.stdin.readline();
    texts = [input_query]

    # Run the model and obtain search vector
    print("Generating the embedding for ", input_query);
    embeddings = model.encode(texts)

    print("Querying ClickHouse...")
    params = {'v1':list(embeddings[0]), 'v2':20}
    result = chclient.query("SELECT id, title, text FROM hackernews ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)
    print("Results :")
    for row in result.result_rows:
        print(row[0], row[2][:100])
        print("---------")

```

下面显示了运行上述 Python 脚本和相似度搜索结果的示例
（仅打印每个前 20 条帖子的 100 个字符）：

```text
Initializing...

Enter a search query :
Are OLAP cubes useful

Generating the embedding for  "Are OLAP cubes useful"

Querying ClickHouse...

Results :

27742647 smartmic:
slt2021: OLAP Cube is not dead, as long as you use some form of:<p>1. GROUP BY multiple fi
---------
27744260 georgewfraser:A data mart is a logical organization of data to help humans understand the schema. Wh
---------
27761434 mwexler:&quot;We model data according to rigorous frameworks like Kimball or Inmon because we must r
---------
28401230 chotmat:
erosenbe0: OLAP database is just a copy, replica, or archive of data with a schema designe
---------
22198879 Merick:+1 for Apache Kylin, it&#x27;s a great project and awesome open source community. If anyone i
---------
27741776 crazydoggers:I always felt the value of an OLAP cube was uncovering questions you may not know to as
---------
22189480 shadowsun7:
_Codemonkeyism: After maintaining an OLAP cube system for some years, I&#x27;m not that
---------
27742029 smartmic:
gengstrand: My first exposure to OLAP was on a team developing a front end to Essbase that
---------
22364133 irfansharif:
simo7: I&#x27;m wondering how this technology could work for OLAP cubes.<p>An OLAP cube
---------
23292746 scoresmoke:When I was developing my pet project for Web analytics (<a href="https:&#x2F;&#x2F;github
---------
22198891 js8:It seems that the article makes a categorical error, arguing that OLAP cubes were replaced by co
---------
28421602 chotmat:
7thaccount: Is there any advantage to OLAP cube over plain SQL (large historical database r
---------
22195444 shadowsun7:
lkcubing: Thanks for sharing. Interesting write up.<p>While this article accurately capt
---------
22198040 lkcubing:Thanks for sharing. Interesting write up.<p>While this article accurately captures the issu
---------
3973185 stefanu:
sgt: Interesting idea. Ofcourse, OLAP isn't just about the underlying cubes and dimensions,
---------
22190903 shadowsun7:
js8: It seems that the article makes a categorical error, arguing that OLAP cubes were r
---------
28422241 sradman:OLAP Cubes have been disrupted by Column Stores. Unless you are interested in the history of
---------
28421480 chotmat:
sradman: OLAP Cubes have been disrupted by Column Stores. Unless you are interested in the
---------
27742515 BadInformatics:
quantified: OP posts with inverted condition: “OLAP != OLAP Cube” is the actual titl
---------
28422935 chotmat:
rstuart4133: I remember hearing about OLAP cubes donkey&#x27;s years ago (probably not far
---------
```

## 总结演示应用 {#summarization-demo-application}

上述示例演示了使用 ClickHouse 的语义搜索和文档检索。

接下来展示一个非常简单但潜力巨大的生成 AI 示例应用。

该应用程序执行以下步骤：

1. 从用户那里接受一个 _主题_ 作为输入
2. 使用 `SentenceTransformers` 和模型 `all-MiniLM-L6-v2` 为 _主题_ 生成一个嵌入向量
3. 使用在 `hackernews` 表上进行的向量相似度搜索检索高度相关的帖子/评论
4. 使用 `LangChain` 和 OpenAI `gpt-3.5-turbo` 聊天 API **总结** 步骤 #3 中检索到的内容。
   步骤 #3 中检索到的帖子/评论作为 _上下文_ 传递给聊天 API，并且是生成 AI 的关键链接。

下面首先列出运行总结应用程序的示例，然后是
总结应用程序的代码。运行该应用程序需要在环境变量 `OPENAI_API_KEY` 中设置 OpenAI API 密钥。
在 https://platform.openai.com 注册后可以获得 OpenAI API 密钥。

该应用程序演示了适用于多个企业领域的生成 AI 用例，例如：
客户情感分析、技术支持自动化、挖掘用户对话、法律文档、医疗记录、
会议记录、财务报表等。

```shell
$ python3 summarize.py

Enter a search topic :
ClickHouse performance experiences

Generating the embedding for ---->  ClickHouse performance experiences

Querying ClickHouse to retrieve relevant articles...

Initializing chatgpt-3.5-turbo model...

Summarizing search results retrieved from ClickHouse...

Summary from chatgpt-3.5:
The discussion focuses on comparing ClickHouse with various databases like TimescaleDB, Apache Spark,
AWS Redshift, and QuestDB, highlighting ClickHouse's cost-efficient high performance and suitability
for analytical applications. Users praise ClickHouse for its simplicity, speed, and resource efficiency
in handling large-scale analytics workloads, although some challenges like DMLs and difficulty in backups
are mentioned. ClickHouse is recognized for its real-time aggregate computation capabilities and solid
engineering, with comparisons made to other databases like Druid and MemSQL. Overall, ClickHouse is seen
as a powerful tool for real-time data processing, analytics, and handling large volumes of data
efficiently, gaining popularity for its impressive performance and cost-effectiveness.
```

上述应用程序的代码：

```python
print("Initializing...")

import sys
import json
import time
from sentence_transformers import SentenceTransformer

import clickhouse_connect

from langchain.docstore.document import Document
from langchain.text_splitter import CharacterTextSplitter
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains.summarize import load_summarize_chain
import textwrap
import tiktoken

def num_tokens_from_string(string: str, encoding_name: str) -> int:
    encoding = tiktoken.encoding_for_model(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

chclient = clickhouse_connect.get_client(compress=False) # ClickHouse credentials here

while True:
    # Take the search query from user
    print("Enter a search topic :")
    input_query = sys.stdin.readline();
    texts = [input_query]

    # Run the model and obtain search or reference vector
    print("Generating the embedding for ----> ", input_query);
    embeddings = model.encode(texts)

    print("Querying ClickHouse...")
    params = {'v1':list(embeddings[0]), 'v2':100}
    result = chclient.query("SELECT id,title,text FROM hackernews ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

    # Just join all the search results
    doc_results = ""
    for row in result.result_rows:
        doc_results = doc_results + "\n" + row[2]

    print("Initializing chatgpt-3.5-turbo model")
    model_name = "gpt-3.5-turbo"

    text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
        model_name=model_name
    )

    texts = text_splitter.split_text(doc_results)

    docs = [Document(page_content=t) for t in texts]

    llm = ChatOpenAI(temperature=0, model_name=model_name)

    prompt_template = """
Write a concise summary of the following in not more than 10 sentences:


{text}


CONSCISE SUMMARY :
"""

    prompt = PromptTemplate(template=prompt_template, input_variables=["text"])

    num_tokens = num_tokens_from_string(doc_results, model_name)

    gpt_35_turbo_max_tokens = 4096
    verbose = False

    print("Summarizing search results retrieved from ClickHouse...")

    if num_tokens <= gpt_35_turbo_max_tokens:
        chain = load_summarize_chain(llm, chain_type="stuff", prompt=prompt, verbose=verbose)
    else:
        chain = load_summarize_chain(llm, chain_type="map_reduce", map_prompt=prompt, combine_prompt=prompt, verbose=verbose)

    summary = chain.run(docs)

    print(f"Summary from chatgpt-3.5: {summary}")
```
</VerticalStepper>
