# Railway 部署及上游代码同步修复指南

**使用说明**：
每次从上游原作者的仓库（Upstream）同步代码后，针对 Railway 和 MySQL 部署环境的定向修改都会被覆盖还原，导致应用程序无法启动或崩溃。
下次如果再次同步上游代码，**请直接将此文件提供给 AI，或者丢给 AI 说：“按这个指南帮我修复项目”**，AI 将自动调用工具为您处理。

---

## 需要 AI 重复执行的修复任务清单（AI See This）

由于原版代码是基于 SQLite（本地）编写并测试，迁移到 Railway (MySQL 8) 时会暴露下列底层问题。请 AI 根据以下步骤分析代码并重新打上补丁：

### 1. 修改数据库连接驱动与 Railway 环境变量识别 (涉及文件：`app.py`，建议抽出公共模块如 `railway_db.py`)
原版代码只读取 `DATABASE_URL` 或 `DB_TYPE=mysql` + `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD`。Railway MySQL 默认提供的是另一套变量名：`MYSQLHOST`、`MYSQLPORT`、`MYSQLDATABASE`、`MYSQLUSER`、`MYSQLPASSWORD`、`MYSQL_URL`。如果不兼容这套变量，应用会误回退到 SQLite，或使用 `localhost/root/mark_six` 这类默认值导致连接失败。
- 连接构建逻辑必须同时支持两套变量名：优先读取 `DATABASE_URL` / `MYSQL_URL`；否则在 `DB_TYPE=mysql` 或存在 `MYSQLHOST` 时拼接 MySQL URL。
- 读取环境变量时必须清洗多余空格，例如：`host = os.environ.get("DB_HOST") or os.environ.get("MYSQLHOST")` 后再 `.strip()`。
- Railway 或用户手填的连接串可能是 `mysql://...`，必须强制规范化为 `mysql+pymysql://...`，以使用项目安装的 PyMySQL 驱动。
- 如果手动拼接 URL，格式应为：`mysql+pymysql://user:password@host:port/database?charset=utf8mb4`，并对用户名/密码做 URL 编码，避免密码中包含 `@`、空格、`:` 等字符时解析失败。
- SQLite 初始化脚本和迁移判断也应复用同一套 “是否 MySQL 配置” 判断，不能只检查 `DB_TYPE` 或 `DATABASE_URL`，否则 Railway 仅提供 `MYSQLHOST` 时仍会错误执行 SQLite 初始化。

### 2. MySQL 8 平台验证依赖 (涉及文件：`requirements.txt`)
Railway 预搭环境为 MySQL 8 环境，加密方式使用了 `caching_sha2_password`。PyMySQL 连接时需要加装包。
- 确保在 `requirements.txt` 中写入 `cryptography`（建议版本，例如 `cryptography==42.0.5`）。

### 3. PyMySQL 聚合查询 `Decimal` 异常 (涉及文件：`user.py`, `admin.py`, `api_mobile.py` 等)
SQLite 和 MySQL 对数据类型的映射不同，在使用 `pymysql` 针对金额、数量进行查询的 `func.sum()` 操作中，MySQL 会返回 `Decimal` 类型。原代码直接将其与 Integer 相加会导致 `TypeError`。
- 在上述涉及资金、总局数计算的文件中，全局排查所有 `.scalar() or 0`、`func.sum(...)`、`db.func.sum(...)`、聚合 `.first()` / `.one()` 返回值，必须强制使用 `int()` 或 `float()` 类型转换（例如 `int(total_count)` 或 `float(total_profit)`），避免 Python 在 JSON 序列化或运算时报错。
- 建议抽出 `int_or_zero()` / `float_or_zero()` 辅助函数，统一处理 `None`、空字符串、`Decimal` 和异常值，避免每个页面各写一套转换逻辑。

### 4. 强制执行 MySQL 的新建列迁移 (涉及文件：`app.py`)
原生程序中的迁移组件 `auto_update_db.py` 里面硬编码了 `if _using_mysql(): return True`，它会跳过上游新增功能的自动建表。例如：`auto_prediction_regions`, `show_normal_numbers`, `prediction_metadata`, `bettor_name` 等任何上游增加的新字段。
- 不建议直接取消 `auto_update_db.py` 的 MySQL 跳过逻辑，因为该文件内大量 SQL 是 SQLite 专用语法（如 `PRAGMA`、`sqlite_master`、`AUTOINCREMENT`），直接在 MySQL 上执行可能导致启动失败。
- 推荐在 `app.py` 内部新增 MySQL 专用补列函数，并在 `db.create_all()` 之后调用。可以用 SQLAlchemy inspector 检查列是否存在，或执行 `SHOW COLUMNS FROM {table} LIKE '{column}'`；不存在时调用 `ALTER TABLE {table} ADD COLUMN {column} ...` 主动补齐。
- 至少补齐当前上游常见新增列：`user.auto_prediction_regions`、`user.show_normal_numbers`、`prediction_record.prediction_metadata`、`manual_bet_records.bettor_name`。后续同步上游后如又新增模型字段，也要把对应 MySQL 补列规则加入这里。

### 5. 容器启动探针修改 (涉及文件：`entrypoint.sh`)
Railway 环境属于无状态设计，且没有自动触发 `init_database()`。
- `entrypoint.sh` 判断 MySQL 时必须兼容 `DB_TYPE=mysql`、`DATABASE_URL=mysql...`、`MYSQL_URL=mysql...`、`MYSQLHOST` 任一条件；不要只判断 `DB_TYPE` / `DATABASE_URL`。
- 在 `entrypoint.sh` 末尾，于启动 `gunicorn` 或 `app:app` 命令执行 **之前** 注入这一句：
  `python3 -c "from app import init_database; init_database()"`
- 由此保证云端每次部署均能执行上面提到的数据库检查表（并执行同步更新）。

### 6. APP 接口配置 (附加: `mobile/mark_six/lib/config.dart`)
- Flutter 手机端 APP 的后端接口地址必须改成自己的 Railway 域名。当前部署地址为：`https://mark-six-production.up.railway.app`。
- 检查 `mobile/mark_six/lib/config.dart`，确保 `baseUrl` 固定为：
  `const String baseUrl = 'https://mark-six-production.up.railway.app';`
- 修改后必须重新编译 APP，否则已安装的旧 APK 仍会请求上游或旧服务器。

### 7. APP 更新检查源修复 (涉及文件：`mobile/mark_six/lib/main.dart`)
上游 Flutter APP 内置了 GitHub release 更新检查。如果 `_owner` 仍然写死为原作者 `e5sub`，即使当前代码来自自己的 fork，APP 也会继续读取 `e5sub/mark-six` 的最新 release，并弹出上游版本更新提示。
- 检查 `UpdateService`，把 GitHub release 源改为自己的 fork：`_owner = '0bito798'`，`_repo = 'mark-six'`。
- 如果不想使用 APP 内更新功能，也可以禁用 `UpdateService.checkForUpdate(context)` 调用；但不要继续指向上游作者仓库。
- 全局搜索 `e5sub`、`api.github.com/repos`、`releases/latest`、`gh-proxy.com`，确认更新检查不再绑定上游 release。

### 8. 移除原作者水印与页脚推广链接 (涉及文件：`templates/*.html`)
上游代码会在页面背景注入 GitHub 仓库推广文字和底部悬浮水印。由于各页面的行号会随着版本更新而改变，**切勿使用固定行号修改，必须使用关键字或正则特征进行匹配和删除**。请全面检查 `templates/index.html`，`templates/admin/base.html`，`templates/user/base.html` 等主模板：
- **清理 CSS 水印代码**：扫描并删除包含 `.github-watermark` 的整块 CSS 代码。
- **清理 HTML 水印节点**：全局替换并删除 `<div class="github-watermark" aria-hidden="true"></div>`。
- **清理底部页脚**：全局搜索 `<footer class="app-footer">` 的整个闭合块（包含内部的 `GitHub：` 相关字眼链接），并将其删除；或者匹配 `href="https://github.com/e5sub/mark-six"` 进行对应清除。
