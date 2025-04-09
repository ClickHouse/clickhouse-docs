---
description: 'Набор данных, содержащий 400 миллионов изображений с английскими подписями к изображениям'
sidebar_label: 'Набор данных Laion-400M'
slug: /getting-started/example-datasets/laion-400m-dataset
title: 'Набор данных Laion-400M'
---

Набор данных [Laion-400M](https://laion.ai/blog/laion-400-open-dataset/) содержит 400 миллионов изображений с английскими подписями к изображениям. В настоящее время Laion предоставляет [даже больший набор данных](https://laion.ai/blog/laion-5b/), но работа с ним будет аналогичной.

Набор данных содержит URL изображения, вложения как для изображения, так и для подписи к изображению, оценку сходства между изображением и подписью, а также метаданные, например, ширину/высоту изображения, лицензию и флаг NSFW. Мы можем использовать набор данных для демонстрации [поиска по приближенным ближайшим соседям](../../engines/table-engines/mergetree-family/annindexes.md) в ClickHouse.

## Подготовка данных {#data-preparation}

Вложенные данные и метаданные хранятся в отдельных файлах в сыром виде. Этап подготовки данных загружает данные, объединяет файлы, преобразует их в CSV и импортирует в ClickHouse. Вы можете использовать следующий скрипт `download.sh` для этого:

```bash
number=${1}
if [[ $number == '' ]]; then
    number=1
fi;
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/img_emb/img_emb_${number}.npy          # загрузить вложение изображения
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/text_emb/text_emb_${number}.npy        # загрузить вложение текста
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/metadata/metadata_${number}.parquet    # загрузить метаданные
python3 process.py $number # объединить файлы и преобразовать в CSV
```
Скрипт `process.py` определяется следующим образом:

```python
import pandas as pd
import numpy as np
import os
import sys

str_i = str(sys.argv[1])
npy_file = "img_emb_" + str_i + '.npy'
metadata_file = "metadata_" + str_i + '.parquet'
text_npy =  "text_emb_" + str_i + '.npy'


# загрузить все файлы
im_emb = np.load(npy_file)
text_emb = np.load(text_npy) 
data = pd.read_parquet(metadata_file)


# объединить файлы
data = pd.concat([data, pd.DataFrame({"image_embedding" : [*im_emb]}), pd.DataFrame({"text_embedding" : [*text_emb]})], axis=1, copy=False)


# колонки для импорта в ClickHouse
data = data[['url', 'caption', 'NSFW', 'similarity', "image_embedding", "text_embedding"]]


# преобразовать np.arrays в списки
data['image_embedding'] = data['image_embedding'].apply(lambda x: list(x))
data['text_embedding'] = data['text_embedding'].apply(lambda x: list(x))


# этот небольшой хак нужен, потому что подпись иногда содержит всевозможные кавычки
data['caption'] = data['caption'].apply(lambda x: x.replace("'", " ").replace('"', " "))


# экспорт данных в CSV файл
data.to_csv(str_i + '.csv', header=False)


# удаление сырых файлов данных
os.system(f"rm {npy_file} {metadata_file} {text_npy}")
```

Чтобы запустить конвейер подготовки данных, выполните:

```bash
seq 0 409 | xargs -P1 -I{} bash -c './download.sh {}'
```

Набор данных разбит на 410 файлов, каждый файл содержит около 1 миллиона строк. Если вы хотите работать с меньшим подмножеством данных, просто измените пределы, например, `seq 0 9 | ...`.

(Скрипт на Python выше работает очень медленно (~2-10 минут на файл), требует много памяти (41 ГБ на файл), и полученные CSV файлы большие (по 10 ГБ каждый), поэтому будьте осторожны. Если у вас достаточно ОЗУ, увеличьте число `-P1` для большего параллелизма. Если это все равно слишком медленно, подумайте о разработке более эффективной процедуры установки - возможно, конвертируя файлы .npy в parquet, а затем выполняя все другие операции с ClickHouse.)

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
SETTINGS index_granularity = 8192
```

Чтобы импортировать CSV файлы в ClickHouse:

```sql
INSERT INTO laion FROM INFILE '{path_to_csv_files}/*.csv'
```

## Запуск неизбирательного поиска ANN (без индекса ANN) {#run-a-brute-force-ann-search-without-ann-index}

Чтобы провести неизбирательный поиск приближенных ближайших соседей, выполните:

```sql
SELECT url, caption FROM laion ORDER BY L2Distance(image_embedding, {target:Array(Float32)}) LIMIT 30
```

`target` - это массив из 512 элементов и параметр клиента. Удобный способ получения таких массивов будет представлен в конце статьи. На данный момент мы можем использовать вложение случайной фотографии кота в качестве `target`.

**Результат**

```markdown
┌─url───────────────────────────────────────────────────────────────────────────────────────────────────────────┬─caption────────────────────────────────────────────────────────────────┐
│ https://s3.amazonaws.com/filestore.rescuegroups.org/6685/pictures/animals/13884/13884995/63318230_463x463.jpg │ Приемная кошка, домашняя короткошерстная                                   │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/8/b/6/239905226.jpg                                        │ Приютите питомца :: Марципан - Нью-Йорк, штат Нью-Йорк                                 │
│ http://d1n3ar4lqtlydb.cloudfront.net/9/2/4/248407625.jpg                                                      │ Приютите питомца :: Манго - Нью-Касл, штат Делавэр                           │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/e/e/c/245615237.jpg                                        │ Приютите питомца :: Тигги - Чикаго, штат Иллинойс                                     │
│ http://pawsofcoronado.org/wp-content/uploads/2012/12/rsz_pumpkin.jpg                                          │ Тыква - оранжевый табби-котенок для усыновления                           │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/7/8/3/188700997.jpg                                        │ Приютите питомца :: Брайан - Брэд Пит котов - Франкфорт, штат Иллинойс             │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/8/b/d/191533561.jpg                                        │ Домашняя короткошерстная кошка для усыновления в Месе, штат Аризона - Чарли         │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/0/1/2/221698235.jpg                                        │ Домашняя короткошерстная кошка для усыновления в Мариетте, штат Огайо - Дейзи (стерилизована) │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────┘

8 строк в наборе. Время: 6.432 сек. Обработано 19.65 миллиона строк, 43.96 ГБ (3.06 миллиона строк/с., 6.84 ГБ/с.)
```

## Запуск ANN с индексом ANN {#run-a-ann-with-an-ann-index}

Создайте новую таблицу с индексом ANN и вставьте данные из существующей таблицы:

```sql
CREATE TABLE laion_annoy
(
    `id` Int64,
    `url` String,
    `caption` String,
    `NSFW` String,
    `similarity` Float32,
    `image_embedding` Array(Float32),
    `text_embedding` Array(Float32),
    INDEX annoy_image image_embedding TYPE annoy(),
    INDEX annoy_text text_embedding TYPE annoy()
)
ENGINE = MergeTree
ORDER BY id
SETTINGS index_granularity = 8192;

INSERT INTO laion_annoy SELECT * FROM laion;
```

По умолчанию индексы Annoy используют расстояние L2 в качестве метрики. Дальнейшие параметры настройки для создания индекса и поиска описаны в [документации индекса Annoy](../../engines/table-engines/mergetree-family/annindexes.md). Проверим теперь снова с тем же запросом:

```sql
SELECT url, caption FROM laion_annoy ORDER BY l2Distance(image_embedding, {target:Array(Float32)}) LIMIT 8
```

**Результат**

```response
┌─url──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─caption──────────────────────────────────────────────────────────────┐
│ http://tse1.mm.bing.net/th?id=OIP.R1CUoYp_4hbeFSHBaaB5-gHaFj                                                                                                                         │ клопы и домашние животные, какие кошки могут переносить клопов советник по питомцам               │
│ http://pet-uploads.adoptapet.com/1/9/c/1963194.jpg?336w                                                                                                                              │ Долговязая домашняя кошка на усыновление в Куинси, штат Массачусетс - Эшли │
│ https://thumbs.dreamstime.com/t/cat-bed-12591021.jpg                                                                                                                                 │ Кот на кровати Стоковое изображение                                               │
│ https://us.123rf.com/450wm/penta/penta1105/penta110500004/9658511-portrait-of-british-short-hair-kitten-lieing-at-sofa-on-sun.jpg                                                    │ Портрет британского короткошерстного котенка, лежащего на диване под солнцем.         │
│ https://www.easypetmd.com/sites/default/files/Wirehaired%20Vizsla%20(2).jpg                                                                                                          │ Визсла (проволочношершавая) изображение 3                                          │
│ https://images.ctfassets.net/yixw23k2v6vo/0000000200009b8800000000/7950f4e1c1db335ef91bb2bc34428de9/dog-cat-flickr-Impatience_1.jpg?w=600&h=400&fm=jpg&fit=thumb&q=65&fl=progressive │ изображение собаки и кошки                                                    │
│ https://i1.wallbox.ru/wallpapers/small/201523/eaa582ee76a31fd.jpg                                                                                                                    │ кошки, котята, лица, тонкинская                                      │
│ https://www.baxterboo.com/images/breeds/medium/cairn-terrier.jpg                                                                                                                     │ Фотография терьера Керна                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────┘

8 строк в наборе. Время: 0.641 сек. Обработано 22.06 тысячи строк, 49.36 МБ (91.53 тысячи строк/с., 204.81 МБ/с.)
```

Скорость значительно увеличилась за счет меньшей точности результатов. Это связано с тем, что индекс ANN предоставляет только приближенные результаты поиска. Обратите внимание, что в примере искались похожие вложения изображений, но также возможно искать положительные вложения подписей к изображениям.

## Создание вложений с помощью UDF {#creating-embeddings-with-udfs}

Чаще всего нужно создавать вложения для новых изображений или новых подписей к изображениям и искать похожие пары изображений/подписей в данных. Мы можем использовать [UDF](/sql-reference/functions/udf), чтобы создать вектор `target`, не выходя из клиента. Важно использовать одну и ту же модель для создания данных и новых вложений для поисков. Следующие скрипты используют модель `ViT-B/32`, которая также лежит в основе набора данных.

### Вложения текста {#text-embeddings}

Сначала сохраните следующий скрипт Python в каталоге `user_scripts/` вашего пути данных ClickHouse и сделайте его исполняемым (`chmod +x encode_text.py`).

`encode_text.py`:

```python
#!/usr/bin/python3
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

Затем создайте `encode_text_function.xml` в месте, указанном в `<user_defined_executable_functions_config>/path/to/*_function.xml</user_defined_executable_functions_config>` в вашем файле конфигурации сервера ClickHouse.

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
Первый запуск будет медленным, потому что он загружает модель, но повторные запуски будут быстрыми. Мы можем затем скопировать вывод в `SET param_target=...` и легко писать запросы.

### Вложения изображения {#image-embeddings}

Вложения изображений могут быть созданы аналогичным образом, но мы предоставим скрипту Python путь к локальному изображению, а не тексту подписи к изображению.

`encode_image.py`

```python
#!/usr/bin/python3
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

Затем выполните этот запрос:

```sql
SELECT encode_image('/path/to/your/image');
```
