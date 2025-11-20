---
sidebar_label: 'Шифрование данных'
slug: /cloud/security/cmek
title: 'Шифрование данных'
description: 'Узнайте больше о шифровании данных в ClickHouse Cloud'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'encryption', 'CMEK', 'KMS key poller']
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import cmek_performance from '@site/static/images/_snippets/cmek-performance.png';


# Шифрование данных



## Шифрование на уровне хранилища {#storage-encryption}

ClickHouse Cloud по умолчанию настроен с шифрованием неактивных данных с использованием ключей AES 256, управляемых облачным провайдером. Для получения дополнительной информации см.:

- [Серверное шифрование AWS для S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingServerSideEncryption.html)
- [Шифрование неактивных данных по умолчанию в GCP](https://cloud.google.com/docs/security/encryption/default-encryption)
- [Шифрование хранилища Azure для неактивных данных](https://learn.microsoft.com/en-us/azure/storage/common/storage-service-encryption)


## Шифрование на уровне базы данных {#database-encryption}

<EnterprisePlanFeatureBadge feature='Enhanced Encryption' />

Данные в состоянии покоя по умолчанию шифруются с использованием управляемых облачным провайдером ключей AES 256. Клиенты могут включить прозрачное шифрование данных (TDE) для обеспечения дополнительного уровня защиты данных сервиса или предоставить собственный ключ для реализации управляемых клиентом ключей шифрования (CMEK) для своего сервиса.

Расширенное шифрование в настоящее время доступно в сервисах AWS и GCP. Поддержка Azure появится в ближайшее время.

### Прозрачное шифрование данных (TDE) {#transparent-data-encryption-tde}

TDE должно быть включено при создании сервиса. Существующие сервисы не могут быть зашифрованы после создания. После включения TDE его нельзя отключить. Все данные в сервисе останутся зашифрованными. Если вы хотите отключить TDE после его включения, необходимо создать новый сервис и перенести туда свои данные.

1. Выберите `Create new service`
2. Укажите имя сервиса
3. Выберите AWS или GCP в качестве облачного провайдера и нужный регион из выпадающего списка
4. Откройте выпадающий список функций Enterprise и включите опцию Enable Transparent Data Encryption (TDE)
5. Нажмите Create service

### Управляемые клиентом ключи шифрования (CMEK) {#customer-managed-encryption-keys-cmek}

:::warning
Удаление ключа KMS, используемого для шифрования сервиса ClickHouse Cloud, приведет к остановке вашего сервиса ClickHouse, и его данные станут недоступными для восстановления вместе с существующими резервными копиями. Чтобы предотвратить случайную потерю данных при ротации ключей, рекомендуется сохранять старые ключи KMS в течение некоторого времени перед их удалением.
:::

После того как сервис зашифрован с помощью TDE, клиенты могут обновить ключ для включения CMEK. Сервис автоматически перезапустится после обновления настройки TDE. В процессе этого старый ключ KMS расшифровывает ключ шифрования данных (DEK), а новый ключ KMS повторно шифрует DEK. Это гарантирует, что после перезапуска сервис будет использовать новый ключ KMS для операций шифрования. Этот процесс может занять несколько минут.

<details>
    <summary>Включение CMEK с AWS KMS</summary>
    
1. В ClickHouse Cloud выберите зашифрованный сервис
2. Нажмите на Settings слева
3. В нижней части экрана разверните раздел Network security information
4. Скопируйте Encryption role ID (AWS) или Encryption Service Account (GCP) — это понадобится на следующем шаге
5. [Создайте ключ KMS для AWS](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html)
6. Нажмите на ключ
7. Обновите политику ключа AWS следующим образом:
    
    ```json
    {
        "Sid": "Allow ClickHouse Access",
        "Effect": "Allow",
        "Principal": {
            "AWS": [ "Encryption role ID " ]
        },
        "Action": [
            "kms:Encrypt",
            "kms:Decrypt",
            "kms:ReEncrypt*",
            "kms:DescribeKey"
        ],
        "Resource": "*"
    }
    ```
    
10. Сохраните политику ключа
11. Скопируйте Key ARN
12. Вернитесь в ClickHouse Cloud и вставьте Key ARN в раздел Transparent Data Encryption в настройках сервиса
13. Сохраните изменения
    
</details>

<details>
    <summary>Включение CMEK с GCP KMS</summary>

1. В ClickHouse Cloud выберите зашифрованный сервис
2. Нажмите на Settings слева
3. В нижней части экрана разверните раздел Network security information
4. Скопируйте Encryption Service Account (GCP) — это понадобится на следующем шаге
5. [Создайте ключ KMS для GCP](https://cloud.google.com/kms/docs/create-key)
6. Нажмите на ключ
7. Предоставьте следующие разрешения для GCP Encryption Service Account, скопированного на шаге 4 выше.
   - Cloud KMS CryptoKey Encrypter/Decrypter
   - Cloud KMS Viewer
8. Сохраните разрешения ключа
9. Скопируйте Key Resource Path
10. Вернитесь в ClickHouse Cloud и вставьте Key Resource Path в раздел Transparent Data Encryption в настройках сервиса
11. Сохраните изменения

</details>

#### Ротация ключей {#key-rotation}

После настройки CMEK выполните ротацию ключа, следуя приведенным выше процедурам создания нового ключа KMS и предоставления разрешений. Вернитесь в настройки сервиса, чтобы вставить новый ARN (AWS) или Key Resource Path (GCP) и сохранить настройки. Сервис перезапустится для применения нового ключа.

#### Опрос ключей KMS {#kms-key-poller}


При использовании CMEK проверка действительности предоставленного ключа KMS выполняется каждые 10 минут. Если доступ к ключу KMS становится недействительным, сервис ClickHouse будет остановлен. Чтобы возобновить работу сервиса, восстановите доступ к ключу KMS, следуя инструкциям в данном руководстве, а затем перезапустите сервис.

### Резервное копирование и восстановление {#backup-and-restore}

Резервные копии шифруются с использованием того же ключа, что и связанный с ними сервис. При восстановлении зашифрованной резервной копии создается зашифрованный экземпляр, использующий тот же ключ KMS, что и исходный экземпляр. При необходимости можно выполнить ротацию ключа KMS после восстановления; подробнее см. в разделе [Ротация ключей](#key-rotation).


## Производительность {#performance}

Шифрование базы данных использует встроенную [функцию виртуальной файловой системы для шифрования данных](/operations/storing-data#encrypted-virtual-file-system) ClickHouse для шифрования и защиты данных. Используемый алгоритм — `AES_256_CTR`, который может снизить производительность на 5-15% в зависимости от рабочей нагрузки:

<Image img={cmek_performance} size='lg' alt='Влияние CMEK на производительность' />
