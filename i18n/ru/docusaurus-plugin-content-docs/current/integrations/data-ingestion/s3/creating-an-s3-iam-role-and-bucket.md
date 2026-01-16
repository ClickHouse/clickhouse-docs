---
title: 'Как создать пользователя AWS IAM и бакет S3'
description: 'Как создать пользователя AWS IAM и бакет S3.'
keywords: ['AWS', 'IAM', 'S3 bucket']
slug: /integrations/s3/creating-iam-user-and-s3-bucket
sidebar_label: 'Как создать пользователя AWS IAM и бакет S3'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import s3_1 from '@site/static/images/_snippets/s3/2025/s3-1.png';
import s3_2 from '@site/static/images/_snippets/s3/2025/s3-2.png';
import s3_3 from '@site/static/images/_snippets/s3/2025/s3-3.png';
import s3_4 from '@site/static/images/_snippets/s3/2025/s3-4.png';
import s3_5 from '@site/static/images/_snippets/s3/2025/s3-5.png';
import s3_6 from '@site/static/images/_snippets/s3/2025/s3-6.png';
import s3_7 from '@site/static/images/_snippets/s3/2025/s3-7.png';
import s3_8 from '@site/static/images/_snippets/s3/2025/s3-8.png';
import s3_9 from '@site/static/images/_snippets/s3/2025/s3-9.png';
import s3_10 from '@site/static/images/_snippets/s3/2025/s3-10.png';
import s3_11 from '@site/static/images/_snippets/s3/2025/s3-11.png';
import s3_12 from '@site/static/images/_snippets/s3/2025/s3-12.png';
import s3_13 from '@site/static/images/_snippets/s3/2025/s3-13.png';
import s3_14 from '@site/static/images/_snippets/s3/2025/s3-14.png';
import s3_15 from '@site/static/images/_snippets/s3/2025/s3-15.png';
import s3_16 from '@site/static/images/_snippets/s3/2025/s3-16.png';
import s3_17 from '@site/static/images/_snippets/s3/2025/s3-17.png';
import s3_18 from '@site/static/images/_snippets/s3/2025/s3-18.png';
import s3_19 from '@site/static/images/_snippets/s3/2025/s3-19.png';
import s3_20 from '@site/static/images/_snippets/s3/2025/s3-20.png';

> В этом руководстве показано, как создать пользователя IAM и бакет S3 в AWS —
> это необходимый предварительный шаг для резервного копирования в S3 или настройки ClickHouse
> для хранения данных в S3


## Создание пользователя AWS IAM \{#create-an-aws-iam-user\}

В этой процедуре мы создадим служебную учетную запись (service account), а не пользователя для интерактивного входа.

1.  Войдите в консоль управления AWS IAM (AWS IAM Management Console).

2. На вкладке `Users` выберите `Create user`.

<Image size="lg" img={s3_1} alt="AWS IAM Management Console - Добавление нового пользователя"/>

3. Введите имя пользователя.

<Image size="lg" img={s3_2} alt="AWS IAM Management Console - Добавление нового пользователя" />

4. Выберите `Next`.

<Image size="lg" img={s3_3} alt="AWS IAM Management Console - Добавление нового пользователя" />

5. Выберите `Next`.

<Image size="lg" img={s3_4} alt="AWS IAM Management Console - Добавление нового пользователя" />

6. Выберите `Create user`.

Пользователь создан.
Нажмите на вновь созданного пользователя.

<Image size="lg" img={s3_5} alt="AWS IAM Management Console - Добавление нового пользователя" />

7. Выберите `Create access key`.

<Image size="lg" img={s3_6} alt="AWS IAM Management Console - Добавление нового пользователя" />

8. Выберите `Application running outside AWS`.

<Image size="lg" img={s3_7} alt="AWS IAM Management Console - Добавление нового пользователя" />

9. Выберите `Create access key`.

<Image size="lg" img={s3_8} alt="AWS IAM Management Console - Добавление нового пользователя" />

10. Загрузите свой access key и secret в виде файла .csv для последующего использования.

<Image size="lg" img={s3_9} alt="AWS IAM Management Console - Добавление нового пользователя" />

## Создание бакета S3 \{#create-an-s3-bucket\}

1. В разделе бакетов S3 выберите **Create bucket**

<Image size="lg" img={s3_10} alt="AWS IAM Management Console - Adding a new user" />

2. Введите имя бакета, остальные параметры оставьте по умолчанию

<Image size="lg" img={s3_11} alt="AWS IAM Management Console - Adding a new user" />

:::note
Имя бакета должно быть уникальным во всём AWS, а не только внутри вашей организации, иначе будет выдана ошибка.
:::

3. Оставьте параметр `Block all Public Access` включённым; публичный доступ не требуется.

<Image size="lg" img={s3_12} alt="AWS IAM Management Console - Adding a new user" />

4. Внизу страницы выберите **Create Bucket**

<Image size="lg" img={s3_13} alt="AWS IAM Management Console - Adding a new user" />

5. Перейдите по ссылке, скопируйте ARN и сохраните его для использования при настройке политики доступа для бакета

<Image size="lg" img={s3_14} alt="AWS IAM Management Console - Adding a new user" />

6. После создания бакета найдите новый бакет S3 в списке S3 buckets и выберите его имя, чтобы перейти на страницу, показанную ниже:

<Image size="lg" img={s3_15} alt="AWS IAM Management Console - Adding a new user" />

7. Выберите `Create folder`

8. Введите имя папки, которая будет целевым расположением для S3-диска ClickHouse или резервных копий, и выберите `Create folder` внизу страницы

<Image size="lg" img={s3_16} alt="AWS IAM Management Console - Adding a new user" />

9. Папка теперь должна отображаться в списке объектов бакета

<Image size="lg" img={s3_17} alt="AWS IAM Management Console - Adding a new user" />

10. Установите флажок для новой папки и нажмите `Copy URL`. Сохраните URL для использования в конфигурации хранилища ClickHouse в следующем разделе.

<Image size="lg" img={s3_18} alt="AWS IAM Management Console - Adding a new user" />

11. Перейдите на вкладку **Permissions** и нажмите кнопку **Edit** в разделе **Bucket Policy**

<Image size="lg" img={s3_19} alt="AWS IAM Management Console - Adding a new user" />

12. Добавьте политику для бакета, пример приведён ниже

```json
{
    "Version": "2012-10-17",
    "Id": "Policy123456",
    "Statement": [
        {
            "Sid": "abc123",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::782985192762:user/docs-s3-user"
            },
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::ch-docs-s3-bucket",
                "arn:aws:s3:::ch-docs-s3-bucket/*"
            ]
        }
    ]
}
```

:::note
Приведённая выше политика позволяет выполнять любые операции с бакетом.
:::

| Параметр  | Описание                                                       | Пример значения                                                                          |
| --------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Version   | Версия интерпретатора политики, оставьте как есть              | 2012-10-17                                                                               |
| Sid       | Определяемый пользователем идентификатор политики              | abc123                                                                                   |
| Effect    | Разрешаются или запрещаются запросы пользователя               | Allow                                                                                    |
| Principal | Учетные записи или пользователи, которым будет разрешён доступ | arn:aws:iam::782985192762:user/docs-s3-user                                              |
| Action    | Какие операции разрешены для бакета                            | s3:*                                                                                     |
| Resource  | К каким ресурсам в бакете будут разрешены операции             | &quot;arn:aws:s3:::ch-docs-s3-bucket&quot;, &quot;arn:aws:s3:::ch-docs-s3-bucket/*&quot; |

:::note
Совместно с вашей командой по безопасности определите, какие разрешения использовать; рассматривайте приведённые выше как отправную точку.
Для получения дополнительной информации о политиках и настройках см. документацию AWS:
https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
:::

13. Сохраните конфигурацию политики
