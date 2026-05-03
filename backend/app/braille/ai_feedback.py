# ai_feedback.py
# This file provides a local AI-assisted explanation module.
# At this stage, it does not call a real AI API.
# It uses rule-based logic to generate more detailed learning feedback.
# In Week 7, this module can be replaced or extended with a real AI service.


def generate_ai_explanation(target_letter, expected, actual, result, wrong_letters=None):
    """
    Generate a detailed explanation for a Braille practice attempt.

    Parameters:
    target_letter: the letter generated in random practice mode
    expected: the correct Braille dots
    actual: the dots selected by the user
    result: the evaluation result returned by rule_engine.py

    Returns:
    A dictionary containing explanation, learning tip, and next step.
    """

    is_correct = result.get("isCorrect", False)
    error_type = result.get("errorType", "")
    diff = result.get("diff", {})

    missing_dots = diff.get("missingDots", [])
    extra_dots = diff.get("extraDots", [])
        
    # Week 6 upgrade: check if this letter is frequently incorrect for the student
    is_frequent_mistake = False

    if target_letter and wrong_letters:
        if target_letter in wrong_letters:
            is_frequent_mistake = True

    # If the answer is correct, give positive feedback
    if is_correct:
        return {
            # "explanation": "Your answer is correct. You selected the required Braille dots accurately.",
            # "learningTip": "Try to remember this dot pattern and move to another letter.",
            # "nextStep": "Continue practicing with a new letter.",
            "explanation": f"Correct. The letter '{target_letter}' uses dots {expected}.",
            "learningTip": "Try to remember this pattern visually and physically.",
            "nextStep": "Continue practicing with a new letter."
        }

    # If the user missed required dots
    if error_type == "missing_dot":
        message = f"You missed dot(s): {missing_dots}."

        if is_frequent_mistake:
            message += " This is a letter you often find difficult."

        return {
            "explanation": message,
            "learningTip": "Compare the target letter with the correct dots.",
            "nextStep": "Try this letter again."
        }

    # If the user selected extra dots
    if error_type == "extra_dot":
        return {
            "explanation": f"You selected extra dot(s): {extra_dots}. These dots should not be included in this Braille pattern.",
            "learningTip": "Focus on selecting only the dots that belong to the target letter.",
            "nextStep": "Remove the extra dots and try again."
        }

    # If the user both missed dots and selected extra dots
    if error_type == "mixed_error":
        return {
            "explanation": f"Your answer has both missing dot(s): {missing_dots} and extra dot(s): {extra_dots}.",
            "learningTip": "Check the full Braille pattern carefully before submitting.",
            "nextStep": "Practice this letter again and compare each dot position one by one."
        }

    # Default feedback if the error type is unknown
    return {
        "explanation": "The answer is not correct, but the system could not identify a specific error type.",
        "learningTip": "Review the correct Braille pattern and try again.",
        "nextStep": "Repeat this practice item."
    }