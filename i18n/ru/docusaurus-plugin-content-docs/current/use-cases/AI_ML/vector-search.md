---
slug: /use-cases/AI/qbit-vector-search
sidebar_label: 'Векторный поиск с QBit'
title: 'Введение в векторный поиск и QBit'
pagination_prev: null
pagination_next: null
description: 'Узнайте, как QBit обеспечивает динамическую настройку точности запросов векторного поиска в ClickHouse.'
keywords: ['QBit', 'vector search', 'AI', 'эмбеддинги', 'ANN']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import diagram_1 from '@site/static/images/use-cases/AI_ML/QBit/diagram_1.jpg';
import diagram_2 from '@site/static/images/use-cases/AI_ML/QBit/diagram_2.jpg';
import diagram_3 from '@site/static/images/use-cases/AI_ML/QBit/diagram_3.jpg';
import diagram_4 from '@site/static/images/use-cases/AI_ML/QBit/diagram_4.jpg';
import diagram_5 from '@site/static/images/use-cases/AI_ML/QBit/diagram_5.jpg';
import diagram_6 from '@site/static/images/use-cases/AI_ML/QBit/diagram_6.jpg';
import diagram_7 from '@site/static/images/use-cases/AI_ML/QBit/diagram_7.jpg';
import diagram_8 from '@site/static/images/use-cases/AI_ML/QBit/diagram_8.jpg';
import diagram_9 from '@site/static/images/use-cases/AI_ML/QBit/diagram_9.jpg';
import diagram_10 from '@site/static/images/use-cases/AI_ML/QBit/diagram_10.jpg';
import diagram_11 from '@site/static/images/use-cases/AI_ML/QBit/diagram_11.jpg';
import diagram_12 from '@site/static/images/use-cases/AI_ML/QBit/diagram_12.jpg';
import diagram_13 from '@site/static/images/use-cases/AI_ML/QBit/diagram_13.jpg';
import diagram_14 from '@site/static/images/use-cases/AI_ML/QBit/diagram_14.jpg';
import diagram_15 from '@site/static/images/use-cases/AI_ML/QBit/diagram_15.jpg';
import diagram_16 from '@site/static/images/use-cases/AI_ML/QBit/diagram_16.jpg';
import diagram_17 from '@site/static/images/use-cases/AI_ML/QBit/diagram_17.jpg';

:::note[В этом руководстве вы:]

* Кратко познакомитесь с векторным поиском
* Узнаете об Approximate Nearest Neighbours (ANN) и Hierarchical Navigable Small World (HNSW)
* Познакомитесь с подходом Quantised Bit (QBit)
* Используете QBit для выполнения векторного поиска по набору данных DBPedia
  :::


## Введение в векторный поиск \\{#vector-search-primer\\}

В математике и физике вектор формально определяется как объект, который имеет и величину, и направление.
Чаще всего его изображают в виде отрезка или стрелки в пространстве; он может использоваться для представления таких величин, как скорость, сила и ускорение.
В информатике вектор — это конечная последовательность чисел.
Другими словами, это структура данных, используемая для хранения числовых значений.

В машинном обучении векторы — это те же структуры данных, о которых мы говорим в информатике, но числовые значения, хранящиеся в них, имеют особый смысл.
Когда мы берём блок текста или изображение и сводим их к ключевым концепциям, которые они представляют, этот процесс называется кодированием (encoding).
Получившийся результат — это представление этих ключевых концепций в числовой форме для машины.
Это и есть эмбеддинг (embedding), который хранится во векторе.
Иными словами, когда контекстное значение закодировано во векторе, мы можем называть его эмбеддингом.

Векторный поиск сейчас повсюду.
Он лежит в основе музыкальных рекомендаций, retrieval-augmented generation (RAG) для больших языковых моделей, где внешние знания подгружаются для улучшения ответов, и даже поиск в Google в некоторой степени работает на векторном поиске.

Пользователи часто предпочитают обычные базы данных с ad hoc‑возможностями работы с векторами полностью специализированным векторным хранилищам, несмотря на преимущества специализированных баз данных.
ClickHouse поддерживает [brute-force векторный поиск](/engines/table-engines/mergetree-family/annindexes#exact-nearest-neighbor-search), а также [методы приблизительного поиска ближайших соседей (ANN)](/engines/table-engines/mergetree-family/annindexes#approximate-nearest-neighbor-search), включая HNSW — текущий стандарт для быстрого поиска по векторам.

### Понимание эмбеддингов \{#understanding-embeddings\}

Рассмотрим простой пример, чтобы понять, как работает векторный поиск.
Возьмём эмбеддинги (векторные представления) слов:

<Image size="md" img={diagram_4} alt="Визуализация эмбеддингов фруктов и животных" />

Создайте таблицу ниже с несколькими примерами эмбеддингов:

```sql
CREATE TABLE fruit_animal
ENGINE = MergeTree
ORDER BY word
AS SELECT *
FROM VALUES(
  'word String, vec Array(Float64)',
  ('apple', [-0.99105519, 1.28887844, -0.43526649, -0.98520696, 0.66154391]),
  ('banana', [-0.69372815, 0.25587061, -0.88226235, -2.54593015, 0.05300475]),
  ('orange', [0.93338752, 2.06571317, -0.54612565, -1.51625717, 0.69775337]),
  ('dog', [0.72138876, 1.55757105, 2.10953259, -0.33961248, -0.62217325]),
  ('horse', [-0.61435682, 0.48542571, 1.21091247, -0.62530446, -1.33082533])
);
```

Вы можете найти наиболее похожие слова по заданному эмбеддингу:

```sql
SELECT word, L2Distance(
  vec, [-0.88693672, 1.31532824, -0.51182908, -0.99652702, 0.59907770]
) AS distance
FROM fruit_animal
ORDER BY distance
LIMIT 5;
```

```response
┌─word───┬────────────distance─┐
│ apple  │ 0.14639757188169716 │
│ banana │  1.9989613690076786 │
│ orange │   2.039041552613732 │
│ horse  │  2.7555776805484813 │
│ dog    │   3.382295083120104 │
└────────┴─────────────────────┘
```

Эмбеддинг запроса ближе всего к «apple» (имеет наименьшее расстояние), что логично, если посмотреть на эти два эмбеддинга рядом:

```response
apple:           [-0.99105519,1.28887844,-0.43526649,-0.98520696,0.66154391]
query embedding: [-0.88693672,1.31532824,-0.51182908,-0.99652702,0.5990777]
```


## Приближённые ближайшие соседи (ANN) \\{#approximate-nearest-neighbours\\}

Для больших наборов данных полный перебор становится слишком медленным.
В таких случаях используют методы приближённого поиска ближайших соседей.

### Квантизация \\{#quantisation\\}

Квантизация предполагает приведение к меньшим числовым типам.
Меньшие числа означают меньший объём данных, а меньший объём данных означает более быстрые вычисления расстояний.
Векторизованный движок выполнения запросов ClickHouse может уместить больше значений в регистры процессора за одну операцию, напрямую увеличивая пропускную способность.

У вас есть два варианта:

1. **Хранить квантизованную копию вместе с исходным столбцом** — это удваивает объём хранилища, но безопасно, так как мы всегда можем вернуться к полной точности
2. **Полностью заменить исходные значения** (приводя их к меньшему типу при вставке) — это экономит место и I/O, но такая операция необратима

### Hierarchical Navigable Small World (HNSW) \\{#hnsw\\}

<Image size="md" img={diagram_1} alt="Структура слоёв HNSW"/>

HNSW строится из нескольких слоёв узлов (векторов). Каждый узел случайным образом назначается в один или несколько слоёв, при этом вероятность появления на более высоких слоях экспоненциально уменьшается.

При поиске мы начинаем с узла на верхнем слое и жадно движемся к ближайшим соседям. Как только более близкий узел найти не удаётся, мы спускаемся на следующий, более плотный слой.

Благодаря такой многослойной архитектуре HNSW обеспечивает логарифмическую сложность поиска по числу узлов.

:::warning[Ограничения HNSW]
Основное ограничение — потребление памяти. ClickHouse использует реализацию HNSW [usearch](https://github.com/unum-cloud/usearch), которая представляет собой хранящуюся в памяти структуру данных и не поддерживает шардирование.
В результате для более крупных наборов данных требуется пропорционально больший объём RAM.
:::

### Сравнение подходов \\{#comparison-approaches\\}

| Категория | Brute-force | HNSW | QBit |
|----------|-------------|------|------|
| **Точность** | Идеальная | Отличная | Гибкая |
| **Скорость** | Медленная | Быстрая | Гибкая |
| **Прочее** | Квантование: больше занимаемое пространство или необратимая потеря точности | Индекс должен помещаться в память и быть построен заранее | По-прежнему O(#записей) |

## Подробный разбор QBit \\{#qbit-deepdive\\}

### Квантованный бит (QBit) \\{#quantised-bit\\}

QBit — это новая структура данных, которая может хранить значения `BFloat16`, `Float32` и `Float64`, используя то, как числа с плавающей запятой представлены — в виде битов.
Вместо того чтобы сохранять каждое число целиком, QBit разбивает значения на **битовые плоскости**: каждый первый бит, каждый второй бит, каждый третий бит и так далее.

<Image size="md" img={diagram_2} alt="Концепция битовых плоскостей QBit"/>

Такой подход устраняет основное ограничение традиционного квантования. Нет необходимости хранить дублирующиеся данные или рисковать потерей смысла значений. Он также избавляет от узких мест по оперативной памяти, характерных для HNSW, поскольку QBit работает напрямую с сохранёнными данными, а не поддерживает индекс в памяти.

:::tip[Преимущество]
**И что особенно важно — не требуется заранее принимать решения.**
Точность и производительность можно динамически настраивать во время выполнения запроса, что позволяет пользователям с минимальными усилиями подбирать баланс между точностью и скоростью.
:::

:::note Ограничение
Хотя QBit ускоряет векторный поиск, его вычислительная сложность остаётся O(n). Иными словами: если ваш набор данных достаточно мал, чтобы индекс HNSW без проблем помещался в оперативной памяти, это по-прежнему будет самый быстрый вариант.
:::

### Тип данных \{#the-data-type\}

Вот как создать столбец QBit:

```sql
SET allow_experimental_qbit_type = 1;
CREATE TABLE fruit_animal
(
  word String,
  vec QBit(Float64, 5)
)
ENGINE = MergeTree
ORDER BY word;

INSERT INTO fruit_animal VALUES
('apple',  [-0.99105519, 1.28887844, -0.43526649, -0.98520696, 0.66154391]),
('banana', [-0.69372815, 0.25587061, -0.88226235, -2.54593015, 0.05300475]),
('orange', [0.93338752, 2.06571317, -0.54612565, -1.51625717, 0.69775337]),
('dog',    [0.72138876, 1.55757105, 2.10953259, -0.33961248, -0.62217325]),
('horse',  [-0.61435682, 0.48542571, 1.21091247, -0.62530446, -1.33082533]);
```

<Image size="md" img={diagram_5} alt="Транспонирование структуры данных QBit" />

Когда данные вставляются в столбец QBit, они транспонируются так, чтобы все первые биты выстраивались вместе, все вторые биты выстраивались вместе и так далее. Мы называем их **группами**.

Каждая группа хранится в отдельном столбце `FixedString(N)`: строки фиксированной длины N байт, которые хранятся последовательно в памяти без разделителей между ними. Все такие группы затем объединяются в один `Tuple`, который и образует базовую структуру QBit.

**Пример:** если мы начинаем с вектора из 8×Float64 элементов, каждая группа будет содержать 8 бит. Поскольку один Float64 содержит 64 бита, в итоге мы получаем 64 группы (по одной на каждый бит). Поэтому внутренняя структура `QBit(Float64, 8)` выглядит как `Tuple` из 64 столбцов типа `FixedString(1)`.

:::tip
Если исходная длина вектора не делится на 8 без остатка, структура дополняется невидимыми элементами, чтобы выровнять длину до 8. Это обеспечивает совместимость с `FixedString`, который работает строго с целыми байтами.
:::


### Вычисление расстояния \{#the-distance-calculation\}

При выполнении запросов с QBit используйте функцию [`L2DistanceTransposed`](/sql-reference/functions/distance-functions#L2DistanceTransposed) с параметром точности:

```sql
SELECT
  word,
  L2DistanceTransposed(vec, [-0.88693672, 1.31532824, -0.51182908, -0.99652702, 0.59907770], 16) AS distance
FROM fruit_animal
ORDER BY distance;
```

```response
┌─word───┬────────────distance─┐
│ apple  │ 0.15196434766705247 │
│ banana │   1.966091150410285 │
│ orange │  1.9864477714218596 │
│ horse  │  2.7306267946594005 │
│ dog    │  3.2849989362383165 │
└────────┴─────────────────────┘
```

Третий параметр (16) определяет точность в битах.


### Оптимизация ввода-вывода \\{#io-optimisation\\}

<Image size="md" img={diagram_3} alt="Оптимизация ввода-вывода в QBit"/>

Прежде чем вычислять расстояния, необходимые данные должны быть считаны с диска, а затем детранспонированы (преобразованы обратно из сгруппированного побитового представления в полные векторы). Поскольку QBit хранит значения в побитово транспонированном виде по уровням точности, ClickHouse может считывать только старшие битовые плоскости, необходимые для восстановления чисел с требуемой точностью.

В запросе выше мы используем уровень точности 16. Поскольку Float64 имеет 64 бита, мы считываем только первые 16 битовых плоскостей, **пропуская 75% данных**.

<Image size="md" img={diagram_6} alt="Реконструкция QBit"/>

После чтения мы реконструируем только верхнюю часть каждого числа из загруженных битовых плоскостей, оставляя непрочитанные биты равными нулю.

### Оптимизация вычислений \\{#calculation-optimisation\\}

<Image size="md" img={diagram_7} alt="Сравнение даункастинга"/>

Можно задаться вопросом, устранило бы приведение к меньшему типу, такому как Float32 или BFloat16, эту неиспользуемую часть. Это работает, но явные приведения оказываются дорогими, когда выполняются для каждой строки.

Вместо этого мы можем понизить разрядность только у опорного вектора и обрабатывать данные QBit так, как если бы они содержали значения меньшей разрядности («забыв» о существовании некоторых столбцов), поскольку их формат хранения часто соответствует усечённой версии этих типов.

#### Оптимизация BFloat16 \\{#bfloat16-optimization\\}

BFloat16 — это Float32, усечённый наполовину. Он сохраняет тот же бит знака и 8-битный показатель степени, но только верхние 7 бит из 23-битной мантиссы. Поэтому чтение первых 16 битовых плоскостей из столбца QBit фактически воспроизводит расположение в памяти значений BFloat16. В этом случае мы можем (и делаем это) безопасно преобразовать опорный вектор в BFloat16.

#### Сложность Float64 \\{#float64-complexity\\}

Однако с Float64 всё обстоит иначе. Он использует 11-битный порядок и 52-битную мантиссу, то есть это не просто Float32 с вдвое большим числом битов. Его структура и смещение порядка полностью отличаются. Приведение Float64 к более узкому формату, например Float32, требует полноценного преобразования по IEEE-754, при котором каждое значение округляется до ближайшего представимого Float32. Этот шаг округления вычислительно затратен.

:::tip
Если вас интересует подробный разбор аспектов производительности QBit, см. ["Let’s vectorise"](https://clickhouse.com/blog/qbit-vector-search#lets-vectorise)
:::

## Пример с DBpedia \\{#example\\}

Рассмотрим QBit в действии на практическом примере с использованием набора данных DBpedia, содержащего 1&nbsp;млн статей Википедии, представленных в виде эмбеддингов Float32.

### Настройка \{#setup\}

Сначала создайте таблицу.

```sql
CREATE TABLE dbpedia
(
  id      String,
  title   String,
  text    String,
  vector  Array(Float32) CODEC(NONE)
) ENGINE = MergeTree ORDER BY (id);
```

Введите данные из командной строки:

```bash
for i in $(seq 0 25); do
  echo "Processing file ${i}..."
  clickhouse client -q "INSERT INTO dbpedia SELECT _id, title, text, \"text-embedding-3-large-1536-embedding\" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/${i}.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;"
  echo "File ${i} complete."
done
```

:::tip
Загрузка данных может занять некоторое время.
Самое время сделать перерыв на кофе!
:::

В качестве альтернативы можно выполнить отдельные команды SQL, как показано ниже, чтобы загрузить каждый из 25 файлов Parquet:

```sql
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/0.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/1.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
...
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/25.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
```

Убедитесь, что в таблице dbpedia отображается 1 миллион строк:

```sql
SELECT count(*)
FROM dbpedia

┌─count()─┐
│ 1000000 │
└─────────┘
```

Затем добавьте столбец QBit:

```sql
SET allow_experimental_qbit_type = 1;

-- Assuming you have a table with Float32 embeddings
ALTER TABLE dbpedia ADD COLUMN qbit QBit(Float32, 1536);
ALTER TABLE dbpedia UPDATE qbit = vector WHERE 1;
```


### Поисковый запрос \{#search-query\}

Мы будем искать понятия, которые наиболее тесно связаны со всеми следующими поисковыми терминами, относящимися к космосу: Moon, Apollo 11, Space Shuttle, Astronaut, Rocket:

```sql
SELECT
    title,
    text,
    COUNT(DISTINCT concept) AS num_concepts_matched,
    MIN(distance) AS min_distance,
    AVG(distance) AS avg_distance
FROM (
         (
             SELECT title, text, 'Moon' AS concept,
                    L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Moon'), 5) AS distance
             FROM dbpedia
             WHERE title != 'Moon'
             ORDER BY distance ASC
                 LIMIT 1000
         )
         UNION ALL
         (
             SELECT title, text, 'Apollo 11' AS concept,
                    L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Apollo 11'), 5) AS distance
             FROM dbpedia
             WHERE title != 'Apollo 11'
             ORDER BY distance ASC
                 LIMIT 1000
         )
         UNION ALL
         (
             SELECT title, text, 'Space Shuttle' AS concept,
                    L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Space Shuttle'), 5) AS distance
             FROM dbpedia
             WHERE title != 'Space Shuttle'
             ORDER BY distance ASC
                 LIMIT 1000
         )
         UNION ALL
         (
             SELECT title, text, 'Astronaut' AS concept,
                    L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Astronaut'), 5) AS distance
             FROM dbpedia
             WHERE title != 'Astronaut'
             ORDER BY distance ASC
                 LIMIT 1000
         )
         UNION ALL
         (
             SELECT title, text, 'Rocket' AS concept,
                    L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Rocket'), 5) AS distance
             FROM dbpedia
             WHERE title != 'Rocket'
             ORDER BY distance ASC
                 LIMIT 1000
         )
     )
WHERE title NOT IN ('Moon', 'Apollo 11', 'Space Shuttle', 'Astronaut', 'Rocket')
GROUP BY title, text
HAVING num_concepts_matched >= 3
ORDER BY num_concepts_matched DESC, min_distance ASC
    LIMIT 10;
```

Запрос ищет топ‑1000 семантически наиболее похожих записей для каждого из пяти понятий.
Он возвращает записи, которые встречаются как минимум в трёх из этих выдач, ранжируя их по количеству совпавших понятий и минимальному расстоянию до любого из них (исключая исходные).

Используя всего 5 бит (1 бит знака + 4 бита экспоненты, без мантиссы):


```response
Row 1:
──────
title:                Aintree railway station
text:                 For a guide to the various Aintree stations that have existed and their relationship to each other see Aintree Stations.Aintree railway station is a railway station in Aintree, Merseyside, England.  It is on the Ormskirk branch of the Merseyrail network's Northern Line.  Until 1968 it was known as Aintree Sefton Arms after a nearby public house. The station's design reflects the fact it is the closest station to Aintree Racecourse, where the annual Grand National horse race takes place.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 2:
──────
title:                AP German Language
text:                 Advanced Placement German Language (also known as AP German Language or AP German) is a course and examination provided by the College Board through the Advanced Placement Program. This course  is designed to give high school students the opportunity to receive credit in a college-level German language course.Originally the College Board had offered two AP German exams, one with AP German Language and another with AP German Literature.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 3:
──────
title:                Adelospondyli
text:                 Adelospondyli is an order of elongate, presumably aquatic, Carboniferous amphibians.  The skull is solidly roofed, and elongate, with the orbits located very far forward.  The limbs are well developed.  Most adelospondyls belong to the family Adelogyrinidae, although the adelospondyl Acherontiscus has been placed in its own family, Acherontiscidae. The group is restricted to the Mississippian (Serpukhovian Age) of Scotland.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 4:
──────
title:                Adrien-Henri de Jussieu
text:                 Adrien-Henri de Jussieu (23 December 1797 – 29 June 1853) was a French botanist.Born in Paris as the son of botanist Antoine Laurent de Jussieu, he received the degree of Doctor of Medicine in 1824 with a treatise of the plant family Euphorbiaceae.  When his father retired in 1826, he succeeded him at the Jardin des Plantes; in 1845 he became professor of organography of plants.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 5:
──────
title:                Alan Taylor (footballer, born 1953)
text:                 Alan Taylor (born 14 November 1953) is an English former professional footballer best known for his goalscoring exploits with West Ham United in their FA Cup success of 1975, culminating in two goals in that season's final.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 6:
──────
title:                Abstract algebraic logic
text:                 In mathematical logic, abstract algebraic logic is the study of the algebraization of deductive systemsarising as an abstraction of the well-known Lindenbaum-Tarski algebra, and how the resulting algebras are related to logical systems.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 7:
──────
title:                Ahsan Saleem Hyat
text:                 General Ahsan Saleem Hayat (Urdu: احسن سلیم حیات; born 10 January 1948), is a retired four-star general who served as the vice chief of army staff of the Pakistan Army from 2004 until his retirement in 2007. Prior to that, he served as the operational field commander of the V Corps in Sindh Province and was a full-tenured professor of war studies at the National Defence University. He was succeeded by General Ashfaq Parvez Kayani on 8 October 2007.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 8:
──────
title:                Al Wafa al Igatha al Islamia
text:                 There is another organization named Al Wafa (Israel), a charity, in Israel, devoted to womenThere is another organization Jamaiat Al-Wafa LiRayat Al-Musenin which is proscribed by the Israeli government.Al Wafa is an Islamic charity listed in Executive Order 13224 as an entity that supports terrorism.United States intelligence officials state that it was founded in Afghanistan by Adil Zamil Abdull Mohssin Al Zamil,Abdul Aziz al-Matrafi and Samar Khand.According to Saad Madai Saad al-Azmi's Combatant Status Review Tribunal Al Wafa is located in the Wazir Akhbar Khan area ofAfghanistan.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 9:
───────
title:                Alex Baumann
text:                 Alexander Baumann, OC OOnt (born April 21, 1964) is a Canadian former competitive swimmer who won two gold medals and set two world records at the 1984 Summer Olympics in Los Angeles.Born in Prague (former Czechoslovakia), Baumann was raised in Canada after his family moved there in 1969 following the Prague Spring.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

Row 10:
───────
title:                Alberni-Clayoquot Regional District
text:                 The Alberni-Clayoquot Regional District (2006 population 30,664) of British Columbia is located on west central Vancouver Island.  Adjacent regional districts it shares borders with are the Strathcona and Comox Valley Regional Districts to the north, and the Nanaimo and Cowichan Valley Regional Districts to the east. The regional district offices are located in Port Alberni.
num_concepts_matched: 5
min_distance:         0.9971279086553189
avg_distance:         0.9972260772085877

10 rows in set. Elapsed: 0.542 sec. Processed 5.01 million rows, 1.86 GB (9.24 million rows/s., 3.43 GB/s.)
Peak memory usage: 327.04 MiB.
```

**Производительность:** 10 строк в наборе. Прошло: 0.271 сек. Обработано 8.46 млн строк, 4.54 GB (31.19 млн строк/с, 16.75 GB/с). Пиковое потребление памяти: **739.82 MiB**.

<details>
  <summary>Сравнение производительности с методом полного перебора</summary>

  ```sql
  SELECT 
      title,
      text,
      COUNT(DISTINCT concept) AS num_concepts_matched,
      MIN(distance) AS min_distance,
      AVG(distance) AS avg_distance
  FROM (
      (
          SELECT title, text, 'Moon' AS concept,
                 L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Moon'), 5) AS distance
          FROM dbpedia
          WHERE title != 'Moon'
          ORDER BY distance ASC
          LIMIT 1000
      )
      UNION ALL
      (
          SELECT title, text, 'Apollo 11' AS concept,
                 L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Apollo 11'), 5) AS distance
          FROM dbpedia
          WHERE title != 'Apollo 11'
          ORDER BY distance ASC
          LIMIT 1000
      )
      UNION ALL
      (
          SELECT title, text, 'Space Shuttle' AS concept,
                 L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Space Shuttle'), 5) AS distance
          FROM dbpedia
          WHERE title != 'Space Shuttle'
          ORDER BY distance ASC
          LIMIT 1000
      )
      UNION ALL
      (
          SELECT title, text, 'Astronaut' AS concept,
                 L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Astronaut'), 5) AS distance
          FROM dbpedia
          WHERE title != 'Astronaut'
          ORDER BY distance ASC
          LIMIT 1000
      )
      UNION ALL
      (
          SELECT title, text, 'Rocket' AS concept,
                 L2DistanceTransposed(qbit, (SELECT vector FROM dbpedia WHERE title = 'Rocket'), 5) AS distance
          FROM dbpedia
          WHERE title != 'Rocket'
          ORDER BY distance ASC
          LIMIT 1000
      )
  )
  WHERE title NOT IN ('Moon', 'Apollo 11', 'Space Shuttle', 'Astronaut', 'Rocket')
  GROUP BY title, text
  HAVING num_concepts_matched >= 3
  ORDER BY num_concepts_matched DESC, min_distance ASC
  LIMIT 10;
  ```

  ```response
  Row 1:
  ──────
  title:                Apollo program
  text:                 The Apollo program, also known as Project Apollo, was the third United States human spaceflight program carried out by the National Aeronautics and Space Administration (NASA), which accomplished landing the first humans on the Moon from 1969 to 1972. First conceived during Dwight D. Eisenhower's administration as a three-man spacecraft to follow the one-man Project Mercury which put the first Americans in space, Apollo was later dedicated to President John F.
  num_concepts_matched: 4
  min_distance:         0.82420665
  avg_distance:         1.0207901149988174

  Row 2:
  ──────
  title:                Apollo 8
  text:                 Apollo 8, the second human spaceflight mission in the United States Apollo space program, was launched on December 21, 1968, and became the first manned spacecraft to leave Earth orbit, reach the Earth's Moon, orbit it and return safely to Earth.
  num_concepts_matched: 4
  min_distance:         0.8285278
  avg_distance:         1.0357224345207214

  Row 3:
  ──────
  title:                Lunar Orbiter 1
  text:                 The Lunar Orbiter 1 robotic (unmanned) spacecraft, part of the Lunar Orbiter Program, was the first American spacecraft to orbit the Moon.  It was designed primarily to photograph smooth areas of the lunar surface for selection and verification of safe landing sites for the Surveyor and Apollo missions. It was also equipped to collect selenodetic, radiation intensity, and micrometeoroid impact data.The spacecraft was placed in an Earth parking orbit on August 10, 1966 at 19:31 (UTC).
  num_concepts_matched: 4
  min_distance:         0.94581836
  avg_distance:         1.0584313124418259

  Row 4:
  ──────
  title:                Apollo (spacecraft)
  text:                 The Apollo spacecraft was composed of three parts designed to accomplish the American Apollo program's goal of landing astronauts on the Moon by the end of the 1960s and returning them safely to Earth.  The expendable (single-use) spacecraft consisted of a combined Command/Service Module (CSM) and a Lunar Module (LM).
  num_concepts_matched: 4
  min_distance:         0.9643517
  avg_distance:         1.0367188602685928

  Row 5:
  ──────
  title:                Surveyor 1
  text:                 Surveyor 1 was the first lunar soft-lander in the unmanned  Surveyor program of the National Aeronautics and Space Administration (NASA, United States). This lunar soft-lander gathered data about the lunar surface that would be needed for the manned Apollo Moon landings that began in 1969.
  num_concepts_matched: 4
  min_distance:         0.9738264
  avg_distance:         1.0988530814647675

  Row 6:
  ──────
  title:                Spaceflight
  text:                 Spaceflight (also written space flight) is ballistic flight into or through outer space. Spaceflight can occur with spacecraft with or without humans on board. Examples of human spaceflight include the Russian Soyuz program, the U.S. Space shuttle program, as well as the ongoing International Space Station. Examples of unmanned spaceflight include space probes that leave Earth orbit, as well as satellites in orbit around Earth, such as communications satellites.
  num_concepts_matched: 4
  min_distance:         0.9831049
  avg_distance:         1.060678943991661

  Row 7:
  ──────
  title:                Skylab
  text:                 Skylab was a space station launched and operated by NASA and was the United States' first space station. Skylab orbited the Earth from 1973 to 1979, and included a workshop, a solar observatory, and other systems. It was launched unmanned by a modified Saturn V rocket, with a weight of 169,950 pounds (77 t).  Three manned missions to the station, conducted between 1973 and 1974 using the Apollo Command/Service Module (CSM) atop the smaller Saturn IB, each delivered a three-astronaut crew.
  num_concepts_matched: 4
  min_distance:         0.99155205
  avg_distance:         1.0769911855459213

  Row 8:
  ──────
  title:                Orbital spaceflight
  text:                 An orbital spaceflight (or orbital flight) is a spaceflight in which a spacecraft is placed on a trajectory where it could remain in space for at least one orbit. To do this around the Earth, it must be on a free trajectory which has an altitude at perigee (altitude at closest approach) above 100 kilometers (62 mi) (this is, by at least one convention, the boundary of space).  To remain in orbit at this altitude requires an orbital speed of ~7.8 km/s.
  num_concepts_matched: 4
  min_distance:         1.0075209
  avg_distance:         1.085978478193283

  Row 9:
  ───────
  title:                Dragon (spacecraft)
  text:                 Dragon is a partially reusable spacecraft developed by SpaceX, an American private space transportation company based in Hawthorne, California. Dragon is launched into space by the SpaceX Falcon 9 two-stage-to-orbit launch vehicle, and SpaceX is developing a crewed version called the Dragon V2.During its maiden flight in December 2010, Dragon became the first commercially built and operated spacecraft to be recovered successfully from orbit.
  num_concepts_matched: 4
  min_distance:         1.0222818
  avg_distance:         1.0942841172218323

  Row 10:
  ───────
  title:                Space capsule
  text:                 A space capsule is an often manned spacecraft which has a simple shape for the main section, without any wings or other features to create lift during atmospheric reentry.Capsules have been used in most of the manned space programs to date, including the world's first manned spacecraft Vostok and Mercury, as well as in later Soviet Voskhod, Soyuz, Zond/L1, L3, TKS, US Gemini, Apollo Command Module, Chinese Shenzhou and US, Russian and Indian manned spacecraft currently being developed.
  num_concepts_matched: 4
  min_distance:         1.0262821
  avg_distance:         1.0882147550582886
  ```

  **Производительность:** 10 строк в наборе. Затрачено: 1.157 сек. Обработано 10.00 млн строк, 32.76 ГБ (8.64 млн строк/сек., 28.32 ГБ/сек.) Пиковое использование памяти: **6.05 ГиБ**.
</details>

### Ключевая идея \\{#key-insight\\}

Результаты? Не просто хорошие — удивительно хорошие. Совсем не очевидно, что числа с плавающей запятой, лишённые всей мантиссы и половины экспоненты, всё ещё сохраняют значимую информацию.

**Ключевая идея QBit заключается в том, что векторный поиск по-прежнему работает, даже если игнорировать незначащие биты.**

Использование памяти сократилось с **6.05 ГБ до 740 МБ**, при этом качество семантического поиска остаётся отличным!

## Заключение \\{#result\\}

QBit — это тип столбца, который хранит числа с плавающей запятой в виде битовых плоскостей.
Он позволяет выбирать, сколько бит считывать во время векторного поиска, настраивая полноту и производительность без изменения данных.
Каждый метод векторного поиска имеет свои параметры, определяющие компромиссы между полнотой, точностью и производительностью.
Обычно их приходится выбирать заранее.
Если ошибиться, будет потрачено много времени и ресурсов, а менять настройки позже становится болезненно.
С QBit не нужно принимать такие решения заранее.
Вы можете настраивать компромисс между точностью и скоростью непосредственно во время выполнения запроса, подбирая нужный баланс по ходу работы.

---

*Адаптировано из [публикации в блоге](https://clickhouse.com/blog/qbit-vector-search) автора Raufs Dunamalijevs, опубликованной 28 октября 2025 г.*