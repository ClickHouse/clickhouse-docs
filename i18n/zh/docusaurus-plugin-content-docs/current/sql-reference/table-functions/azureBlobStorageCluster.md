---
'description': '允许在指定集群中与多个节点并行处理来自 Azure Blob 存储的文件。'
'sidebar_label': 'azureBlobStorageCluster'
'sidebar_position': 15
'slug': '/sql-reference/table-functions/azureBlobStorageCluster'
'title': 'azureBlobStorageCluster'
---


# azureBlobStorageCluster 表函数

允许在指定集群中的多个节点上并行处理来自 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 的文件。在发起者上，它与集群中的所有节点建立连接，披露 S3 文件路径中的星号，并动态分配每个文件。在工作节点上，它向发起者请求下一个要处理的任务并进行处理。这一过程会重复，直到所有任务完成。
该表函数类似于 [s3Cluster function](../../sql-reference/table-functions/s3Cluster.md)。

## 语法 {#syntax}

```sql
azureBlobStorageCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```

## 参数 {#arguments}

| 参数                 | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`       | 用于构建远程和本地服务器地址及连接参数集合的集群名称。                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `connection_string`  | storage_account_url` — 连接字符串包括账户名称和密钥 ([创建连接字符串](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account))，您也可以在此处提供存储账户 URL，并将账户名称和账户密钥作为单独的参数提供（见参数 account_name 和 account_key） | 
| `container_name`     | 容器名称                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `blobpath`           | 文件路径。支持以下可以在只读模式下使用的通配符：`*`、`**`、`?`、`{abc,def}` 和 `{N..M}`，其中 `N` 和 `M` 为数字，`'abc'` 和 `'def'` 为字符串。                                                                                                                                                                                                                                                                                                                                      |
| `account_name`       | 如果使用 storage_account_url，则可以在此处指定账户名称。                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `account_key`        | 如果使用 storage_account_url，则可以在此处指定账户密钥。                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `format`             | 文件的 [格式](/sql-reference/formats)。                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `compression`        | 支持的值：`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。默认情况下，它会根据文件扩展名自动检测压缩（同于设置为 `auto`）。                                                                                                                                                                                                                                                                                                                                                                   |
| `structure`          | 表的结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                                                                                                                                                         |

## 返回值 {#returned_value}

返回一个指定结构的表以读取或写入指定文件中的数据。

## 示例 {#examples}

类似于 [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) 表引擎，用户可以使用 Azurite 模拟器进行本地 Azure 存储开发。更多细节请见 [这里](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)。以下假设 Azurite 在主机名 `azurite1` 上可用。

选择文件 `test_cluster_*.csv` 的计数，使用 `cluster_simple` 集群中的所有节点：

```sql
SELECT count(*) from azureBlobStorageCluster(
        'cluster_simple', 'http://azurite1:10000/devstoreaccount1', 'testcontainer', 'test_cluster_count.csv', 'devstoreaccount1',
        'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', 'CSV',
        'auto', 'key UInt64')
```

## 使用共享访问签名 (SAS) {#using-shared-access-signatures-sas-sas-tokens}

有关示例，请参见 [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens)。

## 相关 {#related}

- [AzureBlobStorage 引擎](../../engines/table-engines/integrations/azureBlobStorage.md)
- [azureBlobStorage 表函数](../../sql-reference/table-functions/azureBlobStorage.md)
