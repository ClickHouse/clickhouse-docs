---
'description': 'caching mechanism that allows for caching of data in in-process memory
  rather than relying on the OS page cache.'
'sidebar_label': 'Userspace page cache'
'sidebar_position': 65
'slug': '/operations/userspace-page-cache'
'title': 'Userspace page cache'
---




# ユーザースペースページキャッシュ

## 概要 {#overview}

> ユーザースペースページキャッシュは、OSページキャッシュに依存することなく、プロセスマemory内のデータをキャッシュする新しいキャッシングメカニズムです。

ClickHouseはすでに、[ファイルシステムキャッシュ](/operations/storing-data)を提供しており、これはAmazon S3、Google Cloud Storage (GCS)、またはAzure Blob Storageなどのリモートオブジェクトストレージの上にキャッシングを行う方法です。ユーザースペースページキャッシュは、通常のOSキャッシングが充分ではないときに、リモートデータへのアクセスをスピードアップするために設計されています。

ファイルシステムキャッシュとは以下の点で異なります：

| ファイルシステムキャッシュ                                   | ユーザースペースページキャッシュ                  |
|-------------------------------------------------------------|---------------------------------------|
| ローカルファイルシステムにデータを書き込む                | メモリ内にのみ存在                   |
| ディスクスペースを占有する（tmpfsで設定可能）             | ファイルシステムとは独立               |
| サーバーの再起動後も残る                                   | サーバーの再起動後は残らない              |
| サーバーのメモリ使用量に表示されない                       | サーバーのメモリ使用量に表示される       |
| ディスク上とメモリ内（OSページキャッシュ）の両方に適している | **ディスクレスサーバーに適している**       |

## 設定と使用法 {#configuration-settings-and-usage}

### 使用法 {#usage}

ユーザースペースページキャッシュを有効にするには、まずサーバーで設定します：

```bash
cat config.d/page_cache.yaml
page_cache_max_size: 100G
```

:::note
ユーザースペースページキャッシュは指定された量のメモリを使用しますが、このメモリ量は予約されません。他のサーバーのニーズのために必要になった場合、メモリは追い出されます。
:::

次に、クエリーレベルでの使用を有効にします：

```sql
SET use_page_cache_for_disks_without_file_cache=1;
```

### 設定 {#settings}

| 設定名                                                  | 説明                                                                                                                                                                                                                                                                                                            | デフォルト     |
|--------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| `use_page_cache_for_disks_without_file_cache`          | ファイルシステムキャッシュが有効でないリモートディスクに対してユーザースペースページキャッシュを使用します。                                                                                                                                                                                           | `0`         |
| `use_page_cache_with_distributed_cache`                | 分散キャッシュが使用されているときにユーザースペースページキャッシュを使用します。                                                                                                                                                                                                                       | `0`         |
| `read_from_page_cache_if_exists_otherwise_bypass_cache` | 他にキャッシュをバイパスする場合、ユーザースペースページキャッシュをパッシブモードで使用します。これは [`read_from_filesystem_cache_if_exists_otherwise_bypass_cache`](/operations/settings/settings#read_from_filesystem_cache_if_exists_otherwise_bypass_cache) と似ています。                         | `0`         |
| `page_cache_inject_eviction`                           | ユーザースペースページキャッシュは時々ランダムにいくつかのページを無効にします。テスト用です。                                                                                                                                                                                                                                                                                     | `0`         |
| `page_cache_block_size`                                | ユーザースペースページキャッシュに保存するファイルチャンクのサイズ（バイト単位）です。キャッシュを通る全ての読み取りはこのサイズの倍数に切り上げられます。                                                                                                                                                               | `1048576`   |
| `page_cache_history_window_ms`                         | 解放されたメモリがユーザースペースページキャッシュで使用できるまでの遅延。                                                                                                                                                                                                                                                                              | `1000`      |
| `page_cache_policy`                                    | ユーザースペースページキャッシュのポリシー名です。                                                                                                                                                                                                                                                                                             | `SLRU`      |
| `page_cache_size_ratio`                                | ユーザースペースページキャッシュ内の保護キューのサイズをキャッシュ全体のサイズに対する比率です。                                                                                                                                                                                                                               | `0.5`       |
| `page_cache_min_size`                                  | ユーザースペースページキャッシュの最小サイズです。                                                                                                                                                                                                                                                                                        | `104857600` |
| `page_cache_max_size`                                  | ユーザースペースページキャッシュの最大サイズです。キャッシュを無効にするには0に設定します。`page_cache_min_size`より大きい場合、キャッシュサイズはこの範囲内で継続的に調整され、利用可能なメモリのほとんどを使用し、総メモリ使用量を制限（`max_server_memory_usage`\[`_to_ram_ratio`\]）内に保ちます。 | `0`         |
| `page_cache_free_memory_ratio`                         | ユーザースペースページキャッシュから解放しておくメモリの割合です。Linuxのmin_free_kbytes設定に類似しています。                                                                                                                                                                                                                     | `0.15`      |
| `page_cache_lookahead_blocks`                          | ユーザースペースページキャッシュのミス時に、底層ストレージから一度にこの数の連続ブロックを読み取ります。それらもキャッシュにない場合です。各ブロックはpage_cache_block_sizeバイトです。                                                                                                                                          | `16`        |
| `page_cache_shards`                                    | ミューテックス競合を減らすために、指定された数のシャードにわたってユーザースペースページキャッシュをストライプします。実験的で、パフォーマンス向上の可能性は低いです。                                                                                                                                                                          | `4`         |

## 関連コンテンツ {#related-content}
- [ファイルシステムキャッシュ](/operations/storing-data)
- [ClickHouse v25.3 リリースウェビナー](https://www.youtube.com/live/iCKEzp0_Z2Q?feature=shared&t=1320)
