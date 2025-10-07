---
'description': 'Набор данных, содержащий более 28 миллионов публикаций Hacker News
  и их векторные встраивания'
'sidebar_label': 'Hacker News Векторный Поиск набор данных'
'slug': '/getting-started/example-datasets/hackernews-vector-search-dataset'
'title': 'Hacker News Векторный Поиск набор данных'
'keywords':
- 'semantic search'
- 'vector similarity'
- 'approximate nearest neighbours'
- 'embeddings'
'doc_type': 'guide'
---

## Введение {#introduction}

Набор данных [Hacker News](https://news.ycombinator.com/) содержит 28.74 миллиона
постов и их векторные встраивания. Встраивания были сгенерированы с использованием модели [SentenceTransformers](https://sbert.net/) [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2). Размерность каждого вектора встраивания составляет `384`.

Этот набор данных можно использовать для изучения проектирования, масштабирования и производительности больших масштабов,
реальных приложений поиска по векторным данным, основанным на текстовых данных, созданных пользователями.

## Подробности набора данных {#dataset-details}

Полный набор данных с векторными встраиваниями предоставляется ClickHouse в виде единственного файла `Parquet` в [S3 корзине](https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet).

Мы рекомендуем пользователям сначала провести оценку размера, чтобы оценить требования к хранению и памяти для этого набора данных, обратившись к [документации](../../engines/table-engines/mergetree-family/annindexes.md).

## Шаги {#steps}

<VerticalStepper headerLevel="h3">

### Создание таблицы {#create-table}

Создайте таблицу `hackernews` для хранения постов и их встраиваний, а также связанных атрибутов:

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

`id` - это просто увеличивающееся целое число. Дополнительные атрибуты можно использовать в предикатах, чтобы понять
поиск по векторной схожести в сочетании с пост-фильтрацией/предфильтрацией, как объяснено в [документации](../../engines/table-engines/mergetree-family/annindexes.md).

### Загрузка данных {#load-table}

Чтобы загрузить набор данных из файла `Parquet`, выполните следующий SQL-запрос:

```sql
INSERT INTO hackernews SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet');
```

Вставка 28.74 миллиона строк в таблицу займет несколько минут.

### Построение индекса векторной схожести {#build-vector-similarity-index}

Выполните следующий SQL, чтобы определить и построить индекс векторной схожести на колонке `vector` таблицы `hackernews`:

```sql
ALTER TABLE hackernews ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 384, 'bf16', 64, 512);

ALTER TABLE hackernews MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

Параметры и соображения по производительности для создания и поиска индекса описаны в [документации](../../engines/table-engines/mergetree-family/annindexes.md).
Вышеуказанный запрос использует значения 64 и 512 соответственно для гиперпараметров HNSW `M` и `ef_construction`.
Пользователям необходимо тщательно подбирать оптимальные значения для этих параметров, оценивая время постройки индекса и качество результатов поиска,
соответствующие выбранным значениям.

Построение и сохранение индекса могут занять несколько минут/часов для полного набора данных в 28.74 миллиона, в зависимости от количества доступных ядер CPU и пропускной способности хранилища.

### Выполнение ANN поиска {#perform-ann-search}

После того как индекс векторной схожести будет построен, запросы векторного поиска автоматически будут использовать индекс:

```sql title="Query"
SELECT id, title, text
FROM hackernews
ORDER BY cosineDistance( vector, <search vector>)
LIMIT 10

```

Первый раз загрузка векторного индекса в память может занять несколько секунд/минут.

### Генерация встраиваний для запроса поиска {#generating-embeddings-for-search-query}

[Sentence Transformers](https://www.sbert.net/) предоставляют локальные, простые в использовании модели встраивания
для захвата семантического значения предложений и абзацев.

Набор данных в этом наборе HackerNews содержит векторные встраивания, сгенерированные с помощью 
модели [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2).

Пример скрипта на Python представлен ниже, чтобы продемонстрировать, как программно генерировать
векторные встраивания с использованием пакета `sentence_transformers`. Вектор встраивания для поиска
затем передается в качестве аргумента функции [`cosineDistance()`](/sql-reference/functions/distance-functions#cosineDistance) в запросе `SELECT`.

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

Пример выполнения вышеуказанного Python-скрипта и результаты поиска по схожести показаны ниже
(только 100 символов из каждого из 20 лучших постов напечатаны):

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

## Демонстрационное приложение для резюме {#summarization-demo-application}

Пример выше продемонстрировал семантический поиск и извлечение документа с использованием ClickHouse.

Следующее представлено очень простое, но в то же время высокопотенциальное приложение генеративного ИИ.

Приложение выполняет следующие шаги:

1. Принимает _тему_ в качестве входных данных от пользователя
2. Генерирует вектор встраивания для _темы_, используя `SentenceTransformers` с моделью `all-MiniLM-L6-v2`
3. Извлекает высокорелевантные посты/комментарии, используя поиск по векторной схожести на таблице `hackernews`
4. Использует `LangChain` и OpenAI API Chat `gpt-3.5-turbo`, чтобы **резюмировать** контент, извлеченный на шаге #3.
   Посты/комментарии, извлеченные на шаге #3, передаются как _контекст_ в Chat API и являются ключевой связкой в генеративном ИИ.

Пример из выполнения приложения резюмирования сначала приведен ниже, затем код
для приложения резюмирования. Для запуска приложения необходимо установить ключ API OpenAI в переменную окружения
`OPENAI_API_KEY`. Ключ API OpenAI можно получить после регистрации на https://platform.openai.com.

Это приложение демонстрирует случай использования генеративного ИИ, который применим в различных предприятиях, таких как:
анализ клиентских отзывов, автоматизация технической поддержки, анализ пользовательских бесед, юридические документы, медицинские записи,
транскрипты встреч, финансовые отчеты и т.д.

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

Код для вышеуказанного приложения :

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
