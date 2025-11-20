---
'description': '지정된 클러스터에서 많은 노드와 함께 Azure Blob 스토리지의 파일을 병렬로 처리할 수 있도록 합니다.'
'sidebar_label': 'azureBlobStorageCluster'
'sidebar_position': 15
'slug': '/sql-reference/table-functions/azureBlobStorageCluster'
'title': 'azureBlobStorageCluster'
'doc_type': 'reference'
---


# azureBlobStorageCluster 테이블 함수

지정된 클러스터의 여러 노드에서 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 파일을 병렬로 처리할 수 있습니다. 시작자에서 클러스터의 모든 노드에 대한 연결을 생성하고, S3 파일 경로에 별표를 노출하며, 각 파일을 동적으로 배포합니다. 작업 노드에서는 시작자에게 다음 처리할 작업에 대해 요청하고 이를 처리합니다. 모든 작업이 완료될 때까지 이 과정이 반복됩니다. 이 테이블 함수는 [s3Cluster 함수](../../sql-reference/table-functions/s3Cluster.md)와 유사합니다.

## 구문 {#syntax}

```sql
azureBlobStorageCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```

## 인수 {#arguments}

| 인수                  | 설명                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`      | 원격 및 로컬 서버에 대한 주소 및 연결 매개변수를 구축하는 데 사용되는 클러스터의 이름입니다.                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `connection_string` | storage_account_url` — connection_string은 계정 이름 및 키를 포함합니다 ([연결 문자열 만들기](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)) 또는 여기에서 저장소 계정 URL을 제공하고 계정 이름 및 계정 키를 개별 매개변수로 제공할 수 있습니다 (매개변수 account_name 및 account_key 참조) | 
| `container_name`    | 컨테이너 이름                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
| `blobpath`          | 파일 경로입니다. 읽기 전용 모드에서 다음 와일드카드를 지원합니다: `*`, `**`, `?`, `{abc,def}` 및 `{N..M}` 여기서 `N`, `M` — 숫자, `'abc'`, `'def'` — 문자열입니다.                                                                                                                                                                                                                                                                                                                           |
| `account_name`      | storage_account_url이 사용되는 경우, 계정 이름을 여기에서 지정할 수 있습니다.                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `account_key`       | storage_account_url이 사용되는 경우, 계정 키를 여기에서 지정할 수 있습니다.                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `format`            | 파일의 [형식](/sql-reference/formats)입니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `compression`       | 지원되는 값: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. 기본적으로 파일 확장자에 따라 압축을 자동 감지합니다. (자동으로 설정하는 것과 동일합니다).                                                                                                                                                                                                                                                                                                                               |
| `structure`         | 테이블의 구조입니다. 형식 `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                                                                                                                                                                                                                                                                                                                                      |

## 반환값 {#returned_value}

지정된 파일에서 데이터를 읽거나 쓸 수 있도록 지정된 구조의 테이블입니다.

## 예제 {#examples}

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) 테이블 엔진과 유사하게, 사용자는 로컬 Azure Storage 개발을 위해 Azurite 에뮬레이터를 사용할 수 있습니다. 자세한 내용은 [여기](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)를 참조하십시오. 아래에서는 Azurite가 호스트 이름 `azurite1`에서 사용 가능한 것으로 가정합니다.

`cluster_simple` 클러스터의 모든 노드를 사용하여 파일 `test_cluster_*.csv`의 개수를 선택합니다:

```sql
SELECT count(*) FROM azureBlobStorageCluster(
        'cluster_simple', 'http://azurite1:10000/devstoreaccount1', 'testcontainer', 'test_cluster_count.csv', 'devstoreaccount1',
        'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', 'CSV',
        'auto', 'key UInt64')
```

## 공유 액세스 서명(SAS) 사용하기 {#using-shared-access-signatures-sas-sas-tokens}

예제는 [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens)를 참조하십시오.

## 관련 항목 {#related}

- [AzureBlobStorage 엔진](../../engines/table-engines/integrations/azureBlobStorage.md)
- [azureBlobStorage 테이블 함수](../../sql-reference/table-functions/azureBlobStorage.md)
