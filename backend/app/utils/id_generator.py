import random
import string

def generate_zone_id() -> str:
    chars = string.ascii_uppercase + string.digits
    return "Z" + "".join(random.choices(chars, k=13))
