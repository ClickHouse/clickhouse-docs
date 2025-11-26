---
description: '包含 2800 多万条 Hacker News 帖子及其向量嵌入的数据集'
sidebar_label: 'Hacker News 向量搜索数据集'
slug: /getting-started/example-datasets/hackernews-vector-search-dataset
title: 'Hacker News 向量搜索数据集'
keywords: ['语义搜索', '向量相似性', '近似最近邻', '向量嵌入']
doc_type: 'guide'
---

## 介绍 {#introduction}

[Hacker News 数据集](https://news.ycombinator.com/) 包含 2874 万条
帖子及其向量嵌入。这些嵌入是使用 [SentenceTransformers](https://sbert.net/) 模型 [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) 生成的。每个嵌入向量的维度为 `384`。

该数据集可用于讲解在用户生成的文本数据之上构建的大规模、真实世界向量搜索应用的设计、容量规划和性能等方面的实践。

## 数据集详情 {#dataset-details}

包含向量嵌入的完整数据集由 ClickHouse 以单个 `Parquet` 文件的形式提供，存储在一个 [S3 存储桶](https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet) 中。

我们建议用户先进行容量评估，以预估该数据集的存储和内存需求，可参考[文档](../../engines/table-engines/mergetree-family/annindexes.md)。

## 步骤 {#steps}

<VerticalStepper headerLevel="h3">
  ### 创建表

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

  `id` 仅为递增整数。其他属性可在谓词中使用,以便理解向量相似性搜索与后置过滤/前置过滤的组合应用,具体说明请参阅[文档](../../engines/table-engines/mergetree-family/annindexes.md)

  ### 加载数据

  要从 `Parquet` 文件加载数据集,请运行以下 SQL 语句:

  ```sql
  INSERT INTO hackernews SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet');
  ```

  向表中插入 2874 万行数据将需要几分钟时间。

  ### 构建向量相似度索引

  运行以下 SQL 语句，在 `hackernews` 表的 `vector` 列上定义并构建向量相似度索引：

  ```sql
  ALTER TABLE hackernews ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 384, 'bf16', 64, 512);

  ALTER TABLE hackernews MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
  ```

  索引创建和搜索的参数及性能考量详见[文档](../../engines/table-engines/mergetree-family/annindexes.md)。
  上述语句分别将 HNSW 超参数 `M` 和 `ef_construction` 设置为 64 和 512。
  用户需要通过评估索引构建时间和搜索结果质量来仔细选择这些参数的最优值。

  对于完整的 2874 万条数据集,构建和保存索引可能需要几分钟到一小时,具体取决于可用 CPU 核心数和存储带宽。

  ### 执行 ANN 搜索

  向量相似度索引构建完成后,向量搜索查询将自动使用该索引:

  ```sql title="Query"
  SELECT id, title, text
  FROM hackernews
  ORDER BY cosineDistance( vector, <search vector>)
  LIMIT 10
  ```

  首次将向量索引加载到内存可能需要几秒钟至几分钟。

  ### 为搜索查询生成嵌入向量

  [Sentence Transformers](https://www.sbert.net/) 提供本地、易用的嵌入模型,用于捕获句子和段落的语义。

  此 HackerNews 数据集包含使用 [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) 模型生成的向量嵌入。

  下面提供了一个 Python 脚本示例,演示如何使用 `sentence_transformers` Python 包以编程方式生成嵌入向量。然后将搜索嵌入向量作为参数传递给 `SELECT` 查询中的 [`cosineDistance()`](/sql-reference/functions/distance-functions#cosineDistance) 函数。

  ```python
  from sentence_transformers import SentenceTransformer
  import sys

  import clickhouse_connect

  print("初始化中...")

  model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

  chclient = clickhouse_connect.get_client() # 此处填写 ClickHouse 凭据

  while True:
      # 获取用户输入的搜索查询
      print("请输入搜索查询:")
      input_query = sys.stdin.readline();
      texts = [input_query]

      # 运行模型并获取搜索向量
      print("正在生成嵌入向量:", input_query);
      embeddings = model.encode(texts)

      print("查询 ClickHouse 中...")
      params = {'v1':list(embeddings[0]), 'v2':20}
      result = chclient.query("SELECT id, title, text FROM hackernews ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)
      print("查询结果:")
      for row in result.result_rows:
          print(row[0], row[2][:100])
          print("---------")
  ```

  以下展示了运行上述 Python 脚本的示例及相似度搜索结果
  (仅显示前 20 条结果中每条的前 100 个字符):

  ```text
  初始化中...

  输入搜索查询:
  OLAP 多维数据集是否有用

  正在为 "OLAP 多维数据集是否有用" 生成嵌入向量

  正在查询 ClickHouse...

  结果:

  27742647 smartmic:
  slt2021: OLAP 多维数据集并未过时,只要您使用某种形式的:<p>1. GROUP BY 多个字段
  ---------
  27744260 georgewfraser:数据集市是数据的逻辑组织方式,用于帮助人们理解数据模式。当
  ---------
  27761434 mwexler:&quot;我们根据 Kimball 或 Inmon 等严格的框架对数据进行建模,因为我们必须
  ---------
  28401230 chotmat:
  erosenbe0: OLAP 数据库只是数据的副本、复制或归档,其模式设计
  ---------
  22198879 Merick:+1 支持 Apache Kylin,这是一个优秀的项目,拥有出色的开源社区。如果有人
  ---------
  27741776 crazydoggers:我一直认为 OLAP 多维数据集的价值在于发现您可能不知道要提出的问题
  ---------
  22189480 shadowsun7:
  _Codemonkeyism: 在维护 OLAP 多维数据集系统几年后,我并不那么
  ---------
  27742029 smartmic:
  gengstrand: 我第一次接触 OLAP 是在一个为 Essbase 开发前端界面的团队中
  ---------
  22364133 irfansharif:
  simo7: 我想知道这项技术如何应用于 OLAP 多维数据集。<p>OLAP 多维数据集
  ---------
  23292746 scoresmoke:当我开发用于 Web 分析的个人项目时 (<a href="https:&#x2F;&#x2F;github
  ---------
  22198891 js8:这篇文章似乎犯了一个分类错误,认为 OLAP 多维数据集被
  ---------
  28421602 chotmat:
  7thaccount: OLAP 多维数据集相比普通 SQL(大型历史数据库)有什么优势
  ---------
  22195444 shadowsun7:
  lkcubing: 感谢分享。很有意思的文章。<p>虽然这篇文章准确地阐述了
  ---------
  22198040 lkcubing:感谢分享。很有意思的文章。<p>虽然这篇文章准确地阐述了问题
  ---------
  3973185 stefanu:
  sgt: 有趣的想法。当然,OLAP 不仅仅涉及底层多维数据集和维度,
  ---------
  22190903 shadowsun7:
  js8: 这篇文章似乎犯了一个分类错误,认为 OLAP 多维数据集被
  ---------
  28422241 sradman:OLAP 多维数据集已被列式存储所取代。除非您对历史感兴趣
  ---------
  28421480 chotmat:
  sradman: OLAP 多维数据集已被列式存储所取代。除非您对
  ---------
  27742515 BadInformatics:
  quantified: 原帖使用了反向条件:"OLAP != OLAP 多维数据集" 才是实际标题
  ---------
  28422935 chotmat:
  rstuart4133: 我记得很久以前就听说过 OLAP 多维数据集(可能不远
  ---------
  ```

  ## 摘要演示应用程序

  上述示例演示了如何使用 ClickHouse 进行语义搜索和文档检索。

  接下来将介绍一个简单但极具潜力的生成式 AI 示例应用。

  应用程序执行以下步骤：

  1. 接收用户输入的 *topic*
  2. 使用 `SentenceTransformers` 的 `all-MiniLM-L6-v2` 模型为该 *topic* 生成嵌入向量
  3. 在 `hackernews` 表中使用基于向量相似度的搜索检索高度相关的帖子和评论
  4. 使用 `LangChain` 和 OpenAI `gpt-3.5-turbo` Chat API 来对步骤 #3 中检索到的内容进行**总结**。\
     步骤 #3 中检索到的帖子/评论会作为*上下文*传递给 Chat API，是生成式 AI 中的关键一环。

  下面首先列出运行摘要应用程序的示例，随后是摘要应用程序的代码。运行该应用程序需要在环境变量 `OPENAI_API_KEY` 中设置 OpenAI API 密钥。可在 [https://platform.openai.com](https://platform.openai.com) 注册后获取 OpenAI API 密钥。

  此应用程序演示了一个生成式 AI 用例，适用于多个企业领域，例如：
  客户情感分析、技术支持自动化、用户对话挖掘、法律文档、医疗记录、
  会议记录、财务报表等

  ```shell
  $ python3 summarize.py

  输入搜索主题:
  ClickHouse 性能使用体验

  正在为 ----> ClickHouse 性能使用体验 生成嵌入向量

  正在查询 ClickHouse 以检索相关文章...

  正在初始化 chatgpt-3.5-turbo 模型...

  正在汇总从 ClickHouse 检索到的搜索结果...

  来自 chatgpt-3.5 的汇总结果:
  讨论重点是将 ClickHouse 与 TimescaleDB、Apache Spark、AWS Redshift 和 QuestDB 等多种数据库进行对比,突出了 ClickHouse 在分析应用场景中的高性能和成本优势。用户对 ClickHouse 在处理大规模分析工作负载时的简洁性、速度和资源利用效率给予高度评价,同时也提到了一些挑战,例如 DML 操作和备份难度。ClickHouse 凭借其实时聚合计算能力和扎实的工程实现获得认可,并与 Druid 和 MemSQL 等其他数据库进行了对比。总体而言,ClickHouse 被视为实时数据处理、分析和高效处理海量数据的强大工具,凭借其卓越的性能和成本效益而日益受到欢迎。
  ```

  上述应用程序的代码:

  ```python
  print("初始化中...")

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
      # 获取用户输入的搜索查询
      print("请输入搜索主题:")
      input_query = sys.stdin.readline();
      texts = [input_query]

      # 运行模型并获取搜索向量或参考向量
      print("正在生成嵌入向量 ----> ", input_query);
      embeddings = model.encode(texts)

      print("查询 ClickHouse 中...")
      params = {'v1':list(embeddings[0]), 'v2':100}
      result = chclient.query("SELECT id,title,text FROM hackernews ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

      # 合并所有搜索结果
      doc_results = ""
      for row in result.result_rows:
          doc_results = doc_results + "\n" + row[2]

      print("初始化 chatgpt-3.5-turbo 模型中")
      model_name = "gpt-3.5-turbo"

      text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
          model_name=model_name
      )

      texts = text_splitter.split_text(doc_results)

      docs = [Document(page_content=t) for t in texts]

      llm = ChatOpenAI(temperature=0, model_name=model_name)

      prompt_template = """
  请用不超过 10 句话简明总结以下内容:


  {text}


  简明摘要:
  """

      prompt = PromptTemplate(template=prompt_template, input_variables=["text"])

      num_tokens = num_tokens_from_string(doc_results, model_name)

      gpt_35_turbo_max_tokens = 4096
      verbose = False

      print("正在总结从 ClickHouse 检索的搜索结果...")

      if num_tokens <= gpt_35_turbo_max_tokens:
          chain = load_summarize_chain(llm, chain_type="stuff", prompt=prompt, verbose=verbose)
      else:
          chain = load_summarize_chain(llm, chain_type="map_reduce", map_prompt=prompt, combine_prompt=prompt, verbose=verbose)

      summary = chain.run(docs)

      print(f"chatgpt-3.5 生成的摘要: {summary}")
  ```
</VerticalStepper>