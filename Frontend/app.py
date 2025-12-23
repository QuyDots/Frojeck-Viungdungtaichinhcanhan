"""Deprecated Flask UI entry point.

Frontend hiện tại sử dụng Vite + index.html + src/, không còn
chạy Flask. File này chỉ giữ lại để nếu ai đó vô tình chạy

    python app.py

thì sẽ nhận được thông báo rõ ràng thay vì lỗi import.
"""

import sys

def main() -> None:
    msg = (
        "Frontend Flask đã được thay thế bởi Vite.\n"
        "Hãy chạy:\n"
        "  cd Frontend\n"
        "  npm install   # lần đầu\n"
        "  npm run dev   # khởi động UI\n"
    )
    print(msg)


if __name__ == "main__" or __name__ == "__main__":
    sys.exit(main())
