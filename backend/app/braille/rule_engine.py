"""Evaluate expected and actual Braille dot patterns."""


def evaluate_braille(expected, actual):
    """Compare two Braille patterns and identify any dot differences."""
    expected_set = set(expected)
    actual_set = set(actual)

    missing = sorted(expected_set - actual_set)
    extra = sorted(actual_set - expected_set)

    is_correct = expected_set == actual_set

    if is_correct:
        error_type = "correct"
    elif missing and not extra:
        error_type = "missing_dot"
    elif extra and not missing:
        error_type = "extra_dot"
    else:
        error_type = "incorrect_combination"

    return {
        "isCorrect": is_correct,
        "diff": {
            "missingDots": missing,
            "extraDots": extra,
        },
        "errorType": error_type,
    }