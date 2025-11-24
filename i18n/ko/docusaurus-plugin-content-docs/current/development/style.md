---
'description': 'ClickHouse C++ 개발을 위한 코딩 스타일 지침'
'sidebar_label': 'C++ 스타일 가이드'
'sidebar_position': 70
'slug': '/development/style'
'title': 'C++ 스타일 가이드'
'doc_type': 'guide'
---


# C++ 스타일 가이드

## 일반 권장 사항 {#general-recommendations}

다음은 권장 사항이며, 필수 사항이 아닙니다.  
코드를 수정하는 경우 기존 코드의 형식을 따르는 것이 좋습니다.  
코드 스타일은 일관성을 위해 필요합니다. 일관성은 코드를 읽기 쉽게 만들고, 코드를 검색하기도 쉽게 만듭니다.  
많은 규칙들은 논리적인 이유가 없으며, 확립된 관행에 의해 결정됩니다.

## 포맷팅 {#formatting}

**1.** 대부분의 포맷팅은 자동으로 `clang-format`에 의해 수행됩니다.

**2.** 인덴트는 4칸입니다. 개발 환경을 설정하여 탭이 4칸을 추가하도록 구성하십시오.

**3.** 여는 중괄호와 닫는 중괄호는 별도의 줄에 위치해야 합니다.

```cpp
inline void readBoolText(bool & x, ReadBuffer & buf)
{
    char tmp = '0';
    readChar(tmp, buf);
    x = tmp != '0';
}
```

**4.** 전체 함수 본체가 단일 `statement`일 경우, 단일 줄에 배치할 수 있습니다. 중괄호 주위에 공백을 두십시오 (줄 끝의 공백 외에는).

```cpp
inline size_t mask() const                { return buf_size() - 1; }
inline size_t place(HashValue x) const    { return x & mask(); }
```

**5.** 함수의 경우, 괄호 주위에 공백을 두지 마십시오.

```cpp
void reinsert(const Value & x)
```

```cpp
memcpy(&buf[place_value], &x, sizeof(x));
```

**6.** `if`, `for`, `while` 및 기타 표현식에서는 여는 괄호 앞에 공백을 삽입합니다 (함수 호출과는 반대).

```cpp
for (size_t i = 0; i < rows; i += storage.index_granularity)
```

**7.** 이항 연산자(`+`, `-`, `*`, `/`, `%`, ...)와 삼항 연산자 `?:` 주위에 공백을 추가하십시오.

```cpp
UInt16 year = (s[0] - '0') * 1000 + (s[1] - '0') * 100 + (s[2] - '0') * 10 + (s[3] - '0');
UInt8 month = (s[5] - '0') * 10 + (s[6] - '0');
UInt8 day = (s[8] - '0') * 10 + (s[9] - '0');
```

**8.** 줄 바꿈이 입력될 경우, 연산자를 새로운 줄에 놓고 그 앞의 인덴트를 늘리십시오.

```cpp
if (elapsed_ns)
    message << " ("
        << rows_read_on_server * 1000000000 / elapsed_ns << " rows/s., "
        << bytes_read_on_server * 1000.0 / elapsed_ns << " MB/s.) ";
```

**9.** 필요하다면, 한 줄 내에서 정렬을 위해 공백을 사용할 수 있습니다.

```cpp
dst.ClickLogID         = click.LogID;
dst.ClickEventID       = click.EventID;
dst.ClickGoodEvent     = click.GoodEvent;
```

**10.** 연산자 `.`, `->` 주위에는 공백을 사용하지 마십시오. 필요할 경우, 연산자를 다음 줄로 감쌀 수 있습니다. 이 경우, 그 앞의 오프셋이 증가합니다.

**11.** 단항 연산자(`--`, `++`, `*`, `&`, ...)와 인자 사이에 공백을 사용하지 마십시오.

**12.** 쉼표 뒤에 공백을 넣되, 앞에는 넣지 마십시오. 같은 규칙은 `for` 표현식 내의 세미콜론에도 적용됩니다.

**13.** `[]` 연산자를 구분하기 위해 공백을 사용하지 마십시오.

**14.** `template <...>` 표현식에서 `template`과 `<` 사이에 공백을 사용하고, `<` 뒤나 `>` 앞에는 공백을 사용하지 마십시오.

```cpp
template <typename TKey, typename TValue>
struct AggregatedStatElement
{}
```

**15.** 클래스와 구조체에서는 `public`, `private`, `protected`를 `class/struct`와 같은 수준에 작성하고 나머지 코드는 들여쓰기 하십시오.

```cpp
template <typename T>
class MultiVersion
{
public:
    /// Version of object for usage. shared_ptr manage lifetime of version.
    using Version = std::shared_ptr<const T>;
    ...
}
```

**16.** 파일 전체에서 동일한 `namespace`를 사용하는 경우, `namespace` 내부에서 오프셋이 필요하지 않습니다.

**17.** `if`, `for`, `while` 또는 기타 표현식의 블록이 단일 `statement`로 구성된 경우 중괄호는 선택 사항입니다. 대신 `statement`를 별도의 줄에 위치시키십시오. 이 규칙은 중첩된 `if`, `for`, `while`에도 유효합니다.  
하지만 내부 `statement`가 중괄호나 `else`를 포함하는 경우, 외부 블록은 중괄호로 작성해야 합니다.

```cpp
/// Finish write.
for (auto & stream : streams)
    stream.second->finalize();
```

**18.** 줄 끝에 공백이 없어야 합니다.

**19.** 소스 파일은 UTF-8로 인코딩됩니다.

**20.** 비 ASCII 문자는 문자열 리터럴에 사용할 수 있습니다.

```cpp
<< ", " << (timer.elapsed() / chunks_stats.hits) << " μsec/hit.";
```

**21.** 여러 표현식을 한 줄에 작성하지 마십시오.

**22.** 함수 내부의 코드 섹션을 그룹화하고 한 개의 빈 줄 이하로 구분하십시오.

**23.** 함수, 클래스 등을 하나 또는 두 개의 빈 줄로 구분하십시오.

**24.** `A const` (값과 관련된)는 타입 이름 앞에 작성해야 합니다.

```cpp
//correct
const char * pos
const std::string & s
//incorrect
char const * pos
```

**25.** 포인터나 참조를 선언할 때, `*` 및 `&` 기호는 양쪽에 공백을 두어야 합니다.

```cpp
//correct
const char * pos
//incorrect
const char* pos
const char *pos
```

**26.** 템플릿 타입을 사용할 경우, 가장 간단한 경우를 제외하고는 `using` 키워드를 사용하여 별칭화하십시오.  
즉, 템플릿 매개변수는 `using`에서만 지정되고 코드는 반복되지 않아야 합니다.  
`using`은 함수 내부와 같이 로컬로 선언할 수 있습니다.

```cpp
//correct
using FileStreams = std::map<std::string, std::shared_ptr<Stream>>;
FileStreams streams;
//incorrect
std::map<std::string, std::shared_ptr<Stream>> streams;
```

**27.** 서로 다른 타입의 여러 변수를 한 문에서 선언하지 마십시오.

```cpp
//incorrect
int x, *y;
```

**28.** C 스타일 캐스트를 사용하지 마십시오.

```cpp
//incorrect
std::cerr << (int)c <<; std::endl;
//correct
std::cerr << static_cast<int>(c) << std::endl;
```

**29.** 클래스와 구조체 내에서는 각 가시성 범위 내에서 멤버와 함수를 별도로 그룹화하십시오.

**30.** 작은 클래스와 구조체의 경우, 메소드 선언과 구현을 구분할 필요가 없습니다.  
모든 클래스나 구조체의 작은 메소드에서도 마찬가지입니다.  
템플릿 클래스와 구조체의 경우, 메소드 선언과 구현을 구분하지 마십시오 (그렇지 않으면 동일한 번역 단위에서 정의되어야 합니다).

**31.** 140자로 줄을 감싸는 것을 허용하며, 80자는 사용하지 마십시오.

**32.** 필요하지 않은 경우 포스트픽스 증감 연산자 대신 프리픽스 증감 연산자를 항상 사용하십시오.

```cpp
for (Names::const_iterator it = column_names.begin(); it != column_names.end(); ++it)
```

## 주석 {#comments}

**1.** 비틀거리는 부분의 코드에는 반드시 주석을 추가하십시오.  
이는 매우 중요합니다. 주석을 작성하는 것은 코드가 필요 없거나 잘못 설계되었음을 깨닫는 데 도움을 줄 수 있습니다.

```cpp
/** Part of piece of memory, that can be used.
  * For example, if internal_buffer is 1MB, and there was only 10 bytes loaded to buffer from file for reading,
  * then working_buffer will have size of only 10 bytes
  * (working_buffer.end() will point to position right after those 10 bytes available for read).
  */
```

**2.** 주석은 필요에 따라 상세하게 작성할 수 있습니다.

**3.** 설명하는 코드 앞에 주석을 배치하십시오. 드물게 주석이 코드 뒤에, 같은 줄에 올 수 있습니다.

```cpp
/** Parses and executes the query.
*/
void executeQuery(
    ReadBuffer & istr, /// Where to read the query from (and data for INSERT, if applicable)
    WriteBuffer & ostr, /// Where to write the result
    Context & context, /// DB, tables, data types, engines, functions, aggregate functions...
    BlockInputStreamPtr & query_plan, /// Here could be written the description on how query was executed
    QueryProcessingStage::Enum stage = QueryProcessingStage::Complete /// Up to which stage process the SELECT query
    )
```

**4.** 주석은 영어로만 작성해야 합니다.

**5.** 라이브러리를 작성하는 경우, 메인 헤더 파일에 이를 설명하는 자세한 주석을 포함하십시오.

**6.** 추가 정보를 제공하지 않는 주석은 추가하지 마십시오. 특히, 다음과 같은 빈 주석을 남기지 마십시오:

```cpp
/*
* Procedure Name:
* Original procedure name:
* Author:
* Date of creation:
* Dates of modification:
* Modification authors:
* Original file name:
* Purpose:
* Intent:
* Designation:
* Classes used:
* Constants:
* Local variables:
* Parameters:
* Date of creation:
* Purpose:
*/
```

예시는 리소스 http://home.tamk.fi/~jaalto/course/coding-style/doc/unmaintainable-code/에서 가져왔습니다.

**7.** 각 파일의 시작 부분에 저자, 생성일 등을 나타내는 쓰레기 주석을 작성하지 마십시오.

**8.** 단일 줄 주석은 세 개의 슬래시 `///`로 시작하고, 다중 줄 주석은 `/**`로 시작합니다. 이러한 주석은 "문서화"로 간주됩니다.  
노트: Doxygen을 사용하여 이러한 주석에서 문서를 생성할 수 있습니다. 그러나 Doxygen은 IDE에서 코드를 탐색하는 것이 더 편리하기 때문에 일반적으로 사용되지 않습니다.

**9.** 다중 줄 주석은 시작과 끝에 빈 줄이 없어야 합니다 (다중 줄 주석을 닫는 줄은 제외).

**10.** 코드 주석을 위해서는 기본 주석을 사용하고 "문서화" 주석을 사용하지 마십시오.

**11.** 커밋하기 전에 주석 처리된 코드 부분을 삭제하십시오.

**12.** 주석이나 코드에 절대 욕설을 사용하지 마십시오.

**13.** 대문자를 사용하지 마십시오. 과도한 구두점을 사용하지 마십시오.

```cpp
/// WHAT THE FAIL???
```

**14.** 구분자를 만들기 위해 주석을 사용하지 마십시오.

```cpp
///******************************************************
```

**15.** 주석에서 논의를 시작하지 마십시오.

```cpp
/// Why did you do this stuff?
```

**16.** 블록 끝에 그것에 대해 설명하는 주석을 쓸 필요는 없습니다.

```cpp
/// for
```

## 이름 {#names}

**1.** 변수 및 클래스 멤버의 이름은 소문자와 언더스코어를 사용하십시오.

```cpp
size_t max_block_size;
```

**2.** 함수(메소드)의 이름은 소문자로 시작하는 카멜 케이스를 사용하십시오.

```cpp
std::string getName() const override { return "Memory"; }
```

**3.** 클래스(구조체)의 이름은 대문자로 시작하는 카멜 케이스를 사용하십시오. 인터페이스에는 I 외의 접두사를 사용하지 않습니다.

```cpp
class StorageMemory : public IStorage
```

**4.** `using` 이름은 클래스와 같은 방식으로 명명됩니다.

**5.** 템플릿 타입 인수의 이름: 간단한 경우에는 `T`를 사용하고; `T`, `U`; `T1`, `T2`를 사용합니다.  
보다 복잡한 경우에는 클래스 이름 규칙을 따르거나 `T` 접두사를 추가하십시오.

```cpp
template <typename TKey, typename TValue>
struct AggregatedStatElement
```

**6.** 템플릿 상수 인수의 이름: 변수 이름 규칙을 따르거나 간단한 경우에는 `N`을 사용하십시오.

```cpp
template <bool without_www>
struct ExtractDomain
```

**7.** 추상 클래스(인터페이스)의 경우, `I` 접두사를 추가할 수 있습니다.

```cpp
class IProcessor
```

**8.** 변수를 로컬로 사용할 경우, 짧은 이름을 사용할 수 있습니다.  
모든 다른 경우에는 의미를 설명하는 이름을 사용하십시오.

```cpp
bool info_successfully_loaded = false;
```

**9.** `define` 및 전역 상수의 이름은 언더스코어가 있는 ALL_CAPS를 사용합니다.

```cpp
#define MAX_SRC_TABLE_NAMES_TO_STORE 1000
```

**10.** 파일 이름은 그 내용과 동일한 스타일을 사용해야 합니다.  
파일이 단일 클래스를 포함하는 경우, 파일 이름은 클래스와 동일하게 (CamelCase) 지정합니다.  
파일이 단일 함수를 포함하는 경우, 파일 이름은 함수와 동일하게 (camelCase) 지정합니다.

**11.** 이름에 약어가 포함된 경우:

- 변수 이름의 경우, 약어는 소문자를 사용해야 합니다 `mysql_connection` (아닌 `mySQL_connection`).
- 클래스와 함수의 이름의 경우, 약어의 대문자는 유지해야 합니다 `MySQLConnection` (아닌 `MySqlConnection`).

**12.** 클래스 멤버를 초기화하는 데만 사용되는 생성자 인수는 클래스 멤버와 동일한 방식으로 명명하되, 끝에 언더스코어를 추가하십시오.

```cpp
FileQueueProcessor(
    const std::string & path_,
    const std::string & prefix_,
    std::shared_ptr<FileHandler> handler_)
    : path(path_),
    prefix(prefix_),
    handler(handler_),
    log(&Logger::get("FileQueueProcessor"))
{
}
```

인수가 생성자 본체에서 사용되지 않는 경우 언더스코어 접미사는 생략할 수 있습니다.

**13.** 로컬 변수와 클래스 멤버의 이름은 차이가 없습니다 (접두사가 필요하지 않습니다).

```cpp
timer (not m_timer)
```

**14.** `enum`의 상수는 대문자로 시작하는 카멜 케이스를 사용합니다. ALL_CAPS도 허용됩니다. `enum`이 비-로컬인 경우, `enum class`를 사용하십시오.

```cpp
enum class CompressionMethod
{
    QuickLZ = 0,
    LZ4     = 1,
};
```

**15.** 모든 이름은 영어로 작성해야 합니다. 히브리어 단어의 음역은 허용되지 않습니다.

    not T_PAAMAYIM_NEKUDOTAYIM

**16.** 약어는 잘 알려진 경우에만 허용됩니다 (약어의 의미를 위키피디아나 검색 엔진에서 쉽게 찾을 수 있는 경우).

    `AST`, `SQL`.

    허용되지 않는 경우 `NVDH` (임의의 문자들)

불완전한 단어는 일반적으로 사용되는 축약형이 허용됩니다.  
주석에 전체 이름이 함께 포함되어 있으면 약어를 사용해도 됩니다.

**17.** C++ 소스 코드를 포함하는 파일은 `.cpp` 확장자를 가져야 합니다. 헤더 파일은 `.h` 확장자를 가져야 합니다.

## 코드를 쓰는 방법 {#how-to-write-code}

**1.** 메모리 관리.

수동 메모리 해제(`delete`)는 라이브러리 코드에서만 사용될 수 있습니다.  
라이브러리 코드에서 `delete` 연산자는 소멸자에서만 사용될 수 있습니다.  
응용 프로그램 코드에서는 메모리를 소유하는 객체에 의해 해제되어야 합니다.  
예:

- 가장 쉬운 방법은 객체를 스택에 배치하거나 다른 클래스의 멤버로 만드는 것입니다.
- 많은 수의 작은 객체에 대해서는 컨테이너를 사용하십시오.
- 힙에 있는 소수의 객체에 대한 자동 해제를 위해서는 `shared_ptr/unique_ptr`를 사용하십시오.

**2.** 자원 관리.

`RAII`를 사용하고 위를 참조하십시오.

**3.** 오류 처리.

예외를 사용하십시오. 대부분의 경우, 예외를 발생시키기만 하면 되며, 이를 포착할 필요는 없습니다 (이 때문에 `RAII` 때문입니다).  
오프라인 데이터 처리 애플리케이션에서는 종종 예외를 포착하지 않는 것이 허용됩니다.  
사용자 요청을 처리하는 서버에서는 일반적으로 연결 처리기의 상위 수준에서 예외를 포착하는 것으로 충분합니다.  
스레드 함수에서는 모든 예외를 포착하고 이를 메인 스레드에서 `join` 후 다시 발생시켜야 합니다.

```cpp
/// If there weren't any calculations yet, calculate the first block synchronously
if (!started)
{
    calculate();
    started = true;
}
else /// If calculations are already in progress, wait for the result
    pool.wait();

if (exception)
    exception->rethrow();
```

예외를 처리하지 않고 숨기지 마십시오. 예외를 로그에 단순히 기록하지 마십시오.

```cpp
//Not correct
catch (...) {}
```

일부 예외를 무시해야 하는 경우 특정 예외에 대해서만 무시하고 나머지는 다시 발생시켜야 합니다.

```cpp
catch (const DB::Exception & e)
{
    if (e.code() == ErrorCodes::UNKNOWN_AGGREGATE_FUNCTION)
        return nullptr;
    else
        throw;
}
```

응답 코드나 `errno`가 있는 함수를 사용할 때 결과를 항상 확인하고 오류가 발생할 경우 예외를 발생시키십시오.

```cpp
if (0 != close(fd))
    throw ErrnoException(ErrorCodes::CANNOT_CLOSE_FILE, "Cannot close file {}", file_name);
```

코드에서 불변성을 확인하기 위해 assert를 사용할 수 있습니다.

**4.** 예외 유형.

응용 프로그램 코드에서 복잡한 예외 계층 구조를 사용할 필요는 없습니다. 예외 텍스트는 시스템 관리자에게 이해할 수 있어야 합니다.

**5.** 소멸자에서 예외 발생.

이것은 권장되지 않지만 허용됩니다.  
다음 옵션을 사용하십시오:

- 예외를 발생시킬 수 있는 모든 작업을 미리 수행하는 함수(`done()` 또는 `finalize()`)를 작성하십시오. 그 함수가 호출되었다면, 소멸자에서는 예외가 발생해서는 안 됩니다.
- 너무 복잡한 작업(예: 네트워크를 통한 메시지 전송)은 클래스 사용자가 파괴되기 전에 호출해야 할 별도의 메소드에 넣을 수 있습니다.
- 소멸자에서 예외가 발생하면 숨기기보다는 로그로 남기는 것이 낫습니다 (로거가 가능할 경우).
- 단순한 애플리케이션에서는 예외를 처리하기 위해 `std::terminate`에 의존하는 것이 허용됩니다 (C++11에서 기본적으로 `noexcept`인 경우에 대한 처리).

**6.** 익명 코드 블록.

특정 변수를 지역으로 만들기 위해 단일 함수 내에 별도의 코드 블록을 생성하여 블록을 벗어나면 소멸자가 호출되도록 할 수 있습니다.

```cpp
Block block = data.in->read();

{
    std::lock_guard<std::mutex> lock(mutex);
    data.ready = true;
    data.block = block;
}

ready_any.set();
```

**7.** 멀티스레딩.

오프라인 데이터 처리 프로그램에서:

- 단일 CPU 코어에서 가능한 최고의 성능을 얻으려고 하십시오. 그렇게 한 후 필요할 경우 코드를 병렬화할 수 있습니다.

서버 애플리케이션에서:

- 요청을 처리하기 위해 스레드 풀을 사용하십시오. 현재까지 사용자 공간 컨텍스트 전환이 필요한 작업은 없었습니다.

병렬화에 fork를 사용하지 않습니다.

**8.** 스레드 동기화.

서로 다른 스레드가 서로 다른 메모리 셀 (더 나은 경우는 서로 다른 캐시 라인)을 사용하는 것이 가능하고 아무런 스레드 동기화를 사용하지 않을 수 있습니다 (단 `joinAll` 제외).  
동기화가 필요한 경우, 대부분의 경우 `lock_guard` 아래에서 뮤텍스를 사용하는 것으로 충분합니다.  
다른 경우에는 시스템 동기화 원시 자료를 사용하십시오. 바쁜 대기(wait)를 사용하지 마십시오.  
원자 작업은 가장 단순한 경우에만 사용해야 합니다.  
자신의 주요 전문 분야가 아닌 경우에는 락 프리 데이터 구조를 구현하려고 하지 마십시오.

**9.** 포인터 대 참조.

대부분의 경우에는 참조를 선호하십시오.

**10.** `const`.

상수 참조, 상수 포인터, `const_iterator`, 그리고 `const` 메서드를 사용하십시오.  
`const`를 기본으로 고려하고, 필요한 경우에만 비-`const`를 사용하십시오.  
변수를 값으로 전달할 때, `const`를 사용하는 것은 일반적으로 의미가 없습니다.

**11.** unsigned.

필요하면 `unsigned`를 사용하십시오.

**12.** 숫자 유형.

타입 `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Int8`, `Int16`, `Int32`, `Int64` 및 `size_t`, `ssize_t`, `ptrdiff_t`를 사용하십시오.  
다음 숫자용 타입은 사용하지 마십시오: `signed/unsigned long`, `long long`, `short`, `signed/unsigned char`, `char`.

**13.** 인수 전달.

복잡한 값을 이동할 것이면 값을 기준으로 전달하고, 값 업데이트를 원할 경우 참조로 전달하십시오.  
힙에서 생성된 개체의 소유권을 함수가 캡처하는 경우, 인수 타입을 `shared_ptr` 또는 `unique_ptr`으로 만드십시오.

**14.** 반환 값.

대부분의 경우, 단순히 `return`을 사용하십시오. `return std::move(res)`를 작성하지 마십시오.  
함수가 힙에 개체를 할당하고 그것을 반환할 경우 `shared_ptr` 또는 `unique_ptr`을 사용하십시오.  
드물게 (루프에서 값을 업데이트하는 경우) 인수를 통해 값을 반환해야 할 경우, 인수는 참조이어야 합니다.

```cpp
using AggregateFunctionPtr = std::shared_ptr<IAggregateFunction>;

/** Allows creating an aggregate function by its name.
  */
class AggregateFunctionFactory
{
public:
    AggregateFunctionFactory();
    AggregateFunctionPtr get(const String & name, const DataTypes & argument_types) const;
```

**15.** `namespace`.

응용 프로그램 코드에 대해 별도의 `namespace`를 사용할 필요는 없습니다.  
작은 라이브러리도 필요하지 않습니다.  
중간에서 큰 라이브러리의 경우, 모든 것을 `namespace`에 넣으십시오.  
라이브러리의 `.h` 파일에서는 애플리케이션 코드에 필요하지 않은 구현 세부사항을 숨기기 위해 `namespace detail`를 사용할 수 있습니다.  
`.cpp` 파일에서는 기호를 숨기기 위해 `static` 또는 익명 `namespace`를 사용할 수 있습니다.  
또한 `namespace`는 관련 이름들이 외부 `namespace`로 떨어지는 것을 방지하기 위해 `enum`에 사용할 수 있습니다 (그러나 `enum class`를 사용하는 것이 좋습니다).

**16.** 지연 초기화.

초기화에 필요한 인수가 있을 경우, 기본 생성자는 작성하지 않는 것이 일반적입니다.  
나중에 초기화를 지연해야 한다면, 잘못된 개체를 생성할 기본 생성자를 추가할 수 있습니다. 또는 소수의 개체의 경우 `shared_ptr/unique_ptr`를 사용할 수 있습니다.

```cpp
Loader(DB::Connection * connection_, const std::string & query, size_t max_block_size_);

/// For deferred initialization
Loader() {}
```

**17.** 가상 함수.

클래스가 다형식 사용을 목적으로 하지 않는 경우, 함수를 가상으로 만들 필요는 없습니다. 이는 소멸자에도 적용됩니다.

**18.** 인코딩.

어디에서나 UTF-8을 사용하십시오. `std::string` 및 `char *`를 사용하십시오.  
`std::wstring` 및 `wchar_t`는 사용하지 마십시오.

**19.** 로깅.

코드 전반에 걸쳐 예제를 참조하십시오.  
커밋하기 전, 모든 의미 없는 디버그 로깅 및 기타 유형의 디버그 출력을 삭제하십시오.  
주기 내의 로깅은 피해야 하며, 트레이스 수준에서도 마찬가지입니다.  
로그는 어떤 로깅 수준에서도 읽을 수 있어야 합니다.  
로깅은 주로 응용 프로그램 코드에서만 사용되어야 합니다.  
로그 메시지는 영어로 작성되어야 합니다.  
로그는 시스템 관리자가 이해할 수 있도록 작성되어야 합니다.  
로그에서 욕설을 사용하지 마십시오.  
로그에서 UTF-8 인코딩을 사용하십시오. 드물게 로그에서 비 ASCII 문자를 사용할 수 있습니다.

**20.** 입력-출력.

응용 프로그램 성능에 중요할 내부 루프에서 `iostreams`를 사용하지 마십시오 (그리고 `stringstream`은 결코 사용하지 마십시오).  
대신 `DB/IO` 라이브러리를 사용하십시오.

**21.** 날짜와 시간.

`DateLUT` 라이브러리를 참조하십시오.

**22.** include.

항상 include 가드 대신 `#pragma once`를 사용하십시오.

**23.** using.

`using namespace`는 사용하지 않습니다. 특정한 것에 대해 `using`을 사용할 수 있지만, 클래스나 함수 내에서 로컬로 유지하십시오.

**24.** 필요하지 않은 경우 함수에 대해 `trailing return type`을 사용하지 마십시오.

```cpp
auto f() -> void
```

**25.** 변수의 선언 및 초기화.

```cpp
//right way
std::string s = "Hello";
std::string s{"Hello"};

//wrong way
auto s = std::string{"Hello"};
```

**26.** 가상 함수의 경우, 기본 클래스에서는 `virtual`이라고 쓰고, 후속 클래스에서는 `virtual` 대신 `override`를 작성하십시오.

## 사용하지 않는 C++ 기능 {#unused-features-of-c}

**1.** 가상 상속은 사용되지 않습니다.

**2.** 현대 C++에서 편리한 문법 설탕을 가진 구성 요소들, 예를 들어,

```cpp
// Traditional way without syntactic sugar
template <typename G, typename = std::enable_if_t<std::is_same<G, F>::value, void>> // SFINAE via std::enable_if, usage of ::value
std::pair<int, int> func(const E<G> & e) // explicitly specified return type
{
    if (elements.count(e)) // .count() membership test
    {
        // ...
    }

    elements.erase(
        std::remove_if(
            elements.begin(), elements.end(),
            [&](const auto x){
                return x == 1;
            }),
        elements.end()); // remove-erase idiom

    return std::make_pair(1, 2); // create pair via make_pair()
}

// With syntactic sugar (C++14/17/20)
template <typename G>
requires std::same_v<G, F> // SFINAE via C++20 concept, usage of C++14 template alias
auto func(const E<G> & e) // auto return type (C++14)
{
    if (elements.contains(e)) // C++20 .contains membership test
    {
        // ...
    }

    elements.erase_if(
        elements,
        [&](const auto x){
            return x == 1;
        }); // C++20 std::erase_if

    return {1, 2}; // or: return std::pair(1, 2); // create pair via initialization list or value initialization (C++17)
}
```

## 플랫폼 {#platform}

**1.** 특정 플랫폼을 위해 코드를 작성합니다.  
그러나 다른 조건들이 동일할 경우, 크로스 플랫폼 또는 포터블 코드가 선호됩니다.

**2.** 언어: C++20 (사용 가능한 [C++20 기능](https://en.cppreference.com/w/cpp/compiler_support#C.2B.2B20_features) 목록 참조).

**3.** 컴파일러: `clang`. 작성 시점에서 (2025년 3월), 코드가 clang 버전 >= 19에서 컴파일됩니다.  
표준 라이브러리가 사용됩니다(`libc++`).

**4.** 운영 체제: 리눅스 우분투, Precise보다 오래되지 않음.

**5.** 코드는 x86_64 CPU 아키텍처를 위해 작성됩니다.  
CPU 명령어 집합은 당사 서버에서 지원되는 최소 집합입니다. 현재 SSE 4.2입니다.

**6.** 몇 가지 예외를 제외하고 `-Wall -Wextra -Werror -Weverything` 컴파일 플래그를 사용하십시오.

**7.** 정적 링크를 모든 라이브러리에 사용하되, 정적으로 연결하기 어려운 경우를 제외하십시오 ( `ldd` 명령의 출력을 참조).

**8.** 코드는 릴리스 설정으로 개발되고 디버그됩니다.

## 도구 {#tools}

**1.** KDevelop는 좋은 IDE입니다.

**2.** 디버깅을 위해서는 `gdb`, `valgrind` (`memcheck`), `strace`, `-fsanitize=...`, 또는 `tcmalloc_minimal_debug`를 사용합니다.

**3.** 프로파일링을 위해서는 `Linux Perf`, `valgrind` (`callgrind`), 또는 `strace -cf`를 사용합니다.

**4.** 소스는 Git에 있습니다.

**5.** 어셈블리는 `CMake`를 사용합니다.

**6.** 프로그램은 `deb` 패키지를 사용하여 릴리즈됩니다.

**7.** master에 대한 커밋은 빌드를 중단시켜서는 안 됩니다.  
오직 선택된 리비전만 작업 가능하다고 판단됩니다.

**8.** 코드가 부분적으로 준비된 경우에도 가능한 한 자주 커밋하십시오.  
이 목적을 위해 브랜치를 사용하십시오.  
`master` 브랜치에서 코드가 아직 빌드 가능하지 않다면 `push` 전 빌드에서 제외하십시오. 코드 작성을 완료하거나 며칠 내에 제거해야 합니다.

**9.** 비트리비얼한 변경의 경우, 브랜치를 사용하고 서버에 게시하십시오.

**10.** 사용하지 않는 코드는 저장소에서 제거됩니다.

## 라이브러리 {#libraries}

**1.** C++20 표준 라이브러리와 `boost`, `Poco` 프레임워크를 사용합니다. 

**2.** 운영 체제 패키지에서 라이브러리를 사용하는 것은 허용되지 않습니다. 사전 설치된 라이브러리 사용도 허용되지 않습니다. 모든 라이브러리는 `contrib` 디렉터리에 소스 코드 형태로 배치되어 ClickHouse로 빌드되어야 합니다. [새로운 서드파티 라이브러리 추가 지침](/development/contrib#adding-and-maintaining-third-party-libraries)을 참조하십시오.

**3.** 이미 사용중인 라이브러리에 항상 우선권이 주어집니다.

## 일반 권장 사항 {#general-recommendations-1}

**1.** 가능한 한 적은 코드를 작성하십시오.

**2.** 가장 간단한 솔루션을 시도하십시오.

**3.** 코드가 어떻게 작동할지, 내부 루프가 어떻게 기능할지 알 때까지 코드를 작성하지 마십시오.

**4.** 가장 간단한 경우에는 클래스를 또는 구조체 아래에 `using`을 사용하십시오.

**5.** 가능하다면 복사 생성자, 대입 연산자, 소멸자 (가상 함수가 하나라도 포함된 경우에는 다른 것), 이동 생성자 또는 이동 대입 연산자를 작성하지 마십시오.  
다시 말해, 컴파일러에서 생성된 함수가 올바르게 작동해야 합니다. `default`를 사용할 수 있습니다.

**6.** 코드 단순화를 장려합니다. 코드의 크기를 가능한 한 줄이십시오.

## 추가 권장 사항 {#additional-recommendations}

**1.** `stddef.h`에서 타입에 대해 `std::`를 명시적으로 지정하는 것은 권장되지 않습니다.  
다시 말해, `size_t`를 `std::size_t` 대신 작성하는 것을 권장합니다. 왜냐하면 짧기 때문입니다.  
`std::`를 추가하는 것은 허용됩니다.

**2.** 표준 C 라이브러리의 함수에 대해 `std::`를 명시적으로 지정하는 것은 권장되지 않습니다.  
다시 말해, `std::memcpy` 대신 `memcpy`를 작성합니다.  
그 이유는 `memmem`과 같은 유사한 비표준 함수가 있기 때문입니다. 이 함수들은 가끔 사용됩니다. 이 함수들은 `namespace std`에 존재하지 않습니다.  
모든 곳에서 `std::memcpy` 대신 `memcpy`를 작성한다면, `std::` 없이 `memmem`는 이상하게 보일 것입니다.  
그럼에도 불구하고, 원하시면 `std::`를 사용할 수 있습니다.

**3.** 표준 C++ 라이브러리에 동일한 함수가 있을 때 C의 함수를 사용하는 것은 허용됩니다.  
이것은 더 효율적인 경우에 허용됩니다.  
예를 들어, 커다란 메모리 덩어리를 복사하는 경우에는 `std::copy` 대신 `memcpy`를 사용하십시오.

**4.** 다중 줄 함수 인수.

다음과 같은 모든 래핑 스타일이 허용됩니다:

```cpp
function(
  T1 x1,
  T2 x2)
```

```cpp
function(
  size_t left, size_t right,
  const & RangesInDataParts ranges,
  size_t limit)
```

```cpp
function(size_t left, size_t right,
  const & RangesInDataParts ranges,
  size_t limit)
```

```cpp
function(size_t left, size_t right,
      const & RangesInDataParts ranges,
      size_t limit)
```

```cpp
function(
      size_t left,
      size_t right,
      const & RangesInDataParts ranges,
      size_t limit)
```
