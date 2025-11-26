---
description: 'Набор данных, содержащий 400 миллионов изображений с англоязычными подписями'
sidebar_label: 'Набор данных Laion-400M'
slug: /getting-started/example-datasets/laion-400m-dataset
title: 'Набор данных Laion-400M'
doc_type: 'guide'
keywords: ['пример набора данных', 'laion', 'векторные представления изображений', 'пример данных', 'машинное обучение']
---

Набор данных [Laion-400M](https://laion.ai/blog/laion-400-open-dataset/) содержит 400 миллионов изображений с англоязычными подписями. В настоящее время Laion предоставляет [ещё более крупный набор данных](https://laion.ai/blog/laion-5b/), но работа с ним будет аналогичной.

Набор данных содержит URL-адрес изображения, векторные представления (эмбеддинги) как для изображения, так и для подписи, оценку сходства между изображением и подписью, а также метаданные, например ширину и высоту изображения, лицензию и флаг NSFW. Мы можем использовать этот набор данных для демонстрации [поиска приблизительных ближайших соседей](../../engines/table-engines/mergetree-family/annindexes.md) в ClickHouse.

## Подготовка данных

Эмбеддинги и метаданные хранятся в отдельных файлах в исходных данных. На этапе подготовки данные загружаются, файлы объединяются,
преобразуются в CSV и импортируются в ClickHouse. Для этого вы можете использовать следующий скрипт `download.sh`:

```bash
number=${1}
if [[ $number == '' ]]; then
    number=1
fi;
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/img_emb/img_emb_${number}.npy          # скачать эмбеддинг изображения
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/text_emb/text_emb_${number}.npy        # скачать эмбеддинг текста
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/metadata/metadata_${number}.parquet    # скачать метаданные
python3 process.py $number # объединить файлы и преобразовать в CSV
```

Скрипт `process.py` выглядит следующим образом:

```python
import pandas as pd
import numpy as np
import os
import sys

str_i = str(sys.argv[1])
npy_file = "img_emb_" + str_i + '.npy'
metadata_file = "metadata_" + str_i + '.parquet'
text_npy =  "text_emb_" + str_i + '.npy'

# загрузка всех файлов
im_emb = np.load(npy_file)
text_emb = np.load(text_npy) 
data = pd.read_parquet(metadata_file)

# объединение файлов
data = pd.concat([data, pd.DataFrame({"image_embedding" : [*im_emb]}), pd.DataFrame({"text_embedding" : [*text_emb]})], axis=1, copy=False)

# столбцы для импорта в ClickHouse
data = data[['url', 'caption', 'NSFW', 'similarity', "image_embedding", "text_embedding"]]

# преобразование np.arrays в списки
data['image_embedding'] = data['image_embedding'].apply(lambda x: x.tolist())
data['text_embedding'] = data['text_embedding'].apply(lambda x: x.tolist())

# этот небольшой хак необходим, поскольку caption иногда содержит различные типы кавычек
data['caption'] = data['caption'].apply(lambda x: x.replace("'", " ").replace('"', " "))

# экспорт данных в CSV-файл
data.to_csv(str_i + '.csv', header=False)

# удаление исходных файлов данных
os.system(f"rm {npy_file} {metadata_file} {text_npy}")
```

Чтобы запустить конвейер подготовки данных, выполните следующую команду:

```bash
seq 0 409 | xargs -P1 -I{} bash -c './download.sh {}'
```

Набор данных разбит на 410 файлов, каждый файл содержит приблизительно 1 миллион строк. Если вы хотите работать с меньшим подмножеством данных, просто скорректируйте границы, например `seq 0 9 | ...`.

(Приведённый выше скрипт на Python очень медленный (~2–10 минут на файл), потребляет много памяти (41 ГБ на файл), а получающиеся CSV‑файлы большие (10 ГБ каждый), поэтому будьте осторожны. Если у вас достаточно RAM, увеличьте значение `-P1` для большего параллелизма. Если этого всё ещё недостаточно и обработка остаётся слишком медленной, рассмотрите более эффективную процедуру ингестии — например, сначала конвертировать файлы .npy в parquet, а затем выполнять всю остальную обработку с помощью ClickHouse.)


## Создание таблицы

Чтобы сначала создать таблицу без индексов, выполните:

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
SETTINGS index_granularity = 8192
```

Для импорта файлов CSV в ClickHouse:

```sql
INSERT INTO laion FROM INFILE '{path_to_csv_files}/*.csv'
```

Обратите внимание, что столбец `id` служит лишь для иллюстрации и заполняется скриптом неуникальными значениями.


## Запуск векторного поиска методом перебора

Чтобы выполнить векторный поиск методом перебора, выполните:

```sql
SELECT url, caption FROM laion ORDER BY cosineDistance(image_embedding, {target:Array(Float32)}) LIMIT 10
```

`target` — это массив из 512 элементов и параметр, задаваемый клиентом.\
Удобный способ получения таких массивов будет приведён в конце статьи.\
Пока что мы можем сгенерировать эмбеддинг случайного изображения набора LEGO и использовать его в качестве `target`.

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

Получено 10 строк. Время выполнения: 4.605 сек. Обработано 100.38 млн строк, 309.98 ГБ (21.80 млн строк/сек., 67.31 ГБ/сек.)
```


## Выполните приближённый поиск по сходству векторов с использованием индекса сходства векторов

Теперь определим два индекса сходства векторов для таблицы.

```sql
ALTER TABLE laion ADD INDEX image_index image_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
ALTER TABLE laion ADD INDEX text_index text_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
```

Параметры и особенности производительности при создании индекса и выполнении поиска описаны в [документации](../../engines/table-engines/mergetree-family/annindexes.md).
Приведённое выше определение индекса задаёт индекс HNSW, использующий «косинусное расстояние» в качестве метрики расстояния с параметром «hnsw&#95;max&#95;connections&#95;per&#95;layer», установленным в 64, и параметром «hnsw&#95;candidate&#95;list&#95;size&#95;for&#95;construction», установленным в 256.
Индекс использует числа с плавающей запятой половинной точности в формате bfloat16 (brain floats) в качестве квантизации для оптимизации использования памяти.

Чтобы построить и материализовать индекс, выполните следующие запросы:

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

Получено 10 строк. Прошло: 0.019 сек. Обработано 137.27 тыс. строк, 24.42 МБ (7.38 млн строк/с., 1.31 ГБ/с.)
```

Задержка выполнения запроса значительно уменьшилась, потому что ближайшие соседи были получены с использованием векторного индекса.
Поиск по векторному сходству с использованием векторного индекса сходства может возвращать результаты, которые немного отличаются от результатов поиска полным перебором.
Индекс HNSW при тщательном подборе его параметров и оценке качества индекса потенциально может обеспечивать полноту, близкую к 1 (ту же точность, что и поиск полным перебором).


## Создание эмбеддингов с помощью UDF {#creating-embeddings-with-udfs}

Обычно требуется создавать эмбеддинги для новых изображений или новых подписей к изображениям и искать в данных похожие пары «изображение — подпись к изображению». Мы можем использовать [UDF](/sql-reference/functions/udf), чтобы создать вектор `target`, не выходя за пределы клиентского приложения. Важно использовать одну и ту же модель и для исходных данных, и для новых эмбеддингов при выполнении поисковых запросов. В следующих скриптах используется модель `ViT-B/32`, которая также лежит в основе набора данных.

### Текстовые эмбеддинги

Сначала поместите следующий скрипт Python в каталог `user_scripts/` в каталоге данных ClickHouse и сделайте его исполняемым (`chmod +x encode_text.py`).

`encode_text.py`:

```python
#!/usr/bin/python3
#!Примечание: Измените путь к исполняемому файлу python3 выше, если используется виртуальное окружение.
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

Затем создайте файл `encode_text_function.xml` в каталоге, указанном в `<user_defined_executable_functions_config>/path/to/*_function.xml</user_defined_executable_functions_config>` в вашем конфигурационном файле сервера ClickHouse.

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

Теперь можно просто использовать:

```sql
SELECT encode_text('cat');
```

Первый запуск будет медленным, поскольку загружается модель, но последующие запуски будут быстрыми. Затем мы можем скопировать результат в `SET param_target=...` и легко писать запросы. Кроме того, функцию `encode_text()` можно напрямую использовать в качестве аргумента функции `cosineDistance`:

```SQL
SELECT url
FROM laion
ORDER BY cosineDistance(text_embedding, encode_text('a dog and a cat')) ASC
LIMIT 10
```

Обратите внимание, что сам UDF `encode_text()` может занимать несколько секунд на вычисление и выдачу векторного представления (эмбеддинга).


### Векторные представления изображений

Векторные представления изображений можно создать аналогичным образом; для этого мы предоставляем сценарий на Python, который генерирует векторное представление изображения, сохранённого локально в файле.

`encode_image.py`

```python
#!/usr/bin/python3
#!Примечание: Измените путь к исполняемому файлу python3 выше, если используется виртуальное окружение.
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
# получить случайное изображение набора LEGO
$ wget http://cdn.firstcry.com/brainbees/images/products/thumb/191325a.jpg
```

Затем выполните следующий запрос, чтобы сгенерировать эмбеддинг для изображения выше:

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
