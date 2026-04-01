import string

ROLE_SYNONYMS = {
    "ceo": ["chief executive officer", "boss"],
    "cto": ["chief technology officer"],
    "cfo": ["chief financial officer"],
    "founder": ["co-founder", "creator"],
    "manager": ["supervisor", "lead"]
}

def normalize_string(text: str) -> str:
    """Lowercase, strip whitespace, remove punctuation."""
    if not isinstance(text, str):
        return ""
    text = text.lower().strip()
    return text.translate(str.maketrans('', '', string.punctuation))

def normalize_name(name: str) -> str:
    """Normalize a name string."""
    return normalize_string(name)

def normalize_role(role: str) -> str:
    """Normalize a role string and map to canonical synonym."""
    norm_role = normalize_string(role)
    
    # Map synonyms to their canonical key
    for canonical, synonyms in ROLE_SYNONYMS.items():
        if norm_role == canonical or norm_role in synonyms:
            return canonical
            
    return norm_role
