class AppError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code

class InvalidInput(AppError):
    def __init__(self, message: str):
        super().__init__("INVALID_INPUT", message, 400)

class InvalidDomainName(AppError):
    def __init__(self, message: str):
        super().__init__("INVALID_DOMAIN_NAME", message, 400)

class ZoneNotEmpty(AppError):
    def __init__(self, message: str):
        super().__init__("ZONE_NOT_EMPTY", message, 400)

class DuplicateZone(AppError):
    def __init__(self, message: str):
        super().__init__("DUPLICATE_ZONE", message, 400)

class DuplicateRecord(AppError):
    def __init__(self, message: str):
        super().__init__("DUPLICATE_RECORD", message, 400)

class InvalidRecordType(AppError):
    def __init__(self, message: str):
        super().__init__("INVALID_RECORD_TYPE", message, 400)

class Unauthorized(AppError):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__("UNAUTHORIZED", message, 401)

class SessionExpired(AppError):
    def __init__(self, message: str = "Session expired"):
        super().__init__("SESSION_EXPIRED", message, 401)

class ZoneNotFound(AppError):
    def __init__(self, message: str = "Zone not found"):
        super().__init__("ZONE_NOT_FOUND", message, 404)

class RecordNotFound(AppError):
    def __init__(self, message: str = "Record not found"):
        super().__init__("RECORD_NOT_FOUND", message, 404)

class InternalError(AppError):
    def __init__(self, message: str = "Internal server error"):
        super().__init__("INTERNAL_ERROR", message, 500)
