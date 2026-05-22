# Railway 部署及上游代码同步修复指南

**使用说明**：
每次从上游原作者的仓库（Upstream）同步代码后，针对 Railway 和 MySQL 部署环境的定向修改都会被覆盖还原，导致应用程序无法启动或崩溃。
下次如果再次同步上游代码，**请直接将此文件提供给 AI，或者丢给 AI 说：“按这个指南帮我修复项目”**，AI 将自动调用工具为您处理。

---

## 需要 AI 重复执行的修复任务清单（AI See This）

由于原版代码是基于 SQLite（本地）编写并测试，迁移到 Railway (MySQL 8) 时会暴露下列底层问题。请 AI 根据以下步骤分析代码并重新打上补丁：

### 1. 修改数据库连接驱动 (涉及文件：`app.py`)
原版使用默认的 MySQL 驱动适配。
- 请在 `_build_database_uri(db_type)` 或相关处理逻辑中，确保读取到的配置能正确清洗掉多余空格，例如：`host = os.environ.get('DB_HOST', '').strip()`。
- 将返回的数据库链接协议由 `mysql://` 强制替换为 `mysql+pymysql://`，以使用我们安装好的 PyMySQL 驱动。

### 2. MySQL 8 平台验证依赖 (涉及文件：`requirements.txt`)
Railway 预搭环境为 MySQL 8 环境，加密方式使用了 `caching_sha2_password`。PyMySQL 连接时需要加装包。
- 确保在 `requirements.txt` 中写入 `cryptography`（建议版本，例如 `cryptography==42.0.5`）。

### 3. PyMySQL 聚合查询 `Decimal` 异常 (涉及文件：`user.py`, `admin.py`, `api_mobile.py` 等)
SQLite 和 MySQL 对数据类型的映射不同，在使用 `pymysql` 针对金额、数量进行查询的 `func.sum()` 操作中，MySQL 会返回 `Decimal` 类型。原代码直接将其与 Integer 相加会导致 `TypeError`。
- 在上述涉及资金、总局数计算的文件中，全局排查所有 `.scalar() or 0` 的聚合查询，必须强制使用 `int()` 或 `float()` 类型转换（例如 `int(total_cost)` 或 `float(total_reward)`），避免 Python 在 JSON 序列化或运算时报错。

### 4. 强制执行 MySQL 的新建列迁移 (涉及文件：`app.py`)
原生程序中的迁移组件 `auto_update_db.py` 里面硬编码了 `if _using_mysql(): return True`，它会跳过上游新增功能的自动建表。例如：`auto_prediction_regions`, `show_normal_numbers`, `prediction_metadata`, `bettor_name` 等任何上游增加的新字段。
- 必须取消此限制或在 `app.py` 内部的 `init_database()` 函数内（`db.create_all()` 之后），使用原生的 sqlalchemy 执行 `SHOW COLUMNS FROM {table} LIKE '{column}'`，如果不存在则调用 `ALTER TABLE {table} ADD COLUMN {column} ...` 进行主动补齐。

### 5. 容器启动探针修改 (涉及文件：`entrypoint.sh`)
Railway 环境属于无状态设计，且没有自动触发 `init_database()`。
- 在 `entrypoint.sh` 末尾，于启动 `gunicorn` 或 `app:app` 命令执行 **之前** 注入这一句：
  `python3 -c "from app import init_database; init_database()"`
- 由此保证云端每次部署均能执行上面提到的数据库检查表（并执行同步更新）。

### 6. APP 接口配置 (附加: `mobile/mark_six/lib/config.dart`)
- 如果需要使用 Flutter 手机端 APP 登录自己的后端，记得进去将 `baseUrl` 的硬编码服务器域名，改回自己在 Railway 上生成的真实域名并重新编译 APP。