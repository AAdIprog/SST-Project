from grader.normalization import normalize_name, normalize_role
from typing import List, Tuple, Dict, Any

def compute_score(predictions: List[Tuple[str, str]], ground_truth: List[Tuple[str, str]], strict_mode: bool = True) -> Dict[str, Any]:
    """
    Computes precision, recall, and F1 for entity-relation pairs.
    """
    gt_set = set()
    for name, role in ground_truth:
        gt_set.add((normalize_name(name), normalize_role(role)))
        
    pred_set = set()
    for name, role in predictions:
        pred_set.add((normalize_name(name), normalize_role(role)))

    tp = 0
    fp = 0
    fn = 0
    
    logs = []

    for pred_name, pred_role in pred_set:
        if (pred_name, pred_role) in gt_set:
            tp += 1
            logs.append(f"✅ Exact Match: ('{pred_name}', '{pred_role}')")
        else:
            fp += 1
            # Debugging logs: why did it fail?
            partial_match = False
            for gt_name, gt_role in gt_set:
                if pred_name == gt_name:
                    logs.append(f"❌ Role Mismatch: Name '{pred_name}' matched, but predicted role '{pred_role}' instead of '{gt_role}'")
                    partial_match = True
                    break
            if not partial_match:
                logs.append(f"❌ Spurious Entity: ('{pred_name}', '{pred_role}')")

    for gt_name, gt_role in gt_set:
        if (gt_name, gt_role) not in pred_set:
            fn += 1
            logs.append(f"❌ Missed Ground Truth: ('{gt_name}', '{gt_role}')")

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    return {
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "tp": tp,
        "fp": fp,
        "fn": fn,
        "logs": logs
    }
