import unittest
from calculator import subtotal


class SubtotalTests(unittest.TestCase):
    def test_sum(self):
        self.assertEqual(subtotal([10.20, 0.30]), 10.50)

    def test_empty(self):
        self.assertEqual(subtotal([]), 0)

    def test_negative_is_rejected(self):
        with self.assertRaises(ValueError):
            subtotal([-1])
