from flask import Flask, request, send_file, render_template, flash, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer
from openpyxl import Workbook
from io import BytesIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'bat123'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://bat123:bat123@localhost/db_app'

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

class User(UserMixin, db.Model):
    __tablename__ = 'user'
    __table_args__ = {'schema': 'public'}
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# loginn
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password')
    return render_template('login.html')

# signup
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']

        if User.query.filter_by(username=username).first():
            flash('Username already exists')
        elif User.query.filter_by(email=email).first():
            flash('Email already registered')
        else:
            new_user = User(username=username, email=email)
            new_user.set_password(password)
            db.session.add(new_user)
            db.session.commit()
            flash('User created! Please log in.')
            return redirect(url_for('login'))
    return render_template('signup.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Logged out successfully.')
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

@app.route('/')
@login_required
def form():
    return render_template('form.html')

@app.route('/generate', methods=['POST'])
@login_required
def generate_excel():
    #see the full data entered
    print(f"Full form data: {request.form}")
    #retrieve data
    name = request.form.getlist('name')
    email = request.form.getlist('email')
    phone = request.form.getlist('phone')
    address = request.form.getlist('address')

    #test to see if it works
    # print(f"Data entered: {name}, {email}, {phone}, {address}")
    print(f"Data received: {len(name)} entries")

    #create excel
    wb = Workbook()
    ws = wb.active
    #show header
    ws.append(['Name', 'Email', 'Phone', 'Address'])
    # ws.append([name, email, phone, address])

    #loop all enrty by index n appedn row
    for i in range(len(name)):
        ws.append([
            name[i],
            email[i] if i < len(email) else '',
            phone[i] if i < len(phone) else '',
            address[i] if i < len(address) else ''
    ])

    #read fields from form
    # data = request.form.to_dict()
    # record = {k.capitalize(): v for k, v in data.items() if v.strip()}

    #create excel
    # wb = Workbook()
    # ws = wb.active
    # headers = list(record.keys())
    # ws.append(headers)
    # ws.append([record.get(h, "") for h in headers])

    #save to memory file
    excel_file = BytesIO()
    wb.save(excel_file)
    excel_file.seek(0)

    #dwonload file
    return send_file(
        excel_file,
        download_name="autofill_output.xlsx",
        as_attachment=True,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

if __name__ == '__main__':
    app.run(debug=True)