Context:
Express 4 mengharuskan setiap handler async dibungkus `asyncHandler`/try-catch agar error sampai ke error middleware.

Decision:
Express 5 (stable, default `latest` di npm).

Consequences:
Async error otomatis diteruskan ke error middleware terpusat → satu kelas bug umum hilang, clean architecture lebih sederhana. `@types/express` harus v5.
