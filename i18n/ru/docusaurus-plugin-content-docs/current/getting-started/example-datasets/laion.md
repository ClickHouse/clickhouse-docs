---
description: 'Набор данных, содержащий 400 миллионов изображений с подписями на английском языке'
sidebar_label: 'Набор данных Laion-400M'
slug: /getting-started/example-datasets/laion-400m-dataset
title: 'Набор данных Laion-400M'
doc_type: 'guide'
keywords: ['пример набора данных', 'laion', 'векторные представления изображений', 'пример данных', 'машинное обучение']
---

[Набор данных Laion-400M](https://laion.ai/blog/laion-400-open-dataset/) содержит 400 миллионов изображений с подписями на английском языке. В настоящее время Laion предоставляет [ещё более крупный набор данных](https://laion.ai/blog/laion-5b/), но работа с ним будет аналогична.

Набор данных содержит URL изображения, векторные представления (embeddings) как для изображения, так и для подписи к нему, оценку сходства между изображением и подписью, а также метаданные, например ширину и высоту изображения, лицензию и флаг NSFW. Мы можем использовать этот набор данных, чтобы продемонстрировать [поиск приблизительных ближайших соседей](../../engines/table-engines/mergetree-family/annindexes.md) в ClickHouse.

## Подготовка данных {#data-preparation}

В сырых данных эмбеддинги и метаданные хранятся в отдельных файлах. На этапе подготовки выполняется скачивание данных, объединение файлов,
их преобразование в CSV и импорт в ClickHouse. Для этого вы можете использовать следующий скрипт `download.sh`:

```bash
number=${1}
if [[ $number == '' ]]; then
    number=1
fi;
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/img_emb/img_emb_${number}.npy          # download image embedding
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/text_emb/text_emb_${number}.npy        # download text embedding
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/metadata/metadata_${number}.parquet    # download metadata
python3 process.py $number # merge files and convert to CSV
```

Скрипт `process.py` задаётся следующим образом:

```python
import pandas as pd
import numpy as np
import os
import sys

str_i = str(sys.argv[1])
npy_file = "img_emb_" + str_i + '.npy'
metadata_file = "metadata_" + str_i + '.parquet'
text_npy =  "text_emb_" + str_i + '.npy'

# load all files
im_emb = np.load(npy_file)
text_emb = np.load(text_npy) 
data = pd.read_parquet(metadata_file)

# combine files
data = pd.concat([data, pd.DataFrame({"image_embedding" : [*im_emb]}), pd.DataFrame({"text_embedding" : [*text_emb]})], axis=1, copy=False)

# columns to be imported into ClickHouse
data = data[['url', 'caption', 'NSFW', 'similarity', "image_embedding", "text_embedding"]]

# transform np.arrays to lists
data['image_embedding'] = data['image_embedding'].apply(lambda x: x.tolist())
data['text_embedding'] = data['text_embedding'].apply(lambda x: x.tolist())

# this small hack is needed because caption sometimes contains all kind of quotes
data['caption'] = data['caption'].apply(lambda x: x.replace("'", " ").replace('"', " "))

# export data as CSV file
data.to_csv(str_i + '.csv', header=False)

# removed raw data files
os.system(f"rm {npy_file} {metadata_file} {text_npy}")
```

Чтобы запустить конвейер подготовки данных, выполните следующую команду:

```bash
seq 0 409 | xargs -P1 -I{} bash -c './download.sh {}'
```

Набор данных разделён на 410 файлов, каждый файл содержит около 1 миллиона строк. Если вы хотите работать с меньшим подмножеством данных, просто скорректируйте границы, например `seq 0 9 | ...`.

(Приведённый выше скрипт на Python работает очень медленно (~2–10 минут на файл), требует много памяти (41 GB на файл), а результирующие CSV‑файлы получаются большими (по 10 GB каждый), поэтому будьте осторожны. Если у вас достаточно RAM, увеличьте значение `-P1` для большего параллелизма. Если этого всё ещё недостаточно по скорости, подумайте о более эффективной процедуре ингестии данных — например, преобразуйте .npy‑файлы в Parquet, а затем выполняйте всю остальную обработку в ClickHouse.)


## Создание таблицы {#create-table}

Чтобы создать таблицу без индексов, выполните:

```sql
CREATE TABLE laion
(
    `id` Int64,
    `url` String,
    `caption` String,
    `NSFW` String,
    `similarity` Float32,
    `image_embedding` Array(Float32),
    `text_embedding` Array(Float32)
)
ENGINE = MergeTree
ORDER BY id
```

Для импорта CSV‑файлов в ClickHouse:

```sql
INSERT INTO laion FROM INFILE '{path_to_csv_files}/*.csv'
```

Обратите внимание, что столбец `id` используется только для иллюстрации и заполняется скриптом неуникальными значениями.


## Выполнить векторный поиск по сходству методом полного перебора {#run-a-brute-force-vector-similarity-search}

Чтобы выполнить приближённый векторный поиск по сходству методом полного перебора, выполните:

```sql
SELECT url, caption FROM laion ORDER BY cosineDistance(image_embedding, {target:Array(Float32)}) LIMIT 10
```

`target` — это массив из 512 элементов и параметр клиента.
Удобный способ получить такие массивы будет представлен в конце статьи.
А пока мы можем выполнить встраивание случайной картинки набора LEGO в качестве `target`.

**Результат**

```markdown
    ┌─url───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─caption──────────────────────────────────────────────────────────────────────────┐
 1. │ https://s4.thcdn.com/productimg/600/600/11340490-9914447026352671.jpg                                                                                                                         │ LEGO Friends: Puppy Treats & Tricks (41304)                                      │
 2. │ https://www.avenuedelabrique.com/img/uploads/f20fd44bfa4bd49f2a3a5fad0f0dfed7d53c3d2f.jpg                                                                                                     │ Nouveau LEGO Friends 41334 Andrea s Park Performance 2018                        │
 3. │ http://images.esellerpro.com/2489/I/667/303/3938_box_in.jpg                                                                                                                                   │ 3938 LEGO Andreas Bunny House Girls Friends Heartlake Age 5-12 / 62 Pieces  New! │
 4. │ http://i.shopmania.org/180x180/7/7f/7f1e1a2ab33cde6af4573a9e0caea61293dfc58d.jpg?u=https%3A%2F%2Fs.s-bol.com%2Fimgbase0%2Fimagebase3%2Fextralarge%2FFC%2F4%2F0%2F9%2F9%2F9200000049789904.jpg │ LEGO Friends Avonturenkamp Boomhuis - 41122                                      │
 5. │ https://s.s-bol.com/imgbase0/imagebase/large/FC/5/5/9/4/1004004011684955.jpg                                                                                                                  │ LEGO Friends Andrea s Theatershow - 3932                                         │
 6. │ https://www.jucariicucubau.ro/30252-home_default/41445-lego-friends-ambulanta-clinicii-veterinare.jpg                                                                                         │ 41445 - LEGO Friends - Ambulanta clinicii veterinare                             │
 7. │ https://cdn.awsli.com.br/600x1000/91/91201/produto/24833262/234c032725.jpg                                                                                                                    │ LEGO FRIENDS 41336 EMMA S ART CAFÉ                                               │
 8. │ https://media.4rgos.it/s/Argos/6174930_R_SET?$Thumb150$&amp;$Web$                                                                                                                             │ more details on LEGO Friends Stephanie s Friendship Cake Set - 41308.            │
 9. │ https://thumbs4.ebaystatic.com/d/l225/m/mG4k6qAONd10voI8NUUMOjw.jpg                                                                                                                           │ Lego Friends Gymnast 30400 Polybag 26 pcs                                        │
10. │ http://www.ibrickcity.com/wp-content/gallery/41057/thumbs/thumbs_lego-41057-heartlake-horse-show-friends-3.jpg                                                                                │ lego-41057-heartlake-horse-show-friends-3                                        │
    └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────────────────┘

10 rows in set. Elapsed: 4.605 sec. Processed 100.38 million rows, 309.98 GB (21.80 million rows/s., 67.31 GB/s.)
```


## Выполните приближённый поиск по сходству векторов с использованием векторного индекса {#run-an-approximate-vector-similarity-search-with-a-vector-similarity-index}

Теперь определим два индекса сходства векторов для таблицы.

```sql
ALTER TABLE laion ADD INDEX image_index image_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
ALTER TABLE laion ADD INDEX text_index text_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
```

Параметры и рекомендации по производительности для создания индекса и выполнения поиска описаны в [документации](../../engines/table-engines/mergetree-family/annindexes.md).
Приведённое выше определение индекса задаёт индекс HNSW, использующий &quot;cosine distance&quot; как метрику расстояния с параметром &quot;hnsw&#95;max&#95;connections&#95;per&#95;layer&quot;, равным 64, и параметром &quot;hnsw&#95;candidate&#95;list&#95;size&#95;for&#95;construction&quot;, равным 256.
Индекс использует 16-битные числа с плавающей запятой формата brain floating point (bfloat16) для квантования, чтобы оптимизировать использование памяти.

Чтобы построить и материализовать индекс, выполните следующие команды:

```sql
ALTER TABLE laion MATERIALIZE INDEX image_index;
ALTER TABLE laion MATERIALIZE INDEX text_index;
```

Построение и сохранение индекса может занять несколько минут или даже часов в зависимости от количества строк и параметров индекса HNSW.

Чтобы выполнить векторный поиск, просто повторно выполните тот же запрос:

```sql
SELECT url, caption FROM laion ORDER BY cosineDistance(image_embedding, {target:Array(Float32)}) LIMIT 10
```

**Результат**


```response
    ┌─url───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─caption──────────────────────────────────────────────────────────────────────────┐
 1. │ https://s4.thcdn.com/productimg/600/600/11340490-9914447026352671.jpg                                                                                                                         │ LEGO Friends: Puppy Treats & Tricks (41304)                                      │
 2. │ https://www.avenuedelabrique.com/img/uploads/f20fd44bfa4bd49f2a3a5fad0f0dfed7d53c3d2f.jpg                                                                                                     │ Nouveau LEGO Friends 41334 Andrea s Park Performance 2018                        │
 3. │ http://images.esellerpro.com/2489/I/667/303/3938_box_in.jpg                                                                                                                                   │ 3938 LEGO Andreas Bunny House Girls Friends Heartlake Age 5-12 / 62 Pieces  New! │
 4. │ http://i.shopmania.org/180x180/7/7f/7f1e1a2ab33cde6af4573a9e0caea61293dfc58d.jpg?u=https%3A%2F%2Fs.s-bol.com%2Fimgbase0%2Fimagebase3%2Fextralarge%2FFC%2F4%2F0%2F9%2F9%2F9200000049789904.jpg │ LEGO Friends Avonturenkamp Boomhuis - 41122                                      │
 5. │ https://s.s-bol.com/imgbase0/imagebase/large/FC/5/5/9/4/1004004011684955.jpg                                                                                                                  │ LEGO Friends Andrea s Theatershow - 3932                                         │
 6. │ https://www.jucariicucubau.ro/30252-home_default/41445-lego-friends-ambulanta-clinicii-veterinare.jpg                                                                                         │ 41445 - LEGO Friends - Ambulanta clinicii veterinare                             │
 7. │ https://cdn.awsli.com.br/600x1000/91/91201/produto/24833262/234c032725.jpg                                                                                                                    │ LEGO FRIENDS 41336 EMMA S ART CAFÉ                                               │
 8. │ https://media.4rgos.it/s/Argos/6174930_R_SET?$Thumb150$&amp;$Web$                                                                                                                             │ more details on LEGO Friends Stephanie s Friendship Cake Set - 41308.            │
 9. │ https://thumbs4.ebaystatic.com/d/l225/m/mG4k6qAONd10voI8NUUMOjw.jpg                                                                                                                           │ Lego Friends Gymnast 30400 Polybag 26 pcs                                        │
10. │ http://www.ibrickcity.com/wp-content/gallery/41057/thumbs/thumbs_lego-41057-heartlake-horse-show-friends-3.jpg                                                                                │ lego-41057-heartlake-horse-show-friends-3                                        │
    └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────────────────┘

10 rows in set. Elapsed: 0.019 sec. Processed 137.27 thousand rows, 24.42 MB (7.38 million rows/s., 1.31 GB/s.)
```

Задержка запроса значительно снизилась, потому что ближайшие соседи были получены с использованием векторного индекса.
Поиск по векторному сходству с использованием индекса векторного сходства может возвращать результаты, которые немного отличаются от результатов поиска полным перебором.
Индекс HNSW при тщательном подборе его параметров и оценке качества индекса потенциально может обеспечивать полноту, близкую к 1 (точность, сопоставимую с поиском полным перебором).


## Создание эмбеддингов с помощью UDF {#creating-embeddings-with-udfs}

Обычно требуется создавать эмбеддинги для новых изображений или новых подписей к изображениям и выполнять поиск похожих пар изображение / подпись к изображению в данных. Мы можем использовать [UDF](/sql-reference/functions/udf), чтобы создать вектор `target`, не выходя из клиентского приложения. Важно использовать одну и ту же модель как для создания исходных данных, так и для новых эмбеддингов при поиске. В следующих скриптах используется модель `ViT-B/32`, которая также лежит в основе набора данных.

### Текстовые эмбеддинги {#text-embeddings}

Сначала сохраните следующий скрипт на Python в каталоге `user_scripts/` в директории с данными ClickHouse и сделайте его исполняемым (`chmod +x encode_text.py`).

`encode_text.py`:

```python
#!/usr/bin/python3
#!Note: Change the above python3 executable location if a virtual env is being used.
import clip
import torch
import numpy as np
import sys

if __name__ == '__main__':
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model, preprocess = clip.load("ViT-B/32", device=device)
    for text in sys.stdin:
        inputs = clip.tokenize(text)
        with torch.no_grad():
            text_features = model.encode_text(inputs)[0].tolist()
            print(text_features)
        sys.stdout.flush()
```

Затем создайте `encode_text_function.xml` в каталоге, указанном в `<user_defined_executable_functions_config>/path/to/*_function.xml</user_defined_executable_functions_config>` в вашем конфигурационном файле сервера ClickHouse.

```xml
<functions>
    <function>
        <type>executable</type>
        <name>encode_text</name>
        <return_type>Array(Float32)</return_type>
        <argument>
            <type>String</type>
            <name>text</name>
        </argument>
        <format>TabSeparated</format>
        <command>encode_text.py</command>
        <command_read_timeout>1000000</command_read_timeout>
    </function>
</functions>
```

Теперь вы можете просто использовать:

```sql
SELECT encode_text('cat');
```

Первый запуск будет медленным, так как загружается модель, но повторные запуски будут быстрыми. Затем мы можем скопировать вывод в `SET param_target=...` и легко писать запросы. В качестве альтернативы функцию `encode_text()` можно напрямую использовать как аргумент функции `cosineDistance`:

```SQL
SELECT url
FROM laion
ORDER BY cosineDistance(text_embedding, encode_text('a dog and a cat')) ASC
LIMIT 10
```

Обратите внимание, что сама UDF-функция `encode_text()` может потребовать несколько секунд на вычисление и генерацию вектора эмбеддинга.


### Векторные представления изображений {#image-embeddings}

Векторные представления изображений создаются аналогично. Мы предоставляем скрипт на Python, который генерирует векторное представление изображения, хранящегося локально в файле.

`encode_image.py`

```python
#!/usr/bin/python3
#!Note: Change the above python3 executable location if a virtual env is being used.
import clip
import torch
import numpy as np
from PIL import Image
import sys

if __name__ == '__main__':
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model, preprocess = clip.load("ViT-B/32", device=device)
    for text in sys.stdin:
        image = preprocess(Image.open(text.strip())).unsqueeze(0).to(device)
        with torch.no_grad():
            image_features = model.encode_image(image)[0].tolist()
            print(image_features)
        sys.stdout.flush()
```

`encode_image_function.xml`

```xml
<functions>
    <function>
        <type>executable_pool</type>
        <name>encode_image</name>
        <return_type>Array(Float32)</return_type>
        <argument>
            <type>String</type>
            <name>path</name>
        </argument>
        <format>TabSeparated</format>
        <command>encode_image.py</command>
        <command_read_timeout>1000000</command_read_timeout>
    </function>
</functions>
```

Загрузите пример изображения для поиска:

```shell
# get a random image of a LEGO set
$ wget http://cdn.firstcry.com/brainbees/images/products/thumb/191325a.jpg
```

Затем выполните этот запрос, чтобы сгенерировать эмбеддинг для указанного выше изображения:

```sql
SELECT encode_image('/path/to/your/image');
```

Полный поисковый запрос:

```sql
SELECT
    url,
    caption
FROM laion
ORDER BY cosineDistance(image_embedding, encode_image('/path/to/your/image')) ASC
LIMIT 10
```
