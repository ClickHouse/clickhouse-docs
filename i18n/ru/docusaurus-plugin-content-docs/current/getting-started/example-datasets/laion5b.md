---
description: 'Набор данных, содержащий 100 миллионов векторов из набора данных LAION 5B'
sidebar_label: 'Набор данных LAION 5B'
slug: /getting-started/example-datasets/laion-5b-dataset
title: 'Набор данных LAION 5B'
keywords: ['семантический поиск', 'векторное сходство', 'приближённые ближайшие соседи', 'эмбеддинги']
doc_type: 'guide'
---

import search_results_image from '@site/static/images/getting-started/example-datasets/laion5b_visualization_1.png'
import Image from '@theme/IdealImage';


## Введение \\{#introduction\\}

Набор данных [LAION 5b](https://laion.ai/blog/laion-5b/) содержит 5,85 миллиарда эмбеддингов для пар «изображение‑текст» и
соответствующие метаданные изображений. Эмбеддинги были сгенерированы с использованием модели `OpenAI CLIP` [ViT-L/14](https://huggingface.co/sentence-transformers/clip-ViT-L-14). Размерность каждого вектора эмбеддинга составляет `768`.

Этот набор данных можно использовать для моделирования аспектов проектирования, масштабирования и производительности
крупномасштабного векторного поискового приложения, ориентированного на реальные сценарии. Набор данных можно использовать как для поиска изображений по текстовым запросам, так и для поиска изображений по другим изображениям.

## Подробности о наборе данных \\{#dataset-details\\}

Полный набор данных доступен в виде комбинации файлов форматов `npy` и `Parquet` на сайте [the-eye.eu](https://the-eye.eu/public/AI/cah/laion5b/).

ClickHouse предоставил подмножество из 100 миллионов векторов в бакете `S3`.
Бакет `S3` содержит 10 файлов формата `Parquet`, каждый файл `Parquet` содержит 10 миллионов строк.

Мы рекомендуем сначала выполнить оценку размеров, чтобы определить требования к хранилищу и памяти для этого набора данных, обратившись к [документации](../../engines/table-engines/mergetree-family/annindexes.md).

## Шаги \\{#steps\\}

<VerticalStepper headerLevel="h3">
  ### Создание таблицы

  Создайте таблицу `laion_5b_100m` для хранения эмбеддингов и связанных с ними атрибутов:

  ```sql
  CREATE TABLE laion_5b_100m
  (
      id UInt32,
      image_path String,
      caption String,
      NSFW Nullable(String) default 'unknown',
      similarity Float32,
      LICENSE Nullable(String),
      url String,
      key String,
      status LowCardinality(String),
      width Int32,
      height Int32,
      original_width Int32,
      original_height Int32,
      exif Nullable(String),
      md5 String,
      vector Array(Float32) CODEC(NONE)
  ) ENGINE = MergeTree ORDER BY (id)
  ```

  `id` — это просто инкрементное целое число. Дополнительные атрибуты можно использовать в предикатах для работы с
  векторным поиском по сходству в сочетании с постфильтрацией/префильтрацией, как описано в [документации](../../engines/table-engines/mergetree-family/annindexes.md)

  ### Загрузка данных

  Чтобы загрузить набор данных из всех файлов `Parquet`, выполните следующую SQL-команду:

  ```sql
  INSERT INTO laion_5b_100m SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/laion-5b/laion5b_100m_*.parquet');
  ```

  Загрузка 100 миллионов строк в таблицу займёт несколько минут.

  Также можно выполнить отдельные SQL-команды для загрузки определённого количества файлов или строк.

  ```sql
  INSERT INTO laion_5b_100m SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/laion-5b/laion5b_100m_part_1_of_10.parquet');
  INSERT INTO laion_5b_100m SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/laion-5b/laion5b_100m_part_2_of_10.parquet');
  ⋮
  ```

  ### Выполните поиск векторного сходства методом полного перебора

  Поиск KNN (k ближайших соседей) или поиск методом полного перебора заключается в вычислении расстояния от каждого вектора в наборе данных до вектора поискового эмбеддинга с последующим упорядочиванием расстояний для получения ближайших соседей. В качестве поискового вектора можно использовать один из векторов из самого набора данных. Например:

  ```sql title="Query"
  SELECT id, url 
  FROM laion_5b_100m
  ORDER BY cosineDistance( vector, (SELECT vector FROM laion_5b_100m WHERE id = 9999) ) ASC
  LIMIT 20

  The vector in the row with id = 9999 is the embedding for an image of a Deli restaurant.
  ```

  ```response title="Response"
      ┌───────id─┬─url───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
   1. │     9999 │ https://certapro.com/belleville/wp-content/uploads/sites/1369/2017/01/McAlistersFairviewHgts.jpg                                                                                                                                  │
   2. │ 60180509 │ https://certapro.com/belleville/wp-content/uploads/sites/1369/2017/01/McAlistersFairviewHgts-686x353.jpg                                                                                                                          │
   3. │  1986089 │ https://www.gannett-cdn.com/-mm-/ceefab710d945bb3432c840e61dce6c3712a7c0a/c=30-0-4392-3280/local/-/media/2017/02/14/FortMyers/FortMyers/636226855169587730-McAlister-s-Exterior-Signage.jpg?width=534&amp;height=401&amp;fit=crop │
   4. │ 51559839 │ https://img1.mashed.com/img/gallery/how-rich-is-the-mcalisters-deli-ceo-and-whats-the-average-pay-of-its-employees/intro-1619793841.jpg                                                                                           │
   5. │ 22104014 │ https://www.restaurantmagazine.com/wp-content/uploads/2016/04/Largest-McAlisters-Deli-Franchisee-to-Expand-into-Nebraska.jpg                                                                                                      │
   6. │ 54337236 │ http://www.restaurantnews.com/wp-content/uploads/2015/11/McAlisters-Deli-Giving-Away-Gift-Cards-With-Win-One-Gift-One-Holiday-Promotion.jpg                                                                                       │
   7. │ 20770867 │ http://www.restaurantnews.com/wp-content/uploads/2016/04/McAlisters-Deli-Aims-to-Attract-New-Franchisees-in-Florida-as-Chain-Enters-New-Markets.jpg                                                                               │
   8. │ 22493966 │ https://www.restaurantmagazine.com/wp-content/uploads/2016/06/McAlisters-Deli-Aims-to-Attract-New-Franchisees-in-Columbus-Ohio-as-Chain-Expands-feature.jpg                                                                       │
   9. │  2224351 │ https://holttribe.com/wp-content/uploads/2019/10/60880046-879A-49E4-8E13-1EE75FB24980-900x675.jpeg                                                                                                                                │
  10. │ 30779663 │ https://www.gannett-cdn.com/presto/2018/10/29/PMUR/685f3e50-cce5-46fb-9a66-acb93f6ea5e5-IMG_6587.jpg?crop=2166,2166,x663,y0&amp;width=80&amp;height=80&amp;fit=bounds                                                             │
  11. │ 54939148 │ https://www.priceedwards.com/sites/default/files/styles/staff_property_listing_block/public/for-lease/images/IMG_9674%20%28Custom%29_1.jpg?itok=sa8hrVBT                                                                          │
  12. │ 95371605 │ http://www.restaurantmagazine.com/wp-content/uploads/2015/08/McAlisters-Deli-Signs-Development-Agreement-with-Kingdom-Foods-to-Grow-in-Southern-Mississippi.jpg                                                                   │
  13. │ 79564563 │ https://www.restaurantmagazine.com/wp-content/uploads/2016/05/McAlisters-Deli-Aims-to-Attract-New-Franchisees-in-Denver-as-Chain-Expands.jpg                                                                                      │
  14. │ 76429939 │ http://www.restaurantnews.com/wp-content/uploads/2016/08/McAlisters-Deli-Aims-to-Attract-New-Franchisees-in-Pennsylvania-as-Chain-Expands.jpg                                                                                     │
  15. │ 96680635 │ https://img.claz.org/tc/400x320/9w3hll-UQNHGB9WFlhSGAVCWhheBQkeWh5SBAkUWh9SBgsJFxRcBUMNSR4cAQENXhJARwgNTRYcBAtDWh5WRQEJXR5SR1xcFkYKR1tYFkYGR1pVFiVyP0ImaTA                                                                        │
  16. │ 48716846 │ http://tse2.mm.bing.net/th?id=OIP.nN2qJqGUJs_fVNdTiFyGnQHaEc                                                                                                                                                                      │
  17. │  4472333 │ https://sgi.offerscdn.net/i/zdcs-merchants/05lG0FpXPIvsfiHnT3N8FQE.h200.w220.flpad.v22.bffffff.png                                                                                                                                │
  18. │ 82667887 │ https://irs2.4sqi.net/img/general/200x200/11154479_OEGbrkgWB5fEGrrTkktYvCj1gcdyhZn7TSQSAqN2Yqw.jpg                                                                                                                                │
  19. │ 57525607 │ https://knoji.com/images/logo/mcalistersdelicom.jpg                                                                                                                                                                               │
  20. │ 15785896 │ https://www.groupnimb.com/mimg/merimg/mcalister-s-deli_1446088739.jpg                                                                                                                                                             │
      └──────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  #highlight-next-line
  20 rows in set. Elapsed: 3.968 sec. Processed 100.38 million rows, 320.81 GB (25.30 million rows/s., 80.84 GB/s.)
  ```

  Зафиксируйте время выполнения запроса, чтобы затем сравнить его с временем выполнения запроса ANN (с использованием векторного индекса).
  With 100 million rows, the above query without a vector index could take a few seconds/minutes to complete.

  ### Создание индекса векторного сходства

  Выполните следующий SQL-запрос для определения и создания индекса векторного сходства для столбца `vector` таблицы `laion_5b_100m`:

  ```sql
  ALTER TABLE laion_5b_100m ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 768, 'bf16', 64, 512);

  ALTER TABLE laion_5b_100m MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
  ```

  Параметры и аспекты производительности при создании индекса и выполнении поиска описаны в [документации](../../engines/table-engines/mergetree-family/annindexes.md).
  The statement above uses values of 64 and 512 respectively for the HNSW hyperparameters `M` and `ef_construction`.
  You need to carefully select optimal values for these parameters by evaluating index build time and search results quality
  corresponding to selected values.

  Построение и сохранение индекса может занять несколько часов для полного набора данных из 100 миллионов записей в зависимости от количества доступных ядер ЦП и пропускной способности системы хранения.

  ### Выполните ANN-поиск

  После построения индекса векторного сходства запросы векторного поиска будут автоматически использовать индекс:

  ```sql title="Query"
  SELECT id, url 
  FROM laion_5b_100m
  ORDER BY cosineDistance( vector, (SELECT vector FROM laion_5b_100m WHERE id = 9999) ) ASC
  LIMIT 20

  ```

  Первая загрузка векторного индекса в память может занять от нескольких секунд до нескольких минут.

  ### Генерация эмбеддингов для поискового запроса

  Векторы эмбеддингов набора данных `LAION 5b` были созданы с помощью модели `OpenAI CLIP` `ViT-L/14`.

  Ниже приведён пример скрипта Python, демонстрирующий программную генерацию
  векторов эмбеддингов с использованием API `CLIP`. Полученный вектор эмбеддинга для поиска
  затем передаётся в качестве аргумента функции [`cosineDistance()`](/sql-reference/functions/distance-functions#cosineDistance) в запросе `SELECT`.

  Для установки пакета `clip` см. [репозиторий OpenAI на GitHub](https://github.com/openai/clip).

  ```python
  import torch
  import clip
  import numpy as np
  import sys
  import clickhouse_connect

  device = "cuda" if torch.cuda.is_available() else "cpu"
  model, preprocess = clip.load("ViT-L/14", device=device)

  # Search for images that contain both a dog and a cat
  text = clip.tokenize(["a dog and a cat"]).to(device)

  with torch.no_grad():
      text_features = model.encode_text(text)
      np_arr = text_features.detach().cpu().numpy()

      # Pass ClickHouse credentials here
      chclient = clickhouse_connect.get_client()

      params = {'v1': list(np_arr[0])}
      result = chclient.query("SELECT id, url FROM laion_5b_100m ORDER BY cosineDistance(vector, %(v1)s) LIMIT 100",
                              parameters=params)

      # Write the results to a simple HTML page that can be opened in the browser. Some URLs may have become obsolete.
      print("<html>")
      for r in result.result_rows:
          print("<img src = ", r[1], 'width="200" height="200">')
      print("</html>")
  ```

  Результат вышеуказанного поиска показан ниже:

  <Image img={search_results_image} alt="Результаты поиска по векторному сходству" size="md" />
</VerticalStepper>