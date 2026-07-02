from pathlib import Path
import unittest


class EntrypointTest(unittest.TestCase):
    def test_mysql_detection_uses_shared_python_helper(self):
        script = Path("entrypoint.sh").read_text(encoding="utf-8")

        self.assertIn("from railway_db import using_mysql_env", script)
        self.assertIn("using_mysql_env()", script)
        self.assertNotIn('grep -qi "^mysql"', script)


if __name__ == "__main__":
    unittest.main()
