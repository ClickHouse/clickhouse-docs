---
title: 'Загрузка файла CSV'
slug: /integrations/migration/upload-a-csv-file
description: 'Узнать о загрузке файла CSV'
---

import Image from '@theme/IdealImage';
import uploadcsv1 from '@site/static/images/integrations/migration/uploadcsv1.png';
import uploadcsv2 from '@site/static/images/integrations/migration/uploadcsv2.png';
import uploadcsv3 from '@site/static/images/integrations/migration/uploadcsv3.png';
import uploadcsv4 from '@site/static/images/integrations/migration/uploadcsv4.png';
import uploadcsv5 from '@site/static/images/integrations/migration/uploadcsv5.png';


# Загрузка файла CSV

Вы можете загрузить файл CSV или TSV, который содержит строку заголовка с именами столбцов, и ClickHouse 
предварительно обработает партию строк, чтобы определить типы данных столбцов, затем вставит строки в новую таблицу.

1. Начните с перехода на страницу **Details** вашего сервиса ClickHouse Cloud:

<Image img={uploadcsv1} size='md' alt='Страница деталей' />

2. Выберите **Load data** из выпадающего меню **Actions**:

<Image img={uploadcsv2} size='sm' alt='Добавить данные'/>

3. Нажмите кнопку **File upload** на странице **Datasources** и выберите файл, который вы хотите загрузить, в диалоговом окне, которое появится. Нажмите **Open**, чтобы продолжить (пример ниже на macOS, другие операционные системы могут отличаться).

<Image img={uploadcsv3} size='md' alt='Выберите файл для загрузки' />

4. ClickHouse покажет вам типы данных, которые были определены.

<Image img={uploadcsv4} size='md' alt='Определенные типы данных' />

5. ***Введите новое имя таблицы***, в которую вы хотите вставить данные, затем нажмите кнопку **Import to ClickHouse**.

<Image img={uploadcsv5} size='md' alt='Выберите файл для загрузки'/>

6. Подключитесь к вашему сервису ClickHouse, убедитесь, что таблица была успешно создана, и ваши данные готовы к использованию! Если вы хотите визуализировать ваши данные, ознакомьтесь с некоторыми из [BI инструментов](../data-visualization/index.md), которые могут легко подключаться к ClickHouse.
