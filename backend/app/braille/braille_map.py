BRAILLE_MAP = {
    "a": [1],
    "b": [1, 2],
    "c": [1, 4],
    "d": [1, 4, 5],
    "e": [1, 5],
    "f": [1, 2, 4],
    "g": [1, 2, 4, 5],
    "h": [1, 2, 5],
    "i": [2, 4],
    "j": [2, 4, 5],
}


def get_braille_pattern(letter: str):
    letter = letter.lower()
    return BRAILLE_MAP.get(letter)