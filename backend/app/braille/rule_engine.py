def evaluate_braille(expected, actual):
    expected_set = set(expected)
    actual_set = set(actual)

    missing = sorted(list(expected_set - actual_set))
    extra = sorted(list(actual_set - expected_set))

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
            "extraDots": extra
        },
        "errorType": error_type
    }