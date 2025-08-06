# Auto Excel Filler (Flask App)

This web app allows authenticated users to submit a form and generate an Excel file (.xlsx) automatically.

## Features

- User authentication (signup, login, logout)
- Data submission form
- Automatic Excel file generation
- Downloadable Excel file

## Setup Instructions

1. Clone this repo
2. Create a virtual environment (optional but recommended)
3. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4. Set up PostgreSQL and update connection in `app.py`:
    ```
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://<user>:<pass>@localhost/<database>'
    ```
5. Initialize the database:
    ```python
    from app import db
    db.create_all()
    ```
6. Run the app:
    ```bash
    python app.py
    ```

## License

MIT
