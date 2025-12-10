---
description: 'Набор данных, содержащий более 28 миллионов записей Hacker News и их векторные представления'
sidebar_label: 'Набор данных для векторного поиска по Hacker News'
slug: /getting-started/example-datasets/hackernews-vector-search-dataset
title: 'Набор данных для векторного поиска по Hacker News'
keywords: ['семантический поиск', 'векторное сходство', 'приближённый поиск ближайших соседей', 'эмбеддинги']
doc_type: 'guide'
---

## Введение {#introduction}

Набор данных [Hacker News](https://news.ycombinator.com/) содержит 28,74 миллиона
публикаций и их векторные эмбеддинги. Эмбеддинги были сгенерированы с помощью модели [SentenceTransformers](https://sbert.net/) [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2). Размерность каждого векторного эмбеддинга — `384`.

Этот набор данных можно использовать для пошагового рассмотрения аспектов проектирования, масштабирования и производительности крупномасштабного
реального приложения векторного поиска, построенного на пользовательских текстовых данных.

## Подробности о наборе данных {#dataset-details}

Полный набор данных с векторными эмбеддингами предоставляется ClickHouse в виде одного файла `Parquet` в [S3-бакете](https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet)

Мы рекомендуем пользователям сначала выполнить оценку размера, чтобы определить требования к хранилищу и памяти для этого набора данных, обратившись к [документации](../../engines/table-engines/mergetree-family/annindexes.md).

## Шаги {#steps}

<VerticalStepper headerLevel="h3">
  ### Создание таблицы

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

  `id` — это просто инкрементное целое число. Дополнительные атрибуты можно использовать в предикатах для работы с
  векторным поиском по сходству в сочетании с постфильтрацией/префильтрацией, как описано в [документации](../../engines/table-engines/mergetree-family/annindexes.md)

  ### Загрузка данных

  Чтобы загрузить набор данных из файла `Parquet`, выполните следующую SQL-команду:

  ```sql
  INSERT INTO hackernews SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet');
  ```

  Вставка 28,74 миллиона строк в таблицу займёт несколько минут.

  ### Создание индекса векторного сходства

  Выполните следующий SQL-запрос, чтобы определить и построить индекс векторного сходства для столбца `vector` таблицы `hackernews`:

  ```sql
  ALTER TABLE hackernews ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 384, 'bf16', 64, 512);

  ALTER TABLE hackernews MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
  ```

  Параметры и аспекты производительности при создании индекса и выполнении поиска описаны в [документации](../../engines/table-engines/mergetree-family/annindexes.md).
  В приведённой выше инструкции используются значения 64 и 512 для гиперпараметров HNSW `M` и `ef_construction` соответственно.
  Необходимо тщательно подбирать оптимальные значения этих параметров, оценивая время построения индекса и качество результатов поиска для выбранных значений.

  Построение и сохранение индекса для полного набора данных из 28,74 млн записей может занять от нескольких минут до часа в зависимости от количества доступных ядер ЦП и пропускной способности системы хранения.

  ### Выполните ANN-поиск

  После построения индекса векторного подобия запросы векторного поиска будут автоматически использовать индекс:

  ```sql title="Query"
  SELECT id, title, text
  FROM hackernews
  ORDER BY cosineDistance( vector, <search vector>)
  LIMIT 10
  ```

  Первая загрузка векторного индекса в память может занять от нескольких секунд до нескольких минут.

  ### Генерация эмбеддингов для поискового запроса

  [Sentence Transformers](https://www.sbert.net/) предоставляют локальные, простые в использовании модели эмбеддингов для извлечения семантического значения предложений и абзацев.

  Набор данных HackerNews содержит векторные эмбеддинги, сгенерированные с помощью модели
  [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2).

  Ниже приведен пример скрипта Python, демонстрирующий программную генерацию
  векторов эмбеддингов с использованием пакета Python `sentence_transformers1`. Поисковый вектор эмбеддинга
  затем передается в качестве аргумента функции [`cosineDistance()`](/sql-reference/functions/distance-functions#cosineDistance) в запросе `SELECT`.

  ```python
  from sentence_transformers import SentenceTransformer
  import sys

  import clickhouse_connect

  print("Инициализация...")

  model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

  chclient = clickhouse_connect.get_client() # ClickHouse credentials here

  while True:
      # Получение поискового запроса от пользователя
      print("Введите поисковый запрос:")
      input_query = sys.stdin.readline();
      texts = [input_query]

      # Запуск модели и получение поискового вектора
      print("Генерация эмбеддинга для ", input_query);
      embeddings = model.encode(texts)

      print("Выполнение запроса к ClickHouse...")
      params = {'v1':list(embeddings[0]), 'v2':20}
      result = chclient.query("SELECT id, title, text FROM hackernews ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)
      print("Результаты:")
      for row in result.result_rows:
          print(row[0], row[2][:100])
          print("---------")
  ```

  Ниже показан пример выполнения приведённого выше Python-скрипта и результаты поиска по сходству
  (выводятся только первые 100 символов из каждого из 20 наиболее релевантных постов):

  ```text
  Инициализация...

  Введите поисковый запрос:
  Полезны ли OLAP-кубы

  Генерация эмбеддинга для "Полезны ли OLAP-кубы"

  Запрос к ClickHouse...

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
  ```

  ## Демонстрационное приложение суммаризации

  Приведенный выше пример демонстрирует семантический поиск и извлечение документов с помощью ClickHouse.

  Далее представлен очень простой, но многообещающий пример приложения с генеративным ИИ.

  Приложение выполняет следующие действия:

  1. Принимает от пользователя в качестве входных данных *тему*
  2. Генерирует вектор эмбеддинга для *topic* с помощью `SentenceTransformers` и модели `all-MiniLM-L6-v2`
  3. Извлекает наиболее релевантные публикации и комментарии с помощью векторного поиска по сходству векторов в таблице `hackernews`
  4. Использует `LangChain` и Chat API OpenAI `gpt-3.5-turbo` для **суммаризации** содержимого, полученного на шаге № 3.
     Посты и комментарии, полученные на шаге № 3, передаются как *контекст* в Chat API и являются ключевым звеном в генеративном ИИ.

  Ниже приведен пример работы приложения суммаризации, за которым следует его код. Для запуска приложения необходимо задать ключ API OpenAI в переменной окружения `OPENAI_API_KEY`. Ключ API OpenAI можно получить после регистрации на [https://platform.openai.com](https://platform.openai.com).

  Данное приложение демонстрирует сценарий использования генеративного ИИ, применимый к различным корпоративным областям, таким как:
  анализ тональности отзывов клиентов, автоматизация технической поддержки, извлечение данных из пользовательских диалогов, юридические документы, медицинские записи,
  протоколы встреч, финансовая отчетность и т. д.

  ```shell
  $ python3 summarize.py

  Введите тему поиска:
  ClickHouse performance experiences

  Генерация векторного представления для ---->  ClickHouse performance experiences

  Выполнение запроса к ClickHouse для получения релевантных статей...

  Инициализация модели chatgpt-3.5-turbo...

  Формирование сводки по результатам поиска из ClickHouse...

  Сводка от chatgpt-3.5:
  Обсуждение посвящено сравнению ClickHouse с различными базами данных, такими как TimescaleDB, Apache Spark,
  AWS Redshift и QuestDB, с акцентом на высокую производительность ClickHouse при низких затратах и его пригодность
  для аналитических приложений. Пользователи отмечают простоту, скорость и эффективное использование ресурсов
  ClickHouse при обработке крупномасштабных аналитических нагрузок, хотя упоминаются некоторые сложности, такие как операции DML и трудности с резервным копированием. ClickHouse признан за возможности вычисления агрегатов в реальном времени и надежную инженерную реализацию, при этом проводятся сравнения с другими базами данных, такими как Druid и MemSQL. В целом ClickHouse рассматривается
  как мощный инструмент для обработки данных в реальном времени, аналитики и эффективной работы с большими объемами данных,
  набирающий популярность благодаря впечатляющей производительности и экономической эффективности.
  ```

  Код для приложения выше:

  ```python
  print("Инициализация...")

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
      print("Введите тему для поиска:")
      input_query = sys.stdin.readline();
      texts = [input_query]

      # Запустить модель и получить поисковый вектор
      print("Генерация эмбеддинга для ----> ", input_query);
      embeddings = model.encode(texts)

      print("Выполнение запроса к ClickHouse...")
      params = {'v1':list(embeddings[0]), 'v2':100}
      result = chclient.query("SELECT id,title,text FROM hackernews ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

      # Объединить все результаты поиска
      doc_results = ""
      for row in result.result_rows:
          doc_results = doc_results + "\n" + row[2]

      print("Инициализация модели chatgpt-3.5-turbo")
      model_name = "gpt-3.5-turbo"

      text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
          model_name=model_name
      )

      texts = text_splitter.split_text(doc_results)

      docs = [Document(page_content=t) for t in texts]

      llm = ChatOpenAI(temperature=0, model_name=model_name)

      prompt_template = """
  Напишите краткое резюме следующего текста не более чем в 10 предложениях:


  {text}


  КРАТКОЕ РЕЗЮМЕ:
  """

      prompt = PromptTemplate(template=prompt_template, input_variables=["text"])

      num_tokens = num_tokens_from_string(doc_results, model_name)

      gpt_35_turbo_max_tokens = 4096
      verbose = False

      print("Формирование резюме результатов поиска из ClickHouse...")

      if num_tokens <= gpt_35_turbo_max_tokens:
          chain = load_summarize_chain(llm, chain_type="stuff", prompt=prompt, verbose=verbose)
      else:
          chain = load_summarize_chain(llm, chain_type="map_reduce", map_prompt=prompt, combine_prompt=prompt, verbose=verbose)

      summary = chain.run(docs)

      print(f"Резюме от chatgpt-3.5: {summary}")
  ```
</VerticalStepper>