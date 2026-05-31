import unittest

from railway_db import build_database_uri, is_mysql_configured


class RailwayDbTest(unittest.TestCase):
    def test_database_url_takes_priority_and_normalizes_mysql_scheme(self):
        uri = build_database_uri(
            "/tmp/local.db",
            {
                "DATABASE_URL": "  mysql://user:pass@example.railway.internal:3306/app_db  ",
                "MYSQL_URL": "mysql://other:pass@other/db",
                "DB_TYPE": "sqlite",
            },
        )

        self.assertEqual(
            uri,
            "mysql+pymysql://user:pass@example.railway.internal:3306/app_db",
        )

    def test_mysql_url_is_used_after_database_url_and_mariadb_scheme_is_normalized(self):
        uri = build_database_uri(
            "/tmp/local.db",
            {
                "DATABASE_URL": "   ",
                "MYSQL_URL": "  mariadb://user:pass@example.railway.internal:3306/app_db?ssl=true  ",
            },
        )

        self.assertEqual(
            uri,
            "mysql+pymysql://user:pass@example.railway.internal:3306/app_db?ssl=true",
        )

    def test_mysql_driver_scheme_is_forced_to_pymysql(self):
        uri = build_database_uri(
            "/tmp/local.db",
            {
                "DATABASE_URL": " mysql+mysqldb://user:pass@example.railway.internal/app_db ",
            },
        )

        self.assertEqual(
            uri,
            "mysql+pymysql://user:pass@example.railway.internal/app_db",
        )

    def test_mysqlhost_triggers_url_build_with_stripped_and_encoded_credentials(self):
        uri = build_database_uri(
            "/tmp/local.db",
            {
                "MYSQLHOST": " containers-us-west.example.railway.internal ",
                "MYSQLPORT": " 3307 ",
                "MYSQLDATABASE": " railway db ",
                "MYSQLUSER": " user name ",
                "MYSQLPASSWORD": " p@ss word:with:colon ",
            },
        )

        self.assertEqual(
            uri,
            "mysql+pymysql://user+name:p%40ss+word%3Awith%3Acolon@"
            "containers-us-west.example.railway.internal:3307/railway%20db?charset=utf8mb4",
        )

    def test_db_type_mysql_uses_db_names_first_then_railway_fallbacks(self):
        uri = build_database_uri(
            "/tmp/local.db",
            {
                "DB_TYPE": " MariaDB ",
                "DB_HOST": " db.internal ",
                "MYSQLHOST": " railway.internal ",
                "MYSQLPORT": " 3306 ",
                "DB_NAME": " mark six ",
                "MYSQLDATABASE": " railway ",
                "DB_USER": " app:user ",
                "MYSQLUSER": " railway-user ",
                "DB_PASSWORD": " secret@value ",
            },
        )

        self.assertEqual(
            uri,
            "mysql+pymysql://app%3Auser:secret%40value@db.internal:3306/mark%20six?charset=utf8mb4",
        )

    def test_mysql_detection_covers_mysql_url_mysqlhost_and_strips_env(self):
        self.assertTrue(is_mysql_configured({"MYSQL_URL": " mysql://user:pass@host/db "}))
        self.assertTrue(is_mysql_configured({"MYSQLHOST": " railway.internal "}))
        self.assertTrue(is_mysql_configured({"DB_TYPE": " MariaDB "}))
        self.assertFalse(is_mysql_configured({"DATABASE_URL": " sqlite:///local.db ", "DB_TYPE": " sqlite "}))

    def test_invalid_mysql_host_or_port_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "DB_HOST or MYSQLHOST"):
            build_database_uri("/tmp/local.db", {"MYSQLHOST": "db.internal/path"})

        with self.assertRaisesRegex(ValueError, "DB_PORT or MYSQLPORT"):
            build_database_uri(
                "/tmp/local.db",
                {"MYSQLHOST": "db.internal", "MYSQLPORT": "3306/path"},
            )


if __name__ == "__main__":
    unittest.main()
