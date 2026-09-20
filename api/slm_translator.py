"""
api/slm_translator.py
Air-Gapped Small Language Model (SLM) English-to-Math Translator.
Converts natural language refinery commands into optimization constraint matrices.
"""
import re
import json
from typing import Dict

class LocalRefinerySLM:
    """Agentic AI layer for natural language optimization parsing."""
    
    def __init__(self, use_mock_fallback: bool = True):
        # In a real deployment, this connects to local Ollama (localhost:11434)
        self.use_mock_fallback = use_mock_fallback

    def translate_prompt_to_model(self, text_prompt: str) -> Dict:
        """Parses English operational limits into SANKHYA-OPT mathematical arrays."""
        
        # 1. Normalize the input text for keyword extraction
        prompt = text_prompt.lower()
        
        # 2. Base MRPL Crude Blending Formulation parameters
        # Default limits if the user doesn't specify them
        max_sulfur = 22.0
        min_octane = 45000.0
        max_reforming = 500.0
        
        # 3. SLM / Regex Extraction Logic
        # Extract sulfur limits (e.g., "keep sulfur below 18")
        sulfur_match = re.search(r'sulfur\s*(?:below|under|<|<=)\s*(\d+\.?\d*)', prompt)
        if sulfur_match:
            max_sulfur = float(sulfur_match.group(1))
            
        # Extract octane limits (e.g., "octane above 48000")
        octane_match = re.search(r'octane\s*(?:above|over|>|>=)\s*(\d+\.?\d*)', prompt)
        if octane_match:
            min_octane = float(octane_match.group(1))

        # Extract unit capacity (e.g., "reforming capacity at 400")
        reforming_match = re.search(r'reforming.*?(\d+\.?\d*)', prompt)
        if reforming_match:
            max_reforming = float(reforming_match.group(1))

        # 4. Construct the mathematical matrix mapping
        # Variables: [Arab Light, Brent, Maya, Reforming Naphtha, Mode A, Mode B]
        objective_costs = [62.0, 75.0, 48.0, 15.0, 120.0, 180.0]
        
        A_ub = [
            [0.03, 0.01, 0.05, 0.0, 0.0, 0.0],         # Sulfur constraints
            [-85.0, -95.0, -70.0, -100.0, 0.0, 0.0],   # Octane constraints (negative for >=)
            [0.0, 0.0, 0.0, 0.0, 1.0, 1.0]             # Binary mode constraints
        ]
        
        b_ub = [max_sulfur, -min_octane, 1.0]
        
        A_eq = [
            [1.0, 1.0, 1.0, 0.0, -500.0, -800.0],      # Mass balance
            [0.25, 0.30, 0.15, -1.0, 0.0, 0.0]         # Reforming yield
        ]
        b_eq = [0.0, 0.0]
        
        upper_bounds = [1000.0, 1000.0, 1000.0, max_reforming, 1.0, 1.0]

        return {
            "status": "TRANSLATED_SUCCESSFULLY",
            "extracted_parameters": {
                "max_sulfur_pool": max_sulfur,
                "min_octane_target": min_octane,
                "max_reforming_capacity": max_reforming
            },
            "mathematical_model": {
                "c": objective_costs,
                "A_ub": A_ub,
                "b_ub": b_ub,
                "A_eq": A_eq,
                "b_eq": b_eq,
                "upper_bounds": upper_bounds,
                "lower_bounds": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
            }
        }