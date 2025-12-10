---
description: '包含 4 亿张带英文图像说明文字的图像的数据集'
sidebar_label: 'Laion-400M 数据集'
slug: /getting-started/example-datasets/laion-400m-dataset
title: 'Laion-400M 数据集'
doc_type: 'guide'
keywords: ['示例数据集', 'laion', '图像嵌入', '示例数据', '机器学习']
---

[Laion-400M 数据集](https://laion.ai/blog/laion-400-open-dataset/) 包含 4 亿张带有英文图像说明文字的图像。Laion 目前还提供了[更大的数据集](https://laion.ai/blog/laion-5b/)，但使用方式与本数据集类似。

该数据集包含图像 URL、图像及其说明文字各自的嵌入向量、图像与图像说明文字之间的相似度评分，以及元数据，例如图像宽度/高度、许可证类型和 NSFW 标志。我们可以使用该数据集来演示 ClickHouse 中的[近似最近邻搜索](../../engines/table-engines/mergetree-family/annindexes.md)。

## 数据准备 {#data-preparation}

在原始数据中，embedding 向量和元数据存储在不同的文件中。数据准备步骤会下载数据、合并这些文件，
将它们转换为 CSV 格式并导入 ClickHouse。可以使用下面的 `download.sh` 脚本来完成这一操作：

```bash
number=${1}
if [[ $number == '' ]]; then
    number=1
fi;
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/img_emb/img_emb_${number}.npy          # 下载图像嵌入向量
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/text_emb/text_emb_${number}.npy        # 下载文本嵌入向量
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/metadata/metadata_${number}.parquet    # 下载元数据
python3 process.py $number # 合并文件并转换为 CSV 格式
```

脚本 `process.py` 的定义如下：

```python
import pandas as pd
import numpy as np
import os
import sys

str_i = str(sys.argv[1])
npy_file = "img_emb_" + str_i + '.npy'
metadata_file = "metadata_" + str_i + '.parquet'
text_npy =  "text_emb_" + str_i + '.npy'

# 加载所有文件 {#load-all-files}
im_emb = np.load(npy_file)
text_emb = np.load(text_npy) 
data = pd.read_parquet(metadata_file)

# 合并文件 {#combine-files}
data = pd.concat([data, pd.DataFrame({"image_embedding" : [*im_emb]}), pd.DataFrame({"text_embedding" : [*text_emb]})], axis=1, copy=False)

# 待导入 ClickHouse 的列 {#columns-to-be-imported-into-clickhouse}
data = data[['url', 'caption', 'NSFW', 'similarity', "image_embedding", "text_embedding"]]

# 将 np.arrays 转换为列表 {#transform-nparrays-to-lists}
data['image_embedding'] = data['image_embedding'].apply(lambda x: x.tolist())
data['text_embedding'] = data['text_embedding'].apply(lambda x: x.tolist())

# 此处需要使用这个小技巧,因为 caption 有时会包含各种引号 {#this-small-hack-is-needed-because-caption-sometimes-contains-all-kind-of-quotes}
data['caption'] = data['caption'].apply(lambda x: x.replace("'", " ").replace('"', " "))

# 导出数据为 CSV 文件 {#export-data-as-csv-file}
data.to_csv(str_i + '.csv', header=False)

# 删除原始数据文件 {#removed-raw-data-files}
os.system(f"rm {npy_file} {metadata_file} {text_npy}")
```

要启动数据准备管道，请运行：

```bash
seq 0 409 | xargs -P1 -I{} bash -c './download.sh {}'
```

该数据集被拆分为 410 个文件，每个文件包含约 100 万行。如果你只想处理较小的数据子集，只需调整范围，例如 `seq 0 9 | ...`。

（上面的 Python 脚本非常慢（每个文件大约需要 2–10 分钟），占用大量内存（每个文件 41 GB），且生成的 CSV 文件也很大（每个 10 GB），使用时请谨慎。如果你的 RAM 足够多，可以增大 `-P1` 的数值以提高并行度。如果这仍然太慢，可以考虑设计更好的摄取流程——例如先将 .npy 文件转换为 Parquet，然后使用 ClickHouse 完成其余处理。）

## 创建表 {#create-table}

要先创建一个不带索引的表，运行：

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

将 CSV 文件导入 ClickHouse：

```sql
INSERT INTO laion FROM INFILE '{path_to_csv_files}/*.csv'
```

请注意，`id` 列仅用于示例说明，脚本会向其中写入非唯一值。

## 运行基于暴力算法的向量相似度搜索 {#run-a-brute-force-vector-similarity-search}

要运行一次基于暴力算法的近似向量搜索，请执行：

```sql
SELECT url, caption FROM laion ORDER BY cosineDistance(image_embedding, {target:Array(Float32)}) LIMIT 10
```

`target` 是一个包含 512 个元素的数组，同时也是一个客户端参数。
本文末尾会介绍一种获取此类数组的便捷方法。
目前，我们可以先使用一张随机的 LEGO 积木套装图片作为 `target` 来运行嵌入。

**结果**

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

返回 10 行。用时:4.605 秒。已处理 1.0038 亿行,309.98 GB(每秒 2180 万行,每秒 67.31 GB)
```

## 使用向量相似性索引执行近似向量相似性搜索 {#run-an-approximate-vector-similarity-search-with-a-vector-similarity-index}

现在我们在该表上定义两个向量相似性索引。

```sql
ALTER TABLE laion ADD INDEX image_index image_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
ALTER TABLE laion ADD INDEX text_index text_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
```

有关索引创建和搜索的参数及性能考虑，请参阅[文档](../../engines/table-engines/mergetree-family/annindexes.md)。
上述索引定义指定了一个使用“余弦距离（cosine distance）”作为距离度量的 HNSW 索引，其中参数“hnsw&#95;max&#95;connections&#95;per&#95;layer”设置为 64，参数“hnsw&#95;candidate&#95;list&#95;size&#95;for&#95;construction”设置为 256。
该索引用半精度 bfloat16 浮点数（brain floating point）作为量化格式来优化内存使用。

要构建并物化该索引，运行以下语句：

```sql
ALTER TABLE laion MATERIALIZE INDEX image_index;
ALTER TABLE laion MATERIALIZE INDEX text_index;
```

构建并保存索引可能需要几分钟甚至数小时，具体取决于数据行数量和 HNSW 索引参数的设置。

要执行向量搜索，只需再次执行同一条查询语句：

```sql
SELECT url, caption FROM laion ORDER BY cosineDistance(image_embedding, {target:Array(Float32)}) LIMIT 10
```

**结果**

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

返回 10 行。用时:0.019 秒。已处理 13.73 万行,24.42 MB(738 万行/秒,1.31 GB/秒)。
```

查询延迟显著降低，因为最近邻是通过向量索引检索的。
使用向量相似度索引进行向量相似度搜索时，返回的结果可能会与暴力搜索的结果略有差异。
通过谨慎选择 HNSW 参数并评估索引质量，HNSW 索引有望实现接近 1 的召回率（与暴力搜索具有相同的准确性）。

## 使用 UDF 创建嵌入向量 {#creating-embeddings-with-udfs}

通常我们希望为新的图像或新的图像描述创建嵌入向量，并在数据中搜索相似的图像/图像描述对。我们可以使用 [UDF](/sql-reference/functions/udf) 直接在客户端中创建 `target` 向量。务必使用同一模型来生成原始数据和搜索时用的新嵌入向量。下面的脚本使用的是 `ViT-B/32` 模型，该模型也是此数据集所基于的模型。

### 文本嵌入 {#text-embeddings}

首先，将以下 Python 脚本保存到 ClickHouse 数据路径下的 `user_scripts/` 目录中，并将其设为可执行文件（`chmod +x encode_text.py`）。

`encode_text.py`:

```python
#!/usr/bin/python3
#!注意:如果使用虚拟环境,请修改上方 python3 可执行文件的路径。
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

然后在 ClickHouse 服务器配置文件中由 `<user_defined_executable_functions_config>/path/to/*_function.xml</user_defined_executable_functions_config>` 引用的位置创建 `encode_text_function.xml`。

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

现在可以直接使用：

```sql
SELECT encode_text('cat');
```

第一次运行会比较慢，因为需要加载模型，但后续多次运行会很快。然后我们可以将输出复制到 `SET param_target=...` 中，从而轻松编写查询。或者，也可以直接将 `encode_text()` 函数作为 `cosineDistance` 函数的参数使用：

```SQL
SELECT url
FROM laion
ORDER BY cosineDistance(text_embedding, encode_text('a dog and a cat')) ASC
LIMIT 10
```

请注意，`encode_text()` UDF 本身的计算可能需要几秒钟才能生成嵌入向量。

### 图像嵌入 {#image-embeddings}

图像嵌入的创建方式类似，我们提供了一个 Python 脚本，可为以本地图像文件形式存储的图像生成嵌入向量。

`encode_image.py`

```python
#!/usr/bin/python3
#!注意:如果使用虚拟环境,请更改上面的 python3 可执行文件位置。
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

获取示例图片进行搜索：

```shell
# 获取乐高套装的随机图片 {#get-a-random-image-of-a-lego-set}
$ wget http://cdn.firstcry.com/brainbees/images/products/thumb/191325a.jpg
```

然后运行以下查询，为上面的图片生成嵌入向量：

```sql
SELECT encode_image('/path/to/your/image');
```

完整的搜索查询如下：

```sql
SELECT
    url,
    caption
FROM laion
ORDER BY cosineDistance(image_embedding, encode_image('/path/to/your/image')) ASC
LIMIT 10
```
