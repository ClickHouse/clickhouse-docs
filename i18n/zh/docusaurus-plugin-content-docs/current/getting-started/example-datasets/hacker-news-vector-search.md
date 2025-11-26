---
description: '包含 2800 万余条 Hacker News 帖子及其向量嵌入的数据集'
sidebar_label: 'Hacker News 向量搜索数据集'
slug: /getting-started/example-datasets/hackernews-vector-search-dataset
title: 'Hacker News 向量搜索数据集'
keywords: ['语义搜索', '向量相似度', '近似最近邻搜索', '向量嵌入']
doc_type: '指南'
---



## 简介 {#introduction}

[Hacker News 数据集](https://news.ycombinator.com/)包含 2874 万条
帖子及其向量嵌入。这些嵌入是使用 [SentenceTransformers](https://sbert.net/) 模型 [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) 生成的。每个嵌入向量的维度为 `384`。

该数据集可用于讲解在用户生成的文本数据基础上构建的大规模、真实世界向量搜索应用的设计、容量规划和性能等方面。



## 数据集详情 {#dataset-details}

ClickHouse 提供了包含向量嵌入的完整数据集，并将其作为单个 `Parquet` 文件存储在一个 [S3 bucket](https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet) 中。

我们建议用户首先进行容量评估，并参考[文档](../../engines/table-engines/mergetree-family/annindexes.md)预估该数据集的存储和内存需求。



## 步骤 {#steps}

<VerticalStepper headerLevel="h3">

### 创建表 {#create-table}

创建 `hackernews` 表以存储帖子及其嵌入向量和相关属性：

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

`id` 是一个递增整数。其他属性可用于谓词中，以实现向量相似性搜索与后过滤/预过滤的结合，详见[文档](../../engines/table-engines/mergetree-family/annindexes.md)。

### 加载数据 {#load-table}

要从 `Parquet` 文件加载数据集，请运行以下 SQL 语句：

```sql
INSERT INTO hackernews SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet');
```

向表中插入 2874 万行数据需要几分钟时间。

### 构建向量相似性索引 {#build-vector-similarity-index}

运行以下 SQL 在 `hackernews` 表的 `vector` 列上定义并构建向量相似性索引：

```sql
ALTER TABLE hackernews ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 384, 'bf16', 64, 512);

ALTER TABLE hackernews MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

索引创建和搜索的参数及性能考虑因素在[文档](../../engines/table-engines/mergetree-family/annindexes.md)中有详细说明。
上述语句分别为 HNSW 超参数 `M` 和 `ef_construction` 使用了 64 和 512 的值。
用户需要通过评估索引构建时间和搜索结果质量来仔细选择这些参数的最优值。

对于完整的 2874 万数据集，构建并保存索引可能需要几分钟到一小时不等，具体取决于可用的 CPU 核心数和存储带宽。

### 执行 ANN 搜索 {#perform-ann-search}

向量相似性索引构建完成后，向量搜索查询将自动使用该索引：

```sql title="查询"
SELECT id, title, text
FROM hackernews
ORDER BY cosineDistance( vector, <search vector>)
LIMIT 10

```

首次将向量索引加载到内存中可能需要几秒钟到几分钟。

### 为搜索查询生成嵌入向量 {#generating-embeddings-for-search-query}

[Sentence Transformers](https://www.sbert.net/) 提供本地易用的嵌入模型，用于捕获句子和段落的语义含义。

此 HackerNews 数据集包含由 [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) 模型生成的向量嵌入。

下面提供了一个示例 Python 脚本，演示如何使用 `sentence_transformers` Python 包以编程方式生成嵌入向量。然后将搜索嵌入向量作为参数传递给 `SELECT` 查询中的 [`cosineDistance()`](/sql-reference/functions/distance-functions#cosineDistance) 函数。

```python
from sentence_transformers import SentenceTransformer
import sys

import clickhouse_connect

print("Initializing...")

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

chclient = clickhouse_connect.get_client() # ClickHouse credentials here

while True:
    # 从用户获取搜索查询
    print("Enter a search query :")
    input_query = sys.stdin.readline();
    texts = [input_query]

    # 运行模型并获取搜索向量
    print("Generating the embedding for ", input_query);
    embeddings = model.encode(texts)

```


    print("正在查询 ClickHouse...")
    params = {'v1':list(embeddings[0]), 'v2':20}
    result = chclient.query("SELECT id, title, text FROM hackernews ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)
    print("结果：")
    for row in result.result_rows:
        print(row[0], row[2][:100])
        print("---------")

````

以下展示了运行上述 Python 脚本及相似度搜索结果的示例
(仅显示前 20 条结果中每条的前 100 个字符)：

```text
Initializing...

输入搜索查询：
Are OLAP cubes useful

正在为 "Are OLAP cubes useful" 生成嵌入向量

正在查询 ClickHouse...

结果：

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
````


## 摘要演示应用

上面的示例演示了使用 ClickHouse 进行语义搜索和文档检索。

下面将介绍一个非常简单但潜力巨大的生成式 AI 示例应用。

该应用执行以下步骤：

1. 接收用户输入的一个*主题*
2. 使用模型 `all-MiniLM-L6-v2` 的 `SentenceTransformers` 为该*主题*生成一个嵌入向量
3. 在 `hackernews` 表上通过向量相似度搜索检索高度相关的帖子和评论
4. 使用 `LangChain` 和 OpenAI `gpt-3.5-turbo` Chat API 对第 3 步检索到的内容进行**摘要**。
   第 3 步中检索到的帖子和评论作为*上下文*传递给 Chat API，是生成式 AI 中的关键环节。

下面先给出运行摘要应用的一个示例，然后给出该摘要应用的代码。
运行该应用需要在环境变量 `OPENAI_API_KEY` 中设置 OpenAI API 密钥。
在 [https://platform.openai.com](https://platform.openai.com) 注册后即可获取 OpenAI API 密钥。

该应用演示了一个适用于多种企业领域的生成式 AI 用例，例如：
客户情感分析、技术支持自动化、用户会话挖掘、法律文档、医疗记录、
会议记录、财务报表等。

```shell
$ python3 summarize.py

输入搜索主题:
ClickHouse 性能使用体验

正在为以下内容生成嵌入向量 ----> ClickHouse 性能使用体验

正在查询 ClickHouse 以检索相关文章...

正在初始化 chatgpt-3.5-turbo 模型...

正在汇总从 ClickHouse 检索到的搜索结果...

chatgpt-3.5 总结:
讨论重点是将 ClickHouse 与 TimescaleDB、Apache Spark、AWS Redshift 和 QuestDB 等多种数据库进行对比,突出了 ClickHouse 在分析应用场景中的高性能和成本效益优势。用户称赞 ClickHouse 在处理大规模分析工作负载时的简洁性、速度和资源利用效率,同时也提到了一些挑战,例如 DML 操作和备份难度。ClickHouse 凭借其实时聚合计算能力和扎实的工程设计获得认可,并与 Druid 和 MemSQL 等其他数据库进行了对比。总体而言,ClickHouse 被视为实时数据处理、分析和高效处理海量数据的强大工具,凭借其卓越的性能和成本效益而日益受到欢迎。
```

上述应用程序的代码：

```python
print("正在初始化...")

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
    # 从用户获取搜索查询
    print("请输入搜索主题：")
    input_query = sys.stdin.readline();
    texts = [input_query]

    # 运行模型并获取搜索或参考向量
    print("正在生成嵌入向量 ----> ", input_query);
    embeddings = model.encode(texts)

    print("正在查询 ClickHouse...")
    params = {'v1':list(embeddings[0]), 'v2':100}
    result = chclient.query("SELECT id,title,text FROM hackernews ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

    # 合并所有搜索结果
    doc_results = ""
    for row in result.result_rows:
        doc_results = doc_results + "\n" + row[2]

    print("正在初始化 chatgpt-3.5-turbo 模型")
    model_name = "gpt-3.5-turbo"

    text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
        model_name=model_name
    )

    texts = text_splitter.split_text(doc_results)

    docs = [Document(page_content=t) for t in texts]

    llm = ChatOpenAI(temperature=0, model_name=model_name)

    prompt_template = """
用不超过 10 句话简明扼要地总结以下内容：


{text}


简明摘要：
"""

    prompt = PromptTemplate(template=prompt_template, input_variables=["text"])
```


    num_tokens = num_tokens_from_string(doc_results, model_name)

    gpt_35_turbo_max_tokens = 4096
    verbose = False

    print("正在汇总从 ClickHouse 检索的搜索结果...")

    if num_tokens <= gpt_35_turbo_max_tokens:
        chain = load_summarize_chain(llm, chain_type="stuff", prompt=prompt, verbose=verbose)
    else:
        chain = load_summarize_chain(llm, chain_type="map_reduce", map_prompt=prompt, combine_prompt=prompt, verbose=verbose)

    summary = chain.run(docs)

    print(f"chatgpt-3.5 生成的摘要：{summary}")

```
</VerticalStepper>
```
