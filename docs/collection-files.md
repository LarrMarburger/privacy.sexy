# Collection files

- privacy.sexy is a data-driven application where it reads the necessary OS-specific logic from yaml files in [`application/collections`](./../src/application/collections/)
- 💡 Best practices
  - If you repeat yourself, try to utilize [YAML-defined functions](#Function)
  - Always try to add documentation and a way to revert a tweak in [scripts](#Script)
- 📖 Types in code: [`collection.yaml.d.ts`](./../src/application/collections/collection.yaml.d.ts)

## Objects

### `Collection`

- A collection simply defines:
  - different categories and their scripts in a tree structure
  - OS specific details
- Also allows defining common [function](#Function)s to be used throughout the collection if you'd like different scripts to share same code.

#### `Collection` syntax

- `os:` *`string`*  (**required**)
  - Operating system that the [Collection](#collection) is written for.
  - 📖 See [OperatingSystem.ts](./../src/domain/OperatingSystem.ts) enumeration for allowed values.
- `actions: [` ***[`Category`](#Category)*** `, ... ]` **(required)**
  - Each [category](#category) is rendered as different cards in card presentation.
  - ❗ A [Collection](#collection) must consist of at least one category.
- `functions: [` ***[`Function`](#Function)*** `, ... ]`
  - Functions are optionally defined to re-use the same code throughout different scripts.
- `scripting:` ***[`ScriptingDefinition`](#ScriptingDefinition)*** **(required)**
  - Defines the scripting language that the code of other action uses.

### `Category`

- Category has a parent that has tree-like structure where it can have subcategories or subscripts.
- It's a logical grouping of different scripts and other categories.

#### `Category` syntax

- `category:` *`string`*  (**required**)
  - Name of the category
  - ❗ Must be unique throughout the [Collection](#collection)
- `children: [` ***[`Category`](#Category)*** `|` [***`Script`***](#Script) `, ... ]`  (**required**)
  - ❗ Category must consist of at least one subcategory or script.
  - Children can be combination of scripts and subcategories.

### `Script`

- Script represents a single tweak.
- A script must include either:
  - A `code` and `revertCode`
  - Or `call` to call YAML-defined functions
- 🙏 For any new script, please add `revertCode` and `docs` values if possible.

#### `Script` syntax

- `name`: *`string`* (**required**)
  - Name of the script
  - ❗ Must be unique throughout the [Collection](#collection)
  - E.g. `Disable targeted ads`
- `code`: *`string`* (may be **required**)
  - Batch file commands that will be executed
  - 💡 If defined, best practice to also define `revertCode`
  - ❗ If not defined `call` must be defined, do not define if `call` is defined.
- `revertCode`: `string`
  - Code that'll undo the change done by `code` property.
  - E.g. let's say `code` sets an environment variable as `setx POWERSHELL_TELEMETRY_OPTOUT 1`
    - then `revertCode` should be doing `setx POWERSHELL_TELEMETRY_OPTOUT 0`
  - ❗ Do not define if `call` is defined.
- `call`: ***[`FunctionCall`](#FunctionCall)*** | `[` ***[`FunctionCall`](#FunctionCall)*** `, ... ]` (may be **required**)
  - A shared function or sequence of functions to call (called in order)
  - ❗ If not defined `code` must be defined
- `docs`: *`string`* | `[`*`string`*`, ... ]`
  - Single documentation URL or list of URLs for those who wants to learn more about the script
  - E.g. `https://docs.microsoft.com/en-us/windows-server/`
- `recommend`: `"standard"` | `"strict"` | `undefined` (default)
  - If not defined then the script will not be recommended
  - If defined it can be either
    - `standard`: Only non-breaking scripts without limiting OS functionality
    - `strict`: Scripts that can break certain functionality in favor of privacy and security

### `FunctionCall`

- Describes a single call to a function by optionally providing values to its parameters.
- 👀 See [parameter substitution](#parameter-substitution) for an example usage

#### `FunctionCall` syntax

- `function`: *`string`* (**required**)
  - Name of the function to call.
  - ❗ Function with same name must defined in `functions` property of [Collection](#collection)
- `parameters`: `[ parameterName:` *`parameterValue`*`, ... ]`
  - Defines key value dictionary for each parameter and its value
  - E.g.

    ```yaml
      parameters:
        userDefinedParameterName: parameterValue
        # ...
        appName: Microsoft.WindowsFeedbackHub
    ```

### `Function`

- Functions allow re-usable code throughout the defined scripts.
- Functions are templates compiled by privacy.sexy and uses special [expressions](#expressions).
- Functions can call other functions by defining `call` property instead of `code`
- 👀 See [parameter substitution](#parameter-substitution) for an example usage

#### Expressions

- Expressions are defined inside mustaches (double brackets, `{{` and `}}`)

##### Parameter substitution

A simple function example

```yaml
  function: EchoArgument
  parameters:
    - name: 'argument'
  code: Hello {{ $argument }} !
```

It would print "Hello world" if it's called in a [script](#script) as following:

```yaml
  script: Echo script
  call:
    function: EchoArgument
    parameters:
      argument: World
```

A function can call other functions such as:

```yaml
  - 
    function: CallerFunction
    parameters:
      - name: 'value'
    call:
      function: EchoArgument
      parameters:
        argument: {{ $value }}
  -
    function: EchoArgument
    parameters:
      - name: 'argument'
    code: Hello {{ $argument }} !
```

#### `Function` syntax

- `name`: *`string`* (**required**)
  - Name of the function that scripts will use.
  - Convention is to use camelCase, and be verbs.
  - E.g. `uninstallStoreApp`
  - ❗ Function names must be unique
- `parameters`: `[` ***[`FunctionParameter`](#FunctionParameter)*** `, ... ]`
  - List of parameters that function code refers to.
  - ❗ Must be defined to be able use in [`FunctionCall`](#functioncall) or [expressions](#expressions)
 `code`: *`string`* (**required** if `call` is undefined)
  - Batch file commands that will be executed
  - 💡 If defined, best practice to also define `revertCode`
  - ❗ If not defined `call` must be defined
- `revertCode`: *`string`*
  - Code that'll undo the change done by `code` property.
  - E.g. let's say `code` sets an environment variable as `setx POWERSHELL_TELEMETRY_OPTOUT 1`
    - then `revertCode` should be doing `setx POWERSHELL_TELEMETRY_OPTOUT 0`
- `call`: ***[`FunctionCall`](#FunctionCall)*** | `[` ***[`FunctionCall`](#FunctionCall)*** `, ... ]` (may be **required**)
  - A shared function or sequence of functions to call (called in order)
  - The parameter values that are sent can use [expressions](#expressions)
  - ❗ If not defined `code` must be defined

### `FunctionParameter`

- Defines a parameter that function requires optionally or mandatory.
- Its arguments are provided by a [Script](#script) through a [FunctionCall](#FunctionCall).

#### `FunctionParameter` syntax

- `name`: *`string`* (**required**)
  - Name of the parameters that the function has.
  - Parameter names must be defined to be used in [expressions](#expressions).
  - ❗ Parameter names must be unique and include alphanumeric characters only.
- `optional`: *`boolean`* (default: `false`)
  - Specifies whether the caller [Script](#script) must provide any value for the parameter.
  - If set to `false` i.e. an argument value is not optional then it expects a non-empty value for the variable;
    - Otherwise it throws.
  - 💡 Set it to `true` if a parameter is used conditionally;
    - Or else set it to `false` for verbosity or do not define it as default value is `false` anyway.

### `ScriptingDefinition`

- Defines global properties for scripting that's used throughout its parent [Collection](#collection).

#### `ScriptingDefinition` syntax

- `language:` *`string`* (**required**)
  - 📖 See [ScriptingLanguage.ts](./../src/domain/ScriptingLanguage.ts) enumeration for allowed values.
- `startCode:` *`string`* (**required**)
  - Code that'll be inserted on top of user created script.
  - Global variables such as `$homepage`, `$version`, `$date` can be used using [parameter substitution](#parameter-substitution) code syntax such as `Welcome to {{ $homepage }}!`
- `endCode:` *`string`* (**required**)
  - Code that'll be inserted at the end of user created script.
  - Global variables such as `$homepage`, `$version`, `$date` can be used using [parameter substitution](#parameter-substitution) code syntax such as `Welcome to {{ $homepage }}!`
