
import Image from '@theme/IdealImage';
import s3_1 from '@site/static/images/_snippets/s3/s3-1.png';
import s3_2 from '@site/static/images/_snippets/s3/s3-2.png';
import s3_3 from '@site/static/images/_snippets/s3/s3-3.png';
import s3_4 from '@site/static/images/_snippets/s3/s3-4.png';
import s3_5 from '@site/static/images/_snippets/s3/s3-5.png';
import s3_6 from '@site/static/images/_snippets/s3/s3-6.png';
import s3_7 from '@site/static/images/_snippets/s3/s3-7.png';
import s3_8 from '@site/static/images/_snippets/s3/s3-8.png';
import s3_9 from '@site/static/images/_snippets/s3/s3-9.png';
import s3_a from '@site/static/images/_snippets/s3/s3-a.png';
import s3_b from '@site/static/images/_snippets/s3/s3-b.png';
import s3_c from '@site/static/images/_snippets/s3/s3-c.png';
import s3_d from '@site/static/images/_snippets/s3/s3-d.png';
import s3_e from '@site/static/images/_snippets/s3/s3-e.png';
import s3_f from '@site/static/images/_snippets/s3/s3-f.png';
import s3_g from '@site/static/images/_snippets/s3/s3-g.png';
import s3_h from '@site/static/images/_snippets/s3/s3-h.png';

<details>
  <summary>Создание S3 бакетов и пользователя IAM</summary>

В этой статье описаны основы настройки учетной записи пользователя AWS IAM, создания S3 бакета и настройки ClickHouse для использования этого бакета в качестве S3 диска. Вы должны работать с вашей командой безопасности, чтобы определить права доступа, которые необходимо использовать, и рассматривать это как отправную точку.

### Создание пользователя AWS IAM {#create-an-aws-iam-user}
В этой процедуре мы создадим пользователя учетной записи сервиса, а не пользователя для входа.
1.  Войдите в консоль управления AWS IAM.

2. В разделе "Пользователи" выберите **Добавить пользователей**

<Image size="md" img={s3_1} alt="Консоль управления AWS IAM - Добавление нового пользователя" border force/>

3. Введите имя пользователя и выберите тип учетных данных **Ключ доступа - Программный доступ**, затем выберите **Далее: Права**

<Image size="md" img={s3_2} alt="Установка имени пользователя и типа доступа для пользователя IAM" border force/>

4. Не добавляйте пользователя в какую-либо группу; выберите **Далее: Теги**

<Image size="md" img={s3_3} alt="Пропуск назначения группы для пользователя IAM" border force/>

5. Если вам не нужно добавлять теги, выберите **Далее: Обзор**

<Image size="md" img={s3_4} alt="Пропуск назначения тегов для пользователя IAM" border force/>

6. Выберите **Создать пользователя**

    :::note
    Сообщение об ошибке, указывающее на то, что у пользователя нет прав, можно игнорировать; права будут предоставлены на бакете для пользователя в следующем разделе
    :::

<Image size="md" img={s3_5} alt="Создание пользователя IAM с предупреждением о праве" border force/>

7. Пользователь теперь создан; нажмите на **показать** и скопируйте ключи доступа и секретный ключ.
:::note
Сохраните ключи где-нибудь еще; это последний раз, когда секретный ключ доступа будет доступен.
:::

<Image size="md" img={s3_6} alt="Просмотр и копирование ключей доступа пользователя IAM" border force/>

8. Закройте окно, затем найдите пользователя на экране пользователей.

<Image size="md" img={s3_7} alt="Поиск вновь созданного пользователя IAM в списке пользователей" border force/>

9. Скопируйте ARN (имя ресурса Amazon) и сохраните его для использования при настройке политики доступа для бакета.

<Image size="md" img={s3_8} alt="Копирование ARN пользователя IAM" border force/>

### Создание S3 бакета {#create-an-s3-bucket}
1. В разделе бакетов S3 выберите **Создать бакет**

<Image size="md" img={s3_9} alt="Запуск процесса создания S3 бакета" border force/>

2. Введите имя бакета, оставив остальные параметры по умолчанию
:::note
Имя бакета должно быть уникальным в AWS, а не только в организации, в противном случае будет ошибка.
:::
3. Оставьте `Block all Public Access` включенным; доступ для публичных пользователей не нужен.

<Image size="md" img={s3_a} alt="Настройка параметров S3 бакета с заблокированным публичным доступом" border force/>

4. Внизу страницы выберите **Создать бакет**

<Image size="md" img={s3_b} alt="Завершение создания S3 бакета" border force/>

5. Выберите ссылку, скопируйте ARN и сохраните его для использования при настройке политики доступа для бакета.

6. После создания бакета найдите новый S3 бакет в списке бакетов S3 и выберите ссылку

<Image size="md" img={s3_c} alt="Поиск новосозданного S3 бакета в списке бакетов" border force/>

7. Выберите **Создать папку**

<Image size="md" img={s3_d} alt="Создание новой папки в S3 бакете" border force/>

8. Введите имя папки, которая будет целью для S3 диска ClickHouse, и выберите **Создать папку**

<Image size="md" img={s3_e} alt="Установка имени папки для использования S3 диском ClickHouse" border force/>

9. Папка теперь должна отображаться в списке бакетов

<Image size="md" img={s3_f} alt="Просмотр новосозданной папки в S3 бакете" border force/>

10. Выберите флажок новой папки и нажмите **Копировать URL** Сохраните скопированный URL для использования в конфигурации хранилища ClickHouse в следующем разделе.

<Image size="md" img={s3_g} alt="Копирование URL папки S3 для конфигурации ClickHouse" border force/>

11. Выберите вкладку **Права доступа** и нажмите кнопку **Редактировать** в разделе **Политика бакета**

<Image size="md" img={s3_h} alt="Доступ к настройке политики S3 бакета" border force/>

12. Добавьте политику бакета, пример ниже:
```json
{
  "Version" : "2012-10-17",
  "Id" : "Policy123456",
  "Statement" : [
    {
      "Sid" : "abc123",
      "Effect" : "Allow",
      "Principal" : {
        "AWS" : "arn:aws:iam::921234567898:user/mars-s3-user"
      },
      "Action" : "s3:*",
      "Resource" : [
        "arn:aws:s3:::mars-doc-test",
        "arn:aws:s3:::mars-doc-test/*"
      ]
    }
  ]
}
```

```response
|Параметр | Описание | Пример значения |
|----------|-------------|----------------|
|Version | Версия интерпретатора политики, оставьте как есть | 2012-10-17 |
|Sid | Идентификатор политики, определяемый пользователем | abc123 |
|Effect | Будут ли разрешены или отклонены запросы пользователя | Allow |
|Principal | Учетные записи или пользователи, которым будет предоставлен доступ | arn:aws:iam::921234567898:user/mars-s3-user |
|Action | Какие операции разрешены на бакете| s3:*|
|Resource | Какие ресурсы в бакете будут доступны для операций | "arn:aws:s3:::mars-doc-test", "arn:aws:s3:::mars-doc-test/*" |
```

:::note
Вы должны работать с вашей командой безопасности, чтобы определить права доступа, которые необходимо использовать, и рассматривать это как отправную точку.
Для получения дополнительной информации о политиках и настройках обратитесь к документации AWS:
https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html
:::

13. Сохраните конфигурацию политики.

</details>
```
