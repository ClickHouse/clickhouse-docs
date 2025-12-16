---
description: '包含 4 亿张带有英文图像描述的图像的数据集'
sidebar_label: 'Laion-400M 数据集'
slug: /getting-started/example-datasets/laion-400m-dataset
title: 'Laion-400M 数据集'
doc_type: 'guide'
keywords: ['示例数据集', 'laion', '图像嵌入', '示例数据', '机器学习']
---

[Laion-400M 数据集](https://laion.ai/blog/laion-400-open-dataset/) 包含 4 亿张带有英文图像描述的图像。Laion 目前还提供了[一个更大的数据集](https://laion.ai/blog/laion-5b/)，但使用方式与本数据集类似。

该数据集包含图像 URL、图像及其描述各自的嵌入向量、图像与描述之间的相似度得分，以及元数据，例如图像宽度/高度、许可证类型和 NSFW 标记。我们可以使用该数据集来演示 ClickHouse 中的[近似最近邻检索](../../engines/table-engines/mergetree-family/annindexes.md)。

## 数据准备 {#data-preparation}

在原始数据中，向量嵌入和元数据存储在不同的文件中。数据准备步骤会下载数据、合并这些文件，
将其转换为 CSV，并将其导入到 ClickHouse。您可以使用下面的 `download.sh` 脚本来完成这一操作：

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

脚本 `process.py` 定义如下所示：

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

要启动数据准备管道，请运行：

```bash
seq 0 409 | xargs -P1 -I{} bash -c './download.sh {}'
```

该数据集被拆分为 410 个文件，每个文件大约包含 100 万行。如果你想使用较小的数据子集，只需调整范围，例如 `seq 0 9 | ...`。

（上面的 Python 脚本非常慢（每个文件大约需要 2–10 分钟），占用大量内存（每个文件 41 GB），且生成的 CSV 文件很大（每个 10 GB），因此请谨慎使用。如果你的 RAM 足够多，可以增大 `-P1` 的数值以提高并行度。如果这仍然太慢，可以考虑采用更好的摄取流程——例如先将 .npy 文件转换为 parquet，然后使用 ClickHouse 完成其他所有处理。）


## 创建表 {#create-table}

要首先创建一个没有索引的表，请运行：

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

将 CSV 文件导入 ClickHouse：

```sql
INSERT INTO laion FROM INFILE '{path_to_csv_files}/*.csv'
```

请注意，`id` 列仅用于示例，由脚本填充了非唯一的值。


## 运行暴力法向量相似度搜索 {#run-a-brute-force-vector-similarity-search}

要运行暴力法近似向量搜索，请执行：

```sql
SELECT url, caption FROM laion ORDER BY cosineDistance(image_embedding, {target:Array(Float32)}) LIMIT 10
```

`target` 是一个包含 512 个元素的数组，同时也是一个客户端参数。
在文章末尾会介绍一种获取此类数组的便捷方法。
现在，我们可以将一张随机 LEGO 积木套装图片的嵌入向量作为 `target` 来运行。

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

10 rows in set. Elapsed: 4.605 sec. Processed 100.38 million rows, 309.98 GB (21.80 million rows/s., 67.31 GB/s.)
```


## 使用向量相似度索引执行近似向量相似度搜索 {#run-an-approximate-vector-similarity-search-with-a-vector-similarity-index}

现在在该表上定义两个向量相似度索引。

```sql
ALTER TABLE laion ADD INDEX image_index image_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
ALTER TABLE laion ADD INDEX text_index text_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
```

有关索引创建和搜索的参数及性能方面的考虑，请参阅[文档](../../engines/table-engines/mergetree-family/annindexes.md)。
上述索引定义指定了一个 HNSW 索引，使用 “cosine distance” 作为距离度量，其中参数 “hnsw&#95;max&#95;connections&#95;per&#95;layer” 设为 64，参数 “hnsw&#95;candidate&#95;list&#95;size&#95;for&#95;construction” 设为 256。
该索引使用半精度 bfloat16 浮点数作为量化方式来优化内存使用。

要构建并物化该索引，请运行以下语句：

```sql
ALTER TABLE laion MATERIALIZE INDEX image_index;
ALTER TABLE laion MATERIALIZE INDEX text_index;
```

构建并保存索引可能需要几分钟，甚至几小时，具体取决于行数和 HNSW 索引参数。

要执行向量搜索，只需再次运行相同的查询：

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

10 rows in set. Elapsed: 0.019 sec. Processed 137.27 thousand rows, 24.42 MB (7.38 million rows/s., 1.31 GB/s.)
```

查询延迟显著降低，因为最近邻是通过向量索引检索到的。
使用向量相似度索引进行向量相似度搜索时，返回的结果可能会与使用暴力搜索得到的结果略有不同。
通过谨慎选择 HNSW 参数并评估索引质量，HNSW 索引有可能实现接近 1 的召回率（与暴力搜索具有相同的准确性）。


## 使用 UDF 创建嵌入 {#creating-embeddings-with-udfs}

通常我们希望为新的图像或新的图像标题创建嵌入，并在数据中搜索相似的图像 / 图像标题对。我们可以使用 [UDF](/sql-reference/functions/udf) 在客户端侧直接创建 `target` 向量。重要的是，必须使用同一模型来生成原始数据以及用于搜索的新嵌入。以下脚本使用 `ViT-B/32` 模型，该模型也是该数据集所依托的基础模型。

### 文本嵌入 {#text-embeddings}

首先，将以下 Python 脚本保存到 ClickHouse 数据路径下的 `user_scripts/` 目录中，并赋予其可执行权限（`chmod +x encode_text.py`）。

`encode_text.py`：

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

然后在 ClickHouse 服务器配置文件中由 `<user_defined_executable_functions_config>/path/to/*_function.xml</user_defined_executable_functions_config>` 指定的位置创建 `encode_text_function.xml`。

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

现在即可直接使用：

```sql
SELECT encode_text('cat');
```

第一次运行会比较慢，因为需要加载模型，但后续的重复运行会很快。接着我们可以将输出复制到 `SET param_target=...` 中，就能轻松编写查询。或者，也可以直接将 `encode_text()` 函数作为 `cosineDistance` 函数的参数使用：

```SQL
SELECT url
FROM laion
ORDER BY cosineDistance(text_embedding, encode_text('a dog and a cat')) ASC
LIMIT 10
```

请注意，`encode_text()` UDF 本身可能需要几秒钟来计算并生成嵌入向量。


### 图像嵌入 {#image-embeddings}

图像嵌入的创建方式类似，我们提供了一个 Python 脚本，可为以本地文件形式存储的图像生成嵌入向量。

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

获取一个用于搜索的示例图像：

```shell
# get a random image of a LEGO set
$ wget http://cdn.firstcry.com/brainbees/images/products/thumb/191325a.jpg
```

然后运行此查询，为上面的图像生成嵌入向量：

```sql
SELECT encode_image('/path/to/your/image');
```

完整的搜索查询语句为：

```sql
SELECT
    url,
    caption
FROM laion
ORDER BY cosineDistance(image_embedding, encode_image('/path/to/your/image')) ASC
LIMIT 10
```
