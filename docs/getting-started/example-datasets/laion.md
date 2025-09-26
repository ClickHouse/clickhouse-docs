---
description: 'Dataset containing 400 million images with English image captions'
sidebar_label: 'Laion-400M dataset'
slug: /getting-started/example-datasets/laion-400m-dataset
title: 'Laion-400M dataset'
doc_type: 'reference'
---

The [Laion-400M dataset](https://laion.ai/blog/laion-400-open-dataset/) contains 400 million images with English image captions. Laion nowadays provides [an even larger dataset](https://laion.ai/blog/laion-5b/) but working with it will be similar.

The dataset contains the image URL, embeddings for both the image and the image caption, a similarity score between the image and the image caption, as well as metadata, e.g. the image width/height, the licence and a NSFW flag. We can use the dataset to demonstrate [approximate nearest neighbor search](../../engines/table-engines/mergetree-family/annindexes.md) in ClickHouse.

## Data preparation {#data-preparation}

The embeddings and the metadata are stored in separate files in the raw data. A data preparation step downloads the data, merges the files,
converts them to CSV and imports them into ClickHouse. You can use the following `download.sh` script for that:

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
Script `process.py` is defined as follows:

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

To start the data preparation pipeline, run:

```bash
seq 0 409 | xargs -P1 -I{} bash -c './download.sh {}'
```

The dataset is split into 410 files, each file contains ca. 1 million rows. If you like to work with a smaller subset of the data, simply adjust the limits, e.g. `seq 0 9 | ...`.

(The python script above is very slow (~2-10 minutes per file), takes a lot of memory (41 GB per file), and the resulting csv files are big (10 GB each), so be careful. If you have enough RAM, increase the `-P1` number for more parallelism. If this is still too slow, consider coming up with a better ingestion procedure - maybe converting the .npy files to parquet, then doing all the other processing with clickhouse.)

## Create table {#create-table}

To create a table initially without indexes, run:

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

To import the CSV files into ClickHouse:

```sql
INSERT INTO laion FROM INFILE '{path_to_csv_files}/*.csv'
```

Note that the `id` column is just for illustration and is populated by the script with non-unique values.

## Run a brute-force vector similarity search {#run-a-brute-force-vector-similarity-search}

To run a brute-force approximate vector search, run:

```sql
SELECT url, caption FROM laion ORDER BY cosineDistance(image_embedding, {target:Array(Float32)}) LIMIT 10
```

`target` is an array of 512 elements and a client parameter.
A convenient way to obtain such arrays will be presented at the end of the article.
For now, we can run the embedding of a random LEGO set picture as `target`.

**Result**

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

## Run an approximate vector similarity search with a vector similarity index {#run-an-approximate-vector-similarity-search-with-a-vector-similarity-index}

Let's now define two vector similarity indexes on the table.

```sql
ALTER TABLE laion ADD INDEX image_index image_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
ALTER TABLE laion ADD INDEX text_index text_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
```

The parameters and performance considerations for index creation and search are described in the [documentation](../../engines/table-engines/mergetree-family/annindexes.md).
The above index definition specifies a HNSW index using the "cosine distance" as distance metric with the parameter "hnsw_max_connections_per_layer" set to 64 and parameter "hnsw_candidate_list_size_for_construction" set to 256.
The index uses half-precision brain floats (bfloat16) as quantization to optimize memory usage.

To build and materialize the index, run these statements :

```sql
ALTER TABLE laion MATERIALIZE INDEX image_index;
ALTER TABLE laion MATERIALIZE INDEX text_index;
```

Building and saving the index could take a few minutes or even hours, depending on the number of rows and HNSW index parameters.

To perform a vector search, just execute the same query again:

```sql
SELECT url, caption FROM laion ORDER BY cosineDistance(image_embedding, {target:Array(Float32)}) LIMIT 10
```

**Result**

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

The query latency decreased significantly because the nearest neighbours were retrieved using the vector index.
Vector similarity search using a vector similarity index may return results that differ slightly from the brute-force search results.
An HNSW index can potentially achieve a recall close to 1 (same accuracy as brute force search) with a careful selection of the HNSW parameters and evaluating the index quality.

## Creating embeddings with UDFs {#creating-embeddings-with-udfs}

One usually wants to create embeddings for new images or new image captions and search for similar image / image caption pairs in the data. We can use [UDF](/sql-reference/functions/udf) to create the `target` vector without leaving the client. It is important to use the same model to create the data and new embeddings for searches. The following scripts utilize the `ViT-B/32` model which also underlies the dataset.

### Text embeddings {#text-embeddings}

First, store the following Python script in the `user_scripts/` directory of your ClickHouse data path and make it executable (`chmod +x encode_text.py`).

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

Then create `encode_text_function.xml` in a location referenced by `<user_defined_executable_functions_config>/path/to/*_function.xml</user_defined_executable_functions_config>` in your ClickHouse server configuration file.

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

You can now simply use:

```sql
SELECT encode_text('cat');
```
The first run will be slow because it loads the model, but repeated runs will be fast. We can then copy the output to `SET param_target=...` and can easily write queries. Alternatively, the `encode_text()` function can directly be used as a argument to the `cosineDistance` function :

```SQL
SELECT url
FROM laion
ORDER BY cosineDistance(text_embedding, encode_text('a dog and a cat')) ASC
LIMIT 10
```

Note that the `encode_text()` UDF itself could require a few seconds to compute and emit the embedding vector.

### Image embeddings {#image-embeddings}

Image embeddings can be created similarly and we provide a Python script that can generate an embedding of an image stored locally as a file.

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

Fetch an example image to search :

```shell
# get a random image of a LEGO set
$ wget http://cdn.firstcry.com/brainbees/images/products/thumb/191325a.jpg
```

Then run this query to generate the embedding for above image :

```sql
SELECT encode_image('/path/to/your/image');
```

The complete search query is :

```sql
SELECT
    url,
    caption
FROM laion
ORDER BY cosineDistance(image_embedding, encode_image('/path/to/your/image')) ASC
LIMIT 10
```
