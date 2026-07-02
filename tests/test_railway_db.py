import unittest

from sqlalchemy.engine import make_url

from railway_db import build_database_uri, normalize_database_uri, using_mysql_env


class RailwayDatabaseUriTest(unittest.TestCase):
    def test_database_url_mysql_scheme_uses_pymysql_driver(self):
        env = {
            "DATABASE_URL": " mysql://user:pass@example.com:3306/marksix ",
        }

        self.assertEqual(
            build_database_uri("/tmp/local.db", env),
            "mysql+pymysql://user:pass@example.com:3306/marksix",
        )

    def test_mysql_url_has_priority_after_database_url(self):
        env = {
            "MYSQL_URL": " mysql://railway:secret@mysql.railway.internal:3306/railway ",
            "MYSQLHOST": "ignored",
        }

        self.assertEqual(
            build_database_uri("/tmp/local.db", env),
            "mysql+pymysql://railway:secret@mysql.railway.internal:3306/railway",
        )

    def test_railway_mysqlhost_variables_build_encoded_uri(self):
        env = {
            "MYSQLHOST": " mysql.railway.internal ",
            "MYSQLPORT": " 3306 ",
            "MYSQLDATABASE": " mark six ",
            "MYSQLUSER": " user name ",
            "MYSQLPASSWORD": "p@ss word:1",
        }

        database_uri = build_database_uri("/tmp/local.db", env)

        self.assertEqual(
            database_uri,
            "mysql+pymysql://user%20name:p%40ss%20word%3A1@mysql.railway.internal:3306/mark six?charset=utf8mb4",
        )
        parsed = make_url(database_uri)
        self.assertEqual(parsed.username, "user name")
        self.assertEqual(parsed.password, "p@ss word:1")
        self.assertEqual(parsed.database, "mark six")

    def test_db_type_mysql_supports_legacy_db_variables(self):
        env = {
            "DB_TYPE": " MySQL ",
            "DB_HOST": " localhost ",
            "DB_PORT": " 3307 ",
            "DB_NAME": " mark_six ",
            "DB_USER": " root ",
            "DB_PASSWORD": " ",
        }

        self.assertEqual(
            build_database_uri("/tmp/local.db", env),
            "mysql+pymysql://root:@localhost:3307/mark_six?charset=utf8mb4",
        )

    def test_sqlite_fallback_when_no_mysql_configuration_exists(self):
        self.assertEqual(
            build_database_uri("/tmp/local.db", {}),
            "sqlite:////tmp/local.db",
        )

    def test_using_mysql_env_accepts_railway_variables(self):
        self.assertTrue(using_mysql_env({"MYSQLHOST": "db.internal"}))
        self.assertTrue(using_mysql_env({"MYSQLHOST": " db.internal "}))
        self.assertTrue(using_mysql_env({"MYSQL_URL": " mysql://u:p@h/db "}))
        self.assertTrue(using_mysql_env({"DATABASE_URL": " mysql+pymysql://u:p@h/db "}))
        self.assertTrue(using_mysql_env({"MYSQL_URL": "mysql://u:p@h/db"}))
        self.assertTrue(using_mysql_env({"DATABASE_URL": "mysql+pymysql://u:p@h/db"}))
        self.assertTrue(using_mysql_env({"DB_TYPE": "mariadb"}))
        self.assertFalse(using_mysql_env({}))

    def test_normalize_database_uri_preserves_non_mysql_schemes(self):
        self.assertEqual(
            normalize_database_uri("sqlite:////tmp/local.db"),
            "sqlite:////tmp/local.db",
        )


if __name__ == "__main__":
    unittest.main()
