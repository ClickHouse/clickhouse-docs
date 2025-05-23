---
'description': '数据集包含 400 百万图像，带有英文图像说明'
'sidebar_label': 'Laion-400M 数据集'
'slug': '/getting-started/example-datasets/laion-400m-dataset'
'title': 'Laion-400M 数据集'
---

The [Laion-400M dataset](https://laion.ai/blog/laion-400-open-dataset/) 包含 4 亿张带有英文图像描述的图像。如今，Laion 提供了 [一个更大的数据集](https://laion.ai/blog/laion-5b/)，但与之合作的方式将是类似的。

该数据集包含图像 URL、图像和图像描述的嵌入、图像与图像描述之间的相似性评分，以及元数据，如图像宽度/高度、许可证和 NSFW 标志。我们可以使用该数据集来演示 [近似最近邻搜索](../../engines/table-engines/mergetree-family/annindexes.md) 在 ClickHouse 中的用法。

## 数据准备 {#data-preparation}

嵌入和元数据存储在原始数据的不同文件中。数据准备步骤下载数据、合并文件，将其转换为 CSV 并导入到 ClickHouse 中。您可以使用以下 `download.sh` 脚本来实现：

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
脚本 `process.py` 定义如下：

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
data['image_embedding'] = data['image_embedding'].apply(lambda x: list(x))
data['text_embedding'] = data['text_embedding'].apply(lambda x: list(x))


# this small hack is needed becase caption sometimes contains all kind of quotes
data['caption'] = data['caption'].apply(lambda x: x.replace("'", " ").replace('"', " "))


# export data as CSV file
data.to_csv(str_i + '.csv', header=False)


# removed raw data files
os.system(f"rm {npy_file} {metadata_file} {text_npy}")
```

要启动数据准备管道，请运行：

```bash
seq 0 409 | xargs -P1 -I{} bash -c './download.sh {}'
```

数据集被分成 410 个文件，每个文件包含约 100 万行。如果您想使用较小的数据子集，只需调整限制，例如 `seq 0 9 | ...`。

（上述 Python 脚本速度非常慢（每个文件约 2-10 分钟），占用大量内存（每个文件 41 GB），并且生成的 CSV 文件较大（每个 10 GB），所以请小心。如果您的 RAM 足够，可以增加 `-P1` 数字以提高并行性。如果仍然太慢，请考虑制定更好的导入程序——也许将 .npy 文件转换为 parquet，然后用 ClickHouse 处理所有其他操作。）

## 创建表 {#create-table}

要创建一个没有索引的表，请运行：

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

要将 CSV 文件导入到 ClickHouse 中：

```sql
INSERT INTO laion FROM INFILE '{path_to_csv_files}/*.csv'
```

## 运行无 ANN 索引的暴力近似最近邻搜索 {#run-a-brute-force-ann-search-without-ann-index}

要运行暴力的近似最近邻搜索，请运行：

```sql
SELECT url, caption FROM laion ORDER BY L2Distance(image_embedding, {target:Array(Float32)}) LIMIT 30
```

`target` 是一个包含 512 个元素的数组和一个客户端参数。获取这样的数组的方便方法将在文章结束时呈现。现在，我们可以将随机猫图像的嵌入作为 `target` 进行运行。

**结果**

```markdown
┌─url───────────────────────────────────────────────────────────────────────────────────────────────────────────┬─caption────────────────────────────────────────────────────────────────┐
│ https://s3.amazonaws.com/filestore.rescuegroups.org/6685/pictures/animals/13884/13884995/63318230_463x463.jpg │ Adoptable Female Domestic Short Hair                                   │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/8/b/6/239905226.jpg                                        │ Adopt A Pet :: Marzipan - New York, NY                                 │
│ http://d1n3ar4lqtlydb.cloudfront.net/9/2/4/248407625.jpg                                                      │ Adopt A Pet :: Butterscotch - New Castle, DE                           │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/e/e/c/245615237.jpg                                        │ Adopt A Pet :: Tiggy - Chicago, IL                                     │
│ http://pawsofcoronado.org/wp-content/uploads/2012/12/rsz_pumpkin.jpg                                          │ Pumpkin an orange tabby  kitten for adoption                           │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/7/8/3/188700997.jpg                                        │ Adopt A Pet :: Brian the Brad Pitt of cats - Frankfort, IL             │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/8/b/d/191533561.jpg                                        │ Domestic Shorthair Cat for adoption in Mesa, Arizona - Charlie         │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/0/1/2/221698235.jpg                                        │ Domestic Shorthair Cat for adoption in Marietta, Ohio - Daisy (Spayed) │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────┘

8 rows in set. Elapsed: 6.432 sec. Processed 19.65 million rows, 43.96 GB (3.06 million rows/s., 6.84 GB/s.)
```

## 运行带 ANN 索引的 ANN {#run-a-ann-with-an-ann-index}

创建一个带 ANN 索引的新表，并从现有表中插入数据：

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

默认情况下，Annoy 索引用 L2 距离作为度量。索引创建和搜索的进一步调优参数在 Annoy 索引 [文档](../../engines/table-engines/mergetree-family/annindexes.md) 中进行了描述。现在，我们再次用相同的查询进行检查：

```sql
SELECT url, caption FROM laion_annoy ORDER BY l2Distance(image_embedding, {target:Array(Float32)}) LIMIT 8
```

**结果**

```response
┌─url──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─caption──────────────────────────────────────────────────────────────┐
│ http://tse1.mm.bing.net/th?id=OIP.R1CUoYp_4hbeFSHBaaB5-gHaFj                                                                                                                         │ bed bugs and pets can cats carry bed bugs pets adviser               │
│ http://pet-uploads.adoptapet.com/1/9/c/1963194.jpg?336w                                                                                                                              │ Domestic Longhair Cat for adoption in Quincy, Massachusetts - Ashley │
│ https://thumbs.dreamstime.com/t/cat-bed-12591021.jpg                                                                                                                                 │ Cat on bed Stock Image                                               │
│ https://us.123rf.com/450wm/penta/penta1105/penta110500004/9658511-portrait-of-british-short-hair-kitten-lieing-at-sofa-on-sun.jpg                                                    │ Portrait of british short hair kitten lieing at sofa on sun.         │
│ https://www.easypetmd.com/sites/default/files/Wirehaired%20Vizsla%20(2).jpg                                                                                                          │ Vizsla (Wirehaired) image 3                                          │
│ https://images.ctfassets.net/yixw23k2v6vo/0000000200009b8800000000/7950f4e1c1db335ef91bb2bc34428de9/dog-cat-flickr-Impatience_1.jpg?w=600&h=400&fm=jpg&fit=thumb&q=65&fl=progressive │ dog and cat image                                                    │
│ https://i1.wallbox.ru/wallpapers/small/201523/eaa582ee76a31fd.jpg                                                                                                                    │ cats, kittens, faces, tonkinese                                      │
│ https://www.baxterboo.com/images/breeds/medium/cairn-terrier.jpg                                                                                                                     │ Cairn Terrier Photo                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────┘

8 rows in set. Elapsed: 0.641 sec. Processed 22.06 thousand rows, 49.36 MB (91.53 thousand rows/s., 204.81 MB/s.)
```

速度显著提高，但结果的准确性降低。这是因为 ANN 索引只能提供近似搜索结果。请注意该示例搜索了相似图像嵌入，但也可以搜索正向图像描述嵌入。

## 使用 UDF 创建嵌入 {#creating-embeddings-with-udfs}

通常希望为新图像或新图像描述创建嵌入，并在数据中搜索相似的图像/图像描述对。我们可以使用 [UDF](/sql-reference/functions/udf) 来创建 `target` 向量，而无需离开客户端。重要的是使用相同的模型创建数据和新嵌入以进行搜索。以下脚本利用了同样支撑数据集的 `ViT-B/32` 模型。

### 文本嵌入 {#text-embeddings}

首先，将以下 Python 脚本存储在 ClickHouse 数据路径的 `user_scripts/` 目录中并使其可执行（`chmod +x encode_text.py`）。

`encode_text.py`：

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

然后在 ClickHouse 服务器配置文件中创建 `encode_text_function.xml`，此路径在 `<user_defined_executable_functions_config>/path/to/*_function.xml</user_defined_executable_functions_config>` 中引用。

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

您现在可以简单使用：

```sql
SELECT encode_text('cat');
```
第一次运行会很慢，因为它加载模型，但重复运行将会很快。然后我们可以将输出复制到 `SET param_target=...`，并可以轻松写查询。

### 图像嵌入 {#image-embeddings}

图像嵌入可以类似创建，但我们将向 Python 脚本提供本地图像的路径，而不是图像描述文本。

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

然后运行以下查询：

```sql
SELECT encode_image('/path/to/your/image');
```
