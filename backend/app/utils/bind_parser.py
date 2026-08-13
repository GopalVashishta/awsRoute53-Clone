"""
BIND zone file parser and exporter module.
Supports standard RFC 1035 zone file syntax and JSON export formats.
"""

import re
from typing import List, Dict, Any, Tuple

def parse_bind_zone(zone_text: str, default_origin: str = "") -> List[Dict[str, Any]]:
    """
    Parses a BIND 9 zone file text into a list of record dicts.
    Each dict contains: name, type, ttl, value, routing_policy.
    """
    records = []
    current_origin = default_origin.rstrip(".") + "." if default_origin else ""
    current_ttl = 300
    last_name = ""

    lines = zone_text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        i += 1

        # Ignore empty lines and comments
        if not line or line.startswith(";"):
            continue

        # Handle multi-line parentheses (e.g. SOA record)
        while "(" in line and ")" not in line and i < len(lines):
            nextLine = lines[i].strip()
            if ";" in nextLine:
                nextLine = nextLine.split(";")[0].strip()
            line = line + " " + nextLine
            i += 1

        # Strip inline comments
        if ";" in line:
            line = line.split(";")[0].strip()

        if not line:
            continue

        # Check directives ($ORIGIN, $TTL)
        if line.startswith("$ORIGIN"):
            parts = line.split()
            if len(parts) >= 2:
                current_origin = parts[1].rstrip(".") + "."
            continue
        elif line.startswith("$TTL"):
            parts = line.split()
            if len(parts) >= 2:
                try:
                    current_ttl = _parse_ttl(parts[1])
                except ValueError:
                    pass
            continue

        # Tokenize line
        parts = line.split()
        if not parts:
            continue

        # Determine name, TTL, class, type, and value
        idx = 0
        name = last_name

        # Check if line starts with a name or whitespace
        if not line.startswith((" ", "\t")):
            name_token = parts[idx]
            idx += 1
            if name_token == "@":
                name = current_origin
            elif name_token.endswith("."):
                name = name_token
            else:
                name = f"{name_token}.{current_origin}" if current_origin else f"{name_token}."
            last_name = name

        ttl = current_ttl
        record_class = "IN"

        # Look for TTL and CLASS tokens before record type
        while idx < len(parts):
            token = parts[idx].upper()
            if token in ("IN", "CH", "HS"):
                record_class = token
                idx += 1
            elif token.isdigit() or (token[:-1].isdigit() and token[-1] in "SMHDWsmhdw"):
                ttl = _parse_ttl(parts[idx])
                idx += 1
            else:
                break

        if idx >= len(parts):
            continue

        record_type = parts[idx].upper()
        idx += 1

        supported_types = {"A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA", "SOA"}
        if record_type not in supported_types:
            continue

        value_tokens = parts[idx:]
        if not value_tokens:
            continue

        value = " ".join(value_tokens)
        # Clean quotes for TXT
        if record_type == "TXT":
            value = value.strip('"')

        records.append({
            "name": name,
            "type": record_type,
            "ttl": ttl,
            "value": value,
            "routing_policy": "Simple"
        })

    return records


def export_bind_zone(zone_name: str, records: List[Any]) -> str:
    """
    Exports a list of record objects to a standard BIND zone file string format.
    """
    origin = zone_name.rstrip(".") + "."
    lines = [
        f"; BIND zone file export for {origin}",
        f"; Exported from AWS Route53 Clone",
        f"$ORIGIN {origin}",
        f"$TTL 300",
        ""
    ]

    for rec in records:
        rec_name = rec.name if hasattr(rec, "name") else rec["name"]
        rec_type = rec.type if hasattr(rec, "type") else rec["type"]
        rec_ttl = rec.ttl if hasattr(rec, "ttl") else rec["ttl"]
        rec_value = rec.value if hasattr(rec, "value") else rec["value"]

        # Formatting relative or absolute name
        if rec_name == origin:
            name_str = "@"
        elif rec_name.endswith("." + origin):
            name_str = rec_name[:-len("." + origin)]
        else:
            name_str = rec_name

        if rec_type == "TXT" and not rec_value.startswith('"'):
            val_str = f'"{rec_value}"'
        else:
            val_str = rec_value

        lines.append(f"{name_str:<24} {rec_ttl:<6} IN   {rec_type:<7} {val_str}")

    return "\n".join(lines) + "\n"


def _parse_ttl(ttl_str: str) -> int:
    """Helper to convert TTL string (300, 1h, 1d) into integer seconds."""
    ttl_str = ttl_str.strip().lower()
    if ttl_str.isdigit():
        return int(ttl_str)
    
    multipliers = {'s': 1, 'm': 60, 'h': 3600, 'd': 86400, 'w': 604800}
    unit = ttl_str[-1]
    if unit in multipliers and ttl_str[:-1].isdigit():
        return int(ttl_str[:-1]) * multipliers[unit]
    
    return 300
