import unittest
from decimal import Decimal

from numeric_utils import float_or_zero, int_or_zero


class NumericUtilsTest(unittest.TestCase):
    def test_int_or_zero_handles_decimal_empty_and_invalid_values(self):
        self.assertEqual(int_or_zero(Decimal("12")), 12)
        self.assertEqual(int_or_zero(None), 0)
        self.assertEqual(int_or_zero(""), 0)
        self.assertEqual(int_or_zero("not-a-number"), 0)

    def test_float_or_zero_handles_decimal_empty_and_invalid_values(self):
        self.assertEqual(float_or_zero(Decimal("12.50")), 12.5)
        self.assertEqual(float_or_zero(None), 0.0)
        self.assertEqual(float_or_zero(""), 0.0)
        self.assertEqual(float_or_zero("not-a-number"), 0.0)

    def test_float_or_zero_rejects_non_finite_values(self):
        self.assertEqual(float_or_zero(Decimal("NaN")), 0.0)
        self.assertEqual(float_or_zero(Decimal("Infinity")), 0.0)


if __name__ == "__main__":
    unittest.main()
