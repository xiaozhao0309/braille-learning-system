"""Generate basic feedback for Braille practice results."""


def generate_feedback(error_type, missing_dots, extra_dots):
    """Return a feedback message and suggestion for an evaluation result."""
    if error_type == "correct":
        return {
            "message": "Correct! Well done!",
            "suggestion": "You can move to the next letter.",
        }

    if error_type == "missing_dot":
        return {
            "message": f"You missed dot(s): {missing_dots}.",
            "suggestion": "Try pressing all required dots.",
        }

    if error_type == "extra_dot":
        return {
            "message": f"You added extra dot(s): {extra_dots}.",
            "suggestion": "Avoid pressing unnecessary dots.",
        }

    return {
        "message": f"You missed {missing_dots} and added {extra_dots}.",
        "suggestion": (
            "Compare your input with the correct pattern and try again."
        ),
    }