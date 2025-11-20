---
description: 'Набор данных, содержащий более 28 миллионов публикаций Hacker News и их векторные эмбеддинги'
sidebar_label: 'Набор данных для векторного поиска по Hacker News'
slug: /getting-started/example-datasets/hackernews-vector-search-dataset
title: 'Набор данных для векторного поиска по Hacker News'
keywords: ['semantic search', 'vector similarity', 'approximate nearest neighbours', 'embeddings']
doc_type: 'guide'
---



## Введение {#introduction}

[Набор данных Hacker News](https://news.ycombinator.com/) содержит 28,74 миллиона
публикаций и их векторные эмбеддинги. Эмбеддинги были сгенерированы с использованием модели [SentenceTransformers](https://sbert.net/) [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2). Размерность каждого вектора эмбеддинга составляет `384`.

Этот набор данных можно использовать для изучения аспектов проектирования, масштабирования и производительности крупномасштабного
приложения векторного поиска в реальных условиях, построенного на основе пользовательских текстовых данных.


## Детали набора данных {#dataset-details}

Полный набор данных с векторными эмбеддингами доступен от ClickHouse в виде одного файла `Parquet` в [бакете S3](https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet)

Рекомендуется сначала провести оценку размера для определения требований к хранилищу и памяти для этого набора данных, обратившись к [документации](../../engines/table-engines/mergetree-family/annindexes.md).


## Шаги {#steps}

<VerticalStepper headerLevel="h3">

### Создание таблицы {#create-table}

Создайте таблицу `hackernews` для хранения публикаций, их эмбеддингов и связанных атрибутов:

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

Поле `id` представляет собой инкрементируемое целое число. Дополнительные атрибуты могут использоваться в предикатах для реализации поиска по векторному сходству в сочетании с пост-фильтрацией/пре-фильтрацией, как описано в [документации](../../engines/table-engines/mergetree-family/annindexes.md)

### Загрузка данных {#load-table}

Чтобы загрузить набор данных из файла `Parquet`, выполните следующий SQL-запрос:

```sql
INSERT INTO hackernews SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet');
```

Вставка 28,74 миллионов строк в таблицу займет несколько минут.

### Построение индекса векторного сходства {#build-vector-similarity-index}

Выполните следующий SQL-запрос для определения и построения индекса векторного сходства на столбце `vector` таблицы `hackernews`:

```sql
ALTER TABLE hackernews ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 384, 'bf16', 64, 512);

ALTER TABLE hackernews MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

Параметры и соображения производительности для создания индекса и поиска описаны в [документации](../../engines/table-engines/mergetree-family/annindexes.md).
Приведенный выше запрос использует значения 64 и 512 соответственно для гиперпараметров HNSW `M` и `ef_construction`.
Пользователям необходимо тщательно выбирать оптимальные значения для этих параметров, оценивая время построения индекса и качество результатов поиска
для выбранных значений.

Построение и сохранение индекса может занять от нескольких минут до часа для полного набора данных из 28,74 миллионов записей, в зависимости от количества доступных ядер процессора и пропускной способности хранилища.

### Выполнение ANN-поиска {#perform-ann-search}

После построения индекса векторного сходства запросы векторного поиска будут автоматически использовать индекс:

```sql title="Query"
SELECT id, title, text
FROM hackernews
ORDER BY cosineDistance( vector, <search vector>)
LIMIT 10

```

Первая загрузка векторного индекса в память может занять несколько секунд или минут.

### Генерация эмбеддингов для поискового запроса {#generating-embeddings-for-search-query}

[Sentence Transformers](https://www.sbert.net/) предоставляют локальные, простые в использовании модели эмбеддингов для извлечения семантического значения предложений и абзацев.

Набор данных HackerNews содержит векторные эмбеддинги, сгенерированные с помощью модели
[all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2).

Ниже приведен пример скрипта Python, демонстрирующий, как программно генерировать
векторные эмбеддинги с использованием пакета Python `sentence_transformers`. Затем вектор поискового эмбеддинга
передается в качестве аргумента функции [`cosineDistance()`](/sql-reference/functions/distance-functions#cosineDistance) в запросе `SELECT`.

```python
from sentence_transformers import SentenceTransformer
import sys

import clickhouse_connect

print("Initializing...")

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

chclient = clickhouse_connect.get_client() # ClickHouse credentials here

while True:
    # Получение поискового запроса от пользователя
    print("Enter a search query :")
    input_query = sys.stdin.readline();
    texts = [input_query]

    # Запуск модели и получение вектора поиска
    print("Generating the embedding for ", input_query);
    embeddings = model.encode(texts)

```


    print("Выполняется запрос к ClickHouse...")
    params = {'v1':list(embeddings[0]), 'v2':20}
    result = chclient.query("SELECT id, title, text FROM hackernews ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)
    print("Результаты:")
    for row in result.result_rows:
        print(row[0], row[2][:100])
        print("---------")

````

Ниже приведён пример запуска указанного выше Python-скрипта и результатов поиска по сходству
(выводятся только первые 100 символов из каждой из 20 наиболее релевантных записей):

```text
Инициализация...

Введите поисковый запрос:
Are OLAP cubes useful

Генерация векторного представления (эмбеддинга) для запроса «Are OLAP cubes useful»

Выполняется запрос к ClickHouse...

Результаты:

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


## Демонстрационное приложение для суммаризации {#summarization-demo-application}

Приведенный выше пример продемонстрировал семантический поиск и извлечение документов с использованием ClickHouse.

Далее представлено очень простое, но многообещающее демонстрационное приложение генеративного ИИ.

Приложение выполняет следующие шаги:

1. Принимает _тему_ в качестве входных данных от пользователя
2. Генерирует вектор эмбеддинга для _темы_ с использованием `SentenceTransformers` с моделью `all-MiniLM-L6-v2`
3. Извлекает наиболее релевантные посты/комментарии с использованием векторного поиска по сходству в таблице `hackernews`
4. Использует `LangChain` и OpenAI `gpt-3.5-turbo` Chat API для **суммаризации** содержимого, извлеченного на шаге №3.
   Посты/комментарии, извлеченные на шаге №3, передаются в качестве _контекста_ в Chat API и являются ключевым звеном в генеративном ИИ.

Ниже сначала приведен пример запуска приложения для суммаризации, а затем код
приложения для суммаризации. Для запуска приложения требуется установить ключ OpenAI API в переменную окружения `OPENAI_API_KEY`. Ключ OpenAI API можно получить после регистрации на https://platform.openai.com.

Это приложение демонстрирует сценарий использования генеративного ИИ, применимый к множеству корпоративных областей, таких как:
анализ настроений клиентов, автоматизация технической поддержки, анализ пользовательских диалогов, юридические документы, медицинские записи,
расшифровки совещаний, финансовые отчеты и т. д.

```shell
$ python3 summarize.py

Введите тему поиска:
Опыт производительности ClickHouse

Генерация эмбеддинга для ---->  Опыт производительности ClickHouse

Запрос к ClickHouse для извлечения релевантных статей...

Инициализация модели chatgpt-3.5-turbo...

Суммаризация результатов поиска, извлеченных из ClickHouse...

Резюме от chatgpt-3.5:
Обсуждение сосредоточено на сравнении ClickHouse с различными базами данных, такими как TimescaleDB, Apache Spark,
AWS Redshift и QuestDB, подчеркивая экономически эффективную высокую производительность ClickHouse и его пригодность
для аналитических приложений. Пользователи хвалят ClickHouse за его простоту, скорость и эффективность использования ресурсов
при обработке крупномасштабных аналитических рабочих нагрузок, хотя упоминаются некоторые проблемы, такие как DML и сложности с резервным копированием. ClickHouse признан за свои возможности вычисления агрегатов в реальном времени и надежную
инженерную реализацию, с сравнениями с другими базами данных, такими как Druid и MemSQL. В целом ClickHouse рассматривается
как мощный инструмент для обработки данных в реальном времени, аналитики и эффективной обработки больших объемов данных,
набирающий популярность благодаря впечатляющей производительности и экономической эффективности.
```

Код для приведенного выше приложения:

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
    # Получить поисковый запрос от пользователя
    print("Enter a search topic :")
    input_query = sys.stdin.readline();
    texts = [input_query]

    # Запустить модель и получить поисковый или референсный вектор
    print("Generating the embedding for ----> ", input_query);
    embeddings = model.encode(texts)

    print("Querying ClickHouse...")
    params = {'v1':list(embeddings[0]), 'v2':100}
    result = chclient.query("SELECT id,title,text FROM hackernews ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

    # Просто объединить все результаты поиска
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

```


    num_tokens = num_tokens_from_string(doc_results, model_name)

    gpt_35_turbo_max_tokens = 4096
    verbose = False

    print("Формирование сводки результатов поиска, полученных из ClickHouse...")

    if num_tokens <= gpt_35_turbo_max_tokens:
        chain = load_summarize_chain(llm, chain_type="stuff", prompt=prompt, verbose=verbose)
    else:
        chain = load_summarize_chain(llm, chain_type="map_reduce", map_prompt=prompt, combine_prompt=prompt, verbose=verbose)

    summary = chain.run(docs)

    print(f"Сводка от chatgpt-3.5: {summary}")

```
</VerticalStepper>
```
