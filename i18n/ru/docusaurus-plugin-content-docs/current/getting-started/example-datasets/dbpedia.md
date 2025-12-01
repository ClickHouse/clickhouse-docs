---
description: 'Набор данных, содержащий 1 миллион статей из Википедии и их векторные эмбеддинги'
sidebar_label: 'набор данных dbpedia'
slug: /getting-started/example-datasets/dbpedia-dataset
title: 'набор данных dbpedia'
keywords: ['семантический поиск', 'векторное сходство', 'приближённые ближайшие соседи', 'эмбеддинги']
doc_type: 'guide'
---

[Набор данных dbpedia](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M) содержит 1 миллион статей из Википедии и их векторные эмбеддинги, сгенерированные с помощью модели [text-embedding-3-large](https://platform.openai.com/docs/models/text-embedding-3-large) от OpenAI.

Этот набор данных является отличной отправной точкой для понимания векторных эмбеддингов, поиска по векторному сходству и генеративного ИИ. Мы используем этот набор данных для демонстрации [поиска приближённых ближайших соседей](../../engines/table-engines/mergetree-family/annindexes.md) в ClickHouse и простого, но мощного Q&A‑приложения.

## Подробности о наборе данных {#dataset-details}

Набор данных содержит 26 файлов в формате `Parquet`, размещённых на [huggingface.co](https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/). Файлы называются `0.parquet`, `1.parquet`, ..., `25.parquet`. Чтобы просмотреть несколько строк этого набора данных в качестве примера, перейдите на эту [страницу Hugging Face](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M).

## Создание таблицы {#create-table}

Создайте таблицу `dbpedia` для хранения идентификатора статьи, заголовка, текста и векторного представления (эмбеддинга):

```sql
CREATE TABLE dbpedia
(
  id      String,
  title   String,
  text    String,
  vector  Array(Float32) CODEC(NONE)
) ENGINE = MergeTree ORDER BY (id);

```


## Загрузка таблицы {#load-table}

Чтобы загрузить набор данных из всех файлов Parquet, выполните следующую команду в оболочке:

```shell
$ seq 0 25 | xargs -P1 -I{} clickhouse client -q "INSERT INTO dbpedia SELECT _id, title, text, \"text-embedding-3-large-1536-embedding\" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/{}.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;"
```

Также можно выполнить отдельные SQL‑запросы, как показано ниже, чтобы загрузить каждый из 25 файлов Parquet:

```sql
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/0.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/1.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
...
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/25.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;

```

Убедитесь, что в таблице `dbpedia` содержится 1 миллион строк:

```sql
SELECT count(*)
FROM dbpedia

   ┌─count()─┐
1. │ 1000000 │
   └─────────┘
```


## Семантический поиск {#semantic-search}

Рекомендуемая литература: [руководство OpenAPI по векторным эмбеддингам](https://platform.openai.com/docs/guides/embeddings)

Семантический поиск (также называемый _поиском по сходству_) с использованием векторных эмбеддингов включает следующие шаги:

- Принять поисковый запрос от пользователя на естественном языке, например _«Расскажи мне о живописных железнодорожных маршрутах»_, _«Романы в жанре саспенс, действие которых происходит в Европе»_ и т. д.
- Сгенерировать вектор эмбеддинга для поискового запроса с использованием модели LLM
- Найти ближайших соседей для вектора эмбеддинга запроса в наборе данных

_Ближайшими соседями_ являются документы, изображения или другой контент, релевантный запросу пользователя.
Извлечённые результаты являются ключевыми входными данными для Retrieval Augmented Generation (RAG) в приложениях генеративного ИИ.

## Выполнить векторный поиск ближайших соседей методом полного перебора {#run-a-brute-force-vector-similarity-search}

Поиск KNN (k ближайших соседей) или поиск методом полного перебора предполагает вычисление расстояния от каждого вектора в наборе данных
до вектора-запроса (эмбеддинга), а затем упорядочивание этих расстояний для получения ближайших соседей. Для набора данных `dbpedia`
простой способ визуально оценить семантический поиск — использовать векторные представления из самого набора данных в качестве поисковых
векторов. Например:

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
Получено 20 строк. Прошло: 0.261 сек. Обработано 1.00 млн строк, 6.22 ГБ (3.84 млн строк/с., 23.81 ГБ/с.)
```

Запишите задержку выполнения запроса, чтобы мы могли сравнить её с задержкой запроса для ANN (с использованием векторного индекса).
Также зафиксируйте задержку выполнения запроса при холодном файловом кэше ОС и с `max_threads=1`, чтобы оценить реальное использование вычислительных ресурсов и пропускную способность подсистемы хранения (экстраполируйте это на производственный набор данных с миллионами векторов!).


## Создание индекса векторного сходства {#build-vector-similarity-index}

Выполните следующий SQL-запрос, чтобы определить и построить индекс векторного сходства для столбца `vector`:

```sql
ALTER TABLE dbpedia ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 1536, 'bf16', 64, 512);

ALTER TABLE dbpedia MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

Параметры и характеристики производительности при создании и поиске по индексу описаны в [документации](../../engines/table-engines/mergetree-family/annindexes.md).

Построение и сохранение индекса может занять несколько минут в зависимости от количества доступных ядер CPU и пропускной способности подсистемы хранения.


## Выполнение ANN-поиска {#perform-ann-search}

*Approximate Nearest Neighbours* (ANN, приближённые ближайшие соседи) — это группа техник (например, специальные структуры данных, такие как графы и случайные леса), которые позволяют выполнять поиск значительно быстрее, чем точный векторный поиск. Точность результатов, как правило, «достаточно хороша» для практического применения. Во многих приближённых техниках предусмотрены параметры для настройки компромисса между точностью результатов и временем поиска.

После построения индекса векторного сходства запросы векторного поиска будут автоматически использовать этот индекс:

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
Получено 20 строк. Прошло: 0.025 сек. Обработано 32.03 тыс. строк, 2.10 МБ (1.29 млн строк/с., 84.80 МБ/с.)
```


## Генерация эмбеддингов для поискового запроса {#generating-embeddings-for-search-query}

Запросы поиска по сходству, рассмотренные до этого момента, используют один из существующих векторов в таблице `dbpedia`
в качестве поискового вектора. В реальных приложениях поисковый вектор необходимо
генерировать для пользовательского запроса, который может быть сформулирован на естественном языке. Поисковый вектор
следует генерировать с использованием той же LLM-модели, которая применялась для генерации эмбеддинг-векторов
для набора данных.

Ниже приведён пример скрипта на Python, демонстрирующий, как программно вызывать OpenAI API
для генерации эмбеддинг-векторов с использованием модели `text-embedding-3-large`. Затем полученный поисковый эмбеддинг-вектор
передаётся в качестве аргумента функции `cosineDistance()` в запросе `SELECT`.

Для запуска скрипта требуется задать ключ OpenAI API в переменной окружения `OPENAI_API_KEY`.
Ключ OpenAI API можно получить после регистрации на [https://platform.openai.com](https://platform.openai.com).

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
    # Получить поисковый запрос от пользователя
    print("Введите поисковый запрос:")
    input_query = sys.stdin.readline();

    # Вызвать API OpenAI для получения эмбеддинга
    print("Генерация эмбеддинга для ", input_query);
    embedding = get_embedding(input_query,
                              model='text-embedding-3-large')

    # Выполнить векторный поисковый запрос в ClickHouse
    print("Выполнение запроса к ClickHouse...")
    params = {'v1':embedding, 'v2':10}
    result = ch_client.query("SELECT id,title,text FROM dbpedia ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

    for row in result.result_rows:
        print(row[0], row[1], row[2])
        print("---------------")
```


## Демонстрационное приложение «Вопрос-ответ» {#q-and-a-demo-application}

Приведённые выше примеры демонстрировали семантический поиск и извлечение документов с использованием ClickHouse. Далее представлено очень простое, но обладающее высоким потенциалом демонстрационное приложение генеративного ИИ.

Приложение выполняет следующие шаги:

1. Принимает *тему* в качестве входного параметра от пользователя
2. Генерирует векторное представление (эмбеддинг) для *темы*, вызывая OpenAI API с моделью `text-embedding-3-large`
3. Извлекает наиболее релевантные статьи/документы из Wikipedia, выполняя поиск по сходству векторов в таблице `dbpedia`
4. Принимает произвольный вопрос на естественном языке от пользователя, относящийся к *теме*
5. Использует Chat API OpenAI `gpt-3.5-turbo` для ответа на вопрос на основе знаний из документов, полученных на шаге № 3.
   Документы, полученные на шаге № 3, передаются в качестве *контекста* в Chat API и являются ключевым звеном в генеративном ИИ.

Пара примеров диалогов при запуске приложения «Вопрос-ответ» приведена ниже, после чего следует код
приложения «Вопрос-ответ». Для запуска приложения требуется задать ключ OpenAI API в
переменной окружения `OPENAI_API_KEY`. Ключ OpenAI API можно получить после регистрации на сайте [https://platform.openai.com](https://platform.openai.com).

```shell
$ python3 QandA.py

Введите тему: FIFA world cup 1990
Генерация эмбеддинга для 'FIFA world cup 1990' и сбор 100 статей по этой теме из ClickHouse...

Введите ваш вопрос: Who won the golden boot
Сальваторе Скиллачи из Италии выиграл «Золотую бутсу» на чемпионате мира по футболу 1990 года.


Введите тему: Cricket world cup
Генерация эмбеддинга для 'Cricket world cup' и сбор 100 статей по этой теме из ClickHouse...

Введите ваш вопрос: Which country has hosted the world cup most times
Англия и Уэльс принимали чемпионат мира по крикету наибольшее количество раз — турнир проводился в этих странах пять раз: в 1975, 1979, 1983, 1999 и 2019 годах.

$
```

Код:

```Python
import sys
import time
from openai import OpenAI
import clickhouse_connect

ch_client = clickhouse_connect.get_client(compress=False) # Передайте учетные данные ClickHouse здесь
openai_client = OpenAI() # Установите переменную окружения OPENAI_API_KEY

def get_embedding(text, model):
  text = text.replace("\n", " ")
  return openai_client.embeddings.create(input = [text], model=model, dimensions=1536).data[0].embedding

while True:
    # Получить тему от пользователя
    print("Введите тему: ", end="", flush=True)
    input_query = sys.stdin.readline()
    input_query = input_query.rstrip()

    # Сгенерировать вектор эмбеддинга для темы поиска и выполнить запрос к ClickHouse
    print("Генерация эмбеддинга для '" + input_query + "' и сбор 100 связанных статей из ClickHouse...");
    embedding = get_embedding(input_query,
                              model='text-embedding-3-large')

    params = {'v1':embedding, 'v2':100}
    result = ch_client.query("SELECT id,title,text FROM dbpedia ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

    # Собрать все найденные статьи/документы
    results = ""
    for row in result.result_rows:
        results = results + row[2]

    print("\nВведите ваш вопрос: ", end="", flush=True)
    question = sys.stdin.readline();

    # Промпт для OpenAI Chat API
    query = f"""Используйте приведенное ниже содержимое для ответа на следующий вопрос. Если ответ не найден, напишите «Я не знаю».

Содержимое:
\"\"\"
{results}
\"\"\"

Вопрос: {question}"""

    GPT_MODEL = "gpt-3.5-turbo"
    response = openai_client.chat.completions.create(
        messages=[
        {'role': 'system', 'content': "Вы отвечаете на вопросы о {input_query}."},
        {'role': 'user', 'content': query},
       ],
       model=GPT_MODEL,
       temperature=0,
    )

    # Вывести ответ на вопрос!
    print(response.choices[0].message.content)
    print("\n")
```
