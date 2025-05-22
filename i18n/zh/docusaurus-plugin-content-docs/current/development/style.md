---
'description': 'ClickHouse C++ 开发的编码风格指南'
'sidebar_label': 'C++ 风格指南'
'sidebar_position': 70
'slug': '/development/style'
'title': 'C++ 风格指南'
---


# C++ 风格指南

## 一般建议 {#general-recommendations}

以下是建议，而不是要求。
如果您正在编辑代码，遵循现有代码的格式是明智的。
代码风格是一致性的必要条件。一致性使代码更易于阅读，也更易于搜索。
许多规则没有逻辑原因；它们是由既定实践所决定的。

## 格式化 {#formatting}

**1.** 大多数格式化是由 `clang-format` 自动完成的。

**2.** 缩进为 4 个空格。配置您的开发环境，使制表符添加四个空格。

**3.** 开括号和闭括号必须在单独的行上。

```cpp
inline void readBoolText(bool & x, ReadBuffer & buf)
{
    char tmp = '0';
    readChar(tmp, buf);
    x = tmp != '0';
}
```

**4.** 如果整个函数体是一个单一的 `statement`，可以将其放在同一行上。大括号前后放置空格（行尾的空格除外）。

```cpp
inline size_t mask() const                { return buf_size() - 1; }
inline size_t place(HashValue x) const    { return x & mask(); }
```

**5.** 对于函数，括号周围不要加空格。

```cpp
void reinsert(const Value & x)
```

```cpp
memcpy(&buf[place_value], &x, sizeof(x));
```

**6.** 在 `if`、`for`、`while` 等表达式中，开括号前要插入一个空格（与函数调用相对）。

```cpp
for (size_t i = 0; i < rows; i += storage.index_granularity)
```

**7.** 在二元操作符（`+`、`-`、`*`、`/`、`%` 等）和三元操作符 `?:` 周围添加空格。

```cpp
UInt16 year = (s[0] - '0') * 1000 + (s[1] - '0') * 100 + (s[2] - '0') * 10 + (s[3] - '0');
UInt8 month = (s[5] - '0') * 10 + (s[6] - '0');
UInt8 day = (s[8] - '0') * 10 + (s[9] - '0');
```

**8.** 如果输入换行，操作符应放在新的一行上，并在其前面增加缩进。

```cpp
if (elapsed_ns)
    message << " ("
        << rows_read_on_server * 1000000000 / elapsed_ns << " rows/s., "
        << bytes_read_on_server * 1000.0 / elapsed_ns << " MB/s.) ";
```

**9.** 如果需要，可以在行内使用空格进行对齐。

```cpp
dst.ClickLogID         = click.LogID;
dst.ClickEventID       = click.EventID;
dst.ClickGoodEvent     = click.GoodEvent;
```

**10.** 在操作符 `.` 和 `->` 周围不要使用空格。

如有必要，操作符可以换行。在这种情况下，前面的偏移量需要增加。

**11.** 不要在一元操作符（`--`、`++`、`*`、`&` 等）和其参数之间使用空格。

**12.** 在逗号后放置空格，而逗号前不放。对于 `for` 表达式中的分号也遵循相同规则。

**13.** 不要在 `[]` 操作符之间使用空格。

**14.** 在 `template <...>` 表达式中，`template` 和 `<` 之间使用空格；`<` 和 `>` 之间不使用空格。

```cpp
template <typename TKey, typename TValue>
struct AggregatedStatElement
{}
```

**15.** 在类和结构中，`public`、`private` 和 `protected` 应与 `class/struct` 处于同一水平，并缩进其余代码。

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

**16.** 如果整个文件使用相同的 `namespace` 且没有其他重要内容，则在 `namespace` 内部无需增加偏移量。

**17.** 如果 `if`、`for`、`while` 或其他表达式的块仅由一个 `statement` 组成，则大括号是可选的。相应地，将 `statement` 放在单独的行上。此规则同样适用于嵌套的 `if`、`for`、`while`...

但如果内层的 `statement` 包含大括号或 `else`，则外部块应使用大括号。

```cpp
/// Finish write.
for (auto & stream : streams)
    stream.second->finalize();
```

**18.** 行尾不应有空格。

**19.** 源文件编码为 UTF-8。

**20.** 字符串字面量中可以使用非 ASCII 字符。

```cpp
<< ", " << (timer.elapsed() / chunks_stats.hits) << " μsec/hit.";
```

**21.** 不要在同一行中写多个表达式。

**22.** 将函数内部的代码分段，并用不超过一行空行分隔。

**23.** 函数、类等之间用一到两行空行分隔。

**24.** `A const`（与值相关）必须在类型名称之前书写。

```cpp
//correct
const char * pos
const std::string & s
//incorrect
char const * pos
```

**25.** 在声明指针或引用时，`*` 和 `&` 符号的两侧应该有空格。

```cpp
//correct
const char * pos
//incorrect
const char* pos
const char *pos
```

**26.** 在使用模板类型时，使用 `using` 关键字来别名（除了最简单的情况）。

换句话说，模板参数仅在 `using` 中指定，不在代码中重复。

`using` 可以局部声明，如在函数内部。

```cpp
//correct
using FileStreams = std::map<std::string, std::shared_ptr<Stream>>;
FileStreams streams;
//incorrect
std::map<std::string, std::shared_ptr<Stream>> streams;
```

**27.** 不要在一个语句中声明多个不同类型的变量。

```cpp
//incorrect
int x, *y;
```

**28.** 不要使用 C 风格的强制转换。

```cpp
//incorrect
std::cerr << (int)c <<; std::endl;
//correct
std::cerr << static_cast<int>(c) << std::endl;
```

**29.** 在类和结构中，将成员和函数按可见性范围分别分组。

**30.** 对于小型类和结构，方法声明与实现不必分开。

对于任何类或结构中的小型方法也是如此。

对于模板类和结构，不要将方法声明与实现分开（因为否则它们必须在同一翻译单元中定义）。

**31.** 你可以将行换在 140 个字符，而不是 80。

**32.** 如果没有要求，始终使用前缀递增/递减操作符。

```cpp
for (Names::const_iterator it = column_names.begin(); it != column_names.end(); ++it)
```

## 注释 {#comments}

**1.** 确保为所有非平凡代码部分添加注释。

这非常重要。写下注释可能会帮助您意识到代码不必要，或者其设计错误。

```cpp
/** Part of piece of memory, that can be used.
  * For example, if internal_buffer is 1MB, and there was only 10 bytes loaded to buffer from file for reading,
  * then working_buffer will have size of only 10 bytes
  * (working_buffer.end() will point to position right after those 10 bytes available for read).
  */
```

**2.** 注释可以根据需要详细。

**3.** 将注释放在它们描述的代码之前。在少数情况下，注释可以放在代码之后，在同一行。

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

**4.** 注释应仅用英文书写。

**5.** 如果您正在编写库，请在主要头文件中包含详细注释以进行解释。

**6.** 不要添加不提供附加信息的注释。特别是，不要留下这样空的注释：

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

该示例借鉴自资源 http://home.tamk.fi/~jaalto/course/coding-style/doc/unmaintainable-code。

**7.** 不要在每个文件的开头写无意义的注释（作者、创建日期等）。

**8.** 单行注释以三个斜杠开头：`///`，多行注释以 `/**` 开头。这些注释被视为“文档”。

注意：您可以使用 Doxygen 从这些注释中生成文档。但是 Doxygen 通常不被使用，因为在 IDE 中浏览代码更方便。

**9.** 多行注释的开头和结尾不得有空行（多行注释结束的行除外）。

**10.** 注释掉代码时，请使用基本注释，而不是“文档”注释。

**11.** 在提交之前删除注释掉的代码部分。

**12.** 注释或代码中不得使用污秽语言。

**13.** 不要使用大写字母。不要使用过多的标点符号。

```cpp
/// WHAT THE FAIL???
```

**14.** 不要使用注释来做分隔符。

```cpp
///******************************************************
```

**15.** 不要在注释中开始讨论。

```cpp
/// Why did you do this stuff?
```

**16.** 没必要在块的末尾写注释描述它是什么。

```cpp
/// for
```

## 命名 {#names}

**1.** 在变量和类成员的名称中使用小写字母和下划线。

```cpp
size_t max_block_size;
```

**2.** 对于函数（方法）的名称，使用 camelCase 并以小写字母开头。

```cpp
std::string getName() const override { return "Memory"; }
```

**3.** 对于类（结构）的名称，使用 CamelCase 并以大写字母开头。除了 I 以外的前缀不用于接口。

```cpp
class StorageMemory : public IStorage
```

**4.** `using` 的命名方式与类相同。

**5.** 模板类型参数的名称：在简单情况下，使用 `T`；`T`、`U`；`T1`、`T2`。

对于更复杂的情况，可以遵循类名规则，或者添加前缀 `T`。

```cpp
template <typename TKey, typename TValue>
struct AggregatedStatElement
```

**6.** 模板常量参数的名称：可以遵循变量名称规则，或在简单的情况下使用 `N`。

```cpp
template <bool without_www>
struct ExtractDomain
```

**7.** 对于抽象类（接口），可以添加 `I` 前缀。

```cpp
class IProcessor
```

**8.** 如果您在本地使用变量，可以使用短名称。

在所有其他情况下，使用描述其含义的名称。

```cpp
bool info_successfully_loaded = false;
```

**9.** `define` 和全局常量的名称使用全大写字母以及下划线。

```cpp
#define MAX_SRC_TABLE_NAMES_TO_STORE 1000
```

**10.** 文件名称应与其内容使用相同的风格。

如果文件只包含一个类，则将文件命名为与该类相同（CamelCase）。

如果文件只包含一个函数，则将文件命名为与该函数相同（camelCase）。

**11.** 如果名称包含缩写，则：

- 对于变量名称，缩写应使用小写字母 `mysql_connection`（而不是 `mySQL_connection`）。
- 对于类和函数的名称，保留缩写中的大写字母 `MySQLConnection`（而不是 `MySqlConnection`）。

**12.** 构造函数参数仅用于初始化类成员时，参数名称应与类成员相同，但以下划线结束。

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

如果参数未在构造函数体中使用，则可以省略下划线后缀。

**13.** 局部变量和类成员的名称没有区别（不需要前缀）。

```cpp
timer (not m_timer)
```

**14.** `enum` 中的常量，使用大写字母 CamelCase。全大写字母也可以接受。如果 `enum` 不是局部的，请使用 `enum class`。

```cpp
enum class CompressionMethod
{
    QuickLZ = 0,
    LZ4     = 1,
};
```

**15.** 所有名称必须用英语书写。禁止对希伯来语单词进行音译。

    not T_PAAMAYIM_NEKUDOTAYIM

**16.** 允许使用已知的缩写（当您可以在 Wikipedia 或搜索引擎中轻松找到缩写的含义时）。

    `AST`、`SQL`。

    不要使用 `NVDH`（一些随机字母）

非完整单词在缩写常用的情况下是可以接受的。

如果在注释中包含全名，也可以使用缩写。

**17.** 包含 C++ 源代码的文件必须具有 `.cpp` 扩展名。头文件必须具有 `.h` 扩展名。

## 如何编写代码 {#how-to-write-code}

**1.** 内存管理。

手动内存释放（`delete`）仅在库代码中使用。

在库代码中，`delete` 操作符只能在析构函数中使用。

在应用程序代码中，内存必须由拥有它的对象释放。

示例：

- 最简单的方法是在栈上放置对象，或使其成为另一个类的成员。
- 对于大量小对象，使用容器。
- 对于在堆中驻留的小对象的自动释放，使用 `shared_ptr/unique_ptr`。

**2.** 资源管理。

使用 `RAII`，并查看上述内容。

**3.** 错误处理。

使用异常。在大多数情况下，您只需抛出异常，而无需捕获它（因为 `RAII`）。

在离线数据处理应用程序中，通常可以不捕获异常。

在处理用户请求的服务器中，通常只需在连接处理程序的顶层捕获异常即可。

在线程函数中，您应捕获并保留所有异常，以便在 `join` 后在主线程中重新抛出。

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

绝不要在未处理的情况下隐藏异常。绝不要盲目地将所有异常记录。

```cpp
//Not correct
catch (...) {}
```

如果您需要忽略某些异常，请仅对特定异常进行操作，并重新抛出其余异常。

```cpp
catch (const DB::Exception & e)
{
    if (e.code() == ErrorCodes::UNKNOWN_AGGREGATE_FUNCTION)
        return nullptr;
    else
        throw;
}
```

在使用带有响应代码或 `errno` 的函数时，请始终检查结果，并在出现错误时抛出异常。

```cpp
if (0 != close(fd))
    throw ErrnoException(ErrorCodes::CANNOT_CLOSE_FILE, "Cannot close file {}", file_name);
```

您可以使用 assert 来检查代码中的不变量。

**4.** 异常类型。

在应用程序代码中，无需使用复杂的异常层次结构。异常文本应对系统管理员可理解。

**5.** 从析构函数抛出异常。

这并不推荐，但允许。

使用以下选项：

- 创建一个函数（`done()` 或 `finalize()`）来提前处理可能导致异常的所有工作。如果该函数被调用，随后析构函数中不应有异常。
- 过于复杂的任务（例如通过网络发送消息）可放在类的单独方法中，供类用户在销毁前调用。
- 如果析构函数中出现异常，最好记录而不是隐藏（如果可用日志记录器）。
- 在简单应用程序中，可以依赖 `std::terminate`（针对 C++11 中默认 `noexcept` 的情况）来处理异常。

**6.** 匿名代码块。

您可以在单个函数内部创建一个单独的代码块，以使某些变量局部，从而在退出块时调用析构函数。

```cpp
Block block = data.in->read();

{
    std::lock_guard<std::mutex> lock(mutex);
    data.ready = true;
    data.block = block;
}

ready_any.set();
```

**7.** 多线程。

在离线数据处理程序中：

- 尽量在单个 CPU 核心上获得最佳性能。如果有必要，可以并行化代码。

在服务器应用程序中：

- 使用线程池来处理请求。到目前为止，我们没有需要用户空间上下文切换的任务。

不使用 fork 进行并行化。

**8.** 线程同步。

通常可以使不同的线程使用不同的内存单元（甚至更好：不同的缓存行），而不使用任何线程同步（除了 `joinAll`）。

如果需要同步，在大多数情况下，使用 `lock_guard` 下的互斥量就足够了。

在其他情况下，使用系统同步原语。不要使用忙等待。

原子操作应仅在最简单的情况下使用。

除非这是您的主要专业领域，否则不要尝试实现无锁数据结构。

**9.** 指针与引用。

在大多数情况下，优先使用引用。

**10.** `const`。

使用常量引用、指向常量的指针、`const_iterator` 和 `const` 方法。

将 `const` 视为默认，仅在必要时使用非 `const`。 

在按值传递变量时，使用 `const` 通常没有意义。

**11.** unsigned。

在必要时使用 `unsigned`。

**12.** 数字类型。

使用 `UInt8`、`UInt16`、`UInt32`、`UInt64`、`Int8`、`Int16`、`Int32` 和 `Int64`，以及 `size_t`、`ssize_t` 和 `ptrdiff_t`。

不要使用这些类型来表示数字：`signed/unsigned long`、`long long`、`short`、`signed/unsigned char`、`char`。

**13.** 传递参数。

如果将要移动复杂值，请按值传递，并使用 std::move；如果希望更新循环中的值，请按引用传递。

如果某个函数获取堆中创建的对象的所有权，请将参数类型设为 `shared_ptr` 或 `unique_ptr`。

**14.** 返回值。

在大多数情况下，只需使用 `return`。不要写 `return std::move(res)`。

如果函数分配一个堆上的对象并返回它，请使用 `shared_ptr` 或 `unique_ptr`。

在少数情况下（在循环中更新值），您可能需要通过参数返回值。在这种情况下，参数应为引用。

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

**15.** `namespace`。

不必为应用程序代码使用单独的 `namespace`。

小型库也不需要这样。

对于中大型库，将所有内容放在一个 `namespace` 中。

在库的 `.h` 文件中，可以使用 `namespace detail` 隐藏应用程序代码中不需要的实现细节。

在 `.cpp` 文件中，可以使用 `static` 或匿名 `namespace` 隐藏符号。

另外，可以为 `enum` 使用 `namespace` 以防止相应名称落入外部 `namespace`（但最好使用 `enum class`）。

**16.** 延迟初始化。

如果初始化需要参数，则通常不应编写默认构造函数。

如果以后需要延迟初始化，可以添加一个默认构造函数，该构造函数将创建一个无效对象。或者，对于少量对象，可以使用 `shared_ptr/unique_ptr`。

```cpp
Loader(DB::Connection * connection_, const std::string & query, size_t max_block_size_);

/// For deferred initialization
Loader() {}
```

**17.** 虚函数。

如果类不打算用于多态使用，则不需要将函数设置为虚函数。这也适用于析构函数。

**18.** 编码。

在任何地方都使用 UTF-8。使用 `std::string` 和 `char *`。不要使用 `std::wstring` 和 `wchar_t`。

**19.** 日志。

查看代码中的示例。

在提交之前，删除所有无意义和调试日志，以及任何其他类型的调试输出。

在循环中进行日志记录应避免，即使在 Trace 级别也是如此。

日志必须在任何日志级别上都可读。

日志仅应在应用程序代码中使用。

日志消息必须用英语书写。

日志应尽可能对系统管理员可理解。

日志中不得使用污秽语言。

在日志中使用 UTF-8 编码。在少数情况下，可以在日志中使用非 ASCII 字符。

**20.** 输入输出。

不要在对应用程序性能至关重要的内部循环中使用 `iostreams`（也不要使用 `stringstream`）。

请使用 `DB/IO` 库。

**21.** 日期和时间。

请参阅 `DateLUT` 库。

**22.** include。

始终使用 `#pragma once` 而不是包含保护。

**23.** using。

不使用 `using namespace`。可以使用 `using` 结合特定内容。但要在类或函数内使其局部。

**24.** 除非必要，否则不要对函数使用 `trailing return type`。

```cpp
auto f() -> void
```

**25.** 变量的声明和初始化。

```cpp
//right way
std::string s = "Hello";
std::string s{"Hello"};

//wrong way
auto s = std::string{"Hello"};
```

**26.** 对于虚函数，在基类中写 `virtual`，在派生类中用 `override` 替代 `virtual`。

## C++ 的未使用功能 {#unused-features-of-c}

**1.** 不使用虚继承。

**2.** 在现代 C++ 中具有便利语法糖的构造，例如：

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

## 平台 {#platform}

**1.** 我们为特定平台编写代码。

但在其他条件相等时，更倾向于交叉平台或可移植代码。

**2.** 语言：C++20（请参阅可用的 [C++20 特性](https://en.cppreference.com/w/cpp/compiler_support#C.2B.2B20_features)）。

**3.** 编译器：`clang`。在撰写本文时（2025 年 3 月），代码使用 clang 版本 >= 19 编译。

使用标准库（`libc++`）。

**4.** 操作系统：Linux Ubuntu，不早于 Precise。

**5.** 代码是为 x86_64 CPU 架构编写的。

CPU 指令集是我们服务器中支持的最小集。目前是 SSE 4.2。

**6.** 使用 `-Wall -Wextra -Werror -Weverything` 编译标志（有少数例外）。

**7.** 除了那些难以静态链接的库外，与所有库使用静态链接（请参阅 `ldd` 命令的输出）。

**8.** 代码是在发布设置下开发和调试的。

## 工具 {#tools}

**1.** KDevelop 是一个不错的 IDE。

**2.** 用于调试，请使用 `gdb`、`valgrind`（`memcheck`）、`strace`、`-fsanitize=...` 或 `tcmalloc_minimal_debug`。

**3.** 用于剖析，请使用 `Linux Perf`、`valgrind`（`callgrind`）或 `strace -cf`。

**4.** 源代码存放在 Git 中。

**5.** 汇编使用 `CMake`。

**6.** 程序通过 `deb` 包发布。

**7.** 提交到主分支必须不会破坏构建。

尽管只有选定的修订版被视为可操作。

**8.** 尽可能频繁地进行提交，即使代码只部分准备好。

使用分支来达到此目的。

如果您在 `master` 分支上的代码尚未可构建，请在 `push` 之前将其排除在构建之外。您需要在几天内完成或删除代码。

**9.** 对于非平凡的更改，使用分支并在服务器上发布它们。

**10.** 未使用的代码从仓库中删除。

## 库 {#libraries}

**1.** 使用 C++20 标准库（允许实验扩展），以及 `boost` 和 `Poco` 框架。

**2.** 不允许使用来自操作系统软件包的库。也不允许使用预安装的库。所有库应以源代码形式放置在 `contrib` 目录中，并与 ClickHouse 一起构建。有关详细信息，请参阅 [添加和维护第三方库的指南](/development/contrib#adding-and-maintaining-third-party-libraries)。

**3.** 始终优先使用已经在使用的库。

## 一般建议 {#general-recommendations-1}

**1.** 尽可能少写代码。

**2.** 尝试最简单的解决方案。

**3.** 在您知道代码将如何工作以及内部循环如何运作之前，不要编写代码。

**4.** 在最简单的情况下，使用 `using` 代替类或结构。

**5.** 如果可能，不要编写复制构造函数、赋值操作符、析构函数（除非是虚析构函数，如果类包含至少一个虚函数）、移动构造函数或移动赋值操作符。换句话说，编译器生成的函数必须正常工作。您可以使用 `default`。

**6.** 鼓励代码简化。在可能的情况下减少代码的大小。

## 其他建议 {#additional-recommendations}

**1.** 明确指定 `std::` 的类型来自 `stddef.h`

并不推荐。换句话说，我们建议写 `size_t` 而不是 `std::size_t`，因为更简短。

可以加上 `std::`。

**2.** 明确指定 `std::` 将标准 C 库中的函数

并不推荐。换句话说，写 `memcpy` 而不是 `std::memcpy`。

原因是有类似的非标准函数，比如 `memmem`。我们偶尔会使用这些函数。这些函数不在 `namespace std` 中。

如果您到处写 `std::memcpy` 而不是 `memcpy`，那么没有 `std::` 的 `memmem` 会显得奇怪。

尽管如此，如果您更喜欢，可以继续使用 `std::`。

**3.** 在可以使用标准 C++ 库中的相同函数时使用 C 的函数。

如果更高效，这是可以接受的。

例如，对于复制大块内存，使用 `memcpy` 而不是 `std::copy`。

**4.** 多行函数参数。

允许以下任意一种换行风格：

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
