import pytest
from grader.grading import compute_score

def test_perfect_match():
    gt = [("Elon Musk", "CEO")]
    pred = [("Elon Musk", "CEO")]
    res = compute_score(pred, gt)
    
    assert res["tp"] == 1
    assert res["fp"] == 0
    assert res["fn"] == 0
    assert res["precision"] == 1.0
    assert res["recall"] == 1.0

def test_normalization_and_synonyms():
    gt = [("Elon Musk", "ceo")]
    pred = [(" Elon Musk! ", " Chief Executive Officer")]
    res = compute_score(pred, gt)
    
    # "Chief Executive Officer" → "chief executive officer" → synonyms["ceo"]
    assert res["tp"] == 1
    assert res["f1"] == 1.0

def test_wrong_role_triggers_hard_constraint():
    gt = [("Elon Musk", "CEO")]
    pred = [("Elon Musk", "Founder")]  # Correct name, wrong role
    
    res = compute_score(pred, gt)
    
    assert res["tp"] == 0
    assert res["fp"] == 1  # Spurious entity (predicted wrong pair)
    assert res["fn"] == 1  # Missed the correct pair
    assert res["precision"] == 0.0

def test_missing_role():
    gt = [("Elon Musk", "CEO")]
    pred = [("Elon Musk", "")] 
    
    res = compute_score(pred, gt)
    assert res["tp"] == 0
    assert res["fp"] == 1 

def test_swapped_roles_adversarial():
    gt = [("Alice", "CEO"), ("Bob", "CTO")]
    pred = [("Alice", "CTO"), ("Bob", "CEO")]
    
    res = compute_score(pred, gt)
    
    assert res["tp"] == 0
    assert res["fp"] == 2
    assert res["fn"] == 2
    assert res["f1"] == 0.0

def test_generic_roles_rejected():
    gt = [("Alice", "Manager")]
    pred = [("Alice", "person")]  # Generic fallback
    
    res = compute_score(pred, gt)
    
    assert res["tp"] == 0
    assert res["fp"] == 1
    assert res["fn"] == 1

def test_multiple_entities_with_extras():
    gt = [("Alice", "CEO"), ("Bob", "CTO")]
    pred = [("Alice", "CEO"), ("Charlie", "CFO")] 
    
    res = compute_score(pred, gt)
    
    assert res["tp"] == 1  # Alice matches
    assert res["fp"] == 1  # Charlie is extra
    assert res["fn"] == 1  # Bob is missed
    
    assert res["precision"] == 0.5   # 1 / (1 + 1)
    assert res["recall"] == 0.5      # 1 / (1 + 1)
    assert res["f1"] == 0.5
