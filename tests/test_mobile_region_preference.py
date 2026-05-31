import unittest
from pathlib import Path


MAIN_DART = (
    Path(__file__).resolve().parents[1]
    / "mobile"
    / "mark_six"
    / "lib"
    / "main.dart"
)


class MobileRegionPreferenceContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = MAIN_DART.read_text(encoding="utf-8-sig")

    def test_app_state_persists_a_user_scoped_selected_region(self):
        self.assertIn("String _selectedRegion = 'hk';", self.source)
        self.assertIn("String get selectedRegion => _selectedRegion;", self.source)
        self.assertIn("selected_region_user_${current.id}", self.source)
        self.assertIn("Future<void> setSelectedRegion(String region)", self.source)

    def test_region_screens_share_app_state(self):
        self.assertIn("RecordsScreen(appState: widget.appState)", self.source)
        self.assertIn("ZodiacNumbersScreen(appState: widget.appState)", self.source)
        self.assertGreaterEqual(
            self.source.count("widget.appState.selectedRegion"),
            4,
        )

    def test_zodiac_lookup_no_longer_hardcodes_hong_kong(self):
        self.assertNotIn("region: 'hk',", self.source)

    def test_manual_next_period_keeps_hk_only_slash_year_boundary(self):
        self.assertIn("if (_region == 'hk' && latestId.contains('/'))", self.source)
        self.assertIn("return '${DateTime.now().year}001';", self.source)


if __name__ == "__main__":
    unittest.main()
